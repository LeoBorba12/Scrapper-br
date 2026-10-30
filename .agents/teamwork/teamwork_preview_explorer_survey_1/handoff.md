# Relatório de Investigação Técnica — Survey Explorer 1 (Database & Relational Consistency)

**Data**: 2026-10-30T15:32:00-03:00  
**Investigador**: Survey Explorer 1 (`teamwork_preview_explorer_survey_1`)  
**Escopo**: Auditoria de `data/futebol.db`, Esquema Relacional, Anomalia de Jogos=Gols, Conflitos Conmebol, Ratings/Scouting e Teto de Armazenamento Vercel (<94 MB).

---

## 1. Observações (Observations)

### 1.1. Inventário de Esquema no SQLite (`data/futebol.db`)
Consulta executada via `sqlite_master`:
- **Tabelas de Atletas**:
  - `jogadores` (3.639 linhas, 0.30 MB): Tabela legada com `id_jogador`, `nome_exibicao`, `posicao`, `clubes` (texto separado por vírgula), `total_jogos`, `total_gols`. Não é consultada pelo backend ativo.
  - `jogadores_estatisticas` (19.783 linhas, 3.97 MB): Tabela mestre ativa dos perfis dos atletas. Contém 56 colunas com estatísticas analíticas consolidadas (`total_jogos`, `total_gols`, `media_gols_por_jogo`, `gols_carreira_oficiais`, `jogos_carreira_oficiais`, `detalhe_carreira_clubes` [JSON], `chutes_ao_gol`, `finalizacoes_totais`, `pontaria_chutes_pct`, etc.).
  - `jogadores_resumo` (17.001 linhas, 0.86 MB + 0.36 MB de autoindex): Tabela agregada materializada legada, indexada por `nome`. Não é consultada pelo `backend/app.py`.
- **Tabelas de Presenças e Partidas**:
  - `partidas` (115.639 linhas, 17.81 MB): Contém registro completo do confronto (`id_partida`, `ano`, `mandante`, `visitante`, `gols_mandante`, `gols_visitante`, `placar`, `vencedor`, `campeonato`, etc.).
  - `escalacoes` (152.264 linhas, 9.52 MB): Contém presenças atômicas (`id_escalacao`, `id_partida`, `clube`, `atleta`, `num_camisa`, `posicao`, `titular`, `id_jogador`).
  - **Inexistência de Tabelas `presencas`, `sumulas`, `clubes` e `clubes_historico`**: Não existem tabelas físicas com esses nomes no SQLite. O conceito de "presenças" é construído sob demanda por meio de união (`escalacoes UNION gols UNION cartoes`) em scripts de saneamento. A lista de clubes defendidos é armazenada como texto separado por vírgula em `jogadores_estatisticas.clubes` e como acervo histórico de temporadas em formato JSON na coluna `jogadores_estatisticas.detalhe_carreira_clubes`.
- **Tabelas de Eventos de Jogo**:
  - `gols` (95.699 linhas, 4.98 MB): Registro de cada gol (`id_gol`, `id_partida`, `rodada`, `clube`, `atleta`, `minuto`, `tempo`, `tipo_de_gol`, `id_jogador`).
  - `cartoes` (38.605 linhas, 2.70 MB): Registro de cartões (`id_cartao`, `id_partida`, `clube`, `atleta`, `cartao`, `minuto`, `tempo`, `id_jogador`).
  - `odds_partidas` (10.932 linhas, 2.17 MB).

### 1.2. A Gênese da Anomalia "168 gols em 168 jogos" (Média 1.00)
- **Caso Emblemático**: Luís Fabiano (`id_jogador = 9033`):
  - Em `jogadores_estatisticas`: `total_jogos = 168`, `total_gols = 168`, `media_gols_por_jogo = 1.0`.
  - Dados oficiais de carreira na mesma linha: `gols_carreira_oficiais = 403`, `jogos_carreira_oficiais = 755` (Média autêntica: 0.53 gol/jogo).
  - Em `gols`: Existem 168 gols distribuídos em **144 partidas distintas**.
  - Em `escalacoes`: Existem 158 registros de escalação.
  - Na consulta unificada `(escalacoes UNION gols UNION cartoes)`: Totalizam-se **158 partidas distintas no catálogo local**.
- **Causa no Código**:
  1. Em `scripts/sanear_dados_atletas_e_estatisticas.py` (linhas 272–281):
     ```sql
     UPDATE jogadores_estatisticas
     SET total_jogos = CASE
         WHEN (SELECT tpa.total_jogos_acervo FROM temp_presencas_atletas tpa WHERE tpa.id_jogador = jogadores_estatisticas.id_jogador) IS NOT NULL THEN
             MAX((SELECT tpa.total_jogos_acervo ...), total_gols)
         ELSE MAX(total_jogos, total_gols)
     END;
     ```
  2. Em `scripts/auditar_integridade_dados.py` (linhas 307–314, Regra 12):
     ```sql
     UPDATE jogadores_estatisticas
     SET total_jogos = MAX(total_jogos, total_gols),
         media_gols_por_jogo = ROUND(CAST(total_gols AS REAL) / MAX(MAX(total_jogos, total_gols), 1), 2)
     WHERE total_gols > total_jogos OR (total_gols >= 10 AND media_gols_por_jogo > 2.0);
     ```
  - Como o acervo pré-2018 possui o registro dos 168 gols mas súmulas completas de escalação de apenas 158 partidas de Luís Fabiano, a condição `total_gols (168) > total_jogos (158)` foi disparada. O auto-reparo forçou `total_jogos = MAX(158, 168) = 168`, resultando diretamente em `media_gols_por_jogo = 168 / 168 = 1.00`.
- **Escala da Anomalia**:
  - Consulta `SELECT COUNT(*) FROM jogadores_estatisticas WHERE total_jogos = total_gols AND total_gols >= 5;` retornou **2.705 atletas** com equivalência artificial jogos=gols.
  - Entre eles: Marcelinho Carioca (207 j / 207 g), Edmundo (204 j / 204 g), Roberto Dinamite (174 j / 174 g), Romário (150 j / 150 g), Luizão (145 j / 145 g), Túlio Maravilha (140 j / 140 g), Neymar (135 j / 135 g), Zico (132 j / 132 g).

### 1.3. A Anomalia de Clubes Espúrios Conmebol e Homônimos Desordenados
- **Situação de Luís Fabiano (ID 9033)**:
  - Partida `20038048` (2003-12-03, Copa Sul-Americana, São Paulo 2x0 River Plate, gol `77376`).
  - Partida `20128082` (2012-11-07, Copa Sul-Americana, São Paulo 5x0 Universidad de Chile, gol `78781`).
  - No commit recente `a3a2900`, a coluna `gols.clube` foi corrigida para `'São Paulo'` e `jogadores_estatisticas.clubes` foi atualizado para `'Vasco, São Paulo, Sao Paulo, Ponte Preta'`.
- **Casos Não Saneados no Restante da Base**:
  - Consulta aos clubes não pertencentes ao futebol brasileiro revelou **8.684 atletas** com nomes de clubes estrangeiros ou textos anômalos em `jogadores_estatisticas.clubes`.
  - Exemplos diretos encontrados:
    - **Pedro (ID 10)**: Possui `'Guabirá'` em seus clubes devido à escalação `156464` da partida `202533214` (Independiente x Guabirá, 2026-03-03, Sul-Americana), onde um atleta boliviano chamado "Pedro" com a camisa 99 foi vinculado cegamente ao `id_jogador = 10` do Pedro do Flamengo.
    - **Mycael (ID 2066)**: Goleiro de 22 anos do Athletico-PR (nascido em 2004) possui gols de 1988 a 1997 em Copas Libertadores vinculados ao seu ID (contra Newell's, Peñarol, etc., marcados por Alberto "Beto" Acosta!), herdando clubes como `'San Lorenzo'`, `'Boca Juniors'`, `'Univ. Católica'`, `'Cerro'` e `'Táchira'`.
    - **Paulo Henrique Ganso (ID 16)**: Possui `'Atlético Nacional'` em `jogadores_estatisticas.clubes`, remanescente do confronto São Paulo 1x0 Atlético Nacional (2014-11-26, Copa Sul-Americana), onde o gol de Ganso teve o clube do adversário atribuído antes de ser corrigido.
    - **Yuri Alberto (ID 48), Estêvão (ID 5491), Flaco López (ID 67)**: Possuem clubes com títulos de páginas raspadas: `'Estatísticas e Escalações Palmeiras'`, `'Estatísticas e Escalações São Bernardo'` (partidas `202503483`, `202503489`, placar `0 x 0`).
- **Mecanismo de Propagação**:
  - `scripts/sanear_dados_atletas_e_estatisticas.py` (linhas 340–352) executava uma união aditiva:
    `for ex in existentes: if ex not in unificados: unificados.append(ex)`
    Uma vez que um clube estrangeiro ou string anômala entrava em `jogadores_estatisticas.clubes` (seja por scraper ou por resolução de homônimo cega), o script nunca a expurgava.

### 1.4. Tabela `atleta_sofascore_ratings` e Motores de Scouting
- **Tabela `atleta_sofascore_ratings`**:
  - Existe fisicamente no banco com 8 registros (Gabriel Barbosa, Hulk, Pedro, Neymar, Calleri, Pelé, Romário, Zico).
  - Colunas existentes: `id_jogador`, `sofascore_id`, `nome_atleta`, `clube_atual`, `posicao`, `temporada_ano`, `rating_medio`, `jogos_avaliados`, `minutos_jogados`, `gols`, `assistencias`, `xg_acumulado`, `xa_acumulado`, `notas_ultimos_jogos_json`, `heatmap_pontos_json`, `atualizado_em`.
  - **Colunas Faltantes para Atender R3**: Não possui `xg_nao_penalti_npxg` (ou `npxg_acumulado`), `delta_xg`, `perfil_clinico`, `taxa_conversao_pct`.
- **Motores Matemáticos Existentes no Repositório**:
  - `backend/calculo_player_rating.py`: Implementa rigorosamente o algoritmo de compressão assintótica posicional com função hiperbólica `math.tanh` assimétrica (`K_POS = 2.65`, `K_NEG = 4.50`, base 6.50, limites 3.00 a 10.00). Totalmente funcional.
  - `backend/calculo_xg_discreto.py`: Implementa o modelo discreto Opta com `XG_LOOKUP_MATRIX` (zona x tipo de lance x parte do corpo), pênalti fixo em 0.760, cálculo explícito de `npxg_acumulado`, `delta_xg = gols_reais - xg_acumulado` e 4 perfis clínicos ("Clínico de Elite", "Volume Shooter", "Eficiente", "Neutro").
- **Consumo Atual na API (`backend/app.py`)**:
  - Rota `/api/jogadores/perfil` (linha 2755) lê `atleta_sofascore_ratings` para o badge Sofascore.
  - As métricas de xG (`analytics_xg`), radar PES (`radar_pes`) e scouts profissionais (`scouts_profissionais`) são calculadas dinamicamente na requisição caso não haja valores estáticos.

### 1.5. Auditoria de `scripts/auditar_integridade_dados.py`
- **Contagem e Nomenclatura das Regras**:
  - O cabeçalho e `AGENTS.md` citam "10 regras" ou "11 verificações".
  - O código executa e reporta **exatamente 12 regras** na lista `relatorio["regras"]`.
  - No código-fonte há um erro de numeração: os comentários saltam da "Regra 7" diretamente para a "Regra 9" (não há "Regra 8"), e a última regra (Coerência de Clubes Recentes) foi rotulada como outra "Regra 12".
- **Comportamento Atual**: O script executa com sucesso reportando **12/12 OK** (0 inconsistências encontradas).
- **Vulnerabilidades / Pontos Cegos Críticos Detectados**:
  1. **Regra 9 (Gols Invertidos)**: Só valida partidas onde `p.gols_mandante = 0 AND p.gols_visitante > 0` (ou vice-versa). Não detecta quando um jogo terminou 0x0 mas possui gols atribuídos (como os 4 jogos com "Estatísticas e Escalações").
  2. **Regra 5 (Nomes de Clubes Válidos)**: Apenas checa se é nulo ou string vazia. Não valida se o clube é um título de scraping (`LIKE '%Estatísticas%'`).
  3. **Regra 12 (Jogos x Gols)**: Força `total_jogos = MAX(total_jogos, total_gols)`, sendo o próprio causador da taxa 1.00.

### 1.6. Análise de Armazenamento do SQLite (`data/futebol.db`) e Teto Vercel
- **Tamanho Físico Atual**:
  - Bytes exatos: `96.927.744 bytes`.
  - Em MiB (binário, 1024²): **92,44 MiB** (abaixo de 94.0 MiB, margem de 1.56 MiB).
  - Em MB (decimal, 1000²): **96,93 MB** (acima de 94.0 MB decimais).
  - `PRAGMA page_count = 23664`, `page_size = 4096`, `PRAGMA freelist_count = 0`.
  - Executar apenas `VACUUM;` no estado atual libera exatamente 0 bytes.
- **Distribuição do Espaço (via `dbstat`)**:
  - Dados das Tabelas: **42,57 MB** (43,9%).
  - Índices B-Tree: **49,88 MB** (51,5% do arquivo total!).
  - Tabelas mais pesadas: `partidas` (17.81 MB), `escalacoes` (9.52 MB), `gols` (4.98 MB), `jogadores_estatisticas` (3.97 MB), `cartoes` (2.70 MB), `odds_partidas` (2.17 MB), `jogadores_resumo` (0.86 MB).
  - Índices redundantes identificados:
    - `idx_partidas_data` (2.21 MB): Indexa `partidas(data)`. Totalmente redundante com `idx_partidas_data_mandante ON partidas(data, mandante)` (3.39 MB), que cobre qualquer consulta por data como prefixo.
    - `idx_escalacoes_atleta` (4.53 MB): Indexa o texto do atleta em 152.000 linhas de escalação. As consultas do backend buscam estritamente por `id_jogador` (`idx_escalacoes_id_jogador`, 1.58 MB) e `id_partida`.
    - Tabela legada `jogadores_resumo` (0.86 MB + 0.36 MB index): Totalmente desacoplada do backend.
- **Simulação em Cópia Temporária (`/tmp/test_vacuum.db`)**:
  - Remoção dos 2 índices redundantes + tabela legada `jogadores_resumo` seguida de `VACUUM`:
    - Tamanho antes: 96.845.824 bytes (92.36 MiB / 96.85 MB)
    - Tamanho após: 88.514.560 bytes (84.41 MiB / **88.51 MB**)
    - **Redução líquida garantida**: **8.331.264 bytes (8.33 MB decimais / 7.95 MiB)**.
    - O banco fica confortavelmente em **88.51 MB**, abaixo do teto de 94.0 MB com mais de 5.4 MB de folga para novas súmulas e ratings.

---

## 2. Cadeia Lógica (Logic Chain)

1. **Premissa de Incompletude Pré-2018**: O acervo do FutStats registra placares e gols de 115.000+ partidas históricas desde o início do século XX, porém as escalações minuto a minuto (`escalacoes`) só foram digitalizadas com regularidade em competições a partir de ~2014-2018.
2. **Indução do Bug Jogos=Gols**: Quando o script `sanear_dados_atletas_e_estatisticas.py` ou a Regra 12 de `auditar_integridade_dados.py` encontram um atacante com 168 gols mas apenas 158 registros em `escalacoes`, eles assumem erroneamente que houve anomalia e forçam `total_jogos = total_gols`. Isso sobrescreveu o total real de jogos, gerando a média espúria de 1.00 para 2.705 atletas.
3. **Mecanismo dos Clubes Conmebol**: Na raspagem de dados de torneios Conmebol (Libertadores, Sul-Americana), placares invertidos ou mapeamentos ingênuos de quem marcou o gol atribuíram o gol ao clube visitante/adversário. Quando scripts de desambiguação e união de clubes rodaram, uniram os clubes de `gols` e `escalacoes` com os clubes de perfil via `set` aditivo. Mesmo quando o gol era posteriormente corrigido, o clube adversário estrangeiro permaneceu gravado no perfil do jogador.
4. **Vínculo Cego de Homônimos**: O script de reconciliação de gols usou `LOWER(atleta) = ? OR LOWER(atleta) LIKE ?`. Atletas com apelidos genéricos como "Acosta" ou "Pedro" absorveram gols e escalações de atletas estrangeiros de outras épocas, distorcendo tanto as estatísticas quanto a lista de clubes.
5. **Solução do Teto Vercel (<94 MB)**: O banco não pode ser enxugado apenas com `VACUUM`, pois possui 0 páginas livres. No entanto, mais de 51% do arquivo é composto por índices, dos quais vários são redundantes (ex: `idx_partidas_data` duplicando o prefixo de `idx_partidas_data_mandante`). A remoção de índices desnecessários e da tabela legada `jogadores_resumo` recupera imediatamente 8.33 MB sem perda de integridade relacional ou velocidade de consulta.

---

## 3. Ressalvas e Limitações (Caveats)

- **Investigação em Modo Read-Only**: Nenhuma alteração foi gravada em `data/futebol.db` ou nos scripts de produção durante esta etapa. A simulação de `VACUUM` foi executada em arquivo efêmero em `/tmp/test_vacuum.db`.
- **Atletas com Média 1.00 Real**: Existem casos raros no futebol de atletas que atuaram em 1 jogo e marcaram 1 gol (média 1.00 verídica). A regra de diferenciação deve focar em atletas com volume estatístico expressivo (`total_gols >= 5` ou `ano_inicio < 2018`).
- **Escalações Históricas Faltantes**: O preenchimento completo de todas as escalações pré-2018 exigiria ingestão massiva de centenas de milhares de linhas, o que estouraria o teto de 94 MB da Vercel. A solução deve combinar **rótulo transparente de catálogo** na UI com a ingestão cirúrgica de súmulas prioritárias.

---

## 4. Conclusões e Recomendações (Conclusions)

### 4.1. Reconciliação Jogos x Gols (R1)
- **Ajuste em `jogadores_estatisticas`**:
  - Criar/utilizar coluna conceitual `partidas_com_gol` (`COUNT(DISTINCT id_partida)` da tabela `gols`).
  - No cálculo de `total_jogos`, utilizar o total de presenças reais no acervo e **nunca** fazer `MAX(total_jogos, total_gols)`.
  - Para atletas com acervo parcial pré-2018 (`ano_inicio < 2018` e `jogos_carreira_oficiais > total_jogos`), exibir na dashboard a média oficial consolidada (`gols_carreira_oficiais / jogos_carreira_oficiais`) e rotular os jogos locais como "Jogos c/ Gol".

### 4.2. Higienização de Clubes Espúrios (R2)
- Reconstruir a coluna `jogadores_estatisticas.clubes` expurgando clubes adversários de confrontos Conmebol e homônimos indevidos.
- Utilizar como âncora de verdade a coluna `detalhe_carreira_clubes` (JSON oficial do OGol) e confrontar apenas com clubes brasileiros onde o atleta realmente atuou.
- Corrigir os casos críticos identificados: Mycael (ID 2066), Pedro (ID 10), Ganso (ID 16), Dudu (ID 13) e Yuri Alberto (ID 48).

### 4.3. Enriquecimento de Ratings e Métricas Avançadas (R3)
- Expandir a tabela `atleta_sofascore_ratings` para acomodar:
  `npxg_acumulado REAL`, `delta_xg REAL`, `taxa_conversao_pct REAL`, `perfil_clinico TEXT`.
- Popular as notas baseadas em `backend/calculo_player_rating.py` (compressão tanh 0-10) e as métricas de `backend/calculo_xg_discreto.py` para os atletas homologados e principais artilheiros do banco.

### 4.4. Aprimoramento de `scripts/auditar_integridade_dados.py` (R5)
- Corrigir a numeração das 12 regras (renumerar 1 a 12 sequencialmente).
- Adicionar validação para partidas 0x0 com gols fantasma atribuídos.
- Adicionar validação para nomes de clubes com sufixos de scraping (`'Estatísticas e Escalações%'`).
- Remover o auto-reparo prejudicial da Regra 12 que forçava `total_jogos = total_gols`.

### 4.5. Preservação do Teto Vercel < 94.0 MB (R4)
- Aplicar a poda de índices redundantes:
  1. `DROP INDEX idx_partidas_data;` (coberto por `idx_partidas_data_mandante`).
  2. `DROP INDEX idx_escalacoes_atleta;` (não utilizado pelas consultas da API).
  3. `DROP TABLE jogadores_resumo;` (tabela legada de 1.22 MB não utilizada).
  4. Executar `VACUUM;`.
- Isso garante a redução do banco para **~88.5 MB**, abrindo 5.5 MB de espaço livre para as novas funcionalidades sem risco de violar o teto da Vercel.

---

## 5. Método de Verificação Independente (Verification Method)

Para validar de forma independente os achados deste relatório:

1. **Verificação dos Testes de Regressão**:
   ```bash
   ./.venv/bin/pytest tests/test_model_evals.py
   ```
   *(Resultado esperado: 22 passed)*

2. **Verificação do Script de Auditoria Atual**:
   ```bash
   python3 scripts/auditar_integridade_dados.py
   ```
   *(Resultado esperado: 12 regras avaliadas com 0 inconsistências reportadas)*

3. **Verificação da Anomalia Jogos=Gols**:
   ```bash
   python3 -c "import sqlite3; c = sqlite3.connect('data/futebol.db').cursor(); print('Atletas jogos=gols:', c.execute('SELECT COUNT(*) FROM jogadores_estatisticas WHERE total_jogos = total_gols AND total_gols >= 5;').fetchone()[0])"
   ```
   *(Resultado observado: 2.705 atletas)*

4. **Verificação dos Homônimos e Clubes Conmebol (Mycael / Pedro)**:
   ```bash
   python3 -c "import sqlite3; c = sqlite3.connect('data/futebol.db').cursor(); print('Mycael clubes:', c.execute('SELECT clubes FROM jogadores_estatisticas WHERE id_jogador = 2066;').fetchone()[0]); print('Pedro clubes:', c.execute('SELECT clubes FROM jogadores_estatisticas WHERE id_jogador = 10;').fetchone()[0])"
   ```

5. **Verificação da Simulação de Redução de Tamanho (<88.5 MB)**:
   ```bash
   python3 -c "
   import sqlite3, os, shutil
   dst = '/tmp/verif_vacuum.db'
   shutil.copyfile('data/futebol.db', dst)
   conn = sqlite3.connect(dst)
   c = conn.cursor()
   c.execute('DROP INDEX IF EXISTS idx_partidas_data;')
   c.execute('DROP INDEX IF EXISTS idx_escalacoes_atleta;')
   c.execute('DROP TABLE IF EXISTS jogadores_resumo;')
   conn.commit()
   c.execute('VACUUM;')
   conn.close()
   print('Tamanho após otimização:', round(os.path.getsize(dst) / (1024*1024), 2), 'MiB /', round(os.path.getsize(dst) / 1e6, 2), 'MB')
   os.remove(dst)
   "
   ```
   *(Resultado esperado: 84.41 MiB / 88.51 MB)*
