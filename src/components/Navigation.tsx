
import { Link } from 'react-router-dom';

export const Navigation = () => {
  return (
    <nav className="bg-white dark:bg-gray-800 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex space-x-8">
            <Link 
              to="/" 
              className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
            >
              Início
            </Link>
            <Link 
              to="/crm" 
              className="inline-flex items-center px-1 pt-1 border-b-2 border-blue-500 text-sm font-medium text-gray-900 dark:text-white"
            >
              CRM
            </Link>
            <Link 
              to="/historico" 
              className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
            >
              Histórico
            </Link>
            <Link 
              to="/prospectai" 
              className="inline-flex items-center px-1 pt-1 border-b-2 border-blue-500 text-sm font-medium text-gray-900 dark:text-white"
            >
              ProspectAI
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};
