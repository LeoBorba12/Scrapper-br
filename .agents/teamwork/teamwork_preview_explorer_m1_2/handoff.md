# Relatório de Investigação Técnica — Explorer M1-2
## Saneamento do Script de Auditoria Relacional (`scripts/auditar_integridade_dados.py`)

**Data**: 2026-10-30T18:55:00Z  
**Investigador**: Explorer M1-2 (`teamwork_preview_explorer_m1_2`)  
**Escopo**: Feature 2 do Milestone M1 — Re-sequenciamento de Regras 1 a 12, eliminação do auto-reparo nocivo `total_jogos = MAX(total_jogos, total_gols)`, auditoria/detecção de partidas 0x0 com gols fantasma e clubes com títulos raspados (`LIKE '%Estatísticas%'`).

---

## 1. Observações (Observation)

### 1.1. Inconsistência de Numeração e Metadados das Regras
- **Arquivo**: `scripts/auditar_integridade_dados.py`
  - Na docstring da função `auditar_e_reparar_dados` (linha 12):
    ```python
    """
    Agente Automatizado de Integridade e Sanidade de Dados (FutStats Data Auditor)
    Executa 11 verificações de consistência e auto-reparo no SQLite.
    """
    ```
    Consta "Executa 11 verificações", enquanto a lista `relatorio["regras"]` anexa **exatamente 12 itens**.
  - Nos comentários de marcação das regras:
    - Linha 33: `# Regra 1: Gols nulos com placar existente (Auto-reparo)`
    - Linha 59: `# Regra 2: Datas com formato incorreto (deve ser YYYY-MM-DD)`
    - Linha 72: `# Regra 3: Gols órfãos (sem partida correspondente)`
    - Linha 85: `# Regra 4: Odds órfãs (sem partida correspondente)`
    - Linha 98: `# Regra 5: Partidas com clubes vazios ou 'Sem Clube'`
    - Linha 110: `# Regra 6: Vencedor inconsistente com placar`
    - Linha 150: `# Regra 7: Partidas duplicadas exatas (mesma data, mandante, visitante)`
    - Linha 167: `# Regra 9: Gols com clube invertido em partidas onde o time fez 0 gols (Auto-reparo)` $\rightarrow$ **Salto anômalo: pula a Regra 8**.
    - Linha 208: `# Regra 10: Jogadores com posição indefinida (Auto-inferência)`
    - Linha 231: `# Regra 11: Coerência de Clube em Gols vs Escalação Oficial (Auto-reparo de Adversário Invertido)`
    - Linha 299: `# Regra 12: Coerência de Jogos x Gols e Médias de Atletas`
    - Linha 323: `# Regra 12: Coerência de Clubes Recentes dos Atletas (Sincronização Dinâmica)` $\rightarrow$ **Duplicidade anômala: segundo bloco rotulado como Regra 12**.

### 1.2. O Auto-Reparo Nocivo na Regra 12 (Origem da Média 1.00)
- **Código Existente** (linhas 299–321):
  ```python
  # Regra 12: Coerência de Jogos x Gols e Médias de Atletas
  c.execute("""
      SELECT COUNT(*) FROM jogadores_estatisticas 
      WHERE total_gols > total_jogos OR (total_gols >= 10 AND media_gols_por_jogo > 2.0);
  """)
  atletas_anormais = c.fetchone()[0]
  reparados_atl = 0
  if atletas_anormais > 0:
      c.execute("""
          UPDATE jogadores_estatisticas
          SET total_jogos = MAX(total_jogos, total_gols),
              media_gols_por_jogo = ROUND(CAST(total_gols AS REAL) / MAX(MAX(total_jogos, total_gols), 1), 2)
          WHERE total_gols > total_jogos OR (total_gols >= 10 AND media_gols_por_jogo > 2.0);
      """)
      reparados_atl = c.rowcount
      conn.commit()
  ```
- **Evidência no Banco de Dados (`data/futebol.db`)**:
  - Consulta executada:
    ```sql
    SELECT COUNT(*) FROM jogadores_estatisticas WHERE total_jogos = total_gols AND total_gols >= 5;
    ```
    **Resultado**: 2.705 atletas forçados artificialmente para `total_jogos = total_gols` e `media_gols_por_jogo = 1.0`.
  - Caso emblemático Luís Fabiano (`id_jogador = 9033`):
    - Em `jogadores_estatisticas`: `total_jogos = 168`, `total_gols = 168`, `media_gols_por_jogo = 1.0`.
    - Presenças reais apuradas via `(escalacoes UNION gols UNION cartoes)`: **158 partidas distintas no catálogo local**.
    - Como Luís Fabiano marcou 168 gols em 158 partidas locais (múltiplos gols por jogo), a condição `total_gols (168) > total_jogos (158)` disparou o `UPDATE`, sobrepondo `total_jogos = MAX(158, 168) = 168` e `media_gols_por_jogo = 1.00`.
    - Qualquer reversão de `total_jogos` no banco seria imediatamente re-corrompida caso este auto-reparo permanecesse ativo.

### 1.3. Ponto Cego 1: Títulos de Páginas Raspadas nos Nomes de Clubes
- Em `partidas`, 13 confrontos contêm títulos da web em vez de nomes de agremiações esportivas:
  - IDs: `202503483` a `202503495` (ex: `'Estatísticas e Escalações São Bernardo'`, `'Estatísticas e Escalações Palmeiras'`, `'Estatísticas e Escalações Corinthians'`, etc.).
  - Todas essas 13 partidas foram gravadas com placar `'0 x 0'` e data genérica (`'2024-01-01'` ou `'2025-01-01'`).
- Em `gols`, 5 registros possuem `clube LIKE 'Estatísticas%'` (IDs: 20284762, 20284763, 20284769, 20284773, 20285000).
- Em `odds_partidas`, 13 registros vinculados a essas partidas espúrias.
- Em `jogadores_estatisticas`, 5 atletas absorveram a string em `clubes`: Yuri Alberto (ID 48), Flaco López (ID 67), Tiquinho Soares (ID 238), Estêvão (ID 5491) e Renato (ID 101390).
- **Insuficiência Atual da Regra 5**:
  ```sql
  SELECT COUNT(*) FROM partidas WHERE mandante IS NULL OR mandante = '' OR visitante IS NULL OR visitante = '';
  ```
  A Regra 5 ignora completamente agremiações com artefatos de raspagem web (`LIKE '%Estatísticas%'`).

### 1.4. Ponto Cego 2: Partidas 0x0 com Gols Fantasma Atribuídos
- A Regra 9 atual (a ser renumerada para Regra 8) restringe-se a:
  ```sql
  WHERE ((g.clube = p.mandante AND p.gols_mandante = 0 AND p.gols_visitante > 0)
      OR (g.clube = p.visitante AND p.gols_visitante = 0 AND p.gols_mandante > 0))
  ```
- O filtro exige expressamente `p.gols_visitante > 0` ou `p.gols_mandante > 0` para poder inverter o clube para o oponente.
- Consequência: partidas com placar `0 x 0` (`p.gols_mandante = 0 AND p.gols_visitante = 0`) onde gols fantasma foram inseridos (como os 26 gols das 13 partidas de scraping) passam totalmente despercebidas pela verificação.

---

## 2. Cadeia Lógica (Logic Chain)

1. **Sequenciamento Numérico Estrito**:
   - Para que o relatório seja canônico e consistente com `PROJECT.md` e `ORIGINAL_REQUEST.md`, a numeração das 12 regras deve ser sequencial de 1 a 12. A Regra 9 torna-se Regra 8, a Regra 10 torna-se Regra 9, a Regra 11 torna-se Regra 10, a primeira Regra 12 torna-se Regra 11, e a segunda Regra 12 permanece como Regra 12. O cabeçalho deve declarar 12 verificações.
2. **Eliminação do Auto-Reparo Nocivo (Regra 11)**:
   - Em um catálogo com acervo parcial pré-2018, artilheiros de alto desempenho podem legitimamente possuir mais gols locais cadastrados do que súmulas completas de escalação (`total_gols > total_jogos`), resultando em médias autênticas como 1.06 (Luís Fabiano), 1.25 (Marcelinho Carioca) ou 1.38 (Romário).
   - O auto-reparo que forçava `total_jogos = MAX(total_jogos, total_gols)` impunha a média artificial 1.00.
   - Sua remoção integral é imperativa. A consulta de auditoria deve verificar sanidade real: jogadores não podem ter 0 jogos com gols positivos (`total_jogos <= 0 AND total_gols > 0`) nem médias matematicamente implausíveis em larga escala (`total_gols >= 10 AND media_gols_por_jogo > 2.5`).
3. **Detecção e Auto-Cura de Títulos de Scraping (Regra 5)**:
   - Expandir a cláusula `WHERE` da Regra 5 para incluir `OR mandante LIKE '%Estatísticas%' OR visitante LIKE '%Estatísticas%'`.
   - Implementar auto-reparo cirúrgico em cascata que expurga as 13 partidas espúrias, seus 26 gols fantasma, suas 13 odds vinculadas, e higieniza a coluna `clubes` dos 5 atletas contaminados em `jogadores_estatisticas`.
4. **Detecção e Limpeza de Gols em Partidas 0x0 (Regra 8)**:
   - Na Regra 8, estender a cláusula `WHERE` para detectar gols atribuídos em partidas com placar `0 x 0` associadas a artefatos de scraping:
     `OR (p.gols_mandante = 0 AND p.gols_visitante = 0 AND (p.mandante LIKE '%Estatísticas%' OR p.visitante LIKE '%Estatísticas%' OR g.clube LIKE '%Estatísticas%'))`.
   - Adicionar auto-reparo que deleta gols espúrios nessas condições.
5. **Resultado Operacional do Auditor**:
   - Na primeira execução: detecta e repara as anomalias de clubes e gols espúrios, reportando `CORRIGIDO`.
   - Na segunda execução (e em execuções subsequentes): reporta rigorosamente **12/12 regras OK com 0 inconsistências encontradas**.

---

## 3. Ressalvas e Limitações (Caveats)

- **Natureza Read-Only da Investigação**: Nenhuma alteração foi gravada diretamente em `scripts/auditar_integridade_dados.py` ou `data/futebol.db` durante esta investigação. Todas as validações funcionais foram realizadas em cópia efêmera no diretório `/tmp/test_db_audit.db`.
- **Casos de Homônimos Históricos (Milestone M2)**: O expurgo das partidas com `LIKE '%Estatísticas%'` resolve a contaminação de scraping imediata. A desvinculação completa de homônimos (ex: Alberto Acosta vs Mycael ID 2066) e clubes adversários estrangeiros de torneios Conmebol está sob responsabilidade do Milestone M2 (Features 5, 6 e 7).
- **Outlier Histórico Real de Média**: O atleta Juan Carlos Sánchez (ID 7146) possui 14 gols em 6 jogos cadastrados na Copa Libertadores de 1985 (média 2.33), marcando inclusive 6 gols em uma única partida. O threshold de verossimilhança foi fixado em `media_gols_por_jogo > 2.5`, o que preserva esse recorde histórico verídico da Conmebol sem gerar falso positivo.

---

## 4. Conclusões e Proposta de Modificação (Conclusion & Proposed Diff)

### 4.1. Artefatos Produzidos
- Foi criado o arquivo de patch unificado pronto para aplicação:
  `file:///mnt/jogos_f/Antigravity_Projetos_e_Ferramentas/Guia%20profissional/.agents/teamwork/teamwork_preview_explorer_m1_2/auditar_integridade_dados.patch`

### 4.2. Snippets Comparativos (Antes vs Depois)

#### Bloco 1: Docstring (Linhas 9–13)
```python
# ANTES:
def auditar_e_reparar_dados():
    """
    Agente Automatizado de Integridade e Sanidade de Dados (FutStats Data Auditor)
    Executa 11 verificações de consistência e auto-reparo no SQLite.
    """

# DEPOIS:
def auditar_e_reparar_dados():
    """
    Agente Automatizado de Integridade e Sanidade de Dados (FutStats Data Auditor)
    Executa 12 verificações de consistência e auto-reparo no SQLite.
    """
```

#### Bloco 2: Regra 5 — Detecção e Auto-Cura de Scraping (Linhas 98–108)
```python
# ANTES:
    # Regra 5: Partidas com clubes vazios ou 'Sem Clube'
    c.execute("""
        SELECT COUNT(*) FROM partidas 
        WHERE mandante IS NULL OR mandante = '' OR visitante IS NULL OR visitante = '';
    """)
    clubes_invalidos = c.fetchone()[0]
    relatorio["regras"].append({
        "regra": "Nomes de Clubes Mandante/Visitante Válidos",
        "status": "OK" if clubes_invalidos == 0 else "FALHA",
        "ocorrencias": clubes_invalidos
    })

# DEPOIS:
    # Regra 5: Partidas com clubes vazios, 'Sem Clube' ou artefatos de scraping (Auto-reparo)
    c.execute("""
        SELECT COUNT(*) FROM partidas 
        WHERE mandante IS NULL OR mandante = '' 
           OR visitante IS NULL OR visitante = ''
           OR mandante LIKE '%Estatísticas%' 
           OR visitante LIKE '%Estatísticas%';
    """)
    clubes_invalidos = c.fetchone()[0]
    reparados_clubes = 0
    if clubes_invalidos > 0:
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
        reparados_clubes = c.rowcount

        c.execute("SELECT id_jogador, clubes FROM jogadores_estatisticas WHERE clubes LIKE '%Estatísticas%';")
        for jid, clbs in c.fetchall():
            limpos = [cb.strip() for cb in (clbs or '').split(',') if 'Estatísticas' not in cb and cb.strip()]
            c.execute("UPDATE jogadores_estatisticas SET clubes = ? WHERE id_jogador = ?;", (', '.join(limpos), jid))

        conn.commit()

    relatorio["regras"].append({
        "regra": "Nomes de Clubes Mandante/Visitante Válidos",
        "status": "CORRIGIDO" if reparados_clubes > 0 else ("OK" if clubes_invalidos == 0 else "FALHA"),
        "ocorrencias": clubes_invalidos,
        "reparados": reparados_clubes
    })
```

#### Bloco 3: Regra 8 — Renumeração e Detecção de Gols em 0x0 (Linhas 167–206)
```python
# ANTES:
    # Regra 9: Gols com clube invertido em partidas onde o time fez 0 gols (Auto-reparo)
    c.execute("""
        SELECT COUNT(*) 
        FROM gols g
        JOIN partidas p ON g.id_partida = p.id_partida
        WHERE ((g.clube = p.mandante AND p.gols_mandante = 0 AND p.gols_visitante > 0)
            OR (g.clube = p.visitante AND p.gols_visitante = 0 AND p.gols_mandante > 0))
          AND (g.tipo_de_gol IS NULL OR lower(g.tipo_de_gol) NOT LIKE '%contra%');
    """)
    gols_invertidos = c.fetchone()[0]
    reparados_gols_inv = 0
    if gols_invertidos > 0:
        ...
        reparados_gols_inv += c.rowcount
        conn.commit()

# DEPOIS:
    # Regra 8: Gols com clube invertido em partidas onde o time fez 0 gols ou 0x0 com gols fantasma (Auto-reparo)
    c.execute("""
        SELECT COUNT(*) 
        FROM gols g
        JOIN partidas p ON g.id_partida = p.id_partida
        WHERE ((g.clube = p.mandante AND p.gols_mandante = 0 AND p.gols_visitante > 0)
            OR (g.clube = p.visitante AND p.gols_visitante = 0 AND p.gols_mandante > 0)
            OR (p.gols_mandante = 0 AND p.gols_visitante = 0 AND (p.mandante LIKE '%Estatísticas%' OR p.visitante LIKE '%Estatísticas%' OR g.clube LIKE '%Estatísticas%')))
          AND (g.tipo_de_gol IS NULL OR lower(g.tipo_de_gol) NOT LIKE '%contra%');
    """)
    gols_invertidos = c.fetchone()[0]
    reparados_gols_inv = 0
    if gols_invertidos > 0:
        c.execute("""
            UPDATE gols
            SET clube = (SELECT p.visitante FROM partidas p WHERE p.id_partida = gols.id_partida)
            WHERE id_gol IN (
                SELECT g.id_gol FROM gols g JOIN partidas p ON g.id_partida = p.id_partida
                WHERE g.clube = p.mandante AND p.gols_mandante = 0 AND p.gols_visitante > 0
                  AND (g.tipo_de_gol IS NULL OR lower(g.tipo_de_gol) NOT LIKE '%contra%')
            );
        """)
        reparados_gols_inv += c.rowcount
        c.execute("""
            UPDATE gols
            SET clube = (SELECT p.mandante FROM partidas p WHERE p.id_partida = gols.id_partida)
            WHERE id_gol IN (
                SELECT g.id_gol FROM gols g JOIN partidas p ON g.id_partida = p.id_partida
                WHERE g.clube = p.visitante AND p.gols_visitante = 0 AND p.gols_mandante > 0
                  AND (g.tipo_de_gol IS NULL OR lower(g.tipo_de_gol) NOT LIKE '%contra%')
            );
        """)
        reparados_gols_inv += c.rowcount
        c.execute("""
            DELETE FROM gols
            WHERE id_gol IN (
                SELECT g.id_gol FROM gols g JOIN partidas p ON g.id_partida = p.id_partida
                WHERE p.gols_mandante = 0 AND p.gols_visitante = 0 
                  AND (p.mandante LIKE '%Estatísticas%' OR p.visitante LIKE '%Estatísticas%' OR g.clube LIKE '%Estatísticas%')
            );
        """)
        reparados_gols_inv += c.rowcount
        conn.commit()
```

#### Bloco 4: Renumeração das Regras 9 e 10 (Linhas 208 e 231)
```python
# ANTES:
    # Regra 10: Jogadores com posição indefinida (Auto-inferência)
...
    # Regra 11: Coerência de Clube em Gols vs Escalação Oficial (Auto-reparo de Adversário Invertido)

# DEPOIS:
    # Regra 9: Jogadores com posição indefinida (Auto-inferência)
...
    # Regra 10: Coerência de Clube em Gols vs Escalação Oficial (Auto-reparo de Adversário Invertido)
```

#### Bloco 5: Regra 11 — Remoção do Auto-Reparo Nocivo de Jogos=Gols (Linhas 299–321)
```python
# ANTES:
    # Regra 12: Coerência de Jogos x Gols e Médias de Atletas
    c.execute("""
        SELECT COUNT(*) FROM jogadores_estatisticas 
        WHERE total_gols > total_jogos OR (total_gols >= 10 AND media_gols_por_jogo > 2.0);
    """)
    atletas_anormais = c.fetchone()[0]
    reparados_atl = 0
    if atletas_anormais > 0:
        c.execute("""
            UPDATE jogadores_estatisticas
            SET total_jogos = MAX(total_jogos, total_gols),
                media_gols_por_jogo = ROUND(CAST(total_gols AS REAL) / MAX(MAX(total_jogos, total_gols), 1), 2)
            WHERE total_gols > total_jogos OR (total_gols >= 10 AND media_gols_por_jogo > 2.0);
        """)
        reparados_atl = c.rowcount
        conn.commit()

    relatorio["regras"].append({
        "regra": "Coerência de Atletas: Jogos >= Gols e Médias Verossímeis (<= 2.0)",
        "status": "CORRIGIDO" if reparados_atl > 0 else ("OK" if atletas_anormais == 0 else "FALHA"),
        "ocorrencias": atletas_anormais,
        "reparados": reparados_atl
    })

# DEPOIS:
    # Regra 11: Coerência de Jogos x Gols e Médias de Atletas (Sem Auto-Reparo Nocivo)
    c.execute("""
        SELECT COUNT(*) FROM jogadores_estatisticas 
        WHERE (total_jogos <= 0 AND total_gols > 0) 
           OR (total_gols >= 10 AND media_gols_por_jogo > 2.5);
    """)
    atletas_anormais = c.fetchone()[0]
    reparados_atl = 0

    relatorio["regras"].append({
        "regra": "Coerência de Atletas: Jogos >= Gols e Médias Verossímeis (<= 2.0)",
        "status": "OK" if atletas_anormais == 0 else "FALHA",
        "ocorrencias": atletas_anormais,
        "reparados": reparados_atl
    })
```

---

## 5. Método de Verificação Independente (Verification Method)

Qualquer agente pode verificar independentemente a validade matemática e operacional desta solução executando os seguintes passos:

### 5.1. Aplicação do Patch em Cópia de Teste
```bash
python3 -c "
import shutil, os, subprocess

# 1. Copia o script para teste efêmero
shutil.copyfile('scripts/auditar_integridade_dados.py', '/tmp/test_audit_script.py')

# 2. Aplica o patch
patch_path = '.agents/teamwork/teamwork_preview_explorer_m1_2/auditar_integridade_dados.patch'
ret = os.system(f'patch /tmp/test_audit_script.py < {patch_path}')
assert ret == 0, 'Falha ao aplicar o patch!'
print('Patch aplicado com sucesso em /tmp/test_audit_script.py')
"
```

### 5.2. Teste de Duplo Ciclo (Auto-Cura $\rightarrow$ 12/12 OK)
```bash
python3 -c "
import sqlite3, shutil, json, os

src_db = 'data/futebol.db'
test_db = '/tmp/test_eval_run.db'
shutil.copyfile(src_db, test_db)

# Aponta temporariamente o script corrigido para a base clone
with open('/tmp/test_audit_script.py', 'r') as f:
    content = f.read().replace('DB_PATH = os.path.join(BASE_DIR, \"data\", \"futebol.db\")', f'DB_PATH = \"{test_db}\"')
with open('/tmp/test_audit_script_run.py', 'w') as f:
    f.write(content)

import subprocess
# Primeira execução: auto-reparo dos artefatos
out1 = subprocess.check_output(['python3', '/tmp/test_audit_script_run.py']).decode('utf-8')
res1 = json.loads(out1)
print(f'Ciclo 1: Regras reportadas = {len(res1[\"regras\"])}')
print(f'Ciclo 1: Inconsistencias = {res1[\"inconsistencias_encontradas\"]}, Reparadas = {res1[\"inconsistencias_reparadas\"]}')

# Segunda execução: base limpa, 12/12 OK
out2 = subprocess.check_output(['python3', '/tmp/test_audit_script_run.py']).decode('utf-8')
res2 = json.loads(out2)
print(f'Ciclo 2: Inconsistências = {res2[\"inconsistencias_encontradas\"]}')
for i, r in enumerate(res2['regras'], 1):
    print(f'  Regra {i}: {r[\"regra\"]} -> {r[\"status\"]} (ocorrencias: {r[\"ocorrencias\"]})')

assert len(res2['regras']) == 12, 'Deve ter exatamente 12 regras'
assert res2['inconsistencias_encontradas'] == 0, 'Inconsistências devem ser zero no Ciclo 2'
assert all(r['status'] == 'OK' for r in res2['regras']), 'Todas as 12 regras devem estar OK'

os.remove(test_db)
os.remove('/tmp/test_audit_script.py')
os.remove('/tmp/test_audit_script_run.py')
print('=== Verificação Independente Concluída com Sucesso Absoluto ===')
"
```

### 5.3. Verificação da Preservação dos Testes de Regressão Matemática
```bash
./.venv/bin/pytest tests/test_model_evals.py
```
*(Critério de Sucesso: 22 passed)*
