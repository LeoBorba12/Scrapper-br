#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
SPIKE: Avaliação isolada do Brasileirão em Dados (brasileiraoemdados.com.br)
----------------------------------------------------------------------------
Executa análise sem alterar o banco de produção 'data/futebol.db' (modo read-only).
Baixa exclusivamente '/data/core.json' uma única vez para staging.
Cruza entidades com dim_clube e dim_atleta sem matches forçados.
Estima tamanho de tabelas agregadas em memória (:memory:).

Regras de Operação:
- Jamais escrever em data/futebol.db ou data/snapshot_dados.json.
- Não baixar arquivos de times, pev ou imagens do FotMob.
- Reconciliação com quarentena para similaridade < 0.95.
"""

import os
import sys
import json
import ssl
import hashlib
import sqlite3
import unicodedata
from difflib import SequenceMatcher
import urllib.request

# Constantes e Diretórios
BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
STAGING_DIR = os.path.join(BASE_DIR, "data", "staging", "brasileirao_em_dados")
CORE_JSON_PATH = os.path.join(STAGING_DIR, "core.json")
DB_PATH = os.path.join(BASE_DIR, "data", "futebol.db")
URL_CORE = "https://brasileiraoemdados.com.br/data/core.json"

def normalizar_texto(texto: str) -> str:
    """Remove acentos, pontuação e converte para minúsculas para comparação fonética/textual."""
    if not texto:
        return ""
    texto = unicodedata.normalize("NFKD", str(texto))
    texto = "".join([c for c in texto if not unicodedata.combining(c)])
    return " ".join(texto.lower().replace("-", " ").replace(".", " ").split())

def similaridade(s1: str, s2: str) -> float:
    """Calcula ratio de similaridade de Levenshtein/Gestalt."""
    return SequenceMatcher(None, normalizar_texto(s1), normalizar_texto(s2)).ratio()

def baixar_core_json() -> bytes:
    """Baixa core.json se não existir localmente no staging."""
    os.makedirs(STAGING_DIR, exist_ok=True)
    if os.path.exists(CORE_JSON_PATH):
        print(f"[STAGING] Arquivo já existente em: {CORE_JSON_PATH}")
        with open(CORE_JSON_PATH, "rb") as f:
            return f.read()
    
    print(f"[DOWNLOAD] Baixando unicamente {URL_CORE}...")
    ctx = ssl.create_default_context()
    headers = {"User-Agent": "FutStatsSpikeBot/1.0 (+https://futstats.com.br; spike@futstats.com.br)"}
    req = urllib.request.Request(URL_CORE, headers=headers)
    
    with urllib.request.urlopen(req, context=ctx, timeout=30) as resp:
        conteudo = resp.read()
    
    with open(CORE_JSON_PATH, "wb") as f:
        f.write(conteudo)
    
    print(f"[DOWNLOAD] Salvo com sucesso ({len(conteudo)} bytes).")
    return conteudo

def analisar_payload(raw_bytes: bytes) -> dict:
    """Calcula estatísticas de payload, hash e contagens."""
    sha256_hash = hashlib.sha256(raw_bytes).hexdigest()
    tamanho_bytes = len(raw_bytes)
    tamanho_mb = tamanho_bytes / (1024 * 1024)
    data = json.loads(raw_bytes.decode("utf-8"))
    
    meta = data.get("meta", {})
    teams = data.get("teams", [])
    players = data.get("players", [])
    matches = data.get("matches", [])
    
    return {
        "sha256": sha256_hash,
        "tamanho_bytes": tamanho_bytes,
        "tamanho_mb": round(tamanho_mb, 4),
        "meta": meta,
        "n_teams": len(teams),
        "n_players": len(players),
        "n_matches": len(matches),
        "data": data
    }

def reconciliar_clubes(teams: list, db_conn: sqlite3.Connection) -> dict:
    """Cruza os 20 clubes com dim_clube."""
    cur = db_conn.cursor()
    cur.execute("SELECT clube_id, nome, nome_oficial, sigla, estado FROM dim_clube")
    clubes_db = cur.fetchall()
    
    resultados = []
    
    for t in teams:
        t_id = t.get("id")
        t_name = t.get("name", "")
        t_short = t.get("short", "")
        t_fm = t.get("fm")
        norm_t_name = normalizar_texto(t_name)
        
        melhor_match = None
        melhor_score = 0.0
        
        for c_id, c_nome, c_oficial, c_sigla, c_uf in clubes_db:
            # Score por nome canônico
            score_nome = similaridade(t_name, c_nome)
            # Score por nome oficial
            score_oficial = similaridade(t_name, c_oficial) if c_oficial else 0.0
            score = max(score_nome, score_oficial)
            
            # Bonificação por sigla exata
            if t_short and c_sigla and t_short.upper() == c_sigla.upper():
                score = max(score, 0.98 if score > 0.6 else score)
            
            if score > melhor_score:
                melhor_score = score
                melhor_match = {
                    "clube_id_canonico": c_id,
                    "nome_canonico": c_nome,
                    "sigla_canonica": c_sigla,
                    "estado_canonico": c_uf,
                    "score": round(score, 4)
                }
        
        status = "EXATO" if melhor_score >= 0.95 else ("PROVAVEL" if melhor_score >= 0.85 else "NAO_RECONCILIADO")
        
        resultados.append({
            "bed_id": t_id,
            "bed_name": t_name,
            "bed_short": t_short,
            "bed_fm": t_fm,
            "match": melhor_match,
            "status": status
        })
    
    return resultados

def reconciliar_atletas(players: list, clubes_map: dict, db_conn: sqlite3.Connection) -> dict:
    """
    Cruza os 728 atletas com dim_atleta/jogadores.
    Sem matches forçados. Quarentena para similaridade < 0.95.
    """
    cur = db_conn.cursor()
    # Carregar dim_atleta completa
    cur.execute("SELECT id_jogador, nome_exibicao, nome_completo, apelido, posicao, clubes FROM jogadores")
    db_atletas = cur.fetchall()
    
    # Criar índices rápidos na memória para busca
    # 1. Por nome exibição normalizado
    por_nome_exib = {}
    for a in db_atletas:
        nm = normalizar_texto(a[1])
        if nm not in por_nome_exib:
            por_nome_exib[nm] = []
        por_nome_exib[nm].append(a)
        
        # Também indexar por apelido
        if a[3]:
            ap = normalizar_texto(a[3])
            if ap not in por_nome_exib:
                por_nome_exib[ap] = []
            por_nome_exib[ap].append(a)

    matches_exatos = []
    matches_provaveis = []
    matches_ambiguos = []
    nao_reconciliados = []
    sem_match_mais_450min = []
    
    for p in players:
        p_id = p.get("id")
        p_name = p.get("name", "")
        p_fm = p.get("fm")
        p_pos = p.get("pos", "")
        p_team_id = p.get("team")
        clube_info = clubes_map.get(p_team_id, {})
        clube_canonico_nome = clube_info.get("nome_canonico", "")
        
        stats = p.get("s", {})
        minutos = stats.get("minutes", 0.0)
        norm_name = normalizar_texto(p_name)
        
        candidatos = por_nome_exib.get(norm_name, [])
        
        if len(candidatos) == 1:
            c = candidatos[0]
            # Validar clube
            clubes_atleta_db = c[5] or ""
            clube_match = (normalizar_texto(clube_canonico_nome) in normalizar_texto(clubes_atleta_db)) if clube_canonico_nome else True
            
            res_item = {
                "bed_id": p_id,
                "bed_name": p_name,
                "bed_fm": p_fm,
                "bed_team": clube_canonico_nome,
                "minutos": minutos,
                "canonico_id": c[0],
                "canonico_nome": c[1],
                "canonico_clubes": c[5],
                "score": 1.0,
                "clube_confere": clube_match
            }
            if clube_match:
                matches_exatos.append(res_item)
            else:
                matches_provaveis.append(res_item)
        elif len(candidatos) > 1:
            # Homônimos detectados no banco canônico
            # Filtrar pelo clube
            candidatos_clube = [c for c in candidatos if clube_canonico_nome and normalizar_texto(clube_canonico_nome) in normalizar_texto(c[5] or "")]
            if len(candidatos_clube) == 1:
                c = candidatos_clube[0]
                matches_provaveis.append({
                    "bed_id": p_id,
                    "bed_name": p_name,
                    "bed_fm": p_fm,
                    "bed_team": clube_canonico_nome,
                    "minutos": minutos,
                    "canonico_id": c[0],
                    "canonico_nome": c[1],
                    "canonico_clubes": c[5],
                    "score": 0.98,
                    "nota": "Desambiguado via clube canônico"
                })
            else:
                matches_ambiguos.append({
                    "bed_id": p_id,
                    "bed_name": p_name,
                    "bed_fm": p_fm,
                    "bed_team": clube_canonico_nome,
                    "minutos": minutos,
                    "candidatos_count": len(candidatos),
                    "candidatos_ids": [c[0] for c in candidatos]
                })
        else:
            # Tentativa de matching aproximado de alta precisão
            # Procurar nos atletas do mesmo clube
            melhor_c = None
            melhor_sc = 0.0
            
            # Buscar apenas entre atletas que já jogaram pelo clube correspondente
            for c in db_atletas:
                clubes_atleta_db = c[5] or ""
                if clube_canonico_nome and normalizar_texto(clube_canonico_nome) in normalizar_texto(clubes_atleta_db):
                    # Comparar nome exibição e nome completo
                    sc1 = similaridade(p_name, c[1])
                    sc2 = similaridade(p_name, c[2]) if c[2] else 0.0
                    sc = max(sc1, sc2)
                    if sc > melhor_sc:
                        melhor_sc = sc
                        melhor_c = c
            
            if melhor_sc >= 0.95 and melhor_c:
                matches_provaveis.append({
                    "bed_id": p_id,
                    "bed_name": p_name,
                    "bed_fm": p_fm,
                    "bed_team": clube_canonico_nome,
                    "minutos": minutos,
                    "canonico_id": melhor_c[0],
                    "canonico_nome": melhor_c[1],
                    "canonico_clubes": melhor_c[5],
                    "score": round(melhor_sc, 4),
                    "nota": "Aproximado com alta precisão dentro do mesmo clube"
                })
            else:
                nao_rec = {
                    "bed_id": p_id,
                    "bed_name": p_name,
                    "bed_fm": p_fm,
                    "bed_team": clube_canonico_nome,
                    "minutos": minutos,
                    "melhor_score_encontrado": round(melhor_sc, 4) if melhor_c else 0.0,
                    "posicao": p_pos
                }
                nao_reconciliados.append(nao_rec)
                if minutos >= 450:
                    sem_match_mais_450min.append(nao_rec)
                    
    return {
        "exatos": matches_exatos,
        "provaveis": matches_provaveis,
        "ambiguos": matches_ambiguos,
        "nao_reconciliados": nao_reconciliados,
        "sem_match_mais_450min": sem_match_mais_450min,
        "total": len(players)
    }

def estimar_tamanho_kpis_em_memoria(players: list, teams: list) -> dict:
    """
    Simula criação de tabelas agregadas de KPIs em SQLite :memory:
    Mede exatamente as páginas de disco e tamanho em KB/MB sem tocar no banco real.
    """
    mem_conn = sqlite3.connect(":memory:")
    mcur = mem_conn.cursor()
    mcur.execute("PRAGMA page_size = 4096;")
    
    # DDL da tabela proposta metrica_atleta_avancada_2026
    mcur.execute("""
    CREATE TABLE metrica_atleta_avancada_2026 (
        atleta_id INTEGER PRIMARY KEY,
        clube_id INTEGER NOT NULL,
        jogos INTEGER NOT NULL,
        titularidades INTEGER NOT NULL,
        minutos INTEGER NOT NULL,
        gols REAL NOT NULL,
        gols_sem_penalti REAL NOT NULL,
        xg REAL NOT NULL,
        npxg REAL NOT NULL,
        xa REAL NOT NULL,
        passes_progressivos REAL NOT NULL,
        passes_decisivos REAL NOT NULL,
        passes_area REAL NOT NULL,
        conducoes_progressivas REAL NOT NULL,
        dribles_certos REAL NOT NULL,
        acoes_criacao_chute REAL NOT NULL,
        acoes_criacao_gol REAL NOT NULL,
        desarmes_ganhos REAL NOT NULL,
        interceptacoes REAL NOT NULL,
        recuperacoes REAL NOT NULL,
        duelos_aereos_ganhos REAL NOT NULL,
        defesas_goleiro REAL,
        xg_sofrido_goleiro REAL,
        atualizado_em TEXT NOT NULL
    );
    """)
    mcur.execute("CREATE INDEX idx_m_atl_clube ON metrica_atleta_avancada_2026(clube_id);")
    mcur.execute("CREATE INDEX idx_m_atl_xg ON metrica_atleta_avancada_2026(xg DESC);")

    # DDL da tabela proposta metrica_clube_avancada_2026
    mcur.execute("""
    CREATE TABLE metrica_clube_avancada_2026 (
        clube_id INTEGER PRIMARY KEY,
        partidas INTEGER NOT NULL,
        posse_pct REAL NOT NULL,
        field_tilt_pct REAL NOT NULL,
        ppda REAL NOT NULL,
        altura_defensiva REAL NOT NULL,
        xg_pro REAL NOT NULL,
        npxg_pro REAL NOT NULL,
        xg_contra REAL NOT NULL,
        npxg_contra REAL NOT NULL,
        pontos_esperados REAL NOT NULL,
        passes_terco_final REAL NOT NULL,
        atualizado_em TEXT NOT NULL
    );
    """)

    # Inserir atletas na tabela em memória
    for p in players:
        s = p.get("s", {})
        mcur.execute("""
        INSERT INTO metrica_atleta_avancada_2026 VALUES (
            ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
        )
        """, (
            p.get("id"),
            p.get("team"),
            int(s.get("apps", 0)),
            int(s.get("starts", 0)),
            int(s.get("minutes", 0)),
            float(s.get("goals", 0.0)),
            float(s.get("npgoals", 0.0)),
            float(s.get("xg", 0.0)),
            float(s.get("npxg", 0.0)),
            float(s.get("xa", 0.0)),
            float(s.get("prog_passes", 0.0)),
            float(s.get("key_passes", 0.0)),
            float(s.get("passes_into_box", 0.0)),
            float(s.get("prog_carries", 0.0)),
            float(s.get("takeons_won", 0.0)),
            float(s.get("sca", 0.0)),
            float(s.get("gca", 0.0)),
            float(s.get("tackles_won", 0.0)),
            float(s.get("interceptions", 0.0)),
            float(s.get("recoveries", 0.0)),
            float(s.get("aerials_won", 0.0)),
            float(s.get("saves", 0.0)),
            float(s.get("xg_faced", 0.0)),
            "2026-11-06"
        ))

    # Inserir clubes na tabela em memória
    for t in teams:
        s = t.get("s", {})
        mcur.execute("""
        INSERT INTO metrica_clube_avancada_2026 VALUES (
            ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
        )
        """, (
            t.get("id"),
            int(s.get("mp", 0)),
            float(s.get("possession", 0.0)),
            float(s.get("field_tilt", 0.0)),
            float(s.get("ppda", 0.0)),
            float(s.get("def_height", 0.0)),
            float(s.get("xg", 0.0)),
            float(s.get("npxg", 0.0)),
            float(s.get("xg_against", 0.0)),
            float(s.get("npxg_against", 0.0)),
            float(s.get("xpts", 0.0)),
            float(s.get("passes_final_third", 0.0)),
            "2026-11-06"
        ))

    mem_conn.commit()
    
    # Calcular tamanho das páginas
    mcur.execute("PRAGMA page_count;")
    page_count = mcur.fetchone()[0]
    mcur.execute("PRAGMA page_size;")
    page_size = mcur.fetchone()[0]
    
    total_bytes = page_count * page_size
    total_kb = total_bytes / 1024
    total_mb = total_bytes / (1024 * 1024)
    
    mem_conn.close()
    
    return {
        "page_count": page_count,
        "page_size": page_size,
        "total_bytes": total_bytes,
        "total_kb": round(total_kb, 2),
        "total_mb": round(total_mb, 4)
    }

def main():
    print("="*70)
    print("SPIKE: AVALIAÇÃO ISOLADA DO BRASILEIRÃO EM DADOS (2026)")
    print("="*70)
    
    # 1. Download único controlado para staging
    raw_bytes = baixar_core_json()
    
    # 2. Análise do payload
    info = analisar_payload(raw_bytes)
    print(f"\n[METADADOS DO PAYLOAD]")
    print(f"- SHA-256: {info['sha256']}")
    print(f"- Tamanho: {info['tamanho_bytes']} bytes ({info['tamanho_mb']} MB)")
    print(f"- Temporada / Liga: {info['meta'].get('season')} | {info['meta'].get('league')}")
    print(f"- Partidas no arquivo: {info['n_matches']}")
    print(f"- Clubes: {info['n_teams']}")
    print(f"- Atletas: {info['n_players']}")
    print(f"- Eventos totais mapeados: {info['meta'].get('n_events')}")
    
    # 3. Conexão Read-Only com banco canônico
    print(f"\n[CONEXÃO READ-ONLY COM BANCO CANÔNICO]")
    db_uri = f"file:{DB_PATH}?mode=ro"
    db_conn = sqlite3.connect(db_uri, uri=True)
    
    # Verificar integridade e tamanho do banco atual
    cur = db_conn.cursor()
    cur.execute("SELECT COUNT(*) FROM dim_clube")
    count_clubes_db = cur.fetchone()[0]
    cur.execute("SELECT COUNT(*) FROM jogadores")
    count_jogadores_db = cur.fetchone()[0]
    cur.execute("PRAGMA journal_mode;")
    jm = cur.fetchone()[0]
    db_size_mb = os.path.getsize(DB_PATH) / (1024 * 1024)
    print(f"- Status do Banco: {db_size_mb:.2f} MB | journal_mode: {jm}")
    print(f"- dim_clube: {count_clubes_db} registros | jogadores: {count_jogadores_db} registros")
    
    # 4. Reconciliação de Clubes
    print(f"\n[RECONCILIAÇÃO DE CLUBES (20 CLUBES)]")
    reconc_clubes = reconciliar_clubes(info["data"]["teams"], db_conn)
    clubes_map = {}
    for r in reconc_clubes:
        m = r["match"]
        clubes_map[r["bed_id"]] = m
        print(f"  {r['bed_name']:<18} ({r['bed_short']:<3}) -> {m['nome_canonico']:<18} (ID: {m['clube_id_canonico']:<4}) | Score: {m['score']} [{r['status']}]")

    # 5. Reconciliação de Atletas
    print(f"\n[RECONCILIAÇÃO DE ATLETAS (728 ATLETAS)]")
    reconc_atletas = reconciliar_atletas(info["data"]["players"], clubes_map, db_conn)
    print(f"- Matches Exatos: {len(reconc_atletas['exatos'])} ({len(reconc_atletas['exatos'])/info['n_players']*100:.1f}%)")
    print(f"- Matches Prováveis: {len(reconc_atletas['provaveis'])} ({len(reconc_atletas['provaveis'])/info['n_players']*100:.1f}%)")
    print(f"- Matches Ambíguos (Homônimos): {len(reconc_atletas['ambiguos'])} ({len(reconc_atletas['ambiguos'])/info['n_players']*100:.1f}%)")
    print(f"- Não Reconciliados (Quarentena): {len(reconc_atletas['nao_reconciliados'])} ({len(reconc_atletas['nao_reconciliados'])/info['n_players']*100:.1f}%)")
    print(f"- Atletas > 450 min sem match canônico: {len(reconc_atletas['sem_match_mais_450min'])}")
    
    if reconc_atletas['sem_match_mais_450min']:
        print("\n  [Amostra de atletas > 450 min sem match]:")
        for a in reconc_atletas['sem_match_mais_450min'][:10]:
            print(f"    - {a['bed_name']} ({a['bed_team']}) - {a['minutos']} min - Pos: {a['posicao']} (Score: {a['melhor_score_encontrado']})")

    # 6. Estimativa de tamanho em memória
    print(f"\n[ESTIMATIVA DE CAPACIDADE NO SQLITE (SIMULAÇÃO EM MEMÓRIA)]")
    est_kpi = estimar_tamanho_kpis_em_memoria(info["data"]["players"], info["data"]["teams"])
    print(f"- Páginas B-Tree: {est_kpi['page_count']} (Page size: {est_kpi['page_size']} bytes)")
    print(f"- Tamanho Total das Tabelas Agregadas: {est_kpi['total_kb']} KB ({est_kpi['total_mb']} MB)")
    print(f"- Margem de segurança: Ocupa apenas {est_kpi['total_mb'] / (84.0 - db_size_mb) * 100:.2f}% da folga restante de {84.0 - db_size_mb:.2f} MB!")
    
    db_conn.close()
    
    # Salvar resultados brutos para auditoria no staging
    res_audit_path = os.path.join(STAGING_DIR, "auditoria_spike_resumo.json")
    with open(res_audit_path, "w", encoding="utf-8") as f:
        json.dump({
            "info": {
                "sha256": info["sha256"],
                "tamanho_bytes": info["tamanho_bytes"],
                "tamanho_mb": info["tamanho_mb"],
                "n_teams": info["n_teams"],
                "n_players": info["n_players"],
                "n_matches": info["n_matches"],
                "meta": info["meta"]
            },
            "clubes": reconc_clubes,
            "resumo_atletas": {
                "exatos_count": len(reconc_atletas["exatos"]),
                "provaveis_count": len(reconc_atletas["provaveis"]),
                "ambiguos_count": len(reconc_atletas["ambiguos"]),
                "nao_reconciliados_count": len(reconc_atletas["nao_reconciliados"]),
                "sem_match_mais_450min_count": len(reconc_atletas["sem_match_mais_450min"]),
                "sem_match_mais_450min_amostra": reconc_atletas["sem_match_mais_450min"]
            },
            "estimativa_tamanho": est_kpi
        }, f, indent=2, ensure_ascii=False)
        
    print(f"\n[OK] Auditoria do SPIKE concluída com sucesso. Resumo salvo em: {res_audit_path}")
    print("="*70)

if __name__ == "__main__":
    main()
