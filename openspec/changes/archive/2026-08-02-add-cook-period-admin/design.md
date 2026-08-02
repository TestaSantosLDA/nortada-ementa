## Context

Hoje `PERIODO` deriva de `DB_PATH` (`"ementas/2026-08"` → `"2026-08"`), e `DAYS`/`PEOPLE` são constantes escritas à mão. A família já está a usar a app esta semana com esses valores fixos (ementas, reviews e presenças já preenchidas para 1–14 de agosto). Esta fase torna `PEOPLE`/`DAYS` configuráveis via UI, o que exige decidir como gerar o `periodo` a partir de datas escolhidas livremente, sem partir os dados já existentes.

## Goals / Non-Goals

**Goals:**
- Escolher, num popup, quais as contas (de entre as já conhecidas em `users/`) que cozinham, e o intervalo de datas da escala.
- Gerar automaticamente a rotação diária (round-robin) e a lista de dias a partir dessa configuração.
- Preservar o acesso aos dados já existentes (esta semana de agosto) se a configuração inicial reproduzir o mesmo intervalo.
- Qualquer conta autenticada pode configurar (sem admin separado).

**Non-Goals:**
- Não há edição manual de "quem cozinha que dia" nesta fase — é sempre automático a partir da rotação.
- Não há seletor de períodos passados — períodos antigos ficam só acessíveis diretamente na consola Firebase, não na app.
- Não se resolve remoção/edição de contas depois de estarem na rotação (para retirar alguém, tira-se da lista e a rotação recalcula-se a partir daí).

## Decisions

**`periodo` deriva do mês da data de início, não do intervalo completo.** `periodo = startDate.slice(0, 7)` (ex: `"2026-08-01"` → `"2026-08"`). Isto reproduz exatamente a chave usada hoje, então se a primeira configuração desta fase mantiver o início a 1 de agosto de 2026, todas as ementas/reviews/presenças já introduzidas esta semana continuam visíveis, sem qualquer migração. Alternativa considerada: `periodo` como `"<inicio>_<fim>"` (mais preciso para intervalos que atravessam meses) — rejeitada por, nesta primeira configuração, cortar o acesso aos dados já existentes; para uma escala familiar de 1-2 semanas, colidir dois períodos no mesmo mês é um risco aceitável e raro.

**Rotação automática por índice, não por atribuição manual.** Dado o intervalo de dias `[d0, d1, ..., dn]` e a lista de cozinheiros escolhidos `[c0, c1, ..., ck]`, o cozinheiro do dia `i` é `c[i % (k+1)]`. Simples, previsível, e corresponde à opção escolhida.

**Cores dos cozinheiros geradas por posição, não fixas por nome.** Como os cozinheiros passam a ser contas Google reais (não os 5 nomes fixos de hoje), a cor de cada um vem de uma paleta fixa indexada pela posição na lista escolhida (reaproveitando as 5 cores atuais como as primeiras da paleta, mais 3 novas para suportar até 8 cozinheiros).

**Estado "por configurar" quando falta `config/period` ou `config/cooks`.** Em vez de mostrar uma grelha vazia ou usar um valor por omissão inventado, a app mostra um ecrã simples com "Ainda não há uma escala configurada" e um botão direto para abrir a administração. Isto evita gerar dados fantasma (ex: um período por omissão que ninguém escolheu).

**Acesso: qualquer conta autenticada.** Sem lista de administradores — consistente com o resto da app (qualquer pessoa da família já podia editar a ementa de qualquer dia).

## Risks / Trade-offs

- **[Risco] Se a primeira configuração desta fase não reproduzir o intervalo 1–14 agosto, os dados já introduzidos esta semana deixam de aparecer (ficam no Firebase, não na app).** Mitigação: nenhuma automática — fica documentado aqui e será relembrado antes de implementar, para a primeira configuração real ser feita com atenção a isto.
- **[Risco] Rotação automática pode não corresponder às preferências reais de quem já cozinhou esta semana (a rotação atual não é round-robin puro).** Mitigação: aceitável — esta fase troca a atribuição manual por uma regra simples e previsível, indo ao encontro do que foi pedido; ajustes finos ficam para uma iteração futura, se vierem a ser precisos.
- **[Risco] Só se pode escolher cozinheiros que já fizeram login pelo menos uma vez.** Mitigação: aceitável para uma app familiar pequena — quem ainda não entrou pode fazê-lo antes de ser adicionado à rotação.

## Migration Plan

- Nenhuma migração de dados é necessária se a primeira configuração reproduzir o intervalo 1–14 agosto de 2026 (ver decisão acima).
- Publicar as novas regras (`config`) no Firebase Console antes do deploy.
- Deploy do código via push normal para `main`.
- Rollback: reverter o commit volta às constantes fixas; os nós `config/*` ficam órfãos mas não interferem com o resto.

## Open Questions

Nenhuma em aberto — as três decisões estruturais (rotação automática, períodos antigos arquivados sem seletor, acesso sem admin separado) já foram confirmadas.
