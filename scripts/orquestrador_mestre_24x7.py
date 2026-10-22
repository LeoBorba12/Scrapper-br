# -*- coding: utf-8 -*-
"""
orquestrador_mestre_24x7.py
Orquestrador Mestre Autônomo e Híbrido do FutStats:
- Alterna entre enriquecimento analítico de apostas/odds (Over/Under, BTTS, cartões)
  e a varredura histórica profunda de gols, estádios, cartões e árbitros (1902-2026).
- Trava de segurança de 94 MB para compatibilidade rigorosa com a Vercel.
- Notificações automáticas no Telegram via bot integrado.
- Projetado para execução contínua (24/7 daemon) na Oracle Cloud VM.
"""

import subprocess
import sys
import os
import time
import urllib.parse
import urllib.request
import sqlite3

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')
if hasattr(sys.stderr, 'reconfigure'):
    sys.stderr.reconfigure(encoding='utf-8', errors='replace')

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DB_LOCAL = os.path.join(BASE_DIR, "data", "futebol.db")
PY_BIN = sys.executable or ("python3" if sys.platform != "win32" else "python")
MAX_DB_SIZE_MB = 94.0

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
TELEGRAM_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN", "")
TELEGRAM_CHAT_ID = os.getenv("TELEGRAM_CHAT_ID", "")

def safe_print(msg: str):
    print(msg, flush=True)

def notificar_telegram(mensagem: str):
    if not TELEGRAM_TOKEN or not TELEGRAM_CHAT_ID:
        return
    url = f"https://api.telegram.org/bot{TELEGRAM_TOKEN}/sendMessage"
    payload = urllib.parse.urlencode({
        "chat_id": TELEGRAM_CHAT_ID,
        "text": mensagem,
        "parse_mode": "Markdown"
    }).encode("utf-8")
    try:
        req = urllib.request.Request(url, data=payload, method="POST")
        with urllib.request.urlopen(req, timeout=10) as response:
            pass
    except Exception as e:
        safe_print(f"[Telegram Aviso] Falha ao enviar notificação: {e}")

def get_db_size_mb() -> float:
    if os.path.exists(DB_LOCAL):
        return os.path.getsize(DB_LOCAL) / (1024 * 1024)
    return 0.0

def executar_comando(cmd_list, timeout=300):
    safe_print(f"\n[RUN] {' '.join(cmd_list)}")
    try:
        res = subprocess.run(
            cmd_list,
            cwd=BASE_DIR,
            timeout=timeout,
            capture_output=True,
            text=True,
            encoding='utf-8',
            errors='replace'
        )
        if res.stdout:
            safe_print(res.stdout[-600:])
        if res.returncode != 0 and res.stderr:
            safe_print(f"[ERRO] {res.stderr[-400:]}")
        return res.returncode == 0
    except subprocess.TimeoutExpired:
        safe_print("[TIMEOUT] Comando cancelado por tempo limite.")
        return False
    except Exception as e:
        safe_print(f"[EXCECAO] {e}")
        return False

BLOCOS_HISTORICOS = [
    # 1. Pré-1971 Nacional (Taça Brasil e Robertão)
    {
        "script": "scraper_ogol_brasileirao.py",
        "anos": [1959, 1960, 1961, 1962, 1963, 1964, 1965, 1966, 1967, 1968, 1969, 1970],
        "desc": "Taça Brasil & Robertão 1959-1970 (Santos de Pelé, Botafogo de Garrincha, Palmeiras)"
    },
    # 2. Paulistão Histórico
    {
        "script": "scraper_ogol_estaduais.py",
        "torneios": ["paulista"],
        "anos": [1902, 1910, 1915, 1920, 1925, 1930, 1935, 1940, 1945, 1950, 1955, 1960, 1965],
        "desc": "Paulistão Histórico 1902-1969 (Origens do Futebol Paulista, Friedenreich, Pelé)"
    },
    # 3. Carioca Histórico
    {
        "script": "scraper_ogol_estaduais.py",
        "torneios": ["carioca"],
        "anos": [1906, 1910, 1915, 1920, 1923, 1930, 1940, 1945, 1950, 1955, 1960, 1965],
        "desc": "Carioca Histórico 1906-1969 (Camisas Negras do Vasco, Maracanã, Garrincha, Didi)"
    },
    # 4. Gaúcho & Mineiro Históricos
    {
        "script": "scraper_ogol_estaduais.py",
        "torneios": ["gaucho", "mineiro"],
        "anos": [1915, 1920, 1930, 1940, 1950, 1960, 1970],
        "desc": "Mineiro & Gaúcho Históricos (Rolo Compressor, Eurico Lara, Tostão no Galo/Cruzeiro)"
    },
    # 5. Copa Libertadores & Copa do Brasil
    {
        "script": "scraper_ogol_estaduais.py",
        "torneios": ["nordeste", "paranaense"],
        "anos": [1994, 1997, 1999, 2000, 2001, 2002, 2003, 2010, 2015, 2020, 2024],
        "desc": "Copa do Nordeste & Paranaense Históricos"
    }
]

def ciclo_mestre(numero_ciclo: int):
    safe_print(f"\n=======================================================")
    safe_print(f"   INICIANDO CICLO MESTRE {numero_ciclo} (APOSTAS + GOLS 24/7)   ")
    safe_print(f"=======================================================")

    # -------------------------------------------------------------
    # FASE A: MOTOR DE APOSTAS E MERCADOS (OVER/UNDER, BTTS, CARTÕES)
    # -------------------------------------------------------------
    safe_print("\n>>> [FASE A] Atualizando Inteligência de Apostas & Mercados <<<")
    executar_comando([PY_BIN, os.path.join(BASE_DIR, "scripts", "minerar_odds_e_mercados.py")])

    # -------------------------------------------------------------
    # FASE B: VARREDURA HISTÓRICA DE SÚMULAS (1 BLOCO POR CICLO)
    # -------------------------------------------------------------
    bloco_idx = (numero_ciclo - 1) % len(BLOCOS_HISTORICOS)
    bloco = BLOCOS_HISTORICOS[bloco_idx]
    safe_print(f"\n>>> [FASE B] Varredura Histórica: {bloco['desc']} <<<")

    cmd_hist = [PY_BIN, os.path.join(BASE_DIR, "scripts", bloco["script"])]
    if "torneios" in bloco:
        cmd_hist.extend(["--torneios"] + bloco["torneios"])
    if "anos" in bloco:
        cmd_hist.extend(["--anos"] + [str(a) for a in bloco["anos"]])

    executar_comando(cmd_hist, timeout=400)

    # -------------------------------------------------------------
    # FASE C: HIGIENIZAÇÃO, DESAMBIGUAÇÃO E VALIDAÇÃO
    # -------------------------------------------------------------
    safe_print("\n>>> [FASE C] Higienização e Desambiguação de Gols <<<")
    executar_comando([PY_BIN, os.path.join(BASE_DIR, "scripts", "higienizar_e_desambiguar_gols.py")])

    safe_print("\n>>> [FASE C] Validação da Integridade do Banco <<<")
    executar_comando([PY_BIN, os.path.join(BASE_DIR, "scripts", "validar_banco.py")])

    # Otimização com VACUUM
    size_mb = get_db_size_mb()
    safe_print(f"\n[INFO] Tamanho do banco data/futebol.db: {size_mb:.2f} MB")

    if size_mb > 88.0:
        safe_print("[AVISO] Executando VACUUM para manter tamanho otimizado (<94 MB)...")
        try:
            conn = sqlite3.connect(DB_LOCAL)
            conn.execute("VACUUM")
            conn.close()
            size_mb = get_db_size_mb()
            safe_print(f"[INFO] Tamanho pós-VACUUM: {size_mb:.2f} MB")
        except Exception as e:
            safe_print(f"[VACUUM Falha] {e}")

    # -------------------------------------------------------------
    # FASE D: PERSISTÊNCIA, GIT PULL/PUSH E TELEGRAM
    # -------------------------------------------------------------
    safe_print("\n>>> [FASE D] Sincronização Git & Deploy <<<")
    executar_comando(["git", "add", "data/futebol.db"])
    commit_msg = f"feat(mestre): ciclo {numero_ciclo} - apostas, mercados e {bloco['desc'][:60]}"
    executar_comando(["git", "commit", "-m", commit_msg])
    executar_comando(["git", "pull", "--rebase", "origin", "main"])
    executar_comando(["git", "push", "origin", "main"])

    # Notificar Telegram
    notificar_telegram(
        f"⚽ *FutStats - Ciclo Mestre {numero_ciclo} Concluído!*\n"
        f"📊 *Mercados Atualizados*: Over/Under 1.5, 2.5, BTTS e Cartões de Árbitros\n"
        f"🏛️ *Varredura Histórica*: {bloco['desc']}\n"
        f"💾 *Tamanho DB*: `{size_mb:.2f} MB` / limite 94 MB\n"
        f"🚀 *Status*: Ativo 24/7 na Oracle Cloud VM"
    )

    safe_print(f"\n[OK] Ciclo Mestre {numero_ciclo} finalizado com sucesso!")

def main():
    safe_print("=" * 60)
    safe_print("   INICIANDO ORQUESTRADOR MESTRE FUTSTATS 24/7 (ORACLE VM)   ")
    safe_print("=" * 60)
    ciclo = 1
    while True:
        try:
            ciclo_mestre(ciclo)
            ciclo += 1
            safe_print("\nAguardando 8 minutos antes do próximo ciclo analítico...")
            time.sleep(480)
        except KeyboardInterrupt:
            safe_print("\n[PARADA MANUAL] Orquestrador interrompido pelo usuário.")
            break
        except Exception as e:
            safe_print(f"\n[ERRO INESPERADO NO LOOP] {e}")
            time.sleep(60)

if __name__ == "__main__":
    main()
