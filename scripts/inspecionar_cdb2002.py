import sqlite3

conn = sqlite3.connect('data/futebol.db')
c = conn.cursor()

c.execute("""
    SELECT id_partida, data, placar, mandante, visitante, gols_mandante, gols_visitante
    FROM partidas
    WHERE id_partida BETWEEN 20025001 AND 20025050
""")
for r in c.fetchall():
    print(r)

conn.close()
