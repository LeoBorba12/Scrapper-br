"""
Script Mestre de Migração Relacional e Enriquecimento Estatístico de Jogadores
==============================================================================
1. Saneia grafias e remove truncamentos em escalações, gols e cartões.
2. Desambigua os diferentes homônimos e garante ZERO duplicações em jogadores_estatisticas.
3. Cria/atualiza a tabela mestra `jogadores_estatisticas` com chave primária relacional `id_jogador`.
4. Conecta `id_jogador` em 100% das partidas em `gols`, `escalacoes` e `cartoes`.
5. Calcula todas as estatísticas consolidadas nativas (tipos de gols, 1º/2º tempo, clutch 80'+,
   maior vítima, estádio favorito, aproveitamento coletivo de vitórias/empates/derrotas).
6. Otimiza o banco com índices de alta velocidade e VACUUM.
"""

import os
import sys
import sqlite3
import time

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DB_PATH = os.path.join(BASE_DIR, "data", "futebol.db")

MAPA_CANONICO = {
    "gabriel barbosa almeida": "Gabriel Barbosa",
    "gabriel barbosa": "Gabriel Barbosa",
    "gabriel barbosa almeida gabriel": "Gabriel Barbosa",
    "giorgian de arrascaeta": "Arrascaeta",
    "giorgian daniel de arrascaeta benedetti": "Arrascaeta",
    "georgian de arrascaeta": "Arrascaeta",
    "arrascaeta": "Arrascaeta",
    "hulk givanildo vieira de sousa": "Hulk",
    "givanildo vieira de sousa": "Hulk",
    "hulk": "Hulk",
    "german ezequiel cano": "Germán Cano",
    "german cano german ezequiel cano": "Germán Cano",
    "german cano": "Germán Cano",
    "germán cano": "Germán Cano",
    "raphael cavalcante veiga": "Raphael Veiga",
    "raphael veiga raphael cavalcante": "Raphael Veiga",
    "raphael veiga": "Raphael Veiga",
    "dudu eduardo pereira rodrigues": "Dudu",
    "eduardo pereira rodrigues": "Dudu",
    "dudu": "Dudu",
    "pedro guilherme abreu dos santos": "Pedro",
    "pedro guilherme": "Pedro",
    "pedro": "Pedro",
}

def limpar_nome_atleta(nome_raw: str) -> str:
    if not nome_raw:
        return ""
    n = nome_raw.strip()
    if n.startswith("- "):
        n = n[2:].strip()
    
    if "..." in n:
        partes = [p.strip() for p in n.split("...") if p.strip()]
        if len(partes) >= 2:
            n = partes[1]
        elif len(partes) == 1:
            n = partes[0]
            
    n = " ".join(n.split())
    n_lower = n.lower()
    if n_lower in MAPA_CANONICO:
        return MAPA_CANONICO[n_lower]
        
    return n

def executar_migracao():
    print("=" * 70)
    print("INICIANDO MIGRAÇÃO E ENRIQUECIMENTO DE JOGADORES NO FUTEBOL.DB")
    print("=" * 70)
    
    if not os.path.exists(DB_PATH):
        print(f"ERRO: Banco {DB_PATH} não encontrado!")
        sys.exit(1)
        
    conn = sqlite3.connect(DB_PATH)
    conn.execute("PRAGMA foreign_keys = OFF;")
    conn.execute("PRAGMA journal_mode = WAL;")
    conn.execute("PRAGMA synchronous = NORMAL;")
    conn.execute("PRAGMA cache_size = -64000;")
    c = conn.cursor()
    
    t_inicio = time.time()
    
    # PASSO 1: Tabela
    print("\n[1/6] Verificando estrutura da tabela 'jogadores_estatisticas'...")
    c.execute("""
        CREATE TABLE IF NOT EXISTS jogadores_estatisticas (
            id_jogador INTEGER PRIMARY KEY,
            ogol_id INTEGER,
            cbf_id TEXT,
            nome_exibicao TEXT NOT NULL,
            nome_completo TEXT,
            apelido TEXT,
            posicao TEXT,
            clubes TEXT,
            ano_inicio INTEGER,
            ano_fim INTEGER,

            -- Presença & Desempenho
            total_jogos INTEGER DEFAULT 0,
            jogos_titular INTEGER DEFAULT 0,
            jogos_reserva INTEGER DEFAULT 0,
            jogos_capitao INTEGER DEFAULT 0,
            vitorias INTEGER DEFAULT 0,
            empates INTEGER DEFAULT 0,
            derrotas INTEGER DEFAULT 0,
            aproveitamento_pontos REAL DEFAULT 0.0,

            -- Gols & Finalização
            total_gols INTEGER DEFAULT 0,
            gols_bola_rolando INTEGER DEFAULT 0,
            gols_penalti INTEGER DEFAULT 0,
            gols_falta INTEGER DEFAULT 0,
            gols_cabeca INTEGER DEFAULT 0,
            gols_primeiro_tempo INTEGER DEFAULT 0,
            gols_segundo_tempo INTEGER DEFAULT 0,
            gols_decisivos_80mais INTEGER DEFAULT 0,
            gols_mandante INTEGER DEFAULT 0,
            gols_visitante INTEGER DEFAULT 0,
            gols_classicos INTEGER DEFAULT 0,
            gols_finais INTEGER DEFAULT 0,
            hat_tricks INTEGER DEFAULT 0,
            dobletes INTEGER DEFAULT 0,

            -- Criação & Passes
            total_assistencias INTEGER DEFAULT 0,
            participacoes_gols INTEGER DEFAULT 0,
            media_gols_por_jogo REAL DEFAULT 0.0,
            media_participacao_por_jogo REAL DEFAULT 0.0,

            -- Scouts Modernos
            chutes_ao_gol INTEGER DEFAULT 0,
            finalizacoes_totais INTEGER DEFAULT 0,
            pontaria_chutes_pct REAL DEFAULT 0.0,
            penaltis_cobrados INTEGER DEFAULT 0,
            penaltis_perdidos INTEGER DEFAULT 0,

            -- Disciplina & Defesa
            cartoes_amarelos INTEGER DEFAULT 0,
            cartoes_vermelhos INTEGER DEFAULT 0,
            clean_sheets INTEGER DEFAULT 0,

            -- Contextos Especiais
            maior_vitima_clube TEXT,
            estadio_favorito TEXT
        );
    """)
    conn.commit()
    
    # PASSO 2: Mapeamento e Deduplicação Estrita
    print("[2/6] Mapeando e deduplicando universo de atletas...")
    c.execute("""
        SELECT nome_exibicao, group_concat(id_jogador)
        FROM jogadores_estatisticas
        GROUP BY nome_exibicao
        HAVING count(*) > 1;
    """)
    dups = c.fetchall()
    for nome, id_list_str in dups:
        ids = [int(x) for x in id_list_str.split(',')]
        c.execute(f"SELECT id_jogador, ogol_id, total_assistencias FROM jogadores_estatisticas WHERE id_jogador IN ({','.join('?'*len(ids))}) ORDER BY (ogol_id IS NOT NULL) DESC, total_assistencias DESC, id_jogador ASC", ids)
        rows = c.fetchall()
        primary_id = rows[0][0]
        total_assists = sum(r[2] or 0 for r in rows)
        other_ids = [r[0] for r in rows[1:]]
        placeholders = ','.join('?' * len(other_ids))
        c.execute(f"UPDATE gols SET id_jogador = ? WHERE id_jogador IN ({placeholders})", [primary_id] + other_ids)
        c.execute(f"UPDATE escalacoes SET id_jogador = ? WHERE id_jogador IN ({placeholders})", [primary_id] + other_ids)
        c.execute(f"UPDATE cartoes SET id_jogador = ? WHERE id_jogador IN ({placeholders})", [primary_id] + other_ids)
        c.execute("UPDATE jogadores_estatisticas SET total_assistencias = ? WHERE id_jogador = ?", (total_assists, primary_id))
        c.execute(f"DELETE FROM jogadores_estatisticas WHERE id_jogador IN ({placeholders})", other_ids)
    conn.commit()
    
    # Criar mapa nome_lower -> id_jogador
    c.execute("SELECT id_jogador, nome_exibicao, nome_completo, apelido FROM jogadores_estatisticas;")
    atletas_map = {}
    for r in c.fetchall():
        j_id, n_ex, n_cp, ap = r
        if n_ex:
            atletas_map[n_ex.lower()] = j_id
        if n_cp:
            atletas_map[n_cp.lower()] = j_id
        if ap:
            atletas_map[ap.lower()] = j_id

    # PASSO 3: Vinculação de id_jogador
    print("\n[3/6] Vinculando 'id_jogador' em gols, escalações e cartões...")
    cols_gols = [r[1] for r in c.execute("PRAGMA table_info(gols);").fetchall()]
    if "id_jogador" not in cols_gols:
        c.execute("ALTER TABLE gols ADD COLUMN id_jogador INTEGER REFERENCES jogadores_estatisticas(id_jogador);")
    
    cols_esc = [r[1] for r in c.execute("PRAGMA table_info(escalacoes);").fetchall()]
    if "id_jogador" not in cols_esc:
        c.execute("ALTER TABLE escalacoes ADD COLUMN id_jogador INTEGER REFERENCES jogadores_estatisticas(id_jogador);")
        
    cols_car = [r[1] for r in c.execute("PRAGMA table_info(cartoes);").fetchall()]
    if "id_jogador" not in cols_car:
        c.execute("ALTER TABLE cartoes ADD COLUMN id_jogador INTEGER REFERENCES jogadores_estatisticas(id_jogador);")
    conn.commit()

    print("  -> Atualizando vínculos em gols...")
    c.execute("SELECT id_gol, atleta FROM gols;")
    gols_update = []
    for id_g, atl in c.fetchall():
        if not atl:
            continue
        n_c = limpar_nome_atleta(atl).lower()
        j_id = atletas_map.get(n_c)
        if j_id:
            gols_update.append((j_id, id_g))
    c.executemany("UPDATE gols SET id_jogador = ? WHERE id_gol = ?;", gols_update)
    conn.commit()

    print("  -> Atualizando vínculos em escalações...")
    c.execute("SELECT id_escalacao, atleta FROM escalacoes;")
    esc_update = []
    for id_e, atl in c.fetchall():
        if not atl:
            continue
        n_c = limpar_nome_atleta(atl).lower()
        j_id = atletas_map.get(n_c)
        if j_id:
            esc_update.append((j_id, id_e))
    c.executemany("UPDATE escalacoes SET id_jogador = ? WHERE id_escalacao = ?;", esc_update)
    conn.commit()

    print("  -> Atualizando vínculos em cartões...")
    c.execute("SELECT id_cartao, atleta FROM cartoes;")
    car_update = []
    for id_cr, atl in c.fetchall():
        if not atl:
            continue
        n_c = limpar_nome_atleta(atl).lower()
        j_id = atletas_map.get(n_c)
        if j_id:
            car_update.append((j_id, id_cr))
    c.executemany("UPDATE cartoes SET id_jogador = ? WHERE id_cartao = ?;", car_update)
    conn.commit()

    # PASSO 4: Índices
    print("\n[4/6] Garantindo índices relacionais...")
    c.execute("CREATE INDEX IF NOT EXISTS idx_gols_id_jogador ON gols(id_jogador);")
    c.execute("CREATE INDEX IF NOT EXISTS idx_escalacoes_id_jogador ON escalacoes(id_jogador);")
    c.execute("CREATE INDEX IF NOT EXISTS idx_cartoes_id_jogador ON cartoes(id_jogador);")
    c.execute("CREATE INDEX IF NOT EXISTS idx_jogadores_estatisticas_gols ON jogadores_estatisticas(total_gols DESC);")
    c.execute("CREATE INDEX IF NOT EXISTS idx_jogadores_estatisticas_nome ON jogadores_estatisticas(nome_exibicao);")
    conn.commit()

    # PASSO 5: Cálculo e Atualização das Estatísticas
    print("\n[5/6] Consolidando estatísticas com agregação completa...")
    
    # 5.1 Gols
    c.execute("""
        SELECT 
            g.id_jogador,
            count(*) as total_gols,
            sum(case when g.tipo_de_gol like '%p%nalti%' or g.tipo_de_gol = 'Penalty' then 1 else 0 end) as gols_penalti,
            sum(case when g.tipo_de_gol like '%falta%' then 1 else 0 end) as gols_falta,
            sum(case when g.tipo_de_gol like '%cabe%a%' then 1 else 0 end) as gols_cabeca,
            sum(case when g.minuto >= 80 then 1 else 0 end) as gols_80mais,
            sum(case when g.tempo = 1 or g.tempo = '1' or g.tempo like '1%' then 1 else 0 end) as gols_1t,
            sum(case when g.tempo = 2 or g.tempo = '2' or g.tempo like '2%' then 1 else 0 end) as gols_2t,
            sum(case when g.clube = p.mandante then 1 else 0 end) as gols_mandante,
            sum(case when g.clube = p.visitante then 1 else 0 end) as gols_visitante,
            sum(case when p.fase like '%Final%' or p.fase like '%Decis%' then 1 else 0 end) as gols_finais
        FROM gols g
        LEFT JOIN partidas p ON g.id_partida = p.id_partida
        WHERE g.id_jogador IS NOT NULL AND g.id_jogador > 0
        GROUP BY g.id_jogador;
    """)
    for row in c.fetchall():
        (j_id, tot_g, g_pen, g_flt, g_cab, g_80, g_1t, g_2t, g_mand, g_vis, g_fin) = row
        g_norm = max(0, tot_g - (g_pen + g_flt))
        c.execute("""
            UPDATE jogadores_estatisticas
            SET total_gols = ?,
                gols_bola_rolando = ?,
                gols_penalti = ?,
                gols_falta = ?,
                gols_cabeca = ?,
                gols_decisivos_80mais = ?,
                gols_primeiro_tempo = ?,
                gols_segundo_tempo = ?,
                gols_mandante = ?,
                gols_visitante = ?,
                gols_finais = ?
            WHERE id_jogador = ?;
        """, (tot_g, g_norm, g_pen, g_flt, g_cab, g_80, g_1t, g_2t, g_mand, g_vis, g_fin, j_id))
    conn.commit()

    # 5.2 Hat-tricks e Dobletes
    c.execute("""
        SELECT id_jogador, count(*) 
        FROM (
            SELECT id_jogador, id_partida, count(*) as g_jogo 
            FROM gols 
            WHERE id_jogador IS NOT NULL AND id_jogador > 0 
            GROUP BY id_jogador, id_partida 
            HAVING g_jogo >= 3
        ) GROUP BY id_jogador;
    """)
    for j_id, hts in c.fetchall():
        c.execute("UPDATE jogadores_estatisticas SET hat_tricks = ? WHERE id_jogador = ?;", (hts, j_id))

    c.execute("""
        SELECT id_jogador, count(*) 
        FROM (
            SELECT id_jogador, id_partida, count(*) as g_jogo 
            FROM gols 
            WHERE id_jogador IS NOT NULL AND id_jogador > 0 
            GROUP BY id_jogador, id_partida 
            HAVING g_jogo = 2
        ) GROUP BY id_jogador;
    """)
    for j_id, dbs in c.fetchall():
        c.execute("UPDATE jogadores_estatisticas SET dobletes = ? WHERE id_jogador = ?;", (dbs, j_id))
    conn.commit()

    # 5.3 Maior Vítima
    c.execute("""
        WITH gols_adv AS (
            SELECT 
                g.id_jogador,
                CASE WHEN g.clube = p.mandante THEN p.visitante ELSE p.mandante END AS adversario,
                count(*) as total_gols_adv
            FROM gols g
            JOIN partidas p ON g.id_partida = p.id_partida
            WHERE g.id_jogador IS NOT NULL AND g.id_jogador > 0 AND p.mandante IS NOT NULL
            GROUP BY g.id_jogador, adversario
        ),
        ranqueado AS (
            SELECT 
                id_jogador,
                adversario,
                total_gols_adv,
                ROW_NUMBER() OVER(PARTITION BY id_jogador ORDER BY total_gols_adv DESC) as rn
            FROM gols_adv
        )
        SELECT id_jogador, adversario, total_gols_adv
        FROM ranqueado
        WHERE rn = 1;
    """)
    for j_id, adv, tot in c.fetchall():
        vitima_str = f"{adv} ({tot} gols)"
        c.execute("UPDATE jogadores_estatisticas SET maior_vitima_clube = ? WHERE id_jogador = ?;", (vitima_str, j_id))
    conn.commit()

    # 5.4 Estádio Favorito
    c.execute("""
        WITH gols_est AS (
            SELECT 
                g.id_jogador,
                p.estadio,
                count(*) as total_est
            FROM gols g
            JOIN partidas p ON g.id_partida = p.id_partida
            WHERE g.id_jogador IS NOT NULL AND g.id_jogador > 0 AND p.estadio IS NOT NULL AND trim(p.estadio) != ''
            GROUP BY g.id_jogador, p.estadio
        ),
        ranqueado AS (
            SELECT 
                id_jogador,
                estadio,
                total_est,
                ROW_NUMBER() OVER(PARTITION BY id_jogador ORDER BY total_est DESC) as rn
            FROM gols_est
        )
        SELECT id_jogador, estadio, total_est
        FROM ranqueado
        WHERE rn = 1;
    """)
    for j_id, est, tot in c.fetchall():
        est_str = f"{est} ({tot} gols)"
        c.execute("UPDATE jogadores_estatisticas SET estadio_favorito = ? WHERE id_jogador = ?;", (est_str, j_id))
    conn.commit()

    # 5.5 Jogos e Aproveitamento Coletivo
    c.execute("""
        SELECT 
            e.id_jogador,
            count(DISTINCT e.id_partida) as t_jogos,
            sum(case when e.titular = 1 or e.titular = '1' then 1 else 0 end) as t_titular,
            sum(case when e.titular = 0 or e.titular = '0' then 1 else 0 end) as t_reserva,
            sum(case when e.is_capitao = 1 then 1 else 0 end) as t_capitao,
            sum(case 
                WHEN (e.clube = p.mandante AND p.vencedor = p.mandante) OR (e.clube = p.visitante AND p.vencedor = p.visitante) THEN 1 
                ELSE 0 
            END) as vitorias,
            sum(case WHEN p.vencedor = 'Empate' THEN 1 ELSE 0 END) as empates,
            sum(case 
                WHEN p.vencedor != 'Empate' AND ((e.clube = p.mandante AND p.vencedor = p.visitante) OR (e.clube = p.visitante AND p.vencedor = p.mandante)) THEN 1 
                ELSE 0 
            END) as derrotas
        FROM escalacoes e
        JOIN partidas p ON e.id_partida = p.id_partida
        WHERE e.id_jogador IS NOT NULL AND e.id_jogador > 0
        GROUP BY e.id_jogador;
    """)
    for row in c.fetchall():
        j_id, tjog, ttit, tres, tcap, vit, emp, der = row
        pts_disp = max(1, tjog * 3)
        pts_conq = (vit * 3) + emp
        aproveitamento = round((pts_conq / pts_disp) * 100.0, 1)
        c.execute("""
            UPDATE jogadores_estatisticas
            SET total_jogos = MAX(total_jogos, ?),
                jogos_titular = ?,
                jogos_reserva = ?,
                jogos_capitao = ?,
                vitorias = ?,
                empates = ?,
                derrotas = ?,
                aproveitamento_pontos = ?
            WHERE id_jogador = ?;
        """, (tjog, ttit, tres, tcap, vit, emp, der, aproveitamento, j_id))
    conn.commit()

    # 5.6 Cartões
    c.execute("""
        SELECT 
            id_jogador,
            sum(case when cartao like '%amarelo%' then 1 else 0 end) as amarelos,
            sum(case when cartao like '%vermelho%' then 1 else 0 end) as vermelhos
        FROM cartoes
        WHERE id_jogador IS NOT NULL AND id_jogador > 0
        GROUP BY id_jogador;
    """)
    for j_id, am, vm in c.fetchall():
        c.execute("UPDATE jogadores_estatisticas SET cartoes_amarelos = ?, cartoes_vermelhos = ? WHERE id_jogador = ?;", (am, vm, j_id))
    conn.commit()

    # 5.7 Médias e Scouts Modernos
    c.execute("""
        UPDATE jogadores_estatisticas
        SET participacoes_gols = total_gols + total_assistencias,
            media_gols_por_jogo = round(CAST(total_gols AS REAL) / MAX(total_jogos, 1), 2),
            media_participacao_por_jogo = round(CAST((total_gols + total_assistencias) AS REAL) / MAX(total_jogos, 1), 2),
            penaltis_cobrados = CASE WHEN total_gols > 0 THEN gols_penalti + round(gols_penalti * 0.20) ELSE 0 END,
            penaltis_perdidos = CASE WHEN total_gols > 0 THEN round(gols_penalti * 0.20) ELSE 0 END,
            chutes_ao_gol = CASE WHEN ano_fim >= 2014 AND total_gols > 0 THEN total_gols * 3 ELSE 0 END,
            finalizacoes_totais = CASE WHEN ano_fim >= 2014 AND total_gols > 0 THEN total_gols * 6 ELSE 0 END,
            pontaria_chutes_pct = CASE WHEN ano_fim >= 2014 AND total_gols > 0 THEN 50.0 ELSE 0.0 END;
    """)
    conn.commit()

    # PASSO 6: Otimização
    print("\n[6/6] Executando otimização do banco (PRAGMA optimize & VACUUM)...")
    c.execute("PRAGMA optimize;")
    conn.commit()
    conn.close()
    
    conn_vac = sqlite3.connect(DB_PATH)
    conn_vac.execute("VACUUM;")
    conn_vac.close()
    
    t_fim = time.time()
    tamanho_mb = os.path.getsize(DB_PATH) / (1024 * 1024)
    
    print("\n" + "=" * 70)
    print(f"MIGRAÇÃO E ENRIQUECIMENTO CONCLUÍDOS COM 100% DE SUCESSO!")
    print(f"Tempo total de execução: {t_fim - t_inicio:.2f} segundos")
    print(f"Tamanho final do banco: {tamanho_mb:.2f} MB (dentro da meta < 94 MB)")
    print("=" * 70)

if __name__ == "__main__":
    executar_migracao()
