import sqlite3
from werkzeug.security import generate_password_hash

conn = sqlite3.connect('data/futebol.db')
c = conn.cursor()

c.execute("""
CREATE TABLE IF NOT EXISTS usuarios (
    id_usuario INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    nome TEXT NOT NULL,
    senha_hash TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'moderador',
    criado_em TEXT DEFAULT (datetime('now', 'localtime'))
);
""")

# Inserir ou atualizar LB
senha_hash = generate_password_hash("46475595")
c.execute("""
INSERT INTO usuarios (username, nome, senha_hash, role)
VALUES ('LB', 'Leonardo (LB)', ?, 'admin')
ON CONFLICT(username) DO UPDATE SET
    senha_hash = excluded.senha_hash,
    nome = excluded.nome,
    role = excluded.role;
""", (senha_hash,))

conn.commit()

# Verificar
c.execute("SELECT id_usuario, username, nome, role, criado_em FROM usuarios;")
for r in c.fetchall():
    print("Usuário cadastrado:", r)

conn.close()
