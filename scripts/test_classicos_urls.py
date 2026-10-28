import urllib.request
from bs4 import BeautifulSoup
import re

headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}
base_url = "https://www.campeoesdofutebol.com.br/"

urls = [
    ("Clássico Vovô (1905-1943)", "confrontos_clubes11.html", "Botafogo", "Fluminense"),
    ("Clássico Vovô (1944-1967)", "confrontos_clubes11_2.html", "Botafogo", "Fluminense"),
    ("Clássico Vovô (1968-1990)", "confrontos_clubes11_3.html", "Botafogo", "Fluminense"),
    ("Clássico Vovô (1991-2025)", "confrontos_clubes11_4.html", "Botafogo", "Fluminense"),
    ("Fluminense x Vasco", "flu_vasco_classico.html", "Fluminense", "Vasco"),
    ("Guarani x Ponte Preta", "confrontos_guarani_ponte_preta.html", "Guarani", "Ponte Preta"),
    ("Ceará x Fortaleza", "confrontos_ceara_fortaleza.html", "Ceará", "Fortaleza"),
    ("Botafogo x Santos", "botafogorj_classico3.html", "Botafogo", "Santos"),
    ("Botafogo x Corinthians", "botafogorj_classico2.html", "Botafogo", "Corinthians"),
    ("Botafogo x Atlético-MG", "confrontos_botafogo_rjxatletico_mg.html", "Botafogo", "Atlético-MG"),
    ("Flamengo x Internacional", "confrontos_clubes15.html", "Flamengo", "Internacional"),
    ("Corinthians x Internacional", "confrontos_clubes16.html", "Corinthians", "Internacional"),
    ("Grêmio x São Paulo", "confrontos_gremio_sao_paulo.html", "Grêmio", "São Paulo"),
    ("Atlético-MG x Fluminense", "confrontos_clubes1.html", "Atlético-MG", "Fluminense"),
]

for label, path, t1, t2 in urls:
    try:
        req = urllib.request.Request(base_url + path, headers=headers)
        with urllib.request.urlopen(req, timeout=5) as resp:
            html = resp.read().decode('utf-8', errors='ignore')
            # Look for matches with DD/MM/YYYY and scores
            matches = re.findall(r'(\d{2}/\d{2}/\d{4}).*?(\d{1,2})\s*[xX–-]\s*(\d{1,2})', html)
            print(f"[OK] {label:<30} ({path:<30}): {len(matches)} partidas encontradas")
    except Exception as e:
        print(f"[FAIL] {label}: {e}")
