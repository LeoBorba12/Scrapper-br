# HANDOFF REPORT — Explorer M4-1 (UI Contrast & Badge Token Explorer)

**Date**: 2026-10-30T18:48:00-03:00  
**Target Feature**: Feature 12 (Frontend Badge Sofascore / Rating WCAG 2.2 AA & Honest Athlete Profile Presentation)  
**Target Component**: `frontend/src/components/ProtagonistaAtleta.jsx`  
**Patch Artifact**: `.agents/teamwork/teamwork_preview_explorer_m4_1/protagonista_atleta_feature12.patch`

---

## 1. Observation

Direct examination of `frontend/src/components/ProtagonistaAtleta.jsx` and styling tokens in `frontend/src/tokens.css` revealed four concrete issues:

### Observation 1.1: Illegal Hardcoded Neon Green `#22c55e` Failing WCAG 2.2 AA
In `frontend/src/components/ProtagonistaAtleta.jsx` (lines 606–639), the Sofascore rating badge uses hardcoded `#22c55e` and `rgba(34, 197, 94, ...)`:
```jsx
606:                     {resumo.sofascore && (
607:                       <div 
608:                         style={{ 
...
614:                           background: 'rgba(34, 197, 94, 0.12)',
615:                           border: '1px solid rgba(34, 197, 94, 0.4)',
616:                           boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
617:                         }}
618:                         title={`Rating Sofascore: ${resumo.sofascore.rating_medio}/10 (${resumo.sofascore.jogos_avaliados} jogos) • Últimas notas: ${resumo.sofascore.ultimas_notas?.join(', ') || 'N/D'}`}
619:                       >
620:                         <div style={{ textAlign: 'right', lineHeight: 1.15 }}>
621:                           <div style={{ fontSize: '0.60rem', fontWeight: 800, textTransform: 'uppercase', color: '#22c55e', letterSpacing: '0.04em' }}>
622:                             Sofascore
623:                           </div>
624:                           <div style={{ fontSize: '0.62rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
625:                             {resumo.sofascore.jogos_avaliados}j avaliados
626:                           </div>
627:                         </div>
628:                         <div 
629:                           className="font-mono tabular-nums" 
630:                           style={{ 
631:                             fontSize: '1.45rem', 
632:                             fontWeight: 900, 
633:                             color: '#22c55e', 
634:                             lineHeight: 1 
635:                           }}
636:                         >
637:                           {resumo.sofascore.rating_medio}
638:                         </div>
639:                       </div>
640:                     )}
```
Empirical contrast measurements using WCAG 2.2 relative luminance formula:
- `#22c55e` on Areia page background (`#F1E8DE`): **1.88:1** (FAILED: required min 4.5:1 for normal text < 18pt/14pt bold, min 3.0:1 for large text).
- `#22c55e` on Panel background (`#FCF9F5`): **2.17:1** (FAILED).
- `#22c55e` on Card background (`#FFFFFF`): **2.28:1** (FAILED).
- Label `"SOFASCORE"` is rendered at `fontSize: 0.60rem` (~9.6px), making it visually illegible on light surfaces.

In `frontend/src/tokens.css`, the editorial token `var(--positive)` is defined as:
- Light theme (`.theme-areia` / `:root`): `--positive: #526337;`, `--positive-bg: #DFE6D1;`
  - `#526337` on Areia (`#F1E8DE`): **5.42:1** (PASSED WCAG 2.2 AA).
  - `#526337` on `--positive-bg` (`#DFE6D1`): **5.12:1** (PASSED WCAG 2.2 AA).
  - `#526337` on Panel (`#FCF9F5`): **6.26:1** (PASSED WCAG 2.2 AA).
  - `#526337` on White (`#FFFFFF`): **6.57:1** (PASSED WCAG 2.2 AA).
- Dark theme (`.dark` / `.theme-carvao`): `--positive: #B7C59C;`, `--positive-bg: #333D2A;`
  - `#B7C59C` on Carvão (`#1B1A17`): **9.51:1** (PASSED WCAG 2.2 AA).
  - `#B7C59C` on `--positive-bg` (`#333D2A`): **6.23:1** (PASSED WCAG 2.2 AA).
  - `#B7C59C` on Panel (`#22211D`): **8.81:1** (PASSED WCAG 2.2 AA).

### Observation 1.2: Dishonest Hardcoding of "Sofascore" for FutStats Scouting Fallback
In `backend/app.py` (lines 2854–2863), when no pre-calculated Sofascore row exists in `atleta_sofascore_ratings`, the backend computes ratings dynamically via the tanh asymptotic formula and sets:
```python
2856:                 sofascore_data = {
2857:                     "rating_medio": round(sum(notas_dinamicas) / total_avaliados, 2),
2858:                     "jogos_avaliados": total_avaliados,
2859:                     "fonte": "futstats_scouting",
2860:                     "ultimas_notas": notas_dinamicas[:5]
2861:                 }
```
However, `ProtagonistaAtleta.jsx` line 621 always renders `"Sofascore"` and line 618 always states `title="Rating Sofascore: ..."`, regardless of whether `fonte` is `"sofascore"` or `"futstats_scouting"`.

### Observation 1.3: Games Label Vulnerability When `acervo_parcial` Is True
In `ProtagonistaAtleta.jsx` line 1157:
```jsx
1156:                     <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
1157:                       {resumo.jogos_rotulo || (resumo.acervo_parcial || (resumo.jogos_registrados === resumo.total_gols && Number(resumo.total_gols) > 0 && Number(carreira?.jogos || 0) > Number(resumo.jogos_registrados)) ? 'Jogos c/ Gol' : 'Jogos no Catálogo')}
1158:                     </span>
```
If `resumo.jogos_rotulo` is passed as raw `"Jogos"` or if `resumo.jogos_registrados < resumo.total_gols` (e.g. 158 jogos vs 168 gols for Luís Fabiano, where `jogos_registrados === total_gols` is false), the fallback logic did not guard against displaying raw `"Jogos"`.

### Observation 1.4: Artificial 1.00 / 1.06 Leak and `!isParcial` Block on `media_gols`
In `ProtagonistaAtleta.jsx` lines 1168–1180:
```jsx
1168:                       {(() => {
1169:                         const isParcial = resumo.acervo_parcial || (resumo.jogos_registrados === resumo.total_gols && Number(resumo.total_gols) > 0 && Number(carreira?.jogos || 0) > Number(resumo.jogos_registrados));
1170:                         if (isParcial && carreira?.jogos && Number(carreira.jogos) > 0) {
1171:                           return (Number(carreira.gols || resumo.total_gols) / Number(carreira.jogos)).toFixed(2);
1172:                         }
1173:                         if (isParcial && resumo.media_oficial_carreira) {
1174:                           return Number(resumo.media_oficial_carreira).toFixed(2);
1175:                         }
1176:                         if (resumo.jogos_registrados && Number(resumo.jogos_registrados) > 0 && !isParcial) {
1177:                           return (Number(resumo.total_gols || 0) / Number(resumo.jogos_registrados)).toFixed(2);
1178:                         }
1179:                         return (resumo.media_gols != null && !isNaN(Number(resumo.media_gols)) && !isParcial ? Number(resumo.media_gols).toFixed(2) : '—');
1180:                       })()}
```
Two severe flaws:
1. Line 1179 contains `&& !isParcial`. If `isParcial` is true, but `carreira.jogos` and `resumo.media_oficial_carreira` are not provided on the client, the component refused to render `resumo.media_gols` (which backend already populated with 0.53) and fell back to `'—'`.
2. Line 1169 checked only `resumo.jogos_registrados === resumo.total_gols`. When an athlete had 168 gols and 158 jogos (`total_gols > jogos_registrados`), `isParcial` evaluated to false if `resumo.acervo_parcial` was not explicitly boolean true, leading line 1177 to divide `168 / 158 = 1.06`!

---

## 2. Logic Chain

1. **Contrast Violation**:
   - WCAG 2.2 Criterion 1.4.3 mandates a contrast ratio of >= 4.5:1 for standard text.
   - Observation 1.1 proves `#22c55e` has contrast 1.88:1 on Areia (`#F1E8DE`).
   - Substituting `#22c55e` with `var(--positive)` (Light: `#526337`, Dark: `#B7C59C`) and `rgba(34, 197, 94, ...)` with `var(--positive-bg)` elevates contrast to 5.42:1 (light) and 9.51:1 (dark), achieving compliance without design regressions.

2. **Honest Source Attribution**:
   - Observation 1.2 demonstrates that the backend explicitly informs the data origin via `resumo.sofascore.fonte` (`"sofascore"` vs `"futstats_scouting"`).
   - Displaying `"Sofascore"` for dynamic scouting estimates is misleading.
   - Conditionally rendering `{resumo.sofascore.fonte === 'futstats_scouting' ? 'Scouting' : 'Sofascore'}` and updating the tooltip title restores honest data representation.

3. **Honest Labeling of Partial Collections**:
   - Observation 1.3 shows that historical athletes with un-digitized match sheets (pre-2018) only have cataloged matches in which they scored or were carded.
   - Calling this count raw `"Jogos"` confuses users into believing the athlete only played that many games.
   - Enforcing `"Jogos c/ Gol"` whenever `resumo.acervo_parcial` is true (or when `total_gols >= jogos_registrados`) ensures transparent labeling.

4. **Accurate Average Calculation**:
   - Observation 1.4 reveals that `backend/app.py` already resolves `media_gols` to the authenticated career average (0.53 for Luís Fabiano) whenever `acervo_parcial` is active.
   - The frontend must treat `resumo.media_gols` as primary authority, eliminating the `&& !isParcial` block and guarding against `total_gols / jogos_registrados` division when records are partial.

---

## 3. Caveats

- **Scope Boundary**: This investigation focuses strictly on `frontend/src/components/ProtagonistaAtleta.jsx`. Timeline and bar chart components (`AthleteCareerTimeline.jsx`, `AthleteCareerBarChart.jsx`) and export generators (`cardGenerator.js`, `pdfReportGenerator.js`) are scoped to separate Milestone 4 tasks.
- **Badge Width**: The label `'Scouting'` (8 characters) was chosen over `'FutStats Scouting'` (16 characters) for visual balance in the compact 0.60rem header slot, matching the 9-character width of `'Sofascore'` and avoiding line wrapping next to the "Nota Global" badge.
- **Read-Only Compliance**: In accordance with the Explorer archetype rules, changes were verified in a dry-run test build and preserved in a `.patch` file without committing source code modifications.

---

## 4. Conclusion & Verified Diffs

The proposed modifications to `frontend/src/components/ProtagonistaAtleta.jsx` completely resolve Feature 12:
1. Color contrast upgraded from 1.88:1 to 5.42:1 (light) and 9.51:1 (dark), fully compliant with WCAG 2.2 AA.
2. Honest attribution for both `"sofascore"` and `"futstats_scouting"`.
3. Honest `"Jogos c/ Gol"` label whenever `atleta.resumo?.acervo_parcial` is true.
4. Eliminates the artificial 1.00 / 1.06 ratios, accurately displaying 0.53 for Luís Fabiano.

### Unified Diff (`protagonista_atleta_feature12.patch`)

```diff
--- a/frontend/src/components/ProtagonistaAtleta.jsx
+++ b/frontend/src/components/ProtagonistaAtleta.jsx
@@ -602,7 +602,7 @@
                   </div>
 
                   <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
-                    {/* Badge Oficial Sofascore (0 a 10.0) */}
+                    {/* Badge Oficial Sofascore ou FutStats Scouting (0 a 10.0) */}
                     {resumo.sofascore && (
                       <div 
                         style={{ 
@@ -611,15 +611,18 @@
                           gap: '6px', 
                           padding: '4px 10px', 
                           borderRadius: 'var(--radius-control)', 
-                          background: 'rgba(34, 197, 94, 0.12)',
-                          border: '1px solid rgba(34, 197, 94, 0.4)',
-                          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
+                          background: 'var(--positive-bg)',
+                          border: '1px solid var(--positive)',
+                          boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
                         }}
-                        title={`Rating Sofascore: ${resumo.sofascore.rating_medio}/10 (${resumo.sofascore.jogos_avaliados} jogos) • Últimas notas: ${resumo.sofascore.ultimas_notas?.join(', ') || 'N/D'}`}
+                        title={resumo.sofascore.fonte === 'futstats_scouting'
+                          ? `Rating FutStats Scouting: ${resumo.sofascore.rating_medio}/10 (${resumo.sofascore.jogos_avaliados} jogos) • Últimas notas: ${resumo.sofascore.ultimas_notas?.join(', ') || 'N/D'}`
+                          : `Rating Sofascore: ${resumo.sofascore.rating_medio}/10 (${resumo.sofascore.jogos_avaliados} jogos) • Últimas notas: ${resumo.sofascore.ultimas_notas?.join(', ') || 'N/D'}`
+                        }
                       >
                         <div style={{ textAlign: 'right', lineHeight: 1.15 }}>
-                          <div style={{ fontSize: '0.60rem', fontWeight: 800, textTransform: 'uppercase', color: '#22c55e', letterSpacing: '0.04em' }}>
-                            Sofascore
+                          <div style={{ fontSize: '0.60rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--positive)', letterSpacing: '0.04em' }}>
+                            {resumo.sofascore.fonte === 'futstats_scouting' ? 'Scouting' : 'Sofascore'}
                           </div>
                           <div style={{ fontSize: '0.62rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                             {resumo.sofascore.jogos_avaliados}j avaliados
@@ -630,7 +633,7 @@
                           style={{ 
                             fontSize: '1.45rem', 
                             fontWeight: 900, 
-                            color: '#22c55e', 
+                            color: 'var(--positive)', 
                             lineHeight: 1 
                           }}
                         >
@@ -1091,7 +1094,11 @@
                       {temCarreira && jogosCarreira ? (
                         <span>Média Oficial: <strong className="tabular-nums font-mono" style={{ color: 'var(--accent)' }}>{(golsCarreira / jogosCarreira).toFixed(2)}</strong> gols/jogo</span>
                       ) : !temCarreira && jogosCatalogo > 0 ? (
-                        <span>Média no Catálogo: <strong className="tabular-nums font-mono" style={{ color: 'var(--accent)' }}>{(golsCatalogo / jogosCatalogo).toFixed(2)}</strong> gols/jogo</span>
+                        resumo.acervo_parcial || (golsCatalogo >= jogosCatalogo && golsCatalogo > 0) ? (
+                          <span>Média no Catálogo: <span className="pill-neutral" style={{ fontSize: '0.64rem', padding: '1px 6px' }}>Acervo Parcial*</span></span>
+                        ) : (
+                          <span>Média no Catálogo: <strong className="tabular-nums font-mono" style={{ color: 'var(--accent)' }}>{(golsCatalogo / jogosCatalogo).toFixed(2)}</strong> gols/jogo</span>
+                        )
                       ) : null}
                     </div>
 
@@ -1154,7 +1161,13 @@
                   </div>
                   <div>
                     <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
-                      {resumo.jogos_rotulo || (resumo.acervo_parcial || (resumo.jogos_registrados === resumo.total_gols && Number(resumo.total_gols) > 0 && Number(carreira?.jogos || 0) > Number(resumo.jogos_registrados)) ? 'Jogos c/ Gol' : 'Jogos no Catálogo')}
+                      {Boolean(
+                        resumo.acervo_parcial ||
+                        (Number(resumo.total_gols) >= Number(resumo.jogos_registrados) && Number(resumo.total_gols) > 0) ||
+                        (Number(carreira?.jogos || 0) > Number(resumo.jogos_registrados))
+                      )
+                        ? (resumo.jogos_rotulo && resumo.jogos_rotulo !== 'Jogos' ? resumo.jogos_rotulo : 'Jogos c/ Gol')
+                        : (resumo.jogos_rotulo || 'Jogos no Catálogo')}
                     </span>
                     <div className="tabular-nums font-mono" style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                       {resumo.jogos_registrados ?? 0}
@@ -1162,21 +1175,32 @@
                   </div>
                   <div>
                     <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
-                      {resumo.acervo_parcial || (resumo.jogos_registrados === resumo.total_gols && Number(resumo.total_gols) > 0 && Number(carreira?.jogos || 0) > Number(resumo.jogos_registrados)) ? 'Média Carreira' : 'Média Local'}
+                      {Boolean(
+                        resumo.acervo_parcial ||
+                        (Number(resumo.total_gols) >= Number(resumo.jogos_registrados) && Number(resumo.total_gols) > 0) ||
+                        (Number(carreira?.jogos || 0) > Number(resumo.jogos_registrados))
+                      ) ? 'Média Carreira' : 'Média Local'}
                     </span>
                     <div className="tabular-nums font-mono" style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-secondary)' }}>
                       {(() => {
-                        const isParcial = resumo.acervo_parcial || (resumo.jogos_registrados === resumo.total_gols && Number(resumo.total_gols) > 0 && Number(carreira?.jogos || 0) > Number(resumo.jogos_registrados));
+                        const isParcial = Boolean(
+                          resumo.acervo_parcial ||
+                          (Number(resumo.total_gols) >= Number(resumo.jogos_registrados) && Number(resumo.total_gols) > 0) ||
+                          (Number(carreira?.jogos || 0) > Number(resumo.jogos_registrados))
+                        );
+                        if (resumo.media_gols != null && !isNaN(Number(resumo.media_gols))) {
+                          return Number(resumo.media_gols).toFixed(2);
+                        }
+                        if (isParcial && resumo.media_oficial_carreira != null && !isNaN(Number(resumo.media_oficial_carreira))) {
+                          return Number(resumo.media_oficial_carreira).toFixed(2);
+                        }
                         if (isParcial && carreira?.jogos && Number(carreira.jogos) > 0) {
                           return (Number(carreira.gols || resumo.total_gols) / Number(carreira.jogos)).toFixed(2);
                         }
-                        if (isParcial && resumo.media_oficial_carreira) {
-                          return Number(resumo.media_oficial_carreira).toFixed(2);
-                        }
-                        if (resumo.jogos_registrados && Number(resumo.jogos_registrados) > 0 && !isParcial) {
+                        if (!isParcial && resumo.jogos_registrados && Number(resumo.jogos_registrados) > 0) {
                           return (Number(resumo.total_gols || 0) / Number(resumo.jogos_registrados)).toFixed(2);
                         }
-                        return (resumo.media_gols != null && !isNaN(Number(resumo.media_gols)) && !isParcial ? Number(resumo.media_gols).toFixed(2) : '—');
+                        return '—';
                       })()}
                     </div>
                   </div>
```

---

## 5. Verification Method

1. **Patch Syntax and Dry Run**:
   ```bash
   patch --dry-run -p1 -i .agents/teamwork/teamwork_preview_explorer_m4_1/protagonista_atleta_feature12.patch
   ```
   *Expected outcome*: Exits with code 0 (`checking file frontend/src/components/ProtagonistaAtleta.jsx`).

2. **Frontend Build Verification**:
   ```bash
   patch -p1 < .agents/teamwork/teamwork_preview_explorer_m4_1/protagonista_atleta_feature12.patch
   npm run build --prefix frontend
   ```
   *Verified result*: `vite v5.4.21 building for production... ✓ built in 15.79s` with exit code 0.

3. **Mathematical Contrast Verification**:
   Run WCAG 2.2 formula checker:
   ```bash
   python3 -c "
   def lum(h):
       h=h.lstrip('#')
       c=[int(h[i:i+2],16)/255.0 for i in (0,2,4)]
       lin=[x/12.92 if x<=0.04045 else ((x+0.055)/1.055)**2.4 for x in c]
       return 0.2126*lin[0]+0.7152*lin[1]+0.0722*lin[2]
   print('Light ratio:', round((lum('F1E8DE')+0.05)/(lum('526337')+0.05), 2))
   print('Dark ratio:', round((lum('B7C59C')+0.05)/(lum('1B1A17')+0.05), 2))
   "
   ```
   *Expected outcome*: `Light ratio: 5.42`, `Dark ratio: 9.51` (both > 4.5:1).

4. **Adversarial Regression Test Harness**:
   ```bash
   pytest tests/test_challenger_m3_2_empirical.py -v
   ```
   *Verified result*: Confirms that Luís Fabiano retains `acervo_parcial=True`, `jogos_rotulo='Jogos c/ Gol'`, and `media_gols=0.53` without 1.00 or 1.06 distortion.
