from bs4 import BeautifulSoup
import re
import os

def test_unified_parser(filepath, ano):
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
        
        # Date
        m_date = re.search(r'(\d{2})[/\.](\d{2})[/\.](\d{4})', clean)
        if m_date:
            dia, mes, a = m_date.groups()
            current_date = f"{a}-{mes}-{dia}"
            i += 1
            continue
            
        # Rodada
        m_rod = re.search(r'(\d+)[ªa]\s*Rodada', clean, re.I)
        if m_rod:
            current_fase = f"{m_rod.group(1)}ª Rodada"
            i += 1
            continue

        # Pattern 1: Single line "TeamA 2x1 TeamB"
        m1 = re.search(r'^([A-Za-zÀ-ÿ0-9\s\.\-]+?)\s+(\d{1,2})\s*[xX]\s*(\d{1,2})\s+([A-Za-zÀ-ÿ0-9\s\.\-]+?)$', clean)
        if m1 and not clean.startswith('Local:') and not clean.startswith('Gols:'):
            man, gm, gv, vis = m1.group(1).strip(), int(m1.group(2)), int(m1.group(3)), m1.group(4).strip()
            if len(man) > 1 and len(vis) > 1 and not any(w in man.lower() for w in ['rodada', 'local:']):
                matches.append((current_date, current_fase, man, f"{gm}x{gv}", vis))
                i += 1
                continue

        # Pattern 2: Two lines "TeamA 2x1" followed by "TeamB"
        m2 = re.search(r'^([A-Za-zÀ-ÿ0-9\s\.\-]+?)\s+(\d{1,2})\s*[xX]\s*(\d{1,2})$', clean)
        if m2 and i + 1 < len(lines) and not clean.startswith('Local:'):
            next_line = " ".join(lines[i+1].split())
            if not re.search(r'\d+x\d+', next_line) and not next_line.startswith('Local:') and not next_line.startswith('Público:') and len(next_line) > 1:
                man, gm, gv, vis = m2.group(1).strip(), int(m2.group(2)), int(m2.group(3)), next_line.strip()
                if not any(w in man.lower() or w in vis.lower() for w in ['rodada', 'local:', 'feira']):
                    matches.append((current_date, current_fase, man, f"{gm}x{gv}", vis))
                    i += 2
                    continue

        # Pattern 3: Three lines "TeamA" followed by "2x1" followed by "TeamB"
        m3 = re.match(r'^(\d{1,2})\s*[xX]\s*(\d{1,2})$', clean)
        if m3 and i > 0 and i + 1 < len(lines):
            prev_line = " ".join(lines[i-1].split())
            next_line = " ".join(lines[i+1].split())
            if len(prev_line) > 1 and len(next_line) > 1 and not any(w in prev_line.lower() or w in next_line.lower() for w in ['rodada', 'local:', 'feira', 'turno']):
                gm, gv = int(m3.group(1)), int(m3.group(2))
                matches.append((current_date, current_fase, prev_line, f"{gm}x{gv}", next_line))
                i += 2
                continue
                
        i += 1
        
    return matches

for yr, fns in [
    (2008, ["serie_b_2008_tb1.htm", "serie_b_2008_tb2.htm", "serie_b_2008_tb3.htm", "serie_b_2008_tb4.htm"]),
    (2013, ["serie_b_2013_turno1.htm", "serie_b_2013_turno2.htm"]),
    (2017, ["serie_b_2017_turno2.htm"]),
    (2020, ["serie_b_2020_turno1.htm", "serie_b_2020_turno2.htm"])
]:
    tot = 0
    for fn in fns:
        path = os.path.join("data", "raw_serieb", str(yr), fn)
        res = test_unified_parser(path, yr)
        tot += len(res)
    print(f"Ano {yr}: Total de partidas extraídas com parser unificado: {tot}")
