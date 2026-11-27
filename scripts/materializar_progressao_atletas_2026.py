# -*- coding: utf-8 -*-
"""
Etapa 1 — Materialização de Métricas Granulares (Progressão, Criação, Duelos e PSxG)
Lê `data/staging/brasileirao_em_dados/metricas_atletas_2026.json` (apenas atletas
elegíveis em produção) e persiste a tabela compacta `metrica_atleta_progressao_2026`
em `data/futebol.db` (~60 KB) para disponibilidade em produção na Vercel.
"""
import json
import os
import sqlite3

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DB_PATH = os.path.join(BASE_DIR, "data", "futebol.db")
STAGING_PATH = os.path.join(BASE_DIR, "data", "staging", "brasileirao_em_dados", "metricas_atletas_2026.json")


def main():
    if not os.path.exists(STAGING_PATH):
        raise FileNotFoundError(f"Arquivo staging não encontrado: {STAGING_PATH}")

    with open(STAGING_PATH, "r", encoding="utf-8") as f:
        raw = json.load(f)

    conn = sqlite3.connect(DB_PATH, timeout=45)
    cur = conn.cursor()

    cur.execute(
        """
        CREATE TABLE IF NOT EXISTS metrica_atleta_progressao_2026 (
            atleta_id_canonico INTEGER PRIMARY KEY,
            conducoes_progressivas REAL DEFAULT 0,
            passes_decisivos REAL DEFAULT 0,
            passes_terco_final REAL DEFAULT 0,
            passes_para_area REAL DEFAULT 0,
            grandes_chances_criadas REAL DEFAULT 0,
            dribles_certos REAL DEFAULT 0,
            dribles_tentados REAL DEFAULT 0,
            recuperacoes REAL DEFAULT 0,
            duelos_aereos_ganhos REAL DEFAULT 0,
            duelos_chao_ganhos REAL DEFAULT 0,
            xg_sofrido_goleiro REAL DEFAULT 0
        );
        """
    )

    cur.execute("DELETE FROM metrica_atleta_progressao_2026;")

    registros = []
    for a in raw:
        if not a.get("elegivel_producao") or not a.get("atleta_id_canonico"):
            continue
        m = a.get("metricas") or {}
        registros.append(
            (
                int(a["atleta_id_canonico"]),
                float(m.get("conducoes_progressivas") or 0),
                float(m.get("passes_decisivos") or 0),
                float(m.get("passes_terco_final") or 0),
                float(m.get("passes_para_area") or 0),
                float(m.get("grandes_chances_criadas") or 0),
                float(m.get("dribles_certos") or 0),
                float(m.get("dribles_tentados") or 0),
                float(m.get("recuperacoes") or 0),
                float(m.get("duelos_aereos_ganhos") or 0),
                float(m.get("duelos_chao_ganhos") or 0),
                float(m.get("xg_sofrido_goleiro") or 0),
            )
        )

    cur.executemany(
        """
        INSERT OR REPLACE INTO metrica_atleta_progressao_2026 (
            atleta_id_canonico, conducoes_progressivas, passes_decisivos,
            passes_terco_final, passes_para_area, grandes_chances_criadas,
            dribles_certos, dribles_tentados, recuperacoes,
            duelos_aereos_ganhos, duelos_chao_ganhos, xg_sofrido_goleiro
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
        """,
        registros,
    )
    conn.commit()
    try:
        cur.execute("PRAGMA wal_checkpoint(TRUNCATE);")
        cur.execute("PRAGMA journal_mode = DELETE;")
    except sqlite3.OperationalError:
        pass
    conn.close()

    size_mb = os.path.getsize(DB_PATH) / (1024 * 1024)
    print(f"Materialização concluída: {len(registros)} atletas em metrica_atleta_progressao_2026 | DB={size_mb:.2f} MiB")


if __name__ == "__main__":
    main()
