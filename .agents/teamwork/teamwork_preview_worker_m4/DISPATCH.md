# DISPATCH — Worker M4 (Apresentação Visual no Frontend & WCAG 2.2 AA)

## Working Directory
`/mnt/jogos_f/Antigravity_Projetos_e_Ferramentas/Guia profissional/.agents/teamwork/teamwork_preview_worker_m4`

## Authoritative References
- Original Request: `/mnt/jogos_f/Antigravity_Projetos_e_Ferramentas/Guia profissional/.agents/teamwork/ORIGINAL_REQUEST.md`
- Master Plan: `/mnt/jogos_f/Antigravity_Projetos_e_Ferramentas/Guia profissional/PROJECT.md`
- Explorer M4-1 Handoff & Patch:
  - `/mnt/jogos_f/Antigravity_Projetos_e_Ferramentas/Guia profissional/.agents/teamwork/teamwork_preview_explorer_m4_1/handoff.md`
  - `/mnt/jogos_f/Antigravity_Projetos_e_Ferramentas/Guia profissional/.agents/teamwork/teamwork_preview_explorer_m4_1/protagonista_atleta_feature12.patch`
- Explorer M4-2 Handoff & Patch:
  - `/mnt/jogos_f/Antigravity_Projetos_e_Ferramentas/Guia profissional/.agents/teamwork/teamwork_preview_explorer_m4_2/handoff.md`
  - `/mnt/jogos_f/Antigravity_Projetos_e_Ferramentas/Guia profissional/.agents/teamwork/teamwork_preview_explorer_m4_2/career_average_leaks.patch`
- Explorer M4-3 Handoff:
  - `/mnt/jogos_f/Antigravity_Projetos_e_Ferramentas/Guia profissional/.agents/teamwork/teamwork_preview_explorer_m4_3/handoff.md`

## Write Ownership (Exclusively owned by Worker M4)
- `frontend/src/components/ProtagonistaAtleta.jsx`
- `frontend/src/components/charts/AthleteCareerTimeline.jsx`
- `frontend/src/components/charts/AthleteCareerBarChart.jsx`
- `frontend/src/utils/cardGenerator.js`
- `frontend/src/utils/pdfReportGenerator.js`
- `frontend/src/components/charts/RadarPentagonPES.jsx`
- `frontend/src/components/AthleteCompareView.jsx`
- `frontend/src/utils/clubData.js`

## Tasks to Implement
1. **Feature 12 (Rating Badge WCAG 2.2 AA & Honest Profile)**:
   - Apply changes to `frontend/src/components/ProtagonistaAtleta.jsx` using findings from Explorer M4-1.
   - Replace hardcoded neon green `#22c55e` with `var(--positive)` (`#526337` in light mode, `#B7C59C` in dark mode) and `var(--positive-bg)`.
   - Differentiate Sofascore vs FutStats Scouting ratings (`fonte === 'futstats_scouting' ? 'Scouting' : 'Sofascore'`).
   - Render honest label `"Jogos c/ Gol"` when `acervo_parcial` is true or goals >= games.
   - Prioritize `atleta.resumo?.media_gols` (0.53 for Luís Fabiano) and eliminate any block that silenced it.

2. **Feature 13 (Eliminate 1.00 Career Average Leaks)**:
   - Apply patch from Explorer M4-2 (`career_average_leaks.patch`) or apply verified edits to:
     - `frontend/src/components/charts/AthleteCareerTimeline.jsx`
     - `frontend/src/components/charts/AthleteCareerBarChart.jsx`
     - `frontend/src/utils/cardGenerator.js`
     - `frontend/src/utils/pdfReportGenerator.js`
   - Guarantee that historical partial catalog players do not leak 1.00 / 1.06 and display `"Jogos c/ Gol"`.

3. **Feature 14 & 15 (Radar Pentagonal PES & Club Shielding)**:
   - Apply changes from Explorer M4-3:
     - `frontend/src/utils/clubData.js`: add `sanitizarListaClubes` and `sanitizarCarreiraClubes` defensive filters.
     - `frontend/src/components/charts/RadarPentagonPES.jsx`: prioritize `atleta.radar_pes` from backend payload (5 canonical axes `['atk', 'fin', 'cri', 'fis', 'def']`, `ovr` in 40-99), implement honest empty state without layout shift.
     - `frontend/src/components/AthleteCompareView.jsx` and `ProtagonistaAtleta.jsx`: sanitize club lists to prevent foreign Conmebol clubs or malformed JSON artifacts.

4. **Verification Commands**:
   - `npm run build --prefix frontend` (MUST exit with code 0).
   - `./.venv/bin/pytest tests/test_e2e_futstats.py` (All 50 tests MUST continue to pass 100%).
   - `./.venv/bin/pytest tests/test_model_evals.py` (All 22 tests MUST continue to pass 100%).
   - `python scripts/auditar_integridade_dados.py` (All 12 rules MUST continue to pass OK).
   - `ls -lh data/futebol.db` (Database size MUST stay < 94.0 MB).

## Mandatory Integrity Warning
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Deliver your handoff report in `handoff.md` and notify parent via `send_message`.

## 2026-10-30T22:02:09Z
You are Worker M4 (Apresentação Visual no Frontend & WCAG 2.2 AA).
Your working directory is:
/mnt/jogos_f/Antigravity_Projetos_e_Ferramentas/Guia profissional/.agents/teamwork/teamwork_preview_worker_m4

Please read your dispatch instructions at:
/mnt/jogos_f/Antigravity_Projetos_e_Ferramentas/Guia profissional/.agents/teamwork/teamwork_preview_worker_m4/DISPATCH.md
And PROJECT.md at:
/mnt/jogos_f/Antigravity_Projetos_e_Ferramentas/Guia profissional/PROJECT.md
And ORIGINAL_REQUEST.md at:
/mnt/jogos_f/Antigravity_Projetos_e_Ferramentas/Guia profissional/.agents/teamwork/ORIGINAL_REQUEST.md

Read the 3 detailed handoff reports and verified patches from M4 Explorers:
- /mnt/jogos_f/Antigravity_Projetos_e_Ferramentas/Guia profissional/.agents/teamwork/teamwork_preview_explorer_m4_1/handoff.md
- /mnt/jogos_f/Antigravity_Projetos_e_Ferramentas/Guia profissional/.agents/teamwork/teamwork_preview_explorer_m4_1/protagonista_atleta_feature12.patch
- /mnt/jogos_f/Antigravity_Projetos_e_Ferramentas/Guia profissional/.agents/teamwork/teamwork_preview_explorer_m4_2/handoff.md
- /mnt/jogos_f/Antigravity_Projetos_e_Ferramentas/Guia profissional/.agents/teamwork/teamwork_preview_explorer_m4_2/career_average_leaks.patch
- /mnt/jogos_f/Antigravity_Projetos_e_Ferramentas/Guia profissional/.agents/teamwork/teamwork_preview_explorer_m4_3/handoff.md

Your tasks:
1. Feature 12: In frontend/src/components/ProtagonistaAtleta.jsx:
   - Replace illegal neon green #22c55e (contrast 1.88:1 on Areia #F1E8DE) with var(--positive) (#526337 in light mode, #B7C59C in dark mode) and var(--positive-bg).
   - Differentiate Sofascore vs FutStats Scouting ratings (fonte === 'futstats_scouting' ? 'Scouting' : 'Sofascore').
   - Render honest label "Jogos c/ Gol" when resumo.acervo_parcial is true or total_gols >= jogos_registrados.
   - Prioritize resumo.media_gols (0.53 for Luís Fabiano) and eliminate any block that silenced it.
2. Feature 13: Apply patches to eliminate 1.00 / 1.06 career average leaks:
   - frontend/src/components/charts/AthleteCareerTimeline.jsx
   - frontend/src/components/charts/AthleteCareerBarChart.jsx
   - frontend/src/utils/cardGenerator.js
   - frontend/src/utils/pdfReportGenerator.js
   - Ensure "Jogos c/ Gol" is rendered when acervo_parcial is true, and media_gols is used instead of total_gols / total_jogos.
3. Features 14 & 15:
   - frontend/src/utils/clubData.js: add sanitizarListaClubes and sanitizarCarreiraClubes defensive filters.
   - frontend/src/components/charts/RadarPentagonPES.jsx: prioritize atleta.radar_pes from backend payload (5 canonical axes ['atk', 'fin', 'cri', 'fis', 'def'], ovr in 40-99), implement honest empty state container without layout shift.
   - frontend/src/components/AthleteCompareView.jsx & ProtagonistaAtleta.jsx: sanitize club lists to prevent foreign Conmebol clubs or malformed JSON artifacts.
4. Run verification commands:
   - npm run build --prefix frontend (MUST exit with code 0)
   - ./.venv/bin/pytest tests/test_e2e_futstats.py (Must pass 50/50 tests)
   - ./.venv/bin/pytest tests/test_model_evals.py (Must pass 22/22 tests)
   - python scripts/auditar_integridade_dados.py (Must pass 12/12 rules OK)
   - Check file size of data/futebol.db (< 94.0 MB)

