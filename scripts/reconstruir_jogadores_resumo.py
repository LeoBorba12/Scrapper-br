"""
Reconstrutor e Sincronizador de jogadores_resumo
================================================
Consolida os totais de gols (tabela `gols`), cartões (`cartoes`) e jogos (`escalacoes` + `gols`)
para todos os jogadores, eliminando fragmentações e atualizando as estatísticas reais.
"""

import sqlite3

def reconstruir_resumo(db_path: str):
    print(f"\n=== RECONSTRUINDO JOGADORES_RESUMO EM {db_path} ===")
    conn = sqlite3.connect(db_path)
    c = conn.cursor()

    # 1. Cria tabela temporária limpa com base em todos os atletas de gols e escalações
    c.execute("""
        CREATE TEMP TABLE temp_atletas AS
        SELECT DISTINCT atleta as nome, clube FROM gols WHERE atleta IS NOT NULL AND LENGTH(atleta) > 2
        UNION
        SELECT DISTINCT atleta as nome, clube FROM escalacoes WHERE atleta IS NOT NULL AND LENGTH(atleta) > 2
        UNION
        SELECT DISTINCT atleta as nome, clube FROM cartoes WHERE atleta IS NOT NULL AND LENGTH(atleta) > 2
    """)

    # 2. Atualiza totais de gols diretamente da tabela gols atualizada
    c.execute("""
        CREATE TEMP TABLE temp_totais_gols AS
        SELECT atleta, COUNT(*) as total_gols, GROUP_CONCAT(DISTINCT clube) as clubes_gols
        FROM gols
        GROUP BY atleta
    """)

    # 3. Atualiza totais de cartoes
    c.execute("""
        CREATE TEMP TABLE temp_totais_cartoes AS
        SELECT 
            atleta,
            SUM(CASE WHEN cartao LIKE '%Amarelo%' THEN 1 ELSE 0 END) as total_amarelos,
            SUM(CASE WHEN cartao LIKE '%Vermelho%' THEN 1 ELSE 0 END) as total_vermelhos
        FROM cartoes
        GROUP BY atleta
    """)

    # 4. Atualiza totais de partidas de escalações
    c.execute("""
        CREATE TEMP TABLE temp_totais_jogos AS
        SELECT atleta, COUNT(DISTINCT id_partida) as total_jogos, GROUP_CONCAT(DISTINCT clube) as clubes_jogos
        FROM escalacoes
        GROUP BY atleta
    """)

    # Atualiza a tabela jogadores_resumo existente com os novos totais de gols
    c.execute("""
        UPDATE jogadores_resumo
        SET total_gols = COALESCE((
            SELECT tg.total_gols FROM temp_totais_gols tg WHERE tg.atleta = jogadores_resumo.nome
        ), 0)
    """)

    # Para jogadores que têm gols mas não estavam em jogadores_resumo, insere
    c.execute("""
        INSERT OR IGNORE INTO jogadores_resumo (nome, clubes, total_jogos, total_gols, total_amarelos, total_vermelhos, ano_min, ano_max)
        SELECT 
            tg.atleta,
            tg.clubes_gols,
            COALESCE(tj.total_jogos, tg.total_gols),
            tg.total_gols,
            COALESCE(tc.total_amarelos, 0),
            COALESCE(tc.total_vermelhos, 0),
            (SELECT MIN(p.ano) FROM gols g JOIN partidas p ON g.id_partida = p.id_partida WHERE g.atleta = tg.atleta),
            (SELECT MAX(p.ano) FROM gols g JOIN partidas p ON g.id_partida = p.id_partida WHERE g.atleta = tg.atleta)
        FROM temp_totais_gols tg
        LEFT JOIN temp_totais_jogos tj ON tg.atleta = tj.atleta
        LEFT JOIN temp_totais_cartoes tc ON tg.atleta = tc.atleta
        WHERE tg.atleta NOT IN (SELECT nome FROM jogadores_resumo)
    """)

    # Para jogadores com jogos registrados que tinham total_jogos < total_gols, ajusta
    c.execute("""
        UPDATE jogadores_resumo
        SET total_jogos = total_gols
        WHERE total_jogos < total_gols
    """)

    conn.commit()

    # Confere principais craques
    print("Conferência de jogadores atualizados:")
    for nome in ["Gabriel Barbosa", "Hulk", "Pedro", "Germán Cano", "Arrascaeta", "Dudu", "Zico", "Pelé"]:
        c.execute("SELECT nome, clubes, total_jogos, total_gols, total_amarelos FROM jogadores_resumo WHERE nome LIKE ? LIMIT 1", (f"%{nome}%",))
        row = c.fetchone()
        if row:
            print(f"  {row[0]:<16}: {row[3]} jogos | {row[2]} gols | Clubes: {row[1]}")

    conn.close()

if __name__ == "__main__":
    reconstruir_resumo("data/futebol.db")
    reconstruir_resumo("api/data/futebol.db")
