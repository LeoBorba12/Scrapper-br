import urllib.request
import re

url = "https://www.bolanaarea.com/serie_b_2024.htm"
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
html = urllib.request.urlopen(req).read().decode('latin1', errors='ignore')

# strip tags and see what lines look like
clean_text = re.sub(r'<[^>]+>', ' ', html)
lines = [l.strip() for l in clean_text.splitlines() if l.strip()]

for i, l in enumerate(lines[:80]):
    print(f"{i}: {l}")
