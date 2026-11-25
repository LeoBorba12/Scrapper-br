# Ciclo de Vida da Orquestração Tríade (5 Estágios)

Este documento aprofunda o funcionamento técnico de cada estágio do ciclo de desenvolvimento com as três IAs e o Tech Lead.

---

### Estágio 1: Planejamento & Arquitetura (Perplexity)
1. **Entrada:** Solicitação inicial do Tech Lead com as metas do negócio.
2. **Atuação:**
   - O Perplexity atua como Consultor Técnico Sênior.
   - Investiga limitações, melhores práticas de mercado e regras de integridade.
   - Formula o *Briefing Técnico Cirúrgico*, delimitando o que entra e o que não entra no escopo.
3. **Saída:** Documento `.triad/handoffs/YYYY-MM-DD-<slug>-briefing.md`.
4. **Checkpoint:** Validação do Tech Lead ("Pode prosseguir").

---

### Estágio 2: Engenharia de Código & TDD (Gemini Argon / Hydrogen)
1. **Entrada:** *Briefing Técnico Cirúrgico* validado.
2. **Atuação:**
   - Os modelos Gemini Argon / Hydrogen atuam como engenheiros de algoritmos sêniores.
   - Elaboram primeiramente os casos de teste da suíte TDD (cobrir casos felizes, bordas, erros e contratos de dados).
   - Geram a implementação de backend e frontend estritamente necessária para satisfazer os testes e requisitos.
3. **Saída:** Documento `.triad/handoffs/YYYY-MM-DD-<slug>-pacote.md`.

---

### Estágio 3: Execução, Testes e Integração no Ambiente (Antigravity)
1. **Entrada:** *Pacote de Integração* contendo os arquivos de teste e código.
2. **Atuação:**
   - O Antigravity cria branch isolada (`feat/<feature>`).
   - Aplica os arquivos no filesystem local do projeto.
   - Executa os testes no terminal real (`pytest`, `npm test`) e colhe a saída.
   - Executa o build de produção (`npm run build`).
3. **Saída:** Documento `.triad/handoffs/YYYY-MM-DD-<slug>-evidencias.md`.

---

### Estágio 4: Homologação, Review e Deploy (Perplexity + Tech Lead + Antigravity)
1. **Entrada:** *Relatório de Evidências e Telemetria*.
2. **Atuação:**
   - O Perplexity avalia os logs reais e as evidências fotográficas/visuais.
   - O Perplexity emite o parecer pericial de homologação.
   - O Tech Lead autoriza o merge.
   - O Antigravity abre o Pull Request no GitHub, faz o merge via GitHub MCP e inspeciona o deploy de produção no navegador.
3. **Saída:** Pull Request mesclado na branch `main` e produção validada.

---

### Estágio 5: Governança, Memória Contínua e Handoff (Antigravity)
1. **Entrada:** Confirmação de produção e decisões consolidadas do ciclo.
2. **Atuação:**
   - O Antigravity redige o registro de decisão de arquitetura (`ADR-xxx`) em `.memory/decisions.md`.
   - Atualiza o registro cronológico em `.memory/audit-log.md`.
   - Atualiza o documento de continuidade pericial (`HANDOFF_LINUX.md`).
3. **Saída:** Documentação de memória atualizada e commitada na `main`.
