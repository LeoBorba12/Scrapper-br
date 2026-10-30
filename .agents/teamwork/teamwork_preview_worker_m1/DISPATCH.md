# DISPATCH - Worker M1 (Storage, Audit Script & Schema Saneamento)

## Mission
Implement Milestone M1 covering Features 1, 2, 3, and 4:
1. **Feature 1 - Storage Optimization & VACUUM (<94.0 MB)**:
   - Create a safety backup `data/futebol.db.bak_pre_m1`.
   - In `data/futebol.db`: DROP `idx_partidas_data`, DROP `idx_escalacoes_atleta`, DROP table `jogadores_resumo`.
   - Run `ANALYZE;` and `VACUUM;` and `PRAGMA wal_checkpoint(TRUNCATE);`.
   - Verify file size drops to ~88.5 MB (< 94.0 MB limit).
2. **Feature 2 - Audit Script Saneamento (`scripts/auditar_integridade_dados.py`)**:
   - Apply patch from `/mnt/jogos_f/Antigravity_Projetos_e_Ferramentas/Guia profissional/.agents/teamwork/teamwork_preview_explorer_m1_2/auditar_integridade_dados.patch` (or manually adjust per handoff.md):
     - Sequentially renumber rules 1 to 12.
     - Remove the harmful auto-repair `SET total_jogos = MAX(total_jogos, total_gols)`.
     - Add check & cleanup for scraping titles `LIKE '%Estatísticas%'`.
     - Add check for 0x0 matches with ghost goals.
3. **Feature 3 - Schema Expansion (`atleta_sofascore_ratings`)**:
   - Add columns `npxg_acumulado REAL`, `delta_xg REAL`, `perfil_clinico TEXT`, `taxa_conversao_pct REAL`.
   - Initialize values for existing reference athletes.
   - Update DDL in `scripts/scraper_sofascore_ratings_pipeline.py` if relevant.
4. **Feature 4 - Reversão do Bug Jogos=Gols (`jogadores_estatisticas`)**:
   - Compute authentic appearances from `escalacoes UNION gols UNION cartoes`.
   - Revert `total_jogos` and `media_gols_por_jogo` for the 2,705 athletes in `jogadores_estatisticas`.
   - Verify Luís Fabiano (ID 9033) has `total_jogos = 158`, `total_gols = 168`, `media_gols_por_jogo = 1.06`, keeping `gols_carreira_oficiais = 403` and `jogos_carreira_oficiais = 755` intact.
5. **Verification**:
   - Run `python scripts/auditar_integridade_dados.py` -> 12/12 rules OK.
   - Run `./.venv/bin/pytest tests/test_model_evals.py` -> 22/22 passed.
   - Run `./.venv/bin/pytest tests/test_e2e_futstats.py -m "r4"` -> all passed.
   - Check `ls -lh data/futebol.db` -> < 94.0 MB.

Please read:
- `/mnt/jogos_f/Antigravity_Projetos_e_Ferramentas/Guia profissional/PROJECT.md`
- `/mnt/jogos_f/Antigravity_Projetos_e_Ferramentas/Guia profissional/.agents/teamwork/ORIGINAL_REQUEST.md`
- `/mnt/jogos_f/Antigravity_Projetos_e_Ferramentas/Guia profissional/.agents/teamwork/teamwork_preview_explorer_m1_1/handoff.md`
- `/mnt/jogos_f/Antigravity_Projetos_e_Ferramentas/Guia profissional/.agents/teamwork/teamwork_preview_explorer_m1_2/handoff.md`
- `/mnt/jogos_f/Antigravity_Projetos_e_Ferramentas/Guia profissional/.agents/teamwork/teamwork_preview_explorer_m1_3/handoff.md`

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.
