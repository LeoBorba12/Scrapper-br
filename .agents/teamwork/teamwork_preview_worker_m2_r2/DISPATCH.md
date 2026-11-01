## 2026-11-01T15:31:12Z

You are teamwork_preview_worker_m2_r2, the Implementation Worker for Milestone 2: Massive Historical Match Sheets and Goals Ingestion.

Working directory: /mnt/jogos_f/Antigravity_Projetos_e_Ferramentas/Guia profissional/.agents/teamwork/teamwork_preview_worker_m2_r2
Maintain progress.md in your working directory with 'Last visited: [timestamp]'.

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Authoritative user request:
Read /mnt/jogos_f/Antigravity_Projetos_e_Ferramentas/Guia profissional/.agents/teamwork/ORIGINAL_REQUEST.md (specifically see section ## 2026-11-01T14:16:05Z).

Project Blueprint:
Read /mnt/jogos_f/Antigravity_Projetos_e_Ferramentas/Guia profissional/PROJECT.md (Milestone 2).

Survey Findings Reference:
Read /mnt/jogos_f/Antigravity_Projetos_e_Ferramentas/Guia profissional/.agents/teamwork/teamwork_preview_explorer_survey2_2/handoff.md.

Test Contract Target:
Read /mnt/jogos_f/Antigravity_Projetos_e_Ferramentas/Guia profissional/TEST_READY.md (Section 3 targets for M2:
1. `test_t1_ingestion_goal_count_threshold` > 95,522 goals
2. `test_t1_ingestion_goal_schema_and_types` canonical types: {'Normal', 'Pênalti', 'Falta', 'Contra', 'Cabeça'}
3. `test_t1_ingestion_match_sheet_lineup_and_goal_club_coherence` 0 club mismatches).

Files you exclusively own:
- scripts/ingerir_cache_ogol_existente.py
- scripts/consolidar_duplicatas_partidas.py
- scripts/ingestor_sumulas_massivo_ogol.py
- data/futebol.db (database writes, schema maintenance, VACUUM)
- .agents/teamwork/teamwork_preview_worker_m2_r2/*

Mission & Scope:
Execute Milestone 2 to massively expand the cataloged match sheets and goals:
1. Harvest local cached match sheets: Create and run `scripts/ingerir_cache_ogol_existente.py` to ingest the 6,225 files and 16,535 goals in `data/cache_ogol_brasileirao/` into `gols` and `escalacoes`.
2. Consolidate duplicates: Create and run `scripts/consolidar_duplicatas_partidas.py` to canonicalize the 3,710 almost-duplicate matches across Serie A and Copa do Brasil.
3. Batch Ingestion: Create and run `scripts/ingestor_sumulas_massivo_ogol.py` for pending historical matches in Serie A (2003-present) and Copa do Brasil.
4. Normalize and harmonize goal types to the canonical taxonomy: `{'Normal', 'Pênalti', 'Falta', 'Contra', 'Cabeça'}`.
5. Harmonize historical club names in `gols` so that `gols.clube` matches `partidas.mandante` or `partidas.visitante`.
6. Ensure total cataloged goals strictly exceeds 95,522 (aiming for > 100,000 goals).
7. Execute VACUUM to ensure `data/futebol.db` remains strictly < 94.0 MB (recommended < 90.0 MB).
8. Verify regression gates:
   - `python3 scripts/auditar_integridade_dados.py` (all 12 rules OK, 0 anomalies)
   - `.venv/bin/pytest tests/test_model_evals.py` (22/22 passed)
   - `.venv/bin/pytest tests/test_proxy_fallback.py` (20/20 passed)
   - `.venv/bin/pytest tests/test_e2e_decoupled.py -k "ingestion"` (all ingestion tests passed)
   - `npm run build --prefix frontend` (exit code 0)
9. Write complete handoff report to .agents/teamwork/teamwork_preview_worker_m2_r2/handoff.md.

When finished, send a message to orchestrator parent conversation ID da7384f3-57a9-4b6b-9373-94dcd5a6f441 summarizing deliverables, new goal counts, and verification outputs.
