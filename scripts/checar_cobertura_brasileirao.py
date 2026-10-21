import sqlite3

con = sqlite3.connect('data/futebol.db')
cur = con.cursor()

cur.execute("""
    SELECT p.ano, count(distinct p.id_partida) as partidas, count(g.id_gol) as gols
    FROM partidas p
    LEFT JOIN gols g ON p.id_partida = g.id_partida
    WHERE p.campeonato LIKE '%Brasileir%' OR p.campeonato LIKE '%Taça Brasil%' OR p.campeonato LIKE '%Roberto Gomes Pedrosa%'
    GROUP BY p.ano
    ORDER BY p.ano
""")
rows = cur.fetchall()
print("Ano | Partidas | Gols na tabela gols")
for r in rows:
    print(f"{r[0]} | {r[1]} | {r[2]}")
