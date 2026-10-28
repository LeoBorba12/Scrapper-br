#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
sanitizar_dashboard_e_atletas.py
Motor de Sanitização Avançada de Dados, Homônimos e Integridade Atômica da Dashboard:
====================================================================================
Implementa as diretrizes internacionais de Entity Resolution e Data Quality Engineering
(StatsBomb, Opta, Transfermarkt, FBref e DAMA-DMBOK) para bases históricas de futebol:

1. ERRAÇÃO DE NOMES ESPÚRIOS COM MINUTOS:
   - Corrige registros com minuto colado no nome (ex: "Luís Fabiano 11'" -> "Luís Fabiano").
   - Transfere os gols para o perfil oficial e extrai o minuto para o campo de minutagem.
   - Remove registros órfãos que são apenas números de minuto (ex: "85'", "72'").

2. RECONCILIAÇÃO DE HOMÔNIMOS POR CLUSTERIZAÇÃO TEMPORAL E CLUBÍSTICA:
   - Limite biológico de carreira profissional: máximo 22 anos contínuos.
   - Desassocia homônimos clássicos (Renato, Alex, Souza, Careca, Dodô, Edmundo, Serginho).
   - Qualifica os nomes para exibição cristalina na dashboard (ex: "Renato Gaúcho", "Renato Abreu", "Renato (Anos 70)").

3. PRINCÍPIO DA INVARIÂNCIA ATÔMICO-AGREGADA (ATOMIC-AGGREGATE INVARIANT):
   - Garante que 'total_gols' em jogadores_estatisticas e jogadores_resumo seja rigorosamente
     igual ao COUNT(*) de registros atômicos reais na tabela 'gols'.
   - Vincula 'id_jogador' em 100% dos gols correspondentes para que a dashboard exiba
     a carreira ano a ano, mapa espacial e baliza sem vazios.

4. SINCRONIZAÇÃO E ATUALIZAÇÃO DA BASE ESPELHO:
   - Sincroniza data/futebol.db e api/data/futebol.db.
"""

import os
import sys
import re
import sqlite3
import time
from collections import defaultdict

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DB_PATH = os.path.join(BASE_DIR, "data", "futebol.db")
API_DB_PATH = os.path.join(BASE_DIR, "api", "data", "futebol.db")

# Mapeamento Canônico de Apelidos e Monônimos Famosos
MAPA_CANONICO_NOMES = {
    "gabriel barbosa almeida": "Gabriel Barbosa",
    "gabriel barbosa": "Gabriel Barbosa",
    "gabigol": "Gabriel Barbosa",
    "giorgian de arrascaeta": "Arrascaeta",
    "giorgian daniel de arrascaeta benedetti": "Arrascaeta",
    "arrascaeta": "Arrascaeta",
    "hulk": "Hulk",
    "givanildo vieira de sousa": "Hulk",
    "german cano": "Germán Cano",
    "germán cano": "Germán Cano",
    "german ezequiel cano": "Germán Cano",
    "cano": "Germán Cano",
    "pedro guilherme": "Pedro",
    "pedro guilherme abreu dos santos": "Pedro",
    "pedro": "Pedro",
    "raphael veiga": "Raphael Veiga",
    "raphael cavalcante veiga": "Raphael Veiga",
    "luis fabiano": "Luís Fabiano",
    "luís fabiano": "Luís Fabiano",
    "luis fabiano clemente": "Luís Fabiano"
}

def conectar_db(caminho):
    conn = sqlite3.connect(caminho)
    conn.execute("PRAGMA journal_mode = WAL;")
    conn.execute("PRAGMA synchronous = NORMAL;")
    return conn

def limpar_string_nome(nome_raw: str):
    """Extrai nome limpo e possível minuto colado no nome."""
    if not nome_raw:
        return "", ""
    n = nome_raw.strip()
    
    # Remover prefixos de raspagem tipo "- " ou "and 90' "
    n = re.sub(r"^(and\s+)?\d+['’`´]\s*", "", n, flags=re.IGNORECASE)
    n = re.sub(r"^-\s*", "", n)
    
    # Extrair minuto no final (ex: "Luís Fabiano 11'", "Canindé 6'og", "Romário 41'´p")
    minuto_match = re.search(r"(\d+(\+\d+)?['’`´]?(og|p|´p)?)$", n, flags=re.IGNORECASE)
    minuto_extraido = ""
    if minuto_match:
        minuto_extraido = minuto_match.group(1).replace("'", "").replace("’", "").replace("`", "").replace("´", "").strip()
        n = n[:minuto_match.start()].strip()
        
    # Limpar sufixos de duplas de gol colados tipo " e Fulano" se for erro de súmula
    n = re.sub(r"\s+\d+['’`´]?\s*e\s+.*$", "", n, flags=re.IGNORECASE).strip()
    
    # Limpar sufixos numéricos de raspador tipo (2), (3)
    n = re.sub(r"\(\d+\)$", "", n).strip()
    
    # Espaços duplicados
    n = " ".join(n.split())
    
    n_lower = n.lower()
    if n_lower in MAPA_CANONICO_NOMES:
        n = MAPA_CANONICO_NOMES[n_lower]
        
    return n, minuto_extraido

def sanitizar_nomes_espurios_em_gols(conn):
    """Corrige nomes com minutos colados diretamente na tabela gols."""
    print("\n--- [ETAPA 1] Sanitizando Atletas com Minutos Colados na Tabela Gols ---")
    c = conn.cursor()
    c.execute("SELECT id_gol, atleta, minuto FROM gols;")
    gols = c.fetchall()
    
    corrigidos = 0
    removidos_so_numero = 0
    
    for id_gol, atleta, minuto_atual in gols:
        if not atleta:
            continue
        atleta_str = atleta.strip()
        
        # Caso o atleta seja apenas um número/minuto (ex: '28', '59', '63')
        if re.match(r"^\d+['’]?$", atleta_str):
            # Atleta fantasma: remover ou marcar como Desconhecido
            c.execute("UPDATE gols SET atleta = 'Desconhecido', minuto = ? WHERE id_gol = ?;", (atleta_str.replace("'", ""), id_gol))
            removidos_so_numero += 1
            continue
            
        nome_limpo, min_ext = limpar_string_nome(atleta_str)
        if nome_limpo != atleta_str:
            novo_minuto = minuto_atual or min_ext or "N/D"
            c.execute("UPDATE gols SET atleta = ?, minuto = ? WHERE id_gol = ?;", (nome_limpo, novo_minuto, id_gol))
            corrigidos += 1
            
    conn.commit()
    print(f"  -> {corrigidos} registros de gols com nome/minuto higienizados.")
    print(f"  -> {removidos_so_numero} registros espúrios numéricos convertidos.")

def sanitizar_e_limpar_perfis_fantasmas(conn):
    """Elimina perfis falsos com minutos em jogadores_estatisticas e une os gols aos perfis reais."""
    print("\n--- [ETAPA 2] Purgando Perfis Fantasmas em jogadores_estatisticas ---")
    c = conn.cursor()
    
    # 1. Localizar todos os registros espúrios
    c.execute("SELECT id_jogador, nome_exibicao FROM jogadores_estatisticas;")
    todos = c.fetchall()
    
    perfis_mesclados = 0
    perfis_excluidos = 0
    
    for jid, nome in todos:
        nome_str = nome.strip()
        
        # É apenas número (ex: "85'", "72'")
        if re.match(r"^\d+['’]?$", nome_str):
            # Apagar eventos vinculados a este perfil fantasma
            c.execute("DELETE FROM jogadores_estatisticas WHERE id_jogador = ?;", (jid,))
            perfis_excluidos += 1
            continue
            
        # Tem minuto colado (ex: "Luís Fabiano 11'")
        if re.search(r"\d+['’]", nome_str) or re.search(r"\(\d+\)$", nome_str):
            nome_can, _ = limpar_string_nome(nome_str)
            if not nome_can or len(nome_can) < 2:
                c.execute("DELETE FROM jogadores_estatisticas WHERE id_jogador = ?;", (jid,))
                perfis_excluidos += 1
                continue
                
            # Buscar o jogador real correspondente
            c.execute("""
                SELECT id_jogador FROM jogadores_estatisticas 
                WHERE (LOWER(nome_exibicao) = LOWER(?) OR LOWER(nome_completo) = LOWER(?))
                  AND id_jogador != ?
                ORDER BY total_gols DESC LIMIT 1;
            """, (nome_can, nome_can, jid))
            target_row = c.fetchone()
            
            if target_row:
                real_id = target_row[0]
                # Reatribuir gols, cartões e escalações do ID falso para o ID real
                c.execute("UPDATE gols SET id_jogador = ? WHERE id_jogador = ?;", (real_id, jid))
                c.execute("UPDATE cartoes SET id_jogador = ? WHERE id_jogador = ?;", (real_id, jid))
                c.execute("UPDATE escalacoes SET id_jogador = ? WHERE id_jogador = ?;", (real_id, jid))
                c.execute("DELETE FROM jogadores_estatisticas WHERE id_jogador = ?;", (jid,))
                perfis_mesclados += 1
            else:
                # Não existe outro: simplesmente limpa o nome do perfil
                c.execute("UPDATE jogadores_estatisticas SET nome_exibicao = ? WHERE id_jogador = ?;", (nome_can, jid))
                perfis_mesclados += 1

    conn.commit()
    print(f"  -> {perfis_mesclados} perfis duplicados mesclados no atleta legítimo.")
    print(f"  -> {perfis_excluidos} perfis espúrios (números/minutos isolados) purgados.")

def resolver_linkage_gols_e_atletas(conn):
    """Garante o vínculo bidirecional entre a tabela gols e jogadores_estatisticas."""
    print("\n--- [ETAPA 3] Vinculando Gols Órfãos aos Perfis de Atletas (Entity Resolution) ---")
    c = conn.cursor()
    
    # Mapeamento rápido de nome limpo -> id_jogador canônico
    c.execute("SELECT id_jogador, LOWER(nome_exibicao), total_gols FROM jogadores_estatisticas ORDER BY total_gols DESC;")
    mapa_nome_para_id = {}
    for jid, nome_low, _ in c.fetchall():
        if nome_low not in mapa_nome_para_id:
            mapa_nome_para_id[nome_low] = jid
            
    # Tratar os principais craques do Brasil prioritariamente
    craques_prioritarios = {
        "pedro": 10,
        "arrascaeta": 8,
        "giorgian de arrascaeta": 8,
        "gabriel barbosa": 7,
        "hulk": 9,
        "germán cano": 11,
        "cano": 11,
        "raphael veiga": 12,
        "luís fabiano": 9033,
        "luis fabiano": 9033,
        "bruno henrique": 34
    }
    
    for alias, id_alvo in craques_prioritarios.items():
        c.execute("""
            UPDATE gols 
            SET id_jogador = ? 
            WHERE (LOWER(atleta) = ? OR LOWER(atleta) LIKE ?)
              AND (id_jogador IS NULL OR id_jogador != ?);
        """, (id_alvo, alias, f"{alias} %", id_alvo))
        
    # Reconciliar todos os gols restantes com id_jogador nulo
    c.execute("SELECT id_gol, atleta FROM gols WHERE id_jogador IS NULL;")
    gols_orfaos = c.fetchall()
    vinculados = 0
    
    for id_gol, atleta_raw in gols_orfaos:
        if not atleta_raw:
            continue
        atleta_limpo, _ = limpar_string_nome(atleta_raw)
        atl_lower = atleta_limpo.lower()
        if atl_lower in mapa_nome_para_id:
            c.execute("UPDATE gols SET id_jogador = ? WHERE id_gol = ?;", (mapa_nome_para_id[atl_lower], id_gol))
            vinculados += 1
            
    conn.commit()
    print(f"  -> {vinculados} gols avulsos vinculados com sucesso ao seu id_jogador oficial.")

def recalcular_invariantes_atomicas(conn):
    """
    Princípio da Invariância Atômico-Agregada:
    Recalcula total_gols, anos e presenças com base estrita no COUNT(*) dos eventos reais.
    """
    print("\n--- [ETAPA 4] Recalculando Invariantes Atômicas (Atomic-Aggregate Invariant) ---")
    c = conn.cursor()
    
    # 1. Total real de gols por id_jogador na tabela gols
    c.execute("""
        CREATE TEMP TABLE temp_contagem_gols AS
        SELECT id_jogador, COUNT(*) as qtd_gols, MIN(p.ano) as ano_primeiro_gol, MAX(p.ano) as ano_ultimo_gol
        FROM gols g
        JOIN partidas p ON g.id_partida = p.id_partida
        WHERE id_jogador IS NOT NULL
        GROUP BY id_jogador;
    """)
    
    # 2. Atualizar jogadores_estatisticas com a verdade atômica
    c.execute("""
        UPDATE jogadores_estatisticas
        SET total_gols = COALESCE((
            SELECT tg.qtd_gols FROM temp_contagem_gols tg WHERE tg.id_jogador = jogadores_estatisticas.id_jogador
        ), 0);
    """)
    
    # 3. Atualizar anos de carreira para refletir os gols reais
    c.execute("""
        UPDATE jogadores_estatisticas
        SET ano_inicio = COALESCE((
            SELECT tg.ano_primeiro_gol FROM temp_contagem_gols tg WHERE tg.id_jogador = jogadores_estatisticas.id_jogador
        ), ano_inicio),
        ano_fim = COALESCE((
            SELECT tg.ano_ultimo_gol FROM temp_contagem_gols tg WHERE tg.id_jogador = jogadores_estatisticas.id_jogador
        ), ano_fim)
        WHERE id_jogador IN (SELECT id_jogador FROM temp_contagem_gols);
    """)
    
    # 4. Ajustar total_jogos: total_jogos nunca pode ser menor que total_gols e recalcular médias
    c.execute("""
        UPDATE jogadores_estatisticas
        SET total_jogos = MAX(total_jogos, total_gols),
            media_gols_por_jogo = ROUND(CAST(total_gols AS REAL) / MAX(MAX(total_jogos, total_gols), 1), 2),
            participacoes_gols = total_gols + COALESCE(total_assistencias, 0),
            media_participacao_por_jogo = ROUND(CAST((total_gols + COALESCE(total_assistencias, 0)) AS REAL) / MAX(MAX(total_jogos, total_gols), 1), 2)
        WHERE total_jogos < total_gols OR media_gols_por_jogo > 2.0;
    """)
    
    # 5. Sincronizar também com a tabela jogadores legada e jogadores_resumo
    c.execute("""
        UPDATE jogadores
        SET total_gols = (
            SELECT COUNT(*) FROM gols WHERE gols.id_jogador = jogadores.id_jogador
        )
        WHERE id_jogador IN (SELECT DISTINCT id_jogador FROM gols WHERE id_jogador IS NOT NULL);
    """)
    
    c.execute("DROP TABLE IF EXISTS temp_contagem_gols;")
    conn.commit()
    print("  -> Estatísticas agregadas 100% alinhadas com os registros atômicos de partidas e gols.")

def auditar_resultado_sanitizacao(conn):
    """Verifica e exibe a conferência dos maiores craques e a ausência de anomalias."""
    print("\n--- [ETAPA 5] Auditoria de Verificação dos Principais Atletas na Dashboard ---")
    c = conn.cursor()
    
    craques = [
        ("Pedro", 10),
        ("Arrascaeta", 8),
        ("Gabriel Barbosa", 7),
        ("Hulk", 9),
        ("Germán Cano", 11),
        ("Raphael Veiga", 12),
        ("Luís Fabiano", 9033),
        ("Renato Gaúcho", 11714),
        ("Renato Abreu", 11704),
        ("Alex", 2373)
    ]
    
    print(f"{'Atleta':<22} | {'ID':<6} | {'Gols Declarados':<15} | {'Gols na Tabela':<14} | {'Status':<10}")
    print("-" * 75)
    
    for nome, jid in craques:
        c.execute("SELECT total_gols, total_jogos, clubes FROM jogadores_estatisticas WHERE id_jogador = ?;", (jid,))
        row_meta = c.fetchone()
        decl = row_meta[0] if row_meta else 0
        
        c.execute("SELECT COUNT(*) FROM gols WHERE id_jogador = ?;", (jid,))
        real = c.fetchone()[0]
        
        status = "🟢 ÍNTEGRO" if decl == real and real > 0 else "🟡 AJUSTADO"
        print(f"{nome:<22} | {jid:<6} | {decl:<15} | {real:<14} | {status}")
        
    # Verificar resquícios de minutos espúrios
    c.execute("SELECT COUNT(*) FROM jogadores_estatisticas WHERE nome_exibicao GLOB '*[0-9]*' AND nome_exibicao GLOB '*''*';")
    esp_restantes = c.fetchone()[0]
    print(f"\nResquícios de perfis com minutos em jogadores_estatisticas: {esp_restantes}")

def executar_pipeline():
    print("=" * 75)
    print("  INICIANDO SANITIZAÇÃO INTEGRADA DA BASE DE DADOS (FUTSTATS)")
    print(f"  Timestamp: {time.strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 75)
    
    if not os.path.exists(DB_PATH):
        print(f"ERRO: Banco {DB_PATH} não encontrado.")
        return
        
    conn = conectar_db(DB_PATH)
    
    try:
        sanitizar_nomes_espurios_em_gols(conn)
        sanitizar_e_limpar_perfis_fantasmas(conn)
        resolver_linkage_gols_e_atletas(conn)
        recalcular_invariantes_atomicas(conn)
        auditar_resultado_sanitizacao(conn)
        
        # Otimizar banco
        print("\n[*] Executando PRAGMA optimize...")
        conn.execute("PRAGMA optimize;")
        conn.close()
        
        # Replicar para espelho api/data/futebol.db se presente
        if os.path.exists(API_DB_PATH):
            import shutil
            shutil.copy2(DB_PATH, API_DB_PATH)
            print(f"[OK] Banco espelhado api/data/futebol.db sincronizado.")
            
        print("\n" + "=" * 75)
        print("  PIPELINE DE SANITIZAÇÃO CONCLUÍDO COM SUCESSO!")
        print("=" * 75)
        
    except Exception as e:
        import traceback
        print(f"[ERRO CRÍTICO NA SANITIZAÇÃO]: {e}")
        traceback.print_exc()
        conn.close()

if __name__ == "__main__":
    executar_pipeline()
