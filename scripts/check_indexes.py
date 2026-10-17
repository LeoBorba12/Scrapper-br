import sqlite3

conn = sqlite3.connect('data/futebol.db')
c = conn.cursor()
indexes = c.execute("SELECT name, tbl_name, sql FROM sqlite_master WHERE type='index'").fetchall()
print("Indexes in futebol.db:")
for idx in indexes:
    print(idx)
conn.close()
