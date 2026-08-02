## Why

Além de saber quem cozinha e o que se vai comer, a família precisa de coordenar as compras — hoje isso faz-se por fora (grupo de WhatsApp), sem estrutura nem checklist. Trazer isto para dentro da app, junto da escala, evita perder o registo e permite que qualquer pessoa veja e contribua para o que falta comprar.

## What Changes

- A app ganha uma navegação por separadores (**tabs**) no topo: "Escala" (o que já existe) e "Lista de compras" (novo).
- Na tab de listas de compras, qualquer conta autenticada pode:
  - Criar uma nova lista, dando-lhe um nome (ex: "Compras da semana", "Churrasco de sábado").
  - Ver todas as listas existentes, criadas por qualquer pessoa.
  - Adicionar itens a qualquer lista (não só às que criou).
  - Marcar/desmarcar um item como comprado.
- Cada item tem um nome (texto livre) e um estado comprado/por comprar.
- As listas de compras **não** estão ligadas ao período da escala — existem independentemente, não arquivam nem mudam quando o período é reconfigurado.
- Sem edição/remoção de listas ou itens nesta fase (só criar, adicionar, e marcar comprado) — mantém o âmbito inicial simples.

## Capabilities

### New Capabilities
- `tab-navigation`: mecanismo genérico de separadores no topo da app para alternar entre vistas (Escala / Lista de compras nesta fase).
- `shopping-lists`: várias listas de compras nomeadas, com itens que qualquer conta autenticada pode adicionar e marcar como comprados, independentes do período da escala.

### Modified Capabilities
(nenhuma — não há specs arquivadas ainda)

## Impact

- **`assets/app.js`**: novo estado de tab ativa, nova função de alternância entre vistas, novo estado `shoppingLists`, UI de criação de lista, UI de item (checkbox + texto), sincronização em tempo real via Firebase.
- **`index.html`**: novos contentores para a navegação por tabs e para a vista de listas de compras.
- **`assets/styles.css`**: estilos dos separadores e da vista de listas de compras (cartões de lista, itens com checkbox).
- **`database.rules.json`**: novo nó `shoppingLists/<listId>` (não ligado a nenhum período), com leitura/escrita para qualquer conta autenticada.
