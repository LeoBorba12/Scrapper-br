# ⚽ Scrapper-br: Big Data do Futebol Brasileiro (1959–2024) + Meteorologia Histórica

> **Dois bancos de dados SQLite isolados e normalizados** para permitir infinitas combinações analíticas e fatos inusitados virais com custo $0 de infraestrutura:
> 1. `data/futebol.db`: Banco unificado de **66 anos do Campeonato Brasileiro (1959 a 2024)** com 21.640+ partidas, 21.500+ gols detalhados, cartões, escalações e equipes de arbitragem.
> 2. `data/clima.db`: Banco meteorológico diário cobrindo as 12 principais praças esportivas do Brasil de 2015 a 2024 (43.800+ registros).

---

## 🏛️ Arquitetura dos Bancos de Dados Isolados

Mantemos o banco de **Futebol** totalmente desacoplado do banco de **Meteorologia**. Graças ao recurso `ATTACH DATABASE` do SQLite, é possível realizar consultas cruzadas relacionando qualquer variável do jogo com o clima do dia em microssegundos:

```
┌──────────────────────────────────────────────┐        ┌─────────────────────────────────┐
│               data/futebol.db                │        │         data/clima.db           │
├──────────────────────────────────────────────┤        ├─────────────────────────────────┤
│ • partidas (21.643 jogos de 1959 a 2024)     │  JOIN  │ • clima_diario (43.836 dias)    │
│   - Era Taça Brasil & Robertão (1959-1970)   │◄──────►│   - 2015 a 2024 (10 anos)       │
│     * 993 jogos catalogados                  │ (data  │   - 12 principais capitais      │
│   - Era Mata-Mata Brasileirão (1971-2002)    │   +    │   - temp_max, temp_min, média   │
│     * 11.865 jogos catalogados               │ estado)│   - precipitação (chuva em mm)  │
│   - Era Pontos Corridos (2003-2024)          │        │   - umidade e velocidade vento  │
│     * 8.785 jogos catalogados                │        │   - condição textual            │
│ • gols (21.532 gols detalhados com atletas)  │        │                                 │
│ • cartões (20.953 advertências registradas)  │        │                                 │
│ • escalações (35.547 atletas escalados)      │        │                                 │
└──────────────────────────────────────────────┘        └─────────────────────────────────┘
```

---

## ⚔️ As 3 Grandes Eras do Futebol Brasileiro Catalogadas

| Era Oficial CBF | Período | Partidas | Total Gols | Média Gols/Jogo | % Vitórias Mandante | % Empates | % Vitórias Visitante |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **1. Taça Brasil & Robertão** | 1959–1970 | 993 | 2.708 | 2,73 | 47,4% | 28,0% | 24,5% |
| **2. Mata-Mata do Brasileirão** | 1971–2002 | 11.865 | 28.436 | 2,40 | 48,1% | 28,7% | 23,2% |
| **3. Pontos Corridos** | 2003–2024 | 8.785 | 22.515 | 2,56 | 49,6% | 26,4% | 23,9% |
| **TOTAL UNIFICADO** | **1959–2024** | **21.643** | **53.659** | **2,48** | **48,7%** | **27,7%** | **23,6%** |

---

## 📋 Esquema Detalhado dos Bancos

### 1. `data/futebol.db`

* **`partidas`**:
  * `id_partida`: Identificador numérico único (`ano * 10000 + i`)
  * `ano`, `rodada`, `data` (YYYY-MM-DD), `horario` (HH:MM)
  * `estadio`, `cidade`, `estado`
  * `mandante`, `visitante`, `gols_mandante`, `gols_visitante`, `placar`, `vencedor`
  * **Arbitragem**: `arbitro`, `assistente_1` (bandeirinha 1), `assistente_2` (bandeirinha 2), `quarto_arbitro`, `var`
  * **Comissão & Público**: `tecnico_mandante`, `tecnico_visitante`, `publico`
  * **Competição**: `campeonato` (Taça Brasil, Torneio Roberto Gomes Pedrosa, Campeonato Brasileiro), `formato`, `fase`

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
# Minera a era pré-1971 (Taça Brasil e Robertão)
python minerar_1959_1970_pre71.py

# Minera a era mata-mata (1971-2002)
python minerar_pre2003_rsssf.py

# Constrói o banco moderno (2003-2024: súmulas CBF)
python construir_banco_futebol.py

# Constrói o banco de clima (API Open-Meteo para 12 praças)
python construir_banco_clima.py

# Valida toda a sanidade estatística de 1959 a 2024
python testar_validar_historico.py
```

---

## 🤖 Automação Diária (GitHub Actions)

O workflow [`.github/workflows/scraper_diario.yml`](.github/workflows/scraper_diario.yml) roda todos os dias à meia-noite (00:00 BRT):
- Atualiza as partidas recentes e súmulas da CBF.
- Atualiza o clima diário na Open-Meteo.
- Gera novos cards de estatísticas.
- Salva e commita automaticamente os bancos `data/*.db` atualizados no repositório.