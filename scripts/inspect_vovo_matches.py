import urllib.request
import re

url = "https://www.campeoesdofutebol.com.br/criterios_confrontos_clubes11.html"
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
html = urllib.request.urlopen(req, timeout=5).read().decode('utf-8', errors='ignore')

# Match pattern: DD/MM/YYYY ... G1 x G2
matches = re.findall(r'(\d{2}/\d{2}/\d{4})\s*[-–]\s*(.*?)\s+(\d+)\s*[xX]\s*(\d+)\s+(.*?)\s*[-–]\s*(.*?)(?:<br|</p>|\r?\n)', html, re.IGNORECASE)
print(f"Total Botafogo x Fluminense matches found in criterios_confrontos_clubes11.html: {len(matches)}")
for m in matches[:5]:
    print(m)
for m in matches[-5:]:
    print(m)
