#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
sync_jogos_recentes_espn.py
Sincronização autônoma e determinística de jogos encerrados recentes via API ESPN
para o FutStats (VM Oracle 24/7 -> SQLite -> Git/Vercel com guardrails de integridade).
"""
from __future__ import annotations

import argparse
import json
import os
import sqlite3
import subprocess
import sys
import urllib.request
from datetime import datetime, timedelta, timezone

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DB_PATH = os.path.join(BASE_DIR, "data", "futebol.db")
BRT = timezone(timedelta(hours=-3))

SOFT_LIMIT_MB = 84.0
HARD_PUSH_LIMIT_MB = 90.0  # Margem de segurança abaixo do teto oficial de 94 MB da Vercel

COMPETICOES = [
    ("bra.1", "Campeonato Brasileiro - Série A"),
    ("bra.2", "Campeonato Brasileiro - Série B"),
    ("bra.copa_do_brasil", "Copa do Brasil"),
    ("conmebol.libertadores", "Copa Libertadores"),
    ("conmebol.sudamericana", "Copa Sul-Americana"),
]

NAME_MAP = {
    "Vasco da Gama": "Vasco",
    "Red Bull Bragantino": "Bragantino",
    "Athletico Paranaense": "Athletico-PR",
    "Atletico-MG": "Atlético-MG",
    "Atlético Mineiro": "Atlético-MG",
    "Botafogo (RJ)": "Botafogo",
    "Sport Recife": "Sport",
    "America-MG": "América-MG",
    "América Mineiro": "América-MG",
    "Atletico-GO": "Atlético-GO",
    "Atlético Goianiense": "Atlético-GO",
    "Ceará SC": "Ceará",
    "Fortaleza EC": "Fortaleza",
    "EC Bahia": "Bahia",
    "EC Vitória": "Vitória",
}


def norm_name(name: str) -> str:
    return NAME_MAP.get(name, name).strip()


def fetch_espn_day(slug: str, date_yyyymmdd: str) -> list[dict]:
    url = f"https://site.api.espn.com/apis/site/v2/sports/soccer/{slug}/scoreboard?dates={date_yyyymmdd}"
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    try:
        with urllib.request.urlopen(req, timeout=12) as resp:
            payload = json.loads(resp.read().decode("utf-8"))
            return payload.get("events", [])
    except Exception:
        return []


def sync_recent_matches(days: int = 3, db_path: str = DB_PATH) -> tuple[int, int]:
    now_brt = datetime.now(BRT)
    dates_to_check = [
        (now_brt - timedelta(days=offset)).strftime("%Y%m%d")
        for offset in range(days, -1, -1)
    ]

    conn = sqlite3.connect(db_path, timeout=30.0)
    conn.execute("PRAGMA busy_timeout = 30000;")
    c = conn.cursor()

    inserted = 0
    updated = 0

    for slug, camp_nome in COMPETICOES:
        for d_str in dates_to_check:
            events = fetch_espn_day(slug, d_str)
            for ev in events:
                comps = ev.get("competitions") or []
                if not comps:
                    continue
                comp = comps[0]
                status_name = ((comp.get("status") or {}).get("type") or {}).get("name", "")
                if status_name != "STATUS_FULL_TIME":
                    continue

                dt_utc = datetime.fromisoformat(ev["date"].replace("Z", "+00:00"))
                dt_brt = dt_utc.astimezone(BRT)
                data_iso = dt_brt.strftime("%Y-%m-%d")
                horario = dt_brt.strftime("%H:%M")
                ano = dt_brt.year

                teams = {t["homeAway"]: t for t in comp.get("competitors", []) if "homeAway" in t}
                if "home" not in teams or "away" not in teams:
                    continue

                h, a = teams["home"], teams["away"]
                mandante = norm_name(h["team"]["displayName"])
                visitante = norm_name(a["team"]["displayName"])
                try:
                    gm = int(h.get("score", 0))
                    gv = int(a.get("score", 0))
                except (ValueError, TypeError):
                    continue

                placar = f"{gm} x {gv}"
                vencedor = mandante if gm > gv else (visitante if gv > gm else "Empate")
                estadio = (comp.get("venue") or {}).get("fullName", "")

                existing = c.execute(
                    "SELECT id_partida, placar, gols_mandante, gols_visitante FROM partidas WHERE data = ? AND mandante = ? AND visitante = ?",
                    (data_iso, mandante, visitante),
                ).fetchone()

                if existing:
                    if existing[1] != placar or existing[2] != gm or existing[3] != gv:
                        c.execute(
                            """
                            UPDATE partidas
                            SET gols_mandante = ?, gols_visitante = ?, placar = ?, vencedor = ?,
                                estadio = COALESCE(NULLIF(estadio, ''), ?)
                            WHERE id_partida = ?
                            """,
                            (gm, gv, placar, vencedor, estadio, existing[0]),
                        )
                        updated += 1
                        print(f"[UPD] {data_iso} [{camp_nome}] {mandante} {placar} {visitante}")
                else:
                    c.execute(
                        """
                        INSERT INTO partidas (
                            ano, data, horario, estadio, mandante, visitante,
                            gols_mandante, gols_visitante, placar, vencedor, campeonato
                        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                        """,
                        (ano, data_iso, horario, estadio, mandante, visitante, gm, gv, placar, vencedor, camp_nome),
                    )
                    inserted += 1
                    print(f"[ADD] {data_iso} [{camp_nome}] {mandante} {placar} {visitante}")

    conn.commit()
    conn.close()
    return inserted, updated


def run_post_checks_and_vacuum(db_path: str = DB_PATH) -> tuple[bool, float]:
    py = sys.executable
    # 1. Auditoria relacional (12 regras)
    subprocess.run([py, os.path.join(BASE_DIR, "scripts", "auditar_integridade_dados.py")], check=False)
    # 2. Reconciliação Golden Truth (craques)
    golden_script = os.path.join(BASE_DIR, "scripts", "reconciliar_golden_truth.py")
    if os.path.exists(golden_script):
        subprocess.run([py, golden_script], check=False)

    # 3. Integridade física + compactação se >= soft limit
    conn = sqlite3.connect(db_path, timeout=30.0)
    conn.execute("PRAGMA busy_timeout = 30000;")
    integrity = conn.execute("PRAGMA integrity_check;").fetchone()[0]
    size_mb = os.path.getsize(db_path) / (1024 * 1024)
    if size_mb >= SOFT_LIMIT_MB:
        try:
            conn.execute("PRAGMA wal_checkpoint(TRUNCATE);")
            conn.execute("VACUUM;")
        except sqlite3.OperationalError:
            pass
    conn.close()

    final_mb = round(os.path.getsize(db_path) / (1024 * 1024), 2)
    return (str(integrity).lower() == "ok"), final_mb


def git_auto_push_if_changed(size_mb: float) -> bool:
    if size_mb >= HARD_PUSH_LIMIT_MB:
        print(f"[GUARDRAIL] Push abortado: futebol.db ({size_mb:.2f} MB) >= limite seguro ({HARD_PUSH_LIMIT_MB} MB).")
        return False

    diff = subprocess.run(["git", "diff", "--quiet", "data/futebol.db"], cwd=BASE_DIR)
    if diff.returncode == 0:
        print("[GIT] Nenhuma alteração em data/futebol.db; push dispensado.")
        return False

    ts = datetime.now(BRT).strftime("%Y-%m-%d %H:%M BRT")
    cmds = [
        ["git", "add", "data/futebol.db"],
        ["git", "commit", "-m", f"chore(vm): sync automatico jogos recentes ({ts})"],
        ["git", "pull", "--rebase", "--autostash", "origin", "main"],
        ["git", "push", "origin", "main"],
    ]
    for cmd in cmds:
        res = subprocess.run(cmd, cwd=BASE_DIR, capture_output=True, text=True)
        if res.returncode != 0:
            print(f"[GIT ERRO] {' '.join(cmd)} -> {res.stderr.strip()}")
            return False
    print("[GIT OK] data/futebol.db sincronizado com origin/main (deploy Vercel acionado).")
    return True


def main() -> int:
    parser = argparse.ArgumentParser(description="Sync diário automático de jogos encerrados via ESPN API.")
    parser.add_argument("--days", type=int, default=3, help="Janela de dias para trás (padrão: 3)")
    parser.add_argument("--push", action="store_true", help="Faz commit e push para origin/main se houver jogos novos")
    args = parser.parse_args()

    print(f"=== Sync Jogos Recentes ESPN ({datetime.now(BRT).strftime('%Y-%m-%d %H:%M BRT')}) ===")
    inserted, updated = sync_recent_matches(days=args.days)
    print(f"Resultado ingestão: +{inserted} inseridos, {updated} atualizados.")

    ok, size_mb = run_post_checks_and_vacuum()
    print(f"Integridade SQLite: {'OK' if ok else 'FALHA'} | Tamanho: {size_mb:.2f} MB")

    if not ok:
        print("[ERRO] Integridade física falhou; abortando push.")
        return 1

    if args.push and (inserted > 0 or updated > 0):
        git_auto_push_if_changed(size_mb)
    elif args.push:
        print("[INFO] Nenhum jogo novo/atualizado neste ciclo; push não necessário.")

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
