# Task Assignment — Challenger M3-2 (Career Average & Radar Challenger)

## Identity
- **Role**: Challenger (teamwork_preview_challenger)
- **Milestone**: M3 (Motores Matemáticos de Ratings, xG & Backend APIs)
- **Working Directory**: `/mnt/jogos_f/Antigravity_Projetos_e_Ferramentas/Guia profissional/.agents/teamwork/teamwork_preview_challenger_m3_2`

## Mission
Empirically and adversarially challenge the career average reconciliation, honest labeling, and Radar PES:
1. Read Worker M3's handoff report at `/mnt/jogos_f/Antigravity_Projetos_e_Ferramentas/Guia profissional/.agents/teamwork/teamwork_preview_worker_m3/handoff.md`.
2. Inspect and test `/api/jogadores/perfil` for Luís Fabiano (ID 9033):
   - Confirm `acervo_parcial: true`.
   - Confirm `jogos_rotulo: "Jogos c/ Gol"`.
   - Confirm `media_gols == 0.53` (NOT 1.00 and NOT 1.06).
   - Confirm `jogos_registrados == 158`.
   - Confirm `media_oficial_carreira == 0.53`.
3. Test Zico (ID 13953) and Romário (ID 12212): confirm `acervo_parcial: true` and authentic career averages.
4. Test modern player (e.g. Endrick, Pedro, etc.): confirm `acervo_parcial` works honestly without false flags.
5. Inspect `radar_pes`:
   - Verify all 5 axes (`atk`, `fin`, `cri`, `fis`, `def`) and `ovr` across 100+ random athletes: ZERO nulls, all values in [40, 99].
6. Run full verification:
   - `./.venv/bin/pytest tests/test_e2e_futstats.py -k "acervo_parcial or rotulo or media_gols or radar"`
7. Deliver your evaluation and verdict (`APPROVE` or `REJECT`) in `handoff.md` in your working directory and notify parent via `send_message`.

## Authoritative Reference
- `/mnt/jogos_f/Antigravity_Projetos_e_Ferramentas/Guia profissional/.agents/teamwork/ORIGINAL_REQUEST.md`
- `/mnt/jogos_f/Antigravity_Projetos_e_Ferramentas/Guia profissional/PROJECT.md`
