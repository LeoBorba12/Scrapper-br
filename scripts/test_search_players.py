import sqlite3

conn = sqlite3.connect('data/futebol.db')
c = conn.cursor()

def search_test(name):
    print(f"\n--- BUSCA POR '{name}' ---")
    # Gols
    gols = c.execute("SELECT atleta, clube, COUNT(*) FROM gols WHERE atleta LIKE ? GROUP BY atleta, clube ORDER BY COUNT(*) DESC LIMIT 5", (f"%{name}%",)).fetchall()
    print("Gols:", gols)
    # Cartoes
    cartoes = c.execute("SELECT atleta, clube, cartao, COUNT(*) FROM cartoes WHERE atleta LIKE ? GROUP BY atleta, clube, cartao ORDER BY COUNT(*) DESC LIMIT 5", (f"%{name}%",)).fetchall()
    print("Cartoes:", cartoes)
    # Escalacoes
    escalacoes = c.execute("SELECT atleta, clube, COUNT(*) FROM escalacoes WHERE atleta LIKE ? GROUP BY atleta, clube ORDER BY COUNT(*) DESC LIMIT 5", (f"%{name}%",)).fetchall()
    print("Escalacoes:", escalacoes)

for q in ["Zico", "Gabriel Barbosa", "Pelé", "Romário", "Thiago Heleno", "Rogério Ceni", "Arrascaeta"]:
    search_test(q)

conn.close()
