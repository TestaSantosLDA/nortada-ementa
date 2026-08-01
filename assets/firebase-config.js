// Configuração do projeto Firebase.
// Copia estes valores da Consola Firebase:
//   Definições do projeto → As tuas apps → App web → Configuração do SDK
//
// Enquanto os valores forem os placeholders abaixo, o quadro funciona
// em modo local (só guarda no browser de cada pessoa).

export const firebaseConfig = {
  apiKey: "COLOCAR_AQUI",
  authDomain: "COLOCAR_AQUI.firebaseapp.com",
  databaseURL: "https://COLOCAR_AQUI-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "COLOCAR_AQUI",
  storageBucket: "COLOCAR_AQUI.appspot.com",
  messagingSenderId: "COLOCAR_AQUI",
  appId: "COLOCAR_AQUI"
};

// Caminho onde as ementas ficam guardadas na base de dados.
export const DB_PATH = "ementas/2026-08";
