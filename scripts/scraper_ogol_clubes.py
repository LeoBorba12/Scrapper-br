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
    Extrai todos os jogos de uma temporada para determinado clube via OGol, tratando paginação dinâmica.
    """
    clube_nome = CLUBES_OGOL.get(clube_slug, clube_slug.title())
    jogos = []
    session = requests.Session()
    session.headers.update(HEADERS)

    url = f"https://www.ogol.com.br/equipe/{clube_slug}/todos-os-jogos?ano={ano}"
    pagina = 1

    while url:
        try:
            time.sleep(0.4)
            resp = session.get(url, timeout=15)
            if resp.status_code != 200:
                break

            soup = BeautifulSoup(resp.text, "html.parser")
            
            # Localiza dinamicamente a tabela que contém as partidas
            tabela_jogos = None
            for t in soup.find_all("table"):
                rows = t.find_all("tr")
                if len(rows) > 1:
                    sample_tds = [td.get_text(strip=True) for td in rows[1].find_all(["td", "th"])]
                    if len(sample_tds) >= 8 and re.match(r"^\d{4}-\d{2}-\d{2}$", sample_tds[1]):
                        tabela_jogos = t
                        break

            if not tabela_jogos:
                break

            rows = tabela_jogos.find_all("tr")
            jogos_nesta_pagina = 0
            for r in rows[1:]:
                tds = [td.get_text(strip=True) for td in r.find_all(["td", "th"])]
                if len(tds) < 8:
                    continue

                data_iso = tds[1].strip()
                if not re.match(r"^\d{4}-\d{2}-\d{2}$", data_iso):
                    continue

                horario = tds[2].strip() if tds[2] else None
                mando = tds[3].strip()  # (C) ou (F)
                adv_raw = tds[5].strip()
                adversario = normalizar_time(adv_raw)

                # Placar (ignora partidas não realizadas com "-")
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

            # Avança na paginação oficial usando next-link
            next_a = soup.find("a", class_="next-link")
            if next_a and next_a.get("href"):
                url = "https://www.ogol.com.br" + next_a["href"]
                pagina += 1
            else:
                url = None

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
            WHERE data = ? AND (
                (mandante LIKE ? AND visitante LIKE ?) OR
                (mandante LIKE ? AND visitante LIKE ?)
            )
        """, (
            j["data"],
            f"%{j['mandante'][:4]}%", f"%{j['visitante'][:4]}%",
            f"%{j['visitante'][:4]}%", f"%{j['mandante'][:4]}%"
        ))
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

def sincronizar_clubes(anos: List[int], clubes: Optional[List[str]] = None):
    """
    Sincroniza uma lista de anos para os clubes especificados (ou todos os 20 principais).
    """
    alvo_slugs = clubes if clubes else sorted(list(CLUBES_OGOL.keys()))
    print(f"=== INICIANDO SINCRONIZAÇÃO DE CLUBES (Anos: {anos}) ===")
    
    total_ins = 0
    total_upd = 0
    
    for ano in anos:
        for slug in alvo_slugs:
            nome_exib = CLUBES_OGOL.get(slug, slug)
            print(f"\nSincronizando {nome_exib} ({ano})...")
            jogos = extrair_jogos_ogol(slug, ano)
            if jogos:
                res_loc = aplicar_ao_banco(jogos, DB_LOCAL)
                res_api = aplicar_ao_banco(jogos, DB_API)
                total_ins += res_loc["inseridos"]
                total_upd += res_loc["atualizados"]
                print(f" -> {nome_exib} ({ano}): +{res_loc['inseridos']} novos jogos, {res_loc['atualizados']} atualizados.")
                
    print(f"\n[FIM DA SINCRONIZAÇÃO] Total Inseridos: {total_ins} | Total Atualizados: {total_upd}")

if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser(description="Extrator de Jogos de Clubes Brasileiros (OGol)")
    parser.add_argument("--anos", type=str, default="", help="Anos separados por vírgula (ex: 2024,2025,2026)")
    parser.add_argument("--clube", type=str, default="", help="Slug do clube (ex: flamengo, vasco)")
    parser.add_argument("--diario", action="store_true", help="Executa atualização do ano corrente para todos os clubes")
    args = parser.parse_args()

    from datetime import datetime
    ano_atual = datetime.now().year

    if args.diario:
        sincronizar_clubes(anos=[ano_atual])
    elif args.anos:
        anos_lista = [int(a.strip()) for a in args.anos.split(",") if a.strip()]
        clubes_lista = [args.clube.strip().lower()] if args.clube else None
        sincronizar_clubes(anos=anos_lista, clubes=clubes_lista)
    else:
        # Padrão: atualiza temporada atual
        sincronizar_clubes(anos=[ano_atual])

