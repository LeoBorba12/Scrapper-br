import sqlite3

conn = sqlite3.connect('data/futebol.db')
c = conn.cursor()

c.execute("""
    SELECT p.campeonato, COUNT(g.id_gol)
    FROM partidas p
    JOIN gols g ON p.id_partida = g.id_partida
    WHERE p.ano BETWEEN 2003 AND 2018
    GROUP BY p.campeonato
""")
for r in c.fetchall():
    print(r)

conn.close()
