import sqlite3
import time
import sys
import os

db_path = 'data/futebol.db'
conn = sqlite3.connect(db_path)
c = conn.cursor()

# Test 1: Novela
t0 = time.time()
datas_novelas = "'2012-10-21', '2014-02-02', '2015-03-15', '2017-10-22', '2018-05-13', '2019-11-24', '2022-10-10', '2024-01-21', '2024-09-15'"
sql1 = f"SELECT data, mandante, visitante, placar, vencedor, campeonato FROM partidas WHERE (mandante LIKE '%Palmeiras%' OR visitante LIKE '%Palmeiras%') AND data IN ({datas_novelas}) ORDER BY data DESC;"
c.execute(sql1)
res1 = c.fetchall()
print(f"1. Novela: {len(res1)} rows in {(time.time()-t0)*1000:.1f}ms")

# Test 2: Dias pares vs impares
t0 = time.time()
sql2 = """
SELECT 
    CASE WHEN CAST(strftime('%d', data) AS INT) % 2 = 0 THEN 'Dias Pares' ELSE 'Dias Ímpares' END as tipo_dia,
    COUNT(*) as total_jogos,
    SUM(CASE WHEN vencedor = 'Corinthians' THEN 1 ELSE 0 END) as vitorias,
    SUM(CASE WHEN vencedor = 'Empate' THEN 1 ELSE 0 END) as empates,
    SUM(CASE WHEN vencedor != 'Corinthians' AND vencedor != 'Empate' AND vencedor IS NOT NULL THEN 1 ELSE 0 END) as derrotas,
    ROUND(SUM(CASE WHEN vencedor = 'Corinthians' THEN 1.0 ELSE 0 END) * 100.0 / COUNT(*), 1) as pct_vitorias
FROM partidas
WHERE mandante LIKE '%Corinthians%' OR visitante LIKE '%Corinthians%'
GROUP BY tipo_dia;
"""
c.execute(sql2)
res2 = c.fetchall()
print(f"2. Dias Pares/Ímpares: {len(res2)} rows in {(time.time()-t0)*1000:.1f}ms")

# Test 3: Acréscimos
t0 = time.time()
sql3 = """
SELECT 
    clube,
    COUNT(*) as gols_acrescimos
FROM gols
WHERE (minuto LIKE '45+%' OR minuto LIKE '90+%' OR CAST(minuto AS INT) >= 90)
  AND clube IS NOT NULL
GROUP BY clube
ORDER BY gols_acrescimos DESC
LIMIT 8;
"""
c.execute(sql3)
res3 = c.fetchall()
print(f"3. Acréscimos: {len(res3)} rows in {(time.time()-t0)*1000:.1f}ms")

# Test 4: Chuva
t0 = time.time()
try:
    c.execute("ATTACH DATABASE 'data/clima.db' AS clima")
except Exception as e:
    pass
sql4 = """
SELECT 
    p.data, p.mandante, p.visitante, p.placar, p.vencedor, ROUND(c.precipitacao_mm, 1) as chuva_mm
FROM partidas p
JOIN clima.clima_diario c ON p.data = c.data AND (c.cidade LIKE '%Rio de Janeiro%' OR c.cidade LIKE '%Brasília%')
WHERE (p.mandante LIKE '%Flamengo%' OR p.visitante LIKE '%Flamengo%')
  AND c.precipitacao_mm >= 15.0
ORDER BY c.precipitacao_mm DESC
LIMIT 15;
"""
try:
    c.execute(sql4)
    res4 = c.fetchall()
    print(f"4. Chuva Flamengo: {len(res4)} rows in {(time.time()-t0)*1000:.1f}ms")
except Exception as e:
    print(f"4. Chuva: Error {e}")

# Test 5: Falta
t0 = time.time()
sql5 = """
SELECT 
    atleta,
    GROUP_CONCAT(DISTINCT clube) as clubes,
    COUNT(*) as gols_falta
FROM gols
WHERE tipo_de_gol LIKE '%Falta%'
GROUP BY atleta
ORDER BY gols_falta DESC
LIMIT 8;
"""
c.execute(sql5)
res5 = c.fetchall()
print(f"5. Falta: {len(res5)} rows in {(time.time()-t0)*1000:.1f}ms")

# Test 6: Cartões vermelhos por clássico
t0 = time.time()
sql6 = """
SELECT 
    p.mandante || ' x ' || p.visitante as confronto,
    COUNT(DISTINCT p.id_partida) as total_jogos,
    COUNT(c.id_cartao) as total_vermelhos,
    ROUND(COUNT(c.id_cartao) * 1.0 / COUNT(DISTINCT p.id_partida), 2) as media_vermelhos
FROM partidas p
JOIN cartoes c ON p.id_partida = c.id_partida AND c.cartao = 'Vermelho'
WHERE p.campeonato LIKE '%Brasileiro%'
GROUP BY p.mandante, p.visitante
HAVING total_jogos >= 5
ORDER BY media_vermelhos DESC
LIMIT 8;
"""
c.execute(sql6)
res6 = c.fetchall()
print(f"6. Cartões Vermelhos: {len(res6)} rows in {(time.time()-t0)*1000:.1f}ms")
# Test 7: Serie B
c.execute("SELECT COUNT(*) FROM partidas WHERE campeonato LIKE '%rie B%' AND (mandante LIKE '%CRB%' OR visitante LIKE '%CRB%')")
print('CRB Serie B matches:', c.fetchone()[0])
c.execute("SELECT COUNT(*) FROM partidas WHERE campeonato LIKE '%rie B%' AND (mandante LIKE '%Cear%' OR visitante LIKE '%Cear%')")
print('Ceará Serie B matches:', c.fetchone()[0])
c.execute("SELECT COUNT(*) FROM partidas WHERE campeonato LIKE '%rie B%' AND (mandante LIKE '%Vit%ria%' OR visitante LIKE '%Vit%ria%')")
print('Vitória Serie B matches:', c.fetchone()[0])
