# FutStats — Diretriz Técnica: Governança do Teto de 94 MB do SQLite

**Data:** 2026-11-04  
**Status:** Aprovado em Princípio / Em Fase de Diagnóstico  
**Origem:** Parecer da Consultoria Técnica Sênior (Perplexity AI)  
**Escopo:** Retenção, compactação, arquivamento frio e proteção do limite de bundle da Vercel.

---

## 1. Decisão Executiva Adotada
O `data/futebol.db` está em **90,15 MB**, com margem de segurança de **3,85 MB** em relação ao teto de **94 MB** da Vercel.
- **Veredito**: Manter o SQLite local na Vercel como modelo de leitura de baixa latência e introduzir uma estratégia de **Tiering de Dados (Hot / Warm / Cold)** governada pelo daemon diário.
- **Meta Operacional**: Reduzir e estabilizar o banco de leitura em **~70 a 78 MB** (muito abaixo do teto de alerta de 88 MB).

---

## 2. Diagnóstico Real de Consumo de Espaço (dbstat & Contagem de Objetos)

Auditoria realizada no acervo de 115.753 partidas:

### Tabela por Volume de Linhas:
1. `escalacoes`: **153.451 linhas** (~28 MB com índices)
2. `gols`: **117.580 linhas** (~22 MB com índices)
3. `partidas`: **115.753 linhas** (~20 MB com índices)
4. `cartoes`: **46.114 linhas** (~7 MB com índices)
5. `jogadores_estatisticas`: **19.840 linhas** (~3.5 MB)
6. `odds_partidas`: **11.007 linhas** (~2 MB)
7. Demais tabelas cadastrais e scouts 2026: **~3 MB**
- **Total de Índices Secundários**: 31 índices ativos.

### Distribuição Temporal das Partidas:
- **2023–2026 (Quente / Analytics Vivo)**: 8.320 jogos (apenas 7.2% do acervo).
- **2010–2022 (Moderno)**: 29.385 jogos (25.4%).
- **1971–2009 (Brasileirão Nacional Antigo)**: 63.309 jogos (54.7%).
- **1902–1970 (Era Clássica)**: 14.739 jogos (12.7%).

---

## 3. Estratégia de Arquivamento Cirúrgica (Sem Quebrar Telas)

Para preservar o valor histórico das telas existentes (H2H histórico, gols de Pelé/Dinamite e Campanhas):
1. **Partidas (`partidas`)**: Manter os dados essenciais de todas as 115k partidas (data, campeonato, mandante, visitante, placar final), pois consomem pouco espaço por linha e alimentam o H2H.
2. **Escalações Frias (`escalacoes`)**: Atletas escalados em jogos anteriores a 2022 representam mais de 120.000 linhas puramente arquivísticas. Devem ser movidas para `futebol_cold.db` ou comprimidas.
3. **Cartões Antigos (`cartoes`)**: Mover cartões de jogos anteriores a 2022 para cold storage.
4. **Agregados por Temporada**: Criar `partidas_temporada_agg` para que campanhas antigas consultem sumários instantâneos.

---

## 4. Próximos Passos & Cronograma
1. Submeter o raio-x exato ao Perplexity para refinar a estratégia de particionamento.
2. Criar script de exportação fria (`scripts/arquivar_dados_frios.py`) acoplado ao `orquestrador_mestre_24x7.py`.
3. Executar o primeiro ciclo de teste em staging, medindo o ganho em MB após `VACUUM`.
