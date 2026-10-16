# ⚽ Scrapper-br: Big Data do Futebol Brasileiro (1959–2024) + Meteorologia Histórica

> **Dois bancos de dados SQLite isolados e normalizados** para permitir infinitas combinações analíticas e fatos inusitados virais com custo $0 de infraestrutura:
> 1. `data/futebol.db`: Banco unificado de **24.957 partidas oficiais** cobrindo **66 anos do Campeonato Brasileiro (1959 a 2024)** e **todas as 36 edições da Copa do Brasil (1989 a 2024)**, com 23.900+ gols detalhados, cartões, escalações e arbitragem.
> 2. `data/clima.db`: Banco meteorológico diário cobrindo as 12 principais praças esportivas do Brasil de 2015 a 2024 (43.800+ registros).

---

## 🏛️ Arquitetura dos Bancos de Dados Isolados

Mantemos o banco de **Futebol** totalmente desacoplado do banco de **Meteorologia**. Graças ao recurso `ATTACH DATABASE` do SQLite, é possível realizar consultas cruzadas relacionando qualquer variável do jogo com o clima do dia em microssegundos:

```
┌──────────────────────────────────────────────┐        ┌─────────────────────────────────┐
│               data/futebol.db                │        │         data/clima.db           │
├──────────────────────────────────────────────┤        ├─────────────────────────────────┤
│ • partidas (24.957 jogos de 1959 a 2024)     │  JOIN  │ • clima_diario (43.836 dias)    │
│   - Taça Brasil (1959-1968): 451 jogos       │◄──────►│   - 2015 a 2024 (10 anos)       │
│   - Robertão (1967-1970): 542 jogos          │ (data  │   - 12 principais capitais      │
│   - Brasileirão Mata-Mata (1971-2002): 11.865│   +    │   - temp_max, temp_min, média   │
│   - Brasileirão Pontos Corridos: 8.785       │ estado)│   - precipitação (chuva em mm)  │
│   - Copa do Brasil (1989-2024): 3.314 jogos  │        │   - umidade e velocidade vento  │
│ • gols (23.901 gols detalhados com atletas)  │        │   - condição textual            │
│ • cartões (20.953 advertências registradas)  │        │                                 │
│ • escalações (35.547 atletas escalados)      │        │                                 │
└──────────────────────────────────────────────┘        └─────────────────────────────────┘
```

---

## ⚔️ Acervo Histórico por Competição

| Competição | Período | Edições | Partidas | Total Gols | Média Gols/Jogo | % Vitórias Mandante | % Empates | % Vitórias Visitante |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **Taça Brasil** | 1959–1968 | 10 | 451 | 1.339 | 2,97 | 51,0% | 24,4% | 24,4% |
| **Robertão (Taça de Prata)** | 1967–1970 | 4 | 542 | 1.369 | 2,53 | 44,5% | 31,0% | 24,5% |
| **Brasileirão (Mata-Mata)** | 1971–2002 | 32 | 11.865 | 28.436 | 2,40 | 48,1% | 28,7% | 23,2% |
| **Brasileirão (Pontos Corridos)** | 2003–2024 | 22 | 8.785 | 22.515 | 2,56 | 49,6% | 26,4% | 23,9% |
| **Copa do Brasil** | 1989–2024 | 36 | 3.314 | 8.953 | 2,70 | 45,6% | 25,8% | 28,6% |
| **TOTAL GERAL CATALOGADO** | **1959–2024** | **104** | **24.957** | **62.612** | **2,51** | **48,3%** | **27,5%** | **24,2%** |

---

## 📋 Esquema Detalhado dos Bancos

### 1. `data/futebol.db`

* **`partidas`**:
  * `id_partida`: Identificador numérico único
    * Brasileirão: `ano * 10000 + i` (1 a 1200)
    * Copa do Brasil: `ano * 10000 + 5000 + i` (5001 a 5600)
  * `ano`, `rodada`, `data` (YYYY-MM-DD), `horario` (HH:MM)
  * `estadio`, `cidade`, `estado`
  * `mandante`, `visitante`, `gols_mandante`, `gols_visitante`, `placar`, `vencedor`
  * **Arbitragem**: `arbitro`, `assistente_1` (bandeirinha 1), `assistente_2` (bandeirinha 2), `quarto_arbitro`, `var`
  * **Comissão & Público**: `tecnico_mandante`, `tecnico_visitante`, `publico`
  * **Competição**: `campeonato` (Taça Brasil, Torneio Roberto Gomes Pedrosa, Campeonato Brasileiro, Copa do Brasil), `formato`, `fase`

* **`gols`**:
  * `id_partida`, `rodada`, `clube`, `atleta`, `minuto`, `tempo` (1T/2T), `tipo_de_gol` (Normal, Pênalti, Falta, Contra)

* **`cartoes`**:
  * `id_partida`, `rodada`, `clube`, `atleta`, `cartao` (Amarelo/Vermelho), `num_camisa`, `posicao`, `minuto`, `motivo`

* **`escalacoes`**:
  * `id_partida`, `clube`, `atleta`, `num_camisa`, `posicao`, `titular` (1 ou 0), `is_goleiro` (1 ou 0), `is_capitao` (1 ou 0), `cbf_id`

---

## 🛠️ Como Executar Localmente

### 1. Requisitos
```bash
pip install -r requirements.txt
```

### 2. Construir ou atualizar os bancos
```bash
# Minera a Copa do Brasil (1989-2024: 36 edições completas)
python minerar_copa_do_brasil.py

# Minera a era pré-1971 (Taça Brasil e Robertão)
python minerar_1959_1970_pre71.py

# Minera a era mata-mata do Brasileirão (1971-2002)
python minerar_pre2003_rsssf.py

# Constrói o banco moderno (2003-2024: súmulas CBF)
python construir_banco_futebol.py

# Padroniza encodings e nomes de clubes
python higienizar_nomes_clubes.py

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