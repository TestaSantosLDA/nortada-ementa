## Context

A escala é uma função pura calculada no render (`buildDays`: `who = cookOrder[i % n]`); nada é persistido por dia. As presenças já usam um padrão de override sobre um valor por omissão (`dayAttendance[uid]` sobre `householdSize`) — este design reaplica esse padrão ao cozinheiro do dia.

## Goals / Non-Goals

**Goals:**
- Troca imediata (sem aceitação) entre dois dias futuros, visível para todos em tempo real.
- Registo de quem ficou com o dia de quem.
- Sobreviver a recálculos (mudar período/ordem de cozinheiros não apaga trocas).

**Non-Goals:**
- Sem fluxo de pedido/aceitação (morre sem notificações — veredito do brainstorm).
- Sem trocar dias passados.
- Sem histórico de trocas além do estado atual de cada dia.

## Decisions

**Nó `cookOverrides/<dayId> = { uid, prevUid, by, ts }`, fora de `config`.** Chave é a data — recalcular a rotação não toca nos overrides. `uid` é quem passa a cozinhar; `prevUid` quem cozinharia (para o registo "A ⇄ B"); `by` quem fez a troca.

**Troca escreve os dois dias numa única operação (`update` multi-path).** Atómico: nunca fica meio-trocado.

**Override aplicado no render com fallback gracioso.** Depois de `buildDays`, `day.who = override.uid` apenas se esse uid estiver na rotação atual (`PEOPLE`); caso contrário ignora-se o override — um cozinheiro removido devolve os dias trocados ao cálculo normal.

**Qualquer conta autenticada pode trocar quaisquer dois dias futuros.** Consistente com o resto da app (qualquer um edita qualquer ementa); numa família, a confiança é o modelo de permissões.

**A troca usa os cozinheiros EFETIVOS no momento (já com overrides).** Trocas encadeadas funcionam: trocar um dia já trocado passa o cozinheiro atual, não o original.

## Risks / Trade-offs

- **[Risco] Troca não pedida (alguém troca sem combinar).** Mitigação: registo visível "A ⇄ B" + confiança familiar; qualquer um pode trocar de volta.
- **[Risco] Overrides órfãos acumulam-se de períodos antigos.** Inofensivo (só se leem os dias do período ativo); limpeza futura se alguma vez pesar.

## Migration Plan

Publicar regras (`cookOverrides`) → deploy do código. Rollback: reverter o commit; o nó fica órfão sem interferir.

## Open Questions

Nenhuma.
