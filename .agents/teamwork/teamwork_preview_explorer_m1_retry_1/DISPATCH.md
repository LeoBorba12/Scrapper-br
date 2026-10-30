# DISPATCH - Explorer M1 Retry 1 (Resync of 25 Athletes in jogadores_estatisticas)

## Context
Milestone M1 Gate failed due to Challenger M1-1 REJECT.
Challenger report: `/mnt/jogos_f/Antigravity_Projetos_e_Ferramentas/Guia profissional/.agents/teamwork/teamwork_preview_challenger_m1_1/handoff.md`

## Mission
Analyze and test the exact query to resynchronize `total_gols`, `total_jogos`, and `media_gols_por_jogo` in `jogadores_estatisticas` for the 25 affected athletes (e.g. Raphael Veiga, Yuri Alberto, Memphis Depay, Endrick, Estêvão, Calleri, Neymar, Flaco López):
1. Identify all athletes where `total_gols` in `jogadores_estatisticas` diverges from `COUNT(*)` in table `gols`.
2. Formulate an idempotent, clean SQL update that resynchronizes:
   - `total_gols = (SELECT COUNT(*) FROM gols WHERE gols.id_jogador = jogadores_estatisticas.id_jogador)`
   - `total_jogos = (SELECT COUNT(DISTINCT id_partida) FROM (SELECT id_partida, id_jogador FROM escalacoes UNION SELECT id_partida, id_jogador FROM gols UNION SELECT id_partida, id_jogador FROM cartoes) t WHERE t.id_jogador = jogadores_estatisticas.id_jogador)`
   - `media_gols_por_jogo = ROUND(CAST(total_gols AS REAL) / MAX(total_jogos, 1), 2)`
3. Test on a temporary copy of `data/futebol.db` in `/tmp/` and verify that all 25 athletes match exactly.
4. Output your verified solution in `handoff.md`.

## 2026-10-30T19:25:33Z
You are Explorer M1 Retry 1 (Resync of 25 Athletes in jogadores_estatisticas).
Your working directory is:
/mnt/jogos_f/Antigravity_Projetos_e_Ferramentas/Guia profissional/.agents/teamwork/teamwork_preview_explorer_m1_retry_1

