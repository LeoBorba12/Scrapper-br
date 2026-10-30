# Task Assignment — Explorer M3-2 (Discrete Opta xG Engine & Clinical Profile Restoration)

## Identity
- **Role**: Explorer (teamwork_preview_explorer)
- **Milestone**: M3 (Motores Matemáticos de Ratings, xG & Backend APIs)
- **Working Directory**: `/mnt/jogos_f/Antigravity_Projetos_e_Ferramentas/Guia profissional/.agents/teamwork/teamwork_preview_explorer_m3_2`

## Mission
Investigate and formulate the exact code modifications for `backend/app.py` to integrate the discrete Opta xG engine (Feature 9 of PROJECT.md):
1. Inspect `backend/calculo_xg_discreto.py`:
   - Understand the discrete zone model: `calcular_xg_partida`, `estimar_xg_gols_atleta`, `classificar_perfil_finalizador`.
   - Metrics: `xg_acumulado`, `xg_nao_penalti_npxg`, `delta_xg`, `taxa_conversao_pct`, `perfil_clinico` ("Clínico de Elite", "Volume Shooter", "Eficiente", "Neutro").
2. Inspect `backend/app.py`:
   - Locate lines 2700-2730 where flawed inline calculation is performed:
     `xg = 1.08 * gols` or similar, which artificially created negative Delta xG for top scorers and erroneously labeled elite strikers as "Volume Shooters".
   - Replace this with genuine calls to `backend/calculo_xg_discreto.py` (or pulling from `atleta_sofascore_ratings` columns `npxg_acumulado`, `delta_xg`, `perfil_clinico`, `taxa_conversao_pct` added in M1, with fallback to `calculo_xg_discreto.py`).
   - Ensure the structure matches the interface contract:
     ```json
     {
       "xg_acumulado": 28.4,
       "xg_nao_penalti_npxg": 24.1,
       "delta_xg": 3.6,
       "perfil_clinico": "Clínico de Elite",
       "taxa_conversao_pct": 21.4
     }
     ```
3. Formulate the exact code diff for `backend/app.py`.
4. Test your logic using a Python script on athletes like Pedro (ID 10) and Luís Fabiano (ID 9033), verifying that elite finishers get positive Delta xG and "Clínico de Elite".
5. Write your complete report with code diffs to `handoff.md` in your working directory and notify parent via `send_message`.

## Authoritative Reference
- `/mnt/jogos_f/Antigravity_Projetos_e_Ferramentas/Guia profissional/.agents/teamwork/ORIGINAL_REQUEST.md`
- `/mnt/jogos_f/Antigravity_Projetos_e_Ferramentas/Guia profissional/PROJECT.md`
