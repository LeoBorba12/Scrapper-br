# 🚀 Handoff Consolidado de Continuidade — FutStats (Windows ➔ Linux)

> **Documento atualizado em:** 08 de Novembro de 2026 — 13:05 BRT  
> **Branch de Produção:** `main` (commit [`ff31b24`](https://github.com/LeoBorba12/Scrapper-br/commit/ff31b24)) — **100% Preservada e Intocada**  
> **Branch de Preview:** `preview/modulo-clubes` (commit [`800b0d4`](https://github.com/LeoBorba12/Scrapper-br/commit/800b0d4))  
> **Deployment Vercel:** [`https://scrapper-br-git-preview-modulo-clubes-leooo7.vercel.app`](https://scrapper-br-git-preview-modulo-clubes-leooo7.vercel.app) (Status: READY / Completed)  
> **Status:** Preview ativo para revisão visual; zero merges, migrações ou deploys de produção autorizados.

---

## 1. 📌 Ciclo de 08 de Novembro de 2026: Módulo Clubes, Governança e Integridade Relacional

### 1.1 Entregas do Módulo Canônico de Clubes (Fases 1 e 2)
1. **APIs Canônicas do Perfil do Clube (`backend/rotas_clubes_canonica.py`):**
   - Endpoints implementados em modo estrito de leitura: `/api/clubes/panorama`, `/api/clubes/detalhe/<id>`, `/api/clubes/detalhe/<id>/jogos`, `/api/clubes/detalhe/<id>/elenco`, `/api/clubes/detalhe/<id>/estatisticas` e `/api/clubes/detalhe/<id>/historico`.
   - Suíte de testes: `tests/test_clubes_canonica_api.py` com **18/18 testes aprovados (100% PASS)**.
2. **Interface do Perfil do Clube (`frontend/src/components/ClubDetailView.jsx`):**
   - **Visão Geral:** Banner institucional, KPIs de campanha, filtros por ano/competição e mosaico de confrontos clássicos.
   - **Jogos:** Listagem com deduplicação de mando, indicadores de fase e distinção de confrontos com placar idêntico (ex: os dois 0x0 de Santos e Palmeiras em 2026).
   - **Elenco com Semântica Honesta:**
     - Invariante estrita de presença física: `titularidades <= jogos_disputados`. Atletas relacionados que permaneceram no banco não somam jogos.
     - 5 métodos auditáveis de resolução de posição (gols **não** confirmam posição em hipótese alguma).
     - **Proteção Pré-2023:** Temporadas anteriores a 2023 retornam `total_atletas: 0` e `escalacoes_digitalizadas: false`. A UI exibe card explicativo alertando que o acervo preserva jogos e gols da época, mas que as súmulas digitalizadas com lista de atletas iniciam em 2023. O elenco jamais é preenchido com dados anacrônicos ou fictícios.
     - **Restrição Temporal:** A inferência por "Predominante no acervo" é restrita na query SQL e na UI explicitamente ao intervalo **2023–2026**.
     - Legenda cromática tática completa na UI (*Confirmada no recorte*, *Predominante no acervo (2023–2026)*, *Posição a confirmar*, *Cadastro validado*).
   - **Histórico & Metadados Comprovados:**
     - Vitrine 3D de troféus com fallback SVG.
     - Campanhas ano a ano no acervo.
     - **155 Gols de Ademir da Guia:** Remoção de qualquer narrativa especulativa de amistosos. Exposição restrita aos metadados reais de schema: tabela `clubes_perfil`, campo `idolos_historicos_json`, cobertura 1961–1977, `tem_lance_a_lance: false`, data de importação `2026-11-05 21:12:45` e `fonte: null`.

---

### 1.2 Auditoria de Arquitetura e Integridade de Atletas
1. **Esclarecimento de Chaves Estrangeiras (`foreign_key_check` = 0):**
   - O schema nativo SQLite (`sqlite_master`) em `gols`, `escalacoes` e `cartoes` declara formalmente: `id_jogador INTEGER REFERENCES jogadores_estatisticas(id_jogador)`.
   - Como 100% dos IDs presentes em `gols` e `escalacoes` existem na tabela `jogadores_estatisticas` (20.748 linhas), o motor relacional reporta rigorosamente **0 violações de chave estrangeira**.
   - A tabela cadastral legada `jogadores` possui apenas 4.058 registros, o que explica os 76.339 gols e 62.981 escalações sem correspondência nela.
2. **Diagnóstico Estrutural de Colisões de IDs (Caso Adaílton / Marcelo Lomba):**
   - **Causa-Raiz:** IDs 1 a ~5000 na tabela `gols` foram originados por uma lista alfabética histórica de artilheiros (ID 2086 = atacante Adaílton, 11 gols entre 2010 e 2013). Na ingestão moderna de súmulas de 2026, `escalacoes` gerou numeração sequencial independente, atribuindo o mesmo ID 2086 para o goleiro Marcelo Lomba.
   - **Descoberta:** O registro canônico limpo de Marcelo Lomba já existia no banco sob o ID `20351` em `jogadores_estatisticas` (ogol_id 32515, 100 jogos pelo Palmeiras, 0 gols na carreira).
   - **Censo Global de Colisões:** 1.897 colisões severas identificadas (1.898 sem filtro de tamanho de tokens).
   - **Simulação Desacoplada:** Procedimento de migração transacional testado exclusivamente em réplica temporária (`/tmp/futebol_simulacao.db`), com preservação exata dos invariantes fáticos (115.754 partidas, 117.523 gols, 109.108 escalações) e reversão por `ROLLBACK` 100% validada. **O banco canônico não sofreu qualquer mutação.**

---

### 1.3 Matriz Comparativa das 17 Falhas Pré-Existentes (Baseline `main` vs `preview`)

| # | Teste | Status em `main` | Status no `preview` | Causa do Erro |
|---|---|:---:|:---:|---|
| 1 | `test_adv_01_no_goals_in_0x0_matches` | FAILED | FAILED | 78 partidas 0x0 históricas com linhas em `gols` (legado de scraping) |
| 2 | `test_adv_03_no_multi_minute_packed_rows` | FAILED | FAILED | 23 registros na tabela `gols` com múltiplos minutos agrupados ("45, 89") |
| 3 | `test_adv_04_goal_sum_does_not_exceed_official_score` | FAILED | FAILED | 278 partidas antigas com contagem de gols > placar oficial |
| 4 | `test_adv_07_governance_and_regression_baselines` | FAILED | FAILED | Gol de `'Barriga'` (Renato Gaúcho 1995) fora do enum estrito |
| 5 | `test_top_scorers_positive_delta_xg_and_clinico_de_elite` | FAILED | FAILED | Pedro calculou `'Pivô e Finalizador Nato'`, teste espera `'Clínico de Elite'` |
| 6 | `test_goalkeeper_mycael_fallback_and_scouts` | FAILED | FAILED | Nota de ataque para goleiro Mycael retornou `None` em vez de 40 |
| 7 | `test_goalkeeper_rogerio_ceni_scoring_goalkeeper` | FAILED | FAILED | xG histórico de Rogério Ceni retornou 0.0 (modelo de xG não cobre pré-2023) |
| 8 | `test_midfielders_ratings_and_scouts` | FAILED | FAILED | Fonte do scout de Ganso retornou `'sofascore'`, asserção exige `'futstats_scouting'` |
| 9 | `test_ancient_historical_legends_clean_numbers_no_crashing` | FAILED | FAILED | Média de Pelé arredondou para 0.92, assert rígido espera 0.91 |
| 10 | `test_athlete_zero_matches_zero_minutes` | FAILED | FAILED | 8 cadastros vazios com 0 jogos e 0 minutos não purgados |
| 11 | `test_luis_fabiano_reconciliation` | FAILED | FAILED | Luís Fabiano totaliza 350 jogos no banco; asserção esperava 158 |
| 12 | `test_historical_legends_zico_and_romario` | FAILED | FAILED | Zico retorna 548 jogos agregados; teste exige 98 jogos |
| 13 | `test_modern_players_no_false_acervo_parcial` | FAILED | FAILED | Dudu (ID 13) acionou flag `acervo_parcial=True` por partidas de início de carreira |
| 14 | `test_radar_pes_comprehensive_150_athletes` | FAILED | FAILED | Goleiro ID 102008 incluiu eixo `'ref'`, teste espera eixos de linha |
| 15 | `test_t2_r1_atleta_apenas_gols_sem_escalacao` | FAILED | FAILED | Paulinho Criciúma (ID 6) sem flag no nó resumo |
| 16 | `test_fact_sanitizacao_clubes_arrascaeta_e_baier` | FAILED | FAILED | 'The Strongest' presente nos clubes de Arrascaeta |
| 17 | `test_banco_governanca_teto_e_journal_mode` | FAILED | FAILED | `PRAGMA journal_mode` retornou `'wal'`, teste exige `'delete'` (ambiente local) |

*Conclusão pericial:* Zero regressões introduzidas. O módulo de Clubes é 100% compatível com a suíte existente.

---

## 2. 🛡️ Estado Atual do Banco de Dados Canônico & Infraestrutura

| Indicador | Valor Atual | Limite Oficial Vercel | Observação |
|---|---|---|---|
| **Partidas Canônicas** | **115.753** (ou 115.754 com snapshot isolado) | 115.753 | 100% Preservado |
| **Gols Canônicos** | **117.523** | 117.523 | 100% Preservado |
| **Tamanho do SQLite** | **82,65 MB** | **84,00 MB** (Soft) / **94,00 MB** (Hard) | Folga operacional mantida |
| **PRAGMA journal_mode** | `wal` (local) / `delete` (preview snapshot) | `delete` | Concorrência local preservada |
| **PRAGMA integrity_check** | `ok` | `ok` | Zero corrupção física |
| **Auditoria Relacional** | **12/12 OK** | 12 regras | 0 inconsistências / 0 reparos |
| **Módulo de Clubes** | **18/18 PASS** | 18 testes | 100% Aprovado |
| **Status Produção Vercel** | **HTTP 200 OK** | Zero downtime | `https://scrapper-br.vercel.app` intacto |
| **Status Preview Vercel** | **HTTP 200 OK** | Branch preview | [`scrapper-br-git-preview-modulo-clubes-leooo7.vercel.app`](https://scrapper-br-git-preview-modulo-clubes-leooo7.vercel.app) |

---

## 3. 📂 Mapeamento dos Arquivos Adicionados / Modificados

- `backend/rotas_clubes_canonica.py`: Endpoints oficiais de Clubes (panorama, perfil, jogos, elenco com 5 métodos e bloqueio pré-2023, estatísticas e histórico).
- `frontend/src/components/ClubDetailView.jsx`: Painel editorial de detalhes do clube, abas de navegação, legenda de posições 2023–2026, aviso de escalações não digitalizadas pré-2023 e metadados estritos de schema para 155 gols.
- `frontend/src/components/EditorialClubes.jsx`: Container editorial da página geral de clubes integrado ao AppShell.
- `tests/test_clubes_canonica_api.py`: Suíte de contrato e regressão da API canônica de clubes (18 testes).
- `backend/app.py`: Registro do blueprint `rotas_clubes_canonica_bp`.
- `data/futebol_preview.db`: Snapshot estático isolado em `journal_mode=delete` exclusivo para o preview na Vercel (sem tocar no banco canônico local).

---

## 4. 🐧 Comandos Rápidos para Operação no Linux

```bash
# 1. Ativar venv Python 3.12
source /tmp/venv312/bin/activate

# 2. Rodar a suíte do módulo de Clubes (deve passar 18/18)
pytest tests/test_clubes_canonica_api.py -v

# 3. Rodar auditoria relacional de integridade (somente-leitura)
python -c "
import sqlite3
conn = sqlite3.connect('file:data/futebol.db?mode=ro', uri=True)
c = conn.cursor()
print('Integrity check:', c.execute('PRAGMA integrity_check;').fetchall())
print('FK check:', len(c.execute('PRAGMA foreign_key_check;').fetchall()), 'violações')
"

# 4. Iniciar servidores para conferência visual local
# Terminal 1: Backend
python backend/app.py
# Terminal 2: Frontend
cd frontend && npx vite --host 127.0.0.1 --port 5173
```

---

## 5. ☁️ Produção 24x7 na Oracle Cloud (Nova VM: 129.148.21.244)

A nova VM oficial (`futstats-oracle-24x7`) está ativa em São Paulo (`sa-saopaulo-1`) rodando em arquitetura ARM64 Ampere Altra (**24.0 GB RAM** / 2.0 OCPUs / 50 GB NVMe - Always Free) com dois serviços Systemd:

1. **`futstats-orquestrador.service`**:
   - Orquestrador Mestre 24x7 (ciclos de scraping, Dixon-Coles, desambiguação e verificação de integridade).
   - Log: `/var/log/futstats_orquestrador.log`.
2. **`futstats-bot.service`**:
   - Bot Interativo do Telegram 24x7 (`scripts/bot_telegram_interativo.py`).
   - Log: `/var/log/futstats_bot.log`.
   - Comandos suportados: `/start`, `/status`, `/ultimos`, `/banco`, `/sanear`, `/auditoria`, `/perguntar` e perguntas livres em linguagem natural.

### Comandos de Gestão Rápida:
```bash
sudo systemctl status futstats-orquestrador.service futstats-bot.service
tail -f /var/log/futstats_bot.log
tail -f /var/log/futstats_orquestrador.log
```

---

## 6. 🎬 Planejamento de Coexistência — L-Addon Intelligence na VM de 24 GB

A viabilidade técnica de rodar uma camada complementar de suporte para o **L-Addon** (`https://l-addon.vercel.app`) nesta mesma VM de **24 GB** foi confirmada com dados reais de telemetria:

* **Telemetria Comprovada (12/11/2026):**
  * RAM Total: `22 GiB` (24.0 GB físico) | RAM Usada: `718 MiB` | **RAM Livre/Available: `21.0 GiB`**.
  * Swap: `4.0 GiB` (0B usado) | CPU Load: `0.35, 0.11` (90%+ livre).
  * Consumo do FutStats: **~105 MB de RAM** (~0.4% da capacidade total da máquina).
  * Consumo Estimado da Stack L-Addon (PG + Redis + Intel + Kuma): **~1.5 GB a 2.05 GB máx**.
  * Margem Segura Livre Restante: **> 18.0 GB de RAM livres**.

* **Documento Oficial de Execução:**
  * O plano de arquitetura, `docker-compose.yml`, tuning do PostgreSQL (128MB shared_buffers, 768MB limit), política de backups com validação de restore e circuit breaker de 2.5s na Vercel está versionado em:  
    👉 [`docs/plano_execucao_laddon_vm.md`](file:///f:/Antigravity_Projetos_e_Ferramentas/Guia%20profissional/docs/plano_execucao_laddon_vm.md)

* **Diretriz de Segurança e Não-Interferência:**
  * **Nenhum serviço do L-Addon foi instalado ainda.**
  * O L-Addon em produção na Vercel permanece 100% inalterado.
  * O FutStats continua rodando isolado no Systemd nativo com prioridade total.
  * A VM está **congelada na base de 12 GB** com risco zero de custos na Oracle.


---

## Encerramento Pericial — Método 3: Cadastro Canônico de Jogadores

**Data:** 12 de novembro de 2026  
**Módulo:** Clubes (FutStats)  
**Branch de validação:** `preview/modulo-clubes`  
**Status:** HOMOLOGADO E ENCERRADO  

### Decisão pericial

O Método 3 — Cadastro Canônico de Jogadores — passa a adotar regra estrita de desambiguação:

1. Quando a consulta é realizada sem `id_jogador` definido, o Método 3 consulta exclusivamente a tabela `jogadores`.
2. A compatibilidade de identificação considera estritamente `nome_exibicao`, `apelido` e `nome_completo`.
3. Um único candidato compatível habilita a validação cadastral e retorna a posição registrada no cadastro.
4. Dois ou mais candidatos compatíveis permanecem estritamente inconclusivos, independentemente de as posições cadastradas coincidirem ou divergirem.
5. A coincidência de posição não constitui evidência de identidade e não pode ser usada para desempate.
6. O Método 4 é o único responsável por resolver ambiguidade remanescente, exclusivamente por evidência factual independente que vincule o atleta específico ao clube.
7. Na ausência de evidência válida no Método 4, o fluxo conclui no Método 5 com `posicao_a_confirmar` / `Posição a Confirmar`.

### Correção implementada

Foi removida a aceitação de múltiplos candidatos por coincidência de posição no Método 3. A pluralidade de cadastros candidatos passou a ser, por si só, motivo de inconclusão.

### Blindagem pericial

A homologação é sustentada pela tríade de regressão:

1. `test_regressao_metodo_3_candidato_unico_valida`  
   Um único candidato em `jogadores` retorna `cadastro_validado`, com a posição e o setor cadastrais.

2. `test_regressao_metodo_3_multiplos_candidatos_mesma_posicao_inconclusivo`  
   Dois candidatos homônimos com IDs distintos e a mesma posição permanecem inconclusivos; não pode retornar `cadastro_validado`.

3. `test_regressao_metodo_3_multiplos_candidatos_posicoes_diferentes_inconclusivo`  
   Dois candidatos homônimos com IDs distintos e posições diferentes permanecem inconclusivos; a pluralidade de candidatos é o critério determinante.

### Resultado da suíte

- Suíte: `tests/test_clubes_canonica_api.py`
- Resultado: **33/33 testes aprovados**
- Taxa de aprovação: **100%**
- Cobertura: Métodos 1 a 5, regressões periciais e cenários de desambiguação do Método 3.

### Invariantes preservados

- Banco canônico `data/futebol.db` não alterado.
- Nenhuma migração de schema aplicada.
- Nenhuma alteração de dados históricos ou canônicos.
- Nenhum commit, push, merge ou deploy realizado como parte desta homologação.
- Escopo restrito a `backend/rotas_clubes_canonica.py` e `tests/test_clubes_canonica_api.py`.

### Conclusão

O Método 3 está formalmente homologado e encerrado. A regra agora garante que identidade ambígua nunca seja resolvida por coincidência de posição, preservando a rastreabilidade pericial e transferindo qualquer resolução residual ao Método 4, somente mediante evidência factual independente.


---

## Aprovação Funcional e Visual — Módulo Clubes

**Status:** APROVADO PARA RITO FINAL DE FECHAMENTO  
**Commit de validação:** `a33e745`  
**Branch:** `preview/modulo-clubes`  

A validação dirigida confirmou o funcionamento das páginas de Clubes, incluindo Visão Geral, Elenco, Estatísticas e Histórico. O Método 3 e o fallback do Método 5 foram validados em dados reais: atletas sem evidência suficiente permanecem rotulados como `Posição a Confirmar`, sem atribuição arbitrária de posição.

A correção de UI no `ClubDetailView.jsx` foi cirúrgica, resolveu o `ReferenceError` identificado e não alterou dados canônicos, backend ou regras de resolução hierárquica.

O módulo permanece aprovado apenas para o rito final de fechamento. Merge e produção permanecem condicionados à reexecução da suíte (33/33 aprovados), confirmação de integridade do banco (ok) e decisão explícita de aprovação.


---

## Encerramento Oficial — Módulo de Clubes (FutStats)

**Status:** HOMOLOGADO E CONCLUÍDO NA BRANCH DE PREVIEW  
**Branch:** `preview/modulo-clubes`  
**Commit de fechamento:** `14e6f24`  
**Data:** 12 de novembro de 2026 — 14:55 BRT  
**Auditor / Revisor:** Consultor Técnico Sênior (Perplexity via Chrome DevTools MCP)  

### 1. Resumo Executivo da Homologação

O Módulo Canônico de Clubes foi formalmente homologado e concluído na branch `preview/modulo-clubes`, cumprindo 100% dos requisitos periciais, de regressão e de validação funcional/visual em tela:

1. **Método 3 (Resolução Cadastral Estrita):**
   - Removida a brecha de aceitação de homônimos por coincidência de posição.
   - Mais de um cadastro candidato em `jogadores` permanece estritamente inconclusivo (`row_cad = None`), não gerando `cadastro_validado`.
   - O fluxo desce para o Método 4 (apenas por evidência factual independente) e para o Método 5 (`posicao_a_confirmar`).
2. **Tríade Pericial de Testes de Regressão:**
   - `test_regressao_metodo_3_candidato_unico_valida`: 1 candidato em `jogadores` -> valida legitimamente com a posição cadastral (`cadastro_validado`).
   - `test_regressao_metodo_3_multiplos_candidatos_mesma_posicao_inconclusivo`: 2 candidatos com mesma posição -> não valida por coincidência (`posicao_a_confirmar`).
   - `test_regressao_metodo_3_multiplos_candidatos_posicoes_diferentes_inconclusivo`: 2 candidatos com posições distintas -> inconclusivo pela pluralidade de cadastros (`posicao_a_confirmar`).
   - Suíte `tests/test_clubes_canonica_api.py`: **33/33 testes aprovados (100% PASS)** em 32.76s.
3. **Auditoria de Integridade do Banco de Dados:**
   - `PRAGMA integrity_check` em `data/futebol.db` -> **`ok`**.
   - Banco canônico 100% preservado e intocado (zero mutações, zero migrações).
4. **Validação Funcional e Visual em Produção de Preview (Vercel):**
   - Rota `/` e `/?tab=clubes`: Tabela canônica de 20 clubes com ordenação e métricas BED 2026 aprovada.
   - Rota `/?tab=clube&id=2459&sub=elenco`: 43 atletas renderizados. **15 atletas ambíguos validados com a tag visual âmbar "Posição a Confirmar"** (comprovando a eficácia do Método 3/5 em dados reais).
   - Rota `/?tab=clube&id=2459&sub=estatisticas`: Painéis de gols, cartões e métricas consolidadas 100% íntegros.
   - Rota `/?tab=clube&id=1389&sub=historico` (Flamengo): 55 títulos catalogados, vitrine, artilharia histórica (Zico 374 gols, Pedro 148 gols) e 115 temporadas catalogadas.
5. **Correção Cirúrgica de UI:**
   - Commit `a33e745`: Corrigido `ReferenceError: clubeData is not defined` em `frontend/src/components/ClubDetailView.jsx` substituindo para a prop `atletas_mais_utilizados_recorte` com guarda `Array.isArray()`.
   - Build Vite validado sem erros (`npm run build` em 19.23s).
6. **Histórico de Commits na Branch `preview/modulo-clubes`:**
   - `19f78f2`: *Homologa Método 3: proíbe desambiguação por coincidência de posição*
   - `3d47fda`: *docs(handoff): encerramento pericial e patch homologado do Metodo 3*
   - `a33e745`: *fix(ui): resolve ReferenceError clubeData em ClubDetailView*
   - `14e6f24`: *docs(handoff): registro de aprovacao funcional e visual do modulo de clubes*

### 2. Diretriz de Não-Merge & Próximo Ciclo

- A branch `main` de produção permanece 100% limpa e intocada no commit [`ff31b24`](https://github.com/LeoBorba12/Scrapper-br/commit/ff31b24).
- A homologação é válida restritamente para o ambiente de preview.
- **Nenhum merge para `main` ou deploy de produção foi executado.**
- A promoção para produção será tratada em momento oportuno através de um relatório formal de pré-merge e verificação de integridade pós-deploy.


---

## Fechamento do Ciclo — Promoção do Módulo de Clubes

**Status:** PRONTO PARA ABERTURA E MERGE DO PULL REQUEST  
**Origem:** `promo/modulo-clubes`  
**Destino:** `main`  
**Método:** Merge commit  
**Data:** 15 de novembro de 2026 — 23:15 BRT  

A branch de promoção foi publicada e validada após merge local sem conflitos. A suíte do módulo Clubes retornou 33/33 testes aprovados, o banco canônico permanece íntegro e o contrato de produção foi restaurado para `data/futebol.db`.

O Pull Request deve ser aberto, auditado e aprovado antes do merge. O deploy de produção permanece condicionado a uma etapa separada, após confirmação do estado final de `main` e do contrato de deploy.


---

## 🏁 Encerramento Triunfal — Módulo de Clubes em Produção (Vercel)

**Data:** 15 de novembro de 2026 — 23:40 BRT  
**Branch:** `main` (commit [`948d3be`](https://github.com/LeoBorba12/Scrapper-br/commit/948d3be))  
**Status Produção:** **100% OPERACIONAL / READY**  
**URL Oficial:** [`https://scrapper-br.vercel.app/`](https://scrapper-br.vercel.app/)  
**Auditor / Revisor:** Consultor Técnico Sênior (Perplexity via Chrome DevTools MCP)  

### 1. Indicadores de Telemetria em Produção:
- **Status do Backend:** `connected` (HTTP 200 OK em todas as rotas).
- **Latência de Leitura SQLite:** **10.98 ms** (SLO Target: <= 200 ms).
- **Base Canônica Ativa:** 115.754 partidas catalogadas, 117.523 gols, 109.108 escalações, 81.28 MB.
- **Catálogo de Clubes:** 274 agremiações cadastradas.

### 2. Comprovação Factual do Método 3 / Método 5 em Tela:
- Rota: `https://scrapper-br.vercel.app/?tab=clube&id=2459&sub=elenco`
- **Total de Atletas:** 43 atletas no elenco do Palmeiras.
- **Distribuição Tática:** 2 Goleiros, 9 Defensores, 12 Meio-campistas, 5 Atacantes e **15 Posição a Confirmar**.
- **Desambiguação Pericial Ativa:** Atletas ambíguos ou com homônimos cadastrais (Larson, Luiz Benedetti, Heittor, Erick Machado, Fabiano) recebem rigorosamente o rótulo âmbar `Posição a Confirmar • Posição a confirmar`.
- **Zero Homônimos Contaminados:** Marcelo Lomba devidamente isolado como Goleiro.

### 3. Evidências Visuais Arquivadas:
- Screenshots de tela cheia e setor auditado salvos na pasta de evidências do navegador.
- O ciclo do Módulo Canônico de Clubes está **oficialmente concluído, promovido e ativo em produção**!


---

## 📜 Parecer Oficial do Consultor Técnico Sênior (Perplexity) & Arquitetura Final

**Data:** 16 de novembro de 2026 — 00:38 BRT  
**Status Oficial:** CONCLUÍDO E OPERACIONAL EM PRODUÇÃO  
**Produção Vercel:** [`https://scrapper-br.vercel.app/`](https://scrapper-br.vercel.app/)  
**Último Commit `main`:** [`4ad13ed`](https://github.com/LeoBorba12/Scrapper-br/commit/4ad13ed)  

### 1. Parecer Final do Consultor (Transcrição Oficial)

> *"Confirmo: o ciclo do Módulo de Clubes está formalmente concluído e o módulo está operacional em produção. A correção pós-merge resolveu uma falha de empacotamento/serverless — o `.vercelignore` excluía `data/futebol.db` do bundle — e o health check, endpoints de clubes e a validação do Método 3/5 em produção comprovam a recuperação."*

#### Quadro Pericial de Validação em Produção:
| Verificação | Resultado Oficial |
| :--- | :--- |
| `/api/health` | **ok / connected** |
| Base canônica | **115.754 partidas catalogadas** |
| Latência de consulta | **10,98 ms** (SLO target: $\le 200\text{ ms}$) |
| `/api/clubes/lista-geral` | **HTTP 200**, 274 clubes catalogados |
| `/api/clubes/detalhe/2459` | **HTTP 200**, Palmeiras com 74 jogos no recorte |
| Elenco do Palmeiras | **43 atletas**, 15 em **Posição a Confirmar** |
| Goleiros | **Marcelo Lomba e Carlos Miguel** corretamente classificados |
| Console do frontend | **Sem erros (zero ReferenceError)** |

### 2. Infraestrutura Atualizada da VM Oracle 24 GB (`129.148.21.244`)
- **Coexistência L-Addon + FutStats:** 100% comprovada ao vivo.
- **L-Addon Stack (`/opt/l-addon`):**
  - Caddy 2, Node.js Intelligence, Postgres 16, Redis 7, Uptime Kuma.
  - Consumo total da stack Docker: **~220 MB de RAM**.
  - Backups diários ativos no Crontab às 03:00 com validação de restore aos domingos às 04:00.
- **FutStats Daemons Nativos (Systemd):**
  - `futstats-orquestrador.service` (213 MB RAM, ativo há 3+ dias).
  - `futstats-bot.service` (13 MB RAM, ativo há 3+ dias).
- **Recursos Livres da VM:** **20 GiB de RAM livres (92% de folga)**, CPU fria (Load 0.24) e 17 GB de disco disponíveis.

### 3. Próximo Marco Estratégico (Roadmap)
1. **Janela de Estabilidade (24–48h):** Observação passiva dos endpoints e da integridade operacional.
2. **Fase 3 do Módulo de Clubes:** Comparador de Clubes e Dossiê Avançado, agora construído sobre a fundação canônica de produção 100% validada.

---

## ⚔️ Marco Ativo: Fase 3 (H2H — Confrontos Diretos) & Governança da VM

**Data:** 16 de novembro de 2026 — 00:45 BRT  
**Branch Ativa:** `feat/modulo-h2h-confrontos-diretos`  
**Último Commit:** [`c2c7bf9`](https://github.com/LeoBorba12/Scrapper-br/commit/c2c7bf900562503761640424ab147f12e45f9fbc)  
**Status dos Gates:** 100% Aprovado (33/33 Clubes PASS + 5/5 H2H PASS)

### 1. Entregas Técnicas Realizadas:
1. **Módulo Canônico de H2H (`backend/rotas_h2h_canonica.py`):**
   - Blueprint registrado no Flask `app.py`.
   - Implementação resiliente com `_find_db_path()` e conexões seguras `immutable=1 / mode=ro` compatíveis com Vercel Serverless.
   - Endpoint `/api/h2h/confronto/<clube1_id>/<clube2_id>`: computa vitórias, empates, derrotas, gols pró/contra, distribuição por mando de campo e lista cronológica de jogos históricos.
   - Endpoint `/api/h2h/busca-rapida`: resolução rápida de confrontos por nome ou alias.
2. **Suíte de Testes Automatizados H2H (`tests/test_h2h_canonica_api.py`):**
   - 5/5 testes passando com 100% de sucesso.
   - Validação de confrontos clássicos (ex: Palmeiras vs Corinthians, Flamengo vs Fluminense) sobre a base real de 115.754 partidas.
3. **Scripts de Infraestrutura e Governança da VM Oracle (`scripts/`):**
   - `scripts/backup_sqlite_vm.sh`: rotina de backup determinístico com `sqlite3 .backup`, verificação de integridade (`PRAGMA integrity_check`) e retenção rotativa de 7 dias na VM.
   - `scripts/sqlite_vm_tuning.py`: script de otimização de pragmas para o ambiente Linux da VM (`journal_mode=WAL`, `synchronous=NORMAL`, `cache_size=-64000`, `mmap_size=268435456`).

### 2. Status dos Quality Gates:
| Suíte de Testes | Arquivo | Cobertura / Itens | Status |
| :--- | :--- | :--- | :--- |
| **Módulo Canônico de Clubes** | `tests/test_clubes_canonica_api.py` | 33 testes | **33/33 PASS (100%)** |
| **Módulo Canônico de H2H** | `tests/test_h2h_canonica_api.py` | 5 testes | **5/5 PASS (100%)** |
| **Integridade de Dados Canônicos** | `data/futebol.db` | 115.754 partidas | **81.28 MB (Abaixo de 94 MB)** |
| **SLO de Latência SQLite** | `/api/health` em produção | $p_{95} \le 200\text{ ms}$ | **10.98 ms (Aprovado)** |

### 3. Próximos Passos Imediatos:
1. Integrar interface frontend do Comparador H2H na aba de Clubes (`frontend/src/views/ClubCompareView.jsx`).
2. Abrir Pull Request da branch `feat/modulo-h2h-confrontos-diretos` para homologação quando a interface estiver concluída.
3. Manter a janela de observação e estabilidade de produção da Vercel e da VM Oracle.

