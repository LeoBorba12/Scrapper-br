"""
Suíte de Testes de Regressão para o Módulo de Confrontos Diretos (H2H)
Autor: Gemini Argon & Antigravity Core
"""
import pytest
from backend.app import app

@pytest.fixture
def client():
    app.config['TESTING'] = True
    with app.test_client() as client:
        yield client

def test_h2h_parametros_obrigatorios(client):
    res = client.get('/api/confrontos/h2h')
    assert res.status_code == 400
    assert "Parâmetros obrigatórios" in res.get_json()['error']

def test_h2h_mesmo_clube_retorna_400(client):
    res = client.get('/api/confrontos/h2h?clube_a=2459&clube_b=2459')
    assert res.status_code == 400
    assert "distintos" in res.get_json()['error']

def test_h2h_clube_inexistente_retorna_404(client):
    res = client.get('/api/confrontos/h2h?clube_a=2459&clube_b=9999999')
    assert res.status_code == 404
    assert "não foram encontrados" in res.get_json()['error']

def test_h2h_classico_palmeiras_vs_santos(client):
    # Palmeiras ID 2459 vs Santos ID 2902
    res = client.get('/api/confrontos/h2h?clube_a=2459&clube_b=2902')
    assert res.status_code == 200
    data = res.get_json()

    assert data['clubes']['clube_a']['clube_id'] == 2459
    assert data['clubes']['clube_b']['clube_id'] == 2902

    retro = data['retrospecto_geral']
    # Invariante matemática fundamental
    assert retro['vitorias_clube_a'] + retro['empates'] + retro['vitorias_clube_b'] == retro['total_jogos']
    assert retro['total_jogos'] == 398

    mando = data['retrospecto_mando']
    assert mando['clube_a_mandante']['total_jogos'] + mando['clube_b_mandante']['total_jogos'] == retro['total_jogos']

    # Validação da projeção Dixon-Coles
    dc = data.get('projecao_dixon_coles')
    assert dc is not None
    assert 'expectativa_gols' in dc
    assert 'probabilidades_1x2' in dc
    assert 'fair_odds' in dc
    p1x2 = dc['probabilidades_1x2']
    soma_p = p1x2['vitoria_clube_a_pct'] + p1x2['empate_pct'] + p1x2['vitoria_clube_b_pct']
    assert 99.0 <= soma_p <= 101.0
    assert dc['fair_odds']['odd_clube_a'] > 1.0

def test_h2h_invariante_inversao_de_perspectiva(client):
    # Testar se a perspectiva de A vs B é o reflexo exato de B vs A
    res_ab = client.get('/api/confrontos/h2h?clube_a=2459&clube_b=2902').get_json()
    res_ba = client.get('/api/confrontos/h2h?clube_a=2902&clube_b=2459').get_json()

    assert res_ab['retrospecto_geral']['total_jogos'] == res_ba['retrospecto_geral']['total_jogos']
    assert res_ab['retrospecto_geral']['empates'] == res_ba['retrospecto_geral']['empates']
    assert res_ab['retrospecto_geral']['vitorias_clube_a'] == res_ba['retrospecto_geral']['vitorias_clube_b']
    assert res_ab['retrospecto_geral']['vitorias_clube_b'] == res_ba['retrospecto_geral']['vitorias_clube_a']
    assert res_ab['retrospecto_geral']['gols_clube_a'] == res_ba['retrospecto_geral']['gols_clube_b']
    assert res_ab['retrospecto_geral']['gols_clube_b'] == res_ba['retrospecto_geral']['gols_clube_a']
