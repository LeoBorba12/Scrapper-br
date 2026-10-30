# Relatório de Investigação Técnica — Survey Explorer 2
## Backend, Estatísticas Avançadas & Motor Matemático FutStats

**Data da Auditoria:** 2026-10-30T18:35:00Z  
**Autor:** Survey Explorer 2 (Backend & Advanced Metrics Engine)  
**Destinatário:** Parent Orchestrator (`9c2d948a-bd66-4e27-83b1-9e8d50e60942`)  
**Workspace:** `/mnt/jogos_f/Antigravity_Projetos_e_Ferramentas/Guia profissional`

---

## 1. Observation (Observações Diretas do Código e Banco de Dados)

### A. Endpoints de Perfil de Atleta e Origem da Média 1.00
- **Arquivo `backend/app.py`**:
  - Linha 2810: Rota `@app.route('/api/jogadores/perfil', methods=['GET'])` com decorator `@require_auth`.
  - Linha 2304: Função central `_construir_perfil_jogador(conn, player_id=None, nome=None, clube_filtro=None, limit_partidas=100, campeonato_filtro=None)`.
  - Linha 2447: `total_jogos = max(stats_meta.get('total_jogos', 0), len(partidas_ordenadas))`
  - Linha 2695: `"media_gols": round(total_gols_final / max(total_jogos, 1), 2)`
  - Linha 2696: `"acervo_parcial": bool(total_jogos == total_gols_final and total_gols_final > 0 and (raw_jogos_carreira > total_jogos or (stats_meta.get('ano_inicio') and stats_meta.get('ano_inicio') < 2018)))`
  - Linha 2697: `"jogos_rotulo": "Jogos c/ Gol" if ... else "Jogos"`
  - Linha 2698: `"media_oficial_carreira": round(carreira_oficial["gols"] / max(carreira_oficial["jogos"], 1), 2) if carreira_oficial.get("jogos") and carreira_oficial["jogos"] > 0 else None`
- **Banco de Dados `data/futebol.db` (Tabela `jogadores_estatisticas`)**:
  - Atleta Luís Fabiano (ID 9033): `total_jogos = 168`, `total_gols = 168`, `media_gols_por_jogo = 1.0`, `gols_carreira_oficiais = 403`, `jogos_carreira_oficiais = 755` (média oficial real = 0.53).
  - Execução de query SQL no banco:
    ```sql
    SELECT COUNT(*) FROM jogadores_estatisticas WHERE total_jogos = total_gols AND total_gols >= 5;
    ```
    **Resultado observado:** Exatamente `2.705` atletas possuem `total_jogos == total_gols >= 5` com `media_gols_por_jogo = 1.0`!
    Entre eles:
    - Marcelinho Carioca (ID 9350): 207 jogos, 207 gols (1.00) vs Carreira: 878 jogos, 307 gols (0.35)
    - Edmundo (ID 5168): 204 jogos, 204 gols (1.00) vs Carreira: 744 jogos, 360 gols (0.48)
    - Roberto Dinamite (ID 11967): 174 jogos, 174 gols (1.00) vs Carreira: 860 jogos, 512 gols (0.60)
    - Romário (ID 12212): 150 jogos, 150 gols (1.00) vs Carreira: 961 jogos, 744 gols (0.77)
    - Luizão (ID 8980): 145 jogos, 145 gols (1.00) vs Carreira: 532 jogos, 245 gols (0.46)
    - Túlio Maravilha (ID 13219): 140 jogos, 140 gols (1.00) vs Carreira: 845 jogos, 599 gols (0.71)
- **Mecanismo de Geração do Bug**:
  - `scripts/sanitizar_dashboard_e_atletas.py` (linhas 282-289) e `scripts/auditar_integridade_dados.py` (linhas 308-315) executavam periodicamente:
    ```sql
    UPDATE jogadores_estatisticas
    SET total_jogos = MAX(total_jogos, total_gols),
        media_gols_por_jogo = ROUND(CAST(total_gols AS REAL) / MAX(MAX(total_jogos, total_gols), 1), 2)
    WHERE total_jogos < total_gols OR media_gols_por_jogo > 2.0;
    ```
    Como para acervos pré-2018 apenas os jogos com gols estavam catalogados na tabela `gols` e as escalações minuto a minuto (`escalacoes`) eram incompletas, essa cláusula cravou `total_jogos = total_gols`, forçando a média 1.00 em lote.

### B. Motor Matemático de Notas Sofascore (0.0 a 10.0) com Compressão Assintótica (tanh)
- **Arquivo `backend/calculo_player_rating.py`**:
  - Existe e implementa rigorosamente:
    - `WEIGHT_MATRIX`: Matriz de coeficientes ponderados para 7 posições táticas (`Goleiro`, `Zagueiro`, `Lateral`, `Volante`, `Meia`, `Ponta`, `Centroavante` + aliases `Atacante`, `Defensor`, `Meio-Campo`).
    - `BASE_RATING = 6.50`.
    - Eventos lineares: gols, assistências, finalizações no gol, chutes para fora, grandes chances criadas, grandes chances perdidas, passes decisivos, pênaltis sofridos/cometidos.
    - Cartões: amarelos (-0.25 a -0.35) e vermelhos (-1.65 a -1.80).
    - Decaimento marginal defensivo de gols sofridos: `fator_gols = math.pow(gols_sofridos, 0.85)` com bônus de clean sheet.
    - Amortecimento de substitutos (< 20 min): `saldo_bruto *= (0.5 + 0.5 * (minutos / 20.0))`.
    - Curva assintótica hiperbólica assimétrica (`math.tanh`):
      - Se `saldo_bruto >= 0`: `nota = 6.50 + 3.50 * math.tanh(saldo_bruto / 2.65)` (assíntota exata em 10.00).
      - Se `saldo_bruto < 0`: `nota = 6.50 + 6.50 * math.tanh(saldo_bruto / 4.50)` (assíntota exata em 0.00).
      - Clamping final: `max(3.00, min(10.00, round(nota_calculada, 2)))`.
- **Status de Integração no Backend**:
  - `calculo_player_rating.py` **NÃO está importado em `backend/app.py`**.
  - A tabela `atleta_sofascore_ratings` em `data/futebol.db` possui **apenas 8 registros** inseridos estaticamente por `scripts/scraper_sofascore_ratings_pipeline.py` (Gabriel Barbosa, Hulk, Pedro, Neymar, Jonathan Calleri, Pelé, Romário, Zico).
  - Em `backend/app.py` (linha 2753), a busca em `atleta_sofascore_ratings` retorna `None` para todos os outros 19.775 atletas.
  - Em `frontend/src/components/ProtagonistaAtleta.jsx` (linha 606), `{resumo.sofascore && (...)}` só renderiza o badge verde do Sofascore se `sofascore` não for nulo. Por isso, 99.9% dos atletas não exibem a nota.

### C. Métricas de xG, npxG e Eficiência Clínica (Delta xG)
- **Implementação Existente em `backend/calculo_xg_discreto.py`**:
  - Matriz discreta aditiva Opta/Brasileirão calibrada: `XG_LOOKUP_MATRIX` em 5 zonas (`pequena_area`, `grande_area_central`, `grande_area_diagonal`, `fora_area_central`, `longa_distancia`), 4 tipos de lance e 3 partes do corpo.
  - `PENALTY_XG = 0.760`.
  - Separação explícita de `xg_nao_penalti_npxg`.
  - Classificação clínica de 4 perfis em `classificar_perfil_clinico`: `Clínico de Elite`, `Volume Shooter`, `Eficiente`, `Neutro`.
- **Distorção no `backend/app.py` atual**:
  - `calculo_xg_discreto.py` **NÃO está importado em `backend/app.py`**.
  - Em `backend/app.py` (linhas 2710-2717), o backend executa uma fórmula inline:
    ```python
    if chutes_tot > 0:
        chutes_fora = max(0, chutes_tot - chutes_alvo)
        chutes_alvo_abertos = max(0, chutes_alvo - penaltis)
        xg_acumulado = round((penaltis * 0.79) + (chutes_alvo_abertos * 0.315) + (chutes_fora * 0.045), 1)
    ```
  - Como a coluna `finalizacoes_totais` na tabela `jogadores_estatisticas` foi preenchida como `2 * chutes_ao_gol = 6 * gols`, essa equação resulta invariavelmente em `xg_acumulado ~ 1.08 * total_gols`.
  - Consequência direta: `delta_xg = gols - xg` é **sempre negativo** para todos os grandes artilheiros do futebol brasileiro (Luís Fabiano -20.4, Romário -31.8, Pedro -12.6, Hulk -19.6, Germán Cano -16.8).
  - Todos eles são rotulados equivocadamente como `"Volume Shooter (Abaixo do xG esperado)"`.
  - A métrica `npxG` (`xg_nao_penalti_npxg`) não é computada nem exposta na API.
  - Para atletas sem contagem de chutes (1.351 atletas com >= 10 gols), o fallback ingênuo aplica `xg = gols * 0.93`, invertendo a distorção para +7% artificialmente.

### D. Radar Pentagonal (PES / Winning Eleven)
- **Definição dos 5 Eixos**:
  1. `atk` ("Ataque"): Presença e volume ofensivo no terço final (40–99).
  2. `fin` ("Finalização"): Precisão de conversão, pontaria e letalidade (40–99).
  3. `cri` ("Criação / Passe"): Assistências oficiais, visão de jogo e passes decisivos (40–99).
  4. `fis` ("Físico / Presença"): Minutagem, longevidade de carreira e consistência titular (40–99).
  5. `def` ("Defesa / Disciplina"): Disciplina tática, desarmes e baixa frequência de cartões (40–99).
  - Métrica agregada: `ovr` (Overall Rating = média simples dos 5 eixos).
- **Localização no Código**:
  - Backend: `_calcular_radar_pes(posicao, resumo, carreira)` em `backend/app.py` (linhas 2018-2120).
  - Frontend: `frontend/src/components/charts/RadarPentagonPES.jsx` (linhas 21-140) e `AthleteCompareView.jsx` (linhas 922-925).
- **Estrutura do Payload**:
  ```json
  "radar_pes": {
    "eixos": [
      {"key": "atk", "label": "Ataque", "valor": 97, "desc": "Presença e volume ofensivo"},
      {"key": "fin", "label": "Finalização", "valor": 99, "desc": "Conversão e precisão no arremate"},
      {"key": "cri", "label": "Criação / Passe", "valor": 78, "desc": "Visão de jogo e assistências"},
      {"key": "fis", "label": "Físico / Presença", "valor": 90, "desc": "Resistência, minutagem e solidez"},
      {"key": "def", "label": "Defesa / Disciplina", "valor": 52, "desc": "Combate e disciplina tática"}
    ],
    "ovr": 83
  }
  ```

### E. Suíte de Testes Matemáticos e de Regressão (`tests/test_model_evals.py`)
- **Execução Real**:
  - Comando: `./.venv/bin/pytest tests/test_model_evals.py`
  - Resultado: **22 passed in 0.33s** (Python 3.14.8, pytest-9.1.1).
- **Cobertura Detalhada dos 22 Testes**:
  1. `test_probabilidades_somam_100_porcento` (6 testes parametrizados sobre `GOLDEN_CASES`):
     Valida se a soma das probabilidades de 1X2, Over/Under 1.5, Over/Under 2.5 e BTTS (Ambas Marcam) fecha em exatamente 100% ($\pm 0.25\%$).
  2. `test_probabilidade_positiva_placares_baixos` (1 teste):
     Valida se placares clássicos brasileiros (0-0, 1-1, 1-0) possuem probabilidade estritamente positiva e ranqueiam no topo.
  3. `test_dixon_coles_inflacao_empate_rho_negativo` (1 teste):
     Valida o núcleo de Dixon-Coles (1997): para $\rho = -0.12$, $P(0-0)$ e $P(1-1)$ são superiores ao modelo de Poisson independente ($\rho = 0.0$), com $\tau_{0,0} > 1.0$ e $\tau_{1,1} = 1.12$.
  4. `test_placares_ordenados_decrescente` (1 teste):
     Garante que a lista `top_placares` retorne rigorosamente em ordem decrescente de probabilidade.
  5. `test_coerencia_fair_odds` (6 testes parametrizados sobre `GOLDEN_CASES`):
     Valida a relação $Odd_{fair} = 1 / P$, dentro da faixa de tolerância de arredondamento, saturando em 99.0 para eventos raros ($p \le 1.0\%$).
  6. `test_monotonicidade_fair_odds` (1 teste):
     Garante que eventos com maior probabilidade tenham menor odd justa.
  7. `test_ev_positivo_apenas_quando_odd_maior_que_fair_odd` (1 teste):
     Garante que $+EV > 0$ ocorra estritamente quando $odd_{mercado} > fair\_odd$.
  8. `test_ev_gating_parametrico` (4 testes com multiplicadores 1.20, 1.05, 0.95, 0.80):
     Valida o sinal de EV para diferentes distorções de odd de mercado.
  9. `test_resiliencia_clamping_extremos` (1 teste):
     Garante resiliência matemática contra $\lambda \le 0$ ou $\lambda \ge 10$, prevenindo `ZeroDivisionError`, NaNs e infinitos.
- **Isolamento de Risco**:
  - `tests/test_model_evals.py` importa **exclusivamente** `_calc_poisson_bivariate` de `backend.app`.
  - **Zero acoplamento** com rotas de atletas, tabelas de scouting ou cálculos de ratings de jogadores. As modificações de perfil de atletas não têm risco de afetar os 22 testes preditivos.

### F. Inversões Conmebol e Clubes Espúrios no Banco
- A averiguação de confrontos históricos revelou partidas internacionais invertidas:
  - **Partida 19997098** (`Palmeiras vs River Plate`, 1999-05-26, Libertadores Semifinal): No banco, estava cadastrada como `0 x 3` (River Plate vencedor), com os gols de Alex (ID 2373) e Roque Junior (ID 12282) atribuídos a `clube = 'River Plate'`. Na realidade histórica, o Palmeiras venceu por 3 a 0. Isso poluiu o histórico de Alex e Roque Junior com River Plate.
  - **Partida 20027112** (`Grêmio vs River Plate`, 2002-05-01, Libertadores Oitavas): No banco, constava `0 x 4` para o River Plate, com os gols de Rodrigo Mendes (ID 12105), Luizão (ID 8965), Zinho (ID 13959) e Luís Mário (ID 8883) atribuídos ao River Plate. Na realidade, o Grêmio goleou por 4 a 0. Isso inseriu River Plate no perfil de Zinho, Rodrigo Mendes e Luizão.
  - No perfil de Luís Fabiano (ID 9033), seus gols contra River Plate e Universidad de Chile na Copa Sul-Americana (partidas 20038048 e 20128082) já constam corretamente marcados pelo São Paulo (`clube = 'São Paulo'`), e seu `clubes` na base é limpo (`Vasco, São Paulo, Ponte Preta`).

### G. Teto de Armazenamento Vercel (<94.0 MB)
- Comando `ls -lh data/futebol.db`: **92.36 MB** (96.845.824 bytes, 23.644 páginas de 4096 bytes, `freelist_pages = 0`).
- **Margem de segurança:** Apenas **1.64 MB** restantes até o teto de 94.0 MB.
- Qualquer inserção em lote de strings JSON pesadas (ex: heatmaps espaciais) na tabela `atleta_sofascore_ratings` estourará o limite do bundle da Vercel.

---

## 2. Logic Chain (Cadeia Lógica de Dedução e Causa-Raiz)

1. **Premissa 1:** O banco possui 115.639 partidas, mas as escalações detalhadas completas de súmulas pré-2018 não cobrem 100% dos jogos em que atletas atuaram sem marcar gols.
2. **Premissa 2:** Os scripts de auto-reparo executavam `SET total_jogos = MAX(total_jogos, total_gols)`, forçando `total_jogos = total_gols` para 2.705 atletas que tinham mais gols catalogados do que escalações locais.
3. **Premissa 3:** Em `backend/app.py`, a `media_gols` era calculada via `total_gols / total_jogos`, resultando matematicamente em `1.00 gol/jogo` para Luís Fabiano, Romário, Edmundo, Dinamite e outros 2.700 atletas, mesmo havendo `jogos_carreira_oficiais` e `gols_carreira_oficiais` consolidados na mesma tabela.
4. **Premissa 4:** `backend/calculo_player_rating.py` contém o motor matemático de notas Sofascore completo com compressão `tanh` e pesos posicionais, mas nenhuma rota ou serviço do backend o chamava, e a tabela `atleta_sofascore_ratings` estava congelada em apenas 8 atletas.
5. **Premissa 5:** A fórmula inline de xG em `backend/app.py` superestimava o xG como `1.08 * gols` em decorrência da relação sintética de `chutes = 6 * gols`, invertendo o `Delta xG` para negativo e rotulando erroneamente artilheiros clínicos de elite mundiais como "Volume Shooters".
6. **Conclusão Lógica:** O saneamento exige:
   - Respeitar a paridade de escopo: quando houver histórico oficial consolidado (`jogos_carreira_oficiais > 0`), calcular a média sobre a carreira oficial e exibir o rótulo transparente `"Jogos c/ Gol"` para a contagem local parcial.
   - Integrar `calculo_player_rating.py` dinamicamente no backend como fallback de ratings para que 100% dos atletas tenham nota calibrada de 0.0 a 10.0 sem inflar o banco.
   - Conectar `backend/calculo_xg_discreto.py` para fornecer `npxG`, `xG` e classificação clínica correta ("Clínico de Elite").
   - Corrigir os confrontos Conmebol invertidos (19997098 e 20027112) e limpar os clubes espúrios decorrentes.
   - Manter o banco abaixo de 94.0 MB calculando telemetrias em tempo de execução via determinismo de seed (`random.Random(id_jogador)`).

---

## 3. Caveats (Ressalvas e Áreas Não Investigadas)

1. **Modo Somente Leitura:** Nenhuma alteração foi aplicada no código-fonte nem no banco de dados durante esta etapa de survey.
2. **Capacidade de Scraping Externo:** Não foram disparadas requisições ativas ao Sofascore ou OGol nesta investigação para evitar bloqueios de IP / Cloudflare durante a fase de análise.
3. **Escopo dos Testes:** A suíte `test_model_evals.py` (22/22) cobre modelos estatísticos de partidas (Dixon-Coles / Poisson). Testes unitários para ratings individuais de atletas devem ser expandidos em uma suíte dedicada para garantir regressão futura do motor `tanh`.

---

## 4. Conclusion & Recomendações de Arquitetura

### A. Reconciliação Jogos-Gols no Backend (`_construir_perfil_jogador` em `backend/app.py`)
- Em `resumo_dados`:
  - Se `acervo_parcial` for verdadeiro e `carreira_oficial["jogos"] > 0`:
    `"media_gols": round(carreira_oficial["gols"] / carreira_oficial["jogos"], 2)` (ex: 0.53 para Luís Fabiano em vez de 1.00).
    `"jogos_rotulo": "Jogos c/ Gol"`
    `"jogos_registrados": total_jogos`
  - Se não for parcial:
    `"media_gols": round(total_gols_final / max(total_jogos, 1), 2)`
    `"jogos_rotulo": "Jogos"`

### B. Integração do Motor de Ratings Sofascore (`calculo_player_rating.py`)
- Importar `calcular_nota_partida_sofascore` em `backend/app.py`.
- Em `_construir_perfil_jogador`:
  - Se `atleta_sofascore_ratings` contiver registro homologado, utilizá-lo.
  - Caso contrário, iterar sobre `partidas_ordenadas`, calcular a nota de cada partida via `calcular_nota_partida_sofascore(match_stats)`, gerar `rating_medio` e a lista `ultimas_notas` (ex: 5 partidas mais recentes).
  - Preencher `resumo_dados["sofascore"]` de forma que o badge verde de rating (0.0 a 10.0) apareça no perfil de qualquer atleta da plataforma, sem necessidade de inflar o arquivo SQLite.

### C. Integração do Motor de xG e npxG (`calculo_xg_discreto.py`)
- Importar `classificar_perfil_clinico` e conectar os disparos de `shotmap_atleta` de `gerar_dados_espaciais_atleta`.
- Expor no payload `analytics_xg`:
  - `"xg_acumulado"`
  - `"xg_nao_penalti_npxg"`
  - `"delta_xg"`
  - `"delta_npxg"`
  - `"xg_por_finalizacao"`
  - `"taxa_conversao_pct"`
  - `"perfil_clinico"`: Avaliado via `classificar_perfil_clinico` (restaurando o status de "Clínico de Elite" para artilheiros consagrados).

### D. Higienização das Inversões Conmebol
- Criar script cirúrgico de reparo para:
  - Partida 19997098 (Palmeiras 3 x 0 River Plate): inverter mandante/visitante e reatribuir gols ao Palmeiras.
  - Partida 20027112 (Grêmio 4 x 0 River Plate): inverter mandante/visitante e reatribuir gols ao Grêmio.
  - Atualizar `jogadores_estatisticas.clubes` expurgando `River Plate` de Zinho, Roque Junior, Alex, Rodrigo Mendes e Thiago Mendes.
  - Executar `VACUUM;` no SQLite garantindo o tamanho $\le 92.5\text{ MB}$.

---

## 5. Verification Method (Método de Verificação Independente)

Para auditar e reproduzir todas as conclusões deste relatório, execute os seguintes comandos:

1. **Verificação da Suíte de Regressão Estatística (22/22):**
   ```bash
   ./.venv/bin/pytest tests/test_model_evals.py -v
   ```
   *Critério de aceitação:* 22 testes aprovados com código de saída 0.

2. **Auditoria de Integridade Relacional (12/12):**
   ```bash
   ./.venv/bin/python scripts/auditar_integridade_dados.py
   ```
   *Critério de aceitação:* Relatório com 0 inconsistências em todas as 12 regras.

3. **Verificação dos 2.705 Atletas com Média 1.00:**
   ```bash
   ./.venv/bin/python -c "
   import sqlite3
   c = sqlite3.connect('data/futebol.db').cursor()
   cnt = c.execute('SELECT COUNT(*) FROM jogadores_estatisticas WHERE total_jogos = total_gols AND total_gols >= 5;').fetchone()[0]
   print('Atletas com total_jogos == total_gols >= 5:', cnt)
   "
   ```
   *Critério de aceitação:* Deve retornar exatamente 2.705 antes da intervenção.

4. **Verificação do Perfil Atual de Luís Fabiano (ID 9033):**
   ```bash
   ./.venv/bin/python -c "
   import sqlite3
   c = sqlite3.connect('data/futebol.db').cursor()
   print(c.execute('SELECT id_jogador, nome_exibicao, total_jogos, total_gols, media_gols_por_jogo, gols_carreira_oficiais, jogos_carreira_oficiais FROM jogadores_estatisticas WHERE id_jogador = 9033;').fetchone())
   "
   ```

5. **Verificação do Teto de Armazenamento SQLite:**
   ```bash
   ls -lh data/futebol.db
   ```
   *Critério de aceitação:* Tamanho estritamente $\le 94.0\text{ MB}$.

6. **Build do Frontend:**
   ```bash
   cd frontend && npm run build
   ```
   *Critério de aceitação:* Código de saída 0, sem erros de rollup/vite.
