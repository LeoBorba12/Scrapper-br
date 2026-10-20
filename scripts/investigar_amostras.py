import sqlite3

conn = sqlite3.connect('data/futebol.db')
c = conn.cursor()

print("SAMPLE Campeonato Brasileiro (2003+):")
c.execute("""
    SELECT id_partida, data, ano, campeonato, mandante, visitante, placar
    FROM partidas
    WHERE campeonato = 'Campeonato Brasileiro' AND ano >= 2003
    LIMIT 5
""")
for r in c.fetchall():
    print(r)

print("\nSAMPLE Campeonato Brasileiro - Série A (2003+):")
c.execute("""
    SELECT id_partida, data, ano, campeonato, mandante, visitante, placar
    FROM partidas
    WHERE campeonato = 'Campeonato Brasileiro - Série A' AND ano >= 2003
    LIMIT 5
""")
for r in c.fetchall():
    print(r)

print("\nCONTAGEM POR ANO EM CADA UM:")
c.execute("""
    SELECT ano,
           SUM(CASE WHEN campeonato = 'Campeonato Brasileiro' THEN 1 ELSE 0 END) as cb,
           SUM(CASE WHEN campeonato = 'Campeonato Brasileiro - Série A' THEN 1 ELSE 0 END) as cb_sa
    FROM partidas
    WHERE ano >= 2000
    GROUP BY ano
    ORDER BY ano
""")
for r in c.fetchall():
    print(r)

conn.close()
