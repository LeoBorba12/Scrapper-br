"""
Módulo Canônico de Confrontos Diretos (Head-to-Head / H2H) - FutStats 2026
Autor: Gemini Argon & Antigravity Core
"""
import os
import math
import sqlite3
from datetime import datetime
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

def _poisson_pmf(k, lamb):
    if lamb <= 0:
        return 1.0 if k == 0 else 0.0
    return (math.exp(-lamb) * (lamb ** k)) / math.factorial(k)

def _calcular_dixon_coles_projecao(gols_pro_a, gols_contra_a, jogos_a, gols_pro_b, gols_contra_b, jogos_b, confrontos_diretos):
    if jogos_a == 0 or jogos_b == 0:
        return {
            "expectativa_gols": {"clube_a_xg": 1.25, "clube_b_xg": 1.10},
            "probabilidades_1x2": {"vitoria_clube_a_pct": 39.5, "empate_pct": 28.5, "vitoria_clube_b_pct": 32.0},
            "fair_odds": {"odd_clube_a": 2.53, "odd_empate": 3.51, "odd_clube_b": 3.12},
            "placar_mais_provavel": "1 x 1",
            "status_amostra": "amostra_reduzida"
        }

    taxa_ataque_a = max(0.4, min(3.5, gols_pro_a / jogos_a))
    taxa_defesa_a = max(0.4, min(3.5, gols_contra_a / jogos_a))
    taxa_ataque_b = max(0.4, min(3.5, gols_pro_b / jogos_b))
    taxa_defesa_b = max(0.4, min(3.5, gols_contra_b / jogos_b))

    lambda_a = round((taxa_ataque_a * taxa_defesa_b) ** 0.5, 2)
    lambda_b = round((taxa_ataque_b * taxa_defesa_a) ** 0.5, 2)

    prob_vit_a = 0.0
    prob_emp = 0.0
    prob_vit_b = 0.0
    max_p = -1.0
    placar_provavel = "1 x 1"

    for ga in range(7):
        p_ga = _poisson_pmf(ga, lambda_a)
        for gb in range(7):
            p_gb = _poisson_pmf(gb, lambda_b)
            p_joint = p_ga * p_gb

            rho = -0.08
            if ga == 0 and gb == 0:
                p_joint *= (1.0 - lambda_a * lambda_b * rho)
            elif ga == 0 and gb == 1:
                p_joint *= (1.0 + lambda_a * rho)
            elif ga == 1 and gb == 0:
                p_joint *= (1.0 + lambda_b * rho)
            elif ga == 1 and gb == 1:
                p_joint *= (1.0 - rho)

            if p_joint > max_p:
                max_p = p_joint
                placar_provavel = f"{ga} x {gb}"

            if ga > gb:
                prob_vit_a += p_joint
            elif ga < gb:
                prob_vit_b += p_joint
            else:
                prob_emp += p_joint

    soma_p = prob_vit_a + prob_emp + prob_vit_b
    if soma_p > 0:
        prob_vit_a /= soma_p
        prob_emp /= soma_p
        prob_vit_b /= soma_p

    odd_a = round(1.0 / prob_vit_a, 2) if prob_vit_a > 0.01 else 99.0
    odd_x = round(1.0 / prob_emp, 2) if prob_emp > 0.01 else 99.0
    odd_b = round(1.0 / prob_vit_b, 2) if prob_vit_b > 0.01 else 99.0

    return {
        "expectativa_gols": {
            "clube_a_xg": lambda_a,
            "clube_b_xg": lambda_b
        },
        "probabilidades_1x2": {
            "vitoria_clube_a_pct": round(prob_vit_a * 100, 1),
            "empate_pct": round(prob_emp * 100, 1),
            "vitoria_clube_b_pct": round(prob_vit_b * 100, 1)
        },
        "fair_odds": {
            "odd_clube_a": odd_a,
            "odd_empate": odd_x,
            "odd_clube_b": odd_b
        },
        "placar_mais_provavel": placar_provavel,
        "status_amostra": "confiavel" if len(confrontos_diretos) >= 5 else "amostra_reduzida"
    }

def _resolver_nomes_clube_h2h(cursor, clube_ref):
    """
    Resolve um clube (por clube_id int ou nome/alias str) para (dict_clube, set_aliases_lower).
    Nunca utiliza buscas parciais LIKE; garante resolução canônica segura.
    """
    info = None
    if isinstance(clube_ref, int) or (isinstance(clube_ref, str) and clube_ref.strip().isdigit()):
        cid = int(clube_ref)
        row = cursor.execute(
            "SELECT clube_id, nome, sigla, estado, pais FROM dim_clube WHERE clube_id = ?",
            (cid,)
        ).fetchone()
        if row:
            info = dict(row)
    else:
        termo = (clube_ref or '').strip().lower()
        row = cursor.execute(
            "SELECT clube_id, nome, sigla, estado, pais FROM dim_clube WHERE lower(trim(nome)) = ?",
            (termo,)
        ).fetchone()
        if not row:
            row = cursor.execute(
                """
                SELECT d.clube_id, d.nome, d.sigla, d.estado, d.pais
                FROM dim_entidades_aliases a
                JOIN dim_clube d ON d.clube_id = a.entidade_id
                WHERE a.tipo_entidade = 'clube' AND lower(trim(a.alias_nome)) = ?
                LIMIT 1
                """,
                (termo,)
            ).fetchone()
        if row:
            info = dict(row)

    aliases = set()
    if info:
        aliases.add((info['nome'] or '').lower().strip())
        alias_rows = cursor.execute(
            "SELECT alias_nome FROM dim_entidades_aliases WHERE tipo_entidade = 'clube' AND entidade_id = ?",
            (info['clube_id'],)
        ).fetchall()
        for ar in alias_rows:
            if ar['alias_nome']:
                aliases.add(ar['alias_nome'].lower().strip())
    elif isinstance(clube_ref, str) and clube_ref.strip():
        aliases.add(clube_ref.lower().strip())

    aliases.discard('')
    return info, aliases


def _deduplicar_partidas_h2h(rows, nome_a):
    """
    Remove duplicatas históricas de confrontos entre os mesmos clubes:
    - Exclui partidas agendadas/sem placar (ex: placar='vs' ou gols nulos).
    - Deduplica partidas na mesma data (mesmo com mando invertido entre scrapers)
      ou com diferença de até 2 dias e placar idêntico sob a perspectiva do Clube A.
    """
    if isinstance(nome_a, (set, list, tuple)):
        nomes_a_set = {str(n).lower().strip() for n in nome_a if n}
    else:
        nomes_a_set = {str(nome_a or '').lower().strip()} if nome_a else set()

    validas = []
    for p in rows:
        if p['gols_mandante'] is None or p['gols_visitante'] is None:
            continue
        if (p['placar'] or '').strip().lower() == 'vs':
            continue
        validas.append(p)

    # Ordena cronologicamente ascendente para agrupar duplicatas adjacentes
    validas.sort(key=lambda r: ((r['data'] or '')[:10], r['id_partida']))

    dedup = []
    for p in validas:
        d_str = (p['data'] or '')[:10]
        try:
            d_dt = datetime.strptime(d_str, '%Y-%m-%d')
        except ValueError:
            dedup.append(p)
            continue

        is_a_mand = ((p['mandante'] or '').lower().strip() in nomes_a_set)
        ga = p['gols_mandante'] if is_a_mand else p['gols_visitante']
        gb = p['gols_visitante'] if is_a_mand else p['gols_mandante']

        eh_dup = False
        for prev in reversed(dedup):
            prev_str = (prev['data'] or '')[:10]
            try:
                prev_dt = datetime.strptime(prev_str, '%Y-%m-%d')
            except ValueError:
                continue
            delta_dias = abs((d_dt - prev_dt).days)
            if delta_dias > 2:
                break

            prev_a_mand = ((prev['mandante'] or '').lower().strip() in nomes_a_set)
            prev_ga = prev['gols_mandante'] if prev_a_mand else prev['gols_visitante']
            prev_gb = prev['gols_visitante'] if prev_a_mand else prev['gols_mandante']

            # Mesmo dia e mesmo placar (incluindo mando invertido) OU até 2 dias com placar idêntico
            if (ga == prev_ga and gb == prev_gb) or (delta_dias == 0 and ga == prev_gb and gb == prev_ga):
                eh_dup = True
                break

        if not eh_dup:
            dedup.append(p)

    # Restaura ordenação decrescente (mais recente primeiro)
    dedup.sort(key=lambda r: ((r['data'] or '')[:10], r['id_partida']), reverse=True)
    return dedup


def _eh_jogo_amistoso_ou_extra(nome_comp):
    c = (nome_comp or '').lower()
    termos = (
        'amistoso', 'torneio extra', 'taça cidade', 'taça cid.', 'torneio cid.',
        't. roberto ugolini', 't. embaixatriz', 'taça charles miller',
        'torneio dos campeões', 'taça são paulo', 'copa prefeitura', 'troféu'
    )
    return any(t in c for t in termos)


def _categorizar_competicao(nome_comp):
    c = (nome_comp or '').lower()
    if 'brasileir' in c or 'série a' in c or 'serie a' in c or 'taça brasil' in c or 'robertão' in c or 'robertao' in c:
        return 'brasileirao', 'Brasileirão'
    if 'libertadores' in c:
        return 'libertadores', 'Libertadores'
    if 'copa do brasil' in c:
        return 'copa_do_brasil', 'Copa do Brasil'
    if any(k in c for k in ('paulista', 'carioca', 'gaúcho', 'gaucho', 'mineiro', 'baiano', 'paranaense', 'cearense', 'pernambucano', 'estadual', 'torneio rio-sp', 'rio-são paulo')):
        return 'estaduais', 'Estaduais / Regionais'
    return 'outros', 'Outras Competições'


def _categorizar_decada(ano):
    try:
        y = int(ano)
    except (TypeError, ValueError):
        return 'outros', 'Sem Ano'
    if y >= 2020:
        return '2020s', '2020s'
    if y >= 2010:
        return '2010s', '2010s'
    if y >= 2000:
        return '2000s', '2000s'
    if y >= 1990:
        return '1990s', '1990s'
    if y >= 1980:
        return '1980s', '1980s'
    return 'pre1980', 'Pré-1980'


@rotas_h2h_canonica_bp.route('/api/confrontos/clubes', methods=['GET'])
def listar_clubes_confrontos():
    """Retorna o catálogo canônico de clubes brasileiros para os seletores do módulo H2H."""
    conn = get_db()
    cursor = conn.cursor()
    # Prioriza os 20 principais clubes nacionais + demais clubes brasileiros com presença na base
    rows = cursor.execute(
        """
        SELECT d.clube_id, d.nome, d.sigla, d.estado
        FROM dim_clube d
        WHERE d.pais = 'Brasil' OR d.pais IS NULL OR d.pais = ''
        ORDER BY d.nome ASC
        """
    ).fetchall()
    conn.close()
    clubes = [dict(r) for r in rows if r['nome']]
    return jsonify({"total": len(clubes), "clubes": clubes}), 200


@rotas_h2h_canonica_bp.route('/api/confrontos/h2h', methods=['GET'])
def obter_confronto_h2h():
    clube_a_raw = request.args.get('clube_a')
    clube_b_raw = request.args.get('clube_b')
    filtro_camp = (request.args.get('campeonato') or 'todos').strip().lower()
    filtro_decada = (request.args.get('decada') or 'todas').strip().lower()
    filtro_mando = (request.args.get('mando') or 'todos').strip().lower()
    filtro_tipo_jogo = (request.args.get('tipo_jogo') or 'todos').strip().lower()

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

    info_a, names_a = _resolver_nomes_clube_h2h(cursor, clube_a_id)
    info_b, names_b = _resolver_nomes_clube_h2h(cursor, clube_b_id)

    if not info_a or not info_b:
        conn.close()
        return jsonify({
            "error": "Um ou ambos os clubes informados não foram encontrados no acervo."
        }), 404

    nome_a = info_a['nome']
    nome_b = info_b['nome']
    lista_a = sorted(names_a)
    lista_b = sorted(names_b)
    ph_a = ','.join('?' for _ in lista_a)
    ph_b = ','.join('?' for _ in lista_b)

    query = f"""
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
        WHERE (lower(trim(mandante)) IN ({ph_a}) AND lower(trim(visitante)) IN ({ph_b}))
           OR (lower(trim(mandante)) IN ({ph_b}) AND lower(trim(visitante)) IN ({ph_a}))
        ORDER BY data DESC, id_partida DESC
    """
    partidas_raw = cursor.execute(query, lista_a + lista_b + lista_b + lista_a).fetchall()
    partidas_todas = _deduplicar_partidas_h2h(partidas_raw, names_a)

    # Cruzamento histórico completo (por competição e por década)
    comp_buckets = {}
    dec_buckets = {}
    partidas = []

    for p in partidas_todas:
        pm = dict(p)
        gm = pm['gols_mandante'] if pm['gols_mandante'] is not None else 0
        gv = pm['gols_visitante'] if pm['gols_visitante'] is not None else 0
        is_a_mand = ((pm['mandante'] or '').lower().strip() in names_a)
        ga = gm if is_a_mand else gv
        gb = gv if is_a_mand else gm

        comp_key, comp_label = _categorizar_competicao(pm['campeonato'])
        dec_key, dec_label = _categorizar_decada(pm['ano'])

        for store, key, label in ((comp_buckets, comp_key, comp_label), (dec_buckets, dec_key, dec_label)):
            if key not in store:
                store[key] = {
                    "chave": key, "label": label,
                    "total_jogos": 0, "vitorias_a": 0, "empates": 0, "vitorias_b": 0,
                    "gols_a": 0, "gols_b": 0
                }
            b = store[key]
            b["total_jogos"] += 1
            b["gols_a"] += ga
            b["gols_b"] += gb
            if ga > gb:
                b["vitorias_a"] += 1
            elif gb > ga:
                b["vitorias_b"] += 1
            else:
                b["empates"] += 1

        # Filtros táticos
        if filtro_camp != 'todos' and comp_key != filtro_camp and (pm['campeonato'] or '').lower() != filtro_camp:
            continue
        if filtro_decada != 'todas' and dec_key != filtro_decada:
            continue
        if filtro_mando == 'a_mandante' and not is_a_mand:
            continue
        if filtro_mando == 'b_mandante' and is_a_mand:
            continue
        is_amistoso = _eh_jogo_amistoso_ou_extra(pm['campeonato'])
        if filtro_tipo_jogo == 'oficiais' and is_amistoso:
            continue
        if filtro_tipo_jogo == 'amistosos' and not is_amistoso:
            continue
        partidas.append(p)

    # Artilheiros do confronto e Lei do Ex (apenas sobre os IDs das partidas filtradas)
    artilheiros_confronto = []
    lei_do_ex = []
    partidas_ids_filtradas = [p['id_partida'] for p in partidas]
    if partidas_ids_filtradas:
        placeholders = ','.join('?' for _ in partidas_ids_filtradas)
        art_rows = cursor.execute(
            f"""
            SELECT g.id_jogador,
                   COALESCE(je.nome_exibicao, g.atleta) AS nome,
                   g.clube,
                   COUNT(*) AS gols
            FROM gols g
            LEFT JOIN jogadores_estatisticas je ON je.id_jogador = g.id_jogador
            WHERE g.id_partida IN ({placeholders})
              AND g.id_jogador IS NOT NULL AND g.id_jogador > 0
              AND (g.tipo_de_gol IS NULL OR lower(g.tipo_de_gol) NOT LIKE '%contra%')
            GROUP BY g.id_jogador, g.clube
            ORDER BY gols DESC
            LIMIT 8
            """,
            partidas_ids_filtradas
        ).fetchall()
        artilheiros_confronto = [dict(r) for r in art_rows]

        lei_rows = cursor.execute(
            f"""
            SELECT g.id_jogador,
                   COALESCE(je.nome_exibicao, g.atleta) AS nome,
                   SUM(CASE WHEN lower(trim(g.clube)) IN ({ph_a}) THEN 1 ELSE 0 END) AS gols_a,
                   SUM(CASE WHEN lower(trim(g.clube)) IN ({ph_b}) THEN 1 ELSE 0 END) AS gols_b
            FROM gols g
            LEFT JOIN jogadores_estatisticas je ON je.id_jogador = g.id_jogador
            WHERE g.id_partida IN ({placeholders})
              AND g.id_jogador IS NOT NULL AND g.id_jogador > 0
              AND (g.tipo_de_gol IS NULL OR lower(g.tipo_de_gol) NOT LIKE '%contra%')
            GROUP BY g.id_jogador
            HAVING gols_a > 0 AND gols_b > 0
            ORDER BY (gols_a + gols_b) DESC
            LIMIT 10
            """,
            lista_a + lista_b + partidas_ids_filtradas
        ).fetchall()
        lei_do_ex = [dict(r) for r in lei_rows]

    conn.close()

    ordem_comp = ['brasileirao', 'libertadores', 'copa_do_brasil', 'estaduais', 'outros']
    cruzamento_por_competicao = [comp_buckets[k] for k in ordem_comp if k in comp_buckets]
    ordem_dec = ['2020s', '2010s', '2000s', '1990s', '1980s', 'pre1980', 'outros']
    cruzamento_por_decada = [dec_buckets[k] for k in ordem_dec if k in dec_buckets]

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

        is_a_mandante = ((pm['mandante'] or '').lower().strip() in names_a)
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

    projecao = _calcular_dixon_coles_projecao(
        gols_pro_a=gols_a,
        gols_contra_a=gols_b,
        jogos_a=total_jogos,
        gols_pro_b=gols_b,
        gols_contra_b=gols_a,
        jogos_b=total_jogos,
        confrontos_diretos=partidas
    )

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
            },
            "observacao": (
                f"Acervo histórico com predomínio de mando registrado para um dos clubes ({max(mando_a_total, mando_b_total)}/{total_jogos}); "
                "registros centenários em estádios compartilhados podem agrupar mando no Clube A."
            ) if (total_jogos >= 50 and max(mando_a_total, mando_b_total) > 0.70 * total_jogos) else None
        },
        "projecao_dixon_coles": projecao,
        "maiores_goleadas": goleadas[:5],
        "historico_recente": historico[:20],
        "filtros_aplicados": {
            "campeonato": filtro_camp,
            "decada": filtro_decada,
            "mando": filtro_mando,
            "tipo_jogo": filtro_tipo_jogo
        },
        "cruzamento_por_competicao": cruzamento_por_competicao,
        "cruzamento_por_decada": cruzamento_por_decada,
        "artilheiros_confronto": artilheiros_confronto,
        "lei_do_ex": lei_do_ex
    }), 200
