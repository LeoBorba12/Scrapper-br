---
name: git-guardrails
description: "Evita ações perigosas e irreversíveis no Git: bloqueia push indevido de arquivos pesados (>95MB no Vercel), vazamento de segredos (.env), resets destrutivos, deleção de branches e commits fora do padrão."
risk: safe
source: community
source_repo: mattpocock/skills
source_type: community
date_added: "2026-10-27"
author: mattpocock
tags: [git, safety, guardrails, deployment, devops, secrets, vercel]
tools: [antigravity, claude-code]
---

# Git Guardrails — Proteção Operacional de Repositório

> "Git é um canivete suíço; nas mãos de um agente autônomo sem freios, pode virar uma bazuca contra o próprio pé."

Esta skill define salvaguardas rígidas para qualquer interação com o Git no terminal, garantindo que o repositório, o histórico de commits e os deploys de produção nunca sejam corrompidos.

---

## 🛑 Comandos Estritamente Bloqueados sem Consentimento Explícito

O agente **JAMAIS** pode executar os seguintes comandos sem pedir permissão explícita ao usuário:

1. `git push --force` ou `git push -f` (destruição potencial de histórico remoto).
2. `git reset --hard` (perda irreversível de alterações não commitadas).
3. `git clean -fd` ou `git clean -xdf` (deleção cega de arquivos não rastreados).
4. `git branch -D` (deleção forçada de branches).

---

## 🛡️ As 4 Regras de Ouro do FutStats

### Regra 1: O Teto de 95 MB da Vercel
Antes de qualquer `git add data/futebol.db` ou `git push`:
- O agente **DEVE** checar o tamanho do arquivo SQLite via script/PowerShell.
- Se o tamanho for $\ge 95\text{ MB}$, o push é abortado imediatamente e o agente executa `VACUUM` ou propõe estratégia de poda/arquivamento.

### Regra 2: Sanitização de Segredos (.env)
- Arquivos `.env`, chaves de API (`TELEGRAM_BOT_TOKEN`, `SECRET_KEY`, `ADMIN_PASSWORD_HASH`) nunca podem ser commitados.
- Verifique sempre `git status` para garantir que `.env` esteja no `.gitignore`.

### Regra 3: Pre-Flight Obrigatório antes do Commit
Nenhum commit pode ser feito sem antes rodar:
1. `pytest tests/test_model_evals.py` (deve passar 22/22).
2. `npm --prefix frontend run build` (se houver alteração em `frontend/`).
3. Verificação do SQLite: `PRAGMA journal_mode = DELETE;` (para evitar travamento no lambda da Vercel).

### Regra 4: Mensagens de Commit Semânticas
Os commits devem seguir o padrão Conventional Commits em português/inglês técnico claro:
- `feat(...)`: nova funcionalidade
- `fix(...)`: correção de bug
- `perf(...)`: otimização de performance
- `refactor(...)`: refatoração sem mudança de comportamento
