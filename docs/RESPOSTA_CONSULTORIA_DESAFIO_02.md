# FutStats — Resposta Técnica à Consultoria: Desafio 2 & Governança do Hot Model

**Data:** 04 de Novembro de 2026  
**Destinatário:** Consultoria Técnica Sênior / Perplexity AI  
**Remetente:** Equipe de Engenharia FutStats  
**Status da Base:** `data/futebol.db` em **83,19 MB** (Folga de **10,81 MB** para o teto de 94 MB da Vercel)  
**Cold Archive:** `data/futebol_cold.db.gz` (1,17 MB comprimido com 59.984 eventos históricos)

---

## 1. Veredito Executivo & Resultados do Desafio 1

A execução do arquivamento cirúrgico seguiu rigorosamente os preceitos de simplicidade e segurança relacional estabelecidos pela consultoria.

### Balanço Comparativo Pré e Pós-Arquivamento

| Indicador | Antes (Desafio 1) | Depois (Atual) | Variação / Delta | Status |
|---|---|---|---|---|
| **Tamanho do SQLite** | 90,15 MB | **83,19 MB** | **-6,96 MB (-7,7%)** | ✅ Saudável (Abaixo dos 88 MB) |
| **Folga para Teto Vercel (94 MB)** | 3,85 MB | **10,81 MB** | **+6,96 MB (+180%)** | ✅ Alívio Operacional Crítico |
| **Total de Partidas** | 115.753 | **115.753** | 0 (Preservação Total) | ✅ 100% Intacto |
| **Total de Gols** | 117.580 | **117.580** | 0 (Preservação Total) | ✅ 100% Intacto |
| **Escalações Quentes (2022–2026)** | 153.451 | **120.471** | -32.980 arquivadas | ✅ Foco no ciclo recente |
| **Cartões Quentes (2022–2026)** | 46.114 | **19.110** | -27.004 arquivados | ✅ Foco no ciclo recente |
| **Cold Archive (`futebol_cold.db.gz`)** | Inexistente | **1,17 MB** | 59.984 linhas salvas | ✅ Fora do bundle da Vercel |
| **Journal Mode** | DELETE | **DELETE** | Inalterado | ✅ Serverless Ready |
| **Testes de Regressão (`pytest`)** | 22/22 | **22/22** | 0 quebras | ✅ Dixon-Coles íntegro |
| **Auditor de Integridade (12 Regras)** | 12/12 | **12/12** | 0 violações relacionais | ✅ 100% Coerente |

---

## 2. Auditoria dos 31 Índices Secundários do SQLite

Conforme solicitado no Desafio 2, realizamos a varredura completa dos 31 índices secundários no `data/futebol.db` e correlacionamos com as rotas ativas da API (`backend/app.py` e `backend/rotas_expansao.py`):

### Mapeamento Detalhado por Tabela

| Tabela | Índice | Definição SQL | Query de Produção que Utiliza | Veredito de Engenharia |
|---|---|---|---|---|
| `partidas` | `idx_partidas_confronto` | `(mandante, visitante, ano)` | `/api/confronto-direto`, H2H | **Essencial** (Garante busca O(log n)) |
| `partidas` | `idx_partidas_camp_ano` | `(campeonato, ano)` | Filtros de tabela e campanhas históricas | **Essencial** |
| `partidas` | `idx_partidas_ano_data` | `(ano, data DESC)` | Ticker superior e últimas rodadas | **Essencial** |
| `partidas` | `idx_partidas_data_mandante` | `(data, mandante)` | Calendário e sequências de clube | Manter |
| `partidas` | `idx_partidas_data_visitante` | `(data, visitante)` | Calendário e sequências de clube | Manter |
| `partidas` | `idx_partidas_vencedor_ano` | `(vencedor, ano)` | Ranking de vitórias por temporada | Manter |
| `partidas` | `idx_partidas_arbitro` | `(arbitro)` | `/api/arbitros/estatisticas` | Manter |
| `partidas` | `idx_partidas_visitante` | `(visitante)` | Busca por visitante | Avaliar fusão |
| `partidas` | `idx_partidas_mes_dia` | `(substr(data, 6, 5))` | "Jogos neste dia na história" | Manter (Expressão específica) |
| `gols` | `idx_gols_atleta_clube` | `(atleta, clube)` | `/api/artilharia-historica` | **Essencial** |
| `gols` | `idx_gols_clube` | `(clube)` | Volume de gols por clube | Redundante com `idx_gols_atleta_clube` |
| `gols` | `idx_gols_id_jogador` | `(id_jogador)` | Cruzamento com catálogo OGol | **Essencial** |
| `gols` | `idx_gols_partida_minuto` | `(id_partida, minuto)` | Linha do tempo de partidas | Manter |
| `gols` | `idx_gols_partida_tempo` | `(id_partida, tempo)` | Gols no 1º vs 2º tempo | Manter |
| `escalacoes` | `idx_escalacoes_partida_clube` | `(id_partida, clube)` | `/api/escalacoes/<id_partida>` | **Essencial** |
| `escalacoes` | `idx_escalacoes_id_jogador` | `(id_jogador)` | Minutagem e jogos do atleta | **Essencial** |
| `cartoes` | `idx_cartoes_partida_cartao` | `(id_partida, cartao)` | Súmula e disciplina do jogo | **Essencial** |
| `cartoes` | `idx_cartoes_clube_cartao` | `(clube, cartao)` | Fair play e ranking de cartões | Manter |
| `cartoes` | `idx_cartoes_atleta` | `(atleta)` | Histórico disciplinar do atleta | Manter |
| `cartoes` | `idx_cartoes_id_jogador` | `(id_jogador)` | Cruzamento por ID de jogador | Manter |
| `odds_partidas` | `idx_odds_mandante` | `(odd_mandante)` | Nenhuma query usa range de float | ⚠️ **Candidato a Drop** (~0.4 MB) |
| `odds_partidas` | `idx_odds_visitante` | `(odd_visitante)` | Nenhuma query usa range de float | ⚠️ **Candidato a Drop** (~0.4 MB) |
| `jogadores_estatisticas` | `idx_jogadores_estatisticas_gols` | `(total_gols DESC)` | Ranking nacional de artilheiros | **Essencial** |
| `jogadores_estatisticas` | `idx_jogadores_estatisticas_nome` | `(nome_exibicao)` | Autosuggest de atletas | **Essencial** |
| `clubes_perfil` | `idx_clubes_perfil_nome` | `(nome)` | `/api/clubes/perfil-completo` | **Essencial** |
| `clubes_trofeus_vitrine` | `idx_trofeus_clube` | `(clube)` | `/api/clubes/trofeus` | **Essencial** |
| `arbitros_estatisticas_detalhadas` | `idx_arbitros_nome` | `(nome)` | Perfil do árbitro | **Essencial** |
| `campeonatos_estatisticas_equipes` | `idx_camp_equipes_clube` | `(clube)` | Tabela agregada por time | Manter |
| `estatisticas_atletas_temporada` | `idx_atleta_temp_clube` | `(clube)` | Elenco do clube na temporada | **Essencial** |
| `estatisticas_atletas_temporada` | `idx_atleta_temp_nome` | `(atleta)` | Raio-x do atleta por ano | **Essencial** |
| `historico_valor_mercado` | `idx_valor_mercado_atleta` | `(atleta)` | Gráfico de valor de mercado | **Essencial** |

### Diagnóstico dos Índices
1. **Oportunidade Imediata:** Os índices `idx_odds_mandante` e `idx_odds_visitante` indexam colunas de ponto flutuante. A API consulta odds estritamente por `WHERE id_partida = ?`. Esses dois índices consomem espaço sem gerar aceleração de leitura. O drop planejado libera cerca de **0,8 MB** adicionais.
2. **Índice Redundante:** `idx_gols_clube` pode ser absorvido por `idx_gols_atleta_clube` se reordenado ou mantido apenas se houver query sem filtro de atleta.

---

## 3. Telemetria de Governança Inicializada

Implementamos no SQLite a tabela de auditoria operacional `governanca_banco`, com o registro basal pós-Desafio 1:

```sql
CREATE TABLE IF NOT EXISTS governanca_banco (
    executado_em TEXT PRIMARY KEY,
    tamanho_mb REAL NOT NULL,
    partidas INTEGER NOT NULL,
    gols INTEGER NOT NULL,
    escalacoes INTEGER NOT NULL,
    cartoes INTEGER NOT NULL,
    odds INTEGER NOT NULL,
    acao_executada TEXT NOT NULL
);
```

### Registro Baseline Ativo
- **Data/Hora:** `2026-11-04 16:40:08`
- **Tamanho:** `83.19 MB`
- **Partidas:** `115.753`
- **Gols:** `117.580`
- **Escalações:** `120.471`
- **Cartões:** `19.110`
- **Odds:** `11.007`
- **Ação:** `BASELINE DESAFIO 1: Arquivamento de escalacoes e cartoes < 2022`

---

## 4. Contrato de Crescimento & Gate de 88 MB no Orquestrador 24x7

Configuramos o daemon diário (`scripts/orquestrador_mestre_24x7.py`) com as seguintes regras de proteção preventiva:

1. **Alerta Preventivo (Soft Limit = 88,0 MB):**
   - Dispara alerta no Telegram e notificação de log.
   - Bloqueia ingestões volumosas de logs brutos.
   - Agenda rotina de agregação materializada.
2. **Teto Inegociável (Hard Limit = 94,0 MB):**
   - Aborta imediatamente qualquer inserção no banco de produção.
   - Executa `VACUUM` de emergência.
   - Notifica a equipe com nível de severidade máxima (P0).
3. **Taxa de Crescimento Estimada (Hot Model 2026):**
   - Com a retenção de escalações e cartões restrita aos últimos 4 anos (2022–2026), o acréscimo médio por rodada do Brasileirão + Copa do Brasil é de apenas **~180 KB a 240 KB por mês**.
   - A folga de **10,81 MB** garante estabilidade para **mais de 36 meses de competições ativas** sem necessidade de novas intervenções destrutivas.

---

## 5. Respostas às 3 Perguntas Estratégicas Provocativas

### Pergunta 1: *"Por que manter 115.753 partidas se a dashboard foca na Série A recente?"*
**Resposta:**  
A proposta de valor do FutStats é ser a **enciclopédia estatística definitiva do futebol brasileiro** (concorrendo em profundidade com OGol e FBref), e não apenas um aplicativo descartável de apostas.
O modelo **Dixon-Coles** e as curvas de **confronto direto secular (H2H)** dependem da cadeia histórica contínua de placares desde 1902 para calcular o peso de mando de campo histórico e a tradição dos clássicos estaduais.
Além disso, `partidas` inteira (apenas placar, clubes, data e competição) consome menos de **18 MB** no SQLite. O peso estava nas tabelas analíticas de eventos granulares (`escalacoes` com 22 jogadores por jogo e `cartoes`), que já foram cirurgicamente arquivadas para datas anteriores a 2022.

### Pergunta 2: *"Qual é a política para `odds_partidas` (11.007 registros)?"*
**Resposta:**  
Adotaremos a estratégia de **Materialização de Fechamento**:
- Criar a tabela agregada `odds_partidas_resumo` contendo apenas `(id_partida, odd_abertura_mandante, odd_fechamento_mandante, odd_fechamento_empate, odd_fechamento_visitante, bookmaker_principal)`.
- Isso reduzirá o volume de dados de odds em mais de **60%**, permitindo arquivar as cotações detalhadas de mercados secundários (over/under, handicap asiático) para partidas anteriores a 2024.

### Pergunta 3: *"Por que não adotar compressão zstandard ou migrar para Turso/DuckDB agora?"*
**Resposta:**  
Pela regra da **Simplicidade Radical (Karpathy Guidelines)**.  
O FutStats roda em Vercel Serverless Function com tempo frio de inicialização (Cold Start) abaixo de 250ms. O SQLite nativo via driver C (`sqlite3` / `better-sqlite3`) abre o arquivo `.db` local diretamente em memória sem latência de rede (0 ms de overhead de round-trip).  
Uma migração prematura para Turso adicionaria dependência de rede distribuída, limites de conexões simultâneas e complexidade de autenticação, quando o banco local com **83,19 MB** já cumpre com folga o limite de 94 MB da Vercel.

---

## 6. Próximo Passo Sugerido para a Consultoria

Aguardamos o aval da consultoria técnica sênior para:
1. Executar o `DROP INDEX` dos índices ociosos de odds (`idx_odds_mandante` e `idx_odds_visitante`) para recuperar mais ~0,8 MB.
2. Definir o esquema da tabela materializada `odds_partidas_resumo`.
