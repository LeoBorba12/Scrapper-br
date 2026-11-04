# FutStats — Resposta Técnica ao Desafio 13
## Confiança Editorial de Odds e Fair Odds como Produto

**Data:** 04 de Novembro de 2026  
**Status do Banco:** `data/futebol.db` em **87,64 MB**  
**Folga para o teto Vercel:** **6,36 MB** (teto 94,0 MB | soft limit interno 88,0 MB)  
**View Pública Segura:** `vw_odds_publicaveis` ativa e consumida pela interface  
**Gate Complementar de Coerência:** Implementado em [`backend/odds_quality_gate.py`](file:///f:/Antigravity_Projetos_e_Ferramentas/Guia%20profissional/backend/odds_quality_gate.py)  
**Integridade Relacional:** 12/12 regras aprovadas (`scripts/auditar_integridade_dados.py`)  
**Model Evals & Regression Gates:** 22/22 testes aprovados (`tests/test_model_evals.py`)  
**Build Frontend:** 100% aprovado (`vite build` em 15.62s)  

---

## 1. Posicionamento Estratégico e Linguagem Editorial

O FutStats concluiu formalmente o abandono de qualquer dialeto de aposta, tipster ou promessa de retorno financeiro. O produto agora assume sua identidade editorial definitiva:

> **Manifesto Editorial:** *"O FutStats estima probabilidades justas, contextualiza o mercado e preserva o acervo histórico do futebol brasileiro com transparência sobre a qualidade dos dados. O modelo Dixon-Coles é descritivo e de fair pricing — não uma fonte de edge contra o fechamento sharp."*

### Matriz de Linguagem Implementada na UI e no Backend:
| Dialeto Antigo (Proibido) | Nova Terminologia Editorial (Implementada) |
|---|---|
| “Aposta recomendada” | **“Leitura analítica”** |
| “Modelo encontra valor (+EV)” | **“Modelo estima probabilidade justa (Fair Odds)”** |
| “ROI garantido / Backtest lucrativo” | **“Backtest pré-registrado disponível”** |
| “Consenso confiável” | **“Consenso aprovado pelo gate de qualidade”** |
| “Bate a Pinnacle” | **“Comparado à Pinnacle como referência sharp”** |
| “Aba Apostas” | **“Aba Probabilidades & Mercado”** |

---

## 2. Tabela Canônica `odds_ingestao_status`

Criamos a tabela de telemetria e rastreabilidade de ingestão com integridade criptográfica de payload:

```sql
CREATE TABLE IF NOT EXISTS odds_ingestao_status (
  partida_id INTEGER NOT NULL,
  bookmaker_id INTEGER NOT NULL,
  status TEXT NOT NULL,
  motivo TEXT,
  margem_implicita REAL,
  payload_sha256 TEXT NOT NULL,
  recebido_em TEXT NOT NULL,
  PRIMARY KEY (partida_id, bookmaker_id)
);
```

### Telemetria Consolidada no Banco:
- **Total de Odds Monitoradas:** 15.955 registros únicos (4.948 fontes observadas + 11.007 consensos).
- **Aprovadas pelo Gate (Publicáveis):** 9.903 registros (100% da Pinnacle e 45% do consenso nacional).
- **Isoladas em Quarentena Técnica:** 6.052 registros (55% do consenso nacional com margem $> 15\%$).
- **Margem Média das Odds Aprovadas:** **4,52%** (padrão de casas profissionais).
- **Margem Média dos Feeds em Quarentena:** **17,35%** (anomalia de spreads de 2 vias da ESPN com empates sintéticos).

---

## 3. View Pública Segura `vw_odds_publicaveis`

Nenhuma tela ou endpoint do FutStats acessa diretamente tabelas de odds sem passar pela view segura:

```sql
CREATE VIEW IF NOT EXISTS vw_odds_publicaveis AS
SELECT 
    partida_id,
    bookmaker_id,
    bookmaker_nome,
    casa_abertura,
    empate_abertura,
    fora_abertura,
    casa_fechamento,
    empate_fechamento,
    fora_fechamento,
    fechamento_coletado_em,
    mercado_principal,
    atualizado_em
FROM odds_partidas_resumo
WHERE status = 'aprovado';
```

Também atualizamos `vw_odds_fechamento_principal`, garantindo que cotações com margens predatórias ou inválidas sejam completamente invisíveis para os usuários.

---

## 4. Gate Complementar de Coerência de Mercado

O módulo [`backend/odds_quality_gate.py`](file:///f:/Antigravity_Projetos_e_Ferramentas/Guia%20profissional/backend/odds_quality_gate.py) foi ampliado com 3 filtros objetivos:

1. **Detecção de Spreads Incompletos:** Rejeição de feeds onde o empate é artificialmente cravado em 3.25 enquanto as pontas são assimétricas (spreads americanos de 2 vias).
2. **Bloqueio de Inversão de Favorito:** Bloqueio imediato se um time com força ofensiva relativa $> 1.6$ for cotado com odd $> 4.50$ (erro de time invertido na raspagem).
3. **Desvio da Mediana Histórica (> 35%):** Confrontos tradicionais com odds que destoam mais de 35% da mediana histórica recente são marcados como `pendente_auditoria`.

---

## 5. Experiência Editorial e Painel de Saúde da Ingestão

### A. Selos de Confiança na Interface:
- **Selo Verde (Alta Confiança Sharp):** Fechamento auditado da Pinnacle.
- **Selo Oliva (Consenso Aprovado):** Consenso nacional aprovado pelo Quality Gate (margem entre 0% e 15%).
- **Alerta Âmbar (Quarentena Técnica):** Odds com anomalia de mercado são ocultadas das cotações públicas; exibe-se apenas a probabilidade justa com o aviso: *"Odds de mercado em quarentena técnica (margem atípica). Exibindo apenas probabilidade justa."*

### B. Fair Odds com Faixa de Incerteza:
Para cada confronto, o modelo expõe as probabilidades e fair odds acompanhadas de faixa de incerteza ($\pm 2,5\%$):
- Exemplo: Mandante 48,0% (Incerteza: 45,5% – 50,5%) | Fair Odd: 2.08.

### C. Novo Endpoint do Painel de Saúde:
- Rota: `GET /api/odds/saude-ingestao`
- Retorna em tempo real a taxa de aprovação, margens médias de feeds e distribuição de status.

---

## 6. Respostas Diretas às Três Perguntas Estratégicas

### 1. Odds em quarentena devem ser ocultadas ou exibidas com selo de baixa confiança?
**Resposta:** **Devem ser ocultadas das cotações ativas de mercado, mas o confronto deve ser exibido com as probabilidades justas do modelo e um aviso transparente de quarentena.**  
Exibir odds corrompidas (como Fortaleza a 7.52) mesmo com selo de baixa confiança induz o usuário a erro e degrada a credibilidade do produto. O comportamento correto adotado é: as probabilidades justas do Dixon-Coles continuam visíveis, e no lugar da odd de mercado exibe-se: *"Odds de mercado em quarentena técnica (margem atípica de 17% a 35%)"*.

### 2. O Dixon-Coles deve ser apresentado como probabilidade justa ou estimativa editorial?
**Resposta:** **Como Probabilidade Justa (Fair Odds descritivas com faixa de incerteza).**  
O termo "estimativa editorial" soa como opinião subjetiva de jornalista esportivo. O Dixon-Coles é um modelo estatístico formal (Poisson bivariado com dependência de placares baixos). Apresentá-lo como **Probabilidade Justa e Fair Pricing** acompanhado da faixa de incerteza ($\pm 2,5\%$) expressa rigor matemático sem prometer "edge" contra casas de apostas.

### 3. Reparar os 6.052 feeds em quarentena ou aceitar menor cobertura com qualidade garantida?
**Resposta:** **Aceitar menor cobertura de odds imediatas com qualidade garantida, enquanto os 6.052 payloads brutos permanecem preservados em quarentena para reprocessamento em segundo plano.**  
No acervo histórico de 115.753 partidas, o mais importante para o usuário comum é a integridade dos dados de futebol (gols, scouts, escalações e estatísticas de atletas). Forçar a publicação de odds corrompidas apenas para ter "números bonitos" foi exatamente o que gerou o ROI falso do Desafio 10. A quarentena preserva a integridade sem perda de dados históricos.

---

## 7. Conformidade de Engenharia e Capacidade

| Requisito | Limite / Meta | Valor Obtido | Status |
|---|:---:|:---:|:---:|
| **Tamanho do SQLite** | $< 88,0 \text{ MB}$ (soft) / $< 94,0 \text{ MB}$ (teto) | **87,64 MB** | APROVADO |
| **Folga de Armazenamento** | $> 5,0 \text{ MB}$ | **6,36 MB** | APROVADO |
| **SQLite Journal Mode** | Estritamente `DELETE` | `DELETE` | APROVADO |
| **Integridade Relacional** | 12 regras | 12/12 regras OK | APROVADO |
| **Model Evals (Dixon-Coles)** | 22/22 testes | 22/22 aprovados (0.72s) | APROVADO |
| **Cold Storage Checksum** | SHA-256 verificado | $100\%$ íntegro | APROVADO |
| **Build do Frontend** | Sem erros | `vite build` 100% OK | APROVADO |
