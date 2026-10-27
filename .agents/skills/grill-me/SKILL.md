---
name: grill-me
description: "Faz o agente entrevistar o desenvolvedor antes de implementar qualquer funcionalidade grande ou arquitetura nova, reduzindo briefing ruim, premissas erradas e retrabalho."
risk: safe
source: community
source_repo: mattpocock/skills
source_type: community
date_added: "2026-10-27"
author: mattpocock
tags: [productivity, interview, requirements, scoping, anti-hallucination, design-decisions]
tools: [antigravity, claude-code]
---

# Grill Me — Entrevista Estratégica Pré-Implementação

> "Antes de sair programando igual um estagiário movido a energético, pare e faça as perguntas certas."

O maior desperdício de tempo e tokens na engenharia com IA acontece quando o agente **presume intenções**, implementa código baseado em suposições frágeis e depois precisa desfazer horas de trabalho.

A skill **Grill Me** transforma o agente em um arquiteto investigativo antes de digitar uma única linha de código.

---

## 🎯 Quando Ativar

Ative **grill-me** sempre que:
1. O usuário disser expressamente: `"grill me"`, `"me entreviste"`, `"questione meu plano"`, ou usar `/grill-me`.
2. A tarefa envolver **novas tabelas de banco, fluxos de autenticação, integrações de APIs externas ou refatorações estruturais**.
3. O pedido do usuário for vago ou permitir múltiplas interpretações arquiteturais.

---

## 🧠 Protocolo de Atuação do Agente

Quando esta skill estiver ativa, o agente **NÃO PODE CODAR IMEDIATAMENTE**. Ele deve seguir este ciclo:

### 1. Triagem Rápida de Premissas
Identificar:
- Quais são os limites do escopo (o que entra e o que fica de fora)?
- Quais são as invariantes técnicas não negociáveis (ex: teto de 95MB do SQLite na Vercel, compatibilidade mobile, latência)?
- Quais dependências ou contratos de dados já existem?

### 2. A Entrevista (3 a 5 Perguntas de Alta Densidade)
O agente deve formular exatamente **3 a 5 perguntas objetivas**, numeradas e com opções claras ou caminhos sugeridos.

Exemplo de formato:
```markdown
### 🎙️ Entrevista de Alinhamento (Grill Me)

Antes de implementar a funcionalidade [Nome], preciso validar 3 decisões de arquitetura:

1. **Fonte da Verdade:** [Pergunta específica com Opção A vs Opção B].
2. **Tratamento de Exceções:** [O que fazer quando o dado falhar ou vier duplicado?]
3. **Contrato de Saída:** [Qual estrutura JSON ou componente deve consumir isso?]
```

### 3. Síntese e Plano de Ataque
Após as respostas do usuário:
1. O agente resume o consenso em 3 bullets.
2. Apresenta o plano de execução passo a passo.
3. Somente após a confirmação final do usuário, inicia a escrita de código.
