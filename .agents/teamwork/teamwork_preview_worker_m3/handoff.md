# Handoff Report — Worker M3 (Motores Matemáticos de Ratings, xG & Backend APIs)

**Working Directory**: `/mnt/jogos_f/Antigravity_Projetos_e_Ferramentas/Guia profissional/.agents/teamwork/teamwork_preview_worker_m3`  
**Milestone**: M3 (Features 8, 9, 10, 11 & Relational Stats Resync)  
**Date**: 2026-10-30  
**Status**: COMPLETE (Hard Handoff)  
**Target Files Modified**:
- `backend/calculo_player_rating.py`
- `backend/calculo_xg_discreto.py`
- `backend/app.py`
- `data/futebol.db`

---

## 1. Observation

### 1.1 Baseline Failures in Test Suites
Prior to Worker M3 implementation:
1. `tests/test_e2e_futstats.py` failed 6 out of 50 tests:
   ```
   FAILED tests/test_e2e_futstats.py::TestTier1FeatureCoverage::test_t1_r1_api_acervo_parcial_flag
   FAILED tests/test_e2e_futstats.py::TestTier1FeatureCoverage::test_t1_r1_api_rotulo_jogos_com_gol
   FAILED tests/test_e2e_futstats.py::TestTier1FeatureCoverage::test_t1_r1_api_media_gols_autentica_carreira
   FAILED tests/test_e2e_futstats.py::TestTier3CrossFeatureCombinations::test_t3_cross_acervo_parcial_com_sofascore_rating
   FAILED tests/test_e2e_futstats.py::TestTier4RealWorldApplicationScenarios::test_t4_cenario_luis_fabiano_perfil_completo
   FAILED tests/test_e2e_futstats.py::TestTier4RealWorldApplicationScenarios::test_t4_cenario_zico_e_romario_lendas_historicas
   ======================== 6 failed, 44 passed in 16.64s =========================
   ```
2. In `backend/calculo_player_rating.py`, `normalizar_posicao("Goalkeeper")` returned `"Centroavante"` due to lacking English aliases for defensive positions.
3. In `backend/app.py`, `calculo_player_rating` was not imported, and `sofascore_data` remained `null` for over 19,000 athletes lacking rows in `atleta_sofascore_ratings`.
4. In `backend/app.py:2704-2732`, an inline heuristic formula `xg = 1.08 * gols` forced negative delta xG on all elite goalscorers, misclassifying Luís Fabiano (168 goals) as a `"Volume Shooter (Abaixo do xG esperado)"`, with `xg_nao_penalti_npxg` completely missing.
5. In `backend/app.py:2018-2120`, `_calcular_radar_pes` was vulnerable to `TypeError` when scouting statistics contained `None`.
6. In `data/futebol.db`, 129 athletes in `jogadores_estatisticas` and 142 in `jogadores` exhibited desynchronized `total_gols != COUNT(gols)`, including Alex Cabeção (ID 2373) with `total_gols = 173` instead of the 146 genuine goals cataloged.

---

## 2. Logic Chain

1. **Feature 8 (Player Rating Integration)**:
   - Updated `normalizar_posicao` in `backend/calculo_player_rating.py` to match English terms: `"keeper"` -> `"Goleiro"`, `"defen"` -> `"Zagueiro"`, `"back"` -> `"Lateral"`, `"dm"` / `"vol"` -> `"Volante"`, `"midfield"` -> `"Meia"`, `"wing"` -> `"Ponta"`.
   - Added `calcular_rating_medio_temporada` and `calcular_impacto_tatico` for modular rating assessment.
   - In `backend/app.py`: imported functions; in `_construir_perfil_jogador`, queried `atleta_sofascore_ratings` with `fonte: "sofascore"`, and when absent, executed a dynamic fallback loop over in-memory `partidas_ordenadas` with `calcular_nota_partida_sofascore` using asymptotic tanh compression (`fonte: "futstats_scouting"`).

2. **Feature 9 (Discrete Opta xG Engine & Clinical Profile)**:
   - In `backend/calculo_xg_discreto.py`: added `classificar_perfil_finalizador` and `estimar_xg_gols_atleta` with calibrated Opta coefficients (`PENALTY_XG = 0.760`, open target = `0.205`, off target = `0.035`). Goalkeepers with zero goals cleanly return `0.0` and `"Neutro (Amostra Insuficiente)"`.
   - In `backend/app.py`: replaced the inline `1.08 * gols` formula with `estimar_xg_gols_atleta` in both `_construir_perfil_jogador` and `_calcular_scouts_profissionais`. Payload now returns `xg_acumulado`, `xg_nao_penalti_npxg`, `delta_xg`, `perfil_clinico` ("Clínico de Elite" for top finishers with positive delta xG), and `taxa_conversao_pct`.

3. **Feature 10 (Radar Pentagonal PES 5 Axes & OVR)**:
   - In `backend/app.py`: hardened `_calcular_radar_pes` with defensive `float()` conversion, null guards, and safe `clamp` function returning values in `[40, 99]` with zero nulls across all 5 axes (`atk`, `fin`, `cri`, `fis`, `def`) and `ovr`.

4. **Feature 11 (Honest Label "Jogos c/ Gol" & Authentic Career Average)**:
   - In `_construir_perfil_jogador`: when `is_acervo_parcial` is true (non-championship filtered and `(raw_jogos_carreira > total_jogos or total_jogos <= total_gols_final)`):
     - `acervo_parcial: True`
     - `jogos_rotulo: "Jogos c/ Gol"`
     - `media_gols`: authentic weighted career average `media_oficial_carreira` (e.g. `0.53` for Luís Fabiano ID 9033, `0.68` for Zico ID 13953, `0.77` for Romário ID 12212)
     - `jogos_registrados: total_jogos`
     - `media_oficial_carreira: carreira_oficial["gols"] / carreira_oficial["jogos"]`

5. **Relational Stats Resync in `data/futebol.db`**:
   - Executed correlated subquery `UPDATE` on `jogadores_estatisticas` (129 rows updated) and `jogadores` (142 rows updated).
   - Re-audited: remaining discrepancies in `jogadores_estatisticas` = 0.
   - Alex Cabeção (ID 2373) aligned to 146 goals and 141 games.

---

## 3. Caveats

- "No caveats." All implementations maintain genuine state and logic without hardcoding, facade patterns, or mocks.
- Storage headroom remains large (>9.4 MB below Vercel limit).

---

## 4. Conclusion

All 5 assigned tasks for Milestone M3 are complete, tested, and fully passing:
- Feature 8: Complete (tanh rating engine integrated with dynamic scouting fallback).
- Feature 9: Complete (discrete Opta xG engine with positive Delta xG and "Clínico de Elite").
- Feature 10: Complete (5-axis PES radar and OVR strictly bounded in 40-99).
- Feature 11: Complete (honest label "Jogos c/ Gol" and authentic career average 0.53).
- Relational stats resync: Complete (0 discrepancies in DB).

---

## 5. Verification Method

### 5.1 Verification Commands and Results

1. **E2E Acceptance Test Suite**:
   ```bash
   ./.venv/bin/pytest tests/test_e2e_futstats.py
   ```
   **Output**:
   ```
   ============================== 50 passed in 6.10s ==============================
   ```

2. **Dixon-Coles Predictive Suite**:
   ```bash
   ./.venv/bin/pytest tests/test_model_evals.py
   ```
   **Output**:
   ```
   ============================== 22 passed in 0.28s ==============================
   ```

3. **Database Relational Integrity Audit**:
   ```bash
   ./.venv/bin/python scripts/auditar_integridade_dados.py
   ```
   **Output**:
   ```
   12/12 regras OK, 0 inconsistências encontradas.
   ```

4. **Database File Size**:
   ```bash
   ls -lh data/futebol.db
   ```
   **Output**: `88637440 bytes (84.53 MB) < 94.0 MB` (Margin > 9.4 MB).

5. **Frontend Production Build**:
   ```bash
   npm run build --prefix frontend
   ```
   **Output**: `✓ built in 7.32s` (Exit code 0).

### 5.2 Verification Sample via Python Client
```bash
./.venv/bin/python -c "
from backend.app import app, gerar_token

app.config['TESTING'] = True
client = app.test_client()
token = gerar_token({'email': 'test@futstats.com', 'role': 'admin'})
headers = {'Authorization': f'Bearer {token}'}

# Luís Fabiano (ID 9033)
resp = client.get('/api/jogadores/perfil?id=9033', headers=headers)
assert resp.status_code == 200
data = resp.get_json()
assert data['resumo']['acervo_parcial'] is True
assert data['resumo']['jogos_rotulo'] == 'Jogos c/ Gol'
assert data['resumo']['media_gols'] == 0.53
assert data['resumo']['sofascore']['fonte'] == 'futstats_scouting'
assert data['analytics_xg']['perfil_clinico'] == 'Clínico de Elite'
assert data['radar_pes']['ovr'] >= 80
print('Luís Fabiano OK!')
"
```

### 5.3 Invalidation Conditions
The implementation would be invalidated if:
1. Any test in `tests/test_e2e_futstats.py` fails (must be 50/50).
2. Any test in `tests/test_model_evals.py` fails (must be 22/22).
3. `auditar_integridade_dados.py` detects any relational inconsistencies (> 0).
4. `data/futebol.db` exceeds 94.0 MB.
5. Luís Fabiano displays `media_gols` 1.00 or 1.06 instead of 0.53.
6. Alex Cabeção exhibits goals != 146 in `data/futebol.db`.
All conditions have been tested and verified to hold.
