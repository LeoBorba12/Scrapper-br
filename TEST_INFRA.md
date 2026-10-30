# TEST_INFRA.md - Arquitetura e Metodologia de Testes E2E FutStats

> Especificação de Infraestrutura de Testes, Matriz de Rastreabilidade e Cobertura em 4 Camadas (Tiers 1-4) para o Projeto de Saneamento Integral FutStats.

---

## 1. Visão Geral e Filosofia de Testes

A suíte E2E do **FutStats** implementa uma abordagem de caixa-opaca (opaque-box testing) e validação matemática de ponta a ponta, cobrindo desde a camada relacional física (`data/futebol.db`) até as respostas da API REST Flask (`backend/app.py`), motores analíticos de xG e ratings (`calculo_xg_discreto.py`, `calculo_player_rating.py`), scripts de auditoria relacional (`scripts/auditar_integridade_dados.py`) e limites operacionais de produção (Vercel Storage Cap < 94.0 MB).

### Princípios Fundamentais
1. **Fidelidade à Causa-Raiz (Root Cause Fidelity)**: Os testes inspecionam o dado real no SQLite e na API, rejeitando remendos cosméticos ou facades artificiais.
2. **Fontes Autoritativas Explícitas**: Todo valor esperado é derivado de fontes canônicas documentadas (Dixon-Coles 1997, Opta discrete matrix, Sofascore tanh formula, súmulas oficiais CBF/Conmebol).
3. **Progressive Testability**: Identificação cristalina de testes que cobrem funcionalidades já saneadas versus marcos em implementação (M1 a M5).
4. **Isolamento e Reprodutibilidade**: Execução autônoma via `pytest` sem dependência de estado global ou ordem de execução.

---

## 2. Metodologia em 4 Camadas (4-Tier Architecture)

```
+-------------------------------------------------------------------------------+
|                      TIER 4: Real-World Application Scenarios                 |
|   (Luís Fabiano 9033, Zico/Romário, Pedro/Gabigol, Mycael 2066, Pipeline Full)|
+-------------------------------------------------------------------------------+
                                        |
+-------------------------------------------------------------------------------+
|                      TIER 3: Cross-Feature Combinations (Pairwise)            |
|   (Acervo Parcial + Sofascore, Radar + Carreira Oficial, xG + Perfil Clínico) |
+-------------------------------------------------------------------------------+
                                        |
+-------------------------------------------------------------------------------+
|                      TIER 2: Boundary & Corner Cases                          |
|   (0 jogos, 1 jogo/1 gol, clamp tanh 3.0/10.0, long-range xG, lambda extremos)|
+-------------------------------------------------------------------------------+
                                        |
+-------------------------------------------------------------------------------+
|                      TIER 1: Feature Coverage (R1, R2, R3, R4)                |
|   (Reconciliação Jogos-Gols, Conmebol Purge, Scouting Ratings, Storage/Audits)|
+-------------------------------------------------------------------------------+
```

### Camada 1: Tier 1 - Feature Coverage (Cobertura Funcional Primária)
Garante que cada requisito primário (R1, R2, R3, R4) tenha pelo menos 5 casos de teste independentes validando o caminho feliz e contratos de interface:
- **R1: Reconciliação Jogos-Gols & Rótulo Honesto de Catálogo**:
  - `test_t1_r1_jogos_carreira_oficiais_distintos_de_gols`: Verifica se atletas históricos possuem `jogos_carreira_oficiais` > `total_gols` no banco.
  - `test_t1_r1_api_acervo_parcial_flag`: Garante que `/api/jogadores/perfil` sinaliza `acervo_parcial: True` quando o acervo local possui apenas jogos com gol.
  - `test_t1_r1_api_rotulo_jogos_com_gol`: Assegura que o rótulo retornado é `"Jogos c/ Gol"` para acervos parciais.
  - `test_t1_r1_api_media_gols_autentica_carreira`: Confirma que `media_gols` em perfil de acervo parcial retorna a média de carreira autêntica (`gols_carreira / jogos_carreira`) e não 1.00.
  - `test_t1_r1_db_no_forced_jogos_equals_gols_with_divergent_career`: Nenhum atleta com histórico divergente tem `total_jogos = total_gols` forçado artificialmente.
- **R2: Auto-Cura de Clubes Espúrios & Inversões Conmebol**:
  - `test_t1_r2_conmebol_19997098_palmeiras_river`: Partida 19997098 é Palmeiras 3x0 River Plate (mandante Palmeiras, placar '3 x 0', gols Palmeiras).
  - `test_t1_r2_conmebol_20027112_gremio_river`: Partida 20027112 é Grêmio 4x0 River Plate (mandante Grêmio, placar '4 x 0', gols Grêmio).
  - `test_t1_r2_luis_fabiano_sem_clubes_estrangeiros_db`: Atleta Luís Fabiano (9033) não possui River Plate ou U. de Chile no campo `clubes`.
  - `test_t1_r2_luis_fabiano_detalhe_carreira_limpo`: `detalhe_carreira_clubes` de Luís Fabiano contém apenas clubes genuínos (Vasco, São Paulo, Ponte Preta, etc.).
  - `test_t1_r2_mycael_sem_gols_anos_90`: Goleiro Mycael (ID 2066) não possui gols espúrios de 1988-1997 nem clubes estrangeiros.
- **R3: Scouting Ratings (tanh), Sofascore, xG/npxG, Radar Pentagonal**:
  - `test_t1_r3_schema_atleta_sofascore_ratings`: Tabela possui colunas `id_jogador`, `sofascore_id`, `rating_medio`, `jogos_avaliados`, `xg_acumulado`, `xa_acumulado`, `npxg_acumulado`, `delta_xg`, `perfil_clinico`, `taxa_conversao_pct`.
  - `test_t1_r3_player_rating_tanh_base_650`: Motor `calculo_player_rating.py` gera nota base 6.50 e escala assintótica tanh.
  - `test_t1_r3_xg_discreto_penalti_valor_fixo`: Pênalti no modelo Opta discreto possui xG exato de 0.760.
  - `test_t1_r3_xg_discreto_analise_performance`: Função `analisar_performance_xg_atleta` retorna `xg_acumulado`, `xg_nao_penalti_npxg`, `delta_xg`, e `perfil_clinico` não-nulos.
  - `test_t1_r3_radar_pes_cinco_eixos_completos`: API retorna `radar_pes` com 5 eixos (`atk`, `fin`, `cri`, `fis`, `def`) e `ovr` na faixa 40-99.
- **R4: Teto de Armazenamento, Regressão Matemática e Auditoria**:
  - `test_t1_r4_sqlite_storage_abaixo_94mb`: Tamanho do arquivo `data/futebol.db` estritamente inferior a 98.566.144 bytes (94.0 MB).
  - `test_t1_r4_sqlite_integrity_check_ok`: `PRAGMA integrity_check` retorna 'ok'.
  - `test_t1_r4_auditoria_dados_12_regras_ok`: Script `scripts/auditar_integridade_dados.py` conclui com 12/12 regras OK e 0 inconsistências.
  - `test_t1_r4_regressao_dixon_coles_22_pass`: Suíte `tests/test_model_evals.py` aprova 22/22 testes com saída 0.
  - `test_t1_r4_dixon_coles_normalizacao_probabilidades`: Probabilidades 1X2 somam 1.0 (tolerância 1e-4) e Fair Odds = 1/p.

---

### Camada 2: Tier 2 - Boundary & Corner Cases (Valores de Borda)
Avalia o comportamento do sistema sob condições limites:
- **Borda R1**:
  - `test_t2_r1_atleta_zero_jogos`: Atleta com 0 jogos e 0 gols retorna `media_gols: 0.0`, sem divisão por zero.
  - `test_t2_r1_atleta_um_jogo_um_gol_genuino`: Atleta com exatamente 1 jogo e 1 gol oficial tem média 1.00 legítima com `acervo_parcial: False`.
  - `test_t2_r1_atleta_apenas_gols_sem_escalacao`: Atleta com registros em `gols` mas sem registro em `escalacoes` ativa proteção de acervo parcial.
  - `test_t2_r1_atleta_era_moderna_pos_2018`: Atleta moderno (estreia pós-2018) com 100% de escalações catalogadas não tem acervo parcial acionado indevidamente.
  - `test_t2_r1_atleta_carreira_oficial_ausente`: Atleta sem contagem consolidada na CBF/Ogol tem fallback robusto baseado em partidas locais.
- **Borda R2**:
  - `test_t2_r2_partida_conmebol_sem_gols`: Confrontos 0x0 da Libertadores tratados corretamente sem criação de gols fantasmas.
  - `test_t2_r2_clube_com_caracteres_especiais_e_acentos`: Higienização de clubes com acentos (ex: São Paulo, Universidad Católica) sem corromper UTF-8.
  - `test_t2_r2_homonimos_atletas_mesmo_nome`: Diferenciação rigorosa de homônimos via `id_jogador` numérico único.
  - `test_t2_r2_atleta_clube_unico_toda_carreira`: Atleta one-club man (ex: Rogério Ceni) preserva clube único sem duplicatas.
  - `test_t2_r2_filtro_clube_inexistente_na_api`: Busca por clube não defendido retorna lista vazia ou 404 sem erro 500.
- **Borda R3**:
  - `test_t2_r3_rating_minutos_zero_sem_nota`: Jogador com 0 minutos jogados retorna nota nula e status "Sem nota".
  - `test_t2_r3_rating_clamping_teto_dez`: Saldo brutalmente positivo (ex: 5 gols, 3 assistências) é limitado assintoticamente a 10.00.
  - `test_t2_r3_rating_clamping_piso_tres`: Saldo extremamente negativo (expulsão imediata, falhas graves) é limitado a 3.00.
  - `test_t2_r3_goleiro_gols_sofridos_decaimento_marginal`: Goleiro sofrendo muitos gols sofre penalidade amortecida pela potência 0.85 (evitando notas negativas).
  - `test_t2_r3_xg_chute_longa_distancia_pe_fraco`: Finalização de longa distância com pé fraco gera xG mínimo (0.010), sem zerar.
  - `test_t2_r3_xg_zero_finalizacoes`: Análise de xG com 0 chutes retorna zeros estruturados e perfil neutro.
- **Borda R4**:
  - `test_t2_r4_dixon_coles_lambda_minimo_clamping`: Taxa esperada de gols $\lambda = 0.01$ (super retranca) calcula sem erro numérico.
  - `test_t2_r4_dixon_coles_lambda_maximo_clamping`: Taxa esperada de gols $\lambda = 10.0$ (goleada extrema) satura sem overflow.
  - `test_t2_r4_sqlite_teto_com_margem_seguranca_5mb`: Tamanho do banco é menor que 89.0 MB garantindo margem de mais de 5 MB abaixo do teto de 94 MB.
  - `test_t2_r4_auditoria_partidas_recentes_nao_nulas`: Auditoria valida que temporadas recentes (2024, 2025, 2026) possuem contagens ativas de partidas.

---

### Camada 3: Tier 3 - Cross-Feature Combinations (Interações Pareadas)
Verifica o comportamento integrado de múltiplos subsistemas interagindo simultaneamente:
1. **Interação 1 (Acervo Parcial + Sofascore Rating)**:
   - Atletas históricos pré-2018 (Zico, Romário) com `acervo_parcial: True` consom ratings Sofascore ou fallback de scouting sem colidir os dados de carreira oficial com notas por partida.
2. **Interação 2 (Acervo Parcial + Radar Pentagonal PES)**:
   - O cálculo dos eixos `atk`, `fin`, `fis` utiliza prioritariamente os dados da carreira oficial (`carreira_oficial["gols"]`, `carreira_oficial["jogos"]`), garantindo que o radar reflita o impacto real do jogador e não notas achatadas pelo acervo incompleto de súmulas.
3. **Interação 3 (Saneamento de Clubes + Histórico de Temporadas)**:
   - A purga de clubes espúrios (River Plate / U. de Chile de atletas brasileiros) reflete-se harmonicamente tanto no campo agregado `clubes` quanto no `historico_temporadas` e `historico_clubes` do endpoint `/api/jogadores/perfil`.
4. **Interação 4 (Métricas xG + Perfil Clínico + Eixo Finalização do Radar)**:
   - Atletas com alto Delta xG e perfil "Clínico de Elite" (ou finalizadores letais) exibem nota no eixo `fin` (Finalização) coerente ($\ge 85$), demonstrando alinhamento entre o motor de xG discreto e o radar PES.
5. **Interação 5 (Expansão de Schema + Limite de Armazenamento Vercel)**:
   - A adição de colunas em `atleta_sofascore_ratings` e novos registros de scouting preservam estritamente o banco SQLite abaixo de 94.0 MB com integridade relacional 12/12.

---

### Camada 4: Tier 4 - Real-World Application Scenarios (Jornadas Reais de Usuário)
Testes de ponta a ponta simulando as consultas mais críticas da plataforma FutStats:
- **Cenário 1: Perfil Completo de Luís Fabiano (ID 9033)**:
  - Consulta ao perfil via API `/api/jogadores/perfil?id=9033`:
    - Rótulo `jogos_rotulo` é `"Jogos c/ Gol"`.
    - `acervo_parcial` é `True`.
    - Média oficial de carreira exibida é aproximadamente `0.53` (403 gols / 755 jogos).
    - Nenhum clube espúrio estrangeiro (River Plate, Universidad de Chile) presente na lista de clubes.
    - Radar Pentagonal calculado com 5 eixos preenchidos e `ovr` $\ge 80$.
- **Cenário 2: Perfil Lendário de Zico e Romário**:
  - Consulta aos perfis históricos:
    - Acervo parcial ativado com rótulo transparente "Jogos c/ Gol".
    - Exibição de totais de carreira oficiais (Zico 530 gols / 777 jogos; Romário 744 gols / 961 jogos).
    - Média de gols da carreira autêntica preservada.
- **Cenário 3: Artilheiro Moderno (Pedro / Gabigol)**:
  - Consulta a atletas com cobertura completa pós-2018:
    - `acervo_parcial` é `False`, `jogos_rotulo` é `"Jogos"`.
    - Métricas xG/npxG e Delta xG calculadas e não-nulas.
    - Classificação clínica coerente (ex: "Clínico de Elite" ou "Volume Shooter").
- **Cenário 4: Blindagem de Goleiro (Mycael ID 2066)**:
  - Consulta ao perfil de goleiro contemporâneo:
    - Zero gols atribuídos nas décadas de 80 e 90.
    - Clube atual Athletico Paranaense / Seleção de base, sem clubes espúrios como Boca Juniors ou San Lorenzo.
    - Posição canônica 'Goleiro' com eixo defensivo do radar priorizado.
- **Cenário 5: Pipeline Integral de Aceitação de Produção**:
  - Execução sequencial completa de verificação de sanidade do sistema:
    1. Auditoria relacional de banco (`scripts/auditar_integridade_dados.py` 12/12).
    2. Suíte preditiva matemática (`tests/test_model_evals.py` 22/22).
    3. Verificação do teto de storage SQLite (< 94.0 MB).
    4. Verificação de integridade física SQLite (`PRAGMA integrity_check`).

---

## 3. Matriz de Rastreabilidade

| Requisito | Descrição | Tiers Cobertos | Arquivos Testados | Status de Execução |
|-----------|-----------|----------------|-------------------|-------------------|
| **R1** | Reconciliação Jogos-Gols & Rótulo Honesto | T1, T2, T3, T4 | `data/futebol.db`, `backend/app.py` | Executável |
| **R2** | Purga de Clubes Espúrios & Conmebol | T1, T2, T3, T4 | `data/futebol.db`, `backend/app.py` | Executável |
| **R3** | Ratings Sofascore (tanh), xG e Radar PES | T1, T2, T3, T4 | `calculo_player_rating.py`, `calculo_xg_discreto.py`, `backend/app.py` | Executável |
| **R4** | Storage < 94MB, Auditoria 12/12, Regressão 22/22 | T1, T2, T3, T4 | `data/futebol.db`, `auditar_integridade_dados.py`, `test_model_evals.py` | Executável |

---

## 4. Instruções de Execução

```bash
# Execução da suíte completa de testes E2E
./.venv/bin/pytest tests/test_e2e_futstats.py -v

# Execução filtrada por Camada (Tier)
./.venv/bin/pytest tests/test_e2e_futstats.py -k "tier1" -v
./.venv/bin/pytest tests/test_e2e_futstats.py -k "tier2" -v
./.venv/bin/pytest tests/test_e2e_futstats.py -k "tier3" -v
./.venv/bin/pytest tests/test_e2e_futstats.py -k "tier4" -v

# Execução conjunta de toda a garantia de qualidade (E2E + Evals)
./.venv/bin/pytest tests/test_model_evals.py tests/test_e2e_futstats.py -v
```
