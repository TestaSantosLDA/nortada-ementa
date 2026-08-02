## Context

As ementas vivem em `ementas/<periodo>/<dia>` (texto livre) e as reviews em `reviews/<periodo>/<dia>/<entryId>`. A app só escuta o período atual. O histórico completo nunca é lido, e as regras só permitem leitura ao nível de `$periodo`.

## Goals / Non-Goals

**Goals:**
- Índice de pratos agregado de todos os períodos, com forma de exibição, última data e média de estrelas.
- Autocomplete (chips) sob o textarea da ementa no painel de detalhe; roleta para dias vazios.
- Zero campos novos para preencher; zero entidades novas na base de dados.

**Non-Goals:**
- Sem entidade "receita" estruturada, sem ingredientes, sem curadoria manual (rejeitado no brainstorm).
- Sem autocomplete nos cartões da grelha (só no painel — nos cartões pequenos seria ruído).

## Decisions

**Normalização por `trim` + minúsculas, exibindo a forma mais recente.** "Bacalhau c/ Natas" e "bacalhau c/ natas" contam como o mesmo prato; mostra-se a grafia usada mais recentemente. Não corrige o passado, mas o autocomplete converge o futuro — escolher do histórico deixa de criar variantes.

**Índice construído no cliente, lazy e invalidado por listener.** Dois `onValue` na raiz (`ementas`, `reviews`) guardam os dados brutos; o índice (Map) constrói-se na primeira utilização e invalida-se quando chegam dados novos. Escala familiar: dezenas de pratos, custo irrelevante.

**Roleta: excluir pratos dos últimos 14 dias; ordenar por média de estrelas (3 por omissão) e antiguidade; escolha aleatória entre os 5 melhores.** Aleatoriedade dá o gozo de "roleta"; o filtro evita repetição; se tudo for recente, usa o histórico todo em vez de falhar.

**Regras: `.read` ao nível de topo dos nós escutados.** Mesma lição do bug PERMISSION_DENIED de hoje — escuta-se a raiz, a leitura tem de estar lá.

## Risks / Trade-offs

- **[Risco] O histórico cresce sem limite.** Aceitável durante anos a escala familiar; se pesar, limita-se o índice aos últimos N períodos sem mudar o modelo.
- **[Risco] Ementas multi-linha ("Sopa\nBacalhau") contam como um prato único.** Aceitável — é como a família escreve e como o prato se repete.

## Migration Plan

Publicar regras → deploy do código. Rollback: reverter o commit; as regras mais abertas não fazem mal (leitura já era permitida por período a qualquer autenticado).

## Open Questions

Nenhuma.
