import sqlite3

conn = sqlite3.connect('data/futebol.db')
c = conn.cursor()

print("Gols count:", c.execute("SELECT COUNT(*) FROM gols").fetchone()[0])
print("Unique scorers:", c.execute("SELECT COUNT(DISTINCT atleta) FROM gols").fetchone()[0])
print("\nTop 10 Artilheiros:")
for row in c.execute("SELECT atleta, COUNT(*) as g FROM gols GROUP BY atleta ORDER BY g DESC LIMIT 10").fetchall():
    print(f"  {row[0]}: {row[1]} gols")

print("\nCartoes count:", c.execute("SELECT COUNT(*) FROM cartoes").fetchone()[0])
print("\nTop 10 Cartões Amarelos:")
for row in c.execute("SELECT atleta, COUNT(*) as c FROM cartoes WHERE cartao LIKE '%Amarelo%' GROUP BY atleta ORDER BY c DESC LIMIT 10").fetchall():
    print(f"  {row[0]}: {row[1]} amarelos")

print("\nTop 10 Cartões Vermelhos:")
for row in c.execute("SELECT atleta, COUNT(*) as c FROM cartoes WHERE cartao LIKE '%Vermelho%' GROUP BY atleta ORDER BY c DESC LIMIT 10").fetchall():
    print(f"  {row[0]}: {row[1]} vermelhos")

print("\nEscalações count:", c.execute("SELECT COUNT(*) FROM escalacoes").fetchone()[0])
print("\nTop 10 Mais Escalados:")
for row in c.execute("SELECT atleta, COUNT(*) as j FROM escalacoes GROUP BY atleta ORDER BY j DESC LIMIT 10").fetchall():
    print(f"  {row[0]}: {row[1]} jogos")

conn.close()
