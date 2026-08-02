## Context

A app vive em GitHub Pages num subcaminho (`/nortada-ementa/`). Os membros acedem por link guardado no WhatsApp ou histórico do browser.

## Goals / Non-Goals

**Goals:**
- Instalável no ecrã inicial (Android e iOS) com ícone e nome próprios, a abrir em standalone.

**Non-Goals:**
- Sem service worker, sem cache offline, sem push — deliberadamente (risco de servir HTML velho para sempre numa app sem manutenção; sem valor offline real numa app de sincronização em tempo real).

## Decisions

**Manifest com caminhos relativos (`start_url: "."`, `scope: "."`).** Funciona no subcaminho do GitHub Pages sem hardcodar o nome do repositório.

**Ícone gerado de SVG próprio (prato + talheres) na paleta da app.** PNG 512/192 no manifest + 180 como `apple-touch-icon` (iOS ignora o manifest para o ícone).

**Metas `apple-mobile-web-app-*` incluídas.** iOS antigo não respeita `display: standalone` do manifest; as metas são inofensivas nos restantes.

## Risks / Trade-offs

- **[Risco] Sem SW, o Chrome pode não mostrar o banner automático de instalação.** Aceitável: o caminho manual ("Adicionar ao ecrã principal") funciona em ambos os sistemas, e é isso que se vai ensinar à família uma vez.

## Migration Plan

Deploy via push. Rollback: reverter o commit; quem já instalou fica com um atalho normal para o site.

## Open Questions

Nenhuma.
