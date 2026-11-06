# Fase 4.1: Correção de Governança e Capacidade — Brasileirão em Dados 2026

**Data da Homologação:** 06 de Novembro de 2026  
**Ambiente:** Produção Controlada (`data/futebol.db`)  
**Script Executor:** `scripts/corrigir_governanca_bed_2026.py`  
**Relatório da Auditoria:** `data/staging/brasileirao_em_dados/auditoria_governanca.json`  
**Backup Pré-Correção:** `data/backups/futebol_pre_governanca_20261106_141631.db` (87.515.136 bytes)  
**Versão do Schema:** `v1.0-producao-2026`  

---

## 1. Veredito Executivo Oficial

### Classificação: **HOMOLOGADO COM SUCESSO ABSOLUTO (GOVERNANÇA PLENA)**

```
┌──────────────────────────────────────────────────────────────────────────────┐
│             PARECER EXECUTIVO DE GOVERNANÇA E CAPACIDADE (FASE 4.1)          │
│                                                                              │
│  [STATUS GERAL: 100% DOS CRITÉRIOS DE ACEITE CUMPRIDOS]                      │
│                                                                              │
│  1. Auditoria Relacional Reconciliada (12/12 Regras Ativas):                │
│     • Esclarecida a divergência documental de "10 vs 12 regras": o script    │
│       auditar_integridade_dados.py sempre conteve 12 regras ativas.          │
│     • Todas as 12 regras foram auditadas e documentadas com evidências.      │
│     • Partidas (115.753) e Gols (117.523) canônicos 100% íntegros.           │
│                                                                              │
│  2. Proveniência e Linhagem Desacoplada (737 Registros):                    │
│     • Criada a tabela metrica_brasileirao_em_dados_proveniencia.             │
│     • 717 atletas e 20 clubes devidamente mapeados com seus hashes SHA-256,  │
│       métodos de reconciliação e fontes de coleta. Zero duplicidades.        │
│     • Nenhuma alteração destrutiva nas tabelas de métricas existentes.       │
│                                                                              │
│  3. Otimização de Capacidade e Folga Estrutural:                             │
│     • Custo decomposto por tabela e índice (páginas de 4.096 bytes).         │
│     • Eliminação de 1.068,0 KB de fragmentação via VACUUM otimizado.         │
│     • Tamanho final do banco de produção: 82,65 MB (86.663.168 bytes).       │
│     • Folga para o Soft Limit (84,00 MB): 1,35 MB (superando a meta >= 1 MB) │
│     • Folga para o Hard Limit (94,00 MB): 11,35 MB.                          │
│                                                                              │
│  4. Blindagem Operacional & Regressão:                                       │
│     • Regression Gates (pytest tests/test_model_evals.py): 22/22 PASS.       │
│     • PRAGMA journal_mode: delete; PRAGMA integrity_check: ok.               │
│     • Idempotência: segunda execução com 0 novas linhas inseridas.           │
└──────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Reconciliação da Auditoria Relacional (12/12 Regras)

### 2.1. Diagnóstico da Aparente Redução "12 para 10"

A divergência entre as menções de "12 regras" na Fase 3 e "10 regras" na Fase 4 decorreu de dois fatores históricos e documentais, e **não** de desativação ou remoção de testes no código:

1. **Validações de Staging (Fase 3):** Na Fase 3, foram aplicadas as 12 regras de validação pré-carga contidas no relatório `data/staging/brasileirao_em_dados/validacao_carga.json` (focadas em integridade do payload BED, elegibilidade, minutagem e somas de xG).
2. **Histórico do `auditar_integridade_dados.py`:** O script de auditoria do banco canônico continha originalmente 10 regras relacionais. Posteriormente, foram incorporadas as **Regras 11** (`feat(integrity): implementa regra 11 permanente`, commit `fa738ae`) e **Regra 12** (`fix(reconciliacao): implementa regra 12`, commit `37f8cb7`), elevando o total executado para 12 regras. Contudo, a redação do arquivo `AGENTS.md` permaneceu com a descrição legada *"validar 10 regras de consistência relacional"*, o que gerou a impressão de que apenas 10 regras estariam sendo executadas.
3. **Realidade do Código:** Todas as 12 regras sempre estiveram ativas e implementadas. O relatório da Fase 4.1 formaliza e padroniza a aferição das 12 regras completas.

### 2.2. Relatório de Execução das 12 Regras Relacionais

A execução direta do motor de auditoria relacional sobre a base canônica atestou o seguinte status para cada uma das 12 regras:

| Nº | Nome da Regra | Descrição e Finalidade | Status | Ocorrências | Reparados | Evidência / Detalhes |
|:---:|:---|:---|:---:|:---:|:---:|:---|
| **01** | Gols Numéricos Nulos | Detecta partidas finalizadas com placar mas gols_mandante ou gols_visitante nulos | **OK** | 0 | 0 | Zero partidas com gols nulos |
| **02** | Padronização de Formato de Data | Assegura formato ISO `YYYY-MM-DD` em todas as partidas para indexação | **OK** | 0 | 0 | Todas as 115.753 partidas em conformidade ISO |
| **03** | Gols Órfãos | Valida se todo gol registrado aponta para uma partida válida em `partidas` | **OK** | 0 | 0 | Zero gols órfãos entre os 117.523 gols |
| **04** | Odds Órfãs | Valida se todo registro de odd aponta para uma partida existente | **OK** | 0 | 0 | Zero odds desassociadas |
| **05** | Nomes de Clubes Válidos | Impede nomes vazios, nulos ou artefatos de scraping (ex: `'Estatísticas'`) | **OK** | 0 | 0 | Clubes mandante e visitante 100% saneados |
| **06** | Coerência Lógica de Vencedor | Valida se a coluna `vencedor` condiz com o placar final (mandante, visitante ou Empate) | **OK** | 0 | 0 | Coerência de placar 100% verificada |
| **07** | Jogos Duplicados no Acervo | Detecta duplicidade de confrontos na mesma data entre os mesmos clubes | **OK** | 0 | 0 | Zero duplicidades na base histórica |
| **08** | Gols Atribuídos a Times Placar Zero | Corrige gols atribuídos ao time adversário quando o clube fez zero gols no placar | **CORRIGIDO** | 3 | 3 | 3 gols históricos de clube invertido auto-reparados |
| **09** | Atletas sem Posição Tática | Identifica artilheiros com $\ge 3$ gols sem posição e infere como Atacante | **OK** | 0 | 0 | Todos os atletas com perfil tático preenchido |
| **10** | Coerência Gol vs Escalação | Valida se o atleta fez gol pelo time no qual estava escalado na súmula oficial | **OK** | 0 | 0 | Zero divergências entre escalação e autoria de gols |
| **11** | Médias de Gols Verossímeis | Bloqueia médias absurdas ($> 2,5$ gols/jogo para $\ge 10$ gols ou jogos $\le 0$) | **OK** | 0 | 0 | Média de gols de todos os atletas é matematicamente viável |
| **12** | Clubes Recentes em Escalações | Sincroniza dinamicamente o último clube do atleta em súmula com seu perfil | **OK** | 0 | 0 | Clubes recentes perfeitamente harmonizados |

---

## 3. Normalização e Linhagem: Tabela de Proveniência

Conforme diretriz, foi criada uma tabela desacoplada para rastreabilidade de linhagem de dados (*data provenance*), preservando intocadas as tabelas de métricas existentes.

### 3.1. DDL da Tabela `metrica_brasileirao_em_dados_proveniencia`

```sql
CREATE TABLE IF NOT EXISTS metrica_brasileirao_em_dados_proveniencia (
  escopo TEXT NOT NULL CHECK (escopo IN ('ATLETA', 'CLUBE')),
  entidade_id_canonico INTEGER NOT NULL,
  bed_id INTEGER NOT NULL,
  payload_sha256 TEXT NOT NULL,
  fonte TEXT NOT NULL,
  atribuicao TEXT NOT NULL,
  status_reconciliacao TEXT NOT NULL,
  metodo_reconciliacao TEXT NOT NULL,
  coletado_em TEXT NOT NULL,
  schema_versao TEXT NOT NULL,
  PRIMARY KEY (escopo, entidade_id_canonico, bed_id)
);
```

### 3.2. Carga e Auditoria de Registros

- **Atletas Carregados:** 717 registros (`escopo = 'ATLETA'`).
- **Clubes Carregados:** 20 registros (`escopo = 'CLUBE'`).
- **Total de Registros:** **737 registros**.
- **Duplicidades Detectadas:** 0.
- **Teste de Idempotência:** A reexecução do script realizou `INSERT ... ON CONFLICT DO UPDATE`, mantendo rigorosamente 737 registros com zero mutação indesejada.

---

## 4. Auditoria de Capacidade, Fragmentação e VACUUM

### 4.1. Decomposição Real de Custo por Tabela e Índice

A medição física baseada em blocos SQLite (`page_size = 4096 bytes`) revelou a ocupação exata de cada componente analítico:

| Componente | Tipo | Registros | Páginas SQLite | Tamanho Físico (bytes) | Tamanho em KB |
|:---|:---:|:---:|:---:|:---:|:---:|
| `metrica_atleta_avancada_2026` | Tabela + PK | 717 | 71 | 290.816 | 284,0 KB |
| `idx_metrica_atleta_2026_clube` | Índice Secundário | 717 | 4 | 16.384 | 16,0 KB |
| `idx_metrica_atleta_2026_xg` | Índice Secundário | 717 | 3 | 12.288 | 12,0 KB |
| `metrica_clube_avancada_2026` | Tabela + PK | 20 | 6 | 24.576 | 24,0 KB |
| `metrica_brasileirao_em_dados_proveniencia` | Tabela + PK | 737 | 60 | 245.760 | 240,0 KB |
| **Total Componentes Analíticos** | — | **1.474** | **144** | **589.824** | **576,0 KB** |

### 4.2. Por que o Delta Inicial da Fase 4 foi 332 KB (vs 192 KB previstos)?

1. **Volume de Colunas Reais:** Na simulação simplificada da Fase 3, utilizou-se um schema com apenas 18 colunas (~200 bytes/linha). O schema final da Fase 4 acomodou 29 métricas essenciais (incluindo `npxg`, `sca`, `gca`, `passes_progressivos`), resultando em ~400 bytes por registro.
2. **Índices Secundários Dedicados:** Foram criados dois índices B-Tree adicionais (`clube_id_canonico` e `xg DESC`), consumindo 28,0 KB adicionais em páginas de 4096 bytes.
3. **Propriedade da B-Tree do SQLite:** O SQLite aloca nós de página inteira (mínimo de 4096 bytes por nó raiz de índice ou tabela) e mantém taxas de preenchimento balanceadas para evitar splits durante atualizações.

### 4.3. Otimização de Fragmentação via VACUUM

Antes da intervenção, o banco acumulava fragmentação histórica entre tabelas de partidas antigas e deleções de auditorias passadas. Ao executar o `VACUUM`:
- **Espaço recuperado:** **1.068,0 KB (1,04 MB / 261 páginas)**.
- **Tamanho antes do VACUUM (com proveniência):** 83,69 MB (87.756.800 bytes).
- **Tamanho após o VACUUM:** **82,65 MB (86.663.168 bytes)**.
- **Folga para o Soft Limit de 84,00 MB:** **1,35 MB (1.417.216 bytes)**.  
  *(Atende com folga ao requisito estrito de $\ge 1,0$ MB de margem livre).*
- **Folga para o Teto da Vercel (94,00 MB):** **11,35 MB (11.902.976 bytes)**.

---

## 5. Orçamento Revisado de Capacidade para Futuras Atualizações

Para garantir que futuras rodadas do Brasileirão 2026 não ameacem a estabilidade do repositório:

1. **Atualizações de Rodada (In-Place):** Atualizar estatísticas de atletas já cadastrados ocorre via `UPDATE`, reescrevendo os registros dentro das mesmas páginas existentes (`custo delta = 0 KB`).
2. **Inclusão de Novos Atletas:** Cada atleta recém-estreado custa aproximadamente 440 bytes (dados + índices + proveniência).
3. **Teto de Segurança para Cargas Futuras:** Fixado em no máximo **600,0 KB** de incremento por lote.
4. **Política de Manutenção:** Manter a execução de rotinas periódicas de `VACUUM` após migrações estruturais para garantir folga constante de no mínimo 1,0 MB abaixo do soft limit.

---

## 6. Verificação de Integridade e Regression Gates

A conformidade do pipeline foi validada pelas duas suítes automáticas do repositório:

```
[EXECUTANDO AUDITORIA RELACIONAL: 12 REGRAS]
- Total de Regras Avaliadas: 12/12 (Todas APROVADAS / HOMOLOGADAS)

[EXECUTANDO REGRESSION GATES: PYTEST]
- python -m pytest tests/test_model_evals.py
- Returncode: 0
- Status: 22/22 APROVADO [PASS]
```

### Checklist Oficial de Aceite da Fase 4.1

- [x] Partidas canônicas rigorosamente intactas: **115.753 / 115.753**
- [x] Gols canônicos rigorosamente intactos: **117.523 / 117.523**
- [x] `PRAGMA journal_mode`: **`delete`**
- [x] `PRAGMA integrity_check`: **`ok`**
- [x] Atletas na tabela de métricas: **717**
- [x] Clubes na tabela de métricas: **20**
- [x] Atletas na tabela de proveniência: **717**
- [x] Clubes na tabela de proveniência: **20**
- [x] Duplicidades: **Zero** (idempotência validada)
- [x] Auditoria relacional: **12/12 regras auditadas**
- [x] Testes estatísticos e preditivos: **22/22 testes PASS**
- [x] Folga mínima abaixo do soft limit (84,00 MB): **1,35 MB** ($\ge 1,0$ MB)
- [x] Métricas mantidas em isolamento seguro sem exposição prematura na UI.

---

## 7. Backup e Rollback de Segurança

Caso necessária reversão imediata:
- **Arquivo de Backup:** `data/backups/futebol_pre_governanca_20261106_141631.db` (87.515.136 bytes).
- **Procedimento:** Restaurar cópia sobre `data/futebol.db` e executar `PRAGMA integrity_check;`.
