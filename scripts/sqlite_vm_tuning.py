"""
Módulo de Otimização e Conexão de Alta Performance para SQLite na VM Oracle (24 GB RAM)
Autor: Gemini Argon & Antigravity Core
"""
import sqlite3
import os

def get_tuned_db_connection(db_path: str = None) -> sqlite3.Connection:
    if db_path is None:
        db_path = os.environ.get("DB_PATH", "/home/opc/Guia-profissional/data/futebol.db")
    
    # timeout de 30s para evitar busy handler durante concorrência
    conn = sqlite3.connect(db_path, timeout=30.0, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    
    cursor = conn.cursor()
    # 1. Aloca 64 MB de cache RAM dedicado por conexão (em vez dos 2 MB padrão)
    cursor.execute("PRAGMA cache_size = -64000;")
    # 2. Armazena tabelas temporárias e índices de ordenação diretamente na memória RAM
    cursor.execute("PRAGMA temp_store = MEMORY;")
    # 3. Habilita 256 MB de Memory-Mapped I/O (mmap) para leitura instantânea de páginas
    cursor.execute("PRAGMA mmap_size = 268435456;")
    # 4. Garante modo WAL para leituras e gravações concorrentes sem bloqueio
    cursor.execute("PRAGMA journal_mode = WAL;")
    # 5. Sincronização normal (ótimo balanço de durabilidade e altíssima vazão em WAL)
    cursor.execute("PRAGMA synchronous = NORMAL;")
    cursor.close()
    
    return conn
