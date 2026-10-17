import sqlite3
import re

conn = sqlite3.connect('data/futebol.db')
cursor = conn.cursor()

# 1. Inspect malformed rows with dates in mandante or visitante
cursor.execute("""
    SELECT id_partida, data, mandante, visitante, placar, campeonato, rodada
    FROM partidas 
    WHERE mandante GLOB '*[0-9][0-9]/[0-9][0-9]*' OR visitante GLOB '*[0-9][0-9]/[0-9][0-9]*'
""")
date_rows = cursor.fetchall()
print(f"Date rows: {len(date_rows)}")
for r in date_rows:
    print(r)

# 2. Inspect malformed rows with text footnotes
cursor.execute("""
    SELECT id_partida, data, mandante, visitante, placar, campeonato
    FROM partidas 
    WHERE mandante LIKE '%[%' OR visitante LIKE '%[%' 
       OR mandante LIKE '%abd%' OR visitante LIKE '%abd%'
       OR mandante LIKE '%alleged%' OR visitante LIKE '%alleged%'
       OR mandante LIKE '%Extra-games%' OR visitante LIKE '%Extra-games%'
       OR mandante LIKE '%was sent off%' OR visitante LIKE '%was sent off%'
       OR mandante LIKE '%condemned to%' OR visitante LIKE '%condemned to%'
""")
footnote_rows = cursor.fetchall()
print(f"\nFootnote rows: {len(footnote_rows)}")
for r in footnote_rows:
    print(r)

conn.close()
