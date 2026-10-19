"""
Importador de Gols do Brasileirão Série A (2014 a 2024)
======================================================
Fonte: Brasileirao_Dataset (Adão Duque)
Mapeia cada gol para a partida correspondente no futebol.db e insere na tabela `gols`.
"""

import io
import csv
import sqlite3
import requests
from datetime import datetime
from typing import Dict, Tuple

DB_LOCAL = "data/futebol.db"
DB_API = "api/data/futebol.db"

MAPA_NOMES = {
    "Atlético-MG": "Atlético-MG",
    "Atletico-MG": "Atlético-MG",
    "Atlético Mineiro": "Atlético-MG",
    "Athletico-PR": "Athletico-PR",
    "Atlético-PR": "Athletico-PR",
    "Atletico-PR": "Athletico-PR",
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
    "América-MG": "América-MG",
    "America-MG": "América-MG",
    "Vitória": "Vitória",
    "Vitoria": "Vitória",
    "Paraná": "Paraná",
    "Parana": "Paraná"
}

def normalizar_time(nome: str) -> str:
    n = nome.strip()
    return MAPA_NOMES.get(n, n)

def executar_importacao():
    print("=== BAIXANDO DATASET DE GOLS DO BRASILEIRÃO (2014-2024) ===")
    url_full = "https://raw.githubusercontent.com/adaoduque/Brasileirao_Dataset/master/campeonato-brasileiro-full.csv"
    url_gols = "https://raw.githubusercontent.com/adaoduque/Brasileirao_Dataset/master/campeonato-brasileiro-gols.csv"

    r_full = requests.get(url_full, timeout=15)
    partidas_csv = {}
    for row in csv.DictReader(io.StringIO(r_full.text)):
        dt_raw = row["data"].strip()
        try:
            dt_iso = datetime.strptime(dt_raw, "%d/%m/%Y").strftime("%Y-%m-%d")
        except Exception:
            dt_iso = dt_raw
        
        partidas_csv[row["ID"]] = {
            "data": dt_iso,
            "rodada": int(row.get("rodata", 0) or 0),
            "mandante": normalizar_time(row["mandante"]),
            "visitante": normalizar_time(row["visitante"])
        }

    print(f"Partidas carregadas do índice: {len(partidas_csv)}")

    r_gols = requests.get(url_gols, timeout=15)
    gols_csv = list(csv.DictReader(io.StringIO(r_gols.text)))
    print(f"Gols a processar: {len(gols_csv)}")

    # Indexa partidas do nosso banco futebol.db
    conn = sqlite3.connect(DB_LOCAL)
    conn.row_factory = sqlite3.Row
    c = conn.cursor()

    # Mapeia partidas por (data, mandante_prefix, visitante_prefix)
    db_partidas_map = {}
    for p in c.execute("SELECT id_partida, data, mandante, visitante FROM partidas WHERE ano >= 2014 AND campeonato LIKE '%Brasileiro%'"):
        k = (p["data"], p["mandante"][:4].lower(), p["visitante"][:4].lower())
        db_partidas_map[k] = p["id_partida"]

    # Identifica o próximo id_gol disponível
    c.execute("SELECT max(id_gol) FROM gols")
    max_id_gol = c.fetchone()[0] or 100000
    prox_id_gol = max_id_gol + 1

    # Carrega gols já existentes para deduplicação: (id_partida, atleta_lower, minuto)
    gols_existentes = set()
    for row in c.execute("SELECT id_partida, lower(atleta), minuto FROM gols WHERE id_partida IS NOT NULL"):
        gols_existentes.add((row[0], row[1], str(row[2])))

    conn.close()

    gols_para_inserir = []
    gols_sem_match = 0

    for g in gols_csv:
        p_info = partidas_csv.get(g["partida_id"])
        if not p_info:
            gols_sem_match += 1
            continue

        k = (p_info["data"], p_info["mandante"][:4].lower(), p_info["visitante"][:4].lower())
        id_partida = db_partidas_map.get(k)

        # Se não achou exato, tenta inverter se for o caso
        if not id_partida:
            k_inv = (p_info["data"], p_info["visitante"][:4].lower(), p_info["mandante"][:4].lower())
            id_partida = db_partidas_map.get(k_inv)

        if not id_partida:
            gols_sem_match += 1
            continue

        atleta = g["atleta"].strip()
        minuto = str(g["minuto"]).strip()
        clube = normalizar_time(g["clube"])
        tipo = g.get("tipo_de_gol", "").strip() or "Normal"
        tempo = "1T" if minuto.isdigit() and int(minuto) <= 45 else "2T"

        dedup_key = (id_partida, atleta.lower(), minuto)
        if dedup_key in gols_existentes:
            continue

        gols_existentes.add(dedup_key)
        gols_para_inserir.append((
            prox_id_gol, id_partida, p_info["rodada"], clube, atleta, minuto, tempo, tipo
        ))
        prox_id_gol += 1

    print(f"Gols mapeados e inéditos para inserção: {len(gols_para_inserir)} (Sem correspondência: {gols_sem_match})")

    # Inserção atômica em ambos os bancos
    for db_path in [DB_LOCAL, DB_API]:
        conn_db = sqlite3.connect(db_path)
        c_db = conn_db.cursor()
        c_db.executemany("""
            INSERT INTO gols (id_gol, id_partida, rodada, clube, atleta, minuto, tempo, tipo_de_gol)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, gols_para_inserir)
        conn_db.commit()
        conn_db.close()
        print(f" -> {db_path}: +{len(gols_para_inserir)} gols inseridos com sucesso!")

    # Exibe conferência para os principais atletas
    conn_chk = sqlite3.connect(DB_LOCAL)
    c_chk = conn_chk.cursor()
    print("\n=== CONFERÊNCIA PÓS-IMPORTAÇÃO ===")
    for atleta in ["Gabriel Barbosa", "Hulk", "Pedro", "Germán Cano", "Arrascaeta", "Dudu"]:
        c_chk.execute("SELECT count(*) FROM gols WHERE atleta LIKE ?", (f"%{atleta}%",))
        total = c_chk.fetchone()[0]
        print(f"  {atleta:<16}: {total:>3} gols catalogados no futebol.db")
    conn_chk.close()

if __name__ == "__main__":
    executar_importacao()
