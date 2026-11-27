#!/usr/bin/env python3
"""
FutStats - Coletor Automático de Mapas de Calor, Shotmaps, Formações e Quadrantes Táticos
- Autodescobre clubes da temporada atual da Série A via FotMob (leagues?id=268)
- Autodescobre atletas ativos nos elencos (teams?id=... -> squad + core.json + data/futebol.db)
- Atualiza métricas vivas dos quadrantes (PPDA, Field Tilt, Altura Defensiva, xG, xPTS) de brasileiraoemdados.com.br/data/core.json
- Salva tudo isoladamente em /opt/futstats/spatial.db (zero impacto no teto de 84/94 MB de data/futebol.db)
"""

import argparse
import json
import os
import sqlite3
import time
import unicodedata
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
BED_CORE_URL = "https://brasileiraoemdados.com.br/data/core.json"

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


def _fetch_json(url, timeout=14, referer="https://www.fotmob.com/"):
    sess = _get_session()
    headers = {"Referer": referer, "Accept": "application/json"}
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


def _norm_name(text):
    t = unicodedata.normalize("NFKD", (text or "").strip().lower())
    return "".join(ch for ch in t if not unicodedata.combining(ch))


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
        "CREATE UNIQUE INDEX IF NOT EXISTS idx_player_spatial_fotmob ON player_spatial(fotmob_id)"
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
            live_metrics_json TEXT DEFAULT '{}',
            atualizado_em TEXT NOT NULL
        )
        """
    )
    cols = {r[1] for r in conn.execute("PRAGMA table_info(club_tactical_trends)")}
    if "live_metrics_json" not in cols:
        conn.execute("ALTER TABLE club_tactical_trends ADD COLUMN live_metrics_json TEXT DEFAULT '{}'")
    conn.commit()
    return conn


def _traduzir_parte_corpo(shot_type):
    return {"RightFoot": "Pé Direito", "LeftFoot": "Pé Esquerdo", "Header": "Cabeça"}.get(
        shot_type, shot_type or "Pé"
    )


def _traduzir_situacao(sit):
    return {
        "RegularPlay": "Bola Rolando",
        "FastBreak": "Contra-Ataque",
        "SetPiece": "Bola Parada",
        "FromCorner": "Escanteio",
        "FreeKick": "Falta Direta",
        "Penalty": "Pênalti",
    }.get(sit, sit or "Bola Rolando")


def _traduzir_posicao_fotmob(role_key, fallback=""):
    k = (role_key or fallback or "").lower()
    if "keep" in k or k == "gk":
        return "Goleiro"
    if "def" in k or "back" in k:
        return "Defensor"
    if "mid" in k:
        return "Meia"
    if "att" in k or "forw" in k or "strik" in k or "wing" in k:
        return "Atacante"
    return fallback or "Jogador"


def _processar_player_payload(row_meta, payload):
    if not payload or not isinstance(payload, dict):
        return None

    fss = payload.get("firstSeasonStats") or {}
    raw_coords = (fss.get("heatmap") or {}).get("coordinates") or []
    raw_shots = fss.get("shotmap") or []

    pts_all = []
    for pt in raw_coords:
        x = pt.get("x")
        y = pt.get("y")
        if x is None or y is None:
            continue
        x_pct = round(max(0.5, min(99.5, (float(x) / 105.0) * 100.0)), 1)
        y_pct = round(max(0.5, min(99.5, (float(y) / 68.0) * 100.0)), 1)
        pts_all.append({"x": x_pct, "y": y_pct})

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
    pos_label = row_meta.get("posicao") or _traduzir_posicao_fotmob(pos_desc.get("key"), pos_desc.get("label"))

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
        "fonte": f"FotMob • Rastreamento Real ({tot} toques reais)",
    }

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
        "traits_json": json.dumps(payload.get("traits") or {}, separators=(",", ":")),
        "amostras_brutas": tot,
        "total_chutes": len(shotmap),
    }


def _carregar_bed_live():
    """Busca brasileiraoemdados.com.br/data/core.json vivo para atualizar PPDA, Field Tilt, Altura e xG."""
    bed = _fetch_json(BED_CORE_URL, timeout=18, referer="https://brasileiraoemdados.com.br/")
    if not isinstance(bed, dict):
        return {}, []
    teams_by_fm = {}
    for tm in bed.get("teams") or []:
        fm = tm.get("fm")
        if not fm:
            continue
        s = tm.get("s") or {}
        pts = int(round(float(s.get("pts") or 0)))
        teams_by_fm[int(fm)] = {
            "nome_bed": tm.get("name"),
            "sigla_bed": tm.get("short"),
            "jogos": int(round(float(s.get("apps") or s.get("matches") or 0))) or None,
            "pontos": pts,
            "gols_pro": int(round(float(s.get("goals") or 0))),
            "xg": round(float(s.get("xg") or 0.0), 2),
            "xg_contra": round(float(s.get("xg_against") or 0.0), 2),
            "xpts": round(float(s.get("xpts") or 0.0), 2),
            "posse_pct": round(float(s.get("possession") or 0.0), 1),
            "field_tilt_pct": round(float(s.get("field_tilt") or 0.0), 1),
            "ppda": round(float(s.get("ppda") or 0.0), 2),
            "altura_defensiva": round(float(s.get("def_height") or 0.0), 1),
        }
    return teams_by_fm, bed.get("players") or []


def _descobrir_clubes_e_jogadores(canon_db, bed_players):
    c_ro = sqlite3.connect(f"file:{canon_db}?mode=ro", uri=True, timeout=15)
    c_ro.row_factory = sqlite3.Row

    # Mapas canônicos de clubes no SQLite
    db_clubs = c_ro.execute(
        """
        SELECT m.clube_id_canonico, m.fotmob_id,
               COALESCE(dc.nome_exibicao, dc.nome, 'Clube #' || m.clube_id_canonico) AS nome,
               COALESCE(dc.sigla, '') AS sigla
        FROM metrica_clube_avancada_2026 m
        LEFT JOIN dim_clube dc ON m.clube_id_canonico = dc.clube_id
        """
    ).fetchall()
    dim_clubs_by_norm = {
        _norm_name(r["nome_exibicao"] or r["nome"]): int(r["clube_id"])
        for r in c_ro.execute("SELECT clube_id, nome, nome_exibicao FROM dim_clube").fetchall()
        if (r["nome_exibicao"] or r["nome"])
    }
    canon_by_fm_club = {int(r["fotmob_id"]): dict(r) for r in db_clubs if r["fotmob_id"]}

    # Autodescoberta via FotMob Liga Série A (funciona em qualquer temporada, inclusive 2027+)
    clubs_dict = {}
    league_data = _fetch_json(f"https://www.fotmob.com/api/data/leagues?id={SERIE_A_LEAGUE_ID}")
    table_rows = []
    if isinstance(league_data, dict):
        table_rows = ((league_data.get("table") or [{}])[0].get("data") or {}).get("table", {}).get("all", []) or []

    for row in table_rows:
        fid = int(row["id"])
        nome = row.get("shortName") or row.get("name") or f"Clube {fid}"
        known = canon_by_fm_club.get(fid)
        cid = known["clube_id_canonico"] if known else dim_clubs_by_norm.get(_norm_name(nome), 1000000 + fid)
        clubs_dict[fid] = {
            "clube_id_canonico": int(cid),
            "fotmob_id": fid,
            "nome": known["nome"] if known else nome,
            "sigla": (known["sigla"] if known else "") or (nome[:3].upper()),
            "table_meta": {
                "jogos": row.get("played"),
                "vitorias": row.get("wins"),
                "empates": row.get("draws"),
                "derrotas": row.get("losses"),
                "pontos": row.get("pts"),
            },
        }

    # Garantir fallback se leagues?id=268 falhar
    if not clubs_dict:
        for fid, r in canon_by_fm_club.items():
            clubs_dict[fid] = {
                "clube_id_canonico": int(r["clube_id_canonico"]),
                "fotmob_id": fid,
                "nome": r["nome"],
                "sigla": r["sigla"],
                "table_meta": {},
            }

    # Mapas canônicos de atletas no SQLite
    players_by_fm = {}
    for r in c_ro.execute(
        """
        SELECT m.atleta_id_canonico, m.fotmob_id,
               COALESCE(j.nome_exibicao, j.apelido, j.nome_completo, 'Atleta #' || m.atleta_id_canonico) AS nome,
               m.clube_id_canonico,
               COALESCE(dc.nome_exibicao, dc.nome, '') AS clube_nome,
               j.posicao, m.minutos
        FROM metrica_atleta_avancada_2026 m
        LEFT JOIN jogadores j ON m.atleta_id_canonico = j.id_jogador
        LEFT JOIN dim_clube dc ON m.clube_id_canonico = dc.clube_id
        WHERE m.fotmob_id IS NOT NULL
        ORDER BY m.minutos DESC
        """
    ).fetchall():
        players_by_fm[int(r["fotmob_id"])] = dict(r)

    jogadores_by_norm = {}
    for r in c_ro.execute(
        "SELECT id_jogador, COALESCE(nome_exibicao, apelido, nome_completo) AS nome, posicao FROM jogadores WHERE COALESCE(nome_exibicao, apelido, nome_completo) IS NOT NULL"
    ).fetchall():
        jogadores_by_norm[_norm_name(r["nome"])] = (int(r["id_jogador"]), r["nome"], r["posicao"])
    c_ro.close()

    # Mesclar atletas novos descobertos no core.json (brasileiraoemdados)
    for bp in bed_players:
        fm = bp.get("fm")
        if not fm or int(fm) in players_by_fm:
            continue
        fm = int(fm)
        nome_bp = bp.get("name") or f"Atleta {fm}"
        hit = jogadores_by_norm.get(_norm_name(nome_bp))
        aid = hit[0] if hit else (900000000 + fm)
        players_by_fm[fm] = {
            "atleta_id_canonico": aid,
            "fotmob_id": fm,
            "nome": hit[1] if hit else nome_bp,
            "clube_id_canonico": None,
            "clube_nome": "",
            "posicao": (hit[2] if hit else None) or bp.get("pos"),
            "minutos": int((bp.get("s") or {}).get("minutes") or 0),
        }

    return list(clubs_dict.values()), players_by_fm, jogadores_by_norm


def coletar_tudo(canon_db, spatial_db, max_players=None, max_matches=None):
    bed_teams_by_fm, bed_players = _carregar_bed_live()
    print(f"[Coletor] BED core.json ao vivo: {len(bed_teams_by_fm)} clubes, {len(bed_players)} atletas")

    clubs, players_by_fm, jogadores_by_norm = _descobrir_clubes_e_jogadores(canon_db, bed_players)
    print(f"[Coletor] Clubes descobertos (FotMob Liga {SERIE_A_LEAGUE_ID}): {len(clubs)}")

    club_by_fotmob = {int(cl["fotmob_id"]): cl for cl in clubs}
    match_ids_map = {}

    # 1. Buscar partidas e elencos vivos (autodescoberta de reforços!) de todos os 20 clubes
    def _fetch_club_fixtures_and_squad(cl):
        data = _fetch_json(f"https://www.fotmob.com/api/data/teams?id={cl['fotmob_id']}")
        out_fx, out_sq = [], []
        if not data:
            return out_fx, out_sq
        fixtures = (data.get("fixtures") or {}).get("allFixtures", {}).get("fixtures", [])
        for fx in fixtures:
            st = fx.get("status") or {}
            trn = fx.get("tournament") or {}
            if st.get("finished") and trn.get("leagueId") == SERIE_A_LEAGUE_ID:
                out_fx.append((int(fx["id"]), st.get("utcTime") or "", fx))

        for grp in (data.get("squad") or {}).get("squad") or []:
            grp_title = (grp.get("title") or "").lower()
            if "coach" in grp_title:
                continue
            for m in grp.get("members") or []:
                pid = m.get("id")
                pname = m.get("name")
                if not pid or not pname:
                    continue
                role = m.get("role") or {}
                out_sq.append(
                    {
                        "fotmob_id": int(pid),
                        "nome": pname,
                        "clube_id_canonico": cl["clube_id_canonico"],
                        "clube_nome": cl["nome"],
                        "posicao": _traduzir_posicao_fotmob(role.get("key"), role.get("fallback")),
                    }
                )
        return out_fx, out_sq

    squad_discovered = 0
    with ThreadPoolExecutor(max_workers=6) as ex:
        futs = [ex.submit(_fetch_club_fixtures_and_squad, cl) for cl in clubs]
        for f in as_completed(futs):
            fxs, sqs = f.result()
            for mid, utc_time, fx in fxs:
                match_ids_map[mid] = (utc_time, fx)
            for sq in sqs:
                fid = sq["fotmob_id"]
                if fid not in players_by_fm:
                    hit = jogadores_by_norm.get(_norm_name(sq["nome"]))
                    aid = hit[0] if hit else (900000000 + fid)
                    players_by_fm[fid] = {
                        "atleta_id_canonico": aid,
                        "fotmob_id": fid,
                        "nome": hit[1] if hit else sq["nome"],
                        "clube_id_canonico": sq["clube_id_canonico"],
                        "clube_nome": sq["clube_nome"],
                        "posicao": (hit[2] if hit else None) or sq["posicao"],
                        "minutos": 1,
                    }
                    squad_discovered += 1

    players = sorted(
        players_by_fm.values(),
        key=lambda x: int(x.get("minutos") or 0),
        reverse=True,
    )
    if max_players:
        players = players[:max_players]

    sorted_mids = sorted(match_ids_map.keys(), key=lambda m: match_ids_map[m][0])
    if max_matches:
        sorted_mids = sorted_mids[-max_matches:]

    print(
        f"[Coletor] Partidas Série A: {len(sorted_mids)} | Atletas totais mapeados: {len(players)} (novos do elenco vivo: {squad_discovered})"
    )

    # 2. Buscar matchDetails de todas as partidas únicas
    club_games = defaultdict(list)

    def _fetch_match(mid):
        return mid, _fetch_json(f"https://www.fotmob.com/api/data/matchDetails?matchId={mid}")

    with ThreadPoolExecutor(max_workers=6) as ex:
        futs = [ex.submit(_fetch_match, mid) for mid in sorted_mids]
        for done_cnt, f in enumerate(as_completed(futs), 1):
            mid, md = f.result()
            if done_cnt % 60 == 0:
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
                        "xi": xi,
                        "az": att_zones.get(az_key) or {},
                        "shots": [s for s in shots if s.get("teamId") and int(s["teamId"]) == tid],
                    }
                )

    now_iso = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S")
    s_conn = init_spatial_db(spatial_db)

    # 3. Consolidar tendências táticas + métricas vivas para os 20 clubes
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

        live_m = dict(bed_teams_by_fm.get(fid) or {})
        t_meta = cl.get("table_meta") or {}
        if not live_m.get("jogos") and t_meta.get("jogos"):
            live_m["jogos"] = t_meta["jogos"]
        if t_meta.get("pontos") is not None:
            live_m.setdefault("pontos", t_meta["pontos"])

        s_conn.execute(
            """
            INSERT OR REPLACE INTO club_tactical_trends
            (clube_id_canonico, fotmob_id, clube_nome, clube_sigla, jogos_analisados,
             esquema_principal, esquema_recente_5, esquemas_json, tendencia_esquemas_json,
             xi_medio_json, attacking_zones_json, shot_profile_json, live_metrics_json, atualizado_em)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
                json.dumps(live_m),
                now_iso,
            ),
        )
    s_conn.commit()
    print(f"[Coletor] Tendências táticas + métricas vivas salvas para {len(clubs)} clubes.")

    # 4. Coletar heatmaps & shotmaps reais de TODOS os atletas descobertos
    def _fetch_player(p):
        pd = _fetch_json(f"https://www.fotmob.com/api/data/playerData?id={p['fotmob_id']}")
        return _processar_player_payload(p, pd)

    saved_players = 0
    seen_canonical_ids = set()
    with ThreadPoolExecutor(max_workers=6) as ex:
        futs = [ex.submit(_fetch_player, p) for p in players]
        for idx, f in enumerate(as_completed(futs), 1):
            rec = f.result()
            if rec:
                aid = rec["atleta_id_canonico"]
                if aid in seen_canonical_ids:
                    aid = 900000000 + int(rec["fotmob_id"])
                seen_canonical_ids.add(aid)
                s_conn.execute(
                    """
                    INSERT OR REPLACE INTO player_spatial
                    (atleta_id_canonico, fotmob_id, nome, nome_norm, clube_id_canonico,
                     clube_nome, posicao_primaria, heatmap_json, shotmap_json,
                     telemetria_json, traits_json, amostras_brutas, total_chutes, atualizado_em)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    """,
                    (
                        aid,
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
            if idx % 150 == 0:
                s_conn.commit()
                print(f"  -> Atletas processados: {idx}/{len(players)} (com heatmap real: {saved_players})")

    s_conn.commit()
    s_conn.close()
    print(f"[Coletor] Concluído! Clubes: {len(clubs)} | Atletas com heatmap real: {saved_players}")


def main():
    parser = argparse.ArgumentParser(description="Coleta dados reais espaciais e táticos (FotMob + BED)")
    parser.add_argument("--canon-db", default=CANON_DB)
    parser.add_argument("--spatial-db", default=DEFAULT_SPATIAL_DB)
    parser.add_argument("--max-players", type=int, default=None)
    parser.add_argument("--max-matches", type=int, default=None)
    args = parser.parse_args()
    coletar_tudo(args.canon_db, args.spatial_db, args.max_players, args.max_matches)


if __name__ == "__main__":
    main()
