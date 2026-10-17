from bs4 import BeautifulSoup
import re
import os

fn_2008 = os.path.join("data", "raw_serieb", "2008", "serie_b_2008_tb1.htm")
if os.path.exists(fn_2008):
    with open(fn_2008, 'r', encoding='latin1', errors='ignore') as f:
        html = f.read()
    soup = BeautifulSoup(html, 'html.parser')
    print("--- 2008 TB1 Sample Text ---")
    lines = [l.strip() for l in soup.get_text().splitlines() if l.strip()]
    for l in lines[:40]:
        print("  ", l)
