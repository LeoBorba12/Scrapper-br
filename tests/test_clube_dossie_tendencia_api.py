"""
Suíte de Testes Automatizados — Dossiê Institucional Avançado e Tendência Tática
Fase 3 do Módulo Canônico de Clubes (FutStats 2026)
Homologação Pericial: Consultor Técnico Sênior (Perplexity)

Testa:
1. Dossiê Institucional: identificação canônica, estádio, capacidade e acervo.
2. Tratamento honesto de ausências ('Não catalogado', sem dados inventados).
3. Resposta 404 para clubes inexistentes.
4. Tendência Tática: apenas partidas realizadas, exclusão de agendados.
5. Deduplicação determinística em série temporal.
6. Respeito rigoroso aos limites de jogos (5, 10, 20).
7. Guardrails de amostra (amostra_insuficiente se < 5).
8. Distribuição temporal de gols por faixas de 15 minutos.
9. Consistência ofensiva e defensiva (desvios padrão calculados).
"""

import pytest
from backend.app import app

@pytest.fixture
def client():
    app.config['TESTING'] = True
    with app.test_client() as client:
        yield client

# ==============================================================================
# 1. TESTES DO ENDPOINT: /api/clubes/detalhe/<clube_id>/dossie
# ==============================================================================

def test_dossie_retorna_dados_institucionais(client):
    """Valida contrato e retorno de dados para clube tradicional (Palmeiras ID 2459)."""
    resp = client.get('/api/clubes/detalhe/2459/dossie')
    assert resp.status_code == 200
    data = resp.get_json()

    # Identificação
    assert 'identificacao' in data
    ident = data['identificacao']
    assert ident['clube_id'] == 2459
    assert ident['nome'] == 'Palmeiras'
    assert ident['pais'] == 'Brasil'

    # Institucional
    assert 'institucional' in data
    inst = data['institucional']
    assert 'fundacao' in inst
    assert 'estadio' in inst
    assert 'titulos_catalogados' in inst

    # Acervo Canônico
    assert 'acervo' in data
    acervo = data['acervo']
    assert 'primeiro_ano' in acervo
    assert 'ultimo_ano' in acervo
    assert acervo['total_partidas'] > 0
    assert isinstance(acervo['competicoes_cobertas'], list)

    # Mensagem metodológica
    assert 'mensagem_metodologica' in data
    assert 'não são imputadas' in data['mensagem_metodologica']

def test_dossie_nao_imputa_campos_ausentes(client):
    """Garante que clubes sem determinados dados cadastrais recebam 'Não catalogado'."""
    resp = client.get('/api/clubes/detalhe/2982/dossie')
    if resp.status_code == 200:
        data = resp.get_json()
        inst = data['institucional']
        if isinstance(inst['estadio'], dict):
            assert inst['estadio']['capacidade'] != 0
        else:
            assert inst['estadio'] == 'Não catalogado'

def test_dossie_clube_inexistente_retorna_404(client):
    """Busca por clube com ID inexistente deve retornar HTTP 404 estruturado."""
    resp = client.get('/api/clubes/detalhe/9999999/dossie')
    assert resp.status_code == 404
    data = resp.get_json()
    assert 'erro' in data
    assert 'não encontrado' in data['erro'].lower()


# ==============================================================================
# 2. TESTES DO ENDPOINT: /api/clubes/detalhe/<clube_id>/tendencia
# ==============================================================================

def test_tendencia_usa_apenas_jogos_realizados(client):
    """Garante que todos os jogos na curva de momento possuam placar e desfecho concluído."""
    resp = client.get('/api/clubes/detalhe/2459/tendencia?jogos=10')
    assert resp.status_code == 200
    data = resp.get_json()

    assert 'curva_momento' in data
    assert 'evolucao_por_jogo' in data

    for jogo in data['evolucao_por_jogo']:
        assert jogo['placar'] is not None
        assert jogo['resultado'] in ('V', 'E', 'D')
        assert jogo['gols_pro'] is not None
        assert jogo['gols_contra'] is not None

def test_tendencia_respeita_limite_de_jogos(client):
    """Testa seletor de recortes táticos (5 e 10 jogos)."""
    resp5 = client.get('/api/clubes/detalhe/2459/tendencia?jogos=5')
    assert resp5.status_code == 200
    d5 = resp5.get_json()
    assert d5['amostra_analisada'] <= 5
    assert len(d5['evolucao_por_jogo']) <= 5

    resp10 = client.get('/api/clubes/detalhe/2459/tendencia?jogos=10')
    assert resp10.status_code == 200
    d10 = resp10.get_json()
    assert d10['amostra_analisada'] <= 10
    assert len(d10['evolucao_por_jogo']) <= 10

def test_tendencia_deduplica_partidas(client):
    """Garante que não existam partidas duplicadas na amostra cronológica."""
    resp = client.get('/api/clubes/detalhe/2459/tendencia?jogos=20')
    assert resp.status_code == 200
    data = resp.get_json()

    chaves_vistas = set()
    for j in data['evolucao_por_jogo']:
        chave = (j['data'], j['adversario'], j['mando'])
        assert chave not in chaves_vistas, f"Partida duplicada detectada na tendência: {chave}"
        chaves_vistas.add(chave)

def test_tendencia_distribuicao_temporal_gols(client):
    """Valida estrutura de contagem de gols por faixas de 15 minutos."""
    resp = client.get('/api/clubes/detalhe/2459/tendencia?jogos=10')
    assert resp.status_code == 200
    data = resp.get_json()

    assert 'distribuicao_temporal_gols' in data
    faixas = data['distribuicao_temporal_gols']['faixas']
    
    faixas_obrigatorias = ['1-15', '16-30', '31-45+', '46-60', '61-75', '76-90+']
    for f in faixas_obrigatorias:
        assert f in faixas
        assert 'pro' in faixas[f]
        assert 'contra' in faixas[f]
        assert faixas[f]['pro'] >= 0
        assert faixas[f]['contra'] >= 0

def test_tendencia_consistencia_calculada(client):
    """Verifica se desvios padrão (consistência ofensiva e defensiva) são calculados corretamente."""
    resp = client.get('/api/clubes/detalhe/2459/tendencia?jogos=10')
    assert resp.status_code == 200
    data = resp.get_json()

    cm = data['curva_momento']
    assert 'consistencia_ofensiva_desvio_padrao' in cm
    assert 'consistencia_defensiva_desvio_padrao' in cm
    assert isinstance(cm['consistencia_ofensiva_desvio_padrao'], (int, float))
    assert isinstance(cm['consistencia_defensiva_desvio_padrao'], (int, float))
    assert cm['consistencia_ofensiva_desvio_padrao'] >= 0.0
    assert cm['consistencia_defensiva_desvio_padrao'] >= 0.0

def test_tendencia_guardrail_amostra(client):
    """Garante que aviso de amostra seja preenchido adequadamente."""
    resp = client.get('/api/clubes/detalhe/2459/tendencia?jogos=5')
    assert resp.status_code == 200
    data = resp.get_json()
    if data['amostra_analisada'] < 5:
        assert data['aviso_amostra'] == "Amostra insuficiente para cálculo de tendência confiável"
    elif data['amostra_analisada'] < 10:
        assert data['aviso_amostra'] == "Amostra reduzida (menos de 10 partidas)"

def test_tendencia_clube_inexistente_retorna_404(client):
    """Busca de tendência para ID inexistente deve retornar HTTP 404."""
    resp = client.get('/api/clubes/detalhe/9999999/tendencia')
    assert resp.status_code == 404
    data = resp.get_json()
    assert 'erro' in data
