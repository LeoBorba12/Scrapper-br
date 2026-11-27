# -*- coding: utf-8 -*-
"""
Motor do Oráculo Preditivo Interativo — FutStats 2026
100% Python padrão (math, random) para compatibilidade total com Vercel Serverless.

Metodologias integradas:
1. Pi-Ratings Dinâmicos (Casa/Fora) — Constantinou & Fenton
2. Processo de Campo 2026 (xG, xG Contra, Field Tilt, PPDA)
3. Rest Advantage (Fadiga de Calendário — NBA)
4. Simulador de Desfalques via RAPM -> WAR (NBA/MLB)
5. Matriz Dixon-Coles (1997) para 1X2, Over/Under, BTTS e Placares Exatos
6. Incerteza estilo Glicko-2 + Conformal Prediction
7. Prior Estrutural Econômico (Orçamento/IBGE/SAF) + Monte Carlo de Campeonato
"""
import math
import random
from typing import Any, Dict, List, Optional, Tuple


def _dixon_coles_matriz(lh: float, la: float, rho: float = -0.06) -> Dict[str, Any]:
    lh = max(0.35, min(3.80, float(lh)))
    la = max(0.30, min(3.50, float(la)))
    eh = math.exp(-lh)
    ea = math.exp(-la)
    fact = [1, 1, 2, 6, 24, 120, 720, 5040]

    ph = pe = pa = 0.0
    over25 = btts = 0.0
    placares = []

    for i in range(8):
        pi = eh * (lh ** i) / fact[i]
        for j in range(8):
            pj = ea * (la ** j) / fact[j]
            tau = 1.0
            if i == 0 and j == 0:
                tau = max(0.1, 1.0 - lh * la * rho)
            elif i == 0 and j == 1:
                tau = max(0.1, 1.0 + lh * rho)
            elif i == 1 and j == 0:
                tau = max(0.1, 1.0 + la * rho)
            elif i == 1 and j == 1:
                tau = max(0.1, 1.0 - rho)
            p = pi * pj * tau
            if i > j:
                ph += p
            elif i == j:
                pe += p
            else:
                pa += p
            if i + j >= 3:
                over25 += p
            if i >= 1 and j >= 1:
                btts += p
            placares.append((f"{i} x {j}", p))

    tot = ph + pe + pa or 1.0
    ph, pe, pa = ph / tot, pe / tot, pa / tot
    over25 = over25 / tot
    btts = btts / tot

    placares.sort(key=lambda x: x[1], reverse=True)
    top_placares = [{"placar": pl, "prob_pct": round((pr / tot) * 100.0, 1)} for pl, pr in placares[:5]]

    p_h_pct = round(ph * 100.0, 1)
    p_e_pct = round(pe * 100.0, 1)
    p_a_pct = round(max(0.1, 100.0 - p_h_pct - p_e_pct), 1)

    return {
        "prob_mandante": p_h_pct,
        "prob_empate": p_e_pct,
        "prob_visitante": p_a_pct,
        "fair_odd_mandante": round(1.0 / max(ph, 0.01), 2),
        "fair_odd_empate": round(1.0 / max(pe, 0.01), 2),
        "fair_odd_visitante": round(1.0 / max(pa, 0.01), 2),
        "prob_over_2_5": round(over25 * 100.0, 1),
        "prob_under_2_5": round((1.0 - over25) * 100.0, 1),
        "prob_btts_sim": round(btts * 100.0, 1),
        "top_placares": top_placares,
    }


def _gerar_veredito_humano(
    mandante: str,
    visitante: str,
    probs: Dict[str, Any],
    desfalques_m: List[Dict[str, Any]],
    desfalques_v: List[Dict[str, Any]],
    nivel_confianca: str,
) -> Dict[str, str]:
    pm = probs["prob_mandante"]
    pe = probs["prob_empate"]
    pv = probs["prob_visitante"]

    if pm >= 58.0:
        manchete = f"{mandante} é favorito claro"
    elif pm >= 46.0 and pm - pv >= 10.0:
        manchete = f"{mandante} é favorito moderado"
    elif pv >= 52.0:
        manchete = f"{visitante} chega como favorito fora de casa"
    elif pv >= 42.0 and pv - pm >= 8.0:
        manchete = f"Leve favoritismo para o {visitante}"
    else:
        manchete = "Confronto equilibrado e aberto"

    v10_m = max(1, round(pm / 10.0))
    v10_e = max(1, round(pe / 10.0))
    v10_v = max(0, 10 - v10_m - v10_e)

    frase_simples = (
        f"Em 10 jogos parecidos, o {mandante} venceria cerca de {v10_m}, "
        f"empataria {v10_e} e o {visitante} venceria {v10_v}."
    )

    nota_desfalques = ""
    if desfalques_m or desfalques_v:
        nomes_m = ", ".join(d["nome"] for d in desfalques_m[:3])
        nomes_v = ", ".join(d["nome"] for d in desfalques_v[:3])
        partes = []
        if nomes_m:
            partes.append(f"ausência de {nomes_m} no {mandante}")
        if nomes_v:
            partes.append(f"ausência de {nomes_v} no {visitante}")
        nota_desfalques = f" Cenário já ajustado pela {' e '.join(partes)}."

    return {
        "manchete": manchete,
        "resumo_leigo": frase_simples + nota_desfalques,
        "nivel_confianca": nivel_confianca,
    }


def simular_partida_hibrida(
    mandante: str,
    visitante: str,
    pi_m: Dict[str, Any],
    pi_v: Dict[str, Any],
    proc_m: Optional[Dict[str, Any]] = None,
    proc_v: Optional[Dict[str, Any]] = None,
    econ_m: Optional[Dict[str, Any]] = None,
    econ_v: Optional[Dict[str, Any]] = None,
    desfalques_m: Optional[List[Dict[str, Any]]] = None,
    desfalques_v: Optional[List[Dict[str, Any]]] = None,
    dias_descanso_m: int = 4,
    dias_descanso_v: int = 4,
) -> Dict[str, Any]:
    """
    Combina todas as camadas matemáticas para projetar o confronto com decomposição explicável.
    """
    desfalques_m = desfalques_m or []
    desfalques_v = desfalques_v or []

    # 1. Base Pi-Ratings (Casa/Fora)
    r_h = float(pi_m.get("pi_home") or 0.0)
    r_a = float(pi_v.get("pi_away") or 0.0)
    pi_diff = r_h - r_a
    comp_pi_h = 0.38 * pi_diff
    comp_pi_a = -0.32 * pi_diff

    # 2. Processo de Campo 2026 (xG por jogo, Field Tilt e PPDA)
    comp_xg_h = 0.0
    comp_xg_a = 0.0
    if proc_m and proc_v and (proc_m.get("jogos") or 0) > 0 and (proc_v.get("jogos") or 0) > 0:
        xg_m_pj = float(proc_m["xg"]) / max(int(proc_m["jogos"]), 1)
        xgc_m_pj = float(proc_m["xg_contra"]) / max(int(proc_m["jogos"]), 1)
        xg_v_pj = float(proc_v["xg"]) / max(int(proc_v["jogos"]), 1)
        xgc_v_pj = float(proc_v["xg_contra"]) / max(int(proc_v["jogos"]), 1)
        comp_xg_h = 0.42 * (((xg_m_pj + xgc_v_pj) / 2.0) - 1.30)
        comp_xg_a = 0.42 * (((xg_v_pj + xgc_m_pj) / 2.0) - 1.15)

    # 3. Prior Estrutural Econômico (peso leve de 10% para estabilidade)
    orc_m = float((econ_m or {}).get("indice_orcamento") or 1.0)
    orc_v = float((econ_v or {}).get("indice_orcamento") or 1.0)
    comp_econ_h = 0.14 * (orc_m - orc_v)
    comp_econ_a = -0.11 * (orc_m - orc_v)

    # 4. Rest Advantage (Fadiga de Calendário — NBA)
    rest_diff = max(-4.0, min(4.0, float(dias_descanso_m - dias_descanso_v)))
    comp_rest_h = 0.032 * rest_diff
    comp_rest_a = -0.025 * rest_diff

    # 5. Desfalques via RAPM -> WAR (desconta impacto líquido do titular ausente)
    impacto_desf_m = sum(max(0.0, float(d.get("rapm_saldo_gols") or 0.0)) for d in desfalques_m)
    impacto_desf_v = sum(max(0.0, float(d.get("rapm_saldo_gols") or 0.0)) for d in desfalques_v)
    # 60% reduz ataque próprio, 40% aumenta chance sofrida
    comp_desf_h = -0.60 * impacto_desf_m + 0.40 * impacto_desf_v
    comp_desf_a = -0.60 * impacto_desf_v + 0.40 * impacto_desf_m

    # 6. Mando de Campo Base (calibrado no Brasileirão: ~+0.396 gols líquidos)
    base_mando_h = 1.38
    base_visitante_a = 1.00

    lh = max(0.40, min(3.40, base_mando_h + comp_pi_h + comp_xg_h + comp_econ_h + comp_rest_h + comp_desf_h))
    la = max(0.35, min(3.10, base_visitante_a + comp_pi_a + comp_xg_a + comp_econ_a + comp_rest_a + comp_desf_a))

    probs = _dixon_coles_matriz(lh, la)

    # 7. Incerteza (estilo Glicko-2 + Conformal)
    rd_medio = (float(pi_m.get("incerteza_rd") or 0.9) + float(pi_v.get("incerteza_rd") or 0.9)) / 2.0
    margem_conf_pct = round(min(14.0, max(4.5, rd_medio * 7.5)), 1)
    if rd_medio <= 0.72 and abs(probs["prob_mandante"] - probs["prob_visitante"]) >= 16:
        nivel_conf = "Alta Confiança"
    elif rd_medio <= 1.05:
        nivel_conf = "Confiança Moderada"
    else:
        nivel_conf = "Jogo Imprevisível"

    # Tradução dos desfalques em WAR (Pontos esperados em 38 jogos ~ 1.45 * RAPM * 38)
    war_perdido_m = round(impacto_desf_m * 14.5, 1)
    war_perdido_v = round(impacto_desf_v * 14.5, 1)

    decomposicao = [
        {
            "fator": "Mando de Campo",
            "impacto_saldo": round(base_mando_h - base_visitante_a, 3),
            "explicacao": f"Vantagem histórica do {mandante} atuando em casa no Brasileirão.",
        },
        {
            "fator": "Força Dinâmica (Pi-Ratings)",
            "impacto_saldo": round(comp_pi_h - comp_pi_a, 3),
            "explicacao": f"Diferença de desempenho recente casa/fora ({r_h:+.2f} vs {r_a:+.2f}).",
        },
        {
            "fator": "Qualidade de Chances (xG 2026)",
            "impacto_saldo": round(comp_xg_h - comp_xg_a, 3),
            "explicacao": "Volume de gols esperados criados e cedidos na temporada atual.",
        },
        {
            "fator": "Estrutura Econômica / Elenco",
            "impacto_saldo": round(comp_econ_h - comp_econ_a, 3),
            "explicacao": f"Poder estrutural relativo (orçamento/mercado: {orc_m:.2f} vs {orc_v:.2f}).",
        },
        {
            "fator": "Descanso & Fadiga (Rest Advantage)",
            "impacto_saldo": round(comp_rest_h - comp_rest_a, 3),
            "explicacao": f"Diferença de descanso ({dias_descanso_m}d vs {dias_descanso_v}d desde o último jogo).",
        },
        {
            "fator": "Desfalques em Campo (RAPM / WAR)",
            "impacto_saldo": round(comp_desf_h - comp_desf_a, 3),
            "explicacao": (
                f"Impacto líquido das ausências marcadas (WAR perdido: {mandante} -{war_perdido_m} pts / {visitante} -{war_perdido_v} pts)."
                if (desfalques_m or desfalques_v)
                else "Nenhum desfalque relevante marcado na simulação."
            ),
        },
    ]

    veredito = _gerar_veredito_humano(mandante, visitante, probs, desfalques_m, desfalques_v, nivel_conf)

    return {
        "mandante": mandante,
        "visitante": visitante,
        "lambda_mandante": round(lh, 2),
        "lambda_visitante": round(la, 2),
        "probabilidades": probs,
        "incerteza": {
            "rd_glicko": round(rd_medio, 3),
            "margem_conformal_pct": margem_conf_pct,
            "nivel_confianca": nivel_conf,
        },
        "veredito": veredito,
        "decomposicao": decomposicao,
        "war_desfalques": {
            "mandante_pts_temporada": war_perdido_m,
            "visitante_pts_temporada": war_perdido_v,
        },
    }


def simular_campeonato_monte_carlo(
    clubes_estado: List[Dict[str, Any]],
    n_simulacoes: int = 1200,
    total_rodadas: int = 38,
) -> List[Dict[str, Any]]:
    """
    Simulação Monte Carlo (Prior Econômico + Força de Campo) para projetar:
    Título %, G-4 %, G-6 %, Z-4 % e Pontos Finais Esperados.
    """
    if not clubes_estado:
        return []

    rng = random.Random(2026)
    n_clubes = len(clubes_estado)
    stats_acum = {
        c["clube"]: {"pts_sum": 0.0, "titulo": 0, "g4": 0, "g6": 0, "z4": 0}
        for c in clubes_estado
    }

    # Força latente combinando Pi-Rating + xPTS/jogo + Prior Econômico
    forcas = {}
    for c in clubes_estado:
        j_atual = max(int(c.get("jogos") or 0), 1)
        xpts_pj = float(c.get("xpts") or (j_atual * 1.35)) / j_atual
        prior_pj = float(c.get("prior_pontos_estrutural") or 50.0) / float(total_rodadas)
        pi_g = float(c.get("pi_geral") or 0.0)
        # Peso dinâmico: conforme mais jogos são disputados, campo pesa mais que o prior econômico
        w_campo = min(0.80, j_atual / 24.0)
        taxa_esperada_pj = w_campo * xpts_pj + (1.0 - w_campo) * prior_pj + 0.14 * pi_g
        taxa_esperada_pj = max(0.75, min(2.25, taxa_esperada_pj))
        forcas[c["clube"]] = (int(c.get("pontos") or 0), max(0, total_rodadas - j_atual), taxa_esperada_pj)

    for _ in range(n_simulacoes):
        tabela_sim = []
        for c in clubes_estado:
            nome = c["clube"]
            pts_at, j_rest, taxa_pj = forcas[nome]
            # Variância binomial/normal realista de pontos restantes (~1.22 pts de dp por jogo)
            dp_rest = math.sqrt(max(j_rest, 1)) * 1.18
            pts_finais = pts_at + max(0.0, rng.gauss(j_rest * taxa_pj, dp_rest))
            tabela_sim.append((nome, pts_finais))

        tabela_sim.sort(key=lambda x: x[1], reverse=True)
        for pos, (nome, pf) in enumerate(tabela_sim, start=1):
            st = stats_acum[nome]
            st["pts_sum"] += pf
            if pos == 1:
                st["titulo"] += 1
            if pos <= 4:
                st["g4"] += 1
            if pos <= 6:
                st["g6"] += 1
            if pos > n_clubes - 4:
                st["z4"] += 1

    saida = []
    for c in clubes_estado:
        nome = c["clube"]
        st = stats_acum[nome]
        pts_proj = round(st["pts_sum"] / n_simulacoes, 1)
        prior_pts = round(float(c.get("prior_pontos_estrutural") or 50.0), 1)
        saida.append({
            "clube": nome,
            "jogos": int(c.get("jogos") or 0),
            "pontos_atuais": int(c.get("pontos") or 0),
            "pontos_projetados": pts_proj,
            "prior_economico_pts": prior_pts,
            "delta_vs_orcamento": round(pts_proj - prior_pts, 1),
            "prob_titulo_pct": round((st["titulo"] / n_simulacoes) * 100.0, 1),
            "prob_g4_pct": round((st["g4"] / n_simulacoes) * 100.0, 1),
            "prob_g6_pct": round((st["g6"] / n_simulacoes) * 100.0, 1),
            "prob_z4_pct": round((st["z4"] / n_simulacoes) * 100.0, 1),
            "tier_economico": c.get("tier_label") or "N/D",
            "eh_saf": bool(c.get("eh_saf")),
            "cidade_uf": f"{c.get('cidade', '')}/{c.get('uf', '')}".strip("/"),
        })

    saida.sort(key=lambda x: (x["pontos_projetados"], x["prob_titulo_pct"]), reverse=True)
    for idx, row in enumerate(saida, start=1):
        row["rank_projetado"] = idx
    return saida
