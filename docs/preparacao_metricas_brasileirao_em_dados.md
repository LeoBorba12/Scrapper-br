# Fase 3: Staging de Métricas Avançadas — Brasileirão em Dados 2026

**Data da Homologação:** 06 de Novembro de 2026  
**Ambiente:** Estritamente Isolado (Modo Read-Only no banco canônico `data/futebol.db`)  
**Diretório de Staging:** `data/staging/brasileirao_em_dados/` (ignorado pelo Git via `.gitignore`)  
**Script Executor:** `scripts/preparar_metricas_brasileirao_em_dados.py`  
**Payload Hash SHA-256:** `edc0fe60b472698ae746631b04477d4166263d56cc92d9bc0457bc445a23b408`  
**Versão do Schema:** `v1.0-staging-2026`  

---

## 1. Veredito de Prontidão para Carga Futura

### Classificação: **APROVADO PARA CARGA CONTROLADA (STAGING VALIDADO)**

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                    PARECER DE PRONTIDÃO DE CARGA (STAGING)                   │
│                                                                              │
│  [STATUS GERAL: APROVADO COM 12/12 VALIDAÇÕES PASS]                          │
│                                                                              │
│  1. Conformidade de Dados: 100% dos 728 atletas e 20 clubes mapeados.        │
│     • 717 atletas elegíveis com correspondência canônica unívoca.            │
│     • 7 novos atletas isolados com placeholder sem ID canônico definitivo.   │
│     • 4 atletas em quarentena residual excluídos de carga.                   │
│                                                                              │
│  2. Exatidão Matemática Estrita:                                             │
│     • Gols atletas: 868,0 (100% compatível com core.json -> xg_model.goals). │
│     • xG atletas:   866,9 (100% compatível com core.json -> xg_model.xg).    │
│     • Minutos liga: 60.840 min (338 jogos * 90 min * 2 times).               │
│                                                                              │
│  3. Governança de Capacidade Vercel:                                         │
│     • Delta medido no SQLite de teste: 192,0 KB (teto: 200,0 KB).            │
│     • Idempotência comprovada: zero duplicidades na 2ª execução.             │
│     • Impacto no banco de produção: ZERO BYTES ALTERADOS.                    │
└──────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Auditoria de Baseline e Integridade do SQLite Canônico

O banco de produção `data/futebol.db` permaneceu intocado em todas as fases da operação:

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                    AUDITORIA DE INTEGRIDADE DO BANCO CANÔNICO                │
│                                                                              │
│  Métrica               Antes da Fase 3           Após a Fase 3               │
│  ──────────────────────────────────────────────────────────────────────────  │
│  Partidas              115.753                   115.753 (100% idêntico)     │
│  Gols Canônicos        117.523                   117.523 (100% idêntico)     │
│  Tamanho do Banco      83,14 MB (87.175.168 B)   83,14 MB (87.175.168 B)     │
│  Journal Mode          delete                    delete                      │
│  Delta de Bytes        0 bytes                   0 bytes alterados           │
│                                                                              │
│  Teto Vercel: 94,00 MB | Soft Limit: 84,00 MB | Status: CONFORME             │
└──────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Matriz das 12 Validações Obrigatórias

O pipeline executou e homologou 12 verificações automatizadas de integridade relacional, consistência matemática e idempotência:

| ID | Regra / Validação Obrigatória | Valor Esperado | Valor Observado | Status |
|---|---|:---:|:---:|:---:|
| **V01** | Total de atletas processados | 728 | 728 | **PASS** |
| **V02** | Total de clubes processados | 20 | 20 | **PASS** |
| **V03** | Atletas com status elegível para staging | 717 | 717 | **PASS** |
| **V04** | Novos atletas mantidos em staging com placeholder | 7 | 7 | **PASS** |
| **V05** | Atletas em quarentena sem elegibilidade de produção | 4 | 4 (`elegivel_staging: False`) | **PASS** |
| **V06** | Soma de minutos dos clubes confrontada com a liga | 60.840 min | 60.840 min | **PASS** |
| **V07** | Soma de gols de atletas confrontada com `meta.xg_model` | 868,0 gols | 868,0 gols | **PASS** |
| **V08** | Soma de xG de atletas confrontada com `meta.xg_model` | 866,9 xG | 866,9 xG | **PASS** |
| **V09** | Simulação de carga em SQLite temporário isolado | Sucesso DDL/DML | Executado com sucesso | **PASS** |
| **V10** | Teto máximo de delta de bytes no banco ($\le 200\text{ KB}$) | $\le 200,0\text{ KB}$ | **192,0 KB (0,1875 MB)** | **PASS** |
| **V11** | Idempotência estrutural (2 execuções consecutivas) | Zero duplicidade | Comprovada (contagens e bytes idênticos) | **PASS** |
| **V12** | Contagem exata de linhas sem registros órfãos | 728 atl / 20 clb | 728 atl / 20 clb | **PASS** |

---

## 4. Inventário Completo de Métricas Preparadas

### A. Dimensão Atleta (`metricas_atletas_2026.json`)
Cada um dos 728 registros foi estruturado com o seguinte esquema de dados normalizado:

```json
{
  "bed_id": 16886,
  "atleta_id_canonico": 34,
  "placeholder_staging_id": null,
  "nome_bed": "Hulk",
  "clube_id_canonico": 414,
  "clube_nome_canonico": "Atlético-MG",
  "fotmob_id": 20276,
  "posicao": "ATA",
  "posicao_grupo": "Atacante",
  "nacionalidade": "BRA",
  "temporada": "2026",
  "competicao": "Brasileirão Série A",
  "status_reconciliacao": "EXISTENTE",
  "metodo_reconciliacao": "ESCALACAO_PARTIDA",
  "elegivel_staging": true,
  "elegivel_producao": true,
  "payload_sha256": "edc0fe60b472698ae746631b04477d4166263d56cc92d9bc0457bc445a23b408",
  "coletado_em": "2026-11-06T13:44:34.123456",
  "fonte": "brasileiraoemdados.com.br",
  "atribuicao": "Brasileirão em Dados / DataFutebol (Ioannis Canteiro) - dados originários de tracking FotMob",
  "metricas": {
    "minutos": 2480,
    "jogos": 28,
    "titularidades": 28,
    "gols": 16.0,
    "gols_sem_penalti": 15.0,
    "gols_penalti": 1.0,
    "penaltis_cobrados": 1.0,
    "assistencias": 9.0,
    "xg": 10.42,
    "npxg": 9.66,
    "xa": 6.84,
    "finalizacoes": 94.0,
    "finalizacoes_no_alvo": 38.0,
    "finalizacoes_fora": 36.0,
    "finalizacoes_bloqueadas": 20.0,
    "bolas_na_trave": 3.0,
    "grandes_chances": 20.0,
    "grandes_chances_perdidas": 8.0,
    "passes": 842.0,
    "passes_certos": 651.0,
    "passes_progressivos": 78.0,
    "passes_decisivos": 52.0,
    "passes_terco_final": 64.0,
    "passes_para_area": 41.0,
    "cruzamentos_tentados": 92.0,
    "cruzamentos_certos": 24.0,
    "grandes_chances_criadas": 14.0,
    "sca": 132.0,
    "gca": 18.0,
    "conducoes": 620.0,
    "conducoes_progressivas": 88.0,
    "dribles_tentados": 78.0,
    "dribles_certos": 42.0,
    "desarmes_totais": 18.0,
    "desarmes_ganhos": 12.0,
    "interceptacoes": 6.0,
    "cortes": 8.0,
    "bloqueios": 4.0,
    "recuperacoes": 72.0,
    "duelos_aereos_ganhos": 29.0,
    "duelos_chao_ganhos": 114.0,
    "faltas_cometidas": 32.0,
    "faltas_sofridas": 54.0,
    "cartoes_amarelos": 6,
    "cartoes_vermelhos": 0,
    "defesas_goleiro": null,
    "defesas_na_area": null,
    "xg_sofrido_goleiro": null
  }
}
```

### B. Dimensão Clube (`metricas_clubes_2026.json`)
Os 20 clubes da Série A foram consolidados com 24 indicadores coletivos:
- **Desempenho Real:** `jogos`, `vitorias`, `empates`, `derrotas`, `gols_pro`, `gols_contra`, `saldo_gols`, `pontos`, `clean_sheets`.
- **Desempenho Esperado:** `xg`, `npxg`, `xg_contra`, `npxg_contra`, `pontos_esperados` (xPTS).
- **Controle e Território:** `posse_pct`, `field_tilt_pct` (% toques no terço final), `ppda` (passes do adversário por ação defensiva), `altura_defensiva` (em metros).
- **Distribuição de Passe:** `passes_totais`, `passes_terco_defensivo`, `passes_terco_central`, `passes_terco_final`, `passes_na_area`.

---

## 5. Resolução de Conflitos e Tratamento de Exceções

1. **Caso Tomás Pérez (Duplicata Canônica):**
   - Vinculado estritamente ao ID canônico principal **`1956`** (que possui 35 partidas disputadas no Atlético-MG em 2026).
   - O ID secundário duplicado `90717` foi excluído do mapeamento de métricas para impedir duplicidade de agregações.
2. **Novos Atletas (7 Casos em Staging):**
   - Atletas como *Doma* (Chapecoense), *Alix* (Bragantino), *Jája Silva* (Remo), *Gabriel* (Bragantino), *Túlio* (Chapecoense), *Cauê Santos* (Bragantino) e *Giovanni Pavani* (Remo) receberam IDs temporários estruturados (`placeholder_staging_id: "STAGING_NOVO_{bed_id}"`).
   - Marcados com `elegivel_staging: True` e `elegivel_producao: False`. Não geram órfãos nem poluem a dimensão canônica de atletas.
3. **Quarentena Residual (4 Casos Pontuais):**
   - *Lucas Silva* (Vitória, 174 min), *Luan Silva* (São Paulo, 90 min), *Marquinhos* (Botafogo, 8 min) e *Alemão* (Athletico-PR, 10 min).
   - Marcados com `elegivel_staging: False` e `elegivel_producao: False`. Ficam retidos em staging sem elegibilidade para o banco de produção.

---

## 6. Impacto Estimado e Governança de Capacidade no SQLite

A medição precisa no banco SQLite de teste (`teste_isolado.db`) comprovou conformidade total:
- **Tamanho Inicial Vazio:** 32.768 bytes (32,00 KB).
- **Tamanho Pós-Carga (728 atletas + 20 clubes + índice):** 229.376 bytes (224,00 KB).
- **Delta Efetivo de Carga:** **196.608 bytes = 192,00 KB (0,1875 MB)**.
- **Teto do Critério de Aceite:** $\le 200,00\text{ KB}$ $\rightarrow$ **CONFORME**.
- **Consumo da Folga Canônica:** A folga atual do banco até o soft limit de 84,00 MB é de **0,86 MB (880 KB)**. O acréscimo de 192 KB consumirá apenas **21,8% da folga disponível**, deixando **0,67 MB livres** abaixo do soft limit e mais de **10,6 MB abaixo do hard limit de 94 MB da Vercel**.

---

## 7. Riscos Residuais e Recomendações

| Categoria | Risco Residual | Probabilidade | Severidade | Ação Mitigatória Recomendada |
|---|---|:---:|:---:|---|
| **Propriedade Intelectual** | Uso de métricas derivadas de tracking FotMob/Opta | Média | Média | Manter atribuição textual clara na interface ("Métricas avançadas por Brasileirão em Dados / DataFutebol"). Enviar e-mail de cortesia para Ioannis Canteiro antes de publicar na dashboard. |
| **Integridade de Gols** | Sobrescrita de gols canônicos do FutStats | Nula | Alta | O pipeline **não toca na tabela `gols` nem na tabela `partidas`**. A tabela de métricas avançadas opera como dimensão analítica complementar desacoplada. |
| **Estabilidade da Fonte** | Mudança no layout do `core.json` em rodadas futuras | Média | Baixa | O validador compara o hash SHA-256 e o esquema das 12 regras. Se o payload quebrar, o processo aborta antes de qualquer escrita. |

---

## 8. Plano de Carga Controlada (Próximos Passos)

1. **Aprovação do Staging:** O staging gerado em `data/staging/brasileirao_em_dados/` está 100% validado e documentado.
2. **Execução de Migração DDL Canônica:** Criar as tabelas `metrica_atleta_avancada_2026` e `metrica_clube_avancada_2026` em `data/futebol.db` com `PRAGMA journal_mode = delete;`.
3. **Carga dos 717 Atletas Elegíveis:** Inserir exclusivamente os atletas com `elegivel_producao: True` (+192 KB no SQLite).
4. **Verificação de Regressão Gate:** Rodar `pytest tests/test_model_evals.py` (22/22) e `python scripts/auditar_integridade_dados.py` para homologação definitiva.
