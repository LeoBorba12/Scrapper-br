# Reconciliação Histórica — Desafio 31

## Snapshot anterior
- Partidas: 115.753
- Gols: 117.580

## Snapshot atual
- Partidas: 115.753
- Gols: 114.137
- Escalações: 109.108
- Cartões: 14.477

## Diferenças
- Partidas: 0
- Gols: -3.443

## Causa determinística
A contagem física de partidas **nunca caiu** de 115.753 para 114.137. Todas as 115.753 partidas históricas permanecem 100% íntegras e intactas no SQLite (`data/futebol.db`). A aparente perda de 1.616 partidas ($115.753 - 114.137 = 1.616$) decorreu de uma **colisão tipográfica de relatório**, onde o total de gols remanescentes após a deduplicação (114.137) foi inadvertidamente replicado na célula de "Partidas depois" na tabela do relatório de evolução. Nenhuma instrução `DELETE`, `DROP` ou `TRUNCATE` foi executada sobre a tabela `partidas`.

## Colisões da constraint
- Total: 3.443 registros removidos da tabela `gols`
  - Gols sem minutagem na súmula (`minuto = ''` e `tempo = ''`): 3.400 (98,75%)
  - Gols com minutagem na súmula: 43 (1,25%)
  - Gols legítimos colapsados (dobletes/hat-tricks históricos sem minuto onde o placar oficial exigia o gol): 3.386 (98,34%)
  - Duplicatas espúrias reais eliminadas com sucesso (ex: anomalia Reinaldo/Mirassol): 32 (0,93%)
  - Outros (amistosos/placar divergente): 25 (0,73%)
- Colisões potenciais ativas no banco atual com `COALESCE(atleta_id, atleta)`: 0
- Risco de remoção indevida: **Sim**, confirmado no processo de deduplicação anterior. A constraint `uq_gols_idempotencia (partida_id, atleta_id, clube_id, minuto, tempo, tipo_de_gol)`, ao agrupar por strings vazias em partidas históricas, colapsou múltiplos gols legítimos do mesmo atleta no mesmo jogo em 2.583 partidas, reduzindo artificialmente a contagem histórica de atletas como Roberto Dinamite (-41), Serginho Chulapa (-39), Zico (-35) e Pelé (-12).
- Ação: Todos os 3.443 registros foram preservados, catalogados e exportados com hash SHA-256 no arquivo de auditoria `data/gols_removidos_deduplicacao.json`. Para a próxima etapa de restauração seletiva, a constraint evoluirá para incluir o discriminador `ordinal_gol_partida`, permitindo restaurar os 3.386 dobletes/hat-tricks legítimos sem colidir na idempotência.

## Decisão
**Manter o acervo auditado e isolado nesta etapa; evoluir a constraint antes de restaurar.**
1. Preservar rigorosamente as 115.753 partidas e a estrutura atual com 80,34 MB.
2. Manter os 3.443 registros removidos catalogados no arquivo de auditoria canônico `data/gols_removidos_deduplicacao.json`.
3. Na etapa de reprocessamento/restauração, aplicar migração com coluna `ordinal_gol_partida` para reincorporar os 3.386 gols legítimos sem risco de reintroduzir duplicatas reais.

## Validações
- pytest: 34/34 testes aprovados (Golden Metrics: 12/12, Model Evals Dixon-Coles/xG: 22/22)
- Auditoria de integridade: 12/12 regras em conformidade (auditar_integridade_dados.py)
- Tamanho do banco: 80,34 MB (Abaixo do soft limit de 84,00 MB e com 13,66 MB de folga para o teto Vercel de 94,00 MB)
- Journal Mode: `DELETE`
