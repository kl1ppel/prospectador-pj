import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../src/contexts/AuthContext';

interface UserMenuProps {
  isDarkMode: boolean;
  toggleTheme: () => void;
}

export const UserMenu: React.FC<UserMenuProps> = ({ isDarkMode, toggleTheme }) => {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const handleLogout = () => {
    logout();
    setIsOpen(false);
  };

  // Extrair iniciais do nome do usuário
  const getInitials = () => {
    if (!user?.name) return '?';
    
    const names = user.name.split(' ');
    if (names.length === 1) return names[0].charAt(0).toUpperCase();
    
    return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={toggleMenu}
        className="flex items-center justify-center h-10 w-10 rounded-full bg-red-600 text-white focus:outline-none"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <span>{getInitials()}</span>
      </button>

      {isOpen && (
        <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 z-50">
          <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{user?.name}</p>
            <p className="text-sm text-gray-500 dark:text-gray-300 truncate">{user?.email}</p>
          </div>
          
          {/* Switch de tema */}
          <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200 dark:border-gray-700">
            <span className="text-sm text-gray-700 dark:text-gray-300">Tema escuro</span>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                toggleTheme();
              }} 
              className={`relative inline-flex items-center h-6 rounded-full w-11 ${isDarkMode ? 'bg-red-600' : 'bg-gray-300'}`}
            >
              <span className="sr-only">Toggle dark mode</span>
              <span 
                className={`inline-block w-4 h-4 transform transition-transform bg-white rounded-full ${isDarkMode ? 'translate-x-6' : 'translate-x-1'}`}
              />
            </button>
          </div>
          
          <button
            onClick={handleLogout}
            className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            Sair
          </button>
        </div>
      )}
    </div>
  );
};
