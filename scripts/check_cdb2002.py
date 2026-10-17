import sqlite3

conn = sqlite3.connect('data/futebol.db')
cursor = conn.cursor()

cursor.execute("SELECT id_partida, data, mandante, visitante, placar FROM partidas WHERE campeonato = 'Copa do Brasil' AND substr(data, 1, 4) = '2002'")
rows = cursor.fetchall()
print(f"2002 Copa do Brasil total rows: {len(rows)}")
for r in rows[:20]:
    print(r)

conn.close()
