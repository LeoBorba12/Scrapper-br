import sqlite3

con = sqlite3.connect('data/futebol.db')
cur = con.cursor()

clubes_sp = ['Corinthians', 'Palmeiras', 'São Paulo', 'Santos']

print("=== TOTAL DE PARTIDAS DOS 4 GRANDES DE SP NO BANCO ===")
for c in clubes_sp:
    cur.execute("""
        SELECT count(*) 
        FROM partidas 
        WHERE mandante = ? OR visitante = ?
    """, (c, c))
    total = cur.fetchone()[0]

    cur.execute("""
        SELECT count(*) 
        FROM partidas 
        WHERE (mandante = ? OR visitante = ?) 
          AND (campeonato LIKE '%Brasileir%' OR campeonato LIKE '%Taça Brasil%' OR campeonato LIKE '%Roberto Gomes Pedrosa%')
    """, (c, c))
    brasileirao = cur.fetchone()[0]

    cur.execute("""
        SELECT count(*) 
        FROM partidas 
        WHERE (mandante = ? OR visitante = ?) 
          AND campeonato LIKE '%Paulist%'
    """, (c, c))
    paulista = cur.fetchone()[0]

    cur.execute("""
        SELECT count(*) 
        FROM partidas 
        WHERE (mandante = ? OR visitante = ?) 
          AND campeonato LIKE '%Copa do Brasil%'
    """, (c, c))
    cdb = cur.fetchone()[0]

    cur.execute("""
        SELECT count(*) 
        FROM partidas 
        WHERE (mandante = ? OR visitante = ?) 
          AND (campeonato LIKE '%Libertadores%' OR campeonato LIKE '%Sul-Americana%' OR campeonato LIKE '%Mercosul%' OR campeonato LIKE '%Supercopa%' OR campeonato LIKE '%CONMEBOL%' OR campeonato LIKE '%Recopa%')
    """, (c, c))
    internacional = cur.fetchone()[0]

    cur.execute("""
        SELECT min(ano), max(ano) 
        FROM partidas 
        WHERE mandante = ? OR visitante = ?
    """, (c, c))
    anos = cur.fetchone()

    print(f"\n{c.upper()}:")
    print(f"  Total no Banco: {total} partidas (Período: {anos[0]} a {anos[1]})")
    print(f"  - Brasileirão / Nacionais: {brasileirao}")
    print(f"  - Campeonato Paulista: {paulista}")
    print(f"  - Copa do Brasil: {cdb}")
    print(f"  - Torneios Internacionais CONMEBOL/FIFA: {internacional}")
