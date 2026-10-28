import urllib.request
from bs4 import BeautifulSoup
import re
from datetime import datetime

MAPA_SERIE_B = {
    "santos": "Santos",
    "sport": "Sport",
    "ceará": "Ceará",
    "ceara": "Ceará",
    "goiás": "Goiás",
    "goias": "Goiás",
    "coritiba": "Coritiba",
    "avaí": "Avaí",
    "avai": "Avaí",
    "novorizontino": "Novorizontino",
    "américa": "América-MG",
    "américa-mg": "América-MG",
    "america-mg": "América-MG",
    "mirassol": "Mirassol",
    "operário": "Operário-PR",
    "operario": "Operário-PR",
    "operário-pr": "Operário-PR",
    "vila nova": "Vila Nova",
    "ponte preta": "Ponte Preta",
    "crb": "CRB",
    "paysandu": "Paysandu",
    "chapecoense": "Chapecoense",
    "botafogo": "Botafogo-SP",  # Na Série B, Botafogo é o Botafogo-SP!
    "botafogo-sp": "Botafogo-SP",
    "brusque": "Brusque",
    "amazonas": "Amazonas",
    "ituano": "Ituano",
    "guarani": "Guarani",
}

def normalizar_clube(raw):
    raw_clean = re.sub(r'\s+', ' ', raw).strip()
    # Remove estados como (SP), -SP, /SP se houver
    raw_clean = re.sub(r'[\(\-/][A-Z]{2}\)?$', '', raw_clean).strip()
    return MAPA_SERIE_B.get(raw_clean.lower(), raw_clean)

def extrair_jogos_turno(url, ano, turno):
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    html = urllib.request.urlopen(req).read().decode('latin1', errors='ignore')
    soup = BeautifulSoup(html, 'html.parser')
    
    # Encontra todas as linhas de texto da tabela principal
    for td in soup.find_all('td'):
        if 'Novorizontino' in td.get_text() and '2x1' in td.get_text():
            table = td.find_parent('table')
            break
    else:
        table = soup
        
    partidas = []
    current_date = None
    current_rodada = f"Turno {turno}"
    
    lines = [r.get_text().strip() for r in table.find_all('tr') if r.get_text().strip()]
    
    for l in lines:
        clean_line = " ".join(l.split())
        
        # Detecta Rodada
        m_rod = re.search(r'(\d+)[ªa]\s*Rodada', clean_line, re.I)
        if m_rod:
            current_rodada = f"{m_rod.group(1)}ª Rodada"
            continue
            
        # Detecta Data (ex: 19/04/2024 - Sexta-feira)
        m_date = re.search(r'(\d{2})/(\d{2})/(\d{4})', clean_line)
        if m_date:
            dia, mes, a = m_date.groups()
            current_date = f"{a}-{mes}-{dia}"
            continue
            
        # Detecta Partida (ex: Novorizontino 2x1 CRB ou Sport 2x0 Vila Nova)
        m_match = re.search(r'^([A-Za-zÀ-ÿ\s\.\-]+?)\s*(\d{1,2})\s*[xX]\s*(\d{1,2})\s*([A-Za-zÀ-ÿ\s\.\-]+?)$', clean_line)
        if m_match and not clean_line.startswith('Local:') and not clean_line.startswith('Gols:'):
            man_raw = m_match.group(1).strip()
            gm = int(m_match.group(2))
            gv = int(m_match.group(3))
            vis_raw = m_match.group(4).strip()
            
            # Se a linha capturou "Local" ou algo irrelevante, pula
            if len(man_raw) < 2 or len(vis_raw) < 2 or 'Local:' in man_raw or 'Rodada' in man_raw:
                continue
                
            man = normalizar_clube(man_raw)
            vis = normalizar_clube(vis_raw)
            
            if gm > gv:
                venc = man
            elif gv > gm:
                venc = vis
            else:
                venc = 'Empate'
                
            partidas.append({
                "ano": ano,
                "rodada": current_rodada,
                "data": current_date or f"{ano}-01-01",
                "mandante": man,
                "visitante": vis,
                "gols_mandante": gm,
                "gols_visitante": gv,
                "placar": f"{gm}x{gv}",
                "vencedor": venc,
                "campeonato": "Campeonato Brasileiro - Série B",
                "formato": "Pontos Corridos",
                "fase": current_rodada
            })
            
    return partidas

p1 = extrair_jogos_turno("https://www.bolanaarea.com/serie_b_2024_turno1.htm", 2024, 1)
p2 = extrair_jogos_turno("https://www.bolanaarea.com/serie_b_2024_turno2.htm", 2024, 2)
print(f"Turno 1 extraído: {len(p1)} partidas (esperado: 190)")
print(f"Turno 2 extraído: {len(p2)} partidas (esperado: 190)")
print(f"Total 2024 extraído: {len(p1) + len(p2)} partidas (esperado: 380)")

if p1:
    print("\nAmostra Turno 1:")
    for p in p1[:5]:
        print(f"  {p['data']} | {p['rodada']} | {p['mandante']} {p['placar']} {p['visitante']} | Venc: {p['vencedor']}")
