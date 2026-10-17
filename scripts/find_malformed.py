import sqlite3

conn = sqlite3.connect('data/futebol.db')
cursor = conn.cursor()

cursor.execute("""
    SELECT id_partida, data, mandante, visitante, placar, campeonato 
    FROM partidas 
    WHERE mandante LIKE '% - %' OR visitante LIKE '% - %'
""")
res = cursor.fetchall()
print(f"Total with ' - ': {len(res)}")
for r in res[:20]:
    print(r)

cursor.execute("""
    SELECT id_partida, data, mandante, visitante, placar, campeonato 
    FROM partidas 
    WHERE mandante GLOB '*[0-9][0-9]/[0-9][0-9]*' OR visitante GLOB '*[0-9][0-9]/[0-9][0-9]*'
""")
res2 = cursor.fetchall()
print(f"\nTotal with date in name: {len(res2)}")
for r in res2[:20]:
    print(r)

conn.close()
