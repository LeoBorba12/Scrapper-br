# Worker M2 Context: Massive Historical Match Sheets and Goals Ingestion
Working directory: /mnt/jogos_f/Antigravity_Projetos_e_Ferramentas/Guia profissional/.agents/teamwork/teamwork_preview_worker_m2_r2
Scope:
1. Process cached match sheets in data/cache_ogol_brasileirao/ (6,225 files, 16,535 goals) using scripts/ingerir_cache_ogol_existente.py.
2. Canonicalize and deduplicate 3,710 almost-duplicate matches using scripts/consolidar_duplicatas_partidas.py.
3. Ingest Serie A (2003-present) and Copa do Brasil historical match sheets with scorers, minutes, canonical goal types, and lineups using scripts/ingestor_sumulas_massivo_ogol.py.
4. Harmonize historical club names in goals to match match mandante/visitante.
5. Standardize goal types to {'Normal', 'Pênalti', 'Falta', 'Contra', 'Cabeça'}.
6. Ensure total cataloged goals exceeds 95,522 (aiming for > 100,000 goals).
7. Keep data/futebol.db strictly under 94.0 MB (run VACUUM).
8. Ensure 12/12 rules of auditar_integridade_dados.py pass, 22/22 test_model_evals.py pass, and npm run build exits 0.
