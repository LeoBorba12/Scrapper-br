#!/usr/bin/env python3
"""
FutStats - Coletor Real de Mapas de Calor, Shotmaps e Tendência Tática (FotMob 2026)
Popula /opt/futstats/spatial.db na VM Oracle (zero impacto no limite de 84/94 MB de data/futebol.db).
"""

import argparse
import json
import os
import sqlite3
import time
from collections import Counter, defaultdict
from concurrent.futures import ThreadPoolExecutor, as_completed
from datetime import datetime, timezone

try:
    from curl_cffi import requests as cf_requests
except ImportError:
    import requests as cf_requests

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CANON_DB = os.path.join(BASE_DIR, "data", "futebol.db")
DEFAULT_SPATIAL_DB = "/opt/futstats/spatial.db"
SERIE_A_LEAGUE_ID = 268

_THREAD_LOCAL = __import__("threading").local()


def _get_session():
    s = getattr(_THREAD_LOCAL, "session", None)
    if s is None:
        try:
            s = cf_requests.Session(impersonate="chrome124")
        except TypeError:
            s = cf_requests.Session()
        _THREAD_LOCAL.session = s
    return s


def _fetch_json(url, timeout=12):
    sess = _get_session()
    headers = {
        "Referer": "https://www.fotmob.com/",
        "Accept": "application/json",
    }
    for attempt in range(3):
        try:
            r = sess.get(url, headers=headers, timeout=timeout)
            if r.status_code == 200:
                return r.json()
            if r.status_code == 404:
                return None
        except Exception:
            pass
        time.sleep(0.35 * (attempt + 1))
    return None


def init_spatial_db(spatial_db_path):
    os.makedirs(os.path.dirname(os.path.abspath(spatial_db_path)), exist_ok=True)
    conn = sqlite3.connect(spatial_db_path, timeout=15)
    conn.execute("PRAGMA journal_mode=WAL")
    conn.execute("PRAGMA busy_timeout=5000")
    conn.execute(
        """
        CREATE TABLE IF NOT EXISTS player_spatial (
            atleta_id_canonico INTEGER PRIMARY KEY,
            fotmob_id INTEGER NOT NULL,
            nome TEXT NOT NULL,
            nome_norm TEXT NOT NULL,
            clube_id_canonico INTEGER,
            clube_nome TEXT,
            posicao_primaria TEXT,
            heatmap_json TEXT NOT NULL,
            shotmap_json TEXT NOT NULL,
            telemetria_json TEXT NOT NULL,
            traits_json TEXT NOT NULL,
            amostras_brutas INTEGER DEFAULT 0,
            total_chutes INTEGER DEFAULT 0,
            atualizado_em TEXT NOT NULL
        )
        """
    )
    conn.execute(
        "CREATE INDEX IF NOT EXISTS idx_player_spatial_nome_norm ON player_spatial(nome_norm)"
    )
    conn.execute(
        """
        CREATE TABLE IF NOT EXISTS club_tactical_trends (
            clube_id_canonico INTEGER PRIMARY KEY,
            fotmob_id INTEGER NOT NULL,
            clube_nome TEXT NOT NULL,
            clube_sigla TEXT,
            jogos_analisados INTEGER DEFAULT 0,
            esquema_principal TEXT,
            esquema_recente_5 TEXT,
            esquemas_json TEXT NOT NULL,
            tendencia_esquemas_json TEXT NOT NULL,
            xi_medio_json TEXT NOT NULL,
            attacking_zones_json TEXT NOT NULL,
            shot_profile_json TEXT NOT NULL,
            atualizado_em TEXT NOT NULL
        )
        """
    )
    conn.commit()
    return conn


def _norm_name(text):
    import unicodedata

    t = unicodedata.normalize("NFKD", (text or "").strip().lower())
    return "".join(ch for ch in t if not unicodedata.combining(ch))


def _traduzir_parte_corpo(shot_type):
    m = {
        "RightFoot": "Pé Direito",
        "LeftFoot": "Pé Esquerdo",
        "Header": "Cabeça",
    }
    return m.get(shot_type, shot_type or "Pé")


def _traduzir_situacao(sit):
    m = {
        "RegularPlay": "Bola Rolando",
        "FastBreak": "Contra-Ataque",
        "SetPiece": "Bola Parada",
        "FromCorner": "Escanteio",
        "FreeKick": "Falta Direta",
        "Penalty": "Pênalti",
    }
    return m.get(sit, sit or "Bola Rolando")


def _processar_player_payload(row_meta, payload):
    if not payload or not isinstance(payload, dict):
        return None

    fss = payload.get("firstSeasonStats") or {}
    raw_coords = (fss.get("heatmap") or {}).get("coordinates") or []
    raw_shots = fss.get("shotmap") or []

    # Normalizar coordenadas de 105x68m (FotMob) para 0..100% (esperado pelo SpatialPitchMap)
    pts_all = []
    for pt in raw_coords:
        x = pt.get("x")
        y = pt.get("y")
        if x is None or y is None:
            continue
        x_pct = round(max(0.5, min(99.5, (float(x) / 105.0) * 100.0)), 1)
        y_pct = round(max(0.5, min(99.5, (float(y) / 68.0) * 100.0)), 1)
        pts_all.append({"x": x_pct, "y": y_pct})

    # Normalizar chutes reais
    shotmap = []
    for sh in raw_shots:
        sx = sh.get("x")
        sy = sh.get("y")
        if sx is None or sy is None:
            continue
        x_pct = round(max(0.0, min(100.0, (float(sx) / 105.0) * 100.0)), 1)
        y_pct = round(max(0.0, min(100.0, (float(sy) / 68.0) * 100.0)), 1)
        ev = sh.get("eventType")
        res = "goal" if ev == "Goal" else ("save" if ev == "AttemptSaved" else "miss")

        gy = sh.get("goalCrossedY")
        gz = sh.get("goalCrossedZ")
        mouth_y = round(max(0.0, min(100.0, ((float(gy) - 30.34) / 7.32) * 100.0)), 1) if gy is not None else 50.0
        mouth_z = round(max(0.0, min(100.0, (float(gz) / 2.44) * 100.0)), 1) if gz is not None else 25.0

        is_home = str(sh.get("teamId")) == str(sh.get("homeTeamId"))
        adv = sh.get("awayTeamName") if is_home else sh.get("homeTeamName")
        shotmap.append(
            {
                "id_evento": sh.get("id"),
                "minuto": sh.get("min") or "—",
                "resultado": res,
                "parte_corpo": _traduzir_parte_corpo(sh.get("shotType")),
                "situacao": _traduzir_situacao(sh.get("situation")),
                "xg": round(float(sh.get("expectedGoals") or 0.0), 3),
                "xgot": round(float(sh.get("expectedGoalsOnTarget") or 0.0), 3),
                "x_origem": x_pct,
                "y_origem": y_pct,
                "x_metros": round(float(sx), 1),
                "y_metros": round(float(sy), 1),
                "gol_mouth_y": mouth_y,
                "gol_mouth_z": mouth_z,
                "adversario": adv or "Adversário",
            }
        )

    if not pts_all and not shotmap:
        return None

    # Telemetria calculada sobre 100% dos toques reais
    tot = len(pts_all)
    if tot > 0:
        cx_pct = round(sum(p["x"] for p in pts_all) / tot, 1)
        cy_pct = round(sum(p["y"] for p in pts_all) / tot, 1)
        def_c = sum(1 for p in pts_all if p["x"] < 35.0)
        mid_c = sum(1 for p in pts_all if 35.0 <= p["x"] < 70.0)
        atk_c = sum(1 for p in pts_all if p["x"] >= 70.0)
        esq_c = sum(1 for p in pts_all if p["y"] < 33.3)
        cen_c = sum(1 for p in pts_all if 33.3 <= p["y"] <= 66.6)
        dir_c = sum(1 for p in pts_all if p["y"] > 66.6)
        tercos = {
            "defensivo_pct": round((def_c / tot) * 100, 1),
            "central_pct": round((mid_c / tot) * 100, 1),
            "ofensivo_pct": round((atk_c / tot) * 100, 1),
        }
        corredores = {
            "flanco_esquerdo_pct": round((esq_c / tot) * 100, 1),
            "zona_central_pct": round((cen_c / tot) * 100, 1),
            "flanco_direito_pct": round((dir_c / tot) * 100, 1),
        }
    else:
        cx_pct, cy_pct = 75.0, 50.0
        tercos = {"defensivo_pct": 0.0, "central_pct": 25.0, "ofensivo_pct": 75.0}
        corredores = {"flanco_esquerdo_pct": 33.3, "zona_central_pct": 33.4, "flanco_direito_pct": 33.3}

    altura = "Avançado" if cx_pct >= 62.0 else ("Médio" if cx_pct >= 38.0 else "Baixo")
    pos_desc = (payload.get("positionDescription") or {}).get("primaryPosition") or {}
    pos_label = row_meta.get("posicao") or pos_desc.get("label") or "Jogador"

    # Downsample uniforme para manter resposta de API leve (~280 pontos max)
    if len(pts_all) > 280:
        step = len(pts_all) / 280.0
        heatmap_out = [pts_all[int(i * step)] for i in range(280)]
    else:
        heatmap_out = pts_all

    telemetria = {
        "is_real": True,
        "papel_tatico": pos_label,
        "centroide_x_pct": cx_pct,
        "centroide_y_pct": cy_pct,
        "centroide_x_metros": round((cx_pct / 100.0) * 105.0, 1),
        "centroide_y_metros": round((cy_pct / 100.0) * 68.0, 1),
        "altura_bloco": altura,
        "ocupacao_tercos": tercos,
        "ocupacao_corredores": corredores,
        "amostras_calor": tot,
        "total_chutes_mapeados": len(shotmap),
        "fonte": f"FotMob • Rastreamento Real 2026 ({tot} toques reais)",
    }

    traits = payload.get("traits") or {}

    return {
        "atleta_id_canonico": row_meta["atleta_id_canonico"],
        "fotmob_id": row_meta["fotmob_id"],
        "nome": row_meta["nome"],
        "nome_norm": _norm_name(row_meta["nome"]),
        "clube_id_canonico": row_meta["clube_id_canonico"],
        "clube_nome": row_meta["clube_nome"],
        "posicao_primaria": pos_label,
        "heatmap_json": json.dumps(heatmap_out, separators=(",", ":")),
        "shotmap_json": json.dumps(shotmap, separators=(",", ":")),
        "telemetria_json": json.dumps(telemetria, separators=(",", ":")),
        "traits_json": json.dumps(traits, separators=(",", ":")),
        "amostras_brutas": tot,
        "total_chutes": len(shotmap),
    }


def coletar_tudo(canon_db, spatial_db, max_players=None, max_matches=None):
    c_ro = sqlite3.connect(f"file:{canon_db}?mode=ro", uri=True, timeout=15)
    c_ro.row_factory = sqlite3.Row

    clubs = [
        dict(r)
        for r in c_ro.execute(
            """
            SELECT m.clube_id_canonico, m.fotmob_id,
                   COALESCE(dc.nome_exibicao, dc.nome, 'Clube #' || m.clube_id_canonico) AS nome,
                   COALESCE(dc.sigla, '') AS sigla
            FROM metrica_clube_avancada_2026 m
            LEFT JOIN dim_clube dc ON m.clube_id_canonico = dc.clube_id
            WHERE m.fotmob_id IS NOT NULL
            ORDER BY m.xpts DESC
            """
        ).fetchall()
    ]

    players = [
        dict(r)
        for r in c_ro.execute(
            """
            SELECT m.atleta_id_canonico, m.fotmob_id,
                   COALESCE(j.nome_exibicao, j.apelido, j.nome_completo, 'Atleta #' || m.atleta_id_canonico) AS nome,
                   m.clube_id_canonico,
                   COALESCE(dc.nome_exibicao, dc.nome, '') AS clube_nome,
                   j.posicao,
                   m.minutos
            FROM metrica_atleta_avancada_2026 m
            LEFT JOIN jogadores j ON m.atleta_id_canonico = j.id_jogador
            LEFT JOIN dim_clube dc ON m.clube_id_canonico = dc.clube_id
            WHERE m.fotmob_id IS NOT NULL AND COALESCE(m.minutos, 0) > 0
            ORDER BY m.minutos DESC
            """
        ).fetchall()
    ]
    c_ro.close()

    if max_players:
        players = players[:max_players]

    print(f"[Coletor] Clubes: {len(clubs)} | Atletas elegíveis: {len(players)}")

    # 1. Descobrir partidas da Série A 2026 dos 20 clubes
    club_by_fotmob = {int(cl["fotmob_id"]): cl for cl in clubs}
    match_ids_map = {}

    def _fetch_club_fixtures(cl):
        data = _fetch_json(f"https://www.fotmob.com/api/data/teams?id={cl['fotmob_id']}")
        out = []
        if not data:
            return out
        fixtures = (data.get("fixtures") or {}).get("allFixtures", {}).get("fixtures", [])
        for fx in fixtures:
            st = fx.get("status") or {}
            trn = fx.get("tournament") or {}
            if st.get("finished") and trn.get("leagueId") == SERIE_A_LEAGUE_ID:
                out.append((int(fx["id"]), st.get("utcTime") or "", fx))
        return out

    with ThreadPoolExecutor(max_workers=6) as ex:
        futs = [ex.submit(_fetch_club_fixtures, cl) for cl in clubs]
        for f in as_completed(futs):
            for mid, utc_time, fx in f.result():
                match_ids_map[mid] = (utc_time, fx)

    sorted_mids = sorted(match_ids_map.keys(), key=lambda m: match_ids_map[m][0])
    if max_matches:
        sorted_mids = sorted_mids[-max_matches:]

    print(f"[Coletor] Partidas Série A 2026 encontradas: {len(sorted_mids)}")

    # 2. Buscar matchDetails de todas as partidas únicas
    club_games = defaultdict(list)

    def _fetch_match(mid):
        md = _fetch_json(f"https://www.fotmob.com/api/data/matchDetails?matchId={mid}")
        return mid, md

    with ThreadPoolExecutor(max_workers=6) as ex:
        futs = {ex.submit(_fetch_match, mid): mid for mid in sorted_mids}
        done_cnt = 0
        for f in as_completed(futs):
            mid, md = f.result()
            done_cnt += 1
            if done_cnt % 50 == 0:
                print(f"  -> Partidas processadas: {done_cnt}/{len(sorted_mids)}")
            if not md:
                continue

            general = md.get("general") or {}
            content = md.get("content") or {}
            lineup = content.get("lineup") or {}
            att_zones = content.get("attackingZones") or {}
            shots = (content.get("shotmap") or {}).get("shots") or []
            utc_time = general.get("matchTimeUTCDate") or match_ids_map[mid][0]
            round_name = general.get("matchRound") or ""

            for side_key, opp_key, az_key, is_home in [
                ("homeTeam", "awayTeam", "home", True),
                ("awayTeam", "homeTeam", "away", False),
            ]:
                team_lu = lineup.get(side_key) or {}
                opp_lu = lineup.get(opp_key) or {}
                tid = team_lu.get("id")
                if not tid or int(tid) not in club_by_fotmob:
                    continue

                tid = int(tid)
                formation = (team_lu.get("formation") or "").strip()
                starters = team_lu.get("starters") or []
                xi = []
                for st in starters:
                    hl = st.get("horizontalLayout") or {}
                    if hl.get("x") is not None and hl.get("y") is not None:
                        xi.append(
                            {
                                "id": st.get("id"),
                                "nome": st.get("name"),
                                "camisa": st.get("shirtNumber"),
                                "posId": st.get("positionId"),
                                "x": round(float(hl["x"]) * 100.0, 1),
                                "y": round(float(hl["y"]) * 100.0, 1),
                                "nota": (st.get("performance") or {}).get("rating"),
                            }
                        )

                az_side = att_zones.get(az_key) or {}
                team_shots = [s for s in shots if s.get("teamId") and int(s["teamId"]) == tid]
                fx_info = match_ids_map[mid][1]
                placar = (fx_info.get("status") or {}).get("scoreStr") or ""

                club_games[tid].append(
                    {
                        "match_id": mid,
                        "utc": utc_time,
                        "rodada": round_name,
                        "casa": is_home,
                        "adversario": opp_lu.get("name") or "Adversário",
                        "placar": placar,
                        "esquema": formation or "—",
                        "coach": (team_lu.get("coach") or {}).get("name"),
                        "xi": xi,
                        "az": az_side,
                        "shots": team_shots,
                    }
                )

    now_iso = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S")
    s_conn = init_spatial_db(spatial_db)

    # 3. Consolidar tendências táticas dos 20 clubes
    for cl in clubs:
        fid = int(cl["fotmob_id"])
        games = sorted(club_games.get(fid, []), key=lambda g: g["utc"])
        valid_forms = [g["esquema"] for g in games if g["esquema"] and g["esquema"] != "—"]
        form_counter = Counter(valid_forms)
        total_f = max(len(valid_forms), 1)
        esquemas_list = [
            {"esquema": esq, "jogos": cnt, "pct": round((cnt / total_f) * 100.0, 1)}
            for esq, cnt in form_counter.most_common()
        ]
        esq_principal = esquemas_list[0]["esquema"] if esquemas_list else "—"

        recent_forms = [g["esquema"] for g in games[-5:] if g["esquema"] and g["esquema"] != "—"]
        esq_rec_5 = Counter(recent_forms).most_common(1)[0][0] if recent_forms else esq_principal

        # Último XI completo no esquema principal (representação tática real da equipe)
        xi_medio = []
        for g in reversed(games):
            if g["esquema"] == esq_principal and len(g["xi"]) == 11:
                xi_medio = g["xi"]
                break
        if not xi_medio:
            for g in reversed(games):
                if len(g["xi"]) == 11:
                    xi_medio = g["xi"]
                    break

        # Agregar attacking zones (total, firstHalf, secondHalf)
        az_agg = {}
        for period in ("total", "firstHalf", "secondHalf"):
            vals_l, vals_c, vals_r = [], [], []
            for g in games:
                p_obj = (g.get("az") or {}).get(period)
                if isinstance(p_obj, dict) and p_obj.get("left") is not None:
                    vals_l.append(float(p_obj.get("left", 0)))
                    vals_c.append(float(p_obj.get("center", 0)))
                    vals_r.append(float(p_obj.get("right", 0)))
            if vals_l:
                az_agg[period] = {
                    "left": round(sum(vals_l) / len(vals_l), 1),
                    "center": round(sum(vals_c) / len(vals_c), 1),
                    "right": round(sum(vals_r) / len(vals_r), 1),
                }

        # Perfil real de finalizações coletivas
        all_sh = [s for g in games for s in g.get("shots", [])]
        n_sh = len(all_sh)
        if n_sh > 0:
            in_box = sum(1 for s in all_sh if s.get("isFromInsideBox"))
            reg_play = sum(1 for s in all_sh if s.get("situation") == "RegularPlay")
            set_piece = sum(1 for s in all_sh if s.get("situation") in ("SetPiece", "FromCorner", "FreeKick"))
            fast_br = sum(1 for s in all_sh if s.get("situation") == "FastBreak")
            total_xg_shots = sum(float(s.get("expectedGoals") or 0) for s in all_sh)
            shot_profile = {
                "total": n_sh,
                "xg_total": round(total_xg_shots, 2),
                "xg_por_chute": round(total_xg_shots / n_sh, 3),
                "dentro_area_pct": round((in_box / n_sh) * 100, 1),
                "fora_area_pct": round(((n_sh - in_box) / n_sh) * 100, 1),
                "bola_rolando_pct": round((reg_play / n_sh) * 100, 1),
                "bola_parada_pct": round((set_piece / n_sh) * 100, 1),
                "contra_ataque_pct": round((fast_br / n_sh) * 100, 1),
            }
        else:
            shot_profile = {"total": 0}

        tendencia_recente = [
            {
                "data": (g["utc"] or "")[:10],
                "rodada": g["rodada"],
                "casa": g["casa"],
                "adversario": g["adversario"],
                "placar": g["placar"],
                "esquema": g["esquema"],
                "az_total": (g.get("az") or {}).get("total"),
            }
            for g in games[-12:]
        ]

        s_conn.execute(
            """
            INSERT OR REPLACE INTO club_tactical_trends
            (clube_id_canonico, fotmob_id, clube_nome, clube_sigla, jogos_analisados,
             esquema_principal, esquema_recente_5, esquemas_json, tendencia_esquemas_json,
             xi_medio_json, attacking_zones_json, shot_profile_json, atualizado_em)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                cl["clube_id_canonico"],
                fid,
                cl["nome"],
                cl["sigla"],
                len(games),
                esq_principal,
                esq_rec_5,
                json.dumps(esquemas_list),
                json.dumps(tendencia_recente),
                json.dumps(xi_medio),
                json.dumps(az_agg),
                json.dumps(shot_profile),
                now_iso,
            ),
        )
    s_conn.commit()
    print(f"[Coletor] Tendências táticas salvas para {len(clubs)} clubes.")

    # 4. Coletar heatmaps & shotmaps reais dos atletas
    def _fetch_player(p):
        pd = _fetch_json(f"https://www.fotmob.com/api/data/playerData?id={p['fotmob_id']}")
        return _processar_player_payload(p, pd)

    saved_players = 0
    with ThreadPoolExecutor(max_workers=6) as ex:
        futs = [ex.submit(_fetch_player, p) for p in players]
        for idx, f in enumerate(as_completed(futs), 1):
            rec = f.result()
            if rec:
                s_conn.execute(
                    """
                    INSERT OR REPLACE INTO player_spatial
                    (atleta_id_canonico, fotmob_id, nome, nome_norm, clube_id_canonico,
                     clube_nome, posicao_primaria, heatmap_json, shotmap_json,
                     telemetria_json, traits_json, amostras_brutas, total_chutes, atualizado_em)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    """,
                    (
                        rec["atleta_id_canonico"],
                        rec["fotmob_id"],
                        rec["nome"],
                        rec["nome_norm"],
                        rec["clube_id_canonico"],
                        rec["clube_nome"],
                        rec["posicao_primaria"],
                        rec["heatmap_json"],
                        rec["shotmap_json"],
                        rec["telemetria_json"],
                        rec["traits_json"],
                        rec["amostras_brutas"],
                        rec["total_chutes"],
                        now_iso,
                    ),
                )
                saved_players += 1
            if idx % 100 == 0:
                s_conn.commit()
                print(f"  -> Atletas processados: {idx}/{len(players)} (com heatmap real: {saved_players})")

    s_conn.commit()
    s_conn.close()
    print(f"[Coletor] Concluído! Clubes: {len(clubs)} | Atletas com dados espaciais reais: {saved_players}")


def main():
    parser = argparse.ArgumentParser(description="Coleta dados reais espaciais e táticos (FotMob 2026)")
    parser.add_argument("--canon-db", default=CANON_DB)
    parser.add_argument("--spatial-db", default=DEFAULT_SPATIAL_DB)
    parser.add_argument("--max-players", type=int, default=None)
    parser.add_argument("--max-matches", type=int, default=None)
    args = parser.parse_args()
    coletar_tudo(args.canon_db, args.spatial_db, args.max_players, args.max_matches)


if __name__ == "__main__":
    main()
