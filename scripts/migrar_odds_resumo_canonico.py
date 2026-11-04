#!/usr/bin/env python3
"""
FutStats — Script de Migração do Desafio 3:
1. Execução do DROP dos índices ociosos idx_odds_mandante e idx_odds_visitante
2. Criação da tabela normalizada odds_partidas_resumo e View Canônica
3. População idempotente com definição determinística de mercado principal
4. Registro na telemetria governanca_banco
5. VACUUM com PRAGMA journal_mode = DELETE
"""

import sqlite3
import os
from datetime import datetime
from pathlib import Path

DB_PATH = Path("data/futebol.db")

def conectar():
    conn = sqlite3.connect(DB_PATH)
    conn.execute("PRAGMA foreign_keys = ON;")
    conn.execute("PRAGMA journal_mode = DELETE;")
    return conn

def executar_desafio_3():
    print("[1/5] Conectando ao SQLite...")
    conn = conectar()
    cur = conn.cursor()

    # 1. DROP dos índices ociosos
    print("[2/5] Removendo índices secundários ociosos (idx_odds_mandante e idx_odds_visitante)...")
    cur.execute("DROP INDEX IF EXISTS idx_odds_mandante;")
    cur.execute("DROP INDEX IF EXISTS idx_odds_visitante;")
    conn.commit()

    # 2. Criação da tabela materializada e índice
    print("[3/5] Criando tabela materializada odds_partidas_resumo e índices canônicos...")
    cur.execute("""
    CREATE TABLE IF NOT EXISTS odds_partidas_resumo (
        partida_id INTEGER NOT NULL,
        bookmaker_id INTEGER NOT NULL,
        bookmaker_nome TEXT NOT NULL,

        casa_abertura REAL,
        empate_abertura REAL,
        fora_abertura REAL,

        casa_fechamento REAL,
        empate_fechamento REAL,
        fora_fechamento REAL,

        fechamento_coletado_em TEXT,
        mercado_principal INTEGER NOT NULL DEFAULT 0,

        atualizado_em TEXT NOT NULL,

        PRIMARY KEY (partida_id, bookmaker_id),
        FOREIGN KEY (partida_id) REFERENCES partidas(id_partida)
    );
    """)

    cur.execute("""
    CREATE INDEX IF NOT EXISTS idx_odds_resumo_partida_mercado
    ON odds_partidas_resumo (partida_id, mercado_principal);
    """)

    # Criação da View Canônica
    cur.execute("""
    CREATE VIEW IF NOT EXISTS vw_odds_fechamento_principal AS
    SELECT
        partida_id,
        bookmaker_id,
        bookmaker_nome,
        casa_abertura,
        empate_abertura,
        fora_abertura,
        casa_fechamento,
        empate_fechamento,
        fora_fechamento,
        fechamento_coletado_em
    FROM odds_partidas_resumo
    WHERE mercado_principal = 1;
    """)
    conn.commit()

    # 3. Migração idempotente a partir de odds_partidas
    print("[4/5] Migrando e materializando odds por bookmaker...")
    now_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    # Inserção do Bookmaker 1: Consenso de Mercado (Mercado Principal = 1)
    cur.execute("""
    INSERT INTO odds_partidas_resumo (
        partida_id, bookmaker_id, bookmaker_nome,
        casa_abertura, empate_abertura, fora_abertura,
        casa_fechamento, empate_fechamento, fora_fechamento,
        fechamento_coletado_em, mercado_principal, atualizado_em
    )
    SELECT
        id_partida,
        1,
        'Consenso de Mercado',
        odd_mandante, odd_empate, odd_visitante, -- abertura aproximada/referencial
        odd_mandante, odd_empate, odd_visitante, -- fechamento consolidado
        ?,
        1,
        ?
    FROM odds_partidas
    WHERE odd_mandante IS NOT NULL
    ON CONFLICT(partida_id, bookmaker_id) DO UPDATE SET
        casa_fechamento = excluded.casa_fechamento,
        empate_fechamento = excluded.empate_fechamento,
        fora_fechamento = excluded.fora_fechamento,
        mercado_principal = 1,
        atualizado_em = excluded.atualizado_em;
    """, (now_str, now_str))

    # Inserção do Bookmaker 2: Pinnacle Sharp (quando disponível)
    cur.execute("""
    INSERT INTO odds_partidas_resumo (
        partida_id, bookmaker_id, bookmaker_nome,
        casa_abertura, empate_abertura, fora_abertura,
        casa_fechamento, empate_fechamento, fora_fechamento,
        fechamento_coletado_em, mercado_principal, atualizado_em
    )
    SELECT
        id_partida,
        2,
        'Pinnacle Sharp',
        odd_pinnacle_mandante, odd_pinnacle_empate, odd_pinnacle_visitante,
        odd_pinnacle_mandante, odd_pinnacle_empate, odd_pinnacle_visitante,
        ?,
        0,
        ?
    FROM odds_partidas
    WHERE odd_pinnacle_mandante IS NOT NULL
    ON CONFLICT(partida_id, bookmaker_id) DO UPDATE SET
        casa_fechamento = excluded.casa_fechamento,
        empate_fechamento = excluded.empate_fechamento,
        fora_fechamento = excluded.fora_fechamento,
        atualizado_em = excluded.atualizado_em;
    """, (now_str, now_str))

    # Inserção do Bookmaker 3: Bet365 Varejo (quando disponível)
    cur.execute("""
    INSERT INTO odds_partidas_resumo (
        partida_id, bookmaker_id, bookmaker_nome,
        casa_abertura, empate_abertura, fora_abertura,
        casa_fechamento, empate_fechamento, fora_fechamento,
        fechamento_coletado_em, mercado_principal, atualizado_em
    )
    SELECT
        id_partida,
        3,
        'Bet365 Varejo',
        odd_b365_mandante, odd_b365_empate, odd_b365_visitante,
        odd_b365_mandante, odd_b365_empate, odd_b365_visitante,
        ?,
        0,
        ?
    FROM odds_partidas
    WHERE odd_b365_mandante IS NOT NULL
    ON CONFLICT(partida_id, bookmaker_id) DO UPDATE SET
        casa_fechamento = excluded.casa_fechamento,
        empate_fechamento = excluded.empate_fechamento,
        fora_fechamento = excluded.fora_fechamento,
        atualizado_em = excluded.atualizado_em;
    """, (now_str, now_str))

    conn.commit()

    # Validação de cobertura exigida pelo Desafio 3:
    cur.execute("""
    SELECT COUNT(*)
    FROM odds_partidas
    WHERE id_partida NOT IN (
        SELECT partida_id
        FROM odds_partidas_resumo
    );
    """)
    faltantes = cur.fetchone()[0]
    print(f"-> Partidas sem cobertura na tabela resumo: {faltantes}")
    if faltantes > 0:
        print(f"AVISO: Existem {faltantes} partidas com odds nulas que não entraram no resumo.")

    # Executar VACUUM
    print("[5/5] Executando VACUUM e registrando governança...")
    conn.execute("VACUUM;")
    conn.commit()

    # Registrar na tabela de governança
    tamanho_bytes = os.path.getsize(DB_PATH)
    tamanho_mb = round(tamanho_bytes / (1024 * 1024), 2)
    partidas = cur.execute("SELECT count(*) FROM partidas").fetchone()[0]
    gols = cur.execute("SELECT count(*) FROM gols").fetchone()[0]
    escalacoes = cur.execute("SELECT count(*) FROM escalacoes").fetchone()[0]
    cartoes = cur.execute("SELECT count(*) FROM cartoes").fetchone()[0]
    odds = cur.execute("SELECT count(*) FROM odds_partidas").fetchone()[0]
    resumo_count = cur.execute("SELECT count(*) FROM odds_partidas_resumo").fetchone()[0]

    cur.execute("""
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
        f"DESAFIO 3: DROP idx_odds + Criacao odds_partidas_resumo ({resumo_count} linhas)"
    ))
    conn.commit()
    conn.close()

    print(f"Sucesso! Banco compactado em {tamanho_mb} MB.")
    print(f"Tabela odds_partidas_resumo criada com {resumo_count} registros.")

if __name__ == "__main__":
    executar_desafio_3()
