#!/usr/bin/env python3
"""
FutStats — Execução do Desafio 14 (Banco de Dados):
1. Criação da tabela faixas_incerteza_modelo.
2. Calibração empírica de incerteza por faixa de probabilidade na temporada 2023 (Validação).
3. Inserção das métricas calculadas em faixas_incerteza_modelo.
4. Adição das colunas de governança e prazo de revisão em odds_ingestao_status.
5. Povoamento da política de quarentena (90 dias de prazo, responsável, origem).
6. Otimização de armazenamento e verificação de teto (<= 88.0 MB, journal_mode=DELETE).
"""

import sqlite3
import math
from collections import defaultdict
from datetime import datetime, timedelta
from pathlib import Path
import os

DB_PATH = Path("data/futebol.db")

def poisson_pmf(lmbda, k):
    if lmbda <= 0: return 1.0 if k == 0 else 0.0
    return (math.exp(-lmbda) * (lmbda ** k)) / math.factorial(k)

def calc_dixon_coles(lh, la, rho=-0.12):
    max_gols = 8
    p_matrix = [[0.0 for _ in range(max_gols + 1)] for _ in range(max_gols + 1)]
    for x in range(max_gols + 1):
        for y in range(max_gols + 1):
            base = poisson_pmf(lh, x) * poisson_pmf(la, y)
            adj = 1.0
            if x == 0 and y == 0: adj = 1.0 - (lh * la * rho)
            elif x == 0 and y == 1: adj = 1.0 + (lh * rho)
            elif x == 1 and y == 0: adj = 1.0 + (la * rho)
            elif x == 1 and y == 1: adj = 1.0 - rho
            p_matrix[x][y] = max(0.0, base * adj)
    total = sum(sum(row) for row in p_matrix) or 1.0
    ph, pd, pa = 0.0, 0.0, 0.0
    for x in range(max_gols + 1):
        for y in range(max_gols + 1):
            val = p_matrix[x][y] / total
            if x > y: ph += val
            elif x == y: pd += val
            else: pa += val
    s = ph + pd + pa
    return ph / s, pd / s, pa / s

def aplicar_tau(ph, pd, pa, tau=0.84):
    eps = 1e-9
    logits = [math.log(max(ph, eps)), math.log(max(pd, eps)), math.log(max(pa, eps))]
    scaled = [z / tau for z in logits]
    max_s = max(scaled)
    exp_scaled = [math.exp(s - max_s) for s in scaled]
    sum_exp = sum(exp_scaled)
    return exp_scaled[0] / sum_exp, exp_scaled[1] / sum_exp, exp_scaled[2] / sum_exp

def main():
    print("=== INICIANDO EXECUÇÃO BANCO DE DADOS - DESAFIO 14 ===")
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()

    # 1. Criar tabela faixas_incerteza_modelo
    print("\n[1/5] Criando tabela faixas_incerteza_modelo...")
    cur.execute("""
    CREATE TABLE IF NOT EXISTS faixas_incerteza_modelo (
      faixa TEXT PRIMARY KEY,
      desvio_padrao REAL NOT NULL,
      amostra INTEGER NOT NULL,
      calculado_em TEXT NOT NULL
    );
    """)
    conn.commit()

    # 2. Calcular desvio por faixa estritamente na validação de 2023
    print("\n[2/5] Calculando incerteza empírica na validação de 2023...")
    cur.execute("""
    SELECT p.id_partida, p.ano, p.mandante, p.visitante, p.gols_mandante, p.gols_visitante
    FROM partidas p
    WHERE p.gols_mandante IS NOT NULL AND p.gols_visitante IS NOT NULL AND p.ano <= 2023
    ORDER BY p.data ASC, p.id_partida ASC;
    """)
    partidas = cur.fetchall()

    hist_times = defaultdict(lambda: {"gp": [], "gc": []})
    validacao_2023 = []

    for p in partidas:
        pid, ano, m, v, gm, gv = p
        hm = hist_times[m]
        hv = hist_times[v]
        media_gp_m = sum(hm["gp"][-20:]) / len(hm["gp"][-20:]) if len(hm["gp"]) >= 3 else 1.35
        media_gc_v = sum(hv["gc"][-20:]) / len(hv["gc"][-20:]) if len(hv["gc"]) >= 3 else 1.35
        media_gp_v = sum(hv["gp"][-20:]) / len(hv["gp"][-20:]) if len(hv["gp"]) >= 3 else 1.05
        media_gc_m = sum(hm["gc"][-20:]) / len(hm["gc"][-20:]) if len(hm["gc"]) >= 3 else 1.05

        lh = max(0.6, min(3.2, ((media_gp_m + media_gc_v) / 2.4) * 1.32))
        la = max(0.5, min(2.8, ((media_gp_v + media_gc_m) / 2.4) * 0.98))

        ph, pd, pa = calc_dixon_coles(lh, la, rho=-0.12)
        cph, cpd, cpa = aplicar_tau(ph, pd, pa, tau=0.84)

        hm["gp"].append(gm)
        hm["gc"].append(gv)
        hv["gp"].append(gv)
        hv["gc"].append(gm)

        if ano == 2023:
            yh = 1.0 if gm > gv else 0.0
            yd = 1.0 if gm == gv else 0.0
            ya = 1.0 if gv > gm else 0.0
            validacao_2023.append((cph, yh))
            validacao_2023.append((cpd, yd))
            validacao_2023.append((cpa, ya))

    print(f"Total de previsões individuais em 2023: {len(validacao_2023)}")

    faixas_def = [
        ("0.00-0.20", 0.00, 0.20),
        ("0.20-0.30", 0.20, 0.30),
        ("0.30-0.40", 0.30, 0.40),
        ("0.40-0.50", 0.40, 0.50),
        ("0.50-0.60", 0.50, 0.60),
        ("0.60-1.00", 0.60, 1.00),
    ]

    agora_iso = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    cur.execute("DELETE FROM faixas_incerteza_modelo")
    for nome, lim_inf, lim_sup in faixas_def:
        amostras = [y for p, y in validacao_2023 if lim_inf <= p < lim_sup or (lim_sup == 1.00 and p >= lim_sup)]
        n = len(amostras)
        if n >= 30:
            p_obs = sum(amostras) / n
            # Erro padrão da proporção da faixa: SE = sqrt( p * (1 - p) / n )
            se = math.sqrt(max(1e-6, p_obs * (1.0 - p_obs)) / n)
            se_arredondado = round(se, 4)
            cur.execute("""
            INSERT INTO faixas_incerteza_modelo (faixa, desvio_padrao, amostra, calculado_em)
            VALUES (?, ?, ?, ?)
            """, (nome, se_arredondado, n, agora_iso))
            print(f" -> Faixa {nome}: N={n:4d} | SE={se_arredondado:.4f} | IC_95%=±{se_arredondado * 1.96 * 100:.2f}%")
        else:
            print(f" -> Faixa {nome}: Amostra insuficiente (N={n} < 30). Incerteza não calibrada.")

    conn.commit()

    # 3. Alterar odds_ingestao_status para adicionar colunas de governança
    print("\n[3/5] Atualizando schema de odds_ingestao_status com colunas de governança...")
    cols_existentes = [r[1] for r in cur.execute("PRAGMA table_info(odds_ingestao_status)").fetchall()]
    if "prazo_revisao" not in cols_existentes:
        cur.execute("ALTER TABLE odds_ingestao_status ADD COLUMN prazo_revisao TEXT")
    if "responsavel_auditoria" not in cols_existentes:
        cur.execute("ALTER TABLE odds_ingestao_status ADD COLUMN responsavel_auditoria TEXT")
    if "origem_correcao" not in cols_existentes:
        cur.execute("ALTER TABLE odds_ingestao_status ADD COLUMN origem_correcao TEXT")
    conn.commit()

    # 4. Atualizar registros em quarentena com prazo de 90 dias e responsável
    print("\n[4/5] Aplicando política de quarentena (90 dias de retenção para descarte)...")
    prazo_90d = (datetime.now() + timedelta(days=90)).strftime("%Y-%m-%d")
    cur.execute("""
    UPDATE odds_ingestao_status
    SET prazo_revisao = ?,
        responsavel_auditoria = 'auditor_qualidade_gate',
        origem_correcao = 'cold_archive_analise'
    WHERE status = 'quarentena' AND prazo_revisao IS NULL
    """, (prazo_90d,))
    atualizados = cur.rowcount
    print(f" -> Registros em quarentena atualizados com prazo {prazo_90d}: {atualizados}")

    # Também definir responsáveis para os aprovados
    cur.execute("""
    UPDATE odds_ingestao_status
    SET responsavel_auditoria = 'quality_gate_microeconomico'
    WHERE status = 'aprovado' AND responsavel_auditoria IS NULL
    """)

    conn.commit()

    # 5. Registrar governança e executar VACUUM
    print("\n[5/5] Executando VACUUM e verificando conformidade de armazenamento...")
    cur.execute("PRAGMA journal_mode = DELETE;")
    cur.execute("VACUUM;")
    conn.commit()

    # Checagens finais
    tamanho_mb = os.path.getsize(DB_PATH) / (1024 * 1024)
    jm = cur.execute("PRAGMA journal_mode;").fetchone()[0]
    total_quarentena = cur.execute("SELECT COUNT(1) FROM odds_ingestao_status WHERE status = 'quarentena'").fetchone()[0]
    total_aprovados = cur.execute("SELECT COUNT(1) FROM odds_ingestao_status WHERE status = 'aprovado'").fetchone()[0]

    # Inserir no histórico de governança
    partidas_cnt = cur.execute("SELECT COUNT(1) FROM partidas").fetchone()[0]
    gols_cnt = cur.execute("SELECT COUNT(1) FROM gols").fetchone()[0]
    cur.execute("""
    INSERT INTO governanca_banco (executado_em, tamanho_mb, partidas, gols, escalacoes, cartoes, odds, acao_executada)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        agora_iso,
        round(tamanho_mb, 2),
        partidas_cnt,
        gols_cnt,
        0, 0,
        total_aprovados + total_quarentena,
        "Desafio 14: faixas_incerteza_modelo e politicas de quarentena"
    ))
    conn.commit()
    conn.close()

    print(f"\nSTATUS FINAL BANCO:")
    print(f" -> Tamanho: {tamanho_mb:.2f} MB (Teto Vercel: 94.0 MB | Soft Limit: 88.0 MB)")
    print(f" -> Folga para o Teto: {94.0 - tamanho_mb:.2f} MB")
    print(f" -> Journal Mode: {jm}")
    print(f" -> Quarentena: {total_quarentena} | Aprovados: {total_aprovados}")

    assert tamanho_mb < 88.0, f"Banco estourou o limite de 88.0 MB: {tamanho_mb:.2f} MB"
    assert jm.lower() == "delete", f"Journal mode incorreto: {jm}"
    print("\nSUCESSO: Passo 1 (Banco de Dados) concluído com 100% de conformidade!")

if __name__ == "__main__":
    main()
