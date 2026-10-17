import urllib.request
from bs4 import BeautifulSoup
import re

base_url = "https://www.bolanaarea.com/"

# Years of Série B
years = [
    1971, 1972, 1980, 1981, 1982, 1983, 1984, 1985, 1986, 1987, 1988, 1989,
    1990, 1991, 1992, 1994, 1995, 1996, 1997, 1998, 1999, 2000, 2001, 2002,
    2003, 2004, 2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014,
    2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024
]

ignore_words = ['almanaque', 'participantes', 'clubes', 'historia', 'classificacao', 'estatisticas']

all_match_files = {}

for y in years:
    main_url = f"{base_url}serie_b_{y}.htm"
    try:
        req = urllib.request.Request(main_url, headers={'User-Agent': 'Mozilla/5.0'})
        html = urllib.request.urlopen(req, timeout=3).read().decode('latin1', errors='ignore')
        soup = BeautifulSoup(html, 'html.parser')
        
        sub_files = []
        for a in soup.find_all('a'):
            href = a.get('href', '').strip()
            if href.startswith(f"serie_b_{y}_") and href.endswith(".htm"):
                if not any(ign in href for ign in ignore_words):
                    if href not in sub_files:
                        sub_files.append(href)
                        
        if not sub_files:
            # Maybe the matches are directly in the main page?
            sub_files = [f"serie_b_{y}.htm"]
            
        all_match_files[y] = sub_files
        print(f"Ano {y}: {len(sub_files)} arquivos de tabela encontrados -> {sub_files}")
    except Exception as e:
        print(f"Ano {y}: Erro {e}")

print(f"\nTotal de edições mapeadas: {len(all_match_files)}/46")
