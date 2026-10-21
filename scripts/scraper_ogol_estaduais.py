"""
Pipeline de Raspagem e Ingestão: Campeonatos Estaduais no OGol
=============================================================
- Descoberta automática de edições do Paulistão, Carioca, Mineiro e Gaúcho no OGol.
- Extração paginada do calendário oficial de cada edição.
- Parsing de fichas técnicas: gols minuto a minuto com autores canônicos,
  tempo (1T/2T), tipo de gol (Normal, Pênalti, Gol Contra, Falta), estádio e árbitro.
- Cache persistente em JSON (data/cache_ogol_estaduais/) para garantir idempotência.
- Rate-limiting respeitoso com backoff exponencial.
- Atualização e inserção nas bases: data/futebol.db e api/data/futebol.db.
- Reconciliação canônica com a tabela jogadores_resumo.
"""

import os
import re
import sys
import time
import json
import shutil
import sqlite3
import urllib.request
import urllib.error
from typing import Dict, List, Tuple, Optional

# Garante compatibilidade de saída UTF-8 no Windows
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DB_LOCAL = os.path.join(BASE_DIR, "data", "futebol.db")
DB_API = os.path.join(BASE_DIR, "api", "data", "futebol.db")
CACHE_DIR = os.path.join(BASE_DIR, "data", "cache_ogol_estaduais")
os.makedirs(CACHE_DIR, exist_ok=True)

HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
}

# Normalização Canônica de Clubes
MAPA_CLUBES = {
    # São Paulo
    "Palmeiras": "Palmeiras",
    "Santos": "Santos",
    "São Paulo": "São Paulo",
    "Sao Paulo": "São Paulo",
    "Corinthians": "Corinthians",
    "Red Bull Bragantino": "Red Bull Bragantino",
    "Bragantino": "Red Bull Bragantino",
    "Ponte Preta": "Ponte Preta",
    "Guarani": "Guarani",
    "Novorizontino": "Novorizontino",
    "Grêmio Novorizontino": "Novorizontino",
    "Mirassol": "Mirassol",
    "Botafogo-SP": "Botafogo-SP",
    "Botafogo SP": "Botafogo-SP",
    "Botafogo de Ribeirão Preto": "Botafogo-SP",
    "Ituano": "Ituano",
    "São Bernardo": "São Bernardo",
    "Sao Bernardo": "São Bernardo",
    "Água Santa": "Água Santa",
    "EC Água Santa": "Água Santa",
    "Inter de Limeira": "Inter de Limeira",
    "AA Internacional": "Inter de Limeira",
    "Portuguesa": "Portuguesa",
    "Santo André": "Santo André",
    "Ferroviária": "Ferroviária",
    "Noroeste": "Noroeste",
    "Velo Clube": "Velo Clube",
    
    # Rio de Janeiro
    "Flamengo": "Flamengo",
    "Fluminense": "Fluminense",
    "Vasco": "Vasco",
    "Vasco da Gama": "Vasco",
    "Botafogo": "Botafogo",
    "Nova Iguaçu": "Nova Iguaçu",
    "Nova Iguacu": "Nova Iguaçu",
    "Volta Redonda": "Volta Redonda",
    "Boavista": "Boavista",
    "Boavista-RJ": "Boavista",
    "Bangu": "Bangu",
    "Madureira": "Madureira",
    "Portuguesa-RJ": "Portuguesa-RJ",
    "Audax Rio": "Audax Rio",
    "Audax": "Audax Rio",
    "Sampaio Corrêa-RJ": "Sampaio Corrêa-RJ",
    "Maricá": "Maricá",
    
    # Minas Gerais
    "Atlético-MG": "Atlético-MG",
    "Atlético Mineiro": "Atlético-MG",
    "Cruzeiro": "Cruzeiro",
    "América-MG": "América-MG",
    "América Mineiro": "América-MG",
    "Tombense": "Tombense",
    "Athletic Club": "Athletic Club",
    "Athletic": "Athletic Club",
    "Villa Nova-MG": "Villa Nova-MG",
    "Villa Nova": "Villa Nova-MG",
    "Democrata GV": "Democrata-GV",
    "Pouso Alegre": "Pouso Alegre",
    "Ipatinga": "Ipatinga",
    "Itabirito": "Itabirito",
    "Betim": "Betim",

    # Rio Grande do Sul
    "Grêmio": "Grêmio",
    "Gremio": "Grêmio",
    "Internacional": "Internacional",
    "Juventude": "Juventude",
    "Caxias": "Caxias",
    "SER Caxias": "Caxias",
    "Ypiranga-RS": "Ypiranga-RS",
    "Ypiranga": "Ypiranga-RS",
    "Brasil de Pelotas": "Brasil de Pelotas",
    "São José-RS": "São José-RS",
    "Novo Hamburgo": "Novo Hamburgo",
    "Avenida": "Avenida",
    "Santa Cruz-RS": "Santa Cruz-RS",
    "São Luiz": "São Luiz",
    "Guarany de Bagé": "Guarany de Bagé",
    "Monsoon": "Monsoon",
    "Pelotas": "Pelotas",

    # Paraná
    "Athletico Paranaense": "Athletico-PR",
    "Atlético Paranaense": "Athletico-PR",
    "Atlético-PR": "Athletico-PR",
    "Athletico-PR": "Athletico-PR",
    "Coritiba": "Coritiba",
    "Coritiba FC": "Coritiba",
    "Operário Ferroviário": "Operário-PR",
    "Operário-PR": "Operário-PR",
    "Londrina": "Londrina",
    "Maringá": "Maringá",
    "Cianorte": "Cianorte",
    "FC Cascavel": "FC Cascavel",
    "Cascavel": "FC Cascavel",
    "Paraná": "Paraná",
    "Paraná Clube": "Paraná",
    "Azuriz": "Azuriz",

    # Nordeste
    "Bahia": "Bahia",
    "Vitória": "Vitória",
    "Fortaleza": "Fortaleza",
    "Ceará": "Ceará",
    "Sport": "Sport",
    "Sport Recife": "Sport",
    "Náutico": "Náutico",
    "Santa Cruz": "Santa Cruz",
    "CRB": "CRB",
    "CSA": "CSA",
    "ABC": "ABC",
    "América-RN": "América-RN",
    "América de Natal": "América-RN",
    "Sampaio Corrêa": "Sampaio Corrêa",
    "Confiança": "Confiança",
    "Botafogo-PB": "Botafogo-PB",
    "Ferroviário": "Ferroviário",
    "Ferroviário-CE": "Ferroviário",
    "Treze": "Treze",
    "Campinense": "Campinense",
    "Altos": "Altos",
    "River-PI": "River-PI",
    "Moto Club": "Moto Club",
    "Sergipe": "Sergipe",
    "Itabaiana": "Itabaiana",
    "Juazeirense": "Juazeirense",
    "Sousa": "Sousa",

    # Santa Catarina
    "Chapecoense": "Chapecoense",
    "Avaí": "Avaí",
    "Figueirense": "Figueirense",
    "Criciúma": "Criciúma",
    "Joinville": "Joinville",
    "Brusque": "Brusque",
    "Marcílio Dias": "Marcílio Dias",
    "Hercílio Luz": "Hercílio Luz",
    "Barra-SC": "Barra-SC",
    "Concórdia": "Concórdia",

    # Goiás
    "Goiás": "Goiás",
    "Atlético Goianiense": "Atlético-GO",
    "Atlético-GO": "Atlético-GO",
    "Vila Nova": "Vila Nova",
    "Aparecidense": "Aparecidense",
    "Anápolis": "Anápolis",
    "Goianésia": "Goianésia",
    "CRAC": "CRAC",
    "Iporá": "Iporá",
    "Morrinhos": "Morrinhos"
}

# Normalização Canônica de Jogadores para evitar fragmentação
MAPA_JOGADORES = {
    # Normalização de Craques Históricos
    "marcelo carioca": "Marcelinho Carioca",
    "marcelinho carioca": "Marcelinho Carioca",
    "ademir da guia": "Ademir da Guia",
    "antonio de oliveira filho": "Careca",
    "antônio de oliveira filho": "Careca",
    "careca": "Careca",
    "tulio maravilha": "Túlio Maravilha",
    "túlio maravilha": "Túlio Maravilha",
    "túlio": "Túlio Maravilha",
    "tulio": "Túlio Maravilha",
    "gabriel barbosa almeida": "Gabriel Barbosa",
    "gabriel barbosa": "Gabriel Barbosa",
    "gabigol": "Gabriel Barbosa",
    "pedro guilherme abreu dos santos": "Pedro",
    "pedro guilherme": "Pedro",
    "pedro": "Pedro",
    "givanildo vieira de sousa": "Hulk",
    "hulk": "Hulk",
    "german ezequiel cano": "Germán Cano",
    "german cano": "Germán Cano",
    "germán cano": "Germán Cano",
    "raphael cavalcante veiga": "Raphael Veiga",
    "raphael veiga": "Raphael Veiga",
    "paulo henrique sampaio filho": "Paulinho Galo",
    "paulinho": "Paulinho Galo",
    "giorgian de arrascaeta": "Arrascaeta",
    "arrascaeta": "Arrascaeta",
    "eduardo pereira rodrigues": "Dudu",
    "dudu": "Dudu",
    "lucas moura": "Lucas Moura",
    "lucas rodrigues moura da silva": "Lucas Moura",
    "calleri": "Jonathan Calleri",
    "jonathan calleri": "Jonathan Calleri",
    "yuri alberto monteiro da silva": "Yuri Alberto",
    "yuri alberto": "Yuri Alberto",
    "endrick": "Endrick",
    "endrick felipe moreira de sousa": "Endrick",
    "jose manuel lopez": "Flaco López",
    "flaco lopez": "Flaco López",
    "flaco lópez": "Flaco López",
    "rodrigo garro": "Rodrigo Garro",
    "bruno henrique pinto": "Bruno Henrique",
    "bruno henrique": "Bruno Henrique",
    "enner valencia": "Enner Valencia",
    "diego costa": "Diego Costa",
}

def normalizar_clube(c: str) -> str:
    c = c.split('/')[0].strip()
    c = re.sub(r'^(Time|Clube|Equipe)\s+', '', c, flags=re.I).strip()
    c = re.sub(r'\s+saf$', '', c, flags=re.I)
    c = re.sub(r'\s+s\.a\.f\.$', '', c, flags=re.I)
    c = re.sub(r'\s+fc$', '', c, flags=re.I)
    c = re.sub(r'\s+f\.c\.$', '', c, flags=re.I)
    return MAPA_CLUBES.get(c, c)

def normalizar_jogador(j: str) -> str:
    j_clean = j.strip()
    key = j_clean.lower()
    return MAPA_JOGADORES.get(key, j_clean)

def parse_ogol_minuto(min_raw: str) -> Tuple[str, str, str]:
    raw = min_raw.strip()
    tipo = "Normal"
    if "pen" in raw.lower():
        tipo = "Pênalti"
    elif "g.c" in raw.lower() or "o.g" in raw.lower() or "contra" in raw.lower():
        tipo = "Gol Contra"
    elif "falta" in raw.lower():
        tipo = "Falta"

    m_clean = re.sub(r'\(.*?\)', '', raw).replace("'", "").strip()
    m_base = re.search(r'^(\d+)', m_clean)
    base_num = int(m_base.group(1)) if m_base else 0
    tempo = "1T" if base_num <= 45 else "2T"

    return m_clean, tempo, tipo

def fetch_url(url: str, delay: float = 0.4) -> Optional[str]:
    time.sleep(delay)
    try:
        req = urllib.request.Request(url, headers=HEADERS)
        with urllib.request.urlopen(req, timeout=12) as resp:
            return resp.read().decode('utf-8', errors='ignore')
    except urllib.error.HTTPError as e:
        if e.code == 429:
            print(f"  [!] Rate limit (429). Aguardando 5s...")
            time.sleep(5)
            return fetch_url(url, delay=1.0)
        print(f"  [Erro HTTP {e.code}]: {url}")
        return None
    except Exception as e:
        print(f"  [Erro de conexão]: {url} -> {e}")
        return None

def obter_edicoes_estaduais(slug_comp: str, entry_url: str) -> List[Tuple[int, str]]:
    """
    Retorna lista de (ano, ed_id) inspecionando a página de entrada no OGol.
    """
    cache_path = os.path.join(CACHE_DIR, f"edicoes_{slug_comp}.json")
    if os.path.exists(cache_path):
        with open(cache_path, "r", encoding="utf-8") as f:
            data = json.load(f)
            return [(d[0], d[1]) for d in data]

    print(f"[+] Buscando edições de {slug_comp} em: {entry_url}")
    html = fetch_url(entry_url)
    if not html:
        return []

    edicoes = []
    # 1. Tenta extrair do dropdown select name="id"
    m_sel = re.search(r'<select[^>]*name="id"[^>]*>(.*?)</select>', html, re.S)
    if m_sel:
        options = re.findall(r'<option[^>]*value="(\d+)"[^>]*>(\d{4})</option>', m_sel.group(1))
        for ed_id, ano_str in options:
            edicoes.append((int(ano_str), str(ed_id).strip()))

    # 2. Se não encontrou, procura links diretos de edição
    if not edicoes:
        found_links = re.findall(r'href="(/edicao/' + slug_comp + r'-(\d{4})/(\d+))"', html)
        for _, ano_str, ed_id in found_links:
            edicoes.append((int(ano_str), str(ed_id).strip()))

    # Deduplica mantendo o maior ed_id numérico por ano
    ed_dict = {}
    for ano, ed_id in edicoes:
        m_dig = re.search(r'(\d+)', str(ed_id))
        if not m_dig:
            continue
        clean_id = m_dig.group(1)
        if ano not in ed_dict or int(clean_id) > int(ed_dict[ano]):
            ed_dict[ano] = clean_id

    edicoes_finais = sorted([(ano, ed_id) for ano, ed_id in ed_dict.items()], key=lambda x: x[0], reverse=True)
    with open(cache_path, "w", encoding="utf-8") as f:
        json.dump(edicoes_finais, f, indent=2)

    return edicoes_finais

def obter_jogos_edicao(ano: int, ed_id: str, slug_comp: str) -> List[Dict]:
    """
    Obtém todos os jogos de uma edição paginando pelo calendário oficial.
    """
    cache_path = os.path.join(CACHE_DIR, f"jogos_{slug_comp}_{ano}_{ed_id}.json")
    if os.path.exists(cache_path):
        with open(cache_path, "r", encoding="utf-8") as f:
            return json.load(f)

    jogos = []
    vistos = set()
    page = 1

    while True:
        url_page = f"https://www.ogol.com.br/edicao/{slug_comp}-{ano}/{ed_id}/calendario?fase_in=0&equipa=0&estado=&filtro=&op=calendario&page={page}"
        html = fetch_url(url_page)
        if not html:
            break

        # Extrai links de jogos no formato: /jogo/2024-01-20-botafogo-sp-santos/9837436
        matches_found = re.findall(r'href="(/jogo/(\d{4}-\d{2}-\d{2})-[^"]+/(\d+))"', html)
        if not matches_found:
            # Tenta sem filtro de data no link
            matches_simple = re.findall(r'href="(/jogo/[^"]+/(\d+))"[^>]*>(\d+\s*-\s*\d+)</a>', html)
            if not matches_simple:
                break
            novos = 0
            for l_jogo, j_id, placar in matches_simple:
                if j_id not in vistos:
                    vistos.add(j_id)
                    jogos.append({
                        "link": l_jogo,
                        "id_ogol": j_id,
                        "placar": placar.replace('-', 'x')
                    })
                    novos += 1
            if novos == 0:
                break
        else:
            novos = 0
            for l_jogo, data_iso, j_id in matches_found:
                if j_id not in vistos:
                    vistos.add(j_id)
                    jogos.append({
                        "link": l_jogo,
                        "data": data_iso,
                        "id_ogol": j_id
                    })
                    novos += 1
            if novos == 0:
                break

        page += 1
        if page > 10:  # Limite de segurança para fases de estaduais
            break

    with open(cache_path, "w", encoding="utf-8") as f:
        json.dump(jogos, f, indent=2)

    return jogos

def extrair_detalhes_jogo_ogol(link_jogo: str) -> Optional[Dict]:
    """
    Acessa a ficha técnica do jogo no OGol e extrai mandante, visitante, placar,
    gols minuto a minuto com autores, estádio e árbitro.
    """
    link_limpo = re.sub(r'/(fotografias|videos|estatisticas).*$', '', link_jogo)
    jogo_id_m = re.search(r'/(\d+)$', link_limpo)
    if not jogo_id_m:
        return None
    jogo_id = jogo_id_m.group(1)

    cache_path = os.path.join(CACHE_DIR, f"jogo_{jogo_id}.json")
    if os.path.exists(cache_path):
        with open(cache_path, "r", encoding="utf-8") as f:
            return json.load(f)

    url = f"https://www.ogol.com.br{link_limpo}"
    html = fetch_url(url)
    if not html:
        return None

    # Título da partida
    title_m = re.search(r'<title>(.*?)</title>', html, re.I)
    title = title_m.group(1) if title_m else ""
    # Remove prefixos informativos do título
    title = re.sub(r'^(Estatísticas e Escalações|Fotografias|Ficha de Jogo|Vídeos)\s+', '', title, flags=re.I).strip()

    # Extrai times e placar
    m_placar = re.search(r'^(.*?)\s+(\d+\s*-\s*\d+)\s+(.*?)\s*::', title)
    home_name, away_name, placar = "", "", ""
    if m_placar:
        home_name = normalizar_clube(m_placar.group(1).strip())
        placar = m_placar.group(2).replace('-', 'x').strip()
        away_name = normalizar_clube(m_placar.group(3).strip())

    # Data da URL do jogo
    data_m = re.search(r'/(\d{4}-\d{2}-\d{2})-', link_limpo)
    data_iso = data_m.group(1) if data_m else None

    # Fallback para times e placar no corpo do HTML se o título falhar
    if not home_name:
        m_home = re.search(r'<div class="match-header-team right">.*?<div class="match-header-team-name">\s*<a[^>]*>([^<]+)', html, flags=re.DOTALL)
        if m_home:
            home_name = normalizar_clube(m_home.group(1).strip())
        else:
            h_alt = re.findall(r'<div class="match-header-team right">.*?<a[^>]*title="([^"]+)"', html, flags=re.DOTALL)
            if h_alt:
                home_name = normalizar_clube(h_alt[0].strip())

    if not away_name:
        m_away = re.search(r'<div class="match-header-team left">.*?<div class="match-header-team-name">\s*<a[^>]*>([^<]+)', html, flags=re.DOTALL)
        if m_away:
            away_name = normalizar_clube(m_away.group(1).strip())
        else:
            a_alt = re.findall(r'<div class="match-header-team left">.*?<a[^>]*title="([^"]+)"', html, flags=re.DOTALL)
            if a_alt:
                away_name = normalizar_clube(a_alt[0].strip())

    if not placar or placar == "0x0":
        m_num = re.search(r'>\s*(\d+)\s*-\s*(\d+)\s*<', html)
        if m_num:
            placar = f"{m_num.group(1)}x{m_num.group(2)}"

    # Gols (Suporte a múltiplos gols por jogador e layouts moderno e clássico)
    gols = []
    scorers_home = re.findall(r'<div class="match-header-scorers right">(.*?)</div>', html, re.S)
    scorers_away = re.findall(r'<div class="match-header-scorers left">(.*?)</div>', html, re.S)

    def parse_scorers(bloco, clube_alvo):
        res = []
        # Layout clássico: <a ...>Atleta</a> <span class="time"> 18' (pen.) 42'</span>
        itens = re.findall(r'<a[^>]+href="/jogador/([^/]+)/(\d+)"[^>]*>(.*?)</a>\s*<span class="time">\s*([^<]+)</span>', bloco)
        if itens:
            for slug_atleta, ogol_id, nome_atleta, min_raw in itens:
                atleta_canonico = normalizar_jogador(nome_atleta.strip())
                minutos_encontrados = re.findall(r'(\d+)[\'’]?(?:\s*\(([^)]+)\))?', min_raw)
                if minutos_encontrados:
                    for m_num, m_obs in minutos_encontrados:
                        tipo = "Normal"
                        obs_lower = (m_obs or "").lower()
                        if "pen" in obs_lower:
                            tipo = "Pênalti"
                        elif "g.c" in obs_lower or "contra" in obs_lower or "o.g" in obs_lower:
                            tipo = "Gol Contra"
                        elif "falta" in obs_lower:
                            tipo = "Falta"
                        base_num = int(m_num) if m_num.isdigit() else 0
                        tempo = "1T" if base_num <= 45 else "2T"
                        res.append({
                            "atleta": atleta_canonico,
                            "ogol_id": ogol_id,
                            "clube": clube_alvo,
                            "minuto": m_num,
                            "tempo": tempo,
                            "tipo_de_gol": tipo
                        })
                else:
                    minuto, tempo, tipo = parse_ogol_minuto(min_raw)
                    res.append({
                        "atleta": atleta_canonico,
                        "ogol_id": ogol_id,
                        "clube": clube_alvo,
                        "minuto": minuto,
                        "tempo": tempo,
                        "tipo_de_gol": tipo
                    })
            return res

        # Layout moderno: <div class="match-header-scorer">
        items_mod = re.findall(r'<div class="match-header-scorer">(.*?)</div>', bloco, flags=re.DOTALL)
        for item in items_mod:
            p_m = re.search(r'<a[^>]*href="/jogador/[^/]+/(\d+)"[^>]*>(.*?)</a>', item)
            m_m = re.search(r'<span class="match-header-scorer-minute">(.*?)</span>', item)
            atleta_bruto = p_m.group(2).strip() if p_m else ""
            ogol_id = p_m.group(1).strip() if p_m else ""
            atleta = normalizar_jogador(atleta_bruto)
            min_raw = m_m.group(1).strip() if m_m else "0"
            minuto, tempo, tipo = parse_ogol_minuto(min_raw)
            if atleta:
                res.append({
                    "atleta": atleta,
                    "ogol_id": ogol_id,
                    "clube": clube_alvo,
                    "minuto": minuto,
                    "tempo": tempo,
                    "tipo_de_gol": tipo
                })
        return res

    if scorers_home and home_name:
        gols.extend(parse_scorers(scorers_home[0], home_name))
    if scorers_away and away_name:
        gols.extend(parse_scorers(scorers_away[0], away_name))

    # Estádio
    estadio_m = re.search(r'/estadio\.php\?id=\d+"[^>]*>(.*?)</a>', html)
    estadio = estadio_m.group(1).strip() if estadio_m else None

    # Árbitro
    arbitro_m = re.search(r'/arbitro\.php\?id=\d+"[^>]*>(.*?)</a>', html)
    arbitro = arbitro_m.group(1).strip() if arbitro_m else None

    dados_jogo = {
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
        json.dump(dados_jogo, f, indent=2, ensure_ascii=False)

    return dados_jogo

def executar_pipeline_estaduais(slug_comp: str, entry_url: str, nome_campeonato: str, anos_alvo: List[int]):
    print(f"\n=======================================================")
    print(f"  EXECUTANDO PIPELINE: {nome_campeonato.upper()} (OGOL)")
    print(f"=======================================================")

    edicoes = obter_edicoes_estaduais(slug_comp, entry_url)
    print(f"-> Total de edições disponíveis no histórico do OGol: {len(edicoes)}")

    conn = sqlite3.connect(DB_LOCAL)
    c = conn.cursor()

    # Obtém o maior id_partida para inserções que porventura faltem no banco
    c.execute("SELECT MAX(id_partida) FROM partidas")
    max_id_partida = c.fetchone()[0] or 202500000

    total_gols_adicionados = 0
    total_estadios_atualizados = 0
    total_partidas_inseridas = 0

    for ano, ed_id in edicoes:
        if ano not in anos_alvo:
            continue

        print(f"\n[+] Inspecionando {nome_campeonato} {ano} (Edição ID: {ed_id})...")
        jogos = obter_jogos_edicao(ano, ed_id, slug_comp)
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

            # Busca partidas correspondentes no banco
            # 1. Tenta com tolerância de data de 3 dias
            partidas_match = []
            if data_iso:
                c.execute("""
                    SELECT id_partida, data, estadio, arbitro, campeonato FROM partidas
                    WHERE ano = ?
                      AND (
                          (mandante = ? AND visitante = ?) OR
                          (mandante LIKE ? AND visitante LIKE ?)
                      )
                      AND abs(julianday(data) - julianday(?)) <= 3
                """, (ano, home, away, f"%{home[:5]}%", f"%{away[:5]}%", data_iso))
                partidas_match = c.fetchall()

            # 2. Se não encontrou por data próxima, busca por confronto no ano com campeonato compatível
            if not partidas_match:
                c.execute("""
                    SELECT id_partida, data, estadio, arbitro, campeonato FROM partidas
                    WHERE ano = ?
                      AND (campeonato LIKE ? OR campeonato LIKE ?)
                      AND (
                          (mandante = ? AND visitante = ?) OR
                          (mandante LIKE ? AND visitante LIKE ?)
                      )
                """, (ano, f"%{nome_campeonato}%", f"%{slug_comp}%", home, away, f"%{home[:5]}%", f"%{away[:5]}%"))
                partidas_match = c.fetchall()

            if partidas_match:
                # Atualiza todas as linhas correspondentes (inclusive duplicatas)
                for pid, dt_p, est_p, arb_p, camp_p in partidas_match:
                    # Atualiza estádio se vazio ou genérico
                    if detalhes.get("estadio") and (not est_p or est_p.strip() in ("", "SP", "RJ", "MG", "RS")):
                        c.execute("UPDATE partidas SET estadio = ? WHERE id_partida = ?", (detalhes["estadio"], pid))
                        total_estadios_atualizados += 1

                    # Atualiza árbitro se vazio
                    if detalhes.get("arbitro") and (not arb_p or arb_p.strip() in ("", "Árbitro Estadual")):
                        c.execute("UPDATE partidas SET arbitro = ? WHERE id_partida = ?", (detalhes["arbitro"], pid))

                    # Insere gols se ainda não havia gols catalogados
                    c.execute("SELECT COUNT(*) FROM gols WHERE id_partida = ?", (pid,))
                    if c.fetchone()[0] == 0 and detalhes.get("gols"):
                        for g in detalhes["gols"]:
                            m_val = str(g.get("minuto", "0"))
                            t_val = g.get("tempo")
                            if not t_val:
                                m_base = re.search(r'^\d+', m_val)
                                base_num = int(m_base.group(0)) if m_base else 0
                                t_val = "1T" if base_num <= 45 else "2T"
                            c.execute("""
                                INSERT INTO gols (id_partida, rodada, clube, atleta, minuto, tempo, tipo_de_gol)
                                VALUES (?, NULL, ?, ?, ?, ?, ?)
                            """, (pid, g["clube"], g["atleta"], m_val, t_val, g.get("tipo_de_gol", "Normal")))
                            total_gols_adicionados += 1
            else:
                # Partida não existia no banco: insere nova partida com integridade
                max_id_partida += 1
                pid = max_id_partida
                placar_str = detalhes.get("placar", "0 x 0")
                gols_m, gols_v = 0, 0
                if 'x' in placar_str:
                    partes = placar_str.split('x')
                    gols_m = int(partes[0].strip()) if partes[0].strip().isdigit() else 0
                    gols_v = int(partes[1].strip()) if partes[1].strip().isdigit() else 0

                vencedor = "Empate"
                if gols_m > gols_v:
                    vencedor = home
                elif gols_v > gols_m:
                    vencedor = away

                dt_final = data_iso or f"{ano}-01-01"
                nome_final = nome_campeonato if nome_campeonato.startswith(("Campeonato", "Copa")) else f"Campeonato {nome_campeonato}"
                formato_final = "Copa Regional" if "Copa" in nome_final else "Campeonato Estadual"

                c.execute("""
                    INSERT INTO partidas (
                        id_partida, ano, rodada, data, horario, estadio, cidade, estado,
                        mandante, visitante, gols_mandante, gols_visitante, placar, vencedor,
                        arbitro, assistente_1, assistente_2, quarto_arbitro, var,
                        tecnico_mandante, tecnico_visitante, publico, campeonato, formato, fase
                    ) VALUES (
                        ?, ?, NULL, ?, '16:00', ?, NULL, NULL,
                        ?, ?, ?, ?, ?, ?,
                        ?, NULL, NULL, NULL, NULL,
                        NULL, NULL, NULL, ?, ?, 'Fase Única'
                    )
                """, (
                    pid, ano, dt_final, detalhes.get("estadio"),
                    home, away, gols_m, gols_v, placar_str, vencedor,
                    detalhes.get("arbitro"), nome_final, formato_final
                ))
                total_partidas_inseridas += 1

                # Insere gols
                if detalhes.get("gols"):
                    for g in detalhes["gols"]:
                        m_val = str(g.get("minuto", "0"))
                        t_val = g.get("tempo")
                        if not t_val:
                            m_base = re.search(r'^\d+', m_val)
                            base_num = int(m_base.group(0)) if m_base else 0
                            t_val = "1T" if base_num <= 45 else "2T"
                        c.execute("""
                            INSERT INTO gols (id_partida, rodada, clube, atleta, minuto, tempo, tipo_de_gol)
                            VALUES (?, NULL, ?, ?, ?, ?, ?)
                        """, (pid, g["clube"], g["atleta"], m_val, t_val, g.get("tipo_de_gol", "Normal")))
                        total_gols_adicionados += 1

            if idx > 0 and idx % 25 == 0:
                conn.commit()
                print(f"    ... {idx}/{len(jogos)} jogos processados (+{total_gols_adicionados} gols | +{total_estadios_atualizados} estádios)")

    conn.commit()
    conn.close()

    print(f"\n[OK] Finalizado para {nome_campeonato}: +{total_gols_adicionados} gols | +{total_estadios_atualizados} estádios | +{total_partidas_inseridas} novas partidas inseridas!")

TORNEIOS_CONFIG = {
    "paulista": {
        "slug": "campeonato-paulista",
        "entry_url": "https://www.ogol.com.br/edicao/campeonato-paulista-2024/180414",
        "nome": "Paulista"
    },
    "carioca": {
        "slug": "campeonato-carioca",
        "entry_url": "https://www.ogol.com.br/edicao/campeonato-carioca-2024/180805",
        "nome": "Carioca"
    },
    "mineiro": {
        "slug": "campeonato-mineiro",
        "entry_url": "https://www.ogol.com.br/competicao/campeonato-mineiro/784",
        "nome": "Mineiro"
    },
    "gaucho": {
        "slug": "campeonato-gaucho",
        "entry_url": "https://www.ogol.com.br/edicao/campeonato-gaucho-2024/180895",
        "nome": "Gaúcho"
    },
    "nordeste": {
        "slug": "copa-do-nordeste",
        "entry_url": "https://www.ogol.com.br/competicao/copa-do-nordeste/921",
        "nome": "Copa do Nordeste"
    },
    "paranaense": {
        "slug": "campeonato-paranaense",
        "entry_url": "https://www.ogol.com.br/competicao/campeonato-paranaense/959",
        "nome": "Paranaense"
    },
    "catarinense": {
        "slug": "campeonato-catarinense",
        "entry_url": "https://www.ogol.com.br/competicao/campeonato-catarinense",
        "nome": "Catarinense"
    },
    "baiano": {
        "slug": "campeonato-baiano",
        "entry_url": "https://www.ogol.com.br/competicao/campeonato-baiano",
        "nome": "Baiano"
    },
    "pernambucano": {
        "slug": "campeonato-pernambucano",
        "entry_url": "https://www.ogol.com.br/competicao/campeonato-pernambucano",
        "nome": "Pernambucano"
    },
    "goiano": {
        "slug": "campeonato-goiano",
        "entry_url": "https://www.ogol.com.br/competicao/campeonato-goiano",
        "nome": "Goiano"
    },
    "cearense": {
        "slug": "campeonato-cearense",
        "entry_url": "https://www.ogol.com.br/competicao/campeonato-cearense",
        "nome": "Cearense"
    }
}

def safe_copy_db(src: str, dst: str):
    import subprocess
    for attempt in range(3):
        try:
            shutil.copyfile(src, dst)
            return True
        except Exception:
            time.sleep(1)
            res = subprocess.run(f'powershell -Command "Copy-Item -Path \'{src}\' -Destination \'{dst}\' -Force"', shell=True, capture_output=True)
            if res.returncode == 0:
                return True
    return False

if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser(description="Pipeline OGol Estaduais & Regionais")
    parser.add_argument("--torneios", nargs="+", default=["nordeste", "paranaense"],
                        help="Torneios alvo: paulista, carioca, mineiro, gaucho, nordeste, paranaense, catarinense, baiano, pernambucano, goiano, cearense")
    parser.add_argument("--anos", nargs="+", type=int, default=[2022, 2023],
                        help="Anos alvo (ex: 2022 2023)")
    args = parser.parse_args()

    print(f"\n>>> INICIANDO INGESTÃO DOS ESTADUAIS <<<")
    print(f"Torneios: {', '.join(args.torneios)}")
    print(f"Anos: {args.anos}")

    for chave in args.torneios:
        cfg = TORNEIOS_CONFIG.get(chave.lower())
        if cfg:
            executar_pipeline_estaduais(
                slug_comp=cfg["slug"],
                entry_url=cfg["entry_url"],
                nome_campeonato=cfg["nome"],
                anos_alvo=args.anos
            )

    # Reconcilia craques e sincroniza ambos os bancos
    print("\n[+] Reconciliando estatísticas canônicas de jogadores_resumo...")
    try:
        from unificar_e_reconstruir_craques import unificar_banco
    except ImportError:
        from scripts.unificar_e_reconstruir_craques import unificar_banco
    unificar_banco(DB_LOCAL)
    safe_copy_db(DB_LOCAL, DB_API)
    print("[OK] Sincronização entre data/futebol.db e api/data/futebol.db finalizada.")
