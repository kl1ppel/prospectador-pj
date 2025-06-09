
import React, { useState, ChangeEvent, useEffect } from 'react';
import readXlsxFile from 'read-excel-file';
import { PhoneNumberInput } from './components/PhoneNumberInput';
import { MessageComposer } from './components/MessageComposer';
import { MessageList } from './components/MessageList';
import { LoadingIcon } from './components/icons';
import { RDStationIntegration } from './components/RDStationIntegration';
import { MessageHistory, MessageHistoryItem } from './components/MessageHistory';
import { updateRdStationToken } from './utils/rdStationAPI';
import { Navigation, NavigationTab } from './components/Navigation';
import { AuthProvider, useAuth } from './src/contexts/AuthContext';
import { AuthScreen } from './components/AuthScreen';
import { ResetPasswordPage } from './components/ResetPasswordPage';
import { Footer } from './components/Footer';
import FileTransfer from './components/FileTransfer';

import { authService } from './src/services/api';
// Logo será carregado da pasta pública

// Componente interno que usa o hook useAuth
const AppContent: React.FC = () => {
  const { user, loading } = useAuth();
  
  // Verificar se estamos na página de redefinição de senha
  const isResetPasswordPage = window.location.pathname === '/reset-password';
  
  // Se estamos na página de redefinição de senha, mostrar esse componente independente do login
  if (isResetPasswordPage) {
    return <ResetPasswordPage />;
  }
  const [phoneNumbers, setPhoneNumbers] = useState<string[]>([]);
  const [baseMessage, setBaseMessage] = useState<string>('');
  const [isProcessingFile, setIsProcessingFile] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null); 
  const [fileError, setFileError] = useState<string | null>(null);
  const [fileSuccess, setFileSuccess] = useState<string | null>(null);
  const [rdStationEnabled, setRdStationEnabled] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<NavigationTab>('home');
  const [messageHistory, setMessageHistory] = useState<MessageHistoryItem[]>(() => {
    const savedHistory = localStorage.getItem('messageHistory');
    return savedHistory ? JSON.parse(savedHistory) : [];
  });
  const [rdStationToken, setRdStationToken] = useState<string>(() => {
    const savedToken = localStorage.getItem('rdStationToken');
    return savedToken || '';
  });
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      return savedTheme === 'dark';
    }
    return false;
  });

  useEffect(() => {
    // Aplicar tema imediatamente ao montar o componente
    applyTheme(isDarkMode);
    
    // Verificar se a integração com RD Station estava ativa anteriormente
    const savedRdStationEnabled = localStorage.getItem('rdStationEnabled');
    if (savedRdStationEnabled) {
      setRdStationEnabled(savedRdStationEnabled === 'true');
    }
  }, []); // Execute apenas uma vez ao montar

  // Função para aplicar o tema e salvar no localStorage
  const applyTheme = (dark: boolean) => {
    const theme = dark ? 'dark' : 'light';
    
    if (dark) {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark:bg-gray-800');
      document.body.classList.add('dark:text-white');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark:bg-gray-800');
      document.body.classList.remove('dark:text-white');
    }
    
    localStorage.setItem('theme', theme);
  };

  const toggleTheme = () => {
    setIsDarkMode(prevMode => {
      const newMode = !prevMode;
      applyTheme(newMode);
      return newMode;
    });
  };
  
  const handleRdStationToggle = (enabled: boolean) => {
    setRdStationEnabled(enabled);
    localStorage.setItem('rdStationEnabled', enabled.toString());
  };
  
  const handleConfigureRdStationToken = (token: string) => {
    setRdStationToken(token);
    localStorage.setItem('rdStationToken', token);
    // Atualiza o token na API
    updateRdStationToken(token);
    // Ativa automaticamente a integração quando um token é configurado
    if (token) {
      setRdStationEnabled(true);
      localStorage.setItem('rdStationEnabled', 'true');
    }
  };
  
  const handleMessageSent = (historyItem: MessageHistoryItem) => {
    const updatedHistory = [...messageHistory, historyItem];
    setMessageHistory(updatedHistory);
    localStorage.setItem('messageHistory', JSON.stringify(updatedHistory));
  };
  
  const handleClearHistory = () => {
    setMessageHistory([]);
    localStorage.removeItem('messageHistory');
  };
  
  const handleTabChange = (tab: NavigationTab) => {
    setActiveTab(tab);
  };

  const formatPhoneNumberForStorage = (numberStr: string): string => {
    let cleaned = numberStr.replace(/[^\d+]/g, ''); // Keeps digits and leading '+'
    if (!cleaned.startsWith('+')) {
      const justDigits = cleaned.replace(/\D/g, ''); // Ensure we count only digits
      if (justDigits.length === 10 || justDigits.length === 11) { // Heuristic for Brazilian numbers (DDD + number)
        cleaned = '+55' + justDigits;
      }
      // If still no '+', it means it's not a 10/11 digit number we auto-prefixed,
      // or it was shorter. It will be stored as digits-only if no '+' was ever present.
      // If it was like "123", it remains "123". If "abc123def", also "123".
    }
    return cleaned;
  };

  const handleAddPhoneNumber = (number: string) => {
    const formattedNumber = formatPhoneNumberForStorage(number);
    if (formattedNumber && (formattedNumber.startsWith('+') || formattedNumber.replace(/\D/g,'').length > 0) && !phoneNumbers.includes(formattedNumber)) {
      setPhoneNumbers(prev => [...prev, formattedNumber]);
      setError(null);
      setFileError(null);
      setFileSuccess(null);
    }
  };

  const handleRemovePhoneNumber = (numberToRemove: string) => {
    setPhoneNumbers(prev => prev.filter(number => number !== numberToRemove));
  };

  const handleFileUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    setIsProcessingFile(true);
    setFileError(null);
    setFileSuccess(null);
    setError(null);

    const CNPJ_COLUMN_INDEX = 0; // Coluna A
    const PHONE_COLUMN_INDEX = 19; // Coluna T

    try {
      let importedPhonesForProcessing: string[] = [];
      
      if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
        const rows = await readXlsxFile(file);
        const processedCnpjs = new Set<string>();
        let rawPairsExtractedCount = 0;
        rows.forEach(row => {
          if (row.length > Math.max(CNPJ_COLUMN_INDEX, PHONE_COLUMN_INDEX)) {
            const cnpj = String(row[CNPJ_COLUMN_INDEX]).trim();
            const phone = String(row[PHONE_COLUMN_INDEX]).trim();
            if (cnpj && phone) {
              rawPairsExtractedCount++;
              if (!processedCnpjs.has(cnpj)) {
                importedPhonesForProcessing.push(phone);
                processedCnpjs.add(cnpj);
              }
            }
          }
        });
         if (rawPairsExtractedCount === 0 && importedPhonesForProcessing.length === 0) {
           throw new Error("Nenhum par CNPJ/Telefone foi encontrado nas colunas A e T do arquivo Excel/CSV. Verifique se as colunas estão corretas e se os dados estão presentes.");
        }

      } else if (file.name.endsWith('.csv')) {
        const text = await file.text();
        const lines = text.split(/\r\n|\n/);
        const processedCnpjs = new Set<string>();
        let rawPairsExtractedCount = 0;
        lines.forEach(line => {
          const columns = line.split(',');
          if (columns.length > Math.max(CNPJ_COLUMN_INDEX, PHONE_COLUMN_INDEX)) {
            const cnpj = String(columns[CNPJ_COLUMN_INDEX]).trim();
            const phone = String(columns[PHONE_COLUMN_INDEX]).trim();
            if (cnpj && phone) {
              rawPairsExtractedCount++;
              if (!processedCnpjs.has(cnpj)) {
                importedPhonesForProcessing.push(phone);
                processedCnpjs.add(cnpj);
              }
            }
          }
        });
        if (rawPairsExtractedCount === 0 && importedPhonesForProcessing.length === 0) {
           throw new Error("Nenhum par CNPJ/Telefone foi encontrado nas colunas A e T do arquivo CSV. Verifique se as colunas estão corretas e se os dados estão presentes.");
        }
      } else if (file.name.endsWith('.txt')) {
        const text = await file.text();
        const lines = text.split(/\r\n|\n/);
        lines.forEach(line => {
          const phone = line.trim();
          if (phone) { 
            importedPhonesForProcessing.push(phone);
          }
        });
         if (importedPhonesForProcessing.length === 0) {
            throw new Error("Nenhum número de telefone encontrado no arquivo TXT. Certifique-se de que há um número por linha.");
        }
      } else {
        throw new Error("Formato de arquivo não suportado. Use .xlsx, .xls, .csv ou .txt.");
      }
      
      const validPhoneNumbers = importedPhonesForProcessing
        .map(phone => formatPhoneNumberForStorage(phone)) 
        .filter(num => (num.startsWith('+') || num.replace(/\D/g,'').length > 0) && num.replace(/\D/g,'').length > 5); // Basic phone number validity check

      const uniqueNewNumbers = validPhoneNumbers.filter(num => !phoneNumbers.includes(num));

      if (uniqueNewNumbers.length > 0) {
        setPhoneNumbers(prev => [...new Set([...prev, ...uniqueNewNumbers])]); 
        setFileSuccess(`${uniqueNewNumbers.length} novo(s) número(s) importado(s) com sucesso.`);
      } else if (validPhoneNumbers.length > 0) {
        setFileSuccess("Nenhum número novo para adicionar. Os números válidos do arquivo já podem estar na lista ou foram formatados para números já existentes.");
      } else {
         if (file.name.endsWith('.txt')) {
            throw new Error("Nenhum número de telefone válido (após limpeza, formatação e verificação de comprimento) foi encontrado no arquivo TXT.");
        } else {
            throw new Error(`Nenhum dos telefones encontrados na coluna T (Excel/CSV) resultou em um número válido após a limpeza, formatação e verificação de comprimento. Verifique o conteúdo da coluna T.`);
        }
      }
    } catch (e: any) {
      console.error("Erro ao processar arquivo:", e);
      setFileError(e.message || "Falha ao processar o arquivo.");
    } finally {
      setIsProcessingFile(false);
      if (event.target) event.target.value = ''; 
    }
  };

  const showSendSection = phoneNumbers.length > 0 && baseMessage.trim() !== '';

  // Se estiver carregando, exibe um spinner
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-red-600"></div>
      </div>
    );
  }

  // Se não houver usuário logado, exibe a tela de autenticação
  if (!user) {
    return <AuthScreen />;
  }

  // Se houver usuário logado, exibe o app normal
  return (
    <div className="min-h-screen bg-neutral flex flex-col">
      <Navigation 
        activeTab={activeTab} 
        onTabChange={handleTabChange}
        isDarkMode={isDarkMode}
        toggleTheme={toggleTheme}
      />
      <main className="flex-1 bg-gray-50 dark:bg-gray-800 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {activeTab === 'home' && (
            <>
              <header className="mb-10 text-center flex flex-col items-center">
                <img src="/logo.svg" alt="Prospect Logo" className="h-16 w-auto mb-4 drop-shadow-md"/>
                <h1 className="text-4xl font-bold sm:text-5xl">
                  <span className="text-red-600 dark:text-red-500">Prospect</span>
                  <span className="font-light text-gray-700 dark:text-gray-300 ml-2">HUB</span>
                </h1>
                <p className="mt-3 text-xl text-gray-500 dark:text-gray-400 sm:mt-4">
                  Otimize suas prospecções e conecte-se com clientes potenciais
                </p>
              </header>
            
              <div className="space-y-8">
                <section className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-6 shadow-sm">
                  <h2 className="text-2xl font-semibold text-basetone dark:text-white mb-4 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-red-600 dark:text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    PROSPECÇÃO DE CONTATOS
                  </h2>
              
                  <div className="grid gap-6 md:grid-cols-2">
                    {/* Seção Manual */}
                    <div className="bg-white shadow-sm rounded-lg p-4 border-l-4 border-red-600">
                      <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center">
                        <span className="inline-flex items-center justify-center w-6 h-6 bg-red-600 dark:bg-red-500 text-white rounded-full mr-2 text-sm font-bold">A</span>
                        Manual
                      </h3>
                      <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg transition-all duration-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                        <PhoneNumberInput onAddPhoneNumber={handleAddPhoneNumber} />
                      </div>
                    </div>
                
                    {/* Seção Importar */}
                    <div className="bg-white shadow-sm rounded-lg p-4 border-l-4 border-red-600">
                      <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center">
                        <span className="inline-flex items-center justify-center w-6 h-6 bg-red-600 dark:bg-red-500 text-white rounded-full mr-2 text-sm font-bold">B</span>
                        Importar <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">(Excel/CSV/TXT)</span>
                      </h3>
                  
                      <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg mb-3 transition-all duration-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                        <div className="flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-red-600 dark:text-red-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Formatos aceitos:</p>
                        </div>
                        <ul className="text-xs text-gray-500 dark:text-gray-400 list-disc pl-5 mt-1 space-y-0.5">
                          <li>Excel/CSV: CNPJs (col A), telefones (col T)</li>
                          <li>TXT: Um número por linha</li>
                        </ul>
                      </div>
                  
                      <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-4 transition-all duration-300 hover:shadow-md dark:hover:shadow-gray-900/20 flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors duration-300">
                        <input
                          type="file"
                          onChange={handleFileUpload}
                          className="hidden"
                          id="file-upload"
                          accept=".xlsx,.xls,.csv,.txt"
                        />
                        <label
                          htmlFor="file-upload"
                          className="cursor-pointer bg-red-600 dark:bg-red-500 hover:bg-red-700 dark:hover:bg-red-600 text-white font-medium py-2 px-4 rounded inline-flex items-center transition-colors duration-300"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                          </svg>
                          Selecionar Arquivo
                        </label>
                        <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">Clique ou arraste um arquivo</p>
                        {fileSuccess && <p className="mt-2 text-sm text-green-600 dark:text-green-500 text-center" role="status">{fileSuccess}</p>}
                        {isProcessingFile && (
                          <div className="mt-2 flex items-center text-sm text-gray-600 dark:text-gray-400">
                            <LoadingIcon className="animate-spin h-4 w-4 mr-2 text-primary" />
                            Processando arquivo...
                          </div>
                        )}
                        {fileError && <p className="mt-2 text-sm text-red-600 dark:text-red-500 text-center" role="alert">{fileError}</p>}
                      </div>
                    </div>
                  </div>

                  {phoneNumbers.length > 0 && (
                    <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Números Adicionados ({phoneNumbers.length}):</h3>
                      <ul className="mt-2 flex flex-wrap gap-2" aria-live="polite">
                        {phoneNumbers.map(num => (
                          <li key={num} className="flex items-center bg-gray-100 dark:bg-gray-800 text-basetone dark:text-white text-sm font-medium pl-3 pr-1.5 py-1 rounded-full border border-gray-300 dark:border-gray-600">
                            {num}
                            <button
                              onClick={() => handleRemovePhoneNumber(num)}
                              className="ml-2 text-red-500 dark:text-red-600 hover:text-red-700 dark:hover:text-red-500 focus:outline-none focus:ring-1 focus:ring-red-500 dark:focus:ring-red-600 rounded-full p-0.5"
                              aria-label={`Remover ${num}`}
                            >
                              <span className="text-xs font-bold">&times;</span>
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </section>

                <section className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-6 shadow-sm">
                  <h2 className="text-2xl font-semibold text-basetone dark:text-white mb-4 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-red-600 dark:text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    ENVIO DE MENSAGENS
                  </h2>
                  <MessageComposer baseMessage={baseMessage} setBaseMessage={setBaseMessage} />
                  {phoneNumbers.length > 0 && !baseMessage.trim() && (
                    <p className="mt-2 text-sm text-yellow-700 dark:text-yellow-500">
                      Adicione uma mensagem base para prosseguir para o envio.
                    </p>
                  )}
                </section>
            
                {showSendSection && (
                  <section className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-6 shadow-sm transition-all duration-300 hover:shadow-lg dark:hover:shadow-gray-800/30">
                    <h2 className="text-2xl font-semibold text-basetone dark:text-white mb-6">4. Enviar Mensagens</h2>
                    <MessageList 
                      phoneNumbers={phoneNumbers} 
                      baseMessage={baseMessage} 
                      rdStationEnabled={rdStationEnabled}
                      onMessageSent={handleMessageSent}
                    />
                  </section>
                )}
              {!showSendSection && phoneNumbers.length > 0 && baseMessage.trim() === '' && (
                <p className="text-center text-gray-500">
                  Complete a mensagem base na seção 2 para ver as opções de envio.
                </p>
              )}
              </div>
            </>
          )}
            
          {activeTab === 'crm' && (
            <div className="space-y-8">
              <header className="mb-6 text-center">
                <h1 className="text-3xl font-bold">
                  <span className="text-red-600">Integração</span>
                  <span className="font-light text-gray-700 ml-2">CRM</span>
                </h1>
                <p className="mt-2 text-gray-600">
                  Configure a integração com o RD Station CRM para gerenciar seus contatos prospectados.
                </p>
              </header>
              
              <section className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-6 shadow-sm transition-all duration-300 hover:shadow-lg dark:hover:shadow-gray-800/30">
                <h2 className="text-2xl font-semibold text-basetone mb-4 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  CONFIGURAÇÃO DO RD STATION
                </h2>
                <RDStationIntegration 
                  isEnabled={rdStationEnabled} 
                  onToggle={handleRdStationToggle} 
                  onConfigureToken={handleConfigureRdStationToken} 
                />
              </section>
            </div>
          )}
            
          {activeTab === 'history' && (
            <div className="space-y-8">
              <header className="mb-6 text-center">
                <h1 className="text-3xl font-bold">
                  <span className="text-red-600">Histórico</span>
                  <span className="font-light text-gray-700 dark:text-gray-300 ml-2">de Mensagens</span>
                </h1>
                <p className="mt-2 text-gray-600 dark:text-gray-400">
                  Acompanhe todas as mensagens enviadas via WhatsApp e contatos enviados para o RD Station.
                </p>
              </header>
              
              <section className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-6 shadow-sm transition-all duration-300 hover:shadow-lg dark:hover:shadow-gray-800/30">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-semibold text-basetone dark:text-white flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-red-600 dark:text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    REGISTRO DE MENSAGENS
                  </h2>
                </div>
                
                <MessageHistory 
                  onClearHistory={handleClearHistory} 
                />
              </section>
            </div>
          )}
          
          {activeTab === 'transfer' && (
            <div className="space-y-8">
              <header className="mb-6 text-center">
                <h1 className="text-3xl font-bold">
                  <span className="text-red-600">Transferência</span>
                  <span className="font-light text-gray-700 dark:text-gray-300 ml-2">de Arquivos</span>
                </h1>
                <p className="mt-2 text-gray-600 dark:text-gray-400">
                  Compartilhe arquivos e anotações entre seus dispositivos de forma rápida e segura.
                </p>
              </header>
              
              <section className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-6 shadow-sm transition-all duration-300 hover:shadow-lg dark:hover:shadow-gray-800/30">
                <FileTransfer />
              </section>
            </div>
          )}
            
            {/* Mensagem removida conforme solicitado */}

        </div>
      </main>
      <Footer />
    </div>
  );
};

// Componente para gerenciar rotas
const AppRouter: React.FC = () => {
  // Obter a rota atual da URL
  const path = window.location.pathname;
  
  // Renderizar componente com base na rota
  switch (path) {
    case '/reset-password':
      return <ResetPasswordPage />;
    default:
      return <AppContent />;
  }
};

// Componente wrapper que fornece o contexto de autenticação
const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppRouter />
    </AuthProvider>
  );
};

export default App;
