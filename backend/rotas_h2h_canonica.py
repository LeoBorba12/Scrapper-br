"""
Módulo Canônico de Confrontos Diretos (Head-to-Head / H2H) - FutStats 2026
Autor: Gemini Argon & Antigravity Core
"""
import os
import sqlite3
from flask import Blueprint, request, jsonify

rotas_h2h_canonica_bp = Blueprint('rotas_h2h_canonica', __name__)

def _find_db_path(filename='futebol.db'):
    if os.environ.get('DB_PATH'):
        env_p = os.environ.get('DB_PATH')
        for c in [
            env_p,
            os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), env_p),
            os.path.join('/var/task', env_p),
            os.path.join('/var/task/data', os.path.basename(env_p)),
        ]:
            if os.path.exists(c):
                return c
        return env_p

    base_dir = os.path.dirname(os.path.abspath(__file__))
    root_dir = os.path.dirname(base_dir)
    candidates = [
        os.path.join(root_dir, 'data', filename),
        os.path.join(base_dir, '..', 'data', filename),
        os.path.join(base_dir, 'data', filename),
        os.path.join('/var/task/data', filename),
        os.path.join(root_dir, 'api', 'data', filename),
    ]
    for c in candidates:
        if os.path.exists(c):
            return c
    return os.path.join(root_dir, 'data', filename)

DEFAULT_DB_PATH = _find_db_path('futebol.db')

def get_db():
    db_path = _find_db_path('futebol.db')
    if os.environ.get('VERCEL') and os.path.exists(db_path):
        try:
            conn = sqlite3.connect(f"file:{os.path.abspath(db_path)}?immutable=1", uri=True, timeout=15, check_same_thread=False)
        except Exception:
            try:
                conn = sqlite3.connect(f"file:{os.path.abspath(db_path)}?mode=ro", uri=True, timeout=15, check_same_thread=False)
            except Exception:
                conn = sqlite3.connect(db_path, timeout=15, check_same_thread=False)
    else:
        conn = sqlite3.connect(db_path, timeout=15, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    return conn

@rotas_h2h_canonica_bp.route('/api/confrontos/h2h', methods=['GET'])
def obter_confronto_h2h():
    clube_a_raw = request.args.get('clube_a')
    clube_b_raw = request.args.get('clube_b')

    if not clube_a_raw or not clube_b_raw:
        return jsonify({
            "error": "Parâmetros obrigatórios ausentes. Informe 'clube_a' e 'clube_b'."
        }), 400

    try:
        clube_a_id = int(clube_a_raw)
        clube_b_id = int(clube_b_raw)
    except ValueError:
        return jsonify({
            "error": "Os parâmetros 'clube_a' e 'clube_b' devem ser IDs numéricos inteiros."
        }), 400

    if clube_a_id == clube_b_id:
        return jsonify({
            "error": "Os clubes informados devem ser distintos."
        }), 400

    conn = get_db()
    cursor = conn.cursor()

    # 1. Verifica existência dos dois clubes na dim_clube
    clubes = cursor.execute(
        "SELECT clube_id, nome, sigla, estado, pais FROM dim_clube WHERE clube_id IN (?, ?)",
        (clube_a_id, clube_b_id)
    ).fetchall()

    if len(clubes) < 2:
        conn.close()
        return jsonify({
            "error": "Um ou ambos os clubes informados não foram encontrados no acervo."
        }), 404

    clube_map = {c['clube_id']: dict(c) for c in clubes}
    info_a = clube_map[clube_a_id]
    info_b = clube_map[clube_b_id]

    nome_a = info_a['nome']
    nome_b = info_b['nome']

    # 2. Busca todos os confrontos diretos na tabela partidas
    query = """
        SELECT 
            id_partida,
            data,
            ano,
            campeonato,
            rodada,
            fase,
            estadio,
            mandante,
            visitante,
            gols_mandante,
            gols_visitante,
            placar,
            vencedor
        FROM partidas
        WHERE (mandante = ? AND visitante = ?)
           OR (mandante = ? AND visitante = ?)
        ORDER BY data DESC, id_partida DESC
    """
    partidas = cursor.execute(query, (nome_a, nome_b, nome_b, nome_a)).fetchall()
    conn.close()

    total_jogos = len(partidas)
    vitorias_a = 0
    empates = 0
    vitorias_b = 0
    gols_a = 0
    gols_b = 0

    mando_a_vitorias = 0
    mando_a_empates = 0
    mando_a_derrotas = 0
    mando_a_gols_pro = 0
    mando_a_gols_contra = 0
    mando_a_total = 0

    mando_b_vitorias = 0
    mando_b_empates = 0
    mando_b_derrotas = 0
    mando_b_gols_pro = 0
    mando_b_gols_contra = 0
    mando_b_total = 0

    historico = []
    goleadas = []

    for p in partidas:
        pm = dict(p)
        gm = pm['gols_mandante'] if pm['gols_mandante'] is not None else 0
        gv = pm['gols_visitante'] if pm['gols_visitante'] is not None else 0

        is_a_mandante = (pm['mandante'] == nome_a)
        gols_partida_a = gm if is_a_mandante else gv
        gols_partida_b = gv if is_a_mandante else gm

        gols_a += gols_partida_a
        gols_b += gols_partida_b

        diff = abs(gols_partida_a - gols_partida_b)

        if gols_partida_a > gols_partida_b:
            vitorias_a += 1
            vencedor_id = clube_a_id
        elif gols_partida_b > gols_partida_a:
            vitorias_b += 1
            vencedor_id = clube_b_id
        else:
            empates += 1
            vencedor_id = None

        if is_a_mandante:
            mando_a_total += 1
            mando_a_gols_pro += gm
            mando_a_gols_contra += gv
            if gm > gv:
                mando_a_vitorias += 1
            elif gm < gv:
                mando_a_derrotas += 1
            else:
                mando_a_empates += 1
        else:
            mando_b_total += 1
            mando_b_gols_pro += gm
            mando_b_gols_contra += gv
            if gm > gv:
                mando_b_vitorias += 1
            elif gm < gv:
                mando_b_derrotas += 1
            else:
                mando_b_empates += 1

        pm['vencedor_id'] = vencedor_id
        pm['gols_clube_a'] = gols_partida_a
        pm['gols_clube_b'] = gols_partida_b
        historico.append(pm)

        if diff >= 3:
            goleadas.append({
                "id_partida": pm['id_partida'],
                "data": pm['data'],
                "competicao": pm['campeonato'],
                "mandante": pm['mandante'],
                "visitante": pm['visitante'],
                "placar": f"{gm} x {gv}",
                "diferenca_gols": diff,
                "vencedor_nome": nome_a if vencedor_id == clube_a_id else nome_b
            })

    goleadas.sort(key=lambda x: x['diferenca_gols'], reverse=True)

    return jsonify({
        "clubes": {
            "clube_a": info_a,
            "clube_b": info_b
        },
        "retrospecto_geral": {
            "total_jogos": total_jogos,
            "vitorias_clube_a": vitorias_a,
            "empates": empates,
            "vitorias_clube_b": vitorias_b,
            "gols_clube_a": gols_a,
            "gols_clube_b": gols_b,
            "saldo_gols_clube_a": gols_a - gols_b,
            "aproveitamento_clube_a_pct": round(((vitorias_a * 3 + empates) / (total_jogos * 3)) * 100, 1) if total_jogos > 0 else 0.0,
            "aproveitamento_clube_b_pct": round(((vitorias_b * 3 + empates) / (total_jogos * 3)) * 100, 1) if total_jogos > 0 else 0.0,
            "amostra_insuficiente": total_jogos < 3
        },
        "retrospecto_mando": {
            "clube_a_mandante": {
                "total_jogos": mando_a_total,
                "vitorias": mando_a_vitorias,
                "empates": mando_a_empates,
                "derrotas": mando_a_derrotas,
                "gols_pro": mando_a_gols_pro,
                "gols_contra": mando_a_gols_contra
            },
            "clube_b_mandante": {
                "total_jogos": mando_b_total,
                "vitorias": mando_b_vitorias,
                "empates": mando_b_empates,
                "derrotas": mando_b_derrotas,
                "gols_pro": mando_b_gols_pro,
                "gols_contra": mando_b_gols_contra
            }
        },
        "maiores_goleadas": goleadas[:5],
        "historico_recente": historico[:20]
    }), 200
