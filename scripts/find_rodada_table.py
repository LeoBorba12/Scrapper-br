import urllib.request
from bs4 import BeautifulSoup
import re

url = "https://www.bolanaarea.com/serie_b_2024_turno1.htm"
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
html = urllib.request.urlopen(req).read().decode('latin1', errors='ignore')

soup = BeautifulSoup(html, 'html.parser')

# Look for rodada or tables
for table in soup.find_all('table'):
    txt = table.get_text()
    if 'RODADA' in txt.upper() or '1ª RODADA' in txt.upper() or '1a RODADA' in txt.upper() or 'PRIMEIRA RODADA' in txt.upper():
        print("Encontrada tabela de rodada!")
        lines = [l.strip() for l in txt.splitlines() if l.strip()]
        for l in lines[:30]:
            print("  ", l)
        break
