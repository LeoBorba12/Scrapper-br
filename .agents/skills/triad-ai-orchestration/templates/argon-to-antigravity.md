# 📦 Pacote de Integração — Gemini Argon ➔ Antigravity

## 1. Referência do Ciclo
- **Briefing de Origem:** `.triad/handoffs/YYYY-MM-DD-<slug>-briefing.md`
- **Branch Sugerida:** `feat/<nome-da-feature>`
- **Escopo Validado:** 

---

## 2. Mapa de Arquivos a Criar ou Modificar
| Caminho do Arquivo | Ação | Objetivo da Alteração | Risco de Regressão |
| :--- | :---: | :--- | :---: |
| `tests/test_<nome>.py` | Criar | Suíte TDD cobrindo AC-01 a AC-xx | Baixo |
| `backend/<nome>.py` | Modificar | Implementação do endpoint conforme contrato | Médio |
| `frontend/src/...` | Modificar | Componente visual no padrão editorial | Baixo |

---

## 3. Código-Fonte Integral dos Artefatos

### `caminho/do/arquivo_1`
```python
# Código cirúrgico completo ou patch substitutivo
```

### `caminho/do/arquivo_2`
```jsx
// Código cirúrgico completo do componente
```

---

## 4. Comandos de Execução e Verificação
```bash
# 1. Execução dos Testes Automatizados TDD
pytest tests/test_<nome>.py -v

# 2. Verificação de Regressão Geral (se aplicável)
pytest tests/ -k "model_evals or core"

# 3. Compilação do Frontend / Verificação de Build
npm run build
```

---

## 5. Critérios de Bloqueio (Stop & Escalate)
O Antigravity **DEVE PARAR IMEDIATAMENTE** e escalar caso:
- Um arquivo fora do escopo aprovado precise ser alterado para a feature funcionar.
- Ocorra falha estrutural de schema ou conflito irresolúvel com o modelo de dados.
- Seja exigida operação destrutiva no banco ou repositório.
