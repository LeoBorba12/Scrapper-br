"""
Automated Test Suite for Resilient Database Decoupling & Remote API Gateway.
Validates Circuit Breaker state transitions, CacheManager TTL, Proxy Client dispatch,
remote timeout handling, header emission, and seamless local SQLite fallback.
"""

import os
import sys
import time
import threading
from unittest.mock import patch, MagicMock
import pytest
import requests

# Ensure project root is in sys.path
PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

from backend.gateway.circuit_breaker import CircuitBreaker
from backend.gateway.cache_manager import CacheManager
from backend.gateway.proxy_client import ProxyClient, dispatch_with_fallback
from backend.app import app


# ==============================================================================
# 1. Circuit Breaker Unit Tests
# ==============================================================================

class TestCircuitBreaker:
    def test_initial_state_closed(self):
        cb = CircuitBreaker(failure_threshold=3, recovery_time=1.0)
        assert cb.state == CircuitBreaker.STATE_CLOSED
        assert cb.failure_count == 0
        assert cb.can_attempt() is True

    def test_trip_to_open_after_threshold_failures(self):
        cb = CircuitBreaker(failure_threshold=3, recovery_time=1.0)
        cb.record_failure()
        assert cb.state == CircuitBreaker.STATE_CLOSED
        assert cb.failure_count == 1
        assert cb.can_attempt() is True

        cb.record_failure()
        assert cb.state == CircuitBreaker.STATE_CLOSED
        assert cb.failure_count == 2
        assert cb.can_attempt() is True

        cb.record_failure()
        assert cb.state == CircuitBreaker.STATE_OPEN
        assert cb.failure_count == 3
        # Should now fast-fail
        assert cb.can_attempt() is False

    def test_transition_to_half_open_after_recovery_time(self):
        cb = CircuitBreaker(failure_threshold=2, recovery_time=0.2)
        cb.record_failure()
        cb.record_failure()
        assert cb.state == CircuitBreaker.STATE_OPEN
        assert cb.can_attempt() is False

        # Wait for recovery cooldown window
        time.sleep(0.25)
        # can_attempt should now transition to HALF-OPEN and allow one trial request
        assert cb.can_attempt() is True
        assert cb.state == CircuitBreaker.STATE_HALF_OPEN

    def test_half_open_success_resets_to_closed(self):
        cb = CircuitBreaker(failure_threshold=2, recovery_time=0.2)
        cb.record_failure()
        cb.record_failure()
        time.sleep(0.25)
        assert cb.can_attempt() is True
        assert cb.state == CircuitBreaker.STATE_HALF_OPEN

        cb.record_success()
        assert cb.state == CircuitBreaker.STATE_CLOSED
        assert cb.failure_count == 0

    def test_half_open_failure_trips_immediately_to_open(self):
        cb = CircuitBreaker(failure_threshold=2, recovery_time=0.2)
        cb.record_failure()
        cb.record_failure()
        time.sleep(0.25)
        assert cb.can_attempt() is True
        assert cb.state == CircuitBreaker.STATE_HALF_OPEN

        cb.record_failure()
        assert cb.state == CircuitBreaker.STATE_OPEN
        assert cb.can_attempt() is False

    def test_manual_reset(self):
        cb = CircuitBreaker(failure_threshold=2, recovery_time=60.0)
        cb.record_failure()
        cb.record_failure()
        assert cb.state == CircuitBreaker.STATE_OPEN

        cb.reset()
        assert cb.state == CircuitBreaker.STATE_CLOSED
        assert cb.failure_count == 0
        assert cb.can_attempt() is True

    def test_thread_safety_under_concurrent_failures(self):
        cb = CircuitBreaker(failure_threshold=50, recovery_time=60.0)
        threads = []

        def worker():
            for _ in range(10):
                cb.record_failure()

        for _ in range(5):
            t = threading.Thread(target=worker)
            threads.append(t)
            t.start()

        for t in threads:
            t.join()

        assert cb.failure_count == 50
        assert cb.state == CircuitBreaker.STATE_OPEN


# ==============================================================================
# 2. CacheManager Unit Tests
# ==============================================================================

class TestCacheManager:
    def test_set_and_get(self):
        cache = CacheManager(default_ttl=10)
        cache.set("foo", {"data": 123})
        assert cache.get("foo") == {"data": 123}
        assert cache.get("missing") is None

    def test_expiration_pruning(self):
        cache = CacheManager(default_ttl=1)
        cache.set("short", "hello", ttl=0.1)
        assert cache.get("short") == "hello"
        time.sleep(0.15)
        assert cache.get("short") is None

    def test_delete_and_clear(self):
        cache = CacheManager(default_ttl=10)
        cache.set("a", 1)
        cache.set("b", 2)
        assert len(cache) == 2
        cache.delete("a")
        assert cache.get("a") is None
        assert cache.get("b") == 2
        cache.clear()
        assert len(cache) == 0

    def test_stats_telemetry(self):
        cache = CacheManager(default_ttl=10)
        cache.set("key1", "val")
        _ = cache.get("key1") # hit
        _ = cache.get("key2") # miss
        stats = cache.stats()
        assert stats["hits"] == 1
        assert stats["misses"] == 1
        assert stats["hit_ratio_percent"] == 50.0


# ==============================================================================
# 3. ProxyClient & dispatch_with_fallback Tests
# ==============================================================================

class TestProxyClientDispatch:
    def test_standalone_local_mode_when_no_remote_url(self):
        cb = CircuitBreaker()
        cache = CacheManager()
        client = ProxyClient(remote_url="", breaker=cb, cache=cache)

        def mock_handler():
            from flask import jsonify
            return jsonify({"total_partidas": 115625})

        with app.test_request_context("/api/overview"):
            res = dispatch_with_fallback(mock_handler, client=client)
            assert res.headers["X-Data-Source"] == "local-standalone"
            assert res.headers["X-Circuit-Breaker-State"] == "closed"
            assert "X-Response-Time-Ms" in res.headers
            assert res.json["total_partidas"] == 115625

    def test_remote_gateway_success(self):
        cb = CircuitBreaker()
        cache = CacheManager()
        client = ProxyClient(remote_url="http://mock-remote:8000", breaker=cb, cache=cache)

        mock_remote_resp = MagicMock()
        mock_remote_resp.status_code = 200
        mock_remote_resp.json.return_value = {"total_partidas": 120000, "source": "oracle-vm"}
        mock_remote_resp.headers = {"Content-Type": "application/json"}

        with patch.object(client._session, "request", return_value=mock_remote_resp):
            with app.test_request_context("/api/overview"):
                res = dispatch_with_fallback(lambda: {"fallback": True}, client=client)
                assert res.headers["X-Data-Source"] == "remote-gateway"
                assert res.headers["X-Circuit-Breaker-State"] == "closed"
                assert res.json["total_partidas"] == 120000
                assert cb.failure_count == 0

    def test_remote_timeout_triggers_instant_fallback(self):
        cb = CircuitBreaker(failure_threshold=3)
        cache = CacheManager()
        client = ProxyClient(remote_url="http://mock-remote:8000", breaker=cb, cache=cache)

        def mock_local():
            from flask import jsonify
            return jsonify({"total_partidas": 115625, "mode": "local"})

        with patch.object(client._session, "request", side_effect=requests.exceptions.Timeout("Read timeout")):
            with app.test_request_context("/api/overview"):
                res = dispatch_with_fallback(mock_local, client=client)
                assert res.headers["X-Data-Source"] == "local-fallback"
                assert res.headers["X-Fallback-Reason"] == "remote_timeout"
                assert res.headers["X-Circuit-Breaker-State"] == "closed"
                assert res.json["total_partidas"] == 115625
                assert cb.failure_count == 1

    def test_remote_500_error_triggers_fallback(self):
        cb = CircuitBreaker(failure_threshold=3)
        cache = CacheManager()
        client = ProxyClient(remote_url="http://mock-remote:8000", breaker=cb, cache=cache)

        mock_500 = MagicMock()
        mock_500.status_code = 503
        mock_500.headers = {}

        def mock_local():
            from flask import jsonify
            return jsonify({"total_partidas": 115625})

        with patch.object(client._session, "request", return_value=mock_500):
            with app.test_request_context("/api/overview"):
                res = dispatch_with_fallback(mock_local, client=client)
                assert res.headers["X-Data-Source"] == "local-fallback"
                assert res.headers["X-Fallback-Reason"] == "status_5xx"
                assert cb.failure_count == 1

    def test_circuit_open_fast_fail_without_network_call(self):
        cb = CircuitBreaker(failure_threshold=2)
        cb.record_failure()
        cb.record_failure()
        assert cb.state == CircuitBreaker.STATE_OPEN

        client = ProxyClient(remote_url="http://mock-remote:8000", breaker=cb)

        def mock_local():
            from flask import jsonify
            return jsonify({"fast": True})

        with patch.object(client._session, "request") as mock_req:
            with app.test_request_context("/api/overview"):
                res = dispatch_with_fallback(mock_local, client=client)
                # Network request should never be attempted
                mock_req.assert_not_called()
                assert res.headers["X-Data-Source"] == "local-fallback"
                assert res.headers["X-Fallback-Reason"] == "circuit_open"
                assert res.headers["X-Circuit-Breaker-State"] == "open"
                assert res.json["fast"] is True

    def test_tier_1_cache_hit_returns_cache_source(self):
        cb = CircuitBreaker()
        cache = CacheManager()
        cache.set("custom_cache_key", {"cached": True, "partidas": 115625})
        client = ProxyClient(remote_url="http://mock-remote:8000", breaker=cb, cache=cache)

        with app.test_request_context("/api/overview"):
            res = dispatch_with_fallback(lambda: {"never": True}, cache_key="custom_cache_key", client=client)
            assert res.headers["X-Data-Source"] == "cache"
            assert res.json["cached"] is True


# ==============================================================================
# 4. End-to-End Flask Integration Tests via Test Client
# ==============================================================================

class TestFlaskEndpointsIntegration:
    @pytest.fixture(autouse=True)
    def clean_env_and_breaker(self):
        from backend.gateway import proxy_client, default_circuit_breaker, gateway_cache
        default_circuit_breaker.reset()
        gateway_cache.clear()
        old_url = os.environ.get("FUTSTATS_REMOTE_GATEWAY_URL")
        yield
        if old_url is not None:
            os.environ["FUTSTATS_REMOTE_GATEWAY_URL"] = old_url
        else:
            os.environ.pop("FUTSTATS_REMOTE_GATEWAY_URL", None)
        default_circuit_breaker.reset()

    def test_health_endpoint_telemetry(self):
        test_client = app.test_client()
        res = test_client.get("/api/health")
        assert res.status_code == 200
        data = res.get_json()
        assert data["status"] == "ok"
        assert "gateway" in data
        assert "circuit_breaker" in data["gateway"]
        assert data["gateway"]["circuit_breaker"]["state"] == "closed"
        assert res.headers["X-Data-Source"] == "local-standalone"
        assert res.headers["X-Circuit-Breaker-State"] == "closed"

    def test_overview_endpoint_standalone(self):
        os.environ.pop("FUTSTATS_REMOTE_GATEWAY_URL", None)
        test_client = app.test_client()
        res = test_client.get("/api/overview")
        assert res.status_code == 200
        data = res.get_json()
        assert data["total_partidas"] in (115625, 111935)
        assert res.headers["X-Data-Source"] == "local-standalone"
        assert res.headers["X-Circuit-Breaker-State"] == "closed"
        assert float(res.headers["X-Response-Time-Ms"]) >= 0.0

    def test_automatic_fallback_when_remote_down(self):
        # Configure non-existent remote port to guarantee connection error
        os.environ["FUTSTATS_REMOTE_GATEWAY_URL"] = "http://127.0.0.1:59999"
        test_client = app.test_client()

        # 1st call fails connection and falls back to local SQLite
        res1 = test_client.get("/api/overview")
        assert res1.status_code == 200
        assert res1.headers["X-Data-Source"] == "local-fallback"
        assert res1.headers["X-Fallback-Reason"] == "connect_error"
        assert res1.get_json()["total_partidas"] in (115625, 111935)

        # 2nd call fails connection
        res2 = test_client.get("/api/overview")
        assert res2.status_code == 200
        assert res2.headers["X-Data-Source"] == "local-fallback"

        # 3rd call fails connection and trips circuit to OPEN
        res3 = test_client.get("/api/overview")
        assert res3.status_code == 200
        assert res3.headers["X-Data-Source"] == "local-fallback"

        # 4th call: circuit is now OPEN -> fast fail without network delay (<15ms)
        t_start = time.perf_counter()
        res4 = test_client.get("/api/overview")
        t_elapsed_ms = (time.perf_counter() - t_start) * 1000.0

        assert res4.status_code == 200
        assert res4.headers["X-Data-Source"] == "local-fallback"
        assert res4.headers["X-Fallback-Reason"] == "circuit_open"
        assert res4.headers["X-Circuit-Breaker-State"] == "open"
        assert res4.get_json()["total_partidas"] in (115625, 111935)
        assert t_elapsed_ms < 50.0 # Fast response
