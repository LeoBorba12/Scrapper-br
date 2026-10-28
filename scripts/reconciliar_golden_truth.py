#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
reconciliar_golden_truth.py
Aplica a verdade padrão ouro (Golden Truth) para os principais atletas da base,
garantindo dados oficiais auditados e detalhe de carreira estruturado.
"""

import os
import sys
import json
import sqlite3

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DB_PATH = os.path.join(BASE_DIR, "data", "futebol.db")
GOLDEN_PATH = os.path.join(BASE_DIR, "data", "golden_truth_atletas.json")

def aplicar_golden_truth():
    if not os.path.exists(GOLDEN_PATH):
        print(f"❌ Arquivo Golden Truth não encontrado em: {GOLDEN_PATH}")
        return

    with open(GOLDEN_PATH, "r", encoding="utf-8") as f:
        atletas_truth = json.load(f)

    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()

    print("=" * 60)
    print("RECONCILIAÇÃO DO DATASET PADRÃO OURO (GOLDEN TRUTH)")
    print("=" * 60)

    atualizados = 0
    for at in atletas_truth:
        target_id = at["id_jogador"]
        nome = at["nome_exibicao"]
        gols_ofc = at["gols_carreira_oficiais"]
        jogos_ofc = at["jogos_carreira_oficiais"]
        assists_ofc = at["assistencias_carreira_oficiais"]
        ogol_id = at.get("ogol_id")
        pos = at.get("posicao")
        detalhe_json = json.dumps(at.get("clubes_resumo", []), ensure_ascii=False)
        pontaria = at.get("pontaria_chutes_pct", 65.0)

        c.execute("""
            UPDATE jogadores_estatisticas
            SET gols_carreira_oficiais = ?,
                jogos_carreira_oficiais = ?,
                assistencias_carreira_oficiais = ?,
                detalhe_carreira_clubes = ?,
                ogol_id = COALESCE(?, ogol_id),
                posicao = COALESCE(?, posicao),
                pontaria_chutes_pct = ?
            WHERE id_jogador = ? OR (LOWER(nome_exibicao) = LOWER(?) AND ogol_id = ?);
        """, (gols_ofc, jogos_ofc, assists_ofc, detalhe_json, ogol_id, pos, pontaria, target_id, nome, ogol_id))

        if c.rowcount > 0:
            atualizados += 1
            print(f"✅ {nome} (ID {target_id}): {gols_ofc} gols, {jogos_ofc} jogos, {assists_ofc} assistências oficiais.")
        else:
            print(f"⚠️ {nome} (ID {target_id}): Registro não encontrado para atualização.")

    conn.commit()
    conn.close()

    print("=" * 60)
    print(f"Total de atletas reconciliados com Golden Truth: {atualizados}/{len(atletas_truth)}")
    print("=" * 60)

if __name__ == "__main__":
    aplicar_golden_truth()
