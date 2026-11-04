#!/usr/bin/env python3
"""
scripts/motor_limpeza_banco_universal.py
---------------------------------------
Motor de Higienização e Auto-Cura Universal do Banco de Dados SQLite (FutStats).
Projetado para execução programática, agendada (cron noturno) ou sob demanda via Telegram (/sanear).

Diretrizes Estritas (docs/GOVERNANCA_E_DIRETRIZES_VM.md):
1. Invariante Anti-Data-Loss: Zero destruição cega; reatribuição e unificação relacional.
2. Transações Atômicas: BEGIN TRANSACTION com ROLLBACK integral em falha.
3. Respeito ao teto de 94 MB (Vercel) e consumo mínimo de RAM na VM Oracle.
"""

import os
import re
import sys
import json
import sqlite3
import datetime

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DB_PATH = os.path.join(BASE_DIR, "data", "futebol.db")

CLUBES_CANONICOS_PROTEGIDOS = {
    10: ["Flamengo", "Fluminense"],
    7: ["Santos", "Flamengo", "Cruzeiro"],
    8: ["Flamengo", "Cruzeiro", "Defensor Sporting"],
    11046: ["Criciúma", "Athletico-PR", "Goiás", "Palmeiras", "Atlético-MG", "Sport", "Botafogo", "América-MG", "São Paulo", "Ponte Preta", "Santos", "Ypiranga-RS"],
}

def executar_limpeza_universal(caminho_db=DB_PATH):
    """Executa a varredura completa e higienização em lote com retorno estatístico estruturado."""
    resultado = {
        "timestamp": datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "total_partidas": 0,
        "total_gols": 0,
        "homonimos_minutos_unificados": 0,
        "gols_invertidos_reatribuidos": 0,
        "escalacoes_reatribuidas": 0,
        "clubes_canonicos_blindados": len(CLUBES_CANONICOS_PROTEGIDOS),
        "db_size_mb": 0.0,
        "status": "SUCESSO",
        "detalhes": []
    }

    conn = sqlite3.connect(caminho_db, timeout=60.0)
    conn.execute("PRAGMA busy_timeout = 60000;")
    conn.execute("PRAGMA foreign_keys = ON;")
    cur = conn.cursor()

    try:
        conn.execute("BEGIN TRANSACTION;")

        # 1. Totalizadores
        cur.execute("SELECT count(*) FROM partidas;")
        resultado["total_partidas"] = cur.fetchone()[0]

        cur.execute("SELECT count(*) FROM gols;")
        resultado["total_gols"] = cur.fetchone()[0]

        # -------------------------------------------------------------
        # FASE 1: Unificação de Perfis Fantasmas com Minutos (ex: '90+', '45+')
        # -------------------------------------------------------------
        cur.execute("SELECT id_jogador, nome_exibicao FROM jogadores_estatisticas WHERE nome_exibicao LIKE '%+%';")
        perfis_minutos = cur.fetchall()
        unificados_cnt = 0

        for ghost_id, nome_fantasma in perfis_minutos:
            nome_limpo = re.sub(r'\s*\d+\+.*$', '', nome_fantasma).strip()
            if not nome_limpo:
                continue

            # Buscar perfil canônico real
            cur.execute("""
                SELECT id_jogador FROM jogadores_estatisticas 
                WHERE nome_exibicao = ? AND id_jogador != ? 
                ORDER BY total_gols DESC LIMIT 1;
            """, (nome_limpo, ghost_id))
            real_row = cur.fetchone()

            if real_row:
                real_id = real_row[0]
                # Migrar gols e escalações para o perfil real
                cur.execute("UPDATE gols SET id_jogador = ?, atleta = ? WHERE id_jogador = ?;", (real_id, nome_limpo, ghost_id))
                cur.execute("UPDATE escalacoes SET id_jogador = ?, atleta = ? WHERE id_jogador = ?;", (real_id, nome_limpo, ghost_id))
                cur.execute("DELETE FROM jogadores_estatisticas WHERE id_jogador = ?;", (ghost_id,))
                
                # Recalcular gols do perfil real
                cur.execute("""
                    UPDATE jogadores_estatisticas 
                    SET total_gols = (SELECT count(*) FROM gols WHERE id_jogador = ?) 
                    WHERE id_jogador = ?;
                """, (real_id, real_id))
                unificados_cnt += 1
            else:
                # Se não houver outro perfil, limpa o nome do atual
                cur.execute("UPDATE jogadores_estatisticas SET nome_exibicao = ? WHERE id_jogador = ?;", (nome_limpo, ghost_id))
                cur.execute("UPDATE gols SET atleta = ? WHERE id_jogador = ?;", (nome_limpo, ghost_id))
                cur.execute("UPDATE escalacoes SET atleta = ? WHERE id_jogador = ?;", (nome_limpo, ghost_id))
                unificados_cnt += 1

        resultado["homonimos_minutos_unificados"] = unificados_cnt

        # -------------------------------------------------------------
        # FASE 2: Reatribuição de Gols em Partidas Invertidas (Anti-Placar Zero)
        # -------------------------------------------------------------
        # Detecta gols não-contra onde o clube associado marcou zero gols, mas o adversário pontuou
        cur.execute("""
            SELECT g.id_gol, g.id_partida, g.clube, p.mandante, p.visitante, p.gols_mandante, p.gols_visitante
            FROM gols g
            JOIN partidas p ON g.id_partida = p.id_partida
            WHERE (g.tipo_de_gol IS NULL OR lower(g.tipo_de_gol) NOT LIKE '%contra%')
              AND (
                  (g.clube = p.mandante AND p.gols_mandante = 0 AND p.gols_visitante > 0)
                  OR
                  (g.clube = p.visitante AND p.gols_visitante = 0 AND p.gols_mandante > 0)
              );
        """)
        gols_invertidos = cur.fetchall()
        reatribuidos_cnt = 0

        for gid, pid, clb, mand, vis, gm, gv in gols_invertidos:
            # Se estava atribuído ao mandante com 0 gols, o correto é o visitante que marcou
            novo_clube = vis if (clb == mand and gm == 0) else (mand if (clb == vis and gv == 0) else None)
            if novo_clube:
                cur.execute("UPDATE gols SET clube = ? WHERE id_gol = ?;", (novo_clube, gid))
                reatribuidos_cnt += 1

        resultado["gols_invertidos_reatribuidos"] = reatribuidos_cnt

        # -------------------------------------------------------------
        # FASE 3: Proteção Estrita dos Clubes Canônicos dos Grandes Atletas
        # -------------------------------------------------------------
        for jid, clubes_validos in CLUBES_CANONICOS_PROTEGIDOS.items():
            clubes_str = ", ".join(clubes_validos)
            placeholders = ",".join("?" for _ in clubes_validos)

            # Dissociar escalações fora do escopo canônico
            cur.execute(f"""
                UPDATE escalacoes 
                SET id_jogador = NULL 
                WHERE id_jogador = ? AND clube NOT IN ({placeholders});
            """, [jid] + clubes_validos)
            if cur.rowcount > 0:
                resultado["escalacoes_reatribuidas"] += cur.rowcount

            # Garantir sincronização na tabela mestre de estatísticas
            cur.execute("UPDATE jogadores_estatisticas SET clubes = ? WHERE id_jogador = ?;", (clubes_str, jid))
            cur.execute("UPDATE jogadores SET clubes = ? WHERE id_jogador = ?;", (clubes_str, jid))

        # -------------------------------------------------------------
        # FASE 4: Correções Específicas de Sanidade Biográfica e de Carreira
        # -------------------------------------------------------------
        # Reconciliação de total_jogos com piso da carreira oficial
        cur.execute("""
            UPDATE jogadores_estatisticas
            SET total_jogos = MAX(COALESCE(jogos_carreira_oficiais, total_jogos), total_gols)
            WHERE total_jogos <= total_gols AND jogos_carreira_oficiais > total_gols;
        """)

        # Arrascaeta (ID 8)
        cur.execute("""
            UPDATE jogadores_estatisticas
            SET data_nascimento = '1994-06-01', idade = 31, situacao = 'Em atividade'
            WHERE id_jogador = 8;
        """)

        # Pedro (ID 10) e Gabigol (ID 7)
        cur.execute("UPDATE jogadores_estatisticas SET situacao = 'Em atividade' WHERE id_jogador IN (7, 10);")

        conn.commit()

        # Medição final de tamanho do banco
        if os.path.exists(caminho_db):
            resultado["db_size_mb"] = round(os.path.getsize(caminho_db) / (1024 * 1024), 2)

    except Exception as e:
        conn.rollback()
        resultado["status"] = "FALHA"
        resultado["detalhes"].append(str(e))
    finally:
        conn.close()

    return resultado

if __name__ == "__main__":
    print("=" * 70)
    print("   MOTOR UNIVERSAL DE HIGIENIZAÇÃO SQL (FUTSTATS)")
    print("=" * 70)
    res = executar_limpeza_universal()
    print(json.dumps(res, indent=2, ensure_ascii=False))
