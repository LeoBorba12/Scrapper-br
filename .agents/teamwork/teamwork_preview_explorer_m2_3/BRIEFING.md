# BRIEFING — 2026-10-30T17:21:00Z

## Mission
Investigate spurious Conmebol foreign clubs attached to Brazilian players in jogadores_estatisticas, trace root causes (e.g., Luís Fabiano ID 9033, Ganso ID 16, Zinho, etc.), formulate verified SQL/Python logic to purge them, and test on /tmp/test_m2_clubs.db.

## 🔒 My Identity
- Archetype: explorer
- Roles: Spurious Clubs Investigator, Evidence Synthesizer, SQL Formulator
- Working directory: /mnt/jogos_f/Antigravity_Projetos_e_Ferramentas/Guia profissional/.agents/teamwork/teamwork_preview_explorer_m2_3
- Original parent: 9c2d948a-bd66-4e27-83b1-9e8d50e60942
- Milestone: M2

## 🔒 Key Constraints
- Read-only investigation — do NOT modify production files / production database directly.
- Test proposed SQL logic on copy `/tmp/test_m2_clubs.db`.
- Database data/futebol.db must remain strictly under 94.0 MB with VACUUM.
- Purge spurious Conmebol foreign clubs (e.g., River Plate, U. de Chile, Boca, San Lorenzo, Atletico Nacional, etc.) from Brazilian players.
- Maintain honest and authentic career club strings and JSON details.

## Current Parent
- Conversation ID: 9c2d948a-bd66-4e27-83b1-9e8d50e60942
- Updated: 2026-10-30T17:17:34Z (Parent check-in received)

## Investigation State
- **Explored paths**: `data/futebol.db`, `data/relatorio_auditoria_jogadores.md`, `scripts/sanear_dados_atletas_e_estatisticas.py`, `scripts/scraper_ogol_carreira_atletas.py`, `scripts/auditar_integridade_dados.py`, `backend/app.py`, `frontend/src/components/ProtagonistaAtleta.jsx`, peer handoffs M2-1 and M2-2.
- **Key findings**:
  1. Luís Fabiano (ID 9033): Root cause traced to matches 20038048 (vs River Plate) and 20128082 (vs Universidad de Chile) where he scored against them, formerly aggregating opponent clubs into `clubes` (`São Paulo,Portuguesa,River Plate,Univers`). In current DB, `clubes` is already authentic (`Vasco, São Paulo, Ponte Preta`) and `detalhe_carreira_clubes` has authentic OGol career.
  2. Zinho (ID 13959): Has spurious `'River Plate'` and `'Estudiantes'` from inverted matches 20027112 and 19918508, plus corrupted `{"clube": "J", "periodo": "M"}` JSON.
  3. Roque Junior (ID 12282): Has `'River Plate'` from inverted match 19997098. Authentic: `'Palmeiras'`.
  4. Rodrigo Mendes (ID 12105): Has `'River Plate'` from inverted match 20027112. Authentic: `'Grêmio, Flamengo'`.
  5. Paulo Henrique Ganso (ID 16): Has `'Atlético Nacional'` (opponent aggregation) and `'Atlético Goianiense'` (substitute "Henrique" cross-linked in 15 Série B matches and 1 goal). Authentic: `'Fluminense, Santos, São Paulo'`.
  6. Alex (ID 2373): Name overwritten with `'Airton'` from 29 Criciúma goalkeeper escalacoes, and has `'River Plate'`, `'Libertad'`, `'Cienciano'`. Authentic: `Alex (Alexsandro de Souza)`, `'Coritiba, Palmeiras, Flamengo, Cruzeiro'`.
  7. Luizão (ID 8965), Luís Mário (ID 8883), Gaúcho (ID 6287), Bernard (ID 976), Dudu (ID 13), Thiago Maia (ID 195) all traced to inverted matches or opponent goal attributions.
- **Unexplored areas**: None. Complete investigation and tested verification achieved.

## Key Decisions Made
- Disassociate "Henrique" (Atlético Goianiense) from Ganso (ID 16) by setting `id_jogador = NULL` in `gols` and `escalacoes`.
- Disassociate "Airton" goalkeeper from Alex (ID 2373) by setting `id_jogador = NULL`.
- Formulate complete UPDATE SQL queries with authentic JSON career details.
- Verified on `/tmp/test_m2_clubs.db`: VACUUM produces 84.47 MB, all 12 audit rules pass, all tests pass.

## Artifact Index
- handoff.md — Complete 5-component handoff report with exact verified SQL and Python logic
- progress.md — Liveness heartbeat and progress tracker
