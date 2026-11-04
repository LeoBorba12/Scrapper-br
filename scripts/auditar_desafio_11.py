import sqlite3

def auditar():
    conn = sqlite3.connect('data/futebol.db')
    c = conn.cursor()
    
    # 1. Total e apostas
    c.execute("SELECT COUNT(*), SUM(CASE WHEN selecao_aposta IS NOT NULL THEN 1 ELSE 0 END) FROM backtest_dixon_coles")
    total, apostas = c.fetchone()
    print(f"\nTotal partidas no holdout: {total}, Apostas realizadas: {apostas} ({apostas/total*100:.2f}%)")
    
    # 2. Normalização sum min max
    query_norm = """
    SELECT 
        AVG(probabilidade_mandante + probabilidade_empate + probabilidade_visitante),
        MIN(probabilidade_mandante + probabilidade_empate + probabilidade_visitante),
        MAX(probabilidade_mandante + probabilidade_empate + probabilidade_visitante)
    FROM backtest_dixon_coles
    """
    c.execute(query_norm)
    row_norm = c.fetchone()
    print("\n--- AUDITORIA DE NORMALIZAÇÃO ---")
    print(f"Prob Raw (H + D + A): Avg={row_norm[0]:.6f}, Min={row_norm[1]:.6f}, Max={row_norm[2]:.6f}")

    # 3. Amostra de 20 apostas aleatórias
    query_amostra = """
    SELECT 
        partida_id, ano, mandante, visitante,
        selecao_aposta, odd_abertura, odd_fechamento_pinnacle,
        probabilidade_mandante, probabilidade_empate, probabilidade_visitante,
        prob_calibrada_mandante,
        edge_identificado, vencedor, resultado_aposta, lucro_stake_fixo, clv_real
    FROM backtest_dixon_coles
    WHERE selecao_aposta IS NOT NULL
    ORDER BY RANDOM()
    LIMIT 20
    """
    c.execute(query_amostra)
    amostras = c.fetchall()
    print("\n--- AMOSTRA DE 20 APOSTAS ALEATÓRIAS ---")
    header = f"{'ID':<8} | {'Ano':<4} | {'Sel':<3} | {'Odd Ab':<6} | {'Odd Fech':<8} | {'P(H)':<5} | {'P(D)':<5} | {'P(A)':<5} | {'Edge%':<6} | {'Res':<3} | {'Status':<5} | {'Lucro':<6} | {'CLV%':<6} | {'Times':<30}"
    print(header)
    print("-" * len(header))
    for a in amostras:
        pid, ano, mand, visit, sel, odd_ab, odd_fech, pm, pe, pv, pcm, edge, res_p, res_a, lucro, clv = a
        clv_str = f"{clv*100:.1f}%" if clv is not None else "N/A"
        edge_str = f"{edge*100:.1f}%" if edge is not None else "N/A"
        odd_fech_str = f"{odd_fech:.2f}" if odd_fech is not None else "N/A"
        times = f"{mand[:13]} v {visit[:13]}"
        print(f"{pid:<8} | {ano:<4} | {sel:<3} | {odd_ab:<6.2f} | {odd_fech_str:<8} | {pm:<5.2f} | {pe:<5.2f} | {pv:<5.2f} | {edge_str:<6} | {res_p:<3} | {res_a:<5} | {lucro:<6.2f} | {clv_str:<6} | {times:<30}")

    # 4. Decomposição por seleção
    query_sel = """
    SELECT 
        selecao_aposta,
        COUNT(*) as total_apostas,
        SUM(CASE WHEN resultado_aposta = 'GREEN' THEN 1 ELSE 0 END) as vitorias,
        AVG(CASE WHEN resultado_aposta = 'GREEN' THEN 1.0 ELSE 0.0 END) * 100 as taxa_acerto_pct,
        AVG(odd_abertura) as odd_abertura_media,
        AVG(odd_fechamento_pinnacle) as odd_fech_media,
        AVG(edge_identificado) * 100 as edge_medio_pct,
        AVG(clv_real) * 100 as clv_medio_pct,
        SUM(lucro_stake_fixo) as lucro_total,
        (SUM(lucro_stake_fixo) / COUNT(*)) * 100 as roi_pct
    FROM backtest_dixon_coles
    WHERE selecao_aposta IS NOT NULL
    GROUP BY selecao_aposta
    """
    c.execute(query_sel)
    rows_sel = c.fetchall()
    print("\n--- DECOMPOSIÇÃO POR SELEÇÃO ---")
    print(f"{'Seleção':<8} | {'Apostas':<7} | {'Vitórias':<8} | {'Win%':<6} | {'Odd Ab':<6} | {'Odd Fech':<8} | {'Edge%':<6} | {'CLV%':<6} | {'Lucro':<8} | {'ROI%':<7}")
    for r in rows_sel:
        fech_str = f"{r[5]:.2f}" if r[5] is not None else "N/A"
        clv_str = f"{r[7]:.2f}%" if r[7] is not None else "N/A"
        print(f"{r[0]:<8} | {r[1]:<7} | {r[2]:<8} | {r[3]:<6.2f} | {r[4]:<6.2f} | {fech_str:<8} | {r[6]:<6.2f} | {clv_str:<6} | {r[8]:<8.2f} | {r[9]:<7.2f}%")

    # 5. Decomposição por ano (temporada)
    query_temp = """
    SELECT 
        ano,
        COUNT(*) as total_apostas,
        SUM(CASE WHEN resultado_aposta = 'GREEN' THEN 1 ELSE 0 END) as vitorias,
        AVG(CASE WHEN resultado_aposta = 'GREEN' THEN 1.0 ELSE 0.0 END) * 100 as taxa_acerto_pct,
        AVG(odd_abertura) as odd_abertura_media,
        AVG(clv_real) * 100 as clv_medio_pct,
        SUM(lucro_stake_fixo) as lucro_total,
        (SUM(lucro_stake_fixo) / COUNT(*)) * 100 as roi_pct
    FROM backtest_dixon_coles
    WHERE selecao_aposta IS NOT NULL
    GROUP BY ano
    ORDER BY ano
    """
    c.execute(query_temp)
    rows_temp = c.fetchall()
    print("\n--- DECOMPOSIÇÃO POR ANO (TEMPORADA) ---")
    print(f"{'Ano':<6} | {'Apostas':<7} | {'Vitórias':<8} | {'Win%':<6} | {'Odd Ab':<6} | {'CLV%':<6} | {'Lucro':<8} | {'ROI%':<7}")
    for r in rows_temp:
        clv_str = f"{r[5]:.2f}%" if r[5] is not None else "N/A"
        print(f"{r[0]:<6} | {r[1]:<7} | {r[2]:<8} | {r[3]:<6.2f} | {r[4]:<6.2f} | {clv_str:<6} | {r[6]:<8.2f} | {r[7]:<7.2f}%")

    # 6. Decomposição por faixa de odd
    query_faixa_odd = """
    SELECT 
        CASE 
            WHEN odd_abertura < 1.50 THEN '1. < 1.50'
            WHEN odd_abertura < 2.00 THEN '2. 1.50 - 1.99'
            WHEN odd_abertura < 3.00 THEN '3. 2.00 - 2.99'
            WHEN odd_abertura < 5.00 THEN '4. 3.00 - 4.99'
            WHEN odd_abertura < 10.0 THEN '5. 5.00 - 9.99'
            ELSE '6. >= 10.00'
        END as faixa_odd,
        COUNT(*) as total_apostas,
        SUM(CASE WHEN resultado_aposta = 'GREEN' THEN 1 ELSE 0 END) as vitorias,
        AVG(CASE WHEN resultado_aposta = 'GREEN' THEN 1.0 ELSE 0.0 END) * 100 as taxa_acerto_pct,
        AVG(odd_abertura) as odd_media,
        SUM(lucro_stake_fixo) as lucro_total,
        (SUM(lucro_stake_fixo) / COUNT(*)) * 100 as roi_pct
    FROM backtest_dixon_coles
    WHERE selecao_aposta IS NOT NULL
    GROUP BY faixa_odd
    ORDER BY faixa_odd
    """
    c.execute(query_faixa_odd)
    rows_odd = c.fetchall()
    print("\n--- DECOMPOSIÇÃO POR FAIXA DE ODD ---")
    print(f"{'Faixa Odd':<15} | {'Apostas':<7} | {'Vitórias':<8} | {'Win%':<6} | {'Odd Méd':<7} | {'Lucro':<8} | {'ROI%':<7}")
    for r in rows_odd:
        print(f"{r[0]:<15} | {r[1]:<7} | {r[2]:<8} | {r[3]:<6.2f} | {r[4]:<7.2f} | {r[5]:<8.2f} | {r[6]:<7.2f}%")

    # 7. Decomposição por faixa de EV
    query_faixa_ev = """
    SELECT 
        CASE 
            WHEN edge_identificado < 0.05 THEN '1. 4% - 5%'
            WHEN edge_identificado < 0.10 THEN '2. 5% - 10%'
            WHEN edge_identificado < 0.20 THEN '3. 10% - 20%'
            WHEN edge_identificado < 0.50 THEN '4. 20% - 50%'
            ELSE '5. >= 50%'
        END as faixa_ev,
        COUNT(*) as total_apostas,
        SUM(CASE WHEN resultado_aposta = 'GREEN' THEN 1 ELSE 0 END) as vitorias,
        AVG(CASE WHEN resultado_aposta = 'GREEN' THEN 1.0 ELSE 0.0 END) * 100 as taxa_acerto_pct,
        AVG(edge_identificado) * 100 as edge_medio_pct,
        SUM(lucro_stake_fixo) as lucro_total,
        (SUM(lucro_stake_fixo) / COUNT(*)) * 100 as roi_pct
    FROM backtest_dixon_coles
    WHERE selecao_aposta IS NOT NULL
    GROUP BY faixa_ev
    ORDER BY faixa_ev
    """
    c.execute(query_faixa_ev)
    rows_ev = c.fetchall()
    print("\n--- DECOMPOSIÇÃO POR FAIXA DE EV ---")
    print(f"{'Faixa EV':<15} | {'Apostas':<7} | {'Vitórias':<8} | {'Win%':<6} | {'Edge Méd%':<9} | {'Lucro':<8} | {'ROI%':<7}")
    for r in rows_ev:
        print(f"{r[0]:<15} | {r[1]:<7} | {r[2]:<8} | {r[3]:<6.2f} | {r[4]:<9.2f} | {r[5]:<8.2f} | {r[6]:<7.2f}%")

    conn.close()

if __name__ == '__main__':
    auditar()
