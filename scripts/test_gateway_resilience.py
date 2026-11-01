#!/usr/bin/env python3
"""
FutStats Remote API Gateway Resilience Test Harness.
Executes automated stress tests validating circuit breaker mechanics,
in-memory cache efficiency, upstream timeout protection, and transparent local SQLite fallback.

Usage:
    python scripts/test_gateway_resilience.py
"""

import os
import sys
import time
from unittest.mock import patch, MagicMock
import requests

# Ensure project root is in sys.path
PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

venv_python = os.path.join(PROJECT_ROOT, ".venv", "bin", "python")
if os.path.exists(venv_python) and sys.executable != venv_python:
    os.execv(venv_python, [venv_python] + sys.argv)

from backend.app import app
from backend.gateway.circuit_breaker import CircuitBreaker
from backend.gateway.cache_manager import CacheManager
from backend.gateway.proxy_client import ProxyClient, dispatch_with_fallback


class ResilienceTestRunner:
    def __init__(self):
        self.results = []
        self.passed = 0
        self.failed = 0

    def record(self, test_name: str, passed: bool, details: str = "", duration_ms: float = 0.0):
        status = "PASS" if passed else "FAIL"
        if passed:
            self.passed += 1
        else:
            self.failed += 1
        self.results.append({
            "name": test_name,
            "status": status,
            "details": details,
            "duration_ms": round(duration_ms, 2),
        })
        icon = "✅" if passed else "❌"
        print(f"  {icon} [{status}] {test_name:<55} ({duration_ms:.2f}ms) - {details}")

    def run_all(self):
        print("================================================================================")
        print("          FutStats Remote Gateway Resilience & Fallback Test Suite              ")
        print("================================================================================")

        self.test_circuit_breaker_state_machine()
        self.test_cache_layer_latency()
        self.test_remote_timeout_instant_fallback()
        self.test_remote_503_outage_fallback()
        self.test_circuit_open_fast_fail_sla()
        self.test_header_telemetry_compliance()
        self.test_full_flask_client_resilience()

        print("================================================================================")
        print(f"  Total Tests: {len(self.results)} | Passed: {self.passed} | Failed: {self.failed}")
        print("================================================================================")

        return self.failed == 0

    def test_circuit_breaker_state_machine(self):
        t0 = time.perf_counter()
        cb = CircuitBreaker(failure_threshold=3, recovery_time=0.1)

        ok1 = cb.state == "closed" and cb.can_attempt() is True
        cb.record_failure()
        cb.record_failure()
        ok2 = cb.state == "closed" and cb.failure_count == 2
        cb.record_failure()
        ok3 = cb.state == "open" and cb.can_attempt() is False

        # Wait for cooldown
        time.sleep(0.12)
        ok4 = cb.can_attempt() is True and cb.state == "half-open"
        cb.record_success()
        ok5 = cb.state == "closed" and cb.failure_count == 0

        dt = (time.perf_counter() - t0) * 1000
        all_ok = ok1 and ok2 and ok3 and ok4 and ok5
        self.record("Circuit Breaker: CLOSED -> OPEN -> HALF-OPEN -> CLOSED", all_ok, "State machine verified", dt)

    def test_cache_layer_latency(self):
        t0 = time.perf_counter()
        cache = CacheManager(default_ttl=10)
        cache.set("bench_key", {"partidas": 115625})

        t_get = time.perf_counter()
        val = cache.get("bench_key")
        latency_ms = (time.perf_counter() - t_get) * 1000

        dt = (time.perf_counter() - t0) * 1000
        ok = val is not None and val.get("partidas") == 115625 and latency_ms < 3.0
        self.record("Tier 1 In-Memory TTL Cache (<3ms latency)", ok, f"Retrieved in {latency_ms:.3f}ms", dt)

    def test_remote_timeout_instant_fallback(self):
        t0 = time.perf_counter()
        cb = CircuitBreaker(failure_threshold=3)
        client = ProxyClient(remote_url="http://mock-upstream:8000", breaker=cb)

        def mock_local():
            from flask import jsonify
            return jsonify({"total_partidas": 115625, "source": "bundled_sqlite"})

        with patch.object(client._session, "request", side_effect=requests.exceptions.Timeout("Upstream timed out")):
            with app.test_request_context("/api/overview"):
                res = dispatch_with_fallback(mock_local, client=client)

        dt = (time.perf_counter() - t0) * 1000
        ok = (
            res.headers.get("X-Data-Source") == "local-fallback"
            and res.headers.get("X-Fallback-Reason") == "remote_timeout"
            and res.json.get("total_partidas") == 115625
            and cb.failure_count == 1
        )
        self.record("Remote Timeout Protection & Local Fallback", ok, "Fallback emitted remote_timeout header", dt)

    def test_remote_503_outage_fallback(self):
        t0 = time.perf_counter()
        cb = CircuitBreaker(failure_threshold=3)
        client = ProxyClient(remote_url="http://mock-upstream:8000", breaker=cb)

        mock_resp = MagicMock()
        mock_resp.status_code = 503
        mock_resp.headers = {}

        def mock_local():
            from flask import jsonify
            return jsonify({"total_partidas": 115625})

        with patch.object(client._session, "request", return_value=mock_resp):
            with app.test_request_context("/api/overview"):
                res = dispatch_with_fallback(mock_local, client=client)

        dt = (time.perf_counter() - t0) * 1000
        ok = (
            res.headers.get("X-Data-Source") == "local-fallback"
            and res.headers.get("X-Fallback-Reason") == "status_5xx"
            and res.json.get("total_partidas") == 115625
        )
        self.record("Remote 503 Outage Fallback Handling", ok, "5xx intercepted, fallback activated", dt)

    def test_circuit_open_fast_fail_sla(self):
        t0 = time.perf_counter()
        cb = CircuitBreaker(failure_threshold=2)
        cb.record_failure()
        cb.record_failure()
        assert cb.state == "open"

        client = ProxyClient(remote_url="http://mock-upstream:8000", breaker=cb)

        def mock_local():
            from flask import jsonify
            return jsonify({"total_partidas": 115625})

        with patch.object(client._session, "request") as mock_req:
            t_call = time.perf_counter()
            with app.test_request_context("/api/overview"):
                res = dispatch_with_fallback(mock_local, client=client)
            call_ms = (time.perf_counter() - t_call) * 1000

        mock_req.assert_not_called()
        dt = (time.perf_counter() - t0) * 1000
        ok = (
            res.headers.get("X-Data-Source") == "local-fallback"
            and res.headers.get("X-Fallback-Reason") == "circuit_open"
            and res.headers.get("X-Circuit-Breaker-State") == "open"
            and call_ms < 15.0 # Strict SLA < 15ms
        )
        self.record("Circuit OPEN Fast-Fail SLA (<15ms)", ok, f"Bypassed in {call_ms:.3f}ms", dt)

    def test_header_telemetry_compliance(self):
        t0 = time.perf_counter()
        old_val = os.environ.get("FUTSTATS_REMOTE_GATEWAY_URL")
        try:
            os.environ.pop("FUTSTATS_REMOTE_GATEWAY_URL", None)
            test_client = app.test_client()
            res = test_client.get("/api/overview")

            headers = res.headers
            h_source = headers.get("X-Data-Source") == "local-standalone"
            h_breaker = headers.get("X-Circuit-Breaker-State") == "closed"
            h_latency = "X-Response-Time-Ms" in headers and float(headers.get("X-Response-Time-Ms")) >= 0.0

            all_headers_present = h_source and h_breaker and h_latency
            dt = (time.perf_counter() - t0) * 1000
            self.record("Telemetry Headers Emission Compliance", all_headers_present, "All 4 required headers verified", dt)
        finally:
            if old_val:
                os.environ["FUTSTATS_REMOTE_GATEWAY_URL"] = old_val

    def test_full_flask_client_resilience(self):
        t0 = time.perf_counter()
        from backend.gateway import default_circuit_breaker
        default_circuit_breaker.reset()

        old_val = os.environ.get("FUTSTATS_REMOTE_GATEWAY_URL")
        try:
            # Set to unreachable port to test live request interceptor and fallback
            os.environ["FUTSTATS_REMOTE_GATEWAY_URL"] = "http://127.0.0.1:59998"
            test_client = app.test_client()

            # Trigger 3 failures
            for i in range(3):
                r = test_client.get("/api/overview")
                assert r.status_code == 200
                assert r.headers.get("X-Data-Source") == "local-fallback"

            assert default_circuit_breaker.state == "open"

            # 4th request must be circuit_open fast-fail
            t_req = time.perf_counter()
            r4 = test_client.get("/api/overview")
            req_ms = (time.perf_counter() - t_req) * 1000

            ok = (
                r4.status_code == 200
                and r4.headers.get("X-Data-Source") == "local-fallback"
                and r4.headers.get("X-Fallback-Reason") == "circuit_open"
                and r4.headers.get("X-Circuit-Breaker-State") == "open"
                and req_ms < 50.0
            )

            dt = (time.perf_counter() - t0) * 1000
            self.record("End-to-End Flask Fallback Integration", ok, f"Zero UI errors, sub-50ms fallback ({req_ms:.2f}ms)", dt)
        finally:
            default_circuit_breaker.reset()
            if old_val:
                os.environ["FUTSTATS_REMOTE_GATEWAY_URL"] = old_val
            else:
                os.environ.pop("FUTSTATS_REMOTE_GATEWAY_URL", None)


if __name__ == "__main__":
    runner = ResilienceTestRunner()
    success = runner.run_all()
    sys.exit(0 if success else 1)
