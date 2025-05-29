import React from 'react';

interface MessageComposerProps {
  baseMessage: string;
  setBaseMessage: (message: string) => void;
}

export const MessageComposer: React.FC<MessageComposerProps> = ({ baseMessage, setBaseMessage }) => {
  return (
    <div className="space-y-2">
      <textarea
        value={baseMessage}
        onChange={(e) => setBaseMessage(e.target.value)}
        placeholder="Digite sua mensagem base aqui..."
        rows={5}
        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm resize-y placeholder:text-gray-400 text-black"
        aria-label="Editor da mensagem base"
      />
    </div>
  );
};