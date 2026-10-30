# Task Assignment — Explorer M2-3 (Spurious Club Strings & Luís Fabiano Validation)

## Identity
- **Role**: Explorer (teamwork_preview_explorer)
- **Milestone**: M2 (Auto-Cura de Clubes Espúrios, Conmebol & Homônimos)
- **Working Directory**: `/mnt/jogos_f/Antigravity_Projetos_e_Ferramentas/Guia profissional/.agents/teamwork/teamwork_preview_explorer_m2_3`

## Mission
Investigate and formulate the exact SQL and Python logic to purge spurious Conmebol foreign clubs from Brazilian players in `jogadores_estatisticas`:
1. **Luís Fabiano (ID 9033)**:
   - Verify why Luís Fabiano had "River Plate" and "Universidad de Chile" attached to his career in SQLite.
   - Trace the exact origin: Was it from matches in `gols` or `escalacoes` where he scored against River Plate / U. de Chile, or inverted mandante, or scraping artifacts?
   - Ensure Luís Fabiano exhibits strictly authentic clubs (e.g., São Paulo, Ponte Preta, Vasco da Gama, Sevilla, Porto, Tianjin Quanjian) and ZERO foreign Conmebol clubs.
2. **Other Brazilian Players with Spurious Foreign Clubs**:
   - Inspect Zinho, Roque Junior, Alex, Rodrigo Mendes (who had "River Plate" attached due to the inverted matches).
   - Inspect Paulo Henrique Ganso (ID 16, who had "Atlético Nacional" attached).
   - Scan `jogadores_estatisticas` for any other Brazilian players who have foreign clubs in `clubes` or `detalhe_carreira_clubes` that they never played for.
3. Formulate the exact SQL update / query to rebuild `clubes` and `detalhe_carreira_clubes` genuinely from authentic team affiliations.
4. Verify that `VACUUM; ANALYZE;` preserves `data/futebol.db` well under 94.0 MB.
5. Test your logic on `/tmp/test_m2_clubs.db`.
6. Write your complete report with verified SQL queries to `handoff.md` in your working directory and notify parent via `send_message`.

## Authoritative Reference
- `/mnt/jogos_f/Antigravity_Projetos_e_Ferramentas/Guia profissional/.agents/teamwork/ORIGINAL_REQUEST.md`
- `/mnt/jogos_f/Antigravity_Projetos_e_Ferramentas/Guia profissional/PROJECT.md`

## 2026-10-30T17:05:07Z
You are Explorer M2-3 (Spurious Clubs Investigator).
Your working directory is:
/mnt/jogos_f/Antigravity_Projetos_e_Ferramentas/Guia profissional/.agents/teamwork/teamwork_preview_explorer_m2_3

Please read your dispatch instructions at:
/mnt/jogos_f/Antigravity_Projetos_e_Ferramentas/Guia profissional/.agents/teamwork/teamwork_preview_explorer_m2_3/DISPATCH.md
And PROJECT.md at:
/mnt/jogos_f/Antigravity_Projetos_e_Ferramentas/Guia profissional/PROJECT.md
And ORIGINAL_REQUEST.md at:
/mnt/jogos_f/Antigravity_Projetos_e_Ferramentas/Guia profissional/.agents/teamwork/ORIGINAL_REQUEST.md

Your goal is to investigate and formulate the exact SQL and Python logic to purge spurious Conmebol foreign clubs from Brazilian players in jogadores_estatisticas:
1. Luís Fabiano (ID 9033): Trace why "River Plate" and "Universidad de Chile" appeared in his career in SQLite. Ensure Luís Fabiano exhibits strictly authentic clubs (Vasco, São Paulo, Ponte Preta) and ZERO foreign Conmebol clubs.
2. Other players: Zinho, Roque Junior, Alex, Rodrigo Mendes ("River Plate"), Paulo Henrique Ganso ID 16 ("Atlético Nacional"), etc.
3. Formulate the exact SQL update to rebuild `clubes` and `detalhe_carreira_clubes` genuinely from authentic team affiliations.
4. Verify that VACUUM preserves data/futebol.db well under 94.0 MB.
5. Test your logic on /tmp/test_m2_clubs.db.
6. Write your complete report with verified SQL queries to handoff.md in your working directory and notify parent via send_message.

