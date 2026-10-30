# Relatório de Investigação — Survey Explorer 3 (Frontend UI & Visual Presentation)

## 1. Observation

A investigação inspecionou diretamente a arquitetura de apresentação visual, componentes React, gráficos SVG nativos, geradores de dossiê (PNG/PDF) e pipeline de build do frontend (`frontend/`).

### 1.1 Componentes de Atleta e ProtagonistaAtleta.jsx
- **Arquivo principal**: `frontend/src/components/ProtagonistaAtleta.jsx` (1816 linhas).
  - **Visão 1 — Entrada e Rankings (`!selectedPlayer`, linhas 42–434)**:
    - Campo de busca com autocomplete (`#busca-atleta-input`, linhas 99–120) e atalhos rápidos (Pelé, Zico, Gabigol, Hulk, Rogério Ceni, Romário, Roberto Dinamite, Arrascaeta).
    - Tabela de Top 20 atletas (linhas 276–431) com seletor de abas (`carreira`, `gols`, `assistencias`, `clutch`, `participacoes`, `aproveitamento`).
    - Nas linhas 339–360, a tabela tenta diferenciar jogos oficiais da carreira (`p.jogos_carreira`) de jogos locais (`p.jogos`), exibindo `⚠️ escopos mistos` quando detecta discrepância.
  - **Visão 2 — Composição Protagonista (linhas 436–1815)**:
    - Estrutura em grid de 3 colunas desktop (`.protagonista-grid`, linha 582):
      - **Coluna 1 (34%, linhas 590–814)**: Identidade, posição, número da camisa, badge Sofascore (`resumo.sofascore`), badge Nota Global (`notaScouting`), foto oficial / iniciais tipográficas, metadados biométricos (altura, peso, nascimento, situação, pé), período ativo e pílulas de clubes (`atleta.clubes`, linhas 796–806).
      - **Coluna 2 (33%, linhas 816–1027)**: Centro de Evidências Esportivas. Distribuição de gols por minuto (6 faixas em barras horizontais), componente `RadarPentagonPES` (linhas 861–866), pontaria %, gols decisivos 80+', aproveitamento % e painel de Analytics Profissional (Scouting Pro: G/90, Delta xG, xG/chute, Clutch, xA estimado, minutos).
      - **Coluna 3 (33%, linhas 1030–1260)**: Métricas Oficiais e Totais. Painel 1 (Carreira Oficial Consolidada, linhas 1033–1126) e Painel 2 (Registros na Base de Partidas — Catálogo BR, linhas 1129–1259).
    - Seção de Telemetria Ótica (linhas 1262–1305): `SpatialPitchMap` e `GoalMouthMap`.
    - Abas inferiores de dados detalhados (linhas 1308–1810): `partidas` (paginação de 25 em 25 com `ChevronLeft`/`ChevronRight`), `carreira_ogol` (tabela de clubes oficiais de toda a carreira), `titulos`, `temporadas`, `torneios` e `vitimas`.
- **Comparador H2H**: `frontend/src/components/AthleteCompareView.jsx` (1539 linhas):
  - Duelo lado a lado com `RadarDualPES`, placar de quesitos vencidos, bento grid de cards e tabela comparativa direta `matriz_scouts`.

---

### 1.2 Renderização de Jogos, Gols, Médias e Rótulo "Jogos c/ Gol"
- No painel da base catalogada em `ProtagonistaAtleta.jsx` (linhas 1156–1180):
  ```jsx
  1156: <div>
  1157:   <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
  1158:     {resumo.jogos_rotulo || (resumo.acervo_parcial || (resumo.jogos_registrados === resumo.total_gols && Number(resumo.total_gols) > 0 && Number(carreira?.jogos || 0) > Number(resumo.jogos_registrados)) ? 'Jogos c/ Gol' : 'Jogos no Catálogo')}
  1159:   </span>
  1160:   <div className="tabular-nums font-mono" style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>
  1161:     {resumo.jogos_registrados ?? 0}
  1162:   </div>
  1163: </div>
  1164: <div>
  1165:   <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
  1166:     {resumo.acervo_parcial || (resumo.jogos_registrados === resumo.total_gols && Number(resumo.total_gols) > 0 && Number(carreira?.jogos || 0) > Number(resumo.jogos_registrados)) ? 'Média Carreira' : 'Média Local'}
  1167:   </span>
  1168:   <div className="tabular-nums font-mono" style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-secondary)' }}>
  1169:     {(() => {
  1170:       const isParcial = resumo.acervo_parcial || (resumo.jogos_registrados === resumo.total_gols && Number(resumo.total_gols) > 0 && Number(carreira?.jogos || 0) > Number(resumo.jogos_registrados));
  1171:       if (isParcial && carreira?.jogos && Number(carreira.jogos) > 0) {
  1172:         return (Number(carreira.gols || resumo.total_gols) / Number(carreira.jogos)).toFixed(2);
  1173:       }
  1174:       if (isParcial && resumo.media_oficial_carreira) {
  1175:         return Number(resumo.media_oficial_carreira).toFixed(2);
  1176:       }
  1177:       if (resumo.jogos_registrados && Number(resumo.jogos_registrados) > 0 && !isParcial) {
  1178:         return (Number(resumo.total_gols || 0) / Number(resumo.jogos_registrados)).toFixed(2);
  1179:       }
  1180:       return (resumo.media_gols != null && !isNaN(Number(resumo.media_gols)) && !isParcial ? Number(resumo.media_gols).toFixed(2) : '—');
  1181:     })()}
  1182:   </div>
  1183: </div>
  ```
- **Vazamento e Bypass da Média em `AthleteCareerTimeline.jsx` (linha 234)**:
  ```jsx
  232: <span style={{ fontSize: '0.66rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Média:</span>
  233: <span className="font-mono tabular-nums" style={{ fontSize: '0.76rem', color: 'var(--accent)', fontWeight: 700 }}>
  234:   {temp.media_gols != null ? temp.media_gols : (temp.jogos > 0 ? (temp.gols / temp.jogos).toFixed(2) : '0.00')}
  235: </span>
  ```
  *Constatação*: Quando o backend detecta acervo parcial e define `temp.media_gols = null` para não distorcer a estatística, o componente `AthleteCareerTimeline.jsx` ignora essa proteção e divide `temp.gols / temp.jogos`, ressuscitando a média artificial `1.00` na interface!
- **Vazamento em `AthleteCareerBarChart.jsx` (linha 222)**:
  ```jsx
  222: <div className="font-mono" style={{ fontWeight: 700, color: 'var(--accent)' }}>{item.media_gols || '0.00'}</div>
  ```
  *Constatação*: Se `item.media_gols` for `null` devido a acervo parcial, o gráfico exibe `'0.00'`, fazendo parecer que o atacante teve média zero de gols.
- **Vazamento nos Exportadores PNG e PDF (`cardGenerator.js` e `pdfReportGenerator.js`)**:
  Em `cardGenerator.js` (linhas 199–202):
  ```javascript
  199: const gCar = atleta.gols_carreira_oficiais || atleta.gols || atleta.total_gols || 0;
  200: const jCar = atleta.jogos_carreira_oficiais || atleta.jogos || atleta.total_jogos || 0;
  201: const medG = jCar > 0 ? (gCar / jCar).toFixed(2) : '0.00';
  ```
  E em `pdfReportGenerator.js` (linhas 16–19):
  ```javascript
  16: const gCar = atleta.gols_carreira_oficiais || atleta.gols || atleta.total_gols || 0;
  17: const jCar = atleta.jogos_carreira_oficiais || atleta.jogos || atleta.total_jogos || 0;
  18: const medG = jCar > 0 ? (gCar / jCar).toFixed(2) : '0.00';
  ```
  *Constatação*: O backend envia os dados consolidados da carreira aninhados em `atleta.carreira_oficial.gols` (403) e `atleta.carreira_oficial.jogos` (755). Como a raiz `atleta` não possui `gols_carreira_oficiais`, ambos os geradores caem no fallback de `total_gols` (168) e `total_jogos` (168), gerando cards PNG e relatórios PDF com a média distorcida de `1.00 gol/jogo`!

---

### 1.3 Badge Sofascore / Rating e Contraste WCAG 2.2 AA
- Em `ProtagonistaAtleta.jsx` (linhas 606–640):
  ```jsx
  606: {resumo.sofascore && (
  607:   <div 
  608:     style={{ 
  609:       display: 'flex', 
  610:       alignItems: 'center', 
  611:       gap: '6px', 
  612:       padding: '4px 10px', 
  613:       borderRadius: 'var(--radius-control)', 
  614:       background: 'rgba(34, 197, 94, 0.12)',
  615:       border: '1px solid rgba(34, 197, 94, 0.4)',
  616:       boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
  617:     }}
  618:     title={`Rating Sofascore: ${resumo.sofascore.rating_medio}/10 (${resumo.sofascore.jogos_avaliados} jogos)...`}
  619:   >
  620:     <div style={{ textAlign: 'right', lineHeight: 1.15 }}>
  621:       <div style={{ fontSize: '0.60rem', fontWeight: 800, textTransform: 'uppercase', color: '#22c55e', letterSpacing: '0.04em' }}>
  622:         Sofascore
  623:       </div>
  624:       <div style={{ fontSize: '0.62rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
  625:         {resumo.sofascore.jogos_avaliados}j avaliados
  626:       </div>
  627:     </div>
  628:     <div 
  629:       className="font-mono tabular-nums" 
  630:       style={{ 
  631:         fontSize: '1.45rem', 
  632:         fontWeight: 900, 
  633:         color: '#22c55e', 
  634:         lineHeight: 1 
  635:       }}
  636:     >
  637:       {resumo.sofascore.rating_medio}
  638:     </div>
  639:   </div>
  640: )}
  ```
- **Auditoria de Cores e Acessibilidade (WCAG 2.2 AA)**:
  - O código utiliza o verde neon Tailwind hardcoded `#22c55e`.
  - No tema Areia (`#F1E8DE`, luminância relativa ~0.80):
    $$\text{Contraste de } \#22c55e \text{ contra } \#F1E8DE = \frac{0.80 + 0.05}{0.44 + 0.05} = 1.73:1$$
    **Resultado: REPROVAÇÃO GRAVE de WCAG 2.2 AA** (mínimo exigido: 4.5:1 para texto normal e 3.0:1 para componentes visuais/números grandes).
  - Além da quebra de acessibilidade, viola a regra editorial do `AGENTS.md` ("Proibido usar gradientes pastel lavanda/rosa genéricos" e obrigação da paleta Areia `#F1E8DE`, Carvão Quente `#1B1A17`, Oliva `#5A673E` e Terracota `#85573B`).
  - Utilizando o token de Oliva (`--positive` `#526337` no modo claro, luminância ~0.11):
    $$\text{Contraste de } \#526337 \text{ contra } \#F1E8DE = \frac{0.80 + 0.05}{0.11 + 0.05} = 5.31:1 \quad (\ge 4.5:1 \implies \mathbf{APROVADO})$$
    E no modo escuro (`#B7C59C` contra Carvão `#1B1A17`): contraste $8.9:1 \implies \mathbf{APROVADO}$.
- **População da tabela `atleta_sofascore_ratings`**:
  - Consulta ao SQLite via Python revelou que apenas **8 atletas** possuem registro em `atleta_sofascore_ratings` (IDs: 7, 9, 10, 352, 1126, etc.).
  - Para todos os outros 19.775 atletas, `resumo.sofascore` é `None` e o badge é simplesmente omitido.
  - No entanto, o motor matemático `backend/calculo_player_rating.py` já calcula o rating posicional (0.0 a 10.0, base 6.5, compressão `tanh`) por partida.

---

### 1.4 Radar Pentagonal PES e RadarDualPES
- **Componentes**: `frontend/src/components/charts/RadarPentagonPES.jsx` (392 linhas) e `RadarDualPES.jsx` (391 linhas).
- **5 Eixos Avaliados**:
  1. `atk`: **Ataque** (Presença ofensiva, volume de jogo no terço final)
  2. `fin`: **Finalização** (Pontaria, conversão, gols)
  3. `cri`: **Criação / Passe** (Assistências, visão de jogo, passes-chave)
  4. `fis`: **Físico / Presença** (Minutagem, longevidade, jogos, solidez)
  5. `def`: **Defesa / Disciplina** (Disciplina tática, baixo índice de cartões, desarme)
- **Escala e Normalização**: Valores inteiros de 40 a 99 (baseline PES/Winning Eleven).
- **Tratamento de Nulos / Fallback**:
  - Em `RadarPentagonPES.jsx` (linhas 21–43), se `atleta`, `resumo` e `carreira` forem vazios ou indefinidos, o componente executa o cálculo com 0 gols e 1 jogo, gerando valores padrão genéricos (atk=60, fin=59, cri=55, fis=65, def=52, OVR ~58).
  - *Problema*: Não existe renderização de empty state explícito quando o atleta não tem minutos/dados suficientes.
  - *Duplicação de Regra de Negócio*: O backend já possui a função `_calcular_radar_pes()` (`backend/app.py:2018`) que retorna exatamente `radar_pes = {"eixos": [...], "ovr": ...}`. O frontend `RadarPentagonPES.jsx` duplica todo o cálculo client-side e não consome `atleta.radar_pes`.
- **Estilização e Paleta**:
  - Implementado em SVG nativo leve (sem recharts/d3).
  - `RadarPentagonPES.jsx`: Gradiente com `var(--accent)`, `var(--positive)`, anel de pulso no hover, filtro de glow suave e tooltip explicativo abaixo do radar.
  - `RadarDualPES.jsx`: Cores editoriais estritas para confronto: Atleta 1 em Oliva (`#7C8F52`) e Atleta 2 em Terracota (`#B87550`).

---

### 1.5 Lista de Clubes na Carreira e Clubes Espúrios
- **Como a lista de clubes é montada na interface**:
  - Em `ProtagonistaAtleta.jsx` (linha 796):
    `{(atleta.clubes || []).map((c, idx) => <span key={idx}><ClubBadge nome={c} size={15} /><span>{c}</span></span>)}`
  - Em `AthleteCompareView.jsx` (linhas 1030–1035):
    `{atleta2.clubes.map((c, i) => <span key={i} className="pill-neutral">{c}</span>)}`
  - Na aba `carreira_ogol` (linhas 1684–1712):
    Montada a partir de `carreira.clubes` (`detalhe_carreira_clubes` do banco).
- **Origem dos Clubes Espúrios (ex: River Plate e Universidad de Chile)**:
  - O perfil do atleta recebe `atleta.clubes = [cb.strip() for cb in stats_meta['clubes'].split(',') if cb.strip()]` (`backend/app.py:2787`).
  - No banco `data/futebol.db`, a coluna `jogadores_estatisticas.clubes` foi gerada via sincronização automática em scripts legados (`scripts/auditar_integridade_dados.py:280`):
    `SELECT DISTINCT clube FROM (SELECT DISTINCT clube FROM escalacoes ... UNION SELECT DISTINCT clube FROM gols ...)`
  - Em partidas continentais da Conmebol (Libertadores / Sul-Americana), scrapers antigos inverteram o clube do gol em confrontos de mata-mata (ex: São Paulo x River Plate e São Paulo x Universidad de Chile), gravando o clube adversário estrangeiro no gol do atacante brasileiro.
  - Essa contaminação em `gols.clube` se propagou para `jogadores_estatisticas.clubes`, fazendo com que clubes estrangeiros nunca defendidos pelo atleta aparecessem na lista de pílulas do frontend.
  - Em contrapartida, a tabela de carreira oficial (`carreira_oficial.clubes` vinda de `detalhe_carreira_clubes`) contém os 8 clubes legítimos de Luís Fabiano (Vasco, Tianjin, São Paulo, Sevilla, Porto, Rennes, Ponte Preta, Brasil).

---

### 1.6 Pipeline de Build e Restrições de Empacotamento
- **Configuração**:
  - `frontend/package.json`: Vite 5.4.10, React 18.3.1, `@vitejs/plugin-react` 4.3.3, `lucide-react` 0.460.0.
  - `frontend/vite.config.js`: Proxy `/api` para `http://127.0.0.1:5000`.
- **Execução do Build**:
  - Comando: `npm run build` na pasta `frontend/`.
  - Resultado: **Código de saída 0 (Sucesso em 4.68s)**.
  - Artefatos gerados em `frontend/dist/`:
    - `dist/index.html`: 0.86 kB
    - `dist/assets/index-BdtJzmHv.css`: 10.91 kB (gzip: 2.85 kB)
    - `dist/assets/index-NiCB4jn5.js`: 617.39 kB (gzip: 140.69 kB)
- **Teto Vercel e Restrições de Bundle**:
  - O bundle do frontend (JS + CSS) soma apenas **~630 kB**, ocupando menos de **0.7%** do limite de 95 MB da Vercel.
  - Vite emitiu aviso de chunk único > 500 kB (`index-NiCB4jn5.js`). Isso pode ser otimizado configurando `build.rollupOptions.output.manualChunks` no `vite.config.js` para separar `vendor-react` e `vendor-lucide`.
  - O teto crítico do projeto de 94.0 MB é relativo ao arquivo SQLite `data/futebol.db` (atualmente com ~70 MB).

---

## 2. Logic Chain

1. **A distorção de 1.00 gol/jogo é alimentada tanto no banco quanto em fallbacks reativos no frontend**:
   - No backend, `jogadores_estatisticas.total_jogos` foi nivelado a `total_gols` quando não havia súmulas completas pré-2018.
   - Em `ProtagonistaAtleta.jsx`, o Painel 2 já possui a lógica de exibir "Jogos c/ Gol" e "Média Carreira" quando `resumo.acervo_parcial` ou a guarda `total_gols === jogos_registrados` é disparada.
   - Porém, identificamos **três pontos cegos no frontend** onde o cálculo de 1.00 ainda vaza:
     - Em `AthleteCareerTimeline.jsx:234`, que recalcula `(temp.gols / temp.jogos).toFixed(2)` se `temp.media_gols` for `null`.
     - Em `AthleteCareerBarChart.jsx:222`, que exibe `'0.00'` ao invés de rótulo honesto.
     - Em `cardGenerator.js:199` e `pdfReportGenerator.js:16`, que buscam `atleta.gols_carreira_oficiais` na raiz em vez de `atleta.carreira_oficial.gols`, revertendo para os 168 gols em 168 jogos locais.

2. **O badge Sofascore precisa de correção imediata de contraste e ampliação de cobertura**:
   - `#22c55e` viola WCAG 2.2 AA (1.73:1 contra Areia `#F1E8DE`).
   - A substituição pelos tokens editoriais `--positive` (`#526337`) e `--positive-bg` (`#DFE6D1`) eleva o contraste para 5.31:1, cumprindo WCAG 2.2 AA e as diretrizes estéticas de 2026.
   - Como apenas 8 atletas possuem dados em `atleta_sofascore_ratings`, a arquitetura deve suportar o fallback gracioso para o player rating matemático (0.0 a 10.0) gerado pelo motor `backend/calculo_player_rating.py` com rótulo "Rating FutStats" ou "Scouting Rating".

3. **O Radar Pentagonal PES possui base SVG sólida, mas requer paridade de dados e empty states**:
   - `RadarPentagonPES.jsx` deve priorizar `atleta.radar_pes?.eixos` quando fornecido pela API REST para garantir paridade 100% com o backend e relatórios.
   - Se um atleta não possuir partidas ou minutagem suficiente, o radar deve renderizar um container de fallback honesto ("Dados insuficientes para vetor tático pentagonal") em vez de inventar notas em torno de 58 OVR.

4. **Clubes espúrios devem ser blindados no frontend e saneados na causa-raiz**:
   - O frontend renderiza cegamente `atleta.clubes`.
   - Se `carreira_oficial.clubes` estiver disponível no payload, o componente pode validar e filtrar apenas clubes oficiais ou clubes brasileiros legítimos, impedindo que adversários Conmebol apareçam como se fossem clubes defendidos.

---

## 3. Caveats

- **Ambiente de Testes do Frontend**: Não há suíte automatizada de testes Jest/Vitest em `frontend/` (os testes de regressão estão em Python com `pytest tests/test_model_evals.py`). A integridade do frontend é verificada via build estático do Vite (`npm run build`).
- **Escopo Read-Only**: Como agente explorer em modo de investigação, nenhuma alteração em código de produção ou banco de dados foi aplicada diretamente neste turno. Todas as correções propostas estão documentadas com trechos de código e linhas exatas.

---

## 4. Conclusion

O frontend do FutStats possui uma fundação arquitetural bem estruturada (Vite + React, paleta editorial 2026 em `tokens.css`, componentes SVG nativos sem peso de bibliotecas externas). No entanto, para atender aos critérios de aceitação do projeto, as seguintes ações pontuais devem ser executadas pelo time de implementação:

1. **Correção de Bypasses da Média Distorcida**:
   - Em `frontend/src/components/charts/AthleteCareerTimeline.jsx` (linha 234): alterar para exibir `temp.media_gols != null ? temp.media_gols : (temp.acervo_parcial ? 'Acervo Parcial*' : '—')`.
   - Em `frontend/src/components/charts/AthleteCareerBarChart.jsx` (linha 222): exibir `item.media_gols ? item.media_gols : (item.acervo_parcial ? 'Acervo Parcial*' : '—')`.
   - Em `frontend/src/utils/cardGenerator.js` (linha 199) e `frontend/src/utils/pdfReportGenerator.js` (linha 16): verificar `atleta.carreira_oficial?.gols` e `atleta.carreira_oficial?.jogos` antes de recorrer a `total_gols`/`total_jogos`.
2. **Harmonização do Badge Sofascore / Rating 0–10 (WCAG 2.2 AA)**:
   - Substituir `#22c55e` e `rgba(34, 197, 94, ...)` em `ProtagonistaAtleta.jsx:614-635` por `var(--positive)`, `var(--positive-bg)` e borda `var(--accent)`.
   - Permitir que o badge exiba tanto o rating oficial do Sofascore quanto a nota de scouting matemática (0.0 a 10.0) formatada quando a tabela de ratings estiver vazia.
   - Adicionar o badge de rating 0–10 também aos cards do `AthleteCompareView.jsx`.
3. **Paridade no Radar Pentagonal PES**:
   - Ajustar `RadarPentagonPES.jsx` para receber e renderizar `atleta.radar_pes?.eixos` e `atleta.radar_pes?.ovr` diretamente do backend, usando `calcAttributes()` apenas como fallback local.
   - Adicionar empty state explícito quando o atleta não possuir dados registrados.
4. **Saneamento Visual de Clubes**:
   - Blindar a renderização de `atleta.clubes` para dar preferência a `carreira_oficial.clubes` quando presente ou filtrar clubes foreign catalogados inadvertidamente como adversários.

---

## 5. Verification Method

Para verificar de forma independente as observações deste relatório:

1. **Build do Frontend**:
   ```bash
   cd "frontend"
   npm run build
   ```
   *Critério de aceitação*: Deve concluir com código 0 e tempo inferior a 10s.

2. **Suíte de Regressão Matemática e de Predição**:
   ```bash
   .venv/bin/pytest tests/test_model_evals.py
   ```
   *Critério de aceitação*: 22/22 testes aprovados.

3. **Auditoria de Contraste e Tokens**:
   - Inspecionar `frontend/src/tokens.css` e comparar com as linhas 614–635 de `frontend/src/components/ProtagonistaAtleta.jsx`.
   - Testar o contraste das cores `#22c55e` (1.73:1 - Reprovado) vs `#526337` (5.31:1 - Aprovado) contra Areia `#F1E8DE`.

4. **Verificação dos Vazamentos de Média**:
   - Inspecionar `frontend/src/components/charts/AthleteCareerTimeline.jsx:234`.
   - Inspecionar `frontend/src/utils/cardGenerator.js:199-202` e `frontend/src/utils/pdfReportGenerator.js:16-19`.
