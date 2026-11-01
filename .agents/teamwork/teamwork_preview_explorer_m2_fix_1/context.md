# Explorer M2 Fix 1 Context
Scope: Formulate exact remediation plan for Milestone 2 issues identified by Challenger M2:
1. Fix score cap guard in scripts/ingestor_sumulas_massivo_ogol.py and scripts/ingerir_cache_ogol_existente.py (expected_goals == 0 must NEVER receive goals).
2. Purge contaminated goals from matches 5189 and 6549 and any other 0-0 match.
3. Multi-minute rows expansion (1NF): split space-separated minutes ('45+3  83') into separate individual rows in gols.
4. Expunge attendance rows ('att-') and minute > 130 / minute == 0 artifacts.
5. Enforce tournament filtering to prevent cross-competition date collisions.
6. Ensure tests/test_challenger_m2_r2_adversarial.py passes 100%.
Write plan, patch, or migration script proposal in handoff.md.
