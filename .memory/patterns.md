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

