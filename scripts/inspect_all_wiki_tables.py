from bs4 import BeautifulSoup
import urllib.request
import re

url = "https://pt.wikipedia.org/api/rest_v1/page/html/Fla-Flu"
req = urllib.request.Request(url, headers={'User-Agent': 'FutebolBot/1.0'})
html = urllib.request.urlopen(req, timeout=8).read().decode('utf-8', errors='ignore')
soup = BeautifulSoup(html, 'html.parser')

tables = soup.find_all('table')
for i, t in enumerate(tables):
    rows = t.find_all('tr')
    headers = [th.get_text().strip() for th in t.find_all('th')]
    txt = t.get_text()[:150].replace('\n', ' ')
    print(f"Table {i}: {len(rows)} rows | Headers: {headers[:6]} | Text: {txt[:80]}")
