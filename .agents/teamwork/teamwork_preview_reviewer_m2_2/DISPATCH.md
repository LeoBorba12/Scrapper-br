# Task Assignment — Reviewer M2-2 (Regression & Storage Reviewer)

## Identity
- **Role**: Reviewer (teamwork_preview_reviewer)
- **Milestone**: M2 (Auto-Cura de Clubes Espúrios, Conmebol & Homônimos)
- **Working Directory**: `/mnt/jogos_f/Antigravity_Projetos_e_Ferramentas/Guia profissional/.agents/teamwork/teamwork_preview_reviewer_m2_2`

## Mission
Independently review the work product of Milestone M2 executed by Worker M2, focusing on robustness, absence of regressions, and database storage limits:
1. Read Worker M2's handoff report at `/mnt/jogos_f/Antigravity_Projetos_e_Ferramentas/Guia profissional/.agents/teamwork/teamwork_preview_worker_m2/handoff.md`.
2. Verify that `data/futebol.db` size is strictly below 94.0 MB (`ls -lh data/futebol.db` or `stat`) and that `PRAGMA integrity_check` returns `ok`.
3. Verify that Luís Fabiano (ID 9033) exhibits strictly authentic clubs ('Vasco, São Paulo, Ponte Preta') with 0 foreign Conmebol clubs.
4. Run verification commands:
   - `python scripts/auditar_integridade_dados.py` (Must pass 12/12 rules OK).
   - `./.venv/bin/pytest tests/test_model_evals.py` (Must pass 22/22 tests).
   - `./.venv/bin/pytest tests/test_e2e_futstats.py -m "r4"` (Must pass storage & integrity tests).
5. Deliver your evaluation and verdict (`APPROVE` or `REQUEST_CHANGES`) in `handoff.md` in your working directory and notify parent via `send_message`.

## Authoritative Reference
- `/mnt/jogos_f/Antigravity_Projetos_e_Ferramentas/Guia profissional/.agents/teamwork/ORIGINAL_REQUEST.md`
- `/mnt/jogos_f/Antigravity_Projetos_e_Ferramentas/Guia profissional/PROJECT.md`

## 2026-10-30T20:38:53Z
You are Reviewer M2-2 (Regression & Storage Reviewer).
Your working directory is:
/mnt/jogos_f/Antigravity_Projetos_e_Ferramentas/Guia profissional/.agents/teamwork/teamwork_preview_reviewer_m2_2

Please read your dispatch instructions at:
/mnt/jogos_f/Antigravity_Projetos_e_Ferramentas/Guia profissional/.agents/teamwork/teamwork_preview_reviewer_m2_2/DISPATCH.md
And PROJECT.md at:
/mnt/jogos_f/Antigravity_Projetos_e_Ferramentas/Guia profissional/PROJECT.md
And Worker M2's handoff report at:
/mnt/jogos_f/Antigravity_Projetos_e_Ferramentas/Guia profissional/.agents/teamwork/teamwork_preview_worker_m2/handoff.md
And ORIGINAL_REQUEST.md at:
/mnt/jogos_f/Antigravity_Projetos_e_Ferramentas/Guia profissional/.agents/teamwork/ORIGINAL_REQUEST.md

Independently review the work product of Milestone M2. Verify database storage size (<94.0 MB), PRAGMA integrity_check, Luís Fabiano ID 9033 clean clubs, absence of regressions, scripts/auditar_integridade_dados.py, and pytest tests/test_e2e_futstats.py -m "r4".
Write your report in handoff.md with a clear verdict: APPROVE or REQUEST_CHANGES.
Notify parent via send_message when done.

