# FutStats - Inteligência & Estatísticas do Futebol Brasileiro

> Contexto Global do Projeto (Hierarchical Agent Memory)

## Identidade & Arquitetura
- **Produto**: FutStats (Dashboard analítica e preditiva do futebol brasileiro com mais de 90.000 partidas, odds históricas e scouting).
- **Design System**: Editorial 2026 (Paleta Areia `#F1E8DE` / Carvão Quente `#1B1A17` / Verde Oliva `#5A673E` / Terracota `#85573B`). Tipografia *Source Serif 4*, *Inter* e *JetBrains Mono*.
- **Conformidade**: 100% WCAG 2.2 AA em todos os tokens e superfícies. Zero dependências pesadas de 3D desnecessárias.

## Roteamento de Contexto (Context Routing)
- → **Frontend (`frontend/`)**: React 18, Vite, CSS custom properties (`tokens.css`), componentes SVG espaciais (`SpatialPitchMap.jsx`, `GoalMouthMap.jsx`, `RadarPentagonPES`).
- → **Backend (`backend/`)**: Python Flask API REST, SQLite (`data/futebol.db`), calibração Dixon-Coles (1997) para probabilidades 1X2 e +EV, autenticação JWT.
- → **Scripts & DevOps (`scripts/`)**: Daemons 24x7 na VM Oracle Cloud (`orquestrador_mestre_24x7.py`, `bot_telegram_interativo.py`, `sniper.sh`), scrapers de eventing espacial (`spatial_scraper.py`).
- → **Testes & Avaliações (`tests/`)**: Suíte de regressão estatística (`test_model_evals.py`) com golden datasets para Dixon-Coles, integridade de probabilidades e +EV.
- → **Memória & Decisões (`.memory/`)**: Arquivo de decisões de arquitetura (`decisions.md`), padrões reutilizáveis (`patterns.md`) e registro de auditorias (`audit-log.md`).

## Invariantes & Restrições Inegociáveis
1. **Teto Serverless Vercel**: O bundle de deploy deve se manter estritamente abaixo de **95MB** (nunca commitar dumps de banco ou bases duplicadas na raiz).
2. **Qualidade Visual**: Não utilizar layouts genéricos ("AI slop") com tons lavanda/rosa. Preservar o visual de jornal desportivo clássico e técnico.
3. **Paridade Estatística**: Sempre manter paridade estrita de escopo entre "Carreira Oficial" e "Catálogo Brasileiro" no perfil dos atletas.
