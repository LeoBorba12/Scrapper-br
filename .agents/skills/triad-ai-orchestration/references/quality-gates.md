# Quality Gates & Critérios de Homologação

Para que qualquer entrega do fluxo Tríade seja considerada apta para merge e produção, ela deve cumprir rigorosamente 5 portões de qualidade:

---

## Gate 1: Conformidade com o Escopo (Scope Gate)
- Todas as alterações de código devem rastrear diretamente aos requisitos do Briefing aprovado.
- Nenhum arquivo fora do escopo pode ser alterado sem aprovação prévia.
- Não introduzir dependências ou pacotes sem justificativa explícita.

---

## Gate 2: Suíte Automatizada TDD (Testing Gate)
- 100% dos testes da nova funcionalidade devem passar no ambiente real.
- Suíte de regressão do projeto (testes pré-existentes) deve manter 100% de aprovação.
- Proibidos testes sem asserção real ou que mockem o resultado do próprio teste.

---

## Gate 3: Integridade Estática e Compilação (Build Gate)
- O comando de build de produção (ex: `npm run build`, `vite build`, `tsc`) deve concluir com código de saída 0.
- Zero erros de sintaxe ou referências não declaradas (`ReferenceError` / `TypeError`).

---

## Gate 4: Governança de Infraestrutura e Recursos (Limits Gate)
- Respeito estrito aos tetos de armazenamento da plataforma (ex: Vercel serverless <= 94,00 MB).
- Latência de leitura / tempo de resposta dentro dos SLOs estabelecidos (ex: p95 <= 200ms).
- Zero mutações destrutivas ou migrações de schema sem plano de rollback testado.

---

## Gate 5: Honestidade Visual e Acessibilidade (UX/UI Gate)
- Toda interface deve respeitar conformidade com WCAG 2.2 AA (mínimo de contraste de 4.5:1 para texto normal).
- Princípio da Honestidade de Dados: dados não disponíveis devem exibir rótulos explícitos (ex: "Não catalogado", "A confirmar") em vez de simular valores fictícios.
- Microinterações táteis e ausência de layouts genéricos pastel/rosa anti-editorial.
