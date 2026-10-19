import sqlite3
import json
import os

def gerar_auditoria():
    db_path = 'data/futebol.db'
    conn = sqlite3.connect(db_path)
    c = conn.cursor()

    report = []
    report.append("# 🔍 Raio-X e Auditoria Completa do Banco de Dados (`data/futebol.db`)")
    report.append("> Relatório técnico para análise de qualidade de dados, anomalias, incongruências e integridade relacional.\n")

    # 1. Panorama Geral
    report.append("## 1. Panorama Quantitativo das Tabelas")
    tabelas = ['partidas', 'gols', 'cartoes', 'escalacoes', 'usuarios']
    for t in tabelas:
        c.execute(f"SELECT COUNT(*) FROM {t}")
        cnt = c.fetchone()[0]
        report.append(f"- **Tabela `{t}`**: {cnt:,} registros")
    report.append("")

    # 2. Integridade Referencial
    report.append("## 2. Integridade Referencial e Registros Órfãos")
    c.execute("SELECT COUNT(*) FROM gols WHERE id_partida NOT IN (SELECT id_partida FROM partidas)")
    gols_orf = c.fetchone()[0]
    c.execute("SELECT COUNT(*) FROM cartoes WHERE id_partida NOT IN (SELECT id_partida FROM partidas)")
    cartoes_orf = c.fetchone()[0]
    c.execute("SELECT COUNT(*) FROM escalacoes WHERE id_partida NOT IN (SELECT id_partida FROM partidas)")
    esc_orf = c.fetchone()[0]

    report.append(f"- **Gols órfãos (sem partida correspondente)**: {gols_orf}")
    report.append(f"- **Cartões órfãos (sem partida correspondente)**: {cartoes_orf}")
    report.append(f"- **Escalações órfãs (sem partida correspondente)**: {esc_orf}")
    report.append("")

    # 3. Incongruências de Lógica de Jogo
    report.append("## 3. Incongruências de Resultados e Placares")
    
    # Mandante = Visitante
    c.execute("""
        SELECT mandante, campeonato, COUNT(*) 
        FROM partidas 
        WHERE mandante = visitante 
        GROUP BY mandante, campeonato
    """)
    mandante_igual_visitante = c.fetchall()
    total_m_igual_v = sum(r[2] for r in mandante_igual_visitante)
    report.append(f"- **Partidas com Mandante = Visitante (anomalia de scraping)**: {total_m_igual_v} jogos")
    for m, camp, cnt in mandante_igual_visitante:
        report.append(f"  - `{m} x {m}` em *{camp}*: {cnt} jogos")

    # Placar divergente do Vencedor
    c.execute("""
        SELECT id_partida, data, mandante, visitante, placar, vencedor 
        FROM partidas 
        WHERE (gols_mandante > gols_visitante AND vencedor != mandante AND vencedor IS NOT NULL)
           OR (gols_mandante < gols_visitante AND vencedor != visitante AND vencedor IS NOT NULL)
           OR (gols_mandante = gols_visitante AND vencedor != 'Empate' AND vencedor IS NOT NULL)
    """)
    divergencias_placar = c.fetchall()
    report.append(f"- **Partidas onde o vencedor gravado diverge do placar**: {len(divergencias_placar)}")
    for p_id, dt, m, v, plc, venc in divergencias_placar[:5]:
        report.append(f"  - Jogo ID {p_id} ({dt}): {m} {plc} {v} -> Vencedor gravado: '{venc}'")
    report.append("")

    # 4. Incongruências Temporais e de Calendário
    report.append("## 4. Incongruências de Datas e Temporadas")
    c.execute("""
        SELECT COUNT(*) FROM partidas 
        WHERE data IS NOT NULL AND SUBSTR(data, 1, 4) != CAST(ano AS TEXT)
    """)
    ano_divergente = c.fetchone()[0]
    report.append(f"- **Jogos onde o ano da data (YYYY) é diferente da coluna `ano`**: {ano_divergente} jogos")
    report.append("  *(Nota: Ocorre principalmente em torneios que atravessam o réveillon, ex: Libertadores ou edições estendidas da Copa do Brasil, ou falhas no parser de data)*")
    
    c.execute("SELECT COUNT(*) FROM partidas WHERE data IS NULL OR data = ''")
    sem_data = c.fetchone()[0]
    report.append(f"- **Jogos sem data preenchida**: {sem_data}")
    report.append("")

    # 5. Cobertura Histórica e Lacunas (Gaps) por Competição
    report.append("## 5. Matriz de Cobertura e Lacunas de Dados (Gaps)")
    report.append("| Competição | Total Partidas | Partidas com Gols Detalhados | Total Gols Atletas | Partidas com Cartões | Partidas com Escalações |")
    report.append("| :--- | :---: | :---: | :---: | :---: | :---: |")

    c.execute("""
        SELECT 
            p.campeonato,
            COUNT(DISTINCT p.id_partida) as total_partidas,
            COUNT(DISTINCT g.id_partida) as partidas_com_gols,
            COUNT(g.id_gol) as total_gols,
            COUNT(DISTINCT c.id_partida) as partidas_com_cartoes,
            COUNT(DISTINCT e.id_partida) as partidas_com_escalacoes
        FROM partidas p
        LEFT JOIN gols g ON p.id_partida = g.id_partida
        LEFT JOIN cartoes c ON p.id_partida = c.id_partida
        LEFT JOIN escalacoes e ON p.id_partida = e.id_partida
        GROUP BY p.campeonato
        ORDER BY total_partidas DESC
        LIMIT 20;
    """)
    for camp, tot_p, p_gols, tot_g, p_cart, p_esc in c.fetchall():
        report.append(f"| {camp} | {tot_p:,} | {p_gols:,} | {tot_g:,} | {p_cart:,} | {p_esc:,} |")
    report.append("")

    # 6. Variações de Grafia de Grandes Clubes
    report.append("## 6. Padronização e Variações de Nomes de Clubes")
    report.append("Exemplos de heterogeneidade na coluna `mandante` que podem afetar queries SQL sem tratamento fuzzy:")
    
    padroes = ['%Atlético%', '%Grêmio%', '%São Paulo%', '%Botafogo%', '%América%']
    for padrao in padroes:
        c.execute(f"SELECT DISTINCT mandante FROM partidas WHERE mandante LIKE '{padrao}' LIMIT 6")
        exemplos = [row[0] for row in c.fetchall()]
        report.append(f"- **Busca `{padrao}`**: {exemplos}")
    report.append("")

    # 7. Resumo e Diagnóstico
    report.append("## 7. Perguntas Chave para o Gemini Responder")
    report.append("1. Quais dessas lacunas representam riscos graves para um motor de Text-to-SQL (Oráculo)?")
    report.append("2. Como implementar uma camada de normalização automática sem quebrar compatibilidade histórica?")
    report.append("3. Qual é a melhor estratégia de pipeline para resolver as partidas com mandante=visitante e os 3 gols órfãos?")

    output_path = "auditoria_database_futebol.md"
    with open(output_path, "w", encoding="utf-8") as f:
        f.write("\n".join(report))

    print(f"Relatório gerado com sucesso em: {output_path}")
    conn.close()

if __name__ == '__main__':
    gerar_auditoria()
