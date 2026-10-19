"""
Importador dos Jogos Iniciais da Copa do Brasil 2021 (Fases 1, 2 e 3)
=====================================================================
Completa a edição de 2021 da Copa do Brasil a partir de Brazilian_Cup_Matches.csv,
inserindo as 92 partidas das fases eliminatórias iniciais (março a junho de 2021)
que estavam ausentes na base de dados.
"""

import os
import re
import csv
import sqlite3
import unicodedata
from typing import Dict, List, Tuple

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DB_LOCAL = os.path.join(BASE_DIR, "data", "futebol.db")
DB_API = os.path.join(BASE_DIR, "api", "data", "futebol.db")
CSV_PATH = r"c:\Users\leona\AppData\Local\Temp\Brazilian_Cup_Matches.csv"

# Normalização canônica para nomes de clubes na Copa do Brasil
MAPA_CANONICO = {
    "America - MG": "América-MG",
    "América - MG": "América-MG",
    "América - RN": "América-RN",
    "Athletico Paranaense - PR": "Athletico-PR",
    "Atlético - GO": "Atlético-GO",
    "Atlético - AC": "Atlético-AC",
    "Atlético - BA": "Atlético-BA",
    "Atlético Mineiro - MG": "Atlético-MG",
    "Avaí - SC": "Avaí",
    "Bahia - BA": "Bahia",
    "Boavista - RJ": "Boavista",
    "Botafogo - RJ": "Botafogo",
    "Brasiliense - DF": "Brasiliense",
    "Brusque - SC": "Brusque",
    "Caldense - MG": "Caldense",
    "Campinense - PB": "Campinense",
    "Castanhal - PA": "Castanhal",
    "Caxias - RS": "Caxias",
    "Ceará - CE": "Ceará",
    "Chapecoense - SC": "Chapecoense",
    "Cianorte - PR": "Cianorte",
    "Confiança - SE": "Confiança",
    "Corinthians - SP": "Corinthians",
    "Coritiba - PR": "Coritiba",
    "CRB - AL": "CRB",
    "Criciúma - SC": "Criciúma",
    "Cruzeiro - MG": "Cruzeiro",
    "CSA - AL": "CSA",
    "Cuiabá - MT": "Cuiabá",
    "Esportivo - RS": "Esportivo",
    "Fast Clube - AM": "Fast Clube",
    "Fc Cascavel - PR": "Cascavel",
    "Ferroviária - SP": "Ferroviária",
    "Ferroviário - CE": "Ferroviário-CE",
    "Figueirense - SC": "Figueirense",
    "Flamengo - RJ": "Flamengo",
    "Fluminense - RJ": "Fluminense",
    "Fortaleza - CE": "Fortaleza",
    "Galvez - AC": "Galvez",
    "Gama - DF": "Gama",
    "Goianesia - GO": "Goianésia",
    "Goiás - GO": "Goiás",
    "Grêmio - RS": "Grêmio",
    "Guarani - SP": "Guarani",
    "Guarany de Sobral - CE": "Guarany de Sobral",
    "Inter de Limeira - SP": "Inter de Limeira",
    "Internacional - RS": "Internacional",
    "Jaraguá - GO": "Jaraguá",
    "Joinville - SC": "Joinville",
    "Juazeirense - BA": "Juazeirense",
    "Juventude - RS": "Juventude",
    "Luverdense - MT": "Luverdense",
    "Madureira - RJ": "Madureira",
    "Manaus - AM": "Manaus",
    "Marilia - SP": "Marília",
    "Mirassol - SP": "Mirassol",
    "Moto Club - MA": "Moto Club",
    "Murici - AL": "Murici",
    "Nova Mutum - MT": "Nova Mutum",
    "Novorizontino - SP": "Novorizontino",
    "Operário - PR": "Operário-PR",
    "Palmas Ltda - TO": "Palmas",
    "Palmeiras - SP": "Palmeiras",
    "Paraná - PR": "Paraná",
    "Paysandu - PA": "Paysandu",
    "Picos - PI": "Picos",
    "Ponte Preta - SP": "Ponte Preta",
    "Porto Velho - RO": "Porto Velho",
    "Pouso Alegre - MG": "Pouso Alegre",
    "Real Brasília - DF": "Real Brasília",
    "Remo - PA": "Remo",
    "Retrô - PE": "Retrô",
    "Rio Branco - ES": "Rio Branco-ES",
    "Rio Branco - Vn - ES": "Rio Branco-VN",
    "Sampaio Corrêa - MA": "Sampaio Corrêa",
    "Santa Cruz - PE": "Santa Cruz",
    "Santos - SP": "Santos",
    "São Paulo - SP": "São Paulo",
    "São Raimundo - RR": "São Raimundo-RR",
    "Sergipe - SE": "Sergipe",
    "Sport - PE": "Sport",
    "Tombense - MG": "Tombense",
    "Treze - PB": "Treze",
    "Uberlândia - MG": "Uberlândia",
    "União - MT": "União Rondonópolis",
    "Vasco da Gama - RJ": "Vasco",
    "Vila Nova - GO": "Vila Nova",
    "Vitória - BA": "Vitória",
    "Volta Redonda - RJ": "Volta Redonda",
    "Ypiranga - RS": "Ypiranga-RS",
    "Águia Negra - MS": "Águia Negra",
    "4 de Julho - PI": "4 de Julho",
    "Abc - RN": "ABC"
}

def normalizar_clube(nome_csv: str) -> str:
    n = nome_csv.strip()
    if n in MAPA_CANONICO:
        return MAPA_CANONICO[n]
    # se tiver formato "Time - UF", remove UF caso não esteja mapeado
    m = re.match(r"^(.*?)\s*-\s*[A-Z]{2}$", n)
    if m:
        base = m.group(1).strip()
        return MAPA_CANONICO.get(base, base)
    return n

def obter_fase_nome(rodada_csv: str) -> str:
    mapa = {
        "1": "1ª Fase",
        "2": "2ª Fase",
        "3": "3ª Fase"
    }
    return mapa.get(rodada_csv, f"{rodada_csv}ª Fase")

def importar_jogos_cdb_2021(db_path: str) -> int:
    if not os.path.exists(db_path):
        print(f"[AVISO] Banco não encontrado em {db_path}")
        return 0
        
    conn = sqlite3.connect(db_path)
    c = conn.cursor()
    
    # Busca partidas já existentes da Copa do Brasil 2021 para evitar qualquer duplicidade
    c.execute("SELECT data, mandante, visitante FROM partidas WHERE campeonato = 'Copa do Brasil' AND ano = 2021")
    existentes = set((r[0], r[1], r[2]) for r in c.fetchall())
    
    # ID sequencial seguro para as novas partidas
    c.execute("SELECT max(id_partida) FROM partidas WHERE campeonato = 'Copa do Brasil' AND ano = 2021")
    max_id_2021 = c.fetchone()[0] or 20215030
    proximo_id = max_id_2021 + 1
    
    inseridos = 0
    with open(CSV_PATH, "r", encoding="utf-8") as fp:
        reader = csv.DictReader(fp)
        for r in reader:
            if r.get("season") != "2021" or r.get("round") not in ["1", "2", "3"]:
                continue
                
            dt_raw = r.get("datetime", "")
            data_jogo = dt_raw[:10]
            horario_jogo = dt_raw[11:16] if len(dt_raw) >= 16 else None
            
            mandante = normalizar_clube(r["home_team"])
            visitante = normalizar_clube(r["away_team"])
            
            if (data_jogo, mandante, visitante) in existentes:
                continue
                
            gols_m = int(r["home_goal"])
            gols_v = int(r["away_goal"])
            
            placar_str = f"{gols_m} x {gols_v}"
            if gols_m > gols_v:
                vencedor = mandante
            elif gols_v > gols_m:
                vencedor = visitante
            else:
                vencedor = "Empate"
                
            fase = obter_fase_nome(r["round"])
            rodada = r["round"]
            
            c.execute("""
                INSERT INTO partidas (
                    id_partida, ano, rodada, data, horario,
                    mandante, visitante, gols_mandante, gols_visitante, placar,
                    vencedor, campeonato, formato, fase
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                proximo_id, 2021, rodada, data_jogo, horario_jogo,
                mandante, visitante, gols_m, gols_v, placar_str,
                vencedor, "Copa do Brasil", "Mata-mata", fase
            ))
            
            existentes.add((data_jogo, mandante, visitante))
            proximo_id += 1
            inseridos += 1
            
    conn.commit()
    conn.close()
    return inseridos

if __name__ == "__main__":
    print("=== IMPORTAÇÃO COPA DO BRASIL 2021 (FASES 1, 2 E 3) ===")
    
    qtd_local = importar_jogos_cdb_2021(DB_LOCAL)
    print(f" -> data/futebol.db: {qtd_local} partidas inseridas com sucesso.")
    
    qtd_api = importar_jogos_cdb_2021(DB_API)
    print(f" -> api/data/futebol.db: {qtd_api} partidas inseridas com sucesso.")
