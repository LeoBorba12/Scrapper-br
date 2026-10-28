import urllib.request
from bs4 import BeautifulSoup
import re

url = "https://www.campeoesdofutebol.com.br/confrontos_clubes11.html"
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})
html = urllib.request.urlopen(req, timeout=5).read().decode('utf-8', errors='ignore')
soup = BeautifulSoup(html, 'html.parser')
lines = [l.strip() for l in soup.get_text().splitlines() if l.strip()]

matches = []
for i, l in enumerate(lines):
    m_score = re.match(r'^(\d{1,2})\s*[xX]\s*(\d{1,2})$', l)
    if m_score and i > 0 and i + 1 < len(lines):
        m_date = re.search(r'(\d{2})/(\d{2})/(\d{4})', lines[i-1])
        if m_date:
            dia, mes, ano = m_date.groups()
            comp = lines[i+1]
            gm, gv = int(m_score.group(1)), int(m_score.group(2))
            matches.append((f"{ano}-{mes}-{dia}", gm, gv, comp))

print(f"Total Clássico Vovô matches extracted from part 1: {len(matches)}")
for m in matches[:10]:
    print(" ", m)
