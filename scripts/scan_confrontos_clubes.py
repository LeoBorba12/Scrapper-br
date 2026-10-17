import urllib.request

base_url = "https://www.campeoesdofutebol.com.br/"

found_series = []
for n in range(1, 35):
    for sfx in ["", "a", "b", "c", "d"]:
        fn = f"confrontos_clubes{n}{sfx}.html"
        url = base_url + fn
        try:
            req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
            with urllib.request.urlopen(req, timeout=2) as r:
                if r.status == 200:
                    data = r.read()
                    if len(data) > 1000:
                        # Extract title
                        html_str = data[:3000].decode('utf-8', errors='ignore')
                        import re
                        title = re.search(r'<title>(.*?)</title>', html_str, re.I)
                        t_text = title.group(1).strip() if title else ""
                        found_series.append((fn, t_text, len(data)))
                        print(f"  [OK] {fn:<25} | {t_text[:50]} ({len(data)} bytes)")
        except Exception:
            pass

print(f"\nTotal de páginas de confrontos encontradas: {len(found_series)}")
