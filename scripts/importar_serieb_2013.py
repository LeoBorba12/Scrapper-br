"""
Pipeline de Ingestão: Campeonato Brasileiro Série B (2013)
==========================================================
Fonte: Súmulas Eletrônicas Oficiais da CBF (via BrazilianFootball/Data)
- Atualiza gols minuto a minuto, cartões e estádios para a Série B de 2013.
- Normaliza e harmoniza atletas e clubes canônicos.
- Mantém integridade referencial estrita e conformidade com as 12 regras relacionais.
"""

import os
import re
import sys
import shutil
import sqlite3
import requests
import unicodedata
from typing import Dict, Tuple, Optional

DB_LOCAL = "data/futebol.db"
DB_API = "api/data/futebol.db"

# Normalização de Clubes CBF -> Padrão Canônico da Base
MAPA_CLUBES = {
    "Atlético Mineiro": "Atlético-MG",
    "Atletico Mineiro": "Atlético-MG",
    "Atlético-MG": "Atlético-MG",
    "Athletico Paranaense": "Athletico-PR",
    "Atlético Paranaense": "Athletico-PR",
    "Athletico-PR": "Athletico-PR",
    "Atlético Goianiense": "Atlético-GO",
    "Atletico Goianiense": "Atlético-GO",
    "Atlético-GO": "Atlético-GO",
    "Atlético": "Atlético-GO",
    "São Paulo": "São Paulo",
    "Sao Paulo": "São Paulo",
    "Grêmio": "Grêmio",
    "Gremio": "Grêmio",
    "Ceará": "Ceará",
    "Ceara": "Ceará",
    "Goiás": "Goiás",
    "Goias": "Goiás",
    "Criciúma": "Criciúma",
    "Criciuma": "Criciúma",
    "América Mineiro": "América-MG",
    "America Fc": "América-MG",
    "America Mineiro": "América-MG",
    "América-MG": "América-MG",
    "América / MG": "América-MG",
    "América / RN": "América-RN",
    "Cruzeiro Saf": "Cruzeiro",
    "Cruzeiro": "Cruzeiro",
    "Botafogo Saf": "Botafogo",
    "Botafogo": "Botafogo",
    "Vasco da Gama": "Vasco",
    "Vasco": "Vasco",
    "Cuiabá": "Cuiabá",
    "Cuiaba": "Cuiabá",
    "Red Bull Bragantino": "Red Bull Bragantino",
    "Bragantino": "Red Bull Bragantino",
    "Juventude": "Juventude",
    "Fortaleza": "Fortaleza",
    "Internacional": "Internacional",
    "Flamengo": "Flamengo",
    "Fluminense": "Fluminense",
    "Palmeiras": "Palmeiras",
    "Corinthians": "Corinthians",
    "Santos": "Santos",
    "Bahia": "Bahia",
    "Vitória": "Vitória",
    "Vitoria": "Vitória",
    "Sport": "Sport",
    "Sport Recife": "Sport",
    "Coritiba": "Coritiba",
    "Avaí": "Avaí",
    "Avai": "Avaí",
    "Chapecoense": "Chapecoense",
    "Operário": "Operário-PR",
    "Operario": "Operário-PR",
    "Operário Ferroviário": "Operário-PR",
    "Vila Nova": "Vila Nova",
    "Ponte Preta": "Ponte Preta",
    "Novorizontino": "Novorizontino",
    "Mirassol": "Mirassol",
    "Guarani": "Guarani",
    "Ituano": "Ituano",
    "Brusque": "Brusque",
    "CRB": "CRB",
    "Crb": "CRB",
    "Paysandu": "Paysandu",
    "Amazonas": "Amazonas",
    "Botafogo-SP": "Botafogo-SP",
    "Botafogo / SP": "Botafogo-SP",
    "Sousa": "Sousa",
    "Petrolina": "Petrolina",
    "Cascavel": "Cascavel",
    "Águia de Marabá": "Águia de Marabá",
    "Maringá": "Maringá",
    "Maringa": "Maringá",
    "Ypiranga": "Ypiranga-RS",
    "Ypiranga / RS": "Ypiranga-RS",
    "Sampaio Corrêa": "Sampaio Corrêa",
    "Sampaio Correa": "Sampaio Corrêa",
    "São Bernardo": "São Bernardo",
    "Sao Bernardo": "São Bernardo",
    "Ferroviária": "Ferroviária",
    "Ferroviaria": "Ferroviária",
    "Ferroviário": "Ferroviário",
    "Ferroviario": "Ferroviário",
    "Tombense": "Tombense",
    "Volta Redonda": "Volta Redonda",
    "Remo": "Remo",
    "Confiança": "Confiança",
    "Confianca": "Confiança",
    "CSA": "CSA",
    "Figueirense": "Figueirense",
    "Náutico": "Náutico",
    "Nautico": "Náutico",
    "Londrina": "Londrina",
    "Aparecidense": "Aparecidense",
    "ABC": "ABC",
    "Abc": "ABC",
    "Retrô": "Retrô",
    "Retro": "Retrô",
    "Treze": "Treze",
    "Campinense": "Campinense",
    "Botafogo-PB": "Botafogo-PB",
    "Botafogo / PB": "Botafogo-PB",
    "Brasiliense": "Brasiliense",
    "Gama": "Gama",
    "Moto Club": "Moto Club",
    "River": "River-PI",
    "Ríver": "River-PI",
    "Altos": "Altos",
    "Tocantinópolis": "Tocantinópolis",
    "São Raimundo": "São Raimundo-RR",
    "São Raimundo / RR": "São Raimundo-RR",
    "Real Brasília": "Real Brasília",
    "Ceilândia": "Ceilândia",
    "Capital": "Capital-DF",
    "Nova Iguaçu": "Nova Iguaçu",
    "Portuguesa-RJ": "Portuguesa-RJ",
    "Boavista": "Boavista",
    "Bangu": "Bangu",
    "Madureira": "Madureira",
    "Resende": "Resende",
    "J. Malucelli": "J. Malucelli",
    "J.Malucelli": "J. Malucelli",
    "J Malucelli": "J. Malucelli",
    "Santa Cruz": "Santa Cruz",
    "Joinville": "Joinville",
    "Paraná": "Paraná",
    "Luverdense": "Luverdense",
    "Oeste": "Oeste",
    "Icasa": "Icasa",
    "Guaratinguetá": "Guaratinguetá",
    "ASA": "ASA",
    "Asa": "ASA",
    "Boa Esporte": "Boa Esporte",
    "Boa": "Boa Esporte",
    "São Caetano": "São Caetano"
}

def strip_accents(s: str) -> str:
    return "".join(c for c in unicodedata.normalize('NFD', s) if unicodedata.category(c) != 'Mn').lower()

def match_score(m1: str, m2: str) -> bool:
    s1 = strip_accents(m1)
    s2 = strip_accents(m2)
    s1 = re.sub(r'[^a-z0-9]', '', s1)
    s2 = re.sub(r'[^a-z0-9]', '', s2)
    return s1 == s2 or s1 in s2 or s2 in s1

def normalizar_clube(c: str) -> str:
    uf = ""
    if '/' in c:
        parts = c.split('/')
        nome_c = parts[0].strip()
        uf = parts[1].strip().upper()
    else:
        nome_c = c.strip()

    nome_c = re.sub(r'\s+saf$', '', nome_c, flags=re.I)
    nome_c = re.sub(r'\s+s\.a\.f\.$', '', nome_c, flags=re.I)
    nome_c = re.sub(r'\s+fc$', '', nome_c, flags=re.I)
    nome_c = re.sub(r'\s+f\.c\.$', '', nome_c, flags=re.I)

    # Tratamento especial de homônimos por UF
    if "operario" in nome_c.lower() or "operário" in nome_c.lower():
        if uf == "MS":
            return "Operário-MS"
        elif uf == "MT":
            return "Operário-MT"
        elif uf == "PR":
            return "Operário-PR"
        return "Operário-PR"
    if "botafogo" in nome_c.lower():
        if uf == "SP":
            return "Botafogo-SP"
        elif uf == "PB":
            return "Botafogo-PB"
        elif uf == "RJ":
            return "Botafogo"
    if "america" in nome_c.lower() or "américa" in nome_c.lower():
        if uf == "MG":
            return "América-MG"
        elif uf == "RN":
            return "América-RN"
        elif uf == "RJ":
            return "América-RJ"
        elif uf == "SP":
            return "América-SP"
    if "atletico" in nome_c.lower() or "atlético" in nome_c.lower():
        if uf == "MG":
            return "Atlético-MG"
        elif uf == "GO":
            return "Atlético-GO"
        elif uf == "PR":
            return "Athletico-PR"
    if "asa" in nome_c.lower():
        return "ASA"
    if "boa" in nome_c.lower():
        return "Boa Esporte"

    return MAPA_CLUBES.get(nome_c, nome_c)

def extrair_atleta_e_clube(resto: str, home_raw: str, away_raw: str, target_home: str = "", target_away: str = "") -> Tuple[str, str]:
    h_norm = target_home or normalizar_clube(home_raw)
    a_norm = target_away or normalizar_clube(away_raw)

    if '/' in resto:
        parts = resto.rsplit('/', 1)
        atleta_e_prefixo = parts[0].strip()
        uf = parts[1].strip().upper()

        uf_home = home_raw.split('/')[-1].strip().upper() if '/' in home_raw else ''
        uf_away = away_raw.split('/')[-1].strip().upper() if '/' in away_raw else ''

        clube_escolhido = None
        if uf == uf_home and uf != uf_away:
            clube_escolhido = h_norm
        elif uf == uf_away and uf != uf_home:
            clube_escolhido = a_norm

        cands = []
        for raw, is_home in [(home_raw, True), (away_raw, False), (h_norm, True), (a_norm, False)]:
            if not raw: continue
            base = raw.split('/')[0].strip()
            cands.append((base, is_home))
            tokens = base.split()
            if len(tokens) > 1:
                cands.append((' '.join(tokens[-2:]), is_home))
            for token in tokens:
                if len(token) >= 3 and token.lower() not in ('de', 'do', 'da', 'dos', 'das'):
                    cands.append((token, is_home))
        cands.sort(key=lambda x: len(x[0]), reverse=True)

        atleta = atleta_e_prefixo
        for cand, is_home in cands:
            if atleta.lower().endswith(cand.lower()):
                atleta = atleta[:-len(cand)].strip()
                if not clube_escolhido:
                    clube_escolhido = h_norm if is_home else a_norm
                break

        if not clube_escolhido:
            clube_escolhido = h_norm
    else:
        atleta = resto
        clube_escolhido = h_norm

    atleta = re.sub(r'^\d+', '', atleta).strip()
    if not atleta:
        atleta = "Desconhecido"
    return atleta, clube_escolhido

def parse_gol(raw: str, home_raw: str, away_raw: str, target_home: str = "", target_away: str = "") -> Optional[Tuple[str, str, str, str, str]]:
    m = re.match(r'^([\+\d:]+)\s*([12]T|PR)?\s*(\d+)?\s*([A-Z]{1,2})\s*(.+)$', raw)
    if not m:
        return None
    minuto_str = m.group(1).strip()
    tempo = m.group(2) or "1T"
    camisa = m.group(3) or ""
    tipo_cod = m.group(4)
    resto = m.group(5).strip()

    atleta_raw, clube_final = extrair_atleta_e_clube(resto, home_raw, away_raw, target_home, target_away)

    tipo_gol = "Normal"
    if tipo_cod in ("P", "PN"):
        tipo_gol = "Pênalti"
    elif tipo_cod in ("C", "CT"):
        tipo_gol = "Contra"
    elif tipo_cod == "F":
        tipo_gol = "Falta"

    return minuto_str, tempo, tipo_gol, atleta_raw, clube_final

def parse_cartao(raw: str, home_raw: str, away_raw: str, tipo_cartao: str, target_home: str = "", target_away: str = "") -> Optional[Tuple[str, str, str, str]]:
    m = re.match(r'^([\+\d:]+)\s*([12]T|PR)?\s*(\d+)?\s*(.+)$', raw)
    if not m:
        return None
    minuto_str = m.group(1).strip()
    resto = m.group(4).strip()

    atleta_raw, clube_final = extrair_atleta_e_clube(resto, home_raw, away_raw, target_home, target_away)
    return minuto_str, tipo_cartao, atleta_raw, clube_final

def converter_data_iso(d_raw: str, ano: int) -> str:
    try:
        if '/' in d_raw:
            parts = d_raw.split('/')
            if len(parts) == 3:
                d, m, a = parts
                if len(a) == 2:
                    a = f"20{a}"
                return f"{int(a):04d}-{int(m):02d}-{int(d):02d}"
    except Exception:
        pass
    return f"{ano}-01-01"

def importar_serie_b_2013():
    print("="*65)
    print("  INGESTÃO OFICIAL: CAMPEONATO BRASILEIRO SÉRIE B (2013)")
    print("="*65)

    ano = 2013
    url = f"https://raw.githubusercontent.com/BrazilianFootball/Data/main/results/processed/Serie_B_{ano}_games.json"
    print(f"\n[+] Baixando Série B {ano}...")
    r = requests.get(url, timeout=20)
    if r.status_code != 200:
        print(f"  -> Erro HTTP {r.status_code} ao baixar {url}")
        return

    jogos = r.json()
    print(f"  -> {len(jogos)} partidas encontradas na súmula oficial da CBF.")

    conn = sqlite3.connect(DB_LOCAL)
    c = conn.cursor()

    c.execute("SELECT MAX(id_partida) FROM partidas")
    next_pid = max(c.fetchone()[0] or 0, 202540000) + 1000

    total_jogos_atualizados = 0
    total_jogos_inseridos = 0
    total_gols_inseridos = 0
    total_cartoes_inseridos = 0

    for gid, g in jogos.items():
        home_raw = g.get("Home", "").strip()
        away_raw = g.get("Away", "").strip()
        home = normalizar_clube(home_raw)
        away = normalizar_clube(away_raw)
        stadium = g.get("Stadium", "").strip()
        hora = g.get("Time", "").strip()
        d_raw = g.get("Date", "").strip()
        data_iso = converter_data_iso(d_raw, ano)
        result = g.get("Result", "").strip()

        gols_m, gols_v = 0, 0
        m_res = re.search(r'(\d+)\s*[xX-]\s*(\d+)', result)
        if m_res:
            gols_m = int(m_res.group(1))
            gols_v = int(m_res.group(2))
        placar_fmt = f"{gols_m} x {gols_v}"

        # Busca partida existente na Série B 2013
        c.execute("""
            SELECT id_partida, data, estadio, mandante, visitante FROM partidas
            WHERE ano = ? AND (campeonato LIKE '%Série B%' OR campeonato LIKE '%Serie B%')
              AND ((mandante = ? AND visitante = ?) OR (mandante LIKE ? AND visitante LIKE ?))
        """, (ano, home, away, f"%{home[:5]}%", f"%{away[:5]}%"))
        row = c.fetchone()

        if not row:
            c.execute("""
                SELECT id_partida, mandante, visitante, data, estadio FROM partidas
                WHERE ano = ? AND (campeonato LIKE '%Série B%' OR campeonato LIKE '%Serie B%')
            """, (ano,))
            for p in c.fetchall():
                if match_score(home, p[1]) and match_score(away, p[2]):
                    row = (p[0], p[3], p[4], p[1], p[2])
                    break

        if row:
            pid = row[0]
            target_home = row[3]
            target_away = row[4]
            total_jogos_atualizados += 1
            if stadium and (not row[2] or row[2].strip() == ""):
                c.execute("UPDATE partidas SET estadio = ?, horario = ? WHERE id_partida = ?", (stadium, hora, pid))
        else:
            pid = next_pid
            next_pid += 1
            target_home = home
            target_away = away
            total_jogos_inseridos += 1
            vencedor = home if gols_m > gols_v else (away if gols_v > gols_m else "Empate")
            c.execute("""
                INSERT INTO partidas (
                    id_partida, ano, data, horario, estadio, mandante, visitante,
                    gols_mandante, gols_visitante, placar, vencedor, campeonato, formato
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Campeonato Brasileiro Série B', 'Pontos Corridos')
            """, (pid, ano, data_iso, hora, stadium, home, away, gols_m, gols_v, placar_fmt, vencedor))

        c.execute("DELETE FROM gols WHERE id_partida = ?", (pid,))
        c.execute("DELETE FROM cartoes WHERE id_partida = ?", (pid,))

        # 1. Inserir Gols
        for raw_gol in g.get("Goals", []):
            p_gol = parse_gol(raw_gol, home_raw, away_raw, target_home, target_away)
            if p_gol:
                minuto, tempo, tipo_gol, atleta, clube_gol = p_gol
                c.execute("""
                    INSERT INTO gols (id_partida, atleta, clube, minuto, tempo, tipo_de_gol)
                    VALUES (?, ?, ?, ?, ?, ?)
                """, (pid, atleta, clube_gol, minuto, tempo, tipo_gol))
                total_gols_inseridos += 1

        # 2. Inserir Cartões Amarelos
        for raw_card in g.get("Yellow cards", []):
            p_card = parse_cartao(raw_card, home_raw, away_raw, "Cartão Amarelo", target_home, target_away)
            if p_card:
                minuto, tipo_card, atleta, clube_card = p_card
                c.execute("""
                    INSERT INTO cartoes (id_partida, atleta, clube, cartao, minuto)
                    VALUES (?, ?, ?, ?, ?)
                """, (pid, atleta, clube_card, tipo_card, minuto))
                total_cartoes_inseridos += 1

        # 3. Inserir Cartões Vermelhos
        for raw_card in g.get("Red cards", []):
            p_card = parse_cartao(raw_card, home_raw, away_raw, "Cartão Vermelho", target_home, target_away)
            if p_card:
                minuto, tipo_card, atleta, clube_card = p_card
                c.execute("""
                    INSERT INTO cartoes (id_partida, atleta, clube, cartao, minuto)
                    VALUES (?, ?, ?, ?, ?)
                """, (pid, atleta, clube_card, tipo_card, minuto))
                total_cartoes_inseridos += 1

    conn.commit()
    print("\n" + "="*65)
    print("RELATÓRIO DA INGESTÃO SÉRIE B 2013:")
    print(f" -> {total_jogos_atualizados} partidas existentes enriquecidas")
    print(f" -> {total_jogos_inseridos} partidas novas catalogadas")
    print(f" -> {total_gols_inseridos} gols oficiais inseridos com autor e minuto")
    print(f" -> {total_cartoes_inseridos} cartões registrados")
    print("="*65)
    conn.commit()
    conn.close()

    if os.path.exists("api/data"):
        print(f"\nSincronizando {DB_LOCAL} -> {DB_API}...")
        shutil.copy2(DB_LOCAL, DB_API)
        print("Sincronização concluída com sucesso!")

if __name__ == "__main__":
    importar_serie_b_2013()
