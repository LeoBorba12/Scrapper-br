# Handoff Report — Reviewer M3-2 (Code Quality & Regressions Reviewer)

**Reviewer Identity**: Reviewer M3-2 (`teamwork_preview_reviewer_m3_2`)  
**Parent Agent**: `9c2d948a-bd66-4e27-83b1-9e8d50e60942`  
**Milestone**: M3 (Motores Matemáticos de Ratings, xG & Backend APIs)  
**Date**: 2026-10-30  
**Verdict**: **APPROVE**  
**Integrity Status**: **CLEAN (0 Integrity Violations Detected)**  

---

## 1. Observation

Direct, independent observations of the repository and database state:

### 1.1 Automated Test Suites Execution
1. **Full Acceptance E2E Suite (`tests/test_e2e_futstats.py`)**:
   - Command: `./.venv/bin/pytest tests/test_e2e_futstats.py`
   - Output: `50 passed in 6.12s` (Exit code: 0).
   - All 4 Tiers passed completely (Tier 1 Feature Coverage, Tier 2 Boundary/Corner, Tier 3 Cross-Feature Combinations, Tier 4 Real-World Application Scenarios).

2. **Continuous Predictive Evaluation Suite (`tests/test_model_evals.py`)**:
   - Command: `./.venv/bin/pytest tests/test_model_evals.py`
   - Output: `22 passed in 0.27s` (Exit code: 0).
   - Zero mathematical regression on Dixon-Coles bivariate Poisson models, fair odds calibration, and +EV validation.

3. **Relational Database Integrity Audit (`scripts/auditar_integridade_dados.py`)**:
   - Command: `./.venv/bin/python scripts/auditar_integridade_dados.py`
   - Output:
     ```json
     {
       "timestamp": "2026-10-30 18:24:13",
       "total_partidas": 115625,
       "inconsistencias_encontradas": 0,
       "inconsistencias_reparadas": 0,
       "regras": 12 rules evaluated, all status: "OK"
     }
     ```
   - 12/12 rules OK, 0 relational inconsistencies across 115,625 matches.

4. **Frontend Production Build (`frontend`)**:
   - Command: `npm run build --prefix frontend`
   - Output: `✓ 1601 modules transformed. dist/index.html 0.86 kB, dist/assets/index-NiCB4jn5.js 617.39 kB. ✓ built in 17.48s` (Exit code: 0).

### 1.2 Database Storage and Relational Stats Verification (`data/futebol.db`)
1. **File Size Compliance**:
   - Command: `stat -c "%s bytes" data/futebol.db`
   - Result: `88,637,440 bytes` = `84.53 MB`.
   - Vercel Limit: `94.0 MB` (`98,566,144 bytes`).
   - Headroom: **9.47 MB** below hard ceiling.

2. **Total Goals Relational Synchronization**:
   - Query:
     ```sql
     WITH gols_count AS (
         SELECT id_jogador, COUNT(*) as cnt
         FROM gols
         WHERE id_jogador IS NOT NULL AND id_jogador > 0
         GROUP BY id_jogador
     )
     SELECT COUNT(*) FROM jogadores_estatisticas je
     JOIN gols_count gc ON je.id_jogador = gc.id_jogador
     WHERE je.total_gols != gc.cnt;
     ```
   - Result: **0 discrepancies** across all players.
   - Athletes with `total_gols > 0` but 0 goals in `gols`: **0**.
   - Athletes with `total_gols == 0` but having goals in `gols`: **0**.
   - Discrepancies in table `jogadores`: **0**.

3. **Alex Cabeção (ID 2373) Profile Verification**:
   - In `jogadores_estatisticas`: `(id: 2373, nome: 'Alex', total_gols: 146, total_jogos: 141, media_gols_por_jogo: 1.04, gols_carreira_oficiais: 391, jogos_carreira_oficiais: 962)`.
   - In `jogadores`: `total_gols: 146`.
   - In `gols`: `COUNT(*) = 146`.
   - API `/api/jogadores/perfil?id=2373`:
     - `total_gols`: `146`
     - `jogos_registrados`: `141`
     - `media_gols`: `0.41` (authentic career average `391 / 962`)
     - `acervo_parcial`: `True`
     - `jogos_rotulo`: `"Jogos c/ Gol"`

4. **Luís Fabiano (ID 9033) Profile Verification**:
   - Clubs: `['Vasco', 'São Paulo', 'Ponte Preta']` (zero Conmebol foreign clubs).
   - API `/api/jogadores/perfil?id=9033`:
     - `media_gols`: `0.53` (authentic career average `317 / 599`)
     - `acervo_parcial`: `True`
     - `jogos_rotulo`: `"Jogos c/ Gol"`
     - `jogos_registrados`: `158`
     - `analytics_xg.perfil_clinico`: `"Clínico de Elite"`
     - `analytics_xg.delta_xg`: `38.3` (positive conversion)
     - `radar_pes.ovr`: `81` (bounded in `[40, 99]`)

---

## 2. Logic Chain

1. **Absence of Integrity Violations**:
   - Checked source code in `backend/app.py`, `backend/calculo_player_rating.py`, and `backend/calculo_xg_discreto.py` for hardcoded conditionals targeting athlete IDs (e.g. `9033`, `2373`, `13953`, `12212`). Grep confirmed 0 athlete IDs or names hardcoded into calculation paths.
   - Verified that the formulas in `calculo_player_rating.py` implement authentic mathematics: positional weight matrix, marginal goal decay with exponent 0.85, asymmetric hyperbolic tangent (`tanh`) compression bounded in `[3.0, 10.0]`.
   - Verified that `calculo_xg_discreto.py` uses authentic Opta-calibrated discrete matrices, penalty weighting (`0.760`), and shot conversion classification.
   - Result: Work product is free of facades, dummy logic, or test-cheating bypasses.

2. **Feature 8 (Player Rating Integration)**:
   - When an athlete exists in `atleta_sofascore_ratings` (e.g. Gabriel Barbosa, Pedro, Neymar, Zico, Romário), the endpoint returns `fonte: "sofascore"`.
   - When absent (19,000+ athletes), the dynamic fallback loops over local matches, normalizes positions (including defense/goalkeeper aliases like `"keeper"`, `"defen"`), runs `calcular_nota_partida_sofascore`, and outputs `fonte: "futstats_scouting"` with realistic ratings (tested on Paulinho ID 1: 6.79, Paulinho ID 2: 6.87, Paulinho McLaren ID 3: 8.08).
   - Result: Feature 8 satisfies all requirements.

3. **Feature 9 (Discrete Opta xG Engine & Clinical Profile)**:
   - Replaced old inline `1.08 * gols` formula that forced negative delta xG on all goalscorers.
   - Strikers with superior conversion (Luís Fabiano, Romário, Rogério Ceni) now correctly achieve positive Delta xG and classification as `"Clínico de Elite"`.
   - Goalkeepers with 0 goals return `0.0 xG` and `"Neutro (Amostra Insuficiente)"` without division by zero.
   - Result: Feature 9 satisfies all requirements.

4. **Feature 10 (Radar Pentagonal PES 5 Axes & OVR)**:
   - Hardened `_calcular_radar_pes` with defensive conversion, NaN protection, and a clamp helper guaranteeing integer scores strictly within `[40, 99]`.
   - Verified across attackers, midfielders, goalkeepers, and nonexistent athletes: 0 nulls, 0 crashes.
   - Result: Feature 10 satisfies all requirements.

5. **Feature 11 (Honest Label "Jogos c/ Gol" & Authentic Career Average)**:
   - For athletes where local catalog matches are fewer than official career games or equal to/less than total goals, `acervo_parcial` is set to `True`, `jogos_rotulo` to `"Jogos c/ Gol"`, and `media_gols` to the authentic career average (`0.53` for Luís Fabiano, `0.41` for Alex Cabeção, `0.68` for Zico, `0.77` for Romário).
   - Eliminates the historical distortion of 1.00 gol/jogo.
   - Result: Feature 11 satisfies all requirements.

6. **Relational Synchronization & Storage Limits**:
   - `total_gols` across all 19,000+ athletes is 100% in sync with `COUNT(gols)` in SQLite.
   - Database size is 84.53 MB, well below the 94.0 MB limit.
   - All 50 E2E tests, 22 predictive tests, and 12 relational audit rules pass with zero errors.

---

## 3. Caveats

- "No caveats." All items in Milestone M3 scope have been independently executed, verified, and stress-tested.
- Visual presentation of badges and elimination of 1.00 leaks in frontend timeline/bar chart/card generator are scheduled for Milestone M4 as planned in `PROJECT.md`.

---

## 4. Conclusion & Quality Review

### Quality Review Summary
**Verdict**: **APPROVE**

### Findings
- **Critical / Major / Minor Findings**: None. Code is well-structured, backward-compatible, defensively shielded against `None` values and zero-division, and free of regressions.

### Verified Claims
- `data/futebol.db total_gols` 100% in sync with `COUNT(gols)` → verified via SQLite queries → **PASS** (0 discrepancies)
- Alex Cabeção (ID 2373) stats `total_gols = 146` and `total_jogos = 141` → verified via DB and API → **PASS**
- Database size < 94.0 MB → verified via `stat` (84.53 MB) → **PASS**
- `tests/test_e2e_futstats.py` 50/50 passing → verified via pytest → **PASS**
- `tests/test_model_evals.py` 22/22 passing → verified via pytest → **PASS**
- `scripts/auditar_integridade_dados.py` 12/12 rules OK → verified via python script → **PASS**
- `npm run build --prefix frontend` exit code 0 → verified via Vite build → **PASS**

### Coverage Gaps
- None within Milestone M3 scope.

### Unverified Items
- None.

---

## 5. Adversarial Review & Stress Test Report

### Challenge Summary
**Overall Risk Assessment**: **LOW**

### Adversarial Challenges Tested:
1. **Challenge 1: Zero-Division in xG and Radar for Zero-Goal Athletes and Goalkeepers**:
   - Stress tested athletes with 0 goals and 0 shots (e.g. Mycael ID 2066, Éverson ID 14155, Cesar ID 14712).
   - Result: Cleanly returned `xg_acumulado: 0.0`, `delta_xg: 0.0`, `perfil_clinico: 'Neutro (Amostra Insuficiente)'`. Radar PES generated valid scores `[40, 99]` with 0 exceptions. **PASS**.
2. **Challenge 2: Dynamic Scouting Rating on Unindexed Athletes**:
   - Stress tested athletes without rows in `atleta_sofascore_ratings`.
   - Result: Dynamic fallback cleanly computed ratings using `calcular_nota_partida_sofascore` and tagged `fonte: 'futstats_scouting'`. **PASS**.
3. **Challenge 3: Nonexistent Player ID Request**:
   - Stress tested request `/api/jogadores/perfil?id=99999999`.
   - Result: Gracefully handled without unhandled 500 error; returns valid JSON payload. **PASS**.
4. **Challenge 4: Integrity Violation / Facade Check**:
   - Searched for hardcoded branching or mock values in calculation pipelines.
   - Result: 0 hardcoded cheats found. Genuine mathematical calculation verified. **PASS**.

---

## 6. Verification Method

To independently reproduce this verification:

```bash
# 1. Run full E2E test suite
./.venv/bin/pytest tests/test_e2e_futstats.py

# 2. Run predictive evaluation suite
./.venv/bin/pytest tests/test_model_evals.py

# 3. Run relational audit script
./.venv/bin/python scripts/auditar_integridade_dados.py

# 4. Check SQLite file size
stat -c "%s bytes" data/futebol.db

# 5. Check Alex Cabeção and total_gols synchronization
./.venv/bin/python -c "
import sqlite3
conn = sqlite3.connect('data/futebol.db')
c = conn.cursor()
c.execute('SELECT COUNT(*) FROM jogadores_estatisticas je JOIN (SELECT id_jogador, COUNT(*) as cnt FROM gols WHERE id_jogador IS NOT NULL GROUP BY id_jogador) gc ON je.id_jogador = gc.id_jogador WHERE je.total_gols != gc.cnt;')
assert c.fetchone()[0] == 0
c.execute('SELECT total_gols, total_jogos FROM jogadores_estatisticas WHERE id_jogador = 2373;')
row = c.fetchone()
assert row == (146, 141), f'Alex Cabeção row mismatch: {row}'
print('Database verified OK!')
"

# 6. Verify frontend production build
npm run build --prefix frontend
```

### Invalidation Conditions
This approval would be invalidated if:
1. Any test in `test_e2e_futstats.py` fails (< 50/50).
2. Any test in `test_model_evals.py` fails (< 22/22).
3. `auditar_integridade_dados.py` detects any inconsistencies (> 0).
4. `data/futebol.db` exceeds 94.0 MB.
5. Alex Cabeção exhibits goals != 146 or games != 141.
6. Any athlete in `jogadores_estatisticas` exhibits `total_gols != COUNT(gols)`.
