import urllib.request
from bs4 import BeautifulSoup
import re

url = "https://www.bolanaarea.com/serie_b_2024_turno1.htm"
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
html = urllib.request.urlopen(req).read().decode('latin1', errors='ignore')

soup = BeautifulSoup(html, 'html.parser')
trs = soup.find_all('tr')
for i, tr in enumerate(trs):
    txt = tr.get_text()
    if '1ª RODADA' in txt.upper() or '1a RODADA' in txt.upper() or 'PRIMEIRA RODADA' in txt.upper():
        print(f"Found at TR index {i}!")
        for j in range(max(0, i-2), min(len(trs), i+15)):
            cells = [td.get_text().strip() for td in trs[j].find_all(['td', 'th']) if td.get_text().strip()]
            print(f"  TR {j}: {cells}")
        break
