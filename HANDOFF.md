# 📋 HANDOFF DO PROJETO: SCRAPPER-BR / GUIA PROFISSIONAL

> **Data de atualização:** 2026-10-19 23:58  
> **Status do repositório:** Estável, 5/5 testes de integridade passando, bancos sincronizados.

---

## 1. 🎯 Objetivo do Projeto e Stack Utilizada

### Objetivo
Plataforma analítica e gerador de insights estatísticos e conteúdo viral sobre o **Futebol Brasileiro e Sul-Americano (1950–2026)** integrado a **Meteorologia Histórica (2015–2024)**, motor de **IA Analista (NL-to-SQL)** e ferramenta de **geração de cards visuais** para redes sociais (Twitter/X, Instagram).

### Stack Tecnológica
- **Frontend:**
  - React 18 (SPA com Vite)
  - Tailwind CSS + Lucide React
  - HTML5 Canvas / `html2canvas` para renderização de cards em PNG
  - Dois modos de visualização: **Sooma/Endless Tools** (Dark Cyber-Editorial) e **Classic Soft UI**
- **Backend:**
  - Python 3.12+ / Flask REST API
  - Autenticação JWT (`PyJWT`) com hash seguro PBKDF2-HMAC-SHA256 e sistema de convites
  - IA Analista com suporte dual: Google Gemini (`google-genai` SDK) e DeepSeek API
  - Suporte a deployment serverless na Vercel via `api/index.py`
- **Banco de Dados:**
  - SQLite com arquitetura desacoplada:
    - `data/futebol.db` (partidas, gols, cartões, escalações, árbitros, resumo canônico)
    - `data/clima.db` (histórico climático diário de 12 capitais brasileiras com cruzamento via `ATTACH DATABASE`)
  - Espelho obrigatório para produção serverless em `api/data/futebol.db`
- **Pipeline de Dados & Scrapers:**
  - Python com `BeautifulSoup4`, `urllib`, regex avançado e rate limiting
  - Scrapers especializados: OGol (Estaduais e Copas Regionais com paginação), RSSSF Brasil, Bola n'Área e CBF Súmulas

---

## 2. 🏗️ O que já foi feito (por Arquivo / Componente)

### Backend e APIs
- **`backend/app.py`:** API REST completa com endpoints para `/api/overview`, `/api/h2h`, `/api/jogadores/search`, `/api/jogadores/perfil`, `/api/jogadores/destaques`, `/api/oraculo/perguntar`, `/api/playground/executar`, `/api/clima/cruzamentos`, `/api/arbitragem/estatisticas` e `/api/auth/*`.
- **`backend/auth.py`:** Controle de acesso por JWT, hash PBKDF2 com salt individual, verificação de administradores e gerador/validador de códigos de convite com expiração.
- **`backend/ia_analista.py`:** Motor NL-to-SQL (Linguagem Natural para SQLite). Contém injeção de schema detalhado, sanitização contra mutações (`SELECT` only), auto-correção de queries com fallback e síntese analítica em tom jornalístico esportivo.
- **`api/index.py`:** Ponto de entrada compatível com Vercel Serverless Functions.

### Frontend
- **`frontend/src/App.jsx`:** Aplicação principal com abas de navegação:
  - **H2H (Confronto Direto):** Comparação histórica completa entre quaisquer 2 clubes, aproveitamento, gols, maiores goleadas e lista de jogos.
  - **Jogadores:** Busca com autocompletion, cards dos craques históricos, perfil completo de artilharia por clube/torneio e mapa disciplinar.
  - **Oráculo IA:** Interface conversacional com seleção de modelo (Gemini/DeepSeek), visualização opcional do SQL gerado e explicação detalhada.
  - **Playground SQL:** Console para consultas analíticas personalizadas com exportação de tabela.
  - **Clima:** Cruzamento de desempenho com temperatura, chuva e umidade.
  - **Arbitragem:** Ranking de juízes, média de cartões e pênaltis marcados.
  - **Social / Cards:** Gerador de cards estilizados para download em alta resolução.
- **`frontend/src/SoomaFutStatsView.jsx`:** Visualização inspirada nas referências de design Endless Tools / Outcrowd.
- **`frontend/src/utils/cardGenerator.js`:** Motor em canvas para exportar cards visuais 1200x675 e 1080x1350 com escudos, estatísticas e tipografia de impacto.

### Dados, Scrapers e Validação
- **`scripts/scraper_ogol_estaduais.py`:** Pipeline principal de extração e enriquecimento do OGol:
  - Cache local idempotente em `data/cache_ogol_estaduais/` (>3.200 jogos baixados).
  - Normalização canônica de nomes de clubes (`MAPA_CLUBES`) e jogadores (`MAPA_JOGADORES`).
  - Extração de minuto exato, tempo (1T/2T) e tipo de gol (Normal, Pênalti, Gol Contra, Falta).
  - Suporte integrado a 11 torneios: Paulista, Carioca, Mineiro, Gaúcho, Copa do Nordeste, Paranaense, Catarinense, Baiano, Pernambucano, Goiano e Cearense.
- **`scripts/unificar_e_reconstruir_craques.py`:** Consolidação canônica de gols e partidas na tabela `jogadores_resumo` para Gabriel Barbosa, Pedro, Hulk, Germán Cano, Raphael Veiga, Dudu e Arrascaeta.
- **`scripts/validar_banco.py`:** Suíte com 5 testes automatizados (Chaves Estrangeiras, Sanidade de Placares, Padrão de Datas ISO, Sincronia entre Bancos e Golden Queries analíticas).
- **`data/futebol.db` & `api/data/futebol.db`:**
  - Total atual: **87.941 partidas** catalogadas.
  - Década completa dos 4 grandes estaduais (**2014 a 2025**) 100% preenchida com gols detalhados e estádios (+9.600 gols catalogados).
  - Copa do Nordeste e Campeonato Paranaense (2024 e 2025) já enriquecidos.
  - Tamanho atual: **78,23 MB** (abaixo do teto de 100 MB do GitHub).

---

## 3. ⏳ O que está em Andamento e o que Falta (Prioridade)

### 🔴 Alta Prioridade (Imediata)
1. **Completar Copa do Nordeste e Campeonato Paranaense:**
   - Ingerir os anos de **2020 a 2023** usando `scripts/scraper_ogol_estaduais.py`.
2. **Ingerir novos estaduais já configurados (2020 a 2025):**
   - **Campeonato Catarinense** (Chapecoense, Avaí, Figueirense, Criciúma, Brusque).
   - **Campeonato Baiano** (Bahia, Vitória).
   - **Campeonato Pernambucano** (Sport, Náutico, Santa Cruz).
   - **Campeonato Goiano** (Goiás, Atlético-GO, Vila Nova).
   - **Campeonato Cearense** (Fortaleza, Ceará, Ferroviário).

### 🟡 Média Prioridade
3. **Anos Históricos dos 4 Grandes (2010 a 2013):**
   - Paulista, Carioca, Mineiro e Gaúcho no período 2010–2013 para completar 15 anos consecutivos de dados minuciosos de gols.
4. **Enriquecimento de Cartões nos Estaduais:**
   - Atualmente a tabela `cartoes` tem foco massivo no Brasileirão; extrair advertências detalhadas dos estaduais quando disponíveis.
5. **Debounce e Performance de Busca:**
   - Otimizar busca de jogadores no frontend com `useDeferredValue` ou debounce de 250ms para reduzir chamadas na API local.

### 🟢 Baixa Prioridade
6. **Automação de CI com GitHub Actions:**
   - Executar `scripts/validar_banco.py` em cada commit automaticamente.

---

## 4. 🎨 Decisões de Design Importantes

Referência principal documentada em [`design-endlesstools.md`](file:///f:/Antigravity_Projetos_e_Ferramentas/Guia%20profissional/design-endlesstools.md):
- **Cores & Superfícies:**
  - Fundo: True Black absoluto (`#000000`), sem tons azulados.
  - Cartões: `rgba(26, 26, 26, 0.6)` com borda sutil grafite `#343434` e `backdrop-blur-lg`.
  - Acento Primário: Magenta Neon (`#FF13B1`) com hover `#FF4BC4`.
  - Acentos Secundários: Verde Limão (`#C7FF00`) para badges de vitórias/status positivo e Ciano (`#00F0FF`) para dados técnicos.
- **Componentes:**
  - Botões de ação, inputs e tags no formato pílula total (`rounded-full`).
  - Cartões com cantos arredondados generosos (`rounded-2xl` ou `rounded-[20px]`).
- **Tipografia:**
  - Títulos em `Inter` ou `Plus Jakarta Sans`, bold, `tracking-tight`.
  - Textos de apoio em `#8E8E93`, corpo conciso e legível.
- **Animações:**
  - Micro-interações táteis rápidas: `transition-all duration-200 active:scale-[0.98]`.

---

## 5. ⚠️ Problemas Conhecidos e Regras de Segurança

1. **Limite de 100 MB do GitHub:**
   - O arquivo `data/futebol.db` e `api/data/futebol.db` tem atualmente **78,23 MB**.
   - O GitHub rejeita commits com arquivos acima de 100 MB.
   - Sempre verificar o tamanho do arquivo via PowerShell (`(Get-Item data\futebol.db).Length / 1MB`) antes de comitar.
2. **Sincronização Obrigatória dos Dois Bancos:**
   - Qualquer alteração em `data/futebol.db` **deve** ser replicada para `api/data/futebol.db` antes do push para não quebrar a API em produção.
3. **Datas Históricas da CONMEBOL (1998–2002):**
   - 122 registros no banco usam formato de texto indicando fase/rodada em vez de data ISO. O teste 3 de `validar_banco.py` emite aviso propositalmente sem falhar.
4. **Rate Limit do OGol (HTTP 429):**
   - O script `scraper_ogol_estaduais.py` inclui pausa de segurança (`delay=0.4s`) e recuperação automática em caso de erro 429 com sleep de 5s.
   - O diretório `data/cache_ogol_estaduais/` está no `.gitignore` para não inflar o repositório git com milhares de JSONs.

---

## 6. 🚀 Próximo Passo Exato ao Retomar

Para continuar o trabalho imediatamente na nova sessão:

1. **Rodar a ingestão de 2020 a 2023 da Copa do Nordeste e Paranaense:**
   ```powershell
   python scripts/scraper_ogol_estaduais.py --anos 2020 2021 2022 2023 --torneios nordeste paranaense
   ```
2. **Rodar os testes de integridade:**
   ```powershell
   python scripts/validar_banco.py
   ```
3. **Verificar o tamanho do banco:**
   ```powershell
   powershell -Command "(Get-Item data\futebol.db).Length / 1MB"
   ```
4. **Comitar e enviar:**
   ```powershell
   git add data/futebol.db api/data/futebol.db
   git commit -m "feat(estaduais): consolidar Copa do Nordeste e Paranaense 2020-2023"
   git push origin main
   ```
5. **Iniciar a ingestão de Catarinense e Baiano (2024 e 2025):**
   ```powershell
   python scripts/scraper_ogol_estaduais.py --anos 2024 2025 --torneios catarinense baiano
   ```
