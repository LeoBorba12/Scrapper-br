"""
Unificação Canônica de Nomes de Craques e Reconstrução de jogadores_resumo
=========================================================================
Unifica variações de nomes corrompidos por súmulas truncadas:
  - 'Gabriel Barbosa Almeida', 'Gabriel Ba ...' -> 'Gabriel Barbosa'
  - 'Giorgian De Arrascaeta', 'Georgian de Arrascaeta' -> 'Arrascaeta'
  - 'German Cano German Ezequiel Cano' -> 'Germán Cano'
  - 'Hulk Givanildo Vieira de Sousa' -> 'Hulk'
  - 'Raphael Cavalcante Veiga', 'Raphael Veiga Raphael ...' -> 'Raphael Veiga'
  - 'Dudu Eduardo Pereira Rodrigues' -> 'Dudu'
"""

import sqlite3

MAPA_UNIFICACAO = [
    # (Nome canônico, [Padrões/variações])
    ("Gabriel Barbosa", ["Gabriel Barbosa Almeida", "Gabriel Ba ...%", "Gabriel Barbosa %"]),
    ("Arrascaeta", ["Giorgian De Arrascaeta", "Giorgian de Arrascaeta", "Georgian de Arrascaeta", "De Arrascaeta Giorgian%"]),
    ("Hulk", ["Hulk Givanildo Vieira de Sousa", "Givanildo Vieira de Sousa"]),
    ("Germán Cano", ["German Cano German Ezequiel Cano", "German Ezequiel Cano", "German Cano"]),
    ("Raphael Veiga", ["Raphael Cavalcante Veiga", "Raphael Veiga Raphael%"]),
    ("Dudu", ["Dudu Eduardo Pereira Rodrigues", "Dudu Eduardo Pereira%"]),
    ("Pedro", ["Pedro Guilherme Abreu dos Santos", "Pedro Guilherme%"]),
]

def unificar_banco(db_path: str):
    print(f"\n=== PROCESSANDO {db_path} ===")
    conn = sqlite3.connect(db_path)
    c = conn.cursor()

    for nome_canonico, variacoes in MAPA_UNIFICACAO:
        for var in variacoes:
            c.execute("UPDATE gols SET atleta = ? WHERE atleta LIKE ?", (nome_canonico, var))
            c.execute("UPDATE escalacoes SET atleta = ? WHERE atleta LIKE ?", (nome_canonico, var))
            c.execute("UPDATE cartoes SET atleta = ? WHERE atleta LIKE ?", (nome_canonico, var))
            c.execute("DELETE FROM jogadores_resumo WHERE nome LIKE ? AND nome != ?", (var, nome_canonico))

    # Atualiza as estatísticas consolidadas em jogadores_resumo
    for nome_canonico, _ in MAPA_UNIFICACAO:
        c.execute("SELECT count(*) FROM gols WHERE atleta = ?", (nome_canonico,))
        total_gols = c.fetchone()[0]

        c.execute("SELECT count(DISTINCT id_partida) FROM escalacoes WHERE atleta = ?", (nome_canonico,))
        total_jogos_esc = c.fetchone()[0]

        total_jogos = max(total_jogos_esc, total_gols)

        c.execute("""
            SELECT 
                SUM(CASE WHEN cartao LIKE '%Amarelo%' THEN 1 ELSE 0 END),
                SUM(CASE WHEN cartao LIKE '%Vermelho%' THEN 1 ELSE 0 END)
            FROM cartoes WHERE atleta = ?
        """, (nome_canonico,))
        row_c = c.fetchone()
        tot_amarelos = row_c[0] or 0
        tot_vermelhos = row_c[1] or 0

        c.execute("SELECT GROUP_CONCAT(DISTINCT clube) FROM gols WHERE atleta = ?", (nome_canonico,))
        clubes_gols = c.fetchone()[0] or ""

        # Verifica se já existe o registro canônico
        c.execute("SELECT id_jogador FROM jogadores_resumo WHERE nome = ?", (nome_canonico,))
        row_id = c.fetchone()
        if row_id:
            c.execute("""
                UPDATE jogadores_resumo 
                SET total_gols = ?, total_jogos = ?, total_amarelos = ?, total_vermelhos = ?, clubes = ?
                WHERE id_jogador = ?
            """, (total_gols, total_jogos, tot_amarelos, tot_vermelhos, clubes_gols, row_id[0]))
        else:
            c.execute("""
                INSERT INTO jogadores_resumo (nome, clubes, total_jogos, total_gols, total_amarelos, total_vermelhos, ano_min, ano_max)
                VALUES (?, ?, ?, ?, ?, ?, 2014, 2026)
            """, (nome_canonico, clubes_gols, total_jogos, total_gols, tot_amarelos, tot_vermelhos))

        print(f" -> {nome_canonico:<16}: {total_jogos} jogos | {total_gols} gols | {tot_amarelos} amarelos | {clubes_gols}")

    conn.commit()
    conn.close()

if __name__ == "__main__":
    unificar_banco("data/futebol.db")
    unificar_banco("api/data/futebol.db")
