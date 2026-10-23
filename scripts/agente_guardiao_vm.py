#!/usr/bin/env python3
"""
agente_guardiao_vm.py - Guardião Autônomo 24/7 da VM (FutStats / Scrapper-BR)
-----------------------------------------------------------------------------
Funções principais:
1. Monitorar saúde dos processos de raspagem (orquestrador_mestre_24x7.py, etc.)
2. Auditoria e Sanidade do Banco de Dados SQLite (tamanho < 94 MB, integridade, anomalias)
3. Auditoria de Memória RAM e Disco da VM (alerta se RAM livre < 150 MB ou Disco < 1 GB)
4. Diagnóstico inteligente via Google Gemini Flash (quando GEMINI_API_KEY estiver configurada)
5. Notificações automáticas no Telegram em caso de desvios ou resumo diário
6. Política estrita ANTI-DATA-LOSS (somente leitura e otimizações não-destrutivas como VACUUM/ANALYZE)
"""

import os
import sys
import time
import json
import sqlite3
import shutil
import subprocess
import urllib.request
import urllib.parse
from datetime import datetime

# Diretório base do projeto
BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
DB_PATH = os.path.join(BASE_DIR, "banco_futebol.db")
ENV_FILE = os.path.join(BASE_DIR, ".env")
LOG_FILE = os.path.join(BASE_DIR, "guardiao_vm.log")
SCRAPING_LOG = os.path.join(BASE_DIR, "scraping.log")

# Limites rígidos de segurança
MAX_DB_SIZE_MB = 94.0
MIN_AVAILABLE_RAM_MB = 150.0
MIN_FREE_DISK_GB = 1.0
INTERVALO_SEGUNDOS = 1200  # 20 minutos entre verificações


def carregar_env():
    """Carrega variáveis do arquivo .env sem expor chaves no log."""
    env_vars = {}
    if os.path.exists(ENV_FILE):
        with open(ENV_FILE, "r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith("#") and "=" in line:
                    k, v = line.split("=", 1)
                    env_vars[k.strip()] = v.strip().strip("'\"")
    return env_vars


def log(msg):
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    linha = f"[{timestamp}] [GUARDIÃO] {msg}"
    print(linha)
    try:
        with open(LOG_FILE, "a", encoding="utf-8") as f:
            f.write(linha + "\n")
    except Exception:
        pass


def enviar_telegram(msg, env_vars):
    """Envia alerta ou relatório formatado para o Telegram configurado."""
    bot_token = env_vars.get("TELEGRAM_BOT_TOKEN")
    chat_id = env_vars.get("TELEGRAM_CHAT_ID")
    if not bot_token or not chat_id:
        return False
    try:
        url = f"https://api.telegram.org/bot{bot_token}/sendMessage"
        payload = {
            "chat_id": chat_id,
            "text": msg,
            "parse_mode": "HTML",
            "disable_web_page_preview": True
        }
        data = json.dumps(payload).encode("utf-8")
        req = urllib.request.Request(url, data=data, headers={"Content-Type": "application/json"})
        with urllib.request.urlopen(req, timeout=10) as resp:
            return resp.status == 200
    except Exception as e:
        log(f"Falha ao enviar Telegram: {e}")
        return False


def obter_telemetria_sistema():
    """Coleta métricas da VM (RAM, Swap, Disco) de forma ultraleve."""
    telemetria = {
        "ram_total_mb": 0,
        "ram_livre_mb": 0,
        "ram_usada_mb": 0,
        "disco_livre_gb": 0,
        "alerta_ram": False,
        "alerta_disco": False
    }
    
    # Leitura direta do /proc/meminfo (gasta zero subprocessos no Linux)
    if os.path.exists("/proc/meminfo"):
        try:
            mem = {}
            with open("/proc/meminfo", "r") as f:
                for line in f:
                    parts = line.split(":")
                    if len(parts) == 2:
                        k = parts[0].strip()
                        v = parts[1].strip().split()[0]
                        mem[k] = int(v)
            total = mem.get("MemTotal", 0) / 1024.0
            avail = mem.get("MemAvailable", mem.get("MemFree", 0)) / 1024.0
            telemetria["ram_total_mb"] = round(total, 1)
            telemetria["ram_livre_mb"] = round(avail, 1)
            telemetria["ram_usada_mb"] = round(total - avail, 1)
            if avail < MIN_AVAILABLE_RAM_MB:
                telemetria["alerta_ram"] = True
        except Exception as e:
            log(f"Erro ao ler /proc/meminfo: {e}")
            
    # Disco livre (compatível cross-platform Linux e Windows)
    try:
        usage = shutil.disk_usage(BASE_DIR)
        livre_gb = usage.free / (1024 ** 3)
        telemetria["disco_livre_gb"] = round(livre_gb, 2)
        if livre_gb < MIN_FREE_DISK_GB:
            telemetria["alerta_disco"] = True
    except Exception as e:
        log(f"Erro ao ler disco: {e}")

    return telemetria


def verificar_processos():
    """Verifica se os daemons críticos da VM estão ativos."""
    status = {
        "orquestrador_ativo": False,
        "sidecar_ativo": False,
        "bot_telegram_ativo": False,
        "pids": {}
    }
    try:
        out = subprocess.check_output(["ps", "aux"], text=True)
        for line in out.splitlines():
            if "orquestrador_mestre_24x7.py" in line and "grep" not in line and "python" in line:
                status["orquestrador_ativo"] = True
                parts = line.split()
                if len(parts) > 1:
                    status["pids"]["orquestrador"] = parts[1]
            if "server.js" in line and "nuvio-sidecar" in line:
                status["sidecar_ativo"] = True
            if "bot_telegram_interativo.py" in line and "grep" not in line:
                status["bot_telegram_ativo"] = True
    except Exception as e:
        log(f"Erro ao verificar processos: {e}")
    return status


def auditar_banco_dados():
    """Auditoria estrita e não-destrutiva de integridade e tamanho do SQLite."""
    relatorio = {
        "tamanho_mb": 0.0,
        "integridade_ok": False,
        "total_partidas": 0,
        "total_gols": 0,
        "alerta_tamanho": False,
        "erro": None
    }
    if not os.path.exists(DB_PATH):
        relatorio["erro"] = "Arquivo banco_futebol.db não encontrado!"
        return relatorio

    tamanho_mb = os.path.getsize(DB_PATH) / (1024 * 1024)
    relatorio["tamanho_mb"] = round(tamanho_mb, 2)
    if tamanho_mb > MAX_DB_SIZE_MB:
        relatorio["alerta_tamanho"] = True

    try:
        conn = sqlite3.connect(f"file:{DB_PATH}?mode=ro", uri=True, timeout=10)
        c = conn.cursor()
        c.execute("PRAGMA integrity_check;")
        res = c.fetchone()
        relatorio["integridade_ok"] = (res and res[0] == "ok")

        c.execute("SELECT count(*) FROM partidas;")
        relatorio["total_partidas"] = c.fetchone()[0]

        # Verificar se tabela de gols existe
        c.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='gols_detalhados';")
        if c.fetchone():
            c.execute("SELECT count(*) FROM gols_detalhados;")
            relatorio["total_gols"] = c.fetchone()[0]

        conn.close()
    except Exception as e:
        relatorio["erro"] = str(e)

    return relatorio


def analisar_com_gemini(resumo_auditoria, gemini_key):
    """Consulta o modelo Gemini 2.5 Flash via API REST para emitir parecer técnico."""
    if not gemini_key:
        return None
    try:
        prompt = (
            "Você é o Guardião de Engenharia da VM do projeto FutStats. "
            "Avalie o seguinte relatório de saúde operacional em JSON e retorne uma avaliação "
            "sucinta (máximo 3 frases) com status (ESTÁVEL/ATENÇÃO/CRÍTICO) e se recomenda alguma ação preventiva:\n\n"
            f"{json.dumps(resumo_auditoria, indent=2)}"
        )
        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={gemini_key}"
        headers = {"Content-Type": "application/json"}
        payload = {
            "contents": [{"parts": [{"text": prompt}]}],
            "generationConfig": {"temperature": 0.2, "maxOutputTokens": 200}
        }
        req = urllib.request.Request(url, data=json.dumps(payload).encode("utf-8"), headers=headers)
        with urllib.request.urlopen(req, timeout=15) as resp:
            data = json.loads(resp.read().decode("utf-8"))
            return data["candidates"][0]["content"]["parts"][0]["text"].strip()
    except Exception as e:
        log(f"Falha ao consultar Gemini Flash: {e}")
        return None


def ciclo_verificacao(env_vars, forcar_telegram=False):
    """Executa um ciclo completo de auditoria da VM."""
    log("Iniciando ciclo de auditoria operacional...")
    telemetria = obter_telemetria_sistema()
    processos = verificar_processos()
    banco = auditar_banco_dados()

    resumo = {
        "timestamp": datetime.now().isoformat(),
        "telemetria": telemetria,
        "processos": processos,
        "banco": banco
    }

    # Analisar com IA se chave existir
    gemini_key = env_vars.get("GEMINI_API_KEY")
    parecer_ia = analisar_com_gemini(resumo, gemini_key)
    if parecer_ia:
        log(f"Parecer Gemini Flash: {parecer_ia}")

    # Verificar necessidades de alerta
    alertas = []
    if telemetria.get("alerta_ram"):
        alertas.append(f"⚠️ <b>RAM Crítica:</b> Restam apenas {telemetria['ram_livre_mb']} MB disponíveis.")
    if telemetria.get("alerta_disco"):
        alertas.append(f"⚠️ <b>Disco Quase Cheio:</b> Restam {telemetria['disco_livre_gb']} GB livres.")
    if not processos.get("orquestrador_ativo"):
        alertas.append("🚨 <b>Orquestrador Parado:</b> orquestrador_mestre_24x7.py não foi encontrado no ps aux!")
    if banco.get("alerta_tamanho"):
        alertas.append(f"⚠️ <b>Alerta de Tamanho DB:</b> {banco['tamanho_mb']} MB (Limite Vercel: {MAX_DB_SIZE_MB} MB).")
    if not banco.get("integridade_ok"):
        alertas.append(f"🚨 <b>Corrupção Detectada no Banco:</b> {banco.get('erro') or 'Falha de integridade'}")

    log(f"Status do Ciclo: RAM Livre={telemetria['ram_livre_mb']}MB | DB={banco['tamanho_mb']}MB ({banco['total_partidas']} jogos) | Orquestrador={'ON' if processos['orquestrador_ativo'] else 'OFF'}")

    # Notificar Telegram em caso de desvio crítico ou forçado
    if alertas or forcar_telegram:
        msg_corpo = "\n".join(alertas) if alertas else "✅ <b>Todos os sistemas e pipelines operando em perfeita harmonia.</b>"
        msg = (
            f"🛡️ <b>[Guardião FutStats 24/7]</b>\n"
            f"🕒 <i>{datetime.now().strftime('%d/%m/%Y %H:%M:%S')}</i>\n\n"
            f"{msg_corpo}\n\n"
            f"📊 <b>Resumo Técnico:</b>\n"
            f"• Partidas Catalogadas: <b>{banco['total_partidas']}</b>\n"
            f"• Tamanho do SQLite: <b>{banco['tamanho_mb']} MB</b> (Teto: 94 MB)\n"
            f"• Memória VM: <b>{telemetria['ram_usada_mb']}MB / {telemetria['ram_total_mb']}MB</b>\n"
            f"• Orquestrador: <b>{'🟢 Ativo' if processos['orquestrador_ativo'] else '🔴 Inativo'}</b>"
        )
        if parecer_ia:
            msg += f"\n\n🤖 <b>Análise de IA (Gemini Flash):</b>\n<i>{parecer_ia}</i>"

        enviar_telegram(msg, env_vars)


def main():
    log("=====================================================")
    log("Iniciando Agente Guardião da VM em modo 24/7...")
    log(f"Intervalo programado: {INTERVALO_SEGUNDOS // 60} minutos")
    log("=====================================================")

    env_vars = carregar_env()
    # Executa o primeiro ciclo imediatamente com confirmação no Telegram
    ciclo_verificacao(env_vars, forcar_telegram=True)

    # Loop 24/7 de baixo consumo
    while True:
        try:
            time.sleep(INTERVALO_SEGUNDOS)
            env_vars = carregar_env()
            ciclo_verificacao(env_vars, forcar_telegram=False)
        except KeyboardInterrupt:
            log("Guardião finalizado pelo operador.")
            break
        except Exception as e:
            log(f"Erro inesperado no loop do Guardião: {e}")
            time.sleep(60)


if __name__ == "__main__":
    main()
