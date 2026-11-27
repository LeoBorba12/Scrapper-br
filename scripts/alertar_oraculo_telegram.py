# -*- coding: utf-8 -*-
"""
Alertas Pré-Rodada & Value Bets do Oráculo Preditivo via Telegram.

Compara as probabilidades justas do Oráculo Híbrido (Pi-Ratings + Dixon-Coles +
Forma 5J + Troca de Técnico + Desfalques DM/Suspensos + Clima Open-Meteo)
contra odds reais de mercado em `odds_partidas` (ignorando odds sintéticas
padrão 2.10 / 3.20 / 3.50) e envia um boletim objetivo para o Telegram.

Uso:
  python scripts/alertar_oraculo_telegram.py --dry-run
  python scripts/alertar_oraculo_telegram.py --dias 7
  python scripts/alertar_oraculo_telegram.py --force
"""
import argparse
import datetime
import json
import os
import sqlite3
import sys
import urllib.request

ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if ROOT_DIR not in sys.path:
    sys.path.insert(0, ROOT_DIR)

from backend.motor_oraculo_preditivo import simular_partida_hibrida
from backend.rotas_oraculo_preditivo import (
    _calcular_forma_recente_5,
    _detectar_mudanca_tecnico,
    _detectar_suspensos_clube,
    _obter_clima_open_meteo,
    _ultimo_descanso_clube,
)

DB_PATH = os.path.join(ROOT_DIR, "data", "futebol.db")


def _carregar_env_local():
    env_path = os.path.join(ROOT_DIR, ".env")
    if not os.path.exists(env_path):
        return
    with open(env_path, "r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if not line or line.startswith("#") or "=" not in line:
                continue
            k, v = line.split("=", 1)
            k = k.strip()
            v = v.strip().strip('"').strip("'")
            if k and k not in os.environ:
                os.environ[k] = v


def _eh_odd_sintetica(om, oe, ov) -> bool:
    if not om or not oe or not ov:
        return True
    try:
        om_f, oe_f, ov_f = float(om), float(oe), float(ov)
    except Exception:
        return True
    if om_f <= 1.01 or oe_f <= 1.01 or ov_f <= 1.01:
        return True
    return abs(om_f - 2.10) < 0.01 and abs(oe_f - 3.20) < 0.01 and abs(ov_f - 3.50) < 0.01


def _buscar_proximos_jogos(cur, dias_janela: int):
    hoje = datetime.date.today()
    limite = (hoje + datetime.timedelta(days=dias_janela)).isoformat()
    hoje_iso = hoje.isoformat()

    # Busca partidas futuras ou de hoje com clubes mapeados no Pi-Rating / Contexto Econômico
    rows = cur.execute(
        """
        SELECT p.id_partida, p.data, p.mandante, p.visitante,
               o.odd_mandante, o.odd_empate, o.odd_visitante
        FROM partidas p
        LEFT JOIN odds_partidas o ON o.id_partida = p.id_partida
        WHERE p.ano >= 2026
          AND (p.gols_mandante IS NULL OR p.gols_visitante IS NULL)
          AND p.data >= ? AND p.data <= ?
          AND p.mandante IN (SELECT clube FROM clube_contexto_economico)
          AND p.visitante IN (SELECT clube FROM clube_contexto_economico)
        ORDER BY p.data ASC, p.id_partida ASC
        LIMIT 10;
        """,
        (hoje_iso, limite),
    ).fetchall()
    return rows


def _carregar_contexto_clube(cur, clube: str):
    pi = cur.execute("SELECT * FROM clube_pi_ratings WHERE LOWER(clube) = LOWER(?);", (clube,)).fetchone()
    eco = cur.execute("SELECT * FROM clube_contexto_economico WHERE LOWER(clube) = LOWER(?);", (clube,)).fetchone()
    return dict(pi) if pi else {}, dict(eco) if eco else {}


def gerar_boletim(dias_janela: int = 7, min_edge_pct: float = 5.0):
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cur = conn.cursor()

    jogos = _buscar_proximos_jogos(cur, dias_janela=dias_janela)
    if not jogos:
        conn.close()
        return None, 0, 0

    linhas = [
        f"🔮 *ORÁCULO FUTSTATS — BOLETIM PRÉ-RODADA* ({datetime.date.today().strftime('%d/%m/%Y')})",
        "",
    ]
    total_value = 0

    for j in jogos:
        m = j["mandante"]
        v = j["visitante"]
        pi_m, eco_m = _carregar_contexto_clube(cur, m)
        pi_v, eco_v = _carregar_contexto_clube(cur, v)

        forma_m = _calcular_forma_recente_5(cur, m)
        forma_v = _calcular_forma_recente_5(cur, v)
        tec_m = _detectar_mudanca_tecnico(cur, m)
        tec_v = _detectar_mudanca_tecnico(cur, v)
        susp_m = _detectar_suspensos_clube(cur, m)
        susp_v = _detectar_suspensos_clube(cur, v)
        desc_m = _ultimo_descanso_clube(cur, m)
        desc_v = _ultimo_descanso_clube(cur, v)
        clima = _obter_clima_open_meteo(eco_m.get("cidade") or "")

        # Carrega detalhes RAPM para desfalques reconciliados
        def _carregar_desfalques_rapm(susp_list):
            if not susp_list:
                return []
            ids = [s["id_jogador"] for s in susp_list if s.get("id_jogador")]
            if not ids:
                return []
            ph = ",".join("?" for _ in ids)
            rows_r = cur.execute(
                f"SELECT id_jogador, nome, rapm_saldo_gols FROM atleta_rapm_scores WHERE id_jogador IN ({ph});",
                ids,
            ).fetchall()
            return [dict(r) for r in rows_r]

        sim = simular_partida_hibrida(
            mandante=m,
            visitante=v,
            pi_m=pi_m,
            pi_v=pi_v,
            econ_m=eco_m,
            econ_v=eco_v,
            desfalques_m=_carregar_desfalques_rapm(susp_m),
            desfalques_v=_carregar_desfalques_rapm(susp_v),
            dias_descanso_m=desc_m,
            dias_descanso_v=desc_v,
            forma_m=forma_m,
            forma_v=forma_v,
            tecnico_m=tec_m,
            tecnico_v=tec_v,
            clima_prejogo=clima,
        )
        p = sim["probabilidades"]

        linhas.append(f"⚽ *{m} x {v}* ({j['data']})")
        linhas.append(
            f"   Prob: {p['prob_mandante']}% / {p['prob_empate']}% / {p['prob_visitante']}% | "
            f"xG: {sim['lambda_mandante']} x {sim['lambda_visitante']}"
        )
        linhas.append(
            f"   Fair Odds: {p['fair_odd_mandante']} / {p['fair_odd_empate']} / {p['fair_odd_visitante']}"
        )
        if clima:
            icone = "🌧️" if clima["chuva_mm"] >= 1.0 else "☀️"
            linhas.append(
                f"   Clima ({clima['cidade']}): {icone} {clima['temperatura_c']}°C • {clima['chuva_mm']}mm"
            )
        if susp_m or susp_v:
            linhas.append(f"   Desfalques auto: {m} ({len(susp_m)}) | {v} ({len(susp_v)})")

        # Checagem honesta de Value Bet (somente odds reais de mercado)
        if not _eh_odd_sintetica(j["odd_mandante"], j["odd_empate"], j["odd_visitante"]):
            mercados = [
                (f"Vitória {m}", p["prob_mandante"] / 100.0, float(j["odd_mandante"])),
                ("Empate", p["prob_empate"] / 100.0, float(j["odd_empate"])),
                (f"Vitória {v}", p["prob_visitante"] / 100.0, float(j["odd_visitante"])),
            ]
            for lbl, prob_oraculo, odd_mkt in mercados:
                ev_pct = (prob_oraculo * odd_mkt - 1.0) * 100.0
                if ev_pct >= min_edge_pct:
                    total_value += 1
                    linhas.append(
                        f"   🚨 *VALUE BET (+{ev_pct:.1f}% EV)*: {lbl} @ {odd_mkt:.2f} "
                        f"(Fair: {1.0 / max(prob_oraculo, 0.01):.2f})"
                    )
        linhas.append("")

    linhas.append("🌐 Simulador ao vivo: https://scrapper-br.vercel.app/?tab=oraculo-preditivo")
    conn.close()
    return "\n".join(linhas), len(jogos), total_value


def enviar_telegram(texto: str) -> bool:
    token = os.getenv("TELEGRAM_BOT_TOKEN", "").strip()
    chat_id = os.getenv("TELEGRAM_CHAT_ID", "").strip()
    if not token or not chat_id:
        print("[AVISO] TELEGRAM_BOT_TOKEN ou TELEGRAM_CHAT_ID não definidos no ambiente.")
        return False
    url = f"https://api.telegram.org/bot{token}/sendMessage"
    payload = json.dumps(
        {
            "chat_id": chat_id,
            "text": texto,
            "parse_mode": "Markdown",
            "disable_web_page_preview": True,
        }
    ).encode("utf-8")
    req = urllib.request.Request(url, data=payload, headers={"Content-Type": "application/json"})
    with urllib.request.urlopen(req, timeout=10) as resp:
        return resp.status == 200


def main():
    _carregar_env_local()
    parser = argparse.ArgumentParser(description="Boletim pré-rodada do Oráculo no Telegram")
    parser.add_argument("--dias", type=int, default=3, help="Janela de dias futuros (padrão: 3)")
    parser.add_argument("--min-edge", type=float, default=5.0, help="EV mínimo em %% para marcar Value Bet")
    parser.add_argument("--dry-run", action="store_true", help="Apenas imprime o boletim sem enviar ao Telegram")
    args = parser.parse_args()

    msg, n_jogos, n_val = gerar_boletim(dias_janela=args.dias, min_edge_pct=args.min_edge)
    if not msg:
        print(f"Nenhum jogo da Série A na janela dos próximos {args.dias} dias.")
        return

    if args.dry_run:
        print(msg)
        print(f"\n[DRY-RUN] jogos={n_jogos}, value_bets={n_val}")
        return

    ok = enviar_telegram(msg)
    print(f"Envio Telegram: ok={ok}, jogos={n_jogos}, value_bets={n_val}")


if __name__ == "__main__":
    main()
