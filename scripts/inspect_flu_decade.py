import urllib.request
from bs4 import BeautifulSoup
import re

url = "https://www.campeoesdofutebol.com.br/flu_1930_1939.html"
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})
html = urllib.request.urlopen(req, timeout=5).read().decode('utf-8', errors='ignore')
soup = BeautifulSoup(html, 'html.parser')
lines = [l.strip() for l in soup.get_text().splitlines() if l.strip()]

print(f"Total lines in flu_1930_1939.html: {len(lines)}")
for i, l in enumerate(lines[:60]):
    print(f"  {i}: {l}")
