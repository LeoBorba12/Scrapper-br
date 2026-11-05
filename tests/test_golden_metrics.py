import pytest
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
from backend.app import app

@pytest.fixture
def client():
    app.config['TESTING'] = True
    with app.test_client() as client:
        yield client

def test_api_atletas_metricas_golden_exploratoria(client):
    res = client.get('/api/atletas/metricas-golden')
    assert res.status_code == 200
    data = res.get_json()
    assert 'dados' in data
    assert data['total'] > 0

    primeiro = data['dados'][0]
    assert 'gols_por_90' in primeiro
    assert 'gols_abertos' in primeiro
    assert 'gols_penalti' in primeiro
    assert 'gols_por_90_titular' in primeiro
    assert 'dependencia_ofensiva_em_campo' in primeiro
    assert primeiro['minutos'] >= 270

def test_api_atletas_metricas_golden_definitiva(client):
    res = client.get('/api/atletas/metricas-golden?visao=definitiva')
    assert res.status_code == 200
    data = res.get_json()
    assert data['visao'] == 'definitiva'
    assert data['total'] > 0
    for d in data['dados']:
        assert d['minutos'] >= 2700

def test_api_clubes_dossie_ofensivo(client):
    res = client.get('/api/clubes/dossie-ofensivo?clube=Flamengo')
    assert res.status_code == 200
    data = res.get_json()
    assert 'clube' in data
    assert data['clube']['selo_cobertura'] == 'Dossiê Completo (100% SLA)'
    assert 'principais_dependentes_ofensivos' in data
    assert 'elenco_producao_ofensiva' in data
    assert len(data['elenco_producao_ofensiva']) > 0

def test_api_clubes_cobertura_sla_100_golden(client):
    res = client.get('/api/clubes/cobertura-sla')
    assert res.status_code == 200
    data = res.get_json()
    assert 'clubes' in data
    
    # Conferir se clubes do Golden Dataset possuem 100%
    golden_nomes = {'Flamengo', 'Palmeiras', 'São Paulo', 'Santos', 'Corinthians', 'Vasco', 'Fluminense', 'Grêmio', 'Internacional', 'Cruzeiro'}
    encontrados = 0
    for c in data['clubes']:
        if c['nome'] in golden_nomes:
            assert c['cobertura_pct'] == 100.0
            assert c['selo'] == 'COBERTURA_TOTAL'
            encontrados += 1
    assert encontrados >= 10

def test_api_atletas_metricas_temporais_estrutura(client):
    res = client.get('/api/atletas/metricas-temporais')
    assert res.status_code == 200
    data = res.get_json()
    assert 'guardrail_editorial' in data
    assert data['guardrail_editorial']['suporte_placar_pre_gol'] is False
    assert 'aviso_clutch' in data['guardrail_editorial']
    assert data['total'] > 0

    primeiro = data['atletas'][0]
    assert 'gols' in primeiro
    assert 'total' in primeiro['gols']
    assert 'abertos' in primeiro['gols']
    assert 'penalti' in primeiro['gols']
    assert primeiro['gols']['abertos'] + primeiro['gols']['penalti'] == primeiro['gols']['total']

    dist = primeiro['distribuicao_absoluta']
    for faixa in ['0_15', '16_30', '31_45', '46_60', '61_75', '76_90', 'acrescimos', 'total_tardios', 'pct_tardios']:
        assert faixa in dist

    g90 = primeiro['gols_por_90_faixa']
    for faixa in ['0_15', '16_30', '31_45', '46_60', '61_75', '76_90']:
        assert faixa in g90
        assert isinstance(g90[faixa], (int, float))

    assert 'amostra' in primeiro
    assert 'classificacao' in primeiro['amostra']

def test_api_atletas_metricas_temporais_amostra_minima(client):
    res = client.get('/api/atletas/metricas-temporais?amostra_minima=1')
    assert res.status_code == 200
    data = res.get_json()
    assert data['total'] > 0
    for at in data['atletas']:
        assert at['amostra']['minima'] is True
        assert at['gols']['total'] >= 5

def test_api_gols_qualidade_estrutura(client):
    res = client.get('/api/gols/qualidade')
    assert res.status_code == 200
    data = res.get_json()
    assert 'governanca' in data
    assert data['governanca']['teto_vercel_mb'] == 94.0
    assert data['governanca']['soft_limit_mb'] == 84.0
    assert data['governanca']['meta_saudavel_mb'] == 80.0
    assert 'resumo_auditoria' in data
    assert data['resumo_auditoria']['total_registros_auditados'] > 0
    assert 'regras_violadas' in data
    assert len(data['regras_violadas']) > 0

def test_api_gols_qualidade_caso_reinaldo_mirassol(client):
    res = client.get('/api/gols/qualidade')
    assert res.status_code == 200
    data = res.get_json()
    assert 'caso_reinaldo_mirassol' in data
    caso = data['caso_reinaldo_mirassol']
    assert caso['partida_id'] == 202538151
    assert caso['duplicatas_eliminadas'] == 28
    assert caso['gols_reais_computados_2026'] == 3
    assert caso['idempotencia_ativa'] is True

def test_quarentena_reinaldo_metricas_temporais(client):
    # Validar que a API temporal agora retorna os dados limpos de Reinaldo (3 gols legítimos, sem os 31 de pênalti)
    res = client.get('/api/atletas/metricas-temporais?atleta_id=106')
    assert res.status_code == 200
    data = res.get_json()
    assert data['total'] == 1
    reinaldo = data['atletas'][0]
    assert reinaldo['gols']['total'] == 3
    assert reinaldo['amostra']['minima'] is False
    assert reinaldo['amostra']['classificacao'] == "Perfil exploratório"

def test_idempotencia_estrutural_gols_retentativa(client):
    import sqlite3
    conn = sqlite3.connect('data/futebol.db')
    c = conn.cursor()
    test_pid = 77770001
    test_aid = 99991
    test_cid = 8881
    test_min = 44
    test_tempo = '1T'
    test_tipo = 'Normal'
    test_sha = 'testsha123456789'

    # Limpar qualquer resquício
    c.execute("DELETE FROM gols WHERE partida_id = ?", (test_pid,))
    conn.commit()

    # 1. Primeira inserção
    c.execute("""
        INSERT INTO gols (id_partida, partida_id, atleta_id, id_jogador, clube, clube_id, atleta, minuto, tempo, tipo_de_gol, payload_sha256)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT (partida_id, atleta_id, clube_id, minuto, tempo, tipo_de_gol) DO NOTHING;
    """, (test_pid, test_pid, test_aid, test_aid, 'Clube Teste', test_cid, 'Atleta Teste', test_min, test_tempo, test_tipo, test_sha))
    conn.commit()

    # 2. Retentativa idêntica (simulação de falha de rede / retry de scraper)
    c.execute("""
        INSERT INTO gols (id_partida, partida_id, atleta_id, id_jogador, clube, clube_id, atleta, minuto, tempo, tipo_de_gol, payload_sha256)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT (partida_id, atleta_id, clube_id, minuto, tempo, tipo_de_gol) DO NOTHING;
    """, (test_pid, test_pid, test_aid, test_aid, 'Clube Teste', test_cid, 'Atleta Teste', test_min, test_tempo, test_tipo, test_sha))
    conn.commit()

    qtd = c.execute("SELECT count(*) FROM gols WHERE partida_id = ?", (test_pid,)).fetchone()[0]
    assert qtd == 1, f"Idempotência falhou: esperado 1 registro, encontrado {qtd}"

    # Limpeza
    c.execute("DELETE FROM gols WHERE partida_id = ?", (test_pid,))
    conn.commit()
    conn.close()

def test_zero_duplicatas_gols_e_escalacoes(client):
    import sqlite3
    conn = sqlite3.connect('data/futebol.db')
    c = conn.cursor()

    # Verificar zero duplicatas em gols
    dups_gols = c.execute("""
        SELECT count(*) FROM (
            SELECT partida_id, atleta_id, clube_id, minuto, tempo, tipo_de_gol, count(*)
            FROM gols
            WHERE atleta_id IS NOT NULL AND clube_id IS NOT NULL AND minuto IS NOT NULL
            GROUP BY partida_id, atleta_id, clube_id, minuto, tempo, tipo_de_gol
            HAVING count(*) > 1
        )
    """).fetchone()[0]
    assert dups_gols == 0, f"Existem {dups_gols} duplicatas em gols!"

    # Verificar zero duplicatas em escalacoes
    dups_esc = c.execute("""
        SELECT count(*) FROM (
            SELECT id_partida, id_jogador, clube, count(*)
            FROM escalacoes
            WHERE id_jogador IS NOT NULL
            GROUP BY id_partida, id_jogador, clube
            HAVING count(*) > 1
        )
    """).fetchone()[0]
    assert dups_esc == 0, f"Existem {dups_esc} duplicatas em escalacoes!"
    conn.close()

def test_banco_governanca_teto_e_journal_mode(client):
    import sqlite3
    import os
    conn = sqlite3.connect('data/futebol.db')
    jm = conn.execute("PRAGMA journal_mode;").fetchone()[0]
    conn.close()
    assert jm.lower() == 'delete'

    sz_mb = os.path.getsize('data/futebol.db') / (1024 * 1024)
    assert sz_mb < 84.0, f"Tamanho {sz_mb:.2f} MB excede o soft limit de 84.0 MB!"



