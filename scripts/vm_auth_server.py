#!/usr/bin/env python3
"""
FutStats - Servidor Seguro de Autenticação, Convites 24h e Governança Admin
Executado isoladamente na VM Oracle (porta 8099, protegido por firewall + X-Auth-Secret + Caddy TLS).
"""

import hashlib
import hmac
import json
import os
import re
import secrets
import sqlite3
import threading
import time
import urllib.request
from datetime import datetime, timezone
from functools import wraps

from flask import Flask, jsonify, request
from werkzeug.security import check_password_hash

# Catálogo oficial das 15 ferramentas da dashboard FutStats
CATALOGO_FERRAMENTAS = [
    {"id": "overview", "label": "Painel do Dia", "grupo": "Inteligência"},
    {"id": "oraculo-preditivo", "label": "Oráculo Preditivo", "grupo": "Inteligência"},
    {"id": "probabilidades", "label": "Probabilidades & Odds", "grupo": "Inteligência"},
    {"id": "metricas-avancadas", "label": "Scouting Avançado", "grupo": "Inteligência"},
    {"id": "campeonato", "label": "Competições", "grupo": "Histórico"},
    {"id": "times", "label": "Clubes & Elencos", "grupo": "Histórico"},
    {"id": "jogadores", "label": "Jogadores", "grupo": "Histórico"},
    {"id": "h2h", "label": "Confrontos (H2H)", "grupo": "Histórico"},
    {"id": "tecnicos", "label": "Técnicos", "grupo": "Histórico"},
    {"id": "playground", "label": "Valor Esperado (+EV)", "grupo": "Mercado"},
    {"id": "arbitros", "label": "Árbitros", "grupo": "Mercado"},
    {"id": "tweets", "label": "Cards & Exportação", "grupo": "Mercado"},
    {"id": "oraculo", "label": "Oráculo SQL", "grupo": "Avançado"},
    {"id": "clima", "label": "Clima & Estádios", "grupo": "Avançado"},
    {"id": "aovivo", "label": "Placar ao Vivo", "grupo": "Avançado"},
]
VALID_TOOL_IDS = {t["id"] for t in CATALOGO_FERRAMENTAS}
ALL_TOOL_IDS = [t["id"] for t in CATALOGO_FERRAMENTAS]
VALID_ROLES = {"admin", "moderador", "leitor"}
VALID_STATUSES = {"ativo", "pendente", "bloqueado"}
USERNAME_RE = re.compile(r"^[A-Za-z0-9_.-]{3,32}$")

_RATE_LOCK = threading.Lock()
_FAILED_LOGINS = {}
_REGISTER_ATTEMPTS = {}


def _now_iso():
    return datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S")


def hash_senha(senha, salt=None):
    if not salt:
        salt = os.urandom(16).hex()
    dk = hashlib.pbkdf2_hmac("sha256", senha.encode("utf-8"), salt.encode("utf-8"), 100000)
    return f"pbkdf2:sha256:{salt}:{dk.hex()}"


def verificar_senha(senha, hash_armazenado):
    if not hash_armazenado or not senha:
        return False
    if hash_armazenado.startswith("pbkdf2:sha256:"):
        try:
            parts = hash_armazenado.split(":")
            if len(parts) == 4:
                _, _, salt, expected = parts
                dk = hashlib.pbkdf2_hmac("sha256", senha.encode("utf-8"), salt.encode("utf-8"), 100000)
                return hmac.compare_digest(dk.hex(), expected)
        except Exception:
            pass
    try:
        return check_password_hash(hash_armazenado, senha)
    except Exception:
        return False


def _enviar_telegram_admin(mensagem):
    token = os.environ.get("TELEGRAM_BOT_TOKEN", "").strip()
    chats_raw = os.environ.get("TELEGRAM_ADMIN_CHATS", "") or os.environ.get("TELEGRAM_CHAT_ID", "")
    chat_ids = [c.strip() for c in chats_raw.split(",") if c.strip()]
    if not token or not chat_ids:
        return

    def _send():
        for cid in chat_ids:
            try:
                payload = json.dumps({"chat_id": cid, "text": mensagem}).encode("utf-8")
                req = urllib.request.Request(
                    f"https://api.telegram.org/bot{token}/sendMessage",
                    data=payload,
                    headers={"Content-Type": "application/json"},
                    method="POST",
                )
                urllib.request.urlopen(req, timeout=5)
            except Exception:
                pass

    threading.Thread(target=_send, daemon=True).start()


def _check_rate_limit(bucket, key, limit, window_sec):
    now = time.time()
    with _RATE_LOCK:
        hits = [t for t in bucket.get(key, []) if now - t < window_sec]
        bucket[key] = hits
        return len(hits) >= limit


def _record_rate_hit(bucket, key, window_sec):
    now = time.time()
    with _RATE_LOCK:
        hits = [t for t in bucket.get(key, []) if now - t < window_sec]
        hits.append(now)
        bucket[key] = hits


def create_auth_app(db_path=None, shared_secret=None, enable_telegram=True):
    app = Flask(__name__)
    db_file = db_path or os.environ.get("FUTSTATS_AUTH_DB", "/opt/futstats/auth.db")
    secret_key = (
        shared_secret
        or os.environ.get("FUTSTATS_AUTH_SECRET")
        or hashlib.sha256(
            f"{os.environ.get('SECRET_KEY') or 'futstats-jwt-secret-stable-auth-2026-production-sig-key-vercel'}:vm-auth-bridge".encode()
        ).hexdigest()
    )

    def get_conn():
        os.makedirs(os.path.dirname(os.path.abspath(db_file)), exist_ok=True)
        conn = sqlite3.connect(db_file, timeout=10)
        conn.row_factory = sqlite3.Row
        conn.execute("PRAGMA journal_mode=WAL")
        conn.execute("PRAGMA busy_timeout=5000")
        return conn

    def init_db():
        with get_conn() as conn:
            conn.execute(
                """
                CREATE TABLE IF NOT EXISTS users (
                    id_usuario INTEGER PRIMARY KEY AUTOINCREMENT,
                    username TEXT UNIQUE NOT NULL,
                    nome TEXT NOT NULL,
                    senha_hash TEXT NOT NULL,
                    role TEXT NOT NULL DEFAULT 'leitor',
                    status TEXT NOT NULL DEFAULT 'ativo',
                    ferramentas_json TEXT,
                    origem_cadastro TEXT DEFAULT 'sistema',
                    convite_token TEXT,
                    criado_em TEXT NOT NULL,
                    ultimo_login TEXT,
                    aprovado_por TEXT
                )
                """
            )
            conn.execute(
                """
                CREATE TABLE IF NOT EXISTS invite_links (
                    token TEXT PRIMARY KEY,
                    titulo TEXT NOT NULL DEFAULT 'Convite 24h',
                    criado_por TEXT NOT NULL,
                    role_padrao TEXT NOT NULL DEFAULT 'leitor',
                    ferramentas_json TEXT,
                    max_usos INTEGER NOT NULL DEFAULT 0,
                    usos_atuais INTEGER NOT NULL DEFAULT 0,
                    expira_em INTEGER NOT NULL,
                    revogado INTEGER NOT NULL DEFAULT 0,
                    criado_em TEXT NOT NULL
                )
                """
            )
            conn.execute(
                """
                CREATE TABLE IF NOT EXISTS global_settings (
                    chave TEXT PRIMARY KEY,
                    valor TEXT NOT NULL
                )
                """
            )
            conn.execute(
                """
                CREATE TABLE IF NOT EXISTS audit_logs (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    acao TEXT NOT NULL,
                    ator TEXT,
                    alvo TEXT,
                    detalhes TEXT,
                    criado_em TEXT NOT NULL
                )
                """
            )
            conn.execute(
                "INSERT OR IGNORE INTO global_settings (chave, valor) VALUES ('ferramentas_bloqueadas_global', '[]')"
            )
            conn.commit()

    init_db()

    def _log_audit(conn, acao, ator, alvo="", detalhes=""):
        conn.execute(
            "INSERT INTO audit_logs (acao, ator, alvo, detalhes, criado_em) VALUES (?, ?, ?, ?, ?)",
            (acao, ator, alvo, detalhes, _now_iso()),
        )

    def _get_global_blocked(conn):
        row = conn.execute(
            "SELECT valor FROM global_settings WHERE chave = 'ferramentas_bloqueadas_global'"
        ).fetchone()
        if not row:
            return []
        try:
            items = json.loads(row["valor"])
            return [t for t in items if t in VALID_TOOL_IDS]
        except Exception:
            return []

    def _parse_tools_json(raw):
        if raw is None:
            return None
        try:
            items = json.loads(raw)
            if isinstance(items, list):
                return [t for t in items if t in VALID_TOOL_IDS]
        except Exception:
            pass
        return None

    def _compute_effective_tools(role, user_tools, global_blocked):
        if role == "admin":
            return list(ALL_TOOL_IDS)
        blocked_set = set(global_blocked)
        base = list(ALL_TOOL_IDS) if user_tools is None else [t for t in user_tools if t in VALID_TOOL_IDS]
        return [t for t in base if t not in blocked_set]

    def _serialize_user(row, global_blocked):
        user_tools = _parse_tools_json(row["ferramentas_json"])
        effective = _compute_effective_tools(row["role"], user_tools, global_blocked)
        return {
            "id_usuario": row["id_usuario"],
            "username": row["username"],
            "nome": row["nome"],
            "role": row["role"],
            "status": row["status"],
            "ferramentas_custom": user_tools,
            "ferramentas_permitidas": effective,
            "origem_cadastro": row["origem_cadastro"],
            "convite_token": row["convite_token"],
            "criado_em": row["criado_em"],
            "ultimo_login": row["ultimo_login"],
            "aprovado_por": row["aprovado_por"],
        }

    def require_secret(f):
        @wraps(f)
        def wrapper(*args, **kwargs):
            header_secret = request.headers.get("X-Auth-Secret", "")
            if not header_secret or not hmac.compare_digest(header_secret, secret_key):
                return jsonify({"error": "Não autorizado"}), 401
            return f(*args, **kwargs)

        return wrapper

    @app.route("/health", methods=["GET"])
    def health():
        return jsonify({"status": "ok", "service": "futstats-auth"}), 200

    @app.route("/internal/auth/login", methods=["POST"])
    @require_secret
    def internal_login():
        data = request.get_json(silent=True) or {}
        username = (data.get("username") or "").strip()
        password = data.get("password") or ""
        ip = (data.get("ip") or request.remote_addr or "unknown").strip()
        rate_key = f"{ip}:{username.lower()}"

        if not username or not password:
            return jsonify({"error": "Informe usuário e senha."}), 400
        if _check_rate_limit(_FAILED_LOGINS, rate_key, limit=12, window_sec=300):
            return jsonify({"error": "Muitas tentativas. Aguarde alguns minutos."}), 429

        with get_conn() as conn:
            row = conn.execute(
                "SELECT * FROM users WHERE LOWER(username) = LOWER(?)", (username,)
            ).fetchone()
            if not row or not verificar_senha(password, row["senha_hash"]):
                _record_rate_hit(_FAILED_LOGINS, rate_key, 300)
                return jsonify({"error": "Usuário ou senha incorretos."}), 401

            if row["status"] == "pendente":
                return (
                    jsonify(
                        {
                            "error": "Sua conta aguarda autorização do administrador.",
                            "code": "PENDING_APPROVAL",
                        }
                    ),
                    403,
                )
            if row["status"] == "bloqueado":
                return (
                    jsonify(
                        {
                            "error": "Seu acesso foi suspenso pelo administrador.",
                            "code": "ACCOUNT_BLOCKED",
                        }
                    ),
                    403,
                )

            now_iso = _now_iso()
            conn.execute(
                "UPDATE users SET ultimo_login = ? WHERE id_usuario = ?",
                (now_iso, row["id_usuario"]),
            )
            conn.commit()
            updated = conn.execute(
                "SELECT * FROM users WHERE id_usuario = ?", (row["id_usuario"],)
            ).fetchone()
            global_blocked = _get_global_blocked(conn)
            return jsonify({"user": _serialize_user(updated, global_blocked)}), 200

    @app.route("/internal/auth/convite-status/<token>", methods=["GET"])
    @require_secret
    def internal_convite_status(token):
        token_clean = (token or "").strip()
        now_ts = int(time.time())
        with get_conn() as conn:
            inv = conn.execute(
                "SELECT * FROM invite_links WHERE token = ?", (token_clean,)
            ).fetchone()
            if not inv:
                return jsonify({"valido": False, "motivo": "nao_encontrado"}), 200
            if inv["revogado"]:
                return jsonify({"valido": False, "motivo": "revogado"}), 200
            if inv["expira_em"] <= now_ts:
                return (
                    jsonify(
                        {
                            "valido": False,
                            "motivo": "expirado",
                            "expira_em": inv["expira_em"],
                        }
                    ),
                    200,
                )
            if inv["max_usos"] > 0 and inv["usos_atuais"] >= inv["max_usos"]:
                return jsonify({"valido": False, "motivo": "esgotado"}), 200

            return (
                jsonify(
                    {
                        "valido": True,
                        "motivo": "ativo",
                        "titulo": inv["titulo"],
                        "role_padrao": inv["role_padrao"],
                        "expira_em": inv["expira_em"],
                        "restante_segundos": inv["expira_em"] - now_ts,
                        "max_usos": inv["max_usos"],
                        "usos_atuais": inv["usos_atuais"],
                    }
                ),
                200,
            )

    @app.route("/internal/auth/register", methods=["POST"])
    @require_secret
    def internal_register():
        data = request.get_json(silent=True) or {}
        nome = (data.get("nome") or "").strip()
        username = (data.get("username") or "").strip()
        password = data.get("password") or ""
        codigo = (data.get("codigo_convite") or "").strip()
        ip = (data.get("ip") or request.remote_addr or "unknown").strip()

        if len(nome) < 2 or len(nome) > 64:
            return jsonify({"error": "Informe seu nome completo (2 a 64 caracteres)."}), 400
        if not USERNAME_RE.match(username):
            return (
                jsonify(
                    {
                        "error": "Usuário inválido. Use 3 a 32 caracteres (letras, números, ponto ou underline)."
                    }
                ),
                400,
            )
        if len(password) < 6 or len(password) > 128:
            return jsonify({"error": "A senha deve ter entre 6 e 128 caracteres."}), 400

        if _check_rate_limit(_REGISTER_ATTEMPTS, ip, limit=12, window_sec=600):
            return jsonify({"error": "Limite de cadastros temporário atingido."}), 429
        _record_rate_hit(_REGISTER_ATTEMPTS, ip, 600)

        now_ts = int(time.time())
        now_iso = _now_iso()

        with get_conn() as conn:
            exists = conn.execute(
                "SELECT 1 FROM users WHERE LOWER(username) = LOWER(?)", (username,)
            ).fetchone()
            if exists:
                return jsonify({"error": "Este nome de usuário já está em uso."}), 409

            status = "pendente"
            role = "leitor"
            ferramentas_json = None
            origem = "solicitacao_manual"
            convite_usado = None
            aprovado_por = None
            mensagem_pendente = (
                "Solicitação enviada! Como não há um link ativo, seu acesso aguarda autorização do administrador."
            )

            if codigo:
                inv = conn.execute(
                    "SELECT * FROM invite_links WHERE token = ?", (codigo,)
                ).fetchone()
                if not inv:
                    return (
                        jsonify(
                            {
                                "error": "Código de convite inválido. Deixe o campo em branco para solicitar autorização ao administrador."
                            }
                        ),
                        403,
                    )
                if inv["revogado"]:
                    origem = "convite_revogado"
                    convite_usado = codigo
                    mensagem_pendente = (
                        "Este link de convite foi encerrado. Sua solicitação foi registrada e aguarda autorização do administrador."
                    )
                elif inv["expira_em"] <= now_ts:
                    origem = "convite_expirado"
                    convite_usado = codigo
                    mensagem_pendente = (
                        "O link de 24h expirou. Sua solicitação foi enviada e aguarda autorização do administrador."
                    )
                elif inv["max_usos"] > 0 and inv["usos_atuais"] >= inv["max_usos"]:
                    origem = "convite_esgotado"
                    convite_usado = codigo
                    mensagem_pendente = (
                        "Este link já atingiu o limite de cadastros. Sua solicitação aguarda autorização do administrador."
                    )
                else:
                    status = "ativo"
                    role = inv["role_padrao"] if inv["role_padrao"] in VALID_ROLES else "leitor"
                    ferramentas_json = inv["ferramentas_json"]
                    origem = "convite_24h"
                    convite_usado = codigo
                    aprovado_por = inv["criado_por"]
                    conn.execute(
                        "UPDATE invite_links SET usos_atuais = usos_atuais + 1 WHERE token = ?",
                        (codigo,),
                    )

            pwd_hash = hash_senha(password)
            conn.execute(
                """
                INSERT INTO users
                (username, nome, senha_hash, role, status, ferramentas_json, origem_cadastro, convite_token, criado_em, ultimo_login, aprovado_por)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    username,
                    nome,
                    pwd_hash,
                    role,
                    status,
                    ferramentas_json,
                    origem,
                    convite_usado,
                    now_iso,
                    now_iso if status == "ativo" else None,
                    aprovado_por,
                ),
            )
            _log_audit(conn, f"cadastro_{status}", username, username, f"origem={origem}")
            conn.commit()

            row = conn.execute(
                "SELECT * FROM users WHERE LOWER(username) = LOWER(?)", (username,)
            ).fetchone()
            global_blocked = _get_global_blocked(conn)
            user_obj = _serialize_user(row, global_blocked)

        if enable_telegram:
            if status == "ativo":
                _enviar_telegram_admin(
                    f"✅ Novo cadastro via link 24h no FutStats:\n"
                    f"• Nome: {nome}\n• Usuário: @{username}\n• Perfil: {role}"
                )
            else:
                _enviar_telegram_admin(
                    f"🔐 Solicitação de cadastro pendente no FutStats:\n"
                    f"• Nome: {nome}\n• Usuário: @{username}\n• Motivo: {origem}\n"
                    f"Acesse o Painel Admin na dashboard para autorizar ou bloquear."
                )

        if status == "ativo":
            return jsonify({"approved": True, "user": user_obj}), 201
        return (
            jsonify(
                {
                    "approved": False,
                    "pending": True,
                    "mensagem": mensagem_pendente,
                    "user": user_obj,
                }
            ),
            202,
        )

    @app.route("/internal/auth/user/<username>", methods=["GET"])
    @require_secret
    def internal_get_user(username):
        with get_conn() as conn:
            row = conn.execute(
                "SELECT * FROM users WHERE LOWER(username) = LOWER(?)", (username,)
            ).fetchone()
            if not row:
                return jsonify({"error": "Usuário não encontrado"}), 404
            global_blocked = _get_global_blocked(conn)
            return jsonify({"user": _serialize_user(row, global_blocked)}), 200

    @app.route("/internal/auth/change-password", methods=["POST"])
    @require_secret
    def internal_change_password():
        data = request.get_json(silent=True) or {}
        username = (data.get("username") or "").strip()
        senha_atual = data.get("senha_atual") or ""
        nova_senha = data.get("nova_senha") or ""
        if len(nova_senha) < 6 or len(nova_senha) > 128:
            return jsonify({"error": "A nova senha deve ter entre 6 e 128 caracteres."}), 400

        with get_conn() as conn:
            row = conn.execute(
                "SELECT * FROM users WHERE LOWER(username) = LOWER(?)", (username,)
            ).fetchone()
            if not row or not verificar_senha(senha_atual, row["senha_hash"]):
                return jsonify({"error": "Senha atual incorreta."}), 400
            conn.execute(
                "UPDATE users SET senha_hash = ? WHERE id_usuario = ?",
                (hash_senha(nova_senha), row["id_usuario"]),
            )
            _log_audit(conn, "alterar_senha", row["username"], row["username"], "propria_conta")
            conn.commit()
        return jsonify({"mensagem": "Senha alterada com sucesso!"}), 200

    @app.route("/internal/admin/overview", methods=["GET"])
    @require_secret
    def internal_admin_overview():
        with get_conn() as conn:
            global_blocked = _get_global_blocked(conn)
            users_rows = conn.execute(
                "SELECT * FROM users ORDER BY CASE status WHEN 'pendente' THEN 0 WHEN 'ativo' THEN 1 ELSE 2 END, id_usuario DESC"
            ).fetchall()
            invites_rows = conn.execute(
                "SELECT * FROM invite_links ORDER BY criado_em DESC LIMIT 50"
            ).fetchall()
            logs_rows = conn.execute(
                "SELECT * FROM audit_logs ORDER BY id DESC LIMIT 30"
            ).fetchall()

            now_ts = int(time.time())
            invites = []
            for inv in invites_rows:
                t_list = _parse_tools_json(inv["ferramentas_json"])
                ativo = (
                    inv["revogado"] == 0
                    and inv["expira_em"] > now_ts
                    and (inv["max_usos"] == 0 or inv["usos_atuais"] < inv["max_usos"])
                )
                invites.append(
                    {
                        "token": inv["token"],
                        "titulo": inv["titulo"],
                        "criado_por": inv["criado_por"],
                        "role_padrao": inv["role_padrao"],
                        "ferramentas": t_list,
                        "max_usos": inv["max_usos"],
                        "usos_atuais": inv["usos_atuais"],
                        "expira_em": inv["expira_em"],
                        "restante_segundos": max(0, inv["expira_em"] - now_ts),
                        "revogado": bool(inv["revogado"]),
                        "ativo": ativo,
                        "criado_em": inv["criado_em"],
                    }
                )

            return (
                jsonify(
                    {
                        "users": [_serialize_user(u, global_blocked) for u in users_rows],
                        "invites": invites,
                        "ferramentas_bloqueadas_global": global_blocked,
                        "catalogo_ferramentas": CATALOGO_FERRAMENTAS,
                        "logs": [dict(l) for l in logs_rows],
                    }
                ),
                200,
            )

    @app.route("/internal/admin/invites", methods=["POST"])
    @require_secret
    def internal_create_invite():
        data = request.get_json(silent=True) or {}
        criado_por = (data.get("criado_por") or "admin").strip()
        titulo = (data.get("titulo") or "Convite Temporário 24h").strip()[:80]
        role_padrao = (data.get("role_padrao") or "leitor").strip()
        if role_padrao not in {"leitor", "moderador"}:
            role_padrao = "leitor"
        duracao_horas = max(1, min(168, int(data.get("duracao_horas") or 24)))
        max_usos = max(0, min(1000, int(data.get("max_usos") or 0)))

        ferramentas_raw = data.get("ferramentas")
        ferramentas_json = None
        if isinstance(ferramentas_raw, list):
            clean_tools = [t for t in ferramentas_raw if t in VALID_TOOL_IDS]
            ferramentas_json = json.dumps(clean_tools)

        token = secrets.token_urlsafe(12)
        expira_em = int(time.time()) + duracao_horas * 3600
        now_iso = _now_iso()

        with get_conn() as conn:
            conn.execute(
                """
                INSERT INTO invite_links
                (token, titulo, criado_por, role_padrao, ferramentas_json, max_usos, usos_atuais, expira_em, revogado, criado_em)
                VALUES (?, ?, ?, ?, ?, ?, 0, ?, 0, ?)
                """,
                (token, titulo, criado_por, role_padrao, ferramentas_json, max_usos, expira_em, now_iso),
            )
            _log_audit(conn, "criar_convite", criado_por, token, f"horas={duracao_horas},role={role_padrao}")
            conn.commit()

        return (
            jsonify(
                {
                    "token": token,
                    "titulo": titulo,
                    "role_padrao": role_padrao,
                    "max_usos": max_usos,
                    "expira_em": expira_em,
                    "duracao_horas": duracao_horas,
                }
            ),
            201,
        )

    @app.route("/internal/admin/invites/<token>", methods=["DELETE"])
    @require_secret
    def internal_revoke_invite(token):
        ator = (request.args.get("ator") or "admin").strip()
        with get_conn() as conn:
            cur = conn.execute("UPDATE invite_links SET revogado = 1 WHERE token = ?", (token,))
            if cur.rowcount == 0:
                return jsonify({"error": "Convite não encontrado."}), 404
            _log_audit(conn, "revogar_convite", ator, token, "")
            conn.commit()
        return jsonify({"ok": True}), 200

    @app.route("/internal/admin/users/<username>", methods=["PATCH"])
    @require_secret
    def internal_update_user(username):
        data = request.get_json(silent=True) or {}
        ator = (data.get("ator") or "admin").strip()
        with get_conn() as conn:
            row = conn.execute(
                "SELECT * FROM users WHERE LOWER(username) = LOWER(?)", (username,)
            ).fetchone()
            if not row:
                return jsonify({"error": "Usuário não encontrado."}), 404

            new_status = row["status"]
            if "status" in data and data["status"] in VALID_STATUSES:
                if row["username"].lower() == ator.lower() and data["status"] != "ativo":
                    return jsonify({"error": "Você não pode bloquear sua própria conta admin."}), 400
                new_status = data["status"]

            new_role = row["role"]
            if "role" in data and data["role"] in VALID_ROLES:
                if row["username"].lower() == ator.lower() and data["role"] != "admin":
                    return jsonify({"error": "Você não pode remover seu próprio perfil admin."}), 400
                new_role = data["role"]

            new_tools_json = row["ferramentas_json"]
            if "ferramentas" in data:
                if data["ferramentas"] is None:
                    new_tools_json = None
                elif isinstance(data["ferramentas"], list):
                    clean = [t for t in data["ferramentas"] if t in VALID_TOOL_IDS]
                    new_tools_json = json.dumps(clean)

            new_hash = row["senha_hash"]
            if data.get("nova_senha"):
                if len(data["nova_senha"]) < 6:
                    return jsonify({"error": "Nova senha deve ter no mínimo 6 caracteres."}), 400
                new_hash = hash_senha(data["nova_senha"])

            aprovado_por = row["aprovado_por"]
            if new_status == "ativo" and row["status"] == "pendente":
                aprovado_por = ator

            conn.execute(
                """
                UPDATE users
                SET status = ?, role = ?, ferramentas_json = ?, senha_hash = ?, aprovado_por = ?
                WHERE id_usuario = ?
                """,
                (new_status, new_role, new_tools_json, new_hash, aprovado_por, row["id_usuario"]),
            )
            _log_audit(
                conn,
                "atualizar_usuario",
                ator,
                row["username"],
                f"status={new_status},role={new_role}",
            )
            conn.commit()
            updated = conn.execute(
                "SELECT * FROM users WHERE id_usuario = ?", (row["id_usuario"],)
            ).fetchone()
            global_blocked = _get_global_blocked(conn)
            return jsonify({"user": _serialize_user(updated, global_blocked)}), 200

    @app.route("/internal/admin/users/<username>", methods=["DELETE"])
    @require_secret
    def internal_delete_user(username):
        ator = (request.args.get("ator") or "admin").strip()
        if username.lower() == ator.lower():
            return jsonify({"error": "Você não pode excluir sua própria conta logada."}), 400
        with get_conn() as conn:
            row = conn.execute(
                "SELECT * FROM users WHERE LOWER(username) = LOWER(?)", (username,)
            ).fetchone()
            if not row:
                return jsonify({"error": "Usuário não encontrado."}), 404
            if row["role"] == "admin":
                admins = conn.execute(
                    "SELECT COUNT(*) FROM users WHERE role = 'admin' AND status = 'ativo'"
                ).fetchone()[0]
                if admins <= 1:
                    return jsonify({"error": "Não é possível remover o único administrador ativo."}), 400
            conn.execute("DELETE FROM users WHERE id_usuario = ?", (row["id_usuario"],))
            _log_audit(conn, "excluir_usuario", ator, row["username"], "")
            conn.commit()
        return jsonify({"ok": True}), 200

    @app.route("/internal/admin/settings/tools", methods=["PUT"])
    @require_secret
    def internal_update_global_tools():
        data = request.get_json(silent=True) or {}
        ator = (data.get("ator") or "admin").strip()
        blocked = data.get("ferramentas_bloqueadas_global")
        if not isinstance(blocked, list):
            return jsonify({"error": "Lista de ferramentas inválida."}), 400
        clean = sorted({t for t in blocked if t in VALID_TOOL_IDS})
        with get_conn() as conn:
            conn.execute(
                "INSERT OR REPLACE INTO global_settings (chave, valor) VALUES ('ferramentas_bloqueadas_global', ?)",
                (json.dumps(clean),),
            )
            _log_audit(conn, "ferramentas_globais", ator, "global", json.dumps(clean))
            conn.commit()
        return jsonify({"ferramentas_bloqueadas_global": clean}), 200

    # =========================================================================
    # DADOS ESPACIAIS E TÁTICOS REAIS (FOTMOB 2026 -> /opt/futstats/spatial.db)
    # =========================================================================
    spatial_db_file = os.environ.get("FUTSTATS_SPATIAL_DB", "/opt/futstats/spatial.db")

    def _get_spatial_conn():
        if not os.path.exists(spatial_db_file):
            return None
        c = sqlite3.connect(f"file:{spatial_db_file}?mode=ro", uri=True, timeout=8)
        c.row_factory = sqlite3.Row
        return c

    def _norm_txt(t):
        import unicodedata

        s = unicodedata.normalize("NFKD", (t or "").strip().lower())
        return "".join(ch for ch in s if not unicodedata.combining(ch))

    @app.route("/internal/spatial/player", methods=["GET"])
    @require_secret
    def internal_spatial_player():
        aid = request.args.get("id", type=int)
        nome = (request.args.get("nome") or "").strip()
        sc = _get_spatial_conn()
        if not sc:
            return jsonify({"found": False}), 200
        try:
            row = None
            if aid:
                row = sc.execute(
                    "SELECT * FROM player_spatial WHERE atleta_id_canonico = ?", (aid,)
                ).fetchone()
            if not row and nome:
                norm = _norm_txt(nome)
                row = sc.execute(
                    "SELECT * FROM player_spatial WHERE nome_norm = ? ORDER BY amostras_brutas DESC LIMIT 1",
                    (norm,),
                ).fetchone()
                if not row:
                    row = sc.execute(
                        "SELECT * FROM player_spatial WHERE nome_norm LIKE ? ORDER BY amostras_brutas DESC LIMIT 1",
                        (f"%{norm}%",),
                    ).fetchone()
            if not row:
                return jsonify({"found": False}), 200

            return (
                jsonify(
                    {
                        "found": True,
                        "atleta_id_canonico": row["atleta_id_canonico"],
                        "fotmob_id": row["fotmob_id"],
                        "nome": row["nome"],
                        "clube_nome": row["clube_nome"],
                        "posicao_primaria": row["posicao_primaria"],
                        "heatmap": json.loads(row["heatmap_json"] or "[]"),
                        "shotmap": json.loads(row["shotmap_json"] or "[]"),
                        "telemetria_espacial": json.loads(row["telemetria_json"] or "{}"),
                        "traits": json.loads(row["traits_json"] or "{}"),
                        "amostras_brutas": row["amostras_brutas"],
                        "total_chutes": row["total_chutes"],
                        "atualizado_em": row["atualizado_em"],
                    }
                ),
                200,
            )
        finally:
            sc.close()

    @app.route("/internal/spatial/clubs/tactical", methods=["GET"])
    @require_secret
    def internal_spatial_clubs_tactical():
        sc = _get_spatial_conn()
        if not sc:
            return jsonify({"clubes": []}), 200
        try:
            rows = sc.execute(
                "SELECT * FROM club_tactical_trends ORDER BY clube_nome ASC"
            ).fetchall()
            out = []
            for r in rows:
                out.append(
                    {
                        "clube_id_canonico": r["clube_id_canonico"],
                        "fotmob_id": r["fotmob_id"],
                        "clube_nome": r["clube_nome"],
                        "clube_sigla": r["clube_sigla"],
                        "jogos_analisados": r["jogos_analisados"],
                        "esquema_principal": r["esquema_principal"],
                        "esquema_recente_5": r["esquema_recente_5"],
                        "esquemas": json.loads(r["esquemas_json"] or "[]"),
                        "tendencia_esquemas": json.loads(r["tendencia_esquemas_json"] or "[]"),
                        "xi_medio": json.loads(r["xi_medio_json"] or "[]"),
                        "attacking_zones": json.loads(r["attacking_zones_json"] or "{}"),
                        "shot_profile": json.loads(r["shot_profile_json"] or "{}"),
                        "atualizado_em": r["atualizado_em"],
                    }
                )
            return jsonify({"clubes": out}), 200
        finally:
            sc.close()

    return app


if __name__ == "__main__":
    application = create_auth_app()
    port = int(os.environ.get("FUTSTATS_AUTH_PORT", "8099"))
    host = os.environ.get("FUTSTATS_AUTH_HOST", "0.0.0.0")
    application.run(host=host, port=port, threaded=True)
