# Relatório de Deploy e Publicação Controlada — Fase 6.1

**Data:** 06 de Novembro de 2026  
**Status do Deploy:** PUBLICADO E HOMOLOGADO EM PRODUÇÃO (`main`)  
**Commit de Merge:** `61b53e1ef6722bb1cd80da50d28f1c828a3ad306`  
**Pull Request:** [#2](https://github.com/LeoBorba12/Scrapper-br/pull/2) (`chore/regenerar-conteudo-pos-restauracao` -> `main`)

---

## 1. Sumário de Execução

Todas as 10 etapas da **Fase 6.1** foram rigorosamente executadas e validadas:
1. **Revisão de Diff:** Realizada antes do commit; nenhum arquivo indesejado foi adicionado.
2. **Proteção de Staging e Dados Brutos:** Confirmado que `data/staging/`, `scratch/`, `.env` e backups não foram versionados.
3. **Validação do `.gitignore`:** Cobertura estrita para staging, caches brutos, shm/wal e arquivos de ambiente.
4. **Testes Automatizados:** Suíte completa executada e 100% aprovada (**38/38 PASS**).
5. **Auditoria Relacional de Integridade:** Executada com **12/12 regras OK** e **0 inconsistências**.
6. **Build de Produção do Frontend:** Concluído com sucesso e otimizado via Vite em **7.71s**.
7. **Commit Semântico:** Criado com mensagem descritiva detalhada.
8. **Pull Request Aberto:** PR #2 aberto no repositório `LeoBorba12/Scrapper-br`.
9. **Merge em `main`:** PR #2 mergeado via squash com sucesso.
10. **Deploy em Produção:** Branch `main` atualizada e sincronizada com o webhook de deploy contínuo da Vercel.

---

## 2. Evidências Técnicas de Aceite

### 2.1 Preservação da Base Canônica
- **Total de Partidas:** **115.753** (inalterado)
- **Total de Gols:** **117.523** (inalterado)
- **Tamanho do SQLite:** **82,65 MB** (86.663.168 bytes)
  - Soft Limit Vercel: **84,00 MB** (folga de 1,35 MB)
  - Hard Limit Vercel: **94,00 MB** (folga de 11,35 MB)
- **PRAGMA integrity_check:** `ok`
- **PRAGMA journal_mode:** `delete`

### 2.2 Suíte de Testes (Pytest)
```
tests/test_model_evals.py ......................                         [ 57%]
tests/test_metricas_avancadas_api.py ........                            [ 78%]
tests/test_fase6_paginas.py ........                                     [100%]
============================= 38 passed in 4.96s ==============================
```

### 2.3 Auditoria Relacional (12 Regras)
- **Gols Numéricos Nulos:** OK (0 ocorrências)
- **Padronização de Formato de Data (ISO YYYY-MM-DD):** OK (0 ocorrências)
- **Gols Órfãos:** OK (0 ocorrências)
- **Odds Órfãs:** OK (0 ocorrências)
- **Nomes de Clubes Mandante/Visitante Válidos:** OK (0 ocorrências)
- **Coerência Lógica de Vencedor vs Placar:** OK (0 ocorrências)
- **Jogos Duplicados:** OK (0 ocorrências)
- **Gols Atribuídos a Times com Placar Zero:** OK (0 ocorrências)
- **Atletas Artilheiros sem Posição:** OK (0 ocorrências)
- **Coerência de Clube em Gols vs Escalação:** OK (0 ocorrências)
- **Coerência de Atletas (Médias Verossímeis <= 2.5):** OK (0 ocorrências)
- **Coerência de Clubes Recentes em Escalações:** OK (0 ocorrências)
- **Inconsistências Encontradas:** **0**
- **Inconsistências Reparadas:** **0**

### 2.4 Build do Frontend
- 1.624 módulos transformados pelo Vite v5.4.21.
- Chunks criados sob demanda (`React.lazy`):
  - `CoachProfileView-BTYPCgdv.js`: 15.65 kB (gzip: 3.74 kB)
  - `CompetitionDetailView-BMuZIXWC.js`: 18.15 kB (gzip: 3.81 kB)
  - `RefereeScoutView-B0-ord1B.js`: 34.11 kB (gzip: 6.71 kB)
  - `CoachCompareView-BmtU_SN-.js`: 22.18 kB (gzip: 5.02 kB)
  - `TournamentStatsView-CfvoD5xU.js`: 14.75 kB (gzip: 3.29 kB)

---

## 3. URLs e Rastreabilidade

- **Repositório:** [https://github.com/LeoBorba12/Scrapper-br](https://github.com/LeoBorba12/Scrapper-br)
- **Pull Request #2:** [https://github.com/LeoBorba12/Scrapper-br/pull/2](https://github.com/LeoBorba12/Scrapper-br/pull/2)
- **Commit em Main:** [`61b53e1ef6722bb1cd80da50d28f1c828a3ad306`](https://github.com/LeoBorba12/Scrapper-br/commit/61b53e1ef6722bb1cd80da50d28f1c828a3ad306)
