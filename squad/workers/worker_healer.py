from __future__ import annotations

from core.base_worker import BaseWorker
from core.db import write_transaction


class WorkerHealer(BaseWorker):
    def __init__(self, db_path: str | None = None, interval_seconds: float = 300.0):
        super().__init__("worker_healer", interval_seconds=interval_seconds, db_path=db_path)

    def run_cycle(self) -> dict[str, int]:
        report: dict[str, int] = {}
        with write_transaction(self.db_path) as conn:
            cols = [r[1] for r in conn.execute("PRAGMA table_info(partidas)").fetchall()]
            is_production_schema = "id_partida" in cols

            if is_production_schema:
                # Esquema de produção oficial (futebol.db)
                # Regra 1: Gols nulos com placar existente (Auto-reparo)
                report["r01_gols_nulos_placar"] = conn.execute(
                    """
                    UPDATE partidas 
                    SET gols_mandante = CAST(TRIM(SUBSTR(placar, 1, INSTR(placar, 'x') - 1)) AS INTEGER),
                        gols_visitante = CAST(TRIM(SUBSTR(placar, INSTR(placar, 'x') + 1)) AS INTEGER)
                    WHERE (gols_mandante IS NULL OR gols_visitante IS NULL)
                      AND placar IS NOT NULL AND placar LIKE '%x%'
                    """
                ).rowcount

                # Regra 2: Gols negativos -> 0
                report["r02_gols_negativos"] = conn.execute(
                    """
                    UPDATE partidas
                    SET gols_mandante = CASE WHEN gols_mandante < 0 THEN 0 ELSE gols_mandante END,
                        gols_visitante = CASE WHEN gols_visitante < 0 THEN 0 ELSE gols_visitante END
                    WHERE gols_mandante < 0 OR gols_visitante < 0
                    """
                ).rowcount

                # Regra 3: Vencedor inconsistente com placar -> auto-reparo
                report["r03_vencedor_inconsistente"] = conn.execute(
                    """
                    UPDATE partidas 
                    SET vencedor = CASE 
                        WHEN gols_mandante > gols_visitante THEN mandante 
                        WHEN gols_visitante > gols_mandante THEN visitante 
                        ELSE 'Empate' 
                    END
                    WHERE gols_mandante IS NOT NULL AND gols_visitante IS NOT NULL
                      AND (
                        vencedor IS NULL OR vencedor = '' OR
                        (gols_mandante > gols_visitante AND vencedor != mandante) OR
                        (gols_visitante > gols_mandante AND vencedor != visitante) OR
                        (gols_mandante = gols_visitante AND vencedor != 'Empate' AND vencedor != 'empate')
                      )
                    """
                ).rowcount

                tables = [r[0] for r in conn.execute("SELECT name FROM sqlite_master WHERE type='table'").fetchall()]
                if "gols" in tables:
                    report["r04_gols_orfaos"] = conn.execute(
                        "DELETE FROM gols WHERE id_partida NOT IN (SELECT id_partida FROM partidas)"
                    ).rowcount
                if "odds_partidas" in tables:
                    report["r05_odds_orfas"] = conn.execute(
                        "DELETE FROM odds_partidas WHERE id_partida NOT IN (SELECT id_partida FROM partidas)"
                    ).rowcount
                if "metricas_quant" in tables:
                    report["r06_quant_orfas"] = conn.execute(
                        "DELETE FROM metricas_quant WHERE partida_id NOT IN (SELECT id_partida FROM partidas)"
                    ).rowcount
            else:
                # Esquema relacional independente (testes ou nova base)
                # Regra 1: Gols negativos -> normaliza para 0
                report["r01_gols_negativos"] = conn.execute(
                    """
                    UPDATE partidas
                    SET gols_casa = CASE WHEN gols_casa < 0 THEN 0 ELSE gols_casa END,
                        gols_fora = CASE WHEN gols_fora < 0 THEN 0 ELSE gols_fora END
                    WHERE gols_casa < 0 OR gols_fora < 0
                    """
                ).rowcount

                # Regra 2: Partida FINALIZADA sem placar -> REVISAO_PENDENTE
                report["r02_finalizada_sem_placar"] = conn.execute(
                    """
                    UPDATE partidas
                    SET status = 'REVISAO_PENDENTE'
                    WHERE status = 'FINALIZADA' AND (gols_casa IS NULL OR gols_fora IS NULL)
                    """
                ).rowcount

                # Regra 3: Partida AGENDADA no futuro com placar preenchido -> limpa placar
                report["r03_agendada_com_placar"] = conn.execute(
                    """
                    UPDATE partidas
                    SET gols_casa = NULL, gols_fora = NULL
                    WHERE status = 'AGENDADA'
                      AND datetime(data_hora) > datetime('now')
                      AND (gols_casa IS NOT NULL OR gols_fora IS NOT NULL)
                    """
                ).rowcount

                # Regra 4: Mesmo clube mandante e visitante -> INVALIDA
                report["r04_clube_duplicado_partida"] = conn.execute(
                    """
                    UPDATE partidas
                    SET status = 'INVALIDA'
                    WHERE clube_casa_id = clube_fora_id AND status != 'INVALIDA'
                    """
                ).rowcount

                # Regra 5: Clube mandante órfão -> INVALIDA
                report["r05_mandante_orfao"] = conn.execute(
                    """
                    UPDATE partidas
                    SET status = 'INVALIDA'
                    WHERE status != 'INVALIDA'
                      AND NOT EXISTS (SELECT 1 FROM clubes c WHERE c.id = partidas.clube_casa_id)
                    """
                ).rowcount

                # Regra 6: Clube visitante órfão -> INVALIDA
                report["r06_visitante_orfao"] = conn.execute(
                    """
                    UPDATE partidas
                    SET status = 'INVALIDA'
                    WHERE status != 'INVALIDA'
                      AND NOT EXISTS (SELECT 1 FROM clubes c WHERE c.id = partidas.clube_fora_id)
                    """
                ).rowcount

                # Regra 7: Odds fora do intervalo plausível (<= 1.0 ou > 500.0) -> NULL
                report["r07_odds_fora_intervalo"] = conn.execute(
                    """
                    UPDATE partidas
                    SET odd_casa = CASE WHEN odd_casa <= 1.0 OR odd_casa > 500.0 THEN NULL ELSE odd_casa END,
                        odd_empate = CASE WHEN odd_empate <= 1.0 OR odd_empate > 500.0 THEN NULL ELSE odd_empate END,
                        odd_fora = CASE WHEN odd_fora <= 1.0 OR odd_fora > 500.0 THEN NULL ELSE odd_fora END
                    WHERE (odd_casa IS NOT NULL AND (odd_casa <= 1.0 OR odd_casa > 500.0))
                       OR (odd_empate IS NOT NULL AND (odd_empate <= 1.0 OR odd_empate > 500.0))
                       OR (odd_fora IS NOT NULL AND (odd_fora <= 1.0 OR odd_fora > 500.0))
                    """
                ).rowcount

                # Regra 8: Overround absurdo (< 0.90 ou > 1.35) -> odd_valida = 0
                report["r08_overround_invalido"] = conn.execute(
                    """
                    UPDATE partidas
                    SET odd_valida = 0
                    WHERE odd_valida = 1
                      AND odd_casa IS NOT NULL AND odd_empate IS NOT NULL AND odd_fora IS NOT NULL
                      AND (
                          (1.0 / odd_casa + 1.0 / odd_empate + 1.0 / odd_fora) < 0.90
                          OR (1.0 / odd_casa + 1.0 / odd_empate + 1.0 / odd_fora) > 1.35
                      )
                    """
                ).rowcount

                # Regra 9: Partidas duplicadas no mesmo dia -> remove duplicatas mantendo menor id
                report["r09_partidas_duplicadas"] = conn.execute(
                    """
                    DELETE FROM partidas
                    WHERE id NOT IN (
                        SELECT MIN(id)
                        FROM partidas
                        GROUP BY clube_casa_id, clube_fora_id, substr(data_hora, 1, 10)
                    )
                    """
                ).rowcount

                # Regra 10: Status fora do domínio permitido -> REVISAO_PENDENTE
                report["r10_status_desconhecido"] = conn.execute(
                    """
                    UPDATE partidas
                    SET status = 'REVISAO_PENDENTE'
                    WHERE status NOT IN (
                        'AGENDADA', 'AO_VIVO', 'FINALIZADA', 'ADIADA',
                        'CANCELADA', 'REVISAO_PENDENTE', 'INVALIDA'
                    )
                    """
                ).rowcount

                # Regra 11: Partida AO_VIVO travada há > 4 horas -> FINALIZADA ou REVISAO_PENDENTE
                report["r11_ao_vivo_travada"] = conn.execute(
                    """
                    UPDATE partidas
                    SET status = CASE
                        WHEN gols_casa IS NOT NULL AND gols_fora IS NOT NULL THEN 'FINALIZADA'
                        ELSE 'REVISAO_PENDENTE'
                    END
                    WHERE status = 'AO_VIVO'
                      AND datetime(atualizado_em) < datetime('now', '-4 hours')
                    """
                ).rowcount

                # Regra 12: Métricas quant órfãs sem partida correspondente -> DELETE
                report["r12_quant_orfas"] = conn.execute(
                    """
                    DELETE FROM metricas_quant
                    WHERE NOT EXISTS (SELECT 1 FROM partidas p WHERE p.id = metricas_quant.partida_id)
                    """
                ).rowcount

        total_healed = sum(report.values())
        self.logger.info(
            "Auditoria healer concluída",
            extra={"extra_data": {"total_curas": total_healed, "detalhes": report}},
        )
        return report


if __name__ == "__main__":
    WorkerHealer().run_forever()
