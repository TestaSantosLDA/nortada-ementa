# Ideias futuras

## Roleta 2.0 — "apetece-me" e ingredientes (decidido em 2026-08-02, por fazer)

Evoluir a roleta "Sem ideias?" em duas camadas:

1. **Filtros sobre o histórico (sem IA).** Campo de texto + chips de categorias
   (peixe, carne, massa, arroz, sopa, …) derivadas dos nomes dos pratos por
   dicionário de palavras-chave pt-PT. Escrever "bacalhau" ou tocar numa
   categoria restringe o sorteio a pratos correspondentes do histórico. Serve
   para "o que me apetece" e para "o que tenho no frigorífico".

2. **Chef IA (Gemini via Firebase AI Logic).** SDK de cliente que chama o
   Gemini a partir do browser sem expor API key — compatível com as restrições
   da app (sem servidor próprio, free tier). Inputs: o que apetece + ingredientes
   disponíveis + histórico da família com médias de estrelas. Output: 2-3
   sugestões justificadas, incluindo pratos novos fora do histórico.
   Passo prévio na consola Firebase: ativar o AI Logic no projeto
   `ementa-nortada`.

Quando se avançar, criar a change OpenSpec (ex.: `add-roleta-cravings`)
seguindo o fluxo habitual.
