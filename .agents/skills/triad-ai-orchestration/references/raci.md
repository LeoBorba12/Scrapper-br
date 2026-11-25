# Matriz RACI da Tríade de IA

*R = Responsável pela Execução (Responsible)*  
*A = Aprovador Final / Accountable (Tech Lead)*  
*C = Consultado (Consulted)*  
*I = Informado (Informed)*  

| Atividade do Ciclo | Perplexity (Estrategista) | Gemini Argon/Hydrogen (Gerador) | Antigravity (Executor) | Tech Lead (Humano) |
| :--- | :---: | :---: | :---: | :---: |
| **Levantamento de Requisitos e Restrições** | **R** | C | C | **A** |
| **Inspeção Prévia do Repositório / Código** | C | I | **R** | I |
| **Definição de Escopo e Critérios de Aceite** | **R** | C | C | **A** |
| **Arquitetura de Solução e Contratos de API** | **R** | C | C | **A** |
| **Especificação de Suíte TDD** | C | **R** | C | I |
| **Geração de Código-Fonte Cirúrgico** | I | **R** | C | I |
| **Aplicação de Código e Manipulação de Arquivos**| I | I | **R** | I |
| **Execução de Testes Automatizados no Ambiente**| C | I | **R** | I |
| **Compilação de Build e Checagem Estática** | I | I | **R** | I |
| **Auditoria Técnica de Evidências** | **R** | I | C | **A** |
| **Homologação e Validação de Conformidade** | **R** | I | C | **A** |
| **Abertura de Pull Request (GitHub MCP)** | I | I | **R** | I |
| **Aprovação e Autorização de Merge** | C | I | I | **A** |
| **Execução do Merge no Repositório Remoto** | I | I | **R** | **A** |
| **Verificação de Deploy em Produção (Browser)**| C | I | **R** | I |
| **Registro de ADRs, Memória e Governança** | C | I | **R** | **A** |

---

## Regra de Desempate e Escalada
Quando Perplexity, Gemini Argon e Antigravity divergirem sobre arquitetura, contratos de dados, segurança ou impactos de produção:
1. **O fluxo é pausado imediatamente.**
2. **A divergência é apresentada de forma neutra com prós e contras ao Tech Lead.**
3. **Nenhum agente tem autorização para assumir silenciosamente uma decisão que impacte o produto.**
