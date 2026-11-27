import pytest
from backend.motor_econometrico import (
    calcular_eb_p90,
    calcular_indice_atletas,
    calcular_ranking_clubes_econometrico,
)
from backend.app import app


def test_empirical_bayes_shrinkage_monotonicidade():
    """Amostra pequena deve encolher mais para a média da posição do que amostra grande."""
    media_pos = 0.30
    # Ambos com taxa observada de 1.00 / 90 min (1 gol em 90 min vs 20 gols em 1800 min)
    est_pequena = calcular_eb_p90(1.0, 90.0, media_pos, k_prior=450.0)
    est_grande = calcular_eb_p90(20.0, 1800.0, media_pos, k_prior=450.0)
    assert est_pequena < est_grande
    assert media_pos < est_pequena < 1.0
    assert 0.80 < est_grande < 1.0


def test_empirical_bayes_minutos_zero_seguro():
    assert calcular_eb_p90(5.0, 0.0, 0.25, k_prior=450.0) == 0.25


def test_endpoints_econometria_http_200():
    client = app.test_client()
    r_atletas = client.get("/api/metricas-avancadas/econometria/atletas?min_minutos=270&k_prior=450&limite=20")
    assert r_atletas.status_code == 200
    d_a = r_atletas.get_json()
    assert d_a["sucesso"] is True
    assert len(d_a["ranking"]) > 0
    primeiro = d_a["ranking"][0]
    assert "score_econometrico" in primeiro
    assert "npxg_p90_eb" in primeiro
    assert "confianca_amostral" in primeiro

    r_clubes = client.get("/api/metricas-avancadas/econometria/clubes")
    assert r_clubes.status_code == 200
    d_c = r_clubes.get_json()
    assert d_c["sucesso"] is True
    assert len(d_c["clubes"]) == 20
    assert "power_score" in d_c["clubes"][0]
    assert "delta_xpts" in d_c["clubes"][0]

    r_rapm = client.get("/api/metricas-avancadas/econometria/rapm?min_jogos=15&limite=20")
    assert r_rapm.status_code == 200
    d_r = r_rapm.get_json()
    assert d_r["sucesso"] is True
    assert len(d_r["ranking"]) > 0
    assert "rapm_saldo_gols" in d_r["ranking"][0]

    r_gk = client.get("/api/metricas-avancadas/econometria/goleiros?k_prior=450&limite=15")
    assert r_gk.status_code == 200
    d_g = r_gk.get_json()
    assert d_g["sucesso"] is True
    assert len(d_g["goleiros"]) > 0
    assert "defesas_p90_eb" in d_g["goleiros"][0]

    # Similares (usando o primeiro atleta do ranking econométrico)
    alvo_id = d_a["ranking"][0]["atleta_id_canonico"]
    r_sim = client.get(f"/api/metricas-avancadas/econometria/similares?atleta_id={alvo_id}&limite=5")
    assert r_sim.status_code == 200
    d_sim = r_sim.get_json()
    assert d_sim["sucesso"] is True
    assert len(d_sim["similares"]) > 0
    for s in d_sim["similares"]:
        assert s["atleta_id_canonico"] != alvo_id
        assert 0.0 <= s["similaridade_pct"] <= 100.0
        assert len(s["tracos_comuns"]) == 3

    # Evolução da tabela na Série A 2026
    r_ev = client.get("/api/metricas-avancadas/evolucao-rodadas")
    assert r_ev.status_code == 200
    d_ev = r_ev.get_json()
    assert d_ev["sucesso"] is True
    assert len(d_ev["clubes"]) == 20


def test_similares_unitario_mesma_posicao_e_ordenacao():
    from backend.motor_econometrico import calcular_jogadores_similares
    amostra = [
        {"atleta_id_canonico": 1, "nome": "Alvo", "posicao": "Atacante", "minutos": 900, "npxg": 5.0, "xa": 2.0, "sca": 25.0, "passes_progressivos": 30.0, "conducoes_progressivas": 20.0, "dribles_certos": 15.0, "passes_terco_final": 20.0, "desarmes_ganhos": 5.0, "interceptacoes": 2.0, "cortes": 1.0, "duelos_aereos_ganhos": 10.0},
        {"atleta_id_canonico": 2, "nome": "Clone Atacante", "posicao": "Atacante", "minutos": 900, "npxg": 5.1, "xa": 2.0, "sca": 25.0, "passes_progressivos": 30.0, "conducoes_progressivas": 20.0, "dribles_certos": 15.0, "passes_terco_final": 20.0, "desarmes_ganhos": 5.0, "interceptacoes": 2.0, "cortes": 1.0, "duelos_aereos_ganhos": 10.0},
        {"atleta_id_canonico": 3, "nome": "Zagueiro Oposto", "posicao": "Zagueiro", "minutos": 900, "npxg": 0.2, "xa": 0.1, "sca": 3.0, "passes_progressivos": 10.0, "conducoes_progressivas": 4.0, "dribles_certos": 1.0, "passes_terco_final": 5.0, "desarmes_ganhos": 25.0, "interceptacoes": 20.0, "cortes": 35.0, "duelos_aereos_ganhos": 30.0},
    ]
    res = calcular_jogadores_similares(1, amostra, limite=5, min_minutos=270, mesma_posicao=True)
    assert len(res["similares"]) == 1
    assert res["similares"][0]["atleta_id_canonico"] == 2
    assert res["similares"][0]["similaridade_pct"] > 95.0
