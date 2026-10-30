# Handoff Report — Challenger M2-1 (Conmebol & Inversion Challenger)

**Working Directory**: `/mnt/jogos_f/Antigravity_Projetos_e_Ferramentas/Guia profissional/.agents/teamwork/teamwork_preview_challenger_m2_1`  
**Milestone**: M2 (Auto-Cura de Clubes Espúrios, Conmebol & Homônimos)  
**Role**: Challenger (critic, specialist)  
**Date**: 2026-10-30  
**Verdict**: **APPROVE**  

---

## 1. Observation

Direct empirical tests were executed against `data/futebol.db` using Python 3.14 / SQLite 3. The following verbatim observations were recorded:

### 1.1 Match 19997098 (Palmeiras vs River Plate — Copa Libertadores 1999-05-26)
- **`partidas`**:
  `id_partida = 19997098`, `mandante = 'Palmeiras'`, `visitante = 'River Plate'`, `placar = '3 x 0'`, `vencedor = 'Palmeiras'`, `gols_mandante = 3`, `gols_visitante = 0`.
- **`gols` (3 rows)**:
  - `id_gol: 70846, atleta: 'Alex', id_jogador: 2373, clube: 'Palmeiras', minuto: '', tempo: '1T/2T'`
  - `id_gol: 70847, atleta: 'Roque Junior', id_jogador: 12282, clube: 'Palmeiras', minuto: '', tempo: '1T/2T'`
  - `id_gol: 20295788, atleta: 'Alex', id_jogador: 2373, clube: 'Palmeiras', minuto: '', tempo: '1T/2T'`
  All 3 goals belong strictly to `'Palmeiras'` (Alex: 2, Roque Júnior: 1).
- **`escalacoes` (2 rows)**:
  - `id_escalacao: 181062, atleta: 'Alex', id_jogador: 2373, clube: 'Palmeiras', titular: 1`
  - `id_escalacao: 181063, atleta: 'Roque Junior', id_jogador: 12282, clube: 'Palmeiras', titular: 1`
  Both lineups belong strictly to `'Palmeiras'`.

### 1.2 Match 20027112 (Grêmio vs River Plate — Copa Libertadores 2002-05-01)
- **`partidas`**:
  `id_partida = 20027112`, `mandante = 'Grêmio'`, `visitante = 'River Plate'`, `placar = '4 x 0'`, `vencedor = 'Grêmio'`, `gols_mandante = 4`, `gols_visitante = 0`.
- **`gols` (4 rows)**:
  - `id_gol: 71864, atleta: 'Rodrigo Mendes', id_jogador: 12105, clube: 'Grêmio', minuto: '41', tempo: '1T/2T'`
  - `id_gol: 71865, atleta: 'Luizao', id_jogador: 8965, clube: 'Grêmio', minuto: '45', tempo: '1T/2T'`
  - `id_gol: 71866, atleta: 'Zinho', id_jogador: 13959, clube: 'Grêmio', minuto: '69', tempo: '1T/2T'`
  - `id_gol: 71867, atleta: 'Luis Mario', id_jogador: 8883, clube: 'Grêmio', minuto: '76', tempo: '1T/2T'`
  All 4 goals belong strictly to `'Grêmio'`.
- **`escalacoes` (4 rows)**:
  - `id_escalacao: 183733, atleta: 'Luis Mario', id_jogador: 8883, clube: 'Grêmio', titular: 1`
  - `id_escalacao: 183734, atleta: 'Luizao', id_jogador: 8965, clube: 'Grêmio', titular: 1`
  - `id_escalacao: 183735, atleta: 'Rodrigo Mendes', id_jogador: 12105, clube: 'Grêmio', titular: 1`
  - `id_escalacao: 183736, atleta: 'Zinho', id_jogador: 13959, clube: 'Grêmio', titular: 1`
  All 4 lineups belong strictly to `'Grêmio'`.

### 1.3 Ghost Match 202430275
- Verbatim query `SELECT count(*) FROM {tbl} WHERE id_partida = 202430275`:
  - `partidas`: `0`
  - `gols`: `0`
  - `escalacoes`: `0`
  - `cartoes`: `0`
  - `odds_partidas`: `0`
  Match 202430275 has been 100% eliminated with zero residue across all tables.

### 1.4 Ghost Goals in 0x0 Libertadores Matches
- Verbatim query:
  ```sql
  SELECT count(*) FROM partidas p JOIN gols g ON p.id_partida = g.id_partida
  WHERE p.campeonato LIKE '%Libertadores%' AND (p.placar = '0 x 0' OR p.placar = '0-0');
  ```
  Result: `0` phantom goals.

### 1.5 Purge of River Plate from Brazilian Players
Inspected `jogadores_estatisticas` and `jogadores`:
- **Alex (ID 2373)**: `clubes = 'Coritiba, Palmeiras, Flamengo, Cruzeiro'`, `has River Plate = False`, `detalhe_carreira_clubes = None`.
- **Roque Júnior (ID 12282)**: `clubes = 'Palmeiras'`, `has River Plate = False`, `detalhe_carreira_clubes`: valid JSON (Palmeiras, Milan, Leeds, Siena, Leverkusen, Duisburg, Brasil).
- **Luís Mário (ID 8883)**: `clubes = 'Grêmio'`, `has River Plate = False`.
- **Luizão (ID 8965)**: `clubes = 'São Paulo, Corinthians, Vasco, Palmeiras'`, `has River Plate = False`.
- **Rodrigo Mendes (ID 12105)**: `clubes = 'Grêmio, Flamengo'`, `has River Plate = False`, `detalhe_carreira_clubes`: valid JSON (Flamengo, Grêmio, Kashima Antlers, Atlético-PR, Al Ain, Al-Gharafa, Fortaleza).
- **Zinho (ID 13959)**: `clubes = 'Flamengo, Palmeiras, Grêmio, Cruzeiro'`, `has River Plate = False`, `detalhe_carreira_clubes`: valid JSON restored from corrupted format with 7 authentic career records.
- **Luís Fabiano (ID 9033)**: `clubes = 'Vasco, São Paulo, Ponte Preta'`, `has River Plate = False`, `has Universidad de Chile = False`.

### 1.6 Additional Checks and Collateral Safety
- **Legitimate foreign athletes**: Rafael Borré (ID 61), Gabriel Mercado (ID 1073), and Facundo Colidio (ID 1656) retain `'River Plate'` in their legitimate career clubs.
- **Mycael (ID 2066)**: `posicao = 'Goleiro'`, `total_gols = 0`, `clubes = 'Athletico-PR'`, `clean_sheets = 1`.
- **Pedro (ID 10)**: `total_jogos = 329`, `'Guabirá'` purged from `clubes`.
- **Storage and Integrity**:
  - `data/futebol.db` size: 88,543,232 bytes (84.44 MB) — margin > 9.5 MB below the 94.0 MB ceiling.
  - Backup file `data/futebol.db.bak_m2` exists (84.48 MB).
  - `PRAGMA integrity_check`: `ok`.

### 1.7 Test Suite Executions
- `./.venv/bin/pytest tests/test_e2e_futstats.py -m "r2 or r4"`: **19 passed**, 0 failed in 3.72s.
- `./.venv/bin/pytest tests/test_model_evals.py`: **22 passed**, 0 failed in 0.27s.
- `python3 scripts/auditar_integridade_dados.py`: **12/12 rules OK**, 0 anomalies found.
- `npm run build` in `frontend/`: exit code 0, 0 build errors in 7.15s.

---

## 2. Logic Chain

1. **Premise**: Ingestion errors originally inverted scores and attributed goals to River Plate instead of Palmeiras (19997098) and Grêmio (20027112), created a ghost match (202430275), inserted 151 ghost goals into 0x0 Libertadores matches, and poisoned Brazilian players' club profiles with 'River Plate'.
2. **Observation Reference**: Sections 1.1 and 1.2 demonstrate that for matches 19997098 and 20027112, `partidas` has the correct `mandante`, `placar`, `vencedor`, and `gols_mandante`, and all child rows in `gols` and `escalacoes` match the Brazilian winner.
3. **Observation Reference**: Section 1.3 confirms that ghost match 202430275 is absent across all 5 tables (`partidas`, `gols`, `escalacoes`, `cartoes`, `odds_partidas`).
4. **Observation Reference**: Section 1.4 confirms that 0 phantom goals exist across all 0x0 Libertadores matches.
5. **Observation Reference**: Section 1.5 confirms that Alex (2373), Roque Júnior (12282), Luís Mário (8883), Luizão (8965), Rodrigo Mendes (12105), Zinho (13959), and Luís Fabiano (9033) have zero occurrences of 'River Plate' in `clubes` or `detalhe_carreira_clubes`.
6. **Observation Reference**: Section 1.6 confirms foreign players (Borré, Mercado, Colidio) retain legitimate River Plate ties without collateral deletion, and database size is 84.44 MB (< 94.0 MB).
7. **Observation Reference**: Section 1.7 confirms all automated test suites pass without regression.
8. **Deductive Step**: Because all required Conmebol rectifications and safety constraints are verified with zero discrepancies, the deliverable meets all criteria for Milestone M2.

---

## 3. Caveats

1. **Non-Libertadores 0x0 Matches**: An adversarial check revealed 671 goals linked to historical 0x0 matches in non-Libertadores tournaments (predominantly 1970s regular season scraping artifacts or penalty shootouts in Copa do Brasil 2005). The current migration specifically resolved the 151 phantom goals in Copa Libertadores per dispatch requirements and test `test_t2_r2_partida_conmebol_sem_gols`.
2. **Own-Goal Club Link in Match 20167016**: Thiago Mendes (ID 1204) scored an own goal for São Paulo against River Plate in Copa Libertadores 2016, which the scraper ingested with `clube = 'River Plate'`. This remains in Thiago Mendes' profile. This is outside the M2 scope (which targeted Alex, Roque Júnior, Luís Mário, Luizão, Rodrigo Mendes, Zinho, Luís Fabiano) and does not affect the M2 acceptance criteria.
3. **Secondary Duplicate Mycael (ID 20319)**: As noted in Worker M2's report, ID 2066 is the primary audited record. ID 20319 remains unmerged in the catalog.

---

## 4. Conclusion

**Verdict: APPROVE.**

The work performed by Worker M2 for Milestone M2 (Features 5, 6, and 7) is empirically validated:
- Matches 19997098 and 20027112 are properly corrected in `partidas`, `gols`, and `escalacoes`.
- Ghost match 202430275 is completely removed.
- Phantom goals in 0x0 Libertadores matches are completely purged.
- River Plate has been purged from Alex, Roque Júnior, Luís Mário, Luizão, Rodrigo Mendes, Zinho, and Luís Fabiano.
- Relational audit reports 12/12 OK; Dixon-Coles regression reports 22/22 passed; E2E suite reports 19/19 passed; SQLite file size is 84.44 MB (< 94.0 MB).

---

## 5. Verification Method

To independently reproduce the empirical findings:

```bash
# 1. Verify Conmebol matches, ghost match, and River Plate purge
python3 -c "
import sqlite3
conn = sqlite3.connect('data/futebol.db')
c = conn.cursor()

# Match 19997098
p1 = c.execute('SELECT mandante, visitante, placar, vencedor FROM partidas WHERE id_partida = 19997098').fetchone()
assert p1 == ('Palmeiras', 'River Plate', '3 x 0', 'Palmeiras')
assert c.execute('SELECT count(*) FROM gols WHERE id_partida = 19997098 AND clube != \"Palmeiras\"').fetchone()[0] == 0
assert c.execute('SELECT count(*) FROM escalacoes WHERE id_partida = 19997098 AND clube != \"Palmeiras\"').fetchone()[0] == 0

# Match 20027112
p2 = c.execute('SELECT mandante, visitante, placar, vencedor FROM partidas WHERE id_partida = 20027112').fetchone()
assert p2 == ('Grêmio', 'River Plate', '4 x 0', 'Grêmio')
assert c.execute('SELECT count(*) FROM gols WHERE id_partida = 20027112 AND clube != \"Grêmio\"').fetchone()[0] == 0
assert c.execute('SELECT count(*) FROM escalacoes WHERE id_partida = 20027112 AND clube != \"Grêmio\"').fetchone()[0] == 0

# Ghost match 202430275
assert c.execute('SELECT count(*) FROM partidas WHERE id_partida = 202430275').fetchone()[0] == 0

# Ghost goals in 0x0 Libertadores
assert c.execute('''SELECT count(*) FROM partidas p JOIN gols g ON p.id_partida = g.id_partida
                    WHERE p.campeonato LIKE \"%Libertadores%\" AND (p.placar = \"0 x 0\" OR p.placar = \"0-0\")''').fetchone()[0] == 0

# River Plate in Brazilian players
for pid in [2373, 12282, 8883, 8965, 12105, 13959, 9033]:
    row = c.execute('SELECT clubes, detalhe_carreira_clubes FROM jogadores_estatisticas WHERE id_jogador = ?', (pid,)).fetchone()
    assert 'river' not in (row[0] or '').lower()
    assert 'river' not in (row[1] or '').lower()

print('ALL DIRECT VERIFICATIONS PASSED!')
"

# 2. Run E2E test suite for Milestone M2
./.venv/bin/pytest tests/test_e2e_futstats.py -m "r2 or r4" -v

# 3. Run predictive evaluation regression suite
./.venv/bin/pytest tests/test_model_evals.py -v

# 4. Run relational consistency auditor
python3 scripts/auditar_integridade_dados.py

# 5. Check database size and integrity
python3 -c "
import os, sqlite3
assert os.path.getsize('data/futebol.db') < 94 * 1024 * 1024
conn = sqlite3.connect('data/futebol.db')
assert conn.execute('PRAGMA integrity_check;').fetchone()[0] == 'ok'
print('DATABASE INTEGRITY AND STORAGE VERIFIED!')
"
```

**Invalidation Conditions**:
- Any goal or lineup in match 19997098 attributed to a club other than `'Palmeiras'`.
- Any goal or lineup in match 20027112 attributed to a club other than `'Grêmio'`.
- Match 202430275 present in any database table.
- Any row in `gols` linked to a 0x0 Libertadores match.
- Any of the target athletes retaining `'River Plate'` in `clubes` or `detalhe_carreira_clubes`.
- Database file size >= 94.0 MB.
