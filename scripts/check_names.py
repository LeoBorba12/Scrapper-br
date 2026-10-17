import sqlite3

conn = sqlite3.connect('data/futebol.db')
cursor = conn.cursor()

terms = ['Botafogo', 'Cuiab', 'Vasco', 'Gremio', 'Grêmio', 'Atlético', 'Atletico', 'Athletico', 'Bragantino', 'São Paulo', 'Sao Paulo']
for t in terms:
    cursor.execute("SELECT DISTINCT mandante FROM partidas WHERE mandante LIKE ?", (f"%{t}%",))
    m = [r[0] for r in cursor.fetchall()]
    print(f"{t}: {m}")

conn.close()
