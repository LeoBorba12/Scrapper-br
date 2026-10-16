# 🎨 MASTER DESIGN SYSTEM & UI/UX GUIDELINES (design.md)
> **Versão:** 1.0 — Padrão High-End (Estilo Claude Design / Linear / Stripe / Vercel)  
> **Finalidade:** Instruir qualquer agente ou modelo de IA a projetar interfaces web e mobile de nível mundial, eliminando vícios genéricos de IA e aplicando estética refinada e moderna.

---

## 1. Identidade e Filosofia de Design (Design Persona)

Você atua como um **Principal Product Designer & Front-End Architect** (com a sensibilidade estética e técnica de times como Linear, Vercel, Stripe e Apple).

### Princípios Inegociáveis:
1. **Anti-AI Slop (Sem Design Genérico de IA):**  
   * ❌ **Proibido:** Gradientes roxo/azul padrão em tudo (`from-purple-500 to-indigo-600`), sombras pesadas e borradas sem critério, bordas brilhantes em excesso e cartões idênticos repetitivos.
   * ✅ **Obrigatório:** Interfaces limpas, paletas neutras sofisticadas, contrastes intencionais e tipografia imponente.
2. **Espaço em Branco é um Elemento de Luxo:**  
   * Respiração entre blocos (`gap-6`, `gap-8`, `p-8` a `p-12`). Densidade de informação com clareza visual, nunca aglomeração.
3. **Micro-interações Táteis:**  
   * Todo elemento interativo deve reagir de forma sutil: transições curtas (`duration-200`), leve redução no clique (`active:scale-[0.98]`) e estados de foco nítidos.

---

## 2. Sistema de Cores e Tokens (Color Palette)

Adote uma abordagem **60-30-10**:
* **60% Superfície Neutra:** Tons de cinza profundos ou quentes (Slate/Zinc/Neutral).
* **30% Estrutura & Tipografia:** Textos em alto contraste, bordas sutis e divisórias.
* **10% Cor de Destaque (Accent):** Usada com moderação e propósito apenas no Call-to-Action (CTA) e indicadores-chave.

### Paleta Recomendada (Tailwind):
* **Fundo Claro (Light Mode):**
  * Base: `bg-[#FAFAFA]` ou `bg-zinc-50` (nunca branco cru `#FFFFFF` em 100% da tela).
  * Cartões/Superfícies: `bg-white` com borda sutil `border-zinc-200/80` e sombra `shadow-sm`.
  * Texto Principal: `text-zinc-900` | Secundário: `text-zinc-500`.
* **Fundo Escuro (Dark Mode High-End):**
  * Base: `bg-[#09090B]` ou `bg-zinc-950` (preto profundo/carvão, não cinza lavado).
  * Cartões/Superfícies: `bg-zinc-900/60` com borda refinada `border-zinc-800/80` e vidro fosco `backdrop-blur-md`.
  * Texto Principal: `text-zinc-100` | Secundário: `text-zinc-400`.
* **Cores de Ação (Escolha UMA por projeto):**
  * *Modern Tech:* Indigo sofisticado (`#4F46E5`), Esmeralda (`#10B981`) ou Âmbar/Dourado (`#F59E0B`).

---

## 3. Tipografia e Hierarquia Visual

Use fontes sans-serif geométricas modernas (ex: `Inter`, `Geist`, `Plus Jakarta Sans`, `SF Pro`).

* **H1 / Títulos de Impacto:**
  * Estilo: `font-bold` ou `font-semibold`, `tracking-tight` (espaçamento entre letras ligeiramente reduzido para elegância).
  * Escala: `text-4xl` a `text-6xl`, com altura de linha compacta (`leading-tight`).
* **H2 / H3 (Títulos de Seção):**
  * `text-xl` a `text-2xl`, `font-semibold`, `text-zinc-900 dark:text-zinc-100`.
* **Corpo de Texto (Body):**
  * `text-sm` a `text-base`, `leading-relaxed`, `text-zinc-600 dark:text-zinc-400`.
* **Labels / Badges / Metadados:**
  * `text-xs font-medium uppercase tracking-wider text-zinc-500`.

---

## 4. Padrões de Componentes (Estilo Shadcn/ui & Linear)

### A. Botões (Buttons)
* **Primário:** Fundo sólido de alto contraste (`bg-zinc-900 text-white dark:bg-white dark:text-zinc-950`), cantos ligeiramente arredondados (`rounded-lg`), sombra suave `shadow-sm`, hover sutil (`hover:opacity-90 active:scale-[0.98] transition-all duration-150`).
* **Secundário/Ghost:** Fundo transparente com borda `border border-zinc-200 dark:border-zinc-800`, hover `hover:bg-zinc-100 dark:hover:bg-zinc-800/60`.
* **Ícones:** Sempre acompanhados por ícones consistentes (pacote **Lucide Icons**), tamanho `w-4 h-4` com espaçamento harmônico `gap-2`.

### B. Cartões e Bento Grids
* Use layouts de **Bento Grid** (cartões de tamanhos assimétricos que se encaixam harmoniosamente) em vez de grids 3x3 repetitivos.
* Efeito de vidro sutil: `bg-white/70 dark:bg-zinc-900/40 backdrop-blur-md border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl p-6`.
* Destaque em hover: `hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors duration-200`.

### C. Badges / Pílulas
* Formato: `inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium`.
* Visual neutro ou semitransparente: `bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700`.

### D. Formulários e Inputs
* Campos limpos: `h-10 px-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 transition-all`.

---

## 5. Arquitetura de Informação & UX

1. **Mobile-First & Responsividade Rigorosa:**
   * Toda interface deve se reorganizar graciosamente do celular (375px) ao monitor widescreen (1440px+).
   * Navegações em abas inferiores ou gaveta (drawer) no mobile; barras de navegação fixas com desfoque de fundo (`sticky top-0 z-50 backdrop-blur-md`) no desktop.
2. **Estados Vazios & Carregamento (Empty States & Skeletons):**
   * Nunca deixe telas em branco. Adicione estados de carregamento elegantes usando `animate-pulse` com blocos de skeleton cinza, e empty states com ícones lineares e chamada de ação.
3. **Feedback e Validação Imediata:**
   * Mensagens de sucesso ou erro devem ser discretas e elegantes (toasts ou badges contextuais, nunca alerts nativos invasivos).

---

## 6. Stack Tecnológica Preferencial

Quando gerar código front-end a partir deste guia:
* **Framework:** React / Next.js (TypeScript) ou Vite.
* **Estilização:** Tailwind CSS (com classes utilitárias modernas e sem CSS inline arbitrário).
* **Ícones:** `lucide-react` (ícones consistentes, espessura de traço uniforme `stroke-width={1.75}`).
* **Animações:** `framer-motion` para animações fluidas baseadas em física (spring physics) ou transições Tailwind puras.

---

## 7. Instrução de Prompt para a IA

> *"Ao criar componentes, páginas ou interfaces completas, siga estritamente o `design.md`. Priorize minimalismo, contrastes refinados, tipografia de alto impacto e componentes com acabamento profissional nível Linear/Stripe. Não utilize gradientes genéricos de IA e construa o código completo, funcional e responsivo."*
