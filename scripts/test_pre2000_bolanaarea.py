import urllib.request

base_url = "https://www.bolanaarea.com/"

test_years = [1999, 1998, 1995, 1990, 1985, 1980, 1970]
test_states = ['sp', 'rj', 'mg', 'rs', 'pr']

print("Testando estaduais pré-2000 no Bola n@ Área:")
for y in test_years:
    for uf in test_states:
        for fn in [f"estaduais_{uf}_{y}.htm", f"estaduais_{uf}_{y}_tabela.htm", f"estaduais_{uf}_{y}_tab.htm", f"paulista_{y}.htm", f"carioca_{y}.htm"]:
            url = base_url + fn
            try:
                req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
                with urllib.request.urlopen(req, timeout=1.5) as resp:
                    if resp.status == 200:
                        print(f"  [ENCONTRADO] {fn} ({len(resp.read())} bytes)")
                        break
            except Exception:
                pass
