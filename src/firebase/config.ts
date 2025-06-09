import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Configuração do Firebase
// Usando as mesmas credenciais que você já tem para hospedagem
const firebaseConfig = {
  apiKey: "AIzaSyCq3isiwLlvZU77xB373GOzhdE7yvbaRSY",
  authDomain: "prospector-b24a7.firebaseapp.com",
  databaseURL: "https://prospector-b24a7-default-rtdb.firebaseio.com",
  projectId: "prospector-b24a7",
  storageBucket: "prospector-b24a7.firebasestorage.app",
  messagingSenderId: "82177622886",
  appId: "1:82177622886:web:9ef09652cce7240b0c3ea7",
  measurementId: "G-MBQ3VDS6QN"
};

// Inicializar o Firebase
const app = initializeApp(firebaseConfig);

// Exportar os serviços do Firebase
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
