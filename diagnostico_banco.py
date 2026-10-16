import sqlite3
import pandas as pd

conn = sqlite3.connect("data/futebol.db")

print("=== 1. PERÍODO E PARTIDAS POR ANO ===")
df_anos = pd.read_sql_query("""
SELECT 
    ano, 
    COUNT(*) as total_jogos, 
    MIN(data) as inicio_temporada, 
    MAX(data) as fim_temporada 
FROM partidas 
GROUP BY ano 
ORDER BY ano
""", conn)
print(df_anos.to_string(index=False))

print("\n=== 2. TIMES E NÚMERO DE JOGOS NO BANCO ===")
df_times = pd.read_sql_query("""
SELECT 
    mandante AS clube, 
    COUNT(*) * 2 AS estimativa_total_jogos,
    COUNT(*) AS jogos_como_mandante,
    MIN(ano) AS primeiro_ano,
    MAX(ano) AS ultimo_ano
FROM partidas 
GROUP BY mandante 
ORDER BY jogos_como_mandante DESC
""", conn)
print(f"Total de clubes distintos catalogados: {len(df_times)}")
print(df_times.head(25).to_string(index=False))

print("\n=== 3. COBERTURA DETALHADA DAS TABELAS ===")
c_partidas = conn.execute("SELECT COUNT(*) FROM partidas").fetchone()[0]
c_com_arbitro = conn.execute("SELECT COUNT(*) FROM partidas WHERE arbitro IS NOT NULL AND arbitro != 'Não informado'").fetchone()[0]
c_com_assistentes = conn.execute("SELECT COUNT(*) FROM partidas WHERE assistente_1 IS NOT NULL").fetchone()[0]
c_gols = conn.execute("SELECT COUNT(*) FROM gols").fetchone()[0]
c_cartoes = conn.execute("SELECT COUNT(*) FROM cartoes").fetchone()[0]
c_escalacoes = conn.execute("SELECT COUNT(*) FROM escalacoes").fetchone()[0]
c_jogos_com_escalacao = conn.execute("SELECT COUNT(DISTINCT id_partida) FROM escalacoes").fetchone()[0]

print(f"• Total de Partidas: {c_partidas}")
print(f"• Partidas com Árbitro identificado: {c_com_arbitro}")
print(f"• Partidas com Equipe Completa (Bandeirinhas 1 e 2, 4º Árbitro, VAR): {c_com_assistentes}")
print(f"• Total de Gols com minuto, autor e tipo: {c_gols}")
print(f"• Total de Cartões (amarelos e vermelhos com minuto/atleta): {c_cartoes}")
print(f"• Total de Jogadores escalados registrados: {c_escalacoes} (em {c_jogos_com_escalacao} partidas com súmulas)")

print("\n=== 4. ANOS COM GOLS DETALHADOS ===")
df_gols_anos = pd.read_sql_query("""
SELECT p.ano, COUNT(g.id_gol) as total_gols
FROM gols g
JOIN partidas p ON g.id_partida = p.id_partida
GROUP BY p.ano
ORDER BY p.ano
""", conn)
print(df_gols_anos.to_string(index=False))

print("\n=== 5. ANOS COM ESCALAÇÕES DETALHADAS (TITULARES/RESERVAS/CAPITÃES) ===")
df_esc_anos = pd.read_sql_query("""
SELECT p.ano, COUNT(DISTINCT e.id_partida) as jogos_com_escalacao, COUNT(e.id_escalacao) as total_atletas
FROM escalacoes e
JOIN partidas p ON e.id_partida = p.id_partida
GROUP BY p.ano
ORDER BY p.ano
""", conn)
print(df_esc_anos.to_string(index=False))

conn.close()
