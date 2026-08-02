## 1. Regras da base de dados

- [x] 1.1 Adicionar o nó `reviews` a `database.rules.json`: leitura/escrita para `auth != null`, e `.validate` por entrada exigindo `type` em `["review","recommendation"]`, `text` string até 500 caracteres, `stars` inteiro 1-5 presente apenas quando `type == "review"` e ausente quando `type == "recommendation"`, e `ts` número.
- [ ] 1.2 Publicar as novas regras na consola Firebase (manual, como já é feito para as regras atuais) e confirmar leitura/escrita de teste. **(por fazer pelo utilizador)**

## 2. Estado e persistência em `assets/app.js`

- [x] 2.1 Adicionar estado `feedback` (mapa `dayId -> { entryId -> entry }`) ao lado do `menus` existente.
- [x] 2.2 Estender `localBackend()` com `startFeedback`/`writeFeedback` equivalentes, guardando num segundo `localStorage` key (ex: `nortada-feedback-2026-08`), com geração de `entryId` local (`Date.now() + Math.random()`).
- [x] 2.3 Estender `firebaseBackend()` com leitura em tempo real (`onValue`) do nó `reviews/<DB_PATH_PERIODO>` e escrita via `push`/`update` para uma nova entrada, mantendo o mesmo padrão de `start`/`write` já usado para `menus`.
- [x] 2.4 Atualizar `boot()` para arrancar também o canal de feedback (reaproveitando o mesmo backend escolhido — Firebase ou local).

## 3. Interface no card do dia

- [x] 3.1 Em `buildCard`, adicionar uma secção "Reviews e recomendações" com: lista das entradas existentes (ordenadas por `ts`), mostrando estrelas quando `type === "review"` e o texto quando presente.
- [x] 3.2 Adicionar o formulário de nova entrada: seletor de tipo (Review / Recomendação), seletor de estrelas (1-5, só visível/obrigatório para Review), campo de texto (opcional em Review, obrigatório em Recomendação), botão "Adicionar".
- [x] 3.3 Validação no cliente antes de submeter: bloquear Review sem estrelas escolhidas e Recomendação com texto vazio (ver cenários da spec `day-feedback`).
- [x] 3.4 Atualizar a lista em tempo real quando chegam entradas novas de outra pessoa (equivalente ao `applyRemote` já existente para `menus`).

## 4. Estilos

- [x] 4.1 Adicionar a `assets/styles.css` os estilos da nova secção: lista de entradas, indicador de estrelas, formulário compacto, estado vazio — consistentes com o estilo minimalista existente (mesma paleta/tipografia).

## 5. Resumo no texto copiado

- [x] 5.1 Atualizar o handler do botão "Copiar escala para o grupo" em `assets/app.js` para incluir, por dia, a média de estrelas (1 casa decimal) quando existirem reviews, e a contagem de recomendações quando existirem, omitindo a linha quando não há nenhuma entrada.

## 6. Verificação

- [ ] 6.1 Testar localmente (`python3 -m http.server`) em modo local (sem Firebase configurado): adicionar review e recomendação, confirmar persistência em `localStorage` e reload da página. **(por fazer pelo utilizador — sem browser interativo disponível nesta sessão)**
- [ ] 6.2 Testar com Firebase configurado: duas abas/dispositivos, confirmar sincronização em tempo real de uma nova entrada. **(por fazer pelo utilizador)**
- [ ] 6.3 Confirmar que o texto copiado inclui o resumo correto para um dia com reviews+recomendações e omite a linha num dia sem nenhuma. **(por fazer pelo utilizador)**
- [ ] 6.4 Rever `database.rules.json` publicado na consola contra o ficheiro no repo (evitar drift entre o que está commitado e o que está publicado). **(por fazer pelo utilizador)**
