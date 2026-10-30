import os
import sqlite3
import json
import time

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DB_PATH = os.path.join(BASE_DIR, "data", "futebol.db")

def auditar_e_reparar_dados():
    """
    Agente Automatizado de Integridade e Sanidade de Dados (FutStats Data Auditor)
    Executa 12 verificações de consistência e auto-reparo no SQLite.
    """
    relatorio = {
        "timestamp": time.strftime("%Y-%m-%d %H:%M:%S"),
        "total_partidas": 0,
        "inconsistencias_encontradas": 0,
        "inconsistencias_reparadas": 0,
        "regras": []
    }

    if not os.path.exists(DB_PATH):
        relatorio["erro"] = f"Banco de dados não encontrado em {DB_PATH}"
        return relatorio

    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()

    # 1. Total Geral
    c.execute("SELECT COUNT(*) FROM partidas;")
    relatorio["total_partidas"] = c.fetchone()[0]

    # Regra 1: Gols nulos com placar existente (Auto-reparo)
    c.execute("""
        SELECT COUNT(*) FROM partidas 
        WHERE (gols_mandante IS NULL OR gols_visitante IS NULL) 
          AND placar IS NOT NULL AND placar LIKE '%x%';
    """)
    nulos = c.fetchone()[0]
    reparados_gols = 0
    if nulos > 0:
        c.execute("""
            UPDATE partidas 
            SET gols_mandante = CAST(TRIM(SUBSTR(placar, 1, INSTR(placar, 'x') - 1)) AS INTEGER),
                gols_visitante = CAST(TRIM(SUBSTR(placar, INSTR(placar, 'x') + 1)) AS INTEGER)
            WHERE (gols_mandante IS NULL OR gols_visitante IS NULL)
              AND placar LIKE '%x%';
        """)
        reparados_gols = c.rowcount
        conn.commit()

    relatorio["regras"].append({
        "regra": "Gols Numéricos Nulos em Partidas Finalizadas",
        "status": "CORRIGIDO" if reparados_gols > 0 else ("OK" if nulos == 0 else "FALHA"),
        "ocorrencias": nulos,
        "reparados": reparados_gols
    })

    # Regra 2: Datas com formato incorreto (deve ser YYYY-MM-DD)
    c.execute("""
        SELECT COUNT(*) FROM partidas 
        WHERE data NOT LIKE '____-__-__%' OR data IS NULL;
    """)
    datas_invalidas = c.fetchone()[0]
    relatorio["regras"].append({
        "regra": "Padronização de Formato de Data (ISO YYYY-MM-DD)",
        "status": "OK" if datas_invalidas == 0 else "FALHA",
        "ocorrencias": datas_invalidas,
        "detalhes": "Todas as datas de partidas devem ter formato ano-mês-dia para filtros e índices."
    })

    # Regra 3: Gols órfãos (sem partida correspondente)
    c.execute("""
        SELECT COUNT(*) FROM gols g 
        LEFT JOIN partidas p ON g.id_partida = p.id_partida 
        WHERE p.id_partida IS NULL;
    """)
    gols_orfaos = c.fetchone()[0]
    relatorio["regras"].append({
        "regra": "Gols Órfãos (Sem Partida)",
        "status": "OK" if gols_orfaos == 0 else "FALHA",
        "ocorrencias": gols_orfaos
    })

    # Regra 4: Odds órfãs (sem partida correspondente)
    c.execute("""
        SELECT COUNT(*) FROM odds_partidas o 
        LEFT JOIN partidas p ON o.id_partida = p.id_partida 
        WHERE p.id_partida IS NULL;
    """)
    odds_orfas = c.fetchone()[0]
    relatorio["regras"].append({
        "regra": "Odds Órfãs (Sem Partida)",
        "status": "OK" if odds_orfas == 0 else "FALHA",
        "ocorrencias": odds_orfas
    })

    # Regra 5: Partidas com clubes vazios, 'Sem Clube' ou artefatos de scraping (Auto-reparo)
    c.execute("""
        SELECT COUNT(*) FROM partidas 
        WHERE mandante IS NULL OR mandante = '' 
           OR visitante IS NULL OR visitante = ''
           OR mandante LIKE '%Estatísticas%' 
           OR visitante LIKE '%Estatísticas%';
    """)
    clubes_invalidos = c.fetchone()[0]
    reparados_clubes = 0
    if clubes_invalidos > 0:
        # 1. Coleta atletas afetados pelas partidas e gols a serem deletados
        c.execute("""
            SELECT DISTINCT id_jogador FROM (
                SELECT id_jogador FROM gols 
                WHERE id_partida IN (
                    SELECT id_partida FROM partidas 
                    WHERE mandante IS NULL OR mandante = '' 
                       OR visitante IS NULL OR visitante = ''
                       OR mandante LIKE '%Estatísticas%' 
                       OR visitante LIKE '%Estatísticas%'
                ) OR clube LIKE '%Estatísticas%'
                UNION
                SELECT id_jogador FROM escalacoes 
                WHERE id_partida IN (
                    SELECT id_partida FROM partidas 
                    WHERE mandante IS NULL OR mandante = '' 
                       OR visitante IS NULL OR visitante = ''
                       OR mandante LIKE '%Estatísticas%' 
                       OR visitante LIKE '%Estatísticas%'
                )
                UNION
                SELECT id_jogador FROM cartoes 
                WHERE id_partida IN (
                    SELECT id_partida FROM partidas 
                    WHERE mandante IS NULL OR mandante = '' 
                       OR visitante IS NULL OR visitante = ''
                       OR mandante LIKE '%Estatísticas%' 
                       OR visitante LIKE '%Estatísticas%'
                )
            ) WHERE id_jogador IS NOT NULL AND id_jogador > 0;
        """)
        atletas_afetados = [row[0] for row in c.fetchall() if row[0]]

        # 2. Deleta dependências e partidas inválidas (garantindo correspondência com o SELECT)
        c.execute("""
            DELETE FROM gols 
            WHERE id_partida IN (
                SELECT id_partida FROM partidas 
                WHERE mandante IS NULL OR mandante = '' 
                   OR visitante IS NULL OR visitante = ''
                   OR mandante LIKE '%Estatísticas%' 
                   OR visitante LIKE '%Estatísticas%'
            ) OR clube LIKE '%Estatísticas%';
        """)
        c.execute("""
            DELETE FROM odds_partidas 
            WHERE id_partida IN (
                SELECT id_partida FROM partidas 
                WHERE mandante IS NULL OR mandante = '' 
                   OR visitante IS NULL OR visitante = ''
                   OR mandante LIKE '%Estatísticas%' 
                   OR visitante LIKE '%Estatísticas%'
            );
        """)
        c.execute("""
            DELETE FROM escalacoes 
            WHERE id_partida IN (
                SELECT id_partida FROM partidas 
                WHERE mandante IS NULL OR mandante = '' 
                   OR visitante IS NULL OR visitante = ''
                   OR mandante LIKE '%Estatísticas%' 
                   OR visitante LIKE '%Estatísticas%'
            );
        """)
        c.execute("""
            DELETE FROM cartoes 
            WHERE id_partida IN (
                SELECT id_partida FROM partidas 
                WHERE mandante IS NULL OR mandante = '' 
                   OR visitante IS NULL OR visitante = ''
                   OR mandante LIKE '%Estatísticas%' 
                   OR visitante LIKE '%Estatísticas%'
            );
        """)
        c.execute("""
            DELETE FROM partidas 
            WHERE mandante IS NULL OR mandante = '' 
               OR visitante IS NULL OR visitante = ''
               OR mandante LIKE '%Estatísticas%' 
               OR visitante LIKE '%Estatísticas%';
        """)
        reparados_clubes = c.rowcount

        # 3. Limpeza de artefatos de scraping na coluna clubes dos atletas
        c.execute("SELECT id_jogador, clubes FROM jogadores_estatisticas WHERE clubes LIKE '%Estatísticas%';")
        for jid, clbs in c.fetchall():
            limpos = [cb.strip() for cb in (clbs or '').split(',') if 'Estatísticas' not in cb and cb.strip()]
            c.execute("UPDATE jogadores_estatisticas SET clubes = ? WHERE id_jogador = ?;", (', '.join(limpos), jid))

        # 4. Ressincronização automática de estatísticas dos atletas afetados
        for aid in atletas_afetados:
            c.execute("SELECT COUNT(*) FROM gols WHERE id_jogador = ?;", (aid,))
            tot_gols = c.fetchone()[0]
            c.execute("""
                SELECT COUNT(DISTINCT id_partida) FROM (
                    SELECT id_partida FROM escalacoes WHERE id_jogador = ?
                    UNION
                    SELECT id_partida FROM gols WHERE id_jogador = ?
                    UNION
                    SELECT id_partida FROM cartoes WHERE id_jogador = ?
                );
            """, (aid, aid, aid))
            tot_jogos = c.fetchone()[0]
            media_gols = round(tot_gols / max(tot_jogos, 1), 2)
            c.execute("""
                UPDATE jogadores_estatisticas 
                SET total_gols = ?,
                    total_jogos = ?,
                    media_gols_por_jogo = ?,
                    participacoes_gols = ? + COALESCE(total_assistencias, 0),
                    media_participacao_por_jogo = ROUND(CAST((? + COALESCE(total_assistencias, 0)) AS REAL) / MAX(?, 1), 2)
                WHERE id_jogador = ?;
            """, (tot_gols, tot_jogos, media_gols, tot_gols, tot_gols, tot_jogos, aid))
            c.execute("UPDATE jogadores SET total_gols = ?, total_jogos = ? WHERE id_jogador = ?;", (tot_gols, tot_jogos, aid))

        conn.commit()

    relatorio["regras"].append({
        "regra": "Nomes de Clubes Mandante/Visitante Válidos",
        "status": "CORRIGIDO" if reparados_clubes > 0 else ("OK" if clubes_invalidos == 0 else "FALHA"),
        "ocorrencias": clubes_invalidos,
        "reparados": reparados_clubes
    })

    # Regra 6: Vencedor inconsistente com placar
    c.execute("""
        SELECT COUNT(*) FROM partidas 
        WHERE gols_mandante IS NOT NULL AND gols_visitante IS NOT NULL
          AND vencedor IS NOT NULL AND vencedor != ''
          AND (
            (gols_mandante > gols_visitante AND vencedor != mandante) OR
            (gols_visitante > gols_mandante AND vencedor != visitante) OR
            (gols_mandante = gols_visitante AND vencedor != 'Empate' AND vencedor != 'empate')
          );
    """)
    vencedores_divergentes = c.fetchone()[0]
    # Auto-reparo de vencedores
    reparados_venc = 0
    if vencedores_divergentes > 0:
        c.execute("""
            UPDATE partidas 
            SET vencedor = CASE 
                WHEN gols_mandante > gols_visitante THEN mandante 
                WHEN gols_visitante > gols_mandante THEN visitante 
                ELSE 'Empate' 
            END
            WHERE gols_mandante IS NOT NULL AND gols_visitante IS NOT NULL
              AND (
                vencedor IS NULL OR vencedor = '' OR
                (gols_mandante > gols_visitante AND vencedor != mandante) OR
                (gols_visitante > gols_mandante AND vencedor != visitante) OR
                (gols_mandante = gols_visitante AND vencedor != 'Empate' AND vencedor != 'empate')
              );
        """)
        reparados_venc = c.rowcount
        conn.commit()

    relatorio["regras"].append({
        "regra": "Coerência Lógica de Vencedor vs Placar Final",
        "status": "CORRIGIDO" if reparados_venc > 0 else ("OK" if vencedores_divergentes == 0 else "FALHA"),
        "ocorrencias": vencedores_divergentes,
        "reparados": reparados_venc
    })

    # Regra 7: Partidas duplicadas exatas (mesma data, mandante, visitante)
    c.execute("""
        SELECT COUNT(*) FROM (
            SELECT data, mandante, visitante, COUNT(*) as c
            FROM partidas 
            GROUP BY data, mandante, visitante 
            HAVING c > 1
        );
    """)
    duplicatas = c.fetchone()[0]
    relatorio["regras"].append({
        "regra": "Jogos Duplicados no Acervo",
        "status": "AVISO" if duplicatas > 0 else "OK",
        "ocorrencias": duplicatas,
        "detalhes": f"{duplicatas} confrontos possuem mais de um registro na mesma data."
    })

    # Regra 8: Gols com clube invertido em partidas onde o time fez 0 gols ou 0x0 com gols fantasma (Auto-reparo)
    c.execute("""
        SELECT COUNT(*) 
        FROM gols g
        JOIN partidas p ON g.id_partida = p.id_partida
        WHERE ((g.clube = p.mandante AND p.gols_mandante = 0 AND p.gols_visitante > 0)
            OR (g.clube = p.visitante AND p.gols_visitante = 0 AND p.gols_mandante > 0)
            OR (p.gols_mandante = 0 AND p.gols_visitante = 0 AND (p.mandante LIKE '%Estatísticas%' OR p.visitante LIKE '%Estatísticas%' OR g.clube LIKE '%Estatísticas%')))
          AND (g.tipo_de_gol IS NULL OR lower(g.tipo_de_gol) NOT LIKE '%contra%');
    """)
    gols_invertidos = c.fetchone()[0]
    reparados_gols_inv = 0
    if gols_invertidos > 0:
        c.execute("""
            UPDATE gols
            SET clube = (SELECT p.visitante FROM partidas p WHERE p.id_partida = gols.id_partida)
            WHERE id_gol IN (
                SELECT g.id_gol FROM gols g JOIN partidas p ON g.id_partida = p.id_partida
                WHERE g.clube = p.mandante AND p.gols_mandante = 0 AND p.gols_visitante > 0
                  AND (g.tipo_de_gol IS NULL OR lower(g.tipo_de_gol) NOT LIKE '%contra%')
            );
        """)
        reparados_gols_inv += c.rowcount
        c.execute("""
            UPDATE gols
            SET clube = (SELECT p.mandante FROM partidas p WHERE p.id_partida = gols.id_partida)
            WHERE id_gol IN (
                SELECT g.id_gol FROM gols g JOIN partidas p ON g.id_partida = p.id_partida
                WHERE g.clube = p.visitante AND p.gols_visitante = 0 AND p.gols_mandante > 0
                  AND (g.tipo_de_gol IS NULL OR lower(g.tipo_de_gol) NOT LIKE '%contra%')
            );
        """)
        reparados_gols_inv += c.rowcount
        c.execute("""
            DELETE FROM gols
            WHERE id_gol IN (
                SELECT g.id_gol FROM gols g JOIN partidas p ON g.id_partida = p.id_partida
                WHERE p.gols_mandante = 0 AND p.gols_visitante = 0 
                  AND (p.mandante LIKE '%Estatísticas%' OR p.visitante LIKE '%Estatísticas%' OR g.clube LIKE '%Estatísticas%')
            );
        """)
        reparados_gols_inv += c.rowcount
        conn.commit()

    relatorio["regras"].append({
        "regra": "Gols Atribuídos a Times com Placar Zero (Clube Invertido)",
        "status": "CORRIGIDO" if reparados_gols_inv > 0 else ("OK" if gols_invertidos == 0 else "FALHA"),
        "ocorrencias": gols_invertidos,
        "reparados": reparados_gols_inv
    })

    # Regra 9: Jogadores com posição indefinida (Auto-inferência)
    c.execute("""
        SELECT COUNT(*) FROM jogadores_estatisticas 
        WHERE (posicao IS NULL OR posicao = '') AND total_gols >= 3;
    """)
    artilheiros_sem_pos = c.fetchone()[0]
    reparados_pos = 0
    if artilheiros_sem_pos > 0:
        c.execute("""
            UPDATE jogadores_estatisticas
            SET posicao = 'Atacante'
            WHERE (posicao IS NULL OR posicao = '') AND total_gols >= 3;
        """)
        reparados_pos = c.rowcount
        conn.commit()

    relatorio["regras"].append({
        "regra": "Atletas Artilheiros sem Posição Tática no Perfil",
        "status": "CORRIGIDO" if reparados_pos > 0 else ("OK" if artilheiros_sem_pos == 0 else "FALHA"),
        "ocorrencias": artilheiros_sem_pos,
        "reparados": reparados_pos
    })

    # Regra 10: Coerência de Clube em Gols vs Escalação Oficial (Auto-reparo de Adversário Invertido)
    c.execute("""
        SELECT COUNT(*)
        FROM gols g
        JOIN escalacoes e ON g.id_partida = e.id_partida AND g.id_jogador = e.id_jogador
        JOIN partidas p ON g.id_partida = p.id_partida
        WHERE ((g.clube = p.mandante AND e.clube = p.visitante) OR (g.clube = p.visitante AND e.clube = p.mandante))
          AND (g.tipo_de_gol IS NULL OR lower(g.tipo_de_gol) NOT LIKE '%contra%')
          AND (SELECT COUNT(DISTINCT e2.clube) FROM escalacoes e2 WHERE e2.id_partida = g.id_partida AND e2.id_jogador = g.id_jogador) = 1;
    """)
    gols_inv_escalacao = c.fetchone()[0]
    reparados_gols_esc = 0
    if gols_inv_escalacao > 0:
        c.execute("""
            SELECT DISTINCT g.id_jogador
            FROM gols g
            JOIN escalacoes e ON g.id_partida = e.id_partida AND g.id_jogador = e.id_jogador
            JOIN partidas p ON g.id_partida = p.id_partida
            WHERE ((g.clube = p.mandante AND e.clube = p.visitante) OR (g.clube = p.visitante AND e.clube = p.mandante))
              AND (g.tipo_de_gol IS NULL OR lower(g.tipo_de_gol) NOT LIKE '%contra%')
              AND (SELECT COUNT(DISTINCT e2.clube) FROM escalacoes e2 WHERE e2.id_partida = g.id_partida AND e2.id_jogador = g.id_jogador) = 1;
        """)
        atletas_afetados = [row[0] for row in c.fetchall() if row[0]]

        c.execute("""
            UPDATE gols
            SET clube = (
                SELECT e.clube
                FROM escalacoes e
                WHERE e.id_partida = gols.id_partida AND e.id_jogador = gols.id_jogador
                LIMIT 1
            )
            WHERE id_gol IN (
                SELECT g.id_gol
                FROM gols g
                JOIN escalacoes e ON g.id_partida = e.id_partida AND g.id_jogador = e.id_jogador
                JOIN partidas p ON g.id_partida = p.id_partida
                WHERE ((g.clube = p.mandante AND e.clube = p.visitante) OR (g.clube = p.visitante AND e.clube = p.mandante))
                  AND (g.tipo_de_gol IS NULL OR lower(g.tipo_de_gol) NOT LIKE '%contra%')
                  AND (SELECT COUNT(DISTINCT e2.clube) FROM escalacoes e2 WHERE e2.id_partida = g.id_partida AND e2.id_jogador = g.id_jogador) = 1
            );
        """)
        reparados_gols_esc = c.rowcount
        conn.commit()

        # Re-sincroniza a coluna clubes dos atletas afetados
        for aid in atletas_afetados:
            c.execute("""
                SELECT DISTINCT clube FROM (
                    SELECT DISTINCT clube FROM escalacoes WHERE id_jogador = ? AND clube IS NOT NULL AND clube != ''
                    UNION
                    SELECT DISTINCT clube FROM gols WHERE id_jogador = ? AND clube IS NOT NULL AND clube != ''
                ) ORDER BY clube
            """, (aid, aid))
            clubes_lista = [r[0] for r in c.fetchall() if r[0]]
            clubes_str = ",".join(clubes_lista)
            if clubes_str:
                c.execute("UPDATE jogadores SET clubes = ? WHERE id_jogador = ?", (clubes_str, aid))
                c.execute("UPDATE jogadores_estatisticas SET clubes = ? WHERE id_jogador = ?", (clubes_str, aid))
        conn.commit()

    relatorio["regras"].append({
        "regra": "Coerência de Clube em Gols vs Escalação Oficial",
        "status": "CORRIGIDO" if reparados_gols_esc > 0 else ("OK" if gols_inv_escalacao == 0 else "FALHA"),
        "ocorrencias": gols_inv_escalacao,
        "reparados": reparados_gols_esc
    })

    # Regra 11: Coerência de Atletas: Médias Verossímeis (<= 2.5) e Jogos Válidos (Sem Auto-Reparo Nocivo)
    c.execute("""
        SELECT COUNT(*) FROM jogadores_estatisticas 
        WHERE (total_jogos <= 0 AND total_gols > 0) 
           OR (total_gols >= 10 AND media_gols_por_jogo > 2.5);
    """)
    atletas_anormais = c.fetchone()[0]
    reparados_atl = 0

    relatorio["regras"].append({
        "regra": "Coerência de Atletas: Médias Verossímeis (<= 2.5)",
        "status": "OK" if atletas_anormais == 0 else "FALHA",
        "ocorrencias": atletas_anormais,
        "reparados": reparados_atl
    })

    # Regra 12: Coerência de Clubes Recentes dos Atletas (Sincronização Dinâmica)
    c.execute("""
        WITH ultimas_partidas AS (
            SELECT e.id_jogador, e.clube as ultimo_clube, MAX(p.data) as dt
            FROM escalacoes e
            JOIN partidas p ON e.id_partida = p.id_partida
            WHERE e.id_jogador IS NOT NULL AND e.id_jogador > 0 AND e.clube IS NOT NULL AND trim(e.clube) != ''
            GROUP BY e.id_jogador
        )
        SELECT u.id_jogador, u.ultimo_clube, j.clubes
        FROM ultimas_partidas u
        JOIN jogadores_estatisticas j ON u.id_jogador = j.id_jogador
        WHERE instr(COALESCE(j.clubes, ''), u.ultimo_clube) = 0;
    """)
    clubes_defasados = c.fetchall()
    reparados_clubes = 0
    if clubes_defasados:
        updates_auditoria = []
        for jid, ult_clb, clbs_atual in clubes_defasados:
            u_clean = ult_clb.strip().replace('Atlético Mineiro', 'Atlético-MG').replace('Athletico Paranaense', 'Athletico-PR')
            lista = [cb.strip() for cb in (clbs_atual or '').split(',') if cb.strip()]
            if u_clean not in lista:
                lista.insert(0, u_clean)
            updates_auditoria.append((', '.join(lista), jid))
        c.executemany("UPDATE jogadores_estatisticas SET clubes = ? WHERE id_jogador = ?;", updates_auditoria)
        reparados_clubes = len(updates_auditoria)
        conn.commit()

    relatorio["regras"].append({
        "regra": "Coerência de Clubes Recentes: Clube Atual em Escalações presente no Perfil",
        "status": "CORRIGIDO" if reparados_clubes > 0 else ("OK" if len(clubes_defasados) == 0 else "FALHA"),
        "ocorrencias": len(clubes_defasados),
        "reparados": reparados_clubes
    })

    # Regra de Temporadas Recentes: Consistência de soma de partidas por temporada recente
    c.execute("""
        SELECT ano, COUNT(*) FROM partidas WHERE ano >= 2024 GROUP BY ano ORDER BY ano DESC;
    """)
    recentes = {row[0]: row[1] for row in c.fetchall()}
    relatorio["partidas_recentes"] = recentes

    conn.close()

    total_inconsistencias = sum(r.get("ocorrencias", 0) for r in relatorio["regras"])
    total_reparadas = sum(r.get("reparados", 0) for r in relatorio["regras"])
    relatorio["inconsistencias_encontradas"] = total_inconsistencias
    relatorio["inconsistencias_reparadas"] = total_reparadas

    return relatorio

if __name__ == "__main__":
    res = auditar_e_reparar_dados()
    print(json.dumps(res, indent=2, ensure_ascii=False))
