## 2026-11-01T16:15:00Z
You are teamwork_preview_explorer_m2_fix_1, an Explorer formulating the remediation plan for Milestone 2: Massive Historical Match Sheets and Goals Ingestion (Iteration 4).

Working directory: /mnt/jogos_f/Antigravity_Projetos_e_Ferramentas/Guia profissional/.agents/teamwork/teamwork_preview_explorer_m2_fix_1
Maintain progress.md in your working directory with 'Last visited: [timestamp]'.

Authoritative user request:
Read /mnt/jogos_f/Antigravity_Projetos_e_Ferramentas/Guia profissional/.agents/teamwork/ORIGINAL_REQUEST.md (specifically see section ## 2026-11-01T14:16:05Z).

Challenger Feedback:
Read /mnt/jogos_f/Antigravity_Projetos_e_Ferramentas/Guia profissional/.agents/teamwork/teamwork_preview_challenger_m2_r2/handoff.md.
Read /mnt/jogos_f/Antigravity_Projetos_e_Ferramentas/Guia profissional/tests/test_challenger_m2_r2_adversarial.py.

Mission & Scope:
You are in READ-ONLY mode. Do NOT modify source code or run destructive operations.
Formulate an exact remediation plan and patch/migration script for the 4 issues identified by Challenger M2:
1. Score Cap Guard Failure:
   - In `scripts/ingestor_sumulas_massivo_ogol.py` (line ~466) and `scripts/ingerir_cache_ogol_existente.py` (line ~307):
     Fix `if existentes_pid >= expected_goals and expected_goals > 0: continue` so that when `expected_goals == 0` (or `gols_mandante + gols_visitante == 0`), NO goals are ever ingested into that match.
   - Also enforce tournament/competition matching in the query to avoid cross-tournament date collisions (e.g. Copa do Brasil vs Brasileirão +-3 days).
2. Purge Ingested Goals in 0-0 Matches:
   - In `data/futebol.db`: identify and clean up goals ingested into matches with score 0-0 (specifically match 5189 Grêmio 0x0 Coritiba and match 6549 São Paulo 0x0 Bahia).
3. Expand Multi-Minute Goal Rows (1NF Violation):
   - Find rows in `gols` where `minuto` contains multiple space-separated minutes (e.g. `'45+3  83'`, `'23  26  40'`).
   - Create a clean expansion logic/script to split these into individual 1-minute goal rows, preserving total goals and career totals accurately.
4. Clean Scraper Attendance Artifacts:
   - Expunge goals where `atleta LIKE 'att-%'`, `minuto = 0`, or `minuto > 130` (e.g. `id_gol 59191`, `59193`, `20263340`).
5. Verify that running `pytest tests/test_challenger_m2_r2_adversarial.py -v` will pass 100% (7/7 tests).

Write your detailed findings, remediation script design, and verification plan to:
/mnt/jogos_f/Antigravity_Projetos_e_Ferramentas/Guia profissional/.agents/teamwork/teamwork_preview_explorer_m2_fix_1/handoff.md

Notify parent da7384f3-57a9-4b6b-9373-94dcd5a6f441 via send_message when done.
