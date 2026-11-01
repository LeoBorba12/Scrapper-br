"""
Validation script to verify the exact logic fix for malformed JSON fallback.
"""
import os
import sys
import json
import time
from unittest.mock import MagicMock, patch

PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../"))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

from backend.gateway.circuit_breaker import CircuitBreaker
from backend.gateway.cache_manager import CacheManager
from backend.gateway.proxy_client import ProxyClient, _attach_headers
from flask import Flask, jsonify, g, request, Response

app = Flask(__name__)

# Replicate the fixed methods to verify logic
def fixed_before_request_hook(self):
    g.request_start_time = time.perf_counter()
    g._req_start_time = g.request_start_time

    path = request.path
    if not path.startswith("/api/"):
        return None
    if path == "/api/health" or path.startswith("/api/auth/"):
        return None
    if os.environ.get("IS_REMOTE_GATEWAY") == "1":
        return None
    if not self.is_remote_configured():
        g.data_source = "local-standalone"
        return None

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

    if not self.breaker.can_attempt():
        g.data_source = "local-fallback"
        g.fallback_reason = "circuit_open"
        return None

    remote_resp = self.call_remote(request)
    if remote_resp is not None:
        duration_ms = round((time.perf_counter() - g.request_start_time) * 1000, 2)
        try:
            json_data = remote_resp.json()
        except Exception:
            self.breaker.record_failure()
            g.data_source = "local-fallback"
            g.fallback_reason = "malformed_json"
            return None

        self.breaker.record_success()
        if request.method == "GET":
            self.cache.set(f"proxy:{request.full_path}", json_data, ttl=300)
        resp = jsonify(json_data)
        resp.headers["X-Data-Source"] = "remote-gateway"
        resp.headers["X-Circuit-Breaker-State"] = self.breaker.state
        resp.headers["X-Response-Time-Ms"] = str(duration_ms)
        return resp

    return None

def fixed_dispatch_with_fallback(
    local_handler,
    endpoint=None,
    cache_key=None,
    ttl=1800,
    client=None,
):
    c = client
    start_time = time.perf_counter()

    if endpoint is None:
        endpoint = request.full_path if hasattr(request, "full_path") else request.path

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

    target_url = f"{c.remote_url}{endpoint}"
    headers = {
        "X-Gateway-Secret": c.secret,
        "Accept": "application/json",
        "User-Agent": "FutStats-ResilientProxy/2026.1",
    }
    method = request.method if request else "GET"

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

    except Exception:
        c.breaker.record_failure()
        fallback_reason = "remote_error"

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


def test_adversarial_malformed_dispatch():
    cb = CircuitBreaker()
    cache = CacheManager()
    client = ProxyClient(remote_url="http://mock-remote:8000", breaker=cb, cache=cache)

    mock_resp = MagicMock()
    mock_resp.status_code = 200
    mock_resp.json.side_effect = json.JSONDecodeError("Expecting value", "<html>Nginx error</html>", 0)
    mock_resp.content = b"<html>Nginx 502 Bad Gateway</html>"
    mock_resp.headers = {"Content-Type": "text/html"}

    with patch.object(client._session, "request", return_value=mock_resp):
        with app.test_request_context("/api/overview"):
            res = fixed_dispatch_with_fallback(lambda: jsonify({"total_partidas": 115625}), client=client)
            assert res.headers.get("X-Data-Source") == "local-fallback", f"Data source: {res.headers.get('X-Data-Source')}"
            assert res.headers.get("X-Fallback-Reason") == "malformed_json", f"Reason: {res.headers.get('X-Fallback-Reason')}"
            data = res.get_json()
            assert data["total_partidas"] == 115625
            assert cb.failure_count == 1
    print("PASS: test_adversarial_malformed_dispatch")


def test_before_request_hook_malformed():
    cb = CircuitBreaker()
    cache = CacheManager()
    client = ProxyClient(remote_url="http://mock-remote:8000", breaker=cb, cache=cache)

    mock_resp = MagicMock()
    mock_resp.status_code = 200
    mock_resp.json.side_effect = json.JSONDecodeError("Expecting value", "{corrupt", 0)
    mock_resp.content = b"{corrupt"
    mock_resp.headers = {"Content-Type": "application/json"}

    with patch.object(client._session, "request", return_value=mock_resp):
        with app.test_request_context("/api/overview"):
            ret = fixed_before_request_hook(client)
            assert ret is None, "Hook must return None to let Flask call local view"
            assert cb.failure_count == 1, f"Breaker failure count: {cb.failure_count}"
            assert g.data_source == "local-fallback"
            assert g.fallback_reason == "malformed_json"

            # Check after_request_hook creates proper headers
            local_resp = jsonify({"total_partidas": 115625})
            final_resp = client.after_request_hook(local_resp)
            assert final_resp.headers["X-Data-Source"] == "local-fallback"
            assert final_resp.headers["X-Fallback-Reason"] == "malformed_json"
            assert final_resp.headers["X-Circuit-Breaker-State"] == "closed"
            assert final_resp.get_json()["total_partidas"] == 115625
    print("PASS: test_before_request_hook_malformed")


def test_normal_json_dispatch_and_hook():
    cb = CircuitBreaker()
    cache = CacheManager()
    client = ProxyClient(remote_url="http://mock-remote:8000", breaker=cb, cache=cache)

    mock_resp = MagicMock()
    mock_resp.status_code = 200
    mock_resp.json.return_value = {"total_partidas": 120000}
    mock_resp.headers = {"Content-Type": "application/json"}

    with patch.object(client._session, "request", return_value=mock_resp):
        with app.test_request_context("/api/overview"):
            res = fixed_dispatch_with_fallback(lambda: jsonify({"total_partidas": 115625}), client=client)
            assert res.headers.get("X-Data-Source") == "remote-gateway"
            assert cb.failure_count == 0
            assert res.get_json()["total_partidas"] == 120000

        with app.test_request_context("/api/overview"):
            hook_res = fixed_before_request_hook(client)
            assert hook_res is not None
            assert hook_res.headers.get("X-Data-Source") == "remote-gateway"
            assert cb.failure_count == 0
            assert hook_res.get_json()["total_partidas"] == 120000
    print("PASS: test_normal_json_dispatch_and_hook")


if __name__ == "__main__":
    test_adversarial_malformed_dispatch()
    test_before_request_hook_malformed()
    test_normal_json_dispatch_and_hook()
    print("ALL TESTS PASSED!")
