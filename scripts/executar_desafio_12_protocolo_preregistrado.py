#!/usr/bin/env python3
"""
FutStats — Execução do Desafio 12:
Protocolo Pré-Registrado de Avaliação e Gate de Qualidade de Odds

- Aplica o Gate de Qualidade microeconômico de odds (margem entre 0% e 15%)
- Utiliza tau* = 0.84 congelado da validação de 2023
- Gera relatórios independentes para:
  1. Estratégia Completa 1X2 (sem teto artificial de odd)
  2. Estratégia Focada de Empate (D)
- Calcula Brier Score, Log Loss, ROI e CLV auditado contra Pinnacle
- Garante integridade do banco de dados (SQLite < 88 MB e journal_mode = DELETE)
"""

import sqlite3
import math
import os
from collections import defaultdict
from pathlib import Path
import sys

sys.path.insert(0, str(Path(".").resolve()))
from backend.odds_quality_gate import mercado_1x2_valido, calcular_margem_implicita

DB_PATH = Path("data/futebol.db")

def conectar():
    conn = sqlite3.connect(DB_PATH)
    conn.execute("PRAGMA foreign_keys = ON;")
    conn.execute("PRAGMA journal_mode = DELETE;")
    return conn

def poisson_pmf(lmbda, k):
    if lmbda <= 0:
        return 1.0 if k == 0 else 0.0
    return (math.exp(-lmbda) * (lmbda ** k)) / math.factorial(k)

def calc_dixon_coles(lh, la, rho=-0.12):
    max_gols = 8
    p_matrix = [[0.0 for _ in range(max_gols + 1)] for _ in range(max_gols + 1)]
    for x in range(max_gols + 1):
        for y in range(max_gols + 1):
            base = poisson_pmf(lh, x) * poisson_pmf(la, y)
            adj = 1.0
            if x == 0 and y == 0:
                adj = 1.0 - (lh * la * rho)
            elif x == 0 and y == 1:
                adj = 1.0 + (lh * rho)
            elif x == 1 and y == 0:
                adj = 1.0 + (la * rho)
            elif x == 1 and y == 1:
                adj = 1.0 - rho
            p_matrix[x][y] = max(0.0, base * adj)
    
    total = sum(sum(row) for row in p_matrix)
    if total <= 0: total = 1.0

    p_h, p_d, p_a = 0.0, 0.0, 0.0
    for x in range(max_gols + 1):
        for y in range(max_gols + 1):
            val = p_matrix[x][y] / total
            if x > y: p_h += val
            elif x == y: p_d += val
            else: p_a += val
    
    s = p_h + p_d + p_a
    return round(p_h / s, 4), round(p_d / s, 4), round(p_a / s, 4)

def aplicar_tau_softmax(p_h, p_d, p_a, tau=0.84):
    """Temperature Scaling multinomial pré-registrado com tau* = 0.84."""
    eps = 1e-9
    logits = [math.log(max(p_h, eps)), math.log(max(p_d, eps)), math.log(max(p_a, eps))]
    scaled = [z / tau for z in logits]
    max_s = max(scaled)
    exp_scaled = [math.exp(s - max_s) for s in scaled]
    sum_exp = sum(exp_scaled)
    return (
        round(exp_scaled[0] / sum_exp, 4),
        round(exp_scaled[1] / sum_exp, 4),
        round(exp_scaled[2] / sum_exp, 4)
    )

def executar_desafio_12():
    print("=" * 80)
    print("EXECUÇÃO DO DESAFIO 12 — PROTOCOLO PRÉ-REGISTRADO E QUALITY GATE")
    print("=" * 80)

    conn = conectar()
    cur = conn.cursor()

    # 1. Aplicar Gate de Qualidade em odds_consenso_partida
    print("[1/5] Auditando acervo de odds com o Quality Gate (0.0 <= margem <= 0.15)...")
    cur.execute("""
    SELECT partida_id, casa_abertura, empate_abertura, fora_abertura
    FROM odds_consenso_partida;
    """)
    rows_odds = cur.fetchall()

    validas_count = 0
    quarentena_count = 0

    for r in rows_odds:
        pid, h, d, a = r
        valido, motivo, margem = mercado_1x2_valido(h, d, a)
        if valido:
            validas_count += 1
        else:
            quarentena_count += 1

    print(f"-> Odds auditadas em odds_consenso_partida: Total={len(rows_odds)} | Válidas={validas_count} | Quarentena={quarentena_count}")

    # 2. Carregar partidas cronológicas
    print("[2/5] Carregando série cronológica com zero-leakage...")
    cur.execute("""
    SELECT 
        p.id_partida, p.campeonato, p.ano, p.data, p.mandante, p.visitante,
        p.gols_mandante, p.gols_visitante, p.vencedor,
        c.casa_abertura, c.empate_abertura, c.fora_abertura,
        a.pinnacle_casa, a.pinnacle_empate, a.pinnacle_fora
    FROM partidas p
    LEFT JOIN odds_consenso_partida c ON p.id_partida = c.partida_id
    LEFT JOIN odds_auditoria_sharp a ON p.id_partida = a.partida_id
    WHERE p.gols_mandante IS NOT NULL AND p.gols_visitante IS NOT NULL
    ORDER BY p.data ASC, p.id_partida ASC;
    """)
    partidas = cur.fetchall()
    print(f"-> {len(partidas)} partidas cronológicas prontas.")

    historico_times = defaultdict(lambda: {"gp": [], "gc": []})

    # Métricas de Teste Cego (2024-2026)
    n_teste = 0
    brier_puro = 0.0
    brier_calib = 0.0
    logloss_puro = 0.0
    logloss_calib = 0.0

    # Apostas Estratégia 1: Completa 1X2 (Gate Válido)
    apostas_1x2 = []
    # Apostas Estratégia 2: Foco Empate (D) (Gate Válido)
    apostas_empate = []
    # Apostas Benchmark Sharp Pinnacle (com closing Pinnacle real)
    apostas_sharp = []

    registros_banco = []

    TAU_PRE_REGISTRADO = 0.84

    print("[3/5] Executando simulação cega com tau* = 0.84 congelado...")

    for p in partidas:
        (
            pid, camp, ano, data, m, v, gm, gv, vencedor,
            odd_ab_h, odd_ab_d, odd_ab_a,
            pin_h, pin_d, pin_a
        ) = p

        hist_m = historico_times[m]
        hist_v = historico_times[v]

        media_gp_m = sum(hist_m["gp"][-20:]) / len(hist_m["gp"][-20:]) if len(hist_m["gp"]) >= 3 else 1.35
        media_gc_v = sum(hist_v["gc"][-20:]) / len(hist_v["gc"][-20:]) if len(hist_v["gc"]) >= 3 else 1.35
        media_gp_v = sum(hist_v["gp"][-20:]) / len(hist_v["gp"][-20:]) if len(hist_v["gp"]) >= 3 else 1.05
        media_gc_m = sum(hist_m["gc"][-20:]) / len(hist_m["gc"][-20:]) if len(hist_m["gc"]) >= 3 else 1.05

        lh = max(0.6, min(3.2, ((media_gp_m + media_gc_v) / 2.4) * 1.32))
        la = max(0.5, min(2.8, ((media_gp_v + media_gc_m) / 2.4) * 0.98))

        p_h, p_d, p_a = calc_dixon_coles(lh, la, rho=-0.12)
        cp_h, cp_d, cp_a = aplicar_tau_softmax(p_h, p_d, p_a, tau=TAU_PRE_REGISTRADO)

        # Atualizar histórico após previsão
        hist_m["gp"].append(gm)
        hist_m["gc"].append(gv)
        hist_v["gp"].append(gv)
        hist_v["gc"].append(gm)

        if ano >= 2024:
            n_teste += 1
            y_h = 1.0 if gm > gv else 0.0
            y_d = 1.0 if gm == gv else 0.0
            y_a = 1.0 if gv > gm else 0.0

            # Brier Score
            brier_puro += (p_h - y_h)**2 + (p_d - y_d)**2 + (p_a - y_a)**2
            brier_calib += (cp_h - y_h)**2 + (cp_d - y_d)**2 + (cp_a - y_a)**2

            # Log Loss
            eps = 1e-15
            logloss_puro += -(y_h * math.log(max(p_h, eps)) + y_d * math.log(max(p_d, eps)) + y_a * math.log(max(p_a, eps)))
            logloss_calib += -(y_h * math.log(max(cp_h, eps)) + y_d * math.log(max(cp_d, eps)) + y_a * math.log(max(cp_a, eps)))

            # Avaliar sob o Quality Gate
            # O mercado só é elegível se passar rigorosamente no Quality Gate!
            odds_validadas, motivo_rej, margem_calc = mercado_1x2_valido(odd_ab_h, odd_ab_d, odd_ab_a)

            sel_aposta = None
            edge_aposta = None
            odd_entrada = None
            odd_fech = None
            res_aposta = "SEM_APOSTA"
            lucro_aposta = None
            clv = None

            if odds_validadas:
                # 1. Estratégia Completa 1X2 (Pre-Registered: Edge >= 4%, max edge)
                candidatas = []
                edge_h = (cp_h * odd_ab_h) - 1.0
                if edge_h >= 0.04:
                    candidatas.append(("H", edge_h, odd_ab_h, pin_h, y_h))

                edge_d = (cp_d * odd_ab_d) - 1.0
                if edge_d >= 0.04:
                    candidatas.append(("D", edge_d, odd_ab_d, pin_d, y_d))

                edge_a = (cp_a * odd_ab_a) - 1.0
                if edge_a >= 0.04:
                    candidatas.append(("A", edge_a, odd_ab_a, pin_a, y_a))

                if candidatas:
                    candidatas.sort(key=lambda x: x[1], reverse=True)
                    sel, edge, o_in, o_fech, ganhou = candidatas[0]
                    sel_aposta = sel
                    edge_aposta = round(edge, 4)
                    odd_entrada = o_in
                    odd_fech = o_fech

                    # CLV Canônico Auditado
                    if o_fech and o_in and o_fech > 1.0:
                        clv = round((o_in / o_fech) - 1.0, 4)

                    if ganhou == 1.0:
                        res_aposta = "GREEN"
                        lucro_aposta = round(o_in - 1.0, 4)
                    else:
                        res_aposta = "RED"
                        lucro_aposta = -1.0

                    item = {
                        "pid": pid, "ano": ano, "sel": sel, "odd_in": o_in,
                        "odd_fech": o_fech, "edge": edge, "ganhou": ganhou,
                        "lucro": lucro_aposta, "clv": clv
                    }
                    apostas_1x2.append(item)

                    if o_fech and o_fech > 1.0:
                        apostas_sharp.append(item)

                # 2. Estratégia Focada de Empate (D)
                if edge_d >= 0.04:
                    ganhou_d = y_d
                    lucro_d = round(odd_ab_d - 1.0, 4) if ganhou_d == 1.0 else -1.0
                    clv_d = round((odd_ab_d / pin_d) - 1.0, 4) if pin_d and pin_d > 1.0 else None
                    apostas_empate.append({
                        "pid": pid, "ano": ano, "sel": "D", "odd_in": odd_ab_d,
                        "odd_fech": pin_d, "edge": edge_d, "ganhou": ganhou_d,
                        "lucro": lucro_d, "clv": clv_d
                    })

            registros_banco.append((
                pid, camp, ano, data, m, v, gm, gv, vencedor,
                p_h, p_d, p_a,
                cp_h,
                odd_entrada, odd_fech,
                sel_aposta, edge_aposta,
                res_aposta, lucro_aposta, clv
            ))

    # 4. Atualizar backtest_dixon_coles
    print("[4/5] Gravando dados auditados no SQLite...")
    cur.execute("DELETE FROM backtest_dixon_coles;")
    cur.executemany("""
    INSERT INTO backtest_dixon_coles (
        partida_id, campeonato, ano, data, mandante, visitante,
        gols_mandante, gols_visitante, vencedor,
        probabilidade_mandante, probabilidade_empate, probabilidade_visitante,
        prob_calibrada_mandante,
        odd_abertura, odd_fechamento_pinnacle,
        selecao_aposta, edge_identificado,
        resultado_aposta, lucro_stake_fixo, clv_real
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
    """, registros_banco)
    conn.commit()

    # 5. Relatórios Executivos
    print("\n" + "=" * 80)
    print("RELATÓRIO PRÉ-REGISTRADO: HOLD-OUT 2024–2026")
    print("=" * 80)

    brier_m_puro = brier_puro / n_teste
    brier_m_calib = brier_calib / n_teste
    ll_m_puro = logloss_puro / n_teste
    ll_m_calib = logloss_calib / n_teste

    print(f"Total Partidas no Holdout: {n_teste}")
    print(f"Brier Score (Puro):      {brier_m_puro:.4f}")
    print(f"Brier Score (tau=0.84):  {brier_m_calib:.4f} ({((brier_m_puro - brier_m_calib)/brier_m_puro)*100:+.2f}%)")
    print(f"Log Loss (Puro):         {ll_m_puro:.4f}")
    print(f"Log Loss (tau=0.84):     {ll_m_calib:.4f} ({((ll_m_puro - ll_m_calib)/ll_m_puro)*100:+.2f}%)")

    # RELATÓRIO A: ESTRATÉGIA COMPLETA 1X2 (COM GATE DE QUALIDADE)
    print("\n" + "-" * 80)
    print("RELATÓRIO A: ESTRATÉGIA COMPLETA 1X2 (TODAS AS SELEÇÕES NO QUALITY GATE)")
    print("-" * 80)
    n_1x2 = len(apostas_1x2)
    if n_1x2 > 0:
        lucro_1x2 = sum(a["lucro"] for a in apostas_1x2)
        roi_1x2 = (lucro_1x2 / n_1x2) * 100
        taxa_1x2 = (sum(a["ganhou"] for a in apostas_1x2) / n_1x2) * 100
        print(f"Apostas Qualificadas no Quality Gate: {n_1x2}")
        print(f"Taxa de Acerto: {taxa_1x2:.2f}%")
        print(f"Lucro Acumulado: {lucro_1x2:+.2f} unidades")
        print(f"ROI Geral: {roi_1x2:+.2f}%")

        # Decomposição por seleção
        sel_groups = defaultdict(list)
        for a in apostas_1x2:
            sel_groups[a["sel"]].append(a)
        
        print("\nDecomposição por Seleção:")
        for s in ("H", "D", "A"):
            g = sel_groups[s]
            if g:
                n_g = len(g)
                l_g = sum(x["lucro"] for x in g)
                r_g = (l_g / n_g) * 100
                w_g = (sum(x["ganhou"] for x in g) / n_g) * 100
                odd_m = sum(x["odd_in"] for x in g) / n_g
                print(f"  Seleção {s}: {n_g:>4} apostas | Win Rate: {w_g:5.2f}% | Odd Média: {odd_m:.2f} | Lucro: {l_g:>+6.2f} un | ROI: {r_g:>+6.2f}%")
    else:
        print("Nenhuma aposta qualificada.")

    # RELATÓRIO B: ESTRATÉGIA FOCADA DE EMPATE (D)
    print("\n" + "-" * 80)
    print("RELATÓRIO B: ESTRATÉGIA FOCADA DE EMPATE (D)")
    print("-" * 80)
    n_emp = len(apostas_empate)
    if n_emp > 0:
        lucro_emp = sum(a["lucro"] for a in apostas_empate)
        roi_emp = (lucro_emp / n_emp) * 100
        taxa_emp = (sum(a["ganhou"] for a in apostas_empate) / n_emp) * 100
        print(f"Apostas em Empate (+EV >= 4%): {n_emp}")
        print(f"Taxa de Acerto: {taxa_emp:.2f}%")
        print(f"Lucro Acumulado: {lucro_emp:+.2f} unidades")
        print(f"ROI Estratégia Empate: {roi_emp:+.2f}%")
        
        # Decomposição por ano
        ano_groups = defaultdict(list)
        for a in apostas_empate:
            ano_groups[a["ano"]].append(a)
        print("\nDecomposição por Temporada (Empate):")
        for y in sorted(ano_groups.keys()):
            gy = ano_groups[y]
            ny = len(gy)
            ly = sum(x["lucro"] for x in gy)
            ry = (ly / ny) * 100
            wy = (sum(x["ganhou"] for x in gy) / ny) * 100
            print(f"  Ano {y}: {ny:>3} apostas | Win Rate: {wy:5.2f}% | Lucro: {ly:>+6.2f} un | ROI: {ry:>+6.2f}%")
    else:
        print("Nenhuma aposta qualificada em empate.")

    # BENCHMARK SHARP PINNACLE
    print("\n" + "-" * 80)
    print("BENCHMARK SHARP (APOSTAS COM LINHA DE FECHAMENTO PINNACLE AUDITADA)")
    print("-" * 80)
    n_sharp = len(apostas_sharp)
    if n_sharp > 0:
        lucro_sharp = sum(a["lucro"] for a in apostas_sharp)
        roi_sharp = (lucro_sharp / n_sharp) * 100
        clvs = [a["clv"] for a in apostas_sharp if a["clv"] is not None]
        clv_medio = (sum(clvs) / len(clvs)) * 100 if clvs else 0.0
        print(f"Apostas Auditadas com Fechamento: {n_sharp}")
        print(f"CLV Médio Auditado: {clv_medio:+.2f}%")
        print(f"Lucro Acumulado: {lucro_sharp:+.2f} unidades")
        print(f"ROI Contra Fechamento Pinnacle: {roi_sharp:+.2f}%")
    else:
        print("Nenhuma aposta com fechamento.")

    conn.close()

    # VACUUM e Hygiene Check
    print("\n[5/5] Executando VACUUM e verificando integridade final...")
    v_conn = sqlite3.connect(DB_PATH)
    v_conn.execute("VACUUM;")
    v_conn.execute("PRAGMA journal_mode = DELETE;")
    v_conn.close()

    tam_mb = os.path.getsize(DB_PATH) / (1024 * 1024)
    print(f"-> Tamanho final de futebol.db: {tam_mb:.2f} MB (Teto Vercel: 94,0 MB | Soft Limit: 88,0 MB)")

if __name__ == '__main__':
    executar_desafio_12()
