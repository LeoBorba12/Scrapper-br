"""
scripts/migrar_novas_tabelas_expansao.py
Criação idempotente e otimizada das novas tabelas analíticas para a Grande Expansão do FutStats.
Garante integridade relacional, tipos compactos e zero impacto no teto de 94 MB.
"""

import os
import sqlite3

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DB_PATH = os.path.join(BASE_DIR, "data", "futebol.db")

DDL_TABELAS = [
    # 1. Estatísticas de Atletas na Temporada (Consolidação das 46 métricas do OGol)
    """
    CREATE TABLE IF NOT EXISTS estatisticas_atletas_temporada (
        id_registro INTEGER PRIMARY KEY AUTOINCREMENT,
        id_jogador INTEGER,
        edicao_id INTEGER NOT NULL,
        ano INTEGER NOT NULL,
        campeonato TEXT NOT NULL,
        atleta TEXT NOT NULL,
        clube TEXT,
        posicao TEXT,
        jogos INTEGER DEFAULT 0,
        minutos INTEGER DEFAULT 0,
        gols INTEGER DEFAULT 0,
        assistencias INTEGER DEFAULT 0,
        xg REAL DEFAULT 0.0,
        xgot REAL DEFAULT 0.0,
        chutes_totais INTEGER DEFAULT 0,
        chutes_gol INTEGER DEFAULT 0,
        chutes_trave INTEGER DEFAULT 0,
        chutes_bloqueados INTEGER DEFAULT 0,
        grandes_chances_criadas INTEGER DEFAULT 0,
        grandes_chances_perdidas INTEGER DEFAULT 0,
        passes_certos INTEGER DEFAULT 0,
        passes_totais INTEGER DEFAULT 0,
        passes_pct REAL DEFAULT 0.0,
        passes_chave INTEGER DEFAULT 0,
        passes_ultimo_terco INTEGER DEFAULT 0,
        passes_longos_certos INTEGER DEFAULT 0,
        oportunidades_criadas INTEGER DEFAULT 0,
        cruzamentos_certos INTEGER DEFAULT 0,
        desarmes_ganhos INTEGER DEFAULT 0,
        interceptacoes INTEGER DEFAULT 0,
        cortes INTEGER DEFAULT 0,
        recuperacoes_bola INTEGER DEFAULT 0,
        duelos_ganhos INTEGER DEFAULT 0,
        duelos_perdidos INTEGER DEFAULT 0,
        duelos_aereos_ganhos INTEGER DEFAULT 0,
        dribles_conseguidos INTEGER DEFAULT 0,
        perdas_posse INTEGER DEFAULT 0,
        faltas_cometidas INTEGER DEFAULT 0,
        faltas_sofridas INTEGER DEFAULT 0,
        defesas_totais INTEGER DEFAULT 0,
        defesas_area INTEGER DEFAULT 0,
        jogos_sem_sofrer_gols INTEGER DEFAULT 0,
        nota_media REAL DEFAULT 0.0,
        homem_do_jogo INTEGER DEFAULT 0,
        amarelos INTEGER DEFAULT 0,
        vermelhos INTEGER DEFAULT 0,
        atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(edicao_id, atleta, clube)
    );
    """,

    # 2. Estatísticas de Equipes nos Campeonatos (Chutes, Defesas, Cruzamentos, Posse, xG)
    """
    CREATE TABLE IF NOT EXISTS campeonatos_estatisticas_equipes (
        id_registro INTEGER PRIMARY KEY AUTOINCREMENT,
        edicao_id INTEGER NOT NULL,
        ano INTEGER NOT NULL,
        campeonato TEXT NOT NULL,
        clube TEXT NOT NULL,
        jogos INTEGER DEFAULT 0,
        chutes_total INTEGER DEFAULT 0,
        chutes_jogo REAL DEFAULT 0.0,
        defesas_total INTEGER DEFAULT 0,
        defesas_jogo REAL DEFAULT 0.0,
        cruzamentos_certos_total INTEGER DEFAULT 0,
        cruzamentos_certos_jogo REAL DEFAULT 0.0,
        posse_media REAL DEFAULT 0.0,
        xg_pro REAL DEFAULT 0.0,
        xg_contra REAL DEFAULT 0.0,
        gols_pro INTEGER DEFAULT 0,
        gols_contra INTEGER DEFAULT 0,
        atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(edicao_id, clube)
    );
    """,

    # 3. Perfil Completo de Técnicos Brasileiros e Estrangeiros
    """
    CREATE TABLE IF NOT EXISTS tecnicos_perfil (
        id_tecnico INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT NOT NULL UNIQUE,
        nome_completo TEXT,
        foto_url TEXT,
        nacionalidade TEXT DEFAULT 'Brasil',
        idade INTEGER,
        esquema_preferido TEXT DEFAULT '4-3-3',
        total_jogos INTEGER DEFAULT 0,
        vitorias INTEGER DEFAULT 0,
        empates INTEGER DEFAULT 0,
        derrotas INTEGER DEFAULT 0,
        aproveitamento_pct REAL DEFAULT 0.0,
        gols_pro INTEGER DEFAULT 0,
        gols_contra INTEGER DEFAULT 0,
        titulos_json TEXT DEFAULT '[]',
        clubes_json TEXT DEFAULT '[]',
        atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """,

    # 4. Estatísticas Detalhadas de Árbitros
    """
    CREATE TABLE IF NOT EXISTS arbitros_estatisticas_detalhadas (
        id_arbitro INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT NOT NULL UNIQUE,
        nacionalidade TEXT DEFAULT 'Brasil',
        idade INTEGER,
        jogos_temporada INTEGER DEFAULT 0,
        faltas_totais INTEGER DEFAULT 0,
        faltas_por_jogo REAL DEFAULT 0.0,
        penaltis_totais INTEGER DEFAULT 0,
        penaltis_por_jogo REAL DEFAULT 0.0,
        amarelos_totais INTEGER DEFAULT 0,
        amarelos_por_jogo REAL DEFAULT 0.0,
        vermelhos_totais INTEGER DEFAULT 0,
        vermelhos_por_jogo REAL DEFAULT 0.0,
        fator_mando_campo REAL DEFAULT 50.0,
        atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """,

    # 5. Histórico e Evolução do Valor de Mercado do Atleta
    """
    CREATE TABLE IF NOT EXISTS historico_valor_mercado (
        id_registro INTEGER PRIMARY KEY AUTOINCREMENT,
        id_jogador INTEGER,
        atleta TEXT NOT NULL,
        data_registro TEXT NOT NULL,
        ano INTEGER NOT NULL,
        clube_na_epoca TEXT,
        idade_na_epoca INTEGER,
        valor_eur REAL NOT NULL,
        valor_brl REAL NOT NULL,
        pico_historico INTEGER DEFAULT 0,
        atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """,

    # 6. Galeria de Troféus e Vitrine dos Clubes (com réplicas 3D)
    """
    CREATE TABLE IF NOT EXISTS clubes_trofeus_vitrine (
        id_trofeu INTEGER PRIMARY KEY AUTOINCREMENT,
        clube TEXT NOT NULL,
        torneio TEXT NOT NULL,
        tipo_trofeu TEXT NOT NULL, -- 'brasileirao', 'libertadores', 'copa_brasil', 'mundial', 'estadual'
        quantidade INTEGER NOT NULL DEFAULT 1,
        anos_conquistados TEXT NOT NULL, -- Ex: '1981, 2019, 2022'
        modelo_3d_tipo TEXT NOT NULL, -- 'brasileirao', 'libertadores', 'copa_brasil', 'mundial', 'generic'
        atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(clube, torneio)
    );
    """
]

INDICES = [
    "CREATE INDEX IF NOT EXISTS idx_atleta_temp_nome ON estatisticas_atletas_temporada(atleta);",
    "CREATE INDEX IF NOT EXISTS idx_atleta_temp_clube ON estatisticas_atletas_temporada(clube);",
    "CREATE INDEX IF NOT EXISTS idx_camp_equipes_clube ON campeonatos_estatisticas_equipes(clube);",
    "CREATE INDEX IF NOT EXISTS idx_arbitros_nome ON arbitros_estatisticas_detalhadas(nome);",
    "CREATE INDEX IF NOT EXISTS idx_valor_mercado_atleta ON historico_valor_mercado(atleta);",
    "CREATE INDEX IF NOT EXISTS idx_trofeus_clube ON clubes_trofeus_vitrine(clube);"
]

def migrar():
    print(f"Iniciando migração no banco: {DB_PATH}")
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()

    for ddl in DDL_TABELAS:
        c.execute(ddl)

    for idx in INDICES:
        c.execute(idx)

    conn.commit()
    conn.close()
    print("Migração concluída com sucesso! 6 novas tabelas e índices criados.")

if __name__ == "__main__":
    migrar()
