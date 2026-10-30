#!/usr/bin/env python3
"""
scripts/migrar_m2_conmebol_homonimos_clubes.py

Migração Atômica de Dados - Milestone M2 (FutStats)
Features Implementadas:
- Feature 5: Saneamento Conmebol Invertidas (19997098, 20027112) e Partida Fantasma 202430275
- Feature 6: Desvinculação de Homônimos (Mycael 2066, Pedro 10, Thiago Maia 195, Ganso 16, Alex 2373)
- Feature 7: Sanitização de Clubes Espúrios & Preservação Luís Fabiano (9033, 12282, 8883, 8965, 12105, 13959, 6287, 976, 13)
- Otimização de Storage (VACUUM, ANALYZE, wal_checkpoint) para teto < 94 MB da Vercel.
"""

import os
import sys
import sqlite3

PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
DB_PATH = os.path.join(PROJECT_ROOT, "data", "futebol.db")

def executar_migracao(db_path=DB_PATH):
    print(f"[M2-MIGRATION] Conectando ao banco: {db_path}")
    conn = sqlite3.connect(db_path)
    cur = conn.cursor()
    
    cur.execute("PRAGMA foreign_keys = OFF;")
    cur.execute("BEGIN TRANSACTION;")

    # =========================================================================
    # FEATURE 5: SANEAMENTO CONMEBOL INVERTIDAS & PARTIDA FANTASMA
    # =========================================================================
    print("-> Saneando confrontos Conmebol invertidos...")
    # 1.1 Match 19997098: Palmeiras 3 x 0 River Plate (1999-05-26)
    cur.execute("""
        UPDATE partidas
        SET mandante = 'Palmeiras',
            visitante = 'River Plate',
            gols_mandante = 3,
            gols_visitante = 0,
            placar = '3 x 0',
            vencedor = 'Palmeiras'
        WHERE id_partida = 19997098;
    """)
    cur.execute("UPDATE gols SET clube = 'Palmeiras' WHERE id_partida = 19997098;")
    cur.execute("UPDATE escalacoes SET clube = 'Palmeiras' WHERE id_partida = 19997098;")

    # 1.2 Match 20027112: Grêmio 4 x 0 River Plate (2002-05-01)
    cur.execute("""
        UPDATE partidas
        SET mandante = 'Grêmio',
            visitante = 'River Plate',
            gols_mandante = 4,
            gols_visitante = 0,
            placar = '4 x 0',
            vencedor = 'Grêmio'
        WHERE id_partida = 20027112;
    """)
    cur.execute("UPDATE gols SET clube = 'Grêmio' WHERE id_partida = 20027112;")
    cur.execute("UPDATE escalacoes SET clube = 'Grêmio' WHERE id_partida = 20027112;")

    # 1.3 Deletar partida fantasma vazia 202430275 (duplicata de Grêmio 4x0 River)
    cur.execute("DELETE FROM partidas WHERE id_partida = 202430275;")

    # 1.4 Expurgar gols fantasmas em partidas 0x0 da Copa Libertadores
    cur.execute("""
        DELETE FROM gols
        WHERE id_partida IN (
            SELECT id_partida FROM partidas 
            WHERE campeonato LIKE '%Libertadores%' AND (placar = '0 x 0' OR placar = '0-0')
        );
    """)

    # 1.5 Corrigir demais confrontos Conmebol invertidos de clubes brasileiros
    # Estudiantes 0 x 2 Flamengo (Supercopa 1991, gols Zinho e Gaúcho)
    cur.execute("""
        UPDATE partidas
        SET gols_mandante = 0,
            gols_visitante = 2,
            placar = '0 x 2',
            vencedor = 'Flamengo'
        WHERE id_partida = 19918508;
    """)
    cur.execute("UPDATE gols SET clube = 'Flamengo' WHERE id_partida = 19918508;")

    # Atlético-MG 2 x 0 Newell's Old Boys (Libertadores 2013, gols Bernard e Guilherme)
    cur.execute("""
        UPDATE partidas
        SET gols_mandante = 2,
            gols_visitante = 0,
            placar = '2 x 0',
            vencedor = 'Atlético-MG'
        WHERE id_partida = 20137118;
    """)
    cur.execute("UPDATE gols SET clube = 'Atlético-MG' WHERE id_partida = 20137118;")
    cur.execute("UPDATE escalacoes SET clube = 'Atlético-MG' WHERE id_partida = 20137118;")

    # Palmeiras 2 x 0 Colo Colo (Libertadores 2018, gols Dudu e Borja)
    cur.execute("""
        UPDATE partidas
        SET gols_mandante = 2,
            gols_visitante = 0,
            placar = '2 x 0',
            vencedor = 'Palmeiras'
        WHERE id_partida = 20187146;
    """)
    cur.execute("UPDATE gols SET clube = 'Palmeiras' WHERE id_partida = 20187146;")
    cur.execute("UPDATE escalacoes SET clube = 'Palmeiras' WHERE id_partida = 20187146;")

    # =========================================================================
    # FEATURE 6: DESVINCULAÇÃO DE HOMÔNIMOS
    # =========================================================================
    print("-> Desvinculando homônimos e restaurando perfis legítimos...")
    
    # 2.1 Mycael (ID 2066) vs Alberto "Beto" Acosta (17 gols 1988-1997)
    cur.execute("UPDATE gols SET id_jogador = NULL WHERE id_jogador = 2066;")
    cur.execute("""
        UPDATE jogadores_estatisticas
        SET posicao = 'Goleiro',
            clubes = 'Athletico-PR',
            ano_inicio = 2023,
            ano_fim = 2026,
            total_jogos = 29,
            jogos_titular = 9,
            jogos_reserva = 20,
            jogos_capitao = 0,
            vitorias = 12,
            empates = 8,
            derrotas = 9,
            aproveitamento_pontos = 50.57,
            total_gols = 0,
            gols_bola_rolando = 0,
            gols_penalti = 0,
            gols_falta = 0,
            gols_cabeca = 0,
            gols_primeiro_tempo = 0,
            gols_segundo_tempo = 0,
            gols_decisivos_80mais = 0,
            gols_mandante = 0,
            gols_visitante = 0,
            gols_classicos = 0,
            gols_finais = 0,
            hat_tricks = 0,
            dobletes = 0,
            total_assistencias = 0,
            participacoes_gols = 0,
            media_gols_por_jogo = 0.0,
            media_participacao_por_jogo = 0.0,
            chutes_ao_gol = 0,
            finalizacoes_totais = 0,
            pontaria_chutes_pct = 0.0,
            penaltis_cobrados = 0,
            penaltis_perdidos = 0,
            cartoes_amarelos = 0,
            cartoes_vermelhos = 0,
            clean_sheets = 1,
            maior_vitima_clube = NULL,
            estadio_favorito = NULL,
            gols_carreira_oficiais = 0,
            jogos_carreira_oficiais = 29,
            assistencias_carreira_oficiais = 0,
            detalhe_carreira_clubes = '[{"clube": "Athletico-PR", "jogos": 29, "gols": 0}]',
            data_nascimento = '2004-03-12',
            idade = 22,
            nacionalidade = 'Brasil',
            naturalidade = 'Porto Velho',
            situacao = 'Em atividade',
            pe_preferencial = 'Canhoto',
            data_ultima_auditoria = CURRENT_TIMESTAMP
        WHERE id_jogador = 2066;
    """)
    cur.execute("UPDATE jogadores SET posicao = 'Goleiro', clubes = 'Athletico-PR', total_gols = 0 WHERE id_jogador = 2066;")

    # 2.2 Pedro (ID 10) vs Guabirá (partida 202533214)
    cur.execute("UPDATE escalacoes SET id_jogador = NULL WHERE id_partida = 202533214 AND id_jogador = 10;")
    cur.execute("""
        UPDATE jogadores_estatisticas
        SET clubes = TRIM(REPLACE(REPLACE(clubes, ', Guabirá', ''), 'Guabirá, ', '')),
            total_jogos = 329,
            data_ultima_auditoria = CURRENT_TIMESTAMP
        WHERE id_jogador = 10;
    """)

    # 2.3 Thiago Maia (ID 195) vs Guabirá (partida 202533214)
    cur.execute("UPDATE escalacoes SET id_jogador = NULL WHERE id_partida = 202533214 AND id_jogador = 195;")
    cur.execute("""
        UPDATE jogadores_estatisticas
        SET clubes = TRIM(REPLACE(REPLACE(clubes, ', Guabirá', ''), 'Guabirá, ', '')),
            data_ultima_auditoria = CURRENT_TIMESTAMP
        WHERE id_jogador = 195;
    """)

    # 2.4 Paulo Henrique Ganso (ID 16) vs Henrique (Atlético Goianiense)
    cur.execute("UPDATE gols SET id_jogador = NULL WHERE id_jogador = 16 AND clube LIKE '%Atlético Goianiense%';")
    cur.execute("UPDATE escalacoes SET id_jogador = NULL WHERE id_jogador = 16 AND clube LIKE '%Atlético Goianiense%';")
    cur.execute("""
        UPDATE jogadores_estatisticas
        SET clubes = 'Fluminense, Santos, São Paulo',
            detalhe_carreira_clubes = '[{"clube": "Santos", "periodo": "[2008>2012]", "jogos": 162, "gols": 36, "assistencias": 37}, {"clube": "São Paulo", "periodo": "[2012>2016]", "jogos": 221, "gols": 24, "assistencias": 49}, {"clube": "Sevilla", "periodo": "[2016/2017>2018/2019]", "jogos": 28, "gols": 7, "assistencias": 6}, {"clube": "Amiens", "periodo": "[2018/2019]", "jogos": 13, "gols": 0, "assistencias": 3}, {"clube": "Fluminense", "periodo": "[2019>2026]", "jogos": 268, "gols": 25, "assistencias": 36}, {"clube": "Brasil", "periodo": "[2010>2012]", "jogos": 8, "gols": 0, "assistencias": 1}]',
            total_gols = 38,
            total_jogos = 124,
            media_gols_por_jogo = 0.31,
            data_ultima_auditoria = CURRENT_TIMESTAMP
        WHERE id_jogador = 16;
    """)
    cur.execute("UPDATE jogadores SET clubes = 'Fluminense,Santos,São Paulo', total_gols = 38 WHERE id_jogador = 16;")

    # 2.5 Alex (ID 2373) vs Airton (goleiro Criciúma) & Alex Meschini (Internacional)
    cur.execute("UPDATE escalacoes SET id_jogador = NULL WHERE id_jogador = 2373 AND (atleta LIKE '%Airton%' OR clube = 'Internacional');")
    cur.execute("UPDATE gols SET id_jogador = NULL WHERE id_jogador = 2373 AND clube = 'Internacional';")
    cur.execute("""
        UPDATE jogadores_estatisticas
        SET nome_exibicao = 'Alex',
            apelido = 'Alex Cabeção',
            posicao = 'Meio-campo',
            clubes = 'Coritiba, Palmeiras, Flamengo, Cruzeiro',
            total_jogos = 141,
            data_ultima_auditoria = CURRENT_TIMESTAMP
        WHERE id_jogador = 2373;
    """)
    cur.execute("UPDATE jogadores SET nome_exibicao = 'Alex', apelido = 'Alex Cabeção', posicao = 'Meio-campo', clubes = 'Coritiba,Palmeiras,Flamengo,Cruzeiro' WHERE id_jogador = 2373;")

    # =========================================================================
    # FEATURE 7: SANITIZAÇÃO DE CLUBES ESPÚRIOS & LUÍS FABIANO (ID 9033)
    # =========================================================================
    print("-> Sanitizando clubes de atletas brasileiros e blindando Luís Fabiano...")
    
    # 3.1 Luís Fabiano (ID 9033)
    cur.execute("""
        UPDATE jogadores_estatisticas
        SET clubes = 'Vasco, São Paulo, Ponte Preta',
            data_ultima_auditoria = CURRENT_TIMESTAMP
        WHERE id_jogador = 9033;
    """)

    # 3.2 Roque Júnior (ID 12282)
    cur.execute("""
        UPDATE jogadores_estatisticas
        SET clubes = 'Palmeiras',
            detalhe_carreira_clubes = '[{"clube": "Palmeiras", "periodo": "[1995>2000, 2008]", "jogos": 207, "gols": 16, "assistencias": 2}, {"clube": "Milan", "periodo": "[2000/2001>2003/2004]", "jogos": 75, "gols": 0, "assistencias": 0}, {"clube": "Leeds United", "periodo": "[2003/2004]", "jogos": 7, "gols": 2, "assistencias": 0}, {"clube": "Siena", "periodo": "[2003/2004]", "jogos": 5, "gols": 1, "assistencias": 0}, {"clube": "Bayer Leverkusen", "periodo": "[2004/2005>2006/2007]", "jogos": 49, "gols": 1, "assistencias": 0}, {"clube": "MSV Duisburg", "periodo": "[2007/2008]", "jogos": 8, "gols": 0, "assistencias": 0}, {"clube": "Brasil", "periodo": "[1999>2005]", "jogos": 50, "gols": 2, "assistencias": 0}]',
            data_ultima_auditoria = CURRENT_TIMESTAMP
        WHERE id_jogador = 12282;
    """)

    # 3.3 Luís Mário (ID 8883)
    cur.execute("""
        UPDATE jogadores_estatisticas
        SET clubes = 'Grêmio',
            data_ultima_auditoria = CURRENT_TIMESTAMP
        WHERE id_jogador = 8883;
    """)

    # 3.4 Luizão (ID 8965)
    cur.execute("""
        UPDATE jogadores_estatisticas
        SET clubes = 'São Paulo, Corinthians, Vasco, Palmeiras',
            data_ultima_auditoria = CURRENT_TIMESTAMP
        WHERE id_jogador = 8965;
    """)

    # 3.5 Rodrigo Mendes (ID 12105)
    cur.execute("""
        UPDATE jogadores_estatisticas
        SET clubes = 'Grêmio, Flamengo',
            detalhe_carreira_clubes = '[{"clube": "Flamengo", "periodo": "[1993>1996, 1997, 2000]", "jogos": 141, "gols": 33, "assistencias": 0}, {"clube": "Grêmio", "periodo": "[1996, 1998, 2001>2002]", "jogos": 165, "gols": 68, "assistencias": 0}, {"clube": "Kashima Antlers", "periodo": "[1996>1997]", "jogos": 16, "gols": 4, "assistencias": 0}, {"clube": "Atlético-PR", "periodo": "[1998]", "jogos": 18, "gols": 3, "assistencias": 0}, {"clube": "Al Ain", "periodo": "[2002>2003, 2006>2007]", "jogos": 43, "gols": 23, "assistencias": 0}, {"clube": "Al-Gharafa", "periodo": "[2003>2006]", "jogos": 65, "gols": 41, "assistencias": 0}, {"clube": "Fortaleza", "periodo": "[2008]", "jogos": 13, "gols": 1, "assistencias": 0}]',
            data_ultima_auditoria = CURRENT_TIMESTAMP
        WHERE id_jogador = 12105;
    """)

    # 3.6 Zinho (ID 13959)
    cur.execute("""
        UPDATE jogadores_estatisticas
        SET clubes = 'Flamengo, Palmeiras, Grêmio, Cruzeiro',
            detalhe_carreira_clubes = '[{"clube": "Flamengo", "periodo": "[1986>1992, 2004>2005]", "jogos": 466, "gols": 56, "assistencias": 12}, {"clube": "Palmeiras", "periodo": "[1992>1994, 1997>1999, 2002>2003]", "jogos": 333, "gols": 56, "assistencias": 18}, {"clube": "Grêmio", "periodo": "[2000>2002]", "jogos": 140, "gols": 36, "assistencias": 10}, {"clube": "Cruzeiro", "periodo": "[2003]", "jogos": 43, "gols": 8, "assistencias": 4}, {"clube": "Yokohama Flügels", "periodo": "[1995>1997]", "jogos": 110, "gols": 21, "assistencias": 6}, {"clube": "Miami FC", "periodo": "[2006>2007]", "jogos": 49, "gols": 7, "assistencias": 3}, {"clube": "Brasil", "periodo": "[1989>1998]", "jogos": 57, "gols": 7, "assistencias": 5}]',
            data_ultima_auditoria = CURRENT_TIMESTAMP
        WHERE id_jogador = 13959;
    """)

    # 3.7 Gaúcho (ID 6287)
    cur.execute("""
        UPDATE jogadores_estatisticas
        SET clubes = 'Juventude, Palmeiras, Fluminense, Ponte Preta, Atlético-MG, Flamengo',
            data_ultima_auditoria = CURRENT_TIMESTAMP
        WHERE id_jogador = 6287;
    """)

    # 3.8 Bernard (ID 976)
    cur.execute("""
        UPDATE jogadores_estatisticas
        SET clubes = 'Atlético-MG',
            data_ultima_auditoria = CURRENT_TIMESTAMP
        WHERE id_jogador = 976;
    """)

    # 3.9 Dudu (ID 13)
    cur.execute("""
        UPDATE jogadores_estatisticas
        SET clubes = 'Atlético-MG, Palmeiras, Grêmio, Cruzeiro, Coritiba',
            data_ultima_auditoria = CURRENT_TIMESTAMP
        WHERE id_jogador = 13;
    """)

    conn.commit()
    print("[M2-MIGRATION] Transação comitada com sucesso.")

    # =========================================================================
    # STORAGE OPTIMIZATION & INTEGRITY CHECK
    # =========================================================================
    print("-> Executando VACUUM, ANALYZE e checkpoint...")
    cur.execute("VACUUM;")
    cur.execute("ANALYZE;")
    cur.execute("PRAGMA wal_checkpoint(TRUNCATE);")

    cur.execute("PRAGMA integrity_check;")
    check_res = cur.fetchone()[0]
    print(f"-> PRAGMA integrity_check: {check_res}")
    assert check_res == "ok", f"Integrity check failed: {check_res}"

    conn.close()

    size_bytes = os.path.getsize(db_path)
    size_mb = size_bytes / (1024 * 1024)
    print(f"[M2-MIGRATION] Tamanho final do banco: {size_mb:.2f} MB ({size_bytes} bytes)")
    assert size_mb < 94.0, f"Banco excede limite de 94.0 MB: {size_mb:.2f} MB"
    print("[M2-MIGRATION] Migração concluída com sucesso e teto < 94 MB respeitado!")

if __name__ == "__main__":
    target = sys.argv[1] if len(sys.argv) > 1 else DB_PATH
    executar_migracao(target)
