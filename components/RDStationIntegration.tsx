import React, { useState, useEffect } from 'react';
import { isRDStationConfigured } from '../utils/rdStationAPI';

interface RDStationIntegrationProps {
  isEnabled: boolean;
  onToggle: (enabled: boolean) => void;
  onConfigureToken: (token: string) => void;
}

export const RDStationIntegration: React.FC<RDStationIntegrationProps> = ({ 
  isEnabled, 
  onToggle,
  onConfigureToken
}) => {
  const [showTokenInput, setShowTokenInput] = useState<boolean>(false);
  const [apiToken, setApiToken] = useState<string>('');
  const [isConfigured, setIsConfigured] = useState<boolean>(false);

  // Verifica se o RD Station já está configurado
  useEffect(() => {
    const checkConfiguration = async () => {
      const configured = isRDStationConfigured();
      setIsConfigured(configured);
    };
    checkConfiguration();
  }, []);

  const handleTokenSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (apiToken) {
      onConfigureToken(apiToken);
      setShowTokenInput(false);
      setIsConfigured(true);
    }
  };

  return (
    <div className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm">
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          <img 
            src="https://d335luupugsy2.cloudfront.net/cms/files/10224/1660247793/$l3xwxnkgq4r" 
            alt="RD Station Logo" 
            className="h-6 mr-2" 
          />
          <h3 className="text-lg font-medium">Integração com RD Station CRM</h3>
        </div>
        <div className="flex items-center">
          <span className={`inline-block w-3 h-3 rounded-full mr-2 ${isConfigured ? 'bg-green-500' : 'bg-red-500'}`}></span>
          <span className="text-sm text-gray-600">{isConfigured ? 'Configurado' : 'Não configurado'}</span>
        </div>
      </div>

      <div className="mt-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Enviar contatos prospectados para o RD Station CRM
          </p>
          <label className="inline-flex items-center cursor-pointer">
            <input 
              type="checkbox" 
              checked={isEnabled} 
              onChange={() => onToggle(!isEnabled)}
              disabled={!isConfigured}
              className="sr-only peer"
            />
            <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>

        {!isConfigured && (
          <div className="mt-4">
            {!showTokenInput ? (
              <button
                onClick={() => setShowTokenInput(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Configurar API Token
              </button>
            ) : (
              <form onSubmit={handleTokenSubmit} className="space-y-3">
                <div>
                  <label htmlFor="apiToken" className="block text-sm font-medium text-gray-700">
                    Token de API do RD Station
                  </label>
                  <input
                    type="text"
                    id="apiToken"
                    value={apiToken}
                    onChange={(e) => setApiToken(e.target.value)}
                    placeholder="Cole seu token aqui"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div className="flex space-x-2">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Salvar
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowTokenInput(false)}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {isConfigured && (
          <div className="mt-4 space-y-2">
            <p className="text-sm text-gray-600">
              {isEnabled 
                ? 'Os contatos prospectados serão enviados automaticamente para o RD Station CRM.' 
                : 'A integração está desativada. Ative para enviar contatos ao RD Station.'}
            </p>
            <button
              onClick={() => setShowTokenInput(true)}
              className="text-sm text-blue-600 hover:underline"
            >
              Atualizar Token de API
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
