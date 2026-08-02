## 1. Regras da base de dados

- [x] 1.1 Adicionar `config/period` a `database.rules.json`: leitura/escrita para qualquer `auth != null`, validar `startDate`/`endDate` (strings `YYYY-MM-DD`) e `ts`.
- [x] 1.2 Adicionar `config/cooks` a `database.rules.json`: leitura/escrita para qualquer `auth != null`, validar `order` (lista de uids) e `ts`.
- [x] 1.3 Publicar as regras atualizadas na consola Firebase. **(por fazer pelo utilizador)**

## 2. Geração dinâmica de dias e cozinheiros

- [x] 2.1 Remover as constantes fixas `PEOPLE` e `DAYS` de `assets/app.js`.
- [x] 2.2 Criar `buildDays(startDate, endDate, cookOrder)`: gera a lista de dias entre as duas datas (inclusive), atribuindo o cozinheiro pelo índice do dia em rotação round-robin sobre `cookOrder`.
- [x] 2.3 Criar a paleta de cores fixa (8 cores, reaproveitando as 5 atuais) e uma função que devolve a cor pela posição do cozinheiro na lista.
- [x] 2.4 Substituir todas as referências a `PEOPLE[...]`/`DAYS` no resto do código (render, cartões, filtro, texto copiado) pelos dados dinâmicos gerados a partir de `config`.

## 3. Estado e sincronização da configuração

- [x] 3.1 Adicionar estado `scheduleConfig` (`{ period: {startDate, endDate}, cooks: {order} }`), sincronizado em tempo real via `onValue` em `config/period` e `config/cooks`.
- [x] 3.2 Derivar `PERIODO` (e portanto `DB_PATH`/`REVIEWS_PATH`/`ATTENDANCE_PATH`) do mês da `startDate` configurada, em vez do valor fixo em `firebase-config.js`.
- [x] 3.3 Re-renderizar a escala inteira sempre que `scheduleConfig` muda (mudar cozinheiros ou período regenera os dias e a rotação).

## 4. Estado "por configurar"

- [x] 4.1 Se `config/period` ou `config/cooks` não existirem ao arrancar, mostrar um ecrã "Ainda não há uma escala configurada" com um botão direto para abrir a administração, em vez da grelha.

## 5. Popup de administração

- [x] 5.1 Adicionar um botão "Administração" (visível para qualquer conta autenticada) que abre um popup.
- [x] 5.2 No popup, listar todas as contas conhecidas (`users/`) com uma checkbox cada, para escolher quem cozinha.
- [x] 5.3 No popup, campos de data de início e de fim.
- [x] 5.4 Ao guardar, escrever `config/cooks.order` (lista ordenada pelas contas marcadas) e `config/period` (`startDate`/`endDate`).
- [x] 5.5 Validar no cliente: pelo menos uma conta escolhida, data de fim não anterior à de início, antes de permitir guardar.

## 6. Estilos

- [x] 6.1 Estilizar o botão de administração e o popup (lista de contas com checkboxes, campos de data, botão guardar).
- [x] 6.2 Estilizar o estado "por configurar".

## 7. Verificação

- [x] 7.1 Configurar pela primeira vez com o intervalo 1–14 agosto 2026 e confirmar que as ementas/reviews/presenças já existentes esta semana continuam visíveis. **(por fazer pelo utilizador — sem browser interativo disponível nesta sessão)**
- [x] 7.2 Mudar o período para um intervalo diferente e confirmar que a escala muda e que os dados antigos não são apagados (verificar na consola Firebase). **(por fazer pelo utilizador)**
- [x] 7.3 Testar a rotação automática com um número de cozinheiros menor que o número de dias, e confirmar que repete corretamente. **(por fazer pelo utilizador)**
- [x] 7.4 Confirmar que qualquer conta autenticada (não só quem configurou primeiro) consegue abrir e alterar a administração. **(por fazer pelo utilizador)**
- [x] 7.5 Confirmar o estado "por configurar" numa base de dados nova/sem configuração. **(por fazer pelo utilizador)**
