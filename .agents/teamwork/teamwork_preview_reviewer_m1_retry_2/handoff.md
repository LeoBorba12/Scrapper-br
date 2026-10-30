# Handoff Report — Reviewer M1 Retry 2 (Independent Audit & Adversarial Evaluation)

**Agent**: Reviewer M1 Retry 2 (`teamwork_preview_reviewer_m1_retry_2`)  
**Parent Agent**: `parent` (`9c2d948a-bd66-4e27-83b1-9e8d50e60942`)  
**Timestamp**: 2026-10-30T20:03:00Z  
**Type**: Hard Handoff (Full Independent Verification & Adversarial Stress-Test Complete)  
**Verdict**: **APPROVE**

---

## 1. Observação (Observation)

### 1.1. Verificação Física e Estrutural do Banco de Dados (`data/futebol.db`)
- **Tamanho Físico do Banco**:
  Comando: `python3 -c "import os; sz = os.path.getsize('data/futebol.db'); print(sz, sz/1e6)"`  
  Resultado verbatim: `88580096 bytes (88.58 MB decimais / 84.48 MiB binários)`.  
  Margem de segurança: **5.42 MB abaixo do teto restritivo de 94.0 MB** da Vercel.
- **Integridade Física SQLite**:
  Comando: `PRAGMA integrity_check;`  
  Resultado verbatim: `[('ok',)]`.
- **Integridade Relacional de Chaves e Órfãos**:
  - Gols órfãos (`LEFT JOIN partidas`): `0`.
  - Escalações órfãs (`LEFT JOIN partidas`): `0`.
  - Cartões órfãos (`LEFT JOIN partidas`): `0`.
  - Odds órfãs (`LEFT JOIN partidas`): `0`.

### 1.2. Re-vinculação de Escalações e Carreira (Serginho e Flaco López)
- **Serginho (ID Canônico 12636 & Fragmento 21287)**:
  - `jogadores_estatisticas`: `id_jogador=12636, total_jogos=76, total_gols=45, media_gols_por_jogo=0.59, jogos_carreira_oficiais=200`.
  - Escalações diretas associadas ao ID 12636: `47`.
  - Presenças distintas (`escalacoes UNION gols UNION cartoes`): `76`.
  - Escalações residuais no ID secundário 21287: `0`.
  - Escalações duplicadas na mesma partida: `[]` (zero duplicatas).
  - Clubes presentes nas escalações de Serginho: `['Vasco da Gama', 'Criciúma', 'Santos', 'América-MG', 'Atlético-MG', 'Vitória', 'Confiança (SE)', 'Red Bull Bragantino', 'Vasco', 'Oeste', 'Mirassol']` (clubes reais e autênticos).
- **Flaco López (ID Canônico 67 & Fragmento 19997)**:
  - `jogadores_estatisticas`: `id_jogador=67, total_jogos=127, total_gols=12, media_gols_por_jogo=0.09, jogos_carreira_oficiais=294, gols_carreira_oficiais=102`.
  - Escalações diretas associadas ao ID 67: `115`.
  - Presenças distintas (`escalacoes UNION gols UNION cartoes`): `127`.
  - Escalações residuais no ID secundário 19997: `0`.
  - Escalações duplicadas na mesma partida: `[]` (zero duplicatas).
  - Tabela `jogadores`: `(67, 'Flaco López', total_jogos=127, total_gols=12)`.
- **Zero Anomalias de Carreira Divergente**:
  Consulta SQL executada:
  ```sql
  SELECT id_jogador, nome_exibicao, total_jogos, total_gols, jogos_carreira_oficiais
  FROM jogadores_estatisticas
  WHERE total_gols > 10
    AND jogos_carreira_oficiais > total_gols * 1.5
    AND total_jogos = total_gols;
  ```
  Resultado verbatim: **0 anomalias** encontradas na base inteira.

### 1.3. Sincronização Integral de `jogadores_estatisticas` com a Tabela `gols`
- Consulta SQL executada em toda a base de 19.783 atletas:
  ```sql
  WITH gols_reais AS (
      SELECT id_jogador, count(*) as n 
      FROM gols 
      WHERE id_jogador > 0 
      GROUP BY id_jogador
  )
  SELECT count(*)
  FROM jogadores_estatisticas j 
  LEFT JOIN gols_reais g ON j.id_jogador = g.id_jogador
  WHERE j.total_gols != COALESCE(g.n, 0);
  ```
  Resultado verbatim: **`0` atletas desincronizados**.
- Todos os 25 atletas apontados pelo Challenger M1-1 foram checados individualmente e confirmados com paridade exata:
  - Raphael Veiga (12): `total_gols = 83`, `gols reais = 83`, `total_jogos = 177`.
  - Yuri Alberto (48): `total_gols = 83`, `gols reais = 83`, `total_jogos = 191`.
  - Memphis Depay (49): `total_gols = 18`, `gols reais = 18`, `total_jogos = 38`.
  - Flaco López (67): `total_gols = 12`, `gols reais = 12`, `total_jogos = 127`.
  - Neymar (352): `total_gols = 134`, `gols reais = 134`, `total_jogos = 125`.
  - Jonathan Calleri (1126): `total_gols = 83`, `gols reais = 83`, `total_jogos = 118`.
  - Endrick (5385): `total_gols = 17`, `gols reais = 17`, `total_jogos = 22`.
  - Estêvão (5491): `total_gols = 17`, `gols reais = 17`, `total_jogos = 21`.

### 1.4. Auditoria de Código (`scripts/auditar_integridade_dados.py`)
- **Regra 5 (Deleção Simétrica & Auto-Ressincronização)**:
  - Linhas 98-105: O `SELECT` filtra partidas com clubes vazios, nulos ou com `'Estatísticas'`.
  - Linhas 109-140: Coleta previamente `atletas_afetados` em `gols`, `escalacoes` e `cartoes`.
  - Linhas 143-190: `DELETE` executado com simetria estrita em cascata (`gols`, `odds_partidas`, `escalacoes`, `cartoes`, `partidas`), cobrindo tanto `'Estatísticas'` quanto clubes nulos/vazios.
  - Linhas 198-223: Recálculo atômico dinâmico por agregação SQL real de `total_gols`, `total_jogos`, `media_gols_por_jogo`, `participacoes_gols` e `media_participacao_por_jogo` em `jogadores_estatisticas` e `jogadores` para cada atleta afetado.
  - Ausência de valores hardcoded ou atalhos artificiais.
- **Regra 11 (Alinhamento de Rótulo)**:
  - Título harmonizado para `"Coerência de Atletas: Médias Verossímeis (<= 2.5)"`.
  - SQL executa `WHERE (total_jogos <= 0 AND total_gols > 0) OR (total_gols >= 10 AND media_gols_por_jogo > 2.5);`.
  - Auto-reparo forçado nocivo (`UPDATE jogadores_estatisticas SET total_jogos = MAX(...)`) foi suprimido.

### 1.5. Execução Verbatim dos Comandos de Teste Obrigatórios
1. **Auditoria de Integridade de Dados (`scripts/auditar_integridade_dados.py`)**:
   `./.venv/bin/python3 scripts/auditar_integridade_dados.py`  
   Resultado: `12/12 regras com status: "OK"`, `inconsistencias_encontradas: 0`, `inconsistencias_reparadas: 0`.
2. **Suíte de Avaliação Preditiva Dixon-Coles (`tests/test_model_evals.py`)**:
   `./.venv/bin/pytest tests/test_model_evals.py`  
   Resultado: `22 passed in 0.31s`.
3. **Teste de Carreira Divergente (`tests/test_e2e_futstats.py`)**:
   `./.venv/bin/pytest tests/test_e2e_futstats.py -k "test_t1_r1_db_no_forced_jogos_equals_gols_with_divergent_career"`  
   Resultado: `1 passed, 49 deselected in 1.06s`.
4. **Testes do Grupo R4 de Storage e Confiabilidade (`tests/test_e2e_futstats.py`)**:
   `./.venv/bin/pytest tests/test_e2e_futstats.py -m "r4"`  
   Resultado: `9 passed, 41 deselected in 4.44s`.
5. **Build do Frontend (`npm run build` em `frontend/`)**:
   Resultado: `✓ built in 5.96s` (código de saída 0).

---

## 2. Cadeia Lógica (Logic Chain)

1. **Da Causa-Raiz à Resolução Relacional (Ref. Obs 1.2 e 1.3)**:
   A quebra identificada pelo Challenger M1-1 foi originada pela exclusão pontual de registros com artefatos de scraping sem o correspondente recálculo dos contadores em `jogadores_estatisticas`. A CTE executada pelo Worker restabeleceu a integridade matemática entre a tabela normalizada de eventos (`gols`) e a tabela de resumo (`jogadores_estatisticas`), resultando em 0 divergências em toda a base.
2. **Da Re-vinculação de Escalações à Eliminação de Falsas Equivalências (Ref. Obs 1.2)**:
   A falha em `test_t1_r1_db_no_forced_jogos_equals_gols_with_divergent_career` decorria da segregação de escalações em IDs alternativos (21287 e 19997). Ao migrar essas escalações no nível atômico para os IDs canônicos (12636 e 67), o número de presenças reais saltou para 76 (Serginho) e 127 (Flaco López), eliminando de forma autêntica e fundamentada em dados a anomalia `total_jogos == total_gols`.
3. **Da Blindagem do Auditor à Prevenção de Regressões (Ref. Obs 1.4)**:
   A inclusão do recálculo de contadores no auto-reparo da Regra 5 garante que quaisquer futuras limpezas de partidas defeituosas ajustem dinamicamente as estatísticas dos atletas afetados. O alinhamento dos predicados no `SELECT` e `DELETE` fecha a brecha onde partidas com clubes nulos poderiam ser contabilizadas mas não purgadas.
4. **Da Conformidade com Contratos e Limites Operacionais (Ref. Obs 1.1 e 1.5)**:
   O banco SQLite permanece consolidado em 88.58 MB (5.42 MB abaixo do limite de 94.0 MB), a integridade física `PRAGMA integrity_check` é perfeita, e todos os testes mandatários de M1 passaram com 100% de sucesso.
5. **Avaliação Adversarial de Integridade (Ref. Obs 1.4)**:
   Não foram detectados atalhos espúrios, stubs de fachada ou valores hardcoded vinculados aos testes. O trabalho atende plenamente aos critérios de qualidade e integridade.

---

## 3. Avaliação Adversarial & Stress Tests (Critic Role)

### 3.1. Stress Test 1: Injeção de Partida com Clube Espúrio e Auto-Reparo Dinâmico
- **Hipótese Adversarial**: O auto-reparo da Regra 5 poderia falhar ao lidar com um novo caso real de partida contendo artefato `'Estatísticas'`, deixando gols órfãos ou contadores inconsistentes.
- **Cenário de Teste**: Em cópia isolada temporária do banco (`/tmp/test_rule5_stress.db`), injetou-se uma partida espúria com `mandante = 'Estatísticas FC'`, associada a um gol e uma escalação do atleta Raphael Veiga (ID 12), incrementando artificialmente seus contadores.
- **Resultado**:
  - `atletas_afetados` detectou dinamicamente `[12]`.
  - Partida, gol e escalação espúrios foram deletados.
  - Os contadores de Raphael Veiga foram automaticamente ressincronizados para os valores exatos de base (`83` gols e `177` jogos).
  - Status: **APROVADO (Robustez comprovada)**.

### 3.2. Stress Test 2: Risco de Duplicação de Escalações em Partidas
- **Hipótese Adversarial**: A migração de escalações de IDs secundários para os canônicos poderia criar duplicatas de `(id_partida, id_jogador)` onde ambos os IDs tivessem registro no mesmo jogo.
- **Resultado**: Consulta `SELECT id_partida, count(*) FROM escalacoes WHERE id_jogador IN (12636, 67) GROUP BY id_partida HAVING count(*) > 1` retornou conjunto vazio. Zero duplicatas geradas.
- **Status**: **APROVADO**.

### 3.3. Stress Test 3: Integridade da Tabela Legada `jogadores`
- **Hipótese Adversarial**: A tabela `jogadores` (legada, contendo 3.639 registros contra 19.783 em `jogadores_estatisticas`) poderia manter contadores divergentes e afetar funcionalidades ativas.
- **Observação**: Identificou-se que 52 atletas na tabela `jogadores` contêm contadores pré-saneamento (ex: Veiga com 85 vs 83).
- **Avaliação de Risco**: **BAIXO / INFORMATIVO**. O backend (`backend/app.py`), scripts de auditoria e rotas da API consom exclusivamente a tabela canônica `jogadores_estatisticas`. Nenhum endpoint ou teste consome `jogadores.total_gols`. Recomenda-se apenas alinhamento de rotina em M2.

---

## 4. Ressalvas e Limitações (Caveats)

1. **Escopo Delimitado ao Milestone M1**:
   As 306 partidas históricas marcadas como 0x0 com gols cadastrados e confrontos Conmebol permanecem alocadas para resolução estrutural no Milestone M2 (Features 5, 6 e 7), conforme alinhamento prévio estabelecido pelo Challenger M1-1 e Sentinel.
2. **Endpoints de API em Construção (M3 / M4)**:
   Os testes E2E com falha no Tier 1 (rotas `/api/jogadores/perfil` com flag `acervo_parcial`) e Tier 2 (Conmebol) pertencem formalmente às entregas de backend e frontend dos marcos subsequentes M2, M3 e M4.

---

## 5. Conclusão e Veredito (Conclusion)

**Veredito: APPROVE**

A remediação realizada pelo Worker M1 Retry é tecnicamente sólida, robusta e livre de atalhos ou violações de integridade:
- Todos os 25 atletas desincronizados foram corrigidos na causa-raiz via contagem atômica de eventos.
- As escalações de Serginho e Flaco López foram devidamente re-vinculadas, sem duplicatas ou orfandade.
- `scripts/auditar_integridade_dados.py` opera agora com auto-reparo simétrico e recálculo dinâmico automático.
- Todos os testes mandatários de M1 passaram com 100% de sucesso.
- O banco de dados mantém 5.42 MB de margem abaixo do teto de 94.0 MB com `PRAGMA integrity_check = ok`.

---

## 6. Método de Verificação Independente (Verification Method)

Para reproduzir integralmente esta auditoria:

1. **Auditoria Relacional (12/12 OK)**:
   ```bash
   ./.venv/bin/python3 scripts/auditar_integridade_dados.py
   ```
2. **Regressão Dixon-Coles (22/22 Passed)**:
   ```bash
   ./.venv/bin/pytest tests/test_model_evals.py
   ```
3. **Teste de Carreira Divergente (1 Passed)**:
   ```bash
   ./.venv/bin/pytest tests/test_e2e_futstats.py -k "test_t1_r1_db_no_forced_jogos_equals_gols_with_divergent_career"
   ```
4. **Suíte E2E R4 (9/9 Passed)**:
   ```bash
   ./.venv/bin/pytest tests/test_e2e_futstats.py -m "r4"
   ```
5. **Verificação de Desincronização Zero em Atletas**:
   ```bash
   ./.venv/bin/python3 -c "
   import sqlite3
   c = sqlite3.connect('data/futebol.db').cursor()
   c.execute('''
       WITH gr AS (SELECT id_jogador, count(*) n FROM gols WHERE id_jogador > 0 GROUP BY id_jogador)
       SELECT count(*) FROM jogadores_estatisticas j LEFT JOIN gr ON j.id_jogador = gr.id_jogador
       WHERE j.total_gols != COALESCE(gr.n, 0);
   ''')
   assert c.fetchone()[0] == 0, 'Desincronizacao detectada!'
   print('Sincronia 100% OK!')
   "
   ```
6. **Integridade e Tamanho do Banco**:
   ```bash
   ./.venv/bin/python3 -c "
   import sqlite3, os
   sz = os.path.getsize('data/futebol.db')
   print(f'Tamanho: {sz} bytes ({sz/1e6:.2f} MB)')
   assert sz < 94000000
   c = sqlite3.connect('data/futebol.db').cursor()
   c.execute('PRAGMA integrity_check;')
   assert c.fetchone()[0] == 'ok'
   print('Integridade OK!')
   "
   ```
7. **Frontend Build**:
   ```bash
   cd frontend && npm run build
   ```
