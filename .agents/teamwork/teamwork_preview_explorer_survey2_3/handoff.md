# Handoff Report: R3 Quality Assurance, Relational Governance, and E2E Testing Architecture

**Agent**: `teamwork_preview_explorer_survey2_3`  
**Milestone**: Survey 2 - Technical Survey & Architecture Design  
**Target Milestone**: R3 Preservação de Confiabilidade e Governança Relacional & E2E Testing Track  
**Date**: 2026-11-01T14:26:00Z  

---

## 1. Observation

### 1.1. Relational Integrity Rules (`scripts/auditar_integridade_dados.py`)
Direct execution command:
```bash
python scripts/auditar_integridade_dados.py
```
Output observed:
```json
{
  "timestamp": "2026-11-01 11:20:13",
  "total_partidas": 115625,
  "inconsistencias_encontradas": 0,
  "inconsistencias_reparadas": 0,
  "regras": [
    {"regra": "Gols Numéricos Nulos em Partidas Finalizadas", "status": "OK", "ocorrencias": 0, "reparados": 0},
    {"regra": "Padronização de Formato de Data (ISO YYYY-MM-DD)", "status": "OK", "ocorrencias": 0},
    {"regra": "Gols Órfãos (Sem Partida)", "status": "OK", "ocorrencias": 0},
    {"regra": "Odds Órfãs (Sem Partida)", "status": "OK", "ocorrencias": 0},
    {"regra": "Nomes de Clubes Mandante/Visitante Válidos", "status": "OK", "ocorrencias": 0, "reparados": 0},
    {"regra": "Coerência Lógica de Vencedor vs Placar Final", "status": "OK", "ocorrencias": 0, "reparados": 0},
    {"regra": "Jogos Duplicados no Acervo", "status": "OK", "ocorrencias": 0},
    {"regra": "Gols Atribuídos a Times com Placar Zero (Clube Invertido)", "status": "OK", "ocorrencias": 0, "reparados": 0},
    {"regra": "Atletas Artilheiros sem Posição Tática no Perfil", "status": "OK", "ocorrencias": 0, "reparados": 0},
    {"regra": "Coerência de Clube em Gols vs Escalação Oficial", "status": "OK", "ocorrencias": 0, "reparados": 0},
    {"regra": "Coerência de Atletas: Médias Verossímeis (<= 2.5)", "status": "OK", "ocorrencias": 0, "reparados": 0},
    {"regra": "Coerência de Clubes Recentes: Clube Atual em Escalações presente no Perfil", "status": "OK", "ocorrencias": 0, "reparados": 0}
  ],
  "partidas_recentes": {
    "2026": 1867,
    "2025": 2151,
    "2024": 2338
  }
}
```

Detailed technical analysis of all 12 rules:
| # | Rule Name | SQL Check Query / Location | Auto-Repair Action | Condition for 100% OK |
|---|---|---|---|---|
| **1** | Gols Numéricos Nulos em Partidas Finalizadas | `scripts/auditar_integridade_dados.py:34-38`: `WHERE (gols_mandante IS NULL OR gols_visitante IS NULL) AND placar IS NOT NULL AND placar LIKE '%x%'` | `UPDATE partidas SET gols_mandante = CAST(TRIM(SUBSTR(placar, 1, INSTR(placar, 'x') - 1)) AS INTEGER)...` | `nulos == 0` |
| **2** | Padronização de Formato de Data (ISO YYYY-MM-DD) | `scripts/auditar_integridade_dados.py:60-63`: `WHERE data NOT LIKE '____-__-__%' OR data IS NULL` | None (manual pre-sanitization). | `datas_invalidas == 0` |
| **3** | Gols Órfãos (Sem Partida) | `scripts/auditar_integridade_dados.py:73-77`: `FROM gols g LEFT JOIN partidas p ON g.id_partida = p.id_partida WHERE p.id_partida IS NULL` | None (strict relational integrity constraint). | `gols_orfaos == 0` |
| **4** | Odds Órfãs (Sem Partida) | `scripts/auditar_integridade_dados.py:86-90`: `FROM odds_partidas o LEFT JOIN partidas p ON o.id_partida = p.id_partida WHERE p.id_partida IS NULL` | None. | `odds_orfas == 0` |
| **5** | Nomes de Clubes Mandante/Visitante Válidos | `scripts/auditar_integridade_dados.py:99-105`: `WHERE mandante IS NULL OR mandante = '' OR visitante IS NULL OR visitante = '' OR mandante LIKE '%Estatísticas%' OR visitante LIKE '%Estatísticas%'` | Cascading DELETE from dependent tables (`gols`, `odds_partidas`, `escalacoes`, `cartoes`), cleanup of athlete `clubes` string, and recalculation of totals. | `clubes_invalidos == 0` |
| **6** | Coerência Lógica de Vencedor vs Placar Final | `scripts/auditar_integridade_dados.py:234-243`: Checks `vencedor != mandante` when `gols_mandante > gols_visitante`, or `vencedor != visitante`, or `vencedor != 'Empate'`. | `UPDATE partidas SET vencedor = CASE WHEN gols_mandante > gols_visitante THEN mandante...` | `vencedores_divergentes == 0` |
| **7** | Jogos Duplicados no Acervo | `scripts/auditar_integridade_dados.py:274-281`: `GROUP BY data, mandante, visitante HAVING COUNT(*) > 1` | None (raises 'AVISO' and flags occurrences). | `duplicatas == 0` |
| **8** | Gols Atribuídos a Times com Placar Zero (Clube Invertido) | `scripts/auditar_integridade_dados.py:291-299`: Checks non-own goals credited to a team that scored 0 goals (`g.clube = p.mandante AND p.gols_mandante = 0 AND p.gols_visitante > 0`). | Flips `gols.clube` to the opposing team (`p.visitante` or `p.mandante`) and deletes phantom goals in 0x0 games. | `gols_invertidos == 0` |
| **9** | Atletas Artilheiros sem Posição Tática no Perfil | `scripts/auditar_integridade_dados.py:342-346`: `FROM jogadores_estatisticas WHERE (posicao IS NULL OR posicao = '') AND total_gols >= 3` | `UPDATE jogadores_estatisticas SET posicao = 'Atacante' WHERE...` | `artilheiros_sem_pos == 0` |
| **10** | Coerência de Clube em Gols vs Escalação Oficial | `scripts/auditar_integridade_dados.py:365-373`: Checks goal club assigned to Club A where player was listed in `escalacoes` for Club B (and not own goal). | Updates `gols.clube` to `escalacoes.clube` and resyncs athlete `clubes` CSV string. | `gols_inv_escalacao == 0` |
| **11** | Coerência de Atletas: Médias Verossímeis (<= 2.5) e Jogos Válidos | `scripts/auditar_integridade_dados.py:433-437`: `WHERE (total_jogos <= 0 AND total_gols > 0) OR (total_gols >= 10 AND media_gols_por_jogo > 2.5)` | None ("Sem Auto-Reparo Nocivo" - intentional inspection safeguard). | `atletas_anormais == 0` |
| **12** | Coerência de Clubes Recentes: Clube Atual em Escalações presente no Perfil | `scripts/auditar_integridade_dados.py:449-461`: CTE `ultimas_partidas` checks if player's most recent club in `escalacoes` is missing from `jogadores_estatisticas.clubes`. | Standardizes aliases ('Atlético Mineiro' -> 'Atlético-MG') and prepends most recent club into `jogadores_estatisticas.clubes`. | `len(clubes_defasados) == 0` |

---

### 1.2. Mathematical Regression Suite (`tests/test_model_evals.py`)
Direct execution command:
```bash
.venv/bin/pytest tests/test_model_evals.py -v
```
Output observed:
```
============================= test session starts ==============================
platform linux -- Python 3.14.8, pytest-9.1.1, pluggy-1.7.0 -- /mnt/jogos_f/Antigravity_Projetos_e_Ferramentas/Guia profissional/.venv/bin/python3
collected 22 items

tests/test_model_evals.py::test_probabilidades_somam_100_porcento[derby_equilibrado] PASSED [  4%]
tests/test_model_evals.py::test_probabilidades_somam_100_porcento[super_favorito_casa] PASSED [  9%]
tests/test_model_evals.py::test_probabilidades_somam_100_porcento[jogo_under_defensivo] PASSED [ 13%]
tests/test_model_evals.py::test_probabilidades_somam_100_porcento[jogo_over_franco] PASSED [ 18%]
tests/test_model_evals.py::test_probabilidades_somam_100_porcento[borda_minima_clamp] PASSED [ 22%]
tests/test_model_evals.py::test_probabilidades_somam_100_porcento[borda_maxima_clamp] PASSED [ 27%]
tests/test_model_evals.py::test_probabilidade_positiva_placares_baixos PASSED [ 31%]
tests/test_model_evals.py::test_dixon_coles_inflacao_empate_rho_negativo PASSED [ 36%]
tests/test_model_evals.py::test_placares_ordenados_decrescente PASSED    [ 40%]
tests/test_model_evals.py::test_coerencia_fair_odds[derby_equilibrado] PASSED [ 45%]
tests/test_model_evals.py::test_coerencia_fair_odds[super_favorito_casa] PASSED [ 50%]
tests/test_model_evals.py::test_coerencia_fair_odds[jogo_under_defensivo] PASSED [ 54%]
tests/test_model_evals.py::test_coerencia_fair_odds[jogo_over_franco] PASSED [ 59%]
tests/test_model_evals.py::test_coerencia_fair_odds[borda_minima_clamp] PASSED [ 63%]
tests/test_model_evals.py::test_coerencia_fair_odds[borda_maxima_clamp] PASSED [ 68%]
tests/test_model_evals.py::test_monotonicidade_fair_odds PASSED          [ 72%]
tests/test_model_evals.py::test_ev_positivo_apenas_quando_odd_maior_que_fair_odd PASSED [ 77%]
tests/test_model_evals.py::test_ev_gating_parametrico[1.2-1] PASSED      [ 81%]
tests/test_model_evals.py::test_ev_gating_parametrico[1.05-1] PASSED     [ 86%]
tests/test_model_evals.py::test_ev_gating_parametrico[0.95--1] PASSED    [ 90%]
tests/test_model_evals.py::test_ev_gating_parametrico[0.8--1] PASSED     [ 95%]
tests/test_model_evals.py::test_resiliencia_clamping_extremos PASSED     [100%]

============================== 22 passed in 4.79s ==============================
```

Analysis of the 22 tests & triggers for regression failure:
1. **Mathematical Partition Invariants (6 tests)**:
   - Evaluated across 6 Golden Benchmark cases: `derby_equilibrado`, `super_favorito_casa`, `jogo_under_defensivo`, `jogo_over_franco`, `borda_minima_clamp`, `borda_maxima_clamp`.
   - Failure trigger: Any drift where $|(P_{\text{home}} + P_{\text{draw}} + P_{\text{away}}) - 100.0\%| > 0.25\%$, or O/U 1.5, O/U 2.5, BTTS drift $> 0.20\%$.
2. **Placares Baixos Positivos (1 test)**:
   - Validates that $0\times0$, $1\times1$, or $1\times0$ are present in top scorelines with strictly positive probability.
   - Failure trigger: Dixon-Coles tau factor zeroing or suppressing low scoreline probabilities.
3. **Dixon-Coles Tau Adjustment Calibration (1 test)**:
   - Validates $\rho = -0.12$ inflation of draws: $P_{\text{draw}}(\text{DC}) \ge P_{\text{draw}}(\text{Poisson Indep.})$, and $P(0\times0)_{\text{DC}} > P(0\times0)_{\text{Indep.}}$, $P(1\times1)_{\text{DC}} > P(1\times1)_{\text{Indep.}}$.
   - Failure trigger: Inverted sign on $\rho$, wrong tau equations $\tau(0,0)=1-\lambda_h\lambda_a\rho$, $\tau(1,1)=1-\rho$, $\tau(0,1)=1+\lambda_h\rho$, $\tau(1,0)=1+\lambda_a\rho$.
4. **Decrescimento Ordenado de Placares (1 test)**:
   - Asserts descending order of score probabilities.
   - Failure trigger: Unsorted dictionary iteration or reversed heap/sort in scoreline generation.
5. **Fair Odds Calibration (6 tests)**:
   - Evaluates rounding interval $[100/(p+0.06), 100/(p-0.06)] \pm 0.05$ across 6 golden cases and 6 markets (Mandante, Empate, Visitante, Over 1.5, Over 2.5, BTTS Sim). For tail events ($p \le 1.0\%$), saturates at $99.0$.
   - Failure trigger: Inconsistent precision conversion or missing saturation clamp for tail events.
6. **Monotonicidade de Odds (1 test)**:
   - Asserts $P_A > P_B \implies \text{FairOdd}_A < \text{FairOdd}_B$.
   - Failure trigger: Formula inversion or inverted key assignment.
7. **Expected Value (+EV) Gating (1 test + 4 parametric tests = 5 tests)**:
   - Asserts $\text{EV} > 0$ strictly when $\text{Odd}_{\text{mercado}} > \text{FairOdd}$; $\text{EV} < 0$ when $\text{Odd}_{\text{mercado}} < \text{FairOdd}$; $|\text{EV}| \le 1.5\%$ at breakeven. Tested across multipliers 1.20, 1.05, 0.95, 0.80.
   - Failure trigger: Incorrect algebraic sign in $((\text{prob}/100) \times \text{odd} - 1.0) \times 100$.
8. **Resiliência e Clamping de Borda Extrema (1 test)**:
   - Tests inputs $(0.0, 0.0)$, $(-1.5, -2.0)$, $(0.0001, 15.0)$, $(25.0, 30.0)$.
   - Failure trigger: Absence of input clamping ($\lambda \in [0.25, 4.5]$), raising `ZeroDivisionError`, `ValueError`, `NaN` or `Inf`.

---

### 1.3. Frontend Build Setup (`frontend/package.json`, `frontend/vite.config.js`)
Direct execution command:
```bash
npm run build --prefix frontend
```
Output observed:
```
> dashboard-futebol-clima@1.0.0 build
> vite build

vite v5.4.21 building for production...
transforming (1602 modules)...
dist/index.html                   0.86 kB │ gzip:   0.49 kB
dist/assets/index-BdtJzmHv.css   10.91 kB │ gzip:   2.85 kB
dist/assets/index-BqkkFc4E.js   635.83 kB │ gzip: 145.46 kB
✓ built in 6.70s
```
Exit code: **0**.

Analysis of Frontend Architecture:
- Framework: React 18.3.1 with Vite 5.4.21 (`@vitejs/plugin-react: ^4.3.3`).
- API Proxy: In development (`frontend/vite.config.js:8-13`), `/api` proxies to `http://127.0.0.1:5000`.
- In production, static build is served from `frontend/dist` via Flask `send_from_directory` or Vercel static routing.
- Chunk Size Note: Single bundle `index-BqkkFc4E.js` is 635.83 kB (145.46 kB gzipped). Clean build exit code 0 is guaranteed.

---

### 1.4. Current State of Database & E2E Test Suite
Direct empirical inspection of database (`data/futebol.db`):
- Total matches: **115,625**
- Cataloged goals: **95,522**
- Lineups (`escalacoes`): **152,266**
- Registered players (`jogadores`): **3,639**
- Player stats records (`jogadores_estatisticas`): **19,790**
- Matches without cataloged goals: **80,331** (historical pending archive)
- Database file size: **84.56 MB** (88,666,112 bytes)
- Vercel storage hard limit: **94.0 MB** (98,566,144 bytes) $\implies$ Headroom is currently only **9.44 MB**.

Direct execution of existing E2E test suite (`tests/test_e2e_futstats.py`):
```
49 passed, 1 failed in 6.47s
FAILED tests/test_e2e_futstats.py::TestTier1FeatureCoverage::test_t1_r1_db_no_forced_jogos_equals_gols_with_divergent_career
AssertionError: Encontrados atletas com total_jogos forçado artificialmente a total_gols: [(9488, 'Marcos', 11)]
```
Empirical investigation of Marcos (ID 9488):
- `(9488, 'Marcos', total_jogos=11, total_gols=11, jogos_carreira_oficiais=765)`
- Discovered 11 goals assigned to ID 9488 between 1963 and 2001 (e.g. Universidad de Chile in 1963/1966/1970, Sport in 1973, Coritiba in 1977, Athletico-PR in 2001). This is a homonym collision with the legendary Palmeiras goalkeeper Marcos (born 1973). This finding directly confirms why a rigorous Career Reconciliation test and pipeline is required in R2.

---

## 2. Logic Chain

1. **Storage Decoupling Mandate**:
   - `data/futebol.db` is 84.56 MB. The Vercel deployment limit is strictly 94.0 MB.
   - Expanding the 80,331 pending historical matches with 100,000+ new goals and lineups would swell the SQLite file to > 180 MB, immediately breaking Vercel git push and serverless lambda limits.
   - Therefore, R1 (Decoupling Gateway) is mathematically required: full historical records reside in a Remote Database Gateway (Oracle Cloud VM / external Turso / remote API), while the Vercel app operates as a resilient proxy with transparent fallback to a local SQLite snapshot below 94 MB.

2. **Zero-Downtime Fallback Requirement**:
   - The Gateway must support a circuit-breaker: if the remote endpoint latency exceeds 2.5s or drops connection, queries must fall back to local SQLite within 200ms without surfacing HTTP 500 errors to the frontend.
   - The frontend build (Vite) and backend health check (`/api/health`) must remain intact across both remote and local modes.

3. **Relational Consistency Governance**:
   - Ingesting massive historical match sheets (R2) introduces extreme risks of orphan records, swapped clubs in Conmebol matches, inverted winner flags, and corrupted goal-to-lineup relationships.
   - The 12 rules of `scripts/auditar_integridade_dados.py` are the authoritative gatekeeper. Because the database is currently at 100% OK with 0 anomalies across all 115,625 matches, any historical ingestion must guarantee that after ingestion, `inconsistencias_encontradas == 0` is preserved.

4. **Model Calibration Preservation**:
   - Predictive models (`_calc_poisson_bivariate`) and xG algorithms rely on clean statistical inputs. The 22 regression tests in `tests/test_model_evals.py` enforce mathematical invariants that must not be disrupted by schema migrations or backend proxy abstraction layers.

5. **Need for a 4-Tier E2E Testing Track**:
   - A superficial smoke test cannot catch subtle edge cases like gateway timeouts during active match ingestion, cache staleness on career recalculations, or homonym collisions (such as Marcos ID 9488).
   - Thus, a formal 4-Tier E2E Testing Architecture (Feature Coverage, Boundary/Corner, Cross-Feature, Real-World) must be constructed and certified in `TEST_INFRA.md` and `TEST_READY.md`.

---

## 3. Comprehensive 4-Tier E2E Testing Track Architecture Design

### Tier 1: Feature Coverage (>=5 test cases per feature)

#### Feature 1: Decoupling Gateway
1. `test_t1_gateway_remote_query_dispatch`:
   - Input: GET `/api/partidas?ano=2024&limite=10` via Gateway.
   - Assertion: HTTP 200 OK, JSON payload contains `partidas` list, header `X-Data-Source: remote` or payload metadata `source: "remote"`, response time < 2500ms.
2. `test_t1_gateway_response_envelope`:
   - Input: GET `/api/overview`.
   - Assertion: HTTP 200 OK, top-level keys `total_partidas`, `total_gols`, `total_atletas`, `metadata.source == "remote"`, `metadata.cached` boolean, `metadata.query_latency_ms < 200` when warm.
3. `test_t1_gateway_auth_bearer_passthrough`:
   - Input: GET `/api/admin/status` with `Authorization: Bearer <valid_jwt>`.
   - Assertion: Gateway validates or forwards JWT correctly without stripping Bearer headers, returning 200 OK.
4. `test_t1_gateway_p95_latency_slo`:
   - Input: 20 sequential requests to `/api/health` and `/api/classificacao?campeonato=Brasileiro+Série+A&ano=2024`.
   - Assertion: p95 latency is strictly under 200ms, adhering to the project SLO standard.
5. `test_t1_gateway_endpoint_parity`:
   - Input: Querying identical endpoints on remote gateway vs local reference DB.
   - Assertion: Column names, data types, and total counts match 100% across `/api/overview`, `/api/confrontos`, and `/api/jogadores/perfil`.

#### Feature 2: Resilient Local Fallback
1. `test_t1_fallback_trigger_on_remote_unreachable`:
   - Setup: Mock remote endpoint throwing `requests.exceptions.ConnectionError`.
   - Input: GET `/api/partidas?ano=2024`.
   - Assertion: HTTP 200 OK (no 500), payload returned from local SQLite, `metadata.source == "local_fallback"`, status is marked `degraded`.
2. `test_t1_fallback_trigger_on_remote_timeout`:
   - Setup: Remote endpoint artificial delay > 2500ms.
   - Input: GET `/api/jogadores/perfil?id=9033`.
   - Assertion: Gateway trips circuit breaker at 2500ms, falls back to local SQLite, returns profile within total 2600ms.
3. `test_t1_fallback_response_metadata_and_badge`:
   - Input: GET `/api/health` during fallback.
   - Assertion: Returns HTTP 200 with `{"status": "degraded", "database": {"status": "connected_fallback"}}`.
4. `test_t1_fallback_zero_downtime_switch`:
   - Setup: 50 concurrent requests fired while remote connectivity toggles from UP $\rightarrow$ DOWN.
   - Assertion: Zero 5xx errors; 100% of requests complete with HTTP 200.
5. `test_t1_fallback_recovery_when_remote_restored`:
   - Setup: Remote endpoint recovers to healthy.
   - Input: Subsequent GET `/api/overview`.
   - Assertion: Gateway detects recovery (or TTL health check expires) and seamlessly resumes routing to `source: "remote"`.

#### Feature 3: Universal Historical Goals Ingestion Pipeline
1. `test_t1_ingestion_goal_count_threshold`:
   - Input: `SELECT COUNT(*) FROM gols;` after ingestion.
   - Assertion: Total cataloged goals strictly exceeds **95,522** (e.g. $\ge 96,000$ in first batch, targeting full archive).
2. `test_t1_ingestion_match_sheet_completeness`:
   - Input: Ingested matches in Serie A 2003-2024.
   - Assertion: Goal records have non-null `minuto`, valid `atleta`, `clube`, and `tipo_de_gol`.
3. `test_t1_ingestion_goal_types_taxonomy`:
   - Input: `SELECT DISTINCT tipo_de_gol FROM gols;`
   - Assertion: All goal types strictly adhere to standard taxonomy (`normal`, `penalti`, `falta`, `contra`, `cabeca`). No unparsed HTML or raw scraped string artifacts.
4. `test_t1_ingestion_lineups_foreign_keys`:
   - Input: `SELECT COUNT(*) FROM escalacoes e LEFT JOIN partidas p ON e.id_partida = p.id_partida WHERE p.id_partida IS NULL;`
   - Assertion: 0 orphan lineups (`count == 0`).
5. `test_t1_ingestion_brasileirao_points_era_coverage`:
   - Input: Verify Serie A 2003-2023 season schedules in database.
   - Assertion: All rounds have registered scorelines with non-null `gols_mandante` and `gols_visitante`.

#### Feature 4: Career Reconcile & Legend Profiles
1. `test_t1_reconcile_neymar_career_integrity`:
   - Input: GET `/api/jogadores/perfil?id=352` (Neymar).
   - Assertion: Profile returns accurate historical career breakdown, `jogos_carreira_oficiais == 719`, authentic goal average (not forced 1.00), and legitimate club stints.
2. `test_t1_reconcile_fred_historical_goals`:
   - Input: Querying Fred (ID 6051).
   - Assertion: Consolidated career totals (`total_gols > 213`, `jogos_carreira_oficiais == 822`), duplicate split records (IDs 15354, 19126) unified or referenced.
3. `test_t1_reconcile_luis_fabiano_spurious_club_clean`:
   - Input: GET `/api/jogadores/perfil?id=9033`.
   - Assertion: Zero foreign spurious clubs (River Plate, Universidad de Chile) in `clubes` and `historico_clubes`. Authentic career average = 0.53.
4. `test_t1_reconcile_edmundo_and_zico_totals`:
   - Input: Querying Edmundo (ID 5168) and Zico (ID 13953).
   - Assertion: `jogos_carreira_oficiais` > `total_gols`, `acervo_parcial: True`, honest label `"Jogos c/ Gol"`, authentic career averages (0.68 for Zico).
5. `test_t1_reconcile_no_systemwide_forced_one_ratio`:
   - Input: `SELECT COUNT(*) FROM jogadores_estatisticas WHERE total_gols > 10 AND jogos_carreira_oficiais > total_gols * 1.5 AND total_jogos = total_gols;`
   - Assertion: Count is **0** (specifically resolving Marcos ID 9488 homonym anomaly).

---

### Tier 2: Boundary & Corner Cases
1. `test_t2_gateway_exact_timeout_boundary`:
   - Test remote response delaying exactly 2490ms (should succeed) vs 2510ms (should trigger circuit breaker fallback).
2. `test_t2_gateway_malformed_remote_json`:
   - Mock remote gateway returning HTTP 200 with truncated or invalid JSON body.
   - Assertion: Catches `json.JSONDecodeError` and gracefully falls back to local SQLite without 500.
3. `test_t2_ingestion_extra_time_minutes_parsing`:
   - Test match sheet ingestion with minutes formatted as `45+2'`, `90+4'`, `105'`, `120+3'`.
   - Assertion: Minute parsed as integer (47, 94, 105, 123) with stoppage time metadata preserved.
4. `test_t2_ingestion_penalty_shootouts_exclusion`:
   - Test knockout cup matches tied 1x1 that went to penalty shootouts (e.g. 5x4 pens).
   - Assertion: Shootout penalties are NOT counted as regulation goals in `gols` table; regulation score 1x1 remains canonical.
5. `test_t2_ingestion_triple_substitution_same_minute`:
   - Test ingestion of 3 substitutions occurring simultaneously at minute 60.
   - Assertion: Lineup state transitions in `escalacoes` correctly record `saiu_minuto: 60` and `entrou_minuto: 60` without unique constraint collisions.
6. `test_t2_gateway_concurrency_load_burst`:
   - 100 simultaneous async requests to `/api/overview` and `/api/partidas`.
   - Assertion: Zero `sqlite3.OperationalError: database is locked`, p95 < 200ms.
7. `test_t2_homonym_athlete_disambiguation`:
   - Disambiguate goalkeeper Marcos (Palmeiras ID 9488) from historical attackers (Marcos Sport 1973, Marcos Coritiba 1977).
   - Assertion: Goalkeeper Marcos has 0 historical outfield goals; historical goals linked to distinct player IDs.
8. `test_t2_local_sqlite_storage_hard_cap`:
   - Assertion: `os.path.getsize('data/futebol.db') < 94 * 1024 * 1024` (strictly below 94.0 MB).

---

### Tier 3: Cross-Feature Combinations (Pairwise & Stress)
1. `test_t3_cross_remote_gateway_failure_during_active_ingestion`:
   - Ingestion worker writes to remote store while frontend queries gateway; simulate remote connection drop.
   - Assertion: Reader immediately falls back to local SQLite snapshot without blocking or crashing on lock files.
2. `test_t3_cross_cache_invalidation_upon_match_enrichment`:
   - Ingest goal for partida ID 20240101; immediately query `/api/partidas/detalhe?id=20240101` through gateway.
   - Assertion: TTLCache or cache-tag is invalidated; gateway returns the newly ingested goal rather than stale cache.
3. `test_t3_cross_career_reconcile_under_fallback_mode`:
   - Calculate athlete career metrics when remote gateway is down.
   - Assertion: Logic executes consistently against local fallback SQLite, producing valid radar and honest catalog labels.
4. `test_t3_cross_gateway_high_concurrency_during_sqlite_wal_checkpoint`:
   - 50 concurrent read requests while `PRAGMA wal_checkpoint(TRUNCATE)` executes on local fallback.
   - Assertion: All reads succeed with zero lock timeouts.
5. `test_t3_cross_network_flapping_and_circuit_breaker_half_open`:
   - Remote network flaps (UP $\rightarrow$ DOWN $\rightarrow$ UP $\rightarrow$ DOWN every 500ms).
   - Assertion: Circuit breaker enters HALF-OPEN state, protects user latency, and never drops requests.

---

### Tier 4: Real-World Scenarios (End-to-End User Journeys)
1. `test_t4_cenario_athlete_career_deep_dive`:
   - Full journey: User searches "Neymar" $\rightarrow$ opens profile $\rightarrow$ navigates through club seasons $\rightarrow$ renders PES Radar $\rightarrow$ loads xG shot charts.
   - Assertion: All data points resolve in < 200ms, zero null fields, honest catalog label visible.
2. `test_t4_cenario_dashboard_cold_boot_under_total_remote_outage`:
   - Complete DNS/network outage of remote gateway.
   - User opens FutStats dashboard home (`/api/overview`, `/api/confrontos`, `/api/classificacao`).
   - Assertion: Dashboard renders completely from local fallback within 300ms, displaying discreet "Modo Offline Resiliente" badge, 0 console errors.
3. `test_t4_cenario_match_day_live_ingestion_and_gateway_sync`:
   - Simulates Sunday matchday: 10 Serie A matches ingested in batch.
   - Assertion: Remote gateway syncs standings, top scorers update, and `auditar_integridade_dados.py` passes 12/12 with 0 anomalies.
4. `test_t4_cenario_historic_copa_do_brasil_knockout_navigation`:
   - User traverses 1999 to 2024 Copa do Brasil match sheets, inspecting line-ups and goalscorers.
   - Assertion: All match sheets load with complete minutes, author names, and referee records from decoupled store.
5. `test_t4_cenario_production_acceptance_master_gate`:
   - Master pre-flight sequence:
     1. Storage check: `data/futebol.db` < 94.0 MB.
     2. Relational audit: `python scripts/auditar_integridade_dados.py` $\implies$ 12/12 OK, 0 anomalies.
     3. Mathematical regression: `.venv/bin/pytest tests/test_model_evals.py` $\implies$ 22/22 passed.
     4. Frontend build: `npm run build --prefix frontend` $\implies$ exit code 0.

---

## 4. Test Runner Structure & Specifications for `TEST_INFRA.md` and `TEST_READY.md`

### Proposed Architecture for `TEST_INFRA.md`
- **Framework**: `pytest 9.x` with `pytest-asyncio`, `pytest-benchmark`, `unittest.mock`.
- **Target File**: `tests/test_e2e_decoupled.py` (or augmenting `tests/test_e2e_futstats.py`).
- **Standardized Markers** in `pytest.ini`:
  ```ini
  [pytest]
  testpaths = tests
  python_files = test_*.py
  markers =
      tier1: Tier 1 - Feature Coverage tests
      tier2: Tier 2 - Boundary and Corner case tests
      tier3: Tier 3 - Cross-Feature Combination tests
      tier4: Tier 4 - Real-World Application Scenario tests
      gateway: Database Decoupling & Proxy Gateway tests
      fallback: Resilient Local Fallback tests
      ingestion: Massive Historical Goals Ingestion tests
      reconcile: Career Reconcile & Legend Profiles tests
      governance: Relational Governance & Vercel Storage Cap tests
  ```
- **Standardized Fixtures**:
  - `remote_gateway_mock`: Simulates HTTP remote gateway responses, latency injection, and failure modes.
  - `fallback_db_conn`: Read-only connection to local SQLite fallback snapshot.
  - `decoupled_client`: Hybrid test client configured to test Gateway routing and transparent fallback.
  - `sample_historical_match_sheet`: Standardized match sheet payload for ingestion verification.

### Verification Criteria for `TEST_READY.md`
- **Pre-Flight Execution Gate (Must pass 100% prior to any PR/deploy)**:
  ```bash
  # Step 1: Vercel Storage Hard Cap Check (< 94.0 MB)
  python3 -c "import os; sz=os.path.getsize('data/futebol.db')/(1024*1024); assert sz < 94.0, f'Storage exceeded: {sz:.2f}MB'; print(f'Storage OK: {sz:.2f}MB < 94.0MB')"

  # Step 2: Data Integrity & Relational Governance Audit (12/12 OK, 0 anomalies)
  python3 scripts/auditar_integridade_dados.py

  # Step 3: Mathematical Model Evaluation & Dixon-Coles Regressions (22/22 passed)
  ./.venv/bin/pytest tests/test_model_evals.py -v

  # Step 4: E2E Decoupled Test Suite
  ./.venv/bin/pytest tests/test_e2e_futstats.py -v

  # Step 5: Frontend Production Build
  npm run build --prefix frontend
  ```

---

## 5. Caveats

1. **Pre-existing Homonym Anomaly in Test Suite**:
   - `test_t1_r1_db_no_forced_jogos_equals_gols_with_divergent_career` in `tests/test_e2e_futstats.py` currently fails on athlete 9488 ("Marcos") due to a pre-existing homonym collision with 11 historical goals from 1963-2001. This is not a failure of our investigation, but rather an active bug that the Milestone 2 implementers must resolve.
2. **Read-Only Scope**:
   - In accordance with the Explorer mandate, no production code, SQLite databases, or test files were modified during this investigation.
3. **Remote Infrastructure Endpoint**:
   - The exact endpoint configuration for the remote database gateway (Oracle Cloud VM IP vs Turso URL vs Cloudflare D1) will be finalized by Explorer 1 (`teamwork_preview_explorer_survey2_1`). The E2E testing track is designed to accept an environment variable `FUTSTATS_REMOTE_GATEWAY_URL` with mock capability.

---

## 6. Conclusion

1. **Relational Governance (`scripts/auditar_integridade_dados.py`)**:
   - The database currently passes all 12 relational integrity rules with **100% OK** and **0 anomalies** across all 115,625 matches. The script possesses robust auto-repair logic for rules 1, 5, 6, 8, 9, 10, and 12, and strict gating for rules 2, 3, 4, 7, and 11. It is fully ready to serve as the continuous regression gate for historical ingestion.
2. **Mathematical Calibrations (`tests/test_model_evals.py`)**:
   - The Dixon-Coles, probability normalization, fair odds, and +EV gating suite executes cleanly, with **22/22 tests passing in 4.79s**.
3. **Frontend Production Build**:
   - Vite builds cleanly into `frontend/dist` with **exit code 0 in 6.70s**. Bundle size is 635 kB (145 kB gzip), ready for production deployment.
4. **Decoupling Urgency**:
   - With `data/futebol.db` at 84.56 MB and 80,331 historical matches pending ingestion, local headroom is limited to 9.44 MB. Architectural decoupling via Remote Gateway with Resilient Local Fallback is essential.
5. **E2E Testing Architecture**:
   - The 4-Tier E2E Testing Track provides exhaustive coverage:
     - Tier 1: 20 feature coverage tests across Gateway, Fallback, Ingestion, and Career Reconcile.
     - Tier 2: 8 boundary and corner cases.
     - Tier 3: 5 cross-feature and stress combinations.
     - Tier 4: 5 real-world production scenarios and acceptance gates.

---

## 7. Verification Method

To independently verify all findings in this report, execute the following commands in the project root:

```bash
# 1. Verify 12/12 relational integrity rules with 0 anomalies:
python3 scripts/auditar_integridade_dados.py

# 2. Verify all 22 mathematical evaluation tests:
./.venv/bin/pytest tests/test_model_evals.py -v

# 3. Verify clean frontend production build with exit code 0:
npm run build --prefix frontend

# 4. Verify SQLite storage headroom:
python3 -c "import os; sz=os.path.getsize('data/futebol.db')/(1024*1024); print(f'Size: {sz:.2f} MB (Limit: 94.0 MB, Headroom: {94.0-sz:.2f} MB)')"

# 5. Inspect existing E2E test suite behavior:
./.venv/bin/pytest tests/test_e2e_futstats.py -q
```
