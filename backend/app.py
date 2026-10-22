import re
import os
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

    # Condições de busca para partidas (usando id_jogador se disponível para velocidade máxima)
    if target_id:
        cond_gols = "(g.id_jogador = ?)"
        params_gols = [target_id]
        cond_cartoes = "(cr.id_jogador = ?)"
        params_cartoes = [target_id]
        cond_esc = "(e.id_jogador = ?)"
        params_esc = [target_id]
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
        "ogol_id": stats_meta.get('ogol_id'),
        "cbf_id": stats_meta.get('cbf_id'),
        "posicao": stats_meta.get('posicao') or "Atacante",
        "clubes": [cb.strip() for cb in (stats_meta.get('clubes') or '').split(',') if cb.strip()],
        "clube_filtro": clube_filtro,
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
        "partidas": partidas_ordenadas[:100]
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
