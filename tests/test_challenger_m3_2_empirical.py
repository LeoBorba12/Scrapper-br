"""
Empirical Adversarial Test Harness — Challenger M3-2
Empirically tests Career Average Reconciliation, Honest Labeling, and Radar PES (5 axes & OVR).
"""

import sys
import os
import sqlite3
import random
import math
import pytest

PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

from backend.app import app, gerar_token, _calcular_radar_pes

def test_luis_fabiano_reconciliation():
    """Luís Fabiano (ID 9033): acervo_parcial=True, jogos_rotulo='Jogos c/ Gol', media_gols=0.53, jogos_registrados=158, media_oficial_carreira=0.53."""
    app.config["TESTING"] = True
    client = app.test_client()
    token = gerar_token({"email": "challenger@futstats.com", "role": "admin"})
    headers = {"Authorization": f"Bearer {token}"}

    resp = client.get("/api/jogadores/perfil?id=9033", headers=headers)
    assert resp.status_code == 200, f"Status code {resp.status_code}: {resp.data}"
    data = resp.get_json()
    resumo = data["resumo"]

    assert resumo["acervo_parcial"] is True, f"Esperado acervo_parcial True, obtido {resumo.get('acervo_parcial')}"
    assert resumo["jogos_rotulo"] == "Jogos c/ Gol", f"Esperado 'Jogos c/ Gol', obtido {resumo.get('jogos_rotulo')}"
    assert resumo["media_gols"] == 0.53, f"Esperado media_gols 0.53, obtido {resumo.get('media_gols')}"
    assert resumo["media_oficial_carreira"] == 0.53, f"Esperado media_oficial_carreira 0.53, obtido {resumo.get('media_oficial_carreira')}"
    assert resumo["jogos_registrados"] == 158, f"Esperado jogos_registrados 158, obtido {resumo.get('jogos_registrados')}"
    assert resumo["total_gols"] == 168, f"Esperado total_gols 168, obtido {resumo.get('total_gols')}"

    # Confirm neither 1.00 nor 1.06 appears as media_gols
    assert resumo["media_gols"] not in (1.00, 1.06), f"Média não deve ser 1.00 nem 1.06, obtido {resumo['media_gols']}"

    # Check seasons breakdown: any historical season where gols > jogos must be marked as partial
    for temp in data.get("historico_temporadas", []):
        if temp["gols"] > temp["jogos"] or (temp["ano"] < 2014 and temp["jogos"] < 20 and temp["gols"] >= 5):
            assert temp["acervo_parcial"] is True, f"Temporada {temp['ano']} deveria ser acervo parcial"
            assert temp["jogos_rotulo"] == "Jogos c/ Gol", f"Temporada {temp['ano']} rótulo incorreto"


def test_historical_legends_zico_and_romario():
    """Zico (ID 13953) e Romário (ID 12212): acervo_parcial=True, jogos_rotulo='Jogos c/ Gol' e médias autênticas."""
    app.config["TESTING"] = True
    client = app.test_client()
    token = gerar_token({"email": "challenger@futstats.com", "role": "admin"})
    headers = {"Authorization": f"Bearer {token}"}

    legends = [
        (13953, "Zico", 0.68, 98, 132),
        (12212, "Romário", 0.77, 109, 150)
    ]

    for pid, name, exp_media, exp_jogos, exp_gols in legends:
        resp = client.get(f"/api/jogadores/perfil?id={pid}", headers=headers)
        assert resp.status_code == 200, f"Falha na API para {name} ({pid})"
        data = resp.get_json()
        resumo = data["resumo"]

        assert resumo["acervo_parcial"] is True, f"{name} deve ser acervo_parcial=True"
        assert resumo["jogos_rotulo"] == "Jogos c/ Gol", f"{name} deve ter rótulo 'Jogos c/ Gol'"
        assert resumo["media_gols"] == exp_media, f"{name} esperava média {exp_media}, obtido {resumo.get('media_gols')}"
        assert resumo["media_oficial_carreira"] == exp_media, f"{name} esperava media_oficial {exp_media}, obtido {resumo.get('media_oficial_carreira')}"
        assert resumo["jogos_registrados"] == exp_jogos, f"{name} esperava jogos {exp_jogos}, obtido {resumo.get('jogos_registrados')}"
        assert resumo["total_gols"] == exp_gols, f"{name} esperava gols {exp_gols}, obtido {resumo.get('total_gols')}"


def test_modern_players_no_false_acervo_parcial():
    """Atletas modernos com acervo consolidado (jogos_carreira_oficiais <= total_jogos e total_jogos > total_gols) não devem ser falsamente marcados com acervo_parcial."""
    app.config["TESTING"] = True
    client = app.test_client()
    token = gerar_token({"email": "challenger@futstats.com", "role": "admin"})
    headers = {"Authorization": f"Bearer {token}"}

    modern_athletes = [
        (13, "Dudu", False, "Jogos"),
        (34, "Bruno Henrique", False, "Jogos"),
        (8, "Arrascaeta", False, "Jogos"),
        (12, "Raphael Veiga", False, "Jogos"),
        (15, "Gustavo Scarpa", False, "Jogos"),
        (59, "Alan Patrick", False, "Jogos"),
        (48, "Yuri Alberto", False, "Jogos"),
        (164, "Pedro Henrique", False, "Jogos"),
        (113, "Juninho Capixaba", False, "Jogos"),
        (33, "Léo Pereira", False, "Jogos")
    ]

    for pid, name, exp_parcial, exp_rotulo in modern_athletes:
        resp = client.get(f"/api/jogadores/perfil?id={pid}", headers=headers)
        assert resp.status_code == 200, f"Falha na API para {name} ({pid})"
        data = resp.get_json()
        resumo = data["resumo"]

        assert resumo["acervo_parcial"] is exp_parcial, f"{name} (ID {pid}) acervo_parcial esperado {exp_parcial}, obtido {resumo.get('acervo_parcial')}"
        assert resumo["jogos_rotulo"] == exp_rotulo, f"{name} (ID {pid}) rótulo esperado '{exp_rotulo}', obtido '{resumo.get('jogos_rotulo')}'"

        # media_gols should match local games average
        calc_media = round(resumo["total_gols"] / max(resumo["jogos_registrados"], 1), 2)
        assert resumo["media_gols"] == calc_media, f"{name} media_gols calculada {calc_media} != {resumo.get('media_gols')}"


def test_radar_pes_comprehensive_150_athletes():
    """Stress-test do Radar PES em 150+ atletas de perfis variados: zero nulls, todos eixos e OVR em [40, 99]."""
    app.config["TESTING"] = True
    client = app.test_client()
    token = gerar_token({"email": "challenger@futstats.com", "role": "admin"})
    headers = {"Authorization": f"Bearer {token}"}

    conn = sqlite3.connect("data/futebol.db")
    c = conn.cursor()

    # Coletar amostra diversa
    c.execute("SELECT id_jogador FROM jogadores_estatisticas WHERE posicao LIKE '%Goleiro%' ORDER BY total_jogos DESC LIMIT 25")
    goleiros = [r[0] for r in c.fetchall()]

    c.execute("SELECT id_jogador FROM jogadores_estatisticas WHERE (posicao LIKE '%Zagueiro%' OR posicao LIKE '%Lateral%') ORDER BY total_jogos DESC LIMIT 25")
    defensores = [r[0] for r in c.fetchall()]

    c.execute("SELECT id_jogador FROM jogadores_estatisticas WHERE (posicao LIKE '%Meia%' OR posicao LIKE '%Volante%') ORDER BY total_jogos DESC LIMIT 25")
    meias = [r[0] for r in c.fetchall()]

    c.execute("SELECT id_jogador FROM jogadores_estatisticas WHERE (posicao LIKE '%Atacante%' OR posicao LIKE '%Centroavante%') ORDER BY total_jogos DESC LIMIT 25")
    atacantes = [r[0] for r in c.fetchall()]

    # 50 aleatórios gerais
    c.execute("SELECT id_jogador FROM jogadores_estatisticas ORDER BY RANDOM() LIMIT 50")
    aleatorios = [r[0] for r in c.fetchall()]

    # Lendas
    lendas = [9033, 13953, 12212]

    todos_testados = list(dict.fromkeys(goleiros + defensores + meias + atacantes + aleatorios + lendas))
    assert len(todos_testados) >= 120, f"Amostra insuficiente: {len(todos_testados)}"

    expected_keys = {"atk", "fin", "cri", "fis", "def"}
    testados_contagem = 0

    for pid in todos_testados:
        resp = client.get(f"/api/jogadores/perfil?id={pid}", headers=headers)
        if resp.status_code != 200:
            continue

        data = resp.get_json()
        radar = data.get("radar_pes")
        assert radar is not None, f"radar_pes ausente para atleta ID {pid}"
        assert "eixos" in radar, f"'eixos' ausente no radar para atleta ID {pid}"
        assert "ovr" in radar, f"'ovr' ausente no radar para atleta ID {pid}"

        eixos = radar["eixos"]
        assert len(eixos) == 5, f"Esperado 5 eixos para atleta ID {pid}, obtido {len(eixos)}"

        keys_found = set()
        soma_valores = 0
        for eixo in eixos:
            k = eixo.get("key")
            v = eixo.get("valor")
            lbl = eixo.get("label")
            desc = eixo.get("desc")

            assert k in expected_keys, f"Chave de eixo inválida: {k} em atleta {pid}"
            assert v is not None, f"Valor nulo no eixo {k} para atleta {pid}"
            assert isinstance(v, (int, float)), f"Tipo inválido ({type(v)}) para eixo {k} em atleta {pid}"
            assert not math.isnan(v), f"NaN encontrado no eixo {k} para atleta {pid}"
            assert 40 <= v <= 99, f"Valor fora da faixa [40, 99]: {v} no eixo {k} para atleta {pid}"
            assert lbl is not None and len(lbl) > 0, f"Label vazio no eixo {k} para atleta {pid}"
            assert desc is not None and len(desc) > 0, f"Desc vazia no eixo {k} para atleta {pid}"

            keys_found.add(k)
            soma_valores += v

        assert keys_found == expected_keys, f"Chaves faltantes ou divergentes para atleta {pid}: {keys_found}"

        ovr = radar["ovr"]
        assert ovr is not None, f"OVR nulo para atleta ID {pid}"
        assert 40 <= ovr <= 99, f"OVR fora da faixa [40, 99]: {ovr} para atleta {pid}"
        media_calculada = round(soma_valores / 5)
        assert ovr == media_calculada, f"OVR {ovr} != média dos eixos {media_calculada} para atleta {pid}"

        testados_contagem += 1

    conn.close()
    assert testados_contagem >= 120, f"Menos de 120 atletas testados com sucesso: {testados_contagem}"


def test_radar_pes_adversarial_edge_cases():
    """Testa _calcular_radar_pes sob entradas extremas e adversárias (None, vazios, strings, nan, inf)."""
    # 1. Totalmente vazio
    r_empty = _calcular_radar_pes(None, None, None)
    assert len(r_empty["eixos"]) == 5
    for e in r_empty["eixos"]:
        assert 40 <= e["valor"] <= 99
    assert 40 <= r_empty["ovr"] <= 99

    # 2. Resumo com dados nulos / corrompidos (None, NaN, 0)
    resumo_corrupt = {
        "total_gols": None,
        "jogos_registrados": None,
        "total_assistencias": None,
        "pontaria_chutes_pct": float("nan"),
        "amarelos": None,
        "vermelhos": None,
        "gols_decisivos_80mais": None,
        "jogos_titular": None
    }
    r_corrupt = _calcular_radar_pes("Goleiro", resumo_corrupt, {})
    for e in r_corrupt["eixos"]:
        assert 40 <= e["valor"] <= 99
        assert not math.isnan(e["valor"])
    assert 40 <= r_corrupt["ovr"] <= 99

    # 3. Valores astronômicos (tentativa de estourar 99)
    resumo_super = {
        "total_gols": 10000,
        "jogos_registrados": 1000,
        "total_assistencias": 5000,
        "pontaria_chutes_pct": 100.0,
        "amarelos": 0,
        "vermelhos": 0,
        "gols_decisivos_80mais": 500,
        "jogos_titular": 1000
    }
    carreira_super = {"gols": 10000, "jogos": 1000, "assistencias": 5000}
    r_super = _calcular_radar_pes("Centroavante", resumo_super, carreira_super)
    for e in r_super["eixos"]:
        assert e["valor"] <= 99, f"Valor excedeu 99: {e['valor']}"
        assert e["valor"] >= 40
    assert r_super["ovr"] <= 99

    # 4. Valores negativos (tentativa de ficar abaixo de 40)
    resumo_sub = {
        "total_gols": -50,
        "jogos_registrados": -10,
        "total_assistencias": -20,
        "pontaria_chutes_pct": -100.0,
        "amarelos": 500,
        "vermelhos": 200,
        "gols_decisivos_80mais": 0,
        "jogos_titular": 0
    }
    r_sub = _calcular_radar_pes("Desconhecido", resumo_sub, {})
    for e in r_sub["eixos"]:
        assert e["valor"] >= 40, f"Valor abaixo de 40: {e['valor']}"
        assert e["valor"] <= 99
    assert r_sub["ovr"] >= 40
