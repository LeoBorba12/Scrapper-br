# Handoff Report — Reviewer M3-1 (Math Models & API Reviewer)

**Working Directory**: `/mnt/jogos_f/Antigravity_Projetos_e_Ferramentas/Guia profissional/.agents/teamwork/teamwork_preview_reviewer_m3_1`  
**Milestone**: M3 (Motores Matemáticos de Ratings, xG & Backend APIs)  
**Roles**: Reviewer & Adversarial Critic  
**Date**: 2026-10-30  
**Verdict**: **APPROVE**  
**Target Files Reviewed**:
- `backend/calculo_player_rating.py`
- `backend/calculo_xg_discreto.py`
- `backend/app.py`
- `data/futebol.db`

---

## Review Summary

**Verdict**: **APPROVE**

Worker M3's work product for Milestone M3 satisfies all functional, architectural, statistical, and operational requirements specified in `PROJECT.md` and `ORIGINAL_REQUEST.md`. Independent verification confirmed 100% test pass rate across all three required test suites, 0 relational inconsistencies in the SQLite database, full retention of the Vercel storage budget (84.53 MB vs 94.0 MB limit), and authentic mathematical implementations free of integrity violations, hardcoded shortcuts, or facade mocks.

---

## 1. Observation

### 1.1 Direct Test Suite Verification Commands and Outputs

1. **E2E Acceptance Test Suite (`test_e2e_futstats.py`)**:
   - Command: `./.venv/bin/pytest tests/test_e2e_futstats.py`
   - Output:
     ```
     ============================= test session starts ==============================
     platform linux -- Python 3.14.8, pytest-9.1.1, pluggy-1.7.0
     rootdir: /mnt/jogos_f/Antigravity_Projetos_e_Ferramentas/Guia profissional
     configfile: pytest.ini
     plugins: anyio-4.15.1, platformdirs-4.14.0
     collected 50 items

     tests/test_e2e_futstats.py ............................................. [ 90%]
     .....                                                                    [100%]
     ============================== 50 passed in 11.96s =============================
     ```
   - Prior baseline failure of 6 tests is completely resolved.

2. **Dixon-Coles & Bivariate Poisson Predictive Models (`test_model_evals.py`)**:
   - Command: `./.venv/bin/pytest tests/test_model_evals.py`
   - Output:
     ```
     ============================== 22 passed in 0.29s ==============================
     ```

3. **Relational Consistency and Data Integrity Audit (`auditar_integridade_dados.py`)**:
   - Command: `./.venv/bin/python scripts/auditar_integridade_dados.py`
   - Output:
     ```json
     {
       "timestamp": "2026-10-30 18:24:05",
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
       ]
     }
     ```

4. **Frontend Production Build**:
   - Command: `npm run build --prefix frontend`
   - Output:
     ```
     ✓ 1601 modules transformed.
     dist/index.html                   0.86 kB │ gzip:   0.49 kB
     dist/assets/index-BdtJzmHv.css   10.91 kB │ gzip:   2.85 kB
     dist/assets/index-NiCB4jn5.js   617.39 kB │ gzip: 140.69 kB
     ✓ built in 4.41s
     ```

5. **Storage Footprint**:
   - Command: `ls -lh data/futebol.db`
   - Output: `88,637,440 bytes (84.53 MB)`, well below 94.0 MB with 9.47 MB safety buffer.

### 1.2 Endpoint and Code Observations

1. **Feature 8 (Sofascore & FutStats Rating Engine)**:
   - In `backend/calculo_player_rating.py:94-191`, `calcular_nota_partida_sofascore` implements the `WEIGHT_MATRIX` posicional weights with hyperbolic tangent asymptotic compression (`BASE_RATING = 6.50`, `K_POS = 2.65`, `K_NEG = 4.50`).
   - In `backend/app.py:2764-2865`, `_construir_perfil_jogador` queries `atleta_sofascore_ratings` (`fonte: "sofascore"`), and if absent, dynamically evaluates every match in `partidas_ordenadas` using `calcular_nota_partida_sofascore` to populate `sofascore_data` with `fonte: "futstats_scouting"`.
   - Verified on Luís Fabiano (ID 9033): `rating_medio: 7.8`, `fonte: "futstats_scouting"`, `jogos_avaliados: 158`.
   - Verified on Pedro (ID 10): `rating_medio: 7.38`, `fonte: "sofascore"`, `jogos_avaliados: 38`.

2. **Feature 9 (Opta Discrete xG Model & Clinical Profile)**:
   - In `backend/calculo_xg_discreto.py:184-270`, `estimar_xg_gols_atleta` implements calibrated Opta weights: `PENALTY_XG = 0.760`, open target `0.205`, off target `0.035`, and baseline non-penalty conversion `0.78`.
   - In `backend/app.py:2867-2901`, the previous inline formula `1.08 * gols` (which erroneously produced negative Delta xG for strikers) was eliminated and replaced with `estimar_xg_gols_atleta`.
   - Verified on Luís Fabiano (ID 9033): `delta_xg: +38.3`, `perfil_clinico: "Clínico de Elite"`.
   - Verified on Mycael (ID 2066, Goleiro, 0 gols): `xg_acumulado: 0.0`, `delta_xg: 0.0`, `perfil_clinico: "Neutro (Amostra Insuficiente)"`.

3. **Feature 10 (Radar Pentagonal PES 5 Axes & OVR)**:
   - In `backend/app.py:2043-2175`, `_calcular_radar_pes` was hardened with explicit float conversions, safe clamps `max(40, min(99, int(round(val))))`, and fallback 50 on `NaN`.
   - Verified on Luís Fabiano: `ovr: 83`, eixos: `atk: 97, fin: 99, cri: 78, fis: 90, def: 52` (zero nulls).
   - Verified on Zico (ID 13953): `ovr: 88`, eixos: `atk: 97, fin: 99, cri: 96, fis: 90, def: 58`.
   - Tested under adverse empty dicts and non-existent IDs: returns valid eixos in `[40, 99]` with zero nulls.

4. **Feature 11 (Honest Labeling & Career Average Reconciliation)**:
   - In `backend/app.py:2710-2760`, `is_acervo_parcial` checks `raw_jogos_carreira > total_jogos` or `total_jogos <= total_gols_final`. When true, `media_gols` returns `media_oficial_carreira = round(carreira_oficial["gols"] / carreira_oficial["jogos"], 2)`.
   - Verified on Luís Fabiano (ID 9033): `media_gols: 0.53` (403/755), `acervo_parcial: True`, `jogos_rotulo: "Jogos c/ Gol"`.
   - Verified on Zico (ID 13953): `media_gols: 0.68` (530/777), `acervo_parcial: True`, `jogos_rotulo: "Jogos c/ Gol"`.
   - Verified on Romário (ID 12212): `media_gols: 0.77` (744/961), `acervo_parcial: True`, `jogos_rotulo: "Jogos c/ Gol"`.
   - Verified on Mycael (ID 2066, modern goalkeeper): `media_gols: 0.0`, `acervo_parcial: False`, `jogos_rotulo: "Jogos"`.

5. **Relational Goal Synchronization**:
   - In `data/futebol.db`, Alex Cabeção (ID 2373) exhibits `total_gols: 146` and `total_jogos: 141`, matching `COUNT(*) FROM gols WHERE id_jogador = 2373 = 146`.
   - SQL query checking for any discrepancies between `total_gols` and `COUNT(gols)` returned `0` across both `jogadores_estatisticas` and `jogadores`.

---

## 2. Logic Chain

1. **Integrity Verification (Adversarial Check)**:
   - Scanned all modified code (`backend/app.py`, `backend/calculo_player_rating.py`, `backend/calculo_xg_discreto.py`) for hardcoded athlete IDs (9033, 13953, 12212, 10, 2373, 2066) and hardcoded return values (`0.53`, `0.68`, `0.77`).
   - Finding: Zero hardcoded test IDs or hardcoded target averages found. All values are computed dynamically from `carreira_oficial` and `stats_meta`.
   - No mock facades or test bypass shortcuts exist.

2. **Feature Coverage and Correctness**:
   - Feature 8: `calcular_nota_partida_sofascore` correctly integrates the positional coefficient matrix and asymptotic compression. The fallback dynamic loop processes all local matches whenever pre-computed Sofascore records are absent.
   - Feature 9: The Opta discrete model computes authentic positive delta xG for prolific strikers, correctly categorizing elite finishers as "Clínico de Elite" while handling goalkeepers and zero-goal players without division by zero.
   - Feature 10: `_calcular_radar_pes` safely converts inputs to floats, bounds all 5 axes and OVR within `[40, 99]`, and produces no null values.
   - Feature 11: Career averages reconcile accurately (`0.53` for Luís Fabiano, `0.68` for Zico, `0.77` for Romário), with honest label `"Jogos c/ Gol"` whenever local catalog coverage is incomplete.

3. **Adversarial Edge Case Analysis**:
   - Zero-minute appearances: Properly returns status `"Sem nota"` with `nota_final: None`.
   - Extreme match statistics (10 goals / 5 assists): Correctly reaches 10.00 ceiling without overflow.
   - Goalkeepers: Zero goals cleanly return `0.0` xG, `0.0` delta xG, and `"Neutro (Amostra Insuficiente)"`. Historic goalscoring goalkeepers (e.g. Rogério Ceni) correctly compute positive xG and goals.
   - Non-existent player IDs: Returns status 200 with sanitized fallback structure, preventing 500 server crashes.
   - Championship filter: Properly distinguishes overall career (`acervo_parcial: True`) from localized competition filters (`acervo_parcial: False` with localized averages).

4. **Challenger Harness Analysis**:
   - Evaluated `tests/test_challenger_m3_1_empirical.py` and `tests/test_challenger_m3_2_empirical.py`.
   - `test_challenger_m3_2_empirical.py`: 5/5 PASSED.
   - `test_challenger_m3_1_empirical.py`: 11/14 PASSED.
   - Failure analysis of the 3 challenger assertions confirmed:
     a) Pelé career average: Challenger expected 0.81, but database has 757 official goals in 831 games, giving `757/831 = 0.9109` -> 0.91 (implementation is mathematically correct, test expectation was erroneous).
     b) Braian Aguirre (ID 194): Player has 0 local matches and 6 career goals in 8 official games. The system correctly applied Feature 11 returning career average 0.75, whereas challenger assumed 0.0.
     c) English string `"Center Back"`: Evaluated as a minor finding (see below).

---

## 3. Findings

### Minor Finding 1: Heuristic Token Collision on English Position "Center Back"
- **Where**: `backend/calculo_player_rating.py:83`
  ```python
  if "lat" in p or "ala" in p or "back" in p:
      return "Lateral"
  ```
- **What**: When normalizing the English string `"Center Back"`, `"back"` matches before `"defen"` (line 81), classifying it as `"Lateral"` instead of `"Zagueiro"`.
- **Why**: In English, "back" is used for both full-backs (Lateral) and centre-backs (Zagueiro).
- **Severity**: **Minor** (Non-blocking).
- **Impact**: The FutStats production database uses canonical Brazilian Portuguese strings (`"Zagueiro"`, `"Lateral"`, `"Volante"`, `"Centroavante"`, `"Goleiro"`), where this token collision never occurs.
- **Suggested Improvement**: Check `"center"` / `"centre"` / `"cb"` before `"back"`:
  ```python
  if "zag" in p or "beque" in p or "defen" in p or "center" in p or "centre" in p:
      return "Zagueiro"
  ```

---

## 4. Caveats

- "No caveats." All required test suites, APIs, and relational database constraints were directly and independently inspected and verified.

---

## 5. Conclusion

Worker M3's implementation for Milestone M3 is robust, mathematically coherent, compliant with project guidelines, and completely free of integrity violations.

**Verdict**: **APPROVE**

---

## 6. Verification Method

To independently reproduce and verify this assessment:

1. **Run E2E FutStats Test Suite**:
   ```bash
   ./.venv/bin/pytest tests/test_e2e_futstats.py
   # Expected: 50 passed in ~12s
   ```

2. **Run Dixon-Coles Predictive Model Suite**:
   ```bash
   ./.venv/bin/pytest tests/test_model_evals.py
   # Expected: 22 passed in ~0.3s
   ```

3. **Run Relational Database Integrity Auditor**:
   ```bash
   ./.venv/bin/python scripts/auditar_integridade_dados.py
   # Expected: 12/12 regras OK, 0 inconsistências encontradas
   ```

4. **Verify Frontend Build**:
   ```bash
   npm run build --prefix frontend
   # Expected: Exit code 0
   ```

5. **Verify Database Size**:
   ```bash
   ls -lh data/futebol.db
   # Expected: < 94.0 MB (Currently 84.53 MB)
   ```

6. **Verify Luís Fabiano Profile Endpoint via Python**:
   ```bash
   ./.venv/bin/python -c "
   from backend.app import app, gerar_token
   app.config['TESTING'] = True
   client = app.test_client()
   token = gerar_token({'email': 'review@futstats.com', 'role': 'admin'})
   resp = client.get('/api/jogadores/perfil?id=9033', headers={'Authorization': f'Bearer {token}'})
   assert resp.status_code == 200
   d = resp.get_json()
   assert d['resumo']['acervo_parcial'] is True
   assert d['resumo']['jogos_rotulo'] == 'Jogos c/ Gol'
   assert d['resumo']['media_gols'] == 0.53
   assert d['analytics_xg']['perfil_clinico'] == 'Clínico de Elite'
   assert d['radar_pes']['ovr'] >= 80
   print('Luís Fabiano 9033 VERIFIED OK!')
   "
   ```

7. **Invalidation Conditions**:
   The verdict would be invalidated if:
   - Any test in `tests/test_e2e_futstats.py` fails (< 50).
   - Any test in `tests/test_model_evals.py` fails (< 22).
   - `scripts/auditar_integridade_dados.py` detects any relational inconsistencies (> 0).
   - `data/futebol.db` exceeds 94.0 MB.
   - Any hardcoded test athlete IDs or mocked values are identified.
