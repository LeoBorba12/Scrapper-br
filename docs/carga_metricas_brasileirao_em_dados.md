# Fase 4: Carga Controlada de Métricas Avançadas — Brasileirão em Dados 2026

**Data da Homologação:** 06 de Novembro de 2026  
**Ambiente:** Produção Controlada (`data/futebol.db`)  
**Script Executor:** `scripts/cargar_metricas_brasileirao_em_dados.py`  
**Relatório da Carga:** `data/staging/brasileirao_em_dados/carga_producao.json`  
**Backup Pré-Carga:** `data/backups/futebol_pre_bed_2026_20261106_135724.db` (87.175.168 bytes)  
**Versão do Schema:** `v1.0-producao-2026`  

---

## 1. Veredito Executivo Oficial

### Classificação: **HOMOLOGADO EM PRODUÇÃO COM 100% DE SUCESSO**

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                  PARECER DE HOMOLOGAÇÃO EM PRODUÇÃO (FASE 4)                 │
│                                                                              │
│  [STATUS GERAL: CARGA CONCLUÍDA — 100% DOS REQUISITOS ATENDIDOS]             │
│                                                                              │
│  1. Preservação Canônica Rigorosa:                                           │
│     • Partidas canônicas: 115.753 inalteradas (zero mutações).                │
│     • Gols canônicos: 117.523 inalterados (zero mutações).                    │
│     • Escalações, atletas e clubes canônicos 100% preservados.                │
│                                                                              │
│  2. População de Métricas Avançadas:                                         │
│     • 717 atletas elegíveis carregados em metrica_atleta_avancada_2026.      │
│     • 20 clubes carregados em metrica_clube_avancada_2026.                   │
│     • 7 atletas novos BLOQUEADOS (preservados em staging, sem poluição).     │
│     • 4 atletas em quarentena BLOQUEADOS (preservados em staging).           │
│     • Zero coordenadas espaciais ou blobs carregados em produção.            │
│                                                                              │
│  3. Governança e Teto Vercel:                                                │
│     • Tamanho final do banco: 83,46 MB (87.515.136 bytes).                   │
│     • Delta da migração: +332,0 KB (+339.968 bytes).                         │
│     • Soft limit Vercel (84,00 MB): RESPEITADO (margem de 540 KB).           │
│     • Teto oficial Vercel (94,00 MB): RESPEITADO (margem de 10,54 MB).       │
│     • journal_mode mantido em DELETE; PRAGMA integrity_check = ok.           │
│                                                                              │
│  4. Qualidade e Regressão:                                                   │
│     • Regression Gates (pytest tests/test_model_evals.py): 22/22 PASS.       │
│     • Auditoria Relacional (scripts/auditar_integridade_dados.py): 10/10 PASS│
│     • Idempotência Estrutural: Segunda execução com zero duplicidades.       │
└──────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Telemetria e Baseline Pré vs Pós-Carga

A migração foi executada dentro de uma transação atômica (`BEGIN TRANSACTION ... COMMIT`) com verificação prévia e posterior de telemetria física:

| Parâmetro | Pré-Carga | Pós-Carga | Variação (Delta) | Limite / Requisito | Status |
|:---|:---:|:---:|:---:|:---:|:---:|
| **Tamanho Físico (bytes)** | 87.175.168 | 87.515.136 | +339.968 bytes | — | Conforme |
| **Tamanho Físico (MB)** | 83,14 MB | 83,46 MB | +0,32 MB | $< 84,00$ MB (soft) | **PASS** |
| **Delta em KB** | — | — | +332,0 KB | Orçamento de segurança | **PASS** |
| **Partidas Canônicas** | 115.753 | 115.753 | 0 | Inalterado | **PASS** |
| **Gols Canônicos** | 117.523 | 117.523 | 0 | Inalterado | **PASS** |
| **PRAGMA journal_mode** | `delete` | `delete` | 0 | `delete` obrigatório | **PASS** |
| **PRAGMA integrity_check** | `ok` | `ok` | — | `ok` obrigatório | **PASS** |

---

## 3. Especificação DDL das Novas Tabelas Analíticas

Foram criadas estritamente duas tabelas analíticas desnormalizadas e compactas, otimizadas para consulta rápida sem junções complexas:

### 3.1. Tabela: `metrica_atleta_avancada_2026`

```sql
CREATE TABLE IF NOT EXISTS metrica_atleta_avancada_2026 (
    atleta_id_canonico INTEGER NOT NULL,
    bed_id INTEGER NOT NULL,
    nome TEXT NOT NULL,
    posicao TEXT,
    clube_id_canonico INTEGER NOT NULL,
    clube_nome TEXT NOT NULL,
    minutos INTEGER NOT NULL,
    gols REAL NOT NULL,
    xg REAL NOT NULL,
    xg_por_90 REAL NOT NULL,
    gols_menos_xg REAL NOT NULL,
    finalizacoes INTEGER NOT NULL,
    finalizacoes_no_alvo INTEGER NOT NULL,
    pontaria_pct REAL NOT NULL,
    assistencias INTEGER NOT NULL,
    xa REAL NOT NULL,
    xa_por_90 REAL NOT NULL,
    passes_decisivos INTEGER NOT NULL,
    desarmes INTEGER NOT NULL,
    interceptacoes INTEGER NOT NULL,
    recuperacoes INTEGER NOT NULL,
    acoes_defensivas INTEGER NOT NULL,
    cartoes_amarelos INTEGER NOT NULL,
    cartoes_vermelhos INTEGER NOT NULL,
    nota_media REAL NOT NULL,
    atualizado_em TEXT NOT NULL,
    PRIMARY KEY (atleta_id_canonico, bed_id)
);

CREATE INDEX IF NOT EXISTS idx_metrica_atleta_2026_clube 
ON metrica_atleta_avancada_2026 (clube_id_canonico, xg DESC);
```

### 3.2. Tabela: `metrica_clube_avancada_2026`

```sql
CREATE TABLE IF NOT EXISTS metrica_clube_avancada_2026 (
    clube_id_canonico INTEGER PRIMARY KEY,
    bed_id INTEGER NOT NULL,
    clube_nome TEXT NOT NULL,
    jogos INTEGER NOT NULL,
    gols_pro REAL NOT NULL,
    xg_pro REAL NOT NULL,
    xg_pro_por_90 REAL NOT NULL,
    gols_menos_xg_pro REAL NOT NULL,
    finalizacoes_pro INTEGER NOT NULL,
    finalizacoes_no_alvo_pro INTEGER NOT NULL,
    pontaria_pct_pro REAL NOT NULL,
    gols_sofridos REAL NOT NULL,
    xg_concedido REAL NOT NULL,
    xg_concedido_por_90 REAL NOT NULL,
    gols_menos_xg_contra REAL NOT NULL,
    saldo_xg REAL NOT NULL,
    posse_media REAL NOT NULL,
    atualizado_em TEXT NOT NULL
);
```

---

## 4. Auditoria de Dados e Reconciliação de Entidades

### 4.1. Contagem de Entidades Inseridas vs Bloqueadas

| Grupo de Dados | Esperado | Inserido em Produção | Status de Governança |
|:---|:---:|:---:|:---|
| **Atletas Elegíveis** | 717 | **717** | Carregado com sucesso (100% auditado) |
| **Clubes da Série A** | 20 | **20** | Carregado com sucesso (100% auditado) |
| **Atletas Novos (`NOVO_ATLETA`)** | 7 | **0** | **BLOQUEADO** (sem ID canônico prévio) |
| **Atletas em Quarentena (`QUARENTENA`)** | 4 | **0** | **BLOQUEADO** (critério de segurança) |
| **Eventos Brutos / Coordenadas x,y** | 0 | **0** | **BLOQUEADO** (excluído de produção) |

### 4.2. Reconciliação Matemática dos Agregados (Gols e xG)

| Métrica | Base BED Total (Liga) | Carregado em Produção (717 Atletas) | Bloqueado em Staging (11 Atletas) | Coerência Matemática |
|:---|:---:|:---:|:---:|:---:|
| **Gols Totais** | 868,0 | **853,0** | 15,0 (7 novos: 15 / 4 quarentena: 0) | $853,0 + 15,0 = 868,0$ |
| **xG Total** | 866,9 | **856,4** | 10,47 (7 novos: 10,39 / 4 quarentena: 0,08) | $856,4 + 10,47 = 866,87$ |
| **Minutos Atletas** | 60.840 min | **59.421 min** | 1.419 min (7 novos + 4 quarentena) | $59.421 + 1.419 = 60.840$ |

---

## 5. Gates de Regressão e Integridade Automatizada

Após a efetivação do `COMMIT` em `data/futebol.db`, a suíte de testes de integridade operacional foi acionada:

```
[EXECUTANDO GATES DE REGRESSÃO OBRIGATÓRIOS]
-> Rodando: python -m pytest tests/test_model_evals.py
Pytest returncode: 0
Pytest 22/22: APROVADO [PASS]
-> Rodando: python scripts/auditar_integridade_dados.py
Auditoria returncode: 0
Auditoria Relacional: APROVADA [PASS]
```

1. **Testes Preditivos e de Modelagem (`test_model_evals.py`):**
   - 22/22 testes passaram sem nenhuma falha ou aviso.
   - Dixon-Coles, poisson bivariada, odds de mercado e cálculos preditivos permaneceram 100% estáveis e intactos.
2. **Auditoria Relacional dos Dados (`auditar_integridade_dados.py`):**
   - 10/10 regras de consistência relacional validadas.
   - Zero orfandade de gols, partidas, clubes ou cartões.

---

## 6. Comprovação de Idempotência Estrutural

O script `scripts/cargar_metricas_brasileirao_em_dados.py` realizou uma segunda execução imediata de inserção simulada em produção sob as mesmas condições:
- `INSERT ... ON CONFLICT DO UPDATE`:
  - Contagem de atletas antes da 2ª execução: 717
  - Contagem de atletas após a 2ª execução: 717 (zero linhas duplicadas)
  - Contagem de clubes antes da 2ª execução: 20
  - Contagem de clubes após a 2ª execução: 20 (zero linhas duplicadas)
  - **Resultado de Idempotência:** `PASS`.

---

## 7. Procedimentos de Segurança e Plano de Rollback

Para garantir governança absoluta, foi criado um backup físico do banco pré-migração:
- **Caminho do Backup:** `data/backups/futebol_pre_bed_2026_20261106_135724.db`
- **Tamanho do Backup:** 87.175.168 bytes (83,14 MB)

### Procedimento de Rollback Imediato (se necessário)

Caso seja solicitada reversão da migração, execute o procedimento abaixo:

```bash
# 1. Parar quaisquer daemons ou conexões ativas
# 2. Restaurar backup físico pré-carga
cp "data/backups/futebol_pre_bed_2026_20261106_135724.db" "data/futebol.db"

# 3. Validar restauração
python -c "import sqlite3; conn=sqlite3.connect('data/futebol.db'); print(conn.execute('PRAGMA integrity_check').fetchall())"
```

---

## 8. Conclusão da Fase 4

A integração das métricas analíticas avançadas do Brasileirão em Dados 2026 na base de produção `data/futebol.db` foi **plenamente concluída**. 

O banco de produção permanece íntegro, saudável, abaixo do soft limit de 84,00 MB da Vercel (em 83,46 MB), com dados de 717 atletas e 20 clubes devidamente disponibilizados para as camadas de API e visualização na dashboard do FutStats.
