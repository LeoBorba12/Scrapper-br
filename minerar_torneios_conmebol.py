"""
MINERADOR COMPLETO DE TORNEIOS CONMEBOL (1960 A 2024)
Copa Libertadores, Copa Sul-Americana, Supercopa Libertadores, Copa Mercosul, Copa CONMEBOL e Recopa
"""

import os
import re
import sqlite3
from bs4 import BeautifulSoup

DB_PATH = os.path.join("data", "futebol.db")

MONTHS = {
    'jan': 1, 'feb': 2, 'mar': 3, 'apr': 4, 'may': 5, 'jun': 6,
    'jul': 7, 'aug': 8, 'sep': 9, 'oct': 10, 'nov': 11, 'dec': 12
}

COUNTRIES = r'(?:Arg|Bra|Bol|Chi|Col|Ecu|Par|Per|Uru|Ven|Mex)'

CLUB_NORMALIZATION = {
    'atletico mineiro': 'Atlético-MG',
    'atlético mineiro': 'Atlético-MG',
    'ca mineiro': 'Atlético-MG',
    'atl. mineiro': 'Atlético-MG',
    'atletico-mg': 'Atlético-MG',
    'atlético-mg': 'Atlético-MG',
    'sao paulo': 'São Paulo',
    'são paulo': 'São Paulo',
    'sao paulo fc': 'São Paulo',
    'são paulo fc': 'São Paulo',
    'palmeiras': 'Palmeiras',
    'se palmeiras': 'Palmeiras',
    'santos': 'Santos',
    'santos fc': 'Santos',
    'flamengo': 'Flamengo',
    'cr flamengo': 'Flamengo',
    'corinthians': 'Corinthians',
    'sc corinthians': 'Corinthians',
    'gremio': 'Grêmio',
    'grêmio': 'Grêmio',
    'gremio porto alegre': 'Grêmio',
    'grêmio porto alegre': 'Grêmio',
    'internacional': 'Internacional',
    'sc internacional': 'Internacional',
    'cruzeiro': 'Cruzeiro',
    'cruzeiro ec': 'Cruzeiro',
    'vasco': 'Vasco da Gama',
    'vasco da gama': 'Vasco da Gama',
    'cr vasco da gama': 'Vasco da Gama',
    'fluminense': 'Fluminense',
    'fluminense fc': 'Fluminense',
    'botafogo': 'Botafogo',
    'botafogo fr': 'Botafogo',
    'atletico paranaense': 'Athletico-PR',
    'atlético paranaense': 'Athletico-PR',
    'athletico paranaense': 'Athletico-PR',
    'athletico-pr': 'Athletico-PR',
    'atletico-pr': 'Athletico-PR',
    'atlético-pr': 'Athletico-PR',
    'bahia': 'Bahia',
    'ec bahia': 'Bahia',
    'coritiba': 'Coritiba',
    'coritiba fbc': 'Coritiba',
    'fortaleza': 'Fortaleza',
    'fortaleza ec': 'Fortaleza',
    'sport': 'Sport',
    'sport recife': 'Sport',
    'ceara': 'Ceará',
    'ceará': 'Ceará',
    'ceara sc': 'Ceará',
    'goias': 'Goiás',
    'goiás': 'Goiás',
    'goias ec': 'Goiás',
    'bragantino': 'Red Bull Bragantino',
    'red bull bragantino': 'Red Bull Bragantino',
    'rb bragantino': 'Red Bull Bragantino',
    'america mineiro': 'América-MG',
    'américa mineiro': 'América-MG',
    'chapecoense': 'Chapecoense',
    'criciuma': 'Criciúma',
    'criciúma': 'Criciúma',
    'juventude': 'Juventude',
    'ec juventude': 'Juventude',
    'sao caetano': 'São Caetano',
    'são caetano': 'São Caetano',
    'paysandu': 'Paysandu',
    'parana': 'Paraná',
    'paraná': 'Paraná',
    'parana clube': 'Paraná',
    'santo andre': 'Santo André',
    'santo andré': 'Santo André',
    'paulista': 'Paulista',
    'ponte preta': 'Ponte Preta',
    'cuiaba': 'Cuiabá',
    'cuiabá': 'Cuiabá',
    'atletico goianiense': 'Atlético-GO',
    'atlético goianiense': 'Atlético-GO',
}

def clean_team_name(name):
    # Strip HTML tags
    name = re.sub(r'<[^>]+>', '', name).strip()
    # Strip city/extra in parentheses e.g. "Flamengo (Rio de Janeiro)" -> "Flamengo"
    name = re.sub(r'\s*\([A-Za-z0-9\.\s\,\'\-]+\)$', '', name).strip()
    # Strip trailing country code
    name = re.sub(rf'\s+{COUNTRIES}$', '', name, flags=re.IGNORECASE).strip()
    norm = CLUB_NORMALIZATION.get(name.lower())
    if norm:
        return norm
    return name

def parse_scorers(text, team):
    goals = []
    if not text:
        return goals
    last_player = 'Desconhecido'
    for item in text.split(','):
        item = item.strip()
        if not item:
            continue
        is_pen = 'pen' in item.lower()
        is_og = 'og' in item.lower() or 'o/g' in item.lower()
        clean = re.sub(r'(?:pen|og|o/g)', '', item, flags=re.IGNORECASE).strip()
        m_min = re.search(r'(\d+)\+?$', clean)
        if m_min:
            minuto = int(m_min.group(1))
            cand = clean[:m_min.start()].strip()
            player = cand if cand else last_player
        else:
            minuto = None
            player = clean if clean else last_player
        last_player = player
        tipo = 'Pênalti' if is_pen else ('Gol Contra' if is_og else 'Normal')
        if player and player != 'Desconhecido':
            goals.append({
                'jogador': player,
                'minuto': minuto,
                'tipo': tipo,
                'clube': team
            })
    return goals

def parse_scorers_line(line, mandante, visitante):
    line = line.strip().lstrip('[').rstrip(']').strip()
    if not line:
        return []
    parts = line.split(';')
    mandante_str = parts[0].strip() if len(parts) > 0 else ''
    visitante_str = parts[1].strip() if len(parts) > 1 else ''
    
    res = []
    res.extend(parse_scorers(mandante_str, mandante))
    res.extend(parse_scorers(visitante_str, visitante))
    return res

def parse_conmebol_file(year, filepath, competition_name):
    with open(filepath, 'r', encoding='latin1', errors='replace') as f:
        html = f.read()
    
    # Normalize dashes and html spaces
    html = html.replace('\x96', '-').replace('\u2013', '-').replace('\u2014', '-').replace('–', '-').replace('&nbsp;', ' ')
    soup = BeautifulSoup(html, 'html.parser')
    text = soup.get_text()
    lines = [l.strip() for l in text.split('\n') if l.strip()]
    
    matches = []
    current_dates = None
    current_round = "Fase de Grupos"
    
    p_two_leg = re.compile(rf'^([^\d\n\r]+?)\s+{COUNTRIES}\s+([^\d\n\r]+?)\s+{COUNTRIES}\s+(\d+)\s*[-:]\s*(\d+)\s+(\d+)\s*[-:]\s*(\d+)(.*)$', re.IGNORECASE)
    p_two_leg_dash = re.compile(r'^([^\d\n\r]+?)\s*(?:\([A-Za-z0-9\s]+\))?\s*-\s*([^\d\n\r]+?)\s*(?:\([A-Za-z0-9\s]+\))?\s+(\d+)\s*[-:]\s*(\d+)\s+(\d+)\s*[-:]\s*(\d+)(.*)$')
    p_single1 = re.compile(r'^(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+(\d{1,2})\s*:\s*(.+?)\s*-\s*(.+?)\s+(\d+)\s*[-:]\s*(\d+)(.*)$', re.IGNORECASE)
    p_single2 = re.compile(r'^(\d{1,2})\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s*:\s*(.+?)\s*-\s*(.+?)\s+(\d+)\s*[-:]\s*(\d+)(.*)$', re.IGNORECASE)
    p_single3 = re.compile(r'^(\d{1,2})\.(\d{1,2})(?:\.\d{2,4})?\s*[:\-]\s*(.+?)\s*-\s*(.+?)\s+(\d+)\s*[-:]\s*(\d+)(.*)$')
    p_single_knockout = re.compile(rf'^([^\d\n\r]+?)\s+{COUNTRIES}\s+([^\d\n\r]+?)\s+{COUNTRIES}\s+(\d+)\s*[-:]\s*(\d+)(.*)$', re.IGNORECASE)
    
    p_date_header = re.compile(r'[\(\[]((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[^\)\]]+)[\)\]]', re.IGNORECASE)
    
    i = 0
    while i < len(lines):
        line = lines[i]
        
        # Track round
        if 'qualifying' in line.lower() or 'preliminary' in line.lower():
            current_round = "Fase Preliminar"
        elif 'group' in line.lower():
            current_round = "Fase de Grupos"
        elif 'round of 16' in line.lower() or 'second round' in line.lower() or 'octavos' in line.lower():
            current_round = "Oitavas de Final"
        elif 'quarter' in line.lower() or 'cuartos' in line.lower():
            current_round = "Quartas de Final"
        elif 'semi' in line.lower():
            current_round = "Semifinal"
        elif 'final' in line.lower() and not 'semi' in line.lower() and not 'quarter' in line.lower() and not 'doctype' in line.lower():
            current_round = "Final"
            
        # Check date header
        dh_match = p_date_header.search(line)
        if dh_match and not p_single1.search(line) and not p_two_leg.search(line):
            raw_dates = dh_match.group(1)
            parts = re.findall(r'(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)?\s*(\d{1,2})', raw_dates, re.IGNORECASE)
            cur_month = 'Jan'
            parsed_dates = []
            for m_str, d_str in parts:
                if m_str:
                    cur_month = m_str.capitalize()
                parsed_dates.append(f"{year}-{MONTHS.get(cur_month.lower(), 1):02d}-{int(d_str):02d}")
            if parsed_dates:
                current_dates = parsed_dates

        # Two-leg knockout
        m_leg = p_two_leg.match(line)
        if not m_leg:
            m_leg_dash = p_two_leg_dash.match(line)
            if m_leg_dash and not line.startswith('1.') and not line.startswith('2.'):
                t1, t2, g1_leg1, g2_leg1, g1_leg2, g2_leg2, rest = m_leg_dash.groups()
                m_leg = (t1, t2, g1_leg1, g2_leg1, g1_leg2, g2_leg2, rest)
        else:
            t1, t2, g1_leg1, g2_leg1, g1_leg2, g2_leg2, rest = m_leg.groups()
            m_leg = (t1, t2, g1_leg1, g2_leg1, g1_leg2, g2_leg2, rest)
            
        if m_leg and not line.startswith('1.') and not line.startswith('2.') and not line.startswith('3.') and not line.startswith('4.'):
            t1, t2, g1_leg1, g2_leg1, g1_leg2, g2_leg2, rest = m_leg
            t1 = clean_team_name(t1)
            t2 = clean_team_name(t2)
            
            d1 = current_dates[0] if current_dates and len(current_dates) > 0 else f"{year}-06-01"
            d2 = current_dates[1] if current_dates and len(current_dates) > 1 else f"{year}-06-08"
            
            # Scorers
            s1 = ""
            s2 = ""
            if i + 1 < len(lines) and lines[i+1].startswith('['):
                s1 = lines[i+1]
                if i + 2 < len(lines) and lines[i+2].startswith('['):
                    s2 = lines[i+2]
            
            # Leg 1
            matches.append({
                'ano': year,
                'campeonato': competition_name,
                'rodada': current_round,
                'data': d1,
                'mandante': t1,
                'visitante': t2,
                'gols_mandante': int(g1_leg1),
                'gols_visitante': int(g2_leg1),
                'scorers_raw': s1
            })
            # Leg 2 (reverse home/away)
            matches.append({
                'ano': year,
                'campeonato': competition_name,
                'rodada': current_round,
                'data': d2,
                'mandante': t2,
                'visitante': t1,
                'gols_mandante': int(g1_leg2),
                'gols_visitante': int(g2_leg2),
                'scorers_raw': s2
            })
            i += 1
            continue

        # Single match Format 1
        m1 = p_single1.match(line)
        if m1 and not line.startswith('1.') and not line.startswith('2.'):
            mon, d, t1, t2, g1, g2, rest = m1.groups()
            match_date = f"{year}-{MONTHS.get(mon.lower(), 1):02d}-{int(d):02d}"
            s = ""
            if i + 1 < len(lines) and lines[i+1].startswith('['):
                s = lines[i+1]
            matches.append({
                'ano': year,
                'campeonato': competition_name,
                'rodada': current_round,
                'data': match_date,
                'mandante': clean_team_name(t1),
                'visitante': clean_team_name(t2),
                'gols_mandante': int(g1),
                'gols_visitante': int(g2),
                'scorers_raw': s
            })
            i += 1
            continue

        # Single match Format 2
        m2 = p_single2.match(line)
        if m2 and not line.startswith('1.') and not line.startswith('2.'):
            d, mon, t1, t2, g1, g2, rest = m2.groups()
            match_date = f"{year}-{MONTHS.get(mon.lower(), 1):02d}-{int(d):02d}"
            s = ""
            if i + 1 < len(lines) and lines[i+1].startswith('['):
                s = lines[i+1]
            matches.append({
                'ano': year,
                'campeonato': competition_name,
                'rodada': current_round,
                'data': match_date,
                'mandante': clean_team_name(t1),
                'visitante': clean_team_name(t2),
                'gols_mandante': int(g1),
                'gols_visitante': int(g2),
                'scorers_raw': s
            })
            i += 1
            continue

        # Single knockout final (e.g. 2019-2024 single match finals)
        if current_round == "Final":
            m_fin = p_single_knockout.match(line)
            if m_fin and not p_two_leg.match(line):
                t1, t2, g1, g2, rest = m_fin.groups()
                d_fin = current_dates[0] if current_dates else f"{year}-11-20"
                s = ""
                if i + 1 < len(lines) and lines[i+1].startswith('['):
                    s = lines[i+1]
                matches.append({
                    'ano': year,
                    'campeonato': competition_name,
                    'rodada': "Final",
                    'data': d_fin,
                    'mandante': clean_team_name(t1),
                    'visitante': clean_team_name(t2),
                    'gols_mandante': int(g1),
                    'gols_visitante': int(g2),
                    'scorers_raw': s
                })
                i += 1
                continue

        i += 1
        
    return matches


def parse_recopa(filepath):
    with open(filepath, 'r', encoding='latin1', errors='replace') as f:
        html = f.read()
    html = html.replace('\x96', '-').replace('\u2013', '-').replace('\u2014', '-').replace('–', '-').replace('&nbsp;', ' ')
    soup = BeautifulSoup(html, 'html.parser')
    lines = [l.strip() for l in soup.get_text().split('\n') if l.strip()]
    
    matches = []
    p_recopa = re.compile(r'^(?:(\d{4})\s+)?([A-Za-z0-9\.\'\s\-\/]+?)\s+(\d+)\s*[-:]\s*(\d+)\s+([A-Za-z0-9\.\'\s\-\/]+?)(?:\s+(?:pen|aet|in|\(|\d).*?)?$', re.IGNORECASE)
    cur_year = 1988
    for l in lines:
        m = p_recopa.match(l)
        if m:
            yr, t1, g1, g2, t2 = m.groups()
            if yr:
                cur_year = int(yr)
            if any(char.isdigit() for char in t1) or any(char.isdigit() for char in t2):
                continue
            if len(t1.strip()) < 3 or len(t2.strip()) < 3:
                continue
            matches.append({
                'ano': cur_year,
                'campeonato': 'Recopa Sul-Americana',
                'rodada': 'Final',
                'data': f"{cur_year}-07-15",
                'mandante': clean_team_name(t1),
                'visitante': clean_team_name(t2),
                'gols_mandante': int(g1),
                'gols_visitante': int(g2),
                'scorers_raw': ''
            })
    return matches


def run_ingestion(dry_run=True):
    print("=" * 80)
    print("INICIANDO MINERAÇÃO COMPLETA DE TORNEIOS CONMEBOL (1960 A 2024)")
    print(f"Modo: {'SIMULAÇÃO (DRY RUN)' if dry_run else 'GRAVAÇÃO NO BANCO DE DADOS'}")
    print("=" * 80)
    
    tournaments = [
        ('Copa Libertadores', 'libertadores', range(1960, 2025), lambda y: f"copa{y % 100:02d}.html" if y < 2010 else f"copa{y}.html", 7000),
        ('Copa Sul-Americana', 'sulamericana', range(2002, 2025), lambda y: f"sudamcup{y % 100:02d}.html" if y < 2010 else f"sudamcup{y}.html", 8000),
        ('Supercopa Libertadores', 'supercopa', range(1988, 1998), lambda y: f"supcopa{y % 100:02d}.html", 8500),
        ('Copa Mercosul', 'mercosur', range(1998, 2002), lambda y: f"mercosur{y % 100:02d}.html", 8700),
        ('Copa CONMEBOL', 'conmebol', range(1992, 2000), lambda y: f"conmebol{y % 100:02d}.html", 8800),
    ]
    
    all_matches = []
    all_goals = []
    
    for comp_name, folder, years, fn_builder, id_offset in tournaments:
        comp_matches = 0
        comp_goals = 0
        for y in years:
            fn = fn_builder(y)
            fp = os.path.join("data", "raw_conmebol", folder, fn)
            if not os.path.exists(fp):
                continue
            m_list = parse_conmebol_file(y, fp, comp_name)
            
            # assign IDs and parse goals
            for idx, m in enumerate(m_list):
                match_id = y * 10000 + id_offset + idx + 1
                g_mand = m['gols_mandante']
                g_vis = m['gols_visitante']
                venc = m['mandante'] if g_mand > g_vis else (m['visitante'] if g_vis > g_mand else 'Empate')
                placar = f"{g_mand}x{g_vis}"
                
                m['partida_id'] = match_id
                m['vencedor'] = venc
                m['placar'] = placar
                
                # Goal scorers
                if m['scorers_raw']:
                    g_parsed = parse_scorers_line(m['scorers_raw'], m['mandante'], m['visitante'])
                    for g in g_parsed:
                        g['partida_id'] = match_id
                        g['ano'] = y
                        all_goals.append(g)
                        comp_goals += 1
                        
                all_matches.append(m)
                comp_matches += 1
                
        print(f"[{comp_name}]: {comp_matches} partidas, {comp_goals} gols detalhados minerados.")

    # Recopa
    recopa_path = os.path.join("data", "raw_conmebol", "recopa.html")
    if os.path.exists(recopa_path):
        recopa_matches = parse_recopa(recopa_path)
        for idx, m in enumerate(recopa_matches):
            y = m['ano']
            match_id = y * 10000 + 8900 + idx + 1
            g_mand = m['gols_mandante']
            g_vis = m['gols_visitante']
            venc = m['mandante'] if g_mand > g_vis else (m['visitante'] if g_vis > g_mand else 'Empate')
            placar = f"{g_mand}x{g_vis}"
            m['partida_id'] = match_id
            m['vencedor'] = venc
            m['placar'] = placar
            all_matches.append(m)
        print(f"[Recopa Sul-Americana]: {len(recopa_matches)} partidas mineradas.")

    print(f"\nTOTAL GERAL CONMEBOL MINERADO: {len(all_matches)} partidas e {len(all_goals)} gols detalhados.")

    if not dry_run:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        
        # Insert matches
        insert_match_sql = """
            INSERT OR REPLACE INTO partidas (
                id_partida, campeonato, formato, fase, ano, rodada, data, horario,
                mandante, visitante, gols_mandante, gols_visitante,
                vencedor, placar, estadio, cidade, estado, arbitro
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """
        
        insert_goal_sql = """
            INSERT INTO gols (
                id_partida, rodada, clube, atleta, minuto, tempo, tipo_de_gol
            ) VALUES (?, ?, ?, ?, ?, ?, ?)
        """
        
        print("Gravando partidas no banco futebol.db...")
        inserted_m = 0
        for m in all_matches:
            cursor.execute(insert_match_sql, (
                m['partida_id'], m['campeonato'], "Mata-Mata / Misto", m['rodada'],
                m['ano'], 1, m['data'], "16:00", m['mandante'], m['visitante'],
                m['gols_mandante'], m['gols_visitante'], m['vencedor'],
                m['placar'], "Estádio Conmebol", "América do Sul", "SA", "Árbitro Conmebol"
            ))
            inserted_m += 1
            
        print("Gravando gols detalhados no banco futebol.db...")
        match_ids = [m['partida_id'] for m in all_matches]
        if match_ids:
            for k in range(0, len(match_ids), 500):
                chunk = match_ids[k:k+500]
                cursor.execute(f"DELETE FROM gols WHERE id_partida IN ({','.join(map(str, chunk))})")
            
        inserted_g = 0
        for g in all_goals:
            cursor.execute(insert_goal_sql, (
                g['partida_id'], 1, g['clube'], g['jogador'],
                str(g['minuto']) if g['minuto'] else "", "1T/2T", g['tipo']
            ))
            inserted_g += 1
            
        conn.commit()
        
        cursor.execute("SELECT count(*) FROM partidas")
        tot_partidas = cursor.fetchone()[0]
        cursor.execute("SELECT count(*) FROM gols")
        tot_gols = cursor.fetchone()[0]
        conn.close()
        
        print("=" * 80)
        print("GRAVAÇÃO CONMEBOL CONCLUÍDA COM SUCESSO!")
        print(f"Partidas Inseridas: {inserted_m}")
        print(f"Gols Inseridos:     {inserted_g}")
        print(f"Total Geral Partidas em futebol.db: {tot_partidas:,}")
        print(f"Total Geral Gols em futebol.db:     {tot_gols:,}")
        print("=" * 80)

if __name__ == "__main__":
    import sys
    dry = "--commit" not in sys.argv
    run_ingestion(dry_run=dry)

