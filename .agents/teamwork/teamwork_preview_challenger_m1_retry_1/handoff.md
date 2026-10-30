# Handoff Report — Challenger M1 Retry 1 (Adversarial Re-verification)

**Milestone**: M1 Retry (Features 1, 2, 3, 4 Remediation)  
**Agent**: Challenger M1 Retry 1 (`teamwork_preview_challenger_m1_retry_1`)  
**Parent Agent**: `parent` (`9c2d948a-bd66-4e27-83b1-9e8d50e60942`)  
**Timestamp**: 2026-10-30T19:59:30Z  
**Type**: Hard Handoff (Final Re-verification & Approval)  
**Verdict**: **APPROVE**

---

## 1. Observação (Observation)

### 1.1. Defeito 1 — Re-avaliação da Sincronização de Atletas (`jogadores_estatisticas` vs `gols`)
- **Comando executado**:
  ```sql
  WITH gols_reais AS (
      SELECT id_jogador, count(*) as n 
      FROM gols 
      WHERE id_jogador IS NOT NULL AND id_jogador > 0 
      GROUP BY id_jogador
  )
  SELECT count(*)
  FROM jogadores_estatisticas j
  LEFT JOIN gols_reais g ON j.id_jogador = g.id_jogador
  WHERE j.total_gols != COALESCE(g.n, 0);
  ```
- **Resultado Verbatim**: `0` desincronizações em todo o universo de **19.783 atletas** cadastrados (**0.00% de divergência**).
- **Amostragem dos 25 Atletas Críticos Reportados na Iteração 1**:
  - Raphael Veiga (ID 12): `total_jogos = 177`, `total_gols = 83`, `gols_reais = 83`, `diff = 0`, `media_gols_por_jogo = 0.47`.
  - Yuri Alberto (ID 48): `total_jogos = 191`, `total_gols = 83`, `gols_reais = 83`, `diff = 0`, `media_gols_por_jogo = 0.43`.
  - Memphis Depay (ID 49): `total_jogos = 38`, `total_gols = 18`, `gols_reais = 18`, `diff = 0`, `media_gols_por_jogo = 0.47`.
  - Flaco López (ID 67): `total_jogos = 127`, `total_gols = 12`, `gols_reais = 12`, `diff = 0`, `media_gols_por_jogo = 0.09`.
  - Joaquín Piquerez (ID 69): `total_jogos = 42`, `total_gols = 8`, `gols_reais = 8`, `diff = 0`, `media_gols_por_jogo = 0.19`.
  - Eduardo Sasha (ID 78): `total_jogos = 133`, `total_gols = 81`, `gols_reais = 81`, `diff = 0`, `media_gols_por_jogo = 0.61`.
  - Vitinho (ID 166): `total_jogos = 185`, `total_gols = 53`, `gols_reais = 53`, `diff = 0`, `media_gols_por_jogo = 0.29`.
  - Tiquinho Soares (ID 238): `total_jogos = 59`, `total_gols = 31`, `gols_reais = 31`, `diff = 0`, `media_gols_por_jogo = 0.53`.
  - Neymar (ID 352): `total_jogos = 125`, `total_gols = 134`, `gols_reais = 134`, `diff = 0`, `media_gols_por_jogo = 1.07`.
  - Jonathan Calleri (ID 1126): `total_jogos = 118`, `total_gols = 83`, `gols_reais = 83`, `diff = 0`, `media_gols_por_jogo = 0.70`.
  - Endrick (ID 5385): `total_jogos = 22`, `total_gols = 17`, `gols_reais = 17`, `diff = 0`, `media_gols_por_jogo = 0.77`.
  - Estêvão (ID 5491): `total_jogos = 21`, `total_gols = 17`, `gols_reais = 17`, `diff = 0`, `media_gols_por_jogo = 0.81`.
  - Serginho (ID 12636): `total_jogos = 76`, `total_gols = 45`, `gols_reais = 45`, `diff = 0`, `media_gols_por_jogo = 0.59`.

### 1.2. Defeito 2 — Teste de Carreira Divergente (`test_t1_r1_db_no_forced_jogos_equals_gols_with_divergent_career`)
- **Comando executado**:
  ```bash
  ./.venv/bin/pytest tests/test_e2e_futstats.py -k "test_t1_r1_db_no_forced_jogos_equals_gols_with_divergent_career" -vv
  ```
- **Resultado Verbatim**:
  ```
  tests/test_e2e_futstats.py::TestTier1FeatureCoverage::test_t1_r1_db_no_forced_jogos_equals_gols_with_divergent_career PASSED [100%]
  1 passed, 49 deselected in 0.36s
  ```
- **Inspeção de Anomalias Sem LIMIT**:
  Consulta direta de `SELECT id_jogador FROM jogadores_estatisticas WHERE total_gols > 10 AND jogos_carreira_oficiais > total_gols * 1.5 AND total_jogos = total_gols;` retornou **0 registros**.
- **Auditoria de Integridade dos IDs Secundários Integrados**:
  - Serginho (ID 12636): `total_jogos = 76`, `total_gols = 45`, `jogos_carreira_oficiais = 200`. ID secundário 21287: 0 escalações, 0 gols, contadores zerados. Duplicatas de escalação no ID 12636: 0.
  - Flaco López (ID 67): `total_jogos = 127`, `total_gols = 12`, `jogos_carreira_oficiais = 294`. ID secundário 19997: 0 escalações, 0 gols, contadores zerados. Duplicatas de escalação no ID 67: 0.

### 1.3. Defeito 3 — Endurecimento e Simetria do Auto-Reparo da Regra 5 (`scripts/auditar_integridade_dados.py`)
- **Inspeção de Código (`scripts/auditar_integridade_dados.py:98-232`)**:
  - **Simetria Completa**: O `SELECT` e todas as cláusulas `DELETE` compartilham idêntico predicado:
    ```sql
    WHERE mandante IS NULL OR mandante = '' 
       OR visitante IS NULL OR visitante = ''
       OR mandante LIKE '%Estatísticas%' 
       OR visitante LIKE '%Estatísticas%'
    ```
  - **Deleção em Cascata Segura**: A purga remove em ordem estrita de integridade relacional: dependências em `gols` (incluindo `OR clube LIKE '%Estatísticas%'`), `odds_partidas`, `escalacoes`, `cartoes` e finalmente `partidas`.
  - **Captura Prévia e Recálculo Atômico**: Coleta previamente `atletas_afetados` e dispara recálculo dinâmico de `total_gols`, `total_jogos`, `media_gols_por_jogo`, `participacoes_gols` e `media_participacao_por_jogo` em `jogadores_estatisticas` e `jogadores`.
  - **Harmonização da Regra 11**: Rótulo ajustado para `"Coerência de Atletas: Médias Verossímeis (<= 2.5)"` e remoção do auto-reparo prejudicial `SET total_jogos = MAX(total_jogos, total_gols)`.
- **Harness de Teste de Estresse Empírico**:
  - Criado banco em memória com partidas contendo `mandante IS NULL`, `visitante = ''` e `mandante = 'Estatísticas FC'` atreladas a atleta de teste com gols, escalações e cartões.
  - O auto-reparo detectou exatamente as 3 partidas inválidas, excluiu todos os registros filhos órfãos, limpou artefatos de texto na coluna `clubes`, e recalculou perfeitamente os contadores do atleta (de 5 jogos/4 gols para 2 jogos/2 gols e média 1.0), sem deixar resíduos.

### 1.4. Verificação de Regressão, Desempenho e Integridade Global
- **Auditoria Relacional Completa (`python scripts/auditar_integridade_dados.py`)**:
  - `12/12 regras OK`, `inconsistencias_encontradas: 0`, `inconsistencias_reparadas: 0`.
- **Gates de Regressão Dixon-Coles (`pytest tests/test_model_evals.py`)**:
  - `22 passed in 0.31s` (100% de aprovação).
- **Suíte E2E Grupo R4 (`pytest tests/test_e2e_futstats.py -m "r4"`)**:
  - `9 passed, 41 deselected in 3.94s` (100% de aprovação).
- **Tamanho Físico de `data/futebol.db`**:
  - `88,580,096 bytes` (**88.58 MB decimais** / **84.48 MiB binários**).
  - Folga de **5.42 MB** abaixo do teto de 94.0 MB.
- **Saúde do Banco SQLite**:
  - `PRAGMA integrity_check` $\rightarrow$ `[('ok',)]`.
  - `PRAGMA quick_check` $\rightarrow$ `[('ok',)]`.
- **Frontend Build (`npm run build` em `frontend/`)**:
  - `✓ built in 7.58s` com código de saída 0.

---

## 2. Cadeia Lógica (Logic Chain)

1. **Da Observação 1.1 à Resolução do Defeito 1**:
   A execução da CTE pushdown corrigiu na raiz a desincronização entre agregados e tabelas fato. O censo exaustivo demonstrou zero atletas com contagem divergente entre `jogadores_estatisticas` e `gols` em todo o banco.
2. **Da Observação 1.2 à Resolução do Defeito 2**:
   A integração das escalações dos IDs alternativos para os IDs canônicos (Serginho e Flaco López) restaurou a integridade histórica de presenças (76 e 127 partidas), eliminando o clamping espúrio onde `total_jogos == total_gols` com carreira oficial ampla.
3. **Da Observação 1.3 à Resolução do Defeito 3**:
   A inclusão das cláusulas de clubes nulos e vazios no `DELETE` e a introdução da rotina atômica de recálculo estatístico pós-deleção garantem simetria absoluta entre auditoria e auto-cura. O teste empírico em ambiente isolado confirmou imunidade contra regressões de contadores.
4. **Da Observação 1.4 à Ausência de Efeitos Colaterais**:
   A integridade física (`ok`), o tamanho sob controle (88.58 MB < 94.0 MB), a aprovação de todos os regression gates preditivos (22/22) e o build do frontend (7.58s) atestam que a remediação foi cirúrgica, limpa e estável.

---

## 3. Ressalvas e Limitações (Caveats)

- **Escopo Delimitado ao Milestone M1**: As 306 partidas históricas marcadas como 0x0 com gols cadastrados e confrontos Conmebol permanecem alocadas para resolução estrutural no Milestone M2 (Features 5, 6 e 7), conforme já acordado na Iteração 1.
- **Tabela Legada `jogadores`**: A tabela histórica `jogadores` possui contadores desatualizados para alguns atletas legados de scrapers antigos, enquanto `jogadores_estatisticas` (a tabela canônica utilizada pelas rotas, modelos e interface) está 100% íntegra.

---

## 4. Conclusão (Conclusion)

**Veredito: APPROVE**

Os 3 defeitos reportados na Iteração 1 foram empiricamente verificados e confirmados como 100% sanados:
1. Sincronização exata de gols em `jogadores_estatisticas` para todos os 19.783 atletas (0 falhas).
2. Teste de aceitação `test_t1_r1_db_no_forced_jogos_equals_gols_with_divergent_career` aprovado sem qualquer anomalia.
3. Regra 5 de `auditar_integridade_dados.py` endurecida, com simetria estrita entre SELECT e DELETE e recálculo atômico de atletas afetados.

O Milestone M1 atinge status de conformidade total com os requisitos de integridade, desempenho e teto de armazenamento. Aprovado para prosseguimento para o Milestone M2.

---

## 5. Método de Verificação Independente (Verification Method)

Para reproduzir de forma autônoma e independente:

1. **Checagem Exaustiva de Sincronia de Gols**:
   ```bash
   ./.venv/bin/python3 -c "
   import sqlite3
   c = sqlite3.connect('data/futebol.db').cursor()
   c.execute('''
       WITH gols_reais AS (SELECT id_jogador, count(*) as n FROM gols WHERE id_jogador > 0 GROUP BY id_jogador)
       SELECT count(*) FROM jogadores_estatisticas j LEFT JOIN gols_reais g ON j.id_jogador = g.id_jogador
       WHERE j.total_gols != COALESCE(g.n, 0);
   ''')
   assert c.fetchone()[0] == 0, 'Desincronização encontrada!'
   print('Sincronia de Gols: 100% OK!')
   "
   ```

2. **Teste de Carreira Divergente (E2E)**:
   ```bash
   ./.venv/bin/pytest tests/test_e2e_futstats.py -k "test_t1_r1_db_no_forced_jogos_equals_gols_with_divergent_career"
   ```

3. **Auditoria de Integridade de Dados (12 Regras)**:
   ```bash
   ./.venv/bin/python3 scripts/auditar_integridade_dados.py
   ```

4. **Regressão Dixon-Coles e R4**:
   ```bash
   ./.venv/bin/pytest tests/test_model_evals.py
   ./.venv/bin/pytest tests/test_e2e_futstats.py -m "r4"
   ```

5. **Tamanho do Banco**:
   ```bash
   ./.venv/bin/python3 -c "import os; sz=os.path.getsize('data/futebol.db'); assert sz < 94000000; print(f'OK: {sz} bytes')"
   ```
