import urllib.request
from bs4 import BeautifulSoup
import re

base_url = "https://www.campeoesdofutebol.com.br/"
headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}

print("Mapeando títulos de confrontos_clubes:")
for n in range(1, 35):
    for sfx in ["", "a", "b", "_2", "_3", "_4"]:
        fn = f"confrontos_clubes{n}{sfx}.html"
        url = base_url + fn
        try:
            req = urllib.request.Request(url, headers=headers)
            with urllib.request.urlopen(req, timeout=2.5) as r:
                if r.status == 200:
                    data = r.read()
                    soup = BeautifulSoup(data[:4000], 'html.parser')
                    t = soup.title.get_text().strip() if soup.title else ""
                    # clean title
                    t = re.sub(r'\s+', ' ', t).replace("Campeões do Futebol", "").strip(" -–|")
                    print(f"  {fn:<26} -> {t}")
        except Exception:
            pass
