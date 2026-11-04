# FutStats — Resposta Técnica ao Desafio 12
## Protocolo Pré-Registrado de Avaliação e Gate de Qualidade de Odds

**Data:** 04 de Novembro de 2026  
**Status do Banco:** `data/futebol.db` em **87,04 MB**  
**Folga para o teto Vercel:** **6,96 MB** (teto 94,0 MB | soft limit interno 88,0 MB)  
**Protocolo Pré-Registrado:** Documentado e congelado em [`docs/PROTOCOLO_PRE_REGISTRADO_AVALIACAO.md`](file:///f:/Antigravity_Projetos_e_Ferramentas/Guia%20profissional/docs/PROTOCOLO_PRE_REGISTRADO_AVALIACAO.md)  
**Gate de Qualidade:** Módulo canônico implementado em [`backend/odds_quality_gate.py`](file:///f:/Antigravity_Projetos_e_Ferramentas/Guia%20profissional/backend/odds_quality_gate.py)  
**Integridade Relacional:** 12/12 regras aprovadas (`scripts/auditar_integridade_dados.py`)  
**Model Evals & Regression Gates:** 22/22 testes aprovados (`tests/test_model_evals.py`)  

---

## 1. Decisão Executiva e Diagnóstico Consolidado

A consultoria apontou com total precisão: o ROI de +2,34% obtido no Desafio 11 ainda continha **viés pós-hoc** (filtro de corte ad-hoc em odds $\le 4,50$) e **concentração artificial em empates** induzida por feeds com dados distorcidos.

Em cumprimento rigoroso ao Desafio 12, adotamos a disciplina quantitativa padrão-ouro:
1. **Implementação do Gate de Qualidade Microeconômico:** Rejeição objetiva de qualquer mercado 1X2 com margem implícita $< 0\%$ (arbitragem espúria) ou $> 15\%$ (feed corrompido / spread incompleto).
2. **Quarentena de Feeds:** **6.052 de 11.007 cotações** (55,0%) da tabela de consenso foram isoladas em quarentena por margens anômalas (média de 17,35%, picos de até 35%).
3. **Calibração de $\tau$ Estritamente em 2023:** O parâmetro térmico foi otimizado exclusivamente na validação de 2023 ($\tau^* = 0,84$) e congelado para a avaliação cega.
4. **Relatórios Independentes Pré-Registrados:** Separação completa entre a estratégia global 1X2 e a estratégia focada de empate, sem qualquer filtro subjetivo pós-hoc.

---

## 2. Gate de Qualidade de Odds e Quarentena

O módulo [`backend/odds_quality_gate.py`](file:///f:/Antigravity_Projetos_e_Ferramentas/Guia%20profissional/backend/odds_quality_gate.py) formalizou as regras de barreira de entrada pré-ingestão:

```python
def odd_valida(odd):
    return isinstance(odd, (int, float)) and 1.01 <= float(odd) <= 50.0

def mercado_1x2_valido(casa, empate, fora):
    if not all(odd_valida(o) for o in (casa, empate, fora)):
        return False, "ODD_FORA_DE_FAIXA", None
    margem = (1.0 / casa) + (1.0 / empate) + (1.0 / fora) - 1.0
    if margem < 0.0:
        return False, "MARGEM_NEGATIVA_ARBITRAGEM_ESPURIA", margem
    if margem > 0.15:
        return False, "MARGEM_PREDATORIA_OU_ERRO_EXTRACAO", margem
    return True, None, margem
```

### Auditoria do Acervo de Odds:
| Tabela | Total Linhas | Aprovadas no Gate ($0\% \le \text{margem} \le 15\%$) | Isoladas em Quarentena ($\text{margem} > 15\%$) |
|---|:---:|:---:|:---:|
| `odds_auditoria_sharp` (Pinnacle) | 4.941 | **4.941 (100,0%)** | **0 (0,0%)** |
| `odds_consenso_partida` (Nacional) | 11.007 | **4.955 (45,0%)** | **6.052 (55,0%)** |

> **Diagnóstico:** 100% das odds sharp da Pinnacle atendem naturalmente ao Gate de Qualidade. Por outro lado, 55% das odds de consenso nacional continham anomalias graves de extração (empates sintéticos a 3,25 adicionados a spreads de 2 vias da ESPN), sendo devidamente expurgadas da modelagem.

---

## 3. Calibração Cega de $\tau$ no Conjunto de Validação (2023)

O parâmetro $\tau$ do Temperature Scaling foi calibrado avaliando as 2.191 partidas da temporada 2023:

\[
p_k^{(\text{calib})} = \frac{\exp(z_k / \tau^*)}{\sum_j \exp(z_j / \tau^*)}
\]

| Configuração | Log Loss (Validação 2023) | Brier Score (Validação 2023) |
|---|:---:|:---:|
| $\tau = 1,00$ (Dixon-Coles Puro) | 1,0292 | 0,6184 |
| **$\tau^* = 0,84$ (Otimizado)** | **1,0275 (+0,16%)** | **0,6170 (+0,23%)** |

O valor **$\tau^* = 0,84$** foi congelado no manifesto [`docs/PROTOCOLO_PRE_REGISTRADO_AVALIACAO.md`](file:///f:/Antigravity_Projetos_e_Ferramentas/Guia%20profissional/docs/PROTOCOLO_PRE_REGISTRADO_AVALIACAO.md) e aplicado diretamente no holdout 2024–2026.

### Validação Cega no Holdout 2024–2026 (6.121 partidas):
- **Brier Score:** 0,6251 (Puro) $\rightarrow$ **0,6237** ($\tau=0,84$) — **Melhoria de +0,22%**
- **Log Loss:** 1,0392 (Puro) $\rightarrow$ **1,0378** ($\tau=0,84$) — **Melhoria de +0,13%**

---

## 4. Resultados da Avaliação Pré-Registrada (Holdout 2024–2026)

Conforme pré-registrado, foram avaliadas apenas partidas cujas odds foram aprovadas no Gate de Qualidade, sem qualquer teto artificial ou filtro a posteriori.

---

### RELATÓRIO A: Estratégia Completa 1X2 (Todas as Seleções Elegíveis)
Critério pré-registrado: Maior $+EV \ge 4\%$ dentre as seleções com odds válidas.

| Métrica | Resultado Pré-Registrado |
|---|:---:|
| **Partidas Qualificadas no Gate** | 291 |
| **Taxa de Acerto (Win Rate)** | 24,74% |
| **Lucro Acumulado** | -51,38 unidades |
| **ROI Geral 1X2** | **-17,66%** |

#### Decomposição por Seleção:
| Seleção | Apostas | Vitórias | Win Rate | Odd Média | Lucro (unid) | ROI (%) |
|:---:|---:|---:|---:|---:|---:|---:|
| **H** (Mandante) | 103 | 36 | 34,95% | 2,87 | -13,64 | -13,24% |
| **D** (Empate) | 58 | 17 | 29,31% | 3,71 | +6,50 | +11,21% |
| **A** (Visitante) | 130 | 19 | 14,62% | 5,03 | -44,24 | -34,03% |

---

### RELATÓRIO B: Estratégia Focada de Empate (D)
Critério pré-registrado: Apostas exclusivas na seleção de empate ($D$) que cumpram $+EV \ge 4\%$ no Gate de Qualidade.

| Métrica | Resultado Pré-Registrado |
|---|:---:|
| **Apostas em Empate (+EV $\ge$ 4%)** | 150 |
| **Taxa de Acerto (Win Rate)** | 22,67% |
| **Lucro Acumulado** | -21,42 unidades |
| **ROI Estratégia Empate** | **-14,28%** |

#### Decomposição por Temporada (Estratégia Empate):
| Temporada | Apostas | Vitórias | Win Rate | Lucro (unid) | ROI (%) |
|:---:|---:|---:|---:|---:|---:|
| **2024** | 145 | 32 | 22,07% | -23,22 | **-16,01%** |
| **2025** | 2 | 1 | 50,00% | +1,20 | +60,00% (amostra residual) |
| **2026** | 3 | 1 | 33,33% | +0,60 | +20,00% (amostra residual) |

---

### BENCHMARK SHARP REAL (Pinnacle Closing Line)
Avaliando as 282 apostas que possuíam linha de fechamento sharp da Pinnacle:

| Métrica | Benchmark Pinnacle Closing |
|---|:---:|
| **Apostas Auditadas** | 282 |
| **CLV Médio Auditado** | **-3,79%** |
| **Lucro Acumulado** | -55,38 unidades |
| **ROI Contra Fechamento Pinnacle** | **-19,64%** |

---

## 5. Conclusão Científica Honesta e Definitiva

Os resultados pré-registrados do Desafio 12 trazem uma resposta inequívoca:

1. **O Dixon-Coles puro NÃO bate o mercado moderno de apostas esportivas.**
2. Na estratégia completa 1X2, o ROI é de **-17,66%**.
3. Na estratégia focada de empate, o ROI é de **-14,28%**.
4. Contra o fechamento sharp da Pinnacle, o CLV médio é de **-3,79%** e o ROI é de **-19,64%**.
5. O suposto ROI de +2,34% obtido no Desafio 11 era um artefato residual de filtro ad-hoc (odds $\le 4,50$) sobre feeds que continham empates artificiais.
6. **O Dixon-Coles é um excelente modelo descritivo e de fair pricing**, mas a hipótese de eficiência de mercado se confirma: a margem de bookmakers (overround) consome modelos Poisson simples sem variáveis contextuais avançadas (lineups, lesões, motivação).

---

## 6. Respostas Diretas às Três Perguntas Estratégicas

### 1. Quantas odds de visitante acima de 5,00 foram aceitas sem validação contra mediana histórica?
**Resposta:** **7.288 odds de visitante** em `odds_consenso_partida` (66,2% do total) e **5.470 odds** em `odds_partidas` estavam acima de 5,00 sem qualquer validação de coerência. Dessas, **6.052 partidas violavam a margem microeconômica** ($\text{margem} > 15\%$), fruto de moneyline truncada ou spread incompleto. Com a criação do Quality Gate, todas as 6.052 odds foram isoladas em quarentena.

### 2. Por que apresentar valor de empate como capacidade geral do Dixon-Coles?
**Resposta:** **Não deve ser apresentado.** No Desafio 11, o filtro pós-hoc de teto de odd ($\le 4,50$) acabou selecionando quase que exclusivamente empates (93,5% das apostas), mascarando o fato de que a estratégia 1X2 geral estava negativa. No Desafio 12, separamos os relatórios: a estratégia completa 1X2 tem ROI de **-17,66%**, e a estratégia exclusiva de empate tem ROI de **-14,28%**. Não há valor intrínseco positivo generalizado.

### 3. O Temperature Scaling foi ajustado apenas na validação de 2023?
**Resposta:** **Sim, estritamente.** O parâmetro $\tau^* = 0,84$ foi calibrado exclusivamente nas 2.191 partidas da temporada 2023. Foi pré-registrado e congelado em [`docs/PROTOCOLO_PRE_REGISTRADO_AVALIACAO.md`](file:///f:/Antigravity_Projetos_e_Ferramentas/Guia%20profissional/docs/PROTOCOLO_PRE_REGISTRADO_AVALIACAO.md) antes de qualquer inferência sobre o holdout 2024–2026. A avaliação cega subsequente confirmou ganho tanto em Brier Score (0,6237 vs 0,6251) quanto em Log Loss (1,0378 vs 1,0392).

---

## 7. Conformidade de Engenharia e Capacidade

| Requisito | Limite / Meta | Valor Obtido | Status |
|---|:---:|:---:|:---:|
| **Tamanho do SQLite** | $< 88,0 \text{ MB}$ (soft) / $< 94,0 \text{ MB}$ (teto) | **87,04 MB** | APROVADO |
| **Folga de Armazenamento** | $> 5,0 \text{ MB}$ | **6,96 MB** | APROVADO |
| **SQLite Journal Mode** | Estritamente `DELETE` | `DELETE` | APROVADO |
| **Integridade Relacional** | 12 regras | 12/12 regras OK | APROVADO |
| **Model Evals (Dixon-Coles)** | 22/22 testes | 22/22 aprovados (0.61s) | APROVADO |
| **Cold Storage Checksum** | SHA-256 verificado | $100\%$ íntegro | APROVADO |
| **WCAG 2.2 AA Contrast** | 20/20 pares de cores | 20/20 aprovados | APROVADO |
| **Quality Gate Integrado** | Módulo reutilizável | `backend/odds_quality_gate.py` | APROVADO |
