# Task Assignment — Challenger M3-1 (Ratings & xG Stress Challenger)

## Identity
- **Role**: Challenger (teamwork_preview_challenger)
- **Milestone**: M3 (Motores Matemáticos de Ratings, xG & Backend APIs)
- **Working Directory**: `/mnt/jogos_f/Antigravity_Projetos_e_Ferramentas/Guia profissional/.agents/teamwork/teamwork_preview_challenger_m3_1`

## Mission
Empirically and adversarially challenge the mathematical engines integrated in Milestone M3:
1. Read Worker M3's handoff report at `/mnt/jogos_f/Antigravity_Projetos_e_Ferramentas/Guia profissional/.agents/teamwork/teamwork_preview_worker_m3/handoff.md`.
2. Adversarially test `/api/jogadores/perfil` across diverse athlete archetypes using the Flask test client:
   - Top scorers (Pedro ID 10, Luís Fabiano ID 9033, Gabigol ID 7): verify positive Delta xG, "Clínico de Elite" profile, non-null `xg_nao_penalti_npxg`.
   - Goalkeepers (Mycael ID 2066): verify 0.0 xG, "Neutro (Amostra Insuficiente)", rating evaluated as Goleiro.
   - Midfielders / Playmakers (Ganso ID 16, Alex ID 2373): verify rating and scouts.
   - Ancient historical legends (Pelé ID 11220, Zico ID 13953, Romário ID 12212): verify clean numbers without crashing.
3. Test edge cases:
   - Athlete with 0 minutes or 0 matches.
   - Null or missing scouts in database.
4. Verify tests pass:
   - `./.venv/bin/pytest tests/test_e2e_futstats.py -m "r3"`
   - `./.venv/bin/pytest tests/test_model_evals.py`
5. Deliver your evaluation and verdict (`APPROVE` or `REJECT`) in `handoff.md` in your working directory and notify parent via `send_message`.

## Authoritative Reference
- `/mnt/jogos_f/Antigravity_Projetos_e_Ferramentas/Guia profissional/.agents/teamwork/ORIGINAL_REQUEST.md`
- `/mnt/jogos_f/Antigravity_Projetos_e_Ferramentas/Guia profissional/PROJECT.md`

## 2026-10-30T21:22:29Z
You are Challenger M3-1 (Ratings & xG Stress Challenger).
Your working directory is:
/mnt/jogos_f/Antigravity_Projetos_e_Ferramentas/Guia profissional/.agents/teamwork/teamwork_preview_challenger_m3_1

Please read your dispatch instructions at:
/mnt/jogos_f/Antigravity_Projetos_e_Ferramentas/Guia profissional/.agents/teamwork/teamwork_preview_challenger_m3_1/DISPATCH.md
And PROJECT.md at:
/mnt/jogos_f/Antigravity_Projetos_e_Ferramentas/Guia profissional/PROJECT.md
And Worker M3's handoff report at:
/mnt/jogos_f/Antigravity_Projetos_e_Ferramentas/Guia profissional/.agents/teamwork/teamwork_preview_worker_m3/handoff.md
And ORIGINAL_REQUEST.md at:
/mnt/jogos_f/Antigravity_Projetos_e_Ferramentas/Guia profissional/.agents/teamwork/ORIGINAL_REQUEST.md

Empirically and adversarially challenge the mathematical engines (ratings tanh 0-10, discrete Opta xG, Delta xG, Clínico de Elite, goalkeepers fallback) across diverse athlete archetypes in /api/jogadores/perfil.
Write your report in handoff.md with a clear verdict: APPROVE or REJECT.
Notify parent via send_message when done.
