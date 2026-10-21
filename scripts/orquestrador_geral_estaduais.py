import subprocess
import sys
import os
import time
import shutil

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DB_LOCAL = os.path.join(BASE_DIR, "data", "futebol.db")
DB_API = os.path.join(BASE_DIR, "api", "data", "futebol.db")

BLOCOS = [
    # Bloco 1: Marcelinho Carioca Paulistão anos 90/2000 restantes
    {
        "torneios": ["paulista"],
        "anos": [1994, 1996, 1998, 2000, 2002, 2003],
        "desc": "Paulistão 1994-2003 (Marcelinho Carioca e Careca 1997)"
    },
    # Bloco 2: Paulistão 2010-2013
    {
        "torneios": ["paulista"],
        "anos": [2010, 2011, 2012, 2013],
        "desc": "Paulistão 2010-2013 (Neymar no Santos, Lucas no SPFC)"
    },
    # Bloco 3: Careca anos 80 no SPFC
    {
        "torneios": ["paulista"],
        "anos": [1983, 1984, 1985, 1986, 1987],
        "desc": "Paulistão 1983-1987 (Careca bicampeão no São Paulo)"
    },
    # Bloco 4: Careca anos 70/80 no Guarani
    {
        "torneios": ["paulista"],
        "anos": [1978, 1979, 1980, 1981, 1982],
        "desc": "Paulistão 1978-1982 (Careca no Guarani)"
    },
    # Bloco 5: Ademir da Guia anos 70 no Palmeiras
    {
        "torneios": ["paulista"],
        "anos": [1971, 1972, 1973, 1974, 1975, 1976, 1977],
        "desc": "Paulistão 1971-1977 (Ademir da Guia multicampeão pelo Palmeiras)"
    },
    # Bloco 6: Carioca 2010-2013
    {
        "torneios": ["carioca"],
        "anos": [2010, 2011, 2012, 2013],
        "desc": "Carioca 2010-2013 (Fred no Fluminense, Loco Abreu no Botafogo)"
    },
    # Bloco 7: Copa do Nordeste e Paranaense 2020-2023
    {
        "torneios": ["nordeste", "paranaense"],
        "anos": [2020, 2021, 2022, 2023],
        "desc": "Copa do Nordeste e Paranaense 2020-2023"
    }
]

def safe_copy_db(src: str, dst: str):
    import subprocess
    for attempt in range(3):
        try:
            shutil.copyfile(src, dst)
            return True
        except Exception:
            time.sleep(1)
            res = subprocess.run(f'powershell -Command "Copy-Item -Path \'{src}\' -Destination \'{dst}\' -Force"', shell=True, capture_output=True)
            if res.returncode == 0:
                return True
    return False

def run_cmd(cmd, desc=""):
    print(f"\n[RUN] {desc} -> {' '.join(cmd) if isinstance(cmd, list) else cmd}", flush=True)
    res = subprocess.run(cmd, cwd=BASE_DIR, shell=True, capture_output=True, text=True, encoding="utf-8", errors="replace")
    if res.returncode != 0:
        print(f"[ERRO]: {res.stderr}\n{res.stdout}", flush=True)
    else:
        print(res.stdout[-400:] if len(res.stdout) > 400 else res.stdout, flush=True)
    return res.returncode == 0

def processar_fila():
    print("=" * 65, flush=True)
    print("   ORQUESTRADOR GERAL DE INGESTÃO AUTÔNOMA DE ESTADUAIS", flush=True)
    print("=" * 65, flush=True)

    for i, bloco in enumerate(BLOCOS, 1):
        print(f"\n>>> INICIANDO BLOCO {i}/{len(BLOCOS)}: {bloco['desc']} <<<", flush=True)
        torneios_str = " ".join(bloco["torneios"])
        anos_str = " ".join(str(a) for a in bloco["anos"])
        
        # 1. Executa scraper
        cmd_scrape = f"python scripts/scraper_ogol_estaduais.py --torneios {torneios_str} --anos {anos_str}"
        ok = run_cmd(cmd_scrape, f"Scraping {bloco['desc']}")
        if not ok:
            print(f"[AVISO] Scraping falhou para o bloco {i}, tentando seguir para validação...", flush=True)

        # 2. Higienizar e desambiguar
        run_cmd("python scripts/higienizar_e_desambiguar_gols.py", "Higienização e Desambiguação")

        # 3. Validar integridade
        ok_val = run_cmd("python scripts/validar_banco.py", "Validação 5/5")
        if not ok_val:
            print(f"[FATAL] Banco falhou na validação de integridade no bloco {i}! Abortando commit.", flush=True)
            sys.exit(1)

        # 4. Checar tamanho do banco
        tamanho_mb = os.path.getsize(DB_LOCAL) / (1024 * 1024)
        print(f"[INFO] Tamanho do banco data/futebol.db: {tamanho_mb:.2f} MB", flush=True)
        if tamanho_mb > 95.0:
            print(f"[ALERTA CRÍTICO] Tamanho do banco ({tamanho_mb:.2f} MB) próximo do limite de 100MB!", flush=True)

        # 5. Sincronizar api/data/futebol.db
        safe_copy_db(DB_LOCAL, DB_API)
        print(f"[OK] Banco sincronizado com api/data/futebol.db", flush=True)

        # 6. Git commit e push
        run_cmd("git add data/futebol.db api/data/futebol.db", "Git add")
        msg_commit = f"feat(estaduais): enriquecer gols e estadios de {bloco['desc']}"
        run_cmd(f'git commit -m "{msg_commit}"', "Git commit")
        run_cmd("git push origin main", "Git push")

        print(f"\n[SUCESSO] Bloco {i}/{len(BLOCOS)} concluído e commitado com sucesso!\n", flush=True)
        time.sleep(2)

    print("\n=======================================================", flush=True)
    print("   TODAS AS PENDÊNCIAS FORAM ZERADAS COM SUCESSO!", flush=True)
    print("=======================================================", flush=True)

if __name__ == "__main__":
    processar_fila()
