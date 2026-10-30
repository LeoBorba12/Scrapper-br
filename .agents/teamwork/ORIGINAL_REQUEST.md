# Original User Request

## 2026-10-30T18:19:55Z

Projeto de Saneamento Integral da Relação Jogos-Gols, Curadoria de Carreira, Enriquecimento de Notas e Métricas Avançadas no FutStats.
O objetivo é auditar exaustivamente toda a base de 115.000+ partidas e 19.000+ atletas, eliminando anomalias de "168 gols em 168 jogos" (média 1.00), expurgando clubes espúrios de competições Conmebol, e calculando/persistindo as notas de scouting e ratings estilo Sofascore (0 a 10.0) e scouts atômicos faltantes para todos os atletas da plataforma.

Working directory: /mnt/jogos_f/Antigravity_Projetos_e_Ferramentas/Guia profissional
Integrity mode: development

## Requirements

### R1. Reconciliação da Métrica de Jogos e Rótulo Honesto de Catálogo
A dashboard e o backend devem diferenciar com precisão entre "Partidas com Gol Catalogado" e "Total Real de Jogos na Carreira". Para atletas cujo acervo detalhado de súmulas pré-2018 ainda não possua 100% das presenças minuto a minuto, o sistema não deve exibir uma média distorcida de 1.00 gol/jogo, utilizando a contagem de partidas oficiais consolidadas como referência primária e sinalizando visualmente o status da base local.

### R2. Auto-Cura de Clubes Espúrios e Inversões Conmebol
Identificar e reparar confrontos históricos onde gols de atletas vinculados a clubes brasileiros foram computados para clubes adversários estrangeiros (ex: Luís Fabiano associado a River Plate e Universidad de Chile), higienizando o histórico de clubes de todos os atletas afetados.

### R3. Enriquecimento de Notas de Scouting, Ratings Sofascore e Métricas Avançadas
Integrar e popular para os atletas da base:
1. O motor matemático de notas de partida e médias globais (0.0 a 10.0) baseado no algoritmo de compressão assintótica (tanh) posicional;
2. Os dados oficiais homologados e extraídos do Sofascore na tabela atleta_sofascore_ratings com o badge correspondente na dashboard;
3. As métricas atômicas de Expected Goals (xG, npxG) e Eficiência Clínica (Delta xG), preenchendo as lacunas estatísticas nos perfis.

### R4. Preservação de Confiabilidade e Teto de Armazenamento
Qualquer ampliação de acervo, enriquecimento de escalações ou saneamento em lote no banco SQLite data/futebol.db deve obrigatoriamente manter o tamanho do arquivo estritamente abaixo do limite de 94.0 MB da Vercel, com execução de VACUUM preventivo e preservação dos 22 testes de regressão matemática.

## Acceptance Criteria

### Integridade Estatística e Visual
- [ ] Nenhum atleta no banco possui média distorcida de 1.00 gol/jogo resultante de equivalência artificial de jogos=gols quando há dados oficiais de carreira divergentes.
- [ ] No perfil do atleta (ex: Luís Fabiano, ID 9033), os clubes espúrios estrangeiros (River Plate, Universidad de Chile) não aparecem na lista de clubes defendidos na carreira.
- [ ] O componente ProtagonistaAtleta.jsx exibe o rótulo transparente "Jogos c/ Gol" ou a média ponderada autêntica sempre que o histórico local for parcial.
- [ ] O perfil dos atletas exibe o badge de Nota Sofascore / Scouting (0-10) devidamente calibrado e alimentado no banco de dados.
- [ ] O Radar Pentagonal (PES/FIFA) e os dados de xG/npxG são calculados sem valores nulos para os atletas principais.

### Confiabilidade de Infraestrutura
- [ ] A suíte de avaliação preditiva (pytest tests/test_model_evals.py) aprova 22/22 testes sem falhas.
- [ ] O script de auditoria scripts/auditar_integridade_dados.py reporta 12/12 regras OK com 0 anomalias.
- [ ] O build do frontend (npm run build) conclui com código 0 e sem erros de empacotamento.
- [ ] O tamanho do arquivo data/futebol.db permanece estritamente abaixo de 94.0 MB.
