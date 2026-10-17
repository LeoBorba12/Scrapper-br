import sqlite3

conn = sqlite3.connect('data/futebol.db')
c = conn.cursor()

for t in ['partidas', 'gols', 'cartoes', 'escalacoes']:
    cols = [col[1] for col in c.execute(f"PRAGMA table_info({t})").fetchall()]
    print(t, [col for col in cols if 'assist' in col.lower()])

conn.close()
