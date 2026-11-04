#!/usr/bin/env python3
"""
FutStats — Execução do Desafio 4:
1. Criar tabela canônica odds_consenso_partida (separação de derivados e fontes)
2. Calcular margem implícita e migrar consenso de odds_partidas
3. Limpar bookmaker_id = 1 de odds_partidas_resumo (deixando apenas fontes observadas)
4. Atualizar View Canônica vw_odds_fechamento_principal
5. Executar validações de integridade e cobertura
6. Executar VACUUM e registrar na tabela governanca_banco
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

def executar_desafio_4():
    print("[1/6] Conectando ao SQLite...")
    conn = conectar()
    cur = conn.cursor()

    # 1. Criar a nova tabela de derivados odds_consenso_partida
    print("[2/6] Criando tabela odds_consenso_partida...")
    cur.execute("""
    CREATE TABLE IF NOT EXISTS odds_consenso_partida (
        partida_id INTEGER NOT NULL PRIMARY KEY,
        metodo TEXT NOT NULL,
        casas_incluidas INTEGER NOT NULL,
        casa_abertura REAL,
        empate_abertura REAL,
        fora_abertura REAL,
        casa_fechamento REAL,
        empate_fechamento REAL,
        fora_fechamento REAL,
        margem_fechamento REAL,
        calculado_em TEXT NOT NULL,
        FOREIGN KEY (partida_id) REFERENCES partidas(id_partida)
    );
    """)
    conn.commit()

    # 2. Migrar dados de consenso com cálculo da margem implícita
    print("[3/6] Povoando odds_consenso_partida com margem implícita auditável...")
    now_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    # Inserção a partir de odds_partidas
    # margem = (1/casa + 1/empate + 1/fora) - 1
    cur.execute("""
    INSERT OR REPLACE INTO odds_consenso_partida (
        partida_id,
        metodo,
        casas_incluidas,
        casa_abertura,
        empate_abertura,
        fora_abertura,
        casa_fechamento,
        empate_fechamento,
        fora_fechamento,
        margem_fechamento,
        calculado_em
    )
    SELECT
        id_partida,
        'consenso_mercado_nacional_v1',
        CASE
            WHEN odd_pinnacle_mandante IS NOT NULL AND odd_b365_mandante IS NOT NULL THEN 3
            WHEN odd_pinnacle_mandante IS NOT NULL OR odd_b365_mandante IS NOT NULL THEN 2
            ELSE 1
        END,
        odd_mandante,
        odd_empate,
        odd_visitante,
        odd_mandante,
        odd_empate,
        odd_visitante,
        ROUND((1.0 / odd_mandante + 1.0 / odd_empate + 1.0 / odd_visitante) - 1.0, 4),
        ?
    FROM odds_partidas
    WHERE odd_mandante IS NOT NULL AND odd_empate IS NOT NULL AND odd_visitante IS NOT NULL;
    """, (now_str,))
    total_consenso = cur.rowcount
    conn.commit()
    print(f"-> {total_consenso} registros inseridos em odds_consenso_partida.")

    # 3. Remover bookmaker_id = 1 (derivado) de odds_partidas_resumo
    print("[4/6] Removendo bookmaker_id = 1 de odds_partidas_resumo para manter apenas fontes observadas...")
    cur.execute("DELETE FROM odds_partidas_resumo WHERE bookmaker_id = 1;")
    removidos = cur.rowcount
    conn.commit()
    print(f"-> {removidos} registros de consenso derivados removidos da tabela de fontes observadas.")

    # 4. Atualizar a View Canônica vw_odds_fechamento_principal
    print("[5/6] Atualizando View Canônica vw_odds_fechamento_principal...")
    cur.execute("DROP VIEW IF EXISTS vw_odds_fechamento_principal;")
    cur.execute("""
    CREATE VIEW vw_odds_fechamento_principal AS
    SELECT
        c.partida_id,
        'consenso' AS fonte_tipo,
        c.metodo AS bookmaker_nome,
        c.casa_abertura,
        c.empate_abertura,
        c.fora_abertura,
        c.casa_fechamento,
        c.empate_fechamento,
        c.fora_fechamento,
        c.calculado_em AS fechamento_coletado_em
    FROM odds_consenso_partida c;
    """)
    conn.commit()

    # Validações solicitadas no Desafio 4:
    # 1. Toda partida com odds possui consenso
    cur.execute("""
    SELECT COUNT(*)
    FROM odds_partidas o
    LEFT JOIN odds_consenso_partida c ON c.partida_id = o.id_partida
    WHERE o.odd_mandante IS NOT NULL AND c.partida_id IS NULL;
    """)
    faltantes_consenso = cur.fetchone()[0]
    print(f"-> Partidas com odds sem consenso: {faltantes_consenso} (Esperado: 0)")

    # 2. Quantidade de fontes observadas restantes
    cur.execute("SELECT bookmaker_id, bookmaker_nome, COUNT(*) FROM odds_partidas_resumo GROUP BY bookmaker_id, bookmaker_nome;")
    fontes_restantes = cur.fetchall()
    print("-> Fontes observadas preservadas em odds_partidas_resumo:")
    for f in fontes_restantes:
        print(f"   * Bookmaker {f[0]} ({f[1]}): {f[2]} registros")

    # 5. Executar VACUUM e registrar governança
    print("[6/6] Executando VACUUM e gravando governança...")
    conn.execute("VACUUM;")
    conn.commit()

    tamanho_bytes = os.path.getsize(DB_PATH)
    tamanho_mb = round(tamanho_bytes / (1024 * 1024), 2)
    partidas = cur.execute("SELECT count(*) FROM partidas").fetchone()[0]
    gols = cur.execute("SELECT count(*) FROM gols").fetchone()[0]
    escalacoes = cur.execute("SELECT count(*) FROM escalacoes").fetchone()[0]
    cartoes = cur.execute("SELECT count(*) FROM cartoes").fetchone()[0]
    odds = cur.execute("SELECT count(*) FROM odds_partidas").fetchone()[0]
    resumo_count = cur.execute("SELECT count(*) FROM odds_partidas_resumo").fetchone()[0]
    consenso_count = cur.execute("SELECT count(*) FROM odds_consenso_partida").fetchone()[0]

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
        f"DESAFIO 4: Separacao odds_consenso_partida ({consenso_count}) e odds_partidas_resumo ({resumo_count})"
    ))
    conn.commit()
    conn.close()

    print(f"Sucesso! Banco compactado em {tamanho_mb} MB.")

if __name__ == "__main__":
    executar_desafio_4()
