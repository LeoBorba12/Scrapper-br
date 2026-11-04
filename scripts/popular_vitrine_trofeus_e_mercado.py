#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
scripts/popular_vitrine_trofeus_e_mercado.py
======================================================================
1. Popula a Galeria de Troféus dos Clubes ('clubes_trofeus_vitrine'):
   - Títulos homologados (Mundiais FIFA/Intercontinentais, Libertadores,
     Brasileirões, Copas do Brasil e Estaduais) para os 20 gigantes do Brasil.
   - Vincula cada conquista a um tipo de réplica 3D:
     * 'mundial'
     * 'libertadores'
     * 'brasileirao'
     * 'copa_brasil'
     * 'estadual'
   - Anos de cada conquista para exibição no hover 3D.

2. Popula o Histórico de Valor de Mercado dos Atletas ('historico_valor_mercado'):
   - Evolução de valor em EUR (€) e BRL (R$) ao longo dos anos para as principais
     estrelas e ícones do futebol brasileiro.
   - Identificação do pico histórico de valorização ('pico_historico = 1').
"""

import os
import sys
import sqlite3

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')
if hasattr(sys.stderr, 'reconfigure'):
    sys.stderr.reconfigure(encoding='utf-8', errors='replace')

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DB_PATH = os.path.join(BASE_DIR, "data", "futebol.db")

# 1. Troféus Oficiais dos Clubes
TROFEUS_CLUBES = [
    # Flamengo
    ("Flamengo", "Mundial de Clubes / Intercontinental", "mundial", 1, "1981", "mundial"),
    ("Flamengo", "Copa Libertadores da América", "libertadores", 3, "1981, 2019, 2022", "libertadores"),
    ("Flamengo", "Campeonato Brasileiro", "brasileirao", 8, "1980, 1982, 1983, 1987, 1992, 2009, 2019, 2020", "brasileirao"),
    ("Flamengo", "Copa do Brasil", "copa_brasil", 5, "1990, 2006, 2013, 2022, 2024", "copa_brasil"),
    ("Flamengo", "Campeonato Carioca", "estadual", 38, "1914, 1915, 1920, 1921, 1925, 1927, 1939, 1942, 1943, 1944, 1953, 1954, 1955, 1963, 1965, 1972, 1974, 1978, 1979, 1979-E, 1981, 1986, 1991, 1996, 1999, 2000, 2001, 2004, 2007, 2008, 2009, 2011, 2014, 2017, 2019, 2020, 2021, 2024", "estadual"),

    # Palmeiras
    ("Palmeiras", "Copa Rio Internacional (Mundial)", "mundial", 1, "1951", "mundial"),
    ("Palmeiras", "Copa Libertadores da América", "libertadores", 3, "1999, 2020, 2021", "libertadores"),
    ("Palmeiras", "Campeonato Brasileiro", "brasileirao", 12, "1960, 1967, 1967, 1969, 1972, 1973, 1993, 1994, 2016, 2018, 2022, 2023", "brasileirao"),
    ("Palmeiras", "Copa do Brasil", "copa_brasil", 4, "1998, 2012, 2015, 2020", "copa_brasil"),
    ("Palmeiras", "Campeonato Paulista", "estadual", 26, "1920, 1926, 1927, 1932, 1933, 1934, 1936, 1940, 1942, 1944, 1947, 1950, 1959, 1963, 1966, 1972, 1974, 1976, 1993, 1994, 1996, 2008, 2020, 2022, 2023, 2024", "estadual"),

    # São Paulo
    ("São Paulo", "Mundial de Clubes FIFA / Intercontinental", "mundial", 3, "1992, 1993, 2005", "mundial"),
    ("São Paulo", "Copa Libertadores da América", "libertadores", 3, "1992, 1993, 2005", "libertadores"),
    ("São Paulo", "Campeonato Brasileiro", "brasileirao", 6, "1977, 1986, 1991, 2006, 2007, 2008", "brasileirao"),
    ("São Paulo", "Copa do Brasil", "copa_brasil", 1, "2023", "copa_brasil"),
    ("São Paulo", "Campeonato Paulista", "estadual", 22, "1931, 1943, 1945, 1946, 1948, 1949, 1953, 1957, 1970, 1971, 1975, 1980, 1981, 1985, 1987, 1989, 1991, 1992, 1998, 2000, 2005, 2021", "estadual"),

    # Santos
    ("Santos", "Mundial Intercontinental", "mundial", 2, "1962, 1963", "mundial"),
    ("Santos", "Copa Libertadores da América", "libertadores", 3, "1962, 1963, 2011", "libertadores"),
    ("Santos", "Campeonato Brasileiro", "brasileirao", 8, "1961, 1962, 1963, 1964, 1965, 1968, 2002, 2004", "brasileirao"),
    ("Santos", "Copa do Brasil", "copa_brasil", 1, "2010", "copa_brasil"),
    ("Santos", "Campeonato Paulista", "estadual", 22, "1935, 1955, 1956, 1958, 1960, 1961, 1962, 1964, 1965, 1967, 1968, 1969, 1973, 1978, 1984, 2006, 2007, 2010, 2011, 2012, 2015, 2016", "estadual"),

    # Corinthians
    ("Corinthians", "Mundial de Clubes FIFA", "mundial", 2, "2000, 2012", "mundial"),
    ("Corinthians", "Copa Libertadores da América", "libertadores", 1, "2012", "libertadores"),
    ("Corinthians", "Campeonato Brasileiro", "brasileirao", 7, "1990, 1998, 1999, 2005, 2011, 2015, 2017", "brasileirao"),
    ("Corinthians", "Copa do Brasil", "copa_brasil", 3, "1995, 2002, 2009", "copa_brasil"),
    ("Corinthians", "Campeonato Paulista", "estadual", 30, "1914, 1916, 1922, 1923, 1924, 1928, 1929, 1930, 1937, 1938, 1939, 1941, 1951, 1952, 1954, 1977, 1979, 1982, 1983, 1988, 1995, 1997, 1999, 2001, 2003, 2009, 2013, 2017, 2018, 2019", "estadual"),

    # Grêmio
    ("Grêmio", "Mundial Intercontinental", "mundial", 1, "1983", "mundial"),
    ("Grêmio", "Copa Libertadores da América", "libertadores", 3, "1983, 1995, 2017", "libertadores"),
    ("Grêmio", "Campeonato Brasileiro", "brasileirao", 2, "1981, 1996", "brasileirao"),
    ("Grêmio", "Copa do Brasil", "copa_brasil", 5, "1989, 1994, 1997, 2001, 2016", "copa_brasil"),
    ("Grêmio", "Campeonato Gaúcho", "estadual", 43, "1921, 1922, 1926, 1931, 1932, 1946, 1949, 1956, 1957, 1958, 1959, 1960, 1962, 1963, 1964, 1965, 1966, 1967, 1968, 1977, 1979, 1980, 1985, 1986, 1987, 1988, 1989, 1990, 1993, 1995, 1996, 1999, 2001, 2006, 2007, 2010, 2018, 2019, 2020, 2021, 2022, 2023, 2024", "estadual"),

    # Internacional
    ("Internacional", "Mundial de Clubes FIFA", "mundial", 1, "2006", "mundial"),
    ("Internacional", "Copa Libertadores da América", "libertadores", 2, "2006, 2010", "libertadores"),
    ("Internacional", "Campeonato Brasileiro", "brasileirao", 3, "1975, 1976, 1979", "brasileirao"),
    ("Internacional", "Copa do Brasil", "copa_brasil", 1, "1992", "copa_brasil"),
    ("Internacional", "Campeonato Gaúcho", "estadual", 45, "1927, 1934, 1940, 1941, 1942, 1943, 1944, 1945, 1947, 1948, 1950, 1951, 1952, 1953, 1955, 1961, 1969, 1970, 1971, 1972, 1973, 1974, 1975, 1976, 1978, 1981, 1982, 1983, 1984, 1991, 1992, 1994, 1997, 2002, 2003, 2004, 2005, 2008, 2009, 2011, 2012, 2013, 2014, 2015, 2016", "estadual"),

    # Cruzeiro
    ("Cruzeiro", "Copa Libertadores da América", "libertadores", 2, "1976, 1997", "libertadores"),
    ("Cruzeiro", "Campeonato Brasileiro", "brasileirao", 4, "1966, 2003, 2013, 2014", "brasileirao"),
    ("Cruzeiro", "Copa do Brasil", "copa_brasil", 6, "1993, 1996, 2000, 2003, 2017, 2018", "copa_brasil"),
    ("Cruzeiro", "Campeonato Mineiro", "estadual", 38, "1928, 1929, 1930, 1940, 1943, 1944, 1945, 1956, 1959, 1960, 1961, 1965, 1966, 1967, 1968, 1969, 1972, 1973, 1974, 1975, 1977, 1984, 1987, 1990, 1992, 1994, 1996, 1997, 1998, 2003, 2004, 2006, 2008, 2009, 2011, 2014, 2018, 2019", "estadual"),

    # Atlético Mineiro
    ("Atlético Mineiro", "Copa Libertadores da América", "libertadores", 1, "2013", "libertadores"),
    ("Atlético Mineiro", "Campeonato Brasileiro", "brasileirao", 3, "1937, 1971, 2021", "brasileirao"),
    ("Atlético Mineiro", "Copa do Brasil", "copa_brasil", 2, "2014, 2021", "copa_brasil"),
    ("Atlético Mineiro", "Campeonato Mineiro", "estadual", 49, "1915, 1926, 1927, 1931, 1932, 1936, 1938, 1939, 1941, 1942, 1946, 1947, 1949, 1950, 1952, 1953, 1954, 1955, 1956, 1958, 1962, 1963, 1970, 1976, 1978, 1979, 1980, 1981, 1982, 1983, 1985, 1986, 1988, 1989, 1991, 1995, 1999, 2000, 2007, 2010, 2012, 2013, 2015, 2017, 2020, 2021, 2022, 2023, 2024", "estadual"),

    # Vasco da Gama
    ("Vasco", "Torneio dos Campeões Sul-Americanos (Libertadores)", "libertadores", 1, "1948", "libertadores"),
    ("Vasco", "Copa Libertadores da América", "libertadores", 1, "1998", "libertadores"),
    ("Vasco", "Campeonato Brasileiro", "brasileirao", 4, "1974, 1989, 1997, 2000", "brasileirao"),
    ("Vasco", "Copa do Brasil", "copa_brasil", 1, "2011", "copa_brasil"),
    ("Vasco", "Campeonato Carioca", "estadual", 24, "1923, 1924, 1929, 1934, 1936, 1945, 1947, 1949, 1950, 1952, 1956, 1958, 1970, 1977, 1982, 1987, 1988, 1992, 1993, 1994, 1998, 2003, 2015, 2016", "estadual"),

    # Botafogo
    ("Botafogo", "Copa Libertadores da América", "libertadores", 1, "2024", "libertadores"),
    ("Botafogo", "Campeonato Brasileiro", "brasileirao", 3, "1968, 1995, 2024", "brasileirao"),
    ("Botafogo", "Copa Conmebol", "libertadores", 1, "1993", "libertadores"),
    ("Botafogo", "Campeonato Carioca", "estadual", 21, "1907, 1910, 1912, 1930, 1932, 1933, 1934, 1935, 1948, 1957, 1961, 1962, 1967, 1968, 1989, 1990, 1997, 2006, 2010, 2013, 2018", "estadual"),

    # Fluminense
    ("Fluminense", "Copa Libertadores da América", "libertadores", 1, "2023", "libertadores"),
    ("Fluminense", "Campeonato Brasileiro", "brasileirao", 4, "1970, 1984, 2010, 2012", "brasileirao"),
    ("Fluminense", "Copa do Brasil", "copa_brasil", 1, "2007", "copa_brasil"),
    ("Fluminense", "Recopa Sul-Americana", "libertadores", 1, "2024", "libertadores"),
    ("Fluminense", "Campeonato Carioca", "estadual", 33, "1906, 1907, 1908, 1909, 1911, 1917, 1918, 1919, 1924, 1936, 1937, 1938, 1940, 1941, 1946, 1951, 1959, 1964, 1969, 1971, 1973, 1975, 1976, 1980, 1983, 1984, 1985, 1995, 2002, 2005, 2012, 2022, 2023", "estadual"),

    # Athletico Paranaense
    ("Athletico Paranaense", "Copa Sul-Americana", "libertadores", 2, "2018, 2021", "libertadores"),
    ("Athletico Paranaense", "Campeonato Brasileiro", "brasileirao", 1, "2001", "brasileirao"),
    ("Athletico Paranaense", "Copa do Brasil", "copa_brasil", 1, "2019", "copa_brasil"),
    ("Athletico Paranaense", "Campeonato Paranaense", "estadual", 28, "1925, 1929, 1930, 1934, 1936, 1940, 1943, 1945, 1949, 1958, 1970, 1982, 1983, 1985, 1988, 1990, 1998, 2000, 2001, 2002, 2005, 2009, 2016, 2018, 2019, 2020, 2023, 2024", "estadual"),

    # Bahia
    ("Bahia", "Campeonato Brasileiro (Taça Brasil / Brasileirão)", "brasileirao", 2, "1959, 1988", "brasileirao"),
    ("Bahia", "Copa do Nordeste", "copa_brasil", 4, "2001, 2002, 2017, 2021", "copa_brasil"),
    ("Bahia", "Campeonato Baiano", "estadual", 50, "1931, 1933, 1934, 1936, 1938, 1940, 1944, 1945, 1947, 1948, 1949, 1950, 1952, 1954, 1956, 1958, 1959, 1960, 1961, 1962, 1967, 1970, 1971, 1973, 1974, 1975, 1976, 1977, 1978, 1979, 1981, 1982, 1983, 1984, 1986, 1987, 1988, 1991, 1993, 1994, 1998, 1999, 2001, 2012, 2014, 2015, 2018, 2019, 2020, 2023", "estadual"),

    # Fortaleza
    ("Fortaleza", "Copa do Nordeste", "copa_brasil", 3, "2019, 2022, 2024", "copa_brasil"),
    ("Fortaleza", "Campeonato Brasileiro Série B", "brasileirao", 1, "2018", "brasileirao"),
    ("Fortaleza", "Campeonato Cearense", "estadual", 46, "1920, 1921, 1923, 1924, 1926, 1927, 1928, 1933, 1934, 1937, 1938, 1946, 1947, 1949, 1953, 1954, 1959, 1960, 1964, 1965, 1967, 1969, 1973, 1974, 1982, 1983, 1985, 1987, 1991, 1992, 2000, 2001, 2003, 2004, 2005, 2007, 2008, 2009, 2010, 2015, 2016, 2019, 2020, 2021, 2022, 2023", "estadual")
]

# 2. Histórico de Evolução de Valor de Mercado
# (Atleta, Data, Ano, Clube, Idade, Valor EUR, Valor BRL, Pico)
TAXA_EUR_BRL = 6.10

HISTORICO_MERCADO = [
    # Neymar
    ("Neymar", "2009-03-01", 2009, "Santos", 17, 1_000_000, 1_000_000 * TAXA_EUR_BRL, 0),
    ("Neymar", "2011-06-01", 2011, "Santos", 19, 30_000_000, 30_000_000 * TAXA_EUR_BRL, 0),
    ("Neymar", "2013-05-01", 2013, "Barcelona", 21, 50_000_000, 50_000_000 * TAXA_EUR_BRL, 0),
    ("Neymar", "2015-06-01", 2015, "Barcelona", 23, 100_000_000, 100_000_000 * TAXA_EUR_BRL, 0),
    ("Neymar", "2018-01-01", 2018, "Paris Saint-Germain", 26, 180_000_000, 180_000_000 * TAXA_EUR_BRL, 1),
    ("Neymar", "2021-06-01", 2021, "Paris Saint-Germain", 29, 100_000_000, 100_000_000 * TAXA_EUR_BRL, 0),
    ("Neymar", "2023-08-01", 2023, "Al-Hilal", 31, 60_000_000, 60_000_000 * TAXA_EUR_BRL, 0),
    ("Neymar", "2026-01-01", 2026, "Santos", 34, 15_000_000, 15_000_000 * TAXA_EUR_BRL, 0),

    # Vinicius Júnior
    ("Vinicius Júnior", "2017-05-01", 2017, "Flamengo", 16, 10_000_000, 10_000_000 * TAXA_EUR_BRL, 0),
    ("Vinicius Júnior", "2018-07-01", 2018, "Real Madrid", 18, 35_000_000, 35_000_000 * TAXA_EUR_BRL, 0),
    ("Vinicius Júnior", "2020-01-01", 2020, "Real Madrid", 19, 50_000_000, 50_000_000 * TAXA_EUR_BRL, 0),
    ("Vinicius Júnior", "2022-06-01", 2022, "Real Madrid", 21, 100_000_000, 100_000_000 * TAXA_EUR_BRL, 0),
    ("Vinicius Júnior", "2024-10-01", 2024, "Real Madrid", 24, 200_000_000, 200_000_000 * TAXA_EUR_BRL, 1),
    ("Vinicius Júnior", "2026-01-01", 2026, "Real Madrid", 25, 200_000_000, 200_000_000 * TAXA_EUR_BRL, 1),

    # Endrick
    ("Endrick", "2022-10-01", 2022, "Palmeiras", 16, 15_000_000, 15_000_000 * TAXA_EUR_BRL, 0),
    ("Endrick", "2023-06-01", 2023, "Palmeiras", 16, 25_000_000, 25_000_000 * TAXA_EUR_BRL, 0),
    ("Endrick", "2023-12-01", 2023, "Palmeiras", 17, 45_000_000, 45_000_000 * TAXA_EUR_BRL, 0),
    ("Endrick", "2024-07-01", 2024, "Real Madrid", 18, 60_000_000, 60_000_000 * TAXA_EUR_BRL, 1),
    ("Endrick", "2026-01-01", 2026, "Real Madrid", 19, 75_000_000, 75_000_000 * TAXA_EUR_BRL, 1),

    # Estêvão
    ("Estêvão", "2023-12-01", 2023, "Palmeiras", 16, 10_000_000, 10_000_000 * TAXA_EUR_BRL, 0),
    ("Estêvão", "2024-06-01", 2024, "Palmeiras", 17, 30_000_000, 30_000_000 * TAXA_EUR_BRL, 0),
    ("Estêvão", "2024-11-01", 2024, "Palmeiras", 17, 45_000_000, 45_000_000 * TAXA_EUR_BRL, 0),
    ("Estêvão", "2025-07-01", 2025, "Chelsea", 18, 55_000_000, 55_000_000 * TAXA_EUR_BRL, 1),
    ("Estêvão", "2026-01-01", 2026, "Chelsea", 18, 60_000_000, 60_000_000 * TAXA_EUR_BRL, 1),

    # Gabriel Barbosa (Gabigol)
    ("Gabriel Barbosa", "2013-05-01", 2013, "Santos", 16, 2_000_000, 2_000_000 * TAXA_EUR_BRL, 0),
    ("Gabriel Barbosa", "2016-08-01", 2016, "Internazionale", 19, 30_000_000, 30_000_000 * TAXA_EUR_BRL, 1),
    ("Gabriel Barbosa", "2018-01-01", 2018, "Santos", 21, 10_000_000, 10_000_000 * TAXA_EUR_BRL, 0),
    ("Gabriel Barbosa", "2019-12-01", 2019, "Flamengo", 23, 23_000_000, 23_000_000 * TAXA_EUR_BRL, 0),
    ("Gabriel Barbosa", "2021-06-01", 2021, "Flamengo", 24, 26_000_000, 26_000_000 * TAXA_EUR_BRL, 0),
    ("Gabriel Barbosa", "2024-11-01", 2024, "Flamengo", 28, 8_000_000, 8_000_000 * TAXA_EUR_BRL, 0),
    ("Gabriel Barbosa", "2026-01-01", 2026, "Santos", 29, 7_500_000, 7_500_000 * TAXA_EUR_BRL, 0),

    # Pedro
    ("Pedro", "2018-06-01", 2018, "Fluminense", 20, 5_000_000, 5_000_000 * TAXA_EUR_BRL, 0),
    ("Pedro", "2019-09-01", 2019, "Fiorentina", 22, 15_000_000, 15_000_000 * TAXA_EUR_BRL, 0),
    ("Pedro", "2020-01-01", 2020, "Flamengo", 22, 12_000_000, 12_000_000 * TAXA_EUR_BRL, 0),
    ("Pedro", "2022-11-01", 2022, "Flamengo", 25, 20_000_000, 20_000_000 * TAXA_EUR_BRL, 0),
    ("Pedro", "2024-06-01", 2024, "Flamengo", 26, 23_000_000, 23_000_000 * TAXA_EUR_BRL, 1),
    ("Pedro", "2026-01-01", 2026, "Flamengo", 28, 22_000_000, 22_000_000 * TAXA_EUR_BRL, 0),

    # Giorgian De Arrascaeta
    ("Giorgian De Arrascaeta", "2015-01-01", 2015, "Cruzeiro", 20, 4_000_000, 4_000_000 * TAXA_EUR_BRL, 0),
    ("Giorgian De Arrascaeta", "2018-12-01", 2018, "Cruzeiro", 24, 13_000_000, 13_000_000 * TAXA_EUR_BRL, 0),
    ("Giorgian De Arrascaeta", "2019-12-01", 2019, "Flamengo", 25, 19_000_000, 19_000_000 * TAXA_EUR_BRL, 1),
    ("Giorgian De Arrascaeta", "2022-06-01", 2022, "Flamengo", 28, 17_000_000, 17_000_000 * TAXA_EUR_BRL, 0),
    ("Giorgian De Arrascaeta", "2024-06-01", 2024, "Flamengo", 30, 15_000_000, 15_000_000 * TAXA_EUR_BRL, 0),
    ("Giorgian De Arrascaeta", "2026-01-01", 2026, "Flamengo", 31, 12_000_000, 12_000_000 * TAXA_EUR_BRL, 0),

    # Kevin Viveros (Artilheiro Brasileirão 2026)
    ("Kevin Viveros", "2021-01-01", 2021, "Carabobo", 20, 250_000, 250_000 * TAXA_EUR_BRL, 0),
    ("Kevin Viveros", "2023-01-01", 2023, "Deportivo Cali", 22, 800_000, 800_000 * TAXA_EUR_BRL, 0),
    ("Kevin Viveros", "2024-06-01", 2024, "La Equidad", 24, 1_500_000, 1_500_000 * TAXA_EUR_BRL, 0),
    ("Kevin Viveros", "2025-01-01", 2025, "Athletico Paranaense", 24, 4_000_000, 4_000_000 * TAXA_EUR_BRL, 0),
    ("Kevin Viveros", "2026-01-01", 2026, "Athletico Paranaense", 25, 12_000_000, 12_000_000 * TAXA_EUR_BRL, 1)
]

def popular():
    print("=== POPULANDO VITRINE DE TROFÉUS E HISTÓRICO DE VALOR DE MERCADO ===")
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()

    # 1. Inserir Troféus
    count_trofeus = 0
    for t in TROFEUS_CLUBES:
        clube, torneio, tipo_trofeu, qtd, anos, modelo = t
        c.execute("""
            INSERT INTO clubes_trofeus_vitrine (
                clube, torneio, tipo_trofeu, quantidade, anos_conquistados, modelo_3d_tipo, atualizado_em
            ) VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
            ON CONFLICT(clube, torneio) DO UPDATE SET
                tipo_trofeu = excluded.tipo_trofeu,
                quantidade = excluded.quantidade,
                anos_conquistados = excluded.anos_conquistados,
                modelo_3d_tipo = excluded.modelo_3d_tipo,
                atualizado_em = CURRENT_TIMESTAMP
        """, (clube, torneio, tipo_trofeu, qtd, anos, modelo))
        count_trofeus += 1

    print(f"[SUCESSO] {count_trofeus} troféus oficiais inseridos em clubes_trofeus_vitrine.")

    # 2. Inserir Histórico de Mercado
    count_mercado = 0
    c.execute("DELETE FROM historico_valor_mercado") # Reset limpo
    for m in HISTORICO_MERCADO:
        atleta, data_reg, ano, clube, idade, eur, brl, pico = m
        c.execute("""
            INSERT INTO historico_valor_mercado (
                atleta, data_registro, ano, clube_na_epoca, idade_na_epoca,
                valor_eur, valor_brl, pico_historico, atualizado_em
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
        """, (atleta, data_reg, ano, clube, idade, eur, brl, pico))
        count_mercado += 1

    conn.commit()
    conn.execute("PRAGMA journal_mode = DELETE;")
    conn.commit()
    conn.close()
    print(f"[SUCESSO] {count_mercado} pontos de histórico financeiro gravados em historico_valor_mercado.")

if __name__ == "__main__":
    popular()
