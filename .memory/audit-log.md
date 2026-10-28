# Registro Histórico de Auditorias (Audit Log) - FutStats

## Auditoria 2026-10-26 (Sessão 3): Confiabilidade, Observabilidade e SLOs (`observability-monitoring-slo-implement`)
- **Skill Integrada**: `observability-monitoring-slo-implement` (SLIs, SLOs, Error Budgets e Governança de Alertas).
- **Quadro Formal Estabelecido**: Documentado em `.memory/slo-framework.md`:
  - **SLI-01 (Disponibilidade Vercel)**: $\ge 99.50\%$ (Error budget de 0.50% / mês).
  - **SLI-02 (Latência de Consulta)**: $p_{95} < 200\text{ ms}$ via cabeçalho `X-Response-Time-Ms` e cache TTL de 1800s.
  - **SLI-03 (Taxa de Sucesso de Scraping na VM)**: $\ge 99.00\%$ por janela de 24h com isolamento subprocess.
  - **SLI-04 (Governança de Alertas Telegram)**: 1 digest consolidado a cada 3 horas; alertas imediatos apenas sob quebra de SLO.
  - **SLI-05 (Teto de Armazenamento Serverless)**: $\le 94.0\text{ MB}$ com gatilho preventivo de `VACUUM` em 88.0 MB.
- **Achados Críticos e Correções na VM**:
  1. **Bug Crítico de NameError no Orquestrador**: Identificada a falta de `import datetime` em `scripts/orquestrador_mestre_24x7.py` que derrubava o ciclo ao disparar o digest de 3 horas. Corrigido.
  2. **Rastreamento de SLI-03 & SLI-05 no Orquestrador**: Implementada contagem de sucesso/falha de comandos, cálculo da taxa de sucesso e emissão de alerta imediato caso o SQLite atinja ou exceda o teto de 94 MB.
  3. **Mitigação de Tempestade de Alertas no Watchdog**: `scripts/monitor_vm_saude.py` corrigido com `COOLDOWN_CRITICO_SEG = 300` (5 minutos) para evitar envio a cada 30 segundos durante incidentes de RAM/swap.
  4. **Telemetria Ativa na API Flask**: Injetado timer de alta precisão em `backend/app.py` com cabeçalho `X-Response-Time-Ms` e rota `/api/health` inspecionando conectividade SQLite e latência de consulta (testado em 6.14ms, `slo_healthy: True`).
- **Status do Framework**: 100% operacional e validado.

## Auditoria 2026-10-26 (Sessão 2): Governança de Memória & Avaliação Contínua (`agent-evals`)
- **Skill Integrada**: `agent-evals` (Golden datasets, invariants matemáticos e regression gates).
- **Suíte de Testes Implementada**: `tests/test_model_evals.py` (22 casos de teste automatizados cobrindo Dixon-Coles 1997 e Poisson Bivariado).
- **Resultados e Métricas**:
  - **Normalização e Partição de Probabilidades**: 100% de conformidade ($\sum P_{1X2} = 100\% \pm 0.25\%$, $\sum P_{O/U} = 100\%$, $\sum P_{BTTS} = 100\%$) em todos os cenários (derby, super favorito, under defensivo, over franco, bordas extremas de clamp).
  - **Calibração Dixon-Coles ($\rho = -0.12$)**: Comprovada a inflação de empates clássicos (0-0 e 1-1) em relação ao Poisson independente ($\tau(0,0) > 1$ e $\tau(1,1) = 1.12$).
  - **Coerência de Odds Justas (Fair Odds)**: Bounded interval test validando a precisão entre odds contínuas e probabilidades discretizadas ($\pm 0.05\%$) e monotonicidade estrita ($P_1 > P_2 \implies Odd_1 < Odd_2$).
  - **Gating de Valor Esperado (+EV)**: Estritamente validado que $EV > 0$ se e somente se $odd\_mercado > fair\_odd$, garantindo consistência no motor preditivo de apostas.
  - **Robustez e Clamping de Borda**: Resiliência a entradas anômalas ($\lambda \le 0$ clamped em 0.25, $\lambda \ge 5$ clamped em 4.5) sem divisão por zero ou NaNs.
- **Status do Gate de CI**: 22/22 testes aprovados (100% de taxa de sucesso em 0.10s).

## Auditoria 2026-10-26: Adoção das 5 Skills do Repositório `sickn33/agentic-awesome-skills`
- **Skills Integradas**:
  1. `antigravity-skill-orchestrator`
  2. `design-token-contrast`
  3. `sql-optimization-patterns`
  4. `telegram-bot-messaging`
  5. `hierarchical-agent-memory`
- **Resultados da Execução**:
  - **Frontend/Contraste**: Todos os tokens de texto e acento contra todas as superfícies nos modos Claro (Areia) e Escuro (Carvão) atingiram 100% de conformidade WCAG 2.2 AA ($\ge 4.5:1$) e AAA ($\ge 7.0:1$).
  - **Base de Dados**: Consultas com JOIN de odds e partidas executando em ~12.95ms com índices compostos.
  - **Telegram Bot**: Adicionado teclado inline dinâmico com botões rápidos para `/status`, `/sniper`, `/ultimos` e `/banco`.
  - **Memória & Agentes**: Estrutura de memória hierárquica `.memory/`, `CLAUDE.md`, `AGENTS.md` e roteamento de subdiretórios operacional.

## Auditoria 2026-10-25: Eliminação do Sooma & Mapeamento Espacial
- Limpeza de 1.872 linhas de código legado.
- Criação de `AuthView.jsx`, `SpatialPitchMap.jsx` e `GoalMouthMap.jsx`.
- Deploy na Vercel verificado (HTTP 200 OK).

## [2026-10-26] Restauração Profunda de Integridade de Dados & Telemetria Honesta
- **Desambiguação Canônica de Homônimos**: Identificado que o agrupamento ingênuo por `nome_exibicao` ('Fred') unificava Frederico Chaves Guedes (Fluminense/Cruzeiro/Atlético-MG) com Fred (Inter - 90001), Fred (Zagueiro Goiás/Grêmio - 90002) e Fred (Anos 70 Vasco/Figueirense/Botafogo - 90003). Higienizados 213 gols e cartões vinculados a 6051.
- **Auto-healer de Clubes Invertidos**: Identificados e corrigidos 2.227 gols em que scrapers atribuíram o clube ao mandante em partidas cujo mandante fez 0 gols (ex: Caracas 0 x 1 Fluminense e Cerro Porteño 0 x 1 Fluminense atribuídos a Caracas/Cerro Porteño em vez do Fluminense).
- **Radar Pentagonal PES com Normalização de Escala**: Substituído o cálculo flat `item.valor / 100` (que comprimia todos os atletas em um polígono plano quase idêntico) por escala com baseline 40 estilo Winning Eleven (`pct = 0.20 + ((val - 40)/59) * 0.80`), gerando perfis poligonais taticamente divergentes para cada atleta.
- **Erradicação de Mockups Simulados Falsos**: Removidos chutes e zonas térmicas simuladas hardcoded de `SpatialPitchMap.jsx` e `GoalMouthMap.jsx`. Implementada salvaguarda de "Honestidade de Dados" que exibe painel transparente de telemetria quando o confronto histórico não possuir tracking ótico por câmeras.
- **Auditoria Automatizada Expandida**: `scripts/auditar_integridade_dados.py` atualizado com 10 verificações automáticas com auto-reparo. 22/22 testes de regressão verdes (`pytest tests/test_model_evals.py`).

## [2026-10-26] Implementação do Manual de Eficiência & Arquitetura RepoBrain
- **Diretrizes Universais de Agentes**: Integradas ao `AGENTS.md` e `CLAUDE.md` com 4 pilares: Gestão de Tokens & Contexto (leituras cirúrgicas), Padrões Anti-Slop (escala 4px/8px, WCAG AA+, microinterações), Exploração de Dados (resumos executivos) e Resolução na Causa-Raiz (sem remendos superficiais).
- **Mapa Modular de Contexto (`.memory/context-map.md`)**: Estruturado o índice completo dos 6 subsistemas (Frontend, Backend, Dados/SQLite, Scripts 24x7, Testes e Memória) para roteamento com baixo consumo de tokens.
- **Prompts Modulares de Ativação Rápida**: Formalizados os modos `[MODO FRONTEND]`, `[MODO DADOS]` e `[MODO DEVOPS]`.
- **Validação de Pre-flight**: Testes de modelos (22/22 verdes), auditor de integridade (10 regras) e build do frontend (`npm run build`) 100% verificados.

## [2026-10-28] Pilar 4 (Comparador Head-to-Head) & Saneamento Definitivo de Atletas
- **Pilar 4 (Comparador de Atletas)**: Implementado `/api/jogadores/comparar` e componente `AthleteCompareView.jsx` com busca dupla por atleta, radar pentagonal SVG estilo Winning Eleven, barras proporcionais de métricas e badges de presets (Romário x Neymar, Gabigol x Pedro, etc). Corrigida autenticação via `futstats_auth_token` para evitar 401 na Vercel.
- **Saneamento Definitivo de Carreira de Atletas**:
  - Resolução da causa-raiz no parser OGol (`scraper_ogol_carreira_atletas.py` e `agente_especialista_jogadores.py`) com mapeamento dinâmico de `<th>` para carreira completa (evitando capturar a temporada corrente `2026` como se fosse o histórico total).
  - Consolidação de homônimos (`scripts/consolidar_homonimos_atletas.py`): Neymar unificado de 4 IDs em 1 canônico (`352`), subindo acervo nacional para 126 gols.
  - Implementado Golden Truth Dataset (`data/golden_truth_atletas.json`) e script reconciliador (`scripts/reconciliar_golden_truth.py`): Neymar com 439g/719j/279a, Romário com 744g/961j, Gabigol com 246g/530j/75a, Pelé, Zico, Fred, Cano, Hulk, Pedro e Arrascaeta 100% calibrados.
  - Travas de sanidade no backend (`backend/app.py`): carreira oficial mundial $\ge$ acervo nacional.
- **Governança da VM e Auditoria Contínua**:
  - Atualizado `docs/GOVERNANCA_E_DIRETRIZES_VM.md` (seção 4.1).
  - Criado `scripts/auditar_sanidade_atletas.py` e integrado na Fase C do `scripts/orquestrador_mestre_24x7.py` (auto-reparou 196 inconsistências herdadas no banco).
- **Validação de Pre-Flight**: 22/22 pytest aprovados, frontend buildado em 6.8s, 115.356 partidas íntegras e banco SQLite em 84.8 MB. Commits `8338a5e` e `105c522` enviados para produção na Vercel (`main`).


## [2026-10-28] Extensão do Pilar 4: Filtros de Competição no Comparador Head-to-Head
- **Backend (`backend/app.py`)**:
  - Implementado `_obter_condicao_campeonato()` e parâmetro `campeonato_filtro` em `_construir_perfil_jogador()` e rota `/api/jogadores/comparar`.
  - Suporte a 5 escopos táticos: `todos` (Carreira Completa / Acervo Geral), `brasileirao` (Série A e unificados), `copa_do_brasil` (mata-mata nacional), `libertadores` (Conmebol) e `estaduais` (Paulista, Carioca, etc.).
  - Recálculo dinâmico do **Radar Dual PES (OVR)**, tabela de scouts, métricas de gols decisivos (80'+), aproveitamento de pontos e histórico de confrontos diretos restritos à competição selecionada.
- **Frontend (`frontend/src/components/AthleteCompareView.jsx`)**:
  - Nova barra de escopo com botões táteis (Bento UI) para seleção instantânea de torneio.
  - Sincronização automática com preservação do filtro ao trocar de atletas, usar presets de duelos ou inverter posições (swap).
  - Badges dinâmicos de escopo ativo no card de resumo e cabeçalhos contextuais.
- **Pre-Flight de Confiabilidade**: 22/22 pytest aprovados, integridade do banco (84.82 MB < 94 MB) e build do frontend concluído em 4.79s.

## [2026-10-28] Pilar 2 (Raio-X Avançado de Árbitros & Disciplina) & Restabelecimento do Bot Telegram
- **Bot do Telegram Restabelecido**:
  - Diagnosticada fila de mensagens pendentes (update `/status` no chat `1797566691`) devido à interrupção do daemon após reinício de sessão.
  - Testada API Telegram (`getMe`, `sendMessage`), processada a fila e iniciado o `scripts/bot_telegram_interativo.py` como daemon contínuo em background.
- **Pilar 2: Raio-X Avançado de Árbitros & Disciplina**:
  - **Backend (`backend/app.py`)**:
    - Rota `/api/arbitros/destaques` expandida com: média de cartões, proporção de cartões no 2º tempo (`pct_cartoes_2t`), média de penalidades marcadas (`media_penaltis`), índice de rigor calibrado (0 a 100) e probabilidade Poisson de Over 4.5 cartões.
    - Rota `/api/arbitros/perfil` expandida com telemetria atômica: distribuição por tempo (1T vs 2T), distribuição por mando (mandante vs visitante), histograma de minutagem em faixas de 15 minutos, motivos de súmula e tabela de aproveitamento/cartões dos clubes mais apitados.
  - **Frontend (`frontend/src/components/RefereeScoutView.jsx`)**:
    - Novo componente editorial 2026 dedicado à aba Arbitragem.
    - 4 KPIs analíticos do acervo: Árbitro Mais Rigoroso, Maior Média de Pênaltis, Viés do Mandante e Pico no 2º Tempo (~60% dos cartões saem após o intervalo).
    - Tabela master com busca em tempo real, chips rápidos e filtros por rigor.
    - Visão Raio-X aprofundada com barra comparativa 1T vs 2T, equilíbrio de mando e tabela de rendimento por clube.
- **Validação de Pre-Flight**: 22/22 pytest aprovados, integridade do banco (84.82 MB < 94 MB) e build do frontend concluído em 7.99s.
