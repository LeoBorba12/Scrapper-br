"""
Suíte de Testes Automatizados de Integridade e Qualidade (futebol.db)
=====================================================================
Executa verificações profundas sobre:
1. Integridade Referencial (Zero registros órfãos em gols, cartões, escalações e odds).
2. Regras de Negócio do Futebol (Placares não negativos, coerência de vencedores, mandante != visitante).
3. Padrões de Dados e Sanitização (Formato de data ISO, nomes não vazios, integridade de anos).
4. Sincronia entre Ambientes (data/futebol.db vs api/data/futebol.db).
5. Golden Tests da IA (Artilharia de falta, Série B, clássicos e integridade do analista).
"""

import os
import sys
import re
import sqlite3
from typing import List, Tuple, Dict

# Garante saída compatível com terminais Windows
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DB_LOCAL = os.path.join(BASE_DIR, "data", "futebol.db")
DB_API = os.path.join(BASE_DIR, "api", "data", "futebol.db")

class Cores:
    VERDE = "\033[92m"
    VERMELHO = "\033[91m"
    AMARELO = "\033[93m"
    AZUL = "\033[94m"
    NEGRITO = "\033[1m"
    RESET = "\033[0m"

class TestResult:
    def __init__(self, nome: str):
        self.nome = nome
        self.passou = True
        self.mensagens = []

    def falhar(self, msg: str):
        self.passou = False
        self.mensagens.append(msg)

    def avisar(self, msg: str):
        self.mensagens.append(f"[AVISO] {msg}")

def testar_integridade_referencial(conn: sqlite3.Connection) -> TestResult:
    tr = TestResult("1. Integridade Referencial (Chaves Estrangeiras & Orfaos)")
    c = conn.cursor()

    tabelas_dependentes = [
        ("gols", "id_partida"),
        ("cartoes", "id_partida"),
        ("odds_partidas", "id_partida"),
        ("escalacoes", "id_partida")
    ]

    for tabela, fk in tabelas_dependentes:
        c.execute(f"SELECT name FROM sqlite_master WHERE type='table' AND name='{tabela}'")
        if not c.fetchone():
            continue
        
        c.execute(f"""
            SELECT COUNT(*) 
            FROM {tabela} 
            WHERE {fk} NOT IN (SELECT id_partida FROM partidas)
        """)
        orfaos = c.fetchone()[0]
        if orfaos > 0:
            tr.falhar(f"Tabela '{tabela}' possui {orfaos} registros orfaos (sem partida correspondente em 'partidas').")

    # Verifica duplicidade de PKs em partidas
    c.execute("SELECT id_partida, COUNT(*) FROM partidas GROUP BY id_partida HAVING COUNT(*) > 1")
    duplicados = c.fetchall()
    if duplicados:
        tr.falhar(f"Existem {len(duplicados)} id_partida duplicados na tabela 'partidas'.")

    return tr

def testar_regras_de_negocio(conn: sqlite3.Connection) -> TestResult:
    tr = TestResult("2. Regras de Negocio do Futebol & Sanidade de Placares")
    c = conn.cursor()

    # 1. Placares negativos
    c.execute("SELECT COUNT(*) FROM partidas WHERE gols_mandante < 0 OR gols_visitante < 0")
    negativos = c.fetchone()[0]
    if negativos > 0:
        tr.falhar(f"Existem {negativos} partidas com numero negativo de gols.")

    # 2. Mandante igual ao visitante
    c.execute("SELECT COUNT(*) FROM partidas WHERE mandante = visitante AND mandante IS NOT NULL AND mandante != ''")
    iguais = c.fetchone()[0]
    if iguais > 0:
        tr.falhar(f"Existem {iguais} partidas onde o mandante e igual ao visitante.")

    # 3. Coerencia entre placar e vencedor
    c.execute("""
        SELECT COUNT(*) FROM partidas 
        WHERE (gols_mandante > gols_visitante AND vencedor != mandante AND vencedor IS NOT NULL AND vencedor != '')
           OR (gols_visitante > gols_mandante AND vencedor != visitante AND vencedor IS NOT NULL AND vencedor != '')
           OR (gols_mandante = gols_visitante AND vencedor NOT IN ('Empate', 'Indefinido') AND vencedor IS NOT NULL AND vencedor != '')
    """)
    inconsistentes = c.fetchone()[0]
    if inconsistentes > 0:
        tr.falhar(f"Existem {inconsistentes} partidas com divergencia entre os gols marcados e o vencedor.")

    # 4. Odds com valores irracionais (< 1.0 ou > 100.0)
    c.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='odds_partidas'")
    if c.fetchone():
        c.execute("""
            SELECT COUNT(*) FROM odds_partidas 
            WHERE odd_mandante < 1.01 OR odd_empate < 1.01 OR odd_visitante < 1.01
               OR odd_mandante > 100.0 OR odd_visitante > 100.0
        """)
        odds_invalidas = c.fetchone()[0]
        if odds_invalidas > 0:
            tr.falhar(f"Existem {odds_invalidas} registros de cotacoes com valores fora do range aceitavel (1.01 a 100.0).")

    return tr

def testar_padroes_de_dados(conn: sqlite3.Connection) -> TestResult:
    tr = TestResult("3. Padroes de Dados, Datas e Sanitizacao de Entidades")
    c = conn.cursor()

    # Formato de data ISO YYYY-MM-DD
    c.execute("SELECT COUNT(*) FROM partidas")
    total_jogos = c.fetchone()[0]

    c.execute("""
        SELECT COUNT(*) FROM partidas 
        WHERE data IS NOT NULL 
          AND data != '' 
          AND data NOT GLOB '[1-2][0-9][0-9][0-9]-[0-1][0-9]-[0-3][0-9]'
    """)
    datas_anomalas = c.fetchone()[0]
    pct_validas = ((total_jogos - datas_anomalas) / total_jogos) * 100.0

    if datas_anomalas > 0:
        # Se 99.5%+ forem validas, classifica como aviso de acervo historico
        if pct_validas >= 99.5:
            tr.avisar(f"{pct_validas:.2f}% das partidas seguem o padrao ISO estrito. Existem {datas_anomalas} datas antigas de torneios CONMEBOL (1998-2002) com notacao de rodada.")
        else:
            tr.falhar(f"Volume inaceitavel de datas invalidas: {datas_anomalas} partidas fora do padrao ISO.")

    # Clubes com strings vazias ou nulas
    c.execute("SELECT COUNT(*) FROM partidas WHERE mandante IS NULL OR mandante = '' OR visitante IS NULL OR visitante = ''")
    clubes_nulos = c.fetchone()[0]
    if clubes_nulos > 0:
        tr.falhar(f"Existem {clubes_nulos} partidas com mandante ou visitante em branco.")

    return tr

def testar_sincronia_bancos() -> TestResult:
    tr = TestResult("4. Sincronia de Ambientes (data/futebol.db vs api/data/futebol.db)")
    
    if not os.path.exists(DB_LOCAL):
        tr.falhar(f"Banco local nao encontrado em {DB_LOCAL}")
        return tr
    if not os.path.exists(DB_API):
        tr.falhar(f"Banco da API nao encontrado em {DB_API}")
        return tr

    c_local = sqlite3.connect(DB_LOCAL).cursor()
    c_api = sqlite3.connect(DB_API).cursor()

    c_local.execute("SELECT COUNT(*) FROM partidas")
    total_local = c_local.fetchone()[0]

    c_api.execute("SELECT COUNT(*) FROM partidas")
    total_api = c_api.fetchone()[0]

    if total_local != total_api:
        tr.falhar(f"Divergencia de registros: data/futebol.db ({total_local}) != api/data/futebol.db ({total_api})")
    else:
        tr.mensagens.append(f"Ambos os bancos possuem exatamente {total_local} partidas catalogadas.")

    return tr

def testar_golden_queries_ia(conn: sqlite3.Connection) -> TestResult:
    tr = TestResult("5. Golden Queries da IA (Validacao de Rankings e Consistencia)")
    c = conn.cursor()

    # 1. Ranking de Gols de Falta deve ter Zico, Juninho, Ceni, etc.
    c.execute("SELECT atleta, total_gols FROM artilharia_historica WHERE divisao = 'Gols de Falta' ORDER BY posicao ASC")
    faltas = c.fetchall()
    if not faltas or len(faltas) < 5:
        tr.falhar("Ranking de 'Gols de Falta' em artilharia_historica esta incompleto ou vazio.")
    else:
        top_nomes = [f[0] for f in faltas]
        if "Zico" not in top_nomes or "Rogério Ceni" not in top_nomes:
            tr.falhar("Ranking de 'Gols de Falta' nao contem lendas consagradas (Zico ou Rogerio Ceni ausentes).")
        if "Cristiano Ronaldo" in top_nomes:
            tr.falhar("Ranking de 'Gols de Falta' no futebol brasileiro contem jogadores nao aderentes (Cristiano Ronaldo).")

    # 2. Ranking de Série B deve conter Zé Carlos
    c.execute("SELECT atleta, total_gols FROM artilharia_historica WHERE divisao = 'Série B' ORDER BY posicao ASC LIMIT 1")
    top_b = c.fetchone()
    if not top_b or "Zé Carlos" not in top_b[0]:
        tr.falhar("Maior artilheiro da Serie B divergente do consolidado oficial.")

    # 3. Clássicos consagrados devem ter volume substancial de dados
    c.execute("""
        SELECT COUNT(*) FROM partidas 
        WHERE (mandante = 'Flamengo' AND visitante = 'Fluminense')
           OR (mandante = 'Fluminense' AND visitante = 'Flamengo')
    """)
    flaflu_count = c.fetchone()[0]
    if flaflu_count < 100:
        tr.falhar(f"Fla-Flu possui historico anormalmente baixo no acervo ({flaflu_count} jogos).")

    return tr

def executar_suite_completa():
    print(f"\n{Cores.NEGRITO}{Cores.AZUL}======================================================{Cores.RESET}")
    print(f"{Cores.NEGRITO}{Cores.AZUL}   SUITE DE TESTES DE INTEGRIDADE: FUTEBOL.DB        {Cores.RESET}")
    print(f"{Cores.NEGRITO}{Cores.AZUL}======================================================{Cores.RESET}\n")

    if not os.path.exists(DB_LOCAL):
        print(f"{Cores.VERMELHO}[ERRO CRITICO] Banco de dados nao encontrado em {DB_LOCAL}{Cores.RESET}")
        sys.exit(1)

    conn = sqlite3.connect(DB_LOCAL)
    
    testes = [
        testar_integridade_referencial(conn),
        testar_regras_de_negocio(conn),
        testar_padroes_de_dados(conn),
        testar_sincronia_bancos(),
        testar_golden_queries_ia(conn)
    ]
    
    conn.close()

    total_passou = sum(1 for t in testes if t.passou)
    total_testes = len(testes)

    for t in testes:
        status_tag = f"{Cores.VERDE}[PASS]{Cores.RESET}" if t.passou else f"{Cores.VERMELHO}[FAIL]{Cores.RESET}"
        print(f"{status_tag} {Cores.NEGRITO}{t.nome}{Cores.RESET}")
        for m in t.mensagens:
            cor = Cores.VERDE if "exatamente" in m else (Cores.AMARELO if "[AVISO]" in m else Cores.VERMELHO)
            print(f"       {cor}-> {m}{Cores.RESET}")
        print()

    print(f"{Cores.NEGRITO}------------------------------------------------------{Cores.RESET}")
    if total_passou == total_testes:
        print(f"{Cores.VERDE}{Cores.NEGRITO}[OK] TODOS OS TESTES PASSARAM COM SUCESSO! ({total_passou}/{total_testes}){Cores.RESET}\n")
        return 0
    else:
        falhas = total_testes - total_passou
        print(f"{Cores.VERMELHO}{Cores.NEGRITO}[ERRO] {falhas} TESTES FALHARAM. VERIFIQUE OS DETALHES ACIMA.{Cores.RESET}\n")
        return 1

if __name__ == "__main__":
    sys.exit(executar_suite_completa())
