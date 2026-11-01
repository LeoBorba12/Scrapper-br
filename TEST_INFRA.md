# TEST_INFRA.md - Arquitetura de Testes E2E: Desacoplamento e Ingestão Universal FutStats

> Especificação Técnica de Infraestrutura de Testes, Matriz de Cobertura em 4 Camadas (Tiers 1-4) e Harness de Verificação para o Desacoplamento da Base de Dados e Ingestão Universal de Gols Históricos no FutStats.

---

## 1. Visão Geral e Filosofia de Testes

A suíte de testes E2E do **FutStats** (`tests/test_e2e_decoupled.py`) implementa uma abordagem rigorosa de **caixa-opaca (opaque-box testing)**, testando o comportamento observável do sistema através de suas interfaces públicas:
1. **Contrato HTTP REST**: Requisições de cliente, status codes HTTP, envelopes JSON de resposta e headers de telemetria (`X-Data-Source`, `X-Circuit-Breaker-State`, `X-Response-Time-Ms`, `X-Fallback-Reason`).
2. **Camada Relacional Física**: Tabelas, esquemas, chaves estrangeiras e integridade referencial do SQLite (`data/futebol.db`).
3. **Limites Operacionais de Produção**: Teto rígido de armazenamento na Vercel (< 94.0 MB / 98.566.144 bytes, target < 91.0 MB), tolerância a falhas com zero erros 500 para o usuário e latência p95 < 200ms.

### Princípios Fundamentais de Engenharia de Testes
- **Integridade Absoluta e Proibição de Facades**: Não são permitidos testes "fachada" que passem incondicionalmente sem exercitar a lógica real. Testes desenhados para validar novas funcionalidades (ex: headers de gateway, contagem de gols > 95.522, reconciliação de homônimos) falham legitimamente até que os respectivos marcos de implementação (M1, M2, M3) sejam concluídos.
- **Fontes Autoritativas de Saída Esperada**: Cada asserção deriva diretamente de fontes autoritativas documentadas:
  - Especificação de Arquitetura e Contratos de Interface em `PROJECT.md`.
  - Requisitos do usuário em `ORIGINAL_REQUEST.md` (seção `2026-11-01T14:16:05Z`).
  - Súmulas e cadastros oficiais da CBF / Conmebol / Ogol.
  - Regras relacionais auditadas por `scripts/auditar_integridade_dados.py` (12 regras).
  - Formulações matemáticas de Dixon-Coles ($\rho = -0.12$) e matriz Opta xG discreta.
- **Testabilidade Progressiva (Progressive Testability & TDD)**: A suíte serve como Regression Gate contínuo. Ela identifica claramente o que já é suportado pelo baseline e fornece aos agentes implementadores (M1, M2, M3) os critérios executáveis de aceite.
- **Isolamento e Reprodutibilidade Determinística**: Cada teste é autocontido. Conexões de banco utilizam modo somente-leitura (`mode=ro`), chamadas upstream de rede são interceptadas via fixtures modulares sem bater em serviços externos na internet, e não há dependência de ordem de execução.

---

## 2. Arquitetura Desacoplada em 2 Camadas (Two-Tier Data Architecture)

```
                              +-------------------------------------------------------+
                              |         Tier 1: Master Historical Archive             |
                              |  (Oracle Cloud VM 24/7 - Ashburn - 163.176.87.218)   |
                              |   - Storage sem teto (>50 GB)                         |
                              |   - 69.777 partidas históricas, 207.658+ gols         |
                              |   - Servido via scripts/remote_gateway_daemon.py      |
                              +-------------------------------------------------------+
                                                         ^
                                                         |  HTTP REST (hop ~35-40ms)
                                                         |  Timeout: 1.8s
                                                         v
  +-----------------------------------------------------------------------------------+
  |                       Tier 2: Resilient Edge Proxy (Vercel)                       |
  |                                                                                   |
  |   +-----------------------+     +------------------------+     +--------------+   |
  |   | 1. In-Memory Cache    | --> | 2. Remote Gateway      | --> | 3. Transparent|  |
  |   |    TTL Cache (<3ms)   |     |    Circuit Breaker     |     |    Local     |   |
  |   |    X-Data-Source:     |     |    (Max 3 falhas / 60s)|     |    Fallback  |   |
  |   |    cache              |     |    X-Data-Source:      |     |    SQLite    |   |
  |   +-----------------------+     |    remote-gateway      |     |    (<91 MB)  |   |
  |                                 +------------------------+     |    X-Data-   |   |
  |                                                                |    Source:   |   |
  |                                                                |    local-    |   |
  |                                                                |    fallback  |   |
  |                                                                +--------------+   |
  +-----------------------------------------------------------------------------------+
```

---

## 3. Especificação Completa da Suíte em 4 Camadas (`tests/test_e2e_decoupled.py`)

A suíte contém **42 casos de teste** estruturados nas 4 camadas canônicas:

```
+---------------------------------------------------------------------------------------+
|                      TIER 4: Real-World Scenarios (5 testes)                          |
|  - Athlete Career Deep Dive (Neymar / Luís Fabiano)                                   |
|  - Dashboard Cold Boot under Total Remote Outage                                      |
|  - Matchday Live Ingestion & Gateway Sync                                             |
|  - Historic Cup Knockout Navigation (Copa do Brasil / Libertadores)                   |
|  - Production Master Gate (Storage + SQLite Check + Audit 12/12 + Dixon-Coles)        |
+---------------------------------------------------------------------------------------+
                                           |
+---------------------------------------------------------------------------------------+
|                      TIER 3: Cross-Feature Combinations (5 testes)                    |
|  - Remote Failure during Active Ingestion (Reader fallback isolation)                 |
|  - Cache Invalidation upon Match Enrichment                                           |
|  - Fallback Career Recalculation (Local SQLite radar + honest stats)                  |
|  - SQLite WAL Checkpoint under Concurrency (Zero lock timeouts)                       |
|  - Circuit Breaker Half-Open State Transition (Cooldown probe & self-healing)          |
+---------------------------------------------------------------------------------------+
                                           |
+---------------------------------------------------------------------------------------+
|                      TIER 2: Boundary & Corner Cases (8 testes)                       |
|  - Gateway Timeout Boundary (1.70s OK vs 1.90s Fallback for 1.8s threshold)           |
|  - Malformed Remote JSON Payload (Graceful catch of JSONDecodeError)                  |
|  - Stoppage Time Ingestion Parsing ('45+2', '90+4', '105', '120+3' -> ints)          |
|  - Penalty Shootouts Exclusion (Regulation score 1x1 vs 5x4 pens in gols)             |
|  - Triple Substitution in Same Minute (No unique constraint collision in escalacoes)  |
|  - Concurrency Load Burst (50 concurrent queries, zero database is locked)            |
|  - Homonym Athlete Disambiguation (Separate id_jogador integrity)                     |
|  - SQLite Storage Hard Cap (< 94.0 MB, safety target < 91.0 MB)                       |
+---------------------------------------------------------------------------------------+
                                           |
+---------------------------------------------------------------------------------------+
|                      TIER 1: Feature Coverage (24 testes)                             |
|  - Decoupling Gateway (6 testes: Headers, Overview, Partidas, Auth, Cache, Latency)  |
|  - Fallback Resilience (6 testes: Standalone, Conn Error, Timeout, 5xx, CB, Degraded) |
|  - Historical Ingestion (6 testes: >95.522 Gols, Tipos Canônicos, FKs, Clubes, S.A)   |
|  - Career Reconcile (6 testes: No 1.00 Ratio, Marcos 9488, Neymar, Fred, LF, Lendas)  |
+---------------------------------------------------------------------------------------+
```

---

### 3.1. Detalhamento de Casos de Teste

#### Tier 1 - Feature Coverage (24 testes)
| # | Teste | Alvo / Contrato | Entrada / Setup | Saída Esperada | Marco |
|---|---|---|---|---|---|
| 1 | `test_t1_gateway_headers_contract` | Gateway Headers | `FUTSTATS_REMOTE_GATEWAY_URL` configurado, upstream 200 OK | `X-Data-Source: remote-gateway`, `X-Circuit-Breaker-State: closed`, `X-Response-Time-Ms` presente | M1 |
| 2 | `test_t1_gateway_remote_query_dispatch_overview` | Endpoint Overview | GET `/api/overview` via Gateway | JSON com `total_partidas`, `total_gols`, `total_atletas` | M1 |
| 3 | `test_t1_gateway_remote_query_dispatch_partidas` | Endpoint Partidas | GET `/api/partidas?ano=2024&limite=10` via Gateway | Lista de partidas válida com mandante, visitante e placar | M1 |
| 4 | `test_t1_gateway_auth_passthrough` | Segurança / Auth | GET `/api/admin/status` com Bearer JWT | HTTP 200 OK, autorização mantida sem truncar cabeçalhos | M1 |
| 5 | `test_t1_gateway_cache_layer_hit` | Cache em Memória | 2 requisições consecutivas a `/api/overview` | Segunda requisição retorna `X-Data-Source: cache` em < 10ms | M1 |
| 6 | `test_t1_gateway_p95_latency_slo` | Latência SLO | 20 requisições sequenciais a `/api/health` | Latência p95 < 200ms | M1 |
| 7 | `test_t1_fallback_when_remote_url_unset` | Modo Standalone | `FUTSTATS_REMOTE_GATEWAY_URL` ausente | HTTP 200 OK, `X-Data-Source: local-standalone` ou `local-fallback` | M1 |
| 8 | `test_t1_fallback_trigger_on_connection_error` | Erro de Conexão | Upstream lança `ConnectionError` | HTTP 200 OK, `X-Data-Source: local-fallback`, `X-Fallback-Reason: connect_error` | M1 |
| 9 | `test_t1_fallback_trigger_on_timeout` | Timeout Upstream | Upstream responde em > 1.8s | HTTP 200 OK, `X-Data-Source: local-fallback`, `X-Fallback-Reason: remote_timeout` | M1 |
| 10 | `test_t1_fallback_trigger_on_remote_5xx` | Erro 5xx Upstream | Upstream retorna HTTP 500/502/503 | HTTP 200 OK, `X-Data-Source: local-fallback`, `X-Fallback-Reason: status_5xx` | M1 |
| 11 | `test_t1_fallback_circuit_breaker_trips_to_open` | Circuit Breaker | 3 falhas consecutivas | Circuito vai para `open`, 4ª chamada não tenta upstream, `X-Fallback-Reason: circuit_open` | M1 |
| 12 | `test_t1_fallback_health_endpoint_status_degraded` | Health Check | Queda do upstream | GET `/api/health` retorna HTTP 200 com status `degraded` | M1 |
| 13 | `test_t1_ingestion_goal_count_threshold` | Volume de Gols | `SELECT COUNT(*) FROM gols;` | Contagem total de gols > 95.522 | M2 |
| 14 | `test_t1_ingestion_goal_schema_and_types` | Taxonomia de Gols | `SELECT DISTINCT tipo_de_gol FROM gols;` | Tipos restritos a `{'Normal', 'Pênalti', 'Falta', 'Contra', 'Cabeça'}` | M2 |
| 15 | `test_t1_ingestion_no_orphan_goals` | FK Integridade | `gols` sem `partidas` correspondente | Contagem = 0 | M2 |
| 16 | `test_t1_ingestion_no_orphan_lineups` | FK Integridade | `escalacoes` sem `partidas` correspondente | Contagem = 0 | M2 |
| 17 | `test_t1_ingestion_match_sheet_lineup_and_goal_club_coherence` | Coerência Clube | Gols atribuídos vs mandante/visitante | Todo gol pertence ao mandante ou visitante da partida | M2 |
| 18 | `test_t1_ingestion_points_era_brasileirao_coverage` | Cobertura Série A | Partidas Série A (2003-2024) | Todas as partidas finalizadas possuem `gols_mandante` e `gols_visitante` não-nulos | M2 |
| 19 | `test_t1_reconcile_no_forced_jogos_equals_gols_systemwide` | Invariante Carreira | Atletas com carreira oficial > 1.5x gols | Contagem de atletas com `total_jogos = total_gols` forçado é 0 | M3 |
| 20 | `test_t1_reconcile_marcos_9488_homonym_disambiguation` | Homônimo Marcos | Atleta ID 9488 (Goleiro Marcos) | Sem 11 gols forçados de 1963-1977 nem jogos=11 forçado | M3 |
| 21 | `test_t1_reconcile_neymar_career_profile` | Perfil Neymar | GET `/api/jogadores/perfil?id=352` | `jogos_carreira_oficiais >= 700`, média honesta (< 1.00), clubes legítimos | M3 |
| 22 | `test_t1_reconcile_fred_consolidated_totals` | Perfil Fred | Atleta ID 6051 | `jogos_carreira_oficiais > 800`, `total_gols > 200` | M3 |
| 23 | `test_t1_reconcile_luis_fabiano_authentic_average` | Perfil Luís Fabiano | GET `/api/jogadores/perfil?id=9033` | Média autêntica ~0.53, clubes espúrios estrangeiros expurgados | M3 |
| 24 | `test_t1_reconcile_legends_zico_and_romario_averages` | Lendas Zico / Romário | IDs 13953 e 12212 | Médias ~0.68 (Zico) e ~0.77 (Romário), rótulo `"Jogos c/ Gol"` | M3 |

#### Tier 2 - Boundary & Corner Cases (8 testes)
| # | Teste | Condição Limite | Comportamento Esperado |
|---|---|---|---|
| 25 | `test_t2_gateway_exact_timeout_boundary` | Latência em 1.70s vs 1.90s | 1.70s completa upstream; 1.90s excede 1.8s e dispara fallback |
| 26 | `test_t2_gateway_malformed_remote_json` | JSON upstream truncado/inválido | Trata `JSONDecodeError`, cai no SQLite local com HTTP 200 |
| 27 | `test_t2_ingestion_stoppage_time_parsing` | Minutos de acréscimo `'45+2'`, `'90+4'`, `'105'`, `'120+3'` | Parsed como inteiros válidos (47, 94, 105, 123) sem exceção |
| 28 | `test_t2_ingestion_penalty_shootouts_exclusion` | Jogo eliminatório 1x1 (decidido 5x4 nos pênaltis) | Pênaltis de desempate NÃO entram na tabela `gols`; placar 1x1 preservado |
| 29 | `test_t2_ingestion_triple_substitution_same_minute` | 3 substituições no mesmo minuto 60 | Transições em `escalacoes` gravadas sem colisão de chave primária |
| 30 | `test_t2_gateway_concurrency_load_burst` | 50 requisições simultâneas via `ThreadPoolExecutor` | 100% concluem com HTTP 200 e zero erros de `database is locked` |
| 31 | `test_t2_homonym_athlete_disambiguation` | Atletas com nomes comuns ("Marcos", "Lucas", "Eduardo") | IDs numéricos distintos não têm estatísticas agregadas indevidamente |
| 32 | `test_t2_storage_hard_cap_below_94mb` | Tamanho do arquivo `data/futebol.db` | Tamanho estritamente < 98.566.144 bytes (94.0 MB), ideal < 91.0 MB |

#### Tier 3 - Cross-Feature Combinations (5 testes)
| # | Teste | Interação Pareada | Comportamento Esperado |
|---|---|---|---|
| 33 | `test_t3_cross_remote_failure_during_active_ingestion` | Queda do upstream durante batch de ingestão | Operações de leitura caem transparentemente no snapshot local sem travar |
| 34 | `test_t3_cross_cache_invalidation_upon_match_enrichment` | Enriquecimento de partida vs Cache | Chave de cache da partida e do overview invalidada imediatamente |
| 35 | `test_t3_cross_fallback_career_recalculation` | Cálculo de carreira e Radar em modo fallback | Executa integralmente sobre o SQLite local gerando radar e médias válidas |
| 36 | `test_t3_cross_sqlite_wal_checkpoint_under_concurrency` | Leituras simultâneas durante `wal_checkpoint` | Leituras concorrentes concluem com sucesso com zero timeouts |
| 37 | `test_t3_cross_circuit_breaker_half_open_transition` | Cooldown de 60s expirado | Circuito transita para `half-open`, testa 1 chamada probe e restabelece `closed` |

#### Tier 4 - Real-World Scenarios (5 testes)
| # | Teste | Jornada Completa | Comportamento Esperado |
|---|---|---|---|
| 38 | `test_t4_realworld_athlete_career_deep_dive` | Busca -> Perfil -> Radar PES -> Scouts | Dados preenchidos sem nulls, média autêntica de carreira e eixos do radar calibrados |
| 39 | `test_t4_realworld_dashboard_cold_boot_under_total_remote_outage` | Cold boot sem rede remota | Dashboard abre normalmente com dados locais em < 300ms e badge de resiliência |
| 40 | `test_t4_realworld_match_day_live_ingestion` | Ingestão simultânea de 10 jogos de rodada | Banco atualizado e `auditar_integridade_dados.py` preserva 12/12 OK |
| 41 | `test_t4_realworld_historic_cup_navigation` | Navegação por jogos eliminatórios de Copa do Brasil | Súmulas históricas exibem autores de gols, mandante/visitante corretos e sem inversões |
| 42 | `test_t4_realworld_production_master_gate` | Sequência pré-deploy de produção | Storage < 94MB, SQLite integridade OK, Auditoria 12/12 OK, Dixon-Coles 22/22 OK |

---

## 4. Fixtures e Arquitetura do Test Harness

### `db_conn` (Conexão Segura Somente-Leitura)
```python
@pytest.fixture(scope="session")
def db_conn():
    assert os.path.exists(DB_PATH), f"Banco SQLite ausente em {DB_PATH}"
    conn = sqlite3.connect(f"file:{DB_PATH}?mode=ro", uri=True)
    conn.row_factory = sqlite3.Row
    yield conn
    conn.close()
```

### `api_client` (Cliente Autenticado Flask)
```python
@pytest.fixture(scope="session")
def api_client():
    app.config["TESTING"] = True
    token = gerar_token({"email": "e2e_tester@futstats.com", "role": "admin"})
    # Wrapper com injeção automática de header Authorization: Bearer <token>
    ...
```

### `mock_remote_gateway` (Simulador de Gateway Upstream)
Permite configurar o comportamento do gateway remoto durante os testes sem depender de rede externa:
- Simulação de latência controlada (`latency_sec`).
- Simulação de códigos HTTP (200, 500, 502, 503).
- Simulação de payload malformado ou truncado (`invalid_json=True`).
- Simulação de exceções de rede (`requests.exceptions.ConnectionError`, `requests.exceptions.Timeout`).

### `gateway_env_config` (Injeção de Configuração)
Utiliza `monkeypatch` para injetar variáveis de ambiente isoladas por teste:
- `FUTSTATS_REMOTE_GATEWAY_URL`: `http://mock-remote-gateway.futstats.internal:8000`
- `FUTSTATS_GATEWAY_SECRET`: Chave secreta de autenticação do gateway
- `FUTSTATS_GATEWAY_TIMEOUT_SEC`: `1.8`
- `FUTSTATS_CIRCUIT_MAX_FAILURES`: `3`
- `FUTSTATS_CIRCUIT_RESET_SEC`: `60`

---

## 5. Invariantes de Aceite e Gates de Confiabilidade

Todo deploy e toda entrega devem satisfazer concomitantemente os 4 Gates Fundamentais:

1. **Storage Hard Cap Gate**:
   - `os.path.getsize('data/futebol.db') < 94 * 1024 * 1024` (estritamente < 94.0 MB).
   - Target operacional: `< 91.0 MB`.
2. **SQLite Physical Integrity Gate**:
   - `PRAGMA integrity_check == 'ok'`.
3. **Relational Governance Gate**:
   - `python scripts/auditar_integridade_dados.py` $\implies$ 12/12 regras OK, 0 inconsistências.
4. **Mathematical Calibration Gate**:
   - `pytest tests/test_model_evals.py` $\implies$ 22/22 testes passados.

---

## 6. Comandos Canônicos de Execução

```bash
# 1. Execução de toda a suíte de testes desacoplada
./.venv/bin/pytest tests/test_e2e_decoupled.py -v

# 2. Execução filtrada por camada (Tier)
./.venv/bin/pytest tests/test_e2e_decoupled.py -m "tier1" -v
./.venv/bin/pytest tests/test_e2e_decoupled.py -m "tier2" -v
./.venv/bin/pytest tests/test_e2e_decoupled.py -m "tier3" -v
./.venv/bin/pytest tests/test_e2e_decoupled.py -m "tier4" -v

# 3. Execução filtrada por funcionalidade
./.venv/bin/pytest tests/test_e2e_decoupled.py -k "gateway" -v
./.venv/bin/pytest tests/test_e2e_decoupled.py -k "fallback" -v
./.venv/bin/pytest tests/test_e2e_decoupled.py -k "ingestion" -v
./.venv/bin/pytest tests/test_e2e_decoupled.py -k "reconcile" -v

# 4. Execução integrada dos Regression Gates completos
./.venv/bin/pytest tests/test_model_evals.py tests/test_e2e_decoupled.py -v
```
