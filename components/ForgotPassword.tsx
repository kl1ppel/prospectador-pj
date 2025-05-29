import React, { useState } from 'react';
import { useAuth } from '../src/contexts/AuthContext';

interface ForgotPasswordProps {
  onBack: () => void;
}

export const ForgotPassword: React.FC<ForgotPasswordProps> = ({ onBack }) => {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { resetPassword, error, loading } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await resetPassword(email);
    if (success) {
      setIsSubmitted(true);
    }
  };

  return (
    <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
      <div className="text-center mb-8">
        <div className="flex justify-center mb-4">
          <img 
            src="/logo.svg" 
            alt="Prospect Logo" 
            className="h-16 w-16"
          />
        </div>
        <h2 className="text-3xl font-bold text-gray-900">Recuperar Senha</h2>
        <p className="text-gray-600 mt-2">
          {!isSubmitted 
            ? 'Informe seu email para redefinir sua senha' 
            : 'Instruções de redefinição enviadas'}
        </p>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      {isSubmitted ? (
        <div className="text-center">
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6" role="alert">
            <p className="font-bold">Email enviado!</p>
            <p className="text-sm">
              Enviamos instruções para redefinir sua senha no email {email}.
              Por favor, verifique sua caixa de entrada e siga as instruções.
            </p>
          </div>
          <button
            onClick={onBack}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            Voltar para o Login
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 bg-white text-gray-900"
            />
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Enviando...' : 'Enviar Instruções'}
            </button>
          </div>
          
          <div className="text-center">
            <button
              type="button"
              onClick={onBack}
              className="text-sm font-medium text-red-600 hover:text-red-500 focus:outline-none"
            >
              Voltar para o Login
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
