# Padrões Reutilizáveis de Engenharia (Patterns) - FutStats

## P1: Escudos dos Clubes com Fallback Inteligente
- **Arquivo**: `frontend/src/components/ClubBadge.jsx` e `frontend/src/utils/clubData.js`
- **Padrão**: Tenta carregar o escudo vetorial oficial via Wikimedia CDN. Em caso de falha de conexão, erro 404 ou clube sem imagem, faz fallback imediato e gracioso para monograma tipográfico vetorial nas cores oficiais do clube.

## P2: Calibração de Probabilidades Dixon-Coles
- **Arquivo**: `backend/app.py` -> `_calc_poisson_bivariate`
- **Padrão**:
  $$\tau(0,0) = 1 - \lambda \mu \rho, \quad \tau(1,1) = 1 - \rho, \quad \tau(0,1) = 1 + \lambda \rho, \quad \tau(1,0) = 1 + \mu \rho$$
  Normalizar toda a matriz pelo somatório total para garantir $\sum P = 1.0$.

## P3: Deep Linking & Sincronização de Estado via URL
- **Arquivo**: `frontend/src/App.jsx`
- **Padrão**: Inicializa abas e entidades lendo `window.location.search` (`tab`, `c1`, `c2`, `atleta`) e reflete as mudanças com `window.history.replaceState` sem causar recarregamento da página.

## P4: Botões Inline no Telegram Bot
- **Arquivo**: `scripts/bot_telegram_interativo.py`
- **Padrão**: Envia `reply_markup` em JSON com arrays de `inline_keyboard` contendo `callback_data` e intercepta `item.get("callback_query")` no loop de polling, respondendo com `answerCallbackQuery` e disparando a ação correspondente.

## P5: Gates de Regressão Estatística e Avaliação Contínua
- **Arquivo**: `tests/test_model_evals.py`
- **Padrão**: Utiliza golden datasets parametrizados com cenários reais e de borda, validando:
  1. Axioma de partição da unidade ($\sum P = 1.0$) com tolerância para arredondamento de exibição.
  2. Bounded interval checks para odds justas: $Odd \in [\frac{100}{p + \epsilon}, \frac{100}{p - \epsilon}]$ contra probabilidades discretizadas.
  3. Strict gating de $+EV$: $EV > 0 \iff Odd_{mercado} > FairOdd$.

## P6: Governança de Contexto e Dados Legíveis (Regra de Ouro CLAUDE.md)
- **Origem**: Diretrizes de otimização de tokens do Projeto CraqueView
- **Padrão**:
  1. **Um Registro por Linha**: Datasets embutidos e arrays JSON analíticos no frontend ou scripts devem ser mantidos com 1 registro por linha, nunca minificados em linha única contígua. Evita que ferramentas de busca (`grep`) capturem blocos de 20 KB de contexto inútil.
  2. **Mapa Arquitetural de Linhas**: Arquivos extensos devem conter comentário de índice no topo demarcando as faixas aproximadas de cada seção (CSS, HTML, Dados, Lógica) para leituras cirúrgicas via range offset.
  3. **Estabilidade Numérica**: Uso obrigatório de `font-variant-numeric: tabular-nums` e fontes mono em valores dinâmicos para prevenir oscilação horizontal de layout (*layout shift*).

## P7: Cartas Holográficas 3D com Física de Mola (Lerp Spring)
- **Arquivo**: `frontend/src/components/HolographicAthleteCard.jsx` e `frontend/src/index.css`
- **Padrão**:
  1. **Separação de Camadas de Transformação**: `.card-float` gerencia a flutuação senoidal isolada via CSS, enquanto `.card` gerencia a rotação 3D (`transform: rotateY() rotateX()`) alimentada por variáveis CSS.
  2. **Física de Mola Unificada**: `requestAnimationFrame` computa forças de atração (`stiffness`) e amortecimento (`damping`) em canais conjuntos (`rx, ry, gx, gy, o, bx, by`), garantindo que rotação, reflexo de vidro e foil cheguem no mesmo quadro.
  3. **Trio Óptico de Luz**:
     - *Foil*: `mix-blend-mode: soft-light` com paralaxe invertida deslocada.
     - *Shine*: `mix-blend-mode: color-dodge` com filtro `contrast(2.1) saturate(1.2)` estourando reflexos metálicos.
     - *Glare*: `mix-blend-mode: overlay` ancorado no ponto do cursor.

## P8: Baliza 3D com Física de Tecido e Vento (Pinhole Goalmouth Canvas)
- **Arquivo**: `frontend/src/components/GoalMouth3DCanvas.jsx` e `frontend/src/components/GoalMouthMap.jsx`
- **Padrão**:
  1. **Projeção Pinhole 3D em Canvas 2D**: Transforma coordenadas tridimensionais oficiais FIFA ($7.32 \times 2.44 \times 1.95\text{ m}$) para tela através de câmera angular fixa com vetor frente/direita/cima ortonormalizado e fator de profundidade focal.
  2. **Simulação de Tecido com Deformação Harmônica**: A malha da rede ($23 \times 13$ pontos de fundo e $10 \times 9$ laterais) é deformada no tempo por soma de senos com envelope parabólico (*bojo*) $\sin(\pi u)\sin(\pi v)$, simulando o balanço natural do vento contra o fundo da baliza.
  3. **Mapeamento Preciso de Finalizações**: A função `bocaCoords(nx, ny)` projeta os dados de finalizações de $0..1$ (chão ao travessão / poste a poste) em coordenadas CSS reais de tela, permitindo alvos interativos com anéis de impacto e tooltips analíticas.
  4. **Proteção de Performance (Zero CPU Leak)**: Uso de `IntersectionObserver` para congelar o loop de renderização fora do viewport e detecção estrita de `prefers-reduced-motion`.



