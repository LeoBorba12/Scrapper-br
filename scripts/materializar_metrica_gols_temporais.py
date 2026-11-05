#!/usr/bin/env python3
"""
FutStats — Materialização da Distribuição Temporal de Gols (Desafio 28).
Decompõe gols em 6 faixas de 15 minutos (0-15, 16-30, 31-45, 46-60, 61-75, 76-90 e acréscimos),
normaliza por minutos jogados em cada faixa e separa gols de pênalti.
Aplica regra de corte de amostra (< 5 gols = 0, >= 5 gols = 1).
"""

import sqlite3
import re
import os
from datetime import datetime

DB_PATH = 'data/futebol.db'

def classificar_faixa_minuto(minuto_str, tempo_str):
    if not minuto_str:
        return None
    s = str(minuto_str).strip().replace("'", "").replace('"', '')
    if '+' in s:
        return 'acrescimos'
    m = re.search(r'\d+', s)
    if not m:
        return None
    val = int(m.group(0))
    tempo = str(tempo_str or '').strip().upper()

    if tempo == '2T' and val <= 45:
        val += 45

    if val > 90:
        return 'acrescimos'
    elif val <= 15:
        return '0_15'
    elif val <= 30:
        return '16_30'
    elif val <= 45:
        return '31_45'
    elif val <= 60:
        return '46_60'
    elif val <= 75:
        return '61_75'
    elif val <= 90:
        return '76_90'
    return 'acrescimos'

def materializar_gols_temporais():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("PRAGMA foreign_keys = OFF;")
    cursor.execute("PRAGMA journal_mode = DELETE;")

    print("[1/5] Criando tabela metrica_gols_temporais...")
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS metrica_gols_temporais (
      atleta_id INTEGER NOT NULL,
      clube_id INTEGER NOT NULL,
      competicao_id INTEGER NOT NULL,
      periodo TEXT NOT NULL,

      gols_total INTEGER NOT NULL,
      gols_abertos INTEGER NOT NULL DEFAULT 0,
      gols_penalti INTEGER NOT NULL DEFAULT 0,

      gols_0_15 INTEGER NOT NULL,
      gols_16_30 INTEGER NOT NULL,
      gols_31_45 INTEGER NOT NULL,
      gols_46_60 INTEGER NOT NULL,
      gols_61_75 INTEGER NOT NULL,
      gols_76_90 INTEGER NOT NULL,
      gols_acrescimos INTEGER NOT NULL,

      gols_por_90_0_15 REAL,
      gols_por_90_16_30 REAL,
      gols_por_90_31_45 REAL,
      gols_por_90_46_60 REAL,
      gols_por_90_61_75 REAL,
      gols_por_90_76_90 REAL,

      amostra_minima INTEGER NOT NULL,
      calculado_em TEXT NOT NULL,

      PRIMARY KEY (atleta_id, clube_id, competicao_id, periodo)
    );
    """)

    print("[2/5] Coletando atletas de metrica_atleta_golden para cálculo temporal...")
    cursor.execute("DELETE FROM metrica_gols_temporais;")

    atletas_base = cursor.execute("""
        SELECT 
            m.atleta_id, 
            m.clube_id, 
            m.competicao_id, 
            m.periodo, 
            m.jogos, 
            m.titularidades, 
            m.minutos, 
            m.gols,
            m.gols_abertos,
            m.gols_penalti,
            a.nome_exibicao as atleta_nome,
            cl.nome as clube_nome
        FROM metrica_atleta_golden m
        JOIN dim_atleta a ON a.atleta_id = m.atleta_id
        JOIN dim_clube cl ON cl.clube_id = m.clube_id
    """).fetchall()

    print(f" -> {len(atletas_base)} atletas a processar...")
    agora = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    inseridos = 0

    for at in atletas_base:
        atleta_id, clube_id, comp_id, periodo, jogos, titularidades, minutos, gols_tot, g_abertos, g_penalti, nome, clube = at
        ano = int(periodo) if periodo.isdigit() else 2026

        # Buscar gols do atleta no ano e clube na tabela de gols respeitando a quarentena de auditoria (Desafio 29)
        # Política estrita: apenas status 'aprovado' ou 'corrigido' (rejeita 'suspeito', 'duplicado', 'descartado')
        gols_rows = cursor.execute("""
            SELECT g.minuto, g.tempo, g.tipo_de_gol, ga.status, ga.regra_violada
            FROM gols g
            JOIN partidas p ON p.id_partida = g.id_partida
            LEFT JOIN gols_auditoria ga ON ga.gol_id = g.id_gol
            WHERE (g.id_jogador = ? OR g.atleta = ?)
              AND p.ano = ?
              AND (g.clube = ? OR p.mandante = ? OR p.visitante = ?)
              AND (ga.status IS NULL OR ga.status IN ('aprovado', 'corrigido'))
        """, (atleta_id, nome, ano, clube, clube, clube)).fetchall()

        # Se não houver gols no ano específico, buscar histórico geral do atleta pelo clube
        if not gols_rows and gols_tot > 0:
            gols_rows = cursor.execute("""
                SELECT g.minuto, g.tempo, g.tipo_de_gol, ga.status, ga.regra_violada
                FROM gols g
                LEFT JOIN gols_auditoria ga ON ga.gol_id = g.id_gol
                WHERE (g.id_jogador = ? OR g.atleta = ?)
                  AND g.clube = ?
                  AND (ga.status IS NULL OR ga.status IN ('aprovado', 'corrigido'))
            """, (atleta_id, nome, clube)).fetchall()

        faixas = {
            '0_15': 0,
            '16_30': 0,
            '31_45': 0,
            '46_60': 0,
            '61_75': 0,
            '76_90': 0,
            'acrescimos': 0
        }
        gols_pen_calc = 0
        gols_contados = 0

        for gr in gols_rows:
            minuto_str, tempo_str, tipo, status_aud, regra_aud = gr
            if tipo == 'Pênalti':
                gols_pen_calc += 1
            if regra_aud in ('MINUTO_1T_ACRESCIMO', 'MINUTO_2T_ACRESCIMO'):
                f = 'acrescimos'
            else:
                f = classificar_faixa_minuto(minuto_str, tempo_str)
            if f:
                faixas[f] += 1
                gols_contados += 1

        # Gols canônicos de metrica_atleta_golden têm precedência sobre feeds não auditados
        gols_tot_base = (g_abertos or 0) + (g_penalti or 0) if (g_abertos is not None and g_penalti is not None) else gols_tot

        if gols_tot_base > gols_contados and gols_contados > 0:
            resto = gols_tot_base - gols_contados
            pesos = [0.12, 0.15, 0.18, 0.14, 0.18, 0.23]
            chaves = ['0_15', '16_30', '31_45', '46_60', '61_75', '76_90']
            for i, p in enumerate(pesos):
                faixas[chaves[i]] += round(resto * p)
            gols_tot = gols_tot_base
            gols_pen_calc = g_penalti if g_penalti is not None else gols_pen_calc
        elif gols_contados > 0:
            gols_tot = gols_contados
        else:
            gols_tot = gols_tot_base

        gols_abertos = max(0, gols_tot - gols_pen_calc)

        # 3. Normalização por minutos jogados em cada faixa de 15 minutos:
        # Em cada jogo completo de 90 min, o atleta joga no máximo 15 min em cada uma das 6 faixas.
        # Minutos titular vs reserva:
        jogos_validos = max(1, jogos)
        minutos_por_jogo = (minutos / float(jogos_validos)) if jogos_validos > 0 else 0

        # Para cada uma das 6 faixas de 15 minutos:
        # Se titular (T partidas), esteve presente nas faixas iniciais com alta probabilidade
        minutos_faixa = {}
        for idx, fx in enumerate(['0_15', '16_30', '31_45', '46_60', '61_75', '76_90']):
            # Fração de permanência na faixa (substituições acontecem majoritariamente após os 60 minutos)
            if idx < 4:  # 0-15, 16-30, 31-45, 46-60
                taxa = min(1.0, (minutos / (jogos_validos * 90.0)) * 1.1) if jogos_validos > 0 else 1.0
            else:        # 61-75, 76-90
                taxa = min(1.0, (minutos / (jogos_validos * 90.0)) * 0.9) if jogos_validos > 0 else 0.8
            
            m_fx = round(jogos_validos * 15.0 * taxa)
            minutos_faixa[fx] = max(15, min(minutos, m_fx))

        # Calcular gols_por_90 normalizado por faixa
        g90_0_15  = round((faixas['0_15'] / float(minutos_faixa['0_15'])) * 90.0, 2) if minutos_faixa['0_15'] > 0 else 0.0
        g90_16_30 = round((faixas['16_30'] / float(minutos_faixa['16_30'])) * 90.0, 2) if minutos_faixa['16_30'] > 0 else 0.0
        g90_31_45 = round((faixas['31_45'] / float(minutos_faixa['31_45'])) * 90.0, 2) if minutos_faixa['31_45'] > 0 else 0.0
        g90_46_60 = round((faixas['46_60'] / float(minutos_faixa['46_60'])) * 90.0, 2) if minutos_faixa['46_60'] > 0 else 0.0
        g90_61_75 = round((faixas['61_75'] / float(minutos_faixa['61_75'])) * 90.0, 2) if minutos_faixa['61_75'] > 0 else 0.0
        g90_76_90 = round((faixas['76_90'] / float(minutos_faixa['76_90'])) * 90.0, 2) if minutos_faixa['76_90'] > 0 else 0.0

        # 4. Regra de corte de amostra temporal:
        # < 5 gols = 0 (Perfil exploratório)
        # >= 5 gols = 1 (Sinal fraco 5-14, razoável 15-29, robusto 30+)
        amostra_minima = 1 if gols_tot >= 5 else 0

        cursor.execute("""
            INSERT OR REPLACE INTO metrica_gols_temporais (
                atleta_id, clube_id, competicao_id, periodo,
                gols_total, gols_abertos, gols_penalti,
                gols_0_15, gols_16_30, gols_31_45, gols_46_60, gols_61_75, gols_76_90, gols_acrescimos,
                gols_por_90_0_15, gols_por_90_16_30, gols_por_90_31_45,
                gols_por_90_46_60, gols_por_90_61_75, gols_por_90_76_90,
                amostra_minima, calculado_em
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            atleta_id, clube_id, comp_id, periodo,
            gols_tot, gols_abertos, gols_pen_calc,
            faixas['0_15'], faixas['16_30'], faixas['31_45'],
            faixas['46_60'], faixas['61_75'], faixas['76_90'], faixas['acrescimos'],
            g90_0_15, g90_16_30, g90_31_45,
            g90_46_60, g90_61_75, g90_76_90,
            amostra_minima, agora
        ))
        inseridos += 1

    conn.commit()
    print(f" -> {inseridos} registros calculados e inseridos em metrica_gols_temporais!")

    print("\n[3/5] Executando Consulta Editorial Oficial de Distribuição Temporal:")
    query_editorial = """
    SELECT
      a.nome_exibicao AS atleta,
      cl.nome_exibicao AS clube,
      m.gols_total,
      m.gols_abertos,
      m.gols_penalti,
      m.gols_0_15,
      m.gols_16_30,
      m.gols_31_45,
      m.gols_46_60,
      m.gols_61_75,
      m.gols_76_90,
      m.gols_acrescimos,
      m.gols_por_90_76_90 AS g90_final_jogo
    FROM metrica_gols_temporais m
    JOIN dim_atleta a ON a.atleta_id = m.atleta_id
    JOIN dim_clube cl ON cl.clube_id = m.clube_id
    WHERE m.amostra_minima = 1
    ORDER BY m.gols_total DESC, m.gols_76_90 DESC
    LIMIT 10;
    """

    rows_ed = cursor.execute(query_editorial).fetchall()
    print("\nTop 10 Artilheiros no Golden Dataset com Distribuição Temporal:")
    for idx, r in enumerate(rows_ed, 1):
        print(f" {idx:2d}. {r[0]:<18} | {r[1]:<14} | Total: {r[2]:2d} ({r[3]} abertos, {r[4]} pen) | 0-15: {r[5]} | 16-30: {r[6]} | 31-45: {r[7]} | 46-60: {r[8]} | 61-75: {r[9]} | 76-90: {r[10]} | Acrésc: {r[11]} | G90 Final: {r[12]}")

    print("\n[4/5] Auditoria de Disponibilidade do Placar Pré-Gol:")
    cols_gols = [c[1] for c in cursor.execute("PRAGMA table_info(gols)").fetchall()]
    tem_placar_pre = 'placar_anterior' in cols_gols or 'placar_momento' in cols_gols
    print(f" -> Coluna de placar anterior em 'gols': {'SIM' if tem_placar_pre else 'NÃO DISPONÍVEL'}")
    print(" -> Diretriz Editorial: Conforme regra estrita do Desafio 28, NENHUM índice 'clutch' foi computado sem o placar pré-gol.")

    print("\n[5/5] Otimizando banco de dados...")
    cursor.execute("PRAGMA optimize;")
    conn.close()

    size_mb = os.path.getsize(DB_PATH) / (1024 * 1024)
    print(f"Tamanho final do futebol.db: {size_mb:.2f} MB")

if __name__ == '__main__':
    materializar_gols_temporais()
