import sqlite3

conn = sqlite3.connect('data/futebol.db')
cursor = conn.cursor()

cursor.execute("""
    SELECT DISTINCT campeonato, COUNT(*) 
    FROM partidas 
    WHERE mandante = 'Atlético' OR visitante = 'Atlético'
    GROUP BY campeonato
""")
for r in cursor.fetchall():
    print(r)

cursor.execute("""
    SELECT data, mandante, visitante, placar, campeonato 
    FROM partidas 
    WHERE mandante = 'Atlético' OR visitante = 'Atlético'
    LIMIT 10
""")
for r in cursor.fetchall():
    print(r)

conn.close()
