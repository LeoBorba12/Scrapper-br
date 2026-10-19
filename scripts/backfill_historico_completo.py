"""
Pipeline de Backfill Histórico Completo de Clubes Brasileiros (1910 a 2026)
===========================================================================
Execução em duas fases encadeadas:
  Fase 1: Temporadas Recentes (2024, 2025, 2026) - Prioridade Imediata
  Fase 2: Temporadas Históricas (2023 regredindo até 1910) - Backfill Centenário

Recursos:
- Checkpoint automático (data/.backfill_checkpoint.json) para persistência e retomada
- Deduplicação bidirecional e atribuição de IDs idênticos entre data/futebol.db e api/data/futebol.db
- Flush contínuo de logs em tempo real
- Validação automática de integridade referencial e sanitização
"""

import os
import re
import sys
import json
import time
import sqlite3
import requests
from typing import Dict, List, Optional
from bs4 import BeautifulSoup

# Força flush de logs no terminal
sys.stdout.reconfigure(line_buffering=True)

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DB_LOCAL = os.path.join(BASE_DIR, "data", "futebol.db")
DB_API = os.path.join(BASE_DIR, "api", "data", "futebol.db")
CHECKPOINT_FILE = os.path.join(BASE_DIR, "data", ".backfill_checkpoint.json")

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept-Language": "pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7"
}

# 20 Maiores Clubes do Futebol Brasileiro
CLUBES_OGOL = {
    "flamengo": "Flamengo",
    "corinthians": "Corinthians",
    "palmeiras": "Palmeiras",
    "sao-paulo": "São Paulo",
    "santos": "Santos",
    "vasco": "Vasco",
    "fluminense": "Fluminense",
    "botafogo": "Botafogo",
    "cruzeiro": "Cruzeiro",
    "atletico-mineiro": "Atlético-MG",
    "internacional": "Internacional",
    "gremio": "Grêmio",
    "bahia": "Bahia",
    "fortaleza": "Fortaleza",
    "athletico-paranaense": "Athletico-PR",
    "vitoria": "Vitória",
    "coritiba": "Coritiba",
    "sport": "Sport",
    "goias": "Goiás",
    "ceara": "Ceará"
}

# Mapeamento e normalização canônica de adversários
MAPA_ADVERSARIOS = {
    "Athletico Paranaense": "Athletico-PR",
    "Atlético Paranaense": "Athletico-PR",
    "Atlético Mineiro": "Atlético-MG",
    "Atlético Goianiense": "Atlético-GO",
    "América Mineiro": "América-MG",
    "América de Natal": "América-RN",
    "Vasco": "Vasco",
    "Vasco da Gama": "Vasco",
    "São Paulo": "São Paulo",
    "Corinthians": "Corinthians",
    "Palmeiras": "Palmeiras",
    "Santos": "Santos",
    "Flamengo": "Flamengo",
    "Fluminense": "Fluminense",
    "Botafogo": "Botafogo",
    "Cruzeiro": "Cruzeiro",
    "Internacional": "Internacional",
    "Grêmio": "Grêmio",
    "Bahia": "Bahia",
    "Vitória": "Vitória",
    "Ceará": "Ceará",
    "Fortaleza": "Fortaleza",
    "Coritiba": "Coritiba",
    "Sport": "Sport",
    "Santa Cruz": "Santa Cruz",
    "Náutico": "Náutico",
    "Ponte Preta": "Ponte Preta",
    "Guarani": "Guarani",
    "Goiás": "Goiás",
    "Criciúma": "Criciúma",
    "Juventude": "Juventude",
    "Avaí": "Avaí",
    "Chapecoense": "Chapecoense",
    "Figueirense": "Figueirense",
    "Paraná": "Paraná"
}

def normalizar_time(nome: str) -> str:
    n = nome.strip()
    return MAPA_ADVERSARIOS.get(n, n)

def extrair_jogos_ogol(clube_slug: str, ano: int) -> List[Dict]:
    """
    Extrai todos os jogos de determinado ano com suporte a paginação dinâmica.
    """
    clube_nome = CLUBES_OGOL.get(clube_slug, clube_slug.title())
    jogos = []
    session = requests.Session()
    session.headers.update(HEADERS)

    url = f"https://www.ogol.com.br/equipe/{clube_slug}/todos-os-jogos?ano={ano}"
    pagina = 1

    while url:
        try:
            time.sleep(0.35)
            resp = session.get(url, timeout=12)
            if resp.status_code != 200:
                break

            soup = BeautifulSoup(resp.text, "html.parser")
            
            # Localiza dinamicamente a tabela com as partidas
            tabela_jogos = None
            for t in soup.find_all("table"):
                rows = t.find_all("tr")
                if len(rows) > 1:
                    sample_tds = [td.get_text(strip=True) for td in rows[1].find_all(["td", "th"])]
                    if len(sample_tds) >= 8 and re.match(r"^\d{4}-\d{2}-\d{2}$", sample_tds[1]):
                        tabela_jogos = t
                        break

            if not tabela_jogos:
                break

            rows = tabela_jogos.find_all("tr")
            jogos_nesta_pagina = 0
            for r in rows[1:]:
                tds = [td.get_text(strip=True) for td in r.find_all(["td", "th"])]
                if len(tds) < 8:
                    continue

                data_iso = tds[1].strip()
                if not re.match(r"^\d{4}-\d{2}-\d{2}$", data_iso):
                    continue

                horario = tds[2].strip() if tds[2] else None
                mando = tds[3].strip()  # (C) ou (F)
                adv_raw = tds[5].strip()
                adversario = normalizar_time(adv_raw)

                placar_raw = tds[6].strip()
                m_placar = re.search(r"^(\d+)\s*[-xX]\s*(\d+)", placar_raw)
                if not m_placar:
                    continue

                gols_1 = int(m_placar.group(1))
                gols_2 = int(m_placar.group(2))

                if mando == "(C)":
                    mandante = clube_nome
                    visitante = adversario
                    gm = gols_1
                    gv = gols_2
                else:
                    mandante = adversario
                    visitante = clube_nome
                    gm = gols_1
                    gv = gols_2

                placar_formatado = f"{gm} x {gv}"
                vencedor = mandante if gm > gv else (visitante if gv > gm else "Empate")
                competicao = tds[7].strip()

                jogos.append({
                    "ano": ano,
                    "data": data_iso,
                    "horario": horario,
                    "mandante": mandante,
                    "visitante": visitante,
                    "gols_mandante": gm,
                    "gols_visitante": gv,
                    "placar": placar_formatado,
                    "vencedor": vencedor,
                    "campeonato": competicao
                })
                jogos_nesta_pagina += 1

            if jogos_nesta_pagina == 0:
                break

            next_a = soup.find("a", class_="next-link")
            if next_a and next_a.get("href"):
                url = "https://www.ogol.com.br" + next_a["href"]
                pagina += 1
            else:
                url = None

        except Exception as e:
            # Continua sem travar o pipeline
            break

    return jogos

def aplicar_ao_banco(jogos: List[Dict], db_path: str) -> Dict[str, int]:
    """
    Aplica os jogos ao banco SQLite de forma idempotente e segura.
    Garante que os IDs sejam sincronizados entre as chamadas.
    """
    if not os.path.exists(db_path):
        return {"inseridos": 0, "atualizados": 0}

    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    c = conn.cursor()

    c.execute("SELECT max(id_partida) FROM partidas")
    max_id = c.fetchone()[0] or 30000000
    prox_id = max_id + 1

    inseridos = 0
    atualizados = 0

    for j in jogos:
        c.execute("""
            SELECT id_partida, horario, placar
            FROM partidas
            WHERE data = ? AND (
                (mandante LIKE ? AND visitante LIKE ?) OR
                (mandante LIKE ? AND visitante LIKE ?)
            )
        """, (
            j["data"],
            f"%{j['mandante'][:4]}%", f"%{j['visitante'][:4]}%",
            f"%{j['visitante'][:4]}%", f"%{j['mandante'][:4]}%"
        ))
        db_match = c.fetchone()

        if db_match:
            id_p = db_match["id_partida"]
            upd = []
            vals = []
            if not db_match["horario"] and j.get("horario"):
                upd.append("horario = ?")
                vals.append(j["horario"])

            if upd:
                vals.append(id_p)
                c.execute(f"UPDATE partidas SET {', '.join(upd)} WHERE id_partida = ?", vals)
                atualizados += 1
        else:
            # Reutiliza o id gerado no banco anterior para manter 100% idêntico
            atribuir_id = j.get("_id_atribuido")
            if not atribuir_id:
                atribuir_id = prox_id
                j["_id_atribuido"] = atribuir_id
                prox_id += 1

            c.execute("""
                INSERT INTO partidas (
                    id_partida, ano, data, horario, mandante, visitante,
                    gols_mandante, gols_visitante, placar, vencedor,
                    campeonato, formato
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                atribuir_id, j["ano"], j["data"], j.get("horario"), j["mandante"], j["visitante"],
                j["gols_mandante"], j["gols_visitante"], j["placar"], j["vencedor"],
                j["campeonato"], "Oficial / Amistoso"
            ))
            inseridos += 1

    conn.commit()
    conn.close()
    return {"inseridos": inseridos, "atualizados": atualizados}

def carregar_checkpoint() -> set:
    if os.path.exists(CHECKPOINT_FILE):
        try:
            with open(CHECKPOINT_FILE, "r", encoding="utf-8") as f:
                data = json.load(f)
                return set(data.get("concluidos", []))
        except Exception:
            return set()
    return set()

def salvar_checkpoint(concluidos: set):
    try:
        with open(CHECKPOINT_FILE, "w", encoding="utf-8") as f:
            json.dump({"concluidos": sorted(list(concluidos))}, f, indent=2)
    except Exception:
        pass

def executar_backfill(anos: List[int], nome_fase: str):
    print(f"\n=======================================================")
    print(f"   INICIANDO {nome_fase.upper()} ({min(anos)} a {max(anos)})")
    print(f"=======================================================\n")

    concluidos = carregar_checkpoint()
    total_ins = 0
    total_upd = 0
    slugs = list(CLUBES_OGOL.keys())

    for ano in anos:
        jogos_do_ano = 0
        for slug in slugs:
            chave = f"{slug}_{ano}"
            if chave in concluidos:
                continue

            nome_exib = CLUBES_OGOL[slug]
            jogos = extrair_jogos_ogol(slug, ano)
            
            if jogos:
                # Aplica primeiro no DB local (onde gera _id_atribuido se inédito)
                res_loc = aplicar_ao_banco(jogos, DB_LOCAL)
                # Aplica no DB da API usando os mesmos IDs
                res_api = aplicar_ao_banco(jogos, DB_API)

                total_ins += res_loc["inseridos"]
                total_upd += res_loc["atualizados"]
                jogos_do_ano += len(jogos)

                if res_loc["inseridos"] > 0 or res_loc["atualizados"] > 0:
                    print(f"[{ano}] {nome_exib:<15}: +{res_loc['inseridos']} novos jogos | {res_loc['atualizados']} atualizados | Total ano: {len(jogos)}")
            
            concluidos.add(chave)
            salvar_checkpoint(concluidos)

        if jogos_do_ano > 0 and ano % 5 == 0:
            print(f"--> [CHECKPOINT {ano}] Total acumulado inserido: {total_ins} jogos.")

    print(f"\n[FIM DE {nome_fase.upper()}] Inseridos: {total_ins} | Atualizados: {total_upd}\n")

def main():
    # 1. FASE 1: Temporadas Recentes (2024, 2025, 2026)
    executar_backfill([2024, 2025, 2026], "Fase 1 - Temporadas Recentes")

    # Executa validação intermediária
    val_cmd = f'"{sys.executable}" scripts/validar_banco.py'
    os.system(val_cmd)

    # 2. FASE 2: Temporadas Históricas (2023 regredindo até 1910)
    anos_historicos = list(range(2023, 1909, -1))
    executar_backfill(anos_historicos, "Fase 2 - Backfill Histórico Centenário")

    # Executa validação final completa
    os.system(val_cmd)

if __name__ == "__main__":
    main()
