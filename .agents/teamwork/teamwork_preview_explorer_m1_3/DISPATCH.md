# DISPATCH - Explorer M1-3 (Schema Expansion & Jogos=Gols Data Reversion)

## Mission
Analyze exact SQL migration and data reversion for Features 3 and 4 (Milestone M1):
1. Schema expansion for `atleta_sofascore_ratings`: add columns:
   - `npxg_acumulado REAL`
   - `delta_xg REAL`
   - `perfil_clinico TEXT`
   - `taxa_conversao_pct REAL`
2. Data fix for `jogadores_estatisticas`:
   - Calculate genuine local match appearances from `(SELECT id_partida, id_jogador FROM escalacoes UNION SELECT id_partida, id_jogador FROM gols UNION SELECT id_partida, id_jogador FROM cartoes)`.
   - Revert the artificial `total_jogos = total_gols` (average 1.00) for the 2,705 affected athletes (e.g., Luís Fabiano ID 9033, Marcelinho Carioca, Edmundo, Dinamite, Romário, Zico).
   - Set `total_jogos` to the genuine count of distinct catalog matches where the player participated, while keeping `gols_carreira_oficiais` and `jogos_carreira_oficiais` intact.
   - Verify how the audit script evaluates these athletes once reverted.

Please read:
- `/mnt/jogos_f/Antigravity_Projetos_e_Ferramentas/Guia profissional/PROJECT.md`
- `/mnt/jogos_f/Antigravity_Projetos_e_Ferramentas/Guia profissional/.agents/teamwork/ORIGINAL_REQUEST.md`
- `/mnt/jogos_f/Antigravity_Projetos_e_Ferramentas/Guia profissional/.agents/teamwork/teamwork_preview_explorer_survey_1/handoff.md`

Output your technical findings and verified SQL migration scripts in `handoff.md`.

## 2026-10-30T18:39:39Z
User Request received for Explorer M1-3:
Formulate exact SQL migration and data reversion for Features 3 and 4 of Milestone M1.
- Schema migration for atleta_sofascore_ratings.
- Data fix for jogadores_estatisticas (authentic local match appearances, revert total_jogos = total_gols for 2,705 athletes).
- Verify media_gols_por_jogo and career stats.
- Test SQL logic on temporary copy of data/futebol.db in /tmp/.
- Document in handoff.md.
