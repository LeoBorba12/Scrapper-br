# BRIEFING — 2026-11-01T14:32:00Z

## Mission
Investigate technical details for R2: Massive Historical Match Sheets and Goals Ingestion Pipeline (schema, 69k pending matches, scrapers/pipelines, high-speed ingestion strategy for 2003-present and Copa do Brasil, career totals reconciliation, safety & safeguards).

## 🔒 My Identity
- Archetype: explorer
- Roles: Technical Explorer, Schema Analyst, Pipeline Architect
- Working directory: /mnt/jogos_f/Antigravity_Projetos_e_Ferramentas/Guia profissional/.agents/teamwork/teamwork_preview_explorer_survey2_2
- Original parent: da7384f3-57a9-4b6b-9373-94dcd5a6f441
- Milestone: Survey 2 - R2 Technical Deep Dive

## 🔒 Key Constraints
- Read-only investigation — do NOT implement
- Strictly observe 94.0 MB Vercel SQLite limit and database integrity rules
- Touch only agent folder files (.agents/teamwork/teamwork_preview_explorer_survey2_2/)
- Communication via send_message to da7384f3-57a9-4b6b-9373-94dcd5a6f441

## Current Parent
- Conversation ID: da7384f3-57a9-4b6b-9373-94dcd5a6f441
- Updated: not yet

## Investigation State
- **Explored paths**: `data/futebol.db`, `data/futebol_acervo.db`, `data/futebol_referencia.db`, `scripts/`, `backend/app.py`, `frontend/src/components/ProtagonistaAtleta.jsx`, `data/cache_ogol_brasileirao/`, `data/raw_conmebol/`, `data/raw_estaduais/`, `data/raw_serieb/`.
- **Key findings**:
  1. Exactly 69,777 matches in `partidas` have `(gols_mandante + gols_visitante) > 0` but NO entry in `gols`, accounting for 207,658 missing goals.
  2. 61,958 of those 69k matches were created by `scraper_ranking_historico.py` with IDs >= 100,000,000 without goal events.
  3. 6,225 match JSON files with 16,535 goals already exist cached in `data/cache_ogol_brasileirao`.
  4. 3,710 near-duplicate match pairs exist in `partidas` (e.g. 'Campeonato Brasileiro Série A' vs 'Brasileirão Série A') due to +-1 day date jitter.
  5. Prefix/substring club matching in past scrapers (`f"%{home[:5]}%"`) caused ~1,927 goal misattributions (e.g. Atlético-PR goals inside Atlético-GO 0x0 match).
  6. The 1.00 goal/game anomaly is caused by missing `escalacoes` (player only present when scoring) and clamping `total_jogos = MAX(total_jogos, total_gols)` in `scripts/sanear_dados_atletas_e_estatisticas.py`.
  7. Current `data/futebol.db` size is 84.56 MB; headroom to 94.0 MB Vercel limit is only ~9.4 MB. Full ingestion of 207k goals + 2M escalações requires ~185 MB, proving the architectural necessity of R1 (remote database decoupling).
- **Unexplored areas**: None for R2 technical survey scope.

## Key Decisions Made
- Formulated two-tier ingestion architecture: local SQLite curated backfill (~10k-15k goals + canonical metadata, keeping db < 90 MB) + remote master database for universal massive ingestion (all 69,777 matches).

## Artifact Index
- handoff.md — Comprehensive R2 Technical Findings and Recommendations
- progress.md — Liveness heartbeat
- BRIEFING.md — Situational awareness
- DISPATCH.md — Task dispatch log
