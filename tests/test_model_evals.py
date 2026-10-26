"""
Suíte de Avaliação Contínua e Testes de Regressão Matemática (agent-evals)
FutStats - Dixon-Coles (1997) & Bivariate Poisson Odds Engine

Valida:
1. Normalização estrita de probabilidades (soma 100% / 1.0 em 1X2, Over/Under e BTTS)
2. Calibração e estabilidade Dixon-Coles com rho=-0.12 (inflação de empates 0-0 e 1-1)
3. Coerência matemática de Odds Justas (Fair Odds)
4. Consistência de Valor Esperado Positivo (+EV apenas quando odd_mercado > fair_odd)
5. Robustez contra entradas de borda (clamping de lambda_h e lambda_a)
6. Conjunto de casos de teste padrão ouro (Golden Benchmark Dataset)
"""

import math
import sys
import os
import pytest

# Garante acesso aos módulos do backend
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
from backend.app import _calc_poisson_bivariate


# ==============================================================================
# 1. GOLDEN BENCHMARK DATASET
# ==============================================================================
GOLDEN_CASES = [
    {
        "id": "derby_equilibrado",
        "desc": "Clássico equilibrado e truncado (Fla-Flu)",
        "lambda_h": 1.35,
        "lambda_a": 1.15,
        "rho": -0.12,
        "expected_home_min": 35.0,
        "expected_home_max": 50.0,
        "expected_draw_min": 25.0,
        "expected_draw_max": 35.0,
        "expected_away_min": 22.0,
        "expected_away_max": 35.0,
    },
    {
        "id": "super_favorito_casa",
        "desc": "Super favorito mandante (Palmeiras em casa contra lanterna)",
        "lambda_h": 2.40,
        "lambda_a": 0.65,
        "rho": -0.12,
        "expected_home_min": 65.0,
        "expected_home_max": 85.0,
        "expected_draw_min": 10.0,
        "expected_draw_max": 25.0,
        "expected_away_min": 3.0,
        "expected_away_max": 15.0,
    },
    {
        "id": "jogo_under_defensivo",
        "desc": "Confronto de defesas sólidas (baixo lambda)",
        "lambda_h": 0.85,
        "lambda_a": 0.75,
        "rho": -0.12,
        "expected_home_min": 30.0,
        "expected_home_max": 45.0,
        "expected_draw_min": 30.0,
        "expected_draw_max": 45.0,
        "expected_away_min": 20.0,
        "expected_away_max": 35.0,
    },
    {
        "id": "jogo_over_franco",
        "desc": "Ataques eficientes e defesas abertas",
        "lambda_h": 2.20,
        "lambda_a": 1.90,
        "rho": -0.12,
        "expected_home_min": 40.0,
        "expected_home_max": 55.0,
        "expected_draw_min": 18.0,
        "expected_draw_max": 28.0,
        "expected_away_min": 25.0,
        "expected_away_max": 40.0,
    },
    {
        "id": "borda_minima_clamp",
        "desc": "Valores mínimos de lambda (acionamento do clamp 0.25)",
        "lambda_h": 0.05,
        "lambda_a": 0.10,
        "rho": -0.12,
        "expected_home_min": 15.0,
        "expected_home_max": 40.0,
        "expected_draw_min": 45.0,
        "expected_draw_max": 75.0,
        "expected_away_min": 10.0,
        "expected_away_max": 35.0,
    },
    {
        "id": "borda_maxima_clamp",
        "desc": "Valores máximos de lambda (acionamento do clamp 4.5)",
        "lambda_h": 6.50,
        "lambda_a": 5.80,
        "rho": -0.12,
        "expected_home_min": 35.0,
        "expected_home_max": 55.0,
        "expected_draw_min": 10.0,
        "expected_draw_max": 25.0,
        "expected_away_min": 30.0,
        "expected_away_max": 50.0,
    },
]


# ==============================================================================
# 2. TESTES DE INVARIANTES MATEMÁTICAS (SOMA DAS PROBABILIDADES = 1.0)
# ==============================================================================
@pytest.mark.parametrize("case", GOLDEN_CASES, ids=lambda c: c["id"])
def test_probabilidades_somam_100_porcento(case):
    """
    Garante que a soma de probabilidades 1X2, Over/Under e BTTS
    feche em 100% (com tolerância máxima de 0.2% por arredondamento para 1 decimal).
    """
    res = _calc_poisson_bivariate(case["lambda_h"], case["lambda_a"], rho=case["rho"])

    # 1X2: Mandante + Empate + Visitante = 100%
    soma_1x2 = res["prob_mandante"] + res["prob_empate"] + res["prob_visitante"]
    assert abs(soma_1x2 - 100.0) <= 0.25, (
        f"Violação de partição 1X2: {soma_1x2}% em {case['id']} "
        f"({res['prob_mandante']} + {res['prob_empate']} + {res['prob_visitante']})"
    )

    # Over/Under 1.5 = 100%
    soma_ou15 = res["prob_over_1_5"] + res["prob_under_1_5"]
    assert abs(soma_ou15 - 100.0) <= 0.2, f"Violação O/U 1.5: {soma_ou15}% em {case['id']}"

    # Over/Under 2.5 = 100%
    soma_ou25 = res["prob_over_2_5"] + res["prob_under_2_5"]
    assert abs(soma_ou25 - 100.0) <= 0.2, f"Violação O/U 2.5: {soma_ou25}% em {case['id']}"

    # BTTS Sim/Não = 100%
    soma_btts = res["prob_btts_sim"] + res["prob_btts_nao"]
    assert abs(soma_btts - 100.0) <= 0.2, f"Violação BTTS: {soma_btts}% em {case['id']}"


# ==============================================================================
# 3. TESTES DE CALIBRAÇÃO DIXON-COLES (0-0, 1-1, RHO = -0.12)
# ==============================================================================
def test_probabilidade_positiva_placares_baixos():
    """
    Valida se os placares 0-0 e 1-1 possuem probabilidades estritamente positivas
    e são ranqueados no top de placares para cenários de futebol brasileiro.
    """
    res = _calc_poisson_bivariate(1.20, 0.95, rho=-0.12)
    top_dict = {item["placar"]: item["prob"] for item in res["top_placares"]}

    # Pelo menos um dos placares clássicos brasileiros deve estar no top 5
    assert "0x0" in top_dict or "1x1" in top_dict or "1x0" in top_dict
    assert all(item["prob"] > 0 for item in res["top_placares"])


def test_dixon_coles_inflacao_empate_rho_negativo():
    """
    Valida a propriedade central de Dixon-Coles (1997):
    Para rho = -0.12 (negativo), a probabilidade de 0-0 e 1-1 deve ser SUPERIOR
    à obtida via modelo de Poisson Bivariado independente (rho = 0.0).
    Tau(0,0) = 1 - lh * la * (-0.12) > 1.0
    Tau(1,1) = 1 - (-0.12) = 1.12 > 1.0
    """
    lh = 1.30
    la = 1.10

    # Com calibração Dixon-Coles padrão brasileiro
    res_dc = _calc_poisson_bivariate(lh, la, rho=-0.12)
    # Poisson independente (sem ajuste tau)
    res_indep = _calc_poisson_bivariate(lh, la, rho=0.0)

    # Probabilidade de empate global deve ser superior ou igual com Dixon-Coles
    assert res_dc["prob_empate"] >= res_indep["prob_empate"], (
        f"Dixon-Coles não inflacionou empate: DC={res_dc['prob_empate']}% vs Indep={res_indep['prob_empate']}%"
    )

    # Extrai probabilidades de 0x0 e 1x1 dos top placares
    top_dc = {x["placar"]: x["prob"] for x in res_dc["top_placares"]}
    top_indep = {x["placar"]: x["prob"] for x in res_indep["top_placares"]}

    if "0x0" in top_dc and "0x0" in top_indep:
        assert top_dc["0x0"] > top_indep["0x0"], (
            f"0x0 não inflacionado: DC={top_dc['0x0']} vs Indep={top_indep['0x0']}"
        )
    if "1x1" in top_dc and "1x1" in top_indep:
        assert top_dc["1x1"] > top_indep["1x1"], (
            f"1x1 não inflacionado: DC={top_dc['1x1']} vs Indep={top_indep['1x1']}"
        )


def test_placares_ordenados_decrescente():
    """Garante que a lista de top placares venha sempre em ordem decrescente de probabilidade."""
    res = _calc_poisson_bivariate(1.5, 1.2, rho=-0.12)
    probs = [x["prob"] for x in res["top_placares"]]
    assert probs == sorted(probs, reverse=True), f"Placares fora de ordem: {probs}"


# ==============================================================================
# 4. TESTES DE COERÊNCIA DE ODDS JUSTAS (FAIR ODDS)
# ==============================================================================
@pytest.mark.parametrize("case", GOLDEN_CASES, ids=lambda c: c["id"])
def test_coerencia_fair_odds(case):
    """
    Verifica se Fair Odd = 1.0 / (probabilidade / 100.0) dentro da precisão decimal.
    Fair Odds devem ser estritamente decrescentes com o aumento da probabilidade.
    """
    res = _calc_poisson_bivariate(case["lambda_h"], case["lambda_a"], rho=case["rho"])

    for mercado, prob_key, odd_key in [
        ("Mandante", "prob_mandante", "fair_odd_mandante"),
        ("Empate", "prob_empate", "fair_odd_empate"),
        ("Visitante", "prob_visitante", "fair_odd_visitante"),
        ("Over 1.5", "prob_over_1_5", "fair_odd_over_1_5"),
        ("Over 2.5", "prob_over_2_5", "fair_odd_over_2_5"),
        ("BTTS Sim", "prob_btts_sim", "fair_odd_btts_sim"),
    ]:
        p = res[prob_key]
        odd = res[odd_key]

        if p > 1.0:
            # Como a probabilidade pública é arredondada para 1 casa decimal (incerteza de ±0.05%),
            # a odd justa calculada sobre o float contínuo deve residir estritamente dentro
            # do intervalo [100 / (p + 0.06), 100 / (p - 0.06)].
            min_odd = round(100.0 / (p + 0.06), 2)
            max_odd = round(100.0 / (p - 0.06), 2)
            assert min_odd - 0.05 <= odd <= max_odd + 0.05, (
                f"Incoerência na fair odd de {mercado} em {case['id']}: "
                f"p={p}%, calculada={odd}, intervalo_esperado=[{min_odd}, {max_odd}]"
            )
        else:
            assert odd == 99.0, f"Odd de evento raro deve saturar em 99.0: obtido {odd}"


def test_monotonicidade_fair_odds():
    """Garante que maior probabilidade gere estritamente menor fair odd."""
    res = _calc_poisson_bivariate(2.2, 0.8, rho=-0.12)
    p_mandante = res["prob_mandante"]
    p_visitante = res["prob_visitante"]

    assert p_mandante > p_visitante
    assert res["fair_odd_mandante"] < res["fair_odd_visitante"]


# ==============================================================================
# 5. TESTES DE VALOR ESPERADO (+EV GATING)
# ==============================================================================
def _calc_ev(prob_pct, odd_mercado):
    """Fórmula de EV padronizada do FutStats."""
    if not odd_mercado or odd_mercado <= 1.0 or not prob_pct:
        return None
    return round(((prob_pct / 100.0) * odd_mercado - 1.0) * 100, 1)


def test_ev_positivo_apenas_quando_odd_maior_que_fair_odd():
    """
    Regra de ouro de precificação:
    Um mercado SÓ PODE apresentar EV > 0 se odd_oferecida > fair_odd.
    Se odd_oferecida < fair_odd, EV deve ser estritamente negativo.
    Se odd_oferecida == fair_odd, EV deve ser aproximadamente zero (0.0%).
    """
    res = _calc_poisson_bivariate(1.60, 1.10, rho=-0.12)
    prob_h = res["prob_mandante"]
    fair_odd = res["fair_odd_mandante"]

    # Caso 1: Odd com Valor Positivo (+EV)
    odd_valor = round(fair_odd * 1.15, 2)  # 15% acima da odd justa
    ev_pos = _calc_ev(prob_h, odd_valor)
    assert ev_pos > 0.0, f"Deveria ter EV positivo: odd={odd_valor}, fair={fair_odd}, EV={ev_pos}"

    # Caso 2: Odd Sem Valor (-EV, margem da casa comum)
    odd_comercial = round(fair_odd * 0.85, 2)  # 15% abaixo da odd justa
    ev_neg = _calc_ev(prob_h, odd_comercial)
    assert ev_neg < 0.0, f"Deveria ter EV negativo: odd={odd_comercial}, fair={fair_odd}, EV={ev_neg}"

    # Caso 3: Breakeven (odd próxima da justa)
    ev_breakeven = _calc_ev(prob_h, fair_odd)
    assert abs(ev_breakeven) <= 1.5, f"EV justo deve estar próximo de 0%: {ev_breakeven}"


@pytest.mark.parametrize("odd_mult,expected_sign", [
    (1.20, 1),   # 20% acima da fair odd -> EV positivo
    (1.05, 1),   # 5% acima da fair odd -> EV positivo
    (0.95, -1),  # 5% abaixo da fair odd -> EV negativo
    (0.80, -1),  # 20% abaixo da fair odd -> EV negativo
])
def test_ev_gating_parametrico(odd_mult, expected_sign):
    """Testa múltiplos multiplicadores de odd contra o sinal esperado do EV."""
    res = _calc_poisson_bivariate(1.4, 1.2, rho=-0.12)
    fair_odd = res["fair_odd_empate"]
    odd_test = round(fair_odd * odd_mult, 2)
    ev = _calc_ev(res["prob_empate"], odd_test)

    if expected_sign == 1:
        assert ev > 0.0, f"Esperado EV > 0 com odd {odd_test} > {fair_odd}, obtido {ev}%"
    else:
        assert ev < 0.0, f"Esperado EV < 0 com odd {odd_test} < {fair_odd}, obtido {ev}%"


# ==============================================================================
# 6. TESTES DE RESILIÊNCIA E ROBUSTEZ A VALORES DE BORDA
# ==============================================================================
def test_resiliencia_clamping_extremos():
    """
    Garante que parâmetros extremos (<=0 ou >=10) não causem ZeroDivisionError,
    NaNs, números complexos ou travamento.
    """
    for bad_lh, bad_la in [
        (0.0, 0.0),
        (-1.5, -2.0),
        (0.0001, 15.0),
        (25.0, 30.0),
    ]:
        res = _calc_poisson_bivariate(bad_lh, bad_la, rho=-0.12)
        assert isinstance(res, dict)
        assert res["prob_mandante"] > 0
        assert res["prob_empate"] > 0
        assert res["prob_visitante"] > 0
        assert not math.isnan(res["fair_odd_mandante"])
        assert not math.isinf(res["fair_odd_mandante"])
        soma = res["prob_mandante"] + res["prob_empate"] + res["prob_visitante"]
        assert abs(soma - 100.0) <= 0.3


# ==============================================================================
# 7. EXECUÇÃO STANDALONE DIRETA
# ==============================================================================
if __name__ == "__main__":
    # Permite rodar diretamente via `python tests/test_model_evals.py`
    import sys
    print("Iniciando bateria de testes agent-evals para Dixon-Coles...")
    exit_code = pytest.main(["-v", __file__])
    sys.exit(exit_code)
