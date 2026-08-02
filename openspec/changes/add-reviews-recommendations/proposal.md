## Why

A escala atual só regista quem cozinha e a ementa de cada dia. Não há forma de a família reagir depois do jantar (gostaram? o que achavam?) nem de sugerir antecipadamente o que gostariam de comer num dia ainda por decidir. Isso faz-se hoje por fora (grupo de WhatsApp), perdendo-se o registo. Queremos trazer esse feedback para dentro do quadro, junto de cada dia.

## What Changes

- Cada card de dia ganha uma nova secção **"Reviews e recomendações"**, por baixo da ementa.
- Qualquer pessoa pode adicionar uma entrada a um dia, de um de dois tipos:
  - **Review**: classificação obrigatória de 1 a 5 estrelas + comentário de texto opcional. Pensada para depois do jantar acontecer.
  - **Recomendação**: só texto (sugestão do que gostariam de comer nesse dia), sem estrelas.
- As entradas são anónimas — não fica registado quem escreveu, só o conteúdo, o tipo e a hora.
- Um dia pode ter várias entradas de vários tipos (não é um campo único como a ementa).
- Sincronização em tempo real via Firebase (mesmo mecanismo já usado para as ementas), com fallback para localStorage quando o Firebase não está configurado.
- O texto exportado por "Copiar escala para o grupo" passa a incluir um resumo das reviews (média de estrelas, se houver) por dia.

## Capabilities

### New Capabilities
- `day-feedback`: entradas anónimas de review (estrelas + texto opcional) ou recomendação (só texto) associadas a um dia da escala, com sincronização em tempo real e fallback local.

### Modified Capabilities
(nenhuma — não existem specs anteriores neste projeto)

## Impact

- **`assets/app.js`**: novo estado `feedback` (entradas por dia), novo bloco de UI no `buildCard`, nova lógica de escrita (`addFeedback`) em vez do `queueWrite` de texto único, e alteração ao texto gerado pelo botão "Copiar".
- **`assets/styles.css`**: estilos para a nova secção (lista de entradas, estrelas, formulário de nova entrada).
- **`index.html`**: sem alterações de estrutura esperadas (a secção é gerada via JS, como o resto).
- **`database.rules.json`**: novo nó `reviews/<periodo>/<dia>/<entryId>` com regras de leitura/escrita para utilizadores autenticados (anónimo) e validação da forma da entrada (tipo, estrelas, texto, tamanho).
- **Firebase Realtime Database**: estrutura de dados adicional; não requer nenhuma alteração de configuração do projeto (mesmo `DB_PATH` base, novo sub-caminho).
