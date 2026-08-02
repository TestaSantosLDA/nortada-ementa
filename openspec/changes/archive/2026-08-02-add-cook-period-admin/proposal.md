## Why

Hoje quem cozinha cada dia (`PEOPLE`) e o próprio intervalo de datas da escala (`DAYS`, fixo a 1–14 de agosto de 2026) estão escritos diretamente no código (`assets/app.js`). Agora que existe login Google real, isso pode passar a ser configurado por quem usa a app, sem precisar de mexer no código nem pedir a um programador — basta escolher as contas que vão cozinhar e o intervalo de datas.

## What Changes

- **BREAKING**: `PEOPLE` e `DAYS` deixam de ser constantes fixas — passam a ser gerados a partir de configuração guardada no Firebase (`config/cooks`, `config/period`).
- Novo botão "Administração" que abre um popup para: (a) escolher, de entre as contas já conhecidas (que já fizeram login alguma vez), quais cozinham; (b) escolher a data de início e de fim da escala.
- A atribuição de quem cozinha cada dia passa a ser **automática**: rotação round-robin pelas contas escolhidas, ao longo do intervalo de datas configurado.
- Qualquer conta autenticada pode abrir a administração e alterar a configuração (sem conceito de admin separado, igual ao resto da app).
- Se ainda não houver configuração nenhuma, a app mostra um estado "por configurar" com um atalho direto para abrir a administração, em vez de uma grelha vazia.
- Mudar o período **não apaga** dados de períodos anteriores — ficam arquivados no Firebase, só deixam de aparecer na app (sem seletor de períodos passados nesta fase).

## Capabilities

### New Capabilities
- `schedule-admin`: configuração de cozinheiros e período via popup, com rotação automática e estado "por configurar".

### Modified Capabilities
(nenhuma — não há specs arquivadas ainda; `google-auth`, `day-attendance`, `day-feedback`, `day-detail-panel` continuam por arquivar e não mudam de comportamento com esta alteração, exceto na origem de `PEOPLE`/`DAYS`, que passa a ser dinâmica em vez de fixa)

## Impact

- **`assets/app.js`**: remove as constantes fixas `PEOPLE`/`DAYS`; adiciona leitura de `config/period` e `config/cooks`, geração dinâmica dos dias e da rotação, o popup de administração, e o estado "por configurar".
- **`database.rules.json`**: novo nó `config` (leitura para qualquer autenticado, escrita para qualquer autenticado, com validação de forma).
- **`assets/styles.css`**: estilos do botão de administração, do popup, e do estado "por configurar".
- **Continuidade de dados**: o `periodo` usado para guardar ementas/reviews/presenças passa a derivar do mês da data de início escolhida (ex: início a 2026-08-01 → periodo "2026-08", exatamente como hoje) — para que a configuração inicial, se reproduzir o intervalo atual (1–14 agosto), continue a mostrar os dados já introduzidos esta semana, sem perda nem migração manual.
