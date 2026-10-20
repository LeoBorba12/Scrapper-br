import sqlite3

conn = sqlite3.connect('data/futebol.db')
c = conn.cursor()

c.execute("""
    SELECT id_partida, campeonato, ano, mandante, visitante, estadio
    FROM partidas
    WHERE mandante LIKE '% - %' OR visitante LIKE '% - %'
""")
rows = c.fetchall()
print(f"Total de partidas com ' - ' no mandante ou visitante: {len(rows)}")
for r in rows:
    print(r)

conn.close()
