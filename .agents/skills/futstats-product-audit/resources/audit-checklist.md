# Checklist de Auditoria Profissional FutStats

## 1. Funcionalidade
- [ ] Busca de atletas por nome e autocomplete por ID funcional
- [ ] Todos os 5 rankings oficiais funcionando
- [ ] Troca de senha pelo modal e logout persistido
- [ ] Retorno da ficha do atleta para a lista preserva estado da busca/ranking
- [ ] Expansão de histórico recente dos clubes na tabela editorial

## 2. UX & Navegação
- [ ] Clareza dos caminhos e cabeçalho unificado sem duplicidades
- [ ] Feedback visual de loading, vazio, erro e dados parciais
- [ ] Tratamento de nomes longos e jogadores sem foto (monograma tipográfico elegante)

## 3. UI & Design System
- [ ] Consistência nos dois temas (Areia e Carvão)
- [ ] Sem neon, lavanda ou sombras borradas
- [ ] Hierarquia tipográfica com Source Serif 4 em títulos e Inter em tabelas/controles

## 4. Acessibilidade
- [ ] Navegação por teclado e foco visível
- [ ] Contraste mínimo WCAG AA (4,5:1 para texto normal, 3:1 para grande)
- [ ] Rótulos acessíveis em inputs, botões e controles

## 5. Desempenho & Responsividade
- [ ] Layout fluido e responsivo testado em 390px (mobile), 768px (tablet), 1280px e 1440px (desktop)
- [ ] Imagens com dimensões reservadas para evitar salto de layout (CLS)
- [ ] Scroll horizontal isolado em tabelas sem quebrar o layout da página

## 6. Integridade dos Dados
- [ ] Amostras, recortes e fontes declaradas
- [ ] Dados oficiais de carreira separados de dados da base interna
- [ ] Zero, ausente e não-informado representados com distinção
