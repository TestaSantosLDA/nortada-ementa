// Configuração do projeto Firebase.
// Copia estes valores da Consola Firebase:
//   Definições do projeto → As tuas apps → App web → Configuração do SDK
//
// Enquanto os valores forem os placeholders abaixo, o quadro funciona
// em modo local (só guarda no browser de cada pessoa).

export const firebaseConfig = {
  apiKey: "AIzaSyBPZjhNBovy9nOvt-2PpvBjcmsYc4aqEUk",
  authDomain: "ementa-nortada.firebaseapp.com",
  databaseURL: "https://ementa-nortada-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "ementa-nortada",
  storageBucket: "ementa-nortada.firebasestorage.app",
  messagingSenderId: "586654751671",
  appId: "1:586654751671:web:2318916d3e35fcede1a632"
};

// Caminho onde as ementas ficam guardadas na base de dados.
export const DB_PATH = "ementas/2026-08";
