# BRIEFING — 2026-10-30T19:37:00Z

## Mission
Formulate exact code diff for scripts/auditar_integridade_dados.py to harden Regra 5 (delete match sync + athlete stat resync) and Regra 11 (title/docstring harmony).

## 🔒 My Identity
- Archetype: explorer
- Roles: [explorer, synthesis]
- Working directory: /mnt/jogos_f/Antigravity_Projetos_e_Ferramentas/Guia profissional/.agents/teamwork/teamwork_preview_explorer_m1_retry_3
- Original parent: 9c2d948a-bd66-4e27-83b1-9e8d50e60942
- Milestone: M1 Retry 3

## 🔒 Key Constraints
- Read-only investigation — do NOT implement directly in production codebase; provide verified diff in handoff
- Analyze scripts/auditar_integridade_dados.py and formulate exact, surgically minimal diff
- Ensure Regra 5 DELETE matches SELECT (mandante IS NULL OR mandante = '' OR visitante IS NULL OR visitante = '')
- Ensure Regra 5 triggers automatic resynchronization of jogadores_estatisticas for affected athletes
- Ensure Regra 11 title and docstring harmonize with <= 2.5 threshold

## Current Parent
- Conversation ID: 9c2d948a-bd66-4e27-83b1-9e8d50e60942
- Updated: not yet

## Investigation State
- **Explored paths**: `scripts/auditar_integridade_dados.py`, `tests/test_e2e_futstats.py`, `tests/test_model_evals.py`, database tables (`partidas`, `gols`, `escalacoes`, `cartoes`, `jogadores_estatisticas`).
- **Key findings**:
  1. Regra 5 DELETE query previously only checked `LIKE '%Estatísticas%'` and failed to delete matches where `mandante IS NULL OR mandante = '' OR visitante IS NULL OR visitante = ''`.
  2. Regra 5 auto-repair previously deleted spurious matches/goals without recalculating athlete counters in `jogadores_estatisticas`.
  3. Pre-collecting affected `id_jogador` from `gols`, `escalacoes`, and `cartoes` before deletion allows precise, targeted resync of `total_gols`, `total_jogos`, and `media_gols_por_jogo`.
  4. Regra 11 title and docstring harmonized to `"Coerência de Atletas: Médias Verossímeis (<= 2.5)"`.
  5. The patch passes `git apply --check` cleanly and executes 12/12 rules OK with 0 anomalies.
- **Unexplored areas**: None within the scope of M1 Retry 3.

## Key Decisions Made
- Pre-collect affected athletes using a UNION query across `gols`, `escalacoes`, and `cartoes` before deletion.
- Recalculate `total_gols`, `total_jogos`, `media_gols_por_jogo`, `participacoes_gols`, and `media_participacao_por_jogo` iteratively for all affected athlete IDs.
- Harmonize Regra 11 title and docstring to reflect `(<= 2.5)`.
- Export unified patch to `scripts_auditar_integridade_dados.patch` and full proposed file to `proposed_auditar_integridade_dados.py`.

## Artifact Index
- DISPATCH.md — Incoming mission instructions
- BRIEFING.md — Situational awareness
- progress.md — Liveness heartbeat
- scripts_auditar_integridade_dados.patch — Verified unified patch for scripts/auditar_integridade_dados.py
- proposed_auditar_integridade_dados.py — Complete patched file
- handoff.md — Final 5-component handoff report
