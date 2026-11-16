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

## ADR-004: Restrição de Tamanho Serverless na Vercel (Teto: 94,00 MB | Soft Limit: 84,00 MB | Meta: 80,00 MB)
- **Status**: Implementado e Ativo
- **Contexto**: O limite máximo para funções serverless na Vercel exige bundle de deploy compacto. O teto oficial padronizado é 94,00 MB, com soft limit operacional em 84,00 MB e meta saudável de 80,00 MB.
- **Decisão**: Manter estritamente uma única base `data/futebol.db` (com arquivamento frio de tabelas brutas em `data/futebol_cold.db.gz`), `PRAGMA journal_mode = DELETE;` e ignorar no `.vercelignore` cópias, dumps e caches brutos de raspagem.

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

## ADR-008: Resolução de Caminho SQLite e Imutabilidade Serverless na Vercel
- **Status**: Implementado e Aprovado
- **Contexto**: No ambiente serverless da Vercel (AWS Lambda sob o capô), o CWD pode variar entre invocações e o filesystem da task é estritamente read-only, disparando `sqlite3.OperationalError: unable to open database file` se a conexão tentar abrir em modo leitura/escrita padrão ou se o caminho relativo falhar. Além disso, regras no `.vercelignore` têm precedência sobre `includeFiles` do `vercel.json`.
- **Decisão**:
  1. Remover `data/futebol.db` do `.vercelignore` para empacotamento mandatório na lambda da API.
  2. Padronizar em todos os blueprints a função utilitária `_find_db_path()` testando recursivamente caminhos candidatos (`ROOT_DIR/data`, `/var/task/data`, `BASE_DIR/../data`).
  3. Abrir a conexão SQLite no ambiente Vercel com URI formatada em modo imutável `file:{path}?immutable=1` com fallback para `mode=ro`, eliminando bloqueios de concorrência e exigências de lock em disco read-only.

## ADR-009: Módulo Canônico de Confrontos Diretos (H2H) e Governança de Scripts da VM
- **Status**: Implementado e Aprovado na main
- **Contexto**: Necessidade de fornecer cruzamento analítico histórico entre dois clubes quaisquer (Head-to-Head) utilizando a base canônica íntegra de 115.754 partidas, além de automatizar backups e tuning operacional na VM Oracle sem impactar a stack L-Addon.
- **Decisão**:
  1. Criar `backend/rotas_h2h_canonica.py` acoplado ao `app.py` sob o blueprint `rotas_h2h_canonica_bp`, com endpoints `/api/confrontos/h2h`, busca rápida e métricas agregadas (vitórias, gols, mando, sequência histórica, projeção bivariada Dixon-Coles calibrada e Fair Odds).
  2. Implementar `scripts/backup_sqlite_vm.sh` com `sqlite3 .backup` determinístico, verificação de integridade (`PRAGMA integrity_check`) e rotação de retenção.
  3. Implementar `scripts/sqlite_vm_tuning.py` para aplicação controlada de `PRAGMA journal_mode=WAL`, `mmap_size` e `cache_size` no SQLite da VM.
  4. Garantir 100% de aprovação na suíte `tests/test_h2h_canonica_api.py`.

## ADR-010: Scanner de Anomalias de Valor Esperado (+EV) e Alertas Editoriais no Telegram
- **Status**: Implementado e Aprovado na main (PR #4)
- **Contexto**: Necessidade de integrar o radar matemático de anomalias de odds (+EV) ao bot interativo de moderação no Telegram sem desvirtuar o FutStats para linguagem de tipster ou apostas comerciais.
- **Decisão**:
  1. Criar motor independente `backend/alertas_valor_esperado.py` calculando $EV = (P_{modelo} \times Odd_{mercado}) - 1$, com corte padrão de $+4.0\%$ e classificação de confiança editorial ("Alta" $\ge 8\%$, "Moderada" $\ge 5\%$).
  2. Aplicar guardrails obrigatórios: enquadramento estritamente jornalístico ("Ficha de Anomalia Estatística para Investigação"), ausência de jargão de apostas ("dica", "lucro certo"), links diretos para investigação no painel FutStats Web e notas metodológicas transparentes.
  3. Integrar comandos `/ev` e `/ev_alertas` no `scripts/bot_telegram_interativo.py`, adicionando botões dedicados ao teclado inline.
  4. Garantir 100% de aprovação na suíte TDD `tests/test_alertas_valor_esperado.py`.

## ADR-011: Dossiê Institucional e Curva de Momento & Tendência Tática (Fase 3 do Módulo Canônico de Clubes)
- **Status**: Implementado e Aprovado na main (PR #5)
- **Contexto**: Completar a visão analítica de clubes no padrão Editorial 2026, oferecendo tanto o dossiê cadastral confiável (fundação, estádio, capacidade oficial, presidente, técnico e troféus) quanto a modelagem temporal de momento (curva de forma recente, dispersão estatística de consistência e distribuição de gols por faixas de 15 minutos).
- **Decisão**:
  1. Implementar `GET /api/clubes/detalhe/<clube_id>/dossie` consolidando `dim_clube`, `clubes_perfil` e acervo histórico, rotulando ausências expressamente como `"Não catalogado"` (princípio da honestidade de dados, sem inventar zeros arbitrários).
  2. Implementar `GET /api/clubes/detalhe/<clube_id>/tendencia` com recortes paramétricos (5, 10, 20 jogos), deduplicação canônica via `_obter_jogos_deduplicados_clube()`, exclusão estrita de partidas agendadas/sem placar, desvio padrão amostral (`statistics.stdev`) e agregação de gols por 6 faixas de 15 minutos (`1-15'`, `16-30'`, `31-45+'`, `46-60'`, `61-75'`, `76-90+'`).
  3. Criar suíte TDD determinística em `tests/test_clube_dossie_tendencia_api.py` (10 testes) cobrindo contratos, guardrails de contagem e resiliência a 404.
  4. Integrar visualmente na aba interativa `subTab === 'dossie'` em `frontend/src/components/ClubDetailView.jsx` com seletores táteis de recorte, cards institucionais, KPIs de aproveitamento/saldo, badges de troféus e gráfico temporal de gols no padrão visual Editorial 2026 e WCAG 2.2 AA.
