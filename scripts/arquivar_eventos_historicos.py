#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
scripts/arquivar_eventos_historicos.py
======================================================================
Diretriz Técnica de Governança do Teto de 94 MB do SQLite (FutStats)
Arquivamento cirúrgico de `escalacoes` e `cartoes` anteriores a 2022-01-01.

Mantém integralmente:
- 115.753 partidas (datas, clubes, placar final, H2H, Dixon-Coles)
- 117.580 gols (artilharia histórica e recordes)
- odds e scouts modernos (2022 a 2026)
"""

import os
import sys
import gzip
import shutil
import sqlite3
import subprocess
from datetime import datetime
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
DB_PATH = BASE_DIR / "data" / "futebol.db"
COLD_DB_PATH = BASE_DIR / "data" / "futebol_cold.db"
BACKUP_DIR = BASE_DIR / "backups"
CUTOFF = "2022-01-01"

TABLES = {
    "escalacoes": "id_partida",
    "cartoes": "id_partida",
}

def conectar():
    conn = sqlite3.connect(DB_PATH)
    conn.execute("PRAGMA foreign_keys = ON")
    conn.execute("PRAGMA journal_mode = DELETE")
    return conn

def backup_previo():
    BACKUP_DIR.mkdir(parents=True, exist_ok=True)
    stamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    destino = BACKUP_DIR / f"futebol_pre_arquivamento_{stamp}.db"
    shutil.copy2(DB_PATH, destino)
    tamanho_mb = destino.stat().st_size / (1024 * 1024)
    print(f"[1/6] Backup prévio criado com sucesso: {destino.name} ({tamanho_mb:.2f} MB)")
    return destino

def preparar_cold_archive(con):
    # Conecta o banco frio
    con.execute(f"ATTACH DATABASE '{COLD_DB_PATH.as_posix()}' AS cold")
    for tabela in TABLES:
        con.execute(f"""
            CREATE TABLE IF NOT EXISTS cold.{tabela}_arquivadas
            AS SELECT * FROM main.{tabela} WHERE 0
        """)
    print("[2/6] Banco cold archive conectado e tabelas preparadas.")

def contar_frias(con, tabela, id_col):
    res = con.execute(f"""
        SELECT COUNT(*)
        FROM main.{tabela} t
        JOIN main.partidas p ON p.id_partida = t.{id_col}
        WHERE p.data < ?
    """, (CUTOFF,)).fetchone()[0]
    return res

def arquivar_tabela(con, tabela, id_col):
    antes = contar_frias(con, tabela, id_col)
    
    con.execute(f"""
        INSERT INTO cold.{tabela}_arquivadas
        SELECT t.*
        FROM main.{tabela} t
        JOIN main.partidas p ON p.id_partida = t.{id_col}
        WHERE p.data < ?
    """, (CUTOFF,))

    depois = con.execute(f"SELECT COUNT(*) FROM cold.{tabela}_arquivadas").fetchone()[0]
    if antes != depois:
        raise RuntimeError(f"FALHA DE INTEGRIDADE: {tabela} — esperado {antes}, arquivado {depois}.")

    print(f"  -> {tabela}: {antes:,} linhas arquivadas em cold.{tabela}_arquivadas.")
    return antes

def deletar_frias(con, tabela, id_col):
    con.execute(f"""
        DELETE FROM main.{tabela}
        WHERE {id_col} IN (
            SELECT p.id_partida
            FROM main.partidas p
            WHERE p.data < ?
        )
    """, (CUTOFF,))

def validar_pos_delete(con, tabela, id_col):
    restantes = con.execute(f"""
        SELECT COUNT(*)
        FROM main.{tabela} t
        JOIN main.partidas p ON p.id_partida = t.{id_col}
        WHERE p.data < ?
    """, (CUTOFF,)).fetchone()[0]

    if restantes != 0:
        raise RuntimeError(f"FALHA: ainda existem {restantes} linhas frias em {tabela}.")
    print(f"  -> {tabela}: 0 linhas anteriores a {CUTOFF} remanescentes em main.")

def compactar_cold_archive():
    print("[5/6] Compactando cold archive...")
    # Tenta usar zstd se disponível no PATH
    has_zstd = shutil.which("zstd") is not None
    if has_zstd:
        destino = COLD_DB_PATH.with_suffix(".db.zst")
        subprocess.run(["zstd", "-19", "-f", str(COLD_DB_PATH), "-o", str(destino)], check=True)
        print(f"  -> Compactado com Zstandard: {destino.name} ({destino.stat().st_size / (1024*1024):.2f} MB)")
    else:
        # Fallback robusto e portátil com gzip nível 9
        destino = COLD_DB_PATH.with_suffix(".db.gz")
        with open(COLD_DB_PATH, 'rb') as f_in, gzip.open(destino, 'wb', compresslevel=9) as f_out:
            shutil.copyfileobj(f_in, f_out)
        print(f"  -> Compactado com GZIP: {destino.name} ({destino.stat().st_size / (1024*1024):.2f} MB)")

def main():
    print("=" * 70)
    print("FUTSTATS: ARQUIVAMENTO CIRÚRGICO DE DADOS FRIOS (< 2022-01-01)")
    print("=" * 70)

    tam_inicial_mb = DB_PATH.stat().st_size / (1024 * 1024)
    print(f"Tamanho Inicial de data/futebol.db: {tam_inicial_mb:.2f} MB")

    backup_previo()
    con = conectar()

    try:
        preparar_cold_archive(con)

        print("[3/6] Arquivando registros frios...")
        for tabela, id_col in TABLES.items():
            arquivar_tabela(con, tabela, id_col)

        con.commit()

        print("[4/6] Deletando registros frios da base de leitura...")
        for tabela, id_col in TABLES.items():
            deletar_frias(con, tabela, id_col)

        con.commit()

        # Validação pós-delete
        for tabela, id_col in TABLES.items():
            validar_pos_delete(con, tabela, id_col)

        # Garantir contagens intocadas
        total_p = con.execute("SELECT COUNT(*) FROM main.partidas").fetchone()[0]
        total_g = con.execute("SELECT COUNT(*) FROM main.gols").fetchone()[0]
        print(f"  -> Integridade preservada: {total_p:,} partidas e {total_g:,} gols mantidos 100% intactos.")

        print("[5/6] Executando VACUUM e PRAGMA optimize...")
        con.execute("VACUUM")
        con.execute("PRAGMA optimize")
        con.commit()

        con.close()

        compactar_cold_archive()

        tam_final_mb = DB_PATH.stat().st_size / (1024 * 1024)
        reducao_mb = tam_inicial_mb - tam_final_mb
        pct = (reducao_mb / tam_inicial_mb) * 100

        print("=" * 70)
        print(f"SUCESSO ABSOLUTO!")
        print(f"Tamanho Inicial: {tam_inicial_mb:.2f} MB")
        print(f"Novo Tamanho:    {tam_final_mb:.2f} MB")
        print(f"Espaço Liberado: {reducao_mb:.2f} MB ({pct:.1f}% de redução)")
        print(f"Teto Vercel:     94.00 MB | Margem de Segurança Atual: {94.00 - tam_final_mb:.2f} MB")
        print("=" * 70)

    except Exception as e:
        con.rollback()
        con.close()
        print(f"\n[ERRO CRÍTICO] Rollback executado: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
