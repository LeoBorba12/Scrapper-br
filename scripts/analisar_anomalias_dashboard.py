import sqlite3
import re

conn = sqlite3.connect("data/futebol.db")
c = conn.cursor()

c.execute("SELECT id_jogador, nome_exibicao, total_gols FROM jogadores_estatisticas;")
rows = c.fetchall()

com_minuto = [r for r in rows if re.search(r"\d+['’]", r[1])]
so_numero = [r for r in rows if re.match(r"^\d+['’]?$", r[1].strip())]
com_sufixo_num = [r for r in rows if re.search(r"\(\d+\)$", r[1].strip())]

print(f"Total de registros em jogadores_estatisticas: {len(rows)}")
print(f"1. Jogadores com minuto colado no nome: {len(com_minuto)}")
print(f"2. Jogadores cujo nome é APENAS um número/minuto: {len(so_numero)}")
print(f"3. Jogadores com sufixo de raspador tipo (2), (3): {len(com_sufixo_num)}")

print("\nExemplos de minutos colados:")
for r in com_minuto[:8]:
    print(" ", r)

print("\nExemplos de nomes só número/minuto:")
for r in so_numero[:8]:
    print(" ", r)

print("\nExemplos de sufixo numérico:")
for r in com_sufixo_num[:8]:
    print(" ", r)
