# FutStats — Resposta Técnica ao Desafio 14: Reframe de “Apostas” para “Probabilidades” e Incerteza Calibrada

**Data:** 2026-11-04  
**Status do Banco:** 87,86 MB (`PRAGMA journal_mode = DELETE`)  
**Folga Vercel:** 6,14 MB para o teto de 94,0 MB (0,14 MB abaixo do soft limit de 88,0 MB)  
**Validação 2023:** 6.573 previsões avaliadas para calibração empírica de incerteza  
**Status do Frontend:** `BettingHubView.jsx` expurgado; `ProbabilidadesView.jsx` ativo  

---

## 1. Respostas Estratégicas Obrigatórias

### 1. Por que o componente central ainda se chamava `BettingHubView.jsx`?
**Diagnóstico Causa-Raiz:**  
O arquivo permaneceu com o nome original por **inércia de acoplamento técnico de frontend**, e não por divergência de produto. Durante o ciclo inicial do FutStats, a aba havia sido batizada como `BettingHubView.jsx` acompanhando endpoints legados (`/api/apostas/...`). No Desafio 13, alteramos os rótulos de navegação no `AppShell` para "Probabilidades", mas mantivemos o componente e os endpoints internos com os nomes legados para evitar quebras em cascata no router durante a contenção de capacidade do banco.

**Resolução Definitiva Executada no Desafio 14:**  
1. O arquivo `BettingHubView.jsx` foi **removido fisicamente** do repositório.
2. Criado `ProbabilidadesView.jsx` com export `ProbabilidadesView`, eliminando todos os termos de apostas/tipster ("Betting Cockpit" $\rightarrow$ "Painel de Probabilidades", "Apostas de Valor" $\rightarrow$ "Convergência de Valor", "Radar do Apostador" $\rightarrow$ "Radar Analítico de Tendências", "Calculadora de Kelly & Stake" $\rightarrow$ "Simulador de Alocação Matemática").
3. As rotas de backend foram padronizadas para `/api/probabilidades/...` (`/hub`, `/backtesting`, `/analise`, `/jogadores`, `/incerteza`), mantendo aliases transparentes apenas para compatibilidade legada.
4. O `AppShell.jsx` agora utiliza a chave canônica `id: 'probabilidades'`.
5. O build do Vite foi executado com sucesso gerando o chunk `dist/assets/ProbabilidadesView-D7myghbs.js`.

---

### 2. O intervalo ±2,5% é incerteza calibrada ou margem visual?
**Diagnóstico Causa-Raiz:**  
O valor de $\pm 2{,}5\%$ utilizado no Desafio 13 era uma **margem visual heurística (hardcoded)**, inspirada na ordem de grandeza do erro de arredondamento de Poisson, mas **não possuía sustentação estatística calibrada**. Tratar todas as probabilidades com a mesma margem fixa violava a microeconomia do mercado de probabilidades.

**Calibração Empírica Executada no Desafio 14:**  
Substituímos o valor estático por **incerteza empírica derivada estritamente da temporada de validação de 2023** ($N = 6.573$ desfechos 1X2 avaliados após calibração por temperatura $\tau^* = 0{,}84$).  
O intervalo de confiança de 95% foi calculado por faixa de probabilidade via Erro Padrão da Média da Proporção Observada ($\text{SE} = \sigma_{\bar{p}} = \sqrt{\frac{\bar{y}(1-\bar{y})}{N}}$):

\[
IC_{95\%} \approx p \pm 1{,}96 \cdot \sigma_{faixa}
\]

Os valores foram calculados e persistidos na tabela `faixas_incerteza_modelo`:

| Faixa de Probabilidade ($p$) | Amostra ($N$) | Proporção Obs. ($\bar{y}$) | Erro Padrão ($\sigma_{faixa}$) | Margem $IC_{95\%}$ Real | Diagnóstico |
|---|---:|---:|---:|---:|---|
| **0.00 – 0.20** | 838 | 0,168 | 0,0129 | **±2,53%** | Próxima da heurística original |
| **0.20 – 0.30** | 2.127 | 0,263 | 0,0095 | **±1,86%** | Faixa muito densa: incerteza real é menor que 2,5% |
| **0.30 – 0.40** | 1.975 | 0,321 | 0,0105 | **±2,06%** | Faixa típica de empates: incerteza real é menor |
| **0.40 – 0.50** | 826 | 0,450 | 0,0173 | **±3,39%** | Dispersão maior: incerteza real sobe |
| **0.50 – 0.60** | 543 | 0,580 | 0,0212 | **±4,16%** | Incerteza quase o dobro dos 2,5% fixos |
| **0.60 – 1.00** | 264 | 0,640 | 0,0295 | **±5,78%** | Super favoritos: incerteza real de quase ±6% |

**Conclusão Científica:**  
A heurística fixa de $\pm 2{,}5\%$ causava um erro duplo: **superestimava a incerteza em empates/mercados densos** (onde temos >2.000 amostras e incerteza de $\pm 1{,}86\%$) e **subestimava perigosamente a incerteza na ponta dos grandes favoritos** (onde a incerteza atinge $\pm 5{,}78\%$).  
Agora, cada estimativa calcula e exibe sua incerteza calibrada real. Se uma probabilidade pertencer a uma faixa com menos de 30 amostras, o sistema exibe `"Incerteza não calibrada"`.

---

### 3. Quantas odds em quarentena podem realmente ser recuperadas do cold archive?
**Auditoria Forense da Base Arquivada:**  
Cruzamos as 6.052 partidas com status `quarentena` em `odds_ingestao_status` com o acervo arquivado em `data/futebol_cold.db.gz` (`cold_odds_partidas`, 5.095 registros):

1. **Partidas sem correspondência no cold archive:**  
   - **5.519 partidas** (91,2%) sequer possuem registro de odds dentro de `futebol_cold.db.gz`.
2. **Partidas presentes no cold archive:**  
   - **533 partidas** (8,8%) possuem registro em `cold_odds_partidas`.
3. **Auditoria das 533 partidas presentes:**  
   - Inspecionamos as cotações arquivadas dessas 533 partidas.  
   - Em **100% dos casos**, as odds arquivadas são exatamente o mesmo feed bruto da ESPN com **empate sintético fixado em 3.25** e margens aberrantes entre **25,7% e 26,2%** (ex: Partida 20234011: H 1.23, D 3.25, A 7.15 $\rightarrow$ margem 26,06%).
   - As colunas de fechamento sharp (`odd_pinnacle_mandante`, `odd_pinnacle_empate`, `odd_pinnacle_visitante`) estão nulas (`None`) para todas essas 533 partidas.

**Resposta Categórica e Auditada:**  
**ZERO (0) odds em quarentena podem ser recuperadas a partir do cold archive atual.**  
O `futebol_cold.db.gz` arquivou o mesmo snapshot comprometido. Tentar reutilizá-lo para "corrigir" o hot db seria uma ilusão técnica que reintroduziria feeds sintéticos na base.

**Destino Operacional Implementado:**  
- Todos os 6.052 registros receberam:
  - `prazo_revisao = '2027-02-02'` (janela de 90 dias a contar de 2026-11-04).
  - `responsavel_auditoria = 'gate_auditor'`.
  - `origem_correcao = 'cold_arc'`.
- Como não há fontes de 3 vias reais no acervo interno, essas odds permanecerão em quarentena até o vencimento do prazo (2027-02-02), momento em que serão automaticamente migradas para status `descartado` por um job agendado, a menos que uma fonte externa fidedigna de 3 vias seja ingerida nesse período.

---

## 2. Indicadores de Governança e Verificação

- **Tamanho do Banco:** **87,86 MB** (abaixo de 88,0 MB soft limit e com 6,14 MB de folga para 94,0 MB Vercel).
- **PRAGMA journal_mode:** `DELETE` mantido e validado.
- **Pytest:** 22/22 testes de modelos aprovados (`pytest tests/test_model_evals.py`).
- **Auditoria de Dados:** 12/12 regras relacionais íntegras (`scripts/auditar_integridade_dados.py`).
- **Cold Storage:** SHA-256 verificado (`b4abaccc...`), 80.963 registros preservados.
- **Build Frontend:** Vite build compilado com sucesso em 12,71s (`dist/assets/ProbabilidadesView-D7myghbs.js`).
