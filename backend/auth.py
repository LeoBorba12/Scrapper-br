import os
import sqlite3
import hmac
import hashlib
import base64
import json
import time
from werkzeug.security import generate_password_hash, check_password_hash

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
ROOT_DIR = os.path.dirname(BASE_DIR)
DB_FUTEBOL = os.path.join(ROOT_DIR, 'data', 'futebol.db')

SECRET_KEY = os.environ.get('SECRET_KEY', 'futstats-secret-key-2026-super-segura-lb-jwt')
INVITE_CODE = os.environ.get('INVITE_CODE', 'FUTSTATS-2026')

def get_db():
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
            return None # Token expirado
            
        return payload
    except Exception:
        return None

def login_usuario(username, password):
    username = username.strip()
    password = password.strip()
    
    if not username or not password:
        return None, "Informe usuário e senha."

    # Validação master do Admin LB
    if username == "LB" and password == "46475595":
        user_info = {
            "username": "LB",
            "nome": "Leonardo (LB)",
            "role": "admin"
        }
        token = gerar_token(user_info)
        return {"user": user_info, "token": token}, None

    # Consulta no SQLite
    try:
        conn = get_db()
        c = conn.cursor()
        c.execute("SELECT id_usuario, username, nome, senha_hash, role FROM usuarios WHERE LOWER(username) = LOWER(?);", (username,))
        row = c.fetchone()
        conn.close()
        
        if row and check_password_hash(row["senha_hash"], password):
            user_info = {
                "username": row["username"],
                "nome": row["nome"],
                "role": row["role"]
            }
            token = gerar_token(user_info)
            return {"user": user_info, "token": token}, None
    except Exception as e:
        pass

    return None, "Usuário ou senha incorretos."

def cadastrar_com_convite(nome, username, password, codigo_convite):
    nome = nome.strip()
    username = username.strip()
    password = password.strip()
    codigo = codigo_convite.strip().upper()
    
    if not nome or len(nome) < 2:
        return None, "Informe seu nome completo ou apelido."
    if not username or len(username) < 2:
        return None, "O nome de usuário deve ter pelo menos 2 caracteres."
    if not password or len(password) < 4:
        return None, "A senha deve ter pelo menos 4 caracteres."
    if codigo != INVITE_CODE.upper():
        return None, "Código de convite inválido ou expirado. Peça o código oficial ao administrador."

    # Tenta salvar no banco de dados
    try:
        conn = get_db()
        c = conn.cursor()
        senha_hash = generate_password_hash(password)
        c.execute("""
            INSERT INTO usuarios (username, nome, senha_hash, role)
            VALUES (?, ?, ?, 'moderador');
        """, (username, nome, senha_hash))
        conn.commit()
        conn.close()
    except sqlite3.IntegrityError:
        return None, "Este nome de usuário já está em uso. Escolha outro."
    except Exception as e:
        # Se o filesystem for somente-leitura (como serverless), o token assinado ainda é emitido!
        pass

    user_info = {
        "username": username,
        "nome": nome,
        "role": "moderador"
    }
    token = gerar_token(user_info)
    return {"user": user_info, "token": token}, None
