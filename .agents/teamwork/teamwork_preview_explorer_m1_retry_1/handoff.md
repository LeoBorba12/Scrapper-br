# Handoff Report — Explorer M1 Retry 1 (Resync of 25 Athletes in jogadores_estatisticas)

**Milestone**: M1 (Features 1, 2, 3, 4 - Retry Phase)  
**Agent**: Explorer M1 Retry 1 (`teamwork_preview_explorer_m1_retry_1`)  
**Parent Agent**: `parent` (`9c2d948a-bd66-4e27-83b1-9e8d50e60942`)  
**Data**: 2026-10-30T19:35:00Z  
**Handoff Type**: Hard Handoff  

---

## 1. Observação (Observation)

### 1.1. Diagnóstico dos 25 Atletas Desincronizados
Ao inspecionar a base de dados `data/futebol.db` com o cruzamento relacional:
```sql
WITH gols_reais AS (
    SELECT id_jogador, count(*) as n 
    FROM gols 
    WHERE id_jogador > 0 
    GROUP BY id_jogador
)
SELECT j.id_jogador, j.nome_exibicao, j.total_gols, COALESCE(g.n, 0) as gols_reais, 
       (j.total_gols - COALESCE(g.n, 0)) as diff
FROM jogadores_estatisticas j 
LEFT JOIN gols_reais g ON j.id_jogador = g.id_jogador
WHERE j.total_gols != COALESCE(g.n, 0);
```
Constatou-se a existência de **exatamente 25 atletas** com discrepância entre `total_gols` em `jogadores_estatisticas` e a contagem real de registros na tabela `gols`.

A causa-raiz de 23 desses 25 casos foi a execução do auto-reparo da Regra 5 em `scripts/auditar_integridade_dados.py` pelo Worker M1, que deletou 13 partidas espúrias de scraping (`mandante LIKE '%Estatísticas%' OR visitante LIKE '%Estatísticas%'`) e seus 26 gols vinculados na tabela `gols`, porém sem disparar a atualização dos contadores estatísticos em `jogadores_estatisticas`. Os outros 2 casos (Jadson ID 7228 e Jádson ID 8125) decorrem de desambiguação prévia de homônimos na tabela `gols` onde `jogadores_estatisticas` permaneceu desfasado (+1 e -1 gol).

### 1.2. Mapeamento Completo dos 25 Atletas Afetados
| ID | Nome Atleta | Gols (Antes → Depois) | Jogos (Antes → Depois) | Média Gols (Antes → Depois) | Part. Gols (Antes → Depois) | Média Part. (Antes → Depois) |
|---|---|---|---|---|---|---|
| 12 | Raphael Veiga | 85 → **83** | 179 → **177** | 0.47 → **0.47** | 130 → **128** | 0.73 → **0.72** |
| 48 | Yuri Alberto | 85 → **83** | 193 → **191** | 0.44 → **0.43** | 85 → **83** | 0.44 → **0.43** |
| 49 | Memphis Depay | 19 → **18** | 39 → **38** | 0.49 → **0.47** | 19 → **18** | 0.49 → **0.47** |
| 67 | Flaco López | 14 → **12** | 14 → **12** | 1.0 → **1.0** | 14 → **12** | 1.0 → **1.0** |
| 69 | Joaquín Piquerez | 9 → **8** | 43 → **42** | 0.21 → **0.19** | 9 → **8** | 0.21 → **0.19** |
| 78 | Eduardo Sasha | 82 → **81** | 134 → **133** | 0.61 → **0.61** | 82 → **81** | 0.61 → **0.61** |
| 166 | Vitinho | 54 → **53** | 186 → **185** | 0.29 → **0.29** | 54 → **53** | 0.29 → **0.29** |
| 238 | Tiquinho Soares | 32 → **31** | 60 → **59** | 0.53 → **0.53** | 32 → **31** | 0.53 → **0.53** |
| 257 | Guilherme | 61 → **60** | 97 → **96** | 0.63 → **0.63** | 61 → **60** | 0.63 → **0.63** |
| 267 | Murilo | 24 → **23** | 75 → **74** | 0.32 → **0.31** | 24 → **23** | 0.32 → **0.31** |
| 328 | Thiago Borbas | 7 → **6** | 25 → **24** | 0.28 → **0.25** | 7 → **6** | 0.28 → **0.25** |
| 352 | Neymar | 135 → **134** | 126 → **125** | 1.07 → **1.07** | 135 → **134** | 1.07 → **1.07** |
| 995 | João Schmidt | 4 → **3** | 44 → **43** | 0.09 → **0.07** | 4 → **3** | 0.09 → **0.07** |
| 1126 | Jonathan Calleri | 84 → **83** | 119 → **118** | 0.71 → **0.70** | 84 → **83** | 0.71 → **0.70** |
| 1454 | Rodrigo Garro | 16 → **15** | 68 → **67** | 0.24 → **0.22** | 16 → **15** | 0.24 → **0.22** |
| 5385 | Endrick | 18 → **17** | 23 → **22** | 0.78 → **0.77** | 18 → **17** | 0.78 → **0.77** |
| 5491 | Estêvão | 18 → **17** | 22 → **21** | 0.82 → **0.81** | 18 → **17** | 0.82 → **0.81** |
| 7228 | Jadson | 35 → **34** | 88 → **88** | 0.40 → **0.39** | 35 → **34** | 0.40 → **0.39** |
| 8125 | Jádson | 42 → **43** | 40 → **40** | 1.05 → **1.07** | 42 → **43** | 1.05 → **1.07** |
| 12405 | Rómulo Otero | 25 → **24** | 44 → **43** | 0.57 → **0.56** | 25 → **24** | 0.57 → **0.56** |
| 14084 | Ángel Romero | 39 → **38** | 61 → **60** | 0.64 → **0.63** | 39 → **38** | 0.64 → **0.63** |
| 14443 | Anibal Moreno | 2 → **1** | 2 → **1** | 1.0 → **1.0** | 2 → **1** | 1.0 → **1.0** |
| 15897 | Joaquim | 3 → **2** | 3 → **2** | 1.0 → **1.0** | 3 → **2** | 1.0 → **1.0** |
| 100781 | Giuliano | 5 → **4** | 5 → **4** | 1.0 → **1.0** | 5 → **4** | 1.0 → **1.0** |
| 101390 | Renato | 3 → **2** | 3 → **2** | 1.0 → **1.0** | 3 → **2** | 1.0 → **1.0** |

---

## 2. Cadeia Lógica (Logic Chain)

1. **Da Causa-Raiz à Abrangência do Problema**:
   A auditoria da Regra 5 removeu fisicamente 13 partidas espúrias de raspagem e 26 registros da tabela `gols`. No entanto, como `jogadores_estatisticas` é uma tabela agregada desnormalizada, a deleção física em tabelas transacionais (`partidas`, `gols`, `escalacoes`) deixou os contadores `total_gols`, `total_jogos`, `media_gols_por_jogo`, `participacoes_gols` e `media_participacao_por_jogo` inconsistentes.
2. **Avaliação das Estratégias de Consulta SQL**:
   - *Abordagem Correlacionada Pura (ANSI Subquery)*: Ao testar um `UPDATE` tradicional correlacionado repetindo subqueries de `UNION` para cada coluna, a execução levou **9.64 segundos**, pois o SQLite reavalia a união de centenas de milhares de linhas repetidas vezes por linha afetada.
   - *Abordagem CTE com Pushdown (`UPDATE ... FROM`)*: Ao encapsular os atletas divergentes em uma CTE (`divergent_athletes`) e realizar a agregação unificada estritamente para esses IDs (`WHERE id_jogador = d.id_jogador`), o planejador do SQLite utiliza os índices líderes `idx_escalacoes_id_jogador`, `idx_gols_id_jogador` e `idx_cartoes_id_jogador`. O tempo de execução despencou para **0.0356 segundos (35.6 ms)** — uma aceleração de **>270 vezes**.
3. **Idempotência e Coerência Derivada**:
   A consulta foi desenhada para recalcular atomicamente tanto os gols reais quanto os jogos reais (censo `escalacoes UNION gols UNION cartoes`) e os campos derivados de assistências (`participacoes_gols` e `media_participacao_por_jogo`). Ao re-executar a consulta imediatamente, a CTE `divergent_athletes` retorna 0 linhas, a execução termina em 0.031s e nenhuma linha é alterada.

---

## 3. Ressalvas e Limitações (Caveats)

1. **Princípio Read-Only do Explorer**:
   Como este agente opera em modo Explorer (investigação e formulação estritamente read-only), os testes empíricos de execução e medição de desempenho foram conduzidos em bancos isolados em `/tmp/futebol_resync_test.db` e `/tmp/futebol_resync_test3.db`. O arquivo de produção `data/futebol.db` permaneceu intacto.
2. **Divisão de Responsabilidades com Outros Explorers**:
   - A resolução específica da falha de `test_t1_r1_db_no_forced_jogos_equals_gols_with_divergent_career` (atribuída a Serginho ID 12636 e Flaco López ID 67 com `total_jogos = total_gols`) é tratada em profundidade pelo agente **Explorer M1 Retry 2**.
   - A integração contínua do auto-reparo dentro do método `auditar_e_reparar_dados()` de `scripts/auditar_integridade_dados.py` (Regras 5 e 11) é tratada pelo agente **Explorer M1 Retry 3**.

---

## 4. Conclusão e Consulta SQL Homologada (Conclusion)

A consulta canônica definitiva formulada e homologada para ressincronizar com perfeição matemática os 25 atletas é a seguinte:

### Consulta SQL Canônica (Pushdown CTE UPDATE)
```sql
WITH divergent_athletes AS (
    SELECT j.id_jogador
    FROM jogadores_estatisticas j
    LEFT JOIN (
        SELECT id_jogador, COUNT(*) as cnt
        FROM gols
        WHERE id_jogador > 0
        GROUP BY id_jogador
    ) g ON j.id_jogador = g.id_jogador
    WHERE j.total_gols != COALESCE(g.cnt, 0)
),
stats_reais AS (
    SELECT 
        d.id_jogador,
        (SELECT COUNT(*) FROM gols g WHERE g.id_jogador = d.id_jogador) AS novos_gols,
        (
            SELECT COUNT(DISTINCT id_partida)
            FROM (
                SELECT id_partida FROM escalacoes WHERE id_jogador = d.id_jogador
                UNION
                SELECT id_partida FROM gols WHERE id_jogador = d.id_jogador
                UNION
                SELECT id_partida FROM cartoes WHERE id_jogador = d.id_jogador
            )
        ) AS novos_jogos
    FROM divergent_athletes d
)
UPDATE jogadores_estatisticas
SET total_gols = s.novos_gols,
    total_jogos = s.novos_jogos,
    media_gols_por_jogo = ROUND(CAST(s.novos_gols AS REAL) / MAX(s.novos_jogos, 1), 2),
    participacoes_gols = s.novos_gols + COALESCE(jogadores_estatisticas.total_assistencias, 0),
    media_participacao_por_jogo = ROUND(CAST((s.novos_gols + COALESCE(jogadores_estatisticas.total_assistencias, 0)) AS REAL) / MAX(s.novos_jogos, 1), 2)
FROM stats_reais s
WHERE jogadores_estatisticas.id_jogador = s.id_jogador;
```

### Métricas de Homologação:
- **Tempo de Execução**: `0.0356s` (35.6 ms).
- **Atletas Divergentes Antes**: 25.
- **Atletas Divergentes Depois**: 0 (100% sincronizados).
- **Idempotência**: Re-execução segura sem efeitos colaterais (0 alterações).
- **Tamanho do Arquivo SQLite**: Permanece em 88.60 MB, mantendo margem superior a 5.4 MB abaixo do teto de 94.0 MB da Vercel.

---

## 5. Método de Verificação Independente (Verification Method)

Qualquer agente ou desenvolvedor pode validar independentemente a eficácia e desempenho desta solução executando o script abaixo em terminal bash:

```bash
./.venv/bin/python3 -c "
import sqlite3
import shutil
import time

# 1. Clona banco para ambiente de teste isolado
shutil.copyfile('data/futebol.db', '/tmp/futebol_resync_verification.db')
conn = sqlite3.connect('/tmp/futebol_resync_verification.db')
c = conn.cursor()

# 2. Confirma contagem inicial de 25 atletas desincronizados
c.execute('''
    WITH gols_reais AS (
        SELECT id_jogador, count(*) as n FROM gols WHERE id_jogador > 0 GROUP BY id_jogador
    )
    SELECT count(*) FROM jogadores_estatisticas j 
    LEFT JOIN gols_reais g ON j.id_jogador = g.id_jogador
    WHERE j.total_gols != COALESCE(g.n, 0);
''')
antes = c.fetchone()[0]
assert antes == 25, f'Esperado 25 atletas desincronizados, encontrado {antes}'

# 3. Executa a query de sincronização
sql = '''
WITH divergent_athletes AS (
    SELECT j.id_jogador
    FROM jogadores_estatisticas j
    LEFT JOIN (
        SELECT id_jogador, COUNT(*) as cnt
        FROM gols
        WHERE id_jogador > 0
        GROUP BY id_jogador
    ) g ON j.id_jogador = g.id_jogador
    WHERE j.total_gols != COALESCE(g.cnt, 0)
),
stats_reais AS (
    SELECT 
        d.id_jogador,
        (SELECT COUNT(*) FROM gols g WHERE g.id_jogador = d.id_jogador) AS novos_gols,
        (
            SELECT COUNT(DISTINCT id_partida)
            FROM (
                SELECT id_partida FROM escalacoes WHERE id_jogador = d.id_jogador
                UNION
                SELECT id_partida FROM gols WHERE id_jogador = d.id_jogador
                UNION
                SELECT id_partida FROM cartoes WHERE id_jogador = d.id_jogador
            )
        ) AS novos_jogos
    FROM divergent_athletes d
)
UPDATE jogadores_estatisticas
SET total_gols = s.novos_gols,
    total_jogos = s.novos_jogos,
    media_gols_por_jogo = ROUND(CAST(s.novos_gols AS REAL) / MAX(s.novos_jogos, 1), 2),
    participacoes_gols = s.novos_gols + COALESCE(jogadores_estatisticas.total_assistencias, 0),
    media_participacao_por_jogo = ROUND(CAST((s.novos_gols + COALESCE(jogadores_estatisticas.total_assistencias, 0)) AS REAL) / MAX(s.novos_jogos, 1), 2)
FROM stats_reais s
WHERE jogadores_estatisticas.id_jogador = s.id_jogador;
'''

t0 = time.time()
c.execute(sql)
conn.commit()
duracao = time.time() - t0
print(f'UPDATE executado em {duracao:.4f}s')

# 4. Confirma contagem final de 0 atletas desincronizados
c.execute('''
    WITH gols_reais AS (
        SELECT id_jogador, count(*) as n FROM gols WHERE id_jogador > 0 GROUP BY id_jogador
    )
    SELECT count(*) FROM jogadores_estatisticas j 
    LEFT JOIN gols_reais g ON j.id_jogador = g.id_jogador
    WHERE j.total_gols != COALESCE(g.n, 0);
''')
depois = c.fetchone()[0]
assert depois == 0, f'Esperado 0 atletas desincronizados, encontrado {depois}'
print('Sucesso: Todos os 25 atletas perfeitamente sincronizados!')
conn.close()
"
```
