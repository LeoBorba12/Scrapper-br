# Architecture Decision Records (ADR) - FutStats

## ADR-001: Eliminação da Identidade Legada "Sooma" em favor do Design Editorial 2026
- **Status**: Implementado e Aprovado
- **Contexto**: O projeto continha resquícios de templates genéricos em inglês ("Alice James", gradientes lavanda/rosa) incompatíveis com a proposta de jornal esportivo de alto nível técnico.
- **Decisão**: Excluir completamente `SoomaFutStatsView.jsx` e tokens associados, adotando a paleta Areia (`#F1E8DE`) e Carvão Quente (`#1B1A17`) com tipografia *Source Serif 4*.

## ADR-002: Adoção do Modelo Preditivo Dixon-Coles (1997)
- **Status**: Implementado e Aprovado
- **Contexto**: A distribuição de Poisson bivariada ingênua subestimava empates em 0-0 e placares de baixa pontuação (1-0, 0-1, 1-1) no futebol brasileiro (~2.37 gols/jogo).
- **Decisão**: Aplicar o fator de correção de correlação $\tau_{\lambda, \mu}(x, y)$ com $\rho = -0.12$ na função `_calc_poisson_bivariate` em `backend/app.py`.

## ADR-003: Mapeamento Espacial em SVG Puro (Sem Dependências WebGL Pesadas)
- **Status**: Implementado e Aprovado
- **Contexto**: Gráficos 3D convencionais (Three.js/Babylon) consomem muita bateria e memória em dispositivos móveis e não agregam precisão analítica.
- **Decisão**: Renderizar o campo oficial FIFA ($105 \times 68\text{m}$) e a baliza frontal ($7.32 \times 2.44\text{m}$) diretamente em SVG com `<feGaussianBlur>` acelerado por GPU nativa.

## ADR-004: Restrição de Tamanho Serverless na Vercel (<95MB)
- **Status**: Implementado e Ativo
- **Contexto**: O limite máximo para funções serverless na Vercel é de 250MB descompactado / ~95MB compactado.
- **Decisão**: Manter estritamente uma única base `data/futebol.db` e ignorar no `.vercelignore` cópias, dumps e caches brutos de raspagem.

## ADR-005: Telegram Bot com Teclado Inline e Resposta a Callbacks
- **Status**: Implementado e Ativo
- **Contexto**: A digitação manual de comandos no Telegram reduzia a agilidade na moderação e no acompanhamento da VM Oracle.
- **Decisão**: Implementar `InlineKeyboardMarkup` e tratamento de `callback_query` no `bot_telegram_interativo.py` para acesso em 1 toque a status, sniper e banco de dados.

## ADR-006: Suíte de Avaliação Automatizada e Gates de Regressão Estatística (agent-evals)
- **Status**: Implementado e Aprovado
- **Contexto**: Mudanças em heurísticas ou código backend poderiam inadvertidamente quebrar axiomas probabilísticos (probabilidades não somarem 1.0, inversão de odds justas ou cálculo incorreto de +EV).
- **Decisão**: Instituir suíte de testes de regressão automatizada em `tests/test_model_evals.py` baseada em golden datasets, parametrização e gates determinísticos para calibração Dixon-Coles ($\rho = -0.12$), tolerâncias estritas e resiliência de borda.

## ADR-007: Framework Oficial de Confiabilidade e Governança de SLOs/SLIs
- **Status**: Implementado e Ativo
- **Contexto**: Falta de metas formais de nível de serviço para a API Vercel, risco de falha silenciosa no digest de 3 horas por bug de importação e potencial de tempestade de alertas no Telegram durante incidentes na VM Oracle.
- **Decisão**: 
  1. Formalizar o quadro de SLOs/SLIs em `.memory/slo-framework.md` cobrindo Disponibilidade Vercel ($\ge 99.5\%$), Latência $p_{95} < 200\text{ ms}$, Sucesso de Scraping 24x7 ($\ge 99.0\%$), Teto de Armazenamento ($\le 94.0\text{ MB}$) e Política Anti-Spam no Telegram (1 digest/3h; alertas fora do digest apenas sob violação de SLO).
  2. Implementar medição ativa de latência via cabeçalho `X-Response-Time-Ms` e rota de healthcheck detalhada em `/api/health`.
  3. Corrigir importação ausente de `datetime` no orquestrador mestre e adicionar cooldown de proteção contra flood crítico (mínimo 300s) no watchdog de saúde da VM.

