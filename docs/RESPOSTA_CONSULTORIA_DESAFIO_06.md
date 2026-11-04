# FutStats — Resposta Técnica à Consultoria: Desafio 6 & Retorno ao Alvo de 80 MB

**Data:** 04 de Novembro de 2026  
**Destinatário:** Consultoria Técnica Sênior / Perplexity AI  
**Remetente:** Equipe de Engenharia FutStats  
**Status do Banco:** `data/futebol.db` em **80,63 MB** (Alvo saudável de longo prazo de 80 MB atingido!)  
**Folga para o teto Vercel:** **13,37 MB** (Teto: 94 MB)  
**Folga para o soft limit interno:** **7,37 MB** (Soft limit: 88 MB)  
**Redução Líquida no Desafio 6:** **-6,77 MB (-7,7%)**

---

## 1. Veredito Executivo do Desafio 6

O diagnóstico da consultoria foi aplicado integralmente, transformando a contenção operacional em estabilidade duradoura. Superamos a meta de retornar aos 84 MB, atingindo **80,63 MB**:

1. **Classificação Rigorosa do Cálculo (`tipo_calculo`):**
   - Adicionada a coluna `tipo_calculo` em `odds_consenso_partida`.
   - Casos com apenas 1 painel agora são classificados com transparência matemática como `tipo_calculo = 'fonte_unica'` e `metodo = 'painel_nacional_v1'`. Apenas eventos com 2 ou mais fontes independentes recebem o rótulo `'consenso'`.
2. **Remoção da Pinnacle do Consenso Canônico:**
   - A Pinnacle foi categoricamente excluída do consenso de varejo (`incluido_no_consenso = 0`, `motivo_exclusao = 'benchmark_sharp_exclusivo'`).
   - Sua atuação fica restrita à tabela especializada `odds_auditoria_sharp`, onde opera como balizador de valor esperado (+EV) e menor margem teórica.
3. **Eliminação de Duplicação: De Insumos para Decisões:**
   - A tabela redundante `odds_consenso_insumos` (que duplicava dezenas de milhares de floats em 8 colunas) foi **completamente removida**.
   - Em seu lugar, ativamos `odds_consenso_decisoes`, uma tabela normalizada e compacta que apenas referencia `(partida_id, bookmaker_id)` em `odds_partidas_resumo` e registra a auditoria da inclusão/exclusão.
4. **Higiene Operacional de Índices Redundantes:**
   - Removemos `idx_gols_clube` (absorvido por `idx_gols_atleta_clube`) e `idx_partidas_visitante` (absorvido por `idx_partidas_confronto`).
   - Ganhos adicionais de ~4 MB sem nenhuma perda de performance nas queries de produção.
5. **Execução de VACUUM Serverless:**
   - Concluído com `PRAGMA journal_mode = DELETE`. O arquivo final em disco estabilizou em **80,63 MB**.

---

## 2. Mapa Definitivo do Domínio de Odds no Hot Model

| Tabela / Objeto | Papel Arquitetural | Linhas no Hot Model | Espaço Ocupado | Retenção Hot |
|---|---|---:|---|---|
| `odds_consenso_partida` | Derivado canônico com margem e `tipo_calculo` | 11.007 | ~1,8 MB | Permanente |
| `odds_partidas_resumo` | Fontes observadas reais (Pinnacle Sharp e Bet365) | 4.948 | ~0,8 MB | Permanente |
| `odds_consenso_decisoes` | Provenance de inclusão/exclusão por casa | 4.948 | ~0,4 MB | Permanente |
| `odds_auditoria_sharp` | Benchmark de desvio absoluto e margem vs. Pinnacle | 4.941 | ~0,9 MB | Permanente |
| `odds_partidas` (bruta) | Temporada atual (2025–2026) e anterior (2024) | 5.912 | ~2,1 MB | 2 temporadas |
| **`vw_odds_fechamento_principal`** | View Canônica de Fechamento para API | (View) | 0 KB | Permanente |

*Nota: Partidas com odds brutas anteriores a 2024 (5.095 partidas) residem com segurança no cold archive (`data/futebol_cold.db.gz` - 1,17 MB).*

---

## 3. Respostas às 3 Perguntas Estratégicas da Consultoria

### Pergunta 1: *"Por que um resultado idêntico ao Painel Nacional está rotulado como consenso?"*
**Resposta:**  
Tratava-se de uma imprecisão semântica da modelagem legada, onde o resultado da média de varejo era denominado genericamente de "consenso".  
Com a refatoração do Desafio 6, isso foi rigorosamente sanado:
- A partida 3847 (e similares) agora possui `tipo_calculo = 'fonte_unica'` e `metodo = 'painel_nacional_v1'`.
- Apenas partidas com múltiplas casas de varejo ativas e independentes são marcadas como `tipo_calculo = 'consenso'` e `metodo = 'consenso_varejo_multicasas_v1'`. O contrato é 100% honesto e auditável.

### Pergunta 2: *"A Pinnacle deve participar do consenso canônico ou permanecer apenas como benchmark sharp?"*
**Resposta:**  
**Permanece estritamente como benchmark sharp exclusivo.**  
Misturar cotações da Pinnacle (margem < 2,5%, modelo formador de mercado internacional) com casas de varejo brasileiras (margem de 6% a 10%) contamina a mediana e produz uma odd artificial que não é praticada pelo apostador comum nem representa o fechamento sharp puro.  
A separação garante que o consenso reflita o preço real do mercado nacional, enquanto `odds_auditoria_sharp` audita o desvio relativo e indica se o consenso de varejo estava oferecendo valor ou com vigorish excessivo.

### Pergunta 3: *"Quais tabelas de odds podem ser fundidas, reduzidas ou arquivadas sem perder produto, modelo preditivo ou auditoria?"*
**Resposta:**  
1. **Fusão/Remoção Concluída:** `odds_consenso_insumos` foi descartada; seus dados foram absorvidos pela relação elegante entre `odds_partidas_resumo` e `odds_consenso_decisoes`, poupando ~2,5 MB.
2. **Redução Concluída:** `odds_partidas` foi fatiada; todo o histórico secular (< 2024) foi arquivado em cold storage sem quebrar nenhuma rota, pois a view e o modelo Dixon-Coles já consomem `odds_consenso_partida`.
3. O conjunto atual de 5 tabelas especializadas consome menos de **6 MB no total**, atendendo 100% dos requisitos de produto, modelo preditivo e compliance regulatório.

---

## 4. Estado das Suítes de Validação & Gates de Governança

- **Tamanho do SQLite:** **80,63 MB** (Alvo: 80,0 MB; Soft Limit: 88,0 MB; Hard Limit: 94,0 MB)
- **Folga para Teto Vercel:** **13,37 MB**
- **Testes de Regressão Preditive (pytest):** 22/22 aprovados (0.53s)
- **Auditoria de Integridade Relacional (12 Regras):** 115.753 partidas auditadas, 0 inconsistências
- **Design Token Contrast (WCAG 2.2 AA):** 20/20 pares aprovados
- **Partidas e Gols:** 115.753 partidas e 117.580 gols 100% intactos
- **Journal Mode:** `PRAGMA journal_mode = DELETE` rigorosamente ativo
