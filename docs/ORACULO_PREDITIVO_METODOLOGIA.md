# Guia Didático Completo — Oráculo Preditivo FutStats

Este guia explica, em linguagem acessível (mesmo para quem não tem formação em estatística), **como funciona o Oráculo Preditivo da FutStats**, **por que escolhemos cada metodologia** e — com transparência total — **quais são os pontos fracos e limitações de cada uma**.

---

## Como ler o Oráculo sem saber estatística?
O Oráculo **não tenta adivinhar o futuro nem cravar placares mágicos**. Em vez disso, ele funciona como a previsão do tempo: se o modelo diz **56% de vitória do Mandante**, significa que se esse mesmo jogo acontecesse **100 vezes**, o mandante venceria cerca de **56 vezes**, empataria cerca de **26** e perderia cerca de **18**.

---

## As 8 Metodologias do Oráculo (Explicação, Motivo e Pontos Fracos)

### 1. Pi-Ratings Dinâmicos (Casa e Fora)
- **Explicação didática:** É uma nota de força que cada time ganha e perde a cada partida — parecida com o ranking do xadrez (Elo), mas feita sob medida para o futebol: separa a força do time **em casa** e **fora**, e leva em conta o saldo de gols sem deixar uma goleada isolada distorcer tudo.
- **Por que usamos:** Nos benchmarks acadêmicos internacionais (*Soccer Prediction Challenge*), os Pi-Ratings são o indicador de força mais consistente para futebol.
- **Pontos fracos:** Reagem de forma gradual — se um clube reformular 8 titulares de uma vez na janela de transferências, o Pi-Rating leva algumas rodadas para refletir totalmente o novo patamar.

### 2. Matriz Dixon-Coles (1997)
- **Explicação didática:** Transforma a expectativa de gols de cada time (ex.: `1.5 x 1.0`) em probabilidades para todos os placares possíveis (`0x0`, `1x0`, `2x1`, etc.), corrigindo um defeito clássico da estatística simples que subestimava empates de poucos gols (`0x0` e `1x1`).
- **Por que usamos:** É o padrão ouro mundial para gerar *Fair Odds* coerentes em 1X2, Over/Under e Ambas Marcam a partir do mesmo motor matemático.
- **Pontos fracos:** Parte da premissa de que os gols acontecem em ritmo estável; não antecipa eventos extremos dentro da partida, como uma expulsão aos 10 minutos ou um temporal que alaga o gramado.

### 3. Qualidade de Chances (`xG`, `xPTS`, `Field Tilt` e `PPDA`)
- **Explicação didática:** Em vez de olhar só quem ganhou no placar, mede **quem criou as melhores chances** (`xG`), quem dominou o campo de ataque (`Field Tilt`) e quem pressionou mais alto (`PPDA`).
- **Por que usamos:** No curto prazo, um time pode vencer jogando mal (sorte ou goleiro inspirado). O processo em campo prevê melhor os próximos jogos do que o resultado bruto do jogo passado.
- **Pontos fracos:** Não captura perfeitamente finalizadores muito acima da média nem a qualidade individual do goleiro adversário em poucas rodadas.

### 4. Desfalques via RAPM e WAR (da NBA e do Beisebol)
- **Explicação didática:** O **RAPM** usa Regressão Ridge sobre milhares de escalações para medir quantos gols de saldo um jogador realmente agrega ao time — descontando a ajuda dos companheiros e a força dos adversários. O **WAR** traduz isso em pontos na tabela ao longo do campeonato.
- **Por que usamos:** Permite simular **em 1 clique** o que acontece quando um craque está suspenso ou lesionado.
- **Pontos fracos:** Quando dois titulares jogam quase 100% das partidas juntos, o modelo tem mais dificuldade em separar exatamente quanto do mérito é de cada um (*colinearidade*). Além disso, mede apenas o impacto de quem começa como titular.

### 5. Fadiga de Calendário — *Rest Advantage* (da NBA)
- **Explicação didática:** Compara quantos dias cada clube descansou desde a última partida. Um time que jogou Libertadores na quarta-feira e entra em campo no sábado sofre desgaste físico real frente a um adversário que teve a semana livre.
- **Por que usamos:** É uma das variáveis contextuais mais comprovadas em esportes com calendário apertado como o Brasileirão.
- **Pontos fracos:** O modelo olha os dias entre jogos, mas não sabe automaticamente se o treinador escalou um time reserva para poupar titulares na partida anterior.

### 6. Incerteza (estilo Glicko-2 + Conformal Prediction)
- **Explicação didática:** Mostra o quanto o Oráculo confia na própria previsão (`Alta Confiança`, `Moderada` ou `Jogo Imprevisível`). Times recém-promovidos ou muito irregulares geram margem de incerteza maior.
- **Por que usamos:** Honestidade científica — evita vender falsa certeza em confrontos caóticos.
- **Pontos fracos:** A garantia estatística de cobertura vale para o **conjunto** de muitos jogos, nunca como certeza absoluta para uma partida isolada.

### 7. Prior Estrutural Econômico (Orçamento, SAF e IBGE)
- **Explicação didática:** Usa o porte financeiro do clube, modelo de gestão (`SAF`) e tamanho econômico da cidade-sede (PIB/população IBGE) como ponto de partida estrutural para prever o campeonato.
- **Por que usamos:** Na Economia do Esporte, folha salarial e receita explicam 60%–80% da tabela no longo prazo — evitando exageros nas primeiras rodadas.
- **Pontos fracos:** Dinheiro explica a média histórica, mas não impede crises internas em clubes ricos nem campanhas extraordinárias de clubes de orçamento enxuto (ex.: Mirassol ou Fortaleza).

### 8. Simulação Monte Carlo do Campeonato + Avaliação por RPS
- **Explicação didática:** Simula o restante do Brasileirão **1.200 vezes** para estimar probabilidades de **Título**, **G-4** e **Z-4**. E toda evolução do modelo é testada no passado (2024–2025) usando o **RPS (*Ranked Probability Score*)**, a régua acadêmica que mede se as probabilidades são realmente bem calibradas.
- **Por que usamos:** É a forma mais transparente de transformar força por jogo em chances reais de classificação final.
- **Pontos fracos:** A simulação só é tão boa quanto os parâmetros que entram nela — se um clube mudar drasticamente de patamar no meio do ano, o modelo precisa de novas rodadas para recalibrar.
