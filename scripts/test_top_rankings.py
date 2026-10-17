import sqlite3

conn = sqlite3.connect('data/futebol.db')
c = conn.cursor()

# 1. Test top
top_gols = c.execute("""
    SELECT atleta, GROUP_CONCAT(DISTINCT clube) as clubes, COUNT(*) as total_gols
    FROM gols
    WHERE atleta NOT LIKE '%(%' AND atleta NOT LIKE '% e %'
    GROUP BY atleta
    ORDER BY total_gols DESC
    LIMIT 10;
""").fetchall()
print("Top 10 Gols:")
for r in top_gols:
    print(r)

top_amarelos = c.execute("""
    SELECT atleta, GROUP_CONCAT(DISTINCT clube) as clubes, COUNT(*) as total
    FROM cartoes
    WHERE cartao LIKE '%Amarelo%'
    GROUP BY atleta
    ORDER BY total DESC
    LIMIT 10;
""").fetchall()
print("\nTop 10 Amarelos:")
for r in top_amarelos:
    print(r)

top_vermelhos = c.execute("""
    SELECT atleta, GROUP_CONCAT(DISTINCT clube) as clubes, COUNT(*) as total
    FROM cartoes
    WHERE cartao LIKE '%Vermelho%'
    GROUP BY atleta
    ORDER BY total DESC
    LIMIT 10;
""").fetchall()
print("\nTop 10 Vermelhos:")
for r in top_vermelhos:
    print(r)

conn.close()
