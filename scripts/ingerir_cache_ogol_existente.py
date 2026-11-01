#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
scripts/ingerir_cache_ogol_existente.py
=======================================
Colhedor e Ingestor de Súmulas e Gols Históricos Cacheados Localmente (Milestone 2).

Processa os 6.225 arquivos JSON em data/cache_ogol_brasileirao/ (e opcionalmente
data/cache_ogol_estaduais/) e popula as súmulas detalhadas no banco data/futebol.db:
1. Mapeia com precisão cada ficha de jogo para sua respectiva partida em 'partidas'
   (normalização canônica de nomes de clubes e janela temporal de jitter <= 3 dias).
2. Enriquece 'estadio' e 'arbitro' faltantes na tabela 'partidas'.
3. Normaliza e higieniza 'tipo_de_gol' para a taxonomia canônica:
   {'Normal', 'Pênalti', 'Falta', 'Contra', 'Cabeça'}.
4. Harmoniza estritamente 'clube' do gol para coincidir com 'mandante' ou 'visitante'.
5. Vincula 'id_jogador' através de catálogo de nomes e apelidos históricos.
6. Preserva integridade referencial: zero gols ou escalações órfãs.
"""

import os
import sys
import re
import glob
import json
import time
import sqlite3
import datetime
import unicodedata
from typing import Dict, List, Optional, Tuple, Set

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
if hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8", errors="replace")

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DB_PATH = os.path.join(BASE_DIR, "data", "futebol.db")
CACHE_BRASILEIRAO = os.path.join(BASE_DIR, "data", "cache_ogol_brasileirao")
CACHE_ESTADUAIS = os.path.join(BASE_DIR, "data", "cache_ogol_estaduais")

CANONICAL_TYPES = {"Normal", "Pênalti", "Falta", "Contra", "Cabeça"}

def norm_team(s: str) -> str:
    """Normaliza nomes de times para correspondência determinística."""
    if not s:
        return ""
    s = unicodedata.normalize("NFKD", s).encode("ASCII", "ignore").decode("utf-8")
    s = re.sub(r"[^a-zA-Z0-9]", "", s).lower()
    # Mapeamento canônico
    if s in ("athletico", "athleticopr", "atleticopr", "clubathleticoparanaense", "atleticoparanaense"):
        return "atleticopr"
    if s in ("atleticomg", "clubeatleticomineiro", "atleticomineiro"):
        return "atleticomg"
    if s in ("atleticogo", "atleticogoianiense"):
        return "atleticogo"
    if s in ("gremionovorizontino", "novorizontino"):
        return "novorizontino"
    if s in ("redbullbragantino", "bragantino", "rbbragantino"):
        return "bragantino"
    if s in ("sportrecife", "sport"):
        return "sport"
    if s in ("botafogosp", "botafogoribeiraopreto"):
        return "botafogosp"
    if s in ("americamg", "americamineiro"):
        return "americamg"
    if s in ("catuensefutebol", "catuense"):
        return "catuense"
    return s

def canonicalize_goal_type(raw_type: str) -> str:
    """Mapeia qualquer tipo de gol bruto para a taxonomia canônica oficial."""
    if not raw_type:
        return "Normal"
    t = raw_type.lower()
    if "contra" in t or "g.c" in t or "gc" in t:
        return "Contra"
    if "pen" in t or "penalty" in t or "pênalti" in t:
        return "Pênalti"
    if "falta" in t:
        return "Falta"
    if "cabeca" in t or "cabeça" in t:
        return "Cabeça"
    return "Normal"

def clean_name(s: str) -> str:
    if not s:
        return ""
    s = unicodedata.normalize("NFKD", s).encode("ASCII", "ignore").decode("utf-8")
    return s.strip().lower()

def carregar_catalogo_jogadores(c: sqlite3.Cursor) -> Dict[str, int]:
    """Cria mapa em memória de nomes limpos para id_jogador."""
    catalogo = {}
    
    # 1. Da tabela gols existente
    c.execute("SELECT atleta, id_jogador FROM gols WHERE id_jogador IS NOT NULL AND id_jogador > 0")
    for atl, jid in c.fetchall():
        k = clean_name(atl)
        if k and k not in catalogo:
            catalogo[k] = jid

    # 2. Da tabela jogadores
    c.execute("SELECT nome_exibicao, apelido, nome_completo, id_jogador FROM jogadores WHERE id_jogador IS NOT NULL")
    for n_ex, ap, n_comp, jid in c.fetchall():
        for val in (n_ex, ap, n_comp):
            k = clean_name(val)
            if k and k not in catalogo:
                catalogo[k] = jid

    # 3. Da tabela jogadores_estatisticas
    c.execute("SELECT nome_exibicao, id_jogador FROM jogadores_estatisticas WHERE id_jogador IS NOT NULL")
    for n_ex, jid in c.fetchall():
        k = clean_name(n_ex)
        if k and k not in catalogo:
            catalogo[k] = jid

    return catalogo

def ingerir_cache(db_path: str = DB_PATH, incluir_estaduais: bool = False) -> Dict:
    start_time = time.time()
    print("=" * 80)
    print("  INGESTOR DE SÚMULAS E GOLS DO CACHE LOCAL (MILESTONE 2 - FUTSTATS)")
    print(f"  Banco de dados: {db_path}")
    print(f"  Diretório cache Brasileirão: {CACHE_BRASILEIRAO}")
    print(f"  Incluir cache Estaduais:    {incluir_estaduais}")
    print("=" * 80)

    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode = WAL;")
    conn.execute("PRAGMA synchronous = NORMAL;")
    c = conn.cursor()

    # Carregar catálogo de jogadores
    print("[*] Carregando catálogo de atletas...")
    catalogo_jogadores = carregar_catalogo_jogadores(c)
    print(f"    -> {len(catalogo_jogadores)} atletas catalogados em memória.")

    # Carregar índice de partidas existentes
    print("[*] Indexando partidas existentes no banco por ano...")
    c.execute("""
        SELECT id_partida, ano, data, mandante, visitante, placar,
               gols_mandante, gols_visitante, estadio, arbitro
        FROM partidas
    """)
    all_partidas = c.fetchall()
    partidas_by_ano = {}
    for p in all_partidas:
        ano = p["ano"]
        if ano not in partidas_by_ano:
            partidas_by_ano[ano] = []
        partidas_by_ano[ano].append({
            "id_partida": p["id_partida"],
            "data": p["data"],
            "mandante": p["mandante"],
            "visitante": p["visitante"],
            "placar": p["placar"],
            "gols_mandante": p["gols_mandante"],
            "gols_visitante": p["gols_visitante"],
            "estadio": p["estadio"],
            "arbitro": p["arbitro"],
            "norm_m": norm_team(p["mandante"]),
            "norm_v": norm_team(p["visitante"])
        })
    print(f"    -> {len(all_partidas)} partidas indexadas.")

    # Pré-carregar gols já existentes por partida
    print("[*] Indexando gols já cadastrados...")
    c.execute("SELECT id_partida, atleta, minuto, tempo FROM gols")
    gols_existentes = set()
    gols_count_by_pid = {}
    for r in c.fetchall():
        pid = r["id_partida"]
        gols_existentes.add((pid, clean_name(r["atleta"]), str(r["minuto"]).strip()))
        gols_count_by_pid[pid] = gols_count_by_pid.get(pid, 0) + 1
    print(f"    -> {len(gols_existentes)} gols existentes mapeados.")

    # Coletar arquivos de cache
    arquivos = sorted(glob.glob(os.path.join(CACHE_BRASILEIRAO, "jogo_*.json")))
    if incluir_estaduais and os.path.exists(CACHE_ESTADUAIS):
        arquivos += sorted(glob.glob(os.path.join(CACHE_ESTADUAIS, "jogo_*.json")))

    print(f"[*] Processando {len(arquivos)} arquivos de cache...")

    arquivos_processados = 0
    partidas_encontradas = 0
    gols_inseridos = 0
    estadios_atualizados = 0
    arbitros_atualizados = 0

    for idx, fpath in enumerate(arquivos, 1):
        try:
            with open(fpath, "r", encoding="utf-8") as fp:
                d = json.load(fp)
        except Exception:
            continue

        arquivos_processados += 1
        dt_str = d.get("data")
        if not dt_str or len(dt_str) < 10:
            continue
        try:
            ano = int(dt_str[:4])
            dt_obj = datetime.date.fromisoformat(dt_str[:10])
        except Exception:
            continue

        home_raw = d.get("home", "")
        away_raw = d.get("away", "")
        if not home_raw or not away_raw:
            continue

        n_home = norm_team(home_raw)
        n_away = norm_team(away_raw)

        # Buscar partida correspondente em partidas_by_ano[ano]
        cand_list = partidas_by_ano.get(ano, [])
        best_match = None
        best_dist = 999

        for p in cand_list:
            p_camp = clean_name(p.get("campeonato", ""))
            if "brasileir" not in p_camp and "seriea" not in p_camp:
                continue
            home_ok = (n_home in p["norm_m"] or p["norm_m"] in n_home)
            away_ok = (n_away in p["norm_v"] or p["norm_v"] in n_away)
            if home_ok and away_ok:
                try:
                    p_dt = datetime.date.fromisoformat(p["data"][:10])
                    dist = abs((dt_obj - p_dt).days)
                except Exception:
                    dist = 999
                if dist <= 3 and dist < best_dist:
                    best_dist = dist
                    best_match = p
                    if dist == 0:
                        break

        if not best_match:
            continue

        partidas_encontradas += 1
        pid = best_match["id_partida"]
        mandante = best_match["mandante"]
        visitante = best_match["visitante"]

        # Atualizar estádio/árbitro se vazios
        cache_estadio = d.get("estadio")
        cache_arbitro = d.get("arbitro")

        if cache_estadio and (not best_match["estadio"] or str(best_match["estadio"]).strip() == ""):
            c.execute("UPDATE partidas SET estadio = ? WHERE id_partida = ?", (cache_estadio, pid))
            best_match["estadio"] = cache_estadio
            estadios_atualizados += 1

        if cache_arbitro and (not best_match["arbitro"] or str(best_match["arbitro"]).strip() == ""):
            c.execute("UPDATE partidas SET arbitro = ? WHERE id_partida = ?", (cache_arbitro, pid))
            best_match["arbitro"] = cache_arbitro
            arbitros_atualizados += 1

        # Processar gols do cache
        cache_gols = d.get("gols", [])
        if not cache_gols:
            continue

        # Inspecionar total existente de gols
        existentes_pid = gols_count_by_pid.get(pid, 0)
        expected_goals = (best_match["gols_mandante"] or 0) + (best_match["gols_visitante"] or 0)
        if expected_goals == 0:
            continue

        # Se já temos todos os gols ou mais, e nenhum é novo, podemos pular inserções redundantes
        for g in cache_gols:
            atleta_raw = g.get("atleta", "").strip()
            if not atleta_raw:
                continue

            minuto_raw = str(g.get("minuto", "")).strip()
            sub_minutos = [m.strip() for m in re.split(r'\s{2,}', minuto_raw) if m.strip()]
            if not sub_minutos:
                sub_minutos = [minuto_raw]

            for sub_min in sub_minutos:
                tempo_raw = g.get("tempo", "1T").strip()
                tipo_raw = g.get("tipo_de_gol", "Normal")
                tipo_canonico = canonicalize_goal_type(tipo_raw)

                # Harmonizar clube: estritamente mandante ou visitante
                clube_raw = g.get("clube", "").strip()
                clube_harmonizado = mandante
                norm_c = norm_team(clube_raw)

                if norm_c == best_match["norm_v"]:
                    clube_harmonizado = visitante
                elif norm_c == best_match["norm_m"]:
                    clube_harmonizado = mandante
                else:
                    # Compara por similaridade
                    c_clean = clean_name(clube_raw)
                    m_clean = clean_name(mandante)
                    v_clean = clean_name(visitante)
                    if c_clean in v_clean or v_clean in c_clean:
                        clube_harmonizado = visitante
                    elif c_clean in m_clean or m_clean in c_clean:
                        clube_harmonizado = mandante
                    elif (best_match["gols_visitante"] or 0) > 0 and (best_match["gols_mandante"] or 0) == 0:
                        clube_harmonizado = visitante
                    else:
                        clube_harmonizado = mandante

                # Verificar duplicidade
                atl_key = clean_name(atleta_raw)
                if (pid, atl_key, sub_min) in gols_existentes:
                    continue

                # Se a partida já atingiu ou excedeu a contagem esperada do placar, não inflacionar
                if existentes_pid >= expected_goals:
                    continue

                # Resolver id_jogador
                id_jogador = catalogo_jogadores.get(atl_key)

                c.execute("""
                    INSERT INTO gols (id_partida, rodada, clube, atleta, minuto, tempo, tipo_de_gol, id_jogador)
                    VALUES (?, NULL, ?, ?, ?, ?, ?, ?)
                """, (pid, clube_harmonizado, atleta_raw, sub_min, tempo_raw, tipo_canonico, id_jogador))

                gols_existentes.add((pid, atl_key, sub_min))
                gols_count_by_pid[pid] = existentes_pid + 1
                existentes_pid += 1
                gols_inseridos += 1

        if idx % 500 == 0 or idx == len(arquivos):
            conn.commit()
            print(f"    ... {idx}/{len(arquivos)} arquivos processados (+{gols_inseridos} gols inseridos)")

    conn.commit()

    # Estatísticas Finais
    c.execute("SELECT COUNT(*) FROM gols")
    total_gols_apos = c.fetchone()[0]

    c.execute("SELECT COUNT(DISTINCT id_partida) FROM gols")
    partidas_com_gols = c.fetchone()[0]

    conn.close()

    elapsed = time.time() - start_time
    print("=" * 80)
    print("  RESULTADO DA INGESTÃO DE CACHE OGOL:")
    print(f"  Arquivos processados:     {arquivos_processados}")
    print(f"  Partidas correspondidas:  {partidas_encontradas}")
    print(f"  Gols novos inseridos:     {gols_inseridos}")
    print(f"  Estádios atualizados:     {estadios_atualizados}")
    print(f"  Árbitros atualizados:     {arbitros_atualizados}")
    print(f"  Total de Gols no Banco:   {total_gols_apos}")
    print(f"  Partidas com Gols no DB:  {partidas_com_gols}")
    print(f"  Tempo decorrido:          {elapsed:.2f}s")
    print("=" * 80)

    return {
        "arquivos": arquivos_processados,
        "partidas_encontradas": partidas_encontradas,
        "gols_inseridos": gols_inseridos,
        "total_gols": total_gols_apos
    }

if __name__ == "__main__":
    incluir_est = "--estaduais" in sys.argv
    ingerir_cache(incluir_estaduais=incluir_est)
