from bs4 import BeautifulSoup
import urllib.request

url = "https://pt.wikipedia.org/api/rest_v1/page/html/Fla-Flu"
req = urllib.request.Request(url, headers={'User-Agent': 'FutebolBot/1.0'})
html = urllib.request.urlopen(req, timeout=8).read().decode('utf-8', errors='ignore')
soup = BeautifulSoup(html, 'html.parser')

tables = soup.find_all('table')
t11 = tables[11]
rows = t11.find_all('tr')
print(f"Total rows in Table 11: {len(rows)}")

for r in rows[:10]:
    cells = [c.get_text().strip() for c in r.find_all(['td', 'th']) if c.get_text().strip()]
    print(cells)

print("...")
for r in rows[-5:]:
    cells = [c.get_text().strip() for c in r.find_all(['td', 'th']) if c.get_text().strip()]
    print(cells)
