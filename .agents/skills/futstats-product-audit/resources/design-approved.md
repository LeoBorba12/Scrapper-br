# Diretrizes Aprovadas de Design: FutStats Editorial & Protagonista

## 1. Identidade e Composição
- **Editorial em toda a aplicação**: Panorama, Clubes, Confrontos, Partidas, Clima, Arbitragem, Oráculo, Publicar e Tabela ao Vivo.
- **Protagonista na experiência de atletas**: Entrada com busca e rankings oficiais; ao selecionar atleta, composição em 3 colunas (Identidade/Imagem, Centro de Evidências Reais, Métricas Oficiais).
- **Sem conceitos duplicados**: Uma única identidade visual. Sem seletor de estudo ou layouts conflitantes.

## 2. Paletas e Tokens
- **Areia (Light)**: Fundo `#F1E8DE`, Painel `#FCF9F5`, Elementos elevados `#E9DFD2`, Texto `#302E28`, Acentos em oliva `#606E43`, Acento suave `#DEE2CE`.
- **Carvão Quente (Dark)**: Fundo `#1B1A17`, Painel `#22211D`, Elementos elevados `#2B2923`, Texto `#EAE5DA`, Acentos em oliva `#B5BE93`.
- **Tipografia**: Serifada editorial (`Source Serif 4`, Georgia) em títulos e destaques; Sans-serif (`Inter`, system-ui) em controles, tabelas e labels. Numerais tabulares (`tabular-nums`) obrigatórios em tabelas e métricas.

## 3. Integridade dos Dados e Gráficos
- **Sem Radar Fictício**: Não fabricar notas subjetivas de 0 a 100 ("Passe", "Criação", "Defesa").
- **Centro de Evidências Reais**: Gráfico horizontal de gols por faixa temporal (6 intervalos auditados: `0-15'`, `16-30'`, `31-45+'`, `46-60'`, `61-75'`, `76-90+'`), Pontaria de chutes confirmada e Gols decisivos nos minutos finais (80+').
- **Distinção Explícita de Escopo**: Separar Carreira Oficial Externa (100% OGol) de Registros Catalogados na Base (90.819 jogos).
