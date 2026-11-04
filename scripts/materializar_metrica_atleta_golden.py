#!/usr/bin/env python3
"""
FutStats — Materialização Analítica do Golden Dataset (Desafio 26).
Calcula e materializa:
- Gols por 90 = (gols / minutos) * 90
- Titularidade % = (titularidades / jogos) * 100
- Dependência ofensiva = (gols atleta / gols totais do clube)
- Regra de corte de amostra mínima (< 270 min = 0, >= 270 min = 1)
"""

import sqlite3
import os
from datetime import datetime

DB_PATH = 'data/futebol.db'

def materializar_metricas():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("PRAGMA foreign_keys = OFF;")
    cursor.execute("PRAGMA journal_mode = DELETE;")

    print("[1/5] Preparando dimensões canônicas (dim_clube, dim_atleta, dim_competicao)...")
    # 1. Garantir suporte a nome_exibicao em dim_clube
    cols_clube = [c[1] for c in cursor.execute("PRAGMA table_info(dim_clube)").fetchall()]
    if 'nome_exibicao' not in cols_clube:
        cursor.execute("ALTER TABLE dim_clube ADD COLUMN nome_exibicao TEXT;")
        cursor.execute("UPDATE dim_clube SET nome_exibicao = nome;")
    else:
        cursor.execute("UPDATE dim_clube SET nome_exibicao = nome WHERE nome_exibicao IS NULL;")

    # Inserir aliases para Athletico-PR e Atlético-MG
    cursor.execute("""
        INSERT OR IGNORE INTO dim_entidades_aliases (tipo_entidade, entidade_id, alias_nome, fonte)
        VALUES 
            ('clube', 324, 'Athletico Paranaense', 'manual'),
            ('clube', 414, 'Atlético Mineiro', 'manual'),
            ('clube', 414, 'Atlético-MG', 'canonica'),
            ('clube', 324, 'Athletico-PR', 'canonica')
    """)

    # 2. Garantir que todo atleta em estatisticas_atletas_temporada exista em jogadores
    atletas_estat = cursor.execute("""
        SELECT DISTINCT id_jogador, atleta, clube, posicao 
        FROM estatisticas_atletas_temporada
    """).fetchall()

    for ogol_id, nome, clube, pos in atletas_estat:
        # Checar se já existe por ogol_id ou nome
        row = cursor.execute("""
            SELECT id_jogador FROM jogadores 
            WHERE ogol_id = ? OR id_jogador = ? OR nome_exibicao = ?
        """, (ogol_id, ogol_id, nome)).fetchone()
        if not row:
            cursor.execute("""
                INSERT INTO jogadores (ogol_id, nome_exibicao, posicao, clubes)
                VALUES (?, ?, ?, ?)
            """, (ogol_id, nome, pos or 'Atacante', clube))
            novo_id = cursor.lastrowid
            cursor.execute("""
                INSERT OR IGNORE INTO dim_entidades_aliases (tipo_entidade, entidade_id, alias_nome, fonte)
                VALUES ('atleta', ?, ?, 'canonica')
            """, (novo_id, nome))

    # 3. Criar ou recriar view dim_atleta
    cursor.execute("DROP VIEW IF EXISTS dim_atleta;")
    cursor.execute("""
        CREATE VIEW dim_atleta AS
        SELECT 
            id_jogador AS atleta_id,
            nome_exibicao,
            nome_completo,
            apelido,
            posicao,
            clubes
        FROM jogadores;
    """)

    print("[2/5] Criando tabela metrica_atleta_golden...")
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS metrica_atleta_golden (
        atleta_id INTEGER NOT NULL,
        clube_id INTEGER NOT NULL,
        competicao_id INTEGER NOT NULL,
        periodo TEXT NOT NULL,

        jogos INTEGER NOT NULL,
        titularidades INTEGER NOT NULL,
        minutos INTEGER NOT NULL,
        gols INTEGER NOT NULL,
        assistencias INTEGER,
        cartoes_amarelos INTEGER NOT NULL,
        cartoes_vermelhos INTEGER NOT NULL,

        gols_por_90 REAL,
        titularidade_pct REAL,
        dependencia_ofensiva REAL,

        amostra_minima INTEGER NOT NULL,
        calculado_em TEXT NOT NULL,

        PRIMARY KEY (atleta_id, clube_id, competicao_id, periodo)
    );
    """)

    print("[3/5] Calculando métricas avançadas (Gols/90, Titularidade %, Dependência Ofensiva)...")
    cursor.execute("DELETE FROM metrica_atleta_golden;")

    registros = cursor.execute("""
        SELECT 
            id_jogador,
            atleta,
            clube,
            campeonato,
            ano,
            jogos,
            minutos,
            gols,
            assistencias,
            amarelos,
            vermelhos
        FROM estatisticas_atletas_temporada
    """).fetchall()

    print(f" -> {len(registros)} registros a processar...")
    agora = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    cache_gols_clube = {}
    cache_clubes = {}
    cache_competicoes = {}
    cache_atletas = {}

    inseridos = 0
    for r in registros:
        raw_id, atleta_nome, clube_nome, camp_nome, ano, jogos, minutos, gols, assists, amarelos, vermelhos = r
        minutos = minutos or 0
        jogos = jogos or 0
        gols = gols or 0
        assists = assists or 0
        amarelos = amarelos or 0
        vermelhos = vermelhos or 0
        periodo = str(ano)

        # 1. Resolver atleta_id canônico
        if raw_id not in cache_atletas:
            row_a = cursor.execute("""
                SELECT id_jogador FROM jogadores 
                WHERE ogol_id = ? OR id_jogador = ? OR nome_exibicao = ?
            """, (raw_id, raw_id, atleta_nome)).fetchone()
            cache_atletas[raw_id] = row_a[0] if row_a else raw_id
        
        atleta_id = cache_atletas[raw_id]

        # 2. Resolver clube_id
        if clube_nome not in cache_clubes:
            res_c = cursor.execute("SELECT clube_id FROM dim_clube WHERE nome = ?", (clube_nome,)).fetchone()
            if not res_c:
                res_c = cursor.execute("""
                    SELECT entidade_id FROM dim_entidades_aliases 
                    WHERE tipo_entidade = 'clube' AND alias_nome = ? COLLATE NOCASE
                """, (clube_nome,)).fetchone()
            cache_clubes[clube_nome] = res_c[0] if res_c else None
        
        clube_id = cache_clubes[clube_nome]
        if not clube_id:
            continue

        # 3. Resolver competicao_id
        if camp_nome not in cache_competicoes:
            res_comp = cursor.execute("SELECT competicao_id FROM dim_competicao WHERE nome = ?", (camp_nome,)).fetchone()
            if not res_comp:
                cursor.execute("INSERT OR IGNORE INTO dim_competicao (nome, tipo) VALUES (?, 'Nacional')", (camp_nome,))
                res_comp = cursor.execute("SELECT competicao_id FROM dim_competicao WHERE nome = ?", (camp_nome,)).fetchone()
            cache_competicoes[camp_nome] = res_comp[0] if res_comp else 1
        
        competicao_id = cache_competicoes[camp_nome]

        # 4. Titularidades
        titularidades_reais = cursor.execute("""
            SELECT count(*) FROM escalacoes e
            JOIN partidas p ON p.id_partida = e.id_partida
            WHERE e.id_jogador = ? AND p.ano = ? AND e.titular = 1
        """, (atleta_id, ano)).fetchone()[0]

        if titularidades_reais > 0:
            titularidades = min(jogos, titularidades_reais)
        else:
            minutos_por_jogo = (minutos / jogos) if jogos > 0 else 0
            if minutos_por_jogo >= 65:
                titularidades = round(jogos * (minutos / (jogos * 90.0)))
                titularidades = min(jogos, max(1, titularidades))
            else:
                titularidades = round(jogos * 0.3)
                titularidades = min(jogos, max(0, titularidades))

        # 5. Gols por 90
        gols_por_90 = round((gols / float(minutos)) * 90.0, 4) if minutos > 0 else 0.0

        # 6. Titularidade %
        titularidade_pct = round((titularidades / float(jogos)) * 100.0, 2) if jogos > 0 else 0.0

        # 7. Dependência Ofensiva
        chave_gc = (clube_nome, ano)
        if chave_gc not in cache_gols_clube:
            gols_tot_c = cursor.execute("""
                SELECT 
                    SUM(CASE WHEN mandante = ? THEN gols_mandante WHEN visitante = ? THEN gols_visitante ELSE 0 END)
                FROM partidas
                WHERE (mandante = ? OR visitante = ?) AND ano = ?
            """, (clube_nome, clube_nome, clube_nome, clube_nome, ano)).fetchone()[0]

            if not gols_tot_c:
                nome_can = cursor.execute("SELECT nome FROM dim_clube WHERE clube_id = ?", (clube_id,)).fetchone()[0]
                gols_tot_c = cursor.execute("""
                    SELECT 
                        SUM(CASE WHEN mandante = ? THEN gols_mandante WHEN visitante = ? THEN gols_visitante ELSE 0 END)
                    FROM partidas
                    WHERE (mandante = ? OR visitante = ?) AND ano = ?
                """, (nome_can, nome_can, nome_can, nome_can, ano)).fetchone()[0]

            cache_gols_clube[chave_gc] = gols_tot_c or 0

        gols_clube_totais = cache_gols_clube[chave_gc]
        if gols_clube_totais and gols_clube_totais > 0:
            dependencia_ofensiva = round(gols / float(gols_clube_totais), 4)
        else:
            dependencia_ofensiva = 0.0

        # 8. Amostra mínima (< 270 min = 0, >= 270 min = 1)
        amostra_minima = 1 if minutos >= 270 else 0

        cursor.execute("""
            INSERT OR REPLACE INTO metrica_atleta_golden (
                atleta_id, clube_id, competicao_id, periodo,
                jogos, titularidades, minutos, gols, assistencias,
                cartoes_amarelos, cartoes_vermelhos,
                gols_por_90, titularidade_pct, dependencia_ofensiva,
                amostra_minima, calculado_em
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            atleta_id, clube_id, competicao_id, periodo,
            jogos, titularidades, minutos, gols, assists,
            amarelos, vermelhos,
            gols_por_90, titularidade_pct, dependencia_ofensiva,
            amostra_minima, agora
        ))
        inseridos += 1

    conn.commit()
    print(f" -> {inseridos} registros inseridos com sucesso!")

    print("\n[4/5] Executando consulta editorial oficial:")
    query_editorial = """
    SELECT
      a.nome_exibicao AS atleta,
      cl.nome_exibicao AS clube,
      comp.nome AS competicao,
      m.jogos,
      m.titularidades,
      m.minutos,
      m.gols,
      ROUND(m.gols_por_90, 2) AS gols_por_90,
      ROUND(m.titularidade_pct, 1) AS titularidade_pct,
      ROUND(m.dependencia_ofensiva, 3) AS dependencia_ofensiva
    FROM metrica_atleta_golden m
    JOIN dim_atleta a ON a.atleta_id = m.atleta_id
    JOIN dim_clube cl ON cl.clube_id = m.clube_id
    JOIN dim_competicao comp ON comp.competicao_id = m.competicao_id
    WHERE m.amostra_minima = 1
    ORDER BY m.gols_por_90 DESC
    LIMIT 10;
    """

    res_editorial = cursor.execute(query_editorial).fetchall()
    for idx, r in enumerate(res_editorial, 1):
        print(f" {idx:2d}. {r[0]:<20} | {r[1]:<16} | Gols: {r[6]:2d} | Min: {r[5]:4d} | Gols/90: {r[7]:.2f} | Titular: {r[8]}% | Dep. Ofensiva: {r[9]:.3f}")

    print("\n[5/5] Finalizando e otimizando banco...")
    cursor.execute("PRAGMA optimize;")
    conn.close()

    size_mb = os.path.getsize(DB_PATH) / (1024 * 1024)
    print(f"Tamanho final do futebol.db: {size_mb:.2f} MB")

if __name__ == '__main__':
    materializar_metricas()
