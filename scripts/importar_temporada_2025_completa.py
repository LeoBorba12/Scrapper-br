"""
Importador Completo da Temporada 2025 (Série A, Série B e Copa do Brasil)
========================================================================
Fonte: Súmulas Eletrônicas Oficiais da CBF (via BrazilianFootball/Data)
- Popula gols, minutos exatos, cartões amarelos/vermelhos e escalações completas de 2025.
- Mapeia nomes completos oficiais para os nomes canônicos e OGol IDs dos atletas.
- Atualiza data/futebol.db e api/data/futebol.db.
"""

import os
import re
import sys
import shutil
import sqlite3
import requests
from typing import Dict, Tuple, Optional

DB_LOCAL = "data/futebol.db"
DB_API = "api/data/futebol.db"

# Normalização de Clubes CBF -> Padrão Canônico
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
    "Avaí": "Avaí",
    "Avai": "Avaí",
    "Cuiabá": "Cuiabá",
    "Cuiaba": "Cuiabá",
    "América Mineiro": "América-MG",
    "América-MG": "América-MG",
    "Vitória": "Vitória",
    "Vitoria": "Vitória",
    "Coritiba": "Coritiba",
    "Chapecoense": "Chapecoense",
    "Juventude": "Juventude",
    "Fortaleza": "Fortaleza",
    "Bahia": "Bahia",
    "Cruzeiro": "Cruzeiro",
    "Internacional": "Internacional",
    "Flamengo": "Flamengo",
    "Fluminense": "Fluminense",
    "Botafogo": "Botafogo",
    "Vasco da Gama": "Vasco",
    "Vasco": "Vasco",
    "Santos": "Santos",
    "Palmeiras": "Palmeiras",
    "Corinthians": "Corinthians",
    "Red Bull Bragantino": "Red Bull Bragantino",
    "Mirassol": "Mirassol",
    "Sport": "Sport",
    "Operário Ferroviário": "Operário-PR",
    "Operário-PR": "Operário-PR",
    "Novorizontino": "Novorizontino"
}

# Mapeamento de Nome Completo da Súmula CBF -> Nome Canônico do Sistema
MAPA_ATLETAS_CANONICO = {
    "gabriel barbosa almeida": "Gabriel Barbosa",
    "gabriel barbosa": "Gabriel Barbosa",
    "giorgian daniel de arrascaeta benedetti": "Arrascaeta",
    "giorgian de arrascaeta": "Arrascaeta",
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
    "pablo ezequiel vegetti": "Pablo Vegetti",
    "lucas rodrigues moura da silva": "Lucas Moura",
    "bruno henrique pinto": "Bruno Henrique",
    "luiz de araujo guimaraes neto": "Luiz Araújo",
    "nicolas de la cruz arcosa": "Nicolás de la Cruz",
    "diego nicolas de la cruz arcosa": "Nicolás de la Cruz",
    "alan patrick lourenco": "Alan Patrick",
    "alan patrick lourenço": "Alan Patrick",
    "ronielson da silva barbosa": "Rony",
    "mateo gamarra gonzalez": "Mateo Gamarra",
    "leonardo pereira": "Léo Pereira",
    "leonardo rech ortiz": "Léo Ortiz",
    "agustin daniel rossi": "Agustín Rossi",
    "carlos vinicius da silva santos": "Carlos Vinícius",
    "kaio jorge pinto ramos": "Kaio Jorge",
    "vitor hugo roque ferreira": "Vitor Roque",
    "estevao willian almeida de oliveira goncalves": "Estêvão",
    "estêvão willian almeida de oliveira gonçalves": "Estêvão"
}

def normalizar_clube(c: str) -> str:
    c = c.split('/')[0].strip()
    c = re.sub(r'\s+saf$', '', c, flags=re.I)
    c = re.sub(r'\s+s\.a\.f\.$', '', c, flags=re.I)
    c = re.sub(r'\s+fc$', '', c, flags=re.I)
    c = re.sub(r'\s+f\.c\.$', '', c, flags=re.I)
    return MAPA_CLUBES.get(c, c)

def normalizar_atleta(nome: str, clube: str = "") -> str:
    n_lower = nome.lower().strip()
    # Remove acentos para matching no mapa
    import unicodedata
    n_sem_acento = "".join(c for c in unicodedata.normalize('NFD', n_lower) if unicodedata.category(c) != 'Mn')
    
    if n_sem_acento in MAPA_ATLETAS_CANONICO:
        return MAPA_ATLETAS_CANONICO[n_sem_acento]
    if n_lower in MAPA_ATLETAS_CANONICO:
        return MAPA_ATLETAS_CANONICO[n_lower]
    
    # Tratamento específico para Gabriel e Paulinho
    if "gabriel barbosa" in n_sem_acento or (n_sem_acento == "gabriel" and clube in ("Santos", "Flamengo", "Cruzeiro")):
        return "Gabriel Barbosa"
    if n_sem_acento == "paulinho":
        if clube in ("Atlético-MG", "Vasco"):
            return "Paulinho (Atlético-MG)"
        elif "corinthians" in clube.lower():
            return "Paulinho (Corinthians)"
        return f"Paulinho ({clube})"
    
    return nome.strip()

def parse_gol(s: str, home_raw: str, away_raw: str):
    s = s.strip()
    m = re.match(r'^([+\d:]+)\s*(\d[T|P])\s*(\d*)(NR|PN|CT)(.+)$', s)
    if not m:
        return None
    minuto = m.group(1) + ' ' + m.group(2)
    tipo = {'NR': 'Gol Normal', 'PN': 'Gol de Pênalti', 'CT': 'Gol Contra'}.get(m.group(4), 'Gol Normal')
    rest = m.group(5).strip()

    h_norm = normalizar_clube(home_raw)
    a_norm = normalizar_clube(away_raw)

    h_core = home_raw.split('/')[0].split()[0].lower()
    a_core = away_raw.split('/')[0].split()[0].lower()

    if h_core in rest.lower():
        clube = h_norm
        idx = rest.lower().rfind(h_core)
        atleta = rest[:idx].strip()
    elif a_core in rest.lower():
        clube = a_norm
        idx = rest.lower().rfind(a_core)
        atleta = rest[:idx].strip()
    else:
        clube = h_norm
        atleta = rest

    return minuto, tipo, normalizar_atleta(atleta, clube), clube

def parse_cartao(s: str, home_raw: str, away_raw: str, tipo_cartao: str):
    s = s.strip()
    m = re.match(r'^([+\d:]+)\s*(\d[T|P])\s*(\d*)(.+)$', s)
    if not m:
        return None
    minuto = m.group(1) + ' ' + m.group(2)
    rest = m.group(4).strip()

    h_norm = normalizar_clube(home_raw)
    a_norm = normalizar_clube(away_raw)

    h_core = home_raw.split('/')[0].split()[0].lower()
    a_core = away_raw.split('/')[0].split()[0].lower()

    if h_core in rest.lower():
        clube = h_norm
        idx = rest.lower().rfind(h_core)
        atleta = rest[:idx].strip()
    elif a_core in rest.lower():
        clube = a_norm
        idx = rest.lower().rfind(a_core)
        atleta = rest[:idx].strip()
    else:
        clube = h_norm
        atleta = rest

    return minuto, tipo_cartao, normalizar_atleta(atleta, clube), clube

def parse_escalacao(item: list, home_raw: str, away_raw: str):
    # item = ['1ROSSI Agustin Daniel Rossi T(g)P815100', 'Flamengo / RJ']
    if len(item) < 2:
        return None
    raw_p = item[0].strip()
    raw_c = item[1].strip()
    clube = normalizar_clube(raw_c)

    # Titular vs Reserva
    titular = 1 if ' T(' in raw_p or raw_p.endswith(' T') or ' TP' in raw_p or ' T(g)' in raw_p else 0
    is_goleiro = 1 if '(g)' in raw_p else 0

    # Extrai camisa
    m_num = re.match(r'^(\d+)', raw_p)
    num_camisa = m_num.group(1) if m_num else None

    # Limpa código BID do final: '... P815100'
    limpo = re.sub(r'\s*T(\(g\))?P\d+.*$', '', raw_p)
    limpo = re.sub(r'\s*R(\(g\))?P\d+.*$', '', limpo)
    limpo = re.sub(r'^\d+', '', limpo).strip()

    atleta = normalizar_atleta(limpo, clube)
    return num_camisa, atleta, clube, titular, is_goleiro

def executar_ingestao_2025():
    print("==================================================================")
    print("  INGESTÃO COMPLETA 2025: SÉRIE A, COPA DO BRASIL E SÉRIE B       ")
    print("==================================================================")

    DATASETS = [
        ("Campeonato Brasileiro Série A", "https://raw.githubusercontent.com/BrazilianFootball/Data/main/results/processed/Serie_A_2025_games.json"),
        ("Copa do Brasil", "https://raw.githubusercontent.com/BrazilianFootball/Data/main/results/processed/CdB_2025_games.json"),
        ("Campeonato Brasileiro Série B", "https://raw.githubusercontent.com/BrazilianFootball/Data/main/results/processed/Serie_B_2025_games.json")
    ]

    conn = sqlite3.connect(DB_LOCAL)
    c = conn.cursor()

    # Limpa dados anteriores de 2025 para carga 100% limpa e sem duplicações
    print("\n[1/4] Limpando registros residuais de 2025 para recriação limpa...")
    c.execute("DELETE FROM gols WHERE id_partida IN (SELECT id_partida FROM partidas WHERE ano = 2025)")
    c.execute("DELETE FROM cartoes WHERE id_partida IN (SELECT id_partida FROM partidas WHERE ano = 2025)")
    c.execute("DELETE FROM escalacoes WHERE id_partida IN (SELECT id_partida FROM partidas WHERE ano = 2025)")

    total_gols = 0
    total_amarelos = 0
    total_vermelhos = 0
    total_escalacoes = 0
    total_partidas_processadas = 0

    for nome_torneio, url in DATASETS:
        print(f"\n[2/4] Baixando e processando {nome_torneio} (2025)...")
        r = requests.get(url, timeout=20)
        if r.status_code != 200:
            print(f" -> Falha ao baixar {url} (status {r.status_code})")
            continue
        jogos_dict = r.json()
        print(f" -> {len(jogos_dict)} partidas na súmula oficial da CBF.")

        for gid, g in jogos_dict.items():
            total_partidas_processadas += 1
            d_raw = g.get("Date", "").strip()
            if d_raw:
                parts = d_raw.split("/")
                d_iso = f"{parts[2]}-{parts[1]}-{parts[0]}" if len(parts) == 3 else d_raw
            else:
                d_iso = None

            home_raw = g.get("Home", "").strip()
            away_raw = g.get("Away", "").strip()
            mandante = normalizar_clube(home_raw)
            visitante = normalizar_clube(away_raw)
            estadio = g.get("Stadium", "").split("/")[0].strip() if g.get("Stadium") else None
            placar = g.get("Result", "0 X 0").replace("X", "x").strip()

            # Resolução do id_partida
            pid = None
            if d_iso:
                c.execute("""
                    SELECT id_partida FROM partidas 
                    WHERE data = ? AND mandante LIKE ? AND visitante LIKE ?
                    LIMIT 1
                """, (d_iso, f"%{mandante[:5]}%", f"%{visitante[:5]}%"))
                row = c.fetchone()
                if row:
                    pid = row[0]
                    # Atualiza estádio se vazio
                    if estadio:
                        c.execute("UPDATE partidas SET estadio = COALESCE(estadio, ?) WHERE id_partida = ?", (estadio, pid))

            if not pid:
                # Insere nova partida
                c.execute("""
                    INSERT INTO partidas (ano, data, mandante, visitante, placar, estadio, campeonato)
                    VALUES (2025, ?, ?, ?, ?, ?, ?)
                """, (d_iso, mandante, visitante, placar, estadio, f"{nome_torneio} 2025"))
                pid = c.lastrowid

            # 1. Inserir Gols
            for gol_raw in g.get("Goals", []):
                p_gol = parse_gol(gol_raw, home_raw, away_raw)
                if p_gol:
                    minuto, tipo_gol, atleta, clube_gol = p_gol
                    c.execute("""
                        INSERT INTO gols (id_partida, atleta, clube, minuto, tipo_de_gol)
                        VALUES (?, ?, ?, ?, ?)
                    """, (pid, atleta, clube_gol, minuto, tipo_gol))
                    total_gols += 1

            # 2. Inserir Cartões Amarelos
            for cartao_raw in g.get("Yellow cards", []):
                p_card = parse_cartao(cartao_raw, home_raw, away_raw, "Cartão Amarelo")
                if p_card:
                    minuto, tipo_card, atleta, clube_card = p_card
                    c.execute("""
                        INSERT INTO cartoes (id_partida, atleta, clube, cartao, minuto)
                        VALUES (?, ?, ?, ?, ?)
                    """, (pid, atleta, clube_card, tipo_card, minuto))
                    total_amarelos += 1

            # 3. Inserir Cartões Vermelhos
            for cartao_raw in g.get("Red cards", []):
                p_card = parse_cartao(cartao_raw, home_raw, away_raw, "Cartão Vermelho")
                if p_card:
                    minuto, tipo_card, atleta, clube_card = p_card
                    c.execute("""
                        INSERT INTO cartoes (id_partida, atleta, clube, cartao, minuto)
                        VALUES (?, ?, ?, ?, ?)
                    """, (pid, atleta, clube_card, tipo_card, minuto))
                    total_vermelhos += 1

            # 4. Inserir Escalações
            for esc_item in g.get("Players", []):
                p_esc = parse_escalacao(esc_item, home_raw, away_raw)
                if p_esc:
                    num_camisa, atleta, clube_esc, titular, is_goleiro = p_esc
                    c.execute("""
                        INSERT INTO escalacoes (id_partida, atleta, clube, num_camisa, titular, is_goleiro)
                        VALUES (?, ?, ?, ?, ?, ?)
                    """, (pid, atleta, clube_esc, num_camisa, titular, is_goleiro))
                    total_escalacoes += 1

    conn.commit()
    print(f"\n[3/4] Carga concluída com sucesso:")
    print(f" -> {total_partidas_processadas} partidas consolidadas")
    print(f" -> {total_gols} gols inseridos")
    print(f" -> {total_amarelos} cartões amarelos inseridos")
    print(f" -> {total_vermelhos} cartões vermelhos inseridos")
    print(f" -> {total_escalacoes} escalações de atletas registradas")

    # 4. Reconstrução de jogadores_resumo
    print("\n[4/4] Recalculando jogadores_resumo e sincronizando bancos...")
    c.execute("DROP TABLE IF EXISTS jogadores_resumo")
    c.execute("""
        CREATE TABLE jogadores_resumo (
            nome TEXT PRIMARY KEY,
            clubes TEXT,
            total_jogos INTEGER,
            total_gols INTEGER,
            total_assistencias INTEGER DEFAULT 0,
            total_amarelos INTEGER,
            total_vermelhos INTEGER,
            ano_min INTEGER,
            ano_max INTEGER
        )
    """)

    c.execute("""
        INSERT INTO jogadores_resumo (nome, clubes, total_jogos, total_gols, total_amarelos, total_vermelhos, ano_min, ano_max)
        SELECT 
            atleta,
            GROUP_CONCAT(DISTINCT clube) as clubes,
            COUNT(DISTINCT id_partida) as total_jogos,
            COUNT(*) as total_gols,
            0 as total_amarelos,
            0 as total_vermelhos,
            MIN(ano) as ano_min,
            MAX(ano) as ano_max
        FROM (
            SELECT g.atleta, g.clube, g.id_partida, p.ano
            FROM gols g
            JOIN partidas p ON g.id_partida = p.id_partida
            WHERE g.atleta IS NOT NULL AND g.atleta != ''
        )
        GROUP BY atleta
    """)

    # Atualiza cartões amarelos e vermelhos a partir de cartoes
    c.execute("""
        UPDATE jogadores_resumo
        SET total_amarelos = COALESCE((
            SELECT COUNT(*) FROM cartoes 
            WHERE cartoes.atleta = jogadores_resumo.nome AND cartao LIKE '%Amarelo%'
        ), 0),
        total_vermelhos = COALESCE((
            SELECT COUNT(*) FROM cartoes 
            WHERE cartoes.atleta = jogadores_resumo.nome AND cartao LIKE '%Vermelho%'
        ), 0)
    """)

    # Atualiza assistências a partir da tabela mestra de jogadores
    c.execute("""
        UPDATE jogadores_resumo
        SET total_assistencias = (
            SELECT total_assistencias FROM jogadores 
            WHERE jogadores.nome_exibicao = jogadores_resumo.nome 
               OR jogadores.nome_completo = jogadores_resumo.nome
            LIMIT 1
        )
        WHERE EXISTS (
            SELECT 1 FROM jogadores 
            WHERE jogadores.nome_exibicao = jogadores_resumo.nome 
               OR jogadores.nome_completo = jogadores_resumo.nome
        )
    """)

    # Limpeza de homônimos
    c.execute("DELETE FROM jogadores_resumo WHERE nome = 'Paulinho'")
    c.execute("DELETE FROM jogadores_resumo WHERE nome LIKE 'Paulinho %'''")
    c.execute("DELETE FROM jogadores_resumo WHERE nome LIKE 'Paulinho Jose Paulo%'")
    c.execute("DELETE FROM jogadores_resumo WHERE nome LIKE 'Paulinho Paulo Henrique%'")

    conn.commit()
    conn.close()

    # Copia para api/data/futebol.db
    shutil.copyfile(DB_LOCAL, DB_API)
    print(f" -> Banco copiado com sucesso para {DB_API}")

    print("\n==================================================================")
    print("  TEMPORADA 2025 CONCLUÍDA E SINCRONIZADA!                       ")
    print("==================================================================")

if __name__ == "__main__":
    executar_ingestao_2025()
