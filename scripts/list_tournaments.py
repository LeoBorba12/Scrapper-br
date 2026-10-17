import sqlite3

conn = sqlite3.connect('data/futebol.db')
cursor = conn.cursor()

cursor.execute("SELECT DISTINCT campeonato, COUNT(*) FROM partidas GROUP BY campeonato ORDER BY COUNT(*) DESC")
for c, cnt in cursor.fetchall():
    print(f"{c:<40} | {cnt} partidas")

conn.close()
