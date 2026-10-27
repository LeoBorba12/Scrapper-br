import re
import os
import math
import sqlite3
import sys
import hmac
import hashlib
import base64
import json
import time
import threading
import functools
import secrets
import requests
import datetime
from functools import wraps
from flask import Flask, request, jsonify, send_from_directory, g

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
        os.path.join(ROOT_DIR, 'data', filename),
        os.path.join(BASE_DIR, '..', 'data', filename),
        os.path.join(BASE_DIR, 'data', filename),
        os.path.join('/var/task/data', filename),
        os.path.join(ROOT_DIR, 'api', 'data', filename),
    ]
    for c in candidates:
        if os.path.exists(c):
            return c
    return os.path.join(ROOT_DIR, 'data', filename)

DB_FUTEBOL = find_db_path('futebol.db')
DB_CLIMA = find_db_path('clima.db')

# Chave de assinatura JWT consistente para ambiente serverless (Vercel).
# Garante que múltiplos contêineres/lambdas compartilhem a mesma assinatura criptográfica.
# Evita desconexões aleatórias ao alternar abas ou fazer requisições concorrentes.
SECRET_KEY = os.environ.get('SECRET_KEY') or "futstats-jwt-secret-stable-auth-2026-production-sig-key-vercel"
INVITE_CODE = os.environ.get('INVITE_CODE', 'FUTSTATS-2026')
ADMIN_USERNAME = os.environ.get('ADMIN_USERNAME', 'LB')
# Defina ADMIN_PASSWORD_HASH nas variáveis de ambiente da Vercel (gerado via hash_senha)
ADMIN_PASSWORD_HASH = os.environ.get('ADMIN_PASSWORD_HASH', '')

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
        return None, "Informe utilizador e palavra-passe."

    # 1. Validação do Admin via variável de ambiente segura (Zero I/O e sem senha exposta no código)
    if ADMIN_PASSWORD_HASH and username.lower() == ADMIN_USERNAME.lower():
        if verificar_senha(password, ADMIN_PASSWORD_HASH):
            user_info = {"username": ADMIN_USERNAME, "nome": "Administrador", "role": "admin"}
            return {"user": user_info, "token": gerar_token(user_info)}, None

    # 2. Validação na tabela usuarios do banco
    try:
        conn = get_db()
        c = conn.cursor()
        c.execute(
            "SELECT id_usuario, username, nome, senha_hash, role FROM usuarios WHERE LOWER(username) = LOWER(?);",
            (username,)
        )
        row = c.fetchone()
        conn.close()
        if row:
            if verificar_senha(password, row["senha_hash"]):
                user_info = {"username": row["username"], "nome": row["nome"], "role": row["role"]}
                return {"user": user_info, "token": gerar_token(user_info)}, None
            # Fallback rápido no micro-cache da VM caso a senha tenha sido alterada recentemente
            try:
                vm_cache_url = f"http://163.176.87.218:3000/cache/user_pass_{username.lower()}"
                r_cache = requests.get(vm_cache_url, timeout=1.5)
                if r_cache.status_code == 200:
                    cached_data = r_cache.json().get('value', {})
                    if cached_data and verificar_senha(password, cached_data.get('hash', '')):
                        user_info = {"username": row["username"], "nome": row["nome"], "role": row["role"]}
                        return {"user": user_info, "token": gerar_token(user_info)}, None
            except Exception:
                pass
    except Exception:
        pass

    return None, "Utilizador ou palavra-passe incorretos."

def obter_ip_real():
    """
    Na Vercel, 'x-real-ip' ou o último IP confiável evita falsificação de cabeçalho X-Forwarded-For pelo cliente.
    """
    vercel_ip = request.headers.get('X-Real-IP') or request.headers.get('X-Vercel-Forwarded-For')
    if vercel_ip:
        return vercel_ip.split(',')[0].strip()
    xff = request.headers.get('X-Forwarded-For', '')
    if xff:
        # Pega o último IP adicionado pelo proxy reverso, não o primeiro enviado pelo cliente
        return xff.split(',')[-1].strip()
    return request.remote_addr or 'unknown'

get_client_ip = obter_ip_real

def require_auth(f):
    """Decorator para proteger rotas da API exigindo JWT válido."""
    @wraps(f)
    def decorated(*args, **kwargs):
        auth_header = request.headers.get('Authorization', '')
        token = auth_header.replace('Bearer ', '').strip() if auth_header.startswith('Bearer ') else ''
        if not token and 'token' in request.args:
            token = request.args.get('token')
        user = validar_token(token)
        if not user:
            return jsonify({"error": "Não autorizado. Faça login novamente."}), 401
        g.current_user = user
        request.user = user
        return f(*args, **kwargs)
    return decorated

def require_admin(f):
    """Decorator para rotas exclusivas de administradores."""
    @wraps(f)
    def decorated(*args, **kwargs):
        auth_header = request.headers.get('Authorization', '')
        token = auth_header.replace('Bearer ', '').strip() if auth_header.startswith('Bearer ') else ''
        if not token and 'token' in request.args:
            token = request.args.get('token')
        user = validar_token(token)
        if not user or user.get('role') != 'admin':
            return jsonify({"error": "Acesso restrito a administradores."}), 403
        g.current_user = user
        request.user = user
        return f(*args, **kwargs)
    return decorated

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

@app.before_request
def start_request_timer():
    g._req_start_time = time.perf_counter()

@app.after_request
def add_cors_headers(response):
    response.headers['Access-Control-Allow-Origin'] = '*'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type,Authorization'
    response.headers['Access-Control-Allow-Methods'] = 'GET,PUT,POST,DELETE,OPTIONS'
    if hasattr(g, '_req_start_time'):
        latency_ms = (time.perf_counter() - g._req_start_time) * 1000.0
        response.headers['X-Response-Time-Ms'] = f"{latency_ms:.2f}"
    return response

@app.route('/api/health', methods=['GET'])
def api_health():
    db_ok = False
    partidas_count = 0
    t0 = time.perf_counter()
    try:
        if os.path.exists(DB_FUTEBOL):
            try:
                conn = sqlite3.connect(f"file:{DB_FUTEBOL}?immutable=1", uri=True, timeout=5)
            except Exception:
                try:
                    conn = sqlite3.connect(f"file:{DB_FUTEBOL}?mode=ro", uri=True, timeout=5)
                except Exception:
                    conn = sqlite3.connect(DB_FUTEBOL, timeout=5)
            c = conn.cursor()
            c.execute("SELECT count(*) FROM partidas")
            partidas_count = c.fetchone()[0]
            conn.close()
            db_ok = True
    except Exception:
        db_ok = False

    query_latency_ms = round((time.perf_counter() - t0) * 1000.0, 2)
    status_code = 200 if db_ok else 503
    return jsonify({
        "status": "ok" if db_ok else "degraded",
        "mensagem": "API operacional",
        "database": {
            "status": "connected" if db_ok else "disconnected",
            "partidas": partidas_count,
            "query_latency_ms": query_latency_ms,
            "slo_p95_target_ms": 200,
            "slo_healthy": query_latency_ms < 200
        },
        "version": "2026.1",
        "timestamp": datetime.datetime.now(datetime.timezone.utc).isoformat()
    }), status_code

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


@app.route('/api/auth/alterar-senha', methods=['POST'])
@require_auth
def api_alterar_senha():
    try:
        user = g.current_user
        username = user.get('username', '')
        dados = request.get_json(force=True, silent=True) or {}
        senha_atual = (dados.get('senha_atual') or '').strip()
        nova_senha = (dados.get('nova_senha') or '').strip()

        if not senha_atual or not nova_senha:
            return jsonify({"error": "Informe a senha atual e a nova senha."}), 400
        if len(nova_senha) < 4:
            return jsonify({"error": "A nova senha deve ter no mínimo 4 caracteres."}), 400

        # 1. Validar senha atual
        _, login_err = login_usuario(username, senha_atual)
        if login_err:
            return jsonify({"error": "Senha atual incorreta."}), 400

        nova_hash = hash_senha(nova_senha)

        # 2. Tentar atualizar banco SQLite local se for gravável
        try:
            conn = sqlite3.connect(DB_FUTEBOL, timeout=10.0)
            c = conn.cursor()
            c.execute("UPDATE usuarios SET senha_hash = ? WHERE LOWER(username) = LOWER(?);", (nova_hash, username))
            conn.commit()
            conn.close()
        except Exception:
            pass

        # 3. Notificar o daemon da VM para persistir no banco oficial e no git
        try:
            vm_url = "http://163.176.87.218:3000/auth/update-password"
            requests.post(
                vm_url,
                headers={"x-auth-secret": SECRET_KEY},
                json={"username": username, "nova_senha": nova_senha},
                timeout=5
            )
        except Exception:
            pass

        # 4. Salvar no micro-cache para login instantâneo
        try:
            vm_cache_url = f"http://163.176.87.218:3000/cache/user_pass_{username.lower()}"
            requests.post(
                vm_cache_url,
                json={"value": {"hash": nova_hash}, "ttlSeconds": 86400 * 30},
                timeout=3
            )
        except Exception:
            pass

        return jsonify({"success": True, "mensagem": "Senha alterada com sucesso!"})
    except Exception as e:
        return jsonify({"error": f"Falha ao alterar senha: {str(e)}"}), 500

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
            conn = sqlite3.connect(f"file:{DB_FUTEBOL}?immutable=1", uri=True, timeout=15)
        except Exception:
            try:
                conn = sqlite3.connect(f"file:{DB_FUTEBOL}?mode=ro", uri=True, timeout=15)
            except Exception:
                conn = sqlite3.connect(DB_FUTEBOL, timeout=15)
    else:
        conn = sqlite3.connect(DB_FUTEBOL, timeout=15)

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
            cursor.execute(f"ATTACH DATABASE 'file:{DB_CLIMA}?immutable=1' AS clima;")
        except Exception:
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

@app.route('/api/home/cockpit', methods=['GET'])
def get_home_cockpit():
    MESES_PT = {
        '01': 'Janeiro', '02': 'Fevereiro', '03': 'Março', '04': 'Abril',
        '05': 'Maio', '06': 'Junho', '07': 'Julho', '08': 'Agosto',
        '09': 'Setembro', '10': 'Outubro', '11': 'Novembro', '12': 'Dezembro'
    }

    raw_date = request.args.get('date', '').strip()
    target_date = ''
    if raw_date:
        parts = raw_date.split('-')
        if len(parts) >= 2:
            m, d = parts[-2], parts[-1]
            if len(m) == 2 and len(d) == 2 and m.isdigit() and d.isdigit():
                target_date = f"{m}-{d}"
    
    if not target_date:
        target_date = datetime.date.today().strftime('%m-%d')

    cache_key = f"cockpit_{target_date}"
    cached = api_cache.get(cache_key)
    if cached:
        return jsonify(cached)

    m_code, d_code = target_date.split('-')
    data_formatada = f"{int(d_code)} de {MESES_PT.get(m_code, 'Outubro')}"

    conn = get_db()
    c = conn.cursor()

    # 1. NESTE DIA NA HISTÓRIA
    c.execute("""
        SELECT id_partida, ano, data, mandante, visitante, gols_mandante, gols_visitante, placar, campeonato, estadio, fase, publico
        FROM partidas
        WHERE strftime('%m-%d', data) = ?
    """, (target_date,))
    rows_neste_dia = c.fetchall()

    big_clubs = {'Flamengo', 'Palmeiras', 'Corinthians', 'São Paulo', 'Santos', 'Grêmio', 'Internacional', 'Vasco', 'Fluminense', 'Botafogo', 'Cruzeiro', 'Atlético-MG', 'Bahia', 'Athletico-PR'}

    scored_jogos = []
    for r in rows_neste_dia:
        p = dict(r)
        gm = p['gols_mandante'] if p['gols_mandante'] is not None else 0
        gv = p['gols_visitante'] if p['gols_visitante'] is not None else 0
        m = p['mandante'] or ''
        v = p['visitante'] or ''
        is_m_big = m in big_clubs
        is_v_big = v in big_clubs
        is_classico = is_m_big and is_v_big

        score = (gm + gv) * 3
        if is_classico:
            score += 70
        elif is_m_big or is_v_big:
            score += 20
        fase_str = str(p['fase'] or '').lower()
        if any(k in fase_str for k in ['final', 'semi', 'decisão', 'oitavas', 'quartas']):
            score += 25
        if p['publico'] and p['publico'] > 30000:
            score += 20

        scored_jogos.append((score, {
            'id_partida': p['id_partida'],
            'ano': p['ano'],
            'data': p['data'],
            'mandante': m,
            'visitante': v,
            'gols_mandante': gm,
            'gols_visitante': gv,
            'placar': f"{gm} x {gv}",
            'campeonato': p['campeonato'],
            'estadio': p['estadio'] or 'Estádio Histórico',
            'fase': p['fase'] or 'Fase Única',
            'is_classico': is_classico,
            'publico': p['publico']
        }))

    scored_jogos.sort(key=lambda x: x[0], reverse=True)
    neste_dia = [item[1] for item in scored_jogos[:12]]

    # 2. TABUS E DESTAQUES H2H (CONFRONTOS HISTÓRICOS)
    classicos_definidos = [
        ('Palmeiras', 'Santos', 'Clássico da Saudade', 'São Paulo'),
        ('Flamengo', 'Vasco', 'Clássico dos Milhões', 'Rio de Janeiro'),
        ('Corinthians', 'São Paulo', 'Majestoso', 'São Paulo'),
        ('Grêmio', 'Internacional', 'Gre-Nal', 'Rio Grande do Sul'),
        ('Atlético-MG', 'Cruzeiro', 'Clássico Mineiro', 'Minas Gerais'),
        ('Flamengo', 'Atlético-MG', 'Duelo Histórico', 'Nacional'),
        ('Corinthians', 'Palmeiras', 'Derby Paulista', 'São Paulo'),
        ('Botafogo', 'Fluminense', 'Clássico Vovô', 'Rio de Janeiro'),
        ('São Paulo', 'Santos', 'San-São', 'São Paulo'),
        ('Flamengo', 'Fluminense', 'Fla-Flu', 'Rio de Janeiro'),
        ('Bahia', 'Vitória', 'Ba-Vi', 'Bahia'),
        ('Cruzeiro', 'Grêmio', 'Duelo de Gigantes', 'Nacional')
    ]

    tabus_destaques = []
    for c1, c2, apelido, regiao in classicos_definidos:
        c.execute("""
            SELECT data, mandante, visitante, gols_mandante, gols_visitante, campeonato
            FROM partidas
            WHERE ((mandante = ? AND visitante = ?) OR (mandante = ? AND visitante = ?))
              AND gols_mandante IS NOT NULL AND gols_visitante IS NOT NULL
            ORDER BY data DESC, id_partida DESC
        """, (c1, c2, c2, c1))
        p_rows = c.fetchall()
        if not p_rows:
            continue
        total = len(p_rows)
        vit1 = 0
        vit2 = 0
        emp = 0
        gols1 = 0
        gols2 = 0

        # Identificar invencibilidade ativa a partir do jogo mais recente
        last_loss_c1_idx = None
        last_loss_c2_idx = None

        for idx, r in enumerate(p_rows):
            gm = r['gols_mandante']
            gv = r['gols_visitante']
            m = r['mandante']
            g1 = gm if m == c1 else gv
            g2 = gv if m == c1 else gm

            gols1 += g1
            gols2 += g2

            if g1 > g2:
                vit1 += 1
                if last_loss_c1_idx is None and last_loss_c2_idx is not None:
                    pass
            elif g2 > g1:
                vit2 += 1
            else:
                emp += 1

            if g1 < g2 and last_loss_c1_idx is None:
                last_loss_c1_idx = idx
            if g2 < g1 and last_loss_c2_idx is None:
                last_loss_c2_idx = idx

        c1_unbeaten = last_loss_c1_idx if last_loss_c1_idx is not None else total
        c2_unbeaten = last_loss_c2_idx if last_loss_c2_idx is not None else total

        streak_team = None
        streak_count = 0
        if c1_unbeaten > c2_unbeaten and c1_unbeaten > 0:
            streak_team = c1
            streak_count = c1_unbeaten
        elif c2_unbeaten > c1_unbeaten and c2_unbeaten > 0:
            streak_team = c2
            streak_count = c2_unbeaten

        ult = p_rows[0]
        ult_info = {
            'data': ult['data'],
            'mandante': ult['mandante'],
            'visitante': ult['visitante'],
            'placar': f"{ult['gols_mandante']} x {ult['gols_visitante']}",
            'campeonato': ult['campeonato']
        }

        # Manchete editorial automática e categorização
        if streak_team and streak_count >= 3:
            adv = c2 if streak_team == c1 else c1
            tag = 'Tabu Ativo'
            manchete = f"{streak_team} não perde para o {adv} há {streak_count} jogos consecutivos."
        elif abs(vit1 - vit2) >= 15:
            maior = c1 if vit1 > vit2 else c2
            menor = c2 if vit1 > vit2 else c1
            dif = abs(vit1 - vit2)
            tag = 'Supremacia'
            manchete = f"{maior} sustenta hegemonia de +{dif} vitórias no retrospecto contra o {menor}."
        elif abs(vit1 - vit2) <= 3:
            tag = 'Equilíbrio Histórico'
            manchete = f"Rivalidade milimétrica com apenas {abs(vit1 - vit2)} vitória(s) de diferença em {total} jogos."
        else:
            maior = c1 if vit1 > vit2 else c2
            menor = c2 if vit1 > vit2 else c1
            dif = abs(vit1 - vit2)
            tag = 'Vantagem Histórica'
            manchete = f"{maior} lidera o histórico com folga de {dif} vitórias a mais sobre o {menor}."

        tabus_destaques.append({
            'clube1': c1,
            'clube2': c2,
            'apelido': apelido,
            'regiao': regiao,
            'total_jogos': total,
            'vit_clube1': vit1,
            'vit_clube2': vit2,
            'empates': emp,
            'gols_clube1': gols1,
            'gols_clube2': gols2,
            'tag': tag,
            'manchete': manchete,
            'streak_team': streak_team,
            'streak_count': streak_count,
            'ultimo_jogo': ult_info
        })

    # 3. RANKING HISTÓRICO GERAL
    c.execute("""
        WITH mandantes AS (
            SELECT mandante AS clube,
                   COUNT(*) AS j,
                   SUM(CASE WHEN gols_mandante > gols_visitante THEN 1 ELSE 0 END) AS v,
                   SUM(CASE WHEN gols_mandante = gols_visitante THEN 1 ELSE 0 END) AS e,
                   SUM(CASE WHEN gols_mandante < gols_visitante THEN 1 ELSE 0 END) AS d,
                   SUM(COALESCE(gols_mandante, 0)) AS gp,
                   SUM(COALESCE(gols_visitante, 0)) AS gc
            FROM partidas
            WHERE mandante IS NOT NULL AND mandante != ''
            GROUP BY mandante
        ),
        visitantes AS (
            SELECT visitante AS clube,
                   COUNT(*) AS j,
                   SUM(CASE WHEN gols_visitante > gols_mandante THEN 1 ELSE 0 END) AS v,
                   SUM(CASE WHEN gols_visitante = gols_mandante THEN 1 ELSE 0 END) AS e,
                   SUM(CASE WHEN gols_visitante < gols_mandante THEN 1 ELSE 0 END) AS d,
                   SUM(COALESCE(gols_visitante, 0)) AS gp,
                   SUM(COALESCE(gols_mandante, 0)) AS gc
            FROM partidas
            WHERE visitante IS NOT NULL AND visitante != ''
            GROUP BY visitante
        ),
        combinado AS (
            SELECT * FROM mandantes
            UNION ALL
            SELECT * FROM visitantes
        )
        SELECT clube,
               SUM(j) AS jogos,
               SUM(v) AS vitorias,
               SUM(e) AS empates,
               SUM(d) AS derrotas,
               SUM(gp) AS gp,
               SUM(gc) AS gc,
               (SUM(gp) - SUM(gc)) AS sg,
               (SUM(v) * 3 + SUM(e)) AS pontos,
               ROUND((CAST(SUM(v) * 3 + SUM(e) AS FLOAT) / (SUM(j) * 3)) * 100, 1) AS aproveitamento
        FROM combinado
        GROUP BY clube
        HAVING jogos >= 50
        ORDER BY pontos DESC
        LIMIT 20;
    """)
    ranking_rows = c.fetchall()
    ranking_historico = []
    for pos, r in enumerate(ranking_rows, 1):
        item = dict(r)
        item['posicao'] = pos
        ranking_historico.append(item)

    # 3.1 RANKING PONDERADO RECALIBRADO (Mundial 280, Libertadores 250, Brasileirão 170, CDB 130)
    c.execute("""
        SELECT posicao, clube, uf, pontos, titulos, campanhas
        FROM ranking_ponderado
        ORDER BY pontos DESC
        LIMIT 25;
    """)
    ranking_ponderado = [dict(r) for r in c.fetchall()]

    # 4. TICKER DE JOGOS RECENTES
    c.execute("""
        SELECT id_partida, data, horario, mandante, visitante, gols_mandante, gols_visitante, placar, campeonato, estadio
        FROM partidas
        WHERE data IS NOT NULL AND data != '' AND data != '0000-00-00'
        ORDER BY data DESC, id_partida DESC
        LIMIT 25;
    """)
    ticker_jogos = []
    for r in c.fetchall():
        p = dict(r)
        gm = p['gols_mandante']
        gv = p['gols_visitante']
        finalizado = gm is not None and gv is not None
        
        # Formatar data dd/mm
        dt_str = p['data']
        dt_fmt = dt_str
        try:
            dt_parts = dt_str.split('-')
            if len(dt_parts) == 3:
                dia = int(dt_parts[2])
                mes = MESES_PT.get(dt_parts[1], '')[:3]
                dt_fmt = f"{dia} {mes}"
        except Exception:
            pass

        ticker_jogos.append({
            'id_partida': p['id_partida'],
            'data': p['data'],
            'data_formatada': dt_fmt,
            'horario': p['horario'] or '',
            'mandante': p['mandante'],
            'visitante': p['visitante'],
            'gols_mandante': gm,
            'gols_visitante': gv,
            'placar': f"{gm} x {gv}" if finalizado else 'vs',
            'finalizado': finalizado,
            'campeonato': p['campeonato'],
            'estadio': p['estadio'] or ''
        })

    conn.close()

    payload = {
        'data_selecionada': target_date,
        'data_formatada': data_formatada,
        'neste_dia': neste_dia,
        'tabus_destaques': tabus_destaques,
        'ranking_historico': ranking_historico,
        'ranking_ponderado': ranking_ponderado,
        'ticker_jogos': ticker_jogos
    }

    api_cache.set(cache_key, payload, ttl=1800)
    return jsonify(payload)

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
            "nome": clube,
            "jogos": total_j,
            "vitorias": vitorias,
            "empates": empates,
            "derrotas": derrotas,
            "pontos": pontos,
            "aproveitamento": aproveitamento,
            "sequencia": sequencia,
            "forma_recente": sequencia,
            "gols_pro": gols_pro,
            "gols_marcados": gols_pro,
            "gols_contra": gols_contra,
            "gols_sofridos": gols_contra,
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
            "partidas_recentes": historico_recente,
            "ultimos_jogos": historico_recente
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

NOTAS_HISTORICAS_CLASSICOS = {
    ("flamengo", "vasco"): "O acervo do FutStats agora conta com 179 partidas catalogadas (Campeonato Brasileiro desde 1971, Copa do Brasil, Torneio Rio-SP e Campeonato Carioca desde 1971). No retrospecto centenário completo (incluindo todas as edições anteriores a 1971 e torneios municipais), o Clássico dos Milhões soma mais de 420 partidas oficiais.",
    ("flamengo", "fluminense"): "O acervo do FutStats agora conta com 196 partidas catalogadas (Campeonato Brasileiro, Copa do Brasil, Rio-SP e Campeonato Carioca desde 1971). O retrospecto geral centenário do Fla-Flu (disputado desde 1912) soma mais de 445 partidas.",
    ("botafogo", "flamengo"): "O acervo do FutStats agora conta com 185 partidas catalogadas (Brasileirão, Copa do Brasil, Rio-SP e Carioca desde 1971). O histórico geral centenário do Clássico da Rivalidade ultrapassa 380 confrontos.",
    ("botafogo", "vasco"): "O acervo do FutStats conta com mais de 155 partidas catalogadas desde 1971 (Brasileirão, Copa do Brasil, Rio-SP e Carioca). O histórico geral centenário do Clássico da Amizade ultrapassa 360 confrontos.",
    ("fluminense", "vasco"): "O acervo do FutStats conta com mais de 160 partidas catalogadas desde 1971 (Brasileirão, Copa do Brasil, Rio-SP e Carioca). O histórico geral centenário do Clássico dos Gigantes ultrapassa 385 confrontos.",
    ("atlético", "cruzeiro"): "Cobertura no FutStats: partidas pelo Campeonato Brasileiro, Copa do Brasil e Mineiro pós-2002. O histórico geral do Clássico Mineiro (disputado desde 1921) ultrapassa 500 partidas.",
    ("bahia", "vitória"): "Cobertura no FutStats: jogos registrados pelo Campeonato Brasileiro e Copa do Brasil. O histórico geral do Ba-Vi (incluindo o Campeonato Baiano desde 1932) ultrapassa 490 confrontos.",
    ("athletico", "coritiba"): "Cobertura no FutStats: partidas pelo Brasileirão, Copa do Brasil e Paranaense pós-2003. O histórico geral do Atle-Tiba (disputado desde 1924) ultrapassa 390 confrontos.",
    ("corinthians", "palmeiras"): "Cobertura ampla no FutStats: mais de 400 jogos catalogados pelo Campeonato Paulista (desde 1917), Campeonato Brasileiro, Rio-SP e Copa do Brasil.",
    ("palmeiras", "santos"): "Cobertura ampla no FutStats: mais de 360 jogos catalogados pelo Campeonato Paulista (desde 1915), Brasileirão e competições nacionais.",
    ("grêmio", "internacional"): "Cobertura ampla no FutStats: mais de 200 jogos catalogados pelo Campeonato Gaúcho (desde 1915), Brasileirão, Copa do Brasil e Libertadores."
}

@app.route('/api/h2h', methods=['GET'])
@require_auth
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
    
    # Busca todas as partidas entre os dois com cotações de apostas (quando disponíveis)
    query = """
        SELECT 
            p.id_partida, p.ano, p.data, p.mandante, p.visitante, 
            p.gols_mandante, p.gols_visitante, p.placar, p.vencedor, 
            p.campeonato, p.estadio, p.fase,
            o.odd_mandante, o.odd_empate, o.odd_visitante,
            o.prob_mandante, o.prob_empate, o.prob_visitante,
            o.status_zebra
        FROM partidas p
        LEFT JOIN odds_partidas o ON p.id_partida = o.id_partida
        WHERE (p.mandante LIKE ? AND p.visitante LIKE ?) OR (p.mandante LIKE ? AND p.visitante LIKE ?)
        ORDER BY p.data DESC, p.id_partida DESC;
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

    # Busca nota histórica contextual se for clássico conhecido
    c1_low, c2_low = c1.lower(), c2.lower()
    nota_historica = None
    for (t1, t2), nota in NOTAS_HISTORICAS_CLASSICOS.items():
        if (t1 in c1_low and t2 in c2_low) or (t2 in c1_low and t1 in c2_low):
            nota_historica = nota
            break
    
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
        "nota_historica": nota_historica,
        "partidas": partidas[:30] # Últimos 30 jogos
    }
    api_cache.set(cache_key, res, ttl=1800)
    return jsonify(res)

@app.route('/api/partidas', methods=['GET'])
@require_auth
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
@require_auth
def get_clima_futebol():
    conn = get_db()
    c = conn.cursor()
    
    # Cruzamento de partidas 2015-2024 com dados meteorológicos do clima_diario
    # Fix: Join estrito por cidade para evitar produto cartesiano e contaminação do interior
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
         AND LOWER(p.cidade) = LOWER(c.cidade)
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
         AND LOWER(p.cidade) = LOWER(c.cidade)
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
         AND LOWER(p.cidade) = LOWER(c.cidade)
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
@require_auth
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

MAPA_APELIDOS_ATLETAS = {
    'gabigol': 'Gabriel Barbosa',
    'gabi': 'Gabriel Barbosa',
    'gabriel barbosa': 'Gabriel Barbosa',
    'hulk': 'Hulk',
    'arrascaeta': 'Arrascaeta',
    'de arrascaeta': 'Arrascaeta',
    'giorgian de arrascaeta': 'Arrascaeta',
    'german cano': 'Germán Cano',
    'cano': 'Germán Cano',
    'veiga': 'Raphael Veiga',
    'raphael veiga': 'Raphael Veiga',
    'dudu': 'Dudu',
    'pedro': 'Pedro',
    'zico': 'Zico',
    'pele': 'Pelé',
    'dinamite': 'Roberto Dinamite',
    'ronaldinho': 'Ronaldinho Gaúcho',
    'ronaldinho gaucho': 'Ronaldinho Gaúcho',
    'paulinho': 'Paulinho (Atlético-MG)',
    'paulinho galo': 'Paulinho (Atlético-MG)',
    'paulinho atletico': 'Paulinho (Atlético-MG)',
    'paulinho corinthians': 'Paulinho (Corinthians)',
    'paulinho mclaren': 'Paulinho McLaren',
    'paulinho flamengo': 'Paulinho (Flamengo)',
    'paulinho moccelin': 'Paulinho Moccelin',
    'paulinho criciuma': 'Paulinho Criciúma',
    'paulinho paula': 'Paulinho Paula'
}

@app.route('/api/jogadores/busca', methods=['GET'])
@require_auth
def buscar_jogadores():
    q = request.args.get('q', '').strip()
    limit = min(request.args.get('limit', 20, type=int), 50)
    if not q or len(q) < 2:
        return jsonify([])

    conn = get_db()
    c = conn.cursor()
    canonico = MAPA_APELIDOS_ATLETAS.get(q.lower(), q)
    param_like_q = f"%{q}%"
    param_like_c = f"%{canonico}%"

    # Busca prioritária na tabela jogadores_estatisticas
    sql = """
        SELECT 
            id_jogador,
            ogol_id,
            nome_exibicao as atleta,
            posicao,
            clubes,
            total_gols as gols,
            total_assistencias as assistencias,
            participacoes_gols,
            aproveitamento_pontos,
            cartoes_amarelos as amarelos,
            cartoes_vermelhos as vermelhos,
            total_jogos as jogos
        FROM jogadores_estatisticas
        WHERE nome_exibicao LIKE ? OR nome_completo LIKE ? OR apelido LIKE ? OR nome_exibicao LIKE ?
        ORDER BY 
            CASE 
                WHEN LOWER(nome_exibicao) = LOWER(?) THEN 1
                WHEN LOWER(nome_exibicao) = LOWER(?) THEN 2
                WHEN LOWER(nome_exibicao) LIKE LOWER(? || ' %') THEN 3
                WHEN LOWER(nome_exibicao) LIKE LOWER(? || ' %') THEN 4
                ELSE 5 
            END,
            total_gols DESC,
            participacoes_gols DESC,
            total_jogos DESC
        LIMIT ?;
    """
    rows = c.execute(sql, (param_like_q, param_like_q, param_like_q, param_like_c, canonico, q, canonico, q, limit)).fetchall()
    
    resultados = []
    for r in rows:
        clubes_lista = [cb.strip() for cb in (r["clubes"] or "").split(',') if cb.strip()]
        resultados.append({
            "id_jogador": r["id_jogador"],
            "ogol_id": r["ogol_id"],
            "nome": r["atleta"],
            "atleta": r["atleta"],
            "posicao": r["posicao"],
            "clubes_recentes": ', '.join(clubes_lista[:3]) if clubes_lista else 'Sem clube registrado',
            "clubes": [cb.strip() for cb in (r["clubes"] or "").split(',') if cb.strip()],
            "gols": r["gols"] or 0,
            "assistencias": r["assistencias"] or 0,
            "participacoes_gols": r["participacoes_gols"] or 0,
            "aproveitamento_pontos": r["aproveitamento_pontos"] or 0.0,
            "amarelos": r["amarelos"] or 0,
            "vermelhos": r["vermelhos"] or 0,
            "jogos": r["jogos"] or 0
        })
    conn.close()
    return jsonify(resultados)

@app.route('/api/debug/db')
def debug_db():
    candidates = [
        os.path.join(ROOT_DIR, 'data', 'futebol.db'),
        os.path.join(BASE_DIR, '..', 'data', 'futebol.db'),
        os.path.join(BASE_DIR, 'data', 'futebol.db'),
        os.path.join('/var/task/data', 'futebol.db'),
        os.path.join('/var/task/api/data', 'futebol.db'),
        os.path.join(os.getcwd(), 'data', 'futebol.db'),
    ]
    res = {
        'cwd': os.getcwd(),
        'file': __file__,
        'root_dir': ROOT_DIR,
        'base_dir': BASE_DIR,
        'db_futebol': DB_FUTEBOL,
        'candidates': {c: os.path.exists(c) for c in candidates}
    }
    return jsonify(res)

@app.route('/api/jogadores/ranking', methods=['GET'])
@require_auth
def get_jogadores_ranking():
    tipo = request.args.get('tipo', 'gols').strip() # 'gols', 'carreira', 'assistencias', 'clutch', 'participacoes', 'aproveitamento'
    limit = min(request.args.get('limit', 20, type=int), 50)
    conn = get_db()
    c = conn.cursor()
    
    where_extra = "WHERE total_gols > 0"
    if tipo == 'carreira':
        order_col = "gols_carreira_oficiais DESC, jogos_carreira_oficiais ASC"
        where_extra = "WHERE gols_carreira_oficiais > 0"
    elif tipo == 'assistencias':
        order_col = "total_assistencias DESC, total_gols DESC"
        where_extra = "WHERE total_assistencias > 0"
    elif tipo == 'clutch':
        order_col = "gols_decisivos_80mais DESC, total_gols DESC"
        where_extra = "WHERE gols_decisivos_80mais > 0"
    elif tipo == 'participacoes':
        order_col = "participacoes_gols DESC, total_gols DESC"
        where_extra = "WHERE participacoes_gols > 0"
    elif tipo == 'aproveitamento':
        order_col = "aproveitamento_pontos DESC, total_jogos DESC"
        where_extra = "WHERE total_jogos >= 30"
    else:
        order_col = "total_gols DESC, total_jogos ASC"
        
    sql = f"""
        SELECT id_jogador, ogol_id, nome_exibicao as nome, posicao, clubes,
               total_jogos as jogos, total_gols as gols, total_assistencias as assistencias,
               participacoes_gols, gols_decisivos_80mais as gols_clutch,
               maior_vitima_clube, estadio_favorito, aproveitamento_pontos,
               COALESCE(gols_carreira_oficiais, 0) as gols_carreira,
               COALESCE(jogos_carreira_oficiais, 0) as jogos_carreira,
               COALESCE(assistencias_carreira_oficiais, 0) as assistencias_carreira
        FROM jogadores_estatisticas
        {where_extra}
        ORDER BY {order_col}
        LIMIT ?;
    """
    rows = [dict(r) for r in c.execute(sql, (limit,)).fetchall()]
    for r in rows:
        r['atleta'] = r.get('nome')
        r['clubes_lista'] = [cb.strip() for cb in (r.get('clubes') or '').split(',') if cb.strip()]
        r['clubes'] = r['clubes_lista']
        r['clubes_formatado'] = ', '.join(r['clubes_lista'][:4]) if r['clubes_lista'] else 'N/I'
        if tipo == 'carreira':
            r['total'] = r.get('gols_carreira', 0)
            r['jogos_exibicao'] = r.get('jogos_carreira', r.get('jogos', 0))
        elif tipo == 'assistencias':
            r['total'] = r.get('assistencias', 0)
            r['jogos_exibicao'] = r.get('jogos', 0)
        elif tipo == 'clutch':
            r['total'] = r.get('gols_clutch', 0)
            r['jogos_exibicao'] = r.get('jogos', 0)
        elif tipo == 'participacoes':
            r['total'] = r.get('participacoes_gols', 0)
            r['jogos_exibicao'] = r.get('jogos', 0)
        elif tipo == 'aproveitamento':
            r['total'] = r.get('aproveitamento_pontos', 0)
            r['jogos_exibicao'] = r.get('jogos', 0)
        else:
            r['total'] = r.get('gols', 0)
            r['jogos_exibicao'] = r.get('jogos', 0)
    conn.close()
    return jsonify(rows)

@app.route('/api/jogadores/perfil', methods=['GET'])
@require_auth
def get_jogador_perfil():
    player_id = request.args.get('id', type=int)
    nome = request.args.get('nome', '').strip()
    clube_filtro = request.args.get('clube', '').strip()
    if not player_id and not nome:
        return jsonify({"error": "Identificador ou Nome do atleta não informado"}), 400

    conn = get_db()
    c = conn.cursor()

    # Buscar metadados consolidados de jogadores_estatisticas
    row_est = None
    if player_id:
        row_est = c.execute("SELECT * FROM jogadores_estatisticas WHERE id_jogador = ? LIMIT 1;", (player_id,)).fetchone()
    if not row_est and nome:
        nome_canonico = MAPA_APELIDOS_ATLETAS.get(nome.lower(), nome)
        row_est = c.execute("""
            SELECT * FROM jogadores_estatisticas 
            WHERE LOWER(nome_exibicao) = LOWER(?) OR LOWER(nome_completo) = LOWER(?) OR LOWER(apelido) = LOWER(?)
            ORDER BY total_gols DESC LIMIT 1;
        """, (nome_canonico, nome_canonico, nome)).fetchone()

    stats_meta = dict(row_est) if row_est else {}
    target_id = stats_meta.get('id_jogador') or player_id
    nome_exib = stats_meta.get('nome_exibicao') or nome

    # Condições de busca para partidas (usando id_jogador com fallback por nome para resiliência máxima)
    if target_id:
        cond_gols = "(g.id_jogador = ? OR (g.id_jogador IS NULL AND LOWER(g.atleta) = LOWER(?)))"
        params_gols = [target_id, nome_exib]
        cond_cartoes = "(cr.id_jogador = ? OR (cr.id_jogador IS NULL AND LOWER(cr.atleta) = LOWER(?)))"
        params_cartoes = [target_id, nome_exib]
        cond_esc = "(e.id_jogador = ? OR (e.id_jogador IS NULL AND LOWER(e.atleta) = LOWER(?)))"
        params_esc = [target_id, nome_exib]
    else:
        nome_canonico = MAPA_APELIDOS_ATLETAS.get(nome.lower(), nome)
        cond_gols = "(g.atleta = ? OR g.atleta = ?)"
        params_gols = [nome, nome_canonico]
        cond_cartoes = "(cr.atleta = ? OR cr.atleta = ?)"
        params_cartoes = [nome, nome_canonico]
        cond_esc = "(e.atleta = ? OR e.atleta = ?)"
        params_esc = [nome, nome_canonico]

    # Buscar gols
    sql_gols = f"""
        SELECT g.id_gol, g.id_partida, g.tipo_de_gol, g.minuto, g.clube, 
               p.ano, p.data, p.mandante, p.visitante, p.placar, p.campeonato, p.estadio
        FROM gols g
        JOIN partidas p ON g.id_partida = p.id_partida
        WHERE {cond_gols}
    """
    if clube_filtro:
        sql_gols += " AND g.clube LIKE ?"
        params_gols.append(f"%{clube_filtro}%")
    sql_gols += " ORDER BY p.data DESC, p.id_partida DESC;"
    c.execute(sql_gols, params_gols)
    gols = [dict(r) for r in c.fetchall()]

    # Buscar cartoes
    sql_cartoes = f"""
        SELECT cr.id_cartao, cr.id_partida, cr.cartao, cr.minuto, cr.motivo, cr.num_camisa, cr.posicao, cr.clube,
               p.ano, p.data, p.mandante, p.visitante, p.placar, p.campeonato, p.estadio
        FROM cartoes cr
        JOIN partidas p ON cr.id_partida = p.id_partida
        WHERE {cond_cartoes}
    """
    if clube_filtro:
        sql_cartoes += " AND cr.clube LIKE ?"
        params_cartoes.append(f"%{clube_filtro}%")
    sql_cartoes += " ORDER BY p.data DESC, p.id_partida DESC;"
    c.execute(sql_cartoes, params_cartoes)
    cartoes = [dict(r) for r in c.fetchall()]

    # Buscar escalacoes
    sql_esc = f"""
        SELECT e.id_escalacao, e.id_partida, e.num_camisa, e.posicao, e.titular, e.is_goleiro, e.is_capitao, e.clube,
               p.ano, p.data, p.mandante, p.visitante, p.placar, p.campeonato, p.estadio
        FROM escalacoes e
        JOIN partidas p ON e.id_partida = p.id_partida
        WHERE {cond_esc}
    """
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
    gols_normais = stats_meta.get('gols_bola_rolando') or len([g for g in gols if not g['tipo_de_gol'] or 'normal' in (g['tipo_de_gol'] or '').lower()])
    gols_penalti = stats_meta.get('gols_penalti') or len([g for g in gols if g['tipo_de_gol'] and ('pênalti' in g['tipo_de_gol'].lower() or 'penalti' in g['tipo_de_gol'].lower())])
    gols_falta = stats_meta.get('gols_falta') or len([g for g in gols if g['tipo_de_gol'] and 'falta' in g['tipo_de_gol'].lower()])
    amarelos = stats_meta.get('cartoes_amarelos') or len([c for c in cartoes if 'amarelo' in (c['cartao'] or '').lower()])
    vermelhos = stats_meta.get('cartoes_vermelhos') or len([c for c in cartoes if 'vermelho' in (c['cartao'] or '').lower()])
    total_jogos = max(stats_meta.get('total_jogos', 0), len(partidas_ordenadas))

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

    # Buscar dados espaciais (shotmap e heatmap) se as tabelas existirem
    shotmap_atleta = []
    heatmap_atleta = []
    try:
        if target_id:
            c.execute("""
                SELECT id_evento, id_partida, minuto, resultado, parte_corpo, situacao, 
                       xg, xgot, x_origem, y_origem, x_metros, y_metros, gol_mouth_y, gol_mouth_z
                FROM partida_shotmap 
                WHERE id_jogador = ?
                ORDER BY id_partida DESC LIMIT 100;
            """, (target_id,))
            shotmap_atleta = [dict(r) for r in c.fetchall()]

            c.execute("""
                SELECT pontos_json FROM atleta_heatmap 
                WHERE id_jogador = ? LIMIT 20;
            """, (target_id,))
            for h_row in c.fetchall():
                try:
                    pts = json.loads(h_row['pontos_json'] or '[]')
                    heatmap_atleta.extend(pts)
                except Exception:
                    pass
    except Exception:
        pass

    # Minutagem e faixas de gols
    faixas_minutos = {'0-15': 0, '16-30': 0, '31-45+': 0, '46-60': 0, '61-75': 0, '76-90+': 0}
    tempos_gols = {'1T': stats_meta.get('gols_primeiro_tempo', 0), '2T': stats_meta.get('gols_segundo_tempo', 0), 'Outros': 0}
    for g in gols:
        m_raw = str(g.get('minuto') or '')
        m_num = re.search(r'(\d+)', m_raw)
        minuto = int(m_num.group(1)) if m_num else None
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

    anos = [p['ano'] for p in partidas_ordenadas if p['ano']]
    ano_min = stats_meta.get('ano_inicio') or (min(anos) if anos else None)
    ano_max = stats_meta.get('ano_fim') or (max(anos) if anos else None)

    conn.close()

    total_gols_final = stats_meta.get('total_gols') or len(gols)
    total_assists_final = stats_meta.get('total_assistencias') or 0

    return jsonify({
        "id_jogador": target_id,
        "nome": nome_exib,
        "nome_completo": stats_meta.get('nome_completo'),
        "foto_url": stats_meta.get('foto_url'),
        "ogol_id": stats_meta.get('ogol_id'),
        "cbf_id": stats_meta.get('cbf_id'),
        "posicao": stats_meta.get('posicao') or "Atacante",
        "altura": stats_meta.get('altura'),
        "peso": stats_meta.get('peso'),
        "data_nascimento": stats_meta.get('data_nascimento'),
        "idade": stats_meta.get('idade'),
        "nacionalidade": stats_meta.get('nacionalidade') or "Brasil",
        "naturalidade": stats_meta.get('naturalidade'),
        "situacao": stats_meta.get('situacao') or "Aposentado",
        "pe_preferencial": stats_meta.get('pe_preferencial'),
        "clubes": [cb.strip() for cb in (stats_meta.get('clubes') or '').split(',') if cb.strip()],
        "clube_filtro": clube_filtro,
        "titulos": json.loads(stats_meta['titulos']) if stats_meta.get('titulos') else [],
        "premios": json.loads(stats_meta['premios']) if stats_meta.get('premios') else [],
        "resumo": {
            "total_gols": total_gols_final,
            "total_assistencias": total_assists_final,
            "participacoes_gols": stats_meta.get('participacoes_gols') or (total_gols_final + total_assists_final),
            "gols_normais": gols_normais,
            "gols_penalti": gols_penalti,
            "gols_falta": gols_falta,
            "gols_decisivos_80mais": stats_meta.get('gols_decisivos_80mais', 0),
            "hat_tricks": stats_meta.get('hat_tricks', 0),
            "dobletes": stats_meta.get('dobletes', 0),
            "amarelos": amarelos,
            "vermelhos": vermelhos,
            "jogos_registrados": total_jogos,
            "aproveitamento_pontos": stats_meta.get('aproveitamento_pontos', 0.0),
            "jogos_titular": stats_meta.get('jogos_titular', 0),
            "jogos_reserva": stats_meta.get('jogos_reserva', 0),
            "jogos_capitao": stats_meta.get('jogos_capitao', 0),
            "chutes_ao_gol": stats_meta.get('chutes_ao_gol', 0),
            "finalizacoes_totais": stats_meta.get('finalizacoes_totais', 0),
            "pontaria_chutes_pct": stats_meta.get('pontaria_chutes_pct', 0.0),
            "penaltis_cobrados": stats_meta.get('penaltis_cobrados', 0),
            "penaltis_perdidos": stats_meta.get('penaltis_perdidos', 0),
            "maior_vitima_clube": stats_meta.get('maior_vitima_clube') or (top_vitimas[0]['clube'] if top_vitimas else None),
            "estadio_favorito": stats_meta.get('estadio_favorito'),
            "media_gols": round(total_gols_final / max(total_jogos, 1), 2),
            "ano_min": ano_min,
            "ano_max": ano_max
        },
        "carreira_oficial": {
            "gols": stats_meta.get('gols_carreira_oficiais') or 0,
            "jogos": stats_meta.get('jogos_carreira_oficiais') or 0,
            "assistencias": stats_meta.get('assistencias_carreira_oficiais') or 0,
            "clubes": json.loads(stats_meta['detalhe_carreira_clubes']) if stats_meta.get('detalhe_carreira_clubes') else []
        },
        "top_vitimas": top_vitimas,
        "historico_clubes": historico_clubes,
        "historico_torneios": historico_torneios,
        "distribuicao_minutos": faixas_minutos,
        "distribuicao_tempos": tempos_gols,
        "historico_temporadas": historico_temporadas,
        "partidas": partidas_ordenadas[:100],
        "shotmap": shotmap_atleta,
        "heatmap": heatmap_atleta
    })

@app.route('/api/arbitragem', methods=['GET'])
@require_auth
def get_arbitragem():
    cached = api_cache.get("api_arbitragem")
    if cached:
        return jsonify(cached)

    conn = get_db()
    c = conn.cursor()
    c.execute("""
        WITH jogos_era_scout AS (
            SELECT DISTINCT id_partida FROM cartoes
        ),
        stats_partidas AS (
            SELECT 
                p.arbitro,
                COUNT(p.id_partida) as total_jogos,
                SUM(CASE WHEN p.vencedor = p.mandante THEN 1 ELSE 0 END) as vit_mandante,
                SUM(CASE WHEN p.vencedor = p.visitante THEN 1 ELSE 0 END) as vit_visitante,
                SUM(CASE WHEN p.vencedor = 'Empate' THEN 1 ELSE 0 END) as empates
            FROM partidas p
            JOIN jogos_era_scout j ON p.id_partida = j.id_partida
            WHERE p.arbitro IS NOT NULL AND p.arbitro != '' AND p.arbitro != 'Não informado'
            GROUP BY p.arbitro
        ),
        stats_cartoes AS (
            SELECT 
                p.arbitro,
                COUNT(c.id_cartao) as total_cartoes,
                SUM(CASE WHEN c.cartao = 'Vermelho' THEN 1 ELSE 0 END) as total_vermelhos,
                SUM(CASE WHEN c.cartao LIKE '%Amarelo%' THEN 1 ELSE 0 END) as total_amarelos
            FROM partidas p
            JOIN cartoes c ON p.id_partida = c.id_partida
            WHERE p.arbitro IS NOT NULL AND p.arbitro != '' AND p.arbitro != 'Não informado'
            GROUP BY p.arbitro
        )
        SELECT 
            sp.arbitro,
            sp.total_jogos,
            ROUND(sp.vit_mandante * 100.0 / sp.total_jogos, 1) as pct_vit_mandante,
            ROUND(sp.vit_visitante * 100.0 / sp.total_jogos, 1) as pct_vit_visitante,
            ROUND(sp.empates * 100.0 / sp.total_jogos, 1) as pct_empate,
            sc.total_cartoes,
            ROUND(sc.total_cartoes * 1.0 / sp.total_jogos, 2) as media_cartoes,
            sc.total_vermelhos,
            ROUND(sc.total_vermelhos * 1.0 / sp.total_jogos, 2) as media_vermelhos
        FROM stats_partidas sp
        JOIN stats_cartoes sc ON sp.arbitro = sc.arbitro
        WHERE sp.total_jogos >= 15
        ORDER BY sp.total_jogos DESC
        LIMIT 15;
    """)
    raw_arbitros = [dict(row) for row in c.fetchall()]
    conn.close()

    total_jogos_all = sum(a["total_jogos"] for a in raw_arbitros)
    total_cartoes_all = sum(a["total_cartoes"] for a in raw_arbitros)
    total_vermelhos_all = sum(a["total_vermelhos"] for a in raw_arbitros)

    arbitros = []
    for a in raw_arbitros:
        jogos = a["total_jogos"]
        total_vermelhos = a["total_vermelhos"]
        total_amarelos = max(0, a["total_cartoes"] - total_vermelhos)
        media_amarelos = round(total_amarelos / max(1, jogos), 2)
        media_cartoes = a["media_cartoes"]
        perfil = "Disciplinador / Rigoroso" if media_cartoes >= 5.2 else ("Moderado" if media_cartoes >= 4.5 else "Tolerante")
        
        arbitros.append({
            "arbitro": a["arbitro"],
            "jogos": jogos,
            "total_jogos": jogos,
            "total_amarelos": total_amarelos,
            "media_amarelos": media_amarelos,
            "total_vermelhos": total_vermelhos,
            "media_vermelhos": a["media_vermelhos"],
            "media_cartoes": media_cartoes,
            "pct_mandante": a["pct_vit_mandante"],
            "pct_vit_mandante": a["pct_vit_mandante"],
            "pct_empate": a["pct_empate"],
            "pct_visitante": a["pct_vit_visitante"],
            "pct_vit_visitante": a["pct_vit_visitante"],
            "perfil": perfil
        })

    resultado = {
        "total_arbitros_analisados": len(arbitros),
        "media_nacional_amarelos": round((total_cartoes_all - total_vermelhos_all) / max(1, total_jogos_all), 2) if total_jogos_all else 0,
        "media_nacional_vermelhos": round(total_vermelhos_all / max(1, total_jogos_all), 2) if total_jogos_all else 0,
        "arbitros": arbitros
    }

    api_cache.set("api_arbitragem", resultado, ttl=3600)
    return jsonify(resultado)

@app.route('/api/arbitros/destaques', methods=['GET'])
def get_arbitros_destaques():
    cached = api_cache.get("api_arbitros_destaques")
    if cached:
        return jsonify(cached)

    conn = get_db()
    c = conn.cursor()

    # Top árbitros por volume de jogos apitados e cruzamento de cartões
    c.execute("""
        WITH stats_arbitro AS (
            SELECT 
                TRIM(p.arbitro) as arbitro,
                COUNT(DISTINCT p.id_partida) as total_jogos,
                MIN(p.ano) as ano_min,
                MAX(p.ano) as ano_max,
                ROUND(AVG(p.gols_mandante + p.gols_visitante), 2) as media_gols,
                ROUND(SUM(CASE WHEN p.vencedor = p.mandante THEN 1.0 ELSE 0 END) * 100.0 / COUNT(*), 1) as pct_vit_mandante,
                ROUND(SUM(CASE WHEN p.vencedor = 'Empate' THEN 1.0 ELSE 0 END) * 100.0 / COUNT(*), 1) as pct_empates,
                ROUND(SUM(CASE WHEN p.vencedor = p.visitante THEN 1.0 ELSE 0 END) * 100.0 / COUNT(*), 1) as pct_vit_visitante
            FROM partidas p
            WHERE p.arbitro IS NOT NULL 
              AND LENGTH(TRIM(p.arbitro)) > 3
              AND LOWER(p.arbitro) NOT IN ('não informado', 'nao informado', 'desconhecido', '-')
              AND LOWER(p.arbitro) NOT LIKE '%informado%'
              AND LOWER(p.arbitro) NOT LIKE '%rbitro%'
            GROUP BY TRIM(p.arbitro)
            HAVING total_jogos >= 20
        ),
        cartoes_por_arbitro AS (
            SELECT 
                TRIM(p.arbitro) as arbitro,
                COUNT(DISTINCT p.id_partida) as jogos_com_scout_cartoes,
                SUM(CASE WHEN cr.cartao LIKE '%Amarelo%' THEN 1 ELSE 0 END) as amarelos,
                SUM(CASE WHEN cr.cartao LIKE '%Vermelho%' THEN 1 ELSE 0 END) as vermelhos
            FROM partidas p
            JOIN cartoes cr ON p.id_partida = cr.id_partida
            WHERE p.arbitro IS NOT NULL
            GROUP BY TRIM(p.arbitro)
        )
        SELECT 
            s.*,
            COALESCE(ca.jogos_com_scout_cartoes, 0) as jogos_cartoes,
            COALESCE(ca.amarelos, 0) as total_amarelos,
            COALESCE(ca.vermelhos, 0) as total_vermelhos,
            CASE 
                WHEN COALESCE(ca.jogos_com_scout_cartoes, 0) >= 5 
                THEN ROUND(ca.amarelos * 1.0 / ca.jogos_com_scout_cartoes, 2) 
                ELSE 0 
            END as media_amarelos,
            CASE 
                WHEN COALESCE(ca.jogos_com_scout_cartoes, 0) >= 5 
                THEN ROUND(ca.vermelhos * 1.0 / ca.jogos_com_scout_cartoes, 2) 
                ELSE 0 
            END as media_vermelhos
        FROM stats_arbitro s
        LEFT JOIN cartoes_por_arbitro ca ON s.arbitro = ca.arbitro
        ORDER BY s.total_jogos DESC
        LIMIT 30;
    """)
    arbitros = [dict(r) for r in c.fetchall()]
    conn.close()

    api_cache.set("api_arbitros_destaques", arbitros, ttl=3600)
    return jsonify(arbitros)


@app.route('/api/arbitros/perfil', methods=['GET'])
def get_arbitro_perfil():
    nome = request.args.get('nome', '').strip()
    clube = request.args.get('clube', '').strip()
    if not nome:
        return jsonify({"error": "Informe o nome do árbitro"}), 400

    cache_key = f"arbitro_{nome.lower()}_{clube.lower()}"
    cached = api_cache.get(cache_key)
    if cached:
        return jsonify(cached)

    conn = get_db()
    c = conn.cursor()

    params = [f"%{nome}%"]
    filtro_clube_sql = ""
    if clube:
        filtro_clube_sql = " AND (p.mandante LIKE ? OR p.visitante LIKE ?)"
        params.extend([f"%{clube}%", f"%{clube}%"])

    # Resumo geral do árbitro (ou específico para o clube filtrado)
    c.execute(f"""
        SELECT 
            COUNT(*) as total_jogos,
            MIN(p.ano) as ano_min,
            MAX(p.ano) as ano_max,
            ROUND(AVG(p.gols_mandante + p.gols_visitante), 2) as media_gols,
            SUM(CASE WHEN p.vencedor = p.mandante THEN 1 ELSE 0 END) as vit_mandante,
            SUM(CASE WHEN p.vencedor = 'Empate' THEN 1 ELSE 0 END) as empates,
            SUM(CASE WHEN p.vencedor = p.visitante THEN 1 ELSE 0 END) as vit_visitante
        FROM partidas p
        WHERE p.arbitro LIKE ? {filtro_clube_sql};
    """, params)
    resumo_row = dict(c.fetchone() or {})

    # Cartões aplicados pelo árbitro nos jogos filtrados
    c.execute(f"""
        SELECT 
            COUNT(DISTINCT p.id_partida) as jogos_com_cartoes,
            SUM(CASE WHEN cr.cartao LIKE '%Amarelo%' THEN 1 ELSE 0 END) as amarelos,
            SUM(CASE WHEN cr.cartao LIKE '%Vermelho%' THEN 1 ELSE 0 END) as vermelhos
        FROM partidas p
        JOIN cartoes cr ON p.id_partida = cr.id_partida
        WHERE p.arbitro LIKE ? {filtro_clube_sql};
    """, params)
    cartoes_row = dict(c.fetchone() or {})

    # Desempenho dos clubes mais apitados por este árbitro
    c.execute("""
        WITH jogos_clube AS (
            SELECT mandante as clube, vencedor FROM partidas WHERE arbitro LIKE ?
            UNION ALL
            SELECT visitante as clube, vencedor FROM partidas WHERE arbitro LIKE ?
        )
        SELECT 
            clube,
            COUNT(*) as jogos,
            SUM(CASE WHEN vencedor = clube THEN 1 ELSE 0 END) as vitorias,
            SUM(CASE WHEN vencedor = 'Empate' THEN 1 ELSE 0 END) as empates,
            SUM(CASE WHEN vencedor != clube AND vencedor != 'Empate' THEN 1 ELSE 0 END) as derrotas,
            ROUND(SUM(CASE WHEN vencedor = clube THEN 3.0 WHEN vencedor = 'Empate' THEN 1.0 ELSE 0 END) * 100.0 / (COUNT(*) * 3.0), 1) as aproveitamento_pct
        FROM jogos_clube
        GROUP BY clube
        ORDER BY jogos DESC
        LIMIT 12;
    """, (f"%{nome}%", f"%{nome}%"))
    clubes_apitados = [dict(r) for r in c.fetchall()]

    # Últimas 25 partidas apitadas
    c.execute(f"""
        SELECT p.id_partida, p.data, p.campeonato, p.mandante, p.visitante, p.placar, p.estadio, p.arbitro
        FROM partidas p
        WHERE p.arbitro LIKE ? {filtro_clube_sql}
        ORDER BY p.data DESC, p.id_partida DESC
        LIMIT 25;
    """, params)
    partidas = [dict(r) for r in c.fetchall()]

    conn.close()

    total_j = resumo_row.get("total_jogos") or 0
    jc = cartoes_row.get("jogos_com_cartoes") or 0
    am = cartoes_row.get("amarelos") or 0
    vm = cartoes_row.get("vermelhos") or 0

    dados = {
        "arbitro": nome,
        "clube_filtro": clube,
        "resumo": {
            "total_jogos": total_j,
            "ano_min": resumo_row.get("ano_min"),
            "ano_max": resumo_row.get("ano_max"),
            "media_gols": resumo_row.get("media_gols") or 0,
            "vit_mandante": resumo_row.get("vit_mandante") or 0,
            "empates": resumo_row.get("empates") or 0,
            "vit_visitante": resumo_row.get("vit_visitante") or 0,
            "pct_mandante": round((resumo_row.get("vit_mandante") or 0) * 100.0 / total_j, 1) if total_j > 0 else 0,
            "amarelos": am,
            "vermelhos": vm,
            "media_amarelos": round(am / jc, 2) if jc > 0 else 0,
            "media_vermelhos": round(vm / jc, 2) if jc > 0 else 0,
        },
        "clubes_apitados": clubes_apitados,
        "partidas": partidas
    }

    api_cache.set(cache_key, dados, ttl=1800)
    return jsonify(dados)

@app.route('/api/brasileirao/aovivo', methods=['GET'])
def get_brasileirao_aovivo():
    """Retorna classificação e rodada atual em tempo real das Séries A, B, C ou D."""
    serie = request.args.get('serie', 'a').lower().strip()
    if serie not in ('a', 'b', 'c', 'd'):
        serie = 'a'

    cache_key = f"brasileirao_aovivo_{serie}"
    cached = api_cache.get(cache_key)
    if cached:
        return jsonify(cached)

    import urllib.request
    import re
    import json
    import ssl

    url = f"https://ge.globo.com/futebol/brasileirao-serie-{serie}/"
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    }

    try:
        ctx = ssl.create_default_context()
        ctx.check_hostname = False
        ctx.verify_mode = ssl.CERT_NONE

        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req, context=ctx, timeout=8) as resp:
            html = resp.read().decode('utf-8', errors='ignore')

        match = re.search(r'const\s+classificacao\s*=\s*(\{.+?\});', html)
        if not match:
            return jsonify({
                "serie": serie.upper(),
                "edicao": f"Brasileirão Série {serie.upper()}",
                "rodada_atual": 1,
                "total_rodadas": 38,
                "tabela": [],
                "jogos_rodada": [],
                "aviso": "Tabela ou rodada ainda não iniciada para esta série."
            }), 200

        raw_data = json.loads(match.group(1))

        # 1. Normalizar Tabela de Classificação
        tabela = []
        for item in (raw_data.get('classificacao') or []):
            if not isinstance(item, dict):
                continue
            tabela.append({
                "posicao": item.get('ordem'),
                "clube": item.get('nome_popular'),
                "sigla": item.get('sigla'),
                "escudo": item.get('escudo'),
                "pontos": item.get('pontos'),
                "jogos": item.get('jogos'),
                "vitorias": item.get('vitorias'),
                "empates": item.get('empates'),
                "derrotas": item.get('derrotas'),
                "gols_pro": item.get('gols_pro'),
                "gols_contra": item.get('gols_contra'),
                "saldo_gols": item.get('saldo_gols'),
                "aproveitamento": item.get('aproveitamento'),
                "variacao": item.get('variacao'),
                "ultimos_jogos": item.get('ultimos_jogos') or [],
                "faixa_cor": item.get('faixa_classificacao_cor')
            })

        # 2. Normalizar Rodada Atual e Próximos Jogos
        rodada_raw = raw_data.get('rodada')
        rodada_meta = rodada_raw if isinstance(rodada_raw, dict) else {}
        edicao_raw = raw_data.get('edicao')
        edicao_meta = edicao_raw if isinstance(edicao_raw, dict) else {}

        jogos_rodada = []
        for j in (raw_data.get('lista_jogos') or []):
            if not isinstance(j, dict):
                continue
            equipes = j.get('equipes') if isinstance(j.get('equipes'), dict) else {}
            mand = equipes.get('mandante') if isinstance(equipes.get('mandante'), dict) else {}
            vis = equipes.get('visitante') if isinstance(equipes.get('visitante'), dict) else {}
            transmissao = j.get('transmissao') if isinstance(j.get('transmissao'), dict) else {}
            broadcast = transmissao.get('broadcast') if isinstance(transmissao.get('broadcast'), dict) else {}
            sede = j.get('sede') if isinstance(j.get('sede'), dict) else {}

            jogos_rodada.append({
                "id": j.get('id'),
                "data": (j.get('data_realizacao') or '').split('T')[0],
                "hora": j.get('hora_realizacao') or '00:00',
                "comecou": j.get('jogo_ja_comecou', False),
                "status": broadcast.get('id', 'SCHEDULED'),
                "status_label": broadcast.get('label') or transmissao.get('label') or '',
                "estadio": sede.get('nome_popular') or '',
                "mandante": {
                    "nome": mand.get('nome_popular') or 'A definir',
                    "sigla": mand.get('sigla') or '???',
                    "escudo": mand.get('escudo') or '',
                    "placar": j.get('placar_oficial_mandante')
                },
                "visitante": {
                    "nome": vis.get('nome_popular') or 'A definir',
                    "sigla": vis.get('sigla') or '???',
                    "escudo": vis.get('escudo') or '',
                    "placar": j.get('placar_oficial_visitante')
                }
            })

        resultado = {
            "serie": serie.upper(),
            "edicao": edicao_meta.get('nome') or f"Brasileirão Série {serie.upper()}",
            "rodada_atual": rodada_meta.get('atual') or rodada_meta.get('numero') or 1,
            "total_rodadas": rodada_meta.get('ultima') or rodada_meta.get('total') or 38,
            "tabela": tabela,
            "jogos_rodada": jogos_rodada
        }

        # Cache de 10 minutos (600s) para garantir dados frescos e proteger contra rate limit do GE
        api_cache.set(cache_key, resultado, ttl=600)
        return jsonify(resultado)

    except Exception as e:
        return jsonify({
            "serie": serie.upper(),
            "edicao": f"Brasileirão Série {serie.upper()}",
            "rodada_atual": 1,
            "total_rodadas": 38,
            "tabela": [],
            "jogos_rodada": [],
            "error": f"Dados em tempo real temporariamente indisponíveis: {str(e)}"
        }), 200

@app.route('/api/odds/zebras', methods=['GET'])
def get_maiores_zebras():
    """Retorna os maiores upsets (zebras históricas) do Brasileirão com base nas odds de apostas."""
    cached = api_cache.get("api_odds_zebras")
    if cached:
        return jsonify(cached)

    conn = get_db()
    c = conn.cursor()
    c.execute("""
        SELECT 
            p.id_partida, p.ano, p.data, p.mandante, p.visitante, p.placar, p.vencedor, p.estadio,
            o.odd_mandante, o.odd_empate, o.odd_visitante,
            o.prob_mandante, o.prob_empate, o.prob_visitante,
            o.status_zebra,
            CASE 
                WHEN p.vencedor = p.visitante THEN o.odd_visitante 
                WHEN p.vencedor = p.mandante THEN o.odd_mandante 
                ELSE o.odd_empate 
            END as odd_vencedor
        FROM partidas p
        JOIN odds_partidas o ON p.id_partida = o.id_partida
        WHERE o.status_zebra LIKE '%Zebra%'
        ORDER BY odd_vencedor DESC
        LIMIT 25;
    """)
    zebras = [dict(r) for r in c.fetchall()]
    conn.close()

    api_cache.set("api_odds_zebras", zebras, ttl=3600)
    return jsonify(zebras)


@app.route('/api/odds/analise-mercados', methods=['GET'])
@require_auth
def get_analise_mercados_odds():
    """
    Retorna painel analítico de probabilidades e odds de mercados esportivos:
    Over/Under 1.5 e 2.5, Ambas Marcam (BTTS), Handicap Asiático e Médias de Cartões/Árbitro.
    """
    campeonato = request.args.get('campeonato', '').strip()
    ano = request.args.get('ano', type=int)
    filtro_mercado = request.args.get('mercado', 'todos').strip()
    limit = min(request.args.get('limit', 40, type=int), 100)

    conn = get_db()
    c = conn.cursor()

    where_clauses = ["o.odd_over_2_5 IS NOT NULL"]
    params = []

    if ano:
        where_clauses.append("p.ano = ?")
        params.append(ano)
    else:
        where_clauses.append("p.ano >= 2024")

    if campeonato:
        where_clauses.append("p.campeonato LIKE ?")
        params.append(f"%{campeonato}%")

    if filtro_mercado == 'over_2_5':
        where_clauses.append("o.prob_over_2_5 >= 0.55")
        order_by = "o.prob_over_2_5 DESC"
    elif filtro_mercado == 'btts':
        where_clauses.append("o.prob_btts_sim >= 0.52")
        order_by = "o.prob_btts_sim DESC"
    elif filtro_mercado == 'zebras':
        where_clauses.append("o.status_zebra LIKE '%Zebra%'")
        order_by = "p.data DESC"
    else:
        order_by = "p.data DESC, p.id_partida DESC"

    where_sql = " AND ".join(where_clauses)
    sql = f"""
        SELECT 
            p.id_partida, p.ano, p.data, p.campeonato, p.mandante, p.visitante,
            p.placar, p.vencedor, p.estadio, p.arbitro,
            o.odd_mandante, o.odd_empate, o.odd_visitante,
            o.odd_over_2_5, o.odd_under_2_5, o.odd_over_1_5, o.odd_under_1_5,
            o.odd_btts_sim, o.odd_btts_nao,
            o.prob_over_2_5, o.prob_btts_sim,
            o.linha_handicap, o.odd_handicap_mandante, o.odd_handicap_visitante,
            o.media_cartoes_esperada, o.status_zebra
        FROM partidas p
        JOIN odds_partidas o ON p.id_partida = o.id_partida
        WHERE {where_sql}
        ORDER BY {order_by}
        LIMIT ?;
    """
    params.append(limit)
    rows = [dict(r) for r in c.execute(sql, params).fetchall()]
    try:
        total_catalogo = c.execute("SELECT count(*) FROM odds_partidas;").fetchone()[0]
    except Exception:
        total_catalogo = len(rows)
    conn.close()

    return jsonify({
        "total": len(rows),
        "filtro_mercado": filtro_mercado,
        "partidas": rows
    })

# ==============================================================================
# MÓDULO AVANÇADO DE APOSTAS & ODDS (PROBABILIDADES, POISSON, +EV, RAIO-X & JOGADORES)
# ==============================================================================

def _calc_poisson_bivariate(lambda_h, lambda_a, max_goals=6, rho=-0.12):
    """Calcula probabilidades 1X2, Over/Under e BTTS com calibração Dixon-Coles (1997).
    Ajusta correlação de placares baixos (0-0, 1-0, 0-1, 1-1) para o padrão do futebol brasileiro.
    """
    lh = max(0.25, min(lambda_h, 4.5))
    la = max(0.25, min(lambda_a, 4.5))

    def _tau(x, y):
        if x == 0 and y == 0:
            return max(0.0, 1.0 - lh * la * rho)
        elif x == 0 and y == 1:
            return max(0.0, 1.0 + lh * rho)
        elif x == 1 and y == 0:
            return max(0.0, 1.0 + la * rho)
        elif x == 1 and y == 1:
            return max(0.0, 1.0 - rho)
        return 1.0

    matrix = [[0.0]*(max_goals+1) for _ in range(max_goals+1)]
    for i in range(max_goals+1):
        p_i = (math.exp(-lh) * (lh**i)) / math.factorial(i)
        for j in range(max_goals+1):
            p_j = (math.exp(-la) * (la**j)) / math.factorial(j)
            matrix[i][j] = p_i * p_j * _tau(i, j)

    tot = sum(sum(r) for r in matrix)
    if tot > 0:
        for i in range(max_goals+1):
            for j in range(max_goals+1):
                matrix[i][j] /= tot

    p_home = sum(matrix[i][j] for i in range(max_goals+1) for j in range(max_goals+1) if i > j)
    p_draw = sum(matrix[i][j] for i in range(max_goals+1) for j in range(max_goals+1) if i == j)
    p_away = sum(matrix[i][j] for i in range(max_goals+1) for j in range(max_goals+1) if i < j)
    total_1x2 = p_home + p_draw + p_away
    if total_1x2 > 0:
        p_home /= total_1x2
        p_draw /= total_1x2
        p_away /= total_1x2

    p_over15 = sum(matrix[i][j] for i in range(max_goals+1) for j in range(max_goals+1) if i + j > 1)
    p_over25 = sum(matrix[i][j] for i in range(max_goals+1) for j in range(max_goals+1) if i + j > 2)
    p_over35 = sum(matrix[i][j] for i in range(max_goals+1) for j in range(max_goals+1) if i + j > 3)
    p_btts = sum(matrix[i][j] for i in range(1, max_goals+1) for j in range(1, max_goals+1))

    scores = []
    for i in range(4):
        for j in range(4):
            scores.append({'placar': f"{i}x{j}", 'prob': round(matrix[i][j] * 100, 1)})
    scores.sort(key=lambda x: x['prob'], reverse=True)

    return {
        'prob_mandante': round(p_home * 100, 1),
        'prob_empate': round(p_draw * 100, 1),
        'prob_visitante': round(p_away * 100, 1),
        'prob_over_1_5': round(p_over15 * 100, 1),
        'prob_under_1_5': round((1.0 - p_over15) * 100, 1),
        'prob_over_2_5': round(p_over25 * 100, 1),
        'prob_under_2_5': round((1.0 - p_over25) * 100, 1),
        'prob_over_3_5': round(p_over35 * 100, 1),
        'prob_btts_sim': round(p_btts * 100, 1),
        'prob_btts_nao': round((1.0 - p_btts) * 100, 1),
        'fair_odd_mandante': round(1.0 / p_home, 2) if p_home > 0.01 else 99.0,
        'fair_odd_empate': round(1.0 / p_draw, 2) if p_draw > 0.01 else 99.0,
        'fair_odd_visitante': round(1.0 / p_away, 2) if p_away > 0.01 else 99.0,
        'fair_odd_over_1_5': round(1.0 / p_over15, 2) if p_over15 > 0.01 else 99.0,
        'fair_odd_over_2_5': round(1.0 / p_over25, 2) if p_over25 > 0.01 else 99.0,
        'fair_odd_btts_sim': round(1.0 / p_btts, 2) if p_btts > 0.01 else 99.0,
        'top_placares': scores[:5]
    }

def _obter_medias_times_db(conn):
    """Calcula médias empíricas de gols marcados/sofridos por time em casa e fora desde 2024."""
    cached = api_cache.get("medias_times_apostas")
    if cached:
        return cached

    c = conn.cursor()
    c.execute("""
        SELECT 
            mandante as time_nome,
            'casa' as local,
            COUNT(*) as jogos,
            AVG(gols_mandante) as media_gp,
            AVG(gols_visitante) as media_gc,
            AVG(CASE WHEN (gols_mandante + gols_visitante) > 2 THEN 1.0 ELSE 0.0 END) as pct_over_2_5,
            AVG(CASE WHEN gols_mandante > 0 AND gols_visitante > 0 THEN 1.0 ELSE 0.0 END) as pct_btts
        FROM partidas
        WHERE ano >= 2024 AND gols_mandante IS NOT NULL
        GROUP BY mandante
        UNION ALL
        SELECT 
            visitante as time_nome,
            'fora' as local,
            COUNT(*) as jogos,
            AVG(gols_visitante) as media_gp,
            AVG(gols_mandante) as media_gc,
            AVG(CASE WHEN (gols_mandante + gols_visitante) > 2 THEN 1.0 ELSE 0.0 END) as pct_over_2_5,
            AVG(CASE WHEN gols_mandante > 0 AND gols_visitante > 0 THEN 1.0 ELSE 0.0 END) as pct_btts
        FROM partidas
        WHERE ano >= 2024 AND gols_mandante IS NOT NULL
        GROUP BY visitante
    """)
    stats = {}
    for r in c.fetchall():
        stats[(r[0], r[1])] = {
            'jogos': r[2],
            'gp': float(r[3] or 1.35),
            'gc': float(r[4] or 1.20),
            'over25': float(r[5] or 0.45),
            'btts': float(r[6] or 0.48)
        }

    api_cache.set("medias_times_apostas", stats, ttl=3600)
    return stats


@app.route('/api/apostas/hub', methods=['GET'])
def get_apostas_hub():
    """
    Retorna jogos da rodada e do dia com probabilidades matemáticas completas (Poisson),
    Odds Justas vs Odds de Mercado, cálculo de Valor Esperado (+EV) e tendências analíticas em tempo real.
    """
    campeonato = request.args.get('campeonato', '').strip()
    ano_param = request.args.get('ano', '').strip()
    rodada = request.args.get('rodada', type=int)
    filtro_mercado = request.args.get('mercado', 'todos').strip()
    data_filtro = request.args.get('data', '').strip()
    limit = min(request.args.get('limit', 100, type=int), 300)
    offset = max(0, request.args.get('offset', 0, type=int))

    cache_key = f"apostas_hub_{campeonato}_{ano_param}_{rodada}_{filtro_mercado}_{data_filtro}_{limit}_{offset}"
    cached = api_cache.get(cache_key)
    if cached:
        return jsonify(cached)

    conn = get_db()
    c = conn.cursor()
    team_stats = _obter_medias_times_db(conn)

    where_clauses = ["o.odd_mandante IS NOT NULL"]
    params = []

    if ano_param and ano_param.isdigit():
        where_clauses.append("p.ano = ?")
        params.append(int(ano_param))
    elif ano_param in ('todos', 'historico'):
        pass
    else:
        where_clauses.append("p.ano >= 2025")

    if campeonato:
        where_clauses.append("p.campeonato LIKE ?")
        params.append(f"%{campeonato}%")

    if rodada:
        where_clauses.append("p.rodada = ?")
        params.append(rodada)

    if data_filtro:
        where_clauses.append("p.data = ?")
        params.append(data_filtro)

    where_sql = " AND ".join(where_clauses)

    # 1. Totais Globais para Métricas Reais do Banco
    try:
        total_banco_odds = c.execute("SELECT COUNT(*) FROM odds_partidas WHERE odd_mandante IS NOT NULL").fetchone()[0]
    except Exception:
        total_banco_odds = 9252

    try:
        total_temporada = c.execute("""
            SELECT COUNT(*) 
            FROM partidas p 
            JOIN odds_partidas o ON p.id_partida = o.id_partida 
            WHERE o.odd_mandante IS NOT NULL AND p.ano >= 2025
        """).fetchone()[0]
    except Exception:
        total_temporada = 2362

    # 2. Contagem do Total de Jogos Filtrados (sem LIMIT)
    count_sql = f"""
        SELECT COUNT(*)
        FROM partidas p
        JOIN odds_partidas o ON p.id_partida = o.id_partida
        WHERE {where_sql};
    """
    total_filtrado = c.execute(count_sql, list(params)).fetchone()[0]

    # 3. Consulta Paginada
    sql = f"""
        SELECT 
            p.id_partida, p.ano, p.data, p.horario, p.campeonato, p.rodada,
            p.mandante, p.visitante, p.placar, p.vencedor, p.estadio, p.cidade, p.arbitro,
            p.gols_mandante, p.gols_visitante,
            o.odd_mandante, o.odd_empate, o.odd_visitante,
            o.odd_over_2_5, o.odd_under_2_5, o.odd_over_1_5, o.odd_under_1_5,
            o.odd_btts_sim, o.odd_btts_nao,
            o.prob_over_2_5, o.prob_btts_sim,
            o.prob_mandante, o.prob_empate, o.prob_visitante,
            o.linha_handicap, o.odd_handicap_mandante, o.odd_handicap_visitante,
            o.media_cartoes_esperada, o.media_escanteios_esperada, o.status_zebra,
            o.prob_over_9_5_corners, o.prob_over_10_5_corners,
            o.arbitro_rigor, o.arbitro_media_cartoes
        FROM partidas p
        JOIN odds_partidas o ON p.id_partida = o.id_partida
        WHERE {where_sql}
        ORDER BY p.data DESC, p.id_partida DESC
        LIMIT ? OFFSET ?;
    """
    query_params = list(params) + [limit, offset]
    rows = [dict(r) for r in c.execute(sql, query_params).fetchall()]
    conn.close()

    partidas_processadas = []
    destaques_ev = []
    tendencias_quentes = []

    for r in rows:
        m_casa = team_stats.get((r['mandante'], 'casa'), {'gp': 1.45, 'gc': 1.10, 'over25': 0.48, 'btts': 0.50})
        m_fora = team_stats.get((r['visitante'], 'fora'), {'gp': 1.05, 'gc': 1.40, 'over25': 0.46, 'btts': 0.48})

        lambda_h = max(0.40, (m_casa['gp'] + m_fora['gc']) / 2.0)
        lambda_a = max(0.35, (m_fora['gp'] + m_casa['gc']) / 2.0)

        calc = _calc_poisson_bivariate(lambda_h, lambda_a)

        ev_mandante = round(((calc['prob_mandante'] / 100.0) * (r['odd_mandante'] or 0) - 1.0) * 100, 1) if r['odd_mandante'] else None
        ev_empate = round(((calc['prob_empate'] / 100.0) * (r['odd_empate'] or 0) - 1.0) * 100, 1) if r['odd_empate'] else None
        ev_visitante = round(((calc['prob_visitante'] / 100.0) * (r['odd_visitante'] or 0) - 1.0) * 100, 1) if r['odd_visitante'] else None
        ev_over_2_5 = round(((calc['prob_over_2_5'] / 100.0) * (r['odd_over_2_5'] or 0) - 1.0) * 100, 1) if r['odd_over_2_5'] else None
        ev_under_2_5 = round(((calc['prob_under_2_5'] / 100.0) * (r['odd_under_2_5'] or 0) - 1.0) * 100, 1) if r['odd_under_2_5'] else None
        ev_btts_sim = round(((calc['prob_btts_sim'] / 100.0) * (r['odd_btts_sim'] or 0) - 1.0) * 100, 1) if r['odd_btts_sim'] else None

        candidatos_ev = [
            {'mercado': f"Vitória {r['mandante']}", 'tipo': '1X2 Mandante', 'odd': r['odd_mandante'], 'fair_odd': calc['fair_odd_mandante'], 'ev': ev_mandante, 'prob': calc['prob_mandante']},
            {'mercado': "Empate", 'tipo': '1X2 Empate', 'odd': r['odd_empate'], 'fair_odd': calc['fair_odd_empate'], 'ev': ev_empate, 'prob': calc['prob_empate']},
            {'mercado': f"Vitória {r['visitante']}", 'tipo': '1X2 Visitante', 'odd': r['odd_visitante'], 'fair_odd': calc['fair_odd_visitante'], 'ev': ev_visitante, 'prob': calc['prob_visitante']},
            {'mercado': "Over 2.5 Gols", 'tipo': 'Gols Over 2.5', 'odd': r['odd_over_2_5'], 'fair_odd': calc['fair_odd_over_2_5'], 'ev': ev_over_2_5, 'prob': calc['prob_over_2_5']},
            {'mercado': "Ambas Marcam (Sim)", 'tipo': 'BTTS Sim', 'odd': r['odd_btts_sim'], 'fair_odd': calc['fair_odd_btts_sim'], 'ev': ev_btts_sim, 'prob': calc['prob_btts_sim']},
        ]
        candidatos_validos = [c for c in candidatos_ev if c['ev'] is not None and c['odd'] and c['odd'] > 1.05]
        melhor_aposta = max(candidatos_validos, key=lambda x: x['ev']) if candidatos_validos else None

        tendencias_jogo = []
        if m_casa['gp'] >= 1.70:
            tendencias_jogo.append(f"{r['mandante']} com ataque forte: média de {m_casa['gp']:.1f} gols em casa")
        if calc['prob_over_2_5'] >= 54.0:
            tendencias_jogo.append(f"Alta probabilidade de Over 2.5 ({calc['prob_over_2_5']}%)")
        if calc['prob_btts_sim'] >= 53.0:
            tendencias_jogo.append(f"Tendência de Ambas Marcam Sim ({calc['prob_btts_sim']}%)")
        if melhor_aposta and melhor_aposta['ev'] >= 4.0:
            tendencias_jogo.append(f"Valor Detectado (+EV +{melhor_aposta['ev']}%): {melhor_aposta['mercado']} a {melhor_aposta['odd']}")
        if r.get('status_zebra') and 'Zebra' in str(r.get('status_zebra')):
            tendencias_jogo.append(f"Alerta de Zebra Potencial ({r['status_zebra']})")

        partida_obj = {
            **r,
            'xg_mandante_estimado': round(lambda_h, 2),
            'xg_visitante_estimado': round(lambda_a, 2),
            'probabilidades': calc,
            'ev': {
                'mandante': ev_mandante,
                'empate': ev_empate,
                'visitante': ev_visitante,
                'over_2_5': ev_over_2_5,
                'under_2_5': ev_under_2_5,
                'btts_sim': ev_btts_sim
            },
            'has_ev': bool(melhor_aposta and melhor_aposta['ev'] > 0),
            'melhor_aposta': melhor_aposta if melhor_aposta and melhor_aposta['ev'] > 0 else None,
            'tendencias': tendencias_jogo
        }

        # Filtro de mercado opcional
        if filtro_mercado == 'over_2_5' and calc['prob_over_2_5'] < 50.0 and (not ev_over_2_5 or ev_over_2_5 <= 0):
            continue
        if filtro_mercado == 'btts' and calc['prob_btts_sim'] < 50.0 and (not ev_btts_sim or ev_btts_sim <= 0):
            continue
        if filtro_mercado == 'ev_plus' and not partida_obj['has_ev']:
            continue
        if filtro_mercado == 'zebras' and 'Zebra' not in str(r.get('status_zebra', '')):
            continue

        partidas_processadas.append(partida_obj)

        if melhor_aposta and melhor_aposta['ev'] >= 5.0:
            destaques_ev.append({
                'id_partida': r['id_partida'],
                'confronto': f"{r['mandante']} x {r['visitante']}",
                'campeonato': r['campeonato'],
                'data': r['data'],
                'mercado': melhor_aposta['mercado'],
                'odd_mercado': melhor_aposta['odd'],
                'odd_justa': melhor_aposta['fair_odd'],
                'probabilidade': melhor_aposta['prob'],
                'ev': melhor_aposta['ev'],
                'tipo': melhor_aposta['tipo']
            })

    destaques_ev.sort(key=lambda x: x['ev'], reverse=True)

    # Tendências Quentes Globais Curadas
    for p in partidas_processadas[:12]:
        for t in p['tendencias'][:2]:
            if t not in tendencias_quentes:
                tendencias_quentes.append(t)

    resumo = {
        'total_jogos': total_filtrado,
        'total_banco_odds': total_banco_odds,
        'total_temporada': total_temporada,
        'total_filtrado': total_filtrado,
        'partidas_exibidas': len(partidas_processadas),
        'offset': offset,
        'limit': limit,
        'total_com_ev': sum(1 for p in partidas_processadas if p['has_ev']),
        'total_over_2_5_favoravel': sum(1 for p in partidas_processadas if p['probabilidades']['prob_over_2_5'] >= 52.0),
        'total_btts_favoravel': sum(1 for p in partidas_processadas if p['probabilidades']['prob_btts_sim'] >= 52.0),
        'filtro_mercado': filtro_mercado,
        'destaques_ev': destaques_ev[:6],
        'tendencias_quentes': tendencias_quentes[:8],
        'partidas': partidas_processadas
    }

    api_cache.set(cache_key, resumo, ttl=900)
    return jsonify(resumo)


@app.route('/api/apostas/analise', methods=['GET'])
@app.route('/api/apostas/analise_jogo', methods=['GET'])
def get_apostas_analise_jogo():
    """
    Raio-X aprofundado do confronto para apostas:
    Médias de gols (1º vs 2º tempo), minutagem típica, cartões e perfil do árbitro,
    retrospecto recente de 5 e 10 jogos e matriz matemática de probabilidades.
    """
    id_partida = request.args.get('id_partida', type=int)
    mandante = request.args.get('mandante', '').strip()
    visitante = request.args.get('visitante', '').strip()

    conn = get_db()
    c = conn.cursor()

    partida = None
    if id_partida:
        c.execute("""
            SELECT p.*, o.odd_mandante, o.odd_empate, o.odd_visitante,
                   o.odd_over_2_5, o.odd_under_2_5, o.odd_over_1_5, o.odd_under_1_5,
                   o.odd_btts_sim, o.odd_btts_nao, o.status_zebra,
                   o.media_cartoes_esperada, o.media_escanteios_esperada
            FROM partidas p
            LEFT JOIN odds_partidas o ON p.id_partida = o.id_partida
            WHERE p.id_partida = ?
        """, (id_partida,))
        row = c.fetchone()
        if row:
            partida = dict(row)

    if not partida and mandante and visitante:
        c.execute("""
            SELECT p.*, o.odd_mandante, o.odd_empate, o.odd_visitante,
                   o.odd_over_2_5, o.odd_under_2_5, o.odd_over_1_5, o.odd_under_1_5,
                   o.odd_btts_sim, o.odd_btts_nao, o.status_zebra,
                   o.media_cartoes_esperada, o.media_escanteios_esperada
            FROM partidas p
            LEFT JOIN odds_partidas o ON p.id_partida = o.id_partida
            WHERE (p.mandante = ? AND p.visitante = ?) OR (p.mandante = ? AND p.visitante = ?)
            ORDER BY p.data DESC, p.id_partida DESC
            LIMIT 1
        """, (mandante, visitante, visitante, mandante))
        row = c.fetchone()
        if row:
            partida = dict(row)

    if not partida:
        # Fallback para a partida com odds mais recente disponível
        c.execute("""
            SELECT p.*, o.odd_mandante, o.odd_empate, o.odd_visitante,
                   o.odd_over_2_5, o.odd_under_2_5, o.odd_over_1_5, o.odd_under_1_5,
                   o.odd_btts_sim, o.odd_btts_nao, o.status_zebra,
                   o.media_cartoes_esperada, o.media_escanteios_esperada
            FROM partidas p
            JOIN odds_partidas o ON p.id_partida = o.id_partida
            ORDER BY p.ano DESC, p.data DESC, p.id_partida DESC
            LIMIT 1
        """)
        row = c.fetchone()
        if row:
            partida = dict(row)

    if not partida:
        conn.close()
        return jsonify({"error": "Partida não encontrada para análise."}), 404

    time_m = partida['mandante']
    time_v = partida['visitante']

    def extrair_forma_time(nome_time):
        c.execute("""
            SELECT id_partida, ano, data, campeonato, mandante, visitante, placar, vencedor,
                   gols_mandante, gols_visitante,
                   CASE WHEN mandante = ? THEN 'C' ELSE 'F' END as mando,
                   CASE WHEN vencedor = ? THEN 'V' WHEN vencedor = 'Empate' THEN 'E' ELSE 'D' END as resultado
            FROM partidas
            WHERE (mandante = ? OR visitante = ?) AND gols_mandante IS NOT NULL
            ORDER BY data DESC, id_partida DESC
            LIMIT 10
        """, (nome_time, nome_time, nome_time, nome_time))
        jogos = [dict(r) for r in c.fetchall()]
        
        vitorias = sum(1 for j in jogos if j['resultado'] == 'V')
        empates = sum(1 for j in jogos if j['resultado'] == 'E')
        derrotas = sum(1 for j in jogos if j['resultado'] == 'D')
        
        gols_pro = sum(j['gols_mandante'] if j['mando'] == 'C' else j['gols_visitante'] for j in jogos)
        gols_contra = sum(j['gols_visitante'] if j['mando'] == 'C' else j['gols_mandante'] for j in jogos)
        clean_sheets = sum(1 for j in jogos if (j['mando'] == 'C' and j['gols_visitante'] == 0) or (j['mando'] == 'F' and j['gols_mandante'] == 0))
        over_2_5 = sum(1 for j in jogos if (j['gols_mandante'] + j['gols_visitante']) > 2)
        btts = sum(1 for j in jogos if j['gols_mandante'] > 0 and j['gols_visitante'] > 0)
        
        total = max(len(jogos), 1)
        return {
            'jogos_recentes': jogos,
            'total_jogos': len(jogos),
            'forma_string': [j['resultado'] for j in jogos[:5]],
            'vitorias': vitorias,
            'empates': empates,
            'derrotas': derrotas,
            'gols_pro': gols_pro,
            'gols_contra': gols_contra,
            'media_gp': round(gols_pro / total, 2),
            'media_gc': round(gols_contra / total, 2),
            'clean_sheets_pct': round((clean_sheets / total) * 100, 1),
            'over_2_5_pct': round((over_2_5 / total) * 100, 1),
            'btts_pct': round((btts / total) * 100, 1)
        }

    forma_mandante = extrair_forma_time(time_m)
    forma_visitante = extrair_forma_time(time_v)

    # Retrospecto H2H direto
    c.execute("""
        SELECT id_partida, ano, data, campeonato, mandante, visitante, placar, vencedor, gols_mandante, gols_visitante
        FROM partidas
        WHERE ((mandante = ? AND visitante = ?) OR (mandante = ? AND visitante = ?))
          AND gols_mandante IS NOT NULL
        ORDER BY data DESC, id_partida DESC
        LIMIT 10
    """, (time_m, time_v, time_v, time_m))
    h2h_jogos = [dict(r) for r in c.fetchall()]
    total_h2h = max(len(h2h_jogos), 1)
    vitorias_m = sum(1 for j in h2h_jogos if j['vencedor'] == time_m)
    vitorias_v = sum(1 for j in h2h_jogos if j['vencedor'] == time_v)
    empates_h2h = sum(1 for j in h2h_jogos if j['vencedor'] == 'Empate')
    gols_totais_h2h = sum(j['gols_mandante'] + j['gols_visitante'] for j in h2h_jogos)
    over_25_h2h = sum(1 for j in h2h_jogos if (j['gols_mandante'] + j['gols_visitante']) > 2)
    btts_h2h = sum(1 for j in h2h_jogos if j['gols_mandante'] > 0 and j['gols_visitante'] > 0)

    # Análise de Minutagem e 1T vs 2T dos Clubes
    def analisar_gols_tempo(nome_clube):
        c.execute("""
            SELECT 
                CASE 
                    WHEN tempo LIKE '%1T%' THEN '1T'
                    WHEN tempo LIKE '%2T%' THEN '2T'
                    ELSE 'Indefinido'
                END as tempo_simplificado,
                COUNT(*) as total
            FROM gols
            WHERE clube = ?
            GROUP BY tempo_simplificado
        """, (nome_clube,))
        tempos = {r[0]: r[1] for r in c.fetchall()}
        total_tempos = sum(tempos.values()) or 1
        pct_1t = round((tempos.get('1T', 0) / total_tempos) * 100, 1)
        pct_2t = round((tempos.get('2T', 0) / total_tempos) * 100, 1)

        c.execute("""
            SELECT 
                CASE 
                    WHEN CAST(minuto AS INTEGER) <= 15 THEN '0-15'
                    WHEN CAST(minuto AS INTEGER) <= 30 THEN '16-30'
                    WHEN CAST(minuto AS INTEGER) <= 45 THEN '31-45'
                    WHEN CAST(minuto AS INTEGER) <= 60 THEN '46-60'
                    WHEN CAST(minuto AS INTEGER) <= 75 THEN '61-75'
                    ELSE '76-90+'
                END as faixa,
                COUNT(*) as total
            FROM gols
            WHERE clube = ? AND minuto != '' AND minuto != 'n/d'
            GROUP BY faixa
            ORDER BY faixa
        """, (nome_clube,))
        faixas = [{'faixa': r[0], 'gols': r[1]} for r in c.fetchall()]
        return {
            'pct_primeiro_tempo': pct_1t,
            'pct_segundo_tempo': pct_2t,
            'faixas_minutagem': faixas
        }

    tempo_mandante = analisar_gols_tempo(time_m)
    tempo_visitante = analisar_gols_tempo(time_v)

    # Análise do Árbitro
    nome_arbitro = partida.get('arbitro') or 'Não informado'
    arbitro_stats = {
        'nome': nome_arbitro,
        'jogos': 0,
        'media_cartoes': 4.8,
        'media_amarelos': 4.5,
        'media_vermelhos': 0.3,
        'perfil': 'Disciplinador Padrão',
        'prob_over_4_5_cartoes': 58.2
    }
    if nome_arbitro and nome_arbitro != 'Não informado':
        c.execute("""
            SELECT 
                COUNT(DISTINCT p.id_partida) as jogos,
                COUNT(c.id_cartao) as total_cartoes,
                SUM(CASE WHEN c.cartao LIKE '%Amarelo%' THEN 1 ELSE 0 END) as amarelos,
                SUM(CASE WHEN c.cartao LIKE '%Vermelho%' THEN 1 ELSE 0 END) as vermelhos
            FROM partidas p
            JOIN cartoes c ON p.id_partida = c.id_partida
            WHERE p.arbitro LIKE ?
        """, (f"%{nome_arbitro}%",))
        ref_row = c.fetchone()
        if ref_row and ref_row['jogos'] and ref_row['jogos'] > 0:
            j_arb = ref_row['jogos']
            m_cart = round(ref_row['total_cartoes'] / j_arb, 2)
            m_am = round((ref_row['amarelos'] or 0) / j_arb, 2)
            m_vm = round((ref_row['vermelhos'] or 0) / j_arb, 2)
            
            perfil = 'Moderado'
            if m_cart >= 5.5:
                perfil = 'Altamente Rigoroso'
            elif m_cart >= 4.8:
                perfil = 'Rigoroso'
            elif m_cart < 3.8:
                perfil = 'Permissivo'

            # Poisson para Over 4.5 cartões
            l_cart = max(1.0, m_cart)
            p_under_45 = sum((math.exp(-l_cart) * (l_cart**k)) / math.factorial(k) for k in range(5))
            p_over_45 = round((1.0 - p_under_45) * 100, 1)

            arbitro_stats = {
                'nome': nome_arbitro,
                'jogos': j_arb,
                'media_cartoes': m_cart,
                'media_amarelos': m_am,
                'media_vermelhos': m_vm,
                'perfil': perfil,
                'prob_over_4_5_cartoes': p_over_45
            }

    conn.close()

    # Cálculo Matemático Poisson com médias refinadas
    lh = max(0.40, forma_mandante['media_gp'])
    la = max(0.35, forma_visitante['media_gp'])
    calc = _calc_poisson_bivariate(lh, la)

    # Montagem de Insights Analíticos do Apostador
    insights = []
    if forma_mandante['clean_sheets_pct'] >= 40.0:
        insights.append(f"Muralha Defensiva: {time_m} não sofreu gols em {forma_mandante['clean_sheets_pct']}% dos últimos jogos.")
    if tempo_mandante['pct_segundo_tempo'] >= 60.0 or tempo_visitante['pct_segundo_tempo'] >= 60.0:
        insights.append("Tendência no 2º Tempo: Mais de 60% dos gols deste confronto costumam sair na etapa final.")
    if arbitro_stats['media_cartoes'] >= 5.0:
        insights.append(f"Árbitro Disciplinador: {arbitro_stats['nome']} tem média de {arbitro_stats['media_cartoes']} cartões/jogo (probabilidade de Over 4.5 é de {arbitro_stats['prob_over_4_5_cartoes']}%).")
    if calc['prob_over_2_5'] >= 55.0:
        insights.append(f"Ataques Produtivos: Modelo matemático estima {calc['prob_over_2_5']}% de probabilidade de Over 2.5 gols.")
    elif calc['prob_under_2_5'] >= 55.0:
        insights.append(f"Jogo Truncado: Probabilidade de Under 2.5 gols é de {calc['prob_under_2_5']}%.")

    return jsonify({
        'partida': partida,
        'probabilidades': calc,
        'forma_recente': {
            'mandante': forma_mandante,
            'visitante': forma_visitante
        },
        'retrospecto_h2h': {
            'jogos': h2h_jogos,
            'total_jogos': len(h2h_jogos),
            'vitorias_mandante': vitorias_m,
            'vitorias_visitante': vitorias_v,
            'empates': empates_h2h,
            'media_gols': round(gols_totais_h2h / total_h2h, 2),
            'over_2_5_pct': round((over_25_h2h / total_h2h) * 100, 1),
            'btts_pct': round((btts_h2h / total_h2h) * 100, 1)
        },
        'analise_gols_tempo': {
            'mandante': tempo_mandante,
            'visitante': tempo_visitante
        },
        'arbitro': arbitro_stats,
        'insights_apostador': insights
    })


@app.route('/api/apostas/jogadores', methods=['GET'])
def get_apostas_jogadores():
    """
    Retorna estatísticas de finalizações, probabilidade de marcar gol a qualquer momento (Anytime Goalscorer),
    probabilidade de cartões por jogo e odds implícitas justas.
    """
    clube = request.args.get('clube', '').strip()
    posicao = request.args.get('posicao', '').strip()
    busca = request.args.get('busca', '').strip()
    ordenar = request.args.get('ordenar', 'prob_gol').strip()
    limit = min(request.args.get('limit', 30, type=int), 100)

    conn = get_db()
    c = conn.cursor()

    where_clauses = ["total_jogos >= 5", "ano_fim >= 2023"]
    params = []

    if clube:
        where_clauses.append("clubes LIKE ?")
        params.append(f"%{clube}%")

    if posicao:
        where_clauses.append("posicao LIKE ?")
        params.append(f"%{posicao}%")

    if busca:
        where_clauses.append("(nome_exibicao LIKE ? OR nome_completo LIKE ? OR apelido LIKE ?)")
        params.extend([f"%{busca}%", f"%{busca}%", f"%{busca}%"])

    where_sql = " AND ".join(where_clauses)
    sql = f"""
        SELECT 
            id_jogador, ogol_id, cbf_id, nome_exibicao, apelido, posicao, clubes,
            ano_inicio, ano_fim, total_jogos, jogos_titular, total_gols,
            gols_primeiro_tempo, gols_segundo_tempo, gols_mandante, gols_visitante,
            media_gols_por_jogo, chutes_ao_gol, finalizacoes_totais, pontaria_chutes_pct,
            cartoes_amarelos, cartoes_vermelhos
        FROM jogadores_estatisticas
        WHERE {where_sql}
        ORDER BY total_gols DESC
        LIMIT 150;
    """
    rows = [dict(r) for r in c.execute(sql, params).fetchall()]
    conn.close()

    jogadores = []
    for r in rows:
        jogos = max(r['total_jogos'] or 1, 1)
        gols = r['total_gols'] or 0

        # Calibração Bayesiana de taxa de gols por partida (prior 0.22, peso 10)
        taxa_gols_calibrada = min(0.72, max(0.06, (gols + 2.2) / (jogos + 10)))
        p_gol = round((1.0 - math.exp(-taxa_gols_calibrada)) * 100, 1)
        fair_odd_gol = round(100.0 / p_gol, 2) if p_gol > 0 else 99.0
        odd_casa_estimada = round(fair_odd_gol * 0.90, 2)

        # Chutes e Finalizações
        chutes_totais = r['finalizacoes_totais'] or (gols * 4)
        chutes_gol = r['chutes_ao_gol'] or (gols * 2)
        media_chutes = round(chutes_totais / jogos, 2)
        media_chutes_gol = round(chutes_gol / jogos, 2)

        # Cartões e Disciplina
        amarelos = r['cartoes_amarelos'] or 0
        vermelhos = r['cartoes_vermelhos'] or 0
        media_cartoes = round((amarelos + vermelhos * 2) / jogos, 2)
        taxa_cartao = min(0.60, max(0.04, media_cartoes))
        p_cartao = round((1.0 - math.exp(-taxa_cartao)) * 100, 1)
        fair_odd_cartao = round(100.0 / p_cartao, 2) if p_cartao > 0 else 99.0

        # Perfil do atleta no mercado de apostas
        if p_gol >= 45.0:
            perfil_aposta = 'Artilheiro Decisivo'
        elif media_chutes >= 2.5:
            perfil_aposta = 'Finalizador Frequente'
        elif p_cartao >= 30.0:
            perfil_aposta = 'Alvo Disciplinar'
        else:
            perfil_aposta = 'Regular'

        jogadores.append({
            'id_jogador': r['id_jogador'],
            'nome': r['nome_exibicao'] or r['apelido'],
            'posicao': r['posicao'] or 'Jogador',
            'clube_atual': (r['clubes'] or '').split(',')[-1].strip(),
            'total_jogos': jogos,
            'total_gols': gols,
            'media_gols_por_jogo': round(gols / jogos, 2),
            'prob_marcar_gol': p_gol,
            'odd_justa_gol': fair_odd_gol,
            'odd_casa_estimada': odd_casa_estimada,
            'chutes_totais': chutes_totais,
            'chutes_ao_gol': chutes_gol,
            'media_chutes': media_chutes,
            'media_chutes_gol': media_chutes_gol,
            'pontaria_pct': r['pontaria_chutes_pct'] or round((chutes_gol / max(chutes_totais, 1)) * 100, 1),
            'cartoes_amarelos': amarelos,
            'cartoes_vermelhos': vermelhos,
            'media_cartoes': media_cartoes,
            'prob_levar_cartao': p_cartao,
            'odd_justa_cartao': fair_odd_cartao,
            'perfil_aposta': perfil_aposta
        })

    if ordenar == 'chutes':
        jogadores.sort(key=lambda x: x['media_chutes'], reverse=True)
    elif ordenar == 'cartoes':
        jogadores.sort(key=lambda x: x['prob_levar_cartao'], reverse=True)
    elif ordenar == 'gols':
        jogadores.sort(key=lambda x: x['total_gols'], reverse=True)
    else:
        jogadores.sort(key=lambda x: x['prob_marcar_gol'], reverse=True)

    top_artilheiros = sorted(jogadores, key=lambda x: x['prob_marcar_gol'], reverse=True)[:5]
    top_finalizadores = sorted(jogadores, key=lambda x: x['media_chutes'], reverse=True)[:5]
    top_cartoes = sorted(jogadores, key=lambda x: x['prob_levar_cartao'], reverse=True)[:5]

    return jsonify({
        'total': len(jogadores),
        'top_anytime_scorers': top_artilheiros,
        'top_finalizadores': top_finalizadores,
        'top_cartoes': top_cartoes,
        'jogadores': jogadores[:limit]
    })


@app.route('/api/ia/diagnostico', methods=['GET'])
@require_admin
def ia_diagnostico():
    gemini_key = os.environ.get("GEMINI_API_KEY", "").strip()
    deepseek_key = (os.environ.get("DEEPSEEK_API_KEY", "") or os.environ.get("OPENROUTER_API_KEY", "")).strip()

    # Retorna apenas status booleano de configuração sem expor prefixos de chaves nem disparar chamadas externas
    return jsonify({
        "gemini_configured": bool(gemini_key),
        "deepseek_configured": bool(deepseek_key),
        "db_futebol_exists": os.path.exists(DB_FUTEBOL),
        "db_clima_exists": os.path.exists(DB_CLIMA)
    })

@app.route('/api/ia/perguntar', methods=['POST'])
@require_auth
def perguntar_ia():
    ip = obter_ip_real()
    usuario_key = getattr(g, 'current_user', {}).get("username", ip)
    if not limiter.is_allowed(f"ia_{usuario_key}_{ip}", max_requests=15, window_seconds=60):
        return jsonify({
            "error": "Limite de segurança de 15 consultas por minuto atingido. Aguarde alguns instantes."
        }), 429

    dados = request.get_json(force=True, silent=True) or {}
    pergunta = dados.get('pergunta', '').strip()
    modelo = dados.get('modelo', 'gemini').strip()
    api_key = dados.get('api_key', '').strip()

    if not pergunta:
        return jsonify({"error": "Por favor, digite sua pergunta."}), 400

    # runaway-guard: Trava de tamanho de entrada para evitar estouro de tokens/custo
    if len(pergunta) > 500:
        return jsonify({
            "error": "A pergunta excede o limite máximo de 500 caracteres para proteção de cota e tokens."
        }), 400

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
