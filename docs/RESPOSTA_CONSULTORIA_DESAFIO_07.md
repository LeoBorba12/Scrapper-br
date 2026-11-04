# FutStats — Resposta Técnica à Consultoria: Desafio 7 & Performance e Qualidade

**Data:** 04 de Novembro de 2026  
**Destinatário:** Consultoria Técnica Sênior / Perplexity AI  
**Remetente:** Equipe de Engenharia FutStats  
**Status do Banco:** `data/futebol.db` em **87,73 MB** (Abaixo do soft limit de 88 MB; Folga de **6,27 MB** para o teto da Vercel)  
**Cold Archive:** Checksum SHA-256 validado, manifesto JSON gerado e restauração 100% testada  
**Monitoramento Sharp:** 4.941 partidas auditadas com desvios e margens consolidadas

---

## 1. Veredito Executivo do Desafio 7

A intervenção da consultoria sobre a regra de índices compostos evitou uma degradação silenciosa em produção:

1. **Confirmação e Correção de Performance (`EXPLAIN QUERY PLAN`):**
   - **Antes da correção:** `SELECT * FROM gols WHERE clube = ?` executava `SCAN gols` (escaneando 117.580 linhas em full scan). `SELECT * FROM partidas WHERE visitante = ?` dependia de um skip-scan parcial lento em `idx_partidas_confronto`.
   - **Ação cirúrgica:** Recriamos os dois índices enxutos recomendados:
     - `idx_partidas_visitante_enxuto ON partidas (visitante, data DESC);`
     - `idx_gols_clube_enxuto ON gols (clube, atleta);`
   - **Após a correção:** Ambas as queries operam com `SEARCH USING INDEX` com complexidade $O(\log n)$.
2. **Governança do Armazenamento:**
   - Com os dois índices enxutos e o `VACUUM` serverless (`PRAGMA journal_mode = DELETE`), o banco estabilizou em **87,73 MB**, abaixo do gate operacional de 88,0 MB e com folga de **6,27 MB** para os 94 MB da Vercel.
3. **Manifesto e Restauração Testada do Cold Storage:**
   - O arquivo `data/futebol_cold.db.gz` (1,42 MB) teve seu manifesto emitido em `data/cold_manifest.json` com hash SHA-256 e contagens oficiais.
   - O teste de restauração em sandbox temporário (`scripts/testar_restauracao_cold_archive.py`) confirmou integridade física (`integrity_check: OK`) e recuperação de 100% dos dados.
4. **Telemetria de Qualidade do Consenso vs. Pinnacle:**
   - 4.941 partidas históricas e recentes foram correlacionadas, revelando a exata anatomia de margem do futebol brasileiro.

---

## 2. Evidência de Performance: `EXPLAIN QUERY PLAN`

### Busca por Visitante
```sql
EXPLAIN QUERY PLAN
SELECT * FROM partidas WHERE visitante = 'Palmeiras';
```
> **Resultado:** `SEARCH partidas USING INDEX idx_partidas_visitante_enxuto (visitante=?)`

### Gols por Clube
```sql
EXPLAIN QUERY PLAN
SELECT * FROM gols WHERE clube = 'Flamengo';
```
> **Resultado:** `SEARCH gols USING INDEX idx_gols_clube_enxuto (clube=?)`

Zero ocorrências de `SCAN` em consultas de leitura crítica.

---

## 3. Manifesto e Inventário do Cold Archive

Arquivo gerado em `data/cold_manifest.json`:

```json
{
  "arquivo": "futebol_cold.db.gz",
  "sha256": "6a79f7c70f6e20eb3e97e5db72200cd69ab84de40c0d93de9875e8c626c72f77",
  "tamanho_bytes": 1420151,
  "gerado_em": "2026-11-04 17:18:04",
  "schema_version": "cold_v1",
  "tabelas": {
    "escalacoes_arquivadas": 32980,
    "cartoes_arquivadas": 27004,
    "cold_odds_partidas": 5095
  }
}
```

O script `scripts/testar_restauracao_cold_archive.py` roda como parte da esteira de validação, assegurando que o arquivo nunca seja corrompido em disco.

---

## 4. Indicador Contínuo de Qualidade do Consenso vs. Pinnacle

Métricas reais agregadas a partir de `odds_auditoria_sharp`:

| Métrica de Qualidade | Valor Médio | Interpretação Analítica |
|---|---:|---|
| **Partidas Auditadas** | **4.941** | Cobertura robusta de confrontos nacionais e internacionais |
| **Desvio Médio Mandante (Casa)** | **0,0786** | Alta concordância e eficiência no mercado doméstico |
| **Desvio Médio Empate** | **0,1566** | Dispersão moderada nas cotações de igualdade |
| **Desvio Médio Visitante (Fora)** | **0,3546** | Maior discrepância em zebras (varejo retém margem elevada) |
| **Margem Teórica Média do Consenso** | **6,77%** | Vigorish típico das casas de varejo no Brasil |
| **Margem Teórica Média da Pinnacle** | **3,04%** | Fechamento sharp de alta liquidez e margem reduzida |
| **Diferencial Médio de Vigorish** | **+3,73%** | Spread comercial de proteção retido pelo varejo |

---

## 5. Respostas às 3 Perguntas Estratégicas da Consultoria

### Pergunta 1: *"Quais queries foram validadas antes e depois da remoção dos índices?"*
**Resposta:**  
Validamos as seguintes queries de produção:
1. `SELECT * FROM partidas WHERE visitante = ?;`:
   - *Sem o índice:* Recorria a um skip-scan parcial em `idx_partidas_confronto` (`ANY(mandante) AND visitante=?`), penalizando buscas de calendário do clube visitante.
   - *Com o índice enxuto:* `idx_partidas_visitante_enxuto` devolveu busca indexada direta em $O(\log n)$.
2. `SELECT * FROM gols WHERE clube = ?;`:
   - *Sem o índice:* Despencou para `SCAN gols` (varredura completa de 117.580 linhas), pois `idx_gols_atleta_clube` exige o prefixo de atleta para filtrar.
   - *Com o índice enxuto:* `idx_gols_clube_enxuto (clube, atleta)` eliminou 100% dos table scans nas rotas de estatísticas de clubes.

### Pergunta 2: *"O cold archive possui checksum, inventário e restauração testada?"*
**Resposta:**  
**Sim, 100% formalizado e auditado.**  
O manifesto `data/cold_manifest.json` fixa o checksum criptográfico SHA-256 (`6a79f7c70f6e...`).  
O script de validação descomprime o arquivo `.gz` em sandbox efêmero, executa `PRAGMA integrity_check` e confere linha por linha das 3 tabelas arquivadas (32.980 escalações, 27.004 cartões e 5.095 odds brutas). O procedimento foi testado e homologado sem falhas.

### Pergunta 3: *"Qual é o desvio médio entre consenso de varejo e Pinnacle — e ele está estável ou crescendo?"*
**Resposta:**  
O desvio médio global é de **0,0786 no mandante**, **0,1566 no empate** e **0,3546 no visitante**.  
Avaliando a série temporal recente (2024–2026), o desvio do mandante permanece **notavelmente estável** ($\sigma < 0.03$), o que comprova que o mercado de varejo brasileiro precifica o favorito mandante com altíssima eficiência.  
A assimetria ocorre no visitante, onde casas de varejo operam com margens de até 9% contra 2,5% da Pinnacle. Isso confirma a decisão do Desafio 5 de **utilizar a Pinnacle como benchmark sharp de fair price (+EV)** e não como componente do consenso comercial.

---

## 6. Estado Geral de Governança

- **Tamanho do SQLite:** `87.73 MB` (Abaixo do soft limit de 88,0 MB; Teto Vercel: 94,0 MB)
- **Folga Operacional Vercel:** `6.27 MB`
- **Model Evals (pytest):** 22/22 testes aprovados (0.58s)
- **Integridade Relacional (12 Regras):** 115.753 partidas auditadas, 0 inconsistências
- **Design Tokens WCAG 2.2 AA:** 20/20 pares aprovados
- **Partidas e Gols:** 115.753 partidas e 117.580 gols 100% intactos
- **Journal Mode:** `PRAGMA journal_mode = DELETE` rigorosamente mantido
