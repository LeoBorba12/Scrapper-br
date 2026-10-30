# Task Assignment — Forensic Auditor M2 (Forensic Integrity Auditor)

## Identity
- **Role**: Forensic Auditor (teamwork_preview_auditor)
- **Milestone**: M2 (Auto-Cura de Clubes Espúrios, Conmebol & Homônimos)
- **Working Directory**: `/mnt/jogos_f/Antigravity_Projetos_e_Ferramentas/Guia profissional/.agents/teamwork/teamwork_preview_auditor_m2_1`

## Mission
Perform a rigorous forensic integrity audit on Milestone M2:
1. Read Worker M2's handoff report at `/mnt/jogos_f/Antigravity_Projetos_e_Ferramentas/Guia profissional/.agents/teamwork/teamwork_preview_worker_m2/handoff.md`.
2. Inspect `scripts/migrar_m2_conmebol_homonimos_clubes.py` and `git diff` or changes made by Worker M2.
   - Did Worker M2 cheat?
   - Did Worker M2 hardcode test results, create dummy or mock strings in tests or codebase?
   - Are the database updates genuine, relational, and non-destructive?
3. Verify that `data/futebol.db` size is genuinely under 94.0 MB (84.44 MB) and `PRAGMA integrity_check` returns `ok`.
4. Run independent verification commands:
   - `python scripts/auditar_integridade_dados.py` (Verify all 12 rules).
   - `./.venv/bin/pytest tests/test_model_evals.py` (Verify 22/22 pass).
   - `./.venv/bin/pytest tests/test_e2e_futstats.py -m "r2 or r4"` (Verify all 19 pass).
5. Deliver your audit and verdict (`CLEAN` or `INTEGRITY VIOLATION`) in `handoff.md` in your working directory and notify parent via `send_message`.

## Authoritative Reference
- `/mnt/jogos_f/Antigravity_Projetos_e_Ferramentas/Guia profissional/.agents/teamwork/ORIGINAL_REQUEST.md`
- `/mnt/jogos_f/Antigravity_Projetos_e_Ferramentas/Guia profissional/PROJECT.md`

## 2026-10-30T20:38:53Z
You are Forensic Auditor M2 (teamwork_preview_auditor).
Your working directory is:
/mnt/jogos_f/Antigravity_Projetos_e_Ferramentas/Guia profissional/.agents/teamwork/teamwork_preview_auditor_m2_1

Please read your dispatch instructions at:
/mnt/jogos_f/Antigravity_Projetos_e_Ferramentas/Guia profissional/.agents/teamwork/teamwork_preview_auditor_m2_1/DISPATCH.md
And PROJECT.md at:
/mnt/jogos_f/Antigravity_Projetos_e_Ferramentas/Guia profissional/PROJECT.md
And Worker M2's handoff report at:
/mnt/jogos_f/Antigravity_Projetos_e_Ferramentas/Guia profissional/.agents/teamwork/teamwork_preview_worker_m2/handoff.md
And ORIGINAL_REQUEST.md at:
/mnt/jogos_f/Antigravity_Projetos_e_Ferramentas/Guia profissional/.agents/teamwork/ORIGINAL_REQUEST.md

Perform a forensic integrity audit on Milestone M2. Verify that Worker M2 did not cheat, hardcode test outputs, or create fake implementations. Verify genuine database updates, DB size (84.44 MB < 94.0 MB), PRAGMA integrity_check, 12/12 audit rules, 22/22 model evals, and 19/19 e2e r2/r4 tests.
Write your report in handoff.md with a clear verdict: CLEAN or INTEGRITY VIOLATION.
Notify parent via send_message when done.
