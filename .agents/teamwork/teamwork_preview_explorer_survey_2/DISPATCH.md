# DISPATCH - Survey Explorer 2 (Backend & Advanced Metrics Engine)

## Mission
Investigate backend code, APIs, and statistical algorithms for FutStats:
1. Endpoints de perfil de atleta em `backend/` e como retornam estatísticas de carreira, jogos, gols e histórico de clubes.
2. Motor matemático de notas (0.0 a 10.0) baseado no algoritmo de compressão assintótica (tanh) posicional: como está implementado ou onde deve ser adicionado.
3. Métricas atômicas de Expected Goals (xG, npxG) e Eficiência Clínica (Delta xG): onde são calculadas/servidas e como evitar nulos nos principais atletas.
4. Radar Pentagonal (PES/FIFA style): quais são os 5 eixos, como são computados e expostos na API.
5. Suíte de testes `tests/test_model_evals.py` (22/22 testes): o que valida, Dixon-Coles, premissas matemáticas e restrições.

Please read:
- `/mnt/jogos_f/Antigravity_Projetos_e_Ferramentas/Guia profissional/.agents/teamwork/ORIGINAL_REQUEST.md`
- Backend routes, models, services, `tests/test_model_evals.py`.

Deliver your findings in `handoff.md` in this directory.

## 2026-10-30T18:22:56Z
You are Survey Explorer 2 (Backend & Advanced Metrics Engine).
Your working directory is:
/mnt/jogos_f/Antigravity_Projetos_e_Ferramentas/Guia profissional/.agents/teamwork/teamwork_preview_explorer_survey_2

Please read your dispatch instructions at:
/mnt/jogos_f/Antigravity_Projetos_e_Ferramentas/Guia profissional/.agents/teamwork/teamwork_preview_explorer_survey_2/DISPATCH.md
And the authoritative user request at:
/mnt/jogos_f/Antigravity_Projetos_e_Ferramentas/Guia profissional/.agents/teamwork/ORIGINAL_REQUEST.md

Your goal is to investigate backend/ routes, services, and prediction/evaluation modules:
1. Inspect athlete profile routes in backend/ (e.g. app.py, routes, athlete services) to see how career games, goals, average, and clubs are returned to the frontend.
2. Investigate the mathematical formula for player ratings (0.0 to 10.0) based on positional asymptotic compression (tanh): is there existing code or what mathematical definition should be implemented?
3. Investigate xG, npxG, and Delta xG calculations: where are they generated, why might there be null values for key athletes, and how to guarantee complete calculation.
4. Investigate Radar Pentagonal (PES/FIFA style): what are the 5 axes, how are they calculated, and how should the API structure this payload.
5. Inspect tests/test_model_evals.py (22/22 regression tests): analyze what these tests cover (Dixon-Coles, probability distributions, etc.) to ensure our changes do not break any of them.

Write your complete findings and recommendations to handoff.md in your working directory, and notify parent via send_message when done.
