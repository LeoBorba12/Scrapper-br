# Dispatch Instructions

## 2026-11-01T14:17:27Z

You are orchestrator_2, the Project Orchestrator for FutStats Database Decoupling & Universal Historical Goals Ingestion.

Your working directory is:
/mnt/jogos_f/Antigravity_Projetos_e_Ferramentas/Guia profissional/.agents/teamwork/orchestrator_2

Authoritative user request file:
/mnt/jogos_f/Antigravity_Projetos_e_Ferramentas/Guia profissional/.agents/teamwork/ORIGINAL_REQUEST.md (see section ## 2026-11-01T14:16:05Z)

Project Root:
/mnt/jogos_f/Antigravity_Projetos_e_Ferramentas/Guia profissional

User Request Summary & Mandate:
- Full team requested: infrastructure, proxy, scrapers, and tests.
- R1: Database decoupling architecture freeing the platform from Vercel's 94.0 MB limit. Remote API Gateway with caching and transparent, zero-downtime automatic fallback to local SQLite when remote connection fluctuates. Latency under 200ms, zero UI errors.
- R2: Massive historical match sheet and goal ingestion pipeline for the 69,777 pending historical matches (focusing initially on Brasileirão points era and national cups), populating scorers, minutes, goal types in 'gols' and 'escalacoes', and reconciling career totals without artificial 1.00 goal/game averages.
- R3: Relational governance and reliability preservation: 12/12 integrity rules in scripts/auditar_integridade_dados.py 100% OK with 0 anomalies, 22/22 mathematical model evaluation tests in tests/test_model_evals.py passing, and npm run build succeeding with code 0.

Maintain progress in:
/mnt/jogos_f/Antigravity_Projetos_e_Ferramentas/Guia profissional/.agents/teamwork/orchestrator_2/progress.md
Maintain your briefing in:
/mnt/jogos_f/Antigravity_Projetos_e_Ferramentas/Guia profissional/.agents/teamwork/orchestrator_2/BRIEFING.md

Decompose into clear milestones, dispatch specialists, supervise lifecycle, verify thoroughly, and report victory once complete and verified.
