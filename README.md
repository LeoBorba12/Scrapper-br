# ⚽ Scrapper-br: Big Data do Futebol Brasileiro e Sul-Americano (1950–2024) + Meteorologia Histórica

> **Dois bancos de dados SQLite isolados e normalizados** para permitir infinitas combinações analíticas e fatos inusitados virais com custo $0 de infraestrutura:
> 1. `data/futebol.db`: Banco unificado de **43.985 partidas oficiais** e **42.133 gols detalhados**, cobrindo o futebol brasileiro de 1950 a 2024 em torneios nacionais (Brasileirão, Copa do Brasil), estaduais (Paulista, Carioca, Mineiro, Gaúcho, Paranaense), regionais (Rio-SP, Nordeste, Sul-Minas) e internacionais (Libertadores, Sul-Americana, Mundiais FIFA).
> 2. `data/clima.db`: Banco meteorológico diário cobrindo as 12 principais praças esportivas do Brasil de 2015 a 2024 (43.800+ registros).

---

## 🏛️ Arquitetura dos Bancos de Dados Isolados

Mantemos o banco de **Futebol** totalmente desacoplado do banco de **Meteorologia**. Graças ao recurso `ATTACH DATABASE` do SQLite, é possível realizar consultas cruzadas relacionando qualquer variável do jogo com o clima do dia em microssegundos:

```
┌──────────────────────────────────────────────┐        ┌─────────────────────────────────┐
│               data/futebol.db                │        │         data/clima.db           │
├──────────────────────────────────────────────┤        ├─────────────────────────────────┤
│ • partidas (43.985 jogos de 1950 a 2024)     │  JOIN  │ • clima_diario (43.836 dias)    │
│   - Brasileirão (1959-2024): 21.643 jogos    │◄──────►│   - 2015 a 2024 (10 anos)       │
│   - Copa do Brasil (1989-2024): 3.314 jogos  │ (data  │   - 12 principais capitais      │
│   - Campeonatos Estaduais: 8.178 jogos       │   +    │   - temp_max, temp_min, média   │
│     * Paulista: 1.269 jogos                  │ estado)│   - precipitação (chuva em mm)  │
│     * Carioca: 1.798 jogos                   │        │   - umidade e velocidade vento  │
│     * Gaúcho: 2.008 jogos                    │        │   - condição textual            │
│     * Mineiro: 1.255 jogos                   │        │                                 │
│     * Paranaense: 1.727 jogos                │        │                                 │
│   - Torneios Regionais: 1.658 jogos          │        │                                 │
│     * Torneio Rio-São Paulo: 958 jogos       │        │                                 │
│     * Copa do Nordeste: 491 jogos            │        │                                 │
│     * Copa Sul-Minas: 209 jogos              │        │                                 │
│   - Copa Libertadores (1960-2024): 6.441 jgs │        │                                 │
│   - Copa Sul-Americana (2002-2024): 2.054 jgs│        │                                 │
│   - Mundiais FIFA / Toyota: 46 jogos         │        │                                 │
│   - Supercopa / Mercosul / CONMEBOL: 734 jgs │        │                                 │
│   - Recopa Sul-Americana: 38 jogos           │        │                                 │
│ • gols (42.133 gols detalhados com atletas)  │        │                                 │
│ • cartões (20.953 advertências registradas)  │        │                                 │
│ • escalações (35.547 atletas escalados)      │        │                                 │
└──────────────────────────────────────────────┘        └─────────────────────────────────┘
```

---

## ⚔️ Acervo Histórico por Competição

| Competição | Período | Edições | Partidas | Total Gols | Média Gols/Jogo | % Vitórias Mandante | % Empates | % Vitórias Visitante |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **Torneio Rio-São Paulo** | 1950–2002 | 23 | 958 | 3.437 | 3,59 | 57,9% | 22,5% | 19,5% |
| **Taça Brasil** | 1959–1968 | 10 | 451 | 1.339 | 2,97 | 51,0% | 24,4% | 24,4% |
| **Robertão (Taça de Prata)** | 1967–1970 | 4 | 542 | 1.369 | 2,53 | 44,5% | 31,0% | 24,5% |
| **Brasileirão (Mata-Mata)** | 1971–2002 | 32 | 11.865 | 28.436 | 2,40 | 48,1% | 28,7% | 23,2% |
| **Brasileirão (Pontos Corridos)** | 2003–2024 | 22 | 8.785 | 22.515 | 2,56 | 49,6% | 26,4% | 23,9% |
| **Copa do Brasil** | 1989–2024 | 36 | 3.314 | 8.953 | 2,70 | 45,6% | 25,8% | 28,6% |
| **Campeonato Paulista** | 2001–2024 | 15 | 1.269 | 3.702 | 2,92 | 45,2% | 24,9% | 29,9% |
| **Campeonato Carioca** | 2002–2023 | 19 | 1.798 | 5.182 | 2,88 | 47,2% | 23,9% | 29,0% |
| **Campeonato Gaúcho** | 2002–2022 | 16 | 2.008 | 5.458 | 2,72 | 48,7% | 25,4% | 25,9% |
| **Campeonato Mineiro** | 2002–2024 | 19 | 1.255 | 3.458 | 2,76 | 48,4% | 23,3% | 28,3% |
| **Campeonato Paranaense** | 2003–2022 | 16 | 1.727 | 4.874 | 2,82 | 49,3% | 26,0% | 24,7% |
| **Copa do Nordeste** | 1997–2003 | 7 | 491 | 1.461 | 2,98 | 50,7% | 23,4% | 25,9% |
| **Copa Sul-Minas** | 2000–2002 | 3 | 209 | 671 | 3,21 | 45,5% | 24,9% | 29,7% |
| **Copa Libertadores da América** | 1960–2024 | 65 | 6.441 | 17.059 | 2,65 | 48,9% | 24,3% | 26,8% |
| **Copa Sul-Americana** | 2002–2024 | 23 | 2.054 | 4.982 | 2,43 | 36,3% | 26,0% | 37,7% |
| **Copa do Mundo de Clubes FIFA** | 2000–2023 | 13 | 31 | 84 | 2,71 | 58,1% | 9,7% | 32,3% |
| **Copa Intercontinental** | 1962–1999 | 11 | 15 | 47 | 3,13 | 80,0% | 13,3% | 6,7% |
| **Copa Mercosul** | 1998–2001 | 4 | 278 | 822 | 2,96 | 52,9% | 24,8% | 22,3% |
| **Copa CONMEBOL** | 1992–1999 | 8 | 240 | 660 | 2,75 | 34,6% | 26,7% | 38,8% |
| **Supercopa Libertadores** | 1988–1997 | 10 | 216 | 515 | 2,38 | 35,6% | 27,8% | 36,6% |
| **Recopa Sul-Americana** | 1988–2024 | 21 | 38 | 85 | 2,24 | 60,5% | 21,1% | 18,4% |
| **TOTAL GERAL CATALOGADO** | **1950–2024** | **350+** | **43.985** | **116.589** | **2,65** | **48,2%** | **26,0%** | **25,8%** |

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