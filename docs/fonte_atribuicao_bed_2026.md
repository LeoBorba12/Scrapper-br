# Documentação de Fonte, Atribuição e Linhagem de Dados — BED 2026

**Projeto:** FutStats  
**Módulo:** Camada de Métricas Avançadas Complementares (Série A 2026)  
**Data:** 06 de Novembro de 2026  
**Status de Governança:** HOMOLOGADO E CONFORME  

---

## 1. Origem e Titularidade dos Dados

O módulo de métricas analíticas avançadas do Campeonato Brasileiro Série A 2026 utiliza dados agregados provenientes do ecossistema **Brasileirão em Dados / DataFutebol**, cujo rastreamento de partidas e modelagem preditiva é derivado de telemetria estatística do provedor internacional **FotMob**:

- **Portal de Origem:** `brasileiraoemdados.com.br`
- **Curadoria e Estruturação:** Ioannis Canteiro (*DataFutebol*)
- **Rastreamento de Eventos e Modelagem Matemática:** FotMob (*Stats Perform Opta data feeds*)
- **Natureza da Ingestão no FutStats:** Somente leitura, agregada, estritamente reconciliada por identificadores canônicos e desprovida de dados brutos espaciais.

---

## 2. Princípios de Proteção de Direitos e Isolamento Editorial

Para garantir conformidade com os termos de uso, leis de propriedade intelectual e boas práticas de engenharia:

1. **Separação Editorial Rígida:**
   - As métricas do Brasileirão em Dados são apresentadas em seção expressamente rotulada:  
     `"Métricas avançadas — Brasileirão em Dados / DataFutebol"`.
   - Não há fusão ou sobrescrita nas tabelas canônicas de partidas (115.753 jogos) ou gols (117.523 gols). A base histórica original do FutStats permanece 100% pura e inalterada.
2. **Proibição de Exposição de Dados Brutos:**
   - **Zero eventos brutos:** Nenhuma linha de evento minuto a minuto do FotMob é persistida ou exposta.
   - **Zero coordenadas espaciais:** Coordenadas $x,y$ de finalizações, passes ou interceptações foram expurgadas durante o pipeline de staging.
   - **Zero mapas de calor proprietários:** Não são renderizados mapas de calor contínuos ou rasterizados do FotMob.
   - **Zero imagens ou assets externos:** Não são servidas fotos, logos ou assets visuais dos servidores do FotMob.
3. **Atribuição Visível Obrigatória:**
   - Todas as respostas de endpoints de API (`GET /api/metricas-avancadas/*`) contêm o nó de metadados:
     ```json
     {
       "fonte": "brasileiraoemdados.com.br",
       "atribuicao": "Brasileirão em Dados / DataFutebol (Ioannis Canteiro) - tracking FotMob",
       "temporada": 2026,
       "competicao": "Campeonato Brasileiro Série A"
     }
     ```
   - A interface do usuário exibe de forma fixa e proeminente a caixa de atribuição editorial no topo e no rodapé do módulo analítico.

---

## 3. Matriz de Linhagem e Proveniência (Tabela Dedicada)

A rastreabilidade dos 737 registros analíticos carregados em produção (717 atletas e 20 clubes) é assegurada pela tabela relacional desacoplada:

```sql
CREATE TABLE IF NOT EXISTS metrica_brasileirao_em_dados_proveniencia (
  escopo TEXT NOT NULL CHECK (escopo IN ('ATLETA', 'CLUBE')),
  entidade_id_canonico INTEGER NOT NULL,
  bed_id INTEGER NOT NULL,
  payload_sha256 TEXT NOT NULL,
  fonte TEXT NOT NULL,
  atribuicao TEXT NOT NULL,
  status_reconciliacao TEXT NOT NULL,
  metodo_reconciliacao TEXT NOT NULL,
  coletado_em TEXT NOT NULL,
  schema_versao TEXT NOT NULL,
  PRIMARY KEY (escopo, entidade_id_canonico, bed_id)
);
```

- Cada linha possui o hash criptográfico SHA-256 do payload de origem (`edc0fe60b472...`), data e hora da coleta, identificador canônico FutStats correspondente e o método de reconciliação aplicado (`ESCALACAO_PARTIDA` ou `CANONICO_DIRETO`).

---

## 4. Quarentena e Proteção de Atletas Não-Reconciliados

Para blindar a integridade relacional do FutStats:
- **7 Atletas Novos Bloqueados:** Jogadores detectados no feed sem histórico prévio nas 115.753 partidas canônicas permanecem armazenados unicamente no diretório de staging (`data/staging/brasileirao_em_dados/`). Nenhum deles foi inserido no banco de produção nem é exposto por endpoints ou componentes visuais.
- **4 Atletas em Quarentena Bloqueados:** Registros com minutagem marginal ($\le 90$ minutos) ou ambiguidade cadastral residual permanecem bloqueados de qualquer exposição.

---

## 5. Licença e Termos de Uso Interno

Este módulo destina-se a fins analíticos e de pesquisa no projeto FutStats. Qualquer utilização externa ou redistribuição deve preservar integralmente os créditos ao pesquisador Ioannis Canteiro (*DataFutebol*) e ao serviço FotMob.
