import urllib.request
import json
import re

# Test Wikipedia API for "Campeonato Paulista de Futebol de 1993"
title = "Campeonato_Paulista_de_Futebol_de_1993"
url = f"https://pt.wikipedia.org/api/rest_v1/page/html/{title}"

try:
    req = urllib.request.Request(url, headers={'User-Agent': 'FutebolHistoricalBot/1.0 (leonardo@example.com)'})
    with urllib.request.urlopen(req, timeout=5) as r:
        html = r.read().decode('utf-8', errors='ignore')
        print(f"Wikipedia HTML size for {title}: {len(html)} bytes")
        
        # Look for scores
        matches = re.findall(r'([A-Za-zÀ-ÿ\s\.\-]+?)\s+(\d{1,2})\s*[xX–-]\s*(\d{1,2})\s+([A-Za-zÀ-ÿ\s\.\-]+)', html)
        print(f"Potential score matches found: {len(matches)}")
        for m in matches[:10]:
            clean_man = re.sub(r'<[^>]+>', '', m[0]).strip().split('\n')[-1].strip()
            clean_vis = re.sub(r'<[^>]+>', '', m[3]).strip().split('\n')[0].strip()
            if len(clean_man) > 2 and len(clean_vis) > 2 and not any(w in clean_man.lower() for w in ['campeonato', 'divisão', 'fase']):
                print(f"  {clean_man} {m[1]}x{m[2]} {clean_vis}")
except Exception as e:
    print(f"Error: {e}")
