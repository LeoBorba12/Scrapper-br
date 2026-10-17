import urllib.request
from bs4 import BeautifulSoup

url = "https://www.campeoesdofutebol.com.br/capa_classico_vovo.html"
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
html = urllib.request.urlopen(req, timeout=5).read().decode('utf-8', errors='ignore')
soup = BeautifulSoup(html, 'html.parser')

print(f"Links in capa_classico_vovo.html: {len(soup.find_all('a'))}")
for a in soup.find_all('a'):
    print(" ", a.get('href'), "->", a.get_text().strip())
