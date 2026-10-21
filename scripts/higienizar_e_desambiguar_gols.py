import sqlite3
import re
import shutil

DB_PATH = "data/futebol.db"
DB_API = "api/data/futebol.db"

def higienizar_gols():
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()

    print("=== INICIANDO FASE 3: HIGIENIZAÇÃO E DESAMBIGUAÇÃO DE GOLS ===")

    # 1. EXPANDIR MÚLTIPLOS ATLETAS EM UMA ÚNICA LINHA (' e ')
    print("\n[1/5] Expandindo linhas com múltiplos atletas agregados (' e ')...")
    c.execute("""
        SELECT g.id_gol, g.id_partida, g.rodada, g.clube, g.atleta, g.minuto, g.tempo, g.tipo_de_gol
        FROM gols g
        WHERE g.atleta LIKE '% e %'
    """)
    bundled = c.fetchall()
    c.execute("SELECT MAX(id_gol) FROM gols")
    max_id = c.fetchone()[0] or 0

    expandidos = 0
    for gid, pid, rod, clube, atleta_str, minuto, tempo, tipo in bundled:
        # Padrão: "Nome 19' e Nome 79'" ou "Nome e Outro"
        partes = atleta_str.split(' e ')
        if len(partes) >= 2:
            # Processa primeira parte
            p1 = partes[0].strip()
            m1 = re.search(r'(\d+[\'’]?p?)', p1)
            min1 = m1.group(1).replace("'", "").replace("’", "") if m1 else minuto
            nome1 = re.sub(r'(\d+[\'’]?p?)', '', p1).strip()
            
            # Atualiza primeira linha
            c.execute("UPDATE gols SET atleta = ?, minuto = ? WHERE id_gol = ?", (nome1, min1, gid))

            # Cria novas linhas para as demais partes
            for px in partes[1:]:
                mx = re.search(r'(\d+[\'’]?p?)', px)
                minx = mx.group(1).replace("'", "").replace("’", "") if mx else minuto
                nomex = re.sub(r'(\d+[\'’]?p?)', '', px).strip()
                tempx = tempo or ("1T" if minx and minx.isdigit() and int(minx) <= 45 else "2T")
                max_id += 1
                c.execute("""
                    INSERT INTO gols (id_gol, id_partida, rodada, clube, atleta, minuto, tempo, tipo_de_gol)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                """, (max_id, pid, rod, clube, nomex, minx, tempx, tipo))
                expandidos += 1

    conn.commit()
    print(f"  -> {len(bundled)} linhas agregadas processadas (+{expandidos} gols criados).")

    # 2. EXPANDIR MULTIPLICADORES: (2), (3), (4), (5)
    print("\n[2/5] Expandindo gols com multiplicadores de artilharia (ex: Zico(3), Pelé(2))...")
    c.execute("""
        SELECT id_gol, id_partida, rodada, clube, atleta, minuto, tempo, tipo_de_gol
        FROM gols
        WHERE atleta REGEXP '\\(\\d+\\)'
    """) if hasattr(c, 'regexp') else c.execute("""
        SELECT id_gol, id_partida, rodada, clube, atleta, minuto, tempo, tipo_de_gol
        FROM gols
        WHERE atleta LIKE '%(2)%' OR atleta LIKE '%(3)%' OR atleta LIKE '%(4)%' OR atleta LIKE '%(5)%' OR atleta LIKE '%(6)%'
    """)
    multipliers = c.fetchall()

    gols_multiplicados = 0
    for gid, pid, rod, clube, atleta_str, minuto, tempo, tipo in multipliers:
        m = re.search(r'^(.*?)\s*\((\d+)\)$', atleta_str.strip())
        if m:
            nome_limpo = m.group(1).strip()
            qtd = int(m.group(2))
            # Atualiza linha original
            c.execute("UPDATE gols SET atleta = ? WHERE id_gol = ?", (nome_limpo, gid))
            # Insere as outras (qtd - 1) ocorrências
            for _ in range(qtd - 1):
                max_id += 1
                c.execute("""
                    INSERT INTO gols (id_gol, id_partida, rodada, clube, atleta, minuto, tempo, tipo_de_gol)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                """, (max_id, pid, rod, clube, nome_limpo, minuto, tempo, tipo))
                gols_multiplicados += 1

    conn.commit()
    print(f"  -> {len(multipliers)} registros expandidos (+{gols_multiplicados} gols computados com exatidão).")

    # 3. HIGIENIZAR MINUTOS E PREFIXOS/SUFIXOS NOS NOMES DOS ATLETAS
    print("\n[3/5] Higienizando strings com minutos anexados no campo 'atleta'...")
    c.execute("SELECT id_gol, atleta, minuto, tempo, tipo_de_gol FROM gols")
    todos_gols = c.fetchall()

    limpos = 0
    for gid, atleta, minuto, tempo, tipo in todos_gols:
        if not atleta:
            continue
        original = atleta
        novo_atleta = atleta.strip()
        novo_minuto = minuto or ""
        novo_tempo = tempo or ""
        novo_tipo = tipo or "Normal"

        # Caso 1: Minuto no início (ex: "18' Maurinho", "57' Marcelinho Carioca")
        m_ini = re.match(r'^(\d+)[\'’]\s*(.*)$', novo_atleta)
        if m_ini:
            min_extraido = m_ini.group(1)
            novo_atleta = m_ini.group(2).strip()
            if not novo_minuto:
                novo_minuto = min_extraido
                novo_tempo = "1T" if int(min_extraido) <= 45 else "2T"

        # Caso 2: Minuto no final (ex: "Romário 22'", "Luís Fabiano 38'p", "Dario 29'")
        m_fim = re.search(r'\s+(\d+)[\'’]?(p|pen)?$', novo_atleta, flags=re.I)
        if m_fim:
            min_extraido = m_fim.group(1)
            is_pen = m_fim.group(2)
            novo_atleta = novo_atleta[:m_fim.start()].strip()
            if not novo_minuto:
                novo_minuto = min_extraido
                novo_tempo = "1T" if int(min_extraido) <= 45 else "2T"
            if is_pen:
                novo_tipo = "Pênalti"

        # Caso 3: "pen" ou "(p)" solto no nome (ex: "Romário pen")
        if re.search(r'\s+(pen|p)$', novo_atleta, flags=re.I):
            novo_atleta = re.sub(r'\s+(pen|p)$', '', novo_atleta, flags=re.I).strip()
            novo_tipo = "Pênalti"

        # Caso 4: Vírgulas e espaços sujos nas pontas
        novo_atleta = novo_atleta.strip(" ,.-")

        # Atualiza se mudou
        if novo_atleta != original or novo_minuto != minuto or novo_tipo != tipo:
            c.execute("""
                UPDATE gols 
                SET atleta = ?, minuto = ?, tempo = ?, tipo_de_gol = ?
                WHERE id_gol = ?
            """, (novo_atleta, novo_minuto, novo_tempo, novo_tipo, gid))
            limpos += 1

    conn.commit()
    print(f"  -> {limpos} nomes higienizados com minutos devidamente atribuídos.")

    # 4. DESAMBIGUAÇÃO CANÔNICA DE HOMÔNIMOS
    print("\n[4/5] Desambiguando atletas históricos homônimos...")
    # A) Serginho Chulapa
    c.execute("""
        UPDATE gols 
        SET atleta = 'Serginho Chulapa'
        WHERE atleta = 'Serginho'
          AND clube IN ('São Paulo', 'Santos', 'Corinthians')
          AND id_partida IN (SELECT id_partida FROM partidas WHERE ano BETWEEN 1973 AND 1990)
    """)
    n_chulapa = c.rowcount
    print(f"  -> Serginho Chulapa: {n_chulapa} gols canônicos desambiguados no SPFC/Santos/Corinthians.")

    # B) Careca Bianchezi vs Careca
    c.execute("""
        UPDATE gols 
        SET atleta = 'Careca Bianchezi'
        WHERE atleta = 'Careca'
          AND clube = 'Palmeiras'
          AND id_partida IN (SELECT id_partida FROM partidas WHERE ano BETWEEN 1989 AND 1993)
    """)
    n_bianchezi = c.rowcount
    print(f"  -> Careca Bianchezi: {n_bianchezi} gols desambiguados no Palmeiras.")

    # C) Dario (Dadá Maravilha)
    c.execute("""
        UPDATE gols 
        SET atleta = 'Dario (Dadá Maravilha)'
        WHERE (atleta = 'Dario' OR atleta = 'Dadá Maravilha')
          AND clube IN ('Atlético-MG', 'Internacional', 'Sport', 'Ponte Preta', 'Paysandu', 'Bahia', 'Coritiba', 'Santa Cruz', 'Goiás', 'Nacional-AM')
          AND id_partida IN (SELECT id_partida FROM partidas WHERE ano BETWEEN 1968 AND 1986)
    """)
    n_dada = c.rowcount
    print(f"  -> Dario (Dadá Maravilha): {n_dada} gols canônicos unificados.")

    # D) Túlio Maravilha
    c.execute("""
        UPDATE gols 
        SET atleta = 'Túlio Maravilha'
        WHERE (atleta = 'Túlio' OR atleta = 'Tulio' OR atleta = 'Túlio Maravilha')
          AND clube IN ('Goiás', 'Botafogo', 'Corinthians', 'Vitória', 'Fluminense', 'São Caetano', 'Vila Nova', 'Santa Cruz')
    """)
    n_tulio = c.rowcount
    print(f"  -> Túlio Maravilha: {n_tulio} gols unificados.")

    # E) Marcelinho Carioca
    c.execute("""
        UPDATE gols 
        SET atleta = 'Marcelinho Carioca'
        WHERE atleta IN ('Marcelinho', 'Marcelinho Carioca')
          AND clube IN ('Corinthians', 'Flamengo', 'Vasco', 'Santos', 'Brasiliense', 'Santo André', 'Madureira')
    """)
    n_marcelinho = c.rowcount
    print(f"  -> Marcelinho Carioca: {n_marcelinho} gols unificados.")

    conn.commit()

    # 5. RECONSTRUIR JOGADORES_RESUMO E SINCRONIZAR
    print("\n[5/5] Reconciliando estatísticas em 'jogadores_resumo' e sincronizando com API...")
    try:
        from scripts.unificar_e_reconstruir_craques import unificar_banco
    except ImportError:
        from unificar_e_reconstruir_craques import unificar_banco
    unificar_banco(DB_PATH)

    shutil.copy2(DB_PATH, DB_API)
    print(f"[OK] Banco {DB_PATH} sincronizado com {DB_API}.")
    conn.close()

if __name__ == "__main__":
    higienizar_gols()
