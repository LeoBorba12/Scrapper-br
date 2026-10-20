import sqlite3
import re

conn = sqlite3.connect('data/futebol.db')
c = conn.cursor()

print("--- CLUBES COM ' - ' NO NOME ---")
c.execute("""
    SELECT DISTINCT mandante FROM partidas WHERE mandante LIKE '% - %'
    UNION
    SELECT DISTINCT visitante FROM partidas WHERE visitante LIKE '% - %'
""")
rows = c.fetchall()
print(f"Total encontrados com ' - ': {len(rows)}")
for r in rows[:20]:
    print(" ", r[0])

print("\n--- CLUBES COM PREFIXO DE GRUPO/MÓDULO (ex: 'K São Paulo', 'N São Paulo') ---")
c.execute("""
    SELECT DISTINCT mandante FROM partidas WHERE mandante GLOB '[A-Z] *'
    UNION
    SELECT DISTINCT visitante FROM partidas WHERE visitante GLOB '[A-Z] *'
""")
rows2 = c.fetchall()
print(f"Total encontrados com '[A-Z] *': {len(rows2)}")
for r in rows2:
    print(" ", r[0])

conn.close()
