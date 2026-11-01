"""
Pipeline de Ingestão: Copa do Brasil (2013 a 2019)
==================================================
Fonte: Súmulas Eletrônicas Oficiais da CBF (via BrazilianFootball/Data)
- Atualiza gols minuto a minuto, cartões e estádios para a Copa do Brasil de 2013 a 2019.
- Corrige e desambigua atletas canônicos (Gabriel Barbosa, Fred, Robinho, Guerrero, Alexandre Pato, etc.).
- Mantém integridade referencial e consistência estrita no banco data/futebol.db.
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
    "Luverdense": "Luverdense"
}

# Desambiguação e Harmonização Canônica de Atletas
MAPA_ATLETAS_CANONICO = {
    # Craques e Artilheiros Históricos
    "gabriel barbosa almeida": "Gabriel Barbosa",
    "gabriel barbosa": "Gabriel Barbosa",
    "frederico chaves guedes": "Fred",
    "robson de souza": "Robinho",
    "jose paolo guerrero gonzales": "Paolo Guerrero",
    "paolo guerrero": "Paolo Guerrero",
    "alexandre rodrigues da silva": "Alexandre Pato",
    "leonardo gamalho de souza": "Léo Gamalho",
    "ricardo de oliveira": "Ricardo Oliveira",
    "pedro rocha neves": "Pedro Rocha",
    "thalles lima da conceicao penha": "Thalles",
    "thalles lima da conceição penha": "Thalles",
    "robson michael signorini": "Robinho (Coritiba)",
    "rosimar amancio": "Bill",
    "magno alves de araujo": "Magno Alves",
    "glaybson yago souza lisboa": "Yago Pikachu",
    "glaybson yago souza lisbôa": "Yago Pikachu",
    "cicero santos": "Cícero",
    "cicero dos santos": "Cícero",
    "willian gomes de siqueira": "Willian",
    "hernane vidal de souza": "Hernane",
    "luciano da rocha neves": "Luciano",
    "erik nascimento de lima": "Erik",
    "jose henrique da silva dourado": "Henrique Dourado",
    "angel rodrigo romero villamayor": "Ángel Romero",
    "wanderson ferreira de oliveira": "Valdívia",
    "aylon darwin tavella": "Aylon",
    "luan guilherme de jesus vieira": "Luan",
    "mario sergio santos costa": "Marinho",
    "andre luiz barretto silva lima": "André Lima",
    "neilton meira mestzk": "Neilton",
    "lucas david pratto": "Lucas Pratto",
    "thiago neves augusto": "Thiago Neves",
    "diego de souza andrade": "Diego Souza",
    "walter henrique da silva": "Walter",
    "rafael augusto sobis": "Rafael Sóbis",
    "everton sousa soares": "Everton Cebolinha",
    "gilberto oliveira souza junior": "Gilberto",
    "elias mendes trindade": "Elias",
    "marcelo cirino da silva": "Marcelo Cirino",
    "rafael martiniano de miranda moura": "Rafael Moura",
    "rodrigo pimpao vianna": "Rodrigo Pimpão",
    "henrique pacheco de lima": "Henrique",
    "giorgian daniel de arrascaeta benedetti": "Giorgian De Arrascaeta",
    "giorgian de arrascaeta": "Giorgian De Arrascaeta",
    "pedro guilherme abreu dos santos": "Pedro",
    "givanildo vieira de sousa": "Hulk",
    "paulo henrique sampaio filho": "Paulinho (Atlético-MG)",
    "jose paulo bezerra maciel junior": "Paulinho (Corinthians)",
    "paulo lucas santos de paula": "Paulinho Paula",
    "eduardo pereira rodrigues": "Dudu",
    "raphael cavalcante veiga": "Raphael Veiga",
    "everton augusto de barros ribeiro": "Everton Ribeiro",
    "gustavo henrique furtado scarpa": "Gustavo Scarpa",
    "paulo henrique chagas de lima": "Paulo Henrique Ganso",
    "german ezequiel cano recalde": "Germán Cano",
    "german ezequiel cano": "Germán Cano",
    "german cano": "Germán Cano",
    "agustin canobbio graviz": "Agustín Canobbio",
    "agustin canobbio": "Agustín Canobbio",
    "pablo ezequiel vegetti": "Pablo Vegetti",
    "lucas rodrigues moura da silva": "Lucas Moura",
    "bruno henrique pinto": "Bruno Henrique",
    "luiz de araujo guimaraes neto": "Luiz Araújo",
    "alan patrick lourenco": "Alan Patrick",
    "alan patrick lourenço": "Alan Patrick",
    "ronielson da silva barbosa": "Rony",
    "yuri alberto monteiro da silva": "Yuri Alberto",
    "rogerio ceni": "Rogério Ceni",
    "diego ribas da cunha": "Diego",
    "diego alves carreira": "Diego Alves",
    "filipe luis kasmirski": "Filipe Luís",
    "david luiz moreira marinho": "David Luiz",
    "ramon dario abila": "Ramón Ábila",
    "ramon dario ábila": "Ramón Ábila"
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
    if "sao raimundo" in nome_c.lower() or "são raimundo" in nome_c.lower():
        if uf == "RR":
            return "São Raimundo-RR"
        elif uf == "PA":
            return "São Raimundo-PA"
        elif uf == "AM":
            return "São Raimundo-AM"
    if "ypiranga" in nome_c.lower():
        if uf == "RS":
            return "Ypiranga-RS"
        elif uf == "AP":
            return "Ypiranga-AP"

    return MAPA_CLUBES.get(nome_c, nome_c)

def normalizar_atleta(nome: str, clube: str = "") -> str:
    n_lower = nome.lower().strip()
    n_sem_acento = strip_accents(n_lower)

    # Desambiguação explícita de Gabriel Barbosa
    if "gabriel barbosa pinheiro" in n_sem_acento:
        return "Gabriel Pinheiro"
    if "gabriel barbosa" in n_sem_acento:
        return "Gabriel Barbosa"

    # Desambiguação de Pedro
    if n_sem_acento in ("pedro guilherme", "pedro guilherme abreu dos santos") or (n_sem_acento == "pedro" and clube in ("Flamengo", "Fluminense")):
        return "Pedro"
    if "pedro raul" in n_sem_acento:
        return "Pedro Raul"
    if "pedro henrique" in n_sem_acento:
        return "Pedro Henrique"

    # Desambiguação de Paulinho
    if n_sem_acento == "paulinho":
        if clube in ("Atlético-MG", "Vasco"):
            return "Paulinho (Atlético-MG)"
        elif "corinthians" in clube.lower():
            return "Paulinho (Corinthians)"
        return f"Paulinho ({clube})"

    if n_sem_acento in MAPA_ATLETAS_CANONICO:
        return MAPA_ATLETAS_CANONICO[n_sem_acento]
    if n_lower in MAPA_ATLETAS_CANONICO:
        return MAPA_ATLETAS_CANONICO[n_lower]

    return nome.strip()

def extrair_atleta_e_clube(resto: str, home_raw: str, away_raw: str) -> Tuple[str, str]:
    if '/' in resto:
        parts = resto.rsplit('/', 1)
        atleta_e_clube = parts[0].strip()
        candidates = []
        for raw_c in [home_raw, away_raw]:
            norm_c = normalizar_clube(raw_c)
            base_c = raw_c.split('/')[0].strip()
            clean_c = re.sub(r'\s+(saf|fc|f\.c\.|s\.a\.f\.)$', '', base_c, flags=re.I).strip()
            candidates.append((base_c, norm_c))
            candidates.append((clean_c, norm_c))
            candidates.append((norm_c, norm_c))
            candidates.append((base_c + " Saf", norm_c))
            candidates.append((clean_c + " Saf", norm_c))
        candidates.sort(key=lambda x: len(x[0]), reverse=True)
        atleta = None
        clube_final = None
        for cand_str, cand_norm in candidates:
            if atleta_e_clube.lower().endswith(cand_str.lower()):
                atleta = atleta_e_clube[:-len(cand_str)].strip()
                clube_final = cand_norm
                break
        if not atleta:
            tokens = atleta_e_clube.rsplit(' ', 1)
            atleta = tokens[0].strip()
            clube_final = normalizar_clube(tokens[1] if len(tokens) > 1 else home_raw)
    else:
        atleta = resto
        clube_final = normalizar_clube(home_raw)

    atleta = re.sub(r'^\d+', '', atleta).strip()
    if not atleta:
        atleta = "Desconhecido"
    return atleta, clube_final

def parse_gol(raw: str, home_raw: str, away_raw: str) -> Optional[Tuple[str, str, str, str, str]]:
    """
    Ex: '43:00 2T17NRDanillo Souza Muniz Sousa/PB'
    Retorna: (minuto, tempo, tipo_gol, atleta, clube)
    """
    m = re.match(r'^([\+\d:]+)\s*([12]T|PR)?\s*(\d+)?\s*([A-Z]{1,2})\s*(.+)$', raw)
    if not m:
        return None
    minuto_str = m.group(1).strip()
    tempo = m.group(2) or "1T"
    camisa = m.group(3) or ""
    tipo_cod = m.group(4)
    resto = m.group(5).strip()

    atleta_raw, clube_final = extrair_atleta_e_clube(resto, home_raw, away_raw)

    tipo_gol = "Normal"
    if tipo_cod in ("P", "PN"):
        tipo_gol = "Pênalti"
    elif tipo_cod in ("C", "CT"):
        tipo_gol = "Contra"
    elif tipo_cod == "F":
        tipo_gol = "Falta"

    atleta_final = normalizar_atleta(atleta_raw, clube_final)
    return minuto_str, tempo, tipo_gol, atleta_final, clube_final

def parse_cartao(raw: str, home_raw: str, away_raw: str, tipo_cartao: str) -> Optional[Tuple[str, str, str, str]]:
    m = re.match(r'^([\+\d:]+)\s*([12]T|PR)?\s*(\d+)?\s*(.+)$', raw)
    if not m:
        return None
    minuto_str = m.group(1).strip()
    resto = m.group(4).strip()

    atleta_raw, clube_final = extrair_atleta_e_clube(resto, home_raw, away_raw)
    atleta_final = normalizar_atleta(atleta_raw, clube_final)
    return minuto_str, tipo_cartao, atleta_final, clube_final

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

def importar_copa_do_brasil_2013_2019():
    print("="*65)
    print("  INGESTÃO OFICIAL: COPA DO BRASIL (2013 A 2019)")
    print("="*65)

    YEARS = [2013, 2014, 2015, 2016, 2017, 2018, 2019]
    
    conn = sqlite3.connect(DB_LOCAL)
    c = conn.cursor()

    c.execute("SELECT MAX(id_partida) FROM partidas")
    next_pid = max(c.fetchone()[0] or 0, 202535000) + 1000

    total_jogos_atualizados = 0
    total_jogos_inseridos = 0
    total_gols_inseridos = 0
    total_cartoes_inseridos = 0

    for ano in YEARS:
        url = f"https://raw.githubusercontent.com/BrazilianFootball/Data/main/results/processed/CdB_{ano}_games.json"
        print(f"\n[+] Baixando Copa do Brasil {ano}...")
        r = requests.get(url, timeout=20)
        if r.status_code != 200:
            print(f"  -> Erro HTTP {r.status_code} ao baixar {url}")
            continue

        jogos = r.json()
        print(f"  -> {len(jogos)} partidas encontradas na súmula oficial da CBF.")

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

            # Busca partida existente
            c.execute("""
                SELECT id_partida, data, estadio FROM partidas
                WHERE ano = ? AND (campeonato LIKE '%Copa do Brasil%' OR campeonato = 'CdB')
                  AND ((mandante = ? AND visitante = ?) OR (mandante LIKE ? AND visitante LIKE ?))
            """, (ano, home, away, f"%{home[:5]}%", f"%{away[:5]}%"))
            row = c.fetchone()

            if not row:
                # Tenta busca resiliente por match_score
                c.execute("""
                    SELECT id_partida, mandante, visitante, data, estadio FROM partidas
                    WHERE ano = ? AND (campeonato LIKE '%Copa do Brasil%' OR campeonato = 'CdB')
                """, (ano,))
                for p in c.fetchall():
                    if match_score(home, p[1]) and match_score(away, p[2]):
                        row = (p[0], p[3], p[4])
                        break

            if row:
                pid = row[0]
                total_jogos_atualizados += 1
                if stadium and (not row[2] or row[2].strip() == ""):
                    c.execute("UPDATE partidas SET estadio = ?, horario = ? WHERE id_partida = ?", (stadium, hora, pid))
            else:
                pid = next_pid
                next_pid += 1
                total_jogos_inseridos += 1
                vencedor = home if gols_m > gols_v else (away if gols_v > gols_m else "Empate")
                c.execute("""
                    INSERT INTO partidas (
                        id_partida, ano, data, horario, estadio, mandante, visitante,
                        gols_mandante, gols_visitante, placar, vencedor, campeonato, formato
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Copa do Brasil', 'Mata-Mata')
                """, (pid, ano, data_iso, hora, stadium, home, away, gols_m, gols_v, placar_fmt, vencedor))

            # Remove gols ou cartões residuais para este jogo para evitar duplicação
            c.execute("DELETE FROM gols WHERE id_partida = ?", (pid,))
            c.execute("DELETE FROM cartoes WHERE id_partida = ?", (pid,))

            # 1. Inserir Gols
            for raw_gol in g.get("Goals", []):
                p_gol = parse_gol(raw_gol, home_raw, away_raw)
                if p_gol:
                    minuto, tempo, tipo_gol, atleta, clube_gol = p_gol
                    c.execute("""
                        INSERT INTO gols (id_partida, atleta, clube, minuto, tempo, tipo_de_gol)
                        VALUES (?, ?, ?, ?, ?, ?)
                    """, (pid, atleta, clube_gol, minuto, tempo, tipo_gol))
                    total_gols_inseridos += 1

            # 2. Inserir Cartões Amarelos
            for raw_card in g.get("Yellow cards", []):
                p_card = parse_cartao(raw_card, home_raw, away_raw, "Cartão Amarelo")
                if p_card:
                    minuto, tipo_card, atleta, clube_card = p_card
                    c.execute("""
                        INSERT INTO cartoes (id_partida, atleta, clube, cartao, minuto)
                        VALUES (?, ?, ?, ?, ?)
                    """, (pid, atleta, clube_card, tipo_card, minuto))
                    total_cartoes_inseridos += 1

            # 3. Inserir Cartões Vermelhos
            for raw_card in g.get("Red cards", []):
                p_card = parse_cartao(raw_card, home_raw, away_raw, "Cartão Vermelho")
                if p_card:
                    minuto, tipo_card, atleta, clube_card = p_card
                    c.execute("""
                        INSERT INTO cartoes (id_partida, atleta, clube, cartao, minuto)
                        VALUES (?, ?, ?, ?, ?)
                    """, (pid, atleta, clube_card, tipo_card, minuto))
                    total_cartoes_inseridos += 1

    conn.commit()
    print("\n" + "="*65)
    print("RELATÓRIO DA INGESTÃO:")
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
    importar_copa_do_brasil_2013_2019()
