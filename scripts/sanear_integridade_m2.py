# -*- coding: utf-8 -*-
"""
Onda 1 — Script idempotente de saneamento relacional do `data/futebol.db`.

Corrige na causa-raiz as anomalias acumuladas:
1. Normaliza tipo_de_gol ('Gol Contra' -> 'Contra'), preservando 'Barriga' (1995).
2. Remove gols atribuídos em partidas oficiais 0x0 (contaminação id_gol >= 20320000).
3. Desempacota linhas da tabela `gols` com múltiplos minutos ('37  62' -> 2 linhas atômicas).
4. Reconcilia clube divergente em `gols` (ex.: 'Botafogo' -> 'Botafogo-SP', 'Atlético' -> 'Atlético-GO')
   para casar exatamente com `partidas.mandante` ou `partidas.visitante`.
5. Remove duplicatas exatas e excessos de gols contaminados (id_gol >= 20320000) além do placar oficial.
6. Remove escalações órfãs sem partida correspondente.
7. Remove odds sintéticas residuais (2.10 / 3.20 / 3.50) de `odds_partidas`.
8. Executa `PRAGMA wal_checkpoint(TRUNCATE)`, `PRAGMA journal_mode=DELETE` e `VACUUM`.
"""
import os
import re
import sqlite3
import unicodedata

DB_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data", "futebol.db")


def _norm(s: str) -> str:
    txt = unicodedata.normalize("NFKD", (s or "").strip().lower())
    return "".join(ch for ch in txt if not unicodedata.combining(ch))


def _casar_clube(g_clube: str, mandante: str, visitante: str):
    ng = _norm(g_clube)
    nm = _norm(mandante)
    nv = _norm(visitante)
    if not ng:
        return None
    if ng == nm:
        return mandante
    if ng == nv:
        return visitante
    # Prefixo / contenção inequívoca (apenas quando casa com UM dos lados)
    m_match = ng in nm or nm in ng or (ng.split()[0] == nm.split()[0] if ng and nm else False)
    v_match = ng in nv or nv in ng or (ng.split()[0] == nv.split()[0] if ng and nv else False)
    if m_match and not v_match:
        return mandante
    if v_match and not m_match:
        return visitante
    return None


def main():
    conn = sqlite3.connect(DB_PATH, timeout=30)
    conn.row_factory = sqlite3.Row
    cur = conn.cursor()

    # 1. Tipos de gol canônicos
    cur.execute("UPDATE gols SET tipo_de_gol = 'Contra' WHERE tipo_de_gol = 'Gol Contra';")
    n_tipos = cur.rowcount

    # 2. Remover gols em partidas oficialmente 0x0
    cur.execute(
        """
        DELETE FROM gols
        WHERE id_partida IN (
            SELECT id_partida FROM partidas
            WHERE gols_mandante = 0 AND gols_visitante = 0
        );
        """
    )
    n_0x0 = cur.rowcount

    # 3. Desempacotar linhas com múltiplos minutos ('37  62' ou '12  32  63')
    packed = cur.execute(
        "SELECT * FROM gols WHERE minuto LIKE '%  %' OR minuto LIKE '%;%';"
    ).fetchall()
    n_unpacked_del = 0
    n_unpacked_ins = 0
    max_id = cur.execute("SELECT COALESCE(MAX(id_gol), 0) FROM gols;").fetchone()[0]
    for r in packed:
        raw_min = str(r["minuto"] or "").strip()
        tokens = [t.strip() for t in re.split(r"\s{2,}|;", raw_min) if t.strip()]
        if len(tokens) <= 1:
            continue
        cur.execute("DELETE FROM gols WHERE id_gol = ?;", (r["id_gol"],))
        n_unpacked_del += 1
        for tok in tokens:
            max_id += 1
            cur.execute(
                """
                INSERT INTO gols (id_gol, id_partida, clube, id_jogador, atleta, minuto, tempo, tipo_de_gol)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?);
                """,
                (max_id, r["id_partida"], r["clube"], r["id_jogador"], r["atleta"], tok, r["tempo"], r["tipo_de_gol"]),
            )
            n_unpacked_ins += 1

    # 4. Harmonizar clube divergente em gols contra mandante/visitante
    # (Padroniza súmula histórica 20147116 para 'Defensor Sporting' 2 x 0 'The Strongest', remove duplicata 202523950 vazia e preserva clubes canônicos de Arrascaeta)
    cur.execute(
        "UPDATE partidas SET mandante = 'Defensor Sporting', gols_mandante = 2, gols_visitante = 0, placar = '2 x 0', vencedor = 'Defensor Sporting' WHERE id_partida = 20147116;"
    )
    cur.execute(
        """
        DELETE FROM partidas
        WHERE id_partida = 202523950
          AND NOT EXISTS (SELECT 1 FROM gols WHERE id_partida = 202523950)
          AND NOT EXISTS (SELECT 1 FROM escalacoes WHERE id_partida = 202523950);
        """
    )
    cur.execute("UPDATE gols SET clube = 'Defensor Sporting' WHERE id_partida = 20147116 AND id_jogador IN (8, 10538);")
    cur.execute("UPDATE jogadores_estatisticas SET clubes = 'Flamengo, Cruzeiro, Defensor Sporting' WHERE id_jogador = 8;")
    cur.execute("UPDATE jogadores SET clubes = 'Flamengo, Cruzeiro, Defensor Sporting' WHERE id_jogador = 8;")

    divs = cur.execute(
        """
        SELECT g.id_gol, g.clube, p.mandante, p.visitante
        FROM gols g
        JOIN partidas p ON p.id_partida = g.id_partida
        WHERE g.clube != p.mandante AND g.clube != p.visitante;
        """
    ).fetchall()
    n_club_fix = 0
    n_club_del = 0
    for d in divs:
        alvo = _casar_clube(d["clube"], d["mandante"], d["visitante"])
        if alvo:
            cur.execute("UPDATE gols SET clube = ? WHERE id_gol = ?;", (alvo, d["id_gol"]))
            n_club_fix += 1
        else:
            # Caso raro sem correspondência (ex: contaminação de partida errada)
            cur.execute("DELETE FROM gols WHERE id_gol = ?;", (d["id_gol"],))
            n_club_del += 1

    # 5. Deduplicação de gols idênticos na mesma partida + poda de excessos contaminados (id_gol >= 20320000)
    excess_matches = cur.execute(
        """
        SELECT p.id_partida, p.mandante, p.visitante, p.gols_mandante, p.gols_visitante,
               COUNT(g.id_gol) AS enc
        FROM partidas p
        JOIN gols g ON g.id_partida = p.id_partida
        WHERE p.gols_mandante IS NOT NULL AND p.gols_visitante IS NOT NULL
        GROUP BY p.id_partida
        HAVING enc > (p.gols_mandante + p.gols_visitante);
        """
    ).fetchall()

    n_excesso_del = 0
    for m in excess_matches:
        pid = m["id_partida"]
        esp_m = int(m["gols_mandante"])
        esp_v = int(m["gols_visitante"])
        esp_tot = esp_m + esp_v

        gols_p = cur.execute(
            "SELECT id_gol, clube, atleta, minuto FROM gols WHERE id_partida = ? ORDER BY id_gol ASC;",
            (pid,),
        ).fetchall()

        # Primeiro remove duplicatas exatas (mesmo atleta, clube, minuto) mantendo o menor id_gol
        vistos = set()
        manter = []
        for g in gols_p:
            chave = (_norm(g["clube"]), _norm(g["atleta"]), (g["minuto"] or "").strip())
            if chave in vistos and len(manter) + (len(gols_p) - gols_p.index(g) - 1) >= esp_tot:
                cur.execute("DELETE FROM gols WHERE id_gol = ?;", (g["id_gol"],))
                n_excesso_del += 1
            else:
                vistos.add(chave)
                manter.append(g)

        # Se ainda houver excesso acima do placar esperado do clube/jogo, apara linhas M2 (>= 20320000) excedentes
        if len(manter) > esp_tot:
            # Separa por clube mandante vs visitante
            por_lado = {m["mandante"]: [], m["visitante"]: [], "__outro__": []}
            for g in manter:
                if g["clube"] == m["mandante"]:
                    por_lado[m["mandante"]].append(g)
                elif g["clube"] == m["visitante"]:
                    por_lado[m["visitante"]].append(g)
                else:
                    por_lado["__outro__"].append(g)

            for g in por_lado["__outro__"]:
                cur.execute("DELETE FROM gols WHERE id_gol = ?;", (g["id_gol"],))
                n_excesso_del += 1

            for clb, cota in [(m["mandante"], esp_m), (m["visitante"], esp_v)]:
                lista = por_lado[clb]
                if len(lista) > cota:
                    # Ordena priorizando remoção de id_gol >= 20320000 (maiores ids primeiro)
                    remover_cand = sorted(lista, key=lambda x: (0 if x["id_gol"] >= 20320000 else 1, -x["id_gol"]))
                    excedente = len(lista) - cota
                    for g in remover_cand[:excedente]:
                        cur.execute("DELETE FROM gols WHERE id_gol = ?;", (g["id_gol"],))
                        n_excesso_del += 1

    # 6. Escalações órfãs
    cur.execute("DELETE FROM escalacoes WHERE id_partida NOT IN (SELECT id_partida FROM partidas);")
    n_esc_orfa = cur.rowcount

    # 7. Odds sintéticas residuais (2.10 / 3.20 / 3.50)
    cur.execute(
        """
        DELETE FROM odds_partidas
        WHERE ABS(odd_mandante - 2.10) < 0.01
          AND ABS(odd_empate - 3.20) < 0.01
          AND ABS(odd_visitante - 3.50) < 0.01;
        """
    )
    n_odds_sint = cur.rowcount

    # 7b. Reconciliar atletas onde total_jogos ficou artificialmente igual a total_gols após desempacotamento
    atletas_eq = cur.execute(
        """
        SELECT id_jogador
        FROM jogadores_estatisticas
        WHERE total_gols > 10
          AND jogos_carreira_oficiais > total_gols * 1.5
          AND total_jogos = total_gols;
        """
    ).fetchall()
    n_atl_fix = 0
    for row_a in atletas_eq:
        aid = row_a["id_jogador"]
        real_p = cur.execute(
            """
            SELECT COUNT(DISTINCT id_partida) FROM (
                SELECT id_partida FROM gols WHERE id_jogador = ?
                UNION SELECT id_partida FROM escalacoes WHERE id_jogador = ?
                UNION SELECT id_partida FROM cartoes WHERE id_jogador = ?
            );
            """,
            (aid, aid, aid),
        ).fetchone()[0]
        real_g = cur.execute("SELECT COUNT(*) FROM gols WHERE id_jogador = ?;", (aid,)).fetchone()[0]
        if real_p > 0 and real_p != real_g:
            cur.execute(
                "UPDATE jogadores_estatisticas SET total_jogos = ?, total_gols = ? WHERE id_jogador = ?;",
                (real_p, real_g, aid),
            )
            n_atl_fix += 1

    conn.commit()

    # 8. Governança SQLite: sair de WAL -> DELETE e compactar via VACUUM
    cur.execute("PRAGMA wal_checkpoint(TRUNCATE);")
    cur.execute("PRAGMA journal_mode = DELETE;")
    cur.execute("VACUUM;")
    jm = cur.execute("PRAGMA journal_mode;").fetchone()[0]
    conn.close()

    size_mb = os.path.getsize(DB_PATH) / (1024 * 1024)
    print(
        f"Saneamento concluído: tipos={n_tipos}, 0x0_del={n_0x0}, "
        f"unpacked={n_unpacked_del}->{n_unpacked_ins}, clube_fix={n_club_fix}, clube_del={n_club_del}, "
        f"excesso_del={n_excesso_del}, esc_orfa_del={n_esc_orfa}, odds_sint_del={n_odds_sint} | "
        f"journal_mode={jm}, size={size_mb:.2f} MiB"
    )


if __name__ == "__main__":
    main()
