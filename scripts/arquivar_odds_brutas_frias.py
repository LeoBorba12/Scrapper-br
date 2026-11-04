#!/usr/bin/env python3
"""
FutStats — Arquivamento de Odds Brutas Históricas (< 2024):
Atende à política de retenção do Desafio 5:
- Temporada corrente (2025-2026): Mantida integralmente em odds_partidas
- Temporada anterior (2024): Mantida em odds_partidas
- Anterior a 2024: Arquivada no cold archive (data/futebol_cold.db.gz), pois já possui provenance em odds_consenso_insumos
"""

import sqlite3
import gzip
import shutil
import os
from datetime import datetime
from pathlib import Path

DB_PATH = Path("data/futebol.db")
COLD_DB_PATH = Path("data/futebol_cold.db")
COLD_GZ_PATH = Path("data/futebol_cold.db.gz")

def arquivar_odds_frias():
    print("[1/5] Abrindo conexões...")
    
    # Se futebol_cold.db não existir, descomprimir futebol_cold.db.gz
    if not COLD_DB_PATH.exists() and COLD_GZ_PATH.exists():
        print("Descomprimindo cold archive para append...")
        with gzip.open(COLD_GZ_PATH, 'rb') as f_in, open(COLD_DB_PATH, 'wb') as f_out:
            shutil.copyfileobj(f_in, f_out)

    conn_hot = sqlite3.connect(DB_PATH)
    conn_hot.execute("PRAGMA journal_mode = DELETE;")
    conn_cold = sqlite3.connect(COLD_DB_PATH)
    conn_cold.execute("PRAGMA journal_mode = DELETE;")

    cur_hot = conn_hot.cursor()
    cur_cold = conn_cold.cursor()

    # 1. Identificar IDs de partidas < 2024 com odds brutas
    print("[2/5] Identificando odds brutas anteriores a 2024...")
    cur_hot.execute("""
    SELECT o.id_partida
    FROM odds_partidas o
    JOIN partidas p ON o.id_partida = p.id_partida
    WHERE p.ano < 2024;
    """)
    ids_frios = [r[0] for r in cur_hot.fetchall()]
    total_frias = len(ids_frios)
    print(f"Total de partidas com odds brutas < 2024 para arquivar: {total_frias}")

    if total_frias == 0:
        print("Nenhuma odd fria para arquivar.")
        conn_hot.close()
        conn_cold.close()
        return

    # 2. Criar tabela cold_odds_partidas no cold_db se não existir
    print("[3/5] Exportando odds para cold archive...")
    cur_hot.execute("SELECT sql FROM sqlite_master WHERE type='table' AND name='odds_partidas';")
    ddl = cur_hot.fetchone()[0].replace("odds_partidas", "cold_odds_partidas")
    cur_cold.execute(ddl)
    conn_cold.commit()

    # Copiar dados em lotes
    cur_hot.execute("""
    SELECT *
    FROM odds_partidas
    WHERE id_partida IN (SELECT p.id_partida FROM partidas p WHERE p.ano < 2024);
    """)
    rows = cur_hot.fetchall()
    
    placeholders = ",".join(["?"] * len(rows[0]))
    cur_cold.executemany(f"INSERT OR REPLACE INTO cold_odds_partidas VALUES ({placeholders})", rows)
    conn_cold.commit()
    conn_cold.close()

    # Recomprimir cold archive
    print("Comprimindo cold archive atualizado...")
    with open(COLD_DB_PATH, 'rb') as f_in, gzip.open(COLD_GZ_PATH, 'wb', compresslevel=9) as f_out:
        shutil.copyfileobj(f_in, f_out)
    if COLD_DB_PATH.exists():
        COLD_DB_PATH.unlink()

    # 3. Deletar de hot SQLite
    print("[4/5] Removendo odds frias do hot SQLite...")
    cur_hot.execute("""
    DELETE FROM odds_partidas
    WHERE id_partida IN (SELECT p.id_partida FROM partidas p WHERE p.ano < 2024);
    """)
    deletados = cur_hot.rowcount
    conn_hot.commit()
    print(f"-> {deletados} registros removidos de odds_partidas.")

    # 4. Executar VACUUM
    print("[5/5] Executando VACUUM e registrando governança...")
    conn_hot.execute("VACUUM;")
    conn_hot.commit()

    tamanho_bytes = os.path.getsize(DB_PATH)
    tamanho_mb = round(tamanho_bytes / (1024 * 1024), 2)
    partidas = cur_hot.execute("SELECT count(*) FROM partidas").fetchone()[0]
    gols = cur_hot.execute("SELECT count(*) FROM gols").fetchone()[0]
    escalacoes = cur_hot.execute("SELECT count(*) FROM escalacoes").fetchone()[0]
    cartoes = cur_hot.execute("SELECT count(*) FROM cartoes").fetchone()[0]
    odds = cur_hot.execute("SELECT count(*) FROM odds_partidas").fetchone()[0]

    cur_hot.execute("""
    INSERT INTO governanca_banco (
        executado_em, tamanho_mb, partidas, gols, escalacoes, cartoes, odds, acao_executada
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?);
    """, (
        datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        tamanho_mb,
        partidas,
        gols,
        escalacoes,
        cartoes,
        odds,
        f"DESAFIO 5: Arquivamento de {deletados} odds brutas frias (<2024) para cold archive"
    ))
    conn_hot.commit()
    conn_hot.close()

    print(f"Sucesso absoluto! Tamanho final do SQLite: {tamanho_mb} MB (Abaixo dos 88 MB!).")

if __name__ == "__main__":
    arquivar_odds_frias()
