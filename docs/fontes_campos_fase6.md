# Fontes de Dados e Campos — Fase 6: Páginas Canônicas

Este documento detalha o mapeamento oficial entre tabelas canônicas de `data/futebol.db`, rotas REST no backend Flask e componentes de UI no frontend React para as páginas de **Técnico**, **Árbitro** e **Competição**.

---

## 1. Princípios de Governança e Integridade

1. **Exclusividade Canônica**: Nenhuma fonte externa ou scraping não homologado foi utilizado. Todos os dados derivam do acervo canônico (115.753 partidas e 117.523 gols).
2. **Honestidade de Dados (Zero-Hallucination)**: Campos que não possuem telemetria em súmula histórica retornam `null` no backend e são renderizados como `"Não disponível"` no frontend. É terminantemente proibido inventar ou inferir estatísticas ausentes.
3. **Imutabilidade em Leitura**: Todas as rotas de backend utilizam conexões em modo estrito de somente leitura (`immutable=1` / `mode=ro`).

---

## 2. Página de Técnico

### Componente Frontend: `frontend/src/components/CoachProfileView.jsx`
### Rota Backend: `GET /api/tecnicos/detalhe-completo` & `GET /api/tecnicos/lista-completa`

| Campo da UI | Origem no Banco | Tabela Canônica | Regra / Tratamento de Ausência |
|---|---|---|---|
| **Nome do Técnico** | `nome` | `tecnicos_perfil` (fallback `dim_tecnico.nome_exibicao`) | Exibição direta |
| **Nome Completo** | `nome_completo` | `tecnicos_perfil` | Se omitido, exibe apenas o nome principal |
| **Nacionalidade** | `nacionalidade` | `tecnicos_perfil` (fallback `dim_tecnico.pais`) | Se nulo: `"Não disponível"` |
| **Idade** | `idade` | `tecnicos_perfil` | Se nulo: `"Não disponível"` |
| **Esquema Tático Preferido** | `esquema_preferido` | `tecnicos_perfil` | Se nulo: `"Não disponível"` |
| **Clubes Treinados** | `clubes_json` | `tecnicos_perfil` | Array JSON decodificado; chips de clubes |
| **Títulos Oficiais** | `titulos_json` | `tecnicos_perfil` | Array JSON decodificado; estante de troféus |
| **Total de Jogos** | `total_jogos` | `tecnicos_perfil` / agregação de `partidas` | Calculado a partir de partidas comandadas |
| **Vitórias, Empates, Derrotas** | `vitorias`, `empates`, `derrotas` | `tecnicos_perfil` / `partidas` | Agregação canônica |
| **Aproveitamento (%)** | `aproveitamento_pct` | `tecnicos_perfil` / `partidas` | `(V*3 + E) / (J*3) * 100` |
| **Gols Pró e Contra** | `gols_pro`, `gols_contra` | `tecnicos_perfil` / `partidas` | Gols de mandos onde comandava |
| **Histórico por Competição** | `campeonato`, `ano`, `jogos`, `V`, `E`, `D` | `partidas` (`tecnico_mandante` / `tecnico_visitante`) | Agrupado por torneio e ano |
| **Confrontos Relevantes** | `data`, `mandante`, `visitante`, `placar` | `partidas` | Últimas 15 partidas catalogadas |

---

## 3. Página de Árbitro

### Componente Frontend: `frontend/src/components/RefereeScoutView.jsx`
### Rota Backend: `GET /api/arbitros/detalhe-completo` & `GET /api/arbitros/lista-completa`

| Campo da UI | Origem no Banco | Tabela Canônica | Regra / Tratamento de Ausência |
|---|---|---|---|
| **Nome do Árbitro** | `arbitro` / `nome` | `partidas` / `arbitros_estatisticas_detalhadas` | Exibição em caixa alta/título |
| **Partidas no Acervo** | `COUNT(*)` | `partidas` | Contagem total de súmulas apitadas |
| **Período Atuante** | `MIN(ano)`, `MAX(ano)` | `partidas` | Intervalo de temporadas registradas |
| **Cartões Amarelos / Jogo** | `cr.cartao` / total jogos | `cartoes` cruzado com `partidas` | Média calculada por jogo |
| **Cartões Vermelhos / Jogo** | `cr.cartao` (vermelho) | `cartoes` cruzado com `partidas` | Média calculada por jogo |
| **Faltas por Jogo** | `faltas_por_jogo` | `arbitros_estatisticas_detalhadas` | **"Não disponível"** se árbitro não possuir telemetria |
| **Pênaltis por Jogo** | `penaltis_por_jogo` | `arbitros_estatisticas_detalhadas` | **"Não disponível"** se árbitro não possuir telemetria |
| **Fator / Viés Mandante** | `vit_mandante / total` | `partidas` | Percentual de vitórias dos donos da casa |
| **Histórico por Torneio** | `campeonato`, contagem de jogos | `partidas` | Campeonatos onde atuou no acervo |
| **Partidas Recentes** | `data`, `placar`, times, estádio | `partidas` | 10 súmulas mais recentes catalogadas |

---

## 4. Página de Competição

### Componente Frontend: `frontend/src/components/CompetitionDetailView.jsx`
### Rota Backend: `GET /api/competicoes/lista-geral` & `GET /api/competicoes/detalhe-edicao`

| Campo da UI | Origem no Banco | Tabela Canônica | Regra / Tratamento de Ausência |
|---|---|---|---|
| **Nome do Torneio** | `campeonato` | `partidas` | Nome oficial da competição |
| **Edições Disponíveis** | `DISTINCT ano` | `partidas` | Dropdown dinâmico de temporadas |
| **Volume de Partidas** | `COUNT(*)` da edição | `partidas` | Total de partidas realizadas |
| **Total e Média de Gols** | `gols_mandante + gols_visitante` | `partidas` | Volume e média por partida da edição |
| **Vitórias Mandante/Visitante/Empate**| `vencedor` vs `mandante`/`visitante` | `partidas` | Percentuais coletivos de mando de campo |
| **Tabela de Classificação** | `mandante`, `visitante`, `placar` | `partidas` | Calculada dinamicamente: Pts, J, V, E, D, GP, GC, SG, % |
| **Artilharia da Edição** | `g.atleta`, `g.clube`, `COUNT(*)` | `gols` JOIN `partidas` | Top marcadores da edição específica |
| **Calendário de Jogos** | `rodada`, `fase`, `data`, `placar` | `partidas` | Grade de resultados da temporada |
| **Maiores Goleadas Históricas** | `ABS(gols_mandante - gols_visitante)` | `partidas` | Top 5 maiores vitórias da história da competição |
| **Jogos com Mais Gols** | `gols_mandante + gols_visitante` | `partidas` | Top 5 jogos mais movimentados de todas as edições |

---

## 5. Resumo de Blindagem e Compatibilidade

- **Teto Vercel**: 82,65 MB (folga de 1,35 MB até o soft limit de 84,00 MB).
- **Zero Inserções de Dados**: Nenhuma linha foi escrita nas tabelas canônicas durante a Fase 6.
- **Regression Gates**: 38/38 testes aprovados em `tests/test_model_evals.py`, `tests/test_metricas_avancadas_api.py` e `tests/test_fase6_paginas.py`.
