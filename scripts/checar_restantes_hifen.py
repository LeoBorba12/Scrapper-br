import sqlite3

conn = sqlite3.connect('data/futebol.db')
c = conn.cursor()

c.execute("""
    SELECT id_partida, data, mandante, visitante, estadio
    FROM partidas
    WHERE (mandante LIKE '% - %' OR visitante LIKE '% - %')
      AND NOT (
        (mandante LIKE '% - %' AND LENGTH(TRIM(visitante)) = 2)
        OR (visitante LIKE '% - %' AND LENGTH(TRIM(mandante)) = 2)
      )
""")
rows = c.fetchall()
print(f"Restantes com ' - ': {len(rows)}")
for r in rows:
    print(r)

conn.close()
