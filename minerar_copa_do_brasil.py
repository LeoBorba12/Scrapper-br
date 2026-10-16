"""
Minerador Oficial da Copa do Brasil (1989 a 2024) - Todas as 36 Edições Históricas
Fontes: RSSSF Oficial (Rec.Sport.Soccer Statistics Foundation)

Estrutura:
- 36 edições completas (1989 a 2024)
- Identificador único: ano * 10000 + 5000 + match_counter
- Campeonato: 'Copa do Brasil', Formato: 'Mata-Mata'
- Fases: Primeira Fase, Oitavas de Final, Quartas de Final, Semifinais, Final
- Extração de gols detalhados com atletas e minutos quando disponíveis
"""

import os
import re
import sys
import sqlite3
import urllib.request

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

BASE_DIR = os.path.dirname(__file__)
DB_PATH = os.path.join(BASE_DIR, "data", "futebol.db")

MONTHS_EN = {
    "jan": 1, "feb": 2, "mar": 3, "apr": 4, "may": 5, "jun": 6,
    "jul": 7, "aug": 8, "sep": 9, "oct": 10, "nov": 11, "dec": 12
}

DICIONARIO_CLUBES = {
    "atlético-mg": "Atlético-MG", "atlético mineiro": "Atlético-MG", "atlético/mg": "Atlético-MG", "atletico/mg": "Atlético-MG",
    "atlético-pr": "Athletico-PR", "athletico-pr": "Athletico-PR", "atlético paranaense": "Athletico-PR", "athletico/pr": "Athletico-PR", "atlético/pr": "Athletico-PR",
    "atlético-go": "Atlético-GO", "atlético/go": "Atlético-GO",
    "corinthians": "Corinthians", "palmeiras": "Palmeiras", "são paulo": "São Paulo", "sao paulo": "São Paulo", "santos": "Santos",
    "flamengo": "Flamengo", "fluminense": "Fluminense", "vasco": "Vasco", "vasco da gama": "Vasco",
    "botafogo": "Botafogo-RJ", "botafogo-rj": "Botafogo-RJ", "botafogo/rj": "Botafogo-RJ",
    "grêmio": "Grêmio", "gremio": "Grêmio", "internacional": "Internacional", "cruzeiro": "Cruzeiro",
    "bahia": "Bahia", "vitória": "Vitória", "vitoria": "Vitória", "vitória/ba": "Vitória",
    "coritiba": "Coritiba", "sport": "Sport", "santa cruz": "Santa Cruz", "náutico": "Náutico", "nautico": "Náutico",
    "portuguesa": "Portuguesa", "guarani": "Guarani", "ponte preta": "Ponte Preta",
    "américa-mg": "América-MG", "américa/mg": "América-MG", "america-mg": "América-MG", "america/mg": "América-MG",
    "américa-rn": "América-RN", "américa/rn": "América-RN", "america-rn": "América-RN",
    "américa-rj": "América-RJ", "america-rj": "América-RJ",
    "ceará": "Ceará", "ceara": "Ceará", "fortaleza": "Fortaleza", "bangu": "Bangu",
    "remo": "Remo", "paysandu": "Paysandu", "paysandú": "Paysandu", "csa": "CSA", "crb": "CRB", "abc": "ABC",
    "juventude": "Juventude", "caxias": "Caxias", "paulista": "Paulista", "santo andré": "Santo André", "santo andre": "Santo André",
    "brasiliense": "Brasiliense", "figueirense": "Figueirense", "avaí": "Avaí", "avai": "Avaí", "criciúma": "Criciúma", "criciuma": "Criciúma",
    "chapecoense": "Chapecoense", "joinville": "Joinville", "paran": "Paraná", "paraná": "Paraná", "parana": "Paraná",
    "são caetano": "São Caetano", "sao caetano": "São Caetano", "bragantino": "Red Bull Bragantino", "red bull bragantino": "Red Bull Bragantino",
    "cuiabá": "Cuiabá", "cuiaba": "Cuiabá", "goiás": "Goiás", "goias": "Goiás", "vila nova": "Vila Nova", "vila nova/go": "Vila Nova",
}

ESTADIOS_PADRAO = {
    "Santos": ("Vila Belmiro", "Santos", "SP"),
    "Palmeiras": ("Allianz Parque", "São Paulo", "SP"),
    "Corinthians": ("Neo Química Arena", "São Paulo", "SP"),
    "São Paulo": ("Morumbi", "São Paulo", "SP"),
    "Flamengo": ("Maracanã", "Rio de Janeiro", "RJ"),
    "Fluminense": ("Maracanã", "Rio de Janeiro", "RJ"),
    "Vasco": ("São Januário", "Rio de Janeiro", "RJ"),
    "Botafogo-RJ": ("Nilton Santos", "Rio de Janeiro", "RJ"),
    "Cruzeiro": ("Mineirão", "Belo Horizonte", "MG"),
    "Atlético-MG": ("Arena MRV", "Belo Horizonte", "MG"),
    "Grêmio": ("Arena do Grêmio", "Porto Alegre", "RS"),
    "Internacional": ("Beira-Rio", "Porto Alegre", "RS"),
    "Athletico-PR": ("Ligga Arena", "Curitiba", "PR"),
    "Coritiba": ("Couto Pereira", "Curitiba", "PR"),
    "Bahia": ("Arena Fonte Nova", "Salvador", "BA"),
    "Vitória": ("Barradão", "Salvador", "BA"),
    "Sport": ("Ilha do Retiro", "Recife", "PE"),
    "Náutico": ("Aflitos", "Recife", "PE"),
    "Santa Cruz": ("Arruda", "Recife", "PE"),
    "Ceará": ("Castelão", "Fortaleza", "CE"),
    "Fortaleza": ("Castelão", "Fortaleza", "CE"),
    "Goiás": ("Serrinha", "Goiânia", "GO"),
    "Juventude": ("Alfredo Jaconi", "Caxias do Sul", "RS"),
    "Santo André": ("Bruno José Daniel", "Santo André", "SP"),
    "Paulista": ("Jayme Cintra", "Jundiaí", "SP"),
    "Brasiliense": ("Serejão", "Taguatinga", "DF"),
    "Criciúma": ("Heriberto Hülse", "Criciúma", "SC"),
}

def normalizar_clube(t):
    if not t:
        return "Desconhecido"
    limpo = re.sub(r"\[\[(?:[^|\]]*\|)?([^\]]+)\]\]", r"\1", t)
    limpo = re.sub(r"\([A-Za-z]{2}\)", "", limpo)
    limpo = re.sub(r"/[A-Za-z]{2}", "", limpo)
    limpo = limpo.strip().replace("\ufffd", "").lower()
    return DICIONARIO_CLUBES.get(limpo, t.strip())

def parse_dates_bracket(line, default_year):
    line = re.sub(r"\[|\]|<i>|</i>", "", line).strip()
    matches = re.findall(r"([A-Za-z]{3})\s+(\d{1,2})", line)
    dates = []
    for mon_str, d_str in matches:
        m = MONTHS_EN.get(mon_str.lower()[:3], 1)
        d = int(d_str)
        dates.append(f"{default_year:04d}-{m:02d}-{d:02d}")
    return dates

def extrair_gols_inline(linha_gols, mandante, visitante):
    """Extrai gols no formato [Manu 14 ; Tiago 61, Elton 90+1]"""
    gols = []
    if not linha_gols or ";" not in linha_gols:
        return gols
    
    partes = linha_gols.strip("[] ").split(";")
    if len(partes) >= 2:
        # Gols mandante
        for g_str in partes[0].split(","):
            m = re.search(r"([A-Za-zÀ-ÿ\s\.]+?)\s+(\d{1,2}(?:\+\d+)?)", g_str)
            if m:
                gols.append({"clube": mandante, "atleta": m.group(1).strip(), "minuto": m.group(2), "tipo": "Normal"})
        # Gols visitante
        for g_str in partes[1].split(","):
            m = re.search(r"([A-Za-zÀ-ÿ\s\.]+?)\s+(\d{1,2}(?:\+\d+)?)", g_str)
            if m:
                gols.append({"clube": visitante, "atleta": m.group(1).strip(), "minuto": m.group(2), "tipo": "Normal"})
                
    return gols

def extrair_partidas_cdb(ano):
    if ano <= 2009:
        short_y = ano % 100
        url = f"https://www.rsssf.org/tablesb/brazcup{short_y:02d}.html"
    else:
        url = f"https://www.rsssf.org/tablesb/braz{ano}.html"

    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"})
    content = urllib.request.urlopen(req, timeout=10).read().decode("latin1", errors="ignore")

    # Isola a seção da Copa do Brasil
    if ano >= 2010:
        idx_cb = re.search(r"name=[\'\"]cb[\'\"]", content, re.IGNORECASE)
        if not idx_cb:
            idx_cb = re.search(r"Copa do Brasil\s*" + str(ano), content, re.IGNORECASE)
        if not idx_cb:
            idx_cb = re.search(r"Copa do Brasil", content, re.IGNORECASE)
            
        if idx_cb:
            content = content[idx_cb.start():]
            idx_next = re.search(r"name=[\'\"]s[bcd]|name=[\'\"]supcb|name=[\'\"]cbn", content, re.IGNORECASE)
            if idx_next:
                content = content[:idx_next.start()]

    lines = content.splitlines()
    matches = []
    cur_fase = "Copa do Brasil"
    cur_dates = [f"{ano}-01-01"]

    i = 0
    while i < len(lines):
        clean = lines[i].strip()
        i += 1
        if not clean:
            continue

        if any(f in clean.lower() for f in ["first round", "second round", "third round", "fourth round", "1/16", "1/8", "quarter", "semi", "final"]):
            if not re.search(r"\b\d+\s*-\s*\d+\b", clean):
                cur_fase = clean.replace("<i>", "").replace("</i>", "").strip()

        if re.search(r"\[\s*[A-Za-z]{3}\s+\d{1,2}", clean):
            dts = parse_dates_bracket(clean, ano)
            if dts:
                cur_dates = dts

        # Padrão 1: Formato inline com data: Team1 (UF) [x|-] Team2 (UF) G1-G2 (DD/MM) G3-G4 (DD/MM)
        m_inline = re.match(r"^\d*\s*([A-Za-zÀ-ÿ0-9\.\-\s/]+(?:\([A-Za-z]{2}\))?)\s*[-xX]\s*([A-Za-zÀ-ÿ0-9\.\-\s/]+(?:\([A-Za-z]{2}\))?)\s+(\d{1,2})\s*-\s*(\d{1,2})\s+\((\d{1,2})/(\d{1,2})\)(?:\s+(?:(\d{1,2})\s*-\s*(\d{1,2})|n/p)\s+\((\d{1,2})/(\d{1,2})\))?", clean)
        if m_inline:
            t1 = normalizar_clube(m_inline.group(1))
            t2 = normalizar_clube(m_inline.group(2))
            g1_1 = int(m_inline.group(3))
            g2_1 = int(m_inline.group(4))
            dia1 = int(m_inline.group(5))
            mes1 = int(m_inline.group(6))
            dt1 = f"{ano:04d}-{mes1:02d}-{dia1:02d}"

            # Verifica se a próxima linha tem gols
            gols_ida = []
            if i < len(lines) and lines[i].strip().startswith("[") and ";" in lines[i]:
                gols_ida = extrair_gols_inline(lines[i], t1, t2)
                i += 1

            venc1 = t1 if g1_1 > g2_1 else (t2 if g2_1 > g1_1 else "Empate")
            matches.append({
                "ano": ano, "data": dt1, "fase": cur_fase,
                "mandante": t1, "visitante": t2,
                "gols_man": g1_1, "gols_vis": g2_1, "placar": f"{g1_1}x{g2_1}",
                "vencedor": venc1, "gols": gols_ida
            })

            if m_inline.group(7) and m_inline.group(8) and m_inline.group(9) and m_inline.group(10):
                g1_2 = int(m_inline.group(7))
                g2_2 = int(m_inline.group(8))
                dia2 = int(m_inline.group(9))
                mes2 = int(m_inline.group(10))
                dt2 = f"{ano:04d}-{mes2:02d}-{dia2:02d}"

                gols_volta = []
                if i < len(lines) and lines[i].strip().startswith("[") and ";" in lines[i]:
                    gols_volta = extrair_gols_inline(lines[i], t2, t1)
                    i += 1

                venc2 = t2 if g2_2 > g1_2 else (t1 if g1_2 > g2_2 else "Empate")
                matches.append({
                    "ano": ano, "data": dt2, "fase": cur_fase,
                    "mandante": t2, "visitante": t1,
                    "gols_man": g2_2, "gols_vis": g1_2, "placar": f"{g2_2}x{g1_2}",
                    "vencedor": venc2, "gols": gols_volta
                })
            continue

        # Padrão 2: Formato Antigo Duplo: Team1(UF) 1-1 1-2 Team2(UF)
        m_antigo_duplo = re.match(r"^([A-Za-zÀ-ÿ0-9\.\-\s]+(?:\([A-Z]{2}\))?)\s+(\d{1,2})\s*-\s*(\d{1,2})\s+(\d{1,2})\s*-\s*(\d{1,2})\s+([A-Za-zÀ-ÿ0-9\.\-\s]+(?:\([A-Z]{2}\))?)", clean)
        if m_antigo_duplo:
            t1 = normalizar_clube(m_antigo_duplo.group(1))
            g1_1 = int(m_antigo_duplo.group(2))
            g2_1 = int(m_antigo_duplo.group(3))
            g1_2 = int(m_antigo_duplo.group(4))
            g2_2 = int(m_antigo_duplo.group(5))
            t2 = normalizar_clube(m_antigo_duplo.group(6))

            d1 = cur_dates[0] if len(cur_dates) > 0 else f"{ano}-01-01"
            d2 = cur_dates[1] if len(cur_dates) > 1 else d1

            venc1 = t1 if g1_1 > g2_1 else (t2 if g2_1 > g1_1 else "Empate")
            matches.append({
                "ano": ano, "data": d1, "fase": cur_fase,
                "mandante": t1, "visitante": t2,
                "gols_man": g1_1, "gols_vis": g2_1, "placar": f"{g1_1}x{g2_1}",
                "vencedor": venc1, "gols": []
            })
            venc2 = t2 if g2_2 > g1_2 else (t1 if g1_2 > g2_2 else "Empate")
            matches.append({
                "ano": ano, "data": d2, "fase": cur_fase,
                "mandante": t2, "visitante": t1,
                "gols_man": g2_2, "gols_vis": g1_2, "placar": f"{g2_2}x{g1_2}",
                "vencedor": venc2, "gols": []
            })
            continue

        # Padrão 3: Formato linha simples: Team1 2-0 Team2
        m_simples = re.match(r"^([A-Za-zÀ-ÿ0-9\.\-\s/]+(?:\([A-Za-z]{2}\))?)\s+(\d{1,2})\s*-\s*(\d{1,2})\s+([A-Za-zÀ-ÿ0-9\.\-\s/]+(?:\([A-Za-z]{2}\))?)", clean)
        if m_simples:
            t1 = normalizar_clube(m_simples.group(1))
            g1 = int(m_simples.group(2))
            g2 = int(m_simples.group(3))
            t2 = normalizar_clube(m_simples.group(4))
            if len(t1) >= 3 and len(t2) >= 3 and not any(k in t1.lower() for k in ["table", "round", "phase", "participants", "qualified", "aggregate", "first legs", "second legs"]):
                dt = cur_dates[0] if cur_dates else f"{ano}-01-01"
                venc = t1 if g1 > g2 else (t2 if g2 > g1 else "Empate")
                matches.append({
                    "ano": ano, "data": dt, "fase": cur_fase,
                    "mandante": t1, "visitante": t2,
                    "gols_man": g1, "gols_vis": g2, "placar": f"{g1}x{g2}",
                    "vencedor": venc, "gols": []
                })

    return matches

def salvar_copa_do_brasil():
    print("=" * 80)
    print("INICIANDO MINERAÇÃO COMPLETA DA COPA DO BRASIL (1989 A 2024)")
    print("36 Edições Históricas do Maior Torneio de Mata-Mata do País")
    print("=" * 80)

    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    # Deleta registros antigos da Copa do Brasil para recarga limpa
    cursor.execute("DELETE FROM partidas WHERE campeonato = 'Copa do Brasil';")
    cursor.execute("DELETE FROM gols WHERE id_partida IN (SELECT id_partida FROM partidas WHERE campeonato = 'Copa do Brasil');")
    conn.commit()

    total_partidas = 0
    total_gols = 0

    partidas_to_insert = []
    gols_to_insert = []

    for ano in range(1989, 2025):
        try:
            ms = extrair_partidas_cdb(ano)
            match_counter = 1
            for p in ms:
                # ID exclusivo da Copa do Brasil: ano * 10000 + 5000 + counter
                id_partida = ano * 10000 + 5000 + match_counter
                match_counter += 1

                man = p["mandante"]
                vis = p["visitante"]
                estadio, cidade, estado = ESTADIOS_PADRAO.get(man, ("", "", ""))

                partidas_to_insert.append((
                    id_partida, ano, p["fase"], p["data"], "", estadio, cidade, estado,
                    man, vis, p["gols_man"], p["gols_vis"], p["placar"], p["vencedor"],
                    None, None, None, None, None,
                    "", "", None, "Copa do Brasil", "Mata-Mata", p["fase"]
                ))

                for g in p.get("gols", []):
                    gols_to_insert.append((
                        id_partida, p["fase"], g["clube"], g["atleta"], g["minuto"], "", g["tipo"]
                    ))

            total_partidas += len(ms)
            total_gols += len(p.get("gols", []))
            print(f"Copa do Brasil {ano}: {len(ms)} jogos processados | Decisão: {ms[-1]['mandante']} {ms[-1]['placar']} {ms[-1]['visitante']}", flush=True)

        except Exception as e:
            print(f"Erro em {ano}: {e}", flush=True)

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

    cursor.execute("SELECT COUNT(*) FROM partidas WHERE campeonato = 'Copa do Brasil';")
    count_cdb = cursor.fetchone()[0]

    cursor.execute("SELECT COUNT(*) FROM partidas;")
    total_geral = cursor.fetchone()[0]

    conn.close()

    print("=" * 80)
    print("GRAVAÇÃO DA COPA DO BRASIL FINALIZADA COM SUCESSO!")
    print(f"Total Partidas Copa do Brasil Inseridas: {count_cdb:,}")
    print(f"Total Geral de Partidas no Banco futebol.db: {total_geral:,}")
    print("=" * 80)

if __name__ == "__main__":
    salvar_copa_do_brasil()
