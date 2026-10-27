#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
corrigir_desambiguacao_estrita.py
Desambiguação Cirúrgica e Resolução Estrita de Homônimos (FutStats):
===================================================================
1. Corrige o super-merge indevido de prefixos (ex: Pedro vs Pedro Rocha vs Pedro Raul vs Pedro Henrique).
2. Separa atacantes e volantes com mesmo nome (Bruno Henrique Pinto vs Bruno Henrique Corsini).
3. Aplica validação estrita de Carreira: (Atleta, Clubes Oficiais, Janela Temporal de Anos).
4. Reatribui cada gol ao seu id_jogador correto ou cria novos perfis para cada homônimo.
5. Recalcula as contagens atômicas em jogadores_estatisticas e jogadores_resumo.
"""

import os
import sqlite3
import time

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DB_PATH = os.path.join(BASE_DIR, "data", "futebol.db")
API_DB_PATH = os.path.join(BASE_DIR, "api", "data", "futebol.db")

def conectar():
    conn = sqlite3.connect(DB_PATH)
    conn.execute("PRAGMA journal_mode = WAL;")
    conn.execute("PRAGMA synchronous = NORMAL;")
    return conn

def obter_ou_criar_perfil(cursor, nome_exibicao, clubes, ano_inicio, ano_fim, posicao="Atacante"):
    cursor.execute("""
        SELECT id_jogador FROM jogadores_estatisticas 
        WHERE nome_exibicao = ? LIMIT 1;
    """, (nome_exibicao,))
    row = cursor.fetchone()
    if row:
        return row[0]
        
    cursor.execute("SELECT MAX(id_jogador) FROM jogadores_estatisticas;")
    novo_id = max(cursor.fetchone()[0] or 0, 100000) + 1
    
    cursor.execute("""
        INSERT INTO jogadores_estatisticas (
            id_jogador, nome_exibicao, nome_completo, apelido, posicao, clubes,
            ano_inicio, ano_fim, total_jogos, total_gols
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, 0);
    """, (novo_id, nome_exibicao, nome_exibicao, nome_exibicao, posicao, clubes, ano_inicio, ano_fim))
    return novo_id

def separar_pedros(conn):
    print("\n--- [PASSO 1] Desambiguando 'Pedro' e seus Homônimos ---")
    c = conn.cursor()
    
    # 1. Pedro Guilherme (ID 10 - Centroavante do Flamengo e Fluminense)
    # Gols legítimos: apenas gols onde atleta é 'Pedro' ou 'Pedro Guilherme' no Flamengo e Fluminense (2016-2026)
    c.execute("""
        SELECT id_gol, g.atleta, g.clube, p.ano
        FROM gols g
        JOIN partidas p ON g.id_partida = p.id_partida
        WHERE g.id_jogador = 10;
    """)
    gols_pedro_all = c.fetchall()
    
    reatribuidos = 0
    mantidos = 0
    
    for id_gol, atleta, clube, ano in gols_pedro_all:
        atleta_clean = atleta.strip()
        clube_clean = (clube or "").strip()
        
        # O Pedro do Flamengo/Fluminense
        is_pedro_fla_flu = (
            atleta_clean in ("Pedro", "Pedro Guilherme", "Pedro Guilherme Abreu dos Santos")
            and clube_clean in ("Flamengo", "Fluminense")
            and ano >= 2016
        )
        
        if is_pedro_fla_flu:
            mantidos += 1
            continue
            
        # Caso seja Pedro Rocha (São Paulo / Coritiba / Palmeiras - Anos 70)
        if "Pedro Rocha" in atleta_clean and ano <= 1985:
            pid = obter_ou_criar_perfil(c, "Pedro Rocha (São Paulo - Anos 70)", "São Paulo,Coritiba,Palmeiras", 1970, 1980, "Meio-campo")
            c.execute("UPDATE gols SET id_jogador = ? WHERE id_gol = ?;", (pid, id_gol))
            reatribuidos += 1
            continue
            
        # Caso seja Pedro Rocha (Atacante Grêmio / Cruzeiro / Fortaleza / Remo - Anos 2010/2020)
        if "Pedro Rocha" in atleta_clean:
            pid = obter_ou_criar_perfil(c, "Pedro Rocha", "Grêmio,Cruzeiro,Fortaleza,Athletico-PR,Remo,Flamengo", 2014, 2026, "Atacante")
            c.execute("UPDATE gols SET id_jogador = ? WHERE id_gol = ?;", (pid, id_gol))
            reatribuidos += 1
            continue
            
        # Caso seja Pedro Raul
        if "Pedro Raul" in atleta_clean or "Pedro Raúl" in atleta_clean:
            pid = obter_ou_criar_perfil(c, "Pedro Raul", "Botafogo,Goiás,Vasco,Corinthians,Ceará", 2019, 2026, "Atacante")
            c.execute("UPDATE gols SET id_jogador = ? WHERE id_gol = ?;", (pid, id_gol))
            reatribuidos += 1
            continue
            
        # Caso seja Pedro Henrique
        if "Pedro Henrique" in atleta_clean:
            pid = obter_ou_criar_perfil(c, "Pedro Henrique", "Internacional,Corinthians,Athletico-PR", 2015, 2026, "Atacante")
            c.execute("UPDATE gols SET id_jogador = ? WHERE id_gol = ?;", (pid, id_gol))
            reatribuidos += 1
            continue
            
        # Caso seja Pedro Geromel
        if "Geromel" in atleta_clean:
            pid = obter_ou_criar_perfil(c, "Pedro Geromel", "Grêmio", 2014, 2024, "Zagueiro")
            c.execute("UPDATE gols SET id_jogador = ? WHERE id_gol = ?;", (pid, id_gol))
            reatribuidos += 1
            continue
            
        # Caso seja Pedro Júnior
        if "Pedro Júnior" in atleta_clean:
            pid = obter_ou_criar_perfil(c, "Pedro Júnior", "Grêmio,Cruzeiro,Vila Nova", 2005, 2021, "Atacante")
            c.execute("UPDATE gols SET id_jogador = ? WHERE id_gol = ?;", (pid, id_gol))
            reatribuidos += 1
            continue
            
        # Caso seja Pedro Ken
        if "Pedro Ken" in atleta_clean:
            pid = obter_ou_criar_perfil(c, "Pedro Ken", "Coritiba,Cruzeiro,Vasco,Ceará", 2007, 2020, "Meio-campo")
            c.execute("UPDATE gols SET id_jogador = ? WHERE id_gol = ?;", (pid, id_gol))
            reatribuidos += 1
            continue
            
        # Caso seja Pedro Oldoni
        if "Oldoni" in atleta_clean:
            pid = obter_ou_criar_perfil(c, "Pedro Oldoni", "Athletico-PR,Vitória,Atlético-MG", 2005, 2015, "Atacante")
            c.execute("UPDATE gols SET id_jogador = ? WHERE id_gol = ?;", (pid, id_gol))
            reatribuidos += 1
            continue
            
        # Caso seja Pedro Carmona
        if "Carmona" in atleta_clean:
            pid = obter_ou_criar_perfil(c, "Pedro Carmona", "Palmeiras,Criciúma,Náutico,Novorizontino", 2011, 2024, "Meio-campo")
            c.execute("UPDATE gols SET id_jogador = ? WHERE id_gol = ?;", (pid, id_gol))
            reatribuidos += 1
            continue
            
        # Caso seja outro Pedro histórico/regional
        nome_outro = atleta_clean if len(atleta_clean) > 5 else f"Pedro ({clube_clean})"
        pid = obter_ou_criar_perfil(c, nome_outro, clube_clean, ano, ano, "Atacante")
        c.execute("UPDATE gols SET id_jogador = ? WHERE id_gol = ?;", (pid, id_gol))
        reatribuidos += 1
        
    conn.commit()
    print(f"  -> Gols legítimos mantidos no Pedro (Flamengo/Fluminense): {mantidos}")
    print(f"  -> Gols de outros 'Pedros' reatribuídos para seus respectivos perfis: {reatribuidos}")

def separar_bruno_henriques(conn):
    print("\n--- [PASSO 2] Separando Atacante Bruno Henrique do Volante Bruno Henrique Corsini ---")
    c = conn.cursor()
    
    # ID 34 = Bruno Henrique Pinto (Atacante Flamengo / Santos / Goiás)
    # Criar ID para o volante Bruno Henrique Corsini (Corinthians / Palmeiras / Internacional)
    id_volante = obter_ou_criar_perfil(c, "Bruno Henrique (Volante)", "Corinthians,Palmeiras,Internacional,Portuguesa", 2013, 2026, "Meio-campo")
    
    # Gols do volante no Corinthians, Palmeiras, Internacional e Portuguesa
    c.execute("""
        UPDATE gols 
        SET id_jogador = ? 
        WHERE id_jogador = 34 
          AND clube IN ('Corinthians', 'Palmeiras', 'Internacional', 'Portuguesa');
    """, (id_volante,))
    gols_volante = c.rowcount
    
    # Limpar outros atletas que colaram no Bruno Henrique atacante
    c.execute("""
        SELECT id_gol, atleta, clube, p.ano 
        FROM gols g
        JOIN partidas p ON g.id_partida = p.id_partida
        WHERE g.id_jogador = 34 AND g.clube NOT IN ('Flamengo', 'Santos', 'Goiás');
    """)
    outros = c.fetchall()
    reatribuidos_bh = 0
    for id_gol, atleta, clube, ano in outros:
        pid = obter_ou_criar_perfil(c, atleta if len(atleta) > 14 else f"{atleta} ({clube})", clube, ano, ano, "Atacante")
        c.execute("UPDATE gols SET id_jogador = ? WHERE id_gol = ?;", (pid, id_gol))
        reatribuidos_bh += 1
        
    conn.commit()
    print(f"  -> {gols_volante} gols do volante Bruno Henrique transferidos para seu perfil dedicado.")
    print(f"  -> {reatribuidos_bh} gols avulsos de outros clubes transferidos.")

def separar_danilos(conn):
    print("\n--- [PASSO 3] Separando Homônimos 'Danilo' (Meia do SPFC/Corinthians vs Lateral vs Zagueiro vs Volante) ---")
    c = conn.cursor()
    
    # 1. Volante Danilo (Palmeiras / Nottingham Forest) - 2020 a 2023
    id_danilo_volante = obter_ou_criar_perfil(c, "Danilo (Palmeiras - Volante)", "Palmeiras", 2020, 2023, "Meio-campo")
    c.execute("""
        UPDATE gols 
        SET id_jogador = ? 
        WHERE id_jogador = 124 
          AND clube = 'Palmeiras' 
          AND id_partida IN (SELECT id_partida FROM partidas WHERE ano >= 2020);
    """, (id_danilo_volante,))
    gols_danilo_volante = c.rowcount

    # 2. Zagueiro Danilo (Palmeiras / Udinese) - 2009 a 2011
    id_danilo_zagueiro = obter_ou_criar_perfil(c, "Danilo (Palmeiras - Zagueiro)", "Palmeiras", 2009, 2011, "Zagueiro")
    c.execute("""
        UPDATE gols 
        SET id_jogador = ? 
        WHERE id_jogador = 124 
          AND clube = 'Palmeiras' 
          AND id_partida IN (SELECT id_partida FROM partidas WHERE ano BETWEEN 2009 AND 2011);
    """, (id_danilo_zagueiro,))
    gols_danilo_zag = c.rowcount

    # 3. Lateral Danilo (Santos / Real Madrid / Juventus) - 2010 a 2011
    id_danilo_lateral = obter_ou_criar_perfil(c, "Danilo (Santos - Lateral)", "Santos", 2010, 2011, "Lateral")
    c.execute("""
        UPDATE gols 
        SET id_jogador = ? 
        WHERE id_jogador = 124 
          AND clube = 'Santos';
    """, (id_danilo_lateral,))
    gols_danilo_lat = c.rowcount

    # 4. Outros clubes recentes espúrios (ex: Ponte Preta 2026)
    c.execute("""
        UPDATE gols
        SET id_jogador = ?
        WHERE id_jogador = 124 AND clube = 'Ponte Preta';
    """, (id_danilo_volante,))

    conn.commit()
    print(f"  -> {gols_danilo_volante} gols do volante Danilo transferidos.")
    print(f"  -> {gols_danilo_zag} gols do zagueiro Danilo transferidos.")
    print(f"  -> {gols_danilo_lat} gols do lateral Danilo transferidos.")
def separar_caios(conn):
    print("\n--- [PASSO 3B] Desambiguando 'Caio' (ID 3540) ---")
    c = conn.cursor()
    
    # Caio Júnior (ID 3549) - Grêmio 1990-1993
    c.execute("""
        UPDATE gols
        SET id_jogador = 3549
        WHERE id_jogador = 3540
          AND clube = 'Grêmio'
          AND id_partida IN (SELECT id_partida FROM partidas WHERE ano BETWEEN 1990 AND 1993);
    """)
    gols_caio_jr = c.rowcount
    
    # Caio Ribeiro (ID 14640) - Santos (1997, 2000, 2001) e Grêmio (2003)
    c.execute("""
        UPDATE gols
        SET id_jogador = 14640
        WHERE id_jogador = 3540
          AND (
              (clube = 'Santos' AND id_partida IN (SELECT id_partida FROM partidas WHERE ano IN (1997, 2000, 2001)))
              OR (clube = 'Grêmio' AND id_partida IN (SELECT id_partida FROM partidas WHERE ano = 2003))
          );
    """)
    gols_caio_rib = c.rowcount
    
    # Caio Paraná (ID 101798) - Paraná 2003
    id_caio_parana = obter_ou_criar_perfil(c, "Caio (Paraná Clube - Anos 2000)", "Paraná", 2003, 2003, "Meio-campo")
    c.execute("""
        UPDATE gols
        SET id_jogador = ?
        WHERE id_jogador = 3540
          AND clube = 'Paraná'
          AND id_partida IN (SELECT id_partida FROM partidas WHERE ano = 2003);
    """, (id_caio_parana,))
    gols_caio_pr = c.rowcount
    
    # Qualquer gol remanescente em 3540 (se houver)
    c.execute("SELECT COUNT(*) FROM gols WHERE id_jogador = 3540;")
    restantes = c.fetchone()[0]
    if restantes == 0:
        c.execute("UPDATE jogadores_estatisticas SET total_gols = 0, clubes = '' WHERE id_jogador = 3540;")
        
    conn.commit()
    print(f"  -> {gols_caio_jr} gols transferidos para Caio Júnior (ID 3549).")
    print(f"  -> {gols_caio_rib} gols transferidos para Caio Ribeiro (ID 14640).")
    print(f"  -> {gols_caio_pr} gols transferidos para Caio Paraná (ID {id_caio_parana}).")

def ajustar_toninho_guerreiro(conn):
    print("\n--- [PASSO 3C] Ajustando Toninho Guerreiro (ID 13108) ---")
    c = conn.cursor()
    c.execute("""
        UPDATE jogadores_estatisticas
        SET nome_exibicao = 'Toninho Guerreiro',
            nome_completo = 'Antônio Ferreira (Toninho Guerreiro)',
            apelido = 'Toninho Guerreiro',
            ogol_id = 313716,
            gols_carreira_oficiais = 168,
            jogos_carreira_oficiais = 232,
            assistencias_carreira_oficiais = 1,
            clubes = 'Santos,São Paulo,Noroeste,Flamengo,Operário-MS'
        WHERE id_jogador = 13108;
    """)
    conn.commit()
    print("  -> Perfil histórico de Toninho Guerreiro ajustado com sucesso.")

def reconciliar_perfis_oficiais_ogol(conn):
    print("\n--- [PASSO 3D] Conciliação dos Top Atletas com Perfis Oficiais OGol ---")
    c = conn.cursor()
    atualizacoes = [
        # (id_jogador, ogol_id, gols_oficiais, jogos_oficiais, assists_oficiais)
        (13693, 6041, 265, 844, 45),    # Wellington Paulista
        (11470, 32411, 178, 593, 31),   # Rafael Moura
        (11, 36577, 322, 696, 21),      # Germán Cano
        (4672, 3473, 228, 623, 38),     # Deivid
        (2380, 5663, 138, 424, 25),     # Alex Alves
        (13, 95611, 127, 704, 126),     # Dudu
        (13199, 5777, 241, 628, 5),     # Tuta
        (34, 250453, 163, 563, 85),     # Bruno Henrique atacante
        (10, 481359, 239, 495, 49),     # Pedro
        (13108, 313716, 168, 232, 1),   # Toninho Guerreiro
        (3549, 116486, 129, 397, 0),    # Caio Júnior
        (14640, 376572, 72, 304, 12),   # Caio Ribeiro
        (8980, 4663, 242, 521, 55),     # Luizão (Pentacampeão)
        (174, 5417, 231, 579, 30),      # Christian
        (2987, 3132, 252, 534, 40),     # Aílton (Gonçalves da Silva)
        (124, 5679, 94, 751, 65),       # Danilo (Zidanilo)
    ]
    for jid, oid, gols, jogos, assists in atualizacoes:
        c.execute("""
            UPDATE jogadores_estatisticas
            SET ogol_id = ?, gols_carreira_oficiais = ?, jogos_carreira_oficiais = ?,
                assistencias_carreira_oficiais = ?
            WHERE id_jogador = ?;
        """, (oid, gols, jogos, assists, jid))
    conn.commit()
    print("  -> Perfis oficiais OGol e metadados de carreira conciliados com sucesso.")

def recalcular_contagens_totais(conn):
    print("\n--- [PASSO 4] Recalculando Contagens Atômicas Exatas ---")
    c = conn.cursor()
    
    c.execute("""
        CREATE TEMP TABLE temp_contagem_exata AS
        SELECT id_jogador, COUNT(*) as qtd, MIN(p.ano) as amin, MAX(p.ano) as amax
        FROM gols g
        JOIN partidas p ON g.id_partida = p.id_partida
        WHERE id_jogador IS NOT NULL
        GROUP BY id_jogador;
    """)
    
    # Atualiza jogadores_estatisticas
    c.execute("""
        UPDATE jogadores_estatisticas
        SET total_gols = COALESCE((
            SELECT te.qtd FROM temp_contagem_exata te WHERE te.id_jogador = jogadores_estatisticas.id_jogador
        ), 0);
    """)
    
    # Ajusta total_jogos para nunca ser menor que total_gols
    c.execute("""
        UPDATE jogadores_estatisticas
        SET total_jogos = total_gols
        WHERE total_jogos < total_gols;
    """)
    
    # Atualiza anos de carreira
    c.execute("""
        UPDATE jogadores_estatisticas
        SET ano_inicio = COALESCE((SELECT amin FROM temp_contagem_exata te WHERE te.id_jogador = jogadores_estatisticas.id_jogador), ano_inicio),
            ano_fim = COALESCE((SELECT amax FROM temp_contagem_exata te WHERE te.id_jogador = jogadores_estatisticas.id_jogador), ano_fim)
        WHERE id_jogador IN (SELECT id_jogador FROM temp_contagem_exata);
    """)
    
    # Atualiza clubes no perfil de Pedro (ID 10)
    c.execute("""
        UPDATE jogadores_estatisticas
        SET clubes = 'Flamengo,Fluminense',
            nome_completo = 'Pedro Guilherme Abreu dos Santos',
            ano_inicio = 2016,
            ano_fim = 2026
        WHERE id_jogador = 10;
    """)
    
    # Atualiza clubes no perfil de Bruno Henrique atacante (ID 34)
    c.execute("""
        UPDATE jogadores_estatisticas
        SET clubes = 'Flamengo,Santos,Goiás',
            nome_completo = 'Bruno Henrique Pinto',
            ano_inicio = 2015,
            ano_fim = 2026
        WHERE id_jogador = 34;
    """)
    
    c.execute("DROP TABLE IF EXISTS temp_contagem_exata;")
    conn.commit()
    print("  -> Totais e metadados de carreira recalculados com precisão cirúrgica.")

def conferir_craques(conn):
    print("\n--- [PASSO 5] Auditoria de Conferência Final ---")
    c = conn.cursor()
    
    casos = [
        ("Pedro (Flamengo/Fluminense)", 10),
        ("Pedro Rocha", "SELECT id_jogador FROM jogadores_estatisticas WHERE nome_exibicao = 'Pedro Rocha' LIMIT 1"),
        ("Pedro Rocha (Anos 70)", "SELECT id_jogador FROM jogadores_estatisticas WHERE nome_exibicao LIKE 'Pedro Rocha (São Paulo%' LIMIT 1"),
        ("Pedro Raul", "SELECT id_jogador FROM jogadores_estatisticas WHERE nome_exibicao = 'Pedro Raul' LIMIT 1"),
        ("Pedro Henrique", "SELECT id_jogador FROM jogadores_estatisticas WHERE nome_exibicao = 'Pedro Henrique' LIMIT 1"),
        ("Bruno Henrique (Atacante)", 34),
        ("Bruno Henrique (Volante)", "SELECT id_jogador FROM jogadores_estatisticas WHERE nome_exibicao = 'Bruno Henrique (Volante)' LIMIT 1"),
        ("Arrascaeta", 8),
        ("Gabriel Barbosa", 7),
        ("Germán Cano", 11)
    ]
    
    print(f"{'Atleta':<32} | {'ID':<8} | {'Gols Reais':<12} | {'Anos':<12} | {'Clubes':<35}")
    print("-" * 110)
    
    for label, query_ou_id in casos:
        if isinstance(query_ou_id, int):
            jid = query_ou_id
        else:
            c.execute(query_ou_id)
            row = c.fetchone()
            jid = row[0] if row else None
            
        if not jid:
            continue
            
        c.execute("SELECT total_gols, ano_inicio, ano_fim, clubes FROM jogadores_estatisticas WHERE id_jogador = ?;", (jid,))
        meta = c.fetchone()
        if not meta:
            continue
            
        gols_count, a_ini, a_fim, clubes = meta
        anos_str = f"{a_ini}-{a_fim}" if a_ini and a_fim else "N/D"
        clubes_str = (clubes or "")[:35]
        print(f"{label:<32} | {jid:<8} | {gols_count:<12} | {anos_str:<12} | {clubes_str:<35}")

def main():
    print("=" * 75)
    print("  DESAMBIGUAÇÃO CIRÚRGICA DE HOMÔNIMOS (FUTSTATS)")
    print("=" * 75)
    
    conn = conectar()
    try:
        separar_pedros(conn)
        separar_bruno_henriques(conn)
        separar_danilos(conn)
        separar_caios(conn)
        ajustar_toninho_guerreiro(conn)
        reconciliar_perfis_oficiais_ogol(conn)
        recalcular_contagens_totais(conn)
        conferir_craques(conn)
        
        # PRAGMA optimize
        conn.execute("PRAGMA optimize;")
        conn.close()
        
        if os.path.exists(API_DB_PATH):
            import shutil
            shutil.copy2(DB_PATH, API_DB_PATH)
            print(f"\n[OK] Banco espelhado {API_DB_PATH} atualizado.")
            
        print("\n" + "=" * 75)
        print("  DESAMBIGUAÇÃO E SANITIZAÇÃO CONCLUÍDAS COM SUCESSO!")
        print("=" * 75)
    except Exception as e:
        import traceback
        print(f"[ERRO]: {e}")
        traceback.print_exc()
        conn.close()

if __name__ == "__main__":
    main()
