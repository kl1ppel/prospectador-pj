import React, { useState, ChangeEvent } from 'react';
import readXlsxFile from 'read-excel-file';
import { PhoneNumberInput } from './components/PhoneNumberInput';
import { MessageComposer } from './components/MessageComposer';
import { MessageList } from './components/MessageList';
import { LoadingIcon } from './components/icons';
import { Footer } from './components/Footer';

const App: React.FC = () => {
  const [phoneNumbers, setPhoneNumbers] = useState<string[]>([]);
  const [baseMessage, setBaseMessage] = useState<string>('');
  const [isProcessingFile, setIsProcessingFile] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null); 
  const [fileError, setFileError] = useState<string | null>(null);
  const [fileSuccess, setFileSuccess] = useState<string | null>(null);

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
    <div className="min-h-screen bg-background">
      <main className="flex-grow">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <header className="mb-10 text-center flex flex-col items-center">
            <img src="https://logodix.com/logo/544373.png" alt="App Logo" className="h-20 w-20 mb-4"/>
            <h1 className="text-4xl font-bold text-basetone sm:text-5xl">PROSPECTADOR PJ</h1>
            <p className="mt-3 text-lg text-gray-600">Automatiza o processo de prospecção de empresas utilizando planilhas, e disparando para o whatsapp.</p>
          </header>

          <div className="space-y-8">
            <section className="bg-white border border-gray-200 rounded-lg p-6">
              <h2 className="text-2xl font-semibold text-basetone mb-4">1. Adicionar Números</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium text-gray-700 mb-2">A. Adicionar Manualmente</h3>
                  <PhoneNumberInput onAddPhoneNumber={handleAddPhoneNumber} />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-700 mb-2">B. Importar da Planilha</h3>
                  <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-medium text-gray-700">Selecione o arquivo Excel</label>
                      <input
                        type="file"
                        accept=".xlsx,.xls,.csv"
                        onChange={handleFileUpload}
                        className="block w-full text-sm text-gray-500
                                  file:mr-4 file:py-2 file:px-4
                                  file:rounded-full file:border-0
                                  file:text-sm file:font-semibold
                                  file:bg-primary file:text-white
                                  hover:file:bg-primary/90"
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

            <section className="bg-white border border-gray-200 rounded-lg p-6">
              <h2 className="text-2xl font-semibold text-basetone mb-4">2. Compor Mensagem Base</h2>
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
        <div className="max-w-3xl mx-auto pt-8 pb-4 px-4 sm:px-6 lg:px-8">
          <p className="text-sm text-gray-500">Made by Gabriel Klippel</p>
        </div>
        <div className="w-full max-w-3xl mx-auto h-20 overflow-hidden rounded-lg shadow-md mb-4">
          <img src="https://via.placeholder.com/800x160/333333/FFFFFF?text=PLAN+ADAPT+OVERCOME" alt="Banner de Rodapé" className="w-full h-full object-cover object-center" />
        </div>
      </footer>
      <Footer />
    </div>
  );
};

export default App;
