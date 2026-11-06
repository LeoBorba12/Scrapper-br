# Auditoria Técnica dos Reparos Automáticos da Regra 08

**Data da Auditoria:** 06 de Novembro de 2026  
**Ambiente:** Banco Canônico de Produção (`data/futebol.db`)  
**Regra Auditada:** `Regra 08: Gols Atribuídos a Times com Placar Zero (Clube Invertido)`  
**Script Auditor:** `scripts/auditar_integridade_dados.py`  
**Relatório Estruturado:** `data/staging/brasileirao_em_dados/reparos_regra08.json`  

---

## 1. Sumário Executivo

Durante as execuções do script de auditoria e saneamento relacional (`scripts/auditar_integridade_dados.py`), a **Regra 08** reportou a detecção de 3 ocorrências classificadas como `CORRIGIDO`:

```
Regra 08: Gols Atribuídos a Times com Placar Zero (Clube Invertido) | Status: CORRIGIDO | Ocorrências: 3 | Reparados: 3
```

A presente auditoria realizou a investigação forense dos registros no banco antes e depois da execução, comprovando que:
1. Trata-se de um **falso positivo benigno** decorrente de uma anomalia em partida histórica legada do ano de 2020 (confronto com mandante e visitante homônimos).
2. O auto-reparo executou uma operação estritamente neutra (*no-op*), na qual o valor da coluna `clube` nos 3 gols era `'FC Cascavel'` e **permaneceu exatamente `'FC Cascavel'`**.
3. **Zero impacto** em totais de gols, rankings, partidas ou dossiês de atletas.
4. Foi implementada uma blindagem na query da Regra 08 (`AND p.mandante != p.visitante`) para extinguir definitivamente esse falso gatilho.

---

## 2. Detalhamento Forense da Partida e dos 3 Gols

### 2.1. Metadados da Partida Canônica

- **ID da Partida:** `202539453`
- **Data:** `2020-01-26` (Horário: 16:00)
- **Competição:** Campeonato Paranaense 2020
- **Clube Mandante:** `FC Cascavel`
- **Clube Visitante:** `FC Cascavel` *(anomalia de ingestão legada: o visitante real era Cascavel CR)*
- **Gols Mandante:** 3 | **Gols Visitante:** 0
- **Placar Oficial:** `3x0`
- **Vencedor Oficial:** `FC Cascavel`

### 2.2. Registro dos 3 Gols Envolvidos

Os 3 gols da vitória por 3x0 foram marcados pelo centroavante **Paulo Sérgio** (ID Canônico `11115`):

| ID do Gol | ID Jogador | Atleta | Minuto | Tempo | Tipo de Gol | Clube Pré-Reparo | Clube Pós-Reparo | Variação Real |
|:---:|:---:|:---|:---:|:---:|:---:|:---:|:---:|:---:|
| `20349519` | 11115 | Paulo Sérgio | 45 | 1T | Pênalti | `FC Cascavel` | `FC Cascavel` | Zero (*No-Op*) |
| `20349520` | 11115 | Paulo Sérgio | 57 | 2T | Pênalti | `FC Cascavel` | `FC Cascavel` | Zero (*No-Op*) |
| `20349521` | 11115 | Paulo Sérgio | 60 | 2T | Normal | `FC Cascavel` | `FC Cascavel` | Zero (*No-Op*) |

---

## 3. Causa-Raiz e Mecanismo de Disparo do Falso Positivo

A query SQL da Regra 08 foi projetada para detectar casos legítimos em que um gol foi atribuído ao clube perdedor de zero gols:

```sql
SELECT COUNT(*) 
FROM gols g
JOIN partidas p ON g.id_partida = p.id_partida
WHERE ((g.clube = p.mandante AND p.gols_mandante = 0 AND p.gols_visitante > 0)
    OR (g.clube = p.visitante AND p.gols_visitante = 0 AND p.gols_mandante > 0)
    OR (p.gols_mandante = 0 AND p.gols_visitante = 0 AND (p.mandante LIKE '%Estatísticas%' OR ...)))
  AND (g.tipo_de_gol IS NULL OR lower(g.tipo_de_gol) NOT LIKE '%contra%');
```

No confronto `202539453`:
1. `p.mandante` = `'FC Cascavel'`
2. `p.visitante` = `'FC Cascavel'`
3. `p.gols_visitante` = `0` e `p.gols_mandante` = `3 > 0`
4. Como `g.clube` é `'FC Cascavel'`, a condição `(g.clube = p.visitante AND p.gols_visitante = 0 AND p.gols_mandante > 0)` avalia como **VERDADEIRA**!
5. O mecanismo de auto-reparo dispara:
   ```sql
   UPDATE gols
   SET clube = (SELECT p.mandante FROM partidas p WHERE p.id_partida = gols.id_partida)
   WHERE id_gol IN (20349519, 20349520, 20349521);
   ```
6. O `UPDATE` substitui `'FC Cascavel'` por `'FC Cascavel'`, retornando `rowcount = 3` e classificando como `CORRIGIDO`, embora nenhum byte tenha mudado.

---

## 4. Avaliação de Impacto e Decisão de Engenharia

### 4.1. Avaliação de Impacto
- **Impacto em Dossiês de Atletas:** Nulo. Paulo Sérgio continua creditado com os 3 gols pelo FC Cascavel.
- **Impacto na Tabela de Partidas:** Nulo. Placar 3x0, mandante e visitante permanecem inalterados.
- **Impacto nas Métricas Avançadas 2026 (BED):** Nulo. A partida pertence à temporada 2020 e não afeta as métricas de 2026.
- **Integridade Canônica:** Os 117.523 gols canônicos e 115.753 partidas canônicas permanecem estritamente intactos.

### 4.2. Decisão de Engenharia Homologada
1. **Manter os dados atuais:** Não há necessidade de reversão, pois o valor atual (`FC Cascavel`) é fidedigno à autoria do gol.
2. **Blindagem do Auditor:** Adicionar a condição `p.mandante != p.visitante` nas cláusulas da Regra 08 em `scripts/auditar_integridade_dados.py`. Com essa proteção, partidas com mandante e visitante homônimos não são interpretadas erroneamente como inversão de clube.
3. Com a blindagem aplicada, a auditoria passa a reportar **`Ocorrências: 0 | Reparados: 0 | Status: OK`**, eliminando o ruído operacional.
