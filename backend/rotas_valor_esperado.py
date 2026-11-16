"""
Módulo Canônico de Valor Esperado (+EV) e Anomalias de Mercado - FutStats 2026
Autor: Gemini Argon & Antigravity Core
"""
import os
import sqlite3
from flask import Blueprint, request, jsonify

rotas_valor_esperado_bp = Blueprint('rotas_valor_esperado', __name__)

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

@rotas_valor_esperado_bp.route('/api/mercados/valor-esperado', methods=['GET'])
def listar_oportunidades_ev():
    try:
        min_ev = float(request.args.get('min_ev', 2.0)) # Mínimo 2% de +EV por padrão
    except ValueError:
        min_ev = 2.0

    try:
        limite = min(100, max(5, int(request.args.get('limite', 30))))
    except ValueError:
        limite = 30

    ano = request.args.get('ano')

    conn = get_db()
    cursor = conn.cursor()

    query = """
        SELECT 
            p.id_partida,
            p.data,
            p.ano,
            p.campeonato,
            p.mandante,
            p.visitante,
            p.placar,
            p.vencedor,
            op.odd_pinnacle_mandante,
            op.odd_pinnacle_empate,
            op.odd_pinnacle_visitante,
            op.odd_b365_mandante,
            op.odd_b365_empate,
            op.odd_b365_visitante,
            op.prob_mandante,
            op.prob_empate,
            op.prob_visitante,
            op.status_zebra
        FROM odds_partidas op
        JOIN partidas p ON op.id_partida = p.id_partida
        WHERE (op.prob_mandante > 0 OR op.prob_empate > 0 OR op.prob_visitante > 0)
    """
    params = []
    if ano:
        query += " AND p.ano = ?"
        params.append(ano)

    query += " ORDER BY p.data DESC LIMIT 300"

    rows = cursor.execute(query, tuple(params)).fetchall()
    conn.close()

    oportunidades = []

    for r in rows:
        item = dict(r)
        
        # Analisa os 3 desfechos (Casa, Empate, Fora)
        desfechos = [
            {
                "mercado": "Vitória Mandante (1)",
                "odd_mercado": item['odd_pinnacle_mandante'] or item['odd_b365_mandante'],
                "prob_modelo": item['prob_mandante'],
                "vencedor_real": item['vencedor'] == item['mandante'] if item['vencedor'] else None
            },
            {
                "mercado": "Empate (X)",
                "odd_mercado": item['odd_pinnacle_empate'] or item['odd_b365_empate'],
                "prob_modelo": item['prob_empate'],
                "vencedor_real": item['vencedor'] == 'Empate' if item['vencedor'] else None
            },
            {
                "mercado": "Vitória Visitante (2)",
                "odd_mercado": item['odd_pinnacle_visitante'] or item['odd_b365_visitante'],
                "prob_modelo": item['prob_visitante'],
                "vencedor_real": item['vencedor'] == item['visitante'] if item['vencedor'] else None
            }
        ]

        for d in desfechos:
            odd = d['odd_mercado']
            prob_pct = d['prob_modelo']

            if odd and prob_pct and odd > 1.0 and prob_pct > 0:
                p_dec = prob_pct / 100.0 if prob_pct > 1.0 else prob_pct
                ev = (p_dec * odd) - 1.0
                ev_pct = round(ev * 100, 2)

                if ev_pct >= min_ev:
                    odd_justa = round(1.0 / p_dec, 2) if p_dec > 0 else 99.0
                    oportunidades.append({
                        "id_partida": item['id_partida'],
                        "data": item['data'],
                        "campeonato": item['campeonato'],
                        "mandante": item['mandante'],
                        "visitante": item['visitante'],
                        "placar": item['placar'],
                        "mercado": d['mercado'],
                        "odd_mercado": odd,
                        "odd_justa_modelo": odd_justa,
                        "probabilidade_modelo_pct": round(p_dec * 100, 1),
                        "ev_percentual": ev_pct,
                        "acerto_historico": d['vencedor_real'],
                        "indicador_confianca": "Alta" if ev_pct >= 8.0 else "Moderada"
                    })

    # Ordena decrescente pelo Valor Esperado (+EV%)
    oportunidades.sort(key=lambda x: x['ev_percentual'], reverse=True)
    resultado = oportunidades[:limite]

    total_acertos = len([o for o in resultado if o['acerto_historico'] is True])
    total_resolvidos = len([o for o in resultado if o['acerto_historico'] is not None])
    win_rate = round((total_acertos / total_resolvidos) * 100, 1) if total_resolvidos > 0 else 0.0

    return jsonify({
        "filtros_aplicados": {
            "min_ev_pct": min_ev,
            "limite": limite,
            "ano": ano
        },
        "resumo_performance": {
            "total_oportunidades_encontradas": len(oportunidades),
            "total_retornadas": len(resultado),
            "taxa_acerto_historico_pct": win_rate,
            "ev_medio_pct": round(sum(o['ev_percentual'] for o in resultado) / len(resultado), 2) if resultado else 0.0
        },
        "oportunidades": resultado
    }), 200
