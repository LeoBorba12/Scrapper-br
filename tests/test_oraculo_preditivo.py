from backend.app import app


def test_oraculo_preditivo_clubes_e_backtest():
    client = app.test_client()
    r = client.get("/api/oraculo-preditivo/clubes")
    assert r.status_code == 200
    d = r.get_json()
    assert d["sucesso"] is True
    assert len(d["clubes"]) == 20

    rb = client.get("/api/oraculo-preditivo/backtest")
    assert rb.status_code == 200
    db = rb.get_json()
    assert db["sucesso"] is True
    assert len(db["backtest"]) == 2
    # Oráculo Híbrido deve ter RPS menor que Baseline
    hyb = next(x for x in db["backtest"] if "Híbrido" in x["modelo"])
    base = next(x for x in db["backtest"] if "Baseline" in x["modelo"])
    assert hyb["rps"] < base["rps"]


def test_oraculo_simular_partida_monotonicidade():
    client = app.test_client()
    # 1. Sem desfalques
    r1 = client.post(
        "/api/oraculo-preditivo/simular-partida",
        json={"mandante": "Flamengo", "visitante": "Palmeiras", "dias_descanso_mandante": 4, "dias_descanso_visitante": 4},
    )
    assert r1.status_code == 200
    d1 = r1.get_json()
    p1 = d1["probabilidades"]
    assert abs((p1["prob_mandante"] + p1["prob_empate"] + p1["prob_visitante"]) - 100.0) <= 0.3

    # 2. Com desfalque de alto RAPM no mandante (Arrascaeta ID 8)
    r2 = client.post(
        "/api/oraculo-preditivo/simular-partida",
        json={
            "mandante": "Flamengo",
            "visitante": "Palmeiras",
            "desfalques_mandante": [8],
            "dias_descanso_mandante": 4,
            "dias_descanso_visitante": 4,
        },
    )
    assert r2.status_code == 200
    d2 = r2.get_json()
    assert d2["probabilidades"]["prob_mandante"] < p1["prob_mandante"]

    # 3. Vantagem de descanso favorece mandante
    r3 = client.post(
        "/api/oraculo-preditivo/simular-partida",
        json={"mandante": "Flamengo", "visitante": "Palmeiras", "dias_descanso_mandante": 7, "dias_descanso_visitante": 2},
    )
    assert r3.status_code == 200
    d3 = r3.get_json()
    assert d3["probabilidades"]["prob_mandante"] > p1["prob_mandante"]


def test_oraculo_simular_campeonato_monte_carlo():
    client = app.test_client()
    r = client.get("/api/oraculo-preditivo/simular-campeonato")
    assert r.status_code == 200
    d = r.get_json()
    assert d["sucesso"] is True
    assert len(d["projecao"]) == 20
    assert abs(sum(x["prob_titulo_pct"] for x in d["projecao"]) - 100.0) <= 2.5
