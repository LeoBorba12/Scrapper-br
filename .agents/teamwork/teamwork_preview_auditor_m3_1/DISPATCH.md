# Task Assignment — Forensic Auditor M3 (Forensic Integrity Auditor)

## Identity
- **Role**: Forensic Auditor (teamwork_preview_auditor)
- **Milestone**: M3 (Motores Matemáticos de Ratings, xG & Backend APIs)
- **Working Directory**: `/mnt/jogos_f/Antigravity_Projetos_e_Ferramentas/Guia profissional/.agents/teamwork/teamwork_preview_auditor_m3_1`

## Mission
Perform a rigorous forensic integrity audit on Milestone M3:
1. Read Worker M3's handoff report at `/mnt/jogos_f/Antigravity_Projetos_e_Ferramentas/Guia profissional/.agents/teamwork/teamwork_preview_worker_m3/handoff.md`.
2. Inspect `git diff` for all files touched by Worker M3 (`backend/app.py`, `backend/calculo_player_rating.py`, `backend/calculo_xg_discreto.py`, `data/futebol.db`):
   - Did Worker M3 cheat?
   - Did Worker M3 hardcode test return values, mock responses, or tamper with tests?
   - Are the mathematical implementations genuine, sound, and properly integrated?
   - Is `backend/calculo_player_rating.py` genuinely using tanh compression?
   - Is `backend/calculo_xg_discreto.py` genuinely using discrete Opta modeling?
3. Verify database storage and integrity:
   - `data/futebol.db` size is strictly under 94.0 MB (84.53 MB).
   - `PRAGMA integrity_check` returns `ok`.
4. Run independent verification commands:
   - `./.venv/bin/pytest tests/test_e2e_futstats.py` (Verify 50/50 pass).
   - `./.venv/bin/pytest tests/test_model_evals.py` (Verify 22/22 pass).
   - `python scripts/auditar_integridade_dados.py` (Verify 12/12 rules OK).
5. Deliver your audit and verdict (`CLEAN` or `INTEGRITY VIOLATION`) in `handoff.md` in your working directory and notify parent via `send_message`.

## Authoritative Reference
- `/mnt/jogos_f/Antigravity_Projetos_e_Ferramentas/Guia profissional/.agents/teamwork/ORIGINAL_REQUEST.md`
- `/mnt/jogos_f/Antigravity_Projetos_e_Ferramentas/Guia profissional/PROJECT.md`

## 2026-10-30T21:22:29Z
You are Forensic Auditor M3 (teamwork_preview_auditor).
Your working directory is:
/mnt/jogos_f/Antigravity_Projetos_e_Ferramentas/Guia profissional/.agents/teamwork/teamwork_preview_auditor_m3_1

Please read your dispatch instructions at:
/mnt/jogos_f/Antigravity_Projetos_e_Ferramentas/Guia profissional/.agents/teamwork/teamwork_preview_auditor_m3_1/DISPATCH.md
And PROJECT.md at:
/mnt/jogos_f/Antigravity_Projetos_e_Ferramentas/Guia profissional/PROJECT.md
And Worker M3's handoff report at:
/mnt/jogos_f/Antigravity_Projetos_e_Ferramentas/Guia profissional/.agents/teamwork/teamwork_preview_worker_m3/handoff.md
And ORIGINAL_REQUEST.md at:
/mnt/jogos_f/Antigravity_Projetos_e_Ferramentas/Guia profissional/.agents/teamwork/ORIGINAL_REQUEST.md

Perform a forensic integrity audit on Milestone M3. Check git diff for files touched by Worker M3. Verify no hardcoded test shortcuts, facades, or test tampering. Check database size (84.53 MB < 94.0 MB), PRAGMA integrity_check, 50/50 e2e tests passing, 22/22 model evals, and 12/12 audit rules.
Write your report in handoff.md with a clear verdict: CLEAN or INTEGRITY VIOLATION.
Notify parent via send_message when done.
