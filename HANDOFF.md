# 📋 HANDOFF DO PROJETO: SCRAPPER-BR / GUIA PROFISSIONAL (FUTSTATS)

> **Data de atualização:** 2026-10-28 19:11  
> **Status do repositório:** 100% Estável em produção na Vercel | 11/11 regras de integridade passando com 0 inconsistências | 22/22 testes de regressão Dixon-Coles/Poisson aprovados | Acervo com 115.361 partidas | Tamanho da base: 86.27 MB (estritamente abaixo do teto de 94.0 MB da Vercel).

---

## 1. 🎯 Objetivo do Projeto e Stack Utilizada

### Objetivo
Plataforma analítica e gerador de insights estatísticos profissionais sobre o **Futebol Brasileiro e Sul-Americano (1950–2026)** integrado a **Meteorologia Histórica (2015–2024)**, motor preditivo calibrado (**Dixon-Coles 1997 & Poisson Bivariado**), **Raio-X de Arbitragem**, **Comparador Histórico de Atletas com Reconciliação Canônica**, **Bot Interativo do Telegram 24x7** e motor de **IA Analista (NL-to-SQL)**.

### Stack Tecnológica
- **Frontend:**
  - React 18 (SPA com Vite)
  - Tailwind CSS + Lucide React
  - Identidade Visual Editorial 2026: Paleta Areia (`#F1E8DE`), Carvão Quente (`#1B1A17`), Oliva (`#5A673E`) e Terracota (`#85573B`)
  - Acessibilidade WCAG 2.2 AA/AAA em todos os contrastes de cor
  - HTML5 Canvas / `html2canvas` para renderização de cards em alta resolução
  - Visualizações especializadas: `RefereeScoutView.jsx`, `SpatialPitchMap.jsx`, `GoalMouthMap.jsx` e radar pentagonal tático
- **Backend:**
  - Python 3.12+ / Flask REST API modular com telemetria ativa (`X-Response-Time-Ms`)
  - Autenticação JWT (`PyJWT`) com hash seguro PBKDF2-HMAC-SHA256 e convites
  - Motor Estatístico Preditivo: Dixon-Coles 1997 com $\rho = -0.12$, Poisson bivariado, Fair Odds e cálculo de Valor Esperado (+EV)
  - IA Analista com suporte dual: Google Gemini (`google-genai` SDK) e DeepSeek API
  - Suporte a deployment serverless na Vercel via `api/index.py`
- **Banco de Dados:**
  - SQLite com arquitetura desacoplada e otimizações WAL:
    - `data/futebol.db` (115.361 partidas, 150.000+ gols, escalações, cartões, árbitros, resumo canônico) — **86.27 MB**
    - `data/clima.db` (histórico climático diário de 12 capitais brasileiras via `ATTACH DATABASE`)
    - `data/futebol_referencia.db` (**Banco de Referência Isolado**, protegido no `.gitignore`, contendo histórico canônico de atletas e clubes via Wikidata SPARQL API)
- **Daemons & Background:**
  - `scripts/bot_telegram_interativo.py`: Daemon 24x7 com botões inline, comandos `/status`, `/sniper`, moderação e alertas
  - `scripts/orquestrador_mestre_24x7.py`: Daemon na VM Oracle Cloud com isolamento de processos e digests a cada 3 horas

---

## 2. 🏗️ O que já foi feito (por Arquivo / Componente)

### Backend e APIs
- **`backend/app.py`:** API REST com endpoints otimizados:
  - `/api/overview`, `/api/h2h`, `/api/jogadores/search`, `/api/jogadores/perfil`, `/api/jogadores/destaques`
  - `/api/arbitros/destaques` e `/api/arbitros/perfil` (Raio-X de Arbitragem com rigor, viés de mando, 1T vs 2T, minutagem e Poisson de cartões)
  - `/api/oraculo/perguntar`, `/api/playground/executar`, `/api/clima/cruzamentos`, `/api/auth/*` e `/api/health`
- **`backend/ia_analista.py`:** Motor NL-to-SQL (Linguagem Natural para SQLite) com injeção de schema detalhado, sanitização estrita e síntese analítica esportiva.
- **`backend/auth.py`:** Autenticação JWT e hash PBKDF2 seguro.

### Frontend
- **`frontend/src/App.jsx`:** Aplicação central com abas analíticas estruturadas no padrão Editorial 2026:
  - **H2H (Confronto Direto):** Comparação histórica completa, aproveitamento, gols e lista de partidas.
  - **Jogadores:** Comparador lado a lado com radar tático normalizado (baseline 40 Winning Eleven), timeline canônica e partidas recentes de 2026.
  - **Arbitragem (`RefereeScoutView.jsx`):** Dashboard analítica dedicada com 4 KPIs mestres (Mais Rigoroso, Média de Pênaltis, Viés Mandante, Pico 2º Tempo), tabela master com filtros rápidos e Raio-X profundo por árbitro.
  - **Oráculo IA & Playground SQL:** Consultas assistidas por IA e console analítico customizado.
  - **Clima & Social Cards:** Cruzamentos meteorológicos e gerador de cards sociais para download.

### Validação, Sanidade de Dados e Avaliação de Modelos
- **`scripts/auditar_integridade_dados.py`:** Agente Automatizado de Integridade de Dados executando **11 regras de consistência relacional e auto-reparo**:
  - Regra 1: Gols numéricos nulos com placar existente (Auto-reparo).
  - Regra 2: Padronização de datas ISO YYYY-MM-DD.
  - Regra 3: Gols órfãos (sem partida correspondente).
  - Regra 4: Odds órfãs (sem partida correspondente).
  - Regra 5: Nomes de clubes mandante/visitante válidos.
  - Regra 6: Coerência lógica de vencedor vs placar final (Auto-reparo).
  - Regra 7: Detecção de confrontos duplicados na mesma data.
  - Regra 8: Consistência de partidas por temporada recente.
  - Regra 9: Gols atribuídos a times com placar zero (Auto-reparo de clube invertido).
  - Regra 10: Atletas artilheiros sem posição tática no perfil (Auto-inferência).
  - **Regra 11 (NOVA):** Coerência de clube em gols vs escalação oficial da partida (Auto-reparo contra inversão de adversário e auto-sincronização de perfis).
- **`tests/test_model_evals.py`:** Regression gate com **22/22 testes automatizados** validando o modelo matemático Dixon-Coles 1997 ($\rho = -0.12$), Poisson Bivariado, fair odds contínuas, partição de probabilidades ($\sum P = 100\%$) e gating de valor esperado (+EV).

---

## 3. 🔬 Reconciliação Canônica de Atletas & Ingestão 2026 (Hoje, 28/10/2026)

### Diagnóstico da Causa-Raiz de "Clubes Alienígenas"
Identificou-se que em scrapers antigos de súmulas, quando um gol era registrado em uma partida, a coluna `gols.clube` por vezes recebia o time adversário (ex: Neymar com gols marcados contra Atlético-MG, Peñarol e Bolívar constando com esses clubes em seu registro). Como o perfil do atleta agrupava os clubes distintos de `gols` e `escalacoes`, esses adversários passavam a figurar como clubes defendidos pelo atleta.

### Arquitetura de Reconciliação e Banco de Referência
Criado o banco isolado `data/futebol_referencia.db` (adicionado ao `.gitignore`) e o agente especializado `reference_data_agent` operado por `scripts/reference_database_manager.py`:
- **Coleta Canônica (Wikidata SPARQL API)**: Extrai contratos oficiais de clubes de cada atleta através da propriedade `P54` (*member of sports team*) e datas de vigência.
- **Diff Engine & Safe Dual-Cure**:
  - *Caso 1 (Inversão de Adversário)*: Se o gol foi registrado para o clube B, mas a partida foi Clube A vs Clube B e o atleta estava escalado pelo Clube A (pertencente à sua carreira canônica), o gol é curado cirurgicamente para o Clube A.
  - *Caso 2 (Homônimo)*: Se nem mandante nem visitante pertencem à carreira do atleta, o registro é isolado e desambiguado sem perda de dados.

### Execução das 4 Fases do Plano Mestre:
1. **Fase 1 (Piloto Unitário)**:
   - **Neymar**: Curados 5 gols invertidos para o Santos; purgados do perfil os clubes Atlético-MG, Atlético-GO, Bolívar, Peñarol e Red Bull Bragantino.
   - **Romário**: Desambiguação de Romário ID 12212 (150 gols por Flamengo, Fluminense, Vasco) vs Romário Lateral ID 101469; purgados registros fantasmas (`Romário 27`, `Romário pen`).
   - **Ingestão de Escalações 2026**: Atualizado `scripts/sincronizar_partidas_recentes_e_scouts.py` com parsing de rosters da ESPN API. Inseridas mais de 2.100 escalações de 2026, permitindo que Pedro, Gabigol e Hulk exibam partidas de outubro de 2026 no perfil.
2. **Fase 2 (Piloto Controlado - Top 50 Atletas)**:
   - 50 atletas auditados contra a base canônica.
   - 31 atletas corrigidos; **164 gols alienígenas curados cirurgicamente** (Marcelinho Carioca, Edmundo, Luís Fabiano, Dodô, Careca, Robinho, Paulo Baier).
3. **Fase 3 (Escala Total - Top 1.000 Atletas)**:
   - 1.000 atletas auditados em lotes controlados.
   - 478 atletas com discrepâncias; **1.043 gols alienígenas curados cirurgicamente** e reatribuídos aos seus clubes legítimos.
   - Sincronização determinística das colunas `clubes` e `total_gols` entre `jogadores` e `jogadores_estatisticas`.
4. **Fase 4 (Regra Permanente de Sanidade & Regression Gate)**:
   - Adicionada a **Regra 11** ao `scripts/auditar_integridade_dados.py` para bloquear/auto-reparar permanentemente qualquer gol atribuído ao adversário de uma partida em que o jogador estava escalado.
   - **Desambiguação de Gabriel Barbosa (Gabigol - ID 7)**: Desvinculadas 32 escalações e 1 gol de homônimos de outros clubes (Ceará, Juventude, Mirassol, Bragantino, Dourados, Criciúma). O perfil de Gabigol exibe estritamente **Santos, Flamengo e Cruzeiro**.
   - Todas as 11 regras validadas com 0 inconsistências no banco de produção.

---

## 4. 🎨 Decisões de Design & UI Editorial 2026

- **Paleta de Cores:**
  - Fundo Geral: Areia (`#F1E8DE`) no Modo Claro; Carvão Quente Profundo (`#1B1A17` / `#141311`) no Modo Escuro.
  - Cartões & Superfícies: Borda sutil `#E5DCD0` (claro) e `#2C2B27` (escuro), sem blur excessivo ou reflexos artificiais.
  - Acentos: Oliva Editorial (`#5A673E` / `#7D8D5C`) e Terracota Quente (`#85573B` / `#D48459`).
- **Tipografia:**
  - Títulos e cabeçalhos em *Source Serif 4* e *Inter*.
  - Números, odds e estatísticas em *JetBrains Mono*.
- **Microinterações:**
  - Classes `.touch-tactile` com `active:scale-[0.98]` e feedback de loading por skeletons (sem layout shift).
- **Acessibilidade:**
  - 100% dos contrastes em conformidade obrigatória com WCAG 2.2 AA (mínimo 4.5:1 para texto normal e 3:1 para controles).

---

## 5. ⚠️ Regras Críticas de Confiabilidade & Segurança

1. **Teto de 94.0 MB da Vercel para `data/futebol.db`:**
   - O banco atual possui **86.27 MB**, restando ~7.7 MB de folga segura.
   - O banco canônico `data/futebol_referencia.db` está no `.gitignore` e **NUNCA** deve ser adicionado ao git.
   - Sempre conferir o tamanho do arquivo antes de comitar:
     ```powershell
     python -c "import os; print(f'{os.path.getsize(\"data/futebol.db\")/(1024*1024):.2f} MB')"
     ```
2. **Pre-Flight Gates Obrigatórios Antes de Qualquer Commit:**
   - **Regression Gate do Modelo**: `python -m pytest tests/test_model_evals.py` (deve passar 22/22).
   - **Auditoria de Integridade**: `python scripts/auditar_integridade_dados.py` (deve retornar 0 inconsistências em todas as 11 regras).
   - **Build Frontend**: `npm --prefix frontend run build` (deve compilar sem erros de sintaxe ou imports quebrados).
3. **Telemetria e Bot do Telegram:**
   - O daemon do bot interativo (`scripts/bot_telegram_interativo.py`) deve permanecer rodando em background para processar comandos `/status`, `/sniper` e alertas.

---

## 6. 🚀 Próximos Passos Recomendados

1. **[CONCLUÍDO] Mobile & Microinterações Táteis (Drawer Tátil & Cards Responsivos)**:
   - Implementado componente `MobileBottomSheet.jsx` com backdrop blur, drag handle tátil, animação fluida e bloqueio de scroll.
   - `AthleteCompareView.jsx`: Drawer mobile para escolha de competições e duelos clássicos, grid de seletores responsivo e rolagem suave de chips.
   - `RefereeScoutView.jsx`: Drawer mobile com filtros de rigor e árbitros populares, alvos de toque >= 44px e visualização em cards responsivos no mobile.
2. **[CONCLUÍDO] Pilar 2: Hub de Apostas Avançado, Backtesting Quantitativo & Critério de Kelly**:
   - Endpoint `/api/apostas/backtesting`: Auditoria matemática comparando prognósticos do modelo Poisson/Dixon-Coles com placares reais de 10.924 partidas catalogadas. Métricas de acurácia (Green/Red), lucro acumulado em unidades (+U) e ROI por mercado (Over 1.5, Over 2.5, BTTS, 1X2, +EV).
   - Componente `KellyCalculatorModal.jsx`: Dimensionamento ótimo de apostas esportivas via Critério de Kelly ($f^* = (bp-q)/b$) com perfis de risco (Conservador 1/4 Kelly, Moderado 1/2 Kelly, Agressivo Full Kelly), cálculo de $+EV$ em R$, lucro líquido potencial e gestão de risco.
   - `BettingHubView.jsx`: Nova aba "Track Record & Backtesting" com bento grid de métricas, histórico de jogos auditados com selo Green/Red, e botão direto "Calcular Stake de Kelly" em cada card com aposta de valor (+EV).
3. **[CONCLUÍDO] Pilar 1.2: Expected Goals (xG) & Domínio Territorial (Field Tilt)**:
   - Backend (`backend/app.py`): Modelagem analítica de $xG$ de atletas calibrada para o futebol brasileiro (Pênalti $0.79$, Chutes no Alvo $0.315$, Chutes Fora $0.045$), computando Overperformance Clínica ($G - xG$), perfil de finalizador e taxa de conversão %.
   - Componente `FieldTiltBar.jsx`: Barra de Domínio Territorial no terço final e placar de chances reais ($xG$) no Raio-X do confronto (`BettingHubView.jsx`).
   - `ProtagonistaAtleta.jsx`: Card analítico com $xG$ estimado, Overperformance $G - xG$, taxa de conversão e badge editorial de eficiência finalizadora.
   - Comparador de Atletas (`AthleteCompareView.jsx` & `/api/jogadores/comparar`): Métricas de $xG$, $G - xG$ e Conversão de Finalizações inseridas na matriz comparativa.
4. **[CONCLUÍDO] Pilar 3: DataViz Interativa — Linha do Tempo de Atletas & Grandes Campanhas dos Clubes (Rodada a Rodada)**:
   - Endpoint `/api/clubes/campanha-historica`: Retorna a trajetória rodada a rodada de qualquer clube no Brasileirão (1959–2026), computando evolução cumulativa de pontos, aproveitamento %, gols pró/contra, saldo e placar de cada partida com presets das maiores campanhas da história (Flamengo 2019, Cruzeiro 2003, Corinthians 2015, Palmeiras 2022, Atlético-MG 2021, São Paulo 2006, etc.).
   - Componente `HistoricCampaignChart.jsx`: Gráfico vetorial SVG nativo interativo com curva cumulativa de pontos, área preenchida com gradiente editorial, bento grid de KPIs finais (Pontos, Aproveitamento %, Recorde V-E-D, GP, GC, Saldo), card dinâmico ao passar o mouse por cada rodada e trilha horizontal de jogos com badges coloridos de resultado (V/E/D).
   - Componente `AthleteCareerTimeline.jsx`: Linha do tempo horizontal tátil de atletas integrada em `ProtagonistaAtleta.jsx`, exibindo a progressão ano a ano com escudos dos clubes, estatísticas detalhadas (jogos, gols, média), badges de títulos e nós interativos.
   - `EditorialClubes.jsx`: Seção analítica com abas alternáveis entre "Grandes Campanhas (Rodada a Rodada)" e "Panorama Histórico por Décadas".
5. **Pilar 3.2: IA Analista com Grounding Refinado (NL-to-SQL)**:
   - Atualizar os prompts e schema injection em `backend/ia_analista.py` para consultar tabelas sanitizadas, $xG$ de atletas, métricas de arbitragem e backtesting.
6. **Pilar 5: Scouting & Social Sharing**:
   - Exportação de dossiê completo de scouting em PDF/PNG de alta resolução para atletas e clubes.



