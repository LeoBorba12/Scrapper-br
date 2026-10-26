import sqlite3

conn = sqlite3.connect('data/futebol.db')
c = conn.cursor()

# 1. Corrigir gol 75451 (Fluminense 2 x 0 Emelec)
c.execute("UPDATE gols SET clube = 'Fluminense' WHERE id_gol = 75451;")

# 2. Criar ou obter registros para os homônimos de Fred
# Fred (Meia - Inter / Man United)
c.execute("""
    INSERT OR IGNORE INTO jogadores_estatisticas (
        id_jogador, nome_exibicao, nome_completo, apelido, posicao, clubes, total_gols
    ) VALUES (
        90001, 'Fred (Meia)', 'Frederico Rodrigues de Paula Santos', 'Fred', 'Meia', 'Internacional', 9
    );
""")

# Fred (Zagueiro - Goiás / Grêmio)
c.execute("""
    INSERT OR IGNORE INTO jogadores_estatisticas (
        id_jogador, nome_exibicao, nome_completo, apelido, posicao, clubes, total_gols
    ) VALUES (
        90002, 'Fred (Zagueiro)', 'Frederico Burgel Xavier', 'Fred', 'Zagueiro', 'Goiás,Grêmio,Novo Hamburgo,Juventude', 15
    );
""")

# Fred (Histórico Anos 70)
c.execute("""
    INSERT OR IGNORE INTO jogadores_estatisticas (
        id_jogador, nome_exibicao, nome_completo, apelido, posicao, clubes, total_gols
    ) VALUES (
        90003, 'Fred (Anos 70)', 'Frederico de Oliveira', 'Fred', 'Atacante', 'Vasco,Figueirense,Botafogo', 4
    );
""")

# 3. Reatribuir gols dos homônimos
# Inter -> 90001
c.execute("UPDATE gols SET id_jogador = 90001 WHERE id_jogador = 6051 AND clube = 'Internacional';")
c.execute("UPDATE cartoes SET id_jogador = 90001 WHERE id_jogador = 6051 AND clube = 'Internacional';")
c.execute("UPDATE escalacoes SET id_jogador = 90001 WHERE id_jogador = 6051 AND clube = 'Internacional';")

# Goiás, Grêmio, Novo Hamburgo, Ypiranga-RS, União Frederiquense, Juventude -> 90002
c.execute("""
    UPDATE gols SET id_jogador = 90002 
    WHERE id_jogador = 6051 
      AND clube IN ('Goiás', 'Grêmio', 'Novo Hamburgo', 'Ypiranga-RS', 'União Frederiquense', 'Juventude');
""")
c.execute("""
    UPDATE cartoes SET id_jogador = 90002 
    WHERE id_jogador = 6051 
      AND clube IN ('Goiás', 'Grêmio', 'Novo Hamburgo', 'Ypiranga-RS', 'União Frederiquense', 'Juventude', 'Goias', 'Gremio');
""")
c.execute("""
    UPDATE escalacoes SET id_jogador = 90002 
    WHERE id_jogador = 6051 
      AND clube IN ('Goiás', 'Grêmio', 'Novo Hamburgo', 'Ypiranga-RS', 'União Frederiquense', 'Juventude', 'Goias', 'Gremio');
""")

# Vasco, Figueirense, Botafogo (anos 70) -> 90003
c.execute("""
    UPDATE gols SET id_jogador = 90003 
    WHERE id_jogador = 6051 
      AND clube IN ('Vasco', 'Figueirense', 'Botafogo');
""")
c.execute("""
    UPDATE cartoes SET id_jogador = 90003 
    WHERE id_jogador = 6051 
      AND clube IN ('Vasco', 'Figueirense', 'Botafogo');
""")
c.execute("""
    UPDATE escalacoes SET id_jogador = 90003 
    WHERE id_jogador = 6051 
      AND clube IN ('Vasco', 'Figueirense', 'Botafogo');
""")

# Outros clubes residuais (Vitória 2017, Sertãozinho)
c.execute("""
    UPDATE gols SET id_jogador = NULL 
    WHERE id_jogador = 6051 
      AND clube NOT IN ('Fluminense', 'Cruzeiro', 'Atlético-MG', 'Atlético Mineiro', 'América-MG', 'América Mineiro');
""")
c.execute("""
    UPDATE cartoes SET id_jogador = NULL 
    WHERE id_jogador = 6051 
      AND clube NOT IN ('Fluminense', 'Cruzeiro', 'Atlético-MG', 'Atlético Mineiro', 'América-MG', 'América Mineiro', 'Atletico-MG', 'America-MG');
""")

# 4. Atualizar registro canônico de Fred (6051)
c.execute("""
    SELECT count(*), 
           sum(CASE WHEN lower(tipo_de_gol) LIKE '%penalti%' OR lower(tipo_de_gol) LIKE '%pênalti%' THEN 1 ELSE 0 END),
           sum(CASE WHEN lower(tipo_de_gol) LIKE '%falta%' THEN 1 ELSE 0 END)
    FROM gols 
    WHERE id_jogador = 6051;
""")
total_gols, penaltis, faltas = c.fetchone()
bola_rolando = total_gols - (penaltis or 0) - (faltas or 0)

c.execute("""
    UPDATE jogadores_estatisticas
    SET posicao = 'Atacante',
        clubes = 'Fluminense,Cruzeiro,Atlético-MG,América-MG',
        total_gols = ?,
        gols_penalti = ?,
        gols_falta = ?,
        gols_bola_rolando = ?
    WHERE id_jogador = 6051;
""", (total_gols, penaltis, faltas, bola_rolando))

conn.commit()

# Verificações finais
c.execute("SELECT id_jogador, nome_exibicao, posicao, clubes, total_gols FROM jogadores_estatisticas WHERE id_jogador = 6051;")
print("Fred canônico após higienização:", c.fetchone())

c.execute("SELECT clube, count(*) FROM gols WHERE id_jogador = 6051 GROUP BY clube;")
print("Gols por clube de Fred canônico:", c.fetchall())

c.execute("SELECT clube, count(*) FROM cartoes WHERE id_jogador = 6051 GROUP BY clube;")
print("Cartões por clube de Fred canônico:", c.fetchall())

conn.close()
