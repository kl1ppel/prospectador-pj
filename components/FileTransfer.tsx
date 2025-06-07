import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../src/contexts/AuthContext';
import { firebaseFileTransferService } from '../src/firebase';

// Interface para mensagens/arquivos
export interface TransferItem {
  id: string;
  type: 'text' | 'file';
  content: string; // Texto da mensagem ou URL do arquivo
  fileName?: string; // Nome do arquivo se for do tipo file
  fileSize?: number; // Tamanho do arquivo em bytes
  fileType?: string; // MIME type do arquivo
  createdAt: string;
  userId: string;
}

export const FileTransfer: React.FC = () => {
  const { user } = useAuth();
  const [items, setItems] = useState<TransferItem[]>([]);
  const [textContent, setTextContent] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [filterType, setFilterType] = useState<'all' | 'text' | 'file'>('all');
  
  // Ref para auto scroll
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Função para rolar para o final da lista
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Carregar itens do Firebase quando o componente montar
  useEffect(() => {
    const loadItems = async () => {
      if (!user?.id) return;
      const result = await firebaseFileTransferService.getItems(user.id);
      if (result.success && result.items) {
        const formatted = result.items.map(it => ({
          ...it,
          createdAt: it.createdAt.toISOString()
        }));
        setItems(formatted);
      }
      scrollToBottom();
    };
    loadItems();
  }, [user]);

  // Enviar texto
  const handleSendText = async () => {
    if (!textContent.trim() || !user?.id) return;

    const result = await firebaseFileTransferService.addText(user.id, textContent);
    if (result.success && result.item) {
      const newItem = {
        ...result.item,
        createdAt: result.item.createdAt.toISOString()
      } as TransferItem;
      setItems(prev => [...prev, newItem]);
      setTextContent('');
    }
  };

  // Iniciar upload de arquivo
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !user?.id) return;

    const file = files[0];
    setIsUploading(true);
    setUploadProgress(0);

    const result = await firebaseFileTransferService.addFile(
      user.id,
      file,
      (p) => setUploadProgress(p)
    );

    setIsUploading(false);

    if (result.success && result.item) {
      const newItem = {
        ...result.item,
        createdAt: result.item.createdAt.toISOString()
      } as TransferItem;
      setItems(prev => [...prev, newItem]);
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Download de arquivo
  const handleDownload = (item: TransferItem) => {
    if (item.type !== 'file' || !item.content) return;
    
    const link = document.createElement('a');
    link.href = item.content;
    link.download = item.fileName || 'downloaded-file';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Função para formatar o tamanho do arquivo
  const formatFileSize = (bytes: number | undefined): string => {
    if (!bytes) return '0 B';
    
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;
    
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }
    
    return `${size.toFixed(1)} ${units[unitIndex]}`;
  };

  // Função para excluir um item
  const handleDeleteItem = async (id: string) => {
    const result = await firebaseFileTransferService.deleteItem(id);
    if (result.success) {
      setItems(prev => prev.filter(item => item.id !== id));
    }
  };

  // Filtrar itens com base no tipo selecionado
  const filteredItems = filterType === 'all' 
    ? items 
    : items.filter(item => item.type === filterType);

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-red-600 dark:text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
          </svg>
          Transferência de Arquivos
        </h2>
        <div className="flex space-x-2">
          <button 
            onClick={() => setFilterType('all')}
            className={`px-3 py-1 rounded-md text-sm ${filterType === 'all' 
              ? 'bg-red-600 text-white' 
              : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'}`}
          >
            Todos
          </button>
          <button 
            onClick={() => setFilterType('text')}
            className={`px-3 py-1 rounded-md text-sm ${filterType === 'text' 
              ? 'bg-red-600 text-white' 
              : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'}`}
          >
            Textos
          </button>
          <button 
            onClick={() => setFilterType('file')}
            className={`px-3 py-1 rounded-md text-sm ${filterType === 'file' 
              ? 'bg-red-600 text-white' 
              : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'}`}
          >
            Arquivos
          </button>
        </div>
      </div>
      
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 shadow-sm mb-4 overflow-y-auto flex-grow max-h-[calc(100vh-350px)]">
        {filteredItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-gray-500 dark:text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-2 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 16l2.879-2.879m0 0a3 3 0 104.243-4.242 3 3 0 00-4.243 4.242zM21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-center">
              {filterType === 'all' 
                ? 'Nenhum item transferido ainda' 
                : filterType === 'text' 
                ? 'Nenhuma nota transferida ainda' 
                : 'Nenhum arquivo transferido ainda'}
            </p>
            <p className="text-sm mt-1 max-w-xs text-center">
              Use o formulário abaixo para enviar textos ou arquivos entre seus dispositivos
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredItems.map((item) => (
              <div 
                key={item.id} 
                className={`p-4 rounded-lg border dark:border-gray-700 transition-all duration-300 hover:shadow-md ${
                  item.type === 'text' 
                    ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200' 
                    : 'bg-green-50 dark:bg-green-900/20 border-green-200'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center">
                    {item.type === 'text' ? (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600 dark:text-green-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    )}
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {new Date(item.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex space-x-2">
                    {item.type === 'file' && (
                      <button 
                        onClick={() => handleDownload(item)}
                        className="text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300"
                        title="Baixar arquivo"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                      </button>
                    )}
                    <button 
                      onClick={() => handleDeleteItem(item.id)}
                      className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
                      title="Excluir item"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
                
                {item.type === 'text' ? (
                  <div className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap break-words bg-white dark:bg-gray-700 p-3 rounded-md shadow-sm">
                    {item.content}
                  </div>
                ) : (
                  <div className="bg-white dark:bg-gray-700 p-3 rounded-md shadow-sm">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-green-100 dark:bg-green-800 rounded-md flex items-center justify-center mr-3">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600 dark:text-green-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <div>
                        <div className="text-gray-800 dark:text-gray-200 font-medium">{item.fileName}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {formatFileSize(item.fileSize)} · {item.fileType}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>
      
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 shadow-sm">
        <div className="flex flex-col space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Enviar uma mensagem de texto
            </label>
            <div className="flex space-x-2">
              <textarea
                value={textContent}
                onChange={(e) => setTextContent(e.target.value)}
                placeholder="Digite sua anotação aqui..."
                className="flex-grow p-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all"
                rows={3}
              />
              <button
                onClick={handleSendText}
                disabled={!textContent.trim()}
                className="self-end px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Transferir um arquivo
            </label>
            <div className="flex flex-col space-y-2">
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 text-center">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  className="hidden"
                  id="file-upload"
                />
                <label
                  htmlFor="file-upload"
                  className="cursor-pointer flex flex-col items-center justify-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400 dark:text-gray-500 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span className="text-gray-600 dark:text-gray-400">
                    {isUploading 
                      ? 'Enviando arquivo...' 
                      : 'Clique para selecionar um arquivo ou arraste e solte'
                    }
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                    Arquivos, imagens, documentos (max 10MB)
                  </span>
                </label>
              </div>
              
              {isUploading && (
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mt-2">
                  <div 
                    className="bg-red-600 h-2.5 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
