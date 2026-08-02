## 1. Regras da base de dados

- [x] 1.1 Adicionar `users/$uid` a `database.rules.json`: leitura/escrita só pelo próprio (`auth.uid == $uid`), validar `name` (string), `householdSize` (inteiro 1-20), `ts` (número).
- [x] 1.2 Adicionar `attendance/$periodo/$dia/$uid` a `database.rules.json`: leitura para qualquer `auth != null`, escrita só pelo próprio (`auth.uid == $uid`), validar `count` (inteiro >= 0) e `ts` (número).
- [ ] 1.3 Publicar as regras atualizadas na consola Firebase. **(por fazer pelo utilizador)**

## 2. Ativar o provider Google

- [ ] 2.1 Documentar/lembrar o passo manual: ativar "Google" em Firebase Console → Authentication → Sign-in method. **(por fazer pelo utilizador)**

## 3. Portão de login em `assets/app.js`

- [x] 3.1 Substituir `signInAnonymously` por `GoogleAuthProvider` + `signInWithPopup`, com `onAuthStateChanged` a controlar o arranque.
- [x] 3.2 Adicionar ao `index.html`/render inicial um ecrã de login (botão "Entrar com Google") mostrado enquanto não há sessão, escondendo o resto da app.
- [x] 3.3 Ao autenticar, ler `users/<uid>`; se não existir, mostrar um pequeno formulário "Quantas pessoas vais representar habitualmente?" e gravar o perfil antes de prosseguir.
- [x] 3.4 Tratar falha de login/Firebase não configurado com uma mensagem de erro clara, sem fallback local (ver design.md).

## 4. Estado e persistência de presenças

- [x] 4.1 Adicionar estado `attendance` (mapa `dayId -> { uid -> {count, ts} }`) e `profiles` (mapa `uid -> {name, householdSize}`), sincronizados em tempo real via `onValue`.
- [x] 4.2 Implementar escrita do próprio `count` por dia (`update`/`set` em `attendance/<periodo>/<dia>/<uid>`).
- [x] 4.3 Calcular o total por dia: soma, para cada uid com perfil, do `count` desse dia se existir, senão o `householdSize` do perfil.

## 5. UI no cartão do dia

- [x] 5.1 Mostrar o badge de contagem total no cartão de cada dia.
- [x] 5.2 Adicionar um controlo mínimo (stepper + botão "Não vou") para a conta autenticada ajustar o seu próprio número nesse dia.

## 6. Estilos

- [x] 6.1 Estilizar o ecrã de login (botão Google, mensagem de erro).
- [x] 6.2 Estilizar o formulário de perfil (primeiro login).
- [x] 6.3 Estilizar o badge de contagem e o controlo de ajuste no cartão.

## 7. Verificação

- [ ] 7.1 Confirmar que sem sessão iniciada não é possível ver nem editar nada (ementas, reviews, presenças). **(por fazer pelo utilizador — sem browser interativo disponível nesta sessão)**
- [ ] 7.2 Testar o fluxo de primeiro login (perfil novo) e de login subsequente (perfil já existe, sem novo prompt). **(por fazer pelo utilizador)**
- [ ] 7.3 Testar declinar (0), reduzir parcialmente, e adicionar convidados extra num dia, e confirmar o total no cartão. **(por fazer pelo utilizador)**
- [ ] 7.4 Confirmar sincronização em tempo real entre duas sessões/dispositivos. **(por fazer pelo utilizador)**
- [ ] 7.5 Confirmar que uma conta não consegue escrever no `attendance`/`users` de outro uid (testar diretamente contra as rules, se possível). **(por fazer pelo utilizador)**
