import concurrent.futures
import sys
from datetime import datetime
from pathlib import Path
from zoneinfo import ZoneInfo

import pytest

# Garante importação limpa do pacote squad
squad_root = Path(__file__).resolve().parent.parent / "squad"
if str(squad_root) not in sys.path:
    sys.path.insert(0, str(squad_root))

from core.db import init_schema, read_connection, write_transaction
from workers.worker_agenda_transmissoes import (
    WorkerAgendaTransmissoes,
    format_agenda_markdown,
)
from workers.worker_guardiao import WorkerGuardiao
from workers.worker_healer import WorkerHealer
from workers.worker_quant import WorkerQuant, compute_dixon_coles_probs
from workers.worker_sniper import WorkerSniper


@pytest.fixture
def temp_db(tmp_path) -> str:
    db_file = str(tmp_path / "futebol_test.db")
    init_schema(db_file)
    with write_transaction(db_file) as conn:
        conn.executemany(
            "INSERT INTO clubes (id, nome, pais, forca_ataque, forca_defesa) VALUES (?, ?, ?, ?, ?)",
            [
                (1, "Flamengo", "Brasil", 1.35, 0.85),
                (2, "Palmeiras", "Brasil", 1.30, 0.80),
                (3, "Real Madrid", "Espanha", 1.50, 0.75),
                (4, "Barcelona", "Espanha", 1.40, 0.85),
            ],
        )
    return db_file


def test_sqlite_wal_concurrency_and_lock_handling(temp_db: str):
    """Simula 10 escritores concorrentes e 10 leitores simultâneos sem SQLITE_BUSY fatal."""
    def writer_task(idx: int) -> int:
        with write_transaction(temp_db) as conn:
            conn.execute(
                """
                INSERT INTO partidas (liga, data_hora, clube_casa_id, clube_fora_id, status)
                VALUES ('Brasileirão Série A', ?, 1, 2, 'AGENDADA')
                """,
                (f"2026-11-{(idx % 28) + 1:02d} 20:00:00",),
            )
        return 1

    def reader_task() -> int:
        with read_connection(temp_db) as conn:
            mode = conn.execute("PRAGMA journal_mode;").fetchone()[0]
            assert mode.lower() == "wal"
            return conn.execute("SELECT COUNT(*) FROM partidas").fetchone()[0]

    with concurrent.futures.ThreadPoolExecutor(max_workers=12) as pool:
        write_futures = [pool.submit(writer_task, i) for i in range(10)]
        read_futures = [pool.submit(reader_task) for _ in range(10)]
        assert sum(f.result() for f in write_futures) == 10
        for rf in read_futures:
            assert rf.result() >= 0

    with read_connection(temp_db) as conn:
        total = conn.execute("SELECT COUNT(*) FROM partidas").fetchone()[0]
    assert total == 10


def test_worker_sniper_updates_live_matches(temp_db: str):
    with write_transaction(temp_db) as conn:
        conn.execute(
            """
            INSERT INTO partidas (id, liga, data_hora, clube_casa_id, clube_fora_id, status)
            VALUES (100, 'Brasileirão Série A', datetime('now', '-30 minutes'), 1, 2, 'AO_VIVO')
            """
        )

    def mock_feed(match_ids: list[int]):
        assert 100 in match_ids
        return [
            {
                "id": 100,
                "gols_casa": 2,
                "gols_fora": 1,
                "status": "FINALIZADA",
                "odd_casa": 1.95,
                "odd_empate": 3.40,
                "odd_fora": 3.80,
            }
        ]

    sniper = WorkerSniper(db_path=temp_db, feed_fetcher=mock_feed)
    assert sniper.run_cycle() == 1

    with read_connection(temp_db) as conn:
        row = conn.execute("SELECT gols_casa, gols_fora, status, quant_processado FROM partidas WHERE id=100").fetchone()
    assert (row["gols_casa"], row["gols_fora"], row["status"], row["quant_processado"]) == (2, 1, "FINALIZADA", 0)


def test_worker_healer_all_12_rules(temp_db: str):
    with write_transaction(temp_db) as conn:
        # R1: gols negativos
        conn.execute(
            "INSERT INTO partidas (id, liga, data_hora, clube_casa_id, clube_fora_id, gols_casa, gols_fora, status) "
            "VALUES (1, 'Brasileirão Série A', '2026-10-01 20:00:00', 1, 2, -2, 1, 'FINALIZADA')"
        )
        # R2: finalizada sem placar
        conn.execute(
            "INSERT INTO partidas (id, liga, data_hora, clube_casa_id, clube_fora_id, status) "
            "VALUES (2, 'Brasileirão Série A', '2026-10-02 20:00:00', 1, 2, 'FINALIZADA')"
        )
        # R3: agendada no futuro com placar
        conn.execute(
            "INSERT INTO partidas (id, liga, data_hora, clube_casa_id, clube_fora_id, gols_casa, gols_fora, status) "
            "VALUES (3, 'Brasileirão Série A', '2099-01-01 20:00:00', 1, 2, 1, 0, 'AGENDADA')"
        )
        # R4: mesmo clube casa e fora
        conn.execute(
            "INSERT INTO partidas (id, liga, data_hora, clube_casa_id, clube_fora_id, status) "
            "VALUES (4, 'Brasileirão Série A', '2026-10-04 20:00:00', 1, 1, 'AGENDADA')"
        )
        # R5 & R6: clubes órfãos
        conn.execute(
            "INSERT INTO partidas (id, liga, data_hora, clube_casa_id, clube_fora_id, status) "
            "VALUES (5, 'Brasileirão Série A', '2026-10-05 20:00:00', 999, 2, 'AGENDADA')"
        )
        conn.execute(
            "INSERT INTO partidas (id, liga, data_hora, clube_casa_id, clube_fora_id, status) "
            "VALUES (6, 'Brasileirão Série A', '2026-10-06 20:00:00', 1, 888, 'AGENDADA')"
        )
        # R7: odd fora do intervalo
        conn.execute(
            "INSERT INTO partidas (id, liga, data_hora, clube_casa_id, clube_fora_id, status, odd_casa) "
            "VALUES (7, 'Brasileirão Série A', '2026-10-07 20:00:00', 1, 2, 'AGENDADA', 0.90)"
        )
        # R8: overround absurdo (> 1.35)
        conn.execute(
            "INSERT INTO partidas (id, liga, data_hora, clube_casa_id, clube_fora_id, status, odd_casa, odd_empate, odd_fora) "
            "VALUES (8, 'Brasileirão Série A', '2026-10-08 20:00:00', 1, 2, 'AGENDADA', 1.2, 1.2, 1.2)"
        )
        # R9: duplicata no mesmo dia (mesmo par de clubes e data da partida 1)
        conn.execute(
            "INSERT INTO partidas (id, liga, data_hora, clube_casa_id, clube_fora_id, gols_casa, gols_fora, status) "
            "VALUES (9, 'Brasileirão Série A', '2026-10-01 21:00:00', 1, 2, 0, 0, 'FINALIZADA')"
        )
        # R10: status desconhecido
        conn.execute(
            "INSERT INTO partidas (id, liga, data_hora, clube_casa_id, clube_fora_id, status) "
            "VALUES (10, 'Brasileirão Série A', '2026-10-10 20:00:00', 1, 2, 'BUGADO')"
        )
        # R11: AO_VIVO travada há > 4 horas
        conn.execute(
            "INSERT INTO partidas (id, liga, data_hora, clube_casa_id, clube_fora_id, gols_casa, gols_fora, status, atualizado_em) "
            "VALUES (11, 'Brasileirão Série A', '2026-10-11 20:00:00', 1, 2, 1, 1, 'AO_VIVO', datetime('now', '-6 hours'))"
        )
        # R12: métrica quant órfã
        conn.execute(
            "INSERT INTO metricas_quant (partida_id, xg_casa, xg_fora, prob_casa, prob_empate, prob_fora, rho_dixon_coles) "
            "VALUES (9999, 1.5, 1.2, 0.45, 0.25, 0.30, -0.08)"
        )

    report = WorkerHealer(db_path=temp_db).run_cycle()
    for rule_name, count in report.items():
        assert count >= 1, f"Regra {rule_name} não detectou anomalia esperada"


def test_worker_quant_dixon_coles_calibration(temp_db: str):
    p_h, p_d, p_a = compute_dixon_coles_probs(1.6, 1.1)
    assert abs((p_h + p_d + p_a) - 1.0) < 1e-4

    with write_transaction(temp_db) as conn:
        conn.execute(
            "INSERT INTO partidas (id, liga, data_hora, clube_casa_id, clube_fora_id, status) "
            "VALUES (200, 'La Liga', '2026-11-20 17:00:00', 3, 4, 'AGENDADA')"
        )

    processed = WorkerQuant(db_path=temp_db).run_cycle()
    assert processed == 1

    with read_connection(temp_db) as conn:
        q = conn.execute("SELECT * FROM metricas_quant WHERE partida_id=200").fetchone()
    assert q is not None
    assert abs((q["prob_casa"] + q["prob_empate"] + q["prob_fora"]) - 1.0) < 1e-4


def test_worker_guardiao_triggers_vacuum_and_alert(temp_db: str):
    alerts: list[str] = []
    guardiao = WorkerGuardiao(
        db_path=temp_db,
        soft_limit_mb=0.0001,  # Força disparo do soft limit no banco de teste
        hard_limit_mb=94.0,
        notifier=lambda msg: alerts.append(msg) or True,
    )
    result = guardiao.run_cycle()
    assert result["vacuum_executado"] is True
    assert result["alerta_enviado"] is True
    assert len(alerts) == 1
    assert "VACUUM seguro executado" in alerts[0]


def test_worker_agenda_transmissoes_formatting_and_dispatch(temp_db: str):
    with write_transaction(temp_db) as conn:
        conn.execute(
            "INSERT INTO partidas (liga, data_hora, clube_casa_id, clube_fora_id, status) "
            "VALUES ('Brasileirão Série A', '2026-11-20 20:00:00', 1, 2, 'AGENDADA')"
        )
        conn.execute(
            "INSERT INTO partidas (liga, data_hora, clube_casa_id, clube_fora_id, status) "
            "VALUES ('La Liga', '2026-11-20 17:00:00', 3, 4, 'AGENDADA')"
        )

    sent_cards: list[str] = []
    agenda = WorkerAgendaTransmissoes(
        db_path=temp_db,
        notifier=lambda msg: sent_cards.append(msg) or True,
    )
    card, sent = agenda.dispatch_for_date(datetime(2026, 11, 20, 8, 0, tzinfo=ZoneInfo("America/Sao_Paulo")))
    assert sent is True
    assert "Flamengo x Palmeiras" in card
    assert "Globo / SporTV / Premiere / CazéTV" in card
    assert "Real Madrid x Barcelona" in card
    assert "ESPN / Disney+" in card
    assert len(sent_cards) == 1

    # Idempotência: segunda execução na mesma data não deve reenviar
    card2, sent2 = agenda.dispatch_for_date(datetime(2026, 11, 20, 8, 0, tzinfo=ZoneInfo("America/Sao_Paulo")))
    assert sent2 is False
    assert len(sent_cards) == 1

    empty_card = format_agenda_markdown("21/11/2026", [])
    assert "Nenhum jogo das ligas monitoradas" in empty_card


def test_workers_dual_schema_production_compatibility(tmp_path):
    """Garante que os workers executam sem exceções no esquema oficial de produção (futebol.db)."""
    db_file = str(tmp_path / "futebol_prod_test.db")
    with write_transaction(db_file) as conn:
        conn.execute(
            """
            CREATE TABLE partidas (
                id_partida INTEGER PRIMARY KEY AUTOINCREMENT,
                ano INTEGER,
                rodada INTEGER,
                data TEXT,
                horario TEXT,
                estadio TEXT,
                cidade TEXT,
                estado TEXT,
                mandante TEXT,
                visitante TEXT,
                gols_mandante INTEGER,
                gols_visitante INTEGER,
                placar TEXT,
                vencedor TEXT,
                campeonato TEXT
            );
            """
        )
        conn.execute(
            """
            INSERT INTO partidas (id_partida, data, horario, mandante, visitante, gols_mandante, gols_visitante, placar, vencedor, campeonato)
            VALUES (1, strftime('%Y-%m-%d', 'now'), '16:00', 'Flamengo', 'Palmeiras', NULL, NULL, '2x1', NULL, 'Brasileirão Série A');
            """
        )

    # 1. BaseWorker assegura bootstrap de tabelas de governança
    guardiao = WorkerGuardiao(db_path=db_file)
    res_g = guardiao.run_cycle()
    assert "tamanho_mb" in res_g

    # 2. Healer repara gols e vencedor a partir do placar
    healer = WorkerHealer(db_path=db_file)
    res_h = healer.run_cycle()
    assert res_h.get("r01_gols_nulos_placar") == 1
    assert res_h.get("r03_vencedor_inconsistente") == 1

    # 3. Quant calcula Dixon-Coles sem tabela 'clubes' ou 'quant_processado'
    quant = WorkerQuant(db_path=db_file)
    assert quant.run_cycle() >= 1

    # 4. Sniper atualiza dados via esquema oficial
    def mock_feed(ids):
        return [{"id": 1, "gols_casa": 3, "gols_fora": 1, "status": "FINALIZADA"}]

    sniper = WorkerSniper(db_path=db_file, feed_fetcher=mock_feed)
    assert sniper.run_cycle() == 1

    with read_connection(db_file) as conn:
        p = conn.execute("SELECT gols_mandante, gols_visitante, placar FROM partidas WHERE id_partida=1").fetchone()
        assert p["gols_mandante"] == 3
        assert p["gols_visitante"] == 1
        assert p["placar"] == "3x1"
