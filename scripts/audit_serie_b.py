import sqlite3

conn = sqlite3.connect('data/futebol.db')
cursor = conn.cursor()

# 20 clubes da Série B (2024):
# Santos, Sport, Ceará, Goiás, Coritiba, Avaí, Novorizontino, América-MG,
# Mirassol, Operário-PR, Vila Nova, Ponte Preta, CRB, Paysandu,
# Chapecoense, Botafogo-SP, Brusque, Amazonas, Ituano, Guarani

serie_b_20 = [
    ("Santos", "(mandante = 'Santos' OR visitante = 'Santos')"),
    ("Sport", "(mandante = 'Sport' OR visitante = 'Sport')"),
    ("Ceará", "(mandante = 'Ceará' OR visitante = 'Ceará' OR mandante = 'Ceara' OR visitante = 'Ceara')"),
    ("Goiás", "(mandante = 'Goiás' OR visitante = 'Goiás' OR mandante = 'Goias' OR visitante = 'Goias')"),
    ("Coritiba", "(mandante = 'Coritiba' OR visitante = 'Coritiba')"),
    ("Avaí", "(mandante = 'Avaí' OR visitante = 'Avaí' OR mandante = 'Avai' OR visitante = 'Avai')"),
    ("Novorizontino", "(mandante LIKE '%Novorizontino%' OR visitante LIKE '%Novorizontino%')"),
    ("América-MG", "(mandante = 'América-MG' OR visitante = 'América-MG')"),
    ("Mirassol", "(mandante = 'Mirassol' OR visitante = 'Mirassol')"),
    ("Operário-PR", "(mandante LIKE '%Operário-PR%' OR visitante LIKE '%Operário-PR%')"),
    ("Vila Nova", "(mandante = 'Vila Nova' OR visitante = 'Vila Nova' OR mandante = 'Vila Nova-GO' OR visitante = 'Vila Nova-GO')"),
    ("Ponte Preta", "(mandante = 'Ponte Preta' OR visitante = 'Ponte Preta')"),
    ("CRB", "(mandante = 'CRB' OR visitante = 'CRB')"),
    ("Paysandu", "(mandante = 'Paysandu' OR visitante = 'Paysandu')"),
    ("Chapecoense", "(mandante = 'Chapecoense' OR visitante = 'Chapecoense')"),
    ("Botafogo-SP", "(mandante = 'Botafogo-SP' OR visitante = 'Botafogo-SP')"),
    ("Brusque", "(mandante = 'Brusque' OR visitante = 'Brusque')"),
    ("Amazonas", "(mandante LIKE '%Amazonas%' OR visitante LIKE '%Amazonas%')"),
    ("Ituano", "(mandante = 'Ituano' OR visitante = 'Ituano')"),
    ("Guarani", "(mandante = 'Guarani' OR visitante = 'Guarani') AND mandante NOT LIKE '%Guarani-VA%' AND visitante NOT LIKE '%Guarani-VA%'")
]

print("AUDITORIA DOS 20 CLUBES DA SÉRIE B NO BANCO:")
print("="*90)
print(f"{'Clube':<18} | {'Total':<6} | {'Brasileirão':<11} | {'CdB':<5} | {'Intl':<5} | {'Estadual/Outros':<15}")
print("-"*90)

for club_name, filter_sql in serie_b_20:
    cursor.execute(f"""
        SELECT 
            COUNT(*),
            SUM(CASE WHEN campeonato LIKE '%Brasileir%' OR campeonato LIKE '%Série A%' OR campeonato LIKE '%Série B%' OR campeonato LIKE '%Taça Brasil%' OR campeonato LIKE '%Robertão%' THEN 1 ELSE 0 END),
            SUM(CASE WHEN campeonato LIKE '%Copa do Brasil%' THEN 1 ELSE 0 END),
            SUM(CASE WHEN campeonato LIKE '%Libertadores%' OR campeonato LIKE '%Sul-Americana%' OR campeonato LIKE '%Mercosul%' OR campeonato LIKE '%Supercopa%' OR campeonato LIKE '%Recopa%' OR campeonato LIKE '%Mundial%' THEN 1 ELSE 0 END),
            SUM(CASE WHEN campeonato NOT LIKE '%Brasileir%' AND campeonato NOT LIKE '%Série A%' AND campeonato NOT LIKE '%Série B%' AND campeonato NOT LIKE '%Taça Brasil%' AND campeonato NOT LIKE '%Robertão%' AND campeonato NOT LIKE '%Copa do Brasil%' AND campeonato NOT LIKE '%Libertadores%' AND campeonato NOT LIKE '%Sul-Americana%' AND campeonato NOT LIKE '%Mercosul%' AND campeonato NOT LIKE '%Supercopa%' AND campeonato NOT LIKE '%Recopa%' AND campeonato NOT LIKE '%Mundial%' THEN 1 ELSE 0 END)
        FROM partidas 
        WHERE {filter_sql}
    """)
    tot, bra, cdb, intl, est = cursor.fetchone()
    print(f"{club_name:<18} | {tot or 0:<6} | {bra or 0:<11} | {cdb or 0:<5} | {intl or 0:<5} | {est or 0:<15}")

conn.close()
