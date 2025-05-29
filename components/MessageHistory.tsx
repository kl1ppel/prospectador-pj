import React, { useState, useEffect } from 'react';
import { messageService } from '../src/services/api';
// Usando uma abordagem alternativa para importar o date-fns para evitar problemas
const formatDistanceDate = (date1: Date, date2: Date): string => {
  const diffTime = Math.abs(date2.getTime() - date1.getTime());
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor((diffTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const diffMinutes = Math.floor((diffTime % (1000 * 60 * 60)) / (1000 * 60));
  
  if (diffDays > 0) {
    return `há ${diffDays} dia${diffDays > 1 ? 's' : ''}`;
  } else if (diffHours > 0) {
    return `há ${diffHours} hora${diffHours > 1 ? 's' : ''}`;
  } else if (diffMinutes > 0) {
    return `há ${diffMinutes} minuto${diffMinutes > 1 ? 's' : ''}`;
  } else {
    return 'agora mesmo';
  }
};

export interface MessageHistoryItem {
  id: string;
  phoneNumber: string;
  message: string;
  sentAt: string;
  type: 'whatsapp' | 'rdstation';
  status: 'sent' | 'delivered' | 'read' | 'failed';
  contactName?: string;
  contactEmail?: string;
  metadata?: any;
  userId: string;
  user?: {
    id: string;
    name: string;
    email: string;
  };
}

interface MessageHistoryProps {
  onClearHistory: () => void;
}

export const MessageHistory: React.FC<MessageHistoryProps> = ({ onClearHistory }) => {
  const [history, setHistory] = useState<MessageHistoryItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const params: any = {
          page: currentPage,
          pageSize: 10
        };
        
        if (filter !== 'all') {
          params.type = filter;
        }
        
        if (searchQuery) {
          params.query = searchQuery;
        }
        
        const response = await messageService.getMessages(params);
        
        if (response.success) {
          setHistory(response.messages);
          setTotalPages(response.pages);
        } else {
          setError('Erro ao carregar mensagens');
        }
      } catch (err) {
        setError('Erro ao carregar histórico de mensagens');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchMessages();
  }, [filter, currentPage, searchQuery]);

  const handleClearHistory = async () => {
    if (window.confirm('Tem certeza que deseja limpar o histórico de mensagens?')) {
      try {
        setLoading(true);
        const params: any = {};
        
        if (filter !== 'all') {
          params.type = filter;
        }
        
        const response = await messageService.clearHistory(params);
        
        if (response.success) {
          const updatedResponse = await messageService.getMessages({
            page: 1, 
            pageSize: 10
          });
          
          setHistory(updatedResponse.success ? updatedResponse.messages : []);
          setTotalPages(updatedResponse.success ? updatedResponse.pages : 1);
          setCurrentPage(1);
          
          onClearHistory(); 
        }
      } catch (err) {
        setError('Erro ao limpar histórico');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1); 
  };

  return (
    <div className="message-history">
      <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-4 w-full md:w-auto">
          <div className="flex items-center space-x-2">
            <label htmlFor="filter" className="text-gray-700">Filtrar por:</label>
            <select
              id="filter"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="border border-gray-300 rounded px-3 py-1 text-gray-700 focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="all">Todas as mensagens</option>
              <option value="whatsapp">WhatsApp</option>
              <option value="rdstation">RD Station</option>
            </select>
          </div>
          
          <form onSubmit={handleSearch} className="flex-1 w-full md:w-auto">
            <div className="flex items-center">
              <input
                type="text"
                placeholder="Buscar mensagens..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="border border-gray-300 rounded-l px-3 py-1 text-gray-700 focus:outline-none focus:ring-2 focus:ring-red-500 w-full"
              />
              <button
                type="submit"
                className="bg-red-600 text-white px-3 py-1 rounded-r hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </div>
          </form>
        </div>
        
        <button
          onClick={handleClearHistory}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors"
        >
          Limpar Histórico
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
        </div>
      ) : error ? (
        <div className="bg-red-50 p-6 text-center text-red-500 rounded-lg">
          <p>{error}</p>
        </div>
      ) : history.length === 0 ? (
        <div className="bg-gray-50 p-6 text-center text-gray-500 rounded-lg">
          <p>Nenhuma mensagem no histórico.</p>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {history.map((item) => (
              <div key={item.id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                <div className="flex justify-between">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {item.type === 'whatsapp' ? 'WhatsApp' : 'RD Station'}
                  </span>
                  <span className="text-sm text-gray-500">
                    {new Date(item.sentAt).toLocaleString()}
                  </span>
                </div>
                
                <div className="mt-2">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 mr-3">
                      <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                        {item.type === 'whatsapp' ? (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        )}
                      </div>
                    </div>
                    <div className="flex-1">
                      {item.type === 'whatsapp' ? (
                        <>
                          <p className="text-sm font-medium text-gray-900">Mensagem para: {item.phoneNumber}</p>
                          <p className="mt-1 text-sm text-gray-700">{item.message}</p>
                        </>
                      ) : (
                        <>
                          <p className="text-sm font-medium text-gray-900">
                            {item.contactName} ({item.contactEmail})
                          </p>
                          <p className="mt-1 text-sm text-gray-700">{item.message}</p>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {totalPages > 1 && (
            <div className="flex justify-center mt-6">
              <nav className="inline-flex rounded-md shadow">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-3 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Anterior
                </button>
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => handlePageChange(i + 1)}
                    className={`px-3 py-2 border border-gray-300 text-sm font-medium ${currentPage === i + 1 ? 'bg-red-600 text-white' : 'bg-white text-gray-500 hover:bg-gray-50'}`}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-3 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Próxima
                </button>
              </nav>
            </div>
          )}
        </>
      )}
    </div>
  );
};
