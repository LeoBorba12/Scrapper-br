# BRIEFING — 2026-10-30T18:34:00Z

## Mission
Investigate backend routes, athlete services, tanh rating formulas, xG/npxG/Delta xG pipelines, pentagonal radar metrics, and test_model_evals.py constraints.

## 🔒 My Identity
- Archetype: explorer
- Roles: Backend & Advanced Metrics Engine Explorer
- Working directory: /mnt/jogos_f/Antigravity_Projetos_e_Ferramentas/Guia profissional/.agents/teamwork/teamwork_preview_explorer_survey_2
- Original parent: 9c2d948a-bd66-4e27-83b1-9e8d50e60942
- Milestone: Investigation & Survey of Backend & Advanced Metrics

## 🔒 Key Constraints
- Read-only investigation — do NOT implement
- Maintain SQLite database under 94.0 MB limit
- Respect 22/22 regression tests in tests/test_model_evals.py
- Do not write to project source code files during survey

## Current Parent
- Conversation ID: 9c2d948a-bd66-4e27-83b1-9e8d50e60942
- Updated: 2026-10-30T18:34:00Z

## Investigation State
- **Explored paths**:
  - `backend/app.py` (`_construir_perfil_jogador`, `_calcular_radar_pes`, `_calcular_scouts_profissionais`, `gerar_dados_espaciais_atleta`, endpoints `/api/jogadores/*`, `_calc_poisson_bivariate`)
  - `backend/calculo_player_rating.py` (complete positional tanh rating engine)
  - `backend/calculo_xg_discreto.py` (discrete xG and npxG matrix and clinical classification)
  - `tests/test_model_evals.py` (22/22 regression tests for Dixon-Coles bivariate Poisson)
  - `scripts/auditar_integridade_dados.py`, `scripts/sanitizar_dashboard_e_atletas.py`, `scripts/scraper_sofascore_ratings_pipeline.py`
  - `frontend/src/components/ProtagonistaAtleta.jsx`, `frontend/src/components/charts/RadarPentagonPES.jsx`
  - `data/futebol.db` (tables `jogadores_estatisticas`, `atleta_sofascore_ratings`, `gols`, `escalacoes`, `partidas`)
- **Key findings**:
  - 2,705 athletes have `total_jogos == total_gols >= 5` with 1.00 average due to legacy clamping `MAX(total_jogos, total_gols)`.
  - `calculo_player_rating.py` and `calculo_xg_discreto.py` are fully written with high mathematical fidelity but are NOT wired into `backend/app.py`.
  - `atleta_sofascore_ratings` has only 8 hardcoded rows; all other athletes return null sofascore badges.
  - The inline xG heuristic in `app.py` produced negative Delta xG for all elite strikers (falsely classifying Romário, Luís Fabiano, Pedro, Cano as "Volume Shooters") and lacked `npxG`.
  - Conmebol inverted matches (e.g. 19997098, 20027112) caused spurious foreign clubs (River Plate) in profiles of Brazilian players (Alex, Roque Junior, Zinho, Rodrigo Mendes, Thiago Mendes).
  - `tests/test_model_evals.py` (22/22 tests) validates solely `_calc_poisson_bivariate` in `backend/app.py` and is unaffected by athlete/rating modifications.
  - `data/futebol.db` size is 92.36 MB, leaving a tight 1.64 MB buffer before the 94.0 MB Vercel limit.
- **Unexplored areas**: None for backend survey scope.

## Key Decisions Made
- Completed full root-cause diagnosis and mapped surgical integration paths in `handoff.md`.

## Artifact Index
- DISPATCH.md — Dispatch instructions
- BRIEFING.md — Situational awareness
- progress.md — Liveness heartbeat
- handoff.md — Complete 5-component handoff report
