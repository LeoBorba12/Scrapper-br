## 2026-11-01T14:35:34Z
You are teamwork_preview_worker_m1_r2, the Implementation Worker for Milestone 1: Resilient Database Decoupling & Remote API Gateway.

Working directory: /mnt/jogos_f/Antigravity_Projetos_e_Ferramentas/Guia profissional/.agents/teamwork/teamwork_preview_worker_m1_r2
Maintain progress.md in your working directory with 'Last visited: [timestamp]'.

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Authoritative user request:
Read /mnt/jogos_f/Antigravity_Projetos_e_Ferramentas/Guia profissional/.agents/teamwork/ORIGINAL_REQUEST.md (specifically see section ## 2026-11-01T14:16:05Z).

Project Blueprint:
Read /mnt/jogos_f/Antigravity_Projetos_e_Ferramentas/Guia profissional/PROJECT.md (Milestone 1).

Architecture Reference & Code Sketches:
Read /mnt/jogos_f/Antigravity_Projetos_e_Ferramentas/Guia profissional/.agents/teamwork/teamwork_preview_explorer_survey2_1/handoff.md.

Files you exclusively own:
- backend/gateway/__init__.py
- backend/gateway/circuit_breaker.py
- backend/gateway/proxy_client.py
- backend/gateway/cache_manager.py
- scripts/remote_gateway_daemon.py
- scripts/futstats-gateway.service
- scripts/test_gateway_resilience.py
- tests/test_proxy_fallback.py
- backend/app.py (surgical integration of proxy dispatch and fallback headers)
- .agents/teamwork/teamwork_preview_worker_m1_r2/*

Mission & Scope:
Implement the database decoupling architecture liberating FutStats from the 94.0 MB Vercel limit while preserving sub-200ms latency and 100% zero UI errors.
1. Create backend/gateway/circuit_breaker.py: thread-safe CircuitBreaker (CLOSED, OPEN, HALF-OPEN states, failure_threshold=3, recovery_time=60.0s).
2. Create backend/gateway/cache_manager.py: in-memory TTL Cache.
3. Create backend/gateway/proxy_client.py: dispatch_with_fallback that sends requests to FUTSTATS_REMOTE_GATEWAY_URL when configured, times out at 1.8s (FUTSTATS_GATEWAY_TIMEOUT_SEC), records success/failure in circuit breaker, attaches headers (X-Data-Source: remote-gateway | local-fallback | local-standalone, X-Circuit-Breaker-State, X-Response-Time-Ms, X-Fallback-Reason), and seamlessly executes local query handler if remote fails.
4. Create scripts/remote_gateway_daemon.py: high-performance gateway service for Oracle Cloud VM using Waitress or Flask WSGI.
5. Create scripts/futstats-gateway.service: systemd service file for deployment on VM.
6. Surgically wire proxy client into backend/app.py ensuring full backward compatibility and zero downtime.
7. Write and run tests/test_proxy_fallback.py and scripts/test_gateway_resilience.py validating circuit breaker states, remote timeout handling, header emission, and instantaneous fallback.
8. Verify regression gates:
   - .venv/bin/pytest tests/test_model_evals.py (must pass 22/22)
   - python3 scripts/auditar_integridade_dados.py (must pass 12/12 with 0 anomalies)
   - npm run build --prefix frontend (must exit 0)
   - Database size data/futebol.db < 94.0 MB.
9. Write complete handoff report to .agents/teamwork/teamwork_preview_worker_m1_r2/handoff.md.

When finished, send a message to orchestrator parent conversation ID da7384f3-57a9-4b6b-9373-94dcd5a6f441 summarizing changes, verification outputs, and files created.
