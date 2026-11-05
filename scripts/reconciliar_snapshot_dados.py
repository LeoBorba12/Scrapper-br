#!/usr/bin/env python3
"""
FutStats — Reconciliação histórica e versionamento de dados.

Objetivo:
- Explicar a diferença de 1.616 partidas entre snapshots.
- Validar contagens canônicas de partidas, gols e auditoria.
- Gerar snapshot versionado em data/snapshot_dados.json.
- Detectar possíveis colisões legítimas na constraint única de gols.
"""

import json
import sqlite3
from datetime import datetime, timezone
from pathlib import Path

DB = Path("data/futebol.db")
SNAPSHOT = Path("data/snapshot_dados.json")

SNAPSHOT_ANTERIOR = {
    "partidas": 115753,
    "gols": 117580,
}


def conectar():
    con = sqlite3.connect(DB)
    con.row_factory = sqlite3.Row
    con.execute("PRAGMA journal_mode = DELETE")
    return con


def contar(con, sql):
    return con.execute(sql).fetchone()[0]


def gerar_snapshot(con):
    partidas = contar(con, "SELECT COUNT(*) FROM partidas")
    gols = contar(con, "SELECT COUNT(*) FROM gols")
    partidas_com_gols = contar(
        con, "SELECT COUNT(DISTINCT partida_id) FROM gols"
    )
    escalacoes = contar(con, "SELECT COUNT(*) FROM escalacoes")
    cartoes = contar(con, "SELECT COUNT(*) FROM cartoes")

    auditoria = {}
    try:
        rows = con.execute(
            """
            SELECT status, COUNT(*) AS total
            FROM gols_auditoria
            GROUP BY status
            """
        ).fetchall()
        auditoria = {row["status"]: row["total"] for row in rows}
    except sqlite3.OperationalError:
        auditoria = {"erro": "tabela gols_auditoria indisponível"}

    return {
        "versao_dados": "futstats_dados_"
        + datetime.now(timezone.utc).strftime("%Y%m%d_%H%M%S"),
        "gerado_em": datetime.now(timezone.utc).isoformat(),
        "partidas": partidas,
        "gols": gols,
        "partidas_com_gols": partidas_com_gols,
        "escalacoes": escalacoes,
        "cartoes": cartoes,
        "auditoria_gols": auditoria,
        "snapshot_anterior": SNAPSHOT_ANTERIOR,
        "diferenca_partidas": partidas - SNAPSHOT_ANTERIOR["partidas"],
        "diferenca_gols": gols - SNAPSHOT_ANTERIOR["gols"],
    }


def auditar_colisoes_potenciais(con):
    """Identifica possíveis gols legítimos que poderiam colidir na constraint."""
    return con.execute(
        """
        SELECT
            partida_id,
            atleta_id,
            clube_id,
            minuto,
            tempo,
            tipo_de_gol,
            COUNT(*) AS ocorrencias
        FROM gols
        GROUP BY
            partida_id,
            atleta_id,
            clube_id,
            minuto,
            tempo,
            tipo_de_gol
        HAVING COUNT(*) > 1
        ORDER BY ocorrencias DESC
        LIMIT 100
        """
    ).fetchall()


def main():
    if not DB.exists():
        raise FileNotFoundError(f"Banco não encontrado: {DB}")

    con = conectar()

    try:
        snapshot = gerar_snapshot(con)
        colisoes = auditar_colisoes_potenciais(con)

        snapshot["colisoes_potenciais_constraint"] = len(colisoes)
        snapshot["colisoes_exemplos"] = [dict(row) for row in colisoes[:10]]

        SNAPSHOT.parent.mkdir(parents=True, exist_ok=True)
        SNAPSHOT.write_text(
            json.dumps(snapshot, indent=2, ensure_ascii=False),
            encoding="utf-8",
        )

        print(json.dumps(snapshot, indent=2, ensure_ascii=False))
        print(f"\nSnapshot salvo em: {SNAPSHOT}")

    finally:
        con.close()


if __name__ == "__main__":
    main()
