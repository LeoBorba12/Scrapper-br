import urllib.request
from bs4 import BeautifulSoup
import re

url = "https://www.bolanaarea.com/serie_b_2024_turno1.htm"
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
html = urllib.request.urlopen(req).read().decode('latin1', errors='ignore')

soup = BeautifulSoup(html, 'html.parser')

for tr in soup.find_all('tr')[:45]:
    text = " ".join([c.strip() for c in tr.get_text().split() if c.strip()])
    if text:
        print("TR:", text[:100])
