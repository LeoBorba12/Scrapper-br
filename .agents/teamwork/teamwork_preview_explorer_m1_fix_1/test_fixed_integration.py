"""
Pytest integration test confirming that proposed_proxy_client solves the issues
and preserves 100% pass rate on test_proxy_fallback.
"""
import pytest
import os
import sys

PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../"))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

import importlib
real_proxy_client_module = sys.modules.get("backend.gateway.proxy_client") or importlib.import_module("backend.gateway.proxy_client")

# Import proposed file functions with proper package context
import importlib.util
spec = importlib.util.spec_from_file_location(
    "backend.gateway.proposed_proxy_client",
    os.path.join(os.path.dirname(__file__), "proposed_proxy_client.py")
)
proposed = importlib.util.module_from_spec(spec)
proposed.__package__ = "backend.gateway"
spec.loader.exec_module(proposed)

@pytest.fixture(autouse=True)
def patch_proxy_client_with_proposed(monkeypatch):
    """Monkeypatch real proxy with proposed implementations."""
    RealClass = getattr(real_proxy_client_module, "ProxyClient")
    monkeypatch.setattr(RealClass, "before_request_hook", proposed.ProxyClient.before_request_hook)
    monkeypatch.setattr(real_proxy_client_module, "dispatch_with_fallback", proposed.dispatch_with_fallback)

def test_verify_adversarial_malformed_passes():
    from tests.test_gateway_resilience_adversarial import TestNoUnhandledExceptionsLeak
    runner = TestNoUnhandledExceptionsLeak()
    runner.test_remote_returns_malformed_non_json_must_fallback()
    print("test_remote_returns_malformed_non_json_must_fallback: PASSED!")

def test_verify_t2_malformed_remote_json_passes():
    from tests.test_e2e_decoupled import RemoteGatewayMockController
    from backend.app import app
    from backend.gateway import proxy_client, default_circuit_breaker
    import json
    from unittest.mock import patch, MagicMock

    default_circuit_breaker.reset()
    mock_remote = RemoteGatewayMockController()
    mock_remote.malformed_json = True

    client = app.test_client()
    with patch.object(proxy_client._session, "request", side_effect=mock_remote.make_response):
        with patch.dict(os.environ, {"FUTSTATS_REMOTE_GATEWAY_URL": "http://mock-remote:8000"}):
            response = client.get("/api/overview")
            assert response.status_code == 200
            assert response.headers.get("X-Data-Source") == "local-fallback"
            assert response.headers.get("X-Fallback-Reason") == "malformed_json"
            data = response.get_json()
            assert data is not None
            assert "total_partidas" in data
            assert data["total_partidas"] == 115625
            assert default_circuit_breaker.failure_count >= 1
    print("test_t2_gateway_malformed_remote_json: PASSED!")

def test_verify_all_proxy_fallback_tests_pass():
    from tests.test_proxy_fallback import TestProxyClientDispatch, TestFlaskEndpointsIntegration
    t1 = TestProxyClientDispatch()
    t1.test_standalone_local_mode_when_no_remote_url()
    t1.test_remote_gateway_success()
    t1.test_remote_timeout_triggers_instant_fallback()
    t1.test_remote_500_error_triggers_fallback()
    t1.test_circuit_open_fast_fail_without_network_call()
    t1.test_tier_1_cache_hit_returns_cache_source()

    t2 = TestFlaskEndpointsIntegration()
    t2.test_health_endpoint_telemetry()
    t2.test_overview_endpoint_standalone()
    t2.test_automatic_fallback_when_remote_down()
    print("All test_proxy_fallback tests: PASSED!")
