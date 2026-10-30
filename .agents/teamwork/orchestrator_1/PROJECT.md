# Project: Saneamento Integral FutStats

## Architecture
- **Data Layer (`data/futebol.db`)**: SQLite 3 database containing 115k+ matches (`partidas`), 152k+ lineups (`escalacoes`), 95k+ goals (`gols`), cards (`cartoes`), odds (`odds_partidas`), player profiles (`jogadores_estatisticas`) and official scouting ratings (`atleta_sofascore_ratings`).
- **Backend Services (`backend/`)**: Flask REST application (`app.py`), mathematical model for match predictions (Dixon-Coles / Poisson bivariate in `test_model_evals.py`), player rating algorithm (`calculo_player_rating.py` with tanh asymptotic compression), discrete Opta expected goals model (`calculo_xg_discreto.py`).
- **Frontend Presentation (`frontend/`)**: Vite + React 18 single page application, editorial design system (Areia `#F1E8DE`, Carvão `#1B1A17`, Oliva `#5A673E`, Terracota `#85573B`), modular components (`ProtagonistaAtleta.jsx`, `AthleteCompareView.jsx`), native SVG charts (`RadarPentagonPES.jsx`, `AthleteCareerTimeline.jsx`, `AthleteCareerBarChart.jsx`), report generators (`cardGenerator.js`, `pdfReportGenerator.js`).
- **Integrity & Verification Scripts (`scripts/`)**: `auditar_integridade_dados.py` (12 relational consistency rules).

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 1 | SQLite Storage Optimization (<94 MB) | Drop redundant indexes (`idx_partidas_data`, `idx_escalacoes_atleta`), drop legacy table `jogadores_resumo`, run VACUUM to reduce DB from 96.9 MB to ~88.5 MB (>5.4 MB margin below Vercel 94 MB limit). | M1 | Survey DB |
| 2 | Relational Audit Script Saneamento | Fix `scripts/auditar_integridade_dados.py`: renumber 1-12 sequentially, remove harmful auto-repair `SET total_jogos = MAX(total_jogos, total_gols)`, add checks for 0x0 matches with ghost goals and clubs with scraping titles. | M1 | Survey DB |
| 3 | Schema Expansion `atleta_sofascore_ratings` | Add columns `npxg_acumulado REAL`, `delta_xg REAL`, `perfil_clinico TEXT`, `taxa_conversao_pct REAL` to table `atleta_sofascore_ratings`. | M1 | Survey DB |
| 4 | Reversão do Bug Jogos=Gols no SQLite | Restore authentic `total_jogos` in `jogadores_estatisticas` based on distinct appearances in catalog for the 2,705 athletes artificially forced to total_jogos = total_gols, while preserving `gols_carreira_oficiais` and `jogos_carreira_oficiais`. | M1 | Survey DB / Backend |
| 5 | Reparo de Partidas Conmebol Invertidas | Fix reversed scores and teams in historical Conmebol matches (19997098 Palmeiras 3x0 River, 20027112 Grêmio 4x0 River) and sanitize ghost scraping matches. | M2 | Survey Backend / DB |
| 6 | Higienização de Homônimos e Clubes Espúrios | Disassociate invalid cross-linked goals/lineups (Mycael ID 2066 vs Beto Acosta, Pedro ID 10 vs Guabirá) and purge foreign clubs (River Plate, U. de Chile, Boca, San Lorenzo, etc.) from Brazilian players' career club strings. | M2 | Survey DB / Backend |
| 7 | Validação de Carreira Limpa Luís Fabiano | Guarantee Luís Fabiano (ID 9033) exhibits strictly genuine clubs (Vasco, São Paulo, Ponte Preta) with zero foreign Conmebol clubs. | M2 | Survey DB / User Req |
| 8 | Backend Player Rating Integration (tanh) | Connect `backend/calculo_player_rating.py` (asymptotic tanh 0.0-10.0 compression, base 6.50) into `backend/app.py` as default rating engine for all athletes, using `atleta_sofascore_ratings` when available and dynamic calculation as fallback. | M3 | Survey Backend |
| 9 | Backend xG/npxG/Delta xG & Clinical Profile | Connect `backend/calculo_xg_discreto.py` in `backend/app.py`: replace flawed inline formula (which forced negative delta xG), calculate authentic xG, npxG, Delta xG, and classify elite strikers correctly as "Clínico de Elite". | M3 | Survey Backend |
| 10 | Backend Radar Pentagonal PES Eixos | Compute 5 defensive axes (`atk`, `fin`, `cri`, `fis`, `def`) with overall `ovr` (40-99 scale) in `backend/app.py` ensuring zero nulls for key athletes. | M3 | Survey Backend |
| 11 | Backend Rótulo Honesto e Média Carreira | In `_construir_perfil_jogador`, when `acervo_parcial` is true, return authentic career average `media_gols` (`carreira_oficial["gols"] / carreira_oficial["jogos"]`, e.g. 0.53 for Luís Fabiano) and `jogos_rotulo: "Jogos c/ Gol"`. | M3 | Survey Backend |
| 12 | Frontend Badge Sofascore / Rating WCAG 2.2 AA | Update `ProtagonistaAtleta.jsx` badge from illegal neon green `#22c55e` (contrast 1.73:1) to editorial tokens `var(--positive)` (`#526337`, contrast 5.31:1) and support both Sofascore and FutStats ratings. | M4 | Survey Frontend |
| 13 | Frontend Média Leak Elimination | Fix average calculation bypasses in `AthleteCareerTimeline.jsx:234`, `AthleteCareerBarChart.jsx:222`, `cardGenerator.js:199`, and `pdfReportGenerator.js:16` to prevent revival of 1.00 average. | M4 | Survey Frontend |
| 14 | Frontend Radar Pentagonal & Empty State | Connect `RadarPentagonPES.jsx` to API payload `atleta.radar_pes` and implement honest empty state container when athlete lacks data. | M4 | Survey Frontend |
| 15 | Frontend Club List Defensive Shielding | Verify and render authentic career clubs in `ProtagonistaAtleta.jsx` and `AthleteCompareView.jsx`. | M4 | Survey Frontend |
| 16 | Frontend Build Verification | Verify `npm run build` exits with code 0 without rollup/bundle errors. | M4 | Survey Frontend |
| 17 | E2E Testing Suite (Tiers 1-4) | Comprehensive opaque-box test suite verifying all 4 requirements, generating `TEST_READY.md`. | M5 | E2E Test Track |
| 18 | Final Acceptance Verification | Verify 22/22 pytest in `tests/test_model_evals.py`, 12/12 in `scripts/auditar_integridade_dados.py`, database size < 94.0 MB, and frontend build code 0. | M5 | User Req |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M1 | SQLite Storage, Audit Script & Schema Saneamento | Features 1, 2, 3, 4: Redundant index pruning, VACUUM (<88.6 MB), schema update `atleta_sofascore_ratings`, `auditar_integridade_dados.py` fixes, undo artificial total_jogos = total_gols in DB. | none | DONE |
| M2 | Auto-Cura de Clubes Espúrios, Conmebol & Homônimos | Features 5, 6, 7: Conmebol match corrections (19997098, 20027112), homonym split (Mycael/Pedro), club string sanitization (Luís Fabiano 9033, Zinho, Ganso, etc.). | M1 | DONE |
| M3 | Motores Matemáticos de Ratings, xG & Backend APIs | Features 8, 9, 10, 11: Connect `calculo_player_rating.py` (tanh 0-10) and `calculo_xg_discreto.py` in `backend/app.py`, fix Delta xG / Clínico de Elite, compute radar_pes, return honest career average and "Jogos c/ Gol". | M1, M2 | DONE |
| M4 | Apresentação Visual no Frontend & WCAG 2.2 AA | Features 12, 13, 14, 15, 16: Update `ProtagonistaAtleta.jsx` badge with WCAG 2.2 AA token (`#526337`), eliminate 1.00 leaks in timeline/bar chart/card/PDF generators, radar parity, clean clubs display, `npm run build`. | M3 | IN_PROGRESS |
| M5 | E2E Testing Suite & Final Acceptance Hardening | Features 17, 18: Dual track test suite (Tiers 1-4, `TEST_READY.md`), 22/22 pytest `test_model_evals.py`, 12/12 `auditar_integridade_dados.py`, DB < 94 MB, final victory report. | M4 | PLANNED |

## Interface Contracts
### Database ↔ Backend (`backend/app.py`)
- `atleta_sofascore_ratings` columns: `id_jogador INT PRIMARY KEY, sofascore_id INT, nome_atleta TEXT, clube_atual TEXT, posicao TEXT, temporada_ano INT, rating_medio REAL, jogos_avaliados INT, minutos_jogados INT, gols INT, assistencias INT, xg_acumulado REAL, xa_acumulado REAL, npxg_acumulado REAL, delta_xg REAL, perfil_clinico TEXT, taxa_conversao_pct REAL, notas_ultimos_jogos_json TEXT, heatmap_pontos_json TEXT, atualizado_em TEXT`.
- `jogadores_estatisticas` fields: `id_jogador, nome_exibicao, total_jogos (real local appearances), total_gols, media_gols_por_jogo, gols_carreira_oficiais, jogos_carreira_oficiais, detalhe_carreira_clubes (JSON), clubes (comma-separated, clean Brazilian/official clubs only)`.

### Backend ↔ Frontend API (`/api/jogadores/perfil`)
- `resumo`:
  - `media_gols`: Number (career average if acervo_parcial is true, else local average)
  - `acervo_parcial`: Boolean (`true` if local games != official career games)
  - `jogos_rotulo`: String (`"Jogos c/ Gol"` if acervo_parcial else `"Jogos"`)
  - `jogos_registrados`: Integer (local matches count)
  - `media_oficial_carreira`: Number (e.g. 0.53 for Luís Fabiano)
  - `sofascore`: Object or `null` (`{"rating_medio": Float, "jogos_avaliados": Int, "fonte": "sofascore" | "futstats_scouting", "ultimas_notas": [...]}`)
- `radar_pes`:
  - `eixos`: Array of 5 objects `[{"key": "atk", "label": "Ataque", "valor": Int(40-99), "desc": String}, ...]`
  - `ovr`: Integer (40-99)
- `analytics_xg`:
  - `xg_acumulado`: Float
  - `xg_nao_penalti_npxg`: Float
  - `delta_xg`: Float
  - `perfil_clinico`: String (`"Clínico de Elite"` | `"Volume Shooter"` | `"Eficiente"` | `"Neutro"`)

## Code Layout
- `data/futebol.db`: SQLite database
- `backend/app.py`: Flask application, profile route `/api/jogadores/perfil`, radar calculation
- `backend/calculo_player_rating.py`: Player rating calculation engine (tanh asymptotic compression)
- `backend/calculo_xg_discreto.py`: Discrete Opta expected goals calculation engine
- `scripts/auditar_integridade_dados.py`: Relational integrity verification script (12 rules)
- `frontend/src/components/ProtagonistaAtleta.jsx`: Main athlete profile component
- `frontend/src/components/AthleteCompareView.jsx`: Head-to-head athlete comparison
- `frontend/src/components/charts/RadarPentagonPES.jsx`: 5-axis PES radar chart
- `frontend/src/components/charts/AthleteCareerTimeline.jsx`: Career seasons timeline chart
- `frontend/src/components/charts/AthleteCareerBarChart.jsx`: Career goals bar chart
- `frontend/src/utils/cardGenerator.js`: Shareable athlete card generator (PNG)
- `frontend/src/utils/pdfReportGenerator.js`: Scout dossier report generator (PDF)
- `tests/test_model_evals.py`: 22 predictive evaluation regression tests
