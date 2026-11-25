# 📋 Relatório Consolidado de Entrega — Fase 3: Dossiê Institucional & Curva de Tendência Tática

**Data:** 16 de Novembro de 2026 — 18:10 BRT  
**Repositório:** `LeoBorba12/Scrapper-br`  
**Branch:** `main` (via PR [#5](https://github.com/LeoBorba12/Scrapper-br/pull/5) — Commit [`2a7d0c0`](https://github.com/LeoBorba12/Scrapper-br/commit/2a7d0c0ed2f40bc618dec8b7c1fb0c19b23ba058))  
**Alinhamento Estratégico:** Perplexity (Consultor Técnico Sênior) & Gemini Argon  
**Padrão de Interface:** Editorial 2026 (WCAG 2.2 AA)  

---

## 1. 🎯 Escopo & Objetivos Cumpridos

A Fase 3 do Módulo Canônico de Clubes teve como propósito expandir a profundidade analítica dos clubes catalogados, implementando duas frentes complementares:
1. **Dossiê Institucional Confiável**: Apresentação de metadados institucionais (estádio, capacidade oficial, data de fundação, presidente, treinador, títulos e cobertura no acervo).
2. **Curva de Momento & Tendência Tática**: Análise temporal recente (recortes de 5, 10 ou 20 partidas finalizadas), mensuração de dispersão (desvio padrão de consistência ofensiva/defensiva) e distribuição temporal de gols em intervalos de 15 minutos.

---

## 2. 🛠️ Arquitetura e Implementações Técnicas

### 2.1 Backend Canônico (`backend/rotas_clubes_canonica.py`)

#### A. Endpoint `GET /api/clubes/detalhe/<clube_id>/dossie`
- **Fontes de Dados**: Junção das tabelas relacionais `dim_clube` e `clubes_perfil`.
- **Princípio da Honestidade de Dados**: Atributos cadastrais não preenchidos ou vazios são categoricamente identificados com o rótulo `"Não catalogado"`. Em hipótese alguma valores fictícios ou zeros arbitrários são imputados.
- **Estrutura Retornada**:
  - `identificacao`: ID, nome canônico, sigla, estado/UF.
  - `perfil_institucional`: ano de fundação, estádio oficial, capacidade oficial, presidente, treinador.
  - `acervo_historico`: total de partidas catalogadas, primeiro e último ano documentados.
  - `conquistas_catalogadas`: relação dos principais troféus documentados no schema.

#### B. Endpoint `GET /api/clubes/detalhe/<clube_id>/tendencia`
- **Parâmetros**: `jogos=5|10|20` (default: 10) e `campeonato` (opcional).
- **Deduplicação Determinística**: Utilização do algoritmo canônico `_obter_jogos_deduplicados_clube()` para garantir integridade unívoca de cada partida.
- **Exclusão de Partidas Agendadas**: Jogos futuros ou sem placar finalizado são estritamente excluídos da curva de momento.
- **Métricas Consolidadas**:
  - Aproveitamento percentual (`aproveitamento_pct`).
  - Médias por partida: `gols_pro_medio`, `gols_contra_medio`, `saldo_gols`.
  - Sequência cronológica de resultados recentes (`resultados_sequencia`: `["V", "E", "D", ...]`).
- **Análise de Dispersão Estatística**:
  - Cálculo de desvio padrão amostral via `statistics.stdev()` para gols marcados (`desvio_padrao_gols_pro`) e gols sofridos (`desvio_padrao_gols_contra`).
- **Distribuição Temporal de Gols (Minutagem)**:
  - Agregação em 6 janelas de 15 minutos: `1-15'`, `16-30'`, `31-45+'`, `46-60'`, `61-75'`, `76-90+'`.

---

### 2.2 Suíte de Testes TDD (`tests/test_clube_dossie_tendencia_api.py`)

Foram desenvolvidos 10 testes determinísticos cobrindo:
1. `test_dossie_clube_existente_contrato_valido`: Validação de schema e tipos de dados do Dossiê.
2. `test_dossie_rotulagem_honesta_campos_vazios`: Garantia de rotulagem `"Não catalogado"` para ausências.
3. `test_dossie_clube_inexistente_retorna_404`: Tratamento resiliente de HTTP 404.
4. `test_tendencia_clube_existente_contrato_valido`: Validação de schema e campos da tendência tática.
5. `test_tendencia_respeita_limite_jogos`: Garantia de conformidade com os recortes (5, 10, 20).
6. `test_tendencia_exclusao_partidas_agendadas`: Exclusão de partidas sem placar finalizado.
7. `test_tendencia_deduplicacao_partidas`: Verificação de unicidade das partidas analisadas.
8. `test_tendencia_distribuicao_temporal_faixas`: Validação das 6 faixas de minutagem.
9. `test_tendencia_desvio_padrao_consistencia`: Validação matemática dos desvios padrão ofensivo/defensivo.
10. `test_tendencia_clube_inexistente_retorna_404`: Tratamento de 404 para curva de tendência.

---

### 2.3 Frontend Editorial 2026 (`frontend/src/components/ClubDetailView.jsx`)

- **Navegação Integrada**: Botão `Dossiê & Tendência` adicionado com ícone `Sparkles` no menu do clube.
- **Seletor Tátil de Recorte**: Alternância dinâmica entre 5, 10 e 20 partidas.
- **Grid Editorial 2 Colunas**:
  - **Coluna 1 (Dossiê)**: Cards estruturados com Fundação, Estádio & Capacidade, Presidente, Treinador, Acervo de Partidas e Vitrine de Conquistas em badges elegantes.
  - **Coluna 2 (Momento Recente)**: KPIs de Aproveitamento, Médias por Jogo, Saldo de Gols, Sequência Cronológica (V, E, D) e Consistência Tática baseada em desvio padrão com chips semânticos.
- **Visualização de Gols por Tempo**: Barras comparativas de gols marcados (Verde Oliva `#15803D`) vs sofridos (Vermelho Terracota `#DC2626`) por faixa de 15 minutos.
- **Tabela Cronológica**: Lista analítica dos jogos da amostra com data, competição, mando, placar e indicador de resultado.
- **Acessibilidade**: Conformidade com WCAG 2.2 AA e paleta Areia (`#F1E8DE`) e Carvão Quente (`#1B1A17`).

---

## 3. 🛡️ Guardrails e Governança

| Guardrail / Métrica | Valor / Estado | Meta / Teto | Status |
| :--- | :---: | :---: | :---: |
| **Tamanho da Base `data/futebol.db`** | **81,28 MB** | $\le 94,00\text{ MB}$ (Vercel) | ✅ Aprovado (12.72 MB livres) |
| **Mutação de Schema** | 0 alterações DDL | Invariante | ✅ Preservado |
| **Integridade Relacional** | 12/12 regras OK | 100% OK | ✅ Aprovado |
| **Pull Request** | [#5](https://github.com/LeoBorba12/Scrapper-br/pull/5) | Mergeado na `main` | ✅ Concluído |
| **Decisão de Arquitetura** | ADR-011 | `.memory/decisions.md` | ✅ Registrado |
| **Handoff de Continuidade** | Seção 1.4 | `HANDOFF_LINUX.md` | ✅ Registrado |
| **Log de Auditoria** | Auditoria 2026-11-16 | `.memory/audit-log.md` | ✅ Registrado |

---

## 4. 🚀 Próximas Frentes Recomendadas

1. **Inspeção Visual Final na URL de Produção Vercel**:
   - `https://scrapper-br.vercel.app/?tab=clube&id=2459&sub=dossie` (Palmeiras)
2. **Avanço para Opção 2**:
   - Comparador de Clubes / Head-to-Head Avançado e Cruzamento Histórico.
