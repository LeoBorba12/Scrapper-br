"""
Resilient Proxy Client with Circuit Breaker, In-Memory TTL Cache, and Local Fallback.
Fulfills FutStats Milestone 1 (Resilient Database Decoupling & Remote API Gateway).

Architecture:
- Tier 1: In-Memory TTL Cache (<3ms)
- Tier 2: Upstream Remote Gateway with Circuit Breaker (timeout 1.8s, trips to OPEN after 3 failures for 60s)
- Tier 3: Instantaneous Transparent Fallback to local bundled SQLite (<15ms)
"""

import os
import time
import requests
from requests.adapters import HTTPAdapter
from urllib3.util import Retry
from typing import Callable, Optional, Any, Dict, Tuple
from flask import request, Response, jsonify, g, has_request_context, make_response

from .circuit_breaker import CircuitBreaker
from .cache_manager import CacheManager, gateway_cache


class ProxyClient:
    def __init__(
        self,
        remote_url: Optional[str] = None,
        secret: Optional[str] = None,
        timeout: Optional[float] = None,
        breaker: Optional[CircuitBreaker] = None,
        cache: Optional[CacheManager] = None,
    ):
        self._remote_url = remote_url
        self._secret = secret
        self._timeout = timeout
        self.breaker = breaker or CircuitBreaker()
        self.cache = cache or gateway_cache

        # Reusable HTTP session with connection pooling for low-latency WAN queries
        self._session = requests.Session()
        adapter = HTTPAdapter(pool_connections=50, pool_maxsize=50, max_retries=False)
        self._session.mount("http://", adapter)
        self._session.mount("https://", adapter)

    @property
    def remote_url(self) -> str:
        if self._remote_url is not None:
            return self._remote_url.rstrip("/")
        url = os.environ.get("FUTSTATS_REMOTE_GATEWAY_URL", "").strip().rstrip("/")
        return url

    @property
    def secret(self) -> str:
        if self._secret is not None:
            return self._secret
        return os.environ.get("FUTSTATS_GATEWAY_SECRET") or os.environ.get("SECRET_KEY", "")

    @property
    def timeout(self) -> float:
        if self._timeout is not None:
            return self._timeout
        try:
            return float(os.environ.get("FUTSTATS_GATEWAY_TIMEOUT_SEC", 1.8))
        except (ValueError, TypeError):
            return 1.8

    def is_remote_configured(self) -> bool:
        """
        True if FUTSTATS_REMOTE_GATEWAY_URL is configured and not running on the remote daemon itself.
        """
        if os.environ.get("IS_REMOTE_GATEWAY") == "1":
            return False
        return bool(self.remote_url)

    def call_remote(self, req) -> Optional[requests.Response]:
        """
        Executes HTTP request to remote gateway.
        Returns requests.Response on 200, or None on failure/non-200.
        Sets g.data_source and g.fallback_reason when failure occurs.
        """
        base_url = self.remote_url
        if not base_url:
            return None

        # Build path and query
        path = req.full_path if hasattr(req, "full_path") else (getattr(req, "path", "/"))
        target_url = f"{base_url}{path}"

        headers = {
            "X-Gateway-Secret": self.secret,
            "Accept": "application/json",
            "User-Agent": "FutStats-ResilientProxy/2026.1",
        }

        # Forward authorization if present
        if hasattr(req, "headers") and req.headers.get("Authorization"):
            headers["Authorization"] = req.headers["Authorization"]

        method = req.method if hasattr(req, "method") else "GET"

        try:
            resp = self._session.request(
                method=method,
                url=target_url,
                headers=headers,
                timeout=self.timeout,
                allow_redirects=True,
            )

            if resp.status_code == 200:
                return resp
            elif resp.status_code >= 500:
                self.breaker.record_failure()
                if has_request_context():
                    g.data_source = "local-fallback"
                    g.fallback_reason = "status_5xx"
                return None
            else:
                # 4xx or other unexpected status: record failure and trigger fallback
                self.breaker.record_failure()
                if has_request_context():
                    g.data_source = "local-fallback"
                    g.fallback_reason = f"status_{resp.status_code}"
                return None

        except requests.exceptions.Timeout:
            self.breaker.record_failure()
            if has_request_context():
                g.data_source = "local-fallback"
                g.fallback_reason = "remote_timeout"
            return None

        except (requests.exceptions.ConnectionError, requests.exceptions.RequestException):
            self.breaker.record_failure()
            if has_request_context():
                g.data_source = "local-fallback"
                g.fallback_reason = "connect_error"
            return None

    def before_request_hook(self) -> Optional[Response]:
        """
        Flask before_request interceptor.
        Proxies eligible /api/ calls to the remote gateway.
        Returns a Response if served from Cache or Remote Gateway.
        Returns None to fall back to the local view handler.
        """
        if not has_request_context():
            return None

        g.request_start_time = time.perf_counter()
        g._req_start_time = g.request_start_time

        path = request.path
        # Only proxy /api/ routes
        if not path.startswith("/api/"):
            return None

        # Exclude endpoints that should remain strictly local
        if path == "/api/health" or path.startswith("/api/auth/"):
            return None

        # If this node is the remote gateway itself, do not proxy
        if os.environ.get("IS_REMOTE_GATEWAY") == "1":
            return None

        # If no remote gateway is configured, operate in local standalone mode
        if not self.is_remote_configured():
            g.data_source = "local-standalone"
            return None

        # Tier 1: Check in-memory cache for GET queries
        if request.method == "GET" and "no-cache" not in request.headers.get("Cache-Control", "").lower():
            cache_key = f"proxy:{request.full_path}"
            cached_payload = self.cache.get(cache_key)
            if cached_payload is not None:
                duration_ms = round((time.perf_counter() - g.request_start_time) * 1000, 2)
                resp = jsonify(cached_payload)
                resp.headers["X-Data-Source"] = "cache"
                resp.headers["X-Circuit-Breaker-State"] = self.breaker.state
                resp.headers["X-Response-Time-Ms"] = str(duration_ms)
                return resp

        # Tier 2: Check Circuit Breaker before making remote outbound call
        if not self.breaker.can_attempt():
            # Fast-fail fallback: bypass remote entirely
            g.data_source = "local-fallback"
            g.fallback_reason = "circuit_open"
            return None

        # Attempt remote query
        remote_resp = self.call_remote(request)
        if remote_resp is not None:
            duration_ms = round((time.perf_counter() - g.request_start_time) * 1000, 2)
            try:
                json_data = remote_resp.json()
            except Exception:
                # Malformed, truncated, or non-JSON payload on HTTP 200: trip breaker failure & fallback
                self.breaker.record_failure()
                g.data_source = "local-fallback"
                g.fallback_reason = "malformed_json"
                return None

            # Valid remote JSON received: record success on circuit breaker
            self.breaker.record_success()
            if request.method == "GET":
                # Cache successful responses
                self.cache.set(f"proxy:{request.full_path}", json_data, ttl=300)
            resp = jsonify(json_data)
            resp.headers["X-Data-Source"] = "remote-gateway"
            resp.headers["X-Circuit-Breaker-State"] = self.breaker.state
            resp.headers["X-Response-Time-Ms"] = str(duration_ms)
            return resp

        # If remote failed, fallback is activated; return None so local view function executes
        return None

    def after_request_hook(self, response: Response) -> Response:
        """
        Flask after_request interceptor.
        Ensures all 4 telemetry headers are consistently attached to all /api/ responses:
          - X-Data-Source: remote-gateway | local-fallback | local-standalone | cache
          - X-Circuit-Breaker-State: closed | open | half-open
          - X-Response-Time-Ms: execution latency in milliseconds
          - X-Fallback-Reason: remote_timeout | connect_error | status_5xx | circuit_open
        """
        if not has_request_context():
            return response

        path = request.path
        if not path.startswith("/api/"):
            return response

        start_time = getattr(g, "request_start_time", getattr(g, "_req_start_time", None))
        duration_ms = round((time.perf_counter() - start_time) * 1000, 2) if start_time else 0.0

        # If X-Data-Source is already set (e.g. from cache or remote), ensure remaining headers exist
        if "X-Data-Source" in response.headers:
            if "X-Circuit-Breaker-State" not in response.headers:
                response.headers["X-Circuit-Breaker-State"] = self.breaker.state
            if "X-Response-Time-Ms" not in response.headers:
                response.headers["X-Response-Time-Ms"] = str(duration_ms)
            return response

        # Determine data source from g or configuration
        if hasattr(g, "data_source"):
            source = g.data_source
        elif not self.is_remote_configured():
            source = "local-standalone"
        else:
            source = "local-fallback"

        response.headers["X-Data-Source"] = source
        response.headers["X-Circuit-Breaker-State"] = self.breaker.state
        response.headers["X-Response-Time-Ms"] = str(duration_ms)

        if source == "local-fallback":
            reason = getattr(g, "fallback_reason", "remote_error")
            response.headers["X-Fallback-Reason"] = reason

        return response


# Global singleton instance of ProxyClient
proxy_client = ProxyClient()
default_circuit_breaker = proxy_client.breaker
default_cache_manager = proxy_client.cache


def dispatch_with_fallback(
    local_handler: Callable[[], Any],
    endpoint: Optional[str] = None,
    cache_key: Optional[str] = None,
    ttl: int = 1800,
    client: Optional[ProxyClient] = None,
) -> Any:
    """
    Direct programmatically callable dispatcher with transparent fallback.
    Can be used by endpoints, workers, or integration tests.

    Workflow:
      1. If FUTSTATS_REMOTE_GATEWAY_URL is not set -> executes local_handler with local-standalone headers.
      2. If cache hit -> returns cached response.
      3. If circuit breaker open -> fast-fails to local_handler with circuit_open headers.
      4. Dispatches to remote gateway -> on 200 returns remote-gateway headers.
      5. On remote timeout / error / 5xx -> falls back to local_handler with local-fallback headers.
    """
    c = client or proxy_client
    start_time = time.perf_counter()

    # Determine endpoint path
    if endpoint is None:
        if has_request_context():
            endpoint = request.full_path if hasattr(request, "full_path") else request.path
        else:
            endpoint = "/api/unknown"

    # 1. Standalone local mode
    if not c.is_remote_configured():
        resp = local_handler()
        duration_ms = round((time.perf_counter() - start_time) * 1000, 2)
        return _attach_headers(
            resp,
            {
                "X-Data-Source": "local-standalone",
                "X-Circuit-Breaker-State": c.breaker.state,
                "X-Response-Time-Ms": str(duration_ms),
            },
        )

    # 2. Check Tier 1 Cache (if cache_key provided)
    if cache_key:
        cached_data = c.cache.get(cache_key)
        if cached_data is not None:
            duration_ms = round((time.perf_counter() - start_time) * 1000, 2)
            try:
                resp = jsonify(cached_data)
            except Exception:
                resp = cached_data
            return _attach_headers(
                resp,
                {
                    "X-Data-Source": "cache",
                    "X-Circuit-Breaker-State": c.breaker.state,
                    "X-Response-Time-Ms": str(duration_ms),
                },
            )

    # 3. Check Circuit Breaker
    if not c.breaker.can_attempt():
        resp = local_handler()
        duration_ms = round((time.perf_counter() - start_time) * 1000, 2)
        return _attach_headers(
            resp,
            {
                "X-Data-Source": "local-fallback",
                "X-Fallback-Reason": "circuit_open",
                "X-Circuit-Breaker-State": "open",
                "X-Response-Time-Ms": str(duration_ms),
            },
        )

    # 4. Attempt Remote Gateway
    target_url = f"{c.remote_url}{endpoint}"
    headers = {
        "X-Gateway-Secret": c.secret,
        "Accept": "application/json",
        "User-Agent": "FutStats-ResilientProxy/2026.1",
    }
    if has_request_context() and request.headers.get("Authorization"):
        headers["Authorization"] = request.headers["Authorization"]

    method = "GET"
    if has_request_context():
        method = request.method

    fallback_reason = "remote_error"
    try:
        remote_resp = c._session.request(
            method=method,
            url=target_url,
            headers=headers,
            timeout=c.timeout,
        )

        if remote_resp.status_code == 200:
            try:
                json_data = remote_resp.json()
            except Exception:
                c.breaker.record_failure()
                fallback_reason = "malformed_json"
            else:
                c.breaker.record_success()
                duration_ms = round((time.perf_counter() - start_time) * 1000, 2)
                if cache_key:
                    c.cache.set(cache_key, json_data, ttl=ttl)
                try:
                    resp = jsonify(json_data)
                except Exception:
                    resp = json_data
                return _attach_headers(
                    resp,
                    {
                        "X-Data-Source": "remote-gateway",
                        "X-Circuit-Breaker-State": c.breaker.state,
                        "X-Response-Time-Ms": str(duration_ms),
                    },
                )
        elif remote_resp.status_code >= 500:
            c.breaker.record_failure()
            fallback_reason = "status_5xx"
        else:
            c.breaker.record_failure()
            fallback_reason = f"status_{remote_resp.status_code}"

    except requests.exceptions.Timeout:
        c.breaker.record_failure()
        fallback_reason = "remote_timeout"
    except (requests.exceptions.ConnectionError, requests.exceptions.RequestException):
        c.breaker.record_failure()
        fallback_reason = "connect_error"
    except Exception:
        c.breaker.record_failure()
        fallback_reason = "remote_error"

    # 5. Transparent Local Fallback on any failure
    resp = local_handler()
    duration_ms = round((time.perf_counter() - start_time) * 1000, 2)
    return _attach_headers(
        resp,
        {
            "X-Data-Source": "local-fallback",
            "X-Fallback-Reason": fallback_reason,
            "X-Circuit-Breaker-State": c.breaker.state,
            "X-Response-Time-Ms": str(duration_ms),
        },
    )


def _attach_headers(resp: Any, headers: Dict[str, str]) -> Any:
    """
    Safely attaches HTTP headers to Flask Response, tuple responses, or creates a Response.
    """
    if hasattr(resp, "headers"):
        for k, v in headers.items():
            resp.headers[k] = v
        return resp
    elif isinstance(resp, tuple) and len(resp) >= 1 and hasattr(resp[0], "headers"):
        for k, v in headers.items():
            resp[0].headers[k] = v
        return resp
    else:
        try:
            r = make_response(resp)
            for k, v in headers.items():
                r.headers[k] = v
            return r
        except Exception:
            return resp
