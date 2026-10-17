import sqlite3

conn = sqlite3.connect('data/futebol.db')
cursor = conn.cursor()

cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
tables = [r[0] for r in cursor.fetchall()]
print("Tables in futebol.db:", tables)

for t in tables:
    cursor.execute(f"PRAGMA table_info({t})")
    cols = [c[1] for c in cursor.fetchall()]
    cursor.execute(f"SELECT COUNT(*) FROM {t}")
    count = cursor.fetchone()[0]
    print(f"\nTable '{t}' ({count} rows):")
    print("  Columns:", cols)
    cursor.execute(f"SELECT * FROM {t} LIMIT 3")
    for row in cursor.fetchall():
        print("  Sample row:", row)

conn.close()
