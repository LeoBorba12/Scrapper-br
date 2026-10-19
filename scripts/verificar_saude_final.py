import sqlite3

conn = sqlite3.connect('data/futebol.db')
c = conn.cursor()

c.execute("SELECT COUNT(*) FROM partidas WHERE mandante LIKE '% - %' OR visitante LIKE '% - %'")
print("Partidas restantes com ' - ':", c.fetchone()[0])

c.execute("SELECT COUNT(*) FROM partidas WHERE mandante GLOB '[A-Z] *' OR visitante GLOB '[A-Z] *'")
print("Partidas restantes com '[A-Z] *':", c.fetchone()[0])

c.execute("SELECT COUNT(*) FROM partidas WHERE mandante = visitante")
print("Partidas restantes com mandante = visitante:", c.fetchone()[0])

c.execute("SELECT COUNT(*) FROM gols WHERE id_partida NOT IN (SELECT id_partida FROM partidas)")
print("Gols órfãos:", c.fetchone()[0])

c.execute("SELECT COUNT(*) FROM cartoes WHERE id_partida NOT IN (SELECT id_partida FROM partidas)")
print("Cartões órfãos:", c.fetchone()[0])

conn.close()
