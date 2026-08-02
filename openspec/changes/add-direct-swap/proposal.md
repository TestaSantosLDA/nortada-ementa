## Why

A vida real tem imprevistos — jantares fora, viagens — e hoje as trocas de dia combinam-se no WhatsApp, deixando a escala da app errada. Sem notificações na app, um fluxo pedir→aceitar morreria pendurado; a versão certa é a troca direta a um toque, com registo visível de quem trocou. (Origem: brainstorm de 2026-08-02 — ideia nº 4 da shortlist; arbitragem do Moderador confirmou a arquitetura de overrides.)

## What Changes

- No painel de detalhe de um dia futuro, secção "Trocar cozinheiro": escolher outro dia futuro e confirmar troca os cozinheiros dos dois dias, para todos, imediatamente.
- A troca é sempre um par de datas (A↔B), preservando a equidade da rotação.
- Fica registado e visível no painel "Dia trocado: A ⇄ B".
- Implementação por camada de overrides por data (`cookOverrides/<dia>`), consultada no render — o algoritmo de rotação não é tocado e reconfigurações do período não destroem trocas. Se o cozinheiro do override sair da rotação, o dia volta graciosamente ao cozinheiro calculado.

## Capabilities

### New Capabilities
- `cook-swap`: troca direta de cozinheiro entre dois dias, com registo, via overrides por data.

### Modified Capabilities
(nenhuma arquivada ainda)

## Impact

- `assets/app.js`: listener e estado `cookOverrides`, aplicação dos overrides ao gerar os dias, secção de troca no painel.
- `assets/styles.css`: estilos da secção de troca.
- `database.rules.json`: novo nó `cookOverrides` (leitura no topo, escrita autenticada validada).
