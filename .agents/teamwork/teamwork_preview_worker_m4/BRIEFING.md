# BRIEFING — 2026-10-30T22:02:09Z

## Mission
Worker M4: Implement visual presentation fixes in frontend for Feature 12 (Rating Badge WCAG 2.2 AA & Honest Profile), Feature 13 (Eliminate 1.00 Career Average Leaks), and Features 14 & 15 (Radar Pentagonal PES & Club Shielding).

## 🔒 My Identity
- Archetype: Worker M4
- Roles: implementer, qa, specialist
- Working directory: /mnt/jogos_f/Antigravity_Projetos_e_Ferramentas/Guia profissional/.agents/teamwork/teamwork_preview_worker_m4
- Original parent: 9c2d948a-bd66-4e27-83b1-9e8d50e60942
- Milestone: M4 (Apresentação Visual no Frontend & WCAG 2.2 AA)

## 🔒 Key Constraints
- WCAG 2.2 AA minimum contrast (>= 4.5:1 text, >= 3:1 UI components). No neon green #22c55e on Areia #F1E8DE. Use var(--positive) and var(--positive-bg).
- Editorial 2026 palette: Areia (#F1E8DE), Carvão Quente (#1B1A17), Oliva (#5A673E), Terracota (#85573B).
- Data honesty: Never display 1.00 / 1.06 artificial average for historical partial catalog players. Use "Jogos c/ Gol" when acervo_parcial is true or gols >= jogos. Prioritize media_gols from backend.
- Radar PES: prioritize atleta.radar_pes from backend payload (5 canonical axes ['atk', 'fin', 'cri', 'fis', 'def'], ovr in 40-99), honest empty state container without layout shift.
- Club shielding: sanitize club lists to prevent foreign Conmebol clubs or malformed JSON artifacts.
- Integrity: DO NOT CHEAT, no mockups, real verification.
- Mandatory tests: npm run build (0), test_e2e_futstats.py (50/50), test_model_evals.py (22/22), auditar_integridade_dados.py (12/12 OK), data/futebol.db < 94.0 MB.

## Current Parent
- Conversation ID: 9c2d948a-bd66-4e27-83b1-9e8d50e60942
- Updated: 2026-10-30T22:02:09Z

## Task Summary
- **What to build**: 
  1. Feature 12: ProtagonistaAtleta.jsx (WCAG 2.2 AA badge, Sofascore vs FutStats Scouting label, honest Jogos c/ Gol, media_gols prioritization).
  2. Feature 13: AthleteCareerTimeline.jsx, AthleteCareerBarChart.jsx, cardGenerator.js, pdfReportGenerator.js (eliminate 1.00 average leaks, honest Jogos c/ Gol).
  3. Feature 14 & 15: clubData.js (sanitizarListaClubes, sanitizarCarreiraClubes), RadarPentagonPES.jsx (radar_pes payload integration & empty state), AthleteCompareView.jsx & ProtagonistaAtleta.jsx club list sanitization.
- **Success criteria**: All 4 features cleanly implemented, all builds and tests pass.
- **Interface contracts**: PROJECT.md, Explorer handoffs M4-1, M4-2, M4-3.
- **Code layout**: frontend/src/

## Change Tracker
- **Files modified**: [TBD]
- **Build status**: [TBD]
- **Pending issues**: None

## Quality Status
- **Build/test result**: [TBD]
- **Lint status**: [TBD]
- **Tests added/modified**: [TBD]

## Loaded Skills
- Source: /mnt/jogos_f/Antigravity_Projetos_e_Ferramentas/Guia profissional/.agents/skills/design-token-contrast/SKILL.md
- Local copy: /mnt/jogos_f/Antigravity_Projetos_e_Ferramentas/Guia profissional/.agents/teamwork/teamwork_preview_worker_m4/skill_design_token_contrast.md
- Core methodology: WCAG 2.2 contrast checking between color tokens and safe palettes.

## Key Decisions Made
- [TBD]

## Artifact Index
- DISPATCH.md — Assignment instructions
- BRIEFING.md — Persistent context & situational awareness
- progress.md — Liveness heartbeat
- handoff.md — Final deliverable report
