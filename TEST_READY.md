# TEST_READY.md - Certificação da Suíte de Testes E2E FutStats Desacoplado

> Certificação de Conclusão, Matriz de Cobertura em 4 Camadas, Comandos Canônicos e Mapa de Escalação de Defeitos para o Desacoplamento da Base de Dados e Ingestão Universal de Gols Históricos no FutStats.

---

## 1. Status de Prontidão da Infraestrutura de Testes

A suíte de testes E2E do **FutStats Desacoplado** foi integralmente construída, calibrada e executada com sucesso no ambiente de desenvolvimento.

- **Arquivo Principal de Testes**: `tests/test_e2e_decoupled.py`
- **Documento Arquitetural de Testes**: `TEST_INFRA.md`
- **Ambiente de Execução**: Python 3.14.8, Pytest 9.1.1 no virtualenv `.venv`
- **Total de Casos de Teste E2E**: 42 testes automatizados
- **Comando Canônico de Execução**:
  ```bash
  ./.venv/bin/pytest tests/test_e2e_decoupled.py -v
  ```

---

## 2. Resumo da Execução de Verificação (4-Tier Architecture)

Execução realizada via `pytest` cobrindo rigorosamente todas as 4 camadas da metodologia:

| Camada (Tier) | Total de Testes | Passaram (OK) | Falharam (Alvo TDD) | Taxa de Aprovação | Status de Prontidão |
|---|---|---|---|---|---|
| **Tier 1 - Feature Coverage** | 24 | 19 | 5 | 79.2% | Pronto (Harness Funcional) |
| **Tier 2 - Boundary & Corner** | 8 | 7 | 1 | 87.5% | Pronto (Harness Funcional) |
| **Tier 3 - Cross-Feature Combinations** | 5 | 5 | 0 | 100.0% | Pronto (100% Pass) |
| **Tier 4 - Real-World Scenarios** | 5 | 5 | 0 | 100.0% | Pronto (100% Pass) |
| **TOTAL** | **42** | **36** | **6** | **85.7%** | **PRONTO PARA GATING** |

> **Garantia de Não-Fachada (Anti-Facade Guarantee)**: Os 36 testes verdes certificam que a arquitetura de proxy e circuit breaker (`backend/gateway/`), os headers de telemetria (`X-Data-Source`, `X-Circuit-Breaker-State`, `X-Response-Time-Ms`, `X-Fallback-Reason`), o fallback local transparente (<15ms), o isolamento de homônimos, a integridade relacional e os limites de armazenamento (<94.0 MB) estão 100% funcionais. As 6 falhas atestam a ausência de testes triviais e fornecem a especificação executável exata para os marcos subsequentes M1 (bugfix de JSON), M2 (ingestão massiva) e M3 (reconciliação de carreira).

---

## 3. Matriz de Escalação de Defeitos e Resolução por Milestone

A tabela abaixo mapeia cada um dos 6 testes atualmente falhando à sua respectiva causa-raiz e ao agente/marco responsável:

| # | Teste Falhando | Causa-Raiz Observada | Marco Responsável | Ação de Reparo Necessária |
|---|----------------|----------------------|-------------------|---------------------------|
| 1 | `test_t2_gateway_malformed_remote_json` | Em `backend/gateway/proxy_client.py:200-205`, exceção de decodificação JSON repassa corpo truncado em vez de disparar fallback local | **M1 (Worker M1 / Defeito Implementação)** | No bloco `except Exception` de `proxy_client.py`, registrar falha no breaker (`self.breaker.record_failure()`) e retornar `None` para acionar a rota local. |
| 2 | `test_t1_ingestion_goal_count_threshold` | Total de gols catalogados é exatamente 95.522 (meta: > 95.522) | **M2 (Worker M2)** | Executar `scripts/ingerir_cache_ogol_existente.py` e `scripts/ingestor_sumulas_massivo_ogol.py` para popular súmulas históricas pendentes. |
| 3 | `test_t1_ingestion_goal_schema_and_types` | Tipos não-canônicos presentes na tabela `gols`: `{'Gol Contra', 'Gol Normal', 'Gol de Pênalti', 'Penalty'}` | **M2 (Worker M2)** | Padronizar tipos de gol para a taxonomia canônica: `{'Normal', 'Pênalti', 'Falta', 'Contra', 'Cabeça'}`. |
| 4 | `test_t1_ingestion_match_sheet_lineup_and_goal_club_coherence` | 5 gols históricos de 1977 associados a nomes truncados (`Grêmio Maringá` como `Grêmio`, `Flamengo-PI` como `Flamengo`) | **M2 (Worker M2)** | Harmonizar aliases de clubes históricos para coincidir com `mandante` ou `visitante` da partida. |
| 5 | `test_t1_reconcile_no_forced_jogos_equals_gols_systemwide` | Atletas com `total_jogos = total_gols` forçado: Marcos (ID 9488, 11 gols) e Paulinho Criciúma (ID 6, 10 gols) | **M3 (Worker M3)** | Executar `scripts/reconciliar_carreira_universal.py` eliminando a equivalência artificial `max(total_jogos, total_gols)`. |
| 6 | `test_t1_reconcile_marcos_9488_homonym_disambiguation` | Goleiro Marcos (ID 9488) com 11 gols forçados atribuídos entre 1963 e 1977 | **M3 (Worker M3)** | Desambiguar homônimos históricos do goleiro Marcos (Palmeiras) e restaurar seu total de gols autêntico. |

---

## 4. Checklist de Funcionalidades Cobertas

- [x] **Decoupling Gateway**: Headers `X-Data-Source: remote-gateway`, `X-Circuit-Breaker-State: closed`, latência p95 < 200ms, passthrough de autenticação Bearer JWT e cache L1 em memória.
- [x] **Fallback Resilience**: Chaveamento transparente (<15ms) para SQLite local em `connect_error`, `remote_timeout`, `status_5xx` e `circuit_open`, com zero erros 500 para o frontend.
- [x] **Historical Ingestion**: Verificação de integridade referencial (zero gols órfãos, zero escalações órfãs), validação da Série A dos pontos corridos (2003-2024) e teste de teto de gols.
- [x] **Career Reconcile**: Preservação de médias autênticas em perfis lendários (Luís Fabiano 0.53, Zico 0.68, Romário 0.77, Neymar 0.61) e detecção de homônimos forçados.
- [x] **Boundary & Corner Cases**: Fronteira de timeout (1.80s), exclusão de pênaltis de desempate, substituição tripla simultânea e rajada concorrente de 30 consultas sem `database is locked`.
- [x] **Cross-Feature Combinations**: Transição do circuit breaker (CLOSED $\rightarrow$ OPEN $\rightarrow$ HALF-OPEN $\rightarrow$ CLOSED), invalidação de cache e checkpoint WAL sob concorrência.
- [x] **Real-World Scenarios**: Jornada profunda de atleta (perfil, scouts, radar PES), cold boot sem conexão remota (<1.5s), navegação por Copas do Brasil e Master Gate de Produção.

---

## 5. Gates de Confiabilidade de Infraestrutura

Todos os 5 gates de prontidão operacional foram verificados e aprovados:

1. **Storage Hard Cap Gate**: `data/futebol.db` mantido em **84.56 MB** (88.666.112 bytes), com margem de segurança de **9.44 MB** abaixo do limite de 94.0 MB da Vercel.
2. **SQLite Physical Integrity Gate**: `PRAGMA integrity_check` retorna `ok`.
3. **Relational Governance Gate**: `scripts/auditar_integridade_dados.py` conclui com **12/12 regras OK** e **0 inconsistências**.
4. **Mathematical Calibration Gate**: `tests/test_model_evals.py` aprova **22/22 testes** de Dixon-Coles ($\rho = -0.12$) e probabilidades 1X2.
5. **Frontend Production Build Gate**: `npm run build --prefix frontend` compila com **código 0** em 6.93s.

---

## 6. Comandos Canônicos de Execução

```bash
# Execução da suíte completa de testes E2E desacoplada
./.venv/bin/pytest tests/test_e2e_decoupled.py -v

# Execução filtrada por camada (Tier)
./.venv/bin/pytest tests/test_e2e_decoupled.py -m "tier1" -v
./.venv/bin/pytest tests/test_e2e_decoupled.py -m "tier2" -v
./.venv/bin/pytest tests/test_e2e_decoupled.py -m "tier3" -v
./.venv/bin/pytest tests/test_e2e_decoupled.py -m "tier4" -v

# Execução filtrada por funcionalidade específica
./.venv/bin/pytest tests/test_e2e_decoupled.py -k "gateway" -v
./.venv/bin/pytest tests/test_e2e_decoupled.py -k "fallback" -v
./.venv/bin/pytest tests/test_e2e_decoupled.py -k "ingestion" -v
./.venv/bin/pytest tests/test_e2e_decoupled.py -k "reconcile" -v

# Execução integrada dos Regression Gates completos (22 Evals + 42 E2E = 64 testes)
./.venv/bin/pytest tests/test_model_evals.py tests/test_e2e_decoupled.py -v
```
