from bs4 import BeautifulSoup
import re
import os

fn_2008 = os.path.join("data", "raw_serieb", "2008", "serie_b_2008_tb1.htm")
with open(fn_2008, 'r', encoding='latin1', errors='ignore') as f:
    html = f.read()

soup = BeautifulSoup(html, 'html.parser')
lines = [l.strip() for l in soup.get_text().splitlines() if l.strip()]

matches = []
for i, l in enumerate(lines):
    m = re.match(r'^(\d{1,2})\s*[xX]\s*(\d{1,2})$', l)
    if m and i > 0 and i + 1 < len(lines):
        man = lines[i-1]
        vis = lines[i+1]
        gm = int(m.group(1))
        gv = int(m.group(2))
        if len(man) > 1 and len(vis) > 1 and not any(w in man.lower() for w in ['rodada', 'feira', 'turno', 'local:']):
            matches.append((man, f"{gm}x{gv}", vis))

print(f"Total multi-line matches found in 2008 tb1: {len(matches)}")
for m in matches[:10]:
    print(" ", m)
