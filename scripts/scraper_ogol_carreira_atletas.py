"""
Pipeline de Enriquecimento de Carreira Oficial de Jogadores (OGol)
==================================================================
- Acessa a página de perfil oficial do atleta no OGol (zerozero.pt).
- Extrai a tabela consolidada de toda a carreira (Clubes, Períodos, Jogos, Gols, Assistências).
- Atualiza as colunas em 'jogadores_estatisticas':
    * gols_carreira_oficiais
    * jogos_carreira_oficiais
    * assistencias_carreira_oficiais
    * detalhe_carreira_clubes (JSON com todos os clubes da carreira)
    * ogol_id (quando descoberto via busca)
- Idempotente com cache persistente em data/cache_ogol_perfis/.
- Suporta execução por lote (--limit), por nome (--nome), ou contínua (--top).
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

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')
if hasattr(sys.stderr, 'reconfigure'):
    sys.stderr.reconfigure(encoding='utf-8', errors='replace')

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DB_PATH = os.path.join(BASE_DIR, "data", "futebol.db")
CACHE_DIR = os.path.join(BASE_DIR, "data", "cache_ogol_perfis")
os.makedirs(CACHE_DIR, exist_ok=True)

HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept-Language': 'pt-BR,pt;q=0.9,en;q=0.8',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
}

# Mapa de apelidos e nomes canônicos para busca direta
MAPA_BUSCA_DIRETA = {
    "pelé": "/jogador/pele",
    "pele": "/jogador/pele",
    "zico": "/jogador/zico",
    "dario": "/jogador/dada-maravilha/26669",
    "dadá maravilha": "/jogador/dada-maravilha/26669",
    "dada maravilha": "/jogador/dada-maravilha/26669",
    "roberto dinamite": "/jogador/roberto-dinamite/27464",
    "gabriel barbosa": "/jogador/gabriel-barbosa/75171",
    "gabigol": "/jogador/gabriel-barbosa/75171",
    "rogério ceni": "/jogador/rogerio-ceni/5664",
    "rogerio ceni": "/jogador/rogerio-ceni/5664",
    "túlio maravilha": "/jogador/tulio-maravilha/42587",
    "tulio maravilha": "/jogador/tulio-maravilha/42587",
    "hulk": "/jogador/hulk/5696",
    "fred": "/jogador/fred/9839",
    "romário": "/jogador/romario",
    "romario": "/jogador/romario",
    "edmundo": "/jogador/edmundo/5267",
    "luís fabiano": "/jogador/luis-fabiano/5685",
    "luis fabiano": "/jogador/luis-fabiano/5685",
    "diego souza": "/jogador/diego-souza/1283",
    "reinaldo": "/jogador/reinaldo/27466",
    "dejan petkovic": "/jogador/petkovic/5312",
    "petkovic": "/jogador/petkovic/5312",
    "viola": "/jogador/viola/27469",
    "magno alves": "/jogador/magno-alves/58891",
    "carlos frontini": "/jogador/carlos-frontini/37821",
    "frontini": "/jogador/carlos-frontini/37821",
    "kléber pereira": "/jogador/kleber-pereira/5277",
    "kleber pereira": "/jogador/kleber-pereira/5277",
    "dimba": "/jogador/dimba/5283",
    "alex dias": "/jogador/alex-dias/5682",
    "finazzi": "/jogador/finazzi/31804",
    "rinaldo": "/jogador/rinaldo/5289",
    "tuta": "/jogador/tuta/5777",
    "paulinho mclaren": "/jogador/paulinho-mclaren/31803",
    "oséas": "/jogador/oseas/5684",
    "oseas": "/jogador/oseas/5684",
    "germán cano": "/jogador/german-cano/36577",
    "german cano": "/jogador/german-cano/36577",
    "cano": "/jogador/german-cano/36577",
    "bruno henrique": "/jogador/bruno-henrique/250453",
    "dudu": "/jogador/dudu/95611",
    "wellington paulista": "/jogador/wellington-paulista/6041",
    "rafael moura": "/jogador/rafael-moura/32411",
    "deivid": "/jogador/deivid/3473",
    "alex alves": "/jogador/alex-alves/5663",
    "caio ribeiro": "/jogador/caio-ribeiro/376572",
    "caio júnior": "/jogador/caio-junior/116486",
    "caio junior": "/jogador/caio-junior/116486",
    "toninho guerreiro": "/jogador/toninho-guerreiro/313716",
    "pedro": "/jogador/pedro/481359",
    "pedro guilherme": "/jogador/pedro/481359",
    "alecsandro": "/jogador/alecsandro/5707",
    "borges": "/jogador/borges/5688",
    "paulo baier": "/jogador/paulo-baier/5690",
    "roger": "/jogador/roger/5713",
    "luizão": "/jogador/luizao/4663",
    "luizao": "/jogador/luizao/4663",
    "marcinho": "/jogador/marcinho/5700",
    "washington": "/jogador/washington/5679",
    "christian": "/jogador/christian/5417",
    "aílton": "/jogador/ailton/3132",
    "ailton": "/jogador/ailton/3132",
    "danilo": "/jogador/danilo/5679"
}

def safe_print(msg: str):
    try:
        print(msg)
        sys.stdout.flush()
    except Exception:
        pass

def fetch_url(url: str, retries: int = 3) -> str:
    for tentativa in range(retries):
        try:
            req = urllib.request.Request(url, headers=HEADERS)
            with urllib.request.urlopen(req, timeout=14) as resp:
                return resp.read().decode('utf-8', errors='replace')
        except urllib.error.HTTPError as e:
            if e.code == 429:
                wait_t = 5 * (tentativa + 1)
                safe_print(f"  [429 Rate Limit] Aguardando {wait_t}s...")
                time.sleep(wait_t)
            elif e.code == 404:
                return ""
            else:
                time.sleep(2)
        except Exception as e:
            time.sleep(2)
    return ""

def buscar_ogol_path(nome: str, ogol_id: int = None) -> tuple:
    """Retorna (path, ogol_id_encontrado)"""
    nome_norm = nome.strip().lower()
    
    # 1. Mapa estático de lendas
    if nome_norm in MAPA_BUSCA_DIRETA:
        path = MAPA_BUSCA_DIRETA[nome_norm]
        m = re.search(r'/(\d+)$', path)
        oid = int(m.group(1)) if m else None
        return path, oid

    # 2. Se já possui ogol_id
    if ogol_id and ogol_id > 0:
        return f"/jogador/-/{ogol_id}", ogol_id

    # 3. Busca dinâmica no OGol
    q = urllib.parse.quote(nome.strip())
    search_url = f"https://www.ogol.com.br/pesquisa?search_txt={q}&search_type=player"
    html = fetch_url(search_url)
    if not html:
        return None, None

    # Encontrar links do tipo /jogador/slug/id
    matches = re.findall(r'href=["\'](/jogador/([^/"\']+)(?:/(\d+))?[^"\']*)["\']', html)
    for path, slug, oid in matches:
        if 'titulos' in path or 'fotos' in path:
            continue
        if oid and int(oid) > 0:
            return path.split('?')[0], int(oid)
        elif slug and not slug.startswith('-'):
            return path.split('?')[0], None

    return None, None

def extrair_tabela_carreira(html: str) -> dict:
    """Extrai a tabela de estatísticas de clubes e seleção do atleta (compatível com atletas aposentados e em atividade)."""
    tables = re.findall(r'<table[^>]*>.*?</table>', html, re.DOTALL)
    if not tables:
        return None

    # ESTRATÉGIA 1: Tabela Temporada a Temporada (comum em atletas em atividade e históricos detalhados)
    tabela_temporadas = None
    for t in tables:
        if 'TEMPORADA' in t and ('EQUIPE' in t or 'Equipe' in t) and 'J' in t:
            tabela_temporadas = t
            break

    if tabela_temporadas:
        headers_row = re.search(r'<tr[^>]*>(.*?)</tr>', tabela_temporadas, re.DOTALL)
        idx_temp = 1
        idx_equipe = 2
        idx_j = 3
        idx_g = 4
        idx_a = 5
        if headers_row:
            ths = [re.sub(r'<[^>]+>', '', c).strip().upper() for c in re.findall(r'<t[dh][^>]*>(.*?)</t[dh]>', headers_row.group(1), re.DOTALL)]
            for i, h in enumerate(ths):
                if 'TEMPORADA' in h or 'ÉPOCA' in h: idx_temp = i
                elif 'EQUIPE' in h or 'CLUBE' in h: idx_equipe = i
                elif h == 'J': idx_j = i
                elif h in ['G', 'GM']: idx_g = i
                elif 'ASS' in h: idx_a = i

        rows = re.findall(r'<tr[^>]*>(.*?)</tr>', tabela_temporadas, re.DOTALL)
        clubes_map = {}
        total_jogos = 0
        total_gols = 0
        total_assists = 0

        for r in rows:
            cells_html = re.findall(r'<t[dh][^>]*>(.*?)</t[dh]>', r, re.DOTALL)
            if not cells_html:
                continue
            cells_clean = [re.sub(r'<[^>]+>', '', c).strip() for c in cells_html]
            if len(cells_clean) <= max(idx_j, idx_g):
                continue
            if 'TEMPORADA' in cells_clean or 'EQUIPE' in cells_clean or 'J' in cells_clean:
                continue

            # Nome do clube
            m_clb = re.search(r'<a href=["\']/(?:equipe|selecao)/[^"\']+["\']>([^<]+)</a>', r)
            clube_nome = m_clb.group(1).strip() if m_clb else (cells_clean[idx_equipe] if len(cells_clean) > idx_equipe else None)
            if not clube_nome or clube_nome in ['Equipe', 'Total']:
                continue

            # Ignorar categorias de base e futsal/infantil
            if any(tag in clube_nome for tag in ['[S19]', '[S17]', '[S15]', '[S13]', '[S11]', '[Sub-', 'Fut.7']):
                continue

            val_j = cells_clean[idx_j] if len(cells_clean) > idx_j else ''
            val_g = cells_clean[idx_g] if len(cells_clean) > idx_g else ''
            val_a = cells_clean[idx_a] if len(cells_clean) > idx_a else ''

            if val_j.isdigit() and val_g.isdigit():
                j = int(val_j)
                g = int(val_g)
                a = int(val_a) if val_a.isdigit() else 0

                clube_clean = re.sub(r'\s*\([^)]*\)', '', clube_nome).strip()
                if clube_clean not in clubes_map:
                    clubes_map[clube_clean] = {"clube": clube_clean, "periodo": "", "jogos": 0, "gols": 0, "assistencias": 0}
                clubes_map[clube_clean]["jogos"] += j
                clubes_map[clube_clean]["gols"] += g
                clubes_map[clube_clean]["assistencias"] += a
                total_jogos += j
                total_gols += g
                total_assists += a

        if total_jogos > 0 or total_gols > 0:
            return {
                "total_jogos": total_jogos,
                "total_gols": total_gols,
                "total_assistencias": total_assists,
                "clubes": list(clubes_map.values())
            }

    # ESTRATÉGIA 2: Tabela Resumo de Carreira por Clubes (padrão em lendas aposentadas)
    tabela_stats = None
    for t in tables:
        if 'GM' in t and 'ASS' in t and 'J' in t:
            tabela_stats = t
            break

    if tabela_stats:
        rows = re.findall(r'<tr[^>]*>(.*?)</tr>', tabela_stats, re.DOTALL)
        clubes_resumo = []
        total_jogos = 0
        total_gols = 0
        total_assists = 0

        for r in rows:
            cells_html = re.findall(r'<t[dh][^>]*>(.*?)</t[dh]>', r, re.DOTALL)
            if not cells_html:
                continue
            cells_clean = [re.sub(r'<[^>]+>', '', c).strip() for c in cells_html]
            if 'J' in cells_clean or 'GM' in cells_clean:
                continue

            clube_nome = None
            for ch in cells_html:
                m_clb = re.search(r'<a href=["\']/(?:equipe|selecao)/[^"\']+["\']>([^<]+)</a>', ch)
                if m_clb:
                    clube_nome = m_clb.group(1).strip()
                    break
            
            periodo = ''
            for cc in cells_clean:
                m_per = re.search(r'\[(\d{4}[^\]]*)\]', cc)
                if m_per:
                    periodo = m_per.group(1).replace('>', '-').strip()
                    break

            nums = []
            for cc in cells_clean:
                cc_val = cc.replace('&nbsp;', '').strip()
                if re.match(r'^\d+$', cc_val):
                    nums.append(int(cc_val))

            if clube_nome and len(nums) >= 2:
                j = nums[0]
                g = nums[1]
                a = nums[2] if len(nums) >= 3 else 0
                clubes_resumo.append({
                    "clube": clube_nome,
                    "periodo": periodo,
                    "jogos": j,
                    "gols": g,
                    "assistencias": a
                })
                total_jogos += j
                total_gols += g
                total_assists += a

        if total_jogos > 0 or total_gols > 0:
            return {
                "total_jogos": total_jogos,
                "total_gols": total_gols,
                "total_assistencias": total_assists,
                "clubes": clubes_resumo
            }

    return None

def processar_atleta(conn, atleta_id: int, nome: str, ogol_id: int = None, forcar: bool = False) -> bool:
    """Enriquece um atleta com dados de carreira oficial do OGol (com retry resiliente contra database locks)."""
    # Verificar se já possui dados consolidados (se não estiver forçando)
    if not forcar:
        for _ in range(5):
            try:
                c = conn.cursor()
                ja_tem = c.execute("SELECT gols_carreira_oficiais FROM jogadores_estatisticas WHERE id_jogador = ?;", (atleta_id,)).fetchone()
                if ja_tem and ja_tem[0] and ja_tem[0] > 0:
                    return False
                break
            except sqlite3.OperationalError:
                time.sleep(1.5)

    path, oid_encontrado = buscar_ogol_path(nome, ogol_id)
    if not path:
        return False

    # Verificar cache
    cache_key = f"{oid_encontrado or re.sub(r'[^a-zA-Z0-9]', '_', nome)}.json"
    cache_path = os.path.join(CACHE_DIR, cache_key)
    html = ""

    if os.path.exists(cache_path):
        try:
            with open(cache_path, "r", encoding="utf-8") as f:
                cached = json.load(f)
                html = cached.get("html", "")
        except Exception:
            pass

    if not html:
        url = f"https://www.ogol.com.br{path}"
        html = fetch_url(url)
        if html:
            try:
                with open(cache_path, "w", encoding="utf-8") as f:
                    json.dump({"nome": nome, "path": path, "html": html}, f, ensure_ascii=False)
            except Exception:
                pass
        time.sleep(random.uniform(0.6, 1.2))

    if not html:
        return False

    stats = extrair_tabela_carreira(html)
    if not stats:
        return False

    # Atualizar o banco de dados com retry contra locks concorrentes
    novo_ogol_id = oid_encontrado or ogol_id
    clubes_json = json.dumps(stats["clubes"], ensure_ascii=False)

    for retry in range(5):
        try:
            c = conn.cursor()
            c.execute("""
                UPDATE jogadores_estatisticas
                SET gols_carreira_oficiais = ?,
                    jogos_carreira_oficiais = ?,
                    assistencias_carreira_oficiais = ?,
                    detalhe_carreira_clubes = ?,
                    ogol_id = COALESCE(ogol_id, ?)
                WHERE id_jogador = ?;
            """, (
                stats["total_gols"],
                stats["total_jogos"],
                stats["total_assistencias"],
                clubes_json,
                novo_ogol_id,
                atleta_id
            ))
            conn.commit()
            break
        except sqlite3.OperationalError:
            time.sleep(2.0)

    safe_print(f"  [OK] {nome}: {stats['total_gols']} gols em {stats['total_jogos']} jogos oficiais ({len(stats['clubes'])} clubes)")
    return True

def main():
    parser = argparse.ArgumentParser(description="Enriquecer estatísticas de carreira dos jogadores via OGol")
    parser.add_argument("--limit", type=int, default=50, help="Quantidade máxima de atletas para processar")
    parser.add_argument("--nome", type=str, default="", help="Enriquecer atleta específico por nome")
    parser.add_argument("--top", action="store_true", help="Priorizar maiores artilheiros da história")
    parser.add_argument("--forcar", action="store_true", help="Atualizar mesmo que já possua dados preenchidos")
    args = parser.parse_args()

    conn = sqlite3.connect(DB_PATH, timeout=60.0)
    conn.execute("PRAGMA journal_mode = DELETE;")
    conn.execute("PRAGMA busy_timeout = 60000;")
    c = conn.cursor()

    if args.nome:
        safe_print(f"=== Processando Atleta Específico: {args.nome} ===")
        row = c.execute("""
            SELECT id_jogador, nome_exibicao, ogol_id 
            FROM jogadores_estatisticas 
            WHERE LOWER(nome_exibicao) = LOWER(?) OR LOWER(nome_completo) = LOWER(?) OR LOWER(apelido) = LOWER(?)
            LIMIT 1;
        """, (args.nome, args.nome, args.nome)).fetchone()
        if not row:
            safe_print(f"Atleta '{args.nome}' não encontrado no banco.")
            conn.close()
            return
        processar_atleta(conn, row[0], row[1], row[2], forcar=True)
        conn.close()
        return

    # Consulta prioritária
    where_cond = "WHERE (gols_carreira_oficiais IS NULL OR gols_carreira_oficiais = 0)"
    if args.forcar:
        where_cond = ""

    sql = f"""
        SELECT id_jogador, nome_exibicao, ogol_id, total_gols
        FROM jogadores_estatisticas
        {where_cond}
        ORDER BY total_gols DESC, total_jogos DESC
        LIMIT ?;
    """
    atletas = c.execute(sql, (args.limit,)).fetchall()
    safe_print(f"=== Iniciando Enriquecimento de Carreira para {len(atletas)} atletas ===")

    sucessos = 0
    for idx, (aid, nome, oid, tgols) in enumerate(atletas):
        safe_print(f"[{idx+1}/{len(atletas)}] Analisando: {nome} (gols atuais no BD: {tgols})...")
        if processar_atleta(conn, aid, nome, oid, forcar=args.forcar):
            sucessos += 1

    try:
        conn.execute("VACUUM;")
    except sqlite3.OperationalError:
        pass
    conn.close()

    # Sincronizar com api/data/futebol.db se existir
    api_db = os.path.join(BASE_DIR, "api", "data", "futebol.db")
    if os.path.exists(api_db):
        import shutil
        shutil.copy2(DB_PATH, api_db)
        safe_print("[Sync] Base api/data/futebol.db atualizada com sucesso.")

    safe_print(f"\n[Fim] Enriquecimento concluído! {sucessos} atletas atualizados com 100% de gols da carreira.")

    # Auto-commit e push para disparar deploy automático na Vercel
    if sucessos > 0 and not args.nome:
        try:
            import subprocess
            safe_print("[Git Auto-Sync] Enviando alterações para GitHub para disparar deploy na Vercel...")
            subprocess.run(["git", "add", "data/futebol.db"], cwd=BASE_DIR, check=True)
            subprocess.run(["git", "commit", "-m", f"feat(ogol): enriquecer carreira oficial de {sucessos} atletas (auto-sync Vercel)"], cwd=BASE_DIR, check=True)
            subprocess.run(["git", "pull", "--rebase", "origin", "main"], cwd=BASE_DIR, check=True)
            subprocess.run(["git", "push", "origin", "main"], cwd=BASE_DIR, check=True)
            safe_print("[Git Auto-Sync] Sincronização concluída com sucesso! Vercel iniciou o deploy automático.")
        except Exception as e:
            safe_print(f"[Git Auto-Sync Aviso] Falha ao enviar commit: {e}")

if __name__ == '__main__':
    main()
