# BRIEFING — 2026-11-01T14:27:00Z

## Mission
Investigate technical architecture for R1: Database Decoupling & Resilient Proxy Gateway for FutStats.

## 🔒 My Identity
- Archetype: Explorer
- Roles: Technical Explorer, Architecture Survey, System Analyzer
- Working directory: /mnt/jogos_f/Antigravity_Projetos_e_Ferramentas/Guia profissional/.agents/teamwork/teamwork_preview_explorer_survey2_1
- Original parent: da7384f3-57a9-4b6b-9373-94dcd5a6f441
- Milestone: Milestone 1 Survey (Database Decoupling & Resilient Proxy Gateway)

## 🔒 Key Constraints
- Read-only investigation — do NOT implement or modify source code
- Strictly write only to /mnt/jogos_f/Antigravity_Projetos_e_Ferramentas/Guia profissional/.agents/teamwork/teamwork_preview_explorer_survey2_1
- Zero downtime, sub-200ms target latency for cached/fallback queries
- Respect Vercel 94.0 MB file bundle size limit and serverless runtime constraints
- Respect WCAG 2.2 AA, editorial colors, PT-BR interface
- Maintain backward compatibility with existing frontend fetch patterns and backend endpoints

## Current Parent
- Conversation ID: da7384f3-57a9-4b6b-9373-94dcd5a6f441
- Updated: 2026-11-01T14:27:00Z

## Investigation State
- **Explored paths**: `backend/app.py`, `backend/auth.py`, `backend/ia_analista.py`, `api/index.py`, `vercel.json`, `.vercelignore`, `data/futebol.db`, `scripts/orquestrador_mestre_24x7.py`, `scripts/auditar_integridade_dados.py`, `frontend/src/App.jsx`, `tests/test_model_evals.py`, `docs/DOSSIE_TECNICO_CONTINUIDADE.md`.
- **Key findings**:
  1. `data/futebol.db` is currently 88.67 MB, very close to the Vercel 94.0 MB bundle limit. Ingesting 69,777 historical matches will expand it past 150-300MB, requiring decoupling.
  2. Oracle Cloud VM (`163.176.87.218`, 24/7) already runs scrapers and maintains master `futebol.db`.
  3. All 36 backend endpoints are 99.9% read-only (SELECT queries).
  4. Best architecture: Endpoint-level HTTP Gateway running on Oracle VM with Vercel acting as a Resilient Edge Proxy with 3-state Circuit Breaker, TTL In-Memory Cache, and transparent fallback to local slim SQLite.
  5. Baseline verified: 22/22 pytest tests pass, 12/12 integrity audit rules OK, frontend npm run build clean.
- **Unexplored areas**: None for M1 survey scope.

## Key Decisions Made
- Recommending Endpoint-Level Remote Gateway on Oracle VM (Option 1) over raw SQL-over-HTTP proxy to avoid query chattiness and round-trip latency overhead.
- Preserving bundled `data/futebol.db` as a local fallback database (< 94MB) on Vercel to guarantee 100% availability if remote gateway drops.

## Artifact Index
- /mnt/jogos_f/Antigravity_Projetos_e_Ferramentas/Guia profissional/.agents/teamwork/teamwork_preview_explorer_survey2_1/progress.md — Liveness and task progress
- /mnt/jogos_f/Antigravity_Projetos_e_Ferramentas/Guia profissional/.agents/teamwork/teamwork_preview_explorer_survey2_1/DISPATCH.md — Dispatch log
- /mnt/jogos_f/Antigravity_Projetos_e_Ferramentas/Guia profissional/.agents/teamwork/teamwork_preview_explorer_survey2_1/BRIEFING.md — Situational awareness
- /mnt/jogos_f/Antigravity_Projetos_e_Ferramentas/Guia profissional/.agents/teamwork/teamwork_preview_explorer_survey2_1/handoff.md — Final handoff report
