from bs4 import BeautifulSoup
import os

fn_2013 = os.path.join("data", "raw_serieb", "2013", "serie_b_2013_turno1.htm")
with open(fn_2013, 'r', encoding='latin1', errors='ignore') as f:
    html = f.read()

soup = BeautifulSoup(html, 'html.parser')
lines = [l.strip() for l in soup.get_text().splitlines() if l.strip()]

print("2013 Turno 1 Sample Lines:")
for i, l in enumerate(lines[:60]):
    print(f"  {i}: {l}")
