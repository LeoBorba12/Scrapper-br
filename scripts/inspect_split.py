import sqlite3

conn = sqlite3.connect('data/futebol.db')
cursor = conn.cursor()

cursor.execute("""
    SELECT id_partida, data, mandante, visitante, placar, campeonato, rodada
    FROM partidas
    WHERE length(visitante) <= 3 OR length(mandante) <= 3 OR mandante LIKE '% - %' OR visitante LIKE '% - %'
""")
rows = cursor.fetchall()
print(f"Total rows with short names or ' - ': {len(rows)}")
for r in rows:
    print(r)

conn.close()
