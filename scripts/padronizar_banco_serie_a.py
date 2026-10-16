"""
Script de padronização definitiva dos clubes e reparo de anomalias no futebol.db.
- Converte 'Cuiaba' para 'Cuiabá'
- Converte 'Atlético MG', 'Atletico(MG)' para 'Atlético-MG'
- Converte 'Atlético-PR', 'Atlético/PR', 'Atlético PR' para 'Athletico-PR'
- Converte 'Botafogo-RJ' para 'Botafogo' (mantendo Botafogo-SP e Botafogo-PB intactos)
- Converte 'São Paulo-SP' para 'São Paulo' (mantendo São Paulo-RS intacto)
- Converte 'Internacional-RS' para 'Internacional' (mantendo Internacional de Limeira e Santa Maria intactos)
- Converte 'Flamengo-RJ' para 'Flamengo' (mantendo Flamengo-PI intacto)
- Converte 'Fluminense-RJ' para 'Fluminense' (mantendo Fluminense-BA intacto)
- Converte 'Grêmio FBPA' para 'Grêmio'
- Corrige as 22 partidas com datas coladas no nome do mandante (ex: '26/08/1989 Sport' -> mandante='Sport', data='1989-08-26')
- Corrige os 13 nomes com notas de rodapé coladas (ex: 'Ponte Preta was sent off...' -> 'Ponte Preta')
"""

import sqlite3
import re

conn = sqlite3.connect('data/futebol.db')
cursor = conn.cursor()

print("1. Reparando anomalias de notas e prefixos de data...")

# Reparar partidas onde a data colou no mandante
cursor.execute("SELECT id_partida, mandante FROM partidas WHERE mandante GLOB '[0-9][0-9]/[0-9][0-9]/[0-9][0-9][0-9][0-9] *'")
for id_p, mand in cursor.fetchall():
    match = re.match(r"^(\d{2})/(\d{2})/(\d{4})\s+(.+)$", mand)
    if match:
        dia, mes, ano, time = match.groups()
        data_certa = f"{ano}-{mes}-{dia}"
        cursor.execute("UPDATE partidas SET mandante = ?, data = ? WHERE id_partida = ?", (time.strip(), data_certa, id_p))
        print(f"  Fix data colada: {mand} -> mandante={time.strip()}, data={data_certa}")

# Reparar notas de rodapé conhecidas
footnote_fixes = [
    ('Extra-games: Palmeiras', 'Palmeiras'),
    ('Atlético Mineiro              abd  [abandoned at', 'Atlético-MG'),
    ('Barcelona               abd  [Barcelona abandoned at', 'Barcelona-EQU'),
    ('LDU Quito                     abd  [abandoned at', 'LDU Quito'),
    ('Vitoria                   condemned to play its next 5 home', 'Vitória'),
    ('Ponte Preta  was sent off and Vasco president Miranda', 'Ponte Preta'),
    ('CSA       [pen', 'CSA'),
    ('Vitória  [pen', 'Vitória'),
    ('Independiente         abd (abd at', 'Independiente'),
    ('abd  Vasco da Gama', 'Vasco'),
    ('Olimpia                    awd  [awarded', 'Olimpia'),
    ('Cruzeiro        alleged', 'Cruzeiro'),
    ('Botafogo          [pen', 'Botafogo'),
    ('Cruzeiro        player in 1st leg', 'Cruzeiro'),
    ('Corinthians      Pacaembu', 'Corinthians'),
    ('n/p Flamengo', 'Flamengo'),
    ('n/p Fluminense', 'Fluminense'),
    ('n/p Botafogo', 'Botafogo'),
    ('n/p Corinthians', 'Corinthians'),
    ('n/p Vasco da Gama', 'Vasco'),
    ('n/p Internacional-RS', 'Internacional'),
    ('n/p Atletico-PR', 'Athletico-PR'),
    ('n/p Vitoria-BA', 'Vitória'),
    ('SC Corinthians Paulista', 'Corinthians'),
    ('SC Corinthians Pauliata', 'Corinthians'),
    ('Sãu Paulo FC', 'São Paulo'),
    ('EC Vitória', 'Vitória'),
    ('Grêmio FBPA', 'Grêmio'),
]

for bad, good in footnote_fixes:
    cursor.execute("UPDATE partidas SET mandante = ? WHERE mandante = ?", (good, bad))
    cursor.execute("UPDATE partidas SET visitante = ? WHERE visitante = ?", (good, bad))
    cursor.execute("UPDATE partidas SET vencedor = ? WHERE vencedor = ?", (good, bad))

# Padronizações canônicas seguras
print("2. Padronizando nomes canônicos dos 20 clubes...")
canon_maps = [
    ('Cuiaba', 'Cuiabá'),
    ('Cuiabá EC', 'Cuiabá'),
    ('Botafogo-RJ', 'Botafogo'),
    ('Atlético MG', 'Atlético-MG'),
    ('Atletico(MG)', 'Atlético-MG'),
    ('Atlético-PR', 'Athletico-PR'),
    ('Atlético/PR', 'Athletico-PR'),
    ('Atlético PR', 'Athletico-PR'),
    ('Athletico', 'Athletico-PR'),
    ('São Paulo-SP', 'São Paulo'),
    ('Internacional-RS', 'Internacional'),
    ('Flamengo-RJ', 'Flamengo'),
    ('Fluminense-RJ', 'Fluminense'),
    ('Vasco da Gama', 'Vasco'),
    ('RB Bragantino', 'Red Bull Bragantino'),
    ('RB Bragantino (Bragança)', 'Red Bull Bragantino'),
    ('Bragantino', 'Red Bull Bragantino'),
]

for bad, good in canon_maps:
    cursor.execute("UPDATE partidas SET mandante = ? WHERE mandante = ?", (good, bad))
    cursor.execute("UPDATE partidas SET visitante = ? WHERE visitante = ?", (good, bad))
    cursor.execute("UPDATE partidas SET vencedor = ? WHERE vencedor = ?", (good, bad))
    cursor.execute("UPDATE gols SET clube = ? WHERE clube = ?", (good, bad))

# Ajustar os jogos do Campeonato Mineiro onde mandante ou visitante era simplesmente 'Atlético'
cursor.execute("UPDATE partidas SET mandante = 'Atlético-MG' WHERE mandante = 'Atlético' AND campeonato IN ('Campeonato Mineiro', 'Copa Libertadores', 'Copa Sul-Minas')")
cursor.execute("UPDATE partidas SET visitante = 'Atlético-MG' WHERE visitante = 'Atlético' AND campeonato IN ('Campeonato Mineiro', 'Copa Libertadores', 'Copa Sul-Minas')")
cursor.execute("UPDATE partidas SET vencedor = 'Atlético-MG' WHERE vencedor = 'Atlético' AND campeonato IN ('Campeonato Mineiro', 'Copa Libertadores', 'Copa Sul-Minas')")

# Ajustar os jogos do Campeonato Paranaense onde mandante ou visitante era simplesmente 'Atlético'
cursor.execute("UPDATE partidas SET mandante = 'Athletico-PR' WHERE mandante = 'Atlético' AND campeonato = 'Campeonato Paranaense'")
cursor.execute("UPDATE partidas SET visitante = 'Athletico-PR' WHERE visitante = 'Atlético' AND campeonato = 'Campeonato Paranaense'")
cursor.execute("UPDATE partidas SET vencedor = 'Athletico-PR' WHERE vencedor = 'Atlético' AND campeonato = 'Campeonato Paranaense'")

conn.commit()
print("3. Concluído com sucesso!")
conn.close()
