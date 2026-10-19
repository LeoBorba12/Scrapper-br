"""
Módulo de Enriquecimento de Estatísticas Detalhadas de Partidas
==============================================================
Extrai e enriquece campos granulares de cada partida via OGol:
  - Estádio oficial, Cidade e Estado
  - Árbitro principal e Federação
  - Técnicos (mandante e visitante)
  - Público pagante / presente
  - Criação de visões analíticas de Estádios e Árbitros

Suporta execução direcionada (ex: --anos 2024,2025,2026 ou --limite 100).
"""

import os
import re
import sys
import time
import sqlite3
import argparse
import requests
from typing import Dict, List, Optional
from bs4 import BeautifulSoup

sys.stdout.reconfigure(line_buffering=True)

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DB_LOCAL = os.path.join(BASE_DIR, "data", "futebol.db")
DB_API = os.path.join(BASE_DIR, "api", "data", "futebol.db")

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept-Language": "pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7"
}

def extrair_detalhes_jogo(url_jogo: str) -> Optional[Dict]:
    """
    Raspa a ficha técnica de um jogo individual no OGol.
    """
    try:
        time.sleep(0.3)
        r = requests.get(url_jogo, headers=HEADERS, timeout=12)
        if r.status_code != 200:
            return None

        soup = BeautifulSoup(r.text, "html.parser")
        dados = {
            "estadio": None,
            "cidade": None,
            "estado": None,
            "arbitro": None,
            "tecnico_mandante": None,
            "tecnico_visitante": None,
            "publico": None
        }

        # 1. Informações de Estádio, Árbitro e Torcedores no bloco card-data
        for cd in soup.find_all(class_="card-data"):
            txt = cd.get_text(separator=" | ", strip=True)
            
            # Bloco de Informação do Jogo
            if "Estádio" in txt and ("Árbitro" in txt or "Torcedores" in txt or "Lotação" in txt):
                partes = [p.strip() for p in txt.split(" | ")]
                for i, p in enumerate(partes):
                    if p == "Estádio" and i + 1 < len(partes):
                        dados["estadio"] = partes[i + 1]
                        if i + 2 < len(partes) and "(" in partes[i + 2] and ")" in partes[i + 2]:
                            loc = partes[i + 2]
                            m_uf = re.search(r"^(.*?)\s*\(([A-Z]{2})\)", loc)
                            if m_uf:
                                dados["cidade"] = m_uf.group(1).strip()
                                dados["estado"] = m_uf.group(2).strip()
                    elif p == "Árbitro" and i + 1 < len(partes):
                        dados["arbitro"] = partes[i + 1]
                    elif p in ["Torcedores", "Público"] and i + 1 < len(partes):
                        raw_pub = re.sub(r"[^\d]", "", partes[i + 1])
                        if raw_pub.isdigit():
                            dados["publico"] = int(raw_pub)

            # Bloco isolado de Árbitros
            if "Árbitros" in txt and not dados["arbitro"]:
                partes = [p.strip() for p in txt.split(" | ")]
                for i, p in enumerate(partes):
                    if p == "Árbitro" and i + 1 < len(partes):
                        dados["arbitro"] = partes[i + 1]

        # 2. Treinadores
        div_treinadores = soup.find(class_=lambda c: c and "game_report" in str(c) and "Treinadores" in str(c))
        if not div_treinadores:
            # Procura qualquer elemento com Treinadores
            for elem in soup.find_all("div", class_="card-data"):
                if "Treinadores" in elem.text:
                    div_treinadores = elem
                    break

        if div_treinadores:
            subcols = div_treinadores.find_all(class_=lambda c: c and ("col" in str(c) or "player" in str(c)))
            nomes_treinadores = []
            for sc in subcols:
                nome = sc.get_text(strip=True).replace("Treinadores", "").strip()
                if nome and nome not in nomes_treinadores:
                    nomes_treinadores.append(nome)
            if len(nomes_treinadores) >= 2:
                dados["tecnico_mandante"] = nomes_treinadores[0]
                dados["tecnico_visitante"] = nomes_treinadores[1]
            elif len(nomes_treinadores) == 1:
                dados["tecnico_mandante"] = nomes_treinadores[0]

        return dados

    except Exception as e:
        return None

def obter_links_jogos_temporada(clube_slug: str, ano: int) -> List[Dict]:
    """
    Retorna a lista de jogos com link individual de ficha técnica.
    """
    session = requests.Session()
    session.headers.update(HEADERS)
    url = f"https://www.ogol.com.br/equipe/{clube_slug}/todos-os-jogos?ano={ano}"
    partidas = []

    while url:
        try:
            time.sleep(0.3)
            r = session.get(url, timeout=12)
            if r.status_code != 200:
                break
            soup = BeautifulSoup(r.text, "html.parser")
            
            tabela_jogos = None
            for t in soup.find_all("table"):
                rows = t.find_all("tr")
                if len(rows) > 1:
                    tds = [td.get_text(strip=True) for td in rows[1].find_all(["td", "th"])]
                    if len(tds) >= 8 and re.match(r"^\d{4}-\d{2}-\d{2}$", tds[1]):
                        tabela_jogos = t
                        break

            if not tabela_jogos:
                break

            for r_row in tabela_jogos.find_all("tr")[1:]:
                tds = [td.get_text(strip=True) for td in r_row.find_all(["td", "th"])]
                if len(tds) < 8 or not re.match(r"^\d{4}-\d{2}-\d{2}$", tds[1]):
                    continue

                dt = tds[1].strip()
                # Procura o link do jogo (/jogo/...)
                link_jogo = None
                for a in r_row.find_all("a"):
                    href = a.get("href", "")
                    if "/jogo/" in href:
                        link_jogo = "https://www.ogol.com.br" + href
                        break

                if link_jogo:
                    partidas.append({
                        "data": dt,
                        "mando": tds[3].strip(),
                        "adversario": tds[5].strip(),
                        "placar": tds[6].strip(),
                        "campeonato": tds[7].strip(),
                        "url_jogo": link_jogo
                    })

            next_a = soup.find("a", class_="next-link")
            if next_a and next_a.get("href"):
                url = "https://www.ogol.com.br" + next_a["href"]
            else:
                url = None

        except Exception:
            break

    return partidas

def criar_ou_atualizar_visoes_analiticas(db_path: str):
    """
    Cria ou atualiza views analíticas de Estádios e Árbitros para o dashboard e a IA.
    """
    if not os.path.exists(db_path):
        return

    conn = sqlite3.connect(db_path)
    c = conn.cursor()

    # 1. View Analítica de Estádios
    c.execute("DROP VIEW IF EXISTS view_estatisticas_estadios")
    c.execute("""
        CREATE VIEW view_estatisticas_estadios AS
        SELECT 
            estadio,
            cidade,
            estado,
            COUNT(*) as total_jogos,
            SUM(gols_mandante + gols_visitante) as total_gols,
            ROUND(AVG(gols_mandante + gols_visitante), 2) as media_gols_jogo,
            MAX(publico) as recorde_publico,
            COUNT(DISTINCT campeonato) as competicoes_distintas
        FROM partidas
        WHERE estadio IS NOT NULL AND estadio != '' 
          AND estadio NOT LIKE '%Estadual%' 
          AND estadio NOT LIKE '%Conmebol%'
          AND estadio NOT LIKE '%Regional%'
        GROUP BY estadio
        HAVING total_jogos >= 5
        ORDER BY total_jogos DESC
    """)

    # 2. View Analítica de Árbitros
    c.execute("DROP VIEW IF EXISTS view_estatisticas_arbitros")
    c.execute("""
        CREATE VIEW view_estatisticas_arbitros AS
        SELECT 
            arbitro,
            COUNT(*) as total_jogos,
            SUM(CASE WHEN vencedor = mandante THEN 1 ELSE 0 END) as vitorias_mandante,
            SUM(CASE WHEN vencedor = visitante THEN 1 ELSE 0 END) as vitorias_visitante,
            SUM(CASE WHEN vencedor = 'Empate' THEN 1 ELSE 0 END) as empates,
            ROUND(100.0 * SUM(CASE WHEN vencedor = mandante THEN 1 ELSE 0 END) / COUNT(*), 1) as pct_vitorias_mandante,
            ROUND(AVG(gols_mandante + gols_visitante), 2) as media_gols_jogo
        FROM partidas
        WHERE arbitro IS NOT NULL AND arbitro != '' 
          AND arbitro NOT LIKE '%Estadual%' 
          AND arbitro NOT LIKE '%Conmebol%' 
          AND arbitro NOT LIKE '%Regional%'
          AND arbitro NOT LIKE '%Carioca%'
          AND arbitro NOT LIKE '%Paulista%'
          AND arbitro != 'Não informado'
        GROUP BY arbitro
        HAVING total_jogos >= 5
        ORDER BY total_jogos DESC
    """)

    conn.commit()
    conn.close()

def aplicar_detalhes_ao_banco(dt: str, mand: str, vis: str, detalhes: Dict, db_path: str) -> bool:
    """
    Atualiza os campos de estádio, árbitro, técnicos e público em uma partida específica.
    """
    if not os.path.exists(db_path):
        return False

    conn = sqlite3.connect(db_path)
    c = conn.cursor()

    upd = []
    vals = []

    if detalhes.get("estadio"):
        upd.append("estadio = ?")
        vals.append(detalhes["estadio"])
    if detalhes.get("cidade"):
        upd.append("cidade = ?")
        vals.append(detalhes["cidade"])
    if detalhes.get("estado"):
        upd.append("estado = ?")
        vals.append(detalhes["estado"])
    if detalhes.get("arbitro"):
        upd.append("arbitro = ?")
        vals.append(detalhes["arbitro"])
    if detalhes.get("tecnico_mandante"):
        upd.append("tecnico_mandante = ?")
        vals.append(detalhes["tecnico_mandante"])
    if detalhes.get("tecnico_visitante"):
        upd.append("tecnico_visitante = ?")
        vals.append(detalhes["tecnico_visitante"])
    if detalhes.get("publico"):
        upd.append("publico = ?")
        vals.append(detalhes["publico"])

    if not upd:
        conn.close()
        return False

    sql = f"""
        UPDATE partidas 
        SET {', '.join(upd)}
        WHERE data = ? AND (
            (mandante LIKE ? AND visitante LIKE ?) OR
            (mandante LIKE ? AND visitante LIKE ?)
        )
    """
    vals.extend([dt, f"%{mand[:4]}%", f"%{vis[:4]}%", f"%{vis[:4]}%", f"%{mand[:4]}%"])

    c.execute(sql, vals)
    afetados = c.rowcount
    conn.commit()
    conn.close()
    return afetados > 0

def enriquecer_temporadas(anos: List[int], clubes: Optional[List[str]] = None, limite_jogos: int = 50):
    """
    Executa o enriquecimento de fichas para os anos informados.
    """
    print(f"\n=== ENRIQUECENDO DETALHES DE ESTÁDIOS, ÁRBITROS E TÉCNICOS ({anos}) ===")
    
    from scraper_ogol_clubes import CLUBES_OGOL
    alvo_slugs = clubes if clubes else ["flamengo", "palmeiras", "corinthians", "sao-paulo", "vasco", "gremio", "internacional", "cruzeiro", "atletico-mineiro", "botafogo", "fluminense", "santos"]

    total_enriquecidos = 0

    for ano in anos:
        for slug in alvo_slugs:
            if total_enriquecidos >= limite_jogos:
                break
            nome_clube = CLUBES_OGOL.get(slug, slug.title())
            partidas = obter_links_jogos_temporada(slug, ano)
            print(f"\n[{ano}] {nome_clube}: {len(partidas)} fichas de partidas encontradas.")

            for p in partidas:
                if total_enriquecidos >= limite_jogos:
                    break

                detalhes = extrair_detalhes_jogo(p["url_jogo"])
                if detalhes and (detalhes.get("estadio") or detalhes.get("arbitro")):
                    mand = nome_clube if p["mando"] == "(C)" else p["adversario"]
                    vis = p["adversario"] if p["mando"] == "(C)" else nome_clube
                    
                    ok_loc = aplicar_detalhes_ao_banco(p["data"], mand, vis, detalhes, DB_LOCAL)
                    ok_api = aplicar_detalhes_ao_banco(p["data"], mand, vis, detalhes, DB_API)

                    if ok_loc or ok_api:
                        total_enriquecidos += 1
                        print(f"  [{p['data']}] {mand} vs {vis} -> Estádio: {detalhes.get('estadio') or '-'} | Árbitro: {detalhes.get('arbitro') or '-'} | Público: {detalhes.get('publico') or '-'}")

    # Atualiza as visões analíticas nos dois bancos
    criar_ou_atualizar_visoes_analiticas(DB_LOCAL)
    criar_ou_atualizar_visoes_analiticas(DB_API)

    print(f"\n[FIM DO ENRIQUECIMENTO] Total de partidas enriquecidas com sucesso: {total_enriquecidos}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--anos", type=str, default="2024,2025,2026")
    parser.add_argument("--limite", type=int, default=30)
    args = parser.parse_args()

    anos_lista = [int(a.strip()) for a in args.anos.split(",") if a.strip()]
    enriquecer_temporadas(anos_lista, limite_jogos=args.limite)
