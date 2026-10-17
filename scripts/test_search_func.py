import sqlite3

conn = sqlite3.connect('data/futebol.db')
c = conn.cursor()

def search_jogadores(termo, limit=20):
    termo = termo.strip()
    if not termo:
        return []
        
    param_like = f"%{termo}%"
    
    # Query aggregated stats across gols and cartoes
    # For escalacoes, only include if not already represented or clean name
    sql = """
        WITH base AS (
            SELECT atleta, clube, 'gol' as tipo FROM gols WHERE atleta LIKE ?
            UNION ALL
            SELECT atleta, clube, 'cartao_amarelo' as tipo FROM cartoes WHERE atleta LIKE ? AND cartao LIKE '%Amarelo%'
            UNION ALL
            SELECT atleta, clube, 'cartao_vermelho' as tipo FROM cartoes WHERE atleta LIKE ? AND cartao LIKE '%Vermelho%'
            UNION ALL
            SELECT atleta, clube, 'jogo' as tipo FROM escalacoes WHERE atleta LIKE ?
        )
        SELECT 
            atleta,
            GROUP_CONCAT(DISTINCT clube) as clubes,
            SUM(CASE WHEN tipo = 'gol' THEN 1 ELSE 0 END) as gols,
            SUM(CASE WHEN tipo = 'cartao_amarelo' THEN 1 ELSE 0 END) as amarelos,
            SUM(CASE WHEN tipo = 'cartao_vermelho' THEN 1 ELSE 0 END) as vermelhos,
            SUM(CASE WHEN tipo = 'jogo' THEN 1 ELSE 0 END) as jogos
        FROM base
        GROUP BY atleta
        HAVING (gols + amarelos + vermelhos + jogos) > 0
        ORDER BY 
            CASE 
                WHEN LOWER(atleta) = LOWER(?) THEN 1
                WHEN LOWER(atleta) LIKE LOWER(? || ' %') THEN 2
                WHEN LOWER(atleta) LIKE LOWER(? || '%') THEN 3
                ELSE 4 
            END,
            gols DESC,
            (amarelos + vermelhos) DESC,
            jogos DESC
        LIMIT ?;
    """
    rows = c.execute(sql, (param_like, param_like, param_like, param_like, termo, termo, termo, limit)).fetchall()
    results = []
    for r in rows:
        results.append({
            "nome": r[0],
            "clubes": r[1].split(',') if r[1] else [],
            "gols": r[2],
            "amarelos": r[3],
            "vermelhos": r[4],
            "jogos": r[5]
        })
    return results

print("Busca 'Zico':", search_jogadores("Zico", 5))
print("\nBusca 'Roberto Dinamite':", search_jogadores("Roberto Dinamite", 5))
print("\nBusca 'Thiago Heleno':", search_jogadores("Thiago Heleno", 5))
print("\nBusca 'Fagner':", search_jogadores("Fagner", 5))

conn.close()
