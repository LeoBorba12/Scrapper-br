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
    if 'Novorizontino' in txt and '2x1' in txt:
        print(f"Match found at TR {i}!")
        for j in range(max(0, i-5), min(len(trs), i+12)):
            print(f"TR {j}: {trs[j].get_text().strip()[:80]}")
        break
