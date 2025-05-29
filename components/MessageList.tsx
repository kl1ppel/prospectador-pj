import React, { useState, useEffect } from 'react';
import { WhatsAppIcon } from './icons';
import { ContactForm } from './ContactForm';
import { sendContactToRDStation } from '../utils/rdStationAPI';

import { MessageHistoryItem } from './MessageHistory';

interface MessageListProps {
  phoneNumbers: string[];
  baseMessage: string;
  rdStationEnabled?: boolean;
  onMessageSent?: (historyItem: MessageHistoryItem) => void;
}

const MessageCard: React.FC<{ 
  phoneNumber: string; 
  baseMessage: string; 
  rdStationEnabled?: boolean;
  onMessageSent?: (historyItem: MessageHistoryItem) => void;
}> = ({ 
  phoneNumber, 
  baseMessage, 
  rdStationEnabled,
  onMessageSent 
}) => {
  const [showContactForm, setShowContactForm] = useState<boolean>(false);
  const [sendingToRD, setSendingToRD] = useState<boolean>(false);
  const [rdSuccess, setRdSuccess] = useState<boolean>(false);
  const [rdError, setRdError] = useState<string | null>(null);

  const handleSendViaWhatsApp = () => {
    if (!baseMessage.trim()) {
      alert("A mensagem base está vazia. Por favor, componha uma mensagem na seção 2.");
      return;
    }

    let finalNumberForLink = phoneNumber.replace(/\D/g, ''); // Remove all non-digits

    if (phoneNumber.startsWith('+') && !finalNumberForLink.startsWith('+')) {
        finalNumberForLink = `+${finalNumberForLink}`;
    }

    const whatsappUrl = `https://wa.me/${finalNumberForLink}?text=${encodeURIComponent(baseMessage)}`;
    window.open(whatsappUrl, '_blank');
    
    // Registrar no histórico
    if (onMessageSent) {
      onMessageSent({
        id: `whatsapp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        phoneNumber,
        message: baseMessage,
        sentAt: new Date().toISOString(),
        type: 'whatsapp',
        status: 'sent',
        userId: 'current-user'
      });
    }
  };
  
  const handleSendToRDStation = () => {
    setShowContactForm(true);
  };
  
  const handleContactFormSubmit = async (contactData: any) => {
    setSendingToRD(true);
    setRdError(null);
    
    try {
      await sendContactToRDStation(contactData);
      setRdSuccess(true);
      setShowContactForm(false);
      setTimeout(() => setRdSuccess(false), 5000); // Reset success message after 5 seconds
      
      // Registrar no histórico
      if (onMessageSent) {
        onMessageSent({
          id: `rdstation-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          phoneNumber,
          message: contactData.notes || 'Contato enviado para RD Station',
          sentAt: new Date().toISOString(),
          type: 'rdstation',
          status: 'sent',
          contactName: contactData.name || '',
          contactEmail: contactData.email || '',
          userId: 'current-user'
        });
      }
    } catch (error) {
      setRdError(error instanceof Error ? error.message : 'Erro ao enviar para RD Station');
    } finally {
      setSendingToRD(false);
    }
  };
  
  const handleContactFormCancel = () => {
    setShowContactForm(false);
  };

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 p-4 rounded-xl shadow-md dark:shadow-gray-900/20 flex flex-col justify-between gap-3 transition-all duration-300 hover:shadow-lg dark:hover:shadow-gray-900/30 hover:border-gray-400 dark:hover:border-gray-600">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-3 w-full">
        <p className="text-md font-semibold text-gray-900 dark:text-white break-all flex-grow">{phoneNumber}</p>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <button
            onClick={handleSendViaWhatsApp}
            disabled={!baseMessage.trim()}
            className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-whatsapp hover:opacity-90 transition-opacity focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            aria-label={`Enviar mensagem para ${phoneNumber} via WhatsApp`}
          >
            <WhatsAppIcon className="w-5 h-5 mr-2" /> WhatsApp
          </button>
          
          {rdStationEnabled && (
            <button
              onClick={handleSendToRDStation}
              className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500"
              aria-label={`Enviar contato para RD Station CRM`}
            >
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 3a7 7 0 100 14 7 7 0 000-14zm-9 7a9 9 0 1118 0 9 9 0 01-18 0zm10.293-4.707a1 1 0 011.414 0l2 2a1 1 0 010 1.414l-2 2a1 1 0 01-1.414-1.414L12.586 10l-1.293-1.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
              RD Station
            </button>
          )}
        </div>
      </div>
      
      {rdSuccess && (
        <div className="mt-2 text-sm text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 p-2 rounded-lg">
          ✓ Contato enviado com sucesso para o RD Station CRM
        </div>
      )}
      
      {rdError && (
        <div className="mt-2 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-2 rounded-lg">
          ✗ {rdError}
        </div>
      )}
      
      {showContactForm && (
        <ContactForm 
          phoneNumber={phoneNumber} 
          onSubmit={handleContactFormSubmit} 
          onCancel={handleContactFormCancel} 
        />
      )}
    </div>
  );
};

export const MessageList: React.FC<MessageListProps> = ({ phoneNumbers, baseMessage, rdStationEnabled, onMessageSent }) => {
  const [isSendingAll, setIsSendingAll] = useState<boolean>(false);
  const [processedCount, setProcessedCount] = useState<number>(0);
  const [totalToProcess, setTotalToProcess] = useState<number>(0);
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [showMobileLinks, setShowMobileLinks] = useState<boolean>(false);
  
  // Detectar se é dispositivo móvel
  useEffect(() => {
    const checkMobile = () => {
      const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
      const mobileRegex = /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i;
      const isTablet = /tablet|ipad|playbook|silk|android(?!.*mobile)/i.test(userAgent);
      
      return mobileRegex.test(userAgent) || isTablet;
    };
    
    setIsMobile(checkMobile());
  }, []);
  
  // Reset contador quando mudam os números de telefone
  useEffect(() => {
    setProcessedCount(0);
    setTotalToProcess(0);
    setIsSendingAll(false);
    setShowMobileLinks(false);
  }, [phoneNumbers]);
  
  const createAllWhatsAppLinks = () => {
    return phoneNumbers.map(number => {
      let finalNumberForLink = number.replace(/\D/g, '');
      if (number.startsWith('+') && !finalNumberForLink.startsWith('+')) {
        finalNumberForLink = `+${finalNumberForLink}`;
      }
      return `https://wa.me/${finalNumberForLink}?text=${encodeURIComponent(baseMessage)}`;
    });
  };
  
  const handleSendAllMessages = async () => {
    if (!baseMessage.trim()) {
      alert("A mensagem base está vazia. Por favor, componha uma mensagem na seção 2.");
      return;
    }
    
    // Criar todos os links primeiro
    const allLinks = createAllWhatsAppLinks();
    
    // Abordagem diferente para dispositivos móveis
    if (isMobile) {
      setShowMobileLinks(true);
      setTotalToProcess(phoneNumbers.length);
      return;
    }
    
    // Avisar o usuário sobre o bloqueio de pop-ups (apenas para desktop)
    const confirmMessage = `ATENÇÃO: Serão abertos ${phoneNumbers.length} links do WhatsApp.

Seu navegador pode bloquear pop-ups, então você precisará permitir os pop-ups quando solicitado.

Deseja continuar?`;
    
    if (!confirm(confirmMessage)) {
      return;
    }
    
    setIsSendingAll(true);
    setTotalToProcess(phoneNumbers.length);
    setProcessedCount(0);
    
    // Para cada número, abre uma nova aba com a mensagem do WhatsApp
    for (let i = 0; i < allLinks.length; i++) {
      const link = allLinks[i];
      const number = phoneNumbers[i];
      
      // Usar o setTimeout para dar tempo ao navegador de processar cada abertura
      setTimeout(() => {
        // Abrir o link em uma nova aba
        const newWindow = window.open(link, '_blank');
        
        // Se o navegador bloqueou o pop-up, alerta o usuário
        if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
          alert(`Pop-up bloqueado para o número ${number}. Por favor, permita pop-ups para este site e tente novamente.`);
          setIsSendingAll(false);
          return;
        }
        
        // Registrar no histórico
        if (onMessageSent) {
          onMessageSent({
            id: `whatsapp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            phoneNumber: number,
            message: baseMessage,
            sentAt: new Date().toISOString(),
            type: 'whatsapp',
            status: 'sent',
            userId: 'current-user'
          });
        }
        
        setProcessedCount(prev => prev + 1);
      }, i * 1000); // Intervalo de 1 segundo entre cada abertura
    }
    
    // Definir um timeout para resetar o estado após o envio de todas as mensagens
    setTimeout(() => {
      setIsSendingAll(false);
    }, (phoneNumbers.length * 1000) + 2000); // Tempo total + 2 segundos extras
  };
  
  // Função para lidar com cliques em links móveis individuais
  const handleMobileLinkClick = (number: string, link: string) => {
    // Registrar no histórico
    if (onMessageSent) {
      onMessageSent({
        id: `whatsapp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        phoneNumber: number,
        message: baseMessage,
        sentAt: new Date().toISOString(),
        type: 'whatsapp',
        status: 'sent',
        userId: 'current-user'
      });
    }
    
    // Marcar como processado
    setProcessedCount(prev => prev + 1);
    
    // Abrir o WhatsApp
    window.location.href = link;
  };
  
  if (phoneNumbers.length === 0) {
    return <p className="text-center text-gray-500 dark:text-gray-400">Adicione números e uma mensagem base para enviar.</p>;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row justify-between items-center bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 shadow-sm transition-all duration-300 hover:shadow-md dark:hover:shadow-gray-800/30 mb-6">
        <div className="mb-4 md:mb-0">
          <h3 className="font-medium text-gray-900 dark:text-white">Envio em Massa</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {isMobile 
              ? "Abra o WhatsApp para cada contato com um clique" 
              : `Envie a mesma mensagem para todos os ${phoneNumbers.length} contatos de uma vez`}
          </p>
        </div>
        <button
          onClick={handleSendAllMessages}
          disabled={isSendingAll || !baseMessage.trim()}
          className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white font-medium rounded-lg shadow-sm hover:from-green-700 hover:to-green-800 focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSendingAll ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Enviando {processedCount}/{totalToProcess}
            </>
          ) : (
            <>
              <WhatsAppIcon className="w-5 h-5" /> 
              {isMobile ? "Preparar mensagens" : "Enviar para todos os contatos"}
            </>
          )}
        </button>
      </div>
      
      {/* Mostrar lista de links para dispositivos móveis */}
      {showMobileLinks && isMobile && (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 shadow-sm mb-6">
          <h3 className="font-medium text-gray-900 dark:text-white mb-3">Clique em cada contato para enviar</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            Clique em cada botão para abrir o WhatsApp com a mensagem preparada. Após enviar, volte aqui para continuar com o próximo contato.
          </p>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {phoneNumbers.map((number, index) => {
              const link = createAllWhatsAppLinks()[index];
              const isProcessed = index < processedCount;
              
              return (
                <div 
                  key={number} 
                  className={`flex items-center justify-between p-3 rounded-lg ${isProcessed 
                    ? 'bg-gray-100 dark:bg-gray-700' 
                    : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700'}`}
                >
                  <span className={`mr-3 ${isProcessed ? 'line-through text-gray-500 dark:text-gray-400' : 'text-gray-900 dark:text-white'}`}>
                    {number}
                  </span>
                  {isProcessed ? (
                    <span className="text-green-600 dark:text-green-400 text-sm flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Enviado
                    </span>
                  ) : (
                    <button
                      onClick={() => handleMobileLinkClick(number, link)}
                      className="bg-green-600 text-white py-1 px-3 rounded-md text-sm flex items-center"
                    >
                      <WhatsAppIcon className="w-4 h-4 mr-1" />
                      Enviar
                    </button>
                  )}
                </div>
              );
            })}
          </div>
          <div className="mt-4 text-sm text-gray-500 dark:text-gray-400 flex justify-between items-center">
            <span>{processedCount} de {phoneNumbers.length} enviados</span>
            {processedCount === phoneNumbers.length && (
              <button 
                onClick={() => setShowMobileLinks(false)}
                className="text-red-600 dark:text-red-400"
              >
                Fechar
              </button>
            )}
          </div>
        </div>
      )}
      
      {phoneNumbers.map((number) => (
        <MessageCard 
          key={number} 
          phoneNumber={number} 
          baseMessage={baseMessage} 
          rdStationEnabled={rdStationEnabled}
          onMessageSent={onMessageSent} 
        />
      ))}
    </div>
  );
};
