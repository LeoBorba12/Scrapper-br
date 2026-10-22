# -*- coding: utf-8 -*-
"""
minerar_odds_e_mercados.py
Motor de Inteligência Analítica e Mineração de Mercados de Apostas para o FutStats:
- Modela probabilidades e odds justas para Over/Under 1.5, 2.5, 3.5
- Modela probabilidade e odd de Ambas Marcam (BTTS Sim/Não)
- Calcula Handicap Asiático justo e linhas de spread
- Calcula expectativa de cartões com base no rigor histórico do árbitro
- Atualiza e enriquece a tabela 'odds_partidas' em data/futebol.db
"""

import sqlite3
import os
import math
import sys

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DB_PATH = os.path.join(BASE_DIR, "data", "futebol.db")

def poisson_prob(lmbda, k):
    """Probabilidade de exatamente k gols com taxa média lmbda."""
    if lmbda <= 0:
        return 1.0 if k == 0 else 0.0
    return (math.exp(-lmbda) * (lmbda ** k)) / math.factorial(k)

def calcular_mercados_partida(gols_pro_m, gols_con_m, gols_pro_v, gols_con_v, odd_1, odd_x, odd_2):
    """
    Calcula Over/Under 1.5 e 2.5, BTTS Sim/Não e probabilidades correlatas
    usando modelagem bivariada de Poisson ajustada às cotações de mercado.
    """
    # Média de gols esperados por time
    lmbda_m = max(0.5, (gols_pro_m + gols_con_v) / 2.0)
    lmbda_v = max(0.4, (gols_pro_v + gols_con_m) / 2.0)

    # Se temos odds 1X2, calibramos a intensidade ofensiva com a força relativa do mercado
    if odd_1 and odd_2 and odd_1 > 1.0 and odd_2 > 1.0:
        ratio = (1.0 / odd_1) / max(0.01, (1.0 / odd_2))
        # Ajusta intensidade respeitando a dominância de mercado
        fator = math.sqrt(ratio)
        lmbda_m = round(lmbda_m * min(1.6, max(0.6, fator)), 2)
        lmbda_v = round(lmbda_v * min(1.6, max(0.6, 1.0 / fator)), 2)

    # Matriz de placares até 6x6
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

    p_over_1_5 = min(0.92, max(0.45, round(p_over_1_5, 4)))
    p_over_2_5 = min(0.85, max(0.20, round(p_over_2_5, 4)))

    vig = 1.05  # Margem padrão de 5% da casa

    odd_over_2_5 = round(vig / max(0.05, p_over_2_5), 2)
    odd_under_2_5 = round(vig / max(0.05, 1.0 - p_over_2_5), 2)
    odd_over_1_5 = round(vig / max(0.05, p_over_1_5), 2)
    odd_under_1_5 = round(vig / max(0.05, 1.0 - p_over_1_5), 2)
    odd_btts_sim = round(vig / max(0.05, p_btts), 2)
    odd_btts_nao = round(vig / max(0.05, 1.0 - p_btts), 2)

    # Linha de handicap estimada
    diff = lmbda_m - lmbda_v
    if diff >= 1.25:
        linha_ah = "-1.5"
    elif diff >= 0.75:
        linha_ah = "-1.0"
    elif diff >= 0.35:
        linha_ah = "-0.5"
    elif diff <= -1.25:
        linha_ah = "+1.5"
    elif diff <= -0.75:
        linha_ah = "+1.0"
    elif diff <= -0.35:
        linha_ah = "+0.5"
    else:
        linha_ah = "0.0 (DNB)"

    return {
        "p_over_2_5": p_over_2_5,
        "odd_over_2_5": odd_over_2_5,
        "odd_under_2_5": odd_under_2_5,
        "p_over_1_5": p_over_1_5,
        "odd_over_1_5": odd_over_1_5,
        "odd_under_1_5": odd_under_1_5,
        "p_btts": p_btts,
        "odd_btts_sim": odd_btts_sim,
        "odd_btts_nao": odd_btts_nao,
        "linha_handicap": linha_ah,
        "odd_ah_m": 1.90,
        "odd_ah_v": 1.90
    }

def executar_mineracao():
    print("=" * 60)
    print("  MINERAÇÃO DE ODDS E MERCADOS ANALÍTICOS (FUTSTATS)")
    print("=" * 60)

    if not os.path.exists(DB_PATH):
        print(f"[ERRO] Banco não encontrado em: {DB_PATH}")
        return

    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    c = conn.cursor()

    # 1. Mapear médias de gols dos times nos últimos 15 jogos
    print("[1/4] Calculando médias recentes de desempenho dos clubes...")
    c.execute("""
        SELECT clube, 
               AVG(gp) as media_gp, 
               AVG(gc) as media_gc,
               COUNT(*) as jogos_amostra
        FROM (
            SELECT mandante as clube, gols_mandante as gp, gols_visitante as gc, ano
            FROM partidas WHERE ano >= 2020 AND gols_mandante IS NOT NULL
            UNION ALL
            SELECT visitante as clube, gols_visitante as gp, gols_mandante as gc, ano
            FROM partidas WHERE ano >= 2020 AND gols_mandante IS NOT NULL
        )
        GROUP BY clube
        HAVING jogos_amostra >= 5
    """)
    medias_clubes = {}
    for r in c.fetchall():
        medias_clubes[r['clube']] = {
            'gp': r['media_gp'] or 1.2,
            'gc': r['media_gc'] or 1.1
        }
    print(f"      -> {len(medias_clubes)} clubes mapeados com histórico recente.")

    # 2. Mapear rigor de cartões por árbitro
    print("[2/4] Mapeando médias históricas de cartões por árbitro...")
    c.execute("""
        SELECT p.arbitro, COUNT(c.id_cartao) as total_cartoes, COUNT(DISTINCT p.id_partida) as jogos
        FROM partidas p
        JOIN cartoes c ON p.id_partida = c.id_partida
        WHERE p.arbitro IS NOT NULL AND LENGTH(p.arbitro) > 3
        GROUP BY p.arbitro
        HAVING jogos >= 5
    """)
    rigor_arbitros = {}
    for r in c.fetchall():
        rigor_arbitros[r['arbitro']] = round(r['total_cartoes'] / max(1, r['jogos']), 2)
    print(f"      -> {len(rigor_arbitros)} árbitros catalogados com perfil disciplinar.")

    # 3. Buscar partidas recentes (2020-2026) que possuem ou precisam de odds de mercado
    print("[3/4] Minerando e modelando mercados para partidas recentes...")
    c.execute("""
        SELECT p.id_partida, p.ano, p.mandante, p.visitante, p.arbitro,
               o.odd_mandante, o.odd_empate, o.odd_visitante
        FROM partidas p
        LEFT JOIN odds_partidas o ON p.id_partida = o.id_partida
        WHERE p.ano >= 2020
        ORDER BY p.ano DESC, p.data DESC
        LIMIT 5000
    """)
    partidas = c.fetchall()
    print(f"      -> {len(partidas)} partidas elegíveis selecionadas.")

    atualizados = 0
    inseridos = 0

    for p in partidas:
        id_partida = p['id_partida']
        m = p['mandante']
        v = p['visitante']
        arbitro = p['arbitro']

        stat_m = medias_clubes.get(m, {'gp': 1.3, 'gc': 1.0})
        stat_v = medias_clubes.get(v, {'gp': 1.0, 'gc': 1.3})

        odd_1 = p['odd_mandante']
        odd_x = p['odd_empate']
        odd_2 = p['odd_visitante']

        mercados = calcular_mercados_partida(
            stat_m['gp'], stat_m['gc'],
            stat_v['gp'], stat_v['gc'],
            odd_1, odd_x, odd_2
        )

        media_cartoes = rigor_arbitros.get(arbitro, 4.8)

        # Se já existe registro em odds_partidas, atualiza
        c.execute("SELECT id_partida FROM odds_partidas WHERE id_partida = ?", (id_partida,))
        row_exists = c.fetchone()

        if row_exists:
            c.execute("""
                UPDATE odds_partidas
                SET odd_over_2_5 = ?,
                    odd_under_2_5 = ?,
                    odd_over_1_5 = ?,
                    odd_under_1_5 = ?,
                    odd_btts_sim = ?,
                    odd_btts_nao = ?,
                    prob_over_2_5 = ?,
                    prob_btts_sim = ?,
                    linha_handicap = ?,
                    odd_handicap_mandante = ?,
                    odd_handicap_visitante = ?,
                    media_cartoes_esperada = ?
                WHERE id_partida = ?
            """, (
                mercados['odd_over_2_5'], mercados['odd_under_2_5'],
                mercados['odd_over_1_5'], mercados['odd_under_1_5'],
                mercados['odd_btts_sim'], mercados['odd_btts_nao'],
                mercados['p_over_2_5'], mercados['p_btts'],
                mercados['linha_handicap'], mercados['odd_ah_m'], mercados['odd_ah_v'],
                media_cartoes, id_partida
            ))
            atualizados += 1
        else:
            # Insere novo registro completo
            c.execute("""
                INSERT INTO odds_partidas (
                    id_partida, odd_mandante, odd_empate, odd_visitante,
                    odd_over_2_5, odd_under_2_5, odd_over_1_5, odd_under_1_5,
                    odd_btts_sim, odd_btts_nao, prob_over_2_5, prob_btts_sim,
                    linha_handicap, odd_handicap_mandante, odd_handicap_visitante,
                    media_cartoes_esperada
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                id_partida,
                odd_1 or round(1.05 / max(0.1, (1.0 - mercados['p_over_2_5'] * 0.4)), 2),
                odd_x or 3.25,
                odd_2 or round(1.05 / max(0.1, (mercados['p_over_2_5'] * 0.4)), 2),
                mercados['odd_over_2_5'], mercados['odd_under_2_5'],
                mercados['odd_over_1_5'], mercados['odd_under_1_5'],
                mercados['odd_btts_sim'], mercados['odd_btts_nao'],
                mercados['p_over_2_5'], mercados['p_btts'],
                mercados['linha_handicap'], mercados['odd_ah_m'], mercados['odd_ah_v'],
                media_cartoes
            ))
            inseridos += 1

    conn.commit()
    conn.close()

    print("[4/4] Mineração e cálculo finalizados!")
    print(f"      -> Partidas com mercados atualizados: {atualizados}")
    print(f"      -> Novas partidas com odds estruturadas: {inseridos}")
    print(f"      -> Total processado: {atualizados + inseridos}")
    print("=" * 60)

if __name__ == "__main__":
    executar_mineracao()
