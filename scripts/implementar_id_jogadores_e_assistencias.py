"""
Implementação de ID Exclusivo de Jogadores (OGol ID), Desambiguação e Assistências
===================================================================================
1. Desambigua os diferentes "Paulinhos" da história do futebol brasileiro.
2. Cria tabela mestra `jogadores` com `ogol_id`, `nome_completo`, `nome_exibicao`, `posicao` e `foto_url`.
3. Cria tabela `assistencias` e adiciona `total_assistencias` em `jogadores_resumo`.
4. Popula as assistências consolidadas de craques da Série A e do futebol brasileiro.
5. Replica em data/futebol.db e api/data/futebol.db.
"""

import sqlite3

# Tabela Mestra de Craques com OGol ID, Nome Completo, Posição e Assistências
CRAQUES_MESTRES = [
    {
        "ogol_id": 450166,
        "nome_exibicao": "Paulinho (Atlético-MG)",
        "nome_completo": "Paulo Henrique Sampaio Filho",
        "apelido": "Paulinho",
        "posicao": "Atacante",
        "clubes": "Atlético-MG,Vasco",
        "ano_inicio": 2017,
        "ano_fim": 2026,
        "assistencias": 16
    },
    {
        "ogol_id": 81486,
        "nome_exibicao": "Paulinho (Corinthians)",
        "nome_completo": "José Paulo Bezerra Maciel Júnior",
        "apelido": "Paulinho",
        "posicao": "Meio-campo",
        "clubes": "Corinthians",
        "ano_inicio": 2010,
        "ano_fim": 2024,
        "assistencias": 18
    },
    {
        "ogol_id": 174070,
        "nome_exibicao": "Paulinho McLaren",
        "nome_completo": "Paulo César Vieira Rosa",
        "apelido": "Paulinho McLaren",
        "posicao": "Atacante",
        "clubes": "Santos,Cruzeiro,Internacional,Portuguesa",
        "ano_inicio": 1989,
        "ano_fim": 1995,
        "assistencias": 12
    },
    {
        "ogol_id": 82512,
        "nome_exibicao": "Paulinho (Flamengo)",
        "nome_completo": "Paulo Luiz Beraldo Santos",
        "apelido": "Paulinho",
        "posicao": "Atacante",
        "clubes": "Flamengo,Santos",
        "ano_inicio": 2013,
        "ano_fim": 2017,
        "assistencias": 15
    },
    {
        "ogol_id": 296660,
        "nome_exibicao": "Paulinho Moccelin",
        "nome_completo": "Paulo Roberto Moccelin",
        "apelido": "Paulinho Moccelin",
        "posicao": "Atacante",
        "clubes": "Juventude,Sport,Coritiba,Chapecoense",
        "ano_inicio": 2014,
        "ano_fim": 2026,
        "assistencias": 11
    },
    {
        "ogol_id": 119864,
        "nome_exibicao": "Paulinho Criciúma",
        "nome_completo": "Paulo Roberto Rocha",
        "apelido": "Paulinho Criciúma",
        "posicao": "Atacante",
        "clubes": "Botafogo,Bangu,Internacional",
        "ano_inicio": 1984,
        "ano_fim": 1992,
        "assistencias": 14
    },
    {
        "ogol_id": 75171,
        "nome_exibicao": "Gabriel Barbosa",
        "nome_completo": "Gabriel Barbosa Almeida",
        "apelido": "Gabigol",
        "posicao": "Atacante",
        "clubes": "Flamengo,Santos,Cruzeiro",
        "ano_inicio": 2013,
        "ano_fim": 2026,
        "assistencias": 43
    },
    {
        "ogol_id": 182744,
        "nome_exibicao": "Arrascaeta",
        "nome_completo": "Giorgian Daniel De Arrascaeta Benedetti",
        "apelido": "Arrascaeta",
        "posicao": "Meio-campo",
        "clubes": "Flamengo,Cruzeiro",
        "ano_inicio": 2015,
        "ano_fim": 2026,
        "assistencias": 98
    },
    {
        "ogol_id": 31583,
        "nome_exibicao": "Hulk",
        "nome_completo": "Givanildo Vieira de Sousa",
        "apelido": "Hulk",
        "posicao": "Atacante",
        "clubes": "Atlético-MG,Vitória",
        "ano_inicio": 2004,
        "ano_fim": 2026,
        "assistencias": 36
    },
    {
        "ogol_id": 481134,
        "nome_exibicao": "Pedro",
        "nome_completo": "Pedro Guilherme Abreu dos Santos",
        "apelido": "Pedro",
        "posicao": "Atacante",
        "clubes": "Flamengo,Fluminense",
        "ano_inicio": 2016,
        "ano_fim": 2026,
        "assistencias": 25
    },
    {
        "ogol_id": 41818,
        "nome_exibicao": "Germán Cano",
        "nome_completo": "Germán Ezequiel Cano Recalde",
        "apelido": "Cano",
        "posicao": "Atacante",
        "clubes": "Fluminense,Vasco",
        "ano_inicio": 2020,
        "ano_fim": 2026,
        "assistencias": 14
    },
    {
        "ogol_id": 139591,
        "nome_exibicao": "Raphael Veiga",
        "nome_completo": "Raphael Cavalcante Veiga",
        "apelido": "Raphael Veiga",
        "posicao": "Meio-campo",
        "clubes": "Palmeiras,Athletico-PR,Coritiba",
        "ano_inicio": 2016,
        "ano_fim": 2026,
        "assistencias": 45
    },
    {
        "ogol_id": 103001,
        "nome_exibicao": "Dudu",
        "nome_completo": "Eduardo Pereira Rodrigues",
        "apelido": "Dudu",
        "posicao": "Atacante",
        "clubes": "Palmeiras,Grêmio,Cruzeiro",
        "ano_inicio": 2009,
        "ano_fim": 2026,
        "assistencias": 95
    },
    {
        "ogol_id": 32367,
        "nome_exibicao": "Everton Ribeiro",
        "nome_completo": "Éverton Augusto de Barros Ribeiro",
        "apelido": "Everton Ribeiro",
        "posicao": "Meio-campo",
        "clubes": "Bahia,Flamengo,Cruzeiro,Coritiba,Corinthians",
        "ano_inicio": 2007,
        "ano_fim": 2026,
        "assistencias": 91
    },
    {
        "ogol_id": 269781,
        "nome_exibicao": "Gustavo Scarpa",
        "nome_completo": "Gustavo Henrique Furtado Scarpa",
        "apelido": "Gustavo Scarpa",
        "posicao": "Meio-campo",
        "clubes": "Atlético-MG,Palmeiras,Fluminense",
        "ano_inicio": 2014,
        "ano_fim": 2026,
        "assistencias": 77
    },
    {
        "ogol_id": 61771,
        "nome_exibicao": "Paulo Henrique Ganso",
        "nome_completo": "Paulo Henrique Chagas de Lima",
        "apelido": "Ganso",
        "posicao": "Meio-campo",
        "clubes": "Fluminense,São Paulo,Santos",
        "ano_inicio": 2008,
        "ano_fim": 2026,
        "assistencias": 86
    }
]

def aplicar_migracao(db_path: str):
    print(f"\n=======================================================")
    print(f"   APLICANDO ID EXCLUSIVO E ASSISTÊNCIAS EM {db_path}")
    print(f"=======================================================\n")

    conn = sqlite3.connect(db_path)
    c = conn.cursor()

    # 1. Cria tabela mestra `jogadores`
    c.execute("""
        CREATE TABLE IF NOT EXISTS jogadores (
            id_jogador INTEGER PRIMARY KEY AUTOINCREMENT,
            ogol_id INTEGER UNIQUE,
            nome_exibicao TEXT NOT NULL,
            nome_completo TEXT,
            apelido TEXT,
            posicao TEXT,
            clubes TEXT,
            ano_inicio INTEGER,
            ano_fim INTEGER,
            total_jogos INTEGER DEFAULT 0,
            total_gols INTEGER DEFAULT 0,
            total_assistencias INTEGER DEFAULT 0,
            total_amarelos INTEGER DEFAULT 0,
            total_vermelhos INTEGER DEFAULT 0
        )
    """)

    # 2. Cria tabela `assistencias`
    c.execute("""
        CREATE TABLE IF NOT EXISTS assistencias (
            id_assistencia INTEGER PRIMARY KEY AUTOINCREMENT,
            id_partida INTEGER,
            clube TEXT,
            atleta TEXT,
            id_jogador INTEGER,
            minuto TEXT
        )
    """)

    # 3. Adiciona coluna `total_assistencias` a `jogadores_resumo` se não existir
    cols_resumo = [col[1] for col in c.execute("PRAGMA table_info(jogadores_resumo)").fetchall()]
    if "total_assistencias" not in cols_resumo:
        c.execute("ALTER TABLE jogadores_resumo ADD COLUMN total_assistencias INTEGER DEFAULT 0")

    # 4. Desambiguação dos Paulinhos na tabela gols
    # 4.1. Paulinho do Galo (Paulo Henrique Sampaio Filho): Galo (2023-2026) e Vasco (2017-2018)
    c.execute("""
        UPDATE gols 
        SET atleta = 'Paulinho (Atlético-MG)'
        WHERE atleta = 'Paulinho' AND (
            clube = 'Atlético-MG' OR 
            (clube = 'Vasco' AND id_partida IN (SELECT id_partida FROM partidas WHERE ano >= 2017))
        )
    """)

    # 4.2. Paulinho do Corinthians (José Paulo Bezerra Maciel Jr): Corinthians pós-2010
    c.execute("""
        UPDATE gols 
        SET atleta = 'Paulinho (Corinthians)'
        WHERE atleta = 'Paulinho' AND (
            clube LIKE '%Corinthians%' AND id_partida IN (SELECT id_partida FROM partidas WHERE ano >= 2010)
        )
    """)

    # 4.3. Paulinho McLaren: Santos (1989-1993), Cruzeiro, Inter, Portuguesa nos anos 90
    c.execute("""
        UPDATE gols 
        SET atleta = 'Paulinho McLaren'
        WHERE atleta = 'Paulinho' AND (
            (clube = 'Santos' AND id_partida IN (SELECT id_partida FROM partidas WHERE ano BETWEEN 1989 AND 1993)) OR
            clube IN ('Cruzeiro', 'Internacional', 'Portuguesa')
        )
    """)

    # 4.4. Paulinho do Flamengo (Paulo Luiz Beraldo Santos): Flamengo (2013-2015), Santos (2016)
    c.execute("""
        UPDATE gols 
        SET atleta = 'Paulinho (Flamengo)'
        WHERE atleta = 'Paulinho' AND (
            (clube = 'Flamengo' AND id_partida IN (SELECT id_partida FROM partidas WHERE ano BETWEEN 2013 AND 2016)) OR
            (clube = 'Santos' AND id_partida IN (SELECT id_partida FROM partidas WHERE ano = 2016))
        )
    """)

    # 4.5. Paulinho Criciúma: Botafogo, Bangu nos anos 80
    c.execute("""
        UPDATE gols 
        SET atleta = 'Paulinho Criciúma'
        WHERE atleta = 'Paulinho' AND clube IN ('Botafogo', 'Bangu')
    """)

    # 4.6. Corrige gols de Paulinho com minuto grudado no nome ("Paulinho 26'", etc.)
    c.execute("""
        UPDATE gols 
        SET atleta = 'Paulinho (Atlético-MG)',
            minuto = REPLACE(REPLACE(atleta, 'Paulinho ', ''), '''', '')
        WHERE atleta LIKE 'Paulinho %''' AND clube IN ('Atlético-MG', 'Atletico-MG')
    """)
    c.execute("""
        UPDATE gols 
        SET atleta = 'Paulinho (Botafogo-SP)',
            minuto = REPLACE(REPLACE(atleta, 'Paulinho ', ''), '''', '')
        WHERE atleta LIKE 'Paulinho %''' AND clube = 'Botafogo-SP'
    """)

    # 4.7. Paulinho Histórico Anos 70/80 (demais clubes)
    c.execute("""
        UPDATE gols 
        SET atleta = 'Paulinho (Histórico Anos 70/80)'
        WHERE atleta = 'Paulinho'
    """)

    # Atualiza também em escalações e cartões
    c.execute("""
        UPDATE escalacoes 
        SET atleta = 'Paulinho (Atlético-MG)' 
        WHERE atleta LIKE 'Paulinho Paulo Henrique Sampa%' OR (atleta = 'Paulinho' AND clube IN ('Atlético-MG', 'Atlético Mineiro', 'Atletico-MG'))
    """)
    c.execute("""
        UPDATE escalacoes 
        SET atleta = 'Paulinho (Corinthians)' 
        WHERE atleta LIKE 'Paulinho Jose Paulo Bezerra%' OR (atleta = 'Paulinho' AND clube LIKE '%Corinthians%')
    """)
    c.execute("""
        UPDATE escalacoes 
        SET atleta = 'Paulinho Paula' 
        WHERE atleta LIKE 'Paulinho Paulo Lucas Santos%'
    """)
    c.execute("""
        UPDATE escalacoes 
        SET atleta = 'Paulinho (Vasco)' 
        WHERE atleta LIKE 'Paulinho Paulo Ricardo de Sou%'
    """)

    # Cartões
    c.execute("""
        UPDATE cartoes 
        SET atleta = 'Paulinho (Atlético-MG)' 
        WHERE atleta LIKE 'Paulinho Paulo Henrique Sampa%' 
           OR (atleta = 'Paulinho' AND clube IN ('Atlético-MG', 'Atletico-MG', 'Atlético Mineiro'))
           OR (atleta = 'Paulinho' AND clube = 'Vasco' AND id_partida IN (SELECT id_partida FROM partidas WHERE ano <= 2018))
    """)
    c.execute("""
        UPDATE cartoes 
        SET atleta = 'Paulinho Paula' 
        WHERE atleta = 'Paulinho' AND clube = 'Vasco' AND id_partida IN (SELECT id_partida FROM partidas WHERE ano >= 2023)
    """)
    c.execute("""
        UPDATE cartoes 
        SET atleta = 'Paulinho (Corinthians)' 
        WHERE atleta LIKE 'Paulinho Jose Paulo Bezerra%' OR (atleta = 'Paulinho' AND clube LIKE '%Corinthians%')
    """)
    c.execute("""
        UPDATE cartoes 
        SET atleta = 'Paulinho (Flamengo)' 
        WHERE atleta = 'Paulinho' AND (
            (clube = 'Flamengo' AND id_partida IN (SELECT id_partida FROM partidas WHERE ano BETWEEN 2013 AND 2016)) OR
            (clube = 'Santos' AND id_partida IN (SELECT id_partida FROM partidas WHERE ano = 2016))
        )
    """)

    # 5. Popula a tabela mestra `jogadores` e sincroniza com `jogadores_resumo`
    for cr in CRAQUES_MESTRES:
        nome_exib = cr["nome_exibicao"]
        c.execute("SELECT count(*) FROM gols WHERE atleta = ?", (nome_exib,))
        tot_gols = c.fetchone()[0]

        c.execute("SELECT count(DISTINCT id_partida) FROM escalacoes WHERE atleta = ?", (nome_exib,))
        tot_jogos = max(c.fetchone()[0], tot_gols)

        c.execute("SELECT count(*) FROM cartoes WHERE atleta = ? AND cartao LIKE '%Amarelo%'", (nome_exib,))
        amarelos = c.fetchone()[0]

        c.execute("SELECT count(*) FROM cartoes WHERE atleta = ? AND cartao LIKE '%Vermelho%'", (nome_exib,))
        vermelhos = c.fetchone()[0]

        # Upsert na tabela jogadores
        c.execute("""
            INSERT INTO jogadores (
                ogol_id, nome_exibicao, nome_completo, apelido, posicao, clubes,
                ano_inicio, ano_fim, total_jogos, total_gols, total_assistencias, total_amarelos, total_vermelhos
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(ogol_id) DO UPDATE SET
                nome_exibicao = excluded.nome_exibicao,
                nome_completo = excluded.nome_completo,
                apelido = excluded.apelido,
                posicao = excluded.posicao,
                clubes = excluded.clubes,
                total_jogos = excluded.total_jogos,
                total_gols = excluded.total_gols,
                total_assistencias = excluded.total_assistencias,
                total_amarelos = excluded.total_amarelos,
                total_vermelhos = excluded.total_vermelhos
        """, (
            cr["ogol_id"], nome_exib, cr["nome_completo"], cr["apelido"], cr["posicao"], cr["clubes"],
            cr["ano_inicio"], cr["ano_fim"], tot_jogos, tot_gols, cr["assistencias"], amarelos, vermelhos
        ))

        # Atualiza ou insere em jogadores_resumo
        c.execute("DELETE FROM jogadores_resumo WHERE nome = ?", (nome_exib,))
        c.execute("""
            INSERT INTO jogadores_resumo (nome, clubes, total_jogos, total_gols, total_assistencias, total_amarelos, total_vermelhos, ano_min, ano_max)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (nome_exib, cr["clubes"], tot_jogos, tot_gols, cr["assistencias"], amarelos, vermelhos, cr["ano_inicio"], cr["ano_fim"]))

    # Limpa o "Paulinho" genérico e resíduos na jogadores_resumo
    c.execute("DELETE FROM jogadores_resumo WHERE nome = 'Paulinho'")
    c.execute("DELETE FROM jogadores_resumo WHERE nome LIKE 'Paulinho %'''")
    c.execute("DELETE FROM jogadores_resumo WHERE nome LIKE 'Paulinho Jose Paulo%'")
    c.execute("DELETE FROM jogadores_resumo WHERE nome LIKE 'Paulinho Paulo Henrique%'")
    c.execute("DELETE FROM jogadores_resumo WHERE nome LIKE 'Paulinho Paulo Lucas%'")
    c.execute("DELETE FROM jogadores_resumo WHERE nome LIKE 'Paulinho Paulo Ricardo%'")

    conn.commit()
    conn.close()
    print(f" -> {db_path}: Migração de IDs e Assistências concluída!")

if __name__ == "__main__":
    aplicar_migracao("data/futebol.db")
    aplicar_migracao("api/data/futebol.db")
