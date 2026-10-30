# Handoff Report — Challenger M1-1 (Adversarial Stress-Test & Evaluation)

**Milestone**: M1 (Features 1, 2, 3, 4)  
**Agent**: Challenger M1-1 (`teamwork_preview_challenger_m1_1`)  
**Parent Agent**: `parent` (`9c2d948a-bd66-4e27-83b1-9e8d50e60942`)  
**Data**: 2026-10-30T19:24:00Z  
**Verdict**: **REJECT** (Requer Correção Pontual do Worker M1)

---

## 1. Observação (Observation)

### 1.1. Teto de Armazenamento Vercel (<94.0 MB) e Saúde Física do SQLite (Aprovado)
- **Tamanho atual de `data/futebol.db`**: `88,580,096 bytes` (**88.58 MB decimais** / **84.48 MiB binários**).
- **Margem de segurança**: **5,419,904 bytes livres** (**5.42 MB de folga** em relação ao teto de 94,000,000 bytes).
- **Integridade física**: `PRAGMA integrity_check;` retorna `[('ok',)]`.
- **Comportamento sob estresse de escrita**: Em teste empírico clonado (`/tmp/futebol_stress.db`), a inserção em lote de **1.000 avaliações completas** em `atleta_sofascore_ratings`, **1.000 partidas** e **10.000 escalações** elevou o banco em apenas +1.49 MB (atingindo 90.08 MB), mantendo 3.92 MB de folga abaixo dos 94.0 MB.
- **Eficiência de índices podados**:
  - `idx_partidas_data_visitante` cobre buscas exatas por data em **0.051 ms** e filtros por intervalo em **7.26 ms** (`SEARCH partidas USING INDEX idx_partidas_data_visitante (data=?)`).
  - `idx_escalacoes_id_jogador` executa buscas de escalação de atleta em **0.298 ms** (`SEARCH escalacoes USING INDEX idx_escalacoes_id_jogador (id_jogador=?)`).

### 1.2. Desincronização Relacional em `jogadores_estatisticas` (Falha Crítica)
- Na Regra 5 de `scripts/auditar_integridade_dados.py` (linhas 109-126), o auto-reparo executou:
  ```sql
  DELETE FROM gols WHERE id_partida IN (SELECT id_partida FROM partidas WHERE mandante LIKE '%Estatísticas%' OR visitante LIKE '%Estatísticas%') OR clube LIKE '%Estatísticas%';
  DELETE FROM escalacoes WHERE id_partida IN (SELECT id_partida FROM partidas WHERE mandante LIKE '%Estatísticas%' OR visitante LIKE '%Estatísticas%');
  DELETE FROM partidas WHERE mandante LIKE '%Estatísticas%' OR visitante LIKE '%Estatísticas%';
  ```
- O script deletou as 13 partidas espúrias e seus 26 gols da tabela `gols`, **mas não recalculou nem decrementou `total_gols`, `total_jogos` e `media_gols_por_jogo` na tabela `jogadores_estatisticas`**.
- Como resultado direto, **25 atletas de elite** possuem hoje `total_gols` em `jogadores_estatisticas` **maior** do que a contagem real de registros na tabela `gols`:
  ```
  (12, 'Raphael Veiga', total_gols_stats=85, gols_reais=83, diff=+2, total_jogos_stats=179, presencas_reais=177)
  (48, 'Yuri Alberto', total_gols_stats=85, gols_reais=83, diff=+2, total_jogos_stats=193, presencas_reais=191)
  (67, 'Flaco López', total_gols_stats=14, gols_reais=12, diff=+2, total_jogos_stats=14, presencas_reais=12)
  (49, 'Memphis Depay', total_gols_stats=19, gols_reais=18, diff=+1, total_jogos_stats=39, presencas_reais=38)
  (69, 'Joaquín Piquerez', total_gols_stats=9, gols_reais=8, diff=+1, total_jogos_stats=43, presencas_reais=42)
  (78, 'Eduardo Sasha', total_gols_stats=82, gols_reais=81, diff=+1, total_jogos_stats=134, presencas_reais=133)
  (166, 'Vitinho', total_gols_stats=54, gols_reais=53, diff=+1, total_jogos_stats=186, presencas_reais=185)
  (238, 'Tiquinho Soares', total_gols_stats=32, gols_reais=31, diff=+1, total_jogos_stats=60, presencas_reais=59)
  (257, 'Guilherme', total_gols_stats=61, gols_reais=60, diff=+1, total_jogos_stats=97, presencas_reais=96)
  (267, 'Murilo', total_gols_stats=24, gols_reais=23, diff=+1, total_jogos_stats=75, presencas_reais=74)
  (328, 'Thiago Borbas', total_gols_stats=7, gols_reais=6, diff=+1, total_jogos_stats=25, presencas_reais=24)
  (352, 'Neymar', total_gols_stats=135, gols_reais=134, diff=+1, total_jogos_stats=126, presencas_reais=125)
  (995, 'João Schmidt', total_gols_stats=4, gols_reais=3, diff=+1, total_jogos_stats=44, presencas_reais=43)
  (1126, 'Jonathan Calleri', total_gols_stats=84, gols_reais=83, diff=+1, total_jogos_stats=119, presencas_reais=118)
  (1454, 'Rodrigo Garro', total_gols_stats=16, gols_reais=15, diff=+1, total_jogos_stats=68, presencas_reais=67)
  (5385, 'Endrick', total_gols_stats=18, gols_reais=17, diff=+1)
  (5491, 'Estêvão', total_gols_stats=18, gols_reais=17, diff=+1)
  (7228, 'Jadson', total_gols_stats=35, gols_reais=34, diff=+1)
  (8125, 'Jádson', total_gols_stats=42, gols_reais=43, diff=-1)
  (12405, 'Rómulo Otero', total_gols_stats=25, gols_reais=24, diff=+1)
  ```

### 1.3. Falha no Teste de Aceitação `test_t1_r1_db_no_forced_jogos_equals_gols_with_divergent_career`
- Ao executar `pytest tests/test_e2e_futstats.py`:
  ```
  FAILED tests/test_e2e_futstats.py::TestTier1FeatureCoverage::test_t1_r1_db_no_forced_jogos_equals_gols_with_divergent_career
  ```
- **Asserção falha**:
  ```python
  SELECT id_jogador, nome_exibicao, total_jogos, total_gols, jogos_carreira_oficiais
  FROM jogadores_estatisticas
  WHERE total_gols > 10
    AND jogos_carreira_oficiais > total_gols * 1.5
    AND total_jogos = total_gols;
  ```
- Retornou 2 anomalias ativas:
  - `(12636, 'Serginho', total_jogos=45, total_gols=45, jogos_carreira_oficiais=200)`
  - `(67, 'Flaco López', total_jogos=14, total_gols=14, jogos_carreira_oficiais=72)` (com total real de 12 jogos e 12 gols).

### 1.4. Brechas de Lógica no Script de Auditoria (`scripts/auditar_integridade_dados.py`)
- **Regra 5 (Reparo Incompleto de Clubes Nulos/Vazios)**:
  - O `SELECT` detecta `mandante IS NULL OR mandante = '' OR visitante IS NULL OR visitante = '' OR mandante LIKE '%Estatísticas%' OR visitante LIKE '%Estatísticas%'`.
  - O `DELETE`, contudo, só deleta `WHERE mandante LIKE '%Estatísticas%' OR visitante LIKE '%Estatísticas%'`.
  - Se houver uma partida com clube `NULL`, ela entra na contagem, não é deletada, mas se houver qualquer partida com `'Estatísticas'` deletada, o relatório estampa status `"CORRIGIDO"`, mascarando a persistência do clube nulo.
- **Regra 8 (Falso Positivo de Base Limpa para Confrontos 0x0)**:
  - O filtro foi restringido a:
    `OR (p.gols_mandante = 0 AND p.gols_visitante = 0 AND (p.mandante LIKE '%Estatísticas%' OR p.visitante LIKE '%Estatísticas%' OR g.clube LIKE '%Estatísticas%'))`
  - Existem no banco **306 partidas com placar 0x0 contendo 743 gols registrados** na tabela `gols` (ex: Partida 156 Cruzeiro x Atlético com 7 gols registrados; Partida 202505728 Inter de Limeira x Araçatuba com 6 gols). A Regra 8 ignora completamente essas 306 partidas e seus 743 gols porque nenhum clube contém a palavra `'Estatísticas'`.
- **Regra 11 (Incongruência de Rótulo vs Código)**:
  - O título no relatório é: `"Coerência de Atletas: Jogos >= Gols e Médias Verossímeis (<= 2.0)"`.
  - O SQL executado é: `WHERE (total_jogos <= 0 AND total_gols > 0) OR (total_gols >= 10 AND media_gols_por_jogo > 2.5);`.
  - O código não exige `total_jogos >= total_gols` (o que é correto devido aos 1.593 atletas com súmulas parciais de múltiplos gols) e usa o limiar `> 2.5` em vez de `<= 2.0`.

### 1.5. Expansão de Esquema `atleta_sofascore_ratings` (Aprovado)
- Colunas `npxg_acumulado REAL`, `delta_xg REAL`, `perfil_clinico TEXT`, `taxa_conversao_pct REAL` existem na tabela.
- Os 8 atletas de referência (Gabriel Barbosa, Hulk, Pedro, Neymar, Calleri, Pelé, Romário, Zico) contêm valores consistentes.
- `scripts/scraper_sofascore_ratings_pipeline.py` foi atualizado para persistir os campos.

---

## 2. Cadeia Lógica (Logic Chain)

1. **Da Observação 1.1 à Validação de Capacidade**:
   O banco ocupa 88.58 MB com 5.42 MB de margem até o teto de 94.0 MB. A remoção dos índices redundantes `idx_partidas_data` e `idx_escalacoes_atleta` preservou o desempenho (buscas em 0.051 ms e 0.298 ms), comprovando a excelência da Feature 1.
2. **Da Observação 1.2 à Quebra de Integridade Relacional**:
   A deleção de 13 partidas e 26 gols sem recalcular `jogadores_estatisticas` corrompeu a contagem estatística de 25 atletas. Raphael Veiga tem 83 gols na tabela `gols`, mas 85 em `jogadores_estatisticas`. O mesmo ocorre com Yuri Alberto (83 vs 85), Flaco López (12 vs 14), Neymar (134 vs 135) e Endrick (17 vs 18). Isso viola o princípio básico de integridade de dados e causa divergências quando a API de perfil cruza as duas tabelas.
3. **Da Observação 1.3 à Reprovação de Teste de Aceitação**:
   O teste de aceitação `test_t1_r1_db_no_forced_jogos_equals_gols_with_divergent_career` reprova explicitamente com Serginho e Flaco López. A meta de M1 era eliminar equivalências artificiais de jogos=gols na base de dados quando há carreira oficial divergente.
4. **Da Observação 1.4 à Fragilidade do Auditor**:
   O script `auditar_integridade_dados.py` reporta 12/12 "OK" devido a filtros excessivamente restritivos (como exigir a palavra `'Estatísticas'` para partidas 0x0), gerando uma falsa sensação de sanidade enquanto 743 gols persistem atrelados a 306 partidas 0x0.
5. **Síntese e Veredito**:
   Embora o trabalho de infraestrutura física (tamanho, VACUUM, índices) e expansão de esquema tenha sido impecável, a desincronização relacional de 25 atletas e a reprovação do teste de aceitação exigem o veredito **REJECT** para que o Worker M1 efetue os ajustes antes do início de M2.

---

## 3. Ressalvas e Limitações (Caveats)

1. **Reparo de Partidas Conmebol e 0x0 Históricas (Milestone M2)**:
   As 306 partidas históricas marcadas como 0x0 com gols (ex: Cruzeiro x Atlético 2003 e Inter de Limeira x Araçatuba) e confrontos Conmebol (19997098 Palmeiras x River Plate) estão formalmente alocadas no escopo do Milestone M2 (Features 5, 6 e 7). A crítica a M1 limita-se ao fato de a Regra 8 do auditor ter sido mascarada com filtro restritivo a `'Estatísticas'`.
2. **Backend e Frontend (Milestones M3 e M4)**:
   As falhas nos testes E2E relacionadas a rotas de API (`/api/jogadores/perfil`), badges visuais e cálculos dinâmicos de rating/xG são esperadas neste estágio, pois pertencem a M3 e M4.

---

## 4. Conclusão e Plano de Remediação (Conclusion)

**Veredito: REJECT**

Para converter a entrega em **APPROVE**, o Worker M1 deve executar as seguintes correções cirúrgicas:

### Ações Obrigatórias para o Worker M1:
1. **Ressincronizar `jogadores_estatisticas` para os 25 atletas afetados**:
   - Atualizar `total_gols` para coincidir exatamente com `SELECT COUNT(*) FROM gols WHERE id_jogador = ?`.
   - Atualizar `total_jogos` para coincidir com as presenças reais distintas (`escalacoes UNION gols UNION cartoes`).
   - Atualizar `media_gols_por_jogo = ROUND(CAST(total_gols AS REAL) / MAX(total_jogos, 1), 2)`.
   - Tratar especificamente os casos de Serginho (ID 12636) e Flaco López (ID 67) para que o teste `test_t1_r1_db_no_forced_jogos_equals_gols_with_divergent_career` seja aprovado.
2. **Corrigir o auto-reparo da Regra 5 em `scripts/auditar_integridade_dados.py`**:
   - Incluir no `DELETE FROM partidas` as condições `mandante IS NULL OR mandante = '' OR visitante IS NULL OR visitante = ''`.
   - Após deletar partidas e gols na Regra 5, disparar atualização dos contadores dos atletas afetados em `jogadores_estatisticas`.
3. **Harmonizar o rótulo da Regra 11 em `scripts/auditar_integridade_dados.py`**:
   - Ajustar o texto do relatório para `"Coerência de Atletas: Médias Verossímeis (<= 2.5)"`.
4. **Executar `VACUUM;`** e certificar que o arquivo `data/futebol.db` permanece abaixo de 94.0 MB.

---

## 5. Método de Verificação Independente (Verification Method)

O Worker M1 ou qualquer auditor pode reproduzir imediatamente as falhas apontadas executando:

1. **Identificar os 25 atletas desincronizados entre `gols` e `jogadores_estatisticas`**:
   ```bash
   ./.venv/bin/python3 -c "
   import sqlite3
   c = sqlite3.connect('data/futebol.db').cursor()
   c.execute('''
       WITH gols_reais AS (SELECT id_jogador, count(*) as n FROM gols WHERE id_jogador > 0 GROUP BY id_jogador)
       SELECT j.id_jogador, j.nome_exibicao, j.total_gols, g.n, (j.total_gols - g.n) as diff
       FROM jogadores_estatisticas j JOIN gols_reais g ON j.id_jogador = g.id_jogador
       WHERE j.total_gols != g.n ORDER BY abs(diff) DESC;
   ''')
   rows = c.fetchall()
   print(f'Atletas desincronizados: {len(rows)}')
   for r in rows: print(r)
   "
   ```
   *Resultado observado: 25 atletas com discrepância.*

2. **Executar o teste de aceitação de carreira divergente**:
   ```bash
   ./.venv/bin/pytest tests/test_e2e_futstats.py -k "test_t1_r1_db_no_forced_jogos_equals_gols_with_divergent_career"
   ```
   *Resultado observado: FAILED (anomalias em Serginho ID 12636 e Flaco López ID 67).*

3. **Verificar os 743 gols em 306 partidas 0x0 omitidos pela Regra 8**:
   ```bash
   ./.venv/bin/python3 -c "
   import sqlite3
   c = sqlite3.connect('data/futebol.db').cursor()
   c.execute('SELECT count(DISTINCT p.id_partida), count(g.id_gol) FROM partidas p JOIN gols g ON p.id_partida = g.id_partida WHERE p.gols_mandante = 0 AND p.gols_visitante = 0;')
   print(c.fetchone())
   "
   ```
   *Resultado observado: `(306, 743)`.*
