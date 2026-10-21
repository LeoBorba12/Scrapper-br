import sqlite3

con = sqlite3.connect('data/futebol.db')
cur = con.cursor()

print("="*60)
print("AUDITORIA 1: GOLS DOS ARTILHEIROS ESPECÍFICOS NO BANCO")
print("="*60)

alvos = {
    "Roberto Dinamite": ["Roberto Dinamite", "%Dinamite%"],
    "Fred": ["Fred", "Frederico Chaves%"],
    "Romário": ["Romário%", "Romario%"],
    "Edmundo": ["Edmundo%"],
    "Zico": ["Zico%"],
    "Diego Souza": ["Diego Souza%"],
    "Túlio Maravilha": ["Túlio%", "Tulio%"],
    "Serginho Chulapa": ["Serginho%"],
    "Dario (Dadá)": ["Dario%", "Dadá%"],
    "Washington": ["Washington%"],
    "Luís Fabiano": ["Luís Fabiano%", "Luis Fabiano%"],
    "Gabriel Barbosa": ["Gabriel Barbosa%", "Gabigol%"],
    "Ademir da Guia": ["Ademir da Guia%"],
    "Marcelinho Carioca": ["Marcelinho Carioca%", "%Marcelinho%"],
    "Careca": ["Careca%"]
}

for nome, patterns in alvos.items():
    conds = " OR ".join(["g.atleta LIKE ?"] * len(patterns))
    # No Brasileirão
    cur.execute(f"""
        SELECT count(g.id_gol)
        FROM gols g
        JOIN partidas p ON g.id_partida = p.id_partida
        WHERE ({conds})
          AND p.ano >= 1971
          AND (p.campeonato LIKE '%Brasileir%' OR p.campeonato LIKE '%Série A%')
    """, patterns)
    gols_brasileirao = cur.fetchone()[0]

    # Em todos os torneios
    cur.execute(f"""
        SELECT count(g.id_gol)
        FROM gols g
        WHERE ({conds})
    """, patterns)
    gols_total = cur.fetchone()[0]

    # Partidas por clube
    cur.execute(f"""
        SELECT g.clube, count(*)
        FROM gols g
        WHERE ({conds})
        GROUP BY g.clube
        ORDER BY count(*) DESC
        LIMIT 5
    """, patterns)
    clubes = cur.fetchall()

    print(f"\n[{nome}]")
    print(f"  Gols no Brasileirão (1971+): {gols_brasileirao}")
    print(f"  Gols no Total do Banco: {gols_total}")
    print(f"  Principais clubes no banco: {clubes}")

print("\n" + "="*60)
print("AUDITORIA 2: JOGOS DOS 4 GRANDES DE SÃO PAULO")
print("="*60)

clubes_sp = ['Corinthians', 'Palmeiras', 'São Paulo', 'Santos']
for c in clubes_sp:
    cur.execute("SELECT count(*) FROM partidas WHERE mandante = ? OR visitante = ?", (c, c))
    total_jogos = cur.fetchone()[0]

    cur.execute("""
        SELECT count(*) FROM partidas 
        WHERE (mandante = ? OR visitante = ?)
          AND (campeonato LIKE '%Brasileir%' OR campeonato LIKE '%Taça Brasil%' OR campeonato LIKE '%Roberto Gomes Pedrosa%')
    """, (c, c))
    brasileirao = cur.fetchone()[0]

    cur.execute("""
        SELECT count(*) FROM partidas 
        WHERE (mandante = ? OR visitante = ?)
          AND campeonato LIKE '%Paulist%'
    """, (c, c))
    paulista = cur.fetchone()[0]

    cur.execute("""
        SELECT count(*) FROM partidas 
        WHERE (mandante = ? OR visitante = ?)
          AND campeonato LIKE '%Copa do Brasil%'
    """, (c, c))
    cdb = cur.fetchone()[0]

    cur.execute("""
        SELECT count(*) FROM partidas 
        WHERE (mandante = ? OR visitante = ?)
          AND (campeonato LIKE '%Libertadores%' OR campeonato LIKE '%Sul-Americana%' 
               OR campeonato LIKE '%Mercosul%' OR campeonato LIKE '%Supercopa%' 
               OR campeonato LIKE '%CONMEBOL%' OR campeonato LIKE '%Recopa%' 
               OR campeonato LIKE '%Mundial%')
    """, (c, c))
    internacional = cur.fetchone()[0]

    cur.execute("""
        SELECT count(*) FROM partidas 
        WHERE (mandante = ? OR visitante = ?)
          AND (campeonato LIKE '%Rio-São Paulo%' OR campeonato LIKE '%Torneio Rio-SP%')
    """, (c, c))
    riosp = cur.fetchone()[0]

    cur.execute("SELECT min(ano), max(ano) FROM partidas WHERE mandante = ? OR visitante = ?", (c, c))
    anos = cur.fetchone()

    print(f"\n{c.upper()}:")
    print(f"  Total no banco: {total_jogos} partidas ({anos[0]} a {anos[1]})")
    print(f"  - Campeonato Paulista: {paulista}")
    print(f"  - Brasileirão (1959-2026): {brasileirao}")
    print(f"  - Copa do Brasil: {cdb}")
    print(f"  - Torneios Internacionais: {internacional}")
    print(f"  - Torneio Rio-São Paulo: {riosp}")
