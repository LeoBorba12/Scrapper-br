# Task Assignment — Challenger M2-1 (Conmebol & Inversion Challenger)

## Identity
- **Role**: Challenger (teamwork_preview_challenger)
- **Milestone**: M2 (Auto-Cura de Clubes Espúrios, Conmebol & Homônimos)
- **Working Directory**: `/mnt/jogos_f/Antigravity_Projetos_e_Ferramentas/Guia profissional/.agents/teamwork/teamwork_preview_challenger_m2_1`

## Mission
Empirically and adversarially challenge the Conmebol match rectifications in `data/futebol.db`:
1. Read Worker M2's handoff report at `/mnt/jogos_f/Antigravity_Projetos_e_Ferramentas/Guia profissional/.agents/teamwork/teamwork_preview_worker_m2/handoff.md`.
2. Inspect match 19997098 (Palmeiras vs River Plate):
   - Confirm in `partidas`: mandante='Palmeiras', visitante='River Plate', placar='3 x 0', vencedor='Palmeiras'.
   - Confirm in `gols`: all 3 goals belong to 'Palmeiras' (Alex 2, Roque Júnior 1).
   - Confirm in `escalacoes`: both lineups belong to 'Palmeiras'.
3. Inspect match 20027112 (Grêmio vs River Plate):
   - Confirm in `partidas`: mandante='Grêmio', visitante='River Plate', placar='4 x 0', vencedor='Grêmio'.
   - Confirm in `gols`: all 4 goals belong to 'Grêmio'.
   - Confirm in `escalacoes`: all 4 lineups belong to 'Grêmio'.
4. Confirm ghost match 202430275 is 100% gone from `partidas`.
5. Check if any phantom goals exist in 0x0 Libertadores matches.
6. Verify that none of Alex (2373), Roque Júnior (12282), Luís Mário (8883), Luizão (8965), Rodrigo Mendes (12105), Zinho (13959) retain 'River Plate' in `jogadores_estatisticas.clubes`.
7. Deliver your evaluation and verdict (`APPROVE` or `REJECT`) in `handoff.md` in your working directory and notify parent via `send_message`.

## Authoritative Reference
- `/mnt/jogos_f/Antigravity_Projetos_e_Ferramentas/Guia profissional/.agents/teamwork/ORIGINAL_REQUEST.md`
- `/mnt/jogos_f/Antigravity_Projetos_e_Ferramentas/Guia profissional/PROJECT.md`

## 2026-10-30T20:38:53Z
You are Challenger M2-1 (Conmebol & Inversion Challenger).
Empirically challenge the Conmebol match rectifications in data/futebol.db (matches 19997098, 20027112, ghost match 202430275, 0x0 ghost goals, River Plate purged from Brazilian players).
Write your report in handoff.md with a clear verdict: APPROVE or REJECT.
Notify parent via send_message when done.

