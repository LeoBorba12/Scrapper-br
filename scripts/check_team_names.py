import sqlite3

conn = sqlite3.connect('data/futebol.db')
c = conn.cursor()

c.execute("SELECT DISTINCT mandante FROM partidas WHERE mandante LIKE '%tl%tico%' AND campeonato LIKE '%rie B%'")
print("Atlético names in Série B:", c.fetchall())

c.execute("SELECT DISTINCT mandante FROM partidas WHERE mandante LIKE '%Am%rica%' AND campeonato LIKE '%rie B%'")
print("América names in Série B:", c.fetchall())
