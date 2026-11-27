# -*- coding: utf-8 -*-
"""
Camada 2 — Coletor Pré-Jogo de Lesões / Dúvidas (Série A Brasil)
Consulta endpoints públicos da ESPN para desfalques médicos e grava na tabela
compacta `desfalques_prejogo_atual` em `data/futebol.db` (zero dados fictícios).
"""
import datetime
import json
import os
import sqlite3
import urllib.request

DB_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data", "futebol.db")
ESPN_TEAMS_URL = "https://site.api.espn.com/apis/site/v2/sports/soccer/bra.1/teams"


def _fetch_json(url: str, timeout: int = 8):
    req = urllib.request.Request(url, headers={"User-Agent": "FutStatsBot/2026"})
    with urllib.request.urlopen(req, timeout=timeout) as resp:
        return json.loads(resp.read().decode("utf-8"))


def main():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cur = conn.cursor()

    cur.execute(
        """
        CREATE TABLE IF NOT EXISTS desfalques_prejogo_atual (
            clube TEXT NOT NULL,
            id_jogador INTEGER,
            atleta TEXT NOT NULL,
            motivo TEXT NOT NULL,
            status TEXT NOT NULL,
            fonte TEXT NOT NULL,
            atualizado_em TEXT NOT NULL,
            PRIMARY KEY (clube, atleta)
        );
        """
    )

    # Mapa rápido de atletas conhecidos para reconciliar id_jogador
    atletas_map = {}
    for r in cur.execute("SELECT id_jogador, nome_exibicao FROM jogadores_estatisticas WHERE nome_exibicao IS NOT NULL").fetchall():
        atletas_map[r["nome_exibicao"].strip().lower()] = int(r["id_jogador"])

    agora = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    inseridos = 0
    try:
        data = _fetch_json(ESPN_TEAMS_URL)
        leagues = data.get("sports", [{}])[0].get("leagues", [{}])
        teams = leagues[0].get("teams", []) if leagues else []

        # Limpa registros antigos antes de inserir snapshot atual
        cur.execute("DELETE FROM desfalques_prejogo_atual WHERE fonte = 'ESPN';")

        for item in teams:
            t = item.get("team", {})
            tid = t.get("id")
            tnome = (t.get("shortDisplayName") or t.get("displayName") or "").strip()
            if not tid or not tnome:
                continue
            try:
                det = _fetch_json(f"{ESPN_TEAMS_URL}/{tid}?enable=roster,injuries", timeout=6)
                injuries = det.get("team", {}).get("injuries") or []
                for inj in injuries:
                    ath = inj.get("athlete", {})
                    anome = (ath.get("displayName") or ath.get("shortName") or "").strip()
                    if not anome:
                        continue
                    status = (inj.get("status") or "Dúvida").strip()
                    motivo = (inj.get("shortComment") or inj.get("type") or "Departamento Médico").strip()[:120]
                    jid = atletas_map.get(anome.lower())
                    cur.execute(
                        """
                        INSERT OR REPLACE INTO desfalques_prejogo_atual
                        (clube, id_jogador, atleta, motivo, status, fonte, atualizado_em)
                        VALUES (?, ?, ?, ?, ?, 'ESPN', ?)
                        """,
                        (tnome, jid, anome, motivo, status, agora),
                    )
                    inseridos += 1
            except Exception:
                continue
    except Exception as e:
        print(f"[AVISO] Coleta ESPN indisponível neste ciclo: {e}")

    conn.commit()
    cur.execute("PRAGMA journal_mode = DELETE;")
    conn.close()
    print(f"Coleta pré-jogo concluída: desfalques_medicos={inseridos}")


if __name__ == "__main__":
    main()
