import sqlite3

conn = sqlite3.connect('data/futebol.db')
c = conn.cursor()

c.execute("""
    SELECT p.ano, COUNT(g.id_gol)
    FROM partidas p
    JOIN gols g ON p.id_partida = g.id_partida
    GROUP BY p.ano
    ORDER BY p.ano
""")
rows = c.fetchall()
print("Gols por ano nas partidas:")
for r in rows:
    print(r)

conn.close()
