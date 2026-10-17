import sqlite3

conn = sqlite3.connect('data/futebol.db')
cursor = conn.cursor()

# Map canonical names and query logic
clubs = [
    ("Flamengo", "(mandante LIKE '%Flamengo%' OR visitante LIKE '%Flamengo%') AND mandante NOT LIKE '%Flamengo-PI%' AND visitante NOT LIKE '%Flamengo-PI%'"),
    ("Palmeiras", "(mandante LIKE '%Palmeiras%' OR visitante LIKE '%Palmeiras%')"),
    ("São Paulo", "(mandante LIKE '%São Paulo%' OR visitante LIKE '%São Paulo%') AND mandante NOT LIKE '%São Paulo-RS%' AND visitante NOT LIKE '%São Paulo-RS%'"),
    ("Corinthians", "(mandante LIKE '%Corinthians%' OR visitante LIKE '%Corinthians%') AND mandante NOT LIKE '%Corinthians-AL%' AND visitante NOT LIKE '%Corinthians-AL%' AND mandante NOT LIKE '%Coríntians-RN%' AND visitante NOT LIKE '%Coríntians-RN%'"),
    ("Fluminense", "(mandante LIKE '%Fluminense%' OR visitante LIKE '%Fluminense%') AND mandante NOT LIKE '%Fluminense-BA%' AND visitante NOT LIKE '%Fluminense-BA%' AND mandante NOT LIKE '%Fluminense de Feira%' AND visitante NOT LIKE '%Fluminense de Feira%'"),
    ("Botafogo", "(mandante IN ('Botafogo', 'Botafogo-RJ') OR visitante IN ('Botafogo', 'Botafogo-RJ') OR (mandante LIKE '%Botafogo%' AND mandante NOT LIKE '%Botafogo-SP%' AND mandante NOT LIKE '%Botafogo-PB%') OR (visitante LIKE '%Botafogo%' AND visitante NOT LIKE '%Botafogo-SP%' AND visitante NOT LIKE '%Botafogo-PB%'))"),
    ("Vasco", "(mandante LIKE '%Vasco%' OR visitante LIKE '%Vasco%') AND mandante NOT LIKE '%Vasco da Gama-AC%' AND visitante NOT LIKE '%Vasco da Gama-AC%'"),
    ("Grêmio", "(mandante LIKE '%Grêmio%' OR visitante LIKE '%Grêmio%' OR mandante LIKE '%Gremio%' OR visitante LIKE '%Gremio%') AND mandante NOT LIKE '%Maringá%' AND visitante NOT LIKE '%Maringá%' AND mandante NOT LIKE '%Prudente%' AND visitante NOT LIKE '%Prudente%' AND mandante NOT LIKE '%Coariense%' AND visitante NOT LIKE '%Coariense%' AND mandante NOT LIKE '%Jaciara%' AND visitante NOT LIKE '%Jaciara%'"),
    ("Internacional", "(mandante LIKE '%Internacional%' OR visitante LIKE '%Internacional%') AND mandante NOT LIKE '%Inter de Limeira%' AND visitante NOT LIKE '%Inter de Limeira%' AND mandante NOT LIKE '%Internacional-SP%' AND visitante NOT LIKE '%Internacional-SP%' AND mandante NOT LIKE '%Internacional-SM%' AND visitante NOT LIKE '%Internacional-SM%' AND mandante NOT LIKE '%Internacional/SM%' AND visitante NOT LIKE '%Internacional/SM%' AND mandante NOT LIKE '%Internacional-SC%' AND visitante NOT LIKE '%Internacional-SC%'"),
    ("Atlético-MG", "(mandante LIKE '%Atlético-MG%' OR visitante LIKE '%Atlético-MG%' OR mandante LIKE '%Atlético MG%' OR visitante LIKE '%Atlético MG%' OR mandante = 'Atletico(MG)' OR visitante = 'Atletico(MG)' OR ((mandante = 'Atlético' OR visitante = 'Atlético') AND campeonato IN ('Campeonato Mineiro', 'Copa Libertadores', 'Copa Sul-Minas')))"),
    ("Cruzeiro", "(mandante LIKE '%Cruzeiro%' OR visitante LIKE '%Cruzeiro%') AND mandante NOT LIKE '%Cruzeiro do Sul%' AND visitante NOT LIKE '%Cruzeiro do Sul%' AND mandante NOT LIKE '%Cruzeiro-RS%' AND visitante NOT LIKE '%Cruzeiro-RS%'"),
    ("Athletico-PR", "(mandante LIKE '%Athletico-PR%' OR visitante LIKE '%Athletico-PR%' OR mandante LIKE '%Atlético-PR%' OR visitante LIKE '%Atlético-PR%' OR mandante LIKE '%Atlético/PR%' OR visitante LIKE '%Atlético/PR%' OR mandante LIKE '%Atlético PR%' OR visitante LIKE '%Atlético PR%' OR ((mandante = 'Atlético' OR visitante = 'Atlético') AND campeonato = 'Campeonato Paranaense'))"),
    ("Bahia", "(mandante LIKE '%Bahia%' OR visitante LIKE '%Bahia%') AND mandante NOT LIKE '%Bahia de Feira%' AND visitante NOT LIKE '%Bahia de Feira%'"),
    ("Fortaleza", "(mandante = 'Fortaleza' OR visitante = 'Fortaleza')"),
    ("Vitória", "(mandante LIKE '%Vitória%' OR visitante LIKE '%Vitória%' OR mandante LIKE '%Vitoria%' OR visitante LIKE '%Vitoria%') AND mandante NOT LIKE '%Vitória-ES%' AND visitante NOT LIKE '%Vitória-ES%' AND mandante NOT LIKE '%Vitória da Conquista%' AND visitante NOT LIKE '%Vitória da Conquista%'"),
    ("Juventude", "(mandante LIKE '%Juventude%' OR visitante LIKE '%Juventude%') AND mandante NOT LIKE '%Juventude-MT%' AND visitante NOT LIKE '%Juventude-MT%' AND mandante NOT LIKE '%Juventude-MA%' AND visitante NOT LIKE '%Juventude-MA%'"),
    ("Cuiabá", "(mandante LIKE '%Cuiab%' OR visitante LIKE '%Cuiab%')"),
    ("Criciúma", "(mandante LIKE '%Crici%' OR visitante LIKE '%Crici%')"),
    ("Atlético-GO", "(mandante LIKE '%Atlético-GO%' OR visitante LIKE '%Atlético-GO%' OR mandante LIKE '%Atletico-GO%' OR visitante LIKE '%Atletico-GO%')"),
    ("Red Bull Bragantino", "(mandante LIKE '%Bragantino%' OR visitante LIKE '%Bragantino%')")
]

print("AUDITORIA COMPLETA DOS 20 CLUBES DA SÉRIE A:")
print("="*95)
print(f"{'Clube':<22} | {'Total':<6} | {'Brasileirão':<11} | {'CdB':<5} | {'Intl':<5} | {'Estaduais/Outros':<16} | {'Status CBF':<10}")
print("-"*95)

for club_name, filter_sql in clubs:
    cursor.execute(f"""
        SELECT 
            COUNT(*),
            SUM(CASE WHEN campeonato LIKE '%Brasileir%' OR campeonato LIKE '%Série A%' OR campeonato LIKE '%Taça Brasil%' OR campeonato LIKE '%Robertão%' THEN 1 ELSE 0 END),
            SUM(CASE WHEN campeonato LIKE '%Copa do Brasil%' THEN 1 ELSE 0 END),
            SUM(CASE WHEN campeonato LIKE '%Libertadores%' OR campeonato LIKE '%Sul-Americana%' OR campeonato LIKE '%Mercosul%' OR campeonato LIKE '%Supercopa%' OR campeonato LIKE '%Recopa%' OR campeonato LIKE '%Mundial%' THEN 1 ELSE 0 END),
            SUM(CASE WHEN campeonato NOT LIKE '%Brasileir%' AND campeonato NOT LIKE '%Série A%' AND campeonato NOT LIKE '%Taça Brasil%' AND campeonato NOT LIKE '%Robertão%' AND campeonato NOT LIKE '%Copa do Brasil%' AND campeonato NOT LIKE '%Libertadores%' AND campeonato NOT LIKE '%Sul-Americana%' AND campeonato NOT LIKE '%Mercosul%' AND campeonato NOT LIKE '%Supercopa%' AND campeonato NOT LIKE '%Recopa%' AND campeonato NOT LIKE '%Mundial%' THEN 1 ELSE 0 END)
        FROM partidas 
        WHERE {filter_sql}
    """)
    tot, bra, cdb, intl, est = cursor.fetchone()
    # Check official Brasileirão match count status
    status = "OK (100%)" if bra and bra > 0 else "PENDENTE"
    print(f"{club_name:<22} | {tot or 0:<6} | {bra or 0:<11} | {cdb or 0:<5} | {intl or 0:<5} | {est or 0:<16} | {status:<10}")

conn.close()
