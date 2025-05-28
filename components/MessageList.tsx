
import React from 'react';
import { WhatsAppIcon } from './icons'; 

interface MessageListProps {
  phoneNumbers: string[];
  baseMessage: string;
}

const MessageCard: React.FC<{ phoneNumber: string; baseMessage: string }> = ({ phoneNumber, baseMessage }) => {

  const handleSendViaWhatsApp = () => {
    if (!baseMessage.trim()) {
      alert("A mensagem base está vazia. Por favor, componha uma mensagem na seção 2.");
      return;
    }

    // phoneNumber prop is already formatted by App.tsx (e.g. +5511..., or 12345 if not auto-prefixed)
    let finalNumberForLink = phoneNumber.replace(/\D/g, ''); // Remove all non-digits

    // If the original formatted number from App.tsx started with '+', ensure the link number also does.
    // This handles cases where App.tsx stored "+5511..." and replace(/\D/g, '') made it "5511...".
    if (phoneNumber.startsWith('+') && !finalNumberForLink.startsWith('+')) {
        finalNumberForLink = `+${finalNumberForLink}`;
    }
    // If phoneNumber from App.tsx did not start with '+', finalNumberForLink will be digits only.
    // e.g. if App.tsx stored "12345", finalNumberForLink is "12345". wa.me/12345
    // e.g. if App.tsx stored "+55119...", phoneNumber is "+55119...", finalNumberForLink becomes "+55119..."

    const whatsappUrl = `https://wa.me/${finalNumberForLink}?text=${encodeURIComponent(baseMessage)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="bg-white border border-gray-200 p-4 rounded-lg flex flex-col sm:flex-row justify-between items-center gap-3">
      <p className="text-md font-semibold text-basetone break-all flex-grow">{phoneNumber}</p>
      <button
        onClick={handleSendViaWhatsApp}
        disabled={!baseMessage.trim()}
        className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-whatsapp hover:opacity-90 transition-opacity focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        aria-label={`Enviar mensagem para ${phoneNumber} via WhatsApp`}
      >
        <WhatsAppIcon className="h-5 w-5 mr-2" /> Enviar via WhatsApp
      </button>
    </div>
  );
};


export const MessageList: React.FC<MessageListProps> = ({ phoneNumbers, baseMessage }) => {
  if (phoneNumbers.length === 0) {
    return <p className="text-center text-gray-500">Adicione números e uma mensagem base para enviar.</p>;
  }

  return (
    <div className="space-y-4">
      {phoneNumbers.map((number) => (
        <MessageCard key={number} phoneNumber={number} baseMessage={baseMessage} />
      ))}
    </div>
  );
};
