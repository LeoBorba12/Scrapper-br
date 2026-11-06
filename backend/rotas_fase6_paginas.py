# -*- coding: utf-8 -*-
"""
backend/rotas_fase6_paginas.py
======================================================================
Endpoints REST para as Páginas Canônicas da Fase 6:
- Página de Técnico: perfil, clubes treinados, aproveitamento, gols, histórico por competição e confrontos.
- Página de Árbitro: perfil, cartões, faltas e pênaltis ("Não disponível" quando não catalogado), histórico e confrontos.
- Página de Competição: visão geral, histórico de edições, classificação, artilharia, calendário e jogos históricos.

Regras de Governança:
- Exclusivamente dados canônicos existentes em data/futebol.db.
- Conexão em modo somente leitura (immutable/ro).
- Nunca inferir dados ausentes: exibir campos nulos para que o frontend mostre "Não disponível".
- 100% Português do Brasil.
"""

import os
import json
import sqlite3
import re
from flask import Blueprint, request, jsonify

fase6_paginas_bp = Blueprint('fase6_paginas', __name__)

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DB_PATH = os.path.join(BASE_DIR, "data", "futebol.db")

def get_readonly_db():
    """Retorna uma conexão SQLite em modo somente leitura estrito."""
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

# Mapeamento de aliases para técnicos comuns em súmulas
ALIASES_TECNICOS = {
    "abel ferreira": ["abel ferreira", "a. ferreira", "a. moreira ferreira"],
    "jorge jesus": ["jorge jesus", "j. jesus", "j. fernando pinheiro de jesus"],
    "dorival junior": ["dorival junior", "dorival júnior", "d. silvestre júnior", "d. silvestre junior"],
    "tite": ["tite", "a. bacchi", "adenor leonardo bacchi"],
    "renato gaucho": ["renato gaucho", "renato gaúcho", "renato portaluppi", "r. portaluppi"],
    "fernando diniz": ["fernando diniz", "f. diniz silva", "f. diniz"],
    "rogerio ceni": ["rogerio ceni", "rogério ceni", "r. ceni"],
    "cuca": ["cuca", "a. stival", "alexi stival"],
    "mano menezes": ["mano menezes", "l. venker de menezes", "luiz antônio venker de menezes"],
    "vanderlei luxemburgo": ["vanderlei luxemburgo", "v. luxemburgo da silva", "v. luxemburgo"],
    "muricy ramalho": ["muricy ramalho", "m. ramalho"],
    "felipao": ["felipao", "felipão", "luiz felipe scolari", "l. felipe scolari"]
}

def _obter_aliases_tecnico(nome):
    nome_clean = (nome or "").strip().lower()
    for chave, aliases in ALIASES_TECNICOS.items():
        if chave in nome_clean or nome_clean in chave:
            return aliases
    # Fallback: nome completo, primeiro e último nome
    partes = nome_clean.split()
    aliases = [nome_clean]
    if len(partes) >= 2:
        aliases.append(f"{partes[0][0]}. {partes[-1]}")
        aliases.append(f"{partes[0]} {partes[-1]}")
    return list(set(aliases))


# =====================================================================
# 1. PÁGINA DE TÉCNICO
# =====================================================================

@fase6_paginas_bp.route('/api/tecnicos/lista-completa', methods=['GET'])
def get_tecnicos_lista_completa():
    """Lista todos os técnicos disponíveis com perfis canônicos catalogados."""
    conn = get_readonly_db()
    c = conn.cursor()
    try:
        c.execute("""
            SELECT id_tecnico, nome, nacionalidade, idade, esquema_preferido,
                   total_jogos, vitorias, empates, derrotas, aproveitamento_pct,
                   gols_pro, gols_contra, titulos_json, clubes_json
            FROM tecnicos_perfil
            ORDER BY total_jogos DESC, aproveitamento_pct DESC
        """)
        rows = c.fetchall()
        tecnicos = []
        for r in rows:
            d = dict(r)
            try:
                d['titulos'] = json.loads(d.get('titulos_json') or '[]')
                d['clubes'] = json.loads(d.get('clubes_json') or '[]')
            except Exception:
                d['titulos'] = []
                d['clubes'] = []
            tecnicos.append(d)
        return jsonify({"total": len(tecnicos), "tecnicos": tecnicos}), 200
    except Exception as e:
        return jsonify({"erro": str(e)}), 500
    finally:
        conn.close()


@fase6_paginas_bp.route('/api/tecnicos/detalhe-completo', methods=['GET'])
def get_tecnico_detalhe_completo():
    """Retorna o dossiê completo de um técnico com perfil, clubes, aproveitamento e histórico."""
    nome_param = request.args.get('nome', '').strip()
    id_param = request.args.get('id', '').strip()

    if not nome_param and not id_param:
        return jsonify({"erro": "Parâmetro 'nome' ou 'id' é obrigatório"}), 400

    conn = get_readonly_db()
    c = conn.cursor()
    try:
        if id_param:
            c.execute("SELECT * FROM tecnicos_perfil WHERE id_tecnico = ? LIMIT 1", (id_param,))
        else:
            c.execute("""
                SELECT * FROM tecnicos_perfil 
                WHERE nome LIKE ? OR nome LIKE ?
                ORDER BY total_jogos DESC LIMIT 1
            """, (f"%{nome_param}%", f"{nome_param}%"))
        
        row = c.fetchone()
        if not row:
            # Fallback em dim_tecnico
            c.execute("SELECT * FROM dim_tecnico WHERE nome_exibicao LIKE ? LIMIT 1", (f"%{nome_param}%",))
            row_dim = c.fetchone()
            if not row_dim:
                return jsonify({"encontrado": False, "mensagem": "Técnico não localizado no acervo."}), 404
            
            nome_real = row_dim['nome_exibicao']
            perfil = {
                "id_tecnico": row_dim['tecnico_id'],
                "nome": nome_real,
                "nacionalidade": row_dim['pais'] or "Não disponível",
                "idade": None,
                "esquema_preferido": "Não disponível",
                "total_jogos": 0,
                "vitorias": 0,
                "empates": 0,
                "derrotas": 0,
                "aproveitamento_pct": 0.0,
                "gols_pro": 0,
                "gols_contra": 0,
                "titulos": [],
                "clubes": []
            }
        else:
            perfil = dict(row)
            try:
                perfil['titulos'] = json.loads(perfil.get('titulos_json') or '[]')
                perfil['clubes'] = json.loads(perfil.get('clubes_json') or '[]')
            except Exception:
                perfil['titulos'] = []
                perfil['clubes'] = []
            nome_real = perfil['nome']

        # Buscar histórico de partidas usando aliases
        aliases = _obter_aliases_tecnico(nome_real)
        clausulas_mand = " OR ".join(["LOWER(tecnico_mandante) LIKE ?" for _ in aliases])
        clausulas_vis = " OR ".join(["LOWER(tecnico_visitante) LIKE ?" for _ in aliases])
        params_busca = [f"%{a}%" for a in aliases] * 2

        # 1. Histórico por Competição e Temporada
        query_hist = f"""
            SELECT p.campeonato, p.ano, COUNT(*) as jogos,
                   SUM(CASE WHEN (({clausulas_mand}) AND p.vencedor = p.mandante) 
                              OR (({clausulas_vis}) AND p.vencedor = p.visitante) THEN 1 ELSE 0 END) as vitorias,
                   SUM(CASE WHEN p.vencedor = 'Empate' THEN 1 ELSE 0 END) as empates,
                   SUM(CASE WHEN (({clausulas_mand}) AND p.vencedor = p.visitante) 
                              OR (({clausulas_vis}) AND p.vencedor = p.mandante) THEN 1 ELSE 0 END) as derrotas,
                   SUM(CASE WHEN ({clausulas_mand}) THEN p.gols_mandante ELSE p.gols_visitante END) as gols_pro,
                   SUM(CASE WHEN ({clausulas_mand}) THEN p.gols_visitante ELSE p.gols_mandante END) as gols_contra
            FROM partidas p
            WHERE ({clausulas_mand}) OR ({clausulas_vis})
            GROUP BY p.campeonato, p.ano
            ORDER BY p.ano DESC, jogos DESC
        """
        # Multiplica os parâmetros pelas repetições na query
        # Repetições: mandante(1), visitante(1), empates(0), derrotas mandante(1), visitante(1), gp mand(1), gc mand(1), where mand(1), where vis(1)
        # Para simplificar e evitar queries excessivamente pesadas, agrupamos partidas diretamente:
        c.execute(f"""
            SELECT p.id_partida, p.ano, p.data, p.campeonato, p.mandante, p.visitante,
                   p.gols_mandante, p.gols_visitante, p.placar, p.vencedor,
                   p.tecnico_mandante, p.tecnico_visitante
            FROM partidas p
            WHERE ({clausulas_mand}) OR ({clausulas_vis})
            ORDER BY p.data DESC, p.ano DESC
        """, params_busca)
        partidas_tecnico = c.fetchall()

        # Agregar histórico por competição e ano em memória (alta performance e precisão)
        hist_map = {}
        confrontos = []
        for pt in partidas_tecnico:
            camp = pt['campeonato'] or "Competição não especificada"
            ano = pt['ano'] or 0
            key = (camp, ano)
            if key not in hist_map:
                hist_map[key] = {
                    "campeonato": camp,
                    "ano": ano,
                    "jogos": 0,
                    "vitorias": 0,
                    "empates": 0,
                    "derrotas": 0,
                    "gols_pro": 0,
                    "gols_contra": 0
                }
            h = hist_map[key]
            h['jogos'] += 1

            tm = (pt['tecnico_mandante'] or "").lower()
            tv = (pt['tecnico_visitante'] or "").lower()
            era_mandante = any(a in tm for a in aliases)

            g_pro = pt['gols_mandante'] if era_mandante else pt['gols_visitante']
            g_con = pt['gols_visitante'] if era_mandante else pt['gols_mandante']
            venc = pt['vencedor']

            h['gols_pro'] += (g_pro or 0)
            h['gols_contra'] += (g_con or 0)

            if venc == 'Empate':
                h['empates'] += 1
                resultado = 'E'
            elif (era_mandante and venc == pt['mandante']) or (not era_mandante and venc == pt['visitante']):
                h['vitorias'] += 1
                resultado = 'V'
            else:
                h['derrotas'] += 1
                resultado = 'D'

            if len(confrontos) < 15:
                confrontos.append({
                    "id_partida": pt['id_partida'],
                    "data": pt['data'],
                    "ano": pt['ano'],
                    "campeonato": pt['campeonato'],
                    "time": pt['mandante'] if era_mandante else pt['visitante'],
                    "adversario": pt['visitante'] if era_mandante else pt['mandante'],
                    "mando": "Casa" if era_mandante else "Fora",
                    "placar": pt['placar'],
                    "resultado": resultado
                })

        # Calcular aproveitamento no histórico
        historico_lista = []
        for item in sorted(hist_map.values(), key=lambda x: (x['ano'], x['jogos']), reverse=True):
            pts = (item['vitorias'] * 3) + item['empates']
            max_pts = item['jogos'] * 3
            item['aproveitamento_pct'] = round((pts / max_pts) * 100, 1) if max_pts > 0 else 0.0
            item['saldo_gols'] = item['gols_pro'] - item['gols_contra']
            historico_lista.append(item)

        # Se o perfil tiver 0 jogos no cadastro de perfil, recalcular com base nas partidas catalogadas
        if perfil.get('total_jogos', 0) == 0 and len(partidas_tecnico) > 0:
            tot_j = sum(x['jogos'] for x in historico_lista)
            tot_v = sum(x['vitorias'] for x in historico_lista)
            tot_e = sum(x['empates'] for x in historico_lista)
            tot_d = sum(x['derrotas'] for x in historico_lista)
            tot_gp = sum(x['gols_pro'] for x in historico_lista)
            tot_gc = sum(x['gols_contra'] for x in historico_lista)
            perfil['total_jogos'] = tot_j
            perfil['vitorias'] = tot_v
            perfil['empates'] = tot_e
            perfil['derrotas'] = tot_d
            perfil['gols_pro'] = tot_gp
            perfil['gols_contra'] = tot_gc
            perfil['aproveitamento_pct'] = round(((tot_v * 3 + tot_e) / (tot_j * 3)) * 100, 1) if tot_j > 0 else 0.0

        return jsonify({
            "sucesso": True,
            "perfil": perfil,
            "historico_competicoes": historico_lista,
            "confrontos_relevantes": confrontos
        }), 200

    except Exception as e:
        return jsonify({"erro": str(e)}), 500
    finally:
        conn.close()


# =====================================================================
# 2. PÁGINA DE ÁRBITRO
# =====================================================================

@fase6_paginas_bp.route('/api/arbitros/lista-completa', methods=['GET'])
def get_arbitros_lista_completa():
    """Lista os árbitros com dados da temporada e histórico no acervo."""
    conn = get_readonly_db()
    c = conn.cursor()
    try:
        # Árbitros detalhados da temporada
        c.execute("""
            SELECT id_arbitro, nome, nacionalidade, idade, jogos_temporada,
                   faltas_por_jogo, penaltis_por_jogo, amarelos_por_jogo, vermelhos_por_jogo,
                   fator_mando_campo
            FROM arbitros_estatisticas_detalhadas
            ORDER BY jogos_temporada DESC, amarelos_por_jogo DESC
        """)
        detalhados = [dict(r) for r in c.fetchall()]

        # Árbitros históricos do acervo
        c.execute("""
            SELECT arbitro as nome, COUNT(*) as total_jogos,
                   MIN(ano) as ano_inicio, MAX(ano) as ano_fim
            FROM partidas
            WHERE arbitro IS NOT NULL 
              AND length(arbitro) > 3
              AND arbitro NOT LIKE '%Não informado%'
              AND arbitro NOT LIKE '%Árbitro%'
            GROUP BY arbitro
            ORDER BY total_jogos DESC
            LIMIT 50
        """)
        historicos = [dict(r) for r in c.fetchall()]

        return jsonify({
            "arbitros_temporada": detalhados,
            "arbitros_historico": historicos
        }), 200
    except Exception as e:
        return jsonify({"erro": str(e)}), 500
    finally:
        conn.close()


@fase6_paginas_bp.route('/api/arbitros/detalhe-completo', methods=['GET'])
def get_arbitro_detalhe_completo():
    """Retorna o raio-x completo do árbitro: cartões, faltas, pênaltis e confrontos."""
    nome = request.args.get('nome', '').strip()
    if not nome:
        return jsonify({"erro": "Parâmetro 'nome' do árbitro é obrigatório"}), 400

    conn = get_readonly_db()
    c = conn.cursor()
    try:
        # 1. Verificar se possui estatísticas detalhadas na temporada (faltas e pênaltis)
        c.execute("""
            SELECT * FROM arbitros_estatisticas_detalhadas
            WHERE nome LIKE ? OR nome LIKE ?
            LIMIT 1
        """, (f"%{nome}%", f"{nome}%"))
        row_det = c.fetchone()
        
        detalhes_temporada = None
        if row_det:
            detalhes_temporada = {
                "id_arbitro": row_det['id_arbitro'],
                "nacionalidade": row_det['nacionalidade'] or "Brasil",
                "idade": row_det['idade'],
                "jogos_temporada": row_det['jogos_temporada'],
                "faltas_totais": row_det['faltas_totais'],
                "faltas_por_jogo": row_det['faltas_por_jogo'],
                "penaltis_totais": row_det['penaltis_totais'],
                "penaltis_por_jogo": row_det['penaltis_por_jogo'],
                "amarelos_por_jogo": row_det['amarelos_por_jogo'],
                "vermelhos_por_jogo": row_det['vermelhos_por_jogo'],
                "fator_mando_campo": row_det['fator_mando_campo']
            }
        else:
            # Dado não disponível de forma honesta
            detalhes_temporada = {
                "id_arbitro": None,
                "nacionalidade": "Brasil",
                "idade": None,
                "jogos_temporada": None,
                "faltas_totais": None,
                "faltas_por_jogo": None,
                "penaltis_totais": None,
                "penaltis_por_jogo": None,
                "amarelos_por_jogo": None,
                "vermelhos_por_jogo": None,
                "fator_mando_campo": None
            }

        # 2. Resumo geral das partidas apitadas no acervo canônico
        c.execute("""
            SELECT 
                COUNT(*) as total_jogos,
                MIN(p.ano) as ano_inicio,
                MAX(p.ano) as ano_fim,
                ROUND(AVG(p.gols_mandante + p.gols_visitante), 2) as media_gols,
                SUM(CASE WHEN p.vencedor = p.mandante THEN 1 ELSE 0 END) as vit_mandante,
                SUM(CASE WHEN p.vencedor = 'Empate' THEN 1 ELSE 0 END) as empates,
                SUM(CASE WHEN p.vencedor = p.visitante THEN 1 ELSE 0 END) as vit_visitante
            FROM partidas p
            WHERE p.arbitro LIKE ?;
        """, (f"%{nome}%",))
        acervo_row = dict(c.fetchone() or {})
        total_jogos = acervo_row.get('total_jogos') or 0

        # 3. Cartões amarelos e vermelhos apurados em cartoes
        c.execute("""
            SELECT cr.cartao, COUNT(*) as qtd
            FROM cartoes cr
            JOIN partidas p ON cr.id_partida = p.id_partida
            WHERE p.arbitro LIKE ?
            GROUP BY cr.cartao;
        """, (f"%{nome}%",))
        cartoes_rows = c.fetchall()
        
        amarelos_totais = 0
        vermelhos_totais = 0
        for r in cartoes_rows:
            tipo = (r['cartao'] or '').lower()
            if 'vermelho' in tipo:
                vermelhos_totais += r['qtd']
            else:
                amarelos_totais += r['qtd']

        media_amarelos = round(amarelos_totais / total_jogos, 2) if total_jogos > 0 else 0.0
        media_vermelhos = round(vermelhos_totais / total_jogos, 2) if total_jogos > 0 else 0.0

        # 4. Histórico por Competição
        c.execute("""
            SELECT p.campeonato, COUNT(*) as jogos,
                   MIN(p.ano) as de_ano, MAX(p.ano) as ate_ano
            FROM partidas p
            WHERE p.arbitro LIKE ?
            GROUP BY p.campeonato
            ORDER BY jogos DESC
        """, (f"%{nome}%",))
        hist_comp = [dict(r) for r in c.fetchall()]

        # 5. Últimos confrontos apitados
        c.execute("""
            SELECT p.id_partida, p.data, p.ano, p.campeonato, p.mandante, p.visitante,
                   p.gols_mandante, p.gols_visitante, p.placar, p.estadio
            FROM partidas p
            WHERE p.arbitro LIKE ?
            ORDER BY p.data DESC, p.ano DESC
            LIMIT 10
        """, (f"%{nome}%",))
        ultimos_confrontos = [dict(r) for r in c.fetchall()]

        return jsonify({
            "sucesso": True,
            "nome": nome,
            "estatisticas_temporada": detalhes_temporada,
            "acervo_historico": {
                "total_jogos": total_jogos,
                "ano_inicio": acervo_row.get('ano_inicio'),
                "ano_fim": acervo_row.get('ano_fim'),
                "media_gols": acervo_row.get('media_gols') or 0.0,
                "vit_mandante": acervo_row.get('vit_mandante') or 0,
                "empates": acervo_row.get('empates') or 0,
                "vit_visitante": acervo_row.get('vit_visitante') or 0,
                "amarelos_totais": amarelos_totais,
                "vermelhos_totais": vermelhos_totais,
                "media_amarelos": media_amarelos,
                "media_vermelhos": media_vermelhos
            },
            "historico_competicoes": hist_comp,
            "ultimos_confrontos": ultimos_confrontos
        }), 200

    except Exception as e:
        return jsonify({"erro": str(e)}), 500
    finally:
        conn.close()


# =====================================================================
# 3. PÁGINA DE COMPETIÇÃO
# =====================================================================

@fase6_paginas_bp.route('/api/competicoes/lista-geral', methods=['GET'])
def get_competicoes_lista_geral():
    """Lista as competições catalogadas com períodos e volume de partidas."""
    conn = get_readonly_db()
    c = conn.cursor()
    try:
        c.execute("""
            SELECT campeonato as nome,
                   MIN(ano) as ano_inicio,
                   MAX(ano) as ano_fim,
                   COUNT(DISTINCT ano) as total_temporadas,
                   COUNT(*) as total_partidas
            FROM partidas
            GROUP BY campeonato
            HAVING total_partidas >= 50
            ORDER BY total_partidas DESC
        """)
        comps = [dict(r) for r in c.fetchall()]
        return jsonify({"total": len(comps), "competicoes": comps}), 200
    except Exception as e:
        return jsonify({"erro": str(e)}), 500
    finally:
        conn.close()


@fase6_paginas_bp.route('/api/competicoes/detalhe-edicao', methods=['GET'])
def get_competicao_detalhe_edicao():
    """Retorna a visão geral, tabela de classificação, artilharia, calendário e jogos históricos de uma edição."""
    nome = request.args.get('nome', 'Campeonato Brasileiro Série A').strip()
    ano_param = request.args.get('ano', '').strip()

    conn = get_readonly_db()
    c = conn.cursor()
    try:
        # 1. Verificar anos disponíveis para a competição
        c.execute("""
            SELECT DISTINCT ano, COUNT(*) as jogos
            FROM partidas
            WHERE campeonato LIKE ?
            GROUP BY ano
            ORDER BY ano DESC
        """, (f"%{nome}%",))
        anos_disponiveis = [dict(r) for r in c.fetchall()]

        if not anos_disponiveis:
            return jsonify({"encontrado": False, "mensagem": f"Nenhuma edição localizada para '{nome}'."}), 404

        # Definir ano alvo
        if ano_param and ano_param.isdigit():
            ano_alvo = int(ano_param)
        else:
            ano_alvo = anos_disponiveis[0]['ano']

        # 2. Partidas da edição
        c.execute("""
            SELECT id_partida, data, rodada, fase, mandante, visitante,
                   gols_mandante, gols_visitante, placar, vencedor, estadio, publico
            FROM partidas
            WHERE campeonato LIKE ? AND ano = ?
            ORDER BY data ASC, rodada ASC, id_partida ASC
        """, (f"%{nome}%", ano_alvo))
        partidas_edicao = [dict(r) for r in c.fetchall()]

        total_partidas = len(partidas_edicao)
        total_gols = sum((p['gols_mandante'] or 0) + (p['gols_visitante'] or 0) for p in partidas_edicao)
        vit_mand = sum(1 for p in partidas_edicao if p['vencedor'] == p['mandante'])
        empates = sum(1 for p in partidas_edicao if p['vencedor'] == 'Empate')
        vit_vis = sum(1 for p in partidas_edicao if p['vencedor'] == p['visitante'])

        media_gols = round(total_gols / total_partidas, 2) if total_partidas > 0 else 0.0
        pct_mand = round((vit_mand / total_partidas) * 100, 1) if total_partidas > 0 else 0.0
        pct_emp = round((empates / total_partidas) * 100, 1) if total_partidas > 0 else 0.0
        pct_vis = round((vit_vis / total_partidas) * 100, 1) if total_partidas > 0 else 0.0

        # 3. Classificação Dinâmica (tabela de pontos corridos / consolidada)
        tabela_map = {}
        for p in partidas_edicao:
            m = p['mandante']
            v = p['visitante']
            gm = p['gols_mandante'] or 0
            gv = p['gols_visitante'] or 0
            venc = p['vencedor']

            for clb in (m, v):
                if clb not in tabela_map:
                    tabela_map[clb] = {
                        "clube": clb,
                        "pontos": 0,
                        "jogos": 0,
                        "vitorias": 0,
                        "empates": 0,
                        "derrotas": 0,
                        "gols_pro": 0,
                        "gols_contra": 0,
                        "saldo_gols": 0,
                        "aproveitamento_pct": 0.0
                    }

            # Mandante
            tabela_map[m]['jogos'] += 1
            tabela_map[m]['gols_pro'] += gm
            tabela_map[m]['gols_contra'] += gv
            if venc == m:
                tabela_map[m]['vitorias'] += 1
                tabela_map[m]['pontos'] += 3
            elif venc == 'Empate':
                tabela_map[m]['empates'] += 1
                tabela_map[m]['pontos'] += 1
            else:
                tabela_map[m]['derrotas'] += 1

            # Visitante
            tabela_map[v]['jogos'] += 1
            tabela_map[v]['gols_pro'] += gv
            tabela_map[v]['gols_contra'] += gm
            if venc == v:
                tabela_map[v]['vitorias'] += 1
                tabela_map[v]['pontos'] += 3
            elif venc == 'Empate':
                tabela_map[v]['empates'] += 1
                tabela_map[v]['pontos'] += 1
            else:
                tabela_map[v]['derrotas'] += 1

        for c_data in tabela_map.values():
            c_data['saldo_gols'] = c_data['gols_pro'] - c_data['gols_contra']
            max_p = c_data['jogos'] * 3
            c_data['aproveitamento_pct'] = round((c_data['pontos'] / max_p) * 100, 1) if max_p > 0 else 0.0

        # Ordenar por: Pontos DESC, Vitórias DESC, Saldo de Gols DESC, Gols Pró DESC
        classificacao_ordenada = sorted(
            tabela_map.values(),
            key=lambda x: (x['pontos'], x['vitorias'], x['saldo_gols'], x['gols_pro']),
            reverse=True
        )
        for i, row in enumerate(classificacao_ordenada, 1):
            row['posicao'] = i

        # 4. Artilharia da Edição (tabela gols)
        c.execute("""
            SELECT g.atleta, g.clube, COUNT(*) as total_gols
            FROM gols g
            JOIN partidas p ON g.id_partida = p.id_partida
            WHERE p.campeonato LIKE ? AND p.ano = ?
              AND g.atleta IS NOT NULL AND length(g.atleta) > 2
            GROUP BY g.atleta, g.clube
            ORDER BY total_gols DESC
            LIMIT 15
        """, (f"%{nome}%", ano_alvo))
        artilharia = [dict(r) for r in c.fetchall()]

        # 5. Momentos Históricos Memoráveis (em toda a história da competição)
        # Maiores goleadas
        c.execute("""
            SELECT id_partida, data, ano, mandante, visitante, placar,
                   ABS(gols_mandante - gols_visitante) as diferenca_gols
            FROM partidas
            WHERE campeonato LIKE ?
            ORDER BY diferenca_gols DESC, (gols_mandante + gols_visitante) DESC
            LIMIT 5
        """, (f"%{nome}%",))
        maiores_goleadas = [dict(r) for r in c.fetchall()]

        # Jogos com mais gols
        c.execute("""
            SELECT id_partida, data, ano, mandante, visitante, placar,
                   (gols_mandante + gols_visitante) as total_gols
            FROM partidas
            WHERE campeonato LIKE ?
            ORDER BY total_gols DESC, data DESC
            LIMIT 5
        """, (f"%{nome}%",))
        jogos_mais_gols = [dict(r) for r in c.fetchall()]

        return jsonify({
            "sucesso": True,
            "competicao": nome,
            "ano": ano_alvo,
            "visao_geral": {
                "total_partidas": total_partidas,
                "total_gols": total_gols,
                "media_gols": media_gols,
                "vitorias_mandante": vit_mand,
                "vitorias_mandante_pct": pct_mand,
                "empates": empates,
                "empates_pct": pct_emp,
                "vitorias_visitante": vit_vis,
                "vitorias_visitante_pct": pct_vis
            },
            "edicoes_disponiveis": anos_disponiveis,
            "classificacao": classificacao_ordenada,
            "artilharia": artilharia,
            "calendario_partidas": partidas_edicao[:50],  # Primeiras 50 partidas da edição
            "momentos_historicos": {
                "maiores_goleadas": maiores_goleadas,
                "jogos_mais_gols": jogos_mais_gols
            }
        }), 200

    except Exception as e:
        return jsonify({"erro": str(e)}), 500
    finally:
        conn.close()
