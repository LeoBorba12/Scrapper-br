import urllib.request

patterns = [
    "http://www.rsssfbrasil.com/tables/rj1995.htm",
    "http://www.rsssfbrasil.com/tablesr/rj1995.htm",
    "http://www.rsssfbrasil.com/tablesrz/rj1995.htm",
    "http://www.rsssfbrasil.com/tablesae/rj1995.htm",
    "http://rsssfbrasil.com/tables/rj1995.htm",
    "http://www.rsssfbrasil.com/tables/sp1977.htm",
    "http://www.rsssfbrasil.com/tabless/sp1977.htm",
    "http://www.rsssfbrasil.com/tablesrz/sp1977.htm",
]

for url in patterns:
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, timeout=3) as r:
            if r.status == 200:
                print(f"[OK 200] {url} ({len(r.read())} bytes)")
    except Exception as e:
        print(f"[FAIL] {url} -> {e}")
