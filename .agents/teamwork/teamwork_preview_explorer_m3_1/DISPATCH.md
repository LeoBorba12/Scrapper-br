# Task Assignment — Explorer M3-1 (Player Rating Integration & Dynamic Fallback Engine)

## Identity
- **Role**: Explorer (teamwork_preview_explorer)
- **Milestone**: M3 (Motores Matemáticos de Ratings, xG & Backend APIs)
- **Working Directory**: `/mnt/jogos_f/Antigravity_Projetos_e_Ferramentas/Guia profissional/.agents/teamwork/teamwork_preview_explorer_m3_1`

## Mission
Investigate and formulate the exact code modifications for `backend/app.py` to integrate the Player Rating engine (Feature 8 of PROJECT.md):
1. Inspect `backend/calculo_player_rating.py`:
   - Understand the mathematical model: asymptotic `tanh` compression (range 0.0 - 10.0, base 6.50).
   - Functions: `calcular_nota_partida_sofascore`, `calcular_rating_medio_temporada`, `calcular_impacto_tatico`.
2. Inspect `backend/app.py`:
   - Locate where `resumo["sofascore"]` is constructed in `/api/jogadores/perfil` (around lines 2680-2720).
   - Currently, if `atleta_sofascore_ratings` has no record for the player, does it return `None` or an empty object?
   - How should `backend/app.py` fall back dynamically to calculating the player rating from local appearances when no precomputed row exists in `atleta_sofascore_ratings`?
   - Ensure the structure matches the interface contract:
     ```json
     {
       "rating_medio": 7.45,
       "jogos_avaliados": 158,
       "fonte": "sofascore" | "futstats_scouting",
       "ultimas_notas": [...]
     }
     ```
3. Formulate the exact code diff for `backend/app.py` with imports and fallback logic.
4. Test your logic using a Python snippet against test athletes (e.g. Luís Fabiano ID 9033, Pedro ID 10, Mycael ID 2066).
5. Write your complete report with code diffs to `handoff.md` in your working directory and notify parent via `send_message`.

## Authoritative Reference
- `/mnt/jogos_f/Antigravity_Projetos_e_Ferramentas/Guia profissional/.agents/teamwork/ORIGINAL_REQUEST.md`
- `/mnt/jogos_f/Antigravity_Projetos_e_Ferramentas/Guia profissional/PROJECT.md`

## 2026-10-30T20:50:51Z
You are Explorer M3-1 (Player Rating Integration Investigator).
Your working directory is:
/mnt/jogos_f/Antigravity_Projetos_e_Ferramentas/Guia profissional/.agents/teamwork/teamwork_preview_explorer_m3_1

Please read your dispatch instructions at:
/mnt/jogos_f/Antigravity_Projetos_e_Ferramentas/Guia profissional/.agents/teamwork/teamwork_preview_explorer_m3_1/DISPATCH.md
And PROJECT.md at:
/mnt/jogos_f/Antigravity_Projetos_e_Ferramentas/Guia profissional/PROJECT.md
And ORIGINAL_REQUEST.md at:
/mnt/jogos_f/Antigravity_Projetos_e_Ferramentas/Guia profissional/.agents/teamwork/ORIGINAL_REQUEST.md

Your goal is to investigate backend/calculo_player_rating.py and backend/app.py for Feature 8:
1. Understand the tanh asymptotic compression rating model (0.0-10.0, base 6.50).
2. Connect backend/calculo_player_rating.py into backend/app.py: populate resumo["sofascore"] using atleta_sofascore_ratings when available, and dynamically calculate fallback rating from match events when not available.
3. Formulate the exact code diff for backend/app.py.
4. Test your logic on reference athletes (Luís Fabiano ID 9033, Pedro ID 10, Mycael ID 2066).
5. Write your complete report with verified code diffs to handoff.md in your working directory and notify parent via send_message.
