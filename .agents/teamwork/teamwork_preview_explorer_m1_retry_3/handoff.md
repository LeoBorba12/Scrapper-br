# Handoff Report — Explorer M1 Retry 3 (Audit Script Regra 5 & Regra 11 Hardening)

**Agent**: Explorer M1 Retry 3 (`teamwork_preview_explorer_m1_retry_3`)  
**Parent Agent**: `parent` (`9c2d948a-bd66-4e27-83b1-9e8d50e60942`)  
**Timestamp**: 2026-10-30T19:38:00Z  
**Type**: Hard Handoff (Investigation & Code Diff Complete)

---

## 1. Observação (Observation)

### 1.1. Discrepância na Consulta DELETE da Regra 5 (`scripts/auditar_integridade_dados.py`)
- Em `scripts/auditar_integridade_dados.py` (linhas 98–126), o `SELECT` de detecção de partidas inválidas utiliza:
  ```python
  c.execute("""
      SELECT COUNT(*) FROM partidas 
      WHERE mandante IS NULL OR mandante = '' 
         OR visitante IS NULL OR visitante = ''
         OR mandante LIKE '%Estatísticas%' 
         OR visitante LIKE '%Estatísticas%';
  """)
  ```
- No entanto, a instrução de auto-reparo correspondente deletava apenas confrontos cujo clube contivesse `'Estatísticas'`:
  ```python
  c.execute("""
      DELETE FROM gols 
      WHERE id_partida IN (SELECT id_partida FROM partidas WHERE mandante LIKE '%Estatísticas%' OR visitante LIKE '%Estatísticas%')
         OR clube LIKE '%Estatísticas%';
  """)
  c.execute("""
      DELETE FROM odds_partidas 
      WHERE id_partida IN (SELECT id_partida FROM partidas WHERE mandante LIKE '%Estatísticas%' OR visitante LIKE '%Estatísticas%');
  """)
  c.execute("""
      DELETE FROM escalacoes 
      WHERE id_partida IN (SELECT id_partida FROM partidas WHERE mandante LIKE '%Estatísticas%' OR visitante LIKE '%Estatísticas%');
  """)
  c.execute("""
      DELETE FROM partidas 
      WHERE mandante LIKE '%Estatísticas%' OR visitante LIKE '%Estatísticas%';
  """)
  ```
- **Consequência direta**: Se existisse uma partida com `mandante IS NULL` ou `visitante = ''`, ela incrementava `clubes_invalidos`, mas **escapava ilesa da exclusão**, enquanto o relatório emitia falsamente `"status": "CORRIGIDO"` caso qualquer registro contendo `'Estatísticas'` fosse removido. Além disso, a tabela `cartoes` não constava na cadeia de deleção de dependências.

### 1.2. Ausência de Ressincronização de Atletas após Exclusão de Partidas e Gols
- Na exclusão das 13 partidas espúrias contendo o termo `'Estatísticas'`, foram excluídos 26 gols associados na tabela `gols`.
- O código da Regra 5 apenas limpava a string `clubes` na tabela `jogadores_estatisticas` (`WHERE clubes LIKE '%Estatísticas%'`), **mas não recalculava `total_gols`, `total_jogos` nem `media_gols_por_jogo`** para nenhum dos atletas afetados.
- Como resultado direto apurado pelo Challenger M1-1, 25 atletas de elite (incluindo Raphael Veiga, Yuri Alberto, Memphis Depay, Endrick, Estêvão e Flaco López) ficaram desincronizados entre a tabela `gols` e a tabela `jogadores_estatisticas`.

### 1.3. Incongruência Semântica na Regra 11 (Título vs Docstring vs Código)
- Em `scripts/auditar_integridade_dados.py` (linhas 341–356):
  - Comentário da linha 341: `# Regra 11: Coerência de Jogos x Gols e Médias de Atletas (Sem Auto-Reparo Nocivo)`
  - SQL executado na linha 344: `WHERE (total_jogos <= 0 AND total_gols > 0) OR (total_gols >= 10 AND media_gols_por_jogo > 2.5);`
  - Título reportado no relatório JSON na linha 351: `"regra": "Coerência de Atletas: Jogos >= Gols e Médias Verossímeis (<= 2.0)"`
- O título citava `(<= 2.0)` e `Jogos >= Gols`, enquanto a validação matemática real aplica o teto `<= 2.5` e tolera súmulas parciais de múltiplos gols sem jogos catalogados no acervo nacional.

---

## 2. Cadeia Lógica (Logic Chain)

1. **Da Observação 1.1 à Correspondência Exata de Deleção (Regra 5)**:
   - A condição de invalidade no auto-reparo deve ser rigorosamente isomórfica à condição do `SELECT`:
     `WHERE mandante IS NULL OR mandante = '' OR visitante IS NULL OR visitante = '' OR mandante LIKE '%Estatísticas%' OR visitante LIKE '%Estatísticas%'`.
   - Essa subquery ou filtro deve ser replicado em `gols`, `odds_partidas`, `escalacoes`, `cartoes` e `partidas`. Nenhuma entidade filha de uma partida inválida pode permanecer órfã.

2. **Da Observação 1.2 à Ressincronização Atômica Pré e Pós-Deleção (Regra 5)**:
   - Antes de disparar o `DELETE` nas tabelas filhas, o auditor deve coletar os `id_jogador` distintos de todos os registros que serão expurgados:
     `SELECT DISTINCT id_jogador FROM (SELECT ... FROM gols UNION SELECT ... FROM escalacoes UNION SELECT ... FROM cartoes)`.
   - Imediatamente após a remoção dos registros no banco, para cada `id_jogador` coletado:
     - `tot_gols = SELECT COUNT(*) FROM gols WHERE id_jogador = ?`
     - `tot_jogos = SELECT COUNT(DISTINCT id_partida) FROM (SELECT id_partida FROM escalacoes UNION SELECT id_partida FROM gols UNION SELECT id_partida FROM cartoes)`
     - `media_gols = round(tot_gols / max(tot_jogos, 1), 2)`
     - Atualização das colunas `total_gols`, `total_jogos`, `media_gols_por_jogo`, `participacoes_gols` e `media_participacao_por_jogo` em `jogadores_estatisticas` e `jogadores`.
   - Esse recálculo garante que qualquer exclusão futura de partidas no pipeline de auditoria preserve a invariância relacional de 100% dos atletas.

3. **Da Observação 1.3 à Harmonização Textual da Regra 11**:
   - Ajustar o comentário para: `# Regra 11: Coerência de Atletas: Médias Verossímeis (<= 2.5) e Jogos Válidos (Sem Auto-Reparo Nocivo)`.
   - Ajustar o nome da regra no JSON para: `"regra": "Coerência de Atletas: Médias Verossímeis (<= 2.5)"`.
   - Isso alinha o rótulo da auditoria com o código SQL executado, eliminando a dissonância cognitiva apontada pelo Challenger.

---

## 3. Ressalvas e Limitações (Caveats)

- **Escopo do Script vs Migração Existente**: Este diff endurece o script `scripts/auditar_integridade_dados.py` para todas as execuções futuras. A sincronização retrospectiva dos 25 atletas que já foram desincronizados na rodada anterior está formalmente atribuída ao Explorer M1 Retry 1. No entanto, se o script com este auto-reparo detectar qualquer partida espúria remanescente, ele resincronizará os atletas automaticamente.
- **Milestone M2 (Confrontos 0x0 Históricos e Regra 8)**: As 306 partidas 0x0 com gols históricos permanecem sob a alçada de M2 (Features 5, 6 e 7), conforme delimitado no relatório do Challenger.

---

## 4. Conclusão e Diff Proposto (Conclusion)

### 4.1. Artefatos Produzidos
1. **Arquivo de Patch Unificado**:  
   `/.agents/teamwork/teamwork_preview_explorer_m1_retry_3/scripts_auditar_integridade_dados.patch`
2. **Arquivo Proposto Integral**:  
   `/.agents/teamwork/teamwork_preview_explorer_m1_retry_3/proposed_auditar_integridade_dados.py`

### 4.2. Snippet do Diff Exato (`scripts/auditar_integridade_dados.py`)

```diff
--- a/scripts/auditar_integridade_dados.py
+++ b/scripts/auditar_integridade_dados.py
@@ -106,30 +106,121 @@ def auditar_e_reparar_dados():
     clubes_invalidos = c.fetchone()[0]
     reparados_clubes = 0
     if clubes_invalidos > 0:
+        # 1. Coleta atletas afetados pelas partidas e gols a serem deletados
+        c.execute("""
+            SELECT DISTINCT id_jogador FROM (
+                SELECT id_jogador FROM gols 
+                WHERE id_partida IN (
+                    SELECT id_partida FROM partidas 
+                    WHERE mandante IS NULL OR mandante = '' 
+                       OR visitante IS NULL OR visitante = ''
+                       OR mandante LIKE '%Estatísticas%' 
+                       OR visitante LIKE '%Estatísticas%'
+                ) OR clube LIKE '%Estatísticas%'
+                UNION
+                SELECT id_jogador FROM escalacoes 
+                WHERE id_partida IN (
+                    SELECT id_partida FROM partidas 
+                    WHERE mandante IS NULL OR mandante = '' 
+                       OR visitante IS NULL OR visitante = ''
+                       OR mandante LIKE '%Estatísticas%' 
+                       OR visitante LIKE '%Estatísticas%'
+                )
+                UNION
+                SELECT id_jogador FROM cartoes 
+                WHERE id_partida IN (
+                    SELECT id_partida FROM partidas 
+                    WHERE mandante IS NULL OR mandante = '' 
+                       OR visitante IS NULL OR visitante = ''
+                       OR mandante LIKE '%Estatísticas%' 
+                       OR visitante LIKE '%Estatísticas%'
+                )
+            ) WHERE id_jogador IS NOT NULL AND id_jogador > 0;
+        """)
+        atletas_afetados = [row[0] for row in c.fetchall() if row[0]]
+
+        # 2. Deleta dependências e partidas inválidas (garantindo correspondência com o SELECT)
         c.execute("""
             DELETE FROM gols 
-            WHERE id_partida IN (SELECT id_partida FROM partidas WHERE mandante LIKE '%Estatísticas%' OR visitante LIKE '%Estatísticas%')
-               OR clube LIKE '%Estatísticas%';
+            WHERE id_partida IN (
+                SELECT id_partida FROM partidas 
+                WHERE mandante IS NULL OR mandante = '' 
+                   OR visitante IS NULL OR visitante = ''
+                   OR mandante LIKE '%Estatísticas%' 
+                   OR visitante LIKE '%Estatísticas%'
+            ) OR clube LIKE '%Estatísticas%';
         """)
         c.execute("""
             DELETE FROM odds_partidas 
-            WHERE id_partida IN (SELECT id_partida FROM partidas WHERE mandante LIKE '%Estatísticas%' OR visitante LIKE '%Estatísticas%');
+            WHERE id_partida IN (
+                SELECT id_partida FROM partidas 
+                WHERE mandante IS NULL OR mandante = '' 
+                   OR visitante IS NULL OR visitante = ''
+                   OR mandante LIKE '%Estatísticas%' 
+                   OR visitante LIKE '%Estatísticas%'
+            );
         """)
         c.execute("""
             DELETE FROM escalacoes 
-            WHERE id_partida IN (SELECT id_partida FROM partidas WHERE mandante LIKE '%Estatísticas%' OR visitante LIKE '%Estatísticas%');
+            WHERE id_partida IN (
+                SELECT id_partida FROM partidas 
+                WHERE mandante IS NULL OR mandante = '' 
+                   OR visitante IS NULL OR visitante = ''
+                   OR mandante LIKE '%Estatísticas%' 
+                   OR visitante LIKE '%Estatísticas%'
+            );
+        """)
+        c.execute("""
+            DELETE FROM cartoes 
+            WHERE id_partida IN (
+                SELECT id_partida FROM partidas 
+                WHERE mandante IS NULL OR mandante = '' 
+                   OR visitante IS NULL OR visitante = ''
+                   OR mandante LIKE '%Estatísticas%' 
+                   OR visitante LIKE '%Estatísticas%'
+            );
         """)
         c.execute("""
             DELETE FROM partidas 
-            WHERE mandante LIKE '%Estatísticas%' OR visitante LIKE '%Estatísticas%';
+            WHERE mandante IS NULL OR mandante = '' 
+               OR visitante IS NULL OR visitante = ''
+               OR mandante LIKE '%Estatísticas%' 
+               OR visitante LIKE '%Estatísticas%';
         """)
         reparados_clubes = c.rowcount
 
+        # 3. Limpeza de artefatos de scraping na coluna clubes dos atletas
         c.execute("SELECT id_jogador, clubes FROM jogadores_estatisticas WHERE clubes LIKE '%Estatísticas%';")
         for jid, clbs in c.fetchall():
             limpos = [cb.strip() for cb in (clbs or '').split(',') if 'Estatísticas' not in cb and cb.strip()]
             c.execute("UPDATE jogadores_estatisticas SET clubes = ? WHERE id_jogador = ?;", (', '.join(limpos), jid))
 
+        # 4. Ressincronização automática de estatísticas dos atletas afetados
+        for aid in atletas_afetados:
+            c.execute("SELECT COUNT(*) FROM gols WHERE id_jogador = ?;", (aid,))
+            tot_gols = c.fetchone()[0]
+            c.execute("""
+                SELECT COUNT(DISTINCT id_partida) FROM (
+                    SELECT id_partida FROM escalacoes WHERE id_jogador = ?
+                    UNION
+                    SELECT id_partida FROM gols WHERE id_jogador = ?
+                    UNION
+                    SELECT id_partida FROM cartoes WHERE id_jogador = ?
+                );
+            """, (aid, aid, aid))
+            tot_jogos = c.fetchone()[0]
+            media_gols = round(tot_gols / max(tot_jogos, 1), 2)
+            c.execute("""
+                UPDATE jogadores_estatisticas 
+                SET total_gols = ?,
+                    total_jogos = ?,
+                    media_gols_por_jogo = ?,
+                    participacoes_gols = ? + COALESCE(total_assistencias, 0),
+                    media_participacao_por_jogo = ROUND(CAST((? + COALESCE(total_assistencias, 0)) AS REAL) / MAX(?, 1), 2)
+                WHERE id_jogador = ?;
+            """, (tot_gols, tot_jogos, media_gols, tot_gols, tot_gols, tot_jogos, aid))
+            c.execute("UPDATE jogadores SET total_gols = ?, total_jogos = ? WHERE id_jogador = ?;", (tot_gols, tot_jogos, aid))
+
         conn.commit()
 
     relatorio["regras"].append({
@@ -338,7 +429,7 @@ def auditar_e_reparar_dados():
         "reparados": reparados_gols_esc
     })
 
-    # Regra 11: Coerência de Jogos x Gols e Médias de Atletas (Sem Auto-Reparo Nocivo)
+    # Regra 11: Coerência de Atletas: Médias Verossímeis (<= 2.5) e Jogos Válidos (Sem Auto-Reparo Nocivo)
     c.execute("""
         SELECT COUNT(*) FROM jogadores_estatisticas 
         WHERE (total_jogos <= 0 AND total_gols > 0) 
@@ -348,7 +439,7 @@ def auditar_e_reparar_dados():
     reparados_atl = 0
 
     relatorio["regras"].append({
-        "regra": "Coerência de Atletas: Jogos >= Gols e Médias Verossímeis (<= 2.0)",
+        "regra": "Coerência de Atletas: Médias Verossímeis (<= 2.5)",
         "status": "OK" if atletas_anormais == 0 else "FALHA",
         "ocorrencias": atletas_anormais,
         "reparados": reparados_atl
```

---

## 5. Método de Verificação Independente (Verification Method)

Qualquer agente pode verificar a exatidão, integridade e ausência de efeitos colaterais executando:

1. **Checagem de Aplicação Limpa do Patch (Sem Conflitos)**:
   ```bash
   git apply --check .agents/teamwork/teamwork_preview_explorer_m1_retry_3/scripts_auditar_integridade_dados.patch
   ```
   *Resultado esperado*: Código de saída `0` sem qualquer mensagem de erro.

2. **Verificação de Execução do Auditor (12/12 Regras OK)**:
   ```bash
   python3 -c "
   import importlib.util, json
   spec = importlib.util.spec_from_file_location('auditor', '.agents/teamwork/teamwork_preview_explorer_m1_retry_3/proposed_auditar_integridade_dados.py')
   mod = importlib.util.module_from_spec(spec)
   spec.loader.exec_module(mod)
   mod.DB_PATH = 'data/futebol.db'
   res = mod.auditar_e_reparar_dados()
   assert res['inconsistencias_encontradas'] == 0
   assert len(res['regras']) == 12
   for r in res['regras']:
       assert r['status'] == 'OK', f'Falha: {r}'
   print('12/12 Regras OK no auditor!')
   "
   ```
   *Resultado esperado*: `12/12 Regras OK no auditor!`.

3. **Validação de Não-Regressão Matemática (Gates Dixon-Coles & Odds)**:
   ```bash
   ./.venv/bin/pytest tests/test_model_evals.py -q
   ```
   *Resultado esperado*: `22 passed in <1s`.
