# Forensic Audit Report — Milestone M1 Iteration 2 (Remediation)

**Work Product**: Milestone M1 Iteration 2 Work Products (`data/futebol.db`, `scripts/auditar_integridade_dados.py`, `scripts/scraper_sofascore_ratings_pipeline.py`, `construir_banco_futebol.py`, `backend/ia_analista.py`)  
**Auditor**: Forensic Auditor M1 Retry 1 (`teamwork_preview_auditor_m1_retry_1`)  
**Parent Agent**: `parent` (`9c2d948a-bd66-4e27-83b1-9e8d50e60942`)  
**Timestamp**: 2026-10-30T20:00:00Z  
**Profile**: General Project (Integrity Mode: Development)  
**Verdict**: **CLEAN**

---

### Phase Results

| # | Forensic Check | Result | Details |
|---|---|:---:|---|
| 1 | **Hardcoded Output & Test Results Detection** | **PASS** | No hardcoded outputs, fake returns, or test spoofing in scripts or test files. |
| 2 | **Facade Implementation Detection** | **PASS** | Auto-repair logic in `scripts/auditar_integridade_dados.py` and pipeline scripts perform genuine computational SQL work. |
| 3 | **Pre-populated Artifact Detection** | **PASS** | No pre-populated logs or test artifacts predating this iteration were found; historical logs dated Oct 19/23 are unrelated. |
| 4 | **Test Suite Cheating / Mock Bypasses** | **PASS** | Zero instances of `mock`, `monkeypatch`, `unittest.mock`, `skip`, or `xfail` across test suites. |
| 5 | **Database Physical Health & Storage Ceiling** | **PASS** | `data/futebol.db` size is 88,580,096 bytes (88.58 MB), 5.42 MB below the 94.0 MB limit. `PRAGMA integrity_check` returned `ok`. |
| 6 | **25 Athletes Relational Resynchronization** | **PASS** | Discrepancy between `jogadores_estatisticas.total_gols` and `COUNT(gols)` dropped from 25 to exactly 0. |
| 7 | **Divergent Career Acceptance Test** | **PASS** | `test_t1_r1_db_no_forced_jogos_equals_gols_with_divergent_career` passed (0 anomalies found across whole DB). |
| 8 | **Relational Integrity Audit Script** | **PASS** | `scripts/auditar_integridade_dados.py` executed cleanly: 12/12 rules OK, 0 inconsistencies found, 0 repaired. |
| 9 | **Mathematical Regressions Gate (Dixon-Coles)** | **PASS** | `tests/test_model_evals.py` executed cleanly: 22/22 tests passed in 0.32s. |
| 10 | **Storage & Infra E2E Suite (-m r4)** | **PASS** | `tests/test_e2e_futstats.py -m r4` executed cleanly: 9/9 tests passed in 4.02s. |
| 11 | **Frontend Production Build** | **PASS** | `npm run build` in `frontend/` completed with exit code 0 (`✓ built in 7.11s`). |

---

## 1. Observação (Observation)

### 1.1. Inspeção de Git Diff
Comando executado: `git diff --stat`
```text
 backend/ia_analista.py                        |   1 -
 construir_banco_futebol.py                    |   4 +-
 data/futebol.db                               | Bin 96845824 -> 88580096 bytes
 scripts/auditar_integridade_dados.py          | 169 ++++++++++++++++++++++----
 scripts/scraper_sofascore_ratings_pipeline.py |  33 ++++-
 5 files changed, 179 insertions(+), 28 deletions(-)
```
- Em `scripts/auditar_integridade_dados.py`:
  - **Regra 5**: Auto-reparo ampliado para incluir `mandante IS NULL OR mandante = '' OR visitante IS NULL OR visitante = ''`, coletando previamente os `id_jogador` em `atletas_afetados` e recalculando atomicamente `total_gols`, `total_jogos`, `media_gols_por_jogo`, `participacoes_gols` e `media_participacao_por_jogo` via agregação em `gols`, `escalacoes` e `cartoes`.
  - **Regra 8**: Auto-reparo de partidas 0x0 com gols com artefatos de scraping.
  - **Regra 11**: Rótulo ajustado para `"Coerência de Atletas: Médias Verossímeis (<= 2.5)"` e remoção do `UPDATE` nocivo que forçava artificialmente `total_jogos = total_gols`.
- Em `data/futebol.db`: Arquivo reduzido de 96.8 MB para 88.58 MB (-8.26 MB) após `ANALYZE`, `VACUUM` e `PRAGMA wal_checkpoint(TRUNCATE)`.

### 1.2. Verificação Física do Banco de Dados
Comando executado:
```python
import sqlite3, os
db_path = 'data/futebol.db'
size = os.path.getsize(db_path)
conn = sqlite3.connect(db_path)
c = conn.cursor()
c.execute('PRAGMA integrity_check;')
```
- **Tamanho Físico**: `88,580,096 bytes` (**88.58 MB decimais** / **84.48 MiB binários**).
- **Folga até o teto de 94.0 MB**: `5,419,904 bytes` (**5.42 MB** de margem).
- **Integridade Estrutural**: `PRAGMA integrity_check` retornou verbatim `[('ok',)]`.

### 1.3. Auditoria Matemática dos 25 Atletas Desincronizados
Comando executado:
```sql
WITH gols_reais AS (
    SELECT id_jogador, count(*) as n FROM gols WHERE id_jogador > 0 GROUP BY id_jogador
)
SELECT count(*) 
FROM jogadores_estatisticas j 
LEFT JOIN gols_reais g ON j.id_jogador = g.id_jogador
WHERE j.total_gols != COALESCE(g.n, 0);
```
- **Resultado Verbatim**: `0` atletas com contagem divergente.
- Amostragem dos atletas citados pelo Challenger M1-1:
  - **Raphael Veiga (ID 12)**: `total_gols = 83` (COUNT em `gols` = 83), `total_jogos = 177`, `media = 0.47`.
  - **Yuri Alberto (ID 48)**: `total_gols = 83` (COUNT em `gols` = 83), `total_jogos = 191`, `media = 0.43`.
  - **Memphis Depay (ID 49)**: `total_gols = 18` (COUNT em `gols` = 18), `total_jogos = 38`, `media = 0.47`.
  - **Endrick (ID 5385)**: `total_gols = 17` (COUNT em `gols` = 17), `total_jogos = 22`, `media = 0.77`.
  - **Estêvão (ID 5491)**: `total_gols = 17` (COUNT em `gols` = 17), `total_jogos = 21`, `media = 0.81`.
  - **Flaco López (ID 67)**: `total_gols = 12` (COUNT em `gols` = 12), `total_jogos = 127`, `media = 0.09`, `jogos_carreira_oficiais = 294`.
  - **Serginho (ID 12636)**: `total_gols = 45` (COUNT em `gols` = 45), `total_jogos = 76`, `media = 0.59`, `jogos_carreira_oficiais = 200`.

- Análise de Autenticidade dos Totais de Serginho e Flaco López:
  - Serginho (12636): `COUNT(DISTINCT id_partida)` da UNION entre escalações (47), gols (45) e cartões = **76** partidas. Total na tabela: **76**.
  - Flaco López (67): `COUNT(DISTINCT id_partida)` da UNION entre escalações (115), gols (12) e cartões = **127** partidas. Total na tabela: **127**.
  - Os IDs fragmentados da CBF (21287 e 19997) foram zerados e tiveram suas escalações genuinamente unificadas nos IDs canônicos.

### 1.4. Execução Independente de Testes e Scripts
1. **Auditoria de Dados (`scripts/auditar_integridade_dados.py`)**:
   - Exit code: 0
   - `inconsistencias_encontradas: 0`, `inconsistencias_reparadas: 0`.
   - Todas as 12 regras com status `"OK"`.
2. **Avaliação Preditiva Dixon-Coles (`tests/test_model_evals.py`)**:
   - Exit code: 0
   - `22 passed in 0.32s`.
3. **Teste de Carreira Divergente (`test_t1_r1_db_no_forced_jogos_equals_gols_with_divergent_career`)**:
   - Exit code: 0
   - `1 passed, 49 deselected in 0.30s`.
   - Query SQL direta sem restrição `LIMIT` retornou `0` anomalias em toda a base de 19.000+ atletas.
4. **Suíte Grupo R4 (`tests/test_e2e_futstats.py -m r4`)**:
   - Exit code: 0
   - `9 passed, 41 deselected in 4.02s`.
5. **Build de Produção do Frontend (`npm run build` em `frontend/`)**:
   - Exit code: 0
   - `✓ built in 7.11s` (Vite v5.4.21).

---

## 2. Cadeia Lógica (Logic Chain)

1. **Da Verificação de Código e Ausência de Spoofing à Autenticidade**:
   Não há stubs, mocks, dados estáticos injetados ou funções com retornos fabricados. Os scripts executam transações SQL reais sobre o arquivo `data/futebol.db`.
2. **Da Análise Relacional à Validação da Causa-Raiz**:
   A falha identificada pelo Challenger M1-1 (25 atletas desincronizados por exclusão de partidas sem recálculo de agregados) foi remediada via recálculo matemático baseado nos registros de eventos (`gols`, `escalacoes`, `cartoes`). A consulta de checagem confirma 0 atletas desincronizados em toda a base.
3. **Da Re-vinculação de Escalações à Eliminação de Anomalias de Carreira**:
   Serginho (12636) e Flaco López (67) não têm seus `total_jogos` forçados a constantes arbitrariamente. Suas presenças registradas saltaram para 76 e 127 partidas com base na reintegração das escalações atômicas dos registros de homônimos (21287 e 19997). Com isso, a condição `total_jogos == total_gols` com carreira divergente foi erradicada naturalmente, permitindo que o teste de aceitação passe de forma legítima.
4. **Da Integridade Física e Conformidade com o Teto Vercel**:
   O banco ocupa 88.58 MB com 5.42 MB de margem até o teto de 94.0 MB. A execução de `PRAGMA integrity_check` retornou `ok`, atestando a ausência de corrupção b-tree ou páginas corrompidas após as exclusões e vacuum.

---

## 3. Ressalvas e Limitações (Caveats)

- **Escopo Delimitado ao Milestone M1**: As partidas históricas com placar 0x0 e gols catalogados em competições Conmebol (ex: Libertadores 1999 Palmeiras x River Plate) e os endpoints de perfil da API permanecem agendados para os Milestones M2, M3 e M4, conforme o planejamento aprovado.
- Os 12 testes do arquivo `test_e2e_futstats.py` que falham atualmente quando executados sem filtro de marker referem-se estritamente aos escopos das fases futuras (R2 Conmebol no M2 e rotas da API no M3).

---

## 4. Conclusão (Conclusion)

A remediação realizada pelo Worker M1 Retry é genuína, robusta e matematicamente precisa.
- Não houve hardcoding nem simulação de resultados.
- A causa-raiz das desincronizações relacionais foi sanada no banco e protegida no script de auditoria para prevenções futuras.
- O teste de aceitação de carreira divergente passa de forma autêntica.
- Todos os gates de regressão preditiva (22/22) e confiabilidade/armazenamento (9/9) foram homologados com sucesso.

**Veredito Final**: **CLEAN**.

---

## 5. Método de Verificação Independente (Verification Method)

Qualquer auditor pode reproduzir imediatamente os testes e verificar a integridade através dos comandos:

1. **Verificação de Desincronização de Atletas (deve retornar 0)**:
   ```bash
   ./.venv/bin/python3 -c "
   import sqlite3
   c = sqlite3.connect('data/futebol.db').cursor()
   c.execute('''
       WITH gols_reais AS (SELECT id_jogador, count(*) as n FROM gols WHERE id_jogador > 0 GROUP BY id_jogador)
       SELECT count(*) FROM jogadores_estatisticas j LEFT JOIN gols_reais g ON j.id_jogador = g.id_jogador
       WHERE j.total_gols != COALESCE(g.n, 0);
   ''')
   assert c.fetchone()[0] == 0, 'Erro: atletas desincronizados encontrados!'
   print('Sincronia de atletas: 100% OK')
   "
   ```

2. **Verificação de Tamanho e Integridade Física**:
   ```bash
   ./.venv/bin/python3 -c "
   import os, sqlite3
   sz = os.path.getsize('data/futebol.db')
   print(f'Tamanho: {sz} bytes ({sz/1e6:.2f} MB)')
   assert sz < 94000000, 'Tamanho excede 94.0 MB'
   c = sqlite3.connect('data/futebol.db').cursor()
   c.execute('PRAGMA integrity_check;')
   res = c.fetchall()
   assert res == [('ok',)], f'Erro de integridade: {res}'
   print('Integridade Física: OK')
   "
   ```

3. **Execução do Script de Auditoria**:
   ```bash
   ./.venv/bin/python3 scripts/auditar_integridade_dados.py
   ```

4. **Execução dos Gates de Teste**:
   ```bash
   ./.venv/bin/pytest tests/test_model_evals.py
   ./.venv/bin/pytest tests/test_e2e_futstats.py -k "test_t1_r1_db_no_forced_jogos_equals_gols_with_divergent_career"
   ./.venv/bin/pytest tests/test_e2e_futstats.py -m "r4"
   ```

5. **Build do Frontend**:
   ```bash
   cd frontend && npm run build
   ```
