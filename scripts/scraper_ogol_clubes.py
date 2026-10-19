"""
Scraper e Integrador Universal de Clubes Brasileiros (via OGol)
===============================================================
Capacidades:
1. Suporta qualquer clube da Série A (Flamengo, Corinthians, São Paulo, Santos, Vasco,
   Cruzeiro, Atlético-MG, Internacional, Fluminense, Bahia, Fortaleza, etc.).
2. Extrai todo o histórico de partidas ano a ano com suporte a paginação automática:
   - Data ISO (YYYY-MM-DD), Horário
   - Mandante, Visitante, Placar, Gols, Vencedor
   - Competição oficial (Brasileirão, Copa do Brasil, Estaduais, Libertadores, Amistosos)
   - Link de ficha técnica detalhada
3. Normaliza entidades de forma canônica e aplica deduplicação inteligente no futebol.db.
"""

import os
import re
import sys
import time
import sqlite3
import unicodedata
import requests
from bs4 import BeautifulSoup
from typing import Dict, List, Optional, Tuple

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DB_LOCAL = os.path.join(BASE_DIR, "data", "futebol.db")
DB_API = os.path.join(BASE_DIR, "api", "data", "futebol.db")

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept-Language": "pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7"
}

# Slugs e nomes canônicos dos principais clubes no OGol
CLUBES_OGOL = {
    "flamengo": "Flamengo",
    "corinthians": "Corinthians",
    "sao-paulo": "São Paulo",
    "santos": "Santos",
    "palmeiras": "Palmeiras",
    "vasco": "Vasco",
    "fluminense": "Fluminense",
    "botafogo": "Botafogo",
    "cruzeiro": "Cruzeiro",
    "atletico-mineiro": "Atlético-MG",
    "internacional": "Internacional",
    "gremio": "Grêmio",
    "bahia": "Bahia",
    "fortaleza": "Fortaleza",
    "athletico-paranaense": "Athletico-PR",
    "vitoria": "Vitória",
    "cuiaba": "Cuiabá",
    "criciuma": "Criciúma",
    "juventude": "Juventude",
    "atletico-goianiense": "Atlético-GO"
}

# Normalização de nomes de adversários vindos do OGol -> padrão futebol.db
MAPA_ADVERSARIOS = {
    "Athletico Paranaense": "Athletico-PR",
    "Atlético Paranaense": "Athletico-PR",
    "Atlético Mineiro": "Atlético-MG",
    "Atlético Goianiense": "Atlético-GO",
    "América Mineiro": "América-MG",
    "América de Natal": "América-RN",
    "Vasco": "Vasco",
    "Vasco da Gama": "Vasco",
    "São Paulo": "São Paulo",
    "Corinthians": "Corinthians",
    "Palmeiras": "Palmeiras",
    "Santos": "Santos",
    "Flamengo": "Flamengo",
    "Fluminense": "Fluminense",
    "Botafogo": "Botafogo",
    "Cruzeiro": "Cruzeiro",
    "Internacional": "Internacional",
    "Grêmio": "Grêmio",
    "Bahia": "Bahia",
    "Vitória": "Vitória",
    "Ceará": "Ceará",
    "Fortaleza": "Fortaleza",
    "Coritiba": "Coritiba",
    "Sport": "Sport",
    "Santa Cruz": "Santa Cruz",
    "Náutico": "Náutico",
    "Ponte Preta": "Ponte Preta",
    "Guarani": "Guarani",
    "Goiás": "Goiás",
    "Criciúma": "Criciúma",
    "Juventude": "Juventude",
    "Avaí": "Avaí",
    "Chapecoense": "Chapecoense",
    "Figueirense": "Figueirense",
    "Paraná": "Paraná"
}

def normalizar_time(nome: str) -> str:
    n = nome.strip()
    return MAPA_ADVERSARIOS.get(n, n)

def extrair_jogos_ogol(clube_slug: str, ano: int) -> List[Dict]:
    """
    Extrai todos os jogos de uma temporada para determinado clube via OGol, tratando paginação.
    """
    clube_nome = CLUBES_OGOL.get(clube_slug, clube_slug.title())
    jogos = []
    pagina = 1

    while True:
        url = f"https://www.ogol.com.br/equipe/{clube_slug}/todos-os-jogos?ano={ano}&page={pagina}"
        try:
            time.sleep(0.4)
            resp = requests.get(url, headers=HEADERS, timeout=12)
            if resp.status_code != 200:
                break

            soup = BeautifulSoup(resp.text, "html.parser")
            tables = soup.find_all("table")
            if len(tables) < 2:
                break

            tabela_jogos = tables[1]
            rows = tabela_jogos.find_all("tr")
            if len(rows) <= 1:
                break

            jogos_nesta_pagina = 0
            for r in rows[1:]:
                tds = [td.get_text(strip=True) for td in r.find_all(["td", "th"])]
                if len(tds) < 8:
                    continue

                # Colunas OGol:
                # 0: V/E/D, 1: Data (YYYY-MM-DD), 2: Hora, 3: (C)/(F), 4: logo, 5: Adversário, 6: Placar, 7: Competição
                data_iso = tds[1].strip()
                if not re.match(r"^\d{4}-\d{2}-\d{2}$", data_iso):
                    continue

                horario = tds[2].strip() if tds[2] else None
                mando = tds[3].strip()  # (C) ou (F)
                adv_raw = tds[5].strip()
                adversario = normalizar_time(adv_raw)

                # Placar
                placar_raw = tds[6].strip()
                m_placar = re.search(r"^(\d+)\s*[-xX]\s*(\d+)", placar_raw)
                if not m_placar:
                    continue

                gols_1 = int(m_placar.group(1))
                gols_2 = int(m_placar.group(2))

                # No OGol quando é (C), mandante é o clube da página; quando é (F), mandante é o adversário
                if mando == "(C)":
                    mandante = clube_nome
                    visitante = adversario
                    gm = gols_1
                    gv = gols_2
                else:
                    mandante = adversario
                    visitante = clube_nome
                    gm = gols_1
                    gv = gols_2

                placar_formatado = f"{gm} x {gv}"
                vencedor = mandante if gm > gv else (visitante if gv > gm else "Empate")
                competicao = tds[7].strip()

                jogos.append({
                    "ano": ano,
                    "data": data_iso,
                    "horario": horario,
                    "mandante": mandante,
                    "visitante": visitante,
                    "gols_mandante": gm,
                    "gols_visitante": gv,
                    "placar": placar_formatado,
                    "vencedor": vencedor,
                    "campeonato": competicao
                })
                jogos_nesta_pagina += 1

            if jogos_nesta_pagina == 0:
                break

            # Checa se existe próxima página na paginação
            pag_div = soup.find(class_=lambda c: c and "pagin" in str(c).lower())
            if not pag_div:
                break

            prox_page_str = str(pagina + 1)
            tem_proxima = any(a.get_text(strip=True) == prox_page_str for a in pag_div.find_all("a"))
            if not tem_proxima:
                break

            pagina += 1

        except Exception as e:
            print(f"[ERRO] Falha ao extrair página {pagina} de {clube_slug} em {ano}: {e}")
            break

    print(f"[{clube_nome} - {ano}] Total extraído do OGol: {len(jogos)} jogos.")
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
        c.execute("""
            SELECT id_partida, horario, placar
            FROM partidas
            WHERE data = ? AND mandante LIKE ? AND visitante LIKE ?
        """, (j["data"], f"%{j['mandante'][:4]}%", f"%{j['visitante'][:4]}%"))
        db_match = c.fetchone()

        if db_match:
            id_p = db_match["id_partida"]
            upd = []
            vals = []
            if not db_match["horario"] and j.get("horario"):
                upd.append("horario = ?")
                vals.append(j["horario"])

            if upd:
                vals.append(id_p)
                c.execute(f"UPDATE partidas SET {', '.join(upd)} WHERE id_partida = ?", vals)
                atualizados += 1
        else:
            c.execute("""
                INSERT INTO partidas (
                    id_partida, ano, data, horario, mandante, visitante,
                    gols_mandante, gols_visitante, placar, vencedor,
                    campeonato, formato
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                prox_id, j["ano"], j["data"], j.get("horario"), j["mandante"], j["visitante"],
                j["gols_mandante"], j["gols_visitante"], j["placar"], j["vencedor"],
                j["campeonato"], "Oficial / Amistoso"
            ))
            prox_id += 1
            inseridos += 1

    conn.commit()
    conn.close()
    return {"inseridos": inseridos, "atualizados": atualizados}

if __name__ == "__main__":
    print("=== EXTRATOR UNIVERSAL DE CLUBES BRASILEIROS (OGOL) ===")
    
    # Teste 1: Temporada Histórica de 1981 do Flamengo (Mundial e Libertadores)
    clube_teste = "flamengo"
    ano_teste = 1981
    print(f"\n1. Baixando temporada {ano_teste} do {clube_teste.upper()}...")
    jogos_fla = extrair_jogos_ogol(clube_teste, ano_teste)

    print("\n2. Exemplo das primeiras partidas extraídas:")
    for j in jogos_fla[:3]:
        print(f" -> {j['data']} | {j['mandante']} {j['placar']} {j['visitante']} | {j['campeonato']}")

    print("\n3. Aplicando ao banco de dados...")
    res_loc = aplicar_ao_banco(jogos_fla, DB_LOCAL)
    res_api = aplicar_ao_banco(jogos_fla, DB_API)
    print(f" -> data/futebol.db: {res_loc['inseridos']} inseridos, {res_loc['atualizados']} enriquecidos.")
    print(f" -> api/data/futebol.db: {res_api['inseridos']} inseridos, {res_api['atualizados']} enriquecidos.")

    # Teste 2: Temporada Histórica de 1992 do São Paulo (Mundial de Tóquio)
    clube_spfc = "sao-paulo"
    ano_spfc = 1992
    print(f"\n4. Baixando temporada {ano_spfc} do SÃO PAULO...")
    jogos_spfc = extrair_jogos_ogol(clube_spfc, ano_spfc)
    res_spfc_loc = aplicar_ao_banco(jogos_spfc, DB_LOCAL)
    res_spfc_api = aplicar_ao_banco(jogos_spfc, DB_API)
    print(f" -> data/futebol.db: {res_spfc_loc['inseridos']} inseridos, {res_spfc_loc['atualizados']} enriquecidos.")
    print(f" -> api/data/futebol.db: {res_spfc_api['inseridos']} inseridos, {res_spfc_api['atualizados']} enriquecidos.")
