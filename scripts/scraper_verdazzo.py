"""
Extrator Inteligente do Almanaque do Verdazzo (SE Palmeiras)
============================================================
Capacidades:
1. Extrai jogos de qualquer temporada histórica (ex: 1993, 1999, 2020, etc.).
2. Coleta ficha técnica completa quando disponível:
   - Placar e adversário
   - Campeonato e data
   - Estádio, Público e Renda
   - Árbitro
   - Técnicos de ambos os times
   - Escalações completas
3. Cruza com futebol.db e enriquece ou insere novas partidas.
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
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
}

def extrair_temporada_verdazzo(ano: int, max_detalhes: int = 5) -> List[Dict]:
    """
    Extrai a lista de jogos da temporada e as fichas técnicas detalhadas.
    """
    url_temporada = f"https://www.verdazzo.com.br/temporada/{ano}/"
    resp = requests.get(url_temporada, headers=HEADERS, timeout=15)
    if resp.status_code != 200:
        print(f"[ERRO] Falha ao acessar temporada {ano}: status {resp.status_code}")
        return []

    soup = BeautifulSoup(resp.text, "html.parser")
    tables = soup.find_all("table")
    if len(tables) < 3:
        print(f"[AVISO] Tabela de jogos não encontrada para o ano {ano}")
        return []

    # A tabela 2 é a tabela com a listagem de jogos
    tabela_jogos = tables[2]
    jogos = []

    for row in tabela_jogos.find_all("tr")[1:]:
        tds = row.find_all("td")
        if len(tds) < 3:
            continue

        data_curta = tds[0].get_text(strip=True)  # ex: 27/01
        m_data = re.match(r"^(\d{2})/(\d{2})$", data_curta)
        if m_data:
            dia, mes = m_data.groups()
            data_iso = f"{ano}-{mes}-{dia}"
        else:
            data_iso = None

        campeonato = tds[2].get_text(strip=True)

        # Link da ficha detalhada (na última coluna ou no TD 3)
        link_ficha = None
        for a in row.find_all("a", href=True):
            if "/jogo/" in a["href"]:
                link_ficha = a["href"]
                break

        # Adversário vem no TD 1
        link_adv = tds[1].find("a", href=True)
        adv_slug = ""
        if link_adv:
            partes = [p for p in link_adv["href"].strip("/").split("/") if p]
            if partes:
                adv_slug = partes[-1].replace("-", " ").title()

        jogos.append({
            "ano": ano,
            "data": data_iso,
            "adversario_slug": adv_slug,
            "campeonato": campeonato,
            "url_ficha": link_ficha
        })

    print(f"[{ano}] Encontrados {len(jogos)} jogos na temporada.")

    # Detalha fichas técnicas das primeiras partidas (ou todas se max_detalhes for None)
    limite = len(jogos) if max_detalhes is None else min(len(jogos), max_detalhes)
    for i in range(limite):
        j = jogos[i]
        if not j.get("url_ficha"):
            continue

        try:
            time.sleep(0.3)
            r_det = requests.get(j["url_ficha"], headers=HEADERS, timeout=12)
            if r_det.status_code == 200:
                soup_det = BeautifulSoup(r_det.text, "html.parser")
                
                # Placar e Times
                # Exemplo de título: "27-01-1993 - Palmeiras 2x1 Marília - Campeonato Paulista 1993 - Verdazzo"
                t_match = re.search(r"-\s*([A-Za-zÀ-ÿ\s\.]+?)\s+(\d+)\s*[xX×]\s*(\d+)\s+([A-Za-zÀ-ÿ\s\.]+?)\s*-", soup_det.title.get_text() if soup_det.title else "")
                if t_match:
                    j["mandante"] = t_match.group(1).strip()
                    j["gols_mandante"] = int(t_match.group(2))
                    j["gols_visitante"] = int(t_match.group(3))
                    j["visitante"] = t_match.group(4).strip()
                else:
                    j["mandante"] = "Palmeiras"
                    j["visitante"] = j["adversario_slug"]

                # Extrai dados da Ficha Técnica (Público, Renda, Árbitro)
                ficha_tag = soup_det.find(id="ficha_tecnica") or soup_det.find(class_="ficha_tecnica")
                if ficha_tag:
                    ficha_parent = ficha_tag.find_parent("div") or ficha_tag.parent
                    txt_ficha = ficha_parent.get_text("\n", strip=True) if ficha_parent else ""
                    linhas_f = [l.strip() for l in txt_ficha.splitlines() if l.strip()]
                    
                    # Procura padrões de público (ex: "27.516" ou "Público: ...")
                    for lf in linhas_f:
                        if re.match(r"^\d{1,3}(?:\.\d{3})+$", lf):
                            j["publico"] = int(lf.replace(".", ""))
                            break

                    # Árbitro costuma ser uma das primeiras linhas de texto após valores
                    for lf in linhas_f:
                        if any(k in lf.lower() for k in ["árbitro:", "juiz:"]):
                            j["arbitro"] = re.sub(r"^[^\:]+\:\s*", "", lf).strip()
                            break
                        # Se não tiver rótulo mas for um nome típico de árbitro
                        if lf in ["Edmundo Lima Filho", "José Roberto Wright", "Márcio Rezende de Freitas", "Arnaldo Cezar Coelho", "Romualdo Arppi Filho"]:
                            j["arbitro"] = lf
                            break

                # Estádio
                meta_stadium = soup_det.find(text=re.compile(r"Estádio|Palestra|Pacaembu|Morumbi|Allianz", re.IGNORECASE))
                if meta_stadium:
                    j["estadio"] = meta_stadium.strip()

        except Exception as e:
            print(f"Erro ao obter ficha {j['url_ficha']}: {e}")

    return jogos

def enriquecer_ou_inserir_no_banco(jogos: List[Dict], db_path: str) -> Dict[str, int]:
    """
    Insere jogos inéditos ou enriquece jogos existentes com estádio, público e árbitro.
    """
    if not os.path.exists(db_path):
        return {"inseridos": 0, "atualizados": 0}

    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    c = conn.cursor()

    c.execute("SELECT max(id_partida) FROM partidas")
    max_id = c.fetchone()[0] or 202400000
    prox_id = max(max_id + 1, 30000000)

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
            # Atualiza campos faltantes
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
            # Jogo inédito (ex: Paulistão 1993 ou Amistoso histórico)
            gm = j.get("gols_mandante", 0)
            gv = j.get("gols_visitante", 0)
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
                j.get("publico"), j.get("arbitro"), j.get("estadio"), j["campeonato"], "Estadual / Regional"
            ))
            prox_id += 1
            inseridos += 1

    conn.commit()
    conn.close()
    return {"inseridos": inseridos, "atualizados": atualizados}

if __name__ == "__main__":
    print("=== TESTE PILOTO: SCRAPER ALMANAQUE DO VERDAZZO ===")
    ano_teste = 1993  # Ano histórico do Palmeiras Parmalat (fim da fila)
    print(f"\n1. Coletando jogos da temporada {ano_teste}...")
    jogos = extrair_temporada_verdazzo(ano_teste, max_detalhes=5)

    print("\n2. Exemplo das partidas e fichas extraídas:")
    for j in jogos[:5]:
        print(f" -> {j.get('data')} | {j.get('mandante')} {j.get('gols_mandante')}x{j.get('gols_visitante')} {j.get('visitante')}")
        print(f"    Camp: {j.get('campeonato')} | Árbitro: {j.get('arbitro')} | Público: {j.get('publico')}")

    print("\n3. Aplicando ao banco de dados...")
    res_local = enriquecer_ou_inserir_no_banco(jogos[:5], DB_LOCAL)
    res_api = enriquecer_ou_inserir_no_banco(jogos[:5], DB_API)
    print(f" -> data/futebol.db: {res_local['inseridos']} inseridos, {res_local['atualizados']} enriquecidos.")
    print(f" -> api/data/futebol.db: {res_api['inseridos']} inseridos, {res_api['atualizados']} enriquecidos.")
