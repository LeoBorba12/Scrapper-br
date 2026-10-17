import urllib.request
from bs4 import BeautifulSoup

url = "https://www.campeoesdofutebol.com.br/confrontos.html"
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
html = urllib.request.urlopen(req).read().decode('utf-8', errors='ignore')
soup = BeautifulSoup(html, 'html.parser')

print(f"Total links found: {len(soup.find_all('a'))}")
for a in soup.find_all('a'):
    href = a.get('href', '')
    txt = a.get_text().strip()
    if href and ('confronto' in href or 'classico' in href or 'botafogo' in href):
        print(f"  {txt:<45} -> {href}")
