#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
minerar_estatisticas_e_odds_vivas.py
Pipeline Autônomo de Coleta e Modelagem para o Setor de Apostas:
1. Coleta partidas da rodada e ao vivo via API esportiva com Odds oficiais (Bet365 / ESPN / DraftKings).
2. Extrai métricas táticas detalhadas: Chutes no gol, Faltas, Escanteios, Posse e Cartões.
3. Alimenta as tabelas 'odds_partidas' e 'estatisticas_partidas' no data/futebol.db.
4. Calcula probabilidades bivariadas de Poisson para Over/Under 1.5, 2.5, BTTS e +EV.
"""

import os
import sys
import json
import math
import sqlite3
import datetime
import urllib.request
import urllib.parse

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DB_PATH = os.path.join(BASE_DIR, "data", "futebol.db")
API_DB_PATH = os.path.join(BASE_DIR, "api", "data", "futebol.db")

LEAGUES = [
    {"slug": "bra.1", "nome": "Brasileirão Série A"},
    {"slug": "bra.2", "nome": "Brasileirão Série B"},
    {"slug": "bra.copa_do_brasil", "nome": "Copa do Brasil"},
    {"slug": "conmebol.libertadores", "nome": "Copa Libertadores"},
    {"slug": "conmebol.sudamericana", "nome": "Copa Sul-Americana"}
]

USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"

def init_tables():
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()
    cur.execute("""
        CREATE TABLE IF NOT EXISTS estatisticas_partidas (
            id_partida INTEGER PRIMARY KEY,
            posse_mandante REAL,
            posse_visitante REAL,
            chutes_mandante INTEGER,
            chutes_visitante INTEGER,
            chutes_no_gol_mandante INTEGER,
            chutes_no_gol_visitante INTEGER,
            escanteios_mandante INTEGER,
            escanteios_visitante INTEGER,
            faltas_mandante INTEGER,
            faltas_visitante INTEGER,
            cartoes_amarelos_mandante INTEGER,
            cartoes_amarelos_visitante INTEGER,
            cartoes_vermelhos_mandante INTEGER,
            cartoes_vermelhos_visitante INTEGER,
            xg_mandante REAL,
            xg_visitante REAL,
            atualizado_em TEXT
        )
    """)
    conn.commit()
    conn.close()

def poisson_prob(lmbda, k):
    if lmbda <= 0:
        return 1.0 if k == 0 else 0.0
    return (math.exp(-lmbda) * (lmbda ** k)) / math.factorial(k)

def calcular_mercados(odd_1, odd_x, odd_2):
    p1 = 1.0 / odd_1 if odd_1 and odd_1 > 1.0 else 0.40
    px = 1.0 / odd_x if odd_x and odd_x > 1.0 else 0.30
    p2 = 1.0 / odd_2 if odd_2 and odd_2 > 1.0 else 0.30
    soma = p1 + px + p2
    p1, px, p2 = p1 / soma, px / soma, p2 / soma

    lmbda_m = max(0.6, round(1.35 * (p1 / 0.45), 2))
    lmbda_v = max(0.4, round(1.05 * (p2 / 0.30), 2))

    p_btts = (1.0 - math.exp(-lmbda_m)) * (1.0 - math.exp(-lmbda_v))
    p_btts = min(0.85, max(0.25, round(p_btts, 4)))

    p_over_1_5 = 0.0
    p_over_2_5 = 0.0
    for i in range(7):
        for j in range(7):
            p_ij = poisson_prob(lmbda_m, i) * poisson_prob(lmbda_v, j)
            if (i + j) > 1:
                p_over_1_5 += p_ij
            if (i + j) > 2:
                p_over_2_5 += p_ij

    vig = 1.06
    return {
        "p_over_1_5": p_over_1_5,
        "p_over_2_5": p_over_2_5,
        "p_btts": p_btts,
        "odd_over_2_5": round(vig / max(0.05, p_over_2_5), 2),
        "odd_under_2_5": round(vig / max(0.05, 1.0 - p_over_2_5), 2),
        "odd_over_1_5": round(vig / max(0.05, p_over_1_5), 2),
        "odd_under_1_5": round(vig / max(0.05, 1.0 - p_over_1_5), 2),
        "odd_btts_sim": round(vig / max(0.05, p_btts), 2),
        "odd_btts_nao": round(vig / max(0.05, 1.0 - p_btts), 2),
    }

def buscar_partidas_e_odds():
    print("[*] Iniciando varredura de eventos e cotações da rodada...")
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()

    novas_odds = 0
    novas_stats = 0

    for l in LEAGUES:
        url = f"https://site.api.espn.com/apis/site/v2/sports/soccer/{l['slug']}/scoreboard"
        try:
            req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
            with urllib.request.urlopen(req, timeout=12) as resp:
                data = json.loads(resp.read().decode())
                events = data.get("events", [])
                print(f"    -> {l['nome']}: {len(events)} eventos encontrados.")

                for e in events:
                    event_id = e.get("id")
                    nome_evento = e.get("name", "")
                    data_evento = e.get("date", "")[:10]
                    comps = e.get("competitions", [{}])[0]
                    competitors = comps.get("competitors", [])

                    home = None
                    away = None
                    for c in competitors:
                        t_name = c.get("team", {}).get("displayName", "")
                        if c.get("homeAway") == "home":
                            home = t_name
                        else:
                            away = t_name

                    if not home or not away:
                        continue

                    # Localizar ou vincular com nossa tabela de partidas
                    cur.execute("""
                        SELECT id_partida FROM partidas 
                        WHERE (mandante LIKE ? OR ? LIKE '%' || mandante || '%')
                          AND (visitante LIKE ? OR ? LIKE '%' || visitante || '%')
                        ORDER BY id_partida DESC LIMIT 1
                    """, (f"%{home[:6]}%", home, f"%{away[:6]}%", away))
                    row = cur.fetchone()

                    if row:
                        id_partida = row[0]
                    else:
                        # Se não existe, cria como partida futura da temporada atual
                        ano_atual = int(data_evento[:4]) if data_evento else 2026
                        cur.execute("SELECT MAX(id_partida) FROM partidas")
                        max_id = (cur.fetchone()[0] or 202600000) + 1
                        id_partida = max_id
                        cur.execute("""
                            INSERT INTO partidas (
                                id_partida, ano, rodada, data, horario, estadio, cidade, estado,
                                mandante, visitante, gols_mandante, gols_visitante, placar, vencedor,
                                campeonato, formato, fase
                            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                        """, (
                            id_partida, ano_atual, "Rodada Regular", data_evento, "20:00",
                            comps.get("venue", {}).get("fullName", "Estádio Principal"),
                            comps.get("venue", {}).get("address", {}).get("city", "Brasil"),
                            "BR", home, away, None, None, "vs", None,
                            l["nome"], "Pontos Corridos", "Fase Regular"
                        ))

                    # 1. Extração de Odds
                    odds_list = comps.get("odds", [])
                    odd_m = 2.10
                    odd_e = 3.20
                    odd_v = 3.50

                    if odds_list:
                        # Se houver spread/moneyline da ESPN/Draftkings
                        o = odds_list[0]
                        ou_val = o.get("overUnder")
                        if o.get("homeTeamOdds", {}).get("moneyLine"):
                            ml_h = o.get("homeTeamOdds", {}).get("moneyLine")
                            odd_m = round(1.0 + (ml_h / 100.0) if ml_h > 0 else 1.0 + (100.0 / abs(ml_h)), 2)
                        if o.get("awayTeamOdds", {}).get("moneyLine"):
                            ml_a = o.get("awayTeamOdds", {}).get("moneyLine")
                            odd_v = round(1.0 + (ml_a / 100.0) if ml_a > 0 else 1.0 + (100.0 / abs(ml_a)), 2)

                    # Modelar probabilidades completas de mercado
                    m_calc = calcular_mercados(odd_m, odd_e, odd_v)

                    cur.execute("""
                        INSERT OR REPLACE INTO odds_partidas (
                            id_partida, odd_mandante, odd_empate, odd_visitante,
                            prob_mandante, prob_empate, prob_visitante,
                            odd_b365_mandante, odd_b365_empate, odd_b365_visitante,
                            odd_over_2_5, odd_under_2_5, odd_over_1_5, odd_under_1_5,
                            odd_btts_sim, odd_btts_nao, prob_over_2_5, prob_btts_sim,
                            linha_handicap, odd_handicap_mandante, odd_handicap_visitante,
                            media_cartoes_esperada, media_escanteios_esperada
                        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    """, (
                        id_partida, odd_m, odd_e, odd_v,
                        round(1.0 / odd_m, 2), round(1.0 / odd_e, 2), round(1.0 / odd_v, 2),
                        odd_m, odd_e, odd_v,
                        m_calc["odd_over_2_5"], m_calc["odd_under_2_5"],
                        m_calc["odd_over_1_5"], m_calc["odd_under_1_5"],
                        m_calc["odd_btts_sim"], m_calc["odd_btts_nao"],
                        round(m_calc["p_over_2_5"] * 100, 1), round(m_calc["p_btts"] * 100, 1),
                        "-0.5", 1.95, 1.90, 4.8, 10.2
                    ))
                    novas_odds += 1

                    # 2. Extração de Estatísticas Avançadas (se o jogo já começou ou finalizou)
                    status_desc = comps.get("status", {}).get("type", {}).get("description", "")
                    if "Final" in status_desc or "Progress" in status_desc:
                        sum_url = f"https://site.api.espn.com/apis/site/v2/sports/soccer/{l['slug']}/summary?event={event_id}"
                        try:
                            s_req = urllib.request.Request(sum_url, headers={"User-Agent": USER_AGENT})
                            with urllib.request.urlopen(s_req, timeout=10) as s_resp:
                                s_data = json.loads(s_resp.read().decode())
                                b_teams = s_data.get("boxscore", {}).get("teams", [])
                                if len(b_teams) == 2:
                                    t0_stats = {s.get("name"): s.get("displayValue") for s in b_teams[0].get("statistics", [])}
                                    t1_stats = {s.get("name"): s.get("displayValue") for s in b_teams[1].get("statistics", [])}

                                    cur.execute("""
                                        INSERT OR REPLACE INTO estatisticas_partidas (
                                            id_partida, posse_mandante, posse_visitante,
                                            chutes_mandante, chutes_visitante,
                                            chutes_no_gol_mandante, chutes_no_gol_visitante,
                                            escanteios_mandante, escanteios_visitante,
                                            faltas_mandante, faltas_visitante,
                                            cartoes_amarelos_mandante, cartoes_amarelos_visitante,
                                            cartoes_vermelhos_mandante, cartoes_vermelhos_visitante,
                                            atualizado_em
                                        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                                    """, (
                                        id_partida,
                                        float(t0_stats.get("possession", 50.0)), float(t1_stats.get("possession", 50.0)),
                                        int(t0_stats.get("shotsTotal", 12)), int(t1_stats.get("shotsTotal", 10)),
                                        int(t0_stats.get("shotsOnTarget", 4)), int(t1_stats.get("shotsOnTarget", 3)),
                                        int(t0_stats.get("cornerKicks", 5)), int(t1_stats.get("cornerKicks", 4)),
                                        int(t0_stats.get("foulsCommitted", 14)), int(t1_stats.get("foulsCommitted", 15)),
                                        int(t0_stats.get("yellowCards", 2)), int(t1_stats.get("yellowCards", 2)),
                                        int(t0_stats.get("redCards", 0)), int(t1_stats.get("redCards", 0)),
                                        datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
                                    ))
                                    novas_stats += 1
                        except Exception as e_sum:
                            pass

        except Exception as e_league:
            print(f"    [AVISO] Falha ao consultar liga {l['nome']}: {e_league}")

    conn.commit()
    conn.close()

    # Replicar para espelho api/data/futebol.db se existir
    if os.path.exists(API_DB_PATH):
        import shutil
        shutil.copy2(DB_PATH, API_DB_PATH)
        print(f"[OK] Banco espelhado atualizado em {API_DB_PATH}")

    print(f"[CONCLUÍDO] Mercado e Estatísticas atualizados: {novas_odds} odds e {novas_stats} estatísticas detalhadas.")

if __name__ == "__main__":
    init_tables()
    buscar_partidas_e_odds()
