"""
Repara e insere as fases finais do Brasileirão de 1986 (Quartas, Semis e a lendária Final São Paulo x Guarani)
"""

import os
import re
import sqlite3
import urllib.request

BASE_DIR = os.path.dirname(__file__)
DB_PATH = os.path.join(BASE_DIR, "data", "futebol.db")

MONTHS = {"feb": 2, "mar": 3, "jan": 1, "dec": 12}

def parse_knockout_1986():
    url = "https://www.rsssf.org/tablesb/braz86.html"
    c = urllib.request.urlopen(url).read().decode("latin1", errors="ignore")
    
    # Extrai o trecho do mata-mata (a partir de 'Third Phase' ou 'Quarterfinals')
    idx_start = c.find("Third Phase")
    if idx_start == -1:
        idx_start = c.find("Quarterfinals")
    idx_end = c.find("Final Table")
    
    trecho = c[idx_start:idx_end]
    lines = trecho.splitlines()
    
    cur_fase = "Mata-Mata 1986"
    cur_dates = ["1987-02-15", "1987-02-18"]
    
    partidas = []
    
    for l in lines:
        clean = l.strip()
        if not clean:
            continue
        if any(f in clean.lower() for f in ["quarterfinals", "semifinals", "final"]):
            cur_fase = clean
            continue
            
        m_dt = re.search(r"\[([A-Za-z]{3}\s+\d{1,2})\s+and\s+(\d{1,2})(?:/\d{2})?\]", clean)
        if m_dt:
            mon_str = m_dt.group(1).split()[0].lower()
            m = MONTHS.get(mon_str, 2)
            d1 = int(m_dt.group(1).split()[1])
            d2 = int(m_dt.group(2))
            cur_dates = [f"1987-{m:02d}-{d1:02d}", f"1987-{m:02d}-{d2:02d}"]
            continue
            
        # Match duplo: Team1 G1-G2 G3-G4 Team2
        m_double = re.match(r"^([A-Za-zÀ-ÿ\.\-\s]+?)\s{2,}(\d{1,2})\s*-\s*(\d{1,2})\s{2,}(\d{1,2})\s*-\s*(\d{1,2})\s{2,}([A-Za-zÀ-ÿ\.\-\s]+)", clean)
        if m_double:
            t1 = m_double.group(1).strip()
            g1_1 = int(m_double.group(2))
            g2_1 = int(m_double.group(3))
            g1_2 = int(m_double.group(4))
            g2_2 = int(m_double.group(5))
            t2 = m_double.group(6).strip()
            
            # Se tiver [aet 2-2, pen 3-4] ou placar agregado
            # No jogo 2 da final: São Paulo e Guarani empataram em 3x3 na prorrogação
            if "Guarani" in t2 and "S" in t1 and cur_fase.lower() == "final":
                # Jogo 2 terminou 3x3 (2x2 na prorrogação) e pênaltis 4x3 para o São Paulo
                g1_2 = 3
                g2_2 = 3
                
            t1_nome = "São Paulo" if "s" in t1.lower() and "paulo" in t1.lower() else t1
            t2_nome = "São Paulo" if "s" in t2.lower() and "paulo" in t2.lower() else t2
            
            partidas.append({
                "ano": 1986, "data": cur_dates[0], "fase": cur_fase,
                "mandante": t1_nome, "visitante": t2_nome,
                "gols_mandante": g1_1, "gols_visitante": g2_1,
                "placar": f"{g1_1}x{g2_1}",
                "vencedor": t1_nome if g1_1 > g2_1 else (t2_nome if g2_1 > g1_1 else "Empate")
            })
            partidas.append({
                "ano": 1986, "data": cur_dates[1], "fase": cur_fase,
                "mandante": t2_nome, "visitante": t1_nome,
                "gols_mandante": g2_2, "gols_visitante": g1_2,
                "placar": f"{g2_2}x{g1_2}",
                "vencedor": t2_nome if g2_2 > g1_2 else (t1_nome if g1_2 > g2_2 else "Empate")
            })
            
    print(f"Total de jogos de mata-mata de 1986 encontrados: {len(partidas)}")
    return partidas

def salvar():
    partidas = parse_knockout_1986()
    if not partidas:
        return
        
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()
    
    cur.execute("SELECT MAX(id_partida) FROM partidas WHERE ano = 1986;")
    max_id = cur.fetchone()[0] or 19860000
    
    for p in partidas:
        max_id += 1
        cur.execute("""
        INSERT INTO partidas (
            id_partida, ano, rodada, data, horario, estadio, cidade, estado,
            mandante, visitante, gols_mandante, gols_visitante, placar, vencedor,
            arbitro, assistente_1, assistente_2, quarto_arbitro, var,
            tecnico_mandante, tecnico_visitante, publico, campeonato, formato, fase
        ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?);
        """, (
            max_id, p["ano"], p["fase"], p["data"], "", "", "", "",
            p["mandante"], p["visitante"], p["gols_mandante"], p["gols_visitante"],
            p["placar"], p["vencedor"], None, None, None, None, None,
            "", "", None, "Campeonato Brasileiro", "Mata-Mata", p["fase"]
        ))
        print(f"  Inserido: [{p['data']}] {p['mandante']} {p['placar']} {p['visitante']} ({p['fase']})")
        
    conn.commit()
    conn.close()
    print("Mata-mata de 1986 inserido com sucesso!")

if __name__ == "__main__":
    salvar()
