# FutStats — Resposta Executiva ao Desafio 24: Núcleo Canônico de Entidades e Contrato de Dados

**Data:** 04 de Novembro de 2026  
**Status do Banco:** 83,71 MB (Folga para teto Vercel: 10,29 MB | Abaixo do soft limit de 84,0 MB)  
**Teto Operacional:** SQLite em modo `DELETE` (`PRAGMA journal_mode = DELETE`)  
**Acervo Canônico:** 115.753 partidas (1902–2026), 2.462 clubes, 3.946 atletas, 324 técnicos e 278 árbitros  

---

## 1. Decisão Executiva e Visão por Fases

O FutStats não busca ser um clone descartável de serviços corporativos de live-data (como Opta ou Sportradar), cujos modelos de negócio exigem centenas de operadores alimentando passes em tempo real. O posicionamento do FutStats é **a maior e mais confiável autoridade editorial e analítica aberta do futebol brasileiro**, sustentada em 3 fases claras:

```
[FASE 1: Fundação Canônica Confiável] (Concluída no Desafio 24)
- Identidade única e resolução de aliases por entidade
- Contrato de dados estrito para scrapers com staging e quarentena
- Dimensões canônicas integradas ao acervo secular (1902-2026)

[FASE 2: Inteligência Analítica & Métricas Avançadas]
- Gols e cartões normalizados por 90 minutos
- Curva de sobrevida e aproveitamento ponderado de técnicos
- Rigor e viés estatístico de arbitragem por competição
- Modelagem de contexto (clima, mando, altitude e calendário)

[FASE 3: Experiência Profunda de Produto & Comparação Canônica]
- Dossiês de atletas e clubes prontos para jornalismo e debate
- Radares canônicos de confronto direto secular e tabus
- Exportação automatizada de dados para redações de rádio/TV
```

---

## 2. Resposta às Três Perguntas Estratégicas

### Pergunta 1: Quais 10 perguntas a base deve responder sobre cada entidade?

#### A. Clube
1. Qual é o retrospecto secular exato contra qualquer adversário do futebol brasileiro desde 1902?
2. Qual é a média histórica de gols marcados e sofridos como mandante versus visitante?
3. Quais são os maiores tabus históricos ativos (jogos e anos sem vencer ou sem perder)?
4. Quais foram as maiores goleadas a favor e contra em jogos oficiais?
5. Qual técnico teve o maior aproveitamento percentual com mais de 30 jogos comandados?
6. Qual é a taxa de conversão de vitórias quando abre o placar no primeiro tempo?
7. Qual atleta é o maior artilheiro histórico da agremiação no acervo catalogado?
8. Como o clube se comporta sob condições climáticas adversas (chuva, calor > 30°C ou altitude)?
9. Qual é o aproveitamento histórico do clube com os principais árbitros de elite?
10. Qual é a distribuição histórica de títulos e campanhas por década?

#### B. Atleta
1. Qual é a média real de gols por 90 minutos (excluindo acréscimos e partidas incompletas)?
2. Qual é a taxa de titularidade versus partidas como reserva acionado no decorrer do jogo?
3. Qual é o índice de dependência ofensiva da equipe em relação aos gols marcados pelo atleta?
4. Qual é a frequência de cartões amarelos e vermelhos por 90 minutos de jogo?
5. Como os gols do atleta se distribuem no relógio da partida (ex: primeiros 15 min vs últimos 15 min)?
6. Contra qual clube adversário o atleta possui o maior número de gols anotados?
7. Qual é a taxa de conversão de gols em clássicos estaduais e jogos eliminatórios (mata-mata)?
8. Qual foi a minutagem total e sequência mais longa de jogos consecutivos atuando como titular?
9. Qual é o histórico de participações diretas em gols (gols + assistências) por temporada?
10. Qual é a proporção de gols marcados dentro da grande área versus finalizações de fora da área?

#### C. Técnico
1. Qual é o aproveitamento percentual de pontos ponderado por clube e competição disputada?
2. Qual é a média de permanência (em meses e número de partidas) por ciclo em cada agremiação?
3. Qual é o retrospecto do técnico em confrontos diretos contra outros técnicos de elite?
4. Qual é o índice de viradas de jogo conquistadas no segundo tempo após alterações táticas?
5. Qual é o padrão de cartões recebidos pela equipe sob seu comando (índice de disciplina tática)?
6. Qual é o esquema tático preferido e como varia o aproveitamento ao utilizá-lo?
7. Qual é a média de gols pró e contra por jogo ao longo de toda a carreira?
8. Como o técnico performa contra equipes do G4 versus equipes da zona de rebaixamento?
9. Qual é o aproveitamento do treinador em fases eliminatórias (mata-mata) de copas?
10. Quantos títulos oficiais foram conquistados e qual a taxa de troféus por ano em atividade?

#### D. Árbitro
1. Qual é a média de cartões amarelos e vermelhos aplicados por partida em competições nacionais?
2. Existe assimetria estatística significativa na aplicação de cartões para mandantes versus visitantes?
3. Qual é a média de pênaltis marcados por jogo e qual proporção beneficia o mandante?
4. Como se compara o tempo médio de acréscimo concedido em relação à média geral da competição?
5. Qual é a taxa de faltas marcadas por jogo (árbitro permissivo vs árbitro rigoroso)?
6. Qual clube possui o maior número de partidas apitadas por este árbitro nos últimos 5 anos?
7. Como varia a taxa de cartões do árbitro em clássicos estaduais versus partidas regulares?
8. Qual é o histórico de decisões revisadas via VAR quando este árbitro atuou no campo?
9. Em quais competições ou estados o árbitro apresenta os desvios mais acentuados de cartões?
10. Qual é a correlação entre faltas marcadas e probabilidade de expulsão em jogos sob seu comando?

#### E. Competição & Temporada
1. Qual foi a média histórica de gols por partida em cada edição anual desde o início do torneio?
2. Qual é o percentual consolidado de vitórias do mandante, empates e vitórias do visitante?
3. Qual clube acumulou o maior número de vitórias e pontos na soma de todas as edições?
4. Qual foi a edição com o índice de cartões mais elevado da história da competição?
5. Quais equipes foram rebaixadas ou promovidas com maior frequência ao longo das décadas?
6. Como o formato de disputa (mata-mata vs pontos corridos) alterou a média de gols e zebras?
7. Qual atleta detém o recorde de artilharia em uma única edição do campeonato?
8. Qual é a taxa de decisões por pênaltis registradas em edições eliminatórias?
9. Qual é a média de público histórico por estádio e clube em cada década da competição?
10. Quais são as rivalidades regionais com maior número de confrontos na história deste torneio?

---

### Pergunta 2: Priorizar profundidade de poucas entidades ou amplitude de cobertura?

> **Decisão:** **Profundidade em Poucas Entidades Primeiro (Foco Canônico Vertical)**.

**Fundamentação Técnica e de Produto:**
1. **O Posicionamento do FutStats é a Autoridade Editorial:** A Opta e o SofaScore cobrem milhares de torneios e ligas periféricas com métricas rasas. O FutStats vence ao fornecer o dossiê mais profundo e confiável sobre os **20–30 maiores clubes do Brasil, seus 300 atletas titulares, seus principais técnicos e o retrospecto secular de clássicos**.
2. **Contenção Rigorosa de Capacidade (< 84 MB no SQLite):** Manter amplitude rasa para 50.000 jogadores de divisões inferiores incharia o banco sem agregar valor para os analistas e jornalistas de rádio/TV (os usuários internos). A profundidade das entidades de elite cabe em menos de **84 MB** com altíssimo valor analítico.
3. **Qualidade dos Dados (Clean Data):** É possível auditar com 100% de integridade as escalações, gols e cartões dos clubes das Séries A e B e dos clássicos regionais. Tentar amplitude imediata geraria dados órfãos, súmulas incompletas e quebra do contrato de dados.

---

### Pergunta 3: Qual métrica avançada diferencia o FutStats primeiro?

> **Métrica Escolhida:** **Diferencial Secular de Favoritismo Contextualizado (Fair Odds Dixon-Coles com Contexto Histórico e Clima)**.

**Por que esta métrica?**
- Nenhuma plataforma existente une a modelagem preditiva estatística pura (Dixon-Coles calibrado sem margem de casa de apostas) com o **peso secular de confrontos diretos, tabus ativos e contexto de campo**.
- Enquanto plataformas comerciais exibem apenas odds infladas com margem de 6% a 10% (overround), o FutStats entrega aos jornalistas e analistas a **probabilidade justa verdadeira** com intervalo de incerteza conformal (94,72% de cobertura no holdout) e contexto histórico imediato.

---

## 3. Cobertura Auditada do Núcleo Canônico

Execução via `scripts/auditar_cobertura_entidades.py`:

```json
{
  "acervo_partidas": 115753,
  "cobertura": {
    "clubes": {
      "total_dim_clube": 2462,
      "orfaos": 0,
      "taxa_cobertura_partidas": 1.0
    },
    "tecnicos": {
      "total_dim_tecnico": 324,
      "partidas_com_tecnico": 4184,
      "relacionamentos_clube": 541
    },
    "arbitros": {
      "total_dim_arbitro": 278,
      "partidas_com_arbitro": 31674,
      "pct_partidas": 27.36
    },
    "competicoes_temporadas": {
      "total_competicoes": 953,
      "total_temporadas": 1856,
      "partidas_cobertas": 115753,
      "pct_partidas": 100.0
    },
    "estadios": {
      "total_dim_estadio": 1619,
      "partidas_com_estadio": 52400,
      "pct_partidas": 45.27
    },
    "atletas": {
      "total_cadastrados": 3946,
      "com_gols_vinculados": 3252
    },
    "aliases_identidade": {
      "total_aliases": 8638,
      "distribuicao": {
        "arbitro": 278,
        "atleta": 4095,
        "clube": 2388,
        "estadio": 1553,
        "tecnico": 324
      }
    }
  }
}
```

---

## 4. Portões de Confiabilidade e Governança Técnica

| Portão / Teste | Meta | Resultado Obtido | Status |
|---|---|---|---|
| **Tamanho do Banco (`futebol.db`)** | $\le$ 84,0 MB (Soft limit) | **83,71 MB** (Folga de 10,29 MB p/ Vercel) | ✅ APROVADO |
| **Journal Mode** | `DELETE` | `DELETE` (Zero locks residuais) | ✅ APROVADO |
| **Testes Preditivos e de Contrato** | 100% de aprovação | **26 / 26 passados** (`test_scraper_contract.py` + `test_model_evals.py`) | ✅ APROVADO |
| **Auditoria de Integridade de Dados** | 12 / 12 regras OK | **12 / 12 regras OK** (`auditar_integridade_dados.py`) | ✅ APROVADO |
| **Resolução Canônica de Aliases** | Identidade única | **8.638 aliases indexados** com chave única | ✅ APROVADO |
| **Contrato de Ingestão de Scrapers** | Validação, hash e quarentena | Módulo `backend/scraper_contract.py` ativo | ✅ APROVADO |
