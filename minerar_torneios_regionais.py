"""
MINERADOR COMPLETO DE TORNEIOS REGIONAIS (RIO-SÃO PAULO, COPA DO NORDESTE, COPA SUL-MINAS)
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
    'sc corinthians paulista': 'Corinthians',
    'gremio': 'Grêmio',
    'grêmio': 'Grêmio',
    'gremio fbpa': 'Grêmio',
    'grêmio fbpa': 'Grêmio',
    'internacional': 'Internacional',
    'internacional-rs': 'Internacional',
    'sc internacional': 'Internacional',
    'cruzeiro': 'Cruzeiro',
    'cruzeiro ec': 'Cruzeiro',
    'vasco': 'Vasco da Gama',
    'vasco da gama': 'Vasco da Gama',
    'cr vasco da gama': 'Vasco da Gama',
    'fluminense': 'Fluminense',
    'fluminense fc': 'Fluminense',
    'fluminense-ba': 'Fluminense de Feira',
    'botafogo': 'Botafogo',
    'botafogo fr': 'Botafogo',
    'botafogo-rj': 'Botafogo',
    'botafogo-pb': 'Botafogo-PB',
    'botafogo (pb)': 'Botafogo-PB',
    'atletico paranaense': 'Athletico-PR',
    'atlético paranaense': 'Athletico-PR',
    'athletico paranaense': 'Athletico-PR',
    'athletico-pr': 'Athletico-PR',
    'atletico-pr': 'Athletico-PR',
    'atlético-pr': 'Athletico-PR',
    'bahia': 'Bahia',
    'ec bahia': 'Bahia',
    'vitoria': 'Vitória',
    'vitória': 'Vitória',
    'ec vitória': 'Vitória',
    'ec vitoria': 'Vitória',
    'coritiba': 'Coritiba',
    'coritiba fbc': 'Coritiba',
    'fortaleza': 'Fortaleza',
    'fortaleza ec': 'Fortaleza',
    'sport': 'Sport',
    'sport recife': 'Sport',
    'sport clube do recife': 'Sport',
    'ceara': 'Ceará',
    'ceará': 'Ceará',
    'ceara sc': 'Ceará',
    'ceará sc': 'Ceará',
    'nautico': 'Náutico',
    'náutico': 'Náutico',
    'c náutico capibaribe': 'Náutico',
    'santa cruz': 'Santa Cruz',
    'santa cruz fc': 'Santa Cruz',
    'santa cruz-pe': 'Santa Cruz',
    'santa cruz(pe)': 'Santa Cruz',
    'santa cruz(pb)': 'Santa Cruz-PB',
    'santa cruz-pb': 'Santa Cruz-PB',
    'goias': 'Goiás',
    'goiás': 'Goiás',
    'bragantino': 'Red Bull Bragantino',
    'red bull bragantino': 'Red Bull Bragantino',
    'america mineiro': 'América-MG',
    'américa mineiro': 'América-MG',
    'america-mg': 'América-MG',
    'américa-mg': 'América-MG',
    'america-rn': 'América-RN',
    'américa-rn': 'América-RN',
    'america(rn)': 'América-RN',
    'américa(rn)': 'América-RN',
    'america': 'América-RJ',
    'américa': 'América-RJ',
    'america-rj': 'América-RJ',
    'américa-rj': 'América-RJ',
    'america fc': 'América-RJ',
    'américa fc': 'América-RJ',
    'portuguesa': 'Portuguesa',
    'portuguesa de desportos': 'Portuguesa',
    'a portuguesa de desportos': 'Portuguesa',
    'bangu': 'Bangu',
    'bangu ac': 'Bangu',
    'sao caetano': 'São Caetano',
    'são caetano': 'São Caetano',
    'ad são caetano': 'São Caetano',
    'ad sao caetano': 'São Caetano',
    'ponte preta': 'Ponte Preta',
    'aa ponte preta': 'Ponte Preta',
    'guarani': 'Guarani',
    'guarani fc': 'Guarani',
    'criciuma': 'Criciúma',
    'criciúma': 'Criciúma',
    'criciuma ec': 'Criciúma',
    'juventude': 'Juventude',
    'ec juventude': 'Juventude',
    'parana': 'Paraná',
    'paraná': 'Paraná',
    'parana clube': 'Paraná',
    'paraná clube': 'Paraná',
    'figueirense': 'Figueirense',
    'figueirense fc': 'Figueirense',
    'joinville': 'Joinville',
    'joinville ec': 'Joinville',
    'chapecoense': 'Chapecoense',
    'abc': 'ABC',
    'abc fc': 'ABC',
    'crb': 'CRB',
    'csa': 'CSA',
    'sergipe': 'Sergipe',
    'cs sergipe': 'Sergipe',
    'confianca': 'Confiança',
    'confiança': 'Confiança',
    'ad confiança': 'Confiança',
    'treze': 'Treze',
    'treze fc': 'Treze',
    'jundiai': 'Paulista',
    'jundiaí': 'Paulista',
    'paulista': 'Paulista',
    'americano': 'Americano',
    'americano fc': 'Americano',
    'tubarao': 'Tubarão',
    'tubarão': 'Tubarão',
    'tubarão fc': 'Tubarão',
    'malutrom': 'J.Malucelli',
    'pelotas': 'Pelotas',
    'ec pelotas': 'Pelotas',
    'mamore': 'Mamoré',
    'mamoré': 'Mamoré',
    'urubupunga': 'Urubupungá',
    'ferroviario': 'Ferroviário',
    'ferroviário': 'Ferroviário',
    'ferroviario(ce)': 'Ferroviário',
}

def clean_team_name(name):
    name = re.sub(r'<[^>]+>', '', name).strip()
    # Remove city/state in parentheses e.g. "(São Paulo-SP)"
    name = re.sub(r'\s*\([A-Za-z0-9\.\s\,\'\-]+\)$', '', name).strip()
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
        is_pen = 'p' in item.lower() or 'pen' in item.lower()
        is_og = 'og' in item.lower() or 'o/g' in item.lower()
        clean = re.sub(r'(?:p|pen|og|o/g|\')', '', item, flags=re.IGNORECASE).strip()
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

def parse_regional_file(year, filepath, competition_name):
    with open(filepath, 'r', encoding='latin1', errors='replace') as f:
        html = f.read()
    
    html = html.replace('\x96', '-').replace('\u2013', '-').replace('\u2014', '-').replace('–', '-').replace('&nbsp;', ' ')
    soup = BeautifulSoup(html, 'html.parser')
    text = soup.get_text()
    lines = [l.strip() for l in text.split('\n') if l.strip()]
    
    matches = []
    current_date = f"{year}-03-15"
    current_round = "Fase Única"
    
    # Date pattern 1: [May 15] or [Jan 26] or [Feb 14, 19, 27]
    p_date_bracket = re.compile(r'^\[\s*(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+(\d{1,2})', re.IGNORECASE)
    # Date pattern 2: 15/12/1949 or 19-20/03 or 04/01/1950 or 28/01
    p_date_slash = re.compile(r'^(\d{1,2})(?:-\d{1,2})?\/(\d{1,2})(?:\/(\d{2,4}))?')
    
    # Match patterns:
    # Pattern 1: Team1 4-0 Team2 or Team1 4x0 Team2
    p_match1 = re.compile(r'^([^\d\n\r]+?)\s+(\d+)\s*[-xX:]\s*(\d+)\s+([^\d\n\r]+?)(?:\s+(?:pen|aet|in|\(|\d).*?)?$')
    # Pattern 2: Two-leg format: Team1 1-0 2-1 Team2
    p_match_two_leg = re.compile(r'^([^\d\n\r]+?)\s+(\d+)\s*[-xX:]\s*(\d+)\s+(\d+)\s*[-xX:]\s*(\d+)\s+([^\d\n\r]+?)(?:\s+.*)?$')
    
    i = 0
    while i < len(lines):
        line = lines[i]
        
        # Round tracking
        if 'round' in line.lower() or 'rodada' in line.lower() or 'fase' in line.lower():
            if 'first' in line.lower() or 'primeira' in line.lower():
                current_round = "Primeira Fase"
            elif 'second' in line.lower() or 'segunda' in line.lower():
                current_round = "Segunda Fase"
            elif 'semi' in line.lower():
                current_round = "Semifinal"
            elif 'final' in line.lower() and not 'semi' in line.lower():
                current_round = "Final"
            elif re.search(r'round\s+\d+', line, re.IGNORECASE):
                current_round = line
                
        # Date bracket [Month Day]
        db_m = p_date_bracket.match(line)
        if db_m:
            mon, d = db_m.groups()
            current_date = f"{year}-{MONTHS.get(mon.lower(), 1):02d}-{int(d):02d}"
            i += 1
            continue
            
        # Date slash DD/MM or DD/MM/YYYY
        ds_m = p_date_slash.match(line)
        if ds_m and not '-' in line[5:] and not 'x' in line.lower():
            d, m, y_str = ds_m.groups()
            match_y = int(y_str) if y_str else year
            if match_y < 100:
                match_y += 1900
            current_date = f"{match_y}-{int(m):02d}-{int(d):02d}"
            i += 1
            continue
            
        # Check two-leg knockout format (Copa do Nordeste knockout)
        m_2leg = p_match_two_leg.match(line)
        if m_2leg and not line.startswith('1.') and not line.startswith('2.'):
            t1, g1_1, g2_1, g1_2, g2_2, t2 = m_2leg.groups()
            t1 = clean_team_name(t1)
            t2 = clean_team_name(t2)
            if len(t1) >= 3 and len(t2) >= 3 and not any(c.isdigit() for c in t1) and not any(c.isdigit() for c in t2):
                matches.append({
                    'ano': year,
                    'campeonato': competition_name,
                    'rodada': current_round,
                    'data': current_date,
                    'mandante': t1,
                    'visitante': t2,
                    'gols_mandante': int(g1_1),
                    'gols_visitante': int(g2_1),
                    'scorers_raw': ''
                })
                matches.append({
                    'ano': year,
                    'campeonato': competition_name,
                    'rodada': current_round,
                    'data': current_date,
                    'mandante': t2,
                    'visitante': t1,
                    'gols_mandante': int(g1_2),
                    'gols_visitante': int(g2_2),
                    'scorers_raw': ''
                })
                i += 1
                continue

        # Check single match format: Team1 4-0 Team2 or Team1 4x0 Team2
        m_s = p_match1.match(line)
        if m_s and not line.startswith('1.') and not line.startswith('2.') and not line.startswith('3.') and not line.startswith('4.'):
            t1, g1, g2, t2 = m_s.groups()
            t1 = clean_team_name(t1)
            t2 = clean_team_name(t2)
            
            # Filter standings rows or invalid lines
            if len(t1) >= 3 and len(t2) >= 3 and not any(c.isdigit() for c in t1) and not any(c.isdigit() for c in t2):
                s = ""
                if i + 1 < len(lines) and lines[i+1].startswith('['):
                    s = lines[i+1]
                    # check multi-line scorers
                    j = i + 1
                    while j < len(lines) and not lines[j].endswith(']'):
                        j += 1
                        if j < len(lines):
                            s += " " + lines[j]
                matches.append({
                    'ano': year,
                    'campeonato': competition_name,
                    'rodada': current_round,
                    'data': current_date,
                    'mandante': t1,
                    'visitante': t2,
                    'gols_mandante': int(g1),
                    'gols_visitante': int(g2),
                    'scorers_raw': s
                })
                i += 1
                continue
                
        i += 1
        
    return matches

def run_ingestion(dry_run=True):
    print("=" * 80)
    print("INICIANDO MINERAÇÃO COMPLETA DE TORNEIOS REGIONAIS (1950 A 2003)")
    print(f"Modo: {'SIMULAÇÃO (DRY RUN)' if dry_run else 'GRAVAÇÃO NO BANCO DE DADOS'}")
    print("=" * 80)
    
    tournaments = [
        ('Torneio Rio-São Paulo', 'riosp', 1000),
        ('Copa do Nordeste', 'nordeste', 2000),
        ('Copa Sul-Minas', 'sulminas', 3000),
    ]
    
    all_matches = []
    all_goals = []
    
    for comp_name, folder, id_offset in tournaments:
        comp_matches = 0
        comp_goals = 0
        dir_path = os.path.join("data", "raw_regionais", folder)
        if not os.path.exists(dir_path):
            continue
            
        files = sorted(os.listdir(dir_path))
        for fn in files:
            if not fn.endswith('.html'):
                continue
            # extract year from filename
            digits = re.findall(r'\d+', fn)
            if not digits:
                continue
            yr_val = int(digits[0])
            year = yr_val if yr_val > 1000 else (1900 + yr_val if yr_val >= 30 else 2000 + yr_val)
            
            fp = os.path.join(dir_path, fn)
            m_list = parse_regional_file(year, fp, comp_name)
            
            for idx, m in enumerate(m_list):
                match_id = year * 10000 + id_offset + idx + 1
                g_mand = m['gols_mandante']
                g_vis = m['gols_visitante']
                venc = m['mandante'] if g_mand > g_vis else (m['visitante'] if g_vis > g_mand else 'Empate')
                placar = f"{g_mand}x{g_vis}"
                
                m['partida_id'] = match_id
                m['vencedor'] = venc
                m['placar'] = placar
                
                if m['scorers_raw']:
                    g_parsed = parse_scorers_line(m['scorers_raw'], m['mandante'], m['visitante'])
                    for g in g_parsed:
                        g['partida_id'] = match_id
                        g['ano'] = year
                        all_goals.append(g)
                        comp_goals += 1
                        
                all_matches.append(m)
                comp_matches += 1
                
        print(f"[{comp_name}]: {comp_matches} partidas, {comp_goals} gols detalhados minerados.")

    print(f"\nTOTAL GERAL REGIONAIS MINERADO: {len(all_matches)} partidas e {len(all_goals)} gols detalhados.")

    if not dry_run:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        
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
            est = "RJ" if any(r in m['mandante'] for r in ['Flamengo', 'Vasco', 'Fluminense', 'Botafogo', 'Bangu', 'América-RJ']) else "SP"
            cursor.execute(insert_match_sql, (
                m['partida_id'], m['campeonato'], "Torneio Regional", m['rodada'],
                m['ano'], 1, m['data'], "16:00", m['mandante'], m['visitante'],
                m['gols_mandante'], m['gols_visitante'], m['vencedor'],
                m['placar'], "Estádio Regional", "Brasil", est, "Árbitro Regional"
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
        print("GRAVAÇÃO DOS TORNEIOS REGIONAIS CONCLUÍDA COM SUCESSO!")
        print(f"Partidas Inseridas: {inserted_m}")
        print(f"Gols Inseridos:     {inserted_g}")
        print(f"Total Geral Partidas em futebol.db: {tot_partidas:,}")
        print(f"Total Geral Gols em futebol.db:     {tot_gols:,}")
        print("=" * 80)

if __name__ == "__main__":
    import sys
    dry = "--commit" not in sys.argv
    run_ingestion(dry_run=dry)
