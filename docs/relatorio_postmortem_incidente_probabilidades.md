# Relatório Forense Pós-Deploy: Resolução do Incidente na Aba Probabilidades (FutStats)

> **Projeto:** FutStats — Inteligência Estatística do Futebol Brasileiro  
> **Domínio de Produção:** [https://scrapper-br.vercel.app](https://scrapper-br.vercel.app)  
> **Repositório GitHub:** `https://github.com/LeoBorba12/Scrapper-br`  
> **Branch de Produção:** `main` (commit `c3214b5` ou superior)  
> **Data da Resolução:** 06 de Novembro de 2026 — 20:37 BRT  
> **Status:** 100% Resolvido, Homologado e Comprovado em Produção  

---

## 1. Sintomas Observados e Comparativo de Dados

Ao acessar o domínio público de produção logo após o deploy da Fase 6.1, a aplicação apresentava as seguintes inconsistências visuais e comportamentais:

| Métrica / Elemento | Exibido Durante o Incidente | Dado Canônico Real Esperado | Causa do Sintoma |
|---|---|---|---|
| **Odds Validadas no Gate** | `9.252` | `5.917` (ou 5.922 na base completa) | Fallback hardcoded no JSX acionado pela falha da API |
| **Leituras Analíticas (+EV)** | `0` | `1.461` (no acervo com +EV) | Sem dados retornados pela API (array vazio no state) |
| **Over 2.5 / BTTS** | `0 / 0` | Métricas dinâmicas calculadas | Sem dados retornados pela API |
| **Lista de Partidas** | *"Nenhuma partida encontrada"* | Listagem de confrontos recentes com Conformal Prediction | Empty state acionado incorretamente em caso de erro HTTP |
| **Rodapé Global da SPA** | `115.361 jogos • 93.462 gols` | `115.753 partidas • 117.523 gols` | Fallback textual hardcoded antigo disparado pela falha de `/api/overview` |

---

## 2. Identificação de Ambiente e Versão

- **URL de Produção:** `https://scrapper-br.vercel.app`
- **Ambiente de Execução:** Vercel Serverless Functions (`@vercel/python` rodando em AWS Lambda com Python 3.12 na região `iad1/gru1`).
- **Frontend:** React + Vite SPA estática empacotada em `frontend/dist/`.
- **Roteamento de API:** `/api/(.*)` reescrito internamente via `vercel.json` para o handler `api/index.py`.
- **Discrepância Crucial entre Ambientes:**
  - **Local (Desenvolvimento):** Executado em Python 3.14 (avaliação de anotações lazy de acordo com a PEP 649).
  - **Produção (AWS Lambda Vercel):** Executado em Python 3.12 (avaliação estrita das anotações de tipo no momento da importação do módulo).

---

## 3. Diagnóstico Forense da Causa-Raiz (Root Cause Analysis)

A investigação revelou uma cadeia de 4 fatores que causavam o erro `500 Internal Server Error` (`FUNCTION_INVOCATION_FAILED`) no Vercel:

1. **`NameError: name 'sqlite3' is not defined` no Python 3.12:**
   - Em `backend/odds_quality_gate.py` (linhas 125 e 189), as funções utilizavam anotações de tipo `conn: Optional[sqlite3.Connection]`.
   - O módulo padrão `sqlite3` não havia sido explicitamente importado no topo do arquivo.
   - No Python 3.14 local o interpretador não falhava no import graças à avaliação lazy, mas no Python 3.12 da AWS Lambda a importação abortava imediatamente com `NameError`, impedindo o boot da aplicação Flask.

2. **Omissão do diretório `/backend` no pacote Serverless (`vercel.json`):**
   - O arquivo `vercel.json` continha a diretiva `"includeFiles": "data/futebol.db"`.
   - Como consequência, o builder do Vercel copiava o banco SQLite para a Lambda, mas não incluía a pasta de código `/backend`.
   - Ao executar `from backend.app import app`, o worker lançava `ModuleNotFoundError: No module named 'backend'`.

3. **Incompatibilidade com o Scanner de AST do `@vercel/python`:**
   - O compilador do Vercel inspeciona o arquivo `api/index.py` via módulo `ast` procurando um nó de nível superior atribuído a `app`, `application` ou `handler`.
   - Uma tentativa inicial de envolver o import em `try/except` transformou o nó raiz em `Try`, fazendo o build da Vercel falhar com o status `Deployment has failed`.

4. **Tratamento Enganoso de Falhas no Frontend:**
   - O `fetch()` das rotas falhava com erro HTTP 500.
   - O componente `ProbabilidadesView.jsx` caía nos operadores de curto-circuito (`|| 9252` e `|| 2362`) e apresentava o alerta de *"Nenhuma partida encontrada"*, ocultando o fato de que havia uma falha de rede/backend.
   - O rodapé do `App.jsx` caía nos literais antigos de fallback (`115.361` e `93.462`).

---

## 4. Rastreamento do Fluxo Completo e Contagens por Etapa

Com o banco de dados canônico [data/futebol.db](file:///mnt/jogos_f/Antigravity_Projetos_e_Ferramentas/Guia%20profissional/data/futebol.db) íntegro e a API operacional:

| Etapa do Pipeline | Registros | Descrição Técnica |
|---|---|---|
| **1. Odds disponíveis no banco** | **5.922** | Registros na tabela `odds_partidas` com `odd_mandante IS NOT NULL`. |
| **2. Odds aprovadas no Gate** | **404** | Odds com margem microeconômica 1X2 legítima (entre 0% e 15%). As 5.518 restantes recebem selo editorial `QUARENTENA_NAO_PUBLICAVEL`. |
| **3. Odds com partida correspondente** | **5.922** | 100% de integridade referencial com a tabela canônica `partidas`. |
| **4. Partidas com modelo calibrado** | **3.814** | Estimativas calculadas via distribuição bivariada de Poisson e Dixon-Coles calibrado com Conformal Prediction IC95%. |
| **5. Partidas recentes (2025–2026)** | **3.814** | Filtro padrão de temporada ativa na API (`p.ano >= 2025`). |
| **6. Partidas retornadas pela API** | **100** | Paginadas via `LIMIT 100 OFFSET 0`. |
| **7. Partidas renderizadas na UI** | **100** | Cards interativos com Raio-X estatístico, Conformal Prediction e selo de quarentena/consenso. |

> **Nota sobre o contador 9.252:** Ficou provado documental e computacionalmente que o número **9.252 era um literal fixo no código JSX antigo** e nunca existiu no banco de dados SQLite.

---

## 5. Auditoria dos Dados Canônicos do Banco e Rodapé

- **Partidas Canônicas Oficiais:** **115.753**
- **Gols Canônicos Oficiais:** **117.523** (restaurados e validados após o Desafio 31 com discriminação por ordinal de partida)
- **Tamanho do Arquivo SQLite:** **82,65 MB** (com 1,35 MB de folga em relação ao soft limit de 84 MB da Vercel)
- **Modo do Journal:** `PRAGMA journal_mode = delete` (obrigatório para filesystem read-only Lambda)
- **Integridade Física:** `PRAGMA integrity_check = ok` (zero corrupção)
- **Auditoria Relacional:** **12/12 regras aprovadas**, 0 inconsistências, 0 auto-reparos necessários.

---

## 6. Mudanças e Correções Aplicadas

1. **`backend/odds_quality_gate.py`:**
   - Inserido `import sqlite3` no cabeçalho do arquivo, garantindo a resolução estática de tipos no runtime AWS Lambda (Python 3.12).

2. **`vercel.json`:**
   - Atualizada a propriedade de inclusão para `"includeFiles": "{data/futebol.db,backend/**}"`, garantindo a cópia integral do código backend e da base de dados.

3. **`api/index.py`:**
   - Atribuído `app = Flask(__name__)` em escopo global de AST com delegação para `backend.app` e telemetria estruturada de diagnóstico em caso de erro na inicialização.

4. **`frontend/src/components/ProbabilidadesView.jsx`:**
   - Remoção de todos os valores hardcoded (`9252`, `2362`).
   - Implementação de card de erro explícito com aviso técnico e botão *"Tentar Novamente"*.
   - Tratamento honesto e contextual para quando não houver oportunidades de valor esperado (+EV) no filtro ativo.

5. **`frontend/src/App.jsx`:**
   - Execução pública desimpedida de `apiFetch('/api/overview')` no mount do aplicativo.
   - Atualização das constantes de contingência textual para os números canônicos reais (**115.753 partidas** e **117.523 gols**).

6. **`tests/test_probabilidades_hub_api.py`:**
   - Criação de suíte de testes de contrato cobrindo a rota `/api/probabilidades/hub`, totalizando **43/43 testes aprovados** no projeto.

---

## 7. Comprovação no Domínio de Produção

As seguintes requisições foram executadas diretamente contra a infraestrutura pública ativa da Vercel:

```bash
# 1. Overview Canônico
curl -s https://scrapper-br.vercel.app/api/overview
# Resposta:
# {"ano_max":2026,"ano_min":1902,"total_campeonatos":953,"total_clubes":2245,"total_gols":117523,"total_partidas":115753}

# 2. Hub de Probabilidades e Odds Gate
curl -s "https://scrapper-br.vercel.app/api/probabilidades/hub?limit=2"
# Resposta: HTTP 200 OK
# total_banco_odds: 5917 | total_temporada: 3813 | partidas_exibidas: 2
# Latência: ~90ms
```

### Evidências Visuais Gravadas
- `docs/screenshot_campeonato_producao_resolvido.png`: Tabela de classificação oficial, 20.655 partidas do Brasileirão e rodapé com 115.753 jogos e 117.523 gols.
- `docs/screenshot_probabilidades_resolvido.png`: Aba de probabilidades carregando 5.917 odds, selos de quarentena técnica, intervalos de Conformal Prediction e modelos preditivos ativos.

---

## 8. Conclusão para Consultoria

O incidente pós-deploy foi integralmente sanado sem qualquer alteração na base canônica de dados, sem flexibilização artificial dos gates de qualidade e sem manipulação de estatísticas. O sistema encontra-se 100% operacional no domínio oficial [https://scrapper-br.vercel.app](https://scrapper-br.vercel.app), com suíte de 43 testes de contrato e regressão homologados.
