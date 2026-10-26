# AGENTS.md - Diretrizes Operacionais dos Agentes (FutStats)

> Diretrizes para Agentes Autônomos e Assistentes AI (Antigravity & AAS Core)

## Context Routing & Subdiretórios
- `frontend/AGENTS.md` -> Regras de componentes, estilização, tokens e acessibilidade.
- `backend/AGENTS.md` -> Regras de rotas REST, SQLite, Dixon-Coles e performance.
- `.memory/` -> Memória histórica de decisões de arquitetura e padrões.

## Skills Instaladas (.agents/skills/)
1. `antigravity-skill-orchestrator`: Meta-skill para triagem de complexidade e combinação eficiente de ferramentas.
2. `design-token-contrast`: Auditoria matemática de contraste de cores (WCAG 2.2 AA).
3. `sql-optimization-patterns`: Tuning de queries e indexação em SQLite.
4. `telegram-bot-messaging`: Interação via botões inline e alertas estruturados no Telegram.
5. `hierarchical-agent-memory`: Arquitetura de contexto escopado e memória persistente.
6. `futstats-product-audit`: Auditoria completa de produto e UX da dashboard.
7. `web-design-guidelines`: Diretrizes de acessibilidade e design de interface.

## Regras de Execução Pre-flight
- Sempre verificar integridade de build (`npm run build`) antes de commitar mudanças no frontend.
- Nunca commitar chaves de API, credenciais ou duplicatas de arquivos `.db`.
- Manter o idioma da interface e código 100% em Português do Brasil (sem placeholders em inglês).
