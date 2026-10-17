import sqlite3
import re

conn = sqlite3.connect('data/futebol.db')
c = conn.cursor()

def get_player_summary(name):
    print(f"\n=================== PERFIL: {name} ===================")
    
    # 1. Gols
    c.execute("""
        SELECT g.tipo_de_gol, g.minuto, g.clube, p.id_partida, p.ano, p.data, p.mandante, p.visitante, p.placar, p.campeonato
        FROM gols g
        JOIN partidas p ON g.id_partida = p.id_partida
        WHERE g.atleta LIKE ? OR g.atleta = ?
        ORDER BY p.data DESC
    """, (f"%{name}%", name))
    gols = c.fetchall()
    
    # 2. Cartoes
    c.execute("""
        SELECT cr.cartao, cr.minuto, cr.motivo, cr.clube, p.id_partida, p.ano, p.data, p.mandante, p.visitante, p.placar, p.campeonato
        FROM cartoes cr
        JOIN partidas p ON cr.id_partida = p.id_partida
        WHERE cr.atleta LIKE ? OR cr.atleta = ?
        ORDER BY p.data DESC
    """, (f"%{name}%", name))
    cartoes = c.fetchall()
    
    # 3. Escalacoes
    c.execute("""
        SELECT e.titular, e.posicao, e.num_camisa, e.clube, p.id_partida, p.ano, p.data, p.mandante, p.visitante, p.placar, p.campeonato
        FROM escalacoes e
        JOIN partidas p ON e.id_partida = p.id_partida
        WHERE e.atleta LIKE ? OR e.atleta = ?
        ORDER BY p.data DESC
    """, (f"%{name}%", name))
    escalacoes = c.fetchall()
    
    # Maiores vítimas (clubes que sofreram gols do jogador)
    vitimas = {}
    for g in gols:
        clube_marcou = g[2]
        mandante = g[6]
        visitante = g[7]
        adversario = visitante if mandante.lower() in clube_marcou.lower() or clube_marcou.lower() in mandante.lower() else mandante
        vitimas[adversario] = vitimas.get(adversario, 0) + 1
        
    top_vitimas = sorted(vitimas.items(), key=lambda x: x[1], reverse=True)[:5]
    
    all_pids = set([g[3] for g in gols] + [cr[4] for cr in cartoes] + [e[4] for e in escalacoes])
    
    print(f"Total Gols: {len(gols)}")
    print(f"Total Cartões: {len(cartoes)} (Amarelos: {len([cr for cr in cartoes if 'amarelo' in cr[0].lower()] )}, Vermelhos: {len([cr for cr in cartoes if 'vermelho' in cr[0].lower()] )})")
    print(f"Total Jogos Registrados: {len(all_pids)}")
    print(f"Top 5 Maiores Vítimas: {top_vitimas}")

get_player_summary("Zico")
get_player_summary("Gabriel Barbosa")
get_player_summary("Thiago Heleno")
get_player_summary("Roberto Dinamite")

conn.close()
