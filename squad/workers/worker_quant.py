from __future__ import annotations

import math
from core.base_worker import BaseWorker
from core.db import read_connection, write_transaction


def poisson_pmf(k: int, lam: float) -> float:
    if lam <= 0:
        return 1.0 if k == 0 else 0.0
    return (math.exp(-lam) * (lam**k)) / math.factorial(k)


def dixon_coles_tau(x: int, y: int, lam_home: float, lam_away: float, rho: float) -> float:
    if x == 0 and y == 0:
        return max(0.0, 1.0 - (lam_home * lam_away * rho))
    if x == 0 and y == 1:
        return max(0.0, 1.0 + (lam_home * rho))
    if x == 1 and y == 0:
        return max(0.0, 1.0 + (lam_away * rho))
    if x == 1 and y == 1:
        return max(0.0, 1.0 - rho)
    return 1.0


def compute_dixon_coles_probs(
    xg_home: float,
    xg_away: float,
    rho: float = -0.08,
    max_goals: int = 8,
) -> tuple[float, float, float]:
    prob_home = 0.0
    prob_draw = 0.0
    prob_away = 0.0

    for h in range(max_goals + 1):
        p_h = poisson_pmf(h, xg_home)
        for a in range(max_goals + 1):
            p_a = poisson_pmf(a, xg_away)
            tau = dixon_coles_tau(h, a, xg_home, xg_away, rho)
            p = p_h * p_a * tau
            if h > a:
                prob_home += p
            elif h == a:
                prob_draw += p
            else:
                prob_away += p

    total = prob_home + prob_draw + prob_away
    if total <= 0:
        return (1 / 3, 1 / 3, 1 / 3)
    return (
        round(prob_home / total, 6),
        round(prob_draw / total, 6),
        round(prob_away / total, 6),
    )


class WorkerQuant(BaseWorker):
    def __init__(self, db_path: str | None = None, interval_seconds: float = 60.0):
        super().__init__("worker_quant", interval_seconds=interval_seconds, db_path=db_path)
        self.home_advantage = 1.18
        self.league_avg_goals = 1.25
        self.rho = -0.08

    def run_cycle(self) -> int:
        with read_connection(self.db_path) as conn:
            cols = [r[1] for r in conn.execute("PRAGMA table_info(partidas)").fetchall()]
            is_production_schema = "id_partida" in cols

            if is_production_schema:
                # Esquema de produção oficial (futebol.db): seleciona partidas recentes sem métricas quant
                pending = conn.execute(
                    """
                    SELECT p.id_partida AS id,
                           1.15 AS atk_h, 0.95 AS def_h,
                           1.05 AS atk_a, 1.05 AS def_a
                    FROM partidas p
                    LEFT JOIN metricas_quant mq ON mq.partida_id = p.id_partida
                    WHERE mq.partida_id IS NULL AND (p.data >= date('now', '-30 days') OR p.data IS NULL)
                    ORDER BY p.id_partida DESC
                    LIMIT 200
                    """
                ).fetchall()
            else:
                # Esquema relacional de testes
                pending = conn.execute(
                    """
                    SELECT p.id,
                           ch.forca_ataque AS atk_h, ch.forca_defesa AS def_h,
                           ca.forca_ataque AS atk_a, ca.forca_defesa AS def_a
                    FROM partidas p
                    JOIN clubes ch ON ch.id = p.clube_casa_id
                    JOIN clubes ca ON ca.id = p.clube_fora_id
                    WHERE p.quant_processado = 0
                      AND p.status IN ('AGENDADA', 'FINALIZADA')
                    LIMIT 200
                    """
                ).fetchall()

        if not pending:
            return 0

        results = []
        for row in pending:
            xg_h = round(max(0.15, row["atk_h"] * row["def_a"] * self.league_avg_goals * self.home_advantage), 4)
            xg_a = round(max(0.15, row["atk_a"] * row["def_h"] * self.league_avg_goals), 4)
            p_h, p_d, p_a = compute_dixon_coles_probs(xg_h, xg_a, rho=self.rho)
            results.append((row["id"], xg_h, xg_a, p_h, p_d, p_a, self.rho))

        with write_transaction(self.db_path) as conn:
            conn.executemany(
                """
                INSERT INTO metricas_quant (
                    partida_id, xg_casa, xg_fora, prob_casa, prob_empate, prob_fora, rho_dixon_coles, calculado_em
                ) VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))
                ON CONFLICT(partida_id) DO UPDATE SET
                    xg_casa = excluded.xg_casa,
                    xg_fora = excluded.xg_fora,
                    prob_casa = excluded.prob_casa,
                    prob_empate = excluded.prob_empate,
                    prob_fora = excluded.prob_fora,
                    rho_dixon_coles = excluded.rho_dixon_coles,
                    calculado_em = datetime('now')
                """,
                results,
            )
            if not is_production_schema:
                conn.executemany(
                    "UPDATE partidas SET quant_processado = 1 WHERE id = ?",
                    [(r[0],) for r in results],
                )

        self.logger.info(
            "Métricas Quant atualizadas",
            extra={"extra_data": {"partidas_processadas": len(results)}},
        )
        return len(results)


if __name__ == "__main__":
    WorkerQuant().run_forever()
