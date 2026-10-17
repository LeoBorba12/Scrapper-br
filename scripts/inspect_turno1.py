import urllib.request
from bs4 import BeautifulSoup
import re

url = "https://www.bolanaarea.com/serie_b_2024_turno1.htm"
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
html = urllib.request.urlopen(req).read().decode('latin1', errors='ignore')

soup = BeautifulSoup(html, 'html.parser')

print(f"HTML size: {len(html)}")
# Print first 40 text lines
lines = [l.strip() for l in soup.get_text().splitlines() if l.strip()]
for i, l in enumerate(lines[:60]):
    print(f"{i}: {l}")
