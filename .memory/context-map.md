# context-map.md - Mapa Modular de Contexto (Padrão RepoBrain)

> Índice de Roteamento Cirúrgico para Agentes e LLMs (Economia de Tokens e Navegação Rápida)

---

## 1. Visão Geral dos Subsistemas

```
FutStats Workspace
├── frontend/               -> Aplicação SPA React 18 + Vite (Design Editorial 2026)
├── backend/                -> API REST Flask + Dixon-Coles + SQLite Engine
├── data/                   -> Banco de dados mestre (futebol.db < 95MB) e caches
├── scripts/                -> Daemons 24x7, automações, scrapers e auditores de integridade
├── tests/                  -> Suítes de regressão estatística e testes de modelos
├── .agents/skills/         -> Skills especializadas instaladas
└── .memory/                -> Memória hierárquica (ADRs, padrões, logs e SLOs)
```

---

## 2. Mapa Detalhado por Módulo

### A. Frontend (`frontend/src/`)
* **Ponto de Entrada:** `main.jsx` e `App.jsx` (Orquestração de abas, estado de autenticação e layout principal).
* **Design Tokens & Estilização:** `tokens.css` (Cores da paleta Areia/Carvão, tipografia, bordas e sombras) e `index.css` (Utilitários globais).
* **Shell da Aplicação:** `components/AppShell.jsx` (Navegação lateral, cabeçalho de status da VM e alternador de tema).
* **Visualizações Principais (Views):**
  * `components/HomeMatchdayView.jsx`: Cockpit da rodada, partidas ao vivo, previsão meteorológica INMET e placares.
  * `components/BettingHubView.jsx`: Radar de valor esperado (+EV), backtest de lucratividade e filtro de odds.
  * `components/ProtagonistaAtleta.jsx`: Perfil do atleta, histórico por clubes, vítimas e abas cronológicas.
  * `components/EditorialClubes.jsx`: Tabela de classificação editorial, forma recente e métricas defensivas.
  * `components/GuiaProfissionalView.jsx`: Central de documentação, manuais operacionais e metodologias.
* **Componentes Gráficos & Espaciais:**
  * `components/charts/RadarPentagonPES.jsx`: Radar pentagonal estilo Winning Eleven (Ataque, Finalização, Criação, Físico, Defesa) com baseline normalizado.
  * `components/SpatialPitchMap.jsx`: Visualizador de campo com telemetria ótica (shotmap e heatmap).
  * `components/GoalMouthMap.jsx`: Visualizador frontal da trave (7.32m x 2.44m) com zonas de arremate.

### B. Backend (`backend/`)
* **Aplicação Principal:** `backend/app.py`
  * `/api/partidas/hoje` & `/api/partidas/dia`: Jogos da data com placar, previsões de chuva e vento.
  * `/api/jogadores/perfil`: Perfil canônico do atleta (desambiguado por era), histórico de gols e vítimas.
  * `/api/apostas/hub`: Oportunidades +EV calculadas via Dixon-Coles e Poisson bivariado.
  * `/api/arbitragem`: Scout disciplinar de árbitros (médias de cartões amarelos e vermelhos).
  * `/api/auth/*`: Autenticação JWT com decorators `@require_auth`.
* **Banco de Dados:** Conexão otimizada SQLite via `get_db()`, `PRAGMA journal_mode=WAL;` e timeout de 15s.

### C. Dados & Banco SQLite (`data/futebol.db`)
* **Tabelas Principais:**
  * `partidas`: 115.557 partidas de 1959 a 2026 (mandante, visitante, placar, data, campeonato, estádio, clima).
  * `gols`: Gols catalogados com minuto, atleta, tipo de gol e `id_jogador` relacional.
  * `cartoes`: Registros disciplinares com minuto, motivo, posição e `id_jogador`.
  * `escalacoes`: Escalações com camisa, titularidade, capitão e `cbf_id`.
  * `jogadores_estatisticas`: 22.000+ perfis de atletas (totais de gols, jogos, clubes e carreiras oficiais).
  * `odds_partidas`: Cotações históricas de abertura e fechamento para 1X2, BTTS e Over/Under.

### D. Scripts & Daemons 24x7 (`scripts/`)
* **Orquestração 24x7:** `orquestrador_mestre_24x7.py` (Supervisiona coleta de resultados, odds e previsão do tempo na VM).
* **Bot do Telegram:** `bot_telegram_interativo.py` (Disparo de alertas +EV e interação via botões inline).
* **Auditor de Integridade:** `auditar_integridade_dados.py` (Executa 10 regras de validação relacional e auto-reparo).
* **Desambiguação Temporal:** `desambiguar_homonimos_temporal.py` (Clusteriza atletas por era e separa homônimos).
* **Auto-Healer de Gols:** `autoheal_gols_invertidos.py` (Corrige gols atribuídos a mandante/visitante com 0 gols).

### E. Testes & Regressão (`tests/`)
* `test_model_evals.py`: Suíte de regressão automatizada (22 testes cobrindo Dixon-Coles, soma de probabilidades = 1.0, Poisson bivariado, cálculo de margem +EV e gates de qualidade).

### F. Memória & Governança (`.memory/`)
* `decisions.md`: Registros de Decisão Arquitetural (ADR-001 a ADR-007).
* `patterns.md`: Padrões de código reutilizáveis no Front, Back e SQL.
* `audit-log.md`: Linha do tempo de auditorias e correções no acervo.
* `slo-framework.md`: Indicadores de Nível de Serviço (SLIs e SLOs de latência, disponibilidade e dados).
