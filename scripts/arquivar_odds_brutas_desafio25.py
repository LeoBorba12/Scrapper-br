#!/usr/bin/env python3
"""
FutStats — Desafio 25: Arquivamento de Odds Brutas e Contenção para Meta Saudável de 80 MB.
Transfere odds_consenso_partida (11.007), odds_ingestao_status (9.903) e odds_auditoria_sharp (4.941)
para o Cold Archive compactado (data/futebol_cold.db.gz) e executa VACUUM.
"""

import gzip
import hashlib
import json
import os
import shutil
import sqlite3
import tempfile
from pathlib import Path

DB_PATH = Path("data/futebol.db")
COLD_GZ_PATH = Path("data/futebol_cold.db.gz")
MANIFEST_PATH = Path("data/cold_manifest.json")

def arquivar_odds_brutas():
    print("[1/6] Descomprimindo cold archive para sandbox temporário...")
    with tempfile.NamedTemporaryFile(suffix=".db", delete=False) as tmp_file:
        cold_tmp_path = Path(tmp_file.name)
        with gzip.open(COLD_GZ_PATH, "rb") as gz_in:
            tmp_file.write(gz_in.read())

    cold_conn = sqlite3.connect(cold_tmp_path)
    hot_conn = sqlite3.connect(DB_PATH)

    print("[2/6] Copiando dados de odds brutas para o cold archive...")
    tabelas_para_arquivar = [
        ('odds_ingestao_status', 'cold_odds_ingestao_status'),
        ('odds_consenso_partida', 'cold_odds_consenso_partida'),
        ('odds_auditoria_sharp', 'cold_odds_auditoria_sharp')
    ]

    contagens = {}
    for t_hot, t_cold in tabelas_para_arquivar:
        # Obter schema da tabela hot
        schema = hot_conn.execute(f"SELECT sql FROM sqlite_master WHERE type='table' AND name='{t_hot}';").fetchone()[0]
        schema_cold = schema.replace(f"CREATE TABLE {t_hot}", f"CREATE TABLE IF NOT EXISTS {t_cold}").replace(f"CREATE TABLE \"{t_hot}\"", f"CREATE TABLE IF NOT EXISTS \"{t_cold}\"")
        cold_conn.execute(schema_cold)

        # Copiar linhas
        linhas = hot_conn.execute(f"SELECT * FROM {t_hot};").fetchall()
        col_count = len(hot_conn.execute(f"PRAGMA table_info({t_hot});").fetchall())
        placeholders = ",".join(["?"] * col_count)
        cold_conn.executemany(f"INSERT OR REPLACE INTO {t_cold} VALUES ({placeholders});", linhas)
        contagens[t_cold] = len(linhas)
        print(f" -> {t_hot} -> {t_cold}: {len(linhas)} linhas migradas.")

    cold_conn.commit()
    cold_conn.execute("VACUUM;")
    cold_conn.close()

    print("[3/6] Recomprimindo cold archive com gzip...")
    with open(cold_tmp_path, "rb") as f_in, gzip.open(COLD_GZ_PATH, "wb", compresslevel=9) as f_out:
        shutil.copyfileobj(f_in, f_out)
    os.remove(cold_tmp_path)

    # Recalcular hash do manifesto
    with open(COLD_GZ_PATH, "rb") as f:
        novo_sha = hashlib.sha256(f.read()).hexdigest()
    tamanho_cold = os.path.getsize(COLD_GZ_PATH)

    with open(MANIFEST_PATH, "r", encoding="utf-8") as f:
        manifest = json.load(f)

    manifest["sha256"] = novo_sha
    manifest["tamanho_bytes"] = tamanho_cold
    manifest["schema_version"] = "cold_v4"
    for k, v in contagens.items():
        manifest["tabelas"][k] = v
    manifest["total_registros_arquivados"] = sum(manifest["tabelas"].values())
    manifest["atualizado_em"] = "2026-11-04 20:15:00"

    with open(MANIFEST_PATH, "w", encoding="utf-8") as f:
        json.dump(manifest, f, indent=2, ensure_ascii=False)
    print(f" -> Novo cold manifest salvo (Total: {manifest['total_registros_arquivados']} registros, SHA-256: {novo_sha[:12]}...).")

    print("[4/6] Removendo tabelas arquivadas do banco quente (futebol.db)...")
    for t_hot, _ in tabelas_para_arquivar:
        hot_conn.execute(f"DROP TABLE IF EXISTS {t_hot};")
        print(f" -> DROP TABLE {t_hot} executado.")

    print("[5/6] Executando VACUUM e otimização no futebol.db...")
    hot_conn.execute("PRAGMA journal_mode = DELETE;")
    hot_conn.execute("VACUUM;")
    hot_conn.execute("PRAGMA optimize;")
    hot_conn.close()

    size_mb = os.path.getsize(DB_PATH) / (1024 * 1024)
    print(f"[6/6] SUCESSO! Novo tamanho do futebol.db: {size_mb:.2f} MB")

if __name__ == '__main__':
    arquivar_odds_brutas()
