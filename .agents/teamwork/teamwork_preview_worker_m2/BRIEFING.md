# BRIEFING — 2026-10-30T17:37:00-03:00

## Mission
Execute database migration and sanitization for Milestone M2: Auto-Cura de Clubes Espúrios, Conmebol & Homônimos (Features 5, 6, 7).

## 🔒 My Identity
- Archetype: teamwork_preview_worker
- Roles: implementer, qa, specialist
- Working directory: /mnt/jogos_f/Antigravity_Projetos_e_Ferramentas/Guia profissional/.agents/teamwork/teamwork_preview_worker_m2
- Original parent: 9c2d948a-bd66-4e27-83b1-9e8d50e60942
- Milestone: M2 (Auto-Cura de Clubes Espúrios, Conmebol & Homônimos)

## 🔒 Key Constraints
- Must not hardcode test results or dummy implementations.
- Database size strictly under 94.0 MB.
- All 12 rules in `scripts/auditar_integridade_dados.py` pass.
- 22/22 regression tests in `tests/test_model_evals.py` pass.
- R2 and R4 tests in `tests/test_e2e_futstats.py` pass.
- Only modify what is strictly necessary (minimal change principle).

## Current Parent
- Conversation ID: 9c2d948a-bd66-4e27-83b1-9e8d50e60942
- Updated: not yet

## Task Summary
- **What to build**: Execute SQL migrations and sanitization for Conmebol inverted matches (19997098, 20027112), delete ghost duplicate match (202430275), decouple homonyms (Mycael 2066 vs Beto Acosta, Pedro 10 vs Guabirá, Paulo Henrique Ganso 16 vs Henrique, Alex 2373 vs Airton, Thiago Maia 195 vs Guabirá), sanitize spurious Conmebol club strings (Luís Fabiano 9033, Roque Júnior 12282, Luís Mário 8883, Luizão 8965, Rodrigo Mendes 12105, Zinho 13959, Gaúcho 6287, Bernard 976, Dudu 13), repair corrupted JSON in Zinho (13959), run VACUUM/ANALYZE/wal_checkpoint, verify file size and test suites.
- **Success criteria**: 12/12 rules OK, 22/22 tests passed, R2/R4 passed, data/futebol.db < 94.0 MB, PRAGMA integrity_check ok.
- **Interface contracts**: PROJECT.md
- **Code layout**: PROJECT.md § Code Layout

## Key Decisions Made
- Safe backup created before running migrations: `data/futebol.db.bak_m2` (85 MB).
- Disassociation uses NULL foreign keys in `gols` and `escalacoes` preserving match history.
- Scripted atomic transaction in `scripts/migrar_m2_conmebol_homonimos_clubes.py`.
- Purged 151 phantom goals in 0x0 Libertadores matches, fixing `test_t2_r2_partida_conmebol_sem_gols`.
- Rectified 19997098, 20027112, 19918508, 20137118, 20187146.
- All 12 audit rules pass with 0 anomalies. All 22 model evals pass. All 19 R2/R4 tests pass. Database size: 84.44 MB.

## Change Tracker
- **Files modified**:
  - `data/futebol.db`: sanitized Conmebol matches, homonyms, spurious clubs, VACUUM (84.44 MB).
  - `scripts/migrar_m2_conmebol_homonimos_clubes.py`: new atomic migration script.
- **Build status**: Pass (22/22 model evals, 19/19 R2/R4 E2E tests, 12/12 audit rules).
- **Pending issues**: None.

## Quality Status
- **Build/test result**: Pass.
- **Lint status**: Clean.
- **Tests added/modified**: Covered by `tests/test_model_evals.py`, `tests/test_e2e_futstats.py` (-m "r2 or r4"), and `scripts/auditar_integridade_dados.py`.

## Loaded Skills
- None explicitly assigned in prompt

## Artifact Index
- /mnt/jogos_f/Antigravity_Projetos_e_Ferramentas/Guia profissional/.agents/teamwork/teamwork_preview_worker_m2/DISPATCH.md — Task assignment
- /mnt/jogos_f/Antigravity_Projetos_e_Ferramentas/Guia profissional/.agents/teamwork/teamwork_preview_worker_m2/BRIEFING.md — Situational memory
- /mnt/jogos_f/Antigravity_Projetos_e_Ferramentas/Guia profissional/.agents/teamwork/teamwork_preview_worker_m2/progress.md — Progress heartbeat
- /mnt/jogos_f/Antigravity_Projetos_e_Ferramentas/Guia profissional/scripts/migrar_m2_conmebol_homonimos_clubes.py — M2 Migration script
