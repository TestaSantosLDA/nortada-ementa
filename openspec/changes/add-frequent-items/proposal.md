## Why

Uma família compra os mesmos itens em ciclo (leite, pão, fruta). Digitá-los no telemóvel lista após lista é a fricção principal da funcionalidade de compras acabada de lançar. Os dados para eliminar essa fricção já existem no histórico das próprias listas. (Origem: brainstorm de 2026-08-02 — ideia nº 3 da shortlist, "Compra do Costume".)

## What Changes

- Em cada cartão de lista aparecem chips com os itens mais frequentes do histórico de todas as listas (normalizados por minúsculas/trim), excluindo os que a lista já contém.
- Um toque num chip adiciona o item à lista. Sem configuração, sem campos novos — deriva tudo do que já foi escrito.

## Capabilities

### New Capabilities
- `frequent-items`: sugestão de itens frequentes do histórico nas listas de compras, a um toque.

### Modified Capabilities
(nenhuma arquivada ainda)

## Impact

- `assets/app.js`: agregação de frequência sobre `shoppingLists` (já sincronizado), chips por cartão de lista.
- `assets/styles.css`: estilos dos chips.
- Sem alterações a regras nem ao modelo de dados — só leitura do que já existe.
