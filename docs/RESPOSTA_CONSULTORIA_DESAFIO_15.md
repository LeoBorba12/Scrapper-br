# FutStats — Resposta Técnica ao Desafio 15: Contenção de Capacidade e Incerteza Individual Calibrada

**Data:** 2026-11-04  
**Status do Banco:** **81,36 MB** (`PRAGMA journal_mode = DELETE`)  
**Meta de 84,0 MB:** **Atingida com folga de 2,64 MB**  
**Folga para o Teto Vercel (94,0 MB):** **12,64 MB**  
**Cold Storage:** 93.136 registros arquivados com SHA-256 verificado (`d3004dca7c...`)  
**Conformal Prediction:** 94,72% de cobertura empírica comprovada no holdout (18.363 previsões)  

---

## 1. Respostas Estratégicas Obrigatórias

### 1. Qual objeto consumiu o espaço que levou o banco a 0,14 MB do soft limit?
**Auditoria Forense de Capacidade:**  
A inspeção dos objetos do banco demonstrou que a causa-raiz não foi uma única tabela de futebol, mas sim uma **combinação de índices funcionais redundantes e materialização prematura**:

1. **Índice funcional em `partidas` (`idx_partidas_mes_dia`):**  
   Consumia **~3,20 MB** de páginas B-Tree para indexar `substr(data, 6, 5)` em 115.753 partidas (criado para um widget legado de efemérides).
2. **Índice composto redundante (`idx_partidas_data_visitante`):**  
   Consumia **~2,50 MB**, sendo 100% redundante frente aos índices ativos `idx_partidas_visitante_enxuto (visitante, data DESC)` e `idx_partidas_ano_data (ano, data DESC)`.
3. **Strings em `odds_ingestao_status` (Desafio 14):**  
   A adição das colunas de auditoria preencheu 15.955 linhas com textos longos repetidos, adicionando cerca de **~0,65 MB**.
4. **Tabela `backtest_dixon_coles`:**  
   Armazenava 6.121 partidas com 20 colunas de simulação, consumindo **~0,80 MB** no hot model.

**Ação de Descompressão Executada no Desafio 15:**  
- Remoção de `idx_partidas_mes_dia` e `idx_partidas_data_visitante` (-5,70 MB).
- Arquivamento de `backtest_dixon_coles` no cold archive e drop no hot db (-0,80 MB).
- Arquivamento e expurgo das 6.052 odds em quarentena de `odds_ingestao_status` (-0,65 MB).
- `VACUUM` comutado: o banco encolheu de **87,86 MB** para **81,36 MB** (redução líquida de **-6,50 MB**).

---

### 2. O intervalo atual mede incerteza da média da faixa ou da previsão individual?
**Diagnóstico Metodológico:**  
- O cálculo do Desafio 14 utilizava o Erro Padrão da Média da Proporção Observada:
  \[
  SE = \sqrt{\frac{\bar{y}(1-\bar{y})}{N}}
  \]
  Ele media **exclusivamente a incerteza epistêmica sobre a média de calibração da faixa** ($IC_{95\%}$ da proporção agregada). Para $N > 2.000$, essa margem encolhia para $\pm 1{,}86\%$, dando uma falsa impressão de que qualquer jogo individual possuía precisão cirúrgica de $\pm 2\%$.
- Para um jogo individual, o desfecho é uma variável binária $y \in \{0, 1\}$. Apresentar um intervalo de $\pm 2\%$ como sendo a incerteza do jogo individual era metodologicamente incorreto.

**Implementação de Conformal Prediction no Desafio 15:**  
Adotamos o framework de inferência não-paramétrica **Conformal Prediction**:
\[
IC_{95\%}^{individual} \approx p \pm q_{0{,}95}(|y - p|)
\]
Onde o score de não-conformidade $s = |y - p|$ foi calibrado na validação de 2023 ($N = 6.573$) e validado no holdout 2024–2026 ($N = 18.363$ desfechos):

| Faixa ($p$) | Amostra 2023 ($N$) | Quantil Conformal ($q_{0{,}95}$) | Cobertura Holdout (2024–2026) | Diagnóstico |
|---|---:|---:|---:|---|
| **0.00 – 0.20** | 838 | **0,8501** | **94,67%** | Zebras: quando vencem, o erro individual é alto |
| **0.20 – 0.30** | 2.127 | **0,7626** | **94,77%** | Faixa de equilíbrio e empates |
| **0.30 – 0.40** | 1.976 | **0,6888** | **94,57%** | Faixa típica de empates e jogos parelhos |
| **0.40 – 0.50** | 826 | **0,5900** | **94,84%** | Favoritos moderados |
| **0.50 – 0.60** | 542 | **0,5782** | **95,62%** | Favoritos expressivos |
| **0.60 – 1.00** | 264 | **0,6845** | **93,19%** | Super favoritos |
| **GLOBAL** | — | — | **94,72%** | **Meta Conformal atingida no Holdout (≥ 94.5%)** |

Ambas as métricas agora são explicitadas: a incerteza conformal individual ($q_{95}$) e o erro padrão da calibração média da faixa.

---

### 3. Por que manter um simulador de Kelly em um produto editorial?
**Resposta Categórica:**  
**Não havia justificativa para mantê-lo.** O Critério de Kelly ($f^* = \frac{bp - q}{b}$) foi desenvolvido exclusivamente para alocação ótima de capital sob risco em carteiras ou apostas esportivas.  
Em uma plataforma de **inteligência estatística, preservação histórica e modelagem probabilística descritiva**, uma calculadora de alocação de banca gerava dissonância cognitiva:
- Sugeria indiretamente ao usuário que ele deveria alocar recursos reais.
- Entrava em contradição direta com os achados científicos dos Desafios 10–13 (onde ficou provado que o Dixon-Coles não supera a Pinnacle closing e, portanto, alavancar banca com Kelly levaria à ruína financeira).

**Ações Executadas no Frontend:**  
1. O componente `KellyCalculatorModal.jsx` foi **deletado fisicamente**.
2. Todos os botões "Simulador de Stake (Kelly)" e "Calcular Stake de Kelly" foram expurgados de `ProbabilidadesView.jsx`.
3. As seções foram renomeadas editorialmente:
   - "Convergência de Valor" $\rightarrow$ **"Comparação Modelo x Mercado"**.
   - "Radar do Apostador" $\rightarrow$ **"Radar de Tendências"**.
   - "Apostas de Valor" $\rightarrow$ **"Divergência entre modelo e mercado"**.
4. O bundle compilado de `ProbabilidadesView` reduziu de **80,20 kB** para **66,45 kB** (-17%).

---

## 2. Telemetria de Verificação e Governança

- **Tamanho Hot DB:** **81,36 MB** (abaixo de 84,0 MB; folga de **12,64 MB** para o teto Vercel).
- **PRAGMA journal_mode:** `DELETE` mantido e validado.
- **Pytest:** 22/22 aprovados (`tests/test_model_evals.py`).
- **Data Auditor:** 12/12 regras consistentes (`scripts/auditar_integridade_dados.py`).
- **Cold Storage:** SHA-256 verificado (`d3004dca7c...`), 93.136 registros arquivados.
- **Vite Build:** Compilado com sucesso em 9.50s.
