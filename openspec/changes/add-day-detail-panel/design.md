## Context

Depois da Fase 1, o cartão de cada dia já é rico: cabeçalho (dia/cozinheiro), presenças (badge + stepper), ementa (textarea), e reviews/recomendações (lista + formulário) — tudo inline e editável diretamente no cartão, dentro de uma grelha de 7 colunas em desktop e 1 em telemóvel. Este design acrescenta uma vista alternativa, maior, do mesmo dia, e uma sugestão automática quando não há ementa.

## Goals / Non-Goals

**Goals:**
- Um painel/modal por dia, aberto ao clicar no cartão, com mais espaço para ler/escrever.
- O painel usa os mesmos dados em tempo real do cartão — não é uma cópia nem um estado separado.
- Quando a ementa do dia está vazia, mostrar as recomendações existentes desse dia como sugestões, com uma ação de um clique para as usar como ementa.

**Non-Goals:**
- Não se remove nem esconde nada do cartão — o painel é um complemento, não substitui a edição inline.
- Não se introduz nenhum dado novo na base de dados — o painel só lê/escreve nos mesmos nós (`ementas`, `reviews`) já existentes.
- Não se resolve aqui a administração de cozinheiros/período (fica para a Fase 3).

## Decisions

**Um modal centrado, não um sidepanel lateral.** Dado que o site já é totalmente responsivo (grelha 7→4→2→1 colunas conforme o ecrã), um modal centrado funciona identicamente em desktop e telemóvel, enquanto um painel lateral fixo tornar-se-ia estranho em ecrãs estreitos. Alternativa considerada: sidepanel deslizante — rejeitada por exigir tratamento diferente para mobile (normalmente vira um "bottom sheet"), mais trabalho para um ganho equivalente.

**Clique no cartão abre o painel, exceto em controlos interativos.** O clique é capturado ao nível do `<article class="day">`, mas ignorado se o alvo do clique estiver dentro da `textarea`, do formulário de feedback (`.feedback-form`), ou do controlo de presença (`.attendance-control`) — assim quem quer escrever continua a poder clicar diretamente nesses campos sem abrir o painel sem querer.

**O painel partilha o mesmo estado, não duplica dados.** Em vez de criar uma segunda instância de textarea/formulário dentro do painel com o seu próprio estado, o painel **move** (não copia) os elementos existentes do cartão para dentro de si quando abre, e devolve-os ao cartão quando fecha. Isto evita ter duas fontes de verdade para o mesmo campo (haveria risco de escrever no cartão e no painel ao mesmo tempo e perder texto). Alternativa considerada: renderizar uma segunda cópia sincronizada por JS — mais código e mais uma superfície para bugs de sincronização, sem benefício percetível para o utilizador.

**Sugestões: mostradas só quando a ementa está vazia, e só no painel (não no cartão).** O cartão mantém-se como está (sem alterações) — as sugestões só aparecem dentro do painel, por cima da textarea da ementa, cada uma com um botão "Usar esta sugestão" que preenche a textarea com o texto dessa recomendação (a pessoa pode depois editar à vontade). Se não houver nenhuma recomendação para esse dia, esta secção não aparece.

## Risks / Trade-offs

- **[Risco] Mover elementos DOM entre o cartão e o painel pode ser subtil de acertar (perder listeners, ou o `autoGrow` da textarea).** Mitigação: mover o nó DOM diretamente (`appendChild` move, não clona) preserva listeners e valor; `autoGrow` corre de novo ao abrir o painel.
- **[Risco] Clique acidental a abrir o painel enquanto se seleciona texto na ementa.** Mitigação: o clique só abre o painel se o alvo não estiver dentro dos controlos interativos listados acima; selecionar texto dentro da textarea não dispara o clique no `<article>`.

## Migration Plan

- Mudança só de frontend (sem alterações à base de dados nem às rules) — deploy via push normal para `main`.
- Rollback: reverter o commit remove o painel; o cartão continua a funcionar exatamente como antes, já que o painel só reutiliza os elementos existentes.

## Open Questions

Nenhuma em aberto.
