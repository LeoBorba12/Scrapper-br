# DISPATCH - E2E Test Writer (E2E Testing Track)

## Mission
Design and implement the E2E Test Suite for FutStats in `tests/e2e/` (or `tests/test_e2e_futstats.py`) following the 4-tier methodology:
1. **Tier 1 - Feature Coverage (>=5 per feature)**:
   - R1: Reconciliação Jogos-Gols & Rótulo Honesto de Catálogo
   - R2: Auto-Cura de Clubes Espúrios & Inversões Conmebol
   - R3: Notas de Scouting (tanh 0-10), Sofascore Ratings, xG/npxG/Delta xG sem nulos, Radar Pentagonal
   - R4: Teto de Armazenamento (<94 MB), Regressão Matemática (22/22) e Auditoria de Dados (12/12)
2. **Tier 2 - Boundary & Corner Cases (>=5 per feature)**:
   - Atletas com 0 jogos, 1 jogo / 1 gol (média 1.00 genuína), atletas apenas com gols sem escalação, anos pré e pós 2018, valores extremos de lambda no Dixon-Coles, clamping de rating tanh em 3.0 e 10.0.
3. **Tier 3 - Cross-Feature Combinations (pairwise)**:
   - Interações entre acervo parcial + rating sofascore + radar pentagonal + clubes limpos.
4. **Tier 4 - Real-World Application Scenarios (>=5 cenários)**:
   - Perfil de Luís Fabiano (ID 9033): média correta, sem River Plate/U. de Chile, radar válido, badge presente.
   - Perfil de Zico / Romário: acervo parcial histórico, média oficial de carreira exibida, rótulo "Jogos c/ Gol".
   - Perfil de Pedro / Gabigol: artilheiro moderno, xG/npxG consistente, perfil Clínico de Elite.
   - Perfil de Goleiro (Mycael ID 2066): sem gols de 1988/1997, sem clubes estrangeiros espúrios.
   - Auditoria completa de banco + regressão + build + teto de storage.

Deliverables:
- Write `TEST_INFRA.md` at project root documenting architecture, methodology, and coverage.
- Write executable test suite in `tests/test_e2e_futstats.py` (runnable with `pytest`).
- Publish `TEST_READY.md` at project root when complete with runner command and coverage summary.
- Write `handoff.md` in this directory.

Please read:
- `/mnt/jogos_f/Antigravity_Projetos_e_Ferramentas/Guia profissional/PROJECT.md`
- `/mnt/jogos_f/Antigravity_Projetos_e_Ferramentas/Guia profissional/.agents/teamwork/ORIGINAL_REQUEST.md`

## 2026-10-30T18:39:39Z
You are the E2E Test Architect & Writer (teamwork_preview_test_writer).
Your working directory is:
/mnt/jogos_f/Antigravity_Projetos_e_Ferramentas/Guia profissional/.agents/teamwork/teamwork_preview_test_writer_e2e_1

Please read your dispatch instructions at:
/mnt/jogos_f/Antigravity_Projetos_e_Ferramentas/Guia profissional/.agents/teamwork/teamwork_preview_test_writer_e2e_1/DISPATCH.md
And PROJECT.md at:
/mnt/jogos_f/Antigravity_Projetos_e_Ferramentas/Guia profissional/PROJECT.md
And ORIGINAL_REQUEST.md at:
/mnt/jogos_f/Antigravity_Projetos_e_Ferramentas/Guia profissional/.agents/teamwork/ORIGINAL_REQUEST.md

Your goal is to design and write the complete E2E Test Suite for FutStats:
1. Design TEST_INFRA.md at project root following the 4-tier methodology (Tier 1: Feature Coverage, Tier 2: Boundary/Corner, Tier 3: Cross-Feature, Tier 4: Real-World Scenarios).
2. Create executable tests in tests/test_e2e_futstats.py using pytest.
   - Test R1: Jogos vs Gols reconciliation, honest label "Jogos c/ Gol", media ponderada autêntica.
   - Test R2: Purge of spurious Conmebol clubs, Luís Fabiano 9033 free of River Plate / U. de Chile, clean club history.
   - Test R3: Player rating (tanh 0-10), atleta_sofascore_ratings table schema, xG/npxG/Delta xG non-null, Radar Pentagonal 5 axes.
   - Test R4: Storage size < 94.0 MB, auditar_integridade_dados.py 12/12 rules OK, test_model_evals.py 22/22 pass.
3. Run pytest tests/test_e2e_futstats.py to verify your test harness runs cleanly (or fails only on features not yet implemented).
4. Create TEST_READY.md at project root when complete.
5. Write handoff.md in your working directory and notify parent via send_message.

