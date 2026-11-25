#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
scripts/enriquecer_arbitros_2025_2026_ogol.py
=============================================
Coleta árbitros e treinadores das súmulas da Série A 2025 e 2026 no OGol
e preenche as lacunas na tabela 'partidas' (arbitro, tecnico_mandante, tecnico_visitante).
"""

import os
import re
import sys
import time
import sqlite3
import unicodedata
import urllib.request
from concurrent.futures import ThreadPoolExecutor, as_completed
from bs4 import BeautifulSoup

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DB_PATH = os.path.join(BASE_DIR, "data", "futebol.db")

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    "Accept-Language": "pt-BR,pt;q=0.9,en;q=0.8",
}

EDICOES = [
    (2025, "https://www.ogol.com.br/edicao/brasileirao-serie-a-2025/194851/calendario"),
    (2026, "https://www.ogol.com.br/edicao/brasileirao-serie-a-2026/210277/calendario"),
]

ALIAS_NORM = {
    "athleticoparanaense": "athleticopr",
    "atleticopr": "athleticopr",
    "athletico": "athleticopr",
    "atleticomineiro": "atleticomg",
    "atletico": "atleticomg",
    "redbullbragantino": "bragantino",
    "rbbragantino": "bragantino",
    "rcbragantino": "bragantino",
    "vascodagama": "vasco",
    "sportrecife": "sport",
    "americamineiro": "americamg",
    "atleticogoianiense": "atleticogo",
    "gremionovorizontino": "novorizontino",
    "ecvitoria": "vitoria",
    "vitoria": "vitoria",
}


def norm_club(nome: str) -> str:
    if not nome:
        return ""
    s = unicodedata.normalize("NFKD", nome).encode("ASCII", "ignore").decode("utf-8")
    s = re.sub(r"[^a-zA-Z0-9]", "", s).lower()
    return ALIAS_NORM.get(s, s)


def fetch_html(url: str) -> str:
    req = urllib.request.Request(url, headers=HEADERS)
    with urllib.request.urlopen(req, timeout=15) as resp:
        return resp.read().decode("utf-8", errors="ignore")


def extrair_links_edicao(base_url: str, max_pages: int = 8) -> list:
    links = []
    seen = set()
    for pg in range(1, max_pages + 1):
        try:
            html = fetch_html(f"{base_url}?page={pg}")
            encontrados = re.findall(r'href="(/jogo/\d{4}-\d{2}-\d{2}-[^"/]+/\d+)"', html)
            novos = [l for l in encontrados if l not in seen]
            if not novos:
                break
            seen.update(novos)
            links.extend(novos)
        except Exception as e:
            print(f"  [Aviso] Falha página {pg} de {base_url}: {e}")
    return links


def extrair_ficha_jogo(ano: int, rel_url: str) -> dict:
    url = f"https://www.ogol.com.br{rel_url}"
    try:
        html = fetch_html(url)
    except Exception:
        return {}

    soup = BeautifulSoup(html, "html.parser")

    # Times mandante e visitante no header do jogo (.info ou a[href*="/equipa/"])
    mandante, visitante = None, None
    title_tag = soup.find("title")
    if title_tag:
        # Ex: "Estatísticas e Escalações Palmeiras 1-1 Flamengo :: Brasileirão..."
        titulo_limpo = re.sub(
            r"^\s*(?:Estatísticas e Escalações|Ficha de Jogo|Ao vivo)\s+",
            "",
            title_tag.get_text(" ", strip=True),
            flags=re.I,
        )
        m_title = re.match(r"^\s*(.+?)\s+\d+\s*[-xX]\s*\d+\s+(.+?)\s*::", titulo_limpo)
        if m_title:
            mandante = m_title.group(1).strip()
            visitante = m_title.group(2).strip()

    if not mandante or not visitante:
        # Fallback pelos dois primeiros links /equipa/ no header principal
        equipes = []
        for a in soup.find_all("a", href=re.compile(r"/equipa/[^/]+/\d+")):
            txt = a.get_text(strip=True)
            if txt and txt not in equipes:
                equipes.append(txt)
            if len(equipes) == 2:
                break
        if len(equipes) == 2:
            mandante, visitante = equipes[0], equipes[1]

    # Árbitro
    arbitro = None
    for a in soup.find_all("a", href=re.compile(r"/arbitro/")):
        txt = a.get_text(" ", strip=True)
        txt = re.sub(r"^Árbitro\s*", "", txt, flags=re.I).strip()
        if txt and len(txt) > 3:
            arbitro = txt
            break

    # Treinadores (2 primeiros links /treinador/ ou /coach/)
    treinadores = []
    for a in soup.find_all("a", href=re.compile(r"/treinador/")):
        txt = a.get_text(" ", strip=True)
        if txt and len(txt) > 2 and txt not in treinadores:
            treinadores.append(txt)
        if len(treinadores) == 2:
            break

    if not mandante or not visitante:
        return {}

    return {
        "ano": ano,
        "mandante_norm": norm_club(mandante),
        "visitante_norm": norm_club(visitante),
        "arbitro": arbitro,
        "tecnico_mandante": treinadores[0] if len(treinadores) >= 1 else None,
        "tecnico_visitante": treinadores[1] if len(treinadores) >= 2 else None,
    }


def main():
    t0 = time.time()
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    c = conn.cursor()

    # Mapear partidas de 2025 e 2026 da Série A que precisam de árbitro ou técnico
    rows = c.execute("""
        SELECT id_partida, ano, mandante, visitante, arbitro, tecnico_mandante, tecnico_visitante
        FROM partidas
        WHERE ano IN (2025, 2026)
          AND (campeonato LIKE '%Série A%' OR campeonato IN ('Brasileirão 2025', 'Brasileirão 2026'))
    """).fetchall()

    mapa_partidas = {}
    for r in rows:
        key = (r["ano"], norm_club(r["mandante"]), norm_club(r["visitante"]))
        mapa_partidas.setdefault(key, []).append(dict(r))

    print(f"[*] Partidas Série A 2025-2026 mapeadas no banco: {len(rows)} linhas ({len(mapa_partidas)} confrontos).")

    tarefas = []
    for ano, base_url in EDICOES:
        links = extrair_links_edicao(base_url, max_pages=8)
        print(f"[*] {ano}: {len(links)} links de jogos encontrados no OGol.")
        for l in links:
            tarefas.append((ano, l))

    atualizados_arb = 0
    atualizados_tec = 0
    processados = 0

    with ThreadPoolExecutor(max_workers=8) as pool:
        futs = [pool.submit(extrair_ficha_jogo, ano, link) for ano, link in tarefas]
        for fut in as_completed(futs):
            processados += 1
            res = fut.result()
            if not res:
                continue
            key = (res["ano"], res["mandante_norm"], res["visitante_norm"])
            alvos = mapa_partidas.get(key, [])
            for p in alvos:
                pid = p["id_partida"]
                if res.get("arbitro") and (not p["arbitro"] or not p["arbitro"].strip()):
                    c.execute("UPDATE partidas SET arbitro = ? WHERE id_partida = ?", (res["arbitro"], pid))
                    p["arbitro"] = res["arbitro"]
                    atualizados_arb += 1
                if res.get("tecnico_mandante") and (not p["tecnico_mandante"] or not p["tecnico_mandante"].strip()):
                    c.execute("UPDATE partidas SET tecnico_mandante = ? WHERE id_partida = ?", (res["tecnico_mandante"], pid))
                    p["tecnico_mandante"] = res["tecnico_mandante"]
                    atualizados_tec += 1
                if res.get("tecnico_visitante") and (not p["tecnico_visitante"] or not p["tecnico_visitante"].strip()):
                    c.execute("UPDATE partidas SET tecnico_visitante = ? WHERE id_partida = ?", (res["tecnico_visitante"], pid))
                    p["tecnico_visitante"] = res["tecnico_visitante"]
            if processados % 100 == 0:
                conn.commit()
                print(f"  ... {processados}/{len(tarefas)} fichas processadas | arbitros={atualizados_arb} | tecnicos={atualizados_tec}")

    conn.commit()
    conn.close()
    print(f"[CONCLUÍDO em {time.time()-t0:.1f}s] Árbitros preenchidos: {atualizados_arb} | Técnicos preenchidos: {atualizados_tec}")


if __name__ == "__main__":
    main()
