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
                ROUND(CAST(m.gca AS REAL) / MAX(CAST(m.minutos AS REAL) / 90.0, 0.1), 2) as gca_por_90,
                COALESCE(pg.conducoes_progressivas, 0) as conducoes_progressivas,
                COALESCE(pg.passes_decisivos, 0) as passes_decisivos,
                COALESCE(pg.passes_terco_final, 0) as passes_terco_final,
                COALESCE(pg.passes_para_area, 0) as passes_para_area,
                COALESCE(pg.grandes_chances_criadas, 0) as grandes_chances_criadas,
                COALESCE(pg.dribles_certos, 0) as dribles_certos,
                COALESCE(pg.dribles_tentados, 0) as dribles_tentados,
                COALESCE(pg.recuperacoes, 0) as recuperacoes,
                COALESCE(pg.duelos_aereos_ganhos, 0) as duelos_aereos_ganhos,
                COALESCE(pg.duelos_chao_ganhos, 0) as duelos_chao_ganhos,
                COALESCE(dg.desarmes_ganhos, 0) as desarmes_totais,
                COALESCE(dg.interceptacoes, 0) as interceptacoes,
                COALESCE(dg.cortes, 0) as cortes
            FROM metrica_atleta_avancada_2026 m
            LEFT JOIN metrica_atleta_progressao_2026 pg ON m.atleta_id_canonico = pg.atleta_id_canonico
            LEFT JOIN metrica_atleta_defesa_gk_2026 dg ON m.atleta_id_canonico = dg.atleta_id_canonico
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
    apenas_sub23 = request.args.get('sub23', default='0', type=str).strip() in ('1', 'true', 'True')
    limite = min(request.args.get('limite', default=20, type=int), 100)
    pagina = max(1, request.args.get('pagina', default=1, type=int))
    offset = (pagina - 1) * limite

    metricas_map = {
        'xg': ('m.xg', 'Gols Esperados (xG)'),
        'npxg': ('m.npxg', 'xG sem Pênaltis (npxG)'),
        'xa': ('m.xa', 'Assistências Esperadas (xA)'),
        'passes_progressivos': ('m.passes_progressivos', 'Passes Progressivos'),
        'conducoes_progressivas': ('COALESCE(pg.conducoes_progressivas, 0)', 'Conduções Progressivas'),
        'passes_decisivos': ('COALESCE(pg.passes_decisivos, 0)', 'Passes Decisivos'),
        'passes_terco_final': ('COALESCE(pg.passes_terco_final, 0)', 'Passes Terço Final'),
        'grandes_chances_criadas': ('COALESCE(pg.grandes_chances_criadas, 0)', 'Grandes Chances Criadas'),
        'dribles_certos': ('COALESCE(pg.dribles_certos, 0)', 'Dribles Certos'),
        'recuperacoes': ('COALESCE(pg.recuperacoes, 0)', 'Recuperações'),
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

        if apenas_sub23:
            where_clauses.append("(je.idade IS NOT NULL AND je.idade <= 23)")

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
                je.idade,
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
                COALESCE(pg.conducoes_progressivas, 0) as conducoes_progressivas,
                COALESCE(pg.passes_decisivos, 0) as passes_decisivos,
                COALESCE(pg.dribles_certos, 0) as dribles_certos,
                COALESCE(pg.recuperacoes, 0) as recuperacoes,
                m.sca,
                m.gca
            FROM metrica_atleta_avancada_2026 m
            LEFT JOIN metrica_atleta_progressao_2026 pg ON m.atleta_id_canonico = pg.atleta_id_canonico
            LEFT JOIN jogadores j ON m.atleta_id_canonico = j.id_jogador
            LEFT JOIN jogadores_estatisticas je ON m.atleta_id_canonico = je.id_jogador
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


# -------------------------------------------------------------
# 7. MOTOR ECONOMÉTRICO: ÍNDICE DE ATLETAS (EMPIRICAL BAYES P90)
# -------------------------------------------------------------
@metricas_avancadas_bp.route('/api/metricas-avancadas/econometria/atletas', methods=['GET'])
def get_econometria_atletas():
    posicao = request.args.get('posicao', default='', type=str).strip()
    min_minutos = max(90, request.args.get('min_minutos', default=270, type=int))
    k_prior = max(90.0, min(1800.0, request.args.get('k_prior', default=450.0, type=float)))
    apenas_sub23 = request.args.get('sub23', default='0', type=str).strip() in ('1', 'true', 'True')
    limite = min(request.args.get('limite', default=50, type=int), 100)

    try:
        from backend.motor_econometrico import calcular_indice_atletas
    except ImportError:
        from motor_econometrico import calcular_indice_atletas

    conn = get_readonly_db()
    c = conn.cursor()
    try:
        c.execute("""
            SELECT
                m.atleta_id_canonico,
                COALESCE(j.nome_exibicao, j.apelido, j.nome_completo, 'Atleta #' || m.atleta_id_canonico) as nome,
                COALESCE(j.posicao, 'Atacante') as posicao,
                m.clube_id_canonico,
                COALESCE(c.nome, 'Clube #' || m.clube_id_canonico) as clube_nome,
                COALESCE(c.sigla, '') as clube_sigla,
                COALESCE(mc.posse_pct, 50.0) as posse_pct,
                je.idade as idade,
                COALESCE(je.gols_decisivos_80mais, 0) as gols_decisivos_80mais,
                COALESCE(dg.desarmes_ganhos, 0) as desarmes_ganhos,
                COALESCE(dg.interceptacoes, 0) as interceptacoes,
                COALESCE(dg.cortes, 0) as cortes,
                m.minutos,
                m.jogos,
                m.gols,
                m.assistencias,
                m.npxg,
                m.xa,
                m.sca,
                m.gca,
                m.passes_progressivos
            FROM metrica_atleta_avancada_2026 m
            LEFT JOIN jogadores j ON m.atleta_id_canonico = j.id_jogador
            LEFT JOIN jogadores_estatisticas je ON m.atleta_id_canonico = je.id_jogador
            LEFT JOIN dim_clube c ON m.clube_id_canonico = c.clube_id
            LEFT JOIN metrica_clube_avancada_2026 mc ON m.clube_id_canonico = mc.clube_id_canonico
            LEFT JOIN metrica_atleta_defesa_gk_2026 dg ON m.atleta_id_canonico = dg.atleta_id_canonico
            WHERE m.minutos > 0;
        """)
        rows = [dict(r) for r in c.fetchall()]

        res = calcular_indice_atletas(
            rows,
            k_prior=k_prior,
            min_minutos=min_minutos,
            filtro_posicao=posicao,
            apenas_sub23=apenas_sub23,
            limite=limite,
        )
        return jsonify({
            "sucesso": True,
            "metadados": build_metadata({
                "metodo": "Empirical Bayes Shrinkage p90 + Defesa PAdj + Z-Score por Posição",
                "k_prior": k_prior,
                "min_minutos": min_minutos,
                "filtro_posicao": posicao or "Todas",
                "apenas_sub23": apenas_sub23,
                "total_elegiveis": res["total_elegiveis"],
            }),
            **res
        })
    finally:
        conn.close()


# -------------------------------------------------------------
# 8. MOTOR ECONOMÉTRICO: POWER RANKING & EFICIÊNCIA DE CLUBES
# -------------------------------------------------------------
@metricas_avancadas_bp.route('/api/metricas-avancadas/econometria/clubes', methods=['GET'])
def get_econometria_clubes():
    try:
        from backend.motor_econometrico import calcular_ranking_clubes_econometrico
    except ImportError:
        from motor_econometrico import calcular_ranking_clubes_econometrico

    conn = get_readonly_db()
    c = conn.cursor()
    try:
        c.execute("""
            SELECT
                m.clube_id_canonico,
                COALESCE(c.nome, 'Clube #' || m.clube_id_canonico) as nome,
                COALESCE(c.sigla, '') as sigla,
                m.jogos,
                m.pontos,
                m.gols_pro,
                m.gols_contra,
                m.xg,
                m.xg_contra,
                m.xpts,
                m.posse_pct,
                m.field_tilt_pct,
                m.ppda,
                m.altura_defensiva
            FROM metrica_clube_avancada_2026 m
            LEFT JOIN dim_clube c ON m.clube_id_canonico = c.clube_id;
        """)
        rows = [dict(r) for r in c.fetchall()]
        ranking = calcular_ranking_clubes_econometrico(rows)
        return jsonify({
            "sucesso": True,
            "metadados": build_metadata({
                "metodo": "Power Ranking Composto (xPTS 45%, Saldo xG 30%, Field Tilt 15%, PPDA 10%)",
                "total_clubes": len(ranking),
            }),
            "clubes": ranking,
        })
    finally:
        conn.close()


# -------------------------------------------------------------
# 9. MOTOR ECONOMÉTRICO (FASE 2): RAPM VIA REGRESSÃO RIDGE
# -------------------------------------------------------------
@metricas_avancadas_bp.route('/api/metricas-avancadas/econometria/rapm', methods=['GET'])
def get_econometria_rapm():
    min_jogos = max(5, request.args.get('min_jogos', default=15, type=int))
    limite = min(request.args.get('limite', default=30, type=int), 100)

    conn = get_readonly_db()
    c = conn.cursor()
    try:
        try:
            c.execute(
                """
                SELECT id_jogador, nome, clube_recente, jogos_titular,
                       rapm_saldo_gols, rapm_score_0_100, alpha_ridge,
                       mando_efeito, temporadas, atualizado_em
                FROM atleta_rapm_scores
                WHERE jogos_titular >= ?
                ORDER BY rapm_saldo_gols DESC, jogos_titular DESC
                LIMIT ?;
                """,
                (min_jogos, limite),
            )
            rows = [dict(r) for r in c.fetchall()]
        except sqlite3.OperationalError:
            rows = []

        for idx, r in enumerate(rows, start=1):
            r["rank_rapm"] = idx

        mando_ref = rows[0]["mando_efeito"] if rows else 0.0
        return jsonify({
            "sucesso": True,
            "metadados": build_metadata({
                "metodo": "RAPM (Regularized Adjusted Plus-Minus via Regressão Ridge L2)",
                "min_jogos": min_jogos,
                "mando_efeito_gols": mando_ref,
                "total_retornado": len(rows),
            }),
            "ranking": rows,
        })
    finally:
        conn.close()


# -------------------------------------------------------------
# 10. MOTOR ECONOMÉTRICO (FASE 3): RANKING DE GOLEIROS (DEFESAS EB)
# -------------------------------------------------------------
@metricas_avancadas_bp.route('/api/metricas-avancadas/econometria/goleiros', methods=['GET'])
def get_econometria_goleiros():
    k_prior = max(90.0, min(1800.0, request.args.get('k_prior', default=450.0, type=float)))
    min_minutos = max(90, request.args.get('min_minutos', default=270, type=int))
    limite = min(request.args.get('limite', default=20, type=int), 50)

    try:
        from backend.motor_econometrico import calcular_ranking_goleiros_econometrico
    except ImportError:
        from motor_econometrico import calcular_ranking_goleiros_econometrico

    conn = get_readonly_db()
    c = conn.cursor()
    try:
        c.execute("""
            SELECT
                m.atleta_id_canonico,
                COALESCE(j.nome_exibicao, j.apelido, j.nome_completo, 'Goleiro #' || m.atleta_id_canonico) as nome,
                COALESCE(c.nome, 'Clube #' || m.clube_id_canonico) as clube_nome,
                m.minutos,
                COALESCE(dg.defesas_goleiro, 0) as defesas_goleiro,
                COALESCE(dg.defesas_na_area, 0) as defesas_na_area,
                COALESCE(pg.xg_sofrido_goleiro, 0) as xg_sofrido_goleiro
            FROM metrica_atleta_avancada_2026 m
            JOIN metrica_atleta_defesa_gk_2026 dg ON m.atleta_id_canonico = dg.atleta_id_canonico
            LEFT JOIN metrica_atleta_progressao_2026 pg ON m.atleta_id_canonico = pg.atleta_id_canonico
            LEFT JOIN jogadores j ON m.atleta_id_canonico = j.id_jogador
            LEFT JOIN dim_clube c ON m.clube_id_canonico = c.clube_id
            WHERE m.minutos >= ? AND dg.defesas_goleiro > 0;
        """, (min_minutos,))
        rows = [dict(r) for r in c.fetchall()]

        ranking = calcular_ranking_goleiros_econometrico(rows, k_prior=k_prior, min_minutos=min_minutos, limite=limite)
        return jsonify({
            "sucesso": True,
            "metadados": build_metadata({
                "metodo": "Empirical Bayes p90 para Defesas Totais (55%) e Defesas na Área (45%)",
                "k_prior": k_prior,
                "total_goleiros": len(ranking),
            }),
            "goleiros": ranking,
        })
    finally:
        conn.close()


# -------------------------------------------------------------
# 11. BUSCADOR DE JOGADORES SIMILARES (COSSENO 9D)
# -------------------------------------------------------------
@metricas_avancadas_bp.route('/api/metricas-avancadas/econometria/similares', methods=['GET'])
def get_econometria_similares():
    atleta_id = request.args.get('atleta_id', type=int)
    if not atleta_id:
        return jsonify({"sucesso": False, "erro": "Informe atleta_id."}), 400

    limite = min(max(1, request.args.get('limite', default=8, type=int)), 15)
    min_minutos = max(90, request.args.get('min_minutos', default=270, type=int))
    mesma_posicao = request.args.get('mesma_posicao', default='0', type=str).strip() in ('1', 'true', 'True')

    try:
        from backend.motor_econometrico import calcular_jogadores_similares
    except ImportError:
        from motor_econometrico import calcular_jogadores_similares

    conn = get_readonly_db()
    c = conn.cursor()
    try:
        c.execute("""
            SELECT
                m.atleta_id_canonico,
                COALESCE(j.nome_exibicao, j.apelido, j.nome_completo, 'Atleta #' || m.atleta_id_canonico) as nome,
                COALESCE(j.posicao, 'Atacante') as posicao,
                m.clube_id_canonico,
                COALESCE(c.nome, 'Clube #' || m.clube_id_canonico) as clube_nome,
                COALESCE(c.sigla, '') as clube_sigla,
                je.idade as idade,
                m.minutos,
                m.npxg,
                m.xa,
                m.sca,
                m.passes_progressivos,
                COALESCE(pg.conducoes_progressivas, 0) as conducoes_progressivas,
                COALESCE(pg.dribles_certos, 0) as dribles_certos,
                COALESCE(pg.passes_terco_final, 0) as passes_terco_final,
                COALESCE(pg.duelos_aereos_ganhos, 0) as duelos_aereos_ganhos,
                COALESCE(dg.desarmes_ganhos, 0) as desarmes_ganhos,
                COALESCE(dg.interceptacoes, 0) as interceptacoes,
                COALESCE(dg.cortes, 0) as cortes
            FROM metrica_atleta_avancada_2026 m
            LEFT JOIN metrica_atleta_progressao_2026 pg ON m.atleta_id_canonico = pg.atleta_id_canonico
            LEFT JOIN metrica_atleta_defesa_gk_2026 dg ON m.atleta_id_canonico = dg.atleta_id_canonico
            LEFT JOIN jogadores j ON m.atleta_id_canonico = j.id_jogador
            LEFT JOIN jogadores_estatisticas je ON m.atleta_id_canonico = je.id_jogador
            LEFT JOIN dim_clube c ON m.clube_id_canonico = c.clube_id
            WHERE m.minutos > 0;
        """)
        rows = [dict(r) for r in c.fetchall()]
        res = calcular_jogadores_similares(
            atleta_alvo_id=atleta_id,
            registros=rows,
            limite=limite,
            min_minutos=min_minutos,
            mesma_posicao=mesma_posicao,
        )
        return jsonify({
            "sucesso": True,
            "metadados": build_metadata({
                "metodo": "Distância de Cosseno sobre 9 taxas p90 padronizadas (Z-Score)",
                "min_minutos": min_minutos,
                "mesma_posicao": mesma_posicao,
            }),
            **res
        })
    finally:
        conn.close()


# -------------------------------------------------------------
# 12. EVOLUÇÃO DA TABELA POR JOGO (SÉRIE A 2026)
# -------------------------------------------------------------
@metricas_avancadas_bp.route('/api/metricas-avancadas/evolucao-rodadas', methods=['GET'])
def get_evolucao_rodadas():
    conn = get_readonly_db()
    c = conn.cursor()
    try:
        clubes_rows = c.execute("""
            SELECT m.clube_id_canonico, COALESCE(c.nome, 'Clube #' || m.clube_id_canonico) as nome,
                   COALESCE(c.sigla, '') as sigla, m.pontos as pontos_oficiais, m.jogos as jogos_oficiais
            FROM metrica_clube_avancada_2026 m
            LEFT JOIN dim_clube c ON m.clube_id_canonico = c.clube_id
            ORDER BY m.pontos DESC;
        """).fetchall()

        def _canon(n):
            low = (n or '').strip().lower()
            if low in ('rc bragantino', 'red bull bragantino', 'rb bragantino', 'bragantino'):
                return 'red bull bragantino'
            if 'athletico' in low:
                return 'athletico-pr'
            if 'atlético-mg' in low or 'atletico-mg' in low or 'atlético mg' in low:
                return 'atlético-mg'
            return low

        mapa_info = {}
        series = {}
        for cr in clubes_rows:
            cnome = cr["nome"]
            key = _canon(cnome)
            mapa_info[key] = {
                "clube_id_canonico": cr["clube_id_canonico"],
                "nome": cnome,
                "sigla": cr["sigla"] or cnome[:3].upper(),
                "pontos_oficiais": int(cr["pontos_oficiais"] or 0),
                "jogos_oficiais": int(cr["jogos_oficiais"] or 0),
            }
            series[key] = []

        partidas = c.execute("""
            SELECT data, mandante, visitante, gols_mandante, gols_visitante
            FROM partidas
            WHERE campeonato LIKE '%Série A%' AND ano = 2026
              AND gols_mandante IS NOT NULL AND gols_visitante IS NOT NULL
            ORDER BY data ASC, id_partida ASC;
        """).fetchall()

        acum = {k: {"pts": 0, "sg": 0, "gp": 0} for k in series}
        for p in partidas:
            km = _canon(p["mandante"])
            kv = _canon(p["visitante"])
            gm = int(p["gols_mandante"])
            gv = int(p["gols_visitante"])
            if km in series:
                acum[km]["pts"] += 3 if gm > gv else (1 if gm == gv else 0)
                acum[km]["sg"] += (gm - gv)
                acum[km]["gp"] += gm
                series[km].append({"jogo": len(series[km]) + 1, "pontos": acum[km]["pts"], "sg": acum[km]["sg"], "data": p["data"]})
            if kv in series:
                acum[kv]["pts"] += 3 if gv > gm else (1 if gv == gm else 0)
                acum[kv]["sg"] += (gv - gm)
                acum[kv]["gp"] += gv
                series[kv].append({"jogo": len(series[kv]) + 1, "pontos": acum[kv]["pts"], "sg": acum[kv]["sg"], "data": p["data"]})

        # Calcula colocação em cada índice de jogo
        max_j = max((len(v) for v in series.values()), default=0)
        for j_idx in range(max_j):
            snap = []
            for k, arr in series.items():
                if j_idx < len(arr):
                    snap.append((arr[j_idx]["pontos"], arr[j_idx]["sg"], k))
            snap.sort(reverse=True)
            for pos, (_, _, k) in enumerate(snap, start=1):
                series[k][j_idx]["posicao"] = pos

        saida = []
        for k, info in mapa_info.items():
            pts_seq = series[k]
            saida.append({
                **info,
                "jogos_serie": len(pts_seq),
                "serie": pts_seq,
            })
        saida.sort(key=lambda x: (x["pontos_oficiais"], x["serie"][-1]["pontos"] if x["serie"] else 0), reverse=True)

        return jsonify({
            "sucesso": True,
            "metadados": build_metadata({
                "metodo": "Pontuação acumulada jogo a jogo na Série A 2026",
                "max_jogos_catalogados": max_j,
            }),
            "clubes": saida,
        })
    finally:
        conn.close()
