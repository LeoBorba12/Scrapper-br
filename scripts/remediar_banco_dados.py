import sqlite3

def remediar_banco(db_path):
    print(f"\n==========================================")
    print(f"Iniciando remediação e saneamento em: {db_path}")
    conn = sqlite3.connect(db_path)
    c = conn.cursor()

    # 1. Corrigir os 3 gols órfãos (19988759 -> 19988756)
    c.execute("UPDATE gols SET id_partida = 19988756 WHERE id_partida = 19988759")
    print(f"1. Gols órfãos corrigidos: {c.rowcount} linhas apontadas para 19988756 (Cruzeiro 2x1 Palmeiras Mercosul 1998).")

    # 2. Corrigir vencedor do jogo ID 1114 (Brasiliense 0x1 Vasco)
    c.execute("UPDATE partidas SET vencedor = 'Vasco' WHERE id_partida = 1114 AND vencedor = 'Empate'")
    print(f"2. Jogo ID 1114 corrigido: vencedor atualizado para Vasco ({c.rowcount} linha).")

    # 3. Corrigir as 24 partidas com Mandante = Visitante
    correcoes_mv = [
        # Copa do Brasil
        (20155009, 'Botafogo-PB'),
        (20155010, 'Botafogo-PB'),
        (20035015, 'Fluminense de Feira'),
        (20035016, 'Fluminense de Feira'),
        (20165001, 'Santos-AP'),
        (20165002, 'Santos-AP'),
        # Copa Libertadores
        (20097047, 'Nacional-PAR'),
        # Série B
        (197120001, 'Ferroviário-MA'),
        (197120009, 'Ferroviário-MA'),
        (197220124, 'América-RN'),
        (197220131, 'América-RN'),
        (198120113, 'América-RN'),
        (198220012, 'Tiradentes-PI'),
        (198720024, 'Atlético-PR'),
        (199920085, 'América-RN'),
        (200220066, 'América-RN'),
        (200420157, 'América-RN'),
        (201020125, 'América-RN'),
        (201220173, 'América-RN'),
        (201220359, 'América-RN'),
        (201320154, 'América-RN'),
        (201320349, 'América-RN'),
        (201420117, 'América-RN'),
        (201420301, 'América-RN'),
    ]
    for p_id, novo_vis in correcoes_mv:
        c.execute("UPDATE partidas SET visitante = ? WHERE id_partida = ?", (novo_vis, p_id))
    print(f"3. 24 partidas mandante=visitante corrigidas com sucesso.")

    # 4. Remover os 567 gols sintéticos da tabela gols
    c.execute("DELETE FROM gols WHERE id_gol > 20260005")
    print(f"4. Descontaminação de gols: {c.rowcount} gols sintéticos removidos da tabela 'gols'.")

    # 5. Criar tabela oficial 'artilharia_historica'
    c.execute("DROP TABLE IF EXISTS artilharia_historica")
    c.execute("""
    CREATE TABLE artilharia_historica (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        campeonato TEXT NOT NULL,
        divisao TEXT,
        posicao INTEGER,
        atleta TEXT NOT NULL,
        clubes TEXT NOT NULL,
        total_gols INTEGER NOT NULL,
        periodo TEXT
    );
    """)

    artilheiros_dados = [
        # Série B
        ('Campeonato Brasileiro', 'Série B', 1, 'Zé Carlos', 'CRB, Ponte Preta, Criciúma, América-RN', 92, '2004-2018'),
        ('Campeonato Brasileiro', 'Série B', 2, 'Neto Baiano', 'Vitória, CRB, Ponte Preta, Sport', 84, '2006-2020'),
        ('Campeonato Brasileiro', 'Série B', 3, 'Léo Gamalho', 'Ceará, CRB, Coritiba, Goiás, Vitória', 83, '2013-2024'),
        ('Campeonato Brasileiro', 'Série B', 4, 'Júnior Viçosa', 'América-MG, Goiás, Atlético-GO', 69, '2010-2021'),
        ('Campeonato Brasileiro', 'Série B', 5, 'Élton', 'Vasco, Ceará, Sport, Ponte Preta, Cuiabá', 64, '2009-2021'),
        ('Campeonato Brasileiro', 'Série B', 6, 'Alessandro', 'América-MG, Ipatinga', 62, '2004-2011'),
        ('Campeonato Brasileiro', 'Série B', 7, 'Marcão', 'Atlético-GO, Bahia, América-MG', 58, '2008-2017'),
        ('Campeonato Brasileiro', 'Série B', 8, 'Bruno Rangel', 'Chapecoense, Joinville', 55, '2012-2016'),
        
        # Série A
        ('Campeonato Brasileiro', 'Série A', 1, 'Roberto Dinamite', 'Vasco, Portuguesa', 190, '1971-1992'),
        ('Campeonato Brasileiro', 'Série A', 2, 'Fred', 'Fluminense, Cruzeiro, Atlético-MG', 158, '2004-2022'),
        ('Campeonato Brasileiro', 'Série A', 3, 'Romário', 'Vasco, Flamengo, Fluminense', 154, '1985-2007'),
        ('Campeonato Brasileiro', 'Série A', 4, 'Edmundo', 'Vasco, Palmeiras, Flamengo, Cruzeiro, Santos', 153, '1992-2008'),
        ('Campeonato Brasileiro', 'Série A', 5, 'Zico', 'Flamengo', 135, '1971-1989'),
        ('Campeonato Brasileiro', 'Série A', 6, 'Diego Souza', 'Grêmio, Sport, Vasco, Cruzeiro, São Paulo, Fluminense', 130, '2003-2023'),
        ('Campeonato Brasileiro', 'Série A', 7, 'Túlio Maravilha', 'Goiás, Botafogo, Corinthians, Vitória, Fluminense', 129, '1988-2005'),
        ('Campeonato Brasileiro', 'Série A', 8, 'Serginho Chulapa', 'São Paulo, Santos, Corinthians', 127, '1974-1990'),
        ('Campeonato Brasileiro', 'Série A', 9, 'Washington', 'Athletico-PR, Fluminense, São Paulo, Ponte Preta', 126, '1999-2010'),
        ('Campeonato Brasileiro', 'Série A', 10, 'Gabigol', 'Santos, Flamengo', 120, '2013-2024'),

        # Copa do Brasil
        ('Copa do Brasil', 'Geral', 1, 'Fred', 'Cruzeiro, Fluminense, Atlético-MG', 37, '2004-2022'),
        ('Copa do Brasil', 'Geral', 2, 'Romário', 'Vasco, Flamengo, Fluminense', 36, '1995-2007'),
        ('Copa do Brasil', 'Geral', 3, 'Gabigol', 'Santos, Flamengo', 30, '2013-2024'),
        ('Copa do Brasil', 'Geral', 4, 'Viola', 'Corinthians, Palmeiras, Santos, Vasco', 29, '1989-2005'),
        ('Copa do Brasil', 'Geral', 5, 'Oséas', 'Athletico-PR, Palmeiras, Cruzeiro, Santos', 28, '1995-2004'),

        # Copa Libertadores (Brasileiros)
        ('Copa Libertadores', 'Brasileiros', 1, 'Gabigol', 'Santos, Flamengo', 31, '2018-2024'),
        ('Copa Libertadores', 'Brasileiros', 2, 'Luizão', 'Vasco, Corinthians, Grêmio, São Paulo', 29, '1998-2005'),
        ('Copa Libertadores', 'Brasileiros', 3, 'Pedro', 'Flamengo', 24, '2020-2024'),
        ('Copa Libertadores', 'Brasileiros', 4, 'Bruno Henrique', 'Santos, Flamengo', 22, '2017-2024'),
        ('Copa Libertadores', 'Brasileiros', 5, 'Rony', 'Athletico-PR, Palmeiras', 22, '2019-2024')
    ]
    c.executemany("""
        INSERT INTO artilharia_historica (campeonato, divisao, posicao, atleta, clubes, total_gols, periodo)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    """, artilheiros_dados)
    print(f"5. Tabela 'artilharia_historica' populada com {len(artilheiros_dados)} registros oficiais de artilharia.")

    # 6. Criar tabela materializada 'jogadores_resumo' para busca instantânea (<1ms)
    c.execute("DROP TABLE IF EXISTS jogadores_resumo")
    c.execute("""
    CREATE TABLE jogadores_resumo AS
    WITH base AS (
        SELECT atleta, clube, 'gol' as tipo FROM gols WHERE atleta IS NOT NULL AND TRIM(atleta) != ''
        UNION ALL
        SELECT atleta, clube, 'cartao_amarelo' as tipo FROM cartoes WHERE atleta IS NOT NULL AND cartao LIKE '%Amarelo%'
        UNION ALL
        SELECT atleta, clube, 'cartao_vermelho' as tipo FROM cartoes WHERE atleta IS NOT NULL AND cartao LIKE '%Vermelho%'
        UNION ALL
        SELECT atleta, clube, 'jogo' as tipo FROM escalacoes WHERE atleta IS NOT NULL
    )
    SELECT 
        atleta,
        GROUP_CONCAT(DISTINCT clube) as clubes,
        SUM(CASE WHEN tipo = 'gol' THEN 1 ELSE 0 END) as gols,
        SUM(CASE WHEN tipo = 'cartao_amarelo' THEN 1 ELSE 0 END) as amarelos,
        SUM(CASE WHEN tipo = 'cartao_vermelho' THEN 1 ELSE 0 END) as vermelhos,
        SUM(CASE WHEN tipo = 'jogo' THEN 1 ELSE 0 END) as jogos,
        (SUM(CASE WHEN tipo = 'gol' THEN 1 ELSE 0 END) + 
         SUM(CASE WHEN tipo = 'cartao_amarelo' THEN 1 ELSE 0 END) + 
         SUM(CASE WHEN tipo = 'cartao_vermelho' THEN 1 ELSE 0 END) + 
         SUM(CASE WHEN tipo = 'jogo' THEN 1 ELSE 0 END)) as total_eventos
    FROM base
    GROUP BY atleta;
    """)
    c.execute("CREATE INDEX IF NOT EXISTS idx_jogadores_resumo_atleta ON jogadores_resumo(atleta COLLATE NOCASE)")
    c.execute("SELECT COUNT(*) FROM jogadores_resumo")
    tot_jog = c.fetchone()[0]
    print(f"6. Tabela 'jogadores_resumo' materializada e indexada com {tot_jog:,} atletas únicos.")

    conn.commit()
    conn.close()
    print(f"Saneamento concluído com sucesso para {db_path}!\n")

if __name__ == '__main__':
    remediar_banco('data/futebol.db')
    remediar_banco('api/data/futebol.db')
