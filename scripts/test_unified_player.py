import sqlite3
import re

conn = sqlite3.connect('data/futebol.db')
c = conn.cursor()

def get_player_full_data(player_name):
    # Normalize base name
    clean_name = player_name.strip()
    
    # 1. Gols do jogador
    c.execute("""
        SELECT g.id_gol, g.id_partida, g.tipo_de_gol, g.minuto, g.clube, 
               p.ano, p.data, p.mandante, p.visitante, p.placar, p.campeonato, p.estadio
        FROM gols g
        JOIN partidas p ON g.id_partida = p.id_partida
        WHERE g.atleta = ? 
           OR g.atleta LIKE ?
           OR g.atleta LIKE ?
        ORDER BY p.data DESC, p.id_partida DESC;
    """, (clean_name, f"{clean_name}(%", f"{clean_name} %"))
    gols = [dict(zip([
        'id_gol', 'id_partida', 'tipo_de_gol', 'minuto', 'clube',
        'ano', 'data', 'mandante', 'visitante', 'placar', 'campeonato', 'estadio'
    ], row)) for row in c.fetchall()]
    
    # 2. Cartões
    c.execute("""
        SELECT cr.id_cartao, cr.id_partida, cr.cartao, cr.minuto, cr.motivo, cr.num_camisa, cr.posicao, cr.clube,
               p.ano, p.data, p.mandante, p.visitante, p.placar, p.campeonato, p.estadio
        FROM cartoes cr
        JOIN partidas p ON cr.id_partida = p.id_partida
        WHERE cr.atleta = ? 
           OR cr.atleta LIKE ?
           OR cr.atleta LIKE ?
        ORDER BY p.data DESC, p.id_partida DESC;
    """, (clean_name, f"{clean_name} %", f"% {clean_name}"))
    cartoes = [dict(zip([
        'id_cartao', 'id_partida', 'cartao', 'minuto', 'motivo', 'num_camisa', 'posicao', 'clube',
        'ano', 'data', 'mandante', 'visitante', 'placar', 'campeonato', 'estadio'
    ], row)) for row in c.fetchall()]
    
    # 3. Escalações
    c.execute("""
        SELECT e.id_escalacao, e.id_partida, e.num_camisa, e.posicao, e.titular, e.is_goleiro, e.is_capitao, e.clube,
               p.ano, p.data, p.mandante, p.visitante, p.placar, p.campeonato, p.estadio
        FROM escalacoes e
        JOIN partidas p ON e.id_partida = p.id_partida
        WHERE e.atleta = ? 
           OR e.atleta LIKE ? 
           OR e.atleta LIKE ?
           OR e.atleta LIKE ?
        ORDER BY p.data DESC, p.id_partida DESC;
    """, (clean_name, f"{clean_name} %", f"% {clean_name} %", f"% {clean_name}"))
    escalacoes = [dict(zip([
        'id_escalacao', 'id_partida', 'num_camisa', 'posicao', 'titular', 'is_goleiro', 'is_capitao', 'clube',
        'ano', 'data', 'mandante', 'visitante', 'placar', 'campeonato', 'estadio'
    ], row)) for row in c.fetchall()]
    
    # Unificar jogos distintos
    partidas_map = {}
    for g in gols:
        pid = g['id_partida']
        if pid not in partidas_map:
            partidas_map[pid] = {
                'id_partida': pid, 'ano': g['ano'], 'data': g['data'],
                'mandante': g['mandante'], 'visitante': g['visitante'],
                'placar': g['placar'], 'campeonato': g['campeonato'], 'estadio': g['estadio'],
                'gols': [], 'cartoes': [], 'escalacao': None
            }
        partidas_map[pid]['gols'].append({
            'minuto': g['minuto'], 'tipo': g['tipo_de_gol'], 'clube': g['clube']
        })
        
    for cr in cartoes:
        pid = cr['id_partida']
        if pid not in partidas_map:
            partidas_map[pid] = {
                'id_partida': pid, 'ano': cr['ano'], 'data': cr['data'],
                'mandante': cr['mandante'], 'visitante': cr['visitante'],
                'placar': cr['placar'], 'campeonato': cr['campeonato'], 'estadio': cr['estadio'],
                'gols': [], 'cartoes': [], 'escalacao': None
            }
        partidas_map[pid]['cartoes'].append({
            'cartao': cr['cartao'], 'minuto': cr['minuto'], 'motivo': cr['motivo'], 'clube': cr['clube']
        })
        
    for e in escalacoes:
        pid = e['id_partida']
        if pid not in partidas_map:
            partidas_map[pid] = {
                'id_partida': pid, 'ano': e['ano'], 'data': e['data'],
                'mandante': e['mandante'], 'visitante': e['visitante'],
                'placar': e['placar'], 'campeonato': e['campeonato'], 'estadio': e['estadio'],
                'gols': [], 'cartoes': [], 'escalacao': None
            }
        partidas_map[pid]['escalacao'] = {
            'posicao': e['posicao'], 'camisa': e['num_camisa'], 'titular': bool(e['titular']),
            'clube': e['clube']
        }
        
    partidas_lista = sorted(partidas_map.values(), key=lambda x: (x['data'] or '', x['id_partida']), reverse=True)
    
    # Resumo
    total_gols = len(gols)
    amarelos = len([c for c in cartoes if 'amarelo' in (c['cartao'] or '').lower()])
    vermelhos = len([c for c in cartoes if 'vermelho' in (c['cartao'] or '').lower()])
    jogos = len(partidas_lista)
    
    # Clubes
    clubes_set = set([g['clube'] for g in gols if g['clube']] + 
                     [cr['clube'] for cr in cartoes if cr['clube']] + 
                     [e['clube'] for e in escalacoes if e['clube']])
    
    # Maiores vítimas
    vitimas = {}
    for g in gols:
        clube_marcou = g['clube'] or ''
        m = g['mandante'] or ''
        v = g['visitante'] or ''
        adv = v if clube_marcou.lower() in m.lower() else m
        if adv and adv != clube_marcou:
            vitimas[adv] = vitimas.get(adv, 0) + 1
    top_vitimas = [{"clube": k, "gols": v} for k, v in sorted(vitimas.items(), key=lambda x: x[1], reverse=True)[:5]]
    
    # Anos
    anos = [p['ano'] for p in partidas_lista if p['ano']]
    ano_min = min(anos) if anos else None
    ano_max = max(anos) if anos else None
    
    print(f"\n{clean_name}:")
    print(f"  Gols: {total_gols} | Amarelos: {amarelos} | Vermelhos: {vermelhos} | Jogos: {jogos} | Período: {ano_min}-{ano_max}")
    print(f"  Clubes: {list(clubes_set)}")
    print(f"  Vítimas: {top_vitimas}")
    print(f"  Últimos 2 jogos: {[p['data'] + ' ' + p['mandante'] + ' ' + p['placar'] + ' ' + p['visitante'] for p in partidas_lista[:2]]}")

get_player_full_data("Zico")
get_player_full_data("Roberto Dinamite")
get_player_full_data("Fagner")
get_player_full_data("Thiago Heleno")
get_player_full_data("Reinaldo")

conn.close()
