# Relatório Oficial de Exposição Controlada das Métricas Avançadas (BED 2026)

**Fase:** Fase 5 — Exposição Controlada das Métricas Avançadas  
**Data da Homologação:** 06 de Novembro de 2026  
**Ambiente:** Produção (`backend/rotas_metricas_avancadas.py` + `frontend/src/components/MetricasAvancadasView.jsx`)  
**Banco Alvo:** `data/futebol.db` (82,65 MB / Folga de 1,35 MB até o Soft Limit)  
**Status dos Gates:** 100% APROVADO (30/30 Testes + 12/12 Auditoria Relacional)  

---

## 1. Parecer Executivo de Homologação

```
┌──────────────────────────────────────────────────────────────────────────────┐
│             PARECER EXECUTIVO DE EXPOSIÇÃO CONTROLADA (FASE 5)               │
│                                                                              │
│  [STATUS GERAL: HOMOLOGADO COM SUCESSO — 100% DOS CRITÉRIOS DE ACEITE]       │
│                                                                              │
│  1. Cobertura Analítica Homologada:                                          │
│     • 717 Atletas Elegíveis expostos por atleta_id_canonico.                 │
│     • 20 Clubes da Série A 2026 expostos por clube_id_canonico.               │
│     • Soma exata de gols exposta: 853,0 gols.                                │
│     • Soma exata de xG exposta: 856,4 xG.                                    │
│     • Minutos da liga expostos: 59.421 min (60.840 total liga - 1.419 bloq.) │
│                                                                              │
│  2. Blindagem e Segurança de Dados:                                          │
│     • 0 atletas em quarentena expostos.                                      │
│     • 0 atletas novos sem ID canônico expostos.                              │
│     • 0 coordenadas x/y, eventos brutos ou mapas do FotMob expostos.         │
│     • bed_id nunca é utilizado como chave primária pública.                  │
│                                                                              │
│  3. Arquitetura e Performance:                                               │
│     • API REST somente leitura com paginação, ordenação e filtros.           │
│     • Componente React moderno e modular com code-splitting sob demanda.     │
│     • Build frontend aprovado: npm run build sem erros.                      │
│     • Suíte completa de testes automatizados: 30/30 testes PASS.             │
│     • Auditoria relacional permanente: 12/12 regras OK (0 inconsistências).   │
└──────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Especificação Técnica dos Endpoints da API

O blueprint `metricas_avancadas_bp` foi implementado em `backend/rotas_metricas_avancadas.py` e conectado ao Flask em `backend/app.py`.

### 2.1. Sumário Executivo: `GET /api/metricas-avancadas/meta`
- **Descrição:** Retorna os agregados gerais da cobertura 2026 e a atribuição oficial.
- **Resposta:**
  ```json
  {
    "sucesso": true,
    "metadados": {
      "fonte": "brasileiraoemdados.com.br",
      "atribuicao": "Brasileirão em Dados / DataFutebol (Ioannis Canteiro) - tracking FotMob",
      "temporada": 2026,
      "competicao": "Campeonato Brasileiro Série A",
      "schema_versao": "v1.0-producao-2026",
      "atletas_elegiveis": 717,
      "clubes_participantes": 20,
      "soma_gols_atletas": 853.0,
      "soma_xg_atletas": 856.4,
      "soma_minutos_liga_elegiveis": 59421,
      "soma_minutos_individuais_atletas": 658192
    }
  }
  ```

### 2.2. Listagem de Atletas: `GET /api/metricas-avancadas/atletas`
- **Parâmetros Suportados:**
  - `clube_id_canonico` (int): Filtro por ID canônico do clube.
  - `posicao` (string): Busca textual por posição (ex: `'Atacante'`, `'Meia'`).
  - `minimo_minutos` (int): Minutagem mínima de corte (ex: `450`, `900`).
  - `ordenacao` (string): Campo de ordenação (`xg`, `npxg`, `xa`, `gols`, `passes_progressivos`, `sca`, `gca`, `finalizacoes`, `minutos`).
  - `ordem` (string): `'DESC'` (padrão) ou `'ASC'`.
  - `limite` (int): Máximo de registros por página (padrão 50, máx 717).
  - `pagina` (int): Índice da página (padrão 1).

### 2.3. Ficha do Atleta: `GET /api/metricas-avancadas/atletas/<int:atleta_id>`
- **Descrição:** Ficha analítica enriquecida com metadados do jogador, clube, Scouts nominais e Scouts normalizados por 90 minutos (`xg_por_90`, `xa_por_90`, `passes_prog_por_90`, `sca_por_90`, `gca_por_90`), além de sua linhagem de reconciliação.
- **Proteção:** Retorna `404 Not Found` caso o atleta pertença a quarentena ou não possua ID canônico.

### 2.4. Performance dos Clubes: `GET /api/metricas-avancadas/clubes`
- **Descrição:** Tabela dos 20 clubes da Série A 2026 contendo métricas de desempenho coletivo:
  - `jogos`, `vitorias`, `empates`, `derrotas`, `pontos`.
  - `gols_pro`, `gols_contra`, `xg`, `xg_contra`, `xpts`.
  - `posse_pct`, `field_tilt_pct`, `ppda`, `altura_defensiva`.
  - `saldo_xg_liquido` ($xG - xGA$).
- **Parâmetros:** `ordenacao`, `ordem`, `limite`, `pagina`.

### 2.5. Detalhe do Clube: `GET /api/metricas-avancadas/clubes/<int:clube_id>`
- **Descrição:** Retorna os dados táticos do clube e a lista completa do seu elenco com minutagem e métricas avançadas.

### 2.6. Rankings Multi-Métricas: `GET /api/metricas-avancadas/rankings`
- **Descrição:** Líderes individuais da Série A em métricas específicas.
- **Métricas Suportadas:** `xg`, `npxg`, `xa`, `passes_progressivos`, `sca`, `gca`, `gols`, `assistencias`.
- **Parâmetros:** `metrica` (ou `ordenacao`), `clube_id_canonico`, `posicao`, `minimo_minutos`, `limite`, `pagina`.

---

## 3. Arquitetura da Interface do Usuário (UI)

O módulo visual foi estruturado no componente `MetricasAvancadasView.jsx`:

1. **Rótulo Editorial Obrigatório:**
   - Destaque em badge oliva: `"Métricas Avançadas Complementares"`.
   - Título oficial: `"Brasileirão em Dados / DataFutebol"`.
   - Atribuição legal fixa: *"Fonte: brasileiraoemdados.com.br | Tracking FotMob | Curadoria: Ioannis Canteiro"*.
2. **Abas de Navegação:**
   - **Rankings de Atletas:** Tabela interativa com seletores rápidos de métricas, filtros de minutos mínimos ($\ge 90$, $\ge 450$, $\ge 900$, $\ge 1500$) e busca dinâmica por nome ou clube.
   - **Performance dos 20 Clubes:** Matriz tática completa com diferencial de $xG$ ofensivo/defensivo e gaveta de abertura rápida do elenco.
   - **Playercard Avançado:** Ficha de atleta com métricas absolutas e métricas por 90 minutos, indicando método de reconciliação canônica.
   - **Linhagem e Governança:** Painel transparente expondo a metodologia de isolamento, integridade relacional e limites de capacidade Vercel.
3. **Padrão Estético Editorial 2026:**
   - Cores: Paleta Areia (`#F1E8DE`), Carvão Quente (`#1B1A17`), Oliva (`#5A673E`) e Terracota (`#85573B`).
   - Tipografia: *Source Serif 4*, *Inter* e *JetBrains Mono*.
   - Acessibilidade: Conforme WCAG 2.2 AA (mínimo de 4.5:1 de contraste).

---

## 4. Tabela de Validações Obrigatórias da Fase 5

| Critério de Validação | Meta Exigida | Observado em Produção | Status |
|:---|:---:|:---:|:---:|
| **Atletas Disponíveis na API** | 717 | **717** | **PASS** |
| **Clubes Disponíveis na API** | 20 | **20** | **PASS** |
| **Atletas em Quarentena Expostos** | 0 | **0** | **PASS** |
| **Atletas Novos Expostos** | 0 | **0** | **PASS** |
| **Eventos Brutos / Coordenadas x,y Expostos** | 0 | **0** | **PASS** |
| **Soma de Gols nas Métricas Expostas** | 853,0 | **853,0** | **PASS** |
| **Soma de xG nas Métricas Expostas** | 856,4 | **856,4** | **PASS** |
| **Minutos Liga Atribuídos aos Elegíveis** | 59.421 min | **59.421 min** | **PASS** |
| **Partidas Canônicas Preservadas** | 115.753 | **115.753** | **PASS** |
| **Gols Canônicos Preservados** | 117.523 | **117.523** | **PASS** |
| **PRAGMA journal_mode** | `delete` | **`delete`** | **PASS** |
| **PRAGMA integrity_check** | `ok` | **`ok`** | **PASS** |
| **Tamanho Físico do Banco** | $< 84,00$ MB | **82,65 MB** (folga: 1,35 MB) | **PASS** |
| **Testes da API REST (`test_metricas_avancadas_api.py`)** | 8/8 | **8/8 PASS** | **PASS** |
| **Regression Gates Preditivos (`test_model_evals.py`)** | 22/22 | **22/22 PASS** | **PASS** |
| **Auditoria Relacional (`auditar_integridade_dados.py`)** | 12/12 | **12/12 OK** (0 inconsistências) | **PASS** |
| **Compilação do Frontend (`npm run build`)** | Sucesso | **Aprovado** (`15.96s`) | **PASS** |

---

## 5. Conclusão e Entrega da Fase 5

A **Fase 5** encerra o ciclo completo de avaliação, isolamento, reconciliação, carga controlada, governança de capacidade e exposição das métricas avançadas do **Brasileirão em Dados 2026**.

O sistema FutStats agora dispõe de dados preditivos e de tracking de classe mundial integrados com máxima fidelidade matemática, sem qualquer prejuízo à base canônica histórica e em total conformidade com os limites de infraestrutura da Vercel.
