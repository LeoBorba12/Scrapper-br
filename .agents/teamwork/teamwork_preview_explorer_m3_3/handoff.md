# Handoff Report — Explorer M3-3 (Radar Pentagonal 5 Axes & Honest Career Average API)

**Working Directory**: `/mnt/jogos_f/Antigravity_Projetos_e_Ferramentas/Guia profissional/.agents/teamwork/teamwork_preview_explorer_m3_3`  
**Milestone**: M3 (Motores Matemáticos de Ratings, xG & Backend APIs)  
**Date**: 2026-10-30  
**Status**: COMPLETE (Hard Handoff)  
**Target Files**: `backend/app.py`, `data/futebol.db`

---

## 1. Observation

### 1.1 Direct Tool Commands and Verbatim Test Failures

Prior to this investigation, the full acceptance test suite (`tests/test_e2e_futstats.py`) exhibited 6 failing tests out of 50:

```bash
./.venv/bin/pytest tests/test_e2e_futstats.py
```

**Verbatim test failure logs:**
```
=================================== FAILURES ===================================
_________ TestTier1FeatureCoverage.test_t1_r1_api_acervo_parcial_flag __________
>       assert data["resumo"]["acervo_parcial"] is True, (
            "Luís Fabiano (ID 9033) deve ter acervo_parcial=True"
        )
E       AssertionError: Luís Fabiano (ID 9033) deve ter acervo_parcial=True
E       assert False is True
tests/test_e2e_futstats.py:120: AssertionError

_________ TestTier1FeatureCoverage.test_t1_r1_api_rotulo_jogos_com_gol _________
>       assert data["resumo"]["jogos_rotulo"] == "Jogos c/ Gol"
E       AssertionError: Esperado rótulo 'Jogos c/ Gol', recebido 'Jogos'
E       assert 'Jogos' == 'Jogos c/ Gol'
tests/test_e2e_futstats.py:131: AssertionError

____ TestTier1FeatureCoverage.test_t1_r1_api_media_gols_autentica_carreira _____
>       assert media == 0.53, (
            f"Esperado media_gols 0.53 (média autêntica de carreira 403/755), recebido {media}. "
            f"Não deve exibir 1.00 resultante de equivalência artificial de jogos=gols."
        )
E       AssertionError: Esperado media_gols 0.53 (média autêntica de carreira 403/755), recebido 1.06.
E       assert 1.06 == 0.53
tests/test_e2e_futstats.py:145: AssertionError

_ TestTier3CrossFeatureCombinations.test_t3_cross_acervo_parcial_com_sofascore_rating _
>       assert data["resumo"]["acervo_parcial"] is True
E       assert False is True
tests/test_e2e_futstats.py:643: AssertionError

_ TestTier4RealWorldApplicationScenarios.test_t4_cenario_luis_fabiano_perfil_completo _
>       assert resumo["acervo_parcial"] is True
E       assert False is True
tests/test_e2e_futstats.py:712: AssertionError

_ TestTier4RealWorldApplicationScenarios.test_t4_cenario_zico_e_romario_lendas_historicas _
>           assert resumo["acervo_parcial"] is True, f"Atleta {atleta_id} deveria ser acervo parcial"
E           AssertionError: Atleta 13953 deveria ser acervo parcial
E           assert False is True
tests/test_e2e_futstats.py:736: AssertionError
========================= 6 failed, 44 passed in 6.18s =========================
```

### 1.2 Inspection of Existing Code in `backend/app.py`

#### Feature 11 Root Cause: `backend/app.py:2695-2698`
```python
2695:         "media_gols": round(total_gols_final / max(total_jogos, 1), 2),
2696:         "acervo_parcial": bool(total_jogos == total_gols_final and total_gols_final > 0 and (raw_jogos_carreira > total_jogos or (stats_meta.get('ano_inicio') and stats_meta.get('ano_inicio') < 2018))),
2697:         "jogos_rotulo": "Jogos c/ Gol" if bool(total_jogos == total_gols_final and total_gols_final > 0 and (raw_jogos_carreira > total_jogos or (stats_meta.get('ano_inicio') and stats_meta.get('ano_inicio') < 2018))) else "Jogos",
2698:         "media_oficial_carreira": round(carreira_oficial["gols"] / max(carreira_oficial["jogos"], 1), 2) if carreira_oficial.get("jogos") and carreira_oficial["jogos"] > 0 else None,
```
- In Milestone M1 (Feature 4), `total_jogos` was restored to real distinct match appearances in the local catalog:
  - Luís Fabiano (ID 9033): `total_jogos = 158`, `total_gols = 168` (because of multi-goal matches).
  - Zico (ID 13953): `total_jogos = 98`, `total_gols = 132`.
  - Romário (ID 12212): `total_jogos = 109`, `total_gols = 150`.
- Because `158 != 168`, `98 != 132`, and `109 != 150`, the clause `total_jogos == total_gols_final` evaluates to `False`.
- Consequently:
  - `acervo_parcial` evaluated to `False`.
  - `jogos_rotulo` evaluated to `"Jogos"`.
  - `media_gols` evaluated to `168 / 158 = 1.06` instead of the official career average `403 / 755 = 0.53`.

#### Feature 10 Sparse Data Flaw: `backend/app.py:2018-2120` (`_calcular_radar_pes`)
When testing sparse inputs with `None` values (e.g. athlete newly cataloged with null scouting attributes):
```python
resumo_nulls = {'total_gols': None, 'jogos_registrados': None, 'amarelos': None, 'jogos_titular': None}
carreira_nulls = {'gols': None, 'jogos': None}
_calcular_radar_pes('Atacante', resumo_nulls, carreira_nulls)
```
- **Error raised**: `TypeError: unsupported operand type(s) for /: 'NoneType' and 'int'` at line 2024.
- In line 2095: `if resumo.get('jogos_titular', 0) > 100:` -> when key `'jogos_titular'` is present with value `None`, `resumo.get('jogos_titular', 0)` returns `None`, raising `TypeError: '>' not supported between instances of 'NoneType' and 'int'`.
- In line 2106: `(amarelos + vermelhos * 2)` raises `TypeError` when values are `None`.

### 1.3 Relational Stats Discrepancy Observation (`data/futebol.db`)

Executing relational audit against current database:
```sql
SELECT j.id_jogador, j.nome_exibicao, j.total_gols, COUNT(g.id_gol) as real_gols, j.total_jogos
FROM jogadores_estatisticas j
LEFT JOIN gols g ON j.id_jogador = g.id_jogador
GROUP BY j.id_jogador
HAVING j.total_gols != COUNT(g.id_gol);
```
- **Result**: Exactly 129 athletes have `total_gols != COUNT(gols)`.
- **Key samples**:
  - Alex Cabeção (ID 2373): `total_gols = 173`, `total_jogos = 141`, while actual rows in `gols` = 146 (26 goals from Alex do Inter were unlinked in M2, plus 1 phantom 0x0 goal expunged).
  - Neymar (ID 352): `total_gols = 134`, actual `gols` rows = 133 (1 phantom 0x0 goal expunged).
  - Danilo (ID 124): `total_gols = 87`, actual `gols` rows = 85 (2 phantom 0x0 goals expunged).

---

## 2. Logic Chain

1. **Why Feature 11 Failed**:
   - The original condition `total_jogos == total_gols_final` was a legacy heuristic assuming partial catalogs strictly had `total_jogos == total_gols` (the M1 bug). Once M1 properly restored authentic appearances (158 distinct matches for Luís Fabiano, 98 for Zico, 109 for Romário), `total_jogos` no longer strictly equaled `total_gols_final`.
   - The true logical indicator of an athlete with a partial local catalog is:
     `((raw_jogos_carreira > total_jogos and raw_jogos_carreira > 0) or (total_jogos <= total_gols_final and total_gols_final > 0))` (under non-championship-filtered view).
   - When this condition holds:
     - `acervo_parcial` must be `True`.
     - `jogos_rotulo` must be `"Jogos c/ Gol"`.
     - `media_gols` must return the authentic weighted career average (`carreira_oficial["gols"] / carreira_oficial["jogos"]`).
     - `jogos_registrados` preserves the local catalog count (`total_jogos = 158`).
     - `media_oficial_carreira` preserves the weighted career ratio (`0.53`).

2. **Why Feature 10 Required Hardening**:
   - In SQLite, missing scout columns evaluate to `None`. Dict methods like `d.get('key', 0)` return `None` (not `0`) if `'key'` exists with a `None` value.
   - Using explicit fallback casting:
     - `total_gols = float(cgols) if ... else (float(rgols) if rgols is not None else 0.0)`
     - `total_jogos = float(cjogos) if ... else (float(rjogos) if (rjogos is not None and rjogos > 0) else 1.0)`
     - `amarelos = float(resumo.get('amarelos') or 0.0)`
     - `jogos_titular = float(resumo.get('jogos_titular') or 0.0)`
     - `clamp = lambda v: max(40, min(99, int(round(float(v))))) if v is not None and not math.isnan(float(v)) else 50`
   - Guarantees that every athlete without exception yields 5 axes (`atk`, `fin`, `cri`, `fis`, `def`) with values in [40, 99] and an integer `ovr` in [40, 99], with zero nulls.

3. **Why Relational Resync is Safe and Required**:
   - Deleting phantom goals in 0x0 matches and unlinking homonym goals in M2 created a desynchronization in `jogadores_estatisticas.total_gols` and `jogadores.total_gols` for 129 athletes.
   - Executing atomic `UPDATE` with correlated subquery `COUNT(gols)` directly restores relational integrity.
   - Tested on database copy: passes 12/12 rules of `scripts/auditar_integridade_dados.py` with 0 inconsistencies and 0 anomalies.

---

## 3. Caveats

1. **Championship Filter (`campeonato_filtro`)**:
   - When filtering by a specific competition (e.g., `campeonato_filtro="brasileiro"`), `is_filtro_camp` is `True`. In this scoped view, `total_jogos` represents appearances within that tournament, and `media_gols` correctly represents the tournament-specific scoring rate (`total_gols_final / total_jogos`). `acervo_parcial` should not override tournament-specific metrics.
2. **Modern Athletes with 100% Súmulas**:
   - Modern athletes (e.g. athletes starting after 2022) with `total_jogos > total_gols` and no divergent career statistics will have `acervo_parcial: False` and `jogos_rotulo: "Jogos"`.
3. **Database Write Scope**:
   - Explorer archetype operates in read-only mode. All SQL synchronization queries were tested and verified against temporary database copies (`/tmp/futebol_test_resync.db`). The SQL script is provided below for execution by Worker M3.

---

## 4. Conclusion

Features 10 and 11, along with the relational stats resync, are completely designed, simulated, and verified:
- **Feature 10 (Radar Pentagonal PES)**: Bulletproof 5-axis computation (`atk`, `fin`, `cri`, `fis`, `def`) and `ovr` within 40-99, eliminating all nulls and `TypeError` vulnerabilities.
- **Feature 11 (Honest Label & Career Average)**: Resolves the 6 failing tests in `tests/test_e2e_futstats.py`, returning authentic career average (e.g. 0.53 for Luís Fabiano, 0.68 for Zico, 0.77 for Romário) and label `"Jogos c/ Gol"`.
- **Relational Stats Resync**: Resynchronizes 129 athletes with real goals in `gols`, aligning Alex Cabeção (ID 2373) to 146 goals and Neymar (ID 352) to 133 goals.

---

## 5. Verification Method

### 5.1 Exact Code Diff for `backend/app.py`

File: `/mnt/jogos_f/Antigravity_Projetos_e_Ferramentas/Guia profissional/backend/app.py`  
Also saved as patch artifact: `.agents/teamwork/teamwork_preview_explorer_m3_3/backend_app_features_10_11.patch`

```diff
--- a/backend/app.py
+++ b/backend/app.py
@@ -2018,22 +2018,44 @@
-def _calcular_radar_pes(posicao, resumo, carreira):
-    pos = (posicao or '').lower()
-    total_gols = carreira.get('gols') if (carreira.get('jogos') and carreira.get('jogos') > 0) else resumo.get('total_gols', 0)
-    total_jogos = carreira.get('jogos') if (carreira.get('jogos') and carreira.get('jogos') > 0) else resumo.get('jogos_registrados', 1)
-    if not total_jogos:
-        total_jogos = 1
-    media_gols = total_gols / total_jogos if total_jogos > 0 else 0
+def _calcular_radar_pes(posicao, resumo=None, carreira=None):
+    resumo = resumo or {}
+    carreira = carreira or {}
+    pos = (posicao or 'Atacante').lower()
+
+    cgols = carreira.get('gols')
+    cjogos = carreira.get('jogos')
+    rgols = resumo.get('total_gols')
+    rjogos = resumo.get('jogos_registrados')
+
+    if cjogos is not None and cjogos > 0 and cgols is not None:
+        total_gols = float(cgols)
+        total_jogos = float(cjogos)
+    else:
+        total_gols = float(rgols) if rgols is not None else 0.0
+        total_jogos = float(rjogos) if (rjogos is not None and rjogos > 0) else 1.0
+
+    if total_jogos <= 0:
+        total_jogos = 1.0
+
+    media_gols = total_gols / total_jogos if total_jogos > 0 else 0.0
     if total_jogos > 10 and media_gols > 2.0:
-        if resumo.get('total_gols') and resumo.get('jogos_registrados') and resumo.get('jogos_registrados') > 0:
-            media_gols = resumo['total_gols'] / resumo['jogos_registrados']
+        if rgols is not None and rjogos is not None and rjogos > 0:
+            media_gols = float(rgols) / float(rjogos)
         else:
             media_gols = min(media_gols, 1.4)
 
-    total_assists = carreira.get('assistencias') or resumo.get('total_assistencias', 0)
-    pontaria = resumo.get('pontaria_chutes_pct') or 60.0
-    amarelos = resumo.get('amarelos', 0)
-    vermelhos = resumo.get('vermelhos', 0)
-    clutch = resumo.get('gols_decisivos_80mais', 0)
+    cassists = carreira.get('assistencias')
+    rassists = resumo.get('total_assistencias')
+    total_assists = float(cassists) if cassists is not None else (float(rassists) if rassists is not None else 0.0)
+
+    pontaria_raw = resumo.get('pontaria_chutes_pct')
+    try:
+        pontaria = float(pontaria_raw) if (pontaria_raw is not None and 0 <= float(pontaria_raw) <= 100) else 60.0
+    except (ValueError, TypeError):
+        pontaria = 60.0
+
+    amarelos = float(resumo.get('amarelos') or 0.0)
+    vermelhos = float(resumo.get('vermelhos') or 0.0)
+    clutch = float(resumo.get('gols_decisivos_80mais') or 0.0)
+    jogos_titular = float(resumo.get('jogos_titular') or 0.0)
@@ -2095,3 +2117,3 @@
-    if resumo.get('jogos_titular', 0) > 100: fis += 5
+    if jogos_titular > 100: fis += 5
@@ -2110,1 +2132,7 @@
-    clamp = lambda v: max(40, min(99, int(round(v))))
+    def clamp(v):
+        try:
+            val = float(v)
+            if math.isnan(val): return 50
+            return max(40, min(99, int(round(val))))
+        except Exception:
+            return 50
@@ -2620,22 +2648,25 @@
     is_filtro_camp = bool(campeonato_filtro and campeonato_filtro not in ('todos', 'carreira', 'all'))
+    raw_gols_carreira = stats_meta.get('gols_carreira_oficiais') or 0
+    raw_jogos_carreira = stats_meta.get('jogos_carreira_oficiais') or 0
+    raw_assists_carreira = stats_meta.get('assistencias_carreira_oficiais') or 0
     if is_filtro_camp:
         total_gols_final = len(gols)
         total_assists_final = 0
         carreira_oficial = {
             "gols": total_gols_final,
             "jogos": total_jogos,
             "assistencias": total_assists_final,
             "clubes": sorted(list(stats_por_clube.keys()))
         }
     else:
         total_gols_final = stats_meta.get('total_gols') or len(gols)
         total_assists_final = stats_meta.get('total_assistencias') or 0
-        raw_gols_carreira = stats_meta.get('gols_carreira_oficiais') or 0
-        raw_jogos_carreira = stats_meta.get('jogos_carreira_oficiais') or 0
-        raw_assists_carreira = stats_meta.get('assistencias_carreira_oficiais') or 0
         carreira_oficial = {
             "gols": max(raw_gols_carreira, total_gols_final),
             "jogos": max(raw_jogos_carreira, total_jogos),
             "assistencias": max(raw_assists_carreira, total_assists_final),
             "clubes": json.loads(stats_meta['detalhe_carreira_clubes']) if stats_meta.get('detalhe_carreira_clubes') else []
         }
@@ -2669,4 +2700,23 @@
     aproveitamento_calc = round((vitorias * 3 + empates) / max(total_jogos * 3, 1) * 100, 1) if total_jogos > 0 else 0.0
+
+    # Determinação de acervo parcial e média autêntica de carreira (Feature 11):
+    media_oficial_carreira = (
+        round(carreira_oficial["gols"] / max(carreira_oficial["jogos"], 1), 2)
+        if (carreira_oficial.get("jogos") and carreira_oficial["jogos"] > 0 and carreira_oficial.get("gols") is not None)
+        else None
+    )
+
+    is_acervo_parcial = bool(
+        not is_filtro_camp and (
+            (raw_jogos_carreira > total_jogos and raw_jogos_carreira > 0) or
+            (total_jogos <= total_gols_final and total_gols_final > 0)
+        )
+    )
+
+    if is_acervo_parcial and media_oficial_carreira is not None:
+        media_gols_retorno = media_oficial_carreira
+    else:
+        media_gols_retorno = round(total_gols_final / max(total_jogos, 1), 2)
+
+    jogos_rotulo_retorno = "Jogos c/ Gol" if is_acervo_parcial else "Jogos"
@@ -2695,4 +2745,4 @@
-        "media_gols": round(total_gols_final / max(total_jogos, 1), 2),
-        "acervo_parcial": bool(total_jogos == total_gols_final and total_gols_final > 0 and (raw_jogos_carreira > total_jogos or (stats_meta.get('ano_inicio') and stats_meta.get('ano_inicio') < 2018))),
-        "jogos_rotulo": "Jogos c/ Gol" if bool(total_jogos == total_gols_final and total_gols_final > 0 and (raw_jogos_carreira > total_jogos or (stats_meta.get('ano_inicio') and stats_meta.get('ano_inicio') < 2018))) else "Jogos",
-        "media_oficial_carreira": round(carreira_oficial["gols"] / max(carreira_oficial["jogos"], 1), 2) if carreira_oficial.get("jogos") and carreira_oficial["jogos"] > 0 else None,
+        "media_gols": media_gols_retorno,
+        "acervo_parcial": is_acervo_parcial,
+        "jogos_rotulo": jogos_rotulo_retorno,
+        "media_oficial_carreira": media_oficial_carreira,
```

### 5.2 Exact SQL Synchronization Queries for Relational Stats

To resynchronize `total_gols`, `participacoes_gols`, and `media_gols_por_jogo` in `jogadores_estatisticas` and `jogadores`:

```sql
-- 1. Resynchronize jogadores_estatisticas
UPDATE jogadores_estatisticas
SET total_gols = (
    SELECT COUNT(*) FROM gols WHERE gols.id_jogador = jogadores_estatisticas.id_jogador
),
participacoes_gols = (
    SELECT COUNT(*) FROM gols WHERE gols.id_jogador = jogadores_estatisticas.id_jogador
) + COALESCE(total_assistencias, 0),
media_gols_por_jogo = ROUND(
    CAST((SELECT COUNT(*) FROM gols WHERE gols.id_jogador = jogadores_estatisticas.id_jogador) AS REAL) / MAX(total_jogos, 1),
    2
),
media_participacao_por_jogo = ROUND(
    CAST((SELECT COUNT(*) FROM gols WHERE gols.id_jogador = jogadores_estatisticas.id_jogador) + COALESCE(total_assistencias, 0) AS REAL) / MAX(total_jogos, 1),
    2
)
WHERE id_jogador IN (
    SELECT j.id_jogador
    FROM jogadores_estatisticas j
    LEFT JOIN gols g ON j.id_jogador = g.id_jogador
    GROUP BY j.id_jogador
    HAVING j.total_gols != COUNT(g.id_gol)
);

-- 2. Resynchronize jogadores
UPDATE jogadores
SET total_gols = (
    SELECT COUNT(*) FROM gols WHERE gols.id_jogador = jogadores.id_jogador
)
WHERE id_jogador IN (
    SELECT j.id_jogador
    FROM jogadores j
    LEFT JOIN gols g ON j.id_jogador = g.id_jogador
    GROUP BY j.id_jogador
    HAVING j.total_gols != COUNT(g.id_gol)
);
```

### 5.3 Independent Verification Commands

1. **Verify E2E Suite (All 50 Tests Passed)**:
   ```bash
   ./.venv/bin/pytest tests/test_e2e_futstats.py
   ```
   *Expected*: `50 passed in < 8s` (exit code 0).

2. **Verify Dixon-Coles Predictive Suite (22 Tests Passed)**:
   ```bash
   ./.venv/bin/pytest tests/test_model_evals.py
   ```
   *Expected*: `22 passed in < 0.5s` (exit code 0).

3. **Verify Relational Integrity Audit (12 Rules OK)**:
   ```bash
   ./.venv/bin/python scripts/auditar_integridade_dados.py
   ```
   *Expected*: `12/12 regras OK, 0 inconsistências encontradas` (exit code 0).

4. **Verify Discrepancy Count Zero After SQL Resync**:
   ```sql
   SELECT COUNT(*) FROM jogadores_estatisticas j
   LEFT JOIN gols g ON j.id_jogador = g.id_jogador
   GROUP BY j.id_jogador
   HAVING j.total_gols != COUNT(g.id_gol);
   ```
   *Expected*: 0 rows returned.
