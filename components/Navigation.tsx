import React, { useState } from 'react';
import { useAuth } from '../src/contexts/AuthContext';
import { UserMenu } from './UserMenu';
import { OfflineMode } from './OfflineMode';

export type NavigationTab = 'home' | 'crm' | 'history' | 'transfer';

interface NavigationProps {
  activeTab: NavigationTab;
  onTabChange: (tab: NavigationTab) => void;
  isDarkMode: boolean;
  toggleTheme: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({ activeTab, onTabChange, isDarkMode, toggleTheme }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user } = useAuth();
  return (
    <nav className="bg-gray-900 text-white border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <img 
                src="/logo.svg" 
                alt="Prospect Logo" 
                className="h-10 w-10 mr-2"
              />
              <span className="text-xl font-semibold text-red-500">PROSPECT</span>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <button
                onClick={() => onTabChange('home')}
                className={`${
                  activeTab === 'home'
                    ? 'border-red-500 text-white'
                    : 'border-transparent text-gray-400 hover:border-gray-300 hover:text-gray-300'
                } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                Início
              </button>

              <button
                onClick={() => onTabChange('crm')}
                className={`${
                  activeTab === 'crm'
                    ? 'border-red-500 text-white'
                    : 'border-transparent text-gray-400 hover:border-gray-300 hover:text-gray-300'
                } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                CRM
              </button>

              <button
                onClick={() => onTabChange('history')}
                className={`${
                  activeTab === 'history'
                    ? 'border-red-500 text-white'
                    : 'border-transparent text-gray-400 hover:border-gray-300 hover:text-gray-300'
                } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Histórico
              </button>
              
              <button
                onClick={() => onTabChange('transfer')}
                className={`${
                  activeTab === 'transfer'
                    ? 'border-red-500 text-white'
                    : 'border-transparent text-gray-400 hover:border-gray-300 hover:text-gray-300'
                } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
                Transferência
              </button>
            </div>
          </div>
          
          {/* User menu */}
          <div className="hidden sm:flex sm:items-center gap-4">
            <OfflineMode />
            <UserMenu isDarkMode={isDarkMode} toggleTheme={toggleTheme} />
          </div>
          
          {/* Menu mobile */}
          <div className="sm:hidden">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-md text-gray-400 hover:text-red-500 focus:outline-none"
                aria-label="Abrir menu"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              
              {/* User menu para mobile */}
              <div className="ml-2">
                <UserMenu isDarkMode={isDarkMode} toggleTheme={toggleTheme} />
              </div>
            </div>
            
            {/* Menu dropdown mobile */}
            {mobileMenuOpen && (
              <div className="mt-2 bg-gray-800 border border-gray-700 rounded-md shadow-lg absolute w-full left-0 z-50">
                <div className="py-1">
                  <button
                    onClick={() => {
                      onTabChange('home');
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center px-4 py-3 text-sm ${activeTab === 'home' ? 'bg-gray-700 text-red-500' : 'text-gray-300 hover:bg-gray-700'}`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                    Início
                  </button>
                  
                  <button
                    onClick={() => {
                      onTabChange('crm');
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center px-4 py-3 text-sm ${activeTab === 'crm' ? 'bg-gray-700 text-red-500' : 'text-gray-300 hover:bg-gray-700'}`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    CRM
                  </button>
                  
                  <button
                    onClick={() => {
                      onTabChange('history');
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center px-4 py-3 text-sm ${activeTab === 'history' ? 'bg-gray-700 text-red-500' : 'text-gray-300 hover:bg-gray-700'}`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Histórico
                  </button>
                  
                  <button
                    onClick={() => {
                      onTabChange('transfer');
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center px-4 py-3 text-sm ${activeTab === 'transfer' ? 'bg-gray-700 text-red-500' : 'text-gray-300 hover:bg-gray-700'}`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                    </svg>
                    Transferência
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
