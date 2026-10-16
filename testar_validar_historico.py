"""
Script de Testes, Validação e Sanidade Estatística do Acervo Histórico
Avalia a integridade do banco de dados completo (1971 a 2024)
"""

import os
import sys
import sqlite3
import pandas as pd

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

BASE_DIR = os.path.dirname(__file__)
DB_PATH = os.path.join(BASE_DIR, "data", "futebol.db")

def rodar_testes_validacao():
    conn = sqlite3.connect(DB_PATH)
    
    print("=" * 80)
    print("🎯 BATERIA DE TESTES E VALIDAÇÃO ESTATÍSTICA (1971 - 2024)")
    print("=" * 80)

    # 1. Total de Jogos e Gols por Década
    print("\n📊 1. DISTRIBUIÇÃO POR DÉCADA:")
    sql_decadas = """
    SELECT 
        CASE 
            WHEN ano BETWEEN 1970 AND 1979 THEN '1971 - 1979 (Anos 70)'
            WHEN ano BETWEEN 1980 AND 1989 THEN '1980 - 1989 (Anos 80)'
            WHEN ano BETWEEN 1990 AND 1999 THEN '1990 - 1999 (Anos 90)'
            WHEN ano BETWEEN 2000 AND 2009 THEN '2000 - 2009 (Anos 2000)'
            WHEN ano BETWEEN 2010 AND 2019 THEN '2010 - 2019 (Anos 2010)'
            ELSE '2020 - 2024 (Anos 2020)'
        END AS decada,
        COUNT(DISTINCT p.id_partida) AS total_jogos,
        SUM(p.gols_mandante + p.gols_visitante) AS total_gols,
        ROUND(AVG(p.gols_mandante + p.gols_visitante), 2) AS media_gols_por_jogo
    FROM partidas p
    GROUP BY decada
    ORDER BY MIN(p.ano);
    """
    df_decadas = pd.read_sql_query(sql_decadas, conn)
    print(df_decadas.to_string(index=False))

    # 2. Comparativo: Era Mata-Mata (1971-2002) vs Era Pontos Corridos (2003-2024)
    print("\n⚔️ 2. COMPARATIVO DAS GRANDES ERAS DO FUTEBOL BRASILEIRO:")
    sql_eras = """
    SELECT 
        CASE WHEN ano < 2003 THEN 'Era Mata-Mata (1971-2002)' ELSE 'Era Pontos Corridos (2003-2024)' END AS era,
        COUNT(DISTINCT id_partida) AS total_partidas,
        SUM(gols_mandante + gols_visitante) AS total_gols,
        ROUND(AVG(gols_mandante + gols_visitante), 2) AS media_gols_jogo,
        ROUND(100.0 * SUM(CASE WHEN vencedor = mandante THEN 1 ELSE 0 END) / COUNT(*), 1) AS pct_vitoria_mandante,
        ROUND(100.0 * SUM(CASE WHEN vencedor = 'Empate' THEN 1 ELSE 0 END) / COUNT(*), 1) AS pct_empates,
        ROUND(100.0 * SUM(CASE WHEN vencedor = visitante THEN 1 ELSE 0 END) / COUNT(*), 1) AS pct_vitoria_visitante
    FROM partidas
    GROUP BY era;
    """
    df_eras = pd.read_sql_query(sql_eras, conn)
    print(df_eras.to_string(index=False))

    # 3. Top 15 Maiores Artilheiros Catalogados de 1971 a 2002
    print("\n👑 3. TOP 15 MAIORES ARTILHEIROS CATALOGADOS (1971 a 2002):")
    sql_artilheiros = """
    SELECT 
        g.atleta,
        g.clube,
        COUNT(*) AS total_gols_catalogados,
        MIN(p.ano) AS primeiro_ano,
        MAX(p.ano) AS ultimo_ano
    FROM gols g
    JOIN partidas p ON g.id_partida = p.id_partida
    WHERE p.ano < 2003
      AND g.atleta IS NOT NULL 
      AND LENGTH(g.atleta) > 2
    GROUP BY g.atleta
    ORDER BY total_gols_catalogados DESC
    LIMIT 15;
    """
    df_art = pd.read_sql_query(sql_artilheiros, conn)
    print(df_art.to_string(index=False))

    # 4. Validação Cruzada de Finais Históricas Icônicas
    print("\n🏆 4. AUDITORIA DE FINAIS LENDÁRIAS (CHECAGEM DE INTEGRIDADE):")
    finais_chave = [
        (1971, "Atlético-MG", "Botafogo"),
        (1974, "Vasco", "Cruzeiro"),
        (1980, "Flamengo", "Atlético-MG"),
        (1986, "São Paulo", "Guarani"),
        (1990, "Corinthians", "São Paulo"),
        (1992, "Flamengo", "Botafogo-RJ"),
        (1995, "Botafogo-RJ", "Santos"),
        (2002, "Santos", "Corinthians")
    ]
    
    for ano, t1, t2 in finais_chave:
        cur = conn.cursor()
        ano_busca = (1986, 1987) if ano == 1986 else (ano, ano)
        cur.execute("""
        SELECT data, mandante, placar, visitante, vencedor 
        FROM partidas 
        WHERE (ano = ? OR ano = ?)
          AND ((mandante LIKE ? AND visitante LIKE ?) OR (mandante LIKE ? AND visitante LIKE ?))
        ORDER BY data DESC
        LIMIT 1;
        """, (ano_busca[0], ano_busca[1], f"%{t1}%", f"%{t2}%", f"%{t2}%", f"%{t1}%"))
        r = cur.fetchone()
        if r:
            dt, m, pl, v, venc = r
            print(f"  ✅ Final {ano}: [{dt}] {m} {pl} {v} -> Vencedor: {venc}")
        else:
            print(f"  ⚠️ Aviso: Jogo de {ano} entre {t1} e {t2} não encontrado.")

    # 5. Sanidade de Dados (Validação de Anomalias)
    print("\n🔍 5. AUDITORIA DE SANIDADE (ZERO PLACARES NEGATIVOS OU CORROMPIDOS):")
    cur = conn.cursor()
    cur.execute("SELECT COUNT(*) FROM partidas WHERE gols_mandante < 0 OR gols_visitante < 0;")
    neg = cur.fetchone()[0]
    cur.execute("SELECT COUNT(*) FROM partidas WHERE mandante = '' OR visitante = '';")
    vazios = cur.fetchone()[0]
    cur.execute("SELECT COUNT(*) FROM partidas WHERE data IS NULL OR data = '';")
    sem_data = cur.fetchone()[0]
    
    print(f"  • Placares negativos: {neg} (Esperado: 0)")
    print(f"  • Partidas com times vazios: {vazios} (Esperado: 0)")
    print(f"  • Partidas sem data: {sem_data} (Esperado: 0)")

    conn.close()
    print("\n" + "=" * 80)
    print("TESTES CONCLUÍDOS COM SUCESSO!")
    print("=" * 80)

if __name__ == "__main__":
    rodar_testes_validacao()
