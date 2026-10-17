import sqlite3

conn = sqlite3.connect('data/futebol.db')
c = conn.cursor()

print("Gols com Gabriel:")
for row in c.execute("SELECT atleta, clube, COUNT(*) FROM gols WHERE atleta LIKE '%Gabriel%' GROUP BY atleta, clube ORDER BY COUNT(*) DESC LIMIT 10").fetchall():
    print(" ", row)

print("\nGols com Gabigol:")
for row in c.execute("SELECT atleta, clube, COUNT(*) FROM gols WHERE atleta LIKE '%Gabigol%' GROUP BY atleta, clube ORDER BY COUNT(*) DESC LIMIT 10").fetchall():
    print(" ", row)

conn.close()
