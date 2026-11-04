import sqlite3
import os

db_path = 'data/futebol.db'

conn = sqlite3.connect(db_path)
c = conn.cursor()

# 1. Criação da tabela criterio_relevancia_efemerides
c.execute("""
CREATE TABLE IF NOT EXISTS criterio_relevancia_efemerides (
    regra_id INTEGER PRIMARY KEY,
    nome TEXT NOT NULL,
    peso INTEGER NOT NULL,
    condicao_sql TEXT NOT NULL,
    descricao TEXT NOT NULL
);
""")

# 2. Povoamento determinístico das regras auditáveis
regras = [
    (1, "Clássico Regional ou Estadual", 30, "is_classico = 1", "Duelo entre rivais tradicionais com alta rivalidade histórica regional ou estadual."),
    (2, "Finais e Decisões de Título", 25, "fase LIKE '%final%' OR fase LIKE '%decisão%'", "Partidas decisivas valendo taça, semifinais ou fases agudas de mata-mata."),
    (3, "Competição Nacional ou Internacional", 15, "campeonato LIKE '%Brasileiro%' OR campeonato LIKE '%Copa do Brasil%' OR campeonato LIKE '%Libertadores%' OR campeonato LIKE '%Mundial%'", "Confrontos de alta relevância no calendário nacional ou continental."),
    (4, "Goleada Histórica", 10, "ABS(gols_mandante - gols_visitante) >= 4 OR (gols_mandante + gols_visitante) >= 6", "Partidas com grande disparidade de gols ou placares altamente atípicos."),
    (5, "Público Notável Documentado", 10, "publico >= 30000 OR (publico IS NOT NULL AND is_classico = 1)", "Confrontos com massiva presença de público registrada em súmula."),
    (6, "Clubes do G12 ou Campeões Nacionais", 10, "mandante IN ('Flamengo', 'Palmeiras', 'Corinthians', 'São Paulo', 'Santos', 'Grêmio', 'Internacional', 'Vasco', 'Fluminense', 'Botafogo', 'Cruzeiro', 'Atlético-MG') OR visitante IN ('Flamengo', 'Palmeiras', 'Corinthians', 'São Paulo', 'Santos', 'Grêmio', 'Internacional', 'Vasco', 'Fluminense', 'Botafogo', 'Cruzeiro', 'Atlético-MG')", "Envolvimento de instituições com maior base de torcedores e títulos no futebol brasileiro.")
]

c.execute("DELETE FROM criterio_relevancia_efemerides")
c.executemany("""
INSERT INTO criterio_relevancia_efemerides (regra_id, nome, peso, condicao_sql, descricao)
VALUES (?, ?, ?, ?, ?)
""", regras)

conn.commit()

# Verificações
c.execute("SELECT COUNT(*) FROM criterio_relevancia_efemerides")
cnt = c.fetchone()[0]
print(f"Regras de relevância cadastradas: {cnt}")

c.execute("PRAGMA journal_mode = DELETE;")
mode = c.fetchone()[0]
print(f"Journal mode: {mode}")

conn.close()

size_mb = os.path.getsize(db_path) / (1024 * 1024)
print(f"Tamanho de data/futebol.db: {size_mb:.2f} MB")
