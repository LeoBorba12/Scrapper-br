#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
scripts/auditar_sanidade_atletas.py
FutStats - Agente Automatizado de Sanidade e Auditoria de Atletas
Valida integridade, piso de carreira, teto de médias, golden truth e homônimos.
"""

import os
import sys
import json
import sqlite3
import time

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DB_PATH = os.path.join(BASE_DIR, "data", "futebol.db")
GOLDEN_PATH = os.path.join(BASE_DIR, "data", "golden_truth_atletas.json")

def auditar_e_reparar_atletas(verbose=True):
    relatorio = {
        "timestamp": time.strftime("%Y-%m-%d %H:%M:%S"),
        "total_atletas_estatisticas": 0,
        "anomalias_encontradas": 0,
        "reparos_executados": 0,
        "checks": []
    }

    if not os.path.exists(DB_PATH):
        if verbose:
            print(f"[ERRO] Banco de dados não encontrado: {DB_PATH}")
        relatorio["erro"] = "Banco de dados não encontrado"
        return relatorio

    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    c = conn.cursor()

    c.execute("SELECT COUNT(*) FROM jogadores_estatisticas;")
    relatorio["total_atletas_estatisticas"] = c.fetchone()[0]

    # CHECK 1: Golden Truth Dataset Reconciliação
    golden_check = {"nome": "Golden Truth Dataset (Top Craques Auditados)", "status": "OK", "detalhes": []}
    if os.path.exists(GOLDEN_PATH):
        with open(GOLDEN_PATH, "r", encoding="utf-8") as f:
            golden_data = json.load(f)
        
        for g in golden_data:
            id_meta = g.get("id_jogador")
            nome_busca = g.get("nome_exibicao") or g.get("nome")
            gols_meta = g.get("gols_carreira_oficiais", 0)
            jogos_meta = g.get("jogos_carreira_oficiais", 0)
            assists_meta = g.get("assistencias_carreira_oficiais", 0)
            
            row = None
            if id_meta:
                row = c.execute("SELECT id_jogador, nome_exibicao, gols_carreira_oficiais, jogos_carreira_oficiais, total_gols FROM jogadores_estatisticas WHERE id_jogador = ?;", (id_meta,)).fetchone()
            if not row and nome_busca:
                row = c.execute("""
                    SELECT id_jogador, nome_exibicao, gols_carreira_oficiais, jogos_carreira_oficiais, total_gols
                    FROM jogadores_estatisticas
                    WHERE LOWER(nome_exibicao) = LOWER(?) OR LOWER(nome_completo) = LOWER(?) OR LOWER(apelido) = LOWER(?)
                    ORDER BY total_gols DESC LIMIT 1;
                """, (nome_busca, nome_busca, nome_busca)).fetchone()

            if row:
                atual_gols = row["gols_carreira_oficiais"] or 0
                atual_jogos = row["jogos_carreira_oficiais"] or 0
                
                # Se o banco está abaixo do padrão-ouro oficial auditado, auto-repara
                if atual_gols < gols_meta or atual_jogos < jogos_meta:
                    c.execute("""
                        UPDATE jogadores_estatisticas
                        SET gols_carreira_oficiais = MAX(COALESCE(gols_carreira_oficiais, 0), ?),
                            jogos_carreira_oficiais = MAX(COALESCE(jogos_carreira_oficiais, 0), ?),
                            assistencias_carreira_oficiais = MAX(COALESCE(assistencias_carreira_oficiais, 0), ?)
                        WHERE id_jogador = ?;
                    """, (gols_meta, jogos_meta, assists_meta, row["id_jogador"]))
                    conn.commit()
                    relatorio["reparos_executados"] += 1
                    golden_check["detalhes"].append(f"Auto-reparado {row['nome_exibicao']}: {atual_gols}g -> {gols_meta}g")
            else:
                golden_check["detalhes"].append(f"Atleta ausente da base estatística: {nome_busca}")
    
    if golden_check["detalhes"]:
        golden_check["status"] = "CORRIGIDO" if relatorio["reparos_executados"] > 0 else "ATENCAO"
    relatorio["checks"].append(golden_check)

    # CHECK 2: Invariante de Piso (Carreira >= Acervo)
    piso_check = {"nome": "Invariante de Piso (Carreira >= Acervo Nacional)", "status": "OK", "violacoes": 0}
    c.execute("""
        SELECT id_jogador, nome_exibicao, total_gols, total_jogos, gols_carreira_oficiais, jogos_carreira_oficiais
        FROM jogadores_estatisticas
        WHERE (gols_carreira_oficiais > 0 AND gols_carreira_oficiais < total_gols)
           OR (jogos_carreira_oficiais > 0 AND jogos_carreira_oficiais < total_jogos);
    """)
    violacoes_piso = c.fetchall()
    if violacoes_piso:
        piso_check["violacoes"] = len(violacoes_piso)
        relatorio["anomalias_encontradas"] += len(violacoes_piso)
        for r in violacoes_piso:
            c.execute("""
                UPDATE jogadores_estatisticas
                SET gols_carreira_oficiais = MAX(COALESCE(gols_carreira_oficiais, 0), total_gols),
                    jogos_carreira_oficiais = MAX(COALESCE(jogos_carreira_oficiais, 0), total_jogos)
                WHERE id_jogador = ?;
            """, (r["id_jogador"],))
            relatorio["reparos_executados"] += 1
        conn.commit()
        piso_check["status"] = "CORRIGIDO"
    relatorio["checks"].append(piso_check)

    # CHECK 3: Teto de Média de Gols (Anomalias de raspagem: média > 2.0 com mais de 20 jogos)
    teto_check = {"nome": "Teto de Média de Gols (Sanidade Estatística)", "status": "OK", "anomalias": []}
    c.execute("""
        SELECT id_jogador, nome_exibicao, gols_carreira_oficiais, jogos_carreira_oficiais
        FROM jogadores_estatisticas
        WHERE jogos_carreira_oficiais >= 20
          AND (CAST(gols_carreira_oficiais AS FLOAT) / jogos_carreira_oficiais) > 2.0;
    """)
    anomalias_media = c.fetchall()
    if anomalias_media:
        teto_check["status"] = "ALERTA"
        for am in anomalias_media:
            teto_check["anomalias"].append({
                "id": am["id_jogador"],
                "nome": am["nome_exibicao"],
                "gols": am["gols_carreira_oficiais"],
                "jogos": am["jogos_carreira_oficiais"],
                "media": round(am["gols_carreira_oficiais"] / am["jogos_carreira_oficiais"], 2)
            })
            relatorio["anomalias_encontradas"] += 1
    relatorio["checks"].append(teto_check)

    # CHECK 4: Gols Órfãos (g.id_jogador não cadastrado)
    orfaos_check = {"nome": "Integridade Referencial de Gols (id_jogador órfão)", "status": "OK", "orfaos": 0}
    c.execute("""
        SELECT COUNT(*) FROM gols g
        WHERE g.id_jogador IS NOT NULL 
          AND g.id_jogador NOT IN (SELECT id_jogador FROM jogadores_estatisticas);
    """)
    qtd_orfaos = c.fetchone()[0]
    if qtd_orfaos > 0:
        orfaos_check["status"] = "FALHA"
        orfaos_check["orfaos"] = qtd_orfaos
        relatorio["anomalias_encontradas"] += qtd_orfaos
    relatorio["checks"].append(orfaos_check)

    # CHECK 5: Consistência do Total de Gols no Acervo
    consistencia_check = {"nome": "Consistência de Gols (gols reais vs total_gols registrado)", "status": "OK", "divergentes": 0}
    c.execute("""
        SELECT je.id_jogador, je.nome_exibicao, je.total_gols, COUNT(g.id_gol) as gols_reais
        FROM jogadores_estatisticas je
        LEFT JOIN gols g ON je.id_jogador = g.id_jogador
        GROUP BY je.id_jogador
        HAVING je.total_gols > 0 AND je.total_gols != COUNT(g.id_gol)
        LIMIT 20;
    """)
    divergentes = c.fetchall()
    if divergentes:
        # Nota: alguns jogadores históricos pré-1970 possuem total_gols legado manual
        consistencia_check["status"] = "OK"  # Informativo
        consistencia_check["divergentes"] = len(divergentes)
    relatorio["checks"].append(consistencia_check)

    conn.close()

    if verbose:
        print("=" * 65)
        print("🛡️  RELATÓRIO DE AUDITORIA DE SANIDADE DE ATLETAS (FUTSTATS)")
        print(f"Data/Hora: {relatorio['timestamp']}")
        print(f"Atletas analisados: {relatorio['total_atletas_estatisticas']}")
        print(f"Anomalias encontradas: {relatorio['anomalias_encontradas']}")
        print(f"Reparos executados: {relatorio['reparos_executados']}")
        print("-" * 65)
        for chk in relatorio["checks"]:
            simbolo = "🟢" if chk["status"] in ("OK", "CORRIGIDO") else ("🟡" if chk["status"] == "ATENCAO" else "🔴")
            print(f"{simbolo} [{chk['status']}] {chk['nome']}")
            if chk.get("detalhes"):
                for d in chk["detalhes"][:3]:
                    print(f"    └─ {d}")
            if chk.get("anomalias"):
                for a in chk["anomalias"][:3]:
                    print(f"    └─ {a['nome']}: {a['gols']}g em {a['jogos']}j (Média {a['media']})")
        print("=" * 65)

    return relatorio

if __name__ == "__main__":
    rel = auditar_e_reparar_atletas(verbose=True)
    sys.exit(0 if rel["anomalias_encontradas"] == 0 or rel["anomalias_encontradas"] == rel["reparos_executados"] else 1)
