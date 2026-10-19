import os
import sys
import sqlite3
from datetime import datetime
import requests

# Força codificação UTF-8 na saída padrão para compatibilidade com emojis no Windows e Linux
if hasattr(sys.stdout, 'reconfigure'):
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

def find_db_path(filename):
    candidates = [
        os.path.join(BASE_DIR, "data", filename),
        os.path.join(BASE_DIR, "api", "data", filename),
        os.path.join(BASE_DIR, "..", "data", filename),
    ]
    for c in candidates:
        if os.path.exists(c):
            return c
    return os.path.join(BASE_DIR, "data", filename)

DB_FUTEBOL = find_db_path("futebol.db")

# Coordenadas das principais praças esportivas para consulta Open-Meteo
COORDENADAS_CIDADES = {
    "Rio de Janeiro": {"lat": -22.9068, "lon": -43.1729},
    "São Paulo": {"lat": -23.5505, "lon": -46.6333},
    "Belo Horizonte": {"lat": -19.9167, "lon": -43.9345},
    "Porto Alegre": {"lat": -30.0346, "lon": -51.2177},
    "Curitiba": {"lat": -25.4284, "lon": -49.2733},
    "Salvador": {"lat": -12.9714, "lon": -38.5014},
    "Fortaleza": {"lat": -3.7319, "lon": -38.5267},
    "Brasília": {"lat": -15.7975, "lon": -47.8919},
    "Recife": {"lat": -8.0476, "lon": -34.8770},
    "Goiânia": {"lat": -16.6869, "lon": -49.2648},
    "Cuiabá": {"lat": -15.6014, "lon": -56.0979},
    "Florianópolis": {"lat": -27.5954, "lon": -48.5480},
    "Santos": {"lat": -23.9618, "lon": -46.3322},
    "Bragança Paulista": {"lat": -22.9527, "lon": -46.5419},
    "Caxias do Sul": {"lat": -29.1678, "lon": -51.1794},
    "Belém": {"lat": -1.4558, "lon": -48.5039}
}

def obter_previsao_tempo(cidade, data_str):
    """Consulta previsão meteorológica diária na API gratuita Open-Meteo."""
    coords = COORDENADAS_CIDADES.get(cidade, COORDENADAS_CIDADES["São Paulo"])
    
    # Se a data do jogo for no passado, Open-Meteo usa archive-api; se for hoje/futuro, usa forecast
    hoje = datetime.now().strftime("%Y-%m-%d")
    if data_str and data_str < hoje:
        url = f"https://archive-api.open-meteo.com/v1/archive?latitude={coords['lat']}&longitude={coords['lon']}&daily=temperature_2m_max,precipitation_sum&timezone=America/Sao_Paulo&start_date={data_str}&end_date={data_str}"
    else:
        url = f"https://api.open-meteo.com/v1/forecast?latitude={coords['lat']}&longitude={coords['lon']}&daily=temperature_2m_max,precipitation_sum&timezone=America/Sao_Paulo&start_date={data_str}&end_date={data_str}"

    try:
        resp = requests.get(url, timeout=7)
        if resp.status_code == 200:
            data = resp.json().get("daily", {})
            precip = data.get("precipitation_sum", [0])[0] or 0
            temp_max = data.get("temperature_2m_max", [25])[0] or 25
            return {"precipitacao": round(float(precip), 1), "temp_max": round(float(temp_max), 1)}
    except Exception as e:
        print(f"[LOG] Falha ao consultar Open-Meteo para {cidade}: {e}")

    return {"precipitacao": 0.0, "temp_max": 25.0}

def gerar_tweets_matchday(forcar_demo=False):
    """Identifica os confrontos do dia, cruza com clima e gera os posts para redes sociais."""
    if not os.path.exists(DB_FUTEBOL):
        print(f"[AVISO] Base de dados de futebol não encontrada em {DB_FUTEBOL}")
        return

    conn = sqlite3.connect(DB_FUTEBOL)
    conn.row_factory = sqlite3.Row
    c = conn.cursor()

    hoje_str = datetime.now().strftime("%Y-%m-%d")
    
    c.execute("""
        SELECT id_partida, data, horario, mandante, visitante, estadio, cidade, campeonato
        FROM partidas
        WHERE data = date('now')
        ORDER BY horario ASC;
    """)
    jogos = c.fetchall()

    if not jogos and (forcar_demo or "--demo" in sys.argv or os.environ.get("MATCHDAY_DEMO") == "1"):
        print(f"[DEMO] Sem jogos hoje ({hoje_str}). Buscando a rodada mais recente para demonstração...")
        c.execute("""
            SELECT id_partida, data, horario, mandante, visitante, estadio, cidade, campeonato
            FROM partidas
            WHERE data = (SELECT MAX(data) FROM partidas)
            ORDER BY id_partida DESC
            LIMIT 5;
        """)
        jogos = c.fetchall()

    if not jogos:
        print(f"Nenhum jogo agendado para hoje ({hoje_str}) na base de dados.")
        print("Dica: Use 'python matchday_bot.py --demo' para testar com a última rodada catalogada.")
        conn.close()
        return

    print(f"[{len(jogos)}] jogos encontrados para análise de Matchday. Gerando tweets pré-jogo...\n")

    for j in jogos:
        cidade = j["cidade"] or "São Paulo"
        data_jogo = j["data"] or hoje_str
        clima = obter_previsao_tempo(cidade, data_jogo)

        if clima["precipitacao"] >= 5.0:
            status_clima = f"🌧️ Atenção para piso molhado! Previsão de {clima['precipitacao']}mm de chuva"
        elif clima["precipitacao"] > 0:
            status_clima = f"🌦️ Possibilidade de garoa leve ({clima['precipitacao']}mm)"
        else:
            status_clima = "☀️ Tempo firme e sem chuva prevista"

        horario_str = j["horario"] if j["horario"] and j["horario"] != "00:00" else "Horário a confirmar"
        estadio_str = j["estadio"] or "Estádio a definir"

        tweet = (
            f"⚽ DIA DE JOGO! {j['campeonato']}\n\n"
            f"⚔️ {j['mandante']} x {j['visitante']}\n"
            f"🏟️ {estadio_str} ({cidade}) • {horario_str}\n\n"
            f"{status_clima} (Máx: {clima['temp_max']}°C).\n\n"
            f"#Futebol #DiaDeJogo #FutStats"
        )

        print("-----------------------------------------")
        print(tweet)
        print("-----------------------------------------\n")

    conn.close()

if __name__ == "__main__":
    gerar_tweets_matchday()
