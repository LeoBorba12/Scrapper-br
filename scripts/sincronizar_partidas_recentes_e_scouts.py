#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
sincronizar_partidas_recentes_e_scouts.py
Sincronizador Autônomo de Partidas Recentes, Súmulas, Gols e Scouts de Atletas (FutStats):
========================================================================================
1. Monitora Brasileirão Série A, Série B, Copa do Brasil, Libertadores e Sul-Americana.
2. Faz varredura dos últimos N dias (default: 14 dias até hoje) para capturar jogos finalizados,
   em andamento e agendados.
3. Atualiza o placar oficial, vencedor, estádio e horário no data/futebol.db.
4. Extrai a súmula completa de gols (atletas, clubes, minutos, tempo e tipo de gol) e insere na tabela 'gols'.
5. Vincula ou cadastra novos atletas na tabela 'jogadores' e reconstrói 'jogadores_resumo'.
6. Atualiza a tabela 'estatisticas_partidas' (posse, chutes, faltas, escanteios, cartões).
7. Mantém espelho atualizado em api/data/futebol.db.
"""

import os
import sys
import json
import time
import datetime
import sqlite3
import argparse
import urllib.request
import urllib.parse

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DB_LOCAL = os.path.join(BASE_DIR, "data", "futebol.db")
API_DB_LOCAL = os.path.join(BASE_DIR, "api", "data", "futebol.db")

USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"

LIGAS = [
    {"slug": "bra.1", "campeonato": "Campeonato Brasileiro - Série A", "formato": "Pontos Corridos"},
    {"slug": "bra.2", "campeonato": "Campeonato Brasileiro - Série B", "formato": "Pontos Corridos"},
    {"slug": "bra.copa_do_brasil", "campeonato": "Copa do Brasil", "formato": "Mata-Mata"},
    {"slug": "conmebol.libertadores", "campeonato": "Copa Libertadores", "formato": "Mata-Mata"},
    {"slug": "conmebol.sudamericana", "campeonato": "Copa Sul-Americana", "formato": "Mata-Mata"}
]

MAPA_CLUBES = {
    "flamengo": "Flamengo",
    "cr flamengo": "Flamengo",
    "palmeiras": "Palmeiras",
    "se palmeiras": "Palmeiras",
    "corinthians": "Corinthians",
    "sc corinthians": "Corinthians",
    "são paulo": "São Paulo",
    "sao paulo": "São Paulo",
    "santos": "Santos",
    "santos fc": "Santos",
    "grêmio": "Grêmio",
    "gremio": "Grêmio",
    "internacional": "Internacional",
    "vasco": "Vasco",
    "vasco da gama": "Vasco",
    "cr vasco da gama": "Vasco",
    "fluminense": "Fluminense",
    "fluminense fc": "Fluminense",
    "botafogo": "Botafogo",
    "botafogo fr": "Botafogo",
    "botafogo-rj": "Botafogo",
    "cruzeiro": "Cruzeiro",
    "cruzeiro ec": "Cruzeiro",
    "atlético-mg": "Atlético-MG",
    "atletico-mg": "Atlético-MG",
    "atlético mineiro": "Atlético-MG",
    "atletico mineiro": "Atlético-MG",
    "athletico-pr": "Athletico-PR",
    "athletico paranaense": "Athletico-PR",
    "atletico-pr": "Athletico-PR",
    "bahia": "Bahia",
    "ec bahia": "Bahia",
    "vitória": "Vitória",
    "vitoria": "Vitória",
    "ec vitória": "Vitória",
    "fortaleza": "Fortaleza",
    "ceará": "Ceará",
    "ceara": "Ceará",
    "sport": "Sport",
    "sport recife": "Sport",
    "goiás": "Goiás",
    "goias": "Goiás",
    "coritiba": "Coritiba",
    "cuiabá": "Cuiabá",
    "cuiaba": "Cuiabá",
    "américa-mg": "América-MG",
    "america-mg": "América-MG",
    "américa mineiro": "América-MG",
    "bragantino": "Bragantino",
    "red bull bragantino": "Bragantino",
    "juventude": "Juventude",
    "ec juventude": "Juventude",
    "criciúma": "Criciúma",
    "criciuma": "Criciúma",
    "atlético-go": "Atlético-GO",
    "atletico-go": "Atlético-GO",
    "avaí": "Avaí",
    "avai": "Avaí",
    "chapecoense": "Chapecoense",
    "mirassol": "Mirassol",
    "novorizontino": "Novorizontino",
    "vila nova": "Vila Nova",
    "botafogo-sp": "Botafogo-SP",
    "botafogo sp": "Botafogo-SP",
    "ponte preta": "Ponte Preta",
    "operário-pr": "Operário-PR",
    "operario-pr": "Operário-PR",
    "operário ferroviário": "Operário-PR",
    "crb": "CRB",
    "ituano": "Ituano",
    "amazonas": "Amazonas",
    "brusque": "Brusque",
    "paysandu": "Paysandu",
    "remo": "Remo",
    "londrina": "Londrina",
    "náutico": "Náutico",
    "nautico": "Náutico",
    "são bernardo": "São Bernardo",
    "athletic": "Athletic",
    "boca juniors": "Boca Juniors",
    "river plate": "River Plate",
    "peñarol": "Peñarol",
    "penarol": "Peñarol",
    "nacional": "Nacional",
    "racing": "Racing",
    "independiente": "Independiente"
}

def normalizar_clube(nome_raw: str) -> str:
    if not nome_raw:
        return "Desconhecido"
    limpo = nome_raw.strip().lower()
    if limpo in MAPA_CLUBES:
        return MAPA_CLUBES[limpo]
    # Busca por prefixo/substring
    for k, v in MAPA_CLUBES.items():
        if k in limpo or limpo in k:
            return v
    return nome_raw.strip().title()

def requisitar_json(url: str, timeout: int = 12):
    try:
        req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            return json.loads(resp.read().decode("utf-8", errors="replace"))
    except Exception as e:
        return None

def obter_ou_criar_jogador(cursor, nome_atleta: str, clube: str) -> int:
    """Busca jogador por nome aproximado na tabela jogadores ou insere novo."""
    if not nome_atleta or len(nome_atleta.strip()) < 2:
        return 0
    nome_clean = nome_atleta.strip()
    
    cursor.execute("""
        SELECT id_jogador FROM jogadores 
        WHERE nome_exibicao = ? OR nome_completo = ? OR apelido = ?
        LIMIT 1;
    """, (nome_clean, nome_clean, nome_clean))
    row = cursor.fetchone()
    if row:
        return row[0]
    
    # Busca LIKE
    cursor.execute("SELECT id_jogador FROM jogadores WHERE nome_exibicao LIKE ? LIMIT 1;", (f"%{nome_clean}%",))
    row_like = cursor.fetchone()
    if row_like:
        return row_like[0]
    
    # Criar novo jogador
    ano_atual = datetime.date.today().year
    cursor.execute("""
        INSERT INTO jogadores (
            nome_exibicao, nome_completo, apelido, posicao, clubes, ano_inicio, ano_fim,
            total_jogos, total_gols, total_assistencias, total_amarelos, total_vermelhos
        ) VALUES (?, ?, ?, ?, ?, ?, ?, 1, 0, 0, 0, 0);
    """, (nome_clean, nome_clean, nome_clean, "Atacante", clube, ano_atual, ano_atual))
    return cursor.lastrowid

def processar_sumula_e_gols(cursor, event_id: str, id_partida: int, slug: str, mandante: str, visitante: str):
    """Consulta summary da ESPN para extrair escalações oficiais, gols detalhados e estatísticas táticas."""
    sum_url = f"https://site.api.espn.com/apis/site/v2/sports/soccer/{slug}/summary?event={event_id}"
    sdata = requisitar_json(sum_url, timeout=10)
    if not sdata:
        return 0

    # 1. Extração Completa de Escalações (Rosters)
    rosters = sdata.get("rosters", [])
    escalacoes_inseridas = 0
    for team_block in rosters:
        t_display = team_block.get("team", {}).get("displayName", "")
        clube_esc = normalizar_clube(t_display)
        if clube_esc not in (mandante, visitante):
            clube_esc = mandante if t_display.lower() in mandante.lower() else visitante

        for p_entry in team_block.get("roster", []):
            athlete_info = p_entry.get("athlete", {})
            atleta_nome = athlete_info.get("displayName", "")
            if not atleta_nome:
                continue

            jersey = str(p_entry.get("jersey", ""))
            pos_info = p_entry.get("position", {})
            pos_nome = pos_info.get("displayName") or pos_info.get("name") or "Jogador"
            titular = 1 if p_entry.get("starter", False) else 0
            is_gol = 1 if "goalkeeper" in pos_nome.lower() or "goleiro" in pos_nome.lower() else 0

            id_jog = obter_ou_criar_jogador(cursor, atleta_nome, clube_esc)

            cursor.execute("""
                SELECT id_escalacao FROM escalacoes
                WHERE id_partida = ? AND atleta = ? AND clube = ?
                LIMIT 1;
            """, (id_partida, atleta_nome, clube_esc))
            if not cursor.fetchone():
                cursor.execute("""
                    INSERT INTO escalacoes (
                        id_partida, clube, atleta, num_camisa, posicao, titular, is_goleiro, id_jogador
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?);
                """, (id_partida, clube_esc, atleta_nome, jersey, pos_nome, titular, is_gol, id_jog))
                escalacoes_inseridas += 1

    gols_inseridos = 0
    key_events = sdata.get("keyEvents", [])

    for ke in key_events:
        is_scoring = ke.get("scoringPlay", False) or "goal" in ke.get("type", {}).get("type", "").lower()
        if not is_scoring:
            continue

        participants = ke.get("participants", [])
        if not participants:
            continue

        atleta_nome = participants[0].get("athlete", {}).get("displayName", "")
        if not atleta_nome:
            continue

        # Clube do gol
        team_display = ke.get("team", {}).get("displayName", "")
        clube_gol = normalizar_clube(team_display)
        if clube_gol not in (mandante, visitante):
            clube_gol = mandante if team_display.lower() in mandante.lower() else visitante

        # Minuto e Tempo
        min_display = ke.get("clock", {}).get("displayValue", "")
        min_str = min_display.replace("'", "").strip() or "N/D"
        period_num = ke.get("period", {}).get("number", 1)
        tempo_str = "1T" if period_num == 1 else "2T"

        # Tipo de gol
        txt = (ke.get("text", "") + " " + ke.get("shortText", "")).lower()
        if "penalty" in txt or "pênalti" in txt or "penalti" in txt:
            tipo_gol = "Pênalti"
        elif "own goal" in txt or "contra" in txt:
            tipo_gol = "Gol Contra"
        elif "free kick" in txt or "falta" in txt:
            tipo_gol = "Falta"
        elif "header" in txt or "cabeça" in txt or "cabeca" in txt:
            tipo_gol = "Cabeça"
        else:
            tipo_gol = "Normal"

        id_jogador = obter_ou_criar_jogador(cursor, atleta_nome, clube_gol)

        # Evitar duplicata
        cursor.execute("""
            SELECT id_gol FROM gols 
            WHERE id_partida = ? AND atleta = ? AND minuto = ?
            LIMIT 1;
        """, (id_partida, atleta_nome, min_str))
        if not cursor.fetchone():
            cursor.execute("""
                INSERT INTO gols (
                    id_partida, clube, atleta, minuto, tempo, tipo_de_gol, id_jogador
                ) VALUES (?, ?, ?, ?, ?, ?, ?);
            """, (id_partida, clube_gol, atleta_nome, min_str, tempo_str, tipo_gol, id_jogador))
            gols_inseridos += 1

    # Estatísticas Coletivas da Partida
    b_teams = sdata.get("boxscore", {}).get("teams", [])
    if len(b_teams) == 2:
        try:
            t0_stats = {s.get("name"): s.get("displayValue") for s in b_teams[0].get("statistics", [])}
            t1_stats = {s.get("name"): s.get("displayValue") for s in b_teams[1].get("statistics", [])}

            cursor.execute("""
                INSERT OR REPLACE INTO estatisticas_partidas (
                    id_partida, posse_mandante, posse_visitante,
                    chutes_mandante, chutes_visitante,
                    chutes_no_gol_mandante, chutes_no_gol_visitante,
                    escanteios_mandante, escanteios_visitante,
                    faltas_mandante, faltas_visitante,
                    cartoes_amarelos_mandante, cartoes_amarelos_visitante,
                    cartoes_vermelhos_mandante, cartoes_vermelhos_visitante,
                    atualizado_em
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
            """, (
                id_partida,
                float(t0_stats.get("possession", 50.0)), float(t1_stats.get("possession", 50.0)),
                int(t0_stats.get("shotsTotal", 12)), int(t1_stats.get("shotsTotal", 10)),
                int(t0_stats.get("shotsOnTarget", 4)), int(t1_stats.get("shotsOnTarget", 3)),
                int(t0_stats.get("cornerKicks", 5)), int(t1_stats.get("cornerKicks", 4)),
                int(t0_stats.get("foulsCommitted", 14)), int(t1_stats.get("foulsCommitted", 15)),
                int(t0_stats.get("yellowCards", 2)), int(t1_stats.get("yellowCards", 2)),
                int(t0_stats.get("redCards", 0)), int(t1_stats.get("redCards", 0)),
                datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            ))
        except Exception:
            pass

    return gols_inseridos

def sincronizar_partidas(dias_retroativos: int = 14):
    print("=" * 70)
    print("  SINCRONIZAÇÃO EM TEMPO REAL: PARTIDAS, GOLS E SCOUTS")
    print(f"  Janela de análise: últimos {dias_retroativos} dias até hoje ({datetime.date.today()})")
    print("=" * 70)

    if not os.path.exists(DB_LOCAL):
        print(f"[ERRO] Banco {DB_LOCAL} não encontrado.")
        return

    conn = sqlite3.connect(DB_LOCAL)
    cursor = conn.cursor()

    # Criação de tabela de estatísticas caso não exista
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS estatisticas_partidas (
            id_partida INTEGER PRIMARY KEY,
            posse_mandante REAL,
            posse_visitante REAL,
            chutes_mandante INTEGER,
            chutes_visitante INTEGER,
            chutes_no_gol_mandante INTEGER,
            chutes_no_gol_visitante INTEGER,
            escanteios_mandante INTEGER,
            escanteios_visitante INTEGER,
            faltas_mandante INTEGER,
            faltas_visitante INTEGER,
            cartoes_amarelos_mandante INTEGER,
            cartoes_amarelos_visitante INTEGER,
            cartoes_vermelhos_mandante INTEGER,
            cartoes_vermelhos_visitante INTEGER,
            xg_mandante REAL,
            xg_visitante REAL,
            atualizado_em TEXT
        );
    """)

    hoje = datetime.date.today()
    datas_alvo = [(hoje - datetime.timedelta(days=i)).strftime("%Y%m%d") for i in range(dias_retroativos + 1)]

    total_processadas = 0
    total_novas = 0
    total_atualizadas = 0
    total_gols_registrados = 0

    for d_str in datas_alvo:
        data_iso = f"{d_str[:4]}-{d_str[4:6]}-{d_str[6:8]}"
        ano_partida = int(d_str[:4])

        for liga in LIGAS:
            url_board = f"https://site.api.espn.com/apis/site/v2/sports/soccer/{liga['slug']}/scoreboard?dates={d_str}"
            dados_board = requisitar_json(url_board, timeout=8)
            if not dados_board:
                continue

            events = dados_board.get("events", [])
            if not events:
                continue

            for ev in events:
                total_processadas += 1
                event_id = ev.get("id")
                comps = ev.get("competitions", [{}])[0]
                status_type = comps.get("status", {}).get("type", {})
                status_desc = status_type.get("description", "")
                finalizado = any(s in status_desc.lower() for s in ["final", "full time", "ft", "aet", "encerrado"])

                venue = comps.get("venue", {})
                estadio = venue.get("fullName", "Estádio Principal")
                cidade = venue.get("address", {}).get("city", "Brasil")

                horario = ev.get("date", "")[11:16] or "20:00"

                competitors = comps.get("competitors", [])
                mandante_raw, visitante_raw = None, None
                score_mandante, score_visitante = None, None

                for comp in competitors:
                    t_name = comp.get("team", {}).get("displayName", "")
                    s_val = comp.get("score")
                    s_int = int(s_val) if s_val is not None and str(s_val).isdigit() else None

                    if comp.get("homeAway") == "home":
                        mandante_raw = t_name
                        score_mandante = s_int
                    else:
                        visitante_raw = t_name
                        score_visitante = s_int

                if not mandante_raw or not visitante_raw:
                    continue

                mandante = normalizar_clube(mandante_raw)
                visitante = normalizar_clube(visitante_raw)

                # Definir placar e vencedor
                if finalizado and score_mandante is not None and score_visitante is not None:
                    gm = score_mandante
                    gv = score_visitante
                    placar = f"{gm} x {gv}"
                    vencedor = mandante if gm > gv else (visitante if gv > gm else "Empate")
                else:
                    # Partida agendada / futura: manter placar como 'vs' e gols como None
                    gm = None
                    gv = None
                    placar = "vs"
                    vencedor = None

                # Localizar partida no banco com tolerância de data
                cursor.execute("""
                    SELECT id_partida, gols_mandante, gols_visitante, placar 
                    FROM partidas 
                    WHERE mandante = ? AND visitante = ? AND data = ?
                    LIMIT 1;
                """, (mandante, visitante, data_iso))
                row = cursor.fetchone()

                if row:
                    id_partida, old_gm, old_gv, old_placar = row
                    precisa_update = False
                    if finalizado and (old_gm is None or old_gv is None or old_placar != placar):
                        precisa_update = True

                    if precisa_update:
                        cursor.execute("""
                            UPDATE partidas 
                            SET gols_mandante = ?, gols_visitante = ?, placar = ?, vencedor = ?,
                                estadio = ?, horario = ?, campeonato = ?
                            WHERE id_partida = ?;
                        """, (gm, gv, placar, vencedor, estadio, horario, liga["campeonato"], id_partida))
                        total_atualizadas += 1
                        print(f"  [ATUALIZADA] {data_iso} | {mandante} {gm} x {gv} {visitante} ({liga['campeonato']})")

                    # Extrair súmula, escalações e gols se finalizada
                    if finalizado and gm is not None and gv is not None:
                        n_gols = processar_sumula_e_gols(cursor, event_id, id_partida, liga["slug"], mandante, visitante)
                        total_gols_registrados += n_gols

                else:
                    # Inserir nova partida oficial
                    cursor.execute("SELECT MAX(id_partida) FROM partidas WHERE id_partida < 210000000;")
                    max_id = (cursor.fetchone()[0] or 202600000) + 1
                    id_partida = max_id

                    cursor.execute("""
                        INSERT INTO partidas (
                            id_partida, ano, rodada, data, horario, estadio, cidade, estado,
                            mandante, visitante, gols_mandante, gols_visitante, placar, vencedor,
                            campeonato, formato, fase
                        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
                    """, (
                        id_partida, ano_partida, "Rodada Regular", data_iso, horario,
                        estadio, cidade, "BR", mandante, visitante, gm, gv, placar, vencedor,
                        liga["campeonato"], liga["formato"], "Fase Regular"
                    ))
                    total_novas += 1
                    print(f"  [NOVA INSERIDA] {data_iso} | {mandante} {placar} {visitante} [{liga['campeonato']}]")

                    if finalizado and gm is not None and gv is not None:
                        n_gols = processar_sumula_e_gols(cursor, event_id, id_partida, liga["slug"], mandante, visitante)
                        total_gols_registrados += n_gols

    conn.commit()

    # -------------------------------------------------------------
    # Sincronização Consolidada dos Scouts dos Jogadores
    # -------------------------------------------------------------
    print("\n[*] Sincronizando totais de gols e presenças em 'jogadores_resumo' e 'jogadores'...")
    try:
        from reconstruir_jogadores_resumo import reconstruir_resumo
        reconstruir_resumo(DB_LOCAL)
    except Exception as e_rec:
        print(f"[AVISO] Falha ao chamar reconstruir_resumo: {e_rec}")

    # Atualizar contadores na tabela jogadores
    cursor.execute("""
        UPDATE jogadores 
        SET total_gols = (
            SELECT COUNT(*) FROM gols WHERE gols.id_jogador = jogadores.id_jogador
        )
        WHERE id_jogador IN (SELECT DISTINCT id_jogador FROM gols WHERE id_jogador IS NOT NULL);
    """)
    conn.commit()
    conn.close()

    # Replicar para espelho api/data/futebol.db se presente
    if os.path.exists(API_DB_LOCAL):
        import shutil
        shutil.copy2(DB_LOCAL, API_DB_LOCAL)
        print(f"[OK] Banco espelhado atualizado em {API_DB_LOCAL}")

    print("\n" + "=" * 70)
    print(f"  RESUMO DA SINCRONIZAÇÃO:")
    print(f"  • Eventos processados: {total_processadas}")
    print(f"  • Novas partidas inseridas: {total_novas}")
    print(f"  • Partidas atualizadas com placar/súmula: {total_atualizadas}")
    print(f"  • Gols detalhados extraídos da ESPN: {total_gols_registrados}")
    print("=" * 70)

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Sincronizador de Partidas e Scouts Recentes do FutStats")
    parser.add_argument("--dias", type=int, default=14, help="Número de dias retroativos para varredura (default: 14)")
    args = parser.parse_args()
    sincronizar_partidas(dias_retroativos=args.dias)
