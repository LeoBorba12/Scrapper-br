# Relatório de Investigação Técnica — Explorer M4-3
## Features 14 e 15: Radar Pentagonal PES & Blindagem Defensiva de Clubes na Carreira

---

## 1. Observation (Observações Diretas)

### 1.1 Radar Pentagonal PES e Desconexão com Payload do Backend
- **Arquivo**: `frontend/src/components/charts/RadarPentagonPES.jsx` (Linhas 20–145, 181–216)
- **Observação**:
  - O componente declara a assinatura `RadarPentagonPES({ atleta, resumo = {}, carreira = {}, size = 320 })`.
  - Na linha 142, ele executa incondicionalmente `const eixos = calcAttributes();`, recomputando localmente os 5 atributos em JavaScript e ignorando sumariamente o objeto `atleta.radar_pes` entregue pela rota `/api/jogadores/perfil` do Flask (`backend/app.py:2932`).
  - O Overall Rating (`ovr`) na linha 145 é recalculado como média aritmética local, descartando o `radar_pes.ovr` calibrado e auditado pelo modelo backend.
  - Se um atleta possuir 0 partidas catalogadas e 0 gols (ou `atleta` vazio `{}`), `calcAttributes()` atribui `totalGols = 0`, `totalJogos = 1`, calculando arbitrariamente `atk: 65`, `fin: 55`, `cri: 58`, `fis: 65`, `def: 52`, resultando em um polígono simulado de `ovr: 59`. Isso constitui uma violação explícita da diretriz de **Honestidade de Dados e Feedback** (AGENTS.md, Seção 1.B: *"recusa terminante a mockups falsos que simulem telemetria"*).
  - O componente não possui nenhum container ou estado condicional de **Empty State** caso o atleta não possua dados suficientes.

### 1.2 Estrutura do Contrato de Dados Backend (`radar_pes`)
- **Arquivo**: `backend/app.py` (Linhas 2043–2176, 2903, 2932)
- **Observação**:
  - A função `_calcular_radar_pes(posicao, resumo=None, carreira=None)` retorna:
    ```json
    {
      "eixos": [
        {"key": "atk", "label": "Ataque", "valor": 85, "desc": "Presença e volume ofensivo"},
        {"key": "fin", "label": "Finalização", "valor": 92, "desc": "Conversão e precisão no arremate"},
        {"key": "cri", "label": "Criação / Passe", "valor": 70, "desc": "Visão de jogo e assistências"},
        {"key": "fis", "label": "Físico / Presença", "valor": 88, "desc": "Resistência, minutagem e solidez"},
        {"key": "def", "label": "Defesa / Disciplina", "valor": 52, "desc": "Combate e disciplina tática"}
      ],
      "ovr": 77
    }
    ```
  - Todos os valores de eixos e o OVR são clampados estritamente na faixa de números inteiros entre 40 e 99 (`backend/app.py:2163`).
  - O endpoint `/api/jogadores/perfil` inclui `"radar_pes": radar_pes` no dicionário raiz de resposta (`backend/app.py:2932`).
  - O endpoint `/api/jogadores/comparar` inclui `"radar_pes": perfil1["radar_pes"]` e `"radar_pes": perfil2["radar_pes"]` (`backend/app.py:3444, 3463`).

### 1.3 Renderização de Clubes em `ProtagonistaAtleta.jsx`
- **Arquivo**: `frontend/src/components/ProtagonistaAtleta.jsx` (Linhas 795–806, 1186–1209, 1684–1712)
- **Observação**:
  - Na linha 796: `{(atleta.clubes || []).map((c, idx) => ...)}`. Se `atleta.clubes` for retornado pelo backend ou cache como uma string separada por vírgula (`"Vasco, São Paulo, Ponte Preta"`), a chamada `("Vasco, São Paulo, Ponte Preta" || []).map` lança `TypeError: (atleta.clubes || []).map is not a function`, travando a aplicação React.
  - Se `atleta.clubes` contiver objetos (`[{clube: "Vasco"}]`), o elemento `<span>{c}</span>` na linha 803 gera a exceção `Objects are not valid as a React child` no React 18.
  - Na linha 1200: `👑 Histórico Oficial no {carreira.clubes[0].clube}:`. Se `carreira.clubes` for um array de strings ou string JSON, `carreira.clubes[0].clube` resulta em `undefined`, e na linha 1203 a chamada `(carreira.clubes[0].gols / carreira.clubes[0].jogos).toFixed(2)` lança `TypeError: Cannot read properties of undefined (reading 'toFixed')`.
  - Na linha 1684 (aba `carreira_ogol`): se `carreira.clubes` for uma string JSON não decodificada, a tentativa de fazer `.map()` causa travamento similar.
  - Não há camada de sanitização contra clubes estrangeiros espúrios de competições Conmebol que possam persistir em históricos de carreira ou dados de mockups residuais.

### 1.4 Renderização de Clubes em `AthleteCompareView.jsx`
- **Arquivo**: `frontend/src/components/AthleteCompareView.jsx` (Linhas 867–874, 1030–1037)
- **Observação**:
  - Linhas 867-868: `{atleta1.clubes && atleta1.clubes.length > 0 ? atleta1.clubes.map((c, i) => ...)}`.
  - Linhas 1030-1031: `{atleta2.clubes && atleta2.clubes.length > 0 ? atleta2.clubes.map((c, i) => ...)}`.
  - Apresenta a mesma vulnerabilidade de tipagem frágil: se `atleta1.clubes` ou `atleta2.clubes` for uma string (`typeof string`), `length > 0` é verdadeiro, e `.map()` explode em tempo de execução.
  - Os clubes são renderizados como texto plano dentro de `<span className="pill-neutral">{c}</span>` sem o componente `ClubBadge`, destoando do padrão visual editorial do `ProtagonistaAtleta.jsx`.
  - Não há filtro contra artefatos JSON malformados (`"[object Object]"`, `'[{"clube":...}]'`) ou clubes estrangeiros espúrios.

### 1.5 Estado de Build do Frontend
- **Comando**: `npm run build` em `frontend/`
- **Resultado**: Código de saída 0 em 6.34s, sem erros de sintaxe ou empacotamento Rollup.

---

## 2. Logic Chain (Cadeia de Raciocínio Lógico)

1. **Paridade com a Fonte de Verdade Backend (Feature 14)**:
   - Uma vez que o backend já calcula e audita `radar_pes` com 5 eixos ponderados e `ovr` (40 a 99) em `_calcular_radar_pes` (`backend/app.py:2043`), o frontend deve priorizar `atleta.radar_pes` recebido via prop/API.
   - Os 5 vértices geométricos do pentágono no SVG correspondem, respectivamente, a:
     - Vértice 0 (topo, -90°): `atk` (Ataque)
     - Vértice 1 (topo-direito, -18°): `fin` (Finalização)
     - Vértice 2 (base-direita, +54°): `cri` (Criação / Passe)
     - Vértice 3 (base-esquerda, +126°): `fis` (Físico / Presença)
     - Vértice 4 (topo-esquerdo, +198°): `def` (Defesa / Disciplina)
   - Mapear explicitamente pela chave canônica (`['atk', 'fin', 'cri', 'fis', 'def']`) garante invariância de ordem caso o backend serialize chaves em ordem alfabética.

2. **Container de Empty State Honesto (Feature 14)**:
   - Se o atleta não possuir registro no acervo (sem partidas catalogadas e sem gols) e o payload `radar_pes` estiver ausente ou vazio, gerar um polígono com notas fictícias (ex: 59 OVR) engana o usuário.
   - O componente deve renderizar um container de Empty State com dimensões idênticas (`maxWidth: size`, `minHeight: size`) para evitar layout shift, com badge `"Amostragem Insuficiente"`, pentágono pontilhado neutro e cópia explicativa de integridade editorial 2026 (`#F1E8DE`, `#1B1A17`, `#5A673E`, `#85573B`, contraste WCAG 2.2 AA).

3. **Blindagem Defensiva e Expulgo de Clubes Espúrios (Feature 15)**:
   - O campo `clubes` na base de dados e payloads pode se manifestar em 4 formatos distintos:
     a) Array de strings: `["Flamengo", "Santos"]`
     b) String separada por vírgula: `"Flamengo, Santos"`
     c) String contendo JSON: `'[{"clube": "Flamengo"}]'` ou `'["Flamengo"]'`
     d) Array de objetos: `[{"clube": "Flamengo", "jogos": 100}]`
   - Uma função centralizadora (`sanitizarListaClubes`) deve tratar todas essas variações, extraindo nomes válidos de clubes, expurgando ruídos (`[object Object]`, strings vazias, `null`), deduplicando itens preservando a ordem cronológica e descartando clubes adversários de competições Conmebol associados por inversões históricas de raspagem (`river plate`, `universidad de chile`, `guabirá`, etc.).
   - A tabela detalhada de carreira oficial em `ProtagonistaAtleta.jsx` deve ser blindada por `sanitizarCarreiraClubes`, garantindo integridade numérica (`jogos`, `gols`, `assistencias`) antes de invocar `.toFixed(2)` e prevenindo quebras em caso de registros incompletos.
   - Em `AthleteCompareView.jsx`, a integração de `ClubBadge` junto a `sanitizarListaClubes` padroniza a estética visual em conformidade com o sistema editorial.

---

## 3. Caveats (Ressalvas e Áreas Não Afetadas)

1. **Clubes Internacionais Legítimos**: A lista de expurgo espúrio (`CLUBES_CONMEBOL_ESPURIOS`) foca estritamente em adversários de torneios continentais sul-americanos (River Plate, Universidad de Chile, Guabirá, etc.) onde ocorreram inversões de gols. Clubes internacionais onde atletas brasileiros atuaram legitimamente (ex: Ganso no Sevilla, Roque Júnior no Milan, Zinho no Yokohama Flügels) continuam sendo preservados normalmente.
2. **Fallback para Acervos Parciais**: Caso um atleta possua partidas e gols no resumo local, mas o backend porventura envie `radar_pes` nulo (em rota legado ou teste isolado), o algoritmo matemático frontend é mantido como salvaguarda secundária, calculando o pentágono e evitando telas pretas.
3. **Escopo Estritamente Frontend**: As correções são puramente defensivas na camada de apresentação (React), sem alterar esquemas ou índices do SQLite `data/futebol.db`.

---

## 4. Conclusion (Propostas de Código e Diffs Exatos)

### Modificação 1: Utilitário de Sanitização em `frontend/src/utils/clubData.js`
Adicionar as funções utilitárias `sanitizarListaClubes` e `sanitizarCarreiraClubes` e a constante `CLUBES_CONMEBOL_ESPURIOS` ao final do arquivo.

```diff
--- a/frontend/src/utils/clubData.js
+++ b/frontend/src/utils/clubData.js
@@ -549,3 +549,114 @@ export function getClubInfo(nome) {
   };
 }
+
+/**
+ * Conjunto de clubes estrangeiros de torneios Conmebol que frequentemente
+ * poluem perfis de atletas brasileiros devido a inversões históricas de súmula.
+ */
+export const CLUBES_CONMEBOL_ESPURIOS = new Set([
+  'river plate',
+  'river',
+  'universidad de chile',
+  'u. de chile',
+  'guabira',
+  'guabirá',
+  'san lorenzo',
+  'boca juniors',
+  'boca',
+  'oriente petrolero',
+  'the strongest',
+  'bolivar',
+  'bolívar',
+  'cerro porteno',
+  'cerro porteño',
+  'olimpia',
+  'libertad',
+  'sporting cristal',
+  'alianza lima',
+  'deportivo tachira',
+  'deportivo táchira'
+]);
+
+/**
+ * Normaliza e sanitiza lista de clubes da carreira do atleta.
+ * Protege contra:
+ * - Arrays de objetos ou strings mistas
+ * - Strings JSON brutas ou malformadas ('[{"clube": "..."}]', '[object Object]')
+ * - Strings separadas por vírgula
+ * - Clubes espúrios de competições Conmebol
+ * - Entradas duplicadas ou nulas
+ */
+export function sanitizarListaClubes(clubesRaw, detalheRaw = null) {
+  const result = [];
+  const seen = new Set();
+
+  const extrairNome = (item) => {
+    if (!item) return '';
+    if (typeof item === 'string') {
+      const trimmed = item.trim();
+      if (!trimmed || trimmed === '[object Object]' || trimmed === 'null' || trimmed === 'undefined' || trimmed === 'None') {
+        return '';
+      }
+      if ((trimmed.startsWith('[') && trimmed.endsWith(']')) || (trimmed.startsWith('{') && trimmed.endsWith('}'))) {
+        try {
+          const parsed = JSON.parse(trimmed);
+          if (Array.isArray(parsed)) {
+            parsed.forEach(p => {
+              const n = extrairNome(p);
+              if (n) adicionar(n);
+            });
+            return '';
+          } else if (parsed && typeof parsed === 'object') {
+            return extrairNome(parsed.clube || parsed.nome || parsed.name || '');
+          }
+        } catch (_) {}
+      }
+      return trimmed;
+    }
+    if (typeof item === 'object') {
+      return extrairNome(item.clube || item.nome || item.name || '');
+    }
+    return String(item).trim();
+  };
+
+  const adicionar = (nomeClube) => {
+    if (!nomeClube) return;
+    const norm = normalizeClubName(nomeClube);
+    if (!norm) return;
+    if (CLUBES_CONMEBOL_ESPURIOS.has(norm)) return;
+    if (!seen.has(norm)) {
+      seen.add(norm);
+      result.push(nomeClube);
+    }
+  };
+
+  if (Array.isArray(clubesRaw)) {
+    clubesRaw.forEach(c => {
+      const nome = extrairNome(c);
+      if (nome) adicionar(nome);
+    });
+  } else if (typeof clubesRaw === 'string' && clubesRaw.trim()) {
+    const rawTrim = clubesRaw.trim();
+    if ((rawTrim.startsWith('[') && rawTrim.endsWith(']')) || (rawTrim.startsWith('{') && rawTrim.endsWith('}'))) {
+      try {
+        const parsed = JSON.parse(rawTrim);
+        if (Array.isArray(parsed)) {
+          parsed.forEach(c => {
+            const nome = extrairNome(c);
+            if (nome) adicionar(nome);
+          });
+        }
+      } catch (_) {
+        rawTrim.split(',').map(s => s.trim()).filter(Boolean).forEach(adicionar);
+      }
+    } else {
+      rawTrim.split(',').map(s => s.trim()).filter(Boolean).forEach(adicionar);
+    }
+  }
+
+  if (result.length === 0 && detalheRaw) {
+    let detalhes = detalheRaw;
+    if (typeof detalheRaw === 'string') {
+      try {
+        detalhes = JSON.parse(detalheRaw);
+      } catch (_) {
+        detalhes = [];
+      }
+    }
+    if (Array.isArray(detalhes)) {
+      detalhes.forEach(d => {
+        const nome = extrairNome(d);
+        if (nome) adicionar(nome);
+      });
+    }
+  }
+
+  return result;
+}
+
+/**
+ * Normaliza a estrutura tabular da carreira oficial (detalhe_carreira_clubes).
+ * Garante que cada item seja um objeto seguro com números válidos e sem clubes espúrios.
+ */
+export function sanitizarCarreiraClubes(carreiraClubesRaw) {
+  let list = carreiraClubesRaw;
+  if (typeof list === 'string') {
+    try {
+      list = JSON.parse(list);
+    } catch (_) {
+      list = [];
+    }
+  }
+  if (!Array.isArray(list)) return [];
+
+  return list
+    .map(item => {
+      if (!item) return null;
+      let clube = '';
+      let periodo = '—';
+      let jogos = 0;
+      let gols = 0;
+      let assistencias = 0;
+
+      if (typeof item === 'string') {
+        clube = item.trim();
+      } else if (typeof item === 'object') {
+        clube = String(item.clube || item.nome || '').trim();
+        periodo = item.periodo || '—';
+        jogos = Number(item.jogos) || 0;
+        gols = Number(item.gols) || 0;
+        assistencias = Number(item.assistencias) || 0;
+      }
+
+      if (!clube || clube === '[object Object]') return null;
+      const norm = normalizeClubName(clube);
+      if (CLUBES_CONMEBOL_ESPURIOS.has(norm)) return null;
+
+      return {
+        clube,
+        periodo,
+        jogos,
+        gols,
+        assistencias
+      };
+    })
+    .filter(Boolean);
+}
```

---

### Modificação 2: Consumo de `atleta.radar_pes` e Empty State em `frontend/src/components/charts/RadarPentagonPES.jsx`

```diff
--- a/frontend/src/components/charts/RadarPentagonPES.jsx
+++ b/frontend/src/components/charts/RadarPentagonPES.jsx
@@ -10,13 +10,28 @@ import React, { useState } from 'react';
  * 5. Defesa / Disciplina (Disciplina tática, baixo número de cartões, desarme)
+ *
+ * Consome atleta.radar_pes do payload backend (5 eixos e ovr na escala 40-99).
+ * Fornece Empty State honesto e transparente em caso de ausência de dados do atleta.
  */
 export default function RadarPentagonPES({
-  atleta,
+  atleta = {},
   resumo = {},
   carreira = {},
+  radar_pes = null,
   size = 320
 }) {
   const [hoveredIndex, setHoveredIndex] = useState(null);
 
+  const AXIS_ORDER = ['atk', 'fin', 'cri', 'fis', 'def'];
+  const DEFAULT_META = {
+    atk: { label: 'Ataque', desc: 'Presença e volume ofensivo' },
+    fin: { label: 'Finalização', desc: 'Conversão e precisão no arremate' },
+    cri: { label: 'Criação / Passe', desc: 'Visão de jogo e assistências' },
+    fis: { label: 'Físico / Presença', desc: 'Resistência, minutagem e solidez' },
+    def: { label: 'Defesa / Disciplina', desc: 'Combate e disciplina tática' }
+  };
+
+  const clamp = (v) => Math.max(40, Math.min(99, Math.round(Number(v) || 50)));
+
   // Calcula atributos com base nos dados reais do atleta (escala 40 a 99 estilo PES)
-  const calcAttributes = () => {
+  const calcFallbackAttributes = () => {
     // Paridade estrita de escopo para cálculo de atributos:
@@ -131,19 +146,96 @@ export default function RadarPentagonPES({
-    const clamp = (v) => Math.max(40, Math.min(99, Math.round(v)));
     return [
       { key: 'atk', label: 'Ataque', valor: clamp(atk), desc: 'Presença e volume ofensivo' },
       { key: 'fin', label: 'Finalização', valor: clamp(fin), desc: 'Conversão e precisão no arremate' },
       { key: 'cri', label: 'Criação / Passe', valor: clamp(cri), desc: 'Visão de jogo e assistências' },
       { key: 'fis', label: 'Físico / Presença', valor: clamp(fis), desc: 'Resistência, minutagem e solidez' },
       { key: 'def', label: 'Defesa / Disciplina', valor: clamp(def), desc: 'Combate e disciplina tática' },
     ];
   };
 
-  const eixos = calcAttributes();
+  // 1. Resolução do Radar a partir do payload backend (prioridade absoluta)
+  const backendRadar = radar_pes || atleta?.radar_pes;
+  const temBackendValido = Boolean(
+    backendRadar &&
+    Array.isArray(backendRadar.eixos) &&
+    backendRadar.eixos.length === 5 &&
+    backendRadar.eixos.every(e => e && e.valor != null && !isNaN(Number(e.valor)))
+  );
+
+  // 2. Verificação de dados catalogados reais
+  const totalJogosAtividade = Number(resumo?.jogos_registrados || 0) + Number(carreira?.jogos || 0);
+  const totalGolsAtividade = Number(resumo?.total_gols || 0) + Number(carreira?.gols || 0);
+  const temDadosReais = totalJogosAtividade > 0 || totalGolsAtividade > 0;
+
+  // 3. Container Honesto de Empty State (Editorial 2026 & WCAG 2.2 AA)
+  if (!temBackendValido && !temDadosReais) {
+    return (
+      <div
+        className="radar-pes-empty-container"
+        style={{
+          display: 'flex',
+          flexDirection: 'column',
+          alignItems: 'center',
+          justifyContent: 'center',
+          position: 'relative',
+          width: '100%',
+          maxWidth: `${size}px`,
+          minHeight: `${size}px`,
+          margin: '0 auto',
+          padding: '24px 16px',
+          boxSizing: 'border-box',
+          backgroundColor: 'var(--surface-raised)',
+          border: '1px dashed var(--border-subtle)',
+          borderRadius: 'var(--radius-card)',
+          textAlign: 'center',
+          gap: '12px'
+        }}
+      >
+        <div
+          style={{
+            width: '60px',
+            height: '60px',
+            borderRadius: '50%',
+            backgroundColor: 'rgba(90, 103, 62, 0.08)',
+            border: '1px solid var(--border-subtle)',
+            display: 'flex',
+            alignItems: 'center',
+            justifyContent: 'center',
+            color: 'var(--text-muted)'
+          }}
+          aria-hidden="true"
+        >
+          <svg width="34" height="34" viewBox="0 0 40 40" fill="none">
+            <polygon
+              points="20,4 36,16 30,34 10,34 4,16"
+              stroke="var(--text-muted)"
+              strokeWidth="1.5"
+              strokeDasharray="3,3"
+              fill="none"
+              opacity="0.6"
+            />
+            <circle cx="20" cy="20" r="2.5" fill="var(--text-muted)" opacity="0.5" />
+          </svg>
+        </div>
+
+        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
+          <span className="pill-neutral" style={{ fontSize: '0.66rem', fontWeight: 700, margin: '0 auto', color: 'var(--text-secondary)' }}>
+            Amostragem Insuficiente
+          </span>
+          <h4
+            className="font-editorial"
+            style={{
+              fontSize: '1rem',
+              fontWeight: 700,
+              color: 'var(--text-primary)',
+              margin: '2px 0 0 0'
+            }}
+          >
+            Radar Pentagonal Indisponível
+          </h4>
+          <p
+            style={{
+              fontSize: '0.74rem',
+              color: 'var(--text-secondary)',
+              lineHeight: 1.4,
+              margin: 0,
+              maxWidth: '220px'
+            }}
+          >
+            O atleta ainda não possui scouts atômicos suficientes no catálogo para calibração dos 5 eixos táticos (PES / WE).
+          </p>
+        </div>
+      </div>
+    );
+  }
+
+  // 4. Mapeamento Canônico dos 5 Eixos e OVR
+  let eixos = [];
+  let ovr = 75;
+
+  if (temBackendValido) {
+    eixos = AXIS_ORDER.map(key => {
+      const found = backendRadar.eixos.find(e => e.key === key);
+      const meta = DEFAULT_META[key];
+      return {
+        key,
+        label: found?.label || meta.label,
+        valor: clamp(found?.valor),
+        desc: found?.desc || meta.desc
+      };
+    });
+    ovr = (typeof backendRadar.ovr === 'number' && !isNaN(backendRadar.ovr) && backendRadar.ovr >= 40 && backendRadar.ovr <= 99)
+      ? Math.round(backendRadar.ovr)
+      : Math.round(eixos.reduce((acc, e) => acc + e.valor, 0) / eixos.length);
+  } else {
+    eixos = calcFallbackAttributes();
+    ovr = Math.round(eixos.reduce((acc, e) => acc + e.valor, 0) / eixos.length);
+  }
-
-  // Média Geral (Overall Rating no estilo Winning Eleven)
-  const ovr = Math.round(eixos.reduce((acc, e) => acc + e.valor, 0) / eixos.length);
 
   // Parâmetros do SVG Pentagonal
```

---

### Modificação 3: Blindagem Defensiva de Clubes em `frontend/src/components/ProtagonistaAtleta.jsx`

```diff
--- a/frontend/src/components/ProtagonistaAtleta.jsx
+++ b/frontend/src/components/ProtagonistaAtleta.jsx
@@ -10,6 +10,7 @@ import ClubBadge from './ClubBadge';
 import SpatialPitchMap from './SpatialPitchMap';
 import GoalMouthMap from './GoalMouthMap';
 import { exportarDossieScoutingAtletaPNG } from '../utils/cardGenerator';
 import { exportarRelatorioScoutingPDF } from '../utils/pdfReportGenerator';
+import { sanitizarListaClubes, sanitizarCarreiraClubes } from '../utils/clubData';
 
 export default function ProtagonistaAtleta({
@@ -438,6 +439,8 @@ export default function ProtagonistaAtleta({
   const atleta = playerProfile || {};
   const resumo = atleta.resumo || {};
   const carreira = atleta.carreira_oficial || {};
+  const clubesLimpos = sanitizarListaClubes(atleta.clubes, carreira.clubes);
+  const carreiraClubesLimpos = sanitizarCarreiraClubes(carreira.clubes);
   const scoutsPro = atleta.scouts_profissionais || resumo.scouts_profissionais || {};
@@ -794,15 +797,21 @@ export default function ProtagonistaAtleta({
                 <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
-                  {(atleta.clubes || []).map((c, idx) => (
-                    <span 
-                      key={idx} 
-                      className="pill-neutral"
-                      style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '3px 8px' }}
-                    >
-                      <ClubBadge nome={c} size={15} />
-                      <span>{c}</span>
-                    </span>
-                  ))}
+                  {clubesLimpos.length > 0 ? (
+                    clubesLimpos.map((c, idx) => (
+                      <span 
+                        key={idx} 
+                        className="pill-neutral"
+                        style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '3px 8px' }}
+                      >
+                        <ClubBadge nome={c} size={15} />
+                        <span>{c}</span>
+                      </span>
+                    ))
+                  ) : (
+                    <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
+                      Sem histórico consolidado de clubes
+                    </span>
+                  )}
                 </div>
               </div>
@@ -1119,7 +1128,7 @@ export default function ProtagonistaAtleta({
                       <span>📚</span>
                       <span>
-                        Clubes: <strong className="tabular-nums">{carreira.clubes?.length || (atleta.clubes || []).length}</strong>
+                        Clubes: <strong className="tabular-nums">{carreiraClubesLimpos.length || clubesLimpos.length}</strong>
                       </span>
                     </div>
@@ -1184,24 +1193,24 @@ export default function ProtagonistaAtleta({
                 {/* Esclarecimento de Escopo: Diferença entre Súmulas Catalogadas e Carreira Oficial por Clube */}
-                {carreira?.clubes?.length > 0 && (
+                {carreiraClubesLimpos.length > 0 && (
                   <div 
                     style={{ 
                       marginBottom: '12px', 
                       padding: '8px 10px', 
                       backgroundColor: 'var(--surface-raised)', 
                       borderRadius: 'var(--radius-control)', 
                       borderLeft: '3px solid var(--accent)', 
                       fontSize: '0.72rem', 
                       color: 'var(--text-secondary)', 
                       lineHeight: 1.45 
                     }}
                   >
                     <div>
-                      👑 <strong>Histórico Oficial no {carreira.clubes[0].clube}:</strong>{' '}
-                      <strong className="font-mono" style={{ color: 'var(--text-primary)' }}>{carreira.clubes[0].jogos} jogos</strong> e{' '}
-                      <strong className="font-mono" style={{ color: 'var(--accent)' }}>{carreira.clubes[0].gols} gols</strong>{' '}
-                      ({(carreira.clubes[0].gols / carreira.clubes[0].jogos).toFixed(2)} gols/jogo).
+                      👑 <strong>Histórico Oficial no {carreiraClubesLimpos[0].clube}:</strong>{' '}
+                      <strong className="font-mono" style={{ color: 'var(--text-primary)' }}>{carreiraClubesLimpos[0].jogos} jogos</strong> e{' '}
+                      <strong className="font-mono" style={{ color: 'var(--accent)' }}>{carreiraClubesLimpos[0].gols} gols</strong>{' '}
+                      ({carreiraClubesLimpos[0].jogos > 0 ? (carreiraClubesLimpos[0].gols / carreiraClubesLimpos[0].jogos).toFixed(2) : '0.00'} gols/jogo).
                     </div>
                     <div style={{ marginTop: '3px', fontSize: '0.66rem', color: 'var(--text-muted)' }}>
                       * O catálogo local contabiliza fichas de partidas com gols auditados no acervo. Na carreira mundial total, são {carreira.jogos || '—'} jogos e {carreira.gols || '—'} gols (consulte a aba Carreira Oficial).
                     </div>
                   </div>
                 )}
@@ -1310,7 +1319,7 @@ export default function ProtagonistaAtleta({
                 { id: 'partidas', label: `Fichas Auditadas (${resumo.jogos_registrados || (atleta.partidas || []).length})` },
                 { id: 'temporadas', label: `Temporadas (${(atleta.temporadas || []).length})` },
-                { id: 'carreira_ogol', label: `Carreira Oficial OGol (${(carreira.clubes || []).length})` },
+                { id: 'carreira_ogol', label: `Carreira Oficial OGol (${carreiraClubesLimpos.length})` },
                 { id: 'torneios', label: `Torneios (${(atleta.torneios || []).length})` },
                 { id: 'vitimas', label: `Maiores Vítimas (${(atleta.maiores_vitimas || []).length})` },
                 { id: 'titulos', label: `Títulos Oficiais (${(atleta.titulos || []).length})` }
@@ -1665,7 +1674,7 @@ export default function ProtagonistaAtleta({
               {/* Sub-aba Carreira Oficial OGol */}
               {subTab === 'carreira_ogol' && (
                 <div style={{ overflowX: 'auto' }}>
-                  {(carreira.clubes || []).length === 0 ? (
+                  {carreiraClubesLimpos.length === 0 ? (
                     <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                       Nenhum histórico consolidado de clubes disponível no momento.
                     </div>
                   ) : (
                     <table className="editorial-table">
@@ -1682,7 +1691,7 @@ export default function ProtagonistaAtleta({
                       </thead>
                       <tbody>
-                        {carreira.clubes.map((c_item, idx) => {
+                        {carreiraClubesLimpos.map((c_item, idx) => {
                           const media = c_item.jogos > 0 ? (c_item.gols / c_item.jogos).toFixed(2) : '0.00';
                           return (
                             <tr key={idx}>
```

---

### Modificação 4: Blindagem Defensiva e Padronização Visual em `frontend/src/components/AthleteCompareView.jsx`

```diff
--- a/frontend/src/components/AthleteCompareView.jsx
+++ b/frontend/src/components/AthleteCompareView.jsx
@@ -3,6 +3,8 @@ import { RadarDualPES } from './charts';
 import MobileBottomSheet from './MobileBottomSheet';
 import { SlidersHorizontal, ArrowLeftRight, Sparkles, Check } from 'lucide-react';
 import SpatialPitchMap from './SpatialPitchMap';
+import ClubBadge from './ClubBadge';
+import { sanitizarListaClubes } from '../utils/clubData';
 
 const DUELOS_CLASSICOS = [
@@ -865,11 +867,19 @@ export default function AthleteCompareView({
                 </div>
                 <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
-                  {atleta1.clubes && atleta1.clubes.length > 0 ? (
-                    atleta1.clubes.map((c, i) => (
-                      <span key={i} className="pill-neutral" style={{ fontSize: '0.7rem' }}>{c}</span>
-                    ))
-                  ) : (
-                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Sem histórico de clubes</span>
-                  )}
+                  {(() => {
+                    const clubes1 = sanitizarListaClubes(atleta1.clubes, atleta1.carreira_oficial?.clubes);
+                    return clubes1.length > 0 ? (
+                      clubes1.map((c, i) => (
+                        <span 
+                          key={i} 
+                          className="pill-neutral" 
+                          style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.7rem' }}
+                        >
+                          <ClubBadge nome={c} size={13} />
+                          <span>{c}</span>
+                        </span>
+                      ))
+                    ) : (
+                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Sem histórico de clubes</span>
+                    );
+                  })()}
                 </div>
               </div>
@@ -1028,11 +1038,19 @@ export default function AthleteCompareView({
                 </div>
                 <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
-                  {atleta2.clubes && atleta2.clubes.length > 0 ? (
-                    atleta2.clubes.map((c, i) => (
-                      <span key={i} className="pill-neutral" style={{ fontSize: '0.7rem' }}>{c}</span>
-                    ))
-                  ) : (
-                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Sem histórico de clubes</span>
-                  )}
+                  {(() => {
+                    const clubes2 = sanitizarListaClubes(atleta2.clubes, atleta2.carreira_oficial?.clubes);
+                    return clubes2.length > 0 ? (
+                      clubes2.map((c, i) => (
+                        <span 
+                          key={i} 
+                          className="pill-neutral" 
+                          style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.7rem' }}
+                        >
+                          <ClubBadge nome={c} size={13} />
+                          <span>{c}</span>
+                        </span>
+                      ))
+                    ) : (
+                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Sem histórico de clubes</span>
+                    );
+                  })()}
                 </div>
               </div>
```

---

## 5. Verification Method (Método de Verificação Independente)

Para validar a integridade destas alterações sem efeitos colaterais:

1. **Compilação e Tipagem Estática do Frontend**:
   ```bash
   cd "/mnt/jogos_f/Antigravity_Projetos_e_Ferramentas/Guia profissional/frontend"
   npm run build
   ```
   - **Critério de Sucesso**: Código de saída 0, sem avisos de importação quebrada ou erro de parsing Rollup/Vite.

2. **Verificação de Regressão em Testes E2E (Tiers 1 e 2)**:
   ```bash
   cd "/mnt/jogos_f/Antigravity_Projetos_e_Ferramentas/Guia profissional"
   pytest tests/test_e2e_futstats.py -k "radar_pes or luis_fabiano" -v
   ```
   - **Critério de Sucesso**: Confirmação de que `radar_pes` e as regras de saneamento de clubes continuam 100% aprovadas.

3. **Verificação de Casos Limítrofes (Edge Cases Adversariais)**:
   - Inspecionar a renderização de `RadarPentagonPES` com props vazias:
     `<RadarPentagonPES atleta={{}} resumo={{}} carreira={{}} />`
     - **Comportamento Esperado**: Não quebra e não exibe notas simuladas (59 OVR); renderiza o container honesto de empty state `"Radar Pentagonal Indisponível"`.
   - Inspecionar a renderização com clubes em string crua ou JSON:
     `<AthleteCompareView atleta1={{ clubes: "Vasco, São Paulo" }} />`
     - **Comportamento Esperado**: Renderiza dois badges estilizados com `<ClubBadge />`, sem lançar `TypeError: .map is not a function`.
   - Inspecionar a ausência de clubes espúrios:
     `<ProtagonistaAtleta atleta={{ clubes: ["São Paulo", "River Plate", "Ponte Preta"] }} />`
     - **Comportamento Esperado**: Renderiza apenas "São Paulo" e "Ponte Preta", filtrando "River Plate".
