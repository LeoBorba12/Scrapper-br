# DISPATCH - Worker M1 Retry (Remediation of M1 Iteration 1 Findings)

## Mission
Apply the exact, verified remedies formulated by the 3 Retry Explorers to close all findings from Challenger M1-1:

### 1. Hardening of `scripts/auditar_integridade_dados.py`:
Apply the patch from `/mnt/jogos_f/Antigravity_Projetos_e_Ferramentas/Guia profissional/.agents/teamwork/teamwork_preview_explorer_m1_retry_3/scripts_auditar_integridade_dados.patch`:
- In Regra 5: DELETE query must match SELECT (`mandante IS NULL OR mandante = '' OR visitante IS NULL OR visitante = '' OR mandante LIKE '%Estatísticas%' OR visitante LIKE '%Estatísticas%'`).
- In Regra 5: Automatically recalculate `total_gols`, `total_jogos`, `media_gols_por_jogo`, `participacoes_gols`, and `media_participacao_por_jogo` in `jogadores_estatisticas` and `jogadores` for any athletes affected by deleted matches/goals.
- In Regra 11: Update report title to `"Coerência de Atletas: Médias Verossímeis (<= 2.5)"`.

### 2. Resynchronize `jogadores_estatisticas` for the 25 Athletes:
Execute the pushdown CTE update from `/mnt/jogos_f/Antigravity_Projetos_e_Ferramentas/Guia profissional/.agents/teamwork/teamwork_preview_explorer_m1_retry_1/handoff.md`:
```sql
WITH divergent_athletes AS (
    SELECT j.id_jogador
    FROM jogadores_estatisticas j
    LEFT JOIN (
        SELECT id_jogador, COUNT(*) as cnt
        FROM gols
        WHERE id_jogador > 0
        GROUP BY id_jogador
    ) g ON j.id_jogador = g.id_jogador
    WHERE j.total_gols != COALESCE(g.cnt, 0)
),
stats_reais AS (
    SELECT 
        d.id_jogador,
        (SELECT COUNT(*) FROM gols g WHERE g.id_jogador = d.id_jogador) AS novos_gols,
        (
            SELECT COUNT(DISTINCT id_partida)
            FROM (
                SELECT id_partida FROM escalacoes WHERE id_jogador = d.id_jogador
                UNION
                SELECT id_partida FROM gols WHERE id_jogador = d.id_jogador
                UNION
                SELECT id_partida FROM cartoes WHERE id_jogador = d.id_jogador
            )
        ) AS novos_jogos
    FROM divergent_athletes d
)
UPDATE jogadores_estatisticas
SET total_gols = s.novos_gols,
    total_jogos = s.novos_jogos,
    media_gols_por_jogo = ROUND(CAST(s.novos_gols AS REAL) / MAX(s.novos_jogos, 1), 2),
    participacoes_gols = s.novos_gols + COALESCE(jogadores_estatisticas.total_assistencias, 0),
    media_participacao_por_jogo = ROUND(CAST((s.novos_gols + COALESCE(jogadores_estatisticas.total_assistencias, 0)) AS REAL) / MAX(s.novos_jogos, 1), 2)
FROM stats_reais s
WHERE jogadores_estatisticas.id_jogador = s.id_jogador;
```

### 3. Resolve Career Divergence in Serginho (12636) and Flaco López (67):
Execute the queries from `/mnt/jogos_f/Antigravity_Projetos_e_Ferramentas/Guia profissional/.agents/teamwork/teamwork_preview_explorer_m1_retry_2/handoff.md`:
- Serginho: Re-link the 31 lineups from duplicate ID 21287 to ID 12636:
  `UPDATE escalacoes SET id_jogador = 12636 WHERE id_jogador = 21287;`
  Update Serginho in `jogadores_estatisticas`: `total_jogos = 76`, `total_gols = 45`, `media_gols_por_jogo = 0.59`.
- Flaco López: Re-link the 115 lineups from duplicate ID 19997 to ID 67:
  `UPDATE escalacoes SET id_jogador = 67 WHERE id_jogador = 19997;`
  Update Flaco López in `jogadores_estatisticas`: `total_jogos = 127`, `total_gols = 12`, `media_gols_por_jogo = 0.09`, `jogos_carreira_oficiais = 294`, `gols_carreira_oficiais = 102`.

### 4. Run VACUUM & Verification:
- Run `ANALYZE; VACUUM; PRAGMA wal_checkpoint(TRUNCATE);`.
- Verify `os.path.getsize('data/futebol.db') < 94000000`.
- Verify `python scripts/auditar_integridade_dados.py` (12/12 OK).
- Verify `./.venv/bin/pytest tests/test_model_evals.py` (22/22 passed).
- Verify `./.venv/bin/pytest tests/test_e2e_futstats.py -k "test_t1_r1_db_no_forced_jogos_equals_gols_with_divergent_career"` (PASSED with 0 anomalies).
- Verify `./.venv/bin/pytest tests/test_e2e_futstats.py -m "r4"` (9/9 passed).

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Deliver your verified results in `handoff.md` in this directory and notify parent via send_message.

## 2026-10-30T19:40:00Z
Received invocation as Worker M1 Retry (Remediation of M1 Iteration 1 Findings).
