# 📋 Handover & Guia de Execução CLI: Enriquecimento Profissional de Atletas (OGol & Sofascore)

> **Documento Estratégico & Operacional para Continuidade via Antigravity CLI (`agy`)**  
> **Objetivo:** Alimentar perfis de jogadores além de gols/assistências (Goleiros, Defesas, Títulos, Prêmios e Métricas Sofascore) com consumo mínimo de CPU/RAM para manter o PC livre para jogos.

---

## 1. O Que Já Foi Feito (Estado Atual do Projeto)

### A. Base de Dados & Governança Relacional
- **Banco:** `data/futebol.db` (SQLite em modo WAL).
- **Tamanho Atual:** **~88.46 MB** (folga de ~5.54 MB sob o teto estrito de **94.0 MB** da Vercel).
- **Volume:** **113.971 partidas oficiais**, **95.522+ gols** catalogados e **19.000+ atletas**.
- **Auditoria de Integridade:** `python scripts/auditar_integridade_dados.py` com **12/12 regras OK (100%)**.
- **Testes de Regressão & Golden Facts:** `pytest tests/test_model_evals.py tests/test_golden_facts.py` (**47/47 testes passando**).

### B. Módulos & Infraestrutura Já Prontos
1. **Frontend (`frontend/src/components/ProtagonistaAtleta.jsx`):**
   - Já possui a sub-aba **"Títulos & Prêmios"** renderizando `atleta.titulos` e `atleta.premios`.
   - Já possui **Timeline de Carreira** (`AthleteCareerTimeline`), **Radar Pentagonal (PES/FIFA)** e **Scouts Profissionais**.
   - Já possui suporte ao rótulo honesto `"Jogos c/ Gol"` quando o atleta possui apenas acervo parcial de presenças pré-2018.
2. **Backend (`backend/app.py`):**
   - Endpoint `/api/jogadores/perfil` construído para entregar:
     - `titulos`: JSON parseado da coluna `titulos` de `jogadores_estatisticas`.
     - `premios`: JSON parseado da coluna `premios` de `jogadores_estatisticas`.
     - `sofascore_data`: ratings, xG acumulado, xA, últimas notas e heatmaps.
     - `scouts_profissionais`: cálculo dinâmico por posição (Goleiro, Defensor, Meia, Atacante).
3. **Serviço 24x7 & Auto-Restart:**
   - Serviço systemd de usuário `futstats-orquestrador.service` configurado com auto-restart em 15s e watchdog.

---

## 2. Diagnóstico das Lacunas Atuais (Exemplo: São Marcos)

Tomando como referência o caso do goleiro **Marcos (São Marcos)**:
- **No Banco Local:**
  - Existe em `jogadores_estatisticas` (`id_jogador = 102003`, `ogol_id = 5503`, `posicao = "Goleiro"`).
  - Possui `jogos_carreira_oficiais = 531` pelo Palmeiras.
  - **Falta:** As colunas `titulos`, `premios` e `clean_sheets` estão nulas/zeradas.
  - **Falta:** Não temos os dados consolidados de defesas difíceis, pênaltis defendidos (ex: os pênaltis históricos da Libertadores de 1999 e 2000 contra o Corinthians e Deportivo Cali).
- **Problema Geral:** Atletas históricos e goleiros lendários (Marcos, Rogério Ceni, Dida, Taffarel, Zetti, Cássio, Fábio, etc.) ou defensores (Gamarra, Geromel, Miranda, Lugano, Dedé) precisam de métricas correspondentes às suas posições:
  - **Goleiros:** Defesas, Clean Sheets (jogos sem sofrer gols), Pênaltis defendidos, Gols sofridos, Média de gols sofridos/jogo.
  - **Palmarés Universal:** Títulos conquistados por clube/seleção e prêmios individuais.
  - **Métricas Modernas (Sofascore):** Defesas por jogo, defesas dentro da área, notas médias e heatmaps de atuação.

---

## 3. Arquitetura de Tabelas & Schemas

### `jogadores_estatisticas` (SQLite)
Colunas prontas para armazenamento:
- `titulos` (TEXT / JSON): Lista de objetos `[{"titulo": "Copa do Mundo", "ano": 2002, "clube": "Seleção Brasileira"}, ...]`.
- `premios` (TEXT / JSON): Lista de objetos `[{"premio": "Melhor Goleiro da Libertadores", "ano": 1999}, ...]`.
- `clean_sheets` (INTEGER): Número de partidas oficiais sem sofrer gols.
- `detalhe_carreira_clubes` (TEXT / JSON): Clubes, períodos e jogos.
- `carreira_temporadas` (TEXT / JSON): Histórico temporada a temporada.
- `ogol_id` (INTEGER): ID único de mapeamento no OGol.

### `atleta_sofascore_ratings` (SQLite)
Tabela para métricas de scouting moderno:
- `id_jogador` (INTEGER PRIMARY KEY)
- `sofascore_id` (INTEGER)
- `rating_medio` (REAL)
- `jogos_avaliados` (INTEGER)
- `minutos_jogados` (INTEGER)
- `notas_ultimos_jogos_json` (TEXT / JSON)
- `heatmap_pontos_json` (TEXT / JSON)

*(Nota: Pode-se adicionar via `ALTER TABLE` colunas opcionais leves como `defesas_jogo REAL`, `clean_sheets INTEGER`, `penaltis_defendidos INTEGER` se desejado).*

---

## 4. O Plano de Ação em 3 Frentes

### Frente 1: Extrator de Títulos e Prêmios do OGol
- **Script Alvo:** Atualizar `scripts/scraper_ogol_carreira_atletas.py` ou criar `scripts/enriquecer_palmares_ogol.py`.
- **Origem dos Dados:** Na URL do OGol (`https://www.ogol.com.br/jogador/{slug}/{ogol_id}/titulos` ou na página principal do perfil).
- **Campos Extraídos:**
  - `titulos`: Nome da competição, temporada/ano, clube ou seleção nacional.
  - `premios`: Láureas individuais (Melhor da Posição, Bola de Prata/Ouro, Artilheiro, Luva de Ouro).
- **Persistência:** `UPDATE jogadores_estatisticas SET titulos = ?, premios = ? WHERE id_jogador = ?`.

### Frente 2: Métricas Especializadas para Goleiros e Defensores
1. **No SQLite / Partidas:**
   - Computar automaticamente `clean_sheets` a partir da tabela `partidas` cruzando com as `escalacoes` onde `is_goleiro = 1` e os gols sofridos da equipe na partida foram zero (`gols_sofridos == 0`).
2. **Dados Históricos Homologados:**
   - Cadastrar pênaltis defendidos em decisões e jogos históricos para os grandes ícones (São Marcos: 33 pênaltis defendidos no Palmeiras; Rogério Ceni: 51 pênaltis defendidos + 131 gols).

### Frente 3: Ingestão de Ratings e Scouts do Sofascore
- **Script Alvo:** `scripts/scraper_sofascore_ratings_pipeline.py`.
- **Metodologia:** Mapear os atletas ativos do futebol brasileiro (Série A/B e destaques) para coletar:
  - Rating médio oficial do Sofascore.
  - Histórico de notas das últimas 5 a 10 partidas.
  - Métricas de xG/xA e xSave (quando goleiro).

---

## 5. Como Executar via CLI (`agy`) Economizando o PC para Jogar

A interface gráfica do Antigravity/Electron consome GPU e de 2GB a 4GB de RAM. Rodando direto pelo CLI (`agy`), o consumo cai para menos de 150MB de RAM e 0% de GPU, deixando a máquina completamente livre e fluida para jogos.

### Como Iniciar no Terminal:
```bash
# 1. No terminal do Arch Linux, acesse o diretório do projeto:
cd "/mnt/jogos_f/Antigravity_Projetos_e_Ferramentas/Guia profissional"

# 2. Inicie o Antigravity no modo CLI:
agy
```

### Como Executar os Scripts com Prioridade Ultra-Baixa (Sem Drop de FPS):
Ao rodar qualquer script pesado de scraper ou banco pelo terminal ou pelo `agy`, use sempre os utilitários `nice` e `ionice` do Linux:
```bash
# Prioridade mínima de CPU (nice 19) e prioridade idle de disco (ionice -c 3):
nice -n 19 ionice -c 3 .venv/bin/python3 scripts/scraper_ogol_carreira_atletas.py --limit 20
```
*Isso garante que o processador e o SSD só processem os dados quando o seu jogo não estiver exigindo performance imediata!*

---

## 6. Prompt Pronto para Copiar e Colar no Antigravity CLI (`agy`)

Assim que abrir o terminal com `agy`, basta colar o seguinte prompt:

```text
Olá! Estou continuando nosso projeto pelo CLI para economizar memória e CPU para jogar no PC.

Leia o arquivo HANDOFF_CLI_ENRIQUECIMENTO_ATLETAS.md para entender todo o contexto.

Nosso objetivo agora é enriquecer as páginas de jogadores para além de gols e assistências, focando em:
1. Títulos e Prêmios Individuais (Palmarés completo extraído do OGol e persistido nas colunas 'titulos' e 'premios' de 'jogadores_estatisticas').
2. Goleiros: Tratar o caso de São Marcos (ID 102003, OGol 5503), Rogério Ceni, Cássio, Fábio, Dida e outros goleiros, adicionando títulos, prêmios, clean_sheets e defesas/pênaltis históricos.
3. Sofascore: Mapear e enriquecer os dados dos atletas em atividade com ratings e métricas avançadas na tabela 'atleta_sofascore_ratings'.

Importante:
- Execute comandos com 'nice -n 19 ionice -c 3' para não pesar a CPU.
- Mantenha o banco data/futebol.db estritamente abaixo do teto de 94.0 MB.
- Ao final, rode os gates: 'python scripts/auditar_integridade_dados.py' e 'pytest tests/test_model_evals.py tests/test_golden_facts.py'.

Por favor, apresente o plano de execução e inicie o enriquecimento.
```

---

## 7. Comandos de Verificação Rápida via Terminal (Sem Abrir Navegador)

Para checar os dados diretamente pelo terminal sem abrir o frontend:

```bash
# Verificar dados do São Marcos (ID 102003):
.venv/bin/python3 -c "import sqlite3; conn=sqlite3.connect('data/futebol.db'); c=conn.cursor(); c.execute('SELECT nome_exibicao, posicao, titulos, premios, clean_sheets FROM jogadores_estatisticas WHERE id_jogador=102003;'); print(c.fetchall())"

# Auditar integridade das 12 regras relacionais:
.venv/bin/python3 scripts/auditar_integridade_dados.py

# Conferir tamanho do banco contra o teto de 94 MB:
ls -lh data/futebol.db
```
