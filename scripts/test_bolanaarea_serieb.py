import urllib.request

base_url = "https://www.bolanaarea.com/"

test_files = [
    "serie_b_2024.htm",
    "serie_b_2024_tab.htm",
    "serie_b_2024_tabela.htm",
    "brasileiro_serie_b_2024.htm",
    "brasileiro_serie_b_2024_tab.htm",
    "brasileiro_serie_b_2024_tabela.htm",
    "brasileirao_serie_b_2024.htm",
    "serie_b_2023.htm",
    "serie_b_2020.htm",
    "serie_b_2010.htm",
    "serie_b_2003.htm",
    "serie_b_2000.htm",
    "serie_b_1990.htm",
]

print("Testando arquivos de Série B no Bola n@ Área:")
for fn in test_files:
    url = base_url + fn
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})
        with urllib.request.urlopen(req, timeout=4) as resp:
            data = resp.read()
            if len(data) > 1000:
                print(f"  [OK 200] {fn} ({len(data)} bytes)")
    except Exception as e:
        pass
