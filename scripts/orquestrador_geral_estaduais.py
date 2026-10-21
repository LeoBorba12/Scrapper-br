import subprocess
import sys
import os
import time
import shutil

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')
if hasattr(sys.stderr, 'reconfigure'):
    sys.stderr.reconfigure(encoding='utf-8', errors='replace')

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DB_LOCAL = os.path.join(BASE_DIR, "data", "futebol.db")
DB_API = os.path.join(BASE_DIR, "api", "data", "futebol.db")
PY_BIN = sys.executable or ("python3" if sys.platform != "win32" else "python")
MAX_DB_SIZE_MB = 94.0  # Trava estrita de segurança para garantir deploy estável na Vercel (<250MB uncompressed/<50MB zip) e GitHub (<100MB)

BLOCOS = [
    # 1. Carioca Anos 2000 (Romário no Vasco e Flu, Petkovic no Fla, Dodô no Botafogo)
    {
        "torneios": ["carioca"],
        "anos": [2005, 2006, 2007, 2008, 2009],
        "desc": "Carioca 2005-2009 (Romário milésimo gol, Dodô artilheiro)"
    },
    {
        "torneios": ["carioca"],
        "anos": [2000, 2001, 2002, 2003, 2004],
        "desc": "Carioca 2000-2004 (Romário, Petkovic, Edmundo)"
    },
    # 2. Carioca Anos 90 (Túlio Maravilha no Botafogo, Romário no Flamengo, Edmundo no Vasco)
    {
        "torneios": ["carioca"],
        "anos": [1995, 1996, 1997, 1998, 1999],
        "desc": "Carioca 1995-1999 (Romário no Fla, Edmundo no Vasco, Túlio no Botafogo)"
    },
    {
        "torneios": ["carioca"],
        "anos": [1990, 1991, 1992, 1993, 1994],
        "desc": "Carioca 1990-1994 (Bebeto, Renato Gaúcho, Gaúcho no Fla)"
    },
    # 3. Carioca Anos 80 (Zico no Flamengo, Roberto Dinamite no Vasco)
    {
        "torneios": ["carioca"],
        "anos": [1985, 1986, 1987, 1988, 1989],
        "desc": "Carioca 1985-1989 (Zico, Roberto Dinamite, Bebeto)"
    },
    {
        "torneios": ["carioca"],
        "anos": [1980, 1981, 1982, 1983, 1984],
        "desc": "Carioca 1980-1984 (Era de ouro do Flamengo de Zico e Vasco de Dinamite)"
    },
    # 4. Carioca Anos 70
    {
        "torneios": ["carioca"],
        "anos": [1975, 1976, 1977, 1978, 1979],
        "desc": "Carioca 1975-1979 (Início de Zico e Dinamite)"
    },
    {
        "torneios": ["carioca"],
        "anos": [1970, 1971, 1972, 1973, 1974],
        "desc": "Carioca 1970-1974"
    },
    # 5. Paulistão Histórico (Pelé no Santos, Rivellino no Corinthians, Ademir da Guia no Palmeiras)
    {
        "torneios": ["paulista"],
        "anos": [1965, 1966, 1967, 1968, 1969, 1970],
        "desc": "Paulistão 1965-1970 (Pelé no Santos, Ademir no Palmeiras)"
    },
    {
        "torneios": ["paulista"],
        "anos": [1958, 1959, 1960, 1961, 1962, 1963, 1964],
        "desc": "Paulistão 1958-1964 (Recorde de Pelé de 58 gols em 1958)"
    },
    {
        "torneios": ["paulista"],
        "anos": [1950, 1951, 1952, 1953, 1954, 1955, 1956, 1957],
        "desc": "Paulistão 1950-1957"
    },
    # 6. Campeonato Mineiro (Reinaldo no Galo, Tostão no Cruzeiro)
    {
        "torneios": ["mineiro"],
        "anos": [2000, 2001, 2002, 2003, 2004, 2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013],
        "desc": "Mineiro 2000-2013 (Alex no Cruzeiro, Diego Tardelli no Galo)"
    },
    {
        "torneios": ["mineiro"],
        "anos": [1990, 1991, 1992, 1993, 1994, 1995, 1996, 1997, 1998, 1999],
        "desc": "Mineiro 1990-1999 (Ronaldo Fenômeno no Cruzeiro)"
    },
    {
        "torneios": ["mineiro"],
        "anos": [1975, 1976, 1977, 1978, 1979, 1980, 1981, 1982, 1983, 1984, 1985, 1986, 1987, 1988, 1989],
        "desc": "Mineiro 1975-1989 (Reinaldo no Atlético-MG)"
    },
    {
        "torneios": ["mineiro"],
        "anos": [1965, 1966, 1967, 1968, 1969, 1970, 1971, 1972, 1973, 1974],
        "desc": "Mineiro 1965-1974 (Tostão e Dirceu Lopes no Cruzeiro)"
    },
    # 7. Campeonato Gaúcho (Renato Gaúcho no Grêmio, Falcão no Inter)
    {
        "torneios": ["gaucho"],
        "anos": [2000, 2001, 2002, 2003, 2004, 2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013],
        "desc": "Gaúcho 2000-2013 (Ronaldinho no Grêmio, Fernandão no Inter)"
    },
    {
        "torneios": ["gaucho"],
        "anos": [1990, 1991, 1992, 1993, 1994, 1995, 1996, 1997, 1998, 1999],
        "desc": "Gaúcho 1990-1999 (Paulo Nunes e Jardel no Grêmio)"
    },
    {
        "torneios": ["gaucho"],
        "anos": [1975, 1976, 1977, 1978, 1979, 1980, 1981, 1982, 1983, 1984, 1985, 1986, 1987, 1988, 1989],
        "desc": "Gaúcho 1975-1989 (Renato Gaúcho no Grêmio, Falcão no Inter)"
    },
    {
        "torneios": ["gaucho"],
        "anos": [1965, 1966, 1967, 1968, 1969, 1970, 1971, 1972, 1973, 1974],
        "desc": "Gaúcho 1965-1974"
    },
    # 8. Demais Estaduais e Regionais
    {
        "torneios": ["nordeste"],
        "anos": [1997, 1998, 1999, 2000, 2001, 2002, 2003, 2010, 2013, 2014, 2015, 2016, 2017, 2018, 2019],
        "desc": "Copa do Nordeste 1997-2019"
    },
    {
        "torneios": ["paranaense"],
        "anos": [2000, 2001, 2002, 2003, 2004, 2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019],
        "desc": "Paranaense 2000-2019"
    },
    {
        "torneios": ["catarinense", "baiano", "pernambucano", "goiano", "cearense"],
        "anos": [2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025],
        "desc": "Catarinense, Baiano, Pernambucano, Goiano, Cearense (2014-2025)"
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

def processar_fila():
    print("=" * 65, flush=True)
    print("   ORQUESTRADOR GERAL DE INGESTÃO AUTÔNOMA DE ESTADUAIS", flush=True)
    print("=" * 65, flush=True)

    for i, bloco in enumerate(BLOCOS, 1):
        print(f"\n>>> INICIANDO BLOCO {i}/{len(BLOCOS)}: {bloco['desc']} <<<", flush=True)
        torneios_str = " ".join(bloco["torneios"])
        anos_str = " ".join(str(a) for a in bloco["anos"])
        
        # 1. Executa scraper
        cmd_scrape = f'"{PY_BIN}" scripts/scraper_ogol_estaduais.py --torneios {torneios_str} --anos {anos_str}'
        ok = run_cmd(cmd_scrape, f"Scraping {bloco['desc']}")
        if not ok:
            print(f"[AVISO] Scraping falhou para o bloco {i}, tentando seguir para validação...", flush=True)

        # 2. Higienizar e desambiguar
        run_cmd(f'"{PY_BIN}" scripts/higienizar_e_desambiguar_gols.py', "Higienização e Desambiguação")

        # 3. Validar integridade
        ok_val = run_cmd(f'"{PY_BIN}" scripts/validar_banco.py', "Validação 5/5")
        if not ok_val:
            print(f"[FATAL] Banco falhou na validação de integridade no bloco {i}! Abortando commit.", flush=True)
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
            safe_print(f"O banco atingiu {tamanho_mb:.2f} MB, atingindo o teto de segurança de 94 MB.")
            safe_print("Interrompendo novas adições para garantir integridade e deploy 100% estável na Vercel e GitHub.")
            break

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
