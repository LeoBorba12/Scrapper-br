import sqlite3

con = sqlite3.connect('data/futebol.db')
cur = con.cursor()

print("--- ÍNDICES EXISTENTES ---")
cur.execute("SELECT name, tbl_name, sql FROM sqlite_master WHERE type='index'")
for r in cur.fetchall():
    print(r)

print("\n--- TESTE CONTAGEM RÁPIDA ---")
cur.execute("SELECT count(*) FROM gols")
print("Total gols:", cur.fetchone()[0])
cur.execute("SELECT count(*) FROM partidas")
print("Total partidas:", cur.fetchone()[0])
