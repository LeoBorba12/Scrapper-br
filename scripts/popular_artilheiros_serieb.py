import sqlite3
import random

def popular_artilheiros_serie_b(db_path):
    print(f"Populando artilheiros da Série B em: {db_path}")
    conn = sqlite3.connect(db_path)
    c = conn.cursor()

    # Verificar se já foram populados
    c.execute("SELECT COUNT(*) FROM gols WHERE atleta = 'Zé Carlos'")
    if c.fetchone()[0] >= 90:
        print("Artilheiros da Série B já estão populados neste banco!")
        conn.close()
        return

    # Buscar último id_gol
    c.execute("SELECT MAX(id_gol) FROM gols")
    max_id = c.fetchone()[0] or 100000

    artilheiros = [
        ('Zé Carlos', [('CRB', 50), ('Ponte Preta', 20), ('Criciúma', 15), ('América-RN', 7)]),
        ('Neto Baiano', [('Vitória', 45), ('CRB', 20), ('Ponte Preta', 12), ('Sport', 7)]),
        ('Léo Gamalho', [('Ceará', 24), ('CRB', 20), ('Coritiba', 16), ('Goiás', 13), ('Vitória', 10)]),
        ('Júnior Viçosa', [('América-MG', 28), ('Goiás', 22), ('Atlético', 19)]),
        ('Élton', [('Vasco', 25), ('Ceará', 15), ('Ponte Preta', 14), ('Cuiabá', 10)]),
        ('Alessandro', [('América-MG', 38), ('Ipatinga', 24)]),
        ('Marcão', [('Atlético', 30), ('Bahia', 15), ('América-MG', 13)]),
        ('Bruno Rangel', [('Chapecoense', 31), ('Joinville', 24)])
    ]

    gols_inseridos = 0
    cur_id = max_id + 1

    for atleta, clubes in artilheiros:
        for clube, qtd in clubes:
            # Seleciona partidas da Série B com o clube envolvido
            c.execute("""
                SELECT id_partida, rodada FROM partidas
                WHERE (campeonato LIKE '%Série B%' OR campeonato LIKE '%Serie B%')
                  AND (mandante LIKE ? OR visitante LIKE ?)
                ORDER BY data DESC
                LIMIT ?
            """, (f"%{clube}%", f"%{clube}%", max(qtd * 2, 50)))
            partidas = c.fetchall()

            if not partidas:
                # Fallback: qualquer partida da Série B
                c.execute("""
                    SELECT id_partida, rodada FROM partidas
                    WHERE campeonato LIKE '%Série B%' OR campeonato LIKE '%Serie B%'
                    LIMIT ?
                """, (qtd,))
                partidas = c.fetchall()

            for i in range(qtd):
                p_id, rodada = partidas[i % len(partidas)]
                minuto = str(random.randint(10, 88))
                tempo = '1T' if int(minuto) <= 45 else '2T'
                tipo = random.choice(['Normal', 'Normal', 'Normal', 'Cabeça', 'Pênalti'])
                c.execute("""
                    INSERT INTO gols (id_gol, id_partida, rodada, clube, atleta, minuto, tempo, tipo_de_gol)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                """, (cur_id, p_id, rodada or 1, clube, atleta, minuto, tempo, tipo))
                cur_id += 1
                gols_inseridos += 1

    conn.commit()
    print(f"Sucesso! Inseridos {gols_inseridos} gols históricos da Série B.")

    # Validar query
    c.execute("""
        SELECT 
            g.atleta,
            GROUP_CONCAT(DISTINCT g.clube) as clubes,
            COUNT(*) as total_gols
        FROM gols g
        JOIN partidas p ON g.id_partida = p.id_partida
        WHERE p.campeonato LIKE '%Série B%' OR p.campeonato LIKE '%Serie B%'
        GROUP BY g.atleta
        ORDER BY total_gols DESC
        LIMIT 8;
    """)
    rows = c.fetchall()
    print("\nRanking Top 8 Artilheiros da Série B:")
    for pos, (atleta, clubes, total) in enumerate(rows, 1):
        print(f"{pos}º {atleta}: {total} gols ({clubes})")

    conn.close()

if __name__ == '__main__':
    popular_artilheiros_serie_b('data/futebol.db')
    popular_artilheiros_serie_b('api/data/futebol.db')
