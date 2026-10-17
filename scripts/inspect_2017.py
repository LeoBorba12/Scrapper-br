from bs4 import BeautifulSoup
import os

fn_2017 = os.path.join("data", "raw_serieb", "2017", "serie_b_2017.htm")
with open(fn_2017, 'r', encoding='latin1', errors='ignore') as f:
    html = f.read()

soup = BeautifulSoup(html, 'html.parser')
print("2017 Links:")
for a in soup.find_all('a'):
    print(" ", a.get('href'), "->", a.get_text().strip())
