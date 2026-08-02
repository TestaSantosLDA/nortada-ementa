## 1. Regras da base de dados

- [x] 1.1 Adicionar `shoppingLists` a `database.rules.json`: `.read` para `auth != null` ao nível do nó, `.write` por `$listId` para `auth != null`, validação de `name`/`ts`/`createdBy` e de `items/$itemId` (`name`, `done` booleano, `ts`), com `$other: false`.
- [x] 1.2 Publicar as regras com `firebase deploy --only database`.

## 2. Navegação por tabs

- [x] 2.1 Adicionar a barra de tabs ("Escala" / "Lista de compras") a `index.html` e envolver a vista atual num contentor próprio, com novo contentor para a vista de compras.
- [x] 2.2 Em `assets/app.js`, estado `activeTab` + alternância entre vistas; mudar de tab fecha o painel de dia e a administração se estiverem abertos.

## 3. Estado e sincronização das listas

- [x] 3.1 Métodos no backend: escuta de `shoppingLists` via `onValue`, criação de lista (`push`), adição de item (`push`), marcação de comprado (escrita apenas em `items/<id>/done`).
- [x] 3.2 Estado `shoppingLists` sincronizado em tempo real, com re-render incremental (mapa `listId → elementos`; a `<ul>` de itens re-renderiza, o formulário de adicionar item mantém o DOM).

## 4. UI das listas

- [x] 4.1 Formulário de criação de lista (nome + botão), com validação de nome não vazio.
- [x] 4.2 Cartão por lista: nome, itens com checkbox + texto (comprado = riscado), formulário "adicionar item" no fim.
- [x] 4.3 Estado vazio ("ainda não há listas") e ordenação: listas mais recentes primeiro, itens por ordem de criação.

## 5. Estilos

- [x] 5.1 Estilizar a barra de tabs (estado ativo incluído).
- [x] 5.2 Estilizar a vista de compras: cartões de lista, itens com checkbox, item comprado riscado, formulários.

## 6. Verificação e deploy

- [x] 6.1 Verificar sintaxe (`node --check`, JSON das regras) e carregar a app localmente sem erros de consola.
- [x] 6.2 Commit e push para `main` (deploy via GitHub Pages).
- [ ] 6.3 Testar com duas contas em dois dispositivos: criar lista, adicionar itens à lista do outro, marcar comprado, e confirmar sincronização em tempo real. **(por fazer pelo utilizador — login Google não funciona em browser automatizado)**
