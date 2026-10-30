# DISPATCH - Survey Explorer 1 (Database & Relational Consistency)

## Mission
Investigate database schema, data integrity, and scripts for FutStats:
1. Súmulas, partidas, gols, atletas e histórico de clubes em `data/futebol.db`.
2. Como se dá a anomalia "168 gols em 168 jogos" e como diferenciar partidas com gol catalogado vs total de partidas oficiais.
3. A anomalia dos clubes espúrios Conmebol (ex: Luís Fabiano ID 9033 com River Plate e Universidad de Chile).
4. Tabela `atleta_sofascore_ratings` e armazenamento de notas / xG / Delta xG.
5. Regras de `scripts/auditar_integridade_dados.py` (as 12 regras).
6. Teto de tamanho do SQLite (limite 94.0 MB) e impacto de VACUUM.

Please read:
- `/mnt/jogos_f/Antigravity_Projetos_e_Ferramentas/Guia profissional/.agents/teamwork/ORIGINAL_REQUEST.md`
- Relevant schema files, `data/futebol.db` queries (read-only), `scripts/auditar_integridade_dados.py`.

Deliver your findings in `handoff.md` in this directory.

## 2026-10-30T18:22:56Z
User request:
Investigate data/futebol.db, database schema, data integrity, and scripts/auditar_integridade_dados.py:
1. Examine SQLite schema: athlete tables, appearances (escalacoes, presencas, partidas, sumulas), goals (gols), clubs (clubes, clubes_historico).
2. Determine how "168 gols em 168 jogos" (average 1.00) occurs in queries or tables, and how career total matches vs matches with goals can be accurately distinguished and stored.
3. Investigate the Conmebol spurious clubs issue: inspect athlete Luís Fabiano (ID 9033), River Plate, Universidad de Chile, and query for other foreign clubs wrongly associated with Brazilian clubs' players in Conmebol games. Explain root cause.
4. Check if atleta_sofascore_ratings table exists or what schema is needed. Check where scouting ratings, xG, npxG, Delta xG should be stored.
5. Inspect scripts/auditar_integridade_dados.py: what are the current rules/checks (check if 10, 11, or 12 rules, and how they pass/fail).
6. Check size of data/futebol.db and what VACUUM / table adjustments will do to stay < 94.0 MB.
