import sqlite3
import os
import shutil

DB_PATH = 'data/futebol.db'
API_DB_PATH = 'api/data/futebol.db'

print(f"Iniciando higienização e indexação em {DB_PATH}...")

conn = sqlite3.connect(DB_PATH)
c = conn.cursor()

# 1. Higienização de Partidas com tabulações e quebras
c.execute("SELECT id_partida, mandante, visitante FROM partidas WHERE mandante LIKE '%\t%' OR visitante LIKE '%\t%';")
tabs_rows = c.fetchall()
print(f"Corrigindo {len(tabs_rows)} partidas com tabulações...")
for id_p, m, v in tabs_rows:
    novo_m = m.split('\t')[0].strip() if m else m
    novo_v = v.split('\t')[0].strip() if v else v
    c.execute("UPDATE partidas SET mandante = ?, visitante = ? WHERE id_partida = ?;", (novo_m, novo_v, id_p))

# 2. Correções pontuais de artefatos de raspagem
correcoes_especificas = [
    ("visitante", "Santos            match awarded", "Santos"),
    ("visitante", "Botafogo Jorge Ismael de Biasi Semi Final", "Botafogo-SP"),
    ("vencedor", "Botafogo Jorge Ismael de Biasi Semi Final", "Botafogo-SP"),
    ("visitante", "Palmeiras.", "Palmeiras"),
    ("visitante", "Atlético.", "Atlético-PR"),
    ("vencedor", "Atlético.", "Atlético-PR"),
    ("visitante", "Uberaba.", "Uberaba"),
    ("vencedor", "Uberaba.", "Uberaba"),
    ("mandante", "decretou o placar de América", "América-RN"),
    ("mandante", "decretou o placar de Criciúma", "Criciúma"),
    ("mandante", "Corinthians (São Paulo)", "Corinthians"),
    ("visitante", "Corinthians (São Paulo)", "Corinthians"),
    ("mandante", "Palmeiras (São Paulo)", "Palmeiras"),
    ("visitante", "Palmeiras (São Paulo)", "Palmeiras"),
    ("mandante", "Vasco da Gama (Rio de J)", "Vasco"),
    ("visitante", "Vasco da Gama (Rio de J)", "Vasco"),
    ("mandante", "América FC-MG", "América-MG"),
    ("visitante", "América FC-MG", "América-MG"),
]

for col, antigo, novo in correcoes_especificas:
    c.execute(f"UPDATE partidas SET {col} = ? WHERE {col} = ?;", (novo, antigo))
    if c.rowcount > 0:
        print(f"  -> Corrigido {col}: '{antigo}' -> '{novo}' ({c.rowcount} linhas)")

# 3. Remover espaços em branco no início/fim de todos os clubes
c.execute("UPDATE partidas SET mandante = TRIM(mandante), visitante = TRIM(visitante);")
c.execute("UPDATE gols SET clube = TRIM(clube), atleta = TRIM(atleta) WHERE clube IS NOT NULL;")
c.execute("UPDATE cartoes SET clube = TRIM(clube), atleta = TRIM(atleta) WHERE clube IS NOT NULL;")

# 4. Atualizar vencedor consistente com gols_mandante e gols_visitante nas linhas alteradas
c.execute("""
UPDATE partidas 
SET vencedor = CASE 
    WHEN gols_mandante > gols_visitante THEN mandante 
    WHEN gols_visitante > gols_mandante THEN visitante 
    ELSE 'Empate' 
END
WHERE vencedor IS NULL OR vencedor = '' OR vencedor NOT IN (mandante, visitante, 'Empate');
""")
print(f"Linhas com vencedor ajustado/validado: {c.rowcount}")

# 5. Criar índices compostos recomendados pelo database-design
print("\nCriando índices compostos otimizados...")

indices = [
    ("idx_partidas_confronto", "CREATE INDEX IF NOT EXISTS idx_partidas_confronto ON partidas (mandante, visitante, ano);"),
    ("idx_partidas_vencedor_ano", "CREATE INDEX IF NOT EXISTS idx_partidas_vencedor_ano ON partidas (vencedor, ano);"),
    ("idx_partidas_data_mandante", "CREATE INDEX IF NOT EXISTS idx_partidas_data_mandante ON partidas (data, mandante);"),
    ("idx_partidas_data_visitante", "CREATE INDEX IF NOT EXISTS idx_partidas_data_visitante ON partidas (data, visitante);"),
    ("idx_gols_atleta_clube", "CREATE INDEX IF NOT EXISTS idx_gols_atleta_clube ON gols (atleta, clube);"),
    ("idx_gols_partida_minuto", "CREATE INDEX IF NOT EXISTS idx_gols_partida_minuto ON gols (id_partida, minuto);"),
    ("idx_gols_partida_tempo", "CREATE INDEX IF NOT EXISTS idx_gols_partida_tempo ON gols (id_partida, tempo);"),
    ("idx_cartoes_partida_cartao", "CREATE INDEX IF NOT EXISTS idx_cartoes_partida_cartao ON cartoes (id_partida, cartao);"),
    ("idx_cartoes_clube_cartao", "CREATE INDEX IF NOT EXISTS idx_cartoes_clube_cartao ON cartoes (clube, cartao);"),
    ("idx_escalacoes_partida_clube", "CREATE INDEX IF NOT EXISTS idx_escalacoes_partida_clube ON escalacoes (id_partida, clube);"),
]

for nome, sql in indices:
    c.execute(sql)
    print(f"  + Índice criado: {nome}")

conn.commit()

# 6. Atualizar estatísticas do Query Planner do SQLite
print("\nAtualizando estatísticas com ANALYZE...")
c.execute("ANALYZE;")
conn.commit()

# 7. Otimizar e compactar banco com VACUUM
print("Compactando banco com VACUUM...")
c.execute("VACUUM;")
conn.close()

print(f"Banco local {DB_PATH} higienizado e indexado com sucesso!")

# Sincronizar com api/data/futebol.db
if os.path.exists('api/data'):
    shutil.copy2(DB_PATH, API_DB_PATH)
    print(f"Sincronizado com {API_DB_PATH} ({os.path.getsize(API_DB_PATH)} bytes)")

print("\n--- Concluído com sucesso! ---")
