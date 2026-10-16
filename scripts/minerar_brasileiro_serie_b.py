"""
Minerador Oficial Histórico Completo do Campeonato Brasileiro - Série B (1971 a 2024)
Fonte: Arquivos Oficiais do Bola n@ Área (46 edições históricas)
Parser Unificado Multi-Padrão (Linha Única, Duas Linhas, Três Linhas)
Deduplicação Estrita por (data, mandante, visitante)
"""

import os
import re
import sqlite3
import urllib.request
import time
from bs4 import BeautifulSoup

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DB_PATH = os.path.join(BASE_DIR, "data", "futebol.db")
CACHE_DIR = os.path.join(BASE_DIR, "data", "raw_serieb")

os.makedirs(CACHE_DIR, exist_ok=True)

MAPA_CLUBES = {
    "santos": "Santos",
    "santos fc": "Santos",
    "sport": "Sport",
    "sport recife": "Sport",
    "ceará": "Ceará",
    "ceara": "Ceará",
    "goiás": "Goiás",
    "goias": "Goiás",
    "coritiba": "Coritiba",
    "coritiba fc": "Coritiba",
    "avaí": "Avaí",
    "avai": "Avaí",
    "novorizontino": "Novorizontino",
    "grêmio novorizontino": "Novorizontino",
    "américa": "América-MG",
    "américa-mg": "América-MG",
    "america-mg": "América-MG",
    "america/mg": "América-MG",
    "mirassol": "Mirassol",
    "operário": "Operário-PR",
    "operario": "Operário-PR",
    "operário-pr": "Operário-PR",
    "operario-pr": "Operário-PR",
    "vila nova": "Vila Nova",
    "vila nova-go": "Vila Nova",
    "ponte preta": "Ponte Preta",
    "crb": "CRB",
    "crb-al": "CRB",
    "paysandu": "Paysandu",
    "paysandu-pa": "Paysandu",
    "chapecoense": "Chapecoense",
    "botafogo": "Botafogo-SP",
    "botafogo-sp": "Botafogo-SP",
    "brusque": "Brusque",
    "amazonas": "Amazonas",
    "amazonas fc": "Amazonas",
    "ituano": "Ituano",
    "ituano-sp": "Ituano",
    "guarani": "Guarani",
    "guarani fc": "Guarani",
    "corinthians": "Corinthians",
    "palmeiras": "Palmeiras",
    "vasco": "Vasco",
    "vasco da gama": "Vasco",
    "grêmio": "Grêmio",
    "gremio": "Grêmio",
    "cruzeiro": "Cruzeiro",
    "fluminense": "Fluminense",
    "atlético-mg": "Atlético-MG",
    "atletico-mg": "Atlético-MG",
    "internacional": "Internacional",
    "bahia": "Bahia",
    "fortaleza": "Fortaleza",
    "vitória": "Vitória",
    "vitoria": "Vitória",
    "juventude": "Juventude",
    "criciúma": "Criciúma",
    "criciuma": "Criciúma",
    "atlético-go": "Atlético-GO",
    "atletico-go": "Atlético-GO",
    "bragantino": "Red Bull Bragantino",
    "red bull bragantino": "Red Bull Bragantino",
    "cuiabá": "Cuiabá",
    "cuiaba": "Cuiabá",
    "paraná": "Paraná",
    "parana": "Paraná",
    "paraná clube": "Paraná",
    "náutico": "Náutico",
    "nautico": "Náutico",
    "santa cruz": "Santa Cruz",
    "são caetano": "São Caetano",
    "sao caetano": "São Caetano",
    "figueirense": "Figueirense",
    "joinville": "Joinville",
    "brasiliense": "Brasiliense",
    "gama": "Gama",
    "remo": "Remo",
    "londrina": "Londrina",
    "sampaio corrêa": "Sampaio Corrêa",
    "sampaio correa": "Sampaio Corrêa",
    "caxias": "Caxias",
    "brasil de pelotas": "Brasil de Pelotas",
    "ge brasil": "Brasil de Pelotas",
    "csa": "CSA",
    "abc": "ABC",
    "américa-rn": "América-RN",
    "america-rn": "América-RN",
    "portuguesa": "Portuguesa",
    "oeste": "Oeste",
    "barueri": "Barueri",
    "grêmio barueri": "Barueri",
    "ipatinga": "Ipatinga",
    "tombense": "Tombense",
    "porto alegre": "Porto Alegre",
    "marília": "Marília",
    "marilia": "Marília",
    "paulista": "Paulista",
    "santo andré": "Santo André",
    "santo andre": "Santo André",
    "xv de piracicaba": "XV de Piracicaba",
    "bangu": "Bangu",
    "volta redonda": "Volta Redonda",
    "confiança": "Confiança",
    "botafogo-pb": "Botafogo-PB",
    "treze": "Treze",
    "campinense": "Campinense",
    "ferroviário": "Ferroviário",
    "ferroviario": "Ferroviário",
}

def normalizar_clube(raw):
    raw_clean = re.sub(r'\s+', ' ', raw).strip()
    raw_clean = re.sub(r'[\(\-/][A-Z]{2}\)?$', '', raw_clean).strip()
    return MAPA_CLUBES.get(raw_clean.lower(), raw_clean)

def extrair_partidas_arquivo(filepath, ano):
    if not os.path.exists(filepath):
        return []
        
    with open(filepath, 'r', encoding='latin1', errors='ignore') as f:
        html = f.read()
        
    soup = BeautifulSoup(html, 'html.parser')
    lines = [l.strip() for l in soup.get_text().splitlines() if l.strip()]
    
    matches = []
    current_date = f"{ano}-06-01"
    current_fase = "Fase Regular"
    
    i = 0
    while i < len(lines):
        clean = " ".join(lines[i].split())
        
        # Detecta Data
        m_date = re.search(r'(\d{2})[/\.](\d{2})[/\.](\d{4})', clean)
        if m_date:
            dia, mes, a = m_date.groups()
            current_date = f"{a}-{mes}-{dia}"
            i += 1
            continue
            
        # Detecta Rodada / Fase
        m_rod = re.search(r'(\d+)[ªa]\s*Rodada', clean, re.I)
        if m_rod:
            current_fase = f"{m_rod.group(1)}ª Rodada"
            i += 1
            continue
        elif any(f in clean.lower() for f in ["final", "semifinal", "segunda fase", "primeira fase", "fase final", "quadrangular", "oitavas", "quartas", "turno", "retorno"]):
            if len(clean) < 40 and not re.search(r'\d+x\d+', clean):
                current_fase = clean
                i += 1
                continue

        # Padrão 1: Linha única "TimeA 2x1 TimeB"
        m1 = re.search(r'^([A-Za-zÀ-ÿ0-9\s\.\-]+?)\s+(\d{1,2})\s*[xX]\s*(\d{1,2})\s+([A-Za-zÀ-ÿ0-9\s\.\-]+?)$', clean)
        if m1 and not clean.startswith('Local:') and not clean.startswith('Gols:'):
            man_raw, gm, gv, vis_raw = m1.group(1).strip(), int(m1.group(2)), int(m1.group(3)), m1.group(4).strip()
            if len(man_raw) > 1 and len(vis_raw) > 1 and not any(w in man_raw.lower() or w in vis_raw.lower() for w in ['rodada', 'local:', 'feira']):
                matches.append((current_date, current_fase, man_raw, gm, gv, vis_raw))
                i += 1
                continue

        # Padrão 2: Duas linhas "TimeA 2x1" seguido de "TimeB"
        m2 = re.search(r'^([A-Za-zÀ-ÿ0-9\s\.\-]+?)\s+(\d{1,2})\s*[xX]\s*(\d{1,2})$', clean)
        if m2 and i + 1 < len(lines) and not clean.startswith('Local:'):
            next_line = " ".join(lines[i+1].split())
            if not re.search(r'\d+x\d+', next_line) and not next_line.startswith('Local:') and not next_line.startswith('Público:') and len(next_line) > 1:
                man_raw, gm, gv, vis_raw = m2.group(1).strip(), int(m2.group(2)), int(m2.group(3)), next_line.strip()
                if not any(w in man_raw.lower() or w in vis_raw.lower() for w in ['rodada', 'local:', 'feira', 'turno']):
                    matches.append((current_date, current_fase, man_raw, gm, gv, vis_raw))
                    i += 2
                    continue

        # Padrão 3: Três linhas "TimeA", "2x1", "TimeB"
        m3 = re.match(r'^(\d{1,2})\s*[xX]\s*(\d{1,2})$', clean)
        if m3 and i > 0 and i + 1 < len(lines):
            prev_line = " ".join(lines[i-1].split())
            next_line = " ".join(lines[i+1].split())
            if len(prev_line) > 1 and len(next_line) > 1 and not any(w in prev_line.lower() or w in next_line.lower() for w in ['rodada', 'local:', 'feira', 'turno']):
                gm, gv = int(m3.group(1)), int(m3.group(2))
                matches.append((current_date, current_fase, prev_line, gm, gv, next_line))
                i += 2
                continue
                
        i += 1

    partidas_estruturadas = []
    for dt, fase, m_raw, gm, gv, v_raw in matches:
        man = normalizar_clube(m_raw)
        vis = normalizar_clube(v_raw)
        
        # Ajuste especial do Botafogo do Rio nos anos em que disputou a Série B (2003, 2015, 2021)
        if ano in [2003, 2015, 2021]:
            if m_raw.lower() in ['botafogo', 'botafogo-rj', 'botafogo (rj)', 'botafogo fr']:
                man = 'Botafogo'
            if v_raw.lower() in ['botafogo', 'botafogo-rj', 'botafogo (rj)', 'botafogo fr']:
                vis = 'Botafogo'
                
        if gm > gv:
            venc = man
        elif gv > gm:
            venc = vis
        else:
            venc = 'Empate'
            
        partidas_estruturadas.append({
            "ano": ano,
            "rodada": fase,
            "data": dt,
            "mandante": man,
            "visitante": vis,
            "gols_mandante": gm,
            "gols_visitante": gv,
            "placar": f"{gm}x{gv}",
            "vencedor": venc,
            "campeonato": "Campeonato Brasileiro - Série B",
            "formato": "Pontos Corridos" if ano >= 2006 else "Mata-Mata / Misto",
            "fase": fase
        })
        
    return partidas_estruturadas

def minerar_tudo():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    years = [
        1971, 1972, 1980, 1981, 1982, 1983, 1984, 1985, 1986, 1987, 1988, 1989,
        1990, 1991, 1992, 1994, 1995, 1996, 1997, 1998, 1999, 2000, 2001, 2002,
        2003, 2004, 2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014,
        2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024
    ]
    
    base_url = "https://www.bolanaarea.com/"
    ignore_words = ['almanaque', 'participantes', 'clubes', 'historia', 'classificacao', 'estatisticas', 'partic.htm']
    
    total_novas = 0
    total_processadas = 0
    
    print(">>> EXECUTANDO MINERAÇÃO COMPLETA DA SÉRIE B (PARSER UNIFICADO)...")
    
    for ano in years:
        ano_dir = os.path.join(CACHE_DIR, str(ano))
        os.makedirs(ano_dir, exist_ok=True)
        
        main_file = os.path.join(ano_dir, f"serie_b_{ano}.htm")
        if not os.path.exists(main_file) or os.path.getsize(main_file) < 500:
            try:
                req = urllib.request.Request(f"{base_url}serie_b_{ano}.htm", headers={'User-Agent': 'Mozilla/5.0'})
                with open(main_file, 'wb') as f:
                    f.write(urllib.request.urlopen(req, timeout=5).read())
            except Exception:
                pass
                
        sub_files = []
        if os.path.exists(main_file):
            with open(main_file, 'r', encoding='latin1', errors='ignore') as f:
                soup = BeautifulSoup(f.read(), 'html.parser')
            for a in soup.find_all('a'):
                h = a.get('href', '').strip()
                if h.startswith(f"serie_b_{ano}_") and h.endswith(".htm") and not any(ign in h for ign in ignore_words):
                    if h not in sub_files:
                        sub_files.append(h)
                        
        # Garante turno1 e turno2 em anos recentes
        if ano in [2009, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024]:
            for t in [f"serie_b_{ano}_turno1.htm", f"serie_b_{ano}_turno2.htm"]:
                if t not in sub_files:
                    sub_files.append(t)
                    
        if not sub_files:
            sub_files = [f"serie_b_{ano}.htm"]
            
        partidas_ano = []
        for fn in sub_files:
            local_path = os.path.join(ano_dir, fn)
            if not os.path.exists(local_path) or os.path.getsize(local_path) < 500:
                try:
                    req = urllib.request.Request(f"{base_url}{fn}", headers={'User-Agent': 'Mozilla/5.0'})
                    data = urllib.request.urlopen(req, timeout=5).read()
                    with open(local_path, 'wb') as f:
                        f.write(data)
                except Exception:
                    continue
            pts = extrair_partidas_arquivo(local_path, ano)
            partidas_ano.extend(pts)
            
        novas_ano = 0
        partida_idx = 1
        for p in partidas_ano:
            cursor.execute("""
                SELECT id_partida FROM partidas 
                WHERE data = ? AND mandante = ? AND visitante = ?
            """, (p['data'], p['mandante'], p['visitante']))
            if cursor.fetchone():
                continue
                
            id_p = int(f"{ano}2{partida_idx:04d}")
            partida_idx += 1
            
            cursor.execute("""
                INSERT OR IGNORE INTO partidas (
                    id_partida, ano, rodada, data, mandante, visitante,
                    gols_mandante, gols_visitante, placar, vencedor,
                    campeonato, formato, fase
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                id_p, p['ano'], p['rodada'], p['data'], p['mandante'], p['visitante'],
                p['gols_mandante'], p['gols_visitante'], p['placar'], p['vencedor'],
                p['campeonato'], p['formato'], p['fase']
            ))
            if cursor.rowcount > 0:
                novas_ano += 1
                
        conn.commit()
        total_novas += novas_ano
        total_processadas += len(partidas_ano)
        print(f"  [Ano {ano}] Extraídas: {len(partidas_ano):<4} | Inseridas no banco: {novas_ano}")
        
    conn.close()
    print("="*75)
    print(f">>> MINERAÇÃO SÉRIE B CONCLUÍDA:")
    print(f"  • Total de partidas processadas: {total_processadas}")
    print(f"  • Total de novas partidas inseridas no futebol.db: {total_novas}")

if __name__ == "__main__":
    minerar_tudo()
