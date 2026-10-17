import urllib.request

base_url = "https://www.bolanaarea.com/"
years = range(2006, 2025)

for y in years:
    u1 = f"{base_url}serie_b_{y}_turno1.htm"
    u2 = f"{base_url}serie_b_{y}_turno2.htm"
    try:
        r1 = urllib.request.urlopen(urllib.request.Request(u1, headers={'User-Agent': 'Mozilla/5.0'}), timeout=2)
        r2 = urllib.request.urlopen(urllib.request.Request(u2, headers={'User-Agent': 'Mozilla/5.0'}), timeout=2)
        print(f"Ano {y}: Turno1 ({r1.status}) e Turno2 ({r2.status}) OK")
    except Exception as e:
        print(f"Ano {y}: Falhou ({e})")
