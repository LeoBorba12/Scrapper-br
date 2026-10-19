"""
Extrator Inteligente da Grêmiopédia (Grêmio FBPA)
================================================
Capacidades:
1. Extrai jogos de qualquer temporada da Grêmiopédia (ex: 1983 - Campeão da América e do Mundo).
2. Faz o cruzamento simultâneo entre a tabela de resultados e a tabela de arbitragem/público.
3. Normaliza clubes adversários para o padrão oficial do futebol.db.
4. Enriquece partidas existentes e insere partidas inéditas (ex: Gauchão, torneios amistosos e internacionais).
"""

import os
import re
import sys
import time
import sqlite3
import unicodedata
import requests
from bs4 import BeautifulSoup
from typing import Dict, List, Tuple

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DB_LOCAL = os.path.join(BASE_DIR, "data", "futebol.db")
DB_API = os.path.join(BASE_DIR, "api", "data", "futebol.db")

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
}

MESES_PT = {
    "janeiro": "01", "fevereiro": "02", "março": "03", "marco": "03",
    "abril": "04", "maio": "05", "junho": "06", "julho": "07",
    "agosto": "08", "setembro": "09", "outubro": "10", "novembro": "11", "dezembro": "12"
}

MAPA_CLUBES = {
    "Athletico Paranaense": "Athletico-PR",
    "Atlético Paranaense": "Athletico-PR",
    "Atlético Mineiro": "Atlético-MG",
    "Atlético-MG": "Atlético-MG",
    "São Paulo": "São Paulo",
    "Corinthians": "Corinthians",
    "Palmeiras": "Palmeiras",
    "Santos": "Santos",
    "Flamengo": "Flamengo",
    "Fluminense": "Fluminense",
    "Vasco": "Vasco",
    "Vasco da Gama": "Vasco",
    "Botafogo": "Botafogo",
    "Cruzeiro": "Cruzeiro",
    "Internacional": "Internacional",
    "Sport": "Sport",
    "Bahia": "Bahia",
    "Coritiba": "Coritiba",
    "Grêmio": "Grêmio"
}

def normalizar_clube(nome: str) -> str:
    n = nome.strip()
    return MAPA_CLUBES.get(n, n)

def extrair_temporada_gremiopedia(ano: int) -> List[Dict]:
    url = f"https://www.gremiopedia.com/wiki/Jogos_do_Gr%C3%AAmio_em_{ano}"
    resp = requests.get(url, headers=HEADERS, timeout=15)
    if resp.status_code != 200:
        print(f"[ERRO] Falha ao acessar {url}: status {resp.status_code}")
        return []

    soup = BeautifulSoup(resp.text, "html.parser")
    tables = soup.find_all("table", class_="wikitable")
    if len(tables) < 2:
        print(f"[AVISO] Tabelas de jogos não encontradas para o ano {ano}")
        return []

    # Procura a tabela de jogos e de arbitragem
    t_jogos = None
    t_arbs = None
    for t in tables:
        txt = t.get_text()
        if "Mandante" in txt and "Visitante" in txt and "Placar" in txt and not t_jogos:
            t_jogos = t
        elif "Arbitro" in txt or "Árbitro" in txt and not t_arbs:
            t_arbs = t

    if not t_jogos:
        print(f"[AVISO] Tabela de jogos não identificada para {ano}")
        return []

    r_jogos = t_jogos.find_all("tr")[1:]
    r_arbs = t_arbs.find_all("tr")[1:] if t_arbs else []

    jogos = []
    for i, j_row in enumerate(r_jogos):
        j_tds = [td.get_text(strip=True) for td in j_row.find_all(["td", "th"])]
        if len(j_tds) < 5:
            continue

        # Data
        d_raw = j_tds[1].lower().replace("de", " ")
        m_d = re.search(r"(\d{1,2})\s+([a-zç]+)\s+(\d{4})", d_raw)
        data_iso = None
        if m_d:
            dia = f"{int(m_d.group(1)):02d}"
            mes = MESES_PT.get(m_d.group(2).strip(), "01")
            data_iso = f"{ano}-{mes}-{dia}"

        mandante = normalizar_clube(j_tds[2])
        visitante = normalizar_clube(j_tds[4])

        # Placar
        placar_raw = j_tds[3]
        m_p = re.search(r"(\d+)\s*[\–\-\x96xX]\s*(\d+)", placar_raw)
        gm = int(m_p.group(1)) if m_p else 0
        gv = int(m_p.group(2)) if m_p else 0

        estadio = j_tds[5] if len(j_tds) > 5 else None
        camp = j_tds[6] if len(j_tds) > 6 else "Outros"

        # Arbitragem e público
        arbitro = None
        publico = None
        if i < len(r_arbs):
            a_tds = [td.get_text(strip=True) for td in r_arbs[i].find_all(["td", "th"])]
            if len(a_tds) > 2 and a_tds[2]:
                arbitro = a_tds[2].strip()
            if len(a_tds) > 7 and a_tds[7]:
                clean_pub = re.sub(r"[^\d]", "", a_tds[7])
                if clean_pub:
                    publico = int(clean_pub)

        jogos.append({
            "ano": ano,
            "data": data_iso,
            "mandante": mandante,
            "visitante": visitante,
            "gols_mandante": gm,
            "gols_visitante": gv,
            "placar": f"{gm} x {gv}",
            "estadio": estadio,
            "campeonato": camp,
            "arbitro": arbitro,
            "publico": publico
        })

    print(f"[{ano}] Extraídos {len(jogos)} jogos da Grêmiopédia.")
    return jogos

def aplicar_ao_banco(jogos: List[Dict], db_path: str) -> Dict[str, int]:
    if not os.path.exists(db_path):
        return {"inseridos": 0, "atualizados": 0}

    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    c = conn.cursor()

    c.execute("SELECT max(id_partida) FROM partidas")
    max_id = c.fetchone()[0] or 30000000
    prox_id = max_id + 1

    inseridos = 0
    atualizados = 0

    for j in jogos:
        if not j.get("data") or not j.get("mandante") or not j.get("visitante"):
            continue

        c.execute("""
            SELECT id_partida, publico, arbitro, estadio
            FROM partidas
            WHERE data = ? AND mandante LIKE ? AND visitante LIKE ?
        """, (j["data"], f"%{j['mandante'][:4]}%", f"%{j['visitante'][:4]}%"))
        db_match = c.fetchone()

        if db_match:
            id_p = db_match["id_partida"]
            upd = []
            vals = []
            if not db_match["publico"] and j.get("publico"):
                upd.append("publico = ?")
                vals.append(j["publico"])
            if not db_match["arbitro"] and j.get("arbitro"):
                upd.append("arbitro = ?")
                vals.append(j["arbitro"])
            if not db_match["estadio"] and j.get("estadio"):
                upd.append("estadio = ?")
                vals.append(j["estadio"])

            if upd:
                vals.append(id_p)
                c.execute(f"UPDATE partidas SET {', '.join(upd)} WHERE id_partida = ?", vals)
                atualizados += 1
        else:
            gm = j["gols_mandante"]
            gv = j["gols_visitante"]
            placar = f"{gm} x {gv}"
            vencedor = j["mandante"] if gm > gv else (j["visitante"] if gv > gm else "Empate")

            c.execute("""
                INSERT INTO partidas (
                    id_partida, ano, data, mandante, visitante,
                    gols_mandante, gols_visitante, placar, vencedor,
                    publico, arbitro, estadio, campeonato, formato
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                prox_id, j["ano"], j["data"], j["mandante"], j["visitante"],
                gm, gv, placar, vencedor,
                j.get("publico"), j.get("arbitro"), j.get("estadio"), j["campeonato"], "Estadual / Amistoso"
            ))
            prox_id += 1
            inseridos += 1

    conn.commit()
    conn.close()
    return {"inseridos": inseridos, "atualizados": atualizados}

if __name__ == "__main__":
    print("=== EXTRATOR INTELIGENTE GRÊMIOPÉDIA ===")
    ano_teste = 1983
    print(f"\n1. Baixando temporada histórica {ano_teste}...")
    jogos = extrair_temporada_gremiopedia(ano_teste)

    print("\n2. Exemplo das 3 primeiras partidas:")
    for j in jogos[:3]:
        print(f" -> {j['data']} | {j['mandante']} {j['gols_mandante']}x{j['gols_visitante']} {j['visitante']}")
        print(f"    Camp: {j['campeonato']} | Árbitro: {j['arbitro']} | Público: {j['publico']}")

    print("\n3. Aplicando ao banco de dados...")
    res_local = aplicar_ao_banco(jogos, DB_LOCAL)
    res_api = aplicar_ao_banco(jogos, DB_API)
    print(f" -> data/futebol.db: {res_local['inseridos']} inseridos, {res_local['atualizados']} enriquecidos.")
    print(f" -> api/data/futebol.db: {res_api['inseridos']} inseridos, {res_api['atualizados']} enriquecidos.")
