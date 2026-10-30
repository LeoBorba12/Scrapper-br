# BRIEFING — 2026-10-30T21:50:00Z

## Mission
Investigate and eliminate 1.00 career average leaks across frontend chart and report generators for Feature 13, ensuring authentic weighted career average and honest "Jogos c/ Gol" labeling when acervo_parcial is true, and formulating exact code diffs.

## 🔒 My Identity
- Archetype: explorer
- Roles: investigator, synthesizer
- Working directory: /mnt/jogos_f/Antigravity_Projetos_e_Ferramentas/Guia profissional/.agents/teamwork/teamwork_preview_explorer_m4_2
- Original parent: 9c2d948a-bd66-4e27-83b1-9e8d50e60942
- Milestone: M4 (Apresentação Visual no Frontend & WCAG 2.2 AA)

## 🔒 Key Constraints
- Read-only investigation — do NOT implement directly in source files; propose diffs in handoff.md
- Use File for reports, handoffs, analysis; Message for coordination
- Keep BRIEFING.md under ~100 lines
- Maintain progress.md heartbeat

## Current Parent
- Conversation ID: 9c2d948a-bd66-4e27-83b1-9e8d50e60942
- Updated: 2026-10-30T21:50:00Z

## Investigation State
- **Explored paths**:
  - `frontend/src/components/charts/AthleteCareerTimeline.jsx` (line 224-236)
  - `frontend/src/components/charts/AthleteCareerBarChart.jsx` (line 216-224)
  - `frontend/src/utils/cardGenerator.js` (lines 198-212)
  - `frontend/src/utils/pdfReportGenerator.js` (lines 16-25, 214-229)
  - `frontend/src/components/ProtagonistaAtleta.jsx`
  - `backend/app.py` (/api/jogadores/perfil payload structure)
- **Key findings**:
  1. In `AthleteCareerTimeline.jsx:234`, `temp.media_gols != null ? temp.media_gols : (temp.jogos > 0 ? (temp.gols / temp.jogos).toFixed(2) : '0.00')` leaks 1.00 when `acervo_parcial` is true because `temp.jogos == temp.gols` in partial historical seasons.
  2. In `AthleteCareerBarChart.jsx:222`, `item.media_gols || '0.00'` displays misleading `0.00` when `media_gols` is null, or would leak 1.00 with naive fallback.
  3. In `cardGenerator.js:199-202` and `pdfReportGenerator.js:16-19`, `gCar / jCar` fallbacks bypass `atleta.resumo?.media_gols` and `carreira_oficial` when passed API profile payload, yielding 1.00 or 1.06 for historical athletes.
  4. All four components lacked honest dynamic labeling (`jogos_rotulo` / "Jogos c/ Gol") when `acervo_parcial` is true.
- **Unexplored areas**: None. Scope fully investigated and verified.

## Key Decisions Made
- Formulated exact diffs prioritizing `atleta.resumo?.media_gols`, `media_oficial_carreira`, and `carreira_oficial`
- Conditioned `jogos_rotulo` fallback to "Jogos c/ Gol" when `acervo_parcial` is true
- Display '—' for partial seasons in timeline/bar chart rather than fake 0.00 or leaked 1.00
- Verified patch against codebase using `git apply --ignore-whitespace --check` and tested `npm run build` (code 0)

## Artifact Index
- `.agents/teamwork/teamwork_preview_explorer_m4_2/BRIEFING.md` — Working memory
- `.agents/teamwork/teamwork_preview_explorer_m4_2/progress.md` — Liveness heartbeat
- `.agents/teamwork/teamwork_preview_explorer_m4_2/career_average_leaks.patch` — Unified diff patch
- `.agents/teamwork/teamwork_preview_explorer_m4_2/handoff.md` — Final 5-component handoff report
