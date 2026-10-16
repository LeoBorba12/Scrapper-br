# ⚽ Scrapper-br: Big Data do Futebol Brasileiro + Meteorologia Histórica

> **Dois bancos de dados SQLite isolados e normalizados** para permitir infinitas combinações analíticas e fatos inusitados virais com custo $0 de infraestrutura:
> 1. `data/futebol.db`: Banco de partidas, gols, cartões, escalações e equipes de arbitragem.
> 2. `data/clima.db`: Banco meteorológico diário cobrindo as 12 principais praças esportivas do Brasil de 2015 a 2024 (43.800+ registros).

---

## 🏛️ Arquitetura dos Bancos de Dados Isolados

Mantemos o banco de **Futebol** totalmente desacoplado do banco de **Meteorologia**. Graças ao recurso `ATTACH DATABASE` do SQLite, é possível realizar consultas cruzadas relacionando qualquer variável do jogo com o clima do dia em microssegundos:

```
┌─────────────────────────────────┐        ┌─────────────────────────────────┐
│        data/futebol.db          │        │         data/clima.db           │
├─────────────────────────────────┤        ├─────────────────────────────────┤
│ • partidas (20.620 jogos)       │  JOIN  │ • clima_diario (43.836 dias)    │
│   - 11.835 jogos (1971-2002)    │◄──────►│   - 2015 a 2024 (10 anos)       │
│   - 8.785 jogos (2003-2024)     │ (data  │   - 12 principais capitais      │
│   - placar, técnicos, árbitros  │   +    │   - temp_max, temp_min, média   │
│ • gols (31.323 gols detalhados) │ estado)│   - precipitação (chuva em mm)  │
│ • cartões (20.953 advertências) │        │   - umidade e velocidade vento  │
│ • escalações (35.547 atletas)   │        │   - condição textual            │
└─────────────────────────────────┘        └─────────────────────────────────┘
```

---

## 📋 Esquema Detalhado dos Bancos

### 1. `data/futebol.db`

* **`partidas`**:
  * `id_partida`: Identificador único da partida
  * `ano`, `rodada`, `data` (YYYY-MM-DD), `horario` (HH:MM)
  * `estadio`, `cidade`, `estado`
  * `mandante`, `visitante`, `gols_mandante`, `gols_visitante`, `placar`, `vencedor`
  * **Arbitragem**: `arbitro`, `assistente_1` (bandeirinha 1), `assistente_2` (bandeirinha 2), `quarto_arbitro`, `var`
  * **Comissão & Público**: `tecnico_mandante`, `tecnico_visitante`, `publico`

* **`gols`**:
  * `id_partida`, `rodada`, `clube`, `atleta`, `minuto`, `tempo` (1T/2T), `tipo_de_gol` (Normal, Pênalti, Falta, Contra)

* **`cartoes`**:
  * `id_partida`, `rodada`, `clube`, `atleta`, `cartao` (Amarelo/Vermelho), `num_camisa`, `posicao`, `minuto`, `motivo`

* **`escalacoes`**:
  * `id_partida`, `clube`, `atleta`, `num_camisa`, `posicao`, `titular` (1 ou 0), `is_goleiro` (1 ou 0), `is_capitao` (1 ou 0), `cbf_id`

---

### 2. `data/clima.db`

* **`clima_diario`**:
  * `data` (YYYY-MM-DD), `cidade`, `estado` (PK composta)
  * `temperatura_max` (°C), `temperatura_min` (°C), `temperatura_media` (°C)
  * `precipitacao_mm` (acumulado diário de chuva)
  * `umidade_relativa_media` (%), `vento_velocidade_max` (km/h)
  * `condicao` (Ensolarado, Chuva Forte, Frio, Calor Extremo, etc.)

---

## ⚡ Exemplos de Consultas Cruzadas (`consultar_combinacoes.py`)

Você pode usar o script [`consultar_combinacoes.py`](consultar_combinacoes.py) para testar perguntas inusitadas:

### 1. Desempenho de um clube por temperatura:
```python
from consultar_combinacoes import analise_clube_por_temperatura

df = analise_clube_por_temperatura("Corinthians")
# Revela: No calor (>=28°C), Corinthians teve apenas 27 vitórias contra 73 derrotas;
# No frio/ameno (<=21°C), foram 50 vitórias mandantes contra 55 derrotas.
```

### 2. Árbitros que mais aplicam cartões em dias chuvosos:
```python
from consultar_combinacoes import analise_arbitros_e_chuva

df = analise_arbitros_e_chuva(min_jogos=15)
# Mostra jogos com chuva (>=5mm) vs secos e média de cartões por juiz
```

### 3. Maiores artilheiros em dias de calor escaldante:
```python
from consultar_combinacoes import analise_artilheiros_sob_calor

df = analise_artilheiros_sob_calor(min_gols=5)
# Top artilheiros em dias com temperatura >= 28°C:
# 1. Luciano (São Paulo) - 27 gols
# 2. Vinícius (Ceará) - 22 gols
# 3. Bruno Henrique (Flamengo) - 19 gols
# 4. Gabigol (Flamengo) - 17 gols
```

---

## 🛠️ Como Executar Localmente

### 1. Requisitos
```bash
pip install -r requirements.txt
```

### 2. Construir ou atualizar os bancos
```bash
# Constrói o banco de futebol (partidas, gols, árbitros, escalações)
python construir_banco_futebol.py

# Constrói o banco de clima (API Open-Meteo para 12 praças)
python construir_banco_clima.py
```

### 3. Rodar análises e gerar cards visuais para o Twitter
```bash
python consultar_combinacoes.py
python gerar_card_tweet.py
```

---

## 🤖 Automação Diária (GitHub Actions)

O workflow [`.github/workflows/scraper_diario.yml`](.github/workflows/scraper_diario.yml) roda todos os dias à meia-noite (00:00 BRT):
- Atualiza as partidas recentes e súmulas da CBF.
- Atualiza o clima diário na Open-Meteo.
- Gera novos cards de estatísticas.
- Salva e commita automaticamente os bancos `data/*.db` atualizados no repositório.