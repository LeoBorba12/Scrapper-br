"""
Minerador Oficial da Era Pré-1971 do Futebol Brasileiro (1959 a 1970)
Competições Unificadas pela CBF:
1. Taça Brasil (1959 - 1968): 10 edições eliminatórias de âmbito nacional
2. Torneio Roberto Gomes Pedrosa / Robertão / Taça de Prata (1967 - 1970): 4 edições inter-regionais

Fontes:
- RSSSF Oficial (Rec.Sport.Soccer Statistics Foundation): tabela completa da Taça Brasil
- Bola n@ Área: tabela completa jogo a jogo do Robertão (1967-1970)
- Wikipédia (API Action): fichas técnicas detalhadas com árbitros, bandeirinhas, estádios e gols com minutos
"""

import os
import re
import sys
import json
import time
import sqlite3
import urllib.request

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

BASE_DIR = os.path.dirname(__file__)
DB_PATH = os.path.join(BASE_DIR, "data", "futebol.db")

MESES_PT = {
    "janeiro": 1, "fevereiro": 2, "março": 3, "marco": 3,
    "abril": 4, "maio": 5, "junho": 6, "julho": 7,
    "agosto": 8, "setembro": 9, "outubro": 10, "novembro": 11, "dezembro": 12
}

MONTHS_EN = {
    "jan": 1, "feb": 2, "mar": 3, "apr": 4, "may": 5, "jun": 6,
    "jul": 7, "aug": 8, "sep": 9, "oct": 10, "nov": 11, "dec": 12
}

DICIONARIO_CLUBES = {
    "atlético-mg": "Atlético-MG", "atlético mineiro": "Atlético-MG", "clube atlético mineiro": "Atlético-MG", "atlético": "Atlético-MG",
    "atlético-pr": "Athletico-PR", "athletico-pr": "Athletico-PR", "atlético paranaense": "Athletico-PR", "club athletico paranaense": "Athletico-PR",
    "corinthians": "Corinthians", "sport club corinthians paulista": "Corinthians",
    "palmeiras": "Palmeiras", "sociedade esportiva palmeiras": "Palmeiras",
    "são paulo": "São Paulo", "sao paulo": "São Paulo", "são paulo futebol clube": "São Paulo", "são paulo fc": "São Paulo",
    "santos": "Santos", "santos futebol clube": "Santos", "santos fc": "Santos",
    "flamengo": "Flamengo", "clube de regatas do flamengo": "Flamengo",
    "fluminense": "Fluminense", "fluminense football club": "Fluminense", "fluminense fc": "Fluminense",
    "vasco": "Vasco", "vasco da gama": "Vasco", "clube de regatas vasco da gama": "Vasco",
    "botafogo": "Botafogo-RJ", "botafogo-rj": "Botafogo-RJ", "botafogo de futebol e regatas": "Botafogo-RJ", "botafogo fr": "Botafogo-RJ",
    "grêmio": "Grêmio", "gremio": "Grêmio", "grêmio fbpa": "Grêmio", "grêmio de football porto alegrense": "Grêmio",
    "internacional": "Internacional", "sport club internacional": "Internacional",
    "cruzeiro": "Cruzeiro", "cruzeiro esporte clube": "Cruzeiro",
    "bahia": "Bahia", "esporte clube bahia": "Bahia", "ec bahia": "Bahia",
    "vitória": "Vitória", "vitoria": "Vitória", "esporte clube vitória": "Vitória",
    "coritiba": "Coritiba", "coritiba foot ball club": "Coritiba",
    "sport": "Sport", "sport club do recife": "Sport", "sport recife": "Sport",
    "santa cruz": "Santa Cruz", "santa cruz futebol clube": "Santa Cruz",
    "náutico": "Náutico", "nautico": "Náutico", "clube náutico capibaribe": "Náutico",
    "portuguesa": "Portuguesa", "associação portuguesa de desportos": "Portuguesa", "portuguesa de desportos": "Portuguesa",
    "guarani": "Guarani", "guarani futebol clube": "Guarani",
    "ponte preta": "Ponte Preta", "associação atlética ponte preta": "Ponte Preta",
    "américa-mg": "América-MG", "america-mg": "América-MG",
    "américa-rj": "América-RJ", "america-rj": "América-RJ", "américa": "América-RJ", "america": "América-RJ", "america football club": "América-RJ",
    "ceará": "Ceará", "ceara": "Ceará", "ceará sporting club": "Ceará",
    "fortaleza": "Fortaleza", "fortaleza esporte clube": "Fortaleza",
    "bangu": "Bangu", "bangu atlético clube": "Bangu",
    "remo": "Remo", "clube do remo": "Remo",
    "paysandu": "Paysandu", "paysandu sport club": "Paysandu",
    "tuna luso": "Tuna Luso", "tuna luso brasileira": "Tuna Luso",
    "csa": "CSA", "centro sportivo alagoano": "CSA",
    "crb": "CRB", "clube de regatas brasil": "CRB",
    "abc": "ABC", "abc futebol clube": "ABC",
    "américa-rn": "América-RN", "america-rn": "América-RN",
    "ferroviário-pr": "Ferroviário-PR", "ferroviario-pr": "Ferroviário-PR", "ferroviário": "Ferroviário-PR",
    "ferroviário-ma": "Ferroviário-MA", "ferroviário esporte clube": "Ferroviário-MA",
    "campinense": "Campinense", "campinense clube": "Campinense",
    "treze": "Treze", "treze futebol clube": "Treze",
    "confiança": "Confiança", "associação desportiva confiança": "Confiança",
    "sergipe": "Sergipe", "club sportivo sergipe": "Sergipe",
    "sampaio corrêa": "Sampaio Corrêa", "sampaio correa": "Sampaio Corrêa",
    "moto club": "Moto Club",
    "river": "Ríver-PI", "ríver": "Ríver-PI", "river atlético clube": "Ríver-PI",
    "flamengo-pi": "Flamengo-PI", "esporte clube flamengo": "Flamengo-PI",
    "rio branco-es": "Rio Branco-ES", "rio branco atlético clube": "Rio Branco-ES",
    "desportiva": "Desportiva-ES", "desportiva ferroviária": "Desportiva-ES",
    "cruzeiro-rs": "Cruzeiro-RS", "esporte clube cruzeiro": "Cruzeiro-RS",
    "metropol": "Metropol", "esporte clube metropol": "Metropol",
    "comercial-ms": "Comercial-MS", "esporte clube comercial": "Comercial-MS",
    "rabello": "Rabello", "rabello futebol clube": "Rabello",
    "goytacaz": "Goytacaz", "goytacaz futebol clube": "Goytacaz",
    "fonseca": "Fonseca", "fonseca atlético clube": "Fonseca",
    "defelê": "Defelê", "defelê futebol clube": "Defelê",
    "anápolis": "Anápolis", "anapolis": "Anápolis", "anápolis futebol clube": "Anápolis",
    "vila nova": "Vila Nova", "vila nova futebol clube": "Vila Nova",
    "goiânia": "Goiânia", "goiania": "Goiânia", "goiânia esporte clube": "Goiânia",
    "operário": "Operário-PR", "operario": "Operário-PR",
    "londrina": "Londrina", "londrina de futebol e regatas": "Londrina",
    "grêmio maringá": "Grêmio Maringá", "gremio maringa": "Grêmio Maringá",
    "olímpico-sc": "Olímpico-SC", "olimpico-sc": "Olímpico-SC",
    "marcílio dias": "Marcílio Dias", "marcílio dias": "Marcílio Dias",
    "perdigão": "Perdigão",
    "capelense": "Capelense",
    "paula ramos": "Paula Ramos",
    "auto esporte": "Auto Esporte-PB", "auto esporte clube": "Auto Esporte-PB",
    "manufatora": "Manufatora-RJ", "manufatora atlético clube": "Manufatora-RJ",
    "hercílio luz": "Hercílio Luz", "hercilio luz": "Hercílio Luz",
}

ESTADIOS_PADRAO = {
    "Santos": ("Vila Belmiro", "Santos", "SP"),
    "Palmeiras": ("Pacaembu", "São Paulo", "SP"),
    "Corinthians": ("Pacaembu", "São Paulo", "SP"),
    "São Paulo": ("Morumbi", "São Paulo", "SP"),
    "Portuguesa": ("Canindé", "São Paulo", "SP"),
    "Ponte Preta": ("Moisés Lucarelli", "Campinas", "SP"),
    "Guarani": ("Brinco de Ouro", "Campinas", "SP"),
    "Flamengo": ("Maracanã", "Rio de Janeiro", "GB"),
    "Fluminense": ("Maracanã", "Rio de Janeiro", "GB"),
    "Vasco": ("São Januário", "Rio de Janeiro", "GB"),
    "Botafogo-RJ": ("Maracanã", "Rio de Janeiro", "GB"),
    "Bangu": ("Moça Bonita", "Rio de Janeiro", "GB"),
    "América-RJ": ("Maracanã", "Rio de Janeiro", "GB"),
    "Cruzeiro": ("Mineirão", "Belo Horizonte", "MG"),
    "Atlético-MG": ("Mineirão", "Belo Horizonte", "MG"),
    "América-MG": ("Independência", "Belo Horizonte", "MG"),
    "Grêmio": ("Olímpico", "Porto Alegre", "RS"),
    "Internacional": ("Beira-Rio", "Porto Alegre", "RS"),
    "Athletico-PR": ("Durival de Britto", "Curitiba", "PR"),
    "Coritiba": ("Belfort Duarte", "Curitiba", "PR"),
    "Ferroviário-PR": ("Durival de Britto", "Curitiba", "PR"),
    "Bahia": ("Fonte Nova", "Salvador", "BA"),
    "Vitória": ("Fonte Nova", "Salvador", "BA"),
    "Sport": ("Ilha do Retiro", "Recife", "PE"),
    "Náutico": ("Aflitos", "Recife", "PE"),
    "Santa Cruz": ("Arruda", "Recife", "PE"),
    "Ceará": ("Presidente Vargas", "Fortaleza", "CE"),
    "Fortaleza": ("Presidente Vargas", "Fortaleza", "CE"),
}

def normalizar_clube(raw):
    if not raw:
        return "Desconhecido"
    limpo = re.sub(r"\[\[(?:[^|\]]*\|)?([^\]]+)\]\]", r"\1", raw)
    limpo = re.sub(r"\{\{[^}]*\}\}", "", limpo)
    limpo = re.sub(r"<[^>]+>", " ", limpo)
    limpo = limpo.strip().replace("\ufffd", "").lower()
    return DICIONARIO_CLUBES.get(limpo, raw.strip())

def parse_tacabrasil_dates(date_str, ano_full):
    date_str = date_str.strip("[]").strip()
    m_single = re.match(r"([A-Za-z]{3})\s+(\d{1,2})$", date_str)
    if m_single:
        mon = MONTHS_EN.get(m_single.group(1).lower()[:3], 1)
        day = int(m_single.group(2))
        return [f"{ano_full}-{mon:02d}-{day:02d}"]
        
    m_double = re.match(r"([A-Za-z]{3})\s+(\d{1,2})\s+and\s+(\d{1,2})$", date_str)
    if m_double:
        mon = MONTHS_EN.get(m_double.group(1).lower()[:3], 1)
        d1 = int(m_double.group(2))
        d2 = int(m_double.group(3))
        return [f"{ano_full}-{mon:02d}-{d1:02d}", f"{ano_full}-{mon:02d}-{d2:02d}"]
        
    m_cross = re.match(r"([A-Za-z]{3})\s+(\d{1,2})\s+and\s+([A-Za-z]{3})\s+(\d{1,2})$", date_str)
    if m_cross:
        mon1 = MONTHS_EN.get(m_cross.group(1).lower()[:3], 1)
        d1 = int(m_cross.group(2))
        mon2 = MONTHS_EN.get(m_cross.group(3).lower()[:3], 1)
        d2 = int(m_cross.group(4))
        return [f"{ano_full}-{mon1:02d}-{d1:02d}", f"{ano_full}-{mon2:02d}-{d2:02d}"]
        
    return [f"{ano_full}-01-01"]

def minerar_tacabrasil_rsssf():
    """Extrai todas as partidas da Taça Brasil (1959-1968) via RSSSF."""
    print(">>> Extraindo Taça Brasil (1959-1968) do RSSSF...")
    todas_partidas = []
    
    for ano in range(59, 69):
        ano_full = 1900 + ano
        url = f"https://www.rsssf.org/tablesb/brazcup{ano:02d}.html"
        req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"})
        try:
            content = urllib.request.urlopen(req, timeout=10).read().decode("latin1", errors="ignore")
        except Exception as e:
            print(f"  ❌ Erro ao baixar Taça Brasil {ano_full}: {e}")
            continue

        lines = content.splitlines()
        current_dates = [f"{ano_full}-01-01"]
        current_fase = "Fase Preliminar"

        for l in lines:
            clean_l = l.strip()
            if not clean_l:
                continue

            # Detecta fase
            if any(f in clean_l.lower() for f in ["semifinal", "final", "quarter", "first phase", "second phase", "round"]):
                current_fase = clean_l

            # Detecta linha de data
            m_dt = re.match(r"^\[([A-Za-z]{3}\s+\d{1,2}(?:\s+and\s+(?:[A-Za-z]{3}\s+)?\d{1,2})?)\](?:\s*-\s*playoff)?", clean_l)
            if m_dt:
                current_dates = parse_tacabrasil_dates(m_dt.group(1), ano_full)
                continue

            # Jogo duplo (ida e volta): Team1 G1-G2 G3-G4 Team2
            m_double_game = re.match(r"^([A-Za-zÀ-ÿ\.\-\s]+?)\s{2,}(\d{1,2})\s*-\s*(\d{1,2})\s{2,}(\d{1,2})\s*-\s*(\d{1,2})\s{2,}([A-Za-zÀ-ÿ\.\-\s]+)$", clean_l)
            if m_double_game:
                t1 = normalizar_clube(m_double_game.group(1))
                g1_1 = int(m_double_game.group(2))
                g2_1 = int(m_double_game.group(3))
                g1_2 = int(m_double_game.group(4))
                g2_2 = int(m_double_game.group(5))
                t2 = normalizar_clube(m_double_game.group(6))

                d1 = current_dates[0] if len(current_dates) > 0 else f"{ano_full}-01-01"
                d2 = current_dates[1] if len(current_dates) > 1 else d1

                # Jogo 1 (Ida)
                todas_partidas.append({
                    "ano": ano_full, "data": d1, "fase": current_fase,
                    "mandante": t1, "visitante": t2,
                    "gols_mandante": g1_1, "gols_visitante": g2_1,
                    "placar": f"{g1_1}x{g2_1}",
                    "vencedor": t1 if g1_1 > g2_1 else (t2 if g2_1 > g1_1 else "Empate"),
                    "campeonato": "Taça Brasil", "formato": "Mata-Mata (Ida e Volta)"
                })
                # Jogo 2 (Volta - t2 mandante)
                todas_partidas.append({
                    "ano": ano_full, "data": d2, "fase": current_fase,
                    "mandante": t2, "visitante": t1,
                    "gols_mandante": g2_2, "gols_visitante": g1_2,
                    "placar": f"{g2_2}x{g1_2}",
                    "vencedor": t2 if g2_2 > g1_2 else (t1 if g1_2 > g2_2 else "Empate"),
                    "campeonato": "Taça Brasil", "formato": "Mata-Mata (Ida e Volta)"
                })
                continue

            # Jogo único ou playoff desempate: Team1 G1-G2 Team2
            m_single_game = re.match(r"^([A-Za-zÀ-ÿ\.\-\s]+?)\s{2,}(\d{1,2})\s*-\s*(\d{1,2})\s{2,}([A-Za-zÀ-ÿ\.\-\s]+)$", clean_l)
            if m_single_game:
                t1 = normalizar_clube(m_single_game.group(1))
                g1 = int(m_single_game.group(2))
                g2 = int(m_single_game.group(3))
                t2 = normalizar_clube(m_single_game.group(4))
                if not any(k in t1.lower() for k in ["table", "group", "phase", "zone", "participants"]):
                    d = current_dates[0] if current_dates else f"{ano_full}-01-01"
                    is_playoff = "playoff" in clean_l.lower()
                    fase_nome = current_fase + (" (Jogo Desempate)" if is_playoff else "")
                    todas_partidas.append({
                        "ano": ano_full, "data": d, "fase": fase_nome,
                        "mandante": t1, "visitante": t2,
                        "gols_mandante": g1, "gols_visitante": g2,
                        "placar": f"{g1}x{g2}",
                        "vencedor": t1 if g1 > g2 else (t2 if g2 > g1 else "Empate"),
                        "campeonato": "Taça Brasil", "formato": "Mata-Mata (Desempate / Jogo Único)"
                    })

    print(f"  -> {len(todas_partidas)} partidas da Taça Brasil extraídas com sucesso.")
    return todas_partidas

def minerar_robertao_bolanaarea():
    """Extrai todas as partidas do Torneio Roberto Gomes Pedrosa (1967-1970) via Bola n@ Área."""
    print(">>> Extraindo Torneio Roberto Gomes Pedrosa / Robertão (1967-1970) do Bola n@ Área...")
    todas_partidas = []

    for ano in [1967, 1968, 1969, 1970]:
        url = f"https://www.bolanaarea.com/robertao_{ano}.htm"
        req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"})
        try:
            content = urllib.request.urlopen(req, timeout=10).read().decode("latin1", errors="ignore")
        except Exception as e:
            print(f"  ❌ Erro ao baixar Robertão {ano}: {e}")
            continue

        chunks = re.split(r"<br\s*/?>|</?tr>|</?p>", content, flags=re.IGNORECASE)
        cur_date = f"{ano}-01-01"
        cur_rodada = "1ª Fase"

        count_ano = 0
        for ch in chunks:
            text = re.sub(r"<[^>]+>", " ", ch)
            text = text.replace("&nbsp;", " ")
            text = re.sub(r"\s+", " ", text).strip()

            if not text:
                continue

            m_rod = re.search(r"(\d+ª\s*Rodada|QUADRANGULAR\s*FINAL|Fase\s*Final)", text, re.IGNORECASE)
            if m_rod:
                cur_rodada = m_rod.group(1).title()

            m_dt = re.search(r"(\d{2})/(\d{2})/(\d{4})", text)
            if m_dt:
                cur_date = f"{m_dt.group(3)}-{m_dt.group(2)}-{m_dt.group(1)}"

            m_jogo = re.search(r"^([A-Za-zÀ-ÿ0-9\.\-\s]+?)\s+(\d{1,2})\s*[xX]\s*(\d{1,2})\s+([A-Za-zÀ-ÿ0-9\.\-\s]+)$", text)
            if m_jogo:
                t1 = m_jogo.group(1).strip()
                g1 = int(m_jogo.group(2))
                g2 = int(m_jogo.group(3))
                t2 = m_jogo.group(4).strip()

                if len(t1) >= 3 and len(t2) >= 3 and not any(k in t1.lower() for k in ["pontos", "saldo", "classifica", "gols", "pos", "turno"]):
                    man = normalizar_clube(t1)
                    vis = normalizar_clube(t2)
                    venc = man if g1 > g2 else (vis if g2 > g1 else "Empate")
                    todas_partidas.append({
                        "ano": ano, "data": cur_date, "rodada": cur_rodada,
                        "fase": "Quadrangular Final" if "quadrangular" in cur_rodada.lower() else "Primeira Fase",
                        "mandante": man, "visitante": vis,
                        "gols_mandante": g1, "gols_visitante": g2,
                        "placar": f"{g1}x{g2}", "vencedor": venc,
                        "campeonato": "Torneio Roberto Gomes Pedrosa",
                        "formato": "Fase de Grupos + Quadrangular Final"
                    })
                    count_ano += 1

        print(f"  -> {count_ano} partidas do Robertão {ano} extraídas.")

    print(f"  -> Total de {len(todas_partidas)} partidas do Robertão extraídas.")
    return todas_partidas

def extrair_templates_aninhados(text, template_name):
    """Extrai templates de wikitext com profundidade de chaves correta."""
    results = []
    pattern = re.compile(r"\{\{\s*" + re.escape(template_name), re.IGNORECASE)
    for m in pattern.finditer(text):
        start = m.start()
        depth = 0
        i = start
        while i < len(text) - 1:
            if text[i:i+2] == "{{":
                depth += 1
                i += 2
            elif text[i:i+2] == "}}":
                depth -= 1
                i += 2
                if depth == 0:
                    results.append(text[start:i])
                    break
            else:
                i += 1
    return results

def extrair_fichas_wikipedia():
    """Extrai detalhes aprofundados (árbitros, bandeirinhas, estádios, gols) da Wikipédia."""
    print(">>> Buscando fichas técnicas detalhadas da Wikipédia (gols, árbitros, estádios)...")
    paginas = [
        # Finais da Taça Brasil
        (1959, "Campeonato_Brasileiro_de_Futebol_de_1959"),
        (1960, "Campeonato_Brasileiro_de_Futebol_de_1960"),
        (1961, "Campeonato_Brasileiro_de_Futebol_de_1961"),
        (1962, "Campeonato_Brasileiro_de_Futebol_de_1962"),
        (1963, "Campeonato_Brasileiro_de_Futebol_de_1963"),
        (1964, "Campeonato_Brasileiro_de_Futebol_de_1964"),
        (1965, "Campeonato_Brasileiro_de_Futebol_de_1965"),
        (1966, "Campeonato_Brasileiro_de_Futebol_de_1966"),
        # Finais do Robertão
        (1967, "Torneio_Roberto_Gomes_Pedrosa_de_1967"),
        (1968, "Torneio_Roberto_Gomes_Pedrosa_de_1968"),
        (1969, "Torneio_Roberto_Gomes_Pedrosa_de_1969"),
        (1970, "Torneio_Roberto_Gomes_Pedrosa_de_1970"),
    ]

    fichas = []

    for ano, titulo in paginas:
        url = f"https://pt.wikipedia.org/w/api.php?action=parse&page={titulo}&prop=wikitext&format=json&redirects=1"
        try:
            req = urllib.request.Request(url, headers={"User-Agent": "AntigravityBot/1.0 (leoborba12@gmail.com)"})
            with urllib.request.urlopen(req, timeout=10) as resp:
                data = json.loads(resp.read().decode("utf-8"))
            wt = data.get("parse", {}).get("wikitext", {}).get("*", "")
            boxes = extrair_templates_aninhados(wt, "footballbox")
            
            for b in boxes:
                fields = {}
                for line in b.splitlines():
                    line = line.strip()
                    if line.startswith("|") and "=" in line:
                        k, v = line[1:].split("=", 1)
                        fields[k.strip().lower()] = v.strip()

                t1 = normalizar_clube(fields.get("time1", ""))
                t2 = normalizar_clube(fields.get("time2", ""))
                placar_raw = fields.get("placar", "")
                m_p = re.search(r"(\d+)\s*[-–xX]\s*(\d+)", placar_raw)
                if not m_p:
                    continue
                g_man, g_vis = int(m_p.group(1)), int(m_p.group(2))

                # Extrai gols
                gols_partida = []
                for side, t_nome in [("gols1", t1), ("gols2", t2)]:
                    txt_g = fields.get(side, "")
                    for item in re.split(r"<br\s*/?>|\n", txt_g):
                        item = item.strip()
                        if not item:
                            continue
                        m_gol = re.search(r"\{\{gol\|?(\d+)?(?:\'|min)?(?:\|(contra|pen|p))?\}\}", item, re.IGNORECASE)
                        minuto = m_gol.group(1) if (m_gol and m_gol.group(1)) else ""
                        tipo_tag = m_gol.group(2).lower() if (m_gol and m_gol.group(2)) else ""
                        tipo = "Pênalti" if "pen" in tipo_tag or "p" in tipo_tag else ("Contra" if "contra" in tipo_tag else "Normal")
                        
                        atleta = re.sub(r"\[\[(?:[^|\]]*\|)?([^\]]+)\]\]", r"\1", item)
                        atleta = re.sub(r"\{\{[^}]*\}\}", "", atleta)
                        atleta = re.sub(r"<[^>]+>", " ", atleta).strip()
                        atleta = re.sub(r"^[0-9\-\s\.]+", "", atleta).strip()
                        if atleta and len(atleta) > 1:
                            gols_partida.append({"clube": t_nome, "atleta": atleta, "minuto": minuto, "tipo": tipo})

                # Arbitragem
                arb_raw = re.sub(r"\[\[(?:[^|\]]*\|)?([^\]]+)\]\]", r"\1", fields.get("arbitro", ""))
                arb = arb_raw
                aux = None
                if "Auxiliares:" in arb_raw:
                    p = arb_raw.split("Auxiliares:", 1)
                    arb = p[0].strip()
                    aux = p[1].strip()
                elif "Assistentes:" in arb_raw:
                    p = arb_raw.split("Assistentes:", 1)
                    arb = p[0].strip()
                    aux = p[1].strip()

                estadio_raw = re.sub(r"\[\[(?:[^|\]]*\|)?([^\]]+)\]\]", r"\1", fields.get("estadio", ""))

                fichas.append({
                    "ano": ano,
                    "mandante": t1,
                    "visitante": t2,
                    "gols_mandante": g_man,
                    "gols_visitante": g_vis,
                    "estadio": estadio_raw.strip(),
                    "arbitro": arb.strip(),
                    "assistentes": aux.strip() if aux else None,
                    "publico": fields.get("publico", "").strip(),
                    "gols": gols_partida
                })

            time.sleep(1.0)
        except Exception as e:
            print(f"  ❌ Erro ao buscar ficha wiki {titulo}: {e}")

    print(f"  -> {len(fichas)} fichas detalhadas com gols e árbitros capturadas da Wikipédia.")
    return fichas

def gravar_banco():
    print("=" * 80)
    print("INICIANDO GRAVAÇÃO HISTÓRICA DO CAMPEONATO BRASILEIRO (1959 A 1970)")
    print("Taça Brasil (1959-1968) + Torneio Roberto Gomes Pedrosa (1967-1970)")
    print("=" * 80)

    # 1. Minera Taça Brasil
    partidas_tb = minerar_tacabrasil_rsssf()

    # 2. Minera Robertão
    partidas_robertao = minerar_robertao_bolanaarea()

    # 3. Minera fichas detalhadas da Wikipédia
    fichas_wiki = extrair_fichas_wikipedia()

    # Unifica todas as partidas
    todas_partidas = partidas_tb + partidas_robertao

    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    # Remove registros pré-1971 anteriores para evitar duplicações
    cursor.execute("DELETE FROM partidas WHERE ano < 1971;")
    cursor.execute("DELETE FROM gols WHERE id_partida < 19710000;")
    conn.commit()

    partidas_to_insert = []
    gols_to_insert = []

    match_counter = 1
    total_gols_enriquecidos = 0

    for p in todas_partidas:
        ano = p["ano"]
        id_partida = ano * 10000 + match_counter
        match_counter += 1

        man = p["mandante"]
        vis = p["visitante"]
        g_man = p["gols_mandante"]
        g_vis = p["gols_visitante"]

        # Busca estádio padrão para o mandante
        estadio_padrao, cidade_padrao, estado_padrao = ESTADIOS_PADRAO.get(man, ("", "", ""))

        estadio = estadio_padrao
        cidade = cidade_padrao
        estado = estado_padrao
        arbitro = None
        assistente_1 = None
        publico = None

        # Verifica se há ficha técnica detalhada da Wikipédia para enriquecimento
        for fw in fichas_wiki:
            if fw["ano"] == ano and fw["mandante"] == man and fw["visitante"] == vis and fw["gols_mandante"] == g_man and fw["gols_visitante"] == g_vis:
                if fw["estadio"]:
                    estadio = fw["estadio"][:60]
                if fw["arbitro"]:
                    arbitro = fw["arbitro"][:60]
                if fw["assistentes"]:
                    assistente_1 = fw["assistentes"][:60]
                if fw["publico"]:
                    try:
                        publico = int(re.sub(r"\D", "", fw["publico"]))
                    except:
                        pass
                for g in fw["gols"]:
                    gols_to_insert.append((
                        id_partida, p.get("rodada", p.get("fase", "")), g["clube"], g["atleta"], g["minuto"], "", g["tipo"]
                    ))
                    total_gols_enriquecidos += 1
                break

        rodada = p.get("rodada", p.get("fase", "Fase Inicial"))
        fase = p.get("fase", rodada)

        partidas_to_insert.append((
            id_partida, ano, rodada, p["data"], "", estadio, cidade, estado,
            man, vis, g_man, g_vis, p["placar"], p["vencedor"],
            arbitro, assistente_1, None, None, None,
            "", "", publico, p["campeonato"], p["formato"], fase
        ))

    # Inserção em lote no SQLite
    cursor.executemany("""
    INSERT OR REPLACE INTO partidas (
        id_partida, ano, rodada, data, horario, estadio, cidade, estado,
        mandante, visitante, gols_mandante, gols_visitante, placar, vencedor,
        arbitro, assistente_1, assistente_2, quarto_arbitro, var,
        tecnico_mandante, tecnico_visitante, publico, campeonato, formato, fase
    ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?);
    """, partidas_to_insert)

    if gols_to_insert:
        cursor.executemany("""
        INSERT INTO gols (id_partida, rodada, clube, atleta, minuto, tempo, tipo_de_gol)
        VALUES (?,?,?,?,?,?,?);
        """, gols_to_insert)

    conn.commit()

    # Estatísticas de confirmação
    cursor.execute("SELECT COUNT(*) FROM partidas WHERE ano < 1971;")
    count_partidas = cursor.fetchone()[0]

    cursor.execute("SELECT COUNT(*) FROM gols WHERE id_partida < 19710000;")
    count_gols = cursor.fetchone()[0]

    cursor.execute("SELECT COUNT(*) FROM partidas;")
    total_geral_partidas = cursor.fetchone()[0]

    cursor.execute("SELECT COUNT(*) FROM gols;")
    total_geral_gols = cursor.fetchone()[0]

    cursor.execute("SELECT MIN(ano), MAX(ano) FROM partidas;")
    min_ano, max_ano = cursor.fetchone()

    conn.close()

    print("=" * 80)
    print("GRAVAÇÃO DA ERA 1959-1970 CONCLUÍDA COM SUCESSO ABSOLUTO!")
    print(f"Partidas Inseridas (1959-1970):    {count_partidas}")
    print(f"Gols Detalhados (Fichas Técnicas): {count_gols}")
    print(f"Total Geral no Banco futebol.db:   {total_geral_partidas} partidas ({min_ano} a {max_ano})")
    print(f"Total Geral de Gols no Banco:      {total_geral_gols} gols")
    print("=" * 80)

if __name__ == "__main__":
    gravar_banco()
