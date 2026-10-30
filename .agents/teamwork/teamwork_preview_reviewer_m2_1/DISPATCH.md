# Task Assignment — Reviewer M2-1 (Code & Relational Consistency Reviewer)

## Identity
- **Role**: Reviewer (teamwork_preview_reviewer)
- **Milestone**: M2 (Auto-Cura de Clubes Espúrios, Conmebol & Homônimos)
- **Working Directory**: `/mnt/jogos_f/Antigravity_Projetos_e_Ferramentas/Guia profissional/.agents/teamwork/teamwork_preview_reviewer_m2_1`

## Mission
Independently review the work product of Milestone M2 executed by Worker M2:
1. Read Worker M2's handoff report at `/mnt/jogos_f/Antigravity_Projetos_e_Ferramentas/Guia profissional/.agents/teamwork/teamwork_preview_worker_m2/handoff.md`.
2. Inspect the migration script `scripts/migrar_m2_conmebol_homonimos_clubes.py` and verify that the SQL queries executed on `data/futebol.db` correctly rectified Conmebol matches (19997098, 20027112), deleted ghost match 202430275, decoupled homonyms (Mycael ID 2066, Pedro ID 10, Ganso ID 16, Alex ID 2373, Thiago Maia ID 195), and sanitized spurious club strings.
3. Run verification commands:
   - `python scripts/auditar_integridade_dados.py` (Must pass 12/12 rules OK).
   - `./.venv/bin/pytest tests/test_model_evals.py` (Must pass 22/22 tests).
   - `./.venv/bin/pytest tests/test_e2e_futstats.py -m "r2"` (All R2 tests must pass).
4. Deliver your evaluation and verdict (`APPROVE` or `REQUEST_CHANGES`) in `handoff.md` in your working directory and notify parent via `send_message`.

## Authoritative Reference
- `/mnt/jogos_f/Antigravity_Projetos_e_Ferramentas/Guia profissional/.agents/teamwork/ORIGINAL_REQUEST.md`
- `/mnt/jogos_f/Antigravity_Projetos_e_Ferramentas/Guia profissional/PROJECT.md`

## 2026-10-30T20:38:53Z
You are Reviewer M2-1 (Code & Relational Consistency Reviewer).
Your working directory is:
/mnt/jogos_f/Antigravity_Projetos_e_Ferramentas/Guia profissional/.agents/teamwork/teamwork_preview_reviewer_m2_1

Please read your dispatch instructions at:
/mnt/jogos_f/Antigravity_Projetos_e_Ferramentas/Guia profissional/.agents/teamwork/teamwork_preview_reviewer_m2_1/DISPATCH.md
And PROJECT.md at:
/mnt/jogos_f/Antigravity_Projetos_e_Ferramentas/Guia profissional/PROJECT.md
And Worker M2's handoff report at:
/mnt/jogos_f/Antigravity_Projetos_e_Ferramentas/Guia profissional/.agents/teamwork/teamwork_preview_worker_m2/handoff.md
And ORIGINAL_REQUEST.md at:
/mnt/jogos_f/Antigravity_Projetos_e_Ferramentas/Guia profissional/.agents/teamwork/ORIGINAL_REQUEST.md

Independently review the work product of Milestone M2. Verify the migration script scripts/migrar_m2_conmebol_homonimos_clubes.py and the database rectifications. Run scripts/auditar_integridade_dados.py, pytest tests/test_model_evals.py, and pytest tests/test_e2e_futstats.py -m "r2".
Write your report in handoff.md with a clear verdict: APPROVE or REQUEST_CHANGES.
Notify parent via send_message when done.

