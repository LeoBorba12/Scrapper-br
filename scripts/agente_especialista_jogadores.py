#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
agente_especialista_jogadores.py
Agente Especialista de Inteligência de Atletas (FutStats):
===========================================================
Responsabilidades Centrais:
1. Extração Completa de Perfil via OGol (zerozero):
   - Dados Pessoais & Biométricos (Nome completo, Altura, Peso, Nascimento, Idade, Naturalidade, Posição, Pé, Situação)
   - Foto Oficial do Jogador (CDN staticzz / OGol)
   - Carreira Detalhada por Clubes e Períodos (Jogos, Gols, Assistências, Anos)
   - Histórico Temporada a Temporada
   - Títulos Oficiais (Palmarés completo por clube e seleção)
   - Prêmios Individuais e Artilharias
2. Auditoria e Conferência Cruzada com o Acervo Local:
   - Verifica se os clubes onde o atleta fez gols no nosso banco batem com os clubes oficiais da carreira.
   - Detecta anomalias de partidas com clubes onde o atleta nunca jogou (ex: caso Emelec/Vitória).
   - Compara a contagem atômica de gols no acervo contra a carreira oficial.
3. Atualização Idempotente no SQLite (data/futebol.db).
4. Suporta execução individual (--nome, --id), em lote (--top, --limit) e modo auditoria (--auditar-clubes).
"""

import os
import re
import sys
import json
import time
import random
import sqlite3
import argparse
import urllib.request
import urllib.parse
import urllib.error
from datetime import datetime

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')
if hasattr(sys.stderr, 'reconfigure'):
    sys.stderr.reconfigure(encoding='utf-8', errors='replace')

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DB_PATH = os.path.join(BASE_DIR, "data", "futebol.db")
CACHE_DIR = os.path.join(BASE_DIR, "data", "cache_ogol_perfis")
os.makedirs(CACHE_DIR, exist_ok=True)

HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    'Accept-Language': 'pt-BR,pt;q=0.9,en;q=0.8',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
}

def log_msg(msg: str):
    print(f"[{datetime.now().strftime('%H:%M:%S')}] {msg}")
    sys.stdout.flush()

def fetch_url(url: str, retries: int = 3) -> str:
    for tentativa in range(retries):
        try:
            req = urllib.request.Request(url, headers=HEADERS)
            with urllib.request.urlopen(req, timeout=15) as resp:
                return resp.read().decode('utf-8', errors='replace')
        except urllib.error.HTTPError as e:
            if e.code == 429:
                wait_t = 6 * (tentativa + 1)
                log_msg(f"  ⚠️ [Rate Limit 429] Aguardando {wait_t}s...")
                time.sleep(wait_t)
            elif e.code == 404:
                return ""
            else:
                time.sleep(2)
        except Exception:
            time.sleep(2)
    return ""

def normalizar_texto(txt: str) -> str:
    if not txt:
        return ""
    txt = txt.strip().lower()
    txt = re.sub(r'[àáâãä]', 'a', txt)
    txt = re.sub(r'[èéêë]', 'e', txt)
    txt = re.sub(r'[ìíîï]', 'i', txt)
    txt = re.sub(r'[òóôõö]', 'o', txt)
    txt = re.sub(r'[ùúûü]', 'u', txt)
    txt = re.sub(r'[ç]', 'c', txt)
    txt = re.sub(r'[^a-z0-9]', '', txt)
    return txt

MAPA_SINONIMOS_CLUBES = {
    "atleticomg": ["atleticomineiro", "atletico"],
    "atleticomineiro": ["atleticomg", "atletico"],
    "athleticopr": ["atleticoparanaense", "atletico"],
    "atleticoparanaense": ["athleticopr", "atletico"],
    "sport": ["sportrecife"],
    "sportrecife": ["sport"],
    "redbullbragantino": ["bragantino"],
    "bragantino": ["redbullbragantino"],
    "americamg": ["americamineiro"],
    "americamineiro": ["americamg"],
    "americarn": ["americanatal"],
    "americanatal": ["americarn"],
    "americarj": ["america"],
    "botafogosp": ["botafogo"],
    "saopaulo": ["spfc"],
    "vasco": ["vascodagama"],
    "vascodagama": ["vasco"],
    "gremio": ["gremiofbpa"],
    "inter": ["internacional"],
    "internacional": ["inter"]
}

def clubes_sao_equivalentes(clube_acervo: str, clube_oficial: str) -> bool:
    c1 = normalizar_texto(clube_acervo)
    c2 = normalizar_texto(clube_oficial)
    if not c1 or not c2:
        return False
    if c1 == c2 or c1 in c2 or c2 in c1:
        return True
    
    sinonimos_c1 = MAPA_SINONIMOS_CLUBES.get(c1, [])
    if any(s == c2 or s in c2 or c2 in s for s in sinonimos_c1):
        return True
    
    sinonimos_c2 = MAPA_SINONIMOS_CLUBES.get(c2, [])
    if any(s == c1 or s in c1 or c1 in s for s in sinonimos_c2):
        return True
        
    return False

MAPA_CANONICO_LENDAS = {
    "romário": 5270,
    "romario": 5270,
    "pelé": 26668,
    "pele": 26668,
    "zico": 27463,
    "fred": 9839,
    "roberto dinamite": 27464,
    "gabriel barbosa": 75171,
    "gabigol": 75171,
    "rogério ceni": 5664,
    "rogerio ceni": 5664,
    "túlio maravilha": 42587,
    "tulio maravilha": 42587,
    "hulk": 5696,
    "edmundo": 5267,
    "luís fabiano": 5685,
    "luis fabiano": 5685,
    "diego souza": 1283,
    "reinaldo": 27466,
    "dejan petkovic": 5312,
    "petkovic": 5312,
    "viola": 27469,
    "magno alves": 58891,
    "carlos frontini": 37821,
    "frontini": 37821,
    "kléber pereira": 5277,
    "kleber pereira": 5277,
    "dimba": 5283,
    "alex dias": 5682,
    "finazzi": 31804,
    "rinaldo": 5289,
    "tuta": 5777,
    "paulinho mclaren": 31803,
    "oséas": 5684,
    "oseas": 5684,
    "germán cano": 36577,
    "cano": 36577,
    "bruno henrique": 250453,
    "dudu": 95611,
    "wellington paulista": 6041,
    "rafael moura": 32411,
    "deivid": 3473,
    "pedro": 481359,
    "alecsandro": 5691,
    "borges": 5688,
    "paulo baier": 5690,
    "luizão": 4663,
    "luizao": 4663,
    "washington": 5108
}

def buscar_ogol_url(nome: str, ogol_id: int = None) -> tuple:
    """Retorna (url_completa, ogol_id)"""
    nome_norm = (nome or "").strip().lower()
    if nome_norm in MAPA_CANONICO_LENDAS:
        oid_map = MAPA_CANONICO_LENDAS[nome_norm]
        return f"https://www.ogol.com.br/jogador/-/{oid_map}", oid_map

    if ogol_id and ogol_id > 0:
        return f"https://www.ogol.com.br/jogador/-/{ogol_id}", ogol_id

    # Busca dinâmica no OGol
    q = urllib.parse.quote(nome.strip())
    search_url = f"https://www.ogol.com.br/pesquisa?search_txt={q}&search_type=player"
    html = fetch_url(search_url)
    if not html:
        return None, None

    matches = re.findall(r'href=["\'](/jogador/([^/"\']+)(?:/(\d+))?[^"\']*)["\']', html)
    for path, slug, oid in matches:
        if any(x in path for x in ['titulos', 'fotos', 'videos', 'noticias']):
            continue
        if oid and int(oid) > 0:
            return f"https://www.ogol.com.br{path.split('?')[0]}", int(oid)
        elif slug and not slug.startswith('-'):
            return f"https://www.ogol.com.br{path.split('?')[0]}", None

    return None, None

def extrair_dados_perfil_ogol(html: str) -> dict:
    """Extrai detalhadamente Foto, Bio, Carreira, Títulos e Prêmios do HTML do OGol."""
    if not html or len(html) < 500:
        return None

    perfil = {
        "foto_url": None,
        "nome_completo": None,
        "data_nascimento": None,
        "idade": None,
        "nacionalidade": None,
        "naturalidade": None,
        "posicao": None,
        "situacao": None,
        "altura": None,
        "peso": None,
        "pe_preferencial": None,
        "carreira_clubes": [],
        "titulos": [],
        "premios": []
    }

    # 1. Foto do jogador
    m_foto = re.search(r'<div[^>]*class=["\'][^"\']*pic[^"\']*["\'][^>]*>.*?<img[^>]*src=["\']([^"\']+)["\']', html, re.DOTALL | re.I)
    if not m_foto:
        m_foto = re.search(r'<img[^>]*src=["\']([^"\']*(?:jogadores|avatar|player)[^"\']*)["\']', html, re.I)
    if m_foto:
        f_url = m_foto.group(1).strip()
        if not f_url.startswith("http"):
            f_url = f"https://www.ogol.com.br{f_url}" if f_url.startswith("/") else f"https://www.ogol.com.br/{f_url}"
        # Ignorar placeholders genéricos
        if "default" not in f_url.lower() and "placeholder" not in f_url.lower():
            perfil["foto_url"] = f_url

    # 2. Descrição no meta (fallback conciso e confiável)
    m_desc = re.search(r'<meta[^>]*name=["\']description["\'][^>]*content=["\'](.*?)["\']', html, re.DOTALL | re.I)
    meta_desc = m_desc.group(1) if m_desc else ""

    # 3. Helper para valores de 'card-data'
    def get_card_val(label_keyword):
        pattern = r'<span[^>]*class=["\']card-data__label["\'][^>]*>[^<]*' + label_keyword + r'[^<]*</span>\s*(?:<div[^>]*>)?\s*<span[^>]*class=["\']card-data__value["\'][^>]*>(.*?)</span>'
        m = re.search(pattern, html, re.DOTALL | re.I)
        if m:
            return re.sub(r'<[^>]+>', '', m.group(1)).strip()
        return None

    # Nome Completo
    m_nc = re.search(r'O nome completo [^a-zA-Z0-9]* ([^<.\n]+)', html, re.I)
    if m_nc:
        perfil["nome_completo"] = m_nc.group(1).strip()
    else:
        m_nc2 = re.search(r'Qual o nome completo[^?]*\?.*?itemprop=["\']text["\']>(.*?)</div>', html, re.DOTALL | re.I)
        if m_nc2:
            txt = re.sub(r'<[^>]+>', '', m_nc2.group(1)).strip()
            txt = re.sub(r'^O nome completo [^a-zA-Z0-9]* ', '', txt).strip(' .')
            perfil["nome_completo"] = txt

    # Data de Nascimento e Idade
    dt_nasc = get_card_val("Nasc")
    if dt_nasc:
        m_id = re.search(r'\((\d+)\s*anos\)', dt_nasc)
        if m_id:
            perfil["idade"] = int(m_id.group(1))
        perfil["data_nascimento"] = re.sub(r'\s*\(\d+\s*anos\)', '', dt_nasc).strip()
    else:
        m_dt = re.search(r'nascido em (\d{4}-\d{2}-\d{2})', meta_desc)
        if m_dt:
            perfil["data_nascimento"] = m_dt.group(1)
        m_id2 = re.search(r'de (\d+) anos', meta_desc)
        if m_id2:
            perfil["idade"] = int(m_id2.group(1))

    # Nacionalidade e Naturalidade
    perfil["nacionalidade"] = get_card_val("Nacionalidade")
    perfil["naturalidade"] = get_card_val("Naturalidade")
    perfil["posicao"] = get_card_val("Posi")
    if not perfil["posicao"]:
        m_pos = re.search(r'Jogou como ([^.]+)\.', meta_desc)
        if m_pos:
            perfil["posicao"] = m_pos.group(1).strip()

    perfil["situacao"] = get_card_val("Situa")
    perfil["pe_preferencial"] = get_card_val("preferencial")

    # Altura e Peso
    alt_peso = get_card_val("Altura")
    if alt_peso:
        m_a = re.search(r'(\d+)\s*cm', alt_peso)
        m_p = re.search(r'(\d+)\s*kg', alt_peso)
        perfil["altura"] = int(m_a.group(1)) if m_a else None
        perfil["peso"] = int(m_p.group(1)) if m_p else None
    else:
        m_a2 = re.search(r'altura [^\d]*(\d+)\s*cm', meta_desc)
        m_p2 = re.search(r'peso [^\d]*(\d+)\s*kg', meta_desc)
        perfil["altura"] = int(m_a2.group(1)) if m_a2 else None
        perfil["peso"] = int(m_p2.group(1)) if m_p2 else None

    # 4. Tabela de Carreira por Clubes e Períodos
    tables = re.findall(r'<table[^>]*>.*?</table>', html, re.DOTALL)
    for t in tables:
        if ('GM' in t or 'Gols' in t or 'Gol' in t) and ('ASS' in t or 'J' in t):
            rows = re.findall(r'<tr[^>]*>(.*?)</tr>', t, re.DOTALL)
            for r in rows:
                cells = [re.sub(r'<[^>]+>', '', c).strip() for c in re.findall(r'<t[dh][^>]*>(.*?)</t[dh]>', r, re.DOTALL)]
                if len(cells) >= 5 and cells[1] and cells[1] not in ['Equipe', 'Clube', 'Total', 'Temporada']:
                    clube_nome = cells[1]
                    periodo_str = cells[2] if len(cells) > 2 else ""
                    jogos = int(cells[3]) if len(cells) > 3 and cells[3].isdigit() else 0
                    gols = int(cells[4]) if len(cells) > 4 and cells[4].isdigit() else 0
                    assists = int(cells[5]) if len(cells) > 5 and cells[5].isdigit() else 0
                    perfil["carreira_clubes"].append({
                        "clube": clube_nome,
                        "periodo": periodo_str,
                        "jogos": jogos,
                        "gols": gols,
                        "assistencias": assists
                    })
            if perfil["carreira_clubes"]:
                break

    # 5. Títulos Oficiais
    trofeus_blocos = re.findall(r'<div[^>]*class=["\']trophy[^"\']*["\'][^>]*>(.*?)</div>', html, re.DOTALL | re.I)
    for tb in trofeus_blocos:
        m_qtd = re.search(r'<div class="number">(\d+)</div>', tb)
        qtd = int(m_qtd.group(1)) if m_qtd else 1
        clean_tit = re.sub(r'<[^>]+>', ' ', tb).strip()
        linhas = [ln.strip() for ln in clean_tit.splitlines() if ln.strip() and not ln.strip().isdigit()]
        nome_tit = " ".join(linhas[0].split()) if linhas else ""
        if nome_tit and len(nome_tit) > 2:
            perfil["titulos"].append({"titulo": nome_tit, "quantidade": qtd})

    # 6. Prêmios Individuais
    premios_blocos = re.findall(r'<div id="coach_titles"[^>]*>(.*?)</div>\s*</div>', html, re.DOTALL | re.I)
    if premios_blocos:
        pr_links = re.findall(r'<a[^>]*href=["\'][^"\']*premios[^"\']*["\'][^>]*>(.*?)</a>', premios_blocos[0])
        for p in pr_links:
            pr_clean = re.sub(r'<[^>]+>', '', p).strip()
            if pr_clean and pr_clean not in perfil["premios"]:
                perfil["premios"].append(pr_clean)

    return perfil

def obter_perfil_atleta(nome: str, ogol_id: int = None, forcar_scraping: bool = False) -> tuple:
    """Busca com cache persistente em disco."""
    cache_file = None
    if ogol_id and ogol_id > 0:
        cache_file = os.path.join(CACHE_DIR, f"{ogol_id}.json")
    elif nome:
        safe_name = "".join(c if c.isalnum() else "_" for c in nome.strip())
        cache_file = os.path.join(CACHE_DIR, f"name_{safe_name}.json")

    if cache_file and os.path.exists(cache_file) and not forcar_scraping:
        try:
            with open(cache_file, "r", encoding="utf-8") as f:
                cached = json.load(f)
                html = cached.get("html", "")
                perfil = extrair_dados_perfil_ogol(html)
                oid = cached.get("ogol_id", ogol_id)
                if perfil and perfil.get("carreira_clubes"):
                    return perfil, oid
        except Exception:
            pass

    # Scraping online
    url, oid = buscar_ogol_url(nome, ogol_id)
    if not url:
        return None, None

    log_msg(f"🌐 Scraping OGol: {url}...")
    html = fetch_url(url)
    if not html:
        return None, oid

    perfil = extrair_dados_perfil_ogol(html)
    if oid and cache_file:
        try:
            with open(os.path.join(CACHE_DIR, f"{oid}.json"), "w", encoding="utf-8") as f:
                json.dump({"nome": nome, "ogol_id": oid, "url": url, "html": html}, f, ensure_ascii=False)
        except Exception:
            pass

    return perfil, oid

def auditar_e_comparar_acervo(id_jogador: int, perfil_ogol: dict, conn: sqlite3.Connection) -> dict:
    """
    Executa a conferência cruzada:
    1. Clubes onde o atleta marcou gols no nosso acervo vs Clubes oficiais da carreira no OGol.
    2. Total de gols no acervo vs Total oficial de carreira.
    """
    c = conn.cursor()
    c.execute("SELECT DISTINCT clube FROM gols WHERE id_jogador = ?;", (id_jogador,))
    clubes_acervo = [r[0] for r in c.fetchall() if r[0]]

    c.execute("SELECT COUNT(*) FROM gols WHERE id_jogador = ?;", (id_jogador,))
    total_gols_acervo = c.fetchone()[0]

    clubes_oficiais_nomes = [c_info["clube"] for c_info in perfil_ogol.get("carreira_clubes", [])]
    clubes_oficiais_norm = [normalizar_texto(c_nome) for c_nome in clubes_oficiais_nomes]

    clubes_divergentes = []
    for clb in clubes_acervo:
        # Verificar se coincide com algum oficial
        encontrado = any(clubes_sao_equivalentes(clb, ofc) for ofc in clubes_oficiais_nomes)
        if not encontrado:
            clubes_divergentes.append(clb)

    total_gols_oficiais = sum(c_info.get("gols", 0) for c_info in perfil_ogol.get("carreira_clubes", []))
    total_jogos_oficiais = sum(c_info.get("jogos", 0) for c_info in perfil_ogol.get("carreira_clubes", []))
    total_assists_oficiais = sum(c_info.get("assistencias", 0) for c_info in perfil_ogol.get("carreira_clubes", []))

    anomalias = []
    if clubes_divergentes:
        anomalias.append(f"Atleta marcou gols por clubes não listados na carreira oficial: {clubes_divergentes}")
    if total_gols_oficiais > 0 and total_gols_acervo > total_gols_oficiais:
        anomalias.append(f"Gols no acervo ({total_gols_acervo}) superam a carreira oficial total ({total_gols_oficiais})")

    return {
        "id_jogador": id_jogador,
        "clubes_acervo": clubes_acervo,
        "clubes_oficiais": clubes_oficiais_nomes,
        "clubes_divergentes": clubes_divergentes,
        "gols_acervo": total_gols_acervo,
        "gols_oficiais": total_gols_oficiais,
        "jogos_oficiais": total_jogos_oficiais,
        "assistencias_oficiais": total_assists_oficiais,
        "integro": len(anomalias) == 0,
        "anomalias": anomalias
    }

def auto_reparar_clubes_divergentes(id_jogador: int, perfil_ogol: dict, audit: dict, conn: sqlite3.Connection):
    """
    Auto-Cura Ativa (Data Honesty & Root-Cause Resolution):
    1. Corrige prefixos com ruído na tabela gols (ex: 'abd  Vasco da Gama' -> 'Vasco').
    2. Se houver clubes onde o atleta marcou gols no acervo mas que NÃO constam na carreira oficial:
       - Transfere esses gols para perfis de homônimos específicos.
    3. Recalcula os clubes válidos, total de gols e anos de atividade a partir dos dados limpos.
    """
    c = conn.cursor()
    divergentes = audit.get("clubes_divergentes", [])
    if not divergentes:
        # Apenas garantir consistência atômica da lista de clubes e total_gols
        c.execute("SELECT DISTINCT clube FROM gols WHERE id_jogador = ? ORDER BY clube;", (id_jogador,))
        clubes_reais = [r[0] for r in c.fetchall() if r[0]]
        clubes_str = ",".join(clubes_reais)
        c.execute("SELECT COUNT(*) FROM gols WHERE id_jogador = ?;", (id_jogador,))
        total_gols_real = c.fetchone()[0]
        c.execute("""
            UPDATE jogadores_estatisticas 
            SET total_gols = ?, clubes = ?
            WHERE id_jogador = ?;
        """, (total_gols_real, clubes_str, id_jogador))
        return

    # Buscar nome do atleta
    c.execute("SELECT nome_exibicao FROM jogadores_estatisticas WHERE id_jogador = ?;", (id_jogador,))
    row_n = c.fetchone()
    nome_atleta = row_n[0] if row_n else f"Atleta {id_jogador}"

    for clb in divergentes:
        # Se for erro de digitação/prefixo como 'abd '
        if "abd " in clb or "abd  " in clb:
            clb_limpo = clb.replace("abd  ", "").replace("abd ", "").strip()
            c.execute("UPDATE gols SET clube = ? WHERE id_jogador = ? AND clube = ?;", (clb_limpo, id_jogador, clb))
            log_msg(f"  🛠️ [Auto-Cura] Prefixo 'abd' corrigido para '{clb_limpo}' no atleta {nome_atleta}")
            continue

        # Caso seja clube alienígena genuíno (homônimo)
        # Buscar ou criar atleta homônimo
        nome_homonimo = f"{nome_atleta} ({clb})"
        c.execute("SELECT id_jogador FROM jogadores_estatisticas WHERE nome_exibicao = ? LIMIT 1;", (nome_homonimo,))
        row_h = c.fetchone()
        if row_h:
            id_homonimo = row_h[0]
        else:
            # Gerar ID único no espaço de homônimos (faixa 102000+)
            c.execute("SELECT MAX(id_jogador) FROM jogadores_estatisticas;")
            max_id = max(c.fetchone()[0] or 100000, 102000)
            id_homonimo = max_id + 1
            c.execute("""
                INSERT INTO jogadores_estatisticas (id_jogador, nome_exibicao, posicao, clubes, total_gols)
                VALUES (?, ?, 'Atacante', ?, 0);
            """, (id_homonimo, nome_homonimo, clb))

        # Transferir gols do clube alienígena para o homônimo
        c.execute("UPDATE gols SET id_jogador = ? WHERE id_jogador = ? AND clube = ?;", (id_homonimo, id_jogador, clb))
        gols_transferidos = c.rowcount
        
        # Atualizar cabeçalho do homônimo
        c.execute("SELECT COUNT(*) FROM gols WHERE id_jogador = ?;", (id_homonimo,))
        tot_h = c.fetchone()[0]
        c.execute("UPDATE jogadores_estatisticas SET total_gols = ? WHERE id_jogador = ?;", (tot_h, id_homonimo))

        log_msg(f"  ✂️ [Auto-Cura] Desassociados {gols_transferidos} gols do clube '{clb}' de {nome_atleta} e transferidos para {nome_homonimo} (ID {id_homonimo})")

    # Recalibrar o atleta principal após a auto-cura
    c.execute("SELECT DISTINCT clube FROM gols WHERE id_jogador = ? ORDER BY clube;", (id_jogador,))
    clubes_finais = [r[0] for r in c.fetchall() if r[0]]
    clubes_str_final = ",".join(clubes_finais)

    c.execute("SELECT COUNT(*) FROM gols WHERE id_jogador = ?;", (id_jogador,))
    total_gols_final = c.fetchone()[0]

    c.execute("""
        SELECT MIN(strftime('%Y', p.data)), MAX(strftime('%Y', p.data)) 
        FROM gols g 
        JOIN partidas p ON g.id_partida = p.id_partida 
        WHERE g.id_jogador = ?;
    """, (id_jogador,))
    row_datas = c.fetchone()
    ano_min = int(row_datas[0]) if row_datas and row_datas[0] else None
    ano_max = int(row_datas[1]) if row_datas and row_datas[1] else None

    c.execute("""
        UPDATE jogadores_estatisticas 
        SET total_gols = ?,
            clubes = ?,
            ano_inicio = COALESCE(?, ano_inicio),
            ano_fim = COALESCE(?, ano_fim)
        WHERE id_jogador = ?;
    """, (total_gols_final, clubes_str_final, ano_min, ano_max, id_jogador))

def atualizar_jogador_no_banco(id_jogador: int, perfil: dict, audit: dict, oid: int, conn: sqlite3.Connection):
    """Grava todos os atributos enriquecidos de forma atômica no SQLite e aciona a auto-cura."""
    c = conn.cursor()
    c.execute("""
        UPDATE jogadores_estatisticas
        SET 
            ogol_id = COALESCE(?, ogol_id),
            nome_completo = COALESCE(?, nome_completo),
            altura = COALESCE(?, altura),
            peso = COALESCE(?, peso),
            data_nascimento = COALESCE(?, data_nascimento),
            idade = COALESCE(?, idade),
            nacionalidade = COALESCE(?, nacionalidade),
            naturalidade = COALESCE(?, naturalidade),
            situacao = COALESCE(?, situacao),
            pe_preferencial = COALESCE(?, pe_preferencial),
            foto_url = COALESCE(?, foto_url),
            gols_carreira_oficiais = ?,
            jogos_carreira_oficiais = ?,
            assistencias_carreira_oficiais = ?,
            detalhe_carreira_clubes = ?,
            titulos = ?,
            premios = ?,
            data_ultima_auditoria = ?
        WHERE id_jogador = ?;
    """, (
        oid,
        perfil.get("nome_completo"),
        perfil.get("altura"),
        perfil.get("peso"),
        perfil.get("data_nascimento"),
        perfil.get("idade"),
        perfil.get("nacionalidade"),
        perfil.get("naturalidade"),
        perfil.get("situacao"),
        perfil.get("pe_preferencial"),
        perfil.get("foto_url"),
        audit.get("gols_oficiais"),
        audit.get("jogos_oficiais"),
        audit.get("assistencias_oficiais"),
        json.dumps(perfil.get("carreira_clubes", []), ensure_ascii=False),
        json.dumps(perfil.get("titulos", []), ensure_ascii=False),
        json.dumps(perfil.get("premios", []), ensure_ascii=False),
        datetime.now().isoformat(),
        id_jogador
    ))

    # Executar a Auto-Cura Ativa para limpar e recalibrar clubes e homônimos
    auto_reparar_clubes_divergentes(id_jogador, perfil, audit, conn)
    conn.commit()

def processar_atleta(id_jogador: int, nome: str, ogol_id: int = None, conn: sqlite3.Connection = None) -> bool:
    """Fluxo completo de processamento e auditoria para 1 atleta."""
    log_msg(f"⚡ Processando atleta ID {id_jogador} - {nome} (OGol ID: {ogol_id})...")
    perfil, novo_oid = obter_perfil_atleta(nome, ogol_id)
    if not perfil:
        log_msg(f"❌ Não foi possível obter perfil no OGol para {nome}.")
        return False

    audit = auditar_e_comparar_acervo(id_jogador, perfil, conn)
    atualizar_jogador_no_banco(id_jogador, perfil, audit, novo_oid or ogol_id, conn)

    log_msg(f"✅ Atleta {nome} enriquecido com sucesso:")
    log_msg(f"   • Foto: {perfil.get('foto_url') or 'N/D'}")
    log_msg(f"   • Bio: {perfil.get('altura')}cm | {perfil.get('peso')}kg | Nasc: {perfil.get('data_nascimento')} | Status: {perfil.get('situacao')}")
    log_msg(f"   • Carreira Oficial: {audit['gols_oficiais']} gols em {audit['jogos_oficiais']} jogos ({len(perfil.get('carreira_clubes', []))} clubes)")
    log_msg(f"   • Títulos: {len(perfil.get('titulos', []))} títulos | Prêmios: {len(perfil.get('premios', []))}")
    if audit["integro"]:
        log_msg(f"   • Conferência do Acervo: 🟢 100% Consistente ({audit['gols_acervo']} gols catalogados)")
    else:
        for anom in audit["anomalias"]:
            log_msg(f"   • ⚠️ ALERTA DE CONFERÊNCIA: {anom}")

    return True

def main():
    parser = argparse.ArgumentParser(description="Agente Especialista de Inteligência de Atletas (FutStats)")
    parser.add_argument("--id", type=int, help="ID do jogador para enriquecer/auditar")
    parser.add_argument("--nome", type=str, help="Nome do jogador para buscar")
    parser.add_argument("--top", type=int, help="Processar os TOP N jogadores por gols")
    parser.add_argument("--pendentes-ogol", action="store_true", help="Processar atletas com ogol_id que ainda não possuem foto/bio")
    parser.add_argument("--limit", type=int, default=None, help="Limite de atletas para processar")
    parser.add_argument("--auditar-todos", action="store_true", help="Auditar todos os atletas com ogol_id")
    args = parser.parse_args()

    conn = sqlite3.connect(DB_PATH)

    if args.id:
        c = conn.cursor()
        c.execute("SELECT id_jogador, nome_exibicao, ogol_id FROM jogadores_estatisticas WHERE id_jogador = ?;", (args.id,))
        row = c.fetchone()
        if not row:
            print(f"Atleta com ID {args.id} não encontrado.")
            return
        processar_atleta(row[0], row[1], row[2], conn)

    elif args.nome:
        c = conn.cursor()
        c.execute("SELECT id_jogador, nome_exibicao, ogol_id FROM jogadores_estatisticas WHERE nome_exibicao LIKE ? LIMIT 1;", (f"%{args.nome}%",))
        row = c.fetchone()
        if not row:
            print(f"Atleta com nome '{args.nome}' não encontrado.")
            return
        processar_atleta(row[0], row[1], row[2], conn)

    elif args.pendentes_ogol:
        c = conn.cursor()
        query = """
            SELECT id_jogador, nome_exibicao, ogol_id 
            FROM jogadores_estatisticas 
            WHERE ogol_id IS NOT NULL AND (foto_url IS NULL OR altura IS NULL)
            ORDER BY total_gols DESC
        """
        if args.limit:
            query += f" LIMIT {args.limit}"
        c.execute(query)
        rows = c.fetchall()
        log_msg(f"Iniciando Fase 2: enriquecimento de {len(rows)} atletas pendentes com ogol_id...")
        sucessos = 0
        for idx, r in enumerate(rows, 1):
            log_msg(f"[{idx}/{len(rows)}] Atleta: {r[1]} (ID: {r[0]}, OGol: {r[2]})")
            ok = processar_atleta(r[0], r[1], r[2], conn)
            if ok:
                sucessos += 1
            if idx % 10 == 0:
                conn.commit()
                log_msg(f"💾 Checkpoint: {idx} atletas processados ({sucessos} com sucesso).")
            time.sleep(random.uniform(1.2, 2.2))
        conn.commit()
        log_msg(f"🎉 Fase 2 Concluída! {sucessos} de {len(rows)} atletas enriquecidos com sucesso.")

    elif args.top:
        c = conn.cursor()
        c.execute("""
            SELECT id_jogador, nome_exibicao, ogol_id 
            FROM jogadores_estatisticas 
            ORDER BY total_gols DESC 
            LIMIT ?;
        """, (args.top,))
        rows = c.fetchall()
        log_msg(f"Iniciando enriquecimento dos TOP {len(rows)} atletas...")
        for r in rows:
            processar_atleta(r[0], r[1], r[2], conn)
            time.sleep(random.uniform(1.0, 2.5))

    elif args.auditar_todos:
        c = conn.cursor()
        c.execute("SELECT id_jogador, nome_exibicao, ogol_id FROM jogadores_estatisticas WHERE ogol_id IS NOT NULL ORDER BY total_gols DESC;")
        rows = c.fetchall()
        log_msg(f"Iniciando auditoria cruzada de {len(rows)} atletas mapeados no OGol...")
        divergencias = []
        for r in rows:
            perfil, _ = obter_perfil_atleta(r[1], r[2])
            if perfil:
                audit = auditar_e_comparar_acervo(r[0], perfil, conn)
                if not audit["integro"]:
                    divergencias.append((r[1], audit["anomalias"]))
                    log_msg(f"⚠️ Divergência em {r[1]}: {audit['anomalias']}")
        log_msg(f"Auditoria concluída. Total com divergência: {len(divergencias)} de {len(rows)}")

    else:
        # Default: processar Fred (6051) para validar
        processar_atleta(6051, "Fred", 9839, conn)

    conn.close()

if __name__ == "__main__":
    main()
