"""
Scraper e Parser Inteligente para o RSSSF Brasil
================================================
Objetivo:
1. Extrair partidas históricas, resultados e autores de gols diretamente do RSSSF Brasil.
2. Canonicalizar nomes de clubes para os padrões do futebol.db.
3. Testar, validar e enriquecer partidas e a tabela 'gols' (como Pelé, Tostão, Zico, Dirceu Lopes, Ademir da Guia).
"""

import os
import re
import sys
import sqlite3
import unicodedata
import requests
from bs4 import BeautifulSoup
from typing import Dict, List, Tuple, Optional

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DB_PATH = os.path.join(BASE_DIR, "data", "futebol.db")

MESES_EN = {
    "jan": "01", "feb": "02", "mar": "03", "apr": "04",
    "may": "05", "jun": "06", "jul": "07", "aug": "08",
    "sep": "09", "oct": "10", "nov": "11", "dec": "12"
}

# Tabela de normalização para os clubes brasileiros mais comuns
MAPA_CANONICO = {
    "america": "América-RJ",
    "americarj": "América-RJ",
    "americagb": "América-RJ",
    "americamg": "América-MG",
    "atleticomg": "Atlético-MG",
    "atleticomineiro": "Atlético-MG",
    "atleticopr": "Athletico-PR",
    "athleticopr": "Athletico-PR",
    "atleticogo": "Atlético-GO",
    "bahia": "Bahia",
    "bangu": "Bangu",
    "botafogo": "Botafogo",
    "botafogofr": "Botafogo",
    "botafogosp": "Botafogo-SP",
    "ceara": "Ceará",
    "corinthians": "Corinthians",
    "coritiba": "Coritiba",
    "cruzeiro": "Cruzeiro",
    "ferroviariopr": "Ferroviário-PR",
    "ferroviario": "Ferroviário-PR",
    "flamengo": "Flamengo",
    "fluminense": "Fluminense",
    "gremio": "Grêmio",
    "guarani": "Guarani",
    "internacional": "Internacional",
    "inter": "Internacional",
    "joinville": "Joinville",
    "nautico": "Náutico",
    "palmeiras": "Palmeiras",
    "pontepreta": "Ponte Preta",
    "portuguesa": "Portuguesa",
    "portuguesadedesportos": "Portuguesa",
    "santacruz": "Santa Cruz",
    "santos": "Santos",
    "saopaulo": "São Paulo",
    "sport": "Sport",
    "sportrecife": "Sport",
    "vasco": "Vasco",
    "vascodagama": "Vasco",
    "vitoria": "Vitória"
}

def clean_key(s: str) -> str:
    s = unicodedata.normalize("NFKD", s).encode("ASCII", "ignore").decode("utf-8")
    s = re.sub(r"[^a-zA-Z0-9]", "", s).lower()
    return s

def normalizar_clube(nome: str) -> str:
    # Remove sufixos como FC, SC, FR, EC, FBPA e cidades entre parênteses
    nome_sem_parenteses = re.sub(r"\(.*?\)", "", nome).strip()
    k = clean_key(nome_sem_parenteses)
    if k in MAPA_CANONICO:
        return MAPA_CANONICO[k]
    # Fallback procurando prefixo comum
    for prefix in ["corinthians", "palmeiras", "saopaulo", "santos", "flamengo", "fluminense", "vasco", "botafogo", "cruzeiro", "gremio", "internacional", "bahia", "coritiba", "santacruz", "sport"]:
        if k.startswith(prefix):
            return MAPA_CANONICO[prefix]
    return nome_sem_parenteses

def baixar_pagina_rsssf(url: str) -> str:
    resp = requests.get(url, timeout=15)
    resp.raise_for_status()
    # RSSSF usa latin1 / ISO-8859-1
    return resp.content.decode("latin1", errors="replace")

def parsear_gols_texto(linha_gols: str, gols_m: int, gols_v: int) -> Tuple[List[Tuple[str, int, bool]], List[Tuple[str, int, bool]]]:
    """
    Interpreta o texto dos gols: [ScorerA (2), ScorerB; ScorerC, ScorerD (contra)]
    Retorna (gols_mandante, gols_visitante) com lista de (nome_atleta, qtd_gols, eh_contra)
    """
    gols_mandante = []
    gols_visitante = []
    
    def extrair_artilheiros(bloco: str) -> List[Tuple[str, int, bool]]:
        itens = []
        nomes_brutos = re.split(r",|\be\b", bloco)
        for nb in nomes_brutos:
            nb = nb.strip()
            if not nb:
                continue
            
            eh_contra = False
            if "own goal" in nb.lower() or "contra" in nb.lower():
                eh_contra = True
                nb = re.sub(r"\(.*?\)", "", nb).strip()
            
            # Checa se tem multiplicador como (2) ou -2
            qtd = 1
            mult_m = re.search(r"\((\d+)\)|-(\d+)", nb)
            if mult_m:
                qtd = int(mult_m.group(1) or mult_m.group(2))
                nb = re.sub(r"\((\d+)\)|-(\d+)", "", nb).strip()
            
            nome_limpo = re.sub(r"[\(\)\[\]]", "", nb).strip()
            if nome_limpo:
                itens.append((nome_limpo, qtd, eh_contra))
        return itens

    # Se há ponto e vírgula, a divisão é explícita: Mandante ; Visitante
    if ";" in linha_gols:
        partes = linha_gols.split(";", 1)
        gols_mandante = extrair_artilheiros(partes[0])
        gols_visitante = extrair_artilheiros(partes[1])
    else:
        # Quando só um time marcou (ex: placar 1-0 ou 0-2) e não tem ';'
        artilheiros = extrair_artilheiros(linha_gols)
        if gols_m > 0 and gols_v == 0:
            gols_mandante = artilheiros
        elif gols_v > 0 and gols_m == 0:
            gols_visitante = artilheiros
        else:
            gols_mandante = artilheiros
        
    return gols_mandante, gols_visitante

def parsear_pagina_rsssf(html_text: str, ano_padrao: int) -> List[Dict]:
    """
    Lê o texto bruto do RSSSF e retorna uma lista de dicionários de partidas estruturadas.
    """
    soup = BeautifulSoup(html_text, "html.parser")
    raw_text = soup.get_text()
    
    date_en_pat = re.compile(r"\[(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+(\d+)\]", re.IGNORECASE)
    date_pt_pat = re.compile(r"(\d{2})\.(\d{2})\.(\d{4})")
    
    # Suporta "X-Y", "X - Y", "X x Y", "X:Y"
    match_pat = re.compile(r"^([A-Za-z\u00C0-\u00FF\.\-\s]+?)\s+(\d+)\s*(?:-|x|:)\s*(\d+)\s+([A-Za-z\u00C0-\u00FF\.\-\s]+)$", re.IGNORECASE)
    goals_bracket_pat = re.compile(r"^\s*\[(.*?)\]\s*$")
    
    linhas = raw_text.splitlines()
    data_atual = None
    partidas = []
    
    i = 0
    while i < len(linhas):
        linha = linhas[i].strip()
        if not linha:
            i += 1
            continue
            
        m_en = date_en_pat.search(linha)
        if m_en:
            mes = MESES_EN.get(m_en.group(1).lower(), "01")
            dia = f"{int(m_en.group(2)):02d}"
            data_atual = f"{ano_padrao}-{mes}-{dia}"
            i += 1
            continue
            
        m_pt = date_pt_pat.search(linha)
        if m_pt:
            dia, mes, ano = m_pt.groups()
            data_atual = f"{ano}-{mes}-{dia}"
            i += 1
            continue
            
        m_partida = match_pat.match(linha)
        if m_partida and data_atual:
            mandante_raw = m_partida.group(1).strip()
            gols_m = int(m_partida.group(2))
            gols_v = int(m_partida.group(3))
            visitante_raw = m_partida.group(4).strip()
            
            # Descarta linhas que pareçam cabeçalhos de tabela (ex: 1.Palmeiras 19 8 6 5 20-14 22)
            if re.match(r"^\d+\.", mandante_raw) or any(w in mandante_raw.lower() for w in ["table", "round", "group", "phase", "qualified"]):
                i += 1
                continue
                
            mandante = normalizar_clube(mandante_raw)
            visitante = normalizar_clube(visitante_raw)
            
            gols_m_list = []
            gols_v_list = []
            
            # Espia até 3 linhas seguintes buscando a linha de autores de gols [...]
            offset = 1
            while i + offset < len(linhas):
                prox = linhas[i + offset].strip()
                if not prox:
                    offset += 1
                    continue
                g_m = goals_bracket_pat.match(prox)
                if g_m:
                    gols_m_list, gols_v_list = parsear_gols_texto(g_m.group(1), gols_m, gols_v)
                    i += offset
                break
            
            partidas.append({
                "ano": ano_padrao,
                "data": data_atual,
                "mandante": mandante,
                "visitante": visitante,
                "gols_mandante": gols_m,
                "gols_visitante": gols_v,
                "artilheiros_mandante": gols_m_list,
                "artilheiros_visitante": gols_v_list
            })
            
        i += 1
        
    return partidas

def validar_com_banco(partidas_scraped: List[Dict], ano: int, campeonato_filtro: str = "%Brasileiro%") -> Dict:
    """
    Compara o que foi extraído com o que já temos no banco para validar integridade e correspondência.
    """
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    c = conn.cursor()
    
    c.execute("""
        SELECT id_partida, data, mandante, visitante, gols_mandante, gols_visitante
        FROM partidas
        WHERE ano = ? AND campeonato LIKE ?
    """, (ano, campeonato_filtro))
    db_matches = c.fetchall()
    
    db_dict = {}
    for r in db_matches:
        chave = (r["data"], normalizar_clube(r["mandante"]), normalizar_clube(r["visitante"]))
        db_dict[chave] = dict(r)
        
    encontrados = 0
    placares_iguais = 0
    novos = 0
    gols_extraiveis = 0
    
    for p in partidas_scraped:
        chave = (p["data"], p["mandante"], p["visitante"])
        qtd_gols = sum(q for _, q, _ in p["artilheiros_mandante"]) + sum(q for _, q, _ in p["artilheiros_visitante"])
        gols_extraiveis += qtd_gols
        
        if chave in db_dict:
            encontrados += 1
            db_p = db_dict[chave]
            if db_p["gols_mandante"] == p["gols_mandante"] and db_p["gols_visitante"] == p["gols_visitante"]:
                placares_iguais += 1
        else:
            novos += 1
            
    conn.close()
    
    return {
        "ano": ano,
        "total_scraped": len(partidas_scraped),
        "total_banco": len(db_matches),
        "matches_encontrados": encontrados,
        "placares_100_consistentes": placares_iguais,
        "partidas_novas_possiveis": novos,
        "total_gols_com_autor": gols_extraiveis
    }

if __name__ == "__main__":
    print("=== TESTE DO SCRAPER INTELIGENTE RSSSF BRASIL ===")
    
    # 1. Testando Brasileirão 1971
    url_1971 = "https://rsssfbrasil.com/tablesae/br1971.htm"
    print(f"\n1. Baixando e validando Brasileirão 1971...")
    html_1971 = baixar_pagina_rsssf(url_1971)
    jogos_1971 = parsear_pagina_rsssf(html_1971, 1971)
    val_1971 = validar_com_banco(jogos_1971, 1971, "%Brasileiro%")
    
    print("\n[RESULTADO DA VALIDAÇÃO - BRASILEIRÃO 1971]")
    for k, v in val_1971.items():
        print(f" - {k}: {v}")
        
    # 2. Testando Robertão 1967
    url_1967 = "https://rsssfbrasil.com/tablesr/rgp1967.htm"
    print(f"\n2. Baixando e validando Robertão 1967 (Torneio Roberto Gomes Pedrosa)...")
    html_1967 = baixar_pagina_rsssf(url_1967)
    jogos_1967 = parsear_pagina_rsssf(html_1967, 1967)
    val_1967 = validar_com_banco(jogos_1967, 1967, "%Roberto Gomes Pedrosa%")
    
    print("\n[RESULTADO DA VALIDAÇÃO - ROBERTÃO 1967]")
    for k, v in val_1967.items():
        print(f" - {k}: {v}")
        
    print("\nExemplo de confrontos extraídos com autores de gols:")
    for j in [jogos_1971[0], jogos_1971[1], jogos_1967[0], jogos_1967[1]]:
        print(f" -> {j['data']} | {j['mandante']} {j['gols_mandante']}x{j['gols_visitante']} {j['visitante']}")
        if j['artilheiros_mandante']:
            print(f"    Gols {j['mandante']}: {j['artilheiros_mandante']}")
        if j['artilheiros_visitante']:
            print(f"    Gols {j['visitante']}: {j['artilheiros_visitante']}")
