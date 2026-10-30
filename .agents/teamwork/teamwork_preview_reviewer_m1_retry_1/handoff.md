# Handoff Report — Reviewer M1 Retry 1 (Independent Verification & Adversarial Audit)

**Agent**: Reviewer M1 Retry 1 (`teamwork_preview_reviewer_m1_retry_1`)  
**Roles**: Reviewer, Adversarial Critic  
**Parent Agent**: `parent` (`9c2d948a-bd66-4e27-83b1-9e8d50e60942`)  
**Timestamp**: 2026-10-30T20:01:00Z  
**Type**: Hard Handoff  
**Verdict**: **APPROVE**  

---

## 1. Observação (Observation)

### 1.1. Inspeção do Patch em `scripts/auditar_integridade_dados.py`
- **Simetria de Deleção e Coleta Prévia na Regra 5 (`scripts/auditar_integridade_dados.py:98-232`)**:
  - `SELECT` detecta:
    ```sql
    WHERE mandante IS NULL OR mandante = '' 
       OR visitante IS NULL OR visitante = ''
       OR mandante LIKE '%Estatísticas%' 
       OR visitante LIKE '%Estatísticas%';
    ```
  - Bloco de coleta prévia (`linhas 109-140`): Executa `SELECT DISTINCT id_jogador` unificando `gols`, `escalacoes` e `cartoes` associados às partidas que satisfazem o critério acima ou com `clube LIKE '%Estatísticas%'`.
  - Blocos de `DELETE` (`linhas 143-190`): Todas as 5 tabelas (`gols`, `odds_partidas`, `escalacoes`, `cartoes`, `partidas`) executam o `DELETE` com alinhamento 100% idêntico às condições do `SELECT`, eliminando a assimetria apontada pelo Challenger M1-1.
  - Recálculo atômico e seguro (`linhas 199-223`): Itera sobre `atletas_afetados`, consulta contagem real em `gols` e união distinta em `(escalacoes UNION gols UNION cartoes)`, atualiza `total_gols`, `total_jogos`, `media_gols_por_jogo`, `participacoes_gols` e `media_participacao_por_jogo` em `jogadores_estatisticas` e `jogadores`. Uso consistente de `max(tot_jogos, 1)` impede `ZeroDivisionError`.
- **Harmonização do Rótulo da Regra 11 (`scripts/auditar_integridade_dados.py:432-446`)**:
  - Rótulo atualizado para `"Coerência de Atletas: Médias Verossímeis (<= 2.5)"`.
  - Filtro SQL: `WHERE (total_jogos <= 0 AND total_gols > 0) OR (total_gols >= 10 AND media_gols_por_jogo > 2.5)`.
  - Foi eliminada a cláusula de auto-reparo forçado (`UPDATE total_jogos = MAX(total_jogos, total_gols)`) que anteriormente igualava artificialmente jogos a gols em atletas com súmulas incompletas.

### 1.2. Verificação de Sincronia dos 25 Atletas e Base Geral
- **Varredura Universal na Base**:
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
  **Resultado**: `0` discrepâncias em toda a base de 19.783 atletas.
- **Amostragem dos Atletas Críticos anteriormente desincronizados**:
  - Raphael Veiga (ID 12): `total_gols = 83` (gols reais = 83), `total_jogos = 177`, `media = 0.47`.
  - Yuri Alberto (ID 48): `total_gols = 83` (gols reais = 83), `total_jogos = 191`, `media = 0.43`.
  - Memphis Depay (ID 49): `total_gols = 18` (gols reais = 18), `total_jogos = 38`, `media = 0.47`.
  - Flaco López (ID 67): `total_gols = 12` (gols reais = 12), `total_jogos = 127`, `media = 0.09`.
  - Endrick (ID 5385): `total_gols = 17` (gols reais = 17), `total_jogos = 22`, `media = 0.77`.
  - Estêvão (ID 5491): `total_gols = 17` (gols reais = 17), `total_jogos = 21`, `media = 0.81`.
  - Neymar (ID 352): `total_gols = 134` (gols reais = 134), `total_jogos = 125`, `media = 1.07`.
  - Jonathan Calleri (ID 1126): `total_gols = 83` (gols reais = 83), `total_jogos = 118`, `media = 0.70`.

### 1.3. Re-vinculação Autêntica de Escalações e Resolução da Carreira Divergente
- **Teste `test_t1_r1_db_no_forced_jogos_equals_gols_with_divergent_career` (`tests/test_e2e_futstats.py:152-167`)**:
  - Consulta executada pelo teste:
    ```sql
    SELECT id_jogador, nome_exibicao, total_jogos, total_gols, jogos_carreira_oficiais
    FROM jogadores_estatisticas
    WHERE total_gols > 10
      AND jogos_carreira_oficiais > total_gols * 1.5
      AND total_jogos = total_gols;
    ```
  - **Resultado**: `0` anomalias retornadas.
- **Auditoria de Autenticidade em Serginho e Flaco López**:
  - Serginho (ID 12636): `total_jogos = 76`, `total_gols = 45`, `jogos_carreira_oficiais = 200`. Possui 47 escalações autênticas no Criciúma (partidas reais de 2024 contra Fluminense, Vitória, Cruzeiro, São Paulo, etc.). O total de 76 partidas distintas corresponde exatamente a `COUNT(DISTINCT id_partida)` entre escalações, gols e cartões. O ID fragmentado 21287 teve seus registros transferidos e contadores zerados.
  - Flaco López (ID 67): `total_jogos = 127`, `total_gols = 12`, `jogos_carreira_oficiais = 294`, `gols_carreira_oficiais = 102`. Possui 115 escalações autênticas no Palmeiras (jogos reais de 2024/2025 contra Ceará, Atlético-MG, Fluminense, Vitória, etc.). O total de 127 partidas distintas reflete a presença comprovada em campo. O ID fragmentado 19997 teve seus contadores zerados e escalações unificadas.
  - **Ausência de integridade fraudulenta**: Não há dados fabricados ou mascaramento superficial; a vinculação restabeleceu relações relacionais verídicas a partir de súmulas reais.

### 1.4. Execução Verbatim dos Comandos de Validação
1. `scripts/auditar_integridade_dados.py`:
   - 12/12 regras com `"status": "OK"`.
   - `"inconsistencias_encontradas": 0`, `"inconsistencias_reparadas": 0`.
   - Saída limpa, código de retorno 0.
2. `./.venv/bin/pytest tests/test_model_evals.py`:
   - `22 passed in 0.32s` (código de retorno 0).
3. `./.venv/bin/pytest tests/test_e2e_futstats.py -k "test_t1_r1_db_no_forced_jogos_equals_gols_with_divergent_career"`:
   - `1 passed, 49 deselected in 0.30s` (código de retorno 0).
4. `./.venv/bin/pytest tests/test_e2e_futstats.py -m "r4"`:
   - `9 passed, 41 deselected in 3.97s` (código de retorno 0).
5. `./.venv/bin/pytest tests/test_e2e_futstats.py -m "r3"`:
   - `11 passed, 39 deselected in 0.47s` (código de retorno 0).
6. Tamanho físico do banco `data/futebol.db`:
   - `88,580,096 bytes` (**88.58 MB decimais** / **84.48 MiB binários**).
   - Margem de segurança de **5.42 MB** abaixo do teto restritivo de 94.0 MB.
7. Integridade do SQLite:
   - `PRAGMA integrity_check;` -> `[('ok',)]`.
8. Frontend Build:
   - `npm run build` na pasta `frontend/` executado com sucesso: `✓ built in 4.95s` (código de retorno 0).

---

## 2. Cadeia Lógica (Logic Chain)

1. **Da Causa-Raiz à Resolução Relacional**:
   A desincronização entre `gols` e `jogadores_estatisticas` decorria de antigas exclusões físicas de partidas e gols que não haviam acionado o recálculo dos agregados. A atualização dos 25 atletas restabeleceu paridade matemática exata (`total_gols == COUNT(gols)`), comprovada pela varredura de zero discrepâncias em todos os 19.783 atletas.
2. **Da Re-vinculação Atômica à Autenticidade dos Dados**:
   O teste de aceitação reprovava porque Serginho e Flaco tinham escalações separadas sob códigos alternativos da CBF (21287 e 19997). Ao redirecionar as 31 escalações de Serginho e as 115 escalações de Flaco para seus IDs canônicos (12636 e 67), o número de jogos refletiu as partidas reais jogadas em campo (76 e 127 jogos), eliminando de forma autêntica e fundamentada a condição `total_jogos == total_gols`.
3. **Do Estresse Adversarial à Blindagem contra Regressões**:
   Em simulação de estresse com banco em memória contendo partidas nulas, vazias e com artefatos de scraping, o código refatorado da Regra 5 coletou com precisão os atletas afetados antes da purga, deletou os registros em cascata simétrica e recalculou estatísticas sem divisão por zero. A reexecução do auditor na base de produção provou idempotência estrita (0 inconsistências e 0 alterações colaterais).
4. **Da Conformidade com Limites Operacionais e Regras do Projeto**:
   O tamanho do arquivo SQLite (`88.58 MB`) respeita com 5.42 MB de folga o limite de 94.0 MB. A suíte preditiva de Dixon-Coles (22/22) e a suíte R4 (9/9) mantiveram 100% de aprovação. O build do frontend passou sem erros.

---

## 3. Ressalvas (Caveats)

- **Escopo Delimitado ao Milestone M1**: As 306 partidas históricas com placar 0x0 contendo gols cadastrados e confrontos de competições Conmebol (Libertadores/Sul-Americana) permanecem alocadas para saneamento estrutural no Milestone M2 (Features 5, 6 e 7), conforme já delimitado e homologado no relatório do Challenger M1-1. Os testes que falham na execução global de `test_e2e_futstats.py` pertencem exclusivamente aos milestones subsequentes (flags de acervo parcial da API e confrontos Conmebol).
- **Consolidação de Homônimos Estaduais**: Fragmentos secundários de ligas estaduais de Flaco López (IDs 7708 e 7789) serão incorporados na Feature 6 (M2). A unificação de escalações entre 19997 e 67 sanou plenamente os requisitos de integridade do M1.

---

## 4. Conclusão (Conclusion)

A remediação realizada pelo Worker M1 Retry é **tecnicamente robusta, fundamentada em dados autênticos e livre de atalhos artificiais ou hardcoding**.
Todas as falhas apontadas pelo Challenger M1-1 foram solucionadas em nível de causa-raiz:
1. `scripts/auditar_integridade_dados.py` corrigido com deleção simétrica, pre-coleta e ressincronização atômica.
2. 0 atletas desincronizados na base inteira.
3. 0 anomalias no teste de divergência de carreira (`test_t1_r1_db_no_forced_jogos_equals_gols_with_divergent_career`).
4. 12/12 regras do auditor aprovadas, 22/22 testes de modelos preditivos aprovados, 9/9 testes R4 aprovados.
5. Tamanho do banco mantido em 88.58 MB (< 94.0 MB).

**Veredito Final**: **APPROVE**

---

## 5. Método de Verificação Independente (Verification Method)

Para reproduzir integralmente esta auditoria independente:

1. **Auditoria Relacional de Integridade (12/12 OK)**:
   ```bash
   ./.venv/bin/python3 scripts/auditar_integridade_dados.py
   ```
   *Critério*: `"inconsistencias_encontradas": 0` e 12 regras com `"status": "OK"`.

2. **Verificação de Ausência Total de Desincronizações em Atletas**:
   ```bash
   ./.venv/bin/python3 -c "
   import sqlite3
   c = sqlite3.connect('data/futebol.db').cursor()
   c.execute('''
       WITH gols_reais AS (SELECT id_jogador, count(*) n FROM gols WHERE id_jogador > 0 GROUP BY id_jogador)
       SELECT count(*) FROM jogadores_estatisticas j LEFT JOIN gols_reais g ON j.id_jogador = g.id_jogador
       WHERE j.total_gols != COALESCE(g.n, 0);
   ''')
   assert c.fetchone()[0] == 0, 'Existem atletas desincronizados!'
   print('Sincronia de atletas: 100% OK (0 discrepâncias)')
   "
   ```

3. **Teste de Carreira Divergente**:
   ```bash
   ./.venv/bin/pytest tests/test_e2e_futstats.py -k "test_t1_r1_db_no_forced_jogos_equals_gols_with_divergent_career"
   ```
   *Critério*: `1 passed in <1s`.

4. **Suíte Preditiva e Gates de Regressão Dixon-Coles (22/22 Passed)**:
   ```bash
   ./.venv/bin/pytest tests/test_model_evals.py
   ```
   *Critério*: `22 passed in <1s`.

5. **Suíte de Integridade e Storage R4 (9/9 Passed)**:
   ```bash
   ./.venv/bin/pytest tests/test_e2e_futstats.py -m "r4"
   ```
   *Critério*: `9 passed in <5s`.

6. **Medição de Tamanho Físico e Integridade SQLite**:
   ```bash
   ./.venv/bin/python3 -c "
   import os, sqlite3
   sz = os.path.getsize('data/futebol.db')
   print(f'Tamanho: {sz} bytes ({sz/1e6:.2f} MB)')
   assert sz < 94000000, 'Tamanho excede 94.0 MB!'
   conn = sqlite3.connect('data/futebol.db')
   assert conn.cursor().execute('PRAGMA integrity_check;').fetchone()[0] == 'ok'
   print('Integridade física SQLite: OK')
   "
   ```

7. **Build do Frontend**:
   ```bash
   cd frontend && npm run build
   ```
   *Critério*: `✓ built` com código de retorno 0.
