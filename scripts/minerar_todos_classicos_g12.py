import urllib.request
import re
import sqlite3
import os
import sys

sys.stdout.reconfigure(encoding='utf-8')

DB_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'data', 'futebol.db')
HEADERS = {'User-Agent': 'Mozilla/5.0'}

def get_next_id(cursor):
    cursor.execute("SELECT MAX(id_partida) FROM partidas;")
    return (cursor.fetchone()[0] or 10000000) + 1

def normalizar_campeonato(comp):
    c = comp.strip()
    if any(k in c.lower() for k in ['paulistão', 'paulista']):
        return 'Campeonato Paulista'
    if any(k in c.lower() for k in ['gaúcho', 'gaucho', 'citadino']):
        return 'Campeonato Gaúcho'
    if any(k in c.lower() for k in ['carioca', 'taça guanabara', 'taça rio']):
        return 'Campeonato Carioca'
    if any(k in c.lower() for k in ['mineiro']):
        return 'Campeonato Mineiro'
    if any(k in c.lower() for k in ['brasileiro', 'brasileirão', 'série a', 'serie a', 'robertão']):
        return 'Campeonato Brasileiro'
    if 'copa do brasil' in c.lower():
        return 'Copa do Brasil'
    if 'libertadores' in c.lower():
        return 'Copa Libertadores'
    if 'sul-americana' in c.lower() or 'sulamericana' in c.lower():
        return 'Copa Sul-Americana'
    if 'rio-sp' in c.lower() or 'rio-são paulo' in c.lower():
        return 'Torneio Rio-São Paulo'
    if 'sul-minas' in c.lower():
        return 'Copa Sul-Minas'
    if 'amistoso' in c.lower():
        return 'Amistoso / Torneio Extra'
    return c or 'Amistoso / Torneio Histórico'

def minerar_palmeiras_santos(cursor, next_id):
    print("\n--- INICIANDO MINERAÇÃO: PALMEIRAS x SANTOS (CLÁSSICO DA SAUDADE) ---")
    url = 'https://www.campeoesdofutebol.com.br/confrontos_palmeiras_santos.html'
    
    cursor.execute("""
        SELECT data FROM partidas 
        WHERE (mandante LIKE '%Palmeiras%' AND visitante LIKE '%Santos%')
           OR (mandante LIKE '%Santos%' AND visitante LIKE '%Palmeiras%');
    """)
    datas_existentes = set(r[0] for r in cursor.fetchall())
    print(f"Datas de Palmeiras x Santos já existentes no banco: {len(datas_existentes)}")

    req = urllib.request.Request(url, headers=HEADERS)
    with urllib.request.urlopen(req, timeout=15) as resp:
        html = resp.read().decode('utf-8', errors='ignore')
        
    pattern = re.findall(
        r'(\d{2}/\d{2}/\d{4})\s*[-–]\s*(.*?)\s+(\d+)\s*x\s*(\d+)\s+(.*?)\s*[-–]\s*(.*?)\s*[-–]\s*(.*?)(?:<br>|</p>|\r?\n)', 
        html, re.IGNORECASE
    )
    print(f"Total de jogos parseados no site: {len(pattern)}")

    novos = []
    for p in pattern:
        dt_raw, t1_raw, g1_str, g2_str, t2_raw, comp_raw, loc_raw = p
        dia, mes, ano = dt_raw.split('/')
        dt_iso = f"{ano}-{mes}-{dia}"
        ano_int = int(ano)
        g1 = int(g1_str)
        g2 = int(g2_str)

        if dt_iso in datas_existentes:
            continue

        mandante = "Palmeiras" if "palmeiras" in t1_raw.lower() or "palestra" in t1_raw.lower() else "Santos"
        visitante = "Santos" if mandante == "Palmeiras" else "Palmeiras"
        gm = g1
        gv = g2
        placar = f"{gm}x{gv}"
        vencedor = mandante if gm > gv else (visitante if gv > gm else "Empate")
        campeonato = normalizar_campeonato(comp_raw)
        estadio = loc_raw.strip()

        novos.append((
            next_id, ano_int, None, dt_iso, None, estadio, "São Paulo", "SP",
            mandante, visitante, gm, gv, placar, vencedor, None, None, None, None, None,
            None, None, None, campeonato, "Histórico Clássico", "Fase Regular"
        ))
        next_id += 1
        datas_existentes.add(dt_iso)

    print(f"Novos jogos de Palmeiras x Santos a inserir: {len(novos)}")
    if novos:
        cursor.executemany("""
            INSERT INTO partidas (
                id_partida, ano, rodada, data, horario, estadio, cidade, estado,
                mandante, visitante, gols_mandante, gols_visitante, placar, vencedor,
                arbitro, assistente_1, assistente_2, quarto_arbitro, var,
                tecnico_mandante, tecnico_visitante, publico, campeonato, formato, fase
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
        """, novos)
    return next_id

def minerar_grenal(cursor, next_id):
    print("\n--- INICIANDO MINERAÇÃO: GRÊMIO x INTERNACIONAL (GRE-NAL) ---")
    urls = [
        'https://www.campeoesdofutebol.com.br/confrontos_grenais5.html',
        'https://www.campeoesdofutebol.com.br/confrontos_grenais4.html',
        'https://www.campeoesdofutebol.com.br/confrontos_grenais3.html',
        'https://www.campeoesdofutebol.com.br/confrontos_grenais2.html',
        'https://www.campeoesdofutebol.com.br/confrontos_grenais.html'
    ]

    cursor.execute("""
        SELECT data FROM partidas 
        WHERE (mandante LIKE '%Grêmio%' AND visitante LIKE '%Internacional%')
           OR (mandante LIKE '%Internacional%' AND visitante LIKE '%Grêmio%');
    """)
    datas_existentes = set(r[0] for r in cursor.fetchall())
    print(f"Datas de Gre-Nal já existentes no banco: {len(datas_existentes)}")

    novos = []
    for u in urls:
        print(f"Baixando {u}...")
        req = urllib.request.Request(u, headers=HEADERS)
        with urllib.request.urlopen(req, timeout=15) as resp:
            html = resp.read().decode('utf-8', errors='ignore')
            
        # Parseia linhas da tabela: <td>num</td> <td>DD/MM/YYYY</td> <td>Time1 G1 X G2 Time2</td> <td>Camp / Estádio</td>
        # Usa regex flexível para espaços e tags
        matches = re.findall(
            r'<tr>\s*<td[^>]*>\s*(\d+)\s*</td>\s*<td[^>]*>\s*(\d{2}/\d{2}/\d{4})\s*</td>\s*<td[^>]*>\s*(.*?)\s*</td>\s*<td[^>]*>\s*(.*?)\s*</td>\s*</tr>',
            html, re.DOTALL | re.IGNORECASE
        )
        print(f"  -> {len(matches)} Gre-Nais encontrados na página")

        for m in matches:
            num_grenal, dt_raw, placar_raw, local_raw = m
            dia, mes, ano = dt_raw.split('/')
            dt_iso = f"{ano}-{mes}-{dia}"
            ano_int = int(ano)

            if dt_iso in datas_existentes:
                continue

            # Parse do placar: ex "Internacional 0 X 1 Grêmio" ou "Grêmio 10 x 0 Internacional"
            p_match = re.search(r'(.*?)\s+(\d+)\s*[xX]\s*(\d+)\s+(.*)', placar_raw)
            if not p_match:
                continue
            t1, g1_str, g2_str, t2 = p_match.groups()
            g1, g2 = int(g1_str), int(g2_str)

            mandante = "Grêmio" if "grêmio" in t1.lower() or "gremio" in t1.lower() else "Internacional"
            visitante = "Internacional" if mandante == "Grêmio" else "Grêmio"
            gm = g1
            gv = g2
            placar = f"{gm}x{gv}"
            vencedor = mandante if gm > gv else (visitante if gv > gm else "Empate")

            partes = local_raw.split('/')
            comp_raw = partes[0].strip() if len(partes) > 0 else "Campeonato Gaúcho"
            estadio = partes[1].strip() if len(partes) > 1 else "Porto Alegre"
            campeonato = normalizar_campeonato(comp_raw)

            novos.append((
                next_id, ano_int, None, dt_iso, None, estadio, "Porto Alegre", "RS",
                mandante, visitante, gm, gv, placar, vencedor, None, None, None, None, None,
                None, None, None, campeonato, f"Gre-Nal {num_grenal}", "Fase Regular"
            ))
            next_id += 1
            datas_existentes.add(dt_iso)

    print(f"Novos jogos de Gre-Nal a inserir: {len(novos)}")
    if novos:
        cursor.executemany("""
            INSERT INTO partidas (
                id_partida, ano, rodada, data, horario, estadio, cidade, estado,
                mandante, visitante, gols_mandante, gols_visitante, placar, vencedor,
                arbitro, assistente_1, assistente_2, quarto_arbitro, var,
                tecnico_mandante, tecnico_visitante, publico, campeonato, formato, fase
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
        """, novos)
    return next_id

def minerar_outros_classicos(cursor, next_id):
    # Clássicos adicionais disponíveis no acervo
    outros = [
        ('Botafogo x Corinthians', 'https://www.campeoesdofutebol.com.br/botafogorj_classico2.html', 'Botafogo', 'Corinthians', 'RJ'),
        ('Botafogo x Santos', 'https://www.campeoesdofutebol.com.br/botafogorj_classico3.html', 'Botafogo', 'Santos', 'RJ'),
        ('Botafogo x Atlético-MG', 'https://www.campeoesdofutebol.com.br/confrontos_botafogo_rjxatletico_mg.html', 'Botafogo', 'Atlético-MG', 'RJ'),
        ('Corinthians x Internacional', 'https://www.campeoesdofutebol.com.br/confrontos_clubes16.html', 'Corinthians', 'Internacional', 'SP'),
        ('Flamengo x Internacional', 'https://www.campeoesdofutebol.com.br/confrontos_clubes15.html', 'Flamengo', 'Internacional', 'RJ'),
        ('Grêmio x São Paulo', 'https://www.campeoesdofutebol.com.br/confrontos_gremio_sao_paulo.html', 'Grêmio', 'São Paulo', 'RS')
    ]

    for nome, url, time1, time2, uf_def in outros:
        print(f"\n--- INICIANDO: {nome} ---")
        try:
            cursor.execute("""
                SELECT data FROM partidas 
                WHERE (mandante LIKE ? AND visitante LIKE ?)
                   OR (mandante LIKE ? AND visitante LIKE ?);
            """, (f"%{time1}%", f"%{time2}%", f"%{time2}%", f"%{time1}%"))
            datas_existentes = set(r[0] for r in cursor.fetchall())
            print(f"Datas já existentes: {len(datas_existentes)}")

            req = urllib.request.Request(url, headers=HEADERS)
            with urllib.request.urlopen(req, timeout=15) as resp:
                html = resp.read().decode('utf-8', errors='ignore')

            # Procura padrões de placar com datas
            # Padrão 1: DD/MM/YYYY ... Gols1 x Gols2
            p1 = re.findall(r'(\d{2}/\d{2}/\d{4})\s*[-–]\s*(.*?)\s+(\d+)\s*x\s*(\d+)\s+(.*?)\s*[-–]\s*(.*?)(?:<br>|</p>|\r?\n)', html, re.IGNORECASE)
            
            novos = []
            if p1:
                for item in p1:
                    dt_raw, t1_raw, g1_str, g2_str, t2_raw, comp_raw = item[:6]
                    dia, mes, ano = dt_raw.split('/')
                    dt_iso = f"{ano}-{mes}-{dia}"
                    if dt_iso in datas_existentes: continue
                    g1, g2 = int(g1_str), int(g2_str)
                    ano_int = int(ano)
                    mandante = time1 if time1.lower() in t1_raw.lower() else time2
                    visitante = time2 if mandante == time1 else time1
                    gm, gv = g1, g2
                    placar = f"{gm}x{gv}"
                    vencedor = mandante if gm > gv else (visitante if gv > gm else "Empate")
                    campeonato = normalizar_campeonato(comp_raw)
                    novos.append((
                        next_id, ano_int, None, dt_iso, None, "Estádio Clássico", "Brasil", uf_def,
                        mandante, visitante, gm, gv, placar, vencedor, None, None, None, None, None,
                        None, None, None, campeonato, "Histórico Clássico", "Fase Regular"
                    ))
                    next_id += 1
                    datas_existentes.add(dt_iso)

            print(f"Novos jogos de {nome} a inserir: {len(novos)}")
            if novos:
                cursor.executemany("""
                    INSERT INTO partidas (
                        id_partida, ano, rodada, data, horario, estadio, cidade, estado,
                        mandante, visitante, gols_mandante, gols_visitante, placar, vencedor,
                        arbitro, assistente_1, assistente_2, quarto_arbitro, var,
                        tecnico_mandante, tecnico_visitante, publico, campeonato, formato, fase
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
                """, novos)
        except Exception as e:
            print(f"Erro em {nome}: {e}")

    return next_id

def executar():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    next_id = get_next_id(cursor)

    next_id = minerar_palmeiras_santos(cursor, next_id)
    next_id = minerar_grenal(cursor, next_id)
    next_id = minerar_outros_classicos(cursor, next_id)

    conn.commit()

    # Estatísticas Finais
    cursor.execute("SELECT COUNT(*), MIN(ano), MAX(ano) FROM partidas;")
    total_jogos, min_ano, max_ano = cursor.fetchone()
    print("\n" + "=" * 70)
    print("MINERAÇÃO DE CLÁSSICOS HISTÓRICOS CONCLUÍDA COM SUCESSO!")
    print(f"Novo total de partidas no futebol.db: {total_jogos} ({min_ano} a {max_ano})")
    print("=" * 70)

    conn.close()

if __name__ == '__main__':
    executar()
