import sqlite3

conn = sqlite3.connect('data/futebol.db')
cur = conn.cursor()

print("="*60)
print("AUDITORIA COMPLETA DE LACUNAS DE DADOS - FUTEBOL.DB")
print("="*60)

cur.execute("SELECT COUNT(*), MIN(ano), MAX(ano) FROM partidas")
total_p, ano_min, ano_max = cur.fetchone()
print(f"Total partidas: {total_p} | Periodo: {ano_min} a {ano_max}")

cur.execute("SELECT COUNT(*) FROM partidas WHERE gols_mandante IS NULL OR gols_visitante IS NULL")
print(f"Partidas sem placar/gols definidos: {cur.fetchone()[0]}")

cur.execute("SELECT COUNT(*) FROM partidas WHERE estadio IS NULL OR TRIM(estadio) = ''")
sem_estadio = cur.fetchone()[0]
print(f"Partidas sem estádio: {sem_estadio} ({sem_estadio/total_p*100:.1f}%)")

cur.execute("SELECT COUNT(*) FROM partidas WHERE arbitro IS NULL OR TRIM(arbitro) = ''")
sem_arbitro = cur.fetchone()[0]
print(f"Partidas sem árbitro: {sem_arbitro} ({sem_arbitro/total_p*100:.1f}%)")

cur.execute("SELECT COUNT(*) FROM partidas WHERE publico IS NULL OR publico = 0")
sem_publico = cur.fetchone()[0]
print(f"Partidas sem público registrado: {sem_publico} ({sem_publico/total_p*100:.1f}%)")

cur.execute("SELECT COUNT(*) FROM partidas WHERE tecnico_mandante IS NULL OR TRIM(tecnico_mandante) = ''")
sem_tecnico = cur.fetchone()[0]
print(f"Partidas sem técnico registrado: {sem_tecnico} ({sem_tecnico/total_p*100:.1f}%)")

print("\n" + "="*60)
print("COBERTURA DE GOLS DETALHADOS (AUTOR + MINUTO)")
print("="*60)

cur.execute("""
    SELECT 
        CASE 
            WHEN ano < 1970 THEN '1. Até 1969 (Taça Brasil/Robertão)'
            WHEN ano BETWEEN 1970 AND 1989 THEN '2. 1970-1989 (Brasileirão Histórico)'
            WHEN ano BETWEEN 1990 AND 2002 THEN '3. 1990-2002 (Mata-Mata / Copa BR)'
            WHEN ano BETWEEN 2003 AND 2013 THEN '4. 2003-2013 (Pontos Corridos I)'
            WHEN ano BETWEEN 2014 AND 2024 THEN '5. 2014-2024 (Súmulas Eletrônicas)'
            WHEN ano = 2025 THEN '6. 2025 (Temporada Consolidada)'
            WHEN ano = 2026 THEN '7. 2026 (Em andamento)'
            ELSE 'Outros'
        END as era,
        COUNT(DISTINCT p.id_partida) as total_jogos,
        SUM(COALESCE(p.gols_mandante,0) + COALESCE(p.gols_visitante,0)) as gols_nos_placares,
        COUNT(DISTINCT g.id_gol) as gols_detalhados,
        ROUND(100.0 * COUNT(DISTINCT g.id_gol) / NULLIF(SUM(COALESCE(p.gols_mandante,0) + COALESCE(p.gols_visitante,0)), 0), 1) as pct_cobertura
    FROM partidas p
    LEFT JOIN gols g ON g.id_partida = p.id_partida
    GROUP BY era
    ORDER BY era
""")
for r in cur.fetchall():
    print(f"{r[0]:<36} | Jogos: {r[1]:>5} | Gols Placar: {r[2]:>6} | Gols Detalhados: {r[3]:>6} | Cobertura: {r[4]}%")

print("\n" + "="*60)
print("COBERTURA DE CARTÕES E ESCALAÇÕES")
print("="*60)

cur.execute("""
    SELECT 
        CASE 
            WHEN ano < 2003 THEN '1. Até 2002'
            WHEN ano BETWEEN 2003 AND 2013 THEN '2. 2003-2013'
            WHEN ano BETWEEN 2014 AND 2024 THEN '3. 2014-2024'
            WHEN ano = 2025 THEN '4. 2025'
            WHEN ano = 2026 THEN '5. 2026'
        END as era,
        COUNT(DISTINCT p.id_partida) as jogos,
        COUNT(DISTINCT ct.id_cartao) as cartoes,
        COUNT(DISTINCT e.id_escalacao) as escalacoes,
        ROUND(COUNT(DISTINCT ct.id_cartao) * 1.0 / COUNT(DISTINCT p.id_partida), 2) as cartoes_por_jogo,
        ROUND(COUNT(DISTINCT e.id_escalacao) * 1.0 / COUNT(DISTINCT p.id_partida), 1) as escalados_por_jogo
    FROM partidas p
    LEFT JOIN cartoes ct ON ct.id_partida = p.id_partida
    LEFT JOIN escalacoes e ON e.id_partida = p.id_partida
    GROUP BY era
    ORDER BY era
""")
for r in cur.fetchall():
    print(f"{r[0]:<15} | Jogos: {r[1]:>6} | Cartões: {r[2]:>6} ({r[4]}/jogo) | Escalações: {r[3]:>6} ({r[5]}/jogo)")

print("\n" + "="*60)
print("COBERTURA POR COMPETIÇÃO")
print("="*60)

cur.execute("""
    SELECT 
        campeonato,
        COUNT(DISTINCT p.id_partida) as total_jogos,
        MIN(ano) || '-' || MAX(ano) as periodo,
        COUNT(DISTINCT g.id_gol) as gols_detalhados,
        COUNT(DISTINCT ct.id_cartao) as cartoes,
        COUNT(DISTINCT e.id_escalacao) as escalacoes
    FROM partidas p
    LEFT JOIN gols g ON g.id_partida = p.id_partida
    LEFT JOIN cartoes ct ON ct.id_partida = p.id_partida
    LEFT JOIN escalacoes e ON e.id_partida = p.id_partida
    GROUP BY campeonato
    ORDER BY total_jogos DESC
    LIMIT 20
""")
for r in cur.fetchall():
    print(f"{r[0]:<35} | {r[1]:>5} jogos ({r[2]}) | Gols: {r[3]:>5} | Cartões: {r[4]:>5} | Escalações: {r[5]:>5}")

conn.close()
