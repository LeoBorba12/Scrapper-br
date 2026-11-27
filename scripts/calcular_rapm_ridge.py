# -*- coding: utf-8 -*-
"""
Fase 2 — RAPM (Regularized Adjusted Plus-Minus) via Regressão Ridge (NumPy)
Calcula o impacto líquido marginal de cada atleta no saldo de gols da equipe
controlando pelos companheiros em campo, adversários e mando de campo.

Execução offline: grava apenas a tabela compacta `atleta_rapm_scores` (< 100 KB)
em `data/futebol.db` mantendo `journal_mode=DELETE`.
"""
import datetime
import math
import os
import sqlite3
import numpy as np

DB_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data", "futebol.db")


def main(alpha: float = 35.0, ano_min: int = 2024, min_jogos_salvar: int = 5):
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    c = conn.cursor()

    # 1. Carregar partidas finalizadas da Série A/Brasileirão >= ano_min com escalações
    rows = c.execute(
        """
        SELECT
            p.id_partida,
            p.ano,
            p.mandante,
            p.visitante,
            p.gols_mandante,
            p.gols_visitante,
            e.id_jogador,
            e.clube,
            COALESCE(j.nome_exibicao, e.atleta) AS nome_atleta
        FROM partidas p
        JOIN escalacoes e ON e.id_partida = p.id_partida
        LEFT JOIN jogadores j ON j.id_jogador = e.id_jogador
        WHERE p.ano >= ?
          AND p.campeonato LIKE '%Brasileir%'
          AND p.gols_mandante IS NOT NULL
          AND p.gols_visitante IS NOT NULL
          AND e.titular = 1
          AND e.id_jogador IS NOT NULL
        ORDER BY p.data ASC, p.id_partida ASC;
        """,
        (ano_min,),
    ).fetchall()

    # Agrupar por partida
    partidas_map = {}
    atleta_meta = {}
    for r in rows:
        pid = r["id_partida"]
        jid = int(r["id_jogador"])
        clube = (r["clube"] or "").strip()
        mand = (r["mandante"] or "").strip()
        vis = (r["visitante"] or "").strip()

        if pid not in partidas_map:
            partidas_map[pid] = {
                "saldo": float(r["gols_mandante"] - r["gols_visitante"]),
                "mandante_ids": set(),
                "visitante_ids": set(),
            }

        c_low = clube.lower()
        if c_low and (c_low in mand.lower() or mand.lower() in c_low):
            partidas_map[pid]["mandante_ids"].add(jid)
        elif c_low and (c_low in vis.lower() or vis.lower() in c_low):
            partidas_map[pid]["visitante_ids"].add(jid)
        else:
            continue

        meta = atleta_meta.setdefault(jid, {"nome": r["nome_atleta"], "clube": clube, "jogos": 0})
        meta["nome"] = r["nome_atleta"] or meta["nome"]
        meta["clube"] = clube or meta["clube"]

    # Filtrar partidas com ambos os times mapeados (>= 7 titulares por lado)
    valid_partidas = [
        p for p in partidas_map.values()
        if len(p["mandante_ids"]) >= 7 and len(p["visitante_ids"]) >= 7
    ]

    for p in valid_partidas:
        for jid in p["mandante_ids"] | p["visitante_ids"]:
            atleta_meta[jid]["jogos"] += 1

    # Selecionar atletas com >= 3 jogos para a matriz Ridge
    atletas_ids = sorted([jid for jid, m in atleta_meta.items() if m["jogos"] >= 3])
    idx_map = {jid: i for i, jid in enumerate(atletas_ids)}
    n_jogos = len(valid_partidas)
    n_atletas = len(atletas_ids)

    if n_jogos < 30 or n_atletas < 20:
        print(f"Amostra insuficiente para RAPM: jogos={n_jogos}, atletas={n_atletas}")
        conn.close()
        return

    # 2. Montar matriz X (n_jogos x (n_atletas + 1 intercepto de mando)) e vetor y
    X = np.zeros((n_jogos, n_atletas + 1), dtype=np.float64)
    y = np.zeros(n_jogos, dtype=np.float64)

    for row_i, p in enumerate(valid_partidas):
        y[row_i] = p["saldo"]
        X[row_i, n_atletas] = 1.0  # Intercepto de mando de campo
        for jid in p["mandante_ids"]:
            if jid in idx_map:
                X[row_i, idx_map[jid]] = 1.0
        for jid in p["visitante_ids"]:
            if jid in idx_map:
                X[row_i, idx_map[jid]] = -1.0

    # 3. Resolver Ridge: (X^T X + alpha * P) beta = X^T y (sem penalizar intercepto)
    XtX = X.T @ X
    P = np.eye(n_atletas + 1, dtype=np.float64) * alpha
    P[n_atletas, n_atletas] = 0.0
    beta = np.linalg.solve(XtX + P, X.T @ y)

    mando_efeito = float(beta[n_atletas])
    coefs = beta[:n_atletas]

    # Converter coeficientes para escala 0-100 (Z-Score logístico)
    mean_c = float(np.mean(coefs))
    std_c = float(np.std(coefs)) or 1.0

    # 4. Persistir tabela compacta atleta_rapm_scores
    c.execute("DROP TABLE IF EXISTS atleta_rapm_scores;")
    c.execute(
        """
        CREATE TABLE atleta_rapm_scores (
            id_jogador INTEGER PRIMARY KEY,
            nome TEXT NOT NULL,
            clube_recente TEXT,
            jogos_titular INTEGER NOT NULL,
            rapm_saldo_gols REAL NOT NULL,
            rapm_score_0_100 REAL NOT NULL,
            alpha_ridge REAL NOT NULL,
            mando_efeito REAL NOT NULL,
            temporadas TEXT NOT NULL,
            atualizado_em TEXT NOT NULL
        );
        """
    )

    agora = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    inseridos = 0
    for i, jid in enumerate(atletas_ids):
        meta = atleta_meta[jid]
        if meta["jogos"] < min_jogos_salvar:
            continue
        val = float(coefs[i])
        z = (val - mean_c) / std_c
        score_100 = round(100.0 / (1.0 + math.exp(-1.15 * z)), 1)
        c.execute(
            """
            INSERT INTO atleta_rapm_scores (
                id_jogador, nome, clube_recente, jogos_titular,
                rapm_saldo_gols, rapm_score_0_100, alpha_ridge,
                mando_efeito, temporadas, atualizado_em
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                jid,
                meta["nome"],
                meta["clube"],
                meta["jogos"],
                round(val, 4),
                score_100,
                alpha,
                round(mando_efeito, 3),
                f"{ano_min}-2026",
                agora,
            ),
        )
        inseridos += 1

    conn.commit()
    c.execute("PRAGMA journal_mode = DELETE;")
    conn.close()

    size_mb = os.path.getsize(DB_PATH) / (1024 * 1024)
    print(
        f"RAPM Ridge concluído: partidas={n_jogos}, atletas_salvos={inseridos}, "
        f"efeito_mando=+{mando_efeito:.3f} gols, db_size={size_mb:.2f} MB"
    )


if __name__ == "__main__":
    main()
