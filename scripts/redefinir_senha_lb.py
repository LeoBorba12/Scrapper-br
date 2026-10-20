import sqlite3
import os
import hashlib

def hash_senha(senha, salt=None):
    if not salt:
        salt = os.urandom(16).hex()
    dk = hashlib.pbkdf2_hmac('sha256', senha.encode('utf-8'), salt.encode('utf-8'), 100000)
    return f"pbkdf2:sha256:{salt}:{dk.hex()}"

senha_hash = hash_senha("46475595")
print(f"Novo hash para LB: {senha_hash}")

for db_path in ["data/futebol.db", "api/data/futebol.db"]:
    conn = sqlite3.connect(db_path)
    c = conn.cursor()
    c.execute("UPDATE usuarios SET senha_hash = ? WHERE username = 'LB'", (senha_hash,))
    print(f"Atualizado em {db_path}: {c.rowcount} linha(s) modificada(s).")
    conn.commit()
    conn.close()
