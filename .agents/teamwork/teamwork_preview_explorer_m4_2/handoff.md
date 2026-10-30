# Handoff Report — Explorer M4-2 (Career Average Leaks Explorer)

**Milestone**: M4 (Apresentação Visual no Frontend & WCAG 2.2 AA)  
**Feature**: 13 (Frontend Média Leak Elimination)  
**Target Files**:
1. `frontend/src/components/charts/AthleteCareerTimeline.jsx` (lines 224-236)
2. `frontend/src/components/charts/AthleteCareerBarChart.jsx` (lines 216-224)
3. `frontend/src/utils/cardGenerator.js` (lines 198-212)
4. `frontend/src/utils/pdfReportGenerator.js` (lines 16-25, 214-229)
**Patch Artifact**: `.agents/teamwork/teamwork_preview_explorer_m4_2/career_average_leaks.patch`

---

## 1. Observation

Direct observations from source inspection and data schema analysis:

### Observation 1.1: `AthleteCareerTimeline.jsx` (lines 224-236)
```javascript
224:                 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
225:                   <span style={{ fontSize: '0.66rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Jogos:</span>
226:                   <span className="font-mono tabular-nums" style={{ fontSize: '0.76rem', color: 'var(--text-secondary)' }}>
227:                     {temp.jogos || 0} j
228:                   </span>
229:                 </div>
230: 
231:                 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
232:                   <span style={{ fontSize: '0.66rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Média:</span>
233:                   <span className="font-mono tabular-nums" style={{ fontSize: '0.76rem', color: 'var(--accent)', fontWeight: 700 }}>
234:                     {temp.media_gols != null ? temp.media_gols : (temp.jogos > 0 ? (temp.gols / temp.jogos).toFixed(2) : '0.00')}
235:                   </span>
236:                 </div>
```
- Line 234 executes `(temp.jogos > 0 ? (temp.gols / temp.jogos).toFixed(2) : '0.00')` whenever `temp.media_gols` is null.
- In `backend/app.py:2639-2646`, when a historical season has partial records (`acervo_parcial = True`), `media_gols` is explicitly set to `None` to prevent distortion. However, because only match sheets with goals were archived historically (e.g. 5 games, 5 goals), `temp.gols / temp.jogos` evaluates to `1.00`, resurrecting the artificial 1.00 ratio.
- Line 225 hardcodes `Jogos:`, ignoring `temp.jogos_rotulo` (`"Jogos c/ Gol"`).

### Observation 1.2: `AthleteCareerBarChart.jsx` (lines 216-224)
```javascript
216:               <div>
217:                 <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Jogos</span>
218:                 <div className="font-mono" style={{ fontWeight: 700, color: 'var(--text-secondary)' }}>{item.jogos || 0}</div>
219:               </div>
220:               <div>
221:                 <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Média</span>
222:                 <div className="font-mono" style={{ fontWeight: 700, color: 'var(--accent)' }}>{item.media_gols || '0.00'}</div>
223:               </div>
```
- Line 222 evaluates `{item.media_gols || '0.00'}`. When `item.acervo_parcial` is true, `item.media_gols` is `null`, producing a misleading `0.00` goals/match for prolific strikers. Any naive fallback to `item.gols / item.jogos` leaks `1.00`.
- Line 217 hardcodes `Jogos`, failing to honor `item.jogos_rotulo` (`"Jogos c/ Gol"`).

### Observation 1.3: `cardGenerator.js` (lines 198-210)
```javascript
198:   // 4. Bento Grid de Números Mestres Globais (Carreira Inteira)
199:   const gCar = atleta.gols_carreira_oficiais || atleta.gols || atleta.total_gols || 0;
200:   const jCar = atleta.jogos_carreira_oficiais || atleta.jogos || atleta.total_jogos || 0;
201:   const aCar = atleta.assistencias_carreira_oficiais || atleta.assistencias || 0;
202:   const medG = jCar > 0 ? (gCar / jCar).toFixed(2) : '0.00';
203:   const partG = (Number(gCar) || 0) + (Number(aCar) || 0);
204: 
205:   const kpis = [
206:     { label: 'GOLS OFICIAIS', val: String(gCar), cor: '#C59B27', sub: 'Na carreira' },
207:     { label: 'JOGOS TOTAIS', val: String(jCar), cor: '#F1E8DE', sub: 'Partidas oficiais' },
208:     { label: 'ASSISTÊNCIAS', val: String(aCar), cor: '#7D8D5C', sub: 'Passes para gol' },
209:     { label: 'MÉDIA GOLS/JOGO', val: String(medG), cor: '#D48459', sub: 'Eficiência direta' }
210:   ];
```
- In `/api/jogadores/perfil`, official career statistics are placed under `atleta.carreira_oficial` (`{ gols, jogos, assistencias, clubes }`), and profile stats are under `atleta.resumo` (`{ total_gols, jogos_registrados, media_gols, acervo_parcial, jogos_rotulo, media_oficial_carreira }`).
- Because root properties `atleta.gols_carreira_oficiais` and `atleta.jogos_carreira_oficiais` are undefined on the profile payload, `gCar` and `jCar` fall back to local numbers `atleta.total_gols` (168) and `atleta.total_jogos` (158 or 168).
- Line 202 calculates `168 / 168 = 1.00` or `168 / 158 = 1.06`, bypassing `atleta.resumo?.media_gols` (`0.53`) and `atleta.carreira_oficial` (`341 / 643 = 0.53`).
- Line 207 labels 158 local goal matches as `JOGOS TOTAIS` / `Partidas oficiais`.

### Observation 1.4: `pdfReportGenerator.js` (lines 16-20, 214-229)
```javascript
16:   const gCar = atleta.gols_carreira_oficiais || atleta.gols || atleta.total_gols || 0;
17:   const jCar = atleta.jogos_carreira_oficiais || atleta.jogos || atleta.total_jogos || 0;
18:   const aCar = atleta.assistencias_carreira_oficiais || atleta.assistencias || 0;
19:   const medG = jCar > 0 ? (gCar / jCar).toFixed(2) : '0.00';
...
214:     <div class="kpi-card">
215:       <div class="kpi-label">Jogos Oficiais</div>
216:       <div class="kpi-value">${jCar}</div>
217:       <div class="kpi-sub">Partidas registradas</div>
218:     </div>
219:     <div class="kpi-card">
220:       <div class="kpi-label">Assistências</div>
221:       <div class="kpi-value" style="color:#5A673E;">${aCar}</div>
222:       <div class="kpi-sub">Passes para gol</div>
223:     </div>
224:     <div class="kpi-card">
225:       <div class="kpi-label">Média Gols / Jogo</div>
226:       <div class="kpi-value" style="color:#85573B;">${medG}</div>
227:       <div class="kpi-sub">Eficiência de baliza</div>
228:     </div>
```
- Replicates the exact leak as `cardGenerator.js`: line 19 computes `medG = gCar / jCar` using incomplete local tallies, leaking `1.00` / `1.06` in exported PDF scouting dossiers.
- Line 215 displays `Jogos Oficiais` / `Partidas registradas` even when `acervo_parcial` is true.

---

## 2. Logic Chain

1. **Premise**: Saneamento Requirement R1 and Feature 13 mandate that no athlete with an incomplete historical catalog (`acervo_parcial = true`) shall display a distorted 1.00 average, and their match counts must be labeled honestly as `"Jogos c/ Gol"`.
2. **Backend Contract**: `backend/app.py:2724-2758` outputs `resumo.media_gols` (e.g. `0.53` for Luís Fabiano), `resumo.media_oficial_carreira`, `resumo.acervo_parcial: true`, and `resumo.jogos_rotulo: "Jogos c/ Gol"`. In `historico_temporadas`, each season object provides `temp.acervo_parcial` and `temp.jogos_rotulo`.
3. **Point of Failure**:
   - `AthleteCareerTimeline.jsx:234` had a fallback `temp.jogos > 0 ? (temp.gols / temp.jogos).toFixed(2) : '0.00'`, which triggered because `temp.media_gols` was null.
   - `AthleteCareerBarChart.jsx:222` fell back to `'0.00'`, failing to indicate partial catalog.
   - `cardGenerator.js:202` and `pdfReportGenerator.js:19` recomputed raw `gCar / jCar` directly from root properties without inspecting `atleta.carreira_oficial` or `atleta.resumo?.media_gols`.
4. **Resolution Strategy**:
   - Prioritize `atleta.resumo?.media_gols`, `atleta.resumo?.media_oficial_carreira`, and `atleta.carreira_oficial` in `cardGenerator.js` and `pdfReportGenerator.js`.
   - In `AthleteCareerTimeline.jsx` and `AthleteCareerBarChart.jsx`, check `temp.acervo_parcial || item.acervo_parcial`: if true and `media_gols == null`, render `'—'` (em dash) to prevent 1.00 calculation bypass.
   - In all four components, bind the games label to `jogos_rotulo` (`"Jogos c/ Gol"` or `'JOGOS C/ GOL'`) when `acervo_parcial` is true.

---

## 3. Caveats

- **Scope Boundary**: Only frontend presentation components in Feature 13 are modified. The backend rating calculations (Feature 8), xG models (Feature 9), and radar charts (Feature 10/14) are handled by their respective milestone features.
- **Line Endings in Repository**: Target repository files use CRLF (`\r\n`) line terminators. When applying the patch via Git CLI on Linux, the `--ignore-whitespace` flag is required: `git apply --ignore-whitespace career_average_leaks.patch`.

---

## 4. Conclusion & Proposed Code Diffs

The root causes of 1.00 career average leaks across all 4 frontend components have been identified, solved, and packaged into a verified patch file.

### Proposed Code Diffs

#### 1. `frontend/src/components/charts/AthleteCareerTimeline.jsx`
```diff
--- a/frontend/src/components/charts/AthleteCareerTimeline.jsx
+++ b/frontend/src/components/charts/AthleteCareerTimeline.jsx
@@ -224,14 +224,18 @@ export default function AthleteCareerTimeline({
                 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
-                  <span style={{ fontSize: '0.66rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Jogos:</span>
+                  <span style={{ fontSize: '0.66rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
+                    {temp.jogos_rotulo ? `${temp.jogos_rotulo}:` : (temp.acervo_parcial ? 'Jogos c/ Gol:' : 'Jogos:')}
+                  </span>
                   <span className="font-mono tabular-nums" style={{ fontSize: '0.76rem', color: 'var(--text-secondary)' }}>
-                    {temp.jogos || 0} j
+                    {temp.jogos || 0} j{temp.acervo_parcial ? '*' : ''}
                   </span>
                 </div>
 
                 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                   <span style={{ fontSize: '0.66rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Média:</span>
                   <span className="font-mono tabular-nums" style={{ fontSize: '0.76rem', color: 'var(--accent)', fontWeight: 700 }}>
-                    {temp.media_gols != null ? temp.media_gols : (temp.jogos > 0 ? (temp.gols / temp.jogos).toFixed(2) : '0.00')}
+                    {temp.media_gols != null
+                      ? (typeof temp.media_gols === 'number' ? temp.media_gols.toFixed(2) : temp.media_gols)
+                      : (temp.acervo_parcial ? '—' : (temp.jogos > 0 ? (temp.gols / temp.jogos).toFixed(2) : '0.00'))}
                   </span>
                 </div>
               </div>
```

#### 2. `frontend/src/components/charts/AthleteCareerBarChart.jsx`
```diff
--- a/frontend/src/components/charts/AthleteCareerBarChart.jsx
+++ b/frontend/src/components/charts/AthleteCareerBarChart.jsx
@@ -216,9 +216,15 @@ export default function AthleteCareerBarChart({
               <div>
-                <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Jogos</span>
-                <div className="font-mono" style={{ fontWeight: 700, color: 'var(--text-secondary)' }}>{item.jogos || 0}</div>
+                <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
+                  {item.jogos_rotulo || (item.acervo_parcial ? 'Jogos c/ Gol' : 'Jogos')}
+                </span>
+                <div className="font-mono" style={{ fontWeight: 700, color: 'var(--text-secondary)' }}>
+                  {item.jogos || 0}{item.acervo_parcial ? '*' : ''}
+                </div>
               </div>
               <div>
                 <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Média</span>
-                <div className="font-mono" style={{ fontWeight: 700, color: 'var(--accent)' }}>{item.media_gols || '0.00'}</div>
+                <div className="font-mono" style={{ fontWeight: 700, color: 'var(--accent)' }}>
+                  {item.media_gols != null
+                    ? (typeof item.media_gols === 'number' ? item.media_gols.toFixed(2) : item.media_gols)
+                    : (item.acervo_parcial ? '—' : (item.jogos > 0 ? (item.gols / item.jogos).toFixed(2) : '0.00'))}
+                </div>
               </div>
             </div>
```

#### 3. `frontend/src/utils/cardGenerator.js`
```diff
--- a/frontend/src/utils/cardGenerator.js
+++ b/frontend/src/utils/cardGenerator.js
@@ -198,15 +198,39 @@ export function exportarDossieScoutingAtletaPNG(atleta) {
   // 4. Bento Grid de Números Mestres Globais (Carreira Inteira)
-  const gCar = atleta.gols_carreira_oficiais || atleta.gols || atleta.total_gols || 0;
-  const jCar = atleta.jogos_carreira_oficiais || atleta.jogos || atleta.total_jogos || 0;
-  const aCar = atleta.assistencias_carreira_oficiais || atleta.assistencias || 0;
-  const medG = jCar > 0 ? (gCar / jCar).toFixed(2) : '0.00';
+  const isAcervoParcial = Boolean(
+    atleta.resumo?.acervo_parcial ||
+    atleta.acervo_parcial ||
+    (atleta.resumo?.jogos_rotulo === 'Jogos c/ Gol')
+  );
+  const rotuloJogos = atleta.resumo?.jogos_rotulo
+    ? atleta.resumo.jogos_rotulo.toUpperCase()
+    : (isAcervoParcial ? 'JOGOS C/ GOL' : 'JOGOS TOTAIS');
+
+  // Prioriza estrutura canônica da API (/api/jogadores/perfil: carreira_oficial e resumo) com fallback flat
+  const gCar = atleta.carreira_oficial?.gols || atleta.gols_carreira_oficiais || atleta.resumo?.total_gols || atleta.gols || atleta.total_gols || 0;
+  const jCar = (isAcervoParcial && !atleta.carreira_oficial?.jogos && !atleta.jogos_carreira_oficiais)
+    ? (atleta.resumo?.jogos_registrados || atleta.jogos || atleta.total_jogos || 0)
+    : (atleta.carreira_oficial?.jogos || atleta.jogos_carreira_oficiais || atleta.resumo?.jogos_registrados || atleta.jogos || atleta.total_jogos || 0);
+  const aCar = atleta.carreira_oficial?.assistencias || atleta.assistencias_carreira_oficiais || atleta.resumo?.total_assistencias || atleta.assistencias || 0;
+
+  // Priorização da média autêntica do backend (resumo.media_gols / media_oficial_carreira) para expurgar 1.00 ou 1.06 artificial
+  const medG = (() => {
+    if (atleta.resumo?.media_gols != null && !isNaN(Number(atleta.resumo.media_gols))) {
+      return Number(atleta.resumo.media_gols).toFixed(2);
+    }
+    if (atleta.resumo?.media_oficial_carreira != null && !isNaN(Number(atleta.resumo.media_oficial_carreira))) {
+      return Number(atleta.resumo.media_oficial_carreira).toFixed(2);
+    }
+    if (atleta.media_oficial_carreira != null && !isNaN(Number(atleta.media_oficial_carreira))) {
+      return Number(atleta.media_oficial_carreira).toFixed(2);
+    }
+    if (atleta.media_gols != null && !isNaN(Number(atleta.media_gols))) {
+      return Number(atleta.media_gols).toFixed(2);
+    }
+    if (jCar > 0 && !isAcervoParcial) {
+      return (gCar / jCar).toFixed(2);
+    }
+    return '0.00';
+  })();
   const partG = (Number(gCar) || 0) + (Number(aCar) || 0);
 
   const kpis = [
     { label: 'GOLS OFICIAIS', val: String(gCar), cor: '#C59B27', sub: 'Na carreira' },
-    { label: 'JOGOS TOTAIS', val: String(jCar), cor: '#F1E8DE', sub: 'Partidas oficiais' },
+    { label: rotuloJogos, val: String(jCar), cor: '#F1E8DE', sub: isAcervoParcial ? 'Súmulas com gol' : 'Partidas oficiais' },
     { label: 'ASSISTÊNCIAS', val: String(aCar), cor: '#7D8D5C', sub: 'Passes para gol' },
-    { label: 'MÉDIA GOLS/JOGO', val: String(medG), cor: '#D48459', sub: 'Eficiência direta' }
+    { label: isAcervoParcial ? 'MÉDIA CARREIRA' : 'MÉDIA GOLS/JOGO', val: String(medG), cor: '#D48459', sub: isAcervoParcial ? 'Média da carreira' : 'Eficiência direta' }
   ];
```

#### 4. `frontend/src/utils/pdfReportGenerator.js`
```diff
--- a/frontend/src/utils/pdfReportGenerator.js
+++ b/frontend/src/utils/pdfReportGenerator.js
@@ -16,8 +16,33 @@ export function exportarRelatorioScoutingPDF(atleta) {
-  const gCar = atleta.gols_carreira_oficiais || atleta.gols || atleta.total_gols || 0;
-  const jCar = atleta.jogos_carreira_oficiais || atleta.jogos || atleta.total_jogos || 0;
-  const aCar = atleta.assistencias_carreira_oficiais || atleta.assistencias || 0;
-  const medG = jCar > 0 ? (gCar / jCar).toFixed(2) : '0.00';
+  const isAcervoParcial = Boolean(
+    atleta.resumo?.acervo_parcial ||
+    atleta.acervo_parcial ||
+    (atleta.resumo?.jogos_rotulo === 'Jogos c/ Gol')
+  );
+  const rotuloJogos = atleta.resumo?.jogos_rotulo || (isAcervoParcial ? 'Jogos c/ Gol' : 'Jogos Oficiais');
+
+  // Prioriza estrutura canônica da API (/api/jogadores/perfil: carreira_oficial e resumo) com fallback flat
+  const gCar = atleta.carreira_oficial?.gols || atleta.gols_carreira_oficiais || atleta.resumo?.total_gols || atleta.gols || atleta.total_gols || 0;
+  const jCar = (isAcervoParcial && !atleta.carreira_oficial?.jogos && !atleta.jogos_carreira_oficiais)
+    ? (atleta.resumo?.jogos_registrados || atleta.jogos || atleta.total_jogos || 0)
+    : (atleta.carreira_oficial?.jogos || atleta.jogos_carreira_oficiais || atleta.resumo?.jogos_registrados || atleta.jogos || atleta.total_jogos || 0);
+  const aCar = atleta.carreira_oficial?.assistencias || atleta.assistencias_carreira_oficiais || atleta.resumo?.total_assistencias || atleta.assistencias || 0;
+
+  // Priorização da média autêntica do backend (resumo.media_gols / media_oficial_carreira) para expurgar 1.00 ou 1.06 artificial
+  const medG = (() => {
+    if (atleta.resumo?.media_gols != null && !isNaN(Number(atleta.resumo.media_gols))) {
+      return Number(atleta.resumo.media_gols).toFixed(2);
+    }
+    if (atleta.resumo?.media_oficial_carreira != null && !isNaN(Number(atleta.resumo.media_oficial_carreira))) {
+      return Number(atleta.resumo.media_oficial_carreira).toFixed(2);
+    }
+    if (atleta.media_oficial_carreira != null && !isNaN(Number(atleta.media_oficial_carreira))) {
+      return Number(atleta.media_oficial_carreira).toFixed(2);
+    }
+    if (atleta.media_gols != null && !isNaN(Number(atleta.media_gols))) {
+      return Number(atleta.media_gols).toFixed(2);
+    }
+    if (jCar > 0 && !isAcervoParcial) {
+      return (gCar / jCar).toFixed(2);
+    }
+    return '0.00';
+  })();
   const partG = (Number(gCar) || 0) + (Number(aCar) || 0);
@@ -214,5 +239,5 @@ export function exportarRelatorioScoutingPDF(atleta) {
     <div class="kpi-card">
-      <div class="kpi-label">Jogos Oficiais</div>
+      <div class="kpi-label">${rotuloJogos}</div>
       <div class="kpi-value">${jCar}</div>
-      <div class="kpi-sub">Partidas registradas</div>
+      <div class="kpi-sub">${isAcervoParcial ? 'Súmulas com gol' : 'Partidas registradas'}</div>
     </div>
@@ -224,5 +249,5 @@ export function exportarRelatorioScoutingPDF(atleta) {
     <div class="kpi-card">
-      <div class="kpi-label">Média Gols / Jogo</div>
+      <div class="kpi-label">${isAcervoParcial ? 'Média Carreira' : 'Média Gols / Jogo'}</div>
       <div class="kpi-value" style="color:#85573B;">${medG}</div>
-      <div class="kpi-sub">Eficiência de baliza</div>
+      <div class="kpi-sub">${isAcervoParcial ? 'Média oficial ponderada' : 'Eficiência de baliza'}</div>
     </div>
```

---

## 5. Verification Method

To independently verify the patch and proposed changes:

1. **Patch Integrity Verification**:
   ```bash
   git apply --ignore-whitespace --check .agents/teamwork/teamwork_preview_explorer_m4_2/career_average_leaks.patch
   ```
   *Expected result*: Exit code 0, no output (clean verification).

2. **Frontend Build Verification**:
   ```bash
   git apply --ignore-whitespace .agents/teamwork/teamwork_preview_explorer_m4_2/career_average_leaks.patch
   npm --prefix frontend run build
   git checkout frontend/src/
   ```
   *Expected result*: `npm run build` exits with code 0 (`✓ built in 4.46s`).

3. **Behavioral Invalidation Conditions**:
   - Any athlete profile with `acervo_parcial: true` displaying `1.00` or `1.06` in their timeline, bar chart tooltip, PNG dossier, or PDF scouting report.
   - Any athlete profile with `acervo_parcial: true` displaying the unqualified label `"Jogos"` or `"JOGOS TOTAIS"` when referring to partial catalog appearances.
