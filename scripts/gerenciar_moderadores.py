#!/usr/bin/env python3
"""
scripts/gerenciar_moderadores.py
--------------------------------
Utilitário para cadastrar, listar e atualizar moderadores e administradores
no banco de dados SQLite oficial do FutStats (data/futebol.db).
"""

import sys
import os
import sqlite3
import argparse
import hashlib

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DB_PATH = os.path.join(BASE_DIR, 'data', 'futebol.db')

def hash_senha(senha: str, salt: str = None) -> str:
    """Gera hash PBKDF2 compatível com o backend de autenticação."""
    if not salt:
        salt = os.urandom(16).hex()
    dk = hashlib.pbkdf2_hmac('sha256', senha.encode('utf-8'), salt.encode('utf-8'), 100000)
    return f"pbkdf2:sha256:{salt}:{dk.hex()}"

def get_connection():
    if not os.path.exists(DB_PATH):
        raise FileNotFoundError(f"Banco de dados não encontrado em {DB_PATH}")
    conn = sqlite3.connect(DB_PATH, timeout=60.0)
    conn.execute("PRAGMA busy_timeout = 60000;")
    conn.row_factory = sqlite3.Row
    return conn

def listar_usuarios():
    conn = get_connection()
    c = conn.cursor()
    c.execute("SELECT id_usuario, username, nome, role, criado_em FROM usuarios ORDER BY id_usuario;")
    rows = c.fetchall()
    conn.close()
    
    print("\n" + "=" * 70)
    print("USUÁRIOS CADASTRADOS NO FUTSTATS (data/futebol.db)")
    print("=" * 70)
    if not rows:
        print("Nenhum usuário cadastrado.")
        return
    for r in rows:
        print(f"ID: {r['id_usuario']:<3} | Login: {r['username']:<15} | Nome: {r['nome']:<25} | Role: {r['role']:<10} | Criado: {r['criado_em']}")
    print("=" * 70 + "\n")

def salvar_usuario(username: str, nome: str, senha: str, role: str = 'moderador'):
    username = username.strip()
    nome = nome.strip()
    senha = senha.strip()
    
    if not username or len(username) < 2:
        print("[ERRO] O nome de usuário deve ter pelo menos 2 caracteres.")
        sys.exit(1)
    if not senha or len(senha) < 4:
        print("[ERRO] A senha deve ter pelo menos 4 caracteres.")
        sys.exit(1)
    if role not in ('moderador', 'admin'):
        print("[ERRO] Role inválida. Use 'moderador' ou 'admin'.")
        sys.exit(1)

    senha_h = hash_senha(senha)
    conn = get_connection()
    c = conn.cursor()
    
    # Criar tabela caso não exista
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

    c.execute("""
    INSERT INTO usuarios (username, nome, senha_hash, role)
    VALUES (?, ?, ?, ?)
    ON CONFLICT(username) DO UPDATE SET
        nome = excluded.nome,
        senha_hash = excluded.senha_hash,
        role = excluded.role;
    """, (username, nome, senha_h, role))
    
    conn.commit()
    conn.close()
    print(f"\n[SUCESSO] Usuário '{username}' ({nome}) cadastrado/atualizado como [{role}] com sucesso!")

def main():
    parser = argparse.ArgumentParser(description="Gerenciador de Usuários e Moderadores do FutStats")
    parser.add_argument('--listar', action='store_true', help="Listar todos os usuários cadastrados")
    parser.add_argument('--username', type=str, help="Nome de usuário para login (ex: thbreda)")
    parser.add_argument('--nome', type=str, help="Nome completo ou de exibição")
    parser.add_argument('--senha', type=str, help="Senha de acesso")
    parser.add_argument('--role', type=str, default='moderador', choices=['moderador', 'admin'], help="Perfil de permissão")

    args = parser.parse_args()

    if args.listar:
        listar_usuarios()
        return

    if args.username and args.senha:
        nome = args.nome or args.username
        salvar_usuario(args.username, nome, args.senha, args.role)
        listar_usuarios()
    else:
        parser.print_help()

if __name__ == '__main__':
    main()
