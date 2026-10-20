import sqlite3

conn = sqlite3.connect('data/futebol.db')
c = conn.cursor()

times = {
    'Zé Carlos': [('CRB', 50), ('Ponte Preta', 20), ('Criciúma', 15), ('América-RN', 7)],
    'Neto Baiano': [('Vitória', 45), ('CRB', 20), ('Ponte Preta', 12), ('Sport', 7)],
    'Léo Gamalho': [('Ceará', 24), ('CRB', 20), ('Coritiba', 16), ('Goiás', 13), ('Vitória', 10)],
    'Júnior Viçosa': [('América-MG', 28), ('Goiás', 22), ('Atlético-GO', 19)],
    'Élton': [('Vasco', 25), ('Ceará', 15), ('Ponte Preta', 14), ('Cuiabá', 10)],
    'Alessandro': [('América-MG', 38), ('Ipatinga', 24)],
    'Marcão': [('Atlético-GO', 30), ('Bahia', 15), ('América-MG', 13)],
    'Bruno Rangel': [('Chapecoense', 31), ('Joinville', 24)]
}

for atleta, clubes in times.items():
    for clube, num_gols in clubes:
        # Search Serie B matches for this club
        c.execute("""
            SELECT id_partida FROM partidas 
            WHERE (campeonato LIKE '%Série B%' OR campeonato LIKE '%Serie B%')
              AND (mandante LIKE ? OR visitante LIKE ?)
            LIMIT ?
        """, (f"%{clube}%", f"%{clube}%", num_gols * 2))
        rows = c.fetchall()
        print(f"{atleta} - {clube}: needs {num_gols}, found {len(rows)} matches")
