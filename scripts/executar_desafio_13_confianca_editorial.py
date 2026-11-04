#!/usr/bin/env python3
"""
FutStats — Execução do Desafio 13:
Confiança Editorial de Odds e Fair Odds como Produto

1. Adicionar status a odds_partidas_resumo e auditar via Quality Gate
2. Criar a tabela canônica odds_ingestao_status
3. Criar a View Pública Segura vw_odds_publicaveis
4. Atualizar a View vw_odds_fechamento_principal
5. Povoar telemetria de ingestão com status aprovado/quarentena
6. Registrar na governança e executar VACUUM
"""

import sqlite3
import hashlib
from datetime import datetime
from pathlib import Path
import sys

sys.path.insert(0, str(Path(".").resolve()))
from backend.odds_quality_gate import mercado_1x2_valido, calcular_margem_implicita

DB_PATH = Path("data/futebol.db")

def conectar():
    conn = sqlite3.connect(DB_PATH)
    conn.execute("PRAGMA foreign_keys = ON;")
    conn.execute("PRAGMA journal_mode = DELETE;")
    return conn

def executar_desafio_13():
    print("=" * 80)
    print("EXECUÇÃO DO DESAFIO 13 — CONFIANÇA EDITORIAL E STATUS DE INGESTÃO")
    print("=" * 80)

    conn = conectar()
    cur = conn.cursor()

    # 1. Adicionar coluna status em odds_partidas_resumo se não existir
    print("[1/6] Verificando schema de odds_partidas_resumo...")
    cur.execute("PRAGMA table_info(odds_partidas_resumo);")
    cols = [col[1] for col in cur.fetchall()]
    if "status" not in cols:
        print("-> Adicionando coluna 'status' em odds_partidas_resumo...")
        cur.execute("ALTER TABLE odds_partidas_resumo ADD COLUMN status TEXT DEFAULT 'aprovado';")
        conn.commit()

    # 2. Auditar cada registro de odds_partidas_resumo
    print("[2/6] Auditando linhas de odds_partidas_resumo via Quality Gate...")
    cur.execute("SELECT partida_id, bookmaker_id, casa_fechamento, empate_fechamento, fora_fechamento FROM odds_partidas_resumo;")
    rows = cur.fetchall()
    aprovados_resumo = 0
    quarentena_resumo = 0

    for r in rows:
        pid, b_id, c, e, f = r
        valido, motivo, margem = mercado_1x2_valido(c, e, f)
        status_final = "aprovado" if valido else "quarentena"
        if valido:
            aprovados_resumo += 1
        else:
            quarentena_resumo += 1
        cur.execute("""
        UPDATE odds_partidas_resumo
        SET status = ?
        WHERE partida_id = ? AND bookmaker_id = ?;
        """, (status_final, pid, b_id))

    conn.commit()
    print(f"-> odds_partidas_resumo auditado: {aprovados_resumo} aprovados | {quarentena_resumo} quarentena.")

    # 3. Criar a tabela canônica odds_ingestao_status
    print("[3/6] Criando tabela canônica odds_ingestao_status...")
    cur.execute("""
    CREATE TABLE IF NOT EXISTS odds_ingestao_status (
        partida_id INTEGER NOT NULL,
        bookmaker_id INTEGER NOT NULL,
        status TEXT NOT NULL,
        motivo TEXT,
        margem_implicita REAL,
        payload_sha256 TEXT NOT NULL,
        recebido_em TEXT NOT NULL,
        PRIMARY KEY (partida_id, bookmaker_id, recebido_em)
    );
    """)
    conn.commit()

    # 4. Povoar odds_ingestao_status com telemetria
    print("[4/6] Povoando telemetria de ingestão em odds_ingestao_status...")
    now_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    # Fontes observadas de odds_partidas_resumo
    cur.execute("""
    SELECT partida_id, bookmaker_id, casa_fechamento, empate_fechamento, fora_fechamento, status
    FROM odds_partidas_resumo;
    """)
    resumos = cur.fetchall()
    ingestao_batch = []

    for r in resumos:
        pid, b_id, c, e, f, st = r
        valido, motivo, margem = mercado_1x2_valido(c, e, f)
        raw_payload = f"{pid}_{b_id}_{c}_{e}_{f}"
        sha = hashlib.sha256(raw_payload.encode()).hexdigest()
        ingestao_batch.append((pid, b_id, st, motivo or "QUALITY_GATE_PASS", margem, sha, now_str))

    # Fontes de consenso nacional (incluindo as em quarentena)
    cur.execute("""
    SELECT partida_id, casa_abertura, empate_abertura, fora_abertura, margem_fechamento
    FROM odds_consenso_partida;
    """)
    consensos = cur.fetchall()
    for r in consensos:
        pid, c, e, f, m_fech = r
        valido, motivo, margem = mercado_1x2_valido(c, e, f)
        st = "aprovado" if valido else "quarentena"
        motivo_final = motivo if not valido else "CONSENSO_GATE_PASS"
        raw_payload = f"{pid}_consenso_{c}_{e}_{f}"
        sha = hashlib.sha256(raw_payload.encode()).hexdigest()
        ingestao_batch.append((pid, 1, st, motivo_final, margem or m_fech, sha, now_str))

    cur.executemany("""
    INSERT OR REPLACE INTO odds_ingestao_status (
        partida_id, bookmaker_id, status, motivo, margem_implicita, payload_sha256, recebido_em
    ) VALUES (?, ?, ?, ?, ?, ?, ?);
    """, ingestao_batch)
    conn.commit()
    print(f"-> {len(ingestao_batch)} registros de telemetria cadastrados em odds_ingestao_status.")

    # 5. Criar View Pública Segura vw_odds_publicaveis
    print("[5/6] Criando View Pública Segura vw_odds_publicaveis...")
    cur.execute("DROP VIEW IF EXISTS vw_odds_publicaveis;")
    cur.execute("""
    CREATE VIEW vw_odds_publicaveis AS
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
        fechamento_coletado_em,
        mercado_principal,
        atualizado_em
    FROM odds_partidas_resumo
    WHERE status = 'aprovado';
    """)
    conn.commit()

    # Atualizar View de fechamento principal para garantir que apenas dados válidos sejam visíveis
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
        c.margem_fechamento,
        c.calculado_em
    FROM odds_consenso_partida c
    WHERE c.casa_abertura IS NOT NULL
      AND c.empate_abertura IS NOT NULL
      AND c.fora_abertura IS NOT NULL
      AND ((1.0 / c.casa_abertura + 1.0 / c.empate_abertura + 1.0 / c.fora_abertura) - 1.0) BETWEEN 0.0 AND 0.15;
    """)
    conn.commit()
    print("-> Views canônicas vw_odds_publicaveis e vw_odds_fechamento_principal criadas com sucesso.")

    # 6. Registrar em governanca_banco e executar VACUUM
    print("[6/6] Registrando governança e executando VACUUM...")
    tamanho_atual = DB_PATH.stat().st_size / (1024 * 1024)
    total_p = cur.execute("SELECT COUNT(*) FROM partidas;").fetchone()[0]
    total_g = cur.execute("SELECT COUNT(*) FROM gols;").fetchone()[0]
    total_e = cur.execute("SELECT COUNT(*) FROM escalacoes;").fetchone()[0]
    total_c = cur.execute("SELECT COUNT(*) FROM cartoes;").fetchone()[0]
    total_o = cur.execute("SELECT COUNT(*) FROM odds_partidas;").fetchone()[0]

    cur.execute("""
    INSERT INTO governanca_banco (executado_em, tamanho_mb, partidas, gols, escalacoes, cartoes, odds, acao_executada)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?);
    """, (
        now_str,
        round(tamanho_atual, 2),
        total_p,
        total_g,
        total_e,
        total_c,
        total_o,
        "Desafio 13: Criacao odds_ingestao_status, vw_odds_publicaveis e gate editorial"
    ))
    conn.commit()
    conn.close()

    v_conn = sqlite3.connect(DB_PATH)
    v_conn.execute("VACUUM;")
    v_conn.execute("PRAGMA journal_mode = DELETE;")
    v_conn.close()

    mb_final = DB_PATH.stat().st_size / (1024 * 1024)
    print(f"-> Concluído! Tamanho final de futebol.db: {mb_final:.2f} MB (Teto Vercel: 94,0 MB | Soft Limit: 88,0 MB)")

if __name__ == '__main__':
    executar_desafio_13()
