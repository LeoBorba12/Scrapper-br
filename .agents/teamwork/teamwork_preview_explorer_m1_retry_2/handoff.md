# Handoff Report — Explorer M1 Retry 2 (Acceptance Test Career Divergence & Serginho/Flaco Fix)

**Milestone**: M1 Retry (Remediação de Bloqueio do Gate M1)  
**Agent**: Explorer M1 Retry 2 (`teamwork_preview_explorer_m1_retry_2`)  
**Parent Agent**: `parent` (`9c2d948a-bd66-4e27-83b1-9e8d50e60942`)  
**Data**: 2026-10-30T19:36:00Z  
**Status**: CONCLUÍDO (Hard Handoff)

---

## 1. Observação (Observation)

### 1.1. Diagnóstico do Teste Falho `test_t1_r1_db_no_forced_jogos_equals_gols_with_divergent_career`
- **Arquivo**: `tests/test_e2e_futstats.py:152-167`
- **Código do Teste**:
  ```python
  @pytest.mark.tier1
  @pytest.mark.r1
  def test_t1_r1_db_no_forced_jogos_equals_gols_with_divergent_career(self, db_conn):
      """Nenhum atleta com carreira oficial divergente (>10 gols) deve ter total_jogos forçado a total_gols."""
      cursor = db_conn.cursor()
      cursor.execute("""
          SELECT id_jogador, nome_exibicao, total_jogos, total_gols, jogos_carreira_oficiais
          FROM jogadores_estatisticas
          WHERE total_gols > 10
            AND jogos_carreira_oficiais > total_gols * 1.5
            AND total_jogos = total_gols
          LIMIT 5;
      """)
      anomalias = cursor.fetchall()
      assert len(anomalias) == 0, (
          f"Encontrados atletas com total_jogos forçado artificialmente a total_gols: "
          f"{[(r['id_jogador'], r['nome_exibicao'], r['total_jogos']) for r in anomalias]}"
      )
  ```
- **Execução na base `data/futebol.db`**:
  ```bash
  ./.venv/bin/pytest tests/test_e2e_futstats.py -k "test_t1_r1_db_no_forced_jogos_equals_gols_with_divergent_career"
  ```
- **Resultado Verbatim**:
  ```text
  FAILED tests/test_e2e_futstats.py::TestTier1FeatureCoverage::test_t1_r1_db_no_forced_jogos_equals_gols_with_divergent_career - AssertionError: Encontrados atletas com total_jogos forçado artificialmente a total_gols: [(12636, 'Serginho', 45), (67, 'Flaco López', 14)]
  ```
- **Censo Completo de Anomalias no Banco**: A consulta sem `LIMIT 5` retorna exatamente **2 registros em 19.783 atletas**:
  1. `(12636, 'Serginho', total_jogos=45, total_gols=45, jogos_carreira_oficiais=200)`
  2. `(67, 'Flaco López', total_jogos=14, total_gols=14, jogos_carreira_oficiais=72)`

---

### 1.2. Investigação Anatômica: Serginho (ID 12636)
- **Registro em `jogadores_estatisticas`**:
  - `id_jogador`: 12636, `ogol_id`: 215767, `cbf_id`: `None`
  - `nome_exibicao`: `'Serginho'`, `nome_completo`: `'Sérgio Antônio Soler de Oliveira Junior'`
  - `posicao`: `'Meio-campo'`
  - `clubes`: `'América-MG, Jorge Wilstermann, CRB, Santos, Botafogo-SP, Vitória, Vasco, Linense, Mogi Mirim, Criciúma, Red Bull Bragantino, Oeste, Mirassol, Confiança (SE), Rio Branco-SP, Atlético-MG, ICASA (CE), São Paulo'`
  - `total_jogos`: 45, `total_gols`: 45, `jogos_carreira_oficiais`: 200, `media_gols_por_jogo`: 1.00
- **Contagem de Registros Relacionais Atômicos**:
  - `gols`: **45 gols** distribuídos em **42 partidas distintas**. Em 3 partidas ele marcou dobletes:
    - Partida 6129: América-MG 3x0 Sport (minutos 1' e 41')
    - Partida 6212: América-MG 3x1 Athletico-PR (minutos 40' e 76')
    - Partida 202506160: Ituano 1x2 Oeste (minutos 24' e 90')
  - `escalacoes`: **16 partidas distintas** (todas titular = 1). Dessas 16, em 13 ele marcou gol e em **3 partidas ele não marcou gol** (partidas 6046, 6085 e 6225).
  - `cartoes`: **3 cartões amarelos** (exatamente nas partidas 6046, 6085 e 6225).
- **Cálculo da União de Presenças no Catálogo**:
  - `42 partidas com gol + 3 partidas de escalação sem gol = 45 partidas distintas`.
  - `total_gols = 45` e `presencas_distintas = 45`.
  - **Origem da Equivalência**: Pura coincidência aritmética decorrente da incompletude de súmulas pré-2018. O atleta teve 3 dobletes (+3 gols acima do número de jogos) que anularam exatamente as 3 partidas onde jogou sem marcar gol (+3 jogos acima dos jogos com gol).
- **Descoberta de Escalações Não Vinculadas (Fragmentação de ID)**:
  - Serginho atuou por Vasco (2023) e Criciúma (2024), clubes já homologados na sua coluna `clubes`.
  - Na tabela `escalacoes`, suas 31 atuações por Vasco e Criciúma foram cadastradas pela CBF com o nome truncado `'Serginho Sergio Antonio da Lu ...'`, gerando o pseudo-atleta `id_jogador = 21287` com `cbf_id = '346131'`.
  - As 31 partidas de `id_jogador = 21287` têm **sobreposição zero** com as 45 partidas de `id_jogador = 12636`.

---

### 1.3. Investigação Anatômica: Flaco López (ID 67)
- **Registro em `jogadores_estatisticas`**:
  - `id_jogador`: 67, `ogol_id`: 843566, `cbf_id`: `None`
  - `nome_exibicao`: `'Flaco López'`, `nome_completo`: `'José Manuel Alberto López'`
  - `posicao`: `'Atacante'`, `clubes`: `'Palmeiras, Ponte Preta'`
  - `total_jogos`: 14, `total_gols`: 14, `jogos_carreira_oficiais`: 72, `gols_carreira_oficiais`: 46
- **Impacto do Auto-Reparo da Regra 5 (`scripts/auditar_integridade_dados.py`)**:
  - A Regra 5 deletou 13 partidas espúrias contendo `'Estatísticas'` no nome do clube.
  - Duas dessas partidas continham gols atribuídos a Flaco López.
  - Na tabela `gols`, a contagem real de Flaco López caiu para **12 gols** (em 12 partidas distintas do Paulistão 2024).
  - A tabela `jogadores_estatisticas` não havia sido recalculada por Worker M1, permanecendo em 14 jogos e 14 gols.
- **Armadilha da Ressincronização Superficial**:
  - Sob `id_jogador = 67`, existem 0 escalações e 0 cartões no banco.
  - Se a remediação apenas recalculasse `total_gols = 12` e `total_jogos = 12`, a equivalência artificial persistiria: `total_jogos == total_gols == 12`.
  - Como `jogos_carreira_oficiais = 72 > (12 * 1.5 = 18)`, o teste `test_t1_r1_db_no_forced_jogos_equals_gols_with_divergent_career` continuaria reprovando Flaco López!
- **Descoberta de Escalações Não Vinculadas (Fragmentação de ID)**:
  - Na tabela `escalacoes`, todas as partidas oficiais de Flaco López pelo Palmeiras no Campeonato Brasileiro e Copa do Brasil foram atribuídas a `id_jogador = 19997` (`'LOPEZ Jose Manuel Alberto Lopez'`, `ogol_id: 843566`, `cbf_id: '773040'`).
  - `id_jogador = 19997` possui **115 escalações oficiais** pelo Palmeiras e 0 gols cadastrados.
  - As 115 partidas de `19997` têm **sobreposição zero** com os 12 confrontos de `67`.
  - Além disso, `19997` contém o censo atualizado de carreira mundial: `jogos_carreira_oficiais = 294`, `gols_carreira_oficiais = 102`.

---

## 2. Cadeia Lógica (Logic Chain)

1. **Da Observação 1.1 à Identificação do Escopo Exato**:
   Apenas 2 atletas em 19.783 acionam o gating do teste `test_t1_r1_db_no_forced_jogos_equals_gols_with_divergent_career`: Serginho (12636) e Flaco López (67). Todos os outros 2.703 atletas do Feature 4 possuem contagens distintas que não coincidem com `total_jogos = total_gols`.
2. **Da Observação 1.2 ao Diagnóstico de Causa-Raiz de Serginho**:
   Serginho possuía 45 jogos e 45 gols locais porque 3 dobletes equilibraram 3 jogos sem gol. Contudo, 31 partidas disputadas por ele pelo Vasco e Criciúma em 2023-2024 estavam desconectadas sob o ID fragmentado 21287. Vincular essas escalações restaura suas presenças locais autênticas para 76 jogos e 45 gols, resultando em média legítima de 0.59 gols/jogo.
3. **Da Observação 1.3 à Ineficácia de um Simples UPDATE de Contadores para Flaco López**:
   Simplesmente decrementar os contadores de Flaco López de 14 para 12 manteria `total_jogos = 12` e `total_gols = 12`. Como a carreira oficial é 72, o teste continuaria falhando. A causa-raiz é que as 115 escalações do atleta pelo Palmeiras estavam órfãs de gols sob o ID 19997. Ao unificar as escalações sob o ID canônico 67, Flaco passa a ter 127 jogos e 12 gols locais (média 0.09) e carreira oficial canônica de 294 jogos e 102 gols.
4. **Da Prevenção de Recorrência contra Scripts de Sincronização**:
   Qualquer script subsequente (como o auto-reparo da Regra 5 de Explorer M1 Retry 3 ou a query de ressincronização de Explorer M1 Retry 1) recalcula `total_jogos` a partir de `(escalacoes UNION gols UNION cartoes)`. Se as escalações não fossem reatribuídas no nível das tabelas atômicas, qualquer ciclo de auditoria reimporia `total_jogos = 45` para Serginho e `total_jogos = 12` para Flaco, reativando a falha do teste.
5. **Conformidade com Invariantes de Governança (`GOVERNANCA_E_DIRETRIZES_VM.md:45`)**:
   Ao atualizar os jogos locais de Flaco para 127, é mandatório atualizar `jogos_carreira_oficiais` para 294 (proveniente do cadastro oficial de 19997), garantindo a invariante de que a carreira mundial jamais seja inferior aos jogos do acervo nacional (`jogos_carreira_oficiais >= total_jogos`).

---

## 3. Ressalvas e Limitações (Caveats)

1. **Escopo Restrito ao Milestone M1**:
   Flaco López possui outros dois fragmentos com gols em campeonatos estaduais/nacionais (`id_jogador = 7708` com 14 gols e `id_jogador = 7789` com 16 gols). A fusão integral de homônimos e consolidação definitiva de gols históricos de Flaco López está formalmente designada para o **Milestone M2 (Feature 6)**. A remediação aqui formulada resolve cirurgicamente a fragmentação de escalações entre 19997 e 67 para aprovação imediata do Milestone M1.
2. **Desativação de IDs Fragmentados**:
   Os registros de `jogadores_estatisticas` dos IDs 19997 e 21287 têm seu `total_jogos` zerado para evitar contagem duplicada em agregações globais.

---

## 4. Conclusão e Script SQL Verificado (Conclusion)

A causa da reprovação foi diagnosticada na raiz e comprovada: **coincidência aritmética em acervo parcial para Serginho e isolamento de escalações em IDs secundários da CBF para ambos os atletas**.

### Patch SQL de Remediação Verificado:

```sql
-- =============================================================================
-- FUTSTATS M1 RETRY 2: CORREÇÃO DE CARREIRA DIVERGENTE (SERGINHO E FLACO LÓPEZ)
-- =============================================================================

BEGIN TRANSACTION;

-- 1. Re-vincular escalações e cartões de Serginho (ID 21287 -> ID 12636)
UPDATE escalacoes SET id_jogador = 12636 WHERE id_jogador = 21287;
UPDATE cartoes SET id_jogador = 12636 WHERE id_jogador = 21287;

-- 2. Re-vincular escalações e cartões de Flaco López (ID 19997 -> ID 67)
UPDATE escalacoes SET id_jogador = 67 WHERE id_jogador = 19997;
UPDATE cartoes SET id_jogador = 67 WHERE id_jogador = 19997;

-- 3. Atualizar carreira oficial canônica de Flaco López (ID 67) ao piso de 294 jogos e 102 gols
UPDATE jogadores_estatisticas
SET jogos_carreira_oficiais = MAX(COALESCE(jogos_carreira_oficiais, 0), 294),
    gols_carreira_oficiais = MAX(COALESCE(gols_carreira_oficiais, 0), 102)
WHERE id_jogador = 67;

-- 4. Zerar contadores dos IDs secundários integrados
UPDATE jogadores_estatisticas
SET total_jogos = 0,
    total_gols = 0,
    media_gols_por_jogo = 0.0,
    media_participacao_por_jogo = 0.0
WHERE id_jogador IN (19997, 21287);

-- 5. Ressincronizar métricas locais atômicas para Serginho (12636) e Flaco López (67)
UPDATE jogadores_estatisticas
SET total_gols = (
        SELECT COUNT(*) 
        FROM gols 
        WHERE gols.id_jogador = jogadores_estatisticas.id_jogador
    ),
    total_jogos = (
        SELECT COUNT(DISTINCT id_partida) 
        FROM (
            SELECT id_partida, id_jogador FROM escalacoes
            UNION
            SELECT id_partida, id_jogador FROM gols
            UNION
            SELECT id_partida, id_jogador FROM cartoes
        ) t 
        WHERE t.id_jogador = jogadores_estatisticas.id_jogador
    ),
    media_gols_por_jogo = ROUND(
        CAST((SELECT COUNT(*) FROM gols WHERE gols.id_jogador = jogadores_estatisticas.id_jogador) AS REAL) /
        MAX((
            SELECT COUNT(DISTINCT id_partida) 
            FROM (
                SELECT id_partida, id_jogador FROM escalacoes
                UNION
                SELECT id_partida, id_jogador FROM gols
                UNION
                SELECT id_partida, id_jogador FROM cartoes
            ) t 
            WHERE t.id_jogador = jogadores_estatisticas.id_jogador
        ), 1),
        2
    )
WHERE id_jogador IN (12636, 67);

COMMIT;
```

### Resultados Obtidos após a Execução do Patch:
- **Serginho (ID 12636)**:
  - `total_jogos`: **76** (45 anteriores + 31 do Vasco/Criciúma)
  - `total_gols`: **45**
  - `media_gols_por_jogo`: **0.59**
  - `jogos_carreira_oficiais`: **200**
- **Flaco López (ID 67)**:
  - `total_jogos`: **127** (12 do Paulista + 115 do Brasileirão)
  - `total_gols`: **12**
  - `media_gols_por_jogo`: **0.09**
  - `jogos_carreira_oficiais`: **294**
- **Anomalias de Carreira Divergente**: **0** (aprovado no teste de aceitação).
- **Tamanho Físico do SQLite**: **88,588,288 bytes** (88.59 MB, mantendo **5.41 MB** de margem abaixo do teto de 94.0 MB da Vercel).
- **Integridade Estrutural**: `PRAGMA integrity_check;` $\rightarrow$ `ok`.
- **Auditoria Relacional**: `scripts/auditar_integridade_dados.py` $\rightarrow$ 12/12 regras OK, 0 inconsistências.
- **Suíte Preditiva**: `tests/test_model_evals.py` $\rightarrow$ 22/22 passed.

---

## 5. Método de Verificação Independente (Verification Method)

Qualquer auditor ou agente pode verificar a eficácia da solução executando:

1. **Simulação do Patch em Cópia Temporária**:
   ```bash
   cp data/futebol.db /tmp/futebol_verify.db
   ./.venv/bin/python3 -c "
   import sqlite3
   conn = sqlite3.connect('/tmp/futebol_verify.db')
   c = conn.cursor()
   c.execute('UPDATE escalacoes SET id_jogador = 12636 WHERE id_jogador = 21287;')
   c.execute('UPDATE cartoes SET id_jogador = 12636 WHERE id_jogador = 21287;')
   c.execute('UPDATE escalacoes SET id_jogador = 67 WHERE id_jogador = 19997;')
   c.execute('UPDATE cartoes SET id_jogador = 67 WHERE id_jogador = 19997;')
   c.execute('UPDATE jogadores_estatisticas SET jogos_carreira_oficiais = MAX(COALESCE(jogos_carreira_oficiais, 0), 294), gols_carreira_oficiais = MAX(COALESCE(gols_carreira_oficiais, 0), 102) WHERE id_jogador = 67;')
   c.execute('UPDATE jogadores_estatisticas SET total_jogos = 0, total_gols = 0 WHERE id_jogador IN (19997, 21287);')
   for jid in [12636, 67]:
       c.execute('''
           UPDATE jogadores_estatisticas
           SET total_gols = (SELECT COUNT(*) FROM gols WHERE gols.id_jogador = ?),
               total_jogos = (SELECT COUNT(DISTINCT id_partida) FROM (SELECT id_partida, id_jogador FROM escalacoes UNION SELECT id_partida, id_jogador FROM gols UNION SELECT id_partida, id_jogador FROM cartoes) t WHERE t.id_jogador = ?),
               media_gols_por_jogo = ROUND(CAST((SELECT COUNT(*) FROM gols WHERE gols.id_jogador = ?) AS REAL) / MAX((SELECT COUNT(DISTINCT id_partida) FROM (SELECT id_partida, id_jogador FROM escalacoes UNION SELECT id_partida, id_jogador FROM gols UNION SELECT id_partida, id_jogador FROM cartoes) t WHERE t.id_jogador = ?), 1), 2)
           WHERE id_jogador = ?;
       ''', (jid, jid, jid, jid, jid))
   conn.commit()
   conn.close()
   "
   ```

2. **Executar a Verificação da Asserção do Teste E2E**:
   ```bash
   ./.venv/bin/python3 -c "
   import sqlite3
   conn = sqlite3.connect('/tmp/futebol_verify.db')
   c = conn.cursor()
   c.execute('''
       SELECT id_jogador, nome_exibicao, total_jogos, total_gols, jogos_carreira_oficiais
       FROM jogadores_estatisticas
       WHERE total_gols > 10
         AND jogos_carreira_oficiais > total_gols * 1.5
         AND total_jogos = total_gols
       LIMIT 5;
   ''')
   anomalias = c.fetchall()
   print('Anomalias encontradas:', len(anomalias), anomalias)
   assert len(anomalias) == 0, 'Falha no teste!'
   print('Critério de aceitação 100% aprovado!')
   "
   ```
   *Resultado esperado*: `Anomalias encontradas: 0 []` e `Critério de aceitação 100% aprovado!`.

3. **Verificar Ausência de Regressão em Auditoria e Modelo**:
   ```bash
   ./.venv/bin/pytest tests/test_model_evals.py
   ```
   *Resultado esperado*: `22 passed in <0.5s`.
