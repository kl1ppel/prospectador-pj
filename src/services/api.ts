import axios from 'axios';

// Verificar se devemos usar dados simulados (mock) quando o servidor estiver offline
const useMockData = localStorage.getItem('use_mock_data') === 'true';

// Determinar a URL base da API com base no ambiente
const getBaseUrl = () => {
  if (useMockData) {
    console.log('Usando dados simulados (modo offline)');
    return '';
  }
  
  // Se estamos em produção (no Firebase)
  if (window.location.hostname === 'prospector-b24a7.web.app' || 
      window.location.hostname === 'prospector-b24a7.firebaseapp.com') {
    // URL do backend em produção - você precisará substituir isso por sua URL real
    return 'https://prospector-api.herokuapp.com/api';
  }
  
  // Em desenvolvimento (localhost)
  return 'http://localhost:5000/api';
};

// Criar instância do axios com URL base da API
const api = axios.create({
  baseURL: getBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000 // Aumentar timeout para 15 segundos
});

// Interceptor para simular respostas quando estiver no modo offline
api.interceptors.request.use(async (config) => {
  if (useMockData) {
    // Cancelar a requisição real e retornar dados simulados depois
    throw { __mock: true, config };
  }
  return config;
});

// Adicionar interceptor para incluir o token de autenticação em todas as requisições
api.interceptors.request.use(
  (config) => {
    const user = JSON.parse(localStorage.getItem('prospect_user') || '{}');
    if (user && user.token) {
      config.headers['Authorization'] = `Bearer ${user.token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Dados simulados para o modo offline
const mockUsers = [
  { id: 1, name: 'Usuário Demo', email: 'demo@example.com', password: 'senha123', token: 'mock-token-123' }
];

// Ativar modo offline para teste
const enableOfflineMode = () => {
  localStorage.setItem('use_mock_data', 'true');
  window.location.reload();
};

// Desativar modo offline
const disableOfflineMode = () => {
  localStorage.removeItem('use_mock_data');
  window.location.reload();
};

// Serviço de autenticação
export const authService = {
  // Funções de controle do modo offline
  enableOfflineMode,
  disableOfflineMode,
  isOfflineMode: () => localStorage.getItem('use_mock_data') === 'true',
  
  // Registrar novo usuário
  register: async (name: string, email: string, password: string) => {
    try {
      // Se estiver no modo offline, simular registro
      if (useMockData) {
        console.log('Simulando registro:', { name, email });
        
        // Verificar se o email já existe
        if (mockUsers.some(u => u.email === email)) {
          return Promise.reject('Email já registrado.');
        }
        
        // Criar novo usuário mock
        const newUser = {
          id: mockUsers.length + 1,
          name,
          email,
          password,
          token: `mock-token-${Date.now()}`
        };
        
        // Guardar nos dados simulados
        mockUsers.push(newUser);
        
        // Salvar no localStorage
        const userData = { id: newUser.id, name: newUser.name, email: newUser.email, token: newUser.token };
        localStorage.setItem('prospect_user', JSON.stringify(userData));
        
        // Simular atraso de rede
        await new Promise(resolve => setTimeout(resolve, 500));
        
        return { success: true, user: userData };
      }
      
      // Modo normal (online)
      console.log('Iniciando registro:', { name, email });
      
      // Adicionando timeout maior para a requisição
      const response = await api.post('/auth/register', 
        { name, email, password },
        { timeout: 10000 } // 10 segundos de timeout
      );
      
      console.log('Resposta do registro:', response.data);
      
      if (response.data.success) {
        localStorage.setItem('prospect_user', JSON.stringify(response.data.user));
      }
      return response.data;
    } catch (error: any) {
      // Se for erro simulado, não precisamos fazer tratamento
      if (error.__mock) return error;
      
      console.error('Erro detalhado no registro:', error);
      
      // Tratar diferentes tipos de erro
      if (error.response) {
        // O servidor respondeu com um código de status fora do intervalo 2xx
        console.error('Erro do servidor:', error.response.status, error.response.data);
        throw error.response.data?.error || `Erro ${error.response.status}: ${error.response.statusText}`;
      } else if (error.request) {
        // A requisição foi feita mas não houve resposta
        console.error('Sem resposta do servidor:', error.request);
        
        // Perguntar ao usuário se deseja usar o modo offline
        if (confirm('O servidor não está respondendo. Deseja ativar o modo offline?')) {
          enableOfflineMode();
          return { success: false, error: 'Ativando modo offline. A página será recarregada.' };
        }
        
        throw 'O servidor não respondeu. Verifique sua conexão ou se o servidor está online.';
      } else {
        // Erro na configuração da requisição
        console.error('Erro na requisição:', error.message);
        throw error.message || 'Erro desconhecido ao registrar usuário';
      }
    }
  },

  // Login de usuário
  login: async (email: string, password: string) => {
    try {
      // Se estiver no modo offline, simular login
      if (useMockData) {
        console.log('Simulando login:', { email });
        
        // Verificar credenciais com os dados simulados
        const user = mockUsers.find(u => u.email === email && u.password === password);
        
        // Simular atraso de rede
        await new Promise(resolve => setTimeout(resolve, 700));
        
        if (!user) {
          return { success: false, error: 'Email ou senha inválidos' };
        }
        
        // Criar dados do usuário para o token
        const userData = { id: user.id, name: user.name, email: user.email, token: user.token };
        localStorage.setItem('prospect_user', JSON.stringify(userData));
        
        return { success: true, user: userData };
      }
      
      // Modo normal (online)
      console.log('Iniciando login:', { email });
      const response = await api.post('/auth/login', { email, password });
      
      if (response.data.success) {
        localStorage.setItem('prospect_user', JSON.stringify(response.data.user));
      }
      return response.data;
    } catch (error: any) {
      // Se for erro simulado, não precisamos fazer tratamento
      if (error.__mock) return error;
      
      console.error('Erro detalhado no login:', error);
      
      // Tratar diferentes tipos de erro
      if (error.response) {
        // O servidor respondeu com um código de status fora do intervalo 2xx
        console.error('Erro do servidor:', error.response.status, error.response.data);
        throw error.response.data?.error || `Erro ${error.response.status}: ${error.response.statusText}`;
      } else if (error.request) {
        // A requisição foi feita mas não houve resposta
        console.error('Sem resposta do servidor:', error.request);
        
        // Perguntar ao usuário se deseja usar o modo offline
        if (confirm('O servidor não está respondendo. Deseja ativar o modo offline?\n\nCredenciais para teste:\nEmail: demo@example.com\nSenha: senha123')) {
          enableOfflineMode();
          return { success: false, error: 'Ativando modo offline. A página será recarregada.' };
        }
        
        throw 'O servidor não respondeu. Verifique sua conexão ou se o servidor está online.';
      } else {
        // Outro tipo de erro
        console.error('Erro na requisição:', error.message);
        throw error.message || 'Erro desconhecido ao fazer login';
      }
    }
  },

  // Logout
  logout: () => {
    localStorage.removeItem('prospect_user');
    // Manter o modo offline ativo mesmo após logout
  },

  // Obter usuário atual
  getCurrentUser: () => {
    const user = localStorage.getItem('prospect_user');
    return user ? JSON.parse(user) : null;
  },
  
  // Verificar se o usuário está autenticado
  isAuthenticated: () => {
    return localStorage.getItem('prospect_user') !== null;
  },

  // Solicitar redefinição de senha
  forgotPassword: async (email: string) => {
    try {
      const response = await api.post('/auth/forgot-password', { email });
      return response.data;
    } catch (error: any) {
      throw error.response?.data?.error || 'Erro ao solicitar redefinição de senha';
    }
  },

  // Redefinir senha
  resetPassword: async (token: string, password: string) => {
    try {
      const response = await api.post('/auth/reset-password', { token, password });
      return response.data;
    } catch (error: any) {
      throw error.response?.data?.error || 'Erro ao redefinir senha';
    }
  }
};

// Serviço de mensagens
export const messageService = {
  // Enviar mensagem
  sendMessage: async (data: {
    phoneNumber: string;
    message: string;
    type?: 'whatsapp' | 'rdstation';
    contactName?: string;
    contactEmail?: string;
    metadata?: any;
  }) => {
    try {
      const response = await api.post('/messages', data);
      return response.data;
    } catch (error: any) {
      throw error.response?.data?.error || 'Erro ao enviar mensagem';
    }
  },

  // Obter histórico de mensagens
  getMessages: async (params?: {
    page?: number;
    pageSize?: number;
    type?: string;
    startDate?: string;
    endDate?: string;
    query?: string;
  }) => {
    try {
      const response = await api.get('/messages', { params });
      return response.data;
    } catch (error: any) {
      throw error.response?.data?.error || 'Erro ao obter mensagens';
    }
  },

  // Limpar histórico de mensagens
  clearHistory: async (params?: {
    type?: string;
    startDate?: string;
    endDate?: string;
  }) => {
    try {
      const response = await api.delete('/messages', { params });
      return response.data;
    } catch (error: any) {
      throw error.response?.data?.error || 'Erro ao limpar histórico';
    }
  }
};



export default api;
