import urllib.request
import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

url = 'https://www.campeoesdofutebol.com.br/confrontos_grenais.html'
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
try:
    with urllib.request.urlopen(req, timeout=10) as resp:
        html = resp.read().decode('utf-8', errors='ignore')
        print(f"Tamanho de confrontos_grenais: {len(html)}")
        links = re.findall(r'href="([^"]+)"[^>]*>(.*?)</a>', html)
        for href, txt in links:
            if 'grenal' in href.lower() or 'gremio' in href.lower() or 'inter' in href.lower() or 'parte' in txt.lower() or '19' in txt or '20' in txt:
                clean = re.sub(r'<[^>]+>', '', txt).strip()
                print(f"  {clean} -> {href}")
except Exception as e:
    print('Erro:', e)
