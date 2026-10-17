import os
import sqlite3
import hmac
import hashlib
import base64
import json
import time

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
ROOT_DIR = os.path.dirname(BASE_DIR)
DB_FUTEBOL = os.path.join(ROOT_DIR, 'data', 'futebol.db')

SECRET_KEY = os.environ.get('SECRET_KEY', 'futstats-secret-key-2026-super-segura-lb-jwt')
INVITE_CODE = os.environ.get('INVITE_CODE', 'FUTSTATS-2026')

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

def get_db():
    if os.path.exists(DB_FUTEBOL):
        try:
            conn = sqlite3.connect(f"file:{DB_FUTEBOL}?mode=ro", uri=True)
            conn.row_factory = sqlite3.Row
            return conn
        except Exception:
            pass
    conn = sqlite3.connect(DB_FUTEBOL)
    conn.row_factory = sqlite3.Row
    return conn

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

def login_usuario(username, password):
    username = (username or "").strip()
    password = (password or "").strip()
    
    if not username or not password:
        return None, "Informe usuário e senha."

    # Validação master do Admin LB (independente de banco)
    if username == "LB" and password == "46475595":
        user_info = {
            "username": "LB",
            "nome": "Leonardo (LB)",
            "role": "admin"
        }
        token = gerar_token(user_info)
        return {"user": user_info, "token": token}, None

    # Consulta no SQLite para outros moderadores cadastrados
    try:
        conn = get_db()
        c = conn.cursor()
        c.execute("SELECT id_usuario, username, nome, senha_hash, role FROM usuarios WHERE LOWER(username) = LOWER(?);", (username,))
        row = c.fetchone()
        conn.close()
        
        if row and verificar_senha(password, row["senha_hash"]):
            user_info = {
                "username": row["username"],
                "nome": row["nome"],
                "role": row["role"]
            }
            token = gerar_token(user_info)
            return {"user": user_info, "token": token}, None
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
        return None, "Código de convite inválido ou expirado. Peça o código oficial ao administrador."

    # Tenta salvar no banco de dados se for gravável
    try:
        conn = sqlite3.connect(DB_FUTEBOL)
        c = conn.cursor()
        senha_h = hash_senha(password)
        c.execute("""
            INSERT INTO usuarios (username, nome, senha_hash, role)
            VALUES (?, ?, ?, 'moderador');
        """, (username, nome, senha_h))
        conn.commit()
        conn.close()
    except sqlite3.IntegrityError:
        return None, "Este nome de usuário já está em uso. Escolha outro."
    except Exception:
        # Se o filesystem for somente-leitura (como Vercel lambda), o token assinado ainda é emitido!
        pass

    user_info = {
        "username": username,
        "nome": nome,
        "role": "moderador"
    }
    token = gerar_token(user_info)
    return {"user": user_info, "token": token}, None

