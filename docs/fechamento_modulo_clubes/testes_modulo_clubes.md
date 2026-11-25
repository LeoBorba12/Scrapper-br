# Consolidação de Testes e Rastreabilidade de Falhas — Módulo Clubes

**Data:** 08 de novembro de 2026  
**Ambiente de Execução:** Python 3.12.15 (ambiente limpo `/tmp/venv312`)  
**Commit Baseline (`main`):** [`ff31b24844b740d6b2229af5db3683f2417069f4`](https://github.com/LeoBorba12/Scrapper-br/commit/ff31b24844b740d6b2229af5db3683f2417069f4)  
**Commit em Revisão (`preview/modulo-clubes`):** [`800b0d494e9652894d1b0c6827508112583d3368`](https://github.com/LeoBorba12/Scrapper-br/commit/800b0d494e9652894d1b0c6827508112583d3368)  
**Snapshot de Banco Utilizado:** `data/futebol.db` (85.229.568 bytes, 115.754 partidas, 117.523 gols, `journal_mode=wal`, SHA-256: `4eee61fec45eac6f70e3d7195688ceefef13c92d9e8130e26ef2e14cf6d37e8b`)  
**Comando de Execução Canônica:** `/tmp/venv312/bin/pytest tests/test_clubes_canonica_api.py -v`  

---

## 1. Resumo da Suíte Canônica do Módulo Clubes

A suíte dedicada do Módulo de Clubes ([`tests/test_clubes_canonica_api.py`](file:///mnt/jogos_f/Antigravity_Projetos_e_Ferramentas/Guia%20profissional/tests/test_clubes_canonica_api.py)) foi expandida de 17 para **18 testes canônicos**, cobrindo exaustivamente todas as regras de negócio das Fases 1 e 2:

- **Total de testes:** 18
- **Aprovados (PASSED):** 18 (100%)
- **Falhos (FAILED):** 0
- **Ignorados (SKIPPED):** 0
- **Tempo de execução:** 6.93s sob Python 3.12.15

### Lista Nominal dos 18 Testes Canônicos de Clubes:

1. `test_clubes_lista_geral_contrato`: Valida contrato da lista paginada de clubes, campos canônicos obrigatórios, paginação e ordenação.
2. `test_clubes_busca_alias_athletico`: Valida busca resiliente por aliases ("athletico", "furacao", "cap") resolvendo para ID canônico #323.
3. `test_clubes_deduplicacao_deterministica_palmeiras`: Valida a deduplicação de confrontos no histórico, impedindo que partidas duplicadas inflem vitórias ou gols.
4. `test_clubes_detalhe_institucional_completo`: Valida dossiê completo de clube de Série A (Palmeiras #2459) com estádio, fundação, técnico e capacidade.
5. `test_clubes_detalhe_sem_perfil_institucional`: Valida tratamento honesto de clube sem linha em `clubes_perfil` (Red Bull Bragantino #2702) — campos ausentes retornam `None` sem valores fictícios.
6. `test_clubes_sem_metricas_bed`: Valida clube sem cobertura analítica BED 2026 (Sport #2982), garantindo `tem_metricas_bed_2026 = False` e `metricas_avancadas_preview = None`.
7. `test_clubes_id_inexistente_retorna_404`: Valida resposta HTTP 404 estrita para ID inexistente (#999999).
8. `test_clubes_filtro_mando_e_competicao`: Valida isolamento estrito de recortes por mando (casa/fora) e competição sem contaminação mútua.
9. `test_nao_fusao_de_entidades_distintas`: Valida que clubes homônimos ou de nomes semelhantes não sofram fusão acidental.
10. `test_clube_elenco_setores`: Valida agrupamento do elenco em 4 setores táticos estritos: `goleiros`, `defensores`, `meio_campistas` e `atacantes`.
11. `test_clube_estatisticas_basicas_e_bed`: Valida aba de estatísticas, distribuição de gols temporais e desacoplamento de KPIs analíticos BED.
12. `test_clube_historico_titulos_artilheiros`: Valida aba de histórico, títulos conquistados e artilheiros históricos.
13. `test_clube_elenco_resolucao_posicoes_e_marcelo_lomba`: **Invariante crítica de identidade:** Garante que Marcelo Lomba seja classificado como Goleiro e não herde a posição de Atacante ou os 11 gols históricos de Adaílton.
14. `test_invariante_matematica_titulares_menor_igual_jogos`: **Invariante matemática estrita:** Para 100% dos atletas do elenco, `titularidades <= jogos_disputados` e `jogos_disputados = titularidades + reservas_que_entraram`.
15. `test_auditoria_5_metodos_posicoes`: Valida os 5 métodos de resolução de posições e suas tags auditáveis.
16. `test_clube_historico_escopos_gols_verificaveis`: Valida metadados estritos de schema para discrepâncias históricas (155 gols de Ademir da Guia em `clubes_perfil` sem narrativa especulativa).
17. `test_partidas_santos_0x0_distintas_com_fase`: Valida que partidas legítimas semelhantes (dois 0x0 entre Santos e Palmeiras em fases distintas) sejam ambas preservadas na deduplicação.
18. `test_elenco_temporada_pre_2023_sem_escalacao_ficticia`: Valida que temporadas pré-2023 (onde súmulas não foram digitalizadas) retornem `total_atletas = 0` e `escalacoes_digitalizadas = False`, sem preenchimento artificial.

---

## 2. Invariantes Críticas Comprovadas por Testes

| Invariante Exigida | Evidência de Implementação | Teste de Cobertura | Status |
| :--- | :--- | :--- | :---: |
| **Titularidades <= Jogos** | `assert titularidades <= jogos_disputados` em cada atleta | `test_invariante_matematica_titulares_menor_igual_jogos` | **Aprovado** |
| **Jogos = Titulares + Reservas que Entraram** | `jogos_disputados = titularidades + substituto_entrou` | `test_invariante_matematica_titulares_menor_igual_jogos` | **Aprovado** |
| **Relacionado sem atuar não conta como jogo** | Atletas com 0 titularidades e 0 entradas possuem `jogos_disputados = 0` | `test_invariante_matematica_titulares_menor_igual_jogos` | **Aprovado** |
| **Isolamento de Recortes** | Clausulado SQL `WHERE` isola ano, campeonato e mando independentemente | `test_clubes_filtro_mando_e_competicao` | **Aprovado** |
| **Goleiro não vira atacante** | Prevalência estrita de súmula e função tática impede herança de ID colidido | `test_clube_elenco_resolucao_posicoes_e_marcelo_lomba` | **Aprovado** |
| **Ambiguidade não resolvida silenciosamente** | Atleta sem evidência suficiente recebe badge honesto "Posição a confirmar" | `test_auditoria_5_metodos_posicoes` | **Aprovado** |
| **Deduplicação não infla KPIs** | Hash determinístico baseado em data, mandante, visitante e campeonato | `test_clubes_deduplicacao_deterministica_palmeiras` | **Aprovado** |
| **Partidas legítimas preservadas** | Desempate por fase/rodada preserva jogos idênticos em placar | `test_partidas_santos_0x0_distintas_com_fase` | **Aprovado** |
| **Clube sem perfil institucional** | Resposta 200 com campos nulos honestos sem inventar fundação/estádio | `test_clubes_detalhe_sem_perfil_institucional` | **Aprovado** |
| **Clube sem cobertura BED** | `tem_metricas_bed_2026 = False` e `metricas_avancadas_preview = None` | `test_clubes_sem_metricas_bed` | **Aprovado** |
| **Zero verdadeiro vs Ausência** | Contagens 0 retornam `0`; dados desconhecidos retornam `None` | `test_clube_estatisticas_basicas_e_bed` | **Aprovado** |
| **Proteção pré-2023** | Temporadas sem escalação digitalizada informam cobertura vazia | `test_elenco_temporada_pre_2023_sem_escalacao_ficticia` | **Aprovado** |

### 2.1 Esclarecimento Formal: Total de Jogos, Participações e Cobertura Parcial

1. **Definição das Métricas de Atletas:**
   - `titularidades`: Número de partidas iniciadas nos 11 titulares.
   - `substituto_entrou`: Número de partidas em que iniciou no banco e ingressou em campo durante a partida.
   - `jogos_disputados`: Total de partidas com participação efetiva em campo pelo atleta.
   - `reservas`: Partidas em que o atleta esteve relacionado no banco mas não entrou em campo (mantidas estritamente separadas).

2. **Participações Completas (Recortes 2023–2026 com súmula digitalizada):**
   - **Igualdade estrita de participação:** $\text{jogos\_disputados} = \text{titularidades} + \text{substituto\_entrou}$.
   - **Desigualdade de titularidade:** $\text{titularidades} \le \text{jogos\_disputados}$.
   - **Total de convocações:** $\text{total\_partidas\_relacionado} = \text{jogos\_disputados} + \text{reservas}$.

3. **Cobertura Parcial (Temporadas Pré-2023):**
   - Em súmulas históricas onde apenas os 11 titulares foram digitalizados (ausência de dados de suplência/minutagem), `substituto_entrou` é nulo ou 0.
   - A relação reduz-se a $\text{jogos\_disputados} = \text{titularidades}$.
   - A API sinaliza `cobertura_parcial = true` e o frontend informa com transparência que dados de banco de reservas não foram digitalizados para o período, preservando a proibição estrita de gerar valores fictícios.

---

## 3. Classificação Nominal e Comparativa das 17 Falhas Gerais

Execução comparativa da suíte geral entre o commit baseline da branch `main` ([`ff31b24`](https://github.com/LeoBorba12/Scrapper-br/commit/ff31b24)) e a branch `preview/modulo-clubes` ([`800b0d4`](https://github.com/LeoBorba12/Scrapper-br/commit/800b0d4)).

**Evidência:** 16 das 17 falhas ocorrem com idêntica mensagem de erro em `main`, comprovando tratar-se de inconformidades pré-existentes na base ou testes legados. A falha 17 decorre do modo `wal` do ambiente local ativo. **Nenhuma falha é regressão nova introduzida pelo Módulo Clubes.**

| # | Teste (Failing Test) | Resultado Baseline (`main`) | Resultado Atual (`preview`) | Erro Resumido | Módulo / Rota Afetado | Domínio | Classificação Técnica |
|---|---|:---:|:---:|---|---|---|:---:|
| 1 | `test_adv_01_no_goals_in_0x0_matches` | FAILED | FAILED | 78 partidas históricas (2003–2007) com placar 0x0 mas com linhas em `gols` | Integridade `partidas` x `gols` | Partidas / Gols legados | **Pré-existente confirmada** |
| 2 | `test_adv_03_no_multi_minute_packed_rows` | FAILED | FAILED | 23 registros na tabela `gols` com múltiplos minutos agrupados em string ("45, 89") | Parser da tabela `gols` | Gols históricos (M2) | **Pré-existente confirmada** |
| 3 | `test_adv_04_goal_sum_does_not_exceed_official_score` | FAILED | FAILED | 278 partidas antigas onde soma de linhas em `gols` excede o placar oficial | Integridade de súmulas históricas | Partidas / Gols | **Pré-existente confirmada** |
| 4 | `test_adv_07_governance_and_regression_baselines` | FAILED | FAILED | Tipo de gol `'Barriga'` (Renato Gaúcho 1995) fora do enum estrito do teste | Vocabulário canônico de gols | Gols históricos | **Pré-existente confirmada** |
| 5 | `test_top_scorers_positive_delta_xg_and_clinico_de_elite` | FAILED | FAILED | Arquétipo tático de Pedro: retornado `'Pivô e Finalizador Nato'`, teste exige `'Clínico de Elite'` | `/api/jogadores/perfil` | Atletas / Arquétipos | **Pré-existente confirmada** |
| 6 | `test_goalkeeper_mycael_fallback_and_scouts` | FAILED | FAILED | Atributo de ataque de goleiro reserva Mycael retornou `None` em vez de default 40 | `/api/jogadores/radar-atributos` | Atletas / Goleiros / Radar | **Pré-existente confirmada** |
| 7 | `test_goalkeeper_rogerio_ceni_scoring_goalkeeper` | FAILED | FAILED | xG acumulado de Rogério Ceni retornou 0.0 (modelo de xG não computa faltas pré-2023) | `/api/jogadores/perfil` | Atletas / xG histórico | **Pré-existente confirmada** |
| 8 | `test_midfielders_ratings_and_scouts` | FAILED | FAILED | Fonte do scout de Ganso retornou `'sofascore'`, asserção exige `'futstats_scouting'` | `/api/jogadores/scouts` | Atletas / Proveniência | **Pré-existente confirmada** |
| 9 | `test_ancient_historical_legends_clean_numbers_no_crashing` | FAILED | FAILED | Média de gols de Pelé calculada em 0.92, assert rígido espera 0.91 | `/api/jogadores/perfil` | Atletas / Lendas | **Pré-existente confirmada** |
| 10 | `test_athlete_zero_matches_zero_minutes` | FAILED | FAILED | 8 atletas cadastrados sem partidas e sem minutagem presentes na listagem | `/api/jogadores/resumo` | Atletas / Sanitização | **Pré-existente confirmada** |
| 11 | `test_luis_fabiano_reconciliation` | FAILED | FAILED | Luís Fabiano totaliza 350 jogos no banco; asserção esperava 158 (apenas Série A) | `/api/jogadores/perfil` | Atletas / Recorte histórico | **Pré-existente confirmada** |
| 12 | `test_historical_legends_zico_and_romario` | FAILED | FAILED | Zico retorna 548 jogos agregados no acervo secular; teste exige 98 jogos | `/api/jogadores/perfil` | Atletas / Acervo secular | **Pré-existente confirmada** |
| 13 | `test_modern_players_no_false_acervo_parcial` | FAILED | FAILED | Dudu (ID 13) acionou flag `acervo_parcial=True` por partidas de início de carreira sem súmula | `/api/jogadores/perfil` | Atletas / Salvaguardas | **Pré-existente confirmada** |
| 14 | `test_radar_pes_comprehensive_150_athletes` | FAILED | FAILED | Goleiro ID 102008 incluiu eixo `'ref'` (Reflexos), teste restringe aos 5 eixos de linha | `/api/jogadores/radar-pes` | Atletas / Radar PES | **Pré-existente confirmada** |
| 15 | `test_t2_r1_atleta_apenas_gols_sem_escalacao` | FAILED | FAILED | Paulinho Criciúma (ID 6) não ativou `acervo_parcial=True` no nó `resumo` | `/api/jogadores/perfil` | Atletas / Boundary Tier 2 | **Pré-existente confirmada** |
| 16 | `test_fact_sanitizacao_clubes_arrascaeta_e_baier` | FAILED | FAILED | 'The Strongest' presente na coluna `clubes` de Arrascaeta em `jogadores_estatisticas` | Integridade cadastral de atletas | Atletas / Passagens | **Pré-existente confirmada** |
| 17 | `test_banco_governanca_teto_e_journal_mode` | FAILED | FAILED | `PRAGMA journal_mode` retornou `'wal'`, teste exige `'delete'` (modo de empacotamento Vercel) | Infraestrutura / Concorrência | Governança SQLite | **Problema de ambiente (WAL local)** |
