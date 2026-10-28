#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
consolidar_homonimos_atletas.py
Consolidador e higienizador relacional de atletas e homônimos (FutStats).
Migra gols, partidas e escalações de IDs fragmentados para seus registros canônicos.
"""

import os
import sys
import sqlite3
import json

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DB_PATH = os.path.join(BASE_DIR, "data", "futebol.db")

# Mapeamento canônico: { id_canonico: { 'nome': ..., 'ogol_id': ..., 'aliases': [...], 'ids_fragmentados': [...] } }
MAPA_FUSAO_HOMONIMOS = {
    352: {
        "nome": "Neymar",
        "nome_completo": "Neymar da Silva Santos Júnior",
        "ogol_id": 54814,
        "ids_fragmentados": [10498, 16872, 20665],
        "apelidos_match": ["neymar", "neymar jr", "neymar da silva santos junior"]
    },
    7: {
        "nome": "Gabriel Barbosa",
        "nome_completo": "Gabriel Barbosa Almeida",
        "ogol_id": 75171,
        "ids_fragmentados": [],
        "apelidos_match": ["gabigol", "gabriel barbosa", "gabriel barbosa almeida"]
    },
    10: {
        "nome": "Pedro",
        "nome_completo": "Pedro Guilherme Abreu dos Santos",
        "ogol_id": 481359,
        "ids_fragmentados": [20813],
        "apelidos_match": ["pedro", "pedro guilherme abreu dos santos"]
    },
    9: {
        "nome": "Hulk",
        "nome_completo": "Givanildo Vieira de Souza",
        "ogol_id": 5696,
        "ids_fragmentados": [],
        "apelidos_match": ["hulk", "givanildo vieira de souza"]
    },
    11: {
        "nome": "Germán Cano",
        "nome_completo": "Germán Ezequiel Cano Recalde",
        "ogol_id": 36577,
        "ids_fragmentados": [],
        "apelidos_match": ["german cano", "germán cano", "cano"]
    },
    93: {
        "nome": "Giorgian de Arrascaeta",
        "nome_completo": "Giorgian Daniel De Arrascaeta Benedetti",
        "ogol_id": 270657,
        "ids_fragmentados": [],
        "apelidos_match": ["arrascaeta", "giorgian de arrascaeta", "de arrascaeta"]
    }
}

def consolidar_homonimos():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    c = conn.cursor()

    print("=" * 60)
    print("CONSOLIDAÇÃO E HIGIENIZAÇÃO DE HOMÔNIMOS DE ATLETAS")
    print("=" * 60)

    total_gols_migrados = 0
    total_esc_migradas = 0
    total_fantasmas_removidos = 0

    for id_canonico, meta in MAPA_FUSAO_HOMONIMOS.items():
        nome = meta["nome"]
        ogol_id = meta["ogol_id"]
        frag_ids = set(meta["ids_fragmentados"])

        # Identificar dinamicamente outros IDs sem ogol_id que tenham o mesmo nome ou apelido
        for ap in meta["apelidos_match"]:
            c.execute("""
                SELECT id_jogador, nome_exibicao, nome_completo, ogol_id
                FROM jogadores_estatisticas
                WHERE (LOWER(nome_exibicao) = ? OR LOWER(nome_completo) = ? OR LOWER(apelido) = ?)
                  AND id_jogador != ? AND (ogol_id IS NULL OR ogol_id = 0);
            """, (ap.lower(), ap.lower(), ap.lower(), id_canonico))
            for r in c.fetchall():
                frag_ids.add(r["id_jogador"])

        if not frag_ids:
            print(f"✅ {nome} (ID {id_canonico}): Sem registros fragmentados pendentes.")
            continue

        print(f"\n🔄 Consolidando {nome} (ID Canônico {id_canonico}, OGol {ogol_id}):")
        print(f"   IDs fragmentados a fundir: {list(frag_ids)}")

        for fid in frag_ids:
            # 1. Migrar gols
            c.execute("UPDATE gols SET id_jogador = ? WHERE id_jogador = ?", (id_canonico, fid))
            gols_m = c.rowcount
            total_gols_migrados += gols_m

            # 2. Migrar escalações
            c.execute("UPDATE escalacoes SET id_jogador = ? WHERE id_jogador = ?", (id_canonico, fid))
            esc_m = c.rowcount
            total_esc_migradas += esc_m

            # 3. Migrar cartões
            c.execute("UPDATE cartoes SET id_jogador = ? WHERE id_jogador = ?", (id_canonico, fid))

            # 4. Deletar registro fantasma
            c.execute("DELETE FROM jogadores_estatisticas WHERE id_jogador = ?", (fid,))
            if c.rowcount > 0:
                total_fantasmas_removidos += 1

            print(f"   - ID {fid}: {gols_m} gols e {esc_m} escalações migradas para ID {id_canonico}.")

        # 5. Também reconciliar gols pelo texto de atleta onde id_jogador for NULL
        for ap in meta["apelidos_match"]:
            c.execute("UPDATE gols SET id_jogador = ? WHERE id_jogador IS NULL AND LOWER(atleta) = ?", (id_canonico, ap.lower()))
            if c.rowcount > 0:
                print(f"   - Resgatados {c.rowcount} gols de '{ap}' com id_jogador NULL.")
                total_gols_migrados += c.rowcount

            c.execute("UPDATE escalacoes SET id_jogador = ? WHERE (id_jogador IS NULL OR id_jogador = 0) AND LOWER(atleta) = ?", (id_canonico, ap.lower()))
            if c.rowcount > 0:
                print(f"   - Resgatadas {c.rowcount} escalações de '{ap}' com id_jogador NULL.")
                total_esc_migradas += c.rowcount

        # 6. Recalcular totais consolidados no ID canônico
        c.execute("SELECT COUNT(*) FROM gols WHERE id_jogador = ?", (id_canonico,))
        tot_gols = c.fetchone()[0]

        c.execute("SELECT COUNT(DISTINCT id_partida) FROM (SELECT id_partida FROM gols WHERE id_jogador = ? UNION SELECT id_partida FROM escalacoes WHERE id_jogador = ?)", (id_canonico, id_canonico))
        tot_jogos = c.fetchone()[0]

        c.execute("SELECT COUNT(*) FROM cartoes WHERE id_jogador = ? AND LOWER(cartao) LIKE '%amarelo%'", (id_canonico,))
        tot_amarelos = c.fetchone()[0]

        c.execute("SELECT COUNT(*) FROM cartoes WHERE id_jogador = ? AND LOWER(cartao) LIKE '%vermelho%'", (id_canonico,))
        tot_vermelhos = c.fetchone()[0]

        c.execute("""
            UPDATE jogadores_estatisticas
            SET total_gols = ?, total_jogos = ?, cartoes_amarelos = ?, cartoes_vermelhos = ?, ogol_id = COALESCE(?, ogol_id)
            WHERE id_jogador = ?
        """, (tot_gols, max(tot_jogos, tot_gols), tot_amarelos, tot_vermelhos, ogol_id, id_canonico))

        print(f"   📊 Totais consolidados no ID {id_canonico}: {tot_gols} gols no acervo, {tot_jogos} partidas catalogadas.")

    conn.commit()
    conn.close()

    print("\n" + "=" * 60)
    print(f"RESUMO DA HIGIENIZAÇÃO:")
    print(f"  Gols unificados no acervo: {total_gols_migrados}")
    print(f"  Escalações unificadas: {total_esc_migradas}")
    print(f"  Registros fantasmas expurgados: {total_fantasmas_removidos}")
    print("=" * 60)

if __name__ == "__main__":
    consolidar_homonimos()
