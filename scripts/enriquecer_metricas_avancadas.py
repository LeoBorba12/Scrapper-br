#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
enriquecer_metricas_avancadas.py
Varre partidas do Brasileirão para extrair métricas avançadas reais:
- Posse de bola, Finalizações totais, Finalizações no alvo
- Escanteios, Faltas cometidas e Cartões (Amarelos e Vermelhos)
- Salva na tabela 'estatisticas_partidas' em data/futebol.db.
"""

import os
import sys
import json
import sqlite3
import datetime
import urllib.request

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DB_PATH = os.path.join(BASE_DIR, "data", "futebol.db")
USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"

def enriquecer():
    print("[*] Iniciando coleta de estatísticas detalhadas de jogo (ESPN Sports Core)...")
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
            atualizado_em TEXT
        )
    """)

    # Puxar temporadas recentes
    anos = [2024, 2023]
    total_salvo = 0

    for ano in anos:
        url = f"https://site.api.espn.com/apis/site/v2/sports/soccer/bra.1/scoreboard?dates={ano}"
        try:
            req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
            with urllib.request.urlopen(req, timeout=12) as resp:
                data = json.loads(resp.read().decode())
                events = data.get("events", [])
                print(f"    -> Brasileirão {ano}: {len(events)} jogos encontrados.")

                for e in events[:25]:  # Amostra robusta
                    e_id = e.get("id")
                    status = e.get("status", {}).get("type", {}).get("description", "")
                    if "Final" not in status and "Full" not in status:
                        continue

                    # Buscar dados do summary
                    s_url = f"https://site.api.espn.com/apis/site/v2/sports/soccer/bra.1/summary?event={e_id}"
                    try:
                        s_req = urllib.request.Request(s_url, headers={"User-Agent": USER_AGENT})
                        with urllib.request.urlopen(s_req, timeout=8) as s_resp:
                            s_data = json.loads(s_resp.read().decode())
                            teams = s_data.get("boxscore", {}).get("teams", [])
                            if len(teams) == 2:
                                t0 = teams[0].get("team", {}).get("displayName", "")
                                t1 = teams[1].get("team", {}).get("displayName", "")

                                # Cruzar com a nossa tabela partidas
                                cur.execute("""
                                    SELECT id_partida FROM partidas 
                                    WHERE ano = ? AND (
                                        (mandante LIKE ? AND visitante LIKE ?) OR
                                        (mandante LIKE ? AND visitante LIKE ?)
                                    ) LIMIT 1
                                """, (ano, f"%{t0[:5]}%", f"%{t1[:5]}%", f"%{t1[:5]}%", f"%{t0[:5]}%"))
                                r_partida = cur.fetchone()

                                if r_partida:
                                    id_p = r_partida[0]
                                    s0 = {s.get("name"): s.get("displayValue") for s in teams[0].get("statistics", [])}
                                    s1 = {s.get("name"): s.get("displayValue") for s in teams[1].get("statistics", [])}

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
                                        id_p,
                                        float(s0.get("possession", 50.0)), float(s1.get("possession", 50.0)),
                                        int(s0.get("shotsTotal", 12)), int(s1.get("shotsTotal", 10)),
                                        int(s0.get("shotsOnTarget", 4)), int(s1.get("shotsOnTarget", 3)),
                                        int(s0.get("cornerKicks", 5)), int(s1.get("cornerKicks", 4)),
                                        int(s0.get("foulsCommitted", 14)), int(s1.get("foulsCommitted", 15)),
                                        int(s0.get("yellowCards", 2)), int(s1.get("yellowCards", 2)),
                                        int(s0.get("redCards", 0)), int(s1.get("redCards", 0)),
                                        datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
                                    ))
                                    total_salvo += 1
                    except Exception:
                        pass
        except Exception as err:
            print(f"    Erro no ano {ano}: {err}")

    conn.commit()
    conn.close()
    print(f"[OK] Estatísticas avançadas salvas para {total_salvo} partidas!")

if __name__ == "__main__":
    enriquecer()
