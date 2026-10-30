# Handoff Report — Worker M1 Retry (Remediation of M1 Iteration 1 Findings)

**Agent**: Worker M1 Retry (`teamwork_preview_worker_m1_retry`)  
**Parent Agent**: `parent` (`9c2d948a-bd66-4e27-83b1-9e8d50e60942`)  
**Timestamp**: 2026-10-30T19:45:00Z  
**Type**: Hard Handoff (Full Remediation & Verification Complete)

---

## 1. Observação (Observation)

### 1.1. Estado Inicial Diagnosticado pelo Challenger M1-1
- **25 Atletas Desincronizados**: Discrepância entre `jogadores_estatisticas.total_gols` e a contagem real na tabela `gols` (`SELECT id_jogador, count(*) FROM gols GROUP BY id_jogador`). Exemplos: Raphael Veiga (85 vs 83), Yuri Alberto (85 vs 83), Memphis Depay (19 vs 18), Endrick (18 vs 17), Estêvão (18 vs 17), Flaco López (14 vs 12).
- **Falha no Teste E2E**: `tests/test_e2e_futstats.py::TestTier1FeatureCoverage::test_t1_r1_db_no_forced_jogos_equals_gols_with_divergent_career` falhava com 2 anomalias: Serginho (ID 12636, jogos=45, gols=45, carreira=200) e Flaco López (ID 67, jogos=14, gols=14, carreira=72).
- **Assimetria no Auto-Reparo da Regra 5 (`scripts/auditar_integridade_dados.py:98-126`)**: O `SELECT` buscava clubes nulos, vazios ou contendo `'Estatísticas'`, enquanto o `DELETE` excluía apenas registros contendo `'Estatísticas'`. Além disso, a remoção de 13 partidas espúrias e 26 gols não recalculava contadores em `jogadores_estatisticas`.
- **Dissonância no Rótulo da Regra 11 (`scripts/auditar_integridade_dados.py:341-355`)**: Título exibia `(<= 2.0)` e `Jogos >= Gols`, enquanto a verificação SQL executava `media_gols_por_jogo > 2.5` e tolerava atletas com súmulas incompletas.

### 1.2. Execução das Remediações
1. **Aplicação do Patch em `scripts/auditar_integridade_dados.py`**:
   - Patch aplicado via `git apply .agents/teamwork/teamwork_preview_explorer_m1_retry_3/scripts_auditar_integridade_dados.patch`.
   - O bloco de auto-reparo da Regra 5 agora coleta previamente `atletas_afetados` em `gols`, `escalacoes` e `cartoes`, executa os `DELETE` com alinhamento total ao filtro do `SELECT` (incluindo `mandante IS NULL OR mandante = '' OR visitante IS NULL OR visitante = ''`), e recalcula atomicamente `total_gols`, `total_jogos`, `media_gols_por_jogo`, `participacoes_gols` e `media_participacao_por_jogo` para todos os atletas afetados.
   - O rótulo da Regra 11 foi harmonizado para `"Coerência de Atletas: Médias Verossímeis (<= 2.5)"`.
2. **Re-vinculação de Escalações e Cartões**:
   - Serginho: 31 escalações do ID fragmentado 21287 transferidas para o ID canônico 12636.
   - Flaco López: 115 escalações do ID fragmentado 19997 transferidas para o ID canônico 67.
   - Atualizados os tetos de carreira oficial de Flaco López: `jogos_carreira_oficiais = 294`, `gols_carreira_oficiais = 102`.
   - Zerados os contadores dos IDs secundários integrados (19997 e 21287).
3. **Execução da CTE Pushdown de Ressincronização de Estatísticas**:
   - Recalculados `total_gols`, `total_jogos`, `media_gols_por_jogo`, `participacoes_gols` e `media_participacao_por_jogo` para os atletas divergentes com pushdown nos índices líderes de `gols`, `escalacoes` e `cartoes`.
   - Atualizada a tabela `jogadores` com os mesmos contadores.
4. **Otimização Física do Banco (`data/futebol.db`)**:
   - Executados `ANALYZE;`, `VACUUM;` e `PRAGMA wal_checkpoint(TRUNCATE);`.

### 1.3. Resultados de Verificação Verbatim
- **Atletas Desincronizados Restantes**:
  `SELECT count(*) FROM jogadores_estatisticas j LEFT JOIN (SELECT id_jogador, count(*) n FROM gols GROUP BY id_jogador) g ON j.id_jogador = g.id_jogador WHERE j.total_gols != COALESCE(g.n, 0)` $\rightarrow$ **0**.
- **Anomalias em `test_t1_r1_db_no_forced_jogos_equals_gols_with_divergent_career`**: **0**.
  - Serginho (12636): `total_jogos = 76`, `total_gols = 45`, `media_gols_por_jogo = 0.59`, `jogos_carreira_oficiais = 200`.
  - Flaco López (67): `total_jogos = 127`, `total_gols = 12`, `media_gols_por_jogo = 0.09`, `jogos_carreira_oficiais = 294`, `gols_carreira_oficiais = 102`.
- **`python scripts/auditar_integridade_dados.py`**:
  `12/12 regras OK` (inconsistencias_encontradas: 0, inconsistencias_reparadas: 0).
- **`./.venv/bin/pytest tests/test_model_evals.py`**:
  `22 passed in 0.58s`.
- **`./.venv/bin/pytest tests/test_e2e_futstats.py -k "test_t1_r1_db_no_forced_jogos_equals_gols_with_divergent_career"`**:
  `1 passed, 49 deselected in 0.31s`.
- **`./.venv/bin/pytest tests/test_e2e_futstats.py -m "r4"`**:
  `9 passed, 41 deselected in 3.83s`.
- **Tamanho Físico de `data/futebol.db`**:
  `88,580,096 bytes` (**88.58 MB decimais** / **84.48 MiB binários**), margem de **5.42 MB** abaixo do teto de 94.0 MB.
- **Frontend Build (`npm run build` em `frontend/`)**:
  `✓ built in 4.44s` (código de saída 0).

---

## 2. Cadeia Lógica (Logic Chain)

1. **Da Causa-Raiz à Resolução Relacional**:
   A desincronização dos 25 atletas decorria da deleção física de partidas e gols em transações passadas sem o recálculo dos agregados na tabela desnormalizada `jogadores_estatisticas`. A CTE pushdown restabeleceu a paridade exata (`total_gols == COUNT(gols)` e `total_jogos == COUNT(DISTINCT partidas)`).
2. **Da Re-vinculação de Escalações à Eliminação da Anomalia em Serginho e Flaco**:
   O teste de carreira divergente reprovava porque ambos os atletas possuíam escalações cadastradas sob IDs alternativos da CBF (21287 e 19997) enquanto seus gols residiam nos IDs canônicos (12636 e 67). A re-vinculação das escalações no nível atômico restaurou o censo de presenças (76 jogos para Serginho e 127 jogos para Flaco), desfazendo a igualdade artificial de `total_jogos == total_gols` com dados reais e autênticos.
3. **Do Auto-Reparo Endurecido à Imunidade contra Regressões Futuras**:
   Ao incorporar a captura prévia de atletas afetados e seu recálculo automático logo após a exclusão de partidas na Regra 5 de `auditar_integridade_dados.py`, assegura-se que qualquer purga futura de dados jamais deixe tabelas agregadas dessincronizadas.
4. **Da Conformidade com o Teto Vercel e Integridade Estrutural**:
   A execução de `ANALYZE`, `VACUUM` e `PRAGMA wal_checkpoint(TRUNCATE)` consolidou o arquivo SQLite em 88.58 MB, preservando 5.42 MB de margem até o teto restritivo de 94.0 MB, com integridade física `PRAGMA integrity_check = ok`.

---

## 3. Ressalvas e Limitações (Caveats)

- **Escopo Delimitado ao Milestone M1**: As 306 partidas históricas marcadas como 0x0 com gols cadastrados e confrontos Conmebol permanecem alocadas para resolução estrutural no Milestone M2 (Features 5, 6 e 7), conforme já documentado e aprovado no relatório do Challenger M1-1.
- **Fusão Completa de Homônimos de Flaco López**: Os fragmentos estaduais secundários de Flaco López (IDs 7708 e 7789) serão plenamente unificados na Feature 6 (M2). A intervenção aqui realizada resolve com precisão matemática a integridade de escalações entre 19997 e 67.

---

## 4. Conclusão (Conclusion)

Todos os apontamentos críticos levantados pelo Challenger M1-1 foram remediados na causa-raiz:
1. `scripts/auditar_integridade_dados.py` foi corrigido (deleção simétrica na Regra 5, auto-ressincronização de atletas afetados e título correto na Regra 11).
2. Todos os 25 atletas em `jogadores_estatisticas` estão rigorosamente sincronizados com a tabela `gols` (0 divergências).
3. As escalações de Serginho e Flaco López foram re-vinculadas, eliminando a anomalia do teste `test_t1_r1_db_no_forced_jogos_equals_gols_with_divergent_career`.
4. Todas as suítes de testes de regressão (22/22 model evals, 9/9 r4 tests) e a auditoria relacional (12/12 regras OK) foram executadas e aprovadas com 100% de sucesso.
5. O tamanho do banco `data/futebol.db` (88.58 MB) cumpre com folga o limite de 94.0 MB.

---

## 5. Método de Verificação Independente (Verification Method)

Para reproduzir e auditar de forma independente todos os resultados:

1. **Auditoria de Integridade Relacional (12/12 OK)**:
   ```bash
   ./.venv/bin/python3 scripts/auditar_integridade_dados.py
   ```
   *Critério*: Saída com `"inconsistencias_encontradas": 0` e 12 regras com `"status": "OK"`.

2. **Suíte Preditiva e Gates de Regressão Dixon-Coles (22/22 Passed)**:
   ```bash
   ./.venv/bin/pytest tests/test_model_evals.py
   ```
   *Critério*: `22 passed in <1s`.

3. **Teste de Aceitação de Carreira Divergente (1 Passed)**:
   ```bash
   ./.venv/bin/pytest tests/test_e2e_futstats.py -k "test_t1_r1_db_no_forced_jogos_equals_gols_with_divergent_career"
   ```
   *Critério*: `1 passed in <1s`.

4. **Suíte E2E Grupo R4 (Storage, Integridade e Confiabilidade)**:
   ```bash
   ./.venv/bin/pytest tests/test_e2e_futstats.py -m "r4"
   ```
   *Critério*: `9 passed in <5s`.

5. **Checagem de Ausência de Atletas Desincronizados**:
   ```bash
   ./.venv/bin/python3 -c "
   import sqlite3
   c = sqlite3.connect('data/futebol.db').cursor()
   c.execute('''
       WITH gols_reais AS (SELECT id_jogador, count(*) as n FROM gols WHERE id_jogador > 0 GROUP BY id_jogador)
       SELECT count(*) FROM jogadores_estatisticas j LEFT JOIN gols_reais g ON j.id_jogador = g.id_jogador
       WHERE j.total_gols != COALESCE(g.n, 0);
   ''')
   assert c.fetchone()[0] == 0, 'Falha: existem atletas desincronizados!'
   print('Verificação de Sincronia: 100% OK!')
   "
   ```

6. **Medição de Tamanho Físico do Banco**:
   ```bash
   ./.venv/bin/python3 -c "
   import os
   sz = os.path.getsize('data/futebol.db')
   print(f'Tamanho: {sz} bytes ({sz/1e6:.2f} MB)')
   assert sz < 94000000, 'Tamanho excede 94.0 MB!'
   "
   ```
