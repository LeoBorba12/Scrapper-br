"""
Módulo de Validação e Ingestão Canônica de Scrapers (FutStats Desafio 24).
Garante que todos os scrapers obedeçam ao contrato estrito de dados antes de
promover qualquer registro para as dimensões canônicas.
"""

import hashlib
import json
import sqlite3
from datetime import datetime
from typing import Dict, Any, Tuple, List

CAMPOS_OBRIGATORIOS_POR_ENTIDADE = {
    'atleta': ['nome', 'posicao'],
    'clube': ['nome'],
    'tecnico': ['nome'],
    'arbitro': ['nome'],
    'competicao': ['nome', 'temporada'],
    'estadio': ['nome']
}

def calcular_hash_payload(payload: Dict[str, Any]) -> str:
    """Gera hash SHA-256 determinístico para idempotência."""
    payload_str = json.dumps(payload, sort_keys=True, ensure_ascii=False)
    return hashlib.sha256(payload_str.encode('utf-8')).hexdigest()

def validar_contrato_scraper(payload: Dict[str, Any]) -> Tuple[bool, str]:
    """
    Valida a conformidade da carga do scraper com o Contrato Canônico.
    Retorna (valido: bool, motivo_erro: str).
    """
    if not isinstance(payload, dict):
        return False, "Payload deve ser um dicionário JSON."

    campos_raiz = ['fonte', 'entidade', 'id_externo', 'nome']
    for campo in campos_raiz:
        if campo not in payload or not payload[campo]:
            return False, f"Campo raiz obrigatório ausente: '{campo}'"

    entidade = payload['entidade'].lower()
    if entidade not in CAMPOS_OBRIGATORIOS_POR_ENTIDADE:
        return False, f"Tipo de entidade desconhecido: '{entidade}'"

    # Checar campos obrigatórios específicos do tipo
    obrigatorios = CAMPOS_OBRIGATORIOS_POR_ENTIDADE[entidade]
    dados_especificos = payload.get('dados', {})
    for cobr in obrigatorios:
        if cobr != 'nome' and cobr not in dados_especificos:
            return False, f"Campo de dados obrigatório para {entidade} ausente: '{cobr}'"

    # Checar métricas de qualidade
    qualidade = payload.get('qualidade', {})
    completude = qualidade.get('completude', 1.0)
    if completude < 0.5:
        return False, f"Completude insuficiente ({completude:.2f} < 0.50). Rejeitado na porta."

    return True, ""

def resolver_identidade_entidade(
    conn: sqlite3.Connection,
    tipo_entidade: str,
    nome: str,
    aliases: List[str] = None
) -> Tuple[int | None, str]:
    """
    Resolve se a entidade já existe via nome canônico ou tabela de aliases.
    Retorna (entidade_id ou None, status: 'resolvido' | 'novo' | 'conflito').
    """
    cursor = conn.cursor()
    
    # 1. Checagem direta na tabela de aliases
    cursor.execute("""
        SELECT entidade_id, confianca 
        FROM dim_entidades_aliases 
        WHERE tipo_entidade = ? AND alias_nome = ? COLLATE NOCASE
    """, (tipo_entidade, nome))
    row = cursor.fetchone()
    if row:
        return row[0], 'resolvido'

    # 2. Checar aliases fornecidos
    if aliases:
        encontrados = set()
        for a in aliases:
            cursor.execute("""
                SELECT entidade_id 
                FROM dim_entidades_aliases 
                WHERE tipo_entidade = ? AND alias_nome = ? COLLATE NOCASE
            """, (tipo_entidade, a))
            res = cursor.fetchall()
            for r in res:
                encontrados.add(r[0])
        
        if len(encontrados) == 1:
            return list(encontrados)[0], 'resolvido'
        elif len(encontrados) > 1:
            return None, 'conflito'

    return None, 'novo'

def processar_carga_staging(
    conn: sqlite3.Connection,
    payload: Dict[str, Any]
) -> Dict[str, Any]:
    """
    Executa o fluxo do Contrato de Scraper:
    1. Validação estrutural
    2. Gravação em staging_entidades com hash e timestamp
    3. Resolução de identidade
    4. Quarentena ou promoção canônica
    """
    valido, motivo = validar_contrato_scraper(payload)
    hash_p = calcular_hash_payload(payload)
    fonte = payload.get('fonte', 'desconhecido')
    entidade_tipo = payload.get('entidade', 'desconhecido')
    id_externo = str(payload.get('id_externo', ''))
    nome_bruto = payload.get('nome', '')
    aliases = payload.get('aliases', [])
    qualidade = payload.get('qualidade', {})
    completude = qualidade.get('completude', 1.0)
    confianca = qualidade.get('confianca', 'alta')

    cursor = conn.cursor()

    if not valido:
        cursor.execute("""
            INSERT INTO staging_entidades (
                fonte, entidade_tipo, id_externo, nome_bruto, payload_json,
                completude, confianca, status_resolucao, motivo_quarentena, hash_payload
            ) VALUES (?, ?, ?, ?, ?, ?, ?, 'quarentena', ?, ?)
        """, (fonte, entidade_tipo, id_externo, nome_bruto, json.dumps(payload),
              completude, confianca, f"Falha no contrato: {motivo}", hash_p))
        conn.commit()
        return {
            'status': 'quarentena',
            'motivo': motivo,
            'hash': hash_p
        }

    # Resolução de Identidade
    entidade_id, status_resolucao = resolver_identidade_entidade(
        conn, entidade_tipo, nome_bruto, aliases
    )

    if status_resolucao == 'conflito':
        cursor.execute("""
            INSERT INTO staging_entidades (
                fonte, entidade_tipo, id_externo, nome_bruto, payload_json,
                completude, confianca, status_resolucao, motivo_quarentena, hash_payload
            ) VALUES (?, ?, ?, ?, ?, ?, ?, 'conflito', 'Multiplos IDs associados aos aliases fornecidos', ?)
        """, (fonte, entidade_tipo, id_externo, nome_bruto, json.dumps(payload),
              completude, confianca, hash_p))
        conn.commit()
        return {
            'status': 'conflito',
            'motivo': 'Aliases colidem com múltiplas entidades canônicas distintas',
            'hash': hash_p
        }

    # Se aprovado/novo, gravar staging como 'aprovado'
    cursor.execute("""
        INSERT INTO staging_entidades (
            fonte, entidade_tipo, id_externo, nome_bruto, payload_json,
            completude, confianca, status_resolucao, motivo_quarentena, hash_payload
        ) VALUES (?, ?, ?, ?, ?, ?, ?, 'aprovado', NULL, ?)
    """, (fonte, entidade_tipo, id_externo, nome_bruto, json.dumps(payload),
          completude, confianca, hash_p))
    staging_id = cursor.lastrowid

    # Indexar aliases versionados se resolvido ou criado
    if entidade_id:
        for alias in aliases:
            cursor.execute("""
                INSERT OR IGNORE INTO dim_entidades_aliases (
                    tipo_entidade, entidade_id, alias_nome, fonte, confianca
                ) VALUES (?, ?, ?, ?, 0.95)
            """, (entidade_tipo, entidade_id, alias, fonte))

    conn.commit()
    return {
        'status': 'aprovado',
        'staging_id': staging_id,
        'entidade_id': entidade_id,
        'hash': hash_p
    }
