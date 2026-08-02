## Context

Hoje o arranque da app (`boot()` em `assets/app.js`) chama sempre `signInAnonymously`, sem pedir nada a ninguém — quem abre o site já pode ler/escrever ementas e feedback. Quando o Firebase não está configurado ou a ligação falha, a app degrada para `localStorage` (`isConfigured()` / `localBackend()`), mantendo tudo a funcionar só nesse dispositivo. Esta alteração introduz pela primeira vez uma identidade real (conta Google) e torna o login uma condição para usar a app.

## Goals / Non-Goals

**Goals:**
- Login obrigatório com Google antes de ver ou editar qualquer parte do site.
- Cada conta define, no primeiro login, quantas pessoas representa por omissão.
- Contagem de presenças por dia como um único número somado (pessoas representadas pelas contas confirmadas, ajustadas por dia, menos as que declinam).
- Manter tudo o resto (ementas, reviews/recomendações da capability `day-feedback`) a funcionar exatamente como hoje por baixo, só a trocar o mecanismo de autenticação.

**Non-Goals (fica para fases seguintes):**
- Painel de detalhe ao clicar no cartão (Fase 2) — nesta fase o ajuste de presença é feito através de um controlo mínimo no próprio cartão, não um painel completo.
- Administração de quais as contas que fazem parte da rotação de cozinheiros e do intervalo de datas da escala (Fase 3).
- Notificações, convites, ou gestão de quem pode fazer login (qualquer conta Google pode entrar e criar perfil — não há lista de convidados nesta fase).

## Decisions

**Fim do fallback local para o portão de entrada.** Hoje, sem Firebase configurado, a app funciona inteiramente em modo local anónimo. Isso deixa de fazer sentido quando a identidade é central (presenças são por conta). Decisão: o ecrã de login **não** tem fallback local — se o Google Sign-In falhar ou o Firebase não estiver configurado, mostra-se um erro claro em vez de degradar para modo local. O fallback local que já existe para escrita de ementas/reviews (quando a *leitura/escrita* falha depois de já se estar autenticado) mantém-se inalterado — é um problema diferente (ligação instável) de "não há login".
*Isto é uma mudança de espírito face ao site atual (sempre aberto, sem fricção) — fica sinalizado como risco abaixo, por favor confirma que é mesmo isto que queres antes de eu implementar.*

**Perfil de conta em vez de mapear para as 5 pessoas fixas.** Em vez de ligar uma conta Google a "Francisco/Luís/Afonso/Inês/João", cada conta cria o seu próprio perfil (`users/<uid>`) com nome/email do Google e um número de pessoas que representa por omissão (`householdSize`). Isto cobre diretamente o caso descrito (pai com conta própria representando crianças sem conta). A lista fixa `PEOPLE` em `app.js` continua a existir só para a rotação de quem cozinha (não muda nesta fase); a conta que confirma presença é independente de quem cozinha esse dia.

**Contagem por dia como override de um valor por omissão.** Cada conta tem um `householdSize` (perfil). Por omissão, em qualquer dia, contribui esse valor para o total. A conta pode substituir esse valor só para um dia específico (`attendance/<periodo>/<dia>/<uid>.count`): pôr a 0 (não vai), reduzir (só alguns do agregado vão) ou aumentar (traz convidados extra). Alternativa considerada: campos separados `status` + `extraGuests` + `alsoNotComing` — rejeitada por ser mais complexa sem ganho real, já que um único número "quantos venho eu representar hoje" cobre todos os casos descritos.

**Total do dia = soma de todas as contas com perfil criado.** Nesta fase, sem administração de participantes (Fase 3), o total soma o `count` do dia (ou o `householdSize` por omissão) de **todas** as contas que já criaram perfil, mesmo que nunca venham a cozinhar. Isto é uma simplificação deliberada — quando a Fase 3 (administração) existir, poderá introduzir-se um sinalizador "participa" por conta para restringir a soma.

**Interação mínima nesta fase.** O cartão mostra o total e, para a própria conta, um controlo simples (stepper + "não vou") para ajustar o seu número desse dia — nada de painel ou popup ainda (isso é a Fase 2, que substituirá este controlo).

## Risks / Trade-offs

- **[Risco] Login obrigatório é uma mudança grande de espírito (de aberto para fechado) e pode ser mais fricção do que a família quer.** Mitigação: nenhuma automática — é uma decisão de produto tua; o design assume que sim porque foi o que pediste, mas fica documentado aqui para revisitares se, na prática, achares que é fricção a mais.
- **[Risco] Qualquer conta Google pode entrar e criar perfil (sem lista de convidados).** Mitigação: aceitável para uma app familiar de baixo risco; pode endurecer-se mais tarde com uma lista de emails permitidos nas rules, se vier a ser preciso.
- **[Risco] Somar todas as contas com perfil (sem filtrar por "participa") pode inflacionar o total se alguém de fora da família criar conta por engano.** Mitigação: aceitável nesta fase; a Fase 3 resolve isto com administração explícita.

## Migration Plan

- Ativar o provider "Google" em Firebase Console → Authentication → Sign-in method (manual, como o anónimo foi ativado antes).
- Publicar as novas regras (`users`, `attendance`) em `database.rules.json`.
- Deploy do código via push normal para `main` → GitHub Pages.
- Não há dados anónimos a migrar (a app não guardava identidade de quem escrevia ementas/reviews, e isso não muda).
- Rollback: reverter o commit reativa `signInAnonymously`; os nós `users`/`attendance` ficam órfãos mas não interferem com `ementas`/`reviews`.

## Open Questions

- Confirmar que "login obrigatório para tudo" (incluindo só ver a escala) é mesmo a intenção, dado que é a maior mudança de comportamento desta fase.
