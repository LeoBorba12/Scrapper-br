# -*- coding: utf-8 -*-
"""
tests/test_fase6_paginas.py
======================================================================
Testes automatizados das APIs REST da Fase 6:
- Páginas de Técnico
- Páginas de Árbitro
- Páginas de Competição

Garante:
- Respostas 200 para técnicos, árbitros e competições válidos.
- Respostas 400 para parâmetros ausentes.
- Honestidade de dados: ausência de scouts detalhados deve resultar em None (exibido como 'Não disponível' na UI).
- Integridade das agregações e cálculos de classificação e artilharia.
"""

import pytest
import sys
import os

# Adiciona o diretório raiz ao path
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

from backend.app import app

@pytest.fixture
def client():
    app.config['TESTING'] = True
    with app.test_client() as client:
        yield client

def test_tecnicos_lista_completa(client):
    """Testa listagem completa de técnicos catalogados."""
    resp = client.get('/api/tecnicos/lista-completa')
    assert resp.status_code == 200
    data = resp.get_json()
    assert "total" in data
    assert "tecnicos" in data
    assert data["total"] > 0
    t = data["tecnicos"][0]
    assert "nome" in t
    assert "aproveitamento_pct" in t
    assert "total_jogos" in t

def test_tecnicos_detalhe_valido(client):
    """Testa perfil detalhado de um técnico histórico com títulos e confrontos."""
    resp = client.get('/api/tecnicos/detalhe-completo?nome=Abel+Ferreira')
    assert resp.status_code == 200
    data = resp.get_json()
    assert data["sucesso"] is True
    assert "Abel" in data["perfil"]["nome"]
    assert data["perfil"]["total_jogos"] > 0
    assert isinstance(data["perfil"]["titulos"], list)
    assert isinstance(data["historico_competicoes"], list)
    assert isinstance(data["confrontos_relevantes"], list)

def test_tecnicos_detalhe_sem_parametro(client):
    """Testa erro 400 ao omitir parâmetro obrigatório."""
    resp = client.get('/api/tecnicos/detalhe-completo')
    assert resp.status_code == 400

def test_arbitros_lista_completa(client):
    """Testa listagem de árbitros da temporada e do acervo."""
    resp = client.get('/api/arbitros/lista-completa')
    assert resp.status_code == 200
    data = resp.get_json()
    assert "arbitros_temporada" in data
    assert "arbitros_historico" in data
    assert len(data["arbitros_temporada"]) > 0
    assert len(data["arbitros_historico"]) > 0

def test_arbitros_detalhe_com_scouts_temporada(client):
    """Testa árbitro com dados detalhados na temporada (Anderson Daronco)."""
    resp = client.get('/api/arbitros/detalhe-completo?nome=Anderson+Daronco')
    assert resp.status_code == 200
    data = resp.get_json()
    assert data["sucesso"] is True
    assert "Anderson Daronco" in data["nome"]
    assert data["estatisticas_temporada"]["faltas_por_jogo"] is not None
    assert data["estatisticas_temporada"]["penaltis_por_jogo"] is not None
    assert data["acervo_historico"]["total_jogos"] > 0
    assert isinstance(data["historico_competicoes"], list)
    assert isinstance(data["ultimos_confrontos"], list)

def test_arbitros_detalhe_honesto_sem_dados(client):
    """Testa regra de honestidade: árbitro do acervo sem dados de faltas retorna None (Não disponível)."""
    resp = client.get('/api/arbitros/detalhe-completo?nome=Romualdo+Arppi+Filho')
    assert resp.status_code == 200
    data = resp.get_json()
    assert data["sucesso"] is True
    # Não possui faltas catalogadas na temporada atual
    assert data["estatisticas_temporada"]["faltas_por_jogo"] is None
    assert data["estatisticas_temporada"]["penaltis_por_jogo"] is None

def test_competicoes_lista_geral(client):
    """Testa listagem de competições do acervo canônico."""
    resp = client.get('/api/competicoes/lista-geral')
    assert resp.status_code == 200
    data = resp.get_json()
    assert "total" in data
    assert "competicoes" in data
    assert data["total"] > 0
    c = data["competicoes"][0]
    assert "nome" in c
    assert "total_partidas" in c
    assert "ano_inicio" in c

def test_competicoes_detalhe_edicao(client):
    """Testa detalhes de uma edição com classificação e artilharia (Brasileirão 2024)."""
    resp = client.get('/api/competicoes/detalhe-edicao?nome=Campeonato+Brasileiro+Série+A&ano=2024')
    assert resp.status_code == 200
    data = resp.get_json()
    assert data["sucesso"] is True
    assert data["ano"] == 2024
    assert data["visao_geral"]["total_partidas"] > 0
    assert data["visao_geral"]["media_gols"] > 0
    assert len(data["classificacao"]) > 0
    # Valida estrutura da classificação
    lider = data["classificacao"][0]
    assert lider["posicao"] == 1
    assert "clube" in lider
    assert "pontos" in lider
    # Valida artilharia
    assert len(data["artilharia"]) > 0
    art = data["artilharia"][0]
    assert "atleta" in art
    assert "total_gols" in art
    # Valida jogos históricos
    assert "maiores_goleadas" in data["momentos_historicos"]
    assert "jogos_mais_gols" in data["momentos_historicos"]
