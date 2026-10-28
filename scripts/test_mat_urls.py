import urllib.request

candidates = [
    "https://www.rsssfbrasil.com/miscellaneous/matbotafogo.htm",
    "https://www.rsssf.org/miscellaneous/matbotafogo.html",
    "https://www.rsssfbrasil.com/miscellaneous/matflu.htm",
    "https://www.rsssf.org/miscellaneous/matflu.html",
    "https://www.rsssfbrasil.com/miscellaneous/matspfc.htm",
    "https://www.rsssf.org/tables/m/matspfc.html"
]

for url in candidates:
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, timeout=4) as r:
            print(f"[OK 200] {url} ({len(r.read())} bytes)")
    except Exception as e:
        print(f"[FAIL] {url} -> {e}")
