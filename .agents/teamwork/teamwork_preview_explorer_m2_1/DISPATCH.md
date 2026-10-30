# Task Assignment — Explorer M2-1 (Conmebol Inverted Matches)

## Identity
- **Role**: Explorer (teamwork_preview_explorer)
- **Milestone**: M2 (Auto-Cura de Clubes Espúrios, Conmebol & Homônimos)
- **Working Directory**: `/mnt/jogos_f/Antigravity_Projetos_e_Ferramentas/Guia profissional/.agents/teamwork/teamwork_preview_explorer_m2_1`

## Mission
Investigate and formulate the exact, safe SQL fix for inverted Conmebol matches in `data/futebol.db`:
1. Match 19997098 (1999-05-26): Palmeiras vs River Plate (Semifinal Copa Libertadores 1999). Real result: Palmeiras 3 x 0 River Plate (goals by Alex 2, Oséas 1). In SQLite, it was recorded as 0x3 with goals erroneously attributed to River Plate.
2. Match 20027112 (2002-05-01): Grêmio vs River Plate (Oitavas Copa Libertadores 2002). Real result: Grêmio 4 x 0 River Plate (goals by Rodrigo Mendes, Luizão, Zinho 2). In SQLite, it was recorded as 0x4 with goals erroneously attributed to River Plate.
3. Inspect whether any other Conmebol matches have inverted mandante/visitante or ghost scores.
4. Verify the exact rows in `partidas`, `gols`, and `escalacoes` for both matches.
5. Formulate the exact UPDATE/DELETE SQL queries to rectify both matches and their associated goals/lineups.
6. Test your SQL queries on a copy in `/tmp/test_m2_conmebol.db` to verify that scores, clubs, and goal scorers are 100% correct.
7. Write your complete report with verified SQL queries to `handoff.md` in your working directory and notify parent via `send_message`.

## Authoritative Reference
- `/mnt/jogos_f/Antigravity_Projetos_e_Ferramentas/Guia profissional/.agents/teamwork/ORIGINAL_REQUEST.md`
- `/mnt/jogos_f/Antigravity_Projetos_e_Ferramentas/Guia profissional/PROJECT.md`

## 2026-10-30T20:05:07Z
You are Explorer M2-1 (Conmebol Inverted Matches Investigator).
Your working directory is:
/mnt/jogos_f/Antigravity_Projetos_e_Ferramentas/Guia profissional/.agents/teamwork/teamwork_preview_explorer_m2_1

Your goal is to investigate and formulate the exact SQL fix for inverted Conmebol matches in data/futebol.db:
1. Match 19997098 (1999-05-26): Palmeiras vs River Plate (Palmeiras 3 x 0 River Plate). In SQLite, it was recorded as 0x3 with goals attributed to River Plate.
2. Match 20027112 (2002-05-01): Grêmio vs River Plate (Grêmio 4 x 0 River Plate). In SQLite, it was recorded as 0x4 with goals attributed to River Plate.
3. Check whether any other Conmebol matches have inverted mandante/visitante or ghost scores.
4. Formulate the exact SQL queries to rectify both matches and their associated goals/lineups.
5. Test your SQL queries on a copy in /tmp/test_m2_conmebol.db to verify that scores, clubs, and goal scorers are 100% correct.
6. Write your complete report with verified SQL queries to handoff.md in your working directory and notify parent via send_message.

