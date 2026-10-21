import sqlite3

con = sqlite3.connect('data/futebol.db')
cur = con.cursor()

jogadores = [
    'Roberto Dinamite', 'Fred', 'Romário', 'Romario', 'Edmundo', 
    'Zico', 'Diego Souza', 'Túlio', 'Tulio', 'Serginho Chulapa', 'Serginho',
    'Dario', 'Dadá Maravilha', 'Washington', 'Luís Fabiano', 'Luis Fabiano',
    'Gabriel Barbosa', 'Gabigol', 'Ademir da Guia', 'Marcelinho Carioca', 'Marcelinho', 'Careca'
]

print("=== VERIFICANDO NOMES NA TABELA GOLS ===")
for j in jogadores:
    cur.execute("""
        SELECT atleta, count(*) 
        FROM gols 
        WHERE atleta LIKE ? 
        GROUP BY atleta
    """, (f"%{j}%",))
    rows = cur.fetchall()
    if rows:
        print(f"Busca '{j}': {rows}")
    else:
        print(f"Busca '{j}': [NENHUM GOL]")
