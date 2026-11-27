# -*- coding: utf-8 -*-
"""
Sprint 2 — Camada Estrutural Econômica dos 20 Clubes da Série A 2026
Registra dados públicos estruturais (Cidade/UF, PIB Municipal IBGE em R$ bi, População RM em milhões,
flag SAF e Índice de Orçamento Relativo normalizado 0.5–1.5) na tabela `clube_contexto_economico`.
"""
import datetime
import os
import sqlite3

DB_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data", "futebol.db")

# Dados estruturais públicos (IBGE PIB/População RM + relatórios públicos Itaú BBA / Convocados / SAF)
CLUBES_ECONOMIA_2026 = [
    ("Flamengo", "Rio de Janeiro", "RJ", 359.6, 13.0, 0, 1.48, "Tier 1 - Gigante Financeiro"),
    ("Palmeiras", "São Paulo", "SP", 828.9, 21.5, 0, 1.42, "Tier 1 - Gigante Financeiro"),
    ("Botafogo", "Rio de Janeiro", "RJ", 359.6, 13.0, 1, 1.24, "Tier 1 - SAF Alto Investimento"),
    ("Corinthians", "São Paulo", "SP", 828.9, 21.5, 0, 1.20, "Tier 2 - Alta Receita / Alavancado"),
    ("São Paulo", "São Paulo", "SP", 828.9, 21.5, 0, 1.18, "Tier 2 - Alta Receita"),
    ("Atlético-MG", "Belo Horizonte", "MG", 105.8, 6.0, 1, 1.16, "Tier 2 - SAF Competitiva"),
    ("Cruzeiro", "Belo Horizonte", "MG", 105.8, 6.0, 1, 1.14, "Tier 2 - SAF Expansão"),
    ("Internacional", "Porto Alegre", "RS", 81.6, 4.3, 0, 1.10, "Tier 2 - Regional Forte"),
    ("Grêmio", "Porto Alegre", "RS", 81.6, 4.3, 0, 1.08, "Tier 2 - Regional Forte"),
    ("Fluminense", "Rio de Janeiro", "RJ", 359.6, 13.0, 0, 1.05, "Tier 2 - Capital Tradicional"),
    ("Bahia", "Salvador", "BA", 62.9, 3.9, 1, 1.08, "Tier 2 - SAF Grupo City"),
    ("Vasco", "Rio de Janeiro", "RJ", 359.6, 13.0, 1, 0.98, "Tier 3 - SAF Reestruturação"),
    ("Santos", "Santos", "SP", 24.1, 1.8, 0, 0.96, "Tier 3 - Retorno Série A"),
    ("Athletico-PR", "Curitiba", "PR", 98.0, 3.7, 0, 0.97, "Tier 3 - Gestão Equilibrada"),
    ("Bragantino", "Bragança Paulista", "SP", 9.6, 0.2, 1, 0.95, "Tier 3 - Clube-Empresa Red Bull"),
    ("Vitória", "Salvador", "BA", 62.9, 3.9, 0, 0.78, "Tier 4 - Orçamento Enxuto"),
    ("Coritiba", "Curitiba", "PR", 98.0, 3.7, 1, 0.80, "Tier 4 - SAF Acesso"),
    ("Mirassol", "Mirassol", "SP", 2.9, 0.5, 0, 0.72, "Tier 4 - Interior Eficiente"),
    ("Chapecoense", "Chapecó", "SC", 14.3, 0.4, 0, 0.70, "Tier 4 - Interior Enxuto"),
    ("Remo", "Belém", "PA", 33.5, 2.5, 0, 0.68, "Tier 4 - Norte / Acesso"),
]


def main():
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()
    cur.execute("DROP TABLE IF EXISTS clube_contexto_economico;")
    cur.execute(
        """
        CREATE TABLE clube_contexto_economico (
            clube TEXT PRIMARY KEY,
            cidade TEXT NOT NULL,
            uf TEXT NOT NULL,
            pib_municipal_bi REAL NOT NULL,
            populacao_rm_mi REAL NOT NULL,
            eh_saf INTEGER NOT NULL,
            indice_orcamento REAL NOT NULL,
            tier_label TEXT NOT NULL,
            prior_pontos_estrutural REAL NOT NULL,
            atualizado_em TEXT NOT NULL
        );
        """
    )

    agora = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    for clube, cidade, uf, pib, pop, saf, orc, tier in CLUBES_ECONOMIA_2026:
        # Modelo econométrico estrutural (log-orçamento + mercado regional IBGE + efeito SAF)
        prior_pts = round(50.5 + 31.0 * (orc - 1.0) + 1.2 * (1 if saf else 0) + 0.004 * min(pib, 400.0), 1)
        prior_pts = max(34.0, min(74.0, prior_pts))
        cur.execute(
            """
            INSERT INTO clube_contexto_economico VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (clube, cidade, uf, pib, pop, saf, orc, tier, prior_pts, agora),
        )

    conn.commit()
    cur.execute("PRAGMA journal_mode = DELETE;")
    conn.close()
    print(f"Contexto econômico populado para {len(CLUBES_ECONOMIA_2026)} clubes da Série A 2026.")


if __name__ == "__main__":
    main()
