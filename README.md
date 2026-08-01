# nortada-ementa

Escala de jantares da família, com a ementa de cada dia preenchida por quem cozinha.

**Online:** https://testasantoslda.github.io/nortada-ementa/

## Como funciona

Página estática, sem build. As ementas são guardadas no Firebase Realtime Database
e sincronizam em tempo real entre todos os que tiverem o quadro aberto. Sem Firebase
configurado, a página continua a funcionar em modo local (`localStorage`, só no
dispositivo de cada pessoa).

```
index.html                    página
assets/styles.css             estilos
assets/app.js                 escala, render e sincronização
assets/firebase-config.js     credenciais do projeto  ← editar
database.rules.json           regras de segurança da base de dados
```

## Setup do Firebase

1. Criar projeto em https://console.firebase.google.com (plano Spark, gratuito).
   Podes desativar o Google Analytics, não é preciso.
2. **Build → Realtime Database → Criar base de dados.** Escolher a região
   `europe-west1` e arrancar em *modo bloqueado*.
3. **Build → Authentication → Sign-in method → Anónimo → Ativar.**
4. **Definições do projeto → As tuas apps → Web (`</>`)** → registar a app e copiar
   o objeto `firebaseConfig` para `assets/firebase-config.js`.
5. **Realtime Database → Regras** → colar o conteúdo de `database.rules.json` e publicar.
6. **Authentication → Definições → Domínios autorizados** → adicionar
   `testasantoslda.github.io`.

## Deploy

```bash
git clone https://github.com/TestaSantosLDA/nortada-ementa.git
cd nortada-ementa
# copiar os ficheiros para aqui
git add .
git commit -m "Escala de jantares de agosto"
git push
```

Depois, em **Settings → Pages → Source: Deploy from a branch → `main` / `(root)`**.
Fica online em 1–2 minutos. Cada `push` para `main` republica.

## Mudar de quinzena

Editar o array `DAYS` em `assets/app.js` e a constante `DB_PATH` em
`assets/firebase-config.js` (por exemplo `ementas/2026-09`), para as ementas
novas não se misturarem com as antigas.

## Nota sobre segurança

O `firebaseConfig` não é um segredo — identifica o projeto, não dá acesso.
Quem protege os dados são as regras. Com autenticação anónima, qualquer pessoa
que encontre este repositório consegue ler e escrever no nó `ementas`. Para uma
escala de jantares em família isso é aceitável; para dados sensíveis não seria.
