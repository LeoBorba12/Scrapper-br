# -*- coding: utf-8 -*-
"""
Sprint 1 — Cálculo de Pi-Ratings Dinâmicos (Constantinou & Fenton) + Volatilidade (estilo Glicko-2)
Percorre partidas cronologicamente no futebol.db e grava a tabela compacta `clube_pi_ratings` (< 30 KB).
"""
import datetime
import math
import os
import sqlite3

DB_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data", "futebol.db")

CANON_MAP = {
    "red bull bragantino": "Bragantino",
    "athletico": "Athletico-PR",
    "athletico paranaense": "Athletico-PR",
    "atlético goianiense": "Atlético-GO",
    "américa mineiro": "América-MG",
    "botafogo sp": "Botafogo-SP",
    "operário": "Operário-PR",
    "operário ferroviário": "Operário-PR",
}


def canon(nome: str) -> str:
    n = (nome or "").strip()
    return CANON_MAP.get(n.lower(), n)


def main(ano_inicio: int = 2018, lam: float = 0.035, gamma: float = 0.70, c_scale: float = 3.0):
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cur = conn.cursor()

    rows = cur.execute(
        """
        SELECT data, mandante, visitante, gols_mandante, gols_visitante
        FROM partidas
        WHERE ano >= ?
          AND gols_mandante IS NOT NULL
          AND gols_visitante IS NOT NULL
          AND (campeonato LIKE '%Brasileir%' OR campeonato LIKE '%Copa do Brasil%' OR campeonato LIKE '%Libertadores%')
        ORDER BY data ASC, id_partida ASC;
        """,
        (ano_inicio,),
    ).fetchall()

    # Estado: {clube: [r_home, r_away, jogos, soma_erros_quad, ultima_data]}
    state = {}

    def get_st(team):
        if team not in state:
            state[team] = [0.0, 0.0, 0, 0.0, None]
        return state[team]

    def psi(err: float) -> float:
        return c_scale * math.log10(1.0 + abs(err)) * (1.0 if err >= 0 else -1.0)

    for r in rows:
        h = canon(r["mandante"])
        a = canon(r["visitante"])
        if not h or not a or h == a:
            continue
        sh = get_st(h)
        sa = get_st(a)

        # Expectativa de saldo de gols (Constantinou & Fenton)
        exp_h = (10.0 ** (abs(sh[0]) / c_scale) - 1.0) * (1.0 if sh[0] >= 0 else -1.0)
        exp_a = (10.0 ** (abs(sa[1]) / c_scale) - 1.0) * (1.0 if sa[1] >= 0 else -1.0)
        exp_diff = exp_h - exp_a

        obs_diff = float(r["gols_mandante"] - r["gols_visitante"])
        err = obs_diff - exp_diff
        adj = psi(err)

        # Atualização acoplada Casa/Fora
        sh[0] += lam * adj
        sh[1] += lam * gamma * adj
        sa[1] -= lam * adj
        sa[0] -= lam * gamma * adj

        sh[2] += 1
        sa[2] += 1
        sh[3] += err * err
        sa[3] += err * err
        sh[4] = r["data"]
        sa[4] = r["data"]

    cur.execute("DROP TABLE IF EXISTS clube_pi_ratings;")
    cur.execute(
        """
        CREATE TABLE clube_pi_ratings (
            clube TEXT PRIMARY KEY,
            pi_home REAL NOT NULL,
            pi_away REAL NOT NULL,
            pi_geral REAL NOT NULL,
            incerteza_rd REAL NOT NULL,
            jogos_base INTEGER NOT NULL,
            ultima_data TEXT,
            atualizado_em TEXT NOT NULL
        );
        """
    )

    agora = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    salvos = 0
    for team, st in state.items():
        if st[2] < 10:
            continue
        pi_h, pi_a, jogos, sum_sq, ult = st
        pi_g = (pi_h + pi_a) / 2.0
        rmse = math.sqrt(sum_sq / max(jogos, 1))
        # Incerteza estilo Glicko-2 (RD): maior se poucos jogos ou alta volatilidade recente
        rd = round(min(2.5, max(0.35, rmse * (1.0 + 12.0 / max(jogos, 1)) * 0.45)), 3)
        cur.execute(
            """
            INSERT INTO clube_pi_ratings (
                clube, pi_home, pi_away, pi_geral, incerteza_rd, jogos_base, ultima_data, atualizado_em
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (team, round(pi_h, 4), round(pi_a, 4), round(pi_g, 4), rd, jogos, ult, agora),
        )
        salvos += 1

    conn.commit()
    cur.execute("PRAGMA journal_mode = DELETE;")
    conn.close()
    print(f"Pi-Ratings calculados: partidas={len(rows)}, clubes_salvos={salvos}")


if __name__ == "__main__":
    main()
