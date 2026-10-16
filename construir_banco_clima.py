"""
Script de Construção do Banco de Dados Meteorológico Isolado (clima.db)
Coleta e indexa o histórico climático diário das principais praças esportivas do Brasil
utilizando a API histórica da Open-Meteo (100% gratuita, sem limites restritivos e sem API key).
Inclui controle de taxa com sleep e retry para evitar HTTP 429.
"""

import os
import time
import sqlite3
import urllib.request
import urllib.error
import json

DATA_DIR = os.path.join(os.path.dirname(__file__), "data")
os.makedirs(DATA_DIR, exist_ok=True)
DB_PATH = os.path.join(DATA_DIR, "clima.db")

CIDADES_ESTADOS = [
    {"cidade": "São Paulo", "estado": "SP", "lat": -23.5505, "lon": -46.6333},
    {"cidade": "Santos", "estado": "SP", "lat": -23.9608, "lon": -46.3336},
    {"cidade": "Rio de Janeiro", "estado": "RJ", "lat": -22.9068, "lon": -43.1729},
    {"cidade": "Belo Horizonte", "estado": "MG", "lat": -19.9167, "lon": -43.9345},
    {"cidade": "Porto Alegre", "estado": "RS", "lat": -30.0346, "lon": -51.2177},
    {"cidade": "Curitiba", "estado": "PR", "lat": -25.4284, "lon": -49.2733},
    {"cidade": "Salvador", "estado": "BA", "lat": -12.9714, "lon": -38.5014},
    {"cidade": "Fortaleza", "estado": "CE", "lat": -3.7319, "lon": -38.5267},
    {"cidade": "Goiânia", "estado": "GO", "lat": -16.6869, "lon": -49.2648},
    {"cidade": "Cuiabá", "estado": "MT", "lat": -15.6014, "lon": -56.0979},
    {"cidade": "Florianópolis", "estado": "SC", "lat": -27.5954, "lon": -48.5480},
    {"cidade": "Recife", "estado": "PE", "lat": -8.0476, "lon": -34.8770},
]

def classificar_condicao(temp_max, chuva_mm, umidade):
    if chuva_mm is not None and chuva_mm >= 25.0:
        return "Tempestade / Chuva Forte"
    elif chuva_mm is not None and chuva_mm >= 5.0:
        return "Chuva Moderada"
    elif chuva_mm is not None and chuva_mm > 0.0:
        return "Chuva Leve / Chuvisco"
    elif temp_max is not None and temp_max >= 32.0:
        return "Calor Extremo"
    elif temp_max is not None and temp_max >= 27.0:
        return "Ensolarado / Quente"
    elif temp_max is not None and temp_max <= 18.0:
        return "Frio"
    else:
        return "Ameno / Bom Clima"

def criar_tabelas(conn):
    cursor = conn.cursor()
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS clima_diario (
        data TEXT,
        cidade TEXT,
        estado TEXT,
        latitude REAL,
        longitude REAL,
        temperatura_max REAL,
        temperatura_min REAL,
        temperatura_media REAL,
        precipitacao_mm REAL,
        umidade_relativa_media REAL,
        vento_velocidade_max REAL,
        condicao TEXT,
        PRIMARY KEY (data, cidade, estado)
    );
    """)
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_clima_data ON clima_diario(data);")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_clima_estado ON clima_diario(estado);")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_clima_data_estado ON clima_diario(data, estado);")
    conn.commit()

def coletar_clima_praca(praca, start_date="2015-01-01", end_date="2024-12-31"):
    cidade = praca["cidade"]
    estado = praca["estado"]
    lat = praca["lat"]
    lon = praca["lon"]
    
    url = (
        f"https://archive-api.open-meteo.com/v1/archive?"
        f"latitude={lat}&longitude={lon}"
        f"&start_date={start_date}&end_date={end_date}"
        f"&daily=temperature_2m_max,temperature_2m_min,temperature_2m_mean,precipitation_sum,relative_humidity_2m_mean,wind_speed_10m_max"
        f"&timezone=America%2FSao_Paulo"
    )
    
    for tentativa in range(3):
        try:
            req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
            with urllib.request.urlopen(req, timeout=30) as resp:
                data = json.loads(resp.read().decode("utf-8"))
            break
        except urllib.error.HTTPError as e:
            if e.code == 429:
                print(f"Rate limit temporário atingido para {cidade}. Aguardando 15s antes de retentar...")
                time.sleep(15)
            else:
                raise e

    daily = data.get("daily", {})
    datas = daily.get("time", [])
    t_max = daily.get("temperature_2m_max", [])
    t_min = daily.get("temperature_2m_min", [])
    t_mean = daily.get("temperature_2m_mean", [])
    chuva = daily.get("precipitation_sum", [])
    umid = daily.get("relative_humidity_2m_mean", [])
    vento = daily.get("wind_speed_10m_max", [])
    
    registros = []
    for i in range(len(datas)):
        dt = datas[i]
        mx = t_max[i] if i < len(t_max) else None
        mn = t_min[i] if i < len(t_min) else None
        me = t_mean[i] if i < len(t_mean) else None
        ch = chuva[i] if i < len(chuva) else 0.0
        um = umid[i] if i < len(umid) else None
        ve = vento[i] if i < len(vento) else None
        cond = classificar_condicao(mx, ch, um)
        
        registros.append((dt, cidade, estado, lat, lon, mx, mn, me, ch, um, ve, cond))
        
    return registros

def construir_banco_clima():
    print("Iniciando construção do banco meteorológico isolado (clima.db)...")
    conn = sqlite3.connect(DB_PATH)
    criar_tabelas(conn)
    cursor = conn.cursor()

    for praca in CIDADES_ESTADOS:
        cid = praca["cidade"]
        uf = praca["estado"]
        
        # Verificar se já temos os dados dessa cidade para economizar chamadas
        cursor.execute("SELECT COUNT(*) FROM clima_diario WHERE cidade = ? AND estado = ?;", (cid, uf))
        ja_tem = cursor.fetchone()[0]
        if ja_tem >= 3000:
            print(f"Praça {cid}/{uf} já possui {ja_tem} dias salvos. Pulando.")
            continue

        print(f"Baixando histórico de 2015-2024 para {cid}/{uf}...")
        try:
            records = coletar_clima_praca(praca, start_date="2015-01-01", end_date="2024-12-31")
            cursor.executemany("""
            INSERT OR REPLACE INTO clima_diario (
                data, cidade, estado, latitude, longitude,
                temperatura_max, temperatura_min, temperatura_media,
                precipitacao_mm, umidade_relativa_media, vento_velocidade_max, condicao
            ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?);
            """, records)
            conn.commit()
            print(f"  -> {len(records)} dias salvos para {cid}/{uf}.")
            time.sleep(3) # Pausa estratégica para respeitar a taxa da API
        except Exception as e:
            print(f"Erro ao baixar clima para {cid}/{uf}: {e}")

    cursor.execute("SELECT COUNT(*) FROM clima_diario;")
    total = cursor.fetchone()[0]
    conn.close()
    print(f"\nBanco meteorológico 100% atualizado em data/clima.db! Total geral: {total} registros diários.\n")

if __name__ == "__main__":
    construir_banco_clima()
