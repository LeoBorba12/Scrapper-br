# Handoff Report — Challenger M1 Retry 2 (Adversarial Data Invariance & Stress Test)

**Milestone**: M1 (Features 1, 2, 3, 4 - Remediation Verification)  
**Agent**: Challenger M1 Retry 2 (`teamwork_preview_challenger_m1_retry_2`)  
**Parent Agent**: `parent` (`9c2d948a-bd66-4e27-83b1-9e8d50e60942`)  
**Timestamp**: 2026-10-30T20:05:00Z  
**Type**: Hard Handoff  
**Verdict**: **APPROVE**  

---

## 1. Observação (Observation)

### 1.1. Invariância de Dados de Carreira Oficial (19.783 Atletas Verificados)
- **Censo Completo em `jogadores_estatisticas`**:
  - Total de registros: **19.783**.
  - `gols_carreira_oficiais`: 19.783 preenchidos (0 NULLs, 0 negativos, 0 tipos inválidos).
  - `jogos_carreira_oficiais`: 19.783 preenchidos (0 NULLs, 0 negativos, 0 tipos inválidos).
- **Diff Empírico Linha a Linha contra `git HEAD:data/futebol.db`**:
  - Comparação direta executada contra o banco original antes da remediação (`/tmp/futebol_head.db`).
  - **Divergências em `gols_carreira_oficiais`**: Exatamente **1** atleta em 19.783:
    `ID 67 ('Flaco López'): HEAD = 46 -> ATUAL = 102`.
  - **Divergências em `jogos_carreira_oficiais`**: Exatamente **1** atleta em 19.783:
    `ID 67 ('Flaco López'): HEAD = 72 -> ATUAL = 294`.
  - **Divergências nas demais colunas de carreira (`assistencias_carreira_oficiais`, `detalhe_carreira_clubes`, `carreira_temporadas`)**: **0** divergências em 19.783 atletas.
  - **19.782 atletas permaneceram 100% intactos e inalterados**. A única alteração foi a de Flaco López, cirurgicamente realizada e documentada pelo Worker para refletir os números reais da carreira oficial (Lanús + Palmeiras).
- **Auditoria de Lendas Históricas e Atletas-Chave**:
  - Zico (ID 13953): `jogos_carreira_oficiais = 777`, `gols_carreira_oficiais = 530`, `total_gols = 132`, `total_jogos = 98`.
  - Romário (ID 12212): `jogos_carreira_oficiais = 961`, `gols_carreira_oficiais = 744`, `total_gols = 150`, `total_jogos = 109`.
  - Luís Fabiano (ID 9033): `jogos_carreira_oficiais = 755`, `gols_carreira_oficiais = 403`, `total_gols = 168`, `total_jogos = 158`.
  - Neymar (ID 352): `jogos_carreira_oficiais = 719`, `gols_carreira_oficiais = 439`, `total_gols = 134`, `total_jogos = 125`.
  - Hulk (ID 9): `jogos_carreira_oficiais = 844`, `gols_carreira_oficiais = 420`, `total_gols = 104`, `total_jogos = 189`.
  - Gabriel Barbosa (ID 7): `jogos_carreira_oficiais = 530`, `gols_carreira_oficiais = 246`, `total_gols = 205`, `total_jogos = 312`.
  - Pedro (ID 10): `jogos_carreira_oficiais = 496`, `gols_carreira_oficiais = 239`, `total_gols = 156`, `total_jogos = 330`.
  - Serginho (ID 12636): `jogos_carreira_oficiais = 200`, `gols_carreira_oficiais = 45`, `total_gols = 45`, `total_jogos = 76`, `media_gols_por_jogo = 0.59`.
  - Flaco López (ID 67): `jogos_carreira_oficiais = 294`, `gols_carreira_oficiais = 102`, `total_gols = 12`, `total_jogos = 127`, `media_gols_por_jogo = 0.09`.

### 1.2. Reconciliação Relacional e Resolução dos 25 Atletas Desincronizados
- **Sincronização `jogadores_estatisticas` vs `gols`**:
  ```sql
  WITH gols_reais AS (SELECT id_jogador, count(*) as n FROM gols WHERE id_jogador > 0 GROUP BY id_jogador)
  SELECT count(*) FROM jogadores_estatisticas j
  LEFT JOIN gols_reais g ON j.id_jogador = g.id_jogador
  WHERE j.total_gols != COALESCE(g.n, 0);
  ```
  Resultado observado: **0** atletas desincronizados.
- **Atletas Críticos do Relatório M1-1**:
  - Raphael Veiga (ID 12): `total_gols = 83`, contagem na tabela `gols = 83` (corrigido de 85).
  - Yuri Alberto (ID 48): `total_gols = 83`, contagem na tabela `gols = 83` (corrigido de 85).
  - Memphis Depay (ID 49): `total_gols = 18`, contagem na tabela `gols = 18` (corrigido de 19).
  - Flaco López (ID 67): `total_gols = 12`, contagem na tabela `gols = 12` (corrigido de 14).
  - Endrick (ID 5385): `total_gols = 17`, contagem na tabela `gols = 17` (corrigido de 18).
  - Estêvão (ID 5491): `total_gols = 17`, contagem na tabela `gols = 17` (corrigido de 18).
  - Neymar (ID 352): `total_gols = 134`, contagem na tabela `gols = 134` (corrigido de 135).
- **Teste de Aceitação E2E `test_t1_r1_db_no_forced_jogos_equals_gols_with_divergent_career`**:
  - Consulta executada em todo o banco (sem LIMIT): **0 anomalias encontradas**.
  - `./.venv/bin/pytest tests/test_e2e_futstats.py -k "test_t1_r1_db_no_forced_jogos_equals_gols_with_divergent_career"`: **1 passed in 0.29s**.

### 1.3. Planos de Consulta (EXPLAIN QUERY PLAN) e Benchmark sob Estresse
- **Planos Inspecionados**:
  1. `escalacoes JOIN partidas WHERE e.id_jogador = ? ORDER BY p.data DESC`:
     `SEARCH e USING INDEX idx_escalacoes_id_jogador (id_jogador=?)` + `SEARCH p USING INTEGER PRIMARY KEY (rowid=?)`. (0 scans).
  2. `escalacoes e1 JOIN escalacoes e2 ON e1.id_partida = e2.id_partida JOIN partidas p`:
     `SEARCH e2 USING INDEX idx_escalacoes_id_jogador` + `SEARCH p USING INTEGER PRIMARY KEY` + `SEARCH e1 USING INDEX idx_escalacoes_partida_clube`. (0 scans).
  3. `partidas WHERE data = ?`:
     `SEARCH partidas USING INDEX idx_partidas_data_visitante (data=?)`. (0 scans).
  4. `partidas WHERE data BETWEEN ? AND ?`:
     `SEARCH partidas USING INDEX idx_partidas_data_visitante (data>? AND data<?)`. (0 scans).
  5. `partidas WHERE mandante = ? AND visitante = ? AND ano = ?`:
     `SEARCH partidas USING INDEX idx_partidas_confronto (mandante=? AND visitante=? AND ano=?)`. (0 scans).
  6. `partidas WHERE campeonato = ? AND ano = ?`:
     `SEARCH partidas USING INDEX idx_partidas_camp_ano (campeonato=? AND ano=?)`. (0 scans).
- **Latências Medidas (100 a 500 iterações)**:
  - Escalações Atleta (Pedro, 269 presenças): `p50 = 0.696 ms`, `p95 = 0.905 ms`, `max = 1.431 ms`.
  - Escalações Atleta (Flaco López, 115 presenças): `p50 = 0.298 ms`, `p95 = 0.390 ms`, `max = 0.554 ms`.
  - Head-to-Head Confrontos (Pedro vs Gabigol): `p50 = 2.115 ms`, `p95 = 3.246 ms`, `max = 4.724 ms`.
  - Partidas Data Exata: `p50 = 0.023 ms`, `p95 = 0.039 ms`, `max = 0.071 ms`.
  - Partidas Intervalo Anual (2.339 partidas em 2024): `p50 = 2.797 ms`, `p95 = 3.777 ms`, `max = 5.037 ms`.
  - Atleta Inexistente (id=-999): `p50 = 0.012 ms`, `max = 0.048 ms`.
- **Estresse de Concorrência Multithread**:
  - Teste executado com **20 threads simultâneas** executando **2.000 consultas reais** de perfil e escalações contra `data/futebol.db`.
  - Tempo total de execução: **0.861s** (**2.322,7 consultas por segundo**).
  - Erros de concorrência ou lock timeouts: **0**.

### 1.4. Teto Físico de Armazenamento Vercel (<94.0 MB) e Integridade do SQLite
- **Tamanho Físico de `data/futebol.db`**: `88.580.096 bytes`.
  - Notação Decimal: **88,58 MB** (limite: 94,00 MB $\rightarrow$ margem livre: **5,42 MB** / 5.419.904 bytes).
  - Notação Binária: **84,48 MiB** (limite: 94,00 MiB $\rightarrow$ margem livre: **9,52 MiB** / 9.986.048 bytes).
- **Estrutura Interna de Páginas**:
  - `page_count`: 21.626 páginas de 4.096 bytes ($21.626 \times 4.096 = 88.580.096$ bytes).
  - `freelist_count`: **0 páginas** (banco 100% compactado via VACUUM).
  - Arquivos transitórios: `-wal`, `-shm` e `-journal` ausentes (checkpoint TRUNCATE perfeito).
- **Sanidade Estrutural**:
  - `PRAGMA integrity_check;`: `[('ok',)]`.
  - `PRAGMA quick_check;`: `[('ok',)]`.

### 1.5. Suítes de Regressão e Build do Frontend
- `scripts/auditar_integridade_dados.py`: **12/12 regras OK** (`inconsistencias_encontradas: 0`, `inconsistencias_reparadas: 0`).
  - Idempotência comprovada: hash SHA256 do arquivo `.db` idêntico antes e depois da execução (`cddd36841de0b2af...`).
  - Rótulo da Regra 11 harmonizado com sucesso para `"Coerência de Atletas: Médias Verossímeis (<= 2.5)"`.
- `pytest tests/test_model_evals.py`: **22/22 passed in 3.56s**.
- `pytest tests/test_e2e_futstats.py -m "r4"`: **9/9 passed in 4.03s**.
- `npm run build` em `frontend/`: `✓ built in 5.34s` (código de saída 0).

---

## 2. Cadeia Lógica (Logic Chain)

1. **Da Comparação Empírica contra git HEAD à Garantia de Não-Regressão**:
   A extração de `HEAD:data/futebol.db` permitiu comparar os dados de carreira dos 19.783 atletas. O resultado comprovou que 19.782 atletas mantiveram valores rigorosamente idênticos. A única modificação foi em Flaco López (ID 67), requerida e necessária para sanar a anomalia do teste `test_t1_r1_db_no_forced_jogos_equals_gols_with_divergent_career`. Isso refuta qualquer hipótese de corrupção ou alteração colateral inadvertida nos números oficiais de carreira.
2. **Da Correção Relacional na Regra 5 à Consistência Matemática**:
   A sincronização em lote refez a amarração entre `gols` e `jogadores_estatisticas`. Todos os 25 atletas reportados como desincronizados pelo Challenger M1-1 foram revalidados linha a linha, apresentando hoje `diff = 0`. O auto-reparo da Regra 5 agora coleta `atletas_afetados` antes da purga e recalcula seus contadores atomicamente, garantindo que futuras limpezas não quebrem a integridade referencial.
3. **Do Estresse de Consultas à Robustez Operacional**:
   A inspeção via `EXPLAIN QUERY PLAN` comprovou que todas as consultas críticas em `partidas` e `escalacoes` usam índices compostos ou chave primária integer. O teste multithread (2.322 QPS em 20 threads) demonstrou ausência de gargalos de I/O ou contenção de lock, comprovando que o pruning de índices redundancies atingiu redução de espaço sem degradar a performance.
4. **Da Conformidade com o Teto Vercel à Estabilidade de Deploy**:
   O tamanho físico de 88,58 MB garante uma folga confortável de 5,42 MB para futuras ingestões e scrapers contínuos, sem risco de estourar a cota de 94,0 MB exigida para o bundle de deploy na Vercel.

---

## 3. Ressalvas e Limitações (Caveats)

1. **Tabela Legada `jogadores` (Observação Não-Bloqueante)**:
   Foi detectado que a tabela legada `jogadores` (3.639 registros) ainda possui 52 atletas com `total_gols` desatualizado (ex: Gabriel Barbosa com 207 vs 205 real). Como a aplicação runtime (`backend/app.py` e frontend) consome exclusivamente `jogadores_estatisticas` (onde os 19.783 atletas estão 100% sincronizados), essa disparidade na tabela legada não impacta os usuários nem viola contratos de M1. Recomenda-se unificar/sincronizar essa tabela legada durante o Milestone M2.
2. **Partidas Históricas 0x0 e Conmebol (Escopo Alocado para Milestone M2)**:
   As 306 partidas com placar 0x0 e gols registrados no acervo antigo e confrontos Conmebol (Palmeiras x River Plate) estão formalmente agendadas para o Milestone M2 (Features 5, 6 e 7).

---

## 4. Conclusão (Conclusion)

**Veredito: APPROVE**

Todas as deficiências apontadas na iteração anterior foram solucionadas com rigor técnico e comprovadas empiricamente:
- Invariância dos dados de carreira oficial de todos os 19.783 atletas: **100% íntegra**.
- Desincronização relacional de gols: **0 divergências** entre `jogadores_estatisticas` e `gols`.
- Teste de aceitação `test_t1_r1_db_no_forced_jogos_equals_gols_with_divergent_career`: **Aprovado (0 anomalias)**.
- Desempenho e planos de consulta de `partidas` e `escalacoes`: **Sub-3ms median, 0 table scans, 2.322 QPS concorrentes**.
- Teto de armazenamento físico: **88,58 MB** (5,42 MB abaixo do teto de 94,0 MB).
- Testes pre-flight obrigatórios: **12/12 regras de integridade OK, 22/22 Dixon-Coles model evals, 9/9 R4 E2E e build frontend bem-sucedido**.

Milestone M1 está formalmente validado e aprovado para progressão ao Milestone M2.

---

## 5. Método de Verificação Independente (Verification Method)

Para reproduzir e verificar de forma independente todas as evidências apresentadas:

1. **Verificação de Invariância de Carreira Oficial (19.783 atletas)**:
   ```bash
   ./.venv/bin/python3 -c "
   import sqlite3
   c = sqlite3.connect('data/futebol.db').cursor()
   c.execute('''
       SELECT count(*), 
              sum(case when gols_carreira_oficiais is null or jogos_carreira_oficiais is null then 1 else 0 end),
              sum(case when gols_carreira_oficiais < 0 or jogos_carreira_oficiais < 0 then 1 else 0 end)
       FROM jogadores_estatisticas;
   ''')
   tot, nulls, negs = c.fetchone()
   assert tot == 19783 and nulls == 0 and negs == 0
   print(f'Carreira oficial: {tot} atletas verificados, 0 nulos, 0 negativos.')
   "
   ```

2. **Verificação de Ausência de Atletas Desincronizados**:
   ```bash
   ./.venv/bin/python3 -c "
   import sqlite3
   c = sqlite3.connect('data/futebol.db').cursor()
   c.execute('''
       WITH gols_reais AS (SELECT id_jogador, count(*) as n FROM gols WHERE id_jogador > 0 GROUP BY id_jogador)
       SELECT count(*) FROM jogadores_estatisticas j 
       LEFT JOIN gols_reais g ON j.id_jogador = g.id_jogador
       WHERE j.total_gols != COALESCE(g.n, 0);
   ''')
   assert c.fetchone()[0] == 0, 'Falha: existem atletas desincronizados!'
   print('Sincronia relacional gols x estatísticas: 100% OK!')
   "
   ```

3. **Execução do Teste de Aceitação de Carreira Divergente**:
   ```bash
   ./.venv/bin/pytest tests/test_e2e_futstats.py -k "test_t1_r1_db_no_forced_jogos_equals_gols_with_divergent_career"
   ```

4. **Auditoria de Integridade de Dados (12 Regras)**:
   ```bash
   ./.venv/bin/python3 scripts/auditar_integridade_dados.py
   ```

5. **Regressão Dixon-Coles e E2E R4**:
   ```bash
   ./.venv/bin/pytest tests/test_model_evals.py
   ./.venv/bin/pytest tests/test_e2e_futstats.py -m "r4"
   ```

6. **Medição de Tamanho Físico**:
   ```bash
   ./.venv/bin/python3 -c "
   import os
   sz = os.path.getsize('data/futebol.db')
   print(f'Tamanho: {sz} bytes ({sz/1e6:.2f} MB)')
   assert sz < 94000000, 'Tamanho excede 94.0 MB!'
   "
   ```

7. **Build do Frontend**:
   ```bash
   cd frontend && npm run build
   ```
