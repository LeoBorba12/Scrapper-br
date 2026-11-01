# Handoff Report: Milestone 2 Adversarial Challenge — Match Sheets & Goals Ingestion

- **Agent**: `teamwork_preview_challenger_m2_r2` (Empirical Adversarial Challenger)
- **Role**: Critic & Specialist (Adversarial stress-testing, bug hunting, oracle verification)
- **Milestone**: Milestone 2 (M2) — Massive Historical Match Sheets and Goals Ingestion
- **Working Directory**: `/mnt/jogos_f/Antigravity_Projetos_e_Ferramentas/Guia profissional/.agents/teamwork/teamwork_preview_challenger_m2_r2`
- **Timestamp**: `2026-11-01T16:15:00Z`
- **Handoff Type**: Hard Handoff (Adversarial Challenge Complete)
- **Explicit Verdict**: **FAIL** (Block until 4 critical data integrity bugs and guard flaws are resolved)

---

## 1. Observation

### 1.1 Ingestion Gate Verification vs Adversarial Suite
Running the worker's regression gates confirmed:
- `scripts/auditar_integridade_dados.py`: reported 12/12 rules OK (0 inconsistencies).
- `tests/test_model_evals.py`: 22/22 tests PASSED.
- `tests/test_proxy_fallback.py`: 20/20 tests PASSED.
- `tests/test_e2e_decoupled.py -k "ingestion"`: 11/11 tests PASSED.
- `data/futebol.db` size: 84.86 MB (88,981,504 bytes), under 94.0 MB.
- Frontend build `npm run build`: code 0.

However, executing the newly constructed empirical adversarial test suite (`tests/test_challenger_m2_r2_adversarial.py`) yielded **6 FAILED and 1 PASSED**:
```bash
.venv/bin/pytest tests/test_challenger_m2_r2_adversarial.py -v
==================================== FAILURES ====================================
FAILED tests/test_challenger_m2_r2_adversarial.py::test_adv_01_no_goals_in_0x0_matches
FAILED tests/test_challenger_m2_r2_adversarial.py::test_adv_02_goal_minutes_within_valid_bounds
FAILED tests/test_challenger_m2_r2_adversarial.py::test_adv_03_no_multi_minute_packed_rows
FAILED tests/test_challenger_m2_r2_adversarial.py::test_adv_04_goal_sum_does_not_exceed_official_score
FAILED tests/test_challenger_m2_r2_adversarial.py::test_adv_05_no_synthetic_or_dummy_filler_athletes
FAILED tests/test_challenger_m2_r2_adversarial.py::test_adv_06_high_concurrency_query_stress
PASSED tests/test_challenger_m2_r2_adversarial.py::test_adv_07_governance_and_regression_baselines
=========================== 6 failed, 1 passed in 17.46s ==========================
```

### 1.2 Specific Empirical Observations

#### Observation O1: 0x0 Matches with Attributed Goals & M2 Ingestion Cross-Contamination
- Total matches with `p.gols_mandante = 0 AND p.gols_visitante = 0` having rows in `gols`: **250 matches**.
- **2 matches were directly contaminated by Milestone 2 ingestion scripts**:
  1. **Match ID 5189**: `2015-08-30` | `Campeonato Brasileiro Série A`: `Grêmio 0 x 0 Coritiba`.
     Contains 4 newly inserted goals (`id_gol` 20324641 to 20324644):
     - `Pedro Tonon Geromel` (Grêmio, `37:00`)
     - `Rafhael Lucas Oliveira da Silva` (Coritiba, `40:00`)
     - `Douglas dos Santos` (Grêmio, `10:00`)
     - `Luan Guilherme de Jesus Vieira` (Grêmio, `+4`)
     *Reality*: On `2015-08-30`, Grêmio drew 0-0 with Coritiba in the Brasileirão at Arena do Grêmio. On `2015-08-27` (3 days earlier), Coritiba played Grêmio in Copa do Brasil (1x3). Because M2's ingestor used a $\le 3$ day jitter window without filtering competition, it matched the 0x0 Brasileirão match and injected the Copa do Brasil goals into it!
  2. **Match ID 6549**: `2019-05-19` | `Campeonato Brasileiro Série A`: `São Paulo 0 x 0 Bahia`.
     Contains 1 newly inserted goal (`id_gol` 20325486):
     - `Jose Elber Pimentel da Silva` (Bahia, `27:00`)
     *Reality*: On `2019-05-19`, São Paulo drew 0-0 with Bahia in Brasileirão Série A at Morumbi. On `2019-05-22` (3 days later), they played in the Copa do Brasil (0-1 Bahia, goal by Élber at 27'). The M2 ingestor injected Élber's Copa do Brasil goal into the 0x0 Brasileirão match!
- In addition, **248 legacy matches** in `partidas` with `0 x 0` contain 1 to 10 goals (e.g. ID 1545 Atlético-MG 0x0 Vasco has 10 goals; ID 156 Cruzeiro 0x0 Atlético-MG has 7 goals).

#### Observation O2: Ingestion Score Guard Flaw in Worker Scripts
In `scripts/ingestor_sumulas_massivo_ogol.py` (line 466) and `scripts/ingerir_cache_ogol_existente.py` (line 307):
```python
# Clamping de scoreline para não inflacionar acima do placar real
if existentes_pid >= expected_goals and expected_goals > 0:
    continue
```
Because of `and expected_goals > 0`, when a match has `expected_goals == 0` (a 0x0 match), this condition evaluates to `False`. The guard fails to trigger, and goals are erroneously injected into 0x0 matches.

#### Observation O3: Multi-Minute Goal Packing Violating 1NF
- Found **1,017 rows** in `gols` where `minuto` contains multiple minutes separated by double spaces (e.g. `'45+3  83'`, `'23  26  40'`, `'32  72'`).
- **23 of these were inserted directly by Milestone 2** in `scripts/ingerir_cache_ogol_existente.py`:
  - `id_gol 20322415` (Match 202523521): Ronaldinho Gaúcho (Atlético) `minuto = '45+3  83'`
  - `id_gol 20322423` (Match 202523551): Jô (Atlético) `minuto = '23  26  40'`
  - `id_gol 20322361` (Match 4247): Éderson Alves (Athletico-PR) `minuto = '32  72'`
  - `id_gol 20322441` (Match 4480): Paulo Baier (Athletico-PR) `minuto = '43  45'`
- Packing multiple goals into a single row causes undercounting of career goals for these athletes and causes `COUNT(gols)` to diverge from `gols_mandante + gols_visitante`.

#### Observation O4: Minute Boundary & Format Violations
- **Minute < 1**: 1 row found (`id_gol = 20263340`, Marcos Vinícius, Botafogo vs Coritiba, ID 6057, `minuto = '0'`).
- **Minute > 130**: 2 rows found:
  - `id_gol = 59191`: `atleta = 'att-'`, `minuto = '24993'`, `clube = 'Guarani'`, match 19940302.
  - `id_gol = 59193`: `atleta = 'att-'`, `minuto = '35802'`, `clube = 'Corinthians'`, match 19940303.
  *Cause*: Match attendance numbers (24,993 and 35,802) from an old RSSSF scraper were parsed as athlete names (`att-` for "attendance") and minutes!

#### Observation O5: Synthetic & Corrupted Filler Athletes
- Found **45 rows** in `gols` with corrupted/placeholder names:
  - 2 rows with `atleta = 'att-'` (attendance numbers 24,993 and 35,802).
  - 43 rows with `atleta = '?'` or `'???'` (e.g. ID 59253 Vasco, ID 59343 Atlético-MG, ID 59765 São Paulo).

#### Observation O6: Goal Sums Exceeding Official Scores
- Across 39,011 matches with detailed goals:
  - **35,812 matches (91.8%)**: exact match (`count(gols) == gols_mandante + gols_visitante`).
  - **2,180 matches (5.6%)**: fewer goals (partial historical coverage).
  - **1,019 matches (2.6%)**: excess goals (`count(gols) > gols_mandante + gols_visitante`).
    - 250 matches have 0x0 official scores but contain 1 to 10 goals.
    - 769 matches have scores $>0$ but contain more goals than the scoreline (e.g. ID 473 Atlético-MG 1x1 Criciúma has 8 goals; ID 20034062 São Paulo 2x2 Santo André has 9 goals).

#### Observation O7: Concurrency Stress Test Latency Bottleneck
- 1,000 queries across 20 concurrent worker threads on `partidas` and `gols`:
  - 0 database locks (`sqlite3.OperationalError`), 0 connection errors, 100% completion.
  - Latency P50: **43.85ms**, but P95: **1,406.46ms** (exceeding the 50ms SLA).
  - *Cause*: Full-table scan and hash aggregation across 105k goals and 111k matches when multiple concurrent threads request cross-table aggregates without an index covering `(gols.id_partida, gols.atleta)`.

---

## 2. Logic Chain

1. **Step 1 (Root Cause of M2 0x0 Ingestion Bug)**:
   - Worker scripts `ingerir_cache_ogol_existente.py` and `ingestor_sumulas_massivo_ogol.py` used `expected_goals = (best_match["gols_mandante"] or 0) + (best_match["gols_visitante"] or 0)`.
   - The guard condition was coded as: `if existentes_pid >= expected_goals and expected_goals > 0: continue`.
   - When a match is 0x0 (`expected_goals == 0`), `expected_goals > 0` is `False`. The condition is never satisfied, so the script bypasses score capping completely (Observation O2).
   - In parallel, fuzzy match lookup `best_dist <= 3` allowed Copa do Brasil matches to match Brasileirão matches occurring 3 days apart between the same clubs (Observation O1).
   - Therefore, goals from Copa do Brasil (Grêmio vs Coritiba and São Paulo vs Bahia) were injected into 0x0 Brasileirão matches.

2. **Step 2 (Root Cause of Multi-Minute Packing Bug)**:
   - `scripts/ingerir_cache_ogol_existente.py` read cached JSONs where multiple minutes were formatted as strings like `"45+3  83"`.
   - Instead of splitting on whitespace to generate discrete goal records, it passed the raw string directly into `INSERT INTO gols ... VALUES (?, ..., minuto_raw, ...)` (Observation O3).
   - This compressed Ronaldinho Gaúcho's brace into 1 row, Jô's hat-trick into 1 row, and Éderson Alves's brace into 1 row, violating the 1-goal-per-row schema invariant.

3. **Step 3 (Root Cause of Minute & Athlete Corruption)**:
   - Historical scrapers imported attendance lines (`att- 24993` and `att- 35802`) and placeholder characters (`?`, `???`) into `gols` (Observations O4, O5).
   - Neither the legacy audit script nor the M2 ingestion scripts had validation bounds (`1 <= minuto <= 130` and `atleta NOT IN ('att-', '?', '???')`).

4. **Step 4 (Root Cause of Scoreline Excess)**:
   - Because 250 matches have 0x0 with goals (Step 1) and 769 matches had duplicate historical scrapers without conflict resolution (Observation O6), 1,019 matches present impossible scoreline-to-goal counts.

5. **Step 5 (Synthesis & Conclusion)**:
   - Because the ingested dataset contains verified bugs introduced directly in Milestone 2 (0x0 matches with cross-competition goals, and multi-minute packed rows), alongside unexpunged synthetic filler (`att-`) and minute boundary violations, Milestone 2 cannot be approved in its current state.

---

## 3. Caveats

1. **Pre-existing Legacy vs M2 Ingestion**:
   - Of the 250 matches with 0x0 and goals, 248 were present in earlier baseline data, and 2 were introduced by M2 scripts.
   - Of the 1,017 multi-minute rows, 994 were pre-existing, and 23 were introduced by M2 scripts.
   - The 2 `att-` synthetic goals and 43 `?` placeholders were from older RSSSF historical imports.
   - However, M2's mandate was to ensure data authenticity and relational integrity. Introducing new anomalies and preserving existing corruptions violates this mandate.
2. **Read-Only Constraint**:
   - As an Adversarial Challenger, I did not modify implementation code or database rows. The reproduction suite `tests/test_challenger_m2_r2_adversarial.py` provides exact regression tests for the worker to fix.

---

## 4. Conclusion & Explicit Verdict

### **VERDICT: FAIL**

Milestone 2 is **NOT APPROVED** until the following required remedies are implemented:

### Required Action Items for Worker / Orchestrator:
1. **Fix Ingestion Score Guard**:
   In `scripts/ingestor_sumulas_massivo_ogol.py` and `scripts/ingerir_cache_ogol_existente.py`:
   Change:
   ```python
   # INCORRECT:
   if existentes_pid >= expected_goals and expected_goals > 0:
       continue
   # CORRECT:
   if existentes_pid >= expected_goals:
       continue
   ```
2. **Enforce Competition Filtering during Match Resolution**:
   Ensure `norm_comp in p["campeonato"]` so Copa do Brasil match sheets do not contaminate Brasileirão matches scheduled within $\pm 3$ days.
3. **Purge Erroneous Goals in 0x0 Matches**:
   Delete the Copa do Brasil goals erroneously injected into match 5189 (Grêmio 0x0 Coritiba) and match 6549 (São Paulo 0x0 Bahia). Settle or reconcile the remaining 248 0x0 matches.
4. **Split Multi-Minute Goal Rows into Atomic Records**:
   Parse space-separated minutes (`"45+3  83"`) into discrete rows in `gols` so that Ronaldinho Gaúcho, Jô, and Éderson Alves receive their proper individual goal records and career totals.
5. **Expunge Corrupted Scraper Artifacts**:
   Delete `id_gol` 59191 and 59193 (`atleta = 'att-'`, minutes 24993 and 35802). Fix or resolve `atleta IN ('?', '???')` and `minuto = '0'`.

---

## 5. Verification Method

To independently reproduce the adversarial findings and verify the failures, run:

```bash
# 1. Run the Empirical Adversarial Suite (Expected: 6 FAILED, 1 PASSED)
.venv/bin/pytest tests/test_challenger_m2_r2_adversarial.py -v

# 2. Inspect the 2 M2-contaminated 0x0 matches:
.venv/bin/python3 -c "
import sqlite3
c = sqlite3.connect('data/futebol.db').cursor()
c.execute('''
    SELECT p.id_partida, p.data, p.mandante, p.visitante, p.gols_mandante, p.gols_visitante, g.id_gol, g.atleta, g.minuto
    FROM partidas p JOIN gols g ON p.id_partida = g.id_partida
    WHERE p.id_partida IN (5189, 6549)
''')
for r in c.fetchall():
    print(r)
"

# 3. Inspect multi-minute packed rows inserted in M2:
.venv/bin/python3 -c "
import sqlite3
c = sqlite3.connect('data/futebol.db').cursor()
c.execute('SELECT id_gol, id_partida, atleta, clube, minuto FROM gols WHERE id_gol >= 20320000 AND minuto LIKE \"%  %\"')
for r in c.fetchall():
    print(r)
"

# 4. Invalidation Condition:
# When fixes are applied:
# - test_adv_01_no_goals_in_0x0_matches must PASS (0 anomalies)
# - test_adv_02_goal_minutes_within_valid_bounds must PASS (0 anomalies)
# - test_adv_03_no_multi_minute_packed_rows must PASS (0 packed rows)
# - test_adv_04_goal_sum_does_not_exceed_official_score must PASS
# - test_adv_05_no_synthetic_or_dummy_filler_athletes must PASS (0 bogus athletes)
```
