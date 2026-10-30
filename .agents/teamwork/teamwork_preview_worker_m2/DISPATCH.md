# Task Assignment — Worker M2 (Auto-Cura de Clubes Espúrios, Conmebol & Homônimos)

## Identity
- **Role**: Worker (teamwork_preview_worker)
- **Milestone**: M2 (Features 5, 6, 7 from PROJECT.md)
- **Working Directory**: `/mnt/jogos_f/Antigravity_Projetos_e_Ferramentas/Guia profissional/.agents/teamwork/teamwork_preview_worker_m2`

## Exclusively Owned Files / Scope
- `data/futebol.db` (migrations and data updates)
- Any migration script created to execute the changes atomically

## Input Documents
Read the authoritative request and master plan:
- `/mnt/jogos_f/Antigravity_Projetos_e_Ferramentas/Guia profissional/.agents/teamwork/ORIGINAL_REQUEST.md`
- `/mnt/jogos_f/Antigravity_Projetos_e_Ferramentas/Guia profissional/PROJECT.md`

Read the 3 detailed handoff reports from the M2 Explorers:
- `/mnt/jogos_f/Antigravity_Projetos_e_Ferramentas/Guia profissional/.agents/teamwork/teamwork_preview_explorer_m2_1/handoff.md`
- `/mnt/jogos_f/Antigravity_Projetos_e_Ferramentas/Guia profissional/.agents/teamwork/teamwork_preview_explorer_m2_2/handoff.md`
- `/mnt/jogos_f/Antigravity_Projetos_e_Ferramentas/Guia profissional/.agents/teamwork/teamwork_preview_explorer_m2_3/handoff.md`

## Mission & Implementation Tasks

1. **Safety Backup**:
   - Create a safe timestamped backup of `data/futebol.db` before executing migrations (e.g. `data/futebol.db.bak_m2`).

2. **Feature 5: Saneamento Conmebol Invertidas & Fantasmas**:
   - Rectify Match 19997098 (1999-05-26): Update `partidas` to `3 x 0` (vencedor = 'Palmeiras'), update `gols.clube = 'Palmeiras'`, update `escalacoes.clube = 'Palmeiras'`.
   - Rectify Match 20027112 (2002-05-01): Update `partidas` to `4 x 0` (vencedor = 'Grêmio'), update `gols.clube = 'Grêmio'`, update `escalacoes.clube = 'Grêmio'`.
   - Delete empty duplicate ghost match `202430275` from `partidas`.

3. **Feature 6: Desvinculação de Homônimos**:
   - **Mycael (ID 2066)**:
     - Decouple all 17 Alberto "Beto" Acosta goals (1988-1997) via `UPDATE gols SET id_jogador = NULL WHERE id_jogador = 2066;`.
     - Update Mycael profile: `posicao = 'Goleiro'`, `clubes = 'Athletico-PR'`, `ano_inicio = 2023`, `ano_fim = 2026`, `total_gols = 0`, `total_jogos = 29`, `clean_sheets = 1`, `detalhe_carreira_clubes = '[{"clube": "Athletico-PR", "jogos": 29, "gols": 0}]'`.
   - **Pedro (ID 10)**:
     - Decouple invalid lineup link in match 202533214 (Independiente Petrolero vs Guabirá) via `UPDATE escalacoes SET id_jogador = NULL WHERE id_partida = 202533214 AND id_jogador = 10;`.
     - Purge 'Guabirá' from `clubes` and adjust `total_jogos = 329`.
   - **Paulo Henrique Ganso (ID 16)**:
     - Decouple substitute 'Henrique' at Atlético-GO: `UPDATE gols SET id_jogador = NULL WHERE id_jogador = 16 AND clube LIKE '%Atlético Goianiense%';` and `UPDATE escalacoes SET id_jogador = NULL WHERE id_jogador = 16 AND clube LIKE '%Atlético Goianiense%';`.
     - Purge 'Atlético Nacional' and 'Atlético Goianiense', set `clubes = 'Fluminense, Santos, São Paulo'`, restore authentic career JSON, resync `total_gols` and `total_jogos`.
   - **Alex (ID 2373)**:
     - Decouple 29 Criciúma goalkeeper lineups: `UPDATE escalacoes SET id_jogador = NULL WHERE id_jogador = 2373 AND atleta LIKE '%Airton%';`.
     - Restore `nome_exibicao = 'Alex'`, `apelido = 'Alex Cabeção'`, `clubes = 'Coritiba, Palmeiras, Flamengo, Cruzeiro'`, resync `total_jogos`.
   - **Thiago Maia (ID 195)**:
     - Decouple match 202533214: `UPDATE escalacoes SET id_jogador = NULL WHERE id_jogador = 195 AND id_partida = 202533214;`. Purge 'Guabirá' from `clubes`.

4. **Feature 7: Sanitização de Clubes Espúrios & Luís Fabiano (ID 9033)**:
   - Ensure Luís Fabiano (ID 9033) strictly exhibits authentic clubs: `UPDATE jogadores_estatisticas SET clubes = 'Vasco, São Paulo, Ponte Preta' WHERE id_jogador = 9033;`. Ensure 0 foreign Conmebol clubs.
   - Purge 'River Plate' from Roque Júnior (12282), Luís Mário (8883), Luizão (8965), Rodrigo Mendes (12105), Zinho (13959), Alex (2373).
   - Purge 'Estudiantes' from Zinho (13959) and Gaúcho (6287).
   - Purge corrupted `{"clube": "J", "periodo": "M"}` JSON from Zinho (13959), restoring authentic career details (`Flamengo, Palmeiras, Grêmio, Cruzeiro`).
   - Clean Bernard (976) and Dudu (13) if needed.

5. **Storage Optimization & VACUUM**:
   - Run `VACUUM; ANALYZE; PRAGMA wal_checkpoint(TRUNCATE);` on `data/futebol.db`.
   - Verify that file size is strictly under 94.0 MB (target: ~84.5 MB).
   - Verify `PRAGMA integrity_check` returns `ok`.

6. **Verification Tests (Mandatory)**:
   - `python scripts/auditar_integridade_dados.py` (Must pass 12/12 rules with 0 anomalies).
   - `./.venv/bin/pytest tests/test_model_evals.py` (Must pass 22/22 tests).
   - `./.venv/bin/pytest tests/test_e2e_futstats.py -m "r2 or r4"` (All R2 and R4 tests must pass).
   - Check database file size: `ls -lh data/futebol.db`.

## MANDATORY INTEGRITY WARNING
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

## Deliverables
- Deliver complete execution log, SQL migration queries, verification outputs, and DB size in `handoff.md` in your working directory.
- Notify parent via `send_message` when done.
