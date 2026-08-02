## Context

O site é estático (sem build, sem npm) e usa Firebase Realtime Database para sincronizar dados em tempo real, com fallback para `localStorage` quando o Firebase não está configurado (ver `assets/firebase-config.js` / `isConfigured()` em `assets/app.js`). Hoje só existe um valor por dia (`menus[dayId]`, texto livre) guardado em `DB_PATH = "ementas/2026-08"`. A nova funcionalidade introduz uma coleção (várias entradas por dia), o que é um formato diferente do campo único atual.

## Goals / Non-Goals

**Goals:**
- Permitir múltiplas entradas de feedback por dia, dos tipos `review` (estrelas 1-5 obrigatórias + texto opcional) e `recommendation` (só texto).
- Sincronizar em tempo real entre dispositivos via Firebase, com fallback local, reutilizando o padrão de `backend.start`/`backend.write` já existente.
- Manter tudo anónimo — sem autenticação por pessoa, sem nomes associados às entradas.

**Non-Goals:**
- Não há edição nem remoção de entradas nesta fase (só criação) — evita lidar com "quem pode apagar o quê" sendo tudo anónimo.
- Não há moderação/filtragem de conteúdo.
- Não se altera o modelo de autoria da ementa em si (continua um campo de texto único por dia, preenchido por quem cozinha).

## Decisions

**Estrutura de dados**: `reviews/<periodo>/<dia>/<entryId>` em vez de reaproveitar o nó `ementas`. Cada entrada:
```
{
  type: "review" | "recommendation",
  stars: 1-5 | null,   // obrigatório só quando type === "review"
  text: string,        // opcional em review, obrigatório em recommendation
  ts: number           // Date.now(), usado para ordenar
}
```
Alternativa considerada: guardar tudo dentro do nó existente `ementas/<periodo>/<dia>` como um sub-campo. Rejeitada porque a validação atual desse nó exige que o valor seja uma string (`newData.isString()`), e misturar tipos no mesmo nó tornaria as regras mais frágeis. Um nó irmão (`reviews/...`) mantém as regras de `ementas` intactas e isoladas.

**IDs de entrada**: gerados no cliente com `push()` do Firebase (chave cronológica única), com equivalente simples (`timestamp + random`) no backend local. Alternativa considerada: array em vez de mapa de IDs — rejeitada porque updates concorrentes num array (duas pessoas a escrever ao mesmo tempo) causam condições de corrida; um mapa por ID evita isso, tal como o Firebase recomenda.

**Sem autoria**: nenhuma pessoa/nome é gravado com a entrada, indo ao encontro do pedido explícito de anonimato. Isto simplifica também as regras (não há "só o autor pode apagar").

**UI**: nova secção dentro do card do dia (`buildCard`), com (a) lista das entradas existentes ordenada por `ts`, mostrando estrelas quando aplicável, e (b) um pequeno formulário para adicionar uma entrada nova (escolher tipo, estrelas se for review, texto). Reutiliza o padrão visual já existente (cores por pessoa não se aplicam aqui, é neutro).

**Resumo no texto copiado**: o botão "Copiar escala para o grupo" passa a incluir, por dia, a média de estrelas (se existirem reviews) e a contagem de recomendações, sem listar cada comentário individualmente (mantém o texto curto para colar num grupo).

## Risks / Trade-offs

- **[Risco] Sem autoria → impossível remover entradas indevidas de forma seletiva.** Mitigação: fora do âmbito desta fase (Non-Goal); se vier a ser precisa, pode adicionar-se moderação manual via consola Firebase mais tarde.
- **[Risco] Crescimento ilimitado de entradas por dia (spam acidental).** Mitigação: `.validate` nas rules limita `text` a 500 caracteres (mesmo limite da ementa) e o cliente limita a 1 entrada de cada tipo submetida de cada vez (sem batch).
- **[Risco] Regras do Firebase mais permissivas que o necessário (qualquer autenticado pode escrever em qualquer dia).** Mitigação: igual ao comportamento já aceite para `ementas` — está alinhado com o modelo de confiança atual (família fechada, sign-in anónimo).

## Migration Plan

- Alteração aditiva: novo nó `reviews` na Realtime Database, sem tocar em `ementas`. Não há dados existentes para migrar.
- Deploy: `database.rules.json` atualizado e publicado manualmente na consola Firebase (mesmo processo manual já usado), depois `assets/app.js`/`assets/styles.css` publicados via push normal para `main` (GitHub Pages).
- Rollback: reverter o commit; o nó `reviews` fica órfão na base de dados mas não interfere com `ementas`.

## Open Questions

- Nenhuma em aberto — âmbito confirmado com o utilizador (ligado ao dia, estrelas obrigatórias + texto opcional na review, anónimo).
