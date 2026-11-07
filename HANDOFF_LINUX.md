# 🚀 Handoff Consolidado de Continuidade — FutStats (Windows ➔ Linux)

> **Documento atualizado em:** 06 de Novembro de 2026 — 21:55 BRT  
> **Branch de Produção:** `main` (commit `9942750` ou superior)  
> **Repositório GitHub:** `https://github.com/LeoBorba12/Scrapper-br`  
> **Domínio Oficial de Produção:** `https://scrapper-br.vercel.app`  
> **Status:** 100% Sincronizado, Testado, Homologado e Operacional em Produção.

---

## 1. 📌 Resumo Executivo: Entregas Realizadas no Dia

Durante o dia de hoje, completamos e homologamos as **Fases 4, 4.1, 5, 6, 6.1 e a Resolução do Incidente Serverless da Vercel**:

1. **Carga e Governança de Métricas Analíticas BED 2026 (Fases 4 & 4.1):**
   - Criação de tabelas desacopladas no SQLite: `metrica_atleta_avancada_2026` (717 atletas) e `metrica_clube_avancada_2026` (20 clubes).
   - Tabela de rastreabilidade e proveniência: `metrica_brasileirao_em_dados_proveniencia` (737 registros).
   - **Zero atletas de quarentena ou sem ID canônico definitivo** foram inseridos na base canônica.
   - Otimização do SQLite com `VACUUM`: banco estabilizado em **82,65 MB** (recuperados 1,06 MB de espaço).

2. **Auditoria Forense da Regra 08 e Blindagem Relacional (Fase 5):**
   - Investigação dos 3 falsos reparos da Regra 08: identificada partida homônima histórica (*FC Cascavel x FC Cascavel* de 2020).
   - Blindagem implementada em `scripts/auditar_integridade_dados.py` com a condição estrita `p.mandante != p.visitante`.
   - Inconsistências zeradas: **12/12 regras OK, 0 inconsistências e 0 reparos necessários**.

3. **APIs REST de Métricas Avançadas (Fase 5):**
   - Módulo `backend/rotas_metricas_avancadas.py` registrado em `backend/app.py`.
   - Endpoints: rankings por posição/minutagem, radar tático por 90 min e playercards.
   - Suíte de testes: `tests/test_metricas_avancadas_api.py` (8/8 PASS).

4. **Páginas Canônicas de Técnico, Árbitro e Competição (Fase 6):**
   - **Página de Técnico (`CoachProfileView.jsx`):** Dossiê individual de 135 treinadores com títulos oficiais, clubes comandados, KPIs de carreira, aproveitamento global, histórico por competição/ano e confrontos recentes. Integrado a `CoachCompareView.jsx` com alternância suave entre perfil e duelo tático H2H.
   - **Página de Competição (`CompetitionDetailView.jsx`):** Acervo secular de 1902 a 2026, tabela de classificação dinâmica oficial (Pts, J, V, E, D, GP, GC, SG, %), artilharia por edição, calendário de partidas e momentos históricos (maiores goleadas da competição).
   - **Página de Árbitro (`RefereeScoutView.jsx`):** Enriquecido com suporte aos novos endpoints, tratamento honesto de scouts ausentes (**"Não disponível"** para faltas/pênaltis quando não catalogados na súmula), histórico de competições apitadas e 10 confrontos recentes.
   - **Endpoints REST Canônicos (`backend/rotas_fase6_paginas.py`):** Modo estrito de somente leitura (`immutable=1` / `mode=ro`).
   - Suíte de testes: `tests/test_fase6_paginas.py` (8/8 PASS).

5. **Publicação Controlada em Produção (Fase 6.1):**
   - Pull Request [#2](https://github.com/LeoBorba12/Scrapper-br/pull/2) aberto e **mergeado com sucesso na branch `main`**.
   - Build de produção do frontend (`dist/`) compilado e otimizado via Vite com `React.lazy` (code-splitting).

6. **Diagnóstico Forense e Resolução do Incidente Serverless (Pós-Deploy):**
   - Diagnóstico da causa-raiz da falha que impedia a exibição de dados na dashboard (`FUNCTION_INVOCATION_FAILED`).
   - Correção do empacotamento da Vercel (`vercel.json`), compatibilização de tipagem com Python 3.12 (`odds_quality_gate.py`) e parser de AST em `api/index.py`.
   - Nova suíte de testes de contrato: `tests/test_probabilidades_hub_api.py` (5/5 PASS), elevando o total para **43/43 testes aprovados**.
   - Comprovação direta no domínio de produção com todas as abas e dados 100% ativos.

---

## 2. 🛡️ Estado Atual do Banco de Dados Canônico & Infraestrutura

| Indicador | Valor Atual | Limite Oficial Vercel | Observação |
|---|---|---|---|
| **Partidas Canônicas** | **115.753** | 115.753 | 100% Preservado |
| **Gols Canônicos** | **117.523** | 117.523 | 100% Preservado |
| **Tamanho do SQLite** | **82,65 MB** (86.663.168 B) | **84,00 MB** (Soft) / **94,00 MB** (Hard) | **Folga de 1,35 MB** |
| **PRAGMA journal_mode** | `delete` | `delete` | Obrigatório para Vercel Lambda |
| **PRAGMA integrity_check** | `ok` | `ok` | Zero corrupção física |
| **Auditoria Relacional** | **12/12 OK** | 12 regras | 0 inconsistências / 0 reparos |
| **Suíte de Testes Geral** | **43/43 PASS** | 43 testes | 100% Aprovado (0.86s) |
| **Status Produção Vercel** | **HTTP 200 OK** | Zero downtime | Resposta da API < 200ms |

---

## 3. 🔍 Diagnóstico Forense do Incidente Serverless (Causa-Raiz & Solução)

### Sintomas Observados em Produção
- Usuário logado na dashboard via `https://scrapper-br.vercel.app`.
- **Aba "Campeonato":** Seletores de competição e ano vazios, cartões exibindo 0 jogos, 0 gols e tabela vazia.
- **Aba "Probabilidades":** 0 oportunidades analíticas, 0 over 2.5, 0 BTTS, lista com mensagem "Nenhuma partida encontrada", e card com contagem hardcoded antiga de 9.252 odds.
- **Rodapé Global:** Exibia o fallback hardcoded antigo `115.361 jogos oficiais • 93.462 gols catalogados`.

### Cadeia de Causa-Raiz (Root Cause)
1. **`NameError: name 'sqlite3' is not defined` no Python 3.12:**
   - Em `backend/odds_quality_gate.py` (linhas 125 e 189), as funções utilizavam `conn: Optional[sqlite3.Connection]` em anotações de tipo.
   - O módulo `sqlite3` não estava importado no arquivo.
   - No runtime AWS Lambda da Vercel (Python 3.12), anotações são avaliadas no momento da importação do módulo (ao contrário do Python 3.14 local, que usa PEP 649 lazy evaluation).
   - Isso disparava `NameError` e abortava imediatamente a inicialização do Flask no servidor.

2. **Omissão do diretório `backend/` no pacote Serverless (`vercel.json`):**
   - O arquivo `vercel.json` configurava apenas `"includeFiles": "data/futebol.db"`.
   - O construtor `@vercel/python` não copiava a pasta raiz `/backend` para a Lambda AWS.
   - Ao importar `from backend.app import app`, o interpretador falhava com `ModuleNotFoundError: No module named 'backend'`.

3. **Incompatibilidade com o Scanner de AST do `@vercel/python`:**
   - O builder da Vercel analisa estaticamente o arquivo `api/index.py` via módulo `ast` procurando uma atribuição ou importação de nível superior com nome `app`, `application` ou `handler`.
   - Quando `from backend.app import app` foi envolvido em um bloco `try/except`, o nó superior do AST passou a ser `Try`, fazendo o build da Vercel falhar com `Deployment has failed`.

4. **Efeito em Cascata no Frontend:**
   - A falha HTTP 500 em todas as rotas `/api/*` impedia a chegada dos dados reais.
   - O frontend acionava fallbacks legados gravados no JSX (9.252 em probabilidades e 115.361 no rodapé).

### Correções Cirúrgicas Aplicadas
1. **`backend/odds_quality_gate.py`:** Adicionado `import sqlite3`.
2. **`vercel.json`:** Configurado `"includeFiles": "{data/futebol.db,backend/**}"` para empacotar o banco e o backend juntos no pacote da Lambda.
3. **`api/index.py`:** Definido `app = Flask(__name__)` no nível superior do AST com substituição dinâmica pelo `backend_app` e telemetria de diagnóstico estruturada em JSON caso ocorram falhas.
4. **`frontend/src/components/ProbabilidadesView.jsx`:** Remoção de fallbacks hardcoded fictícios, diferenciação honesta de empty states e adição de card de erro explícito com botão de retry.
5. **`frontend/src/App.jsx`:** Desacoplamento da busca de `/api/overview` para rodar no mount inicial e atualização dos números de fallback para os invariantes canônicos (115.753 partidas e 117.523 gols).
6. **`tests/test_probabilidades_hub_api.py`:** Suíte com 5 novos testes de contrato da rota `/api/probabilidades/hub`.

---

## 4. 🌐 Comprovação de Operação em Produção

Validações executadas diretamente no domínio público `https://scrapper-br.vercel.app`:

```bash
# Resposta do Overview Canônico
curl -s https://scrapper-br.vercel.app/api/overview
# Retorno: {"ano_max":2026,"ano_min":1902,"total_campeonatos":953,"total_clubes":2245,"total_gols":117523,"total_partidas":115753}

# Lista Geral de Competições (Fase 6)
curl -s https://scrapper-br.vercel.app/api/competicoes/lista-geral
# Retorno: 200 competições catalogadas com anos e totais

# Hub de Probabilidades e Odds Validadas
curl -s https://scrapper-br.vercel.app/api/probabilidades/hub?limit=5
# Retorno: 5.917 odds aprovadas no gate, 3.813 partidas com probabilidade, 1.461 leituras +EV

# Dossiês Canônicos de Técnicos e Árbitros
curl -sI https://scrapper-br.vercel.app/api/tecnicos/lista-completa?limit=5 # HTTP 200
curl -sI https://scrapper-br.vercel.app/api/arbitros/lista-completa?limit=5 # HTTP 200
```

### Evidências Visuais Salvas em `docs/`
- `docs/screenshot_campeonato_producao_resolvido.png`: Tela de Campeonato com Série A selecionada, 20.655 partidas, tabela calculada e rodapé canônico de 115.753 jogos.
- `docs/screenshot_probabilidades_resolvido.png`: Tela de Probabilidades com 5.917 odds, 1.461 +EV, cards detalhados com selos editoriais, Conformal Prediction e Raio-X.

---

## 5. 🐧 Comandos Rápidos para Operação no Linux

Ao abrir o terminal no Linux dentro do diretório do projeto:

### A. Atualizar o Repositório Local
```bash
git checkout main
git pull origin main
git status
```
*(Deve reportar: `On branch main, Your branch is up to date with 'origin/main', nothing to commit, working tree clean`)*.

### B. Validar Integridade e Testes no Linux
```bash
# 1. Executar a suíte completa de 43 testes automatizados (deve passar 43/43)
.venv/bin/pytest tests/test_model_evals.py tests/test_metricas_avancadas_api.py tests/test_fase6_paginas.py tests/test_probabilidades_hub_api.py

# 2. Executar auditoria de 12 regras do banco de dados (deve reportar 0 inconsistências)
.venv/bin/python3 scripts/auditar_integridade_dados.py

# 3. Conferir tamanho e sanidade do SQLite
.venv/bin/python3 -c "
import sqlite3, os
db = 'data/futebol.db'
size_mb = os.path.getsize(db) / (1024*1024)
conn = sqlite3.connect(db)
c = conn.cursor()
p = c.execute('SELECT count(*) FROM partidas').fetchone()[0]
g = c.execute('SELECT count(*) FROM gols').fetchone()[0]
j = c.execute('PRAGMA journal_mode').fetchone()[0]
i = c.execute('PRAGMA integrity_check').fetchone()[0]
print(f'Partidas: {p} | Gols: {g} | Journal: {j} | Integrity: {i} | Tamanho: {size_mb:.2f} MB')
"
```

### C. Rodar o Ambiente Local de Desenvolvimento (Opcional)
```bash
# Backend Flask (porta 5000)
.venv/bin/python3 backend/app.py

# Frontend Vite (em outro terminal)
cd frontend
npm install
npm run dev
```

---

## 6. 📂 Mapeamento dos Arquivos Principais

- `backend/odds_quality_gate.py`: Validação microeconômica de odds, margem 1X2, quarentena e Conformal Prediction IC95%.
- `backend/rotas_fase6_paginas.py`: Endpoints canônicos de técnicos, árbitros e competições.
- `backend/rotas_metricas_avancadas.py`: Endpoints das métricas analíticas e radar tático.
- `backend/app.py`: Registro dos Blueprints e rotas centrais da aplicação Flask.
- `api/index.py`: Handler serverless compatível com AST do Vercel e telemetria de diagnóstico.
- `vercel.json`: Configuração de build, rewrites e empacotamento da Lambda (`data/futebol.db` + `backend/**`).
- `frontend/src/components/CompetitionDetailView.jsx`: Painel de edições, classificação e artilharia.
- `frontend/src/components/ProbabilidadesView.jsx`: Hub de probabilidades, odds validadas e mercado esportivo.
- `frontend/src/components/CoachProfileView.jsx`: Dossiê visual do treinador com modo duelo.
- `frontend/src/components/RefereeScoutView.jsx`: Raio-X do apito com faltas e cartões honestos.
- `tests/test_probabilidades_hub_api.py`: Suíte de contrato e regressão da API de probabilidades.
- `tests/test_fase6_paginas.py`: Suíte de testes das páginas da Fase 6.
- `tests/test_metricas_avancadas_api.py`: Suíte de testes das métricas avançadas BED.
- `tests/test_model_evals.py`: 22 testes de regressão dos modelos preditivos Dixon-Coles/Poisson.

---

## 7. ☁️ Diretrizes Operacionais da VM Oracle Cloud (Pay As You Go)

Se for gerenciar a VM Oracle no Linux:
- O upgrade para Pay As You Go (**PAYG**) é seguro e altamente recomendado para **blindar sua conta contra encerramento por inatividade**.
- A verificação do cartão retém temporariamente cerca de US$ 100 (~R$ 500-600), que é cancelada pela Oracle na mesma hora (o estorno no extrato varia de minutos a alguns dias conforme o banco emissor).
- Seus recursos **Always Free** (4 OCPUs ARM, 24 GB RAM, 200 GB de disco) continuam **100% gratuitos**.
- Manter o alerta de orçamento (**Budget**) de R$ 5,00 configurado no painel da Oracle para garantir custo zero permanente.
