# -*- coding: utf-8 -*-
"""
Motor Econométrico de Desempenho — FutStats 2026
Implementação leve em Python puro + NumPy (zero dependências pesadas na Vercel).

Métodos:
1. Empirical Bayes Shrinkage (James-Stein) por posição para taxas por 90 minutos (p90).
2. Padronização por Z-Score e Percentil Empírico por macro-função tática.
3. Power Ranking & Eficiência de Clubes (xPTS, Delta Sorte/Eficiência, Saldo xG, Field Tilt, PPDA).
"""
import math
from typing import Any, Dict, List
import numpy as np


PESOS_POSICAO = {
    "Atacante": {
        "npxg_p90": 0.35,
        "gca_p90": 0.25,
        "sca_p90": 0.20,
        "xa_p90": 0.12,
        "passes_prog_p90": 0.08,
    },
    "Meia": {
        "xa_p90": 0.30,
        "sca_p90": 0.28,
        "passes_prog_p90": 0.22,
        "gca_p90": 0.12,
        "npxg_p90": 0.08,
    },
    "Defensor": {
        "passes_prog_p90": 0.45,
        "sca_p90": 0.22,
        "xa_p90": 0.15,
        "npxg_p90": 0.10,
        "gca_p90": 0.08,
    },
    "Goleiro": {
        "passes_prog_p90": 0.50,
        "sca_p90": 0.25,
        "xa_p90": 0.15,
        "npxg_p90": 0.05,
        "gca_p90": 0.05,
    },
}


def classificar_macro_posicao(posicao_raw: str) -> str:
    p = (posicao_raw or "").strip().lower()
    if any(k in p for k in ("goleiro", "gk", "guarda")):
        return "Goleiro"
    if any(k in p for k in ("zagueiro", "lateral", "defensor", "beque", "def")):
        return "Defensor"
    if any(k in p for k in ("meia", "volante", "meio", "armador", "mid")):
        return "Meia"
    return "Atacante"


def calcular_eb_p90(valor_total: float, minutos: float, media_pos_p90: float, k_prior: float = 450.0) -> float:
    """
    Empirical Bayes Shrinkage para taxas por 90 minutos:
      theta_hat = (minutos * taxa_obs + k_prior * media_pos_p90) / (minutos + k_prior)
    """
    mins = max(float(minutos or 0.0), 0.0)
    k = max(float(k_prior or 450.0), 1.0)
    if mins <= 0.0:
        return round(float(media_pos_p90), 3)
    taxa_obs = (float(valor_total or 0.0) * 90.0) / mins
    estimativa = (mins * taxa_obs + k * float(media_pos_p90)) / (mins + k)
    return round(estimativa, 3)


def _nivel_confianca_amostral(minutos: float) -> str:
    m = float(minutos or 0.0)
    if m >= 1350:
        return "Alta"
    if m >= 630:
        return "Média"
    return "Inicial"


def calcular_indice_atletas(
    atletas_rows: List[Dict[str, Any]],
    k_prior: float = 450.0,
    min_minutos: int = 270,
    filtro_posicao: str = "",
    limite: int = 50,
) -> Dict[str, Any]:
    """
    Calcula o Índice Econométrico FutStats (0-100) com Empirical Bayes p90 e Z-Score por posição.
    """
    if not atletas_rows:
        return {"ranking": [], "resumo_posicoes": {}, "k_prior": k_prior}

    # 1. Enriquecer macro-posição e taxas brutas p90 para estimar priors por posição
    enriquecidos = []
    por_posicao: Dict[str, List[Dict[str, Any]]] = {}

    for r in atletas_rows:
        mins = float(r.get("minutos") or 0.0)
        if mins <= 0:
            continue
        macro = classificar_macro_posicao(r.get("posicao") or "")
        fator = 90.0 / mins
        item = dict(r)
        item["macro_posicao"] = macro
        item["npxg_p90_bruto"] = float(r.get("npxg") or 0.0) * fator
        item["xa_p90_bruto"] = float(r.get("xa") or 0.0) * fator
        item["sca_p90_bruto"] = float(r.get("sca") or 0.0) * fator
        item["gca_p90_bruto"] = float(r.get("gca") or 0.0) * fator
        item["passes_prog_p90_bruto"] = float(r.get("passes_progressivos") or 0.0) * fator
        enriquecidos.append(item)
        por_posicao.setdefault(macro, []).append(item)

    # 2. Priors ponderados por minutos para cada macro-posição
    metricas_keys = [
        ("npxg", "npxg_p90"),
        ("xa", "xa_p90"),
        ("sca", "sca_p90"),
        ("gca", "gca_p90"),
        ("passes_progressivos", "passes_prog_p90"),
    ]
    priors_pos: Dict[str, Dict[str, float]] = {}
    for macro, grupo in por_posicao.items():
        tot_min = sum(float(a["minutos"]) for a in grupo) or 1.0
        priors_pos[macro] = {}
        for col_db, key_p90 in metricas_keys:
            soma_val = sum(float(a.get(col_db) or 0.0) for a in grupo)
            priors_pos[macro][key_p90] = round((soma_val * 90.0) / tot_min, 4)

    # 3. Aplicar Empirical Bayes p90 em todos os atletas elegíveis
    elegiveis = [a for a in enriquecidos if float(a.get("minutos") or 0.0) >= min_minutos]
    for a in elegiveis:
        macro = a["macro_posicao"]
        p_map = priors_pos[macro]
        for col_db, key_p90 in metricas_keys:
            a[f"{key_p90}_eb"] = calcular_eb_p90(
                a.get(col_db) or 0.0, a["minutos"], p_map[key_p90], k_prior=k_prior
            )

    # 4. Calcular Z-Score dentro de cada macro-posição e converter para Score 0-100
    elegiveis_por_pos: Dict[str, List[Dict[str, Any]]] = {}
    for a in elegiveis:
        elegiveis_por_pos.setdefault(a["macro_posicao"], []).append(a)

    resultados = []
    for macro, grupo in elegiveis_por_pos.items():
        pesos = PESOS_POSICAO.get(macro, PESOS_POSICAO["Atacante"])
        stats_z = {}
        for _, key_p90 in metricas_keys:
            vals = np.array([g[f"{key_p90}_eb"] for g in grupo], dtype=float)
            media = float(np.mean(vals)) if len(vals) else 0.0
            dp = float(np.std(vals)) if len(vals) else 1.0
            stats_z[key_p90] = (media, dp if dp > 1e-9 else 1.0)

        z_compostos = []
        for g in grupo:
            z_total = 0.0
            for _, key_p90 in metricas_keys:
                m_z, dp_z = stats_z[key_p90]
                z_val = (g[f"{key_p90}_eb"] - m_z) / dp_z
                z_total += z_val * pesos.get(key_p90, 0.0)
            g["z_composto"] = round(z_total, 3)
            z_compostos.append(z_total)

        arr_z = np.array(z_compostos, dtype=float)
        for g in grupo:
            # Percentil empírico suave + escala 0-100 baseada em função logística do Z-Score
            score_log = 100.0 / (1.0 + math.exp(-1.15 * g["z_composto"]))
            percentil = float(np.mean(arr_z <= g["z_composto"]) * 100.0) if len(arr_z) else 50.0
            margem_incerteza = round(min(14.0, 120.0 / math.sqrt(max(float(g["minutos"]), 90.0))), 1)
            resultados.append({
                "atleta_id_canonico": g["atleta_id_canonico"],
                "nome": g.get("nome"),
                "clube_nome": g.get("clube_nome"),
                "clube_sigla": g.get("clube_sigla"),
                "posicao": g.get("posicao") or macro,
                "macro_posicao": macro,
                "minutos": int(g["minutos"]),
                "jogos": int(g.get("jogos") or 0),
                "gols": int(g.get("gols") or 0),
                "assistencias": int(g.get("assistencias") or 0),
                "npxg_p90_eb": g["npxg_p90_eb"],
                "xa_p90_eb": g["xa_p90_eb"],
                "sca_p90_eb": g["sca_p90_eb"],
                "gca_p90_eb": g["gca_p90_eb"],
                "passes_prog_p90_eb": g["passes_prog_p90_eb"],
                "z_composto": g["z_composto"],
                "score_econometrico": round(score_log, 1),
                "percentil_posicao": round(percentil, 1),
                "margem_incerteza": margem_incerteza,
                "confianca_amostral": _nivel_confianca_amostral(g["minutos"]),
            })

    if filtro_posicao:
        fp = filtro_posicao.strip().lower()
        resultados = [
            r for r in resultados
            if r["macro_posicao"].lower() == fp or fp in (r["posicao"] or "").lower()
        ]

    resultados.sort(key=lambda x: (x["score_econometrico"], x["minutos"]), reverse=True)
    for idx, item in enumerate(resultados[:limite], start=1):
        item["rank"] = idx

    return {
        "ranking": resultados[:limite],
        "total_elegiveis": len(resultados),
        "k_prior": k_prior,
        "min_minutos": min_minutos,
        "priors_posicao": priors_pos,
    }


def calcular_ranking_clubes_econometrico(clubes_rows: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """
    Calcula Power Ranking & Eficiência de Clubes combinando:
    - xPTS (Expected Points)
    - Delta xPTS (Pontos Reais - xPTS: overperformance / sorte)
    - Saldo xG (xG - xG Contra)
    - Eficiência Ofensiva (Gols Pró / xG) e Defensiva (xG Contra / Gols Contra)
    - Score Composto Z-Score (xPTS 45%, Saldo xG 30%, Field Tilt 15%, PPDA invertido 10%)
    """
    if not clubes_rows:
        return []

    xpts_arr = np.array([float(c.get("xpts") or 0.0) for c in clubes_rows], dtype=float)
    sxg_arr = np.array([float(c.get("xg") or 0.0) - float(c.get("xg_contra") or 0.0) for c in clubes_rows], dtype=float)
    ft_arr = np.array([float(c.get("field_tilt_pct") or 50.0) for c in clubes_rows], dtype=float)
    ppda_arr = np.array([float(c.get("ppda") or 12.0) for c in clubes_rows], dtype=float)

    def _z(arr: np.ndarray, val: float) -> float:
        dp = float(np.std(arr))
        return (val - float(np.mean(arr))) / (dp if dp > 1e-9 else 1.0)

    saida = []
    for c in clubes_rows:
        pts = float(c.get("pontos") or 0.0)
        xpts = float(c.get("xpts") or 0.0)
        xg = float(c.get("xg") or 0.0)
        xgc = float(c.get("xg_contra") or 0.0)
        gp = float(c.get("gols_pro") or 0.0)
        gc = float(c.get("gols_contra") or 0.0)
        ft = float(c.get("field_tilt_pct") or 50.0)
        ppda = float(c.get("ppda") or 12.0)
        saldo_xg = round(xg - xgc, 2)
        delta_xpts = round(pts - xpts, 2)

        z_comp = (
            0.45 * _z(xpts_arr, xpts)
            + 0.30 * _z(sxg_arr, saldo_xg)
            + 0.15 * _z(ft_arr, ft)
            - 0.10 * _z(ppda_arr, ppda)  # PPDA menor = pressão mais intensa
        )
        power_score = round(100.0 / (1.0 + math.exp(-1.1 * z_comp)), 1)

        if delta_xpts >= 3.0:
            leitura = "Acima do xPTS (Eficiência / Sorte)"
        elif delta_xpts <= -3.0:
            leitura = "Abaixo do xPTS (Subvalorizado)"
        else:
            leitura = "Alinhado ao Esperado"

        saida.append({
            "clube_id_canonico": c.get("clube_id_canonico"),
            "nome": c.get("nome"),
            "sigla": c.get("sigla"),
            "jogos": int(c.get("jogos") or 0),
            "pontos": int(pts),
            "xpts": round(xpts, 2),
            "delta_xpts": delta_xpts,
            "xg": round(xg, 2),
            "xg_contra": round(xgc, 2),
            "saldo_xg": saldo_xg,
            "eficiencia_ofensiva": round(gp / max(xg, 0.1), 2),
            "eficiencia_defensiva": round(xgc / max(gc, 0.1), 2),
            "posse_pct": round(float(c.get("posse_pct") or 0.0), 1),
            "field_tilt_pct": round(ft, 1),
            "ppda": round(ppda, 2),
            "power_score": power_score,
            "leitura_eficiencia": leitura,
        })

    saida.sort(key=lambda x: (x["power_score"], x["xpts"]), reverse=True)
    for idx, row in enumerate(saida, start=1):
        row["rank_econometrico"] = idx
    return saida
