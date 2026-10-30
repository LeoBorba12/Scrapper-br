# BRIEFING — 2026-10-30T18:04:30-03:00

## Mission
Investigate and formulate the exact code diff for backend/app.py to integrate the discrete Opta xG engine (Feature 9), eliminating the flawed inline formula (xg = 1.08 * gols), computing authentic xG, npxG, Delta xG, and clinical profile ("Clínico de Elite").

## 🔒 My Identity
- Archetype: explorer
- Roles: [investigator, analyst, synthesizer]
- Working directory: /mnt/jogos_f/Antigravity_Projetos_e_Ferramentas/Guia profissional/.agents/teamwork/teamwork_preview_explorer_m3_2
- Original parent: 9c2d948a-bd66-4e27-83b1-9e8d50e60942
- Milestone: M3 (Motores Matemáticos de Ratings, xG & Backend APIs)

## 🔒 Key Constraints
- Read-only investigation — do NOT implement directly in source code; provide exact verified diffs in handoff.md
- Adhere to PROJECT.md interface contracts for analytics_xg: xg_acumulado, xg_nao_penalti_npxg, delta_xg, perfil_clinico, taxa_conversao_pct
- Test logic on reference athletes (Pedro ID 10, Luís Fabiano ID 9033)
- Keep communication via files (handoff.md) and send_message to parent

## Current Parent
- Conversation ID: 9c2d948a-bd66-4e27-83b1-9e8d50e60942
- Updated: not yet

## Investigation State
- **Explored paths**:
  - `backend/calculo_xg_discreto.py`: 5 zones (pequena área, grande área central/diagonal, fora área, longa distância), ShotEvent, PENALTY_XG (0.760), classificar_perfil_clinico, analisar_performance_xg_atleta
  - `backend/app.py`: lines 2147-2178 (_calcular_scouts_profissionais) and lines 2704-2768 (_construir_perfil_jogador)
  - `data/futebol.db`: atleta_sofascore_ratings table schema & rows, jogadores_estatisticas, gols table
  - `scripts/migrar_e_enriquecer_jogadores_estatisticas.py`: lines 442-443 (origin of synthetic 3x on-target and 6x total shots)
- **Key findings**:
  - Root cause of bug discovered: inline formula `(penaltis * 0.79) + (chutes_alvo_abertos * 0.315) + (chutes_fora * 0.045)` evaluated to `1.08 * gols` due to `chutes_alvo = 3 * gols` and `chutes_fora = 3 * gols`, guaranteeing negative Delta xG (-0.08 * gols) and forcing all top strikers into "Volume Shooter".
  - Solution formulated: pull from `atleta_sofascore_ratings` when available (Pedro ID 10, Hulk ID 9, Gabriel Barbosa ID 7), and dynamically calculate via `estimar_xg_gols_atleta` with Opta discrete weights (PENALTY_XG = 0.760, on-target = 0.205, off-target = 0.035) for athletes without Sofascore data (Luís Fabiano ID 9033, etc.).
- **Unexplored areas**: None for Feature 9 scope.

## Key Decisions Made
- Architected `estimar_xg_gols_atleta` inside `backend/calculo_xg_discreto.py` to keep domain math encapsulated.
- Added alias `classificar_perfil_finalizador` to `calculo_xg_discreto.py` for backwards compatibility.
- Formulated exact diff patch in `feature_9_xg_integration.patch` and full replacement file `proposed_calculo_xg_discreto.py`.
- Tested and verified on Pedro (ID 10: Delta xG +3.0, "Clínico de Elite"), Luís Fabiano (ID 9033: Delta xG +38.3, "Clínico de Elite"), and Mycael (ID 2066: Delta xG 0.0, "Neutro").

## Artifact Index
- `handoff.md` — Complete 5-component handoff report with exact verified diffs
- `progress.md` — Liveness heartbeat and progress tracking
- `proposed_calculo_xg_discreto.py` — Complete proposed code for backend/calculo_xg_discreto.py
- `feature_9_xg_integration.patch` — Unified diff patch for app.py and calculo_xg_discreto.py
