# Task Assignment — Worker M3 (Motores Matemáticos de Ratings, xG & Backend APIs)

## Identity
- **Role**: Worker (teamwork_preview_worker)
- **Milestone**: M3 (Features 8, 9, 10, 11 from PROJECT.md)
- **Working Directory**: `/mnt/jogos_f/Antigravity_Projetos_e_Ferramentas/Guia profissional/.agents/teamwork/teamwork_preview_worker_m3`

## Exclusively Owned Files / Scope
- `backend/app.py`
- `backend/calculo_player_rating.py`
- `backend/calculo_xg_discreto.py`
- `data/futebol.db` (for relational stats resync)

## Input Documents
Read the authoritative request and master plan:
- `/mnt/jogos_f/Antigravity_Projetos_e_Ferramentas/Guia profissional/.agents/teamwork/ORIGINAL_REQUEST.md`
- `/mnt/jogos_f/Antigravity_Projetos_e_Ferramentas/Guia profissional/PROJECT.md`

Read the 3 detailed handoff reports and code patches from M3 Explorers:
- `/mnt/jogos_f/Antigravity_Projetos_e_Ferramentas/Guia profissional/.agents/teamwork/teamwork_preview_explorer_m3_1/handoff.md`
- `/mnt/jogos_f/Antigravity_Projetos_e_Ferramentas/Guia profissional/.agents/teamwork/teamwork_preview_explorer_m3_2/handoff.md`
- `/mnt/jogos_f/Antigravity_Projetos_e_Ferramentas/Guia profissional/.agents/teamwork/teamwork_preview_explorer_m3_3/handoff.md`

## Implementation Tasks

1. **Feature 8 (Player Rating Integration)**:
   - In `backend/calculo_player_rating.py`: Update `normalizar_posicao` to recognize English terms (`"Goalkeeper"` -> `"Goleiro"`, `"Defender"` -> `"Zagueiro"`, `"Back"` -> `"Lateral"`, `"Midfield"` -> `"Meia"`, `"Wing"` -> `"Ponta"`), add `calcular_rating_medio_temporada` and `calcular_impacto_tatico`.
   - In `backend/app.py`: Import functions from `calculo_player_rating`. In `_construir_perfil_jogador`, populate `resumo_dados["sofascore"]` using `atleta_sofascore_ratings` when available (`fonte: "sofascore"`), and fall back dynamically to iterating over in-memory `partidas_ordenadas` with `calcular_nota_partida_sofascore` when no precomputed row exists (`fonte: "futstats_scouting"`).

2. **Feature 9 (Discrete Opta xG Engine & Clinical Profile)**:
   - In `backend/calculo_xg_discreto.py`: Add `classificar_perfil_finalizador` and `estimar_xg_gols_atleta` with discrete Opta parameters (`PENALTY_XG = 0.760`, open target = 0.205, off target = 0.035).
   - In `backend/app.py`: Import from `calculo_xg_discreto`. Replace flawed inline formula `xg = 1.08 * gols` with `estimar_xg_gols_atleta`. Ensure `analytics_xg` includes `xg_acumulado`, `xg_nao_penalti_npxg`, `delta_xg`, `perfil_clinico` ("Clínico de Elite" for top finishers with positive delta xG), and `taxa_conversao_pct`. Ensure goalkeepers get `0.0` and `"Neutro (Amostra Insuficiente)"`.

3. **Feature 10 (Radar Pentagonal PES 5 Axes & OVR)**:
   - In `backend/app.py`: Update `_calcular_radar_pes` to harden against nulls and type errors. Guarantee all 5 axes (`atk`, `fin`, `cri`, `fis`, `def`) and `ovr` are strictly bounded integers within [40, 99] with zero nulls.

4. **Feature 11 (Honest Label "Jogos c/ Gol" & Career Average)**:
   - In `backend/app.py` in `_construir_perfil_jogador`:
     - When `acervo_parcial` is true (non-championship filtered and `(raw_jogos_carreira > total_jogos or total_jogos <= total_gols_final)`):
       - Return `acervo_parcial: True`.
       - Return `jogos_rotulo: "Jogos c/ Gol"`.
       - Return `media_gols`: authentic weighted career average `media_oficial_carreira` (`carreira_oficial["gols"] / carreira_oficial["jogos"]`, e.g. 0.53 for Luís Fabiano ID 9033).
       - Return `jogos_registrados: total_jogos`.
       - Return `media_oficial_carreira: carreira_oficial["gols"] / carreira_oficial["jogos"]`.
     - When `acervo_parcial` is false:
       - Return `acervo_parcial: False`, `jogos_rotulo: "Jogos"`, `media_gols: round(total_gols_final / max(total_jogos, 1), 2)`.

5. **Relational Stats Resync in `data/futebol.db`**:
   - Execute the SQL resync queries on `jogadores_estatisticas` and `jogadores` to align `total_gols`, `participacoes_gols`, and `media_gols_por_jogo` with the actual rows in `gols` for the 129 athletes affected by M2 ghost goal deletions and Alex Cabeção ID 2373 (146 goals).

6. **Verification Tests (Mandatory)**:
   - `./.venv/bin/pytest tests/test_e2e_futstats.py` (All 50 tests MUST PASS).
   - `./.venv/bin/pytest tests/test_model_evals.py` (22/22 MUST PASS).
   - `python scripts/auditar_integridade_dados.py` (12/12 rules OK).
   - Check file size: `data/futebol.db` < 94.0 MB.

## MANDATORY INTEGRITY WARNING
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

## Deliverables
- Deliver complete execution log, code changes summary, and verification test outputs in `handoff.md` in your working directory.
- Notify parent via `send_message` when done.
