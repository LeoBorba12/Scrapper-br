from bs4 import BeautifulSoup
import re
import os

fn_2013 = os.path.join("data", "raw_serieb", "2013", "serie_b_2013_turno1.htm")
with open(fn_2013, 'r', encoding='latin1', errors='ignore') as f:
    html = f.read()

soup = BeautifulSoup(html, 'html.parser')
lines = [l.strip() for l in soup.get_text().splitlines() if l.strip()]

for i, l in enumerate(lines):
    if 'Palmeiras' in l and any(k in l for k in ['x', 'X', '1', '2', '3', '0']):
        print(f"Line {i}: {lines[max(0, i-2):min(len(lines), i+4)]}")
