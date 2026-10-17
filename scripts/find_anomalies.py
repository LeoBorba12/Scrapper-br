import sqlite3

conn = sqlite3.connect('data/futebol.db')
cursor = conn.cursor()

# Find rows where mandante or visitante has date or '-' or weird prefixes
cursor.execute("""
    SELECT id_partida, data, mandante, visitante, placar, campeonato 
    FROM partidas 
    WHERE mandante LIKE '%/%' OR visitante LIKE '%/%' OR mandante LIKE '% - %' OR visitante LIKE '% - %'
    LIMIT 50
""")
anomalies = cursor.fetchall()
print(f"Total anomaly samples found: {len(anomalies)}")
for a in anomalies[:20]:
    print(a)

conn.close()
