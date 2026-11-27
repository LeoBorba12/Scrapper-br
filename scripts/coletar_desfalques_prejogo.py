# -*- coding: utf-8 -*-
"""
Camada 2 — Coletor Pré-Jogo de Lesões, Suspensões e Dúvidas (Série A Brasil)
Fonte principal: API pública oficial do Cartola FC / GloboEsporte
(`https://api.cartola.globo.com/atletas/mercado`), com status reais de
Departamento Médico (Contundido), Suspenso e Dúvida para os 20 clubes da Série A.
Grava na tabela compacta `desfalques_prejogo_atual` em `data/futebol.db` (zero dados fictícios).
"""
import datetime
import json
import os
import sqlite3
import unicodedata
import urllib.request

DB_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data", "futebol.db")
CARTOLA_MERCADO_URL = "https://api.cartola.globo.com/atletas/mercado"

CARTOLA_ABREV_CLUBE = {
    "FLA": "Flamengo",
    "PAL": "Palmeiras",
    "BOT": "Botafogo",
    "SAO": "São Paulo",
    "COR": "Corinthians",
    "SAN": "Santos",
    "RBB": "Red Bull Bragantino",
    "CAM": "Atlético-MG",
    "CRU": "Cruzeiro",
    "FLU": "Fluminense",
    "VAS": "Vasco",
    "BAH": "Bahia",
    "GRE": "Grêmio",
    "INT": "Internacional",
    "VIT": "Vitória",
    "MIR": "Mirassol",
    "CAP": "Athletico-PR",
    "CFC": "Coritiba",
    "CHA": "Chapecoense",
    "REM": "Remo",
    "FOR": "Fortaleza",
    "CEA": "Ceará",
    "JUV": "Juventude",
    "SPT": "Sport",
}

STATUS_CARTOLA = {
    5: ("Contundido", "Departamento Médico (Cartola/GE)"),
    3: ("Suspenso", "Suspenso na rodada (Cartola/GE)"),
    2: ("Dúvida", "Dúvida pré-jogo (Cartola/GE)"),
}


def _norm(txt: str) -> str:
    s = unicodedata.normalize("NFKD", (txt or "").strip().lower())
    return "".join(ch for ch in s if not unicodedata.combining(ch))


def _fetch_json(url: str, timeout: int = 10):
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 (FutStats/2026)"})
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

    # Mapa rápido de atletas conhecidos (por clube+nome e global) para reconciliar id_jogador
    atletas_por_clube = {}
    atletas_global = {}
    rows_jog = cur.execute(
        """
        SELECT id_jogador, nome_exibicao, nome_completo, apelido, clubes
        FROM jogadores_estatisticas
        WHERE nome_exibicao IS NOT NULL OR apelido IS NOT NULL
        """
    ).fetchall()
    for r in rows_jog:
        jid = int(r["id_jogador"])
        clubes_str = _norm(r["clubes"] or "")
        nomes = [
            _norm(r["nome_exibicao"] or ""),
            _norm(r["apelido"] or ""),
            _norm(r["nome_completo"] or ""),
        ]
        for nm in nomes:
            if not nm:
                continue
            atletas_global[nm] = jid
            for clb_canon in set(CARTOLA_ABREV_CLUBE.values()):
                n_clb = _norm(clb_canon)
                if n_clb in clubes_str:
                    atletas_por_clube[(n_clb, nm)] = jid

    agora = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    inseridos = 0
    reconciliados = 0
    por_status = {"Contundido": 0, "Suspenso": 0, "Dúvida": 0}

    try:
        data = _fetch_json(CARTOLA_MERCADO_URL)
        clubes_map = data.get("clubes", {})
        atletas = data.get("atletas", [])

        cur.execute("DELETE FROM desfalques_prejogo_atual WHERE fonte IN ('Cartola/GE', 'ESPN');")

        for a in atletas:
            sid = a.get("status_id")
            if sid not in STATUS_CARTOLA:
                continue
            status_lbl, motivo_lbl = STATUS_CARTOLA[sid]
            cid = str(a.get("clube_id", ""))
            abrev = (clubes_map.get(cid, {}).get("abreviacao") or "").upper()
            clube = CARTOLA_ABREV_CLUBE.get(abrev)
            if not clube:
                continue

            apelido = (a.get("apelido") or a.get("nome") or "").strip()
            nome_completo = (a.get("nome") or apelido).strip()
            if not apelido:
                continue

            n_clube = _norm(clube)
            n_apelido = _norm(apelido)
            n_nome = _norm(nome_completo)

            jid = (
                atletas_por_clube.get((n_clube, n_apelido))
                or atletas_por_clube.get((n_clube, n_nome))
                or atletas_global.get(n_apelido)
                or atletas_global.get(n_nome)
            )
            if jid is not None:
                reconciliados += 1

            cur.execute(
                """
                INSERT OR REPLACE INTO desfalques_prejogo_atual
                (clube, id_jogador, atleta, motivo, status, fonte, atualizado_em)
                VALUES (?, ?, ?, ?, ?, 'Cartola/GE', ?)
                """,
                (clube, jid, apelido, motivo_lbl, status_lbl, agora),
            )
            inseridos += 1
            por_status[status_lbl] = por_status.get(status_lbl, 0) + 1
    except Exception as e:
        print(f"[AVISO] Coleta Cartola/GE indisponível neste ciclo: {e}")

    conn.commit()
    cur.execute("PRAGMA journal_mode = DELETE;")
    conn.close()
    print(
        f"Coleta pré-jogo concluída (Cartola/GE): total={inseridos} "
        f"(DM={por_status['Contundido']}, Susp={por_status['Suspenso']}, Duvida={por_status['Dúvida']}), "
        f"reconciliados_id={reconciliados}"
    )


if __name__ == "__main__":
    main()
