import sqlite3

conn = sqlite3.connect('data/futebol.db')
cursor = conn.cursor()

# Check distinct values of tipo_de_gol
cursor.execute("SELECT DISTINCT tipo_de_gol, COUNT(*) FROM gols GROUP BY tipo_de_gol")
print("Tipos de gol:", cursor.fetchall())

# Check distinct cartao types
cursor.execute("SELECT DISTINCT cartao, COUNT(*) FROM cartoes GROUP BY cartao")
print("Tipos de cartão:", cursor.fetchall())

# Check if there are other columns or tables
cursor.execute("SELECT sql FROM sqlite_master WHERE type='table'")
for s in cursor.fetchall():
    print(s[0])

conn.close()
