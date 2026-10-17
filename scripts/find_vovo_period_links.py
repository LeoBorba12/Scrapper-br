import urllib.request
from bs4 import BeautifulSoup

url = "https://www.campeoesdofutebol.com.br/criterios_confrontos_clubes11.html"
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
html = urllib.request.urlopen(req, timeout=5).read().decode('utf-8', errors='ignore')
soup = BeautifulSoup(html, 'html.parser')

for a in soup.find_all('a'):
    h = a.get('href', '')
    t = a.get_text().strip()
    if any(k in h.lower() for k in ['1905', '1944', '1968', '1991', 'clubes11', 'bota', 'flu']):
        print(f"{t} -> {h}")
