import sqlite3

conn = sqlite3.connect('data/futebol.db')
c = conn.cursor()

c.execute("""
    SELECT id_partida, data, mandante, visitante, placar
    FROM partidas
    WHERE (mandante LIKE '% - %' AND LENGTH(TRIM(visitante)) = 2)
       OR (visitante LIKE '% - %' AND LENGTH(TRIM(mandante)) = 2)
""")
rows = c.fetchall()
print(f"Total de partidas no padrão 'TimeA - TimeB' vs UF: {len(rows)}")
for r in rows[:15]:
    print(r)

conn.close()
