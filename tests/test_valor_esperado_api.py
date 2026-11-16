"""
Suíte de Testes de Regressão para a Central de Valor Esperado (+EV)
Autor: Gemini Argon & Antigravity Core
"""
import pytest
from backend.app import app

@pytest.fixture
def client():
    app.config['TESTING'] = True
    with app.test_client() as client:
        yield client

def test_valor_esperado_contrato_resposta(client):
    res = client.get('/api/mercados/valor-esperado')
    assert res.status_code == 200
    data = res.get_json()

    assert 'filtros_aplicados' in data
    assert 'resumo_performance' in data
    assert 'oportunidades' in data
    assert isinstance(data['oportunidades'], list)

def test_valor_esperado_invariante_matematica_ev(client):
    res = client.get('/api/mercados/valor-esperado?min_ev=5.0')
    assert res.status_code == 200
    data = res.get_json()

    for item in data['oportunidades']:
        assert item['ev_percentual'] >= 5.0
        # Validar consistência matemática entre probabilidade e fair odd
        p_dec = item['probabilidade_modelo_pct'] / 100.0
        expected_fair_odd = round(1.0 / p_dec, 2)
        assert abs(item['odd_justa_modelo'] - expected_fair_odd) <= 0.05

def test_valor_esperado_ordenacao_decrescente(client):
    res = client.get('/api/mercados/valor-esperado?limite=10')
    assert res.status_code == 200
    data = res.get_json()

    evs = [op['ev_percentual'] for op in data['oportunidades']]
    assert evs == sorted(evs, reverse=True)
