#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
sanitizar_confrontos_duplicados.py
===================================
Localiza e consolida com precisão cirúrgica os 229 confrontos que possuem registros
duplicados na mesma data no acervo histórico (data/futebol.db).

Garante integridade relacional total:
1. Identifica a partida canônica com maior completude (gols, escalações, metadados).
2. Transfere gols únicos da partida secundária para a canônica sem perda de acervo.
3. Remove gols e escalações exatamente duplicados da mesma súmula.
4. Transfere odds e metadados faltantes (estádio, árbitro, rodada).
5. Remove o registro excedente na tabela partidas.
6. Atualiza o banco com PRAGMA foreign_key_check e PRAGMA optimize.
"""

import os
import sys
import sqlite3
import datetime

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')
if hasattr(sys.stderr, 'reconfigure'):
    sys.stderr.reconfigure(encoding='utf-8', errors='replace')

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DB_PATH = os.path.join(BASE_DIR, "data", "futebol.db")

def conectar_db():
    conn = sqlite3.connect(DB_PATH)
    conn.execute("PRAGMA journal_mode = WAL;")
    conn.execute("PRAGMA synchronous = NORMAL;")
    conn.execute("PRAGMA foreign_keys = ON;")
    return conn

def sanitizar_duplicadas():
    print("=" * 75)
    print("  CONSOLIDAÇÃO E SANEAMENTO DE CONFRONTOS HISTÓRICOS DUPLICADOS")
    print(f"  Iniciando processamento em: {DB_PATH}")
    print(f"  Horário: {datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 75)

    conn = conectar_db()
    c = conn.cursor()

    c.execute("""
        SELECT mandante, visitante, data, GROUP_CONCAT(id_partida)
        FROM partidas
        WHERE data IS NOT NULL AND mandante IS NOT NULL AND visitante IS NOT NULL
        GROUP BY mandante, visitante, data
        HAVING COUNT(*) > 1;
    """)
    grupos = c.fetchall()

    if not grupos:
        print("[OK] Nenhuma partida duplicada encontrada no acervo. Banco 100% íntegro!")
        conn.close()
        return

    print(f"[*] Encontrados {len(grupos)} grupos de partidas duplicadas para consolidação.\n")

    partidas_removidas = 0
    gols_transferidos = 0
    gols_duplicados_purgados = 0
    odds_transferidas = 0
    odds_duplicadas_purgadas = 0

    for idx, (mandante, visitante, data_jogo, id_list_str) in enumerate(grupos, 1):
        pids = [int(x) for x in id_list_str.split(',') if x.strip()]
        if len(pids) < 2:
            continue

        # Avaliar score de cada partida para eleger a canônica
        scores = []
        for pid in pids:
            c.execute("SELECT COUNT(*) FROM gols WHERE id_partida = ?;", (pid,))
            cnt_g = c.fetchone()[0]

            c.execute("SELECT COUNT(*) FROM escalacoes WHERE id_partida = ?;", (pid,))
            cnt_e = c.fetchone()[0]

            c.execute("SELECT COUNT(*) FROM cartoes WHERE id_partida = ?;", (pid,))
            cnt_cr = c.fetchone()[0]

            c.execute("SELECT COUNT(*) FROM odds_partidas WHERE id_partida = ?;", (pid,))
            cnt_o = c.fetchone()[0]

            c.execute("""
                SELECT gols_mandante, gols_visitante, placar, estadio, arbitro, rodada, publico, cidade, estado, horario
                FROM partidas WHERE id_partida = ?;
            """, (pid,))
            meta_row = c.fetchone()
            meta_count = sum(1 for v in meta_row if v is not None and str(v).strip() != "")

            # Score ponderado: gols > escalações > cartões > odds > metadados
            total_score = cnt_g * 100 + cnt_e * 20 + cnt_cr * 10 + cnt_o * 5 + meta_count
            scores.append((total_score, cnt_g, cnt_e, cnt_cr, cnt_o, meta_row, pid))

        # Ordenar pelo maior score (desempate: menor ID para consistência histórica)
        scores.sort(key=lambda s: (s[0], -s[6]), reverse=True)
        canonical = scores[0]
        can_pid = canonical[6]
        can_meta = canonical[5]
        secundarias = scores[1:]

        # 1. Obter gols existentes na canônica
        c.execute("SELECT atleta, minuto, clube FROM gols WHERE id_partida = ?;", (can_pid,))
        gols_can = set(c.fetchall())

        for sec in secundarias:
            sec_pid = sec[6]
            sec_meta = sec[5]

            # 2. Mesclar metadados se a canônica tiver lacunas
            campos = ['gols_mandante', 'gols_visitante', 'placar', 'estadio', 'arbitro', 'rodada', 'publico', 'cidade', 'estado', 'horario']
            for c_idx, campo in enumerate(campos):
                val_can = can_meta[c_idx] if can_meta else None
                val_sec = sec_meta[c_idx] if sec_meta else None
                if (val_can is None or str(val_can).strip() == "") and (val_sec is not None and str(val_sec).strip() != ""):
                    c.execute(f"UPDATE partidas SET {campo} = ? WHERE id_partida = ?;", (val_sec, can_pid))

            # 3. Tratar gols da partida secundária
            c.execute("SELECT id_gol, atleta, minuto, clube FROM gols WHERE id_partida = ?;", (sec_pid,))
            gols_sec = c.fetchall()

            for gid, atl, min_, clb in gols_sec:
                if (atl, min_, clb) in gols_can:
                    # Gol já registrado na canônica -> purgar duplicata exata
                    c.execute("DELETE FROM gols WHERE id_gol = ?;", (gid,))
                    gols_duplicados_purgados += 1
                else:
                    # Gol novo legítimo -> reassociar à canônica
                    c.execute("UPDATE gols SET id_partida = ? WHERE id_gol = ?;", (can_pid, gid))
                    gols_can.add((atl, min_, clb))
                    gols_transferidos += 1

            # 4. Tratar escalações da partida secundária
            c.execute("SELECT id_escalacao, atleta, clube FROM escalacoes WHERE id_partida = ?;", (sec_pid,))
            esc_sec = c.fetchall()
            for eid, eatl, eclb in esc_sec:
                c.execute("SELECT COUNT(*) FROM escalacoes WHERE id_partida = ? AND atleta = ? AND clube = ?;", (can_pid, eatl, eclb))
                if c.fetchone()[0] > 0:
                    c.execute("DELETE FROM escalacoes WHERE id_escalacao = ?;", (eid,))
                else:
                    c.execute("UPDATE escalacoes SET id_partida = ? WHERE id_escalacao = ?;", (can_pid, eid))

            # 5. Tratar cartões da partida secundária
            c.execute("SELECT id_cartao, atleta, minuto, clube FROM cartoes WHERE id_partida = ?;", (sec_pid,))
            cartoes_sec = c.fetchall()
            for crid, cratl, crmin, crclb in cartoes_sec:
                c.execute("SELECT COUNT(*) FROM cartoes WHERE id_partida = ? AND atleta = ? AND minuto = ?;", (can_pid, cratl, crmin))
                if c.fetchone()[0] > 0:
                    c.execute("DELETE FROM cartoes WHERE id_cartao = ?;", (crid,))
                else:
                    c.execute("UPDATE cartoes SET id_partida = ? WHERE id_cartao = ?;", (can_pid, crid))

            # 6. Tratar odds da partida secundária
            c.execute("SELECT COUNT(*) FROM odds_partidas WHERE id_partida = ?;", (can_pid,))
            can_has_odds = c.fetchone()[0] > 0

            if not can_has_odds:
                c.execute("UPDATE odds_partidas SET id_partida = ? WHERE id_partida = ?;", (can_pid, sec_pid))
                odds_transferidas += c.rowcount
            else:
                c.execute("DELETE FROM odds_partidas WHERE id_partida = ?;", (sec_pid,))
                odds_duplicadas_purgadas += 1

            # 7. Excluir a partida secundária consolidada
            c.execute("DELETE FROM partidas WHERE id_partida = ?;", (sec_pid,))
            partidas_removidas += 1

    conn.commit()

    # Recalcular placares da canônica se necessário
    c.execute("""
        UPDATE partidas
        SET placar = gols_mandante || 'x' || gols_visitante
        WHERE (placar IS NULL OR placar = '') AND gols_mandante IS NOT NULL AND gols_visitante IS NOT NULL;
    """)
    conn.commit()

    # Verificar chaves estrangeiras
    c.execute("PRAGMA foreign_key_check;")
    fk_errors = c.fetchall()
    if fk_errors:
        print(f"[ALERTA]: Erros de foreign key detectados: {fk_errors}")
    else:
        print("[OK] Verificação de integridade referencial: 100% íntegra (ZERO chaves quebradas).")

    # Otimização física do banco SQLite
    conn.execute("PRAGMA optimize;")
    conn.close()

    print("\n" + "=" * 75)
    print("  RESULTADO DA CONSOLIDAÇÃO DOS CONFRONTOS:")
    print(f"  • Grupos duplicados processados: {len(grupos)}")
    print(f"  • Partidas excedentes expurgadas: {partidas_removidas}")
    print(f"  • Gols legítimos resgatados/transferidos: {gols_transferidos}")
    print(f"  • Gols redundantes de súmula purgados: {gols_duplicados_purgados}")
    print(f"  • Odds preservadas na canônica: {odds_transferidas}")
    print("===========================================================================")

if __name__ == "__main__":
    sanitizar_duplicadas()
