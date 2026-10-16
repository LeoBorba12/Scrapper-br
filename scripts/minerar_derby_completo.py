import urllib.request
import re
import sqlite3
import datetime
import os
import sys

sys.stdout.reconfigure(encoding='utf-8')

DB_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'data', 'futebol.db')

URLS = [
    'https://www.campeoesdofutebol.com.br/confrontos_clubes17.html',
    'https://www.campeoesdofutebol.com.br/confrontos_clubes17a.html',
    'https://www.campeoesdofutebol.com.br/confrontos_clubes17b.html'
]

def normalizar_competicao(comp_raw):
    comp = comp_raw.strip()
    if 'Paulistão' in comp or 'Paulista' in comp:
        return 'Campeonato Paulista'
    if 'Serie A' in comp or 'Brasileiro' in comp or 'Brasileirão' in comp or 'Robertão' in comp:
        return 'Campeonato Brasileiro'
    if 'Rio-SP' in comp:
        return 'Torneio Rio-São Paulo'
    if 'Libertadores' in comp:
        return 'Copa Libertadores'
    if 'Copa do Brasil' in comp:
        return 'Copa do Brasil'
    if 'Amistoso' in comp:
        return 'Amistoso / Torneio Extra'
    return comp or 'Amistoso / Torneio Clássico'

def minerar_derby():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    # Pega maior ID atual
    cursor.execute("SELECT MAX(id_partida) FROM partidas;")
    max_id = cursor.fetchone()[0] or 10000000
    next_id = max_id + 1

    # Busca todas as datas de confrontos existentes entre Palmeiras e Corinthians no banco
    cursor.execute("""
        SELECT data FROM partidas 
        WHERE (mandante LIKE '%Palmeiras%' AND visitante LIKE '%Corinthians%')
           OR (mandante LIKE '%Corinthians%' AND visitante LIKE '%Palmeiras%');
    """)
    datas_existentes = set(r[0] for r in cursor.fetchall())
    print(f"Datas de Derbys já registradas no banco: {len(datas_existentes)}")

    novos_jogos = []
    
    for url in URLS:
        print(f"Baixando: {url}...")
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, timeout=15) as resp:
            html = resp.read().decode('utf-8', errors='ignore')
            matches = re.findall(
                r'(\d{2}/\d{2}/\d{4})\s*</td>\s*<td[^>]*>\s*(\d+)\s*</td>\s*<td[^>]*>\s*x\s*</td>\s*<td[^>]*>\s*(\d+)\s*</td>\s*<td[^>]*>(.*?)</td>', 
                html, re.DOTALL | re.IGNORECASE
            )
            print(f"  -> {len(matches)} confrontos encontrados na página")

            for m in matches:
                data_br, gols_pal_str, gols_cor_str, local_comp = m
                dia, mes, ano = data_br.split('/')
                data_iso = f"{ano}-{mes}-{dia}"
                ano_int = int(ano)
                gols_pal = int(gols_pal_str)
                gols_cor = int(gols_cor_str)

                # Se já existe essa data no banco, não duplica
                if data_iso in datas_existentes:
                    continue

                # Parse de local e competição
                partes = local_comp.split('/')
                estadio = partes[0].strip() if len(partes) > 0 else "São Paulo"
                comp_raw = partes[1].strip() if len(partes) > 1 else "Campeonato Paulista"
                campeonato = normalizar_competicao(comp_raw)

                # Definir mandante pelo estádio
                is_cor_mandante = any(k in estadio.lower() for k in ['neo quimica', 'são jorge', 'sao jorge', 'itaquera'])
                
                if is_cor_mandante:
                    mandante = "Corinthians"
                    visitante = "Palmeiras"
                    gm = gols_cor
                    gv = gols_pal
                else:
                    mandante = "Palmeiras"
                    visitante = "Corinthians"
                    gm = gols_pal
                    gv = gols_cor

                placar = f"{gm}x{gv}"
                if gm > gv:
                    vencedor = mandante
                elif gv > gm:
                    vencedor = visitante
                else:
                    vencedor = "Empate"

                novos_jogos.append((
                    next_id, ano_int, None, data_iso, None, estadio, "São Paulo", "SP",
                    mandante, visitante, gm, gv, placar, vencedor, None, None, None, None, None,
                    None, None, None, campeonato, "Histórico Clássico", "Fase Regular"
                ))
                next_id += 1
                datas_existentes.add(data_iso)

    print(f"\nTotal de novos Derbys históricos para inserir: {len(novos_jogos)}")

    if novos_jogos:
        cursor.executemany("""
            INSERT INTO partidas (
                id_partida, ano, rodada, data, horario, estadio, cidade, estado,
                mandante, visitante, gols_mandante, gols_visitante, placar, vencedor,
                arbitro, assistente_1, assistente_2, quarto_arbitro, var,
                tecnico_mandante, tecnico_visitante, publico, campeonato, formato, fase
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
        """, novos_jogos)
        conn.commit()
        print("✓ Novos jogos inseridos com sucesso!")

    # Contagem final no banco
    cursor.execute("""
        SELECT COUNT(*), MIN(ano), MAX(ano) FROM partidas 
        WHERE (mandante LIKE '%Palmeiras%' AND visitante LIKE '%Corinthians%')
           OR (mandante LIKE '%Corinthians%' AND visitante LIKE '%Palmeiras%');
    """)
    total_final, min_ano, max_ano = cursor.fetchone()
    print("=" * 70)
    print(f"TOTAL FINAL DE JOGOS PALMEIRAS x CORINTHIANS NO BANCO: {total_final} confrontos ({min_ano} a {max_ano})")
    print("=" * 70)

    conn.close()

if __name__ == '__main__':
    minerar_derby()
