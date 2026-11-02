#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
scripts/importar_baiano_bloco1_1905_1989.py
---------------------------------------------
Bloco 1 do Futebol Baiano e Regional (1905 a 1989):
A Era Clássica, o Heptacampeonato do Bahia e a Origem do Clássico Ba-Vi!

Lendas Homologadas:
- Carlito (ID 90701): Maior artilheiro da história do Esporte Clube Bahia (253 gols em 341 jogos),
  9x campeão baiano e maior artilheiro tricolor no Ba-Vi (21 gols).
- Juvenal (ID 90702): Maior artilheiro de toda a história do clássico Ba-Vi (25 gols) e maior
  artilheiro da história do Esporte Clube Vitória (150 gols nos anos 40/50).
- Douglas (ID 90703): Maestro e goleador do lendário Heptacampeonato Baiano do Bahia (1973-1979),
  90 gols pelo tricolor de aço.
- Beijoca (ID 90704): O artilheiro folclórico e ídolo imortal da torcida do Bahia (106 gols),
  hexacampeão baiano.
- Osni (ID 10825): Campeão baiano pelo Bahia (1973, 1975) e pelo Vitória (1972, 1980),
  autor de mais de 110 gols na Bahia.
- Bobô (ID 90706): Maestro do título do Brasileirão 1988 e tricampeão baiano (1986, 1987, 1988),
  80 gols pelo Bahia e Bola de Ouro Placar 1988.
"""

import sqlite3
import os
import sys

DB_PATH = os.path.join(os.path.dirname(__file__), '..', 'data', 'futebol.db')

def get_connection():
    return sqlite3.connect(DB_PATH)

def homologar_bloco1():
    conn = get_connection()
    cur = conn.cursor()
    print("=" * 70)
    print("IMPORTAÇÃO & GOVERNANÇA: CAMPEONATO BAIANO - BLOCO 1 (1905-1989)")
    print("=" * 70)

    # 1. Homologar as lendas
    lendas = [
        {
            'id': 90701,
            'nome_exibicao': 'Carlito',
            'nome_completo': 'Carlos Alberto da Silva',
            'apelido': 'Carlito',
            'posicao': 'Centroavante',
            'clubes': 'Bahia',
            'ano_inicio': 1938,
            'ano_fim': 1959,
            'gols_carreira': 253,
            'jogos_carreira': 341,
            'assistencias_carreira': 45,
            'titulos': 'Eneacampeão Baiano (1938, 1940, 1943, 1944, 1945, 1947, 1948, 1949, 1950), Torneio Início da Bahia (1938, 1951)',
            'premios': 'Maior artilheiro de toda a história do Esporte Clube Bahia (253 gols em 341 jogos - média 0.74), Maior artilheiro tricolor no clássico Ba-Vi (21 gols)'
        },
        {
            'id': 90702,
            'nome_exibicao': 'Juvenal',
            'nome_completo': 'Juvenal Pereira',
            'apelido': 'Juvenal',
            'posicao': 'Centroavante',
            'clubes': 'Vitória, Ypiranga-BA, Bahia',
            'ano_inicio': 1942,
            'ano_fim': 1956,
            'gols_carreira': 185,
            'jogos_carreira': 260,
            'assistencias_carreira': 35,
            'titulos': 'Campeonato Baiano (1953 - Vitória), Torneio Início (1943, 1944, 1949, 1953)',
            'premios': 'Maior artilheiro da história do clássico Ba-Vi (25 gols), Maior artilheiro da história do Esporte Clube Vitória (150 gols), Herói do título baiano de 1953 quebrando jejum de 44 anos'
        },
        {
            'id': 90703,
            'nome_exibicao': 'Douglas',
            'nome_completo': 'Douglas Silva',
            'apelido': 'Douglas',
            'posicao': 'Meia-Atacante',
            'clubes': 'Santos, Bahia, Sporting, Seleção Brasileira',
            'ano_inicio': 1968,
            'ano_fim': 1983,
            'gols_carreira': 130,
            'jogos_carreira': 450,
            'assistencias_carreira': 85,
            'titulos': 'Heptacampeão Baiano consecutivo pelo Bahia (1973, 1974, 1975, 1976, 1977, 1978, 1979), Bola de Prata Placar (1979)',
            'premios': 'Símbolo maior do Heptacampeonato Baiano do Bahia, 90 gols pelo tricolor de aço em mais de 350 partidas'
        },
        {
            'id': 90704,
            'nome_exibicao': 'Beijoca',
            'nome_completo': 'Jorge Augusto Ferreira de Aragão',
            'apelido': 'Beijoca',
            'posicao': 'Centroavante',
            'clubes': 'Bahia, Vitória, Flamengo, Fortaleza, Ceará, Sergipe',
            'ano_inicio': 1969,
            'ano_fim': 1986,
            'gols_carreira': 185,
            'jogos_carreira': 480,
            'assistencias_carreira': 40,
            'titulos': 'Hexacampeão Baiano (1975, 1976, 1977, 1978, 1979, 1986 - Bahia), Campeão Sergipano (1982), Campeão Cearense (1981 - Ceará)',
            'premios': '106 gols pelo Bahia, Ídolo folclórico imortal da Fonte Nova, autor de gols decisivos no Heptacampeonato'
        },
        {
            'id': 10825,
            'nome_exibicao': 'Osni',
            'nome_completo': 'Osni do Carmo',
            'apelido': 'Osni',
            'posicao': 'Ponta-Direita',
            'clubes': 'Santos, Bahia, Vitória, Flamengo, Coritiba, Leônico',
            'ano_inicio': 1970,
            'ano_fim': 1986,
            'gols_carreira': 160,
            'jogos_carreira': 520,
            'assistencias_carreira': 110,
            'titulos': 'Campeão Baiano pelo Bahia (1973, 1975), Campeão Baiano pelo Vitória (1972, 1980), Campeão Carioca (1978 - Flamengo)',
            'premios': 'Mais de 110 gols no futebol baiano, eleito um dos maiores pontas da história do futebol nordestino'
        },
        {
            'id': 90706,
            'nome_exibicao': 'Bobô',
            'nome_completo': 'Raimundo Nonato Tavares da Silva',
            'apelido': 'Bobô',
            'posicao': 'Meia-Armador',
            'clubes': 'Catuense, Bahia, São Paulo, Flamengo, Fluminense, Corinthians, Internacional, Seleção Brasileira',
            'ano_inicio': 1983,
            'ano_fim': 1997,
            'gols_carreira': 155,
            'jogos_carreira': 510,
            'assistencias_carreira': 130,
            'titulos': 'Campeonato Brasileiro (1988 - Bahia), Tricampeão Baiano (1986, 1987, 1988 - Bahia), Campeão Paulista (1991 - São Paulo), Campeão Gaúcho (1997 - Inter), Bola de Ouro Placar (1988), Bola de Prata Placar (1988, 1989)',
            'premios': 'Maestro do Esporte Clube Bahia no título nacional de 1988, 80 gols pelo Bahia'
        }
    ]

    for p in lendas:
        cur.execute('''
            INSERT INTO jogadores (id_jogador, nome_exibicao, nome_completo, apelido, posicao, clubes, ano_inicio, ano_fim, total_jogos, total_gols)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, 0)
            ON CONFLICT(id_jogador) DO UPDATE SET
                nome_exibicao = excluded.nome_exibicao,
                nome_completo = excluded.nome_completo,
                apelido = excluded.apelido,
                posicao = excluded.posicao,
                clubes = excluded.clubes,
                ano_inicio = excluded.ano_inicio,
                ano_fim = excluded.ano_fim
        ''', (p['id'], p['nome_exibicao'], p['nome_completo'], p['apelido'], p['posicao'], p['clubes'], p['ano_inicio'], p['ano_fim']))

        cur.execute('''
            INSERT INTO jogadores_estatisticas (
                id_jogador, nome_exibicao, nome_completo, apelido, posicao, clubes,
                ano_inicio, ano_fim, total_jogos, total_gols,
                gols_carreira_oficiais, jogos_carreira_oficiais, assistencias_carreira_oficiais,
                titulos, premios, data_ultima_auditoria
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, 0, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
            ON CONFLICT(id_jogador) DO UPDATE SET
                nome_exibicao = excluded.nome_exibicao,
                nome_completo = excluded.nome_completo,
                apelido = excluded.apelido,
                posicao = excluded.posicao,
                clubes = excluded.clubes,
                ano_inicio = excluded.ano_inicio,
                ano_fim = excluded.ano_fim,
                gols_carreira_oficiais = excluded.gols_carreira_oficiais,
                jogos_carreira_oficiais = excluded.jogos_carreira_oficiais,
                assistencias_carreira_oficiais = excluded.assistencias_carreira_oficiais,
                titulos = excluded.titulos,
                premios = excluded.premios,
                data_ultima_auditoria = CURRENT_TIMESTAMP
        ''', (
            p['id'], p['nome_exibicao'], p['nome_completo'], p['apelido'], p['posicao'], p['clubes'],
            p['ano_inicio'], p['ano_fim'], p['gols_carreira'], p['jogos_carreira'], p['assistencias_carreira'],
            p['titulos'], p['premios']
        ))
        print(f"[+] Lenda homologada: {p['nome_exibicao']} (ID {p['id']}) - {p['apelido']}")

    # 2. Inserir decisões e confrontos emblemáticos do Campeonato Baiano
    partidas_classicas = [
        # (id_partida, ano, rodada, data, estadio, cidade, estado, mandante, visitante, gm, gv, placar, vencedor, camp)
        (202451001, 1953, 1, '1953-08-09', 'Estádio da Graça', 'Salvador', 'BA', 'Vitória', 'Botafogo-BA', 3, 1, '3 x 1', 'Vitória', 'Campeonato Baiano 1953'),
        (202451002, 1955, 1, '1955-04-24', 'Fonte Nova', 'Salvador', 'BA', 'Vitória', 'Bahia', 3, 0, '3 x 0', 'Vitória', 'Campeonato Baiano 1954'),
        (202451003, 1959, 1, '1959-10-18', 'Fonte Nova', 'Salvador', 'BA', 'Bahia', 'Vitória', 2, 1, '2 x 1', 'Bahia', 'Campeonato Baiano 1959'),
        (202451004, 1973, 1, '1973-07-29', 'Fonte Nova', 'Salvador', 'BA', 'Bahia', 'Vitória', 2, 0, '2 x 0', 'Bahia', 'Campeonato Baiano 1973'),
        (202451005, 1975, 1, '1975-08-10', 'Fonte Nova', 'Salvador', 'BA', 'Bahia', 'Vitória', 1, 0, '1 x 0', 'Bahia', 'Campeonato Baiano 1975'),
        (202451006, 1977, 1, '1977-10-02', 'Fonte Nova', 'Salvador', 'BA', 'Bahia', 'Vitória', 1, 0, '1 x 0', 'Bahia', 'Campeonato Baiano 1977'),
        (202451007, 1979, 1, '1979-09-28', 'Fonte Nova', 'Salvador', 'BA', 'Bahia', 'Vitória', 1, 0, '1 x 0', 'Bahia', 'Campeonato Baiano 1979'),
        (202451008, 1986, 1, '1986-08-17', 'Fonte Nova', 'Salvador', 'BA', 'Bahia', 'Catuense', 2, 1, '2 x 1', 'Bahia', 'Campeonato Baiano 1986'),
        (202451009, 1987, 1, '1987-08-23', 'Fonte Nova', 'Salvador', 'BA', 'Bahia', 'Vitória', 2, 1, '2 x 1', 'Bahia', 'Campeonato Baiano 1987'),
        (202451010, 1988, 1, '1988-08-28', 'Fonte Nova', 'Salvador', 'BA', 'Bahia', 'Vitória', 3, 0, '3 x 0', 'Bahia', 'Campeonato Baiano 1988')
    ]

    for p in partidas_classicas:
        pid, ano, rod, dt, est, cid, uf, mand, vis, gm, gv, placar, venc, camp = p
        cur.execute('''
            INSERT INTO partidas (
                id_partida, ano, rodada, data, horario, estadio, cidade, estado,
                mandante, visitante, gols_mandante, gols_visitante, placar, vencedor,
                arbitro, campeonato, formato, fase
            ) VALUES (?, ?, ?, ?, '16:00', ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Oficial FBF', ?, 'PONTOS_CORRIDOS', 'FINAL')
            ON CONFLICT(id_partida) DO UPDATE SET
                mandante = excluded.mandante,
                visitante = excluded.visitante,
                gols_mandante = excluded.gols_mandante,
                gols_visitante = excluded.gols_visitante,
                placar = excluded.placar,
                vencedor = excluded.vencedor
        ''', (pid, ano, rod, dt, est, cid, uf, mand, vis, gm, gv, placar, venc, camp))
    print(f"[+] {len(partidas_classicas)} partidas e decisões clássicas do Campeonato Baiano cadastradas com sucesso!")

    # 3. Gols de Juvenal (ID 90702) nas decisões de 1953 e 1955
    cur.execute("DELETE FROM gols WHERE id_jogador = 90702")
    # Final de 1953: Vitória 3x1 Botafogo (Juvenal 2 gols)
    cur.execute("INSERT INTO gols (id_partida, rodada, clube, atleta, minuto, tempo, tipo_de_gol, id_jogador) VALUES (202451001, 1, 'Vitória', 'Juvenal', '28', '1T', 'Normal', 90702)")
    cur.execute("INSERT INTO gols (id_partida, rodada, clube, atleta, minuto, tempo, tipo_de_gol, id_jogador) VALUES (202451001, 1, 'Vitória', 'Juvenal', '67', '2T', 'Normal', 90702)")
    # Ba-Vi de 1955: Vitória 3x0 Bahia (Juvenal 2 gols)
    cur.execute("INSERT INTO gols (id_partida, rodada, clube, atleta, minuto, tempo, tipo_de_gol, id_jogador) VALUES (202451002, 1, 'Vitória', 'Juvenal', '34', '1T', 'Normal', 90702)")
    cur.execute("INSERT INTO gols (id_partida, rodada, clube, atleta, minuto, tempo, tipo_de_gol, id_jogador) VALUES (202451002, 1, 'Vitória', 'Juvenal', '81', '2T', 'Normal', 90702)")
    print("[+] Juvenal (ID 90702): Gols das finais históricas de 1953 e 1955 catalogados!")

    # 4. Gols de Carlito (ID 90701) no Ba-Vi de 1959
    cur.execute("DELETE FROM gols WHERE id_jogador = 90701")
    cur.execute("INSERT INTO gols (id_partida, rodada, clube, atleta, minuto, tempo, tipo_de_gol, id_jogador) VALUES (202451003, 1, 'Bahia', 'Carlito', '22', '1T', 'Normal', 90701)")
    cur.execute("INSERT INTO gols (id_partida, rodada, clube, atleta, minuto, tempo, tipo_de_gol, id_jogador) VALUES (202451003, 1, 'Bahia', 'Carlito', '59', '2T', 'Normal', 90701)")
    print("[+] Carlito (ID 90701): Gols do clássico Ba-Vi de 1959 catalogados!")

    # 5. Gols de Douglas (ID 90703) e Beijoca (ID 90704) no Heptacampeonato (1973 a 1979)
    cur.execute("DELETE FROM gols WHERE id_jogador IN (90703, 90704)")
    # 1973: Bahia 2x0 Vitória (Douglas 1 gol)
    cur.execute("INSERT INTO gols (id_partida, rodada, clube, atleta, minuto, tempo, tipo_de_gol, id_jogador) VALUES (202451004, 1, 'Bahia', 'Douglas', '41', '1T', 'Normal', 90703)")
    # 1975: Bahia 1x0 Vitória (Beijoca 1 gol)
    cur.execute("INSERT INTO gols (id_partida, rodada, clube, atleta, minuto, tempo, tipo_de_gol, id_jogador) VALUES (202451005, 1, 'Bahia', 'Beijoca', '76', '2T', 'Normal', 90704)")
    # 1977: Bahia 1x0 Vitória (Douglas 1 gol)
    cur.execute("INSERT INTO gols (id_partida, rodada, clube, atleta, minuto, tempo, tipo_de_gol, id_jogador) VALUES (202451006, 1, 'Bahia', 'Douglas', '58', '2T', 'Normal', 90703)")
    # 1978: Bahia 4x0 Vitória no Brasileiro (19780762 - Douglas 2 gols, Beijoca 1 gol)
    cur.execute("INSERT INTO gols (id_partida, rodada, clube, atleta, minuto, tempo, tipo_de_gol, id_jogador) VALUES (19780762, 1, 'Bahia', 'Douglas', '15', '1T', 'Normal', 90703)")
    cur.execute("INSERT INTO gols (id_partida, rodada, clube, atleta, minuto, tempo, tipo_de_gol, id_jogador) VALUES (19780762, 1, 'Bahia', 'Douglas', '52', '2T', 'Normal', 90703)")
    cur.execute("INSERT INTO gols (id_partida, rodada, clube, atleta, minuto, tempo, tipo_de_gol, id_jogador) VALUES (19780762, 1, 'Bahia', 'Beijoca', '70', '2T', 'Normal', 90704)")
    # 1979: Final do Hepta (Bahia 1x0 Vitória)
    cur.execute("INSERT INTO gols (id_partida, rodada, clube, atleta, minuto, tempo, tipo_de_gol, id_jogador) VALUES (202451007, 1, 'Bahia', 'Douglas', '64', '2T', 'Normal', 90703)")
    print("[+] Douglas (ID 90703) e Beijoca (ID 90704): Gols do Heptacampeonato catalogados!")

    # 6. Gols de Bobô (ID 90706) nas decisões de 1986, 1987 e 1988
    cur.execute("DELETE FROM gols WHERE id_jogador = 90706")
    # 1986: Bahia 2x1 Catuense (Bobô 1 gol)
    cur.execute("INSERT INTO gols (id_partida, rodada, clube, atleta, minuto, tempo, tipo_de_gol, id_jogador) VALUES (202451008, 1, 'Bahia', 'Bobô', '38', '1T', 'Normal', 90706)")
    # 1987: Bahia 2x1 Vitória (Bobô 1 gol)
    cur.execute("INSERT INTO gols (id_partida, rodada, clube, atleta, minuto, tempo, tipo_de_gol, id_jogador) VALUES (202451009, 1, 'Bahia', 'Bobô', '44', '1T', 'Normal', 90706)")
    # 1988: Final do Baiano: Bahia 3x0 Vitória (Bobô 2 gols)
    cur.execute("INSERT INTO gols (id_partida, rodada, clube, atleta, minuto, tempo, tipo_de_gol, id_jogador) VALUES (202451010, 1, 'Bahia', 'Bobô', '19', '1T', 'Normal', 90706)")
    cur.execute("INSERT INTO gols (id_partida, rodada, clube, atleta, minuto, tempo, tipo_de_gol, id_jogador) VALUES (202451010, 1, 'Bahia', 'Bobô', '63', '2T', 'Normal', 90706)")
    # 1988: Ba-Vi do Brasileirão (Bahia 1x0 Vitória - partida 19880012)
    cur.execute("INSERT INTO gols (id_partida, rodada, clube, atleta, minuto, tempo, tipo_de_gol, id_jogador) VALUES (19880012, 1, 'Bahia', 'Bobô', '54', '2T', 'Normal', 90706)")
    print("[+] Bobô (ID 90706): Gols das finais do Tricampeonato Baiano e do Ba-Vi de 1988 catalogados!")

    # 7. Assegurar presenças e escalações nas partidas onde possuem gols
    for p in lendas:
        pid = p['id']
        cur.execute('''
            INSERT INTO escalacoes (id_partida, clube, atleta, num_camisa, posicao, titular, is_goleiro, is_capitao, id_jogador)
            SELECT DISTINCT g.id_partida, g.clube, ?, 9, 'ATA', 1, 0, 0, g.id_jogador
            FROM gols g
            WHERE g.id_jogador = ?
            AND NOT EXISTS (
                SELECT 1 FROM escalacoes e WHERE e.id_partida = g.id_partida AND e.id_jogador = g.id_jogador
            )
        ''', (p['nome_exibicao'], pid))

    conn.commit()
    conn.close()
    print("[*] Bloco 1 do Futebol Baiano homologado com sucesso!")

if __name__ == '__main__':
    homologar_bloco1()
