import React, { useState } from 'react';
import { useAuth } from '../src/contexts/AuthContext';

interface ResetPasswordProps {
  token: string;
  onBack: () => void;
  onSuccess: () => void;
}

export const ResetPassword: React.FC<ResetPasswordProps> = ({ token, onBack, onSuccess }) => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);
  const { updatePassword, error, loading } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validar senha
    setValidationError(null);
    
    if (password.length < 6) {
      setValidationError('A senha deve ter pelo menos 6 caracteres');
      return;
    }
    
    if (password !== confirmPassword) {
      setValidationError('As senhas não coincidem');
      return;
    }
    
    const success = await updatePassword(token, password);
    if (success) {
      onSuccess();
    }
  };

  return (
    <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
      <div className="text-center mb-8">
        <img 
          src="/new-logo.svg" 
          alt="Prospect Logo" 
          className="h-16 w-auto mx-auto mb-4"
        />
        <h2 className="text-3xl font-bold text-gray-900">Redefinir Senha</h2>
        <p className="text-gray-600 mt-2">
          Digite sua nova senha
        </p>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      {validationError && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" role="alert">
          <span className="block sm:inline">{validationError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">
            Nova Senha
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 bg-white text-gray-900"
          />
        </div>

        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
            Confirmar Senha
          </label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 bg-white text-gray-900"
          />
        </div>

        <div>
          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Processando...' : 'Redefinir Senha'}
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
    </div>
  );
};
