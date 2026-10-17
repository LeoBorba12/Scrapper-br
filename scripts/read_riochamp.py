import urllib.request
from bs4 import BeautifulSoup
import re

url = "https://www.rsssf.org/tablesr/riochamp.html"
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
html = urllib.request.urlopen(req).read().decode('latin1', errors='ignore')
soup = BeautifulSoup(html, 'html.parser')

print(f"Total links in riochamp.html: {len(soup.find_all('a'))}")
for a in soup.find_all('a'):
    href = a.get('href')
    txt = a.get_text().strip()
    if href and ('rio' in href.lower() or 'sao' in href.lower() or 'sp' in href.lower() or 'braz' in href.lower()):
        print(f"  {txt:<30} -> {href}")
