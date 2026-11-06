"""
Script de Criação e População da Tabela `clubes_perfil`
Enriquece o acervo do FutStats com dados cadastrais de perfil oficial estilo OGol:
- Nome oficial, fundação, estádio, capacidade, presidente, treinador atual,
- Valor total do elenco (milhões de euros), cores e ídolos históricos em JSON.
"""

import sqlite3
import json
import datetime
from pathlib import Path

DB_PATH = Path("data/futebol.db")

DADOS_CLUBES = [
    {
        "nome": "Palmeiras",
        "nome_oficial": "Sociedade Esportiva Palmeiras",
        "alcunhas": "Verdão, Alviverde Imponente, Palestra",
        "fundacao": "26/08/1914",
        "cidade": "São Paulo",
        "estado": "SP",
        "pais": "Brasil",
        "estadio_nome": "Allianz Parque",
        "estadio_capacidade": 43713,
        "presidente": "Leila Pereira",
        "treinador_atual": "Abel Ferreira",
        "valor_elenco_milhoes_eur": 218.5,
        "cores_principais": "#006437, #FFFFFF",
        "idolos_historicos": [
            {"nome": "Ademir da Guia", "posicao": "Meia", "periodo": "1961–1977", "jogos": 902, "gols": 155},
            {"nome": "Marcos", "posicao": "Goleiro", "periodo": "1992–2012", "jogos": 533, "gols": 0},
            {"nome": "Dudu (Olegário)", "posicao": "Volante", "periodo": "1964–1976", "jogos": 615, "gols": 29},
            {"nome": "Evair", "posicao": "Atacante", "periodo": "1991–1999", "jogos": 245, "gols": 126},
            {"nome": "Luís Pereira", "posicao": "Zagueiro", "periodo": "1968–1975", "jogos": 576, "gols": 36},
            {"nome": "Raphael Veiga", "posicao": "Meia", "periodo": "2017–2026", "jogos": 330, "gols": 105},
            {"nome": "Dudu", "posicao": "Atacante", "periodo": "2015–2026", "jogos": 443, "gols": 88}
        ]
    },
    {
        "nome": "Flamengo",
        "nome_oficial": "Clube de Regatas do Flamengo",
        "alcunhas": "Mengão, Rubro-Negro, Urubu",
        "fundacao": "17/11/1895",
        "cidade": "Rio de Janeiro",
        "estado": "RJ",
        "pais": "Brasil",
        "estadio_nome": "Maracanã",
        "estadio_capacidade": 78838,
        "presidente": "Rodolfo Landim",
        "treinador_atual": "Filipe Luís",
        "valor_elenco_milhoes_eur": 212.0,
        "cores_principais": "#C8102E, #000000",
        "idolos_historicos": [
            {"nome": "Zico", "posicao": "Meia-Atacante", "periodo": "1971–1989", "jogos": 732, "gols": 508},
            {"nome": "Júnior", "posicao": "Lateral / Meia", "periodo": "1974–1993", "jogos": 876, "gols": 77},
            {"nome": "Leandro", "posicao": "Lateral / Zagueiro", "periodo": "1978–1990", "jogos": 415, "gols": 14},
            {"nome": "Gabriel Barbosa (Gabigol)", "posicao": "Atacante", "periodo": "2019–2024", "jogos": 305, "gols": 160},
            {"nome": "Giorgian de Arrascaeta", "posicao": "Meia", "periodo": "2019–2026", "jogos": 298, "gols": 74},
            {"nome": "Raul Plassmann", "posicao": "Goleiro", "periodo": "1978–1983", "jogos": 228, "gols": 0}
        ]
    },
    {
        "nome": "São Paulo",
        "nome_oficial": "São Paulo Futebol Clube",
        "alcunhas": "Tricolor Paulista, Soberano",
        "fundacao": "25/01/1930",
        "cidade": "São Paulo",
        "estado": "SP",
        "pais": "Brasil",
        "estadio_nome": "MorumBIS",
        "estadio_capacidade": 66795,
        "presidente": "Julio Casares",
        "treinador_atual": "Luis Zubeldía",
        "valor_elenco_milhoes_eur": 125.4,
        "cores_principais": "#C8102E, #FFFFFF, #000000",
        "idolos_historicos": [
            {"nome": "Rogério Ceni", "posicao": "Goleiro", "periodo": "1990–2015", "jogos": 1237, "gols": 131},
            {"nome": "Raí", "posicao": "Meia", "periodo": "1987–2000", "jogos": 395, "gols": 128},
            {"nome": "Telê Santana", "posicao": "Técnico Histórico", "periodo": "1990–1996", "jogos": 410, "gols": 0},
            {"nome": "Careca", "posicao": "Atacante", "periodo": "1983–1987", "jogos": 191, "gols": 115},
            {"nome": "Lugano", "posicao": "Zagueiro", "periodo": "2003–2017", "jogos": 213, "gols": 13},
            {"nome": "Lucas Moura", "posicao": "Atacante", "periodo": "2010–2026", "jogos": 182, "gols": 42}
        ]
    },
    {
        "nome": "Corinthians",
        "nome_oficial": "Sport Club Corinthians Paulista",
        "alcunhas": "Timão, Coringão, Time do Povo",
        "fundacao": "01/09/1910",
        "cidade": "São Paulo",
        "estado": "SP",
        "pais": "Brasil",
        "estadio_nome": "Neo Química Arena",
        "estadio_capacidade": 49205,
        "presidente": "Augusto Melo",
        "treinador_atual": "Ramón Díaz",
        "valor_elenco_milhoes_eur": 118.0,
        "cores_principais": "#000000, #FFFFFF",
        "idolos_historicos": [
            {"nome": "Sócrates", "posicao": "Meia", "periodo": "1978–1984", "jogos": 298, "gols": 172},
            {"nome": "Marcelinho Carioca", "posicao": "Meia", "periodo": "1994–2010", "jogos": 433, "gols": 206},
            {"nome": "Cássio", "posicao": "Goleiro", "periodo": "2012–2024", "jogos": 712, "gols": 0},
            {"nome": "Rivellino", "posicao": "Meia", "periodo": "1965–1974", "jogos": 474, "gols": 144},
            {"nome": "Neto", "posicao": "Meia", "periodo": "1989–1993", "jogos": 228, "gols": 60},
            {"nome": "Rodrigo Garro", "posicao": "Meia", "periodo": "2024–2026", "jogos": 65, "gols": 14}
        ]
    },
    {
        "nome": "Santos",
        "nome_oficial": "Santos Futebol Clube",
        "alcunhas": "Peixe, Alvinegro Praiano",
        "fundacao": "14/04/1912",
        "cidade": "Santos",
        "estado": "SP",
        "pais": "Brasil",
        "estadio_nome": "Vila Belmiro",
        "estadio_capacidade": 16068,
        "presidente": "Marcelo Teixeira",
        "treinador_atual": "Leandro Zago",
        "valor_elenco_milhoes_eur": 65.0,
        "cores_principais": "#000000, #FFFFFF",
        "idolos_historicos": [
            {"nome": "Pelé", "posicao": "Atacante / Rei do Futebol", "periodo": "1956–1974", "jogos": 1116, "gols": 1091},
            {"nome": "Pepe", "posicao": "Ponta-Esquerda", "periodo": "1954–1969", "jogos": 741, "gols": 403},
            {"nome": "Neymar Jr", "posicao": "Atacante", "periodo": "2009–2013", "jogos": 225, "gols": 136},
            {"nome": "Zito", "posicao": "Volante", "periodo": "1952–1967", "jogos": 727, "gols": 57},
            {"nome": "Giovanni", "posicao": "Meia", "periodo": "1994–2010", "jogos": 128, "gols": 49}
        ]
    },
    {
        "nome": "Grêmio",
        "nome_oficial": "Grêmio Foot-Ball Porto Alegrense",
        "alcunhas": "Imortal Tricolor",
        "fundacao": "15/09/1903",
        "cidade": "Porto Alegre",
        "estado": "RS",
        "pais": "Brasil",
        "estadio_nome": "Arena do Grêmio",
        "estadio_capacidade": 55662,
        "presidente": "Alberto Guerra",
        "treinador_atual": "Renato Portaluppi",
        "valor_elenco_milhoes_eur": 98.2,
        "cores_principais": "#0080FF, #000000, #FFFFFF",
        "idolos_historicos": [
            {"nome": "Renato Portaluppi", "posicao": "Ponta / Técnico", "periodo": "1982–2026", "jogos": 262, "gols": 74},
            {"nome": "Danrlei", "posicao": "Goleiro", "periodo": "1993–2003", "jogos": 591, "gols": 0},
            {"nome": "Hugo De León", "posicao": "Zagueiro", "periodo": "1981–1984", "jogos": 242, "gols": 11},
            {"nome": "Luan", "posicao": "Meia-Atacante", "periodo": "2014–2023", "jogos": 293, "gols": 77},
            {"nome": "Geromel", "posicao": "Zagueiro", "periodo": "2014–2024", "jogos": 405, "gols": 15}
        ]
    },
    {
        "nome": "Internacional",
        "nome_oficial": "Sport Club Internacional",
        "alcunhas": "Colorado, Clube do Povo",
        "fundacao": "04/04/1909",
        "cidade": "Porto Alegre",
        "estado": "RS",
        "pais": "Brasil",
        "estadio_nome": "Beira-Rio",
        "estadio_capacidade": 50842,
        "presidente": "Alessandro Barcellos",
        "treinador_atual": "Roger Machado",
        "valor_elenco_milhoes_eur": 108.5,
        "cores_principais": "#C8102E, #FFFFFF",
        "idolos_historicos": [
            {"nome": "Paulo Roberto Falcão", "posicao": "Volante", "periodo": "1973–1980", "jogos": 392, "gols": 75},
            {"nome": "Fernandão", "posicao": "Atacante", "periodo": "2004–2008", "jogos": 190, "gols": 77},
            {"nome": "D'Alessandro", "posicao": "Meia", "periodo": "2008–2022", "jogos": 529, "gols": 97},
            {"nome": "Figueroa", "posicao": "Zagueiro", "periodo": "1971–1977", "jogos": 336, "gols": 27},
            {"nome": "Alan Patrick", "posicao": "Meia", "periodo": "2022–2026", "jogos": 140, "gols": 38}
        ]
    },
    {
        "nome": "Atlético Mineiro",
        "nome_oficial": "Clube Atlético Mineiro",
        "alcunhas": "Galo, Galo Forte e Vingador",
        "fundacao": "25/03/1908",
        "cidade": "Belo Horizonte",
        "estado": "MG",
        "pais": "Brasil",
        "estadio_nome": "Arena MRV",
        "estadio_capacidade": 46000,
        "presidente": "Sérgio Coelho",
        "treinador_atual": "Gabriel Milito",
        "valor_elenco_milhoes_eur": 115.0,
        "cores_principais": "#000000, #FFFFFF",
        "idolos_historicos": [
            {"nome": "Reinaldo", "posicao": "Atacante", "periodo": "1973–1985", "jogos": 475, "gols": 255},
            {"nome": "Ronaldinho Gaúcho", "posicao": "Meia", "periodo": "2012–2014", "jogos": 88, "gols": 28},
            {"nome": "Hulk", "posicao": "Atacante", "periodo": "2021–2026", "jogos": 225, "gols": 118},
            {"nome": "Victor", "posicao": "Goleiro", "periodo": "2012–2021", "jogos": 424, "gols": 0},
            {"nome": "Éder Aleixo", "posicao": "Ponta-Esquerda", "periodo": "1980–1985", "jogos": 368, "gols": 122}
        ]
    },
    {
        "nome": "Cruzeiro",
        "nome_oficial": "Cruzeiro Esporte Clube",
        "alcunhas": "Raposa, Celeste",
        "fundacao": "02/01/1921",
        "cidade": "Belo Horizonte",
        "estado": "MG",
        "pais": "Brasil",
        "estadio_nome": "Mineirão",
        "estadio_capacidade": 61846,
        "presidente": "Pedro Lourenço",
        "treinador_atual": "Fernando Diniz",
        "valor_elenco_milhoes_eur": 92.4,
        "cores_principais": "#003DA5, #FFFFFF",
        "idolos_historicos": [
            {"nome": "Tostão", "posicao": "Atacante", "periodo": "1963–1972", "jogos": 383, "gols": 245},
            {"nome": "Dirceu Lopes", "posicao": "Meia", "periodo": "1964–1977", "jogos": 610, "gols": 228},
            {"nome": "Fábio", "posicao": "Goleiro", "periodo": "2005–2021", "jogos": 976, "gols": 0},
            {"nome": "Alex", "posicao": "Meia", "periodo": "2001–2004", "jogos": 122, "gols": 64},
            {"nome": "Sorín", "posicao": "Lateral-Esquerdo", "periodo": "2000–2009", "jogos": 126, "gols": 18},
            {"nome": "Matheus Pereira", "posicao": "Meia", "periodo": "2023–2026", "jogos": 74, "gols": 16}
        ]
    },
    {
        "nome": "Botafogo",
        "nome_oficial": "Botafogo de Futebol e Regatas",
        "alcunhas": "Glorioso, Fogão, Alvinegro",
        "fundacao": "12/08/1904",
        "cidade": "Rio de Janeiro",
        "estado": "RJ",
        "pais": "Brasil",
        "estadio_nome": "Nilton Santos",
        "estadio_capacidade": 44661,
        "presidente": "Durcesio Mello (SAF: John Textor)",
        "treinador_atual": "Artur Jorge",
        "valor_elenco_milhoes_eur": 142.0,
        "cores_principais": "#000000, #FFFFFF",
        "idolos_historicos": [
            {"nome": "Garrincha", "posicao": "Ponta-Direita", "periodo": "1953–1965", "jogos": 614, "gols": 245},
            {"nome": "Nilton Santos", "posicao": "Lateral-Esquerdo", "periodo": "1948–1964", "jogos": 721, "gols": 11},
            {"nome": "Jairzinho", "posicao": "Ponta-Direita", "periodo": "1959–1974", "jogos": 412, "gols": 186},
            {"nome": "Túlio Maravilha", "posicao": "Atacante", "periodo": "1994–1996", "jogos": 241, "gols": 167},
            {"nome": "Luiz Henrique", "posicao": "Atacante", "periodo": "2024–2026", "jogos": 58, "gols": 18}
        ]
    },
    {
        "nome": "Fluminense",
        "nome_oficial": "Fluminense Football Club",
        "alcunhas": "Tricolor das Laranjeiras, Fluzão",
        "fundacao": "21/07/1902",
        "cidade": "Rio de Janeiro",
        "estado": "RJ",
        "pais": "Brasil",
        "estadio_nome": "Maracanã",
        "estadio_capacidade": 78838,
        "presidente": "Mário Bittencourt",
        "treinador_atual": "Mano Menezes",
        "valor_elenco_milhoes_eur": 86.5,
        "cores_principais": "#850028, #005F41, #FFFFFF",
        "idolos_historicos": [
            {"nome": "Castilho", "posicao": "Goleiro", "periodo": "1946–1965", "jogos": 697, "gols": 0},
            {"nome": "Fred", "posicao": "Atacante", "periodo": "2009–2022", "jogos": 382, "gols": 199},
            {"nome": "Waldo", "posicao": "Atacante", "periodo": "1954–1961", "jogos": 403, "gols": 319},
            {"nome": "Thiago Silva", "posicao": "Zagueiro", "periodo": "2006–2026", "jogos": 178, "gols": 17},
            {"nome": "Ganso", "posicao": "Meia", "periodo": "2019–2026", "jogos": 252, "gols": 28}
        ]
    },
    {
        "nome": "Vasco",
        "nome_oficial": "Club de Regatas Vasco da Gama",
        "alcunhas": "Gigante da Colina, Cruzmaltino",
        "fundacao": "21/08/1898",
        "cidade": "Rio de Janeiro",
        "estado": "RJ",
        "pais": "Brasil",
        "estadio_nome": "São Januário",
        "estadio_capacidade": 21880,
        "presidente": "Pedrinho",
        "treinador_atual": "Rafael Paiva",
        "valor_elenco_milhoes_eur": 81.3,
        "cores_principais": "#000000, #FFFFFF",
        "idolos_historicos": [
            {"nome": "Roberto Dinamite", "posicao": "Atacante", "periodo": "1971–1993", "jogos": 1110, "gols": 708},
            {"nome": "Romário", "posicao": "Atacante", "periodo": "1985–2007", "jogos": 349, "gols": 326},
            {"nome": "Edmundo", "posicao": "Atacante", "periodo": "1992–2008", "jogos": 244, "gols": 137},
            {"nome": "Juninho Pernambucano", "posicao": "Meia", "periodo": "1995–2013", "jogos": 393, "gols": 76},
            {"nome": "Pablo Vegetti", "posicao": "Atacante", "periodo": "2023–2026", "jogos": 82, "gols": 41}
        ]
    },
    {
        "nome": "Bahia",
        "nome_oficial": "Esporte Clube Bahia",
        "alcunhas": "Esquadrão de Aço, Tricolor Baiano",
        "fundacao": "01/01/1931",
        "cidade": "Salvador",
        "estado": "BA",
        "pais": "Brasil",
        "estadio_nome": "Arena Fonte Nova",
        "estadio_capacidade": 48902,
        "presidente": "Emerson Ferretti (SAF: City Football Group)",
        "treinador_atual": "Rogério Ceni",
        "valor_elenco_milhoes_eur": 76.8,
        "cores_principais": "#004B87, #C8102E, #FFFFFF",
        "idolos_historicos": [
            {"nome": "Bobô", "posicao": "Meia", "periodo": "1985–1989", "jogos": 220, "gols": 80},
            {"nome": "Beijoca", "posicao": "Atacante", "periodo": "1970–1978", "jogos": 280, "gols": 106},
            {"nome": "Douglas", "posicao": "Meia", "periodo": "1972–1979", "jogos": 312, "gols": 91},
            {"nome": "Cauly", "posicao": "Meia", "periodo": "2023–2026", "jogos": 95, "gols": 22},
            {"nome": "Everton Ribeiro", "posicao": "Meia", "periodo": "2024–2026", "jogos": 62, "gols": 10}
        ]
    },
    {
        "nome": "Fortaleza",
        "nome_oficial": "Fortaleza Esporte Clube",
        "alcunhas": "Leão do Pici, Tricolor de Aço",
        "fundacao": "18/10/1918",
        "cidade": "Fortaleza",
        "estado": "CE",
        "pais": "Brasil",
        "estadio_nome": "Arena Castelão",
        "estadio_capacidade": 63903,
        "presidente": "Alex Santiago",
        "treinador_atual": "Juan Pablo Vojvoda",
        "valor_elenco_milhoes_eur": 58.5,
        "cores_principais": "#002B49, #C8102E, #FFFFFF",
        "idolos_historicos": [
            {"nome": "Clodoaldo", "posicao": "Atacante", "periodo": "2001–2005", "jogos": 140, "gols": 120},
            {"nome": "Tinga", "posicao": "Lateral / Zagueiro", "periodo": "2018–2026", "jogos": 330, "gols": 25},
            {"nome": "Yago Pikachu", "posicao": "Meia-Lateral", "periodo": "2021–2026", "jogos": 195, "gols": 50},
            {"nome": "Juan Pablo Vojvoda", "posicao": "Técnico Histórico", "periodo": "2021–2026", "jogos": 240, "gols": 0}
        ]
    },
    {
        "nome": "Red Bull Bragantino",
        "nome_oficial": "Red Bull Bragantino",
        "alcunhas": "Massa Bruta, Toro Loko",
        "fundacao": "08/01/1928",
        "cidade": "Bragança Paulista",
        "estado": "SP",
        "pais": "Brasil",
        "estadio_nome": "Nabi Abi Chedid",
        "estadio_capacidade": 17022,
        "presidente": "Thiago Scuro",
        "treinador_atual": "Pedro Caixinha",
        "valor_elenco_milhoes_eur": 79.4,
        "cores_principais": "#FFFFFF, #C8102E",
        "idolos_historicos": [
            {"nome": "Mauro Silva", "posicao": "Volante", "periodo": "1990–1992", "jogos": 95, "gols": 0},
            {"nome": "Claudinho", "posicao": "Meia", "periodo": "2019–2021", "jogos": 126, "gols": 32},
            {"nome": "Cleiton", "posicao": "Goleiro", "periodo": "2020–2026", "jogos": 230, "gols": 0},
            {"nome": "Eduardo Sasha", "posicao": "Atacante", "periodo": "2023–2026", "jogos": 90, "gols": 31}
        ]
    },
    {
        "nome": "Athletico-PR",
        "nome_oficial": "Club Athletico Paranaense",
        "alcunhas": "Furacão, Rubro-Negro Paranaense",
        "fundacao": "26/03/1924",
        "cidade": "Curitiba",
        "estado": "PR",
        "pais": "Brasil",
        "estadio_nome": "Ligga Arena",
        "estadio_capacidade": 42372,
        "presidente": "Mário Celso Petraglia",
        "treinador_atual": "Lucho González",
        "valor_elenco_milhoes_eur": 71.0,
        "cores_principais": "#C8102E, #000000",
        "idolos_historicos": [
            {"nome": "Sicupira", "posicao": "Meia", "periodo": "1968–1976", "jogos": 319, "gols": 158},
            {"nome": "Kléber Pereira", "posicao": "Atacante", "periodo": "1999–2002", "jogos": 185, "gols": 124},
            {"nome": "Santos", "posicao": "Goleiro", "periodo": "2010–2022", "jogos": 258, "gols": 0},
            {"nome": "Thiago Heleno", "posicao": "Zagueiro", "periodo": "2016–2026", "jogos": 340, "gols": 16}
        ]
    },
    {
        "nome": "Atlético-MG",
        "nome_oficial": "Clube Atlético Mineiro",
        "alcunhas": "Galo, Galo Forte e Vingador",
        "fundacao": "25/03/1908",
        "cidade": "Belo Horizonte",
        "estado": "MG",
        "pais": "Brasil",
        "estadio_nome": "Arena MRV",
        "estadio_capacidade": 46000,
        "presidente": "Sérgio Coelho",
        "treinador_atual": "Gabriel Milito",
        "valor_elenco_milhoes_eur": 115.0,
        "cores_principais": "#000000, #FFFFFF",
        "idolos_historicos": [
            {"nome": "Reinaldo", "posicao": "Atacante", "periodo": "1973–1985", "jogos": 475, "gols": 255},
            {"nome": "Ronaldinho Gaúcho", "posicao": "Meia", "periodo": "2012–2014", "jogos": 88, "gols": 28},
            {"nome": "Hulk", "posicao": "Atacante", "periodo": "2021–2026", "jogos": 225, "gols": 118},
            {"nome": "Victor", "posicao": "Goleiro", "periodo": "2012–2021", "jogos": 424, "gols": 0},
            {"nome": "Éder Aleixo", "posicao": "Ponta-Esquerda", "periodo": "1980–1985", "jogos": 368, "gols": 122}
        ]
    },
    {
        "nome": "Ceará",
        "nome_oficial": "Ceará Sporting Club",
        "alcunhas": "Vozão, Alvinegro de Porangabuçu",
        "fundacao": "02/06/1914",
        "cidade": "Fortaleza",
        "estado": "CE",
        "pais": "Brasil",
        "estadio_nome": "Arena Castelão",
        "estadio_capacidade": 63903,
        "presidente": "João Paulo Silva",
        "treinador_atual": "Léo Condé",
        "valor_elenco_milhoes_eur": 22.0,
        "cores_principais": "#000000, #FFFFFF",
        "idolos_historicos": [
            {"nome": "Gildo", "posicao": "Atacante", "periodo": "1960–1971", "jogos": 441, "gols": 242},
            {"nome": "Sérgio Alves", "posicao": "Atacante", "periodo": "1992–2010", "jogos": 309, "gols": 141},
            {"nome": "Magno Alves", "posicao": "Atacante", "periodo": "2010–2017", "jogos": 146, "gols": 93},
            {"nome": "Dimas Filgueiras", "posicao": "Lateral / Técnico", "periodo": "1971–1976", "jogos": 130, "gols": 2}
        ]
    },
    {
        "nome": "Coritiba",
        "nome_oficial": "Coritiba Foot Ball Club",
        "alcunhas": "Coxa, Verdão do Alto da Glória",
        "fundacao": "12/10/1909",
        "cidade": "Curitiba",
        "estado": "PR",
        "pais": "Brasil",
        "estadio_nome": "Major Antônio Couto Pereira",
        "estadio_capacidade": 40502,
        "presidente": "Gabriel Lima",
        "treinador_atual": "Jorginho",
        "valor_elenco_milhoes_eur": 28.5,
        "cores_principais": "#005530, #FFFFFF",
        "idolos_historicos": [
            {"nome": "Dirceu Krüger", "posicao": "Meia", "periodo": "1966–1975", "jogos": 252, "gols": 58},
            {"nome": "Alex", "posicao": "Meia", "periodo": "1995–2014", "jogos": 210, "gols": 69},
            {"nome": "Jairo", "posicao": "Goleiro", "periodo": "1972–1987", "jogos": 410, "gols": 0},
            {"nome": "Reginaldo Nascimento", "posicao": "Volante", "periodo": "1993–2005", "jogos": 338, "gols": 18}
        ]
    },
    {
        "nome": "Goiás",
        "nome_oficial": "Goiás Esporte Clube",
        "alcunhas": "Esmeraldino, Verdão da Serra",
        "fundacao": "06/04/1943",
        "cidade": "Goiânia",
        "estado": "GO",
        "pais": "Brasil",
        "estadio_nome": "Estádio Hailé Pinheiro (Serrinha)",
        "estadio_capacidade": 14525,
        "presidente": "Aroldo Guidão Filho",
        "treinador_atual": "Vagner Mancini",
        "valor_elenco_milhoes_eur": 24.0,
        "cores_principais": "#005C36, #FFFFFF",
        "idolos_historicos": [
            {"nome": "Fernandão", "posicao": "Atacante", "periodo": "1995–2001", "jogos": 289, "gols": 108},
            {"nome": "Harlei", "posicao": "Goleiro", "periodo": "1999–2014", "jogos": 831, "gols": 0},
            {"nome": "Túlio Maravilha", "posicao": "Atacante", "periodo": "1987–1992", "jogos": 240, "gols": 187},
            {"nome": "Araújo", "posicao": "Atacante", "periodo": "1997–2004", "jogos": 335, "gols": 145}
        ]
    },
    {
        "nome": "Sport",
        "nome_oficial": "Sport Club do Recife",
        "alcunhas": "Leão da Ilha, Rubro-Negro Pernambucano",
        "fundacao": "13/05/1905",
        "cidade": "Recife",
        "estado": "PE",
        "pais": "Brasil",
        "estadio_nome": "Adelmar da Costa Carvalho (Ilha do Retiro)",
        "estadio_capacidade": 32983,
        "presidente": "Yuri Romão",
        "treinador_atual": "Pepa",
        "valor_elenco_milhoes_eur": 31.0,
        "cores_principais": "#D6001C, #000000",
        "idolos_historicos": [
            {"nome": "Magrão", "posicao": "Goleiro", "periodo": "2005–2019", "jogos": 732, "gols": 0},
            {"nome": "Durval", "posicao": "Zagueiro", "periodo": "2006–2018", "jogos": 472, "gols": 33},
            {"nome": "Leonardo", "posicao": "Atacante", "periodo": "1992–2004", "jogos": 367, "gols": 136},
            {"nome": "Diego Souza", "posicao": "Meia-Atacante", "periodo": "2014–2023", "jogos": 173, "gols": 57}
        ]
    },
    {
        "nome": "Vitória",
        "nome_oficial": "Esporte Clube Vitória",
        "alcunhas": "Leão da Barra, Rubro-Negro Baiano",
        "fundacao": "13/05/1899",
        "cidade": "Salvador",
        "estado": "BA",
        "pais": "Brasil",
        "estadio_nome": "Manoel Barradas (Barradão)",
        "estadio_capacidade": 35000,
        "presidente": "Fábio Mota",
        "treinador_atual": "Thiago Carpini",
        "valor_elenco_milhoes_eur": 34.0,
        "cores_principais": "#D6001C, #000000",
        "idolos_historicos": [
            {"nome": "Bebeto", "posicao": "Atacante", "periodo": "1982–1997", "jogos": 80, "gols": 31},
            {"nome": "Ramon Menezes", "posicao": "Meia", "periodo": "1994–2010", "jogos": 204, "gols": 47},
            {"nome": "Dida", "posicao": "Goleiro", "periodo": "1992–1993", "jogos": 54, "gols": 0},
            {"nome": "Dejan Petkovic", "posicao": "Meia", "periodo": "1997–1999", "jogos": 90, "gols": 59}
        ]
    }
]

def main():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS clubes_perfil (
        id_clube INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT UNIQUE NOT NULL,
        nome_oficial TEXT NOT NULL,
        alcunhas TEXT,
        fundacao TEXT,
        cidade TEXT,
        estado TEXT,
        pais TEXT DEFAULT 'Brasil',
        estadio_nome TEXT,
        estadio_capacidade INTEGER,
        presidente TEXT,
        treinador_atual TEXT,
        valor_elenco_milhoes_eur REAL,
        cores_principais TEXT,
        idolos_historicos_json TEXT,
        atualizado_em DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    """)
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_clubes_perfil_nome ON clubes_perfil(nome);")

    inseridos = 0
    atualizados = 0

    for c in DADOS_CLUBES:
        idolos_json = json.dumps(c["idolos_historicos"], ensure_ascii=False)
        cursor.execute("""
        INSERT INTO clubes_perfil (
            nome, nome_oficial, alcunhas, fundacao, cidade, estado, pais,
            estadio_nome, estadio_capacidade, presidente, treinador_atual,
            valor_elenco_milhoes_eur, cores_principais, idolos_historicos_json, atualizado_em
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
        ON CONFLICT(nome) DO UPDATE SET
            nome_oficial = excluded.nome_oficial,
            alcunhas = excluded.alcunhas,
            fundacao = excluded.fundacao,
            cidade = excluded.cidade,
            estado = excluded.estado,
            estadio_nome = excluded.estadio_nome,
            estadio_capacidade = excluded.estadio_capacidade,
            presidente = excluded.presidente,
            treinador_atual = excluded.treinador_atual,
            valor_elenco_milhoes_eur = excluded.valor_elenco_milhoes_eur,
            cores_principais = excluded.cores_principais,
            idolos_historicos_json = excluded.idolos_historicos_json,
            atualizado_em = CURRENT_TIMESTAMP;
        """, (
            c["nome"], c["nome_oficial"], c["alcunhas"], c["fundacao"],
            c["cidade"], c["estado"], c["pais"], c["estadio_nome"],
            c["estadio_capacidade"], c["presidente"], c["treinador_atual"],
            c["valor_elenco_milhoes_eur"], c["cores_principais"], idolos_json
        ))
        inseridos += 1

    conn.commit()

    # Manter estritamente DELETE mode
    cursor.execute("PRAGMA journal_mode = DELETE;")
    cursor.execute("VACUUM;")
    conn.commit()
    conn.close()

    size_mb = DB_PATH.stat().st_size / (1024 * 1024)
    print(f"Sucesso! {inseridos} perfis de clubes sincronizados em 'clubes_perfil'.")
    print(f"Tamanho de data/futebol.db: {size_mb:.2f} MB")

if __name__ == "__main__":
    main()
