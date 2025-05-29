import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Configuração do Firebase
// Usando as mesmas credenciais que você já tem para hospedagem
const firebaseConfig = {
  apiKey: "AIzaSyCJ-KQv0OKbg0x0L2WdmnvfXbRJRTwm_p8",
  authDomain: "prospector-b24a7.firebaseapp.com",
  projectId: "prospector-b24a7",
  storageBucket: "prospector-b24a7.appspot.com",
  messagingSenderId: "664487081809",
  appId: "1:664487081809:web:1fc61d74e14efe747f50d7"
};

// Inicializar o Firebase
const app = initializeApp(firebaseConfig);

// Exportar os serviços do Firebase
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;
