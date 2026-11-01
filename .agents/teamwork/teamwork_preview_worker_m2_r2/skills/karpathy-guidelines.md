---
name: karpathy-guidelines
description: "Diretrizes de desenvolvimento inspiradas em Andrej Karpathy: força simplicidade radical, diagnósticos de causa-raiz antes do código, modificações cirúrgicas mínimas e verificação passo a passo."
risk: safe
source: community
source_repo: multica-ai/andrej-karpathy-skills
source_type: community
date_added: "2026-10-27"
author: andrej-karpathy
tags: [simplicity, minimal-diff, engineering-discipline, root-cause, anti-slop, clean-code]
tools: [antigravity, claude-code]
---

# Karpathy Guidelines — Simplicidade e Engenharia Cirúrgica

> "Pense antes de codar. Entenda a causa-raiz primeiro. Faça a menor mudança possível que resolva o problema. Teste antes de declarar vitória."

Muitas ferramentas de IA sofrem de "over-engineering": adicionam 3 bibliotecas novas, criam classes desnecessárias e reescrevem arquivos inteiros de 1.000 linhas para arrumar uma condição de 2 linhas.

As **Diretrizes Karpathy** impõem disciplina e sobriedade ao agente.

---

## 🏛️ Os 5 Mandamentos Operacionais

### 1. Entenda a Causa-Raiz Primeiro (Root Cause First)
- Se um dado estiver errado na tela, **não crie uma gambiarra condicional no React**.
- Vá até o banco SQLite (`data/futebol.db`), aos scrapers ou à rota Flask para descobrir por que o dado foi gravado incorretamente.
- Trate a doença, não o sintoma.

### 2. Edições Cirúrgicas Mínimas (Minimal Diff)
- Nunca transcreva arquivos inteiros.
- Substitua estritamente o menor bloco contíguo de código necessário usando ferramentas de edição pontual (`edit_file`).
- Preserve todos os comentários, docstrings e estruturas adjacentes intocadas.

### 3. Recuse Complexidade Desnecessária (Zero Accidental Complexity)
- Se pode ser resolvido com uma query SQL limpa ou função pura Python de 15 linhas, não instale uma nova dependência no `package.json` ou `requirements.txt`.
- Código que não existe não tem bugs e não custa memória.

### 4. Raciocínio Baseado em Evidências (Evidence-Based Thinking)
- Nunca afirme que um problema foi corrigido sem mostrar a evidência empírica (saída do terminal, assert de teste ou consulta ao banco).
- Não diga *"acho que agora está certo"*; mostre o comando executado e o resultado numérico.

### 5. Loop Completo: Pensar $\rightarrow$ Decidir $\rightarrow$ Agir $\rightarrow$ Verificar
1. **Pensar:** Formule a hipótese da falha.
2. **Decidir:** Escolha o caminho mais simples e seguro.
3. **Agir:** Aplique a modificação cirúrgica.
4. **Verificar:** Execute os testes ou script de validação para comprovar a solução.
