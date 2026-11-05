#!/usr/bin/env python3
"""
FutStats — Desafio 32: restaura gols legítimos colapsados pela constraint.

Problema: uq_gols_idempotencia (partida_id, atleta_id, clube_id, minuto, tempo,
tipo_de_gol) tratava dobletes/hat-tricks sem minuto como duplicatas.

Solução:
  1. Adiciona ordinal_gol_partida (default 1).
  2. Troca o índice único por uma versão que inclui o ordinal.
  3. Restaura SOMENTE registros 'legitimo_colapsado' de
     data/gols_removidos_deduplicacao.json, respeitando o placar oficial.
  4. Reclassifica em gols_auditoria os gols restaurados.

Uso:
  python scripts/restaurar_gols_legitimos.py             # simula (rollback)
  python scripts/restaurar_gols_legitimos.py --aplicar   # grava
  python scripts/restaurar_gols_legitimos.py --aplicar --recalcular
"""

import argparse
import json
import os
import shutil
import sqlite3
import subprocess
import sys
from datetime import datetime
from pathlib import Path

DB = Path("data/futebol.db")
REMOVIDOS = Path("data/gols_removidos_deduplicacao.json")
RELATORIO = Path("data/relatorio_restauracao_gols.json")
BACKUP_DIR = Path("backups")
SOFT_LIMIT_MB = 84.0
HARD_LIMIT_MB = 94.0
CHAVES_FLAG = ("classificacao", "diagnostico", "flag", "categoria", "categoria_auditoria", "tipo")
ALVO = "legitimo_colapsado"
KEY_COLS = ("partida_id", "atleta_id", "clube_id", "minuto", "tempo", "tipo_de_gol")


def carregar_removidos():
    dados = json.loads(REMOVIDOS.read_text(encoding="utf-8"))
    if isinstance(dados, dict):
        for k in ("registros", "gols", "removidos", "itens"):
            if isinstance(dados.get(k), list):
                return dados[k]
        raise SystemExit(f"JSON sem lista reconhecível. Chaves: {list(dados)[:10]}")
    return dados


def flag_de(reg):
    for k in CHAVES_FLAG:
        if k in reg:
            return str(reg[k])
    return None


def cols_tabela(con, tabela):
    return [r[1] for r in con.execute(f"PRAGMA table_info({tabela})")]


def preparar_schema(con):
    cols = cols_tabela(con, "gols")
    if "ordinal_gol_partida" not in cols:
        con.execute(
            "ALTER TABLE gols ADD COLUMN ordinal_gol_partida INTEGER NOT NULL DEFAULT 1"
        )
    con.execute("DROP INDEX IF EXISTS uq_gols_idempotencia")
    con.execute(
        "CREATE UNIQUE INDEX IF NOT EXISTS uq_gols_idempotencia_ordinal ON gols "
        "(partida_id, atleta_id, clube_id, minuto, tempo, tipo_de_gol, ordinal_gol_partida)"
    )


def placar_total(con, pid, col_pid):
    row = con.execute(
        f"SELECT gols_mandante, gols_visitante FROM partidas WHERE {col_pid} = ?", (pid,)
    ).fetchone()
    if not row or row[0] is None or row[1] is None:
        return None
    return int(row[0]) + int(row[1])


def proximo_ordinal(con, r):
    q = (
        "SELECT COALESCE(MAX(ordinal_gol_partida), 0) + 1 FROM gols WHERE partida_id = ? "
        "AND atleta_id IS ? AND clube_id IS ? AND minuto IS ? AND tempo IS ? AND tipo_de_gol IS ?"
    )
    return con.execute(q, tuple(r.get(c) for c in KEY_COLS)).fetchone()[0]


def restaurar(con, registros, col_pid):
    cols_gols = set(cols_tabela(con, "gols"))
    stats = {"restaurados": 0, "rejeitados_excede_placar": 0, "rejeitados_sem_placar": 0,
             "rejeitados_conflito": 0, "ids_restaurados": []}
    contagem = {}
    for reg in registros:
        r = dict(reg)
        r.setdefault("partida_id", r.get("id_partida"))
        r.setdefault("id_partida", r.get("partida_id"))
        pid = r.get("id_partida")
        total = placar_total(con, pid, col_pid)
        if total is None:
            stats["rejeitados_sem_placar"] += 1
            continue
        if pid not in contagem:
            contagem[pid] = con.execute(
                "SELECT COUNT(*) FROM gols WHERE id_partida = ?", (pid,)
            ).fetchone()[0]
        if contagem[pid] + 1 > total:
            stats["rejeitados_excede_placar"] += 1
            continue
        r["ordinal_gol_partida"] = proximo_ordinal(con, r)
        campos = [c for c in r if c in cols_gols]
        if "id_gol" in campos and con.execute(
            "SELECT 1 FROM gols WHERE id_gol = ?", (r["id_gol"],)
        ).fetchone():
            campos.remove("id_gol")
        sql = f"INSERT INTO gols ({','.join(campos)}) VALUES ({','.join('?' * len(campos))})"
        try:
            cur = con.execute(sql, [r[c] for c in campos])
        except sqlite3.IntegrityError:
            stats["rejeitados_conflito"] += 1
            continue
        contagem[pid] += 1
        stats["restaurados"] += 1
        stats["ids_restaurados"].append(cur.lastrowid)
    return stats


def reclassificar_auditoria(con, ids):
    try:
        con.executemany(
            "UPDATE gols_auditoria SET status = 'corrigido', "
            "regra_violada = 'RESTAURADO_ORDINAL', auditado_em = datetime('now') "
            "WHERE gol_id = ?",
            [(i,) for i in ids],
        )
    except sqlite3.OperationalError as e:
        print(f"[AVISO] gols_auditoria não atualizada: {e}")


def validar_excesso(con, col_pid, pids=None):
    if pids:
        placeholders = ",".join("?" * len(pids))
        return con.execute(
            f"SELECT COUNT(*) FROM (SELECT p.{col_pid} FROM partidas p "
            f"JOIN gols g ON g.id_partida = p.{col_pid} "
            f"WHERE p.{col_pid} IN ({placeholders}) "
            f"GROUP BY p.{col_pid} "
            f"HAVING COUNT(*) > (p.gols_mandante + p.gols_visitante))",
            list(pids),
        ).fetchone()[0]
    return con.execute(
        f"SELECT COUNT(*) FROM (SELECT p.{col_pid} FROM partidas p "
        f"JOIN gols g ON g.id_partida = p.{col_pid} "
        f"GROUP BY p.{col_pid} "
        f"HAVING COUNT(*) > (p.gols_mandante + p.gols_visitante))"
    ).fetchone()[0]


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--aplicar", action="store_true")
    ap.add_argument("--recalcular", action="store_true")
    args = ap.parse_args()

    for p in (DB, REMOVIDOS):
        if not p.exists():
            raise SystemExit(f"Arquivo não encontrado: {p}")

    registros = carregar_removidos()
    alvo = [r for r in registros if flag_de(r) == ALVO]
    print(f"Registros no JSON: {len(registros)} | {ALVO}: {len(alvo)}")
    if not alvo:
        raise SystemExit(
            "Nenhum registro com a flag esperada. Exemplo de chaves: "
            f"{list(registros[0])[:15] if registros else 'vazio'}"
        )

    if args.aplicar:
        BACKUP_DIR.mkdir(exist_ok=True)
        bkp = BACKUP_DIR / f"futebol_pre_restauracao_gols_{datetime.now():%Y%m%d_%H%M%S}.db"
        shutil.copy2(DB, bkp)
        print(f"Backup: {bkp}")

    con = sqlite3.connect(DB)
    con.execute("PRAGMA journal_mode = DELETE")
    cols_p = cols_tabela(con, "partidas")
    col_pid = "id_partida" if "id_partida" in cols_p else "id"
    antes = con.execute("SELECT COUNT(*) FROM gols").fetchone()[0]

    try:
        preparar_schema(con)
        stats = restaurar(con, alvo, col_pid)
        reclassificar_auditoria(con, stats["ids_restaurados"])
        pids_alvo = set(r.get("id_partida") or r.get("partida_id") for r in alvo if (r.get("id_partida") or r.get("partida_id")))
        excesso = validar_excesso(con, col_pid, pids_alvo)
        depois = con.execute("SELECT COUNT(*) FROM gols").fetchone()[0]

        if excesso:
            con.rollback()
            raise SystemExit(f"ABORTADO: {excesso} partidas com gols acima do placar.")

        rel = {k: v for k, v in stats.items() if k != "ids_restaurados"}
        rel.update({"gols_antes": antes, "gols_depois": depois,
                    "partidas_com_excesso": excesso, "modo": "aplicado" if args.aplicar else "simulacao"})

        if not args.aplicar:
            con.rollback()
            RELATORIO.write_text(json.dumps(rel, indent=2, ensure_ascii=False), encoding="utf-8")
            print(json.dumps(rel, indent=2, ensure_ascii=False))
            print("SIMULAÇÃO: nada foi gravado. Use --aplicar.")
            return

        con.commit()
        con.execute("VACUUM")
        rel["journal_mode"] = con.execute("PRAGMA journal_mode").fetchone()[0]
    finally:
        con.close()

    tam = os.path.getsize(DB) / (1024 * 1024)
    rel["tamanho_banco_mb"] = round(tam, 2)
    RELATORIO.write_text(json.dumps(rel, indent=2, ensure_ascii=False), encoding="utf-8")
    print(json.dumps(rel, indent=2, ensure_ascii=False))
    if tam >= HARD_LIMIT_MB:
        raise SystemExit(f"FALHA: {tam:.2f} MB >= teto Vercel {HARD_LIMIT_MB} MB")
    if tam >= SOFT_LIMIT_MB:
        print(f"ALERTA: {tam:.2f} MB acima do soft limit {SOFT_LIMIT_MB} MB")

    if args.recalcular:
        for s in ("auditar_anomalias_gols", "materializar_metrica_atleta_golden",
                  "migracao_desafio27_dossie_clubes_gols_decompostos",
                  "materializar_metrica_gols_temporais"):
            print(f"-> {s}")
            subprocess.run([sys.executable, f"scripts/{s}.py"], check=False)


if __name__ == "__main__":
    main()
