# Task Assignment — Challenger M2-2 (Homonyms & Club Strings Challenger)

## Identity
- **Role**: Challenger (teamwork_preview_challenger)
- **Milestone**: M2 (Auto-Cura de Clubes Espúrios, Conmebol & Homônimos)
- **Working Directory**: `/mnt/jogos_f/Antigravity_Projetos_e_Ferramentas/Guia profissional/.agents/teamwork/teamwork_preview_challenger_m2_2`

## Mission
Empirically and adversarially challenge the homonym decoupling and career club sanitization:
1. Read Worker M2's handoff report at `/mnt/jogos_f/Antigravity_Projetos_e_Ferramentas/Guia profissional/.agents/teamwork/teamwork_preview_worker_m2/handoff.md`.
2. Inspect Mycael (ID 2066):
   - Check that `gols` has 0 rows for `id_jogador = 2066`.
   - Check that `ano_inicio = 2023`, `posicao = 'Goleiro'`, `total_gols = 0`, `clean_sheets = 1`.
   - Check that `clubes` does NOT contain Boca, San Lorenzo, Católica, Cerro, etc.
3. Inspect Pedro (ID 10):
   - Check that match 202533214 is NOT linked to Pedro in `escalacoes`.
   - Check that `clubes` does NOT contain 'Guabirá' and `total_jogos = 329`.
4. Inspect Paulo Henrique Ganso (ID 16):
   - Check that Ganso has 0 goals/lineups for Atlético Goianiense.
   - Check that `clubes` does NOT contain 'Atlético Nacional' or 'Atlético Goianiense'.
5. Inspect Alex (ID 2373):
   - Check that `nome_exibicao = 'Alex'`, `apelido = 'Alex Cabeção'`, and Criciúma goalkeeper lineups are decoupled.
6. Inspect Zinho (ID 13959):
   - Check that corrupted `{"clube": "J", "periodo": "M"}` JSON is gone and replaced by authentic career details.
7. Inspect Luís Fabiano (ID 9033):
   - Guarantee zero foreign Conmebol clubs in `clubes` or `detalhe_carreira_clubes`.
8. Deliver your evaluation and verdict (`APPROVE` or `REJECT`) in `handoff.md` in your working directory and notify parent via `send_message`.

## Authoritative Reference
- `/mnt/jogos_f/Antigravity_Projetos_e_Ferramentas/Guia profissional/.agents/teamwork/ORIGINAL_REQUEST.md`
- `/mnt/jogos_f/Antigravity_Projetos_e_Ferramentas/Guia profissional/PROJECT.md`

## 2026-10-30T20:38:53Z
You are Challenger M2-2 (Homonyms & Club Strings Challenger).
Your working directory is:
/mnt/jogos_f/Antigravity_Projetos_e_Ferramentas/Guia profissional/.agents/teamwork/teamwork_preview_challenger_m2_2

Please read your dispatch instructions at:
/mnt/jogos_f/Antigravity_Projetos_e_Ferramentas/Guia profissional/.agents/teamwork/teamwork_preview_challenger_m2_2/DISPATCH.md
And PROJECT.md at:
/mnt/jogos_f/Antigravity_Projetos_e_Ferramentas/Guia profissional/PROJECT.md
And Worker M2's handoff report at:
/mnt/jogos_f/Antigravity_Projetos_e_Ferramentas/Guia profissional/.agents/teamwork/teamwork_preview_worker_m2/handoff.md
And ORIGINAL_REQUEST.md at:
/mnt/jogos_f/Antigravity_Projetos_e_Ferramentas/Guia profissional/.agents/teamwork/ORIGINAL_REQUEST.md

Empirically challenge the homonym decoupling and career club sanitization (Mycael ID 2066, Pedro ID 10, Ganso ID 16, Alex ID 2373, Zinho ID 13959, Luís Fabiano ID 9033).
Write your report in handoff.md with a clear verdict: APPROVE or REJECT.
Notify parent via send_message when done.

