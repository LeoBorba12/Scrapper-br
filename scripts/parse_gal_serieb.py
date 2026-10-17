import urllib.request
from bs4 import BeautifulSoup

url = "https://www.bolanaarea.com/gal_brasileirao_serie_b.htm"
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
html = urllib.request.urlopen(req).read().decode('latin1', errors='ignore')

soup = BeautifulSoup(html, 'html.parser')
links = {}
for a in soup.find_all('a'):
    href = a.get('href')
    text = a.get_text().strip()
    if href and ('serie_b' in href or 'brasileiro' in href or 'taca' in href):
        links[text] = href

print(f"Total links found in gal_brasileirao_serie_b.htm: {len(links)}")
for t, h in sorted(links.items(), key=lambda x: str(x[0])):
    print(f"{t:<30} -> {h}")
