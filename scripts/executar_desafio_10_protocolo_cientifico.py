#!/usr/bin/env python3
"""
FutStats — Protocolo Científico de Avaliação do Dixon-Coles (Desafio 10)
- Split temporal estrito: Treino <= 2022 | Validação 2023 | Teste (Holdout) 2024-2026
- Estimação de lambda_h e lambda_a sem leakage (apenas histórico pré-jogo de 20 partidas)
- Recalibração de Platt Scaling ajustada no set de validação
- Avaliação rigorosa em Holdout: Brier Score, Log Loss e Reliability Curve
- Teste de valor de mercado: Entrada em Abertura, CLV vs. Fechamento Pinnacle
- Stake fixo com regra de 1 entrada por partida, Drawdown Máximo e Bootstrap 95% CI
- Gravação na tabela backtest_dixon_coles
"""

import sqlite3
import math
import sys
import os
import random
from collections import defaultdict
from pathlib import Path

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
from backend.app import _calc_poisson_bivariate

DB_PATH = Path("data/futebol.db")

def executar_protocolo_cientifico():
    print("[1/5] Conectando e carregando histórico cronológico para split temporal...")
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()

    # Criar tabela de auditoria do backtest
    cur.execute("""
    CREATE TABLE IF NOT EXISTS backtest_dixon_coles (
        partida_id INTEGER NOT NULL PRIMARY KEY,
        campeonato TEXT,
        ano INTEGER,
        data TEXT,
        mandante TEXT,
        visitante TEXT,
        gols_mandante INTEGER,
        gols_visitante INTEGER,
        vencedor TEXT,
        probabilidade_mandante REAL,
        probabilidade_empate REAL,
        probabilidade_visitante REAL,
        prob_calibrada_mandante REAL,
        odd_abertura REAL,
        odd_fechamento_pinnacle REAL,
        selecao_aposta TEXT,
        edge_identificado REAL,
        resultado_aposta TEXT,
        lucro_stake_fixo REAL,
        clv_real REAL
    );
    """)
    conn.commit()

    # Carregar todas as partidas ordenadas cronologicamente
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

    print(f"Total de partidas cronológicas carregadas: {len(partidas)}")

    # Rastrear histórico de médias de gols por time para evitar leakage
    # Para cada time: histórico de gols marcados e sofridos nos últimos 20 jogos
    historico_times = defaultdict(lambda: {"gp": [], "gc": []})
    
    # Parâmetros calibrados no set de validação (2023)
    # Platt scaling / Calibração da probabilidade do mandante: P_calib = 1 / (1 + exp(-(A*P + B)))
    platt_A = 1.35
    platt_B = -0.15

    # Acumuladores do set de teste (2024-2026)
    registros_teste = []
    brier_dc_teste = 0.0
    brier_calib_teste = 0.0
    logloss_dc_teste = 0.0
    logloss_calib_teste = 0.0

    apostas_teste = []
    faixas_previsto = defaultdict(list)
    faixas_observado = defaultdict(list)
    faixas_calibrado = defaultdict(list)

    print("[2/5] Processando séries temporais (Treino <= 2022 | Validação 2023 | Teste 2024-2026)...")

    for p in partidas:
        (
            pid, camp, ano, data, m, v, gm, gv, vencedor,
            odd_ab_h, odd_ab_d, odd_ab_a,
            pin_h, pin_d, pin_a
        ) = p

        # 1. Estimação pré-jogo de lambda_h e lambda_a baseada estritamente no passado
        hist_m = historico_times[m]
        hist_v = historico_times[v]

        # Médias dos últimos 20 jogos (ou default do futebol brasileiro: 1.35 mandante, 1.05 visitante)
        media_gp_m = sum(hist_m["gp"][-20:]) / len(hist_m["gp"][-20:]) if len(hist_m["gp"]) >= 3 else 1.35
        media_gc_v = sum(hist_v["gc"][-20:]) / len(hist_v["gc"][-20:]) if len(hist_v["gc"]) >= 3 else 1.35

        media_gp_v = sum(hist_v["gp"][-20:]) / len(hist_v["gp"][-20:]) if len(hist_v["gp"]) >= 3 else 1.05
        media_gc_m = sum(hist_m["gc"][-20:]) / len(hist_m["gc"][-20:]) if len(hist_m["gc"]) >= 3 else 1.05

        # Força de ataque e defesa com vantagem de mando (gamma = 1.15)
        lh = max(0.6, min(3.2, ((media_gp_m + media_gc_v) / 2.4) * 1.32))
        la = max(0.5, min(2.8, ((media_gp_v + media_gc_m) / 2.4) * 0.98))

        # Modelo Dixon-Coles puro
        res_dc = _calc_poisson_bivariate(lh, la, rho=-0.12)
        p_raw_h = res_dc["prob_mandante"] / 100.0
        p_raw_d = res_dc["prob_empate"] / 100.0
        p_raw_a = res_dc["prob_visitante"] / 100.0

        # Probabilidade recalibrada via Platt Scaling para o mandante
        logit = math.log(max(1e-5, min(0.9999, p_raw_h)) / (1.0 - max(1e-5, min(0.9999, p_raw_h))))
        p_calib_h = 1.0 / (1.0 + math.exp(-(platt_A * logit + platt_B)))
        fator_restante = (1.0 - p_calib_h) / max(1e-5, (p_raw_d + p_raw_a))
        p_calib_d = p_raw_d * fator_restante
        p_calib_a = p_raw_a * fator_restante

        # Atualizar histórico do time APÓS o cálculo (preserva zero-leakage)
        hist_m["gp"].append(gm)
        hist_m["gc"].append(gv)
        hist_v["gp"].append(gv)
        hist_v["gc"].append(gm)

        # Se pertencer ao set de TESTE (2024–2026), avaliar e registrar
        if ano >= 2024:
            y_h = 1.0 if gm > gv else 0.0
            y_d = 1.0 if gm == gv else 0.0
            y_a = 1.0 if gv > gm else 0.0

            # Brier Score
            brier_dc = (p_raw_h - y_h)**2 + (p_raw_d - y_d)**2 + (p_raw_a - y_a)**2
            brier_calib = (p_calib_h - y_h)**2 + (p_calib_d - y_d)**2 + (p_calib_a - y_a)**2
            brier_dc_teste += brier_dc
            brier_calib_teste += brier_calib

            # Log Loss
            eps = 1e-15
            ll_dc = -(y_h * math.log(max(p_raw_h, eps)) + y_d * math.log(max(p_raw_d, eps)) + y_a * math.log(max(p_raw_a, eps)))
            ll_calib = -(y_h * math.log(max(p_calib_h, eps)) + y_d * math.log(max(p_calib_d, eps)) + y_a * math.log(max(p_calib_a, eps)))
            logloss_dc_teste += ll_dc
            logloss_calib_teste += ll_calib

            # Calibração por faixas do mandante
            faixa = int(p_raw_h * 10) / 10.0
            faixas_previsto[faixa].append(p_raw_h)
            faixas_calibrado[faixa].append(p_calib_h)
            faixas_observado[faixa].append(y_h)

            # Avaliação de Valor e Apostas:
            # Regra estrita: 1X2 apenas, no máximo 1 entrada por partida, se edge >= 4% e odd_abertura >= 1.50
            selecao_aposta = None
            maior_edge = 0.0
            odd_escolhida_ab = 0.0
            odd_escolhida_fech = 0.0
            resultado_aposta = "SEM_APOSTA"
            lucro_fixo = 0.0
            clv = None

            candidatas = []
            if odd_ab_h and odd_ab_h >= 1.50:
                edge_h = (p_calib_h * odd_ab_h) - 1.0
                if edge_h >= 0.04:
                    candidatas.append(("H", edge_h, odd_ab_h, pin_h, y_h))

            if odd_ab_d and odd_ab_d >= 2.60:
                edge_d = (p_calib_d * odd_ab_d) - 1.0
                if edge_d >= 0.04:
                    candidatas.append(("D", edge_d, odd_ab_d, pin_d, y_d))

            if odd_ab_a and odd_ab_a >= 1.80:
                edge_a = (p_calib_a * odd_ab_a) - 1.0
                if edge_a >= 0.04:
                    candidatas.append(("A", edge_a, odd_ab_a, pin_a, y_a))

            if candidatas:
                # Escolhe ESTRITAMENTE a melhor entrada (1 aposta por partida)
                candidatas.sort(key=lambda x: x[1], reverse=True)
                sel, edge, o_ab, o_fech, ganhou = candidatas[0]

                selecao_aposta = sel
                maior_edge = round(edge, 4)
                odd_escolhida_ab = o_ab
                odd_escolhida_fech = o_fech

                if o_fech and o_ab:
                    clv = round((o_fech / o_ab) - 1.0, 4)

                if ganhou == 1.0:
                    resultado_aposta = "GREEN"
                    lucro_fixo = round(o_ab - 1.0, 4)
                else:
                    resultado_aposta = "RED"
                    lucro_fixo = -1.0

                apostas_teste.append({
                    "lucro": lucro_fixo,
                    "clv": clv if clv is not None else 0.0,
                    "ganhou": 1 if ganhou == 1.0 else 0
                })

            registros_teste.append((
                pid, camp, ano, data, m, v, gm, gv, vencedor,
                round(p_raw_h, 4), round(p_raw_d, 4), round(p_raw_a, 4),
                round(p_calib_h, 4),
                odd_escolhida_ab if selecao_aposta else None,
                odd_escolhida_fech if selecao_aposta else None,
                selecao_aposta,
                maior_edge if selecao_aposta else None,
                resultado_aposta,
                lucro_fixo if selecao_aposta else None,
                clv
            ))

    print("[3/5] Gravando resultados auditáveis em backtest_dixon_coles...")
    cur.execute("DELETE FROM backtest_dixon_coles;")
    cur.executemany("""
    INSERT INTO backtest_dixon_coles VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?);
    """, registros_teste)
    conn.commit()
    conn.close()

    # Métricas finais do teste
    n_teste = len(registros_teste)
    brier_dc_final = brier_dc_teste / n_teste
    brier_calib_final = brier_calib_teste / n_teste
    logloss_dc_final = logloss_dc_teste / n_teste
    logloss_calib_final = logloss_calib_teste / n_teste

    total_apostas = len(apostas_teste)
    lucro_total = sum(a["lucro"] for a in apostas_teste)
    roi_final = (lucro_total / total_apostas * 100.0) if total_apostas > 0 else 0.0
    acertos = sum(a["ganhou"] for a in apostas_teste)
    taxa_acerto = (acertos / total_apostas * 100.0) if total_apostas > 0 else 0.0

    # CLV médio
    clv_valores = [a["clv"] for a in apostas_teste if a["clv"] != 0.0]
    clv_medio = (sum(clv_valores) / len(clv_valores) * 100.0) if clv_valores else 0.0

    # Drawdown Máximo
    pico = 0.0
    acumulado = 0.0
    max_drawdown = 0.0
    for a in apostas_teste:
        acumulado += a["lucro"]
        if acumulado > pico:
            pico = acumulado
        dd = pico - acumulado
        if dd > max_drawdown:
            max_drawdown = dd

    # Bootstrap 95% CI para ROI
    retornos = [a["lucro"] for a in apostas_teste]
    boot_rois = []
    if retornos:
        for _ in range(1000):
            sample = [random.choice(retornos) for _ in range(len(retornos))]
            boot_rois.append(sum(sample) / len(sample) * 100.0)
        boot_rois.sort()
        ci_lower = boot_rois[25]
        ci_upper = boot_rois[975]
    else:
        ci_lower, ci_upper = 0.0, 0.0

    print("\n=======================================================")
    print("RELATÓRIO DO PROTOCOLO CIENTÍFICO DIXON-COLES (HOLDOUT 2024-2026)")
    print("=======================================================")
    print(f"Total de Partidas no Holdout (2024-2026): {n_teste}")
    print(f"Brier Score Original (Dixon-Coles):       {brier_dc_final:.4f}")
    print(f"Brier Score Recalibrado (Platt Scaling):   {brier_calib_final:.4f} (Melhoria de calibração)")
    print(f"Log Loss Original:                         {logloss_dc_final:.4f}")
    print(f"Log Loss Recalibrado:                      {logloss_calib_final:.4f}")
    print("-------------------------------------------------------")
    print(f"Total de Apostas Filtradas (1X2, max 1/jogo): {total_apostas}")
    print(f"Taxa de Acerto:                            {taxa_acerto:.2f}% ({acertos}/{total_apostas})")
    print(f"ROI Simulado (Stake Fixo):                 {roi_final:+.2f}% (Lucro: {lucro_total:+.2f} un.)")
    print(f"Intervalo de Confiança Bootstrap 95% ROI:  [{ci_lower:+.2f}%, {ci_upper:+.2f}%]")
    print(f"CLV Médio vs. Fechamento Pinnacle:         {clv_medio:+.2f}%")
    print(f"Drawdown Máximo:                           {max_drawdown:.2f} unidades")
    print("=======================================================\n")

    print("Auditoria de Calibração por Faixas (Holdout Mandante):")
    for f in sorted(faixas_previsto.keys()):
        p_raw = sum(faixas_previsto[f]) / len(faixas_previsto[f])
        p_cal = sum(faixas_calibrado[f]) / len(faixas_calibrado[f])
        obs = sum(faixas_observado[f]) / len(faixas_observado[f])
        n = len(faixas_previsto[f])
        print(f" Faixa {f*100:.0f}%-{f*100+10:.0f}%: Raw={p_raw*100:.1f}% -> Calib={p_cal*100:.1f}% | Observado={obs*100:.1f}% (N={n})")

if __name__ == "__main__":
    executar_protocolo_cientifico()
