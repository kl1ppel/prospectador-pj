import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInAnonymously,
  signOut,
  sendPasswordResetEmail,
  confirmPasswordReset,
  UserCredential,
  User
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from './config';

export interface AuthResponse {
  success: boolean;
  user?: any;
  error?: string;
}

export const firebaseAuthService = {
  // Registrar novo usuário
  register: async (name: string, email: string, password: string): Promise<AuthResponse> => {
    try {
      // Criar usuário no Firebase Auth
      const userCredential: UserCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Adicionar dados do usuário no Firestore
      await setDoc(doc(db, 'users', user.uid), {
        name,
        email,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      
      // Formatar resposta
      const userData = {
        id: user.uid,
        name,
        email,
        token: await user.getIdToken()
      };
      
      // Salvar no localStorage para compatibilidade com o código existente
      localStorage.setItem('prospect_user', JSON.stringify(userData));
      
      return {
        success: true,
        user: userData
      };
    } catch (error: any) {
      console.error('Erro no registro:', error);
      
      let errorMessage = 'Erro ao registrar usuário';
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'Este email já está em uso';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'A senha deve ter pelo menos 6 caracteres';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Email inválido';
      }
      
      return {
        success: false,
        error: errorMessage
      };
    }
  },

  // Login anônimo
  loginAnonymously: async (): Promise<AuthResponse> => {
    try {
      const userCredential: UserCredential = await signInAnonymously(auth);
      const user = userCredential.user;

      // Criar ou atualizar documento no Firestore
      await setDoc(doc(db, 'users', user.uid), {
        name: 'Visitante',
        email: '',
        anonymous: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      const userInfo = {
        id: user.uid,
        name: 'Visitante',
        email: '',
        token: await user.getIdToken()
      };

      localStorage.setItem('prospect_user', JSON.stringify(userInfo));

      return { success: true, user: userInfo };
    } catch (error: any) {
      console.error('Erro no login anônimo:', error);
      let errorMessage = 'Erro ao entrar como anônimo';
      if (error.code === 'auth/operation-not-allowed') {
        errorMessage = 'Login anônimo não está habilitado';
      } else if (error.code === 'auth/network-request-failed') {
        errorMessage = 'Erro de conexão. Verifique sua internet';
      }
      return { success: false, error: errorMessage };
    }
  },
  
  // Login de usuário
  login: async (email: string, password: string): Promise<AuthResponse> => {
    try {
      console.log('Tentando login para:', email);
      
      // Autenticar com Firebase
      const userCredential: UserCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      console.log('Login bem-sucedido, obtendo dados do Firestore para:', user.uid);
      
      // Obter dados adicionais do Firestore
      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);
      
      // Verificar se o documento existe no Firestore
      if (!userDoc.exists()) {
        console.log('Documento do usuário não existe no Firestore, criando agora');
        
        // Se o usuário não existir no Firestore (mas existe no Auth), criar o documento
        await setDoc(userDocRef, {
          name: user.displayName || email.split('@')[0],
          email: user.email,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
        
        // Usar os dados do auth diretamente
        const userInfo = {
          id: user.uid,
          name: user.displayName || email.split('@')[0],
          email: user.email || '',
          token: await user.getIdToken()
        };
        
        // Salvar no localStorage
        localStorage.setItem('prospect_user', JSON.stringify(userInfo));
        
        return {
          success: true,
          user: userInfo
        };
      }
      
      // Se o documento existe, usar os dados do Firestore
      const userData = userDoc.data();
      console.log('Dados do usuário obtidos do Firestore:', userData);
      
      // Formatar resposta
      const userInfo = {
        id: user.uid,
        name: userData?.name || user.displayName || '',
        email: user.email || '',
        token: await user.getIdToken()
      };
      
      // Salvar no localStorage para compatibilidade
      localStorage.setItem('prospect_user', JSON.stringify(userInfo));
      
      return {
        success: true,
        user: userInfo
      };
    } catch (error: any) {
      console.error('Erro no login:', error);
      
      let errorMessage = 'Erro ao fazer login';
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        errorMessage = 'Email ou senha incorretos';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Muitas tentativas de login. Tente novamente mais tarde';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Formato de email inválido';
      } else if (error.code === 'auth/user-disabled') {
        errorMessage = 'Usuário desativado. Contacte o administrador';
      } else if (error.code === 'auth/network-request-failed') {
        errorMessage = 'Erro de conexão. Verifique sua internet';
      } else {
        // Registrar o erro exato no console para debug
        console.error('Código do erro:', error.code);
        console.error('Mensagem do erro:', error.message);
      }
      
      return {
        success: false,
        error: errorMessage
      };
    }
  },
  
  // Logout
  logout: async (): Promise<void> => {
    await signOut(auth);
    localStorage.removeItem('prospect_user');
  },
  
  // Obter usuário atual
  getCurrentUser: (): User | null => {
    return auth.currentUser;
  },
  
  // Obter dados do usuário atual do localStorage (para compatibilidade)
  getCurrentUserData: () => {
    const user = localStorage.getItem('prospect_user');
    return user ? JSON.parse(user) : null;
  },
  
  // Solicitar redefinição de senha
  forgotPassword: async (email: string): Promise<AuthResponse> => {
    try {
      console.log('Enviando email de redefinição para:', email);
      
      // Adicionar configurações adicionais para o email
      const actionCodeSettings = {
        // URL para redirecionar após o usuário clicar no link
        url: 'https://prospector-b24a7.web.app/reset-password',
        // Manipular código no navegador em vez de redirecionar para app mobile
        handleCodeInApp: false
      };
      
      // Enviar email com configurações
      await sendPasswordResetEmail(auth, email, actionCodeSettings);
      
      return {
        success: true
      };
    } catch (error: any) {
      console.error('Erro ao solicitar redefinição de senha:', error);
      
      let errorMessage = 'Erro ao solicitar redefinição de senha';
      if (error.code === 'auth/user-not-found') {
        errorMessage = 'Não há usuário registrado com este email';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Email inválido';
      } else if (error.code === 'auth/missing-android-pkg-name') {
        errorMessage = 'Erro na configuração do Firebase. Contacte o suporte.';
      } else {
        // Registrar o erro exato no console para debug
        console.error('Código do erro:', error.code);
        console.error('Mensagem do erro:', error.message);
      }
      
      return {
        success: false,
        error: errorMessage
      };
    }
  },
  
  // Redefinir senha
  resetPassword: async (oobCode: string, newPassword: string): Promise<AuthResponse> => {
    try {
      await confirmPasswordReset(auth, oobCode, newPassword);
      return {
        success: true
      };
    } catch (error: any) {
      console.error('Erro ao redefinir senha:', error);
      
      let errorMessage = 'Erro ao redefinir senha';
      if (error.code === 'auth/expired-action-code') {
        errorMessage = 'O link de redefinição expirou ou já foi usado';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'A senha deve ter pelo menos 6 caracteres';
      }
      
      return {
        success: false,
        error: errorMessage
      };
    }
  }
};

export default firebaseAuthService;
