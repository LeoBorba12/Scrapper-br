"""
Script de Higienização e Padronização de Nomes e Empates no futebol.db
Corrige caracteres de encoding corrompidos (ex: So Paulo -> São Paulo, Grmio -> Grêmio)
Padroniza vencedores de empates para 'Empate' em todas as eras.
"""

import os
import sqlite3

BASE_DIR = os.path.dirname(__file__)
DB_PATH = os.path.join(BASE_DIR, "data", "futebol.db")

REPLACEMENTS = {
    "So Paulo": "São Paulo",
    "Sao Paulo": "São Paulo",
    "So Paulo-SP": "São Paulo",
    "Grmio": "Grêmio",
    "Gremio": "Grêmio",
    "Atltico-MG": "Atlético-MG",
    "Atletico-MG": "Atlético-MG",
    "Atletico MG": "Atlético-MG",
    "Atltico MG": "Atlético-MG",
    "Atltico/MG": "Atlético-MG",
    "Atltico-PR": "Athletico-PR",
    "Atletico-PR": "Athletico-PR",
    "Atletico PR": "Athletico-PR",
    "Atltico PR": "Athletico-PR",
    "Atltico/PR": "Athletico-PR",
    "Atltico-GO": "Atlético-GO",
    "Atletico-GO": "Atlético-GO",
    "Vitria": "Vitória",
    "Vitoria": "Vitória",
    "Vitria-BA": "Vitória",
    "Gois": "Goiás",
    "Goias": "Goiás",
    "Cricima": "Criciúma",
    "Criciuma": "Criciúma",
    "Paran": "Paraná",
    "Parana": "Paraná",
    "Cear": "Ceará",
    "Ceara": "Ceará",
    "Nutico": "Náutico",
    "Nautico": "Náutico",
    "Ava": "Avaí",
    "Avai": "Avaí",
    "Amrica-MG": "América-MG",
    "America-MG": "América-MG",
    "Amrica-RN": "América-RN",
    "America-RN": "América-RN",
    "Amrica-RJ": "América-RJ",
    "America-RJ": "América-RJ",
    "Amrica": "América-RJ",
    "America": "América-RJ",
    "Amrica-SP": "América-SP",
    "Amrica-SE": "América-SE",
    "Amrica-CE": "América-CE",
    "Santo Andr": "Santo André",
    "Santo Andre": "Santo André",
    "Unio So Joo": "União São João",
    "Uniao Sao Joao": "União São João",
    "Atlético (PR)": "Athletico-PR",
    "Atlético (MG)": "Atlético-MG",
    "Atlético (GO)": "Atlético-GO",
    "América (MG)": "América-MG",
    "América (RN)": "América-RN",
    "América (RJ)": "América-RJ",
    "Athletico/PR": "Athletico-PR",
    "Atlético/MG": "Atlético-MG",
    "Atlético/GO": "Atlético-GO",
    "América/MG": "América-MG",
    "América/RN": "América-RN",
    "América/RJ": "América-RJ",
    "Botafogo/RJ": "Botafogo-RJ",
    "Palmeiras/SP": "Palmeiras",
    "Grêmio/RS": "Grêmio",
    "São Luiz/RS": "São Luiz",
    "Caxias/RS": "Caxias",
    "Vasco da Gama": "Vasco",

    "So Caetano": "São Caetano",
    "Sao Caetano": "São Caetano",
    "Sampaio Corra": "Sampaio Corrêa",
    "Confiana": "Confiança",
    "Operrio-PR": "Operário-PR",
    "Operrio-MS": "Operário-MS",
    "Operrio-MT": "Operário-MT",
    "Operrio": "Operário-PR",
    "Operrio/CG": "Operário-MS",
    "Goinia": "Goiânia",
    "Anpolis": "Anápolis",
    "Braslia": "Brasília",
    "Grmio Maring": "Grêmio Maringá",
    "Marclio Dias": "Marcílio Dias",
    "Herclio Luz": "Hercílio Luz",
    "Piau": "Piauí",
    "Uberlndia": "Uberlândia",
    "So Bento": "São Bento",
    "So Cristvo": "São Cristóvão",
    "So Jos": "São José",
    "So Raimundo": "São Raimundo",
    "Botafogo": "Botafogo-RJ",
}

def higienizar():
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()

    print(">>> Iniciando higienização e padronização do futebol.db...")

    # Padroniza empates
    cur.execute("UPDATE partidas SET vencedor = 'Empate' WHERE vencedor = '-' OR (gols_mandante = gols_visitante AND vencedor != 'Empate');")
    print(f"  • Empates padronizados: {cur.rowcount} registros atualizados.")

    # Remove datas que colaram no mandante em 1987 (ex: '07/Feb/1988   Sport' -> 'Sport')
    cur.execute("""
    UPDATE partidas 
    SET mandante = TRIM(SUBSTR(mandante, 15)) 
    WHERE mandante LIKE '%/1988   %';
    """)
    if cur.rowcount > 0:
        print(f"  • Prefixo de data removido de mandantes em 1987: {cur.rowcount} registros.")

    # Remove strings extras como 'Santa Cruz      11  1/ 2  5  3'
    cur.execute("""
    UPDATE partidas
    SET mandante = 'Santa Cruz'
    WHERE mandante LIKE 'Santa Cruz%';
    """)

    # Aplica substituições nos mandantes, visitantes e vencedores
    for errado, certo in REPLACEMENTS.items():
        cur.execute("UPDATE partidas SET mandante = ? WHERE mandante = ?;", (certo, errado))
        cur.execute("UPDATE partidas SET visitante = ? WHERE visitante = ?;", (certo, errado))
        cur.execute("UPDATE partidas SET vencedor = ? WHERE vencedor = ?;", (certo, errado))
        cur.execute("UPDATE gols SET clube = ? WHERE clube = ?;", (certo, errado))

    conn.commit()

    # Confirmação
    cur.execute("SELECT COUNT(DISTINCT mandante) FROM partidas WHERE mandante LIKE '%%';")
    restantes = cur.fetchone()[0]
    print(f"  • Clubes com encoding corrompido restantes: {restantes}")

    conn.close()
    print(">>> Higienização concluída com sucesso!")

if __name__ == "__main__":
    higienizar()
