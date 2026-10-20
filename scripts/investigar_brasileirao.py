import sqlite3

conn = sqlite3.connect('data/futebol.db')
c = conn.cursor()

print("--- DISTRIBUIÇÃO DOS CAMPEONATOS BRASILEIROS ---")
c.execute("""
    SELECT campeonato, MIN(ano), MAX(ano), COUNT(*) 
    FROM partidas 
    WHERE campeonato LIKE '%Brasileir%' OR campeonato LIKE '%Série A%' 
    GROUP BY campeonato
""")
for row in c.fetchall():
    print(row)

print("\n--- GOLS POR CAMPEONATO ---")
c.execute("""
    SELECT p.campeonato, MIN(p.ano), MAX(p.ano), COUNT(g.id_gol)
    FROM partidas p
    LEFT JOIN gols g ON p.id_partida = g.id_partida
    WHERE p.campeonato LIKE '%Brasileir%' OR p.campeonato LIKE '%Série A%'
    GROUP BY p.campeonato
""")
for row in c.fetchall():
    print(row)

print("\n--- CARTOES POR CAMPEONATO ---")
c.execute("""
    SELECT p.campeonato, MIN(p.ano), MAX(p.ano), COUNT(ca.id_cartao)
    FROM partidas p
    LEFT JOIN cartoes ca ON p.id_partida = ca.id_partida
    WHERE p.campeonato LIKE '%Brasileir%' OR p.campeonato LIKE '%Série A%'
    GROUP BY p.campeonato
""")
for row in c.fetchall():
    print(row)

print("\n--- SOBREPOSIÇÃO DE DATAS ENTRE 'Campeonato Brasileiro' E 'Campeonato Brasileiro - Série A' ---")
c.execute("""
    SELECT p1.ano, COUNT(*)
    FROM partidas p1
    JOIN partidas p2 ON p1.data = p2.data 
        AND p1.mandante = p2.mandante 
        AND p1.visitante = p2.visitante
        AND p1.id_partida != p2.id_partida
    WHERE p1.campeonato = 'Campeonato Brasileiro' 
      AND p2.campeonato = 'Campeonato Brasileiro - Série A'
    GROUP BY p1.ano
""")
rows = c.fetchall()
print("Jogos duplicados exatamente no mesmo dia/times:", len(rows), rows[:10])

conn.close()
