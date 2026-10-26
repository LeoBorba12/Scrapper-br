import os
import sys
import sqlite3
import json
import time

try:
    from curl_cffi import requests
    USE_CURL_CFFI = True
except ImportError:
    import requests
    USE_CURL_CFFI = False

def find_db_path(filename=None):
    if not filename:
        filename = os.path.join("data", "futebol.db")
    candidates = [
        filename,
        os.path.join(os.path.dirname(__file__), "..", "data", "futebol.db"),
        os.path.join(os.path.dirname(__file__), filename),
        os.path.join(os.path.dirname(__file__), "..", filename),
        os.path.join(os.path.dirname(__file__), "..", "backend", filename),
        os.path.join(os.getcwd(), filename),
        os.path.join(os.getcwd(), "data", "futebol.db"),
        os.path.join(os.getcwd(), "backend", filename),
    ]
    for c in candidates:
        if os.path.exists(c):
            return os.path.abspath(c)
    return os.path.abspath(filename)

class FutStatsSpatialScraper:
    """
    Coletor de dados espaciais (Shotmaps e Heatmaps) para o banco SQLite do FutStats.
    Utiliza curl_cffi para emulação de TLS Fingerprint (Chrome) evitando 403 Forbidden.
    """
    def __init__(self, db_path=None):
        self.db_path = db_path or find_db_path("futebol.db")
        if USE_CURL_CFFI:
            self.session = requests.Session(impersonate="chrome120")
        else:
            self.session = requests.Session()
        self.base_url = "https://api.sofascore.com/api/v1"
        self.headers = {
            "Accept": "application/json",
            "Referer": "https://www.sofascore.com/",
            "Origin": "https://www.sofascore.com",
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        }
        self._init_db()

    def _init_db(self):
        """Cria as tabelas espaciais no SQLite caso não existam."""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS partida_shotmap (
                id_evento INTEGER PRIMARY KEY,
                id_partida INTEGER,
                id_jogador INTEGER,
                nome_jogador TEXT,
                is_mandante BOOLEAN,
                minuto INTEGER,
                segundo INTEGER,
                resultado TEXT,
                parte_corpo TEXT,
                situacao TEXT,
                xg REAL,
                xgot REAL,
                x_origem REAL,
                y_origem REAL,
                x_metros REAL,
                y_metros REAL,
                gol_mouth_y REAL,
                gol_mouth_z REAL
            )
        """)

        cursor.execute("""
            CREATE TABLE IF NOT EXISTS atleta_heatmap (
                id_partida INTEGER,
                id_jogador INTEGER,
                nome_jogador TEXT,
                total_toques INTEGER,
                pontos_json TEXT,
                PRIMARY KEY (id_partida, id_jogador)
            )
        """)
        conn.commit()
        conn.close()

    @staticmethod
    def converter_para_metros(x_pct: float, y_pct: float) -> tuple[float, float]:
        """Converte coordenadas percentuais (0-100) para metros oficiais FIFA (105m x 68m)."""
        x_m = round((x_pct / 100.0) * 105.0, 2)
        y_m = round((y_pct / 100.0) * 68.0, 2)
        return x_m, y_m

    def extrair_shotmap(self, event_id: int, id_partida_interna: int = None) -> list[dict]:
        """Extrai finalizações, coordenadas (X,Y,Z) e xG de uma partida."""
        url = f"{self.base_url}/event/{event_id}/shotmap"
        try:
            res = self.session.get(url, headers=self.headers, timeout=15)
            if res.status_code != 200:
                print(f"[Aviso] Shotmap indisponível para o evento {event_id} (Status {res.status_code})")
                return []

            dados = res.json().get("shotmap", [])
            chutes_processados = []

            for item in dados:
                coords = item.get("playerCoordinates", {})
                x_pct = round(100.0 - float(coords.get("x", 0)), 2)
                y_pct = round(float(coords.get("y", 0)), 2)
                x_m, y_m = self.converter_para_metros(x_pct, y_pct)
                goal_coords = item.get("goalMouthCoordinates", {})
                
                chute = {
                    "id_evento": item.get("id"),
                    "id_partida": id_partida_interna or event_id,
                    "id_jogador": item.get("player", {}).get("id"),
                    "nome_jogador": item.get("player", {}).get("name"),
                    "is_mandante": item.get("isHome", True),
                    "minuto": item.get("time", 0),
                    "segundo": (item.get("timeSeconds", 0) or 0) % 60,
                    "resultado": item.get("shotType"),
                    "parte_corpo": item.get("bodyPart"),
                    "situacao": item.get("situation"),
                    "xg": round(float(item.get("xg", 0.0) or 0.0), 4),
                    "xgot": round(float(item.get("xgot", 0.0) or 0.0), 4),
                    "x_origem": x_pct,
                    "y_origem": y_pct,
                    "x_metros": x_m,
                    "y_metros": y_m,
                    "gol_mouth_y": goal_coords.get("y"),
                    "gol_mouth_z": goal_coords.get("z")
                }
                chutes_processados.append(chute)

            self._salvar_shotmap(chutes_processados)
            return chutes_processados
        except Exception as e:
            print(f"[Erro Shotmap]: {e}")
            return []

    def extrair_heatmap_jogador(self, event_id: int, player_id: int, nome_jogador: str = "", id_partida_interna: int = None) -> dict:
        """Extrai a matriz de toques na bola (Heatmap) de um atleta na partida."""
        url = f"{self.base_url}/event/{event_id}/player/{player_id}/heatmap"
        try:
            res = self.session.get(url, headers=self.headers, timeout=15)
            if res.status_code != 200:
                return {}

            pontos_brutos = res.json().get("heatmap", [])
            pontos_normalizados = [
                {"x": round(float(p.get("x", 0)), 1), "y": round(float(p.get("y", 0)), 1)}
                for p in pontos_brutos
            ]

            registro = {
                "id_partida": id_partida_interna or event_id,
                "id_jogador": player_id,
                "nome_jogador": nome_jogador,
                "total_toques": len(pontos_normalizados),
                "pontos": pontos_normalizados
            }

            self._salvar_heatmap(registro)
            return registro
        except Exception as e:
            print(f"[Erro Heatmap]: {e}")
            return {}

    def extrair_todos_heatmaps_da_partida(self, event_id: int, id_partida_interna: int = None):
        """Busca a escalação da partida e coleta o mapa de calor de todos os jogadores atuantes."""
        url = f"{self.base_url}/event/{event_id}/lineups"
        try:
            res = self.session.get(url, headers=self.headers, timeout=15)
            if res.status_code != 200:
                return

            lineups = res.json()
            for lado in ["home", "away"]:
                jogadores = lineups.get(lado, {}).get("players", [])
                for item in jogadores:
                    stats = item.get("statistics", {})
                    if not stats or stats.get("minutesPlayed", 0) == 0:
                        continue
                    
                    player = item.get("player", {})
                    p_id = player.get("id")
                    p_nome = player.get("name")
                    
                    if p_id:
                        self.extrair_heatmap_jogador(event_id, p_id, p_nome, id_partida_interna)
                        time.sleep(0.4)
        except Exception as e:
            print(f"[Erro Lineups]: {e}")

    def _salvar_shotmap(self, chutes: list[dict]):
        if not chutes:
            return
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        cursor.executemany("""
            INSERT OR REPLACE INTO partida_shotmap VALUES (
                :id_evento, :id_partida, :id_jogador, :nome_jogador, :is_mandante,
                :minuto, :segundo, :resultado, :parte_corpo, :situacao,
                :xg, :xgot, :x_origem, :y_origem, :x_metros, :y_metros,
                :gol_mouth_y, :gol_mouth_z
            )
        """, chutes)
        conn.commit()
        conn.close()

    def _salvar_heatmap(self, reg: dict):
        if not reg.get("pontos"):
            return
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        cursor.execute("""
            INSERT OR REPLACE INTO atleta_heatmap VALUES (?, ?, ?, ?, ?)
        """, (
            reg["id_partida"],
            reg["id_jogador"],
            reg["nome_jogador"],
            reg["total_toques"],
            json.dumps(reg["pontos"])
        ))
        conn.commit()
        conn.close()

if __name__ == "__main__":
    scraper = FutStatsSpatialScraper()
    print(f"FutStats Spatial Scraper inicializado. Banco: {scraper.db_path}")
    print(f"Modo curl_cffi ativo: {USE_CURL_CFFI}")
