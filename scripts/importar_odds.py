"""
Script de importação e enriquecimento de Odds do Brasileirão Série A (2012-2024).
Cruza o dataset BRA.csv com o acervo futebol.db (tanto em data/ quanto em api/data/).
"""

import os
import sys
import csv
import sqlite3
from datetime import datetime, timedelta

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
ROOT_DIR = os.path.dirname(BASE_DIR) if os.path.basename(BASE_DIR) == 'scripts' else BASE_DIR

CSV_PATH = r"f:\Nova pasta (2)\BRA.csv"
DB_PATHS = [
    os.path.join(ROOT_DIR, "data", "futebol.db"),
    os.path.join(ROOT_DIR, "api", "data", "futebol.db")
]

TEAM_MAP = {
    'America MG': 'América-MG',
    'Athletico-PR': 'Athletico-PR',
    'Atletico GO': 'Atlético-GO',
    'Atletico-MG': 'Atlético-MG',
    'Avai': 'Avaí',
    'Bahia': 'Bahia',
    'Botafogo RJ': 'Botafogo',
    'Bragantino': 'Red Bull Bragantino',
    'CSA': 'CSA',
    'Ceara': 'Ceará',
    'Chapecoense-SC': 'Chapecoense',
    'Corinthians': 'Corinthians',
    'Coritiba': 'Coritiba',
    'Criciuma': 'Criciúma',
    'Cruzeiro': 'Cruzeiro',
    'Cuiaba': 'Cuiabá',
    'Figueirense': 'Figueirense',
    'Flamengo RJ': 'Flamengo',
    'Fluminense': 'Fluminense',
    'Fortaleza': 'Fortaleza',
    'Goias': 'Goiás',
    'Gremio': 'Grêmio',
    'Internacional': 'Internacional',
    'Joinville': 'Joinville',
    'Juventude': 'Juventude',
    'Mirassol': 'Mirassol',
    'Nautico': 'Náutico',
    'Palmeiras': 'Palmeiras',
    'Parana': 'Paraná',
    'Ponte Preta': 'Ponte Preta',
    'Portuguesa': 'Portuguesa',
    'Remo': 'Remo',
    'Santa Cruz': 'Santa Cruz',
    'Santos': 'Santos',
    'Sao Paulo': 'São Paulo',
    'Sport Recife': 'Sport',
    'Vasco': 'Vasco',
    'Vitoria': 'Vitória'
}

def to_float(val):
    if not val or val == '':
        return None
    try:
        return round(float(val), 2)
    except Exception:
        return None

def calcular_prob(odd):
    if not odd or odd <= 1.0:
        return None
    return round((1.0 / odd) * 100.0, 1)

def importar_odds():
    if not os.path.exists(CSV_PATH):
        print(f"[ERRO] Arquivo CSV não encontrado em: {CSV_PATH}")
        return

    print(f"Lendo dados de Odds em {CSV_PATH}...")
    registros_csv = []
    with open(CSV_PATH, 'r', encoding='utf-8-sig') as f:
        reader = csv.DictReader(f)
        for r in reader:
            registros_csv.append(r)
    print(f"Total de linhas lidas no CSV: {len(registros_csv)}")

    for db_path in DB_PATHS:
        if not os.path.exists(db_path):
            continue
        print(f"\nProcessando banco: {db_path}...")
        conn = sqlite3.connect(db_path)
        c = conn.cursor()

        # 1. Criar tabela de odds
        c.execute("""
            CREATE TABLE IF NOT EXISTS odds_partidas (
                id_partida INTEGER PRIMARY KEY,
                odd_mandante REAL,
                odd_empate REAL,
                odd_visitante REAL,
                prob_mandante REAL,
                prob_empate REAL,
                prob_visitante REAL,
                odd_max_mandante REAL,
                odd_max_empate REAL,
                odd_max_visitante REAL,
                odd_pinnacle_mandante REAL,
                odd_pinnacle_empate REAL,
                odd_pinnacle_visitante REAL,
                odd_b365_mandante REAL,
                odd_b365_empate REAL,
                odd_b365_visitante REAL,
                status_zebra TEXT,
                FOREIGN KEY (id_partida) REFERENCES partidas(id_partida)
            );
        """)
        c.execute("CREATE INDEX IF NOT EXISTS idx_odds_partida ON odds_partidas(id_partida);")
        c.execute("CREATE INDEX IF NOT EXISTS idx_odds_mandante ON odds_partidas(odd_mandante);")
        c.execute("CREATE INDEX IF NOT EXISTS idx_odds_visitante ON odds_partidas(odd_visitante);")

        inseridos = 0
        atualizados = 0

        for r in registros_csv:
            try:
                d_orig = datetime.strptime(r['Date'], '%d/%m/%Y')
            except Exception:
                continue

            dates = [(d_orig + timedelta(days=offset)).strftime('%Y-%m-%d') for offset in range(-3, 4)]
            h = TEAM_MAP.get(r['Home'], r['Home'])
            a = TEAM_MAP.get(r['Away'], r['Away'])
            placeholders = ','.join(['?'] * len(dates))

            c.execute(f"""
                SELECT id_partida, vencedor, mandante, visitante FROM partidas 
                WHERE mandante = ? AND visitante = ? AND data IN ({placeholders})
                ORDER BY ABS(julianday(data) - julianday(?)) ASC
                LIMIT 1;
            """, [h, a] + dates + [d_orig.strftime('%Y-%m-%d')])
            row = c.fetchone()
            if not row:
                continue

            id_partida, vencedor, mandante_db, visitante_db = row

            odd_h = to_float(r.get('AvgCH') or r.get('PSCH') or r.get('B365CH'))
            odd_d = to_float(r.get('AvgCD') or r.get('PSCD') or r.get('B365CD'))
            odd_a = to_float(r.get('AvgCA') or r.get('PSCA') or r.get('B365CA'))

            prob_h = calcular_prob(odd_h)
            prob_d = calcular_prob(odd_d)
            prob_a = calcular_prob(odd_a)

            max_h = to_float(r.get('MaxCH'))
            max_d = to_float(r.get('MaxCD'))
            max_a = to_float(r.get('MaxCA'))

            ps_h = to_float(r.get('PSCH'))
            ps_d = to_float(r.get('PSCD'))
            ps_a = to_float(r.get('PSCA'))

            b365_h = to_float(r.get('B365CH'))
            b365_d = to_float(r.get('B365CD'))
            b365_a = to_float(r.get('B365CA'))

            # Classificação de Zebra Histórica
            status_zebra = 'Normal'
            if vencedor == mandante_db and odd_h and odd_h >= 3.80:
                status_zebra = 'Super Zebra Mandante'
            elif vencedor == mandante_db and odd_h and odd_h >= 2.80:
                status_zebra = 'Zebra Mandante'
            elif vencedor == visitante_db and odd_a and odd_a >= 4.50:
                status_zebra = 'Super Zebra Visitante'
            elif vencedor == visitante_db and odd_a and odd_a >= 3.20:
                status_zebra = 'Zebra Visitante'

            c.execute("""
                INSERT OR REPLACE INTO odds_partidas (
                    id_partida,
                    odd_mandante, odd_empate, odd_visitante,
                    prob_mandante, prob_empate, prob_visitante,
                    odd_max_mandante, odd_max_empate, odd_max_visitante,
                    odd_pinnacle_mandante, odd_pinnacle_empate, odd_pinnacle_visitante,
                    odd_b365_mandante, odd_b365_empate, odd_b365_visitante,
                    status_zebra
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
            """, (
                id_partida,
                odd_h, odd_d, odd_a,
                prob_h, prob_d, prob_a,
                max_h, max_d, max_a,
                ps_h, ps_d, ps_a,
                b365_h, b365_d, b365_a,
                status_zebra
            ))
            inseridos += 1

        conn.commit()

        # Validar inserção
        c.execute("SELECT COUNT(*) FROM odds_partidas;")
        total_odds = c.fetchone()[0]
        c.execute("SELECT COUNT(*) FROM odds_partidas WHERE status_zebra LIKE '%Zebra%';")
        total_zebras = c.fetchone()[0]
        print(f"Banco atualizado com sucesso! Total de partidas com Odds: {total_odds} | Zebras catalogadas: {total_zebras}")
        conn.close()

if __name__ == '__main__':
    importar_odds()
