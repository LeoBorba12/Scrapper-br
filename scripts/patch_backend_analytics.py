import re

BACKEND_FILE = "backend/app.py"

with open(BACKEND_FILE, "r", encoding="utf-8") as f:
    code = f.read()

# 1. Adiciona /api/times/analise-recente
ENDPOINT_TIMES = '''
@app.route('/api/times/analise-recente', methods=['GET'])
@require_auth
def get_times_analise_recente():
    """
    Tabela analítica comparativa de times com histórico recente (últimos N jogos).
    Calcula: forma (V/E/D), aproveitamento, médias de gols pró/contra, saldo,
    clean sheets %, ambas marcam (BTTS) %, over 2.5 %, e desempenho mandante/visitante.
    """
    recorte = request.args.get('recorte', '10')
    campeonato = request.args.get('campeonato', '').strip()
    ano = request.args.get('ano', '').strip()
    
    try:
        n_jogos = max(3, min(30, int(recorte)))
    except ValueError:
        n_jogos = 10
        
    cache_key = f"analise_recente_{n_jogos}_{campeonato}_{ano}"
    cached = api_cache.get(cache_key)
    if cached:
        return jsonify(cached)
        
    conn = get_db()
    c = conn.cursor()
    
    filtro_clube_sql = "WHERE 1=1"
    params_clubes = []
    if ano:
        filtro_clube_sql += " AND p.ano = ?"
        params_clubes.append(int(ano))
    else:
        filtro_clube_sql += " AND p.ano >= 2024"
        
    if campeonato:
        filtro_clube_sql += " AND p.campeonato LIKE ?"
        params_clubes.append(f"%{campeonato}%")
        
    c.execute(f"""
        SELECT clube, COUNT(*) as total_jogos_periodo FROM (
            SELECT mandante as clube FROM partidas p {filtro_clube_sql}
            UNION ALL
            SELECT visitante as clube FROM partidas p {filtro_clube_sql}
        )
        WHERE LENGTH(clube) > 2
        GROUP BY clube
        HAVING total_jogos_periodo >= 5
        ORDER BY total_jogos_periodo DESC
        LIMIT 40
    """, params_clubes + params_clubes)
    
    clubes_ativos = [r['clube'] for r in c.fetchall()]
    
    if not clubes_ativos:
        c.execute("""
            SELECT DISTINCT mandante as clube FROM partidas WHERE ano >= 2024 AND campeonato LIKE '%Série A%'
            LIMIT 20
        """)
        clubes_ativos = [r['clube'] for r in c.fetchall()]

    resultados_times = []
    
    for clube in clubes_ativos:
        sql_jogos = """
            SELECT id_partida, ano, data, mandante, visitante, gols_mandante, gols_visitante, placar, vencedor, campeonato
            FROM partidas
            WHERE (mandante = ? OR visitante = ?)
              AND gols_mandante IS NOT NULL 
              AND gols_visitante IS NOT NULL
        """
        params_j = [clube, clube]
        if campeonato:
            sql_jogos += " AND campeonato LIKE ?"
            params_j.append(f"%{campeonato}%")
        if ano:
            sql_jogos += " AND ano = ?"
            params_j.append(int(ano))
            
        sql_jogos += " ORDER BY data DESC, id_partida DESC LIMIT ?"
        params_j.append(n_jogos)
        
        c.execute(sql_jogos, params_j)
        jogos_raw = [dict(r) for r in c.fetchall()]
        
        if not jogos_raw:
            continue
            
        total_j = len(jogos_raw)
        vitorias = 0
        empates = 0
        derrotas = 0
        gols_pro = 0
        gols_contra = 0
        clean_sheets = 0
        falhou_marcar = 0
        btts = 0
        over_2_5 = 0
        casa_jogos = 0
        casa_vit = 0
        fora_jogos = 0
        fora_vit = 0
        sequencia = []
        historico_recente = []
        
        for j in jogos_raw:
            is_home = (j['mandante'] == clube)
            gp = j['gols_mandante'] if is_home else j['gols_visitante']
            gc = j['gols_visitante'] if is_home else j['gols_mandante']
            adv = j['visitante'] if is_home else j['mandante']
            
            gols_pro += gp
            gols_contra += gc
            
            if gp > gc:
                res = 'V'
                vitorias += 1
                if is_home: casa_vit += 1
                else: fora_vit += 1
            elif gp == gc:
                res = 'E'
                empates += 1
            else:
                res = 'D'
                derrotas += 1
                
            sequencia.append(res)
            
            if gc == 0: clean_sheets += 1
            if gp == 0: falhou_marcar += 1
            if gp > 0 and gc > 0: btts += 1
            if (gp + gc) > 2.5: over_2_5 += 1
            
            if is_home: casa_jogos += 1
            else: fora_jogos += 1
            
            historico_recente.append({
                "id_partida": j['id_partida'],
                "data": j['data'],
                "campeonato": j['campeonato'],
                "adversario": adv,
                "mando": "Casa" if is_home else "Fora",
                "placar": j['placar'],
                "resultado": res,
                "gp": gp,
                "gc": gc
            })
            
        pontos = (vitorias * 3) + empates
        pontos_possiveis = total_j * 3
        aproveitamento = round((pontos / pontos_possiveis) * 100, 1) if pontos_possiveis > 0 else 0
        saldo = gols_pro - gols_contra
        
        resultados_times.append({
            "clube": clube,
            "jogos": total_j,
            "vitorias": vitorias,
            "empates": empates,
            "derrotas": derrotas,
            "pontos": pontos,
            "aproveitamento": aproveitamento,
            "sequencia": sequencia,
            "gols_pro": gols_pro,
            "gols_contra": gols_contra,
            "saldo_gols": saldo,
            "media_gols_pro": round(gols_pro / total_j, 2),
            "media_gols_contra": round(gols_contra / total_j, 2),
            "clean_sheets": clean_sheets,
            "clean_sheets_pct": round((clean_sheets / total_j) * 100, 1),
            "falhou_marcar": falhou_marcar,
            "falhou_marcar_pct": round((falhou_marcar / total_j) * 100, 1),
            "btts": btts,
            "btts_pct": round((btts / total_j) * 100, 1),
            "over_2_5": over_2_5,
            "over_2_5_pct": round((over_2_5 / total_j) * 100, 1),
            "casa": {
                "jogos": casa_jogos,
                "vitorias": casa_vit,
                "aproveitamento": round((casa_vit * 3 / (casa_jogos * 3)) * 100, 1) if casa_jogos > 0 else 0
            },
            "fora": {
                "jogos": fora_jogos,
                "vitorias": fora_vit,
                "aproveitamento": round((fora_vit * 3 / (fora_jogos * 3)) * 100, 1) if fora_jogos > 0 else 0
            },
            "partidas_recentes": historico_recente
        })
        
    resultados_times.sort(key=lambda x: (x['aproveitamento'], x['saldo_gols'], x['gols_pro']), reverse=True)
    conn.close()
    
    response_data = {
        "recorte": n_jogos,
        "campeonato_filtro": campeonato or "Geral Recente",
        "ano_filtro": ano or "Recente (2024-2026)",
        "total_times": len(resultados_times),
        "times": resultados_times
    }
    
    api_cache.set(cache_key, response_data, ttl=600)
    return jsonify(response_data)
'''

if "/api/times/analise-recente" not in code:
    target = "@app.route('/api/campeonatos', methods=['GET'])"
    if target in code:
        code = code.replace(target, ENDPOINT_TIMES + "\n" + target, 1)
        print("-> Endpoint /api/times/analise-recente inserido com sucesso!")

# 2. Enriquecimento de estatísticas em get_jogador_perfil
BLOCO_CALC_EXTRA = '''
    # Minutagem e faixas de gols
    faixas_minutos = {'0-15': 0, '16-30': 0, '31-45+': 0, '46-60': 0, '61-75': 0, '76-90+': 0}
    tempos_gols = {'1T': 0, '2T': 0, 'Outros': 0}
    for g in gols:
        m_raw = str(g.get('minuto') or '')
        m_num = re.search(r'(\\d+)', m_raw)
        minuto = int(m_num.group(1)) if m_num else None
        tempo = str(g.get('tempo') or '')
        if '1' in tempo or (minuto and minuto <= 45 and not '2' in tempo):
            tempos_gols['1T'] += 1
        elif '2' in tempo or (minuto and minuto > 45):
            tempos_gols['2T'] += 1
        else:
            tempos_gols['Outros'] += 1

        if minuto is not None:
            if minuto <= 15: faixas_minutos['0-15'] += 1
            elif minuto <= 30: faixas_minutos['16-30'] += 1
            elif minuto <= 45: faixas_minutos['31-45+'] += 1
            elif minuto <= 60: faixas_minutos['46-60'] += 1
            elif minuto <= 75: faixas_minutos['61-75'] += 1
            else: faixas_minutos['76-90+'] += 1

    # Evolução Temporada a Temporada
    stats_anos = {}
    for p in partidas_ordenadas:
        a = p.get('ano')
        if not a:
            continue
        if a not in stats_anos:
            stats_anos[a] = {"ano": a, "jogos": 0, "gols": 0, "amarelos": 0, "vermelhos": 0, "clubes": set()}
        stats_anos[a]["jogos"] += 1
        stats_anos[a]["gols"] += len(p.get('gols', []))
        stats_anos[a]["amarelos"] += len([c for c in p.get('cartoes', []) if 'amarelo' in (c.get('cartao') or '').lower()])
        stats_anos[a]["vermelhos"] += len([c for c in p.get('cartoes', []) if 'vermelho' in (c.get('cartao') or '').lower()])
        for g in p.get('gols', []):
            if g.get('clube'): stats_anos[a]["clubes"].add(g['clube'])
        if p.get('escalacao') and p['escalacao'].get('clube'):
            stats_anos[a]["clubes"].add(p['escalacao']['clube'])

    historico_temporadas = []
    for a in sorted(stats_anos.keys(), reverse=True):
        v = stats_anos[a]
        historico_temporadas.append({
            "ano": a,
            "jogos": v["jogos"],
            "gols": v["gols"],
            "media_gols": round(v["gols"] / v["jogos"], 2) if v["jogos"] > 0 else 0,
            "amarelos": v["amarelos"],
            "vermelhos": v["vermelhos"],
            "clubes": sorted(list(v["clubes"]))
        })
'''

if "historico_temporadas" not in code:
    target_pos = 'historico_torneios = sorted(stats_camps.values(), key=lambda x: (x["gols"], x["jogos"]), reverse=True)'
    if target_pos in code:
        code = code.replace(target_pos, target_pos + "\n" + BLOCO_CALC_EXTRA, 1)
        print("-> Cálculos de minutagem e temporadas inseridos com sucesso!")

    ret_target = '"historico_torneios": historico_torneios,'
    ret_replacement = '''"historico_torneios": historico_torneios,
        "distribuicao_minutos": faixas_minutos,
        "distribuicao_tempos": tempos_gols,
        "historico_temporadas": historico_temporadas,'''
    if ret_target in code:
        code = code.replace(ret_target, ret_replacement, 1)
        print("-> Novos campos injetados no retorno de get_jogador_perfil!")

with open(BACKEND_FILE, "w", encoding="utf-8") as f:
    f.write(code)

print("Patch aplicado com sucesso em backend/app.py!")
