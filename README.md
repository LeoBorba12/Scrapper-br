# ⚽ Scrapper-br: Big Data do Futebol Brasileiro e Sul-Americano (1959–2024) + Meteorologia Histórica

> **Dois bancos de dados SQLite isolados e normalizados** para permitir infinitas combinações analíticas e fatos inusitados virais com custo $0 de infraestrutura:
> 1. `data/futebol.db`: Banco unificado de **34.270 partidas oficiais** e **41.429 gols detalhados**, cobrindo o futebol brasileiro de 1959 a 2024 e todas as grandes competições continentais e mundiais da história.
> 2. `data/clima.db`: Banco meteorológico diário cobrindo as 12 principais praças esportivas do Brasil de 2015 a 2024 (43.800+ registros).

---

## 🏛️ Arquitetura dos Bancos de Dados Isolados

Mantemos o banco de **Futebol** totalmente desacoplado do banco de **Meteorologia**. Graças ao recurso `ATTACH DATABASE` do SQLite, é possível realizar consultas cruzadas relacionando qualquer variável do jogo com o clima do dia em microssegundos:

```
┌──────────────────────────────────────────────┐        ┌─────────────────────────────────┐
│               data/futebol.db                │        │         data/clima.db           │
├──────────────────────────────────────────────┤        ├─────────────────────────────────┤
│ • partidas (34.270 jogos de 1959 a 2024)     │  JOIN  │ • clima_diario (43.836 dias)    │
│   - Brasileirão (1959-2024): 21.643 jogos    │◄──────►│   - 2015 a 2024 (10 anos)       │
│   - Copa do Brasil (1989-2024): 3.314 jogos  │ (data  │   - 12 principais capitais      │
│   - Copa Libertadores (1960-2024): 6.441 jgs │   +    │   - temp_max, temp_min, média   │
│   - Copa Sul-Americana (2002-2024): 2.054 jgs│ estado)│   - precipitação (chuva em mm)  │
│   - Mundiais FIFA / Toyota: 46 jogos         │        │   - umidade e velocidade vento  │
│   - Supercopa / Mercosul / CONMEBOL: 734 jgs │        │   - condição textual            │
│   - Recopa Sul-Americana: 38 jogos           │        │                                 │
│ • gols (41.429 gols detalhados com atletas)  │        │                                 │
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
| **Copa Libertadores da América** | 1960–2024 | 65 | 6.441 | 17.059 | 2,65 | 48,9% | 24,3% | 26,8% |
| **Copa Sul-Americana** | 2002–2024 | 23 | 2.054 | 4.982 | 2,43 | 36,3% | 26,0% | 37,7% |
| **Copa do Mundo de Clubes FIFA** | 2000–2023 | 13 | 31 | 84 | 2,71 | 58,1% | 9,7% | 32,3% |
| **Copa Intercontinental** | 1962–1999 | 11 | 15 | 47 | 3,13 | 80,0% | 13,3% | 6,7% |
| **Copa Mercosul** | 1998–2001 | 4 | 278 | 822 | 2,96 | 52,9% | 24,8% | 22,3% |
| **Copa CONMEBOL** | 1992–1999 | 8 | 240 | 660 | 2,75 | 34,6% | 26,7% | 38,8% |
| **Supercopa Libertadores** | 1988–1997 | 10 | 216 | 515 | 2,38 | 35,6% | 27,8% | 36,6% |
| **Recopa Sul-Americana** | 1988–2024 | 21 | 38 | 85 | 2,24 | 60,5% | 21,1% | 18,4% |
| **TOTAL GERAL CATALOGADO** | **1959–2024** | **240+** | **34.270** | **87.866** | **2,56** | **47,7%** | **26,7%** | **25,6%** |

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