import urllib.request

test_urls = [
    "https://www.rsssf.org/tablesr/rj1995.html",
    "https://www.rsssf.org/tablesr/rj1980.html",
    "https://www.rsssf.org/tabless/sp1993.html",
    "https://www.rsssf.org/tabless/sp1977.html",
    "https://www.rsssf.org/tablesm/mg1990.html",
    "https://www.rsssf.org/tablesr/rs1995.html",
]

for u in test_urls:
    try:
        req = urllib.request.Request(u, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, timeout=3) as resp:
            print(f"[OK 200] {u} ({len(resp.read())} bytes)")
    except Exception as e:
        print(f"[FAIL] {u} -> {e}")
