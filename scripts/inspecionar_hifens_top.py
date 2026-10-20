import sqlite3

conn = sqlite3.connect('data/futebol.db')
c = conn.cursor()

c.execute("""
    SELECT id_partida, campeonato, ano, mandante, visitante, estadio
    FROM partidas
    WHERE mandante LIKE '% - %' OR visitante LIKE '% - %'
    LIMIT 40
""")
for r in c.fetchall():
    print(r)

conn.close()
