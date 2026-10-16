"""
Módulo de Consultas Cruzadas: Futebol Brasileiro + Clima Histórico
Conecta aos dois bancos SQLite isolados (data/futebol.db e data/clima.db)
utilizando a funcionalidade 'ATTACH DATABASE' do SQLite para permitir infinitas
combinações analíticas em uma única consulta SQL de altíssima performance.
"""

import os
import sqlite3
import pandas as pd

BASE_DIR = os.path.dirname(__file__)
FUTEBOL_DB = os.path.join(BASE_DIR, "data", "futebol.db")
CLIMA_DB = os.path.join(BASE_DIR, "data", "clima.db")

def conectar_bancos_cruzados():
    """
    Abre o banco de futebol e anexa o banco meteorológico como schema 'clima'.
    Permite queries relacionando tabelas:
      - partidas, gols, cartoes, escalacoes (do banco futebol)
      - clima.clima_diario (do banco clima)
    """
    if not os.path.exists(FUTEBOL_DB):
        raise FileNotFoundError(f"Banco de futebol não encontrado em: {FUTEBOL_DB}")
    if not os.path.exists(CLIMA_DB):
        raise FileNotFoundError(f"Banco meteorológico não encontrado em: {CLIMA_DB}")

    conn = sqlite3.connect(FUTEBOL_DB)
    # Anexa o banco de clima de forma segura
    clima_path_escaped = CLIMA_DB.replace("\\", "/")
    conn.execute(f"ATTACH DATABASE '{clima_path_escaped}' AS clima;")
    return conn

def executar_consulta(sql, params=None):
    """Executa qualquer query SQL cruzando futebol e clima e retorna um DataFrame Pandas"""
    conn = conectar_bancos_cruzados()
    try:
        df = pd.read_sql_query(sql, conn, params=params)
        return df
    finally:
        conn.close()

# ==============================================================================
# Exemplos Prontos de Combinações Inusitadas
# ==============================================================================

def analise_clube_por_temperatura(clube="Corinthians"):
    """Compara o aproveitamento do clube no calor (>=28°C) vs clima ameno/frio (<=21°C)"""
    sql = """
    SELECT 
        p.id_partida,
        p.data,
        p.mandante,
        p.visitante,
        p.placar,
        p.vencedor,
        c.temperatura_max,
        c.precipitacao_mm,
        c.condicao,
        CASE 
            WHEN p.mandante LIKE ? AND p.vencedor LIKE ? THEN 'Vitoria Mandante'
            WHEN p.visitante LIKE ? AND p.vencedor LIKE ? THEN 'Vitoria Visitante'
            WHEN p.vencedor = 'Empate' THEN 'Empate'
            ELSE 'Derrota'
        END AS resultado_clube,
        CASE 
            WHEN c.temperatura_max >= 28.0 THEN 'Calor (>=28°C)'
            WHEN c.temperatura_max <= 21.0 THEN 'Frio/Ameno (<=21°C)'
            ELSE 'Moderado (22-27°C)'
        END AS faixa_temperatura
    FROM partidas p
    JOIN clima.clima_diario c 
      ON p.data = c.data AND p.estado = c.estado
    WHERE (p.mandante LIKE ? OR p.visitante LIKE ?)
      AND c.temperatura_max IS NOT NULL;
    """
    param = f"%{clube}%"
    df = executar_consulta(sql, [param, param, param, param, param, param])
    return df

def analise_arbitros_e_chuva(min_jogos=10):
    """Descobre quais árbitros aplicam mais cartões em dias com chuva vs tempo seco"""
    sql = """
    SELECT 
        p.arbitro,
        COUNT(DISTINCT p.id_partida) AS total_jogos,
        SUM(CASE WHEN c.precipitacao_mm >= 5.0 THEN 1 ELSE 0 END) AS jogos_com_chuva,
        SUM(CASE WHEN c.precipitacao_mm < 1.0 THEN 1 ELSE 0 END) AS jogos_secos,
        ROUND(AVG(cartoes_por_jogo.total_cartoes), 2) AS media_cartoes_geral
    FROM partidas p
    JOIN clima.clima_diario c 
      ON p.data = c.data AND p.estado = c.estado
    LEFT JOIN (
        SELECT id_partida, COUNT(*) AS total_cartoes 
        FROM cartoes 
        GROUP BY id_partida
    ) cartoes_por_jogo ON p.id_partida = cartoes_por_jogo.id_partida
    WHERE p.arbitro IS NOT NULL 
      AND p.arbitro != 'Não informado'
    GROUP BY p.arbitro
    HAVING total_jogos >= ?
    ORDER BY total_jogos DESC;
    """
    return executar_consulta(sql, [min_jogos])

def analise_artilheiros_sob_calor(min_gols=5):
    """Identifica quais atletas mais marcam gols em dias de calor intenso"""
    sql = """
    SELECT 
        g.atleta,
        g.clube,
        COUNT(*) AS total_gols_no_calor,
        ROUND(AVG(c.temperatura_max), 1) AS temp_max_media
    FROM gols g
    JOIN partidas p ON g.id_partida = p.id_partida
    JOIN clima.clima_diario c ON p.data = c.data AND p.estado = c.estado
    WHERE c.temperatura_max >= 28.0
    GROUP BY g.atleta, g.clube
    HAVING total_gols_no_calor >= ?
    ORDER BY total_gols_no_calor DESC;
    """
    return executar_consulta(sql, [min_gols])

if __name__ == "__main__":
    print("Módulo de Consultas Cruzadas pronto para uso.")
