## Context

As listas de compras (`shoppingLists`, lançadas hoje) já são sincronizadas por inteiro para o cliente. Cada item tem `name` em texto livre. Não há qualquer noção de catálogo de itens.

## Goals / Non-Goals

**Goals:**
- Chips dos itens mais frequentes em cada cartão de lista; toque adiciona à lista.
- Zero disciplina nova: a frequência deriva do histórico completo das listas.

**Non-Goals:**
- Sem catálogo gerido, sem categorias, sem quantidades.
- Sem chips no formulário de criação de lista (a lista tem de existir primeiro).

## Decisions

**Frequência por nome normalizado (trim + minúsculas), exibindo a grafia mais recente.** "Leite" e "leite" contam junto; resolve 90% da duplicação e o resto é irrelevante à escala familiar.

**Só itens com frequência ≥ 2, top 8.** Um item usado uma única vez não é "do costume"; oito chips cabem num cartão de telemóvel sem dominar a UI.

**Excluir itens já presentes na lista (comprados ou não).** O chip serve para acrescentar o que falta, não para duplicar.

**Chips re-renderizados no mesmo passo do re-render incremental das listas.** Reutiliza o mecanismo existente (`renderShoppingLists`), sem listeners novos.

## Risks / Trade-offs

- **[Risco] Enquanto o histórico é curto, não aparecem chips (frequência < 2).** Correto por definição — a feature ganha valor com o uso; não inventamos sugestões.

## Migration Plan

Deploy do código via push. Rollback: reverter o commit; nada persiste.

## Open Questions

Nenhuma.
