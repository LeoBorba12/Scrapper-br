# DISPATCH — Explorer M4-2 (Career Average Leaks Explorer)

## Context
Milestone M4: Apresentação Visual no Frontend & WCAG 2.2 AA
Project: FutStats Saneamento Integral

## Authoritative References
- Request: `/mnt/jogos_f/Antigravity_Projetos_e_Ferramentas/Guia profissional/.agents/teamwork/ORIGINAL_REQUEST.md`
- Master Plan: `/mnt/jogos_f/Antigravity_Projetos_e_Ferramentas/Guia profissional/PROJECT.md`

## Mission
Investigate and eliminate 1.00 career average leaks across frontend chart and report generators for Feature 13:
1. `frontend/src/components/charts/AthleteCareerTimeline.jsx` (specifically around line 234)
2. `frontend/src/components/charts/AthleteCareerBarChart.jsx` (specifically around line 222)
3. `frontend/src/utils/cardGenerator.js` (specifically lines 199-202)
4. `frontend/src/utils/pdfReportGenerator.js` (specifically lines 16-19)

In each file:
- Locate raw calculation fallbacks such as `(atleta.resumo?.total_gols / atleta.resumo?.total_jogos)` that could result in 1.00 or 1.06 for historical players with partial catalogs.
- Formulate exact replacements to prioritize `atleta.resumo?.media_gols` or `atleta.resumo?.media_oficial_carreira`.
- Check if any label displays `"Jogos"` when `acervo_parcial` is true, and ensure it displays `jogos_rotulo` (`"Jogos c/ Gol"`).
- Formulate exact code diffs for all affected files.
- Deliver your findings and verified diffs in `handoff.md` and notify parent via `send_message`.

## 2026-10-30T21:35:47Z
You are Explorer M4-2 (Career Average Leaks Explorer).
Your working directory is:
/mnt/jogos_f/Antigravity_Projetos_e_Ferramentas/Guia profissional/.agents/teamwork/teamwork_preview_explorer_m4_2

Please read your dispatch instructions at:
/mnt/jogos_f/Antigravity_Projetos_e_Ferramentas/Guia profissional/.agents/teamwork/teamwork_preview_explorer_m4_2/DISPATCH.md
And PROJECT.md at:
/mnt/jogos_f/Antigravity_Projetos_e_Ferramentas/Guia profissional/PROJECT.md
And ORIGINAL_REQUEST.md at:
/mnt/jogos_f/Antigravity_Projetos_e_Ferramentas/Guia profissional/.agents/teamwork/ORIGINAL_REQUEST.md

Your goal is to investigate and eliminate 1.00 career average leaks across frontend chart and report components for Feature 13:
1. frontend/src/components/charts/AthleteCareerTimeline.jsx (around line 234)
2. frontend/src/components/charts/AthleteCareerBarChart.jsx (around line 222)
3. frontend/src/utils/cardGenerator.js (lines 199-202)
4. frontend/src/utils/pdfReportGenerator.js (lines 16-19)
Ensure each component uses atleta.resumo?.media_gols or authentic weighted career average instead of falling back to raw total_gols / total_jogos.
Ensure "Jogos c/ Gol" is used when acervo_parcial is true.
Formulate exact code diffs.
Write your complete report with verified code diffs to handoff.md in your working directory and notify parent via send_message.
