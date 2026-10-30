# Handoff Report — Explorer M1-1 (Storage Optimization & VACUUM)

**Milestone**: M1 (Feature 1: SQLite Storage Optimization < 94.0 MB)  
**Agent**: Explorer M1-1 (`teamwork_preview_explorer_m1_1`)  
**Parent Agent**: `parent` (`9c2d948a-bd66-4e27-83b1-9e8d50e60942`)  
**Data**: 2026-10-30T18:46:00Z  
**Status**: CONCLUÍDO (Hard Handoff)

---

## 1. Observações (Observations)

### 1.1. Estado Atual de Armazenamento (`data/futebol.db`)
- **Tamanho Físico em Disco**: `96,845,824 bytes` (96.85 MB decimais / 92.36 MiB binários).
- **Parâmetros SQLite**: `page_size = 4096`, `page_count = 23644`, `freelist_count = 0`, `journal_mode = wal`.
- **Teto da Vercel**: `94,000,000 bytes` (94.0 MB decimais). O banco excede o teto decimal por 2.85 MB e possui apenas 1.64 MiB de folga se considerado em MiB (92.36 vs 94.0).
- Como `freelist_count = 0`, a execução isolada de `VACUUM;` sem poda de objetos libera 0 bytes.

### 1.2. Inventário e Análise dos Objetos Alvo

#### A. Índice `idx_partidas_data`
- **Definição em `construir_banco_futebol.py:148`**:
  ```python
  cursor.execute("CREATE INDEX IF NOT EXISTS idx_partidas_data ON partidas(data);")
  ```
- **Índice no SQLite**: `CREATE INDEX idx_partidas_data ON partidas(data)`
- **Tamanho no B-Tree (`dbstat`)**: `2,314,240 bytes` (2.31 MB / 2.21 MiB, 565 páginas).
- **Redundância Técnica Comprovada**:
  Em `scripts/higienizar_e_indexar.py:72-73`, foram criados:
  ```python
  ("idx_partidas_data_mandante", "CREATE INDEX IF NOT EXISTS idx_partidas_data_mandante ON partidas (data, mandante);")
  ("idx_partidas_data_visitante", "CREATE INDEX IF NOT EXISTS idx_partidas_data_visitante ON partidas (data, visitante);")
  ```
  Como `data` é a primeira coluna (coluna líder) dos índices compostos `idx_partidas_data_mandante` (3.55 MB) e `idx_partidas_data_visitante` (3.55 MB), qualquer consulta com `WHERE data = ?`, `WHERE data BETWEEN ? AND ?`, `WHERE data >= ?` ou `ORDER BY data` utiliza o índice composto de forma idêntica.
- **Teste de Plano de Execução (EXPLAIN QUERY PLAN)**:
  - *Antes do drop*: `SEARCH partidas USING INDEX idx_partidas_data (data=?)`
  - *Após drop de `idx_partidas_data`*: `SEARCH partidas USING INDEX idx_partidas_data_visitante (data=?)`
  - Latência de consulta: 0.0274 ms (antes) vs 0.0182 ms (depois).

#### B. Índice `idx_escalacoes_atleta`
- **Definição em `construir_banco_futebol.py:156`**:
  ```python
  cursor.execute("CREATE INDEX IF NOT EXISTS idx_escalacoes_atleta ON escalacoes(atleta);")
  ```
- **Índice no SQLite**: `CREATE INDEX idx_escalacoes_atleta ON escalacoes(atleta)`
- **Tamanho no B-Tree (`dbstat`)**: `4,747,264 bytes` (4.75 MB / 4.53 MiB, 1.159 páginas).
- **Análise de Consumo no Backend (`backend/app.py`)**:
  - `_construir_perfil_jogador` (`backend/app.py:2325-2331, 2376-2382`):
    ```python
    if target_id:
        cond_esc = "e.id_jogador = ?"
        params_esc = [target_id]
    ```
    Como todos os 19.783 atletas em `jogadores_estatisticas` possuem `id_jogador` populado, as requisições utilizam estritamente `e.id_jogador = ?`, ativando o índice `idx_escalacoes_id_jogador` (1.66 MB).
  - Head-to-Head `_obter_h2h_jogadores` (`backend/app.py:2865-2866`):
    ```sql
    WHERE (e1.id_jogador = ? OR (e1.id_jogador IS NULL AND LOWER(e1.atleta) = LOWER(?)))
      AND (e2.id_jogador = ? OR (e2.id_jogador IS NULL AND LOWER(e2.atleta) = LOWER(?)))
    ```
    No `EXPLAIN QUERY PLAN`, o SQLite utiliza `idx_escalacoes_id_jogador` para `e1` e `idx_escalacoes_partida_clube` para `e2`. O índice `idx_escalacoes_atleta` não é utilizado e nem poderia ser aproveitado para a expressão `LOWER(atleta)` por possuir collation binária padrão.
  - Latência da consulta H2H: 0.8655 ms (antes) vs 0.8019 ms (depois).

#### C. Tabela Legada `jogadores_resumo`
- **Definição no SQLite**:
  ```sql
  CREATE TABLE jogadores_resumo (
      nome TEXT PRIMARY KEY,
      clubes TEXT,
      total_jogos INTEGER,
      total_gols INTEGER,
      total_assistencias INTEGER DEFAULT 0,
      total_amarelos INTEGER,
      total_vermelhos INTEGER,
      ano_min INTEGER,
      ano_max INTEGER
  );
  ```
- **Tamanho no B-Tree (`dbstat`)**:
  - Dados da tabela: `897,024 bytes` (0.90 MB, 219 páginas).
  - Índice primário `sqlite_autoindex_jogadores_resumo_1`: `372,736 bytes` (0.37 MB, 91 páginas).
  - Total tabela + índice: `1,269,760 bytes` (1.27 MB / 1.21 MiB, 310 páginas).
- **Rastreabilidade no Código**:
  - `backend/app.py`: **0 ocorrências**. Não existe nenhuma query lendo `jogadores_resumo`.
  - `backend/ia_analista.py:168`: apenas incluída na lista estática `TABELAS_PERMITIDAS = { ... }` para sandbox de leitura do LLM.
  - `frontend/`: **0 ocorrências**.
  - `scripts/auditar_integridade_dados.py`: **0 ocorrências**.
  - `tests/test_model_evals.py`: **0 ocorrências**.
  - A tabela era uma materialização legada de versões antigas do projeto, totalmente substituída por `jogadores_estatisticas`.

### 1.3. Resultados da Simulação em Cópia Temporária (`/tmp/test_m1_vacuum.db`)
Executado em `/tmp/test_m1_vacuum.db`:
- **Tamanho inicial**: `96,845,824 bytes` (96.85 MB / 92.36 MiB, 23.644 páginas)
- **Tamanho final após drops + VACUUM**: `88,514,560 bytes` (88.51 MB / 84.41 MiB, 21.610 páginas)
- **Redução Líquida Obtida**: `8,331,264 bytes` (8.33 MB decimais / 7.95 MiB binários, exatamente 2.034 páginas liberadas)
- **Folga em Relação ao Limite Vercel (94.0 MB)**:
  `94,000,000 - 88,514,560 = 5,485,440 bytes` (**5.49 MB livres**).
- **Com `ANALYZE;` + `VACUUM;`**: `88,576,000 bytes` (88.58 MB, **5.42 MB livres**).
- **Verificação de Sanidade**:
  - `PRAGMA integrity_check;` $\rightarrow$ `ok`.
  - `auditar_integridade_dados.py` $\rightarrow$ 12/12 regras OK, 0 anomalias.
  - `pytest tests/test_model_evals.py` $\rightarrow$ 22/22 testes aprovados (0.29s).

---

## 2. Cadeia Lógica (Logic Chain)

1. **Premissa de Restrição de Infraestrutura**: O limite de empacotamento da Vercel é de 94.0 MB. O arquivo `data/futebol.db` atual possui 96.85 MB (excesso de 2.85 MB) e freelist igual a 0.
2. **Identificação de Peso em Índices**: Mais de 51% do banco (49.88 MB) é ocupado por índices B-Tree. Dentre eles, `idx_partidas_data` (2.31 MB) indexa exclusivamente `partidas(data)`, mas já coexiste com os índices compostos `idx_partidas_data_mandante` e `idx_partidas_data_visitante`. Em árvores B-Tree, uma busca por `data` utiliza diretamente o prefixo esquerdo de um índice composto `(data, coluna2)`. Logo, `idx_partidas_data` é estruturalmente redundante.
3. **Desacoplamento de `idx_escalacoes_atleta`**: O índice `idx_escalacoes_atleta` (4.75 MB) indexa strings de atletas em 152k linhas. Com a consolidação da arquitetura orientada a IDs (`id_jogador`), o backend consulta escalações através do índice numérico `idx_escalacoes_id_jogador` (1.66 MB). As consultas comparativas (H2H) operam sobre `id_jogador` e `id_partida`. Eliminar esse índice poupa 4.75 MB sem causar degradação de tempo de resposta (medido: 0.12 ms na busca por jogador).
4. **Desativação de Tabela Morta**: A tabela `jogadores_resumo` (1.27 MB) não é consultada por nenhuma rota ativa do backend (`app.py`), nem pelo frontend, nem por rotinas de auditoria (`auditar_integridade_dados.py`). Trata-se de resíduo de migração.
5. **Reestruturação Física via VACUUM**: Ao executar `DROP` desses 3 objetos, 2.034 páginas de 4 KB são desassociadas. O comando `VACUUM` reconstrói o arquivo físico de forma contígua, reduzindo-o imediatamente de 96.85 MB para 88.51 MB, garantindo conformidade matemática e operacional com o teto Vercel (< 94.0 MB) com margem confortável de 5.49 MB.

---

## 3. Ressalvas e Limitações (Caveats)

- **Modo Read-Only Preservado**: Nenhuma alteração foi realizada em `data/futebol.db` durante esta investigação. Todas as medições e testes foram realizados em cópias efêmeras (`/tmp/test_m1_vacuum.db`).
- **Concorrência durante VACUUM**: O comando SQLite `VACUUM` requer lock exclusivo temporário e espaço livre em disco equivalente ao tamanho do banco (~90 MB) para criar o arquivo temporário de reconstrução. Deve ser executado sem processos de escrita concorrentes ativos.
- **Limpeza Complementar em Código**:
  - `construir_banco_futebol.py:148, 156`: Mantém as instruções `CREATE INDEX` dos 2 índices podados. Devem ser comentadas ou removidas no milestone para evitar recriação acidental em novos builds.
  - `backend/ia_analista.py:168`: Recomenda-se remover `"jogadores_resumo"` de `TABELAS_PERMITIDAS` por boa prática de governança.

---

## 4. Conclusão e Plano Exato de Execução (Conclusion & Execution Plan)

A otimização de armazenamento é 100% segura, viável e indispensável para viabilizar as expansões de dados dos milestones seguintes sem estourar o teto da Vercel.

### 4.1. Script SQL Canônico
```sql
-- ====================================================================
-- Feature 1 (Milestone M1): SQLite Storage Optimization & VACUUM
-- Redução garantida: 96.85 MB -> 88.51 MB (8.33 MB liberados)
-- ====================================================================

-- 1. Poda de índices redundantes e não utilizados
DROP INDEX IF EXISTS idx_partidas_data;
DROP INDEX IF EXISTS idx_escalacoes_atleta;

-- 2. Poda de tabela legada não referenciada
DROP TABLE IF EXISTS jogadores_resumo;

-- 3. Atualização de estatísticas do Query Planner
ANALYZE;

-- 4. Reconstrução compacta do arquivo físico
VACUUM;

-- 5. Ponto de verificação e truncamento do log WAL
PRAGMA wal_checkpoint(TRUNCATE);
```

### 4.2. Procedimento de Execução Seguro (Para o Agente Implementador)
Criar script de execução ou executar diretamente via Python com backup defensivo:

```python
import sqlite3
import os
import shutil

DB_PATH = 'data/futebol.db'
BACKUP_PATH = 'data/futebol.db.bak_pre_m1'

print("1. Criando backup preventivo...")
shutil.copyfile(DB_PATH, BACKUP_PATH)

print("2. Conectando e executando SQL de otimização...")
conn = sqlite3.connect(DB_PATH)
c = conn.cursor()

c.execute("DROP INDEX IF EXISTS idx_partidas_data;")
c.execute("DROP INDEX IF EXISTS idx_escalacoes_atleta;")
c.execute("DROP TABLE IF EXISTS jogadores_resumo;")
conn.commit()

print("3. Executando ANALYZE...")
c.execute("ANALYZE;")
conn.commit()

print("4. Executando VACUUM...")
c.execute("VACUUM;")

print("5. Checkpoint WAL...")
c.execute("PRAGMA wal_checkpoint(TRUNCATE);")

conn.close()

tamanho_final = os.path.getsize(DB_PATH)
print(f"Sucesso! Tamanho final: {tamanho_final:,} bytes ({tamanho_final/1e6:.2f} MB)")
assert tamanho_final < 94_000_000, "ALERTA: Tamanho acima de 94 MB!"
```

### 4.3. Plano de Rollback Imediato
Caso ocorra qualquer erro imprevisto:
```bash
cp data/futebol.db.bak_pre_m1 data/futebol.db
rm -f data/futebol.db-wal data/futebol.db-shm
```

---

## 5. Método de Verificação Independente (Verification Method)

O implementador e os verificadores podem atestar o resultado de forma determinística executando:

1. **Verificação de Tamanho e Teto Vercel (< 94.0 MB)**:
   ```bash
   python3 -c "import os; sz = os.path.getsize('data/futebol.db'); print(f'Tamanho: {sz:,} bytes ({sz/1e6:.2f} MB) - OK: {sz < 94000000}')"
   ```
   *(Critério de aprovação: Tamanho ~88.58 MB e `OK: True`)*

2. **Verificação de Integridade Relacional do SQLite**:
   ```bash
   python3 -c "import sqlite3; conn = sqlite3.connect('data/futebol.db'); print(conn.cursor().execute('PRAGMA integrity_check;').fetchall()); conn.close()"
   ```
   *(Critério de aprovação: `[('ok',)]`)*

3. **Verificação da Inexistência dos Objetos Podados**:
   ```bash
   python3 -c "import sqlite3; c = sqlite3.connect('data/futebol.db').cursor(); print('idx_partidas_data:', c.execute(\"SELECT COUNT(*) FROM sqlite_master WHERE name='idx_partidas_data'\").fetchone()[0]); print('idx_escalacoes_atleta:', c.execute(\"SELECT COUNT(*) FROM sqlite_master WHERE name='idx_escalacoes_atleta'\").fetchone()[0]); print('jogadores_resumo:', c.execute(\"SELECT COUNT(*) FROM sqlite_master WHERE name='jogadores_resumo'\").fetchone()[0])"
   ```
   *(Critério de aprovação: todos os 3 counts iguais a 0)*

4. **Verificação do Query Planner para Datas**:
   ```bash
   python3 -c "import sqlite3; c = sqlite3.connect('data/futebol.db').cursor(); print(c.execute('EXPLAIN QUERY PLAN SELECT * FROM partidas WHERE data = ?', ('2023-10-01',)).fetchall())"
   ```
   *(Critério de aprovação: Utiliza `idx_partidas_data_visitante` ou `idx_partidas_data_mandante` com SEARCH)*

5. **Suíte de Regressão Matemática (Dixon-Coles)**:
   ```bash
   ./.venv/bin/pytest tests/test_model_evals.py
   ```
   *(Critério de aprovação: 22 passed em < 0.5s)*

6. **Auditoria de Integridade dos Dados (12 Regras)**:
   ```bash
   python3 scripts/auditar_integridade_dados.py
   ```
   *(Critério de aprovação: 12/12 regras OK, 0 inconsistências reportadas)*
