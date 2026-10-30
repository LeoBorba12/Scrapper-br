# BRIEFING — 2026-10-30T18:39:39Z

## Mission
Formulate exact SQL migration for `atleta_sofascore_ratings` schema expansion and data reversion of the artificial `total_jogos = total_gols` (média 1.00) in `jogadores_estatisticas` for Features 3 & 4 (Milestone M1).

## 🔒 My Identity
- Archetype: explorer
- Roles: Schema Migration Specialist, SQL Data Integrity Investigator
- Working directory: /mnt/jogos_f/Antigravity_Projetos_e_Ferramentas/Guia profissional/.agents/teamwork/teamwork_preview_explorer_m1_3
- Original parent: 9c2d948a-bd66-4e27-83b1-9e8d50e60942
- Milestone: M1 (SQLite Storage, Audit Script & Schema Saneamento)

## 🔒 Key Constraints
- Read-only investigation on production database `data/futebol.db` — all test SQL executions must run on `/tmp/` copy.
- Do NOT directly alter production files.
- Produce exact SQL scripts and Python migration code for implementers in `handoff.md`.
- Vercel limit constraint: <94.0 MB.
- Regression gates: 22/22 pytest in `tests/test_model_evals.py`, 12/12 in `scripts/auditar_integridade_dados.py`.

## Current Parent
- Conversation ID: 9c2d948a-bd66-4e27-83b1-9e8d50e60942
- Updated: 2026-10-30T15:48:00-03:00

## Investigation State
- **Explored paths**: `PROJECT.md`, `ORIGINAL_REQUEST.md`, `teamwork_preview_explorer_survey_1/handoff.md`, `scripts/auditar_integridade_dados.py`, `scripts/sanear_dados_atletas_e_estatisticas.py`, `scripts/scraper_sofascore_ratings_pipeline.py`, `backend/app.py`, `backend/calculo_xg_discreto.py`, `tests/test_model_evals.py`.
- **Key findings**: 
  - `atleta_sofascore_ratings` successfully expanded with 4 columns: `npxg_acumulado REAL`, `delta_xg REAL`, `perfil_clinico TEXT`, `taxa_conversao_pct REAL`.
  - The 2,705 athletes with `total_jogos = total_gols AND total_gols >= 5` were caused by `MAX(total_jogos, total_gols)` in `sanear_dados_atletas_e_estatisticas.py` and `auditar_integridade_dados.py`.
  - Reversion tested on `/tmp/test_full_m1_3.db`: 1,593 athletes had authentic catalog appearances restored (Luís Fabiano 168->158, Romário 150->109, Zico 132->98, etc.), while 1,112 athletes already had genuine presencas == total_gols.
  - Zero database size growth from the updates (stays at 96.85 MB before VACUUM, drops to 88.53 MB after Feature 1 VACUUM, 5.47 MB below Vercel 94.0 MB limit).
  - 22/22 regression tests pass cleanly.
- **Unexplored areas**: None for M1-3 scope.

## Key Decisions Made
- Use indexed temporary table `temp_presencas_atletas` from `(escalacoes UNION gols UNION cartoes)` for 0.43s O(N) performance.
- Revert `total_jogos`, `media_gols_por_jogo`, and `media_participacao_por_jogo` simultaneously.
- Leave `gols_carreira_oficiais` and `jogos_carreira_oficiais` untouched.

## Artifact Index
- `BRIEFING.md` — persistent memory
- `progress.md` — heartbeat and liveness log
- `handoff.md` — final 5-component handoff report with verified SQL migration scripts
