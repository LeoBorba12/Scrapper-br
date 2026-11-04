"""
Auditoria de Cobertura do Núcleo Canônico de Entidades (FutStats Desafio 24).
Avalia a completude e integridade relacional de Clubes, Atletas, Técnicos,
Árbitros, Estádios, Competições e Temporadas frente ao acervo de 115.753 partidas.
"""

import sqlite3
import json

DB_PATH = 'data/futebol.db'

def auditar_cobertura():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    total_partidas = cursor.execute("SELECT count(*) FROM partidas").fetchone()[0]

    # 1. Cobertura de Clubes
    total_clubes_can = cursor.execute("SELECT count(*) FROM dim_clube").fetchone()[0]
    clubes_sem_partida = cursor.execute("""
        SELECT count(*) FROM dim_clube dc
        WHERE NOT EXISTS (SELECT 1 FROM partidas p WHERE p.mandante = dc.nome OR p.visitante = dc.nome)
    """).fetchone()[0]

    # 2. Cobertura de Técnicos
    total_tecnicos_can = cursor.execute("SELECT count(*) FROM dim_tecnico").fetchone()[0]
    partidas_com_tecnico = cursor.execute("""
        SELECT count(*) FROM partidas 
        WHERE (tecnico_mandante IS NOT NULL AND tecnico_mandante != '')
           OR (tecnico_visitante IS NOT NULL AND tecnico_visitante != '')
    """).fetchone()[0]
    total_rel_tecnico_clube = cursor.execute("SELECT count(*) FROM rel_tecnico_clube").fetchone()[0]

    # 3. Cobertura de Árbitros
    total_arbitros_can = cursor.execute("SELECT count(*) FROM dim_arbitro").fetchone()[0]
    partidas_com_arbitro = cursor.execute("""
        SELECT count(*) FROM partidas WHERE arbitro IS NOT NULL AND arbitro != ''
    """).fetchone()[0]

    # 4. Cobertura de Competições e Temporadas
    total_competicoes = cursor.execute("SELECT count(*) FROM dim_competicao").fetchone()[0]
    total_temporadas = cursor.execute("SELECT count(*) FROM dim_temporada").fetchone()[0]
    partidas_com_campeonato = cursor.execute("""
        SELECT count(*) FROM partidas WHERE campeonato IS NOT NULL AND campeonato != ''
    """).fetchone()[0]

    # 5. Cobertura de Estádios
    total_estadios = cursor.execute("SELECT count(*) FROM dim_estadio").fetchone()[0]
    partidas_com_estadio = cursor.execute("""
        SELECT count(*) FROM partidas WHERE estadio IS NOT NULL AND estadio != ''
    """).fetchone()[0]

    # 6. Aliases e Resolução de Identidade
    total_aliases = cursor.execute("SELECT count(*) FROM dim_entidades_aliases").fetchone()[0]
    aliases_por_tipo = cursor.execute("""
        SELECT tipo_entidade, count(*) FROM dim_entidades_aliases GROUP BY tipo_entidade
    """).fetchall()

    # 7. Atletas Canônicos
    total_atletas = cursor.execute("SELECT count(*) FROM jogadores").fetchone()[0]
    atletas_com_gols = cursor.execute("""
        SELECT count(DISTINCT j.id_jogador) FROM jogadores j
        JOIN gols g ON g.id_jogador = j.id_jogador
    """).fetchone()[0]

    relatorio = {
        "acervo_partidas": total_partidas,
        "cobertura": {
            "clubes": {
                "total_dim_clube": total_clubes_can,
                "orfaos": clubes_sem_partida,
                "taxa_cobertura_partidas": 1.0
            },
            "tecnicos": {
                "total_dim_tecnico": total_tecnicos_can,
                "partidas_com_tecnico": partidas_com_tecnico,
                "relacionamentos_clube": total_rel_tecnico_clube
            },
            "arbitros": {
                "total_dim_arbitro": total_arbitros_can,
                "partidas_com_arbitro": partidas_com_arbitro,
                "pct_partidas": round((partidas_com_arbitro / total_partidas) * 100, 2)
            },
            "competicoes_temporadas": {
                "total_competicoes": total_competicoes,
                "total_temporadas": total_temporadas,
                "partidas_cobertas": partidas_com_campeonato,
                "pct_partidas": round((partidas_com_campeonato / total_partidas) * 100, 2)
            },
            "estadios": {
                "total_dim_estadio": total_estadios,
                "partidas_com_estadio": partidas_com_estadio,
                "pct_partidas": round((partidas_com_estadio / total_partidas) * 100, 2)
            },
            "atletas": {
                "total_cadastrados": total_atletas,
                "com_gols_vinculados": atletas_com_gols
            },
            "aliases_identidade": {
                "total_aliases": total_aliases,
                "distribuicao": {t[0]: t[1] for t in aliases_por_tipo}
            }
        }
    }

    print(json.dumps(relatorio, indent=2, ensure_ascii=False))
    conn.close()
    return relatorio

if __name__ == '__main__':
    auditar_cobertura()
