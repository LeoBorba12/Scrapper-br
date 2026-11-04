# -*- coding: utf-8 -*-
"""
FutStats — Gate de Qualidade de Odds e Quarentena (Desafio 12)
Módulo canônico para validação de integridade pré-ingestão de cotações 1X2.

Regras Estritas:
1. odd_valida: número real entre 1.01 e 50.0.
2. mercado_1x2_valido: todas as 3 seleções válidas e margem implícita entre 0.0% e 15.0%.
3. Quarentena: qualquer mercado com margem < 0% (arbitragem espúria) ou > 15% (erro de extração).
"""

from typing import Tuple, Optional, Dict, Any

def odd_valida(odd: Any) -> bool:
    """Verifica se uma odd individual está dentro do intervalo plausível de mercado."""
    if odd is None or not isinstance(odd, (int, float)):
        return False
    return 1.01 <= float(odd) <= 50.0

def calcular_margem_implicita(casa: float, empate: float, fora: float) -> Optional[float]:
    """Calcula o overround / margem da casa de apostas: sum(1/odd) - 1.0."""
    if not (odd_valida(casa) and odd_valida(empate) and odd_valida(fora)):
        return None
    return round((1.0 / float(casa)) + (1.0 / float(empate)) + (1.0 / float(fora)) - 1.0, 4)

def mercado_1x2_valido(casa: Any, empate: Any, fora: Any) -> Tuple[bool, Optional[str], Optional[float]]:
    """
    Valida um conjunto completo de mercado 1X2.
    Retorna (valido, motivo_rejeicao, margem_calculada).
    """
    if not all(odd_valida(o) for o in (casa, empate, fora)):
        return False, "ODD_FORA_DE_FAIXA", None

    margem = calcular_margem_implicita(casa, empate, fora)
    if margem is None:
        return False, "VALOR_INVALIDO", None

    if margem < 0.0:
        return False, "MARGEM_NEGATIVA_ARBITRAGEM_ESPURIA", margem
    if margem > 0.15:
        return False, "MARGEM_PREDATORIA_OU_ERRO_EXTRACAO", margem

    return True, None, margem

def classificar_status_odds(casa: Any, empate: Any, fora: Any) -> Dict[str, Any]:
    """Classifica o registro para auditoria e separação de quarentena."""
    valido, motivo, margem = mercado_1x2_valido(casa, empate, fora)
    return {
        "aprovado": valido,
        "status": "VALIDA" if valido else "QUARENTENA",
        "motivo": motivo,
        "margem": margem
    }
