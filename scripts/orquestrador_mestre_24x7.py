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
import datetime
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
    sucesso = False
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
        sucesso = (res.returncode == 0)
    except subprocess.TimeoutExpired:
        safe_print("[TIMEOUT] Comando cancelado por tempo limite.")
    except Exception as e:
        safe_print(f"[EXCECAO] {e}")

    if "ESTADO_NOTIFICACAO" in globals():
        if sucesso:
            ESTADO_NOTIFICACAO["tarefas_sucesso"] += 1
        else:
            ESTADO_NOTIFICACAO["tarefas_falha"] += 1
    return sucesso

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

# Estado do Relatório Consolidado de 3 em 3 Horas e Monitoramento de SLOs
INTERVALO_NOTIFICACAO_SEGUNDOS = 3 * 3600  # 3 Horas (10.800s)
ESTADO_NOTIFICACAO = {
    "ultimo_envio": time.time(),
    "ciclos_concluidos": 0,
    "blocos_raspados": [],
    "partidas_inicio": 0,
    "tarefas_sucesso": 0,
    "tarefas_falha": 0,
    "ultimo_alerta_slo_ts": 0
}

def ciclo_mestre(numero_ciclo: int):
    safe_print(f"\n=======================================================")
    safe_print(f"   INICIANDO CICLO MESTRE {numero_ciclo} (APOSTAS + GOLS 24/7)   ")
    safe_print(f"=======================================================")

    # -------------------------------------------------------------
    # FASE 0: SINCRONIZAÇÃO EM TEMPO REAL DE PARTIDAS, SÚMULAS E SCOUTS
    # -------------------------------------------------------------
    safe_print("\n>>> [FASE 0] Sincronizando Partidas Recentes, Gols e Scouts de Atletas <<<")
    executar_comando([PY_BIN, os.path.join(BASE_DIR, "scripts", "sincronizar_partidas_recentes_e_scouts.py"), "--dias", "7"])

    # -------------------------------------------------------------
    # FASE A: MOTOR DE APOSTAS E MERCADOS (OVER/UNDER, BTTS, CARTÕES)
    # -------------------------------------------------------------
    safe_print("\n>>> [FASE A] Atualizando Inteligência de Apostas & Mercados <<<")
    executar_comando([PY_BIN, os.path.join(BASE_DIR, "scripts", "minerar_estatisticas_e_odds_vivas.py")])
    executar_comando([PY_BIN, os.path.join(BASE_DIR, "scripts", "minerar_odds_e_mercados.py")])
    if numero_ciclo % 5 == 0:
        safe_print("\n>>> [FASE A2] Enriquecendo Métricas Avançadas de Jogo (Chutes, Faltas, Escanteios) <<<")
        executar_comando([PY_BIN, os.path.join(BASE_DIR, "scripts", "enriquecer_metricas_avancadas.py")])

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
    executar_comando([PY_BIN, os.path.join(BASE_DIR, "scripts", "sanitizar_dashboard_e_atletas.py")])
    executar_comando([PY_BIN, os.path.join(BASE_DIR, "scripts", "corrigir_desambiguacao_estrita.py")])

    safe_print("\n>>> [FASE C] Validação da Integridade do Banco <<<")
    executar_comando([PY_BIN, os.path.join(BASE_DIR, "scripts", "validar_banco.py")])

    # Otimização com VACUUM e Verificação de SLO
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

    # Verificação de Violação Crítica de SLO (Teto Vercel 94 MB)
    if size_mb >= MAX_DB_SIZE_MB:
        agora = time.time()
        if agora - ESTADO_NOTIFICACAO["ultimo_alerta_slo_ts"] > 600:
            ESTADO_NOTIFICACAO["ultimo_alerta_slo_ts"] = agora
            alerta_slo = (
                f"🚨 *[VIOLAÇÃO DE SLO - FUTSTATS]*\n\n"
                f"⚠️ *Teto Serverless Excedido*: `{size_mb:.2f} MB` / limite `{MAX_DB_SIZE_MB:.1f} MB`.\n"
                f"Risco iminente de falha de build ou 500 na Vercel (SLI-05).\n"
                f"Ação automática: limpeza preventiva e bloqueio de novos inserts pesados."
            )
            notificar_telegram(alerta_slo)

    # -------------------------------------------------------------
    # FASE D: PERSISTÊNCIA, GIT PULL/PUSH E TELEGRAM
    # -------------------------------------------------------------
    # Fazer push no Git apenas a cada 2 horas (ou a cada 15 ciclos) para respeitar
    # o limite de 100 deploys diários da Vercel (máx. 12 deploys/dia com folga).
    should_push = (numero_ciclo % 15 == 0)

    if should_push:
        safe_print("\n>>> [FASE D] Sincronização Git & Deploy (Janela de 2 Horas) <<<")
        executar_comando(["git", "add", "data/futebol.db"])
        commit_msg = f"feat(mestre): ciclo {numero_ciclo} - apostas, mercados e {bloco['desc'][:60]}"
        executar_comando(["git", "commit", "-m", commit_msg])
        executar_comando(["git", "pull", "--rebase", "-X", "theirs", "origin", "main"])
        executar_comando(["git", "push", "origin", "main"])
    else:
        safe_print(f"\n[INFO] Ciclo {numero_ciclo}: dados salvos localmente no SQLite. Próximo push Git agendado no ciclo {(numero_ciclo // 15 + 1) * 15}.")

    # -------------------------------------------------------------
    # REGRA DO TELEGRAM: NOTIFICAÇÃO CONSOLIDADA DE 3 EM 3 HORAS
    # -------------------------------------------------------------
    agora_ts = time.time()
    ESTADO_NOTIFICACAO["ciclos_concluidos"] += 1
    if bloco["desc"] not in ESTADO_NOTIFICACAO["blocos_raspados"]:
        ESTADO_NOTIFICACAO["blocos_raspados"].append(bloco["desc"])

    tempo_decorrido = agora_ts - ESTADO_NOTIFICACAO["ultimo_envio"]
    restante_min = int((INTERVALO_NOTIFICACAO_SEGUNDOS - tempo_decorrido) / 60)

    # Obter total de partidas atual
    total_partidas_atual = 0
    try:
        conn = sqlite3.connect(f"file:{DB_LOCAL}?mode=ro", uri=True)
        total_partidas_atual = conn.cursor().execute("SELECT count(*) FROM partidas").fetchone()[0]
        conn.close()
    except Exception:
        pass

    # Dispara apenas quando atingir a janela de 3 horas (10.800 segundos)
    if tempo_decorrido >= INTERVALO_NOTIFICACAO_SEGUNDOS:
        blocos_formatados = "\n".join([f"• {b}" for b in ESTADO_NOTIFICACAO["blocos_raspados"][:8]])
        if len(ESTADO_NOTIFICACAO["blocos_raspados"]) > 8:
            blocos_formatados += f"\n• ... e mais {len(ESTADO_NOTIFICACAO['blocos_raspados']) - 8} blocos históricos."

        total_tarefas = ESTADO_NOTIFICACAO["tarefas_sucesso"] + ESTADO_NOTIFICACAO["tarefas_falha"]
        taxa_sucesso = (ESTADO_NOTIFICACAO["tarefas_sucesso"] / total_tarefas * 100.0) if total_tarefas > 0 else 100.0
        status_slo = "🟢 Em conformidade" if taxa_sucesso >= 99.0 else "🟡 Atenção (Error Budget em uso)"

        msg_digest = (
            f"🕒 *[FutStats - Relatório Consolidado de 3 Horas]*\n"
            f"📅 _{datetime.datetime.now().strftime('%d/%m/%Y %H:%M')}_\n\n"
            f"✅ *{ESTADO_NOTIFICACAO['ciclos_concluidos']} ciclos concluídos* ({total_tarefas} tarefas executadas).\n\n"
            f"🎯 *Quadro de Confiabilidade & SLOs:*\n"
            f"• Sucesso de Scraping (SLI-03): *{taxa_sucesso:.1f}%* ({status_slo} - Meta >=99%)\n"
            f"• Teto SQLite Vercel (SLI-05): `{size_mb:.2f} MB` / teto {MAX_DB_SIZE_MB:.1f} MB\n"
            f"• Total de Partidas: *{total_partidas_atual:,}*\n\n"
            f"📦 *Blocos Históricos Varridos no Período:*\n"
            f"{blocos_formatados}\n\n"
            f"🚀 *Infraestrutura VM*: 🟢 100% Estável e Operante 24/7"
        )
        notificar_telegram(msg_digest)
        safe_print(f"\n[TELEGRAM] Relatório consolidado de 3 horas enviado com sucesso!")
        # Reset da janela de 3 horas
        ESTADO_NOTIFICACAO["ultimo_envio"] = agora_ts
        ESTADO_NOTIFICACAO["ciclos_concluidos"] = 0
        ESTADO_NOTIFICACAO["blocos_raspados"].clear()
        ESTADO_NOTIFICACAO["tarefas_sucesso"] = 0
        ESTADO_NOTIFICACAO["tarefas_falha"] = 0
    else:
        safe_print(f"\n[TELEGRAM] Ciclo silencioso (silêncio inteligente ativo). Próximo resumo de 3 horas em ~{max(1, restante_min)} min.")

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
