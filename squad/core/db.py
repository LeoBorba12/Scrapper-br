from __future__ import annotations

import os
import sqlite3
import time
from contextlib import contextmanager
from typing import Generator

DEFAULT_DB_PATH = os.getenv("FUTSTATS_DB_PATH", "data/futebol.db")


def get_connection(db_path: str = DEFAULT_DB_PATH, readonly: bool = False) -> sqlite3.Connection:
    os.makedirs(os.path.dirname(os.path.abspath(db_path)), exist_ok=True)
    uri = f"file:{db_path}?mode=ro" if readonly else db_path
    conn = sqlite3.connect(
        uri,
        timeout=10.0,
        isolation_level=None,  # Controle explícito de BEGIN IMMEDIATE
        uri=readonly,
        check_same_thread=False,
    )
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA busy_timeout=10000;")
    if not readonly:
        conn.execute("PRAGMA journal_mode=WAL;")
        conn.execute("PRAGMA synchronous=NORMAL;")
        conn.execute("PRAGMA foreign_keys=ON;")
    return conn


@contextmanager
def write_transaction(
    db_path: str = DEFAULT_DB_PATH,
    max_retries: int = 5,
    base_delay: float = 0.2,
) -> Generator[sqlite3.Connection, None, None]:
    """Garante 1 escritor por vez com BEGIN IMMEDIATE e backoff exponencial em SQLITE_BUSY."""
    conn = get_connection(db_path, readonly=False)
    attempt = 0
    try:
        while True:
            try:
                conn.execute("BEGIN IMMEDIATE;")
                break
            except sqlite3.OperationalError as exc:
                if "locked" in str(exc).lower() or "busy" in str(exc).lower():
                    attempt += 1
                    if attempt > max_retries:
                        raise
                    time.sleep(base_delay * (2 ** (attempt - 1)))
                else:
                    raise
        try:
            yield conn
            if conn.in_transaction:
                conn.execute("COMMIT;")
        except Exception:
            if conn.in_transaction:
                conn.execute("ROLLBACK;")
            raise
    finally:
        conn.close()


@contextmanager
def read_connection(db_path: str = DEFAULT_DB_PATH) -> Generator[sqlite3.Connection, None, None]:
    """Conexão de leitura concorrente sem bloquear escritores em WAL."""
    conn = get_connection(db_path, readonly=False)
    try:
        yield conn
    finally:
        conn.close()


def init_schema(db_path: str = DEFAULT_DB_PATH) -> None:
    """Inicializa tabelas essenciais, fila universal e tabelas de staging (idempotente)."""
    with write_transaction(db_path) as conn:
        conn.executescript(
            """
            CREATE TABLE IF NOT EXISTS clubes (
                id INTEGER PRIMARY KEY,
                nome TEXT NOT NULL UNIQUE,
                pais TEXT NOT NULL DEFAULT 'Brasil',
                forca_ataque REAL NOT NULL DEFAULT 1.0,
                forca_defesa REAL NOT NULL DEFAULT 1.0
            );

            CREATE TABLE IF NOT EXISTS jogadores (
                id INTEGER PRIMARY KEY,
                nome TEXT NOT NULL,
                data_nascimento TEXT,
                nacionalidade TEXT NOT NULL DEFAULT 'Brasil',
                total_gols INTEGER NOT NULL DEFAULT 0,
                total_jogos INTEGER NOT NULL DEFAULT 0
            );

            CREATE TABLE IF NOT EXISTS partidas (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                liga TEXT NOT NULL,
                pais TEXT NOT NULL DEFAULT 'Brasil',
                data_hora TEXT NOT NULL,
                clube_casa_id INTEGER NOT NULL,
                clube_fora_id INTEGER NOT NULL,
                gols_casa INTEGER,
                gols_fora INTEGER,
                status TEXT NOT NULL DEFAULT 'AGENDADA',
                odd_casa REAL,
                odd_empate REAL,
                odd_fora REAL,
                odd_valida INTEGER NOT NULL DEFAULT 1,
                atualizado_em TEXT NOT NULL DEFAULT (datetime('now')),
                quant_processado INTEGER NOT NULL DEFAULT 0
            );

            CREATE TABLE IF NOT EXISTS metricas_quant (
                partida_id INTEGER PRIMARY KEY,
                xg_casa REAL NOT NULL,
                xg_fora REAL NOT NULL,
                prob_casa REAL NOT NULL,
                prob_empate REAL NOT NULL,
                prob_fora REAL NOT NULL,
                rho_dixon_coles REAL NOT NULL,
                calculado_em TEXT NOT NULL DEFAULT (datetime('now'))
            );

            CREATE TABLE IF NOT EXISTS slos_guardiao (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                tamanho_mb REAL NOT NULL,
                vacuum_executado INTEGER NOT NULL DEFAULT 0,
                alerta_enviado INTEGER NOT NULL DEFAULT 0,
                registrado_em TEXT NOT NULL DEFAULT (datetime('now'))
            );

            -- GOVERNANÇA & QUARENTENA: WORKER GAP HUNTER
            CREATE TABLE IF NOT EXISTS fila_reconciliacao_entidades (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                tipo_entidade TEXT NOT NULL CHECK(tipo_entidade IN ('h2h', 'jogador', 'tecnico', 'clube')),
                chave_entidade TEXT NOT NULL,
                payload_json TEXT NOT NULL DEFAULT '{}',
                prioridade INTEGER NOT NULL DEFAULT 5,
                status TEXT NOT NULL DEFAULT 'pending'
                    CHECK(status IN ('pending', 'running', 'completed', 'needs_review', 'failed')),
                locked_by TEXT,
                lock_expires_at TEXT,
                tentativas INTEGER NOT NULL DEFAULT 0,
                ultimo_erro TEXT,
                criado_em TEXT NOT NULL DEFAULT (datetime('now')),
                atualizado_em TEXT NOT NULL DEFAULT (datetime('now'))
            );

            CREATE TABLE IF NOT EXISTS staging_entidades (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                fingerprint TEXT NOT NULL UNIQUE,
                tipo_entidade TEXT NOT NULL,
                nome TEXT NOT NULL,
                data_nascimento TEXT,
                nacionalidade TEXT,
                fonte TEXT NOT NULL,
                payload_json TEXT NOT NULL,
                status TEXT NOT NULL DEFAULT 'quarentena',
                descoberto_em TEXT NOT NULL DEFAULT (datetime('now'))
            );

            CREATE TABLE IF NOT EXISTS staging_partidas_descobertas (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                fingerprint TEXT NOT NULL UNIQUE,
                data_partida TEXT NOT NULL,
                clube_casa_nome TEXT NOT NULL,
                clube_fora_nome TEXT NOT NULL,
                gols_casa INTEGER NOT NULL,
                gols_fora INTEGER NOT NULL,
                competicao TEXT,
                fonte TEXT NOT NULL,
                payload_json TEXT NOT NULL,
                status TEXT NOT NULL DEFAULT 'quarentena',
                descoberto_em TEXT NOT NULL DEFAULT (datetime('now'))
            );

            CREATE TABLE IF NOT EXISTS staging_estatisticas_entidade (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                fingerprint TEXT NOT NULL UNIQUE,
                tipo_entidade TEXT NOT NULL,
                entidade_id INTEGER,
                entidade_nome TEXT NOT NULL,
                metrica TEXT NOT NULL,
                valor_interno REAL NOT NULL,
                valor_externo REAL NOT NULL,
                delta REAL NOT NULL,
                fonte TEXT NOT NULL,
                status TEXT NOT NULL DEFAULT 'quarentena',
                descoberto_em TEXT NOT NULL DEFAULT (datetime('now'))
            );

            CREATE TABLE IF NOT EXISTS staging_periodos_entidade (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                fingerprint TEXT NOT NULL UNIQUE,
                tipo_entidade TEXT NOT NULL,
                entidade_nome TEXT NOT NULL,
                clube_nome TEXT NOT NULL,
                data_inicio TEXT,
                data_fim TEXT,
                fonte TEXT NOT NULL,
                payload_json TEXT NOT NULL,
                status TEXT NOT NULL DEFAULT 'quarentena',
                descoberto_em TEXT NOT NULL DEFAULT (datetime('now'))
            );

            CREATE TABLE IF NOT EXISTS cache_externo_gap_hunter (
                cache_key TEXT PRIMARY KEY,
                fonte TEXT NOT NULL,
                payload_json TEXT NOT NULL,
                expira_em TEXT NOT NULL,
                criado_em TEXT NOT NULL DEFAULT (datetime('now'))
            );

            CREATE INDEX IF NOT EXISTS idx_fila_reconc_status_prio
                ON fila_reconciliacao_entidades(status, prioridade, lock_expires_at);
            """
        )
        # Índices condicionais para compatibilidade entre esquemas
        cols = [r[1] for r in conn.execute("PRAGMA table_info(partidas)").fetchall()]
        if "status" in cols and "data_hora" in cols:
            conn.execute("CREATE INDEX IF NOT EXISTS idx_partidas_status ON partidas(status);")
            conn.execute("CREATE INDEX IF NOT EXISTS idx_partidas_data ON partidas(data_hora);")
        if "quant_processado" in cols and "status" in cols:
            conn.execute("CREATE INDEX IF NOT EXISTS idx_partidas_quant ON partidas(quant_processado, status);")
        if "id_partida" in cols and "data" in cols:
            conn.execute("CREATE INDEX IF NOT EXISTS idx_partidas_data_id ON partidas(data, id_partida);")
