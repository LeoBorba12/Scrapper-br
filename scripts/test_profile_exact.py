import sqlite3

conn = sqlite3.connect('data/futebol.db')
c = conn.cursor()

def test_profile(name):
    # Query goals
    gols = c.execute("""
        SELECT g.id_gol, g.id_partida, g.tipo_de_gol, g.minuto, g.clube, 
               p.ano, p.data, p.mandante, p.visitante, p.placar, p.campeonato
        FROM gols g
        JOIN partidas p ON g.id_partida = p.id_partida
        WHERE g.atleta = ? OR g.atleta LIKE ?
        ORDER BY p.data DESC, p.id_partida DESC
    """, (name, f"{name}(%")).fetchall()
    
    # Query cards
    cartoes = c.execute("""
        SELECT c.id_cartao, c.id_partida, c.cartao, c.minuto, c.motivo, c.num_camisa, c.posicao, c.clube,
               p.ano, p.data, p.mandante, p.visitante, p.placar, p.campeonato
        FROM cartoes c
        JOIN partidas p ON c.id_partida = p.id_partida
        WHERE c.atleta = ?
        ORDER BY p.data DESC, p.id_partida DESC
    """, (name,)).fetchall()
    
    # Query escalacoes
    escalacoes = c.execute("""
        SELECT e.id_escalacao, e.id_partida, e.num_camisa, e.posicao, e.titular, e.clube,
               p.ano, p.data, p.mandante, p.visitante, p.placar, p.campeonato
        FROM escalacoes e
        JOIN partidas p ON e.id_partida = p.id_partida
        WHERE e.atleta = ?
        ORDER BY p.data DESC, p.id_partida DESC
    """, (name,)).fetchall()
    
    print(f"Player: {name}")
    print(f"  Gols: {len(gols)}")
    print(f"  Cartões: {len(cartoes)}")
    print(f"  Escalações: {len(escalacoes)}")

test_profile("Zico")
test_profile("Roberto Dinamite")
test_profile("Thiago Heleno")
test_profile("Fagner")
test_profile("Gabriel Barbosa")

conn.close()
