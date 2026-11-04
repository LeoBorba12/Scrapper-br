# Project: FutStats Database Decoupling & Universal Historical Goals Ingestion

## Architecture
- **Two-Tier Decoupled Data Architecture**:
  - **Tier 1 (Master Historical Archive - Remote Database Gateway)**:
    - Hosted on the 24/7 Oracle Cloud VM (`163.176.87.218`, Ashburn us-east-1).
    - Hosts the master archive database without storage limits (>50 GB disk capacity), receiving all 69,777 historical match sheets, all 207,658 goals, and complete lineups.
    - Serves REST API queries via `scripts/remote_gateway_daemon.py` on Waitress/Uvicorn, answering queries in 1 HTTP hop (~35-40ms).
  - **Tier 2 (Resilient Edge Proxy & Local Fallback on Vercel)**:
    - Operates as a serverless proxy in `backend/gateway/` (`proxy_client.py`, `circuit_breaker.py`, `cache_manager.py`).
    - 3-tier defense: In-Memory TTL Cache (<3ms), Upstream Remote Gateway with Circuit Breaker (timeout 1.8s, trips to OPEN after 3 failures for 60s), and Instantaneous Transparent Fallback to local bundled SQLite (`data/futebol.db`) on any error or timeout (<15ms).
    - Local fallback database maintained strictly < 91.0 MB (below Vercel's 94.0 MB limit) with VACUUM.
    - Zero UI errors, zero changes required to frontend `apiFetch`.
- **Universal Historical Goals Ingestion Pipeline**:
  - `scripts/ingerir_cache_ogol_existente.py`: Instant harvest of 6,225 cached match sheets and 16,535 goals in `data/cache_ogol_brasileirao/`.
  - `scripts/consolidar_duplicatas_partidas.py`: Resolves 3,710 almost-duplicate matches across Serie A and Copa do Brasil.
  - `scripts/ingestor_sumulas_massivo_ogol.py`: Batch ingestion pipeline for Serie A points era (2003-present) and Copa do Brasil, capturing goalscorers, minutes, goal types, and lineups (`escalacoes`).
  - `scripts/reconciliar_carreira_universal.py`: Recalculates player career appearances and totals, removes artificial 1.00 clamping `max(total_jogos, total_gols)`, resolves homonym collisions (such as Marcos ID 9488), and guarantees authentic career averages (0.35-0.65).
- **Quality Assurance & Relational Governance**:
  - `scripts/auditar_integridade_dados.py`: Enforces 12/12 relational integrity rules with 0 anomalies.
  - `tests/test_model_evals.py`: 22/22 mathematical regression tests for Dixon-Coles ($\rho = -0.12$), probabilities, and +EV gating.
  - `frontend/`: `npm run build` exits with code 0.
  - `tests/test_e2e_decoupled.py`: Comprehensive 4-Tier E2E test suite (Feature coverage, Boundary/Corner, Cross-feature, Real-world application).

## Feature Inventory
Every feature from the Survey phase appears here with its assigned milestone:
| # | Feature | Description | Milestone | Source |
|---|---|---|---|---|
| 1 | Resilient Proxy & Circuit Breaker Architecture | Implement `backend/gateway/` (`circuit_breaker.py`, `proxy_client.py`, `cache_manager.py`) with 3-state circuit breaker (closed/open/half-open) and 1.8s timeout. | M1 | Survey Infra |
| 2 | Telemetry Headers & Fallback Reason Routing | Add `X-Data-Source`, `X-Circuit-Breaker-State`, `X-Response-Time-Ms`, and `X-Fallback-Reason` to all API responses without breaking frontend contract. | M1 | Survey Infra |
| 3 | Remote API Gateway Daemon & Systemd Service | Create `scripts/remote_gateway_daemon.py` and `scripts/futstats-gateway.service` for high-performance Oracle Cloud VM deployment. | M1 | Survey Infra |
| 4 | Decoupled 24/7 Daemon Sync | Update `scripts/orquestrador_mestre_24x7.py` to write heavy database updates to the remote master database while keeping local git commits under 91 MB. | M1 | Survey Infra |
| 5 | Cache Harvest Ingestion (6,225 sheets, 16,535 goals) | Process `data/cache_ogol_brasileirao/` into `gols` and `escalacoes`, exceeding the 95,522 goals threshold immediately without network calls. | M2 | Survey Data |
| 6 | Match Deduplication & Canonical Consolidation | Canonicalize and deduplicate 3,710 almost-duplicate matches across Serie A and Copa do Brasil caused by name/date jitter. | M2 | Survey Data |
| 7 | Massive Historical Match Sheet & Goals Ingestion | Ingest Serie A (2003-present) and Copa do Brasil match sheets with goal types, exact minutes, and lineups into master archive and local DB. | M2 | Survey Data / Req R2 |
| 8 | Systematic Career Reconciliation & 1.00 Ratio Removal | Eliminate `max(total_jogos, total_gols)` artificial clamping, compute authentic career appearances, and fix homonyms (Marcos ID 9488). | M3 | Survey Data / Req R2 |
| 9 | Relational Integrity Preservation (12/12 Rules OK) | Ensure all 12 rules of `scripts/auditar_integridade_dados.py` report 100% OK with 0 anomalies across all 115k+ matches. | M3 | Survey QA / Req R3 |
| 10 | Mathematical Regression Preservation (22/22 Passed) | Ensure all 22 tests in `tests/test_model_evals.py` remain passed with 0 drift in Dixon-Coles parameters. | M3 | Survey QA / Req R3 |
| 11 | Frontend Production Build Verification (Code 0) | Ensure `npm run build` in `frontend/` compiles with 0 errors and bundle meets Vercel limits. | M3 | Survey QA / Req R3 |
| 12 | 4-Tier E2E Testing Suite Implementation | Implement comprehensive test suite in `tests/test_e2e_decoupled.py` (Tier 1: Feature, Tier 2: Boundary, Tier 3: Cross, Tier 4: Real-world) and publish `TEST_READY.md`. | E2E | E2E Testing Track |
| 13 | Final Milestone: 100% E2E Pass & Adversarial Hardening | Validate 100% pass of Tiers 1-4 tests, followed by Tier 5 adversarial stress testing and coverage hardening. | M4 | Final Milestone |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| E2E | E2E Testing Track | Feature 12: Comprehensive 4-Tier Opaque-Box E2E Test Suite (`TEST_INFRA.md`, `tests/test_e2e_decoupled.py`, `TEST_READY.md`) | none | DONE |
| M1 | Resilient Database Decoupling & Remote Gateway | Features 1, 2, 3, 4: `backend/gateway/`, circuit breaker, fallback engine, gateway daemon, telemetry headers | none | DONE |
| M2 | Massive Historical Match Sheets & Goals Ingestion | Features 5, 6, 7: Cache harvest, deduplication of 3,710 matches, Serie A & Copa do Brasil match sheets, goals > 95,522 | M1 | DONE |
| M3 | Career Totals Reconciliation & Relational Governance | Features 8, 9, 10, 11: Reconcile player careers (remove 1.00 ratio, fix Marcos 9488, Pedro Raul 54), 12/12 audit OK, 22/22 math evals, build code 0, 42/42 E2E passed | M2 | DONE |
| M3.5 | Enriquecimento de Goleiros, Palmarés & Comparador H2H | Goleiros históricos (São Marcos, Ceni, Cássio, Fábio, Dida), títulos/prêmios OGol, clean sheets/pênaltis defendidos, ratings Sofascore e comparador especializado de goleiros (`/api/jogadores/comparar` e `AthleteCompareView.jsx`) | M3 | DONE |
| M4 | Final Milestone: 100% E2E Pass & Adversarial Hardening | Feature 13: Phase 1 (100% pass of Tiers 1-4 E2E tests) + Phase 2 (Tier 5 Challenger-driven adversarial coverage hardening - 47/47 E2E tests passed) | E2E, M3 | DONE |
| M4.5 | Comparador de Mestres Táticos & Treinadores Históricos | Módulo de análise de pranchetas históricas (`CoachCompareView.jsx`, `/api/treinadores`, `/api/treinadores/comparar`), catálogo com 11 treinadores icônicos, estante de títulos oficiais (Palmarés), radar de atributos táticos, confronto direto histórico no acervo e exportação de card social PNG | M4 | DONE |

## Interface Contracts
### Gateway ↔ Vercel Proxy
- **Environment Variables**:
  - `FUTSTATS_REMOTE_GATEWAY_URL`: Upstream base URL (e.g. `http://163.176.87.218:8000`). If empty, standalone local.
  - `FUTSTATS_GATEWAY_SECRET`: Preshared authentication token.
  - `FUTSTATS_GATEWAY_TIMEOUT_SEC`: Upstream timeout threshold (default: 1.8s).
  - `FUTSTATS_CIRCUIT_MAX_FAILURES`: Failure threshold before circuit trips (default: 3).
  - `FUTSTATS_CIRCUIT_RESET_SEC`: Cooldown period before half-open attempt (default: 60s).
- **HTTP Response Headers**:
  - `X-Data-Source`: `remote-gateway` | `local-fallback` | `local-standalone` | `cache`
  - `X-Circuit-Breaker-State`: `closed` | `open` | `half-open`
  - `X-Response-Time-Ms`: Duration in ms
  - `X-Fallback-Reason`: `remote_timeout` | `connect_error` | `status_5xx` | `circuit_open`

### Match Sheet & Goals Ingestion Contract
- `gols` schema: `id_gol INTEGER PRIMARY KEY AUTOINCREMENT, id_partida INT, id_jogador INT, atleta TEXT, clube TEXT, minuto INT, tempo TEXT, tipo_de_gol TEXT`
  - Valid `tipo_de_gol`: `'Normal'`, `'Pênalti'`, `'Falta'`, `'Contra'`, `'Cabeça'`
  - Relational constraint: `gols.id_partida` must exist in `partidas.id_partida`; `gols.clube` must match either `partidas.mandante` or `partidas.visitante`.
- `escalacoes` schema: `id_escalacao INTEGER PRIMARY KEY AUTOINCREMENT, id_partida INT, id_jogador INT, atleta TEXT, clube TEXT, numero INT, posicao TEXT, titular INT, saiu_minuto INT, entrou_minuto INT`

### Player Career Schema Contract
- `jogadores_estatisticas` schema: `id_jogador INT PRIMARY KEY, nome_exibicao TEXT, total_jogos INT, total_gols INT, media_gols_por_jogo REAL, gols_carreira_oficiais INT, jogos_carreira_oficiais INT, clubes TEXT`
  - Invariant: `total_jogos` represents authentic cataloged appearances; no artificial forced equality `total_jogos = total_gols`.
  - Invariant: `media_gols_por_jogo` is realistic ($\le 2.5$).

## Code Layout
- `backend/app.py`: Flask application, main endpoints
- `backend/gateway/`: Modular proxy, circuit breaker, cache manager
  - `backend/gateway/__init__.py`
  - `backend/gateway/circuit_breaker.py`
  - `backend/gateway/proxy_client.py`
  - `backend/gateway/cache_manager.py`
- `scripts/remote_gateway_daemon.py`: Standalone gateway server for Oracle Cloud VM
- `scripts/futstats-gateway.service`: Systemd service unit definition
- `scripts/ingerir_cache_ogol_existente.py`: Ingestion script for local cached match sheets
- `scripts/consolidar_duplicatas_partidas.py`: Match deduplication script
- `scripts/ingestor_sumulas_massivo_ogol.py`: Live and historical batch ingestion pipeline
- `scripts/reconciliar_carreira_universal.py`: Player career totals and appearance reconciler
- `scripts/auditar_integridade_dados.py`: Relational integrity verification (12 rules)
- `tests/test_model_evals.py`: 22 mathematical evaluation regression tests
- `tests/test_e2e_decoupled.py`: 4-Tier E2E test suite
- `data/futebol.db`: Bundled local fallback SQLite database (< 91.0 MB)
