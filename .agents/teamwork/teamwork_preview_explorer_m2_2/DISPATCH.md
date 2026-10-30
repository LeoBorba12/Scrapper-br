# Task Assignment — Explorer M2-2 (Homonyms Disassociation)

## Identity
- **Role**: Explorer (teamwork_preview_explorer)
- **Milestone**: M2 (Auto-Cura de Clubes Espúrios, Conmebol & Homônimos)
- **Working Directory**: `/mnt/jogos_f/Antigravity_Projetos_e_Ferramentas/Guia profissional/.agents/teamwork/teamwork_preview_explorer_m2_2`

## Mission
Investigate and formulate the exact, safe SQL fix for corrupted homonym cross-links in `data/futebol.db`:
1. **Mycael (ID 2066)**:
   - Mycael is a goalkeeper born in 2004 (Athletico Paranaense).
   - In SQLite, he erroneously inherited 17 goals from 1988-1997 scored in Copa Libertadores by Alberto "Beto" Acosta (San Lorenzo, Universidad Católica, Boca, etc.).
   - Inspect table `gols`, `escalacoes`, and `jogadores_estatisticas` for athlete ID 2066.
   - Formulate the exact SQL to remove/reassign these 17 historical goals from ID 2066, disassociate foreign clubs from his profile, reset `ano_inicio` to authentic professional debut (2023), and recalculate his stats.
2. **Pedro (ID 10)**:
   - Pedro (Flamengo striker, ID 10) was linked to match 202533214 (Independiente Petrolero vs Guabirá, Copa Sudamericana) or similar non-Pedro match, causing "Guabirá" to appear in Pedro's clubs.
   - Inspect table `partidas`, `escalacoes`, `gols`, and `jogadores_estatisticas` for athlete ID 10 and "Guabirá".
   - Formulate the exact SQL to remove the invalid lineup/goal link and purge "Guabirá" from Pedro's club history.
3. Test your SQL queries on a copy in `/tmp/test_m2_homonyms.db` to verify that Mycael and Pedro have completely clean, accurate records.
4. Write your complete report with verified SQL queries to `handoff.md` in your working directory and notify parent via `send_message`.

## Authoritative Reference
- `/mnt/jogos_f/Antigravity_Projetos_e_Ferramentas/Guia profissional/.agents/teamwork/ORIGINAL_REQUEST.md`
- `/mnt/jogos_f/Antigravity_Projetos_e_Ferramentas/Guia profissional/PROJECT.md`

## 2026-10-30T20:05:07Z
You are Explorer M2-2 (Homonyms Disassociation Investigator).
Your working directory is:
/mnt/jogos_f/Antigravity_Projetos_e_Ferramentas/Guia profissional/.agents/teamwork/teamwork_preview_explorer_m2_2

Please read your dispatch instructions at:
/mnt/jogos_f/Antigravity_Projetos_e_Ferramentas/Guia profissional/.agents/teamwork/teamwork_preview_explorer_m2_2/DISPATCH.md
And PROJECT.md at:
/mnt/jogos_f/Antigravity_Projetos_e_Ferramentas/Guia profissional/PROJECT.md
And ORIGINAL_REQUEST.md at:
/mnt/jogos_f/Antigravity_Projetos_e_Ferramentas/Guia profissional/.agents/teamwork/ORIGINAL_REQUEST.md

Your goal is to investigate and formulate the exact SQL fix for corrupted homonym cross-links in data/futebol.db:
1. Mycael (ID 2066): Goalkeeper born in 2004 who inherited 17 goals from 1988-1997 scored in Copa Libertadores by Alberto "Beto" Acosta. Formulate exact SQL to remove/reassign these goals from ID 2066, disassociate foreign clubs, reset ano_inicio to 2023, and recalculate his stats.
2. Pedro (ID 10): Striker who was linked to match 202533214 (Independiente Petrolero vs Guabirá) causing "Guabirá" to appear in Pedro's clubs. Formulate exact SQL to remove the invalid link and purge Guabirá.
3. Test your SQL queries on a copy in /tmp/test_m2_homonyms.db.
4. Write your complete report with verified SQL queries to handoff.md in your working directory and notify parent via send_message.

