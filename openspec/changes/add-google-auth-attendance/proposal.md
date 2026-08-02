## Why

Hoje ninguém sabe, antes do jantar, quantas pessoas realmente vão aparecer — isso continua a resolver-se por fora (grupo de WhatsApp). A app já sabe quem cozinha e o que se vai comer; falta saber quantos lugares pôr na mesa. Para isso é preciso, pela primeira vez, saber **quem** está a usar a app (não só o que escreveu), o que exige substituir o acesso anónimo atual por login com Google.

## What Changes

- **BREAKING**: o acesso deixa de ser anónimo/aberto — passa a ser **obrigatório iniciar sessão com Google** para ver ou editar qualquer parte do site (escala, ementas, reviews). Isto substitui o `signInAnonymously` usado hoje em todas as funcionalidades existentes.
- Novo ecrã de acesso ("Entrar com Google") que bloqueia o resto da app até haver sessão iniciada.
- No primeiro login, cada conta define quantas pessoas representa por omissão (ex: um pai que representa 3 — ele, a parceira e um filho sem conta própria).
- Cada dia passa a ter uma contagem total de presenças: soma das pessoas representadas por cada conta que confirma esse dia (usando o valor por omissão da conta, ajustável por dia — reduzir para menos, ou aumentar para trazer convidados extra), com as contas que declinam a contribuir 0 nesse dia.
- O cartão de cada dia mostra essa contagem total (um único número somado, não mais um "X/5").
- Sincronização em tempo real via Firebase, como as restantes funcionalidades.

## Capabilities

### New Capabilities
- `google-auth`: portão de acesso obrigatório via Google Sign-In, com perfil de conta (nome, email, número de pessoas representadas por omissão).
- `day-attendance`: contagem de presenças por dia, com ajuste por conta (reduzir, declinar, ou trazer convidados extra), agregada num total visível no cartão do dia.

### Modified Capabilities
(nenhuma — não há specs arquivadas ainda; `day-feedback` continua por arquivar e não muda de comportamento com esta alteração)

## Impact

- **`assets/app.js`**: substituição do arranque atual (`signInAnonymously` sempre ativo) por um portão de autenticação (`onAuthStateChanged`, `signInWithPopup` com `GoogleAuthProvider`) que condiciona o resto do boot; novo estado `currentUser`/perfil; novo estado `attendance` por dia; nova UI de badge de contagem no cartão e um controlo mínimo para a própria conta ajustar a sua contagem desse dia (substituído mais tarde pelo painel de detalhe da Fase 2).
- **`assets/firebase-config.js`**: sem alterações de credenciais — já suporta autenticação, só passa a usar-se o provider Google em vez de anónimo.
- **`database.rules.json`**: novos nós `users/<uid>` (perfil, só o próprio uid lê/escreve) e `attendance/<periodo>/<dia>/<uid>` (leitura por qualquer autenticado, escrita só pelo próprio uid).
- **`assets/styles.css`**: estilos do ecrã de login, do badge de contagem, e do controlo de ajuste.
- **Firebase Console**: ativar o provider "Google" em Authentication → Sign-in method (passo manual do utilizador, como já foi feito para o anónimo).
- **Comportamento existente** (`ementas`, `reviews`/`day-feedback`): sem alterações de regras ou de dados — continuam a exigir apenas `auth != null`, que passa a ser satisfeito pela sessão Google em vez da anónima.
