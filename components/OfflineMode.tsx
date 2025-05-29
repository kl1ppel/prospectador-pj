import React from 'react';
import { authService } from '../src/services/api';

export const OfflineMode: React.FC = () => {
  const isOffline = authService.isOfflineMode();

  const toggleOfflineMode = () => {
    if (isOffline) {
      authService.disableOfflineMode();
    } else {
      authService.enableOfflineMode();
    }
  };

  return (
    <div className="flex items-center gap-2">
      <span className={`flex items-center gap-1 text-xs font-medium ${isOffline ? 'text-red-500' : 'text-green-500'}`}>
        <span className={`inline-block w-2 h-2 rounded-full ${isOffline ? 'bg-red-500' : 'bg-green-500'}`}></span>
        {isOffline ? 'Offline' : 'Online'}
      </span>
      <button
        onClick={toggleOfflineMode}
        className={`px-3 py-1 text-xs rounded-md font-medium 
          ${isOffline 
            ? 'bg-gray-200 text-gray-800 hover:bg-gray-300' 
            : 'bg-red-100 text-red-800 hover:bg-red-200'}`}
      >
        {isOffline ? 'Voltar ao online' : 'Ativar modo offline'}
      </button>
    </div>
  );
};
