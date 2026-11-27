# Metodologia Estatística & Econométrica — FutStats

Este documento explica, de forma transparente e didática, como a **FutStats** transforma dados brutos de mais de **115.257 partidas** e **117.529 gols** em rankings confiáveis de atletas, clubes e probabilidades de mercado.

---

## 1. Por que não usar apenas somas brutas?
Comparar jogadores apenas por "total de gols" ou "média simples por jogo" gera duas distorções clássicas:
1. **Viés de minutagem:** um jogador que atuou 2.500 minutos naturalmente acumula mais ações do que alguém que atuou 900 minutos.
2. **Viés de amostra pequena:** um reserva que entrou em 2 jogos e marcou 2 gols teria média de `1,00 gol/90 min`, superando artificialmente titulares consistentes da temporada inteira.

Para corrigir isso, todas as métricas avançadas da FutStats são normalizadas **por 90 minutos (p90)** e ajustadas por **Empirical Bayes**.

---

## 2. Empirical Bayes Shrinkage (Encolhimento Bayesiano)
Aplicamos o estimador de **Empirical Bayes** sobre as taxas por 90 minutos (`npxG/90`, `xA/90`, `SCA/90`, `GCA/90` e `Passes Progressivos/90`):

$$\hat{\theta}_{i,m} = \frac{\text{min}_i \cdot \text{taxa}_{i,m} + k \cdot \mu_{\text{pos},m}}{\text{min}_i + k}$$

- **$\text{taxa}_{i,m}$:** taxa observada do atleta $i$ na métrica $m$ por 90 minutos.
- **$\mu_{\text{pos},m}$:** média real da posição (ponderada por minutos) na liga.
- **$k$ (Prior de minutos):** peso da âncora estatística — padrão **$k = 450$ minutos** (5 jogos completos) ou modo conservador **$k = 900$ minutos** (10 jogos).

**Na prática:** quem jogou poucos minutos tem sua taxa "puxada" suavemente para a média da posição; conforme acumula minutos, o desempenho próprio domina a estimativa.

---

## 3. Índice Composto por Função Tática (Z-Score & Percentil)
Não faz sentido avaliar um zagueiro com a mesma régua de um centroavante. Por isso:
1. Cada atleta é comparado **apenas contra atletas da mesma macro-posição** (`Atacante`, `Meia`, `Defensor`, `Goleiro`).
2. Calculamos o **Z-Score** (quantos desvios-padrão o atleta está acima ou abaixo da média da posição) em cada métrica ajustada.
3. Aplicamos pesos específicos por função (ex.: **Atacante** prioriza `npxG` 35%, `GCA` 25%, `SCA` 20%; **Meia** prioriza `xA` 30%, `SCA` 28%, `Passes Prog.` 22%; **Defensor** prioriza `Passes Prog.` 45%, `SCA` 22%).
4. O Z-Score composto é convertido para o **Score FutStats (0 a 100)** junto com o **Percentil da Posição** e o selo de **Confiança Amostral** (`Inicial`, `Média`, `Alta`).

---

## 4. Power Ranking & Eficiência de Clubes
Para clubes da Série A 2026, avaliamos tanto o resultado quanto o processo em campo:
- **xPTS (Expected Points):** pontos esperados a partir da qualidade das chances criadas e cedidas.
- **Delta xPTS (`Pontos Reais − xPTS`):** mede se o clube está pontuando acima do esperado (*Eficiência / Sorte*) ou abaixo (*Subvalorizado*).
- **Power Score Composto (0–100):** combina **xPTS (45%)**, **Saldo de xG (30%)**, **Field Tilt / Domínio Territorial (15%)** e **PPDA invertido / Intensidade de Pressão (10%)**.

---

## 5. Probabilidades, Dixon-Coles e Gate de Quarentena de Odds
- **Modelo de Gols:** Distribuição **Poisson Bivariada com correção de Dixon-Coles (1997)** para placares baixos (`0–0`, `1–0`, `0–1`, `1–1`), unificada entre o **Hub** e o **Raio-X** com a mesma ponderação de mando.
- **Gate de Qualidade de Odds:** Só recebem selo **Consenso Aprovado** mercados 1X2 com margem implícita entre `0%` e `15%` e sem padrões sintéticos/placeholder (como empate cravado em `3.25` ou template padrão `2.10 / 3.20 / 3.50`), que entram automaticamente em **Quarentena Técnica**.
- **Gestão de Banca:** Critério de **1/4 Kelly** calibrado sobre a probabilidade justa do modelo.

---

## 6. RAPM (Regularized Adjusted Plus-Minus via Regressão Ridge)
Para isolar o impacto individual de um atleta independentemente de jogar em um elenco dominante ou em um clube de menor investimento:
- Montamos a matriz de presença de titulares ($+1$ mandante, $-1$ visitante + intercepto de mando de campo) sobre as partidas do Brasileirão 2024–2026.
- Resolvemos a **Regressão Ridge (L2)** $\hat{\beta} = (X^T X + \alpha P)^{-1} X^T y$ sobre o saldo de gols da partida, penalizando apenas os coeficientes individuais (sem penalizar o efeito de mando).
- O resultado (`RAPM Gols/Jogo`) mede quantos gols de saldo líquidos o atleta agrega à equipe controlando por companheiros, adversários e mando.

