# Empirical Challenger Handoff Report: Milestone 1 Resilient Database Decoupling & Remote API Gateway

**Agent**: `teamwork_preview_challenger_m1_r2_1`  
**Parent Orchestrator ID**: `da7384f3-57a9-4b6b-9373-94dcd5a6f441`  
**Timestamp**: 2026-11-01T15:00:00Z  
**Target Milestone**: Milestone 1 (Resilient Database Decoupling & Remote API Gateway)  
**Verdict**: **FAIL** (Remediation Required for Malformed JSON Fallback Vulnerability)

---

## 1. Observation

### 1.1. Adversarial Test Suite Execution
An empirical adversarial test suite of 27 stress tests was developed in `tests/test_gateway_resilience_adversarial.py` targeting network flaps, real socket timeout precision, edge telemetry headers, zero-downtime under chaotic failure storms, latency SLAs on OPEN circuits, and corrupt payload exception handling.

Command executed:
```bash
.venv/bin/pytest tests/test_gateway_resilience_adversarial.py -v
```

Execution output:
```
tests/test_gateway_resilience_adversarial.py::TestNetworkFlapsAndBoundaryTransitions::test_rapid_alternating_success_and_failure_flaps PASSED [  3%]
tests/test_gateway_resilience_adversarial.py::TestNetworkFlapsAndBoundaryTransitions::test_half_open_flapping_immediate_retrip PASSED [  7%]
tests/test_gateway_resilience_adversarial.py::TestNetworkFlapsAndBoundaryTransitions::test_concurrent_flapping_thread_safety PASSED [ 11%]
tests/test_gateway_resilience_adversarial.py::TestTimeoutPrecision::test_sub_timeout_server_delay_succeeds_without_fallback PASSED [ 14%]
tests/test_gateway_resilience_adversarial.py::TestTimeoutPrecision::test_over_timeout_server_delay_aborts_precisely_and_falls_back PASSED [ 18%]
tests/test_gateway_resilience_adversarial.py::TestTimeoutPrecision::test_configurable_timeout_precision_fast_cutoff PASSED [ 22%]
tests/test_gateway_resilience_adversarial.py::TestTelemetryHeadersUnderAllEdgeFailureModes::test_network_exception_headers[failure_trigger0-remote_timeout] PASSED [ 25%]
tests/test_gateway_resilience_adversarial.py::TestTelemetryHeadersUnderAllEdgeFailureModes::test_network_exception_headers[failure_trigger1-remote_timeout] PASSED [ 29%]
tests/test_gateway_resilience_adversarial.py::TestTelemetryHeadersUnderAllEdgeFailureModes::test_network_exception_headers[failure_trigger2-connect_error] PASSED [ 33%]
tests/test_gateway_resilience_adversarial.py::TestTelemetryHeadersUnderAllEdgeFailureModes::test_network_exception_headers[failure_trigger3-connect_error] PASSED [ 37%]
tests/test_gateway_resilience_adversarial.py::TestTelemetryHeadersUnderAllEdgeFailureModes::test_network_exception_headers[failure_trigger4-connect_error] PASSED [ 40%]
tests/test_gateway_resilience_adversarial.py::TestTelemetryHeadersUnderAllEdgeFailureModes::test_network_exception_headers[failure_trigger5-connect_error] PASSED [ 44%]
tests/test_gateway_resilience_adversarial.py::TestTelemetryHeadersUnderAllEdgeFailureModes::test_remote_5xx_status_headers[500] PASSED [ 48%]
tests/test_gateway_resilience_adversarial.py::TestTelemetryHeadersUnderAllEdgeFailureModes::test_remote_5xx_status_headers[502] PASSED [ 51%]
tests/test_gateway_resilience_adversarial.py::TestTelemetryHeadersUnderAllEdgeFailureModes::test_remote_5xx_status_headers[503] PASSED [ 55%]
tests/test_gateway_resilience_adversarial.py::TestTelemetryHeadersUnderAllEdgeFailureModes::test_remote_5xx_status_headers[504] PASSED [ 59%]
tests/test_gateway_resilience_adversarial.py::TestTelemetryHeadersUnderAllEdgeFailureModes::test_remote_4xx_status_headers[400] PASSED [ 62%]
tests/test_gateway_resilience_adversarial.py::TestTelemetryHeadersUnderAllEdgeFailureModes::test_remote_4xx_status_headers[401] PASSED [ 66%]
tests/test_gateway_resilience_adversarial.py::TestTelemetryHeadersUnderAllEdgeFailureModes::test_remote_4xx_status_headers[403] PASSED [ 70%]
tests/test_gateway_resilience_adversarial.py::TestTelemetryHeadersUnderAllEdgeFailureModes::test_remote_4xx_status_headers[404] PASSED [ 74%]
tests/test_gateway_resilience_adversarial.py::TestTelemetryHeadersUnderAllEdgeFailureModes::test_circuit_open_headers PASSED [ 77%]
tests/test_gateway_resilience_adversarial.py::TestZeroDowntimeInvariant::test_zero_downtime_under_chaotic_upstream_failure_storm PASSED [ 81%]
tests/test_gateway_resilience_adversarial.py::TestCircuitOpenP95LatencySLA::test_p95_response_time_when_circuit_open_strict_sla PASSED [ 85%]
tests/test_gateway_resilience_adversarial.py::TestCircuitOpenP95LatencySLA::test_flask_test_client_circuit_open_p95_sla PASSED [ 88%]
tests/test_gateway_resilience_adversarial.py::TestNoUnhandledExceptionsLeak::test_remote_returns_malformed_non_json_must_fallback FAILED [ 92%]
tests/test_gateway_resilience_adversarial.py::TestNoUnhandledExceptionsLeak::test_adversarial_querystrings_and_null_bytes PASSED [ 96%]
tests/test_gateway_resilience_adversarial.py::TestNoUnhandledExceptionsLeak::test_high_concurrency_load_under_remote_outage PASSED [100%]

=================================== FAILURES ===================================
_ TestNoUnhandledExceptionsLeak.test_remote_returns_malformed_non_json_must_fallback _
...
AssertionError: Vulnerability: proxy returned remote-gateway with garbage instead of local-fallback
assert 'remote-gateway' == 'local-fallback'
- local-fallback
+ remote-gateway
========================= 1 failed, 26 passed in 5.01s =========================
```

### 1.2. Critical Vulnerability: Upstream Malformed/Truncated JSON on HTTP 200
In `backend/gateway/proxy_client.py`, lines 190-210:
```python
        # Attempt remote query
        remote_resp = self.call_remote(request)
        if remote_resp is not None:
            self.breaker.record_success()
            duration_ms = round((time.perf_counter() - g.request_start_time) * 1000, 2)
            try:
                json_data = remote_resp.json()
                if request.method == "GET":
                    # Cache successful responses
                    self.cache.set(f"proxy:{request.full_path}", json_data, ttl=300)
                resp = jsonify(json_data)
            except Exception:
                resp = Response(
                    remote_resp.content,
                    status=200,
                    content_type=remote_resp.headers.get("Content-Type", "application/json"),
                )

            resp.headers["X-Data-Source"] = "remote-gateway"
            resp.headers["X-Circuit-Breaker-State"] = self.breaker.state
            resp.headers["X-Response-Time-Ms"] = str(duration_ms)
            return resp
```
And in `dispatch_with_fallback`, lines 362-383:
```python
        if remote_resp.status_code == 200:
            c.breaker.record_success()
            duration_ms = round((time.perf_counter() - start_time) * 1000, 2)
            try:
                json_data = remote_resp.json()
                if cache_key:
                    c.cache.set(cache_key, json_data, ttl=ttl)
                resp = jsonify(json_data)
            except Exception:
                resp = Response(
                    remote_resp.content,
                    status=200,
                    content_type=remote_resp.headers.get("Content-Type", "application/json"),
                )
            return _attach_headers(...)
```

When verified with `tests/test_e2e_decoupled.py::TestTier2BoundaryAndCorner::test_t2_gateway_malformed_remote_json`:
```
FAILED tests/test_e2e_decoupled.py::TestTier2BoundaryAndCorner::test_t2_gateway_malformed_remote_json
json.decoder.JSONDecodeError: Expecting value: line 1 column 1 (char 0)
```
And verified via standalone Python harness:
```
Status: 200
X-Data-Source: remote-gateway
CircuitBreaker state: closed failure_count: 0
EXCEPTION in get_json(): JSONDecodeError Expecting property name enclosed in double quotes: line 1 column 2 (char 1)
```

### 1.3. Latency Benchmarks on Circuit OPEN (< 15ms SLA)
Measured empirically across hundreds of iterations:
1. `dispatch_with_fallback` (300 samples):
   - Median: `0.0286 ms`
   - p90: `0.0410 ms`
   - p95: `0.0497 ms`
   - p99: `0.0597 ms`
   - Max: `0.0937 ms`
2. Full Flask WSGI client hitting SQLite `get_overview()` when Circuit is OPEN (150 samples):
   - Median: `0.358 ms`
   - p90: `0.395 ms`
   - p95: `0.422 ms`
   - p99: `7.385 ms`
   - Max: `14.149 ms`
Result: Both are strictly `< 15.0 ms`, fully honoring the SLA.

### 1.4. Timeout Precision (1.9s vs 1.0s)
Tested against a live local socket HTTP server (`SlowHttpHandler` on ephemeral port):
1. Upstream delay 1.0s (less than default 1.8s timeout):
   - Succeeded in `1.002s` without timeout.
   - Emitted `X-Data-Source: remote-gateway`.
   - `failure_count == 0`.
2. Upstream delay 2.0s (greater than default 1.8s timeout):
   - Connection severed precisely at `1.802s` (did not hang for 2.0s).
   - Instant transparent fallback returned HTTP 200 from local SQLite.
   - Emitted `X-Data-Source: local-fallback` and `X-Fallback-Reason: remote_timeout`.
   - `failure_count == 1`.

---

## 2. Logic Chain

1. **Contract Requirement (Obs 1.2)**: `PROJECT.md` and `ORIGINAL_REQUEST.md` mandate transparent local fallback to bundled SQLite (`data/futebol.db`) with "zero erros na interface" on any upstream error.
2. **Defect Mechanism (Obs 1.2)**: When the upstream remote gateway returns HTTP 200 with truncated, empty, or non-JSON payloads (e.g. proxy HTML errors or corrupted TCP streams):
   - `remote_resp.json()` throws `JSONDecodeError`.
   - The `except Exception:` block in `ProxyClient.before_request_hook` and `dispatch_with_fallback` wraps the raw corrupted bytes into `Response(remote_resp.content, status=200)` and labels it `X-Data-Source: remote-gateway`.
   - Crucially, it executes `self.breaker.record_success()`, masking the upstream corruption from the circuit breaker.
   - Because `before_request_hook` returns this response instead of `None`, Flask returns the malformed payload directly to the client instead of executing the local view function against SQLite.
3. **Blast Radius (Obs 1.2)**: The frontend `apiFetch` (expecting JSON) and any automated client executing `res.json()` suffer an unhandled `JSONDecodeError` / `SyntaxError`, resulting in a broken UI. Furthermore, this causes `test_t2_gateway_malformed_remote_json` in `tests/test_e2e_decoupled.py` to fail.
4. **Remediation**: In `backend/gateway/proxy_client.py`:
   - In `before_request_hook`: On `remote_resp.json()` failure, record failure on the breaker (`self.breaker.record_failure()`), set `g.data_source = "local-fallback"` and `g.fallback_reason = "malformed_json"`, and return `None` so Flask falls back to the local view handler.
   - In `dispatch_with_fallback`: On `remote_resp.json()` failure, record failure on the breaker, set `fallback_reason = "malformed_json"`, and execute `local_handler()`.

---

## 3. Caveats

1. **Concurrency Pool Sizing**:
   `ProxyClient` configures `pool_maxsize=20` in `requests.adapters.HTTPAdapter`. Under tests with 50 concurrent threads hammering an un-cached upstream (`test_challenger_m1_r2_concurrency.py`), `urllib3` warns of discarded connections and incurs socket renegotiation latency. Recommending worker bump `pool_connections=50, pool_maxsize=50`.
2. **Future Milestone Tests**:
   `tests/test_e2e_decoupled.py` has 5 failures relating to historical goal counts (>95,522) and career appearance reconciliations (Marcos 9488). These are explicitly designated in the test docstrings as `(Pendente Marco M2)` and `(Pendente Marco M3)`, and are outside the scope of Milestone 1.

---

## 4. Conclusion

**Verdict: FAIL**

While the core circuit breaker mechanics, timeout precision, telemetry headers, and latency SLA (< 15ms) are robust and pass with excellent marks, Milestone 1 cannot be approved in its current state due to the **Malformed JSON Fallback Vulnerability** (`test_t2_gateway_malformed_remote_json`).

The worker must apply the recommended surgical fix to `backend/gateway/proxy_client.py` so that non-JSON/truncated 200 responses trigger local fallback rather than leaking corrupted data.

---

## 5. Verification Method

To reproduce and verify this failure and subsequent remediation:

1. **Reproduce Failure in Adversarial Suite**:
   ```bash
   .venv/bin/pytest tests/test_gateway_resilience_adversarial.py::TestNoUnhandledExceptionsLeak::test_remote_returns_malformed_non_json_must_fallback -v
   # Currently FAILS with: AssertionError: Vulnerability: proxy returned remote-gateway with garbage instead of local-fallback
   ```

2. **Reproduce Failure in Decoupled E2E Suite**:
   ```bash
   .venv/bin/pytest tests/test_e2e_decoupled.py::TestTier2BoundaryAndCorner::test_t2_gateway_malformed_remote_json -v
   # Currently FAILS with: JSONDecodeError: Expecting value: line 1 column 1 (char 0)
   ```

3. **Verify OPEN Circuit SLA (< 15ms)**:
   ```bash
   .venv/bin/pytest tests/test_gateway_resilience_adversarial.py::TestCircuitOpenP95LatencySLA -s
   # Output: dispatch p95=0.05ms, Flask WSGI p95=0.42ms (both < 15.0ms)
   ```

4. **Verify Timeout Precision**:
   ```bash
   .venv/bin/pytest tests/test_gateway_resilience_adversarial.py::TestTimeoutPrecision -v
   # Output: 3 passed in ~3.2s
   ```
