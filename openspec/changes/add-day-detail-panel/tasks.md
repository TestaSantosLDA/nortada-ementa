## 1. Estrutura do painel

- [x] 1.1 Adicionar a `index.html` um contentor para o painel (`#day-panel`), escondido por omissão, fora da grelha de cartões.
- [x] 1.2 Em `assets/app.js`, criar `openDayPanel(d)`/`closeDayPanel()`: ao abrir, mover (não clonar) os nós existentes do cartão (ementa, feedback, presença) para dentro do painel; ao fechar, devolvê-los ao cartão original.

## 2. Interação de abertura/fecho

- [x] 2.1 Adicionar um listener de clique ao `<article class="day">` que abre o painel, ignorando cliques cujo alvo esteja dentro de `textarea`, `.feedback-form` ou `.attendance-control`.
- [x] 2.2 Fechar o painel com: botão de fechar, clique no fundo (backdrop), e tecla Escape.
- [x] 2.3 Ao abrir, correr `autoGrow` na textarea movida (a altura calculada no cartão pode não ser válida no novo layout do painel).

## 3. Sugestões quando não há ementa

- [x] 3.1 Dentro do painel, antes da ementa, mostrar uma secção "Sugestões" com as entradas `recommendation` desse dia (lidas do estado `feedback` já existente), só quando `menus[d.id]` está vazio.
- [x] 3.2 Cada sugestão tem um botão "Usar esta sugestão" que preenche a textarea da ementa com o texto da recomendação (sem submeter automaticamente — a pessoa continua a poder editar antes de guardar).
- [x] 3.3 Esconder a secção de sugestões assim que a ementa deixa de estar vazia (ao escrever, ou ao usar uma sugestão).

## 4. Estilos

- [x] 4.1 Estilizar o painel como modal centrado com fundo semi-transparente (backdrop), consistente com a paleta e tipografia existentes.
- [x] 4.2 Estilizar a secção de sugestões (lista de recomendações + botão de ação).

## 5. Verificação

- [ ] 5.1 Confirmar que clicar no cartão abre o painel, e que clicar na textarea/formulário de feedback/stepper não abre. **(por fazer pelo utilizador — sem browser interativo disponível nesta sessão)**
- [ ] 5.2 Confirmar que editar a ementa dentro do painel atualiza o mesmo valor no cartão depois de fechar (sem duplicar nem perder texto). **(por fazer pelo utilizador)**
- [ ] 5.3 Confirmar que as sugestões aparecem só quando não há ementa, e que "Usar esta sugestão" preenche o campo corretamente. **(por fazer pelo utilizador)**
- [ ] 5.4 Confirmar que fechar com Escape, backdrop e botão funcionam todos. **(por fazer pelo utilizador)**
