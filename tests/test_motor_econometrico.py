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
