"""
Bot Interativo de Moderação Telegram - Scrapper-BR
==================================================
Permite que moderadores autorizados interajam diretamente com a VM:
- /banco: Gera e envia o futebol.db compactado em .zip (~17 MB)
- /status: Exibe a telemetria ao vivo da máquina e progresso do scraping
- /dashboard: Retorna o link de acesso ao painel web na Vercel
- /ajuda: Lista todos os comandos disponíveis
"""

import os
import sys
import time
import json
import secrets
import zipfile
import shutil
import sqlite3
import subprocess
import urllib.parse
import urllib.request

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DB_LOCAL = os.path.join(BASE_DIR, "data", "futebol.db")

def carregar_env():
    env_file = os.path.join(BASE_DIR, ".env")
    if os.path.exists(env_file):
        try:
            with open(env_file, "r", encoding="utf-8") as f:
                for line in f:
                    line = line.strip()
                    if line and not line.startswith("#") and "=" in line:
                        k, v = line.split("=", 1)
                        os.environ.setdefault(k.strip(), v.strip().strip("'").strip('"'))
        except Exception:
            pass

carregar_env()
TOKEN = os.getenv("TELEGRAM_BOT_TOKEN", "")
ADMIN_CHATS_RAW = os.getenv("TELEGRAM_ADMIN_CHATS", os.getenv("TELEGRAM_CHAT_ID", ""))
ADMIN_CHATS = set(str(c).strip() for c in ADMIN_CHATS_RAW.split(",") if c.strip())
DASHBOARD_URL = os.getenv("DASHBOARD_URL", "https://scrapper-br.vercel.app")

def notificar(chat_id: str, texto: str):
    url = f"https://api.telegram.org/bot{TOKEN}/sendMessage"
    payload = urllib.parse.urlencode({
        "chat_id": chat_id,
        "text": texto,
        "parse_mode": "Markdown"
    }).encode("utf-8")
    try:
        req = urllib.request.Request(url, data=payload, method="POST")
        with urllib.request.urlopen(req, timeout=10):
            pass
    except Exception as e:
        print(f"[Bot Erro] Envio de msg falhou: {e}", flush=True)

def enviar_documento(chat_id: str, file_path: str, caption: str = "") -> bool:
    url = f"https://api.telegram.org/bot{TOKEN}/sendDocument"
    boundary = "----WebKitFormBoundary" + secrets.token_hex(16)
    filename = os.path.basename(file_path)

    try:
        with open(file_path, "rb") as f:
            file_bytes = f.read()

        body = bytearray()
        # chat_id
        body.extend(f"--{boundary}\r\nContent-Disposition: form-data; name=\"chat_id\"\r\n\r\n{chat_id}\r\n".encode("utf-8"))
        # caption
        if caption:
            body.extend(f"--{boundary}\r\nContent-Disposition: form-data; name=\"caption\"\r\n\r\n{caption}\r\n".encode("utf-8"))
            body.extend(f"--{boundary}\r\nContent-Disposition: form-data; name=\"parse_mode\"\r\n\r\nMarkdown\r\n".encode("utf-8"))
        # document
        body.extend(f"--{boundary}\r\nContent-Disposition: form-data; name=\"document\"; filename=\"{filename}\"\r\nContent-Type: application/zip\r\n\r\n".encode("utf-8"))
        body.extend(file_bytes)
        body.extend(f"\r\n--{boundary}--\r\n".encode("utf-8"))

        req = urllib.request.Request(url, data=body, method="POST")
        req.add_header("Content-Type", f"multipart/form-data; boundary={boundary}")
        with urllib.request.urlopen(req, timeout=120) as resp:
            return resp.status == 200
    except Exception as e:
        print(f"[Bot Erro] Envio de arquivo falhou: {e}", flush=True)
        return False

def gerar_zip_banco() -> str:
    zip_path = os.path.join(BASE_DIR, "data", "futebol_moderadores.zip")
    with zipfile.ZipFile(zip_path, "w", compression=zipfile.ZIP_DEFLATED, compresslevel=6) as z:
        z.write(DB_LOCAL, arcname="futebol.db")
    return zip_path

def obter_status_sistema() -> str:
    ram_avail, ram_total, swap_free, swap_total = 0, 0, 0, 0
    if os.path.exists("/proc/meminfo"):
        try:
            with open("/proc/meminfo") as f:
                d = {l.split(":")[0].strip(): int(l.split(":")[1].strip().split()[0]) // 1024 for l in f if ":" in l}
                ram_avail = d.get("MemAvailable", 0)
                ram_total = d.get("MemTotal", 0)
                swap_free = d.get("SwapFree", 0)
                swap_total = d.get("SwapTotal", 0)
        except Exception:
            pass

    disk_free_gb = 0.0
    try:
        du = shutil.disk_usage("/")
        disk_free_gb = round(du.free / (1024 ** 3), 1)
    except Exception:
        pass

    db_size_mb = os.path.getsize(DB_LOCAL) / (1024 * 1024) if os.path.exists(DB_LOCAL) else 0

    # Total de partidas
    total_partidas, total_gols = 0, 0
    try:
        conn = sqlite3.connect(DB_LOCAL)
        c = conn.cursor()
        c.execute("SELECT count(*) FROM partidas")
        total_partidas = c.fetchone()[0]
        c.execute("SELECT count(*) FROM gols")
        total_gols = c.fetchone()[0]
        conn.close()
    except Exception:
        pass

    # Último commit
    ultimo_commit = "Não disponível"
    try:
        res = subprocess.run(["git", "log", "-n", "1", "--oneline"], cwd=BASE_DIR, capture_output=True, text=True)
        if res.returncode == 0:
            ultimo_commit = res.stdout.strip()
    except Exception:
        pass

    return (
        f"📊 *STATUS ATUAL DO SISTEMA*\n\n"
        f"⚽ *Banco de Dados*:\n"
        f"• Partidas: *{total_partidas:,}*\n"
        f"• Gols Catalogados: *{total_gols:,}*\n"
        f"• Tamanho do Banco: *{db_size_mb:.2f} MB*\n\n"
        f"🖥️ *Infraestrutura VM Oracle*:\n"
        f"• RAM Disponível: *{ram_avail} MB* / {ram_total} MB\n"
        f"• Swap Livre: *{swap_free} MB* / {swap_total} MB\n"
        f"• Disco Livre: *{disk_free_gb} GB*\n\n"
        f"🚀 *Último Commit*:\n`{ultimo_commit}`\n"
    )

def tratar_comando(chat_id: str, texto: str):
    cmd = texto.strip().split()[0].lower() if texto.strip() else ""

    # Permissão de moderador
    if str(chat_id) not in ADMIN_CHATS:
        notificar(chat_id, f"⛔ *Acesso Restrito*\nVocê não possui permissão de moderador.\nSeu Chat ID é: `{chat_id}`")
        return

    if cmd in ("/start", "/ajuda", "/help"):
        msg = (
            f"👋 *Olá, Moderador!*\n\n"
            f"Bem-vindo ao canal de controle do *Scrapper-BR*.\n\n"
            f"Comandos disponíveis:\n"
            f"📥 `/banco` - Baixa o banco SQLite compactado (`futebol.db.zip` ~17MB)\n"
            f"📊 `/status` - Exibe a saúde da VM e o total de partidas/gols\n"
            f"🌐 `/dashboard` - Link direto do painel web na Vercel\n"
            f"❓ `/ajuda` - Exibe esta mensagem\n"
        )
        notificar(chat_id, msg)

    elif cmd == "/status":
        notificar(chat_id, obter_status_sistema())

    elif cmd == "/dashboard":
        msg = (
            f"🌐 *Painel Web de Moderação e Scouts*\n\n"
            f"Acesse pelo navegador no celular ou computador:\n"
            f"{DASHBOARD_URL}\n\n"
            f"Navegue pelos jogos, confrontos, súmulas e artilheiros em tempo real sem precisar baixar nada."
        )
        notificar(chat_id, msg)

    elif cmd == "/banco":
        notificar(chat_id, "⏳ *Gerando pacote zip do banco de dados... Aguarde alguns instantes.*")
        try:
            zip_file = gerar_zip_banco()
            zip_mb = os.path.getsize(zip_file) / (1024 * 1024)
            legenda = (
                f"⚽ *Banco de Dados Oficial (SQLite)*\n\n"
                f"📦 Arquivo: `futebol.db`\n"
                f"💾 Tamanho comprimido: *{zip_mb:.2f} MB*\n"
                f"Para abrir no PC, utilize o programa gratuito *DB Browser for SQLite* ou *DBeaver*."
            )
            ok = enviar_documento(chat_id, zip_file, caption=legenda)
            if not ok:
                notificar(chat_id, "❌ Falha no envio do arquivo pelo Telegram. Tente novamente em instantes.")
        except Exception as e:
            notificar(chat_id, f"❌ Erro ao compactar banco: {e}")

    else:
        notificar(chat_id, "Comando não reconhecido. Digite `/ajuda` para ver os comandos.")

def iniciar_polling():
    if not TOKEN:
        print("[Bot Erro] TELEGRAM_BOT_TOKEN não configurado no .env!", flush=True)
        return

    print("=" * 60, flush=True)
    print("   BOT INTERATIVO DE MODERAÇÃO TELEGRAM INICIADO", flush=True)
    print(f"   Moderadores autorizados: {ADMIN_CHATS}", flush=True)
    print("=" * 60, flush=True)

    offset = 0
    while True:
        try:
            url = f"https://api.telegram.org/bot{TOKEN}/getUpdates?offset={offset}&timeout=25"
            req = urllib.request.Request(url)
            with urllib.request.urlopen(req, timeout=35) as resp:
                data = json.loads(resp.read().decode("utf-8"))

            if data.get("ok"):
                for item in data.get("result", []):
                    offset = item["update_id"] + 1
                    msg = item.get("message") or item.get("channel_post")
                    if msg and "text" in msg:
                        c_id = str(msg["chat"]["id"])
                        txt = msg["text"]
                        tratar_comando(c_id, txt)
        except Exception as e:
            time.sleep(3)

if __name__ == "__main__":
    iniciar_polling()
