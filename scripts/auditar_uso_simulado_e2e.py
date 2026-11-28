#!/usr/bin/env python3
"""
FutStats - Rotina de Auditoria por Uso Simulado (Sintético E2E)
=================================================================
Simula a jornada de um usuário real pelas abas críticas da dashboard para
detectar automaticamente:
  1. Clubes zerados ou sem jogos no Monte Carlo (ex.: erro de alias Bragantino)
  2. Defasagem de rodadas/jogos entre abas (Oráculo vs Tendência Tática vs Tabela)
  3. Falhas HTTP 5xx, JSON inválido ou ausência de dados espaciais reais
  4. Vazamento de mock/simulação para atletas históricos sem rastreamento
  5. (Opcional --browser) Erros de console JS ou estouro horizontal (scrollWidth) em 1280x800
  6. (Opcional --telegram) Envia alerta automático ao admin se detectar anomalias
"""

import argparse
import json
import os
import sys
import unicodedata
import urllib.error
import urllib.request
from datetime import datetime, timezone

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)


def _norm(t):
    s = unicodedata.normalize("NFKD", (t or "").strip().lower())
    s = "".join(ch for ch in s if not unicodedata.combining(ch))
    return {
        "rb bragantino": "bragantino",
        "rc bragantino": "bragantino",
        "red bull bragantino": "bragantino",
    }.get(s, s)


def _enviar_telegram(msg):
    env_file = os.path.join(BASE_DIR, ".env")
    if os.path.exists(env_file):
        for line in open(env_file, encoding="utf-8"):
            line = line.strip()
            if line and not line.startswith("#") and "=" in line:
                k, v = line.split("=", 1)
                os.environ.setdefault(k.strip(), v.strip().strip("'").strip('"'))
    token = os.environ.get("TELEGRAM_BOT_TOKEN", "").strip()
    chats = os.environ.get("TELEGRAM_ADMIN_CHATS", "") or os.environ.get("TELEGRAM_CHAT_ID", "")
    for cid in [c.strip() for c in chats.split(",") if c.strip()]:
        if not token:
            continue
        try:
            req = urllib.request.Request(
                f"https://api.telegram.org/bot{token}/sendMessage",
                data=json.dumps({"chat_id": cid, "text": msg}).encode("utf-8"),
                headers={"Content-Type": "application/json"},
                method="POST",
            )
            urllib.request.urlopen(req, timeout=8)
        except Exception:
            pass


def _make_fetcher(base_url=None, local_client=None):
    def _get(path):
        if local_client is not None:
            r = local_client.get(path)
            raw = r.get_data(as_text=True)
            try:
                return r.status_code, json.loads(raw), raw
            except Exception:
                return r.status_code, None, raw
        url = f"{base_url.rstrip('/')}{path}"
        req = urllib.request.Request(url, headers={"User-Agent": "FutStats-E2E-Monitor/1.0"})
        try:
            with urllib.request.urlopen(req, timeout=15) as r:
                raw = r.read().decode("utf-8", errors="replace")
                try:
                    return r.status, json.loads(raw), raw
                except Exception:
                    return r.status, None, raw
        except urllib.error.HTTPError as e:
            raw = e.read().decode("utf-8", errors="replace")
            return e.code, None, raw
    return _get


def executar_auditoria_api(get_fn):
    falhas = []
    avisos = []
    metricas = {}

    # 1. Home HTML + Saúde Geral
    st_h, _, html = get_fn("/")
    if st_h != 200 or "FUTSTATS" not in (html or "").upper():
        falhas.append(f"[Home] Status inesperado {st_h} ao carregar /")

    # 2. Oráculo Preditivo - Monte Carlo
    st_mc, d_mc, _ = get_fn("/api/oraculo-preditivo/simular-campeonato")
    if st_mc != 200 or not isinstance(d_mc, dict) or not d_mc.get("sucesso"):
        falhas.append(f"[Oráculo Monte Carlo] Falha HTTP {st_mc}")
        proj = []
    else:
        proj = d_mc.get("projecao") or []
        if len(proj) != 20:
            falhas.append(f"[Oráculo Monte Carlo] Esperado 20 clubes, recebido {len(proj)}")
        zerados = [c["clube"] for c in proj if (c.get("pontos_atuais") or 0) <= 0 or (c.get("jogos") or 0) <= 0]
        if zerados:
            falhas.append(f"[Oráculo Monte Carlo] Clubes com pontos/jogos zerados: {', '.join(zerados)}")
        fora_range = [c["clube"] for c in proj if not (0.0 <= float(c.get("prob_z4_pct", -1)) <= 100.0)]
        if fora_range:
            falhas.append(f"[Oráculo Monte Carlo] Probabilidade Z-4 inválida: {', '.join(fora_range)}")
        metricas["monte_carlo_max_jogos"] = max((c.get("jogos", 0) for c in proj), default=0)

    # 3. Tendência Tática (20 clubes + VM)
    st_tat, d_tat, _ = get_fn("/api/spatial/tendencias-taticas")
    if st_tat != 200 or not isinstance(d_tat, dict) or not d_tat.get("sucesso"):
        falhas.append(f"[Tendência Tática] Falha HTTP {st_tat}")
        tat_clubes = []
    else:
        tat_clubes = d_tat.get("clubes") or []
        if len(tat_clubes) < 20:
            falhas.append(f"[Tendência Tática] Apenas {len(tat_clubes)} clubes retornados")
        if not d_tat.get("tem_dados_espaciais_vm"):
            avisos.append("[Tendência Tática] Ponte VM sem dados espaciais no momento")
        sem_ppda = [c["clube_nome"] for c in tat_clubes if c.get("ppda") is None or c.get("altura_defensiva") is None]
        if sem_ppda:
            falhas.append(f"[Tendência Tática] Clubes sem PPDA/Linha: {', '.join(sem_ppda)}")
        metricas["tatico_max_jogos"] = max((c.get("jogos", 0) for c in tat_clubes), default=0)

    # 4. Consistência Cruzada entre Oráculo Monte Carlo e Tendência Tática
    if proj and tat_clubes:
        tat_map = {_norm(c["clube_nome"]): c for c in tat_clubes}
        for c_mc in proj:
            t_ref = tat_map.get(_norm(c_mc["clube"]))
            if not t_ref:
                continue
            diff_j = abs(int(c_mc.get("jogos") or 0) - int(t_ref.get("jogos") or 0))
            diff_pts = abs(int(c_mc.get("pontos_atuais") or 0) - int(t_ref.get("pontos") or 0))
            if diff_j > 1 or diff_pts > 3:
                falhas.append(
                    f"[Divergência entre Abas] {c_mc['clube']}: MonteCarlo({c_mc.get('jogos')}J/{c_mc.get('pontos_atuais')}pts) != Tático({t_ref.get('jogos')}J/{t_ref.get('pontos')}pts)"
                )

    # 5. Métricas Avançadas Meta + Ranking
    st_meta, d_meta, _ = get_fn("/api/metricas-avancadas/meta")
    if st_meta != 200 or not isinstance(d_meta, dict) or not d_meta.get("sucesso"):
        falhas.append(f"[Métricas Avançadas] /meta retornou HTTP {st_meta}")

    # 6. Heatmaps Reais vs Sem Mock Sintético
    st_sp, d_sp, _ = get_fn("/api/spatial/atleta/1260?nome=Kevin%20Viveros")
    if st_sp != 200 or not isinstance(d_sp, dict) or not d_sp.get("found") or not d_sp.get("heatmap"):
        avisos.append("[Heatmap Real] Atleta referência 1260 sem heatmap retornado")

    st_hist, d_hist, _ = get_fn("/api/spatial/atleta/999999?nome=Zico")
    if st_hist != 200 or (isinstance(d_hist, dict) and d_hist.get("found") is True):
        falhas.append("[Honestidade de Dados] Atleta sem tracking retornou found=True inesperado")

    # 7. Amostragem Aleatória de Atletas e Drift Check no Monte Carlo
    if proj:
        inconsistentes = [
            c["clube"]
            for c in proj
            if int(c.get("pontos_atuais") or 0) > int(c.get("jogos") or 0) * 3
            or int(c.get("jogos") or 0) > 38
        ]
        if inconsistentes:
            falhas.append(f"[Sanidade Matemática Monte Carlo] Pontos > jogos*3 ou jogos > 38: {', '.join(inconsistentes)}")

    # 8. Auth Guardrail (admin endpoint deve recusar sem token)
    st_adm, _, _ = get_fn("/api/admin/equipe")
    if st_adm not in (401, 403):
        falhas.append(f"[Segurança Admin] /api/admin/equipe sem token retornou {st_adm} em vez de 403")

    return {"falhas": falhas, "avisos": avisos, "metricas": metricas}


def executar_auditoria_browser(base_url):
    """Executa auditoria visual e de console via Playwright se instalado."""
    try:
        from playwright.sync_api import sync_playwright
    except Exception:
        return [], ["Playwright não instalado neste ambiente; auditoria visual ignorada."]

    falhas = []
    avisos = []
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(viewport={"width": 1280, "height": 800})
        console_errs = []
        page.on("console", lambda m: console_errs.append(m.text) if m.type == "error" else None)
        page.on("pageerror", lambda err: console_errs.append(str(err)))

        for tab in ("campeonato", "probabilidades", "oraculo-preditivo", "metricas-avancadas"):
            page.goto(f"{base_url.rstrip('/')}/?tab={tab}", wait_until="networkidle", timeout=25000)
            overflow = page.evaluate("() => document.documentElement.scrollWidth > window.innerWidth")
            if overflow:
                avisos.append(f"[Layout 1280x800] Overflow horizontal detectado na aba ?tab={tab}")
        browser.close()
        if console_errs:
            falhas.append(f"[Browser Console] {len(console_errs)} erro(s) JS: {console_errs[0][:160]}")
    return falhas, avisos


def main():
    parser = argparse.ArgumentParser(description="Auditoria por uso simulado E2E do FutStats")
    parser.add_argument("--url", default="https://scrapper-br.vercel.app")
    parser.add_argument("--local", action="store_true", help="Testa em memória contra backend/app.py")
    parser.add_argument("--browser", action="store_true", help="Executa também verificação Playwright 1280x800")
    parser.add_argument("--telegram", action="store_true", help="Envia alerta no Telegram em caso de falha")
    args = parser.parse_args()

    if args.local:
        from backend.app import app
        app.config["TESTING"] = True
        get_fn = _make_fetcher(local_client=app.test_client())
        alvo = "LOCAL (Flask TestClient)"
    else:
        get_fn = _make_fetcher(base_url=args.url)
        alvo = args.url

    res = executar_auditoria_api(get_fn)
    if args.browser and not args.local:
        bf, ba = executar_auditoria_browser(args.url)
        res["falhas"].extend(bf)
        res["avisos"].extend(ba)

    ts = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S UTC")
    print(f"=== AUDITORIA USO SIMULADO ({alvo}) @ {ts} ===")
    print("Métricas:", json.dumps(res["metricas"], ensure_ascii=False))
    if res["avisos"]:
        print("Avisos:")
        for a in res["avisos"]:
            print("  !", a)
    if res["falhas"]:
        print("FALHAS:")
        for f in res["falhas"]:
            print("  X", f)
        if args.telegram:
            txt = f"🚨 *Alerta Auditoria Simulada FutStats*\nAlvo: `{alvo}`\n\n" + "\n".join(f"• {x}" for x in res["falhas"][:8])
            _enviar_telegram(txt)
        sys.exit(1)

    print("STATUS: OK (0 falhas críticas)")
    sys.exit(0)


if __name__ == "__main__":
    main()
