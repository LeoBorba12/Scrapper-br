# DISPATCH - Explorer M1 Retry 2 (Acceptance Test Career Divergence & Serginho/Flaco Fix)

## Context
Milestone M1 Gate failed due to Challenger M1-1 REJECT.
Failure: `pytest tests/test_e2e_futstats.py -k "test_t1_r1_db_no_forced_jogos_equals_gols_with_divergent_career"` failed on Serginho (ID 12636) and Flaco López (ID 67).
Challenger report: `/mnt/jogos_f/Antigravity_Projetos_e_Ferramentas/Guia profissional/.agents/teamwork/teamwork_preview_challenger_m1_1/handoff.md`

## Mission
Analyze why Serginho (ID 12636) and Flaco López (ID 67) failed this test:
1. Examine Serginho (ID 12636): how many appearances does he have in `escalacoes`, `gols`, and `cartoes`? Why was `total_jogos = 45` and `total_gols = 45`? What are his genuine appearances?
2. Examine Flaco López (ID 67): after deleting the 2 scraping matches where Flaco scored, his `total_jogos` was 14 and `total_gols` was 14, while his genuine matches in catalog are 12.
3. Formulate the exact SQL update so that:
   - No athlete with `total_gols > 10` and `jogos_carreira_oficiais > total_gols * 1.5` has `total_jogos == total_gols` artificially.
   - `test_t1_r1_db_no_forced_jogos_equals_gols_with_divergent_career` passes with 0 anomalies.
4. Test on a temporary copy of `data/futebol.db` in `/tmp/` and verify the test passes.
5. Output your verified solution in `handoff.md`.

## 2026-10-30T19:25:34Z
Dispatch received from orchestrator/user.
Investigate why test_t1_r1_db_no_forced_jogos_equals_gols_with_divergent_career failed on Serginho (ID 12636) and Flaco López (ID 67), and formulate the exact data fix so this test passes with 0 anomalies.
