import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { authService } from '../services/api';
import { firebaseAuthService } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase/config';
import { User as FirebaseUser } from 'firebase/auth';

interface User {
  uid: string;
  id: string;
  email: string;
  emailVerified: boolean;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updatePassword: (newPassword: string) => Promise<void>;
  error: string | null;
}

// Interface para armazenar tokens de redefinição de senha
interface PasswordResetToken {
  email: string;
  token: string;
  expiry: number; // timestamp de expiração
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Configurar listener de estado de autenticação do Firebase
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Usuário autenticado no Firebase
        try {
          // Usar serviço de autenticação do Firebase para obter dados adicionais
          const userData = firebaseAuthService.getCurrentUserData();
          
          if (userData) {
            setUser(userData);
          } else {
            // Caso não encontre no localStorage, criar dados básicos
            const basicUserData: User = {
              uid: firebaseUser.uid,
              id: firebaseUser.uid,
              email: firebaseUser.email || '',
              emailVerified: firebaseUser.emailVerified
            };
            setUser(basicUserData);
          }
        } catch (error) {
          console.error('Erro ao obter dados do usuário:', error);
        }
      } else {
        // Usuário não autenticado
        setUser(null);
      }
      setLoading(false);
    });
    
    // Limpar listener quando o componente for desmontado
    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    setError(null);
    
    try {
      setLoading(true);
      
      // Usar o serviço de autenticação do Firebase
      const response = await firebaseAuthService.login(email, password);
      
      if (response.success) {
        setUser(response.user);
      } else {
        setError(response.error || 'Erro ao fazer login');
      }
    } catch (err: any) {
      console.error('Erro durante o login:', err);
      setError(typeof err === 'string' ? err : (err.message || 'Erro desconhecido ao fazer login'));
    } finally {
      setLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string): Promise<void> => {
    setError(null);
    
    try {
      setLoading(true);
      
      // Usar o serviço de autenticação do Firebase
      const response = await firebaseAuthService.register(email, password);
      
      if (response.success) {
        setUser(response.user);
      } else {
        setError(response.error || 'Erro ao registrar usuário');
      }
    } catch (err: any) {
      console.error('Erro durante o registro:', err);
      
      // Tratamento do erro
      if (typeof err === 'string') {
        setError(err);
      } else {
        // Erros do Firebase
        const errorCode = err.code;
        let errorMessage = err.message || 'Erro desconhecido ao registrar usuário';
        
        // Traduzir mensagens comuns do Firebase
        if (errorCode === 'auth/email-already-in-use') {
          errorMessage = 'Este email já está em uso';
        } else if (errorCode === 'auth/weak-password') {
          errorMessage = 'A senha deve ter pelo menos 6 caracteres';
        } else if (errorCode === 'auth/invalid-email') {
          errorMessage = 'Email inválido';
        } else if (errorCode === 'auth/network-request-failed') {
          errorMessage = 'Erro de conexão com a internet. Verifique sua conexão.';
        }
        
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      // Usar o serviço de autenticação do Firebase
      await firebaseAuthService.logout();
      setUser(null);
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  // Função para solicitar redefinição de senha
  const resetPassword = async (email: string): Promise<void> => {
    setError(null);
    
    try {
      setLoading(true);
      
      // Usar o serviço de autenticação do Firebase
      const response = await firebaseAuthService.forgotPassword(email);
      
      if (response.success) {
      } else {
        setError(response.error || 'Erro ao solicitar redefinição de senha');
      }
    } catch (err: any) {
      console.error('Erro ao solicitar redefinição de senha:', err);
      
      // Tratamento do erro
      if (typeof err === 'string') {
        setError(err);
      } else {
        // Erros do Firebase
        const errorCode = err.code;
        let errorMessage = err.message || 'Erro ao solicitar redefinição de senha';
        
        if (errorCode === 'auth/user-not-found') {
          errorMessage = 'Não há usuário registrado com este email';
        } else if (errorCode === 'auth/invalid-email') {
          errorMessage = 'Email inválido';
        }
        
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };
  
  // Função para atualizar a senha usando um token
  const updatePassword = async (newPassword: string): Promise<void> => {
    setError(null);
    
    try {
      setLoading(true);
      
      // Usar o serviço de autenticação do Firebase
      const response = await firebaseAuthService.resetPassword(newPassword);
      
      if (response.success) {
      } else {
        setError(response.error || 'Erro ao redefinir senha');
      }
    } catch (err: any) {
      console.error('Erro ao redefinir senha:', err);
      
      // Tratamento do erro
      if (typeof err === 'string') {
        setError(err);
      } else {
        // Erros do Firebase
        const errorCode = err.code;
        let errorMessage = err.message || 'Erro ao redefinir senha';
        
        if (errorCode === 'auth/expired-action-code') {
          errorMessage = 'O link de redefinição expirou ou já foi usado';
        } else if (errorCode === 'auth/weak-password') {
          errorMessage = 'A senha deve ter pelo menos 6 caracteres';
        } else if (errorCode === 'auth/invalid-action-code') {
          errorMessage = 'Código de redefinição inválido ou expirado';
        }
        
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, resetPassword, updatePassword, error }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};
