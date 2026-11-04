#!/usr/bin/env python3
"""
FutStats — Calibração Rigorosa de Temperatura (Temperature Scaling)
Executada estritamente no conjunto de VALIDAÇÃO (Temporada 2023).

Protocolo:
- Histórico pré-jogo de lambda_h e lambda_a treinado até 2022.
- No ano de 2023 (Validação), para cada partida válida:
  - Calcula probabilidades brutas de Dixon-Coles (lh, la, rho=-0.12).
  - Avalia o Brier Score e Log Loss para diferentes valores de tau in [0.80, 1.40].
- Seleciona tau* que minimiza o Log Loss na validação de 2023.
- Congela tau* para uso exclusivo e inalterado no set de teste (2024-2026).
"""

import sqlite3
import math
from collections import defaultdict
from pathlib import Path
import sys

sys.path.insert(0, str(Path(".").resolve()))
from backend.odds_quality_gate import mercado_1x2_valido

DB_PATH = Path("data/futebol.db")

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

def aplicar_tau(p_h, p_d, p_a, tau):
    eps = 1e-9
    logits = [math.log(max(p_h, eps)), math.log(max(p_d, eps)), math.log(max(p_a, eps))]
    scaled = [z / tau for z in logits]
    max_s = max(scaled)
    exp_scaled = [math.exp(s - max_s) for s in scaled]
    sum_exp = sum(exp_scaled)
    return exp_scaled[0] / sum_exp, exp_scaled[1] / sum_exp, exp_scaled[2] / sum_exp

def calibrar_tau_2023():
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()

    # Carregar histórico cronológico até 2023
    cur.execute("""
    SELECT 
        p.id_partida, p.campeonato, p.ano, p.data, p.mandante, p.visitante,
        p.gols_mandante, p.gols_visitante, p.vencedor
    FROM partidas p
    WHERE p.gols_mandante IS NOT NULL AND p.gols_visitante IS NOT NULL AND p.ano <= 2023
    ORDER BY p.data ASC, p.id_partida ASC;
    """)
    partidas = cur.fetchall()

    historico_times = defaultdict(lambda: {"gp": [], "gc": []})
    dados_validacao_2023 = []

    for p in partidas:
        pid, camp, ano, data, m, v, gm, gv, vencedor = p
        hist_m = historico_times[m]
        hist_v = historico_times[v]

        media_gp_m = sum(hist_m["gp"][-20:]) / len(hist_m["gp"][-20:]) if len(hist_m["gp"]) >= 3 else 1.35
        media_gc_v = sum(hist_v["gc"][-20:]) / len(hist_v["gc"][-20:]) if len(hist_v["gc"]) >= 3 else 1.35
        media_gp_v = sum(hist_v["gp"][-20:]) / len(hist_v["gp"][-20:]) if len(hist_v["gp"]) >= 3 else 1.05
        media_gc_m = sum(hist_m["gc"][-20:]) / len(hist_m["gc"][-20:]) if len(hist_m["gc"]) >= 3 else 1.05

        lh = max(0.6, min(3.2, ((media_gp_m + media_gc_v) / 2.4) * 1.32))
        la = max(0.5, min(2.8, ((media_gp_v + media_gc_m) / 2.4) * 0.98))

        p_h, p_d, p_a = calc_dixon_coles(lh, la, rho=-0.12)

        # Atualizar histórico
        hist_m["gp"].append(gm)
        hist_m["gc"].append(gv)
        hist_v["gp"].append(gv)
        hist_v["gc"].append(gm)

        # Apenas ano de 2023 entra na calibração de tau
        if ano == 2023:
            y_h = 1.0 if gm > gv else 0.0
            y_d = 1.0 if gm == gv else 0.0
            y_a = 1.0 if gv > gm else 0.0
            dados_validacao_2023.append((p_h, p_d, p_a, y_h, y_d, y_a))

    conn.close()

    n_val = len(dados_validacao_2023)
    print(f"Total de partidas na validação (2023): {n_val}")

    # Grade de busca de tau
    melhor_tau = 1.0
    menor_logloss = float('inf')
    menor_brier = float('inf')
    brier_tau1 = 0.0
    logloss_tau1 = 0.0

    eps = 1e-15

    for tau_int in range(80, 145, 1):
        tau = tau_int / 100.0
        ll_total = 0.0
        br_total = 0.0

        for ph, pd, pa, yh, yd, ya in dados_validacao_2023:
            cph, cpd, cpa = aplicar_tau(ph, pd, pa, tau)
            # Log loss
            ll = -(yh * math.log(max(cph, eps)) + yd * math.log(max(cpd, eps)) + ya * math.log(max(cpa, eps)))
            ll_total += ll
            # Brier
            br = (cph - yh)**2 + (cpd - yd)**2 + (cpa - ya)**2
            br_total += br

        ll_media = ll_total / n_val
        br_media = br_total / n_val

        if abs(tau - 1.0) < 1e-5:
            brier_tau1 = br_media
            logloss_tau1 = ll_media

        if ll_media < menor_logloss:
            menor_logloss = ll_media
            melhor_tau = tau
            menor_brier = br_media

    print("\n--- RESULTADO DA OTIMIZAÇÃO DE TAU (VALIDAÇÃO 2023) ---")
    print(f"tau = 1.00 (Puro):    Log Loss = {logloss_tau1:.4f} | Brier = {brier_tau1:.4f}")
    print(f"tau* Ótimo = {melhor_tau:.2f}: Log Loss = {menor_logloss:.4f} | Brier = {menor_brier:.4f}")
    melhoria_ll = ((logloss_tau1 - menor_logloss) / logloss_tau1) * 100
    print(f"Variação no Log Loss: {melhoria_ll:+.2f}%")
    
    return melhor_tau

if __name__ == '__main__':
    calibrar_tau_2023()
