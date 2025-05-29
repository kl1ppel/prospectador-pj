import React, { useState } from 'react';
import { ResetPassword } from './ResetPassword';

export const ResetPasswordPage: React.FC = () => {
  const [token, setToken] = useState('');
  const [isTokenSubmitted, setIsTokenSubmitted] = useState(false);
  const [isResetSuccess, setIsResetSuccess] = useState(false);

  // Extrair token da URL, se estiver presente
  React.useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const tokenFromUrl = queryParams.get('token');
    if (tokenFromUrl) {
      setToken(tokenFromUrl);
      setIsTokenSubmitted(true);
    }
  }, []);

  const handleTokenSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (token.trim()) {
      setIsTokenSubmitted(true);
    }
  };

  const handleBack = () => {
    window.location.href = '/'; // Redirecionar para a página inicial
  };

  const handleSuccess = () => {
    setIsResetSuccess(true);
    setTimeout(() => {
      window.location.href = '/'; // Redirecionar para a página inicial após sucesso
    }, 3000);
  };

  if (isResetSuccess) {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md">
          <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
            <div className="text-center mb-8">
              <img 
                src="/logo.svg" 
                alt="Prospect Logo" 
                className="h-16 w-auto mx-auto mb-4"
              />
              <h2 className="text-3xl font-bold text-gray-900">Senha Redefinida!</h2>
              <p className="text-gray-600 mt-2">
                Sua senha foi alterada com sucesso. Você será redirecionado para a página de login em instantes...
              </p>
            </div>
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6" role="alert">
              <p className="font-bold">Sucesso!</p>
              <p className="text-sm">
                Agora você pode fazer login com sua nova senha.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!isTokenSubmitted) {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md">
          <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
            <div className="text-center mb-8">
              <img 
                src="/logo.svg" 
                alt="Prospect Logo" 
                className="h-16 w-auto mx-auto mb-4"
              />
              <h2 className="text-3xl font-bold text-gray-900">Redefinir Senha</h2>
              <p className="text-gray-600 mt-2">
                Por favor, insira o código de redefinição que você recebeu no seu email
              </p>
            </div>

            <form onSubmit={handleTokenSubmit} className="space-y-6">
              <div>
                <label htmlFor="token" className="block text-sm font-medium text-gray-700">
                  Código de Redefinição
                </label>
                <input
                  id="token"
                  name="token"
                  type="text"
                  required
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
                  placeholder="Insira o código recebido por email"
                />
              </div>

              <div>
                <button
                  type="submit"
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  Continuar
                </button>
              </div>
              
              <div className="text-center">
                <button
                  type="button"
                  onClick={handleBack}
                  className="text-sm font-medium text-red-600 hover:text-red-500 focus:outline-none"
                >
                  Voltar para o Login
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <ResetPassword 
          token={token} 
          onBack={handleBack} 
          onSuccess={handleSuccess} 
        />
      </div>
    </div>
  );
};
