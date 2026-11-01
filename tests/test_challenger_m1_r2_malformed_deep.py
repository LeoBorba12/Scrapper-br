"""
Deep Adversarial Stress Verification for Malformed Upstream Payloads.
Challenger: teamwork_preview_challenger_m1_r2_fix

Tests edge-case payloads, breaker transitions, and concurrent malformed responses.
"""

import os
import sys
import json
import io
import time
import threading
from unittest.mock import patch, MagicMock
import pytest
import requests
from requests.models import Response as RequestsResponse

PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

from backend.gateway.circuit_breaker import CircuitBreaker
from backend.gateway.cache_manager import CacheManager
from backend.gateway.proxy_client import ProxyClient, dispatch_with_fallback
from backend.app import app


@pytest.fixture(autouse=True)
def clean_env():
    os.environ.pop("FUTSTATS_REMOTE_GATEWAY_URL", None)
    from backend.gateway import proxy_client
    proxy_client.breaker.reset()
    proxy_client.cache.clear()
    yield
    os.environ.pop("FUTSTATS_REMOTE_GATEWAY_URL", None)
    proxy_client.breaker.reset()
    proxy_client.cache.clear()


class TestDeepMalformedPayloads:
    """
    Submits various corrupt, truncated, non-JSON, and binary payloads across
    both dispatch_with_fallback and Flask test_client (before_request_hook).
    """

    CORRUPT_PAYLOADS = [
        (b"", "empty_bytes"),
        (b"   \r\n\t   ", "whitespace_only"),
        (b"<html><head><title>502 Bad Gateway</title></head><body>502 Bad Gateway</body></html>", "html_gateway_error"),
        (b"{\"total\": 115625, \"partidas\": [{\"id\": 1", "truncated_json"),
        (b"{'invalid': 'single_quotes_json'}", "single_quotes_invalid_json"),
        (b"12.34.56.78", "malformed_number"),
        (b"undefined", "undefined_js"),
        (b"\x00\x00\x00\x00", "null_bytes"),
        (b"\xff\xfe\xfd\xfc", "invalid_utf8_binary"),
        (b"function() { return {status: 200}; }", "javascript_code"),
        (b"500 Internal Server Error: Connection reset by peer", "raw_text_error"),
    ]

    @pytest.mark.parametrize("payload, label", CORRUPT_PAYLOADS)
    def test_dispatch_with_fallback_all_corrupt_payload_types(self, payload, label):
        """dispatch_with_fallback must fallback and record breaker failure for each corrupt payload."""
        cb = CircuitBreaker(failure_threshold=5)
        cache = CacheManager()
        client = ProxyClient(remote_url="http://mock-remote:8000", breaker=cb, cache=cache)

        mock_resp = RequestsResponse()
        mock_resp.status_code = 200
        mock_resp.raw = io.BytesIO(payload)
        mock_resp.headers["Content-Type"] = "application/json"

        from flask import jsonify

        with patch.object(client._session, "request", return_value=mock_resp):
            with app.test_request_context("/api/overview"):
                res = dispatch_with_fallback(
                    lambda: jsonify({"source": "local_sqlite", "total_partidas": 115625}),
                    client=client,
                )

                assert res.headers["X-Data-Source"] == "local-fallback", (
                    f"Payload '{label}' returned {res.headers.get('X-Data-Source')} instead of local-fallback"
                )
                assert res.headers["X-Fallback-Reason"] == "malformed_json"
                assert cb.failure_count == 1

                data = res.get_json()
                assert data["source"] == "local_sqlite"
                assert data["total_partidas"] == 115625

    @pytest.mark.parametrize("payload, label", CORRUPT_PAYLOADS)
    def test_before_request_hook_all_corrupt_payload_types(self, payload, label):
        """Flask test_client through before_request_hook must fallback and return valid local data."""
        os.environ["FUTSTATS_REMOTE_GATEWAY_URL"] = "http://mock-remote:8000"
        from backend.gateway import proxy_client
        proxy_client.breaker.reset()

        mock_resp = RequestsResponse()
        mock_resp.status_code = 200
        mock_resp.raw = io.BytesIO(payload)
        mock_resp.headers["Content-Type"] = "application/json"

        with patch.object(proxy_client._session, "request", return_value=mock_resp):
            test_client = app.test_client()
            res = test_client.get("/api/overview")

            assert res.status_code == 200
            assert res.headers.get("X-Data-Source") == "local-fallback", (
                f"Payload '{label}' returned {res.headers.get('X-Data-Source')} instead of local-fallback"
            )
            assert res.headers.get("X-Fallback-Reason") == "malformed_json"
            assert proxy_client.breaker.failure_count == 1

            # Must parse as valid JSON
            data = res.get_json()
            assert isinstance(data, dict)
            assert "total_partidas" in data


class TestBreakerTrippingOnMalformedPayloads:
    """Verifies that consecutive malformed payloads trip the circuit breaker into OPEN."""

    def test_repeated_malformed_payloads_trip_circuit_to_open(self):
        cb = CircuitBreaker(failure_threshold=3, recovery_time=60.0)
        cache = CacheManager()
        client = ProxyClient(remote_url="http://mock-remote:8000", breaker=cb, cache=cache)

        mock_resp = RequestsResponse()
        mock_resp.status_code = 200
        mock_resp.raw = io.BytesIO(b"<!DOCTYPE html><html>502</html>")
        mock_resp.headers["Content-Type"] = "text/html"

        from flask import jsonify

        with patch.object(client._session, "request", return_value=mock_resp) as mock_request:
            with app.test_request_context("/api/overview"):
                # Call 1: failure 1, closed
                res1 = dispatch_with_fallback(lambda: jsonify({"ok": True}), client=client)
                assert cb.state == CircuitBreaker.STATE_CLOSED
                assert cb.failure_count == 1
                assert res1.headers["X-Circuit-Breaker-State"] == "closed"

                # Call 2: failure 2, closed
                res2 = dispatch_with_fallback(lambda: jsonify({"ok": True}), client=client)
                assert cb.state == CircuitBreaker.STATE_CLOSED
                assert cb.failure_count == 2
                assert res2.headers["X-Circuit-Breaker-State"] == "closed"

                # Call 3: threshold reached, trips to OPEN
                res3 = dispatch_with_fallback(lambda: jsonify({"ok": True}), client=client)
                assert cb.state == CircuitBreaker.STATE_OPEN
                assert cb.failure_count == 3
                assert res3.headers["X-Circuit-Breaker-State"] == "open"

                # Call 4: OPEN state fast-fails WITHOUT invoking remote request
                req_call_count_before = mock_request.call_count
                res4 = dispatch_with_fallback(lambda: jsonify({"ok": True}), client=client)
                assert mock_request.call_count == req_call_count_before, "Remote request called while breaker OPEN"
                assert res4.headers["X-Fallback-Reason"] == "circuit_open"
                assert res4.headers["X-Data-Source"] == "local-fallback"


class TestConcurrentMalformedPayloads:
    """Stress-tests 50 concurrent threads receiving malformed JSON simultaneously."""

    def test_50_concurrent_threads_receiving_malformed_json(self):
        cb = CircuitBreaker(failure_threshold=5, recovery_time=60.0)
        cache = CacheManager()
        client = ProxyClient(remote_url="http://mock-remote:8000", breaker=cb, cache=cache)

        def mock_send(request, **kwargs):
            resp = RequestsResponse()
            resp.status_code = 200
            resp.raw = io.BytesIO(b"Corrupt Payload: {unclosed json")
            resp.headers["Content-Type"] = "application/json"
            return resp

        adapter = requests.adapters.HTTPAdapter()
        adapter.send = mock_send
        client._session.mount("http://", adapter)
        client._session.mount("https://", adapter)

        num_threads = 50
        barrier = threading.Barrier(num_threads)
        results = []
        errors = []
        lock = threading.Lock()

        from flask import Response

        def local_handler():
            return Response(json.dumps({"total_partidas": 115625}), mimetype="application/json")

        def worker(thread_id: int):
            try:
                barrier.wait()
            except threading.BrokenBarrierError:
                return

            try:
                with app.app_context():
                    resp = dispatch_with_fallback(
                        local_handler=local_handler,
                        endpoint="/api/overview",
                        client=client,
                    )
                    headers = dict(resp.headers) if hasattr(resp, "headers") else {}
                    data = json.loads(resp.get_data(as_text=True))
                with lock:
                    results.append({"thread_id": thread_id, "headers": headers, "data": data})
            except Exception as e:
                with lock:
                    errors.append(e)

        threads = [threading.Thread(target=worker, args=(i,)) for i in range(num_threads)]
        for t in threads:
            t.start()
        for t in threads:
            t.join()

        assert len(errors) == 0, f"Errors in concurrent malformed payload test: {errors}"
        assert len(results) == num_threads

        for r in results:
            assert r["headers"]["X-Data-Source"] == "local-fallback"
            assert r["headers"]["X-Fallback-Reason"] in ["malformed_json", "circuit_open"]
            assert r["data"]["total_partidas"] == 115625

        assert cb.state == CircuitBreaker.STATE_OPEN
