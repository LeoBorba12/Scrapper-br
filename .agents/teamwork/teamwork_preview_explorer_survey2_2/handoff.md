# Relatório Técnico de Engenharia (Survey 2 - R2)
## Ingestor Massivo de Súmulas, Gols Históricos e Reconciliação Universal de Atletas

- **Autor**: `teamwork_preview_explorer_survey2_2` (Technical Explorer & Data Architect)
- **Data/Hora**: 2026-11-01T14:32:00Z
- **Escopo**: Investigação técnica detalhada do Requisito R2 do projeto FutStats (Desacoplamento e Ingestão Universal de Gols)
- **Modo**: Read-Only Investigation (Estritamente sem mutação de código-fonte de produção)

---

## 1. Observações Diretas e Evidências Empíricas

### 1.1 Esquema Físico e Estatísticas do Banco SQLite (`data/futebol.db`)

Inspeção via `sqlite3` e `PRAGMA table_info` / `dbstat`:
- **Tamanho Físico Atual**: 84,56 MB (88.667.648 bytes; 21.648 páginas de 4.096 bytes).
- **Teto Operacional Vercel**: 94,00 MB (98.566.144 bytes). **Headroom Local Disponível**: 9,44 MB (~9.900 KB).
- **Foreign Keys**: `PRAGMA foreign_keys = 0` (desativadas por padrão na conexão).

#### Inventário de Tabelas Principais:
| Tabela | Registros | Tamanho Tabela | Tamanho Índices | Principais Índices / Chaves |
|---|---|---|---|---|
| `partidas` | 115.625 | 17,81 MB | ~15,25 MB | `id_partida` (PK), `idx_partidas_confronto` (`mandante`, `visitante`, `ano`), `idx_partidas_ano_data` (`ano`, `data`), `idx_partidas_camp_ano` (`campeonato`, `ano`) |
| `gols` | 95.522 | 4,97 MB | 2,90 MB | `id_gol` (PK AUTO), `id_partida`, `id_jogador`, `idx_gols_id_jogador`, `idx_gols_atleta_clube` |
| `escalacoes` | 152.266 | 9,52 MB | 3,29 MB | `id_escalacao` (PK AUTO), `id_partida`, `id_jogador`, `idx_escalacoes_id_jogador`, `idx_escalacoes_partida_clube` |
| `jogadores_estatisticas` | 19.790 | 4,06 MB | 0,35 MB | `id_jogador` (PK), `idx_jogadores_estatisticas_nome`, `idx_jogadores_estatisticas_gols` |
| `jogadores` | 3.639 | 0,38 MB | 0,08 MB | `id_jogador` (PK AUTO), `ogol_id` (UNIQUE) |
| `cartoes` | 38.605 | 2,12 MB | 0,95 MB | `id_cartao` (PK AUTO), `id_partida`, `id_jogador` |
| `odds_partidas` | 10.919 | 1,85 MB | 0,22 MB | `id_partida` (PK) |
| `atleta_sofascore_ratings` | 2.427 | 0,42 MB | 0,05 MB | `id_jogador` (PK) |
| `artilharia_historica` | 38 | 0,01 MB | 0,00 MB | `id` (PK) |

*Nota estrutural*: Não existem tabelas normalizadas separadas `clubes` ou `torneios`. Os nomes de clubes e competições são armazenados como texto diretamente em colunas (`partidas.mandante`, `partidas.visitante`, `partidas.campeonato`, `gols.clube`, `escalacoes.clube`).

#### Pegada de Armazenamento por Linha (Footprint Métrico):
- `gols`: ~82 bytes/linha (dados + índices).
- `escalacoes`: ~84 bytes/linha (dados + índices).
- `partidas`: ~285 bytes/linha (dados + índices).

---

### 1.2 Quantificação Rigorosa das 69.777 Partidas Históricas Pendentes

Consulta de balanço geral executada no banco:
```sql
SELECT 
    COUNT(*) AS total_partidas,
    SUM(CASE WHEN (gols_mandante + gols_visitante) > 0 THEN 1 ELSE 0 END) AS com_placar_positivo,
    SUM(CASE WHEN (gols_mandante + gols_visitante) = 0 THEN 1 ELSE 0 END) AS zero_a_zero,
    SUM(CASE WHEN gols_mandante IS NULL OR gols_visitante IS NULL THEN 1 ELSE 0 END) AS placar_nulo,
    (SELECT COUNT(DISTINCT id_partida) FROM gols) AS partidas_com_gols_detalhados,
    SUM(CASE WHEN (gols_mandante + gols_visitante) > 0 
             AND NOT EXISTS (SELECT 1 FROM gols g WHERE g.id_partida = p.id_partida) 
        THEN 1 ELSE 0 END) AS pendentes_com_gols,
    SUM(CASE WHEN NOT EXISTS (SELECT 1 FROM gols g WHERE g.id_partida = p.id_partida) 
        THEN 1 ELSE 0 END) AS total_sem_nenhum_gol_detalhado
FROM partidas p;
```
**Resultado Verificado**:
- **Total de Partidas no Banco**: 115.625
- **Partidas com Placar > 0**: 104.824
- **Partidas 0x0**: 10.795
- **Partidas com Placar Nulo**: 6
- **Partidas com Gols Catalogados na tabela `gols`**: 35.294
- **Partidas com Gols no Placar mas SEM Registro na tabela `gols`**: **EXATAMENTE 69.777 partidas!**
- **Partidas sem nenhum gol detalhado (incluindo 0x0)**: 80.331 partidas.
- **Volume Total de Gols Faltantes nas 69.777 partidas**: **207.658 gols**.

#### Distribuição das 69.777 Partidas Pendentes por Eras Históricas:
1. **Pré-1971 (Era Pré-Brasileirão / Taça Brasil / Torneio Rio-SP)**: 11.990 partidas pendentes | **45.880 gols faltantes**
2. **1971–2002 (Brasileirão Fase Mata-Mata / Copas Tradicionais)**: 27.512 partidas pendentes | **75.961 gols faltantes**
3. **2003–2013 (Pontos Corridos - Década Inicial)**: 16.672 partidas pendentes | **50.333 gols faltantes**
4. **2014–2023 (Pontos Corridos - Era Contemporânea)**: 11.241 partidas pendentes | **29.283 gols faltantes**
5. **2024–Presente (Ciclo Recente / Atual)**: 2.362 partidas pendentes | **6.201 gols faltantes**

#### Top 15 Competições com Partidas Pendentes de Gols:
| Campeonato no Acervo | Partidas Pendentes | Gols Faltantes |
|---|---|---|
| Campeonato Brasileiro Série B | 8.233 | 22.807 |
| Brasileirão Série A | 7.014 | 19.213 |
| Brasileirão Série B | 6.511 | 17.537 |
| Copa do Brasil | 4.752 | 13.512 |
| Campeonato Carioca | 4.638 | 13.006 |
| Copa Libertadores | 4.163 | 11.837 |
| Campeonato Paulista | 2.309 | 6.252 |
| Campeonato Brasileiro Série A | 2.246 | 6.529 |
| Copa Sul-Americana | 2.029 | 5.534 |
| Campeonato Gaúcho | 1.652 | 4.941 |
| Campeonato Paranaense | 1.613 | 4.874 |
| Copa do Nordeste | 1.450 | 4.125 |
| Torneio Rio-São Paulo | 937 | 3.597 |
| Campeonato Mineiro | 836 | 2.611 |
| Torneio Roberto Gomes Pedrosa | 485 | 1.369 |

---

### 1.3 Origem Arquitetural das 69.777 Lacunas e Descoberta de IDs Artificiais

Ao analisar a distribuição da chave primária `id_partida`:
- `id_partida < 100.000` (IDs sequenciais 1 a 8.785): 8.785 partidas. **83,3% possuem gols**.
- `id_partida` entre 19.500.000 e 20.260.003 (padrão YYYY + seq): 35.746 partidas. **52,7% possuem gols**.
- `id_partida >= 100.000.000` (padrão 197120001 até 202533231): **71.094 partidas**. Apenas 9.136 têm gols (**87,1% NÃO POSSUEM GOLS**).

**Achado Crítico**: 61.958 das 69.777 partidas sem gols pertencem a essa faixa `>= 100.000.000`. 
Elas foram criadas pelo script `scripts/scraper_ranking_historico.py`, que importou os cabeçalhos das partidas extraídas do bundle JavaScript do site `rankinghistorico.com.br` (`data/cache_rankinghistorico/jogos1..5.js`). Como o Ranking Histórico publica apenas placares consolidados e metadados de estádio/cidade, os registros foram inseridos em `partidas` sem gerar nenhum registro em `gols` ou `escalacoes`.

---

### 1.4 Quase-Duplicatas e Conflito de Nomenclatura de Campeonatos

A auditoria identificou **3.710 confrontos quase-duplicados** no banco (mesmo mandante, mesmo visitante, mesmo ano, e diferença de data $\le 3$ dias):
- 1.451 confrontos duplicados entre `Campeonato Brasileiro Série A` (ID antigo < 100k) e `Brasileirão Série A` (ID novo >= 100M).
  *Exemplo real observado*:
  * Partida `455`: 2003-10-23, Juventude 1 x 2 Grêmio, Campeonato Brasileiro Série A. **Possui 3 gols e 3 escalações**.
  * Partida `202518124`: 2003-10-24, Juventude 1 x 2 Grêmio, Brasileirão Série A. **Possui 0 gols e 0 escalações**.
- 458 confrontos duplicados na `Copa do Brasil`.
- 349 confrontos duplicados na `Série B`.

---

### 1.5 Falha Sistêmica em Scrapers Legados: Match de Clubes por Prefixo de 5 Letras

No script `scripts/scraper_ogol_brasileirao.py` (linha 467):
```python
AND (mandante LIKE ? AND visitante LIKE ?)
params: f"%{home[:5]}%", f"%{away[:5]}%"
```
Essa busca por prefixo truncado de 5 caracteres (`"Atlét"`) gerou contaminação relacional severa no passado:
- `"Atlético-GO"[:5]` gerou match com `"Atlético-PR"`!
- Partida `3088` (Atlético-GO 0 x 0 Grêmio em 2010-05-08) teve inseridos 2 gols alienígenas: Maikon Leite (36' 1T, Atlético-PR) e Vilson (60' 2T, Grêmio)!
- A consulta geral revelou **1.927 gols no banco onde `g.clube != p.mandante AND g.clube != p.visitante`**, causados por conflitos entre Flamengo e Flamengo-PI, Grêmio e Grêmio Maringá, Botafogo e Botafogo-SP.

---

### 1.6 O Tesouro Encontrado: 6.225 Fichas e 16.535 Gols Pré-Cacheados Localmente

Na pasta `data/cache_ogol_brasileirao/`:
- Existem **6.225 arquivos JSON** individuais já baixados e estruturados (`jogo_*.json`).
- Contêm **16.535 gols catalogados** com autor, minuto, tempo (1T/2T) e tipo (`Normal`, `Pênalti`, `Falta`, `Gol Contra`).
- Teste de reconciliação em amostra: **99,8% de taxa de match** contra o banco quando utilizado o índice `idx_partidas_confronto` (`ano`, `mandante`, `visitante`).
- **Aproximadamente 965 partidas que hoje estão zeradas no banco podem ser preenchidas imediatamente com mais de 2.200 gols sem realizar uma única requisição HTTP externa!**

---

### 1.7 Causa-Raiz das Médias Artificiais de 1.00 Gol/Jogo

Nas rotinas de saneamento anteriores (`scripts/unificar_e_reconstruir_craques.py:46`, `scripts/sanear_dados_atletas_e_estatisticas.py:273` e `scripts/sanitizar_dashboard_e_atletas.py:285`):
```python
total_jogos = max(total_jogos_esc, total_gols)
media_gols_por_jogo = ROUND(CAST(total_gols AS REAL) / MAX(total_jogos, 1), 2)
```
Como as súmulas antigas continham apenas os autores dos gols e não as escalações completas de 11 atletas:
1. Um atleta que marcou 150 gols em 120 partidas não tinha nenhuma presença registrada nas outras 300 partidas em que jogou mas não marcou.
2. Seu `total_jogos` no acervo era calculado como 120 (jogos com gol).
3. A regra `max(total_jogos, total_gols)` forçava `total_jogos = 150`.
4. Resultado: 150 gols em 150 jogos = **média 1.00**.

**Impacto Atual no Banco**:
- **9.091 atletas** possuem exatamente `total_jogos = total_gols` (média 1.00).
- **1.582 atletas** possuem `total_gols > total_jogos` (média > 1.00, como Luís Fabiano 1.06, Zico 1.35, Romário 1.38, Edmundo 1.39).
- **2.688 atletas** com 5 ou mais gols possuem média $\ge 1.00$.

#### Status dos Craques Auditados:
| Atleta | ID | Gols no DB (Total) | Gols Série A no DB | Escalações Série A no DB | Média Local Atual | Carreira Oficial |
|---|---|---|---|---|---|---|
| **Roberto Dinamite** | 11967 | 174 | 174 (133 j c/ gol) | **0** | 1,31 | 512 g / 860 j (0,60) |
| **Fred** | 6051 | 213 | 149 (128 j c/ gol) | 129 | 0,94 | 413 g / 822 j (0,50) |
| **Romário** | 12212 | 150 | 117 (87 j c/ gol) | 68 | 1,38 | 744 g / 961 j (0,77) |
| **Edmundo** | 5168 | 204 | 120 (91 j c/ gol) | 50 | 1,39 | 360 g / 744 j (0,48) |
| **Zico** | 13953 | 132 | 120 (92 j c/ gol) | **0** | 1,35 | 530 g / 777 j (0,68) |
| **Neymar Jr** | 352 | 133 | 47 (38 j c/ gol) | 39 | 1,06 | 439 g / 719 j (0,61) |
| **Luís Fabiano** | 9033 | 168 | 101 (89 j c/ gol) | 103 | 1,06 | 403 g / 755 j (0,53) |

---

## 2. Cadeia Lógica (Logic Chain)

```
[Observação 1.1: data/futebol.db tem 84.56 MB; Vercel tem teto de 94 MB; headroom é 9.44 MB]
   +
[Observação 1.2: 69.777 partidas pendentes somam 207.658 gols e ~2.000.000 escalações (~185 MB)]
   │
   ▼
[Incompatibilidade Física Local]: Não é matematicamente possível gravar todas as 69.777 súmulas completas
no SQLite local sem estourar o limite de 94 MB da Vercel.
   │
   ▼
[Validação Arquitetural de R1 & R2]:
O projeto DEVE operar em arquitetura desacoplada de Dois Níveis (Two-Tier Data Strategy):
   * Nível 1 (Acervo Mestre Remoto / data/futebol_acervo.db / API Gateway): Ingestão exaustiva de todas as
     69.777 partidas, 207.658 gols e súmulas completas, sem restrição de tamanho.
   * Nível 2 (SQLite Local Vercel): Enriquecimento prioritário das edições dos pontos corridos (2003-2026)
     e Copa do Brasil, adicionando 10.000 a 15.000 gols cirúrgicos (elevando o acervo acima de 95.522 para ~110.000 gols)
     e mantendo o banco rigorosamente em ~89-91 MB após VACUUM.
   │
   ▼
[Observação 1.6: 6.225 partidas já cacheadas com 16.535 gols em data/cache_ogol_brasileirao/]
   +
[Observação 1.4: 3.710 quase-duplicatas por jitter de datas e nomes de campeonatos divergentes]
   │
   ▼
[Estratégia de Ingestão de Alta Velocidade]:
1. Executar primeiro a fase "Zero Network / Cache Harvest", populando de imediato ~2.200 gols das partidas pendentes.
2. Resolver as quase-duplicatas através de Canonical Match Consolidation antes de injetar novos gols.
3. Utilizar o indexador composto `idx_partidas_confronto` (`ano`, `mandante`, `visitante`) com normalização
   canônica de clubes, eliminando o matching por substring de 5 letras.
   │
   ▼
[Observação 1.7: 9.091 atletas com média artificial 1.00 decorrente de presenças registradas apenas nos gols]
   │
   ▼
[Reconciliação Dual Honesta]:
1. Em `jogadores_estatisticas`, desvincular `total_jogos` de `total_gols`. Manter `total_jogos` refletindo
   o número real de presenças catalogadas na base local.
2. Ingerir as escalações (titulares e reservas que entraram) de todas as partidas da Série A e Copa do Brasil,
   multiplicando as presenças dos atletas para diluir as médias para patamares realistas (0,30 a 0,65).
3. Para atletas com histórico local ainda incompleto, expor no frontend e nas APIs o rótulo transparente
   `"Jogos c/ Gol"` ou priorizar a exibição de `media_oficial_carreira` calculada via `jogos_carreira_oficiais`.
```

---

## 3. Limitações e Ressalvas (Caveats)

1. **Proteção contra Bloqueio Cloudflare e Rate-Limits em Scrapers Vivos**:
   O OGol aplica bloqueio HTTP 429 para taxas superiores a 2 req/s sem intervalo. Requisições em lote para anos não cacheados devem usar `time.sleep(0.4)`, rotação de `User-Agent` e persistência idempotente em disco (`data/cache_ogol_partidas/`).
2. **Critério de Gol Contra e Desvios Históricos**:
   Em súmulas das décadas de 1970 a 1990, desvios eram frequentemente atribuídos ao atacante pelo árbitro e pela imprensa da época, divergindo de critérios modernos de gol contra. A ingestão deve preservar o registro oficial da súmula federativa/RSSSF.
3. **Restrição Mandatória do SQLite Local**:
   Qualquer lote de ingestão no banco local `data/futebol.db` deve obrigatoriamente executar `VACUUM` preventivo e verificar `os.path.getsize() <= 93.5 * 1024 * 1024` antes de commitar, sob pena de quebra de deploy no pipeline da Vercel.
4. **Isolamento de Testes de Regressão**:
   A tabela `partidas` é consultada pelo motor preditivo Dixon-Coles (`backend/app.py`). Alterações nas colunas de placar de partidas já existentes não devem quebrar os 22 testes de regressão em `tests/test_model_evals.py`.

---

## 4. Conclusões e Recomendações Estruturais

1. **Meta de Gols (> 95.522)**:
   A meta de ultrapassar 95.522 gols catalogados detalhados é imediatamente viável. Apenas o processamento do cache existente em `data/cache_ogol_brasileirao/` já pode elevar o total para ~98.000 gols, e a ingestão completa da Série A (2003-2026) e Copa do Brasil elevará o acervo para mais de **110.000 gols** no banco local e mais de **122.000 gols** no acervo mestre.
2. **Arquitetura de Pipeline de Ingestão em 4 Fases**:
   - **Fase A (Colheita de Cache Local)**: Script `scripts/ingerir_cache_ogol_existente.py` para processar os 6.225 arquivos já salvos.
   - **Fase B (Consolidação de Duplicatas)**: Deduplicar os 1.451 pares da Série A e 458 da Copa do Brasil, unificando os IDs.
   - **Fase C (Ingestão de Súmulas e Escalações 2003–2026)**: Script `scripts/ingestor_sumulas_massivo_ogol.py` cobrindo titulares, reservas, minutos e tipo de gol.
   - **Fase D (Reconciliação e Re-indexação de Carreira)**: Script `scripts/reconciliar_carreira_universal.py` recalculando presenças, eliminando o clamping `max(jogos, gols)` e persistindo `jogos_carreira_oficiais`.
3. **Blindagem contra Falhas de Integridade**:
   Manter a obrigatoriedade da aprovação das 12 regras do `auditar_integridade_dados.py` ao término de cada fase.

---

## 5. Método de Verificação Independente

Para auditar e verificar as conclusões deste relatório, execute os seguintes comandos no terminal a partir da raiz do projeto:

1. **Verificação de Regressão Preditiva (22/22 testes)**:
   ```bash
   .venv/bin/pytest tests/test_model_evals.py
   ```
   *Condição de aprovação*: 22 passed em < 1s.

2. **Verificação das 12 Regras de Integridade Relacional**:
   ```bash
   python3 scripts/auditar_integridade_dados.py
   ```
   *Condição de aprovação*: 12/12 regras "OK", 0 inconsistências encontradas.

3. **Verificação do Teto Operacional Vercel**:
   ```bash
   ls -lh data/futebol.db
   ```
   *Condição de aprovação*: Tamanho rigorosamente < 94 MB (atualmente 85 MB).

4. **Verificação da Contagem Exata das 69.777 Partidas Pendentes**:
   ```bash
   python3 -c "
   import sqlite3
   c = sqlite3.connect('data/futebol.db').cursor()
   c.execute('SELECT COUNT(*) FROM partidas p WHERE (p.gols_mandante + p.gols_visitante) > 0 AND NOT EXISTS (SELECT 1 FROM gols g WHERE g.id_partida = p.id_partida);')
   print('Partidas pendentes:', c.fetchone()[0])
   "
   ```
   *Condição de aprovação*: Exibe exatamente `69777`.

5. **Verificação dos 6.225 Arquivos e 16.535 Gols no Cache Local**:
   ```bash
   python3 -c "
   import os, json, glob
   files = glob.glob('data/cache_ogol_brasileirao/jogo_*.json')
   gols = sum(len(json.load(open(f, encoding='utf-8')).get('gols', [])) for f in files)
   print(f'Arquivos: {len(files)} | Gols cacheados: {gols}')
   "
   ```
   *Condição de aprovação*: Exibe `Arquivos: 6225 | Gols cacheados: 16535`.

6. **Verificação de Compilação do Frontend**:
   ```bash
   cd frontend && npm run build
   ```
   *Condição de aprovação*: Código de saída 0, build Vite gerado em `dist/`.
