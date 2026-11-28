import json
import sqlite3
import sys
import threading
from pathlib import Path

import pytest
from werkzeug.serving import make_server

ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from scripts.vm_auth_server import create_auth_app
from scripts.coletar_espacial_tatico_fotmob import init_spatial_db
from backend.app import app as main_app, api_cache


@pytest.fixture
def spatial_stack(tmp_path, monkeypatch):
    auth_db = str(tmp_path / "auth.db")
    spatial_db = str(tmp_path / "spatial.db")
    secret = "pytest-spatial-secret"

    s_conn = init_spatial_db(spatial_db)
    s_conn.execute(
        """
        INSERT INTO player_spatial
        (atleta_id_canonico, fotmob_id, nome, nome_norm, clube_id_canonico, clube_nome,
         posicao_primaria, heatmap_json, shotmap_json, telemetria_json, traits_json,
         amostras_brutas, total_chutes, atualizado_em)
        VALUES (10, 851608, 'Pedro', 'pedro', 414, 'Flamengo', 'Atacante', ?, ?, ?, '{}', 2, 1, '2026-11-27 00:00:00')
        """,
        (
            json.dumps([{"x": 78.5, "y": 50.0}, {"x": 86.2, "y": 48.0}]),
            json.dumps([
                {
                    "id_evento": 999,
                    "minuto": 34,
                    "resultado": "goal",
                    "parte_corpo": "Pé Direito",
                    "situacao": "Bola Rolando",
                    "xg": 0.42,
                    "xgot": 0.78,
                    "x_origem": 90.0,
                    "y_origem": 49.0,
                    "x_metros": 94.5,
                    "y_metros": 33.3,
                    "gol_mouth_y": 52.0,
                    "gol_mouth_z": 20.0,
                    "adversario": "Palmeiras",
                }
            ]),
            json.dumps({"is_real": True, "fonte": "FotMob • Rastreamento Real 2026 (2 toques reais)"}),
        ),
    )
    s_conn.execute(
        """
        INSERT INTO club_tactical_trends
        (clube_id_canonico, fotmob_id, clube_nome, clube_sigla, jogos_analisados,
         esquema_principal, esquema_recente_5, esquemas_json, tendencia_esquemas_json,
         xi_medio_json, attacking_zones_json, shot_profile_json, atualizado_em)
        VALUES (481, 7877, 'Bahia', 'BAH', 35, '4-3-3', '4-2-3-1', ?, ?, ?, ?, ?, '2026-11-27 00:00:00')
        """,
        (
            json.dumps([{"esquema": "4-3-3", "jogos": 22, "pct": 62.9}]),
            json.dumps([{"data": "2026-11-22", "adversario": "Flamengo", "casa": True, "placar": "2-1", "esquema": "4-2-3-1"}]),
            json.dumps([{"id": 1, "nome": "Marcos Felipe", "camisa": 22, "posId": 11, "x": 10.0, "y": 50.0}]),
            json.dumps({"total": {"left": 38.0, "center": 27.0, "right": 35.0}}),
            json.dumps({"total": 420, "dentro_area_pct": 64.0, "bola_parada_pct": 21.0, "contra_ataque_pct": 9.0}),
        ),
    )
    s_conn.commit()
    s_conn.close()

    monkeypatch.setenv("FUTSTATS_SPATIAL_DB", spatial_db)
    auth_app = create_auth_app(db_path=auth_db, shared_secret=secret, enable_telegram=False)

    server = make_server("127.0.0.1", 0, auth_app)
    port = server.server_port
    threading.Thread(target=server.serve_forever, daemon=True).start()

    monkeypatch.setenv("FUTSTATS_AUTH_URL", f"http://127.0.0.1:{port}")
    monkeypatch.setenv("FUTSTATS_AUTH_SECRET", secret)
    api_cache._cache.clear() if hasattr(api_cache, "_cache") else None

    main_app.config["TESTING"] = True
    try:
        yield main_app.test_client()
    finally:
        server.shutdown()


def test_spatial_atleta_real_e_sem_mock_para_ausente(spatial_stack):
    client = spatial_stack

    r_ok = client.get("/api/spatial/atleta/10?nome=Pedro")
    assert r_ok.status_code == 200
    d_ok = r_ok.get_json()
    assert d_ok["found"] is True
    assert len(d_ok["heatmap"]) == 2
    assert d_ok["telemetria_espacial"]["is_real"] is True

    r_miss = client.get("/api/spatial/atleta/999999?nome=JogadorHistoricoInexistente")
    assert r_miss.status_code == 200
    assert r_miss.get_json()["found"] is False


def test_tendencias_taticas_combina_db_e_vm(spatial_stack):
    client = spatial_stack
    r = client.get("/api/spatial/tendencias-taticas")
    assert r.status_code == 200
    d = r.get_json()
    assert d["sucesso"] is True
    assert d["total"] >= 20
    assert d["tem_dados_espaciais_vm"] is True
    bah = [c for c in d["clubes"] if c["clube_id_canonico"] == 481][0]
    assert bah["esquema_principal"] == "4-3-3"
    assert bah["esquema_recente_5"] == "4-2-3-1"
    assert bah["attacking_zones"]["total"]["left"] == 38.0
    assert bah["ppda"] is not None
    assert bah["altura_defensiva"] is not None


def test_tendencias_taticas_inclui_live_metrics_e_clube_promovido(tmp_path, monkeypatch):
    auth_db = str(tmp_path / "auth2.db")
    spatial_db = str(tmp_path / "spatial2.db")
    secret = "pytest-spatial-secret-2"
    s_conn = init_spatial_db(spatial_db)
    s_conn.execute(
        """
        INSERT INTO club_tactical_trends
        (clube_id_canonico, fotmob_id, clube_nome, clube_sigla, jogos_analisados,
         esquema_principal, esquema_recente_5, esquemas_json, tendencia_esquemas_json,
         xi_medio_json, attacking_zones_json, shot_profile_json, live_metrics_json, atualizado_em)
        VALUES (999901, 999901, 'Clube Promovido FC', 'CPF', 10, '3-5-2', '3-5-2', '[]', '[]', '[]', '{}', '{}', ?, '2026-11-27 00:00:00')
        """,
        (json.dumps({"posse_pct": 54.2, "field_tilt_pct": 58.1, "ppda": 9.8, "altura_defensiva": 44.0, "pontos": 21}),),
    )
    s_conn.commit()
    s_conn.close()

    monkeypatch.setenv("FUTSTATS_SPATIAL_DB", spatial_db)
    auth_app = create_auth_app(db_path=auth_db, shared_secret=secret, enable_telegram=False)
    server = make_server("127.0.0.1", 0, auth_app)
    threading.Thread(target=server.serve_forever, daemon=True).start()
    monkeypatch.setenv("FUTSTATS_AUTH_URL", f"http://127.0.0.1:{server.server_port}")
    monkeypatch.setenv("FUTSTATS_AUTH_SECRET", secret)
    api_cache._cache.clear() if hasattr(api_cache, "_cache") else None
    main_app.config["TESTING"] = True
    try:
        r = main_app.test_client().get("/api/spatial/tendencias-taticas")
        d = r.get_json()
        novo = [c for c in d["clubes"] if c["clube_id_canonico"] == 999901]
        assert len(novo) == 1
        assert novo[0]["ppda"] == 9.8
        assert novo[0]["esquema_principal"] == "3-5-2"
    finally:
        server.shutdown()


def test_monte_carlo_sem_clubes_zerados_inclui_bragantino(spatial_stack):
    client = spatial_stack
    r = client.get("/api/oraculo-preditivo/simular-campeonato")
    assert r.status_code == 200
    d = r.get_json()
    assert d["sucesso"] is True
    proj = d["projecao"]
    assert len(proj) == 20
    zerados = [c["clube"] for c in proj if c["pontos_atuais"] <= 0 or c["jogos"] <= 0]
    assert zerados == [], f"Clubes zerados no Monte Carlo: {zerados}"
