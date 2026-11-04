import sqlite3
import os

DB_PATH = 'data/futebol.db'

def migrar_nucleo_canonico():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("PRAGMA foreign_keys = OFF;")
    cursor.execute("PRAGMA journal_mode = DELETE;")

    print("[1/7] Criando tabelas do núcleo canônico...")
    cursor.executescript("""
    -- Dimensão Clube
    CREATE TABLE IF NOT EXISTS dim_clube (
        clube_id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT NOT NULL UNIQUE,
        nome_oficial TEXT,
        sigla TEXT,
        estado TEXT,
        pais TEXT DEFAULT 'Brasil',
        fundacao TEXT,
        fonte_id_externa TEXT
    );

    -- Dimensão Competição
    CREATE TABLE IF NOT EXISTS dim_competicao (
        competicao_id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT NOT NULL UNIQUE,
        tipo TEXT DEFAULT 'Nacional',
        pais TEXT DEFAULT 'Brasil',
        confederacao TEXT DEFAULT 'CBF'
    );

    -- Dimensão Temporada
    CREATE TABLE IF NOT EXISTS dim_temporada (
        temporada_id INTEGER PRIMARY KEY AUTOINCREMENT,
        competicao_id INTEGER NOT NULL,
        edicao TEXT NOT NULL,
        ano_inicio INTEGER NOT NULL,
        ano_fim INTEGER,
        formato TEXT,
        FOREIGN KEY (competicao_id) REFERENCES dim_competicao(competicao_id),
        UNIQUE(competicao_id, edicao)
    );

    -- Dimensão Técnico
    CREATE TABLE IF NOT EXISTS dim_tecnico (
        tecnico_id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome_exibicao TEXT NOT NULL UNIQUE,
        pais TEXT DEFAULT 'Brasil',
        data_nascimento TEXT,
        fonte_id_externa TEXT
    );

    -- Dimensão Árbitro
    CREATE TABLE IF NOT EXISTS dim_arbitro (
        arbitro_id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome_exibicao TEXT NOT NULL UNIQUE,
        pais TEXT DEFAULT 'Brasil',
        data_nascimento TEXT,
        fonte_id_externa TEXT
    );

    -- Dimensão Estádio
    CREATE TABLE IF NOT EXISTS dim_estadio (
        estadio_id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT NOT NULL UNIQUE,
        cidade TEXT,
        estado TEXT,
        capacidade INTEGER
    );

    -- Relação Técnico-Clube
    CREATE TABLE IF NOT EXISTS rel_tecnico_clube (
        tecnico_id INTEGER NOT NULL,
        clube_id INTEGER NOT NULL,
        data_inicio TEXT,
        data_fim TEXT,
        partida_id_inicio INTEGER,
        partida_id_fim INTEGER,
        total_jogos INTEGER DEFAULT 0,
        PRIMARY KEY (tecnico_id, clube_id, data_inicio),
        FOREIGN KEY (tecnico_id) REFERENCES dim_tecnico(tecnico_id),
        FOREIGN KEY (clube_id) REFERENCES dim_clube(clube_id)
    );

    -- Resolução de Identidade e Aliases
    CREATE TABLE IF NOT EXISTS dim_entidades_aliases (
        alias_id INTEGER PRIMARY KEY AUTOINCREMENT,
        tipo_entidade TEXT NOT NULL, -- 'clube', 'atleta', 'tecnico', 'arbitro', 'estadio', 'competicao'
        entidade_id INTEGER NOT NULL,
        alias_nome TEXT NOT NULL COLLATE NOCASE,
        fonte TEXT NOT NULL, -- 'ogol', 'cbf', 'sofascore', 'manual', 'canonica'
        confianca REAL DEFAULT 1.0,
        criado_em TEXT DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(tipo_entidade, alias_nome)
    );

    -- Staging de Ingestão e Contrato de Scraper
    CREATE TABLE IF NOT EXISTS staging_entidades (
        staging_id INTEGER PRIMARY KEY AUTOINCREMENT,
        fonte TEXT NOT NULL,
        entidade_tipo TEXT NOT NULL,
        id_externo TEXT,
        nome_bruto TEXT NOT NULL,
        payload_json TEXT NOT NULL,
        completude REAL DEFAULT 1.0,
        confianca TEXT DEFAULT 'alta',
        status_resolucao TEXT DEFAULT 'pendente', -- 'aprovado', 'quarentena', 'conflito'
        motivo_quarentena TEXT,
        hash_payload TEXT NOT NULL,
        criado_em TEXT DEFAULT CURRENT_TIMESTAMP
    );
    """)

    print("[2/7] Povoando dim_clube e aliases a partir do acervo e clubes_perfil...")
    cursor.execute("""
    INSERT OR IGNORE INTO dim_clube (nome, estado)
    SELECT DISTINCT mandante, estado FROM partidas WHERE mandante IS NOT NULL AND mandante != ''
    """)
    cursor.execute("""
    INSERT OR IGNORE INTO dim_clube (nome)
    SELECT DISTINCT visitante FROM partidas WHERE visitante IS NOT NULL AND visitante != ''
    """)
    cursor.execute("""
    UPDATE dim_clube
    SET nome_oficial = (SELECT cp.nome_oficial FROM clubes_perfil cp WHERE cp.nome = dim_clube.nome),
        fundacao = (SELECT cp.fundacao FROM clubes_perfil cp WHERE cp.nome = dim_clube.nome),
        estado = COALESCE((SELECT cp.estado FROM clubes_perfil cp WHERE cp.nome = dim_clube.nome), dim_clube.estado)
    WHERE EXISTS (SELECT 1 FROM clubes_perfil cp WHERE cp.nome = dim_clube.nome)
    """)
    cursor.execute("""
    INSERT OR IGNORE INTO dim_entidades_aliases (tipo_entidade, entidade_id, alias_nome, fonte, confianca)
    SELECT 'clube', clube_id, nome, 'canonica', 1.0 FROM dim_clube
    """)

    print("[3/7] Povoando dim_competicao e dim_temporada a partir do acervo...")
    cursor.execute("""
    INSERT OR IGNORE INTO dim_competicao (nome, tipo)
    SELECT DISTINCT campeonato,
           CASE 
               WHEN campeonato LIKE '%Estadual%' OR campeonato LIKE '%Paulista%' OR campeonato LIKE '%Carioca%' OR campeonato LIKE '%Gaúcho%' OR campeonato LIKE '%Mineiro%' THEN 'Estadual'
               WHEN campeonato LIKE '%Libertadores%' OR campeonato LIKE '%Sul-Americana%' THEN 'Continental'
               WHEN campeonato LIKE '%Copa do Brasil%' THEN 'Copa Nacional'
               ELSE 'Nacional'
           END
    FROM partidas
    WHERE campeonato IS NOT NULL AND campeonato != ''
    """)

    cursor.execute("""
    INSERT OR IGNORE INTO dim_temporada (competicao_id, edicao, ano_inicio, ano_fim, formato)
    SELECT c.competicao_id,
           CAST(p.ano AS TEXT),
           p.ano,
           p.ano,
           COALESCE(p.formato, 'Pontos Corridos')
    FROM partidas p
    JOIN dim_competicao c ON c.nome = p.campeonato
    WHERE p.campeonato IS NOT NULL AND p.ano IS NOT NULL
    GROUP BY c.competicao_id, p.ano
    """)

    print("[4/7] Povoando dim_tecnico a partir do acervo e tecnicos_perfil...")
    cursor.execute("""
    INSERT OR IGNORE INTO dim_tecnico (nome_exibicao)
    SELECT DISTINCT tecnico_mandante FROM partidas WHERE tecnico_mandante IS NOT NULL AND tecnico_mandante != ''
    """)
    cursor.execute("""
    INSERT OR IGNORE INTO dim_tecnico (nome_exibicao)
    SELECT DISTINCT tecnico_visitante FROM partidas WHERE tecnico_visitante IS NOT NULL AND tecnico_visitante != ''
    """)
    cursor.execute("""
    INSERT OR IGNORE INTO dim_tecnico (nome_exibicao, pais)
    SELECT nome, nacionalidade FROM tecnicos_perfil
    """)
    cursor.execute("""
    UPDATE dim_tecnico
    SET pais = (SELECT tp.nacionalidade FROM tecnicos_perfil tp WHERE tp.nome = dim_tecnico.nome_exibicao)
    WHERE EXISTS (SELECT 1 FROM tecnicos_perfil tp WHERE tp.nome = dim_tecnico.nome_exibicao)
    """)
    cursor.execute("""
    INSERT OR IGNORE INTO dim_entidades_aliases (tipo_entidade, entidade_id, alias_nome, fonte, confianca)
    SELECT 'tecnico', tecnico_id, nome_exibicao, 'canonica', 1.0 FROM dim_tecnico
    """)

    print("[5/7] Povoando dim_arbitro a partir do acervo e estatisticas_arbitros...")
    cursor.execute("""
    INSERT OR IGNORE INTO dim_arbitro (nome_exibicao)
    SELECT DISTINCT arbitro FROM partidas WHERE arbitro IS NOT NULL AND arbitro != ''
    """)
    cursor.execute("""
    INSERT OR IGNORE INTO dim_arbitro (nome_exibicao)
    SELECT DISTINCT arbitro FROM estatisticas_arbitros WHERE arbitro IS NOT NULL AND arbitro != ''
    """)
    cursor.execute("""
    INSERT OR IGNORE INTO dim_entidades_aliases (tipo_entidade, entidade_id, alias_nome, fonte, confianca)
    SELECT 'arbitro', arbitro_id, nome_exibicao, 'canonica', 1.0 FROM dim_arbitro
    """)

    print("[6/7] Povoando dim_estadio a partir do acervo...")
    cursor.execute("""
    INSERT OR IGNORE INTO dim_estadio (nome, cidade, estado)
    SELECT DISTINCT estadio, cidade, estado FROM partidas WHERE estadio IS NOT NULL AND estadio != ''
    """)
    cursor.execute("""
    INSERT OR IGNORE INTO dim_entidades_aliases (tipo_entidade, entidade_id, alias_nome, fonte, confianca)
    SELECT 'estadio', estadio_id, nome, 'canonica', 1.0 FROM dim_estadio
    """)

    print("[7/7] Povoando rel_tecnico_clube e aliases de atletas...")
    cursor.execute("""
    INSERT OR REPLACE INTO rel_tecnico_clube (tecnico_id, clube_id, data_inicio, data_fim, partida_id_inicio, partida_id_fim, total_jogos)
    SELECT 
        dt.tecnico_id,
        dc.clube_id,
        MIN(p.data) as data_inicio,
        MAX(p.data) as data_fim,
        MIN(p.id_partida) as partida_id_inicio,
        MAX(p.id_partida) as partida_id_fim,
        COUNT(p.id_partida) as total_jogos
    FROM (
        SELECT tecnico_mandante as tec, mandante as time, data, id_partida FROM partidas WHERE tecnico_mandante IS NOT NULL AND tecnico_mandante != ''
        UNION ALL
        SELECT tecnico_visitante as tec, visitante as time, data, id_partida FROM partidas WHERE tecnico_visitante IS NOT NULL AND tecnico_visitante != ''
    ) p
    JOIN dim_tecnico dt ON dt.nome_exibicao = p.tec
    JOIN dim_clube dc ON dc.nome = p.time
    GROUP BY dt.tecnico_id, dc.clube_id
    """)

    cursor.execute("""
    INSERT OR IGNORE INTO dim_entidades_aliases (tipo_entidade, entidade_id, alias_nome, fonte, confianca)
    SELECT 'atleta', id_jogador, nome_exibicao, 'canonica', 1.0 FROM jogadores WHERE nome_exibicao IS NOT NULL
    """)
    cursor.execute("""
    INSERT OR IGNORE INTO dim_entidades_aliases (tipo_entidade, entidade_id, alias_nome, fonte, confianca)
    SELECT 'atleta', id_jogador, nome_completo, 'ogol', 0.95 FROM jogadores WHERE nome_completo IS NOT NULL AND nome_completo != '' AND nome_completo != nome_exibicao
    """)
    cursor.execute("""
    INSERT OR IGNORE INTO dim_entidades_aliases (tipo_entidade, entidade_id, alias_nome, fonte, confianca)
    SELECT 'atleta', id_jogador, apelido, 'apelido', 0.90 FROM jogadores WHERE apelido IS NOT NULL AND apelido != '' AND apelido != nome_exibicao
    """)

    conn.commit()
    cursor.execute("PRAGMA optimize;")
    conn.close()

    size_mb = os.path.getsize(DB_PATH) / (1024 * 1024)
    print(f"\nMigração concluída com sucesso! Tamanho final do futebol.db: {size_mb:.2f} MB")

if __name__ == '__main__':
    migrar_nucleo_canonico()
