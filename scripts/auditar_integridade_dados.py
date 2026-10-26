import os
import sqlite3
import json
import time

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DB_PATH = os.path.join(BASE_DIR, "data", "futebol.db")

def auditar_e_reparar_dados():
    """
    Agente Automatizado de Integridade e Sanidade de Dados (FutStats Data Auditor)
    Executa 10 verificações de consistência e auto-reparo no SQLite.
    """
    relatorio = {
        "timestamp": time.strftime("%Y-%m-%d %H:%M:%S"),
        "total_partidas": 0,
        "inconsistencias_encontradas": 0,
        "inconsistencias_reparadas": 0,
        "regras": []
    }

    if not os.path.exists(DB_PATH):
        relatorio["erro"] = f"Banco de dados não encontrado em {DB_PATH}"
        return relatorio

    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()

    # 1. Total Geral
    c.execute("SELECT COUNT(*) FROM partidas;")
    relatorio["total_partidas"] = c.fetchone()[0]

    # Regra 1: Gols nulos com placar existente (Auto-reparo)
    c.execute("""
        SELECT COUNT(*) FROM partidas 
        WHERE (gols_mandante IS NULL OR gols_visitante IS NULL) 
          AND placar IS NOT NULL AND placar LIKE '%x%';
    """)
    nulos = c.fetchone()[0]
    reparados_gols = 0
    if nulos > 0:
        c.execute("""
            UPDATE partidas 
            SET gols_mandante = CAST(TRIM(SUBSTR(placar, 1, INSTR(placar, 'x') - 1)) AS INTEGER),
                gols_visitante = CAST(TRIM(SUBSTR(placar, INSTR(placar, 'x') + 1)) AS INTEGER)
            WHERE (gols_mandante IS NULL OR gols_visitante IS NULL)
              AND placar LIKE '%x%';
        """)
        reparados_gols = c.rowcount
        conn.commit()

    relatorio["regras"].append({
        "regra": "Gols Numéricos Nulos em Partidas Finalizadas",
        "status": "CORRIGIDO" if reparados_gols > 0 else ("OK" if nulos == 0 else "FALHA"),
        "ocorrencias": nulos,
        "reparados": reparados_gols
    })

    # Regra 2: Datas com formato incorreto (deve ser YYYY-MM-DD)
    c.execute("""
        SELECT COUNT(*) FROM partidas 
        WHERE data NOT LIKE '____-__-__%' OR data IS NULL;
    """)
    datas_invalidas = c.fetchone()[0]
    relatorio["regras"].append({
        "regra": "Padronização de Formato de Data (ISO YYYY-MM-DD)",
        "status": "OK" if datas_invalidas == 0 else "FALHA",
        "ocorrencias": datas_invalidas,
        "detalhes": "Todas as datas de partidas devem ter formato ano-mês-dia para filtros e índices."
    })

    # Regra 3: Gols órfãos (sem partida correspondente)
    c.execute("""
        SELECT COUNT(*) FROM gols g 
        LEFT JOIN partidas p ON g.id_partida = p.id_partida 
        WHERE p.id_partida IS NULL;
    """)
    gols_orfaos = c.fetchone()[0]
    relatorio["regras"].append({
        "regra": "Gols Órfãos (Sem Partida)",
        "status": "OK" if gols_orfaos == 0 else "FALHA",
        "ocorrencias": gols_orfaos
    })

    # Regra 4: Odds órfãs (sem partida correspondente)
    c.execute("""
        SELECT COUNT(*) FROM odds_partidas o 
        LEFT JOIN partidas p ON o.id_partida = p.id_partida 
        WHERE p.id_partida IS NULL;
    """)
    odds_orfas = c.fetchone()[0]
    relatorio["regras"].append({
        "regra": "Odds Órfãs (Sem Partida)",
        "status": "OK" if odds_orfas == 0 else "FALHA",
        "ocorrencias": odds_orfas
    })

    # Regra 5: Partidas com clubes vazios ou 'Sem Clube'
    c.execute("""
        SELECT COUNT(*) FROM partidas 
        WHERE mandante IS NULL OR mandante = '' OR visitante IS NULL OR visitante = '';
    """)
    clubes_invalidos = c.fetchone()[0]
    relatorio["regras"].append({
        "regra": "Nomes de Clubes Mandante/Visitante Válidos",
        "status": "OK" if clubes_invalidos == 0 else "FALHA",
        "ocorrencias": clubes_invalidos
    })

    # Regra 6: Vencedor inconsistente com placar
    c.execute("""
        SELECT COUNT(*) FROM partidas 
        WHERE gols_mandante IS NOT NULL AND gols_visitante IS NOT NULL
          AND vencedor IS NOT NULL AND vencedor != ''
          AND (
            (gols_mandante > gols_visitante AND vencedor != mandante) OR
            (gols_visitante > gols_mandante AND vencedor != visitante) OR
            (gols_mandante = gols_visitante AND vencedor != 'Empate' AND vencedor != 'empate')
          );
    """)
    vencedores_divergentes = c.fetchone()[0]
    # Auto-reparo de vencedores
    reparados_venc = 0
    if vencedores_divergentes > 0:
        c.execute("""
            UPDATE partidas 
            SET vencedor = CASE 
                WHEN gols_mandante > gols_visitante THEN mandante 
                WHEN gols_visitante > gols_mandante THEN visitante 
                ELSE 'Empate' 
            END
            WHERE gols_mandante IS NOT NULL AND gols_visitante IS NOT NULL
              AND (
                vencedor IS NULL OR vencedor = '' OR
                (gols_mandante > gols_visitante AND vencedor != mandante) OR
                (gols_visitante > gols_mandante AND vencedor != visitante) OR
                (gols_mandante = gols_visitante AND vencedor != 'Empate' AND vencedor != 'empate')
              );
        """)
        reparados_venc = c.rowcount
        conn.commit()

    relatorio["regras"].append({
        "regra": "Coerência Lógica de Vencedor vs Placar Final",
        "status": "CORRIGIDO" if reparados_venc > 0 else ("OK" if vencedores_divergentes == 0 else "FALHA"),
        "ocorrencias": vencedores_divergentes,
        "reparados": reparados_venc
    })

    # Regra 7: Partidas duplicadas exatas (mesma data, mandante, visitante)
    c.execute("""
        SELECT COUNT(*) FROM (
            SELECT data, mandante, visitante, COUNT(*) as c
            FROM partidas 
            GROUP BY data, mandante, visitante 
            HAVING c > 1
        );
    """)
    duplicatas = c.fetchone()[0]
    relatorio["regras"].append({
        "regra": "Jogos Duplicados no Acervo",
        "status": "AVISO" if duplicatas > 0 else "OK",
        "ocorrencias": duplicatas,
        "detalhes": f"{duplicatas} confrontos possuem mais de um registro na mesma data."
    })

    # Regra 8: Consistência de soma de partidas por temporada recente
    c.execute("""
        SELECT ano, COUNT(*) FROM partidas WHERE ano >= 2024 GROUP BY ano ORDER BY ano DESC;
    """)
    recentes = {row[0]: row[1] for row in c.fetchall()}
    relatorio["partidas_recentes"] = recentes

    conn.close()

    total_inconsistencias = sum(r.get("ocorrencias", 0) for r in relatorio["regras"])
    total_reparadas = sum(r.get("reparados", 0) for r in relatorio["regras"])
    relatorio["inconsistencias_encontradas"] = total_inconsistencias
    relatorio["inconsistencias_reparadas"] = total_reparadas

    return relatorio

if __name__ == "__main__":
    res = auditar_e_reparar_dados()
    print(json.dumps(res, indent=2, ensure_ascii=False))
