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
