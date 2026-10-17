import urllib.request
from bs4 import BeautifulSoup
import re

url = "https://www.bolanaarea.com/serie_b_2008.htm"
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
html = urllib.request.urlopen(req).read().decode('latin1', errors='ignore')
soup = BeautifulSoup(html, 'html.parser')

match_samples = []
for tr in soup.find_all('tr'):
    cells = [td.get_text().strip() for td in tr.find_all(['td', 'th']) if td.get_text().strip()]
    row_text = " | ".join(cells)
    if 'Corinthians' in row_text and re.search(r'\d+\s*[xX-]\s*\d+', row_text):
        match_samples.append(row_text)

print(f"Total Corinthians match lines found in 2008: {len(match_samples)}")
for m in match_samples[:10]:
    print(m)
