import urllib.request
from bs4 import BeautifulSoup

url = "https://www.campeoesdofutebol.com.br/criterios_confrontos_clubes11.html"
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})
html = urllib.request.urlopen(req, timeout=5).read().decode('utf-8', errors='ignore')
soup = BeautifulSoup(html, 'html.parser')

print(f"HTML size: {len(html)}")
lines = [l.strip() for l in soup.get_text().splitlines() if l.strip()]
for l in lines[:50]:
    print(" ", l)
