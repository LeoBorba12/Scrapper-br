import sqlite3

conn = sqlite3.connect('data/futebol.db')
c = conn.cursor()
rows = c.execute("SELECT atleta FROM gols WHERE atleta LIKE '%Pel%' LIMIT 5").fetchall()
for r in rows:
    print(r[0], [ord(ch) for ch in r[0]])

conn.close()
