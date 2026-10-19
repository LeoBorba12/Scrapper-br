# 🔍 Raio-X e Auditoria Completa do Banco de Dados (`data/futebol.db`)
> Relatório técnico para análise de qualidade de dados, anomalias, incongruências e integridade relacional.

## 1. Panorama Quantitativo das Tabelas
- **Tabela `partidas`**: 59,375 registros
- **Tabela `gols`**: 42,138 registros
- **Tabela `cartoes`**: 20,953 registros
- **Tabela `escalacoes`**: 35,547 registros
- **Tabela `usuarios`**: 5 registros

## 2. Integridade Referencial e Registros Órfãos
- **Gols órfãos (sem partida correspondente)**: 0
- **Cartões órfãos (sem partida correspondente)**: 0
- **Escalações órfãs (sem partida correspondente)**: 0

## 3. Incongruências de Resultados e Placares
- **Partidas com Mandante = Visitante (anomalia de scraping)**: 0 jogos
- **Partidas onde o vencedor gravado diverge do placar**: 0

## 4. Incongruências de Datas e Temporadas
- **Jogos onde o ano da data (YYYY) é diferente da coluna `ano`**: 481 jogos
  *(Nota: Ocorre principalmente em torneios que atravessam o réveillon, ex: Libertadores ou edições estendidas da Copa do Brasil, ou falhas no parser de data)*
- **Jogos sem data preenchida**: 0

## 5. Matriz de Cobertura e Lacunas de Dados (Gaps)
| Competição | Total Partidas | Partidas com Gols Detalhados | Total Gols Atletas | Partidas com Cartões | Partidas com Escalações |
| :--- | :---: | :---: | :---: | :---: | :---: |
| Campeonato Brasileiro | 11,886 | 8,106 | 21,467 | 0 | 0 |
| Campeonato Brasileiro - Série B | 10,728 | 0 | 0 | 0 | 0 |
| Campeonato Brasileiro - Série A | 8,785 | 0 | 0 | 4,116 | 771 |
| Copa Libertadores | 6,447 | 4,944 | 12,902 | 0 | 0 |
| Campeonato Carioca | 5,778 | 0 | 0 | 0 | 0 |
| Copa do Brasil | 3,321 | 743 | 2,369 | 0 | 0 |
| Campeonato Gaúcho | 2,088 | 0 | 0 | 0 | 0 |
| Copa Sul-Americana | 2,055 | 1,106 | 2,785 | 0 | 0 |
| Campeonato Paranaense | 1,727 | 0 | 0 | 0 | 0 |
| Campeonato Paulista | 1,668 | 0 | 0 | 0 | 0 |
| Campeonato Mineiro | 1,255 | 0 | 0 | 0 | 0 |
| Torneio Rio-São Paulo | 957 | 182 | 522 | 0 | 0 |
| Torneio Roberto Gomes Pedrosa | 542 | 0 | 0 | 0 | 0 |
| Copa do Nordeste | 491 | 137 | 148 | 0 | 0 |
| Taça Brasil | 451 | 24 | 70 | 0 | 0 |
| Copa Mercosul | 277 | 250 | 728 | 0 | 0 |
| Copa CONMEBOL | 240 | 218 | 580 | 0 | 0 |
| Supercopa Libertadores | 216 | 173 | 402 | 0 | 0 |
| Copa Sul-Minas | 209 | 34 | 34 | 0 | 0 |
| Amistoso / Torneio Extra | 67 | 0 | 0 | 0 | 0 |

## 6. Padronização e Variações de Nomes de Clubes
Exemplos de heterogeneidade na coluna `mandante` que podem afetar queries SQL sem tratamento fuzzy:
- **Busca `%Atlético%`**: ['Alianza Atlético', 'Atlético', 'Atlético Acreano (AC)', 'Atlético Bucaramanga', 'Atlético Cajazeirense (PB)', 'Atlético Cearense/CE']
- **Busca `%Grêmio%`**: ['Grêmio', 'Grêmio Coariense (AM)', 'Grêmio Jaciara (MT)', 'Grêmio Maringá', 'Grêmio Prudente']
- **Busca `%São Paulo%`**: ['K São Paulo (SP)', 'N São Paulo (SP)', 'São Paulo', 'São Paulo-RS', 'Treze-PB - São Paulo']
- **Busca `%Botafogo%`**: ['A Botafogo (RJ)', 'Alegrense-ES - Botafogo', 'Botafogo', 'Botafogo-PB', 'Botafogo-PB - Figueirense', 'Botafogo-SP']
- **Busca `%América%`**: ['América', 'América (AM)', 'América (Cd. de México)', 'América (Cdad. De México)', 'América (Cdad. de México)', 'América (SE)']

## 7. Perguntas Chave para o Gemini Responder
1. Quais dessas lacunas representam riscos graves para um motor de Text-to-SQL (Oráculo)?
2. Como implementar uma camada de normalização automática sem quebrar compatibilidade histórica?
3. Qual é a melhor estratégia de pipeline para resolver as partidas com mandante=visitante e os 3 gols órfãos?