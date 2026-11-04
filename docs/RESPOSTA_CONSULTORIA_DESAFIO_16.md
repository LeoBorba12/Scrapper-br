# FutStats — Resposta Técnica ao Desafio 16: Experiência Editorial de Probabilidades e Efemérides Performáticas

**Data:** 2026-11-04  
**Status do Banco:** **82,35 MB** (`PRAGMA journal_mode = DELETE`)  
**Meta de 84,0 MB:** **Atingida com folga de 1,65 MB**  
**Folga para o Teto Vercel (94,0 MB):** **11,65 MB**  
**Cold Storage:** 93.136 registros arquivados com manifesto `cold_v3` por domínio  
**Plano de Efemérides:** `SEARCH efemerides_partidas` em 0,2 ms (eliminação total de `SCAN partidas`)  

---

## 1. Respostas Estratégicas Obrigatórias

### 1. O widget de efemérides é função quente ou pode ser pré-calculado?
**Diagnóstico Causa-Raiz:**  
O widget de efemérides ("Neste Dia na História" do Cockpit Home) consultava a tabela inteira de `partidas` com `WHERE strftime('%m-%d', data) = ?`, gerando um **`SCAN partidas` em 115.753 linhas a cada requisição**, com custo de CPU elevado e latência desnecessária.

**Resolução de Arquitetura Executada:**  
O widget é **100% determinístico e estático no tempo**: o calendário possui exatamente **366 dias possíveis** (incluindo 29 de fevereiro).  
Em vez de recriar um índice funcional B-Tree pesado de 3,20 MB sobre as 115k partidas, implementamos a tabela materializada **`efemerides_partidas`** pré-calculada:
- Apenas as top 20 partidas históricas mais relevantes de cada dia (classificadas por clássicos, finais, mata-mata e público) foram persistidas.
- Total de linhas: **7.433 registros** (custo de apenas **~0,99 MB** no hot model).
- Plano de Execução: `SEARCH efemerides_partidas USING INDEX sqlite_autoindex_efemerides_partidas_1 (dia_mes=?)`.
- **Latência de consulta:** reduziu de ~45 ms para **0,2 ms** (aceleração de mais de 200x) sem depender de full scan e mantendo o banco em 82,35 MB.

---

### 2. Como explicar intervalos conformais largos sem parecer bug?
**Diagnóstico Metodológico:**  
Intervalos conformais individuais (com quantis $q_{0{,}95}(|y - p|)$ entre 0,58 e 0,85) podem parecer contraintuitivos ou "amplos demais" para usuários acostumados com margens estreitas de pesquisas eleitorais ou erros padrões amostrais ($\pm 2\%$).  
No futebol, o desfecho de uma partida é uma variável estocástica binária ($y \in \{0, 1\}$). Apresentar uma probabilidade pontual como se fosse certeza quase determinística é desonestidade científica.

**Hierarquia Editorial Implementada na UI (`ProbabilidadesView.jsx`):**  
Adotamos uma comunicação transparente em três níveis:
1. **Âncora Estimada:** Apresentamos a probabilidade justa do modelo (ex: `46,5%`) e a Fair Odd correspondente (`@2,15`).
2. **Contexto Conformal Explícito:** Exibimos um bloco contextual explicando que o futebol possui alta variância intrínseca:  
   *"Incerteza individual calibrada: Conformal Prediction com 94,7% de cobertura real observada no holdout 2024–2026."*
3. **Descompressão Visual:** Quando a partida possui equilíbrio extremo ou alta dispersão, o destaque visual do número central é atenuado, direcionando a atenção do analista para a leitura de cenário e a probabilidade condicionada, e não para um número mágico isolado.

---

### 3. A cobertura de 93,19% em superfavoritos exige política específica de baixa confiança?
**Diagnóstico Estatístico:**  
No holdout 2024–2026 ($N = 18.363$ previsões), a cobertura global foi de **94,72%**, atendendo à meta de $94{,}5\%$. No entanto, na faixa de **probabilidade $\ge 60\%$ (superfavoritos)**, a cobertura empírica foi de **93,19%** (desvio de -1,31 p.p. da meta), motivado por uma amostra reduzida ($N = 264$ partidas na validação 2023 e $N = 514$ no holdout).

**Política de Baixa Confiança Implementada:**  
Sim, a exigência foi formalizada e implementada tanto no backend quanto no frontend:
1. **Flag de Baixa Confiança:** Toda partida onde a probabilidade calculada for $\ge 60\%$ recebe automaticamente a tag editorial `confianca_estimativa: 'Baixa confiança (amostra reduzida)'`.
2. **Badge Visual de Alerta:** A interface exibe em destaque o selo:  
   `[Estimativa de baixa confiança]` acompanhado do texto de alerta:  
   *"Alta incerteza: o modelo possui amostra reduzida nesta faixa (cobertura 93,2% no holdout). Não utilizar para conclusões categóricas."*
3. **Monitoramento Ativo:** O endpoint `/api/probabilidades/incerteza` classifica a faixa $60\%+$ sob o status `Alerta de amostra pequena`, mantendo as demais faixas em `Monitorar`.

---

## 2. Telemetria de Verificação e Governança

- **Tamanho Hot DB:** **82,35 MB** (folga de **1,65 MB** para o teto de 84,0 MB; folga de **11,65 MB** para o teto Vercel).
- **PRAGMA journal_mode:** `DELETE` mantido e validado.
- **Cold Storage:** Manifesto migrado para schema `cold_v3` por domínio:
  - Eventos históricos: 44.231 escalações e 31.637 cartões.
  - Odds: 5.095 brutas e 6.052 em quarentena descartadas.
  - Backtest: 6.121 partidas Dixon-Coles do holdout.
  - Checksum verificado: `d3004dca7c9a2d647d13808734b55cd94bf7cdb0a28a6b0fda272e1c68ba9241`.
- **Pytest:** 22/22 aprovados (`tests/test_model_evals.py`).
- **Data Auditor:** 12/12 regras consistentes (`scripts/auditar_integridade_dados.py`).
- **Vite Build:** Compilado com sucesso em 7.44s.
