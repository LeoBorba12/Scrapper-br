import urllib.request
import os
import time

base_url = "https://www.bolanaarea.com/"

states = ['sp', 'rj', 'mg', 'rs', 'pr']
years = range(2000, 2025)

print(f"Iniciando download e cache dos Campeonatos Estaduais (SP, RJ, MG, RS, PR) de 2000 a 2024...")

total = 0
success = 0

for uf in states:
    dir_path = os.path.join("data", "raw_estaduais", uf)
    os.makedirs(dir_path, exist_ok=True)
    
    for y in years:
        total += 1
        # Determine filenames to try
        candidates = []
        if uf == 'sp':
            candidates = [f"estaduais_sp_{y}_tabela.htm", f"estaduais_sp_{y}.htm"]
        elif uf == 'rj':
            candidates = [f"estaduais_rj_{y}_tab.htm", f"estaduais_rj_{y}_tabela.htm", f"estaduais_rj_{y}.htm"]
        else:
            candidates = [f"estaduais_{uf}_{y}.htm", f"estaduais_{uf}_{y}_tabela.htm"]
            
        downloaded = False
        for fn in candidates:
            local_path = os.path.join(dir_path, fn)
            if os.path.exists(local_path) and os.path.getsize(local_path) > 1000:
                downloaded = True
                success += 1
                break
                
            url = base_url + fn
            try:
                req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})
                with urllib.request.urlopen(req, timeout=5) as resp:
                    data = resp.read()
                    if len(data) > 1000:
                        with open(local_path, 'wb') as f:
                            f.write(data)
                        print(f"  [{uf.upper()} {y}] Baixado {fn} ({len(data)} bytes)")
                        downloaded = True
                        success += 1
                        time.sleep(0.08)
                        break
            except Exception:
                pass
                
        if not downloaded:
            print(f"  [{uf.upper()} {y}] Nenhum arquivo encontrado")

print(f"\nDownload concluído: {success}/{total} edições disponíveis no cache!")
