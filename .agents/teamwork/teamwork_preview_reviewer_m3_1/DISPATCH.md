# Task Assignment — Reviewer M3-1 (Math Models & API Reviewer)

## Identity
- **Role**: Reviewer (teamwork_preview_reviewer)
- **Milestone**: M3 (Motores Matemáticos de Ratings, xG & Backend APIs)
- **Working Directory**: `/mnt/jogos_f/Antigravity_Projetos_e_Ferramentas/Guia profissional/.agents/teamwork/teamwork_preview_reviewer_m3_1`

## Mission
Independently review the work product of Milestone M3 executed by Worker M3:
1. Read Worker M3's handoff report at `/mnt/jogos_f/Antigravity_Projetos_e_Ferramentas/Guia profissional/.agents/teamwork/teamwork_preview_worker_m3/handoff.md`.
2. Review the code changes in `backend/app.py`, `backend/calculo_player_rating.py`, and `backend/calculo_xg_discreto.py`.
   - Verify Feature 8: `calcular_nota_partida_sofascore` integration, dynamic fallback (`fonte: "futstats_scouting"`).
   - Verify Feature 9: Opta discrete xG model, elimination of `1.08*gols`, positive Delta xG, "Clínico de Elite" profile.
   - Verify Feature 10: Radar Pentagonal PES 5 axes + ovr in 40-99 with zero nulls.
   - Verify Feature 11: `acervo_parcial: true`, `jogos_rotulo: "Jogos c/ Gol"`, authentic career average `media_gols: 0.53` for Luís Fabiano ID 9033.
3. Run verification commands:
   - `./.venv/bin/pytest tests/test_e2e_futstats.py` (Must pass 50/50 tests).
   - `./.venv/bin/pytest tests/test_model_evals.py` (Must pass 22/22 tests).
   - `python scripts/auditar_integridade_dados.py` (Must pass 12/12 rules OK).
4. Deliver your evaluation and verdict (`APPROVE` or `REQUEST_CHANGES`) in `handoff.md` in your working directory and notify parent via `send_message`.

## Authoritative Reference
- `/mnt/jogos_f/Antigravity_Projetos_e_Ferramentas/Guia profissional/.agents/teamwork/ORIGINAL_REQUEST.md`
- `/mnt/jogos_f/Antigravity_Projetos_e_Ferramentas/Guia profissional/PROJECT.md`

## 2026-10-30T21:22:29Z
You are Reviewer M3-1 (Math Models & API Reviewer).
Your working directory is:
/mnt/jogos_f/Antigravity_Projetos_e_Ferramentas/Guia profissional/.agents/teamwork/teamwork_preview_reviewer_m3_1

Please read your dispatch instructions at:
/mnt/jogos_f/Antigravity_Projetos_e_Ferramentas/Guia profissional/.agents/teamwork/teamwork_preview_reviewer_m3_1/DISPATCH.md
And PROJECT.md at:
/mnt/jogos_f/Antigravity_Projetos_e_Ferramentas/Guia profissional/PROJECT.md
And Worker M3's handoff report at:
/mnt/jogos_f/Antigravity_Projetos_e_Ferramentas/Guia profissional/.agents/teamwork/teamwork_preview_worker_m3/handoff.md
And ORIGINAL_REQUEST.md at:
/mnt/jogos_f/Antigravity_Projetos_e_Ferramentas/Guia profissional/.agents/teamwork/ORIGINAL_REQUEST.md

Independently review the work product of Milestone M3. Review the code changes in backend/app.py, backend/calculo_player_rating.py, and backend/calculo_xg_discreto.py. Run pytest tests/test_e2e_futstats.py, pytest tests/test_model_evals.py, and python scripts/auditar_integridade_dados.py.
Write your report in handoff.md with a clear verdict: APPROVE or REQUEST_CHANGES.
Notify parent via send_message when done.

