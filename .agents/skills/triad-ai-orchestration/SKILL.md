---
name: triad-ai-orchestration
description: "Orquestra um fluxo rigoroso de entrega de software entre Perplexity (planejamento, arquitetura e homologação), Gemini Argon/Hydrogen (código e TDD) e Antigravity (execução, testes, integração, PR/merge, deploy e governança). Possui seletor de modo (Full Tríade para features complexas vs Bypass Direto para tarefas simples), verificação de login web e rollback automático."
risk: safe
source: internal
version: "1.2.0"
date_added: "2026-11-17"
author: "Antigravity & Perplexity Architecture Board"
tags: [orchestration, workflow, multi-ai, perplexity, gemini-argon, gemini-hydrogen, antigravity, tdd, quality-gates, governance]
tools: [read_files, write_files, run_terminal, run_tests, github_mcp, browser]
metadata:
  owner: Tech Lead
  orchestrator: Perplexity
  generators: Gemini Argon (Complex/Algoritmos), Gemini Hydrogen (Fast/Refinamentos)
  executor: Antigravity
  language: pt-BR
---

# Triad AI Orchestration — Framework Multi-Agente de Alta Precisão (v1.2.0)

> "Perplexity planeja e homologa; Gemini Argon/Hydrogen modelam e codificam; Antigravity executa, testa e integra; Tech Lead valida e decide."

---

## 🎛️ 1. Modos de Operação (Seletor Liga/Desliga & Bypass)

Nem todo projeto ou tarefa exige a mobilização das 3 IAs. A skill suporta dois modos operacionais configuráveis via `.triad/config.json` ou comando de voz/chat:

```json
{
  "enabled": true,
  "mode": "full",
  "default_generator": "argon",
  "auto_preflight_browser": true
}
```

### A. Modo Tríade Completo (`mode: "full"`)
- **Gatilho:** *"Iniciar fluxo tríade"*, *"Orquestrar com Perplexity e Argon"*.
- **Indicação:** Novas funcionalidades críticas, regras de negócio complexas, modelos estatísticos/matemáticos, mudanças estruturais de schema e integrações de API.
- **Fluxo:** Perplexity ➔ Gemini Argon/Hydrogen ➔ Antigravity ➔ Homologação ➔ Deploy.

### B. Modo Bypass / Direto (`mode: "bypass"`)
- **Gatilho:** Tarefas normais do dia a dia, correções de typos, documentação, refatorações menores ou scripts rápidos.
- **Indicação:** O Antigravity executa a tarefa diretamente no ambiente, sem abrir abas do navegador nem acionar Perplexity/Argon, mantendo apenas os Quality Gates locais de teste e build.

---

## 🚦 2. Passo Zero: Pré-vôo no Navegador & Login Interativo

No modo `full`, o Antigravity executa a verificação web via subagente `browser`:
1. Acessa `https://www.perplexity.ai` e `https://gemini.google.com`.
2. Se houver login pendente ou CAPTCHA: **pausa a esteira e solicita que o Tech Lead faça login com usuário e senha**.
3. Com as sessões ativas, a orquestração segue automaticamente.

---

## ⚖️ 3. Critério de Seleção: Gemini Argon vs Gemini Hydrogen

| Critério | Gemini Argon (Raciocínio Pesado) | Gemini Hydrogen (Agilidade & Cirurgia) |
| :--- | :--- | :--- |
| **Complexidade** | Alta (algoritmos matemáticos, Dixon-Coles, endpoints novos). | Baixa/Média (campos extras, ajustes em React/Tailwind). |
| **Suíte de Testes** | Criação de suítes TDD completas do zero (10+ testes). | Adição de 1 a 3 casos de teste pontuais. |
| **Arquitetura** | Novos microsserviços, blueprints e esquemas relacionais. | Refatoração cosmética, textos, documentação e UI fixes. |

---

## 🛡️ 4. Protocolo de Rollback e Homologação
- **Revisão Automática de PR:** Checklist de escopo, ausência de segredos e limite da Vercel ($\le 94,00\text{ MB}$).
- **Rollback Imediato:** Se o deploy falhar ou o `/api/health` retornar erro em produção, o Antigravity executa `git revert HEAD --no-edit`, faz o push e notifica a causa-raiz.
- **Governança Global:** Atualização de ADRs em `.memory/` e replicação de aprendizados no repositório global `~/.gemini/config/skills/`.
