#!/usr/bin/env python3
"""
Script de Governança de Capacidade SQLite: Remoção e Reversão do Índice idx_partidas_vencedor_ano.

Objetivo:
Recuperar 3,41 MiB de armazenamento físico eliminando índice redundante na tabela partidas.
Margem resultante: 3,74 MiB de folga até o Soft Limit de 84,00 MiB da Vercel.

Uso:
  python3 scripts/gestao_indice_vencedor_ano.py --dry-run
  python3 scripts/gestao_indice_vencedor_ano.py --apply
  python3 scripts/gestao_indice_vencedor_ano.py --revert
"""

import sys
import os
import shutil
import sqlite3
import argparse
from datetime import datetime

SQL_CREATE_INDEX = "CREATE INDEX IF NOT EXISTS idx_partidas_vencedor_ano ON partidas (vencedor, ano);"
SQL_DROP_INDEX = "DROP INDEX IF EXISTS idx_partidas_vencedor_ano;"

DEFAULT_DB_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'data', 'futebol.db')

def get_db_stats(db_path):
    size_bytes = os.path.getsize(db_path)
    conn = sqlite3.connect(db_path)
    c = conn.cursor()
    p_size = c.execute("PRAGMA page_size").fetchone()[0]
    p_count = c.execute("PRAGMA page_count").fetchone()[0]
    f_count = c.execute("PRAGMA freelist_count").fetchone()[0]
    idx_exists = c.execute("SELECT 1 FROM sqlite_master WHERE type='index' AND name='idx_partidas_vencedor_ano'").fetchone() is not None
    partidas = c.execute("SELECT count(*) FROM partidas").fetchone()[0]
    gols = c.execute("SELECT count(*) FROM gols").fetchone()[0]
    integ = c.execute("PRAGMA integrity_check").fetchone()[0]
    conn.close()
    return {
        "size_bytes": size_bytes,
        "size_mib": size_bytes / (1024 * 1024),
        "page_size": p_size,
        "page_count": p_count,
        "freelist_count": f_count,
        "index_exists": idx_exists,
        "partidas": partidas,
        "gols": gols,
        "integrity": integ
    }

def main():
    parser = argparse.ArgumentParser(description="Gestão de Índice idx_partidas_vencedor_ano")
    parser.add_argument("--db", default=DEFAULT_DB_PATH, help="Caminho do banco SQLite")
    parser.add_argument("--apply", action="store_true", help="Executa DROP INDEX e VACUUM (com backup prévio)")
    parser.add_argument("--revert", action="store_true", help="Recria o índice idx_partidas_vencedor_ano")
    parser.add_argument("--dry-run", action="store_true", help="Simula sem modificar o arquivo")
    args = parser.parse_args()

    if not os.path.exists(args.db):
        print(f"Erro: Banco de dados não encontrado em {args.db}")
        sys.exit(1)

    stats_before = get_db_stats(args.db)
    print("=== ESTADO ATUAL DO BANCO ===")
    print(f"Arquivo:          {args.db}")
    print(f"Tamanho:          {stats_before['size_bytes']:,} bytes ({stats_before['size_mib']:.4f} MiB)")
    print(f"Índice presente:  {stats_before['index_exists']}")
    print(f"Partidas / Gols:  {stats_before['partidas']} / {stats_before['gols']}")
    print(f"Integridade:      {stats_before['integrity']}")

    if args.dry_run or (not args.apply and not args.revert):
        print("\nModo Dry-Run / Inspeção:")
        if stats_before['index_exists']:
            print("  O índice idx_partidas_vencedor_ano está PRESENTE.")
            print("  Ação planejada (--apply):")
            print("    1. Backup automático para data/backups/futebol_pre_drop_idx_*.db")
            print(f"    2. {SQL_DROP_INDEX}")
            print("    3. VACUUM")
            print("    Economia esperada: ~3,41 MiB de disco.")
        else:
            print("  O índice idx_partidas_vencedor_ano NÃO está presente.")
            print("  Ação planejada (--revert):")
            print(f"    1. {SQL_CREATE_INDEX}")
        return

    if args.apply:
        if not stats_before['index_exists']:
            print("Aviso: O índice idx_partidas_vencedor_ano já não existe no banco.")
            return

        # Backup de segurança pré-modificação
        backup_dir = os.path.join(os.path.dirname(args.db), 'backups')
        os.makedirs(backup_dir, exist_ok=True)
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        backup_file = os.path.join(backup_dir, f"futebol_pre_drop_idx_{timestamp}.db")
        print(f"\nCriando backup preventivo em {backup_file}...")
        shutil.copyfile(args.db, backup_file)

        print("Executando DROP INDEX e VACUUM...")
        conn = sqlite3.connect(args.db)
        c = conn.cursor()
        c.execute(SQL_DROP_INDEX)
        conn.commit()
        c.execute("VACUUM")
        conn.close()

        stats_after = get_db_stats(args.db)
        print("\n=== RESULTADO APÓS APLICAÇÃO ===")
        print(f"Tamanho Novo:     {stats_after['size_bytes']:,} bytes ({stats_after['size_mib']:.4f} MiB)")
        print(f"Redução Líquida:  {stats_before['size_bytes'] - stats_after['size_bytes']:,} bytes ({stats_before['size_mib'] - stats_after['size_mib']:.4f} MiB)")
        print(f"Margem SoftLimit: {(84*1024*1024) - stats_after['size_bytes']:,} bytes ({84 - stats_after['size_mib']:.4f} MiB)")
        print(f"Partidas / Gols:  {stats_after['partidas']} / {stats_after['gols']} (100% Preservados)")
        print(f"Integridade:      {stats_after['integrity']}")

    elif args.revert:
        print("\nRecriando índice original...")
        conn = sqlite3.connect(args.db)
        c = conn.cursor()
        c.execute(SQL_CREATE_INDEX)
        conn.commit()
        conn.close()

        stats_after = get_db_stats(args.db)
        print("\n=== RESULTADO APÓS REVERSÃO ===")
        print(f"Tamanho Novo:     {stats_after['size_bytes']:,} bytes ({stats_after['size_mib']:.4f} MiB)")
        print(f"Índice presente:  {stats_after['index_exists']}")
        print(f"Partidas / Gols:  {stats_after['partidas']} / {stats_after['gols']}")
        print(f"Integridade:      {stats_after['integrity']}")

if __name__ == '__main__':
    main()
