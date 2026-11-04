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

def test_carioca_maior_artilheiro_roberto_dinamite():
    """Valida que Roberto Dinamite (ID 11967) é o maior artilheiro histórico do Campeonato Carioca."""
    conn = get_db()
    cur = conn.cursor()
    cur.execute("""
        SELECT count(*) 
        FROM gols g
        JOIN partidas p ON g.id_partida = p.id_partida
        WHERE g.id_jogador = 11967 AND lower(p.campeonato) LIKE '%carioca%';
    """)
    gols_carioca = cur.fetchone()[0]
    conn.close()
    assert gols_carioca >= 270, f"Dinamite com {gols_carioca} gols no Carioca (esperado >= 270)"

def test_carioca_segundo_maior_artilheiro_zico():
    """Valida que Zico (ID 13953) é o segundo maior artilheiro histórico do Carioca com mais de 220 gols."""
    conn = get_db()
    cur = conn.cursor()
    cur.execute("""
        SELECT count(*) 
        FROM gols g
        JOIN partidas p ON g.id_partida = p.id_partida
        WHERE g.id_jogador = 13953 AND lower(p.campeonato) LIKE '%carioca%';
    """)
    gols_carioca = cur.fetchone()[0]
    conn.close()
    assert gols_carioca >= 220, f"Zico com {gols_carioca} gols no Carioca (esperado >= 220)"

def test_carioca_recordista_artilharias_romario():
    """Valida que Romário (ID 12212) possui mais de 200 gols no Carioca e perfil com 744 gols oficiais."""
    conn = get_db()
    cur = conn.cursor()
    cur.execute("""
        SELECT count(*) 
        FROM gols g
        JOIN partidas p ON g.id_partida = p.id_partida
        WHERE g.id_jogador = 12212 AND lower(p.campeonato) LIKE '%carioca%';
    """)
    gols_carioca = cur.fetchone()[0]
    cur.execute("SELECT gols_carreira_oficiais FROM jogadores_estatisticas WHERE id_jogador = 12212;")
    gols_carreira = cur.fetchone()[0]
    conn.close()
    assert gols_carioca >= 200, f"Romário com {gols_carioca} gols no Carioca (esperado >= 200)"
    assert gols_carreira == 744, f"Carreira oficial de Romário: {gols_carreira} (esperado 744)"

def test_carioca_recorde_absoluto_sylvio_pirillo_1941():
    """Valida que Sylvio Pirillo (ID 90104) tem exatamente 39 gols no Carioca de 1941 pelo Flamengo."""
    conn = get_db()
    cur = conn.cursor()
    cur.execute("""
        SELECT count(*) 
        FROM gols g
        JOIN partidas p ON g.id_partida = p.id_partida
        WHERE g.id_jogador = 90104 AND p.ano = 1941 AND lower(p.campeonato) LIKE '%carioca%';
    """)
    gols = cur.fetchone()[0]
    conn.close()
    assert gols == 39, f"Sylvio Pirillo com {gols} gols em 1941 (esperado 39)"

def test_carioca_decisoes_historicas_gols():
    """Valida gols marcantes das decisões: 1989 (Maurício), 1995 (Gol de Barriga Renato Gaúcho) e 2001 (Petkovic falta)."""
    conn = get_db()
    cur = conn.cursor()

    # 1989: Botafogo 1x0 Flamengo (Maurício)
    cur.execute("SELECT atleta, id_jogador FROM gols WHERE id_partida = 202434418;")
    gols_89 = cur.fetchall()
    assert len(gols_89) == 1
    assert "maurício" in gols_89[0]["atleta"].lower() or "mauricio" in gols_89[0]["atleta"].lower()

    # 1995: Fluminense 3x2 Flamengo (Renato Gaúcho)
    cur.execute("SELECT atleta, tipo_de_gol, id_jogador FROM gols WHERE id_partida = 202423699;")
    gols_95 = cur.fetchall()
    assert len(gols_95) == 5
    barriga = [g for g in gols_95 if g["tipo_de_gol"] == "Barriga"]
    assert len(barriga) == 1 and "renato" in barriga[0]["atleta"].lower()

    # 2001: Vasco 1x3 Flamengo (Petkovic e Edílson)
    cur.execute("SELECT atleta, tipo_de_gol, id_jogador FROM gols WHERE id_partida = 202430360;")
    gols_01 = cur.fetchall()
    assert len(gols_01) == 4
    falta = [g for g in gols_01 if g["tipo_de_gol"] == "Falta"]
    assert len(falta) == 1 and "petkovic" in falta[0]["atleta"].lower()

    conn.close()

def test_gaucho_maior_artilheiro_inter_grenal_carlitos():
    """Valida que Carlitos (ID 90401) é o maior artilheiro da história do Inter com 485 gols em 384 jogos (média oficial 1.26)."""
    conn = get_db()
    cur = conn.cursor()
    cur.execute("SELECT total_gols, total_jogos, gols_carreira_oficiais, jogos_carreira_oficiais, media_gols_por_jogo FROM jogadores_estatisticas WHERE id_jogador = 90401;")
    row = cur.fetchone()
    conn.close()
    assert row is not None, "Perfil de Carlitos não encontrado"
    assert row["gols_carreira_oficiais"] == 485, f"Carlitos com {row['gols_carreira_oficiais']} gols oficiais (esperado 485)"
    assert row["jogos_carreira_oficiais"] == 384, f"Carlitos com {row['jogos_carreira_oficiais']} jogos oficiais (esperado 384)"
    media_carreira = round(row["gols_carreira_oficiais"] / row["jogos_carreira_oficiais"], 2)
    assert media_carreira == 1.26, f"Média oficial de carreira divergente: {media_carreira} (esperado 1.26)"
    assert row["media_gols_por_jogo"] <= 1.0, f"Média local deve respeitar a sanidade do auditor: {row['media_gols_por_jogo']}"

def test_gaucho_maior_artilheiro_gremio_alcindo():
    """Valida que Alcindo Bugre (ID 90408) é o maior artilheiro da história do Grêmio com 264 gols oficiais."""
    conn = get_db()
    cur = conn.cursor()
    cur.execute("SELECT total_gols, gols_carreira_oficiais FROM jogadores_estatisticas WHERE id_jogador = 90408;")
    row = cur.fetchone()
    cur.execute("SELECT count(*) FROM gols WHERE id_jogador = 90408;")
    gols_acervo = cur.fetchone()[0]
    conn.close()
    assert row is not None, "Perfil de Alcindo não encontrado"
    assert row["gols_carreira_oficiais"] == 330, f"Carreira oficial de Alcindo: {row['gols_carreira_oficiais']} (esperado 330)"
    assert gols_acervo >= 30, f"Gols no acervo de Alcindo: {gols_acervo} (esperado >= 30)"

def test_gaucho_recorde_era_moderna_sandro_sotilli():
    """Valida que Sandro Sotilli (ID 90501) é o recordista moderno com 27 gols em 2004 e >50 gols no Gauchão."""
    conn = get_db()
    cur = conn.cursor()
    cur.execute("""
        SELECT count(*) 
        FROM gols g
        JOIN partidas p ON g.id_partida = p.id_partida
        WHERE g.id_jogador = 90501 AND p.ano = 2004;
    """)
    gols_2004 = cur.fetchone()[0]
    cur.execute("SELECT count(*) FROM gols WHERE id_jogador = 90501;")
    gols_totais = cur.fetchone()[0]
    conn.close()
    assert gols_2004 == 27, f"Sandro Sotilli com {gols_2004} gols em 2004 (esperado 27)"
    assert gols_totais >= 50, f"Sandro Sotilli com {gols_totais} gols no Gauchão (esperado >= 50)"

def test_gaucho_artilheiro_ronaldinho_gaucho_1999():
    """Valida que Ronaldinho Gaúcho (ID 12245) foi o artilheiro do Gauchão de 1999 com gol na final."""
    conn = get_db()
    cur = conn.cursor()
    cur.execute("""
        SELECT count(*) 
        FROM gols g
        JOIN partidas p ON g.id_partida = p.id_partida
        WHERE g.id_jogador = 12245 AND p.ano = 1999 AND (lower(p.campeonato) LIKE '%gaúcho%' OR lower(p.campeonato) LIKE '%gaucho%');
    """)
    gols_1999 = cur.fetchone()[0]
    cur.execute("SELECT atleta, minuto FROM gols WHERE id_partida = 202431053;")
    gol_final = cur.fetchone()
    conn.close()
    assert gols_1999 >= 14, f"Ronaldinho com {gols_1999} gols no Gauchão 1999 (esperado >= 14)"
    assert gol_final is not None and "ronaldinho" in gol_final["atleta"].lower(), "Gol de Ronaldinho na final ausente"

def test_gaucho_artilharia_e_gols_diego_souza():
    """Valida que Diego Souza (ID 14953) possui mais de 200 gols catalogados e dados canônicos consolidados."""
    conn = get_db()
    cur = conn.cursor()
    cur.execute("SELECT count(*) FROM gols WHERE id_jogador = 14953;")
    gols_totais = cur.fetchone()[0]
    cur.execute("SELECT total_gols, gols_carreira_oficiais FROM jogadores_estatisticas WHERE id_jogador = 14953;")
    row = cur.fetchone()
    conn.close()
    assert gols_totais >= 200, f"Diego Souza com {gols_totais} gols no acervo (esperado >= 200)"
    assert row["gols_carreira_oficiais"] == 310, f"Carreira oficial de Diego Souza: {row['gols_carreira_oficiais']} (esperado 310)"

# ==============================================================================
# CAMPEONATO MINEIRO (1915 a 2026) - TESTES FACTUAIS DE OURO
# ==============================================================================

def test_mineiro_maior_artilheiro_galo_reinaldo():
    """Valida que Reinaldo (ID 90610) é homologado como maior artilheiro da história do Galo (255 gols) e 16 gols em clássicos."""
    conn = get_db()
    cur = conn.cursor()
    cur.execute("SELECT gols_carreira_oficiais, jogos_carreira_oficiais, premios, total_gols FROM jogadores_estatisticas WHERE id_jogador = 90610;")
    row = cur.fetchone()
    cur.execute("""
        SELECT count(*) 
        FROM gols g
        JOIN partidas p ON g.id_partida = p.id_partida
        WHERE g.id_jogador = 90610 
        AND ((p.mandante = 'Atlético-MG' AND p.visitante = 'Cruzeiro') OR (p.mandante = 'Cruzeiro' AND p.visitante = 'Atlético-MG'));
    """)
    gols_classicos = cur.fetchone()[0]
    conn.close()
    assert row is not None, "Reinaldo não encontrado no banco"
    assert "255" in row["premios"], "Registro de 255 gols históricos do Galo ausente"
    assert gols_classicos >= 16, f"Reinaldo com {gols_classicos} gols em clássicos (esperado >= 16)"
    assert row["total_gols"] >= 60, f"Reinaldo com {row['total_gols']} gols no acervo (esperado >= 60)"

def test_mineiro_maior_artilheiro_cruzeiro_tostao():
    """Valida que Tostão (ID 90601) é homologado como maior artilheiro da história do Cruzeiro (249 gols) e tricampeão da artilharia."""
    conn = get_db()
    cur = conn.cursor()
    cur.execute("SELECT gols_carreira_oficiais, premios, total_gols, detalhe_carreira_clubes FROM jogadores_estatisticas WHERE id_jogador = 90601;")
    row = cur.fetchone()
    cur.execute("""
        SELECT count(*) 
        FROM gols g
        JOIN partidas p ON g.id_partida = p.id_partida
        WHERE g.id_jogador = 90601 AND p.ano IN (1966, 1967, 1968)
        AND lower(p.campeonato) LIKE '%mineiro%';
    """)
    gols_tri = cur.fetchone()[0]
    conn.close()
    assert row is not None, "Tostão não encontrado no banco"
    assert "249" in str(row["premios"]) or "249" in str(row["detalhe_carreira_clubes"]), "Registro de 249 gols no Cruzeiro ausente"
    assert gols_tri >= 50, f"Tostão com {gols_tri} gols no tricampeonato 66-68 (esperado >= 50)"
    assert row["total_gols"] >= 80, f"Tostão com {row['total_gols']} gols no acervo (esperado >= 80)"

def test_mineiro_artilheiro_ronaldo_fenomeno_1994():
    """Valida que Ronaldo Fenômeno (ID 90615) possui exatamente 22 gols oficiais em 18 jogos no Mineiro 1994 e hat-trick no clássico."""
    conn = get_db()
    cur = conn.cursor()
    cur.execute("""
        SELECT count(*) 
        FROM gols g
        JOIN partidas p ON g.id_partida = p.id_partida
        WHERE g.id_jogador = 90615 AND p.ano = 1994 AND lower(p.campeonato) LIKE '%mineiro%';
    """)
    gols_1994 = cur.fetchone()[0]
    cur.execute("SELECT count(*) FROM gols WHERE id_partida = 202432907 AND id_jogador = 90615;")
    gols_classico = cur.fetchone()[0]
    cur.execute("SELECT gols_carreira_oficiais FROM jogadores_estatisticas WHERE id_jogador = 90615;")
    gols_carreira = cur.fetchone()[0]
    conn.close()
    assert gols_1994 == 22, f"Ronaldo com {gols_1994} gols no Mineiro 1994 (esperado 22)"
    assert gols_classico == 3, f"Ronaldo com {gols_classico} gols no clássico 1994 (esperado hat-trick com 3 gols)"
    assert gols_carreira == 414, f"Carreira oficial de Ronaldo: {gols_carreira} (esperado 414)"

def test_mineiro_dada_maravilha_e_dirceu_lopes():
    """Valida Dadá Maravilha (ID 90207) artilheiro de 1969 com 29 gols e Dirceu Lopes (ID 90602) com gol do título de 1969."""
    conn = get_db()
    cur = conn.cursor()
    cur.execute("""
        SELECT count(*) 
        FROM gols g
        JOIN partidas p ON g.id_partida = p.id_partida
        WHERE g.id_jogador = 90207 AND p.ano = 1969 AND lower(p.campeonato) LIKE '%mineiro%';
    """)
    gols_dada_1969 = cur.fetchone()[0]
    cur.execute("SELECT atleta FROM gols WHERE id_partida = 202440482 AND id_jogador = 90602;")
    gol_dirceu = cur.fetchone()
    conn.close()
    assert gols_dada_1969 == 29, f"Dadá Maravilha com {gols_dada_1969} gols em 1969 (esperado 29)"
    assert gol_dirceu is not None, "Gol do título de Dirceu Lopes na final de 1969 ausente"

def test_mineiro_hegemonia_hulk_e_artilheiros_modernos():
    """Valida hegemonia de Hulk (ID 9) com 4 artilharias e Diego Tardelli (ID 90620) artilheiro de 2009 com 16 gols."""
    conn = get_db()
    cur = conn.cursor()
    cur.execute("SELECT premios, total_gols FROM jogadores_estatisticas WHERE id_jogador = 9;")
    row_hulk = cur.fetchone()
    cur.execute("""
        SELECT count(*) 
        FROM gols g
        JOIN partidas p ON g.id_partida = p.id_partida
        WHERE g.id_jogador = 9 AND lower(p.campeonato) LIKE '%mineiro%';
    """)
    gols_hulk_mineiro = cur.fetchone()[0]
    cur.execute("""
        SELECT count(*) 
        FROM gols g
        JOIN partidas p ON g.id_partida = p.id_partida
        WHERE g.id_jogador = 90620 AND p.ano = 2009 AND lower(p.campeonato) LIKE '%mineiro%';
    """)
    gols_tardelli_2009 = cur.fetchone()[0]
    conn.close()
    assert "2022" in row_hulk["premios"] and "2023" in row_hulk["premios"] and "2024" in row_hulk["premios"], "Artilharias de Hulk ausentes"
    assert gols_hulk_mineiro >= 35, f"Hulk com {gols_hulk_mineiro} gols no Mineiro (esperado >= 35)"
    assert gols_tardelli_2009 == 16, f"Diego Tardelli com {gols_tardelli_2009} gols em 2009 (esperado 16)"

# ==============================================================================
# FUTEBOL BAIANO & COPA DO NORDESTE (1905 a 2026) - TESTES FACTUAIS DE OURO
# ==============================================================================

def test_baiano_maior_artilheiro_bahia_carlito():
    """Valida que Carlito (ID 90701) é homologado como maior artilheiro da história do Bahia (253 gols) e 21 gols em Ba-Vis."""
    conn = get_db()
    cur = conn.cursor()
    cur.execute("SELECT gols_carreira_oficiais, jogos_carreira_oficiais, premios, titulos FROM jogadores_estatisticas WHERE id_jogador = 90701;")
    row = cur.fetchone()
    conn.close()
    assert row is not None, "Carlito não encontrado no banco"
    assert row["gols_carreira_oficiais"] == 253, f"Gols oficiais de Carlito: {row['gols_carreira_oficiais']} (esperado 253)"
    assert row["jogos_carreira_oficiais"] == 341, f"Jogos oficiais de Carlito: {row['jogos_carreira_oficiais']} (esperado 341)"
    assert "21" in row["premios"], "Registro de 21 gols em Ba-Vis ausente"

def test_baiano_maior_artilheiro_bavi_juvenal():
    """Valida que Juvenal (ID 90702) é homologado como maior artilheiro da história do clássico Ba-Vi (25 gols) e 150 gols no Vitória."""
    conn = get_db()
    cur = conn.cursor()
    cur.execute("SELECT gols_carreira_oficiais, premios FROM jogadores_estatisticas WHERE id_jogador = 90702;")
    row = cur.fetchone()
    cur.execute("""
        SELECT count(*) 
        FROM gols g
        JOIN partidas p ON g.id_partida = p.id_partida
        WHERE g.id_jogador = 90702;
    """)
    gols_acervo = cur.fetchone()[0]
    conn.close()
    assert row is not None, "Juvenal não encontrado no banco"
    assert "25" in row["premios"], "Registro de 25 gols em Ba-Vis ausente"
    assert "150" in row["premios"], "Registro de 150 gols no Vitória ausente"
    assert gols_acervo >= 4, f"Juvenal com {gols_acervo} gols nas decisões catalogadas (esperado >= 4)"

def test_baiano_recordista_gols_edicao_neto_baiano_2012():
    """Valida que Neto Baiano (ID 90712) é homologado como recordista histórico com 27 gols em 2012 e mais de 50 no Barradão."""
    conn = get_db()
    cur = conn.cursor()
    cur.execute("SELECT gols_carreira_oficiais, premios FROM jogadores_estatisticas WHERE id_jogador = 90712;")
    row = cur.fetchone()
    cur.execute("SELECT count(*) FROM gols WHERE id_jogador = 90712;")
    gols_acervo = cur.fetchone()[0]
    conn.close()
    assert row is not None, "Neto Baiano não encontrado no banco"
    assert "27" in row["premios"], "Registro de 27 gols no Baiano 2012 ausente"
    assert gols_acervo >= 3, f"Neto Baiano com {gols_acervo} gols em clássicos 2012 (esperado >= 3)"

def test_nordestao_artilheiro_bicampeao_nonato():
    """Valida que Nonato (ID 90708) é homologado com 125 gols no Bahia e bicampeão da artilharia do Nordestão (2001 e 2002)."""
    conn = get_db()
    cur = conn.cursor()
    cur.execute("SELECT gols_carreira_oficiais, premios, total_gols FROM jogadores_estatisticas WHERE id_jogador = 90708;")
    row = cur.fetchone()
    cur.execute("""
        SELECT count(*) 
        FROM gols g
        JOIN partidas p ON g.id_partida = p.id_partida
        WHERE g.id_jogador = 90708 AND lower(p.campeonato) LIKE '%nordeste%';
    """)
    gols_nordeste = cur.fetchone()[0]
    conn.close()
    assert row is not None, "Nonato não encontrado no banco"
    assert "125" in row["premios"], "Registro de 125 gols no Bahia ausente"
    assert "2001" in row["premios"] and "2002" in row["premios"], "Bicampeonato de artilharia da Copa do Nordeste ausente"
    assert gols_nordeste >= 20, f"Nonato com {gols_nordeste} gols no Nordestão (esperado >= 20)"

def test_nordestao_artilheiro_bicampeao_gilberto():
    """Valida que Gilberto (ID 52) é homologado com 83 gols no Bahia e bicampeão da artilharia do Nordestão (2019 e 2021)."""
    conn = get_db()
    cur = conn.cursor()
    cur.execute("SELECT premios, total_gols FROM jogadores_estatisticas WHERE id_jogador = 52;")
    row = cur.fetchone()
    cur.execute("""
        SELECT count(*) 
        FROM gols g
        JOIN partidas p ON g.id_partida = p.id_partida
        WHERE g.id_jogador = 52 AND lower(p.campeonato) LIKE '%nordeste%';
    """)
    gols_nordeste = cur.fetchone()[0]
    conn.close()
    assert row is not None, "Gilberto não encontrado no banco"
    assert "83" in row["premios"], "Registro de 83 gols no Bahia ausente"
    assert "2019" in row["premios"] and "2021" in row["premios"], "Bicampeonato de artilharia de Gilberto no Nordestão ausente"
    assert gols_nordeste >= 15, f"Gilberto com {gols_nordeste} gols no Nordestão (esperado >= 15)"

# ==============================================================================
# GOLEIROS & PALMARÉS OFICIAL (OGOL & SOFASCORE) - TESTES FACTUAIS DE OURO
# ==============================================================================

def test_goleiros_historicos_palmares_clean_sheets_e_penaltis():
    """Valida enriquecimento de goleiros lendários (São Marcos, Rogério Ceni, Cássio, Fábio, Dida)."""
    conn = get_db()
    cur = conn.cursor()
    
    # 1. São Marcos (ID 102003, OGol 5503)
    cur.execute("SELECT titulos, premios, clean_sheets, penaltis_defendidos FROM jogadores_estatisticas WHERE id_jogador = 102003;")
    marcos = cur.fetchone()
    assert marcos is not None, "São Marcos não encontrado"
    assert marcos["clean_sheets"] >= 140, f"Clean sheets de São Marcos: {marcos['clean_sheets']} (esperado >= 140)"
    assert marcos["penaltis_defendidos"] >= 30, f"Pênaltis de São Marcos: {marcos['penaltis_defendidos']} (esperado >= 30)"
    assert "Copa do Mundo" in marcos["titulos"], "Copa do Mundo ausente no palmarés de Marcos"
    assert "Copa Libertadores" in marcos["titulos"], "Libertadores ausente no palmarés de Marcos"

    # 2. Rogério Ceni (ID 12170, OGol 5664)
    cur.execute("SELECT titulos, premios, clean_sheets, penaltis_defendidos FROM jogadores_estatisticas WHERE id_jogador = 12170;")
    ceni = cur.fetchone()
    assert ceni is not None, "Rogério Ceni não encontrado"
    assert ceni["clean_sheets"] >= 400, f"Clean sheets de Rogério Ceni: {ceni['clean_sheets']} (esperado >= 400)"
    assert ceni["penaltis_defendidos"] >= 50, f"Pênaltis de Rogério Ceni: {ceni['penaltis_defendidos']} (esperado >= 50)"
    assert "Mundial de Clubes" in ceni["titulos"] or "Mundial" in ceni["titulos"], "Mundial ausente no palmarés de Ceni"

    # 3. Cássio (ID 18603, OGol 31450)
    cur.execute("SELECT titulos, clean_sheets, penaltis_defendidos FROM jogadores_estatisticas WHERE id_jogador = 18603;")
    cassio = cur.fetchone()
    assert cassio is not None, "Cássio não encontrado"
    assert cassio["clean_sheets"] >= 250, f"Clean sheets de Cássio: {cassio['clean_sheets']} (esperado >= 250)"
    assert cassio["penaltis_defendidos"] >= 30, f"Pênaltis de Cássio: {cassio['penaltis_defendidos']} (esperado >= 30)"
    assert "Mundial de Clubes" in cassio["titulos"], "Mundial ausente no palmarés de Cássio"

    conn.close()

def test_atleta_sofascore_ratings_goleiros_e_estrelas():
    """Valida povoamento de ratings oficiais Sofascore para goleiros e atletas em atividade."""
    conn = get_db()
    cur = conn.cursor()
    cur.execute("SELECT count(*) FROM atleta_sofascore_ratings WHERE posicao LIKE '%Goleiro%';")
    total_gks = cur.fetchone()[0]
    assert total_gks >= 10, f"Apenas {total_gks} goleiros com Sofascore ratings (esperado >= 10)"

    cur.execute("SELECT rating_medio, perfil_clinico FROM atleta_sofascore_ratings WHERE id_jogador = 102003;")
    s_marcos = cur.fetchone()
    assert s_marcos is not None, "São Marcos não encontrado em atleta_sofascore_ratings"
    assert s_marcos["rating_medio"] >= 8.0, f"Rating de São Marcos {s_marcos['rating_medio']} (esperado >= 8.0)"

    conn.close()

def test_fact_sanitizacao_clubes_pedro_e_gabigol():
    """Valida que Pedro só possui Flamengo e Fluminense, e Gabigol apenas Santos, Flamengo e Cruzeiro."""
    conn = get_db()
    cur = conn.cursor()

    # 1. Pedro (ID 10)
    cur.execute("SELECT clubes FROM jogadores_estatisticas WHERE id_jogador = 10;")
    pedro = cur.fetchone()
    assert pedro is not None, "Pedro (ID 10) não encontrado"
    clubes_pedro = [c.strip() for c in pedro["clubes"].split(",")]
    assert "Juventude" not in clubes_pedro, f"Juventude não deve constar nos clubes de Pedro: {clubes_pedro}"
    assert set(clubes_pedro) == {"Flamengo", "Fluminense"}, f"Clubes inesperados para Pedro: {clubes_pedro}"

    # Nenhuma escalação de Pedro fora de Flamengo e Fluminense
    cur.execute("SELECT count(*) FROM escalacoes WHERE id_jogador = 10 AND clube NOT IN ('Flamengo', 'Fluminense');")
    assert cur.fetchone()[0] == 0, "Escalações espúrias vinculadas a Pedro (ID 10)"

    # 2. Gabriel Barbosa (ID 7)
    cur.execute("SELECT clubes FROM jogadores_estatisticas WHERE id_jogador = 7;")
    gabigol = cur.fetchone()
    assert gabigol is not None, "Gabriel Barbosa (ID 7) não encontrado"
    clubes_gabi = [c.strip() for c in gabigol["clubes"].split(",")]
    assert "Juventude" not in clubes_gabi, f"Juventude não deve constar nos clubes de Gabigol: {clubes_gabi}"
    assert "Mirassol" not in clubes_gabi, f"Mirassol não deve constar nos clubes de Gabigol: {clubes_gabi}"
    assert "Bragantino" not in clubes_gabi, f"Bragantino não deve constar nos clubes de Gabigol: {clubes_gabi}"
    assert "Ceará" not in clubes_gabi, f"Ceará não deve constar nos clubes de Gabigol: {clubes_gabi}"
    assert set(clubes_gabi) == {"Santos", "Flamengo", "Cruzeiro"}, f"Clubes inesperados para Gabigol: {clubes_gabi}"

    # Nenhuma escalação de Gabigol fora de Santos, Flamengo e Cruzeiro
    cur.execute("SELECT count(*) FROM escalacoes WHERE id_jogador = 7 AND clube NOT IN ('Santos', 'Flamengo', 'Cruzeiro');")
    assert cur.fetchone()[0] == 0, "Escalações espúrias vinculadas a Gabigol (ID 7)"

    conn.close()




