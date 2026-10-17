import sqlite3

conn = sqlite3.connect('data/futebol.db')
c = conn.cursor()

def test_fuzzy_escalacoes(name):
    # Match in escalacoes
    rows = c.execute("""
        SELECT atleta, clube, COUNT(*) 
        FROM escalacoes 
        WHERE atleta = ? OR atleta LIKE ? OR atleta LIKE ? OR atleta LIKE ?
        GROUP BY atleta, clube
    """, (name, f"{name} %", f"% {name} %", f"% {name}")).fetchall()
    print(f"Escalacoes for '{name}':", rows)

test_fuzzy_escalacoes("Fagner")
test_fuzzy_escalacoes("Gabriel Barbosa")
test_fuzzy_escalacoes("Thiago Heleno")
test_fuzzy_escalacoes("Weverton")
test_fuzzy_escalacoes("Arrascaeta")

conn.close()
