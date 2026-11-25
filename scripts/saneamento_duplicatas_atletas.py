#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
saneamento_duplicatas_atletas.py
Consolida duplicatas seguras de atletas em jogadores_estatisticas / jogadores:
1. Perfis com o mesmo ogol_id (> 0): funde no registro canônico (maior total_gols/total_jogos),
   migrando gols, escalações e cartões sem gerar órfãos.
2. Perfis fantasma zerados (0 gols, 0 jogos e 0 eventos relacionais) com nome_exibicao idêntico
   a um perfil ativo existente.
"""
from __future__ import annotations

import os
import sqlite3
import unicodedata

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DB_PATH = os.path.join(BASE_DIR, "data", "futebol.db")


def _recalcular_totais(c: sqlite3.Cursor, keep_id: int) -> None:
    tot_gols = c.execute(
        "SELECT COUNT(*) FROM gols WHERE id_jogador = ? AND (tipo_de_gol IS NULL OR lower(tipo_de_gol) NOT LIKE '%contra%')",
        (keep_id,),
    ).fetchone()[0]
    tot_jogos = c.execute(
        """
        SELECT COUNT(DISTINCT id_partida) FROM (
            SELECT id_partida FROM escalacoes WHERE id_jogador = ?
            UNION SELECT id_partida FROM gols WHERE id_jogador = ?
            UNION SELECT id_partida FROM cartoes WHERE id_jogador = ?
        )
        """,
        (keep_id, keep_id, keep_id),
    ).fetchone()[0]
    c.execute(
        """
        UPDATE jogadores_estatisticas
        SET total_gols = MAX(?, COALESCE(total_gols, 0)),
            total_jogos = MAX(?, COALESCE(total_jogos, 0))
        WHERE id_jogador = ?
        """,
        (tot_gols, tot_jogos, keep_id),
    )
    c.execute(
        """
        UPDATE jogadores
        SET total_gols = MAX(?, COALESCE(total_gols, 0)),
            total_jogos = MAX(?, COALESCE(total_jogos, 0))
        WHERE id_jogador = ?
        """,
        (tot_gols, tot_jogos, keep_id),
    )


def sanear_duplicatas_atletas(db_path: str = DB_PATH) -> dict[str, int]:
    conn = sqlite3.connect(db_path, timeout=30.0)
    conn.execute("PRAGMA busy_timeout = 30000;")
    conn.execute("PRAGMA foreign_keys = OFF;")
    c = conn.cursor()

    merged_ogol = 0
    removed_ghosts = 0

    # 1. Mesmo ogol_id (> 0)
    dup_ogols = c.execute(
        """
        SELECT ogol_id FROM jogadores_estatisticas
        WHERE ogol_id IS NOT NULL AND ogol_id > 0
        GROUP BY ogol_id HAVING COUNT(*) > 1
        """
    ).fetchall()

    for (ogol_id,) in dup_ogols:
        perfis = c.execute(
            """
            SELECT id_jogador, nome_exibicao, COALESCE(total_gols, 0) AS tg, COALESCE(total_jogos, 0) AS tj,
                   COALESCE(gols_carreira_oficiais, 0) AS gco
            FROM jogadores_estatisticas
            WHERE ogol_id = ?
            ORDER BY tg DESC, tj DESC, gco DESC, id_jogador ASC
            """,
            (ogol_id,),
        ).fetchall()
        if len(perfis) < 2:
            continue
        keep_id, keep_nome = perfis[0][0], (perfis[0][1] or "").strip().lower()
        merged_any = False
        for row in perfis[1:]:
            old_id, old_nome = row[0], (row[1] or "").strip().lower()
            # Só funde automaticamente se o nome de exibição também coincidir (evita colisão de ogol_id)
            if old_nome != keep_nome:
                continue
            for tbl in ("gols", "escalacoes", "cartoes"):
                c.execute(f"UPDATE {tbl} SET id_jogador = ? WHERE id_jogador = ?", (keep_id, old_id))
            c.execute("DELETE FROM jogadores_estatisticas WHERE id_jogador = ?", (old_id,))
            c.execute("DELETE FROM jogadores WHERE id_jogador = ?", (old_id,))
            merged_ogol += 1
            merged_any = True
        if merged_any:
            _recalcular_totais(c, keep_id)

    # 2. Fantasmas zerados (0 gols/0 jogos e 0 linhas em gols/escalacoes/cartoes) com nome idêntico a perfil ativo
    ghosts = c.execute(
        """
        SELECT DISTINCT j1.id_jogador
        FROM jogadores_estatisticas j1
        JOIN jogadores_estatisticas j2
          ON LOWER(TRIM(j1.nome_exibicao)) = LOWER(TRIM(j2.nome_exibicao))
         AND j1.id_jogador != j2.id_jogador
        WHERE COALESCE(j1.total_gols, 0) = 0
          AND COALESCE(j1.total_jogos, 0) = 0
          AND (COALESCE(j2.total_gols, 0) > 0 OR COALESCE(j2.total_jogos, 0) > 0)
        """
    ).fetchall()

    for (gid,) in ghosts:
        refs = (
            c.execute("SELECT COUNT(*) FROM gols WHERE id_jogador = ?", (gid,)).fetchone()[0]
            + c.execute("SELECT COUNT(*) FROM escalacoes WHERE id_jogador = ?", (gid,)).fetchone()[0]
            + c.execute("SELECT COUNT(*) FROM cartoes WHERE id_jogador = ?", (gid,)).fetchone()[0]
        )
        if refs == 0:
            c.execute("DELETE FROM jogadores_estatisticas WHERE id_jogador = ?", (gid,))
            c.execute("DELETE FROM jogadores WHERE id_jogador = ?", (gid,))
            removed_ghosts += 1

    conn.commit()

    # 3. Perfis truncados de súmula CBF (id >= 17000, >= 30 chars, 0 gols) com match único sem conflito de sobrenome
    def _toks(val: str | None) -> list[str]:
        s = unicodedata.normalize("NFKD", (val or "").lower())
        s = "".join(ch for ch in s if not unicodedata.combining(ch))
        return [t for t in s.replace("-", " ").split() if len(t) >= 3]

    truncados = c.execute(
        """
        SELECT id_jogador, nome_exibicao, clubes
        FROM jogadores_estatisticas
        WHERE id_jogador >= 17000
          AND LENGTH(TRIM(nome_exibicao)) >= 30
          AND COALESCE(total_gols, 0) = 0
          AND COALESCE(gols_carreira_oficiais, 0) = 0
        """
    ).fetchall()

    ativos = c.execute(
        """
        SELECT id_jogador, nome_exibicao, nome_completo, clubes
        FROM jogadores_estatisticas
        WHERE id_jogador < 17000
          AND (COALESCE(total_gols, 0) > 0 OR COALESCE(gols_carreira_oficiais, 0) > 0)
        """
    ).fetchall()

    ativos_prep = []
    for aid, anome, acomp, aclubes in ativos:
        if not aclubes:
            continue
        a_clubs = {cb.strip().lower() for cb in aclubes.split(",") if cb.strip()}
        a_toks = set(_toks(anome)) | set(_toks(acomp))
        ativos_prep.append((aid, a_clubs, a_toks, set(_toks(anome))))

    merged_cbf = 0
    for tid, tnome, tclubes in truncados:
        if not tclubes:
            continue
        t_clubs = {cb.strip().lower() for cb in tclubes.split(",") if cb.strip()}
        t_toks = set(_toks(tnome))
        if len(t_toks) < 2:
            continue

        cands = []
        for aid, a_clubs, a_toks, a_short in ativos_prep:
            if not (t_clubs & a_clubs):
                continue
            if not a_short or not a_short.issubset(t_toks):
                continue
            # Todo token (>=3 chars) do nome truncado deve casar exato ou como prefixo (>=4 chars) de algum token completo
            all_match = all(
                (tt in a_toks) or (len(tt) >= 4 and any(at.startswith(tt) for at in a_toks))
                for tt in t_toks
            )
            if all_match:
                cands.append(aid)

        if len(cands) == 1:
            keep_id = cands[0]
            for tbl in ("gols", "escalacoes", "cartoes"):
                c.execute(f"UPDATE {tbl} SET id_jogador = ? WHERE id_jogador = ?", (keep_id, tid))
            c.execute("DELETE FROM jogadores_estatisticas WHERE id_jogador = ?", (tid,))
            c.execute("DELETE FROM jogadores WHERE id_jogador = ?", (tid,))
            _recalcular_totais(c, keep_id)
            merged_cbf += 1

    conn.commit()
    conn.execute("PRAGMA foreign_keys = ON;")
    conn.close()
    return {"merged_ogol": merged_ogol, "removed_ghosts": removed_ghosts, "merged_cbf": merged_cbf}


if __name__ == "__main__":
    res = sanear_duplicatas_atletas()
    print(
        f"Saneamento concluído: {res['merged_ogol']} duplicatas ogol_id fundidas, "
        f"{res['removed_ghosts']} fantasmas zerados removidos, "
        f"{res['merged_cbf']} perfis truncados CBF unificados."
    )
