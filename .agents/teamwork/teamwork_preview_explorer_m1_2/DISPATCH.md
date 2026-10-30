# DISPATCH - Explorer M1-2 (Relational Audit Script Saneamento)

## Mission
Analyze exact modifications required for `scripts/auditar_integridade_dados.py` (Feature 2, Milestone M1):
1. Fix numbering of the 12 rules: ensure sequential 1 to 12 without skips (currently skips 8 and duplicates 12).
2. Remove the harmful auto-repair in Regra 12 that executes `SET total_jogos = MAX(total_jogos, total_gols)`, which caused the 1.00 goal/game bug.
3. Enhance audit rules to detect:
   - Matches with score 0x0 that have ghost goals assigned (e.g. scraping errors like "Estatísticas e Escalações").
   - Clubs with scraping artifacts (`LIKE '%Estatísticas%'`).
4. Ensure all 12 rules pass cleanly with 0 anomalies after the data fixes.

Please read:
- `/mnt/jogos_f/Antigravity_Projetos_e_Ferramentas/Guia profissional/PROJECT.md`
- `/mnt/jogos_f/Antigravity_Projetos_e_Ferramentas/Guia profissional/.agents/teamwork/ORIGINAL_REQUEST.md`
- `/mnt/jogos_f/Antigravity_Projetos_e_Ferramentas/Guia profissional/scripts/auditar_integridade_dados.py`
- `/mnt/jogos_f/Antigravity_Projetos_e_Ferramentas/Guia profissional/.agents/teamwork/teamwork_preview_explorer_survey_1/handoff.md`

Output your technical findings and exact code diff plan in `handoff.md`.

## 2026-10-30T18:39:39Z
You are Explorer M1-2 (Relational Audit Script Saneamento).
Your working directory is:
/mnt/jogos_f/Antigravity_Projetos_e_Ferramentas/Guia profissional/.agents/teamwork/teamwork_preview_explorer_m1_2

Please read your dispatch instructions at:
/mnt/jogos_f/Antigravity_Projetos_e_Ferramentas/Guia profissional/.agents/teamwork/teamwork_preview_explorer_m1_2/DISPATCH.md
And PROJECT.md at:
/mnt/jogos_f/Antigravity_Projetos_e_Ferramentas/Guia profissional/PROJECT.md
And ORIGINAL_REQUEST.md at:
/mnt/jogos_f/Antigravity_Projetos_e_Ferramentas/Guia profissional/.agents/teamwork/ORIGINAL_REQUEST.md

Your goal is to formulate the exact modifications for scripts/auditar_integridade_dados.py (Feature 2 of Milestone M1):
1. Fix numbering of the 12 rules: ensure sequential 1 to 12 without skips (currently skips 8 and duplicates 12).
2. Remove the harmful auto-repair in Regra 12 that executes SET total_jogos = MAX(total_jogos, total_gols), which forced the 1.00 goal/game bug.
3. Enhance audit rules to detect:
   - Matches with score 0x0 that have ghost goals assigned (e.g. scraping errors like "Estatísticas e Escalações").
   - Clubs with scraping artifacts (LIKE '%Estatísticas%').
4. Formulate the exact code diff for scripts/auditar_integridade_dados.py so all 12 rules execute and report OK.
5. Document your technical findings and diff plan in handoff.md in your working directory.
Notify parent via send_message when done.
