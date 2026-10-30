# BRIEFING — 2026-10-30T18:20:00Z

## Mission
Implement Milestone M3: Player Rating Integration (tanh), Discrete Opta xG Engine (Delta xG & Clínico de Elite), Radar Pentagonal PES 5 Axes & OVR, Honest Career Average & "Jogos c/ Gol" Label, and Database Relational Stats Resync.

## 🔒 My Identity
- Archetype: worker
- Roles: implementer, qa, specialist
- Working directory: /mnt/jogos_f/Antigravity_Projetos_e_Ferramentas/Guia profissional/.agents/teamwork/teamwork_preview_worker_m3
- Original parent: 9c2d948a-bd66-4e27-83b1-9e8d50e60942
- Milestone: M3 (Motores Matemáticos de Ratings, xG & Backend APIs)

## 🔒 Key Constraints
- Genuine implementation only: DO NOT CHEAT, DO NOT hardcode test results, no dummy facades.
- Minimal diff, surgical edits (Karpathy guidelines).
- Preserve Vercel database size limit (< 94.0 MB).
- Mandatory verification: pytest test_e2e_futstats.py (50/50), pytest test_model_evals.py (22/22), auditar_integridade_dados.py (12/12).

## Current Parent
- Conversation ID: 9c2d948a-bd66-4e27-83b1-9e8d50e60942
- Updated: 2026-10-30T18:20:00Z

## Task Summary
- **What to build**:
  1. Feature 8: `backend/calculo_player_rating.py` (normalizar_posicao for English terms, calcular_rating_medio_temporada, calcular_impacto_tatico) + `backend/app.py` (sofascore rating dynamic fallback loop).
  2. Feature 9: `backend/calculo_xg_discreto.py` (classificar_perfil_finalizador, estimar_xg_gols_atleta) + `backend/app.py` (analytics_xg, replace flawed 1.08*gols).
  3. Feature 10: `backend/app.py` (_calcular_radar_pes null hardening, 5 axes + ovr in 40-99).
  4. Feature 11: `backend/app.py` (_construir_perfil_jogador honest label "Jogos c/ Gol", media_gols 0.53 authentic career average for Luís Fabiano, media_oficial_carreira).
  5. Relational Stats Resync: SQL updates on `data/futebol.db` for 129 athletes and Alex Cabeção ID 2373.
- **Success criteria**:
  - `test_e2e_futstats.py`: 50/50 passing (100%)
  - `test_model_evals.py`: 22/22 passing (100%)
  - `auditar_integridade_dados.py`: 12/12 passing (100%)
  - `data/futebol.db` size: 84.53 MB (< 94.0 MB)
- **Interface contracts**: PROJECT.md lines 40-61
- **Code layout**: `backend/app.py`, `backend/calculo_player_rating.py`, `backend/calculo_xg_discreto.py`, `data/futebol.db`

## Change Tracker
- **Files modified**:
  - `backend/calculo_player_rating.py`: normalizar_posicao with English aliases, calcular_rating_medio_temporada, calcular_impacto_tatico.
  - `backend/calculo_xg_discreto.py`: classificar_perfil_finalizador, estimar_xg_gols_atleta with Opta parameters, calcular_xg_partida.
  - `backend/app.py`: dynamic sofascore fallback with tanh compression, genuine analytics_xg, null-safe _calcular_radar_pes, honest label "Jogos c/ Gol" and authentic career average.
  - `data/futebol.db`: resynced total_gols, participacoes_gols, media_gols_por_jogo for 129 athletes and Alex Cabeção (146 goals).
- **Build status**: PASS: 50/50 test_e2e_futstats.py, 22/22 test_model_evals.py, 12/12 auditar_integridade_dados.py, npm run build OK.
- **Pending issues**: None. All requirements achieved.

## Quality Status
- **Build/test result**: 50/50 passed (e2e), 22/22 passed (model evals)
- **Lint status**: clean
- **Tests added/modified**: Full suite passing without skips or regressions

## Loaded Skills
- **Source**: /mnt/jogos_f/Antigravity_Projetos_e_Ferramentas/Guia profissional/.agents/skills/karpathy-guidelines/SKILL.md
- **Local copy**: None (in-memory)
- **Core methodology**: Radical simplicity, root-cause diagnostics, minimal surgical edits, and verification before declaring victory.

## Key Decisions Made
- Used discrete Opta parameters (penalty 0.760, open target 0.205, off target 0.035) eliminating false underperformer tags.
- Bound all radar axes and OVR strictly to [40, 99] with safe fallback casting.
- Returned authentic career ratio `media_oficial_carreira` when local catalog is partial.

## Artifact Index
- handoff.md — detailed 5-component hard handoff report
