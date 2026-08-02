## 1. Regras

- [x] 1.1 Nó `cookOverrides` em `database.rules.json`: leitura no topo, escrita autenticada por `$dia`, validar `uid`/`prevUid`/`by`/`ts`; publicar.

## 2. Estado e aplicação

- [x] 2.1 Listener de `cookOverrides` + regeneração da escala quando muda.
- [x] 2.2 Aplicar overrides depois de `buildDays`, com fallback se o uid não estiver na rotação.

## 3. UI de troca

- [x] 3.1 Secção "Trocar cozinheiro" no painel de dias futuros: seletor de outro dia futuro + botão; escrita atómica dos dois overrides com registo.
- [x] 3.2 Nota "Dia trocado: A ⇄ B" no painel de dias trocados.
- [x] 3.3 Estilos.

## 4. Verificação

- [x] 4.1 Sintaxe verificada, app carrega localmente; commit e push.
