# Master Plan: Saneamento Integral FutStats

## Objective
Sanear integralmente a relação jogos-gols, curadoria de carreira e clubes espúrios, enriquecimento de notas de scouting/Sofascore e métricas avançadas, mantendo o banco SQLite estritamente abaixo de 94.0 MB e 100% de conformidade com testes de regressão e auditoria de dados.

## Phases

### Phase 0: Survey & Technical Mapping
- Dispatch 3 Explorers in parallel:
  - Explorer 1: Banco de Dados, Súmulas, Histórico de Atletas e Scripts de Auditoria
  - Explorer 2: Backend REST, Motores de Cálculo (Dixon-Coles, Tanh, xG/Delta xG) e Testes de Regressão
  - Explorer 3: Frontend (ProtagonistaAtleta.jsx, Perfil de Atleta, Badges, Radar Pentagonal) e Build
- Synthesize findings into `PROJECT.md` at project root with full Feature Inventory and Interface Contracts.

### Phase 1: Milestone Decomposition & Track Architecture
- Implementation Track:
  - M1: Reconciliação Jogos-Gols e Rótulo Honesto de Catálogo (R1)
  - M2: Auto-Cura de Clubes Espúrios e Inversões Conmebol (R2)
  - M3: Enriquecimento de Notas de Scouting, Sofascore Ratings e Radar Pentagonal (R3)
  - M4: Otimização de Storage SQLite (<94.0 MB), VACUUM preventivo e Validação de Regressões (R4)
- E2E Testing Track:
  - Criar suíte de testes E2E opacos de 4 tiers (Feature Coverage, Boundary/Corner, Cross-Feature, Real-World) e emitir `TEST_READY.md`.

### Phase 2: Execution via Direct Iteration or Sub-orchestrators
- Cada milestone executa o ciclo: Explorer -> Worker -> Reviewers (x2) -> Challengers (x2) -> Forensic Auditor -> Gate.
- Final Milestone: Passar 100% dos testes E2E e endurecimento adversarial Tier 5.

### Phase 3: Final Acceptance & Reporting
- Validar os 4 pilares:
  1. pytest tests/test_model_evals.py (22/22)
  2. scripts/auditar_integridade_dados.py (12/12)
  3. npm run build na pasta frontend/ (código 0)
  4. data/futebol.db < 94.0 MB
- Enviar relatório final detalhado ao Sentinel (parent).
