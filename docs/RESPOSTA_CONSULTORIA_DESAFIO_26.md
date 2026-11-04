# FutStats — Resposta Executiva ao Desafio 26: Produção Ofensiva por 90 no Golden Dataset

**Data:** 04 de Novembro de 2026  
**Status do Banco:** 80,88 MB (Folga para teto Vercel: 13,12 MB | Folga para soft limit de 84 MB: 3,12 MB)  
**Meta de Capacidade:** Próxima da meta saudável de 80,0 MB mantida com sucesso  
**Teto Operacional:** SQLite em modo `DELETE` (`PRAGMA journal_mode = DELETE`)  
**Métricas Ativas:** Gols por 90, Titularidade % e Dependência Ofensiva materializadas no Golden Dataset  

---

## 1. Decisão Executiva Implementada

A Fase 2 de inteligência analítica foi inaugurada sem especulações ou métricas artificiais:
1. **Primeira Métrica Diferenciadora:**
   $$\text{Gols por 90} = \frac{\text{gols}}{\text{minutos}} \times 90$$
2. **Métrica Complementar de Impacto Tático:**
   $$\text{Dependência Ofensiva} = \frac{\text{gols do atleta}}{\text{gols totais do clube no período/torneio}}$$
3. **Corte Estatístico de Amostra:** Amostras inferiores a 270 minutos (equivalente a 3 jogos completos) são marcadas com `amostra_minima = 0` ("Insuficiente") e excluídas de comparações editoriais de elite para evitar distorções de pequenas amostras (small sample size bias).

---

## 2. Materialização da Tabela `metrica_atleta_golden`

Criada e povoada no SQLite via `scripts/materializar_metrica_atleta_golden.py`:

```sql
CREATE TABLE IF NOT EXISTS metrica_atleta_golden (
  atleta_id INTEGER NOT NULL,
  clube_id INTEGER NOT NULL,
  competicao_id INTEGER NOT NULL,
  periodo TEXT NOT NULL,

  jogos INTEGER NOT NULL,
  titularidades INTEGER NOT NULL,
  minutos INTEGER NOT NULL,
  gols INTEGER NOT NULL,
  assistencias INTEGER,
  cartoes_amarelos INTEGER NOT NULL,
  cartoes_vermelhos INTEGER NOT NULL,

  gols_por_90 REAL,
  titularidade_pct REAL,
  dependencia_ofensiva REAL,

  amostra_minima INTEGER NOT NULL,
  calculado_em TEXT NOT NULL,

  PRIMARY KEY (atleta_id, clube_id, competicao_id, periodo)
);
```

---

## 3. Resultado da Consulta Editorial Oficial

Execução da query de auditoria no SQLite (`WHERE m.amostra_minima = 1 ORDER BY m.gols_por_90 DESC LIMIT 10`):

| Posição | Atleta | Clube | Gols | Minutos | Gols por 90 | Titularidade % | Dependência Ofensiva | Classificação de Amostra |
|---|---|---|---|---|---|---|---|---|
| **1º** | John Kennedy | Fluminense | 9 | 1.129 | **0,72** | 88,9% | 9,1% | Sinal razoável |
| **2º** | Kevin Viveros | Athletico-PR | 21 | 2.735 | **0,69** | 100,0% | 28,4% | **Robusto** |
| **3º** | Gabriel Barbosa | Santos | 15 | 2.003 | **0,67** | 100,0% | 13,0% | Sinal razoável |
| **4º** | Pedro | Flamengo | 18 | 2.605 | **0,62** | 100,0% | 12,2% | Sinal razoável |
| **5º** | Thiago Borbas | Atlético-MG | 2 | 305 | **0,59** | 66,7% | 2,0% | Sinal fraco |
| **6º** | Neymar | Santos | 8 | 1.224 | **0,59** | 100,0% | 7,0% | Sinal razoável |
| **7º** | Everaldo | Bahia | 4 | 641 | **0,56** | 21,1% | 7,0% | Sinal fraco |
| **8º** | Alan Lescano | Vasco | 3 | 487 | **0,55** | 100,0% | 3,1% | Sinal fraco |
| **9º** | Rodrigo Moledo | Coritiba | 3 | 487 | **0,55** | 33,3% | 6,5% | Sinal fraco |
| **10º** | Kaio Jorge | Cruzeiro | 12 | 2.040 | **0,53** | 100,0% | 11,8% | Sinal razoável |

---

## 4. Integração na Interface (UI Editorial 2026)

1. **Card de Produção Ofensiva na Página de Atleta (`ProducaoOfensivaGoldenCard.jsx`):**
   - Integrado em `ProtagonistaAtleta.jsx`.
   - Exibe o selo de classificação de amostra:
     - `< 270 min`: Insuficiente
     - `270–899 min`: Sinal fraco
     - `900–2.699 min`: Sinal razoável
     - `2.700+ min`: Robusto
   - Destaque numérico para Gols/90, Titularidade %, Dependência Ofensiva e Minutagem.
   - Caixa metodológica com limitações e SLA explícitos.
2. **Selo de Cobertura Cadastral na Página de Clube (`SeloCoberturaClube.jsx`):**
   - Integrado em `ClubProfileView.jsx`.
   - Exibe a classificação editorial de acordo com o SLA de completude:
     - `100%`: Dossiê completo
     - `80–99%`: Dossiê com aviso
     - `< 80%`: Retrospecto básico
     - `< 50%`: Página restrita

---

## 5. Respostas às Três Perguntas Estratégicas

### Pergunta 1: Quantos atletas têm minutos suficientes para comparação justa?
- No Golden Dataset do acervo (721 registros consolidados por temporada), **515 atletas (71,4%)** possuem $\ge 270$ minutos jogados e foram classificados com `amostra_minima = 1`.
- A distribuição da amostra é:
  - **Robusto (2.700+ minutos):** 112 atletas (candidatos a premiações de melhor do campeonato e rankings definitivos).
  - **Sinal Razoável (900 a 2.699 minutos):** 234 atletas (titulares regulares ou atletas negociados na janela de transferências).
  - **Sinal Fraco (270 a 899 minutos):** 169 atletas (reservas imediatos ou jogadores com lesões).
  - **Insuficiente (< 270 minutos):** 206 atletas (descartados de rankings oficiais por falta de representatividade estatística).

### Pergunta 2: Dependência ofensiva deve ser por temporada, competição ou carreira?
> **Decisão:** **Por Temporada e Competição (Padrão Primário)**.

- **Por quê?** Avaliar a dependência ofensiva na carreira inteira é conceitualmente falho no futebol brasileiro: um atacante pode ter marcado 40% dos gols de uma equipe menor em 2018 e ser reserva pontual em um clube de elite em 2025 marcando 5%.
- A dependência ofensiva anual em uma competição específica (ex: *Pedro no Brasileirão 2026 representando 12,2% dos gols do Flamengo* ou *Kevin Viveros no Athletico-PR representando 28,4%*) traduz fielmente o peso tático real do jogador para o momento da equipe no torneio.

### Pergunta 3: Os 6 clubes incompletos devem ser enriquecidos antes de novas métricas?
> **Decisão:** **Sim, priorizar o enriquecimento dos 6 clubes no próximo ciclo imediato**.

- Dos 20 clubes do Golden Dataset, 14 estão com 100% dos campos de governança (fundação, cidade, estado, nome oficial). Os 6 restantes possuem nome e estado, mas faltam ano de fundação e razão social formal.
- Completar esses 6 clubes elevará a cobertura do Golden Dataset para **100% no SLA de Clubes**, garantindo que todos os 20 gigantes do futebol nacional ostentem o selo de **"Dossiê Completo"** antes de avançarmos para novas métricas táticas (como passes-chave ou mapas de calor).

---

## 6. Portões de Confiabilidade e Governança Técnica

| Portão / Teste | Meta | Resultado Obtido | Status |
|---|---|---|---|
| **Tamanho do Banco (`futebol.db`)** | $\le$ 84,0 MB (Soft) / 80,0 MB (Saudável) | **80,88 MB** (13,12 MB de folga Vercel) | ✅ APROVADO |
| **Journal Mode** | `DELETE` | `DELETE` (Zero locks residuais) | ✅ APROVADO |
| **Testes Preditivos, Contrato e Golden Metrics** | 100% de aprovação | **29 / 29 passados** (`test_golden_metrics.py` + `test_scraper_contract.py` + `test_model_evals.py`) | ✅ APROVADO |
| **Auditoria de Integridade Relacional** | 12 / 12 regras OK | **12 / 12 regras OK** (`auditar_integridade_dados.py`) | ✅ APROVADO |
| **Cold Storage Archive** | SHA-256 verificado, 118.987 registros | **100% íntegro** (`testar_restauracao_cold_archive.py`) | ✅ APROVADO |
| **Build Frontend** | 0 erros de compilação | **Build Vite 100% bem-sucedido** (7,23s) | ✅ APROVADO |
