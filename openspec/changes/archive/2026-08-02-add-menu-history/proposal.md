## Why

A dor mais frequente da escala é decidir o que se cozinha. O histórico de ementas (com reviews) já tem a resposta, mas está enterrado por períodos e ninguém o consulta. Duas funcionalidades pequenas, ambas só de leitura, aproveitam-no: autocomplete ao escrever a ementa e uma "roleta" que sugere um prato para dias vazios. (Origem: brainstorm de 2026-08-02 — ideias nº 1 e nº 2 da shortlist aprovada pelo Moderador.)

## What Changes

- **Ementa com Memória**: ao escrever a ementa de um dia (no painel de detalhe), aparecem chips de pratos do histórico filtrados pelo texto; um toque preenche a ementa. Escolher do histórico normaliza os dados na origem (evita variantes "c/ natas").
- **Roleta "Sem Ideias?"**: em dias sem ementa, botão que sugere um prato do histórico — bem avaliado e que não é feito há mais tempo (exclui ~14 dias recentes); um toque preenche.
- O índice de pratos agrega TODOS os períodos (`ementas/*`) e as respetivas reviews, normalizado por minúsculas/trim, exibindo a forma mais recente de cada prato.
- Regras: `.read` sobe para o nível de topo de `ementas` e `reviews` (a app passa a escutar a raiz para construir o índice).

## Capabilities

### New Capabilities
- `menu-history`: índice de pratos do histórico com autocomplete na ementa e sugestão automática ("roleta") para dias vazios.

### Modified Capabilities
(nenhuma arquivada ainda)

## Impact

- `assets/app.js`: listeners na raiz de `ementas`/`reviews`, índice normalizado, chips de autocomplete no painel, botão roleta na zona de sugestões.
- `assets/styles.css`: estilos dos chips.
- `database.rules.json`: mover `.read` para o topo de `ementas` e `reviews`.
