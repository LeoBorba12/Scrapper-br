import sqlite3
import re
import os

def sanear_banco(db_path):
    print(f"\n=======================================================")
    print(f"SANEANDO BANCO DE DADOS: {db_path}")
    print(f"=======================================================")
    
    if not os.path.exists(db_path):
        print(f"Arquivo {db_path} nao encontrado!")
        return

    conn = sqlite3.connect(db_path)
    c = conn.cursor()

    # 1. LIMPEZA DOS GRUPOS DA COPA JOAO HAVELANGE 2000
    jh_map = {
        'K São Paulo (SP)': 'São Paulo',
        'N São Paulo (SP)': 'São Paulo',
        'A Botafogo (RJ)': 'Botafogo',
        'B Cruzeiro (MG)': 'Cruzeiro',
        'I Cruzeiro (MG)': 'Cruzeiro',
        'M Cruzeiro (MG)': 'Cruzeiro',
        'C Bahia (BA)': 'Bahia',
        'D Juventude (RS)': 'Juventude',
        'E ABC (RN)': 'ABC',
        'F América (RN)': 'América-RN',
        'G Fluminense (RJ)': 'Fluminense',
        'L Fluminense (RJ)': 'Fluminense',
        'H Portuguesa (SP)': 'Portuguesa',
        'J Flamengo (RJ)': 'Flamengo',
        'S João': 'União São João',
        'U Bandeirante': 'União Bandeirante',
        'U Barbarense': 'União Barbarense',
        'J Malucelli': 'J. Malucelli'
    }
    jh_count = 0
    for sujo, limpo in jh_map.items():
        c.execute("UPDATE partidas SET mandante = ? WHERE mandante = ?;", (limpo, sujo))
        jh_count += c.rowcount
        c.execute("UPDATE partidas SET visitante = ? WHERE visitante = ?;", (limpo, sujo))
        jh_count += c.rowcount
        c.execute("UPDATE partidas SET vencedor = ? WHERE vencedor = ?;", (limpo, sujo))
    print(f"[OK] Prefixos de grupos da Copa Joao Havelange corrigidos ({jh_count} substituicoes).")

    # 2. LIMPEZA DAS PARTIDAS DE COPA DO BRASIL 2002 COM 'TimeA - TimeB' vs UF
    c.execute("""
        SELECT id_partida, mandante, visitante 
        FROM partidas 
        WHERE (mandante LIKE '% - %' AND LENGTH(TRIM(visitante)) = 2)
           OR (visitante LIKE '% - %' AND LENGTH(TRIM(mandante)) = 2)
    """)
    partidas_uf = c.fetchall()
    uf_corrigidos = 0
    for id_p, m, v in partidas_uf:
        if ' - ' in m and len(v.strip()) == 2:
            partes = m.split(' - ')
            time_m = partes[0].strip()
            time_v = partes[1].strip()
            c.execute("UPDATE partidas SET mandante = ?, visitante = ? WHERE id_partida = ?;", (time_m, time_v, id_p))
            uf_corrigidos += 1
        elif ' - ' in v and len(m.strip()) == 2:
            partes = v.split(' - ')
            time_v = partes[0].strip()
            time_m = partes[1].strip()
            c.execute("UPDATE partidas SET mandante = ?, visitante = ? WHERE id_partida = ?;", (time_m, time_v, id_p))
            uf_corrigidos += 1
    print(f"[OK] Partidas com chaveamento e UF da Copa do Brasil 2002 corrigidas ({uf_corrigidos} jogos).")

    # 3. LIMPEZA DE PARTIDAS COM ESTADIO NO VISITANTE (Serie B 2001 e similares)
    c.execute("""
        SELECT id_partida, mandante, visitante, estadio 
        FROM partidas 
        WHERE visitante LIKE '% - %' 
          AND campeonato = 'Campeonato Brasileiro - Série B'
          AND ano = 2001
    """)
    partidas_estadio = c.fetchall()
    estadio_corrigidos = 0
    for id_p, m, v, est in partidas_estadio:
        partes = v.split(' - ')
        time_v = partes[0].strip()
        nome_estadio = partes[1].strip()
        est_final = est if est and est != 'None' else nome_estadio
        c.execute("UPDATE partidas SET visitante = ?, estadio = ? WHERE id_partida = ?;", (time_v, est_final, id_p))
        estadio_corrigidos += 1
    print(f"[OK] Visitantes com estadio embutido na Serie B 2001 corrigidos ({estadio_corrigidos} jogos).")

    # 4. LIMPEZA DAS ANOMALIAS INTERNACIONAIS / ESPECIFICAS
    anomalias_map = [
        # (id_partida, novo_mandante, novo_visitante)
        (19938509, 'Estudiantes LP', 'Boca Juniors'),
        (19938510, 'Boca Juniors', 'Estudiantes LP'),
        (19948517, 'Estudiantes LP', 'Cruzeiro'),
        (19948518, 'Cruzeiro', 'Estudiantes LP'),
        (20087036, 'Estudiantes LP', 'Deportivo Cuenca'),
        (20115086, 'Coritiba', 'Caxias'),
        (20115087, 'Caxias', 'Coritiba'),
        (20145098, 'Santa Rita-AL', 'Potiguar de Mossoró'),
        (20145099, 'Potiguar de Mossoró', 'Santa Rita-AL'),
        (20175050, 'Sampaio Corrêa', 'Guarani de Juazeiro'),
        (20237094, 'Colo-Colo', 'Monagas SC'),
        (20237095, 'Colo-Colo', 'Boca Juniors'),
        (20237101, 'Colo-Colo', 'Deportivo Pereira FC'),
        (20238068, 'América-MG', 'Peñarol'),
        (20238073, 'América-MG', 'Defensa y Justicia'),
        (20238076, 'América-MG', 'Millonarios FC'),
        (20247032, 'Colo-Colo', 'Cerro Porteño'),
        (20247035, 'Colo-Colo', 'Alianza Lima'),
        (20247038, 'Colo-Colo', 'Fluminense')
    ]
    for id_p, m_novo, v_novo in anomalias_map:
        c.execute("UPDATE partidas SET mandante = ?, visitante = ? WHERE id_partida = ?;", (m_novo, v_novo, id_p))
    print(f"[OK] Anomalias internacionais e Conmebol corrigidas ({len(anomalias_map)} partidas).")

    # 5. UNIFICACAO DA NOMENCLATURA DO CAMPEONATO BRASILEIRO
    c.execute("""
        UPDATE partidas 
        SET campeonato = 'Campeonato Brasileiro Série A' 
        WHERE campeonato IN ('Campeonato Brasileiro', 'Campeonato Brasileiro - Série A', 'Série A');
    """)
    brasileirao_unificados = c.rowcount
    print(f"[OK] Nomenclatura da Serie A unificada para 'Campeonato Brasileiro Série A' ({brasileirao_unificados} partidas).")

    c.execute("""
        UPDATE partidas 
        SET campeonato = 'Campeonato Brasileiro Série B' 
        WHERE campeonato = 'Campeonato Brasileiro - Série B';
    """)
    print(f"[OK] Nomenclatura da Serie B padronizada para 'Campeonato Brasileiro Série B' ({c.rowcount} partidas).")

    # 6. RECALCULAR DETERMINISTICAMENTE PLACAR E VENCEDOR
    c.execute("""
        UPDATE partidas
        SET placar = gols_mandante || ' x ' || gols_visitante,
            vencedor = CASE 
                WHEN gols_mandante > gols_visitante THEN mandante
                WHEN gols_visitante > gols_mandante THEN visitante
                ELSE 'Empate'
            END
        WHERE gols_mandante IS NOT NULL AND gols_visitante IS NOT NULL;
    """)
    print(f"[OK] Placares e vencedores recalculados deterministicamente ({c.rowcount} partidas).")

    # 7. CRIACAO DE INDICES COMPOSTOS DE ALTA PERFORMANCE
    indices = [
        ("idx_partidas_mandante_visitante", "CREATE INDEX IF NOT EXISTS idx_partidas_mandante_visitante ON partidas(mandante, visitante);"),
        ("idx_partidas_campeonato_ano", "CREATE INDEX IF NOT EXISTS idx_partidas_campeonato_ano ON partidas(campeonato, ano);"),
        ("idx_partidas_ano", "CREATE INDEX IF NOT EXISTS idx_partidas_ano ON partidas(ano);"),
        ("idx_gols_atleta_clube", "CREATE INDEX IF NOT EXISTS idx_gols_atleta_clube ON gols(atleta, clube);"),
        ("idx_cartoes_atleta", "CREATE INDEX IF NOT EXISTS idx_cartoes_atleta ON cartoes(atleta, clube);")
    ]
    for idx_name, idx_sql in indices:
        c.execute(idx_sql)
    print("[OK] Indices compostos de alta performance verificados/criados.")

    # 8. ATUALIZAR TABELA JOGADORES_RESUMO COM OS CLUBES SANEADOS
    c.execute("DROP TABLE IF EXISTS jogadores_resumo;")
    c.execute("""
        CREATE TABLE jogadores_resumo (
            id_jogador INTEGER PRIMARY KEY AUTOINCREMENT,
            nome TEXT NOT NULL,
            clubes TEXT,
            total_jogos INTEGER DEFAULT 0,
            total_gols INTEGER DEFAULT 0,
            total_amarelos INTEGER DEFAULT 0,
            total_vermelhos INTEGER DEFAULT 0,
            ano_min INTEGER,
            ano_max INTEGER
        );
    """)
    c.execute("""
        INSERT INTO jogadores_resumo (nome, clubes, total_jogos, total_gols, total_amarelos, total_vermelhos, ano_min, ano_max)
        SELECT 
            t.atleta as nome,
            GROUP_CONCAT(DISTINCT t.clube) as clubes,
            COUNT(DISTINCT t.id_partida) as total_jogos,
            SUM(t.eh_gol) as total_gols,
            SUM(t.eh_amarelo) as total_amarelos,
            SUM(t.eh_vermelho) as total_vermelhos,
            MIN(t.ano) as ano_min,
            MAX(t.ano) as ano_max
        FROM (
            SELECT g.atleta, g.clube, g.id_partida, 1 as eh_gol, 0 as eh_amarelo, 0 as eh_vermelho, p.ano
            FROM gols g
            JOIN partidas p ON g.id_partida = p.id_partida
            UNION ALL
            SELECT c.atleta, c.clube, c.id_partida, 0 as eh_gol, 
                   CASE WHEN c.cartao LIKE '%Amarelo%' THEN 1 ELSE 0 END as eh_amarelo,
                   CASE WHEN c.cartao LIKE '%Vermelho%' THEN 1 ELSE 0 END as eh_vermelho,
                   p.ano
            FROM cartoes c
            JOIN partidas p ON c.id_partida = p.id_partida
            UNION ALL
            SELECT e.atleta, e.clube, e.id_partida, 0 as eh_gol, 0 as eh_amarelo, 0 as eh_vermelho, p.ano
            FROM escalacoes e
            JOIN partidas p ON e.id_partida = p.id_partida
        ) t
        WHERE t.atleta IS NOT NULL AND TRIM(t.atleta) != ''
        GROUP BY t.atleta;
    """)
    c.execute("CREATE INDEX IF NOT EXISTS idx_jogadores_resumo_nome ON jogadores_resumo(nome COLLATE NOCASE);")
    c.execute("SELECT COUNT(*) FROM jogadores_resumo;")
    total_jogadores = c.fetchone()[0]
    print(f"[OK] Tabela jogadores_resumo rematerializada com sucesso ({total_jogadores} atletas).")

    conn.commit()
    conn.close()
    print(f"[OK] Saneamento de {db_path} CONCLUIDO COM SUCESSO!\n")

if __name__ == "__main__":
    sanear_banco("data/futebol.db")
    sanear_banco("api/data/futebol.db")
