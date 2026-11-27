# -*- coding: utf-8 -*-
"""
Sprint 1 — Backtesting Walk-Forward (Out-of-Sample 2024–2025)
Compara Baseline (Poisson/Dixon-Coles por média simples) vs Oráculo Híbrido (Pi-Ratings + Rest Advantage + Dixon-Coles)
usando RPS (Ranked Probability Score), Log-Loss e Brier Score.
Grava o resumo na tabela `oraculo_backtest_metrics` (< 2 KB).
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
}


def canon(n: str) -> str:
    s = (n or "").strip()
    return CANON_MAP.get(s.lower(), s)


def dixon_coles_probs(lh: float, la: float, rho: float = -0.06):
    lh = max(0.35, min(3.8, lh))
    la = max(0.30, min(3.5, la))
    ph = pe = pa = 0.0
    eh = math.exp(-lh)
    ea = math.exp(-la)
    fact = [1, 1, 2, 6, 24, 120, 720, 5040]
    for i in range(8):
        pi = eh * (lh ** i) / fact[i]
        for j in range(8):
            pj = ea * (la ** j) / fact[j]
            tau = 1.0
            if i == 0 and j == 0:
                tau = max(0.1, 1.0 - lh * la * rho)
            elif i == 0 and j == 1:
                tau = max(0.1, 1.0 + lh * rho)
            elif i == 1 and j == 0:
                tau = max(0.1, 1.0 + la * rho)
            elif i == 1 and j == 1:
                tau = max(0.1, 1.0 - rho)
            p = pi * pj * tau
            if i > j:
                ph += p
            elif i == j:
                pe += p
            else:
                pa += p
    tot = ph + pe + pa or 1.0
    return ph / tot, pe / tot, pa / tot


def rps_score(ph: float, pe: float, pa: float, outcome: int) -> float:
    # outcome: 0=Home, 1=Draw, 2=Away
    o0 = 1.0 if outcome == 0 else 0.0
    o1 = 1.0 if outcome <= 1 else 0.0
    c0 = ph
    c1 = ph + pe
    return 0.5 * ((c0 - o0) ** 2 + (c1 - o1) ** 2)


def log_loss(ph: float, pe: float, pa: float, outcome: int) -> float:
    p = [ph, pe, pa][outcome]
    return -math.log(max(1e-6, min(1.0, p)))


def brier_score(ph: float, pe: float, pa: float, outcome: int) -> float:
    y = [1.0 if outcome == k else 0.0 for k in range(3)]
    return sum((p - yk) ** 2 for p, yk in zip((ph, pe, pa), y))


def main():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cur = conn.cursor()

    rows = cur.execute(
        """
        SELECT ano, data, mandante, visitante, gols_mandante, gols_visitante
        FROM partidas
        WHERE ano >= 2021 AND ano <= 2025
          AND campeonato LIKE '%Série A%'
          AND gols_mandante IS NOT NULL
          AND gols_visitante IS NOT NULL
        ORDER BY data ASC, id_partida ASC;
        """
    ).fetchall()

    # Estado walk-forward (estritamente causal: prevê ANTES de atualizar com o jogo!)
    pi = {}          # clube -> [r_h, r_a]
    goals_hist = {}  # clube -> [gp_h, gc_h, j_h, gp_a, gc_a, j_a]
    last_date = {}   # clube -> date

    lam, gamma, c_scale = 0.035, 0.70, 3.0

    def psi(err):
        return c_scale * math.log10(1.0 + abs(err)) * (1.0 if err >= 0 else -1.0)

    m_base = {"rps": 0.0, "ll": 0.0, "brier": 0.0, "n": 0}
    m_hyb = {"rps": 0.0, "ll": 0.0, "brier": 0.0, "n": 0}

    for r in rows:
        h = canon(r["mandante"])
        a = canon(r["visitante"])
        if not h or not a or h == a:
            continue

        sh = pi.setdefault(h, [0.0, 0.0])
        sa = pi.setdefault(a, [0.0, 0.0])
        gh = goals_hist.setdefault(h, [0.0, 0.0, 0, 0.0, 0.0, 0])
        ga = goals_hist.setdefault(a, [0.0, 0.0, 0, 0.0, 0.0, 0])

        # Dias de descanso (Rest Advantage NBA)
        try:
            dt = datetime.date.fromisoformat(str(r["data"])[:10])
        except Exception:
            dt = None

        rest_diff = 0.0
        if dt and h in last_date and a in last_date:
            dh = min(14, max(1, (dt - last_date[h]).days))
            da = min(14, max(1, (dt - last_date[a]).days))
            rest_diff = max(-4.0, min(4.0, float(dh - da)))

        # Avaliar apenas fora da amostra (2024–2025)
        if r["ano"] in (2024, 2025):
            gm, gv = int(r["gols_mandante"]), int(r["gols_visitante"])
            outcome = 0 if gm > gv else (1 if gm == gv else 2)

            # 1. Baseline: médias simples de gols
            avg_h_gp = (gh[0] / gh[2]) if gh[2] >= 3 else 1.45
            avg_h_gc = (gh[1] / gh[2]) if gh[2] >= 3 else 1.05
            avg_a_gp = (ga[3] / ga[5]) if ga[5] >= 3 else 1.00
            avg_a_gc = (ga[4] / ga[5]) if ga[5] >= 3 else 1.40
            lh_base = (avg_h_gp + avg_a_gc) / 2.0
            la_base = (avg_a_gp + avg_h_gc) / 2.0
            pb = dixon_coles_probs(lh_base, la_base)

            m_base["rps"] += rps_score(*pb, outcome)
            m_base["ll"] += log_loss(*pb, outcome)
            m_base["brier"] += brier_score(*pb, outcome)
            m_base["n"] += 1

            # 2. Oráculo Híbrido: Pi-Ratings + Rest Advantage + shrink leve com baseline
            pi_diff = (sh[0] - sa[1])
            lh_hyb = max(0.40, 1.38 + 0.42 * pi_diff + 0.025 * rest_diff + 0.20 * (lh_base - 1.38))
            la_hyb = max(0.35, 1.02 - 0.36 * pi_diff - 0.020 * rest_diff + 0.20 * (la_base - 1.02))
            ph = dixon_coles_probs(lh_hyb, la_hyb)

            m_hyb["rps"] += rps_score(*ph, outcome)
            m_hyb["ll"] += log_loss(*ph, outcome)
            m_hyb["brier"] += brier_score(*ph, outcome)
            m_hyb["n"] += 1

        # Atualizar estado APÓS a partida
        exp_h = (10.0 ** (abs(sh[0]) / c_scale) - 1.0) * (1.0 if sh[0] >= 0 else -1.0)
        exp_a = (10.0 ** (abs(sa[1]) / c_scale) - 1.0) * (1.0 if sa[1] >= 0 else -1.0)
        err = float(r["gols_mandante"] - r["gols_visitante"]) - (exp_h - exp_a)
        adj = psi(err)
        sh[0] += lam * adj
        sh[1] += lam * gamma * adj
        sa[1] -= lam * adj
        sa[0] -= lam * gamma * adj

        gh[0] += r["gols_mandante"]
        gh[1] += r["gols_visitante"]
        gh[2] += 1
        ga[3] += r["gols_visitante"]
        ga[4] += r["gols_mandante"]
        ga[5] += 1
        if dt:
            last_date[h] = dt
            last_date[a] = dt

    n = max(m_base["n"], 1)
    base_rps = round(m_base["rps"] / n, 4)
    hyb_rps = round(m_hyb["rps"] / n, 4)
    base_ll = round(m_base["ll"] / n, 4)
    hyb_ll = round(m_hyb["ll"] / n, 4)
    base_br = round(m_base["brier"] / n, 4)
    hyb_br = round(m_hyb["brier"] / n, 4)

    cur.execute("DROP TABLE IF EXISTS oraculo_backtest_metrics;")
    cur.execute(
        """
        CREATE TABLE oraculo_backtest_metrics (
            modelo TEXT PRIMARY KEY,
            janela TEXT NOT NULL,
            partidas_avaliadas INTEGER NOT NULL,
            rps REAL NOT NULL,
            log_loss REAL NOT NULL,
            brier_score REAL NOT NULL,
            atualizado_em TEXT NOT NULL
        );
        """
    )
    agora = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    cur.execute(
        "INSERT INTO oraculo_backtest_metrics VALUES (?, ?, ?, ?, ?, ?, ?)",
        ("Baseline (Dixon-Coles Simples)", "Série A 2024-2025", n, base_rps, base_ll, base_br, agora),
    )
    cur.execute(
        "INSERT INTO oraculo_backtest_metrics VALUES (?, ?, ?, ?, ?, ?, ?)",
        ("Oráculo Híbrido (Pi-Ratings + Rest + Dixon-Coles)", "Série A 2024-2025", n, hyb_rps, hyb_ll, hyb_br, agora),
    )

    conn.commit()
    cur.execute("PRAGMA journal_mode = DELETE;")
    cur.execute("VACUUM;")
    conn.close()

    size_mb = os.path.getsize(DB_PATH) / (1024 * 1024)
    print(
        f"Backtest Walk-Forward (n={n}): Baseline RPS={base_rps} LL={base_ll} | "
        f"Oráculo Híbrido RPS={hyb_rps} LL={hyb_ll} | db_size={size_mb:.2f} MB"
    )


if __name__ == "__main__":
    main()
