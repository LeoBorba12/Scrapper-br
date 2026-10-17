import urllib.request
from bs4 import BeautifulSoup
import re

url = "https://www.bolanaarea.com/serie_b_2024_turno1.htm"
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
html = urllib.request.urlopen(req).read().decode('latin1', errors='ignore')

soup = BeautifulSoup(html, 'html.parser')

match_rows = []
for tr in soup.find_all('tr'):
    cells = [td.get_text().strip() for td in tr.find_all(['td', 'th']) if td.get_text().strip()]
    row_text = " | ".join(cells)
    if re.search(r'\b\d+\s*[xX-]\s*\d+\b', row_text) or any(c in row_text for c in ['Santos', 'Sport', 'Guarani', 'Novorizontino']):
        match_rows.append(cells)

print(f"Total matching rows found: {len(match_rows)}")
for r in match_rows[:25]:
    print(r)
