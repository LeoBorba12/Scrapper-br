import urllib.request
from bs4 import BeautifulSoup
import re

url = "https://pt.wikipedia.org/api/rest_v1/page/html/Fla-Flu"
req = urllib.request.Request(url, headers={'User-Agent': 'FutebolBot/1.0 (test@futebol.com)'})
html = urllib.request.urlopen(req, timeout=8).read().decode('utf-8', errors='ignore')
soup = BeautifulSoup(html, 'html.parser')

print(f"HTML size for Fla-Flu: {len(html)} bytes")

# Look for table with matches
tables = soup.find_all('table')
print(f"Total tables found: {len(tables)}")

match_tables = []
for t in tables:
    txt = t.get_text()
    if '1912' in txt and ('Flamengo' in txt or 'Fluminense' in txt) and re.search(r'\d+\s*[xX–-]\s*\d+', txt):
        match_tables.append(t)

print(f"Match tables found: {len(match_tables)}")
if match_tables:
    rows = match_tables[0].find_all('tr')
    print(f"Rows in first match table: {len(rows)}")
    for r in rows[:15]:
        cells = [c.get_text().strip() for c in r.find_all(['td', 'th']) if c.get_text().strip()]
        print("  ", cells)
