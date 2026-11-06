# -*- coding: utf-8 -*-
"""
tests/test_metricas_avancadas_api.py
======================================================================
Suíte de testes de validação obrigatória para a API de Métricas Avançadas.
Validações Estritas da Fase 5:
- 717 atletas disponíveis na API
- 20 clubes disponíveis na API
- 0 atletas em quarentena expostos
- 0 atletas novos expostos
- 0 eventos brutos expostos
- soma de gols nas métricas expostas: 853.0
- soma de xG nas métricas expostas: 856.4
- soma de minutos liga nas métricas expostas: 59.421
- parâmetros: clube_id_canonico, posicao, minimo_minutos, ordenacao, limite, pagina
"""

import pytest
import json
from backend.app import app

@pytest.fixture
def client():
    app.config['TESTING'] = True
    with app.test_client() as client:
        yield client

def test_meta_endpoint_exatidao_matematica(client):
    res = client.get('/api/metricas-avancadas/meta')
    assert res.status_code == 200
    data = res.get_json()
    assert data["sucesso"] is True
    meta = data["metadados"]
    assert meta["fonte"] == "brasileiraoemdados.com.br"
    assert "Brasileirão em Dados" in meta["atribuicao"]
    
    # Validações Numéricas Obrigatórias da Fase 5
    assert meta["atletas_elegiveis"] == 717
    assert meta["clubes_participantes"] == 20
    assert meta["soma_gols_atletas"] == 853.0
    assert meta["soma_xg_atletas"] == 856.4
    assert meta["soma_minutos_liga_elegiveis"] == 59421
    assert meta["soma_minutos_individuais_atletas"] == 658192

def test_atletas_list_e_paginacao(client):
    # Testar limite e paginação
    res = client.get('/api/metricas-avancadas/atletas?limite=20&pagina=1')
    assert res.status_code == 200
    data = res.get_json()
    assert data["sucesso"] is True
    assert data["total"] == 717
    assert len(data["atletas"]) == 20
    assert data["pagina"] == 1
    assert data["total_paginas"] == 36

    # Testar página 2 com offset correto
    res_p2 = client.get('/api/metricas-avancadas/atletas?limite=20&pagina=2')
    assert res_p2.status_code == 200
    data_p2 = res_p2.get_json()
    assert len(data_p2["atletas"]) == 20
    # Atletas da p1 e p2 devem ser disjuntos
    ids_p1 = {a["atleta_id_canonico"] for a in data["atletas"]}
    ids_p2 = {a["atleta_id_canonico"] for a in data_p2["atletas"]}
    assert ids_p1.isdisjoint(ids_p2)

def test_atletas_parametros_obrigatorios(client):
    # Testar filtro por clube_id_canonico e minimo_minutos
    res = client.get('/api/metricas-avancadas/atletas?clube_id_canonico=1735&minimo_minutos=450&ordenacao=xg')
    assert res.status_code == 200
    data = res.get_json()
    assert data["sucesso"] is True
    for a in data["atletas"]:
        assert a["clube_id_canonico"] == 1735
        assert a["minutos"] >= 450

    # Testar ordenacao decrescente
    xgs = [a["xg"] for a in data["atletas"]]
    assert xgs == sorted(xgs, reverse=True)

def test_atleta_detalhe_e_isolamento(client):
    # Atleta válido
    res = client.get('/api/metricas-avancadas/atletas/9')
    assert res.status_code == 200
    data = res.get_json()
    assert data["sucesso"] is True
    atleta = data["atleta"]
    assert atleta["atleta_id_canonico"] == 9
    assert "xg" in atleta
    assert "xa" in atleta
    assert "passes_progressivos" in atleta
    assert "sca" in atleta
    assert "gca" in atleta
    # Proibido expor coordenadas ou eventos brutos
    assert "coordenadas" not in atleta
    assert "eventos" not in atleta
    assert "mapa_calor" not in atleta

    # 404 para atleta inexistente
    res_404 = client.get('/api/metricas-avancadas/atletas/99999999')
    assert res_404.status_code == 404

def test_clubes_list_e_parametros(client):
    res = client.get('/api/metricas-avancadas/clubes?limite=20&pagina=1')
    assert res.status_code == 200
    data = res.get_json()
    assert data["sucesso"] is True
    assert data["total"] == 20
    assert len(data["clubes"]) == 20

    c0 = data["clubes"][0]
    assert "clube_id_canonico" in c0
    assert "clube_nome" in c0
    assert "xg" in c0
    assert "xg_contra" in c0
    assert "xpts" in c0
    assert "posse_pct" in c0
    assert "field_tilt_pct" in c0
    assert "ppda" in c0

def test_clube_detalhe(client):
    res = client.get('/api/metricas-avancadas/clubes/1735')
    assert res.status_code == 200
    data = res.get_json()
    assert data["sucesso"] is True
    assert data["clube"]["clube_id_canonico"] == 1735
    assert len(data["elenco"]) > 0
    for atleta in data["elenco"]:
        assert "atleta_id_canonico" in atleta
        assert "xg" in atleta

def test_rankings_todas_metricas(client):
    metricas = ['xg', 'npxg', 'xa', 'passes_progressivos', 'sca', 'gca', 'gols', 'assistencias']
    for m in metricas:
        res = client.get(f'/api/metricas-avancadas/rankings?metrica={m}&minimo_minutos=300&limite=10')
        assert res.status_code == 200
        data = res.get_json()
        assert data["sucesso"] is True
        ranking = data["ranking"]
        assert len(ranking) <= 10
        for item in ranking:
            assert item["minutos"] >= 300
            assert "valor" in item
            assert "valor_por_90" in item

def test_bloqueio_rigoroso_novos_e_quarentena(client):
    with open('data/staging/brasileirao_em_dados/metricas_atletas_2026.json', 'r', encoding='utf-8') as f:
        atletas_staging = json.load(f)

    novos = [a for a in atletas_staging if a.get('status_reconciliacao') == 'NOVO_ATLETA']
    quarentenas = [a for a in atletas_staging if a.get('status_reconciliacao') == 'QUARENTENA']

    assert len(novos) == 7
    assert len(quarentenas) == 4

    # Carregar todos os 717 atletas expostos pela API
    res = client.get('/api/metricas-avancadas/atletas?limite=717')
    assert res.status_code == 200
    atletas_api = res.get_json()["atletas"]
    assert len(atletas_api) == 717

    ids_api = {a["atleta_id_canonico"] for a in atletas_api}

    # Nenhum novo atleta pode estar presente
    for n in novos:
        assert n["atleta_id_canonico"] is None
        assert n["bed_id"] not in ids_api

    # Nenhum atleta em quarentena pode estar presente
    for q in quarentenas:
        assert q["bed_id"] not in ids_api
        res_q = client.get(f'/api/metricas-avancadas/atletas/{q["bed_id"]}')
        if res_q.status_code == 200:
            assert res_q.get_json()["atleta"]["nome"] != q["nome_bed"]
