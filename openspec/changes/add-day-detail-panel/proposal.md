## Why

O cartão de cada dia já mostra bastante informação em pouco espaço (ementa, reviews/recomendações, presenças), o que fica apertado num ecrã de telemóvel (grelha de 1 coluna) e não distingue os dias sem ementa dos que já têm. Um dia sem ementa devia sugerir ativamente o que já foi recomendado, em vez de mostrar só um placeholder vazio.

## What Changes

- Clicar num cartão (fora dos controlos interativos — textarea, formulário de feedback, stepper de presença) abre um **painel de detalhe** desse dia, com mais espaço para ler e escrever.
- O painel mostra o mesmo conteúdo do cartão (ementa, presenças, reviews/recomendações) mas com mais espaço, e é a mesma informação em tempo real (não é uma cópia separada).
- **Sugestões quando não há ementa**: se o dia ainda não tem ementa escrita, o painel destaca as recomendações já deixadas por outras pessoas (`day-feedback`, tipo `recommendation`) como sugestões, com um botão para preencher a ementa diretamente com uma delas.
- O cartão em si não muda de conteúdo — só ganha a possibilidade de abrir o painel.

## Capabilities

### New Capabilities
- `day-detail-panel`: painel de detalhe por dia, aberto ao clicar no cartão, incluindo sugestões automáticas a partir de recomendações existentes quando a ementa está vazia.

### Modified Capabilities
(nenhuma — não há specs arquivadas ainda)

## Impact

- **`assets/app.js`**: novo estado de painel aberto/fechado, nova função de abertura ao clicar no cartão (ignorando cliques em elementos interativos), novo bloco de sugestões que lê as entradas `recommendation` já existentes do `day-feedback`.
- **`assets/styles.css`**: estilos do painel/modal e do bloco de sugestões.
- **`index.html`**: um novo contentor para o painel, escondido por omissão.
- Sem alterações a `database.rules.json` ou à Realtime Database — reutiliza dados já existentes (`ementas`, `reviews`).
