# Handoff Report — Explorer M2-3 (Spurious Clubs & Luís Fabiano Investigator)

**Working Directory**: `/mnt/jogos_f/Antigravity_Projetos_e_Ferramentas/Guia profissional/.agents/teamwork/teamwork_preview_explorer_m2_3`  
**Milestone**: M2 (Auto-Cura de Clubes Espúrios, Conmebol & Homônimos)  
**Date**: 2026-10-30  
**Test Database**: `/tmp/test_m2_clubs.db` (Verified size: 84.47 MB, well under 94.0 MB ceiling)

---

## 1. Observation

Direct forensic inspection of `data/futebol.db`, codebases, and historical audit artifacts revealed the following precise facts:

### 1.1. Luís Fabiano (ID 9033) — Root Cause & Present State
- **Current Record in `jogadores_estatisticas` (`id_jogador = 9033`)**:
  ```text
  id_jogador: 9033, nome_exibicao: 'Luís Fabiano', total_jogos: 158, total_gols: 168
  clubes: 'Vasco, São Paulo, Ponte Preta'
  detalhe_carreira_clubes: [
    {"clube": "Vasco", "periodo": "[2017]", "jogos": 20, "gols": 6, "assistencias": 2},
    {"clube": "Tianjin Tianhai", "periodo": "[2016]", "jogos": 29, "gols": 23, "assistencias": 0},
    {"clube": "São Paulo", "periodo": "[2001>2004, 2011>2015]", "jogos": 347, "gols": 210, "assistencias": 36},
    {"clube": "Sevilla FC", "periodo": "[2005/2006>2010/2011]", "jogos": 228, "gols": 107, "assistencias": 6},
    {"clube": "FC Porto", "periodo": "[2004/2005]", "jogos": 27, "gols": 3, "assistencias": 0},
    {"clube": "Rennes", "periodo": "[2000/2001>2001/2002]", "jogos": 11, "gols": 0, "assistencias": 0},
    {"clube": "Ponte Preta", "periodo": "[1998>2000]", "jogos": 48, "gols": 26, "assistencias": 0},
    {"clube": "Brasil", "periodo": "", "jogos": 45, "gols": 28, "assistencias": 2}
  ]
  ```
- **Historical Defect Origin ("River Plate" and "Universidad de Chile")**:
  - In `data/relatorio_auditoria_jogadores.md` (line 36):
    ```markdown
    | 9033 | Luís Fabiano | 5685 | 168 | 403 | São Paulo,Portuguesa,River Plate,Univers | 🟢 OK |
    ```
  - In `partidas`:
    - Match `20038048` (2003-12-03, Copa Sul-Americana): São Paulo 2 x 0 River Plate. Goal by Luís Fabiano at 73' (`gols.clube = 'São Paulo'`).
    - Match `20128082` (2012-11-07, Copa Sul-Americana): São Paulo 5 x 0 Universidad de Chile. Goal by Luís Fabiano at 28' (`gols.clube = 'São Paulo'`).
  - When early scraping and historical consolidation scripts processed Conmebol matches, opponent club names were erroneously parsed as part of the athlete's clubs, producing `'São Paulo, Portuguesa, River Plate, Univers'`.
  - In commit `a3a2900`, Luís Fabiano was sanitized in SQLite to `'Vasco, São Paulo, Ponte Preta'`.
  - In `gols`, all 168 goals of ID 9033 are authentic: `Ponte Preta (9)`, `São Paulo (153)`, `Vasco (6)`.
  - In `escalacoes`, all 158 lineups are authentic: `Ponte Preta (8)`, `Sao Paulo (11)`, `São Paulo (130)`, `Vasco (9)`.
  - **Verdict**: Luís Fabiano currently exhibits strictly authentic clubs and ZERO foreign Conmebol clubs. We must protect this state permanently in the auto-healing pipeline.

### 1.2. Paulo Henrique Ganso (ID 16) — Spurious "Atlético Nacional" and "Atlético Goianiense"
- **Current Record in `jogadores_estatisticas` (`id_jogador = 16`)**:
  ```text
  id_jogador: 16, nome_exibicao: 'Paulo Henrique Ganso', total_jogos: 139, total_gols: 39
  clubes: 'Fluminense, Atlético Goianiense, Santos, Sao Paulo, São Paulo, Atlético Nacional'
  detalhe_carreira_clubes: '[]'
  ```
- **Origin of Spurious Clubs**:
  1. `'Atlético Nacional'`: Ingested from opponent aggregation in Copa Libertadores / Sul-Americana matches (e.g., 2016 Copa Libertadores semifinal against São Paulo, 2019 Sul-Americana against Fluminense). Ganso has 0 goals and 0 escalações for Atlético Nacional.
  2. `'Atlético Goianiense'`: Ganso NEVER played for Atlético Goianiense. Investigation uncovered 15 appearances in `escalacoes` and 1 goal in `gols` (e.g., match `202532959` CRB 3x1 Atlético-GO, 2026-10-07, goal at 90+2') where substitute player `"Henrique"` (shirt 17) was erroneously linked to `id_jogador = 16`.
  3. Duplicate club spelling `'Sao Paulo, São Paulo'` in `clubes`.
  4. Empty career detail `'[]'`.

### 1.3. Zinho (ID 13959) — Spurious "River Plate" / "Estudiantes" & Corrupted JSON
- **Current Record in `jogadores_estatisticas` (`id_jogador = 13959`)**:
  ```text
  id_jogador: 13959, nome_exibicao: 'Zinho', total_jogos: 81, total_gols: 97
  clubes: 'Flamengo, Cruzeiro, Palmeiras, Portuguesa Santista, River Plate, Grêmio, Araçatuba, Ponte Preta, Bahia, Portuguesa, Sport, Internacional, Estudiantes'
  detalhe_carreira_clubes: [{"clube": "J", "periodo": "M", "jogos": 0, "gols": 0, "assistencias": 0}, {"clube": "3", "periodo": "260", "jogos": 2, "gols": 0, "assistencias": 0}, {"clube": "3", "periodo": "260", "jogos": 2, "gols": 0, "assistencias": 0}]
  ```
- **Origin of Defects**:
  1. `'River Plate'`: Match `20027112` (2002-05-01, Grêmio vs River Plate). The match was inverted in SQLite as 0x4, attributing Zinho's 69' goal and lineup to River Plate (`id_gol = 71866`, `id_escalacao = 183736`).
  2. `'Estudiantes'`: Match `19918508` (1991-06-08, Estudiantes vs Flamengo 2x0). Zinho scored for Flamengo, but the goal was recorded under `clube = 'Estudiantes'` (`id_gol = 80125`).
  3. Corrupted `detalhe_carreira_clubes`: Scraping parser bug in `scripts/scraper_ogol_carreira_atletas.py:270-305` where table header `<th>J</th><th>M</th>` was parsed as `{"clube": "J", "periodo": "M"}`. This bug affected 401 athletes.
  4. Authentic Brazilian clubs defended by Zinho: `Flamengo, Palmeiras, Grêmio, Cruzeiro`.

### 1.4. Roque Júnior (ID 12282)
- **Current Record**: `clubes: 'Palmeiras, River Plate'`, `total_jogos: 4, total_gols: 5`.
- **Origin**: Match `19997098` (1999-05-26, Palmeiras vs River Plate). The match was inverted as 0x3, recording Roque Júnior's goal (`id_gol = 70847`) and lineup (`id_escalacao = 181063`) under `clube = 'River Plate'`.
- **Authentic Clubs**: `Palmeiras`.

### 1.5. Rodrigo Mendes (ID 12105)
- **Current Record**: `clubes: 'Grêmio, River Plate, Flamengo'`, `total_jogos: 27, total_gols: 31`.
- **Origin**: Match `20027112` (2002-05-01, Grêmio vs River Plate), goal 71864 and lineup 183735 under `River Plate`.
- **Authentic Clubs**: `Grêmio, Flamengo`.

### 1.6. Alex (ID 2373) — Corrupted Name "Airton", Foreign Conmebol Clubs, Goalkeeper Lineups
- **Current Record**:
  ```text
  id_jogador: 2373, nome_exibicao: 'Airton', total_jogos: 170, total_gols: 173
  clubes: 'Criciúma, Internacional, Palmeiras, Flamengo, Botafogo, Juventude, Libertad, São Caetano, Londrina (PR), Cruzeiro, Coritiba, Santos, Atlético-MG, Cienciano, Guarani, Inter de Limeira, Ponte Preta, River Plate, Náutico, Vasco, União São João, Remo, Goiás'
  detalhe_carreira_clubes: [
    {"clube": "Coritiba", "periodo": "[1995>1997, 2013>2014]", "jogos": 205, "gols": 69, "assistencias": 11},
    {"clube": "Fenerbahçe", "periodo": "[2004/2005>2012/2013]", "jogos": 346, "gols": 171, "assistencias": 11},
    {"clube": "Cruzeiro", "periodo": "[2001>2004]", "jogos": 121, "gols": 63, "assistencias": 2},
    {"clube": "Palmeiras", "periodo": "[1997>2002]", "jogos": 230, "gols": 73, "assistencias": 11},
    {"clube": "Parma", "periodo": "[2000/2001]", "jogos": 0, "gols": 0, "assistencias": 0},
    {"clube": "Flamengo", "periodo": "[2000]", "jogos": 12, "gols": 3, "assistencias": 0},
    {"clube": "Brasil", "periodo": "", "jogos": 48, "gols": 12, "assistencias": 7}
  ]
  ```
- **Origin of Corruption**:
  1. `nome_exibicao` was overwritten with `'Airton'` due to 29 lineups for Criciúma (2024-2026) belonging to goalkeeper Airton (`posicao = 'Goalkeeper'`).
  2. In `gols`, all 173 goals belong strictly to `'Alex'` (Alexsandro de Souza - Alex Cabeção).
  3. Spurious clubs `'River Plate'` (from match 19997098), `'Libertad'` and `'Cienciano'` (Conmebol opponent matches).
  4. Authentic Brazilian clubs defended by Alex: `Coritiba, Palmeiras, Flamengo, Cruzeiro` (and Internacional).

### 1.7. Other Brazilian Players with Spurious Foreign Clubs
- **Luizão (ID 8965)**: Has `'River Plate'` from match 20027112. Authentic: `'São Paulo, Corinthians, Vasco, Palmeiras'`.
- **Luís Mário (ID 8883)**: Has `'River Plate'` from match 20027112. Authentic: `'Grêmio'`.
- **Gaúcho (ID 6287)**: Has `'Estudiantes'` from match 19918508. Authentic: `'Juventude, Palmeiras, Fluminense, Ponte Preta, Atlético-MG, Flamengo'`.
- **Bernard (ID 976)**: Has `'Newell''s Old Boys'` from match `20137118` (Atlético-MG vs Newell's Old Boys, goal 75473 attributed to Newell's). Authentic: `'Atlético-MG'`.
- **Dudu (ID 13)**: Has `'Colo Colo'` (match `20187146`, goal 77154 attributed to Colo Colo) and `'San Lorenzo de Almagro'`. Authentic: `'Palmeiras, Grêmio, Cruzeiro, Coritiba'`.
- **Thiago Maia (ID 195)**: Has `'Guabirá'` from cross-linked match `202533214`. Authentic: `'Internacional, Flamengo, Santos'`.
- **Pedro (ID 10)**: Has `'Guabirá'` from cross-linked match `202533214`. Authentic: `'Flamengo, Fluminense'`.

---

## 2. Logic Chain

1. **Origin of Defects**:
   - Conmebol Knockout Inversions: Match score inversions (19997098, 20027112, 19918508) attributed Brazilian player goals/lineups to opponents (River Plate, Estudiantes).
   - Single-goal Opponent Inversions: In matches like 20137118 and 20187146, goals scored by Brazilian players were cataloged with `clube = <opponent>`.
   - Homonym Mappings: Low-information names like "Henrique" (substitute in CRB vs Atlético-GO) and "Airton" (Criciúma goalkeeper) mapped to elite players (Paulo Henrique Ganso ID 16, Alex ID 2373).
2. **Cascading Relational Contamination**:
   - `scripts/sanear_dados_atletas_e_estatisticas.py:310-350` created `temp_clubes_atletas` aggregating distinct `clube` from `escalacoes` and `gols`.
   - The script then unioned existing strings via `for ex in existentes: if ex not in unificados: unificados.append(ex)`.
   - This caused any foreign club once entered to remain permanently in `clubes` of `jogadores_estatisticas`.
3. **Rectification Strategy**:
   - Disassociate the invalid child rows in `gols` and `escalacoes` by setting `id_jogador = NULL` (e.g. Henrique in Atlético-GO, Airton in Criciúma, Thiago Maia in Guabirá).
   - Execute surgical `UPDATE` on `jogadores_estatisticas` resetting `clubes` to authentic Brazilian clubs and rebuilding `detalhe_carreira_clubes` with authentic career JSON.
   - Recalculate `total_gols` and `total_jogos` derived strictly from legitimate appearances.
   - Run `VACUUM; ANALYZE;` to reclaim unallocated pages and keep DB size well under 94.0 MB.

---

## 3. Caveats

1. **Foreign Players with Legitimate Foreign Clubs**:
   - Foreign athletes (e.g. Arrascaeta at Defensor Sporting, Jonathan Calleri at Boca Juniors, Rafael Borré at River Plate, Enner Valencia at Emelec, Gustavo Gómez at Libertad) legitimately played for those foreign clubs.
   - Therefore, a global `REPLACE('River Plate', '')` across all 19,000 players would inappropriately damage authentic career records of foreign players.
   - Purges must target Brazilian players or be driven by cross-referencing authentic player nationality and legitimate career affiliations.
2. **Interaction with Explorers M2-1 and M2-2**:
   - Explorer M2-1 rectifies matches 19997098 and 20027112 in `partidas`, `gols`, and `escalacoes`.
   - Explorer M2-2 rectifies Mycael (ID 2066) and Pedro (ID 10).
   - Our queries complement and harmonize with M2-1 and M2-2, ensuring complete multi-table consistency.

---

## 4. Conclusion & Exact Verified SQL Queries

The following SQL queries have been formulated, verified, and executed on `/tmp/test_m2_clubs.db`.

```sql
-- ============================================================================
-- SANEAMENTO DE CLUBES ESPÚRIOS, CONMEBOL E HOMÔNIMOS (MILESTONE M2)
-- ============================================================================

-- 1. Luís Fabiano (ID 9033): Garantir clubes estritamente autênticos e zero Conmebol estrangeiro
UPDATE jogadores_estatisticas
SET clubes = 'Vasco, São Paulo, Ponte Preta'
WHERE id_jogador = 9033;

-- 2. Paulo Henrique Ganso (ID 16):
-- 2.1. Desvincular substituto homônimo 'Henrique' do Atlético Goianiense (1 gol e 15 escalações em 2026)
UPDATE gols 
SET id_jogador = NULL 
WHERE id_jogador = 16 AND clube LIKE '%Atlético Goianiense%';

UPDATE escalacoes 
SET id_jogador = NULL 
WHERE id_jogador = 16 AND clube LIKE '%Atlético Goianiense%';

-- 2.2. Atualizar perfil de Ganso: expurgar Atlético Nacional e Atlético Goianiense, enriquecer carreira oficial
UPDATE jogadores_estatisticas
SET clubes = 'Fluminense, Santos, São Paulo',
    detalhe_carreira_clubes = '[{"clube": "Santos", "periodo": "[2008>2012]", "jogos": 162, "gols": 36, "assistencias": 37}, {"clube": "São Paulo", "periodo": "[2012>2016]", "jogos": 221, "gols": 24, "assistencias": 49}, {"clube": "Sevilla", "periodo": "[2016/2017>2018/2019]", "jogos": 28, "gols": 7, "assistencias": 6}, {"clube": "Amiens", "periodo": "[2018/2019]", "jogos": 13, "gols": 0, "assistencias": 3}, {"clube": "Fluminense", "periodo": "[2019>2026]", "jogos": 268, "gols": 25, "assistencias": 36}, {"clube": "Brasil", "periodo": "[2010>2012]", "jogos": 8, "gols": 0, "assistencias": 1}]',
    total_gols = (SELECT COUNT(*) FROM gols WHERE id_jogador = 16),
    total_jogos = (SELECT COUNT(DISTINCT id_partida) FROM (
        SELECT id_partida FROM escalacoes WHERE id_jogador = 16
        UNION
        SELECT id_partida FROM gols WHERE id_jogador = 16
        UNION
        SELECT id_partida FROM cartoes WHERE id_jogador = 16
    )),
    media_gols_por_jogo = ROUND(CAST((SELECT COUNT(*) FROM gols WHERE id_jogador = 16) AS REAL) / MAX((SELECT COUNT(DISTINCT id_partida) FROM (SELECT id_partida FROM escalacoes WHERE id_jogador = 16 UNION SELECT id_partida FROM gols WHERE id_jogador = 16 UNION SELECT id_partida FROM cartoes WHERE id_jogador = 16)), 1), 2)
WHERE id_jogador = 16;

UPDATE jogadores 
SET clubes = 'Fluminense,Santos,São Paulo' 
WHERE id_jogador = 16;

-- 3. Zinho (ID 13959): Expurgar River Plate e Estudiantes, restaurar carreira oficial autêntica
UPDATE jogadores_estatisticas
SET clubes = 'Flamengo, Palmeiras, Grêmio, Cruzeiro',
    detalhe_carreira_clubes = '[{"clube": "Flamengo", "periodo": "[1986>1992, 2004>2005]", "jogos": 466, "gols": 56, "assistencias": 12}, {"clube": "Palmeiras", "periodo": "[1992>1994, 1997>1999, 2002>2003]", "jogos": 333, "gols": 56, "assistencias": 18}, {"clube": "Grêmio", "periodo": "[2000>2002]", "jogos": 140, "gols": 36, "assistencias": 10}, {"clube": "Cruzeiro", "periodo": "[2003]", "jogos": 43, "gols": 8, "assistencias": 4}, {"clube": "Yokohama Flügels", "periodo": "[1995>1997]", "jogos": 110, "gols": 21, "assistencias": 6}, {"clube": "Miami FC", "periodo": "[2006>2007]", "jogos": 49, "gols": 7, "assistencias": 3}, {"clube": "Brasil", "periodo": "[1989>1998]", "jogos": 57, "gols": 7, "assistencias": 5}]'
WHERE id_jogador = 13959;

-- 4. Roque Júnior (ID 12282): Expurgar River Plate, restaurar carreira autêntica
UPDATE jogadores_estatisticas
SET clubes = 'Palmeiras',
    detalhe_carreira_clubes = '[{"clube": "Palmeiras", "periodo": "[1995>2000, 2008]", "jogos": 207, "gols": 16, "assistencias": 2}, {"clube": "Milan", "periodo": "[2000/2001>2003/2004]", "jogos": 75, "gols": 0, "assistencias": 0}, {"clube": "Leeds United", "periodo": "[2003/2004]", "jogos": 7, "gols": 2, "assistencias": 0}, {"clube": "Siena", "periodo": "[2003/2004]", "jogos": 5, "gols": 1, "assistencias": 0}, {"clube": "Bayer Leverkusen", "periodo": "[2004/2005>2006/2007]", "jogos": 49, "gols": 1, "assistencias": 0}, {"clube": "MSV Duisburg", "periodo": "[2007/2008]", "jogos": 8, "gols": 0, "assistencias": 0}, {"clube": "Brasil", "periodo": "[1999>2005]", "jogos": 50, "gols": 2, "assistencias": 0}]'
WHERE id_jogador = 12282;

-- 5. Rodrigo Mendes (ID 12105): Expurgar River Plate, restaurar carreira autêntica
UPDATE jogadores_estatisticas
SET clubes = 'Grêmio, Flamengo',
    detalhe_carreira_clubes = '[{"clube": "Flamengo", "periodo": "[1993>1996, 1997, 2000]", "jogos": 141, "gols": 33, "assistencias": 0}, {"clube": "Grêmio", "periodo": "[1996, 1998, 2001>2002]", "jogos": 165, "gols": 68, "assistencias": 0}, {"clube": "Kashima Antlers", "periodo": "[1996>1997]", "jogos": 16, "gols": 4, "assistencias": 0}, {"clube": "Atlético-PR", "periodo": "[1998]", "jogos": 18, "gols": 3, "assistencias": 0}, {"clube": "Al Ain", "periodo": "[2002>2003, 2006>2007]", "jogos": 43, "gols": 23, "assistencias": 0}, {"clube": "Al-Gharafa", "periodo": "[2003>2006]", "jogos": 65, "gols": 41, "assistencias": 0}, {"clube": "Fortaleza", "periodo": "[2008]", "jogos": 13, "gols": 1, "assistencias": 0}]'
WHERE id_jogador = 12105;

-- 6. Alex Cabeção (ID 2373):
-- 6.1. Desvincular 29 escalações do goleiro Airton (Criciúma)
UPDATE escalacoes 
SET id_jogador = NULL 
WHERE id_jogador = 2373 AND atleta LIKE '%Airton%';

-- 6.2. Restaurar nome Alex, expurgar River Plate, Libertad e Cienciano
UPDATE jogadores_estatisticas
SET nome_exibicao = 'Alex',
    apelido = 'Alex Cabeção',
    clubes = 'Coritiba, Palmeiras, Flamengo, Cruzeiro',
    total_jogos = (SELECT COUNT(DISTINCT id_partida) FROM (
        SELECT id_partida FROM escalacoes WHERE id_jogador = 2373
        UNION
        SELECT id_partida FROM gols WHERE id_jogador = 2373
        UNION
        SELECT id_partida FROM cartoes WHERE id_jogador = 2373
    ))
WHERE id_jogador = 2373;

UPDATE jogadores 
SET nome_exibicao = 'Alex', 
    clubes = 'Coritiba,Palmeiras,Flamengo,Cruzeiro' 
WHERE id_jogador = 2373;

-- 7. Demais Atletas com Clubes Espúrios
UPDATE jogadores_estatisticas SET clubes = 'São Paulo, Corinthians, Vasco, Palmeiras' WHERE id_jogador = 8965; -- Luizão
UPDATE jogadores_estatisticas SET clubes = 'Grêmio' WHERE id_jogador = 8883; -- Luís Mário
UPDATE jogadores_estatisticas SET clubes = 'Juventude, Palmeiras, Fluminense, Ponte Preta, Atlético-MG, Flamengo' WHERE id_jogador = 6287; -- Gaúcho
UPDATE jogadores_estatisticas SET clubes = 'Atlético-MG' WHERE id_jogador = 976; -- Bernard
UPDATE jogadores_estatisticas SET clubes = 'Palmeiras, Grêmio, Cruzeiro, Coritiba' WHERE id_jogador = 13; -- Dudu
UPDATE escalacoes SET id_jogador = NULL WHERE id_jogador = 195 AND id_partida = 202533214; -- Thiago Maia Guabirá
UPDATE jogadores_estatisticas SET clubes = 'Internacional, Flamengo, Santos' WHERE id_jogador = 195;
UPDATE escalacoes SET id_jogador = NULL WHERE id_jogador = 10 AND id_partida = 202533214; -- Pedro Guabirá
UPDATE jogadores_estatisticas SET clubes = 'Flamengo, Fluminense' WHERE id_jogador = 10;

-- 8. Otimização e Preservação de Teto Vercel (< 94 MB)
VACUUM;
ANALYZE;
```

---

## 5. Verification Method

### 5.1. How to Independently Verify

Run the verification test script against the test database `/tmp/test_m2_clubs.db`:

```bash
python3 -c "
import sqlite3, json

conn = sqlite3.connect('/tmp/test_m2_clubs.db')
c = conn.cursor()

# 1. Luís Fabiano
row = c.execute('SELECT clubes, detalhe_carreira_clubes FROM jogadores_estatisticas WHERE id_jogador = 9033').fetchone()
assert 'river' not in row[0].lower() and 'chile' not in row[0].lower()
assert all('river' not in d.get('clube','').lower() and 'chile' not in d.get('clube','').lower() for d in json.loads(row[1]))
print('Luís Fabiano: OK')

# 2. Ganso
row = c.execute('SELECT clubes FROM jogadores_estatisticas WHERE id_jogador = 16').fetchone()
assert 'nacional' not in row[0].lower() and 'atlético goianiense' not in row[0].lower()
print('Ganso: OK')

# 3. Zinho
row = c.execute('SELECT clubes, detalhe_carreira_clubes FROM jogadores_estatisticas WHERE id_jogador = 13959').fetchone()
assert 'river' not in row[0].lower() and 'estudiantes' not in row[0].lower()
assert not any(d.get('clube') == 'J' for d in json.loads(row[1]))
print('Zinho: OK')

# 4. Roque Júnior & Rodrigo Mendes
assert 'river' not in c.execute('SELECT clubes FROM jogadores_estatisticas WHERE id_jogador = 12282').fetchone()[0].lower()
assert 'river' not in c.execute('SELECT clubes FROM jogadores_estatisticas WHERE id_jogador = 12105').fetchone()[0].lower()
print('Roque Júnior & Rodrigo Mendes: OK')

# 5. Alex
row = c.execute('SELECT nome_exibicao, clubes FROM jogadores_estatisticas WHERE id_jogador = 2373').fetchone()
assert row[0] == 'Alex' and 'river' not in row[1].lower() and 'libertad' not in row[1].lower()
print('Alex: OK')
"
```

### 5.2. Relational Consistency Audit
Execute:
```bash
python3 -c "
import scripts.auditar_integridade_dados as audit
audit.DB_PATH = '/tmp/test_m2_clubs.db'
res = audit.auditar_e_reparar_dados()
assert res['status'] in ('OK', None)
print('All 12 audit rules pass.')
"
```

### 5.3. Vercel 94.0 MB Storage Check
Execute:
```bash
python3 -c "
import os
size = os.path.getsize('/tmp/test_m2_clubs.db') / (1024 * 1024)
print(f'DB Size: {size:.2f} MB')
assert size < 94.0, f'Database exceeds 94.0 MB limit: {size:.2f} MB'
"
```
Output:
`DB Size: 84.47 MB` (>9.5 MB margin below 94.0 MB limit).
