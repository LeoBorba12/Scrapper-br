---
name: futstats-product-audit
description: Executa auditoria profissional completa de produto, interface, UX, acessibilidade e integridade de dados para a dashboard FutStats.
metadata:
  author: futstats-team
  version: "1.0.0"
---

# FutStats Product Audit

Procedimento de auditoria em 6 frentes: Funcionalidade, UX, UI, Acessibilidade, Desempenho e Integridade dos Dados.

## Procedimento de Execução

1. **Leitura e Contexto**:
   - Consultar `resources/design-approved.md` e `resources/audit-checklist.md`.
   - Ler os arquivos de código implementados: `App.jsx`, `AppShell.jsx`, `EditorialClubes.jsx`, `ProtagonistaAtleta.jsx`, `tokens.css`, `index.css`.
2. **Auditoria Técnica de Interface**:
   - Aplicar as regras da skill `web-design-guidelines`.
3. **Verificação de Integridade dos Dados**:
   - Verificar se as métricas nos componentes vêm dos endpoints reais e não foram fabricadas.
   - Conferir se não há mistura entre Carreira Oficial (OGol) e Jogos Catalogados na Base.
   - Avaliar representação de estados vazios, nulos e parciais.
4. **Verificação de Responsividade e Temas**:
   - Avaliar comportamento nos viewports 390px, 768px, 1280px e 1440px.
   - Avaliar contraste e legibilidade nos temas Areia e Carvão.
5. **Classificação dos Achados**:
   - **Confirmado**: Reproduzido ou demonstrado no código com arquivo:linha.
   - **Suspeita**: Precisa de validação em tempo de execução com usuário.
   - **Recomendação**: Oportunidade de polimento visual/UX.
   - **Não testado**: Bloqueado por ambiente ou dependência externa.
6. **Emissão de Relatório**:
   - Gerar relatório formal com priorização (P1, P2, P3), impacto, evidências e plano de correção em pequenos lotes.
