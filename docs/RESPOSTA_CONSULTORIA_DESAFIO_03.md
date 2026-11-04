# FutStats — Resposta Técnica à Consultoria: Desafio 3 & Materialização Canônica de Odds

**Data:** 04 de Novembro de 2026  
**Destinatário:** Consultoria Técnica Sênior / Perplexity AI  
**Remetente:** Equipe de Engenharia FutStats  
**Status do Banco:** `data/futebol.db` em **85,13 MB** (Folga de **8,87 MB** para o teto de 94 MB da Vercel)  
**Cobertura de Odds Materializadas:** **100%** (15.955 registros em `odds_partidas_resumo` para 11.007 partidas; `faltantes = 0`)

---

## 1. Veredito Executivo do Desafio 3

Todas as recomendações e critérios de aceite do Desafio 3 foram executados e validados em ambiente de produção:

1. **Validação e Remoção de Índices Ociosos:**
   - O `EXPLAIN QUERY PLAN` confirmou que as rotas de produção (`backend/app.py`) consultam odds estritamente via `JOIN ... ON p.id_partida = o.id_partida` (acesso por Primary Key O(1)). Nenhuma rota aplica `WHERE odd_mandante BETWEEN ...`.
   - Executado `DROP INDEX IF EXISTS idx_odds_mandante;` e `DROP INDEX IF EXISTS idx_odds_visitante;`.
2. **Criação da Tabela Normalizada `odds_partidas_resumo`:**
   - Criada com chave primária composta `(partida_id, bookmaker_id)` referenciando `partidas(id_partida)`.
   - Índice de cobertura criado: `idx_odds_resumo_partida_mercado ON odds_partidas_resumo (partida_id, mercado_principal)`.
3. **Criação da View Canônica `vw_odds_fechamento_principal`:**
   - Disponibilizada para consumo direto da API filtrando deterministicamente `WHERE mercado_principal = 1`.
4. **Migração e Cobertura Idempotente:**
   - Total de registros inseridos: **15.955 linhas**.
   - Verificação de cobertura: `SELECT COUNT(*) FROM odds_partidas WHERE id_partida NOT IN (SELECT partida_id FROM odds_partidas_resumo);` retornou **0**. Cobertura absoluta de 100%.
5. **Governança & Compactação:**
   - `VACUUM` executado com `PRAGMA journal_mode = DELETE`.
   - Telemetria devidamente registrada na tabela `governanca_banco`.

---

## 2. Estrutura Canônica Implementada

### DDL da Tabela Materializada
```sql
CREATE TABLE IF NOT EXISTS odds_partidas_resumo (
    partida_id INTEGER NOT NULL,
    bookmaker_id INTEGER NOT NULL,
    bookmaker_nome TEXT NOT NULL,

    casa_abertura REAL,
    empate_abertura REAL,
    fora_abertura REAL,

    casa_fechamento REAL,
    empate_fechamento REAL,
    fora_fechamento REAL,

    fechamento_coletado_em TEXT,
    mercado_principal INTEGER NOT NULL DEFAULT 0,

    atualizado_em TEXT NOT NULL,

    PRIMARY KEY (partida_id, bookmaker_id),
    FOREIGN KEY (partida_id) REFERENCES partidas(id_partida)
);

CREATE INDEX IF NOT EXISTS idx_odds_resumo_partida_mercado
ON odds_partidas_resumo (partida_id, mercado_principal);
```

### DDL da View Canônica de Fechamento Principal
```sql
CREATE VIEW IF NOT EXISTS vw_odds_fechamento_principal AS
SELECT
    partida_id,
    bookmaker_id,
    bookmaker_nome,
    casa_abertura,
    empate_abertura,
    fora_abertura,
    casa_fechamento,
    empate_fechamento,
    fora_fechamento,
    fechamento_coletado_em
FROM odds_partidas_resumo
WHERE mercado_principal = 1;
```

---

## 3. Matriz Determinística de Bookmakers

Para evitar escolhas dinâmicas não auditáveis, estabelecemos o seguinte catálogo determinístico:

| `bookmaker_id` | `bookmaker_nome` | Papel no FutStats | `mercado_principal` | Cobertura Atual |
|---|---|---|---|---|
| **1** | **Consenso de Mercado** | Média de fechamento ponderada do mercado nacional | **1 (Canônico)** | 11.007 partidas (100%) |
| **2** | **Pinnacle Sharp** | Referência mundial de menor margem implícita e eficiência | 0 | 4.812 partidas |
| **3** | **Bet365 Varejo** | Referência de maior liquidez e volume no futebol brasileiro | 0 | 136 partidas |

A view `vw_odds_fechamento_principal` entrega o **Consenso de Mercado (ID 1)** de forma padronizada, garantindo que o modelo Dixon-Coles e a dashboard leiam dados estáveis e imunes a oscilações de uma única casa.

---

## 4. Registro de Governança (`governanca_banco`)

A telemetria auditável registrou o marco do Desafio 3:

| Campo | Valor Basal |
|---|---|
| **Data/Hora** | `2026-11-04 16:47:40` |
| **Tamanho do SQLite** | `85.13 MB` (abaixo dos 88 MB) |
| **Folga para Teto Vercel** | `8.87 MB` |
| **Partidas Preservadas** | `115.753` |
| **Gols Preservados** | `117.580` |
| **Escalações Quentes** | `120.471` |
| **Cartões Quentes** | `19.110` |
| **Odds em Produção** | `11.007` |
| **Ação Executada** | `DESAFIO 3: DROP idx_odds + Criacao odds_partidas_resumo (15955 linhas)` |

---

## 5. Respostas às 3 Perguntas Estratégicas da Consultoria

### Pergunta 1: *"Qual bookmaker define o fechamento principal do FutStats?"*
**Resposta:**  
Adotamos o **Consenso de Mercado (Bookmaker ID 1)** como fonte canônica (`mercado_principal = 1`), calculado pela média das cotações de fechamento das casas de alta liquidez.  
Como fonte de controle e benchmark sharp, armazenamos a **Pinnacle (Bookmaker ID 2)**, que possui a menor margem teórica (< 2.5%), permitindo auditar o valor esperado (+EV) contra o fechamento sharp sem depender exclusivamente da API da Pinnacle em tempo real.

### Pergunta 2: *"O produto quer preservar a movimentação da linha ou apenas o snapshot final?"*
**Resposta:**  
Apenas o par **Abertura vs. Fechamento Final**.  
Do ponto de vista analítico, o FutStats precisa apenas comparar a odd inicial e a odd final para medir o **CLV (Closing Line Value)** e a eficiência do mercado. Armazenar a série temporal completa de variações intraday (ticks de odds minuto a minuto) consumiria dezenas de megabytes sem agregar valor para 99% dos usuários da dashboard. Qualquer dado de tick intermediário de scraping ao vivo é descartado após o encerramento da partida.

### Pergunta 3: *"Qual ingestão exatamente será bloqueada quando o banco atingir 88 MB?"*
**Resposta:**  
O orquestrador diário (`scripts/orquestrador_mestre_24x7.py`) aplicará as seguintes travas graduais:
1. **Ao atingir 86 MB:** Suspensão imediata de scrapers de mercados secundários (handicap asiático e escanteios de divisões inferiores como Série C/D e Sub-20).
2. **Ao atingir 88 MB:** Bloqueio total da ingestão de scouts de lance a lance e acionamento da rotina de arquivamento frio planejado para partidas e eventos de temporadas antigas.
3. **Ao atingir 92 MB:** Modo de sobrevivência — apenas placar final, gols e status da partida da Série A/B são permitidos; todo o restante é temporariamente roteado para log externo sem gravação no SQLite.

---

## 6. Suíte de Validação Completa

Todas as suítes de validação obrigatórias foram executadas após o Desafio 3:
- **WCAG 2.2 AA Design Tokens:** 20/20 pares aprovados.
- **Integridade Relacional (12 Regras):** 115.753 partidas auditadas, 0 inconsistências.
- **Model Evals (Dixon-Coles & Odds):** 22/22 testes passando.
- **Teto Vercel:** 85.13 MB <= 94.00 MB (Aprovado).
- **Journal Mode:** `PRAGMA journal_mode = DELETE` rigorosamente mantido.
