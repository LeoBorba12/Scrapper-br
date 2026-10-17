import sqlite3

conn = sqlite3.connect('data/futebol.db')
c = conn.cursor()

print("Top 30 Artilheiros:")
for row in c.execute("SELECT atleta, COUNT(*) as g FROM gols GROUP BY atleta ORDER BY g DESC LIMIT 30").fetchall():
    clubs = [r[0] for r in c.execute("SELECT DISTINCT clube FROM gols WHERE atleta = ?", (row[0],)).fetchall()]
    print(f"  {row[0]} ({', '.join(clubs[:3])}): {row[1]} gols")

conn.close()
