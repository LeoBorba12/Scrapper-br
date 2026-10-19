import sqlite3

for db_path in ['data/futebol.db', 'api/data/futebol.db']:
    conn = sqlite3.connect(db_path)
    cur = conn.cursor()
    
    # 1. Corrige Gabriel Barros (BID 539977 que estava erroneamente como Gabriel Barbosa no Inter e Atletico-GO)
    cur.execute("UPDATE escalacoes SET atleta = 'Gabriel Barros' WHERE cbf_id = '539977'")
    
    # 2. Corrige gols do Gabigol e clubes oficiais no resumo
    cur.execute("SELECT COUNT(*) FROM gols WHERE atleta = 'Gabriel Barbosa'")
    total_gols = cur.fetchone()[0]
    
    cur.execute("""
        SELECT COUNT(DISTINCT id_partida) FROM (
            SELECT id_partida FROM escalacoes WHERE atleta = 'Gabriel Barbosa'
            UNION
            SELECT id_partida FROM gols WHERE atleta = 'Gabriel Barbosa'
        )
    """)
    total_jogos = cur.fetchone()[0]
    
    cur.execute("""
        UPDATE jogadores_resumo 
        SET clubes = 'Santos,Flamengo,Cruzeiro',
            total_gols = ?,
            total_jogos = ?
        WHERE nome = 'Gabriel Barbosa'
    """, (total_gols, total_jogos))
    
    conn.commit()
    conn.close()
    print(f"Sucesso em {db_path}: Gabigol com {total_gols} gols e {total_jogos} jogos!")
