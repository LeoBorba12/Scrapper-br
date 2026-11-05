import pytest
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
from backend.app import app

@pytest.fixture
def client():
    app.config['TESTING'] = True
    with app.test_client() as client:
        yield client

def test_api_atletas_metricas_golden_exploratoria(client):
    res = client.get('/api/atletas/metricas-golden')
    assert res.status_code == 200
    data = res.get_json()
    assert 'dados' in data
    assert data['total'] > 0

    primeiro = data['dados'][0]
    assert 'gols_por_90' in primeiro
    assert 'gols_abertos' in primeiro
    assert 'gols_penalti' in primeiro
    assert 'gols_por_90_titular' in primeiro
    assert 'dependencia_ofensiva_em_campo' in primeiro
    assert primeiro['minutos'] >= 270

def test_api_atletas_metricas_golden_definitiva(client):
    res = client.get('/api/atletas/metricas-golden?visao=definitiva')
    assert res.status_code == 200
    data = res.get_json()
    assert data['visao'] == 'definitiva'
    assert data['total'] > 0
    for d in data['dados']:
        assert d['minutos'] >= 2700

def test_api_clubes_dossie_ofensivo(client):
    res = client.get('/api/clubes/dossie-ofensivo?clube=Flamengo')
    assert res.status_code == 200
    data = res.get_json()
    assert 'clube' in data
    assert data['clube']['selo_cobertura'] == 'Dossiê Completo (100% SLA)'
    assert 'principais_dependentes_ofensivos' in data
    assert 'elenco_producao_ofensiva' in data
    assert len(data['elenco_producao_ofensiva']) > 0

def test_api_clubes_cobertura_sla_100_golden(client):
    res = client.get('/api/clubes/cobertura-sla')
    assert res.status_code == 200
    data = res.get_json()
    assert 'clubes' in data
    
    # Conferir se clubes do Golden Dataset possuem 100%
    golden_nomes = {'Flamengo', 'Palmeiras', 'São Paulo', 'Santos', 'Corinthians', 'Vasco', 'Fluminense', 'Grêmio', 'Internacional', 'Cruzeiro'}
    encontrados = 0
    for c in data['clubes']:
        if c['nome'] in golden_nomes:
            assert c['cobertura_pct'] == 100.0
            assert c['selo'] == 'COBERTURA_TOTAL'
            encontrados += 1
    assert encontrados >= 10
