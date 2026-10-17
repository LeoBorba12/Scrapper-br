import urllib.request
import os

base_url = "https://www.bolanaarea.com/"

years_to_check = range(1971, 2025)
available = []

print("Verificando todas as edições de Série B disponíveis no Bola n@ Área (1971 a 2024)...")

for y in years_to_check:
    fn = f"serie_b_{y}.htm"
    url = base_url + fn
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})
        with urllib.request.urlopen(req, timeout=3) as resp:
            data = resp.read()
            if len(data) > 1000:
                available.append((y, fn, len(data)))
    except Exception:
        # Tenta também outros formatos se não achar
        for alt in [f"serie_b_{y}_tabela.htm", f"serie_b_{y}_tab.htm", f"brasileiro_serie_b_{y}.htm"]:
            try:
                req = urllib.request.Request(base_url + alt, headers={'User-Agent': 'Mozilla/5.0'})
                with urllib.request.urlopen(req, timeout=2) as resp:
                    data = resp.read()
                    if len(data) > 1000:
                        available.append((y, alt, len(data)))
                        break
            except Exception:
                pass

print(f"Total de anos encontrados: {len(available)}/{len(years_to_check)}")
for y, fn, sz in available:
    print(f"  Ano {y}: {fn} ({sz} bytes)")
