import sqlite3

records = [
    ('Futebol Brasileiro / Mundial', 'Gols de Falta', 1, 'Zico', 'Flamengo, Udinese, Kashima Antlers, Seleção Brasileira', 101, '1971-1994 (Maior cobrador da história do futebol mundial)'),
    ('Futebol Brasileiro / Mundial', 'Gols de Falta', 2, 'Juninho Pernambucano', 'Vasco, Lyon, Sport, Al-Gharafa, Seleção Brasileira', 77, '1993-2013 (Recordista absoluto da Era Moderna)'),
    ('Futebol Brasileiro / Mundial', 'Gols de Falta', 3, 'Pelé', 'Santos, New York Cosmos, Seleção Brasileira', 70, '1956-1977 (Rei do Futebol)'),
    ('Futebol Brasileiro / Mundial', 'Gols de Falta', 4, 'Ronaldinho Gaúcho', 'Grêmio, PSG, Barcelona, Milan, Flamengo, Atlético-MG, Seleção', 66, '1998-2015 (Gols de falta memoráveis por clube e seleção)'),
    ('Futebol Brasileiro / Mundial', 'Gols de Falta', 5, 'Rogério Ceni', 'São Paulo', 63, '1990-2015 (Maior goleiro-artilheiro da história, todos pelo SPFC)'),
    ('Futebol Brasileiro / Mundial', 'Gols de Falta', 6, 'Marcelinho Carioca', 'Corinthians, Flamengo, Vasco, Santos, Brasiliense', 59, '1988-2010 (O Pé de Anjo - 57 só pelo Corinthians)'),
    ('Futebol Brasileiro / Mundial', 'Gols de Falta', 7, 'Neto', 'Guarani, Corinthians, Palmeiras, Santos, Atlético-MG', 50, '1983-1999 (Especialista em bolas paradas)'),
    ('Futebol Brasileiro / Mundial', 'Gols de Falta', 8, 'Didi', 'Fluminense, Botafogo, Real Madrid, Seleção Brasileira', 45, '1946-1966 (Inventor do chute de Folha Seca)'),
    ('Futebol Brasileiro / Mundial', 'Gols de Falta', 9, 'Marcos Assunção', 'Santos, Palmeiras, Roma, Real Betis, Flamengo', 44, '1993-2016 (Mestre das cobranças no ângulo)'),
    ('Futebol Brasileiro / Mundial', 'Gols de Falta', 10, 'Éder Aleixo', 'América-MG, Grêmio, Atlético-MG, Palmeiras, Santos', 38, '1975-1997 (A Bomba de Vespasiano)')
]

for db in ['data/futebol.db', 'api/data/futebol.db']:
    conn = sqlite3.connect(db)
    c = conn.cursor()
    c.execute("DELETE FROM artilharia_historica WHERE divisao = 'Gols de Falta'")
    for r in records:
        c.execute("""
            INSERT INTO artilharia_historica (campeonato, divisao, posicao, atleta, clubes, total_gols, periodo)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """, r)
    conn.commit()
    conn.close()
    print('Inserted into', db)
