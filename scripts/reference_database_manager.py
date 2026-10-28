# -*- coding: utf-8 -*-
"""
reference_database_manager.py
=============================
Gerenciador e Motor do Segundo Banco de Dados de Referência (Ground Truth).
- Banco: data/futebol_referencia.db (Isolado, ignorado no git/Vercel)
- Coleta: Wikidata API (SPARQL & REST)
- Comparador (Diff Engine): Cruza gols e escalações do futebol.db contra a carreira oficial
- Curador Cirúrgico (Healer): Corrige eventos alienígenas e sincroniza jogadores.clubes
"""

import os
import sys
import json
import time
import sqlite3
import unicodedata
import urllib.parse
import urllib.request
from typing import Dict, List, Optional, Tuple

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DB_MAIN = os.path.join(BASE_DIR, "data", "futebol.db")
DB_REF = os.path.join(BASE_DIR, "data", "futebol_referencia.db")

# Normalização Canônica de Clubes da Wikidata para o futebol.db
MAPA_WIKIDATA_CLUBES = {
    "santos futebol clube": "Santos",
    "santos fc": "Santos",
    "clube de regatas do flamengo": "Flamengo",
    "flamengo": "Flamengo",
    "club de regatas vasco da gama": "Vasco",
    "vasco da gama": "Vasco",
    "vasco": "Vasco",
    "sport club corinthians paulista": "Corinthians",
    "corinthians": "Corinthians",
    "sociedade esportiva palmeiras": "Palmeiras",
    "palmeiras": "Palmeiras",
    "são paulo futebol clube": "São Paulo",
    "sao paulo futebol clube": "São Paulo",
    "são paulo fc": "São Paulo",
    "são paulo": "São Paulo",
    "grêmio foot-ball porto alegrense": "Grêmio",
    "gremio": "Grêmio",
    "grêmio": "Grêmio",
    "sport club internacional": "Internacional",
    "internacional": "Internacional",
    "cruzeiro esporte clube": "Cruzeiro",
    "cruzeiro": "Cruzeiro",
    "clube atlético mineiro": "Atlético-MG",
    "atletico mineiro": "Atlético-MG",
    "atlético mineiro": "Atlético-MG",
    "atlético-mg": "Atlético-MG",
    "fluminense football club": "Fluminense",
    "fluminense": "Fluminense",
    "botafogo de futebol e regatas": "Botafogo",
    "botafogo": "Botafogo",
    "club athletico paranaense": "Athletico-PR",
    "athletico paranaense": "Athletico-PR",
    "athletico-pr": "Athletico-PR",
    "coritiba foot ball club": "Coritiba",
    "coritiba": "Coritiba",
    "esporte clube bahia": "Bahia",
    "bahia": "Bahia",
    "esporte clube vitória": "Vitória",
    "vitoria": "Vitória",
    "vitória": "Vitória",
    "goiás esporte clube": "Goiás",
    "goias": "Goiás",
    "goiás": "Goiás",
    "ceará sporting club": "Ceará",
    "ceará": "Ceará",
    "fortaleza esporte clube": "Fortaleza",
    "fortaleza": "Fortaleza",
    "américa futebol clube (belo horizonte)": "América-MG",
    "américa-mg": "América-MG",
    "america football club": "América-RJ",
    "américa-rj": "América-RJ",
    "sport club do recife": "Sport",
    "sport recife": "Sport",
    "sport": "Sport",
    "guarani futebol clube": "Guarani",
    "guarani": "Guarani",
    "associação atlética ponte preta": "Ponte Preta",
    "ponte preta": "Ponte Preta",
    "associação portuguesa de desportos": "Portuguesa",
    "portuguesa": "Portuguesa",
    "figueirense futebol clube": "Figueirense",
    "figueirense": "Figueirense",
    "esporte clube juventude": "Juventude",
    "juventude": "Juventude",
    "clube náutico capibaribe": "Náutico",
    "náutico": "Náutico",
    "nautico": "Náutico",
    "criciúma esporte clube": "Criciúma",
    "criciúma": "Criciúma",
    "criciuma": "Criciúma",
    "brasiliense futebol clube": "Brasiliense",
    "brasiliense": "Brasiliense",
    "esporte clube santo andré": "Santo André",
    "santo andré": "Santo André",
    "paran clube": "Paraná",
    "paraná clube": "Paraná",
    "paraná": "Paraná",
    "parana": "Paraná",
    "avaí futebol clube": "Avaí",
    "avaí": "Avaí",
    "avai": "Avaí",
    "associação chapecoense de futebol": "Chapecoense",
    "chapecoense": "Chapecoense",
    "santa cruz futebol clube": "Santa Cruz",
    "santa cruz": "Santa Cruz",
    "paysandu sport club": "Paysandu",
    "paysandu": "Paysandu",
    "clube do remo": "Remo",
    "remo": "Remo",
    "bangu atlético clube": "Bangu",
    "bangu": "Bangu",
    "red bull bragantino": "Red Bull Bragantino",
    "bragantino": "Red Bull Bragantino",
    "inter de limeira": "Inter de Limeira",
    "associação atlética internacional": "Inter de Limeira",
    "marília atlético clube": "Marília",
    "marília": "Marília",
    "marilia": "Marília",
    "mogi mirim esporte clube": "Mogi Mirim",
    "mogi mirim": "Mogi Mirim",
    "esporte clube são bento": "São Bento",
    "são bento": "São Bento",
    "sao bento": "São Bento",
    "associação atlética caldense": "Caldense",
    "caldense": "Caldense",
    "mirassol futebol clube": "Mirassol",
    "mirassol": "Mirassol",
    "são caetano": "São Caetano",
    "associacao desportiva sao caetano": "São Caetano",
    "uniao sao joao": "União São João",
    "união são joão": "União São João",
    "futbol club barcelona": "Barcelona",
    "fc barcelona": "Barcelona",
    "paris saint-germain football club": "Paris Saint-Germain",
    "paris saint-germain": "Paris Saint-Germain",
    "psg": "Paris Saint-Germain",
    "al-hilal saudi football club": "Al-Hilal",
    "al-hilal": "Al-Hilal",
    "psv eindhoven": "PSV",
    "valencia club de fútbol": "Valencia",
    "adelaide united football club": "Adelaide United",
    "fort lauderdale strikers": "Fort Lauderdale Strikers",
    "miami fc": "Miami FC",
    "al-sadd sports club": "Al-Sadd"
}

# Mapeamento inteligente de nomes populares para busca exata na Wikidata
MAPA_NOMES_WIKIDATA = {
    "fred": "Frederico Chaves Guedes",
    "marcelinho carioca": "Marcelinho Carioca",
    "edmundo": "Edmundo Alves de Souza Neto",
    "gabriel barbosa": "Gabriel Barbosa",
    "gabigol": "Gabriel Barbosa",
    "careca": "Antônio de Oliveira Filho",
    "roberto dinamite": "Roberto Dinamite",
    "alex": "Alexsandro de Souza",
    "luís fabiano": "Luís Fabiano",
    "luis fabiano": "Luís Fabiano",
    "dodô": "Ricardo Lucas",
    "dodo": "Ricardo Lucas",
    "serginho chulapa": "Sérgio Bernardino",
    "ricardinho": "Ricardo Luís Pozzi Rodrigues",
    "romário": "Romário",
    "luizão": "Luiz Carlos Bombonato Goulart",
    "luizao": "Luiz Carlos Bombonato Goulart",
    "mirandinha": "Sebastião Miranda da Silva Filho",
    "hulk": "Givanildo Vieira de Sousa",
    "germán cano": "Germán Cano",
    "german cano": "Germán Cano",
    "pedro": "Pedro Guilherme Abreu dos Santos",
    "dudu": "Eduardo Pereira Rodrigues",
    "arrascaeta": "Giorgian De Arrascaeta",
    "raphael veiga": "Raphael Veiga",
    "yuri alberto": "Yuri Alberto",
    "bruno henrique": "Bruno Henrique Pinto",
    "túlio maravilha": "Túlio Maravilha",
    "tulio maravilha": "Túlio Maravilha",
    "zico": "Zico",
    "pelé": "Pelé",
    "pele": "Pelé",
    "garrincha": "Garrincha",
    "tostão": "Tostão",
    "tostao": "Tostão",
    "rivelino": "Roberto Rivellino",
    "rivellino": "Roberto Rivellino",
    "paulo baier": "Paulo Baier",
    "magno alves": "Magno Alves",
    "marinho": "Mário Sérgio Santos Costa",
    "deivid": "Deivid de Souza",
    "washington": "Washington Stecanela Cerqueira",
    "kléber pereira": "Kléber Pereira",
    "kleber pereira": "Kléber Pereira",
    "kléber": "Kléber Giacomance de Souza Freitas",
    "kleber": "Kléber Giacomance de Souza Freitas",
    "borges": "Humberlito Borges",
    "dagoberto": "Dagoberto Pelentier",
    "diego souza": "Diego de Souza Andrade",
    "everton ribeiro": "Everton Ribeiro",
    "gustavo scarpa": "Gustavo Scarpa",
    "paulinho": "Paulo Henrique Sampaio Filho",
    "lucas moura": "Lucas Moura",
    "estêvão": "Estêvão Willian",
    "estevao": "Estêvão Willian",
    "paulinho mclaren": "Paulinho McLaren"
}

def normalizar_nome_clube(raw: str) -> str:
    if not raw:
        return ""
    clean = raw.lower().strip()
    return MAPA_WIKIDATA_CLUBES.get(clean, raw.strip())

def init_reference_db():
    """Cria tabelas no banco de referência isolado."""
    conn = sqlite3.connect(DB_REF)
    cursor = conn.cursor()
    cursor.execute("PRAGMA journal_mode = WAL")
    
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS ref_atletas (
            id_referencia INTEGER PRIMARY KEY AUTOINCREMENT,
            id_jogador_futebol_db INTEGER,
            nome_oficial TEXT NOT NULL,
            apelido TEXT,
            wikidata_id TEXT UNIQUE,
            data_nascimento TEXT,
            nacionalidade TEXT,
            criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS ref_carreira_clubes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            wikidata_id TEXT NOT NULL,
            clube_original TEXT NOT NULL,
            clube_canonico TEXT NOT NULL,
            ano_inicio INTEGER,
            ano_fim INTEGER,
            is_selecao INTEGER DEFAULT 0,
            criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (wikidata_id) REFERENCES ref_atletas(wikidata_id)
        )
    """)
    
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS ref_divergencias (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            id_jogador INTEGER,
            atleta_nome TEXT,
            tabela TEXT,
            id_registro INTEGER,
            id_partida INTEGER,
            clube_atual TEXT,
            clube_correto TEXT,
            motivo TEXT,
            resolvido INTEGER DEFAULT 0,
            detectado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    
    conn.commit()
    conn.close()

def buscar_wikidata_atleta(nome: str) -> Optional[Dict]:
    """Busca o QID de um atleta na Wikidata."""
    if not nome:
        return None
    nome = nome.strip('\"\'')
    url = f"https://www.wikidata.org/w/api.php?action=wbsearchentities&search={urllib.parse.quote(nome)}&language=pt&format=json&limit=5"
    req = urllib.request.Request(url, headers={"User-Agent": "FutStatsBot/1.0 (contact: admin@futstats.local)"})
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            data = json.loads(resp.read().decode("utf-8"))
            for item in data.get("search", []):
                desc = (item.get("description") or "").lower()
                # Verifica se a descrição remete a futebolista/futebol/jogador
                if any(w in desc for w in ["futebol", "football", "jogador", "soccer", "atacante", "meio-campista"]):
                    return item
            # Se não encontrou na descrição, retorna o primeiro se existir
            if data.get("search"):
                return data["search"][0]
    except Exception as e:
        print(f"[Erro Wikidata Search] {nome}: {e}")
    return None

def coletar_carreira_wikidata(wikidata_id: str) -> List[Dict]:
    """Obtém clubes e anos da carreira profissional via SPARQL."""
    sparql = f"""
    SELECT ?teamLabel ?startYear ?endYear WHERE {{
      wd:{wikidata_id} p:P54 ?statement .
      ?statement ps:P54 ?team .
      OPTIONAL {{ ?statement pq:P580 ?start . BIND(YEAR(?start) AS ?startYear) }}
      OPTIONAL {{ ?statement pq:P582 ?end . BIND(YEAR(?end) AS ?endYear) }}
      SERVICE wikibase:label {{ bd:serviceParam wikibase:language "pt,en". }}
    }} ORDER BY ?startYear
    """
    url = "https://query.wikidata.org/sparql?query=" + urllib.parse.quote(sparql) + "&format=json"
    req = urllib.request.Request(url, headers={"User-Agent": "FutStatsBot/1.0 (contact: admin@futstats.local)"})
    clubes = []
    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            data = json.loads(resp.read().decode("utf-8"))
            for b in data.get("results", {}).get("bindings", []):
                team = b.get("teamLabel", {}).get("value")
                sy = b.get("startYear", {}).get("value")
                ey = b.get("endYear", {}).get("value")
                is_sel = 1 if "seleção" in (team or "").lower() or "national team" in (team or "").lower() else 0
                clubes.append({
                    "clube_original": team,
                    "clube_canonico": normalizar_nome_clube(team),
                    "ano_inicio": int(sy) if sy and sy.isdigit() else None,
                    "ano_fim": int(ey) if ey and ey.isdigit() else None,
                    "is_selecao": is_sel
                })
    except Exception as e:
        print(f"[Erro SPARQL Wikidata] {wikidata_id}: {e}")
    return clubes

def cadastrar_atleta_referencia(id_jogador: int, nome_custom: str = None) -> Optional[str]:
    """Busca no Wikidata e cadastra o atleta e seus clubes no banco de referência."""
    init_reference_db()
    
    # 1. Pega nome do jogador no futebol.db se não passado
    nome = nome_custom
    if not nome:
        conn_main = sqlite3.connect(DB_MAIN)
        c_main = conn_main.cursor()
        c_main.execute("SELECT apelido, nome_exibicao, nome_completo FROM jogadores WHERE id_jogador = ?", (id_jogador,))
        row = c_main.fetchone()
        conn_main.close()
        if not row:
            print(f"[Aviso] Jogador ID {id_jogador} não encontrado no futebol.db")
            return None
        nome = row[0] or row[1] or row[2]

    # 2. Busca na Wikidata
    item = buscar_wikidata_atleta(nome)
    if not item:
        print(f"[Aviso] Nenhum QID encontrado para '{nome}'")
        return None
    
    qid = item["id"]
    rotulo = item.get("label", nome)
    print(f"\n[Wikidata Encontrado] {nome} -> {rotulo} ({qid})")
    
    # 3. Salva no futebol_referencia.db
    conn_ref = sqlite3.connect(DB_REF)
    c_ref = conn_ref.cursor()
    c_ref.execute("""
        INSERT INTO ref_atletas (id_jogador_futebol_db, nome_oficial, apelido, wikidata_id)
        VALUES (?, ?, ?, ?)
        ON CONFLICT(wikidata_id) DO UPDATE SET
            id_jogador_futebol_db = excluded.id_jogador_futebol_db,
            nome_oficial = excluded.nome_oficial,
            apelido = excluded.apelido
    """, (id_jogador, rotulo, nome, qid))
    
    # 4. Coleta clubes
    clubes = coletar_carreira_wikidata(qid)
    c_ref.execute("DELETE FROM ref_carreira_clubes WHERE wikidata_id = ?", (qid,))
    for c in clubes:
        c_ref.execute("""
            INSERT INTO ref_carreira_clubes (wikidata_id, clube_original, clube_canonico, ano_inicio, ano_fim, is_selecao)
            VALUES (?, ?, ?, ?, ?, ?)
        """, (qid, c["clube_original"], c["clube_canonico"], c["ano_inicio"], c["ano_fim"], c["is_selecao"]))
    
    conn_ref.commit()
    conn_ref.close()
    print(f" -> {len(clubes)} vínculos de carreira registrados para {nome} ({qid}).")
    return qid

def auditar_e_comparar_atleta(id_jogador: int) -> Dict:
    """Compara dados do atleta no futebol.db contra o futebol_referencia.db."""
    conn_ref = sqlite3.connect(DB_REF)
    c_ref = conn_ref.cursor()
    
    # Pega clubes oficiais
    c_ref.execute("""
        SELECT r.wikidata_id, r.nome_oficial, c.clube_canonico, c.ano_inicio, c.ano_fim, c.is_selecao
        FROM ref_atletas r
        JOIN ref_carreira_clubes c ON r.wikidata_id = c.wikidata_id
        WHERE r.id_jogador_futebol_db = ?
    """, (id_jogador,))
    rows = c_ref.fetchall()
    conn_ref.close()
    
    if not rows:
        return {"status": "sem_referencia", "mensagem": "Atleta ainda não cadastrado no banco de referência."}
    
    atleta_nome = rows[0][1]
    clubes_oficiais = {r[2] for r in rows if r[2] and not r[5]} # Não seleções
    
    conn_main = sqlite3.connect(DB_MAIN)
    c_main = conn_main.cursor()
    
    # 1. Gols do jogador no futebol.db
    c_main.execute("""
        SELECT g.id_gol, g.id_partida, g.clube, p.mandante, p.visitante, p.data, p.campeonato
        FROM gols g
        JOIN partidas p ON g.id_partida = p.id_partida
        WHERE g.id_jogador = ?
    """, (id_jogador,))
    gols = c_main.fetchall()
    
    # 2. Escalações do jogador no futebol.db
    c_main.execute("""
        SELECT e.id_escalacao, e.id_partida, e.clube, p.mandante, p.visitante, p.data
        FROM escalacoes e
        JOIN partidas p ON e.id_partida = p.id_partida
        WHERE e.id_jogador = ?
    """, (id_jogador,))
    escalacoes = c_main.fetchall()
    
    conn_main.close()
    
    gols_alienigenas = []
    for g in gols:
        id_gol, id_partida, clube_gol, mandante, visitante, data, camp = g
        # Se clube_gol não está na lista de clubes oficiais da carreira
        if clube_gol not in clubes_oficiais:
            # Identifica qual time o atleta realmente defendia na partida
            clube_correto = None
            if mandante in clubes_oficiais:
                clube_correto = mandante
            elif visitante in clubes_oficiais:
                clube_correto = visitante
            else:
                # Checagem por substring / nome parcial (ex: 'Estatísticas e Escalações Santos')
                for ofc in clubes_oficiais:
                    if ofc.lower() in (mandante or "").lower():
                        clube_correto = ofc
                        break
                    elif ofc.lower() in (visitante or "").lower():
                        clube_correto = ofc
                        break
            
            gols_alienigenas.append({
                "id_gol": id_gol,
                "id_partida": id_partida,
                "data": data,
                "campeonato": camp,
                "mandante": mandante,
                "visitante": visitante,
                "clube_registrado": clube_gol,
                "clube_correto": clube_correto
            })
            
    escalacoes_alienigenas = []
    for e in escalacoes:
        id_esc, id_partida, clube_esc, mandante, visitante, data = e
        if clube_esc not in clubes_oficiais:
            escalacoes_alienigenas.append({
                "id_escalacao": id_esc,
                "id_partida": id_partida,
                "data": data,
                "clube_registrado": clube_esc
            })
            
    return {
        "id_jogador": id_jogador,
        "atleta_nome": atleta_nome,
        "clubes_oficiais": sorted(list(clubes_oficiais)),
        "total_gols": len(gols),
        "total_escalacoes": len(escalacoes),
        "gols_alienigenas": gols_alienigenas,
        "escalacoes_alienigenas": escalacoes_alienigenas
    }

def curar_gols_alienigenas(id_jogador: int, aplicar: bool = False) -> Dict:
    """Corrige gols atribuídos ao adversário no futebol.db realocando para o clube legítimo."""
    res = auditar_e_comparar_atleta(id_jogador)
    if "gols_alienigenas" not in res:
        return res
    
    gols_al = res["gols_alienigenas"]
    if not gols_al:
        return {"status": "limpo", "corrigidos": 0, "mensagem": "Nenhum gol alienígena detectado."}
    
    corrigidos = 0
    conn = sqlite3.connect(DB_MAIN)
    c = conn.cursor()
    
    for item in gols_al:
        clube_correto = item["clube_correto"]
        id_gol = item["id_gol"]
        if clube_correto:
            # Caso 1: Gol legítimo onde o adversário foi gravado por engano
            if aplicar:
                c.execute("UPDATE gols SET clube = ? WHERE id_gol = ?", (clube_correto, id_gol))
            corrigidos += 1
            print(f" [CURA-CLUBE] Gol {id_gol} de {item['clube_registrado']} -> {clube_correto} (Partida {item['id_partida']})")
        else:
            # Caso 2: Nem mandante nem visitante constam na carreira oficial (Divergência mantida para auditoria segura)
            print(f" [AUDITORIA] Gol {id_gol} em {item['clube_registrado']} (Partida {item['id_partida']}): mantido para validação manual.")
    
    if aplicar:
        # Recalcula a coluna clubes e total_gols para o atleta
        c.execute("""
            SELECT DISTINCT clube FROM (
                SELECT clube FROM escalacoes WHERE id_jogador = ?
                UNION
                SELECT clube FROM gols WHERE id_jogador = ?
            ) WHERE clube IS NOT NULL AND clube != ''
        """, (id_jogador, id_jogador))
        novos_clubes = [r[0] for r in c.fetchall() if r[0]]
        clubes_str = ",".join(sorted(novos_clubes))
        
        c.execute("SELECT COUNT(*) FROM gols WHERE id_jogador = ?", (id_jogador,))
        gols_atualizados = c.fetchone()[0]

        c.execute("UPDATE jogadores SET clubes = ?, total_gols = ? WHERE id_jogador = ?", (clubes_str, gols_atualizados, id_jogador))
        c.execute("UPDATE jogadores_estatisticas SET clubes = ?, total_gols = ? WHERE id_jogador = ?", (clubes_str, gols_atualizados, id_jogador))
        conn.commit()
        print(f" -> Atleta {id_jogador}: total_gols={gols_atualizados} | clubes={clubes_str}")
        
    conn.close()
    return {"status": "sucesso", "corrigidos": corrigidos, "aplicado": aplicar}

def processar_lote_top(limite: int = 50, aplicar: bool = True):
    """Executa auditoria e reconciliação em lote dos Top N atletas da base."""
    print("=" * 70)
    print(f"  RECONCILIAÇÃO EM LOTE: TOP {limite} ATLETAS DA BASE")
    print("=" * 70)

    init_reference_db()
    conn_main = sqlite3.connect(DB_MAIN)
    conn_main.row_factory = sqlite3.Row
    c_main = conn_main.cursor()

    c_main.execute("""
        SELECT id_jogador, nome_exibicao, apelido, total_gols, total_jogos, clubes
        FROM jogadores_estatisticas
        WHERE total_gols > 0
        ORDER BY total_gols DESC, total_jogos DESC
        LIMIT ?;
    """, (limite,))
    atletas = [dict(r) for r in c_main.fetchall()]
    conn_main.close()

    total_auditados = 0
    total_gols_curados = 0
    atletas_com_divergencia = 0
    divergencias_detalhes = []

    for idx, atl in enumerate(atletas, 1):
        id_jog = atl["id_jogador"]
        nome = atl["nome_exibicao"]
        apelido = atl.get("apelido") or nome

        # Mapeamento canônico para busca Wikidata
        nome_busca = MAPA_NOMES_WIKIDATA.get(nome.lower(), MAPA_NOMES_WIKIDATA.get(apelido.lower(), nome))

        # 1. Cadastra na referência se ainda não cadastrado
        conn_ref = sqlite3.connect(DB_REF)
        c_ref = conn_ref.cursor()
        c_ref.execute("SELECT wikidata_id FROM ref_atletas WHERE id_jogador_futebol_db = ?", (id_jog,))
        row_ref = c_ref.fetchone()
        conn_ref.close()

        if not row_ref:
            cadastrar_atleta_referencia(id_jog, nome_custom=nome_busca)
            time.sleep(0.3)

        # 2. Executa auditoria
        res_audit = auditar_e_comparar_atleta(id_jog)
        gols_al = res_audit.get("gols_alienigenas", [])

        if gols_al:
            atletas_com_divergencia += 1
            print(f"[{idx}/{len(atletas)}] ID {id_jog}: {nome} -> {len(gols_al)} gols com clube invertido!")
            divergencias_detalhes.append({
                "id_jogador": id_jog,
                "nome": nome,
                "gols_invertidos": len(gols_al),
                "detalhes": gols_al[:3]
            })
            if aplicar:
                res_cura = curar_gols_alienigenas(id_jog, aplicar=True)
                total_gols_curados += res_cura.get("corrigidos", 0)
        else:
            print(f"[{idx}/{len(atletas)}] ID {id_jog}: {nome} -> 100% íntegro.")

        total_auditados += 1

    print("\n" + "=" * 70)
    print(f"  RESUMO DA AUDITORIA E RECONCILIAÇÃO DO LOTE TOP {limite}:")
    print(f"  • Total de atletas auditados: {total_auditados}")
    print(f"  • Atletas com divergências identificadas: {atletas_com_divergencia}")
    print(f"  • Gols alienígenas curados cirurgicamente: {total_gols_curados}")
    print("=" * 70)
    return {
        "auditados": total_auditados,
        "com_divergencia": atletas_com_divergencia,
        "gols_curados": total_gols_curados,
        "divergencias": divergencias_detalhes
    }

if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser(description="Gerenciador do Segundo Banco de Referência")
    parser.add_argument("--cadastrar", type=int, help="ID do jogador no futebol.db para cadastrar na referência")
    parser.add_argument("--nome", type=str, help="Nome do jogador para busca na Wikidata")
    parser.add_argument("--auditar", type=int, help="ID do jogador para auditar")
    parser.add_argument("--curar", type=int, help="ID do jogador para curar gols alienígenas")
    parser.add_argument("--aplicar", action="store_true", help="Aplica as correções no futebol.db")
    parser.add_argument("--buscar-nome", type=str, help="Busca jogador no futebol.db por nome")
    parser.add_argument("--lote-top", type=int, help="Executa auditoria e cura em lote nos Top N atletas")

    args = parser.parse_args()

    if args.lote_top:
        processar_lote_top(limite=args.lote_top, aplicar=args.aplicar)
    elif args.cadastrar:
        cadastrar_atleta_referencia(args.cadastrar, args.nome)
    elif args.auditar:
        resultado = auditar_e_comparar_atleta(args.auditar)
        print(json.dumps(resultado, indent=2, ensure_ascii=False))
    elif args.curar:
        res = curar_gols_alienigenas(args.curar, aplicar=args.aplicar)
        print(json.dumps(res, indent=2, ensure_ascii=False))
    elif args.buscar_nome:
        conn = sqlite3.connect(DB_MAIN)
        c = conn.cursor()
        t = f"%{args.buscar_nome.strip()}%"
        c.execute("SELECT id_jogador, apelido, nome_exibicao, clubes FROM jogadores WHERE apelido LIKE ? OR nome_exibicao LIKE ? LIMIT 10", (t, t))
        rows = c.fetchall()
        if rows:
            print("Encontrado em 'jogadores':")
            for r in rows:
                print(r)
        else:
            print("Não encontrado em 'jogadores'. Buscando em 'escalacoes'...")
            c.execute("SELECT DISTINCT atleta, clube, id_jogador FROM escalacoes WHERE atleta LIKE ? LIMIT 10", (t,))
            for r in c.fetchall():
                print(r)
            print("Buscando em 'gols'...")
            c.execute("SELECT DISTINCT atleta, clube, id_jogador FROM gols WHERE atleta LIKE ? LIMIT 10", (t,))
            for r in c.fetchall():
                print(r)
        conn.close()
    else:
        init_reference_db()
        print(f"Banco de referência inicializado em {DB_REF}")
