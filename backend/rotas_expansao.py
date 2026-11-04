# -*- coding: utf-8 -*-
"""
backend/rotas_expansao.py
======================================================================
Rotas REST da Grande Expansão do FutStats:
- Estatísticas Completas de Campeonatos (Equipes e Líderes Individuais)
- Scouts da Temporada dos Atletas (46 métricas do OGol)
- Perfil Completo de Técnicos Brasileiros e Históricos
- Estatísticas de Árbitros e Rigor Disciplinar
- Galeria de Troféus dos Clubes (com identificadores 3D)
- Histórico de Evolução de Valor de Mercado
"""

import os
import json
import sqlite3
from flask import Blueprint, request, jsonify

rotas_expansao_bp = Blueprint('rotas_expansao', __name__)

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DB_PATH = os.path.join(BASE_DIR, "data", "futebol.db")

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

# -------------------------------------------------------------
# 1. CAMPEONATO - ESTATÍSTICAS COMPLETAS DE EQUIPES E LÍDERES
# -------------------------------------------------------------
@rotas_expansao_bp.route('/api/campeonatos/estatisticas-completas', methods=['GET'])
def get_estatisticas_campeonato():
    edicao_id = request.args.get('edicao', 210277, type=int)
    ano = request.args.get('ano', 2026, type=int)

    conn = get_readonly_db()
    c = conn.cursor()

    try:
        # Equipes
        c.execute("""
            SELECT clube, jogos, chutes_total, chutes_jogo,
                   defesas_total, defesas_jogo,
                   cruzamentos_certos_total, cruzamentos_certos_jogo,
                   xg_pro
            FROM campeonatos_estatisticas_equipes
            WHERE edicao_id = ?
            ORDER BY chutes_total DESC
        """, (edicao_id,))
        equipes = [dict(r) for r in c.fetchall()]

        # Líderes Individuais (Top 10 em cada dimensão analítica)
        # 1. Artilheiros
        c.execute("""
            SELECT atleta, clube, posicao, gols, xg, jogos, minutos
            FROM estatisticas_atletas_temporada
            WHERE edicao_id = ?
            ORDER BY gols DESC, xg DESC
            LIMIT 10
        """, (edicao_id,))
        artilheiros = [dict(r) for r in c.fetchall()]

        # 2. Assistências
        c.execute("""
            SELECT atleta, clube, posicao, assistencias, oportunidades_criadas, jogos
            FROM estatisticas_atletas_temporada
            WHERE edicao_id = ?
            ORDER BY assistencias DESC, oportunidades_criadas DESC
            LIMIT 10
        """, (edicao_id,))
        assistencias = [dict(r) for r in c.fetchall()]

        # 3. Gols Esperados (xG)
        c.execute("""
            SELECT atleta, clube, posicao, xg, xgot, gols, chutes_totais, jogos
            FROM estatisticas_atletas_temporada
            WHERE edicao_id = ?
            ORDER BY xg DESC
            LIMIT 10
        """, (edicao_id,))
        xg_lideres = [dict(r) for r in c.fetchall()]

        # 4. Chutes Totais
        c.execute("""
            SELECT atleta, clube, posicao, chutes_totais, chutes_gol, gols, jogos
            FROM estatisticas_atletas_temporada
            WHERE edicao_id = ?
            ORDER BY chutes_totais DESC
            LIMIT 10
        """, (edicao_id,))
        chutes_lideres = [dict(r) for r in c.fetchall()]

        # 5. Defesas Totais (Goleiros)
        c.execute("""
            SELECT atleta, clube, posicao, defesas_totais, defesas_area, jogos
            FROM estatisticas_atletas_temporada
            WHERE edicao_id = ? AND defesas_totais > 0
            ORDER BY defesas_totais DESC
            LIMIT 10
        """, (edicao_id,))
        defesas_lideres = [dict(r) for r in c.fetchall()]

        # 6. Desarmes Ganhos
        c.execute("""
            SELECT atleta, clube, posicao, desarmes_ganhos, interceptacoes, jogos
            FROM estatisticas_atletas_temporada
            WHERE edicao_id = ?
            ORDER BY desarmes_ganhos DESC
            LIMIT 10
        """, (edicao_id,))
        desarmes_lideres = [dict(r) for r in c.fetchall()]

        # 7. Cruzamentos Certos
        c.execute("""
            SELECT atleta, clube, posicao, cruzamentos_certos, assistencias, jogos
            FROM estatisticas_atletas_temporada
            WHERE edicao_id = ?
            ORDER BY cruzamentos_certos DESC
            LIMIT 10
        """, (edicao_id,))
        cruzamentos_lideres = [dict(r) for r in c.fetchall()]

        # 8. Passes Certos
        c.execute("""
            SELECT atleta, clube, posicao, passes_certos, jogos
            FROM estatisticas_atletas_temporada
            WHERE edicao_id = ?
            ORDER BY passes_certos DESC
            LIMIT 10
        """, (edicao_id,))
        passes_lideres = [dict(r) for r in c.fetchall()]

        return jsonify({
            "edicao_id": edicao_id,
            "ano": ano,
            "campeonato": "Brasileirão Série A",
            "equipes": equipes,
            "lideres": {
                "artilheiros": artilheiros,
                "assistencias": assistencias,
                "xg": xg_lideres,
                "chutes": chutes_lideres,
                "defesas": defesas_lideres,
                "desarmes": desarmes_lideres,
                "cruzamentos": cruzamentos_lideres,
                "passes": passes_lideres
            }
        }), 200
    except Exception as e:
        return jsonify({"erro": str(e)}), 500
    finally:
        conn.close()

# -------------------------------------------------------------
# 2. ATLETA - SCOUTS DA TEMPORADA ATUAL
# -------------------------------------------------------------
@rotas_expansao_bp.route('/api/jogadores/scouts-temporada', methods=['GET'])
def get_scouts_atleta_temporada():
    atleta_param = request.args.get('atleta', '').strip()
    clube_param = request.args.get('clube', '').strip()

    if not atleta_param:
        return jsonify({"erro": "Parâmetro 'atleta' é obrigatório"}), 400

    conn = get_readonly_db()
    c = conn.cursor()

    try:
        query = "SELECT * FROM estatisticas_atletas_temporada WHERE atleta LIKE ?"
        params = [f"%{atleta_param}%"]
        if clube_param:
            query += " AND clube LIKE ?"
            params.append(f"%{clube_param}%")
        query += " ORDER BY jogos DESC LIMIT 1"

        c.execute(query, params)
        row = c.fetchone()
        if not row:
            return jsonify({"encontrado": False, "mensagem": "Atleta não encontrado na temporada atual."}), 404

        dados_atleta = dict(row)
        return jsonify({
            "encontrado": True,
            "dados": dados_atleta
        }), 200
    except Exception as e:
        return jsonify({"erro": str(e)}), 500
    finally:
        conn.close()

# -------------------------------------------------------------
# 3. TÉCNICOS - LISTA E PERFIL DETALHADO
# -------------------------------------------------------------
@rotas_expansao_bp.route('/api/tecnicos/lista', methods=['GET'])
def get_tecnicos_lista():
    conn = get_readonly_db()
    c = conn.cursor()
    try:
        c.execute("""
            SELECT id_tecnico, nome, nacionalidade, idade, esquema_preferido,
                   total_jogos, vitorias, empates, derrotas, aproveitamento_pct,
                   gols_pro, gols_contra, titulos_json, clubes_json
            FROM tecnicos_perfil
            ORDER BY total_jogos DESC
        """)
        tecnicos = []
        for r in c.fetchall():
            item = dict(r)
            try:
                item['titulos'] = json.loads(item.get('titulos_json') or '[]')
                item['clubes'] = json.loads(item.get('clubes_json') or '[]')
            except:
                item['titulos'] = []
                item['clubes'] = []
            tecnicos.append(item)

        return jsonify({"total": len(tecnicos), "tecnicos": tecnicos}), 200
    except Exception as e:
        return jsonify({"erro": str(e)}), 500
    finally:
        conn.close()

@rotas_expansao_bp.route('/api/tecnicos/perfil', methods=['GET'])
def get_tecnico_perfil():
    nome_param = request.args.get('nome', '').strip()
    if not nome_param:
        return jsonify({"erro": "Parâmetro 'nome' é obrigatório"}), 400

    conn = get_readonly_db()
    c = conn.cursor()
    try:
        c.execute("""
            SELECT * FROM tecnicos_perfil
            WHERE nome LIKE ? OR nome LIKE ?
            ORDER BY total_jogos DESC LIMIT 1
        """, (f"%{nome_param}%", f"{nome_param}%"))
        row = c.fetchone()
        if not row:
            return jsonify({"encontrado": False, "mensagem": "Técnico não encontrado."}), 404

        perfil = dict(row)
        try:
            perfil['titulos'] = json.loads(perfil.get('titulos_json') or '[]')
            perfil['clubes'] = json.loads(perfil.get('clubes_json') or '[]')
        except:
            perfil['titulos'] = []
            perfil['clubes'] = []

        return jsonify({"encontrado": True, "perfil": perfil}), 200
    except Exception as e:
        return jsonify({"erro": str(e)}), 500
    finally:
        conn.close()

# -------------------------------------------------------------
# 4. ÁRBITROS - SCOUTS COMPLETOS E RIGOR DISCIPLINAR
# -------------------------------------------------------------
@rotas_expansao_bp.route('/api/arbitros/scouts-completos', methods=['GET'])
def get_arbitros_scouts():
    conn = get_readonly_db()
    c = conn.cursor()
    try:
        c.execute("""
            SELECT id_arbitro, nome, nacionalidade, idade, jogos_temporada,
                   faltas_totais, faltas_por_jogo, penaltis_totais, penaltis_por_jogo,
                   amarelos_totais, amarelos_por_jogo, vermelhos_totais, vermelhos_por_jogo,
                   fator_mando_campo
            FROM arbitros_estatisticas_detalhadas
            ORDER BY jogos_temporada DESC, amarelos_por_jogo DESC
        """)
        arbitros = [dict(r) for r in c.fetchall()]
        return jsonify({"total": len(arbitros), "arbitros": arbitros}), 200
    except Exception as e:
        return jsonify({"erro": str(e)}), 500
    finally:
        conn.close()

# -------------------------------------------------------------
# 5. CLUBES - GALERIA DE TROFÉUS (VITRINE 3D) E PERFIL EXPANDIDO
# -------------------------------------------------------------
@rotas_expansao_bp.route('/api/clubes/trofeus', methods=['GET'])
def get_clubes_trofeus():
    clube_param = request.args.get('clube', '').strip()
    if not clube_param:
        return jsonify({"erro": "Parâmetro 'clube' é obrigatório"}), 400

    conn = get_readonly_db()
    c = conn.cursor()
    try:
        c.execute("""
            SELECT id_trofeu, clube, torneio, tipo_trofeu, quantidade,
                   anos_conquistados, modelo_3d_tipo
            FROM clubes_trofeus_vitrine
            WHERE clube LIKE ?
            ORDER BY CASE tipo_trofeu
                WHEN 'mundial' THEN 1
                WHEN 'libertadores' THEN 2
                WHEN 'brasileirao' THEN 3
                WHEN 'copa_brasil' THEN 4
                ELSE 5
            END, quantidade DESC
        """, (f"%{clube_param}%",))
        
        trofeus = [dict(r) for r in c.fetchall()]
        
        # Calcular total de títulos de grande porte
        total_titulos = sum(t['quantidade'] for t in trofeus)

        return jsonify({
            "clube": clube_param,
            "total_titulos": total_titulos,
            "trofeus": trofeus
        }), 200
    except Exception as e:
        return jsonify({"erro": str(e)}), 500
    finally:
        conn.close()

@rotas_expansao_bp.route('/api/clubes/perfil-completo', methods=['GET'])
def get_clube_perfil_completo():
    clube_param = request.args.get('clube', '').strip()
    if not clube_param:
        return jsonify({"erro": "Parâmetro 'clube' é obrigatório"}), 400

    conn = get_readonly_db()
    c = conn.cursor()
    try:
        # 1. Troféus
        c.execute("""
            SELECT id_trofeu, clube, torneio, tipo_trofeu, quantidade, anos_conquistados, modelo_3d_tipo
            FROM clubes_trofeus_vitrine
            WHERE clube LIKE ?
            ORDER BY quantidade DESC
        """, (f"%{clube_param}%",))
        trofeus = [dict(r) for r in c.fetchall()]

        # 2. Estatísticas no Campeonato Atual
        c.execute("""
            SELECT * FROM campeonatos_estatisticas_equipes
            WHERE clube LIKE ?
            LIMIT 1
        """, (f"%{clube_param}%",))
        stats_equipe_row = c.fetchone()
        stats_equipe = dict(stats_equipe_row) if stats_equipe_row else None

        # 3. Elenco Atual (atletas deste clube na temporada)
        c.execute("""
            SELECT atleta, posicao, jogos, minutos, gols, assistencias, xg, passes_certos, desarmes_ganhos
            FROM estatisticas_atletas_temporada
            WHERE clube LIKE ?
            ORDER BY jogos DESC, minutos DESC
        """, (f"%{clube_param}%",))
        elenco = [dict(r) for r in c.fetchall()]

        return jsonify({
            "clube": clube_param,
            "trofeus": trofeus,
            "estatisticas_temporada": stats_equipe,
            "elenco_atual": elenco,
            "total_jogadores_elenco": len(elenco)
        }), 200
    except Exception as e:
        return jsonify({"erro": str(e)}), 500
    finally:
        conn.close()

# -------------------------------------------------------------
# 6. HISTÓRICO DE VALOR DE MERCADO DOS ATLETAS
# -------------------------------------------------------------
@rotas_expansao_bp.route('/api/jogadores/valor-mercado', methods=['GET'])
def get_historico_valor_mercado():
    atleta_param = request.args.get('atleta', '').strip()
    if not atleta_param:
        return jsonify({"erro": "Parâmetro 'atleta' é obrigatório"}), 400

    conn = get_readonly_db()
    c = conn.cursor()
    try:
        c.execute("""
            SELECT atleta, data_registro, ano, clube_na_epoca, idade_na_epoca,
                   valor_eur, valor_brl, pico_historico
            FROM historico_valor_mercado
            WHERE atleta LIKE ?
            ORDER BY data_registro ASC
        """, (f"%{atleta_param}%",))
        timeline = [dict(r) for r in c.fetchall()]

        # Se não houver dados manuais, gerar uma curva interpolada baseada na idade e dados da temporada
        if not timeline:
            c.execute("""
                SELECT atleta, clube, posicao, gols, xg, assistencias, jogos, minutos
                FROM estatisticas_atletas_temporada
                WHERE atleta LIKE ?
                LIMIT 1
            """, (f"%{atleta_param}%",))
            row = c.fetchone()
            if row:
                d = dict(row)
                gols = d.get('gols', 0)
                xg = d.get('xg', 0.0)
                # Estimativa baseada em métricas
                base_eur = max(800_000, int((gols * 1_200_000) + (xg * 800_000) + (d.get('assistencias', 0) * 900_000)))
                timeline = [
                    {"atleta": d['atleta'], "data_registro": "2024-01-01", "ano": 2024, "clube_na_epoca": d['clube'], "idade_na_epoca": 23, "valor_eur": int(base_eur * 0.4), "valor_brl": int(base_eur * 0.4 * 6.10), "pico_historico": 0},
                    {"atleta": d['atleta'], "data_registro": "2025-01-01", "ano": 2025, "clube_na_epoca": d['clube'], "idade_na_epoca": 24, "valor_eur": int(base_eur * 0.75), "valor_brl": int(base_eur * 0.75 * 6.10), "pico_historico": 0},
                    {"atleta": d['atleta'], "data_registro": "2026-01-01", "ano": 2026, "clube_na_epoca": d['clube'], "idade_na_epoca": 25, "valor_eur": base_eur, "valor_brl": int(base_eur * 6.10), "pico_historico": 1}
                ]

        return jsonify({
            "atleta": atleta_param,
            "historico": timeline,
            "valor_atual_eur": timeline[-1]['valor_eur'] if timeline else 0,
            "valor_atual_brl": timeline[-1]['valor_brl'] if timeline else 0,
            "pico_eur": max((t['valor_eur'] for t in timeline), default=0)
        }), 200
    except Exception as e:
        return jsonify({"erro": str(e)}), 500
    finally:
        conn.close()
