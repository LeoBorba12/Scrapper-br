---
name: triade
description: "Orquestra um fluxo rigoroso de entrega de software entre Perplexity (planejamento, arquitetura e homologação), Gemini Argon/Hydrogen (código e TDD) e Antigravity (execução, testes, integração, PR/merge, deploy e governança). Pode ser acionada diretamente pelos comandos /triade ou /tri, ou por frases como 'iniciar fluxo tríade'. Possui seletor de modo (Full Tríade vs Bypass Direto), verificação de login web e rollback automático."
risk: safe
source: internal
version: "1.3.0"
date_added: "2026-11-17"
author: "Antigravity & Perplexity Architecture Board"
tags: [triade, orchestration, workflow, multi-ai, perplexity, gemini-argon, gemini-hydrogen, antigravity, tdd, slash-commands]
tools: [read_files, write_files, run_terminal, run_tests, github_mcp, browser]
metadata:
  owner: Tech Lead
  orchestrator: Perplexity
  generators: Gemini Argon (Complex/Algoritmos), Gemini Hydrogen (Fast/Refinamentos)
  executor: Antigravity
  slash_commands: ["/triade", "/tri"]
  language: pt-BR
---

# Tríade — Framework Multi-Agente de Alta Precisão (`/triade`, `/tri`)

> "Perplexity planeja e homologa; Gemini Argon/Hydrogen modelam e codificam; Antigravity executa, testa e integra; Tech Lead valida e decide."

---

## 🎯 1. Gatilhos de Ativação & Slash Commands

Você pode ativar esta skill a qualquer momento digitando:
- `/triade` ou `/tri`
- *"Iniciar fluxo tríade"*
- *"Orquestrar com Perplexity e Argon"*
- *"Executar ciclo tríade"*
- *"Planejar e implementar com a tríade"*

---

## 🎛️ 2. Modos de Operação (Full Tríade vs Bypass Direto)

Nem todo projeto ou tarefa exige a mobilização das 3 IAs. A skill suporta dois modos operacionais configuráveis via `.triad/config.json` ou comando no prompt:

```json
{
  "enabled": true,
  "mode": "full",
  "default_generator": "argon",
  "auto_preflight_browser": true
}
```

### A. Modo Tríade Completo (`mode: "full"`) — `/triade`
- **Indicação:** Novas funcionalidades críticas, regras de negócio complexas, modelos estatísticos/matemáticos, mudanças estruturais de schema e integrações de API.
- **Fluxo:** Perplexity ➔ Gemini Argon/Hydrogen ➔ Antigravity ➔ Homologação ➔ Deploy.

### B. Modo Bypass / Direto (`mode: "bypass"`) — `/tri bypass`
- **Indicação:** Tarefas do dia a dia, correções de bugs pontuais, documentação, refatorações menores ou scripts rápidos.
- **Fluxo:** O Antigravity executa a tarefa diretamente no ambiente, sem abrir abas do navegador nem acionar Perplexity/Argon, mantendo apenas os Quality Gates locais de teste e build.

---

## 🚦 3. Passo Zero: Pré-vôo no Navegador & Login Interativo

No modo `full`, o Antigravity executa a verificação web via subagente `browser`:
1. Acessa `https://www.perplexity.ai` e `https://gemini.google.com`.
2. Se houver login pendente ou CAPTCHA: **pausa a esteira e solicita que o Tech Lead faça login com usuário e senha**.
3. Com as sessões ativas, a orquestração segue automaticamente.

---

## ⚖️ 4. Critério de Seleção: Gemini Argon vs Gemini Hydrogen

| Critério | Gemini Argon (Raciocínio Pesado) | Gemini Hydrogen (Agilidade & Cirurgia) |
| :--- | :--- | :--- |
| **Complexidade** | Alta (algoritmos matemáticos, Dixon-Coles, endpoints novos). | Baixa/Média (campos extras, ajustes em React/Tailwind). |
| **Suíte de Testes** | Criação de suítes TDD completas do zero (10+ testes). | Adição de 1 a 3 casos de teste pontuais. |
| **Arquitetura** | Novos microsserviços, blueprints e esquemas relacionais. | Refatoração cosmética, textos, documentação e UI fixes. |

---

## 🔄 5. O Ciclo de Vida em 5 Estágios

```mermaid
flowchart TD
    A0["Passo 0: Pré-vôo & Sessões Web<br/>(Antigravity Browser)"] -->|Sessões Ativas| A["Estágio 1: Planejamento & Seleção Argon/Hydrogen<br/>(Perplexity)"]
    A -->|Briefing Aprovado| B["Estágio 2: Engenharia de Código & TDD<br/>(Gemini Argon ou Hydrogen)"]
    B -->|Pacote de Integração| C["Estágio 3: Execução & Testes no Ambiente<br/>(Antigravity)"]
    C -->|Relatório de Evidências| D["Estágio 4: Homologação, Review & Deploy<br/>(Perplexity + Tech Lead)"]
    D -->|PR Mergeado & Produção OK| E["Estágio 5: Governança, Memória & Handoff<br/>(Antigravity)"]
    D -.->|Falha em Produção| R["Protocolo de Rollback Imediato<br/>(Antigravity)"]
```

1. **Estágio 1 — Planejamento & Arquitetura (Perplexity):** Emite o Briefing (`templates/perplexity-to-argon.md`).
2. **Estágio 2 — Engenharia de Código & TDD (Gemini Argon ou Hydrogen):** Gera o código e testes no Pacote de Integração (`templates/argon-to-antigravity.md`).
3. **Estágio 3 — Execução e Testes no Ambiente (Antigravity):** Aplica código, roda testes e gera o Relatório de Evidências (`templates/antigravity-to-perplexity.md`).
4. **Estágio 4 — Homologação, Review e Deploy (Perplexity + Tech Lead):** Audita evidências, faz merge do PR e valida produção. Dispara rollback se falhar.
5. **Estágio 5 — Governança e Memória Entre Projetos (Antigravity):** Registra ADR em `.memory/decisions.md` e sincroniza lições em `~/.gemini/config/skills/`.

---

## 🛡️ 6. Protocolo de Rollback Automatizado
Se o deploy falhar ou o `/api/health` retornar erro em produção:
```bash
git revert HEAD --no-edit
git push origin main
```
Notifica imediatamente com a causa-raiz identificada.
