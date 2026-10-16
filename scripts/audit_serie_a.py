import sqlite3

conn = sqlite3.connect('data/futebol.db')
cursor = conn.cursor()

# The 20 Série A clubs (2024 / current):
# Flamengo, Palmeiras, São Paulo, Corinthians, Fluminense, Botafogo, Vasco,
# Grêmio, Internacional, Atlético-MG, Cruzeiro, Athletico-PR, Bahia, Fortaleza,
# Vitória, Juventude, Cuiabá, Criciúma, Atlético-GO, Red Bull Bragantino / Bragantino

serie_a_20 = [
    'Flamengo', 'Palmeiras', 'São Paulo', 'Corinthians', 'Fluminense', 'Botafogo', 'Vasco',
    'Grêmio', 'Internacional', 'Atlético-MG', 'Cruzeiro', 'Athletico-PR', 'Bahia', 'Fortaleza',
    'Vitória', 'Juventude', 'Cuiabá', 'Criciúma', 'Atlético-GO', 'Red Bull Bragantino'
]

# Check standard name for Bragantino
cursor.execute("SELECT DISTINCT mandante FROM partidas WHERE mandante LIKE '%Bragan%'")
brag = [r[0] for r in cursor.fetchall()]
print(f"Bragantino names found: {brag}")

cursor.execute("SELECT COUNT(*) FROM partidas")
print(f"Total matches in DB: {cursor.fetchone()[0]}")
print("="*85)
print(f"{'Clube':<22} | {'Total':<6} | {'Brasileirão':<11} | {'CdB':<5} | {'Intl':<5} | {'Estadual/Outros':<15}")
print("-"*85)

for club in serie_a_20:
    name_filter = club
    if 'Bragantino' in club:
        clause = "(mandante LIKE '%Bragantino%' OR visitante LIKE '%Bragantino%')"
        params = ()
    else:
        clause = "(mandante = ? OR visitante = ?)"
        params = (club, club)
        
    cursor.execute(f'''
        SELECT 
            COUNT(*),
            SUM(CASE WHEN campeonato LIKE '%Brasileir%' OR campeonato LIKE '%Série A%' OR campeonato LIKE '%Taça Brasil%' OR campeonato LIKE '%Robertão%' THEN 1 ELSE 0 END),
            SUM(CASE WHEN campeonato LIKE '%Copa do Brasil%' THEN 1 ELSE 0 END),
            SUM(CASE WHEN campeonato LIKE '%Libertadores%' OR campeonato LIKE '%Sul-Americana%' OR campeonato LIKE '%Mercosul%' OR campeonato LIKE '%Supercopa%' OR campeonato LIKE '%Recopa%' OR campeonato LIKE '%Mundial%' THEN 1 ELSE 0 END),
            SUM(CASE WHEN campeonato NOT LIKE '%Brasileir%' AND campeonato NOT LIKE '%Série A%' AND campeonato NOT LIKE '%Taça Brasil%' AND campeonato NOT LIKE '%Robertão%' AND campeonato NOT LIKE '%Copa do Brasil%' AND campeonato NOT LIKE '%Libertadores%' AND campeonato NOT LIKE '%Sul-Americana%' AND campeonato NOT LIKE '%Mercosul%' AND campeonato NOT LIKE '%Supercopa%' AND campeonato NOT LIKE '%Recopa%' AND campeonato NOT LIKE '%Mundial%' THEN 1 ELSE 0 END)
        FROM partidas 
        WHERE {clause}
    ''', params)
    tot, bra, cdb, intl, est = cursor.fetchone()
    print(f"{club:<22} | {tot or 0:<6} | {bra or 0:<11} | {cdb or 0:<5} | {intl or 0:<5} | {est or 0:<15}")

conn.close()
