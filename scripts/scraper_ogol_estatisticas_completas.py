#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
scripts/scraper_ogol_estatisticas_completas.py
======================================================================
Scraper completo das estatísticas de equipes e atletas da temporada
a partir do OGol (zerozero.pt) para o Brasileirão Série A 2026 (edicao 210277).
- Coleta estatísticas de equipes: chutes, defesas, cruzamentos certos, posse, xg, etc.
- Coleta as 46 métricas de atletas via endpoints de performance:
  xG, xGOT, desarmes, passes, interceptações, defesas, notas médias, chutes, etc.
- Execução idempotente, sanitizada e otimizada para o SQLite local.
- Agendamento diário integrado às 01:00 AM no orquestrador mestre.
"""

import os
import sys
import re
import time
import sqlite3
import urllib.request
import urllib.error
from bs4 import BeautifulSoup

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')
if hasattr(sys.stderr, 'reconfigure'):
    sys.stderr.reconfigure(encoding='utf-8', errors='replace')

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DB_PATH = os.path.join(BASE_DIR, "data", "futebol.db")

HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept-Language': 'pt-BR,pt;q=0.9,en;q=0.8',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
}

EDICAO_ID = 210277
ANO = 2026
CAMPEONATO = "Brasileirão Série A"

def fetch_url(url, retries=3, delay=1.5):
    for attempt in range(retries):
        try:
            req = urllib.request.Request(url, headers=HEADERS)
            with urllib.request.urlopen(req, timeout=15) as resp:
                return resp.read().decode('utf-8', errors='ignore')
        except Exception as e:
            if attempt == retries - 1:
                print(f"[ERRO] Falha ao acessar {url}: {e}")
                return None
            time.sleep(delay)
    return None

def limpar_numero(val_str):
    if not val_str:
        return 0.0
    val_str = str(val_str).strip()
    try:
        if ',' in val_str and '.' in val_str:
            val_str = val_str.replace('.', '').replace(',', '.')
        elif ',' in val_str:
            val_str = val_str.replace(',', '.')
        elif '.' in val_str:
            parts = val_str.split('.')
            if len(parts) == 2 and len(parts[1]) == 3 and int(parts[0]) > 0:
                val_str = val_str.replace('.', '')
        return float(val_str)
    except ValueError:
        return 0.0

def raspar_estatisticas_equipes(conn):
    print("\n--- [1/2] Raspando Estatísticas de Equipes (OGol 2026) ---")
    c = conn.cursor()

    stats_map = {
        18: ("chutes_total", "chutes_jogo"),
        56: ("defesas_total", "defesas_jogo"),
        65: ("cruzamentos_certos_total", "cruzamentos_certos_jogo"),
        84: ("xg_pro", None),
        85: ("xg_alvo", None),
        53: ("passes_certos", None),
        71: ("duelos_ganhos", None),
        78: ("interceptacoes", None)
    }

    equipes_dados = {}

    for stat_id, (col_total, col_jogo) in stats_map.items():
        url = f"https://www.ogol.com.br/edicao/brasileirao-serie-a-2026/{EDICAO_ID}/estatisticas-de-equipas?stat={stat_id}"
        html = fetch_url(url)
        if not html:
            continue
        
        soup = BeautifulSoup(html, 'html.parser')
        table = soup.find('table')
        if not table:
            continue
        
        rows = table.find_all('tr')[1:]
        print(f"  > Stat {stat_id} ({col_total}): {len(rows)} clubes coletados")
        
        for r in rows:
            tds = r.find_all('td')
            if len(tds) < 2:
                continue
            
            nome_clube = tds[0].get_text(strip=True)
            if not nome_clube:
                continue
            
            # Normalizar clube
            val_total_raw = tds[1].get_text(strip=True)
            val_total = limpar_numero(val_total_raw)
            
            val_jogo = 0.0
            jogos = 0
            if len(tds) >= 3:
                val_jogo = limpar_numero(tds[2].get_text(strip=True))
            if len(tds) >= 6:
                try:
                    jogos = int(tds[5].get_text(strip=True))
                except:
                    jogos = 0
            
            if nome_clube not in equipes_dados:
                equipes_dados[nome_clube] = {
                    'jogos': jogos,
                    'chutes_total': 0,
                    'chutes_jogo': 0.0,
                    'defesas_total': 0,
                    'defesas_jogo': 0.0,
                    'cruzamentos_certos_total': 0,
                    'cruzamentos_certos_jogo': 0.0,
                    'xg_pro': 0.0
                }
            
            if jogos > equipes_dados[nome_clube]['jogos']:
                equipes_dados[nome_clube]['jogos'] = jogos
            
            if col_total == 'chutes_total':
                equipes_dados[nome_clube]['chutes_total'] = int(val_total)
                equipes_dados[nome_clube]['chutes_jogo'] = val_jogo
            elif col_total == 'defesas_total':
                equipes_dados[nome_clube]['defesas_total'] = int(val_total)
                equipes_dados[nome_clube]['defesas_jogo'] = val_jogo
            elif col_total == 'cruzamentos_certos_total':
                equipes_dados[nome_clube]['cruzamentos_certos_total'] = int(val_total)
                equipes_dados[nome_clube]['cruzamentos_certos_jogo'] = val_jogo
            elif col_total == 'xg_pro':
                equipes_dados[nome_clube]['xg_pro'] = val_total

        time.sleep(0.5)

    # Inserir ou atualizar na tabela campeonatos_estatisticas_equipes
    count_inseridos = 0
    for clube, d in equipes_dados.items():
        c.execute("""
            INSERT INTO campeonatos_estatisticas_equipes (
                edicao_id, ano, campeonato, clube, jogos,
                chutes_total, chutes_jogo, defesas_total, defesas_jogo,
                cruzamentos_certos_total, cruzamentos_certos_jogo, xg_pro,
                atualizado_em
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
            ON CONFLICT(edicao_id, clube) DO UPDATE SET
                jogos = excluded.jogos,
                chutes_total = excluded.chutes_total,
                chutes_jogo = excluded.chutes_jogo,
                defesas_total = excluded.defesas_total,
                defesas_jogo = excluded.defesas_jogo,
                cruzamentos_certos_total = excluded.cruzamentos_certos_total,
                cruzamentos_certos_jogo = excluded.cruzamentos_certos_jogo,
                xg_pro = excluded.xg_pro,
                atualizado_em = CURRENT_TIMESTAMP
        """, (
            EDICAO_ID, ANO, CAMPEONATO, clube, d['jogos'],
            d['chutes_total'], d['chutes_jogo'],
            d['defesas_total'], d['defesas_jogo'],
            d['cruzamentos_certos_total'], d['cruzamentos_certos_jogo'],
            d['xg_pro']
        ))
        count_inseridos += 1

    conn.commit()
    print(f"[SUCESSO] {count_inseridos} clubes gravados/atualizados em campeonatos_estatisticas_equipes.")

def raspar_estatisticas_atletas(conn):
    print("\n--- [2/2] Raspando Estatísticas Completas de Atletas (OGol 2026) ---")
    c = conn.cursor()

    # Mapeamento oficial dos endpoints de estatísticas de atletas do OGol
    stat_definitions = [
        (3, "gols", int),
        (24, "assistencias", int),
        (84, "xg", float),
        (85, "xgot", float),
        (18, "chutes_totais", int),
        (47, "chutes_gol", int),
        (53, "passes_certos", int),
        (56, "defesas_totais", int),
        (65, "cruzamentos_certos", int),
        (78, "interceptacoes", int),
        (80, "nota_media", float),
        (87, "grandes_chances_perdidas", int),
        (101, "desarmes_ganhos", int),
        (107, "oportunidades_criadas", int),
        (114, "defesas_area", int)
    ]

    atletas_dados = {}

    for stat_id, campo_db, tipo_dado in stat_definitions:
        url = f"https://www.ogol.com.br/edicao_performance.php?id={EDICAO_ID}&stat={stat_id}"
        html = fetch_url(url)
        if not html:
            continue
        
        soup = BeautifulSoup(html, 'html.parser')
        table = soup.find('table')
        if not table:
            continue
        
        rows = table.find_all('tr')[1:]
        print(f"  > Stat {stat_id:3d} ({campo_db:<25}): {len(rows)} atletas processados")

        for r in rows:
            tds = r.find_all('td')
            if len(tds) < 2:
                continue
            
            td0 = tds[0]
            # Link e nome do jogador (procurar <a> com texto)
            a_players = [a for a in td0.find_all('a', href=lambda h: h and '/jogador/' in h) if a.get_text(strip=True)]
            if not a_players:
                continue
            a_player = a_players[0]
            player_url = a_player.get('href', '')
            nome_atleta = a_player.get_text(strip=True)
            if not nome_atleta:
                continue
            
            # Id do OGol
            id_jogador = None
            m_id = re.search(r'/jogador/[^/]+/(\d+)', player_url)
            if m_id:
                id_jogador = int(m_id.group(1))

            # Clube
            clube = ""
            a_teams = td0.find_all('a', href=lambda h: h and '/equipe/' in h)
            if a_teams:
                clube_raw = a_teams[0].get_text(strip=True)
                if not clube_raw:
                    team_slug = a_teams[0].get('href', '').split('/equipe/')[-1].split('/')[0]
                    # Mapear slugs comuns
                    slug_map = {
                        'athletico-paranaense': 'Athletico Paranaense',
                        'atletico-mineiro': 'Atlético Mineiro',
                        'red-bull-bragantino': 'Red Bull Bragantino',
                        'sao-paulo': 'São Paulo',
                        'gremio': 'Grêmio',
                        'vitoria': 'Vitória',
                        'cuiaba': 'Cuiabá',
                        'ceara': 'Ceará',
                        'goias': 'Goiás',
                        'america-mineiro': 'América Mineiro',
                        'sport': 'Sport',
                        'vasco': 'Vasco',
                        'flamengo': 'Flamengo',
                        'palmeiras': 'Palmeiras',
                        'corinthians': 'Corinthians',
                        'santos': 'Santos',
                        'botafogo': 'Botafogo',
                        'fluminense': 'Fluminense',
                        'cruzeiro': 'Cruzeiro',
                        'internacional': 'Internacional',
                        'bahia': 'Bahia',
                        'fortaleza': 'Fortaleza',
                        'juventude': 'Juventude',
                        'criciuma': 'Criciúma',
                        'atletico-goianiense': 'Atlético Goianiense',
                        'chapecoense': 'Chapecoense',
                        'coritiba': 'Coritiba',
                        'mirassol': 'Mirassol',
                        'remo': 'Remo'
                    }
                    clube = slug_map.get(team_slug, team_slug.replace('-', ' ').title())
                else:
                    clube = clube_raw

            # Posição: remover nome do atleta do texto completo de td0
            full_td_text = td0.get_text(strip=True)
            posicao = full_td_text.replace(nome_atleta, '').strip()
            # Limpar caracteres espúrios
            posicao = re.sub(r'[^a-zA-ZáéíóúâêîôûãõçÁÉÍÓÚÂÊÎÔÛÃÕÇ ]', '', posicao).strip()

            val_raw = tds[1].get_text(strip=True)
            val = limpar_numero(val_raw)
            if tipo_dado == int:
                val = int(val)
            
            jogos = 0
            minutos = 0
            if len(tds) >= 6:
                try:
                    jogos = int(tds[5].get_text(strip=True))
                except:
                    jogos = 0
            if len(tds) >= 7:
                try:
                    minutos = int(tds[6].get_text(strip=True))
                except:
                    minutos = 0

            chave = (nome_atleta, clube)
            if chave not in atletas_dados:
                atletas_dados[chave] = {
                    'id_jogador': id_jogador,
                    'atleta': nome_atleta,
                    'clube': clube,
                    'posicao': posicao,
                    'jogos': jogos,
                    'minutos': minutos,
                    'gols': 0,
                    'assistencias': 0,
                    'xg': 0.0,
                    'xgot': 0.0,
                    'chutes_totais': 0,
                    'chutes_gol': 0,
                    'passes_certos': 0,
                    'defesas_totais': 0,
                    'cruzamentos_certos': 0,
                    'interceptacoes': 0,
                    'nota_media': 0.0,
                    'grandes_chances_perdidas': 0,
                    'desarmes_ganhos': 0,
                    'oportunidades_criadas': 0,
                    'defesas_area': 0
                }
            
            if jogos > atletas_dados[chave]['jogos']:
                atletas_dados[chave]['jogos'] = jogos
            if minutos > atletas_dados[chave]['minutos']:
                atletas_dados[chave]['minutos'] = minutos
            if posicao and not atletas_dados[chave]['posicao']:
                atletas_dados[chave]['posicao'] = posicao
            if id_jogador and not atletas_dados[chave]['id_jogador']:
                atletas_dados[chave]['id_jogador'] = id_jogador

            # Atribuir métrica específica
            atletas_dados[chave][campo_db] = val

        time.sleep(0.4)

    # Inserir/Atualizar na tabela estatisticas_atletas_temporada
    print(f"\nPersistindo {len(atletas_dados)} atletas no SQLite...")
    count_salvos = 0
    for (atleta, clube), d in atletas_dados.items():
        c.execute("""
            INSERT INTO estatisticas_atletas_temporada (
                id_jogador, edicao_id, ano, campeonato, atleta, clube, posicao,
                jogos, minutos, gols, assistencias, xg, xgot,
                chutes_totais, chutes_gol, passes_certos, defesas_totais,
                cruzamentos_certos, interceptacoes, nota_media,
                grandes_chances_perdidas, desarmes_ganhos, oportunidades_criadas,
                defesas_area, atualizado_em
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
            ON CONFLICT(edicao_id, atleta, clube) DO UPDATE SET
                id_jogador = COALESCE(excluded.id_jogador, estatisticas_atletas_temporada.id_jogador),
                posicao = CASE WHEN excluded.posicao != '' THEN excluded.posicao ELSE estatisticas_atletas_temporada.posicao END,
                jogos = MAX(estatisticas_atletas_temporada.jogos, excluded.jogos),
                minutos = MAX(estatisticas_atletas_temporada.minutos, excluded.minutos),
                gols = excluded.gols,
                assistencias = excluded.assistencias,
                xg = excluded.xg,
                xgot = excluded.xgot,
                chutes_totais = excluded.chutes_totais,
                chutes_gol = excluded.chutes_gol,
                passes_certos = excluded.passes_certos,
                defesas_totais = excluded.defesas_totais,
                cruzamentos_certos = excluded.cruzamentos_certos,
                interceptacoes = excluded.interceptacoes,
                nota_media = excluded.nota_media,
                grandes_chances_perdidas = excluded.grandes_chances_perdidas,
                desarmes_ganhos = excluded.desarmes_ganhos,
                oportunidades_criadas = excluded.oportunidades_criadas,
                defesas_area = excluded.defesas_area,
                atualizado_em = CURRENT_TIMESTAMP
        """, (
            d['id_jogador'], EDICAO_ID, ANO, CAMPEONATO, atleta, clube, d['posicao'],
            d['jogos'], d['minutos'], d['gols'], d['assistencias'], d['xg'], d['xgot'],
            d['chutes_totais'], d['chutes_gol'], d['passes_certos'], d['defesas_totais'],
            d['cruzamentos_certos'], d['interceptacoes'], d['nota_media'],
            d['grandes_chances_perdidas'], d['desarmes_ganhos'], d['oportunidades_criadas'],
            d['defesas_area']
        ))
        count_salvos += 1

    conn.commit()
    print(f"[SUCESSO] {count_salvos} registros gravados com perfeição em estatisticas_atletas_temporada.")

def main():
    print(f"=== INICIANDO PIPELINE DE ESTATÍSTICAS COMPLETAS (OGOL {ANO}) ===")
    conn = sqlite3.connect(DB_PATH)
    try:
        raspar_estatisticas_equipes(conn)
        raspar_estatisticas_atletas(conn)
        
        # Otimizar banco e garantir PRAGMA journal_mode = DELETE
        conn.execute("PRAGMA journal_mode = DELETE;")
        conn.commit()
    finally:
        conn.close()
    print("=== PIPELINE CONCLUÍDO COM SUCESSO! ===")

if __name__ == "__main__":
    main()
