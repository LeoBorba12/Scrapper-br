import sqlite3
import pytest
from backend.scraper_contract import (
    validar_contrato_scraper,
    processar_carga_staging,
    resolver_identidade_entidade
)

@pytest.fixture
def test_db():
    conn = sqlite3.connect(":memory:")
    cursor = conn.cursor()
    cursor.executescript("""
        CREATE TABLE dim_entidades_aliases (
            alias_id INTEGER PRIMARY KEY AUTOINCREMENT,
            tipo_entidade TEXT NOT NULL,
            entidade_id INTEGER NOT NULL,
            alias_nome TEXT NOT NULL COLLATE NOCASE,
            fonte TEXT NOT NULL,
            confianca REAL DEFAULT 1.0,
            criado_em TEXT DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(tipo_entidade, alias_nome)
        );

        CREATE TABLE staging_entidades (
            staging_id INTEGER PRIMARY KEY AUTOINCREMENT,
            fonte TEXT NOT NULL,
            entidade_tipo TEXT NOT NULL,
            id_externo TEXT,
            nome_bruto TEXT NOT NULL,
            payload_json TEXT NOT NULL,
            completude REAL DEFAULT 1.0,
            confianca TEXT DEFAULT 'alta',
            status_resolucao TEXT DEFAULT 'pendente',
            motivo_quarentena TEXT,
            hash_payload TEXT NOT NULL,
            criado_em TEXT DEFAULT CURRENT_TIMESTAMP
        );

        -- Inserir registros conhecidos
        INSERT INTO dim_entidades_aliases (tipo_entidade, entidade_id, alias_nome, fonte)
        VALUES ('atleta', 101, 'Pedro', 'canonica');
        INSERT INTO dim_entidades_aliases (tipo_entidade, entidade_id, alias_nome, fonte)
        VALUES ('atleta', 101, 'Pedro Guilherme', 'ogol');
        INSERT INTO dim_entidades_aliases (tipo_entidade, entidade_id, alias_nome, fonte)
        VALUES ('atleta', 202, 'Pedro Raul', 'canonica');
    """)
    conn.commit()
    yield conn
    conn.close()

def test_validacao_contrato_correto():
    payload = {
        "fonte": "ogol",
        "entidade": "atleta",
        "id_externo": "12345",
        "nome": "Pedro",
        "aliases": ["Pedro Guilherme"],
        "dados": {"posicao": "Atacante", "clube_atual": "Flamengo"},
        "qualidade": {"completude": 0.94, "confianca": "alta"}
    }
    valido, erro = validar_contrato_scraper(payload)
    assert valido is True
    assert erro == ""

def test_validacao_contrato_invalido_sem_posicao():
    payload = {
        "fonte": "ogol",
        "entidade": "atleta",
        "id_externo": "12345",
        "nome": "Pedro",
        "dados": {"clube_atual": "Flamengo"},
        "qualidade": {"completude": 0.94, "confianca": "alta"}
    }
    valido, erro = validar_contrato_scraper(payload)
    assert valido is False
    assert "posicao" in erro

def test_processamento_staging_resolvido(test_db):
    payload = {
        "fonte": "ogol",
        "entidade": "atleta",
        "id_externo": "12345",
        "nome": "Pedro Guilherme",
        "aliases": ["Pedro Queixada"],
        "dados": {"posicao": "Atacante"},
        "qualidade": {"completude": 0.95, "confianca": "alta"}
    }
    res = processar_carga_staging(test_db, payload)
    assert res['status'] == 'aprovado'
    assert res['entidade_id'] == 101

    # Verificar se novo alias foi versionado
    cursor = test_db.cursor()
    row = cursor.execute("SELECT entidade_id FROM dim_entidades_aliases WHERE alias_nome = 'Pedro Queixada'").fetchone()
    assert row is not None
    assert row[0] == 101

def test_processamento_staging_quarentena_conflito(test_db):
    payload = {
        "fonte": "ogol",
        "entidade": "atleta",
        "id_externo": "999",
        "nome": "Jogador Misterioso",
        "aliases": ["Pedro Guilherme", "Pedro Raul"], # Colide com dois IDs (101 e 202)
        "dados": {"posicao": "Atacante"},
        "qualidade": {"completude": 0.90, "confianca": "alta"}
    }
    res = processar_carga_staging(test_db, payload)
    assert res['status'] == 'conflito'

    cursor = test_db.cursor()
    row = cursor.execute("SELECT status_resolucao, motivo_quarentena FROM staging_entidades WHERE id_externo = '999'").fetchone()
    assert row[0] == 'conflito'
