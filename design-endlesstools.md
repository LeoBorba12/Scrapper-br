# 🎨 ENDLESS TOOLS DESIGN SYSTEM (design-endlesstools.md)
> **Estética:** Creative Studio / 3D & Design SaaS / Dark High-Contrast Cyber-Editorial  
> **Referência Oficial:** endlesstools.io | getdesign.md  
> **Finalidade:** Guia mestre para agentes de IA gerarem interfaces modernas, inspiradas no estilo visual único da Endless Tools.

---

## 1. Identidade Visual e Filosofia

O estilo **Endless Tools** foge do minimalismo corporativo tradicional e aposta em uma estética de **estúdio criativo de ponta**:
* **Fundo Preto Profundo (True Black):** Sem cinzas acinzentados ou azuis escuros — a base é `#000000` absoluto.
* **Acento Neon Vibrante (Magenta / Shocking Pink):** Um rosa elétrico que salta da tela, usado estrategicamente no botão principal e em pontos de foco visual.
* **Componentes em Formato Pílula (Pill Shapes):** Botões e tags com curvatura total (`rounded-full`), transmitindo sensação tátil e moderna.
* **Molduras Finas & Efeito Vidro Fosco:** Cartões com bordas sutis grafite (`border border-[#343434]`) e desfoque de fundo (`backdrop-blur-lg`).

---

## 2. Tokens de Cor (Design Tokens)

### Paleta Principal (Tailwind):
```css
:root {
  /* Superfícies */
  --bg-primary: #000000;              /* Fundo principal 100% preto */
  --bg-card: rgba(26, 26, 26, 0.6);   /* Cartões com leve transparência */
  --border-subtle: #343434;           /* Borda sutil de cartões e inputs */
  --border-divider: #222222;          /* Linhas divisórias discretas */
  
  /* Textos */
  --text-primary: #FFFFFF;            /* Branco puro para títulos */
  --text-secondary: #8E8E93;          /* Cinza neutro legível para corpo */
  --text-muted: #555555;              /* Cinza escuro para notas de rodapé */
  
  /* Cores de Ação (Acentos) */
  --accent-pink: #FF13B1;             /* Magenta oficial Endless Tools */
  --accent-pink-hover: #FF4BC4;       /* Hover mais brilhante */
  --accent-lime: #C7FF00;             /* Verde limão/neon para badges secundários */
  --accent-cyan: #00F0FF;             /* Ciano secundário para detalhes criativos */
}
```

### Classes Tailwind correspondentes:
* **Fundo da página:** `bg-[#000000] text-white`
* **Botão CTA Principal:** `bg-[#FF13B1] hover:bg-[#FF4BC4] text-white font-medium rounded-full px-6 py-2.5 transition-all duration-200 active:scale-[0.97]`
* **Botão Secundário (Pílula Translúcida):** `bg-white/10 hover:bg-white/20 text-white rounded-full px-5 py-2 backdrop-blur-lg border border-white/15 transition-all`
* **Cartões:** `bg-[#121212]/80 border border-[#343434] rounded-2xl p-6 backdrop-blur-md hover:border-[#555] transition-colors`

---

## 3. Tipografia e Títulos de Destaque

* **Família de Fontes:** `Inter`, `Geist Sans` ou `Plus Jakarta Sans`.
* **Títulos (H1 / Hero):**
  * Grandes e expressivos: `text-4xl md:text-6xl font-bold tracking-tight text-white`.
  * **Elemento Característico Endless Tools:** Destaque de palavras individuais com traços, badges ovais ou caixas de seleção estilizadas.
* **Corpo de Texto:**
  * `text-sm md:text-base text-[#8E8E93] leading-relaxed max-w-[480px]`.

---

## 4. Padrões de Layout e Componentes

### A. Barra de Navegação Flutuante (Nav):
* Fixa no topo com gradiente sutil de desfoque:
  ```html
  <nav class="sticky top-0 z-50 px-6 py-4 flex justify-between items-center backdrop-blur-xl bg-black/40 border-b border-white/10">
    <div class="font-bold text-lg tracking-wider text-white">SUA MARCA</div>
    <div class="flex items-center gap-3">
      <button class="px-5 py-2 text-sm text-[#8E8E93] hover:text-white rounded-full transition">Entrar</button>
      <button class="px-5 py-2 text-sm bg-[#FF13B1] hover:bg-[#FF4BC4] text-white font-medium rounded-full transition">Começar Grátis</button>
    </div>
  </nav>
  ```

### B. Grid de Recursos (Bento Grid Criativo):
* Disposição de cartões com cantos arredondados (`rounded-[20px]`), vídeos/mídias em autoplay silencioso em loop, e bordas finas com tags redondas.
* Tags de mídia: Pílulas pretas com texto pequeno cinza: `bg-[#222] text-[#AAA] text-xs px-3 py-1 rounded-full`.

---

## 5. Como instruir qualquer IA a usar este Design:

Basta colar o comando abaixo na conversa da IA:

> *"Atue como front-end designer e construa a interface do meu projeto seguindo estritamente as diretrizes do `design-endlesstools.md`: fundo True Black (`#000`), botão primário em pílula magenta (`#FF13B1`), cartões translúcidos com borda `#343434`, tipografia geométrica e visual de estúdio criativo moderno."*
