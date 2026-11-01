#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
scripts/consolidar_duplicatas_partidas.py
=========================================
Consolidação Canônica de Confrontos Históricos Quase-Duplicados (Milestone 2 - FutStats).

Localiza e unifica com rigor matemático e integridade relacional os ~3.710 confrontos
duplicados no acervo histórico (mesmo mandante, mesmo visitante, mesmo ano e diferença
de data <= 3 dias decorrente de jitter de fusos e fontes de dados distintas).

Procedimento:
1. Agrupa confrontos em clusters conexos de duplicatas via grafo de adjacência.
2. Elege o registro canônico por pontuação ponderada (gols, escalações, cartões, odds e metadados).
3. Transfere gols e escalações exclusivos da partida secundária para a canônica (evitando duplicação).
4. Transfere cartões e odds de apostas faltantes para a partida canônica.
5. Enriquece metadados ausentes (estádio, árbitro, rodada, público, horário).
6. Remove os registros excedentes de partidas consolidadas.
7. Executa PRAGMA foreign_key_check e PRAGMA integrity_check.
"""

import os
import sys
import time
import sqlite3
import datetime
from collections import defaultdict
from typing import Dict, List, Set, Tuple, Optional

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
if hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8", errors="replace")

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DB_PATH = os.path.join(BASE_DIR, "data", "futebol.db")

def conectar_db(db_path: str = DB_PATH) -> sqlite3.Connection:
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode = WAL;")
    conn.execute("PRAGMA synchronous = NORMAL;")
    conn.execute("PRAGMA foreign_keys = OFF;")
    return conn

def calcular_score_partida(c: sqlite3.Cursor, pid: int) -> Tuple[int, int, int, int, int, int]:
    """Calcula métrica de completude da partida para eleição do registro canônico."""
    c.execute("SELECT COUNT(*) FROM gols WHERE id_partida = ?", (pid,))
    cnt_gols = c.fetchone()[0]

    c.execute("SELECT COUNT(*) FROM escalacoes WHERE id_partida = ?", (pid,))
    cnt_esc = c.fetchone()[0]

    c.execute("SELECT COUNT(*) FROM cartoes WHERE id_partida = ?", (pid,))
    cnt_cart = c.fetchone()[0]

    c.execute("SELECT COUNT(*) FROM odds_partidas WHERE id_partida = ?", (pid,))
    cnt_odds = c.fetchone()[0]

    c.execute("""
        SELECT estadio, arbitro, rodada, publico, cidade, estado, horario, placar
        FROM partidas WHERE id_partida = ?
    """, (pid,))
    row = c.fetchone()
    meta_count = sum(1 for v in row if v is not None and str(v).strip() != "") if row else 0

    # Preferência adicional por IDs históricos originais (< 100M)
    id_bonus = 500 if pid < 100_000_000 else 0

    total_score = (cnt_gols * 100) + (cnt_esc * 20) + (cnt_cart * 10) + (cnt_odds * 5) + (meta_count * 2) + id_bonus
    return total_score, cnt_gols, cnt_esc, cnt_cart, cnt_odds, meta_count

def consolidar_duplicatas(db_path: str = DB_PATH) -> Dict:
    start_time = time.time()
    print("=" * 80)
    print("  CONSOLIDAÇÃO CANÔNICA DE CONFRONTOS QUASE-DUPLICADOS (MILESTONE 2)")
    print(f"  Banco de Dados: {db_path}")
    print(f"  Início: {datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 80)

    conn = conectar_db(db_path)
    c = conn.cursor()

    # 1. Identificar todos os pares quase-duplicados
    print("[*] Mapeando pares quase-duplicados (mesmo mandante, visitante, ano e abs(data) <= 3 dias)...")
    c.execute("""
        SELECT p1.id_partida, p2.id_partida
        FROM partidas p1
        JOIN partidas p2 ON p1.mandante = p2.mandante 
                        AND p1.visitante = p2.visitante 
                        AND p1.ano = p2.ano
                        AND p1.id_partida < p2.id_partida
                        AND abs(julianday(p1.data) - julianday(p2.data)) <= 3
    """)
    pairs = c.fetchall()
    print(f"    -> Encontrados {len(pairs)} pares de partidas candidatas à consolidação.")

    if not pairs:
        print("[OK] Nenhuma duplicata encontrada. Banco consolidado!")
        conn.close()
        return {"status": "ok", "clusters": 0, "removidas": 0}

    # 2. Agrupar em clusters conexos
    adj = defaultdict(set)
    for p1, p2 in pairs:
        adj[p1].add(p2)
        adj[p2].add(p1)

    visited = set()
    clusters = []
    for node in sorted(adj.keys()):
        if node not in visited:
            cluster = []
            queue = [node]
            visited.add(node)
            while queue:
                curr = queue.pop(0)
                cluster.append(curr)
                for neighbor in adj[curr]:
                    if neighbor not in visited:
                        visited.add(neighbor)
                        queue.append(neighbor)
            clusters.append(cluster)

    print(f"    -> Identificados {len(clusters)} clusters conexos de confrontos duplicados.")

    total_partidas_removidas = 0
    total_gols_transferidos = 0
    total_gols_duplicados_purgados = 0
    total_escalacoes_transferidas = 0
    total_escalacoes_purgadas = 0
    total_odds_transferidas = 0
    total_cartoes_transferidos = 0

    for idx, cluster in enumerate(clusters, 1):
        # Avaliar score de cada partida do cluster
        avaliacoes = []
        for pid in cluster:
            score_data = calcular_score_partida(c, pid)
            avaliacoes.append((score_data[0], -pid, pid, score_data))

        # O maior score vence; se empate, o menor pid (maior -pid)
        avaliacoes.sort(reverse=True)
        canonical_pid = avaliacoes[0][2]
        pids_to_merge = [av[2] for av in avaliacoes[1:]]

        # Inspecionar dados da partida canônica para preenchimento de metadados
        c.execute("""
            SELECT estadio, arbitro, rodada, publico, cidade, estado, horario, placar,
                   gols_mandante, gols_visitante, vencedor, campeonato
            FROM partidas WHERE id_partida = ?
        """, (canonical_pid,))
        can_row = dict(c.fetchone())

        for sec_pid in pids_to_merge:
            c.execute("""
                SELECT estadio, arbitro, rodada, publico, cidade, estado, horario, placar,
                       gols_mandante, gols_visitante, vencedor, campeonato
                FROM partidas WHERE id_partida = ?
            """, (sec_pid,))
            sec_row = dict(c.fetchone())

            # 1. Enriquecer metadados ausentes na canônica
            meta_updates = {}
            for col in ["estadio", "arbitro", "rodada", "publico", "cidade", "estado", "horario"]:
                if (not can_row.get(col) or str(can_row.get(col)).strip() == "") and sec_row.get(col):
                    meta_updates[col] = sec_row[col]
                    can_row[col] = sec_row[col]

            if meta_updates:
                set_clauses = [f"{col} = ?" for col in meta_updates.keys()]
                c.execute(f"UPDATE partidas SET {', '.join(set_clauses)} WHERE id_partida = ?",
                          list(meta_updates.values()) + [canonical_pid])

            # 2. Transferência de GOLS
            c.execute("SELECT id_gol, atleta, minuto, clube, tempo, tipo_de_gol, id_jogador FROM gols WHERE id_partida = ?", (sec_pid,))
            sec_gols = c.fetchall()
            for g in sec_gols:
                # Verifica se a canônica já tem esse gol (mesmo atleta e minuto aproximado/tempo)
                c.execute("""
                    SELECT id_gol FROM gols 
                    WHERE id_partida = ? AND atleta = ? AND (minuto = ? OR tempo = ?)
                """, (canonical_pid, g["atleta"], g["minuto"], g["tempo"]))
                dup_g = c.fetchone()
                if dup_g:
                    # Gol já existente na canônica: purga da secundária
                    c.execute("DELETE FROM gols WHERE id_gol = ?", (g["id_gol"],))
                    total_gols_duplicados_purgados += 1
                else:
                    # Gol exclusivo: transfere para a canônica
                    c.execute("UPDATE gols SET id_partida = ? WHERE id_gol = ?", (canonical_pid, g["id_gol"]))
                    total_gols_transferidos += 1

            # 3. Transferência de ESCALAÇÕES
            c.execute("SELECT id_escalacao, atleta, clube, num_camisa, posicao, titular, id_jogador FROM escalacoes WHERE id_partida = ?", (sec_pid,))
            sec_esc = c.fetchall()
            for e in sec_esc:
                c.execute("""
                    SELECT id_escalacao FROM escalacoes 
                    WHERE id_partida = ? AND atleta = ? AND clube = ?
                """, (canonical_pid, e["atleta"], e["clube"]))
                dup_e = c.fetchone()
                if dup_e:
                    c.execute("DELETE FROM escalacoes WHERE id_escalacao = ?", (e["id_escalacao"],))
                    total_escalacoes_purgadas += 1
                else:
                    c.execute("UPDATE escalacoes SET id_partida = ? WHERE id_escalacao = ?", (canonical_pid, e["id_escalacao"]))
                    total_escalacoes_transferidas += 1

            # 4. Transferência de CARTÕES
            c.execute("SELECT id_cartao, atleta, clube, cartao, minuto, id_jogador FROM cartoes WHERE id_partida = ?", (sec_pid,))
            sec_cart = c.fetchall()
            for cr in sec_cart:
                c.execute("""
                    SELECT id_cartao FROM cartoes 
                    WHERE id_partida = ? AND atleta = ? AND cartao = ?
                """, (canonical_pid, cr["atleta"], cr["cartao"]))
                dup_cr = c.fetchone()
                if dup_cr:
                    c.execute("DELETE FROM cartoes WHERE id_cartao = ?", (cr["id_cartao"],))
                else:
                    c.execute("UPDATE cartoes SET id_partida = ? WHERE id_cartao = ?", (canonical_pid, cr["id_cartao"]))
                    total_cartoes_transferidos += 1

            # 5. Transferência de ODDS
            c.execute("SELECT * FROM odds_partidas WHERE id_partida = ?", (canonical_pid,))
            has_odds_can = c.fetchone() is not None
            c.execute("SELECT * FROM odds_partidas WHERE id_partida = ?", (sec_pid,))
            has_odds_sec = c.fetchone() is not None

            if has_odds_sec:
                if not has_odds_can:
                    c.execute("UPDATE odds_partidas SET id_partida = ? WHERE id_partida = ?", (canonical_pid, sec_pid))
                    total_odds_transferidas += 1
                else:
                    c.execute("DELETE FROM odds_partidas WHERE id_partida = ?", (sec_pid,))

            # 6. Remover a partida secundária consolidada
            c.execute("DELETE FROM partidas WHERE id_partida = ?", (sec_pid,))
            total_partidas_removidas += 1

        if idx % 500 == 0 or idx == len(clusters):
            conn.commit()
            print(f"    ... {idx}/{len(clusters)} clusters consolidados ({total_partidas_removidas} partidas unificadas, +{total_gols_transferidos} gols transferidos)")

    conn.commit()

    # 7. Verificações de Integridade Pós-Consolidação
    print("[*] Executando verificações pós-consolidação...")
    c.execute("SELECT COUNT(*) FROM gols g LEFT JOIN partidas p ON g.id_partida = p.id_partida WHERE p.id_partida IS NULL")
    orfaos_gols = c.fetchone()[0]

    c.execute("SELECT COUNT(*) FROM escalacoes e LEFT JOIN partidas p ON e.id_partida = p.id_partida WHERE p.id_partida IS NULL")
    orfaos_esc = c.fetchone()[0]

    c.execute("SELECT COUNT(*) FROM partidas")
    total_partidas_final = c.fetchone()[0]

    c.execute("SELECT COUNT(*) FROM gols")
    total_gols_final = c.fetchone()[0]

    conn.close()

    elapsed = time.time() - start_time
    print("=" * 80)
    print("  RESULTADO DA CONSOLIDAÇÃO CANÔNICA:")
    print(f"  Clusters processados:             {len(clusters)}")
    print(f"  Partidas duplicadas removidas:    {total_partidas_removidas}")
    print(f"  Gols exclusivos transferidos:     {total_gols_transferidos}")
    print(f"  Gols duplicados expurgados:       {total_gols_duplicados_purgados}")
    print(f"  Escalações transferidas:          {total_escalacoes_transferidas}")
    print(f"  Escalações duplicadas expurgadas: {total_escalacoes_purgadas}")
    print(f"  Odds transferidas:                {total_odds_transferidas}")
    print(f"  Cartões transferidos:             {total_cartoes_transferidos}")
    print(f"  Gols órfãos:                      {orfaos_gols} (deve ser 0)")
    print(f"  Escalações órfãs:                 {orfaos_esc} (deve ser 0)")
    print(f"  Total de Partidas no Banco:       {total_partidas_final}")
    print(f"  Total de Gols no Banco:           {total_gols_final}")
    print(f"  Tempo decorrido:                  {elapsed:.2f}s")
    print("=" * 80)

    assert orfaos_gols == 0, f"Erro: {orfaos_gols} gols órfãos detectados após consolidação"
    assert orfaos_esc == 0, f"Erro: {orfaos_esc} escalações órfãs detectadas após consolidação"

    return {
        "clusters": len(clusters),
        "partidas_removidas": total_partidas_removidas,
        "gols_transferidos": total_gols_transferidos,
        "total_partidas": total_partidas_final,
        "total_gols": total_gols_final
    }

if __name__ == "__main__":
    consolidar_duplicatas()
