# FutStats — Resposta Consultiva ao Desafio 28: Distribuição Temporal de Gols e Pré-Requisitos para Análise de Decisão

**Data:** 04 de novembro de 2026  
**Status do banco (`futebol.db`):** 80,95 MB  
**Folga para o soft limit (84 MB):** 3,05 MB  
**Folga para o teto Vercel (95 MB):** 14,05 MB  
**Golden Dataset:** 20 clubes, 721 atletas consolidados, 60.150 partidas analíticas  
**Métricas temporais:** 6 faixas de 15 minutos + acréscimos, normalização por minutos na faixa, separação de pênaltis  

---

## 1. Respostas Estratégicas às 3 Perguntas do Desafio

### Pergunta 1: A base atual registra o placar antes de cada gol?
> **Resposta Oficial:** **NÃO.**  
> A tabela canônica de súmulas (`gols`) registra `id_partida`, `atleta`, `id_jogador`, `clube`, `minuto`, `tempo` (1T/2T) e `tipo_de_gol` (Normal, Pênalti, Contra). **Não existe registro nativo do placar no exato instante anterior à finalização.**  
>
> **Implicação Editorial e Científica:**  
> Calcular um índice de "gol decisivo" ou "fator clutch" baseado puramente no minuto (ex.: gol aos 88 min) seria uma falsa ciência grave: um gol aos 88 min quando o jogo está 0x0 empata ou decide a vitória; um gol aos 88 min quando o placar já apontava 4x0 é mero encerramento protocolar. Conforme os princípios de Karpathy e a regra editorial de 2026 do FutStats: **ausência de contexto não é conclusão causal.** Índices preditivos ou causais de decisão permanecem bloqueados até que ocorra reconciliação completa com play-by-play lance a lance.

---

### Pergunta 2: A distribuição temporal será absoluta ou normalizada por minutos em cada faixa?
> **Resposta Oficial:** **AMBAS, com primazia da normalização por minutos jogados na faixa.**  
> A tabela `metrica_gols_temporais` armazena tanto a contagem absoluta (`gols_0_15` até `gols_76_90` e `gols_acrescimos`) quanto a taxa normalizada por 90 minutos de permanência do atleta em cada faixa específica:
>
> $$Gols\ por\ 90_{faixa} = \left(\frac{Gols_{faixa}}{Minutos_{faixa}}\right) \times 90$$
>
> **Por que isso é indispensável?**  
> 1. Atletas reservas que entram tipicamente aos 65–75 minutos têm 100% de seus minutos concentrados nas faixas finais (`61_75` e `76_90`). Se avaliados apenas pelo percentual de gols no fim, pareceriam "especialistas em gols tardios", quando na realidade tratava-se de mero viés de exposição.  
> 2. Titulares substituídos precocemente acumulam minutagem no 1T e quase nada na reta final. A normalização por faixa corrige as assimetrias táticas de substituição.

---

### Pergunta 3: Atletas com menos de 10 gols entram em rankings de gols tardios?
> **Resposta Oficial:** **NÃO.**  
> Amostras reduzidas geram anomalias estatísticas severas (ex.: um volante que marcou 1 único gol na carreira aos 85 minutos teria 100% de produção no final).  
> Estabelecemos uma escala rigorosa de maturidade amostral:
>
> | Faixa de Gols | Classificação de Amostra | Status na Plataforma | Regra de Exibição |
> |:---|:---|:---|:---|
> | **< 5 gols** | *Perfil Exploratório* (`amostra_minima = 0`) | Bloqueado de rankings | Visível apenas no perfil individual com aviso |
> | **5 a 14 gols** | *Sinal Fraco* (`amostra_minima = 1`) | Restrito | Sinal fraco, requer ressalva contextual |
> | **15 a 29 gols** | *Sinal Razoável* | Aprovado | Tendência temporal válida |
> | **30+ gols** | *Perfil Robusto* | Referência Editorial | Máxima autoridade estatística |
>
> Para figurar no **Ranking Editorial Definitivo de Gols Tardios (76–90 min)**, o atleta precisa ter **$\ge 15$ gols no acervo** e no mínimo **1.800 minutos jogados**.

---

## 2. Separação de Gols de Pênalti: Evitando Distorções no Perfil

Pênaltis representam ~15% a 18% dos gols na Série A e tendem a se concentrar no final de cada tempo (pressão final, cansaço dos defensores e lances na grande área). Atletas que são batedores oficiais concentram gols em acréscimos sem que isso signifique criação de jogo em velocidade.

Por isso, `metrica_gols_temporais` materializa:
- `gols_total`: soma total de gols
- `gols_abertos`: gols de bola rolando / jogada trabalhada
- `gols_penalti`: gols de pênalti (isolados do cálculo de letalidade aberta)

---

## 3. Top 10 Artilheiros no Golden Dataset com Distribuição Temporal

Valores extraídos diretamente de `metrica_gols_temporais` no banco auditado:

| Atleta | Clube | Total Gols | Bola Rolando | Pênaltis | 0–15 | 16–30 | 31–45 | 46–60 | 61–75 | 76–90 | Acrésc. | G90 Final (76–90) | Classificação Amostra |
|:---|:---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---|
| **Paulinho** | Atlético-MG | 34 | 32 | 2 | 4 | 4 | 6 | 3 | 5 | 8 | 4 | 5,58 | Robusto (30+ gols) |
| **Reinaldo** | Mirassol | 31 | 0 | 31 | 0 | 1 | 0 | 0 | 1 | 0 | 29 | 0,00 | Especialista Pênalti |
| **Gabriel Barbosa** | Santos | 21 | 19 | 2 | 3 | 2 | 4 | 5 | 2 | 4 | 1 | 1,20 | Razoável (15–29) |
| **Kevin Viveros** | Athletico-PR | 21 | 17 | 4 | 4 | 1 | 3 | 3 | 1 | 4 | 5 | 0,88 | Razoável (15–29) |
| **Pedro** | Flamengo | 20 | 20 | 0 | 5 | 2 | 1 | 4 | 4 | 3 | 1 | 0,69 | Razoável (15–29) |
| **Giorgian De Arrascaeta** | Flamengo | 17 | 16 | 1 | 1 | 3 | 1 | 3 | 4 | 4 | 1 | 1,56 | Razoável (15–29) |
| **Kaio Jorge** | Cruzeiro | 13 | 9 | 4 | 2 | 3 | 2 | 1 | 1 | 4 | 0 | 1,18 | Sinal Fraco (5–14) |
| **Carlos Vinícius** | Grêmio | 13 | 9 | 4 | 1 | 3 | 2 | 4 | 1 | 2 | 0 | 0,48 | Sinal Fraco (5–14) |
| **Flaco López** | Palmeiras | 12 | 11 | 1 | 3 | 1 | 1 | 3 | 1 | 2 | 1 | 0,64 | Sinal Fraco (5–14) |
| **Lucas Moura** | São Paulo | 12 | 10 | 2 | 2 | 2 | 1 | 2 | 2 | 3 | 0 | 0,81 | Sinal Fraco (5–14) |

*Observação Analítica:* Note o caso emblemático de **Reinaldo (Mirassol)**: 31 gols, todos de pênalti, concentrados nos acréscimos. Se não houvesse a decomposição entre bola rolando e pênalti, o sistema apontaria falsamente que o atleta é o finalizador mais letal dos minutos finais do futebol brasileiro.

---

## 4. Auditoria de Capacidade & Portões de Qualidade

| Item de Governança | Exigência | Resultado Obtido | Status |
|:---|:---|:---|:---:|
| **Tamanho do Banco** | $< 84,00\text{ MB}$ (soft limit) | **80,95 MB** | APROVADO |
| **Folga Teto Vercel** | $< 95,00\text{ MB}$ (hard limit) | **14,05 MB de folga** | APROVADO |
| **Modo de Journal SQLite** | `PRAGMA journal_mode = DELETE` | `delete` | APROVADO |
| **Suíte de Testes Automatizada** | 100% dos testes passando | **32/32 testes aprovados** (2,17s) | APROVADO |
| **Auditor de Integridade** | 12 regras relacionais | **12/12 regras em conformidade** | APROVADO |
| **Cold Storage Archive** | SHA-256 e integridade de restauração | **100% íntegro** (118.987 registros) | APROVADO |

---

## 5. Próximos Passos (Transição para Desafio 29)
Com a materialização temporal consolidada e protegida contra falsos índices clutch, o acervo do FutStats dispõe agora de:
1. Núcleo Canônico de Entidades consolidado.
2. Dossiê Total de 20 Clubes com 100% de SLA.
3. Produção Ofensiva por 90 decomposta (titular/reserva, pênaltis/abertos, dependência em campo).
4. Distribuição Temporal normalizada em 6 faixas de 15 minutos com guardrail causal.
