# ⚽ Scrapper-br: Mineração de Dados & Fatos Inusitados do Futebol Brasileiro

> **Pipeline de dados 100% automatizado e sem custos ($0 de infra)** que cruza o histórico do Brasileirão com variáveis externas (meteorologia histórica, clássicos regionais e sequências de resultados) para gerar análises virais prontas para redes sociais (Twitter/X).

---

## 🚀 Visão Geral

Este repositório contém a engine de dados para o perfil automatizado de estatísticas curiosas do futebol brasileiro:
1. **Histórico Completo**: Análise estruturada do Campeonato Brasileiro (era dos pontos corridos e recortes históricos).
2. **Cruzamento com Clima Histórico**: Integração com a API global da **Open-Meteo** (temperatura máxima, precipitação e umidade no dia e local de cada partida).
3. **Geração Automatizada de Cards**: Produção de imagens widescreen (1200x675) de alta resolução via Python (`Pillow`), no padrão visual ideal para feeds sociais.
4. **Agendamento em Nuvem com GitHub Actions**: Pipeline configurado para rodar sem necessidade de manter servidores locais ou VMs ligadas.

---

## 📂 Estrutura do Projeto

```text
├── .github/workflows/
│   └── scraper_diario.yml          # Automação diária no GitHub Actions (00:00 BRT)
├── minerar_futebol.py             # Extrai jogos do Brasileirão e cruza com a API Open-Meteo
├── analise_classicos_corinthians.py # Análise histórica de clássicos paulistas e pós-goleadas
├── gerar_card_tweet.py            # Gera cards visuais em alta resolução para tweets
├── card_corinthians_clima.png     # Exemplo gerado do card pronto para postagem
├── requirements.txt               # Dependências do projeto
└── README.md                      # Documentação do projeto
```

---

## 📊 Principais Descobertas Mineradas

- **Efeito Temperatura no Corinthians (Neo Química Arena)**:
  - Partidas com calor intenso ($\ge 28^\circ\text{C}$): taxa de vitória de **~53,6%**.
  - Partidas em clima ameno/frio ($\le 21^\circ\text{C}$): taxa de vitória sobe para **~68,6%** (+15 p.p. de aproveitamento).
- **Pós-Goleada em Clássicos Paulistas**:
  - Na era dos pontos corridos, após sofrer $>3$ gols contra Palmeiras, Santos ou São Paulo, o Corinthians manteve **100% de invencibilidade** na partida imediatamente seguinte.

---

## 🛠️ Como Executar Localmente

### 1. Clonar o repositório
```bash
git clone https://github.com/LeoBorba12/Scrapper-br.git
cd Scrapper-br
```

### 2. Instalar dependências
```bash
pip install -r requirements.txt
# ou: pip install requests pandas pillow numpy
```

### 3. Rodar os scripts de análise e geração
```bash
python minerar_futebol.py
python analise_classicos_corinthians.py
python gerar_card_tweet.py
```
O card visual gerado será salvo como `card_corinthians_clima.png`.

---

## ⚙️ Automação (GitHub Actions)

O workflow [`.github/workflows/scraper_diario.yml`](.github/workflows/scraper_diario.yml) executa:
- **Diariamente às 00:00 (Brasília) / 03:00 (UTC)**.
- **Disparo Manual (Workflow Dispatch)**: Você pode testar e rodar o pipeline a qualquer momento pelo painel do GitHub na aba **Actions** > **Run workflow**.
- O bot baixa os dados, reprocessa as estatísticas, gera os novos cards e faz commit automático direto no repositório.