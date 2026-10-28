import sqlite3
import re

def get_destaques(conn):
    c = conn.cursor()
    c.execute("""
        SELECT atleta, GROUP_CONCAT(DISTINCT clube) as clubes, COUNT(*) as total
        FROM gols
        WHERE atleta NOT LIKE '%(%' AND atleta NOT LIKE '% e %' AND LENGTH(atleta) > 2
        GROUP BY atleta
        ORDER BY total DESC
        LIMIT 10;
    """)
    artilheiros = [{"nome": r[0], "clubes": r[1].split(',') if r[1] else [], "total": r[2]} for r in c.fetchall()]

    c.execute("""
        SELECT atleta, GROUP_CONCAT(DISTINCT clube) as clubes, COUNT(*) as total
        FROM cartoes
        WHERE cartao LIKE '%Amarelo%' AND LENGTH(atleta) > 2
        GROUP BY atleta
        ORDER BY total DESC
        LIMIT 10;
    """)
    amarelos = [{"nome": r[0], "clubes": r[1].split(',') if r[1] else [], "total": r[2]} for r in c.fetchall()]

    c.execute("""
        SELECT atleta, GROUP_CONCAT(DISTINCT clube) as clubes, COUNT(*) as total
        FROM cartoes
        WHERE cartao LIKE '%Vermelho%' AND LENGTH(atleta) > 2
        GROUP BY atleta
        ORDER BY total DESC
        LIMIT 10;
    """)
    vermelhos = [{"nome": r[0], "clubes": r[1].split(',') if r[1] else [], "total": r[2]} for r in c.fetchall()]

    return {
        "artilheiros": artilheiros,
        "amarelos": amarelos,
        "vermelhos": vermelhos
    }

conn = sqlite3.connect('data/futebol.db')
print("Destaques:", get_destaques(conn))
conn.close()
