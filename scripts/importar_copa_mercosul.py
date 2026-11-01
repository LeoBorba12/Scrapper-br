"""
Pipeline de Ingestão e Reconciliação: Copa Mercosul (1998 a 2001)
=================================================================
Fonte: Acervo Histórico RSSSF Conmebol (data/raw_conmebol/mercosur/)
- Cataloga gols oficiais minuto a minuto, pênaltis e autores canônicos.
- Reconcilia confrontos e placares invertidos.
- Associa atletas canônicos (Romário, Alex, Fabio Junior, Paulo Nunes, Oséas, Euller, etc.).
- Preserva regras de integridade relacional e teto de armazenamento.
"""

import os
import re
import sys
import sqlite3
import unicodedata
from typing import Dict, List, Tuple, Optional

PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
DB_PATH = os.path.join(PROJECT_ROOT, "data", "futebol.db")

MESES = {
    "Jan": "01", "Feb": "02", "Mar": "03", "Apr": "04", "May": "05", "Jun": "06",
    "Jul": "07", "Aug": "08", "Sep": "09", "Oct": "10", "Nov": "11", "Dec": "12"
}

NORM_CLUBS = {
    "sao paulo": "São Paulo", "s&atilde;o paulo": "São Paulo", "são paulo": "São Paulo",
    "palmeiras": "Palmeiras", "cruzeiro": "Cruzeiro",
    "corinthians": "Corinthians", "flamengo": "Flamengo",
    "gremio": "Grêmio", "gr&ecirc;mio": "Grêmio", "grêmio": "Grêmio",
    "vasco": "Vasco", "vasco da gama": "Vasco",
    "san lorenzo": "San Lorenzo", "colo colo": "Colo Colo", "colo-colo": "Colo Colo",
    "independiente": "Independiente", "nacional": "Nacional", "nacional (uru)": "Nacional",
    "univ. de chile": "Universidad de Chile", "universidad de chile": "Universidad de Chile",
    "olimpia": "Olimpia", "river plate": "River Plate", "racing club": "Racing Club",
    "racing": "Racing Club", "boca juniors": "Boca Juniors", "vélez sarsfield": "Vélez Sarsfield",
    "velez sarsfield": "Vélez Sarsfield", "vlez sarsfield": "Vélez Sarsfield",
    "cerro porteño": "Cerro Porteño", "cerro porteno": "Cerro Porteño", "cerro porteo": "Cerro Porteño",
    "peñarol": "Peñarol", "penarol": "Peñarol", "pearol": "Peñarol", "peñarol (uru)": "Peñarol",
    "universidad católica": "Universidad Católica", "univ. católica": "Universidad Católica",
    "univ. catolica": "Universidad Católica", "universidad catlica": "Universidad Católica",
    "atlético mineiro": "Atlético-MG", "atlético": "Atlético-MG", "atletico mineiro": "Atlético-MG",
    "rosario central": "Rosario Central", "talleres": "Talleres"
}

MAPA_ATLETAS = {
    "romario": "Romário",
    "romário": "Romário",
    "dejan petkovic": "Dejan Petkovic",
    "petkovic": "Dejan Petkovic",
    "fabio junior": "Fábio Júnior",
    "fábio júnior": "Fábio Júnior",
    "paulo nunes": "Paulo Nunes",
    "oseas": "Oséas",
    "oséas": "Oséas",
    "euller": "Euller",
    "ednilson": "Edmílson",
    "edmilson": "Edmílson",
    "edmílson": "Edmílson",
    "edilson": "Edílson",
    "edílson": "Edílson",
    "dodo": "Dodô",
    "dodô": "Dodô",
    "francisco arce": "Francisco Arce",
    "arce": "Francisco Arce",
    "junior baiano": "Júnior Baiano",
    "júnior baiano": "Júnior Baiano",
    "juninho paulista": "Juninho Paulista",
    "juninho pernambucano": "Juninho Pernambucano",
    "marcelo ramos": "Marcelo Ramos",
    "marcos assuncao": "Marcos Assunção",
    "marcos assunção": "Marcos Assunção",
    "paulo isidoro": "Paulo Isidoro",
    "geovanni": "Geovanni",
    "rogerio": "Rogério",
    "rogério": "Rogério",
    "alex": "Alex",
    "zinho": "Zinho",
    "muller": "Müller",
    "müller": "Müller",
    "valdo": "Valdo",
    "pedrinho": "Pedrinho",
    "luizao": "Luizão",
    "luizão": "Luizão",
    "cleber": "Cléber",
    "cléber": "Cléber",
    "magrao": "Magrão",
    "magrão": "Magrão"
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

    # Busca aproximada por LIKE
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

    # Cria novo registro
    cur.execute("""
        INSERT INTO jogadores (nome_exibicao, nome_completo, apelido, clubes, total_jogos, total_gols)
        VALUES (?, ?, ?, ?, 1, 1)
    """, (nome_canonico, nome_canonico, nome_canonico, clube))
    return cur.lastrowid

def importar_mercosul(db_path=DB_PATH):
    print(f"=== INGESTÃO COPA MERCOSUL (1998 - 2001) ===")
    conn = sqlite3.connect(db_path)
    cur = conn.cursor()
    cur.execute("PRAGMA foreign_keys = OFF;")

    arquivos = [
        ("mercosur98.html", 1998),
        ("mercosur99.html", 1999),
        ("mercosur00.html", 2000),
        ("mercosur01.html", 2001)
    ]

    total_gols_inseridos = 0
    total_jogos_atualizados = 0

    for fname, ano in arquivos:
        fpath = os.path.join(PROJECT_ROOT, "data", "raw_conmebol", "mercosur", fname)
        if not os.path.exists(fpath):
            print(f"Arquivo não encontrado: {fpath}")
            continue

        with open(fpath, "r", encoding="latin1", errors="ignore") as fp:
            lines = fp.readlines()

        i = 0
        while i < len(lines):
            line = lines[i].strip()
            
            # Formato 1: [Data]: Mandante - Visitante X-Y
            # Ex: 29 Jul: San Lorenzo - Cruzeiro 2-1
            m_single = re.search(r'(?:(\d{1,2})\s+([A-Za-z]{3}):\s*)?([A-Za-z\s\.\&]+?)\s*-\s*([A-Za-z\s\.\&]+?)\s+(\d+)\s*-\s*(\d+)', line)
            
            # Formato 2: Mata-mata ida e volta
            # Ex: Palmeiras Bra Boca Juniors Arg 3-1 1-1 4-2
            m_legs = re.search(r'^([A-Za-z\s\.\&]+?)\s+(?:Bra|Arg|Chi|Uru|Par)\s+([A-Za-z\s\.\&]+?)\s+(?:Bra|Arg|Chi|Uru|Par)\s+(\d+)\s*-\s*(\d+)\s+(\d+)\s*-\s*(\d+)', line)

            if m_legs:
                team1_raw = m_legs.group(1).strip()
                team2_raw = m_legs.group(2).strip()
                t1_h1 = int(m_legs.group(3))
                t2_a1 = int(m_legs.group(4))
                t1_a2 = int(m_legs.group(5))
                t2_h2 = int(m_legs.group(6))

                team1 = norm_club_name(team1_raw)
                team2 = norm_club_name(team2_raw)

                # Coletar linhas de gols
                goal_lines = []
                j = i + 1
                while j < len(lines) and len(goal_lines) < 2 and j <= i + 6:
                    if "[" in lines[j]:
                        full_g = lines[j].strip()
                        while "]" not in full_g and j + 1 < len(lines):
                            j += 1
                            full_g += " " + lines[j].strip()
                        goal_lines.append(full_g)
                    elif lines[j].strip().startswith("First Leg") or lines[j].strip().startswith("x "):
                        pass
                    j += 1

                # Jogo de Ida: Team1 mandante vs Team2 visitante
                if len(goal_lines) >= 1:
                    cur.execute("""
                        SELECT id_partida, mandante, visitante FROM partidas
                        WHERE campeonato LIKE '%Mercosul%' AND ano = ?
                          AND lower(mandante) LIKE ? AND lower(visitante) LIKE ?
                    """, (ano, f"%{strip_accents(team1)}%", f"%{strip_accents(team2)}%"))
                    m1 = cur.fetchone()
                    if m1:
                        cur.execute("SELECT count(*) FROM gols WHERE id_partida = ?", (m1[0],))
                        if cur.fetchone()[0] == 0:
                            parsed = parse_goals_str(goal_lines[0], t1_h1, t2_a1, m1[1], m1[2])
                            for g_team, g_auth, g_min, g_tip in parsed:
                                c_fin = m1[1] if strip_accents(g_team) in strip_accents(m1[1]) else m1[2]
                                id_at = obter_ou_criar_atleta(cur, g_auth, c_fin, ano)
                                cur.execute("""
                                    INSERT INTO gols (id_partida, rodada, clube, atleta, minuto, tempo, tipo_de_gol, id_jogador)
                                    VALUES (?, 1, ?, ?, ?, '1T/2T', ?, ?)
                                """, (m1[0], c_fin, g_auth, f"'{g_min}'", g_tip, id_at))
                                total_gols_inseridos += 1
                            total_jogos_atualizados += 1

                # Jogo de Volta: Team2 mandante vs Team1 visitante
                if len(goal_lines) >= 2:
                    cur.execute("""
                        SELECT id_partida, mandante, visitante FROM partidas
                        WHERE campeonato LIKE '%Mercosul%' AND ano = ?
                          AND lower(mandante) LIKE ? AND lower(visitante) LIKE ?
                    """, (ano, f"%{strip_accents(team2)}%", f"%{strip_accents(team1)}%"))
                    m2 = cur.fetchone()
                    if m2:
                        cur.execute("SELECT count(*) FROM gols WHERE id_partida = ?", (m2[0],))
                        if cur.fetchone()[0] == 0:
                            # Na volta, Team2 é mandante e fez t2_h2 gols, Team1 visitante e fez t1_a2 gols
                            parsed = parse_goals_str(goal_lines[1], t2_h2, t1_a2, m2[1], m2[2])
                            for g_team, g_auth, g_min, g_tip in parsed:
                                c_fin = m2[1] if strip_accents(g_team) in strip_accents(m2[1]) else m2[2]
                                id_at = obter_ou_criar_atleta(cur, g_auth, c_fin, ano)
                                cur.execute("""
                                    INSERT INTO gols (id_partida, rodada, clube, atleta, minuto, tempo, tipo_de_gol, id_jogador)
                                    VALUES (?, 1, ?, ?, ?, '1T/2T', ?, ?)
                                """, (m2[0], c_fin, g_auth, f"'{g_min}'", g_tip, id_at))
                                total_gols_inseridos += 1
                            total_jogos_atualizados += 1

            elif m_single and not m_legs:
                dia_str, mes_str = m_single.group(1), m_single.group(2)
                raw_mandante = m_single.group(3).strip()
                raw_visitante = m_single.group(4).strip()
                gh = int(m_single.group(5))
                ga = int(m_single.group(6))

                # Pular cabeçalhos ou linhas que não sejam jogos
                if gh + ga == 0 and not any(k in line for k in ["0-0"]):
                    i += 1
                    continue

                # Captura linha de gols se houver
                goals_block = ""
                j = i + 1
                while j < len(lines) and j <= i + 3:
                    if "[" in lines[j]:
                        while j < len(lines):
                            goals_block += " " + lines[j].strip()
                            if "]" in lines[j]:
                                break
                            j += 1
                        break
                    elif re.match(r'^\s*$', lines[j]) or lines[j].strip().startswith("Group"):
                        j += 1
                    else:
                        break

                team_h = norm_club_name(raw_mandante)
                team_a = norm_club_name(raw_visitante)

                # Busca partida no banco
                cur.execute("""
                    SELECT id_partida, gols_mandante, gols_visitante, mandante, visitante
                    FROM partidas
                    WHERE campeonato LIKE '%Mercosul%' AND ano = ?
                      AND ((lower(mandante) LIKE ? AND lower(visitante) LIKE ?)
                           OR (lower(mandante) LIKE ? AND lower(visitante) LIKE ?))
                """, (ano, f"%{strip_accents(team_h)}%", f"%{strip_accents(team_a)}%",
                           f"%{strip_accents(team_a)}%", f"%{strip_accents(team_h)}%"))
                candidates = cur.fetchall()

                target_match = None
                for c in candidates:
                    # Match score
                    if (c[1] == gh and c[2] == ga) or (c[1] == ga and c[2] == gh):
                        target_match = c
                        break
                if not target_match and candidates:
                    target_match = candidates[0]

                if target_match and goals_block and "[" in goals_block:
                    id_partida = target_match[0]
                    # Checa se já tem gols
                    cur.execute("SELECT count(*) FROM gols WHERE id_partida = ?", (id_partida,))
                    already_has = cur.fetchone()[0]
                    
                    if already_has == 0:
                        parsed_goals = parse_goals_str(goals_block, gh, ga, team_h, team_a)
                        
                        # Harmoniza clube do gol com o nome exato no banco
                        home_db = target_match[3]
                        away_db = target_match[4]

                        for g_team, g_author, g_min, g_tipo in parsed_goals:
                            # Decide se é mandante ou visitante
                            if strip_accents(g_team) in strip_accents(home_db) or strip_accents(home_db) in strip_accents(g_team):
                                clube_final = home_db
                            else:
                                clube_final = away_db

                            id_atleta = obter_ou_criar_atleta(cur, g_author, clube_final, ano)

                            cur.execute("""
                                INSERT INTO gols (id_partida, rodada, clube, atleta, minuto, tempo, tipo_de_gol, id_jogador)
                                VALUES (?, 1, ?, ?, ?, '1T/2T', ?, ?)
                            """, (id_partida, clube_final, g_author, f"'{g_min}'", g_tipo, id_atleta))
                            total_gols_inseridos += 1
                        
                        total_jogos_atualizados += 1

            i += 1

    conn.commit()
    print(f"Sucesso: {total_gols_inseridos} novos gols catalogados em {total_jogos_atualizados} partidas da Mercosul!")
    conn.close()

if __name__ == "__main__":
    importar_mercosul()
