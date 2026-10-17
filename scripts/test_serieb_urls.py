import urllib.request

years = [2003, 2004, 2008, 2013, 2020, 2023]
prefixes = [
    "https://www.rsssfbrasil.com/tablesae/brb{}.htm",
    "https://www.rsssfbrasil.com/tablesae/b{}.htm",
    "https://www.rsssfbrasil.com/tablesae/br2_{}.htm",
    "https://www.rsssfbrasil.com/tablesae/br2{}.htm",
    "https://www.rsssfbrasil.com/tablesae/bra2_{}.htm",
    "https://www.rsssfbrasil.com/tablesae/brb{}.htm",
    "https://www.rsssfbrasil.com/tablesae/b2{}.htm",
    "https://www.rsssfbrasil.com/tables/b/br{}.htm",
]

for p in prefixes:
    working = []
    for y in years:
        url = p.format(y)
        try:
            req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
            with urllib.request.urlopen(req, timeout=3) as r:
                if r.status == 200:
                    working.append(y)
        except Exception:
            pass
    if working:
        print(f"Pattern works for {working}: {p}")
