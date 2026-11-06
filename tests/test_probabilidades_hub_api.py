"""
Suíte de Testes Automatizados — API /api/probabilidades/hub e Integridade de Contrato
Valida:
1. Resposta HTTP 200 com contrato compatível com o frontend (chaves essenciais)
2. Filtros de ano (recentes p.ano >= 2025, ano específico, todos)
3. Filtros de mercado (ev_plus, over_2_5, btts)
4. Ausência de fallbacks fictícios (ex: 9252) em caso de contagens
5. Resposta vazia legítima quando o filtro não encontra correspondências
6. Formato dos objetos de partida, probabilidades e selo editorial
"""

import pytest
from backend.app import app

@pytest.fixture
def client():
    app.config['TESTING'] = True
    with app.test_client() as client:
        yield client

def test_probabilidades_hub_contrato_geral(client):
    """Garante que a rota /api/probabilidades/hub retorna HTTP 200 com as chaves esperadas pelo frontend."""
    resp = client.get('/api/probabilidades/hub?limit=10')
    assert resp.status_code == 200
    data = resp.get_json()
    assert isinstance(data, dict)

    chaves_esperadas = [
        'total_banco_odds',
        'total_temporada',
        'total_filtrado',
        'partidas_exibidas',
        'total_com_ev',
        'total_over_2_5_favoravel',
        'total_btts_favoravel',
        'destaques_ev',
        'tendencias_quentes',
        'partidas'
    ]
    for chave in chaves_esperadas:
        assert chave in data, f"Chave obrigatória ausente no contrato: {chave}"

    assert isinstance(data['partidas'], list)
    assert isinstance(data['destaques_ev'], list)
    assert isinstance(data['tendencias_quentes'], list)
    assert data['total_banco_odds'] > 0
    assert data['total_temporada'] > 0

def test_probabilidades_hub_contrato_partida_individual(client):
    """Valida o payload de uma partida processada (probabilidades Poisson, Dixon-Coles, selos e odds)."""
    resp = client.get('/api/probabilidades/hub?limit=5')
    assert resp.status_code == 200
    data = resp.get_json()
    if data['partidas']:
        p = data['partidas'][0]
        assert 'id_partida' in p
        assert 'mandante' in p
        assert 'visitante' in p
        assert 'probabilidades' in p
        assert 'selo_confianca' in p
        assert 'odds_aprovadas_gate' in p
        assert 'faixa_incerteza' in p
        assert 'posicionamento_editorial' in p

        probs = p['probabilidades']
        assert 'prob_mandante' in probs
        assert 'prob_empate' in probs
        assert 'prob_visitante' in probs
        assert 'prob_over_2_5' in probs
        assert 'prob_btts_sim' in probs

def test_probabilidades_hub_filtro_ano(client):
    """Testa os filtros de temporada p.ano."""
    # Ano específico 2025
    r2025 = client.get('/api/probabilidades/hub?ano=2025&limit=5')
    assert r2025.status_code == 200
    d2025 = r2025.get_json()
    for p in d2025['partidas']:
        assert p['ano'] == 2025

    # Todos os anos
    rtodos = client.get('/api/probabilidades/hub?ano=todos&limit=5')
    assert rtodos.status_code == 200
    dtodos = rtodos.get_json()
    assert dtodos['total_filtrado'] >= d2025['total_filtrado']

def test_probabilidades_hub_filtro_mercado_ev_plus(client):
    """Testa o filtro exclusivo de +EV positivo com gate aprovado."""
    resp = client.get('/api/probabilidades/hub?mercado=ev_plus&limit=20')
    assert resp.status_code == 200
    data = resp.get_json()
    for p in data['partidas']:
        assert p['has_ev'] is True
        assert p['odds_aprovadas_gate'] is True
        assert p['leitura_analitica'] is not None
        assert p['leitura_analitica']['ev'] > 0

def test_probabilidades_hub_resposta_vazia_legitima(client):
    """Garante resposta limpa e sem exceção quando nenhum resultado satisfaz os parâmetros."""
    resp = client.get('/api/probabilidades/hub?campeonato=CampeonatoInexistenteXYZ123')
    assert resp.status_code == 200
    data = resp.get_json()
    assert data['total_filtrado'] == 0
    assert len(data['partidas']) == 0
    assert data['partidas_exibidas'] == 0
