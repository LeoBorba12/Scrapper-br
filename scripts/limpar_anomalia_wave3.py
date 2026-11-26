import json
import os
import re
import sqlite3

DB_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data", "futebol.db")


def clean_duplicate_first_word(name: str) -> str:
    if not name:
        return name
    parts = name.split()
    if len(parts) >= 2 and parts[0].lower() == parts[1].lower():
        return " ".join(parts[1:])
    return name


def strip_club_anos_suffix(name: str) -> str:
    if not name:
        return name
    cleaned = re.sub(r"\s*\([^)]*Anos\s+\d+[^)]*\)\s*$", "", name, flags=re.IGNORECASE).strip()
    return cleaned or name


def main():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    c = conn.cursor()

    # 1. Arrascaeta (#8)
    c.execute("UPDATE gols SET id_jogador = NULL WHERE id_jogador = 8 AND id_partida = 202431273 AND atleta = 'Gian'")
    c.execute("UPDATE gols SET clube = 'Defensor Sporting' WHERE id_jogador = 8 AND id_partida = 20147116 AND clube = 'The Strongest'")
    c.execute("UPDATE jogadores_estatisticas SET clubes = 'Flamengo, Cruzeiro, Defensor Sporting' WHERE id_jogador = 8")

    # 2. Neymar (#352) & Gabriel Barbosa (#7)
    c.execute("UPDATE gols SET clube = 'Santos' WHERE id_jogador = 352 AND id_partida = 202522368 AND clube = 'Atlético Goianiense'")
    c.execute("UPDATE jogadores_estatisticas SET clubes = 'Santos' WHERE id_jogador = 352")
    c.execute("UPDATE jogadores_estatisticas SET clubes = 'Santos, Flamengo, Cruzeiro' WHERE id_jogador = 7")

    # 3. Pelé (#11220)
    c.execute("UPDATE gols SET clube = 'Santos' WHERE id_jogador = 11220 AND id_partida = 19637017 AND clube = 'Botafogo'")
    c.execute(
        "UPDATE jogadores_estatisticas SET clubes = 'Santos, Seleção Brasileira', titulos = '[]' WHERE id_jogador = 11220"
    )

    # 4. Raphael Veiga (#12) & Everton Ribeiro (#14) & Pedro (#10)
    c.execute(
        """
        UPDATE jogadores_estatisticas
        SET data_nascimento = '1995-06-19', idade = 31, situacao = 'Em atividade', pe_preferencial = 'Canhoto'
        WHERE id_jogador = 12
        """
    )
    c.execute(
        """
        UPDATE jogadores_estatisticas
        SET data_nascimento = '1989-04-10', idade = 37, situacao = 'Em atividade'
        WHERE id_jogador = 14
        """
    )
    c.execute("UPDATE jogadores_estatisticas SET jogos_titular = 90 WHERE id_jogador = 10 AND jogos_titular = 0")

    # 5. Duplicated first-word names & (Clube - Anos XX) suffixes
    rows = c.execute("SELECT id_jogador, nome_exibicao FROM jogadores_estatisticas").fetchall()
    updated_names = 0
    for r in rows:
        orig = r["nome_exibicao"] or ""
        new_name = strip_club_anos_suffix(clean_duplicate_first_word(orig))
        if new_name != orig and len(new_name) >= 2:
            c.execute("UPDATE jogadores_estatisticas SET nome_exibicao = ? WHERE id_jogador = ?", (new_name, r["id_jogador"]))
            updated_names += 1

    # Also clean jogadores.nome_exibicao if table exists
    j_rows = c.execute("SELECT id_jogador, nome_exibicao FROM jogadores").fetchall()
    for r in j_rows:
        orig = r["nome_exibicao"] or ""
        new_name = strip_club_anos_suffix(clean_duplicate_first_word(orig))
        if new_name != orig and len(new_name) >= 2:
            c.execute("UPDATE jogadores SET nome_exibicao = ? WHERE id_jogador = ?", (new_name, r["id_jogador"]))

    # 6. Backfill aproveitamento_pontos for players with 0.0 who have escalacoes/gols
    zero_aprov_ids = [
        r[0]
        for r in c.execute(
            "SELECT id_jogador FROM jogadores_estatisticas WHERE COALESCE(aproveitamento_pontos, 0) = 0 AND total_jogos > 0 LIMIT 500"
        ).fetchall()
    ]
    aprov_updated = 0
    for jid in zero_aprov_ids:
        matches = c.execute(
            """
            SELECT DISTINCT p.id_partida, p.mandante, p.visitante, p.gols_mandante, p.gols_visitante, e.clube
            FROM escalacoes e
            JOIN partidas p ON e.id_partida = p.id_partida
            WHERE e.id_jogador = ? AND p.gols_mandante IS NOT NULL AND p.gols_visitante IS NOT NULL
            """,
            (jid,),
        ).fetchall()
        if not matches:
            continue
        pts = 0
        for m in matches:
            gm, gv = m["gols_mandante"], m["gols_visitante"]
            clube = (m["clube"] or "").lower()
            if gm == gv:
                pts += 1
            elif clube and clube in (m["mandante"] or "").lower():
                if gm > gv:
                    pts += 3
            elif clube and clube in (m["visitante"] or "").lower():
                if gv > gm:
                    pts += 3
        pct = round((pts / (len(matches) * 3)) * 100, 1)
        if pct > 0:
            c.execute("UPDATE jogadores_estatisticas SET aproveitamento_pontos = ? WHERE id_jogador = ?", (pct, jid))
            aprov_updated += 1

    # 7. Tecnicos perfil (Filipe Luís age 41)
    c.execute("UPDATE tecnicos_perfil SET idade = 41 WHERE id_tecnico = 201 AND nome LIKE '%Filipe%'")

    # 8. Dirty dim_clube rows (standings lines scraped as club names)
    dirty_clubs = c.execute(
        """
        SELECT clube_id, nome FROM dim_clube
        WHERE nome LIKE '%Relegated%'
           OR nome LIKE '%Qualified%'
           OR nome LIKE '%\t%'
           OR nome LIKE '%   %'
           OR nome LIKE '0-0 %'
        """
    ).fetchall()
    deleted_clubs = 0
    for dc in dirty_clubs:
        c.execute("DELETE FROM dim_clube WHERE clube_id = ?", (dc["clube_id"],))
        deleted_clubs += 1

    conn.commit()
    c.execute("PRAGMA journal_mode = DELETE")
    c.execute("VACUUM")
    conn.close()

    size_mb = os.path.getsize(DB_PATH) / (1024 * 1024)
    print(
        f"Limpeza concluída: updated_names={updated_names}, aprov_updated={aprov_updated}, "
        f"deleted_clubs={deleted_clubs}, db_size_mb={size_mb:.2f} MB"
    )


if __name__ == "__main__":
    main()
