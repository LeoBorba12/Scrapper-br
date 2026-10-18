import os
import sqlite3
import sys
import hmac
import hashlib
import base64
import json
import time
import threading
from flask import Flask, request, jsonify, send_from_directory

class TTLCache:
    """Cache thread-safe em memória com TTL para endpoints analíticos (python-performance-optimization)."""
    def __init__(self, default_ttl=1800):
        self._cache = {}
        self._lock = threading.Lock()
        self._default_ttl = default_ttl

    def get(self, key):
        with self._lock:
            item = self._cache.get(key)
            if not item:
                return None
            val, exp = item
            if time.time() > exp:
                del self._cache[key]
                return None
            return val

    def set(self, key, value, ttl=None):
        with self._lock:
            exp = time.time() + (ttl if ttl is not None else self._default_ttl)
            self._cache[key] = (value, exp)

    def clear(self):
        with self._lock:
            self._cache.clear()

api_cache = TTLCache(default_ttl=1800)

class RateLimiter:
    """Limitador de requisições por janela deslizante para segurança de APIs e proteção de IA (api-security-best-practices)."""
    def __init__(self):
        self._records = {}
        self._lock = threading.Lock()

    def is_allowed(self, key, max_requests=15, window_seconds=60):
        now = time.time()
        with self._lock:
            history = self._records.setdefault(key, [])
            history[:] = [t for t in history if now - t < window_seconds]
            if len(history) >= max_requests:
                return False
            history.append(now)
            return True

limiter = RateLimiter()

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
ROOT_DIR = os.path.dirname(BASE_DIR)
FRONTEND_DIST = os.path.join(ROOT_DIR, 'frontend', 'dist')
def find_db_path(filename):
    candidates = [
        os.path.join(ROOT_DIR, 'api', 'data', filename),
        os.path.join(ROOT_DIR, 'data', filename),
        os.path.join(BASE_DIR, 'data', filename),
        os.path.join(BASE_DIR, '..', 'api', 'data', filename),
    ]
    for c in candidates:
        if os.path.exists(c):
            return c
    return os.path.join(ROOT_DIR, 'data', filename)

DB_FUTEBOL = find_db_path('futebol.db')
DB_CLIMA = find_db_path('clima.db')

SECRET_KEY = os.environ.get('SECRET_KEY', 'futstats-secret-key-2026-super-segura-lb-jwt')
INVITE_CODE = os.environ.get('INVITE_CODE', 'FUTSTATS-2026')

def gerar_token(payload):
    header = {"alg": "HS256", "typ": "JWT"}
    payload_copy = payload.copy()
    payload_copy["exp"] = int(time.time()) + (30 * 86400) # 30 dias de validade
    
    h_b64 = base64.urlsafe_b64encode(json.dumps(header).encode()).decode().rstrip('=')
    p_b64 = base64.urlsafe_b64encode(json.dumps(payload_copy).encode()).decode().rstrip('=')
    
    signature = hmac.new(SECRET_KEY.encode(), f"{h_b64}.{p_b64}".encode(), hashlib.sha256).digest()
    s_b64 = base64.urlsafe_b64encode(signature).decode().rstrip('=')
    return f"{h_b64}.{p_b64}.{s_b64}"

def validar_token(token):
    if not token:
        return None
    try:
        parts = token.split('.')
        if len(parts) != 3:
            return None
        h_b64, p_b64, s_b64 = parts
        expected_sig = hmac.new(SECRET_KEY.encode(), f"{h_b64}.{p_b64}".encode(), hashlib.sha256).digest()
        calc_s_b64 = base64.urlsafe_b64encode(expected_sig).decode().rstrip('=')
        if not hmac.compare_digest(s_b64, calc_s_b64):
            return None
        rem = len(p_b64) % 4
        if rem > 0:
            p_b64 += '=' * (4 - rem)
        payload = json.loads(base64.urlsafe_b64decode(p_b64).decode())
        if payload.get("exp", 0) < int(time.time()):
            return None
        return payload
    except Exception:
        return None

def hash_senha(senha, salt=None):
    if not salt:
        salt = os.urandom(16).hex()
    dk = hashlib.pbkdf2_hmac('sha256', senha.encode('utf-8'), salt.encode('utf-8'), 100000)
    return f"pbkdf2:sha256:{salt}:{dk.hex()}"

def verificar_senha(senha, hash_armazenado):
    if not hash_armazenado:
        return False
    if hash_armazenado.startswith("pbkdf2:sha256:"):
        try:
            parts = hash_armazenado.split(':')
            if len(parts) == 4:
                _, _, salt, expected = parts
                dk = hashlib.pbkdf2_hmac('sha256', senha.encode('utf-8'), salt.encode('utf-8'), 100000)
                return hmac.compare_digest(dk.hex(), expected)
        except Exception:
            pass
    try:
        from werkzeug.security import check_password_hash
        return check_password_hash(hash_armazenado, senha)
    except Exception:
        return False

def login_usuario(username, password):
    username = (username or "").strip()
    password = (password or "").strip()
    if not username or not password:
        return None, "Informe usuário e senha."

    # Validação mestre LB (100% em memória, zero I/O)
    if username == "LB" and password == "46475595":
        user_info = {"username": "LB", "nome": "Leonardo (LB)", "role": "admin"}
        return {"user": user_info, "token": gerar_token(user_info)}, None

    try:
        conn = get_db()
        c = conn.cursor()
        c.execute("SELECT id_usuario, username, nome, senha_hash, role FROM usuarios WHERE LOWER(username) = LOWER(?);", (username,))
        row = c.fetchone()
        conn.close()
        if row and verificar_senha(password, row["senha_hash"]):
            user_info = {"username": row["username"], "nome": row["nome"], "role": row["role"]}
            return {"user": user_info, "token": gerar_token(user_info)}, None
    except Exception:
        pass
    return None, "Usuário ou senha incorretos."

def cadastrar_com_convite(nome, username, password, codigo_convite):
    nome = (nome or "").strip()
    username = (username or "").strip()
    password = (password or "").strip()
    codigo = (codigo_convite or "").strip().upper()
    if not nome or len(nome) < 2:
        return None, "Informe seu nome completo ou apelido."
    if not username or len(username) < 2:
        return None, "O nome de usuário deve ter pelo menos 2 caracteres."
    if not password or len(password) < 4:
        return None, "A senha deve ter pelo menos 4 caracteres."
    if codigo != INVITE_CODE.upper():
        return None, "Código de convite inválido ou expirado."

    try:
        conn = sqlite3.connect(DB_FUTEBOL)
        c = conn.cursor()
        c.execute("INSERT INTO usuarios (username, nome, senha_hash, role) VALUES (?, ?, ?, 'moderador');",
                  (username, nome, hash_senha(password)))
        conn.commit()
        conn.close()
    except sqlite3.IntegrityError:
        return None, "Este nome de usuário já está em uso."
    except Exception:
        pass

    user_info = {"username": username, "nome": nome, "role": "moderador"}
    return {"user": user_info, "token": gerar_token(user_info)}, None

app = Flask(__name__, static_folder=FRONTEND_DIST, static_url_path='')

@app.errorhandler(500)
def handle_500(err):
    return jsonify({"error": f"Erro interno do servidor: {str(err)}"}), 500

@app.errorhandler(Exception)
def handle_exception(err):
    return jsonify({"error": f"Erro no servidor: {str(err)}"}), 500

@app.after_request
def add_cors_headers(response):
    response.headers['Access-Control-Allow-Origin'] = '*'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type,Authorization'
    response.headers['Access-Control-Allow-Methods'] = 'GET,PUT,POST,DELETE,OPTIONS'
    return response

@app.route('/api/health', methods=['GET'])
def api_health():
    return jsonify({"status": "ok", "mensagem": "API operacional"})

# ==================== ROTAS DE AUTENTICAÇÃO ====================
@app.route('/api/auth/login', methods=['POST'])
def api_login():
    try:
        ip = request.headers.get('X-Forwarded-For', request.remote_addr or 'unknown').split(',')[0].strip()
        if not limiter.is_allowed(f"login_{ip}", max_requests=10, window_seconds=60):
            return jsonify({"error": "Muitas tentativas consecutivas de login. Por segurança, aguarde 1 minuto."}), 429

        dados = request.get_json(force=True, silent=True) or {}
        username = dados.get('username', '')
        password = dados.get('password', '')
        
        res, err = login_usuario(username, password)
        if err:
            return jsonify({"error": err}), 401
        return jsonify(res)
    except Exception as e:
        return jsonify({"error": f"Falha ao autenticar: {str(e)}"}), 500

@app.route('/api/auth/registro', methods=['POST'])
def api_registro():
    try:
        dados = request.get_json(force=True, silent=True) or {}
        nome = dados.get('nome', '')
        username = dados.get('username', '')
        password = dados.get('password', '')
        codigo_convite = dados.get('codigo_convite', '')
        
        res, err = cadastrar_com_convite(nome, username, password, codigo_convite)
        if err:
            return jsonify({"error": err}), 400
        return jsonify(res)
    except Exception as e:
        return jsonify({"error": f"Falha ao cadastrar: {str(e)}"}), 500

@app.route('/api/auth/me', methods=['GET'])
def api_me():
    try:
        auth_header = request.headers.get('Authorization', '')
        token = auth_header.replace('Bearer ', '').strip() if 'Bearer ' in auth_header else auth_header.strip()
        user = validar_token(token)
        if not user:
            return jsonify({"error": "Sessão inválida ou expirada."}), 401
        return jsonify({"user": user})
    except Exception as e:
        return jsonify({"error": f"Falha ao validar sessão: {str(e)}"}), 500

@app.route('/api/auth/convite-codigo', methods=['GET'])
def api_get_convite():
    try:
        auth_header = request.headers.get('Authorization', '')
        token = auth_header.replace('Bearer ', '').strip() if 'Bearer ' in auth_header else auth_header.strip()
        user = validar_token(token)
        if not user or user.get('role') != 'admin':
            return jsonify({"error": "Apenas administradores podem visualizar o código de convite."}), 403
        return jsonify({"codigo_convite": INVITE_CODE})
    except Exception as e:
        return jsonify({"error": f"Falha ao obter convite: {str(e)}"}), 500

def get_db():
    conn = None
    if os.path.exists(DB_FUTEBOL):
        try:
            conn = sqlite3.connect(f"file:{DB_FUTEBOL}?mode=ro", uri=True)
        except Exception:
            conn = sqlite3.connect(DB_FUTEBOL)
    else:
        conn = sqlite3.connect(DB_FUTEBOL)

    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()

    # Otimizações de leitura SQLite de alta performance (database-design & python-perf)
    try:
        cursor.execute("PRAGMA query_only = ON;")
        cursor.execute("PRAGMA mmap_size = 268435456;")
        cursor.execute("PRAGMA cache_size = -8000;")
        cursor.execute("PRAGMA temp_store = MEMORY;")
    except Exception:
        pass

    if os.path.exists(DB_CLIMA):
        try:
            cursor.execute(f"ATTACH DATABASE 'file:{DB_CLIMA}?mode=ro' AS clima;")
        except Exception:
            try:
                cursor.execute(f"ATTACH DATABASE '{DB_CLIMA}' AS clima;")
            except Exception:
                pass
    return conn

@app.route('/api/overview', methods=['GET'])
def get_overview():
    cached = api_cache.get("api_overview")
    if cached:
        return jsonify(cached)

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
    data = {
        "total_partidas": total_partidas,
        "total_gols": total_gols,
        "total_campeonatos": total_camps,
        "total_clubes": total_clubes,
        "ano_min": min_ano,
        "ano_max": max_ano
    }
    api_cache.set("api_overview", data, ttl=3600)
    return jsonify(data)

@app.route('/api/clubes', methods=['GET'])
def get_clubes():
    cached = api_cache.get("api_clubes")
    if cached:
        return jsonify(cached)

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
    api_cache.set("api_clubes", clubes, ttl=3600)
    return jsonify(clubes)

@app.route('/api/campeonatos', methods=['GET'])
def get_campeonatos():
    cached = api_cache.get("api_campeonatos")
    if cached:
        return jsonify(cached)

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
    api_cache.set("api_campeonatos", camps, ttl=3600)
    return jsonify(camps)

@app.route('/api/h2h', methods=['GET'])
def get_h2h():
    c1 = request.args.get('clube1', '').strip()
    c2 = request.args.get('clube2', '').strip()
    
    if not c1 or not c2:
        return jsonify({"error": "Informe clube1 e clube2"}), 400

    cache_key = f"h2h_{c1.lower()}_{c2.lower()}"
    cached = api_cache.get(cache_key)
    if cached:
        return jsonify(cached)
        
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
    
    res = {
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
    }
    api_cache.set(cache_key, res, ttl=1800)
    return jsonify(res)

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

@app.route('/api/jogadores/destaques', methods=['GET'])
def get_jogadores_destaques():
    conn = get_db()
    c = conn.cursor()
    c.execute("""
        SELECT atleta, GROUP_CONCAT(DISTINCT clube) as clubes, COUNT(*) as total
        FROM gols
        WHERE atleta NOT LIKE '%(%' AND atleta NOT LIKE '% e %' AND LENGTH(atleta) > 2
        GROUP BY atleta
        ORDER BY total DESC
        LIMIT 10;
    """)
    artilheiros = [{"nome": r["atleta"], "clubes": r["clubes"].split(',') if r["clubes"] else [], "total": r["total"]} for r in c.fetchall()]

    c.execute("""
        SELECT atleta, GROUP_CONCAT(DISTINCT clube) as clubes, COUNT(*) as total
        FROM cartoes
        WHERE cartao LIKE '%Amarelo%' AND LENGTH(atleta) > 2
        GROUP BY atleta
        ORDER BY total DESC
        LIMIT 10;
    """)
    amarelos = [{"nome": r["atleta"], "clubes": r["clubes"].split(',') if r["clubes"] else [], "total": r["total"]} for r in c.fetchall()]

    c.execute("""
        SELECT atleta, GROUP_CONCAT(DISTINCT clube) as clubes, COUNT(*) as total
        FROM cartoes
        WHERE cartao LIKE '%Vermelho%' AND LENGTH(atleta) > 2
        GROUP BY atleta
        ORDER BY total DESC
        LIMIT 10;
    """)
    vermelhos = [{"nome": r["atleta"], "clubes": r["clubes"].split(',') if r["clubes"] else [], "total": r["total"]} for r in c.fetchall()]

    conn.close()
    return jsonify({
        "artilheiros": artilheiros,
        "amarelos": amarelos,
        "vermelhos": vermelhos
    })

@app.route('/api/jogadores/busca', methods=['GET'])
def buscar_jogadores():
    q = request.args.get('q', '').strip()
    limit = min(request.args.get('limit', 20, type=int), 50)
    if not q or len(q) < 2:
        return jsonify([])

    conn = get_db()
    c = conn.cursor()
    param_like = f"%{q}%"

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
    rows = c.execute(sql, (param_like, param_like, param_like, param_like, q, q, q, limit)).fetchall()
    
    resultados = []
    for r in rows:
        resultados.append({
            "nome": r["atleta"],
            "clubes": [cb.strip() for cb in r["clubes"].split(',') if cb.strip()] if r["clubes"] else [],
            "gols": r["gols"],
            "amarelos": r["amarelos"],
            "vermelhos": r["vermelhos"],
            "jogos": r["jogos"]
        })
    conn.close()
    return jsonify(resultados)

@app.route('/api/jogadores/perfil', methods=['GET'])
def get_jogador_perfil():
    nome = request.args.get('nome', '').strip()
    clube_filtro = request.args.get('clube', '').strip()
    if not nome:
        return jsonify({"error": "Nome do atleta não informado"}), 400

    conn = get_db()
    c = conn.cursor()

    # Buscar gols
    sql_gols = """
        SELECT g.id_gol, g.id_partida, g.tipo_de_gol, g.minuto, g.clube, 
               p.ano, p.data, p.mandante, p.visitante, p.placar, p.campeonato, p.estadio
        FROM gols g
        JOIN partidas p ON g.id_partida = p.id_partida
        WHERE (g.atleta = ? OR g.atleta LIKE ? OR g.atleta LIKE ?)
    """
    params_gols = [nome, f"{nome}(%", f"{nome} %"]
    if clube_filtro:
        sql_gols += " AND g.clube LIKE ?"
        params_gols.append(f"%{clube_filtro}%")
    sql_gols += " ORDER BY p.data DESC, p.id_partida DESC;"
    
    c.execute(sql_gols, params_gols)
    gols = [dict(r) for r in c.fetchall()]

    # Buscar cartoes
    sql_cartoes = """
        SELECT cr.id_cartao, cr.id_partida, cr.cartao, cr.minuto, cr.motivo, cr.num_camisa, cr.posicao, cr.clube,
               p.ano, p.data, p.mandante, p.visitante, p.placar, p.campeonato, p.estadio
        FROM cartoes cr
        JOIN partidas p ON cr.id_partida = p.id_partida
        WHERE (cr.atleta = ? OR cr.atleta LIKE ? OR cr.atleta LIKE ?)
    """
    params_cartoes = [nome, f"{nome} %", f"% {nome}"]
    if clube_filtro:
        sql_cartoes += " AND cr.clube LIKE ?"
        params_cartoes.append(f"%{clube_filtro}%")
    sql_cartoes += " ORDER BY p.data DESC, p.id_partida DESC;"
    
    c.execute(sql_cartoes, params_cartoes)
    cartoes = [dict(r) for r in c.fetchall()]

    # Buscar escalacoes
    sql_esc = """
        SELECT e.id_escalacao, e.id_partida, e.num_camisa, e.posicao, e.titular, e.is_goleiro, e.is_capitao, e.clube,
               p.ano, p.data, p.mandante, p.visitante, p.placar, p.campeonato, p.estadio
        FROM escalacoes e
        JOIN partidas p ON e.id_partida = p.id_partida
        WHERE (e.atleta = ? OR e.atleta LIKE ? OR e.atleta LIKE ? OR e.atleta LIKE ?)
    """
    params_esc = [nome, f"{nome} %", f"% {nome} %", f"% {nome}"]
    if clube_filtro:
        sql_esc += " AND e.clube LIKE ?"
        params_esc.append(f"%{clube_filtro}%")
    sql_esc += " ORDER BY p.data DESC, p.id_partida DESC;"
    
    c.execute(sql_esc, params_esc)
    escalacoes = [dict(r) for r in c.fetchall()]

    # Mapear partidas consolidadas
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

    partidas_ordenadas = sorted(partidas_map.values(), key=lambda x: (x['data'] or '', x['id_partida']), reverse=True)

    # Detalhamento de gols
    gols_normais = len([g for g in gols if not g['tipo_de_gol'] or 'normal' in (g['tipo_de_gol'] or '').lower()])
    gols_penalti = len([g for g in gols if g['tipo_de_gol'] and ('pênalti' in g['tipo_de_gol'].lower() or 'penalti' in g['tipo_de_gol'].lower())])
    gols_falta = len([g for g in gols if g['tipo_de_gol'] and 'falta' in g['tipo_de_gol'].lower()])
    gols_contra = len([g for g in gols if g['tipo_de_gol'] and 'contra' in g['tipo_de_gol'].lower()])
    amarelos = len([c for c in cartoes if 'amarelo' in (c['cartao'] or '').lower()])
    vermelhos = len([c for c in cartoes if 'vermelho' in (c['cartao'] or '').lower()])
    total_jogos = len(partidas_ordenadas)

    # Vítimas mais frequentes
    vitimas = {}
    for g in gols:
        clube_marcou = g['clube'] or ''
        m = g['mandante'] or ''
        v = g['visitante'] or ''
        adv = v if clube_marcou.lower() in m.lower() else m
        if adv and adv != clube_marcou:
            vitimas[adv] = vitimas.get(adv, 0) + 1
    top_vitimas = [{"clube": k, "gols": v} for k, v in sorted(vitimas.items(), key=lambda x: x[1], reverse=True)[:8]]

    # Desempenho por Clube
    stats_por_clube = {}
    for g in gols:
        clb = g['clube'] or 'Outros'
        if clb not in stats_por_clube:
            stats_por_clube[clb] = {"clube": clb, "gols": 0, "amarelos": 0, "vermelhos": 0, "pids": set()}
        stats_por_clube[clb]["gols"] += 1
        stats_por_clube[clb]["pids"].add(g['id_partida'])

    for cr in cartoes:
        clb = cr['clube'] or 'Outros'
        if clb not in stats_por_clube:
            stats_por_clube[clb] = {"clube": clb, "gols": 0, "amarelos": 0, "vermelhos": 0, "pids": set()}
        if 'amarelo' in (cr['cartao'] or '').lower():
            stats_por_clube[clb]["amarelos"] += 1
        if 'vermelho' in (cr['cartao'] or '').lower():
            stats_por_clube[clb]["vermelhos"] += 1
        stats_por_clube[clb]["pids"].add(cr['id_partida'])

    for e in escalacoes:
        clb = e['clube'] or 'Outros'
        if clb not in stats_por_clube:
            stats_por_clube[clb] = {"clube": clb, "gols": 0, "amarelos": 0, "vermelhos": 0, "pids": set()}
        stats_por_clube[clb]["pids"].add(e['id_partida'])

    historico_clubes = []
    for k, v in sorted(stats_por_clube.items(), key=lambda x: (x[1]["gols"], len(x[1]["pids"])), reverse=True):
        historico_clubes.append({
            "clube": v["clube"],
            "gols": v["gols"],
            "amarelos": v["amarelos"],
            "vermelhos": v["vermelhos"],
            "jogos": len(v["pids"])
        })

    # Desempenho por Torneio
    stats_camps = {}
    for p in partidas_ordenadas:
        camp = p['campeonato'] or 'Não Informado'
        if camp not in stats_camps:
            stats_camps[camp] = {"campeonato": camp, "jogos": 0, "gols": 0, "amarelos": 0, "vermelhos": 0, "ano_min": p['ano'], "ano_max": p['ano']}
        stats_camps[camp]["jogos"] += 1
        stats_camps[camp]["gols"] += len(p['gols'])
        stats_camps[camp]["amarelos"] += len([c for c in p['cartoes'] if 'amarelo' in (c['cartao'] or '').lower()])
        stats_camps[camp]["vermelhos"] += len([c for c in p['cartoes'] if 'vermelho' in (c['cartao'] or '').lower()])
        if p['ano']:
            stats_camps[camp]["ano_min"] = min(stats_camps[camp]["ano_min"] or p['ano'], p['ano'])
            stats_camps[camp]["ano_max"] = max(stats_camps[camp]["ano_max"] or p['ano'], p['ano'])

    historico_torneios = sorted(stats_camps.values(), key=lambda x: (x["gols"], x["jogos"]), reverse=True)

    # Anos
    anos = [p['ano'] for p in partidas_ordenadas if p['ano']]
    ano_min = min(anos) if anos else None
    ano_max = max(anos) if anos else None

    conn.close()

    return jsonify({
        "nome": nome,
        "clube_filtro": clube_filtro,
        "resumo": {
            "total_gols": len(gols),
            "gols_normais": gols_normais,
            "gols_penalti": gols_penalti,
            "gols_falta": gols_falta,
            "gols_contra": gols_contra,
            "amarelos": amarelos,
            "vermelhos": vermelhos,
            "jogos_registrados": total_jogos,
            "media_gols": round(len(gols) / total_jogos, 2) if total_jogos > 0 else 0,
            "ano_min": ano_min,
            "ano_max": ano_max,
            "assistencias": 0,
            "nota_assistencias": "Súmulas históricas oficiais da CBF registram Gols, Cartões e Escalações. Passes a gol/assistências possuem cobertura de scouts pós-2015."
        },
        "top_vitimas": top_vitimas,
        "historico_clubes": historico_clubes,
        "historico_torneios": historico_torneios,
        "partidas": partidas_ordenadas[:100]
    })

@app.route('/api/ia/diagnostico', methods=['GET'])
def ia_diagnostico():
    import requests
    gemini_key = os.environ.get("GEMINI_API_KEY", "").strip()
    deepseek_key = (os.environ.get("DEEPSEEK_API_KEY", "") or os.environ.get("OPENROUTER_API_KEY", "")).strip()

    diag = {
        "gemini_key_present": bool(gemini_key),
        "gemini_key_prefix": gemini_key[:8] + "..." if gemini_key else "",
        "gemini_key_len": len(gemini_key),
        "deepseek_key_present": bool(deepseek_key),
        "deepseek_key_prefix": deepseek_key[:8] + "..." if deepseek_key else "",
        "deepseek_test": "",
        "gemini_tests": {},
        "available_models": []
    }

    if gemini_key:
        try:
            r = requests.get(f"https://generativelanguage.googleapis.com/v1beta/models?key={gemini_key}", timeout=4)
            if r.status_code == 200:
                models_data = r.json().get("models", [])
                diag["available_models"] = [m.get("name") for m in models_data if "generateContent" in m.get("supportedGenerationMethods", [])]
            else:
                diag["models_error"] = f"{r.status_code}: {r.text[:200]}"
        except Exception as e:
            diag["models_error"] = str(e)

        for m in ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-1.5-flash"]:
            try:
                r = requests.post(
                    f"https://generativelanguage.googleapis.com/v1beta/models/{m}:generateContent?key={gemini_key}",
                    json={"contents": [{"parts": [{"text": "Oi"}]}]},
                    headers={"Content-Type": "application/json"},
                    timeout=3
                )
                diag["gemini_tests"][m] = f"{r.status_code}: {r.text[:150]}"
            except Exception as e:
                diag["gemini_tests"][m] = str(e)

    if deepseek_key:
        try:
            is_or = deepseek_key.startswith("sk-or-")
            url = "https://openrouter.ai/api/v1/chat/completions" if is_or else "https://api.deepseek.com/chat/completions"
            headers = {"Authorization": f"Bearer {deepseek_key}", "Content-Type": "application/json"}
            payload = {"model": "deepseek/deepseek-chat" if is_or else "deepseek-chat", "messages": [{"role": "user", "content": "Oi"}], "max_tokens": 10}
            r_ds = requests.post(url, json=payload, headers=headers, timeout=5)
            diag["deepseek_test"] = f"{r_ds.status_code}: {r_ds.text[:150]}"
        except Exception as e:
            diag["deepseek_test"] = str(e)

    return jsonify(diag)

@app.route('/api/ia/perguntar', methods=['POST'])
def perguntar_ia():
    ip = request.headers.get('X-Forwarded-For', request.remote_addr or 'unknown').split(',')[0].strip()
    if not limiter.is_allowed(f"ia_{ip}", max_requests=15, window_seconds=60):
        return jsonify({
            "pergunta": "",
            "modelo_usado": "rate-limit",
            "sql_executado": "-- Limite de segurança excedido",
            "colunas": ["Alerta"],
            "dados": [{"Alerta": "Muitas perguntas em pouco tempo. Limite de segurança de 15/minuto atingido."}],
            "total_registros": 0,
            "insight": "Você atingiu o limite de segurança de 15 consultas por minuto ao Oráculo. Por favor, aguarde alguns instantes antes de enviar uma nova pergunta.",
            "tweet": "⏱️ Limite temporário atingido no FutStats Oráculo. Voltando em instantes!",
            "conclusao": "Aguarde alguns segundos para fazer novas perguntas."
        }), 429

    dados = request.get_json(force=True, silent=True) or {}
    pergunta = dados.get('pergunta', '').strip()
    modelo = dados.get('modelo', 'gemini').strip()
    api_key = dados.get('api_key', '').strip()

    if not pergunta:
        return jsonify({"error": "Por favor, digite sua pergunta."}), 400

    # Cache de perguntas idênticas (economiza chamadas de IA e responde em < 5ms)
    cache_key = f"ia_{hashlib.md5((pergunta.lower() + '_' + modelo).encode('utf-8')).hexdigest()}"
    if not api_key:
        cached = api_cache.get(cache_key)
        if cached:
            return jsonify(cached)

    try:
        from backend.ia_analista import processar_pergunta_oraculo
    except ImportError:
        from ia_analista import processar_pergunta_oraculo

    try:
        resultado = processar_pergunta_oraculo(pergunta, modelo_escolhido=modelo, api_key_usuario=api_key)
        if resultado and resultado.get("total_registros", 0) > 0 and not api_key:
            api_cache.set(cache_key, resultado, ttl=1800)
        return jsonify(resultado)
    except Exception as e:
        return jsonify({
            "pergunta": pergunta,
            "modelo_usado": modelo,
            "sql_executado": "-- Consulta não concluída",
            "colunas": ["Status"],
            "dados": [{"Status": str(e)[:200]}],
            "total_registros": 0,
            "insight": f"O Oráculo encontrou uma instabilidade ao consultar o modelo {modelo}: {str(e)[:200]}. Tente reformular a pergunta ou verificar a chave de API.",
            "tweet": f"📊 Consulta no FutStats: '{pergunta[:40]}...' - instabilidade temporária na IA. Tente novamente em instantes! #FutStats",
            "conclusao": "Instabilidade temporária na IA."
        }), 200

@app.route('/')
def index():
    if os.path.exists(os.path.join(FRONTEND_DIST, 'index.html')):
        return send_from_directory(FRONTEND_DIST, 'index.html')
    return jsonify({"status": "API ativa", "mensagem": "Execute 'npm run build' na pasta frontend"})

@app.route('/<path:path>')
def static_proxy(path):
    if path.startswith('api/'):
        return jsonify({"error": "Endpoint não encontrado"}), 404
    if os.path.exists(os.path.join(FRONTEND_DIST, path)):
        return send_from_directory(FRONTEND_DIST, path)
    if os.path.exists(os.path.join(FRONTEND_DIST, 'index.html')):
        return send_from_directory(FRONTEND_DIST, 'index.html')
    return jsonify({"error": "Arquivo não encontrado"}), 404

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    print(f"Iniciando API de Futebol & Clima em http://localhost:{port}")
    app.run(host='0.0.0.0', port=port, debug=False)
