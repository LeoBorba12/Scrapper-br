# DOSSIÊ TÉCNICO DE CONTINUIDADE: ESQUADRÃO MULTIAGENTE, SANEAMENTO HISTÓRICO E INFRAESTRUTURA

> **FutStats 2026** - Guia Profissional de Arquitetura, Engenharia de Dados e Multiagentes  
> **Data:** 30 de Outubro de 2026  
> **Status:** Operacional, VM Oracle Blindada 24/7, Sistema Multiagente em Execução

---

## 1. Resumo Executivo & Causa-Raiz das Anomalias

### A. Anomalia "168 gols em 168 jogos" (Média 1.00)
- **Causa-Raiz:** No banco SQLite (`data/futebol.db`), entre 2000 e 2017 existem mais de 42.000 partidas cadastradas, porém súmulas completas minuto a minuto (escalações com os 22 titulares e reservas) não estavam povoadas para o período anterior a 2018. A presença dos atletas de gerações anteriores só era registrada na base quando o atleta marcava um gol (`total_jogos = total_gols`).
- **Resolução Implementada:**
  1. Diferenciação arquitetural entre **"Jogos com Gol Catalogado"** e **"Total Real de Jogos na Carreira"**.
  2. Atualização em `backend/app.py` (`_construir_perfil_jogador`) e no componente `ProtagonistaAtleta.jsx`:
     - O card exibe o rótulo transparente **`Jogos c/ Gol: 168`**.
     - A média exibida na interface é a média real oficial de carreira: **`Média Carreira: 0.53 gol/jogo`** (calculada sobre 403 gols em 755 partidas oficiais homologadas via OGol), eliminando a falsa média de 1.00.
  3. Ingestão progressiva de 32.506 novas presenças de atletas em partidas do Brasileirão histórico, ampliando o acervo de escalações para 152.264 registros sem violar o teto do banco.

### B. Clubes Espúrios Conmebol (River Plate, Universidad de Chile, Boca Juniors)
- **Causa-Raiz:** Scrapers legados de competições sul-americanas antigas (Copa Sul-Americana e Copa Libertadores) registraram algumas partidas com mando de campo invertido ou atribuíram os gols de equipes brasileiras ao adversário internacional em partidas fora de casa.
  - Exemplo clássico 1: Partida `20128082` (Sul-Americana 2012) – placar estava invertido para Universidad de Chile 5 x 0 São Paulo, fazendo os gols de Jádson (2x), Lucas, Luís Fabiano e Rafael Tolói serem atribuídos à La U.
  - Exemplo clássico 2: Partida `20038048` (Sul-Americana 2003) – gols de Luís Fabiano e Rico constavam vinculados ao River Plate.
- **Resolução Implementada:**
  1. Correção dos placares e clubes de origem dos gols diretamente na tabela `gols` e `partidas`.
  2. Execução da sanitização na coluna `clubes` e `detalhe_carreira_clubes` da tabela `jogadores_estatisticas`.
  3. Luís Fabiano (ID 9033) e demais atletas tiveram seus históricos limpos, exibindo exclusivamente clubes legítimos (ex: `Vasco, São Paulo, Ponte Preta`).

---

## 2. Infraestrutura & Blindagem da VM Oracle Cloud

### A. Especificações da Instância
- **IP Público:** `163.176.87.218` (Oracle Cloud Free Tier, Ashburn/us-east-1)
- **Usuário SSH:** `opc`
- **Chave de Acesso:** `/home/leo/.ssh/oracle_key` (permissão `chmod 600`)
- **Comando de Conexão:** `ssh -i /home/leo/.ssh/oracle_key opc@163.176.87.218`
- **Diretório do Projeto:** `/home/opc/scrapper-br`

### B. Correções Estruturais Aplicadas na VM
1. **Ativação de Memória Swap:** A VM gratuita possui 1 GB de RAM e travava pelo acionamento do OOM Killer do Linux. Foi criado e ativado um Swapfile de **2.5 GB** (`/swapfile`), com `vm.swappiness = 20` configurado no `/etc/sysctl.conf`.
2. **Ambiente Virtual Python Isolado:** Criado `.venv` em `/home/opc/scrapper-br/.venv` com todas as dependências (`requests`, `beautifulsoup4`, `curl_cffi`, `pytest`).
3. **SELinux em Modo Permissivo:** Corrigido o bloqueio `status=203/EXEC` do systemd alterando `/etc/selinux/config` para `SELINUX=permissive`.
4. **Daemon Systemd 24/7:**
   - Serviço: `/etc/systemd/system/futstats-orquestrador.service`
   - Configurações de resiliência: `Restart=always`, `RestartSec=15`, `MemoryMax=850M`.
   - Comandos de gestão:
     ```bash
     sudo systemctl status futstats-orquestrador
     sudo journalctl -u futstats-orquestrador -f
     sudo systemctl restart futstats-orquestrador
     ```
   - O orquestrador roda de forma contínua sem depender de sessões de terminal abertas.

---

## 3. Motores Matemáticos Proprietários Implementados

Todos os módulos residem em `backend/` e contam com suítes de teste automatizadas:

| Módulo | Arquivo | Descrição e Fórmula |
|---|---|---|
| **Player Rating Sofascore** | `backend/calculo_player_rating.py` | Escala 0.0 a 10.0 baseada em compressão por tangente hiperbólica assimétrica ($$R = 6.5 + 3.5 \cdot \tanh(\Delta S / C)$$), pesos posicionais (Goleiro, Zagueiro, Lateral, Meia, Atacante) e penalização de gols sofridos. |
| **Expected Goals Discreto** | `backend/calculo_xg_discreto.py` | Modelo discreto de probabilidade calibrado contra dados Opta/Sofascore com divisão entre xG total, npxG (não-pênalti), Delta xG ($$\text{Gols} - \text{xG}$$) e classificação clínica (*Clínico de Elite*, *Volume Shooter*, *Eficiente*, *Neutro*). |
| **Geração Editorial Tática** | `backend/gerador_editorial_jogos.py` | Motor de crônicas dinâmicas de partidas com manchetes compactas ($$\le 80$$ caracteres) e análise de tabus e momentos decisivos. |
| **Entity Resolution & Desambiguação** | `backend/entity_resolution_jogadores.py` | Resolução de homônimos com vetos biológicos ($$\text{idade} < 15$$ ou $$> 43$$ anos) e vetos de ubiquidade temporal ($$< 36$$ horas entre jogos em clubes distintos). |

---

## 4. Otimização de Armazenamento SQLite (Teto Vercel < 94.0 MB)

- **Regra de Ouro:** O arquivo `data/futebol.db` precisa permanecer rigorosamente abaixo de **94.0 MB** para o deploy serverless na Vercel funcionar sem rejeição.
- **Ações Realizadas:**
  - Exclusão dos índices redundantes `idx_partidas_data` e `idx_escalacoes_atleta` (as consultas já utilizam índices compostos).
  - Remoção da tabela obsoleta `jogadores_resumo`.
  - Execução de `VACUUM` e `PRAGMA wal_checkpoint(TRUNCATE)`.
  - **Resultado:** O banco foi reduzido de 96.9 MB para **85.0 MB** (uma folga de segurança de **9.0 MB**).

---

## 5. Arquitetura do Esquadrão Multiagente (`/teamwork-preview`)

O sistema multiagente foi configurado sob o protocolo estruturado em 5 marcos (`PROJECT.md`):

```
┌────────────────────────────────────────────────────────────────────────┐
│             TEAMWORK MULTI-AGENT ORCHESTRATOR (PROJECT.md)             │
├────────────────────────────────────────────────────────────────────────┤
│                                                                        │
│  [M1] Armazenamento & Schema SQLite                                    │
│       - VACUUM & Limpeza de índices redundantes (<88.6 MB)            │
│       - Schema da tabela atleta_sofascore_ratings enriquecido          │
│       - Auditar e ajustar scripts/auditar_integridade_dados.py         │
│                                                                        │
│  [M2] Auto-Cura Conmebol & Desambiguação de Homônimos                  │
│       - Partidas históricas invertidas corrigidas                      │
│       - Desassociação de homônimos (Mycael, Pedro, etc.)              │
│       - Purga de clubes estrangeiros de atletas brasileiros            │
│                                                                        │
│  [M3] Motores Matemáticos de Ratings & APIs Backend                    │
│       - Integração completa de calculo_player_rating.py                │
│       - Integração de calculo_xg_discreto.py                           │
│       - Cálculo de eixos do Radar Pentagonal PES (40-99 OVR)           │
│       - Rótulo transparente "Jogos c/ Gol" e média honesta             │
│                                                                        │
│  [M4] Frontend Editorial & Acessibilidade WCAG 2.2 AA                  │
│       - Badge Sofascore em verde oliva (#526337, contraste 5.31:1)    │
│       - Correção de vazamentos da média 1.00 nos gráficos SVG          │
│       - Build limpo do Vite (npm run build)                            │
│                                                                        │
│  [M5] Suíte E2E & Homologação Final                                   │
│       - Execução dos 50 testes E2E (tests/test_e2e_futstats.py)        │
│       - 22/22 pytest tests/test_model_evals.py                         │
│       - 12/12 regras em scripts/auditar_integridade_dados.py           │
│                                                                        │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 6. Guia Passo a Passo para Continuar a Sessão

Caso os tokens expirem ou você reinicie a conversa em um novo chat, basta enviar a mensagem:

> **"Continue a partir do arquivo docs/DOSSIE_TECNICO_CONTINUIDADE.md e do PROJECT.md do teamwork."**

### Checklist de Comandos de Verificação:
```bash
# 1. Verificar integridade relacional do banco de dados (12/12 regras obrigatórias)
.venv/bin/python3 scripts/auditar_integridade_dados.py

# 2. Executar a suíte de avaliação preditiva e regressão matemática (22/22 testes)
.venv/bin/pytest tests/test_model_evals.py

# 3. Executar a suíte de testes ponta a ponta E2E
.venv/bin/pytest tests/test_e2e_futstats.py

# 4. Validar o build de produção do frontend
cd frontend && npm run build && cd ..

# 5. Monitorar o tamanho do banco de dados (deve ser < 94.0 MB)
ls -lh data/futebol.db

# 6. Checar status da VM Oracle remota
ssh -i /home/leo/.ssh/oracle_key opc@163.176.87.218 "sudo systemctl status futstats-orquestrador"
```
