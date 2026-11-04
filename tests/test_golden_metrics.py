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

def test_api_atletas_metricas_golden(client):
    res = client.get('/api/atletas/metricas-golden')
    assert res.status_code == 200
    data = res.get_json()
    assert 'dados' in data
    assert data['total'] > 0

    primeiro = data['dados'][0]
    assert 'gols_por_90' in primeiro
    assert 'titularidade_pct' in primeiro
    assert 'dependencia_ofensiva' in primeiro
    assert 'classificacao_amostra' in primeiro
    assert primeiro['minutos'] >= 270  # Amostra mínima filtrada por padrão

def test_api_atletas_metricas_golden_sem_filtro(client):
    res = client.get('/api/atletas/metricas-golden?amostra_minima=0&limit=1000')
    assert res.status_code == 200
    data = res.get_json()
    assert data['total'] >= 700

def test_api_clubes_cobertura_sla(client):
    res = client.get('/api/clubes/cobertura-sla')
    assert res.status_code == 200
    data = res.get_json()
    assert 'clubes' in data
    assert data['total'] > 0

    # Verificar selos válidos
    selos_validos = {'COBERTURA_TOTAL', 'COBERTURA_PARCIAL', 'RETROSPECTO_BASICO', 'PAGINA_RESTRITA'}
    for c in data['clubes'][:20]:
        assert c['selo'] in selos_validos
        assert 'experiencia' in c
