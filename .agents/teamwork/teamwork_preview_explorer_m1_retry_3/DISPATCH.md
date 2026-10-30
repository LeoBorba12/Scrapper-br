# DISPATCH - Explorer M1 Retry 3 (Audit Script Regra 5 & Regra 11 Hardening)

## Context
Milestone M1 Gate failed due to Challenger M1-1 REJECT.
Challenger report: `/mnt/jogos_f/Antigravity_Projetos_e_Ferramentas/Guia profissional/.agents/teamwork/teamwork_preview_challenger_m1_1/handoff.md`

## Mission
Analyze and harden `scripts/auditar_integridade_dados.py`:
1. In Regra 5: ensure that the `DELETE` query matches the `SELECT` query:
   Include `mandante IS NULL OR mandante = '' OR visitante IS NULL OR visitante = ''` in the deletion so no null/empty clubs can escape deletion while reporting "CORRIGIDO".
2. Also in Regra 5: after deleting scraping matches, execute an automatic recalculation of `total_gols`, `total_jogos`, and `media_gols_por_jogo` for any affected athletes so `jogadores_estatisticas` stays 100% in sync with `gols` and `escalacoes`.
3. In Regra 11: harmonize the report title and docstring to reflect the actual verified threshold (e.g. `(<= 2.5)`).
4. Verify that running `scripts/auditar_integridade_dados.py` passes 12/12 with 0 anomalies.
5. Output your code diff and verification plan in `handoff.md`.

## 2026-10-30T19:25:34Z
You are Explorer M1 Retry 3 (Audit Script Regra 5 & Regra 11 Hardening).
Your working directory is:
/mnt/jogos_f/Antigravity_Projetos_e_Ferramentas/Guia profissional/.agents/teamwork/teamwork_preview_explorer_m1_retry_3

Read your dispatch instructions at:
/mnt/jogos_f/Antigravity_Projetos_e_Ferramentas/Guia profissional/.agents/teamwork/teamwork_preview_explorer_m1_retry_3/DISPATCH.md
And Challenger M1-1 handoff report at:
/mnt/jogos_f/Antigravity_Projetos_e_Ferramentas/Guia profissional/.agents/teamwork/teamwork_preview_challenger_m1_1/handoff.md

Your goal is to formulate the exact code diff for scripts/auditar_integridade_dados.py:
1. Fix Regra 5 DELETE query to include mandante IS NULL OR mandante = '' OR visitante IS NULL OR visitante = '', matching the SELECT query.
2. In Regra 5, trigger automatic resynchronization of affected athlete stats in jogadores_estatisticas after deleting any match/goals.
3. Harmonize Regra 11 title and docstring.
Write your findings and verified diff in handoff.md and notify parent via send_message.
