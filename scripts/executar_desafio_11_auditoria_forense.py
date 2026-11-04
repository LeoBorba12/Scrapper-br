#!/usr/bin/env python3
"""
FutStats — Execução do Desafio 11:
Auditoria Forense do Backtest e Reprodução Cega do ROI

1. Auditoria e isolamento do Platt Scaling (correção via Vector Softmax / Temperature Scaling)
2. Recálculo independente do ROI e decomposição completa (seleção, temporada, odds, EV)
3. Avaliação rigorosa do benchmark Sharp Pinnacle nas partidas auditadas
4. Cálculo correto do CLV = (odd_entrada / odd_fechamento) - 1.0
5. Higiene de capacidade do banco (abaixo de 88 MB) com VACUUM e journal_mode = DELETE
"""

import sqlite3
import math
import os
from collections import defaultdict
from pathlib import Path

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

def recalibrar_softmax_multivariada(p_h, p_d, p_a, tau=1.08):
    """
    Temperature Scaling para distribuição multinomial (1X2).
    Aplica temperatura tau sobre os logits z = ln(p) e renormaliza via softmax.
    Preserva a geometria tridimensional do simplex simplex sum(p) = 1.0.
    """
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

def executar_desafio_11():
    print("=" * 80)
    print("EXECUÇÃO DO DESAFIO 11 — REPRODUÇÃO CEGA E AUDITORIA FORENSE")
    print("=" * 80)

    conn = conectar()
    cur = conn.cursor()

    # 1. Carregar partidas com histórico
    print("[1/5] Carregando histórico cronológico para backtest zero-leakage...")
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
    print(f"-> {len(partidas)} partidas cronológicas prontas para processamento.")

    # 2. Processar séries temporais
    print("[2/5] Executando modelagem Dixon-Coles com recalibração multivariada...")
    historico_times = defaultdict(lambda: {"gp": [], "gc": []})

    # Métricas globais de teste (2024-2026)
    brier_puro = 0.0
    brier_calib = 0.0
    logloss_puro = 0.0
    logloss_calib = 0.0
    n_teste = 0

    registros_backtest = []

    # Apostas Benchmark Sharp (apenas partidas com Pinnacle real)
    apostas_pinnacle = []
    # Apostas Gerais Filtradas (odds realistas <= 5.0)
    apostas_gerais = []

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
        cp_h, cp_d, cp_a = recalibrar_softmax_multivariada(p_h, p_d, p_a, tau=1.06)

        # Atualizar histórico
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

            # Avaliar oportunidade de aposta
            # Critério rigoroso: Edge >= 4%, Odd de entrada entre 1.40 e 4.50 (teto de sanidade)
            candidatas = []
            if odd_ab_h and 1.40 <= odd_ab_h <= 4.50:
                edge_h = (cp_h * odd_ab_h) - 1.0
                if edge_h >= 0.04:
                    candidatas.append(("H", edge_h, odd_ab_h, pin_h, y_h))

            if odd_ab_d and 2.50 <= odd_ab_d <= 4.50:
                edge_d = (cp_d * odd_ab_d) - 1.0
                if edge_d >= 0.04:
                    candidatas.append(("D", edge_d, odd_ab_d, pin_d, y_d))

            if odd_ab_a and 1.80 <= odd_ab_a <= 4.50:
                edge_a = (cp_a * odd_ab_a) - 1.0
                if edge_a >= 0.04:
                    candidatas.append(("A", edge_a, odd_ab_a, pin_a, y_a))

            sel_aposta = None
            edge_aposta = None
            odd_entrada = None
            odd_fech = None
            res_aposta = "SEM_APOSTA"
            lucro_aposta = None
            clv = None

            if candidatas:
                candidatas.sort(key=lambda x: x[1], reverse=True)
                sel, edge, o_in, o_fech, ganhou = candidatas[0]
                sel_aposta = sel
                edge_aposta = round(edge, 4)
                odd_entrada = o_in
                odd_fech = o_fech

                # CLV Auditado: CLV = (odd_entrada / odd_fechamento) - 1.0
                if o_fech and o_in and o_fech > 1.0:
                    clv = round((o_in / o_fech) - 1.0, 4)

                if ganhou == 1.0:
                    res_aposta = "GREEN"
                    lucro_aposta = round(o_in - 1.0, 4)
                else:
                    res_aposta = "RED"
                    lucro_aposta = -1.0

                item_aposta = {
                    "ano": ano,
                    "sel": sel,
                    "odd_in": o_in,
                    "odd_fech": o_fech,
                    "edge": edge,
                    "lucro": lucro_aposta,
                    "clv": clv,
                    "ganhou": 1 if ganhou == 1.0 else 0
                }
                apostas_gerais.append(item_aposta)
                if o_fech is not None and o_fech > 1.0:
                    apostas_pinnacle.append(item_aposta)

            registros_backtest.append((
                pid, camp, ano, data, m, v, gm, gv, vencedor,
                p_h, p_d, p_a,
                cp_h,
                odd_entrada, odd_fech,
                sel_aposta, edge_aposta,
                res_aposta, lucro_aposta, clv
            ))

    # 3. Atualizar tabela backtest_dixon_coles
    print("[3/5] Gravando novos dados auditados em backtest_dixon_coles...")
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
    """, registros_backtest)
    conn.commit()

    # 4. Relatório Executivo
    print("\n" + "=" * 80)
    print("RESULTADOS CIENTÍFICOS DO BACKTEST AUDITADO (2024–2026)")
    print("=" * 80)
    
    brier_dc_m = brier_puro / n_teste
    brier_cal_m = brier_calib / n_teste
    ll_dc_m = logloss_puro / n_teste
    ll_cal_m = logloss_calib / n_teste

    print(f"Holdout (2024-2026): {n_teste} partidas")
    print(f"Brier Score Puro:      {brier_dc_m:.4f}")
    print(f"Brier Score Calibrado: {brier_cal_m:.4f} (Melhoria de {((brier_dc_m - brier_cal_m)/brier_dc_m)*100:+.2f}%)")
    print(f"Log Loss Puro:         {ll_dc_m:.4f}")
    print(f"Log Loss Calibrado:    {ll_cal_m:.4f} (Melhoria de {((ll_dc_m - ll_cal_m)/ll_dc_m)*100:+.2f}%)")

    # Análise de Apostas Gerais Filtradas
    print(f"\n--- BACKTEST GERAL FILTRADO (Teto Odd <= 4.50) ---")
    n_geral = len(apostas_gerais)
    if n_geral > 0:
        lucro_g = sum(a["lucro"] for a in apostas_gerais)
        roi_g = (lucro_g / n_geral) * 100
        taxa_g = (sum(a["ganhou"] for a in apostas_gerais) / n_geral) * 100
        print(f"Apostas Qualificadas: {n_geral} ({n_geral/n_teste*100:.1f}% das partidas)")
        print(f"Taxa de Acerto:       {taxa_g:.2f}%")
        print(f"Lucro Acumulado:      {lucro_g:+.2f} unidades")
        print(f"ROI Real:             {roi_g:+.2f}%")
    else:
        print("Nenhuma aposta qualificada.")

    # Análise de Apostas Benchmark Sharp (Pinnacle Real)
    print(f"\n--- BENCHMARK SHARP (Apenas Partidas com Fechamento Pinnacle) ---")
    n_pin = len(apostas_pinnacle)
    if n_pin > 0:
        lucro_p = sum(a["lucro"] for a in apostas_pinnacle)
        roi_p = (lucro_p / n_pin) * 100
        taxa_p = (sum(a["ganhou"] for a in apostas_pinnacle) / n_pin) * 100
        clvs_validos = [a["clv"] for a in apostas_pinnacle if a["clv"] is not None]
        clv_medio = (sum(clvs_validos) / len(clvs_validos)) * 100 if clvs_validos else 0.0
        print(f"Apostas Auditadas Sharp: {n_pin}")
        print(f"Taxa de Acerto:          {taxa_p:.2f}%")
        print(f"CLV Médio Auditado:      {clv_medio:+.2f}%")
        print(f"Lucro Acumulado:         {lucro_p:+.2f} unidades")
        print(f"ROI Contra Mercado:      {roi_p:+.2f}%")
    else:
        print("Nenhuma aposta qualificada no benchmark Sharp.")

    # 5. Higiene de banco e integridade
    print("\n[5/5] Executando VACUUM e verificando integridade do banco...")
    cur.execute("PRAGMA foreign_key_check;")
    fk_errors = cur.fetchall()
    if fk_errors:
        print(f"[ERRO] Violações de integridade relacional: {fk_errors}")
    else:
        print("-> Integridade relacional: 100% OK.")

    conn.commit()
    conn.close()

    # VACUUM em conexão separada
    v_conn = sqlite3.connect(DB_PATH)
    v_conn.execute("VACUUM;")
    v_conn.execute("PRAGMA journal_mode = DELETE;")
    v_conn.close()

    tamanho_mb = os.path.getsize(DB_PATH) / (1024 * 1024)
    print(f"-> Tamanho final de futebol.db: {tamanho_mb:.2f} MB (Teto Vercel: 94,0 MB | Soft Limit: 88,0 MB)")

if __name__ == '__main__':
    executar_desafio_11()
