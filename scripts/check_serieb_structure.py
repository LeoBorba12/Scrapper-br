import urllib.request
from bs4 import BeautifulSoup
import re

years_to_test = [1971, 1980, 1991, 2000, 2008, 2024]
base_url = "https://www.bolanaarea.com/"

for y in years_to_test:
    url = f"{base_url}serie_b_{y}.htm"
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        html = urllib.request.urlopen(req).read().decode('latin1', errors='ignore')
        soup = BeautifulSoup(html, 'html.parser')
        
        # Check sublinks
        sublinks = [a.get('href') for a in soup.find_all('a') if a.get('href') and any(k in a.get('href') for k in ['turno', 'fase', 'tab', 'jogos', 'grupo'])]
        
        # Check if match patterns exist directly in html
        text = soup.get_text()
        scores = re.findall(r'\b[A-Za-zÀ-ÿ\s\.\-]{3,20}\s+\d+\s*x\s*\d+\s+[A-Za-zÀ-ÿ\s\.\-]{3,20}\b', text)
        
        print(f"Ano {y}: Sublinks={sublinks[:5]} | Direct scores count={len(scores)}")
    except Exception as e:
        print(f"Ano {y}: Erro {e}")
