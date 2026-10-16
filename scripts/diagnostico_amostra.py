import sqlite3
import sys

sys.stdout.reconfigure(encoding='utf-8')
conn = sqlite3.connect('data/futebol.db')
cursor = conn.cursor()

print('--- MUNDIAL FIFA ---')
cursor.execute("SELECT id_partida, data, mandante, visitante, placar, campeonato, fase FROM partidas WHERE campeonato LIKE '%FIFA%';")
for r in cursor.fetchall()[:10]:
    print(r)

print('\n--- BRASILEIRÃO 1980 ---')
cursor.execute("SELECT id_partida, data, mandante, visitante, placar, fase FROM partidas WHERE ano=1980 AND mandante LIKE '%Flamengo%' AND visitante LIKE '%Atlético%';")
for r in cursor.fetchall():
    print(r)

print('\n--- BRASILEIRÃO 1993 ---')
cursor.execute("SELECT id_partida, data, mandante, visitante, placar, fase FROM partidas WHERE ano=1993 AND mandante LIKE '%Palmeiras%';")
for r in cursor.fetchall():
    if 'Vit' in r[3] or 'vit' in r[3]:
        print(r)

print('\n--- RIO-SÃO PAULO 2002 ---')
cursor.execute("SELECT id_partida, data, mandante, visitante, placar, fase FROM partidas WHERE campeonato LIKE '%Rio-São Paulo%' AND ano=2002;")
for r in cursor.fetchall():
    if ('Corinthians' in r[2] or 'Corinthians' in r[3]) and ('São Paulo' in r[2] or 'São Paulo' in r[3]):
        print(r)

print('\n--- CARIOCA 2004 ---')
cursor.execute("SELECT id_partida, data, mandante, visitante, placar, fase FROM partidas WHERE campeonato='Campeonato Carioca' AND ano=2004 AND (mandante LIKE '%Flamengo%' OR visitante LIKE '%Flamengo%');")
for r in cursor.fetchall():
    print(r)

conn.close()
