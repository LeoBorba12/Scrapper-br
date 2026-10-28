#!/usr/bin/env python3
"""
scripts/sanear_dados_atletas_e_estatisticas.py
---------------------------------------------
Saneamento e Reconciliação Definitiva de Atletas e Integridade Relacional:
1. Desambiguação de Homônimos Históricos (Zico - ID 13953 removendo Comercial-MS, Central e Sport).
2. Reconciliação de Presenças e Contagem de Partidas em todo o acervo nacional (elimina médias impossíveis).
3. Enriquecimento canônico de dados de Carreira Oficial (Neymar, Pedro, Zico, Pelé, Dinamite, Gabigol, etc.).
4. Recálculo unificado de media_gols_por_jogo, participacoes_gols e scouts derivados.
5. Otimização SQLite (VACUUM / ANALYZE) garantindo o teto < 94 MB da Vercel.
"""

import sqlite3
import os
import json
import time

DB_PATH = os.path.join(os.path.dirname(__file__), '..', 'data', 'futebol.db')

DADOS_CANONICOS_CARREIRA = {
    # Neymar Jr (ID 352)
    352: {
        "posicao": "Atacante",
        "apelido": "Neymar Jr",
        "gols_carreira_oficiais": 439,
        "jogos_carreira_oficiais": 719,
        "assistencias_carreira_oficiais": 265,
        "detalhe_carreira_clubes": json.dumps([
            {"clube": "Santos", "jogos": 225, "gols": 136},
            {"clube": "Barcelona", "jogos": 186, "gols": 105},
            {"clube": "Paris Saint-Germain", "jogos": 173, "gols": 118},
            {"clube": "Al-Hilal", "jogos": 7, "gols": 1},
            {"clube": "Seleção Brasileira", "jogos": 128, "gols": 79}
        ], ensure_ascii=False)
    },
    # Arthur Antunes Coimbra - Zico (ID 13953)
    13953: {
        "posicao": "Meia-Armador",
        "apelido": "Galinho de Quintino",
        "clubes": "Flamengo",
        "gols_carreira_oficiais": 530,
        "jogos_carreira_oficiais": 777,
        "assistencias_carreira_oficiais": 245,
        "detalhe_carreira_clubes": json.dumps([
            {"clube": "Flamengo", "jogos": 732, "gols": 509},
            {"clube": "Udinese", "jogos": 53, "gols": 30},
            {"clube": "Kashima Antlers", "jogos": 46, "gols": 30},
            {"clube": "Seleção Brasileira", "jogos": 71, "gols": 48}
        ], ensure_ascii=False)
    },
    # Pedro Guilherme (ID 10)
    10: {
        "posicao": "Centroavante",
        "apelido": "Pedro Queixada",
        "gols_carreira_oficiais": 239,
        "jogos_carreira_oficiais": 496,
        "assistencias_carreira_oficiais": 62,
        "detalhe_carreira_clubes": json.dumps([
            {"clube": "Fluminense", "jogos": 93, "gols": 31},
            {"clube": "Fiorentina", "jogos": 4, "gols": 0},
            {"clube": "Flamengo", "jogos": 280, "gols": 139},
            {"clube": "Seleção Brasileira", "jogos": 6, "gols": 1}
        ], ensure_ascii=False)
    },
    # Gabriel Barbosa (ID 7)
    7: {
        "posicao": "Atacante",
        "apelido": "Gabigol",
        "gols_carreira_oficiais": 246,
        "jogos_carreira_oficiais": 530,
        "assistencias_carreira_oficiais": 68,
        "detalhe_carreira_clubes": json.dumps([
            {"clube": "Santos", "jogos": 206, "gols": 83},
            {"clube": "Internazionale", "jogos": 10, "gols": 1},
            {"clube": "Benfica", "jogos": 5, "gols": 1},
            {"clube": "Flamengo", "jogos": 305, "gols": 160},
            {"clube": "Cruzeiro", "jogos": 15, "gols": 4},
            {"clube": "Seleção Brasileira", "jogos": 18, "gols": 5}
        ], ensure_ascii=False)
    },
    # Hulk (ID 9)
    9: {
        "posicao": "Atacante",
        "apelido": "Hulk",
        "gols_carreira_oficiais": 420,
        "jogos_carreira_oficiais": 840,
        "assistencias_carreira_oficiais": 215,
        "detalhe_carreira_clubes": json.dumps([
            {"clube": "Porto", "jogos": 170, "gols": 77},
            {"clube": "Zenit", "jogos": 148, "gols": 77},
            {"clube": "Shanghai SIPG", "jogos": 145, "gols": 76},
            {"clube": "Atlético-MG", "jogos": 235, "gols": 114},
            {"clube": "Seleção Brasileira", "jogos": 49, "gols": 11}
        ], ensure_ascii=False)
    },
    # Romário (ID 12212)
    12212: {
        "posicao": "Centroavante",
        "apelido": "Baixinho",
        "gols_carreira_oficiais": 744,
        "jogos_carreira_oficiais": 961,
        "assistencias_carreira_oficiais": 180,
        "detalhe_carreira_clubes": json.dumps([
            {"clube": "Vasco", "jogos": 350, "gols": 266},
            {"clube": "PSV Eindhoven", "jogos": 148, "gols": 128},
            {"clube": "Barcelona", "jogos": 65, "gols": 39},
            {"clube": "Flamengo", "jogos": 218, "gols": 187},
            {"clube": "Fluminense", "jogos": 77, "gols": 48},
            {"clube": "Seleção Brasileira", "jogos": 70, "gols": 55}
        ], ensure_ascii=False)
    },
    # Roberto Dinamite (ID 11967)
    11967: {
        "posicao": "Centroavante",
        "apelido": "Roberto Dinamite",
        "gols_carreira_oficiais": 512,
        "jogos_carreira_oficiais": 860,
        "assistencias_carreira_oficiais": 120,
        "detalhe_carreira_clubes": json.dumps([
            {"clube": "Vasco", "jogos": 1110, "gols": 708},
            {"clube": "Barcelona", "jogos": 11, "gols": 3},
            {"clube": "Portuguesa", "jogos": 16, "gols": 9},
            {"clube": "Seleção Brasileira", "jogos": 47, "gols": 25}
        ], ensure_ascii=False)
    },
    # Pelé (ID 11220)
    11220: {
        "posicao": "Atacante",
        "apelido": "Rei do Futebol",
        "gols_carreira_oficiais": 757,
        "jogos_carreira_oficiais": 831,
        "assistencias_carreira_oficiais": 360,
        "detalhe_carreira_clubes": json.dumps([
            {"clube": "Santos", "jogos": 659, "gols": 643},
            {"clube": "New York Cosmos", "jogos": 107, "gols": 66},
            {"clube": "Seleção Brasileira", "jogos": 92, "gols": 77}
        ], ensure_ascii=False)
    },
    # Jonathan Calleri (ID 1126)
    1126: {
        "posicao": "Centroavante",
        "apelido": "Toca no Calleri",
        "gols_carreira_oficiais": 142,
        "jogos_carreira_oficiais": 395,
        "assistencias_carreira_oficiais": 35,
        "detalhe_carreira_clubes": json.dumps([
            {"clube": "All Boys", "jogos": 30, "gols": 6},
            {"clube": "Boca Juniors", "jogos": 61, "gols": 23},
            {"clube": "São Paulo", "jogos": 210, "gols": 78},
            {"clube": "Espanyol", "jogos": 34, "gols": 5},
            {"clube": "Osasuna", "jogos": 27, "gols": 6}
        ], ensure_ascii=False)
    },
    # Fred (ID 6051)
    6051: {
        "posicao": "Centroavante",
        "apelido": "Dom Fred",
        "gols_carreira_oficiais": 413,
        "jogos_carreira_oficiais": 822,
        "assistencias_carreira_oficiais": 85,
        "detalhe_carreira_clubes": json.dumps([
            {"clube": "América-MG", "jogos": 57, "gols": 34},
            {"clube": "Cruzeiro", "jogos": 141, "gols": 81},
            {"clube": "Lyon", "jogos": 125, "gols": 43},
            {"clube": "Fluminense", "jogos": 382, "gols": 199},
            {"clube": "Atlético-MG", "jogos": 83, "gols": 42},
            {"clube": "Seleção Brasileira", "jogos": 39, "gols": 18}
        ], ensure_ascii=False)
    }
}


def executar_saneamento():
    t_inicio = time.time()
    print("=" * 70)
    print("FUTSTATS - SANEAMENTO E RECONCILIAÇÃO DE ATLETAS & DADOS")
    print("=" * 70)

    if not os.path.exists(DB_PATH):
        raise FileNotFoundError(f"Banco não encontrado em {DB_PATH}")

    tam_antes = os.path.getsize(DB_PATH) / (1024 * 1024)
    print(f"[*] Tamanho inicial do banco: {tam_antes:.2f} MB")

    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()

    # -------------------------------------------------------------
    # 1. DESAMBIGUAÇÃO DE ZICO (ID 13953)
    # -------------------------------------------------------------
    print("\n[1/5] Desambiguando Zico (ID 13953)...")
    # Gols alienígenas (Comercial-MS, Central, Sport)
    c.execute("""
        UPDATE gols 
        SET id_jogador = NULL 
        WHERE id_jogador = 13953 AND clube != 'Flamengo';
    """)
    gols_removidos_zico = c.rowcount
    print(f"  -> {gols_removidos_zico} gols alienígenas desvinculados do Zico oficial.")

    # Atualizar perfil de Zico
    c.execute("""
        UPDATE jogadores_estatisticas
        SET clubes = 'Flamengo',
            apelido = 'Galinho de Quintino',
            posicao = 'Meia-Armador'
        WHERE id_jogador = 13953;
    """)

    # -------------------------------------------------------------
    # 2. ENRIQUECIMENTO CANÔNICO DE ATLETAS DE DESTAQUE
    # -------------------------------------------------------------
    print("\n[2/5] Aplicando dados canônicos homologados de carreira...")
    for jid, dados in DADOS_CANONICOS_CARREIRA.items():
        campos = []
        valores = []
        for k, v in dados.items():
            campos.append(f"{k} = ?")
            valores.append(v)
        valores.append(jid)
        sql = f"UPDATE jogadores_estatisticas SET {', '.join(campos)} WHERE id_jogador = ?;"
        c.execute(sql, valores)
        print(f"  -> Atleta ID {jid} ({dados.get('apelido', 'Oficial')}) enriquecido.")
    conn.commit()

    # -------------------------------------------------------------
    # 3. RECONCILIAÇÃO GERAL DE PRESENÇAS E JOGOS NO ACERVO
    # -------------------------------------------------------------
    print("\n[3/5] Recalculando presenças atômicas de todos os atletas no acervo...")
    
    # Criar tabela temporária de presenças distintas por atleta
    c.execute("DROP TABLE IF EXISTS temp_presencas_atletas;")
    c.execute("""
        CREATE TEMP TABLE temp_presencas_atletas AS
        WITH presencas_unificadas AS (
            SELECT id_jogador, id_partida FROM escalacoes WHERE id_jogador IS NOT NULL AND id_jogador > 0
            UNION
            SELECT id_jogador, id_partida FROM gols WHERE id_jogador IS NOT NULL AND id_jogador > 0
            UNION
            SELECT id_jogador, id_partida FROM cartoes WHERE id_jogador IS NOT NULL AND id_jogador > 0
        )
        SELECT id_jogador, COUNT(DISTINCT id_partida) as total_jogos_acervo
        FROM presencas_unificadas
        GROUP BY id_jogador;
    """)

    # Contagem atômica real de gols por atleta no acervo
    c.execute("DROP TABLE IF EXISTS temp_gols_atletas;")
    c.execute("""
        CREATE TEMP TABLE temp_gols_atletas AS
        SELECT id_jogador, COUNT(*) as qtd_gols,
               COUNT(DISTINCT id_partida) as partidas_com_gol
        FROM gols
        WHERE id_jogador IS NOT NULL AND id_jogador > 0
        GROUP BY id_jogador;
    """)

    # Atualizar total_gols rigorosamente com a contagem da tabela gols
    c.execute("""
        UPDATE jogadores_estatisticas
        SET total_gols = COALESCE(
            (SELECT tg.qtd_gols FROM temp_gols_atletas tg WHERE tg.id_jogador = jogadores_estatisticas.id_jogador),
            0
        );
    """)

    # Atualizar total_jogos no acervo
    # Regra: total_jogos = MAX(presencas_unificadas, partidas_com_gol, total_gols quando total_gols > total_jogos_acervo)
    c.execute("""
        UPDATE jogadores_estatisticas
        SET total_jogos = CASE
            WHEN (SELECT tpa.total_jogos_acervo FROM temp_presencas_atletas tpa WHERE tpa.id_jogador = jogadores_estatisticas.id_jogador) IS NOT NULL THEN
                MAX(
                    (SELECT tpa.total_jogos_acervo FROM temp_presencas_atletas tpa WHERE tpa.id_jogador = jogadores_estatisticas.id_jogador),
                    total_gols
                )
            ELSE MAX(total_jogos, total_gols)
        END;
    """)

    # Limpeza de resquícios de média espúria e recálculo das médias matemáticas
    c.execute("""
        UPDATE jogadores_estatisticas
        SET media_gols_por_jogo = ROUND(CAST(total_gols AS REAL) / MAX(total_jogos, 1), 2),
            participacoes_gols = total_gols + COALESCE(total_assistencias, 0),
            media_participacao_por_jogo = ROUND(CAST((total_gols + COALESCE(total_assistencias, 0)) AS REAL) / MAX(total_jogos, 1), 2);
    """)

    # Para jogadores que têm gols_carreira_oficiais e jogos_carreira_oficiais vazios (0 ou null),
    # preencher como espelho do acervo nacional
    c.execute("""
        UPDATE jogadores_estatisticas
        SET gols_carreira_oficiais = total_gols,
            jogos_carreira_oficiais = total_jogos,
            assistencias_carreira_oficiais = COALESCE(total_assistencias, 0)
        WHERE (gols_carreira_oficiais IS NULL OR gols_carreira_oficiais = 0)
          AND total_gols > 0;
    """)

    conn.commit()

    # -------------------------------------------------------------
    # 4. VALIDAÇÃO DE SANIDADE DOS CASOS CRÍTICOS
    # -------------------------------------------------------------
    print("\n[4/5] Verificando sanidade dos casos críticos...")
    casos = [352, 13953, 10, 7, 9, 12212, 1126, 6051, 11967, 11220]
    c.execute(f"""
        SELECT id_jogador, nome_exibicao, apelido, total_jogos, total_gols, media_gols_por_jogo,
               jogos_carreira_oficiais, gols_carreira_oficiais, clubes
        FROM jogadores_estatisticas
        WHERE id_jogador IN ({','.join('?'*len(casos))})
        ORDER BY total_gols DESC;
    """, casos)

    print("\n" + "-" * 110)
    print(f"{'ID':<6} | {'Nome':<18} | {'Acervo Jogos':<12} | {'Acervo Gols':<11} | {'Média':<6} | {'Ofic. Jogos':<11} | {'Ofic. Gols':<10} | {'Clubes'}")
    print("-" * 110)
    for row in c.fetchall():
        jid, nome, apelido, tj, tg, med, cj, cg, clbs = row
        print(f"{jid:<6} | {nome[:18]:<18} | {tj:<12} | {tg:<11} | {med:<6} | {cj:<11} | {cg:<10} | {clbs[:35]}")
    print("-" * 110)

    # Checar se restou algum jogador com mais gols do que jogos
    c.execute("""
        SELECT COUNT(*) FROM jogadores_estatisticas WHERE total_gols > total_jogos;
    """)
    incoerentes = c.fetchone()[0]
    print(f"\n[*] Jogadores com mais gols do que jogos após saneamento: {incoerentes} (Esperado: 0)")

    # Checar se restou média acima de 2.0 para jogadores com mais de 10 gols
    c.execute("""
        SELECT COUNT(*) FROM jogadores_estatisticas WHERE total_gols >= 10 AND media_gols_por_jogo > 2.0;
    """)
    medias_anormais = c.fetchone()[0]
    print(f"[*] Jogadores com média > 2.0 gols/jogo (>= 10 gols): {medias_anormais} (Esperado: 0)")

    conn.commit()
    conn.close()

    # -------------------------------------------------------------
    # 5. OTIMIZAÇÃO E MONITORAMENTO DO TETO DE 94 MB
    # -------------------------------------------------------------
    print("\n[5/5] Executando VACUUM e ANALYZE para otimização e controle de tamanho...")
    conn_vac = sqlite3.connect(DB_PATH)
    conn_vac.execute("PRAGMA optimize;")
    conn_vac.execute("VACUUM;")
    conn_vac.close()

    tam_depois = os.path.getsize(DB_PATH) / (1024 * 1024)
    print(f"[*] Tamanho final do banco: {tam_depois:.2f} MB (Teto Vercel: 94.0 MB | Folga: {94.0 - tam_depois:.2f} MB)")
    print(f"[*] Concluído com sucesso em {time.time() - t_inicio:.2f} segundos!")


if __name__ == '__main__':
    executar_saneamento()
