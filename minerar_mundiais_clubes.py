"""
Minerador Oficial dos Jogos de Clubes Brasileiros em Mundiais de Clubes da FIFA e Copa Intercontinental (1960 a 2024)
Registra com exatidão histórica:
- Data, Estádio, Cidade, País
- Mandante, Visitante, Placar, Vencedor
- Fase (Fase de Grupos, Semifinal, Decisão do 3º Lugar, Final)
- Gols detalhados com Atletas e Minutos
- Árbitro e Auxiliares
"""

import os
import sqlite3

BASE_DIR = os.path.dirname(__file__)
DB_PATH = os.path.join(BASE_DIR, "data", "futebol.db")

MUNDIAIS_JOGOS = [
    # 1962: Santos Bi-Intercontinental vs Benfica
    {
        "ano": 1962, "data": "1962-09-19", "campeonato": "Copa Intercontinental", "fase": "Final (Ida)",
        "estadio": "Maracanã", "cidade": "Rio de Janeiro", "estado": "GB",
        "mandante": "Santos", "visitante": "Benfica", "gols_man": 3, "gols_vis": 2, "placar": "3x2", "vencedor": "Santos",
        "arbitro": "Rubén Cabrera (Paraguai)", "publico": 85000,
        "gols": [
            ("Santos", "Pelé", "31", "Normal"), ("Benfica", "Santana", "58", "Normal"),
            ("Santos", "Coutinho", "64", "Normal"), ("Santos", "Pelé", "85", "Normal"),
            ("Benfica", "Santana", "87", "Normal")
        ]
    },
    {
        "ano": 1962, "data": "1962-10-11", "campeonato": "Copa Intercontinental", "fase": "Final (Volta)",
        "estadio": "Estádio da Luz", "cidade": "Lisboa", "estado": "Portugal",
        "mandante": "Benfica", "visitante": "Santos", "gols_man": 2, "gols_vis": 5, "placar": "2x5", "vencedor": "Santos",
        "arbitro": "Pierre Schwinte (França)", "publico": 73000,
        "gols": [
            ("Santos", "Pelé", "15", "Normal"), ("Santos", "Pelé", "25", "Normal"),
            ("Santos", "Coutinho", "48", "Normal"), ("Santos", "Pelé", "64", "Normal"),
            ("Santos", "Pepe", "77", "Normal"), ("Benfica", "Eusébio", "85", "Normal"),
            ("Benfica", "Santana", "89", "Normal")
        ]
    },

    # 1963: Santos Bi-Intercontinental vs Milan
    {
        "ano": 1963, "data": "1963-10-16", "campeonato": "Copa Intercontinental", "fase": "Final (Ida)",
        "estadio": "San Siro", "cidade": "Milão", "estado": "Itália",
        "mandante": "Milan", "visitante": "Santos", "gols_man": 4, "gols_vis": 2, "placar": "4x2", "vencedor": "Milan",
        "arbitro": "Alfred Haberfellner (Áustria)", "publico": 50000,
        "gols": [
            ("Milan", "Trapattoni", "3", "Normal"), ("Santos", "Pelé", "55", "Normal"),
            ("Milan", "Amarildo", "58", "Normal"), ("Milan", "Amarildo", "67", "Normal"),
            ("Santos", "Pelé", "84", "Pênalti"), ("Milan", "Mora", "82", "Normal")
        ]
    },
    {
        "ano": 1963, "data": "1963-11-14", "campeonato": "Copa Intercontinental", "fase": "Final (Volta)",
        "estadio": "Maracanã", "cidade": "Rio de Janeiro", "estado": "GB",
        "mandante": "Santos", "visitante": "Milan", "gols_man": 4, "gols_vis": 2, "placar": "4x2", "vencedor": "Santos",
        "arbitro": "Juan Regis Brozzi (Argentina)", "publico": 132728,
        "gols": [
            ("Milan", "Mazzola", "12", "Normal"), ("Milan", "Mora", "17", "Normal"),
            ("Santos", "Pepe", "50", "Falta"), ("Santos", "Almir Pernambuquinho", "54", "Normal"),
            ("Santos", "Lima", "65", "Normal"), ("Santos", "Pepe", "68", "Falta")
        ]
    },
    {
        "ano": 1963, "data": "1963-11-16", "campeonato": "Copa Intercontinental", "fase": "Final (Desempate)",
        "estadio": "Maracanã", "cidade": "Rio de Janeiro", "estado": "GB",
        "mandante": "Santos", "visitante": "Milan", "gols_man": 1, "gols_vis": 0, "placar": "1x0", "vencedor": "Santos",
        "arbitro": "Juan Regis Brozzi (Argentina)", "publico": 120421,
        "gols": [
            ("Santos", "Dalmo", "31", "Pênalti")
        ]
    },

    # 1976: Cruzeiro vs Bayern de Munique
    {
        "ano": 1976, "data": "1976-11-23", "campeonato": "Copa Intercontinental", "fase": "Final (Ida)",
        "estadio": "Olympiastadion", "cidade": "Munique", "estado": "Alemanha",
        "mandante": "Bayern de Munique", "visitante": "Cruzeiro", "gols_man": 2, "gols_vis": 0, "placar": "2x0", "vencedor": "Bayern de Munique",
        "arbitro": "Alberto Martínez (Chile)", "publico": 22000,
        "gols": [
            ("Bayern de Munique", "Gerd Müller", "80", "Normal"), ("Bayern de Munique", "Kapplmann", "82", "Normal")
        ]
    },
    {
        "ano": 1976, "data": "1976-12-21", "campeonato": "Copa Intercontinental", "fase": "Final (Volta)",
        "estadio": "Mineirão", "cidade": "Belo Horizonte", "estado": "MG",
        "mandante": "Cruzeiro", "visitante": "Bayern de Munique", "gols_man": 0, "gols_vis": 0, "placar": "0x0", "vencedor": "Empate",
        "arbitro": "Patrick Partridge (Inglaterra)", "publico": 123715,
        "gols": []
    },

    # 1981: Flamengo Campeão do Mundo vs Liverpool
    {
        "ano": 1981, "data": "1981-12-13", "campeonato": "Copa Intercontinental", "fase": "Final",
        "estadio": "National Stadium", "cidade": "Tóquio", "estado": "Japão",
        "mandante": "Flamengo", "visitante": "Liverpool", "gols_man": 3, "gols_vis": 0, "placar": "3x0", "vencedor": "Flamengo",
        "arbitro": "Rubio Vázquez (México)", "publico": 62000,
        "gols": [
            ("Flamengo", "Nunes", "12", "Normal"), ("Flamengo", "Adílio", "34", "Normal"),
            ("Flamengo", "Nunes", "41", "Normal")
        ]
    },

    # 1983: Grêmio Campeão do Mundo vs Hamburgo
    {
        "ano": 1983, "data": "1983-12-11", "campeonato": "Copa Intercontinental", "fase": "Final",
        "estadio": "National Stadium", "cidade": "Tóquio", "estado": "Japão",
        "mandante": "Grêmio", "visitante": "Hamburgo", "gols_man": 2, "gols_vis": 1, "placar": "2x1", "vencedor": "Grêmio",
        "arbitro": "Michel Vautrot (França)", "publico": 62000,
        "gols": [
            ("Grêmio", "Renato Gaúcho", "37", "Normal"), ("Hamburgo", "Schröder", "85", "Normal"),
            ("Grêmio", "Renato Gaúcho", "93", "Normal")
        ]
    },

    # 1992: São Paulo Campeão do Mundo vs Barcelona
    {
        "ano": 1992, "data": "1992-12-13", "campeonato": "Copa Intercontinental", "fase": "Final",
        "estadio": "National Stadium", "cidade": "Tóquio", "estado": "Japão",
        "mandante": "São Paulo", "visitante": "Barcelona", "gols_man": 2, "gols_vis": 1, "placar": "2x1", "vencedor": "São Paulo",
        "arbitro": "Juan Carlos Loustau (Argentina)", "publico": 60000,
        "gols": [
            ("Barcelona", "Stoichkov", "12", "Normal"), ("São Paulo", "Raí", "27", "Normal"),
            ("São Paulo", "Raí", "79", "Falta")
        ]
    },

    # 1993: São Paulo Bi-Campeão do Mundo vs Milan
    {
        "ano": 1993, "data": "1993-12-12", "campeonato": "Copa Intercontinental", "fase": "Final",
        "estadio": "National Stadium", "cidade": "Tóquio", "estado": "Japão",
        "mandante": "São Paulo", "visitante": "Milan", "gols_man": 3, "gols_vis": 2, "placar": "3x2", "vencedor": "São Paulo",
        "arbitro": "Joël Quiniou (França)", "publico": 52275,
        "gols": [
            ("São Paulo", "Palhinha", "19", "Normal"), ("Milan", "Massaro", "48", "Normal"),
            ("São Paulo", "Toninho Cerezo", "59", "Normal"), ("Milan", "Papin", "81", "Normal"),
            ("São Paulo", "Müller", "88", "Normal")
        ]
    },

    # 1995: Grêmio vs Ajax
    {
        "ano": 1995, "data": "1995-11-28", "campeonato": "Copa Intercontinental", "fase": "Final",
        "estadio": "National Stadium", "cidade": "Tóquio", "estado": "Japão",
        "mandante": "Ajax", "visitante": "Grêmio", "gols_man": 0, "gols_vis": 0, "placar": "0x0", "vencedor": "Empate",
        "arbitro": "David Elleray (Inglaterra)", "publico": 47129,
        "gols": []
    },

    # 1997: Cruzeiro vs Borussia Dortmund
    {
        "ano": 1997, "data": "1997-12-02", "campeonato": "Copa Intercontinental", "fase": "Final",
        "estadio": "National Stadium", "cidade": "Tóquio", "estado": "Japão",
        "mandante": "Borussia Dortmund", "visitante": "Cruzeiro", "gols_man": 2, "gols_vis": 0, "placar": "2x0", "vencedor": "Borussia Dortmund",
        "arbitro": "Masayoshi Okada (Japão)", "publico": 46953,
        "gols": [
            ("Borussia Dortmund", "Zorc", "34", "Normal"), ("Borussia Dortmund", "Herrlich", "85", "Normal")
        ]
    },

    # 1998: Vasco da Gama vs Real Madrid
    {
        "ano": 1998, "data": "1998-12-01", "campeonato": "Copa Intercontinental", "fase": "Final",
        "estadio": "National Stadium", "cidade": "Tóquio", "estado": "Japão",
        "mandante": "Real Madrid", "visitante": "Vasco", "gols_man": 2, "gols_vis": 1, "placar": "2x1", "vencedor": "Real Madrid",
        "arbitro": "Mario Sánchez (Chile)", "publico": 51514,
        "gols": [
            ("Real Madrid", "Nasa", "25", "Contra"), ("Vasco", "Juninho Pernambucano", "56", "Normal"),
            ("Real Madrid", "Raúl", "83", "Normal")
        ]
    },

    # 1999: Palmeiras vs Manchester United
    {
        "ano": 1999, "data": "1999-11-30", "campeonato": "Copa Intercontinental", "fase": "Final",
        "estadio": "National Stadium", "cidade": "Tóquio", "estado": "Japão",
        "mandante": "Manchester United", "visitante": "Palmeiras", "gols_man": 1, "gols_vis": 0, "placar": "1x0", "vencedor": "Manchester United",
        "arbitro": "Hellmut Krug (Alemanha)", "publico": 53372,
        "gols": [
            ("Manchester United", "Roy Keane", "35", "Normal")
        ]
    },

    # 2000: Mundial de Clubes da FIFA (Brasil)
    {
        "ano": 2000, "data": "2000-01-05", "campeonato": "Copa do Mundo de Clubes da FIFA", "fase": "Fase de Grupos",
        "estadio": "Morumbi", "cidade": "São Paulo", "estado": "SP",
        "mandante": "Corinthians", "visitante": "Raja Casablanca", "gols_man": 2, "gols_vis": 0, "placar": "2x0", "vencedor": "Corinthians",
        "arbitro": "Stefano Braschi (Itália)", "publico": 40000,
        "gols": [("Corinthians", "Luizão", "49", "Normal"), ("Corinthians", "Fábio Luciano", "64", "Normal")]
    },
    {
        "ano": 2000, "data": "2000-01-06", "campeonato": "Copa do Mundo de Clubes da FIFA", "fase": "Fase de Grupos",
        "estadio": "Maracanã", "cidade": "Rio de Janeiro", "estado": "RJ",
        "mandante": "Vasco", "visitante": "South Melbourne", "gols_man": 2, "gols_vis": 0, "placar": "2x0", "vencedor": "Vasco",
        "arbitro": "Dick Jol (Holanda)", "publico": 66000,
        "gols": [("Vasco", "Felipe", "53", "Normal"), ("Vasco", "Edmundo", "86", "Normal")]
    },
    {
        "ano": 2000, "data": "2000-01-07", "campeonato": "Copa do Mundo de Clubes da FIFA", "fase": "Fase de Grupos",
        "estadio": "Morumbi", "cidade": "São Paulo", "estado": "SP",
        "mandante": "Real Madrid", "visitante": "Corinthians", "gols_man": 2, "gols_vis": 2, "placar": "2x2", "vencedor": "Empate",
        "arbitro": "William Mattus (Costa Rica)", "publico": 55000,
        "gols": [
            ("Real Madrid", "Anelka", "19", "Normal"), ("Corinthians", "Edílson", "28", "Normal"),
            ("Corinthians", "Edílson", "64", "Normal"), ("Real Madrid", "Anelka", "71", "Normal")
        ]
    },
    {
        "ano": 2000, "data": "2000-01-08", "campeonato": "Copa do Mundo de Clubes da FIFA", "fase": "Fase de Grupos",
        "estadio": "Maracanã", "cidade": "Rio de Janeiro", "estado": "RJ",
        "mandante": "Manchester United", "visitante": "Vasco", "gols_man": 1, "gols_vis": 3, "placar": "1x3", "vencedor": "Vasco",
        "arbitro": "Saad Mane (Kuwait)", "publico": 73000,
        "gols": [
            ("Vasco", "Romário", "24", "Normal"), ("Vasco", "Romário", "26", "Normal"),
            ("Vasco", "Edmundo", "43", "Normal"), ("Manchester United", "Nicky Butt", "81", "Normal")
        ]
    },
    {
        "ano": 2000, "data": "2000-01-10", "campeonato": "Copa do Mundo de Clubes da FIFA", "fase": "Fase de Grupos",
        "estadio": "Morumbi", "cidade": "São Paulo", "estado": "SP",
        "mandante": "Corinthians", "visitante": "Al-Nassr", "gols_man": 2, "gols_vis": 0, "placar": "2x0", "vencedor": "Corinthians",
        "arbitro": "Óscar Ruiz (Colômbia)", "publico": 31000,
        "gols": [("Corinthians", "Ricardinho", "24", "Normal"), ("Corinthians", "Rincón", "67", "Normal")]
    },
    {
        "ano": 2000, "data": "2000-01-11", "campeonato": "Copa do Mundo de Clubes da FIFA", "fase": "Fase de Grupos",
        "estadio": "Maracanã", "cidade": "Rio de Janeiro", "estado": "RJ",
        "mandante": "Vasco", "visitante": "Necaxa", "gols_man": 2, "gols_vis": 1, "placar": "2x1", "vencedor": "Vasco",
        "arbitro": "Vincent Mauro (EUA)", "publico": 45000,
        "gols": [("Necaxa", "Montecinos", "5", "Normal"), ("Vasco", "Odvan", "14", "Normal"), ("Vasco", "Romário", "69", "Normal")]
    },
    {
        "ano": 2000, "data": "2000-01-14", "campeonato": "Copa do Mundo de Clubes da FIFA", "fase": "Final",
        "estadio": "Maracanã", "cidade": "Rio de Janeiro", "estado": "RJ",
        "mandante": "Corinthians", "visitante": "Vasco", "gols_man": 0, "gols_vis": 0, "placar": "0x0", "vencedor": "Empate",
        "arbitro": "Dick Jol (Holanda)", "publico": 73000,
        "gols": [] # Decidido nos pênaltis: Corinthians 4x3 Vasco
    },

    # 2005: São Paulo Tri-Mundial
    {
        "ano": 2005, "data": "2005-12-14", "campeonato": "Copa do Mundo de Clubes da FIFA", "fase": "Semifinal",
        "estadio": "National Stadium", "cidade": "Tóquio", "estado": "Japão",
        "mandante": "Al-Ittihad", "visitante": "São Paulo", "gols_man": 2, "gols_vis": 3, "placar": "2x3", "vencedor": "São Paulo",
        "arbitro": "Alain Sars (França)", "publico": 31510,
        "gols": [
            ("São Paulo", "Amoroso", "16", "Normal"), ("Al-Ittihad", "Noor", "33", "Normal"),
            ("São Paulo", "Amoroso", "47", "Normal"), ("São Paulo", "Rogério Ceni", "57", "Pênalti"),
            ("Al-Ittihad", "Al-Montashari", "68", "Normal")
        ]
    },
    {
        "ano": 2005, "data": "2005-12-18", "campeonato": "Copa do Mundo de Clubes da FIFA", "fase": "Final",
        "estadio": "International Stadium", "cidade": "Yokohama", "estado": "Japão",
        "mandante": "São Paulo", "visitante": "Liverpool", "gols_man": 1, "gols_vis": 0, "placar": "1x0", "vencedor": "São Paulo",
        "arbitro": "Benito Archundia (México)", "publico": 66821,
        "gols": [("São Paulo", "Mineiro", "27", "Normal")]
    },

    # 2006: Internacional Campeão do Mundo
    {
        "ano": 2006, "data": "2006-12-13", "campeonato": "Copa do Mundo de Clubes da FIFA", "fase": "Semifinal",
        "estadio": "National Stadium", "cidade": "Tóquio", "estado": "Japão",
        "mandante": "Al-Ahly", "visitante": "Internacional", "gols_man": 1, "gols_vis": 2, "placar": "1x2", "vencedor": "Internacional",
        "arbitro": "Subkhiddin Mohd Salleh (Malásia)", "publico": 33690,
        "gols": [("Internacional", "Alexandre Pato", "23", "Normal"), ("Al-Ahly", "Flávio", "54", "Normal"), ("Internacional", "Luiz Adriano", "72", "Normal")]
    },
    {
        "ano": 2006, "data": "2006-12-17", "campeonato": "Copa do Mundo de Clubes da FIFA", "fase": "Final",
        "estadio": "International Stadium", "cidade": "Yokohama", "estado": "Japão",
        "mandante": "Internacional", "visitante": "Barcelona", "gols_man": 1, "gols_vis": 0, "placar": "1x0", "vencedor": "Internacional",
        "arbitro": "Carlos Batres (Guatemala)", "publico": 67128,
        "gols": [("Internacional", "Adriano Gabiru", "82", "Normal")]
    },

    # 2010: Internacional no Mundial
    {
        "ano": 2010, "data": "2010-12-14", "campeonato": "Copa do Mundo de Clubes da FIFA", "fase": "Semifinal",
        "estadio": "Mohammed bin Zayed Stadium", "cidade": "Abu Dhabi", "estado": "Emirados Árabes",
        "mandante": "TP Mazembe", "visitante": "Internacional", "gols_man": 2, "gols_vis": 0, "placar": "2x0", "vencedor": "TP Mazembe",
        "arbitro": "Björn Kuipers (Holanda)", "publico": 22131,
        "gols": [("TP Mazembe", "Kabangu", "53", "Normal"), ("TP Mazembe", "Kaluyituka", "85", "Normal")]
    },
    {
        "ano": 2010, "data": "2010-12-18", "campeonato": "Copa do Mundo de Clubes da FIFA", "fase": "Disputa do 3º Lugar",
        "estadio": "Zayed Sports City Stadium", "cidade": "Abu Dhabi", "estado": "Emirados Árabes",
        "mandante": "Internacional", "visitante": "Seongnam Ilhwa Chunma", "gols_man": 4, "gols_vis": 2, "placar": "4x2", "vencedor": "Internacional",
        "arbitro": "Michael Hester (Nova Zelândia)", "publico": 16563,
        "gols": [
            ("Internacional", "Tinga", "15", "Normal"), ("Internacional", "Alecsandro", "27", "Normal"),
            ("Internacional", "D'Alessandro", "52", "Normal"), ("Internacional", "Alecsandro", "71", "Normal"),
            ("Seongnam Ilhwa Chunma", "Molina", "84", "Normal"), ("Seongnam Ilhwa Chunma", "Molina", "90+3", "Normal")
        ]
    },

    # 2011: Santos no Mundial
    {
        "ano": 2011, "data": "2011-12-14", "campeonato": "Copa do Mundo de Clubes da FIFA", "fase": "Semifinal",
        "estadio": "Toyota Stadium", "cidade": "Toyota", "estado": "Japão",
        "mandante": "Kashiwa Reysol", "visitante": "Santos", "gols_man": 1, "gols_vis": 3, "placar": "1x3", "vencedor": "Santos",
        "arbitro": "Nicola Rizzoli (Itália)", "publico": 29173,
        "gols": [
            ("Santos", "Neymar", "19", "Normal"), ("Santos", "Borges", "24", "Normal"),
            ("Kashiwa Reysol", "Sakai", "54", "Normal"), ("Santos", "Danilo", "63", "Falta")
        ]
    },
    {
        "ano": 2011, "data": "2011-12-18", "campeonato": "Copa do Mundo de Clubes da FIFA", "fase": "Final",
        "estadio": "International Stadium", "cidade": "Yokohama", "estado": "Japão",
        "mandante": "Santos", "visitante": "Barcelona", "gols_man": 0, "gols_vis": 4, "placar": "0x4", "vencedor": "Barcelona",
        "arbitro": "Ravshan Irmatov (Uzbequistão)", "publico": 68166,
        "gols": [
            ("Barcelona", "Messi", "17", "Normal"), ("Barcelona", "Xavi", "24", "Normal"),
            ("Barcelona", "Fàbregas", "45", "Normal"), ("Barcelona", "Messi", "82", "Normal")
        ]
    },

    # 2012: Corinthians Bi-Campeão da FIFA
    {
        "ano": 2012, "data": "2012-12-12", "campeonato": "Copa do Mundo de Clubes da FIFA", "fase": "Semifinal",
        "estadio": "Toyota Stadium", "cidade": "Toyota", "estado": "Japão",
        "mandante": "Al-Ahly", "visitante": "Corinthians", "gols_man": 0, "gols_vis": 1, "placar": "0x1", "vencedor": "Corinthians",
        "arbitro": "Peter O'Leary (Nova Zelândia)", "publico": 31417,
        "gols": [("Corinthians", "Paolo Guerrero", "30", "Normal")]
    },
    {
        "ano": 2012, "data": "2012-12-16", "campeonato": "Copa do Mundo de Clubes da FIFA", "fase": "Final",
        "estadio": "International Stadium", "cidade": "Yokohama", "estado": "Japão",
        "mandante": "Corinthians", "visitante": "Chelsea", "gols_man": 1, "gols_vis": 0, "placar": "1x0", "vencedor": "Corinthians",
        "arbitro": "Cüneyt Çakır (Turquia)", "publico": 68275,
        "gols": [("Corinthians", "Paolo Guerrero", "69", "Normal")]
    },

    # 2013: Atlético-MG no Mundial
    {
        "ano": 2013, "data": "2013-12-18", "campeonato": "Copa do Mundo de Clubes da FIFA", "fase": "Semifinal",
        "estadio": "Stade de Marrakech", "cidade": "Marrakech", "estado": "Marrocos",
        "mandante": "Raja Casablanca", "visitante": "Atlético-MG", "gols_man": 3, "gols_vis": 1, "placar": "3x1", "vencedor": "Raja Casablanca",
        "arbitro": "Carlos Velasco Carballo (Espanha)", "publico": 35219,
        "gols": [
            ("Raja Casablanca", "Iajour", "51", "Normal"), ("Atlético-MG", "Ronaldinho Gaúcho", "63", "Falta"),
            ("Raja Casablanca", "Moutouali", "84", "Pênalti"), ("Raja Casablanca", "Mabidé", "90+4", "Normal")
        ]
    },
    {
        "ano": 2013, "data": "2013-12-21", "campeonato": "Copa do Mundo de Clubes da FIFA", "fase": "Disputa do 3º Lugar",
        "estadio": "Stade de Marrakech", "cidade": "Marrakech", "estado": "Marrocos",
        "mandante": "Guangzhou Evergrande", "visitante": "Atlético-MG", "gols_man": 2, "gols_vis": 3, "placar": "2x3", "vencedor": "Atlético-MG",
        "arbitro": "Alireza Faghani (Irã)", "publico": 37774,
        "gols": [
            ("Atlético-MG", "Diego Tardelli", "2", "Normal"), ("Guangzhou Evergrande", "Muriqui", "9", "Normal"),
            ("Guangzhou Evergrande", "Conca", "15", "Pênalti"), ("Atlético-MG", "Ronaldinho Gaúcho", "45+1", "Falta"),
            ("Atlético-MG", "Luan", "90+1", "Normal")
        ]
    },

    # 2017: Grêmio no Mundial
    {
        "ano": 2017, "data": "2017-12-12", "campeonato": "Copa do Mundo de Clubes da FIFA", "fase": "Semifinal",
        "estadio": "Hazza bin Zayed Stadium", "cidade": "Al Ain", "estado": "Emirados Árabes",
        "mandante": "Grêmio", "visitante": "Pachuca", "gols_man": 1, "gols_vis": 0, "placar": "1x0", "vencedor": "Grêmio",
        "arbitro": "Felix Brych (Alemanha)", "publico": 6428,
        "gols": [("Grêmio", "Éverton Cebolinha", "95", "Normal")]
    },
    {
        "ano": 2017, "data": "2017-12-16", "campeonato": "Copa do Mundo de Clubes da FIFA", "fase": "Final",
        "estadio": "Zayed Sports City Stadium", "cidade": "Abu Dhabi", "estado": "Emirados Árabes",
        "mandante": "Real Madrid", "visitante": "Grêmio", "gols_man": 1, "gols_vis": 0, "placar": "1x0", "vencedor": "Real Madrid",
        "arbitro": "César Ramos (México)", "publico": 41094,
        "gols": [("Real Madrid", "Cristiano Ronaldo", "53", "Falta")]
    },

    # 2019: Flamengo no Mundial
    {
        "ano": 2019, "data": "2019-12-17", "campeonato": "Copa do Mundo de Clubes da FIFA", "fase": "Semifinal",
        "estadio": "Khalifa International Stadium", "cidade": "Doha", "estado": "Catar",
        "mandante": "Flamengo", "visitante": "Al-Hilal", "gols_man": 3, "gols_vis": 1, "placar": "3x1", "vencedor": "Flamengo",
        "arbitro": "Ismail Elfath (EUA)", "publico": 21588,
        "gols": [
            ("Al-Hilal", "Salem Al-Dawsari", "18", "Normal"), ("Flamengo", "Arrascaeta", "49", "Normal"),
            ("Flamengo", "Bruno Henrique", "78", "Normal"), ("Flamengo", "Al-Bulaihi", "82", "Contra")
        ]
    },
    {
        "ano": 2019, "data": "2019-12-21", "campeonato": "Copa do Mundo de Clubes da FIFA", "fase": "Final",
        "estadio": "Khalifa International Stadium", "cidade": "Doha", "estado": "Catar",
        "mandante": "Liverpool", "visitante": "Flamengo", "gols_man": 1, "gols_vis": 0, "placar": "1x0", "vencedor": "Liverpool",
        "arbitro": "Abdulrahman Al-Jassim (Catar)", "publico": 45416,
        "gols": [("Liverpool", "Roberto Firmino", "99", "Normal")]
    },

    # 2020: Palmeiras no Mundial
    {
        "ano": 2020, "data": "2021-02-07", "campeonato": "Copa do Mundo de Clubes da FIFA", "fase": "Semifinal",
        "estadio": "Education City Stadium", "cidade": "Al Rayyan", "estado": "Catar",
        "mandante": "Palmeiras", "visitante": "Tigres UANL", "gols_man": 0, "gols_vis": 1, "placar": "0x1", "vencedor": "Tigres UANL",
        "arbitro": "Danny Makkelie (Holanda)", "publico": 1850,
        "gols": [("Tigres UANL", "Gignac", "54", "Pênalti")]
    },
    {
        "ano": 2020, "data": "2021-02-11", "campeonato": "Copa do Mundo de Clubes da FIFA", "fase": "Disputa do 3º Lugar",
        "estadio": "Education City Stadium", "cidade": "Al Rayyan", "estado": "Catar",
        "mandante": "Al-Ahly", "visitante": "Palmeiras", "gols_man": 0, "gols_vis": 0, "placar": "0x0", "vencedor": "Empate",
        "arbitro": "Maguette N'Diaye (Senegal)", "publico": 5606,
        "gols": []
    },

    # 2021: Palmeiras no Mundial
    {
        "ano": 2021, "data": "2022-02-08", "campeonato": "Copa do Mundo de Clubes da FIFA", "fase": "Semifinal",
        "estadio": "Al Nahyan Stadium", "cidade": "Abu Dhabi", "estado": "Emirados Árabes",
        "mandante": "Palmeiras", "visitante": "Al-Ahly", "gols_man": 2, "gols_vis": 0, "placar": "2x0", "vencedor": "Palmeiras",
        "arbitro": "Clément Turpin (França)", "publico": 11902,
        "gols": [("Palmeiras", "Raphael Veiga", "39", "Normal"), ("Palmeiras", "Dudu", "49", "Normal")]
    },
    {
        "ano": 2021, "data": "2022-02-12", "campeonato": "Copa do Mundo de Clubes da FIFA", "fase": "Final",
        "estadio": "Mohammed bin Zayed Stadium", "cidade": "Abu Dhabi", "estado": "Emirados Árabes",
        "mandante": "Chelsea", "visitante": "Palmeiras", "gols_man": 2, "gols_vis": 1, "placar": "2x1", "vencedor": "Chelsea",
        "arbitro": "Chris Beath (Austrália)", "publico": 32871,
        "gols": [
            ("Chelsea", "Lukaku", "54", "Normal"), ("Palmeiras", "Raphael Veiga", "64", "Pênalti"),
            ("Chelsea", "Havertz", "117", "Pênalti")
        ]
    },

    # 2022: Flamengo no Mundial
    {
        "ano": 2022, "data": "2023-02-07", "campeonato": "Copa do Mundo de Clubes da FIFA", "fase": "Semifinal",
        "estadio": "Ibn Batouta Stadium", "cidade": "Tânger", "estado": "Marrocos",
        "mandante": "Flamengo", "visitante": "Al-Hilal", "gols_man": 2, "gols_vis": 3, "placar": "2x3", "vencedor": "Al-Hilal",
        "arbitro": "István Kovács (Romênia)", "publico": 42496,
        "gols": [
            ("Al-Hilal", "Salem Al-Dawsari", "4", "Pênalti"), ("Flamengo", "Pedro", "20", "Normal"),
            ("Al-Hilal", "Salem Al-Dawsari", "45+9", "Pênalti"), ("Al-Hilal", "Vietto", "70", "Normal"),
            ("Flamengo", "Pedro", "90+1", "Normal")
        ]
    },
    {
        "ano": 2022, "data": "2023-02-11", "campeonato": "Copa do Mundo de Clubes da FIFA", "fase": "Disputa do 3º Lugar",
        "estadio": "Ibn Batouta Stadium", "cidade": "Tânger", "estado": "Marrocos",
        "mandante": "Al-Ahly", "visitante": "Flamengo", "gols_man": 2, "gols_vis": 4, "placar": "2x4", "vencedor": "Flamengo",
        "arbitro": "Mustapha Ghorbal (Argélia)", "publico": 30216,
        "gols": [
            ("Flamengo", "Gabriel Barbosa", "11", "Pênalti"), ("Al-Ahly", "Abdel Kader", "38", "Normal"),
            ("Al-Ahly", "Abdel Kader", "60", "Normal"), ("Flamengo", "Pedro", "77", "Normal"),
            ("Flamengo", "Gabriel Barbosa", "85", "Pênalti"), ("Flamengo", "Pedro", "90+1", "Normal")
        ]
    },

    # 2023: Fluminense no Mundial
    {
        "ano": 2023, "data": "2023-12-18", "campeonato": "Copa do Mundo de Clubes da FIFA", "fase": "Semifinal",
        "estadio": "King Abdullah Sports City", "cidade": "Jeddah", "estado": "Arábia Saudita",
        "mandante": "Fluminense", "visitante": "Al-Ahly", "gols_man": 2, "gols_vis": 0, "placar": "2x0", "vencedor": "Fluminense",
        "arbitro": "Szymon Marciniak (Polônia)", "publico": 34986,
        "gols": [("Fluminense", "Jhon Arias", "71", "Pênalti"), ("Fluminense", "John Kennedy", "90", "Normal")]
    },
    {
        "ano": 2023, "data": "2023-12-22", "campeonato": "Copa do Mundo de Clubes da FIFA", "fase": "Final",
        "estadio": "King Abdullah Sports City", "cidade": "Jeddah", "estado": "Arábia Saudita",
        "mandante": "Manchester City", "visitante": "Fluminense", "gols_man": 4, "gols_vis": 0, "placar": "4x0", "vencedor": "Manchester City",
        "arbitro": "Szymon Marciniak (Polônia)", "publico": 52601,
        "gols": [
            ("Manchester City", "Julián Álvarez", "1", "Normal"), ("Manchester City", "Nino", "27", "Contra"),
            ("Manchester City", "Phil Foden", "72", "Normal"), ("Manchester City", "Julián Álvarez", "88", "Normal")
        ]
    }
]

def salvar_mundiais():
    print("=" * 80)
    print("INICIANDO INSERÇÃO DOS JOGOS DE BRASILEIROS EM MUNDIAIS DE CLUBES (1962 A 2023)")
    print("Copa Intercontinental + Copa do Mundo de Clubes da FIFA")
    print("=" * 80)

    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()

    cur.execute("DELETE FROM partidas WHERE campeonato IN ('Copa Intercontinental', 'Copa do Mundo de Clubes da FIFA');")
    cur.execute("DELETE FROM gols WHERE id_partida IN (SELECT id_partida FROM partidas WHERE campeonato IN ('Copa Intercontinental', 'Copa do Mundo de Clubes da FIFA'));")
    conn.commit()

    match_counter = 1
    total_gols = 0

    for m in MUNDIAIS_JOGOS:
        ano = m["ano"]
        # ID exclusivo para Mundiais: ano * 10000 + 9000 + match_counter
        id_partida = ano * 10000 + 9000 + match_counter
        match_counter += 1

        cur.execute("""
        INSERT INTO partidas (
            id_partida, ano, rodada, data, horario, estadio, cidade, estado,
            mandante, visitante, gols_mandante, gols_visitante, placar, vencedor,
            arbitro, assistente_1, assistente_2, quarto_arbitro, var,
            tecnico_mandante, tecnico_visitante, publico, campeonato, formato, fase
        ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?);
        """, (
            id_partida, ano, m["fase"], m["data"], "", m["estadio"], m["cidade"], m["estado"],
            m["mandante"], m["visitante"], m["gols_man"], m["gols_vis"], m["placar"], m["vencedor"],
            m["arbitro"], None, None, None, None,
            "", "", m["publico"], m["campeonato"], "Mata-Mata / Eliminatória Mundial", m["fase"]
        ))

        for clube, atleta, minuto, tipo in m["gols"]:
            cur.execute("""
            INSERT INTO gols (id_partida, rodada, clube, atleta, minuto, tempo, tipo_de_gol)
            VALUES (?,?,?,?,?,?,?);
            """, (id_partida, m["fase"], clube, atleta, minuto, "", tipo))
            total_gols += 1

    conn.commit()

    cur.execute("SELECT COUNT(*) FROM partidas WHERE campeonato IN ('Copa Intercontinental', 'Copa do Mundo de Clubes da FIFA');")
    count_mun = cur.fetchone()[0]

    cur.execute("SELECT COUNT(*) FROM partidas;")
    total_geral = cur.fetchone()[0]

    conn.close()

    print("=" * 80)
    print(f"GRAVAÇÃO DOS MUNDIAIS CONCLUÍDA COM SUCESSO!")
    print(f"Partidas Inseridas nos Mundiais: {count_mun}")
    print(f"Gols Detalhados nos Mundiais:    {total_gols}")
    print(f"Total Geral no Banco futebol.db: {total_geral:,} partidas")
    print("=" * 80)

if __name__ == "__main__":
    salvar_mundiais()
