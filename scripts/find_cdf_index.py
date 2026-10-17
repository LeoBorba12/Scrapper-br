import urllib.request
from bs4 import BeautifulSoup
import re

indexes = [
    "https://www.campeoesdofutebol.com.br/confrontos.html",
    "https://www.campeoesdofutebol.com.br/confrontos_clubes.html",
    "https://www.campeoesdofutebol.com.br/classicos_futebol.html",
    "https://www.campeoesdofutebol.com.br/classicos.html",
]

for url in indexes:
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, timeout=4) as r:
            html = r.read().decode('utf-8', errors='ignore')
            soup = BeautifulSoup(html, 'html.parser')
            links = [a.get('href') for a in soup.find_all('a') if a.get('href') and ('confronto' in a.get('href') or 'classico' in a.get('href'))]
            print(f"[OK 200] {url} -> {len(links)} links de confrontos encontrados!")
            for l in links[:15]:
                print("  ", l)
    except Exception as e:
        print(f"[FAIL] {url} -> {e}")
