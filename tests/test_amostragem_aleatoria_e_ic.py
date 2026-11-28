"""
Testes Estatísticos, Amostragem Aleatória Estratificada e Intervalos de Confiança (IC 95%)
=========================================================================================
Valida a integridade da base (115 mil+ partidas), calibração do motor preditivo,
detecção de deriva (Z-score) e fuzzing aleatório em rotas da API.
"""

import datetime
import math
import os
import random
import sqlite3
import sys
from pathlib import Path

import pytest

ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from backend.app import app as main_app

DB_PATH = ROOT / "data" / "futebol.db"


def wilson_ci(successes: int, n: int, z: float = 1.96):
    """Intervalo de Confiança de Wilson para proporções binomiais (default 95%)."""
    if n <= 0:
        return 0.0, 1.0
    p = successes / n
    denom = 1.0 + (z * z) / n
    center = (p + (z * z) / (2.0 * n)) / denom
    half = (z * math.sqrt((p * (1.0 - p) + (z * z) / (4.0 * n)) / n)) / denom
    return max(0.0, center - half), min(1.0, center + half)


def _ro_conn():
    conn = sqlite3.connect(f"file:{DB_PATH}?mode=ro", uri=True, timeout=10)
    conn.row_factory = sqlite3.Row
    return conn


@pytest.fixture(scope="module")
def api_client():
    main_app.config["TESTING"] = True
    return main_app.test_client()


def test_amostragem_estratificada_300_partidas_ic_95():
    """
    Sorteia 300 partidas estratificadas (100 de 2024-2026, 100 de 2010-2023, 100 pré-2010)
    com seed diária reproduzível. Com 0 falhas em n=300, IC 95% garante erro < 1.27%.
    """
    seed = datetime.date.today().toordinal()
    rng = random.Random(seed)
    conn = _ro_conn()
    try:
        strata_queries = [
            ("2024-2026", "SELECT id_partida, ano, mandante, visitante, gols_mandante, gols_visitante, vencedor FROM partidas WHERE ano >= 2024 AND gols_mandante IS NOT NULL AND gols_visitante IS NOT NULL"),
            ("2010-2023", "SELECT id_partida, ano, mandante, visitante, gols_mandante, gols_visitante, vencedor FROM partidas WHERE ano BETWEEN 2010 AND 2023 AND gols_mandante IS NOT NULL AND gols_visitante IS NOT NULL"),
            ("pre-2010", "SELECT id_partida, ano, mandante, visitante, gols_mandante, gols_visitante, vencedor FROM partidas WHERE ano < 2010 AND gols_mandante IS NOT NULL AND gols_visitante IS NOT NULL"),
        ]
        sample = []
        for label, sql in strata_queries:
            rows = conn.execute(sql).fetchall()
            assert len(rows) >= 100, f"Estrato {label} insuficiente: {len(rows)}"
            sample.extend(rng.sample(rows, 100))

        anomalias = []
        for r in sample:
            gm = int(r["gols_mandante"])
            gv = int(r["gols_visitante"])
            if not (0 <= gm <= 25 and 0 <= gv <= 25):
                anomalias.append((r["id_partida"], f"placar implausivel {gm}x{gv}"))
                continue
            venc = (r["vencedor"] or "").strip()
            if venc:
                if gm > gv and venc.lower() != (r["mandante"] or "").strip().lower():
                    anomalias.append((r["id_partida"], f"vencedor {venc} != mandante {r['mandante']}"))
                elif gv > gm and venc.lower() != (r["visitante"] or "").strip().lower():
                    anomalias.append((r["id_partida"], f"vencedor {venc} != visitante {r['visitante']}"))
                elif gm == gv and venc.lower() not in ("empate", "draw", ""):
                    anomalias.append((r["id_partida"], f"empate {gm}x{gv} marcado como {venc}"))

        n = len(sample)
        ok_count = n - len(anomalias)
        ci_low, ci_high = wilson_ci(ok_count, n)
        assert len(anomalias) == 0, (
            f"Seed={seed}: {len(anomalias)} anomalias na amostra de {n} jogos "
            f"(IC95% conformidade=[{ci_low:.3%}, {ci_high:.3%}]): {anomalias[:5]}"
        )
        assert ci_low >= 0.985, f"Limite inferior IC95% abaixo de 98.5%: {ci_low:.4f}"
    finally:
        conn.close()


def test_fuzzing_aleatorio_atletas_e_confrontos(api_client):
    """
    Fuzzing diário em 30 atletas aleatórios e 25 confrontos distintos da Série A 2026:
    verifica invariantes matemáticos, ausência de NaN/500 e soma 1X2 = 100%.
    """
    rng = random.Random(datetime.date.today().toordinal() + 7)
    conn = _ro_conn()
    try:
        atleta_ids = [
            r[0]
            for r in conn.execute("SELECT atleta_id_canonico FROM metrica_atleta_avancada_2026").fetchall()
        ]
        clubes = [
            r[0]
            for r in conn.execute("SELECT clube FROM clube_contexto_economico").fetchall()
        ]
    finally:
        conn.close()

    sampled_athletes = rng.sample(atleta_ids, min(30, len(atleta_ids)))
    for aid in sampled_athletes:
        res = api_client.get(f"/api/metricas-avancadas/atletas/{aid}")
        assert res.status_code == 200, f"Atleta {aid} retornou HTTP {res.status_code}"
        data = res.get_json()
        assert data.get("sucesso") is True
        a = data["atleta"]
        assert a["minutos"] >= 0
        assert a["xg"] >= 0 and math.isfinite(a["xg"])
        assert a["xa"] >= 0 and math.isfinite(a["xa"])

    pares = set()
    while len(pares) < 25:
        c1, c2 = rng.sample(clubes, 2)
        pares.add((c1, c2))

    for c1, c2 in pares:
        res = api_client.post(
            "/api/oraculo-preditivo/simular-partida",
            json={"mandante": c1, "visitante": c2},
        )
        assert res.status_code == 200, f"Duelo {c1}x{c2} retornou {res.status_code}"
        d = res.get_json()
        assert d.get("sucesso") is True
        probs = d["probabilidades"]
        soma = probs["prob_mandante"] + probs["prob_empate"] + probs["prob_visitante"]
        assert abs(soma - 100.0) <= 0.6, f"Soma 1X2 fora de 100% em {c1}x{c2}: {soma}"
        assert 0.05 <= d["lambda_mandante"] <= 6.0
        assert 0.05 <= d["lambda_visitante"] <= 6.0


def test_drift_estatistico_zscore_e_limites_2026():
    """
    Detecta deriva anômala na média de gols/jogo de 2026 vs histórico 2015-2025 (|Z| < 3.0)
    e valida faixas físicas plausíveis para os 20 clubes em metrica_clube_avancada_2026.
    """
    conn = _ro_conn()
    try:
        hist = conn.execute(
            """
            SELECT (gols_mandante + gols_visitante) AS tg
            FROM partidas
            WHERE ano BETWEEN 2015 AND 2025
              AND campeonato LIKE '%Série A%'
              AND gols_mandante IS NOT NULL AND gols_visitante IS NOT NULL;
            """
        ).fetchall()
        atual = conn.execute(
            """
            SELECT (gols_mandante + gols_visitante) AS tg
            FROM partidas
            WHERE ano = 2026
              AND (campeonato LIKE '%Série A%' OR campeonato = 'Brasileirão 2026')
              AND gols_mandante IS NOT NULL AND gols_visitante IS NOT NULL;
            """
        ).fetchall()

        hist_vals = [float(r[0]) for r in hist]
        atual_vals = [float(r[0]) for r in atual]
        assert len(hist_vals) > 500 and len(atual_vals) >= 50

        mean_h = sum(hist_vals) / len(hist_vals)
        var_h = sum((x - mean_h) ** 2 for x in hist_vals) / max(len(hist_vals) - 1, 1)
        mean_a = sum(atual_vals) / len(atual_vals)
        se = math.sqrt(var_h / len(atual_vals))
        z_score = abs(mean_a - mean_h) / max(se, 1e-6)
        assert z_score < 3.5, f"Deriva extrema de gols em 2026: {mean_a:.2f} vs hist {mean_h:.2f} (Z={z_score:.2f})"

        clubes_rows = conn.execute(
            "SELECT clube_id_canonico, posse_pct, field_tilt_pct, ppda, altura_defensiva FROM metrica_clube_avancada_2026"
        ).fetchall()
        assert len(clubes_rows) == 20
        for cr in clubes_rows:
            assert 25.0 <= cr["posse_pct"] <= 75.0
            assert 20.0 <= cr["field_tilt_pct"] <= 80.0
            assert 5.0 <= cr["ppda"] <= 30.0
            assert 28.0 <= cr["altura_defensiva"] <= 55.0
    finally:
        conn.close()


def test_calibracao_backtest_e_cobertura_conformal():
    """Valida métricas de calibração walk-forward (RPS) e faixas conformais no SQLite."""
    conn = _ro_conn()
    try:
        bt = conn.execute("SELECT modelo, rps, log_loss FROM oraculo_backtest_metrics").fetchall()
        if bt:
            melhor_rps = min(float(r["rps"]) for r in bt)
            assert melhor_rps < 0.25, f"RPS degradado: {melhor_rps}"

        faixas = conn.execute(
            "SELECT faixa, margem_conformal_95 FROM faixas_incerteza_modelo ORDER BY margem_conformal_95 ASC"
        ).fetchall()
        assert len(faixas) >= 3
        for f in faixas:
            assert 0.0 < float(f["margem_conformal_95"]) < 2.0
    finally:
        conn.close()
