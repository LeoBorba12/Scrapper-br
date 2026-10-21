import os
import sys
import re
import json
import time
import sqlite3
import shutil
import urllib.request
from typing import Dict, List, Tuple, Optional

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DB_LOCAL = os.path.join(BASE_DIR, "data", "futebol.db")
DB_API = os.path.join(BASE_DIR, "api", "data", "futebol.db")
CACHE_DIR = os.path.join(BASE_DIR, "data", "cache_ogol_brasileirao")
os.makedirs(CACHE_DIR, exist_ok=True)

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
    "Accept-Language": "pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7"
}

EDICOES_BRASILEIRAO = {
    2026: "210277",
    2025: "194851",
    2024: "184443",
    2023: "172507",
    2022: "162047",
    2021: "154298",
    2020: "142460",
    2019: "131709",
    2018: "122072",
    2017: "104349",
    2016: "96361",
    2015: "79735",
    2014: "67145",
    2013: "56933",
    2012: "42483",
    2011: "21248",
    2010: "13881",
    2009: "5268",
    2008: "2003",
    2007: "1425",
    2006: "1247",
    2005: "865",
    2004: "457",
    2003: "2489",
    2002: "2490",
    2001: "2492",
    2000: "2495",
    1999: "2493",
    1998: "2507",
    1997: "2508",
    1996: "2509",
    1995: "2639",
    1994: "2643",
    1993: "2649",
    1992: "2650",
    1991: "2651",
    1990: "2674",
    1989: "2676",
    1988: "2700",
    1987: "3335",
    1986: "3387",
    1985: "3512",
    1984: "3530",
    1983: "3643",
    1982: "3663",
    1981: "3822",
    1980: "3827",
    1979: "3866",
    1978: "3903",
    1977: "3985",
    1976: "4002",
    1975: "2491",
    1974: "2483",
    1973: "2482",
    1972: "2481",
    1971: "2477",
}

# Mapa de Clubes Canônicos do Brasileirão
MAPA_CLUBES = {
    "Flamengo": "Flamengo",
    "Fluminense": "Fluminense",
    "Vasco": "Vasco",
    "Vasco da Gama": "Vasco",
    "Botafogo": "Botafogo",
    "Corinthians": "Corinthians",
    "Palmeiras": "Palmeiras",
    "São Paulo": "São Paulo",
    "Santos": "Santos",
    "Santos FC": "Santos",
    "Grêmio": "Grêmio",
    "Internacional": "Internacional",
    "Atlético Mineiro": "Atlético-MG",
    "Atlético-MG": "Atlético-MG",
    "Cruzeiro": "Cruzeiro",
    "Athletico Paranaense": "Athletico-PR",
    "Atlético Paranaense": "Atlético-PR",
    "Athletico-PR": "Athletico-PR",
    "Coritiba": "Coritiba",
    "Paraná": "Paraná",
    "Paraná Clube": "Paraná",
    "Bahia": "Bahia",
    "Vitória": "Vitória",
    "Sport": "Sport",
    "Sport Recife": "Sport",
    "Náutico": "Náutico",
    "Santa Cruz": "Santa Cruz",
    "Fortaleza": "Fortaleza",
    "Ceará": "Ceará",
    "Goiás": "Goiás",
    "Atlético Goianiense": "Atlético-GO",
    "Atlético-GO": "Atlético-GO",
    "Vila Nova": "Vila Nova",
    "Figueirense": "Figueirense",
    "Avaí": "Avaí",
    "Chapecoense": "Chapecoense",
    "Criciúma": "Criciúma",
    "Juventude": "Juventude",
    "Ponte Preta": "Ponte Preta",
    "Guarani": "Guarani",
    "Portuguesa": "Portuguesa",
    "América Mineiro": "América-MG",
    "América-MG": "América-MG",
    "América-RN": "América-RN",
    "Paysandu": "Paysandu",
    "Remo": "Remo",
    "São Caetano": "São Caetano",
    "Ipatinga": "Ipatinga",
    "Barueri": "Grêmio Barueri",
    "Grêmio Barueri": "Grêmio Barueri",
    "Prudente": "Grêmio Barueri",
    "Santo André": "Santo André",
    "Brasiliense": "Brasiliense",
    "Cuiabá": "Cuiabá",
    "Red Bull Bragantino": "Red Bull Bragantino",
    "Bragantino": "Red Bull Bragantino"
}

# Mapa de Atletas Canônicos
MAPA_JOGADORES = {
    "frederico chaves guedes": "Fred",
    "fred": "Fred",
    "romario de souza faria": "Romário",
    "romario": "Romário",
    "romário": "Romário",
    "edmundo alves de souza neto": "Edmundo",
    "edmundo": "Edmundo",
    "tulio maravilha": "Túlio Maravilha",
    "tulio humberto pereira costa": "Túlio Maravilha",
    "diego de souza andrade": "Diego Souza",
    "diego souza": "Diego Souza",
    "washington steccanela cerqueira": "Washington",
    "washington cerqueira": "Washington",
    "washington": "Washington",
    "luis fabiano clemente": "Luís Fabiano",
    "luis fabiano": "Luís Fabiano",
    "luís fabiano": "Luís Fabiano",
    "gabriel barbosa almeida": "Gabriel Barbosa",
    "gabriel barbosa": "Gabriel Barbosa",
    "gabigol": "Gabriel Barbosa",
    "arthur antunes coimbra": "Zico",
    "zico": "Zico",
    "roberto dinamite": "Roberto Dinamite",
    "sergio bernardino": "Serginho Chulapa",
    "serginho chulapa": "Serginho Chulapa",
    "marcelo pereira surcin": "Marcelinho Carioca",
    "marcelinho carioca": "Marcelinho Carioca"
}

def normalizar_clube(c: str) -> str:
    c = c.split('/')[0].strip()
    c = re.sub(r'^(Time|Clube|Equipe)\s+', '', c, flags=re.I).strip()
    c = re.sub(r'\s+saf$', '', c, flags=re.I)
    c = re.sub(r'\s+fc$', '', c, flags=re.I)
    return MAPA_CLUBES.get(c, c)

def normalizar_jogador(j: str) -> str:
    j_clean = j.strip()
    key = j_clean.lower()
    return MAPA_JOGADORES.get(key, j_clean)

def fetch_url(url: str, delay: float = 0.4) -> Optional[str]:
    time.sleep(delay)
    try:
        req = urllib.request.Request(url, headers=HEADERS)
        with urllib.request.urlopen(req, timeout=12) as resp:
            return resp.read().decode('utf-8', errors='ignore')
    except urllib.error.HTTPError as e:
        if e.code == 429:
            print("  [!] Rate limit (429). Aguardando 5s...")
            time.sleep(5)
            return fetch_url(url, delay=1.0)
        print(f"  [Erro HTTP {e.code}]: {url}")
        return None
    except Exception as e:
        print(f"  [Erro de conexão]: {url} -> {e}")
        return None

def obter_jogos_edicao(ano: int, ed_id: str) -> List[Dict]:
    cache_path = os.path.join(CACHE_DIR, f"jogos_brasileirao_{ano}_{ed_id}.json")
    if os.path.exists(cache_path):
        with open(cache_path, "r", encoding="utf-8") as f:
            return json.load(f)

    jogos = []
    base_calendar_url = f"https://www.ogol.com.br/edicao/brasileirao-{ano}/{ed_id}/calendario?fase_in=0&page="

    print(f"  -> Coletando calendário de {ano}...")
    page = 1
    total_jogos_esperados = 462 if ano == 2005 else (552 if ano in (2003, 2004) else 380)

    while True:
        url = f"{base_calendar_url}{page}"
        html = fetch_url(url)
        if not html:
            break

        blocos = re.findall(r'<tr[^>]*data-match-id="(\d+)"[^>]*>.*?</tr>', html, flags=re.DOTALL)
        if not blocos:
            matches_links = re.findall(r'href="(/jogo/\d{4}-\d{2}-\d{2}[^"]+/(\d+))"', html)
            if not matches_links:
                break
            for link, j_id in matches_links:
                m_date = re.search(r'/jogo/(\d{4}-\d{2}-\d{2})', link)
                dt = m_date.group(1) if m_date else None
                jogos.append({"link": link, "id_ogol": j_id, "data": dt})
        else:
            for b in blocos:
                m_id = b
                link_m = re.search(r'href="(/jogo/[^"]+/' + m_id + r')"', html)
                if link_m:
                    link = link_m.group(1)
                    m_date = re.search(r'/jogo/(\d{4}-\d{2}-\d{2})', link)
                    dt = m_date.group(1) if m_date else None
                    jogos.append({"link": link, "id_ogol": m_id, "data": dt})

        # Remove duplicatas preservando ordem
        vistos = set()
        dedup = []
        for item in jogos:
            if item["id_ogol"] not in vistos:
                vistos.add(item["id_ogol"])
                dedup.append(item)
        jogos = dedup

        if len(jogos) >= total_jogos_esperados or "next" not in html.lower():
            break

        page += 1
        if page > 25:
            break

    with open(cache_path, "w", encoding="utf-8") as f:
        json.dump(jogos, f, indent=2, ensure_ascii=False)

    return jogos

def extrair_detalhes_jogo_ogol(jogo_path: str) -> Optional[Dict]:
    m = re.search(r'/(\d+)$', jogo_path)
    if not m:
        return None
    jogo_id = m.group(1)
    cache_path = os.path.join(CACHE_DIR, f"jogo_{jogo_id}.json")
    if os.path.exists(cache_path):
        with open(cache_path, "r", encoding="utf-8") as f:
            return json.load(f)

    url = f"https://www.ogol.com.br{jogo_path}"
    html = fetch_url(url)
    if not html:
        return None

    m_data = re.search(r'/jogo/(\d{4}-\d{2}-\d{2})', jogo_path)
    data_iso = m_data.group(1) if m_data else None

    # Times (Suporte a layout clássico e moderno)
    home_name = None
    m_home = re.search(r'<div class="match-header-team right">.*?<div class="match-header-team-name">\s*<a[^>]*>([^<]+)', html, flags=re.DOTALL)
    if m_home:
        home_name = normalizar_clube(m_home.group(1).strip())
    else:
        home_div = re.findall(r'<div class="match-header-team right">.*?<a[^>]*title="([^"]+)"', html, flags=re.DOTALL)
        if home_div:
            h = re.sub(r'^(Estatísticas e Escalações|Fotografias|Ficha de Jogo|Vídeos)\s+', '', home_div[0], flags=re.I)
            home_name = normalizar_clube(h)

    away_name = None
    m_away = re.search(r'<div class="match-header-team left">.*?<div class="match-header-team-name">\s*<a[^>]*>([^<]+)', html, flags=re.DOTALL)
    if m_away:
        away_name = normalizar_clube(m_away.group(1).strip())
    else:
        away_div = re.findall(r'<div class="match-header-team left">.*?<a[^>]*title="([^"]+)"', html, flags=re.DOTALL)
        if away_div:
            a = re.sub(r'^(Estatísticas e Escalações|Fotografias|Ficha de Jogo|Vídeos)\s+', '', away_div[0], flags=re.I)
            away_name = normalizar_clube(a)

    # Placar (evita pegar data da URL dentro do href)
    placar = "0x0"
    m_vs = re.search(r'<div class="match-header-vs"[^>]*>(.*?)</div>', html, flags=re.DOTALL)
    if m_vs:
        vs_content = m_vs.group(1)
        m_num = re.search(r'>\s*(\d+)\s*-\s*(\d+)\s*<', vs_content)
        if m_num:
            placar = f"{m_num.group(1)}x{m_num.group(2)}"
        else:
            m_alt = re.search(r'(\d+)\s*-\s*(\d+)', vs_content)
            if m_alt:
                placar = f"{m_alt.group(1)}x{m_alt.group(2)}"

    # Gols
    scorers_home = re.findall(r'<div class="match-header-scorers right">(.*?)</div>', html, flags=re.DOTALL)
    scorers_away = re.findall(r'<div class="match-header-scorers left">(.*?)</div>', html, flags=re.DOTALL)

    gols = []

    def parse_scorers(txt_html: str, clube: str):
        res = []
        # Layout moderno: <div class="match-header-scorer">
        items_mod = re.findall(r'<div class="match-header-scorer">(.*?)</div>', txt_html, flags=re.DOTALL)
        if items_mod:
            for item in items_mod:
                p_m = re.search(r'<a[^>]*href="/jogador/[^"]+/(\d+)"[^>]*>(.*?)</a>', item)
                m_m = re.search(r'<span class="match-header-scorer-minute">(.*?)</span>', item)
                atleta_bruto = p_m.group(2).strip() if p_m else ""
                atleta = normalizar_jogador(atleta_bruto)
                min_raw = m_m.group(1).strip() if m_m else "0"

                tipo = "Normal"
                if "pen" in min_raw.lower():
                    tipo = "Pênalti"
                elif "g.c" in min_raw.lower() or "contra" in min_raw.lower():
                    tipo = "Gol Contra"
                elif "falta" in min_raw.lower():
                    tipo = "Falta"

                m_clean = re.sub(r'\(.*?\)', '', min_raw).replace("'", "").strip()
                m_base = re.search(r'^\d+', m_clean)
                base_num = int(m_base.group(0)) if m_base else 0
                tempo = "1T" if base_num <= 45 else "2T"

                if atleta:
                    res.append({
                        "atleta": atleta,
                        "clube": clube,
                        "minuto": m_clean,
                        "tempo": tempo,
                        "tipo_de_gol": tipo
                    })
            return res

        # Layout clássico: <a href="/jogador/...">Atleta</a> <span class="time">  18' (pen.) 42'</span>
        items_cla = re.findall(r'<a[^>]*href="/jogador/[^"]+"[^>]*>([^<]+)</a>\s*<span class="time">([^<]+)</span>', txt_html)
        if items_cla:
            for at_raw, min_raw in items_cla:
                atleta = normalizar_jogador(at_raw.strip())
                # Suporta múltiplos minutos para o mesmo atleta (ex: "50' (pen.)  68'   78' (pen.)")
                minutos_encontrados = re.findall(r'(\d+)[\'’]?(?:\s*\(([^)]+)\))?', min_raw)
                if minutos_encontrados:
                    for m_num, m_obs in minutos_encontrados:
                        tipo = "Normal"
                        obs_lower = (m_obs or "").lower()
                        if "pen" in obs_lower:
                            tipo = "Pênalti"
                        elif "g.c" in obs_lower or "contra" in obs_lower:
                            tipo = "Gol Contra"
                        elif "falta" in obs_lower:
                            tipo = "Falta"

                        base_num = int(m_num) if m_num.isdigit() else 0
                        tempo = "1T" if base_num <= 45 else "2T"

                        if atleta:
                            res.append({
                                "atleta": atleta,
                                "clube": clube,
                                "minuto": m_num,
                                "tempo": tempo,
                                "tipo_de_gol": tipo
                            })
                else:
                    m_clean = re.sub(r'\(.*?\)', '', min_raw).replace("'", "").strip()
                    m_base = re.search(r'^\d+', m_clean)
                    base_num = int(m_base.group(0)) if m_base else 0
                    tempo = "1T" if base_num <= 45 else "2T"
                    if atleta:
                        res.append({
                            "atleta": atleta,
                            "clube": clube,
                            "minuto": m_clean,
                            "tempo": tempo,
                            "tipo_de_gol": "Normal"
                        })
        return res

    if scorers_home and home_name:
        gols.extend(parse_scorers(scorers_home[0], home_name))
    if scorers_away and away_name:
        gols.extend(parse_scorers(scorers_away[0], away_name))

    estadio_m = re.search(r'/estadio\.php\?id=\d+"[^>]*>(.*?)</a>', html)
    estadio = estadio_m.group(1).strip() if estadio_m else None

    arbitro_m = re.search(r'/arbitro\.php\?id=\d+"[^>]*>(.*?)</a>', html)
    arbitro = arbitro_m.group(1).strip() if arbitro_m else None

    dados = {
        "id_ogol": jogo_id,
        "data": data_iso,
        "home": home_name,
        "away": away_name,
        "placar": placar,
        "gols": gols,
        "estadio": estadio,
        "arbitro": arbitro
    }
    with open(cache_path, "w", encoding="utf-8") as f:
        json.dump(dados, f, indent=2, ensure_ascii=False)
    return dados

def executar_pipeline_brasileirao(anos_alvo: List[int]):
    print(f"\n=======================================================")
    print(f"  EXECUTANDO PIPELINE: BRASILEIRÃO SÉRIE A (OGOL)")
    print(f"  Anos Alvo: {anos_alvo}")
    print(f"=======================================================")

    conn = sqlite3.connect(DB_LOCAL, timeout=60.0)
    c = conn.cursor()

    total_gols_adicionados = 0
    total_estadios_atualizados = 0

    for ano in anos_alvo:
        ed_id = EDICOES_BRASILEIRAO.get(ano)
        if not ed_id:
            print(f"[-] Ano {ano} não mapeado no dicionário de edições.")
            continue

        print(f"\n[+] Inspecionando Brasileirão {ano} (Edição ID: {ed_id})...")
        jogos = obter_jogos_edicao(ano, ed_id)
        print(f"    -> {len(jogos)} jogos catalogados na edição.")

        for idx, j in enumerate(jogos):
            detalhes = extrair_detalhes_jogo_ogol(j["link"])
            if not detalhes:
                continue

            home = detalhes["home"]
            away = detalhes["away"]
            data_iso = detalhes.get("data")
            if not home or not away:
                continue

            # Busca partida correspondente no banco
            partidas_match = []
            if data_iso:
                c.execute("""
                    SELECT id_partida, estadio, arbitro FROM partidas
                    WHERE ano = ?
                      AND (
                          (mandante = ? AND visitante = ?) OR
                          (mandante LIKE ? AND visitante LIKE ?)
                      )
                      AND abs(julianday(data) - julianday(?)) <= 3
                """, (ano, home, away, f"%{home[:5]}%", f"%{away[:5]}%", data_iso))
                partidas_match = c.fetchall()

            if not partidas_match:
                c.execute("""
                    SELECT id_partida, estadio, arbitro FROM partidas
                    WHERE ano = ?
                      AND (campeonato LIKE '%Brasileir%' OR campeonato LIKE '%Série A%')
                      AND (
                          (mandante = ? AND visitante = ?) OR
                          (mandante LIKE ? AND visitante LIKE ?)
                      )
                """, (ano, home, away, f"%{home[:5]}%", f"%{away[:5]}%"))
                partidas_match = c.fetchall()

            if partidas_match:
                for pid, est_p, arb_p in partidas_match:
                    if detalhes.get("estadio") and (not est_p or est_p.strip() == ""):
                        c.execute("UPDATE partidas SET estadio = ? WHERE id_partida = ?", (detalhes["estadio"], pid))
                        total_estadios_atualizados += 1

                    if detalhes.get("arbitro") and (not arb_p or arb_p.strip() == ""):
                        c.execute("UPDATE partidas SET arbitro = ? WHERE id_partida = ?", (detalhes["arbitro"], pid))

                    c.execute("SELECT COUNT(*) FROM gols WHERE id_partida = ?", (pid,))
                    if c.fetchone()[0] == 0 and detalhes.get("gols"):
                        for g in detalhes["gols"]:
                            c.execute("""
                                INSERT INTO gols (id_partida, rodada, clube, atleta, minuto, tempo, tipo_de_gol)
                                VALUES (?, NULL, ?, ?, ?, ?, ?)
                            """, (pid, g["clube"], g["atleta"], g.get("minuto", "0"), g.get("tempo", "1T"), g.get("tipo_de_gol", "Normal")))
                            total_gols_adicionados += 1

            if idx > 0 and idx % 25 == 0:
                conn.commit()
                print(f"    ... {idx}/{len(jogos)} jogos processados (+{total_gols_adicionados} gols | +{total_estadios_atualizados} estádios)")

        conn.commit()
        print(f"  [OK] Concluído Brasileirão {ano}: +{total_gols_adicionados} gols acumulados.")

    conn.close()

def safe_copy_db(src: str, dst: str):
    import subprocess
    for attempt in range(3):
        try:
            shutil.copyfile(src, dst)
            return True
        except Exception:
            time.sleep(1)
            if sys.platform == "win32":
                res = subprocess.run(f'powershell -Command "Copy-Item -Path \'{src}\' -Destination \'{dst}\' -Force"', shell=True, capture_output=True)
            else:
                res = subprocess.run(f'cp -f "{src}" "{dst}"', shell=True, capture_output=True)
            if res.returncode == 0:
                return True
    return False

    # Reconcilia craques e sincroniza ambos os bancos
    print("\n[+] Reconciliando estatísticas canônicas de jogadores_resumo...")
    try:
        from scripts.unificar_e_reconstruir_craques import unificar_banco
    except ImportError:
        from unificar_e_reconstruir_craques import unificar_banco
    unificar_banco(DB_LOCAL)
    safe_copy_db(DB_LOCAL, DB_API)
    print(f"[OK] Sincronização entre {DB_LOCAL} e {DB_API} finalizada.")

if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser(description="Pipeline OGol Brasileirão Série A")
    parser.add_argument("--anos", nargs="+", type=int, default=[2012, 2013],
                        help="Anos alvo (ex: 2012 2013)")
    args = parser.parse_args()
    executar_pipeline_brasileirao(args.anos)
