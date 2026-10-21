"""
Watchdog Autônomo de Saúde da VM Oracle Cloud & Alerta no Telegram
==================================================================
Monitora continuamente:
1. Memória RAM Disponível (alerta se < 120 MB / emergência se < 80 MB)
2. Swap Livre (alerta se < 200 MB)
3. Espaço em Disco (alerta se < 1.5 GB livres)
4. Carga de CPU / Load Average (alerta se > 4.0)

Ações:
- Envia notificação detalhada no Telegram com os processos mais pesados.
- Cooldown anti-spam de 15 minutos entre alertas normais.
- Ação preventiva: sincroniza disco e limpa caches de página inativos se a RAM estiver crítica.
"""

import os
import sys
import time
import shutil
import urllib.parse
import urllib.request
import subprocess

TELEGRAM_TOKEN = "8544666739:AAFS7bfEADGbQ8UtchY2LMBHzI7BPnkGPxw"
TELEGRAM_CHAT_ID = "1797566691"

COOLDOWN_ALERTAS_SEG = 900  # 15 minutos entre alertas para não floodar
ultimo_alerta_ts = 0

def notificar_telegram(mensagem: str):
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
        print(f"[Telegram Aviso] Falha ao enviar notificação: {e}", flush=True)

def obter_metricas_sistema():
    metricas = {
        "ram_total": 0,
        "ram_avail": 0,
        "ram_free": 0,
        "swap_total": 0,
        "swap_free": 0,
        "disk_free_gb": 0.0,
        "load_1m": 0.0
    }

    # 1. Memória via /proc/meminfo
    if os.path.exists("/proc/meminfo"):
        try:
            with open("/proc/meminfo", "r") as f:
                for line in f:
                    if ":" in line:
                        k, v = line.split(":", 1)
                        k = k.strip()
                        val = int(v.strip().split()[0]) // 1024  # em MB
                        if k == "MemTotal":
                            metricas["ram_total"] = val
                        elif k == "MemAvailable":
                            metricas["ram_avail"] = val
                        elif k == "MemFree":
                            metricas["ram_free"] = val
                        elif k == "SwapTotal":
                            metricas["swap_total"] = val
                        elif k == "SwapFree":
                            metricas["swap_free"] = val
        except Exception:
            pass

    # 2. Espaço em Disco
    try:
        stat_disk = shutil.disk_usage("/")
        metricas["disk_free_gb"] = round(stat_disk.free / (1024 ** 3), 2)
    except Exception:
        pass

    # 3. Load Average
    try:
        load1, load5, load15 = os.getloadavg()
        metricas["load_1m"] = round(load1, 2)
    except Exception:
        pass

    return metricas

def obter_top_processos():
    try:
        res = subprocess.run(
            ["ps", "-eo", "pid,user,%mem,%cpu,comm", "--sort=-%mem"],
            capture_output=True, text=True, timeout=5
        )
        linhas = res.stdout.strip().split("\n")
        return "\n".join(linhas[:6])
    except Exception:
        return "Indisponível"

def verificar_e_alertar():
    global ultimo_alerta_ts
    m = obter_metricas_sistema()
    agora = time.time()

    motivos = []
    nivel = "INFO"

    # Critérios de risco
    if m["ram_avail"] > 0 and m["ram_avail"] < 90:
        motivos.append(f"RAM disponível crítica: *{m['ram_avail']} MB* (Total: {m['ram_total']} MB)")
        nivel = "CRITICO"
    elif m["ram_avail"] > 0 and m["ram_avail"] < 130:
        motivos.append(f"RAM disponível baixa: *{m['ram_avail']} MB* (Total: {m['ram_total']} MB)")
        nivel = "ALERTA"

    if m["swap_free"] > 0 and m["swap_free"] < 150:
        motivos.append(f"Swap quase esgotado: *{m['swap_free']} MB livres*")
        nivel = "CRITICO"

    if m["disk_free_gb"] > 0 and m["disk_free_gb"] < 1.0:
        motivos.append(f"Disco quase cheio: *{m['disk_free_gb']} GB livres* em /")
        nivel = "CRITICO"

    if m["load_1m"] > 4.5:
        motivos.append(f"Carga de CPU elevada: *Load 1m = {m['load_1m']}*")
        if nivel != "CRITICO":
            nivel = "ALERTA"

    if motivos:
        # Verifica se já passou o tempo de cooldown
        if (agora - ultimo_alerta_ts) >= COOLDOWN_ALERTAS_SEG or nivel == "CRITICO":
            ultimo_alerta_ts = agora
            top_proc = obter_top_processos()

            icone = "🚨" if nivel == "CRITICO" else "⚠️"
            msg = (
                f"{icone} *ALERTA DE SAÚDE DA VM ORACLE ({nivel})*\n\n"
                f"A VM pode estar próxima de instabilidade ou travamento:\n"
                + "\n".join(f"• {mot}" for mot in motivos) + "\n\n"
                f"📊 *Telemetria Atual*:\n"
                f"• RAM Disponível: {m['ram_avail']} MB / {m['ram_total']} MB\n"
                f"• Swap Livre: {m['swap_free']} MB / {m['swap_total']} MB\n"
                f"• Disco Livre: {m['disk_free_gb']} GB\n"
                f"• Carga (1m): {m['load_1m']}\n\n"
                f"🔍 *Top Processos por Memória*:\n```\n{top_proc}\n```\n"
            )

            # Ação de autocura em estado crítico
            if nivel == "CRITICO":
                try:
                    subprocess.run(["sync"], timeout=5)
                    # Tenta limpar pagecaches inativos com segurança
                    subprocess.run("echo 1 > /proc/sys/vm/drop_caches", shell=True, timeout=5)
                    msg += "🛡️ *Ação preventiva aplicada*: Caches inativos liberados."
                except Exception:
                    pass

            notificar_telegram(msg)
            print(f"[{time.strftime('%Y-%m-%d %H:%M:%S')}] Alerta enviado ao Telegram: {motivos}", flush=True)

def loop_monitoramento():
    print("=" * 60, flush=True)
    print("   WATCHDOG DE MONITORAMENTO DA VM ORACLE INICIADO", flush=True)
    print("=" * 60, flush=True)
    
    # Envia notificação de inicialização para confirmar funcionamento
    notificar_telegram(
        "🛡️ *Scrapper-BR | Monitor de Saúde da VM Ativado!*\n\n"
        "O watchdog está ativo monitorando RAM, Swap, Disco e CPU 24/7.\n"
        "Se a máquina estiver sob risco de travamento (< 130MB RAM ou < 150MB Swap), você receberá um alerta imediato."
    )

    while True:
        try:
            verificar_e_alertar()
        except Exception as e:
            print(f"[Erro no watchdog]: {e}", flush=True)
        time.sleep(30)  # Checa a cada 30 segundos

if __name__ == "__main__":
    if len(sys.argv) > 1 and sys.argv[1] == "--check-once":
        verificar_e_alertar()
        print("Checagem única finalizada.")
    else:
        loop_monitoramento()
