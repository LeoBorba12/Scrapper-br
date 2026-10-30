# Progress Log

- Last visited: 2026-10-30T15:32:00-03:00
- Status: Investigation completed. Detailed evidence gathered for all 6 questions:
  1. Complete SQLite schema inventory (athletes, appearances, goals, cards, clubs).
  2. Root cause of "168 gols em 168 jogos" anomaly and resolution strategy.
  3. Spurious Conmebol clubs and homonym string matching root causes (including Mycael/Acosta and "Estatísticas e Escalações").
  4. Schema of `atleta_sofascore_ratings` and integration of `calculo_player_rating.py` and `calculo_xg_discreto.py`.
  5. Audit of `scripts/auditar_integridade_dados.py` (the 12 rules, numbering gap, and blind spots).
  6. Database size analysis (92.44 MiB / 96.93 MB) and concrete index/table pruning yielding 8.33 MB savings (< 88.5 MB).
