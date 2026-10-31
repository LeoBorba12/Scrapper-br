# AGENTS.md - Diretrizes Operacionais dos Agentes (FutStats)

> Diretrizes Universais para Agentes Autônomos e Assistentes AI (Antigravity & AAS Core)

---

## 1. Diretrizes Universais de Atuação e Eficiência

### A. Gestão Rigorosa de Tokens & Janela de Contexto
- **Comunicação Direta:** Seja objetivo e técnico. Evite saudações protocolares, desculpas prolixas ou recapitulações redundantes.
- **Leitura Seletiva:** Nunca leia ou despeje arquivos inteiros desnecessariamente. Use `read_file` com ranges específicos (20–80 linhas) focando estritamente no trecho pertinente.
- **Edição Cirúrgica:** Ao modificar código, utilize `edit_file` substituindo o menor bloco contíguo necessário, sem transcrever seções intocadas.
- **Agrupamento de Operações:** Agrupe comandos e consultas quando possível para evitar turnos curtos e dispendiosos de conversação.

### B. Padrões de Design, UI e UX (Anti-Generic / Anti-Slop)
- **Identidade Editorial 2026:** Preservar a paleta Areia (`#F1E8DE`), Carvão Quente (`#1B1A17`), Oliva (`#5A673E`) e Terracota (`#85573B`). Proibido usar gradientes pastel lavanda/rosa genéricos.
- **Escala Espacial e Tipografia:** Espaçamentos consistentes na grade de 4px/8px. Hierarquia visual nítida (*Source Serif 4*, *Inter* e *JetBrains Mono*).
- **Contraste & Acessibilidade:** Conformidade obrigatória com WCAG 2.2 AA (mínimo de 4.5:1 para texto normal e 3:1 para controles).
- **Honestidade de Dados e Feedback:** Microinterações táteis (`.touch-tactile`), estados claros de loading (skeletons em vez de layout shift), empty states honestos e recusa terminante a mockups falsos que simulem telemetria.

### C. Análise e Exploração de Dados
- **Resumo Executivo Primeiro:** Ao inspecionar métricas do banco, apresente os 3 principais insights numéricos antes de expor tabelas completas.
- **Amostragem & Agregação:** Em bases volumosas (como as 115.000+ partidas), utilize amostragem estatística ou agregação prévia no SQLite em vez de despejar centenas de linhas.
- **Integridade Relacional:** Nenhuma partida, gol, odd ou cartão deve permanecer órfão ou com coerência quebrada (ex: clube marcado com 0 gols tendo gol atribuído).

### D. Resolução de Falhas na Causa-Raiz (Root Cause)
- **Nunca fazer remendos superficiais:** Se um dado exibe inconsistência na interface, investigue a origem no banco (`data/futebol.db`), scrapers ou API antes de criar gambiarras condicionais no React.
- **Diagnóstico em Camadas:** Identifique se a falha decorre de dados brutos, transformações no Flask ou renderização no frontend.

---

## 2. Prompts Modulares de Ativação Rápida

Quando acionado para tarefas específicas, adote a postura correspondente:

### `[MODO FRONTEND]` - Designer & Engenheiro de UI Sênior
- Defina tokens, hierarquia visual, espaçamentos e contraste WCAG AA+ antes de codificar.
- Priorize componentes modulares, tipografia editorial e microinterações táteis.
- Evite templates padronizados ou bibliotecas visuais pesadas desnecessárias.

### `[MODO DADOS]` - Engenheiro & Cientista de Dados Sênior
- Execute verificações de sanidade (valores nulos, outliers, integridade relacional).
- Forneça sumário executivo com os 3 principais números/tendências.
- Estruture saídas tabulares limpas e sugira a melhor representação visual (gráficos, radar normalizado, tabelas com colunas fixas).

### `[MODO DEVOPS]` - Engenheiro de Sistemas & Confiabilidade
- Inspecione logs de daemons (`orquestrador_mestre_24x7.py`), consumo de memória do SQLite e SLOs de latência.
- Assegure o teto de 95 MB no bundle da Vercel e estabilidade de daemons na VM Oracle Cloud.
- Forneça comandos precisos de verificação e planos de rollback imediato.

---

## 3. Roteamento de Contexto & Subdiretórios (RepoBrain Pattern)

Consulte o mapa modular completo em [`.memory/context-map.md`](file:///f:/Antigravity_Projetos_e_Ferramentas/Guia%20profissional/.memory/context-map.md) para localizar o arquivo exato antes de navegar:

- `frontend/AGENTS.md` $\rightarrow$ Regras de componentes, estilização, tokens e acessibilidade.
- `backend/AGENTS.md` $\rightarrow$ Regras de rotas REST, SQLite, Dixon-Coles e performance.
- `.memory/` $\rightarrow$ Memória histórica de decisões de arquitetura (`decisions.md`), padrões (`patterns.md`), auditorias (`audit-log.md`) e framework SLO (`slo-framework.md`).

---

## 4. Skills Instaladas (.agents/skills/)
1. `antigravity-skill-orchestrator`: Meta-skill para triagem de complexidade e combinação eficiente de ferramentas.
2. `design-token-contrast`: Auditoria matemática de contraste de cores (WCAG 2.2 AA).
3. `sql-optimization-patterns`: Tuning de queries e indexação em SQLite.
4. `telegram-bot-messaging`: Interação via botões inline e alertas estruturados no Telegram.
5. `hierarchical-agent-memory`: Arquitetura de contexto escopado e memória persistente.
6. `futstats-product-audit`: Auditoria completa de produto e UX da dashboard.
7. `web-design-guidelines`: Diretrizes de acessibilidade e design de interface.
8. `agent-evals`: Suítes de avaliação automatizada, datasets padrão ouro e regression gates.
9. `grill-me`: Entrevista estratégica pré-implementação para eliminar suposições e retrabalho.
10. `git-guardrails`: Proteção de repositório, bloqueio de comandos perigosos e vigilância do teto de 95 MB.
11. `karpathy-guidelines`: Simplicidade radical, diagnósticos de causa-raiz e modificações cirúrgicas mínimas.
12. `brainstorming`: Transforma ideias brutas em designs validados antes de qualquer implementação (Socratic dialogue, YAGNI, understanding lock).
13. `multi-agent-brainstorming`: Revisão sequencial por papéis (Challenger, Constraint Guardian, User Advocate) para blindar designs complexos.

---

## 5. Regras de Execução Pre-flight Obrigatórias
- **Build Frontend:** Sempre verificar `npm run build` na pasta `frontend/` antes de commitar.
- **Regression Gates:** Executar `pytest tests/test_model_evals.py` após qualquer alteração em cálculos preditivos, Dixon-Coles ou odds (22/22 testes obrigatórios).
- **Data Auditor:** Executar `python scripts/auditar_integridade_dados.py` para validar 10 regras de consistência relacional.
- **Teto Vercel:** Monitorar `data/futebol.db` mantendo o tamanho estritamente abaixo de **95 MB**.
- **Idioma Oficial:** 100% Português do Brasil na interface e mensagens.
