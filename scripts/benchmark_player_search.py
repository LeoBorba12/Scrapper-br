import sqlite3
import time

conn = sqlite3.connect('data/futebol.db')
c = conn.cursor()

def search_players(term, limit=20):
    t0 = time.time()
    query = """
        WITH atletas_encontrados AS (
            SELECT atleta, clube, 'gol' as tipo FROM gols WHERE atleta LIKE ?
            UNION ALL
            SELECT atleta, clube, 'cartao' as tipo FROM cartoes WHERE atleta LIKE ?
            UNION ALL
            SELECT atleta, clube, 'escalacao' as tipo FROM escalacoes WHERE atleta LIKE ?
        )
        SELECT 
            atleta,
            GROUP_CONCAT(DISTINCT clube) as clubes,
            SUM(CASE WHEN tipo = 'gol' THEN 1 ELSE 0 END) as total_gols,
            SUM(CASE WHEN tipo = 'cartao' THEN 1 ELSE 0 END) as total_cartoes,
            SUM(CASE WHEN tipo = 'escalacao' THEN 1 ELSE 0 END) as total_jogos
        FROM atletas_encontrados
        GROUP BY atleta
        ORDER BY 
            CASE WHEN LOWER(atleta) = LOWER(?) THEN 1
                 WHEN LOWER(atleta) LIKE LOWER(? || '%') THEN 2
                 ELSE 3 END,
            total_gols DESC,
            total_jogos DESC
        LIMIT ?;
    """
    param_like = f"%{term}%"
    rows = c.execute(query, (param_like, param_like, param_like, term, term, limit)).fetchall()
    dt = time.time() - t0
    print(f"Busca por '{term}' retornou {len(rows)} resultados em {dt*1000:.2f}ms:")
    for r in rows[:5]:
        print(" ", r)

search_players("Zico")
search_players("Roberto Dinamite")
search_players("Gabriel")
search_players("Thiago")
search_players("Fagner")

conn.close()
