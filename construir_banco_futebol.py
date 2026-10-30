"""
Script de Construção do Banco de Dados de Futebol Brasileiro (futebol.db)
Estrutura Relacional Normalizada e Isolada:
  - partidas: id_partida, ano, rodada, data, horario, estadio, cidade, estado,
              mandante, visitante, gols_mandante, gols_visitante, placar, vencedor,
              arbitro, assistente_1, assistente_2, quarto_arbitro, var,
              tecnico_mandante, tecnico_visitante, publico
  - gols: id_partida, rodada, clube, atleta, minuto, tempo, tipo_de_gol
  - cartoes: id_partida, rodada, clube, atleta, cartao, num_camisa, posicao, minuto, motivo
  - escalacoes: id_partida, clube, atleta, num_camisa, posicao, titular (1/0), is_goleiro (1/0), is_capitao (1/0), cbf_id
"""

import os
import re
import json
import sqlite3
import pandas as pd
import urllib.request
import concurrent.futures

DATA_DIR = os.path.join(os.path.dirname(__file__), "data")
os.makedirs(DATA_DIR, exist_ok=True)
DB_PATH = os.path.join(DATA_DIR, "futebol.db")

# Dicionário de cidades/estádios padrão do futebol brasileiro
ESTADIO_CIDADE_MAP = {
    "Arena Corinthians": ("São Paulo", "SP"),
    "Neo Química Arena": ("São Paulo", "SP"),
    "Allianz Parque": ("São Paulo", "SP"),
    "Morumbi": ("São Paulo", "SP"),
    "Cícero Pompeu de Toledo": ("São Paulo", "SP"),
    "Vila Belmiro": ("Santos", "SP"),
    "Urbano Caldeira": ("Santos", "SP"),
    "Maracanã": ("Rio de Janeiro", "RJ"),
    "Jornalista Mário Filho": ("Rio de Janeiro", "RJ"),
    "Nilton Santos": ("Rio de Janeiro", "RJ"),
    "Engenhão": ("Rio de Janeiro", "RJ"),
    "São Januário": ("Rio de Janeiro", "RJ"),
    "Mineirão": ("Belo Horizonte", "MG"),
    "Magalhães Pinto": ("Belo Horizonte", "MG"),
    "Independência": ("Belo Horizonte", "MG"),
    "Arena MRV": ("Belo Horizonte", "MG"),
    "Beira-Rio": ("Porto Alegre", "RS"),
    "Arena do Grêmio": ("Porto Alegre", "RS"),
    "Arena da Baixada": ("Curitiba", "PR"),
    "Ligga Arena": ("Curitiba", "PR"),
    "Couto Pereira": ("Curitiba", "PR"),
    "Arena Fonte Nova": ("Salvador", "BA"),
    "Barradão": ("Salvador", "BA"),
    "Castelão": ("Fortaleza", "CE"),
    "Serrinha": ("Goiânia", "GO"),
    "Hailé Pinheiro": ("Goiânia", "GO"),
    "Arena Pantanal": ("Cuiabá", "MT"),
    "Arena da Amazônia": ("Manaus", "AM"),
    "Mané Garrincha": ("Brasília", "DF"),
    "Ilha do Retiro": ("Recife", "PE"),
    "Arena de Pernambuco": ("Recife", "PE"),
    "Arruda": ("Recife", "PE"),
    "Ressacada": ("Florianópolis", "SC"),
    "Orlando Scarpelli": ("Florianópolis", "SC"),
    "Arena Condá": ("Chapecó", "SC"),
}

def normalizar_texto(txt):
    if not isinstance(txt, str) or pd.isna(txt):
        return ""
    # Remove caracteres nulos, símbolos de interrogação/substituição e normaliza espaços
    limpo = txt.replace("\ufffd", "").strip()
    return limpo

def criar_tabelas(conn):
    cursor = conn.cursor()
    
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS partidas (
        id_partida INTEGER PRIMARY KEY,
        ano INTEGER,
        rodada INTEGER,
        data TEXT,
        horario TEXT,
        estadio TEXT,
        cidade TEXT,
        estado TEXT,
        mandante TEXT,
        visitante TEXT,
        gols_mandante INTEGER,
        gols_visitante INTEGER,
        placar TEXT,
        vencedor TEXT,
        arbitro TEXT,
        assistente_1 TEXT,
        assistente_2 TEXT,
        quarto_arbitro TEXT,
        var TEXT,
        tecnico_mandante TEXT,
        tecnico_visitante TEXT,
        publico INTEGER
    );
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS gols (
        id_gol INTEGER PRIMARY KEY AUTOINCREMENT,
        id_partida INTEGER,
        rodada INTEGER,
        clube TEXT,
        atleta TEXT,
        minuto TEXT,
        tempo TEXT,
        tipo_de_gol TEXT,
        FOREIGN KEY (id_partida) REFERENCES partidas(id_partida)
    );
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS cartoes (
        id_cartao INTEGER PRIMARY KEY AUTOINCREMENT,
        id_partida INTEGER,
        rodada INTEGER,
        clube TEXT,
        atleta TEXT,
        cartao TEXT,
        num_camisa TEXT,
        posicao TEXT,
        minuto TEXT,
        motivo TEXT,
        FOREIGN KEY (id_partida) REFERENCES partidas(id_partida)
    );
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS escalacoes (
        id_escalacao INTEGER PRIMARY KEY AUTOINCREMENT,
        id_partida INTEGER,
        clube TEXT,
        atleta TEXT,
        num_camisa TEXT,
        posicao TEXT,
        titular INTEGER,     -- 1 para titular, 0 para reserva
        is_goleiro INTEGER,  -- 1 para goleiro, 0 para jogador de linha
        is_capitao INTEGER,  -- 1 para capitão, 0 caso contrário
        cbf_id TEXT,
        FOREIGN KEY (id_partida) REFERENCES partidas(id_partida)
    );
    """)

    # Índices para buscas em milissegundos
    # cursor.execute("CREATE INDEX IF NOT EXISTS idx_partidas_data ON partidas(data);")  # Redundante com idx_partidas_data_mandante/visitante
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_partidas_mandante ON partidas(mandante);")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_partidas_visitante ON partidas(visitante);")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_partidas_arbitro ON partidas(arbitro);")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_gols_partida ON gols(id_partida);")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_gols_atleta ON gols(atleta);")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_cartoes_partida ON cartoes(id_partida);")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_escalacoes_partida ON escalacoes(id_partida);")
    # cursor.execute("CREATE INDEX IF NOT EXISTS idx_escalacoes_atleta ON escalacoes(atleta);")  # Substituído por idx_escalacoes_id_jogador
    
    conn.commit()

def extrair_cidade_estado(arena, estado_mandante):
    arena_limpa = normalizar_texto(arena)
    for est, (cidade, uf) in ESTADIO_CIDADE_MAP.items():
        if est.lower() in arena_limpa.lower():
            return cidade, uf
    
    uf_default = normalizar_texto(estado_mandante).upper()
    cidade_default = "Capital" if uf_default else "Desconhecida"
    return cidade_default, uf_default

def extrair_arbitragem_sumula(texto_csv):
    """Extrai Árbitro, Assistentes (Bandeirinhas 1 e 2), 4º Árbitro e VAR"""
    arb = re.search(r"Arbitro:\s*(.+)", texto_csv)
    a1 = re.search(r"Arbitro Assistente 1:\s*(.+)", texto_csv)
    a2 = re.search(r"Arbitro Assistente 2:\s*(.+)", texto_csv)
    q4 = re.search(r"Quarto Arbitro:\s*(.+)", texto_csv)
    var = re.search(r"VAR:\s*(.+)", texto_csv)
    
    return {
        "arbitro": normalizar_texto(arb.group(1)) if arb else None,
        "assistente_1": normalizar_texto(a1.group(1)) if a1 else None,
        "assistente_2": normalizar_texto(a2.group(1)) if a2 else None,
        "quarto_arbitro": normalizar_texto(q4.group(1)) if q4 else None,
        "var": normalizar_texto(var.group(1)) if var else None,
    }

def construir_banco_futebol():
    print("Iniciando construção do banco de dados de futebol isolado (futebol.db)...")
    conn = sqlite3.connect(DB_PATH)
    criar_tabelas(conn)

    # 1. Carregar partidas históricas (2003-2024)
    print("Baixando histórico de jogos (2003-2024)...")
    url_jogos = "https://raw.githubusercontent.com/adaoduque/Brasileirao_Dataset/master/campeonato-brasileiro-full.csv"
    df_jogos = pd.read_csv(url_jogos, encoding="utf-8")
    
    # 2. Carregar base de estatísticas e árbitros
    print("Baixando base de árbitros e públicos históricos...")
    url_stats = "https://raw.githubusercontent.com/williamorim/brasileirao/master/data-raw/csv/stats.csv"
    df_stats = pd.read_csv(url_stats, encoding="utf-8", low_memory=False)

    df_jogos["data_formatada"] = pd.to_datetime(df_jogos["data"], format="%d/%m/%Y", errors="coerce").dt.strftime("%Y-%m-%d")
    df_jogos["ano"] = pd.to_datetime(df_jogos["data_formatada"]).dt.year
    df_stats["data_formatada"] = pd.to_datetime(df_stats["data"], errors="coerce").dt.strftime("%Y-%m-%d")

    # Mapeamento rápido de árbitro e público
    stats_dict = {}
    for _, row in df_stats.iterrows():
        dt = row.get("data_formatada")
        home = str(row.get("home", "")).strip().lower()
        if pd.notna(dt) and home:
            key = (dt, home[:4])
            stats_dict[key] = {
                "arbitro": normalizar_texto(str(row.get("arbitro"))),
                "publico": row.get("publico"),
                "horario": row.get("horario")
            }

    partidas_records = []
    for _, row in df_jogos.iterrows():
        id_partida = int(row["ID"])
        ano = int(row["ano"]) if pd.notna(row["ano"]) else None
        rodada = int(row["rodata"]) if pd.notna(row["rodata"]) else None
        data = row["data_formatada"]
        hora = str(row["hora"]).strip() if pd.notna(row["hora"]) else ""
        arena = normalizar_texto(row["arena"])
        mandante = normalizar_texto(row["mandante"])
        visitante = normalizar_texto(row["visitante"])
        gols_mandante = int(row["mandante_Placar"]) if pd.notna(row["mandante_Placar"]) else 0
        gols_visitante = int(row["visitante_Placar"]) if pd.notna(row["visitante_Placar"]) else 0
        placar = f"{gols_mandante}x{gols_visitante}"
        vencedor = normalizar_texto(row["vencedor"])
        tecnico_mandante = normalizar_texto(row.get("tecnico_mandante", ""))
        tecnico_visitante = normalizar_texto(row.get("tecnico_visitante", ""))
        
        cidade, estado = extrair_cidade_estado(arena, row.get("mandante_Estado", ""))

        stat_key = (data, mandante.lower()[:4])
        stat_info = stats_dict.get(stat_key, {})
        arbitro = stat_info.get("arbitro")
        arbitro = arbitro if arbitro and arbitro != "nan" and arbitro != "NA" else "Não informado"
        publico = stat_info.get("publico")
        publico = int(publico) if pd.notna(publico) and str(publico).replace(".0","").isdigit() else None
        if not hora and stat_info.get("horario"):
            hora = str(stat_info.get("horario"))

        partidas_records.append((
            id_partida, ano, rodada, data, hora, arena, cidade, estado,
            mandante, visitante, gols_mandante, gols_visitante, placar, vencedor,
            arbitro, None, None, None, None, tecnico_mandante, tecnico_visitante, publico
        ))

    cursor = conn.cursor()
    cursor.execute("DELETE FROM partidas;")
    cursor.executemany("""
    INSERT INTO partidas (
        id_partida, ano, rodada, data, horario, estadio, cidade, estado,
        mandante, visitante, gols_mandante, gols_visitante, placar, vencedor,
        arbitro, assistente_1, assistente_2, quarto_arbitro, var,
        tecnico_mandante, tecnico_visitante, publico
    ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?);
    """, partidas_records)
    conn.commit()
    print(f"Salvas {len(partidas_records)} partidas na tabela 'partidas'.")

    # 3. Carregar e salvar Gols
    print("Baixando e processando tabela de gols detalhados...")
    url_gols = "https://raw.githubusercontent.com/adaoduque/Brasileirao_Dataset/master/campeonato-brasileiro-gols.csv"
    df_gols = pd.read_csv(url_gols, encoding="utf-8")
    
    gols_records = []
    for _, row in df_gols.iterrows():
        partida_id = int(row["partida_id"])
        rodada = int(row["rodata"]) if pd.notna(row["rodata"]) else None
        clube = normalizar_texto(row["clube"])
        atleta = normalizar_texto(row["atleta"])
        minuto = str(row["minuto"]).strip() if pd.notna(row["minuto"]) else ""
        tipo_gol = normalizar_texto(row["tipo_de_gol"]) if pd.notna(row["tipo_de_gol"]) else "Normal"
        tempo = "1T" if minuto.isdigit() and int(minuto) <= 45 else "2T"

        gols_records.append((partida_id, rodada, clube, atleta, minuto, tempo, tipo_gol))

    cursor.execute("DELETE FROM gols;")
    cursor.executemany("""
    INSERT INTO gols (id_partida, rodada, clube, atleta, minuto, tempo, tipo_de_gol)
    VALUES (?,?,?,?,?,?,?);
    """, gols_records)
    conn.commit()
    print(f"Salvos {len(gols_records)} gols na tabela 'gols'.")

    # 4. Carregar e salvar Cartões
    print("Baixando e processando tabela de cartões...")
    url_cartoes = "https://raw.githubusercontent.com/adaoduque/Brasileirao_Dataset/master/campeonato-brasileiro-cartoes.csv"
    df_cartoes = pd.read_csv(url_cartoes, encoding="utf-8")
    
    cartoes_records = []
    for _, row in df_cartoes.iterrows():
        partida_id = int(row["partida_id"])
        rodada = int(row["rodata"]) if pd.notna(row["rodata"]) else None
        clube = normalizar_texto(row["clube"])
        cartao = normalizar_texto(row["cartao"])
        atleta = normalizar_texto(row["atleta"])
        num_camisa = str(int(row["num_camisa"])) if pd.notna(row["num_camisa"]) else ""
        posicao = normalizar_texto(row["posicao"]) if pd.notna(row["posicao"]) else ""
        minuto = str(row["minuto"]).strip() if pd.notna(row["minuto"]) else ""

        cartoes_records.append((partida_id, rodada, clube, atleta, cartao, num_camisa, posicao, minuto, ""))

    cursor.execute("DELETE FROM cartoes;")
    cursor.executemany("""
    INSERT INTO cartoes (id_partida, rodada, clube, atleta, cartao, num_camisa, posicao, minuto, motivo)
    VALUES (?,?,?,?,?,?,?,?,?);
    """, cartoes_records)
    conn.commit()
    print(f"Salvos {len(cartoes_records)} cartões na tabela 'cartoes'.")

    # 5. Escalações Completas + Arbitragem com Assistentes/VAR das Súmulas CBF (2020-2024)
    print("Enriquecendo com súmulas oficiais da CBF (escalações, assistentes, 4º árbitro e VAR)...")
    anos_sumulas = [2022, 2023, 2024]
    escalacoes_records = []
    arbitragem_updates = []

    for ano in anos_sumulas:
        url_ano = f"https://raw.githubusercontent.com/BrazilianFootball/Data/main/results/processed/Serie_A_{ano}_games.json"
        try:
            req = urllib.request.Request(url_ano, headers={"User-Agent": "Mozilla/5.0"})
            games_json = json.loads(urllib.request.urlopen(req).read().decode("utf-8"))
            print(f"Lendo súmulas do Brasileirão {ano} ({len(games_json)} partidas)...")
            
            for game_code, gdata in games_json.items():
                g_date = gdata.get("Date", "")
                g_home = gdata.get("Home", "").split("/")[0].strip()
                
                dt_iso = pd.to_datetime(g_date, format="%d/%m/%Y", errors="coerce").strftime("%Y-%m-%d") if g_date else None
                if not dt_iso:
                    continue
                
                cursor.execute("SELECT id_partida FROM partidas WHERE data = ? AND mandante LIKE ? LIMIT 1;", (dt_iso, f"%{g_home[:4]}%"))
                match_row = cursor.fetchone()
                if not match_row:
                    continue
                id_partida = match_row[0]

                # Processar jogadores
                players = gdata.get("Players", [])
                for p_entry in players:
                    p_str = p_entry[0] if isinstance(p_entry, list) and len(p_entry) > 0 else ""
                    clube_p = p_entry[1].split("/")[0].strip() if isinstance(p_entry, list) and len(p_entry) > 1 else ""
                    
                    m = re.search(r"^(\d+)(.*?)\s*([TR])(?:\((g)\))?([PA])(\d+)$", p_str.strip())
                    if m:
                        num = m.group(1)
                        nome = normalizar_texto(m.group(2))
                        tr = 1 if m.group(3) == "T" else 0
                        is_gol = 1 if m.group(4) == "g" else 0
                        cbf_id = m.group(6)
                        is_cap = 1 if "(c)" in p_str.lower() or "capit" in p_str.lower() else 0
                        pos = "Goleiro" if is_gol else ("Titular" if tr else "Reserva")
                        escalacoes_records.append((id_partida, clube_p, nome, num, pos, tr, is_gol, is_cap, cbf_id))
                    else:
                        escalacoes_records.append((id_partida, clube_p, normalizar_texto(p_str), "", "", 1, 0, 0, ""))

        except Exception as e:
            print(f"Aviso ao processar ano {ano}: {e}")

    if escalacoes_records:
        cursor.execute("DELETE FROM escalacoes;")
        cursor.executemany("""
        INSERT INTO escalacoes (id_partida, clube, atleta, num_camisa, posicao, titular, is_goleiro, is_capitao, cbf_id)
        VALUES (?,?,?,?,?,?,?,?,?);
        """, escalacoes_records)
        conn.commit()
        print(f"Salvas {len(escalacoes_records)} escalações de atletas na tabela 'escalacoes'.")

    # 6. Baixar amostra de arbitragem completa (árbitro, assistentes 1 e 2, 4º árbitro e VAR)
    print("Baixando equipes de arbitragem completas (bandeirinhas e VAR)...")
    def fetch_arbitragem(game_num):
        url = f"https://raw.githubusercontent.com/BrazilianFootball/Data/main/results/raw/Serie_A/2023/CSVs/{str(game_num).zfill(3)}.csv"
        try:
            req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
            txt = urllib.request.urlopen(req, timeout=5).read().decode("utf-8", errors="ignore")
            # Extrair data e mandante para casar com a partida
            m_dt = re.search(r"Data:\s*(\d{2}/\d{2}/\d{4})", txt)
            m_jogo = re.search(r"Jogo:\s*([^\n\r]+)X\s*([^\n\r]+)", txt)
            if m_dt and m_jogo:
                d_str = pd.to_datetime(m_dt.group(1), format="%d/%m/%Y").strftime("%Y-%m-%d")
                m_man = m_jogo.group(1).split("/")[0].strip()
                arb_info = extrair_arbitragem_sumula(txt)
                return (d_str, m_man[:4], arb_info)
        except:
            pass
        return None

    # Baixar em paralelo para rodadas recentes
    with concurrent.futures.ThreadPoolExecutor(max_workers=15) as executor:
        results = list(executor.map(fetch_arbitragem, range(1, 101)))
        
    for res in results:
        if res:
            d_str, man_prefix, a_info = res
            cursor.execute("""
            UPDATE partidas 
            SET arbitro = COALESCE(?, arbitro),
                assistente_1 = ?,
                assistente_2 = ?,
                quarto_arbitro = ?,
                var = ?
            WHERE data = ? AND mandante LIKE ?;
            """, (
                a_info["arbitro"], a_info["assistente_1"], a_info["assistente_2"],
                a_info["quarto_arbitro"], a_info["var"], d_str, f"%{man_prefix}%"
            ))
    conn.commit()
    print("Arbitragem detalhada atualizada.")

    conn.close()
    print("Banco de dados de futebol finalizado com sucesso em data/futebol.db!\n")

if __name__ == "__main__":
    construir_banco_futebol()
