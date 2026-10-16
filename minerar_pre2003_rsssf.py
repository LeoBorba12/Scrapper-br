"""
Script de Mineração Histórica do Campeonato Brasileiro (1971 a 2002)
Fonte: Arquivos Oficiais do RSSSF Brasil (Rec.Sport.Soccer Statistics Foundation)
Estrutura extraída:
  - Partidas com Data, Mandante, Visitante, Placares e Vencedor
  - Gols detalhados com Atletas, Clubes e Tipos de Gol (Pênalti, Falta, Contra, Normal)
  - Normalização para os padrões canônicos dos clubes brasileiros
"""

import os
import re
import sqlite3
import urllib.request
import pandas as pd
from datetime import datetime

BASE_DIR = os.path.dirname(__file__)
DB_PATH = os.path.join(BASE_DIR, "data", "futebol.db")

MONTH_MAP = {
    "jan": 1, "feb": 2, "fev": 2, "mar": 3, "apr": 4, "abr": 4,
    "may": 5, "mai": 5, "jun": 6, "jul": 7, "aug": 8, "ago": 8,
    "sep": 9, "set": 9, "oct": 10, "out": 10, "nov": 11, "dez": 12, "dec": 12
}

# Dicionário de normalização de nomes dos clubes do RSSSF Brasil para o padrão canônico do banco
MAPA_CLUBES = {
    "atlético-mg": "Atlético-MG",
    "atlético mineiro": "Atlético-MG",
    "c atlético mineiro": "Atlético-MG",
    "atletico/mg": "Atlético-MG",
    "atletico-mg": "Atlético-MG",
    "atlético": "Atlético-MG",
    "atlético-pr": "Athletico-PR",
    "athletico-pr": "Athletico-PR",
    "atletico/pr": "Athletico-PR",
    "atletico-pr": "Athletico-PR",
    "atlético paranaense": "Athletico-PR",
    "atlético-go": "Atlético-GO",
    "atletico/go": "Atlético-GO",
    "corinthians": "Corinthians",
    "sc corinthians": "Corinthians",
    "sc corinthians paulista": "Corinthians",
    "palmeiras": "Palmeiras",
    "se palmeiras": "Palmeiras",
    "são paulo": "São Paulo",
    "são paulo fc": "São Paulo",
    "sao paulo": "São Paulo",
    "santos": "Santos",
    "santos fc": "Santos",
    "flamengo": "Flamengo",
    "cr flamengo": "Flamengo",
    "fluminense": "Fluminense",
    "fluminense fc": "Fluminense",
    "vasco da gama": "Vasco",
    "vasco": "Vasco",
    "cr vasco da gama": "Vasco",
    "botafogo": "Botafogo-RJ",
    "botafogo fr": "Botafogo-RJ",
    "botafogo-rj": "Botafogo-RJ",
    "botafogo/rj": "Botafogo-RJ",
    "botafogo-sp": "Botafogo-SP",
    "botafogo/sp": "Botafogo-SP",
    "botafogo-pb": "Botafogo-PB",
    "grêmio": "Grêmio",
    "gremio": "Grêmio",
    "grêmio fbpa": "Grêmio",
    "internacional": "Internacional",
    "sc internacional": "Internacional",
    "cruzeiro": "Cruzeiro",
    "cruzeiro ec": "Cruzeiro",
    "bahia": "Bahia",
    "ec bahia": "Bahia",
    "vitória": "Vitória",
    "ec vitória": "Vitória",
    "vitoria": "Vitória",
    "coritiba": "Coritiba",
    "coritiba fc": "Coritiba",
    "coritiba/pr": "Coritiba",
    "goiás": "Goiás",
    "goias": "Goiás",
    "sport": "Sport",
    "sport recife": "Sport",
    "sport clube do recife": "Sport",
    "santa cruz": "Santa Cruz",
    "santa cruz fc": "Santa Cruz",
    "santa cruz/pe": "Santa Cruz",
    "náutico": "Náutico",
    "nautico": "Náutico",
    "guarani": "Guarani",
    "guarani fc": "Guarani",
    "ponte preta": "Ponte Preta",
    "a ponte preta": "Ponte Preta",
    "portuguesa": "Portuguesa",
    "a portuguesa de desportos": "Portuguesa",
    "américa-mg": "América-MG",
    "america/mg": "América-MG",
    "américa-rj": "América-RJ",
    "america/rj": "América-RJ",
    "américa-gb": "América-RJ",
    "américa-rn": "América-RN",
    "america/rn": "América-RN",
    "américa-sp": "América-SP",
    "america/sp": "América-SP",
    "juventude": "Juventude",
    "ec juventude": "Juventude",
    "ceará": "Ceará",
    "ceara": "Ceará",
    "fortaleza": "Fortaleza",
    "fortaleza ec": "Fortaleza",
    "criciúma": "Criciúma",
    "criciuma": "Criciúma",
    "paraná": "Paraná",
    "parana": "Paraná",
    "paysandu": "Paysandu",
    "remo": "Remo",
    "são caetano": "São Caetano",
    "sao caetano": "São Caetano",
    "figueirense": "Figueirense",
    "joinville": "Joinville",
    "bangu": "Bangu",
    "bragantino": "Bragantino",
    "gama": "Gama",
    "lusa": "Portuguesa",
}

def normalizar_clube(clube_raw):
    limpo = clube_raw.strip().replace("\ufffd", "e").lower()
    return MAPA_CLUBES.get(limpo, clube_raw.strip())

def parse_scorers(text, g_man, g_vis, man, vis):
    gols = []
    text = text.strip()
    if not text:
        return gols
    
    parts = text.split(";")
    if len(parts) == 2:
        man_scorers = parts[0].strip()
        vis_scorers = parts[1].strip()
    elif g_man > 0 and g_vis == 0:
        man_scorers = text
        vis_scorers = ""
    elif g_man == 0 and g_vis > 0:
        man_scorers = ""
        vis_scorers = text
    else:
        man_scorers = text
        vis_scorers = ""

    def extrair_atletas(scorers_str, clube):
        if not scorers_str:
            return []
        items = scorers_str.split(",")
        res = []
        for it in items:
            it = it.strip()
            if not it:
                continue
            m_mult = re.search(r"^(.*?)\s*\((\d+)\)", it)
            if m_mult:
                nome = m_mult.group(1).strip()
                qtd = int(m_mult.group(2))
            else:
                nome = it
                qtd = 1
            tipo = "Pênalti" if "pen" in nome.lower() or "(p)" in nome.lower() else ("Contra" if "og" in nome.lower() or "contra" in nome.lower() else "Normal")
            nome = re.sub(r"\[.*?\]|\(.*?\)", "", nome).strip()
            if nome:
                for _ in range(qtd):
                    res.append({"clube": clube, "atleta": nome, "tipo": tipo})
        return res

    gols.extend(extrair_atletas(man_scorers, man))
    gols.extend(extrair_atletas(vis_scorers, vis))
    return gols

def preparar_banco(conn):
    cursor = conn.cursor()
    cursor.execute("PRAGMA table_info(partidas);")
    cols = [r[1] for r in cursor.fetchall()]
    
    if "campeonato" not in cols:
        cursor.execute("ALTER TABLE partidas ADD COLUMN campeonato TEXT DEFAULT 'Campeonato Brasileiro - Série A';")
    if "formato" not in cols:
        cursor.execute("ALTER TABLE partidas ADD COLUMN formato TEXT DEFAULT 'Pontos Corridos';")
    if "fase" not in cols:
        cursor.execute("ALTER TABLE partidas ADD COLUMN fase TEXT DEFAULT 'Fase Única';")
    conn.commit()

def extrair_ano_rsssf(ano):
    url = f"https://www.rsssfbrasil.com/tablesae/br{ano}.htm"
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
        raw_html = urllib.request.urlopen(req, timeout=10).read().decode("latin1", errors="ignore")
    except Exception as e:
        print(f"Erro ao baixar ano {ano}: {e}")
        return [], []

    text = re.sub(r"<[^>]+>", "", raw_html)
    lines = [l.strip() for l in text.splitlines()]

    # Permite datas com múltiplos dias como [Aug 17,18] e formatos com ou sem colchetes rígidos
    date_pattern = re.compile(r"\[\s*([A-Za-z]{3,4})\s+(\d{1,2})")
    # Permite nomes com barra / e dígitos de placar com espaçamento flexível
    match_pattern = re.compile(r"^([A-Za-zÀ-ÿ0-9\s\.\-/]+?)\s+(\d{1,2})\s*[-xX]\s*(\d{1,2})\s+([A-Za-zÀ-ÿ0-9\s\.\-/]+)$")

    current_date = None
    current_fase = "Fase Regular"
    partidas = []
    gols = []
    last_match = None
    match_idx = 1
    seen_matches = set()

    for line in lines:
        if any(f in line.lower() for f in ["final phase", "second phase", "third phase", "semifinal", "quarterfinal", "fase final", "oitavas", "quartas", "finais"]):
            current_fase = line[:40].strip()

        # Data do jogo
        m_date = date_pattern.search(line)
        if m_date:
            mon_str = m_date.group(1).lower()[:3]
            mon_num = MONTH_MAP.get(mon_str, 8)
            day_num = int(m_date.group(2))
            
            ano_jogo = ano + 1 if mon_num <= 2 and ano in [1975, 1979, 1986, 2000] else ano
            current_date = f"{ano_jogo}-{mon_num:02d}-{day_num:02d}"
            last_match = None

        # Partida
        m_match = match_pattern.match(line)
        if m_match and current_date:
            man_raw = m_match.group(1).strip()
            g_man = int(m_match.group(2))
            g_vis = int(m_match.group(3))
            vis_raw = m_match.group(4).strip()

            if not re.match(r"^\d+[\.\-]", man_raw) and not re.match(r"^\d+[\.\-]", vis_raw) and len(man_raw) > 2 and len(vis_raw) > 2:
                mandante = normalizar_clube(man_raw)
                visitante = normalizar_clube(vis_raw)

                match_sig = (current_date, mandante, visitante)
                if match_sig in seen_matches:
                    continue
                seen_matches.add(match_sig)

                id_partida = ano * 10000 + match_idx
                match_idx += 1

                placar = f"{g_man}x{g_vis}"
                if g_man > g_vis:
                    vencedor = mandante
                elif g_vis > g_man:
                    vencedor = visitante
                else:
                    vencedor = "Empate"

                partida_record = (
                    id_partida, ano, None, current_date, "", "", "", "",
                    mandante, visitante, g_man, g_vis, placar, vencedor,
                    None, None, None, None, None, "", "", None,
                    "Campeonato Brasileiro", "Mata-Mata / Grupos Históricos", current_fase
                )
                partidas.append(partida_record)
                last_match = {
                    "id_partida": id_partida,
                    "g_man": g_man,
                    "g_vis": g_vis,
                    "mandante": mandante,
                    "visitante": visitante
                }
                continue

        # Linha de autores dos gols imediatamente abaixo da partida
        if line.startswith("[") and line.endswith("]") and last_match:
            scorers_content = line[1:-1].strip()
            parsed_g = parse_scorers(scorers_content, last_match["g_man"], last_match["g_vis"], last_match["mandante"], last_match["visitante"])
            for g in parsed_g:
                gols.append((last_match["id_partida"], None, g["clube"], g["atleta"], "", "", g["tipo"]))
            last_match = None

    return partidas, gols

def minerar_e_salvar_pre2003():
    print("=" * 70)
    print("INICIANDO MINERAÇÃO DO BRASILEIRÃO PRÉ-2003 (1971 a 2002)")
    print("=" * 70)

    conn = sqlite3.connect(DB_PATH)
    preparar_banco(conn)
    cursor = conn.cursor()

    # Limpar registros pré-2003 existentes para permitir re-execução limpa
    cursor.execute("DELETE FROM partidas WHERE ano < 2003;")
    cursor.execute("DELETE FROM gols WHERE id_partida >= 19710000 AND id_partida <= 20029999;")
    conn.commit()

    total_partidas_geral = 0
    total_gols_geral = 0

    for ano in range(1971, 2003):
        print(f"Processando Brasileirão de {ano}...")
        partidas_ano, gols_ano = extrair_ano_rsssf(ano)
        
        if partidas_ano:
            cursor.executemany("""
            INSERT OR REPLACE INTO partidas (
                id_partida, ano, rodada, data, horario, estadio, cidade, estado,
                mandante, visitante, gols_mandante, gols_visitante, placar, vencedor,
                arbitro, assistente_1, assistente_2, quarto_arbitro, var,
                tecnico_mandante, tecnico_visitante, publico, campeonato, formato, fase
            ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?);
            """, partidas_ano)

        if gols_ano:
            cursor.executemany("""
            INSERT INTO gols (id_partida, rodada, clube, atleta, minuto, tempo, tipo_de_gol)
            VALUES (?,?,?,?,?,?,?);
            """, gols_ano)

        conn.commit()
        total_partidas_geral += len(partidas_ano)
        total_gols_geral += len(gols_ano)
        print(f"  -> {len(partidas_ano)} partidas e {len(gols_ano)} gols indexados.")

    conn.close()
    print("=" * 70)
    print(f"MINERAÇÃO CONCLUÍDA COM SUCESSO!")
    print(f"Total de Partidas Adicionadas (1971-2002): {total_partidas_geral}")
    print(f"Total de Gols Detalhados Catalogados:     {total_gols_geral}")
    print("=" * 70)

if __name__ == "__main__":
    minerar_e_salvar_pre2003()
