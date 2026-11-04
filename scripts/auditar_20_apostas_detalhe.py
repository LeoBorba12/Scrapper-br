import sqlite3

def auditar_20_apostas_detalhe():
    conn = sqlite3.connect('data/futebol.db')
    c = conn.cursor()
    
    query = """
    SELECT 
        b.partida_id, b.ano, b.mandante, b.visitante, b.gols_mandante, b.gols_visitante,
        b.selecao_aposta, b.odd_abertura, b.odd_fechamento_pinnacle,
        b.probabilidade_mandante, b.probabilidade_empate, b.probabilidade_visitante,
        b.prob_calibrada_mandante, b.edge_identificado, b.resultado_aposta, b.lucro_stake_fixo, b.clv_real,
        p.vencedor as vencedor_real
    FROM backtest_dixon_coles b
    JOIN partidas p ON b.partida_id = p.id_partida
    WHERE b.selecao_aposta IS NOT NULL
    ORDER BY b.partida_id % 97, b.partida_id
    LIMIT 20;
    """
    c.execute(query)
    rows = c.fetchall()
    
    print("=" * 120)
    print("AUDITORIA MANUAL FORENSE DE 20 APOSTAS DO BACKTEST (DESAFIO 11)")
    print("=" * 120)
    
    for idx, r in enumerate(rows, 1):
        pid, ano, m, v, gm, gv, sel, odd_ab, odd_fech, pm, pe, pv, pcm, edge, res_a, lucro, clv, venc_real = r
        
        # Validar consistencia
        placar = f"{gm} x {gv}"
        ganhou_esperado = False
        if sel == 'H' and gm > gv: ganhou_esperado = True
        elif sel == 'D' and gm == gv: ganhou_esperado = True
        elif sel == 'A' and gv > gm: ganhou_esperado = True
        
        status_calc = "GREEN" if ganhou_esperado else "RED"
        lucro_esperado = round(odd_ab - 1.0, 4) if ganhou_esperado else -1.0
        
        settlement_ok = (status_calc == res_a) and (abs(lucro - lucro_esperado) < 0.01)
        prob_sum = round(pm + pe + pv, 4)
        
        print(f"\n[Aposta #{idx:02d}] Partida ID: {pid} | Ano: {ano} | {m} vs {v}")
        print(f"  Placar Real: {placar} | Vencedor: {venc_real} | Seleção Apostada: {sel}")
        print(f"  Odd Entrada (Ab): {odd_ab:.2f} | Odd Fech Pinnacle: {odd_fech or 'N/A'}")
        print(f"  Prob Modelo Raw: H={pm:.3f}, D={pe:.3f}, A={pv:.3f} (Soma={prob_sum:.4f})")
        print(f"  Prob Calib Mandante: {pcm:.3f} | Edge Identificado: {edge*100:.1f}%")
        print(f"  Resultado Registrado: {res_a} | Lucro Registrado: {lucro:+.2f}")
        print(f"  Auditoria Settlement: {'OK (Correto)' if settlement_ok else 'BUG/INCONSISTENTE'}")
        print(f"  Auditoria Prob Soma: {'OK (1.000)' if abs(prob_sum - 1.0) <= 0.002 else 'VIOLACAO'}")
        if odd_ab > 5.0 and sel == 'A':
            print(f"  Alerta Forense: Zebra extrema apostada (Odd {odd_ab:.2f}). Probabilidade do modelo ({pv*100:.1f}%) superestimou chance real vs odd.")

    conn.close()

if __name__ == '__main__':
    auditar_20_apostas_detalhe()
