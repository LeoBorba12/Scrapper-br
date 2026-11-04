#!/usr/bin/env python3
"""
FutStats — Execução do Desafio 5:
1. Criar tabela odds_consenso_insumos para provenance e auditoria completa de insumos
2. Popular insumos observados a partir de odds_partidas
3. Criar tabela odds_auditoria_sharp para benchmark contínuo contra a Pinnacle
4. Popular odds_auditoria_sharp para todas as partidas com Pinnacle (4.941 partidas)
5. Executar VACUUM e registrar na telemetria governanca_banco
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

def executar_desafio_5():
    print("[1/6] Conectando ao SQLite...")
    conn = conectar()
    cur = conn.cursor()

    # 1. Criar a tabela de insumos do consenso
    print("[2/6] Criando tabela odds_consenso_insumos...")
    cur.execute("""
    CREATE TABLE IF NOT EXISTS odds_consenso_insumos (
        partida_id INTEGER NOT NULL,
        bookmaker_id INTEGER NOT NULL,
        bookmaker_nome TEXT NOT NULL,

        casa_abertura REAL,
        empate_abertura REAL,
        fora_abertura REAL,
        casa_fechamento REAL,
        empate_fechamento REAL,
        fora_fechamento REAL,

        margem_fechamento REAL,
        incluido_no_consenso INTEGER NOT NULL,
        motivo_exclusao TEXT,

        metodo TEXT NOT NULL,
        calculado_em TEXT NOT NULL,

        PRIMARY KEY (partida_id, bookmaker_id, metodo),
        FOREIGN KEY (partida_id) REFERENCES partidas(id_partida)
    );
    """)

    # 2. Criar a tabela de auditoria sharp
    print("[3/6] Criando tabela odds_auditoria_sharp...")
    cur.execute("""
    CREATE TABLE IF NOT EXISTS odds_auditoria_sharp (
        partida_id INTEGER NOT NULL PRIMARY KEY,
        consenso_casa REAL,
        consenso_empate REAL,
        consenso_fora REAL,
        pinnacle_casa REAL,
        pinnacle_empate REAL,
        pinnacle_fora REAL,
        desvio_absoluto_casa REAL,
        desvio_absoluto_empate REAL,
        desvio_absoluto_fora REAL,
        margem_consenso REAL,
        margem_pinnacle REAL,
        calculado_em TEXT NOT NULL,
        FOREIGN KEY (partida_id) REFERENCES partidas(id_partida)
    );
    """)
    conn.commit()

    now_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    # 3. Povoar odds_consenso_insumos
    print("[4/6] Povoando insumos do consenso a partir de odds_partidas...")

    # Insumo 1: Pinnacle Sharp (quando presente)
    cur.execute("""
    INSERT OR REPLACE INTO odds_consenso_insumos (
        partida_id, bookmaker_id, bookmaker_nome,
        casa_abertura, empate_abertura, fora_abertura,
        casa_fechamento, empate_fechamento, fora_fechamento,
        margem_fechamento, incluido_no_consenso, motivo_exclusao,
        metodo, calculado_em
    )
    SELECT
        id_partida,
        2,
        'Pinnacle Sharp',
        odd_pinnacle_mandante, odd_pinnacle_empate, odd_pinnacle_visitante,
        odd_pinnacle_mandante, odd_pinnacle_empate, odd_pinnacle_visitante,
        ROUND((1.0 / odd_pinnacle_mandante + 1.0 / odd_pinnacle_empate + 1.0 / odd_pinnacle_visitante) - 1.0, 4),
        1,
        NULL,
        'consenso_mercado_nacional_v2',
        ?
    FROM odds_partidas
    WHERE odd_pinnacle_mandante IS NOT NULL;
    """, (now_str,))
    pinnacle_insumos = cur.rowcount

    # Insumo 2: Bet365 Varejo (quando presente)
    cur.execute("""
    INSERT OR REPLACE INTO odds_consenso_insumos (
        partida_id, bookmaker_id, bookmaker_nome,
        casa_abertura, empate_abertura, fora_abertura,
        casa_fechamento, empate_fechamento, fora_fechamento,
        margem_fechamento, incluido_no_consenso, motivo_exclusao,
        metodo, calculado_em
    )
    SELECT
        id_partida,
        3,
        'Bet365 Varejo',
        odd_b365_mandante, odd_b365_empate, odd_b365_visitante,
        odd_b365_mandante, odd_b365_empate, odd_b365_visitante,
        ROUND((1.0 / odd_b365_mandante + 1.0 / odd_b365_empate + 1.0 / odd_b365_visitante) - 1.0, 4),
        1,
        NULL,
        'consenso_mercado_nacional_v2',
        ?
    FROM odds_partidas
    WHERE odd_b365_mandante IS NOT NULL;
    """, (now_str,))
    bet365_insumos = cur.rowcount

    # Insumo 3: Média / Consenso de Origem Nacional
    cur.execute("""
    INSERT OR REPLACE INTO odds_consenso_insumos (
        partida_id, bookmaker_id, bookmaker_nome,
        casa_abertura, empate_abertura, fora_abertura,
        casa_fechamento, empate_fechamento, fora_fechamento,
        margem_fechamento, incluido_no_consenso, motivo_exclusao,
        metodo, calculado_em
    )
    SELECT
        id_partida,
        5,
        'Painel Consenso Nacional',
        odd_mandante, odd_empate, odd_visitante,
        odd_mandante, odd_empate, odd_visitante,
        ROUND((1.0 / odd_mandante + 1.0 / odd_empate + 1.0 / odd_visitante) - 1.0, 4),
        1,
        NULL,
        'consenso_mercado_nacional_v2',
        ?
    FROM odds_partidas
    WHERE odd_mandante IS NOT NULL;
    """, (now_str,))
    nacional_insumos = cur.rowcount

    conn.commit()
    print(f"-> Insumos cadastrados: Pinnacle={pinnacle_insumos}, Bet365={bet365_insumos}, Consenso={nacional_insumos}")

    # 4. Povoar odds_auditoria_sharp
    print("[5/6] Povoando tabela de auditoria sharp (odds_auditoria_sharp)...")
    cur.execute("""
    INSERT OR REPLACE INTO odds_auditoria_sharp (
        partida_id,
        consenso_casa,
        consenso_empate,
        consenso_fora,
        pinnacle_casa,
        pinnacle_empate,
        pinnacle_fora,
        desvio_absoluto_casa,
        desvio_absoluto_empate,
        desvio_absoluto_fora,
        margem_consenso,
        margem_pinnacle,
        calculado_em
    )
    SELECT
        c.partida_id,
        c.casa_fechamento,
        c.empate_fechamento,
        c.fora_fechamento,
        o.odd_pinnacle_mandante,
        o.odd_pinnacle_empate,
        o.odd_pinnacle_visitante,
        ROUND(ABS(c.casa_fechamento - o.odd_pinnacle_mandante), 4),
        ROUND(ABS(c.empate_fechamento - o.odd_pinnacle_empate), 4),
        ROUND(ABS(c.fora_fechamento - o.odd_pinnacle_visitante), 4),
        c.margem_fechamento,
        ROUND((1.0 / o.odd_pinnacle_mandante + 1.0 / o.odd_pinnacle_empate + 1.0 / o.odd_pinnacle_visitante) - 1.0, 4),
        ?
    FROM odds_consenso_partida c
    JOIN odds_partidas o ON c.partida_id = o.id_partida
    WHERE o.odd_pinnacle_mandante IS NOT NULL
      AND o.odd_pinnacle_empate IS NOT NULL
      AND o.odd_pinnacle_visitante IS NOT NULL;
    """, (now_str,))
    total_sharp = cur.rowcount
    conn.commit()
    print(f"-> {total_sharp} partidas auditadas contra a Pinnacle.")

    # 5. VACUUM e telemetria
    print("[6/6] Executando VACUUM e atualizando governanca_banco...")
    conn.execute("VACUUM;")
    conn.commit()

    tamanho_bytes = os.path.getsize(DB_PATH)
    tamanho_mb = round(tamanho_bytes / (1024 * 1024), 2)
    partidas = cur.execute("SELECT count(*) FROM partidas").fetchone()[0]
    gols = cur.execute("SELECT count(*) FROM gols").fetchone()[0]
    escalacoes = cur.execute("SELECT count(*) FROM escalacoes").fetchone()[0]
    cartoes = cur.execute("SELECT count(*) FROM cartoes").fetchone()[0]
    odds = cur.execute("SELECT count(*) FROM odds_partidas").fetchone()[0]
    insumos_count = cur.execute("SELECT count(*) FROM odds_consenso_insumos").fetchone()[0]
    sharp_count = cur.execute("SELECT count(*) FROM odds_auditoria_sharp").fetchone()[0]

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
        f"DESAFIO 5: Provenance insumos ({insumos_count}) + Auditoria Sharp ({sharp_count})"
    ))
    conn.commit()
    conn.close()

    print(f"Sucesso! Banco compactado em {tamanho_mb} MB.")

if __name__ == "__main__":
    executar_desafio_5()
