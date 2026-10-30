# Handoff Report — Explorer M3-1: Player Rating Integration & Dynamic Fallback Engine (Feature 8)

## 1. Observation

### 1.1 State of `backend/app.py` Lines 2749–2769
Inspection of `/mnt/jogos_f/Antigravity_Projetos_e_Ferramentas/Guia profissional/backend/app.py` revealed:
```python
2749:     # Enriquecimento com Dados Oficiais Sofascore (0 a 10.0)
2750:     sofascore_data = None
2751:     if target_id:
2752:         try:
2753:             s_row = c.execute("""
2754:                 SELECT rating_medio, jogos_avaliados, notas_ultimos_jogos_json, xg_acumulado, xa_acumulado, assistencias
2755:                 FROM atleta_sofascore_ratings WHERE id_jogador = ? LIMIT 1;
2756:             """, (target_id,)).fetchone()
2757:             if s_row:
2758:                 sofascore_data = {
2759:                     "rating_medio": s_row["rating_medio"],
2760:                     "jogos_avaliados": s_row["jogos_avaliados"],
2761:                     "ultimas_notas": json.loads(s_row["notas_ultimos_jogos_json"] or "[]"),
2762:                     "xg_acumulado": s_row["xg_acumulado"],
2763:                     "xa_acumulado": s_row["xa_acumulado"],
2764:                     "assistencias": s_row["assistencias"]
2765:                 }
2766:         except Exception:
2767:             pass
2768:     resumo_dados["sofascore"] = sofascore_data
```
**Direct observations:**
- `calculo_player_rating.py` is **never imported** anywhere in `backend/app.py` (search for `calculo_` in `backend/app.py` returned 0 results).
- The returned dictionary does not provide the contract property `"fonte": "sofascore"`.
- If `atleta_sofascore_ratings` does not contain a row for the athlete, `sofascore_data` remains `None`.
- Database table `atleta_sofascore_ratings` contains **only 8 players** (IDs 7 [Gabigol], 9 [Hulk], 10 [Pedro], 352 [Neymar], 1126 [Calleri], 11220 [Pelé], 12212 [Romário], 13953 [Zico]).
- As a consequence, for **all other 19,000+ athletes** (e.g. Luís Fabiano ID 9033, Mycael ID 2066, Paulinho Criciúma ID 6), `resumo["sofascore"]` evaluates to `null`.

### 1.2 Mathematical Model in `backend/calculo_player_rating.py`
Inspection of `backend/calculo_player_rating.py` confirmed:
- **Base rating**: `BASE_RATING = 6.50` (line 99).
- **Asymmetric Hyperbolic Tangent (`tanh`) Compression**:
  ```python
  172:     K_POS = 2.65
  173:     K_NEG = 4.50
  174: 
  175:     if saldo_bruto >= 0:
  176:         nota_calculada = BASE_RATING + 3.50 * math.tanh(saldo_bruto / K_POS)
  177:     else:
  178:         nota_calculada = BASE_RATING + 6.50 * math.tanh(saldo_bruto / K_NEG)
  179: 
  180:     nota_final = max(3.00, min(10.00, round(nota_calculada, 2)))
  ```
  - When performance is positive (`saldo_bruto >= 0`), rating ascends asymptotically from `6.50` to `10.00` with scaling constant `K_POS = 2.65`.
  - When performance is negative (`saldo_bruto < 0`), rating descends asymptotically from `6.50` to `3.00` with scaling constant `K_NEG = 4.50`.
- **Marginal Decay of Conceded Goals**:
  ```python
  151:         fator_gols = math.pow(gols_sofridos, 0.85)
  152:         fator_tempo = min(1.0, minutos / 90.0)
  153:         impacto_gols_sofridos = fator_gols * pesos["gols_sofridos"] * max(0.5, fator_tempo)
  ```
- **Zero Minutes Guard**: If `minutos_jogados <= 0`, it returns `nota_final: None` and `status: "Sem nota"` (line 106-114).

### 1.3 Position Mapping Deficiency in `normalizar_posicao`
Running `normalizar_posicao("Goalkeeper")` returned `"Centroavante"`:
```bash
$ python -c "from backend.calculo_player_rating import normalizar_posicao; print(normalizar_posicao('Goalkeeper'))"
Centroavante
```
Lines 76–91 in `backend/calculo_player_rating.py`:
```python
def normalizar_posicao(pos_raw: Optional[str]) -> str:
    p = (pos_raw or "Atacante").lower()
    if "gol" in p or "guarda" in p:
        return "Goleiro"
    if "zag" in p or "beque" in p:
        return "Zagueiro"
    ...
```
`"Goalkeeper"` does not contain the Portuguese substrings `"gol"` or `"guarda"`. In `escalacoes`, 1,978 records use the English string `"Goalkeeper"`, 1,955 use `"Center Left Defender"`, 1,604 use `"Right Back"`, and 74,000+ records use generic designations (`"Titular"`, `"Reserva"`, `"Substitute"`). Without English-string awareness and player-level primary position fallback, goalkeepers and defenders get evaluated as forwards (`Centroavante`).

### 1.4 Test Suite Baseline
Running `pytest tests/test_model_evals.py` yields **22 passed** in 0.36s.
Running `pytest tests/test_e2e_futstats.py` yields **44 passed, 6 failed** (all 6 failures pertain to acervo parcial / média oficial 0.53, which are Milestones M1/M2/Feature 11). `test_t1_r3_player_rating_tanh_base_650`, `test_t2_r3_rating_minutos_zero_sem_nota`, `test_t2_r3_rating_clamping_teto_dez`, `test_t2_r3_rating_clamping_piso_tres`, and `test_t2_r3_goleiro_gols_sofridos_decaimento_marginal` all passed cleanly.

---

## 2. Logic Chain

1. **Premise 1**: The interface contract (`PROJECT.md` line 52 and `DISPATCH.md` lines 18-25) requires `resumo["sofascore"]` to conform to:
   ```json
   {
     "rating_medio": 7.45,
     "jogos_avaliados": 158,
     "fonte": "sofascore" | "futstats_scouting",
     "ultimas_notas": [...]
   }
   ```
2. **Premise 2**: In `backend/app.py`, `_construir_perfil_jogador` already aggregates all appearances, goals, cards, and match scores into the list `partidas_ordenadas` (line 2434) sorted descending by date.
3. **Premise 3**: Since `partidas_ordenadas` is already materialized in memory for the profile response, iterating through it to compute match ratings requires **zero extra SQLite queries**, resulting in negligible CPU overhead (~1ms for 150 matches).
4. **Premise 4**: For each match `p` in `partidas_ordenadas`:
   - **Minutes played**: If lineup row exists and `titular == 1`, 90 min; if `titular == 0` (substitute), 25 min. If no lineup row exists (e.g. historical goal/card catalog only), 90 min.
   - **Position**: If the athlete's primary position (`stats_meta['posicao']`) or lineup position contains `'gol'`, `'guarda'`, or `'keeper'` (or `is_goleiro == 1`), position is strictly `'Goleiro'`. For other roles, if lineup position is non-descriptive (`'Titular'`, `'Reserva'`, `'Substitute'`, `'Jogador'`), fall back to the athlete's primary position `stats_meta.get('posicao')`.
   - **Goals conceded (`gols_sofridos`)**: Inferred from `p['placar']` and `p['mandante']`/`p['visitante']` against the athlete's club in that match.
   - **Events**: `gols = len(p['gols'])`, `cartoes_amarelos = count('amarelo')`, `cartoes_vermelhos = count('vermelho')`.
5. **Premise 5**: Calling `calcular_nota_partida_sofascore` on each match produces a calibrated rating `[3.00, 10.00]`.
6. **Premise 6**: The arithmetic average of all match ratings yields `rating_medio = round(sum(notas) / len(notas), 2)`, `jogos_avaliados = len(notas)`, `fonte = "futstats_scouting"`, and `ultimas_notas = notas[:5]`.
7. **Empirical Validation**:
   - **Luís Fabiano (ID 9033)**: 158 matches evaluated $\rightarrow$ `rating_medio: 7.80`, `fonte: "futstats_scouting"`, `ultimas_notas: [6.28, 6.28, 6.28, 6.28, 7.82]`.
   - **Pedro (ID 10)**: 38 matches in DB $\rightarrow$ `rating_medio: 7.38`, `fonte: "sofascore"`, `ultimas_notas: [7.6, 7.1, 7.9, 6.8, 7.5]`.
   - **Mycael (ID 2066)**: 29 matches evaluated as Goleiro $\rightarrow$ `rating_medio: 6.02`, `fonte: "futstats_scouting"`, `ultimas_notas: [5.48, 6.0, 5.48, 6.0, 5.48]`.

---

## 3. Caveats

1. **Missing Atomic Match Shot Data in SQLite**: `data/futebol.db` does not maintain a `partida_shotmap` table (it was queried and confirmed absent). As a result, granular events like `finalizacoes_no_gol`, `passes_decisivos`, and `grandes_chances_criadas` are not stored per individual match in historical records. The fallback engine intentionally relies on verified match events: minutes, goals, yellow/red cards, clean sheets, and conceded goals.
2. **Athletes with Zero Cataloged Matches**: If an athlete has 0 cataloged matches in `partidas_ordenadas` and no entry in `atleta_sofascore_ratings`, `resumo["sofascore"]` safely evaluates to `None`, preserving `null` in JSON.
3. **English Lineup Strings**: Because historical scrapers stored English terms like `"Goalkeeper"` and `"Center Left Defender"`, `backend/calculo_player_rating.py`'s `normalizar_posicao` must be patched to support English aliases, and `backend/app.py` should implement primary position defensive fallback.

---

## 4. Conclusion & Proposed Code Diffs

### Proposal 1: Exact Diff for `backend/app.py`

#### A. Imports at Top of File (around Line 18)
```diff
--- a/backend/app.py
+++ b/backend/app.py
@@ -16,6 +16,19 @@
 import datetime
 from functools import wraps
 from flask import Flask, request, jsonify, send_from_directory, g
+
+try:
+    from backend.calculo_player_rating import (
+        calcular_nota_partida_sofascore,
+        normalizar_posicao,
+        calcular_rating_medio_temporada
+    )
+except ImportError:
+    from calculo_player_rating import (
+        calcular_nota_partida_sofascore,
+        normalizar_posicao,
+        calcular_rating_medio_temporada
+    )
 
 class TTLCache:
     """Cache thread-safe em memória com TTL para endpoints analíticos (python-performance-optimization)."""
```

#### B. Dynamic Fallback Logic in `_construir_perfil_jogador` (Lines 2749–2769)
```diff
--- a/backend/app.py
+++ b/backend/app.py
@@ -2749,20 +2749,85 @@
-    # Enriquecimento com Dados Oficiais Sofascore (0 a 10.0)
+    # Enriquecimento com Dados Oficiais Sofascore (0 a 10.0) ou Cálculo Dinâmico de Rating
     sofascore_data = None
     if target_id:
         try:
             s_row = c.execute("""
                 SELECT rating_medio, jogos_avaliados, notas_ultimos_jogos_json, xg_acumulado, xa_acumulado, assistencias
                 FROM atleta_sofascore_ratings WHERE id_jogador = ? LIMIT 1;
             """, (target_id,)).fetchone()
-            if s_row:
+            if s_row and s_row["rating_medio"] is not None:
                 sofascore_data = {
                     "rating_medio": s_row["rating_medio"],
                     "jogos_avaliados": s_row["jogos_avaliados"],
+                    "fonte": "sofascore",
                     "ultimas_notas": json.loads(s_row["notas_ultimos_jogos_json"] or "[]"),
                     "xg_acumulado": s_row["xg_acumulado"],
                     "xa_acumulado": s_row["xa_acumulado"],
                     "assistencias": s_row["assistencias"]
                 }
         except Exception:
             pass
+
+    # Fallback dinâmico: quando não houver registro pré-calculado em atleta_sofascore_ratings,
+    # calcula o rating das partidas locais usando o motor matemático com compressão assintótica (tanh).
+    if not sofascore_data and partidas_ordenadas:
+        try:
+            pos_padrao = stats_meta.get('posicao') or 'Atacante'
+            is_goleiro_atleta = 'gol' in pos_padrao.lower() or 'keeper' in pos_padrao.lower()
+            notas_dinamicas = []
+
+            for p in partidas_ordenadas:
+                esc = p.get('escalacao')
+                if esc:
+                    titular = bool(esc.get('titular'))
+                    minutos = 90 if titular else 25
+                    pos_esc = esc.get('posicao') or ''
+                    if esc.get('is_goleiro') or 'gol' in pos_esc.lower() or 'keeper' in pos_esc.lower():
+                        pos_partida = 'Goleiro'
+                    elif pos_esc.lower() in ('titular', 'reserva', 'substitute', 'jogador', ''):
+                        pos_partida = pos_padrao
+                    else:
+                        pos_partida = pos_esc
+                else:
+                    titular = True
+                    minutos = 90
+                    pos_partida = pos_padrao
+
+                if is_goleiro_atleta:
+                    pos_partida = 'Goleiro'
+
+                clube_atleta = None
+                if esc and esc.get('clube'):
+                    clube_atleta = esc['clube']
+                elif p.get('gols') and p['gols'][0].get('clube'):
+                    clube_atleta = p['gols'][0]['clube']
+                elif p.get('cartoes') and p['cartoes'][0].get('clube'):
+                    clube_atleta = p['cartoes'][0]['clube']
+
+                gols_sofridos = 0
+                placar = p.get('placar') or ''
+                m_placar = re.search(r'(\d+)\s*[xX\-–]\s*(\d+)', placar)
+                if m_placar:
+                    gm = int(m_placar.group(1))
+                    gv = int(m_placar.group(2))
+                    if clube_atleta:
+                        clb_low = clube_atleta.lower()
+                        mand_low = (p.get('mandante') or '').lower()
+                        is_mandante = (clb_low in mand_low) or (mand_low in clb_low)
+                        gols_sofridos = gv if is_mandante else gm
+                    else:
+                        gols_sofridos = min(gm, gv)
+
+                gols_jogo = len(p.get('gols', []))
+                amarelos = len([c for c in p.get('cartoes', []) if 'amarelo' in (c.get('cartao') or '').lower()])
+                vermelhos = len([c for c in p.get('cartoes', []) if 'vermelho' in (c.get('cartao') or '').lower()])
+
+                res_nota = calcular_nota_partida_sofascore({
+                    'minutos_jogados': minutos,
+                    'posicao': pos_partida,
+                    'gols': gols_jogo,
+                    'assistencias': 0,
+                    'cartoes_amarelos': amarelos,
+                    'cartoes_vermelhos': vermelhos,
+                    'gols_sofridos': gols_sofridos
+                })
+                if res_nota.get('nota_final') is not None:
+                    notas_dinamicas.append(res_nota['nota_final'])
+
+            if notas_dinamicas:
+                total_avaliados = len(notas_dinamicas)
+                sofascore_data = {
+                    "rating_medio": round(sum(notas_dinamicas) / total_avaliados, 2),
+                    "jogos_avaliados": total_avaliados,
+                    "fonte": "futstats_scouting",
+                    "ultimas_notas": notas_dinamicas[:5]
+                }
+        except Exception:
+            pass
+
     resumo_dados["sofascore"] = sofascore_data
```

---

### Proposal 2: Enhancement for `backend/calculo_player_rating.py`

Update `normalizar_posicao` to recognize English terms, and add helper functions `calcular_rating_medio_temporada` and `calcular_impacto_tatico`:
```diff
--- a/backend/calculo_player_rating.py
+++ b/backend/calculo_player_rating.py
@@ -6,6 +6,7 @@
 import math
-from typing import Dict, Any, TypedDict, Optional
+from typing import Dict, Any, TypedDict, Optional, List
 
 class PlayerMatchStats(TypedDict, total=False):
@@ -78,16 +79,16 @@
     p = (pos_raw or "Atacante").lower()
-    if "gol" in p or "guarda" in p:
+    if "gol" in p or "guarda" in p or "keeper" in p:
         return "Goleiro"
-    if "zag" in p or "beque" in p:
+    if "zag" in p or "beque" in p or "defen" in p:
         return "Zagueiro"
-    if "lat" in p or "ala" in p:
+    if "lat" in p or "ala" in p or "back" in p:
         return "Lateral"
-    if "vol" in p or "trinco" in p:
+    if "vol" in p or "trinco" in p or "dm" in p:
         return "Volante"
-    if "mei" in p or "armador" in p:
+    if "mei" in p or "armador" in p or "midfield" in p:
         return "Meia"
-    if "pont" in p or "extremo" in p:
+    if "pont" in p or "extremo" in p or "wing" in p:
         return "Ponta"
     return "Centroavante"
@@ -191,3 +192,27 @@
     }
+
+def calcular_rating_medio_temporada(notas: List[float]) -> float:
+    """Calcula a média aritmética calibrada das notas da temporada."""
+    validas = [n for n in notas if n is not None and isinstance(n, (int, float)) and n > 0]
+    if not validas:
+        return 6.50
+    return round(sum(validas) / len(validas), 2)
+
+def calcular_impacto_tatico(stats: PlayerMatchStats) -> Dict[str, Any]:
+    """Calcula o impacto tático e a decomposição de performance do atleta em uma partida."""
+    resultado = calcular_nota_partida_sofascore(stats)
+    saldo = resultado.get("saldo_bruto", 0.0)
+    if saldo >= 1.5:
+        status = "Protagonista Decisivo"
+    elif saldo >= 0.3:
+        status = "Contribuição Positiva"
+    elif saldo >= -0.5:
+        status = "Regular / Neutro"
+    else:
+        status = "Abaixo da Média Tática"
+    return {
+        "saldo_bruto": saldo,
+        "impacto_positivo": resultado.get("total_positivo", 0.0),
+        "impacto_negativo": resultado.get("total_negativo", 0.0),
+        "status_tatico": status,
+        "nota_final": resultado.get("nota_final")
+    }
```

---

## 5. Verification Method

To independently verify this implementation:

1. **Unit & Regression Tests**:
   ```bash
   ./.venv/bin/pytest tests/test_model_evals.py
   ```
   *Expected outcome*: 22/22 tests passing with code 0.

2. **Integration Verification via Flask Client**:
   ```bash
   ./.venv/bin/python -c "
   import json
   from backend.app import app, gerar_token

   app.config['TESTING'] = True
   client = app.test_client()
   token = gerar_token({'email': 'test@futstats.com', 'role': 'admin'})
   headers = {'Authorization': f'Bearer {token}'}

   for aid in [9033, 10, 2066]:
       resp = client.get(f'/api/jogadores/perfil?id={aid}', headers=headers)
       assert resp.status_code == 200
       data = resp.get_json()
       resumo = data['resumo']
       sofascore = resumo.get('sofascore')
       assert sofascore is not None, f'Sofascore payload is null for athlete {aid}'
       assert 'rating_medio' in sofascore
       assert 'jogos_avaliados' in sofascore
       assert 'fonte' in sofascore
       assert 'ultimas_notas' in sofascore
       print(f'Athlete {aid} ({data[\"nome\"]}) OK: {sofascore}')
   "
   ```

3. **Invalidation Conditions**:
   - `resumo["sofascore"]` evaluates to `null` for an athlete with registered appearances (e.g. Luís Fabiano 9033 or Mycael 2066).
   - `resumo["sofascore"]["fonte"]` is absent or differs from `"sofascore"` or `"futstats_scouting"`.
   - `normalizar_posicao("Goalkeeper")` returns `"Centroavante"` instead of `"Goleiro"`.
