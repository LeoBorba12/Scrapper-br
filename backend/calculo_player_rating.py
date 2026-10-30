"""
FutStats - Motor Matemático de Player Rating Estilo Sofascore (0.0 a 10.0)
Baseado em matriz de pesos posicionais, decaimento marginal e compressão assintótica (tanh).
"""
import math
from typing import Dict, Any, TypedDict, Optional

class PlayerMatchStats(TypedDict, total=False):
    minutos_jogados: int
    posicao: str  # 'Goleiro', 'Zagueiro', 'Lateral', 'Volante', 'Meia', 'Ponta', 'Centroavante', 'Atacante'
    gols: int
    assistencias: int
    finalizacoes_no_gol: int
    chutes_para_fora: int
    grandes_chances_criadas: int
    grandes_chances_perdidas: int
    passes_decisivos: int
    cartoes_amarelos: int
    cartoes_vermelhos: int
    gols_sofridos: int
    penaltis_cometidos: int
    penaltis_sofridos: int


# Matriz de Coeficientes por Posição
WEIGHT_MATRIX: Dict[str, Dict[str, float]] = {
    "Goleiro": {
        "gols": 2.00, "assistencias": 1.20, "grandes_chances_criadas": 0.50,
        "passes_decisivos": 0.25, "finalizacoes_no_gol": 0.30, "chutes_para_fora": -0.05,
        "grandes_chances_perdidas": -0.40, "penaltis_sofridos": 0.50, "penaltis_cometidos": -0.90,
        "gols_sofridos": -0.45, "clean_sheet": 0.65, "cartoes_amarelos": -0.30, "cartoes_vermelhos": -1.80
    },
    "Zagueiro": {
        "gols": 1.60, "assistencias": 1.00, "grandes_chances_criadas": 0.45,
        "passes_decisivos": 0.20, "finalizacoes_no_gol": 0.22, "chutes_para_fora": -0.05,
        "grandes_chances_perdidas": -0.45, "penaltis_sofridos": 0.55, "penaltis_cometidos": -1.10,
        "gols_sofridos": -0.35, "clean_sheet": 0.55, "cartoes_amarelos": -0.35, "cartoes_vermelhos": -1.80
    },
    "Lateral": {
        "gols": 1.45, "assistencias": 0.85, "grandes_chances_criadas": 0.35,
        "passes_decisivos": 0.15, "finalizacoes_no_gol": 0.18, "chutes_para_fora": -0.06,
        "grandes_chances_perdidas": -0.50, "penaltis_sofridos": 0.60, "penaltis_cometidos": -1.00,
        "gols_sofridos": -0.30, "clean_sheet": 0.45, "cartoes_amarelos": -0.35, "cartoes_vermelhos": -1.75
    },
    "Volante": {
        "gols": 1.35, "assistencias": 0.80, "grandes_chances_criadas": 0.35,
        "passes_decisivos": 0.15, "finalizacoes_no_gol": 0.16, "chutes_para_fora": -0.06,
        "grandes_chances_perdidas": -0.50, "penaltis_sofridos": 0.60, "penaltis_cometidos": -1.00,
        "gols_sofridos": -0.20, "clean_sheet": 0.30, "cartoes_amarelos": -0.30, "cartoes_vermelhos": -1.75
    },
    "Meia": {
        "gols": 1.15, "assistencias": 0.70, "grandes_chances_criadas": 0.30,
        "passes_decisivos": 0.12, "finalizacoes_no_gol": 0.14, "chutes_para_fora": -0.08,
        "grandes_chances_perdidas": -0.55, "penaltis_sofridos": 0.65, "penaltis_cometidos": -0.85,
        "gols_sofridos": -0.05, "clean_sheet": 0.10, "cartoes_amarelos": -0.25, "cartoes_vermelhos": -1.65
    },
    "Ponta": {
        "gols": 1.05, "assistencias": 0.70, "grandes_chances_criadas": 0.30,
        "passes_decisivos": 0.12, "finalizacoes_no_gol": 0.12, "chutes_para_fora": -0.08,
        "grandes_chances_perdidas": -0.60, "penaltis_sofridos": 0.65, "penaltis_cometidos": -0.80,
        "gols_sofridos": -0.05, "clean_sheet": 0.05, "cartoes_amarelos": -0.25, "cartoes_vermelhos": -1.65
    },
    "Centroavante": {
        "gols": 0.95, "assistencias": 0.75, "grandes_chances_criadas": 0.35,
        "passes_decisivos": 0.15, "finalizacoes_no_gol": 0.12, "chutes_para_fora": -0.10,
        "grandes_chances_perdidas": -0.65, "penaltis_sofridos": 0.65, "penaltis_cometidos": -0.80,
        "gols_sofridos": 0.00, "clean_sheet": 0.00, "cartoes_amarelos": -0.25, "cartoes_vermelhos": -1.65
    }
}
# Alias para compatibilidade
WEIGHT_MATRIX["Atacante"] = WEIGHT_MATRIX["Centroavante"]
WEIGHT_MATRIX["Defensor"] = WEIGHT_MATRIX["Zagueiro"]
WEIGHT_MATRIX["Meio-Campo"] = WEIGHT_MATRIX["Meia"]


def normalizar_posicao(pos_raw: Optional[str]) -> str:
    """Mapeia qualquer string de posição para uma das chaves da WEIGHT_MATRIX."""
    p = (pos_raw or "Atacante").lower()
    if "gol" in p or "guarda" in p:
        return "Goleiro"
    if "zag" in p or "beque" in p:
        return "Zagueiro"
    if "lat" in p or "ala" in p:
        return "Lateral"
    if "vol" in p or "trinco" in p:
        return "Volante"
    if "mei" in p or "armador" in p:
        return "Meia"
    if "pont" in p or "extremo" in p:
        return "Ponta"
    return "Centroavante"


def calcular_nota_partida_sofascore(stats: PlayerMatchStats) -> Dict[str, Any]:
    """
    Calcula a nota da partida (0.0 a 10.0, base 6.5) com compressão assintótica (tanh)
    e decaimento marginal de gols sofridos.
    """
    BASE_RATING = 6.50
    minutos = stats.get("minutos_jogados", 0)
    pos_canon = normalizar_posicao(stats.get("posicao"))

    pesos = WEIGHT_MATRIX.get(pos_canon, WEIGHT_MATRIX["Centroavante"])

    # Jogadores sem minutagem
    if minutos <= 0:
        return {
            "nota_final": None,
            "nota_base": BASE_RATING,
            "saldo_bruto": 0.0,
            "breakdown_positivo": {},
            "breakdown_negativo": {},
            "status": "Sem nota"
        }

    breakdown_positivo: Dict[str, float] = {}
    breakdown_negativo: Dict[str, float] = {}

    # 1. Eventos lineares
    eventos_padrao = [
        "gols", "assistencias", "finalizacoes_no_gol", "chutes_para_fora",
        "grandes_chances_criadas", "grandes_chances_perdidas", "passes_decisivos",
        "penaltis_sofridos", "penaltis_cometidos"
    ]

    for evento in eventos_padrao:
        qtd = stats.get(evento, 0)
        if qtd > 0 and evento in pesos:
            impacto = round(qtd * pesos[evento], 4)
            if impacto > 0:
                breakdown_positivo[evento] = round(impacto, 2)
            elif impacto < 0:
                breakdown_negativo[evento] = round(impacto, 2)

    # 2. Cartões
    amarelos = stats.get("cartoes_amarelos", 0)
    vermelhos = stats.get("cartoes_vermelhos", 0)
    if vermelhos > 0:
        breakdown_negativo["cartoes_vermelhos"] = round(vermelhos * pesos["cartoes_vermelhos"], 2)
        if amarelos > 0:
            breakdown_negativo["cartoes_amarelos"] = round(pesos["cartoes_amarelos"] * 0.5, 2)
    elif amarelos > 0:
        breakdown_negativo["cartoes_amarelos"] = round(amarelos * pesos["cartoes_amarelos"], 2)

    # 3. Defesa: Clean Sheet vs Gols Sofridos
    gols_sofridos = stats.get("gols_sofridos", 0)
    if gols_sofridos == 0 and minutos >= 60:
        if pesos.get("clean_sheet", 0) > 0:
            breakdown_positivo["clean_sheet"] = round(pesos["clean_sheet"], 2)
    elif gols_sofridos > 0 and pesos.get("gols_sofridos", 0) < 0:
        fator_gols = math.pow(gols_sofridos, 0.85)
        fator_tempo = min(1.0, minutos / 90.0)
        impacto_gols_sofridos = fator_gols * pesos["gols_sofridos"] * max(0.5, fator_tempo)
        breakdown_negativo["gols_sofridos"] = round(impacto_gols_sofridos, 2)

    # 4. Consistência por Minutagem
    if minutos >= 65 and vermelhos == 0 and stats.get("penaltis_cometidos", 0) == 0:
        bonus_tempo = round(0.10 * (minutos / 90.0), 2)
        breakdown_positivo["consistencia_minutagem"] = bonus_tempo

    # 5. Saldo Bruto
    soma_positiva = sum(breakdown_positivo.values())
    soma_negativa = sum(breakdown_negativo.values())
    saldo_bruto = soma_positiva + soma_negativa

    # 6. Amortecimento de substitutos (< 20 min)
    if minutos < 20 and abs(saldo_bruto) < 0.8:
        fator_exposicao = 0.5 + 0.5 * (minutos / 20.0)
        saldo_bruto *= fator_exposicao

    # 7. Curva Assintótica (tanh assimétrica)
    K_POS = 2.65
    K_NEG = 4.50

    if saldo_bruto >= 0:
        nota_calculada = BASE_RATING + 3.50 * math.tanh(saldo_bruto / K_POS)
    else:
        nota_calculada = BASE_RATING + 6.50 * math.tanh(saldo_bruto / K_NEG)

    nota_final = max(3.00, min(10.00, round(nota_calculada, 2)))

    return {
        "nota_final": nota_final,
        "nota_base": BASE_RATING,
        "saldo_bruto": round(saldo_bruto, 2),
        "total_positivo": round(soma_positiva, 2),
        "total_negativo": round(soma_negativa, 2),
        "breakdown_positivo": breakdown_positivo,
        "breakdown_negativo": breakdown_negativo,
        "status": "Avaliado"
    }
