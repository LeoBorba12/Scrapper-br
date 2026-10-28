import urllib.request
from bs4 import BeautifulSoup
import re

url = "https://www.bolanaarea.com/serie_b_2024_turno1.htm"
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
html = urllib.request.urlopen(req).read().decode('latin1', errors='ignore')

# Look for patterns like:
# TeamA \s+ (\d+)x(\d+) \s+ TeamB
# preceded by date like dd.mm ou dd/mm ou dd/mm/aaaa

# Let's inspect raw occurrences of "2x1" or "x" between teams
matches = re.findall(r'([A-Za-zÀ-ÿ\.\-\s]+?)\s+(\d{1,2})\s*[xX]\s*(\d{1,2})\s+([A-Za-zÀ-ÿ\.\-\s]+?)(?:Local:|Estádio:|Data:|<br|\n)', html)
print(f"Direct raw regex matches: {len(matches)}")
for m in matches[:15]:
    man = re.sub(r'<[^>]+>', '', m[0]).strip().split('\n')[-1].strip()
    vis = re.sub(r'<[^>]+>', '', m[3]).strip().split('\n')[0].strip()
    print(f"'{man}' {m[1]}x{m[2]} '{vis}'")
