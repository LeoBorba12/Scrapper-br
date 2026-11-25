import json
import sys
from pathlib import Path
import pytest

# Garante importação limpa do pacote squad
squad_root = Path(__file__).resolve().parent.parent / "squad"
if str(squad_root) not in sys.path:
    sys.path.insert(0, str(squad_root))

from core.db import init_schema, read_connection, write_transaction
from workers.worker_gap_hunter import (
    ExternalSourceAdapter,
    WorkerGapHunter,
    format_gap_alert_markdown,
)


class MockExternalAdapter(ExternalSourceAdapter):
    def __init__(self, db_path: str, source_name: str, responses: dict):
        super().__init__(db_path=db_path, source_name=source_name, rate_limit_range=(0.0, 0.0))
        self.responses = responses

    def fetch(self, tipo_entidade: str, chave_entidade: str, payload: dict) -> dict:
        data = dict(self.responses.get((tipo_entidade, chave_entidade), {}))
        data["fonte"] = self.source_name
        return data


@pytest.fixture
def temp_db(tmp_path) -> str:
    db_file = str(tmp_path / "futebol_gap_test.db")
    init_schema(db_file)
    with write_transaction(db_file) as conn:
        conn.executemany(
            "INSERT INTO clubes (id, nome, pais) VALUES (?, ?, ?)",
            [(1, "Palmeiras", "Brasil"), (2, "Flamengo", "Brasil")],
        )
        conn.execute(
            """
            INSERT INTO partidas (liga, data_hora, clube_casa_id, clube_fora_id, gols_casa, gols_fora, status)
            VALUES ('Brasileirão Série A', '2025-05-10 16:00:00', 1, 2, 2, 1, 'FINALIZADA')
            """
        )
        conn.execute(
            """
            INSERT INTO jogadores (id, nome, data_nascimento, nacionalidade, total_gols, total_jogos)
            VALUES (10, 'Pedro Guilherme', '1997-06-20', 'Brasil', 120, 230)
            """
        )
    return db_file


def test_queue_consumption_lock_and_release(temp_db: str):
    with write_transaction(temp_db) as conn:
        conn.execute(
            """
            INSERT INTO fila_reconciliacao_entidades (tipo_entidade, chave_entidade, payload_json, prioridade)
            VALUES ('h2h', 'Palmeiras x Flamengo', '{"clube_a_id": 1, "clube_b_id": 2}', 1)
            """
        )

    worker = WorkerGapHunter(db_path=temp_db, adapters=[MockExternalAdapter(temp_db, "RSSSF_BRASIL", {})])
    claimed = worker.claim_next_task()
    assert claimed is not None
    assert claimed["chave_entidade"] == "Palmeiras x Flamengo"

    # Enquanto travada e dentro do TTL, outro claim não deve pegar a mesma tarefa
    assert worker.claim_next_task() is None

    worker.release_task(claimed["id"], "completed")
    with read_connection(temp_db) as conn:
        row = conn.execute(
            "SELECT status, locked_by, lock_expires_at FROM fila_reconciliacao_entidades WHERE id = ?",
            (claimed["id"],),
        ).fetchone()
    assert (row["status"], row["locked_by"], row["lock_expires_at"]) == ("completed", None, None)


def test_h2h_missing_match_detection_and_production_immutability(temp_db: str):
    with write_transaction(temp_db) as conn:
        conn.execute(
            """
            INSERT INTO fila_reconciliacao_entidades (tipo_entidade, chave_entidade, payload_json, prioridade)
            VALUES ('h2h', 'Palmeiras x Flamengo', ?, 1)
            """,
            (json.dumps({"clube_a_id": 1, "clube_b_id": 2}),),
        )

    mock_adapter = MockExternalAdapter(
        temp_db,
        "RSSSF_BRASIL",
        {
            ("h2h", "Palmeiras x Flamengo"): {
                "partidas": [
                    # Já existe no banco interno
                    {
                        "data_partida": "2025-05-10",
                        "casa": "Palmeiras",
                        "fora": "Flamengo",
                        "gols_casa": 2,
                        "gols_fora": 1,
                        "competicao": "Brasileirão Série A",
                    },
                    # Faltante no banco interno -> deve ir para staging
                    {
                        "data_partida": "1999-12-16",
                        "casa": "Flamengo",
                        "fora": "Palmeiras",
                        "gols_casa": 4,
                        "gols_fora": 3,
                        "competicao": "Copa Mercosul",
                    },
                ]
            }
        },
    )

    alerts: list[str] = []
    worker = WorkerGapHunter(
        db_path=temp_db,
        adapters=[mock_adapter],
        notifier=lambda msg: alerts.append(msg) or True,
    )
    result = worker.run_cycle()

    assert result["status"] == "needs_review"
    assert result["summary"]["partidas"] == 1
    assert result["alert_sent"] is True
    assert len(alerts) == 1

    with read_connection(temp_db) as conn:
        prod_count = conn.execute("SELECT COUNT(*) FROM partidas").fetchone()[0]
        staging_rows = conn.execute("SELECT * FROM staging_partidas_descobertas").fetchall()

    # Produção permanece intacta (apenas 1 partida original)
    assert prod_count == 1
    assert len(staging_rows) == 1
    assert staging_rows[0]["data_partida"] == "1999-12-16"
    assert staging_rows[0]["competicao"] == "Copa Mercosul"


def test_athlete_reconciliation_divergent_goals(temp_db: str):
    with write_transaction(temp_db) as conn:
        conn.execute(
            """
            INSERT INTO fila_reconciliacao_entidades (tipo_entidade, chave_entidade, payload_json, prioridade)
            VALUES ('jogador', 'Pedro Guilherme', '{"jogador_id": 10}', 2)
            """
        )

    mock_adapter = MockExternalAdapter(
        temp_db,
        "OGOL",
        {
            ("jogador", "Pedro Guilherme"): {
                "estatisticas": {"total_gols": 124, "total_jogos": 230},
            }
        },
    )

    worker = WorkerGapHunter(
        db_path=temp_db,
        adapters=[mock_adapter],
        notifier=lambda _msg: True,
    )
    result = worker.run_cycle()

    assert result["status"] == "needs_review"
    assert result["summary"]["estatisticas"] == 1

    with read_connection(temp_db) as conn:
        prod_gols = conn.execute("SELECT total_gols FROM jogadores WHERE id = 10").fetchone()[0]
        stg = conn.execute("SELECT * FROM staging_estatisticas_entidade").fetchone()

    assert prod_gols == 120  # Produção imutável
    assert stg["metrica"] == "total_gols"
    assert stg["valor_interno"] == 120.0
    assert stg["valor_externo"] == 124.0
    assert stg["delta"] == 4.0


def test_fingerprint_deduplication_in_staging(temp_db: str):
    payload = json.dumps({"clube_a_id": 1, "clube_b_id": 2})
    with write_transaction(temp_db) as conn:
        conn.executemany(
            """
            INSERT INTO fila_reconciliacao_entidades (tipo_entidade, chave_entidade, payload_json, prioridade)
            VALUES ('h2h', 'Palmeiras x Flamengo', ?, 1)
            """,
            [(payload,), (payload,)],
        )

    mock_adapter = MockExternalAdapter(
        temp_db,
        "RSSSF_BRASIL",
        {
            ("h2h", "Palmeiras x Flamengo"): {
                "partidas": [
                    {
                        "data_partida": "1999-12-16",
                        "casa": "Flamengo",
                        "fora": "Palmeiras",
                        "gols_casa": 4,
                        "gols_fora": 3,
                        "competicao": "Copa Mercosul",
                    }
                ]
            }
        },
    )

    worker = WorkerGapHunter(db_path=temp_db, adapters=[mock_adapter], notifier=lambda _msg: True)
    r1 = worker.run_cycle()
    r2 = worker.run_cycle()

    assert r1["summary"]["partidas"] == 1
    assert r2["summary"]["partidas"] == 0  # Deduplicado via UNIQUE(fingerprint)
    assert r2["status"] == "completed"

    with read_connection(temp_db) as conn:
        total_staging = conn.execute("SELECT COUNT(*) FROM staging_partidas_descobertas").fetchone()[0]
    assert total_staging == 1


def test_telegram_gap_alert_formatting():
    msg = format_gap_alert_markdown(
        tipo_entidade="h2h",
        chave_entidade="Palmeiras x Flamengo",
        fonte="RSSSF_BRASIL",
        summary={"partidas": 2, "estatisticas": 0, "entidades": 0, "periodos": 0},
    )
    assert "*[FutStats Gap Hunter | Auditoria de Quarentena]*" in msg
    assert "`H2H` — Palmeiras x Flamengo" in msg
    assert "Partidas descobertas: *2*" in msg
    assert "Produção preservada" in msg
