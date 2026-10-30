# Task Assignment — Explorer M3-3 (Radar Pentagonal 5 Axes & Honest Career Average API)

## Identity
- **Role**: Explorer (teamwork_preview_explorer)
- **Milestone**: M3 (Motores Matemáticos de Ratings, xG & Backend APIs)
- **Working Directory**: `/mnt/jogos_f/Antigravity_Projetos_e_Ferramentas/Guia profissional/.agents/teamwork/teamwork_preview_explorer_m3_3`

## Mission
Investigate and formulate the exact code modifications for `backend/app.py` for Features 10 and 11 of PROJECT.md:
1. **Radar Pentagonal PES Eixos (Feature 10)**:
   - Inspect `_calcular_radar_pes` in `backend/app.py` (around lines 2580-2640).
   - Ensure it returns 5 axes (`atk`, `fin`, `cri`, `fis`, `def`) and `ovr` (scale 40-99).
   - Eliminate any `null` or missing axis values for key athletes (guaranteeing fallback values when stats are sparse).
   - Interface contract:
     ```json
     {
       "eixos": [
         {"key": "atk", "label": "Ataque", "valor": 88, "desc": "..."},
         {"key": "fin", "label": "Finalização", "valor": 92, "desc": "..."},
         {"key": "cri", "label": "Criação", "valor": 74, "desc": "..."},
         {"key": "fis", "label": "Físico", "valor": 85, "desc": "..."},
         {"key": "def", "label": "Defesa", "valor": 45, "desc": "..."}
       ],
       "ovr": 86
     }
     ```
2. **Honest Label "Jogos c/ Gol" & Authentic Career Average (Feature 11)**:
   - In `_construir_perfil_jogador` in `backend/app.py` (around lines 2650-2750):
     - When `acervo_parcial` is true (local appearances in catalog != official career matches, or `jogos_carreira_oficiais > total_jogos`):
       - Return `acervo_parcial: true`.
       - Return `jogos_rotulo: "Jogos c/ Gol"`.
       - Return `media_gols`: authentic weighted career average (`carreira_oficial["gols"] / carreira_oficial["jogos"]`, e.g. 0.53 for Luís Fabiano ID 9033 with 403 gols / 755 jogos).
       - Return `jogos_registrados: total_jogos` (count of local catalog matches, e.g. 158).
       - Return `media_oficial_carreira`: weighted career average.
     - When `acervo_parcial` is false:
       - Return `acervo_parcial: false`.
       - Return `jogos_rotulo: "Jogos"`.
       - Return `media_gols`: `total_gols / total_jogos`.
3. **Relational Stats Resynchronization (from Reviewer M2-1 findings)**:
   - Formulate SQL to resync `total_gols` in `jogadores_estatisticas` for athletes whose 0x0 ghost goals were removed, and for Alex Cabeção (ID 2373: 146 goals).
4. Formulate the exact code diff for `backend/app.py`.
5. Test your logic using a Python script against test athletes (Luís Fabiano 9033, Pedro 10, Neymar, Dinamite).
6. Write your complete report with code diffs to `handoff.md` in your working directory and notify parent via `send_message`.

## Authoritative Reference
- `/mnt/jogos_f/Antigravity_Projetos_e_Ferramentas/Guia profissional/.agents/teamwork/ORIGINAL_REQUEST.md`

## 2026-10-30T20:50:51Z
You are Explorer M3-3 (Radar & Career Average API Investigator).
Your working directory is:
/mnt/jogos_f/Antigravity_Projetos_e_Ferramentas/Guia profissional/.agents/teamwork/teamwork_preview_explorer_m3_3

Please read your dispatch instructions at:
/mnt/jogos_f/Antigravity_Projetos_e_Ferramentas/Guia profissional/.agents/teamwork/teamwork_preview_explorer_m3_3/DISPATCH.md
And PROJECT.md at:
/mnt/jogos_f/Antigravity_Projetos_e_Ferramentas/Guia profissional/PROJECT.md
And ORIGINAL_REQUEST.md at:
/mnt/jogos_f/Antigravity_Projetos_e_Ferramentas/Guia profissional/.agents/teamwork/ORIGINAL_REQUEST.md

Your goal is to investigate backend/app.py for Features 10 and 11, plus relational stats resync:
1. Feature 10: Radar Pentagonal PES: compute 5 axes (atk, fin, cri, fis, def) and ovr (40-99), ensuring zero nulls for all athletes.
2. Feature 11: Honest Label "Jogos c/ Gol" & Authentic Weighted Career Average: in _construir_perfil_jogador, when acervo_parcial is true, return acervo_parcial: true, jogos_rotulo: "Jogos c/ Gol", media_gols: carreira_oficial["gols"] / carreira_oficial["jogos"] (e.g. 0.53 for Luís Fabiano ID 9033), jogos_registrados: total_jogos (158), and media_oficial_carreira.
3. Relational stats resync: formulate SQL to resync total_gols in jogadores_estatisticas for athletes with ghost goals removed, and for Alex Cabeção ID 2373 (146 goals).
4. Formulate the exact code diff for backend/app.py and SQL sync query.
5. Test your logic on reference athletes (Luís Fabiano 9033, Pedro 10).
6. Write your complete report with verified code diffs to handoff.md in your working directory and notify parent via send_message.

## 2026-10-30T21:06:19Z
**Context**: Milestone M3 — Explorer M3-3 (Radar 5 Axes & Honest Career Average API)
**Content**: Checking in on your status. Explorers M3-1 and M3-2 have completed their investigations and delivered their verified code diffs for Features 8 and 9. Please report your current progress on Features 10 (Radar PES), 11 (Honest Label "Jogos c/ Gol" & Career Average), and the total_gols resync queries, and let me know when we can expect your handoff.md.
**Action**: Reply with your status or deliver handoff.md.
