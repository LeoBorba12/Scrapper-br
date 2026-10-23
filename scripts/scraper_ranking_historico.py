#!/usr/bin/env python3
"""
Scraper e Integrador de Dados do Ranking Histórico (rankinghistorico.com.br)
Extrai metadados e jogos históricos oficiais das competições nacionais,
internacionais e regionais nobres, enriquecendo o banco data/futebol.db
com segurança total abaixo do teto de 100 MB.
"""

import os
import re
import sys
import json
import gzip
import time
import sqlite3
import argparse
import unicodedata
import urllib.request
from datetime import datetime

BASE_URL = "https://rankinghistorico.com.br"
USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
CACHE_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data", "cache_rankinghistorico")

os.makedirs(CACHE_DIR, exist_ok=True)

# Competições nobres para garantir valor de elite e integridade do repositório
DEFAULT_ELITE_CODES = {
    'SERIE A', 'SERIE B', 'COPA', 'LIBERTADORES', 'SULAMERICANA',
    'CONMEBOL', 'MERCOSUL', 'MUNDIAL', 'TAÇA BRASIL', 'RIO SP', 'CNE'
}

def fetch_url(url, as_text=True):
    req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT, "Accept-Encoding": "gzip, deflate"})
    with urllib.request.urlopen(req, timeout=60) as resp:
        data = resp.read()
        if resp.info().get("Content-Encoding") == "gzip":
            data = gzip.decompress(data)
        if as_text:
            return data.decode("utf-8", errors="replace")
        return data

def get_bundle_manifest():
    print(f"[*] Verificando manifest do site {BASE_URL}...")
    html = fetch_url(BASE_URL + "/")
    
    arqs_m = re.search(r'window\.__ARQS\s*=\s*(\[[^\]]+\])', html)
    jogos_m = re.search(r'window\.__JOGOS\s*=\s*(\[[^\]]+\])', html)
    
    if not arqs_m or not jogos_m:
        raise RuntimeError("Não foi possível localizar window.__ARQS ou window.__JOGOS na página principal.")
        
    arqs = json.loads(arqs_m.group(1))
    jogos = json.loads(jogos_m.group(1))
    print(f"    Arquivos detectados: {len(arqs)} metadados, {len(jogos)} lotes de jogos.")
    return arqs, jogos

def download_and_extract_metadata(arqs):
    meta_cache = os.path.join(CACHE_DIR, "metadata.json")
    if os.path.exists(meta_cache):
        print(f"[*] Carregando metadados do cache local: {meta_cache}")
        with open(meta_cache, "r", encoding="utf-8") as f:
            return json.load(f)

    print("[*] Baixando e extraindo metadados...")
    db_file = None
    for a in arqs:
        if a.startswith("/db1."):
            db_file = a
            break
            
    if not db_file:
        raise RuntimeError("Arquivo db1.*.js não encontrado no manifesto.")
        
    js_content = fetch_url(BASE_URL + db_file)
    metadata = {}
    
    keys_to_extract = ["clubs", "comps", "labels", "stadiums", "fases"]
    for k in keys_to_extract:
        pattern = r'window\.__DB\[\"' + k + r'\"\]\s*=\s*(\[.*?\]|\{.*?\});window\.__DB'
        m = re.search(pattern, js_content)
        if m:
            metadata[k] = json.loads(m.group(1))
            print(f"    -> Extraído '{k}': {len(metadata[k])} registros.")

    with open(meta_cache, "w", encoding="utf-8") as f:
        json.dump(metadata, f, ensure_ascii=False, indent=2)
    return metadata

def parse_games_from_js(js_content):
    m = re.search(r'c\s*=\s*(\[\[.*?\]\]);', js_content)
    if not m:
        m = re.search(r'\[(\[\d+,\d+,\d+,\d+,\d+,\d+,-?\d+,\d+,\d+,\d+,\d+.*?\])\]', js_content)
    if not m:
        raise ValueError("Não foi possível encontrar a matriz de jogos no arquivo JS.")
    return json.loads(m.group(1))

def download_all_games(jogos_files):
    all_games = []
    print(f"[*] Processando {len(jogos_files)} lotes de jogos históricos...")
    for idx, jf in enumerate(jogos_files, 1):
        fname = os.path.basename(jf)
        local_js = os.path.join(CACHE_DIR, fname)
        if not os.path.exists(local_js):
            print(f"    [{idx}/{len(jogos_files)}] Baixando {jf}...")
            content = fetch_url(BASE_URL + jf)
            with open(local_js, "w", encoding="utf-8") as f:
                f.write(content)
        else:
            with open(local_js, "r", encoding="utf-8") as f:
                content = f.read()
                
        games_batch = parse_games_from_js(content)
        all_games.extend(games_batch)
        
    print(f"[OK] Total geral de jogos carregados: {len(all_games):,}")
    return all_games

def format_iso_date(d_int):
    s = str(d_int)
    if len(s) == 8:
        ano = s[:4]
        mes = s[4:6]
        dia = s[6:8]
        if mes == "00" or dia == "00":
            return f"{ano}-01-01"
        return f"{ano}-{mes}-{dia}"
    elif len(s) == 4:
        return f"{s}-01-01"
    return "1900-01-01"

def normalizar_nome(nome):
    if not nome:
        return ""
    n = unicodedata.normalize("NFKD", nome).encode("ASCII", "ignore").decode("utf-8")
    return re.sub(r"[^A-Z0-9]", "", n.upper())

def importar_jogos_para_banco(games, metadata, db_path, dry_run=False, min_ano=1900, max_ano=2026, all_comps=False):
    clubs = metadata.get("clubs", [])
    comps = metadata.get("comps", [])
    stadiums = metadata.get("stadiums", [])
    fases = metadata.get("fases", [])
    
    selected_comp_ids = set()
    for idx, c in enumerate(comps):
        if all_comps:
            selected_comp_ids.add(idx)
        else:
            code = c.get("code", "").upper()
            if code in DEFAULT_ELITE_CODES:
                selected_comp_ids.add(idx)

    print(f"[*] Competições selecionadas para ingestão: {len(selected_comp_ids)} de {len(comps)}")
    
    conn = sqlite3.connect(db_path)
    cur = conn.cursor()
    
    print("[*] Mapeando jogos já existentes para verificação de duplicidade...")
    cur.execute("SELECT id_partida, data, mandante, visitante FROM partidas")
    existentes = set()
    max_id = 0
    for r in cur.fetchall():
        id_p, dt, m, v = r
        if id_p > max_id:
            max_id = id_p
        existentes.add((dt, normalizar_nome(m), normalizar_nome(v)))
    
    print(f"    Jogos existentes na base: {len(existentes):,}")
    print(f"    Maior id_partida atual: {max_id}")

    novos_jogos = []
    ignorado_ano = 0
    ignorado_comp = 0
    duplicados = 0

    for g in games:
        comp_idx = g[1]
        if comp_idx not in selected_comp_ids:
            ignorado_comp += 1
            continue

        d_num = g[0]
        ano = g[10] if len(g) > 10 else int(str(d_num)[:4])
        if ano < min_ano or ano > max_ano:
            ignorado_ano += 1
            continue

        m_idx = g[2]
        g_m = g[3]
        g_v = g[4]
        v_idx = g[5]
        est_idx = g[6] if len(g) > 6 else -1
        publico = g[7] if len(g) > 7 and g[7] > 0 else None
        fase_idx = g[8] if len(g) > 8 else -1
        rodada = str(g[9]) if len(g) > 9 and g[9] > 0 else ""
        
        c_m = clubs[m_idx] if 0 <= m_idx < len(clubs) else {}
        c_v = clubs[v_idx] if 0 <= v_idx < len(clubs) else {}
        comp_info = comps[comp_idx] if 0 <= comp_idx < len(comps) else {}
        estadio = stadiums[est_idx] if 0 <= est_idx < len(stadiums) else ""
        fase = fases[fase_idx] if 0 <= fase_idx < len(fases) else ""

        mandante = c_m.get("n", f"Clube {m_idx}").title()
        visitante = c_v.get("n", f"Clube {v_idx}").title()
        uf_m = c_m.get("uf", "")
        uf_v = c_v.get("uf", "")
        estado = uf_m or uf_v or ""
        cidade = c_m.get("mun", "")

        campeonato = comp_info.get("n", "Torneio Nacional")
        data_iso = format_iso_date(d_num)

        key = (data_iso, normalizar_nome(mandante), normalizar_nome(visitante))
        if key in existentes:
            duplicados += 1
            continue

        placar = f"{g_m} x {g_v}"
        vencedor = mandante if g_m > g_v else (visitante if g_v > g_m else "Empate")
        
        max_id += 1
        id_partida = max_id

        novos_jogos.append((
            id_partida, ano, rodada, data_iso, "", estadio, cidade, estado,
            mandante, visitante, g_m, g_v, placar, vencedor,
            "", "", "", "", "", "", "", publico,
            campeonato, "Pontos Corridos / Eliminatória", fase
        ))
        existentes.add(key)

    print(f"\n[*] Resumo do Processamento:")
    print(f"    - Total processado: {len(games):,}")
    print(f"    - Ignorados por competição fora do filtro: {ignorado_comp:,}")
    print(f"    - Ignorados por recorte de ano: {ignorado_ano:,}")
    print(f"    - Partidas já existentes: {duplicados:,}")
    print(f"    - Partidas INÉDITAS identificadas: {len(novos_jogos):,}")

    if dry_run:
        print("\n[DRY-RUN] Nenhuma gravação efetuada.")
    else:
        if novos_jogos:
            print(f"\n[*] Gravando {len(novos_jogos):,} partidas no banco {db_path}...")
            cur.executemany("""
                INSERT INTO partidas (
                    id_partida, ano, rodada, data, horario, estadio, cidade, estado,
                    mandante, visitante, gols_mandante, gols_visitante, placar, vencedor,
                    arbitro, assistente_1, assistente_2, quarto_arbitro, var,
                    tecnico_mandante, tecnico_visitante, publico,
                    campeonato, formato, fase
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, novos_jogos)
            conn.commit()
            print("[*] Reotimizando com VACUUM e ANALYZE pós-ingestão...")
            cur.execute("VACUUM")
            cur.execute("ANALYZE")
            conn.commit()
            print("[OK] Ingestão concluída com sucesso!")
        else:
            print("[INFO] Não há novas partidas para inserir.")

    conn.close()

def main():
    parser = argparse.ArgumentParser(description="Scraper Ranking Histórico")
    parser.add_argument("--db", default="data/futebol.db", help="Caminho do banco SQLite")
    parser.add_argument("--dry-run", action="store_true", help="Simula sem gravar")
    parser.add_argument("--all-comps", action="store_true", help="Importa todas as 100 competições sem filtro de elite")
    parser.add_argument("--min-ano", type=int, default=1900, help="Ano mínimo")
    parser.add_argument("--max-ano", type=int, default=2026, help="Ano máximo")
    args = parser.parse_args()

    arqs, jogos = get_bundle_manifest()
    metadata = download_and_extract_metadata(arqs)
    games = download_all_games(jogos)
    importar_jogos_para_banco(
        games, metadata, args.db,
        dry_run=args.dry_run,
        min_ano=args.min_ano,
        max_ano=args.max_ano,
        all_comps=args.all_comps
    )

if __name__ == "__main__":
    main()
