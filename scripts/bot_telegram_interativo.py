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

def notificar(chat_id: str, texto: str, reply_markup: dict = None):
    url = f"https://api.telegram.org/bot{TOKEN}/sendMessage"
    dados = {
        "chat_id": chat_id,
        "text": texto,
        "parse_mode": "Markdown"
    }
    if reply_markup:
        dados["reply_markup"] = json.dumps(reply_markup)
    payload = urllib.parse.urlencode(dados).encode("utf-8")
    try:
        req = urllib.request.Request(url, data=payload, method="POST")
        with urllib.request.urlopen(req, timeout=10):
            pass
    except Exception as e:
        # Fallback sem markdown caso haja caracteres não escapados
        try:
            dados_puros = {"chat_id": chat_id, "text": texto}
            if reply_markup:
                dados_puros["reply_markup"] = json.dumps(reply_markup)
            payload_puro = urllib.parse.urlencode(dados_puros).encode("utf-8")
            req_puro = urllib.request.Request(url, data=payload_puro, method="POST")
            with urllib.request.urlopen(req_puro, timeout=10):
                pass
        except Exception as e2:
            print(f"[Bot Erro] Envio de msg falhou: {e} | Fallback falhou: {e2}", flush=True)

def responder_callback(callback_id: str, texto: str = ""):
    url = f"https://api.telegram.org/bot{TOKEN}/answerCallbackQuery"
    dados = {"callback_query_id": callback_id}
    if texto:
        dados["text"] = texto
    payload = urllib.parse.urlencode(dados).encode("utf-8")
    try:
        req = urllib.request.Request(url, data=payload, method="POST")
        with urllib.request.urlopen(req, timeout=5):
            pass
    except Exception:
        pass

TECLADO_INLINE_MENU = {
    "inline_keyboard": [
        [
            {"text": "📊 Status VM", "callback_data": "/status"},
            {"text": "🎯 Sniper OCI", "callback_data": "/sniper"}
        ],
        [
            {"text": "⚽ Últimos Jogos", "callback_data": "/ultimos"},
            {"text": "💾 Baixar Banco", "callback_data": "/banco"}
        ],
        [
            {"text": "🌐 Abrir FutStats Web", "url": DASHBOARD_URL}
        ]
    ]
}
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

def obter_ultimos_jogos() -> str:
    """Retorna os últimos jogos inseridos na base."""
    if not os.path.exists(DB_LOCAL):
        return "❌ Banco de dados não encontrado."
    try:
        conn = sqlite3.connect(f"file:{DB_LOCAL}?mode=ro", uri=True)
        c = conn.cursor()
        c.execute("SELECT data, campeonato, mandante, gols_mandante, gols_visitante, visitante FROM partidas ORDER BY id_partida DESC LIMIT 5;")
        rows = c.fetchall()
        conn.close()
        if not rows:
            return "Nenhuma partida encontrada."
        linhas = ["🕒 *ÚLTIMAS PARTIDAS REGISTRADAS NA BASE:*\n"]
        for r in rows:
            dt, camp, mand, gm, gv, vis = r
            linhas.append(f"• *{dt}* [{camp}]\n  *{mand}* {gm} x {gv} *{vis}*")
        return "\n\n".join(linhas)
    except Exception as e:
        return f"❌ Erro ao consultar últimas partidas: {e}"

# runaway-guard: Travas de custo e quota para o Bot Telegram
MAX_BOT_AI_CALLS_PER_HOUR = 20
_HISTORICO_BOT_AI = []

def pode_chamar_ia_bot():
    agora = time.time()
    global _HISTORICO_BOT_AI
    _HISTORICO_BOT_AI = [t for t in _HISTORICO_BOT_AI if agora - t < 3600]
    return len(_HISTORICO_BOT_AI) < MAX_BOT_AI_CALLS_PER_HOUR

# cost contract (runaway-guard):
#   provider: Google Gemini 2.5 Flash
#   unit cost: ~$0.075 / 1M input tokens, ~$0.30 / 1M output tokens
#   max calls per run: 2 (1 text-to-sql + 1 sintese Telegram)
#   max tokens per call: 250 output tokens
#   max calls per hour: 20 chamadas (cap rígido via _HISTORICO_BOT_AI)
#   provider hard cap: Google AI Studio Dashboard Budget Cap
#   timeout: 8s
def responder_pergunta_banco(pergunta: str) -> str:
    """Responde a perguntas livres do moderador consultando o banco SQLite via IA ou SQL heurístico."""
    pergunta_clean = pergunta[:300].strip()
    gemini_key = os.getenv("GEMINI_API_KEY", "").strip()

    # 1. Se houver chave Gemini e cota disponível, usar Text-to-SQL seguro
    if gemini_key and pode_chamar_ia_bot():
        _HISTORICO_BOT_AI.append(time.time())
        try:
            schema_desc = (
                "Tabelas disponíveis em SQLite:\n"
                "1. partidas(id_partida, data, ano, campeonato, mandante, visitante, gols_mandante, gols_visitante, estadio, arbitro, rodada)\n"
                "2. gols(id_gol, id_partida, clube, atleta, minuto, tempo, tipo_de_gol, id_jogador)\n"
                "3. jogadores(id_jogador, nome_exibicao, nome_completo, posicao, clubes, total_jogos, total_gols, total_assistencias)\n"
                "4. estatisticas_partidas(partida_id, time, chutes, chutes_a_gol, faltas, escanteios, posse, amarelos, vermelhos)\n"
                "5. odds_partidas(partida_id, odd_mandante, odd_empate, odd_visitante, mercado_over25, mercado_btts)"
            )
            prompt = (
                f"Você é o assistente de dados do projeto FutStats.\n{schema_desc}\n\n"
                f"O moderador perguntou: \"{pergunta_clean}\"\n\n"
                "Gere EXCLUSIVAMENTE uma query SQLite de leitura (SELECT) para responder à pergunta.\n"
                "PROIBIDO: DROP, DELETE, INSERT, UPDATE, ALTER, ATTACH.\n"
                "Retorne JSON estrito: {\"sql\": \"SELECT ...\"}"
            )
            url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={gemini_key}"
            headers = {"Content-Type": "application/json"}
            payload = {
                "contents": [{"parts": [{"text": prompt}]}],
                "generationConfig": {"temperature": 0.1, "maxOutputTokens": 200, "responseMimeType": "application/json"}
            }
            req = urllib.request.Request(url, data=json.dumps(payload).encode("utf-8"), headers=headers)
            with urllib.request.urlopen(req, timeout=12) as resp:
                res_data = json.loads(resp.read().decode("utf-8"))
                sql_json = json.loads(res_data["candidates"][0]["content"]["parts"][0]["text"])
                sql_query = sql_json.get("sql", "").strip()

            # Execução segura em modo somente leitura
            if sql_query and sql_query.upper().startswith("SELECT"):
                conn = sqlite3.connect(f"file:{DB_LOCAL}?mode=ro", uri=True, timeout=8)
                c = conn.cursor()
                c.execute(sql_query)
                res_rows = c.fetchall()[:10]  # Limita a 10 linhas
                conn.close()

                # Formatação da resposta final pelo modelo
                prompt_resp = (
                    f"Pergunta do usuário: '{pergunta_clean}'\n"
                    f"Query executada: `{sql_query}`\n"
                    f"Resultados obtidos: {res_rows}\n\n"
                    "Escreva uma resposta concisa, clara e amigável em Markdown para o Telegram resumindo os dados."
                )
                payload_resp = {
                    "contents": [{"parts": [{"text": prompt_resp}]}],
                    "generationConfig": {"temperature": 0.3, "maxOutputTokens": 300}
                }
                req2 = urllib.request.Request(url, data=json.dumps(payload_resp).encode("utf-8"), headers=headers)
                with urllib.request.urlopen(req2, timeout=12) as resp2:
                    ans_data = json.loads(resp2.read().decode("utf-8"))
                    return ans_data["candidates"][0]["content"]["parts"][0]["text"].strip()
        except Exception as e:
            print(f"[Bot IA Erro]: {e}", flush=True)

    # 2. Fallback Heurístico direto no banco (sem depender de chave de IA)
    p_lower = pergunta_clean.lower()
    try:
        conn = sqlite3.connect(f"file:{DB_LOCAL}?mode=ro", uri=True)
        c = conn.cursor()

        # Pergunta de contagem ou tamanho
        if any(w in p_lower for w in ["quantos jogos", "total de partidas", "partidas catalogadas", "total de jogos"]):
            c.execute("SELECT count(*) FROM partidas;")
            total = c.fetchone()[0]
            conn.close()
            return f"⚽ Temos atualmente *{total:,}* partidas oficiais catalogadas no banco de dados."

        if any(w in p_lower for w in ["gols", "artilheiro", "artilheiros", "mais gols"]):
            c.execute("SELECT atleta, count(*) as total FROM gols GROUP BY atleta ORDER BY total DESC LIMIT 5;")
            rows = c.fetchall()
            conn.close()
            if rows:
                txt = "👑 *TOP 5 ARTILHEIROS NO BANCO:*\n"
                for i, (atleta, g) in enumerate(rows, 1):
                    txt += f"{i}. *{atleta}*: {g} gols\n"
                return txt

        # Busca por clube específico
        clubes_comuns = ["flamengo", "palmeiras", "corinthians", "são paulo", "sao paulo", "santos", "vasco", "fluminense", "botafogo", "grêmio", "gremio", "internacional", "cruzeiro", "atlético", "atletico", "bahia", "fortaleza", "sport", "vitória", "vitoria"]
        for clube in clubes_comuns:
            if clube in p_lower:
                c.execute("SELECT count(*) FROM partidas WHERE mandante LIKE ? OR visitante LIKE ?;", (f"%{clube}%", f"%{clube}%"))
                cnt = c.fetchone()[0]
                c.execute("SELECT count(*) FROM partidas WHERE (mandante LIKE ? AND gols_mandante > gols_visitante) OR (visitante LIKE ? AND gols_visitante > gols_mandante);", (f"%{clube}%", f"%{clube}%"))
                vitorias = c.fetchone()[0]
                conn.close()
                return f"🛡️ *Registros do {clube.title()}*:\n• Total de Partidas: *{cnt:,}*\n• Vitórias Registradas: *{vitorias:,}*"

        conn.close()
    except Exception as e:
        return f"❌ Erro ao consultar base: {e}"

    return (
        f"🤖 Entendido! Recebi sua pergunta: *\"{pergunta_clean}\"*.\n\n"
        "💡 _Dica: Para análises profundas com raciocínio de IA, certifique-se de que a `GEMINI_API_KEY` está ativa no `.env`. Enquanto isso, você pode perguntar sobre clubes, artilheiros ou usar `/status` e `/ultimos`._"
    )

def obter_status_sniper() -> str:
    """Coleta o status em tempo real do OCI Sniper na VM."""
    sniper_log_path = "/home/opc/sniper.log"
    sucesso_log_path = "/home/opc/sucesso.log"
    
    # 1. Verificar se houve sucesso
    if os.path.exists(sucesso_log_path):
        return (
            "🎉 *SUCESSO ABSOLUTO! A MÁQUINA AMPERE FOI CAPTURADA!* 🎉\n\n"
            "A VM da Oracle Cloud foi provisionada com sucesso!\n"
            "Verifique o console da Oracle Cloud para os detalhes de IP e acesso."
        )

    # 2. Verificar se o processo sniper.sh está rodando
    ativo = False
    pid = "N/D"
    try:
        res = subprocess.run(["ps", "aux"], capture_output=True, text=True)
        for line in res.stdout.splitlines():
            if "sniper.sh" in line and "grep" not in line:
                ativo = True
                parts = line.split()
                if len(parts) > 1:
                    pid = parts[1]
                break
    except Exception:
        pass

    # 3. Ler as últimas linhas do sniper.log
    ultima_tentativa = "Nenhum registro encontrado"
    if os.path.exists(sniper_log_path):
        try:
            with open(sniper_log_path, "r", encoding="utf-8", errors="ignore") as f:
                linhas = f.readlines()
                for l in reversed(linhas):
                    l_str = l.strip()
                    if "Tentativa #" in l_str or "Rate limit" in l_str:
                        ultima_tentativa = l_str
                        break
        except Exception:
            pass

    status_icone = "🟢 *Ativo e Caçando 24/7*" if ativo else "🔴 *Inativo / Parado*"

    return (
        f"🎯 *STATUS DO OCI SNIPER (ORACLE CLOUD)*\n\n"
        f"• Estado: {status_icone} (PID `{pid}`)\n"
        f"• Datacenter: `SA-SAOPAULO-1 (São Paulo)`\n\n"
        f"🎯 *Alvos Monitorados:*\n"
        f"1. 🥇 4 OCPUs / 24 GB RAM (Teto Máximo Grátis)\n"
        f"2. 🥈 2 OCPUs / 12 GB RAM\n"
        f"3. 🥉 1 OCPU / 6 GB RAM (Alta Chance)\n\n"
        f"🕒 *Último Registro do Sniper:*\n"
        f"`{ultima_tentativa}`\n\n"
        f"💡 _O sniper tenta os 3 alvos a cada ~60s com jitter automático e avisará você imediatamente no Telegram assim que a máquina for provisionada._"
    )

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

    if cmd in ("/start", "/ajuda", "/help", "/menu"):
        msg = (
            f"👋 *Olá, Moderador!*\n\n"
            f"Bem-vindo ao canal de controle do *FutStats / Scrapper-BR*.\n\n"
            f"Toque em um dos botões abaixo ou envie sua pergunta diretamente:\n"
        )
        notificar(chat_id, msg, reply_markup=TECLADO_INLINE_MENU)
    elif cmd == "/sniper":
        notificar(chat_id, obter_status_sniper())

    elif cmd in ("/status", "/saude"):
        notificar(chat_id, obter_status_sistema())

    elif cmd == "/ultimos":
        notificar(chat_id, obter_ultimos_jogos())

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

    elif cmd == "/perguntar" or not cmd.startswith("/"):
        pergunta = texto[len("/perguntar"):].strip() if cmd == "/perguntar" else texto.strip()
        if not pergunta:
            notificar(chat_id, "❓ Digite sua pergunta após `/perguntar` ou envie diretamente o texto.")
            return
        notificar(chat_id, "🔍 *Consultando base de dados...*")
        resposta = responder_pergunta_banco(pergunta)
        notificar(chat_id, resposta)

    else:
        notificar(chat_id, "Comando não reconhecido. Digite `/ajuda` para ver os comandos ou faça sua pergunta diretamente.")

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
                    cb = item.get("callback_query")
                    if cb:
                        cb_id = str(cb.get("id"))
                        cb_msg = cb.get("message", {})
                        cb_chat_id = str(cb_msg.get("chat", {}).get("id"))
                        cb_data = cb.get("data", "")
                        print(f"[Bot Telegram] Botão clicado: '{cb_data}' por {cb_chat_id}", flush=True)
                        responder_callback(cb_id, f"Ação: {cb_data}")
                        tratar_comando(cb_chat_id, cb_data)
                        continue

                    msg = item.get("message") or item.get("channel_post")
                    if msg and "text" in msg:
                        c_id = str(msg["chat"]["id"])
                        txt = msg["text"]
                        print(f"[Bot Telegram] Mensagem recebida: '{txt}' de {c_id}", flush=True)
                        tratar_comando(c_id, txt)
        except Exception as e:
            print(f"[Bot Polling Erro]: {e}", flush=True)
            time.sleep(3)

if __name__ == "__main__":
    iniciar_polling()
