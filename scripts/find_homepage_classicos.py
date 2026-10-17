import urllib.request
from bs4 import BeautifulSoup
import re

url = "https://www.campeoesdofutebol.com.br/"
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
html = urllib.request.urlopen(req, timeout=5).read().decode('utf-8', errors='ignore')
soup = BeautifulSoup(html, 'html.parser')

print(f"Total links on homepage: {len(soup.find_all('a'))}")
links = set()
for a in soup.find_all('a'):
    h = a.get('href', '')
    if h and any(k in h.lower() for k in ['confronto', 'classico', 'derby', 'fla', 'corinthians', 'palmeiras', 'sao_paulo', 'gremio', 'inter', 'cruzeiro', 'atletico']):
        links.add((a.get_text().strip(), h))

for txt, h in sorted(links):
    print(f"  {txt:<40} -> {h}")
