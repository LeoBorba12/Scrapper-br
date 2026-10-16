import sqlite3
import sys

sys.stdout.reconfigure(encoding='utf-8')

def run_auditoria_completa():
    conn = sqlite3.connect('data/futebol.db')
    cursor = conn.cursor()

    testes = [
        # Mundiais e Intercontinentais
        ("Mundial Intercontinental 1962 (Benfica 2x5 Santos)", 
         "SELECT id_partida, data, mandante, visitante, placar, estadio, fase FROM partidas WHERE campeonato LIKE '%Intercontinental%' AND ano=1962 AND mandante='Benfica'"),
        
        ("Mundial Intercontinental 1981 (Flamengo 3x0 Liverpool)", 
         "SELECT id_partida, data, mandante, visitante, placar, estadio, fase FROM partidas WHERE campeonato LIKE '%Intercontinental%' AND ano=1981"),
        
        ("Mundial Intercontinental 1992 (São Paulo 2x1 Barcelona)", 
         "SELECT id_partida, data, mandante, visitante, placar, estadio, fase FROM partidas WHERE campeonato LIKE '%Intercontinental%' AND ano=1992"),
        
        ("Mundial de Clubes FIFA 2000 (Manchester United 1x3 Vasco)", 
         "SELECT id_partida, data, mandante, visitante, placar, estadio, fase FROM partidas WHERE campeonato LIKE '%FIFA%' AND ano=2000 AND mandante='Manchester United'"),
        
        ("Mundial de Clubes FIFA 2000 Final (Corinthians 0x0 Vasco)", 
         "SELECT id_partida, data, mandante, visitante, placar, estadio, fase FROM partidas WHERE campeonato LIKE '%FIFA%' AND ano=2000 AND fase='Final'"),

        ("Mundial de Clubes FIFA 2005 Final (São Paulo 1x0 Liverpool)", 
         "SELECT id_partida, data, mandante, visitante, placar, estadio, fase FROM partidas WHERE campeonato LIKE '%FIFA%' AND ano=2005 AND fase='Final'"),
        
        ("Mundial de Clubes FIFA 2012 Final (Corinthians 1x0 Chelsea)", 
         "SELECT id_partida, data, mandante, visitante, placar, estadio, fase FROM partidas WHERE campeonato LIKE '%FIFA%' AND ano=2012 AND mandante LIKE '%Corinthians%'"),

        # Libertadores
        ("Libertadores 1981 Final Desempate (Flamengo 2x0 Cobreloa)", 
         "SELECT id_partida, data, mandante, visitante, placar, estadio, fase FROM partidas WHERE campeonato='Copa Libertadores' AND ano=1981 AND data='1981-11-23'"),
        
        ("Libertadores 1993 Final Ida (São Paulo 5x1 Univ. Católica)", 
         "SELECT id_partida, data, mandante, visitante, placar, estadio, fase FROM partidas WHERE campeonato='Copa Libertadores' AND ano=1993 AND mandante LIKE '%São Paulo%' AND visitante LIKE '%Católica%'"),
        
        ("Libertadores 2019 Final (River Plate 1x2 Flamengo)", 
         "SELECT id_partida, data, mandante, visitante, placar, estadio, fase FROM partidas WHERE campeonato='Copa Libertadores' AND ano=2019 AND mandante='River Plate' AND visitante='Flamengo'"),
        
        ("Libertadores 2021 Final (Palmeiras 2x1 Flamengo)", 
         "SELECT id_partida, data, mandante, visitante, placar, estadio, fase FROM partidas WHERE campeonato='Copa Libertadores' AND ano=2021 AND mandante='Palmeiras' AND visitante='Flamengo'"),

        # Brasileirão Histórico
        ("Brasileirão 1971 Triangular Decisivo (Botafogo 0x1 Atlético-MG)", 
         "SELECT id_partida, data, mandante, visitante, placar, estadio, fase FROM partidas WHERE campeonato='Campeonato Brasileiro' AND ano=1971 AND mandante LIKE '%Botafogo%' AND visitante LIKE '%Atlético%'"),
        
        ("Brasileirão 1974 Final (Vasco 2x1 Cruzeiro)", 
         "SELECT id_partida, data, mandante, visitante, placar, estadio, fase FROM partidas WHERE campeonato='Campeonato Brasileiro' AND ano=1974 AND mandante LIKE '%Vasco%' AND visitante LIKE '%Cruzeiro%' AND data='1974-08-01'"),
        
        ("Brasileirão 1980 Decisão (Flamengo 3x2 Atlético-MG)", 
         "SELECT id_partida, data, mandante, visitante, placar, estadio, fase FROM partidas WHERE campeonato='Campeonato Brasileiro' AND ano=1980 AND mandante LIKE '%Flamengo%' AND visitante LIKE '%Atlético%'"),
        
        ("Brasileirão 1993 Decisão (Palmeiras 2x0 Vitória)", 
         "SELECT id_partida, data, mandante, visitante, placar, estadio, fase FROM partidas WHERE campeonato='Campeonato Brasileiro' AND ano=1993 AND mandante LIKE '%Palmeiras%' AND visitante LIKE '%Vitória%'"),
        
        ("Brasileirão 2005 Histórico (Corinthians 7x1 Santos)", 
         "SELECT id_partida, data, mandante, visitante, placar, estadio, fase FROM partidas WHERE ano=2005 AND mandante LIKE '%Corinthians%' AND visitante LIKE '%Santos%' AND gols_mandante=7"),
        
        ("Brasileirão 2023 Virada (Botafogo 3x4 Palmeiras)", 
         "SELECT id_partida, data, mandante, visitante, placar, estadio, fase FROM partidas WHERE ano=2023 AND mandante LIKE '%Botafogo%' AND visitante LIKE '%Palmeiras%' AND data='2023-11-01'"),

        # Copa do Brasil
        ("Copa do Brasil 1989 Final Volta (Grêmio 2x1 Sport)", 
         "SELECT id_partida, data, mandante, visitante, placar, estadio, fase FROM partidas WHERE campeonato='Copa do Brasil' AND ano=1989 AND mandante LIKE '%Grêmio%' AND fase LIKE '%Final%'"),
        
        ("Copa do Brasil 2005 Final Volta (Fluminense 0x0 Paulista)", 
         "SELECT id_partida, data, mandante, visitante, placar, estadio, fase FROM partidas WHERE campeonato='Copa do Brasil' AND ano=2005 AND mandante LIKE '%Fluminense%' AND fase LIKE '%Final%'"),
        
        ("Copa do Brasil 2024 Final Volta (Atlético-MG 0x1 Flamengo)", 
         "SELECT id_partida, data, mandante, visitante, placar, estadio, fase FROM partidas WHERE campeonato='Copa do Brasil' AND ano=2024 AND mandante LIKE '%Atlético-MG%' AND fase LIKE '%Final%'"),

        # Regionais
        ("Torneio Rio-São Paulo 2002 Final Ida (São Paulo 2x3 Corinthians)", 
         "SELECT id_partida, data, mandante, visitante, placar, estadio, fase FROM partidas WHERE campeonato='Torneio Rio-São Paulo' AND ano=2002 AND mandante='São Paulo' AND visitante='Corinthians' AND placar='2x3'"),
        
        ("Torneio Rio-São Paulo 2002 Final Volta (Corinthians 1x1 São Paulo)", 
         "SELECT id_partida, data, mandante, visitante, placar, estadio, fase FROM partidas WHERE campeonato='Torneio Rio-São Paulo' AND ano=2002 AND mandante='Corinthians' AND visitante='São Paulo' AND placar='1x1'"),

        ("Copa do Nordeste 1997 Final Ida (Bahia 0x3 Vitória)", 
         "SELECT id_partida, data, mandante, visitante, placar, estadio, fase FROM partidas WHERE campeonato='Copa do Nordeste' AND ano=1997 AND mandante='Bahia' AND visitante='Vitória' AND placar='0x3'"),

        ("Copa do Nordeste 1997 Final Volta (Vitória 2x1 Bahia)", 
         "SELECT id_partida, data, mandante, visitante, placar, estadio, fase FROM partidas WHERE campeonato='Copa do Nordeste' AND ano=1997 AND mandante='Vitória' AND visitante='Bahia' AND placar='2x1'"),

        # Estaduais
        ("Paulistão 2010 Goleada Meninos da Vila (Santos 9x1 Ituano)", 
         "SELECT id_partida, data, mandante, visitante, placar, estadio, fase FROM partidas WHERE campeonato='Campeonato Paulista' AND ano=2010 AND gols_mandante=9"),

        ("Carioca 2004 Final (Flamengo 3x1 Vasco)", 
         "SELECT id_partida, data, mandante, visitante, placar, estadio, fase FROM partidas WHERE campeonato='Campeonato Carioca' AND ano=2004 AND mandante='Flamengo' AND visitante='Vasco' AND placar='3x1'")
    ]

    print("=" * 90)
    print("AUDITORIA POR AMOSTRAGEM - PARTIDAS HISTÓRICAS E DECISIVAS (TODAS AS COMPETIÇÕES E ÉPOCAS)")
    print("=" * 90)

    acertos = 0
    total = len(testes)

    for nome, sql in testes:
        cursor.execute(sql)
        res = cursor.fetchall()
        print(f"\n📌 {nome}")
        if res:
            acertos += 1
            for r in res:
                p_id, dt, mand, vis, placar, est, fase = r
                print(f"   ✓ [ID {p_id}] {dt} | Fase: {fase} | {mand} {placar} {vis} | Local: {est or 'N/I'}")
                cursor.execute("SELECT atleta, clube, minuto FROM gols WHERE id_partida = ? ORDER BY id_gol", (p_id,))
                gols = cursor.fetchall()
                if gols:
                    g_str = ", ".join([f"{g[0]} ({g[1]} {g[2]}')" for g in gols])
                    print(f"     ⚽ Gols: {g_str}")
        else:
            print("   ❌ Partida não localizada com esses critérios!")

    print("\n" + "=" * 90)
    print(f"TAXA DE ACERTO DA AMOSTRAGEM: {acertos}/{total} ({((acertos/total)*100):.1f}%)")
    print("=" * 90)

    conn.close()

if __name__ == '__main__':
    run_auditoria_completa()
