---
name: humanizer
description: Remove padrões artificiais de escrita de IA (inflação, clichês, jargões internos, ritmo mecânico e referências técnicas deslocadas) e reescreve textos em linguagem humana natural, direta e profissional em Português do Brasil. Inspirada no projeto open-source blader/humanizer e no guia "Signs of AI Writing" da Wikipédia.
metadata:
  author: futstats-team
  version: "1.0.0"
  inspired_by: "blader/humanizer (Wikipedia Signs of AI Writing)"
---

# Humanizer — Escrita Humana Natural e Profissional (PT-BR)

Use esta skill sempre que revisar textos de interface (UI copy), cabeçalhos, descrições, relatórios, tooltips ou cards compartilháveis para garantir que a leitura pareça escrita por um editor esportivo/analista humano experiente — nunca por um modelo de linguagem ou documento técnico interno.

---

## 1. Os 5 Padrões de "Texto de IA" para Eliminar

1. **Inflação e Grandiloquência (Inflation):**
   - *Evitar:* "Arquitetura Editorial 2026", "Composição Protagonista", "Inteligência Revolucionária", "Ecossistema Robusto", "Eleva a experiência a outro patamar", "Matriz estatística de alta precisão".
   - *Preferir:* linguagem direta que diz o que a tela faz ("Histórico completo desde 1902", "Compare clubes lado a lado", "Simule desfalques e veja o impacto nas chances do jogo").

2. **Encenação Vazia (Staging):**
   - *Evitar:* "Não é apenas X, mas sim Y", "Vale destacar que...", "É importante notar que...", "No cenário dinâmico do futebol moderno...".
   - *Preferir:* ir direto ao fato ou número.

3. **Jargão Interno ou Referências Amadoras/Externas no Texto Principal:**
   - *Evitar:* citar nomes de jogos ou scrapers no cabeçalho ou nos títulos de gráficos ("Estilo PES / WE", "PES OVR", "Carreira Oficial OGol", "Scouts (OGol)", "Avaliação Sofascore", "Clima (Open-Meteo)", "RAPM (NBA / Beisebol)").
   - *Preferir:* termos editoriais próprios e profissionais ("Perfil Técnico", "Índice Geral", "Carreira Oficial", "Scouts Coletivos", "Nota Média", "Clima Pré-Jogo") e concentrar o crédito das fontes em uma **legenda discreta no rodapé** (`Fontes: ...`).

4. **Ritmo Mecânico e Formatação Excessiva (Rhythm & Formatting by Rule):**
   - *Evitar:* travessões em excesso, listas forçadas de três adjetivos ("rápido, intuitivo e poderoso"), excesso de negrito em cada palavra ou emojis decorativos demais em títulos sérios.
   - *Preferir:* frases curtas alternadas com frases explicativas naturais, pontuação limpa e hierarquia tipográfica sóbria.

5. **Resíduos de Prompt / Metalínguagem (Leftovers):**
   - *Evitar:* "Computando matriz estatística...", "O Oráculo está pesquisando no banco...", "Carregando módulo editorial...".
   - *Preferir:* feedback natural e discreto ("Calculando comparativo...", "Consultando histórico...", "Carregando dados...").

---

## 2. Fluxo de Aplicação em 3 Passos

1. **Auditoria:** listar cabeçalhos, subtítulos, badges, labels de abas, estados vazios e mensagens de loading do componente.
2. **Reescrita Humana:** aplicar os 5 cortes acima preservando 100% dos fatos, números e precisão estatística (nunca distorcer ou inventar dados).
3. **Atribuição Limpa de Fontes:** remover nomes de provedores/fontes de títulos e cards principais, movendo a citação para uma legenda discreta no rodapé da tela ou da dashboard.
