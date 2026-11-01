"""
tests/test_golden_facts.py
--------------------------
Suíte de Avaliação Automatizada de Fatos Canônicos (Agent-Evals Pattern)
Valida a integridade factual de perguntas críticas da história do futebol brasileiro
diretamente contra o banco data/futebol.db.
"""

import os
import json
import sqlite3
import pytest

DB_PATH = os.path.join(os.path.dirname(__file__), "..", "data", "futebol.db")
FIXTURE_PATH = os.path.join(os.path.dirname(__file__), "fixtures", "golden_facts_quiz.json")

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

@pytest.fixture(scope="module")
def golden_facts():
    with open(FIXTURE_PATH, "r", encoding="utf-8") as f:
        data = json.load(f)
    return {item["id"]: item for item in data["golden_facts"]}

def test_fact_1_pele_artilheiro_paulista_1964(golden_facts):
    fact = golden_facts["pele_artilheiro_paulista_1964"]
    conn = get_db()
    cur = conn.cursor()

    cur.execute("""
        SELECT g.atleta, g.clube, count(*) as total_gols
        FROM gols g
        JOIN partidas p ON g.id_partida = p.id_partida
        WHERE p.ano = ? AND p.campeonato LIKE '%Paulista%'
        GROUP BY g.atleta, g.clube
        ORDER BY total_gols DESC
        LIMIT 1;
    """, (fact["ano"],))
    row = cur.fetchone()
    conn.close()

    assert row is not None, "Nenhum gol catalogado no Paulistão de 1964"
    assert fact["artilheiro_esperado"].lower() in row["atleta"].lower(), f"Artilheiro divergente: {row['atleta']}"
    assert fact["clube_esperado"].lower() in row["clube"].lower(), f"Clube divergente: {row['clube']}"
    assert row["total_gols"] == fact["gols_esperados"], f"Gols divergentes: esperados {fact['gols_esperados']}, obtidos {row['total_gols']}"

def test_fact_2_valdivia_palmeiras_gols(golden_facts):
    fact = golden_facts["valdivia_palmeiras_gols"]
    conn = get_db()
    cur = conn.cursor()

    # Checagem na tabela gols
    cur.execute("""
        SELECT count(*) 
        FROM gols 
        WHERE (id_jogador = ? OR lower(atleta) LIKE '%valdivia%')
          AND lower(clube) LIKE '%palmeiras%';
    """, (fact["id_jogador"],))
    gols_acervo = cur.fetchone()[0]

    # Checagem no perfil de carreira
    cur.execute("""
        SELECT gols_carreira_oficiais, jogos_carreira_oficiais, detalhe_carreira_clubes
        FROM jogadores_estatisticas
        WHERE id_jogador = ?;
    """, (fact["id_jogador"],))
    perfil = cur.fetchone()
    conn.close()

    assert perfil is not None, "Perfil de Valdivia (ID 15934) não encontrado em jogadores_estatisticas"
    assert gols_acervo >= fact["gols_carreira_palmeiras_esperados"], f"Gols de Valdivia no acervo {gols_acervo} abaixo de {fact['gols_carreira_palmeiras_esperados']}"
    
    # Valida presença dos dados do Palmeiras no detalhe_carreira_clubes
    detalhes = json.loads(perfil["detalhe_carreira_clubes"] or "[]")
    palmeiras_det = next((c for c in detalhes if "palmeiras" in c.get("clube", "").lower()), None)
    assert palmeiras_det is not None, "Palmeiras não encontrado no histórico de clubes de Valdivia"
    assert palmeiras_det["gols"] == fact["gols_carreira_palmeiras_esperados"], f"Gols no detalhe da carreira divergentes: {palmeiras_det['gols']}"
    assert palmeiras_det["jogos"] == fact["jogos_carreira_palmeiras_esperados"], f"Jogos no detalhe da carreira divergentes: {palmeiras_det['jogos']}"

def test_fact_3_final_paulistao_2020(golden_facts):
    fact = golden_facts["final_paulistao_2020"]
    conn = get_db()
    cur = conn.cursor()

    # Busca a partida de volta da final em 08/08/2020
    cur.execute("""
        SELECT id_partida, data, mandante, visitante, placar, vencedor, fase
        FROM partidas
        WHERE data = ?
          AND ((lower(mandante) LIKE '%palmeiras%' AND lower(visitante) LIKE '%corinthians%')
            OR (lower(mandante) LIKE '%corinthians%' AND lower(visitante) LIKE '%palmeiras%'))
          AND campeonato LIKE '%Paulista%';
    """, (fact["data_volta"],))
    partida = cur.fetchone()

    assert partida is not None, f"Partida de volta da final do Paulistão 2020 ({fact['data_volta']}) não encontrada"
    assert partida["placar"] == "1x1", f"Placar no tempo normal deve ser 1x1: {partida['placar']}"
    assert partida["vencedor"] == "Empate", f"Vencedor no tempo regulamentar deve ser Empate: {partida['vencedor']}"

    # Valida os gols da partida
    cur.execute("""
        SELECT clube, atleta, minuto
        FROM gols
        WHERE id_partida = ?;
    """, (partida["id_partida"],))
    gols = cur.fetchall()
    conn.close()

    assert len(gols) == 2, f"Esperados 2 gols na final de 08/08/2020, encontrados {len(gols)}"
    atletas_gols = {g["atleta"].lower(): g["clube"] for g in gols}
    assert any("luiz adriano" in at for at in atletas_gols), "Gol de Luiz Adriano ausente na final"
    assert any("jô" in at or "jo" in at for at in atletas_gols), "Gol de Jô ausente na final"

def test_fact_4_bragantino_paulista_1991(golden_facts):
    fact = golden_facts["bragantino_paulista_1991"]
    conn = get_db()
    cur = conn.cursor()

    cur.execute("""
        SELECT count(*) as total_jogos,
               sum(CASE WHEN lower(mandante) LIKE '%bragantino%' THEN gols_mandante ELSE gols_visitante END) as gols_pro
        FROM partidas
        WHERE ano = ? AND campeonato LIKE '%Paulista%'
          AND (lower(mandante) LIKE '%bragantino%' OR lower(visitante) LIKE '%bragantino%');
    """, (fact["ano"],))
    row = cur.fetchone()
    conn.close()

    assert row["total_jogos"] >= fact["jogos_minimos"], f"Bragantino com apenas {row['total_jogos']} jogos no Paulistão 1991 (esperado >= {fact['jogos_minimos']})"
    assert row["gols_pro"] >= fact["gols_pro_esperados"], f"Bragantino com {row['gols_pro']} gols no Paulistão 1991 (esperado >= {fact['gols_pro_esperados']})"

def test_fact_5_edmundo_brasileirao_serie_a(golden_facts):
    fact = golden_facts["edmundo_brasileirao_serie_a"]
    conn = get_db()
    cur = conn.cursor()

    # Checagem na tabela gols em edições da Série A
    cur.execute("""
        SELECT count(*) 
        FROM gols g
        JOIN partidas p ON g.id_partida = p.id_partida
        WHERE g.id_jogador = ?
          AND (lower(p.campeonato) LIKE '%brasileir%' OR lower(p.campeonato) LIKE '%série a%')
          AND lower(p.campeonato) NOT LIKE '%série b%'
          AND lower(p.campeonato) NOT LIKE '%serie b%';
    """, (fact["id_jogador"],))
    gols_serie_a = cur.fetchone()[0]

    cur.execute("""
        SELECT total_gols, gols_carreira_oficiais
        FROM jogadores_estatisticas
        WHERE id_jogador = ?;
    """, (fact["id_jogador"],))
    perfil = cur.fetchone()
    conn.close()

    assert perfil is not None, "Perfil de Edmundo não encontrado"
    assert gols_serie_a == fact["gols_serie_a_esperados"], f"Edmundo com {gols_serie_a} gols na Série A (esperado {fact['gols_serie_a_esperados']})"
