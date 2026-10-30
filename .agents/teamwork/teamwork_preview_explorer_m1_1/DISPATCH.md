# DISPATCH - Explorer M1-1 (Storage Optimization & VACUUM)

## Mission
Analyze exact execution plan for Feature 1 (Milestone M1):
1. Safely drop redundant indexes: `idx_partidas_data` (covered by `idx_partidas_data_mandante`) and `idx_escalacoes_atleta` (not used by backend).
2. Safely drop legacy unreferenced table `jogadores_resumo`.
3. Plan `VACUUM;` on `data/futebol.db` to reduce size from 96.9 MB to ~88.5 MB, guaranteeing strict compliance with Vercel's 94.0 MB limit.
4. Verify no queries in backend or scripts break when these indexes/tables are dropped.

Please read:
- `/mnt/jogos_f/Antigravity_Projetos_e_Ferramentas/Guia profissional/PROJECT.md`
- `/mnt/jogos_f/Antigravity_Projetos_e_Ferramentas/Guia profissional/.agents/teamwork/ORIGINAL_REQUEST.md`
- `/mnt/jogos_f/Antigravity_Projetos_e_Ferramentas/Guia profissional/.agents/teamwork/teamwork_preview_explorer_survey_1/handoff.md`

Output your technical findings and verified SQL commands in `handoff.md`.

## 2026-10-30T18:39:39Z
You are Explorer M1-1 (Storage Optimization & VACUUM).
Your working directory is:
/mnt/jogos_f/Antigravity_Projetos_e_Ferramentas/Guia profissional/.agents/teamwork/teamwork_preview_explorer_m1_1

Please read your dispatch instructions at:
/mnt/jogos_f/Antigravity_Projetos_e_Ferramentas/Guia profissional/.agents/teamwork/teamwork_preview_explorer_m1_1/DISPATCH.md
And PROJECT.md at:
/mnt/jogos_f/Antigravity_Projetos_e_Ferramentas/Guia profissional/PROJECT.md
And ORIGINAL_REQUEST.md at:
/mnt/jogos_f/Antigravity_Projetos_e_Ferramentas/Guia profissional/.agents/teamwork/ORIGINAL_REQUEST.md

Your goal is to formulate the exact, safe execution plan for Feature 1 of Milestone M1:
1. Verify exact index names: idx_partidas_data (covered by idx_partidas_data_mandante) and idx_escalacoes_atleta. Confirm that no backend or frontend queries require idx_escalacoes_atleta or idx_partidas_data specifically.
2. Confirm that table jogadores_resumo is completely unreferenced by backend/app.py and scripts.
3. Prepare the exact SQL script to drop these two indexes, drop jogadores_resumo, and run VACUUM.
4. Verify on a temporary copy (/tmp/test_m1_vacuum.db) that size drops from 96.9 MB to ~88.5 MB (< 94.0 MB limit).
5. Document the exact step-by-step commands and precautions in handoff.md in your working directory.
Notify parent via send_message when done.
