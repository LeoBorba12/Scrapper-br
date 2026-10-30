# Handoff Report — Forensic Auditor M3 (teamwork_preview_auditor)

**Working Directory**: `/mnt/jogos_f/Antigravity_Projetos_e_Ferramentas/Guia profissional/.agents/teamwork/teamwork_preview_auditor_m3_1`  
**Target Milestone**: M3 (Motores Matemáticos de Ratings, xG & Backend APIs)  
**Date**: 2026-10-30  
**Verdict**: **CLEAN**  

---

## Forensic Audit Report

**Work Product**: Files modified by Worker M3 (`backend/app.py`, `backend/calculo_player_rating.py`, `backend/calculo_xg_discreto.py`, `data/futebol.db`)  
**Profile**: General Project  
**Integrity Mode**: Development (from `ORIGINAL_REQUEST.md`)  
**Verdict**: **CLEAN**  

### Phase Results
- **Hardcoded test results**: PASS — 0 test IDs (e.g. 9033, 13953, 12212, 2373) or mock return strings in `backend/` codebase.
- **Facade implementations**: PASS — Genuine mathematical implementations: asymptotic hyperbolic tangent (`tanh`) rating compression in `backend/calculo_player_rating.py`, calibrated discrete Opta model in `backend/calculo_xg_discreto.py`, clamped 5-axis PES radar and dynamic scouting fallbacks in `backend/app.py`.
- **Fabricated verification outputs**: PASS — 0 pre-populated result files or fabricated test logs found.
- **Test tampering / self-certification**: PASS — `git diff tests/` is completely empty. `tests/test_e2e_futstats.py` and `tests/test_model_evals.py` were not modified.
- **Database storage constraint**: PASS — `data/futebol.db` size is 88,637,440 bytes (84.53 MB), well below the 94.0 MB Vercel ceiling (headroom: 9.47 MB).
- **Database integrity**: PASS — `PRAGMA integrity_check` returns `[('ok',)]`.
- **Relational consistency**: PASS — Correlated subqueries resynced all 129 discrepant players. Zero mismatches between `jogadores_estatisticas.total_gols` and `COUNT(gols)` across the entire database.
- **E2E test suite**: PASS — `pytest tests/test_e2e_futstats.py` passed 50/50 in 6.01s.
- **Predictive regression suite**: PASS — `pytest tests/test_model_evals.py` passed 22/22 in 0.29s.
- **Relational audit script**: PASS — `python scripts/auditar_integridade_dados.py` reported 12/12 rules OK with 0 anomalies.
- **Frontend build**: PASS — `npm run build --prefix frontend` exited with code 0 in 4.35s.

---

## 1. Observation

### 1.1 Git Diff and Source Inspection
- Exact command: `git diff backend/calculo_player_rating.py`
  - Added English aliases (`keeper`, `defen`, `back`, `dm`, `midfield`, `wing`) to `normalizar_posicao` (lines 76-90).
  - Added `calcular_rating_medio_temporada` (lines 195-200) and `calcular_impacto_tatico` (lines 203-222).
  - Verified `calcular_nota_partida_sofascore`: implements authentic asymmetric tanh compression:
    ```python
    if saldo_bruto >= 0:
        nota_calculada = BASE_RATING + 3.50 * math.tanh(saldo_bruto / K_POS)
    else:
        nota_calculada = BASE_RATING + 6.50 * math.tanh(saldo_bruto / K_NEG)
    ```
    with `BASE_RATING = 6.50`, `K_POS = 2.65`, `K_NEG = 4.50`, marginal goals conceded decay `pow(gols_sofridos, 0.85)`, and clamping in `[3.00, 10.00]`.
- Exact command: `git diff backend/calculo_xg_discreto.py`
  - Added `classificar_perfil_finalizador`, `estimar_xg_gols_atleta`, and `calcular_xg_partida` (lines 173-276).
  - Uses discrete Opta weights: `PENALTY_XG = 0.760`, open target shot = `0.205`, off-target = `0.035`, non-penalty open goal factor = `0.78`.
  - Calculates `delta_xg = gols_calc - xg_acumulado` and categorizes "Clínico de Elite" when `(razao_conversao >= 1.20 or delta_xg >= 1.50) and xg_por_chute >= 0.095 and gols_reais >= 2`.
- Exact command: `git diff backend/app.py`
  - Hardened `_calcular_radar_pes` with defensive conversions and clamp function preventing `TypeError` on null values, strictly bounding outputs in `[40, 99]`.
  - In `_construir_perfil_jogador`: queries `atleta_sofascore_ratings`; when absent, dynamically evaluates match arrays with `calcular_nota_partida_sofascore` under `fonte: "futstats_scouting"`.
  - Calculates honest career labeling:
    ```python
    is_acervo_parcial = bool(
        not is_filtro_camp and (
            (raw_jogos_carreira > total_jogos and raw_jogos_carreira > 0) or
            (total_jogos <= total_gols_final and total_gols_final > 0)
        )
    )
    if is_acervo_parcial and media_oficial_carreira is not None:
        media_gols_retorno = media_oficial_carreira
    else:
        media_gols_retorno = round(total_gols_final / max(total_jogos, 1), 2)
    jogos_rotulo_retorno = "Jogos c/ Gol" if is_acervo_parcial else "Jogos"
    ```
- Exact command: `git diff tests/`
  - Verbatim output: empty (code 0). Zero changes made to test files.
- Grep search for test IDs (9033, 13953, 12212, 2373) across `backend/`:
  - Exactly 0 matches found in backend files.

### 1.2 Database Storage & Integrity Execution
- Command:
  ```python
  import os, sqlite3
  db_path = 'data/futebol.db'
  size = os.path.getsize(db_path)
  print(f'{size} bytes ({size / (1024*1024):.2f} MB)')
  conn = sqlite3.connect(db_path)
  print(conn.cursor().execute('PRAGMA integrity_check;').fetchall())
  ```
- Result:
  - `Database Size: 88637440 bytes (84.53 MB)`
  - `PRAGMA integrity_check: [('ok',)]`
- Cross-table consistency check:
  ```sql
  SELECT je.id_jogador, je.nome_exibicao, je.total_gols, count_g.cg
  FROM jogadores_estatisticas je
  JOIN (SELECT id_jogador, COUNT(*) as cg FROM gols GROUP BY id_jogador) count_g
    ON je.id_jogador = count_g.id_jogador
  WHERE je.total_gols != count_g.cg;
  ```
  - Result: `[]` (0 mismatches). Alex Cabeção (ID 2373): `total_gols = 146`, `COUNT(gols) = 146`.

### 1.3 Independent Execution of Verification Commands
1. `./.venv/bin/pytest tests/test_e2e_futstats.py`
   - Result: `50 passed in 6.01s` (Exit code 0).
2. `./.venv/bin/pytest tests/test_model_evals.py`
   - Result: `22 passed in 0.29s` (Exit code 0).
3. `python scripts/auditar_integridade_dados.py`
   - Result: `inconsistencias_encontradas: 0`, 12/12 rules OK (Exit code 0).
4. `npm run build --prefix frontend`
   - Result: `✓ built in 4.35s` (Exit code 0).

### 1.4 API Live Inspection via Python Test Client
- **Luís Fabiano (ID 9033)**:
  - `acervo_parcial`: `True`
  - `jogos_rotulo`: `"Jogos c/ Gol"`
  - `media_gols`: `0.53` (matches official career average 403 / 755)
  - `media_oficial_carreira`: `0.53`
  - `sofascore`: `{'fonte': 'futstats_scouting', 'jogos_avaliados': 158, 'rating_medio': 7.8, 'ultimas_notas': [6.28, 6.28, 6.28, 6.28, 7.82]}`
  - `analytics_xg`: `xg=129.7, npxg=116.8, delta=38.3, perfil='Clínico de Elite'`
  - `radar_pes`: `ovr=83, eixos=['atk:97', 'fin:99', 'cri:78', 'fis:90', 'def:52']`
- **Zico (ID 13953)**:
  - `media_gols`: `0.68`, `media_oficial_carreira`: `0.68`, `rotulo`: `"Jogos c/ Gol"`
  - `sofascore`: `{'fonte': 'sofascore', 'rating_medio': 8.45}`
- **Romário (ID 12212)**:
  - `media_gols`: `0.77`, `media_oficial_carreira`: `0.77`, `rotulo`: `"Jogos c/ Gol"`
- **Mycael (ID 2066 - Goleiro)**:
  - `media_gols`: `0.0`, `rotulo`: `"Jogos"`, `acervo_parcial`: `False`
  - `analytics_xg`: `xg=0.0, npxg=0.0, delta=0.0, perfil='Neutro (Amostra Insuficiente)'`
  - `radar_pes`: `ovr=58`, defensive axis `def:92`

---

## 2. Logic Chain

1. **Test Tampering Verification**:
   - `git diff tests/` produced no output, and file timestamps confirm tests predated Worker M3's execution.
   - Observation 1.1 proves that Worker M3 did not alter tests or weaken assertions to make them pass.

2. **Absence of Hardcoded Shortcuts**:
   - In grep searches across the backend, no hardcoded athlete IDs or fixed return blocks were found (Observation 1.1).
   - In API live testing across multiple athletes with varying positions (forwards, midfielders, goalkeepers), the outputs differ appropriately according to their real database statistics and match records (Observation 1.4).

3. **Authenticity of Mathematical Engines**:
   - Direct code inspection confirms that `calculo_player_rating.py` applies the required asymmetric hyperbolic tangent formula with pos-specific weights and minute dampening.
   - `calculo_xg_discreto.py` implements calibrated Opta constants (`PENALTY_XG = 0.760`, open play multipliers) and correct positive/negative delta xG logic, fixing the previous negative delta xG bug.
   - Dynamic rating calculation loops over local matches when `atleta_sofascore_ratings` lacks records, providing a genuine scouting fallback (`fonte: "futstats_scouting"`).

4. **Storage & Infrastructure Health**:
   - `data/futebol.db` measures 84.53 MB, respecting the < 94.0 MB Vercel limit with a generous 9.47 MB margin (Observation 1.2).
   - SQLite integrity check passes (`ok`).
   - Relational consistency across the database is verified: 0 mismatches between `total_gols` and `COUNT(gols)`.

5. **Empirical Pass Across All Automated Suites**:
   - All 50 E2E tests, 22 predictive model evaluations, and 12/12 relational audit rules pass with zero failures (Observation 1.3).

---

## 3. Caveats

- "No caveats." All required checks were executed empirically against real files and databases.

---

## 4. Conclusion

The work product delivered by Worker M3 for Milestone M3 is **CLEAN**.  
All features (8, 9, 10, 11) and the relational database resynchronization are authentically implemented without shortcuts, facades, or test tampering.  
**Verdict**: **CLEAN**.

---

## 5. Verification Method

To reproduce the auditor's verification independently, execute the following commands in the workspace root:

```bash
# 1. Verify E2E acceptance tests (50/50)
./.venv/bin/pytest tests/test_e2e_futstats.py

# 2. Verify predictive model regression tests (22/22)
./.venv/bin/pytest tests/test_model_evals.py

# 3. Verify relational integrity audit (12/12 OK)
python scripts/auditar_integridade_dados.py

# 4. Verify database file size (< 94.0 MB) & PRAGMA integrity
python -c "
import os, sqlite3
db = 'data/futebol.db'
size = os.path.getsize(db)
print(f'Size: {size / (1024*1024):.2f} MB (< 94.0 MB: {size < 94 * 1024 * 1024})')
conn = sqlite3.connect(db)
print('Integrity check:', conn.cursor().execute('PRAGMA integrity_check;').fetchall())
"

# 5. Verify Frontend production build
npm run build --prefix frontend
```

### Invalidation Conditions
The audit verdict would be invalidated if:
1. Any test in `tests/test_e2e_futstats.py` fails.
2. Any test in `tests/test_model_evals.py` fails.
3. `scripts/auditar_integridade_dados.py` detects any inconsistencies.
4. `data/futebol.db` size exceeds 94.0 MB.
5. Any athlete ID is hardcoded in `backend/app.py` or mathematical engines.
