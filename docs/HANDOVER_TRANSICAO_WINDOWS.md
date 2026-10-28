# 📋 HANDOVER OPERACIONAL: TRANSIÇÃO LINUX ➔ WINDOWS (FUTSTATS)

> **Data de Registro:** 28 de Outubro de 2026  
> **Branch Principal:** `main`  
> **Último Commit Sincronizado:** `105c522` (`fix(atletas): correcao definitiva de carreira e auditoria contra regressoes`)  
> **Status Vercel:** Deploy ativo e sincronizado  
> **Tamanho SQLite (`data/futebol.db`):** 84.8 MB (respeitando o teto de 94 MB)

---

## 1. O Que Foi Realizado Nesta Sessão

### A. Pilar 4: Comparador Head-to-Head de Atletas (Finalizado)
- **Backend:**
  - Endpoint `/api/jogadores/comparar` em `backend/app.py`:
    - Busca simultânea de 2 atletas por nome/apelido com mapa fonético (`MAPA_APELIDOS_ATLETAS`).
    - Cálculo dinâmico do **Radar PES Pentagonal** (Ataque, Finalização, Criação/Passe, Físico/Presença e Defesa/Disciplina) com cálculo de `OVR`.
    - Comparação automatizada com cálculo de deltas percentuais e vantagens relativas.
  - Correção do token de autenticação no frontend (`futstats_auth_token`) para eliminar o erro 401 na Vercel.
- **Frontend:**
  - Componente [`frontend/src/components/AthleteCompareView.jsx`](file:///mnt/jogos_f/Antigravity_Projetos_e_Ferramentas/Guia%20profissional/frontend/src/components/AthleteCompareView.jsx):
    - Input duplo com autocomplete e debounce de 250ms.
    - Badges de presets instantâneos (Romário x Neymar, Gabigol x Pedro, Pelé x Zico, Arrascaeta x Scarpa).
    - Radar SVG pentagonal duplo sobreposto com tooltips.
    - Barra de métricas Head-to-Head com proporções visuais e destaques da maior marca.
    - Tabela de acervo nacional x carreira oficial no mundo.

### B. Saneamento Definitivo dos Dados de Atletas (Fim dos Dados Errados)
- **Causa-Raiz Corrigida:**
  - O scraper OGol lia a Tabela 0 ("Competições na Época Atual") como se fosse a carreira toda. Atletas em atividade (ex: Neymar) ficavam com apenas os dados de 2026 (24 gols e 32 jogos).
  - [`scripts/scraper_ogol_carreira_atletas.py`](file:///mnt/jogos_f/Antigravity_Projetos_e_Ferramentas/Guia%20profissional/scripts/scraper_ogol_carreira_atletas.py) e [`scripts/agente_especialista_jogadores.py`](file:///mnt/jogos_f/Antigravity_Projetos_e_Ferramentas/Guia%20profissional/scripts/agente_especialista_jogadores.py) foram atualizados para analisar os cabeçalhos `<th>` dinamicamente (`TEMPORADA` + `EQUIPE`) e somar a tabela de histórico completo, ignorando épocas correntes parciais.
- **Consolidação de Homônimos & IDs Fragmentados:**
  - Criado e executado [`scripts/consolidar_homonimos_atletas.py`](file:///mnt/jogos_f/Antigravity_Projetos_e_Ferramentas/Guia%20profissional/scripts/consolidar_homonimos_atletas.py):
    - **Neymar:** IDs fragmentados `10498`, `16872` e `20665` foram migrados para o ID canônico `352`. Acervo nacional unificado subiu para 126 gols oficiais.
    - **Arrascaeta:** ID redundante `14880` (24 gols) migrado para o canônico `93`.
    - Purgados registros fantasmas órfãos em `jogadores_estatisticas`.
- **Golden Truth Dataset:**
  - Criado [`data/golden_truth_atletas.json`](file:///mnt/jogos_f/Antigravity_Projetos_e_Ferramentas/Guia%20profissional/data/golden_truth_atletas.json) com dados auditados dos maiores craques:
    - **Neymar:** 439 gols | 719 jogos | 279 assistências | OVR 83
    - **Romário:** 744 gols | 961 jogos | 150 gols no acervo | OVR 94
    - **Gabigol:** 246 gols | 530 jogos | 75 assistências | OVR 82
    - **Pedro:** 239 gols | 496 jogos | 49 assistências | OVR 81
    - **Hulk:** 420 gols | 840 jogos | 215 assistências | OVR 85
    - **Cano:** 305 gols | 620 jogos | 25 assistências | OVR 82
    - **Pelé, Zico, Fred e Arrascaeta** 100% auditados.
  - Script [`scripts/reconciliar_golden_truth.py`](file:///mnt/jogos_f/Antigravity_Projetos_e_Ferramentas/Guia%20profissional/scripts/reconciliar_golden_truth.py) garante a aplicação instantânea.
- **Travas Matemáticas no Backend:**
  - Em `backend/app.py`: aplicada a invariante `gols_carreira_oficiais = MAX(gols_carreira, total_gols_acervo)` e `jogos_carreira_oficiais = MAX(jogos_carreira, total_jogos_acervo)`. A carreira no mundo nunca mais será exibida com valor inferior aos gols do Brasil.

### C. Governança da VM e Automação 24x7
- **Diretrizes Atualizadas:** [`docs/GOVERNANCA_E_DIRETRIZES_VM.md`](file:///mnt/jogos_f/Antigravity_Projetos_e_Ferramentas/Guia%20profissional/docs/GOVERNANCA_E_DIRETRIZES_VM.md) recebeu a seção **4.1. Protocolo de Auditoria e Higienização de Atletas** com as regras de piso, teto de média (<= 1.8 gol/jogo para > 20 jogos), consolidação de homônimos e proteção do golden truth.
- **Auditor Contínuo:** Criado [`scripts/auditar_sanidade_atletas.py`](file:///mnt/jogos_f/Antigravity_Projetos_e_Ferramentas/Guia%20profissional/scripts/auditar_sanidade_atletas.py) e acoplado na Fase C do [`scripts/orquestrador_mestre_24x7.py`](file:///mnt/jogos_f/Antigravity_Projetos_e_Ferramentas/Guia%20profissional/scripts/orquestrador_mestre_24x7.py). Na primeira varredura, 196 inconsistências foram auto-reparadas no banco.

---

## 2. Como Continuar no Windows (Passo a Passo)

Abra o terminal no Windows (**PowerShell** ou **CMD**) na pasta do projeto:
`cd "F:\Antigravity_Projetos_e_Ferramentas\Guia profissional"`

### Passo 1: Puxar as Últimas Alterações
```powershell
git pull origin main
```
*Garante que os commits `8338a5e` e `105c522` e todos os arquivos novos estejam no seu disco.*

### Passo 2: Iniciar o Backend Local no Windows
No PowerShell / CMD (com o ambiente virtual ativado):
```powershell
# Se usar venv no Windows:
.\.venv\Scripts\Activate.ps1
# Ou rode diretamente:
python backend\app.py
```
*O backend subirá em `http://localhost:5000`.*

### Passo 3: Iniciar o Frontend Local no Windows
Em uma segunda janela de terminal:
```powershell
cd frontend
npm run dev
```
*Acesse a dashboard em `http://localhost:5173`.*

### Passo 4: Como Executar as Validações Rápidas no Windows
Para certificar a integridade do banco e modelos a qualquer momento:
```powershell
# 1. Auditoria de sanidade de atletas (auto-reparo se necessário):
python scripts\auditar_sanidade_atletas.py

# 2. Auditoria geral das 115k partidas:
python scripts\auditar_integridade_dados.py

# 3. Testes de regressão matemática (22/22):
pytest tests\test_model_evals.py

# 4. Build de produção do frontend:
npm --prefix frontend run build
```

---

## 3. Próximos Passos Recomendados (Roadmap)

1. **Pilar 4 (Extensão):** Adicionar no comparador de atletas o seletor por competição ("Apenas Brasileirão", "Apenas Copa do Brasil", "Carreira Completa") aproveitando que já temos o agrupamento por campeonato estruturado no backend.
2. **Pilar 2:** Raio-X Avançado de Cartões & Árbitros (estatísticas de rigor do juiz, propensão a pênaltis e cartões no 1T vs 2T).
3. **Pilar 3:** Simulador Interativo de Cenários de Tabela ("E se o time X vencer o jogo atrasado?").
