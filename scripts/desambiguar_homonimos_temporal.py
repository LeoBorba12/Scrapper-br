import sqlite3
import json
import time
import re
from collections import Counter

DB_PATH = 'data/futebol.db'

def get_era_label(min_ano, max_ano, top_clubes):
    clube_str = "/".join(top_clubes[:2]) if top_clubes else ""
    if min_ano < 1970:
        decada = "Anos 60"
    elif min_ano < 1980:
        decada = "Anos 70"
    elif min_ano < 1990:
        decada = "Anos 80"
    elif min_ano < 2000:
        decada = "Anos 90"
    elif min_ano < 2010:
        decada = "Anos 2000"
    elif min_ano < 2020:
        decada = "Anos 2010"
    else:
        decada = "Anos 2020"
        
    if clube_str:
        return f"{clube_str} - {decada}"
    return decada

def executar_desambiguacao():
    print(f"[{time.strftime('%H:%M:%S')}] Iniciando Desambiguação Temporal de Homônimos...")
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()

    # 1. Obter o maior id_jogador atual
    c.execute("SELECT MAX(id_jogador) FROM jogadores_estatisticas;")
    max_id = max(c.fetchone()[0] or 0, 100000)
    proximo_id = max_id + 1
    print(f"Próximo ID para novos clusters: {proximo_id}")

    # 2. Localizar todos os atletas com anomalia de span temporal > 20 anos
    c.execute("""
        SELECT j.id_jogador, j.nome_exibicao, j.nome_completo, j.posicao, j.detalhe_carreira_clubes,
               MIN(p.ano) as ano_min, MAX(p.ano) as ano_max
        FROM jogadores_estatisticas j
        JOIN (
            SELECT id_jogador, id_partida FROM gols WHERE id_jogador IS NOT NULL
            UNION ALL
            SELECT id_jogador, id_partida FROM cartoes WHERE id_jogador IS NOT NULL
            UNION ALL
            SELECT id_jogador, id_partida FROM escalacoes WHERE id_jogador IS NOT NULL
        ) ev ON ev.id_jogador = j.id_jogador
        JOIN partidas p ON ev.id_partida = p.id_partida
        WHERE p.ano IS NOT NULL
        GROUP BY j.id_jogador
        HAVING (MAX(p.ano) - MIN(p.ano)) > 20;
    """)
    atletas_anomalos = c.fetchall()
    print(f"Total de atletas detectados com carreira anômala (> 20 anos): {len(atletas_anomalos)}")

    total_novos_atletas = 0
    total_gols_reatribuidos = 0
    total_cartoes_reatribuidos = 0
    total_escalacoes_reatribuidos = 0

    for idx, atl in enumerate(atletas_anomalos):
        jid, nome_ex, nome_comp, pos_original, car_json, ano_min, ano_max = atl
        
        # Buscar todos os eventos do atleta
        c.execute("""
            SELECT 'gol' as tipo, g.id_gol as id, p.ano, g.clube
            FROM gols g
            JOIN partidas p ON g.id_partida = p.id_partida
            WHERE g.id_jogador = ? AND p.ano IS NOT NULL
            UNION ALL
            SELECT 'cartao' as tipo, cr.id_cartao as id, p.ano, cr.clube
            FROM cartoes cr
            JOIN partidas p ON cr.id_partida = p.id_partida
            WHERE cr.id_jogador = ? AND p.ano IS NOT NULL
            UNION ALL
            SELECT 'escalacao' as tipo, e.id_escalacao as id, p.ano, e.clube
            FROM escalacoes e
            JOIN partidas p ON e.id_partida = p.id_partida
            WHERE e.id_jogador = ? AND p.ano IS NOT NULL
            ORDER BY ano ASC;
        """, (jid, jid, jid))
        all_events = c.fetchall()
        
        if not all_events:
            continue

        # Algoritmo de Gap Clustering Temporal
        clusters = []
        current_cluster = []
        for ev in all_events:
            tipo, eid, ano, clube = ev
            if not current_cluster:
                current_cluster.append(ev)
            else:
                prev_ano = current_cluster[-1][2]
                start_ano = current_cluster[0][2]
                if (ano - prev_ano >= 5) or (ano - start_ano > 18):
                    clusters.append(current_cluster)
                    current_cluster = [ev]
                else:
                    current_cluster.append(ev)
        if current_cluster:
            clusters.append(current_cluster)

        if len(clusters) <= 1:
            continue

        # Decidir qual cluster é o canônico (mantém o jid original)
        canonical_idx = 0
        if car_json:
            try:
                car_list = json.loads(car_json)
                car_clubes = {re.sub(r'\[.*?\]', '', item.get('clube', '')).strip().lower() for item in car_list}
                best_match = 0
                for c_i, cl in enumerate(clusters):
                    cl_clubes = {x[3].lower() for x in cl if x[3]}
                    overlap = len(car_clubes.intersection(cl_clubes))
                    if overlap > best_match:
                        best_match = overlap
                        canonical_idx = c_i
            except Exception:
                pass
        
        # Se não tiver carreira oficial, o cluster com mais eventos (ou mais recente) fica como canônico
        if not car_json:
            max_events = -1
            for c_i, cl in enumerate(clusters):
                if len(cl) > max_events:
                    max_events = len(cl)
                    canonical_idx = c_i

        # Processar cada cluster
        for c_i, cl in enumerate(clusters):
            anos = [x[2] for x in cl]
            min_a = min(anos)
            max_a = max(anos)
            cl_clubes = [x[3] for x in cl if x[3]]
            top_clbs = [item[0] for item in Counter(cl_clubes).most_common(3)]
            clubes_str = ",".join([item[0] for item in Counter(cl_clubes).most_common(6)])
            
            # Gols, cartões, escalações neste cluster
            gols_ids = [x[1] for x in cl if x[0] == 'gol']
            cartoes_ids = [x[1] for x in cl if x[0] == 'cartao']
            esc_ids = [x[1] for x in cl if x[0] == 'escalacao']
            
            total_gols = len(gols_ids)
            total_jogos = len(set(gols_ids + esc_ids + cartoes_ids))
            
            if c_i == canonical_idx:
                # Atualizar o registro canônico existente
                c.execute("""
                    UPDATE jogadores_estatisticas
                    SET ano_inicio = ?, ano_fim = ?, clubes = ?, total_gols = ?
                    WHERE id_jogador = ?;
                """, (min_a, max_a, clubes_str, total_gols, jid))
            else:
                # Criar novo jogador para este cluster temporal
                target_jid = proximo_id
                proximo_id += 1
                total_novos_atletas += 1
                
                label_era = get_era_label(min_a, max_a, top_clbs)
                novo_nome = f"{nome_ex} ({label_era})"
                
                # Inserir novo atleta
                c.execute("""
                    INSERT INTO jogadores_estatisticas (
                        id_jogador, nome_exibicao, nome_completo, apelido, posicao,
                        clubes, ano_inicio, ano_fim, total_gols, total_jogos
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
                """, (
                    target_jid, novo_nome, nome_comp or novo_nome, nome_ex, pos_original or 'Atacante' if total_gols >= 3 else 'Jogador',
                    clubes_str, min_a, max_a, total_gols, total_jogos
                ))
                
                # Reatribuir eventos
                if gols_ids:
                    c.execute(f"UPDATE gols SET id_jogador = ? WHERE id_gol IN ({','.join('?'*len(gols_ids))});", [target_jid] + gols_ids)
                    total_gols_reatribuidos += len(gols_ids)
                if cartoes_ids:
                    c.execute(f"UPDATE cartoes SET id_jogador = ? WHERE id_cartao IN ({','.join('?'*len(cartoes_ids))});", [target_jid] + cartoes_ids)
                    total_cartoes_reatribuidos += len(cartoes_ids)
                if esc_ids:
                    c.execute(f"UPDATE escalacoes SET id_jogador = ? WHERE id_escalacao IN ({','.join('?'*len(esc_ids))});", [target_jid] + esc_ids)
                    total_escalacoes_reatribuidos += len(esc_ids)

        if (idx + 1) % 100 == 0:
            conn.commit()
            print(f"  -> Progresso: {idx + 1}/{len(atletas_anomalos)} atletas processados...")

    conn.commit()
    conn.close()
    
    print(f"\n[{time.strftime('%H:%M:%S')}] Desambiguação concluída com sucesso!")
    print(f"Total de novos atletas criados por cluster temporal: {total_novos_atletas}")
    print(f"Gols reatribuídos para seus clusters corretos: {total_gols_reatribuidos}")
    print(f"Cartões reatribuídos: {total_cartoes_reatribuidos}")
    print(f"Escalações reatribuídas: {total_escalacoes_reatribuidos}")

if __name__ == '__main__':
    executar_desambiguacao()
