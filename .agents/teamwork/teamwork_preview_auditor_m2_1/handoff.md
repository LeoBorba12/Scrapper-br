# Forensic Audit Handoff Report — Milestone M2

**Auditor**: Forensic Auditor M2 (`teamwork_preview_auditor`)  
**Working Directory**: `/mnt/jogos_f/Antigravity_Projetos_e_Ferramentas/Guia profissional/.agents/teamwork/teamwork_preview_auditor_m2_1`  
**Target**: Milestone M2 (Features 5, 6, 7 — Auto-Cura de Clubes Espúrios, Conmebol & Homônimos)  
**Date**: 2026-10-30  
**Integrity Mode**: Development Mode (per `ORIGINAL_REQUEST.md`)  
**Verdict**: **CLEAN**

---

## Forensic Audit Report

**Work Product**: `scripts/migrar_m2_conmebol_homonimos_clubes.py`, `data/futebol.db`, git worktree  
**Profile**: General Project (Development Mode)  
**Verdict**: **CLEAN**

### Phase Results
- **Hardcoded Test Results Detection**: **PASS** — Zero hardcoded test return values, mock responses, or dummy strings in the codebase or tests.
- **Facade Implementation Detection**: **PASS** — `scripts/migrar_m2_conmebol_homonimos_clubes.py` executes genuine transactional SQL statements against SQLite tables (`partidas`, `gols`, `escalacoes`, `jogadores_estatisticas`, `jogadores`).
- **Fabricated Verification Output Detection**: **PASS** — No pre-populated result logs, output dumps, or artificial test attestations found.
- **Test Tampering Detection**: **PASS** — `tests/test_e2e_futstats.py` and `tests/test_model_evals.py` were unmodified by Worker M2; tests evaluate actual database tables directly.
- **Data Integrity & Non-Destructive Update**: **PASS** — `PRAGMA integrity_check` returned `ok`; Beto Acosta's 17 goals preserved with `id_jogador = NULL`; Guabirá match 202533214 unlinked without destroying match rows.
- **Storage Ceiling Compliance**: **PASS** — `data/futebol.db` size is 84.44 MB (88,543,232 bytes), well below the 94.0 MB Vercel ceiling (margin of 9.56 MB).
- **Relational Integrity Audit**: **PASS** — `python scripts/auditar_integridade_dados.py` verified 12/12 rules OK with 0 inconsistencies found and 0 repaired.
- **Predictive Model Regression**: **PASS** — `./.venv/bin/pytest tests/test_model_evals.py` passed 22/22 tests in 0.27s.
- **E2E Acceptance Test Suite (R2 & R4)**: **PASS** — `./.venv/bin/pytest tests/test_e2e_futstats.py -m "r2 or r4"` passed 19/19 tests in 3.62s.

---

## 1. Observation

### 1.1 Source Code and Git Diff Inspection
- `git status` revealed that Worker M2 only created `scripts/migrar_m2_conmebol_homonimos_clubes.py` and modified `data/futebol.db`. No test files (`tests/test_e2e_futstats.py`, `tests/test_model_evals.py`) or backend endpoints were modified to cheat or bypass assertions.
- Code inspection of `scripts/migrar_m2_conmebol_homonimos_clubes.py` confirmed 328 lines of robust, atomic SQL operations enclosed in `BEGIN TRANSACTION` and committed before running `VACUUM; ANALYZE; PRAGMA wal_checkpoint(TRUNCATE); PRAGMA integrity_check;`.

### 1.2 Storage and Database Structural Integrity
Direct forensic check on `data/futebol.db`:
```text
DB Size: 84.4414 MB (88,543,232 bytes)
PRAGMA integrity_check: ok
Storage Limit: 94.0 MB (98,566,144 bytes)
Safety Margin: 9.5586 MB below limit
Backup File: data/futebol.db.bak_m2 (85 MB) verified
```

### 1.3 Conmebol Inverted Matches Empirical State
- **Match 19997098 (Palmeiras 3 x 0 River Plate)**:
  - `partidas`: `mandante = 'Palmeiras'`, `visitante = 'River Plate'`, `placar = '3 x 0'`, `vencedor = 'Palmeiras'`, `gols_mandante = 3`, `gols_visitante = 0`.
  - `gols` (3 rows): all 3 goals attributed to `clube = 'Palmeiras'` (Alex 2, Roque Júnior 1).
  - `escalacoes`: attributed to `clube = 'Palmeiras'`.
- **Match 20027112 (Grêmio 4 x 0 River Plate)**:
  - `partidas`: `mandante = 'Grêmio'`, `visitante = 'River Plate'`, `placar = '4 x 0'`, `vencedor = 'Grêmio'`, `gols_mandante = 4`, `gols_visitante = 0`.
  - `gols` (4 rows): all 4 goals attributed to `clube = 'Grêmio'` (Rodrigo Mendes, Luizão, Zinho, Luís Mário).
  - `escalacoes`: attributed to `clube = 'Grêmio'`.
- **Ghost Match 202430275**:
  - `SELECT count(*) FROM partidas WHERE id_partida = 202430275` returned `0`.
- **Ghost Goals in 0x0 Libertadores Matches**:
  - `SELECT count(*) FROM gols g JOIN partidas p ON g.id_partida = p.id_partida WHERE p.campeonato LIKE '%Libertadores%' AND (p.placar = '0 x 0' OR p.placar = '0-0')` returned `0`.

### 1.4 Decoupled Homonyms Empirical State
- **Mycael (ID 2066)**:
  - `posicao = 'Goleiro'`, `total_gols = 0`, `total_jogos = 29`, `ano_inicio = 2023`, `ano_fim = 2026`, `clubes = 'Athletico-PR'`, `clean_sheets = 1`.
  - `SELECT count(*) FROM gols WHERE id_jogador = 2066` returned `0`.
  - 17 historical goals of Alberto "Beto" Acosta (1988-1997) preserved in `gols` with `id_jogador IS NULL`.
- **Pedro (ID 10)**:
  - Lineup row for Guabirá match `202533214` unlinked (`id_jogador IS NULL`).
  - `clubes`: `'Flamengo, Criciúma, Cuiabá, Juventude, Sport, Fluminense'` (Guabirá purged).
  - `total_jogos = 329`.
- **Thiago Maia (ID 195)**:
  - Guabirá match `202533214` unlinked.
  - `clubes`: `'Internacional, São Paulo, Criciúma, Bahia, Flamengo, Santos, Democrata-GV'` (Guabirá purged).
- **Paulo Henrique Ganso (ID 16)**:
  - Lineups and goals for substitute Henrique at Atlético-GO unlinked.
  - `clubes`: `'Fluminense, Santos, São Paulo'` (Atlético Goianiense and Atlético Nacional purged).
  - `total_gols = 38`, `total_jogos = 124`, `media_gols_por_jogo = 0.31`.
  - `detalhe_carreira_clubes` contains authentic career timeline.
- **Alex Cabeção (ID 2373)**:
  - Lineups for Airton (Criciúma goalkeeper) and Internacional unlinked.
  - `nome_exibicao = 'Alex'`, `apelido = 'Alex Cabeção'`, `posicao = 'Meio-campo'`.
  - `clubes = 'Coritiba, Palmeiras, Flamengo, Cruzeiro'`, `total_jogos = 141`.

### 1.5 Spurious Clubs Sanitization & Luís Fabiano (ID 9033)
- **Luís Fabiano (ID 9033)**:
  - `clubes = 'Vasco, São Paulo, Ponte Preta'`.
  - `detalhe_carreira_clubes` contains authentic career without any foreign Conmebol clubs (`River Plate`, `Universidad de Chile`).
- **Brazilian Players Sanitized**:
  - Roque Júnior (12282): `clubes = 'Palmeiras'`.
  - Luís Mário (8883): `clubes = 'Grêmio'`.
  - Luizão (8965): `clubes = 'São Paulo, Corinthians, Vasco, Palmeiras'`.
  - Rodrigo Mendes (12105): `clubes = 'Grêmio, Flamengo'`.
  - Zinho (13959): `clubes = 'Flamengo, Palmeiras, Grêmio, Cruzeiro'`, corrupted JSON `[{"clube": "J", "periodo": "M"...}]` replaced with authentic clubs.
  - Gaúcho (6287): `clubes = 'Juventude, Palmeiras, Fluminense, Ponte Preta, Atlético-MG, Flamengo'`.
  - Bernard (976): `clubes = 'Atlético-MG'`.
  - Dudu (13): `clubes = 'Atlético-MG, Palmeiras, Grêmio, Cruzeiro, Coritiba'`.
- **Preservation of Legitimate Foreign Clubs**:
  - Foreign athletes who legitimately played for River Plate (e.g. Rafael Borré ID 61, Jonathan Calleri ID 1126, Gabriel Mercado ID 1073, Facundo Colidio ID 1656) retain `'River Plate'` in their `clubes`.

### 1.6 Independent Test Executions
1. `python scripts/auditar_integridade_dados.py`:
   ```json
   {
     "total_partidas": 115625,
     "inconsistencias_encontradas": 0,
     "inconsistencias_reparadas": 0,
     "regras": [12 rules reporting status: "OK", ocorrencias: 0]
   }
   ```
2. `./.venv/bin/pytest tests/test_model_evals.py`:
   ```text
   ============================== 22 passed in 0.27s ==============================
   ```
3. `./.venv/bin/pytest tests/test_e2e_futstats.py -m "r2 or r4" -v`:
   ```text
   ====================== 19 passed, 31 deselected in 3.62s =======================
   ```

---

## 2. Logic Chain

1. **Safety and Recoverability**: Worker M2 created `data/futebol.db.bak_m2` (85 MB) prior to modifying the database. `PRAGMA integrity_check` on the live database returned `ok`, proving no database corruption occurred.
2. **Authenticity of Implementation**: Inspection of `scripts/migrar_m2_conmebol_homonimos_clubes.py` shows direct relational SQL statements targeting the root causes identified in exploratory analysis. No test mock injection, fake return overrides, or facade classes were used.
3. **Accuracy of Data Updates**: Empirical querying of matches 19997098 and 20027112 proves that both the match headers and the child goal/lineup records were updated to reflect authentic Conmebol outcomes (Palmeiras 3x0 River, Grêmio 4x0 River).
4. **Non-Destructive Decoupling**: Rather than deleting historical goal records from Beto Acosta, Worker M2 set `id_jogador = NULL`, properly unlinking them from goalkeeper Mycael while preserving the acervo. Mycael's profile was restored to 0 goals, position 'Goleiro', and debut year 2023.
5. **Precision in Club Sanitization**: Spurious club associations were purged for affected Brazilian players without globally damaging legitimate records of foreign players who genuinely played for those clubs.
6. **Passing Gating Criteria**: Independent execution of all required test suites (`auditar_integridade_dados.py` 12/12, `test_model_evals.py` 22/22, `test_e2e_futstats.py -m "r2 or r4"` 19/19) confirmed 100% pass rate with zero regressions.

---

## 3. Caveats

1. **Milestone M3 Scope Remaining**: Tests tagged with `r1` or `r3` (such as `test_t4_cenario_luis_fabiano_perfil_completo` which requires `acervo_parcial = True` logic in `backend/app.py`) fail as expected because they are scheduled for Milestone M3. These failures are expected and do not belong to M2.
2. **Legacy Scraper Foreign Key Checks**: `PRAGMA foreign_key_check` reported 10,984 violations, which was verified to be identical between `data/futebol.db.bak_m2` and `data/futebol.db`. SQLite operates with `PRAGMA foreign_keys = OFF` by default and this legacy state was not introduced by M2.

---

## 4. Conclusion

Milestone M2 has been forensically audited and verified. Worker M2 did not cheat, did not create facades, did not alter test files, and executed genuine, high-quality database migrations. All acceptance criteria for Milestone M2 are fully satisfied:
- Conmebol match inversions corrected (Palmeiras 3x0 River, Grêmio 4x0 River).
- Ghost matches and ghost goals in 0x0 Libertadores matches purged.
- Homonyms decoupled (Mycael ID 2066, Pedro ID 10, Thiago Maia ID 195, Ganso ID 16, Alex ID 2373).
- Spurious foreign clubs sanitized for Brazilian athletes (Luís Fabiano ID 9033, Zinho ID 13959, etc.).
- `data/futebol.db` size is 84.44 MB (< 94.0 MB limit) with `PRAGMA integrity_check: ok`.
- 12/12 relational audit rules pass with 0 inconsistencies.
- 22/22 Dixon-Coles model evals pass.
- 19/19 E2E tests for R2 and R4 pass.

Final Verdict: **CLEAN**

---

## 5. Verification Method

To independently verify the audit findings:

1. **Verify Storage Size and SQLite Integrity**:
   ```bash
   python3 -c "
   import os, sqlite3
   size_mb = os.path.getsize('data/futebol.db') / (1024 * 1024)
   conn = sqlite3.connect('data/futebol.db')
   check = conn.cursor().execute('PRAGMA integrity_check;').fetchone()[0]
   conn.close()
   print(f'Size: {size_mb:.2f} MB, Integrity: {check}')
   assert size_mb < 94.0 and check == 'ok'
   "
   ```

2. **Verify 12 Relational Audit Rules**:
   ```bash
   python scripts/auditar_integridade_dados.py
   ```
   *Expected Output*: `"inconsistencias_encontradas": 0` and 12 rules reporting `"status": "OK"`.

3. **Verify Dixon-Coles Mathematical Regressions**:
   ```bash
   ./.venv/bin/pytest tests/test_model_evals.py
   ```
   *Expected Output*: `22 passed in ~0.3s`.

4. **Verify Milestone M2 E2E Tests (R2 & R4)**:
   ```bash
   ./.venv/bin/pytest tests/test_e2e_futstats.py -m "r2 or r4" -v
   ```
   *Expected Output*: `19 passed, 31 deselected in ~3.6s`.

5. **Invalidation Conditions**:
   - `data/futebol.db` size >= 94.0 MB.
   - `PRAGMA integrity_check` returns anything other than `ok`.
   - Any of the 19 tests in `test_e2e_futstats.py -m "r2 or r4"` fails.
   - Any goal in match 19997098 has `clube != 'Palmeiras'`.
   - Mycael (ID 2066) has `total_gols > 0` or position != `'Goleiro'`.
   - Luís Fabiano (ID 9033) has `'River Plate'` or `'Universidad de Chile'` in `clubes` or `detalhe_carreira_clubes`.
