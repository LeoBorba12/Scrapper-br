import urllib.request
import re
import sqlite3
import os
import shutil
import time

DB_PATH = 'data/futebol.db'
API_DB_PATH = 'api/data/futebol.db'

MONTHS = {
    'jan': '01', 'feb': '02', 'fev': '02', 'mar': '03', 'apr': '04', 'abr': '04',
    'may': '05', 'mai': '05', 'jun': '06', 'jul': '07', 'aug': '08', 'ago': '08',
    'sep': '09', 'set': '09', 'oct': '10', 'out': '10', 'nov': '11', 'dec': '12', 'dez': '12'
}

CANONICAL_CLUBS = {
    'flamengo': 'Flamengo',
    'cr flamengo': 'Flamengo',
    'c.r. flamengo': 'Flamengo',
    'vasco': 'Vasco',
    'vasco da gama': 'Vasco',
    'c.r. vasco da gama': 'Vasco',
    'cr vasco da gama': 'Vasco',
    'fluminense': 'Fluminense',
    'fluminense fc': 'Fluminense',
    'botafogo': 'Botafogo',
    'botafogo fr': 'Botafogo',
    'botafogo-rj': 'Botafogo',
    'bangu': 'Bangu',
    'bangu ac': 'Bangu',
    'america': 'América-RJ',
    'américa': 'América-RJ',
    'america-rj': 'América-RJ',
    'américa-rj': 'América-RJ',
    'madureira': 'Madureira',
    'olaria': 'Olaria',
    'volta redonda': 'Volta Redonda',
    'americano': 'Americano',
    'americanogc': 'Americano',
    'friburguense': 'Friburguense',
    'itaperuna': 'Itaperuna',
    'sao cristovao': 'São Cristóvão',
    'são cristóvão': 'São Cristóvão',
    'campo grande': 'Campo Grande',
    'entrerriense': 'Entrerriense',
    'cabofriense': 'Cabofriense',
    'portuguesa': 'Portuguesa-RJ',
    'bonsucesso': 'Bonsucesso',
    'goytacaz': 'Goytacaz',
    'mesquita': 'Mesquita',
    'serrano': 'Serrano'
}

def clean_team(raw):
    t = re.sub(r'[\d\-\–\/\*]', '', raw).strip().lower()
    t = re.sub(r'\s+', ' ', t).strip()
    return CANONICAL_CLUBS.get(t, t.title())

def parse_carioca_year(year):
    url = f"http://www.rsssfbrasil.com/tablesr/rj{year}.htm"
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})
    try:
        with urllib.request.urlopen(req, timeout=8) as resp:
            text = resp.read().decode('utf-8', errors='ignore')
    except Exception as e:
        return []

    lines = text.splitlines()
    matches = []
    current_date = None

    for line in lines:
        l = line.strip()
        if not l or l.startswith('<') or 'table' in l.lower():
            continue

        date_header = re.search(r'\[([A-Za-z]{3})\s+(\d{1,2})\]', l, re.IGNORECASE)
        if date_header:
            m_str, d_str = date_header.groups()
            m_num = MONTHS.get(m_str.lower(), '01')
            current_date = f"{year}-{m_num}-{int(d_str):02d}"
            continue

        date_header2 = re.search(r'\[(\d{1,2})\s*[\/\-]\s*([A-Za-z]{3})\]', l, re.IGNORECASE)
        if date_header2:
            d_str, m_str = date_header2.groups()
            m_num = MONTHS.get(m_str.lower(), '01')
            current_date = f"{year}-{m_num}-{int(d_str):02d}"
            continue

        inline_m = re.search(r'(\d{1,2})[\/\-]([A-Za-z]{3}|\d{1,2})\s+([A-Za-zÀ-ÿ\.\s\-]+?)\s+(\d{1,2})\s*[-–xX]\s*(\d{1,2})\s+([A-Za-zÀ-ÿ\.\s\-]+)', l)
        if inline_m:
            d_str, m_str, t1_raw, g1_str, g2_str, t2_raw = inline_m.groups()
            m_num = MONTHS.get(m_str.lower()) if m_str.isalpha() else f"{int(m_str):02d}"
            m_num = m_num or '01'
            dt = f"{year}-{m_num}-{int(d_str):02d}"
            t1 = clean_team(t1_raw)
            t2 = clean_team(t2_raw)
            if len(t1) > 2 and len(t2) > 2 and t1 != t2:
                matches.append((dt, t1, int(g1_str), int(g2_str), t2))
            continue

        m_game = re.search(r'^([A-Za-zÀ-ÿ\.\s\-]+?)\s+(\d{1,2})\s*[-–xX]\s*(\d{1,2})\s+([A-Za-zÀ-ÿ\.\s\-]+)', l)
        if m_game and current_date:
            t1_raw, g1_str, g2_str, t2_raw = m_game.groups()
            t1 = clean_team(t1_raw)
            t2 = clean_team(t2_raw)
            if len(t1) > 2 and len(t2) > 2 and t1 != t2:
                matches.append((current_date, t1, int(g1_str), int(g2_str), t2))

    return matches

def run_ingestion():
    print(f"Conectando a {DB_PATH}...")
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()

    c.execute("SELECT MAX(id_partida) FROM partidas;")
    next_id = (c.fetchone()[0] or 10000000) + 1

    # Carrega jogos já existentes para evitar duplicação
    c.execute("SELECT data, mandante, visitante FROM partidas WHERE campeonato = 'Campeonato Carioca';")
    existentes = set((r[0], r[1], r[2]) for r in c.fetchall())
    print(f"Jogos do Campeonato Carioca já presentes: {len(existentes)}")

    novos_jogos = []
    years = range(1971, 2002)
    print(f"Minerando edições históricas do Campeonato Carioca de {years[0]} a {years[-1]} ({len(years)} temporadas)...")

    for y in years:
        partidas_ano = parse_carioca_year(y)
        adicionados_ano = 0
        for dt, t1, g1, g2, t2 in partidas_ano:
            if (dt, t1, t2) in existentes or (dt, t2, t1) in existentes:
                continue

            placar = f"{g1}x{g2}"
            vencedor = t1 if g1 > g2 else (t2 if g2 > g1 else 'Empate')
            cidade = 'Rio de Janeiro'
            estadio = 'Maracanã' if any(k in t1 for k in ['Flamengo', 'Fluminense', 'Vasco', 'Botafogo']) else 'Estádio Estadual'

            novos_jogos.append((
                next_id, y, 1, dt, "16:00", estadio, cidade, "RJ",
                t1, t2, g1, g2, placar, vencedor,
                "Árbitro Carioca", None, None, None, None, None, None, None,
                "Campeonato Carioca", "Pontos Corridos / Taças", "Fase Regular"
            ))
            existentes.add((dt, t1, t2))
            next_id += 1
            adicionados_ano += 1

        print(f"  [Carioca {y}]: {len(partidas_ano)} parseados | {adicionados_ano} novos adicionados")
        time.sleep(0.05)

    print(f"\nTotal de novas partidas do Campeonato Carioca a gravar: {len(novos_jogos)}")

    if novos_jogos:
        insert_sql = """
        INSERT INTO partidas (
            id_partida, ano, rodada, data, horario, estadio, cidade, estado,
            mandante, visitante, gols_mandante, gols_visitante, placar, vencedor,
            arbitro, assistente_1, assistente_2, quarto_arbitro, var,
            tecnico_mandante, tecnico_visitante, publico, campeonato, formato, fase
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
        """
        c.executemany(insert_sql, novos_jogos)
        conn.commit()
        print(f"Gravadas {len(novos_jogos)} partidas com sucesso em {DB_PATH}!")

        # Otimizar índices e estatísticas
        print("Executando ANALYZE...")
        c.execute("ANALYZE;")
        conn.commit()

        print("Executando VACUUM...")
        c.execute("VACUUM;")
        conn.close()

        # Replicar para api/data/futebol.db
        if os.path.exists('api/data'):
            shutil.copy2(DB_PATH, API_DB_PATH)
            print(f"Replicado para {API_DB_PATH} ({os.path.getsize(API_DB_PATH)} bytes)")

    else:
        conn.close()
        print("Nenhuma nova partida precisou ser gravada.")

if __name__ == '__main__':
    run_ingestion()
