## Why

Para os membros menos tecnológicos, "carregar no ícone" em vez de "procurar o link" é a diferença entre usar e não usar a app. Instalável no ecrã inicial, a app passa de "aquele site" a "a app da família". (Origem: brainstorm de 2026-08-02 — ideia nº 5 da shortlist; condição do Crítico aceite: sem service worker.)

## What Changes

- `manifest.webmanifest` com nome, cores da app e ícones; `display: standalone` para abrir em ecrã inteiro.
- Ícones próprios (prato + talheres, paleta da app) em 512/192/180 px; `apple-touch-icon` para iOS.
- **Sem service worker** — decisão deliberada: um SW com cache mal feita serve HTML velho para sempre numa app de manutenção nula; o "Adicionar ao ecrã principal" moderno não o exige.

## Capabilities

### New Capabilities
- `pwa-install`: app instalável no ecrã inicial com ícone e modo standalone, sem service worker.

### Modified Capabilities
(nenhuma arquivada ainda)

## Impact

- `manifest.webmanifest` (novo), `assets/icon-{512,192,180}.png` (novos), `index.html` (links no head).
- Zero alterações a JS, regras ou dados.
