# Explorer M1 Fix 1 Context
Scope: Analyze malformed JSON handling in backend/gateway/proxy_client.py lines 199-206 and 369-376.
Formulate surgical fix strategy so that malformed/corrupted remote JSON triggers circuit breaker failure and transparent local fallback with X-Fallback-Reason: malformed_json.
Ensure tests/test_e2e_decoupled.py::test_t2_gateway_malformed_remote_json passes without regressing any existing 42 tests.
