import sqlite3
import sys

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

conn = sqlite3.connect('data/futebol.db')
c = conn.cursor()

print("--- 1. TOTAIS DE PARTIDAS NA TABELA PARTIDAS ---")
for t1, t2 in [('Flamengo', 'Fluminense'), ('Corinthians', 'Palmeiras'), ('Grêmio', 'Internacional'), ('Flamengo', 'Vasco'), ('Atlético-MG', 'Cruzeiro')]:
    c.execute("""
        SELECT COUNT(*), MIN(ano), MAX(ano)
        FROM partidas
        WHERE (mandante = ? AND visitante = ?) OR (mandante = ? AND visitante = ?);
    """, (t1, t2, t2, t1))
    total_partidas = c.fetchone()
    
    c.execute("""
        SELECT COUNT(DISTINCT p.id_partida), MIN(p.ano), MAX(p.ano)
        FROM partidas p
        JOIN cartoes c ON p.id_partida = c.id_partida
        WHERE (p.mandante = ? AND p.visitante = ?) OR (p.mandante = ? AND p.visitante = ?);
    """, (t1, t2, t2, t1))
    com_cartoes = c.fetchone()
    
    print(f"{t1} x {t2}: Total de jogos no banco = {total_partidas[0]} ({total_partidas[1]}-{total_partidas[2]}) | Com cartões registrados = {com_cartoes[0]} ({com_cartoes[1]}-{com_cartoes[2]})")

print("\n--- 2. COBERTURA TOTAL DA TABELA CARTOES POR CAMPEONATO E ANO ---")
c.execute("""
    SELECT p.campeonato, MIN(p.ano), MAX(p.ano), COUNT(DISTINCT p.id_partida), COUNT(c.id_cartao)
    FROM partidas p
    JOIN cartoes c ON p.id_partida = c.id_partida
    GROUP BY p.campeonato;
""")
for r in c.fetchall():
    print(f"Campeonato: {r[0]} | Anos: {r[1]} a {r[2]} | Partidas com Cartões: {r[3]} | Total Cartões: {r[4]}")

print("\n--- 3. POR ANO: PARTIDAS TOTAIS VS PARTIDAS COM CARTÕES ---")
c.execute("""
    SELECT 
        p.ano,
        COUNT(DISTINCT p.id_partida) as total_jogos,
        COUNT(DISTINCT c.id_partida) as jogos_com_cartoes
    FROM partidas p
    LEFT JOIN cartoes c ON p.id_partida = c.id_partida
    GROUP BY p.ano
    ORDER BY p.ano DESC
    LIMIT 25;
""")
for r in c.fetchall():
    pct = round(r[2] * 100.0 / r[1], 1) if r[1] > 0 else 0
    print(f"Ano {r[0]}: {r[1]} partidas | {r[2]} com cartões ({pct}%)")
