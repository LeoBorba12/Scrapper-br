"""
Importador Oficial de Gols, Atletas e Súmulas do Brasileirão 2025 e 2026
========================================================================
Fonte: OGol (Edições Oficiais da Série A 2025 e 2026)
- Extrai fichas técnicas de todas as 380 partidas de 2025 e todas as 308 partidas de 2026.
- Captura todos os autores de gols, minutos exatos, tipos de gol e ogol_id.
- Insere na tabela `gols` e atualiza a tabela mestra `jogadores` e `jogadores_resumo`.
- Sincroniza data/futebol.db e api/data/futebol.db.
"""

import re
import os
import sys
import time
import shutil
import sqlite3
import requests
from bs4 import BeautifulSoup
from concurrent.futures import ThreadPoolExecutor, as_completed

DB_LOCAL = "data/futebol.db"
DB_API = "api/data/futebol.db"

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
    "Accept-Language": "pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7"
}

MAPA_CLUBES = {
    "Atlético Mineiro": "Atlético-MG",
    "Atletico Mineiro": "Atlético-MG",
    "Atlético-MG": "Atlético-MG",
    "Atletico-MG": "Atlético-MG",
    "Athletico Paranaense": "Athletico-PR",
    "Atlético Paranaense": "Athletico-PR",
    "Athletico-PR": "Athletico-PR",
    "Atlético-PR": "Athletico-PR",
    "Atlético Goianiense": "Atlético-GO",
    "Atletico-GO": "Atlético-GO",
    "São Paulo": "São Paulo",
    "Sao Paulo": "São Paulo",
    "Grêmio": "Grêmio",
    "Gremio": "Grêmio",
    "Ceará": "Ceará",
    "Ceara": "Ceará",
    "Goiás": "Goiás",
    "Goias": "Goiás",
    "Criciúma": "Criciúma",
    "Criciuma": "Criciúma",
    "Avaí": "Avaí",
    "Avai": "Avaí",
    "Cuiabá": "Cuiabá",
    "Cuiaba": "Cuiabá",
    "América Mineiro": "América-MG",
    "América-MG": "América-MG",
    "Vitória": "Vitória",
    "Vitoria": "Vitória",
    "Coritiba": "Coritiba",
    "Chapecoense": "Chapecoense",
    "Juventude": "Juventude",
    "Fortaleza": "Fortaleza",
    "Bahia": "Bahia",
    "Cruzeiro": "Cruzeiro",
    "Internacional": "Internacional",
    "Flamengo": "Flamengo",
    "Fluminense": "Fluminense",
    "Botafogo": "Botafogo",
    "Vasco da Gama": "Vasco",
    "Vasco": "Vasco",
    "Santos": "Santos",
    "Palmeiras": "Palmeiras",
    "Corinthians": "Corinthians",
    "Red Bull Bragantino": "Red Bull Bragantino",
    "Bragantino": "Red Bull Bragantino",
    "Mirassol": "Mirassol",
    "Sport": "Sport",
    "Sport Recife": "Sport",
    "Operário-PR": "Operário-PR",
    "Operário Ferroviário": "Operário-PR",
    "Novorizontino": "Novorizontino"
}

def normalizar_clube(nome: str) -> str:
    n = (nome or "").strip()
    return MAPA_CLUBES.get(n, n)

def extrair_links_calendario(edicao_url: str, max_pages: int = 8) -> list:
    partidas = []
    seen = set()
    session = requests.Session()
    session.headers.update(HEADERS)

    for p in range(1, max_pages + 1):
        url = f"{edicao_url}?page={p}"
        try:
            r = session.get(url, timeout=12)
            if r.status_code != 200:
                break
            soup = BeautifulSoup(r.text, "html.parser")
            novas = 0
            for a in soup.find_all("a", href=True):
                href = a["href"]
                if href.startswith("/jogo/") and len(href.split("/")) == 4:
                    txt = a.get_text(strip=True)
                    if re.match(r"^\d+\s*[-xX]\s*\d+$", txt):
                        if href not in seen:
                            seen.add(href)
                            partidas.append(href)
                            novas += 1
            if novas == 0 and p > 1:
                break
        except Exception as e:
            print(f"Erro ao extrair pagina {p}: {e}")
            break
    return partidas

def parsear_ficha_jogo(href: str, session: requests.Session) -> dict:
    url = f"https://www.ogol.com.br{href}"
    for _ in range(2):
        try:
            r = session.get(url, timeout=12)
            if r.status_code != 200:
                time.sleep(0.5)
                continue
            soup = BeautifulSoup(r.text, "html.parser")
            
            # Data da partida: /jogo/YYYY-MM-DD-time1-time2/ID
            m_dt = re.search(r"/jogo/(\d{4}-\d{2}-\d{2})-", href)
            data_iso = m_dt.group(1) if m_dt else None

            # Times
            team_links = []
            for a in soup.find_all("a", href=True):
                if "/equipe/" in a["href"] and a.parent and "match-header-team-name" in a.parent.get("class", []):
                    team_links.append(normalizar_clube(a.get_text(strip=True)))

            if len(team_links) < 2:
                # Fallback pelos slugs da URL
                m_slug = re.search(r"/jogo/\d{4}-\d{2}-\d{2}-([a-z0-9\-]+)-([a-z0-9\-]+)/\d+", href)
                if m_slug:
                    mandante_raw = m_slug.group(1).replace("-", " ").title()
                    visitante_raw = m_slug.group(2).replace("-", " ").title()
                    mandante = normalizar_clube(mandante_raw)
                    visitante = normalizar_clube(visitante_raw)
                else:
                    return None
            else:
                mandante = team_links[0]
                visitante = team_links[1]

            # Gols
            gols = []
            for sc in soup.find_all(class_=lambda c: c and "scorer" in c.lower()):
                classes = sc.get("class", [])
                lado = "mandante" if "right" in classes else "visitante"
                clube_gol = mandante if lado == "mandante" else visitante

                for a_p in sc.find_all("a", href=True):
                    atleta_nome = a_p.get_text(strip=True)
                    ogol_id_str = a_p["href"].split("/")[-1] if "/jogador/" in a_p["href"] else None
                    ogol_id = int(ogol_id_str) if ogol_id_str and ogol_id_str.isdigit() else None

                    # Minuto
                    t_span = a_p.find_next_sibling("span", class_="time")
                    minuto_txt = t_span.get_text(strip=True) if t_span else ""
                    minutos = [m.strip() for m in minuto_txt.split() if m.strip()]

                    tipo_gol = "Gol Normal"
                    if "(p.)" in minuto_txt.lower() or "pen" in minuto_txt.lower():
                        tipo_gol = "Pênalti"
                    elif "(o.g.)" in minuto_txt.lower() or "contra" in minuto_txt.lower():
                        tipo_gol = "Gol Contra"

                    for min_g in (minutos if minutos else [""]):
                        m_limpo = min_g.replace("'", "").replace("(p.)", "").replace("(o.g.)", "").strip()
                        gols.append({
                            "atleta": atleta_nome,
                            "ogol_id": ogol_id,
                            "clube": clube_gol,
                            "minuto": m_limpo,
                            "tipo_de_gol": tipo_gol
                        })

            return {
                "href": href,
                "data": data_iso,
                "mandante": mandante,
                "visitante": visitante,
                "gols": gols
            }
        except Exception:
            time.sleep(0.5)
    return None

def executar_ingestao():
    print("==================================================================")
    print("  INGESTÃO DE GOLS E FICHAS TÉCNICAS: BRASILEIRÃO 2025 E 2026     ")
    print("==================================================================")

    # 1. Coleta links das temporadas
    print("\n[1/4] Coletando calendário de partidas do OGol...")
    links_2025 = extrair_links_calendario("https://www.ogol.com.br/edicao/brasileirao-serie-a-2025/194851/calendario", 8)
    print(f" -> Brasileirão 2025: {len(links_2025)} jogos encontrados.")

    links_2026 = extrair_links_calendario("https://www.ogol.com.br/edicao/brasileirao-serie-a-2026/210277/calendario", 8)
    print(f" -> Brasileirão 2026: {len(links_2026)} jogos encontrados.")

    todos_links = links_2025 + links_2026
    total_jogos = len(todos_links)
    print(f" -> Total de jogos a processar: {total_jogos}")

    # 2. Processa fichas técnicas em paralelo com pool de conexões (com cache local)
    cache_file = "data/resultados_ogol_2025_2026.json"
    resultados = []
    
    if os.path.exists(cache_file):
        print(f"\n[2/4] Carregando fichas parseadas do cache local ({cache_file})...")
        import json
        with open(cache_file, "r", encoding="utf-8") as f:
            resultados = json.load(f)
        print(f" -> {len(resultados)} fichas carregadas do cache!")
    else:
        print("\n[2/4] Baixando súmulas e autores de gols (pool concorrente)...")
        t0 = time.time()
        session = requests.Session()
        session.headers.update(HEADERS)

        with ThreadPoolExecutor(max_workers=8) as executor:
            futures = {executor.submit(parsear_ficha_jogo, href, session): href for href in todos_links}
            concluidos = 0
            for f in as_completed(futures):
                res = f.result()
                if res:
                    resultados.append(res)
                concluidos += 1
                if concluidos % 50 == 0 or concluidos == total_jogos:
                    elapsed = time.time() - t0
                    print(f" -> Processados {concluidos}/{total_jogos} jogos ({len(resultados)} fichas parseadas) em {elapsed:.1f}s")
        
        import json
        with open(cache_file, "w", encoding="utf-8") as f:
            json.dump(resultados, f, ensure_ascii=False, indent=2)
        print(f" -> Cache salvo em {cache_file}")

    # 3. Inserção no banco de dados local
    print("\n[3/4] Inserindo gols e atualizando partidas no banco de dados...")
    conn = sqlite3.connect(DB_LOCAL)
    c = conn.cursor()

    # Limpa gols prévios de 2025 e 2026 para re-inserção limpa e idempotente
    c.execute("DELETE FROM gols WHERE id_partida IN (SELECT id_partida FROM partidas WHERE ano IN (2025, 2026))")

    total_gols_inseridos = 0

    # Cache de partidas no banco para rápido matching
    c.execute("SELECT id_partida, data, mandante, visitante FROM partidas WHERE ano IN (2025, 2026)")
    partidas_db = c.fetchall()
    
    # Mapeamento rápido: (data, mandante, visitante) -> id_partida
    mapa_partidas = {}
    for pid, dt, mand, vis in partidas_db:
        mapa_partidas[(dt, normalizar_clube(mand), normalizar_clube(vis))] = pid
        mapa_partidas[(dt, mand[:6], vis[:6])] = pid

    for jogo in resultados:
        dt = jogo["data"]
        mand = jogo["mandante"]
        vis = jogo["visitante"]

        pid = mapa_partidas.get((dt, mand, vis))
        if not pid:
            pid = mapa_partidas.get((dt, mand[:6], vis[:6]))
        
        # Se ainda não encontrou, busca no SQLite com LIKE
        if not pid and dt:
            c.execute("""
                SELECT id_partida FROM partidas 
                WHERE data = ? AND mandante LIKE ? AND visitante LIKE ?
                LIMIT 1
            """, (dt, f"%{mand[:6]}%", f"%{vis[:6]}%"))
            row = c.fetchone()
            if row:
                pid = row[0]

        if not pid:
            # Insere a partida caso ela não exista
            ano = int(dt[:4]) if dt else 2025
            c.execute("""
                INSERT INTO partidas (ano, data, mandante, visitante, placar, campeonato)
                VALUES (?, ?, ?, ?, '0 x 0', ?)
            """, (ano, dt, mand, vis, f"Brasileirão {ano}"))
            pid = c.lastrowid
            mapa_partidas[(dt, mand, vis)] = pid

        # Insere os gols da partida
        for g in jogo["gols"]:
            atleta = g["atleta"]
            clube_gol = g["clube"]
            ogol_id = g.get("ogol_id")

            # Desambiguação precisa de nomes conhecidos
            if ogol_id == 75171 or atleta.lower() in ("gabriel barbosa", "gabigol"):
                atleta = "Gabriel Barbosa"
            elif atleta.lower() == "gabriel" and clube_gol in ("Santos", "Flamengo", "Cruzeiro"):
                atleta = "Gabriel Barbosa"
            elif ogol_id == 450166 or (atleta.lower() == "paulinho" and clube_gol in ("Atlético-MG", "Atlético Mineiro", "Vasco")):
                atleta = "Paulinho (Atlético-MG)"
            elif ogol_id == 81486 or (atleta.lower() == "paulinho" and "corinthians" in clube_gol.lower()):
                atleta = "Paulinho (Corinthians)"
            elif atleta.lower() == "paulinho":
                atleta = f"Paulinho ({clube_gol})"

            c.execute("""
                INSERT INTO gols (id_partida, atleta, clube, minuto, tipo_de_gol)
                VALUES (?, ?, ?, ?, ?)
            """, (pid, atleta, clube_gol, g["minuto"], g["tipo_de_gol"]))
            total_gols_inseridos += 1

            # Atualiza ou insere na tabela jogadores se tiver ogol_id
            if ogol_id:
                c.execute("""
                    INSERT INTO jogadores (ogol_id, nome_exibicao, apelido, total_gols)
                    VALUES (?, ?, ?, 1)
                    ON CONFLICT(ogol_id) DO UPDATE SET
                        total_gols = total_gols + 1
                """, (ogol_id, atleta, atleta))

    conn.commit()
    print(f" -> Total de novos gols inseridos em 2025/2026: {total_gols_inseridos}")

    # 4. Reconstrução de jogadores_resumo e sincronização
    print("\n[4/4] Recalculando jogadores_resumo e sincronizando bancos...")
    c.execute("DROP TABLE IF EXISTS jogadores_resumo")
    c.execute("""
        CREATE TABLE jogadores_resumo (
            nome TEXT PRIMARY KEY,
            clubes TEXT,
            total_jogos INTEGER,
            total_gols INTEGER,
            total_assistencias INTEGER DEFAULT 0,
            total_amarelos INTEGER,
            total_vermelhos INTEGER,
            ano_min INTEGER,
            ano_max INTEGER
        )
    """)

    c.execute("""
        INSERT INTO jogadores_resumo (nome, clubes, total_jogos, total_gols, total_amarelos, total_vermelhos, ano_min, ano_max)
        SELECT 
            atleta,
            GROUP_CONCAT(DISTINCT clube) as clubes,
            COUNT(DISTINCT id_partida) as total_jogos,
            COUNT(*) as total_gols,
            0 as total_amarelos,
            0 as total_vermelhos,
            MIN(ano) as ano_min,
            MAX(ano) as ano_max
        FROM (
            SELECT g.atleta, g.clube, g.id_partida, p.ano
            FROM gols g
            JOIN partidas p ON g.id_partida = p.id_partida
            WHERE g.atleta IS NOT NULL AND g.atleta != ''
        )
        GROUP BY atleta
    """)

    # Atualiza assistências do jogadores_resumo a partir da tabela jogadores
    c.execute("""
        UPDATE jogadores_resumo
        SET total_assistencias = (
            SELECT total_assistencias FROM jogadores 
            WHERE jogadores.nome_exibicao = jogadores_resumo.nome 
               OR jogadores.nome_completo = jogadores_resumo.nome
            LIMIT 1
        )
        WHERE EXISTS (
            SELECT 1 FROM jogadores 
            WHERE jogadores.nome_exibicao = jogadores_resumo.nome 
               OR jogadores.nome_completo = jogadores_resumo.nome
        )
    """)

    # Limpa resíduos de Paulinho
    c.execute("DELETE FROM jogadores_resumo WHERE nome = 'Paulinho'")
    c.execute("DELETE FROM jogadores_resumo WHERE nome LIKE 'Paulinho %'''")
    c.execute("DELETE FROM jogadores_resumo WHERE nome LIKE 'Paulinho Jose Paulo%'")
    c.execute("DELETE FROM jogadores_resumo WHERE nome LIKE 'Paulinho Paulo Henrique%'")

    conn.commit()
    conn.close()

    # Espelha para a API
    shutil.copyfile(DB_LOCAL, DB_API)
    print(f" -> Banco copiado com sucesso para {DB_API}")

    print("\n==================================================================")
    print("  INGESTÃO 2025/2026 CONCLUÍDA COM SUCESSO!                      ")
    print("==================================================================")

if __name__ == "__main__":
    executar_ingestao()
