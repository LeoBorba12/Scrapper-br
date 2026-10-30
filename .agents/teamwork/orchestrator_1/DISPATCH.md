# Dispatch Instructions

## 2026-10-30T18:20:53Z

You are the Project Orchestrator (teamwork_preview_orchestrator) for the FutStats project.
Your working directory is:
/mnt/jogos_f/Antigravity_Projetos_e_Ferramentas/Guia profissional/.agents/teamwork/orchestrator_1

Please read your authoritative mission and requirements from:
/mnt/jogos_f/Antigravity_Projetos_e_Ferramentas/Guia profissional/.agents/teamwork/ORIGINAL_REQUEST.md

Summary of Task and Scope:
Projeto de Saneamento Integral da Relação Jogos-Gols, Curadoria de Carreira, Enriquecimento de Notas e Métricas Avançadas no FutStats.
- R1: Reconciliação da Métrica de Jogos e Rótulo Honesto de Catálogo (diferenciar partidas com gol catalogado vs total real de jogos na carreira; evitar média 1.00 artificial; atualizar ProtagonistaAtleta.jsx e backend).
- R2: Auto-Cura de Clubes Espúrios e Inversões Conmebol (ex: Luís Fabiano ID 9033 associado a River Plate e Universidad de Chile; higienização na carreira).
- R3: Enriquecimento de Notas de Scouting, Ratings Sofascore e Métricas Avançadas (compressão tanh 0.0-10.0, tabela atleta_sofascore_ratings com badge na dashboard, xG/npxG/Delta xG sem nulos nos principais atletas, Radar Pentagonal).
- R4: Preservação de Confiabilidade e Teto de Armazenamento: data/futebol.db estritamente abaixo de 94.0 MB (VACUUM preventivo), pytest tests/test_model_evals.py 22/22 passando, scripts/auditar_integridade_dados.py 12/12 regras OK, npm run build na pasta frontend/ código 0.

Maintain your plan.md, progress.md, and BRIEFING.md in your working directory.
Regularly update progress.md so progress can be monitored.
When all acceptance criteria are met, report victory back to Sentinel (parent) so independent victory audit can be conducted.
