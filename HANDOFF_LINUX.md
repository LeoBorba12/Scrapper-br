# 🚀 Handoff de Continuidade — FutStats (Windows ➔ Linux)

> **Documento gerado em:** 06 de Novembro de 2026  
> **Branch de Produção:** `main`  
> **Repositório GitHub:** `https://github.com/LeoBorba12/Scrapper-br`  
> **Status:** 100% Sincronizado, Testado e Publicado em Produção.

---

## 1. 📌 Resumo Executivo: O que foi feito nesta sessão

Completamos e homologamos as **Fases 4, 4.1, 5, 6 e 6.1**:

1. **Carga e Governança de Métricas Analíticas (Fases 4 & 4.1):**
   - Criação de tabelas desacopladas no SQLite: `metrica_atleta_avancada_2026` (717 atletas) e `metrica_clube_avancada_2026` (20 clubes).
   - Tabela de rastreabilidade: `metrica_brasileirao_em_dados_proveniencia` (737 registros).
   - **Zero atletas de quarentena ou sem ID canônico definitivo** foram inseridos na base canônica.
   - Otimização do SQLite com `VACUUM`: banco estabilizado em **82,65 MB** (recuperados 1,06 MB de espaço).

2. **Auditoria Forense da Regra 08 e Blindagem (Fase 5):**
   - Investigação dos 3 falsos reparos da Regra 08: identificada partida homônima histórica (FC Cascavel x FC Cascavel de 2020).
   - Blindagem implementada em `scripts/auditar_integridade_dados.py` com `p.mandante != p.visitante`.
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

---

## 2. 🛡️ Estado Atual do Banco de Dados Canônico

| Indicador | Valor Atual | Limite Oficial Vercel | Observação |
|---|---|---|---|
| **Partidas Canônicas** | **115.753** | 115.753 | 100% Preservado |
| **Gols Canônicos** | **117.523** | 117.523 | 100% Preservado |
| **Tamanho do SQLite** | **82,65 MB** (86.663.168 B) | **84,00 MB** (Soft) / **94,00 MB** (Hard) | **Folga de 1,35 MB** |
| **PRAGMA journal_mode** | `delete` | `delete` | Obrigatório para Vercel Lambda |
| **PRAGMA integrity_check** | `ok` | `ok` | Zero corrupção |
| **Auditoria Relacional** | **12/12 OK** | 12 regras | 0 inconsistências |
| **Suíte de Testes Geral** | **38/38 PASS** | 38 testes | 100% Aprovado |

---

## 3. 🐧 Comandos Rápidos ao Iniciar no Linux

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
# 1. Executar a suíte completa de testes (deve passar 38/38)
python3 -m pytest tests/test_model_evals.py tests/test_metricas_avancadas_api.py tests/test_fase6_paginas.py

# 2. Executar auditoria de 12 regras do banco
python3 scripts/auditar_integridade_dados.py

# 3. Conferir tamanho e sanidade do SQLite
python3 -c "
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
python3 backend/app.py

# Frontend Vite (em outro terminal, se for testar alterações no front)
cd frontend
npm install
npm run dev
```

---

## 4. 📂 Mapeamento dos Arquivos Principais

- `backend/rotas_fase6_paginas.py`: Endpoints canônicos de técnicos, árbitros e competições.
- `backend/rotas_metricas_avancadas.py`: Endpoints das métricas analíticas.
- `backend/app.py`: Registro dos Blueprints e rotas centrais da aplicação.
- `frontend/src/components/CoachProfileView.jsx`: Dossiê visual do treinador.
- `frontend/src/components/CompetitionDetailView.jsx`: Painel de edições, classificação e artilharia.
- `frontend/src/components/RefereeScoutView.jsx`: Raio-X do apito com faltas/pênaltis honestos.
- `frontend/src/App.jsx`: Navegação com code-splitting entre os módulos.
- `docs/fontes_campos_fase6.md`: Dicionário completo de fontes e campos da Fase 6.
- `docs/validacao_fase6.md`: Relatório formal de homologação da Fase 6.
- `docs/relatorio_deploy_fase6_1.md`: Relatório de publicação e merge em `main`.

---

## 5. ☁️ Nota sobre a VM Oracle Cloud (Pay As You Go)
Se for gerenciar a VM Oracle no Linux:
- O upgrade para Pay As You Go (**PAYG**) é seguro e altamente recomendado para **blindar sua conta contra cancelamento/inatividade**.
- A verificação do cartão retém temporariamente cerca de US$ 100 (~R$ 500-600), que é cancelada pela Oracle na mesma hora (o estorno no extrato varia de minutos a alguns dias conforme o banco emissor).
- Seus recursos **Always Free** (4 OCPUs ARM, 24 GB RAM, 200 GB de disco) continuam **100% gratuitos**.
- Lembre-se apenas de criar o alerta de orçamento (**Budget**) de R$ 5,00 no painel da Oracle para garantir custo zero.
