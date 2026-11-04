#!/usr/bin/env python3
"""
scripts/sanear_dados_jogadores_canonica.py
-----------------------------------------
Higienização canônica e correção de anomalias relacionais de atletas com auditoria estrita.
Foco: Giorgian De Arrascaeta (ID 8) e Paulo Baier (ID 11046).

Políticas rígidas aplicadas (docs/GOVERNANCA_E_DIRETRIZES_VM.md & Karpathy Guidelines):
1. Transações atômicas com rollback em caso de falha.
2. Não destrutivo: re-atribuição ao clube correto ao invés de deleção cega.
3. Correção de dados biográficos oficiais (idade, data de nascimento, situação ativa).
4. Sincronização estrita entre tabelas `gols`, `escalacoes`, `jogadores` e `jogadores_estatisticas`.
"""

import os
import sys
import sqlite3

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DB_PATH = os.path.join(BASE_DIR, "data", "futebol.db")

def sanear_arrascaeta(conn):
    cur = conn.cursor()
    print(">>> [1/2] Saneando dados de Giorgian De Arrascaeta (ID 8)...")
    
    # 1. Gol 64128 na partida 20185094 (Cruzeiro x Athletico-PR): Arrascaeta marcou pelo Cruzeiro
    cur.execute("""
        UPDATE gols 
        SET clube = 'Cruzeiro' 
        WHERE id_jogador = 8 AND clube = 'Athletico-PR' AND id_partida = 20185094;
    """)
    print(f"  • Gols reatribuídos de Athletico-PR -> Cruzeiro: {cur.rowcount}")

    # 2. Escalação 188359 na partida 20185094: Arrascaeta jogou pelo Cruzeiro
    cur.execute("""
        UPDATE escalacoes 
        SET clube = 'Cruzeiro' 
        WHERE id_jogador = 8 AND clube = 'Athletico-PR' AND id_partida = 20185094;
    """)
    print(f"  • Escalações reatribuídas de Athletico-PR -> Cruzeiro: {cur.rowcount}")

    # 3. Escalação 187840 na partida 20165156 (Corinthians x Cruzeiro): Arrascaeta jogou pelo Cruzeiro
    cur.execute("""
        UPDATE escalacoes 
        SET clube = 'Cruzeiro' 
        WHERE id_jogador = 8 AND clube = 'Corinthians' AND id_partida = 20165156;
    """)
    print(f"  • Escalações reatribuídas de Corinthians -> Cruzeiro: {cur.rowcount}")

    # 4. Gol 75754 na partida 20147116 (Defensor Sp. x The Strongest): Arrascaeta marcou pelo Defensor Sp.
    cur.execute("""
        UPDATE gols 
        SET clube = (SELECT mandante FROM partidas WHERE id_partida = 20147116)
        WHERE id_jogador = 8 AND id_partida = 20147116;
    """)
    print(f"  • Gols reatribuídos de The Strongest -> Defensor Sp.: {cur.rowcount}")

    # 5. Dissociar qualquer escalação espúria restante fora dos clubes canônicos
    cur.execute("""
        UPDATE escalacoes 
        SET id_jogador = NULL 
        WHERE id_jogador = 8 AND clube NOT IN ('Cruzeiro', 'Flamengo', 'Defensor Sporting');
    """)
    if cur.rowcount > 0:
        print(f"  • Escalações espúrias dissociadas de Arrascaeta: {cur.rowcount}")

    # 6. Atualizar metadados biográficos e clubes canônicos em jogadores_estatisticas
    clubes_can_arrascaeta = "Flamengo, Cruzeiro, Defensor Sporting"
    cur.execute("""
        UPDATE jogadores_estatisticas
        SET data_nascimento = '1994-06-01',
            idade = 31,
            situacao = 'Em atividade',
            clubes = ?
        WHERE id_jogador = 8;
    """, (clubes_can_arrascaeta,))
    print("  • Metadados biográficos de Arrascaeta corrigidos (Nasc: 01/06/1994, Idade: 31, Situação: Em atividade).")

    # 7. Sincronizar tabela jogadores
    cur.execute("""
        UPDATE jogadores
        SET clubes = ?,
            ano_fim = 2026
        WHERE id_jogador = 8;
    """, (clubes_can_arrascaeta,))
    print(f"  • Tabela jogadores sincronizada para Arrascaeta: '{clubes_can_arrascaeta}'.")

def sanear_paulo_baier(conn):
    cur = conn.cursor()
    print("\n>>> [2/2] Saneando dados de Paulo Baier (ID 11046)...")

    # 1. Re-atribuir gols com clube invertido em partidas do Atlético-MG
    # Partida 3245 (Flamengo x Atlético-MG): Baier marcou pelo Atlético-MG
    cur.execute("""
        UPDATE gols 
        SET clube = 'Atlético-MG' 
        WHERE id_jogador = 11046 AND clube = 'Flamengo' AND id_partida = 3245;
    """)
    print(f"  • Gols reatribuídos de Flamengo -> Atlético-MG: {cur.rowcount}")

    # Partidas 3077 e 202521339: Atlético 0 x 3 Corinthians (Baier não marcou, jogo 0x3)
    cur.execute("DELETE FROM gols WHERE id_gol IN (20300547, 20333277);")
    print(f"  • Gols fantasmas removidos de partidas 0x3: {cur.rowcount}")

    cur.execute("DELETE FROM escalacoes WHERE id_jogador = 11046 AND id_partida = 3077;")
    print(f"  • Escalações espúrias removidas da partida 3077: {cur.rowcount}")

    # 2. Unificar homônimo fantasma Paulo Baier 90+ (ID 11047)
    cur.execute("SELECT count(*) FROM gols WHERE id_jogador = 11047;")
    gols_hom = cur.fetchone()[0]
    if gols_hom > 0:
        cur.execute("UPDATE gols SET id_jogador = 11046, atleta = 'Paulo Baier' WHERE id_jogador = 11047;")
        print(f"  • Gols de homônimo 'Paulo Baier 90+' unificados ao ID 11046: {cur.rowcount}")

    cur.execute("SELECT count(*) FROM escalacoes WHERE id_jogador = 11047;")
    esc_hom = cur.fetchone()[0]
    if esc_hom > 0:
        cur.execute("UPDATE escalacoes SET id_jogador = 11046, atleta = 'Paulo Baier' WHERE id_jogador = 11047;")
        print(f"  • Escalações de homônimo 'Paulo Baier 90+' unificadas ao ID 11046: {cur.rowcount}")
    
    cur.execute("DELETE FROM jogadores_estatisticas WHERE id_jogador = 11047;")
    if cur.rowcount > 0:
        print("  • Perfil fantasma 'Paulo Baier 90+' removido de jogadores_estatisticas.")

    # 3. Dissociar escalações espúrias de clubes onde Baier nunca jogou (Flamengo, Corinthians, etc.)
    clubes_can_baier = [
        "Criciúma", "Athletico-PR", "Goiás", "Palmeiras", "Atlético-MG", 
        "Sport", "Botafogo", "América-MG", "São Paulo", "Ponte Preta", "Santos", "Ypiranga-RS"
    ]
    cur.execute("""
        UPDATE escalacoes 
        SET id_jogador = NULL 
        WHERE id_jogador = 11046 AND clube NOT IN (
            'Criciúma', 'Athletico-PR', 'Goiás', 'Goiás EC', 'Palmeiras', 'Atlético-MG', 'Atlético', 'Atlético-PR',
            'Sport', 'Botafogo', 'América-MG', 'São Paulo', 'Ponte Preta', 'Santos', 'Ypiranga', 'Ypiranga-RS', 'Atlético-GO'
        );
    """)
    if cur.rowcount > 0:
        print(f"  • Escalações espúrias dissociadas de Paulo Baier: {cur.rowcount}")

    # 4. Normalizar lista canônica e limpa de clubes em jogadores_estatisticas
    clubes_baier_str = ", ".join(clubes_can_baier)
    cur.execute("""
        UPDATE jogadores_estatisticas
        SET clubes = ?
        WHERE id_jogador = 11046;
    """, (clubes_baier_str,))
    print(f"  • Clubes de Paulo Baier normalizados: {clubes_baier_str}")

    # 5. Garantir que Paulo Baier existe na tabela jogadores
    cur.execute("SELECT count(*) FROM jogadores WHERE id_jogador = 11046;")
    if cur.fetchone()[0] == 0:
        cur.execute("""
            INSERT INTO jogadores (
                id_jogador, nome_exibicao, nome_completo, posicao, clubes, 
                ano_inicio, ano_fim, total_jogos, total_gols
            ) VALUES (
                11046, 'Paulo Baier', 'Paulo César Baier', 'Meio-campo', ?,
                1995, 2016, 189, 158
            );
        """, (clubes_baier_str,))
        print("  • Registro de Paulo Baier inserido na tabela jogadores.")
    else:
        cur.execute("UPDATE jogadores SET clubes = ? WHERE id_jogador = 11046;", (clubes_baier_str,))

def main():
    print("=" * 70)
    print("   HIGIENIZAÇÃO CANÔNICA DE DADOS RELACIONAIS (SQL AUDIT)")
    print("=" * 70)
    conn = sqlite3.connect(DB_PATH, timeout=60.0)
    conn.execute("PRAGMA busy_timeout = 60000;")
    conn.execute("PRAGMA foreign_keys = ON;")

    try:
        conn.execute("BEGIN TRANSACTION;")
        sanear_arrascaeta(conn)
        sanear_paulo_baier(conn)
        conn.commit()
        print("\n✅ Transação SQL confirmada com sucesso (COMMIT)!")
    except Exception as e:
        conn.rollback()
        print(f"\n❌ ERRO durante a execução. Rollback realizado: {e}")
        sys.exit(1)
    finally:
        conn.close()

if __name__ == "__main__":
    main()
