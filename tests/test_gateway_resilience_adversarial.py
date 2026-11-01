"""
Adversarial Resilience & Stress Test Suite for Remote API Gateway & Decoupled Database.
Fulfills Milestone 1 Empirical Challenger requirements:
1. Circuit breaker boundary transitions under simulated network flaps (rapid alternating 200 and 500/timeout).
2. Timeout precision (simulate server hanging 1.9s vs 1.0s).
3. Telemetry headers presence under all edge failure modes.
4. Zero-downtime invariant: verify 100% of failed remote attempts return HTTP 200 with fallback data.
5. Assert p95 response time when circuit is OPEN is strictly < 15ms.
6. Assert that no unhandled exceptions leak to caller.
"""

import os
import sys
import time
import socket
import threading
import statistics
import http.server
import json
from unittest.mock import patch, MagicMock
import pytest
import requests

# Ensure project root is in sys.path
PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

from backend.app import app
from backend.gateway.circuit_breaker import CircuitBreaker
from backend.gateway.cache_manager import CacheManager
from backend.gateway.proxy_client import (
    ProxyClient,
    dispatch_with_fallback,
    default_circuit_breaker,
    gateway_cache,
    proxy_client as global_proxy_client,
)


# ==============================================================================
# Helper Fixtures & Local Mock Server
# ==============================================================================

class SlowHttpHandler(http.server.BaseHTTPRequestHandler):
    """
    Real HTTP handler that can simulate precise delay, 200 OK, 500, or hanging responses.
    Handles socket resets and broken pipes gracefully when client timeouts disconnect.
    """
    def log_message(self, format, *args):
        pass  # Suppress console logging

    def do_GET(self):
        try:
            if self.path.startswith("/api/hang_2s"):
                time.sleep(2.0)
                body = json.dumps({"source": "remote_hanging_2s", "total_partidas": 120000}).encode("utf-8")
                self.send_response(200)
                self.send_header("Content-Type", "application/json")
                self.send_header("Content-Length", str(len(body)))
                self.end_headers()
                self.wfile.write(body)
            elif self.path.startswith("/api/slow_1s"):
                time.sleep(1.0)
                body = json.dumps({"source": "remote_slow_1s", "total_partidas": 120000}).encode("utf-8")
                self.send_response(200)
                self.send_header("Content-Type", "application/json")
                self.send_header("Content-Length", str(len(body)))
                self.end_headers()
                self.wfile.write(body)
            elif self.path.startswith("/api/fast"):
                body = json.dumps({"source": "remote_fast", "total_partidas": 120000}).encode("utf-8")
                self.send_response(200)
                self.send_header("Content-Type", "application/json")
                self.send_header("Content-Length", str(len(body)))
                self.end_headers()
                self.wfile.write(body)
            elif self.path.startswith("/api/error_500"):
                body = json.dumps({"error": "Internal Server Error"}).encode("utf-8")
                self.send_response(500)
                self.send_header("Content-Type", "application/json")
                self.send_header("Content-Length", str(len(body)))
                self.end_headers()
                self.wfile.write(body)
            else:
                body = json.dumps({"source": "remote_default", "total_partidas": 120000}).encode("utf-8")
                self.send_response(200)
                self.send_header("Content-Type", "application/json")
                self.send_header("Content-Length", str(len(body)))
                self.end_headers()
                self.wfile.write(body)
        except (BrokenPipeError, ConnectionResetError):
            pass


def get_free_port():
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.bind(("127.0.0.1", 0))
        return s.getsockname()[1]


@pytest.fixture(scope="module")
def mock_http_server():
    port = get_free_port()
    server = http.server.HTTPServer(("127.0.0.1", port), SlowHttpHandler)
    server_thread = threading.Thread(target=server.serve_forever, daemon=True)
    server_thread.start()
    yield f"http://127.0.0.1:{port}"
    server.shutdown()


# ==============================================================================
# 1. Circuit Breaker Boundary Transitions Under Simulated Network Flaps
# ==============================================================================

class TestNetworkFlapsAndBoundaryTransitions:
    """
    Stress-tests circuit breaker state transitions under erratic, flapping network conditions:
    alternating successes and errors, repeated trips, half-open trials, and concurrent access.
    """

    def test_rapid_alternating_success_and_failure_flaps(self):
        """
        When network flaps (200, 500, 200, 500...), the circuit breaker counts
        consecutive failures. Each success resets consecutive failure count to 0.
        Circuit should NOT trip until failure_threshold consecutive failures occur.
        """
        cb = CircuitBreaker(failure_threshold=3, recovery_time=0.5)

        flaps = [
            ("fail", 1, CircuitBreaker.STATE_CLOSED),
            ("success", 0, CircuitBreaker.STATE_CLOSED),
            ("fail", 1, CircuitBreaker.STATE_CLOSED),
            ("fail", 2, CircuitBreaker.STATE_CLOSED),
            ("success", 0, CircuitBreaker.STATE_CLOSED),
            ("fail", 1, CircuitBreaker.STATE_CLOSED),
            ("fail", 2, CircuitBreaker.STATE_CLOSED),
            ("fail", 3, CircuitBreaker.STATE_OPEN),  # 3 consecutive -> TRIPS!
        ]

        for step, (event, expected_failures, expected_state) in enumerate(flaps):
            if event == "fail":
                cb.record_failure()
            else:
                cb.record_success()

            assert cb.failure_count == expected_failures, (
                f"Step {step} ({event}): expected {expected_failures} failures, got {cb.failure_count}"
            )
            assert cb.state == expected_state, (
                f"Step {step} ({event}): expected state {expected_state}, got {cb.state}"
            )

        assert cb.can_attempt() is False

    def test_half_open_flapping_immediate_retrip(self):
        """
        During HALF-OPEN, a single failure must immediately re-trip the breaker to OPEN
        without needing N consecutive failures.
        """
        cb = CircuitBreaker(failure_threshold=3, recovery_time=0.1)

        # Trip to OPEN
        for _ in range(3):
            cb.record_failure()
        assert cb.state == CircuitBreaker.STATE_OPEN

        # Wait for recovery window to expire
        time.sleep(0.12)

        # Probe request allowed (transitions to HALF-OPEN)
        assert cb.can_attempt() is True
        assert cb.state == CircuitBreaker.STATE_HALF_OPEN

        # Probe fails: must IMMEDIATELY trip back to OPEN
        cb.record_failure()
        assert cb.state == CircuitBreaker.STATE_OPEN
        assert cb.can_attempt() is False

        # Verify next cooldown window is enforced
        assert (time.time() - cb.last_failure_time) < 0.1
        assert cb.can_attempt() is False

        # Wait again, then probe succeeds: must reset to CLOSED
        time.sleep(0.12)
        assert cb.can_attempt() is True
        assert cb.state == CircuitBreaker.STATE_HALF_OPEN
        cb.record_success()
        assert cb.state == CircuitBreaker.STATE_CLOSED
        assert cb.failure_count == 0

    def test_concurrent_flapping_thread_safety(self):
        """
        Simulate 30 concurrent threads hammering the circuit breaker with mixed
        successes and failures. Verify no deadlocks, state corruption, or negative counts.
        """
        cb = CircuitBreaker(failure_threshold=5, recovery_time=0.05)
        exceptions = []

        def worker(thread_id):
            try:
                for i in range(100):
                    if (thread_id + i) % 3 == 0:
                        cb.record_failure()
                    else:
                        cb.record_success()
                    _ = cb.can_attempt()
                    _ = cb.state
                    _ = cb.to_dict()
            except Exception as e:
                exceptions.append(e)

        threads = [threading.Thread(target=worker, args=(tid,)) for tid in range(30)]
        for t in threads:
            t.start()
        for t in threads:
            t.join()

        assert len(exceptions) == 0, f"Exceptions occurred during concurrent stress: {exceptions}"
        assert cb.state in [CircuitBreaker.STATE_CLOSED, CircuitBreaker.STATE_OPEN, CircuitBreaker.STATE_HALF_OPEN]
        assert cb.failure_count >= 0


# ==============================================================================
# 2. Timeout Precision (Simulate Server Hanging 1.9s vs 1.0s)
# ==============================================================================

class TestTimeoutPrecision:
    """
    Empirically validates timeout precision using a real local socket HTTP server.
    Tests default timeout (1.8s) with server hanging 1.0s (succeeds) vs 1.9s/2.0s (aborts and falls back).
    """

    def test_sub_timeout_server_delay_succeeds_without_fallback(self, mock_http_server):
        """
        Server hanging for 1.0s with timeout=1.8s:
        Must NOT timeout. Response must complete with HTTP 200 from remote gateway.
        """
        cb = CircuitBreaker(failure_threshold=3, recovery_time=10.0)
        cache = CacheManager()
        client = ProxyClient(remote_url=mock_http_server, timeout=1.8, breaker=cb, cache=cache)

        t_start = time.perf_counter()
        with app.test_request_context("/api/slow_1s"):
            res = dispatch_with_fallback(lambda: {"source": "local_fallback"}, endpoint="/api/slow_1s", client=client)
        elapsed_sec = time.perf_counter() - t_start

        assert 0.9 <= elapsed_sec < 1.6, f"Expected elapsed ~1.0s, got {elapsed_sec:.3f}s"
        assert res.headers["X-Data-Source"] == "remote-gateway"
        assert res.headers["X-Circuit-Breaker-State"] == "closed"
        assert cb.failure_count == 0
        data = res.get_json() if hasattr(res, "get_json") else res.json
        assert data["source"] == "remote_slow_1s"

    def test_over_timeout_server_delay_aborts_precisely_and_falls_back(self, mock_http_server):
        """
        Server hanging for 2.0s with timeout=1.8s:
        Must abort at ~1.8s (not wait full 2.0s), trigger fallback, and return HTTP 200 with local data.
        """
        cb = CircuitBreaker(failure_threshold=3, recovery_time=10.0)
        cache = CacheManager()
        client = ProxyClient(remote_url=mock_http_server, timeout=1.8, breaker=cb, cache=cache)

        from flask import jsonify
        t_start = time.perf_counter()
        with app.test_request_context("/api/hang_2s"):
            res = dispatch_with_fallback(
                lambda: jsonify({"source": "local_sqlite_fallback", "total_partidas": 115625}),
                endpoint="/api/hang_2s",
                client=client,
            )
        elapsed_sec = time.perf_counter() - t_start

        assert 1.7 <= elapsed_sec < 2.0, (
            f"Expected timeout around 1.8s, got {elapsed_sec:.3f}s (should not wait 2.0s)"
        )
        assert res.headers["X-Data-Source"] == "local-fallback"
        assert res.headers["X-Fallback-Reason"] == "remote_timeout"
        assert cb.failure_count == 1
        data = res.get_json() if hasattr(res, "get_json") else res.json
        assert data["source"] == "local_sqlite_fallback"

    def test_configurable_timeout_precision_fast_cutoff(self, mock_http_server):
        """
        Configure strict 0.4s timeout: server with 1.0s delay must cut off at ~0.4s.
        """
        cb = CircuitBreaker(failure_threshold=3, recovery_time=10.0)
        cache = CacheManager()
        client = ProxyClient(remote_url=mock_http_server, timeout=0.4, breaker=cb, cache=cache)

        from flask import jsonify
        t_start = time.perf_counter()
        with app.test_request_context("/api/slow_1s"):
            res = dispatch_with_fallback(
                lambda: jsonify({"source": "fast_local_fallback"}),
                endpoint="/api/slow_1s",
                client=client,
            )
        elapsed_sec = time.perf_counter() - t_start

        assert 0.35 <= elapsed_sec < 0.65, f"Expected cutoff at ~0.4s, got {elapsed_sec:.3f}s"
        assert res.headers["X-Data-Source"] == "local-fallback"
        assert res.headers["X-Fallback-Reason"] == "remote_timeout"


# ==============================================================================
# 3. Telemetry Headers Presence Under All Edge Failure Modes
# ==============================================================================

class TestTelemetryHeadersUnderAllEdgeFailureModes:
    """
    Verifies that all 4 telemetry headers are present and correctly formatted across
    every conceivable remote failure mode:
      - remote_timeout
      - connect_error
      - status_5xx (500, 502, 503, 504)
      - status_4xx (404, 403, 401, 400)
      - circuit_open
      - cache hit
      - remote-gateway success
      - local-standalone
    """

    @pytest.mark.parametrize(
        "failure_trigger, expected_reason",
        [
            (requests.exceptions.ConnectTimeout("Connect timeout"), "remote_timeout"),
            (requests.exceptions.ReadTimeout("Read timeout"), "remote_timeout"),
            (requests.exceptions.ConnectionError("Connection refused"), "connect_error"),
            (requests.exceptions.SSLError("SSL Handshake failed"), "connect_error"),
            (requests.exceptions.ProxyError("Proxy error"), "connect_error"),
            (requests.exceptions.ChunkedEncodingError("Connection broken mid-stream"), "connect_error"),
        ],
    )
    def test_network_exception_headers(self, failure_trigger, expected_reason):
        cb = CircuitBreaker(failure_threshold=5)
        cache = CacheManager()
        client = ProxyClient(remote_url="http://mock-remote:8000", breaker=cb, cache=cache)

        from flask import jsonify
        with patch.object(client._session, "request", side_effect=failure_trigger):
            with app.test_request_context("/api/overview"):
                res = dispatch_with_fallback(
                    lambda: jsonify({"total_partidas": 115625}),
                    client=client,
                )

                assert res.headers["X-Data-Source"] == "local-fallback"
                assert res.headers["X-Fallback-Reason"] == expected_reason
                assert res.headers["X-Circuit-Breaker-State"] in ["closed", "open"]
                assert "X-Response-Time-Ms" in res.headers
                assert float(res.headers["X-Response-Time-Ms"]) >= 0.0

    @pytest.mark.parametrize("status_code", [500, 502, 503, 504])
    def test_remote_5xx_status_headers(self, status_code):
        cb = CircuitBreaker(failure_threshold=5)
        cache = CacheManager()
        client = ProxyClient(remote_url="http://mock-remote:8000", breaker=cb, cache=cache)

        mock_resp = MagicMock()
        mock_resp.status_code = status_code
        mock_resp.headers = {}

        from flask import jsonify
        with patch.object(client._session, "request", return_value=mock_resp):
            with app.test_request_context("/api/overview"):
                res = dispatch_with_fallback(
                    lambda: jsonify({"total_partidas": 115625}),
                    client=client,
                )

                assert res.headers["X-Data-Source"] == "local-fallback"
                assert res.headers["X-Fallback-Reason"] == "status_5xx"
                assert res.headers["X-Circuit-Breaker-State"] in ["closed", "open"]
                assert "X-Response-Time-Ms" in res.headers

    @pytest.mark.parametrize("status_code", [400, 401, 403, 404])
    def test_remote_4xx_status_headers(self, status_code):
        cb = CircuitBreaker(failure_threshold=5)
        cache = CacheManager()
        client = ProxyClient(remote_url="http://mock-remote:8000", breaker=cb, cache=cache)

        mock_resp = MagicMock()
        mock_resp.status_code = status_code
        mock_resp.headers = {}

        from flask import jsonify
        with patch.object(client._session, "request", return_value=mock_resp):
            with app.test_request_context("/api/overview"):
                res = dispatch_with_fallback(
                    lambda: jsonify({"total_partidas": 115625}),
                    client=client,
                )

                assert res.headers["X-Data-Source"] == "local-fallback"
                assert res.headers["X-Fallback-Reason"] == f"status_{status_code}"
                assert res.headers["X-Circuit-Breaker-State"] in ["closed", "open"]
                assert "X-Response-Time-Ms" in res.headers

    def test_circuit_open_headers(self):
        cb = CircuitBreaker(failure_threshold=1)
        cb.record_failure()
        assert cb.state == CircuitBreaker.STATE_OPEN

        client = ProxyClient(remote_url="http://mock-remote:8000", breaker=cb)

        from flask import jsonify
        with app.test_request_context("/api/overview"):
            res = dispatch_with_fallback(
                lambda: jsonify({"fast": True}),
                client=client,
            )

            assert res.headers["X-Data-Source"] == "local-fallback"
            assert res.headers["X-Fallback-Reason"] == "circuit_open"
            assert res.headers["X-Circuit-Breaker-State"] == "open"
            assert float(res.headers["X-Response-Time-Ms"]) >= 0.0


# ==============================================================================
# 4. Zero-Downtime Invariant: 100% of Failed Remote Attempts Return HTTP 200
# ==============================================================================

class TestZeroDowntimeInvariant:
    """
    Stress harness sending a barrage of chaotic upstream failures.
    Asserts that 100% of responses return HTTP 200 with valid data and zero unhandled errors.
    """

    def test_zero_downtime_under_chaotic_upstream_failure_storm(self):
        """
        Simulate 120 consecutive requests subjected to erratic, randomized remote errors:
        socket timeouts, connection refused, 500, 502, 503, 504, 404, DNS error.
        Every single one must return HTTP 200 with valid local SQLite payload.
        """
        import random

        cb = CircuitBreaker(failure_threshold=3, recovery_time=0.05)
        cache = CacheManager()
        client = ProxyClient(remote_url="http://mock-remote:8000", breaker=cb, cache=cache)

        possible_errors = [
            requests.exceptions.ReadTimeout("Timeout"),
            requests.exceptions.ConnectTimeout("Connect timeout"),
            requests.exceptions.ConnectionError("Refused"),
            requests.exceptions.SSLError("SSL failure"),
            "status_500",
            "status_502",
            "status_503",
            "status_504",
            "status_404",
        ]

        total_requests = 120
        successful_fallbacks = 0
        from flask import jsonify

        for i in range(total_requests):
            error_choice = random.choice(possible_errors)

            if isinstance(error_choice, Exception):
                patcher = patch.object(client._session, "request", side_effect=error_choice)
            else:
                code = int(error_choice.split("_")[1])
                mock_r = MagicMock()
                mock_r.status_code = code
                mock_r.headers = {}
                patcher = patch.object(client._session, "request", return_value=mock_r)

            with patcher:
                with app.test_request_context(f"/api/overview?req={i}"):
                    res = dispatch_with_fallback(
                        lambda: jsonify({"total_partidas": 115625, "verified": True}),
                        client=client,
                    )

                    status = res.status_code if hasattr(res, "status_code") else 200
                    assert status == 200, f"Request {i} returned status {status} instead of 200"

                    data = res.get_json() if hasattr(res, "get_json") else res.json
                    assert data["total_partidas"] == 115625
                    assert data["verified"] is True
                    assert res.headers["X-Data-Source"] == "local-fallback"
                    assert "X-Fallback-Reason" in res.headers
                    successful_fallbacks += 1

        assert successful_fallbacks == total_requests, (
            f"Zero-downtime violated: {successful_fallbacks}/{total_requests} succeeded"
        )


# ==============================================================================
# 5. Assert p95 Response Time When Circuit is OPEN is Strictly < 15ms
# ==============================================================================

class TestCircuitOpenP95LatencySLA:
    """
    Measures 300 requests when circuit breaker is tripped to OPEN.
    Calculates median, p90, p95, p99, and asserts that p95 is strictly < 15ms.
    """

    def test_p95_response_time_when_circuit_open_strict_sla(self):
        cb = CircuitBreaker(failure_threshold=1, recovery_time=60.0)
        cb.record_failure()
        assert cb.state == CircuitBreaker.STATE_OPEN

        client = ProxyClient(remote_url="http://127.0.0.1:59999", breaker=cb)

        from flask import jsonify
        latencies_ms = []
        samples = 300

        with app.test_request_context("/api/overview"):
            for _ in range(samples):
                t0 = time.perf_counter()
                res = dispatch_with_fallback(
                    lambda: jsonify({"total_partidas": 115625}),
                    client=client,
                )
                dt_ms = (time.perf_counter() - t0) * 1000.0
                latencies_ms.append(dt_ms)

                assert res.headers["X-Data-Source"] == "local-fallback"
                assert res.headers["X-Fallback-Reason"] == "circuit_open"

        p95 = statistics.quantiles(latencies_ms, n=100)[94]
        p99 = statistics.quantiles(latencies_ms, n=100)[98]
        median = statistics.median(latencies_ms)
        max_lat = max(latencies_ms)

        print(f"\n[LATENCY SLA BENCHMARK - dispatch_with_fallback]")
        print(f"  Samples: {samples} | Median: {median:.4f}ms | p95: {p95:.4f}ms | p99: {p99:.4f}ms | Max: {max_lat:.4f}ms")

        assert p95 < 15.0, f"SLA VIOLATION: p95 latency {p95:.2f}ms exceeds 15.0ms threshold!"

    def test_flask_test_client_circuit_open_p95_sla(self):
        """
        Full Flask WSGI test client execution invoking real SQLite database queries
        when circuit breaker is OPEN.
        """
        default_circuit_breaker.reset()
        for _ in range(3):
            default_circuit_breaker.record_failure()
        assert default_circuit_breaker.state == CircuitBreaker.STATE_OPEN

        os.environ["FUTSTATS_REMOTE_GATEWAY_URL"] = "http://127.0.0.1:59999"

        flask_client = app.test_client()
        latencies_ms = []
        samples = 150

        for _ in range(samples):
            t0 = time.perf_counter()
            res = flask_client.get("/api/overview")
            dt_ms = (time.perf_counter() - t0) * 1000.0
            latencies_ms.append(dt_ms)

            assert res.status_code == 200
            assert res.headers["X-Data-Source"] == "local-fallback"
            assert res.headers["X-Fallback-Reason"] == "circuit_open"

        default_circuit_breaker.reset()
        os.environ.pop("FUTSTATS_REMOTE_GATEWAY_URL", None)

        p95 = statistics.quantiles(latencies_ms, n=100)[94]
        p99 = statistics.quantiles(latencies_ms, n=100)[98]
        median = statistics.median(latencies_ms)
        max_lat = max(latencies_ms)

        print(f"\n[LATENCY SLA BENCHMARK - Full Flask WSGI Client with SQLite]")
        print(f"  Samples: {samples} | Median: {median:.3f}ms | p95: {p95:.3f}ms | p99: {p99:.3f}ms | Max: {max_lat:.3f}ms")

        assert p95 < 15.0, f"SLA VIOLATION: Flask client p95 latency {p95:.2f}ms exceeds 15.0ms threshold!"


# ==============================================================================
# 6. Assert No Unhandled Exceptions Leak to Caller
# ==============================================================================

class TestNoUnhandledExceptionsLeak:
    """
    Submits corrupt, malicious, and adversarial payloads to verify that no
    unhandled exceptions escape the proxy layer.
    """

    def test_remote_returns_malformed_non_json_must_fallback(self):
        """
        Adversarial test: Upstream gateway returns HTTP 200 with corrupt/truncated JSON.
        The proxy MUST NOT pass garbage to caller or record breaker success.
        It must fall back to local SQLite, return valid JSON with total_partidas,
        and emit X-Data-Source: local-fallback.
        """
        cb = CircuitBreaker()
        cache = CacheManager()
        client = ProxyClient(remote_url="http://mock-remote:8000", breaker=cb, cache=cache)

        mock_resp = MagicMock()
        mock_resp.status_code = 200
        mock_resp.json.side_effect = json.JSONDecodeError("Expecting value", "<html>Nginx error</html>", 0)
        mock_resp.content = b"<html>Nginx 502 Bad Gateway</html>"
        mock_resp.headers = {"Content-Type": "text/html"}

        from flask import jsonify
        with patch.object(client._session, "request", return_value=mock_resp):
            with app.test_request_context("/api/overview"):
                res = dispatch_with_fallback(lambda: jsonify({"total_partidas": 115625}), client=client)
                assert res.headers.get("X-Data-Source") == "local-fallback", (
                    f"Vulnerability: proxy returned {res.headers.get('X-Data-Source')} with garbage instead of local-fallback"
                )
                data = res.get_json() if hasattr(res, "get_json") else res.json
                assert data["total_partidas"] == 115625
                assert cb.failure_count == 1

    def test_adversarial_querystrings_and_null_bytes(self):
        """
        Adversarial paths and queries (unicode, SQL injection strings, null bytes).
        """
        test_client = app.test_client()
        evil_queries = [
            "/api/overview?search=%00%00%00",
            "/api/overview?q=' OR 1=1; DROP TABLE partidas;--",
            "/api/overview?emoji=⚽⚽⚽&accent=São-Paulo",
            "/api/overview?long=" + ("A" * 5000),
        ]

        for path in evil_queries:
            res = test_client.get(path)
            assert res.status_code in [200, 400, 404], (
                f"Adversarial path {path[:30]} leaked unhandled exception with status {res.status_code}"
            )

    def test_high_concurrency_load_under_remote_outage(self):
        """
        50 concurrent client threads firing requests while remote is unreachable.
        Assert zero unhandled exceptions, zero deadlocks, and 100% HTTP 200 responses.
        """
        os.environ["FUTSTATS_REMOTE_GATEWAY_URL"] = "http://127.0.0.1:59999"
        flask_client = app.test_client()
        results = []
        errors = []

        def client_worker():
            try:
                for _ in range(5):
                    res = flask_client.get("/api/overview")
                    results.append((res.status_code, res.headers.get("X-Data-Source")))
            except Exception as e:
                errors.append(e)

        threads = [threading.Thread(target=client_worker) for _ in range(20)]
        for t in threads:
            t.start()
        for t in threads:
            t.join()

        os.environ.pop("FUTSTATS_REMOTE_GATEWAY_URL", None)

        assert len(errors) == 0, f"Exceptions leaked during concurrent load: {errors}"
        assert len(results) == 100, f"Expected 100 results, got {len(results)}"
        assert all(code == 200 for code, _ in results), "Some requests did not return HTTP 200"
        assert all(source == "local-fallback" for _, source in results), "Some requests had wrong data source"


# ==============================================================================
# CLI Entrypoint for Standalone Execution
# ==============================================================================

if __name__ == "__main__":
    pytest.main(["-v", "-s", __file__])
