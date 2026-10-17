import urllib.request
from bs4 import BeautifulSoup
import re

wiki_titles = [
    ("Fla-Flu", "Fla-Flu"),
    ("Flamengo x Vasco (Clássico dos Milhões)", "Clássico_dos_Milhões"),
    ("Flamengo x Botafogo (Clássico da Rivalidade)", "Clássico_da_Rivalidade"),
    ("Fluminense x Botafogo (Clássico Vovô)", "Clássico_Vovô"),
    ("Fluminense x Vasco (Clássico dos Gigantes)", "Clássico_dos_Gigantes"),
    ("Botafogo x Vasco", "Botafogo_versus_Vasco_da_Gama"),
    ("Corinthians x São Paulo (Majestoso)", "Majestoso"),
    ("Palmeiras x São Paulo (Choque-Rei)", "Choque-Rei"),
    ("Santos x São Paulo (San-São)", "San-São"),
    ("Corinthians x Santos (Clássico Alvinegro)", "Clássico_Alvinegro"),
    ("Atlético-MG x Cruzeiro (Clássico Mineiro)", "Clássico_Mineiro"),
    ("Bahia x Vitória (Ba-Vi)", "Ba-Vi"),
    ("Coritiba x Athletico-PR (Atle-Tiba)", "Atle-Tiba"),
    ("Sport x Santa Cruz", "Clássico_das_Multidões_(Pernambuco)"),
    ("Sport x Náutico", "Clássico_dos_Clássicos"),
    ("Ceará x Fortaleza", "Clássico-Rei")
]

print("Verificando tabelas completas de clássicos na Wikipédia:")
for label, title in wiki_titles:
    url = f"https://pt.wikipedia.org/api/rest_v1/page/html/{title}"
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'FutebolBot/1.0'})
        with urllib.request.urlopen(req, timeout=5) as r:
            html = r.read().decode('utf-8', errors='ignore')
            soup = BeautifulSoup(html, 'html.parser')
            # Look for table with matches
            found_rows = 0
            for t in soup.find_all('table'):
                rows = t.find_all('tr')
                headers = [th.get_text().strip() for th in t.find_all('th')]
                if len(rows) > 30 and any(h in headers for h in ['Data', 'Mandante', 'Placar', 'Visitante', 'Competição', 'Resultado']):
                    found_rows = len(rows)
                    break
            print(f"  [OK 200] {label:<45} | Tabela com {found_rows} partidas")
    except Exception as e:
        print(f"  [FAIL] {label} -> {e}")
