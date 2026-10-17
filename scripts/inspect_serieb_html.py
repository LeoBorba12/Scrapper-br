import urllib.request
import re

url = "https://www.bolanaarea.com/serie_b_2024.htm"
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
html = urllib.request.urlopen(req).read().decode('latin1', errors='ignore')

# Save sample to check
print(f"Total html length: {len(html)}")

# Find table rows with match scores
lines = html.splitlines()
matches = []
for line in lines:
    if re.search(r'\d+\s*[xX-]\s*\d+', line) and any(c in line for c in ['Santos', 'Sport', 'Ceará', 'Goiás', 'Coritiba', 'Mirassol', 'Novorizontino']):
        matches.append(line.strip())

print(f"Sample matching lines found: {len(matches)}")
for m in matches[:10]:
    print(m[:120])
