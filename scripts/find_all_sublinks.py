import urllib.request
from bs4 import BeautifulSoup

url = "https://www.bolanaarea.com/serie_b_2008.htm"
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
html = urllib.request.urlopen(req).read().decode('latin1', errors='ignore')
soup = BeautifulSoup(html, 'html.parser')

for a in soup.find_all('a'):
    print(a.get('href'), "->", a.get_text().strip())
