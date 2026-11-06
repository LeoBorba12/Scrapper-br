# -*- coding: utf-8 -*-
"""
backend/rotas_metricas_avancadas.py
======================================================================
Endpoints REST para Métricas Avançadas — Brasileirão em Dados / DataFutebol 2026.

Regras de Governança:
- Somente leitura (read-only).
- Identificadores primários: atleta_id_canonico e clube_id_canonico (bed_id nunca é exposto como ID primário).
- Não expõe atletas em quarentena ou sem ID canônico definitivo (7 novos atletas).
- Não expõe coordenadas x/y, mapas brutos ou eventos espaciais do FotMob.
- Metadados com fonte e atribuição legal obrigatória em todas as respostas.
- Suporta parâmetros: clube_id_canonico, posicao, minimo_minutos, ordenacao, limite, pagina.
"""

import os
import json
import sqlite3
from flask import Blueprint, request, jsonify

metricas_avancadas_bp = Blueprint('metricas_avancadas', __name__)

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DB_PATH = os.path.join(BASE_DIR, "data", "futebol.db")

FONTE_OFICIAL = "brasileiraoemdados.com.br"
ATRIBUICAO_OFICIAL = "Brasileirão em Dados / DataFutebol (Ioannis Canteiro) - tracking FotMob"
SCHEMA_VERSAO = "v1.0-producao-2026"

# Constantes homologadas da Fase 4 & 4.1
CANONICAL_ATLETAS_COUNT = 717
CANONICAL_CLUBES_COUNT = 20
CANONICAL_GOLS_SOMA = 853.0
CANONICAL_XG_SOMA = 856.4
CANONICAL_MINUTOS_LIGA = 59421  # 60.840 min da liga - 1.419 min de atletas bloqueados
CANONICAL_MINUTOS_INDIVIDUAIS = 658192

_CACHE_ATLETAS_DETALHE = None
_CACHE_CLUBES_DETALHE = None

def _get_detalhe_atleta_extra(atleta_id):
    global _CACHE_ATLETAS_DETALHE
    if _CACHE_ATLETAS_DETALHE is None:
        path = os.path.join(BASE_DIR, "data", "staging", "brasileirao_em_dados", "metricas_atletas_2026.json")
        if os.path.exists(path):
            try:
                with open(path, "r", encoding="utf-8") as f:
                    raw = json.load(f)
                _CACHE_ATLETAS_DETALHE = {
                    a["atleta_id_canonico"]: a.get("metricas", {})
                    for a in raw if a.get("elegivel_producao") and a.get("atleta_id_canonico")
                }
            except Exception:
                _CACHE_ATLETAS_DETALHE = {}
        else:
            _CACHE_ATLETAS_DETALHE = {}
    return _CACHE_ATLETAS_DETALHE.get(atleta_id, {})

def _get_detalhe_clube_extra(clube_id):
    global _CACHE_CLUBES_DETALHE
    if _CACHE_CLUBES_DETALHE is None:
        path = os.path.join(BASE_DIR, "data", "staging", "brasileirao_em_dados", "metricas_clubes_2026.json")
        if os.path.exists(path):
            try:
                with open(path, "r", encoding="utf-8") as f:
                    raw = json.load(f)
                _CACHE_CLUBES_DETALHE = {
                    c["clube_id_canonico"]: c.get("metricas", {})
                    for c in raw if c.get("clube_id_canonico")
                }
            except Exception:
                _CACHE_CLUBES_DETALHE = {}
        else:
            _CACHE_CLUBES_DETALHE = {}
    return _CACHE_CLUBES_DETALHE.get(clube_id, {})

def get_readonly_db():
    conn = None
    if os.path.exists(DB_PATH):
        try:
            conn = sqlite3.connect(f"file:{DB_PATH}?immutable=1", uri=True, timeout=15)
        except Exception:
            try:
                conn = sqlite3.connect(f"file:{DB_PATH}?mode=ro", uri=True, timeout=15)
            except Exception:
                conn = sqlite3.connect(DB_PATH, timeout=15)
    else:
        conn = sqlite3.connect(DB_PATH, timeout=15)
    conn.row_factory = sqlite3.Row
    return conn

def build_metadata(extra=None):
    meta = {
        "fonte": FONTE_OFICIAL,
        "atribuicao": ATRIBUICAO_OFICIAL,
        "temporada": 2026,
        "competicao": "Campeonato Brasileiro Série A",
        "schema_versao": SCHEMA_VERSAO
    }
    if extra:
        meta.update(extra)
    return meta

# -------------------------------------------------------------
# 1. METADADOS E SUMÁRIO EXECUTIVO DA COBERTURA AVANÇADA
# -------------------------------------------------------------
@metricas_avancadas_bp.route('/api/metricas-avancadas/meta', methods=['GET'])
def get_metadata():
    conn = get_readonly_db()
    c = conn.cursor()
    try:
        c.execute("""
            SELECT 
                COUNT(*) as total_atletas,
                ROUND(SUM(gols), 1) as soma_gols,
                ROUND(SUM(xg), 1) as soma_xg,
                ROUND(SUM(xa), 1) as soma_xa,
                SUM(minutos) as soma_minutos_individuais
            FROM metrica_atleta_avancada_2026;
        """)
        row_atl = dict(c.fetchone())

        c.execute("SELECT COUNT(*) as total_clubes FROM metrica_clube_avancada_2026;")
        row_clb = dict(c.fetchone())

        return jsonify({
            "sucesso": True,
            "metadados": build_metadata({
                "atletas_elegiveis": row_atl["total_atletas"],
                "clubes_participantes": row_clb["total_clubes"],
                "soma_gols_atletas": row_atl["soma_gols"],
                "soma_xg_atletas": row_atl["soma_xg"],
                "soma_xa_atletas": row_atl["soma_xa"],
                "soma_minutos_liga_elegiveis": CANONICAL_MINUTOS_LIGA,
                "soma_minutos_individuais_atletas": row_atl["soma_minutos_individuais"]
            })
        })
    finally:
        conn.close()

# -------------------------------------------------------------
# 2. LISTAGEM DE ATLETAS COM FILTROS E PAGINAÇÃO
# -------------------------------------------------------------
@metricas_avancadas_bp.route('/api/metricas-avancadas/atletas', methods=['GET'])
def get_atletas():
    # Parâmetros com suporte a nomes em português e legados
    clube_id = request.args.get('clube_id_canonico', type=int)
    if clube_id is None:
        clube_id = request.args.get('clube_id', type=int)

    posicao = request.args.get('posicao', type=str)

    min_minutos = request.args.get('minimo_minutos', type=int)
    if min_minutos is None:
        min_minutos = request.args.get('min_minutos', default=0, type=int)

    ordenacao = request.args.get('ordenacao', type=str)
    if not ordenacao:
        ordenacao = request.args.get('ordenar_por', default='xg', type=str)
    ordenacao = ordenacao.lower()

    ordem = request.args.get('ordem', default='desc', type=str).upper()

    limite = request.args.get('limite', default=50, type=int)
    limite = max(1, min(limite, CANONICAL_ATLETAS_COUNT))

    pagina = request.args.get('pagina', default=1, type=int)
    if pagina < 1:
        pagina = 1

    offset = request.args.get('offset', type=int)
    if offset is None:
        offset = (pagina - 1) * limite

    colunas_permitidas = {
        'xg': 'm.xg',
        'npxg': 'm.npxg',
        'xa': 'm.xa',
        'gols': 'm.gols',
        'gols_sem_penalti': 'm.gols_sem_penalti',
        'gols_penalti': 'm.gols_penalti',
        'assistencias': 'm.assistencias',
        'minutos': 'm.minutos',
        'jogos': 'm.jogos',
        'titularidades': 'm.titularidades',
        'passes_progressivos': 'm.passes_progressivos',
        'sca': 'm.sca',
        'gca': 'm.gca',
        'finalizacoes': 'm.finalizacoes',
        'passes': 'm.passes'
    }
    campo_ordem = colunas_permitidas.get(ordenacao, 'm.xg')
    dir_ordem = 'ASC' if ordem == 'ASC' else 'DESC'

    conn = get_readonly_db()
    c = conn.cursor()
    try:
        where_clauses = ["1=1"]
        params = []

        if clube_id:
            where_clauses.append("m.clube_id_canonico = ?")
            params.append(clube_id)

        if min_minutos > 0:
            where_clauses.append("m.minutos >= ?")
            params.append(min_minutos)

        if posicao:
            where_clauses.append("(LOWER(j.posicao) LIKE ? OR LOWER(COALESCE(j.apelido, '')) LIKE ?)")
            params.append(f"%{posicao.lower()}%")
            params.append(f"%{posicao.lower()}%")

        where_sql = " AND ".join(where_clauses)

        # Contagem total
        c.execute(f"""
            SELECT COUNT(*) 
            FROM metrica_atleta_avancada_2026 m
            LEFT JOIN jogadores j ON m.atleta_id_canonico = j.id_jogador
            WHERE {where_sql}
        """, params)
        total_filtrado = c.fetchone()[0]

        # Consulta enriquecida (nunca expõe bed_id como ID primário)
        query = f"""
            SELECT 
                m.atleta_id_canonico,
                COALESCE(j.nome_exibicao, j.apelido, j.nome_completo, 'Atleta #' || m.atleta_id_canonico) as nome,
                j.posicao,
                m.clube_id_canonico,
                COALESCE(c.nome, 'Clube #' || m.clube_id_canonico) as clube_nome,
                COALESCE(c.sigla, '') as clube_sigla,
                m.minutos,
                m.jogos,
                m.titularidades,
                m.gols,
                m.gols_sem_penalti,
                m.gols_penalti,
                m.assistencias,
                m.xg,
                m.npxg,
                m.xa,
                m.finalizacoes,
                m.passes,
                m.passes_progressivos,
                m.sca,
                m.gca,
                m.cartoes_amarelos,
                m.cartoes_vermelhos,
                ROUND(CAST(m.xg AS REAL) / MAX(CAST(m.minutos AS REAL) / 90.0, 0.1), 2) as xg_por_90,
                ROUND(CAST(m.xa AS REAL) / MAX(CAST(m.minutos AS REAL) / 90.0, 0.1), 2) as xa_por_90,
                ROUND(CAST(m.passes_progressivos AS REAL) / MAX(CAST(m.minutos AS REAL) / 90.0, 0.1), 2) as passes_prog_por_90,
                ROUND(CAST(m.sca AS REAL) / MAX(CAST(m.minutos AS REAL) / 90.0, 0.1), 2) as sca_por_90,
                ROUND(CAST(m.gca AS REAL) / MAX(CAST(m.minutos AS REAL) / 90.0, 0.1), 2) as gca_por_90
            FROM metrica_atleta_avancada_2026 m
            LEFT JOIN jogadores j ON m.atleta_id_canonico = j.id_jogador
            LEFT JOIN dim_clube c ON m.clube_id_canonico = c.clube_id
            WHERE {where_sql}
            ORDER BY {campo_ordem} {dir_ordem}
            LIMIT ? OFFSET ?;
        """
        params_consulta = params + [limite, offset]
        c.execute(query, params_consulta)
        atletas = [dict(r) for r in c.fetchall()]

        total_paginas = max(1, (total_filtrado + limite - 1) // limite)

        return jsonify({
            "sucesso": True,
            "metadados": build_metadata({
                "total_atletas_base": CANONICAL_ATLETAS_COUNT,
                "total_filtrado": total_filtrado,
                "limite": limite,
                "pagina": pagina,
                "total_paginas": total_paginas,
                "ordenacao": ordenacao,
                "ordem": dir_ordem
            }),
            "total": total_filtrado,
            "pagina": pagina,
            "total_paginas": total_paginas,
            "atletas": atletas
        })
    finally:
        conn.close()

# -------------------------------------------------------------
# 3. DETALHE DE UM ATLETA POR ID CANÔNICO
# -------------------------------------------------------------
@metricas_avancadas_bp.route('/api/metricas-avancadas/atletas/<int:atleta_id>', methods=['GET'])
def get_atleta_detalhe(atleta_id):
    conn = get_readonly_db()
    c = conn.cursor()
    try:
        query = """
            SELECT 
                m.atleta_id_canonico,
                COALESCE(j.nome_exibicao, j.apelido, j.nome_completo, 'Atleta #' || m.atleta_id_canonico) as nome,
                j.nome_completo,
                j.posicao,
                m.clube_id_canonico,
                COALESCE(c.nome, 'Clube #' || m.clube_id_canonico) as clube_nome,
                COALESCE(c.sigla, '') as clube_sigla,
                m.minutos,
                m.jogos,
                m.titularidades,
                m.gols,
                m.gols_sem_penalti,
                m.gols_penalti,
                m.assistencias,
                m.xg,
                m.npxg,
                m.xa,
                m.finalizacoes,
                m.passes,
                m.passes_progressivos,
                m.sca,
                m.gca,
                m.cartoes_amarelos,
                m.cartoes_vermelhos,
                p.status_reconciliacao,
                p.metodo_reconciliacao,
                p.coletado_em,
                ROUND(CAST(m.xg AS REAL) / MAX(CAST(m.minutos AS REAL) / 90.0, 0.1), 2) as xg_por_90,
                ROUND(CAST(m.xa AS REAL) / MAX(CAST(m.minutos AS REAL) / 90.0, 0.1), 2) as xa_por_90,
                ROUND(CAST(m.passes_progressivos AS REAL) / MAX(CAST(m.minutos AS REAL) / 90.0, 0.1), 2) as passes_prog_por_90,
                ROUND(CAST(m.sca AS REAL) / MAX(CAST(m.minutos AS REAL) / 90.0, 0.1), 2) as sca_por_90,
                ROUND(CAST(m.gca AS REAL) / MAX(CAST(m.minutos AS REAL) / 90.0, 0.1), 2) as gca_por_90
            FROM metrica_atleta_avancada_2026 m
            LEFT JOIN jogadores j ON m.atleta_id_canonico = j.id_jogador
            LEFT JOIN dim_clube c ON m.clube_id_canonico = c.clube_id
            LEFT JOIN metrica_brasileirao_em_dados_proveniencia p 
                ON p.escopo = 'ATLETA' AND p.entidade_id_canonico = m.atleta_id_canonico
            WHERE m.atleta_id_canonico = ?;
        """
        c.execute(query, (atleta_id,))
        row = c.fetchone()
        if not row:
            return jsonify({
                "sucesso": False,
                "erro": f"Atleta canônico #{atleta_id} não possui métricas avançadas ativas em 2026."
            }), 404

        atleta_dict = dict(row)
        extra = _get_detalhe_atleta_extra(atleta_id)
        if extra:
            atleta_dict.update({
                "finalizacoes_no_alvo": extra.get("finalizacoes_no_alvo", 0),
                "pontaria_pct": round(extra.get("finalizacoes_no_alvo", 0) / max(extra.get("finalizacoes", 1), 1) * 100, 1),
                "passes_decisivos": extra.get("passes_decisivos", 0),
                "grandes_chances_criadas": extra.get("grandes_chances_criadas", 0),
                "conducoes": extra.get("conducoes", 0),
                "conducoes_progressivas": extra.get("conducoes_progressivas", 0),
                "dribles_tentados": extra.get("dribles_tentados", 0),
                "dribles_certos": extra.get("dribles_certos", 0),
                "desarmes_totais": extra.get("desarmes_totais", 0),
                "desarmes_ganhos": extra.get("desarmes_ganhos", 0),
                "interceptacoes": extra.get("interceptacoes", 0),
                "cortes": extra.get("cortes", 0),
                "recuperacoes": extra.get("recuperacoes", 0),
                "duelos_aereos_ganhos": extra.get("duelos_aereos_ganhos", 0),
                "duelos_chao_ganhos": extra.get("duelos_chao_ganhos", 0)
            })

        return jsonify({
            "sucesso": True,
            "metadados": build_metadata(),
            "atleta": atleta_dict
        })
    finally:
        conn.close()

# -------------------------------------------------------------
# 4. LISTAGEM DOS 20 CLUBES DA SÉRIE A 2026
# -------------------------------------------------------------
@metricas_avancadas_bp.route('/api/metricas-avancadas/clubes', methods=['GET'])
def get_clubes():
    ordenacao = request.args.get('ordenacao', default='pontos', type=str).lower()
    ordem = request.args.get('ordem', default='desc', type=str).upper()
    limite = min(request.args.get('limite', default=20, type=int), 20)
    pagina = max(1, request.args.get('pagina', default=1, type=int))
    offset = (pagina - 1) * limite

    colunas_permitidas = {
        'pontos': 'm.pontos',
        'xg': 'm.xg',
        'xg_contra': 'm.xg_contra',
        'xpts': 'm.xpts',
        'posse_pct': 'm.posse_pct',
        'field_tilt_pct': 'm.field_tilt_pct',
        'ppda': 'm.ppda',
        'altura_defensiva': 'm.altura_defensiva',
        'gols_pro': 'm.gols_pro',
        'gols_contra': 'm.gols_contra'
    }
    campo_ordem = colunas_permitidas.get(ordenacao, 'm.pontos')
    dir_ordem = 'ASC' if ordem == 'ASC' else 'DESC'

    conn = get_readonly_db()
    c = conn.cursor()
    try:
        query = f"""
            SELECT 
                m.clube_id_canonico,
                COALESCE(c.nome, 'Clube #' || m.clube_id_canonico) as clube_nome,
                COALESCE(c.sigla, '') as clube_sigla,
                m.jogos,
                m.vitorias,
                m.empates,
                m.derrotas,
                m.pontos,
                m.gols_pro,
                m.gols_contra,
                m.xg,
                m.xg_contra,
                m.xpts,
                m.posse_pct,
                m.field_tilt_pct,
                m.ppda,
                m.altura_defensiva,
                ROUND(m.xg - m.gols_pro, 2) as saldo_xg_ofensivo,
                ROUND(m.gols_contra - m.xg_contra, 2) as performance_defensiva,
                ROUND(m.xg - m.xg_contra, 2) as saldo_xg_liquido
            FROM metrica_clube_avancada_2026 m
            LEFT JOIN dim_clube c ON m.clube_id_canonico = c.clube_id
            ORDER BY {campo_ordem} {dir_ordem}, m.xg DESC
            LIMIT ? OFFSET ?;
        """
        c.execute(query, (limite, offset))
        clubes = [dict(r) for r in c.fetchall()]

        return jsonify({
            "sucesso": True,
            "metadados": build_metadata({
                "total_clubes_base": CANONICAL_CLUBES_COUNT,
                "limite": limite,
                "pagina": pagina,
                "ordenacao": ordenacao
            }),
            "total": CANONICAL_CLUBES_COUNT,
            "clubes": clubes
        })
    finally:
        conn.close()

# -------------------------------------------------------------
# 5. DETALHE DE UM CLUBE COM SEU ELENCO AVANÇADO
# -------------------------------------------------------------
@metricas_avancadas_bp.route('/api/metricas-avancadas/clubes/<int:clube_id>', methods=['GET'])
def get_clube_detalhe(clube_id):
    conn = get_readonly_db()
    c = conn.cursor()
    try:
        # Dados do clube
        c.execute("""
            SELECT 
                m.clube_id_canonico,
                COALESCE(c.nome, 'Clube #' || m.clube_id_canonico) as clube_nome,
                COALESCE(c.sigla, '') as clube_sigla,
                m.jogos,
                m.vitorias,
                m.empates,
                m.derrotas,
                m.pontos,
                m.gols_pro,
                m.gols_contra,
                m.xg,
                m.xg_contra,
                m.xpts,
                m.posse_pct,
                m.field_tilt_pct,
                m.ppda,
                m.altura_defensiva,
                ROUND(m.xg - m.xg_contra, 2) as saldo_xg_liquido
            FROM metrica_clube_avancada_2026 m
            LEFT JOIN dim_clube c ON m.clube_id_canonico = c.clube_id
            WHERE m.clube_id_canonico = ?;
        """, (clube_id,))
        row_clube = c.fetchone()
        if not row_clube:
            return jsonify({
                "sucesso": False,
                "erro": f"Clube canônico #{clube_id} não possui métricas avançadas em 2026."
            }), 404

        # Elenco do clube
        c.execute("""
            SELECT 
                m.atleta_id_canonico,
                COALESCE(j.nome_exibicao, j.apelido, j.nome_completo, 'Atleta #' || m.atleta_id_canonico) as nome,
                j.posicao,
                m.minutos,
                m.jogos,
                m.titularidades,
                m.gols,
                m.assistencias,
                m.xg,
                m.npxg,
                m.xa,
                m.passes_progressivos,
                m.sca,
                m.gca,
                ROUND(CAST(m.xg AS REAL) / MAX(CAST(m.minutos AS REAL) / 90.0, 0.1), 2) as xg_por_90,
                ROUND(CAST(m.xa AS REAL) / MAX(CAST(m.minutos AS REAL) / 90.0, 0.1), 2) as xa_por_90
            FROM metrica_atleta_avancada_2026 m
            LEFT JOIN jogadores j ON m.atleta_id_canonico = j.id_jogador
            WHERE m.clube_id_canonico = ?
            ORDER BY m.minutos DESC;
        """, (clube_id,))
        elenco = [dict(r) for r in c.fetchall()]

        clube_dict = dict(row_clube)
        extra_c = _get_detalhe_clube_extra(clube_id)
        if extra_c:
            clube_dict.update({
                "passes_totais": extra_c.get("passes_totais", 0),
                "passes_terco_defensivo": extra_c.get("passes_terco_defensivo", 0),
                "passes_terco_central": extra_c.get("passes_terco_central", 0),
                "passes_terco_final": extra_c.get("passes_terco_final", 0),
                "passes_na_area": extra_c.get("passes_na_area", 0),
                "clean_sheets": extra_c.get("clean_sheets", 0)
            })

        return jsonify({
            "sucesso": True,
            "metadados": build_metadata(),
            "clube": clube_dict,
            "elenco": elenco
        })
    finally:
        conn.close()

# -------------------------------------------------------------
# 6. RANKINGS MULTI-MÉTRICAS (xG, xA, Passes Prog., SCA, GCA)
# -------------------------------------------------------------
@metricas_avancadas_bp.route('/api/metricas-avancadas/rankings', methods=['GET'])
def get_rankings():
    # Parâmetros
    metrica = request.args.get('metrica', type=str)
    if not metrica:
        metrica = request.args.get('ordenacao', default='xg', type=str)
    metrica = metrica.lower()

    min_minutos = request.args.get('minimo_minutos', type=int)
    if min_minutos is None:
        min_minutos = request.args.get('min_minutos', default=450, type=int)

    clube_id = request.args.get('clube_id_canonico', type=int)
    if clube_id is None:
        clube_id = request.args.get('clube_id', type=int)

    posicao = request.args.get('posicao', type=str)
    limite = min(request.args.get('limite', default=20, type=int), 100)
    pagina = max(1, request.args.get('pagina', default=1, type=int))
    offset = (pagina - 1) * limite

    metricas_map = {
        'xg': ('m.xg', 'Gols Esperados (xG)'),
        'npxg': ('m.npxg', 'xG sem Pênaltis (npxG)'),
        'xa': ('m.xa', 'Assistências Esperadas (xA)'),
        'passes_progressivos': ('m.passes_progressivos', 'Passes Progressivos'),
        'sca': ('m.sca', 'Criação de Finalizações (SCA)'),
        'gca': ('m.gca', 'Criação de Gols (GCA)'),
        'gols': ('m.gols', 'Gols Marcados'),
        'assistencias': ('m.assistencias', 'Assistências')
    }

    if metrica not in metricas_map:
        return jsonify({
            "sucesso": False,
            "erro": f"Métrica inválida '{metrica}'. Escolha entre: {', '.join(metricas_map.keys())}"
        }), 400

    col_nome, metrica_label = metricas_map[metrica]

    conn = get_readonly_db()
    c = conn.cursor()
    try:
        where_clauses = ["m.minutos >= ?"]
        params = [min_minutos]

        if clube_id:
            where_clauses.append("m.clube_id_canonico = ?")
            params.append(clube_id)

        if posicao:
            where_clauses.append("(LOWER(j.posicao) LIKE ? OR LOWER(COALESCE(j.apelido, '')) LIKE ?)")
            params.append(f"%{posicao.lower()}%")
            params.append(f"%{posicao.lower()}%")

        where_sql = " AND ".join(where_clauses)

        query = f"""
            SELECT 
                m.atleta_id_canonico,
                COALESCE(j.nome_exibicao, j.apelido, j.nome_completo, 'Atleta #' || m.atleta_id_canonico) as nome,
                j.posicao,
                m.clube_id_canonico,
                COALESCE(c.nome, 'Clube #' || m.clube_id_canonico) as clube_nome,
                COALESCE(c.sigla, '') as clube_sigla,
                m.minutos,
                m.jogos,
                {col_nome} as valor,
                ROUND(CAST({col_nome} AS REAL) / MAX(CAST(m.minutos AS REAL) / 90.0, 0.1), 2) as valor_por_90,
                m.gols,
                m.xg,
                m.xa,
                m.passes_progressivos,
                m.sca,
                m.gca
            FROM metrica_atleta_avancada_2026 m
            LEFT JOIN jogadores j ON m.atleta_id_canonico = j.id_jogador
            LEFT JOIN dim_clube c ON m.clube_id_canonico = c.clube_id
            WHERE {where_sql}
            ORDER BY {col_nome} DESC, m.minutos ASC
            LIMIT ? OFFSET ?;
        """
        params.extend([limite, offset])
        c.execute(query, params)
        lideres = [dict(r) for r in c.fetchall()]

        return jsonify({
            "sucesso": True,
            "metadados": build_metadata({
                "metrica_solicitada": metrica,
                "metrica_label": metrica_label,
                "minimo_minutos": min_minutos,
                "limite": limite,
                "pagina": pagina,
                "total_retornado": len(lideres)
            }),
            "ranking": lideres
        })
    finally:
        conn.close()
