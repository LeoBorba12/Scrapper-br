import sqlite3

conn = sqlite3.connect('data/futebol.db')
cursor = conn.cursor()

cursor.execute("""
    SELECT clube, SUM(total) as jogos FROM (
        SELECT mandante as clube, COUNT(*) as total FROM partidas GROUP BY mandante
        UNION ALL
        SELECT visitante as clube, COUNT(*) as total FROM partidas GROUP BY visitante
    )
    WHERE LENGTH(clube) > 2 
      AND clube NOT LIKE '%\t%' 
      AND clube NOT LIKE '% - %'
    GROUP BY clube
    ORDER BY jogos DESC
    LIMIT 40;
""")
for r in cursor.fetchall():
    print(f"{r[0]:<25} | {r[1]} jogos")

conn.close()
