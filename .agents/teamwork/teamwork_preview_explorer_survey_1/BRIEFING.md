# BRIEFING — 2026-10-30T18:32:00Z

## Mission
Investigate data/futebol.db, database schema, data integrity, and scripts/auditar_integridade_dados.py for the database sanitation and feature enrichment plan.

## 🔒 My Identity
- Archetype: explorer
- Roles: database & relational consistency explorer
- Working directory: /mnt/jogos_f/Antigravity_Projetos_e_Ferramentas/Guia profissional/.agents/teamwork/teamwork_preview_explorer_survey_1
- Original parent: 9c2d948a-bd66-4e27-83b1-9e8d50e60942
- Milestone: survey & deep investigation

## 🔒 Key Constraints
- Read-only investigation — do NOT implement
- Strictly observe 94.0 MB limit for SQLite
- Respect AGENTS.md rules and guidelines

## Current Parent
- Conversation ID: 9c2d948a-bd66-4e27-83b1-9e8d50e60942
- Updated: 2026-10-30T18:32:00Z

## Investigation State
- **Explored paths**: data/futebol.db (schema, dbstat, pragmas, table inspection), scripts/auditar_integridade_dados.py, scripts/sanear_dados_atletas_e_estatisticas.py, scripts/scraper_sofascore_ratings_pipeline.py, backend/app.py, backend/calculo_player_rating.py, backend/calculo_xg_discreto.py, frontend/src/components/ProtagonistaAtleta.jsx.
- **Key findings**:
  1. No tables named 'presencas', 'sumulas', 'clubes', or 'clubes_historico'; lineups live in `escalacoes`, clubs live as strings and JSON.
  2. "168 gols em 168 jogos" was caused by Regra 12 clamping `total_jogos = MAX(total_jogos, total_gols)` when escalações were incomplete; affects 2,705 players with >= 5 goals.
  3. Conmebol spurious clubs caused by inverted match assignment during scraping AND naive string-matching in `sanitizar_dashboard_e_atletas.py` (e.g. Acosta -> Mycael ID 2066) plus additive club unioning.
  4. `atleta_sofascore_ratings` exists (8 rows); missing columns: npxg_acumulado, delta_xg, perfil_clinico. Mathematical engines already exist in `backend/calculo_player_rating.py` and `backend/calculo_xg_discreto.py`.
  5. `scripts/auditar_integridade_dados.py` contains exactly 12 rule checks, but comments miss "Regra 8" and label the 12th as another "Regra 12". Has blind spots for 0x0 matches with goals and scraped club titles.
  6. Database size is 92.44 MiB (96.93 MB decimal). Indexes take 49.88 MB (>50%). Dropping redundant indexes (`idx_partidas_data`, `idx_escalacoes_atleta`) and legacy table `jogadores_resumo` saves 8.33 MB (reducing DB to 84.41 MiB / 88.51 MB).
- **Unexplored areas**: None for survey scope.

## Key Decisions Made
- Confirmed concrete drop candidates that guarantee SQLite stays below 94.0 MB without deleting any match, goal, lineup, or card data.
- Formalized 5-component handoff report.

## Artifact Index
- handoff.md — Comprehensive 5-component handoff report
- progress.md — Progress log & heartbeat
- BRIEFING.md — Situational awareness
