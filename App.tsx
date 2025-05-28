import React, { useState, ChangeEvent } from 'react';
import readXlsxFile from 'read-excel-file';
import { PhoneNumberInput } from './components/PhoneNumberInput';
import { MessageComposer } from './components/MessageComposer';
import { MessageList } from './components/MessageList';
import { LoadingIcon } from './components/icons';

import { useEffect } from 'react';
import './index.css'; // ou o caminho correto para o seu arquivo CSS
const App: React.FC = () => {
  const [phoneNumbers, setPhoneNumbers] = useState<string[]>([]);
  const [baseMessage, setBaseMessage] = useState<string>('');
  const [isProcessingFile, setIsProcessingFile] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null); 
  const [fileError, setFileError] = useState<string | null>(null);
  const [fileSuccess, setFileSuccess] = useState<string | null>(null);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      return savedTheme === 'dark';
    }
    return false;
  });

  useEffect(() => {
    const theme = isDarkMode ? 'dark' : 'light';
    document.documentElement.classList.toggle('dark', isDarkMode);
    localStorage.setItem('theme', theme);
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode(prev => !prev);
  };

  const formatPhoneNumberForStorage = (numberStr: string): string => {
    let phoneOnly = numberStr.split(',')[0].trim();
    let cleaned = phoneOnly.replace(/\D/g, '');
    if (cleaned.length === 10 || cleaned.length === 11) {
      cleaned = '+55' + cleaned;
    } else if (!cleaned.startsWith('+') && cleaned.length > 0) {
      cleaned = '+' + cleaned;
    }
    return cleaned;
  };

  const handleAddPhoneNumber = (number: string) => {
    const formattedNumber = formatPhoneNumberForStorage(number);
    if (formattedNumber && formattedNumber.length > 3 && !phoneNumbers.includes(formattedNumber)) {
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
    if (!file) return;

    setIsProcessingFile(true);
    setFileError(null);
    setFileSuccess(null);
    setError(null);

    const CNPJ_COLUMN_INDEX = 0;
    const PHONE_COLUMN_INDEX = 19;

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
                const firstPhone = phone.split(',')[0].trim();
                if (firstPhone) {
                  importedPhonesForProcessing.push(firstPhone);
                  processedCnpjs.add(cnpj);
                }
              }
            }
          }
        });
        
        if (rawPairsExtractedCount === 0 && importedPhonesForProcessing.length === 0) {
          throw new Error("Nenhum par CNPJ/Telefone foi encontrado nas colunas A e T do arquivo Excel.");
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
                const firstPhone = phone.split(',')[0].trim();
                if (firstPhone) {
                  importedPhonesForProcessing.push(firstPhone);
                  processedCnpjs.add(cnpj);
                }
              }
            }
          }
        });
        
        if (rawPairsExtractedCount === 0 && importedPhonesForProcessing.length === 0) {
          throw new Error("Nenhum par CNPJ/Telefone foi encontrado nas colunas A e T do arquivo CSV.");
        }
        
      } else if (file.name.endsWith('.txt')) {
        const text = await file.text();
        const lines = text.split(/\r\n|\n/);
        lines.forEach(line => {
          const phone = line.trim();
          if (phone) { 
            const firstPhone = phone.split(',')[0].trim();
            if (firstPhone) {
              importedPhonesForProcessing.push(firstPhone);
            }
          }
        });
        
        if (importedPhonesForProcessing.length === 0) {
          throw new Error("Nenhum número de telefone encontrado no arquivo TXT.");
        }
      } else {
        throw new Error("Formato de arquivo não suportado. Use .xlsx, .xls, .csv ou .txt.");
      }
      
      const validPhoneNumbers = importedPhonesForProcessing
        .map(phone => formatPhoneNumberForStorage(phone)) 
        .filter(num => num && num.length > 8);

      const uniqueNewNumbers = validPhoneNumbers.filter(num => !phoneNumbers.includes(num));

      if (uniqueNewNumbers.length > 0) {
        setPhoneNumbers(prev => [...new Set([...prev, ...uniqueNewNumbers])]); 
        setFileSuccess(`${uniqueNewNumbers.length} novo(s) número(s) importado(s) com sucesso.`);
      } else if (validPhoneNumbers.length > 0) {
        setFileSuccess("Nenhum número novo para adicionar.");
      } else {
        throw new Error("Nenhum número válido encontrado no arquivo.");
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

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <main className="flex-grow">
        <div className="container mx-auto px-4 py-8 max-w-4xl flex-grow">
          <div className="flex justify-end mb-4">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="Toggle dark mode"
            >
              {isDarkMode ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707" />
                </svg>
              )}
            </button>
          </div>
          <header className="mb-10 text-center flex flex-col items-center">
              <img src="https://logodix.com/logo/544373.png" alt="App Logo" className="h-20 w-20 mb-4"/>
              <h1 className="text-4xl font-bold text-basetone sm:text-5xl section-header">PROSPECTADOR PJ</h1>
              <p className="mt-3 text-lg text-gray-600">Automatiza o processo de prospecção de empresas utilizando planilhas, e disparando para o whatsapp.</p>
            </header>

          <div className="space-y-8">
            <section className="card border border-gray-200 rounded-lg p-6">
              <h2 className="text-2xl font-semibold text-basetone mb-4 section-header">ADICIONAR NÚMEROS</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium text-gray-700 mb-2">1 = Manual</h3>
                  <PhoneNumberInput onAddPhoneNumber={handleAddPhoneNumber} />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-700 mb-2">2 = Importar</h3>
                  <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-medium text-gray-700">(txt, clsx, csv)</label>
                      <input
                        type="file"
                        accept=".csv,.xlsx,.xls,.txt"
                        onChange={handleFileUpload}
                        className="block w-full text-sm text-gray-500
                                  file:mr-4 file:py-2 file:px-4
                                  file:rounded-full file:border-0
                                  file:text-sm file:font-semibold
                                  file:bg-primary file:text-white
                                  hover:file:bg-primary/90
                                  file:text-[Procurar]"
                      />
                    </div>
                    {error && <p className="text-red-500 text-sm">{error}</p>}
                    {fileError && <p className="text-red-500 text-sm">{fileError}</p>}
                    {fileSuccess && <p className="text-green-500 text-sm">{fileSuccess}</p>}
                  </div>
                </div>

                {phoneNumbers.length > 0 && (
                  <div className="mt-6 pt-4 border-t border-gray-200">
                    <h3 className="text-sm font-medium text-gray-500">Números Adicionados ({phoneNumbers.length}):</h3>
                    <ul className="mt-2 flex flex-wrap gap-2">
                      {phoneNumbers.map(num => (
                        <li key={num} className="flex items-center bg-gray-100 text-basetone text-sm font-medium pl-3 pr-1.5 py-1 rounded-full border border-gray-300">
                          {num}
                          <button onClick={() => handleRemovePhoneNumber(num)} className="ml-2 text-red-500 hover:text-red-700 focus:outline-none focus:ring-1 focus:ring-red-500 rounded-full p-0.5">
                            <span className="text-xs font-bold">&times;</span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </section>

            <section className="card border border-gray-200 rounded-lg p-6">
              <h2 className="text-2xl font-semibold text-basetone mb-4 section-header">MENSAGEM PADRAO</h2>
              <MessageComposer baseMessage={baseMessage} setBaseMessage={setBaseMessage} />
              {phoneNumbers.length > 0 && !baseMessage.trim() && (
                <p className="mt-2 text-sm text-yellow-700">Adicione uma mensagem base para prosseguir para o envio.</p>
              )}
            </section>
            
            {showSendSection && (
              <section className="bg-white border border-gray-200 rounded-lg p-6">
                <h2 className="text-2xl font-semibold text-basetone mb-6">3. Enviar Mensagens via WhatsApp</h2>
                <MessageList phoneNumbers={phoneNumbers} baseMessage={baseMessage} />
              </section>
            )}
            
            {!showSendSection && phoneNumbers.length > 0 && baseMessage.trim() === '' && (
              <p className="text-center text-gray-500">Complete a mensagem base na seção 2 para ver as opções de envio.</p>
            )}
            
            {!showSendSection && phoneNumbers.length === 0 && (
              <p className="text-center text-gray-500">Adicione números na seção 1 e componha uma mensagem base na seção 2 para enviar.</p>
            )}
          </div>
        </div>
      </main>
      
      <footer className="bg-neutral text-center">
          <div className="w-full max-w-4xl mx-auto h-32 overflow-hidden rounded-lg shadow-md mb-4">
            <img src="https://scontent.fpoa48-1.fna.fbcdn.net/v/t39.30808-6/268058506_10158189729895588_5061131285468110337_n.png?_nc_cat=109&ccb=1-7&_nc_sid=cc71e4&_nc_ohc=p9CpuMFA8l4Q7kNvwHj4jG4&_nc_oc=AdnyVq1UocyqbV5BzbFSsE0lQ2rrg3KhKBuAE_vnCenP_6aK2W5wxE-rXteTEX8_QFY&_nc_zt=23&_nc_ht=scontent.fpoa48-1.fna&_nc_gid=OIy0wfHdxNBJms0hCy1jnw&oh=00_AfIsHMHYyXBRoFK5Ljgbzih9obCndtZcWcMknoqZxzsCfQ&oe=683C373F" alt="Banner de Rodapé" className="w-full h-full object-cover object-center" />
        </div>
        <div className="max-w-3xl mx-auto pt-8 pb-4 px-4 sm:px-6 lg:px-8">
          <p className="text-sm text-gray-500">Made by Gabriel Klippel</p>
          <p className="text-sm text-gray-500 mt-2">T827505</p>
        </div>
      </footer>

    </div>
  );
};

export default App;
