#!/usr/bin/env python3
"""
FutStats — Auditoria de Cobertura do Golden Dataset e SLA de Completude (Desafio 25).
Avalia o subconjunto prioritário (20 clubes, período 2000-2026 e histórico 1902-2026)
e persiste as métricas de completude na tabela canônica 'cobertura_entidade'.
"""

import sqlite3
import json
from datetime import datetime

DB_PATH = 'data/futebol.db'

# 20 Clubes Canônicos do Golden Dataset
GOLDEN_CLUBES_20 = [
    'Flamengo', 'Palmeiras', 'São Paulo', 'Santos', 'Corinthians',
    'Vasco', 'Fluminense', 'Botafogo', 'Grêmio', 'Internacional',
    'Cruzeiro', 'Atlético-MG', 'Athletico-PR', 'Bahia', 'Fortaleza',
    'Coritiba', 'Sport', 'Ceará', 'Goiás', 'Vitória'
]

def auditar_golden_dataset():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    # 1. Garantir existência da tabela cobertura_entidade
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS cobertura_entidade (
      entidade TEXT NOT NULL,
      escopo TEXT NOT NULL,
      total_registros INTEGER NOT NULL,
      registros_completos INTEGER NOT NULL,
      percentual_completo REAL NOT NULL,
      ultima_auditoria TEXT NOT NULL,
      PRIMARY KEY (entidade, escopo)
    );
    """)

    agora = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    relatorio = {}

    # 2. SLA Clubes (Golden vs Total)
    total_clubes_golden = len(GOLDEN_CLUBES_20)
    placeholders = ",".join(["?"] * total_clubes_golden)
    clubes_completos_golden = cursor.execute(f"""
        SELECT count(*) FROM dim_clube 
        WHERE nome IN ({placeholders}) 
          AND nome IS NOT NULL AND estado IS NOT NULL AND fundacao IS NOT NULL
    """, GOLDEN_CLUBES_20).fetchone()[0]

    pct_clubes_golden = round((clubes_completos_golden / total_clubes_golden) * 100, 2)
    relatorio['clubes_golden'] = {
        'total': total_clubes_golden,
        'completos': clubes_completos_golden,
        'pct': pct_clubes_golden
    }
    cursor.execute("""
        INSERT OR REPLACE INTO cobertura_entidade VALUES ('Clube', 'Golden 20 Clubes', ?, ?, ?, ?)
    """, (total_clubes_golden, clubes_completos_golden, pct_clubes_golden, agora))

    # 3. SLA Atletas (Nome, Posição, Clube)
    total_atletas = cursor.execute("SELECT count(*) FROM jogadores").fetchone()[0]
    atletas_completos = cursor.execute("""
        SELECT count(*) FROM jogadores 
        WHERE nome_exibicao IS NOT NULL AND nome_exibicao != ''
          AND posicao IS NOT NULL AND posicao != ''
          AND clubes IS NOT NULL AND clubes != ''
    """).fetchone()[0]
    pct_atletas = round((atletas_completos / total_atletas) * 100, 2)
    relatorio['atletas'] = {
        'total': total_atletas,
        'completos': atletas_completos,
        'pct': pct_atletas
    }
    cursor.execute("""
        INSERT OR REPLACE INTO cobertura_entidade VALUES ('Atleta', 'Geral Acervo', ?, ?, ?, ?)
    """, (total_atletas, atletas_completos, pct_atletas, agora))

    # 4. SLA Técnicos (Mínimo de 30 partidas)
    tecnicos_30_mais = cursor.execute("""
        SELECT count(*) FROM (
            SELECT tec, sum(jogos) as tot FROM (
                SELECT tecnico_mandante as tec, count(*) as jogos FROM partidas WHERE tecnico_mandante != '' GROUP BY tecnico_mandante
                UNION ALL
                SELECT tecnico_visitante as tec, count(*) as jogos FROM partidas WHERE tecnico_visitante != '' GROUP BY tecnico_visitante
            ) GROUP BY tec HAVING tot >= 30
        )
    """).fetchone()[0]
    tecnicos_30_completos = cursor.execute("""
        SELECT count(*) FROM dim_tecnico dt
        WHERE dt.nome_exibicao IN (
            SELECT tec FROM (
                SELECT tecnico_mandante as tec, count(*) as jogos FROM partidas WHERE tecnico_mandante != '' GROUP BY tecnico_mandante
                UNION ALL
                SELECT tecnico_visitante as tec, count(*) as jogos FROM partidas WHERE tecnico_visitante != '' GROUP BY tecnico_visitante
            ) GROUP BY tec HAVING sum(jogos) >= 30
        ) AND dt.pais IS NOT NULL
    """).fetchone()[0]
    pct_tecnicos = round((tecnicos_30_completos / max(1, tecnicos_30_mais)) * 100, 2)
    relatorio['tecnicos_golden'] = {
        'total_30_jogos': tecnicos_30_mais,
        'completos': tecnicos_30_completos,
        'pct': pct_tecnicos
    }
    cursor.execute("""
        INSERT OR REPLACE INTO cobertura_entidade VALUES ('Técnico', 'Golden (>= 30 jogos)', ?, ?, ?, ?)
    """, (tecnicos_30_mais, tecnicos_30_completos, pct_tecnicos, agora))

    # 5. SLA Árbitros (Mínimo de 50 partidas)
    arbitros_50_mais = cursor.execute("""
        SELECT count(*) FROM (
            SELECT arbitro, count(*) as jogos 
            FROM partidas 
            WHERE arbitro IS NOT NULL AND arbitro != '' 
            GROUP BY arbitro 
            HAVING jogos >= 50
        )
    """).fetchone()[0]
    arbitros_50_completos = cursor.execute("""
        SELECT count(*) FROM dim_arbitro da
        WHERE da.nome_exibicao IN (
            SELECT arbitro FROM partidas WHERE arbitro != '' GROUP BY arbitro HAVING count(*) >= 50
        ) AND da.nome_exibicao IS NOT NULL
    """).fetchone()[0]
    pct_arbitros = round((arbitros_50_completos / max(1, arbitros_50_mais)) * 100, 2)
    relatorio['arbitros_golden'] = {
        'total_50_jogos': arbitros_50_mais,
        'completos': arbitros_50_completos,
        'pct': pct_arbitros
    }
    cursor.execute("""
        INSERT OR REPLACE INTO cobertura_entidade VALUES ('Árbitro', 'Golden (>= 50 jogos)', ?, ?, ?, ?)
    """, (arbitros_50_mais, arbitros_50_completos, pct_arbitros, agora))

    # 6. Partidas no Período Analítico (2000-2026)
    partidas_analiticas = cursor.execute("""
        SELECT count(*) FROM partidas WHERE ano >= 2000
    """).fetchone()[0]
    partidas_analiticas_completas = cursor.execute("""
        SELECT count(*) FROM partidas 
        WHERE ano >= 2000
          AND data IS NOT NULL AND campeonato IS NOT NULL 
          AND mandante IS NOT NULL AND visitante IS NOT NULL 
          AND gols_mandante IS NOT NULL AND gols_visitante IS NOT NULL
          AND (estadio IS NOT NULL AND estadio != '')
    """).fetchone()[0]
    pct_partidas_analiticas = round((partidas_analiticas_completas / partidas_analiticas) * 100, 2)
    relatorio['partidas_analiticas_2000_2026'] = {
        'total': partidas_analiticas,
        'completas': partidas_analiticas_completas,
        'pct': pct_partidas_analiticas
    }
    cursor.execute("""
        INSERT OR REPLACE INTO cobertura_entidade VALUES ('Partida', 'Analítico (2000-2026)', ?, ?, ?, ?)
    """, (partidas_analiticas, partidas_analiticas_completas, pct_partidas_analiticas, agora))

    # 7. Partidas no Período Secular Completo (1902-2026)
    partidas_total = cursor.execute("SELECT count(*) FROM partidas").fetchone()[0]
    partidas_total_completas = cursor.execute("""
        SELECT count(*) FROM partidas 
        WHERE data IS NOT NULL AND campeonato IS NOT NULL 
          AND mandante IS NOT NULL AND visitante IS NOT NULL 
          AND gols_mandante IS NOT NULL AND gols_visitante IS NOT NULL
    """).fetchone()[0]
    pct_partidas_total = round((partidas_total_completas / partidas_total) * 100, 2)
    relatorio['partidas_historicas_1902_2026'] = {
        'total': partidas_total,
        'completas': partidas_total_completas,
        'pct': pct_partidas_total
    }
    cursor.execute("""
        INSERT OR REPLACE INTO cobertura_entidade VALUES ('Partida', 'Histórico Secular (1902-2026)', ?, ?, ?, ?)
    """, (partidas_total, partidas_total_completas, pct_partidas_total, agora))

    # 8. Pergunta Estratégica 2: Partidas com Clima, Estádio e Técnico simultaneamente completos
    # Verificar se há tabela de clima ou colunas de clima em estatisticas_partidas
    cols_estat = cursor.execute("PRAGMA table_info(estatisticas_partidas);").fetchall()
    cols_estat_nomes = [c[1] for c in cols_estat]
    tem_clima = 'temperatura' in cols_estat_nomes or 'clima' in cols_estat_nomes

    partidas_contexto_triplo = cursor.execute("""
        SELECT count(*) FROM partidas p
        WHERE p.estadio IS NOT NULL AND p.estadio != ''
          AND ((p.tecnico_mandante IS NOT NULL AND p.tecnico_mandante != '') 
               OR (p.tecnico_visitante IS NOT NULL AND p.tecnico_visitante != ''))
    """).fetchone()[0]

    relatorio['contexto_triplo'] = {
        'partidas_com_estadio_e_tecnico': partidas_contexto_triplo,
        'total_partidas': partidas_total,
        'pct_estadio_tecnico': round((partidas_contexto_triplo / partidas_total) * 100, 2),
        'clima_disponivel_telemetria': tem_clima
    }

    conn.commit()
    conn.close()

    print(json.dumps(relatorio, indent=2, ensure_ascii=False))
    return relatorio

if __name__ == '__main__':
    auditar_golden_dataset()
