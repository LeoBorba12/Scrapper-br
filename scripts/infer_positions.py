import sqlite3

conn = sqlite3.connect('data/futebol.db')
c = conn.cursor()

# 1. Inferir a partir de cartoes
c.execute("""
    UPDATE jogadores_estatisticas
    SET posicao = (
        SELECT cr.posicao 
        FROM cartoes cr 
        WHERE cr.id_jogador = jogadores_estatisticas.id_jogador 
          AND cr.posicao IS NOT NULL 
          AND cr.posicao != ''
        GROUP BY cr.posicao 
        ORDER BY count(*) DESC 
        LIMIT 1
    )
    WHERE (posicao IS NULL OR posicao = '')
      AND EXISTS (
        SELECT 1 FROM cartoes cr 
        WHERE cr.id_jogador = jogadores_estatisticas.id_jogador 
          AND cr.posicao IS NOT NULL 
          AND cr.posicao != ''
      );
""")
print("Posicoes inferidas por cartoes:", c.rowcount)

# 2. Inferir a partir de escalacoes
c.execute("""
    UPDATE jogadores_estatisticas
    SET posicao = (
        SELECT e.posicao 
        FROM escalacoes e 
        WHERE e.id_jogador = jogadores_estatisticas.id_jogador 
          AND e.posicao IS NOT NULL 
          AND e.posicao != ''
        GROUP BY e.posicao 
        ORDER BY count(*) DESC 
        LIMIT 1
    )
    WHERE (posicao IS NULL OR posicao = '')
      AND EXISTS (
        SELECT 1 FROM escalacoes e 
        WHERE e.id_jogador = jogadores_estatisticas.id_jogador 
          AND e.posicao IS NOT NULL 
          AND e.posicao != ''
      );
""")
print("Posicoes inferidas por escalacoes:", c.rowcount)

# 3. Inferir para artilheiros (gols >= 3) sem posicao
c.execute("""
    UPDATE jogadores_estatisticas
    SET posicao = 'Atacante'
    WHERE (posicao IS NULL OR posicao = '')
      AND total_gols >= 3;
""")
print("Artilheiros definidos como Atacante:", c.rowcount)

conn.commit()

c.execute("SELECT count(*) FROM jogadores_estatisticas WHERE posicao IS NOT NULL AND posicao != '';")
print("Total agora com posicao definida:", c.fetchone()[0])

conn.close()
