# Handoff Report — Worker M2 (Auto-Cura de Clubes Espúrios, Conmebol & Homônimos)

**Working Directory**: `/mnt/jogos_f/Antigravity_Projetos_e_Ferramentas/Guia profissional/.agents/teamwork/teamwork_preview_worker_m2`  
**Milestone**: M2 (Features 5, 6, 7 from PROJECT.md)  
**Date**: 2026-10-30  
**Status**: COMPLETE (Hard Handoff)  
**Database File**: `data/futebol.db` (Verified Size: 84.44 MB, Margin: >9.5 MB below 94.0 MB limit)  
**Backup File**: `data/futebol.db.bak_m2` (Verified Size: 85 MB)  
**Migration Script**: `scripts/migrar_m2_conmebol_homonimos_clubes.py`  

---

## 1. Observation

### 1.1 Initial State Observations
Prior to migration, execution of the test suite `./.venv/bin/pytest tests/test_e2e_futstats.py -m "r2 or r4"` produced 4 failing tests out of 19:
```text
FAILED tests/test_e2e_futstats.py::TestTier1FeatureCoverage::test_t1_r2_conmebol_19997098_palmeiras_river
FAILED tests/test_e2e_futstats.py::TestTier1FeatureCoverage::test_t1_r2_conmebol_20027112_gremio_river
FAILED tests/test_e2e_futstats.py::TestTier1FeatureCoverage::test_t1_r2_mycael_sem_gols_historicos_espurios
FAILED tests/test_e2e_futstats.py::TestTier2BoundaryAndCornerCases::test_t2_r2_partida_conmebol_sem_gols
15 passed, 4 failed, 31 deselected in 4.48s
```

Verbatim database inspections on `data/futebol.db`:
- **Match 19997098**:
  - `partidas`: `mandante = 'Palmeiras'`, `visitante = 'River Plate'`, `placar = '0 x 3'`, `vencedor = 'River Plate'`.
  - `gols` (3 rows) and `escalacoes` (2 rows) were attributed to `clube = 'River Plate'`.
- **Match 20027112**:
  - `partidas`: `mandante = 'Grêmio'`, `visitante = 'River Plate'`, `placar = '0 x 4'`, `vencedor = 'River Plate'`.
  - `gols` (4 rows) and `escalacoes` (4 rows) were attributed to `clube = 'River Plate'`.
- **Ghost Match 202430275**:
  - `partidas`: `id_partida = 202430275`, duplicating 20027112 with 0 child rows across `gols`, `escalacoes`, `cartoes`, `odds_partidas`.
- **Ghost Goals in 0x0 Libertadores Matches**:
  - 151 rows in table `gols` were linked to 59 distinct Libertadores matches whose score was `0 x 0` (`gols_mandante = 0 AND gols_visitante = 0`).
- **Mycael (ID 2066)**:
  - 17 goals in `gols` belonged to Argentine forward Alberto "Beto" Acosta between 1988 and 1997.
  - Profile in `jogadores_estatisticas`: `posicao: 'Atacante'`, `clubes: 'Athletico-PR, Univ. Católica, Cerro, Boca Juniors, El Nacional, San Lorenzo, Táchira, Barcelona, Progreso, Guarani'`, `ano_inicio: 1988`, `total_gols: 17`.
- **Pedro (ID 10)**:
  - Lineup row `id_escalacao = 156464` in Copa Sul-Americana match `202533214` (Guabirá) linked to `id_jogador = 10`.
  - `clubes` in `jogadores_estatisticas` contained `'Guabirá'`; `total_jogos: 330`.
- **Thiago Maia (ID 195)**:
  - Lineup row `id_escalacao = 156461` in match `202533214` (Guabirá) linked to `id_jogador = 195`.
  - `clubes` in `jogadores_estatisticas` contained `'Guabirá'`.
- **Paulo Henrique Ganso (ID 16)**:
  - 1 goal and 15 lineups in 2026 for Atlético Goianiense belonging to substitute player "Henrique" (shirt #17) linked to `id_jogador = 16`.
  - `clubes`: `'Fluminense, Atlético Goianiense, Santos, Sao Paulo, São Paulo, Atlético Nacional'`.
  - `detalhe_carreira_clubes`: `'[]'`.
- **Alex (ID 2373)**:
  - `nome_exibicao: 'Airton'`, `posicao: 'Zagueiro'` due to 29 lineups for Criciúma goalkeeper Airton.
  - Spurious clubs `'River Plate'`, `'Libertad'`, `'Cienciano'`.
  - 21 lineups in 2004-2008 for Internacional belonging to Alex Raphael Meschini (Alex do Inter).
- **Luís Fabiano (ID 9033)**:
  - Current `clubes`: `'Vasco, São Paulo, Ponte Preta'`.
  - `detalhe_carreira_clubes` has 0 foreign Conmebol clubs.
- **Corrupted JSON in Zinho (ID 13959)**:
  - `detalhe_carreira_clubes`: `[{"clube": "J", "periodo": "M", "jogos": 0, "gols": 0, "assistencias": 0}, ...]`.
  - `clubes`: contained `'River Plate'` and `'Estudiantes'`.

---

## 2. Logic Chain

1. **Safety Backup**:
   - Copied `data/futebol.db` to `data/futebol.db.bak_m2` (85 MB) before executing any write operations.
2. **Conmebol Match Inversions (Feature 5)**:
   - Matches 19997098 and 20027112 suffered from reverse score and club assignment during legacy ingestion. Setting `gols_mandante = 3, gols_visitante = 0, placar = '3 x 0', vencedor = 'Palmeiras'` and updating child rows in `gols` and `escalacoes` to `'Palmeiras'` resolves match 19997098.
   - Setting `gols_mandante = 4, gols_visitante = 0, placar = '4 x 0', vencedor = 'Grêmio'` and updating child rows in `gols` and `escalacoes` to `'Grêmio'` resolves match 20027112.
   - Deleting match 202430275 removes the duplicate ghost stub with 0 child dependencies.
   - Deleting 151 phantom goals in 0x0 Libertadores matches resolves `test_t2_r2_partida_conmebol_sem_gols` without affecting real match outcomes.
   - Updating matches 19918508 (Estudiantes 0x2 Flamengo), 20137118 (Atlético-MG 2x0 Newell's), and 20187146 (Palmeiras 2x0 Colo Colo) corrects the underlying match records that caused spurious clubs for Zinho, Gaúcho, Bernard, and Dudu.
3. **Decoupling Homonyms (Feature 6)**:
   - Unlinking Beto Acosta's 17 goals from Mycael (ID 2066) by setting `gols.id_jogador = NULL` preserves the historical goals while resetting Mycael's `total_gols = 0`, restoring `posicao = 'Goleiro'`, `clubes = 'Athletico-PR'`, and debut year `2023`.
   - Unlinking match 202533214 from Pedro (ID 10) and Thiago Maia (ID 195) removes spurious Guabirá appearances, adjusting Pedro's `total_jogos = 329` and purging `'Guabirá'` from `clubes`.
   - Unlinking substitute Henrique at Atlético-GO from Ganso (ID 16) resets `total_gols = 38` and `total_jogos = 124`, setting authentic `clubes = 'Fluminense, Santos, São Paulo'` and restoring official career history.
   - Unlinking 29 Criciúma lineups (Airton) and Internacional lineups (Alex do Inter) from Alex Cabeção (ID 2373) restores `nome_exibicao = 'Alex'`, `apelido = 'Alex Cabeção'`, `posicao = 'Meio-campo'`, `clubes = 'Coritiba, Palmeiras, Flamengo, Cruzeiro'`, and `total_jogos = 141`.
4. **Purging Spurious Club Strings & Luís Fabiano (Feature 7)**:
   - Re-asserted `clubes = 'Vasco, São Paulo, Ponte Preta'` on Luís Fabiano (ID 9033).
   - Purged `'River Plate'` and `'Estudiantes'` from Brazilian players: Roque Júnior (12282 -> `'Palmeiras'`), Luís Mário (8883 -> `'Grêmio'`), Luizão (8965 -> `'São Paulo, Corinthians, Vasco, Palmeiras'`), Rodrigo Mendes (12105 -> `'Grêmio, Flamengo'`), Zinho (13959 -> `'Flamengo, Palmeiras, Grêmio, Cruzeiro'`), Gaúcho (6287 -> `'Juventude, Palmeiras, Fluminense, Ponte Preta, Atlético-MG, Flamengo'`).
   - Restored authentic career JSON in Zinho (13959), eliminating corrupted `{"clube": "J", "periodo": "M"}`.
   - Purged foreign clubs from Bernard (976 -> `'Atlético-MG'`) and Dudu (13 -> `'Atlético-MG, Palmeiras, Grêmio, Cruzeiro, Coritiba'`).
5. **Storage Optimization & VACUUM**:
   - Executed `VACUUM; ANALYZE; PRAGMA wal_checkpoint(TRUNCATE);` and `PRAGMA integrity_check`.
   - Final file size: 84.44 MB (well under 94.0 MB ceiling).

---

## 3. Caveats

- **Foreign Players' Legitimate Clubs**: Clubs like 'River Plate' and 'Estudiantes' were not removed globally across the entire database to preserve legitimate careers of Argentine and Uruguayan athletes (e.g. Arrascaeta at Defensor, Calleri at Boca, Borré at River Plate).
- **Secondary Duplicate Record Mycael (ID 20319)**: An older unmerged record ID 20319 exists with 83 appearances for Athletico-PR from 2022-2025. Per dispatch instructions and test suites, ID 2066 is the primary tested entity and was sanitized to 29 appearances (2023-2026) with 1 clean sheet.

---

## 4. Conclusion

All tasks specified in DISPATCH.md for Milestone M2 are 100% complete:
1. Safe backup `data/futebol.db.bak_m2` exists (85 MB).
2. Features 5, 6, and 7 executed atomically via `scripts/migrar_m2_conmebol_homonimos_clubes.py`.
3. Database size reduced to 84.44 MB (88,543,232 bytes), respecting the Vercel ceiling of 94.0 MB with a >9.5 MB safety margin.
4. `PRAGMA integrity_check` returns `ok`.
5. All verification test suites pass without regression.

---

## 5. Verification Method

To independently verify the complete migration:

1. **Relational Consistency Audit (12/12 Rules OK, 0 anomalies)**:
   ```bash
   python scripts/auditar_integridade_dados.py
   ```
   *Expected output*: `"inconsistencias_encontradas": 0`, all 12 rules report `"status": "OK"`.

2. **Dixon-Coles Predictive Mathematical Regression (22/22 Passed)**:
   ```bash
   ./.venv/bin/pytest tests/test_model_evals.py
   ```
   *Expected output*: `22 passed in ~2.0s`.

3. **E2E Acceptance Test Suite for Milestone M2 (R2 & R4 marks)**:
   ```bash
   ./.venv/bin/pytest tests/test_e2e_futstats.py -m "r2 or r4"
   ```
   *Expected output*: `19 passed, 31 deselected in ~4.0s`.

4. **Direct Database Assertions**:
   ```bash
   python3 -c "
   import sqlite3, json
   conn = sqlite3.connect('data/futebol.db')
   conn.row_factory = sqlite3.Row
   c = conn.cursor()

   # Conmebol matches
   p1 = c.execute('SELECT mandante, visitante, placar, vencedor FROM partidas WHERE id_partida = 19997098').fetchone()
   assert p1['mandante'] == 'Palmeiras' and p1['placar'] == '3 x 0' and p1['vencedor'] == 'Palmeiras'

   p2 = c.execute('SELECT mandante, visitante, placar, vencedor FROM partidas WHERE id_partida = 20027112').fetchone()
   assert p2['mandante'] == 'Grêmio' and p2['placar'] == '4 x 0' and p2['vencedor'] == 'Grêmio'

   assert c.execute('SELECT count(*) FROM partidas WHERE id_partida = 202430275').fetchone()[0] == 0

   # Mycael
   mycael = c.execute('SELECT * FROM jogadores_estatisticas WHERE id_jogador = 2066').fetchone()
   assert mycael['posicao'] == 'Goleiro' and mycael['total_gols'] == 0 and mycael['clubes'] == 'Athletico-PR'

   # Pedro
   pedro = c.execute('SELECT * FROM jogadores_estatisticas WHERE id_jogador = 10').fetchone()
   assert 'guabirá' not in pedro['clubes'].lower() and pedro['total_jogos'] == 329

   # Luís Fabiano
   lf = c.execute('SELECT * FROM jogadores_estatisticas WHERE id_jogador = 9033').fetchone()
   assert lf['clubes'] == 'Vasco, São Paulo, Ponte Preta'

   print('ALL DATABASE INTEGRITY CHECKS PASSED!')
   "
   ```

5. **Storage Size Verification**:
   ```bash
   ls -lh data/futebol.db
   ```
   *Expected output*: `85M` (exact: `84.44 MB`, `< 94.0 MB`).

6. **Invalidation Conditions**:
   - `test_e2e_futstats.py -m "r2 or r4"` fails any test.
   - `scripts/auditar_integridade_dados.py` reports `inconsistencias_encontradas > 0`.
   - File size of `data/futebol.db` >= 94.0 MB.
   - Any goal in match 19997098 has `clube != 'Palmeiras'`.
   - Mycael has `total_gols > 0` or foreign clubs in `clubes`.
   - Pedro has `'Guabirá'` in `clubes`.
