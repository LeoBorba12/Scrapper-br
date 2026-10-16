"""
MINERADOR COMPLETO DOS CAMPEONATOS ESTADUAIS (PAULISTA, CARIOCA, MINEIRO, GAÚCHO, PARANAENSE)
2000 a 2024 (98 edições completas)
"""

import os
import re
import sqlite3
from bs4 import BeautifulSoup

DB_PATH = os.path.join("data", "futebol.db")

STATE_INFO = {
    'sp': ('Campeonato Paulista', 'SP', 4000),
    'rj': ('Campeonato Carioca', 'RJ', 4300),
    'mg': ('Campeonato Mineiro', 'MG', 4500),
    'rs': ('Campeonato Gaúcho', 'RS', 4700),
    'pr': ('Campeonato Paranaense', 'PR', 4850)
}

CLUB_NORMALIZATION = {
    'sao paulo': 'São Paulo',
    'são paulo': 'São Paulo',
    'sao paulo fc': 'São Paulo',
    'são paulo fc': 'São Paulo',
    'palmeiras': 'Palmeiras',
    'se palmeiras': 'Palmeiras',
    'corinthians': 'Corinthians',
    'sc corinthians': 'Corinthians',
    'santos': 'Santos',
    'santos fc': 'Santos',
    'flamengo': 'Flamengo',
    'cr flamengo': 'Flamengo',
    'fluminense': 'Fluminense',
    'fluminense fc': 'Fluminense',
    'botafogo': 'Botafogo',
    'botafogo fr': 'Botafogo',
    'botafogo-rj': 'Botafogo',
    'vasco': 'Vasco da Gama',
    'vasco da gama': 'Vasco da Gama',
    'cr vasco da gama': 'Vasco da Gama',
    'atletico mineiro': 'Atlético-MG',
    'atlético mineiro': 'Atlético-MG',
    'atletico-mg': 'Atlético-MG',
    'atlético-mg': 'Atlético-MG',
    'cruzeiro': 'Cruzeiro',
    'cruzeiro ec': 'Cruzeiro',
    'america mineiro': 'América-MG',
    'américa mineiro': 'América-MG',
    'america-mg': 'América-MG',
    'américa-mg': 'América-MG',
    'gremio': 'Grêmio',
    'grêmio': 'Grêmio',
    'internacional': 'Internacional',
    'juventude': 'Juventude',
    'ec juventude': 'Juventude',
    'caxias': 'Caxias',
    'ser caxias': 'Caxias',
    'atletico paranaense': 'Athletico-PR',
    'atlético paranaense': 'Athletico-PR',
    'athletico paranaense': 'Athletico-PR',
    'athletico-pr': 'Athletico-PR',
    'atletico-pr': 'Athletico-PR',
    'atlético-pr': 'Athletico-PR',
    'coritiba': 'Coritiba',
    'coritiba fbc': 'Coritiba',
    'parana': 'Paraná',
    'paraná': 'Paraná',
    'parana clube': 'Paraná',
    'paraná clube': 'Paraná',
    'ponte preta': 'Ponte Preta',
    'aa ponte preta': 'Ponte Preta',
    'guarani': 'Guarani',
    'guarani fc': 'Guarani',
    'sao caetano': 'São Caetano',
    'são caetano': 'São Caetano',
    'ad são caetano': 'São Caetano',
    'bragantino': 'Red Bull Bragantino',
    'red bull bragantino': 'Red Bull Bragantino',
    'ituano': 'Ituano',
    'ituano fc': 'Ituano',
    'mirassol': 'Mirassol',
    'mirassol fc': 'Mirassol',
    'botafogo-sp': 'Botafogo-SP',
    'santo andre': 'Santo André',
    'santo andré': 'Santo André',
    'portuguesa': 'Portuguesa',
    'portuguesa de desportos': 'Portuguesa',
    'bangu': 'Bangu',
    'bangu ac': 'Bangu',
    'madureira': 'Madureira',
    'volta redonda': 'Volta Redonda',
    'boavista': 'Boavista',
    'olaria': 'Olaria',
    'america-rj': 'América-RJ',
    'américa-rj': 'América-RJ',
    'ipatinga': 'Ipatinga',
    'ipatinga fc': 'Ipatinga',
    'tupi': 'Tupi',
    'tupi fc': 'Tupi',
    'villa nova': 'Villa Nova',
    'villa nova-mg': 'Villa Nova-MG',
    'caldense': 'Caldense',
    'aa caldense': 'Caldense',
    'uberaba': 'Uberaba',
    'uberlandia': 'Uberlândia',
    'uberlândia': 'Uberlândia',
    'tombense': 'Tombense',
    'athletic club': 'Athletic Club',
    'sao jose': 'São José-RS',
    'são josé': 'São José-RS',
    'novo hamburgo': 'Novo Hamburgo',
    'ec novo hamburgo': 'Novo Hamburgo',
    'ypiranga': 'Ypiranga',
    'ypiranga-rs': 'Ypiranga',
    'pelotas': 'Pelotas',
    'brasil de pelotas': 'Brasil de Pelotas',
    'ge brasil': 'Brasil de Pelotas',
    'sao luiz': 'São Luiz',
    'são luiz': 'São Luiz',
    'operario': 'Operário-PR',
    'operário': 'Operário-PR',
    'operario ferrovario': 'Operário-PR',
    'londrina': 'Londrina',
    'londrina ec': 'Londrina',
    'maringa': 'Maringá',
    'maringá': 'Maringá',
    'cianorte': 'Cianorte',
    'cianorte fc': 'Cianorte',
    'cascavel': 'Cascavel',
    'fc cascavel': 'Cascavel',
    'iraty': 'Iraty',
    'toledo': 'Toledo',
    'j.malucelli': 'J.Malucelli',
    'malutrom': 'J.Malucelli',
}

def clean_team_name(name):
    name = re.sub(r'<[^>]+>', '', name).strip()
    name = re.sub(r'\s*\([A-Za-z0-9\.\s\,\'\-]+\)$', '', name).strip()
    name = re.sub(r'\s+', ' ', name).strip()
    norm = CLUB_NORMALIZATION.get(name.lower())
    if norm:
        return norm
    return name

def clean_stadium_name(name):
    name = re.sub(r'<[^>]+>', '', name).strip()
    name = re.sub(r'^[–\-\s\•\*\&nbsp\;]+', '', name).strip()
    name = re.sub(r'\s+', ' ', name).strip()
    return name if name else "Estádio Estadual"

def parse_state_file(uf, year, filepath):
    comp_name, uf_code, _ = STATE_INFO[uf]
    with open(filepath, 'r', encoding='latin1', errors='replace') as f:
        html = f.read()
    
    html = html.replace('\x96', '-').replace('\u2013', '-').replace('\u2014', '-').replace('–', '-').replace('&nbsp;', ' ')
    soup = BeautifulSoup(html, 'html.parser')
    
    matches = []
    current_date = f"{year}-03-15"
    current_round = "Primeira Fase"
    seen_matches = set()
    
    # Iterate through all table rows
    for tr in soup.find_all('tr'):
        # Check if row is a date header
        tr_text = tr.get_text(' ').strip()
        d_match = re.search(r'\b(\d{2})[\/\.](\d{2})[\/\.](\d{4})\b', tr_text)
        if d_match:
            d, m, y = d_match.groups()
            current_date = f"{y}-{m}-{d}"
            
        if 'rodada' in tr_text.lower():
            r_match = re.search(r'(\d+)[ªºao]?\s*rodada', tr_text, re.IGNORECASE)
            if r_match:
                current_round = f"{r_match.group(1)}ª Rodada"
        elif 'semifinal' in tr_text.lower():
            current_round = "Semifinal"
        elif 'final' in tr_text.lower() and not 'semifinal' in tr_text.lower():
            current_round = "Final"
            
        tds = tr.find_all(['td', 'th'])
        score_idx = -1
        for i, td in enumerate(tds):
            td_txt = td.get_text().strip()
            if re.search(r'^\s*\d+\s*[xX]\s*\d+\s*$', td_txt):
                score_idx = i
                break
                
        if score_idx != -1 and score_idx >= 1 and score_idx + 1 < len(tds):
            t1_raw = tds[score_idx - 1].get_text().strip()
            score_txt = tds[score_idx].get_text().strip().lower()
            t2_raw = tds[score_idx + 1].get_text().strip()
            hora_raw = tds[score_idx - 2].get_text().strip() if score_idx >= 2 else "16h00"
            estadio_raw = tds[score_idx + 2].get_text().strip() if score_idx + 2 < len(tds) else "Estádio Estadual"
            
            t1 = clean_team_name(t1_raw)
            t2 = clean_team_name(t2_raw)
            estadio = clean_stadium_name(estadio_raw)
            
            # Hora cleanup
            h_match = re.search(r'(\d{1,2}h\d{2})', hora_raw)
            hora = h_match.group(1).replace('h', ':') if h_match else "16:00"
            
            scores = re.findall(r'\d+', score_txt)
            if len(scores) >= 2 and len(t1) >= 3 and len(t2) >= 3:
                g1, g2 = int(scores[0]), int(scores[1])
                # Deduplication key
                match_key = (current_date, t1, t2, g1, g2)
                if match_key not in seen_matches:
                    seen_matches.add(match_key)
                    matches.append({
                        'ano': year,
                        'campeonato': comp_name,
                        'rodada': current_round,
                        'data': current_date,
                        'horario': hora,
                        'mandante': t1,
                        'visitante': t2,
                        'gols_mandante': g1,
                        'gols_visitante': g2,
                        'estadio': estadio,
                        'cidade': uf_code,
                        'estado': uf_code
                    })

    # If table rows didn't yield matches, fallback to regex search on text (e.g. for some PR or RJ layouts)
    if len(matches) < 10:
        text = soup.get_text(' ')
        text = re.sub(r'\s+', ' ', text)
        p_match = re.compile(
            r'(\d{1,2}h\d{2})\s+([A-Za-zÀ-ÿ0-9\.\s\-\/\(\)]+?)\s+(\d+)\s*[xX]\s*(\d+)\s+([A-Za-zÀ-ÿ0-9\.\s\-\/\(\)]+?)(?:\s*[-–]\s*([A-Za-zÀ-ÿ0-9\.\s\-\/\(\)]+?))?(?=\s+\d{1,2}h\d{2}|\s+\d{1,2}\/\d{2}|$)',
            re.IGNORECASE
        )
        for m in p_match.finditer(text):
            h_raw, t1_raw, g1_str, g2_str, t2_raw, est_raw = m.groups()
            t1 = clean_team_name(t1_raw)
            t2 = clean_team_name(t2_raw)
            estadio = clean_stadium_name(est_raw) if est_raw else "Estádio Estadual"
            hora = h_raw.replace('h', ':')
            g1, g2 = int(g1_str), int(g2_str)
            if len(t1) >= 3 and len(t2) >= 3:
                match_key = (current_date, t1, t2, g1, g2)
                if match_key not in seen_matches:
                    seen_matches.add(match_key)
                    matches.append({
                        'ano': year,
                        'campeonato': comp_name,
                        'rodada': current_round,
                        'data': current_date,
                        'horario': hora,
                        'mandante': t1,
                        'visitante': t2,
                        'gols_mandante': g1,
                        'gols_visitante': g2,
                        'estadio': estadio,
                        'cidade': uf_code,
                        'estado': uf_code
                    })

    return matches

def run_ingestion(dry_run=True):
    print("=" * 80)
    print("INICIANDO MINERAÇÃO COMPLETA DOS CAMPEONATOS ESTADUAIS (2000 A 2024)")
    print(f"Modo: {'SIMULAÇÃO (DRY RUN)' if dry_run else 'GRAVAÇÃO NO BANCO DE DADOS'}")
    print("=" * 80)
    
    all_matches = []
    
    for uf in ['sp', 'rj', 'mg', 'rs', 'pr']:
        comp_name, uf_code, id_offset = STATE_INFO[uf]
        dir_path = os.path.join("data", "raw_estaduais", uf)
        if not os.path.exists(dir_path):
            continue
            
        uf_matches = 0
        files = sorted(os.listdir(dir_path))
        for fn in files:
            if not fn.endswith('.htm') and not fn.endswith('.html'):
                continue
            digits = re.findall(r'\d{4}', fn)
            if not digits:
                continue
            year = int(digits[0])
            fp = os.path.join(dir_path, fn)
            m_list = parse_state_file(uf, year, fp)
            
            for idx, m in enumerate(m_list):
                match_id = year * 10000 + id_offset + idx + 1
                g_mand = m['gols_mandante']
                g_vis = m['gols_visitante']
                venc = m['mandante'] if g_mand > g_vis else (m['visitante'] if g_vis > g_mand else 'Empate')
                placar = f"{g_mand}x{g_vis}"
                
                m['id_partida'] = match_id
                m['vencedor'] = venc
                m['placar'] = placar
                all_matches.append(m)
                uf_matches += 1
                
        print(f"[{comp_name} ({uf.upper()})]: {uf_matches} partidas mineradas.")

    print(f"\nTOTAL GERAL ESTADUAIS MINERADO: {len(all_matches)} partidas catalogadas.")

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
        
        print("Gravando partidas no banco futebol.db...")
        inserted_m = 0
        for m in all_matches:
            cursor.execute(insert_match_sql, (
                m['id_partida'], m['campeonato'], "Campeonato Estadual", m['rodada'],
                m['ano'], 1, m['data'], m['horario'], m['mandante'], m['visitante'],
                m['gols_mandante'], m['gols_visitante'], m['vencedor'],
                m['placar'], m['estadio'], m['cidade'], m['estado'], "Árbitro Estadual"
            ))
            inserted_m += 1
            
        conn.commit()
        
        cursor.execute("SELECT count(*) FROM partidas")
        tot_partidas = cursor.fetchone()[0]
        cursor.execute("SELECT count(*) FROM gols")
        tot_gols = cursor.fetchone()[0]
        conn.close()
        
        print("=" * 80)
        print("GRAVAÇÃO DOS ESTADUAIS CONCLUÍDA COM SUCESSO!")
        print(f"Partidas Inseridas: {inserted_m}")
        print(f"Total Geral Partidas em futebol.db: {tot_partidas:,}")
        print(f"Total Geral Gols em futebol.db:     {tot_gols:,}")
        print("=" * 80)

if __name__ == "__main__":
    import sys
    dry = "--commit" not in sys.argv
    run_ingestion(dry_run=dry)
