"""
Suíte de Testes Automatizados — Motor de Alertas Editoriais de +EV
==================================================================
Valida:
1. Extração determinística de anomalias estatísticas da base SQLite.
2. Invariante de corte de +EV% e ordenação decrescente.
3. Conformidade estrita dos guardrails editoriais no texto gerado para o Telegram.
"""

import pytest
from backend.alertas_valor_esperado import (
    obter_anomalias_ev,
    formatar_ficha_telegram,
    gerar_relatorio_resumido_ev
)

def test_obter_anomalias_ev_estrutura():
    """Valida contrato de dados das anomalias retornadas."""
    anomalias = obter_anomalias_ev(min_ev=3.0, limite=5)
    assert isinstance(anomalias, list)
    assert len(anomalias) <= 5

    if anomalias:
        a = anomalias[0]
        assert 'id_partida' in a
        assert 'mandante' in a
        assert 'visitante' in a
        assert 'campeonato' in a
        assert 'mercado' in a
        assert 'odd_mercado' in a
        assert 'odd_justa_modelo' in a
        assert 'ev_percentual' in a
        assert 'indicador_confianca' in a
        assert a['odd_mercado'] > 1.0
        assert a['odd_justa_modelo'] > 1.0
        assert a['indicador_confianca'] in ('Alta', 'Moderada')

def test_obter_anomalias_ev_filtro_min_ev():
    """Garante que nenhum registro abaixo do min_ev configurado seja retornado."""
    min_corte = 6.0
    anomalias = obter_anomalias_ev(min_ev=min_corte, limite=10)
    for a in anomalias:
        assert a['ev_percentual'] >= min_corte

def test_obter_anomalias_ev_ordenacao():
    """Garante ordenação decrescente por valor esperado (+EV%)."""
    anomalias = obter_anomalias_ev(min_ev=2.0, limite=10)
    if len(anomalias) >= 2:
        for i in range(len(anomalias) - 1):
            assert anomalias[i]['ev_percentual'] >= anomalias[i+1]['ev_percentual']

def test_formatar_ficha_telegram_guardrails():
    """
    Verifica a conformidade com as diretrizes do Consultor Perplexity:
    - Uso obrigatório de enquadramento editorial.
    - Ausência terminante de linguagem apelativa/tipster.
    """
    mock_anomalia = {
        'id_partida': 9999,
        'data': '2026-11-20',
        'campeonato': 'Campeonato Brasileiro',
        'mandante': 'Palmeiras',
        'visitante': 'Flamengo',
        'mercado': 'Vitória Mandante (1)',
        'odd_mercado': 2.65,
        'odd_justa_modelo': 2.10,
        'probabilidade_modelo_pct': 47.6,
        'ev_percentual': 26.19,
        'indicador_confianca': 'Alta',
        'placar': None,
        'acerto_historico': None
    }

    texto = formatar_ficha_telegram(mock_anomalia)

    # Termos mandatórios
    assert "FICHA DE ANOMALIA ESTATÍSTICA (+EV)" in texto
    assert "Disparidade Modelo vs. Mercado" in texto
    assert "Palmeiras x Flamengo" in texto
    assert "Nota Editorial" in texto
    assert "Investigar no Painel FutStats" in texto

    # Termos estritamente proibidos (Guardrail Anti-Tipster)
    proibidos = ["aposte agora", "dica de aposta", "lucro certo", "green garantido", "odd imperdível", "craque na aposta"]
    for termo in proibidos:
        assert termo not in texto.lower()

def test_gerar_relatorio_resumido_ev():
    """Valida formato do relatório resumido para o comando /ev."""
    resumo = gerar_relatorio_resumido_ev(limite=3, min_ev=2.0)
    assert isinstance(resumo, str)
    assert len(resumo) > 50
    assert "SCANNER DE ANOMALIAS ESTATÍSTICAS" in resumo
