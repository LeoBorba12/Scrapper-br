import sqlite3
import re
import os

DB_PATH = 'data/futebol.db'

def executar_query_segura(sql):
    # Validar se é somente leitura
    cleaned = sql.strip().upper()
    prohibited = ['DROP ', 'DELETE ', 'UPDATE ', 'INSERT ', 'ALTER ', 'CREATE ', 'ATTACH ', 'DETACH ', 'TRUNCATE ']
    for p in prohibited:
        if p in cleaned:
            raise ValueError(f"Comando proibido detectado: {p.strip()}. Apenas consultas SELECT são permitidas.")
            
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute("PRAGMA query_only = ON;")
    
    c.execute(sql)
    colunas = [d[0] for d in c.description] if c.description else []
    linhas = c.fetchall()
    conn.close()
    
    return colunas, linhas

# Teste 1: Aproveitamento Corinthians dias pares vs ímpares
sql_dias = """
SELECT 
    CASE WHEN CAST(strftime('%d', data) AS INT) % 2 = 0 THEN 'Dias Pares' ELSE 'Dias Ímpares' END as tipo_dia,
    COUNT(*) as total_jogos,
    SUM(CASE WHEN vencedor = 'Corinthians' THEN 1 ELSE 0 END) as vitorias,
    SUM(CASE WHEN vencedor = 'Empate' THEN 1 ELSE 0 END) as empates,
    SUM(CASE WHEN vencedor != 'Corinthians' AND vencedor != 'Empate' AND vencedor IS NOT NULL THEN 1 ELSE 0 END) as derrotas,
    ROUND(SUM(CASE WHEN vencedor = 'Corinthians' THEN 1.0 ELSE 0 END) * 100.0 / COUNT(*), 1) as pct_vitorias
FROM partidas
WHERE mandante LIKE '%Corinthians%' OR visitante LIKE '%Corinthians%'
GROUP BY tipo_dia;
"""

colunas, linhas = executar_query_segura(sql_dias)
print("Colunas:", colunas)
for r in linhas:
    print("Linha:", r)

# Teste 2: Gols nos acréscimos (45+ ou 90+)
sql_acrescimos = """
SELECT 
    clube,
    COUNT(*) as gols_acrescimos
FROM gols
WHERE (minuto LIKE '45+%' OR minuto LIKE '90+%' OR CAST(minuto AS INT) >= 90)
  AND clube IS NOT NULL
GROUP BY clube
ORDER BY gols_acrescimos DESC
LIMIT 5;
"""

colunas2, linhas2 = executar_query_segura(sql_acrescimos)
print("\nGols acréscimos top 5:", linhas2)
