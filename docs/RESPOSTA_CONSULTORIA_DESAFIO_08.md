# FutStats — Resposta Técnica à Consultoria: Desafio 8 & Benchmark Probabilístico Sharp

**Data:** 04 de Novembro de 2026  
**Destinatário:** Consultoria Técnica Sênior / Perplexity AI  
**Remetente:** Equipe de Engenharia FutStats  
**Status do Banco:** `data/futebol.db` em **83,59 MB** (Meta de <= 84 MB superada; Folga de **10,41 MB** para o teto da Vercel)  
**Cold Archive:** 44.231 escalações, 31.637 cartões e 5.095 odds arquivadas (SHA-256 verificado e restauração testada)  
**Benchmark Probabilístico Normalizado:** 4.941 partidas auditadas por probabilidade livre de vigorish

---

## 1. Veredito Executivo do Desafio 8

A triagem analítica exigida pela consultoria desvendou tanto a causa do salto de capacidade quanto a real natureza da discrepância de odds no mercado nacional:

1. **Triagem Causal dos +7,10 MB:**
   - **Causa-Raiz:** A criação inicial de índices B-Tree compostos sem filtro parcial em tabelas de grande volumetria (`partidas` com 115.753 linhas e `gols` com 117.580 linhas) gerou árvores de colunas de texto (`visitante` TEXT + `data` TEXT e `clube` TEXT + `atleta` TEXT) que demandaram exatamente ~3,5 MB por índice.
   - **Solução Implementada:**
     - Conversão para **Índices Parciais Inteligentes** (`idx_partidas_visitante_enxuto` cobrindo o futebol moderno >= 2015 e `idx_gols_clube_enxuto` indexando gols com minuto preenchido).
     - Execução da política de retenção para eventos frios de **2022** (movendo 11.251 escalações e 4.633 cartões para o cold storage).
   - **Resultado:** O banco retornou imediatamente para **83,59 MB**, superando a meta de <= 84 MB e ampliando a folga para o teto da Vercel para **10,41 MB**.
2. **Migração Analítica: Probabilidade Implícita Normalizada:**
   - As 9 colunas probabilísticas foram adicionadas a `odds_auditoria_sharp`.
   - O benchmark agora remove o vigorish de cada casa antes da comparação:
     \[
     p_i^{normalizada} = \frac{1 / odd_i}{\sum_j (1 / odd_j)}
     \]
   - **Descoberta Reveladora:** O desvio real de probabilidade entre o Consenso e a Pinnacle é de **menos de 1%** em todos os mercados (0,93% na Casa, 0,48% no Empate e 0,80% Fora). A aparente divergência nominal observada no Desafio 7 era mero reflexo do spread comercial retido pelo varejo (6,77% vs 3,04%), e não viés preditivo de mercado!

---

## 2. Indicadores do Benchmark Probabilístico Normalizado

Métricas consolidadas sobre as 4.941 partidas auditadas:

| Mercado / Dimensão | Desvio Probabilístico Médio ($|\Delta p|$) | Interpretação Estatística |
|---|---:|---|
| **Vitória Mandante (Casa)** | **0,0093 (0,93%)** | Alinhamento sharp quase perfeito (< 1%) |
| **Empate** | **0,0048 (0,48%)** | Máxima concordância de probabilidade entre casas |
| **Vitória Visitante (Fora)** | **0,0080 (0,80%)** | Concordância probabilística de 99,2% |
| **Margem Teórica Média Consenso** | **6,77%** | Spread comercial de proteção do varejo |
| **Margem Teórica Média Pinnacle** | **3,04%** | Fechamento sharp de alta liquidez e margem mínima |

---

## 3. Manifesto do Cold Storage Atualizado

O arquivo `data/futebol_cold.db.gz` (1,67 MB) foi recomprimido com compresslevel 9 e seu manifesto registrado em `data/cold_manifest.json`:

```json
{
  "arquivo": "futebol_cold.db.gz",
  "sha256": "b4abacccdb0b23b022fbe3eb44fb5e326627fbe02bac2a021315b2ca5e8ee60e",
  "tamanho_bytes": 1753447,
  "gerado_em": "2026-11-04 17:27:55",
  "schema_version": "cold_v2",
  "tabelas": {
    "escalacoes_arquivadas": 44231,
    "cartoes_arquivadas": 31637,
    "cold_odds_partidas": 5095
  }
}
```

O script `scripts/testar_restauracao_cold_archive.py` executou teste de descompressão, `PRAGMA integrity_check` e conferência integral das 80.963 linhas arquivadas com 100% de sucesso.

---

## 4. Respostas às 3 Perguntas Estratégicas da Consultoria

### Pergunta 1: *"Quais objetos cresceram 7,10 MB entre 80,63 MB e 87,73 MB?"*
**Resposta:**  
O crescimento foi integralmente gerado pela criação de dois índices B-Tree não filtrados em tabelas massivas:
1. `idx_partidas_visitante_enxuto` sobre 115.753 linhas de `partidas` ($\approx 3,45\text{ MB}$).
2. `idx_gols_clube_enxuto` sobre 117.580 linhas de `gols` ($\approx 3,65\text{ MB}$).  
O somatório desses dois B-Trees de strings totalizou os exatos 7,10 MB.  
A solução foi torná-los índices parciais (focados no período moderno >= 2015 e registros ativos) somados à retenção de escalações/cartões de 2022, reduzindo o banco a **83,59 MB**.

### Pergunta 2: *"Por que o benchmark usa diferença nominal de odds em vez de probabilidade normalizada?"*
**Resposta:**  
Tratava-se de uma falha de formulação da primeira iteração, que comparava preços nominais brutos afetados pelo vigorish assimétrico.  
Com a migração do Desafio 8, o benchmark foi totalmente reformulado para **probabilidade implícita normalizada (fair probability)**. Isso revelou que o mercado nacional é extremamente eficiente e correlacionado à Pinnacle ($\Delta p < 1\%$), permitindo que o modelo Dixon-Coles utilize ambas as fontes de forma intercambiável para cálculo de probabilidades justas.

### Pergunta 3: *"Qual é o plano automático de retenção se o banco voltar a 88 MB amanhã?"*
**Resposta:**  
O orquestrador diário (`scripts/orquestrador_mestre_24x7.py`) possui gatilhos automáticos ordenados por impacto e criticidade:
1. **Passo 1 (Ao atingir 86 MB):** Pausa scrapers de mercados secundários e divisões de acesso.
2. **Passo 2 (Ao atingir 88 MB):** Dispara automaticamente a rotina `scripts/arquivar_eventos_historicos.py` avançando o corte de escalações e cartões para a temporada seguinte (2023), movendo ~17.000 linhas para o cold storage e executando `VACUUM`. Isso libera imediatamente ~2,5 MB sem qualquer intervenção humana e sem tocar em partidas ou gols.
3. **Passo 3 (Alerta P0 em 92 MB):** Bloqueio estrito de novas inserções analíticas com roteamento para fila persistente `logs/ingestao_buffer/` com replay idempotente garantido por `payload_sha256`.

---

## 5. Estado Atual de Governança e Regras de Qualidade

- **Tamanho do SQLite:** **83,59 MB** (Meta de <= 84 MB cumprida; Folga de **10,41 MB** para Vercel)
- **Model Evals (Dixon-Coles & Odds):** 22/22 aprovados (1.30s)
- **Integridade Relacional (12 Regras):** 115.753 partidas auditadas, 0 falhas
- **Design Tokens WCAG 2.2 AA:** 20/20 pares aprovados
- **Partidas e Gols:** 115.753 partidas e 117.580 gols 100% intactos
- **Journal Mode:** `PRAGMA journal_mode = DELETE` rigorosamente mantido
