import sqlite3
import re

conn = sqlite3.connect('data/futebol.db')
cursor = conn.cursor()

cursor.execute("SELECT DISTINCT mandante FROM partidas UNION SELECT DISTINCT visitante FROM partidas")
all_teams = sorted([r[0] for r in cursor.fetchall() if r[0]])

print(f"Total distinct team names: {len(all_teams)}")

# Check Série A teams specifically
serie_a_keys = [
    'Flamengo', 'Palmeiras', 'Paulo', 'Corinthians', 'Fluminense', 'Botafogo', 'Vasco',
    'Grêmio', 'Gremio', 'Internacional', 'Atlético', 'Atletico', 'Athletico', 'Cruzeiro',
    'Bahia', 'Fortaleza', 'Vitória', 'Vitoria', 'Juventude', 'Cuiab', 'Crici', 'Bragan'
]

variants = {}
for k in serie_a_keys:
    matches = [t for t in all_teams if k.lower() in t.lower()]
    variants[k] = matches

for k, m in variants.items():
    print(f"\n--- {k} ---")
    for name in m:
        # count how many matches
        cursor.execute("SELECT COUNT(*) FROM partidas WHERE mandante = ? OR visitante = ?", (name, name))
        cnt = cursor.fetchone()[0]
        print(f"  '{name}': {cnt} partidas")

conn.close()
