# Task Assignment — Reviewer M3-2 (Code Quality & Regressions Reviewer)

## Identity
- **Role**: Reviewer (teamwork_preview_reviewer)
- **Milestone**: M3 (Motores Matemáticos de Ratings, xG & Backend APIs)
- **Working Directory**: `/mnt/jogos_f/Antigravity_Projetos_e_Ferramentas/Guia profissional/.agents/teamwork/teamwork_preview_reviewer_m3_2`

## Mission
Independently review the work product of Milestone M3 executed by Worker M3, focusing on robustness, absence of regressions, database relational stats resync, and storage limits:
1. Read Worker M3's handoff report at `/mnt/jogos_f/Antigravity_Projetos_e_Ferramentas/Guia profissional/.agents/teamwork/teamwork_preview_worker_m3/handoff.md`.
2. Inspect `data/futebol.db`:
   - Verify that `total_gols` in `jogadores_estatisticas` is 100% in sync with `COUNT(gols)` (0 discrepancies).
   - Verify that Alex Cabeção (ID 2373) has `total_gols = 146` and `total_jogos = 141`.
   - Check database size (`< 94.0 MB`).
3. Run verification commands:
   - `./.venv/bin/pytest tests/test_e2e_futstats.py` (Must pass 50/50 tests).
   - `./.venv/bin/pytest tests/test_model_evals.py` (Must pass 22/22 tests).
   - `python scripts/auditar_integridade_dados.py` (Must pass 12/12 rules OK).
   - `npm run build --prefix frontend` (Exit code 0).
4. Deliver your evaluation and verdict (`APPROVE` or `REQUEST_CHANGES`) in `handoff.md` in your working directory and notify parent via `send_message`.

## Authoritative Reference
- `/mnt/jogos_f/Antigravity_Projetos_e_Ferramentas/Guia profissional/.agents/teamwork/ORIGINAL_REQUEST.md`
- `/mnt/jogos_f/Antigravity_Projetos_e_Ferramentas/Guia profissional/PROJECT.md`

## 2026-10-30T21:22:29Z
You are Reviewer M3-2 (Code Quality & Regressions Reviewer).
Your working directory is:
/mnt/jogos_f/Antigravity_Projetos_e_Ferramentas/Guia profissional/.agents/teamwork/teamwork_preview_reviewer_m3_2

Please read your dispatch instructions at:
/mnt/jogos_f/Antigravity_Projetos_e_Ferramentas/Guia profissional/.agents/teamwork/teamwork_preview_reviewer_m3_2/DISPATCH.md
And PROJECT.md at:
/mnt/jogos_f/Antigravity_Projetos_e_Ferramentas/Guia profissional/PROJECT.md
And Worker M3's handoff report at:
/mnt/jogos_f/Antigravity_Projetos_e_Ferramentas/Guia profissional/.agents/teamwork/teamwork_preview_worker_m3/handoff.md
And ORIGINAL_REQUEST.md at:
/mnt/jogos_f/Antigravity_Projetos_e_Ferramentas/Guia profissional/.agents/teamwork/ORIGINAL_REQUEST.md

Independently review the work product of Milestone M3. Check data/futebol.db total_gols resync, database size (<94.0 MB), absence of regressions, frontend build, and run test suites.
Write your report in handoff.md with a clear verdict: APPROVE or REQUEST_CHANGES.
Notify parent via send_message when done.

