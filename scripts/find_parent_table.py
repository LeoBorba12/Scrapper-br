import urllib.request
from bs4 import BeautifulSoup

url = "https://www.bolanaarea.com/serie_b_2024_turno1.htm"
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
html = urllib.request.urlopen(req).read().decode('latin1', errors='ignore')

soup = BeautifulSoup(html, 'html.parser')

for td in soup.find_all('td'):
    txt = td.get_text().strip()
    if '2x1' in txt and 'Novorizontino' in txt:
        # Find parent table
        table = td.find_parent('table')
        print("PARENT TABLE FOUND!")
        for r in table.find_all('tr'):
            row_txt = " /// ".join([c.get_text().strip() for c in r.find_all(['td', 'th']) if c.get_text().strip()])
            if row_txt:
                print(row_txt)
        break
