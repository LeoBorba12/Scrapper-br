import urllib.request
from bs4 import BeautifulSoup

url = "https://www.bolanaarea.com/serie_b_2024.htm"
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
html = urllib.request.urlopen(req).read().decode('latin1', errors='ignore')

soup = BeautifulSoup(html, 'html.parser')
for a in soup.find_all('a'):
    href = a.get('href')
    text = a.get_text().strip()
    if href:
        print(f"{text} -> {href}")
