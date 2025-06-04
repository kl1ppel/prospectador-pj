import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { authService } from '../services/api';
import { firebaseAuthService } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase/config';

interface User {
  id: string;
  name: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  loginAnonymously: () => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  resetPassword: (email: string) => Promise<boolean>;
  updatePassword: (token: string, newPassword: string) => Promise<boolean>;
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
            const basicUserData = {
              id: firebaseUser.uid,
              name: firebaseUser.displayName || '',
              email: firebaseUser.email || ''
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

  const login = async (email: string, password: string): Promise<boolean> => {
    setError(null);
    
    try {
      setLoading(true);
      
      // Usar o serviço de autenticação do Firebase
      const response = await firebaseAuthService.login(email, password);
      
      if (response.success) {
        setUser(response.user);
        return true;
      } else {
        setError(response.error || 'Erro ao fazer login');
        return false;
      }
    } catch (err: any) {
      console.error('Erro durante o login:', err);
      setError(typeof err === 'string' ? err : (err.message || 'Erro desconhecido ao fazer login'));
      return false;
    } finally {
      setLoading(false);
    }
  };

  const loginAnonymously = async (): Promise<boolean> => {
    setError(null);
    try {
      setLoading(true);
      const response = await firebaseAuthService.loginAnonymously();
      if (response.success) {
        setUser(response.user);
        return true;
      } else {
        setError(response.error || 'Erro ao entrar como anônimo');
        return false;
      }
    } catch (err: any) {
      console.error('Erro durante login anônimo:', err);
      setError(typeof err === 'string' ? err : err.message || 'Erro desconhecido ao entrar como anônimo');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string): Promise<boolean> => {
    setError(null);
    
    try {
      setLoading(true);
      
      // Usar o serviço de autenticação do Firebase
      const response = await firebaseAuthService.register(name, email, password);
      
      if (response.success) {
        setUser(response.user);
        return true;
      } else {
        setError(response.error || 'Erro ao registrar usuário');
        return false;
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
      
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      // Usar o serviço de autenticação do Firebase
      await firebaseAuthService.logout();
      setUser(null);
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  // Função para solicitar redefinição de senha
  const resetPassword = async (email: string): Promise<boolean> => {
    setError(null);
    
    try {
      setLoading(true);
      
      // Usar o serviço de autenticação do Firebase
      const response = await firebaseAuthService.forgotPassword(email);
      
      if (response.success) {
        return true;
      } else {
        setError(response.error || 'Erro ao solicitar redefinição de senha');
        return false;
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
      
      return false;
    } finally {
      setLoading(false);
    }
  };
  
  // Função para atualizar a senha usando um token
  const updatePassword = async (token: string, newPassword: string): Promise<boolean> => {
    setError(null);
    
    try {
      setLoading(true);
      
      // Usar o serviço de autenticação do Firebase
      const response = await firebaseAuthService.resetPassword(token, newPassword);
      
      if (response.success) {
        return true;
      } else {
        setError(response.error || 'Erro ao redefinir senha');
        return false;
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
      
      return false;
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, loginAnonymously, register, logout, resetPassword, updatePassword, error }}>
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
