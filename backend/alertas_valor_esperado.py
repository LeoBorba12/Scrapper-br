"""
Motor de Alertas e Anomalias Estatísticas de Valor Esperado (+EV) - FutStats 2026
================================================================================
Responsável por escanear o banco canônico, identificar discrepâncias estatísticas
relevantes entre as probabilidades do modelo e as cotações de mercado, e formatar
fichas de investigação estritamente editoriais para o Telegram.

Guardrails Operacionais:
- Sem linguagem tipster ou de recomendação comercial de apostas.
- Foco em integridade, transparência estatística e auditoria de pauta.
- Leitura somente-leitura com conexão resiliente ao SQLite.
"""

import os
import sqlite3
from typing import List, Dict, Any, Optional

def _find_db_path(filename: str = 'futebol.db') -> str:
    """Localiza o arquivo do banco SQLite com múltiplos fallbacks de ambiente."""
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

def get_db_connection() -> sqlite3.Connection:
    """Abre conexão SQLite em modo leitura protegida."""
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

def obter_anomalias_ev(
    min_ev: float = 5.0,
    limite: int = 5,
    ano: Optional[str] = None,
    apenas_pendentes: bool = False
) -> List[Dict[str, Any]]:
    """
    Escaneia a base em busca de anomalias estatísticas onde Odd Mercado > Odd Justa.
    Retorna lista ordenada pelo percentual de +EV decrescente.
    """
    conn = get_db_connection()
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

    if apenas_pendentes:
        query += " AND (p.placar IS NULL OR p.vencedor IS NULL)"

    query += " ORDER BY p.data DESC, p.id_partida DESC LIMIT 300"

    rows = cursor.execute(query, tuple(params)).fetchall()
    conn.close()

    anomalias = []

    for r in rows:
        item = dict(r)

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
                    anomalias.append({
                        "id_partida": item['id_partida'],
                        "data": item['data'],
                        "campeonato": item['campeonato'] or "Campeonato Brasileiro",
                        "mandante": item['mandante'],
                        "visitante": item['visitante'],
                        "placar": item['placar'],
                        "mercado": d['mercado'],
                        "odd_mercado": round(float(odd), 2),
                        "odd_justa_modelo": odd_justa,
                        "probabilidade_modelo_pct": round(p_dec * 100, 1),
                        "ev_percentual": ev_pct,
                        "acerto_historico": d['vencedor_real'],
                        "indicador_confianca": "Alta" if ev_pct >= 8.0 else "Moderada"
                    })

    # Ordenação decrescente de valor esperado (+EV)
    anomalias.sort(key=lambda x: x['ev_percentual'], reverse=True)
    return anomalias[:limite]

def formatar_ficha_telegram(anomalia: Dict[str, Any], dashboard_url: str = "https://scrapper-br.vercel.app") -> str:
    """
    Formata uma única anomalia em Markdown editorial para o Telegram.
    Segue a cartilha de guardrails estabelecida pela consultoria:
    - Sem vocabulário comercial ou incentivo a apostas.
    - Exposição clara da disparidade entre cotação de mercado e modelo estatístico.
    """
    mandante = anomalia.get('mandante', 'Mandante')
    visitante = anomalia.get('visitante', 'Visitante')
    data = anomalia.get('data', 'Data N/D')
    campeonato = anomalia.get('campeonato', 'Competição')
    mercado = anomalia.get('mercado', 'Resultado Final')
    odd_mercado = anomalia.get('odd_mercado', 0.0)
    odd_justa = anomalia.get('odd_justa_modelo', 0.0)
    prob_modelo = anomalia.get('probabilidade_modelo_pct', 0.0)
    ev_pct = anomalia.get('ev_percentual', 0.0)
    confianca = anomalia.get('indicador_confianca', 'Moderada')
    placar = anomalia.get('placar')
    acerto = anomalia.get('acerto_historico')

    # Status de encerramento factual se já resolvido
    status_resolucao = ""
    if placar:
        if acerto is True:
            status_resolucao = f"🏁 *Resultado Factual:* `{placar}` *(Desfecho Confirmado)*\n"
        elif acerto is False:
            status_resolucao = f"🏁 *Resultado Factual:* `{placar}` *(Desfecho Divergente)*\n"
        else:
            status_resolucao = f"🏁 *Placar Final:* `{placar}`\n"

    texto = (
        f"🎯 *FICHA DE ANOMALIA ESTATÍSTICA (+EV)*\n"
        f"━━━━━━━━━━━━━━━━━━━━━\n"
        f"⚽ *{mandante} x {visitante}*\n"
        f"📅 `{data}` • _{campeonato}_\n"
        f"📊 *Mercado Auditado:* `{mercado}`\n\n"
        f"📈 *Disparidade Modelo vs. Mercado:*\n"
        f"• Cotação de Mercado: *{odd_mercado:.2f}*\n"
        f"• Cotação Justa (Modelo): *{odd_justa:.2f}* (Prob: *{prob_modelo:.1f}%*)\n"
        f"• Desvio Teórico (+EV): *+{ev_pct:.2f}%*\n"
        f"• Classificação de Confiança: *{confianca}*\n"
        f"{status_resolucao}\n"
        f"🔍 _Nota Editorial: Anomalia matemática calculada via Poisson/Dixon-Coles em relação à precificação pública. Uso estritamente jornalístico e analítico._\n\n"
        f"🌐 [Investigar no Painel FutStats]({dashboard_url}/?tab=probabilidades)"
    )
    return texto

def gerar_relatorio_resumido_ev(limite: int = 3, min_ev: float = 5.0, dashboard_url: str = "https://scrapper-br.vercel.app") -> str:
    """Gera um digest com as principais anomalias para resposta rápida no Telegram."""
    anomalias = obter_anomalias_ev(min_ev=min_ev, limite=limite)
    if not anomalias:
        return (
            "🎯 *Scanner de Valor Esperado (+EV)*\n\n"
            f"Nenhuma anomalia estatística acima de *+{min_ev:.1f}%* encontrada no recorte atual.\n"
            "Todos os mercados auditados encontram-se alinhados à faixa de precificação teórica."
        )

    linhas = [
        f"🎯 *SCANNER DE ANOMALIAS ESTATÍSTICAS (+EV)*",
        f"Top {len(anomalias)} desvios significativos auditados (corte $\\ge +{min_ev:.1f}\\%$):\n"
    ]

    for i, a in enumerate(anomalias, 1):
        linhas.append(
            f"*{i}. {a['mandante']} x {a['visitante']}*\n"
            f"   • Mercado: `{a['mercado']}`\n"
            f"   • Mercado: *{a['odd_mercado']:.2f}* vs Modelo: *{a['odd_justa_modelo']:.2f}* (EV: *+{a['ev_percentual']:.1f}%*)\n"
            f"   • Confiança: *{a['indicador_confianca']}* | Data: `{a['data']}`"
        )

    linhas.append(f"\n🌐 _Acesse os detalhes no painel:_ {dashboard_url}/?tab=probabilidades")
    linhas.append("🛡️ _Ficha para pauta editorial interna. Não constitui dica ou recomendação._")
    return "\n".join(linhas)
