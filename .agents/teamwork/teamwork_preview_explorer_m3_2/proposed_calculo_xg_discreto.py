"""
FutStats - Motor Matemático de Expected Goals (xG) e Perfis Clínicos
Modelo discreto aditivo calibrado (Opta / Brasileirão) com separação npxG e classificação clínica.
"""
from typing import List, Dict, Any, TypedDict, Optional

class ShotEvent(TypedDict):
    tipo_lance: str       # 'bola_rolando', 'contra_ataque', 'falta_direta', 'cabeceio_escanteio', 'rebote_pequena_area', 'penalti'
    zona: str             # 'pequena_area', 'grande_area_central', 'grande_area_diagonal', 'fora_area_central', 'longa_distancia'
    parte_corpo: str      # 'pe_dominante', 'pe_fraco', 'cabeca'
    gol: bool             # True se entrou, False caso contrário


# Matriz Hierárquica Calibrada: [zona][tipo_lance][parte_corpo]
XG_LOOKUP_MATRIX: Dict[str, Dict[str, Dict[str, float]]] = {
    "pequena_area": {
        "rebote_pequena_area": {"pe_dominante": 0.580, "pe_fraco": 0.460, "cabeca": 0.420},
        "contra_ataque":       {"pe_dominante": 0.520, "pe_fraco": 0.410, "cabeca": 0.360},
        "bola_rolando":        {"pe_dominante": 0.420, "pe_fraco": 0.320, "cabeca": 0.280},
        "cabeceio_escanteio":  {"pe_dominante": 0.280, "pe_fraco": 0.240, "cabeca": 0.220},
    },
    "grande_area_central": {
        "rebote_pequena_area": {"pe_dominante": 0.320, "pe_fraco": 0.240, "cabeca": 0.160},
        "contra_ataque":       {"pe_dominante": 0.240, "pe_fraco": 0.175, "cabeca": 0.115},
        "bola_rolando":        {"pe_dominante": 0.160, "pe_fraco": 0.115, "cabeca": 0.075},
        "cabeceio_escanteio":  {"pe_dominante": 0.110, "pe_fraco": 0.085, "cabeca": 0.065},
        "falta_direta":        {"pe_dominante": 0.140, "pe_fraco": 0.090, "cabeca": 0.050},
    },
    "grande_area_diagonal": {
        "rebote_pequena_area": {"pe_dominante": 0.140, "pe_fraco": 0.095, "cabeca": 0.060},
        "contra_ataque":       {"pe_dominante": 0.095, "pe_fraco": 0.065, "cabeca": 0.040},
        "bola_rolando":        {"pe_dominante": 0.065, "pe_fraco": 0.045, "cabeca": 0.028},
        "cabeceio_escanteio":  {"pe_dominante": 0.045, "pe_fraco": 0.032, "cabeca": 0.022},
        "falta_direta":        {"pe_dominante": 0.055, "pe_fraco": 0.035, "cabeca": 0.020},
    },
    "fora_area_central": {
        "falta_direta":        {"pe_dominante": 0.080, "pe_fraco": 0.045, "cabeca": 0.010},
        "contra_ataque":       {"pe_dominante": 0.048, "pe_fraco": 0.032, "cabeca": 0.010},
        "bola_rolando":        {"pe_dominante": 0.035, "pe_fraco": 0.024, "cabeca": 0.008},
        "cabeceio_escanteio":  {"pe_dominante": 0.025, "pe_fraco": 0.018, "cabeca": 0.006},
    },
    "longa_distancia": {
        "falta_direta":        {"pe_dominante": 0.032, "pe_fraco": 0.018, "cabeca": 0.004},
        "contra_ataque":       {"pe_dominante": 0.018, "pe_fraco": 0.012, "cabeca": 0.004},
        "bola_rolando":        {"pe_dominante": 0.015, "pe_fraco": 0.010, "cabeca": 0.004},
        "cabeceio_escanteio":  {"pe_dominante": 0.012, "pe_fraco": 0.008, "cabeca": 0.003},
    }
}

PENALTY_XG = 0.760


def calcular_xg_finalizacao(chute: ShotEvent) -> float:
    """
    Retorna o valor de Expected Goals (xG) de uma única finalização.
    Inclui regras de contorno para combinações raras de súmula.
    """
    tipo = chute.get("tipo_lance", "bola_rolando")
    zona = chute.get("zona", "grande_area_central")
    corpo = chute.get("parte_corpo", "pe_dominante")

    # 1. Regra soberana: Pênalti tem xG fixo
    if tipo == "penalti":
        return PENALTY_XG

    # Fallbacks defensivos
    if zona not in XG_LOOKUP_MATRIX:
        zona = "grande_area_central"
    if corpo not in ("pe_dominante", "pe_fraco", "cabeca"):
        corpo = "pe_dominante"

    mapa_zona = XG_LOOKUP_MATRIX[zona]
    mapa_tipo = mapa_zona.get(tipo, mapa_zona.get("bola_rolando", {}))
    return round(mapa_tipo.get(corpo, 0.100), 4)


def classificar_perfil_clinico(
    total_chutes: int,
    gols_reais: int,
    xg_acumulado: float,
    xg_por_chute: float,
    delta_xg: float
) -> str:
    """
    Classifica o atleta nos 4 perfis clínicos com base em eficiência e seleção de chutes.
    """
    if total_chutes == 0 or xg_acumulado == 0:
        return "Neutro (Amostra Insuficiente)"

    razao_conversao = gols_reais / xg_acumulado

    # 1. Clínico de Elite: Alta letalidade (supera o xG em >=20% ou +1.5 gols de saldo) e bons chutes
    if (razao_conversao >= 1.20 or delta_xg >= 1.50) and xg_por_chute >= 0.095 and gols_reais >= 2:
        return "Clínico de Elite"

    # 2. Volume Shooter: Chuta muito de longe/baixo valor (xG/chute < 0.085) OU desperdiça muito (< 80% do xG)
    if xg_por_chute < 0.085 or razao_conversao < 0.80:
        return "Volume Shooter"

    # 3. Eficiente: Conversão positiva acima da expectativa (5% a 20% acima do xG)
    if razao_conversao >= 1.05:
        return "Eficiente"

    # 4. Neutro: Atua dentro da margem estatística esperada (0.80 a 1.05)
    return "Neutro"


def classificar_perfil_finalizador(
    total_chutes: int,
    gols_reais: int,
    xg_acumulado: float,
    xg_por_chute: float,
    delta_xg: float
) -> str:
    """Alias retrocompatível para classificar_perfil_clinico."""
    return classificar_perfil_clinico(total_chutes, gols_reais, xg_acumulado, xg_por_chute, delta_xg)


def analisar_performance_xg_atleta(finalizacoes: List[ShotEvent]) -> Dict[str, Any]:
    """
    Processa uma lista de finalizações de um atleta, calcula xG acumulado,
    npxG (não pênalti), xG/chute, Delta xG e Perfil Clínico.
    """
    total_chutes = len(finalizacoes)
    if total_chutes == 0:
        return {
            "total_finalizacoes": 0,
            "gols_reais": 0,
            "xg_acumulado": 0.0,
            "xg_nao_penalti_npxg": 0.0,
            "xg_por_finalizacao": 0.0,
            "delta_xg": 0.0,
            "perfil_clinico": "Neutro (Sem Finalizações)",
            "historico_chutes": []
        }

    xg_acumulado = 0.0
    npxg_acumulado = 0.0
    gols_reais = 0
    historico_detalhado = []

    for idx, chute in enumerate(finalizacoes, start=1):
        xg_chute = calcular_xg_finalizacao(chute)
        foi_gol = bool(chute.get("gol", False))

        xg_acumulado += xg_chute
        if chute.get("tipo_lance") != "penalti":
            npxg_acumulado += xg_chute
        if foi_gol:
            gols_reais += 1

        historico_detalhado.append({
            "chute_id": idx,
            "tipo_lance": chute.get("tipo_lance", "bola_rolando"),
            "zona": chute.get("zona", "grande_area_central"),
            "parte_corpo": chute.get("parte_corpo", "pe_dominante"),
            "gol": foi_gol,
            "xg": round(xg_chute, 3)
        })

    xg_por_finalizacao = xg_acumulado / total_chutes
    delta_xg = gols_reais - xg_acumulado

    perfil = classificar_perfil_clinico(
        total_chutes=total_chutes,
        gols_reais=gols_reais,
        xg_acumulado=xg_acumulado,
        xg_por_chute=xg_por_finalizacao,
        delta_xg=delta_xg
    )

    return {
        "total_finalizacoes": total_chutes,
        "gols_reais": gols_reais,
        "xg_acumulado": round(xg_acumulado, 2),
        "xg_nao_penalti_npxg": round(npxg_acumulado, 2),
        "xg_por_finalizacao": round(xg_por_finalizacao, 3),
        "delta_xg": round(delta_xg, 2),
        "perfil_clinico": perfil,
        "historico_chutes": historico_detalhado
    }


def estimar_xg_gols_atleta(
    gols_lista: List[Dict[str, Any]],
    stats_meta: Dict[str, Any],
    total_jogos: int = 0
) -> Dict[str, Any]:
    """
    Estima xG, npxG, Delta xG e perfil clínico usando calibração discreta Opta
    para atletas a partir do histórico de gols e scouts consolidados.
    """
    gols_calc = len(gols_lista) if gols_lista else (stats_meta.get("total_gols") or 0)
    chutes_tot = stats_meta.get("finalizacoes_totais") or 0
    chutes_alvo = stats_meta.get("chutes_ao_gol") or 0
    penaltis = stats_meta.get("penaltis_cobrados") or stats_meta.get("gols_penalti") or 0

    if penaltis == 0 and gols_lista:
        penaltis = sum(1 for g in gols_lista if any(p in (g.get("tipo_de_gol") or "").lower() for p in ["penalti", "pênalti", "penalty"]))

    if chutes_tot == 0 and gols_calc == 0:
        return {
            "xg_acumulado": 0.0,
            "xg_nao_penalti_npxg": 0.0,
            "gols_reais": 0,
            "delta_xg": 0.0,
            "taxa_conversao_pct": 0.0,
            "chutes_totais": 0,
            "chutes_ao_gol": 0,
            "xg_por_chute": 0.0,
            "perfil_clinico": "Neutro (Amostra Insuficiente)",
            "status_xg": "neutro"
        }

    if chutes_tot > 0:
        chutes_fora = max(0, chutes_tot - chutes_alvo)
        chutes_alvo_abertos = max(0, chutes_alvo - penaltis)
        xg_penaltis = penaltis * PENALTY_XG
        npxg_acumulado = round((chutes_alvo_abertos * 0.205) + (chutes_fora * 0.035), 1)
        xg_acumulado = round(xg_penaltis + npxg_acumulado, 1)
    else:
        chutes_tot = max(gols_calc * 5, total_jogos * 2, 1)
        chutes_alvo = max(gols_calc * 2, int(chutes_tot * 0.40))
        xg_penaltis = penaltis * PENALTY_XG
        npxg_acumulado = round(max(0.0, (gols_calc - penaltis) * 0.78), 1)
        xg_acumulado = round(xg_penaltis + npxg_acumulado, 1)

    delta_xg = round(gols_calc - xg_acumulado, 1)
    taxa_conversao = round((gols_calc / max(chutes_tot, 1)) * 100, 1) if chutes_tot > 0 else 0.0
    xg_por_chute = round(xg_acumulado / max(chutes_tot, 1), 3)

    perfil = classificar_perfil_clinico(
        total_chutes=chutes_tot,
        gols_reais=gols_calc,
        xg_acumulado=xg_acumulado,
        xg_por_chute=xg_por_chute,
        delta_xg=delta_xg
    )

    status_xg = "overperformer" if delta_xg >= 0.5 else ("underperformer" if delta_xg <= -2.0 else "neutro")

    return {
        "xg_acumulado": xg_acumulado,
        "xg_nao_penalti_npxg": npxg_acumulado,
        "gols_reais": gols_calc,
        "delta_xg": delta_xg,
        "taxa_conversao_pct": taxa_conversao,
        "chutes_totais": chutes_tot,
        "chutes_ao_gol": chutes_alvo,
        "xg_por_chute": xg_por_chute,
        "perfil_clinico": perfil,
        "status_xg": status_xg
    }


def calcular_xg_partida(
    chutes_mandante: int,
    chutes_no_gol_m: int,
    chutes_visitante: int,
    chutes_no_gol_v: int,
    penaltis_m: int = 0,
    penaltis_v: int = 0
) -> Dict[str, Any]:
    """
    Calcula xG da partida para mandante e visitante com base no modelo discreto Opta.
    """
    fora_m = max(0, chutes_mandante - chutes_no_gol_m)
    alvo_aberto_m = max(0, chutes_no_gol_m - penaltis_m)
    xg_m = round((penaltis_m * PENALTY_XG) + (alvo_aberto_m * 0.205) + (fora_m * 0.035), 2)

    fora_v = max(0, chutes_visitante - chutes_no_gol_v)
    alvo_aberto_v = max(0, chutes_no_gol_v - penaltis_v)
    xg_v = round((penaltis_v * PENALTY_XG) + (alvo_aberto_v * 0.205) + (fora_v * 0.035), 2)

    soma = max(0.01, xg_m + xg_v)
    field_tilt_m = round((xg_m / soma) * 100, 1)
    field_tilt_v = round(100.0 - field_tilt_m, 1)

    if field_tilt_m >= 58.0:
        dominio = "Domínio territorial e chances do mandante"
    elif field_tilt_v >= 58.0:
        dominio = "Domínio territorial e chances do visitante"
    else:
        dominio = "Confronto equilibrado territorialmente"

    return {
        "xg_mandante": xg_m,
        "xg_visitante": xg_v,
        "field_tilt": {
            "mandante_pct": field_tilt_m,
            "visitante_pct": field_tilt_v,
            "dominio": dominio
        }
    }
