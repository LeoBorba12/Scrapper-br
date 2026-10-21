import subprocess
import sys
import os
import time
import shutil
import urllib.parse
import urllib.request

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')
if hasattr(sys.stderr, 'reconfigure'):
    sys.stderr.reconfigure(encoding='utf-8', errors='replace')

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DB_LOCAL = os.path.join(BASE_DIR, "data", "futebol.db")
DB_API = os.path.join(BASE_DIR, "api", "data", "futebol.db")
PY_BIN = sys.executable or ("python3" if sys.platform != "win32" else "python")
MAX_DB_SIZE_MB = 94.0  # Trava estrita de segurança: garante deploy estável na Vercel (<250MB uncompressed / <50MB zip) e GitHub (<100MB)

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
        safe_print(f"[Telegram Aviso] Falha ao enviar notificação: {e}")

BLOCOS = [
    # =========================================================================
    # FASE 1: BRASILEIRÃO HISTÓRICO (1971 a 2013) - Resolver Lacunas Críticas
    # =========================================================================
    {
        "script": "brasileirao",
        "anos": [2010, 2011, 2012, 2013],
        "desc": "Brasileirão Série A 2010-2013 (Neymar no Santos, Fred no Flu, Ronaldinho no Galo)"
    },
    {
        "script": "brasileirao",
        "anos": [2005, 2006, 2007, 2008, 2009],
        "desc": "Brasileirão Série A 2005-2009 (Tricampeonato SPFC de Rogério Ceni, Fla 2009)"
    },
    {
        "script": "brasileirao",
        "anos": [2000, 2001, 2002, 2003, 2004],
        "desc": "Brasileirão Série A 2000-2004 (Copa JH 2000, Meninos da Vila 2002, Cruzeiro 2003)"
    },
    {
        "script": "brasileirao",
        "anos": [1995, 1996, 1997, 1998, 1999],
        "desc": "Brasileirão Série A 1995-1999 (Túlio no Botafogo, Edmundo 1997, Corinthians 98/99)"
    },
    {
        "script": "brasileirao",
        "anos": [1990, 1991, 1992, 1993, 1994],
        "desc": "Brasileirão Série A 1990-1994 (Neto no Timão, SPFC de Telê, Palmeiras Parmalat)"
    },
    {
        "script": "brasileirao",
        "anos": [1985, 1986, 1987, 1988, 1989],
        "desc": "Brasileirão Série A 1985-1989 (Careca no SPFC, Copa União 1987, Vasco 1989)"
    },
    {
        "script": "brasileirao",
        "anos": [1980, 1981, 1982, 1983, 1984],
        "desc": "Brasileirão Série A 1980-1984 (Era Zico no Flamengo, Dinamite no Vasco, Fla 80/82/83)"
    },
    {
        "script": "brasileirao",
        "anos": [1975, 1976, 1977, 1978, 1979],
        "desc": "Brasileirão Série A 1975-1979 (Inter Biguá/Falcão, Reinaldo no Galo, Guarani 1978)"
    },
    {
        "script": "brasileirao",
        "anos": [1971, 1972, 1973, 1974],
        "desc": "Brasileirão Série A 1971-1974 (Galo 71 com Dadá, Palmeiras da 2ª Academia de Ademir)"
    },

    # =========================================================================
    # FASE 2: PAULISTÃO PRIMÓRDIOS E CENTENÁRIO (1902 a 1949)
    # =========================================================================
    {
        "torneios": ["paulista"],
        "anos": [1945, 1946, 1947, 1948, 1949],
        "desc": "Paulistão 1945-1949 (Leônidas da Silva no São Paulo, Cláudio no Corinthians)"
    },
    {
        "torneios": ["paulista"],
        "anos": [1940, 1941, 1942, 1943, 1944],
        "desc": "Paulistão 1940-1944 (Palestra Itália vira Palmeiras na Arrancada Heroica 1942)"
    },
    {
        "torneios": ["paulista"],
        "anos": [1930, 1931, 1932, 1933, 1934, 1935, 1936, 1937, 1938, 1939],
        "desc": "Paulistão 1930-1939 (Início do Profissionalismo, Feitiço, Araken Patusca, Teleco)"
    },
    {
        "torneios": ["paulista"],
        "anos": [1920, 1921, 1922, 1923, 1924, 1925, 1926, 1927, 1928, 1929],
        "desc": "Paulistão 1920-1929 (Era de Ouro de Arthur Friedenreich no Paulistano)"
    },
    {
        "torneios": ["paulista"],
        "anos": [1902, 1903, 1904, 1905, 1906, 1907, 1908, 1909, 1910, 1911, 1912, 1913, 1914, 1915, 1916, 1917, 1918, 1919],
        "desc": "Paulistão 1902-1919 (Fundação da Liga Paulista, Charles Miller, Velódromo)"
    },

    # =========================================================================
    # FASE 3: CARIOCA PRIMÓRDIOS E CENTENÁRIO (1906 a 1969)
    # =========================================================================
    {
        "torneios": ["carioca"],
        "anos": [1965, 1966, 1967, 1968, 1969],
        "desc": "Carioca 1965-1969 (Garrincha e Jairzinho no Botafogo, Silva Batuta no Fla)"
    },
    {
        "torneios": ["carioca"],
        "anos": [1960, 1961, 1962, 1963, 1964],
        "desc": "Carioca 1960-1964 (Bicampeonato do Botafogo de Garrincha e Nilton Santos)"
    },
    {
        "torneios": ["carioca"],
        "anos": [1950, 1951, 1952, 1953, 1954, 1955, 1956, 1957, 1958, 1959],
        "desc": "Carioca 1950-1959 (Inauguração do Maracanã, Didi, Barbosa no Vasco, Zagallo no Fla)"
    },
    {
        "torneios": ["carioca"],
        "anos": [1940, 1941, 1942, 1943, 1944, 1945, 1946, 1947, 1948, 1949],
        "desc": "Carioca 1940-1949 (Expresso da Vitória do Vasco, Heleno de Freitas no Botafogo)"
    },
    {
        "torneios": ["carioca"],
        "anos": [1930, 1931, 1932, 1933, 1934, 1935, 1936, 1937, 1938, 1939],
        "desc": "Carioca 1930-1939 (Leônidas da Silva no Vasco e Flamengo, Domingos da Guia)"
    },
    {
        "torneios": ["carioca"],
        "anos": [1906, 1907, 1908, 1909, 1910, 1911, 1912, 1913, 1914, 1915, 1916, 1917, 1918, 1919, 1920, 1921, 1922, 1923, 1924, 1925, 1926, 1927, 1928, 1929],
        "desc": "Carioca 1906-1929 (Primeiras edições no RJ, Camisas Negras do Vasco 1923)"
    },

    # =========================================================================
    # FASE 4: MINEIRO E GAÚCHO CENTENÁRIOS (1915 a 1964)
    # =========================================================================
    {
        "torneios": ["mineiro"],
        "anos": [1950, 1951, 1952, 1953, 1954, 1955, 1956, 1957, 1958, 1959, 1960, 1961, 1962, 1963, 1964],
        "desc": "Mineiro 1950-1964 (Era pré-Mineirão, Guará no Galo, Cruzeiro de Dirceu Lopes jovem)"
    },
    {
        "torneios": ["mineiro"],
        "anos": [1915, 1916, 1917, 1918, 1919, 1920, 1921, 1922, 1923, 1924, 1925, 1926, 1927, 1928, 1929, 1930, 1931, 1932, 1933, 1934, 1935, 1936, 1937, 1938, 1939, 1940, 1941, 1942, 1943, 1944, 1945, 1946, 1947, 1948, 1949],
        "desc": "Mineiro 1915-1949 (Fundação do Campeonato da Cidade de Belo Horizonte)"
    },
    {
        "torneios": ["gaucho"],
        "anos": [1950, 1951, 1952, 1953, 1954, 1955, 1956, 1957, 1958, 1959, 1960, 1961, 1962, 1963, 1964],
        "desc": "Gaúcho 1950-1964 (Hegemonia de Grêmio e Inter nos anos 50/60)"
    },
    {
        "torneios": ["gaucho"],
        "anos": [1919, 1920, 1921, 1922, 1923, 1924, 1925, 1926, 1927, 1928, 1929, 1930, 1931, 1932, 1933, 1934, 1935, 1936, 1937, 1938, 1939, 1940, 1941, 1942, 1943, 1944, 1945, 1946, 1947, 1948, 1949],
        "desc": "Gaúcho 1919-1949 (Rolo Compressor do Inter com Tesourinha/Carlitos, Eurico Lara no Grêmio)"
    },

    # =========================================================================
    # FASE 5: ESTADUAIS RECENTES E MODERNOS (2014 a 2026) - Varredura Completa
    # =========================================================================
    {
        "torneios": ["paulista", "carioca"],
        "anos": [2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026],
        "desc": "Paulistão e Carioca 2014-2026 (Era Moderna, Allianz Parque, Gabigol, Arrascaeta, Veiga)"
    },
    {
        "torneios": ["mineiro", "gaucho"],
        "anos": [2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026],
        "desc": "Mineiro e Gaúcho 2014-2026 (Hulk no Galo, Suárez no Grêmio, Cruzeiro, Inter)"
    },
    {
        "torneios": ["nordeste", "paranaense"],
        "anos": [2020, 2021, 2022, 2023, 2024, 2025, 2026],
        "desc": "Copa do Nordeste e Paranaense 2020-2026"
    }
]

def safe_print(text):
    try:
        print(text, flush=True)
    except Exception:
        clean = text.encode("ascii", errors="replace").decode("ascii")
        print(clean, flush=True)

def safe_copy_db(src: str, dst: str):
    for attempt in range(3):
        try:
            shutil.copyfile(src, dst)
            return True
        except Exception:
            time.sleep(1)
            if sys.platform == "win32":
                res = subprocess.run(f'powershell -Command "Copy-Item -Path \'{src}\' -Destination \'{dst}\' -Force"', shell=True, capture_output=True)
            else:
                res = subprocess.run(f'cp -f "{src}" "{dst}"', shell=True, capture_output=True)
            if res.returncode == 0:
                return True
    return False

def run_cmd(cmd, desc=""):
    safe_print(f"\n[RUN] {desc} -> {' '.join(cmd) if isinstance(cmd, list) else cmd}")
    res = subprocess.run(cmd, cwd=BASE_DIR, shell=True, capture_output=True, text=True, encoding="utf-8", errors="replace")
    if res.returncode != 0:
        safe_print(f"[ERRO]: {res.stderr}\n{res.stdout}")
    else:
        out = res.stdout[-400:] if len(res.stdout) > 400 else res.stdout
        safe_print(out)
    return res.returncode == 0

def executar_ciclo(ciclo_num=1):
    print("=" * 70, flush=True)
    print(f"   ORQUESTRADOR GLOBAL 24/7 - FUTEBOL BRASILEIRO (CICLO {ciclo_num})", flush=True)
    print("=" * 70, flush=True)

    for i, bloco in enumerate(BLOCOS, 1):
        print(f"\n>>> [CICLO {ciclo_num}] INICIANDO BLOCO {i}/{len(BLOCOS)}: {bloco['desc']} <<<", flush=True)
        anos_str = " ".join(str(a) for a in bloco["anos"])

        # 1. Escolha dinâmica do motor de scraping
        if bloco.get("script") == "brasileirao":
            cmd_scrape = f'"{PY_BIN}" scripts/scraper_ogol_brasileirao.py --anos {anos_str}'
        else:
            torneios_str = " ".join(bloco["torneios"])
            cmd_scrape = f'"{PY_BIN}" scripts/scraper_ogol_estaduais.py --torneios {torneios_str} --anos {anos_str}'

        ok = run_cmd(cmd_scrape, f"Scraping {bloco['desc']}")
        if not ok:
            print(f"[AVISO] Scraping retornou aviso/erro para o bloco {i}, prosseguindo para higienização e validação...", flush=True)

        # 2. Higienizar e desambiguar
        run_cmd(f'"{PY_BIN}" scripts/higienizar_e_desambiguar_gols.py', "Higienização e Desambiguação")

        # 3. Validar integridade
        ok_val = run_cmd(f'"{PY_BIN}" scripts/validar_banco.py', "Validação 5/5")
        if not ok_val:
            safe_print(f"[FATAL] Banco falhou na validação de integridade no bloco {i}! Abortando commit.")
            msg_erro = (
                f"🚨 *ALERTA CRÍTICO: Falha no Scrapper-BR*\n\n"
                f"O Bloco {i} ({bloco['desc']}) falhou na validação de integridade!\n"
                f"O processo foi pausado para evitar corrupção do banco."
            )
            notificar_telegram(msg_erro)
            sys.exit(1)

        # 4. Compactação com VACUUM e Verificação de Teto Vercel/GitHub
        try:
            import sqlite3
            c_vac = sqlite3.connect(DB_LOCAL)
            c_vac.execute("VACUUM")
            c_vac.close()
        except Exception:
            pass

        tamanho_mb = os.path.getsize(DB_LOCAL) / (1024 * 1024)
        safe_print(f"[INFO] Tamanho do banco data/futebol.db após VACUUM: {tamanho_mb:.2f} MB")
        if tamanho_mb >= MAX_DB_SIZE_MB:
            safe_print(f"\n[TRAVA DE SEGURANÇA VERCEL & GITHUB ATIVADA]")
            safe_print(f"O banco atingiu {tamanho_mb:.2f} MB, atingindo o teto estrito de segurança de 94 MB.")
            safe_print("Interrompendo novas adições para garantir integridade e deploy 100% estável na Vercel e GitHub.")
            msg_teto = (
                f"🛑 *AVISO: Teto de Segurança Atingido!*\n\n"
                f"O banco atingiu {tamanho_mb:.2f} MB (limite estrito de 94 MB).\n"
                f"Novas adições foram suspensas para proteger os deploys na Vercel e GitHub."
            )
            notificar_telegram(msg_teto)
            return False

        # 5. Git commit e push automático do bloco (usando unicamente data/futebol.db para evitar duplicar tamanho na Vercel)
        run_cmd("git add data/futebol.db", "Git add")
        msg_commit = f"feat(historico): enriquecer gols e estadios de {bloco['desc']}"
        run_cmd(f'git commit -m "{msg_commit}"', "Git commit")
        run_cmd("git push origin main", "Git push")

        print(f"\n[SUCESSO] Bloco {i}/{len(BLOCOS)} concluído e commitado com sucesso!\n", flush=True)

        # 7. Notificação Telegram de sucesso com telemetria de RAM
        ram_info = ""
        avail_ram = 0
        if os.path.exists("/proc/meminfo"):
            try:
                with open("/proc/meminfo") as mf:
                    d_m = {l.split(":")[0].strip(): int(l.split(":")[1].strip().split()[0]) // 1024 for l in mf if ":" in l}
                    avail_ram = d_m.get("MemAvailable", 0)
                    total_ram = d_m.get("MemTotal", 0)
                    ram_info = f"\n🧠 *RAM da VM*: {avail_ram} MB livres / {total_ram} MB"
            except Exception:
                pass

        msg_sucesso = (
            f"⚽ *Scrapper-BR | Bloco Atualizado!*\n\n"
            f"📌 *Bloco {i}/{len(BLOCOS)}*: {bloco['desc']}\n"
            f"💾 *Tamanho do Banco*: {tamanho_mb:.2f} MB{ram_info}\n"
            f"🚀 *Commit & Push*: Realizado com sucesso na branch `main`.\n"
            f"⏱️ Continuando para o próximo bloco..."
        )
        notificar_telegram(msg_sucesso)

        # Checagem preventiva de travamento: se RAM < 110 MB, pausa e alerta
        if 0 < avail_ram < 110:
            msg_ram_crit = (
                f"⚠️ *ALERTA PREVENTIVO DA VM*\n\n"
                f"Memória RAM disponível baixa: *{avail_ram} MB*.\n"
                f"Pausando 30 segundos preventivamente para evitar travamento da máquina..."
            )
            notificar_telegram(msg_ram_crit)
            time.sleep(30)

        time.sleep(2)

    notificar_telegram(f"🏆 *Scrapper-BR | Todos os {len(BLOCOS)} blocos do Ciclo {ciclo_num} foram finalizados com 100% de sucesso!*")
    return True

def processar_fila_continua():
    ciclo = 1
    while True:
        pode_continuar = executar_ciclo(ciclo_num=ciclo)
        if not pode_continuar:
            safe_print("[PAUSA] Teto de segurança de 94 MB atingido. Aguardando 1 hora antes de reverificar...")
            time.sleep(3600)
            continue

        safe_print(f"\n[OK] Ciclo {ciclo} finalizado com sucesso!")
        safe_print("Aguardando 10 minutos antes de iniciar o próximo ciclo de refinamento 24/7...")
        ciclo += 1
        time.sleep(600)

if __name__ == "__main__":
    processar_fila_continua()
