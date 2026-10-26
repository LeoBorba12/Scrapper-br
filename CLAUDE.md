# FutStats - Inteligência & Estatísticas do Futebol Brasileiro

> Contexto Global do Projeto (Hierarchical Agent Memory & RepoBrain Pattern)

---

## 1. Identidade & Arquitetura
- **Produto**: FutStats (Dashboard analítica e preditiva do futebol brasileiro com mais de 115.000 partidas, odds históricas e scouting).
- **Design System**: Editorial 2026 (Paleta Areia `#F1E8DE` / Carvão Quente `#1B1A17` / Verde Oliva `#5A673E` / Terracota `#85573B`). Tipografia *Source Serif 4*, *Inter* e *JetBrains Mono*.
- **Conformidade**: 100% WCAG 2.2 AA em todos os tokens e superfícies. Zero dependências pesadas de 3D desnecessárias.

---

## 2. Roteamento de Contexto Cirúrgico (RepoBrain)
Consulte [`.memory/context-map.md`](file:///f:/Antigravity_Projetos_e_Ferramentas/Guia%20profissional/.memory/context-map.md) antes de carregar arquivos.
- → **Frontend (`frontend/`)**: React 18, Vite, CSS custom properties (`tokens.css`), componentes SVG espaciais (`SpatialPitchMap.jsx`, `GoalMouthMap.jsx`, `RadarPentagonPES.jsx`).
- → **Backend (`backend/`)**: Python Flask API REST, SQLite (`data/futebol.db`), calibração Dixon-Coles (1997) para probabilidades 1X2 e +EV, autenticação JWT.
- → **Scripts & DevOps (`scripts/`)**: Daemons 24x7 na VM Oracle Cloud (`orquestrador_mestre_24x7.py`, `bot_telegram_interativo.py`), auditores de integridade (`auditar_integridade_dados.py`) e desambiguação temporal.
- → **Testes & Avaliações (`tests/`)**: Suíte de regressão estatística (`test_model_evals.py`) com golden datasets para Dixon-Coles, integridade de probabilidades e +EV (22/22 testes).
- → **Memória & Decisões (`.memory/`)**: Arquivo de decisões de arquitetura (`decisions.md`), padrões reutilizáveis (`patterns.md`), registro de auditorias (`audit-log.md`) e framework SLO (`slo-framework.md`).

---

## 3. Diretrizes de Eficiência e Atuação dos Agentes
1. **Gestão de Tokens:** Respostas diretas, sem introduções protocolares. Leituras parciais cirúrgicas via `read_file` (evitar ler arquivos de 1000+ linhas na íntegra).
2. **Padrões Anti-Slop:** Preservar a grade de 4px/8px, microinterações táteis e estados de carregamento estruturados. Proibido o uso de dados simulados/mockups que se passem por telemetria real.
3. **Análise de Dados:** Resumos executivos prévios (3 métricas chave) antes de apresentar saídas tabulares.
4. **Resolução na Raiz:** Investigar falhas diretamente no SQLite ou nas rotas Flask antes de criar contornos provisórios na interface.

---

## 4. Invariantes & Restrições Inegociáveis
1. **Teto Serverless Vercel**: O bundle de deploy deve se manter estritamente abaixo de **95MB** (o `data/futebol.db` deve permanecer compactado via `VACUUM` abaixo de 85MB).
2. **Qualidade Visual**: Não utilizar layouts genéricos ("AI slop") com tons lavanda/rosa. Preservar o visual de jornal desportivo clássico e técnico.
3. **Paridade Estatística**: Sempre manter paridade estrita de escopo entre "Carreira Oficial" e "Catálogo Brasileiro" no perfil dos atletas.
4. **Idioma Oficial**: 100% Português do Brasil na interface, logs e documentação.
