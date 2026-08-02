## Context

A app tem hoje uma única vista: a escala de jantares (grelha de dias, presenças, reviews). A coordenação de compras acontece fora da app. Esta fase adiciona uma segunda vista — listas de compras partilhadas — e, com ela, o primeiro mecanismo de navegação por separadores. Toda a infraestrutura necessária já existe: login Google, Realtime Database com sincronização via `onValue`, e regras por nó.

## Goals / Non-Goals

**Goals:**
- Navegação por tabs no topo: "Escala" (vista atual) e "Lista de compras" (nova).
- Criar listas nomeadas, visíveis e editáveis por qualquer conta autenticada.
- Adicionar itens a qualquer lista e marcar/desmarcar como comprado, com sincronização em tempo real.
- Listas independentes do período da escala (não arquivam nem mudam com a reconfiguração).

**Non-Goals:**
- Sem edição ou remoção de listas/itens nesta fase (só criar, adicionar, marcar).
- Sem ligação entre itens e dias/ementas da escala.
- Sem routing por URL/hash — a tab ativa é estado de sessão; recarregar volta à Escala.
- Sem ordenação manual de itens ou listas.

## Decisions

**Nó de topo `shoppingLists`, fora de qualquer período.** Estrutura: `shoppingLists/<listId> = { name, createdBy, ts, items: { <itemId>: { name, done, ts } } }`, com IDs gerados por `push()`. Alternativa considerada: aninhar sob `<periodo>` como as ementas — rejeitada porque a proposta define explicitamente que as listas sobrevivem à reconfiguração do período.

**Leitura concedida ao nível do nó `shoppingLists`, não em níveis mais profundos.** A app escuta com um único `onValue` em `shoppingLists`; a regra `.read` tem de estar nesse nível ou acima (lição do bug PERMISSION_DENIED corrigido hoje nos nós `users`/`reviews`/`attendance`). Escrita em `$listId` para qualquer `auth != null`, com validação de campos e `$other: false`.

**Marcar comprado escreve apenas `items/<itemId>/done`.** Escrita cirúrgica no campo, nunca no item ou lista inteiros — duas pessoas a mexer na mesma lista ao mesmo tempo não se pisam.

**Re-render incremental por lista, com formulários estáveis.** Mapa `listId → elementos` (padrão já usado em `feedbackLists`): quando chega um update remoto, só a `<ul>` de itens de cada lista é reconstruída; o cartão e o formulário "adicionar item" mantêm o mesmo DOM, para não perder texto a meio de escrita. Cartões novos/removidos reconstroem a vista.

**Tabs como estado simples de UI.** Variável `activeTab` + dois botões; mudar de tab esconde/mostra os contentores das vistas e fecha overlays abertos (painel de dia, administração). O rodapé de ações da escala (copiar, administração) pertence à vista Escala e desaparece na tab de compras.

**Ordenação fixa: listas da mais recente para a mais antiga, itens por ordem de criação.** Sem escolhas do utilizador nesta fase; `ts` já existe em ambos.

## Risks / Trade-offs

- **[Risco] Sem remoção, listas velhas acumulam-se para sempre.** Mitigação: aceitável na primeira fase; a remoção/arquivo de listas é a extensão natural seguinte e o modelo de dados já a suporta (basta apagar o nó).
- **[Risco] Um único `onValue` em `shoppingLists` carrega todas as listas e itens de sempre.** Mitigação: aceitável para uma família (dezenas de itens); se um dia pesar, paginar ou arquivar listas resolve sem mudar o modelo.
- **[Risco] Re-render ao receber updates pode interromper interações não cobertas pelo padrão (ex: checkbox clicada no exato momento de um update).** Mitigação: as escritas são otimistas e cirúrgicas; o pior caso é a checkbox refletir o valor remoto um instante depois.

## Migration Plan

- Publicar as novas regras (`shoppingLists`) via `firebase deploy --only database` antes do deploy do código.
- Deploy do código via push normal para `main` (GitHub Pages).
- Rollback: reverter o commit remove a tab; o nó `shoppingLists` fica órfão mas não interfere com o resto.

## Open Questions

Nenhuma — o âmbito está fechado na proposta (criar, adicionar, marcar; sem editar/apagar).
