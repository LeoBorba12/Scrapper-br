# -*- coding: utf-8 -*-
"""
Rotas REST do Oráculo Preditivo Interativo — FutStats 2026
Endpoints somente-leitura / simulação stateless em Python puro.
"""
import datetime
import os
import sqlite3
from flask import Blueprint, jsonify, request

oraculo_preditivo_bp = Blueprint("oraculo_preditivo", __name__)

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DB_PATH = os.path.join(BASE_DIR, "data", "futebol.db")


def _get_ro_db():
    if os.environ.get("VERCEL") and os.path.exists(DB_PATH):
        try:
            conn = sqlite3.connect(f"file:{os.path.abspath(DB_PATH)}?immutable=1", uri=True, timeout=15)
        except Exception:
            conn = sqlite3.connect(DB_PATH, timeout=15)
    else:
        conn = sqlite3.connect(DB_PATH, timeout=15)
    conn.row_factory = sqlite3.Row
    return conn


def _ultimo_descanso_clube(cur, clube: str) -> int:
    row = cur.execute(
        """
        SELECT data FROM partidas
        WHERE (mandante = ? OR visitante = ?) AND gols_mandante IS NOT NULL
        ORDER BY data DESC LIMIT 1;
        """,
        (clube, clube),
    ).fetchone()
    if not row or not row["data"]:
        return 4
    try:
        ult = datetime.date.fromisoformat(str(row["data"])[:10])
        diff = (datetime.date.today() - ult).days
        return max(2, min(10, diff))
    except Exception:
        return 4


@oraculo_preditivo_bp.route("/api/oraculo-preditivo/clubes", methods=["GET"])
def listar_clubes_oraculo():
    conn = _get_ro_db()
    c = conn.cursor()
    try:
        # 20 clubes da Série A 2026 + Pi-Rating + Contexto Econômico
        clubes = [
            dict(r)
            for r in c.execute(
                """
                SELECT
                    e.clube, e.cidade, e.uf, e.eh_saf, e.tier_label, e.indice_orcamento,
                    e.prior_pontos_estrutural,
                    COALESCE(p.pi_home, 0.0) as pi_home,
                    COALESCE(p.pi_away, 0.0) as pi_away,
                    COALESCE(p.pi_geral, 0.0) as pi_geral,
                    COALESCE(p.incerteza_rd, 0.85) as incerteza_rd
                FROM clube_contexto_economico e
                LEFT JOIN clube_pi_ratings p ON LOWER(p.clube) = LOWER(e.clube)
                ORDER BY e.clube ASC;
                """
            ).fetchall()
        ]

        # Top titulares por clube (via RAPM) para o simulador de desfalques 1-clique
        elencos = {}
        try:
            rapm_rows = c.execute(
                """
                SELECT id_jogador, nome, clube_recente, jogos_titular, rapm_saldo_gols, rapm_score_0_100
                FROM atleta_rapm_scores
                WHERE jogos_titular >= 10 AND rapm_saldo_gols > 0.03
                ORDER BY rapm_saldo_gols DESC;
                """
            ).fetchall()
            for r in rapm_rows:
                clb = (r["clube_recente"] or "").strip()
                if not clb:
                    continue
                lista = elencos.setdefault(clb, [])
                if len(lista) < 6:
                    lista.append({
                        "id_jogador": r["id_jogador"],
                        "nome": r["nome"],
                        "rapm_saldo_gols": r["rapm_saldo_gols"],
                        "war_pts": round(float(r["rapm_saldo_gols"]) * 14.5, 1),
                        "jogos_titular": r["jogos_titular"],
                    })
        except sqlite3.OperationalError:
            elencos = {}

        # Próximos confrontos da rodada (ou mais recentes da Série A 2026)
        jogos_sugeridos = [
            dict(r)
            for r in c.execute(
                """
                SELECT id_partida, data, mandante, visitante, rodada
                FROM partidas
                WHERE campeonato LIKE '%Série A%' AND ano = 2026
                ORDER BY CASE WHEN gols_mandante IS NULL THEN 0 ELSE 1 END, data DESC
                LIMIT 6;
                """
            ).fetchall()
        ]

        return jsonify({
            "sucesso": True,
            "clubes": clubes,
            "elencos_rapm": elencos,
            "jogos_sugeridos": jogos_sugeridos,
        })
    finally:
        conn.close()


@oraculo_preditivo_bp.route("/api/oraculo-preditivo/simular-partida", methods=["POST"])
def simular_partida_api():
    dados = request.get_json(force=True, silent=True) or {}
    mandante = (dados.get("mandante") or "").strip()
    visitante = (dados.get("visitante") or "").strip()
    if not mandante or not visitante or mandante == visitante:
        return jsonify({"sucesso": False, "erro": "Selecione dois clubes distintos."}), 400

    desf_m_ids = [int(x) for x in (dados.get("desfalques_mandante") or []) if str(x).isdigit()]
    desf_v_ids = [int(x) for x in (dados.get("desfalques_visitante") or []) if str(x).isdigit()]

    try:
        from backend.motor_oraculo_preditivo import simular_partida_hibrida
    except ImportError:
        from motor_oraculo_preditivo import simular_partida_hibrida

    conn = _get_ro_db()
    c = conn.cursor()
    try:
        def _get_pi(clube):
            r = c.execute("SELECT * FROM clube_pi_ratings WHERE LOWER(clube) = LOWER(?)", (clube,)).fetchone()
            return dict(r) if r else {"pi_home": 0.0, "pi_away": 0.0, "pi_geral": 0.0, "incerteza_rd": 1.0}

        def _get_proc(clube):
            r = c.execute(
                """
                SELECT m.jogos, m.pontos, m.xg, m.xg_contra, m.xpts, m.field_tilt_pct, m.ppda
                FROM metrica_clube_avancada_2026 m
                JOIN dim_clube dc ON dc.clube_id = m.clube_id_canonico
                WHERE LOWER(dc.nome) = LOWER(?) LIMIT 1;
                """,
                (clube,),
            ).fetchone()
            return dict(r) if r else None

        def _get_econ(clube):
            r = c.execute("SELECT * FROM clube_contexto_economico WHERE LOWER(clube) = LOWER(?)", (clube,)).fetchone()
            return dict(r) if r else None

        def _get_desfalques(ids):
            if not ids:
                return []
            ph = ",".join("?" for _ in ids)
            try:
                return [
                    dict(r)
                    for r in c.execute(
                        f"SELECT id_jogador, nome, rapm_saldo_gols FROM atleta_rapm_scores WHERE id_jogador IN ({ph})",
                        ids,
                    ).fetchall()
                ]
            except sqlite3.OperationalError:
                return []

        dias_m = dados.get("dias_descanso_mandante")
        dias_v = dados.get("dias_descanso_visitante")
        dias_m = int(dias_m) if dias_m is not None else _ultimo_descanso_clube(c, mandante)
        dias_v = int(dias_v) if dias_v is not None else _ultimo_descanso_clube(c, visitante)

        resultado = simular_partida_hibrida(
            mandante=mandante,
            visitante=visitante,
            pi_m=_get_pi(mandante),
            pi_v=_get_pi(visitante),
            proc_m=_get_proc(mandante),
            proc_v=_get_proc(visitante),
            econ_m=_get_econ(mandante),
            econ_v=_get_econ(visitante),
            desfalques_m=_get_desfalques(desf_m_ids),
            desfalques_v=_get_desfalques(desf_v_ids),
            dias_descanso_m=dias_m,
            dias_descanso_v=dias_v,
        )
        return jsonify({"sucesso": True, **resultado})
    finally:
        conn.close()


@oraculo_preditivo_bp.route("/api/oraculo-preditivo/simular-campeonato", methods=["GET"])
def simular_campeonato_api():
    try:
        from backend.motor_oraculo_preditivo import simular_campeonato_monte_carlo
    except ImportError:
        from motor_oraculo_preditivo import simular_campeonato_monte_carlo

    conn = _get_ro_db()
    c = conn.cursor()
    try:
        rows = [
            dict(r)
            for r in c.execute(
                """
                SELECT
                    e.clube, e.cidade, e.uf, e.eh_saf, e.tier_label, e.prior_pontos_estrutural,
                    COALESCE(p.pi_geral, 0.0) as pi_geral,
                    COALESCE(mc.jogos, 0) as jogos,
                    COALESCE(mc.pontos, 0) as pontos,
                    COALESCE(mc.xpts, 0.0) as xpts
                FROM clube_contexto_economico e
                LEFT JOIN clube_pi_ratings p ON LOWER(p.clube) = LOWER(e.clube)
                LEFT JOIN dim_clube dc ON LOWER(dc.nome) = LOWER(e.clube)
                LEFT JOIN metrica_clube_avancada_2026 mc ON mc.clube_id_canonico = dc.clube_id;
                """
            ).fetchall()
        ]
        projecao = simular_campeonato_monte_carlo(rows, n_simulacoes=1200)
        return jsonify({
            "sucesso": True,
            "simulacoes": 1200,
            "projecao": projecao,
        })
    finally:
        conn.close()


@oraculo_preditivo_bp.route("/api/oraculo-preditivo/backtest", methods=["GET"])
def obter_backtest_oraculo():
    conn = _get_ro_db()
    c = conn.cursor()
    try:
        try:
            rows = [dict(r) for r in c.execute("SELECT * FROM oraculo_backtest_metrics ORDER BY rps ASC;").fetchall()]
        except sqlite3.OperationalError:
            rows = []
        return jsonify({"sucesso": True, "backtest": rows})
    finally:
        conn.close()
