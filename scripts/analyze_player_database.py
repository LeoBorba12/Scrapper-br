import sqlite3

conn = sqlite3.connect('data/futebol.db')
cursor = conn.cursor()

cursor.execute("SELECT COUNT(DISTINCT atleta) FROM gols WHERE atleta IS NOT NULL AND atleta != ''")
n_gols_players = cursor.fetchone()[0]

cursor.execute("SELECT COUNT(DISTINCT atleta) FROM cartoes WHERE atleta IS NOT NULL AND atleta != ''")
n_cartoes_players = cursor.fetchone()[0]

cursor.execute("SELECT COUNT(DISTINCT atleta) FROM escalacoes WHERE atleta IS NOT NULL AND atleta != ''")
n_esc_players = cursor.fetchone()[0]

print(f"Jogadores únicos em gols: {n_gols_players}")
print(f"Jogadores únicos em cartoes: {n_cartoes_players}")
print(f"Jogadores únicos em escalacoes: {n_esc_players}")

# Check top scorers
print("\nTop 15 maiores artilheiros no banco:")
cursor.execute("""
    SELECT atleta, COUNT(*) as total_gols, COUNT(DISTINCT clube) as clubes, GROUP_CONCAT(DISTINCT clube) 
    FROM gols 
    WHERE atleta IS NOT NULL AND atleta != ''
    GROUP BY atleta 
    ORDER BY total_gols DESC 
    LIMIT 15
""")
for r in cursor.fetchall():
    print(f"  {r[0]:<25} | {r[1]:<3} gols | {r[3]}")

# Check top card recipients
print("\nTop 15 jogadores com mais cartões:")
cursor.execute("""
    SELECT atleta, 
           COUNT(*) as total_cartoes,
           SUM(CASE WHEN cartao = 'Amarelo' THEN 1 ELSE 0 END) as amarelos,
           SUM(CASE WHEN cartao = 'Vermelho' THEN 1 ELSE 0 END) as vermelhos,
           GROUP_CONCAT(DISTINCT clube)
    FROM cartoes 
    WHERE atleta IS NOT NULL AND atleta != ''
    GROUP BY atleta 
    ORDER BY total_cartoes DESC 
    LIMIT 15
""")
for r in cursor.fetchall():
    print(f"  {r[0]:<25} | {r[1]:<3} cartões ({r[2]} A, {r[3]} V) | {r[4]}")

conn.close()
