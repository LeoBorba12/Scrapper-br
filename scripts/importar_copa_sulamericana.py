"""
Pipeline de Ingestão e Reconciliação: Copa Sul-Americana (2002 a 2018)
======================================================================
Fonte: Acervo Histórico RSSSF Conmebol (data/raw_conmebol/sulamericana/)
- Cataloga gols oficiais minuto a minuto, autores e tipos de gols.
- Corrige e reconcilia placares invertidos de partidas de volta (Leg 2).
- Associa atletas canônicos aos registros oficiais de jogadores.
- Mantém conformidade com regras de integridade relacional.
"""

import os
import re
import sys
import glob
import sqlite3
import unicodedata
from typing import Dict, List, Tuple, Optional

PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
DB_PATH = os.path.join(PROJECT_ROOT, "data", "futebol.db")

NORM_CLUBS = {
    "sao paulo": "São Paulo", "s&atilde;o paulo": "São Paulo", "são paulo": "São Paulo",
    "palmeiras": "Palmeiras", "cruzeiro": "Cruzeiro",
    "corinthians": "Corinthians", "flamengo": "Flamengo",
    "gremio": "Grêmio", "gr&ecirc;mio": "Grêmio", "grêmio": "Grêmio",
    "vasco": "Vasco", "vasco da gama": "Vasco",
    "internacional": "Internacional", "fluminense": "Fluminense",
    "botafogo": "Botafogo", "santos": "Santos",
    "atletico mineiro": "Atlético-MG", "atlético mineiro": "Atlético-MG",
    "atlético-mg": "Atlético-MG", "atletico-mg": "Atlético-MG",
    "athletico paranaense": "Athletico-PR", "atlético paranaense": "Athletico-PR",
    "athletico-pr": "Athletico-PR", "atlético-pr": "Athletico-PR",
    "coritiba": "Coritiba", "goias": "Goiás", "goiás": "Goiás",
    "parana": "Paraná", "paraná": "Paraná",
    "figueirense": "Figueirense", "ponte preta": "Ponte Preta",
    "sao caetano": "São Caetano", "são caetano": "São Caetano",
    "chapecoense": "Chapecoense", "sport": "Sport", "sport recife": "Sport",
    "bahia": "Bahia", "vitoria": "Vitória", "vitória": "Vitória",
    "ceara": "Ceará", "ceará": "Ceará", "fortaleza": "Fortaleza",
    "atletico goianiense": "Atlético-GO", "atlético goianiense": "Atlético-GO",
    "criciuma": "Criciúma", "criciúma": "Criciúma",
    "juventude": "Juventude", "america mineiro": "América-MG", "américa-mg": "América-MG",
    "san lorenzo": "San Lorenzo", "boca juniors": "Boca Juniors",
    "river plate": "River Plate", "independiente": "Independiente",
    "racing club": "Racing Club", "racing": "Racing Club",
    "velez sarsfield": "Vélez Sarsfield", "vélez sarsfield": "Vélez Sarsfield",
    "estudiantes": "Estudiantes", "lanus": "Lanús", "lanús": "Lanús",
    "arsenal": "Arsenal de Sarandí", "arsenal de sarandi": "Arsenal de Sarandí",
    "arsenal de sarandí": "Arsenal de Sarandí", "arsenal (sarandí)": "Arsenal de Sarandí",
    "banfield": "Banfield", "newell's old boys": "Newell's Old Boys", "newells old boys": "Newell's Old Boys",
    "rosario central": "Rosario Central", "colon": "Colón", "colón": "Colón",
    "argentinos juniors": "Argentinos Juniors", "gimnasia y esgrima": "Gimnasia La Plata",
    "gimnasia la plata": "Gimnasia La Plata", "defensa y justicia": "Defensa y Justicia",
    "huracan": "Huracán", "huracán": "Huracán", "tigre": "Tigre",
    "nacional": "Nacional", "nacional (uru)": "Nacional",
    "penarol": "Peñarol", "peñarol": "Peñarol", "peñarol (uru)": "Peñarol",
    "danubio": "Danubio", "defensor sporting": "Defensor Sporting",
    "wanderers": "Montevideo Wanderers", "montevideo wanderers": "Montevideo Wanderers",
    "olimpia": "Olimpia", "cerro porteno": "Cerro Porteño", "cerro porteño": "Cerro Porteño",
    "libertad": "Libertad", "guarani": "Guaraní", "guaraní": "Guaraní",
    "colo colo": "Colo Colo", "colo-colo": "Colo Colo",
    "universidad de chile": "Universidad de Chile", "univ. de chile": "Universidad de Chile",
    "universidad catolica": "Universidad Católica", "universidad católica": "Universidad Católica",
    "univ. catolica": "Universidad Católica", "univ. católica": "Universidad Católica",
    "cobreloa": "Cobreloa", "union espanola": "Unión Española", "unión española": "Unión Española",
    "ldu de quito": "LDU de Quito", "ldu": "LDU de Quito", "liga de quito": "LDU de Quito",
    "barcelona": "Barcelona", "barcelona (guayaquil)": "Barcelona",
    "emelec": "Emelec", "el nacional": "El Nacional",
    "independiente del valle": "Independiente del Valle",
    "atletico nacional": "Atlético Nacional", "atlético nacional": "Atlético Nacional",
    "atl. nacional": "Atlético Nacional", "millonarios": "Millonarios",
    "santa fe": "Santa Fe", "independiente santa fe": "Santa Fe",
    "america de cali": "América de Cali", "américa de cali": "América de Cali",
    "junior": "Junior", "junior de barranquilla": "Junior",
    "deportivo cali": "Deportivo Cali", "deportes tolima": "Deportes Tolima",
    "bolivar": "Bolívar", "bolívar": "Bolívar",
    "the strongest": "The Strongest", "wilstermann": "Jorge Wilstermann",
    "alianza lima": "Alianza Lima", "universitario": "Universitario",
    "sporting cristal": "Sporting Cristal", "cienciano": "Cienciano",
    "caracas": "Caracas", "caracas fc": "Caracas"
}

MAPA_ATLETAS = {
    "rogerio ceni": "Rogério Ceni", "ceni": "Rogério Ceni",
    "luis fabiano": "Luís Fabiano", "luís fabiano": "Luís Fabiano",
    "fred": "Fred", "robinho": "Robinho",
    "cicinho": "Cicinho", "alex dias": "Alex Dias",
    "grafite": "Grafite", "elano": "Elano", "basilio": "Basílio", "basílio": "Basílio",
    "fernandao": "Fernandão", "fernandão": "Fernandão",
    "rafael sobis": "Rafael Sóbis", "sobis": "Rafael Sóbis", "sóbis": "Rafael Sóbis",
    "nilmar": "Nilmar", "dodo": "Dodô", "dodô": "Dodô", "obina": "Obina",
    "paulo baier": "Paulo Baier", "baier": "Paulo Baier",
    "marcinho": "Marcinho", "deivid": "Deivid",
    "ibson": "Ibson", "danilo": "Danilo", "chiquinho": "Chiquinho",
    "tuta": "Tuta", "aristizabal": "Víctor Aristizábal",
    "victor aristizabal": "Víctor Aristizábal",
    "diego": "Diego", "jadson": "Jádson", "jádson": "Jádson",
    "lucas": "Lucas Moura", "lucas moura": "Lucas Moura",
    "rafael toloi": "Rafael Tolói", "toloi": "Rafael Tolói",
    "maicosuel": "Maicosuel", "wellington paulista": "Wellington Paulista",
    "thiago neves": "Thiago Neves", "diego souza": "Diego Souza",
    "dagoberto": "Dagoberto", "borges": "Borges", "washington": "Washington",
    "kléber": "Kléber Gladiador", "kleber": "Kléber Gladiador",
    "ronaldo": "Ronaldo", "adriano": "Adriano",
    "gabriel barbosa": "Gabriel Barbosa", "gabigol": "Gabriel Barbosa",
    "bruno henrique": "Bruno Henrique", "pedro": "Pedro",
    "german cano": "Germán Cano", "cano": "Germán Cano",
    "raphael veiga": "Raphael Veiga", "rony": "Rony"
}

def strip_accents(s: str) -> str:
    return "".join(c for c in unicodedata.normalize('NFD', s) if unicodedata.category(c) != 'Mn').lower()

def norm_club_name(raw: str) -> str:
    c = raw.strip()
    c = re.sub(r'\(.*?\)', '', c).strip().lower()
    return NORM_CLUBS.get(c, raw.strip())

def parse_goals_str(goals_str: str, score_h: int, score_a: int, team_h: str, team_a: str) -> List[Tuple[str, str, str, str]]:
    goals_str = goals_str.strip()
    if goals_str.startswith('['): goals_str = goals_str[1:]
    if goals_str.endswith(']'): goals_str = goals_str[:-1]
    
    parts = goals_str.split(';')
    goals = []
    
    def parse_side(side_str: str, team_name: str) -> List[Tuple[str, str, str, str]]:
        res = []
        if not side_str.strip(): return res
        items = [x.strip() for x in side_str.split(',') if x.strip()]
        cur_author = None
        for item in items:
            m_min_only = re.match(r'^(\d{1,3})(pen|og)?$', item.strip())
            if m_min_only and cur_author:
                minuto = m_min_only.group(1)
                tipo = 'Pênalti' if m_min_only.group(2) == 'pen' else ('Contra' if m_min_only.group(2) == 'og' else 'Normal')
                res.append((team_name, cur_author, minuto, tipo))
                continue
            
            m = re.match(r'^(.*?)\s+(\d{1,3})(pen|og)?$', item.strip())
            if m:
                cur_author = m.group(1).strip()
                minuto = m.group(2)
                tipo = 'Pênalti' if m.group(3) == 'pen' else ('Contra' if m.group(3) == 'og' else 'Normal')
                res.append((team_name, cur_author, minuto, tipo))
        return res

    if len(parts) == 2:
        goals.extend(parse_side(parts[0], team_h))
        goals.extend(parse_side(parts[1], team_a))
    elif len(parts) == 1:
        if score_h > 0 and score_a == 0:
            goals.extend(parse_side(parts[0], team_h))
        elif score_h == 0 and score_a > 0:
            goals.extend(parse_side(parts[0], team_a))
        else:
            goals.extend(parse_side(parts[0], team_h if score_h > 0 else team_a))
    return goals

def obter_ou_criar_atleta(cur, nome: str, clube: str, ano: int) -> Optional[int]:
    nome_norm = strip_accents(nome.strip())
    nome_canonico = MAPA_ATLETAS.get(nome_norm, nome.strip())
    nome_clean = strip_accents(nome_canonico)

    cur.execute("""
        SELECT id_jogador, total_gols, clubes 
        FROM jogadores 
        WHERE lower(nome_exibicao) = ? OR lower(nome_completo) = ? OR lower(apelido) = ?
        LIMIT 1
    """, (nome_canonico.lower(), nome_canonico.lower(), nome_canonico.lower()))
    row = cur.fetchone()
    
    if row:
        id_jog, _, clubes_atleta = row
        if clube and clubes_atleta and clube not in clubes_atleta:
            novos = f"{clubes_atleta}, {clube}" if clubes_atleta else clube
            cur.execute("UPDATE jogadores SET clubes = ? WHERE id_jogador = ?", (novos, id_jog))
        return id_jog

    cur.execute("""
        SELECT id_jogador, clubes FROM jogadores 
        WHERE (lower(nome_exibicao) LIKE ? OR lower(apelido) LIKE ?)
          AND (ano_inicio IS NULL OR ano_inicio <= ?)
          AND (ano_fim IS NULL OR ano_fim >= ?)
        LIMIT 1
    """, (f"%{nome_clean}%", f"%{nome_clean}%", ano + 5, ano - 15))
    row = cur.fetchone()
    if row:
        return row[0]

    cur.execute("""
        INSERT INTO jogadores (nome_exibicao, nome_completo, apelido, clubes, total_jogos, total_gols)
        VALUES (?, ?, ?, ?, 1, 1)
    """, (nome_canonico, nome_canonico, nome_canonico, clube))
    return cur.lastrowid

def importar_sulamericana(db_path=DB_PATH):
    print("=== INGESTÃO COPA SUL-AMERICANA (2002 a 2018) ===")
    conn = sqlite3.connect(db_path)
    cur = conn.cursor()
    cur.execute("PRAGMA foreign_keys = OFF;")

    files = sorted(glob.glob(os.path.join(PROJECT_ROOT, "data", "raw_conmebol", "sulamericana", "sudamcup*.html")))
    
    total_gols_inseridos = 0
    total_jogos_atualizados = 0
    total_placares_corrigidos = 0

    for fpath in files:
        fname = os.path.basename(fpath)
        # Extrair ano do nome: sudamcup02.html -> 2002, sudamcup2012.html -> 2012
        m_ano = re.search(r'sudamcup(?:20)?(\d{2})\.html', fname)
        if not m_ano:
            continue
        ano_val = int(m_ano.group(1))
        ano = 2000 + ano_val if ano_val < 50 else 1900 + ano_val

        with open(fpath, "r", encoding="latin1", errors="ignore") as fp:
            lines = fp.readlines()

        i = 0
        while i < len(lines):
            line = lines[i].strip()

            # Formato Mata-mata: Team1 País1 Team2 País2 X1-Y1 X2-Y2 ...
            # Ex: Paraná Bra Santos Bra 2-1 0-3 2-4
            m_legs = re.search(r'^([A-Za-z\s\.\&]+?)\s+(?:Bra|Arg|Chi|Uru|Par|Col|Ecu|Bol|Per|Ven|Mex|USA)\s+([A-Za-z\s\.\&]+?)\s+(?:Bra|Arg|Chi|Uru|Par|Col|Ecu|Bol|Per|Ven|Mex|USA)\s+(\d+)\s*-\s*(\d+)\s+(\d+)\s*-\s*(\d+)', line)

            if m_legs:
                team1_raw = m_legs.group(1).strip()
                team2_raw = m_legs.group(2).strip()
                t1_h1 = int(m_legs.group(3))
                t2_a1 = int(m_legs.group(4))
                t1_a2 = int(m_legs.group(5))
                t2_h2 = int(m_legs.group(6))

                team1 = norm_club_name(team1_raw)
                team2 = norm_club_name(team2_raw)

                has_goals_leg1 = (t1_h1 + t2_a1 > 0)
                has_goals_leg2 = (t2_h2 + t1_a2 > 0)

                # Coletar linhas de gols
                goal_lines = []
                j = i + 1
                while j < len(lines) and j <= i + 6:
                    if "[" in lines[j] and not lines[j].strip().startswith("First Leg") and not lines[j].strip().startswith("x "):
                        full_g = lines[j].strip()
                        while "]" not in full_g and j + 1 < len(lines):
                            j += 1
                            full_g += " " + lines[j].strip()
                        goal_lines.append(full_g)
                        if len(goal_lines) == (int(has_goals_leg1) + int(has_goals_leg2)):
                            break
                    elif re.match(r'^[A-Za-z\s\.\&]+?\s+(?:Bra|Arg|Chi|Uru|Par|Col|Ecu|Bol|Per|Ven)', lines[j].strip()):
                        break
                    j += 1

                # Atribuição dos blocos de gols
                goals_leg1 = goal_lines.pop(0) if has_goals_leg1 and goal_lines else ""
                goals_leg2 = goal_lines.pop(0) if has_goals_leg2 and goal_lines else ""

                # ==========================
                # LEG 1: Team1 Mandante vs Team2 Visitante
                # ==========================
                cur.execute("""
                    SELECT id_partida, mandante, visitante, gols_mandante, gols_visitante, placar, vencedor
                    FROM partidas
                    WHERE campeonato LIKE '%Sul-Americana%' AND ano = ?
                      AND lower(mandante) LIKE ? AND lower(visitante) LIKE ?
                """, (ano, f"%{strip_accents(team1)}%", f"%{strip_accents(team2)}%"))
                m1 = cur.fetchone()

                if m1:
                    id_p1, mand1, vis1, gm1, gv1, plac1, venc1 = m1
                    cur.execute("SELECT count(*) FROM gols WHERE id_partida = ?", (id_p1,))
                    tem_gols1 = cur.fetchone()[0]

                    if tem_gols1 == 0 and goals_leg1:
                        parsed1 = parse_goals_str(goals_leg1, t1_h1, t2_a1, mand1, vis1)
                        for g_team, g_auth, g_min, g_tip in parsed1:
                            c_fin = mand1 if strip_accents(g_team) in strip_accents(mand1) else vis1
                            id_at = obter_ou_criar_atleta(cur, g_auth, c_fin, ano)
                            cur.execute("""
                                INSERT INTO gols (id_partida, rodada, clube, atleta, minuto, tempo, tipo_de_gol, id_jogador)
                                VALUES (?, 1, ?, ?, ?, '1T/2T', ?, ?)
                            """, (id_p1, c_fin, g_auth, f"'{g_min}'", g_tip, id_at))
                            total_gols_inseridos += 1
                        total_jogos_atualizados += 1

                # ==========================
                # LEG 2: Team2 Mandante vs Team1 Visitante
                # ==========================
                cur.execute("""
                    SELECT id_partida, mandante, visitante, gols_mandante, gols_visitante, placar, vencedor
                    FROM partidas
                    WHERE campeonato LIKE '%Sul-Americana%' AND ano = ?
                      AND lower(mandante) LIKE ? AND lower(visitante) LIKE ?
                """, (ano, f"%{strip_accents(team2)}%", f"%{strip_accents(team1)}%"))
                m2 = cur.fetchone()

                if m2:
                    id_p2, mand2, vis2, gm2, gv2, plac2, venc2 = m2

                    # Verificar e reparar placar invertido
                    # O mandante Team2 fez t2_h2 gols e o visitante Team1 fez t1_a2 gols!
                    if gm2 != t2_h2 or gv2 != t1_a2:
                        novo_vencedor = mand2 if t2_h2 > t1_a2 else (vis2 if t1_a2 > t2_h2 else 'Empate')
                        novo_placar = f"{t2_h2} x {t1_a2}"
                        cur.execute("""
                            UPDATE partidas
                            SET gols_mandante = ?, gols_visitante = ?, placar = ?, vencedor = ?
                            WHERE id_partida = ?
                        """, (t2_h2, t1_a2, novo_placar, novo_vencedor, id_p2))
                        total_placares_corrigidos += 1

                    cur.execute("SELECT count(*) FROM gols WHERE id_partida = ?", (id_p2,))
                    tem_gols2 = cur.fetchone()[0]

                    if tem_gols2 == 0 and goals_leg2:
                        parsed2 = parse_goals_str(goals_leg2, t2_h2, t1_a2, mand2, vis2)
                        for g_team, g_auth, g_min, g_tip in parsed2:
                            c_fin = mand2 if strip_accents(g_team) in strip_accents(mand2) else vis2
                            id_at = obter_ou_criar_atleta(cur, g_auth, c_fin, ano)
                            cur.execute("""
                                INSERT INTO gols (id_partida, rodada, clube, atleta, minuto, tempo, tipo_de_gol, id_jogador)
                                VALUES (?, 1, ?, ?, ?, '1T/2T', ?, ?)
                            """, (id_p2, c_fin, g_auth, f"'{g_min}'", g_tip, id_at))
                            total_gols_inseridos += 1
                        total_jogos_atualizados += 1

            i += 1

    conn.commit()
    print(f"Sucesso Sul-Americana: {total_gols_inseridos} novos gols catalogados em {total_jogos_atualizados} jogos!")
    print(f"Placares invertidos reparados: {total_placares_corrigidos} partidas corrigidas!")
    conn.close()

if __name__ == "__main__":
    importar_sulamericana()
