import os
import sqlite3
from flask import Flask, request, jsonify, send_from_directory

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
ROOT_DIR = os.path.dirname(BASE_DIR)
FRONTEND_DIST = os.path.join(ROOT_DIR, 'frontend', 'dist')
DB_FUTEBOL = os.path.join(ROOT_DIR, 'data', 'futebol.db')
DB_CLIMA = os.path.join(ROOT_DIR, 'data', 'clima.db')

app = Flask(__name__, static_folder=FRONTEND_DIST, static_url_path='')

# Configura CORS para permitir chamadas do frontend Vite (porta 5173 ou qualquer origem local)
@app.after_request
def add_cors_headers(response):
    response.headers['Access-Control-Allow-Origin'] = '*'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type,Authorization'
    response.headers['Access-Control-Allow-Methods'] = 'GET,PUT,POST,DELETE,OPTIONS'
    return response

@app.route('/')
def index():
    if os.path.exists(os.path.join(FRONTEND_DIST, 'index.html')):
        return send_from_directory(FRONTEND_DIST, 'index.html')
    return jsonify({"status": "API ativa", "mensagem": "Execute 'npm run build' na pasta frontend"})

@app.route('/<path:path>')
def static_proxy(path):
    if os.path.exists(os.path.join(FRONTEND_DIST, path)):
        return send_from_directory(FRONTEND_DIST, path)
    if os.path.exists(os.path.join(FRONTEND_DIST, 'index.html')):
        return send_from_directory(FRONTEND_DIST, 'index.html')
    return jsonify({"error": "Arquivo não encontrado"}), 404

def get_db():
    conn = sqlite3.connect(DB_FUTEBOL)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    if os.path.exists(DB_CLIMA):
        cursor.execute(f"ATTACH DATABASE '{DB_CLIMA}' AS clima;")
    return conn

@app.route('/api/overview', methods=['GET'])
def get_overview():
    conn = get_db()
    c = conn.cursor()
    c.execute("SELECT COUNT(*), MIN(ano), MAX(ano) FROM partidas;")
    total_partidas, min_ano, max_ano = c.fetchone()
    
    c.execute("SELECT COUNT(*) FROM gols;")
    total_gols = c.fetchone()[0]
    
    c.execute("SELECT COUNT(DISTINCT campeonato) FROM partidas;")
    total_camps = c.fetchone()[0]
    
    c.execute("SELECT COUNT(DISTINCT mandante) FROM partidas;")
    total_clubes = c.fetchone()[0]
    
    conn.close()
    return jsonify({
        "total_partidas": total_partidas,
        "total_gols": total_gols,
        "total_campeonatos": total_camps,
        "total_clubes": total_clubes,
        "ano_min": min_ano,
        "ano_max": max_ano
    })

@app.route('/api/clubes', methods=['GET'])
def get_clubes():
    conn = get_db()
    c = conn.cursor()
    # Pega os clubes com mais partidas registradas
    c.execute("""
        SELECT clube, SUM(total) as jogos FROM (
            SELECT mandante as clube, COUNT(*) as total FROM partidas GROUP BY mandante
            UNION ALL
            SELECT visitante as clube, COUNT(*) as total FROM partidas GROUP BY visitante
        )
        WHERE LENGTH(clube) > 2 
          AND clube NOT LIKE '%	%' 
          AND clube NOT LIKE '% - %'
        GROUP BY clube
        ORDER BY jogos DESC
        LIMIT 100;
    """)
    clubes = [{"nome": row["clube"], "jogos": row["jogos"]} for row in c.fetchall()]
    conn.close()
    return jsonify(clubes)

@app.route('/api/campeonatos', methods=['GET'])
def get_campeonatos():
    conn = get_db()
    c = conn.cursor()
    c.execute("""
        SELECT campeonato, MIN(ano) as de, MAX(ano) as ate, COUNT(*) as jogos
        FROM partidas
        GROUP BY campeonato
        ORDER BY jogos DESC;
    """)
    camps = [dict(row) for row in c.fetchall()]
    conn.close()
    return jsonify(camps)

@app.route('/api/h2h', methods=['GET'])
def get_h2h():
    c1 = request.args.get('clube1', '').strip()
    c2 = request.args.get('clube2', '').strip()
    
    if not c1 or not c2:
        return jsonify({"error": "Informe clube1 e clube2"}), 400
        
    conn = get_db()
    c = conn.cursor()
    
    # Busca todas as partidas entre os dois
    query = """
        SELECT id_partida, ano, data, mandante, visitante, gols_mandante, gols_visitante, placar, vencedor, campeonato, estadio, fase
        FROM partidas
        WHERE (mandante LIKE ? AND visitante LIKE ?) OR (mandante LIKE ? AND visitante LIKE ?)
        ORDER BY data DESC, id_partida DESC;
    """
    c.execute(query, (f"%{c1}%", f"%{c2}%", f"%{c2}%", f"%{c1}%"))
    rows = c.fetchall()
    
    total = len(rows)
    vit1 = 0
    vit2 = 0
    empates = 0
    gols1 = 0
    gols2 = 0
    partidas = []
    
    maior_dif1 = -1
    maior_goleada1 = None
    maior_dif2 = -1
    maior_goleada2 = None
    
    for r in rows:
        p = dict(r)
        m = p['mandante']
        v = p['visitante']
        gm = p['gols_mandante'] or 0
        gv = p['gols_visitante'] or 0
        
        # Identificar quem é c1 e quem é c2
        is_c1_mandante = c1.lower() in m.lower()
        gc1 = gm if is_c1_mandante else gv
        gc2 = gv if is_c1_mandante else gm
        
        gols1 += gc1
        gols2 += gc2
        
        dif = gc1 - gc2
        if dif > 0:
            vit1 += 1
            if dif > maior_dif1:
                maior_dif1 = dif
                maior_goleada1 = p
        elif dif < 0:
            vit2 += 1
            if abs(dif) > maior_dif2:
                maior_dif2 = abs(dif)
                maior_goleada2 = p
        else:
            empates += 1
            
        partidas.append(p)

    # Análise de tabu recente
    tabu_clube = None
    tabu_jogos = 0
    for p in partidas:
        is_c1_m = c1.lower() in p['mandante'].lower()
        gc1 = (p['gols_mandante'] or 0) if is_c1_m else (p['gols_visitante'] or 0)
        gc2 = (p['gols_visitante'] or 0) if is_c1_m else (p['gols_mandante'] or 0)
        
        if gc1 > gc2:
            resultado = 'c1'
        elif gc2 > gc1:
            resultado = 'c2'
        else:
            resultado = 'empate'
            
        if tabu_clube is None:
            if resultado == 'c1':
                tabu_clube = c1
                tabu_jogos = 1
            elif resultado == 'c2':
                tabu_clube = c2
                tabu_jogos = 1
            else:
                # começou com empate
                continue
        else:
            if resultado == 'empate':
                tabu_jogos += 1
            elif (tabu_clube == c1 and resultado == 'c1') or (tabu_clube == c2 and resultado == 'c2'):
                tabu_jogos += 1
            else:
                break
                
    conn.close()
    
    return jsonify({
        "clube1": c1,
        "clube2": c2,
        "total_jogos": total,
        "vitorias_clube1": vit1,
        "vitorias_clube2": vit2,
        "empates": empates,
        "gols_clube1": gols1,
        "gols_clube2": gols2,
        "maior_goleada_clube1": maior_goleada1,
        "maior_goleada_clube2": maior_goleada2,
        "tabu_invicto": {
            "clube": tabu_clube,
            "jogos": tabu_jogos
        } if tabu_clube and tabu_jogos >= 2 else None,
        "partidas": partidas[:30] # Últimos 30 jogos
    })

@app.route('/api/partidas', methods=['GET'])
def get_partidas():
    clube = request.args.get('clube', '').strip()
    campeonato = request.args.get('campeonato', '').strip()
    ano_de = request.args.get('ano_de', type=int)
    ano_ate = request.args.get('ano_ate', type=int)
    cenario = request.args.get('cenario', 'todos').strip()
    termo = request.args.get('busca', '').strip()
    page = request.args.get('page', 1, type=int)
    limit = request.args.get('limit', 20, type=int)
    limit = min(limit, 100)
    offset = (page - 1) * limit
    
    conn = get_db()
    c = conn.cursor()
    
    clauses = ["1=1"]
    params = []
    
    if clube:
        clauses.append("(mandante LIKE ? OR visitante LIKE ?)")
        params.extend([f"%{clube}%", f"%{clube}%"])
        
    if campeonato:
        clauses.append("campeonato = ?")
        params.append(campeonato)
        
    if ano_de:
        clauses.append("ano >= ?")
        params.append(ano_de)
        
    if ano_ate:
        clauses.append("ano <= ?")
        params.append(ano_ate)
        
    if termo:
        clauses.append("(mandante LIKE ? OR visitante LIKE ? OR estadio LIKE ? OR arbitro LIKE ?)")
        params.extend([f"%{termo}%", f"%{termo}%", f"%{termo}%", f"%{termo}%"])
        
    if cenario == 'goleadas':
        clauses.append("(ABS(gols_mandante - gols_visitante) >= 4 OR (gols_mandante + gols_visitante) >= 6)")
    elif cenario == 'finais':
        clauses.append("(fase LIKE '%Final%' OR fase LIKE '%Decisão%')")
        
    where_sql = " AND ".join(clauses)
    
    # Contar total
    c.execute(f"SELECT COUNT(*) FROM partidas WHERE {where_sql};", params)
    total_items = c.fetchone()[0]
    
    # Selecionar registros
    query = f"""
        SELECT id_partida, ano, rodada, data, horario, estadio, cidade, estado, mandante, visitante,
               gols_mandante, gols_visitante, placar, vencedor, arbitro, campeonato, fase
        FROM partidas
        WHERE {where_sql}
        ORDER BY data DESC, id_partida DESC
        LIMIT ? OFFSET ?;
    """
    c.execute(query, params + [limit, offset])
    partidas = [dict(row) for row in c.fetchall()]
    
    # Buscar gols para essas partidas
    p_ids = [p['id_partida'] for p in partidas]
    if p_ids:
        placeholders = ",".join("?" * len(p_ids))
        c.execute(f"""
            SELECT id_partida, atleta, clube, minuto, tempo, tipo_de_gol 
            FROM gols 
            WHERE id_partida IN ({placeholders})
            ORDER BY id_gol;
        """, p_ids)
        gols_map = {}
        for g in c.fetchall():
            pid = g['id_partida']
            if pid not in gols_map:
                gols_map[pid] = []
            gols_map[pid].append(dict(g))
        for p in partidas:
            p['gols'] = gols_map.get(p['id_partida'], [])
    else:
        for p in partidas:
            p['gols'] = []

    conn.close()
    
    return jsonify({
        "total": total_items,
        "page": page,
        "limit": limit,
        "partidas": partidas
    })

@app.route('/api/clima-futebol', methods=['GET'])
def get_clima_futebol():
    conn = get_db()
    c = conn.cursor()
    
    # Cruzamento de partidas 2015-2024 com dados meteorológicos do clima_diario
    c.execute("""
        SELECT 
            CASE WHEN c.precipitacao_mm > 5 THEN 'Com Chuva' ELSE 'Tempo Seco' END as cond_chuva,
            COUNT(*) as total_jogos,
            ROUND(AVG(p.gols_mandante + p.gols_visitante), 2) as media_gols,
            ROUND(AVG(p.gols_mandante), 2) as media_mandante,
            ROUND(AVG(p.gols_visitante), 2) as media_visitante,
            ROUND(SUM(CASE WHEN p.vencedor = p.mandante THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 1) as pct_vit_mandante
        FROM partidas p
        JOIN clima.clima_diario c 
          ON p.data = c.data 
         AND (LOWER(p.cidade) = LOWER(c.cidade) OR LOWER(p.estado) = LOWER(c.estado))
        WHERE p.ano >= 2015
        GROUP BY cond_chuva;
    """)
    res_chuva = [dict(row) for row in c.fetchall()]
    
    # Distribuição por temperatura
    c.execute("""
        SELECT 
            CASE 
                WHEN c.temperatura_media < 19 THEN 'Frio (< 19°C)'
                WHEN c.temperatura_media BETWEEN 19 AND 27 THEN 'Ameno (19°C - 27°C)'
                ELSE 'Calor Intenso (> 27°C)'
            END as faixa_temp,
            COUNT(*) as total_jogos,
            ROUND(AVG(p.gols_mandante + p.gols_visitante), 2) as media_gols
        FROM partidas p
        JOIN clima.clima_diario c 
          ON p.data = c.data 
         AND (LOWER(p.cidade) = LOWER(c.cidade) OR LOWER(p.estado) = LOWER(c.estado))
        WHERE p.ano >= 2015 AND c.temperatura_media IS NOT NULL
        GROUP BY faixa_temp
        ORDER BY media_gols DESC;
    """)
    res_temp = [dict(row) for row in c.fetchall()]

    # Top 5 jogos com chuva torrencial
    c.execute("""
        SELECT p.data, p.mandante, p.visitante, p.placar, p.cidade, p.campeonato, 
               c.precipitacao_mm, c.temperatura_media
        FROM partidas p
        JOIN clima.clima_diario c 
          ON p.data = c.data 
         AND (LOWER(p.cidade) = LOWER(c.cidade) OR LOWER(p.estado) = LOWER(c.estado))
        WHERE p.ano >= 2015 AND c.precipitacao_mm > 30
        ORDER BY c.precipitacao_mm DESC
        LIMIT 5;
    """)
    top_chuva = [dict(row) for row in c.fetchall()]
    
    conn.close()
    
    return jsonify({
        "impacto_chuva": res_chuva,
        "impacto_temperatura": res_temp,
        "jogos_chuva_extrema": top_chuva
    })

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    print(f"Iniciando API de Futebol & Clima em http://localhost:{port}")
    app.run(host='0.0.0.0', port=port, debug=False)
