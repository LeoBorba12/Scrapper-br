import urllib.request
from bs4 import BeautifulSoup
import re

# Test reading a page from rsssf.org
test_urls = [
    "https://www.rsssf.org/tabless/sao-champ.html",
    "https://www.rsssf.org/tabless/saopaulochamp.html",
    "https://www.rsssf.org/tabless/spchamp.html",
    "https://www.rsssf.org/tablesr/riochamp.html",
    "https://www.rsssf.org/tablesm/minaschamp.html",
    "https://www.rsssf.org/tablesr/rgsuchamp.html",
]

for url in test_urls:
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, timeout=3) as r:
            print(f"[OK 200] {url} ({len(r.read())} bytes)")
    except Exception as e:
        pass
