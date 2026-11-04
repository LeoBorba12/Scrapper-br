# FutStats — Protocolo Pré-Registrado de Avaliação de Modelos Preditivos (1X2)
## Documentação Formal e Congelamento de Parâmetros (Desafio 12)

**Data de Registro:** 04 de Novembro de 2026  
**Status do Protocolo:** CONGELADO (Pre-Registered)  
**Ambiente:** FutStats Analytics Engine (Dixon-Coles 1997 / Bivariate Poisson)  

---

## 1. Justificativa e Declaração de Metodologia

Para eliminar qualquer viés pós-hoc, p-hacking, overfitting ou filtragem oportunista de dados após observação de retornos financeiros, este protocolo pré-registra todos os hiperparâmetros, regras de elegibilidade, split temporal e métricas antes da execução cega final sobre o conjunto de teste (2024–2026).

---

## 2. Gate de Qualidade de Odds (Pré-Filtro Objetivo)

Toda cotação de mercado deve atender estritamente aos critérios microeconômicos de bookmakers antes de ser considerada para backtest:

1. **Faixa Plausível Individual:**
   \[
   1.01 \le \text{Odd}_k \le 50.0 \quad \forall k \in \{H, D, A\}
   \]
2. **Margem Implícita (Overround) Válida:**
   \[
   \text{Margem} = \left(\frac{1}{\text{Odd}_H} + \frac{1}{\text{Odd}_D} + \frac{1}{\text{Odd}_A}\right) - 1.0
   \]
   - **Regra:** $0.0000 \le \text{Margem} \le 0.1500$ ($0\%$ a $15\%$).
   - Rejeição imediata de margem $< 0\%$ (arbitragem espúria / erro de feed).
   - Rejeição imediata de margem $> 15\%$ (spread de 2 vias incompleto, moneyline truncada ou erro de raspagem).
3. **Quarentena:** Partidas com odds fora desse envelope são classificadas como `QUARENTENA` e expurgadas da suíte de backtest, sendo preservadas apenas para auditoria de feed.

---

## 3. Split Temporal Estrito e Zero-Leakage

- **Treino ($\le 2022$):** Acervo histórico utilizado para aquecimento das médias móveis de ataque e defesa dos clubes (últimos 20 jogos).
- **Validação ($2023$):** Conjunto exclusivo para otimização de calibração. O parâmetro térmico $\tau$ do Temperature Scaling foi calibrado minimizando o Log Loss exclusivamente em 2023, resultando no valor congelado:
  \[
  \tau^* = 0.84
  \]
- **Teste Cego ($2024–2026$):** Holdout intocado de 6.121 partidas. Nenhuma alteração de hiperparâmetro ou modelo é permitida durante ou após a avaliação deste conjunto.

---

## 4. Regras Operacionais de Execução do Backtest

1. **Mercado:** Exclusivamente 1X2 (Mandante, Empate, Visitante).
2. **Entradas por Partida:** No máximo 1 aposta por confronto.
3. **Critério de Entrada:** Seleção que maximizar o Valor Esperado Positivo ($+EV$), desde que:
   \[
   \text{Edge} = (p_k^{(\text{calib})} \times \text{Odd}_k) - 1.0 \ge 0.04 \quad (+4.0\%)
   \]
4. **Alocação de Capital:** Stake fixo unitário (1 unidade por aposta qualificada).
5. **Cálculo de Retorno Unitário:**
   \[
   \text{Retorno} =
   \begin{cases}
   \text{Odd} - 1.0, & \text{se a aposta for vencedora (GREEN)} \\
   -1.0, & \text{se a aposta for perdedora (RED)}
   \end{cases}
   \]
6. **Cálculo de CLV (Closing Line Value):**
   \[
   \text{CLV} = \frac{\text{Odd}_{\text{entrada}}}{\text{Odd}_{\text{fechamento\_pinnacle}}} - 1.0
   \]

---

## 5. Estratégias Analisadas Separadamente

Para evitar mascaramento de desempenho, reportaremos os resultados em dois relatórios autônomos:

- **Relatório A — Estratégia Completa 1X2:** Sem qualquer restrição de seleção ou teto ad-hoc de odd. Todas as seleções ($H, D, A$) aprovadas pelo Gate de Qualidade com $+EV \ge 4\%$ são apostadas.
- **Relatório B — Estratégia Focada de Empate (D):** Apostas exclusivas na seleção de empate ($D$) que cumpram $+EV \ge 4\%$ no Gate de Qualidade.

---

## 6. Métricas de Sucesso

- **Métricas Primárias:** Brier Score, Log Loss Multiclasse, ROI Geral (%).
- **Métricas Secundárias:** CLV Médio Auditado contra Pinnacle Sharp, Win Rate (%), Decomposição por Temporada.
