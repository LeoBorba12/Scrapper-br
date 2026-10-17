import urllib.request
from bs4 import BeautifulSoup

for page in ['capa_fluminense.html', 'botafogorj_capa.html', 'confrontos.html']:
    url = f"https://www.campeoesdofutebol.com.br/{page}"
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        html = urllib.request.urlopen(req, timeout=5).read().decode('utf-8', errors='ignore')
        soup = BeautifulSoup(html, 'html.parser')
        print(f"=== {page} ===")
        for a in soup.find_all('a'):
            h = a.get('href', '')
            t = a.get_text().strip()
            if any(k in h.lower() for k in ['confronto', 'classico', 'vs', 'contra', 'todos_jogos']):
                print(f"  {t:<35} -> {h}")
    except Exception as e:
        print(f"Erro em {page}: {e}")
