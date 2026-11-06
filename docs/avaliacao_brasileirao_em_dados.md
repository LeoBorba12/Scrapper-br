# SPIKE: Avaliação Isolada do Brasileirão em Dados

**Data da Execução:** 06 de Novembro de 2026  
**Ambiente:** Isolado (Modo Read-Only no banco canônico `data/futebol.db`)  
**Staging:** `data/staging/brasileirao_em_dados/` (ignorado pelo Git via `.gitignore`)  
**Script Executor:** `scripts/avaliar_brasileirao_em_dados.py`  
**Payload Analisado:** `core.json` (SHA-256: `edc0fe60b472698ae746631b04477d4166263d56cc92d9bc0457bc445a23b408`)  

---

## 1. Veredito Executivo

### Classificação Oficial: **INTEGRAR COM AUTORIZAÇÃO / USAR INTERNAMENTE EM STAGING**

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                              VEREDITO DO SPIKE                               │
│                                                                              │
│  [INTEGRAR COM AUTORIZAÇÃO / USAR INTERNAMENTE EM STAGING]                   │
│                                                                              │
│  1. Veredito Técnico: EXCEPCIONAL VIABILIDADE EM FORMATO AGREGADO            │
│     • Tabelas agregadas ocupam apenas 96 KB no SQLite (0,09 MB).             │
│     • Preserva integralmente o teto de 94 MB e soft limit de 84 MB.          │
│                                                                              │
│  2. Veredito Jurídico & Compliance: RESTRIÇÃO DE DIREITOS DE TERCEIROS       │
│     • Os dados de eventos derivam da API do FotMob (feed Opta/Stats Perform).│
│     • CORS aberto e CDN pública não configuram licença de redistribuição.    │
│     • Requer autorização do autor (Ioannis Canteiro/DataFutebol) ou uso      │
│       estritamente interno para enriquecimento sem redistribuição de marca.  │
│                                                                              │
│  3. Veredito Operacional: CONDICIONADO A CROSS-REFERENCE ROBUSTO             │
│     • 84,5% dos atletas caíram em ambiguidade por homônimos históricos.      │
│     • 13 atletas com mais de 450 min são novas adições de 2026.              │
└──────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Metadados e Integridade do Payload (`core.json`)

O arquivo `/data/core.json` foi baixado **uma única vez** para a pasta de quarentena `data/staging/brasileirao_em_dados/core.json`, sem nenhum download adicional de arquivos de times ou imagens.

| Atributo | Valor Observado | Análise de Conformidade |
|---|---|---|
| **URL de Origem** | `https://brasileiraoemdados.com.br/data/core.json` | Acesso direto via Cloudflare CDN |
| **SHA-256** | `edc0fe60b472698ae746631b04477d4166263d56cc92d9bc0457bc445a23b408` | Hash imutável de referência |
| **Tamanho em Disco** | 3.717.665 bytes (3,55 MB) | Compacto e estruturado |
| **Temporada Declarada** | `2026` | Brasileirão Série A 2026 em andamento |
| **Total de Partidas** | 338 partidas | 28/01/2026 até 06/11/2026 |
| **Clubes Participantes** | 20 clubes | 100% da Série A 2026 |
| **Atletas Catalogados** | 728 atletas | Mínimo de 1 minuto jogado |
| **Eventos Mapeados** | 501.563 eventos | Registrados no modelo interno |
| **Modelo de xG** | 9.501 finalizações, 868 gols, 866.9 xG | Regressão logística calibrada |

---

## 3. Inventário de Campos e Schema

O payload decompõe-se em quatro raízes principais:

### A. Raiz `meta`
- `season`: Ano da temporada (`"2026"`).
- `league`: Nome da competição (`"Brasileirão Série A"`).
- `n_matches`: Total de jogos consolidados (`338`).
- `n_events`: Total de eventos capturados na liga (`501563`).
- `xg_model`: Dicionário com `shots`, `goals` e `xg` acumulados para validação da calibração estatística.

### B. Raiz `teams` (20 registros)
- **Identificadores:** `id` (inteiro interno), `name`, `short` (sigla de 3 letras), `fm` (ID correspondente na API do FotMob).
- **Forma Recente:** `form` (vetor dos últimos 5 resultados: `['V', 'E', 'D', ...]`).
- **Métricas Coletivas (`s`):** Mais de 80 indicadores, incluindo:
  - Posse e Território: `possession` (%), `field_tilt` (%), `def_height` (médio em metros).
  - Pressão: `ppda` (passes do adversário por ação defensiva).
  - Gols Esperados: `xg`, `npxg`, `xg_against`, `npxg_against`, `xpts` (pontos esperados).
  - Passes por Terço: `passes_final_third`, `passes_into_box`, `passes_opp_half`.

### C. Raiz `players` (728 registros)
- **Identificadores e Posição:** `id`, `name`, `team` (clube atual), `teams` (lista de clubes caso transferido), `pos` (específica: GOL, ZAG, LAT, VOL, MC, MEI, PNT, ATA), `posg` (agrupada: Goleiro, Defensor, Meio-campista, Atacante), `fm` (ID FotMob), `cc` (nacionalidade ISO-3).
- **Métricas do Atleta (`s`):** 135 estatísticas quantitativas (minutos, gols, xG, xA, passes progressivos, conduções progressivas, desarmes, ações que geram chute/gol).
- **Métricas de Contexto Coletivo (`tm`):** Totais do clube nos minutos em que o jogador esteve em campo (permite calcular dependência ofensiva, percentual de participação e impacto on/off).

### D. Raiz `matches` (338 registros)
- `id`: ID canônico FotMob (ex: `1955925`).
- `d`: Data (`YYYY-MM-DD`).
- `h` e `a`: IDs de mandante e visitante.
- `hs` e `as_`: Gols de mandante e visitante.
- `v`: Estádio/Venue.

---

## 4. Cobertura de Reconciliação

### A. Reconciliação de Clubes (100% Coberto)
Todos os 20 clubes foram cruzados com `dim_clube` no banco canônico:

| Clube BED | Sigla | ID FotMob | Clube Canônico | ID Canônico | Score | Status |
|---|:---:|:---:|---|:---:|:---:|:---:|
| Flamengo | FLA | 9770 | Flamengo | 1389 | 1.0000 | **EXATO** |
| Palmeiras | PAL | 10283 | Palmeiras | 2459 | 1.0000 | **EXATO** |
| Cruzeiro | CRU | 9781 | Cruzeiro | 1044 | 1.0000 | **EXATO** |
| Fluminense | FLU | 9867 | Fluminense | 1412 | 1.0000 | **EXATO** |
| Athletico-PR | CAP | 10271 | Athletico-PR | 324 | 1.0000 | **EXATO** |
| Bahia | BAH | 9886 | Bahia | 481 | 1.0000 | **EXATO** |
| Atlético-MG | CAM | 10274 | Atlético-MG | 414 | 1.0000 | **EXATO** |
| RB Bragantino | RBB | 10280 | RC Bragantino | 2651 | 0.9231 | **PROVÁVEL** (Alias) |
| Santos | SAN | 9934 | Santos | 2902 | 1.0000 | **EXATO** |
| São Paulo | SAO | 10284 | São Paulo | 3077 | 1.0000 | **EXATO** |
| Botafogo | BOT | 8517 | Botafogo | 613 | 1.0000 | **EXATO** |
| Coritiba | CFC | 9777 | Coritiba | 994 | 1.0000 | **EXATO** |
| Vasco | VAS | 10279 | Vasco | 3371 | 1.0000 | **EXATO** |
| Mirassol | MIR | 6332 | Mirassol | 2206 | 1.0000 | **EXATO** |
| Vitória | VIT | 9866 | Vitória | 3416 | 1.0000 | **EXATO** |
| Internacional | INT | 9878 | Internacional | 1735 | 1.0000 | **EXATO** |
| Corinthians | COR | 10275 | Corinthians | 981 | 1.0000 | **EXATO** |
| Grêmio | GRE | 9787 | Grêmio | 1540 | 1.0000 | **EXATO** |
| Remo | REM | 8847 | Remo | 2709 | 1.0000 | **EXATO** |
| Chapecoense | CHA | 10277 | Chapecoense | 881 | 1.0000 | **EXATO** |

> [!NOTE]
> O único caso divergente de grafia foi "RB Bragantino", cadastrado historicamente como "RC Bragantino" em `dim_clube`. O mapeamento foi solucionado com equivalência de sigla e alias.

---

### B. Reconciliação de Atletas (728 Atletas)

```
Total de Atletas Analisados: 728
├── Matches Exatos (100% Nome + Clube):        59 ( 8,1%)
├── Matches Prováveis (Clube ou Alias):         24 ( 3,3%)
├── Matches Ambíguos (Homônimos Históricos):  615 (84,5%)
└── Não Reconciliados (Quarentena):            30 ( 4,1%)
```

---

## 5. Conflitos, Homônimos e Atletas sem Match (>450 Minutos)

### A. O Desafio dos Homônimos (84,5% dos Atletas)
No banco canônico do FutStats, a tabela `jogadores` possui 4.058 atletas cobrindo mais de um século de história. Nomes como **Gabriel**, **Arthur**, **Lucas**, **Matheus**, **Felipe**, **Bruno** e **Eduardo** possuem múltiplos registros históricos.  
Como o payload do *Brasileirão em Dados* utiliza primariamente o nome curto/exibição e o ID do FotMob (enquanto o banco canônico usa `ogol_id` e IDs CBF), a tentativa de cruzamento estritamente por texto causa ambiguidade em 615 casos.

**Regra de Ouro Aplicada:** Nenhum homônimo foi forçado. Todos os casos com mais de um candidato foram enviados para quarentena técnica.

---

### B. Atletas com Mais de 450 Minutos sem Match Canônico
Foram identificados exatamente **13 atletas titulares ou com minutagem relevante** (> 450 min) no Brasileirão 2026 que não possuem correspondência na tabela canônica `jogadores`:

| Atleta | Clube 2026 | Minutos | Posição | FotMob ID | Causa da Ausência Canônica |
|---|---|:---:|:---:|:---:|---|
| **Gabriel** | RB Bragantino | 1.337 | MC | 319589 | Homônimo amplo; novo registro 2026 |
| **Lucho Acosta** | Fluminense | 1.554 | MEI | 521338 | Estrangeiro (reforço internacional 2026) |
| **Arthur** | Santos | 1.034 | MC | 654044 | Homônimo com atletas históricos |
| **Juan Pablo Freytes** | Fluminense | 1.629 | ZAG | 975901 | Estrangeiro (reforço internacional 2026) |
| **José Rodríguez** | Vasco | 1.541 | LAT | 816753 | Estrangeiro (reforço internacional 2026) |
| **Alix** | RB Bragantino | 1.802 | ZAG | 1231596 | Atleta recém-promovido |
| **Juan Aguirre** | Athletico-PR | 2.349 | ZAG | 923698 | Estrangeiro (reforço internacional 2026) |
| **Néiser Villarreal** | Cruzeiro | 652 | ATA | 1680191 | Jovem talento estrangeiro 2026 |
| **Arthur** | Palmeiras | 1.407 | LAT | 1787794 | Lateral jovem da base / homônimo |
| **Doma** | Chapecoense | 2.588 | ZAG | 1437480 | Clube recém-promovido à Série A |
| **Italo** | Chapecoense | 716 | MEI | 1669646 | Atleta novo da Série A |
| **Jája Silva** | Remo | 1.701 | ATA | 1041427 | Clube recém-promovido à Série A |
| **Túlio** | Chapecoense | 877 | ATA | 1946070 | Atleta novo da Série A |

> [!IMPORTANT]
> A causa raiz de não estarem na tabela canônica decorre do fato de que esses atletas são estrangeiros contratados em 2026 ou atletas de clubes que retornaram à elite em 2026 (Remo e Chapecoense), e a base canônica atual foca no acervo consolidado e Golden Dataset histórico.

---

## 6. Estimativa de Impacto no SQLite (Simulação em Memória)

Para responder com precisão cirúrgica sem alterar o banco real `data/futebol.db`, executamos a criação e carga das tabelas agregadas em um banco isolado em memória (`:memory:`) com `page_size = 4096`.

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                    RESULTADO DA AUDITORIA DE CAPACIDADE                      │
│                                                                              │
│  • Tabela Atleta Proposta:   metrica_atleta_avancada_2026 (728 linhas)       │
│  • Tabela Clube Proposta:    metrica_clube_avancada_2026 (20 linhas)         │
│  • Índices Propostos:        2 índices B-Tree (clube_id, xg DESC)            │
│                                                                              │
│  • Total de Páginas B-Tree:  24 páginas                                      │
│  • Tamanho Total em Disco:   98.304 bytes = 96,00 KB (0,0938 MB)             │
│                                                                              │
│  • Status Atual do Banco:    83,14 MB (journal_mode: delete)                 │
│  • Folga até o Soft Limit:   0,86 MB (880 KB)                                │
│  • Consumo da Folga:         Apenas 10,87% da folga disponível!              │
│  • Folga Restante Pós-Carga: 0,76 MB (784 KB) até o soft limit de 84 MB      │
└──────────────────────────────────────────────────────────────────────────────┘
```

> [!TIP]
> Caso apenas as métricas consolidadas sejam ingeridas, o impacto é inferior a **0,1 MB**, mantendo o FutStats confortavelmente abaixo do soft limit de 84,00 MB e a mais de 10 MB de distância do hard limit de 94,00 MB.  
> Por outro lado, **se os 501.563 eventos espaciais brutos fossem gravados no SQLite, o banco cresceria em ~45 MB**, violando o limite e quebrando o deploy no Vercel.

---

## 7. Riscos Legais, Técnicos e Operacionais

| Risco | Classificação | Descrição e Impacto | Plano de Mitigação |
|---|:---:|---|---|
| **Propriedade Intelectual (FotMob / Opta)** | **ALTO** | O criador do site (Ioannis Canteiro) consome dados de eventos que têm como fonte primária o FotMob (parceiro comercial da Opta/Stats Perform). | Não publicar os dados brutos de eventos. Requerer autorização expressa do autor para uso de suas métricas derivadas (xG/xA) ou utilizar apenas internamente para fins de pesquisa/validação. |
| **Termos de Serviço & Scraping** | **MÉDIO** | Embora o CORS seja aberto (`*`) e os JSONs estejam em CDN pública Cloudflare, não há termos de uso formais permitindo espelhamento ou redistribuição pública. | Nunca automatizar scrapers agressivos ou periódicos sem alinhamento com o mantenedor (`contato.datafutebol@gmail.com`). |
| **Resiliência e Continuidade** | **MÉDIO** | O site é mantido por um estudante de IA/Ciência de Dados (PUCRS). Mudanças de schema, troca de hospedagem ou abandono da temporada podem ocorrer sem aviso prévio. | Arquitetura com *snapshot local resiliente*: se a fonte falhar, o FutStats mantém o snapshot estático estável sem indisponibilidade de UI. |
| **Contaminação de Homônimos** | **ALTO** | 84,5% dos atletas têm nomes curtos com potencial colisão no histórico de 4.058 atletas. | Criar tabela explícita `crossref_atleta_brasileiraoemdados`. Matching automático proibido para homônimos; somente matching validado por `(nome, clube, fotmob_id)`. |

---

## 8. Proposta de MVP e Arquitetura de Reconciliação

### A. Tabela Canônica de De-para (Cross-Reference)
```sql
CREATE TABLE IF NOT EXISTS crossref_atleta_bed_2026 (
  atleta_id_canonico INTEGER NOT NULL,
  bed_id INTEGER NOT NULL UNIQUE,
  fotmob_id INTEGER,
  nome_bed TEXT NOT NULL,
  clube_bed_id INTEGER NOT NULL,
  status_reconciliacao TEXT NOT NULL, -- 'EXATO', 'CONFIRMADO_MANUAL', 'QUARENTENA'
  auditado_em TEXT NOT NULL,
  PRIMARY KEY (atleta_id_canonico, bed_id),
  FOREIGN KEY (atleta_id_canonico) REFERENCES jogadores(id_jogador)
);
```

### B. Fluxo Operacional Recomendado (Arquitetura Híbrida)
1. **Fase 1 (Interna / Staging):** Manter o snapshot em `data/staging/brasileirao_em_dados/core.json`. Desenvolver a interface visual de conferência para desambiguar os 615 atletas homônimos e cadastrar os 13 atletas ausentes.
2. **Fase 2 (Contato Institucional):** Enviar mensagem amigável para `contato.datafutebol@gmail.com` (Ioannis Canteiro), apresentando o FutStats e propondo parceria/atribuição formal na dashboard ("Métricas de xG/xA por Brasileirão em Dados / DataFutebol").
3. **Fase 3 (Deploy Agregado):** Após autorização e quarentena zerada, carregar as 728 linhas em `metrica_atleta_avancada_2026` (+96 KB no banco).
4. **Fase 4 (Mapas e Heatmaps sem Custo de Banco):** Servir mapas espaciais via arquivos JSON estáticos estritamente no frontend React (`frontend/public/data/spatial_2026/`), sem sobrecarregar o SQLite.

---

## 9. Plano de Testes Pré-Integração

1. **Teste de Gate de Tamanho (Obrigatório):**
   ```python
   assert (banco_pos_carga_bytes - banco_pre_carga_bytes) < 200 * 1024  # Max 200 KB
   assert tamanho_banco_total_mb < 84.00  # Soft limit estrito
   ```
2. **Teste de Quarentena de Homônimos:**
   Validar que nenhuma linha com ambiguidade é inserida sem resolução manual auditada.
3. **Teste de Preservação Canônica:**
   Garantir que a tabela `gols` e a contagem de partidas (115.753) permaneçam intocadas.
4. **Teste de Regressão Automatizada:**
   Execução do gate de regressão `pytest tests/test_model_evals.py` (22/22 obrigatórios).

---

## 10. Recomendação Final

O SPIKE demonstrou que o *Brasileirão em Dados* é uma fonte técnica de **altíssima qualidade estatística** para enriquecer a Série A 2026 com indicadores modernos inexistentes em súmulas tradicionais (xG, xA, passes progressivos e conduções).

A estratégia ótima para o FutStats consiste em:
1. **Adotar o veredito "INTEGRAR COM AUTORIZAÇÃO / USAR INTERNAMENTE EM STAGING"**.
2. **Não realizar scraping em massa** nem tentar trazer os 501.563 eventos brutos para o SQLite canônico.
3. Manter os artefatos gerados isolados no staging (`data/staging/brasileirao_em_dados/`) até que haja alinhamento com o mantenedor do projeto e resolução da quarentena dos 615 atletas homônimos.
4. Preservar o estado saudável do banco canônico `data/futebol.db` (83,14 MB, `journal_mode: delete`), mantendo a governança e o teto da Vercel intactos.
