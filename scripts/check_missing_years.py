import urllib.request

missing_years = [2006, 2007, 2008, 2010, 2011]
base_url = "https://www.bolanaarea.com/"

patterns = [
    "serie_b_{}.htm",
    "serie_b_{}_tabela.htm",
    "serie_b_{}_tab.htm",
    "serie_b_{}_fase1.htm",
    "serie_b_{}_fasefinal.htm",
    "brasileiro_serie_b_{}.htm",
]

for y in missing_years:
    print(f"--- Ano {y} ---")
    for p in patterns:
        fn = p.format(y)
        try:
            req = urllib.request.Request(base_url + fn, headers={'User-Agent': 'Mozilla/5.0'})
            with urllib.request.urlopen(req, timeout=2) as resp:
                print(f"  [OK] {fn} ({len(resp.read())} bytes)")
        except Exception:
            pass
